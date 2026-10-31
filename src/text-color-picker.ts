import { parseShadowColor } from './text-shadow';
import './text-color-picker.css';

type Color = { hex: string; alpha: number };
type Binding = { native: HTMLInputElement; field: HTMLInputElement; button: HTMLButtonElement; opacity?: HTMLInputElement; transparency: boolean };
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const rgb = (hex: string) => [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16));
function hsv(hex: string) {
  const [r, g, b] = rgb(hex).map(n => n / 255), max = Math.max(r!, g!, b!), min = Math.min(r!, g!, b!), delta = max - min;
  const h = !delta ? 0 : max === r ? ((g! - b!) / delta) % 6 : max === g ? (b! - r!) / delta + 2 : (r! - g!) / delta + 4;
  return { h: (h * 60 + 360) % 360, s: max ? delta / max : 0, v: max };
}
function hex(h: number, s: number, v: number) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const values = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + values.map(n => Math.round((n + m) * 255).toString(16).padStart(2, '0')).join('');
}

/** Enhance every color field, including dynamically rebuilt fill layers and gradient stops. */
export function installColorPickers(root: HTMLElement, artwork: Document, popupHost: HTMLElement = root) {
  const doc = root.ownerDocument, view = doc.defaultView!;
  const bindings = new Map<HTMLInputElement, Binding>();
  let active: Binding | undefined, popup: HTMLElement | undefined, disposed = false, pointer: number | undefined;
  let escaping = false;
  let state = { h: 0, s: 0, v: 0, alpha: 100 }, eyeAbort: AbortController | undefined;
  const parse = (value: string): Color | undefined => {
    const parsed = parseShadowColor(value.trim(), doc);
    return parsed ? { hex: parsed.color, alpha: parsed.opacity ?? 100 } : undefined;
  };
  function read(binding: Binding): Color {
    const color = parse(binding.field.value) ?? { hex: '#000000', alpha: 100 };
    if (binding.opacity) {
      const amount = Number(binding.opacity.value) / 100;
      color.alpha = Math.round(color.alpha * clamp(binding.transparency ? 1 - amount : amount));
    }
    return color;
  }
  function close(restore = false) {
    const anchor = active?.button;
    eyeAbort?.abort(); eyeAbort = undefined; pointer = undefined;
    popup?.remove(); popup = undefined; active = undefined;
    anchor?.setAttribute('aria-expanded', 'false');
    if (restore && anchor?.isConnected) anchor.focus({ preventScroll: true });
  }
  function swatches() {
    for (const binding of bindings.values()) {
      const color = read(binding);
      binding.button.style.setProperty('--picked-color', `rgba(${rgb(color.hex).join(',')},${color.alpha / 100})`);
      binding.button.disabled = binding.native.disabled || binding.field.disabled;
    }
  }
  function artworkColors() {
    const colors = new Set<string>(['#000000', '#ffffff']);
    const add = (value: string) => { const color = parse(value); if (color && color.alpha > 0) colors.add(color.hex.toLowerCase()); };
    for (const binding of bindings.values()) add(binding.field.value);
    for (const node of artwork.body.querySelectorAll<HTMLElement>('[style],[data-text-fills],[data-text-shadow],[data-text-background-settings],[data-image-settings]')) {
      if (node.closest('[data-mce-bogus],[data-text-render],[data-text-background-render]')) continue;
      for (const property of ['color', 'background-color', 'border-color', '-webkit-text-stroke-color']) add(node.style.getPropertyValue(property));
      add(node.dataset.textStrokeColor ?? '');
      for (const attribute of ['data-text-fills', 'data-text-shadow', 'data-text-background-settings', 'data-image-settings']) {
        const visit = (value: unknown) => {
          if (!value || typeof value !== 'object') return;
          for (const [key, entry] of Object.entries(value)) {
            if (['color', 'shadowColor', 'strokeColor'].includes(key) && typeof entry === 'string') add(entry);
            else if (entry && typeof entry === 'object') visit(entry);
          }
        };
        try { visit(JSON.parse(node.getAttribute(attribute) ?? 'null')); } catch { /* Ignore malformed imported settings. */ }
      }
      if (colors.size >= 20) break;
    }
    return [...colors].slice(0, 20);
  }
  function position() {
    if (!popup || !active) return;
    if (!active.button.isConnected || !active.button.getClientRects().length) { close(); return; }
    const anchor = active.button.getBoundingClientRect(), bounds = popup.getBoundingClientRect();
    const left = anchor.left - bounds.width - 12 >= 12 ? anchor.left - bounds.width - 12 : anchor.right + bounds.width + 12 <= view.innerWidth ? anchor.right + 12 : anchor.right - bounds.width;
    popup.style.left = `${clamp(left, 12, Math.max(12, view.innerWidth - bounds.width - 12))}px`;
    popup.style.top = `${clamp(anchor.top - 24, 12, Math.max(12, view.innerHeight - bounds.height - 12))}px`;
  }
  function paint() {
    if (!popup) return;
    const color = hex(state.h, state.s, state.v), sv = popup.querySelector<HTMLElement>('[data-picker-sv]')!;
    sv.style.backgroundColor = `hsl(${state.h},100%,50%)`;
    sv.setAttribute('aria-valuenow', String(Math.round(state.s * 100)));
    sv.setAttribute('aria-valuetext', `饱和度 ${Math.round(state.s * 100)}%，明度 ${Math.round(state.v * 100)}%`);
    const cursor = sv.querySelector<HTMLElement>('i')!; cursor.style.left = `${state.s * 100}%`; cursor.style.top = `${(1 - state.v) * 100}%`;
    cursor.style.backgroundColor = color;
    const hue = popup.querySelector<HTMLInputElement>('[data-picker-hue]')!, alpha = popup.querySelector<HTMLInputElement>('[data-picker-alpha]')!;
    hue.value = String(state.h); alpha.value = String(state.alpha);
    alpha.style.setProperty('--alpha-color', color);
    const code = popup.querySelector<HTMLInputElement>('[data-picker-hex]')!, opacity = popup.querySelector<HTMLInputElement>('[data-picker-opacity]')!;
    if (doc.activeElement !== code) code.value = color;
    if (doc.activeElement !== opacity) opacity.value = `${state.alpha}%`;
    popup.querySelectorAll<HTMLButtonElement>('[data-picker-swatch]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pickerSwatch === color)));
  }
  function change() {
    if (!active || !popup || !active.field.isConnected || active.field.disabled) return;
    const color = hex(state.h, state.s, state.v);
    // Editors with a separate opacity model consume RGBA in one input event.
    active.field.value = active.opacity || state.alpha !== 100 ? `rgba(${rgb(color).join(',')},${state.alpha / 100})` : color;
    active.field.dispatchEvent(new Event('input', { bubbles: true }));
    swatches(); paint();
  }
  function setColor(color: Color) {
    const next = hsv(color.hex);
    state = { ...next, h: next.s === 0 ? state.h : next.h, alpha: color.alpha }; change();
  }
  function open(binding: Binding) {
    if (active === binding) { close(true); return; }
    close(); active = binding;
    const initial = read(binding); state = { ...hsv(initial.hex), alpha: initial.alpha };
    popup = doc.createElement('div'); popup.className = 'text-color-popover'; popup.setAttribute('popover', 'manual');
    popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', `${binding.field.getAttribute('aria-label')}颜色选择器`);
    popup.innerHTML = `<div class="text-color-heading"><strong>颜色</strong><button type="button" data-picker-close aria-label="关闭颜色选择器">×</button></div>
      <div class="text-color-sv" data-picker-sv role="slider" tabindex="0" aria-label="饱和度与明度" aria-valuemin="0" aria-valuemax="100"><i></i></div>
      <input class="text-color-hue" type="range" min="0" max="359" step="1" data-picker-hue aria-label="色相">
      <input class="text-color-alpha" type="range" min="0" max="100" step="1" data-picker-alpha aria-label="颜色不透明度滑块">
      <div class="text-color-values"><button type="button" data-picker-eye aria-label="屏幕取色" title="屏幕取色"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m15 5 4 4M4 16l9-9 4 4-9 9H4v-4ZM14 6l3-3a2.1 2.1 0 0 1 3 3l-3 3"/></svg></button><input type="text" data-picker-hex aria-label="HEX 颜色" spellcheck="false" maxlength="9"><input type="text" inputmode="decimal" data-picker-opacity aria-label="颜色不透明度" maxlength="5"></div>
      <p class="text-color-error" role="status" hidden></p><div class="text-color-palette-title">当前作品<span>⌄</span></div><div class="text-color-palette" role="group" aria-label="当前作品颜色"></div>`;
    const surface = popup;
    popupHost.append(surface); surface.showPopover?.(); binding.button.setAttribute('aria-expanded', 'true');
    const palette = surface.querySelector('.text-color-palette')!;
    for (const color of artworkColors()) {
      const button = doc.createElement('button'); button.type = 'button'; button.dataset.pickerSwatch = color;
      button.style.backgroundColor = color; button.setAttribute('aria-label', `使用颜色 ${color}`); button.title = color;
      button.addEventListener('click', () => setColor({ hex: color, alpha: state.alpha })); palette.append(button);
    }
    const message = (text = '') => { const error = surface.querySelector<HTMLElement>('.text-color-error')!; error.textContent = text; error.hidden = !text; };
    surface.querySelector('[data-picker-close]')!.addEventListener('click', () => close(true));
    const sv = surface.querySelector<HTMLElement>('[data-picker-sv]')!;
    const point = (event: PointerEvent) => { const bounds = sv.getBoundingClientRect(); state.s = clamp((event.clientX - bounds.left) / bounds.width); state.v = 1 - clamp((event.clientY - bounds.top) / bounds.height); change(); };
    sv.addEventListener('pointerdown', event => { if (event.button !== 0) return; pointer = event.pointerId; sv.focus({ preventScroll: true }); sv.setPointerCapture(pointer); event.preventDefault(); point(event); });
    sv.addEventListener('pointermove', event => { if (pointer === event.pointerId) point(event); });
    sv.addEventListener('pointerup', () => { pointer = undefined; }); sv.addEventListener('pointercancel', () => { pointer = undefined; });
    sv.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); const step = event.shiftKey ? .1 : .01;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') state.s = clamp(state.s + (event.key === 'ArrowRight' ? step : -step));
      else if (event.key === 'Home' || event.key === 'End') state.v = event.key === 'Home' ? 0 : 1;
      else state.v = clamp(state.v + (event.key === 'ArrowUp' ? step : -step));
      change();
    });
    surface.querySelector<HTMLInputElement>('[data-picker-hue]')!.addEventListener('input', event => { state.h = Number((event.target as HTMLInputElement).value); change(); });
    surface.querySelector<HTMLInputElement>('[data-picker-alpha]')!.addEventListener('input', event => { state.alpha = Number((event.target as HTMLInputElement).value); change(); });
    const code = surface.querySelector<HTMLInputElement>('[data-picker-hex]')!, opacity = surface.querySelector<HTMLInputElement>('[data-picker-opacity]')!;
    code.addEventListener('input', () => { const value = code.value.trim(); if (!/^#?(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) { message('请输入有效的 HEX 颜色。'); return; } const color = parse(value.startsWith('#') ? value : '#' + value)!; message(); setColor({ ...color, alpha: [4, 8].includes(value.replace('#', '').length) ? color.alpha : state.alpha }); });
    opacity.addEventListener('input', () => { const text = opacity.value.replace('%', '').trim(), value = Number(text); if (!text || !Number.isFinite(value) || value < 0 || value > 100) { message('不透明度须在 0—100% 之间。'); return; } message(); state.alpha = Math.round(value); change(); });
    for (const input of [code, opacity]) input.addEventListener('blur', () => { message(); paint(); });
    type EyeDropperConstructor = new () => { open(options: { signal: AbortSignal }): Promise<{ sRGBHex: string }> };
    const EyeDropper = (view as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    const eye = surface.querySelector<HTMLButtonElement>('[data-picker-eye]')!;
    eye.disabled = !EyeDropper; if (!EyeDropper) eye.title = '当前浏览器不支持屏幕取色';
    eye.addEventListener('click', async () => {
      if (!EyeDropper) return;
      eyeAbort = new AbortController();
      try { const result = await new EyeDropper().open({ signal: eyeAbort.signal }); if (popup === surface) setColor({ hex: result.sRGBHex, alpha: state.alpha }); }
      catch (error) { if (popup === surface && (error as Error).name !== 'AbortError') message('取色未完成，请重试。'); }
    });
    paint(); position(); sv.focus({ preventScroll: true });
  }
  function sync() {
    if (disposed) return;
    for (const [native, binding] of bindings) if (!root.contains(native)) { if (active === binding) close(); bindings.delete(native); }
    for (const native of root.querySelectorAll<HTMLInputElement>('.text-settings-color input[type=color],.image-settings-color input[type=color],[data-color-control] input[type=color]')) {
      if (bindings.has(native)) continue;
      const field = native.parentElement?.querySelector<HTMLInputElement>('input[type=text]'); if (!field) continue;
      let opacity: HTMLInputElement | undefined;
      for (const [attribute, selector] of [
        ['data-shadow-color', '[data-shadow-key=opacity]'], ['data-background-color', '[data-background-key=opacity]'],
        ['data-stop-color', '[data-stop-key=opacity]'], ['data-fill-color', '[data-fill-key=opacity]']
      ]) if (native.hasAttribute(attribute!)) opacity = native.closest('.text-shadow-editor,.text-background-editor,.text-fill-properties')?.querySelector<HTMLInputElement>(selector!) ?? undefined;
      if (native.dataset.imageColor === 'shadowColor') opacity = root.querySelector<HTMLInputElement>('[name=shadowOpacity]') ?? undefined;
      if (native.dataset.colorOpacity) opacity = root.querySelector<HTMLInputElement>(native.dataset.colorOpacity) ?? undefined;
      native.hidden = true; native.tabIndex = -1; native.setAttribute('aria-hidden', 'true');
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'text-color-trigger';
      button.setAttribute('aria-label', native.getAttribute('aria-label') ?? '选择颜色'); button.setAttribute('aria-haspopup', 'dialog'); button.setAttribute('aria-expanded', 'false');
      const binding = { native, field, button, opacity, transparency: native.dataset.colorOpacityMode === 'transparency' }; bindings.set(native, binding); native.before(button);
      button.addEventListener('click', event => { event.preventDefault(); open(binding); });
    }
    swatches();
    if (active && !active.button.getClientRects().length) close();
  }
  const scheduledSync = (event: Event) => { if (!(event.target as Element).closest('.text-color-popover')) queueMicrotask(sync); };
  root.addEventListener('input', scheduledSync); root.addEventListener('change', scheduledSync); root.addEventListener('click', scheduledSync);
  const observer = new MutationObserver(records => { if (records.some(record => !(record.target as Element).closest?.('.text-color-popover'))) sync(); });
  observer.observe(root, { childList: true, subtree: true });
  const outside = (event: PointerEvent) => { if (popup && !popup.contains(event.target as Node) && !active?.button.contains(event.target as Node)) close(); };
  const canvasClick = () => close();
  const escape = (event: KeyboardEvent) => { if (popup && event.key === 'Escape') { escaping = true; event.preventDefault(); event.stopImmediatePropagation(); close(true); } };
  // TinyMCE also dismisses its parent dialog on keyup; consume the whole Escape press.
  const escapeUp = (event: KeyboardEvent) => { if (escaping && event.key === 'Escape') { escaping = false; event.preventDefault(); event.stopImmediatePropagation(); } };
  doc.addEventListener('pointerdown', outside, true); doc.addEventListener('keydown', escape, true); doc.addEventListener('keyup', escapeUp, true);
  artwork.addEventListener('pointerdown', canvasClick, true);
  doc.addEventListener('scroll', position, true); view.addEventListener('resize', position);
  sync();
  return { refresh: sync, dispose() { disposed = true; close(); observer.disconnect(); for (const { native, button } of bindings.values()) { button.remove(); native.hidden = false; native.removeAttribute('tabindex'); native.removeAttribute('aria-hidden'); } bindings.clear(); root.removeEventListener('input', scheduledSync); root.removeEventListener('change', scheduledSync); root.removeEventListener('click', scheduledSync); doc.removeEventListener('pointerdown', outside, true); doc.removeEventListener('keydown', escape, true); doc.removeEventListener('keyup', escapeUp, true); artwork.removeEventListener('pointerdown', canvasClick, true); doc.removeEventListener('scroll', position, true); view.removeEventListener('resize', position); } };
}

// Existing text settings and image settings share the same implementation.
export const installTextColorPickers = installColorPickers;
