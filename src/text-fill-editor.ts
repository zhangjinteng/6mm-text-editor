import { copyFills, fillNames, fillSwatch, newFill, type FillLayer, type FillStop, type FillType } from './text-fill';

const eye = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const closedEye = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 3 18 18M10 5c7-1 12 7 12 7s-2 3-5 5M6 6c-3 2-4 6-4 6s4 7 10 7l3-1"/></svg>';
const types: [string, string][] = [['none', '原始文字颜色'], ['empty', '无填充'], ['solid', '纯色填充'], ['gradient', '渐变填充'], ['image', '图片填充']];
const option = (key: string, label: string, items: [string, string][]) => `<label class="text-settings-select">${label}<select data-fill-key="${key}" aria-label="${label}">${items.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
const number = (key: string, label: string, min: number, max: number, unit = '%', stop = false) => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" data-${stop ? 'stop' : 'fill'}-key="${key}" data-number aria-label="${label}"><small>${unit}</small></span></span><input type="range" data-${stop ? 'stop' : 'fill'}-range="${key}" aria-label="${label}滑块" min="${min}" max="${max}"></label>`;
const color = (key: string, label: string, stop = false) => `<label class="text-settings-color">${label}<span><input type="color" data-${stop ? 'stop' : 'fill'}-color="${key}" aria-label="${label}色板"><input type="text" data-${stop ? 'stop' : 'fill'}-key="${key}" aria-label="${label}" spellcheck="false"></span></label>`;
const clone = (layers: FillLayer[]) => copyFills(layers);

