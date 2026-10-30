import type { Editor } from 'tinymce';
import { imageGeometry } from '../image-geometry';

/**
 * 编辑器内拖动弹幕和图片；文字由文本框交互控制器处理。
 * 移动过程只用 head 中的临时 CSS，辅助层位于正文之外，不污染保存内容。
 * 松开后一次性提交绝对坐标并建立一个撤销步骤，取消/源码替换/销毁时释放捕获。
 */
export function enableDanmakuDragging(editor: Editor): () => void {
  const doc = editor.getDoc();
  const selector = 'div[data-danmaku-source]:not([data-danmaku-draggable="false"]), img:not([data-mce-object]):not([data-mce-placeholder])';
  const style = doc.createElement('style');
  const cursorRules = `${selector}{cursor:grab;touch-action:none} div[data-danmaku-source] *{user-select:none}`;
  style.textContent = cursorRules; doc.head.append(style);
  let drag: { element: HTMLElement; capture: HTMLElement; pointer: number; x: number; y: number; left: number; top: number; width: number; dx: number; dy: number; moved: boolean } | undefined;

  function updateSelectionControls(element: HTMLElement) {
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
    const element = target?.closest<HTMLElement>(selector);
    if (!element || !editor.getBody().contains(element) || element.parentElement?.closest('div[data-danmaku-source]')) return;
    if (element.getAttribute('data-image-locked') === 'true') return;
    const rect = element.getBoundingClientRect();
    drag = { element, capture: element, pointer: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: element.tagName === 'IMG' ? imageGeometry(element).width : rect.width,
      dx: 0, dy: 0, moved: false };
    drag.capture.setPointerCapture(event.pointerId);
    // 图片的默认按下事件交给 TinyMCE，保留选中工具条和缩放手柄。
    if (element.matches('div[data-danmaku-source]')) { event.preventDefault(); event.stopPropagation(); }
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
    // translate 独立于 rotate/scale，鼠标沿屏幕方向移动，翻转后也不会反向。
    style.textContent = `${cursorRules}\n${previewSelector}{translate:${drag.dx}px ${drag.dy}px!important;cursor:grabbing!important}`;
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
    if ((event.target as Element | null)?.closest('img[data-image-locked="true"]')) {
      event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    if (drag) {
      event.preventDefault();
      // 自定义拖动接管后不进入 TinyMCE 的原生拖放状态，否则工具条会一直暂停更新。
      event.stopImmediatePropagation();
    }
  }
  function key(event: KeyboardEvent) {
    if (event.key === 'Escape' && drag) { cancel(); event.preventDefault(); event.stopPropagation(); }
  }
  doc.addEventListener('dragstart', nativeDrag, true);
  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointermove', move, true);
  doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true);
  doc.addEventListener('lostpointercapture', cancel, true);
  doc.addEventListener('keydown', key, true);
  editor.on('BeforeSetContent', cancel);
  return () => {
    cancel(); style.remove();
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
