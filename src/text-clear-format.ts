import type { Editor } from 'tinymce';

/** 清除文字样式时保留拖动外层的坐标、尺寸、动画和图层。 */
export function registerTextClearFormat(editor: Editor): void {
  const selector = 'span[data-text-draggable]';
  const textStyles = ['color', 'background-color', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'line-height', 'letter-spacing'];
  editor.on('init', () => {
    const formats = editor.formatter.get('removeformat') ?? [];
    editor.formatter.register('removeformat', [
      ...formats.map(format => 'selector' in format ? {
        ...format,
        selector: format.selector?.split(',').map((part: string) => `${part.trim()}:not([data-text-draggable])`).join(',')
      } : format),
      { selector: 'span[data-selection-heading]', attributes: ['data-selection-heading'], remove: 'empty', split: true, expand: false, deep: true }
    ]);
  });
  editor.on('BeforeExecCommand', event => {
    if (event.command.toLowerCase() !== 'removeformat' || editor.mode.isReadOnly()) return;
    const range = editor.selection.getRng();
    const wrappers = Array.from(editor.getBody().querySelectorAll<HTMLElement>(selector))
      .filter(element => element.contains(range.startContainer) || range.intersectsNode(element));
    if (!wrappers.length) return;
    event.preventDefault();
    editor.undoManager.transact(() => {
      const bookmark = editor.selection.getBookmark();
      for (const wrapper of wrappers) {
        const styles = Object.fromEntries(textStyles.map(name => [name, wrapper.style.getPropertyValue(name)]).filter(([, value]) => value));
        if (!Object.keys(styles).length) continue;
        // 将文字样式放到内层，原生清除逻辑可按选区拆分内层而不拆分定位外层。
        const inner = editor.getDoc().createElement('span');
        editor.dom.setStyles(inner, styles);
        while (wrapper.firstChild) inner.append(wrapper.firstChild);
        wrapper.append(inner);
        for (const property of Object.keys(styles)) editor.dom.setStyle(wrapper, property, null);
      }
      editor.selection.moveToBookmark(bookmark);
      editor.formatter.remove('removeformat');
    });
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('change');
  });
}
