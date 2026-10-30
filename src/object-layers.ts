import type { Editor } from 'tinymce';
import { selectionHasLockedText } from './text-box-state';

const selector = 'img:not([data-mce-object]):not([data-mce-placeholder]):not([data-document-background]),div[data-danmaku-source],span[data-text-draggable],table,video,iframe';
type LayerAction = 'backward' | 'forward' | 'bottom' | 'top';

/** 内容对象使用连续的正层级，编辑辅助框始终保留在内容上方。 */
export function registerLayerSettings(editor: Editor): void {
  function outerObject(element: HTMLElement) {
    let current = element;
    for (let parent = current.parentElement?.closest<HTMLElement>(selector); parent; parent = current.parentElement?.closest<HTMLElement>(selector)) current = parent;
    return current;
  }
  function targets(): HTMLElement[] {
    const body = editor.getBody();
    if (!body) return [];
    const closest = editor.selection.getNode().closest<HTMLElement>(selector);
    if (closest && body.contains(closest)) return [outerObject(closest)];
    const range = editor.selection.getRng();
    if (range.collapsed) return [];
    return [...new Set(Array.from(body.querySelectorAll<HTMLElement>(selector))
      .filter(element => range.intersectsNode(element)).map(outerObject))];
  }
  function canApply() {
    return !editor.mode.isReadOnly() && !selectionHasLockedText(editor) && (targets().length > 0 || (!editor.selection.isCollapsed() && !!editor.selection.getContent({ format: 'text' }).trim()));
  }
  function apply(action: LayerAction) {
    if (!canApply()) return;
    editor.focus();
    editor.undoManager.transact(() => {
      let selected = targets();
      if (!selected.length) {
        // 复用可拖动文字的外层，图层不会改动内层格式、颜色或动画。
        editor.formatter.apply('draggabletext');
        selected = targets();
        for (const element of selected) editor.dom.setStyle(element, 'display', 'inline-block');
      }
      if (!selected.length) return;
      const view = editor.getWin();
      const order = Array.from(editor.getBody().querySelectorAll<HTMLElement>(selector))
        .filter(element => !element.parentElement?.closest(selector) && element.getClientRects().length > 0)
        .sort((a, b) => {
          const z = (element: HTMLElement) => parseInt(view.getComputedStyle(element).zIndex, 10) || 0;
          return z(a) - z(b) || (a.compareDocumentPosition(b) & 4 ? -1 : 1);
        });
      const chosen = new Set(selected);
      let reordered = [...order];
      if (action === 'top' || action === 'bottom') {
        const active = order.filter(element => chosen.has(element));
        const others = order.filter(element => !chosen.has(element));
        reordered = action === 'top' ? [...others, ...active] : [...active, ...others];
      } else if (action === 'backward') {
        for (let index = 1; index < reordered.length; index++) {
          if (chosen.has(reordered[index]) && !chosen.has(reordered[index - 1])) [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
        }
      } else {
        for (let index = reordered.length - 2; index >= 0; index--) {
          if (chosen.has(reordered[index]) && !chosen.has(reordered[index + 1])) [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
        }
      }
      reordered.forEach((element, index) => {
        if (view.getComputedStyle(element).position === 'static') editor.dom.setStyle(element, 'position', 'relative');
        editor.dom.setStyle(element, 'z-index', String(index + 1));
      });
    });
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
  }
  editor.ui.registry.addIcon('object-layers', '<svg width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></g></svg>');
  editor.ui.registry.addMenuButton('layersettings', {
    icon: 'object-layers', tooltip: '图层设置',
    fetch: callback => callback(([
      ['下一层', 'backward'], ['上一层', 'forward'], ['置于底层', 'bottom'], ['置于顶层', 'top']
    ] as const).map(([text, action]) => ({ type: 'menuitem' as const, text, onAction: () => apply(action) }))),
    onSetup: api => {
      const update = () => api.setEnabled(canApply());
      const events = 'NodeChange SelectionChange SwitchMode TextBoxLockChanged';
      update(); editor.on(events, update);
      return () => editor.off(events, update);
    }
  });
}
