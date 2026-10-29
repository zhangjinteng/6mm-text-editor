import { textTool } from './helpers/text-tools';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';

declare global { interface Window { tinymce: { activeEditor: Editor } } }
const names = ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat'];

test('浮动动画菜单支持全部效果、替换、重播、撤销、清除及保存预览导出', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    editor.setContent('<p>前面<strong><span style="color: #e03e2d;">动画文字</span></strong>后面</p>');
  });
  const selectText = async () => {
    await page.evaluate(() => {
      const editor = window.tinymce.activeEditor;
      editor.focus();
      editor.selection.select(editor.getBody().querySelector('strong')!, true);
      editor.fire('mouseup');
    });
  };
  const choose = async (name: string) => {
    await selectText();
    const toolbar = page.locator('.tox-pop .tox-toolbar');
    await expect(toolbar.locator('[data-mce-name="forecolor"]')).toBeVisible();
    await toolbar.getByRole('button', { name: '文字动画', exact: true }).click();
    await page.getByRole('button', { name, exact: true }).click();
  };
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  for (const name of names) {
    await choose(name);
    const animated = body.locator('[data-text-animation]');
    await expect(animated).toHaveCount(1);
    await expect(animated).toHaveText('动画文字');
    await expect(animated).toHaveAttribute('data-text-animation', name);
    await expect(animated).toHaveCSS('animation-name', name);
    await expect(animated).toHaveCSS('display', 'inline-block');
    await expect(body.locator('[style*="color"]').first()).toHaveCSS('color', 'rgb(224, 62, 45)');
  }
  await page.waitForTimeout(1400);
  await choose('heartBeat');
  expect(await body.locator('[data-text-animation]').evaluate(node => node.getAnimations().some(a => a.playState === 'running'))).toBe(true);
  await choose('bounce');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(body.locator('[data-text-animation]')).toHaveAttribute('data-text-animation', 'heartBeat');
  await selectText();
  await page.locator('.tox-pop .tox-toolbar').getByRole('button', { name: '文字动画', exact: true }).click();
  await page.getByRole('button', { name: '无动画', exact: true }).click();
  await expect(body.locator('[data-text-animation]')).toHaveCount(0);
  await expect(body.locator('strong')).toHaveText('动画文字');
  await choose('bounce');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(body.locator('[data-text-animation]')).toHaveAttribute('data-text-animation', 'bounce');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('[data-text-animation]')).toHaveCSS('animation-name', 'bounce');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile(await (await downloaded).path(), 'utf8');
  expect(html).toContain('@keyframes bounce');
  expect(html).toContain('data-text-animation="bounce"');
});

test('局部切换动画只修改选区，跨段落应用不破坏结构', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span data-text-animation="bounce">局部文字</span></p><p>第二段</p>');
    e.focus();
    const range = e.getDoc().createRange();
    const text = e.getBody().querySelector('span')!.firstChild!;
    range.setStart(text, 0); range.setEnd(text, 2);
    e.selection.setRng(range); e.fire('mouseup');
  });
  await page.locator('.tox-pop [data-mce-name="textanimation"]').click();
  await page.getByRole('button', { name: 'pulse', exact: true }).click();
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  await expect(body.locator('[data-text-animation="pulse"]')).toHaveText('局部');
  await expect(body.locator('[data-text-animation="bounce"]')).toHaveText('文字');
  await expect(body.locator('[data-text-animation] [data-text-animation]')).toHaveCount(0);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.selection.select(e.getBody(), true); e.fire('mouseup');
  });
  await page.locator('.tox-pop [data-mce-name="textanimation"]').click();
  await page.getByRole('button', { name: 'swing', exact: true }).click();
  await expect(body.locator('p')).toHaveCount(2);
  await expect(body.locator('[data-text-animation] [data-text-animation]')).toHaveCount(0);
  await expect(body.locator('[data-text-animation="swing"]')).toHaveCount(2);
});

