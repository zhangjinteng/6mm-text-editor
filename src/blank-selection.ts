import type { Editor } from 'tinymce';

const blankSelections = new WeakSet<Editor>();
const insertionPoints = new WeakMap<Editor, { x: number; y: number }>();
export const getCanvasInsertionPoint = (editor: Editor) => insertionPoints.get(editor);
export const isBlankSelection = (editor: Editor) => blankSelections.has(editor);

/** 空画布和可编辑空段落共用画布工具，不把表格单元格或空对象当成画布。 */
export function isCanvasSelection(editor: Editor): boolean {
  if (isBlankSelection(editor)) return true;
  const body = editor.getBody();
  if (!body || !editor.selection.isCollapsed()) return false;
  const node = editor.selection.getNode();
  if (node.closest('table,[data-mce-bogus="all"],[contenteditable="false"],div[data-danmaku-source],span[data-text-draggable]')) return false;
  const blocks = Object.keys(editor.schema.getTextBlockElements()).join(',');
  const block = node.closest(blocks);
  return !!block && body.contains(block) && editor.dom.isEmpty(block);
}

/** 空白画布只取消对象选中，不能用浏览器的最近插入点重新激活文字工具。 */
export function registerBlankSelection(editor: Editor): void {
  editor.on('PreInit', () => {
    for (const [name, spec] of Object.entries(editor.ui.registry.getAll().contextToolbars)) {
      if (spec.type !== 'contexttoolbar' || name === 'canvasbackground') continue;
      const predicate = spec.predicate;
      if (!predicate) continue;
      editor.ui.registry.addContextToolbar(name, {
        ...spec, predicate: node => !isCanvasSelection(editor) && predicate(node)
      });
    }
  });
  editor.on('init', () => {
    const doc = editor.getDoc();
    const body = editor.getBody();
    const isContentHit = (event: PointerEvent) => {
      const target = event.target as Element;
      if (target.closest('img,video,iframe,table,div[data-danmaku-source],span[data-text-draggable],a,button,input,textarea,[data-mce-bogus]')) return true;
      // 段落和标题通常占整行；用文字实际矩形区分字形与行尾空白。
      const walker = doc.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        if (!text.textContent?.trim()) continue;
        const range = doc.createRange(); range.selectNodeContents(text);
        for (const rect of range.getClientRects()) {
          if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) return true;
        }
      }
      return false;
    };
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || editor.mode.isReadOnly() || !body.contains(event.target as Node)) return;
      if (isContentHit(event)) { blankSelections.delete(editor); return; }
      blankSelections.add(editor);
      insertionPoints.set(editor, { x: event.clientX + editor.getWin().scrollX, y: event.clientY + editor.getWin().scrollY });
      // 保留在原图片/正文位置的折叠插入点，不让空白点击将它吸附到远处文字。
      event.preventDefault();
      editor.selection.collapse(false);
      editor.selection.controlSelection.hideResizeRect();
      editor.dispatch('contexttoolbar-hide'); editor.nodeChanged();
      editor.focus();
      editor.dispatch('contexttoolbar-show', { toolbarKey: 'canvasbackground' });
    };
    const reset = () => { blankSelections.delete(editor); };
    const key = (event: KeyboardEvent) => {
      if (['Shift', 'Control', 'Meta', 'Alt', 'Escape'].includes(event.key)) return;
      if (isBlankSelection(editor)) { reset(); editor.nodeChanged(); }
    };
    doc.addEventListener('pointerdown', down, true);
    doc.addEventListener('keydown', key, true);
    editor.on('BeforeSetContent Undo Redo CanvasTextInserted', reset);
    editor.on('remove', () => {
      reset(); doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('keydown', key, true);
      editor.off('BeforeSetContent Undo Redo CanvasTextInserted', reset);
    });
  });
}
