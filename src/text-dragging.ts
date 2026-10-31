import type { Editor } from 'tinymce';
import { isTextLocked } from './text-box-state';
import { enableTextBoxInteractions } from './text-box-interactions';

/** 文字框直接支持拖动和缩放，工具栏只提供文字设置入口。 */
export function registerTextDragging(editor: Editor): void {
  editor.on('init', () => { const stop = enableTextBoxInteractions(editor); editor.on('remove', stop); });
  // 图层工具仍通过此格式将正文转换成可定位的文字对象。
  editor.on('init', () => editor.formatter.register('draggabletext', {
    inline: 'span', attributes: { 'data-text-draggable': 'true' }, exact: true
  }));
  editor.ui.registry.addContextToolbar('draggabletext', {
    predicate: node => node.matches('span[data-text-draggable]') && (editor.selection.isCollapsed() || isTextLocked(node)),
    items: 'textsettings', position: 'node', scope: 'node'
  });
}
