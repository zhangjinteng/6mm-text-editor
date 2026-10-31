import type { Editor } from 'tinymce';
import { registerDanmakuSettings } from './settings';

/** 对齐与图层操作统一收纳在弹幕设置中。 */
export function registerDanmakuToolbar(editor: Editor) {
  registerDanmakuSettings(editor);
  editor.ui.registry.addContextToolbar('danmaku', {
    predicate: (node) => node.matches('div[data-danmaku-source]') && !node.parentElement?.closest('div[data-danmaku-source]'),
    items: 'danmakusettings', position: 'node', scope: 'node'
  });
}
