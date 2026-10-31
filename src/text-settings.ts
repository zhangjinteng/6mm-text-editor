import type { Editor } from 'tinymce';
import { defaultFontFamily, installFonts } from './fonts';
import { defaultDeform, readDeform, writeDeform, validateDeform } from './text-deform';
import { createDeformEditor } from './text-deform-editor';
import { advancedTextStyles, ensureSource, renderAdvancedText, selectAdvancedObject } from './text-advanced';
import { currentTextBox, isTextLocked } from './text-box-state';
import './text-settings.css';
import { installTextColorPickers } from './text-color-picker';
import { outerLayerObject, readObjectLayers, setObjectLayerPosition } from './object-layers';
import { defaultTextStyle, readTextStyle, validateTextStyle, applyTextStyle, clearTextStyle, type PlainTextStyle } from './text-style-settings';
import { readParagraphSettings, readParagraphStyles, validateParagraphSettings, applyParagraphSettings, type ParagraphStyles } from './text-paragraph-settings';
import { animationStyles, defaultAnimation, readAnimation, writeAnimation, validateAnimation } from './animations';
import { createAnimationEditor } from './animation-picker';
import { readBasicTextSettings, validateBasicTextSettings, applyBasicTextSettings } from './text-basic-settings';
import { readFills, writeFills, newFill, validateFills, fillImageUrl } from './text-fill';
import { createFillEditor } from './text-fill-editor';
import { readShadow, writeShadow, validateShadow, type TextShadow } from './text-shadow';
import { createShadowEditor } from './text-shadow-editor';
import { readBackground, writeBackground, validateBackground, type TextBackground } from './text-background';
import { createBackgroundEditor } from './text-background-editor';

