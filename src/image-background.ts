import type { Editor } from 'tinymce';

const selector = 'img[data-document-background]';
export function registerImageBackground(editor: Editor): void {
  const changed = () => {
    editor.selection.controlSelection.hideResizeRect();
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
  };
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
