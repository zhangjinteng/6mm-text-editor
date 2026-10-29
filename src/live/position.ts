type PositionStyles = Record<string, string>;

/**
 * 将声明式像素坐标同步为布局样式，属性优先于旧的 left/top/inset。
 * 允许负数、小数；空值和非法值忽略，缺失的轴保留现有位置。没有有效坐标时不改变布局。
 */
export function applyDanmakuPosition(element: HTMLElement, setStyles?: (element: HTMLElement, styles: PositionStyles) => void): void {
  function coordinate(attribute: string) {
    const value = element.getAttribute(attribute)?.trim();
    if (!value || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? `${number}px` : undefined;
  }
  const x = coordinate('data-danmaku-x');
  const y = coordinate('data-danmaku-y');
  if (x === undefined && y === undefined) return;
  const styles: PositionStyles = { position: 'absolute', right: 'auto', bottom: 'auto', margin: '0' };
  styles.left = x ?? (element.style.left || '0px');
  styles.top = y ?? (element.style.top || '0px');
  if (setStyles) setStyles(element, styles);
  else for (const [property, value] of Object.entries(styles)) element.style.setProperty(property, value);
}
