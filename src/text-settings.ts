import type { Editor } from 'tinymce';
import { defaultDeform, readDeform, writeDeform, validateDeform } from './text-deform';
import { createDeformEditor } from './text-deform-editor';
import { advancedTextStyles, ensureSource, renderAdvancedText, selectAdvancedObject } from './text-advanced';
import { currentTextBox, isTextLocked } from './text-box-state';
import './text-settings.css';
import { readFills, writeFills, newFill, validateFills, fillImageUrl } from './text-fill';
import { createFillEditor } from './text-fill-editor';
import { readShadow, writeShadow, validateShadow, type TextShadow } from './text-shadow';
import { createShadowEditor } from './text-shadow-editor';
import { readBackground, writeBackground, validateBackground, type TextBackground } from './text-background';
import { createBackgroundEditor } from './text-background-editor';

const defaults = {
  opacity: '100', background: null as TextBackground | null,
  stroke: false, strokeColor: '#000000', strokeWidth: '1', strokePosition: 'center', strokeJoin: 'miter',
  shadow: null as TextShadow | null,
  layers: [newFill('original', 'base')], deformation: structuredClone(defaultDeform)
};
type Settings = typeof defaults;
type Tab = 'appearance' | 'fill' | 'curve';
const limits = { opacity: [0, 100], strokeWidth: [0, 10] } as const;
type Numeric = keyof typeof limits;
const pixels = (value: string, fallback = 0) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
function read(box: HTMLElement): Settings {
  const s = box.style, d = box.dataset;
  return {
    opacity: String(Math.round(pixels(s.opacity, 1) * 100)), background: readBackground(box),
    stroke: d.textStrokeEnabled !== 'false' && (d.textStrokeEnabled === 'true' || pixels(s.getPropertyValue('-webkit-text-stroke-width')) > 0),
    strokeWidth: d.textStrokeWidth ?? String(pixels(s.getPropertyValue('-webkit-text-stroke-width'), 1)), strokeColor: d.textStrokeColor || s.getPropertyValue('-webkit-text-stroke-color') || defaults.strokeColor,
    strokePosition: d.textStrokePosition || defaults.strokePosition, strokeJoin: d.textStrokeJoin || defaults.strokeJoin,
    shadow: readShadow(box),
    layers: readFills(box), deformation: readDeform(box)
  };
}
function validate(s: Settings, doc: Document): string {
  for (const [key, [min, max]] of Object.entries(limits)) {
    const value = s[key as Numeric];
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) return '请输入各项标注范围内的有效数值。';
  }
  for (const key of ['strokeColor'] as const) {
    const probe = doc.createElement('span'); probe.style.color = s[key];
    if (!/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(s[key]) || !probe.style.color) return '请输入有效的颜色。';
  }
  if (!['inside', 'center', 'outside'].includes(s.strokePosition) || !['miter', 'bevel', 'round'].includes(s.strokeJoin)) return '请选择有效的设置。';
  return validateDeform(s.deformation) || validateBackground(s.background) || validateShadow(s.shadow) || validateFills(s.layers, doc);
}
/** The same draft operation paints the isolated preview and commits to the document. */
function apply(box: HTMLElement, s: Settings, initial: Settings, width: number) {
  const different = (...keys: (keyof Settings)[]) => keys.some(key => s[key] !== initial[key]);
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
  for (const child of [box, ...box.querySelectorAll<HTMLElement>('[style]')]) child.removeAttribute('data-mce-style');
  renderAdvancedText(box);
}

