export interface TextShadow {
  visible: boolean;
  color: string;
  opacity: number;
  distance: number;
  angle: number;
  blur: number;
}
export const newShadow = (): TextShadow => ({ visible: true, color: '#000000', opacity: 50, distance: 8, angle: -45, blur: 4 });
const round = (value: number, precision = 3) => Number(value.toFixed(precision));
/** Positive angles turn toward the top of the canvas; -45° points down and right. */
export function shadowOffsets(shadow: TextShadow) {
  const radians = shadow.angle * Math.PI / 180;
  return { x: round(shadow.distance * Math.cos(radians)), y: round(-shadow.distance * Math.sin(radians)) };
}
export function shadowPolar(x: number, y: number, fallbackAngle = -45) {
  return { distance: round(Math.hypot(x, y), 6), angle: x === 0 && y === 0 ? (Number.isFinite(fallbackAngle) ? fallbackAngle : -45) : round(Math.atan2(-y, x) * 180 / Math.PI, 6) };
}
export function parseShadowColor(value: string, doc: Document): { color: string; opacity?: number } | undefined {
  if (!/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(value.trim())) return;
  const probe = doc.createElement('span'); probe.style.color = value; if (!probe.style.color) return;
  const context = doc.createElement('canvas').getContext('2d')!; context.fillStyle = value;
  const normalized = context.fillStyle;
  const alpha = /^rgba\(|^#[\da-f]{4}$|^#[\da-f]{8}$|^transparent$/i.test(value.trim());
  if (/^#[\da-f]{6}$/i.test(normalized)) return { color: normalized, ...(alpha ? { opacity: 100 } : {}) };
  const channels = normalized.match(/[\d.]+/g)?.map(Number);
  if (!channels || channels.length < 3) return;
  return { color: '#' + channels.slice(0, 3).map(channel => Math.round(channel).toString(16).padStart(2, '0')).join(''), ...(alpha ? { opacity: Math.round((channels[3] ?? 1) * 100) } : {}) };
}
export function validateShadow(shadow: TextShadow | null): string {
  if (shadow === null) return '';
  if (typeof shadow !== 'object' || typeof shadow.visible !== 'boolean' || !/^#[\da-f]{6}$/i.test(shadow.color)) return '请输入有效的投影颜色。';
  for (const [name, min, max] of [['opacity', 0, 100], ['distance', 0, 200], ['angle', -180, 180], ['blur', 0, 100]] as const) {
    const value = shadow[name]; if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) return '投影不透明度为 0—100%，距离为 0—200 px，角度为 −180—180°，模糊度为 0—100 px。';
  }
  return '';
}
export function readShadow(box: HTMLElement): TextShadow | null {
  if (box.dataset.textShadow) {
    try { const saved: TextShadow = JSON.parse(box.dataset.textShadow); if (saved && !validateShadow(saved)) return saved; } catch { /* Read legacy CSS. */ }
  }
  const css = box.style.textShadow;
  if (!css || css === 'none') return null;
  const offsets = css.match(/-?\d+(?:\.\d+)?px/g) ?? [];
  const color = parseShadowColor(css.replace(/-?\d+(?:\.\d+)?px/g, '').trim(), box.ownerDocument);
  if (offsets.length < 2 || !color) return null;
  const shadow = { ...newShadow(), color: color.color, opacity: color.opacity ?? 100, ...shadowPolar(parseFloat(offsets[0]!), parseFloat(offsets[1]!)), blur: parseFloat(offsets[2] ?? '') || 0 };
  return validateShadow(shadow) ? null : shadow;
}
export function shadowCss(shadow: TextShadow | null): string {
  if (!shadow?.visible) return '';
  const { x, y } = shadowOffsets(shadow);
  const rgb = [1, 3, 5].map(index => parseInt(shadow.color.slice(index, index + 2), 16));
  return `rgba(${rgb.join(',')},${shadow.opacity / 100}) ${x}px ${y}px ${shadow.blur}px`;
}
export function writeShadow(box: HTMLElement, shadow: TextShadow | null) {
  if (shadow) box.dataset.textShadow = JSON.stringify(shadow); else box.removeAttribute('data-text-shadow');
  box.style.textShadow = shadowCss(shadow);
  for (const child of box.querySelectorAll<HTMLElement>('[style]')) { child.style.textShadow = ''; child.removeAttribute('data-mce-style'); }
}
