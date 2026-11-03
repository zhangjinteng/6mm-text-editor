import type { Editor } from 'tinymce';
import { imageLayoutRect } from './image-animation';
import { imageGeometry } from './image-geometry';
import { isVerticalText } from './text-writing-mode';
import './layer-position.css';

export const layerPositions = [
  ['horizontal-center', '水平居中'], ['vertical-center', '垂直居中'],
  ['top', '贴顶部'], ['bottom', '贴底部'], ['center', '画布中心'],
  ['right', '贴右侧'], ['left', '贴左侧']
] as const;
export type LayerPosition = typeof layerPositions[number][0];
export const layerPositionControls = () => `<div class="layer-position-controls"><h3>图层位置</h3><div class="layer-position-actions" role="group" aria-label="图层位置">${layerPositions.map(([key, label]) => `<button type="button" data-position="${key}">${label}</button>`).join('')}</div></div>`;

export function readLayerPositions(editor: Editor, element: HTMLElement): LayerPosition[] {
  const rect = element.tagName === 'IMG' ? imageLayoutRect(element) : element.getBoundingClientRect();
  const canvas = editor.getBody().getBoundingClientRect();
  const near = (a: number, b: number) => Math.abs(a - b) < 1;
  const horizontal = near(rect.left + rect.width / 2, canvas.left + canvas.width / 2);
  const vertical = near(rect.top + rect.height / 2, canvas.top + canvas.height / 2);
  return layerPositions.filter(([key]) => ({ 'horizontal-center': horizontal, 'vertical-center': vertical,
    center: horizontal && vertical, left: near(rect.left, canvas.left), right: near(rect.right, canvas.right),
    top: near(rect.top, canvas.top), bottom: near(rect.bottom, canvas.bottom) })[key]).map(([key]) => key);
}

/** Place the object's static bounds against the canvas, independent of its paragraph or animation. Caller owns the undo transaction. */
export function positionLayer(editor: Editor, element: HTMLElement, position: LayerPosition) {
  if (!layerPositions.some(([key]) => key === position) || !element.isConnected || editor.mode.isReadOnly() ||
    element.matches('[data-image-locked="true"], [data-text-locked="true"]')) return;
  const image = element.tagName === 'IMG';
  const measure = () => image ? imageLayoutRect(element) : element.getBoundingClientRect();
  const before = measure(), canvas = editor.getBody().getBoundingClientRect();
  const x = position === 'left' ? canvas.left : position === 'right' ? canvas.right - before.width :
    position === 'center' || position === 'horizontal-center' ? canvas.left + (canvas.width - before.width) / 2 : before.left;
  const y = position === 'top' ? canvas.top : position === 'bottom' ? canvas.bottom - before.height :
    position === 'center' || position === 'vertical-center' ? canvas.top + (canvas.height - before.height) / 2 : before.top;
  const size = image ? imageGeometry(element) : { width: element.offsetWidth, height: element.offsetHeight };
  const verticalText = element.matches('[data-text-draggable]') && isVerticalText(element);
  editor.dom.setStyles(element, { position: 'absolute', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0',
    boxSizing: 'border-box', width: verticalText ? 'auto' : `${size.width}px`, ...(image ? { height: `${size.height}px` } : {}) });
  // Measure the actual containing block origin, including nested positioned parents and rotation.
  const origin = measure(), left = x - origin.left, top = y - origin.top;
  editor.dom.setStyles(element, { left: `${left}px`, top: `${top}px` });
  if (element.matches('[data-danmaku-source]')) editor.dom.setAttribs(element, { 'data-danmaku-x': String(left), 'data-danmaku-y': String(top) });
}