const defaults = {
  ...defaultTextStyle, clearFormatting: false, textLocked: false, layerPosition: 1,
  fontFamily: 'sans-serif', fontSize: '24', textColor: '#000000', highlightColor: 'transparent',
  paragraphFormat: 'p', textDirection: 'ltr', paragraphQuote: false,
  opacity: '100', background: null as TextBackground | null,
  stroke: false, strokeColor: '#000000', strokeWidth: '1', strokePosition: 'center', strokeJoin: 'miter',
  shadow: null as TextShadow | null,
  animation: { ...defaultAnimation }, layers: [newFill('original', 'base')], deformation: structuredClone(defaultDeform)
};
type Settings = typeof defaults;
type Tab = 'style' | 'layout' | 'object' | 'basic' | 'paragraph' | 'appearance' | 'fill' | 'curve' | 'animation';
const limits = { opacity: [0, 100], strokeWidth: [0, 10] } as const;
type Numeric = keyof typeof limits;
const pixels = (value: string, fallback = 0) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
function read(box: HTMLElement): Settings {
  const s = box.style, d = box.dataset;
  return {
    ...readTextStyle(box), clearFormatting: false, textLocked: isTextLocked(box),
    layerPosition: readObjectLayers(box.ownerDocument.body).indexOf(outerLayerObject(box)) + 1,
    ...readBasicTextSettings(box), ...readParagraphSettings(box),
    opacity: String(Math.round(pixels(s.opacity, 1) * 100)), background: readBackground(box),
    stroke: d.textStrokeEnabled !== 'false' && (d.textStrokeEnabled === 'true' || pixels(s.getPropertyValue('-webkit-text-stroke-width')) > 0),
    strokeWidth: d.textStrokeWidth ?? String(pixels(s.getPropertyValue('-webkit-text-stroke-width'), 1)), strokeColor: d.textStrokeColor || s.getPropertyValue('-webkit-text-stroke-color') || defaults.strokeColor,
    strokePosition: d.textStrokePosition || defaults.strokePosition, strokeJoin: d.textStrokeJoin || defaults.strokeJoin,
    shadow: readShadow(box),
    animation: readAnimation(box), layers: readFills(box), deformation: readDeform(box)
  };
}
function validate(s: Settings, doc: Document): string {
  const styleError = validateTextStyle(s); if (styleError) return styleError;
  const paragraphError = validateParagraphSettings(s); if (paragraphError) return paragraphError;
  const basicError = validateBasicTextSettings(s, doc); if (basicError) return basicError;
  for (const [key, [min, max]] of Object.entries(limits)) {
    const value = s[key as Numeric];
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) return '请输入各项标注范围内的有效数值。';
  }
  for (const key of ['strokeColor'] as const) {
    const probe = doc.createElement('span'); probe.style.color = s[key];
    if (!/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(s[key]) || !probe.style.color) return '请输入有效的颜色。';
  }
  if (!['inside', 'center', 'outside'].includes(s.strokePosition) || !['miter', 'bevel', 'round'].includes(s.strokeJoin)) return '请选择有效的设置。';
  return validateAnimation(s.animation) || validateDeform(s.deformation) || validateBackground(s.background) || validateShadow(s.shadow) || validateFills(s.layers, doc);
}
/** The same draft operation paints the isolated preview and commits to the document. */
function apply(box: HTMLElement, s: Settings, initial: Settings, width: number, paragraphStyles: ParagraphStyles, plain: PlainTextStyle) {
  if (s.clearFormatting) {
    clearTextStyle(box, plain);
    initial = { ...initial, ...readBasicTextSettings(box), ...readParagraphSettings(box), ...readTextStyle(box) };
  }
  const different = (...keys: (keyof Settings)[]) => keys.some(key => s[key] !== initial[key]);
  applyParagraphSettings(box, s, initial, paragraphStyles);
  applyBasicTextSettings(box, s, initial);
  applyTextStyle(box, s, initial);
  if (different('opacity')) box.style.opacity = String(Number(s.opacity) / 100);
  if (JSON.stringify(s.background) !== JSON.stringify(initial.background)) { ensureSource(box); writeBackground(box, s.background); }
  if (different('stroke', 'strokeColor', 'strokeWidth', 'strokePosition', 'strokeJoin')) {
    ensureSource(box);
    Object.assign(box.dataset, { textStrokeEnabled: String(s.stroke), textStrokeWidth: String(Number(s.strokeWidth)), textStrokeColor: s.strokeColor, textStrokePosition: s.strokePosition, textStrokeJoin: s.strokeJoin });
    for (const child of [box, ...box.querySelectorAll<HTMLElement>('[style]')]) for (const name of ['-webkit-text-stroke', '-webkit-text-stroke-width', '-webkit-text-stroke-color', 'paint-order']) child.style.removeProperty(name);
  }
  if (JSON.stringify(s.shadow) !== JSON.stringify(initial.shadow)) writeShadow(box, s.shadow);
  if (JSON.stringify(s.layers) !== JSON.stringify(initial.layers)) {
    if (!box.style.width || box.style.width === 'auto') Object.assign(box.style, { width: `${width}px`, boxSizing: 'border-box' });
    ensureSource(box); writeFills(box, s.layers);
  }
  if (JSON.stringify(s.deformation) !== JSON.stringify(initial.deformation)) {
    if (!box.style.width || box.style.width === 'auto') Object.assign(box.style, { width: `${width}px`, boxSizing: 'border-box' });
    ensureSource(box);
    writeDeform(box, s.deformation);
  }
  if (JSON.stringify(s.animation) !== JSON.stringify(initial.animation)) {
    if (s.animation.name) ensureSource(box);
    writeAnimation(box, s.animation);
  }
  for (const child of [box, ...box.querySelectorAll<HTMLElement>('[style]')]) child.removeAttribute('data-mce-style');
  renderAdvancedText(box);
}

