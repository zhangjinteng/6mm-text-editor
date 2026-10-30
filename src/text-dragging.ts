import type { Editor } from 'tinymce';
import { isTextLocked, currentTextBox } from './text-box-state';
import { enableTextBoxInteractions } from './text-box-interactions';

/** 用独立外层承载坐标，内层颜色和动画不受拖动影响。 */
export function registerTextDragging(editor: Editor): void {
  editor.on('init', () => { const stop = enableTextBoxInteractions(editor); editor.on('remove', stop); });
  const selector = 'span[data-text-draggable]';
  editor.on('init', () => editor.formatter.register('draggabletext', {
    inline: 'span', attributes: { 'data-text-draggable': 'true' }, exact: true
  }));
  // 框选整段时 getNode() 常返回 p，而拖动外层位于它的子节点中。
  // 同时检查选区内的容器，避免重复包裹，也能清理旧的多层拖动容器。
  const selectedWrappers = () => {
    const parent = editor.dom.getParent(editor.selection.getNode(), selector);
    const range = editor.selection.getRng();
    return Array.from(editor.getBody().querySelectorAll<HTMLElement>(selector))
      .filter(element => element === parent || (!range.collapsed && range.intersectsNode(element)));
  };
  editor.ui.registry.addToggleButton('textdrag', {
    icon: 'drag', tooltip: '拖动文字 / 恢复正文',
    onAction: () => {
      if (editor.mode.isReadOnly() || isTextLocked(currentTextBox(editor))) return;
      const current = selectedWrappers();
      editor.undoManager.transact(() => {
        if (current.length) {
          // 外层只负责拖动，恢复时保留内层全部格式和内容。
          const bookmark = editor.selection.getBookmark();
          for (const element of current.reverse()) editor.dom.remove(element, true);
          editor.selection.moveToBookmark(bookmark);
        } else if (!editor.selection.isCollapsed() && editor.selection.getContent({ format: 'text' }).trim()) {
          editor.formatter.apply('draggabletext');
          // 动画留在内层，避免 transform 动画改变定位的参照。
          for (const element of editor.getBody().querySelectorAll<HTMLElement>(selector)) {
            if (!editor.selection.getRng().intersectsNode(element)) continue;
            editor.dom.setStyles(element, { display: 'inline-block' });
          }
        }
      });
      editor.nodeChanged(); editor.dispatch('change');
    },
    onSetup: (api) => {
      const update = () => {
        const active = selectedWrappers().length > 0;
        api.setActive(active);
        api.setEnabled(!editor.mode.isReadOnly() && !isTextLocked(currentTextBox(editor)) && (active || !editor.selection.isCollapsed()));
      };
      editor.on('NodeChange SelectionChange SwitchMode', update);
      return () => editor.off('NodeChange SelectionChange SwitchMode', update);
    }
  });
  editor.ui.registry.addContextToolbar('draggabletext', {
    predicate: node => node.matches(selector) && (editor.selection.isCollapsed() || isTextLocked(node)), items: 'fontfamily fontsizeinput | textgroupstyle forecolor backcolor textgroupparagraph textgrouplayout | textanimation textdrag | textsettings textgroupobject', position: 'node', scope: 'node'
  });
}
