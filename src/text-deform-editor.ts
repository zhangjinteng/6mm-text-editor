import { defaultDeform, deformPresets, deformLimits, isWarp, type TextDeform } from './text-deform';

const icons: Record<string, string> = {
  none: 'M12 12L48 48', up: 'M8 42Q30 4 52 42', down: 'M8 18Q30 56 52 18', circle: 'M30 9A21 21 0 1 1 29.99 9',
  triangle: 'M30 9L53 49H7Z', rectangle: 'M12 12H48V48H12Z', pentagon: 'M30 8L53 25L44 51H16L7 25Z', heart: 'M30 49C-8 25 12 -2 30 17C48 -2 68 25 30 49Z',
  custom: 'M7 30C16 -10 44 70 53 30', arch: 'M8 25Q30 4 52 25V46Q30 25 8 46Z', sector: 'M7 21Q30 4 53 21L44 44Q30 32 16 44Z',
  concave: 'M8 12Q30 30 52 12V48Q30 30 8 48Z', dome: 'M8 27Q30 4 52 27V48H8Z', bowl: 'M8 12H52V33Q30 56 8 33Z',
  bulge: 'M8 21Q30 2 52 21V39Q30 58 8 39Z', slant: 'M17 15H53L43 45H7Z', flag: 'M8 15C23 2 37 28 52 15V45C37 58 23 32 8 45Z'
};
const numberField = (name: keyof typeof deformLimits, label: string, unit = '', hint = '') => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" data-deform-number="${name}" aria-label="${label}"><small>${unit}</small></span></span><input type="range" data-deform-range="${name}" aria-label="${label}滑块" min="${deformLimits[name][0]}" max="${deformLimits[name][1]}" step="1">${hint ? `<small class="text-deform-field-hint">${hint}</small>` : ''}</label>`;
export function createDeformEditor(doc: Document, initial: TextDeform, change: (value: TextDeform) => void) {
  let value = structuredClone(initial);
  const root = doc.createElement('div'); root.className = 'text-deform-editor';
  root.innerHTML = `<div class="text-deform-heading"><strong>文字变形</strong><span data-deform-name></span></div>
    <div class="text-deform-presets" role="group" aria-label="变形预设">${deformPresets.map(([key, name, kind]) => `<button type="button" data-deform-preset="${key}" aria-label="${name}" title="${name}"><svg viewBox="0 0 60 60" aria-hidden="true"><path d="${icons[key]}" fill="none" stroke="currentColor" stroke-width="1.6" ${kind === 'path' ? 'stroke-dasharray="2.5 2.5"' : ''}/></svg><span>${name}</span></button>`).join('')}</div>
    <div data-deform-properties>
      <div data-deform-amount>${numberField('amount', '变形程度', '%')}</div>
      ${numberField('aspect', '纵向比例', '%')}
      <div data-deform-path-controls><div data-deform-radius>${numberField('radius', '路径半径', 'px', '0 表示根据文本框宽度自动计算')}</div><div data-deform-start>${numberField('start', '起始角度', '°')}</div><div data-deform-sweep>${numberField('sweep', '弧线角度', '°')}</div>
        <label class="text-settings-check"><input type="checkbox" data-deform-reverse>反向排列</label>
        <label class="text-settings-select">路径适配<select data-deform-fit aria-label="路径适配"><option value="natural">自然字距，长文自动适配</option><option value="spacing">调整字距铺满路径</option><option value="stretch">拉伸文字铺满路径</option></select></label><label class="text-settings-select">多行处理<select data-deform-lines aria-label="多行处理"><option value="preserve">保留多行，分别沿路径排列</option><option value="join">合并为一行</option></select></label>
      </div>
      <div data-deform-custom hidden><div class="text-deform-custom-title"><strong>自定义曲线</strong><button type="button" data-deform-custom-reset>重置控制点</button></div>
        <svg class="text-deform-canvas" viewBox="0 0 100 100" aria-label="曲线控制点编辑区"><path data-deform-guide fill="none" stroke="#bfd2c7" stroke-width=".6"/><path data-deform-curve fill="none" stroke="#147d64" stroke-width="1.2"/><circle cx="0" cy="50" r="1.8" fill="#829e8e"/><circle cx="100" cy="50" r="1.8" fill="#829e8e"/><circle data-deform-handle="1" tabindex="0" role="slider" aria-label="起始控制点" r="3"/><circle data-deform-handle="2" tabindex="0" role="slider" aria-label="结束控制点" r="3"/></svg>
        <p class="text-settings-hint">拖动控制点改变曲线，或选中控制点后使用方向键微调。</p>
        <details><summary>控制点坐标</summary>${numberField('c1x', '控制点 1 X', '%')}${numberField('c1y', '控制点 1 Y', '%')}${numberField('c2x', '控制点 2 X', '%')}${numberField('c2y', '控制点 2 Y', '%')}</details>
      </div>
    </div><p class="text-settings-hint" data-deform-hint></p>`;
  const refresh = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-deform-preset]').forEach(button => { const active = button.dataset.deformPreset === value.preset; button.setAttribute('aria-pressed', String(active)); });
    root.querySelector('[data-deform-name]')!.textContent = deformPresets.find(([key]) => key === value.preset)?.[1] ?? '';
    (root.querySelector('[data-deform-properties]') as HTMLElement).hidden = value.preset === 'none';
    const warp = isWarp(value.preset), custom = value.preset === 'custom', closed = ['circle', 'triangle', 'rectangle', 'pentagon', 'heart'].includes(value.preset);
    (root.querySelector('[data-deform-path-controls]') as HTMLElement).hidden = warp;
    (root.querySelector('[data-deform-custom]') as HTMLElement).hidden = !custom;
    (root.querySelector('[data-deform-sweep]') as HTMLElement).hidden = closed || custom;
    (root.querySelector('[data-deform-radius]') as HTMLElement).hidden = custom;
    (root.querySelector('[data-deform-start]') as HTMLElement).hidden = custom;
    (root.querySelector('[data-deform-amount]') as HTMLElement).hidden = closed || custom;
    root.querySelectorAll<HTMLInputElement>('[data-deform-number],[data-deform-range]').forEach(field => { const key = (field.dataset.deformNumber || field.dataset.deformRange) as keyof typeof deformLimits; field.value = String(value[key]); });
    root.querySelector<HTMLInputElement>('[data-deform-reverse]')!.checked = value.reverse;
    root.querySelector<HTMLSelectElement>('[data-deform-lines]')!.value = value.lines;
    root.querySelector<HTMLSelectElement>('[data-deform-fit]')!.value = value.fit;
    root.querySelector('[data-deform-hint]')!.textContent = value.preset === 'none' ? '选择一个预设开始调整，左侧实时预览。' : warp ? '文字和换行一起变形；填充、描边与投影随文字变化。双击文字可编辑原文。' : '保留各段文字的字体和颜色。多行可分别排列；闭合路径的多行依次向外排列。双击文字可编辑原文。';
    root.querySelector('[data-deform-guide]')!.setAttribute('d', `M0 50L${value.c1x} ${value.c1y}M100 50L${value.c2x} ${value.c2y}`);
    root.querySelector('[data-deform-curve]')!.setAttribute('d', `M0 50C${value.c1x} ${value.c1y} ${value.c2x} ${value.c2y} 100 50`);
    for (const index of [1, 2] as const) { const handle = root.querySelector(`[data-deform-handle="${index}"]`)!; const x = value[index === 1 ? 'c1x' : 'c2x'], y = value[index === 1 ? 'c1y' : 'c2y']; handle.setAttribute('cx', String(x)); handle.setAttribute('cy', String(y)); handle.setAttribute('aria-valuetext', `X ${x}%，Y ${y}%`); }
  };
  const emit = () => { refresh(); change(structuredClone(value)); };
  root.querySelectorAll<HTMLButtonElement>('[data-deform-preset]').forEach(button => button.addEventListener('click', () => { const closed = ['circle', 'triangle', 'rectangle', 'pentagon', 'heart']; const previous = value.preset; value.preset = button.dataset.deformPreset as TextDeform['preset']; if (closed.includes(value.preset) && !closed.includes(previous)) value.fit = 'spacing'; else if (!closed.includes(value.preset) && closed.includes(previous)) value.fit = 'natural'; emit(); }));
  root.querySelectorAll<HTMLButtonElement>('[data-deform-preset]').forEach((button, index, buttons) => button.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.key] ?? 0))); buttons[next]!.focus(); buttons[next]!.click(); }));
  root.addEventListener('input', event => {
    const field = event.target as HTMLInputElement; const key = (field.dataset.deformNumber || field.dataset.deformRange) as keyof typeof deformLimits | undefined;
    if (key) {
      const n = Number(field.value), [min, max] = deformLimits[key];
      // Retain invalid text until corrected; the shared validator prevents preview/commit.
      value[key] = field.value.trim() && Number.isFinite(n) ? n : NaN;
      if (!Number.isFinite(value[key]) || n < min || n > max) { change(structuredClone(value)); return; }
    } else if (field.matches('[data-deform-reverse]')) value.reverse = field.checked;
    else if (field.matches('[data-deform-fit]')) value.fit = field.value as TextDeform['fit'];
    else if (field.matches('[data-deform-lines]')) value.lines = field.value as TextDeform['lines'];
    else return;
    emit();
  });
  root.querySelector('[data-deform-custom-reset]')!.addEventListener('click', () => { Object.assign(value, { c1x: defaultDeform.c1x, c1y: defaultDeform.c1y, c2x: defaultDeform.c2x, c2y: defaultDeform.c2y }); emit(); });
  root.querySelectorAll<SVGCircleElement>('[data-deform-handle]').forEach(handle => {
    const xKey = handle.dataset.deformHandle === '1' ? 'c1x' : 'c2x', yKey = handle.dataset.deformHandle === '1' ? 'c1y' : 'c2y';
    const update = (event: PointerEvent) => { const rect = root.querySelector('.text-deform-canvas')!.getBoundingClientRect(); value[xKey] = Math.round(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))); value[yKey] = Math.round(Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))); emit(); };
    handle.addEventListener('pointerdown', event => { if (event.button !== 0) return; handle.setPointerCapture(event.pointerId); event.preventDefault(); update(event); });
    handle.addEventListener('pointermove', event => { if (handle.hasPointerCapture(event.pointerId)) update(event); });
    handle.addEventListener('pointerup', event => { if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId); });
    handle.addEventListener('keydown', event => { if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return; event.preventDefault(); const step = event.shiftKey ? 10 : 1; if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') value[xKey] = Math.max(0, Math.min(100, value[xKey] + (event.key === 'ArrowRight' ? step : -step))); else value[yKey] = Math.max(0, Math.min(100, value[yKey] + (event.key === 'ArrowDown' ? step : -step))); emit(); });
  });
  refresh(); return { element: root, reset(next: TextDeform) { value = structuredClone(next); refresh(); } };
}
