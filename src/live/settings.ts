import type { Editor } from 'tinymce';
import { contentBounds } from '../object-layout';
import { outerLayerObject, readObjectLayers, setObjectLayerPosition } from '../object-layers';
import './settings.css';

export const alignments = [
  ['left', '左对齐', 'JustifyLeft', 0],
  ['center', '居中对齐', 'JustifyCenter', .5],
  ['right', '右对齐', 'JustifyRight', 1]
] as const;
export type Alignment = typeof alignments[number][0] | '';

export function readDanmakuSettings(editor: Editor, target: HTMLElement) {
  const rect = target.getBoundingClientRect(), bounds = contentBounds(editor, target);
  const order = readObjectLayers(editor.getBody());
  return {
    alignment: alignments.find(([, , , ratio]) => Math.abs(rect.left - (bounds.left + Math.max(0, bounds.width - rect.width) * ratio)) < 1)?.[0] ?? '' as Alignment,
    layer: order.indexOf(outerLayerObject(target)) + 1,
    count: order.length
  };
}

export function applyDanmakuSettings(editor: Editor, target: HTMLElement, settings: { alignment?: Alignment; layer?: number }) {
  if (editor.removed || editor.mode.isReadOnly() || !editor.getBody().contains(target)) return;
  editor.focus(); editor.selection.setCursorLocation(target, 0);
  const before = readDanmakuSettings(editor, target);
  editor.undoManager.transact(() => {
    if (settings.layer !== undefined && settings.layer !== before.layer) setObjectLayerPosition(editor, target, settings.layer);
    if (settings.alignment && settings.alignment !== before.alignment) editor.execCommand(alignments.find(([key]) => key === settings.alignment)![2]);
  });
  editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
}

export function registerDanmakuSettings(editor: Editor) {
  let dispose: (() => void) | undefined;
  let selectedTarget: HTMLElement | undefined;
  editor.on('ObjectSelectionChanged', (event: { element?: HTMLElement }) => {
    selectedTarget = event.element?.matches('div[data-danmaku-source]') ? event.element : undefined;
  });
  editor.on('BeforeSetContent TextBoxSelected', () => { selectedTarget = undefined; });
  editor.on('NodeChange', () => {
    const target = editor.selection.getNode().closest<HTMLElement>('div[data-danmaku-source]');
    if (target && !selectedTarget?.isConnected) selectedTarget = target;
  });
  editor.on('remove BeforeSetContent SwitchMode', () => dispose?.());
  editor.ui.registry.addIcon('danmaku-settings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/></svg>');
  editor.ui.registry.addButton('danmakusettings', {
    icon: 'danmaku-settings', text: '弹幕设置', tooltip: '弹幕设置',
    onAction: () => {
      if (dispose || editor.mode.isReadOnly()) return;
      const target = selectedTarget?.isConnected ? selectedTarget : editor.selection.getNode().closest<HTMLElement>('div[data-danmaku-source]');
      if (!target || !editor.getBody().contains(target)) return;
      const doc = editor.getContainer().ownerDocument;
      const dialog = doc.createElement('dialog');
      dialog.className = 'danmaku-settings-dialog'; dialog.setAttribute('aria-label', '弹幕设置');
      dialog.innerHTML = `<header><div><h2>弹幕设置</h2><p>调整弹幕框位置与图层顺序</p></div><button type="button" data-close aria-label="关闭弹幕设置">×</button></header>
        <div class="danmaku-settings-body"><section><h3>对齐</h3><div class="danmaku-settings-align" role="group" aria-label="弹幕对齐">${alignments.map(([key, label]) => `<button type="button" data-align="${key}" aria-pressed="false">${label}</button>`).join('')}</div><p class="danmaku-settings-hint">对齐弹幕框，不改变消息文字的对齐方式。</p></section>
        <section><h3>图层设置 <span data-layer-position></span></h3><div class="danmaku-settings-layers" role="group" aria-label="图层设置">${[['backward', '下一层'], ['forward', '上一层'], ['bottom', '置于底层'], ['top', '置于顶层']].map(([key, label]) => `<button type="button" data-layer="${key}">${label}</button>`).join('')}</div></section></div>
        <footer><button type="button" data-close>取消</button><button type="button" data-apply>应用设置</button></footer>`;
      const { alignment: initialAlignment, layer: initialLayer } = readDanmakuSettings(editor, target);
      let alignment = initialAlignment, layer = initialLayer;
      const close = (restore = true) => {
        dialog.remove(); dispose = undefined;
        if (restore && !editor.removed && target.isConnected && !editor.mode.isReadOnly()) {
          editor.focus(); editor.selection.setCursorLocation(target, 0); editor.nodeChanged(); editor.dispatch('ResizeContent');
        }
      };
      dispose = () => close(false);
      const refresh = () => {
        const count = readObjectLayers(editor.getBody()).length;
        dialog.querySelector('[data-layer-position]')!.textContent = `第 ${layer} / ${count} 层`;
        dialog.querySelectorAll<HTMLButtonElement>('[data-align]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.align === alignment)));
        dialog.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(button => {
          button.disabled = initialLayer < 1 || (['top', 'forward'].includes(button.dataset.layer!) ? layer >= count : layer <= 1);
        });
      };
      dialog.querySelectorAll<HTMLButtonElement>('[data-align]').forEach(button => button.addEventListener('click', () => { alignment = button.dataset.align as Alignment; refresh(); }));
      dialog.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(button => button.addEventListener('click', () => {
        const count = readObjectLayers(editor.getBody()).length, action = button.dataset.layer;
        layer = action === 'top' ? count : action === 'bottom' ? 1 : Math.max(1, Math.min(count, layer + (action === 'forward' ? 1 : -1)));
        refresh();
      }));
      dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => close()));
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.querySelector('[data-apply]')!.addEventListener('click', () => {
        if (editor.removed || editor.mode.isReadOnly() || !editor.getBody().contains(target)) { close(false); return; }
        close();
        applyDanmakuSettings(editor, target, { layer, alignment });
      });
      refresh(); doc.body.append(dialog); dialog.showModal();
    }
  });
}