test('动画图标按三列四行排列，循环时长保存并可清除', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  let anchorBox: {x:number;y:number;width:number;height:number};
  const select = async () => {
    await page.evaluate(() => {
      const e = window.tinymce.activeEditor;
      e.focus(); e.selection.select(e.getBody().querySelector('p')!, true); e.fire('mouseup');
    });
    const button = page.locator('.tox-pop [data-mce-name="textanimation"]');
    anchorBox = (await button.boundingBox())!;
    await button.click();
  };
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>循环动画</p>'));
  await select();
  const panel = page.getByRole('dialog', { name: '文字动画设置' });
  await expect.poll(async () => {
    const box = (await panel.boundingBox())!;
    const anchor = anchorBox;
    return Math.max(Math.abs(box.x + box.width / 2 - anchor.x - anchor.width / 2), Math.abs(box.y + box.height + 6 - anchor.y));
  }).toBeLessThan(2);
  const icons = panel.locator('[data-effect]');
  await expect(icons).toHaveCount(12);
  await expect(panel).toHaveCSS('width', '228px');
  await expect(panel).toHaveCSS('padding', '12px');
  await expect(icons.first()).toHaveCSS('height', '40px');
  const boxes = await icons.evaluateAll(nodes => nodes.map(n => { const r=n.getBoundingClientRect(); return { x:r.x, y:r.y }; }));
  expect(new Set(boxes.map(b => b.x)).size).toBe(3);
  expect(new Set(boxes.map(b => b.y)).size).toBe(4);
  await expect(panel.getByLabel('每轮时长（秒）', { exact: true })).toBeHidden();
  await panel.getByRole('button', { name: '播放设置', exact: true }).click();
  await panel.getByLabel('每轮时长（秒）', { exact: true }).fill('2');
  await panel.getByLabel('循环播放', { exact: true }).check();
  await panel.getByLabel('循环总时长（秒）', { exact: true }).fill('10');
  await panel.getByRole('button', { name: 'bounce', exact: true }).click();
  const animated = page.frameLocator('.tox-edit-area iframe').locator('[data-text-animation]');
  await expect(animated).toHaveCSS('animation-duration', '2s');
  await expect(animated).toHaveCSS('animation-iteration-count', '5');
  await select();
  await panel.getByRole('button', { name: '播放设置', exact: true }).click();
  await expect(panel.getByLabel('每轮时长（秒）', { exact: true })).toHaveValue('2');
  await expect(panel.getByLabel('循环播放', { exact: true })).toBeChecked();
  await panel.getByLabel('循环总时长（秒）', { exact: true }).fill('0');
  await panel.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(animated).toHaveCSS('animation-iteration-count', 'infinite');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(animated).toHaveCSS('animation-duration', '2s');
  await expect(animated).toHaveCSS('animation-iteration-count', 'infinite');
  await select();
  await panel.getByRole('button', { name: '无动画', exact: true }).click();
  await expect(animated).toHaveCount(0);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).not.toContain('animation-duration');
});

test('动画面板打开、修改播放设置及应用时下方工具栏持续可用', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e=window.tinymce.activeEditor;
    e.setContent('<p>动画工具栏保持显示</p>'); e.focus();
    e.selection.select(e.getBody().querySelector('p')!,true); e.fire('mouseup');
  });
  const toolbar=page.locator('.tox-pop .tox-toolbar');
  await toolbar.locator('[data-mce-name="textanimation"]').click();
  const panel=page.getByRole('dialog',{name:'文字动画设置'});
  await expect(panel).toBeVisible();
  // 等待 TinyMCE 异步 focusout 检查，避免只验证点击后的瞬间。
  await page.waitForTimeout(200);
  await expect(toolbar).toBeVisible();
  await panel.getByRole('button',{name:'播放设置',exact:true}).click();
  await panel.getByLabel('每轮时长（秒）',{exact:true}).fill('2');
  await page.evaluate(() => document.addEventListener('mousedown', event => {
    if ((event.target as Element).closest('.animation-picker')) document.body.dataset.animationOutsideDown = 'true';
  }));
  await panel.getByLabel('循环播放',{exact:true}).check();
  await expect(panel.getByLabel('循环播放',{exact:true})).toBeFocused();
  await page.waitForTimeout(100);
  await expect(toolbar).toBeVisible();
  await panel.locator('.animation-loop span').click();
  await expect(panel.getByLabel('循环播放',{exact:true})).not.toBeChecked();
  await expect(panel.getByLabel('循环播放',{exact:true})).toBeFocused();
  await page.waitForTimeout(100);
  await expect(toolbar).toBeVisible();
  await panel.getByLabel('循环播放',{exact:true}).focus();
  await page.keyboard.press('Space');
  await expect(panel.getByLabel('循环播放',{exact:true})).toBeChecked();
  expect(await page.evaluate(() => document.body.dataset.animationOutsideDown)).toBeUndefined();
  await page.waitForTimeout(100);
  await expect(toolbar).toBeVisible();
  const panelBox=(await panel.boundingBox())!;
  const buttonBox=(await toolbar.locator('[data-mce-name="textanimation"]').boundingBox())!;
  expect(panelBox.y+panelBox.height).toBeLessThan(buttonBox.y);
  await panel.getByRole('button',{name:'bounce',exact:true}).click();
  await expect(panel).toHaveCount(0);
  await expect(toolbar).toBeVisible();
  await (await textTool(page, 'bold')).click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('strong')).toHaveText('动画工具栏保持显示');
});

