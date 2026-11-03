import type { Editor } from 'tinymce';

const selector = 'img[data-document-background]';
export function registerImageBackground(editor: Editor): void {
  const changed = () => {
    editor.selection.controlSelection.hideResizeRect();
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
  };
  editor.addCommand('CanvasSetBackgroundImage', () => {
    if (editor.mode.isReadOnly()) return;
    const current = editor.getBody().querySelector<HTMLImageElement>(selector);
    const original = current?.getAttribute('src') || '';
    editor.windowManager.open({
      title: '设置画布背景图',
      body: { type: 'panel', items: [
        { type: 'urlinput', name: 'source', label: '图片地址', filetype: 'image' },
        { type: 'htmlpanel', html: '<p>填写图片地址，或点击右侧按钮选择本地图片（最大 5 MB）。图片会居中铺满画布，边缘可能被裁切。</p>' },
        ...(current ? [{ type: 'button' as const, name: 'remove', text: '移除背景图' }] : [])
      ] },
      initialData: { source: { value: original } },
      buttons: [{ type: 'cancel', text: '取消' }, { type: 'submit', text: '应用背景图', primary: true }],
      onAction: (api, details) => {
        if (details.name === 'remove') { api.close(); editor.execCommand('mceRemoveImageBackground'); }
      },
      onSubmit: api => {
        if (editor.mode.isReadOnly()) { api.close(); return; }
        const source = api.getData().source.value.trim();
        let valid = false;
        try {
          const url = new URL(source, editor.getDoc().baseURI);
          valid = !!source && (['http:', 'https:', 'blob:'].includes(url.protocol) || /^data:image\/(png|jpeg|gif|webp|bmp);base64,/i.test(source));
        } catch { /* Keep the dialog open for an invalid address. */ }
        if (!valid) { editor.windowManager.alert('请选择图片或输入有效的图片地址。'); return; }
        api.close();
        if (source === original) return;
        editor.undoManager.transact(() => {
          for (const image of editor.getBody().querySelectorAll(selector)) editor.dom.remove(image.closest('.document-background-layer') || image);
          const layer = editor.dom.create('div', { class: 'document-background-layer' });
          layer.append(editor.dom.create('img', { src: source, alt: '', 'data-document-background': 'true' }));
          editor.getBody().prepend(layer);
        });
        changed();
      }
    });
  });
  editor.addCommand('mceImageBackground', () => {
    if (editor.mode.isReadOnly()) return;
    const node = editor.selection.getNode();
    const image = node.closest('img') || (node.matches('figure.image') ? node.querySelector('img') : null);
    if (!image || !editor.getBody().contains(image) || image.matches(selector)) return;
    editor.undoManager.transact(() => {
      // 背景单独放到 body 下，避开父级的 transform、overflow 和局部图层。
      for (const previous of editor.getBody().querySelectorAll(selector)) if (previous !== image) editor.dom.remove(previous.closest('.document-background-layer') || previous);
      editor.dom.setAttrib(image, 'data-document-background', 'true');
      image.removeAttribute('data-mce-selected');
      const layer = editor.dom.create('div', { class: 'document-background-layer' });
      layer.append(image);
      editor.getBody().prepend(layer);
      editor.selection.setCursorLocation(editor.getBody(), 1);
    });
    changed();
  });
  editor.addCommand('mceRemoveImageBackground', () => {
    if (editor.mode.isReadOnly()) return;
    editor.undoManager.transact(() => {
      for (const image of editor.getBody().querySelectorAll(selector)) editor.dom.remove(image.closest('.document-background-layer') || image);
    });
    changed();
  });
  editor.ui.registry.addIcon('image-background', '<svg width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m4 17 5-6 4 4 3-3 5 6M3 7h18M7 3v18"/><circle cx="16" cy="10" r="1"/></g></svg>');
  editor.ui.registry.addButton('imagebackground', {
    icon: 'image-background', tooltip: '设为背景', onAction: () => editor.execCommand('mceImageBackground')
  });
  editor.ui.registry.addMenuItem('removeimagebackground', {
    text: '移除图片背景', onAction: () => editor.execCommand('mceRemoveImageBackground'),
    onSetup: api => {
      const update = () => api.setEnabled(!editor.mode.isReadOnly() && !!editor.getBody()?.querySelector(selector));
      update(); editor.on('NodeChange SetContent Undo Redo SwitchMode', update);
      return () => editor.off('NodeChange SetContent Undo Redo SwitchMode', update);
    }
  });
}
