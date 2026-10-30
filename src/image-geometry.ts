/** 图片的布局尺寸与旋转后的外接矩形分开计算，避免移动或缩放累积变形。 */
export function imageGeometry(element: HTMLElement) {
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const number = (value: string) => parseFloat(value) || 0;
  const width = number(style.width) + (style.boxSizing === 'border-box' ? 0 : number(style.paddingLeft) + number(style.paddingRight) + number(style.borderLeftWidth) + number(style.borderRightWidth));
  const height = number(style.height) + (style.boxSizing === 'border-box' ? 0 : number(style.paddingTop) + number(style.paddingBottom) + number(style.borderTopWidth) + number(style.borderBottomWidth));
  const angle = number(style.rotate);
  return { width: width || rect.width, height: height || rect.height, angle, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
}
export function rotatePoint(x: number, y: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return { x: x * Math.cos(radians) - y * Math.sin(radians), y: x * Math.sin(radians) + y * Math.cos(radians) };
}