/** The editor owns a disposable draft. No UI gesture writes to the selected text. */
export function createFillEditor(doc: Document, initial: FillLayer[], callbacks: { change: (layers: FillLayer[]) => void; busy: (busy: boolean) => void; error: (message: string) => void }) {
  const root = doc.createElement('div'); root.className = 'text-fill-editor';
  root.innerHTML = `<div class="text-fill-heading"><strong>填充</strong><button type="button" data-add-fill aria-label="添加填充">＋</button></div><div class="text-fill-layers" role="group" aria-label="填充图层"></div><div class="text-fill-properties"></div><input type="file" data-fill-upload accept="image/png,image/jpeg,image/webp,image/gif" hidden>`;
  const list = root.querySelector<HTMLElement>('.text-fill-layers')!, properties = root.querySelector<HTMLElement>('.text-fill-properties')!, file = root.querySelector<HTMLInputElement>('input[type=file]')!;
  let layers = clone(initial), version = 0, disposed = false, pointer: number | undefined;
  let selected: string | undefined = layers[0]?.id, selectedStop: string | undefined = layers[0]?.stops[0]?.id;
  const current = () => layers.find(layer => layer.id === selected);
  const stop = () => current()?.stops.find(stop => stop.id === selectedStop);
  const invalidateUpload = () => { ++version; callbacks.busy(false); };
  const changed = () => { callbacks.error(''); callbacks.change(clone(layers)); refreshList(); refreshFields(); };
  function refreshList() {
    list.replaceChildren();
    layers.forEach((layer, index) => {
      const row = doc.createElement('div'); row.className = 'text-fill-layer'; row.dataset.selected = String(layer.id === selected); row.dataset.visible = String(layer.visible);
      const edit = doc.createElement('button'); edit.type = 'button'; edit.className = 'text-fill-layer-edit'; edit.dataset.layer = layer.id; edit.setAttribute('aria-label', `编辑填充 ${index + 1}`); edit.setAttribute('aria-pressed', String(layer.id === selected));
      const swatch = doc.createElement('i'); swatch.className = 'text-fill-swatch'; swatch.style.backgroundImage = fillSwatch(layer); swatch.style.opacity = String(layer.opacity / 100); swatch.dataset.empty = String(layer.type === 'empty');
      const title = doc.createElement('span'); title.textContent = layer.type === 'gradient' ? `${layer.gradient === 'radial' ? '径向' : '线性'}渐变` : fillNames[layer.type]; edit.append(swatch, title); row.append(edit);
      const action = (kind: string, label: string, html: string, disabled = false) => { const button = doc.createElement('button'); button.type = 'button'; button.dataset.action = kind; button.dataset.layer = layer.id; button.setAttribute('aria-label', `${label}填充 ${index + 1}`); button.innerHTML = html; button.disabled = disabled; row.append(button); return button; };
      action('up', '上移', '↑', index === 0); action('down', '下移', '↓', index === layers.length - 1);
      action('visibility', layer.visible ? '隐藏' : '显示', layer.visible ? eye : closedEye).setAttribute('aria-pressed', String(layer.visible));
      action('delete', '删除', '−'); list.append(row);
    });
    root.querySelector<HTMLButtonElement>('[data-add-fill]')!.disabled = layers.length >= 16;
  }
  function renderProperties() {
    const layer = current();
    if (!layer) {
      properties.innerHTML = '<p class="text-settings-hint">当前无填充，仅保留描边、投影和背景。</p><button type="button" class="text-fill-restore" data-restore>恢复原始字色</button>';
      return;
    }
    properties.innerHTML = `${option('type', '填充类型', types)}${layer.visible ? '' : '<p class="text-fill-hidden-note">此填充已隐藏，设置仍会保留。</p>'}
      ${layer.type === 'original' ? '<p class="text-settings-hint">保留每个字符的原始颜色与格式。</p>' : ''}
      ${layer.type === 'empty' ? '<p class="text-settings-hint">此层不绘制字面颜色。制作空心字时，请隐藏或删除其他填充层，再启用描边。</p>' : number('opacity', '填充不透明度', 0, 100)}
      ${layer.type === 'solid' ? color('color', '填充颜色') : ''}
      ${layer.type === 'gradient' ? `${option('gradient', '渐变类型', [['linear', '线性渐变'], ['radial', '径向渐变']])}<div class="text-fill-stop-track" aria-label="渐变色标条"><div class="text-fill-stop-handles"></div></div><p class="text-fill-stop-help">点击渐变条添加色标，拖动色标调整位置。</p><div class="text-fill-stop-actions"><span data-stop-count></span><button type="button" data-add-stop aria-label="添加色标">＋ 添加色标</button><button type="button" data-remove-stop>删除色标</button></div>${color('color', '色标颜色', true)}${number('position', '色标位置', 0, 100, '%', true)}${number('opacity', '色标不透明度', 0, 100, '%', true)}${layer.gradient === 'linear' ? number('angle', '渐变角度（0—360°）', 0, 360, '°') : number('centerX', '渐变中心 X', 0, 100) + number('centerY', '渐变中心 Y', 0, 100) + number('radius', '渐变范围', 1, 200)}` : ''}
      ${layer.type === 'image' ? `<label class="text-settings-url">图片地址<input type="text" data-fill-key="image" aria-label="图片地址（HTTPS 或本地上传）" placeholder="https://…" spellcheck="false"></label><button type="button" data-upload>选择本地图片</button><p class="text-settings-hint">PNG、JPG、WebP、GIF，最大 5 MB。较大图片会压缩并嵌入文档。</p>${option('fit', '图片适配', [['cover', '覆盖'], ['contain', '完整显示']])}${number('scale', '图片缩放', 10, 400)}${number('offsetX', '图片水平偏移', -100, 100)}${number('offsetY', '图片垂直偏移', -100, 100)}${number('rotation', '图片旋转', -180, 180, '°')}<label class="text-settings-check"><input type="checkbox" data-fill-key="repeat">平铺图片</label><button type="button" class="text-fill-restore" data-reset-image>重置图片位置</button>` : ''}`;
    refreshFields();
  }
  function swatch(field: HTMLInputElement, value: string) {
    const canvas = doc.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
    field.value = '#' + Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('');
  }
  function refreshFields() {
    const layer = current(); if (!layer) return;
    properties.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-fill-key],[data-fill-range],[data-fill-color],[data-stop-key],[data-stop-range],[data-stop-color]').forEach(field => {
      const isStop = !!(field.dataset.stopKey || field.dataset.stopRange || field.dataset.stopColor);
      const key = field.dataset.fillKey || field.dataset.fillRange || field.dataset.fillColor || field.dataset.stopKey || field.dataset.stopRange || field.dataset.stopColor;
      const value = isStop ? stop()?.[key as keyof FillStop] : layer[key as keyof FillLayer];
      // Preserve partially typed numbers and color strings until the user finishes editing.
      if (doc.activeElement === field) return;
      if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = value === true;
      else if (field instanceof HTMLInputElement && field.type === 'color') swatch(field, String(value));
      else field.value = key === 'type' && value === 'original' ? 'none' : typeof value === 'number' && !Number.isFinite(value) ? '' : String(value ?? '');
    });
    const track = properties.querySelector<HTMLElement>('.text-fill-stop-track');
    if (track) {
      track.style.backgroundImage = fillSwatch({ ...layer, gradient: 'linear', angle: 90 });
      const handles = track.querySelector<HTMLElement>('.text-fill-stop-handles')!;
      const existing = new Set(layer.stops.map(s => s.id));
      for (const child of Array.from(handles.children)) if (!existing.has((child as HTMLElement).dataset.stopId!)) child.remove();
      layer.stops.forEach((s, index) => {
        let handle = Array.from(handles.querySelectorAll<HTMLButtonElement>('[data-stop-id]')).find(button => button.dataset.stopId === s.id);
        if (!handle) { handle = doc.createElement('button'); handle.type = 'button'; handle.dataset.stopId = s.id; handle.setAttribute('role', 'slider'); handle.setAttribute('aria-valuemin', '0'); handle.setAttribute('aria-valuemax', '100'); handles.append(handle); }
        handle.setAttribute('aria-label', `渐变色标 ${index + 1}`); handle.setAttribute('aria-valuenow', String(s.position)); handle.setAttribute('aria-valuetext', `${s.position}%，${s.color}`);
        handle.style.left = `${s.position}%`; handle.style.backgroundColor = s.color; handle.dataset.selected = String(s.id === selectedStop);
      });
      properties.querySelector('[data-stop-count]')!.textContent = `${layer.stops.length} 个色标`;
      properties.querySelector<HTMLButtonElement>('[data-remove-stop]')!.disabled = layer.stops.length <= 2;
      properties.querySelector<HTMLButtonElement>('[data-add-stop]')!.disabled = layer.stops.length >= 16;
    }
  }
  root.addEventListener('input', event => {
    const field = event.target as HTMLInputElement;
    const layer = current(); if (!layer) return;
    const fillKey = field.dataset.fillKey || field.dataset.fillRange || field.dataset.fillColor;
    const stopKey = field.dataset.stopKey || field.dataset.stopRange || field.dataset.stopColor;
    const numeric = field.hasAttribute('data-number') || field.type === 'range';
    const value = field.type === 'checkbox' ? field.checked : numeric ? (field.value.trim() ? Number(field.value) : NaN) : field.value;
    if (fillKey === 'type') { invalidateUpload(); layer.type = (value === 'none' ? 'original' : value) as FillType; renderProperties(); }
    else if (fillKey) { if (fillKey === 'image') invalidateUpload(); Object.assign(layer, { [fillKey]: value }); if (fillKey === 'gradient') renderProperties(); }
    else if (stopKey && stop()) Object.assign(stop()!, { [stopKey]: value });
    else return;
    changed();
  });
  function addStop(position?: number) {
    const layer = current(); if (!layer || layer.stops.length >= 16) return;
    if (position === undefined) {
      const sorted = [...layer.stops].sort((a, b) => a.position - b.position); let gap = -1;
      for (let i = 1; i < sorted.length; i++) if (sorted[i]!.position - sorted[i - 1]!.position > gap) { gap = sorted[i]!.position - sorted[i - 1]!.position; position = (sorted[i]!.position + sorted[i - 1]!.position) / 2; }
    }
    const item: FillStop = { id: crypto.randomUUID(), color: stop()?.color ?? '#ffffff', position: Math.round(position ?? 50), opacity: 100 };
    layer.stops.push(item); selectedStop = item.id; changed();
  }
  root.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button'); if (!button) return;
    const index = layers.findIndex(layer => layer.id === button.dataset.layer);
    if (index >= 0) {
      const action = button.dataset.action;
      if (!action) { selected = layers[index]!.id; selectedStop = layers[index]!.stops[0]!.id; }
      if (action === 'visibility') layers[index]!.visible = !layers[index]!.visible;
      if (action === 'delete') { invalidateUpload(); layers.splice(index, 1); if (!current()) selected = layers[Math.min(index, layers.length - 1)]?.id; }
      if (action === 'up' || action === 'down') { const next = index + (action === 'up' ? -1 : 1); if (next >= 0 && next < layers.length) [layers[index], layers[next]] = [layers[next]!, layers[index]!]; }
      if (!stop()) selectedStop = current()?.stops[0]?.id;
      renderProperties(); changed();
      // Keep keyboard focus in the list after its row buttons are rebuilt.
      const newIndex = layers.findIndex(layer => layer.id === (action === 'delete' ? selected : button.dataset.layer));
      const row = list.children[newIndex]; (row?.querySelector<HTMLButtonElement>(action && action !== 'delete' ? `[data-action="${action}"]` : '[data-layer]'))?.focus({ preventScroll: true });
      return;
    }
    if (button.hasAttribute('data-add-fill') && layers.length < 16) { const layer = newFill(); layers.unshift(layer); selected = layer.id; selectedStop = layer.stops[0]!.id; renderProperties(); changed(); }
    if (button.hasAttribute('data-restore')) { layers = [newFill('original', 'base')]; selected = 'base'; selectedStop = 'start'; renderProperties(); changed(); }
    if (button.hasAttribute('data-add-stop')) addStop();
    if (button.hasAttribute('data-remove-stop')) {
      const layer = current(); if (layer && layer.stops.length > 2) { layer.stops = layer.stops.filter(s => s.id !== selectedStop); selectedStop = layer.stops[0]!.id; changed(); }
    }
    if (button.hasAttribute('data-reset-image') && current()) { Object.assign(current()!, { scale: 100, offsetX: 0, offsetY: 0, rotation: 0, repeat: false, fit: 'cover' }); changed(); }
    if (button.hasAttribute('data-upload')) file.click();
  });
  const trackPosition = (track: HTMLElement, clientX: number) => Math.max(0, Math.min(100, Math.round((clientX - track.getBoundingClientRect().left) / track.clientWidth * 100)));
  properties.addEventListener('pointerdown', event => {
    const track = (event.target as Element).closest<HTMLElement>('.text-fill-stop-track'); if (!track || event.button !== 0) return;
    const marker = (event.target as Element).closest<HTMLElement>('[data-stop-id]');
    if (marker) { selectedStop = marker.dataset.stopId; marker.focus({ preventScroll: true }); refreshFields(); }
    else addStop(trackPosition(track, event.clientX));
    pointer = event.pointerId; track.setPointerCapture(event.pointerId); event.preventDefault();
  });
  properties.addEventListener('pointermove', event => {
    if (event.pointerId !== pointer) return;
    const track = (event.target as Element).closest<HTMLElement>('.text-fill-stop-track'); if (!track || !stop()) return;
    stop()!.position = trackPosition(track, event.clientX); changed();
  });
  const release = () => { pointer = undefined; };
  properties.addEventListener('pointerup', release); properties.addEventListener('pointercancel', release);
  properties.addEventListener('keydown', event => {
    const marker = (event.target as Element).closest<HTMLElement>('[data-stop-id]'); if (!marker) return;
    selectedStop = marker.dataset.stopId;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && stop()) {
      event.preventDefault(); stop()!.position = event.key === 'Home' ? 0 : event.key === 'End' ? 100 : Math.max(0, Math.min(100, stop()!.position + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 10 : 1))); changed();
    }
  });
  properties.addEventListener('focusin', event => { const marker = (event.target as Element).closest<HTMLElement>('[data-stop-id]'); if (marker) { selectedStop = marker.dataset.stopId; marker.focus({ preventScroll: true }); refreshFields(); } });
  file.addEventListener('change', async () => {
    const uploaded = file.files?.[0], layer = current(); if (!uploaded || !layer || disposed) return;
    if (uploaded.size > 5 * 1024 * 1024 || !/^image\/(png|jpeg|webp|gif)$/.test(uploaded.type)) { callbacks.error('请选择不超过 5 MB 的 PNG、JPEG、WebP 或 GIF 图片。'); file.value = ''; return; }
    const request = ++version, layerId = layer.id; callbacks.busy(true); callbacks.error('');
    try {
      let result = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(uploaded); });
      const image = new Image(); image.src = result; await image.decode();
      if (uploaded.size > 128 * 1024) {
        let ratio = Math.min(1, 1280 / image.naturalWidth, 1280 / image.naturalHeight);
        const canvas = doc.createElement('canvas'), ctx = canvas.getContext('2d')!;
        for (let i = 0; i < 8; i++) { canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio)); ctx.drawImage(image, 0, 0, canvas.width, canvas.height); result = canvas.toDataURL('image/webp', .82); if (result.length <= 500000) break; ratio *= .75; }
        if (result.length > 500000) throw new Error('Texture too large');
      }
      const target = layers.find(layer => layer.id === layerId);
      if (!disposed && request === version && target?.type === 'image') { target.image = result; changed(); }
    } catch { if (!disposed && request === version) callbacks.error('图片无法处理，请重新选择。'); }
    finally { if (!disposed && request === version) callbacks.busy(false); file.value = ''; }
  });
  refreshList(); renderProperties();
  return {
    element: root,
    reset(next: FillLayer[]) { invalidateUpload(); layers = clone(next); selected = layers[0]?.id; selectedStop = layers[0]?.stops[0]?.id; renderProperties(); changed(); },
    dispose() { disposed = true; ++version; }
  };
}