export function registerTextSettings(editor: Editor): void {
  let dispose: (() => void) | undefined;
  let disposePanel: (() => void) | undefined;
  const canOpen = (box = currentTextBox(editor)) => !!box?.isConnected && !editor.removed && !editor.mode.isReadOnly();
  const canChange = (box = currentTextBox(editor)) => canOpen(box) && !isTextLocked(box);
  editor.on('remove', () => { dispose?.(); disposePanel?.(); });
  editor.addCommand('TextSettingsPanel', (_ui, value) => {
    disposePanel?.();
    if (value?.host && value?.box) open(value.tab ?? 'basic', value);
  });
  editor.addCommand('TextSettings', (_ui, value) => open(['style', 'layout', 'object', 'basic', 'paragraph', 'appearance', 'fill', 'curve', 'animation'].includes(value) ? value as Tab : 'basic'));
  editor.ui.registry.addIcon('text-settings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 5h12M9 5v15M5 20h8M16 9h5M16 15h5M16 20h5"/><circle cx="18" cy="9" r="1.5" fill="white"/><circle cx="20" cy="15" r="1.5" fill="white"/></svg>');
  for (const [name, label, tab] of [['textsettings', '文字设置', 'basic'], ['textappearance', '外观', 'appearance'], ['textfill', '填充', 'fill'], ['textcurve', '变形', 'curve']] as const) {
    editor.ui.registry.addButton(name, {
      ...(name === 'textsettings' ? { icon: 'text-settings' } : { text: label }), tooltip: label,
      onAction: () => open(tab), onSetup: api => {
        const events = 'NodeChange SelectionChange SwitchMode TextBoxSelected TextBoxLockChanged Undo Redo';
        const update = () => api.setEnabled(name === 'textsettings' ? canOpen() : canChange()); update(); editor.on(events, update); return () => editor.off(events, update);
      }
    });
  }
  function open(tab: Tab, panel?: { host: HTMLElement; box: HTMLElement; onClose: () => void }) {
    const box = panel?.box ?? currentTextBox(editor); if (!box || !canOpen(box) || (!panel && dispose)) return;
    const locked = isTextLocked(box); if (locked) tab = 'object';
    const doc = editor.getContainer().ownerDocument, dialog = doc.createElement(panel ? 'div' : 'dialog');
    dialog.className = panel ? 'text-settings-dialog text-settings-embedded' : 'text-settings-dialog'; dialog.setAttribute('aria-label', '文字设置');
    const range = (name: Numeric, label: string, unit: string, legacy = label) => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" name="${name}" aria-label="${legacy}"><small>${unit}</small></span></span><input type="range" data-range="${name}" aria-label="${label}滑块" min="${limits[name][0]}" max="${limits[name][1]}" step="${name === 'strokeWidth' ? '.1' : '1'}"></label>`;
    const check = (name: string, label: string) => `<label class="text-settings-check"><input type="checkbox" name="${name}">${label}</label>`;
    const color = (name: string, label: string) => `<label class="text-settings-color">${label}<span><input type="color" data-color="${name}" aria-label="${label}色板"><input type="text" name="${name}" aria-label="${label}" spellcheck="false"></span></label>`;
    const select = (name: string, label: string, items: string[][]) => `<label class="text-settings-select">${label}<select name="${name}" aria-label="${label}">${items.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
    dialog.innerHTML = `<header><div><h2>文字设置</h2><p>预览调整效果，应用后保存到文字</p></div><button type="button" data-close aria-label="关闭文字设置">×</button></header>
      <div class="text-settings-body"><div class="text-settings-preview"><iframe title="文字效果预览" sandbox="allow-same-origin" tabindex="-1"></iframe><span>效果预览</span></div><div class="text-settings-controls">
      <div role="tablist" aria-label="文字设置分类">${([['basic', '基础'], ['style', '样式'], ['paragraph', '段落'], ['layout', '排版'], ['appearance', '外观'], ['fill', '填充'], ['curve', '变形'], ['animation', '动画'], ['object', '对象']] as const).map(([name, text]) => `<button type="button" role="tab" data-tab="${name}" id="text-tab-${name}" aria-controls="text-panel-${name}" aria-selected="false">${text}</button>`).join('')}</div>
      <section role="tabpanel" data-section="basic" id="text-panel-basic" aria-labelledby="text-tab-basic" hidden>
      <label class="text-settings-select">字体<select name="fontFamily" aria-label="字体"></select></label>
      <label class="text-settings-size">字号<span><button type="button" data-font-step="-1" aria-label="减小字号">−</button><input type="text" inputmode="decimal" name="fontSize" aria-label="字号" placeholder="1—1000"><small>px</small><button type="button" data-font-step="1" aria-label="增大字号">+</button></span></label>
      ${color('textColor', '文字颜色')}${color('highlightColor', '背景颜色')}
      <button type="button" class="text-settings-clear-highlight" data-clear-highlight>清除背景颜色</button>
      <p class="text-settings-hint">应用到当前文字对象。背景颜色用于文字高亮，背景形状可在“外观 → 背景”中设置。</p></section>
      <section role="tabpanel" data-section="style" id="text-panel-style" aria-labelledby="text-tab-style" hidden>
      <div class="text-style-toggles" role="group" aria-label="文字样式">${[['styleBold', '加粗', 'B'], ['styleItalic', '斜体', 'I'], ['styleUnderline', '下划线', 'U'], ['styleStrike', '删除线', 'S']].map(([name, label, icon]) => `<button type="button" data-style-toggle="${name}" aria-label="${label}" aria-pressed="false"><b>${icon}</b><span>${label}</span></button>`).join('')}</div>
      ${select('styleScript', '上下标', [['mixed', '混合（保留）'], ['normal', '正常'], ['super', '上标'], ['sub', '下标']])}
      <button type="button" class="text-settings-action" data-clear-format>清除格式</button>
      <p class="text-settings-hint">应用到整个文字对象。混合状态表示文字包含不同样式；清除格式后仍可预览或取消。</p></section>
      <section role="tabpanel" data-section="layout" id="text-panel-layout" aria-labelledby="text-tab-layout" hidden>
      ${select('textAlign', '文字对齐', [['start', '起始端'], ['end', '末尾端'], ['left', '左对齐'], ['center', '居中'], ['right', '右对齐'], ['justify', '两端对齐']])}
      <label class="text-settings-select">行距倍数<input type="text" inputmode="decimal" name="lineHeight" aria-label="行距倍数" placeholder="0.5—5" list="text-line-heights"></label>
      <datalist id="text-line-heights">${['1', '1.2', '1.5', '1.75', '2', '2.5', '3'].map(value => `<option value="${value}"></option>`).join('')}</datalist>
      <label class="text-settings-select">字间距（px）<input type="text" inputmode="decimal" name="letterSpacing" aria-label="字间距（px）" placeholder="混合，请输入新值"></label>
      <p class="text-settings-hint">行距范围 0.5—5 倍，字间距范围 -10—100 px。</p></section>
      <section role="tabpanel" data-section="object" id="text-panel-object" aria-labelledby="text-tab-object" hidden>
      <div class="text-layer-heading"><strong>图层设置</strong><span data-layer-position aria-live="polite"></span></div>
      <div class="text-layer-actions" role="group" aria-label="图层设置">${[['forward', '上一层'], ['backward', '下一层'], ['top', '置于顶层'], ['bottom', '置于底层']].map(([action, label]) => `<button type="button" data-layer-action="${action}">${label}</button>`).join('')}</div>
      <p class="text-settings-hint">调整文字与图片、弹幕等对象的遮挡顺序。${panel ? '调整即时生效，可撤销。' : '点击“应用设置”后生效，可取消。'}</p>
      ${check('textLocked', '锁定文本框')}
      <p class="text-settings-hint">锁定后禁止移动和编辑，仍可在这里解锁或创建副本。点击“应用设置”保存锁定状态。</p>
      <button type="button" class="text-settings-action" data-duplicate>创建文字副本</button>
      <p class="text-settings-hint">${locked ? '保留原对象的锁定状态，创建可编辑的副本。' : '先应用当前设置，再创建可独立编辑的副本。'}</p></section>
      <section role="tabpanel" data-section="paragraph" id="text-panel-paragraph" aria-labelledby="text-tab-paragraph" hidden>
      ${select('paragraphFormat', '段落样式', [['', '混合样式（保留）'], ['p', '正文'], ['h1', '标题 1'], ['h2', '标题 2'], ['h3', '标题 3'], ['h4', '标题 4'], ['h5', '标题 5'], ['h6', '标题 6']])}
      ${select('textDirection', '文字方向', [['ltr', '从左到右'], ['rtl', '从右到左']])}
      ${check('paragraphQuote', '引用段落')}
      <p class="text-settings-hint">设置当前文字对象的标题、文字方向与引用样式，点击“应用设置”后保存。</p></section>
      <section role="tabpanel" data-section="appearance" id="text-panel-appearance" aria-labelledby="text-tab-appearance">
      <div class="text-settings-subtabs" role="tablist" aria-label="外观分类">${[['opacity', '透明度'], ['background', '背景'], ['stroke', '描边'], ['shadow', '投影']].map(([name, text]) => `<button type="button" role="tab" data-effect="${name}" id="text-effect-${name}" aria-controls="text-effect-panel-${name}" aria-selected="${name === 'opacity'}">${text}</button>`).join('')}</div>
      <div role="tabpanel" id="text-effect-panel-opacity" aria-labelledby="text-effect-opacity" data-effect-panel="opacity">${range('opacity', '整体不透明度', '%', '整体不透明度（0—100%）')}<p class="text-settings-hint">同时调整文字、填充、背景和投影的透明度。</p></div>
      <div role="tabpanel" id="text-effect-panel-background" aria-labelledby="text-effect-background" data-effect-panel="background" hidden><div data-background-editor></div></div>
      <div role="tabpanel" id="text-effect-panel-stroke" aria-labelledby="text-effect-stroke" data-effect-panel="stroke" hidden>${check('stroke', '启用文字描边')}${color('strokeColor', '描边颜色')}${range('strokeWidth', '描边宽度', 'px', '描边宽度（0—10 px）')}${select('strokePosition', '描边位置', [['inside', '内描边'], ['center', '居中描边'], ['outside', '外描边']])}${select('strokeJoin', '拐角', [['miter', '尖角'], ['bevel', '斜角'], ['round', '圆角']])}</div>
      <div role="tabpanel" id="text-effect-panel-shadow" aria-labelledby="text-effect-shadow" data-effect-panel="shadow" hidden><div data-shadow-editor></div></div></section>
      <section role="tabpanel" data-section="fill" id="text-panel-fill" aria-labelledby="text-tab-fill" hidden><div data-fill-editor></div></section>
      <section role="tabpanel" data-section="curve" id="text-panel-curve" aria-labelledby="text-tab-curve" hidden><div data-deform-editor></div></section>
      <section role="tabpanel" data-section="animation" id="text-panel-animation" aria-labelledby="text-tab-animation" hidden><div data-animation-editor></div></section>
      </div></div><p class="text-settings-error" role="alert" hidden></p><footer><button type="button" data-reset>重置效果</button><div><button type="button" data-close>取消</button><button type="button" data-apply>应用设置</button></div></footer>`;
    if (panel) {
      dialog.querySelector('.text-settings-preview')?.remove();
      dialog.querySelector('header h2')!.textContent = '文字配置';
      dialog.querySelector('header p')!.textContent = '调整即时生效，可撤销';
      dialog.querySelector('header [data-close]')!.setAttribute('aria-label', '收起文字配置');
      dialog.querySelectorAll<HTMLElement>('[id], [aria-controls], [aria-labelledby], [list]').forEach(node => {
        for (const key of ['id', 'aria-controls', 'aria-labelledby', 'list']) {
          const value = node.getAttribute(key); if (value) node.setAttribute(key, 'sidebar-' + value);
        }
      });
      dialog.querySelectorAll('.text-settings-hint').forEach(node => {
        node.textContent = node.textContent!.replaceAll('点击“应用设置”后保存', '调整后自动保存').replaceAll('点击“应用设置”保存锁定状态', '调整后自动保存锁定状态').replaceAll('仍可预览或取消', '可通过撤销恢复');
      });
    }
    const bodyStyle = editor.getWin().getComputedStyle(editor.getBody());
    const plain: PlainTextStyle = { fontFamily: bodyStyle.fontFamily, fontSize: String(parseFloat(bodyStyle.fontSize) || 15), textColor: bodyStyle.color, lineHeight: String(parseFloat(bodyStyle.lineHeight) / parseFloat(bodyStyle.fontSize) || 1.2) };
    const paragraphStyles = readParagraphStyles(editor.getDoc());
    const initial = read(box); let draft = structuredClone(initial), closed = false, busy = false, checking = false, applyVersion = 0;
    const width = Math.max(32, box.offsetWidth), snapshot = box.cloneNode(true) as HTMLElement;
    const inherited = editor.getWin().getComputedStyle(box);
    for (const key of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'color', 'direction', 'text-decoration']) snapshot.style.setProperty(key, inherited.getPropertyValue(key));
    const input = (name: string) => dialog.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
    const mixedParagraph = dialog.querySelector<HTMLOptionElement>('[name="paragraphFormat"] option[value=""]')!;
    mixedParagraph.hidden = mixedParagraph.disabled = initial.paragraphFormat !== '';
    const fontSelect = input('fontFamily') as HTMLSelectElement;
    const fonts = editor.options.get('font_family_formats') as string;
    const configuredFonts = fonts.split(';').map(item => { const at = item.indexOf('='); return [item.slice(0, at).trim(), item.slice(at + 1).trim()]; }).filter(([label, value]) => label && value);
    const normalizeFont = (font: string) => font.split(',')[0]!.replace(/["']/g, '').trim().toLowerCase();
    // Preserve imported formatting without reintroducing old fonts into the catalog.
    if (!configuredFonts.some(([, value]) => normalizeFont(value!) === normalizeFont(initial.fontFamily))) {
      const current = doc.createElement('option'); current.value = initial.fontFamily;
      current.textContent = '请选择热门字体'; current.hidden = current.disabled = true; fontSelect.append(current);
    }
    const plainFont = configuredFonts.find(([, value]) => normalizeFont(value!) === normalizeFont(plain.fontFamily));
    if (plainFont) plain.fontFamily = plainFont[1]!;
    for (const [label, value] of configuredFonts) { const option = doc.createElement('option'); option.value = value!; option.textContent = label!; option.style.fontFamily = value!; fontSelect.append(option); }
    const matchingFont = configuredFonts.find(([, value]) => normalizeFont(value!) === normalizeFont(initial.fontFamily));
    if (matchingFont) { initial.fontFamily = matchingFont[1]!; draft.fontFamily = initial.fontFamily; }
    const frame = dialog.querySelector('iframe')!, error = dialog.querySelector<HTMLElement>('[role="alert"]')!, applyButton = dialog.querySelector<HTMLButtonElement>('[data-apply]')!;
    let previewDoc: Document | undefined;
    let colorPickers: ReturnType<typeof installTextColorPickers> | undefined;
    const message = (text: string) => { error.textContent = text; error.hidden = !text; };
    const invalidateCheck = () => { ++applyVersion; if (checking) { checking = false; busy = false; applyButton.disabled = false; applyButton.textContent = '应用设置'; } };
    const preview = () => {
      if (panel) { if (!closed && JSON.stringify(draft) !== JSON.stringify(initial)) void commit(); return; }
      if (!previewDoc || closed || (!locked && validate(draft, doc))) return;
      const clone = previewDoc.importNode(snapshot, true);
      clone.querySelectorAll('[data-mce-bogus], [data-text-render]').forEach(node => node.remove());
      for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) { node.removeAttribute('id'); node.removeAttribute('contenteditable'); node.classList.remove('text-advanced-editing'); }
      clone.dataset.textRenderId = 'preview-' + crypto.randomUUID();
      Object.assign(clone.style, { position: 'absolute', display: 'inline-block', boxSizing: 'border-box', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0', width: `${width}px`, maxWidth: 'none', transform: 'none', rotate: 'none', scale: 'none', pointerEvents: 'none' });
      clone.classList.remove('text-advanced-editing');
      previewDoc.body.replaceChildren(clone); apply(clone, draft, initial, width, paragraphStyles, plain);
      const background = clone.querySelector<HTMLElement>(':scope > [data-text-background-render]');
      const bx = parseFloat(background?.style.left ?? '') || 0, by = parseFloat(background?.style.top ?? '') || 0;
      const minX = Math.min(0, bx), minY = Math.min(0, by);
      const w = Math.max(clone.offsetWidth, bx + (parseFloat(background?.style.width ?? '') || 0)) - minX, h = Math.max(clone.offsetHeight, by + (parseFloat(background?.style.height ?? '') || 0)) - minY;
      const scale = Math.min(1, Math.max(1, frame.clientWidth - 64) / Math.max(1, w), Math.max(1, frame.clientHeight - 84) / Math.max(1, h));
      Object.assign(clone.style, { left: '50%', top: '50%', transformOrigin: '0 0', transform: `scale(${scale}) translate(${-minX - w / 2}px, ${-minY - h / 2}px)` });
    };
    const fillEditor = createFillEditor(doc, initial.layers, {
      change: layers => { draft.layers = layers; invalidateCheck(); preview(); },
      busy: value => { if (value) invalidateCheck(); busy = value; applyButton.disabled = value; applyButton.textContent = value ? '处理中…' : '应用设置'; },
      error: message
    });
    dialog.querySelector('[data-fill-editor]')!.append(fillEditor.element);
    const shadowEditor = createShadowEditor(doc, initial.shadow, value => { draft.shadow = value; invalidateCheck(); message(''); preview(); });
    dialog.querySelector('[data-shadow-editor]')!.append(shadowEditor.element);
    const backgroundEditor = createBackgroundEditor(doc, initial.background, value => { draft.background = value; invalidateCheck(); message(''); preview(); });
    dialog.querySelector('[data-background-editor]')!.append(backgroundEditor.element);
    const deformEditor = createDeformEditor(doc, initial.deformation, value => { draft.deformation = value; invalidateCheck(); message(''); preview(); });
    dialog.querySelector('[data-deform-editor]')!.append(deformEditor.element);
    const animationEditor = createAnimationEditor(doc, initial.animation, value => { draft.animation = value; invalidateCheck(); message(''); preview(); });
    dialog.querySelector('[data-animation-editor]')!.append(animationEditor.element);
    const refresh = () => {
      for (const key of Object.keys(draft) as (keyof Settings)[]) {
        const field = input(key); if (!field) continue;
        if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = draft[key] as boolean;
        else field.value = String(draft[key]);
      }
      dialog.querySelectorAll<HTMLInputElement>('[data-range]').forEach(field => { field.value = String(draft[field.dataset.range as Numeric]); });
      dialog.querySelectorAll<HTMLInputElement>('[data-color]').forEach(field => {
        const color = draft[field.dataset.color as 'strokeColor' | 'textColor' | 'highlightColor'];
        const canvas = doc.createElement('canvas'); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!; ctx.fillStyle = color === 'transparent' ? '#ffffff' : color; ctx.fillRect(0, 0, 1, 1);
        const rgb = ctx.getImageData(0, 0, 1, 1).data;
        field.value = '#' + Array.from(rgb).slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('');
      });
      dialog.querySelectorAll<HTMLButtonElement>('[data-style-toggle]').forEach(button => {
        const value = draft[button.dataset.styleToggle as 'styleBold' | 'styleItalic' | 'styleUnderline' | 'styleStrike'];
        button.setAttribute('aria-pressed', value === 'mixed' ? 'mixed' : String(value === 'on'));
      });
      dialog.querySelector<HTMLButtonElement>('[data-clear-highlight]')!.disabled = draft.highlightColor === 'transparent';
      const layerCount = readObjectLayers(editor.getBody()).length;
      dialog.querySelector('[data-layer-position]')!.textContent = `第 ${draft.layerPosition} / ${layerCount} 层`;
      dialog.querySelectorAll<HTMLButtonElement>('[data-layer-action]').forEach(button => {
        const up = ['forward', 'top'].includes(button.dataset.layerAction!);
        button.disabled = locked || draft.textLocked || draft.layerPosition < 1 || (up ? draft.layerPosition >= layerCount : draft.layerPosition <= 1);
      });
      colorPickers?.refresh();
      preview();
    };
    const close = () => {
      if (closed) return; closed = true; ++applyVersion; colorPickers?.dispose(); fillEditor.dispose(); shadowEditor.dispose(); window.removeEventListener('resize', preview); dialog.remove(); if (panel) disposePanel = undefined; else dispose = undefined;
      if (!panel && !editor.removed && box.isConnected) { editor.focus(); if (isTextLocked(box)) editor.selection.select(box); else selectAdvancedObject(editor, box); editor.nodeChanged(); editor.dispatch('ResizeContent'); }
    };
    if (panel) disposePanel = close; else dispose = close;
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => { close(); panel?.onClose(); }));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    const bindTabs = (buttonSelector: string, panelSelector: string, key: 'tab' | 'effect') => {
      const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>(buttonSelector)).filter(button => !button.disabled);
      const activate = (button: HTMLButtonElement) => {
        tabs.forEach(tab => { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
        dialog.querySelectorAll<HTMLElement>(panelSelector).forEach(panel => { panel.hidden = (key === 'tab' ? panel.dataset.section : panel.dataset.effectPanel) !== button.dataset[key]; });
      };
      tabs.forEach((button, index) => {
        button.addEventListener('click', () => activate(button));
        button.addEventListener('keydown', event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          event.preventDefault(); activate(tabs[next]!); tabs[next]!.focus();
        });
      });
      if (tabs.length) activate(tabs.find(button => button.dataset[key] === tab) ?? tabs[0]!);
    };
    if (locked) {
      dialog.querySelectorAll<HTMLButtonElement>('[data-tab]:not([data-tab=object])').forEach(button => { button.disabled = true; });
      dialog.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('[data-section]:not([data-section=object]) button,[data-section]:not([data-section=object]) input,[data-section]:not([data-section=object]) select,[data-reset]').forEach(field => { field.disabled = true; });
    }
    bindTabs('[data-tab]', '[data-section]', 'tab'); bindTabs('[data-effect]', '[data-effect-panel]', 'effect');
    dialog.addEventListener('input', event => {
      const field = event.target as HTMLInputElement;
      const key = field.dataset.range || field.dataset.color || field.name;
      if (!(key in draft)) return;
      draft = { ...draft, [key]: field.type === 'checkbox' ? field.checked : field.value }; invalidateCheck();
      if (key === 'paragraphFormat') {
        draft.fontSize = draft.paragraphFormat === initial.paragraphFormat || !draft.paragraphFormat
          ? initial.fontSize : String(parseFloat(paragraphStyles[draft.paragraphFormat]!.fontSize));
      }
      message(''); refresh();
    });
    dialog.querySelectorAll<HTMLButtonElement>('[data-style-toggle]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.styleToggle as 'styleBold' | 'styleItalic' | 'styleUnderline' | 'styleStrike';
      draft[key] = draft[key] === 'on' ? 'off' : 'on'; invalidateCheck(); message(''); refresh();
    }));
    dialog.querySelector('[data-clear-format]')!.addEventListener('click', () => {
      draft = { ...draft, ...defaultTextStyle, ...plain, textAlign: draft.textAlign, highlightColor: 'transparent', paragraphFormat: 'p', clearFormatting: true };
      invalidateCheck(); message(''); refresh();
    });
    dialog.querySelectorAll<HTMLButtonElement>('[data-font-step]').forEach(button => button.addEventListener('click', () => {
      draft.fontSize = String(Math.max(1, Math.min(1000, (parseFloat(draft.fontSize) || 24) + Number(button.dataset.fontStep))));
      invalidateCheck(); message(''); refresh();
    }));
    dialog.querySelector('[data-clear-highlight]')!.addEventListener('click', () => { draft.highlightColor = 'transparent'; invalidateCheck(); message(''); refresh(); });
    dialog.querySelectorAll<HTMLButtonElement>('[data-layer-action]').forEach(button => button.addEventListener('click', () => {
      if (locked || draft.textLocked || !canChange(box)) return;
      const count = readObjectLayers(editor.getBody()).length;
      const action = button.dataset.layerAction;
      draft.layerPosition = action === 'top' ? count : action === 'bottom' ? 1 : Math.max(1, Math.min(count, draft.layerPosition + (action === 'forward' ? 1 : -1)));
      invalidateCheck(); message(''); refresh();
    }));
    dialog.querySelector('[data-reset]')!.addEventListener('click', () => { ++applyVersion; busy = false; applyButton.disabled = false; draft = { ...structuredClone(defaults), ...Object.fromEntries(Object.keys(defaultTextStyle).map(key => [key, draft[key as keyof typeof defaultTextStyle]])), clearFormatting: draft.clearFormatting, textLocked: draft.textLocked, layerPosition: draft.layerPosition, fontFamily: draft.fontFamily, fontSize: draft.fontSize, textColor: draft.textColor, highlightColor: draft.highlightColor, paragraphFormat: draft.paragraphFormat, textDirection: draft.textDirection, paragraphQuote: draft.paragraphQuote }; fillEditor.reset(draft.layers); shadowEditor.reset(draft.shadow); backgroundEditor.reset(draft.background); deformEditor.reset(draft.deformation); animationEditor.reset(draft.animation); message(''); refresh(); });
    const commit = async (duplicate = false) => {
      if (closed || busy || !canOpen(box) || isTextLocked(box) !== locked) return;
      const invalid = locked ? '' : validate(draft, doc); if (invalid) { message(invalid); return; }
      const submitted = JSON.stringify(draft);
      const sources = [...new Set(draft.layers.filter(layer => layer.visible && layer.type === 'image').map(layer => fillImageUrl(layer.image.trim())!))];
      if (sources.length) {
        const version = ++applyVersion; checking = true; busy = true; applyButton.disabled = true; applyButton.textContent = '检查图片…';
        const valid = await Promise.all(sources.map(source => new Promise<boolean>(resolve => {
          const image = new Image(); const timer = window.setTimeout(() => { image.onload = image.onerror = null; resolve(false); }, 10000);
          image.onload = () => { window.clearTimeout(timer); resolve(image.naturalWidth > 0); }; image.onerror = () => { window.clearTimeout(timer); resolve(false); }; image.src = source;
        })));
        if (closed || version !== applyVersion) return; checking = false; busy = false; applyButton.disabled = false; applyButton.textContent = '应用设置';
        if (submitted !== JSON.stringify(draft)) return;
        if (valid.includes(false)) { message('图片加载失败，请检查地址或重新上传。'); return; }
      }
      if (!canOpen(box) || isTextLocked(box) !== locked) return;
      if (submitted !== JSON.stringify(initial)) editor.undoManager.transact(() => {
        if (!locked) {
          apply(box, draft, initial, width, paragraphStyles, plain);
          if (draft.layerPosition !== initial.layerPosition) setObjectLayerPosition(editor, box, draft.layerPosition);
        }
        editor.dom.setAttrib(box, 'data-text-locked', draft.textLocked ? 'true' : null);
        editor.dom.setAttrib(box, 'contenteditable', draft.textLocked ? 'false' : null);
      });
      if (panel && !duplicate && draft.textLocked === initial.textLocked) {
        Object.assign(initial, structuredClone(draft));
        draft.clearFormatting = initial.clearFormatting = false;
        editor.dispatch('change'); editor.dispatch('ResizeContent');
        return;
      }
      close();
      if (draft.textLocked !== initial.textLocked) editor.dispatch('TextBoxLockChanged');
      else if (!locked) editor.dispatch('CanvasTextInserted');
      editor.dispatch('change');
      if (duplicate) editor.execCommand('TextDuplicate');
    };
    applyButton.addEventListener('click', () => { void commit(); });
    dialog.querySelector('[data-duplicate]')!.addEventListener('click', () => { void commit(true); });
    colorPickers = installTextColorPickers(dialog, editor.getDoc());
    if (panel) { panel.host.replaceChildren(dialog); refresh(); return; }
    doc.body.append(dialog); (dialog as HTMLDialogElement).showModal();
    const pd = frame.contentDocument!;
    pd.open(); pd.write('<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:' + defaultFontFamily + ',sans-serif}*{box-sizing:border-box}' + advancedTextStyles + animationStyles + '</style></head><body></body></html>'); pd.close();
    installFonts(pd);
    previewDoc = pd; refresh(); window.addEventListener('resize', preview);
    pd.fonts.ready.then(() => { if (!closed) preview(); });
    pd.fonts.addEventListener('loadingdone', () => { if (!closed) preview(); });
  }
}
