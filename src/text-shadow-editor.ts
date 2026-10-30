import { newShadow, parseShadowColor, shadowOffsets, shadowPolar, type TextShadow } from './text-shadow';

const eye = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOff = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 3 18 18M10 5c7-1 12 7 12 7s-2 3-5 5M6 6c-3 2-4 6-4 6s4 7 10 7l3-1"/></svg>';
const target = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="7"/><path d="M12 2v20M2 12h20"/></svg>';
const range = (key: 'opacity' | 'blur', label: string, max: number, unit: string) => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" data-shadow-key="${key}" aria-label="${label}"><small>${unit}</small></span></span><input type="range" data-shadow-range="${key}" aria-label="${label}滑块" min="0" max="${max}"></label>`;
const directions = [[135, '左上', '↖'], [90, '上', '↑'], [45, '右上', '↗'], [180, '左', '←'], [null, '', ''], [0, '右', '→'], [-135, '左下', '↙'], [-90, '下', '↓'], [-45, '右下', '↘']] as const;

/** State belongs to the dialog draft, including hidden settings that have no visible CSS. */
export function createShadowEditor(doc: Document, initial: TextShadow | null, change: (shadow: TextShadow | null) => void) {
  const root = doc.createElement('div'); root.className = 'text-shadow-editor';
  root.innerHTML = `<div class="text-shadow-status"><strong>投影</strong><span data-shadow-state></span><div class="text-shadow-actions"><button type="button" data-shadow-add aria-label="添加投影" title="添加投影">＋</button><button type="button" data-shadow-settings aria-label="投影设置" title="投影设置" aria-expanded="false" aria-controls="text-shadow-properties"><i data-shadow-swatch></i><span data-shadow-chevron>⌃</span></button><button type="button" data-shadow-visibility></button><button type="button" data-shadow-delete aria-label="删除投影" title="删除投影">−</button></div></div>
    <p class="text-settings-hint" data-shadow-empty>添加基础投影，为文字增加层次。</p>
    <div class="text-shadow-properties" id="text-shadow-properties" data-shadow-properties><div class="text-shadow-title"><strong>基础投影</strong><button type="button" data-shadow-collapse aria-label="收起投影设置" title="收起投影设置">×</button></div><p class="text-shadow-hidden-note" data-shadow-hidden hidden>投影已隐藏，当前参数会保留。</p>
    <label class="text-settings-color">投影颜色<span><input type="color" data-shadow-color aria-label="投影颜色色板"><input type="text" data-shadow-key="color" aria-label="投影颜色" spellcheck="false"></span></label>
    ${range('opacity', '投影不透明度', 100, '%')}
    <div class="text-shadow-offset"><span>偏移</span><div><label><input type="text" inputmode="decimal" data-shadow-key="distance" aria-label="投影距离"><small>px</small></label><span class="text-shadow-divider"></span><label><input type="text" inputmode="decimal" data-shadow-key="angle" aria-label="投影角度"><small>°</small></label><button type="button" data-shadow-direction aria-label="设置投影方向" title="设置投影方向" aria-expanded="false" aria-controls="text-shadow-direction">${target}</button></div></div>
    <div class="text-shadow-direction" id="text-shadow-direction" data-shadow-direction-panel hidden><div class="text-shadow-direction-controls"><div class="text-shadow-dial" data-shadow-dial role="slider" tabindex="0" aria-label="投影方向" aria-valuemin="-180" aria-valuemax="180"><i class="text-shadow-dial-line"></i><i class="text-shadow-dial-dot"></i></div><div class="text-shadow-presets">${directions.map(([angle, label, arrow]) => angle === null ? '<span></span>' : `<button type="button" data-shadow-angle="${angle}" aria-label="向${label}投影" title="向${label}投影">${arrow}</button>`).join('')}</div></div><p>拖动设置方向 · 0° 向右，90° 向上</p></div>
    ${range('blur', '投影模糊度', 100, 'px')}
    <details class="text-shadow-cartesian"><summary>坐标偏移</summary><div><label>水平偏移<input type="text" inputmode="decimal" data-shadow-axis="x" aria-label="水平偏移（px）"></label><label>垂直偏移<input type="text" inputmode="decimal" data-shadow-axis="y" aria-label="垂直偏移（px）"></label></div><p>与距离、角度同步，总距离不超过 200 px。</p></details></div>`;
  let shadow = structuredClone(initial), expanded = !!initial, directionOpen = false, pointer: number | undefined;
  let axes = shadow ? shadowOffsets(shadow) : { x: 0, y: 0 };
  const status = root.querySelector<HTMLElement>('[data-shadow-state]')!, settings = root.querySelector<HTMLButtonElement>('[data-shadow-settings]')!, visibility = root.querySelector<HTMLButtonElement>('[data-shadow-visibility]')!, dial = root.querySelector<HTMLElement>('[data-shadow-dial]')!;
  const field = (key: string) => root.querySelector<HTMLInputElement>(`[data-shadow-key="${key}"]`)!;
  const show = (selector: string, visible: boolean) => { root.querySelector<HTMLElement>(selector)!.hidden = !visible; };
  const display = (value: number) => Number.isFinite(value) ? String(Number(value.toFixed(3))) : '';
  function refresh() {
    show('[data-shadow-add]', !shadow); show('[data-shadow-settings]', !!shadow); show('[data-shadow-visibility]', !!shadow); show('[data-shadow-delete]', !!shadow); show('[data-shadow-empty]', !shadow);
    show('[data-shadow-properties]', !!shadow && expanded); show('[data-shadow-direction-panel]', !!shadow && directionOpen); show('[data-shadow-hidden]', !!shadow && !shadow.visible);
    settings.setAttribute('aria-expanded', String(!!shadow && expanded)); root.querySelector('[data-shadow-direction]')!.setAttribute('aria-expanded', String(directionOpen));
    root.querySelector('[data-shadow-chevron]')!.textContent = expanded ? '⌃' : '⌄';
    status.textContent = shadow && !shadow.visible ? '已隐藏' : '';
    if (!shadow) return;
    const label = shadow.visible ? '隐藏投影' : '显示投影';
    if (visibility.getAttribute('aria-label') !== label) { visibility.setAttribute('aria-label', label); visibility.title = label; visibility.setAttribute('aria-pressed', String(shadow.visible)); visibility.innerHTML = shadow.visible ? eye : eyeOff; }
    root.querySelector<HTMLElement>('[data-shadow-swatch]')!.style.backgroundImage = `linear-gradient(to right,${shadow.color} 50%,color-mix(in srgb,${shadow.color} ${shadow.opacity}%,transparent) 50%)`;
    for (const key of ['color', 'opacity', 'distance', 'angle', 'blur'] as const) { const input = field(key); if (doc.activeElement !== input) input.value = key === 'color' ? shadow.color : display(shadow[key]); }
    const color = root.querySelector<HTMLInputElement>('[data-shadow-color]')!; if (/^#[\da-f]{6}$/i.test(shadow.color)) color.value = shadow.color;
    root.querySelectorAll<HTMLInputElement>('[data-shadow-range]').forEach(input => { input.value = String(shadow![input.dataset.shadowRange as 'opacity' | 'blur']); });
    root.querySelectorAll<HTMLInputElement>('[data-shadow-axis]').forEach(input => { if (doc.activeElement !== input) input.value = display(axes[input.dataset.shadowAxis as 'x' | 'y']); });
    dial.setAttribute('aria-valuenow', String(shadow.angle)); dial.setAttribute('aria-valuetext', `${display(shadow.angle)}°`);
    const radians = shadow.angle * Math.PI / 180;
    const dot = dial.querySelector<HTMLElement>('.text-shadow-dial-dot')!; dot.style.left = `${50 + Math.cos(radians) * 35}%`; dot.style.top = `${50 - Math.sin(radians) * 35}%`;
    dial.querySelector<HTMLElement>('.text-shadow-dial-line')!.style.transform = `rotate(${-shadow.angle}deg)`;
    root.querySelectorAll<HTMLButtonElement>('[data-shadow-angle]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.shadowAngle) === shadow!.angle)));
  }
  const changed = () => { change(structuredClone(shadow)); refresh(); };
  function angle(value: number) { if (!shadow) return; shadow.angle = value; axes = shadowOffsets(shadow); changed(); }
  root.addEventListener('input', event => {
    if (!shadow) return;
    const input = event.target as HTMLInputElement;
    const key = input.dataset.shadowKey || input.dataset.shadowRange || (input.hasAttribute('data-shadow-color') ? 'color' : undefined);
    if (key === 'color') {
      const parsed = parseShadowColor(input.value, doc);
      shadow.color = parsed?.color ?? input.value;
      if (parsed?.opacity !== undefined) shadow.opacity = parsed.opacity;
    } else if (key) {
      Object.assign(shadow, { [key]: input.value.trim() ? Number(input.value) : NaN });
      if ((key === 'angle' || key === 'distance') && Number.isFinite(shadow.distance) && Number.isFinite(shadow.angle)) axes = shadowOffsets(shadow);
    } else if (input.dataset.shadowAxis) {
      axes[input.dataset.shadowAxis as 'x' | 'y'] = input.value.trim() ? Number(input.value) : NaN;
      Object.assign(shadow, shadowPolar(axes.x, axes.y, shadow.angle));
    } else return;
    changed();
  });
  root.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button'); if (!button) return;
    if (button.hasAttribute('data-shadow-add')) { shadow = newShadow(); axes = shadowOffsets(shadow); expanded = true; directionOpen = false; changed(); }
    if (button.hasAttribute('data-shadow-settings') || button.hasAttribute('data-shadow-collapse')) { expanded = !expanded; directionOpen = false; refresh(); if (!expanded) settings.focus({ preventScroll: true }); }
    if (button.hasAttribute('data-shadow-delete')) { shadow = null; expanded = directionOpen = false; changed(); root.querySelector<HTMLButtonElement>('[data-shadow-add]')!.focus({ preventScroll: true }); }
    if (button.hasAttribute('data-shadow-visibility') && shadow) { shadow.visible = !shadow.visible; changed(); }
    if (button.hasAttribute('data-shadow-direction')) { directionOpen = !directionOpen; refresh(); if (directionOpen) dial.focus({ preventScroll: true }); }
    if (button.hasAttribute('data-shadow-angle')) angle(Number(button.dataset.shadowAngle));
  });
  const point = (event: PointerEvent) => {
    const bounds = dial.getBoundingClientRect(), dx = event.clientX - bounds.left - bounds.width / 2, dy = event.clientY - bounds.top - bounds.height / 2;
    if (Math.hypot(dx, dy) < 3) return;
    let value = Math.atan2(-dy, dx) * 180 / Math.PI; value = event.shiftKey ? Math.round(value / 15) * 15 : Math.round(value); angle(value);
  };
  dial.addEventListener('pointerdown', event => { if (event.button !== 0 || !shadow) return; pointer = event.pointerId; dial.focus({ preventScroll: true }); dial.setPointerCapture(pointer); point(event); event.preventDefault(); });
  dial.addEventListener('pointermove', event => { if (event.pointerId === pointer) point(event); });
  dial.addEventListener('pointerup', () => { pointer = undefined; }); dial.addEventListener('pointercancel', () => { pointer = undefined; });
  dial.addEventListener('keydown', event => {
    if (!shadow || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const delta = (['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1) * (event.shiftKey ? 15 : 1);
    angle(event.key === 'Home' ? 0 : event.key === 'End' ? 180 : Math.max(-180, Math.min(180, shadow.angle + delta)));
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && directionOpen) { event.preventDefault(); event.stopPropagation(); pointer = undefined; directionOpen = false; refresh(); root.querySelector<HTMLButtonElement>('[data-shadow-direction]')!.focus({ preventScroll: true }); }
  });
  root.addEventListener('focusout', () => refresh());
  refresh();
  return { element: root, reset(value: TextShadow | null) { shadow = structuredClone(value); axes = shadow ? shadowOffsets(shadow) : { x: 0, y: 0 }; expanded = !!shadow; directionOpen = false; refresh(); }, dispose() { pointer = undefined; } };
}
