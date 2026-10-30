import { backgroundPresets, backgroundShapes, drawBackground, newBackground, validateBackground, presetBackground, type TextBackground, type BackgroundShape } from './text-background';
import { parseShadowColor as parseColor } from './text-shadow';
import { svgNode } from './text-stroke';

const eye = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 3 18 18M10 5c7-1 12 7 12 7s-2 3-5 5M6 6c-3 2-4 6-4 6s4 7 10 7l3-1"/></svg>';
type Numeric = 'opacity' | 'expandX' | 'expandY' | 'radius' | 'scaleX' | 'scaleY' | 'offsetX' | 'offsetY';
const range = (key: Numeric, label: string, min: number, max: number, unit = 'px') => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" data-background-key="${key}" aria-label="${label}"><small>${unit}</small></span></span><input type="range" data-background-range="${key}" aria-label="${label}滑块" min="${min}" max="${max}"></label>`;
function thumbnail(doc: Document, background: TextBackground | null): SVGSVGElement {
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 72 60'); svg.setAttribute('aria-hidden', 'true');
  if (!background) { svgNode(doc, 'path', { d: 'M27 21 45 39', fill: 'none', stroke: '#8c9b91', 'stroke-width': '1.2' }, svg); return svg; }
  if (validateBackground(background)) background = newBackground();
  const multiline = background.layout !== 'box';
  const rects = multiline ? [{ x: 11, y: 10, width: 50, height: 22 }, { x: 11, y: 32, width: 35, height: 19 }] : [{ x: 9, y: 16, width: 54, height: 29 }];
  drawBackground(svg, { ...background, radius: Math.min(8, background.radius) }, rects);
  const text = (content: string, x: number, y: number) => { svgNode(doc, 'text', { x: String(x), y: String(y), fill: '#28362f', 'font-size': '18', 'font-weight': '600', 'font-family': 'Arial,sans-serif', 'text-anchor': 'middle' }, svg).textContent = content; };
  if (multiline) { text('Abc', 36, 28); text('Ab', 28, 47); } else text('Abc', 36, 37);
  return svg;
}
export function createBackgroundEditor(doc: Document, initial: TextBackground | null, change: (value: TextBackground | null) => void) {
  const root = doc.createElement('div'); root.className = 'text-background-editor';
  root.innerHTML = `<div class="text-background-status"><strong>背景</strong><span data-background-state></span><div><button type="button" data-background-add aria-label="添加背景" title="添加背景">＋</button><button type="button" data-background-settings aria-label="背景设置" title="背景设置" aria-expanded="true"><i data-background-swatch></i><span>⌃</span></button><button type="button" data-background-visibility></button><button type="button" data-background-delete aria-label="删除背景" title="删除背景">−</button></div></div><div data-background-controls><div class="text-background-presets" role="listbox" aria-label="背景样式"></div><div class="text-background-properties" data-background-properties hidden><p class="text-background-hidden-note" data-background-hidden hidden>背景已隐藏，样式和参数会保留。</p><label class="text-settings-color">背景颜色<span><input type="color" data-background-color aria-label="背景颜色色板"><input type="text" data-background-key="color" aria-label="背景颜色" spellcheck="false"></span></label>
    ${range('opacity', '背景不透明度', 0, 100, '%')}
    <label class="text-settings-select">背景布局<select data-background-key="layout" aria-label="背景布局"><option value="box">整体背景</option><option value="lines">逐行背景</option><option value="connected">连体背景</option></select></label>
    <label class="text-settings-select" data-background-shape-control>背景轮廓<select data-background-key="shape" aria-label="背景轮廓">${Object.entries(backgroundShapes).map(([key, name]) => `<option value="${key}">${name}</option>`).join('')}</select></label>
    ${range('expandX', '水平扩张', 0, 100)}${range('expandY', '垂直扩张', 0, 100)}
    <div data-background-radius-control>${range('radius', '背景圆角', 0, 100)}</div><p class="text-settings-hint">扩张只增加底色留白，不改变文字换行。连体背景连接相邻文字行；弧形文字使用整体轮廓。</p>
    <details class="text-background-layout"><summary>尺寸与偏移</summary>${range('scaleX', '背景宽度', 10, 300, '%')}${range('scaleY', '背景高度', 10, 300, '%')}${range('offsetX', '背景水平偏移', -200, 200)}${range('offsetY', '背景垂直偏移', -200, 200)}<button type="button" data-background-reset-layout>重置背景布局</button></details></div></div>`;
  let value = structuredClone(initial), expanded = true;
  const list = root.querySelector<HTMLElement>('.text-background-presets')!, controls = root.querySelector<HTMLElement>('[data-background-controls]')!, properties = root.querySelector<HTMLElement>('[data-background-properties]')!, visibility = root.querySelector<HTMLButtonElement>('[data-background-visibility]')!;
  function option(id: string, label: string, model: TextBackground | null) {
    const button = doc.createElement('button'); button.type = 'button'; button.dataset.backgroundPreset = id; button.setAttribute('role', 'option'); button.setAttribute('aria-label', label); button.title = label;
    button.append(thumbnail(doc, model)); const caption = doc.createElement('span'); caption.textContent = label.replace('背景', '') || '背景'; button.append(caption); list.append(button);
  }
  option('none', '无背景', null); for (const [id, preset] of Object.entries(backgroundPresets)) option(id, preset.label, presetBackground(id));
  const show = (selector: string, visible: boolean) => { root.querySelector<HTMLElement>(selector)!.hidden = !visible; };
  function refresh() {
    show('[data-background-add]', !value); show('[data-background-settings]', !!value); show('[data-background-visibility]', !!value); show('[data-background-delete]', !!value); properties.hidden = !value; controls.hidden = !expanded;
    const settings = root.querySelector<HTMLButtonElement>('[data-background-settings]')!; settings.setAttribute('aria-expanded', String(expanded)); settings.querySelector('span')!.textContent = expanded ? '⌃' : '⌄';
    root.querySelector('[data-background-state]')!.textContent = value && !value.visible ? '已隐藏' : '';
    let custom = list.querySelector<HTMLButtonElement>('[data-background-preset="custom"]');
    if (value?.preset === 'custom') { if (!custom) { option('custom', '自定义背景', value); custom = list.querySelector('[data-background-preset="custom"]'); } const svg = custom!.querySelector('svg')!; svg.replaceWith(thumbnail(doc, value)); }
    else custom?.remove();
    const selected = value?.preset ?? 'none'; list.querySelectorAll<HTMLButtonElement>('[data-background-preset]').forEach(button => { button.setAttribute('aria-selected', String(button.dataset.backgroundPreset === selected)); button.tabIndex = button.dataset.backgroundPreset === selected ? 0 : -1; });
    if (!value) return;
    const label = value.visible ? '隐藏背景' : '显示背景';
    // Keep the pointer target intact when an input loses focus immediately before a click.
    if (visibility.getAttribute('aria-label') !== label) { visibility.setAttribute('aria-label', label); visibility.title = label; visibility.setAttribute('aria-pressed', String(value.visible)); visibility.innerHTML = value.visible ? eye : eyeOff; }
    root.querySelector<HTMLElement>('[data-background-swatch]')!.style.backgroundColor = value.color;
    show('[data-background-hidden]', !value.visible); show('[data-background-shape-control]', value.layout !== 'connected'); show('[data-background-radius-control]', value.layout === 'connected' || ['rect', 'rounded', 'bevel'].includes(value.shape));
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-background-key],[data-background-range]').forEach(input => {
      if (doc.activeElement === input) return;
      const key = input.dataset.backgroundKey || input.dataset.backgroundRange; const saved = value![key as keyof TextBackground]; input.value = typeof saved === 'number' && !Number.isFinite(saved) ? '' : String(saved);
    });
    if (/^#[\da-f]{6}$/i.test(value.color)) root.querySelector<HTMLInputElement>('[data-background-color]')!.value = value.color;
  }
  const changed = () => { change(structuredClone(value)); refresh(); };
  root.addEventListener('input', event => {
    if (!value) return;
    const input = event.target as HTMLInputElement; const key = input.dataset.backgroundKey || input.dataset.backgroundRange || (input.hasAttribute('data-background-color') ? 'color' : undefined); if (!key) return;
    if (key === 'color') { const parsed = parseColor(input.value, doc); value.color = parsed?.color ?? input.value; if (parsed?.opacity !== undefined) value.opacity = parsed.opacity; }
    else if (key === 'layout') { value.layout = input.value as TextBackground['layout']; if (value.layout === 'connected') value.shape = 'rounded'; }
    else if (key === 'shape') value.shape = input.value as BackgroundShape;
    else Object.assign(value, { [key]: input.value.trim() ? Number(input.value) : NaN });
    value.preset = 'custom'; changed();
  });
  root.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button'); if (!button) return;
    const preset = button.dataset.backgroundPreset;
    if (preset === 'none') { value = null; expanded = true; changed(); }
    else if (preset && preset !== 'custom' && Object.hasOwn(backgroundPresets, preset)) { value = presetBackground(preset); expanded = true; changed(); }
    if (button.hasAttribute('data-background-add')) { value = newBackground(); expanded = true; changed(); }
    if (button.hasAttribute('data-background-settings')) { expanded = !expanded; refresh(); }
    if (button.hasAttribute('data-background-delete')) { value = null; expanded = true; changed(); root.querySelector<HTMLButtonElement>('[data-background-add]')!.focus({ preventScroll: true }); }
    if (button.hasAttribute('data-background-visibility') && value) { value.visible = !value.visible; changed(); }
    if (button.hasAttribute('data-background-reset-layout') && value) { Object.assign(value, { expandX: 10, expandY: 6, scaleX: 100, scaleY: 100, offsetX: 0, offsetY: 0, preset: 'custom' }); changed(); }
  });
  list.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    const options = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-background-preset]')), index = options.indexOf(event.target as HTMLButtonElement); if (index < 0) return;
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.key] ?? 0;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.max(0, Math.min(options.length - 1, index + delta));
    event.preventDefault(); options[next]!.focus(); options[next]!.click();
  });
  root.addEventListener('focusout', () => refresh()); refresh();
  return { element: root, reset(model: TextBackground | null) { value = structuredClone(model); expanded = true; refresh(); } };
}
