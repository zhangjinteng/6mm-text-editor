import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

for (const dimensions of [{ width: 280, height: 100 }, { width: 120, height: 250 }]) {
  test(`铺满 body 保留当前比例 ${dimensions.width}:${dimensions.height}，重复应用稳定且可撤销保存`, async ({ page }) => {
    await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await page.evaluate(({width,height}) => {
      const e=window.tinymce.activeEditor;
      e.setContent(`<p>其他文字</p><div style="position:relative;width:300px;height:260px;margin:30px"><span><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='teal'/%3E%3C/svg%3E" style="position:absolute;left:20px;top:40px;width:${width}px;height:${height}px" /></span></div>`);
      e.selection.select(e.getBody().querySelector('img')!);
    }, dimensions);
    const image=page.frameLocator('.tox-edit-area iframe').locator('img');
    const check = async () => {
      const result = await image.evaluate(img => {
        const b=img.ownerDocument.body.getBoundingClientRect(); const r=img.getBoundingClientRect();
        return { ratio:r.width/r.height, covers:r.left<=b.left+1 && r.top<=b.top+1 && r.right>=b.right-1 && r.bottom>=b.bottom-1,
          centerX:(r.left+r.right-b.left-b.right)/2,centerY:(r.top+r.bottom-b.top-b.bottom)/2, width:r.width,height:r.height };
      });
      expect(result.ratio).toBeCloseTo(dimensions.width/dimensions.height,2);
      expect(result.covers).toBe(true);
      expect(Math.abs(result.centerX)).toBeLessThan(1); expect(Math.abs(result.centerY)).toBeLessThan(1);
      return result;
    };
    await page.evaluate(async () => {
      const e=window.tinymce.activeEditor;
      await e.uploadImages();
      e.undoManager.clear(); e.undoManager.add();
    });
    await image.click();
    await page.locator('.tox-pop [data-mce-name="imagefill"]').click();
    const first=await check();
    await page.evaluate(() => window.tinymce.activeEditor.execCommand('mceImageFill'));
    const second=await check();
    expect(second.width).toBeCloseTo(first.width,0); expect(second.height).toBeCloseTo(first.height,0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    await expect(image).toHaveCSS('width',`${dimensions.width}px`);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    await check();
    await page.getByRole('button',{name:'保存文档',exact:true}).click();
    await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await check();
  });
}
