import type { Editor } from 'tinymce';
import { contentBounds } from './object-layout';
import { imageGeometry, rotatePoint } from './image-geometry';

/** 图片与弹幕共用的选中框；辅助层不进入文档，缩放只提交一个撤销步骤。 */
export function enableObjectSelection(editor: Editor): () => void {
  const doc = editor.getDoc();
  const overlay = doc.createElement('div');
  overlay.setAttribute('data-mce-bogus', 'all');
  overlay.className = 'object-selection-frame';
  overlay.contentEditable = 'false';
  overlay.style.cssText = 'display:none;position:fixed;box-sizing:border-box;border:1px solid #4099ff;pointer-events:none;z-index:2147483646';
  for (const corner of ['nw', 'ne', 'sw', 'se']) {
    const handle = doc.createElement('div');
    handle.id = `objectResizeHandle${corner}`;
    handle.dataset.corner = corner;
    handle.style.cssText = `position:absolute;width:10px;height:10px;background:#4099ff;pointer-events:auto;touch-action:none;cursor:${corner}-resize;${corner.includes('n') ? 'top' : 'bottom'}:-5px;${corner.includes('w') ? 'left' : 'right'}:-5px`;
    overlay.append(handle);
  }
  doc.body.append(overlay);
  const preview = doc.createElement('style'); doc.head.append(preview);
  let selected: HTMLElement | undefined;
  let resize: { element: HTMLElement; handle: HTMLElement; pointer: number; x: number; y: number; left: number; top: number; width: number; height: number; angle: number; corner: string; dx: number; dy: number; moved: boolean } | undefined;

  function update() {
    if (!selected?.isConnected || selected.hasAttribute('data-document-background') || editor.mode.isReadOnly()) { overlay.style.display = 'none'; return; }
    // setContent/撤销可能移除辅助层，按需重新挂载。
    if (!overlay.isConnected) doc.body.append(overlay);
    const box = selected.getBoundingClientRect();
    for (const handle of overlay.querySelectorAll<HTMLElement>('[data-corner]')) handle.style.display = selected.getAttribute('data-image-locked') === 'true' ? 'none' : '';
    const geometry = selected.tagName === 'IMG' ? imageGeometry(selected) : { width: box.width, height: box.height, angle: 0, cx: box.left + box.width / 2, cy: box.top + box.height / 2 };
    Object.assign(overlay.style, { display: 'block', left: `${geometry.cx - geometry.width / 2}px`, top: `${geometry.cy - geometry.height / 2}px`, width: `${geometry.width}px`, height: `${geometry.height}px`, rotate: `${geometry.angle}deg` });
  }
  function cancel() {
    const current = resize; resize = undefined;
    preview.textContent = '';
    if (current?.handle.hasPointerCapture(current.pointer)) current.handle.releasePointerCapture(current.pointer);
    update();
    if (current?.moved && !editor.removed) editor.dispatch('ScrollContent');
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || editor.mode.isReadOnly()) return;
    const target = event.target as Element | null;
    const handle = target?.closest<HTMLElement>('[data-corner]');
    if (handle && overlay.contains(handle) && selected?.isConnected) {
      if (selected.getAttribute('data-image-locked') === 'true') return;
      const box = selected.getBoundingClientRect();
      const geometry = selected.tagName === 'IMG' ? imageGeometry(selected) : { width: box.width, height: box.height, angle: 0 };
      resize = { element: selected, handle, pointer: event.pointerId, x: event.clientX, y: event.clientY, left: box.left, top: box.top, width: geometry.width, height: geometry.height, angle: geometry.angle, corner: handle.dataset.corner!, dx: 0, dy: 0, moved: false };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault(); event.stopImmediatePropagation();
      return;
    }
    selected = target?.closest<HTMLElement>('div[data-danmaku-source], img:not([data-mce-object]):not([data-mce-placeholder])') ?? undefined;
    if (selected?.parentElement?.closest('div[data-danmaku-source]')) selected = undefined;
    // 弹幕按下事件由拖动逻辑接管，TinyMCE 不会自动取消上一张图片的选中状态。
    editor.selection.controlSelection.hideResizeRect();
    for (const previous of doc.body.querySelectorAll('img[data-mce-selected], div[data-danmaku-source][data-mce-selected]')) {
      previous.removeAttribute('data-mce-selected');
    }
    if (selected?.matches('div[data-danmaku-source]')) {
      editor.selection.setCursorLocation(selected, 0);
      editor.nodeChanged();
    }
    update();
  }
  function dimensions(current: NonNullable<typeof resize>) {
    const west = current.corner.includes('w'); const north = current.corner.includes('n');
    const local = rotatePoint(current.dx, current.dy, -current.angle);
    let width = Math.max(32, current.width + (west ? -local.x : local.x));
    let height = Math.max(32, current.height + (north ? -local.y : local.y));
    if (current.element.tagName === 'IMG') {
      const scale = Math.max(32 / current.width, 32 / current.height,
        Math.abs(local.x) >= Math.abs(local.y) ? width / current.width : height / current.height);
      width = current.width * scale; height = current.height * scale;
    }
    const dw = width - current.width, dh = height - current.height;
    const shift = rotatePoint((west ? -dw : dw) / 2, (north ? -dh : dh) / 2, current.angle);
    const radians = current.angle * Math.PI / 180;
    const visualDeltaX = Math.abs(Math.cos(radians)) * dw + Math.abs(Math.sin(radians)) * dh;
    const visualDeltaY = Math.abs(Math.sin(radians)) * dw + Math.abs(Math.cos(radians)) * dh;
    return { width, height, x: shift.x - visualDeltaX / 2, y: shift.y - visualDeltaY / 2, translateX: shift.x - dw / 2, translateY: shift.y - dh / 2 };
  }
  function move(event: PointerEvent) {
    if (!resize || resize.pointer !== event.pointerId) return;
    if (!resize.element.isConnected) { cancel(); return; }
    resize.dx = event.clientX - resize.x; resize.dy = event.clientY - resize.y;
    if (!resize.moved && Math.hypot(resize.dx, resize.dy) < 4) return;
    resize.moved = true;
    const size = dimensions(resize);
    const path: string[] = [];
    for (let node: Element | null = resize.element; node && node !== doc.body; node = node.parentElement) {
      path.unshift(`:nth-child(${Array.from(node.parentElement!.children).indexOf(node) + 1})`);
    }
    preview.textContent = `body > ${path.join(' > ')}{box-sizing:border-box!important;width:${size.width}px!important;height:${size.height}px!important;translate:${size.translateX}px ${size.translateY}px!important}`;
    update(); editor.dispatch('ScrollContent'); event.preventDefault(); event.stopImmediatePropagation();
  }
  function up(event: PointerEvent) {
    if (!resize || resize.pointer !== event.pointerId) return;
    const current = resize; const size = dimensions(current); cancel();
    if (!current.moved || !current.element.isConnected) return;
    const element = current.element;
    editor.undoManager.transact(() => {
      editor.dom.setStyles(element, { position: 'absolute', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0', boxSizing: 'border-box', width: `${size.width}px`, height: `${size.height}px` });
      const origin = element.getBoundingClientRect();
      const left = current.left + size.x - origin.left; const top = current.top + size.y - origin.top;
      editor.dom.setStyles(element, { left: `${left}px`, top: `${top}px` });
      if (element.matches('div[data-danmaku-source]')) {
        editor.dom.setAttribs(element, { 'data-danmaku-x': String(left), 'data-danmaku-y': String(top) });
      }
    });
    update(); editor.dispatch('ScrollContent'); editor.nodeChanged(); editor.dispatch('change');
    event.preventDefault(); event.stopImmediatePropagation();
  }
  function alignObject(event: { command: string; preventDefault: () => void }) {
    const ratios: Record<string, number> = { justifyleft: 0, justifycenter: 0.5, justifyright: 1 };
    const ratio = ratios[event.command.toLowerCase()];
    if (ratio === undefined || editor.mode.isReadOnly()) return;
    const node = editor.selection.getNode();
    const image = node.closest('img');
    const element = image ?? node.closest<HTMLElement>('div[data-danmaku-source]');
    if (!element || !doc.body.contains(element)) return;
    if (element.getAttribute('data-image-locked') === 'true') { event.preventDefault(); return; }
    const danmaku = element.matches('div[data-danmaku-source]');
    if (!danmaku && editor.getWin().getComputedStyle(element).position !== 'absolute') return;
    event.preventDefault();
    const before = element.getBoundingClientRect();
    const bounds = contentBounds(editor, element);
    const targetLeft = bounds.left + Math.max(0, bounds.width - before.width) * ratio;
    const format = ratio === 0 ? 'alignleft' : ratio === 1 ? 'alignright' : 'aligncenter';
    editor.undoManager.transact(() => {
      if (image) {
        for (const name of ['alignleft', 'aligncenter', 'alignright']) editor.formatter.remove(name, {}, image);
        editor.formatter.apply(format, {}, image);
      } else {
        editor.dom.setStyles(element, { position: 'absolute', width: `${before.width}px`, height: `${before.height}px`, boxSizing: 'border-box', margin: '0' });
      }
      editor.dom.setStyles(element, { left: '0px', top: '0px', right: 'auto', bottom: 'auto' });
      const origin = element.getBoundingClientRect();
      const left = targetLeft - origin.left; const top = before.top - origin.top;
      editor.dom.setStyles(element, { left: `${left}px`, top: `${top}px` });
      if (danmaku) editor.dom.setAttribs(element, { 'data-danmaku-x': String(left), 'data-danmaku-y': String(top) });
    });
    selected = element;
    update(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.nodeChanged(); editor.dispatch('change');
  }
  function key(event: KeyboardEvent) {
    if (event.key === 'Escape' && resize) { cancel(); event.preventDefault(); event.stopImmediatePropagation(); }
  }
  function reset() { cancel(); selected = undefined; update(); }
  const changes = new MutationObserver((records) => {
    if (records.some((record) => !overlay.contains(record.target))) update();
  });
  changes.observe(doc.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointermove', move, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true);
  doc.addEventListener('lostpointercapture', cancel, true);
  doc.addEventListener('keydown', key, true);
  doc.addEventListener('scroll', update, true);
  editor.on('BeforeExecCommand', alignObject);
  editor.on('BeforeSetContent TextBoxSelected', reset);
  editor.on('NodeChange Undo Redo ScrollContent ResizeContent SwitchMode DisabledStateChange', update);
  return () => {
    changes.disconnect(); selected = undefined; cancel(); overlay.remove(); preview.remove();
    doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('pointermove', move, true); doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointercancel', cancel, true); doc.removeEventListener('lostpointercapture', cancel, true); doc.removeEventListener('keydown', key, true); doc.removeEventListener('scroll', update, true);
    editor.off('BeforeExecCommand', alignObject);
    editor.off('BeforeSetContent TextBoxSelected', reset); editor.off('NodeChange Undo Redo ScrollContent ResizeContent SwitchMode DisabledStateChange', update);
  };
}
