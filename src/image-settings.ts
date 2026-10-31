import type { Editor } from 'tinymce';
import './image-settings.css';
import { imageEffectDefaults, imageEffectRanges, imageEffectPresets, effectPresetPatch, effectCategories, decorations, hasImageOverlay, type EffectCategory } from './image-effects';
import { installColorPickers } from './text-color-picker';
import { parseShadowColor } from './text-shadow';
import { readCrop, cropViewBox, type Crop, type CropDraftRequest } from './image-crop';
import { outerLayerObject, readObjectLayers, setObjectLayerPosition } from './object-layers';
import { imageGeometry } from './image-geometry';
import { createImageStroke, registerImageStrokes, strokePositions, strokePresets } from './image-stroke';

import { imageMasks as masks, maskCategories, maskStyle, importImageMask, validCustomMask, rasterizePresetMask, type MaskCategory } from './image-masks';
type Mask = string;
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
const defaults = { ...imageEffectDefaults, flipX: false, flipY: false, locked: false, rotation: 0, mask: 'none' as Mask, maskSource: '', maskName: '', maskRasterKey: '', maskRasterSource: '', preset: 'none' as Filter, filterStrength: 100, stroke: false, strokeWidth: 4, strokeColor: '#ffffff', strokeStyle: 'solid' as BorderStyle, strokePosition: 'inside' as keyof typeof strokePositions, opacity: 100, radius: 0, brightness: 100, contrast: 100, saturation: 100, hue: 0, shadow: false, shadowX: 0, shadowY: 8, shadowBlur: 16, shadowOpacity: 25, shadowColor: '#000000' };
type Settings = typeof defaults;
const ranges = { ...imageEffectRanges, filterStrength: [0, 100], strokeWidth: [1, 30], rotation: [-180, 180], opacity: [0, 100], radius: [0, 200], brightness: [0, 200], contrast: [0, 200], saturation: [0, 200], hue: [-180, 180], shadowX: [-100, 100], shadowY: [-100, 100], shadowBlur: [0, 100], shadowOpacity: [0, 100] } as const;
type NumericKey = keyof typeof ranges;
function readSettings(image: HTMLImageElement): Settings {
  let saved: Partial<Settings> = {};
  try { saved = JSON.parse(image.getAttribute('data-image-settings') || '{}') || {}; } catch { /* Unconfigured image. */ }
  const settings = { ...defaults };
  for (const key of Object.keys(ranges) as NumericKey[]) {
    const value = saved[key];
    if (typeof value === 'number' && Number.isFinite(value)) settings[key] = Math.max(ranges[key][0], Math.min(ranges[key][1], value));
  }
  for (const key of ['flipX', 'flipY', 'shadow', 'stroke', 'glow', 'strokeDouble'] as const) settings[key] = saved[key] === true;
  settings.locked = image.getAttribute('data-image-locked') === 'true';
  settings.shadowMode = saved.shadowMode === 'contour' ? 'contour' : 'box';
  if (saved.decoration && Object.hasOwn(decorations, saved.decoration)) settings.decoration = saved.decoration;
  for (const key of ['glowColor', 'decorationColor', 'strokeOuterColor'] as const) if (typeof saved[key] === 'string' && parseShadowColor(saved[key], image.ownerDocument)) settings[key] = saved[key];
  if (saved.effectPreset && (saved.effectPreset === 'custom' || imageEffectPresets.some(p => p.id === saved.effectPreset))) settings.effectPreset = saved.effectPreset;
  if (typeof saved.mask === 'string' && Object.hasOwn(masks, saved.mask)) settings.mask = saved.mask;
  if (validCustomMask(saved.maskSource)) {
    settings.maskSource = saved.maskSource; settings.maskName = typeof saved.maskName === 'string' ? saved.maskName.slice(0, 80) : '自定义蒙版';
    if (saved.mask === 'custom') settings.mask = 'custom';
  }
  if (saved.maskRasterKey === settings.mask && masks[settings.mask]?.asset && validCustomMask(saved.maskRasterSource)) {
    settings.maskRasterKey = settings.mask; settings.maskRasterSource = saved.maskRasterSource;
  }
  if (typeof saved.preset === 'string' && Object.hasOwn(filters, saved.preset)) settings.preset = saved.preset;
  if (typeof saved.strokePosition === 'string' && Object.hasOwn(strokePositions, saved.strokePosition)) settings.strokePosition = saved.strokePosition;
  if (typeof saved.strokeStyle === 'string' && Object.hasOwn(borderStyles, saved.strokeStyle)) settings.strokeStyle = saved.strokeStyle;
  if (typeof saved.strokeColor === 'string' && parseShadowColor(saved.strokeColor, image.ownerDocument)) settings.strokeColor = saved.strokeColor;
  if (typeof saved.shadowColor === 'string' && /^#[\da-f]{6}$/i.test(saved.shadowColor)) settings.shadowColor = saved.shadowColor;
  if (!saved.effectPreset && (settings.stroke || settings.shadow || settings.glow || settings.decoration !== 'none')) settings.effectPreset = 'custom';
  if (!image.hasAttribute('data-image-settings')) {
    const opacity = parseFloat(image.style.opacity);
    if (Number.isFinite(opacity)) settings.opacity = opacity * 100;
    settings.radius = parseFloat(image.style.borderRadius) || 0;
  }
  return settings;
}
function styles(settings: Settings): Record<string, string> {
  const rgb = [1, 3, 5].map(start => parseInt(settings.shadowColor.slice(start, start + 2), 16));
  const mask = maskStyle(settings.mask, settings.mask === 'custom' ? settings.maskSource : settings.maskRasterKey === settings.mask ? settings.maskRasterSource : '');
  const preset = settings.filterStrength > 0 ? filters[settings.preset].value(settings.filterStrength / 100) : '';
  return {
    outline: 'none', 'outline-offset': '0px',
    opacity: String(settings.opacity / 100), 'border-radius': `${settings.radius}px`,
    // 独立 scale 不覆盖拖动预览使用的 transform。
    scale: `${settings.flipX ? -1 : 1} ${settings.flipY ? -1 : 1}`,
    rotate: `${settings.rotation}deg`, 'transform-origin': '50% 50%',
    'clip-path': mask.clip, 'mask-image': mask.image, 'mask-mode': 'alpha',
    'mask-size': '100% 100%', 'mask-repeat': 'no-repeat',
    filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) hue-rotate(${settings.hue}deg)${preset ? ` ${preset}` : ''}`,
    'box-shadow': settings.shadow && settings.shadowMode === 'box' ? `${settings.shadowX}px ${settings.shadowY}px ${settings.shadowBlur}px rgba(${rgb.join(',')},${settings.shadowOpacity / 100})` : 'none'
  };
}
export function registerImageSettings(editor: Editor): void {
  const strokes = registerImageStrokes(editor);
  let dispose: (() => void) | undefined;
  let disposePanel: (() => void) | undefined;
  let disposing = false;
  editor.on('remove', () => { disposing = true; dispose?.(); disposePanel?.(); });
  editor.ui.registry.addIcon('image-settings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/></svg>');
  editor.addCommand('ImageSettingsPanel', (_ui, value) => {
    disposePanel?.();
    if (value?.host && value?.image) open(value);
  });
  editor.ui.registry.addButton('imagesettings', {
    icon: 'image-settings', tooltip: '图片设置', onAction: () => open()
  });
  function open(panel?: { host: HTMLElement; image: HTMLImageElement; tab?: string; onClose: () => void }) {
      if (editor.mode.isReadOnly() || (!panel && dispose)) return;
      const image = panel?.image ?? editor.selection.getNode().closest('img');
      if (!image || !editor.getBody().contains(image)) return;
      const doc = editor.getContainer().ownerDocument;
      const dialog = doc.createElement(panel ? 'div' : 'dialog'); dialog.className = panel ? 'image-settings-dialog image-settings-embedded' : 'image-settings-dialog'; dialog.setAttribute('aria-label', '图片设置');
      const field = (key: NumericKey, label: string, unit: string) => `<label class="image-setting-range"><span>${label}<output data-output="${key}"></output></span><input type="range" name="${key}" aria-label="${label}" min="${ranges[key][0]}" max="${ranges[key][1]}" data-unit="${unit}"></label>`;
      dialog.innerHTML = `<header><div><h2>图片设置</h2><p>预览调整效果，应用后保存到图片</p></div><button type="button" data-close aria-label="关闭图片设置">×</button></header>
        <div class="image-settings-body"><div class="image-settings-preview"><img alt="图片效果预览"><span>效果预览</span></div><div class="image-settings-controls">
        <div role="tablist" aria-label="图片设置分类"><button type="button" role="tab" id="image-tab-source" aria-controls="image-panel-source" aria-selected="true" data-tab="source">图片</button><button type="button" role="tab" id="image-tab-appearance" aria-controls="image-panel-appearance" aria-selected="false" data-tab="appearance" tabindex="-1">外观</button><button type="button" role="tab" id="image-tab-effects" aria-controls="image-panel-effects" aria-selected="false" data-tab="effects" tabindex="-1">特效</button><button type="button" role="tab" id="image-tab-shadow" aria-controls="image-panel-shadow" aria-selected="false" data-tab="shadow" tabindex="-1">阴影</button><button type="button" role="tab" id="image-tab-mask" aria-controls="image-panel-mask" aria-selected="false" data-tab="mask" tabindex="-1">蒙版</button><button type="button" role="tab" id="image-tab-filter" aria-controls="image-panel-filter" aria-selected="false" data-tab="filter" tabindex="-1">滤镜</button><button type="button" role="tab" id="image-tab-stroke" aria-controls="image-panel-stroke" aria-selected="false" data-tab="stroke" tabindex="-1">描边</button><button type="button" role="tab" id="image-tab-layout" aria-controls="image-panel-layout" aria-selected="false" data-tab="layout" tabindex="-1">排版</button></div>
        <section role="tabpanel" id="image-panel-source" aria-labelledby="image-tab-source" data-section="source"><h3 class="image-settings-section-title">插入 / 编辑图片</h3><label class="image-settings-url">图片地址<input name="source" type="text" aria-label="图片地址"></label><input type="file" data-image-file aria-label="图片文件" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden><button type="button" data-upload class="image-settings-upload">选择本地图片</button><p class="image-settings-hint">支持 PNG、JPG、WebP、GIF、SVG，最大 5 MB。替换保留位置和尺寸，重置旧裁剪。</p><label class="image-settings-url">图片描述<input name="alt" type="text" aria-label="图片描述"></label><label class="image-settings-url">图片标题<input name="title" type="text" aria-label="图片标题"></label>
        <div class="image-settings-dimensions"><label>宽度（px）<input name="width" type="number" min="1" max="20000" aria-label="图片宽度"></label><label>高度（px）<input name="height" type="number" min="1" max="20000" aria-label="图片高度"></label></div>
        <label class="image-settings-ratio"><input name="keepRatio" type="checkbox" checked>保持宽高比</label><button type="button" data-crop class="image-settings-upload">裁剪图片</button>
        <div class="image-settings-checks"><label><input name="flipX" type="checkbox">水平翻转</label><label><input name="flipY" type="checkbox">垂直翻转</label><label><input name="locked" type="checkbox">锁定位置与尺寸</label></div><p class="image-settings-hint">锁定后仍可选中图片并在这里解锁。</p>${field('rotation', '旋转角度', '°')}<div class="image-settings-rotation"><button type="button" data-turn="-90">↶ 左转 90°</button><button type="button" data-turn="90">↷ 右转 90°</button></div></section>
        <section role="tabpanel" id="image-panel-layout" aria-labelledby="image-tab-layout" data-section="layout" hidden>
        <h3 class="image-settings-section-title">图片对齐</h3><div class="image-settings-align" role="group" aria-label="图片对齐">${[['left', '左对齐'], ['center', '居中对齐'], ['right', '右对齐']].map(([value, label]) => `<button type="button" data-align="${value}" aria-pressed="false">${label}</button>`).join('')}</div>
        <h3 class="image-settings-section-title">图层设置 <span data-layer-position></span></h3><div class="image-settings-layers" role="group" aria-label="图层设置">${[['forward', '上一层'], ['backward', '下一层'], ['top', '置于顶层'], ['bottom', '置于底层']].map(([value, label]) => `<button type="button" data-layer="${value}">${label}</button>`).join('')}</div>
        <p class="image-settings-hint">调整与文字、图片和弹幕的遮挡顺序，点击“应用设置”后生效。</p></section>
        <section role="tabpanel" id="image-panel-appearance" aria-labelledby="image-tab-appearance" data-section="appearance" hidden>${field('opacity', '不透明度', '%')}${field('radius', '圆角', 'px')}${field('brightness', '亮度', '%')}${field('contrast', '对比度', '%')}${field('saturation', '饱和度', '%')}${field('hue', '色相', '°')}</section>
        <section role="tabpanel" id="image-panel-effects" aria-labelledby="image-tab-effects" data-section="effects" hidden>
          <div class="image-effect-categories" role="group" aria-label="特效分类">${Object.entries(effectCategories).map(([key, label]) => `<button type="button" data-effect-category="${key}" aria-pressed="${key === 'popular'}">${label}</button>`).join('')}</div>
          <div class="image-effect-presets" role="group" aria-label="图片特效预设">${imageEffectPresets.map(preset => `<button type="button" data-effect="${preset.id}" aria-pressed="false" aria-label="${preset.label}"><i class="image-effect-thumb"><img alt=""><span></span></i><span>${preset.label}</span></button>`).join('')}</div>
          <p class="image-settings-hint">当前：<span data-effect-name>无特效</span>。预设可叠加蒙版和滤镜；描边、投影可在对应页签微调。</p>
          <h3 class="image-settings-section-title">发光</h3><label><input name="glow" type="checkbox">启用发光</label>
          <label class="image-settings-color"><span>发光颜色</span><span class="image-settings-color-controls"><input type="color" aria-label="选择发光颜色" data-color-opacity="[name=glowOpacity]"><input name="glowColor" type="text" aria-label="发光颜色" spellcheck="false"></span></label>${field('glowRadius', '发光范围', 'px')}${field('glowOpacity', '发光强度', '%')}
          <h3 class="image-settings-section-title">装饰</h3><label class="image-settings-stroke-style">装饰样式<select name="decoration" aria-label="装饰样式">${Object.entries(decorations).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}</select></label>
          <label class="image-settings-color"><span>装饰颜色</span><span class="image-settings-color-controls"><input type="color" aria-label="选择装饰颜色"><input name="decorationColor" type="text" aria-label="装饰颜色" spellcheck="false"></span></label>${field('decorationSize', '装饰大小', 'px')}${field('decorationCount', '装饰数量', '个')}${field('decorationSpread', '装饰间距', 'px')}
          <p class="image-settings-hint">轮廓特效根据图片透明区域生成，使用本地图片或允许跨域读取的图片地址。</p>
        </section>
        <section role="tabpanel" id="image-panel-shadow" aria-labelledby="image-tab-shadow" data-section="shadow" hidden><label><input name="shadow" type="checkbox">启用阴影</label><label class="image-settings-stroke-style">投影方式<select name="shadowMode" aria-label="投影方式"><option value="box">矩形投影</option><option value="contour">贴合透明轮廓</option></select></label><label class="image-settings-color"><span>阴影颜色</span><span class="image-settings-color-controls"><input data-image-color="shadowColor" type="color" aria-label="选择阴影颜色"><input name="shadowColor" type="text" aria-label="阴影颜色" spellcheck="false"></span></label>${field('shadowOpacity', '阴影不透明度', '%')}${field('shadowX', '水平偏移', 'px')}${field('shadowY', '垂直偏移', 'px')}${field('shadowBlur', '模糊半径', 'px')}</section>
        <section role="tabpanel" id="image-panel-mask" aria-labelledby="image-tab-mask" data-section="mask" hidden><div class="image-mask-summary"><span>当前蒙版</span><strong data-mask-name></strong></div>
        <div class="image-mask-library"><div class="image-mask-categories" role="group" aria-label="蒙版分类">${Object.entries(maskCategories).map(([key, label]) => `<button type="button" data-mask-category="${key}" aria-pressed="false">${label}</button>`).join('')}</div>
        <div class="image-settings-masks"><button type="button" data-mask-upload aria-label="上传自定义蒙版"><i class="image-mask-plus">＋</i><span>上传蒙版</span></button>${Object.entries(masks).map(([key, mask]) => `<button type="button" data-mask="${key}" aria-label="${mask.label}" aria-pressed="false"><i></i><span>${mask.label}</span></button>`).join('')}<button type="button" data-mask="custom" aria-label="自定义蒙版" aria-pressed="false" hidden><i></i><span>自定义</span></button></div></div>
        <details class="image-mask-import"><summary>自定义蒙版说明</summary><label>识别方式<select data-mask-mode aria-label="蒙版识别方式"><option value="auto">自动识别</option><option value="alpha">透明通道</option><option value="luminance">黑白明度</option></select></label><p>透明图片按透明区域裁切；不透明图片中白色保留、黑色隐藏。支持 PNG、JPG、WebP、GIF、SVG，最大 5 MB。</p></details>
        <input type="file" data-mask-file aria-label="蒙版文件" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden>
        <p class="image-settings-hint">保留完整原图。选择“无蒙版”可恢复；裁剪、描边和特效可继续叠加。</p></section>
        <section role="tabpanel" id="image-panel-filter" aria-labelledby="image-tab-filter" data-section="filter" hidden><div class="image-settings-filters">${Object.entries(filters).map(([key, filter]) => `<button type="button" data-filter="${key}" aria-label="${filter.label}" aria-pressed="false"><i style="filter:${filter.value(1)}"></i><span>${filter.label}</span></button>`).join('')}</div>${field('filterStrength', '滤镜强度', '%')}<p class="image-settings-hint">滤镜与外观中的基础调色叠加，选择原图可移除滤镜。</p></section>
        <section role="tabpanel" id="image-panel-stroke" aria-labelledby="image-tab-stroke" data-section="stroke" hidden><label><input name="stroke" type="checkbox">启用描边</label><label class="image-settings-color"><span>描边颜色</span><span class="image-settings-color-controls"><input data-image-color="strokeColor" type="color" aria-label="选择描边颜色"><input name="strokeColor" type="text" aria-label="描边颜色" spellcheck="false"></span></label>${field('strokeWidth', '描边粗细', 'px')}<label><input name="strokeDouble" type="checkbox">启用双层描边</label><label class="image-settings-color"><span>外层颜色</span><span class="image-settings-color-controls"><input type="color" aria-label="选择外层颜色"><input name="strokeOuterColor" type="text" aria-label="外层颜色" spellcheck="false"></span></label>${field('strokeOuterWidth', '外层粗细', 'px')}<label class="image-settings-stroke-style">描边位置<select name="strokePosition" aria-label="描边位置">${Object.entries(strokePositions).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><label class="image-settings-stroke-style">描边预设<select name="strokeStyle" aria-label="描边预设">${Object.entries(borderStyles).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></label><p class="image-settings-hint">描边沿裁剪、圆角和蒙版处理后的最终轮廓生成，外描边可延伸至图片外。渐隐、柔边以 50% 透明度轮廓为边界。</p></section>
        </div></div><p class="image-settings-error" role="alert" hidden></p><footer><button type="button" data-reset>重置效果</button><div><button type="button" data-close>取消</button><button type="button" data-apply>应用设置</button></div></footer>`;
      if (panel) {
        dialog.querySelector('header h2')!.textContent = '图片配置';
        dialog.querySelector('header p')!.textContent = '调整即时生效，可撤销';
        dialog.querySelector('header [data-close]')!.setAttribute('aria-label', '收起图片配置');
        dialog.querySelectorAll('.image-settings-hint').forEach(node => {
          const textNodes = doc.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          while (textNodes.nextNode()) {
            const text = textNodes.currentNode;
            text.nodeValue = text.nodeValue!.replaceAll('点击“应用设置”后生效', '调整即时生效');
          }
        });
        dialog.querySelectorAll('[id], [aria-controls], [aria-labelledby]').forEach(node => {
          for (const key of ['id', 'aria-controls', 'aria-labelledby']) {
            const value = node.getAttribute(key); if (value) node.setAttribute(key, 'sidebar-' + value);
          }
        });
      }
      const input = (name: string) => dialog.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
      const preview = dialog.querySelector<HTMLImageElement>('.image-settings-preview img')!;
      const strokePreview = doc.createElement('span'); strokePreview.className = 'image-settings-stroke-preview'; strokePreview.setAttribute('aria-hidden', 'true'); preview.after(strokePreview);
      let previewVersion = 0;
      let effectCategory: EffectCategory = 'popular';
      let colorPickers: ReturnType<typeof installColorPickers> | undefined;
      const error = dialog.querySelector<HTMLElement>('[role="alert"]')!;
      const applyButton = dialog.querySelector<HTMLButtonElement>('[data-apply]')!;
      let originalSource = image.getAttribute('src') || '';
      let source = originalSource, settings = readSettings(image), busy = false, closed = false, loadVersion = 0;
      let originalGeometry = imageGeometry(image), originalCrop = readCrop(image);
      let crop: Crop = { ...originalCrop }, width = originalGeometry.width, height = originalGeometry.height;
      let dimensionRatio = width / height;
      let alignment = '', layerPosition = readObjectLayers(editor.getBody()).indexOf(outerLayerObject(image)) + 1;
      let originalLayerPosition = layerPosition, appliedAlignment = alignment;
      let alt = image.getAttribute('alt') ?? '', title = image.getAttribute('title') ?? '';
      const snapshot = () => JSON.stringify({ source, settings, crop, width, height, alignment, layerPosition, alt, title });
      const validSize = () => [width, height].every(value => Number.isFinite(value) && value >= 1 && value <= 20000);
      let maskCategory: MaskCategory = masks[settings.mask]?.category ?? 'basic';
      let maskLoading = false, maskVersion = 0;
      let sourceReady: Promise<boolean> = Promise.resolve(true);
      let initialized = false, committing = false, timer: ReturnType<typeof setTimeout> | undefined;
      let committed = snapshot();
      const scheduleCommit = () => {
        if (!panel || !initialized || closed || committed === snapshot()) return;
        clearTimeout(timer);
        timer = setTimeout(() => { if (!closed) void commit(); }, 0);
      };
      const message = (text: string) => { error.textContent = text; error.hidden = !text; };
      const renderEffects = () => {
        dialog.querySelectorAll<HTMLElement>('[data-effect-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.effectCategory === effectCategory)));
        dialog.querySelector('[data-effect-name]')!.textContent = imageEffectPresets.find(p => p.id === settings.effectPreset)?.label ?? '自定义';
        const key = JSON.stringify([source, width, height, crop, settings.mask, settings.maskSource, settings.radius, settings.preset, settings.filterStrength]);
        for (const preset of imageEffectPresets) {
          const button = dialog.querySelector<HTMLButtonElement>(`[data-effect="${preset.id}"]`)!;
          button.hidden = preset.id !== 'none' && (effectCategory === 'popular' ? !preset.popular : preset.category !== effectCategory);
          button.setAttribute('aria-pressed', String(settings.effectPreset === preset.id));
          if (button.hidden || button.dataset.previewKey === key || !validSize()) continue;
          button.dataset.previewKey = key; button.removeAttribute('data-preview-ready');
          const thumb = button.querySelector<HTMLImageElement>('img')!, overlay = button.querySelector<HTMLElement>('.image-effect-thumb>span')!;
          const ratio = 48 / Math.max(width, height), tw = width * ratio, th = height * ratio;
          const previewSettings = { ...settings, ...effectPresetPatch(preset.id), rotation: 0, flipX: false, flipY: false };
          for (const name of ['strokeWidth', 'strokeOuterWidth', 'shadowX', 'shadowY', 'shadowBlur', 'glowRadius', 'decorationSize', 'decorationSpread', 'radius'] as const) previewSettings[name] *= ratio;
          thumb.src = source; thumb.style.width = `${tw}px`; thumb.style.height = `${th}px`;
          for (const [name, value] of Object.entries(styles(previewSettings))) thumb.style.setProperty(name, value);
          thumb.style.setProperty('object-view-box', cropViewBox(crop)); overlay.style.backgroundImage = 'none';
          if (!hasImageOverlay(previewSettings)) { button.dataset.previewReady = 'true'; continue; }
          createImageStroke(source, tw, th, previewSettings, { ...crop }).then(result => {
            if (closed || button.dataset.previewKey !== key) return;
            Object.assign(overlay.style, { backgroundImage: `url("${result.url}")`, width: `${result.width}px`, height: `${result.height}px` });
            button.dataset.previewReady = 'true';
          }).catch(() => { if (!closed && button.dataset.previewKey === key) button.title = '此图片无法读取轮廓，请使用本地图片'; });
        }
      };
      const refresh = () => {
        if (closed) return;
        scheduleCommit();
        renderEffects();
        input('width').value = Number.isFinite(width) ? String(Math.round(width * 100) / 100) : '';
        input('height').value = Number.isFinite(height) ? String(Math.round(height * 100) / 100) : '';
        input('alt').value = alt; input('title').value = title;
        for (const name of ['width', 'height']) input(name).disabled = settings.locked;
        dialog.querySelector<HTMLButtonElement>('[data-crop]')!.disabled = settings.locked;
        dialog.querySelectorAll<HTMLButtonElement>('[data-align]').forEach(button => { button.disabled = settings.locked; button.setAttribute('aria-pressed', String(button.dataset.align === alignment)); });
        const layerCount = readObjectLayers(editor.getBody()).length;
        dialog.querySelector('[data-layer-position]')!.textContent = `第 ${layerPosition} / ${layerCount} 层`;
        dialog.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(button => { button.disabled = settings.locked || (['top', 'forward'].includes(button.dataset.layer!) ? layerPosition >= layerCount : layerPosition <= 1); });
        for (const key of Object.keys(ranges) as NumericKey[]) {
          input(key).value = String(settings[key]);
          dialog.querySelector(`output[data-output="${key}"]`)!.textContent = `${settings[key]}${input(key).dataset.unit}`;
        }
        for (const key of ['flipX', 'flipY', 'locked', 'shadow', 'stroke', 'glow', 'strokeDouble'] as const) input(key).checked = settings[key];
        input('strokeOuterColor').value = settings.strokeOuterColor; input('glowColor').value = settings.glowColor; input('decorationColor').value = settings.decorationColor;
        dialog.querySelector<HTMLSelectElement>('select[name=decoration]')!.value = settings.decoration;
        dialog.querySelector<HTMLSelectElement>('select[name=shadowMode]')!.value = settings.shadowMode;
        input('shadowColor').value = settings.shadowColor;
        input('strokeColor').value = settings.strokeColor;
        colorPickers?.refresh();
        dialog.querySelector<HTMLSelectElement>('select[name="strokeStyle"]')!.value = settings.strokeStyle;
        dialog.querySelector<HTMLSelectElement>('select[name="strokePosition"]')!.value = settings.strokePosition;
        dialog.querySelectorAll<HTMLElement>('[data-filter]').forEach(button => {
          button.setAttribute('aria-pressed', String(button.dataset.filter === settings.preset));
          button.querySelector<HTMLElement>('i')!.style.backgroundImage = `url(${JSON.stringify(preview.src)})`;
        });
        dialog.querySelector('[data-mask-name]')!.textContent = settings.mask === 'custom' ? settings.maskName || '自定义蒙版' : masks[settings.mask]!.label;
        dialog.querySelectorAll<HTMLButtonElement>('[data-mask-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.maskCategory === maskCategory)));
        dialog.querySelector<HTMLElement>('[data-mask-upload]')!.hidden = maskCategory !== 'basic';
        dialog.querySelectorAll<HTMLElement>('[data-mask]').forEach(button => {
          const key = button.dataset.mask!;
          button.hidden = key === 'custom' ? maskCategory !== 'basic' || !settings.maskSource : masks[key]!.category !== maskCategory;
          button.setAttribute('aria-pressed', String(key === settings.mask));
          const icon = button.querySelector<HTMLElement>('i')!, style = maskStyle(key, key === 'custom' ? settings.maskSource : '');
          icon.style.clipPath = style.clip; icon.style.maskImage = style.image;
        });
        // 预览限制在可视区域内，不让旋转后的长图超出预览框。
        const original = imageGeometry(image);
        const angle = settings.rotation * Math.PI / 180;
        const aspect = validSize() ? width / height : original.width / original.height;
        const stage = dialog.querySelector<HTMLElement>('.image-settings-preview')!;
        const maxWidth = stage.clientWidth ? Math.min(220, Math.max(1, stage.clientWidth - 56)) : 220;
        const maxHeight = stage.clientHeight ? Math.min(220, Math.max(1, stage.clientHeight - 56)) : 220;
        const h = Math.min(maxHeight, maxWidth / (Math.abs(aspect * Math.cos(angle)) + Math.abs(Math.sin(angle))), maxHeight / (Math.abs(aspect * Math.sin(angle)) + Math.abs(Math.cos(angle))));
        preview.style.width = `${h * aspect}px`; preview.style.height = `${h}px`;
        // 原图和描边独立绘制，外描边不会被原图的 CSS 蒙版裁掉。
        for (const [name, value] of Object.entries(styles(settings))) preview.style.setProperty(name, value);
        preview.style.setProperty('object-view-box', cropViewBox(crop));
        const revision = ++previewVersion;
        strokePreview.hidden = !hasImageOverlay(settings);
        if (hasImageOverlay(settings)) {
          createImageStroke(source, width, height, { ...settings }, { ...crop }).then(result => {
            if (closed || revision !== previewVersion) return;
            const ratioX = parseFloat(preview.style.width) / width, ratioY = parseFloat(preview.style.height) / height;
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
        if (value.trim() !== source) crop = value.trim() === originalSource ? { ...originalCrop } : { x: 0, y: 0, width: 1, height: 1 };
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
        if (closed) return;
        closed = true; ++loadVersion; colorPickers?.dispose(); clearTimeout(timer); window.removeEventListener('resize', refresh); dialog.remove(); if (panel) disposePanel = undefined; else dispose = undefined;
        if (!panel && !disposing && !editor.removed && image.isConnected) { editor.focus(); editor.selection.select(image); editor.nodeChanged(); editor.dispatch('ResizeContent'); }
      };
      if (panel) disposePanel = close; else dispose = close;
      input('source').value = source; preview.onload = refresh; preview.src = source; refresh();
      dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => { close(); panel?.onClose(); }));
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
        if (target.name === 'alt') { alt = target.value; scheduleCommit(); return; }
        if (target.name === 'title') { title = target.value; scheduleCommit(); return; }
        if (target.name === 'width' || target.name === 'height') {
          const value = target.valueAsNumber;
          if (target.name === 'width') { width = value; if (input('keepRatio').checked && value > 0) height = value / dimensionRatio; }
          else { height = value; if (input('keepRatio').checked && value > 0) width = value * dimensionRatio; }
          if (validSize()) dimensionRatio = width / height;
          refresh(); return;
        }
        if (target.name in ranges) settings[target.name as NumericKey] = Number(target.value);
        else if (['flipX', 'flipY', 'locked', 'shadow', 'stroke', 'glow', 'strokeDouble'].includes(target.name)) settings[target.name as 'flipX'] = target.checked;
        else if (target.name === 'shadowColor' || target.name === 'strokeColor') {
          const color = parseShadowColor(target.value, doc);
          if (!color) { message('请输入有效的颜色。'); return; }
          message('');
          if (target.name === 'shadowColor') {
            settings.shadowColor = color.color;
            if (color.opacity !== undefined) settings.shadowOpacity = color.opacity;
          } else settings.strokeColor = color.opacity === undefined || color.opacity === 100 ? color.color
            : `rgba(${[1, 3, 5].map(at => parseInt(color.color.slice(at, at + 2), 16)).join(',')},${color.opacity / 100})`;
        }
        else if (target.name === 'glowColor' || target.name === 'decorationColor' || target.name === 'strokeOuterColor') {
          const color = parseShadowColor(target.value, doc);
          if (!color) { message('请输入有效的颜色。'); return; }
          message(''); settings[target.name] = color.color;
          if (target.name === 'glowColor' && color.opacity !== undefined) settings.glowOpacity = color.opacity;
          else if (target.name !== 'glowColor' && color.opacity !== undefined) settings[target.name] = `rgba(${[1, 3, 5].map(at => parseInt(color.color.slice(at, at + 2), 16)).join(',')},${color.opacity / 100})`;
        }
        else if (target.name === 'decoration') settings.decoration = target.value as Settings['decoration'];
        else if (target.name === 'shadowMode') settings.shadowMode = target.value as Settings['shadowMode'];
        else if (target.name === 'strokePosition') settings.strokePosition = target.value as Settings['strokePosition'];
        else if (target.name === 'strokeStyle') settings.strokeStyle = target.value as BorderStyle;
        else return;
        if (/^(stroke|shadow|glow|decoration)/.test(target.name)) settings.effectPreset = 'custom';
        refresh();
      });
      dialog.querySelectorAll<HTMLElement>('[data-effect-category]').forEach(button => button.addEventListener('click', () => { effectCategory = button.dataset.effectCategory as EffectCategory; renderEffects(); }));
      dialog.querySelectorAll<HTMLElement>('[data-effect]').forEach(button => button.addEventListener('click', () => { settings = { ...settings, ...effectPresetPatch(button.dataset.effect!) }; message(''); refresh(); }));
      dialog.querySelectorAll<HTMLElement>('[data-turn]').forEach(button => button.addEventListener('click', () => {
        settings.rotation = ((settings.rotation + Number(button.dataset.turn) + 180 + 360) % 360) - 180; refresh();
      }));
      dialog.querySelectorAll<HTMLButtonElement>('[data-mask-category]').forEach(button => button.addEventListener('click', () => { maskCategory = button.dataset.maskCategory as MaskCategory; refresh(); }));
      const maskFile = dialog.querySelector<HTMLInputElement>('[data-mask-file]')!;
      dialog.querySelector('[data-mask-upload]')!.addEventListener('click', () => maskFile.click());
      maskFile.addEventListener('change', async () => {
        const file = maskFile.files?.[0]; if (!file) return;
        const version = ++maskVersion; maskLoading = true; applyButton.disabled = true; message('');
        try {
          const mode = dialog.querySelector<HTMLSelectElement>('[data-mask-mode]')!.value as 'auto' | 'alpha' | 'luminance';
          const source = await importImageMask(file, mode);
          if (closed || version !== maskVersion) return;
          settings.maskSource = source; settings.maskName = file.name.slice(0, 80); settings.mask = 'custom'; maskCategory = 'basic'; refresh();
        } catch (error) { if (!closed && version === maskVersion) message(error instanceof Error ? error.message : '蒙版读取失败，请换一个文件。'); }
        finally { if (version === maskVersion) { maskLoading = false; applyButton.disabled = busy; maskFile.value = ''; } }
      });
      dialog.querySelectorAll<HTMLElement>('[data-mask]').forEach(button => button.addEventListener('click', () => {
        settings.mask = button.dataset.mask as Mask; refresh();
      }));
      dialog.querySelectorAll<HTMLElement>('[data-filter]').forEach(button => button.addEventListener('click', () => {
        settings.preset = button.dataset.filter as Filter; refresh();
      }));
      dialog.querySelectorAll<HTMLButtonElement>('[data-align]').forEach(button => button.addEventListener('click', () => { alignment = button.dataset.align!; refresh(); }));
      dialog.querySelectorAll<HTMLButtonElement>('[data-layer]').forEach(button => button.addEventListener('click', () => {
        const count = readObjectLayers(editor.getBody()).length, action = button.dataset.layer;
        layerPosition = action === 'top' ? count : action === 'bottom' ? 1 : Math.max(1, Math.min(count, layerPosition + (action === 'forward' ? 1 : -1))); refresh();
      }));
      dialog.querySelector('[data-crop]')!.addEventListener('click', async () => {
        if (settings.locked || busy || !validSize()) return;
        if (input('source').value.trim() !== source) changeSource(input('source').value);
        const version = loadVersion;
        if (!await sourceReady || closed || version !== loadVersion) return;
        const request: CropDraftRequest = { image, source, width, height, crop: { ...crop }, apply: (value, w, h) => { if (closed) return; crop = value; width = w; height = h; dimensionRatio = w / h; refresh(); } };
        editor.execCommand('mceImageCrop', false, request);
      });
      input('source').addEventListener('change', () => changeSource(input('source').value));
      const fileInput = dialog.querySelector<HTMLInputElement>('[data-image-file]')!;
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
      const commit = async () => {
        if (closed || committing || busy || maskLoading || editor.mode.isReadOnly() || !image.isConnected) return;
        if (['shadowColor', 'strokeColor', 'glowColor', 'decorationColor', 'strokeOuterColor'].some(name => !parseShadowColor(input(name).value, doc))) { message('请输入有效的颜色。'); return; }
        if (!validSize()) { message('请输入 1—20000 px 范围内的图片宽度和高度。'); return; }
        if (input('source').value.trim() !== source) changeSource(input('source').value);
        const submitted = snapshot();
        committing = true; busy = true; applyButton.disabled = true;
        const version = loadVersion, valid = await sourceReady;
        let strokeResult: Awaited<ReturnType<typeof createImageStroke>> | undefined;
        const appliedSettings = JSON.stringify(settings);
        let rasterSource = '';
        try { if (valid) rasterSource = await rasterizePresetMask(settings.mask); }
        catch { committing = false; busy = false; applyButton.disabled = false; if (!closed) message('蒙版生成失败，请重新选择。'); return; }
        if (valid && hasImageOverlay(settings)) {
          try { strokeResult = await createImageStroke(source, width, height, { ...settings }, { ...crop }); }
          catch (reason) { committing = false; busy = false; applyButton.disabled = false; if (!closed) message((reason as Error).message); return; }
        }
        committing = false; busy = false; applyButton.disabled = false;
        if (appliedSettings !== JSON.stringify(settings) || submitted !== snapshot()) { scheduleCommit(); return; }
        if (!valid || closed || version !== loadVersion || editor.removed || editor.mode.isReadOnly() || !image.isConnected) return;
        settings.maskRasterKey = rasterSource ? settings.mask : ''; settings.maskRasterSource = rasterSource;
        editor.undoManager.transact(() => {
          if (source !== originalSource) {
            const box = imageGeometry(image);
            editor.dom.setAttrib(image, 'src', source); editor.dom.setAttrib(image, 'data-mce-src', source);
            editor.dom.setAttrib(image, 'data-image-crop', null); editor.dom.setStyle(image, 'object-view-box', null);
            editor.dom.setStyles(image, { width: `${box.width}px`, height: `${box.height}px` });
          }
          const cropChanged = JSON.stringify(crop) !== JSON.stringify(originalCrop);
          if (cropChanged || width !== originalGeometry.width || height !== originalGeometry.height) {
            editor.dom.setStyles(image, { width: `${width}px`, height: `${height}px`, aspectRatio: `${width} / ${height}` });
          }
          if (cropChanged || source !== originalSource) {
            const fullCrop = crop.x === 0 && crop.y === 0 && crop.width === 1 && crop.height === 1;
            editor.dom.setAttrib(image, 'data-image-crop', fullCrop ? null : JSON.stringify(crop));
            editor.dom.setStyles(image, { objectFit: 'fill', objectViewBox: fullCrop && source !== originalSource ? '' : cropViewBox(crop) });
          }
          editor.dom.setAttrib(image, 'alt', alt); editor.dom.setAttrib(image, 'title', title || null);
          editor.dom.setStyles(image, styles(settings));
          if (alignment && alignment !== appliedAlignment && !settings.locked) {
            editor.dom.setAttrib(image, 'data-image-locked', null);
            editor.selection.select(image);
            editor.execCommand({ left: 'JustifyLeft', center: 'JustifyCenter', right: 'JustifyRight' }[alignment]!);
          }
          if (!settings.locked && layerPosition !== originalLayerPosition) setObjectLayerPosition(editor, image, layerPosition);
          editor.dom.setAttrib(image, 'data-image-settings', JSON.stringify(settings));
          editor.dom.setAttrib(image, 'data-image-locked', settings.locked ? 'true' : null);
          if (strokeResult) strokes.write(image, strokeResult);
          else {
            const id = image.getAttribute('data-image-stroke-id');
            for (const layer of editor.getBody().querySelectorAll('[data-image-stroke-for]')) if (layer.getAttribute('data-image-stroke-for') === id) layer.remove();
            editor.dom.setAttrib(image, 'data-image-stroke-id', null);
          }
        });
        committed = snapshot();
        originalSource = source; originalGeometry = imageGeometry(image); originalCrop = { ...crop }; originalLayerPosition = layerPosition; appliedAlignment = alignment;
        if (!panel) close();
        editor.dispatch('change'); editor.dispatch('ScrollContent'); editor.dispatch('ResizeContent');
      };
      applyButton.addEventListener('click', () => { void commit(); });
      if (panel) {
        panel.host.replaceChildren(dialog);
        selectTab(tabs.find(tab => tab.dataset.tab === panel.tab) ?? tabs[0]!);
      } else { doc.body.append(dialog); (dialog as HTMLDialogElement).showModal(); }
      colorPickers = installColorPickers(dialog, editor.getDoc());
      initialized = true;
      refresh(); window.addEventListener('resize', refresh);
  }
}
