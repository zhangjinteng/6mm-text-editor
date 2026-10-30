import type { Editor } from 'tinymce';
import { selectAdvancedObject } from './text-advanced';
import { currentTextBox, isTextLocked, selectionHasLockedText } from './text-box-state';

const events = 'NodeChange SelectionChange SwitchMode TextBoxSelected TextBoxLockChanged Undo Redo';

/** Object effects use persisted CSS; the dialog never mutates the document until Apply. */
export function registerTextObjectTools(editor: Editor): void {
  const notify = () => { editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('change'); };
  editor.on('BeforeExecCommand', event => {
    if (!selectionHasLockedText(editor)) return;
    const allowed = new Set(['mcefocus', 'undo', 'redo', 'copy', 'mcecopy', 'selectall', 'textduplicate', 'texttogglelock', 'mcepreview', 'mceprint', 'mcefullscreen', 'mcesave', 'mcecodeeditor']);
    if (!allowed.has(event.command.toLowerCase())) { event.preventDefault(); event.stopImmediatePropagation(); }
  });
  editor.addCommand('TextDuplicate', () => {
    const original = currentTextBox(editor); if (!original?.isConnected || editor.mode.isReadOnly()) return;
    let clone: HTMLElement;
    editor.undoManager.transact(() => {
      const bounds = original.getBoundingClientRect(); clone = original.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('[data-mce-bogus]').forEach(node => node.remove());
      for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) {
        node.removeAttribute('id');
        for (const name of node.getAttributeNames()) if (name.startsWith('data-mce-')) node.removeAttribute(name);
      }
      clone.removeAttribute('data-text-locked'); clone.removeAttribute('contenteditable');
      original.after(clone);
      const highest = Math.max(0, ...Array.from(editor.getBody().querySelectorAll<HTMLElement>('img,div[data-danmaku-source],span[data-text-draggable]')).map(node => parseInt(editor.getWin().getComputedStyle(node).zIndex) || 0));
      editor.dom.setStyles(clone, { position: 'absolute', display: 'inline-block', boxSizing: 'border-box', width: `${bounds.width}px`, maxWidth: 'none', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0', zIndex: String(Math.min(highest + 1, 2147480000)) });
      const origin = clone.getBoundingClientRect();
      editor.dom.setStyles(clone, { left: `${bounds.left + 24 - origin.left}px`, top: `${bounds.top + 24 - origin.top}px` });
    });
    editor.focus(); selectAdvancedObject(editor, clone!); editor.dispatch('CanvasTextInserted'); notify();
  });
  editor.addCommand('TextToggleLock', () => {
    const box = currentTextBox(editor); if (!box?.isConnected || editor.mode.isReadOnly()) return;
    editor.undoManager.transact(() => {
      const lock = !isTextLocked(box);
      editor.dom.setAttrib(box, 'data-text-locked', lock ? 'true' : null);
      editor.dom.setAttrib(box, 'contenteditable', lock ? 'false' : null);
    });
    editor.dispatch('TextBoxLockChanged'); notify();
  });
  editor.ui.registry.addButton('textduplicate', {
    text: '复制', tooltip: '创建文字副本', onAction: () => editor.execCommand('TextDuplicate'),
    onSetup: api => { const update = () => api.setEnabled(!!currentTextBox(editor) && !editor.mode.isReadOnly()); update(); editor.on(events, update); return () => editor.off(events, update); }
  });
  editor.ui.registry.addToggleButton('textlock', {
    text: '锁定', tooltip: '锁定 / 解锁文本框', onAction: () => editor.execCommand('TextToggleLock'),
    onSetup: api => { const update = () => { const box = currentTextBox(editor); api.setEnabled(!!box && !editor.mode.isReadOnly()); api.setActive(isTextLocked(box)); api.setText(isTextLocked(box) ? '解锁' : '锁定'); }; update(); editor.on(events, update); return () => editor.off(events, update); }
  });
  editor.ui.registry.addGroupToolbarButton('textgroupobject', { text: '对象', tooltip: '文字复制与锁定', items: 'textduplicate textlock' });
}
