import type { Editor } from 'tinymce';
import { getCanvasInsertionPoint } from './blank-selection';

/** 画布插入图片或表情时，将插入点放在已有对象之后。 */
export function registerCanvasInsertion(editor: Editor): void {
  editor.ui.registry.addButton('canvastext', {
    icon: 'typography', tooltip: '插入文字',
    onAction: () => {
      if (editor.mode.isReadOnly()) return;
      const point = getCanvasInsertionPoint(editor) ?? { x: 24, y: 24 };
      editor.windowManager.open({
        title: '插入文字',
        body: { type: 'panel', items: [{ type: 'textarea', name: 'text', label: '文本内容', placeholder: '请输入文本' }] },
        initialData: { text: '' },
        buttons: [
          { type: 'cancel', text: '取消' },
          { type: 'submit', name: 'insert', text: '插入', primary: true, enabled: false }
        ],
        onChange: api => api.setEnabled('insert', !!api.getData().text.trim()),
        onSubmit: api => {
          const text = api.getData().text;
          if (!text.trim() || editor.mode.isReadOnly()) return;
          let element: HTMLSpanElement;
          editor.undoManager.transact(() => {
            const doc = editor.getDoc(); const view = editor.getWin();
            element = doc.createElement('span');
            element.setAttribute('data-text-draggable', 'true');
            // 文字按纯文本写入，换行和空格由 white-space 保留。
            element.textContent = text;
            const paragraph = editor.dom.create('p', { style: 'margin:0' });
            paragraph.append(element); editor.getBody().append(paragraph);
            const x = Math.max(0, Math.min(point.x - view.scrollX, doc.documentElement.clientWidth - 48));
            const y = Math.max(0, Math.min(point.y - view.scrollY, doc.documentElement.clientHeight - 32));
            const layers = Array.from(editor.getBody().querySelectorAll<HTMLElement>('img,div[data-danmaku-source],span[data-text-draggable]'))
              .map(node => parseInt(view.getComputedStyle(node).zIndex, 10) || 0);
            editor.dom.setStyles(element, {
              position: 'absolute', left: '0px', top: '0px', display: 'inline-block', margin: '0',
              whiteSpace: 'pre-wrap', overflowWrap: 'break-word', maxWidth: `${Math.max(32, doc.documentElement.clientWidth - x - 16)}px`,
              zIndex: String(Math.min(2147480000, Math.max(0, ...layers) + 1))
            });
            const origin = element.getBoundingClientRect();
            editor.dom.setStyles(element, { left: `${x - origin.left}px`, top: `${y - origin.top}px` });
          });
          api.close(); editor.focus();
          editor.selection.setCursorLocation(element!.firstChild!, text.length);
          editor.dispatch('CanvasTextInserted'); editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('change');
        }
      });
    }
  });
  editor.ui.registry.addButton('canvasimage', {
    icon: 'image', tooltip: '插入图片',
    onAction: () => editor.execCommand('mceImage'),
    onSetup: api => {
      const update = () => api.setEnabled(!editor.mode.isReadOnly());
      editor.on('SwitchMode', update); update();
      return () => editor.off('SwitchMode', update);
    }
  });
  editor.on('BeforeExecCommand', event => {
    if (!['mceemoticons', 'mceimage'].includes(event.command.toLowerCase()) || editor.mode.isReadOnly()) return;
    const node = editor.selection.getNode();
    const object = node.closest('div[data-danmaku-source]')
      ?? node.closest('figure.image,img,video,iframe,table');
    if (!object || !editor.getBody().contains(object)) return;
    const range = editor.getDoc().createRange();
    range.setStartAfter(object); range.collapse(true);
    editor.selection.setRng(range);
  });
}
