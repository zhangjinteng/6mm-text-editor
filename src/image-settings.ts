import type { Editor } from 'tinymce';
import './image-settings.css';
import { imageGeometry } from './image-geometry';
import { createImageStroke, registerImageStrokes, strokePositions, strokePresets } from './image-stroke';

const masks = {
  none: { label: '无蒙版', clip: 'none', image: 'none' },
  circle: { label: '圆形', clip: 'circle(closest-side at 50% 50%)', image: 'none' },
  ellipse: { label: '椭圆', clip: 'ellipse(50% 50% at 50% 50%)', image: 'none' },
  diamond: { label: '菱形', clip: 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', image: 'none' },
  triangle: { label: '三角形', clip: 'polygon(50% 0%,100% 100%,0% 100%)', image: 'none' },
  hexagon: { label: '六边形', clip: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)', image: 'none' },
  star: { label: '星形', clip: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)', image: 'none' },
  fade: { label: '向下渐隐', clip: 'none', image: 'linear-gradient(to bottom,#000 20%,transparent 100%)' },
  soft: { label: '柔边蒙版', clip: 'none', image: 'radial-gradient(ellipse closest-side,#000 60%,transparent 100%)' }
} as const;
type Mask = keyof typeof masks;
const filters = {
  none: { label: '原图', value: (_n: number) => '' },
  mono: { label: '黑白', value: (n: number) => `grayscale(${n})` },
  vintage: { label: '复古', value: (n: number) => `sepia(${n * 0.7}) contrast(${1 + n * 0.12}) saturate(${1 - n * 0.2})` },
  warm: { label: '暖色', value: (n: number) => `sepia(${n * 0.35}) saturate(${1 + n * 0.25})` },
  cool: { label: '冷色', value: (n: number) => `sepia(${n * 0.2}) hue-rotate(${n * 165}deg) saturate(${1 + n * 0.15})` },
  vivid: { label: '鲜艳', value: (n: number) => `saturate(${1 + n * 0.65}) contrast(${1 + n * 0.15})` },
  soft: { label: '柔和', value: (n: number) => `contrast(${1 - n * 0.18}) brightness(${1 + n * 0.1}) saturate(${1 - n * 0.15})` },
  noir: { label: '高反差', value: (n: number) => `grayscale(${n}) contrast(${1 + n * 0.5})` }
} as const;
type Filter = keyof typeof filters;
const borderStyles = strokePresets;
type BorderStyle = keyof typeof borderStyles;
const defaults = { flipX: false, flipY: false, locked: false, rotation: 0, mask: 'none' as Mask, preset: 'none' as Filter, filterStrength: 100, stroke: false, strokeWidth: 4, strokeColor: '#ffffff', strokeStyle: 'solid' as BorderStyle, strokePosition: 'inside' as keyof typeof strokePositions, opacity: 100, radius: 0, brightness: 100, contrast: 100, saturation: 100, hue: 0, shadow: false, shadowX: 0, shadowY: 8, shadowBlur: 16, shadowOpacity: 25, shadowColor: '#000000' };
type Settings = typeof defaults;
const ranges = { filterStrength: [0, 100], strokeWidth: [1, 30], rotation: [-180, 180], opacity: [0, 100], radius: [0, 200], brightness: [0, 200], contrast: [0, 200], saturation: [0, 200], hue: [-180, 180], shadowX: [-100, 100], shadowY: [-100, 100], shadowBlur: [0, 100], shadowOpacity: [0, 100] } as const;
type NumericKey = keyof typeof ranges;
function readSettings(image: HTMLImageElement): Settings {
  let saved: Partial<Settings> = {};
  try { saved = JSON.parse(image.getAttribute('data-image-settings') || '{}') || {}; } catch { /* Unconfigured image. */ }
  const settings = { ...defaults };
  for (const key of Object.keys(ranges) as NumericKey[]) {
    const value = saved[key];
    if (typeof value === 'number' && Number.isFinite(value)) settings[key] = Math.max(ranges[key][0], Math.min(ranges[key][1], value));
  }
  for (const key of ['flipX', 'flipY', 'shadow', 'stroke'] as const) settings[key] = saved[key] === true;
  settings.locked = image.getAttribute('data-image-locked') === 'true';
  if (typeof saved.mask === 'string' && Object.hasOwn(masks, saved.mask)) settings.mask = saved.mask;
  if (typeof saved.preset === 'string' && Object.hasOwn(filters, saved.preset)) settings.preset = saved.preset;
  if (typeof saved.strokePosition === 'string' && Object.hasOwn(strokePositions, saved.strokePosition)) settings.strokePosition = saved.strokePosition;
  if (typeof saved.strokeStyle === 'string' && Object.hasOwn(borderStyles, saved.strokeStyle)) settings.strokeStyle = saved.strokeStyle;
  if (typeof saved.strokeColor === 'string' && /^#[\da-f]{6}$/i.test(saved.strokeColor)) settings.strokeColor = saved.strokeColor;
  if (typeof saved.shadowColor === 'string' && /^#[\da-f]{6}$/i.test(saved.shadowColor)) settings.shadowColor = saved.shadowColor;
  if (!image.hasAttribute('data-image-settings')) {
    const opacity = parseFloat(image.style.opacity);
    if (Number.isFinite(opacity)) settings.opacity = opacity * 100;
    settings.radius = parseFloat(image.style.borderRadius) || 0;
  }
  return settings;
}
function styles(settings: Settings): Record<string, string> {
  const rgb = [1, 3, 5].map(start => parseInt(settings.shadowColor.slice(start, start + 2), 16));
  const preset = settings.filterStrength > 0 ? filters[settings.preset].value(settings.filterStrength / 100) : '';
  return {
    outline: 'none', 'outline-offset': '0px',
    opacity: String(settings.opacity / 100), 'border-radius': `${settings.radius}px`,
    // 独立 scale 不覆盖拖动预览使用的 transform。
    scale: `${settings.flipX ? -1 : 1} ${settings.flipY ? -1 : 1}`,
    rotate: `${settings.rotation}deg`, 'transform-origin': '50% 50%',
    'clip-path': masks[settings.mask].clip, 'mask-image': masks[settings.mask].image,
    'mask-size': '100% 100%', 'mask-repeat': 'no-repeat',
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) hue-rotate(${settings.hue}deg)${preset ? ` ${preset}` : ''}`,
    'box-shadow': settings.shadow ? `${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px rgba(${rgb.join(',')},${settings.shadowOpacity / 100})` : 'none'
  };
}
export function registerImageSettings(editor: Editor): void {
  const strokes = registerImageStrokes(editor);
  let dispose: (() => void) | undefined;
  let disposing = false;
  editor.on('remove', () => { disposing = true; dispose?.(); });
  editor.ui.registry.addIcon('image-settings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/></svg>');
  editor.ui.registry.addButton('imagesettings', {
    icon: 'image-settings', tooltip: '图片设置',
    onAction: () => {
      if (editor.mode.isReadOnly() || dispose) return;
      const image = editor.selection.getNode().closest('img');
      if (!image || !editor.getBody().contains(image)) return;
      const doc = editor.getContainer().ownerDocument;
      const dialog = doc.createElement('dialog'); dialog.className = 'image-settings-dialog'; dialog.setAttribute('aria-label', '图片设置');
      const field = (key: NumericKey, label: string, unit: string) => `<label class="image-setting-range"><span>${label}<output data-output="${key}"></output></span><input type="range" name="${key}" aria-label="${label}" min="${ranges[key][0]}" max="${ranges[key][1]}" data-unit="${unit}"></label>`;
      dialog.innerHTML = `<header><div><h2>图片设置</h2><p>预览调整效果，应用后保存到图片</p></div><button type="button" data-close aria-label="关闭图片设置">×</button></header>
        <div class="image-settings-body"><div class="image-settings-preview"><img alt="图片效果预览"><span>效果预览</span></div><div class="image-settings-controls">
        <div role="tablist" aria-label="图片设置分类"><button type="button" role="tab" id="image-tab-source" aria-controls="image-panel-source" aria-selected="true" data-tab="source">图片</button><button type="button" role="tab" id="image-tab-appearance" aria-controls="image-panel-appearance" aria-selected="false" data-tab="appearance" tabindex="-1">外观</button><button type="button" role="tab" id="image-tab-shadow" aria-controls="image-panel-shadow" aria-selected="false" data-tab="shadow" tabindex="-1">阴影</button><button type="button" role="tab" id="image-tab-mask" aria-controls="image-panel-mask" aria-selected="false" data-tab="mask" tabindex="-1">蒙版</button><button type="button" role="tab" id="image-tab-filter" aria-controls="image-panel-filter" aria-selected="false" data-tab="filter" tabindex="-1">滤镜</button><button type="button" role="tab" id="image-tab-stroke" aria-controls="image-panel-stroke" aria-selected="false" data-tab="stroke" tabindex="-1">描边</button></div>
        <section role="tabpanel" id="image-panel-source" aria-labelledby="image-tab-source" data-section="source"><label class="image-settings-url">图片地址<input name="source" type="text" aria-label="图片地址"></label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden><button type="button" data-upload class="image-settings-upload">选择本地图片</button><p class="image-settings-hint">支持 PNG、JPG、WebP、GIF、SVG，最大 5 MB。替换保留位置和尺寸，重置旧裁剪。</p><div class="image-settings-checks"><label><input name="flipX" type="checkbox">水平翻转</label><label><input name="flipY" type="checkbox">垂直翻转</label><label><input name="locked" type="checkbox">锁定位置与尺寸</label></div><p class="image-settings-hint">锁定后仍可选中图片并在这里解锁。</p>${field('rotation', '旋转角度', '°')}<div class="image-settings-rotation"><button type="button" data-turn="-90">↶ 左转 90°</button><button type="button" data-turn="90">↷ 右转 90°</button></div></section>
        <section role="tabpanel" id="image-panel-appearance" aria-labelledby="image-tab-appearance" data-section="appearance" hidden>${field('opacity', '不透明度', '%')}${field('radius', '圆角', 'px')}${field('brightness', '亮度', '%')}${field('contrast', '对比度', '%')}${field('saturation', '饱和度', '%')}${field('hue', '色相', '°')}</section>
        <section role="tabpanel" id="image-panel-shadow" aria-labelledby="image-tab-shadow" data-section="shadow" hidden><label><input name="shadow" type="checkbox">启用阴影</label><label class="image-settings-color">阴影颜色<input name="shadowColor" type="color" aria-label="阴影颜色"></label>${field('shadowOpacity', '阴影不透明度', '%')}${field('shadowX', '水平偏移', 'px')}${field('shadowY', '垂直偏移', 'px')}${field('shadowBlur', '模糊半径', 'px')}</section>
        <section role="tabpanel" id="image-panel-mask" aria-labelledby="image-tab-mask" data-section="mask" hidden><p class="image-settings-hint">选择形状或渐隐效果，保留完整原图。</p><div class="image-settings-masks">${Object.entries(masks).map(([key, mask]) => `<button type="button" data-mask="${key}" aria-label="${mask.label}" aria-pressed="false"><i style="clip-path:${mask.clip};mask-image:${mask.image}"></i><span>${mask.label}</span></button>`).join('')}</div></section>
        <section role="tabpanel" id="image-panel-filter" aria-labelledby="image-tab-filter" data-section="filter" hidden><div class="image-settings-filters">${Object.entries(filters).map(([key, filter]) => `<button type="button" data-filter="${key}" aria-label="${filter.label}" aria-pressed="false"><i style="filter:${filter.value(1)}"></i><span>${filter.label}</span></button>`).join('')}</div>${field('filterStrength', '滤镜强度', '%')}<p class="image-settings-hint">滤镜与外观中的基础调色叠加，选择原图可移除滤镜。</p></section>
        <section role="tabpanel" id="image-panel-stroke" aria-labelledby="image-tab-stroke" data-section="stroke" hidden><label><input name="stroke" type="checkbox">启用描边</label><label class="image-settings-color">描边颜色<input name="strokeColor" type="color" aria-label="描边颜色"></label>${field('strokeWidth', '描边粗细', 'px')}<label class="image-settings-stroke-style">描边位置<select name="strokePosition" aria-label="描边位置">${Object.entries(strokePositions).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><label class="image-settings-stroke-style">描边预设<select name="strokeStyle" aria-label="描边预设">${Object.entries(borderStyles).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><p class="image-settings-hint">描边沿裁剪、圆角和蒙版处理后的最终轮廓生成，外描边可延伸至图片外。渐隐、柔边以 50% 透明度轮廓为边界。</p></section>
        </div></div><p class="image-settings-error" role="alert" hidden></p><footer><button type="button" data-reset>重置效果</button><div><button type="button" data-close>取消</button><button type="button" data-apply>应用设置</button></div></footer>`;
      const input = (name: string) => dialog.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      const preview = dialog.querySelector<HTMLImageElement>('.image-settings-preview img')!;
      const strokePreview = doc.createElement('span'); strokePreview.className = 'image-settings-stroke-preview'; strokePreview.setAttribute('aria-hidden', 'true'); preview.after(strokePreview);
      let previewVersion = 0;
      const error = dialog.querySelector<HTMLElement>('[role="alert"]')!;
      const applyButton = dialog.querySelector<HTMLButtonElement>('[data-apply]')!;
      const originalSource = image.getAttribute('src') || '';
      let source = originalSource, settings = readSettings(image), busy = false, closed = false, loadVersion = 0;
      let sourceReady: Promise<boolean> = Promise.resolve(true);
      const message = (text: string) => { error.textContent = text; error.hidden = !text; };
      const refresh = () => {
        for (const key of Object.keys(ranges) as NumericKey[]) {
          input(key).value = String(settings[key]);
          dialog.querySelector(`output[data-output="${key}"]`)!.textContent = `${settings[key]}${input(key).dataset.unit}`;
        }
        for (const key of ['flipX', 'flipY', 'locked', 'shadow', 'stroke'] as const) input(key).checked = settings[key];
        input('shadowColor').value = settings.shadowColor;
        input('strokeColor').value = settings.strokeColor;
        dialog.querySelector<HTMLSelectElement>('select[name="strokeStyle"]')!.value = settings.strokeStyle;
        dialog.querySelector<HTMLSelectElement>('select[name="strokePosition"]')!.value = settings.strokePosition;
        dialog.querySelectorAll<HTMLElement>('[data-filter]').forEach(button => {
          button.setAttribute('aria-pressed', String(button.dataset.filter === settings.preset));
          button.querySelector<HTMLElement>('i')!.style.backgroundImage = `url(${JSON.stringify(preview.src)})`;
        });
        dialog.querySelectorAll<HTMLElement>('[data-mask]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mask === settings.mask)));
        // 预览限制在可视区域内，不让旋转后的长图超出预览框。
        const original = imageGeometry(image);
        const angle = settings.rotation * Math.PI / 180;
        const aspect = source === originalSource ? original.width / original.height : (preview.naturalWidth / preview.naturalHeight || 1);
        const stage = dialog.querySelector<HTMLElement>('.image-settings-preview')!;
        const maxWidth = stage.clientWidth ? Math.min(220, Math.max(1, stage.clientWidth - 56)) : 220;
        const maxHeight = stage.clientHeight ? Math.min(220, Math.max(1, stage.clientHeight - 56)) : 220;
        const h = Math.min(maxHeight, maxWidth / (Math.abs(aspect * Math.cos(angle)) + Math.abs(Math.sin(angle))), maxHeight / (Math.abs(aspect * Math.sin(angle)) + Math.abs(Math.cos(angle))));
        preview.style.width = `${h * aspect}px`; preview.style.height = `${h}px`;
        // 原图和描边独立绘制，外描边不会被原图的 CSS 蒙版裁掉。
        for (const [name, value] of Object.entries(styles(settings))) preview.style.setProperty(name, value);
        preview.style.setProperty('object-view-box', source === originalSource ? image.style.getPropertyValue('object-view-box') : 'inset(0%)');
        const revision = ++previewVersion;
        strokePreview.hidden = !settings.stroke;
        if (settings.stroke) {
          let crop; try { crop = source === originalSource ? JSON.parse(image.getAttribute('data-image-crop') || 'null') ?? undefined : undefined; } catch { /* full image */ }
          createImageStroke(source, original.width, original.height, { ...settings }, crop).then(result => {
            if (closed || revision !== previewVersion) return;
            const ratioX = parseFloat(preview.style.width) / original.width, ratioY = parseFloat(preview.style.height) / original.height;
            Object.assign(strokePreview.style, {
              backgroundImage: `url("${result.url}")`, backgroundSize: '100% 100%',
              width: `${parseFloat(preview.style.width) + result.pad * ratioX * 2}px`, height: `${parseFloat(preview.style.height) + result.pad * ratioY * 2}px`,
              left: `${preview.offsetLeft - result.pad * ratioX}px`, top: `${preview.offsetTop - result.pad * ratioY}px`,
              rotate: preview.style.rotate, scale: preview.style.scale, opacity: preview.style.opacity
            });
          }).catch(reason => { if (!closed && revision === previewVersion) { strokePreview.hidden = true; message(reason.message); } });
        }

      };
      const changeSource = (value: string) => {
        source = value.trim(); input('source').value = source;
        const version = ++loadVersion; message('');
        let url: URL;
        try { url = new URL(source, doc.baseURI); } catch { message('请输入有效的图片地址。'); sourceReady = Promise.resolve(false); return; }
        if (!source || (!['https:', 'http:', 'blob:'].includes(url.protocol) && !/^data:image\//i.test(source))) {
          message('请选择图片文件，或使用 HTTP / HTTPS 图片地址。'); sourceReady = Promise.resolve(false); return;
        }
        sourceReady = new Promise<boolean>(resolve => {
          const candidate = new Image();
          const timer = window.setTimeout(() => finish(false), 15000);
          const finish = (ok: boolean) => {
            window.clearTimeout(timer); candidate.onload = candidate.onerror = null;
            if (!closed && version === loadVersion) {
              if (ok) { preview.src = source; message(''); refresh(); }
              else message('图片加载失败，请检查文件或图片地址。');
            }
            resolve(ok);
          };
          candidate.onload = () => finish(candidate.naturalWidth > 0);
          candidate.onerror = () => finish(false); candidate.src = source;
        });
        refresh();
      };
      const close = () => {
        closed = true; ++loadVersion; window.removeEventListener('resize', refresh); dialog.remove(); dispose = undefined;
        if (!disposing && !editor.removed && image.isConnected) { editor.focus(); editor.selection.select(image); editor.nodeChanged(); editor.dispatch('ResizeContent'); }
      };
      dispose = close;
      input('source').value = source; preview.onload = refresh; preview.src = source; refresh();
      dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-tab]'));
      const selectTab = (tab: HTMLButtonElement) => {
        for (const button of tabs) { button.setAttribute('aria-selected', String(button === tab)); button.tabIndex = button === tab ? 0 : -1; }
        dialog.querySelectorAll<HTMLElement>('[data-section]').forEach(panel => { panel.hidden = panel.dataset.section !== tab.dataset.tab; });
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          event.preventDefault(); selectTab(tabs[next]!); tabs[next]!.focus();
        });
      });
      dialog.addEventListener('input', event => {
        const target = event.target as HTMLInputElement;
        if (target.name in ranges) settings[target.name as NumericKey] = Number(target.value);
        else if (['flipX', 'flipY', 'locked', 'shadow', 'stroke'].includes(target.name)) settings[target.name as 'flipX'] = target.checked;
        else if (target.name === 'shadowColor') settings.shadowColor = target.value;
        else if (target.name === 'strokeColor') settings.strokeColor = target.value;
        else if (target.name === 'strokePosition') settings.strokePosition = target.value as Settings['strokePosition'];
        else if (target.name === 'strokeStyle') settings.strokeStyle = target.value as BorderStyle;
        else return;
        refresh();
      });
      dialog.querySelectorAll<HTMLElement>('[data-turn]').forEach(button => button.addEventListener('click', () => {
        settings.rotation = ((settings.rotation + Number(button.dataset.turn) + 180 + 360) % 360) - 180; refresh();
      }));
      dialog.querySelectorAll<HTMLElement>('[data-mask]').forEach(button => button.addEventListener('click', () => {
        settings.mask = button.dataset.mask as Mask; refresh();
      }));
      dialog.querySelectorAll<HTMLElement>('[data-filter]').forEach(button => button.addEventListener('click', () => {
        settings.preset = button.dataset.filter as Filter; refresh();
      }));
      input('source').addEventListener('change', () => changeSource(input('source').value));
      const fileInput = dialog.querySelector<HTMLInputElement>('input[type="file"]')!;
      dialog.querySelector('[data-upload]')!.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0]; if (!file) return;
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) { message('请选择不超过 5 MB 的图片文件。'); return; }
        busy = true; applyButton.disabled = true;
        const reader = new FileReader();
        reader.onload = () => { busy = false; applyButton.disabled = false; if (!closed) changeSource(String(reader.result)); };
        reader.onerror = () => { busy = false; applyButton.disabled = false; if (!closed) message('图片文件读取失败，请重新选择。'); };
        reader.readAsDataURL(file);
      });
      dialog.querySelector('[data-reset]')!.addEventListener('click', () => { settings = { ...defaults, locked: settings.locked }; refresh(); });
      applyButton.addEventListener('click', async () => {
        if (busy || editor.mode.isReadOnly() || !image.isConnected) return;
        if (input('source').value.trim() !== source) changeSource(input('source').value);
        busy = true; applyButton.disabled = true;
        const version = loadVersion, valid = await sourceReady;
        let strokeResult: Awaited<ReturnType<typeof createImageStroke>> | undefined;
        const appliedSettings = JSON.stringify(settings);
        if (valid && settings.stroke) {
          const box = imageGeometry(image);
          let crop; try { crop = source === originalSource ? JSON.parse(image.getAttribute('data-image-crop') || 'null') ?? undefined : undefined; } catch { /* full image */ }
          try { strokeResult = await createImageStroke(source, box.width, box.height, { ...settings }, crop); }
          catch (reason) { busy = false; applyButton.disabled = false; if (!closed) message((reason as Error).message); return; }
        }
        busy = false; applyButton.disabled = false;
        if (appliedSettings !== JSON.stringify(settings)) return;
        if (!valid || closed || version !== loadVersion || editor.removed || editor.mode.isReadOnly() || !image.isConnected) return;
        editor.undoManager.transact(() => {
          if (source !== originalSource) {
            const box = imageGeometry(image);
            editor.dom.setAttrib(image, 'src', source); editor.dom.setAttrib(image, 'data-mce-src', source);
            editor.dom.setAttrib(image, 'data-image-crop', null); editor.dom.setStyle(image, 'object-view-box', null);
            editor.dom.setStyles(image, { width: `${box.width}px`, height: `${box.height}px` });
          }
          editor.dom.setStyles(image, styles(settings));
          editor.dom.setAttrib(image, 'data-image-settings', JSON.stringify(settings));
          editor.dom.setAttrib(image, 'data-image-locked', settings.locked ? 'true' : null);
          if (strokeResult) strokes.write(image, strokeResult);
          else {
            const id = image.getAttribute('data-image-stroke-id');
            for (const layer of editor.getBody().querySelectorAll('[data-image-stroke-for]')) if (layer.getAttribute('data-image-stroke-for') === id) layer.remove();
            editor.dom.setAttrib(image, 'data-image-stroke-id', null);
          }
        });
        close(); editor.dispatch('change'); editor.dispatch('ScrollContent');
      });
      doc.body.append(dialog); dialog.showModal(); refresh(); window.addEventListener('resize', refresh);
    }
  });
}
