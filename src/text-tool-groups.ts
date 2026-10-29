import type { Editor } from 'tinymce';

/** 分类入口复用原生控件，选区、撤销、字号输入和颜色菜单仍由编辑器管理。 */
export function registerTextToolGroups(editor: Editor): void {
  editor.on('init', () => {
    const doc = editor.getContainer().ownerDocument;
    // 工具栏的空白、分隔线和标签不应把焦点交给页面 body，
    // 否则 TinyMCE 会把它判定为离开编辑器并关闭整个上下文工具栏。
    const preserveFocus = (event: MouseEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      const target = event.target;
      const toolbar = target.closest('.tox-pop');
      const group = target.closest('[data-toolbar-group^="textgroup"]');
      if (!group && !toolbar?.querySelector('[data-mce-name="fontfamily"], [data-mce-name="textdrag"]')) return;
      const groupButton = target.closest<HTMLButtonElement>('button[data-mce-name^="textgroup"]');
      if (groupButton) {
        // 第二次点击会销毁当前面板；先将焦点移回入口，避免面板移除后落到 body。
        event.preventDefault();
        groupButton.focus({ preventScroll: true });
        return;
      }
      // 字号及链接等输入框仍可正常定位光标、拖选和输入。
      if (target.closest('button,input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      const surface = (group ?? toolbar) as HTMLElement;
      surface.tabIndex = -1;
      surface.focus({ preventScroll: true });
    };
    doc.addEventListener('mousedown', preserveFocus, true);
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // 色板、字体菜单和对话框优先处理各自的 Escape。
      if (Array.from(doc.querySelectorAll<HTMLElement>('.tox-menu,.tox-dialog')).some(node => node.getClientRects().length > 0)) return;
      const panel = Array.from(doc.querySelectorAll<HTMLElement>('[data-toolbar-group^="textgroup"]')).find(node => node.getClientRects().length > 0);
      if (!panel) return;
      const anchor = doc.querySelector<HTMLButtonElement>(`.tox-pop [data-mce-name="${panel.getAttribute('data-toolbar-group')}"]`);
      if (anchor) { anchor.click(); anchor.focus(); event.preventDefault(); event.stopImmediatePropagation(); }
    };
    doc.addEventListener('keydown', key, true); editor.getDoc().addEventListener('keydown', key, true);
    editor.on('remove', () => {
      doc.removeEventListener('mousedown', preserveFocus, true);
      doc.removeEventListener('keydown', key, true); editor.getDoc().removeEventListener('keydown', key, true);
    });
  });
  for (const [name, text, tooltip, items] of [
    ['style', '样式', '文字样式', 'bold italic underline strikethrough subscript superscript removeformat'],
    ['paragraph', '段落', '标题与段落', 'h1 h2 h3 h4 h5 h6 ltr rtl blockquote']
  ] as const) {
    editor.ui.registry.addGroupToolbarButton(`textgroup${name}`, { text, tooltip, items });
  }
}