for (const method of ['button', 'close', 'escape']) {
  test(`关闭动画面板 ${method} 后保留选区和工具栏，并能再次打开`, async ({ page }) => {
    await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await page.evaluate(() => {
      const e=window.tinymce.activeEditor;
      e.setContent('<p>保留当前选区</p>'); e.focus(); e.selection.select(e.getBody().querySelector('p')!,true); e.fire('mouseup');
    });
    const toolbar=page.locator('.tox-pop .tox-toolbar');
    const button=toolbar.locator('[data-mce-name="textanimation"]');
    const panel=page.getByRole('dialog',{name:'文字动画设置'});
    for (let i=0;i<2;i++) {
      await button.click(); await expect(panel).toBeVisible();
      if (method==='button') await button.click();
      else if (method==='close') await panel.getByRole('button',{name:'关闭动画设置',exact:true}).click();
      else await page.keyboard.press('Escape');
      await expect(panel).toHaveCount(0);
      await page.waitForTimeout(150);
      await expect(toolbar).toBeVisible();
      expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({format:'text'}))).toBe('保留当前选区');
    }
    await (await textTool(page, 'bold')).click();
    await expect(page.frameLocator('.tox-edit-area iframe').locator('strong')).toHaveText('保留当前选区');
  });
}

test('动画面板标题、边缘、图标间隙、设置说明等任意空白点击都保留工具栏', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e=window.tinymce.activeEditor;
    e.setContent('<p>面板任意位置保留工具栏</p>'); e.focus(); e.selection.select(e.getBody().querySelector('p')!,true); e.fire('mouseup');
  });
  const toolbar=page.locator('.tox-pop .tox-toolbar');
  await toolbar.locator('[data-mce-name="textanimation"]').click();
  const panel=page.getByRole('dialog',{name:'文字动画设置'});
  const check = async () => {
    await page.waitForTimeout(100);
    await expect(panel).toBeVisible(); await expect(toolbar).toBeVisible();
    expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({format:'text'}))).toBe('面板任意位置保留工具栏');
  };
  await panel.click({position:{x:4,y:4}}); await check();
  await panel.locator('.animation-picker-heading span').first().click(); await check();
  await panel.locator('.animation-picker-heading span').last().click(); await check();
  const first=(await panel.locator('[data-effect]').nth(0).boundingBox())!;
  const second=(await panel.locator('[data-effect]').nth(1).boundingBox())!;
  await page.mouse.click((first.x+first.width+second.x)/2,first.y+first.height/2); await check();
  let box=(await panel.boundingBox())!;
  await page.mouse.click(box.x+4,box.y+box.height-4); await check();
  await panel.getByRole('button',{name:'播放设置',exact:true}).click();
  await panel.locator('.animation-playback p').click(); await check();
  // 未选择效果时应用按钮禁用，点击周围空白也不能导致失焦。
  await panel.locator('.animation-playback').click({position:{x:2,y:2}}); await check();
  await panel.getByRole('button',{name:'pulse',exact:true}).click();
  await expect(panel).toHaveCount(0); await expect(toolbar).toBeVisible();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-text-animation]')).toHaveAttribute('data-text-animation','pulse');
});
