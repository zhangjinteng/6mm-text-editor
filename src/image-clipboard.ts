import type { Editor } from 'tinymce';

/** 内部单图粘贴作为复制对象处理：保留原图，定位图片错开，文字粘贴保持原生行为。 */
export function registerImageClipboard(editor: Editor): void {
  editor.on('BeforeAddUndo', event => {
    if (!event.lastLevel || event.level.type !== 'complete' || event.lastLevel.type !== 'complete') return;
    const visibleContent = (html: string) => html.replace(/\sdata-mce-src="[^"]*"/g, '');
    if (event.level.content !== event.lastLevel.content && visibleContent(event.level.content) === visibleContent(event.lastLevel.content)) {
      // 图片 URI 缓存异步补写不算一次用户编辑，同步到粘贴记录即可。
      event.lastLevel.content = event.level.content;
      event.preventDefault();
    }
  });
  editor.on('PastePreProcess', event => {
    if (!event.internal || editor.mode.isReadOnly()) return;
    const parsed = new DOMParser().parseFromString(event.content, 'text/html');
    const images = parsed.body.querySelectorAll('img');
    if (images.length !== 1 || parsed.body.textContent?.trim() || parsed.body.querySelector('video,iframe,table')) return;
    const pasted = images[0]!;
    if (pasted.hasAttribute('data-document-background')) return;
    const selected = editor.selection.getNode();
    if (selected.tagName === 'IMG' && editor.getBody().contains(selected)) {
      // 默认粘贴会替换当前图片选区，先把插入点移到原图之后。
      editor.selection.select(selected); editor.selection.collapse(false);
    }
    parsed.body.querySelectorAll('[id], [data-mce-selected]').forEach(element => {
      element.removeAttribute('id'); element.removeAttribute('data-mce-selected');
    });
    if (['absolute', 'fixed'].includes(pasted.style.position)) {
      const src = pasted.getAttribute('src');
      const existing = Array.from(editor.getBody().querySelectorAll<HTMLImageElement>('img'))
        .filter(image => image.getAttribute('src') === src && !image.hasAttribute('data-document-background'));
      let left = parseFloat(pasted.style.left) || 0;
      let top = parseFloat(pasted.style.top) || 0;
      const originalLeft = left, originalTop = top;
      const width = parseFloat(pasted.style.width) || pasted.width;
      const height = parseFloat(pasted.style.height) || pasted.height;
      const area = editor.getBody().getBoundingClientRect();
      const occupied = (x: number, y: number) => existing.some(image =>
        Math.abs((parseFloat(image.style.left) || 0) - x) < 1 && Math.abs((parseFloat(image.style.top) || 0) - y) < 1);
      for (let step = 1; occupied(left, top) && step <= existing.length + 1; step++) {
        const offset = step * 24;
        left = originalLeft + offset + width <= area.width ? originalLeft + offset : Math.max(0, originalLeft - offset);
        top = originalTop + offset + height <= area.height ? originalTop + offset : Math.max(0, originalTop - offset);
      }
      pasted.style.left = `${left}px`; pasted.style.top = `${top}px`;
      pasted.style.right = 'auto'; pasted.style.bottom = 'auto';
    }
    event.content = parsed.body.innerHTML;
  });
}
