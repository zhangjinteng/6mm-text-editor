import type { Editor } from 'tinymce';
import { isBlankSelection } from '../blank-selection';

/**
 * 编辑器内拖动弹幕、图片以及文字的独立手柄；文字本身保留原生编辑和框选。
 * 移动过程只用 head 中的临时 CSS，手柄位于正文之外，不污染保存内容。
 * 松开后一次性提交绝对坐标并建立一个撤销步骤，取消/源码替换/销毁时释放捕获。
 */
export function enableDanmakuDragging(editor: Editor): () => void {
  const doc = editor.getDoc();
  const view = editor.getWin();
  const selector = 'div[data-danmaku-source]:not([data-danmaku-draggable="false"]), img:not([data-mce-object]):not([data-mce-placeholder])';
  const style = doc.createElement('style');
  const cursorRules = `${selector}{cursor:grab;touch-action:none} div[data-danmaku-source] *{user-select:none}`;
  style.textContent = cursorRules; doc.head.append(style);
  let activeText: HTMLElement | undefined;
  const handle = doc.createElement('button');
  handle.type = 'button';
  handle.contentEditable = 'false';
  handle.setAttribute('data-mce-bogus', 'all');
  handle.setAttribute('data-text-move-handle', 'true');
  handle.setAttribute('aria-label', '拖动文字');
  handle.title = '拖动文字';
  handle.style.cssText = 'display:none;position:fixed;width:26px;height:26px;padding:4px;border:1px solid #b8cfc3;border-radius:5px;background:#fff;color:#147d64;box-shadow:0 2px 6px #0002;z-index:2147483646;cursor:grab;touch-action:none;align-items:center;justify-content:center';
  handle.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4"/></svg>';
  doc.documentElement.append(handle);
  function positionHandle() {
    if (!activeText?.isConnected || isBlankSelection(editor) || editor.mode.isReadOnly()) { handle.style.display = 'none'; return; }
    if (!handle.isConnected) doc.documentElement.append(handle);
    const box = activeText.getBoundingClientRect();
    Object.assign(handle.style, { display: 'flex', left: `${Math.max(0, Math.min(view.innerWidth - 28, box.left >= 30 ? box.left - 29 : box.right + 3))}px`, top: `${Math.max(0, Math.min(view.innerHeight - 28, box.top))}px` });
  }
  function selectionChanged() {
    if (drag) return;
    activeText = editor.selection.getNode().closest<HTMLElement>('span[data-text-draggable]') ?? undefined;
    const range = editor.selection.getRng();
    if (!activeText && !range.collapsed) {
      const start = range.cloneRange(); start.collapse(true);
      const end = range.cloneRange(); end.collapse(false);
      const candidates = Array.from(editor.getBody().querySelectorAll<HTMLElement>('span[data-text-draggable]'))
        .filter(element => {
          // 只比较有实际重叠的内容，排除仅与选区端点相接的相邻文字块。
          const first = doc.createRange(); first.selectNodeContents(element); first.collapse(true);
          const last = doc.createRange(); last.selectNodeContents(element); last.collapse(false);
          return start.compareBoundaryPoints(Range.START_TO_START, last) < 0 &&
            end.compareBoundaryPoints(Range.START_TO_START, first) > 0;
        })
        .filter(element => !element.parentElement?.closest('span[data-text-draggable]'));
      // 跨多个独立文字块时不任意挑选一个，避免拖错对象。
      if (candidates.length === 1) activeText = candidates[0];
    }
    positionHandle();
  }
  function hover(event: PointerEvent) {
    if (drag || handle.contains(event.target as Node)) return;
    const text = (event.target as Element | null)?.closest<HTMLElement>('span[data-text-draggable]');
    if (text) { activeText = text; positionHandle(); }
  }
  let drag: { element: HTMLElement; capture: HTMLElement; pointer: number; x: number; y: number; left: number; top: number; width: number; transform: string; dx: number; dy: number; moved: boolean } | undefined;

  function updateSelectionControls(element: HTMLElement) {
    positionHandle();
    editor.dispatch('ResizeContent');
    if (element.isConnected && !editor.removed) {
      // 图片和弹幕共用的浮动工具条按当前可视边界重新定位。
      editor.dispatch('ScrollContent');
    }
  }
  function cancel() {
    const current = drag; drag = undefined;
    style.textContent = cursorRules;
    if (current?.moved) updateSelectionControls(current.element);
    if (current?.capture.hasPointerCapture(current.pointer)) current.capture.releasePointerCapture(current.pointer);
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || editor.mode.isReadOnly() || drag) return;
    const target = event.target as Element | null;
    const movingText = !!target && handle.contains(target);
    const text = target?.closest<HTMLElement>('span[data-text-draggable]');
    if (text && !movingText) { activeText = text; positionHandle(); return; }
    const element = movingText ? activeText : target?.closest<HTMLElement>(selector);
    if (!movingText) { activeText = undefined; positionHandle(); }
    if (!element || !editor.getBody().contains(element) || element.parentElement?.closest('div[data-danmaku-source]')) return;
    const rect = element.getBoundingClientRect();
    drag = { element, capture: movingText ? handle : element, pointer: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width,
      transform: view.getComputedStyle(element).transform, dx: 0, dy: 0, moved: false };
    drag.capture.setPointerCapture(event.pointerId);
    // 图片的默认按下事件交给 TinyMCE，保留选中工具条和缩放手柄。
    if (movingText || element.matches('div[data-danmaku-source]')) { event.preventDefault(); event.stopPropagation(); }
  }
  function move(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    if (!drag.element.isConnected) { cancel(); return; }
    drag.dx = event.clientX - drag.x; drag.dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(drag.dx, drag.dy) < 4) return;
    drag.moved = true;
    const path: string[] = [];
    for (let node: Element | null = drag.element; node && node !== editor.getBody(); node = node.parentElement) {
      path.unshift(`:nth-child(${Array.from(node.parentElement!.children).indexOf(node) + 1})`);
    }
    const previewSelector = `body > ${path.join(' > ')}`;
    const transform = drag.transform === 'none' ? '' : drag.transform;
    style.textContent = `${cursorRules}\n${previewSelector}{transform:translate(${drag.dx}px,${drag.dy}px) ${transform} !important;cursor:grabbing!important}`;
    // 位移只发生在预览 CSS 中，需显式让 TinyMCE 重新计算四角手柄。
    updateSelectionControls(drag.element);
    event.preventDefault(); event.stopPropagation();
  }
  function up(event: PointerEvent) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const current = drag;
    cancel();
    if (!current.moved || !current.element.isConnected) return;
    const element = current.element;
    editor.undoManager.transact(() => {
      // 先得到真实定位包含块的零点，兼容文档滚动和相对定位的父容器。
      const fixedWidth = element.style.width;
      editor.dom.setStyles(element, { position: 'absolute', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0' });
      if (element.tagName === 'IMG' || !fixedWidth || fixedWidth === 'auto') editor.dom.setStyle(element, 'width', `${current.width}px`);
      const origin = element.getBoundingClientRect();
      const left = current.left + current.dx - origin.left;
      const top = current.top + current.dy - origin.top;
      editor.dom.setStyles(element, { left: `${left}px`, top: `${top}px` });
      // 声明坐标是绑定同步时的位置来源，必须与样式在同一撤销步骤中更新。
      if (element.matches('div[data-danmaku-source]')) {
        editor.dom.setAttribs(element, { 'data-danmaku-x': String(left), 'data-danmaku-y': String(top) });
      }
    });
    updateSelectionControls(element);
    editor.nodeChanged(); editor.dispatch('change');
    event.preventDefault(); event.stopPropagation();
  }
  function nativeDrag(event: DragEvent) {
    if (drag) {
      event.preventDefault();
      // 自定义拖动接管后不进入 TinyMCE 的原生拖放状态，否则工具条会一直暂停更新。
      event.stopImmediatePropagation();
    }
  }
  function key(event: KeyboardEvent) {
    if (event.key === 'Escape' && drag) { cancel(); event.preventDefault(); event.stopPropagation(); }
  }
  doc.addEventListener('pointerover', hover, true);
  doc.addEventListener('scroll', positionHandle, true);
  editor.on('NodeChange SelectionChange SetContent Undo Redo SwitchMode DisabledStateChange input', selectionChanged);
  editor.on('ScrollContent ResizeContent', positionHandle);
  doc.addEventListener('dragstart', nativeDrag, true);
  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointermove', move, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true);
  doc.addEventListener('lostpointercapture', cancel, true);
  doc.addEventListener('keydown', key, true);
  editor.on('BeforeSetContent', cancel);
  return () => {
    cancel(); style.remove(); handle.remove();
    doc.removeEventListener('pointerover', hover, true);
    doc.removeEventListener('scroll', positionHandle, true);
    editor.off('NodeChange SelectionChange SetContent Undo Redo SwitchMode DisabledStateChange input', selectionChanged);
    editor.off('ScrollContent ResizeContent', positionHandle);
    doc.removeEventListener('dragstart', nativeDrag, true);
    doc.removeEventListener('pointerdown', down, true);
    doc.removeEventListener('pointermove', move, true);
    doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointercancel', cancel, true);
    doc.removeEventListener('lostpointercapture', cancel, true);
    doc.removeEventListener('keydown', key, true);
    editor.off('BeforeSetContent', cancel);
  };
}