export function registerTextSettings(editor: Editor): void {
  let dispose: (() => void) | undefined;
  const canChange = (box = currentTextBox(editor)) => !!box?.isConnected && !editor.removed && !editor.mode.isReadOnly() && !isTextLocked(box);
  editor.on('remove', () => dispose?.());
  editor.addCommand('TextSettings', (_ui, value) => open(['appearance', 'fill', 'curve'].includes(value) ? value as Tab : 'appearance'));
  editor.ui.registry.addIcon('text-settings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 5h12M9 5v15M5 20h8M16 9h5M16 15h5M16 20h5"/><circle cx="18" cy="9" r="1.5" fill="white"/><circle cx="20" cy="15" r="1.5" fill="white"/></svg>');
  for (const [name, label, tab] of [['textsettings', '文字设置', 'appearance'], ['textappearance', '外观', 'appearance'], ['textfill', '填充', 'fill'], ['textcurve', '变形', 'curve']] as const) {
    editor.ui.registry.addButton(name, {
      ...(name === 'textsettings' ? { icon: 'text-settings' } : { text: label }), tooltip: label,
      onAction: () => open(tab), onSetup: api => {
        const events = 'NodeChange SelectionChange SwitchMode TextBoxSelected TextBoxLockChanged Undo Redo';
        const update = () => api.setEnabled(canChange()); update(); editor.on(events, update); return () => editor.off(events, update);
      }
    });
  }
  function open(tab: Tab) {
    const box = currentTextBox(editor); if (!box || !canChange(box) || dispose) return;
    const doc = editor.getContainer().ownerDocument, dialog = doc.createElement('dialog');
    dialog.className = 'text-settings-dialog'; dialog.setAttribute('aria-label', '文字设置');
    const range = (name: Numeric, label: string, unit: string, legacy = label) => `<label class="text-setting-range"><span>${label}<span><input type="text" inputmode="decimal" name="${name}" aria-label="${legacy}"><small>${unit}</small></span></span><input type="range" data-range="${name}" aria-label="${label}滑块" min="${limits[name][0]}" max="${limits[name][1]}" step="${name === 'strokeWidth' ? '.1' : '1'}"></label>`;
    const check = (name: string, label: string) => `<label class="text-settings-check"><input type="checkbox" name="${name}">${label}</label>`;
    const color = (name: string, label: string) => `<label class="text-settings-color">${label}<span><input type="color" data-color="${name}" aria-label="${label}色板"><input type="text" name="${name}" aria-label="${label}" spellcheck="false"></span></label>`;
    const select = (name: string, label: string, items: string[][]) => `<label class="text-settings-select">${label}<select name="${name}" aria-label="${label}">${items.map(([value, text]) => `<option value="${value}">${text}</option>`).join('')}</select></label>`;
    dialog.innerHTML = `<header><div><h2>文字设置</h2><p>预览调整效果，应用后保存到文字</p></div><button type="button" data-close aria-label="关闭文字设置">×</button></header>
      <div class="text-settings-body"><div class="text-settings-preview"><iframe title="文字效果预览" sandbox="allow-same-origin" tabindex="-1"></iframe><span>效果预览</span></div><div class="text-settings-controls">
      <div role="tablist" aria-label="文字设置分类">${([['appearance', '外观'], ['fill', '填充'], ['curve', '变形']] as const).map(([name, text]) => `<button type="button" role="tab" data-tab="${name}" id="text-tab-${name}" aria-controls="text-panel-${name}" aria-selected="false">${text}</button>`).join('')}</div>
      <section role="tabpanel" data-section="appearance" id="text-panel-appearance" aria-labelledby="text-tab-appearance">
      <div class="text-settings-subtabs" role="tablist" aria-label="外观分类">${[['opacity', '透明度'], ['background', '背景'], ['stroke', '描边'], ['shadow', '投影']].map(([name, text]) => `<button type="button" role="tab" data-effect="${name}" id="text-effect-${name}" aria-controls="text-effect-panel-${name}" aria-selected="${name === 'opacity'}">${text}</button>`).join('')}</div>
      <div role="tabpanel" id="text-effect-panel-opacity" aria-labelledby="text-effect-opacity" data-effect-panel="opacity">${range('opacity', '整体不透明度', '%', '整体不透明度（0—100%）')}<p class="text-settings-hint">同时调整文字、填充、背景和投影的透明度。</p></div>
      <div role="tabpanel" id="text-effect-panel-background" aria-labelledby="text-effect-background" data-effect-panel="background" hidden><div data-background-editor></div></div>
      <div role="tabpanel" id="text-effect-panel-stroke" aria-labelledby="text-effect-stroke" data-effect-panel="stroke" hidden>${check('stroke', '启用文字描边')}${color('strokeColor', '描边颜色')}${range('strokeWidth', '描边宽度', 'px', '描边宽度（0—10 px）')}${select('strokePosition', '描边位置', [['inside', '内描边'], ['center', '居中描边'], ['outside', '外描边']])}${select('strokeJoin', '拐角', [['miter', '尖角'], ['bevel', '斜角'], ['round', '圆角']])}</div>
      <div role="tabpanel" id="text-effect-panel-shadow" aria-labelledby="text-effect-shadow" data-effect-panel="shadow" hidden><div data-shadow-editor></div></div></section>
      <section role="tabpanel" data-section="fill" id="text-panel-fill" aria-labelledby="text-tab-fill" hidden><div data-fill-editor></div></section>
      <section role="tabpanel" data-section="curve" id="text-panel-curve" aria-labelledby="text-tab-curve" hidden><div data-deform-editor></div></section>
      </div></div><p class="text-settings-error" role="alert" hidden></p><footer><button type="button" data-reset>重置效果</button><div><button type="button" data-close>取消</button><button type="button" data-apply>应用设置</button></div></footer>`;
    const initial = read(box); let draft = structuredClone(initial), closed = false, busy = false, checking = false, applyVersion = 0;
    const width = Math.max(32, box.offsetWidth), snapshot = box.cloneNode(true) as HTMLElement;
    const inherited = editor.getWin().getComputedStyle(box);
    for (const key of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'color', 'direction', 'text-decoration']) snapshot.style.setProperty(key, inherited.getPropertyValue(key));
    const input = (name: string) => dialog.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!;
    const frame = dialog.querySelector('iframe')!, error = dialog.querySelector<HTMLElement>('[role="alert"]')!, applyButton = dialog.querySelector<HTMLButtonElement>('[data-apply]')!;
    let previewDoc: Document | undefined;
    const message = (text: string) => { error.textContent = text; error.hidden = !text; };
    const invalidateCheck = () => { ++applyVersion; if (checking) { checking = false; busy = false; applyButton.disabled = false; applyButton.textContent = '应用设置'; } };
    const preview = () => {
      if (!previewDoc || closed || validate(draft, doc)) return;
      const clone = previewDoc.importNode(snapshot, true);
      clone.querySelectorAll('[data-mce-bogus], [data-text-render]').forEach(node => node.remove());
      for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) { node.removeAttribute('id'); node.removeAttribute('contenteditable'); node.classList.remove('text-advanced-editing'); }
      clone.dataset.textRenderId = 'preview-' + crypto.randomUUID();
      Object.assign(clone.style, { position: 'absolute', display: 'inline-block', boxSizing: 'border-box', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0', width: `${width}px`, maxWidth: 'none', transform: 'none', rotate: 'none', scale: 'none', animation: 'none', pointerEvents: 'none' });
      clone.classList.remove('text-advanced-editing');
      previewDoc.body.replaceChildren(clone); apply(clone, draft, initial, width);
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
    const refresh = () => {
      for (const key of Object.keys(draft) as (keyof Settings)[]) {
        const field = input(key); if (!field) continue;
        if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = draft[key] as boolean;
        else field.value = String(draft[key]);
      }
      dialog.querySelectorAll<HTMLInputElement>('[data-range]').forEach(field => { field.value = String(draft[field.dataset.range as Numeric]); });
      dialog.querySelectorAll<HTMLInputElement>('[data-color]').forEach(field => {
        const color = draft[field.dataset.color as 'strokeColor'];
        const canvas = doc.createElement('canvas'); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d')!; ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        const rgb = ctx.getImageData(0, 0, 1, 1).data;
        field.value = '#' + Array.from(rgb).slice(0, 3).map(value => value.toString(16).padStart(2, '0')).join('');
      });
      preview();
    };
    const close = () => {
      if (closed) return; closed = true; ++applyVersion; fillEditor.dispose(); shadowEditor.dispose(); window.removeEventListener('resize', preview); dialog.remove(); dispose = undefined;
      if (!editor.removed && box.isConnected) { editor.focus(); selectAdvancedObject(editor, box); editor.nodeChanged(); editor.dispatch('ResizeContent'); }
    };
    dispose = close;
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    const bindTabs = (buttonSelector: string, panelSelector: string, key: 'tab' | 'effect') => {
      const tabs = Array.from(dialog.querySelectorAll<HTMLButtonElement>(buttonSelector));
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
      activate(tabs.find(button => button.dataset[key] === tab) ?? tabs[0]!);
    };
    bindTabs('[data-tab]', '[data-section]', 'tab'); bindTabs('[data-effect]', '[data-effect-panel]', 'effect');
    dialog.addEventListener('input', event => {
      const field = event.target as HTMLInputElement;
      const key = field.dataset.range || field.dataset.color || field.name;
      if (!(key in draft)) return;
      draft = { ...draft, [key]: field.type === 'checkbox' ? field.checked : field.value }; invalidateCheck();
      message(''); refresh();
    });
    dialog.querySelector('[data-reset]')!.addEventListener('click', () => { ++applyVersion; busy = false; applyButton.disabled = false; draft = structuredClone(defaults); fillEditor.reset(draft.layers); shadowEditor.reset(draft.shadow); backgroundEditor.reset(draft.background); deformEditor.reset(draft.deformation); message(''); refresh(); });
    applyButton.addEventListener('click', async () => {
      if (busy || !canChange(box)) return;
      const invalid = validate(draft, doc); if (invalid) { message(invalid); return; }
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
      if (!canChange(box)) return;
      if (submitted !== JSON.stringify(initial)) editor.undoManager.transact(() => apply(box, draft, initial, width));
      close(); editor.dispatch('CanvasTextInserted'); editor.dispatch('change');
    });
    doc.body.append(dialog); dialog.showModal();
    const pd = frame.contentDocument!;
    pd.open(); pd.write('<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:"PingFang SC",sans-serif}*{box-sizing:border-box}' + advancedTextStyles + '</style></head><body></body></html>'); pd.close();
    previewDoc = pd; refresh(); window.addEventListener('resize', preview);
    pd.fonts.ready.then(() => { if (!closed) preview(); });
  }
}
