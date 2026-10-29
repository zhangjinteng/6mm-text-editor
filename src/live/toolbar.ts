import type { Editor } from 'tinymce';
import { contentBounds } from '../object-layout';

/** 弹幕框对齐调整布局坐标，不改变实时消息的文字对齐。 */
export function registerDanmakuToolbar(editor: Editor) {
  const items: string[] = [];
  for (const [name, tooltip, command, ratio] of [
    ['left', '左对齐', 'JustifyLeft', 0],
    ['center', '居中对齐', 'JustifyCenter', 0.5],
    ['right', '右对齐', 'JustifyRight', 1]
  ] as const) {
    const button = `danmakualign${name}`; items.push(button);
    editor.ui.registry.addToggleButton(button, {
      icon: `align-${name}`, tooltip,
      onAction: () => editor.execCommand(command),
      onSetup: (api) => {
        const update = () => {
          const element = editor.selection.getNode().closest<HTMLElement>('div[data-danmaku-source]');
          if (!element?.isConnected) { api.setActive(false); return; }
          const box = element.getBoundingClientRect();
          const bounds = contentBounds(editor, element);
          api.setActive(Math.abs(box.left - (bounds.left + Math.max(0, bounds.width - box.width) * ratio)) < 1);
        };
        const events = 'NodeChange ResizeContent ScrollContent Undo Redo';
        editor.on(events, update); update();
        return () => editor.off(events, update);
      }
    });
  }
  editor.ui.registry.addContextToolbar('danmaku', {
    predicate: (node) => node.matches('div[data-danmaku-source]') && !node.parentElement?.closest('div[data-danmaku-source]'),
    items: items.join(' '), position: 'node', scope: 'node'
  });
}
