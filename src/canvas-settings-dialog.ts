import type { Editor } from 'tinymce';
import { documentHtml } from './document';
import './canvas-settings-dialog.css';

type BackgroundDraft = { color: string; transparency: string };

/** Keep TinyMCE's dialog lifecycle and draft semantics, sharing the text dialog's layout. */
export function decorateCanvasSettings(editor: Editor, root: HTMLElement, api: {
  getData(): BackgroundDraft;
  setData(data: Partial<BackgroundDraft>): void;
}) {
  const doc = root.ownerDocument;
  root.classList.add('canvas-settings-dialog');
  const wrap = root.closest('.tox-dialog-wrap')!;
  wrap.classList.add('canvas-settings-wrap');
  const heading = root.querySelector('.tox-dialog__title')!;
  const title = doc.createElement('div');
  heading.before(title); title.append(heading);
  const subtitle = doc.createElement('p'); subtitle.className = 'canvas-settings-subtitle';
  subtitle.textContent = '预览调整效果，应用后保存到画布'; title.append(subtitle);

  const form = root.querySelector<HTMLElement>('.tox-form')!;
  const groups = Array.from(form.children);
  const layout = doc.createElement('div'); layout.className = 'canvas-settings-layout';
  layout.innerHTML = `<div class="canvas-settings-preview"><div class="canvas-settings-sheet"><iframe title="画布效果预览" sandbox="allow-same-origin" tabindex="-1"></iframe></div><span>画布预览</span></div>
    <div class="canvas-settings-controls"><div class="canvas-settings-tabs" role="tablist" aria-label="画布设置分类">
      <button type="button" role="tab" id="canvas-dialog-background-tab" aria-controls="canvas-dialog-background" aria-selected="true">背景</button>
      <button type="button" role="tab" id="canvas-dialog-insert-tab" aria-controls="canvas-dialog-insert" aria-selected="false" tabindex="-1">插入</button>
    </div><section id="canvas-dialog-background" role="tabpanel" aria-labelledby="canvas-dialog-background-tab"></section>
    <section id="canvas-dialog-insert" role="tabpanel" aria-labelledby="canvas-dialog-insert-tab" hidden></section></div>`;
  const background = layout.querySelector('#canvas-dialog-background')!;
  const insert = layout.querySelector('#canvas-dialog-insert')!;
  let inserting = false;
  for (const group of groups) {
    if (group.querySelector('[data-canvas-color-fields]')) { group.remove(); continue; }
    if (group.querySelector('[data-canvas-insert-hint]')) inserting = true;
    (inserting ? insert : background).append(group);
  }
  form.append(layout);
  // Preserve the original action handler while placing the secondary action in the footer.
  const clear = background.querySelector('button');
  if (clear) {
    clear.classList.add('canvas-settings-clear');
    root.querySelector('.tox-dialog__footer-start')!.append(clear);
  }
  const tabs = Array.from(layout.querySelectorAll<HTMLButtonElement>('[role=tab]'));
  const activate = (index: number) => {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    (background as HTMLElement).hidden = index !== 0; (insert as HTMLElement).hidden = index !== 1;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      activate(next); tabs[next]!.focus();
    });
  });
  const transparency = background.querySelectorAll<HTMLInputElement>('input')[1]!;
  const slider = doc.createElement('input');
  slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.step = '1';
  slider.className = 'canvas-settings-slider'; slider.setAttribute('aria-label', '背景透明度滑块');
  const scale = doc.createElement('div'); scale.className = 'canvas-settings-scale';
  scale.innerHTML = '<span>不透明</span><span>完全透明</span>';
  transparency.closest('.tox-form__group')!.append(slider, scale);
  slider.addEventListener('input', () => {
    api.setData({ transparency: slider.value });
    // Notify the existing color swatch and preview bindings as well as the native form.
    transparency.dispatchEvent(new Event('input', { bubbles: true })); update();
  });

  const preview = layout.querySelector<HTMLElement>('.canvas-settings-preview')!;
  const sheet = layout.querySelector<HTMLElement>('.canvas-settings-sheet')!;
  const frame = layout.querySelector('iframe')!;
  const width = editor.getDoc().documentElement.clientWidth;
  const height = editor.getDoc().documentElement.clientHeight;
  Object.assign(frame.style, { width: `${width}px`, height: `${height}px` });
  let ready = false, disposed = false;
  function fit() {
    const ratio = Math.min(1, Math.max(1, preview.clientWidth - 32) / width, Math.max(1, preview.clientHeight - 60) / height);
    Object.assign(sheet.style, { width: `${width * ratio}px`, height: `${height * ratio}px` });
    frame.style.transform = `scale(${ratio})`;
  }
  function update() {
    if (disposed) return;
    const draft = api.getData();
    const amount = Number(draft.transparency);
    if (Number.isFinite(amount)) slider.value = String(amount);
    if (!ready || !draft.transparency.trim() || !Number.isFinite(amount) || amount < 0 || amount > 100) return;
    if (draft.color.trim() && !/^#[\da-f]{6}$/i.test(draft.color.trim())) return;
    const pd = frame.contentDocument!;
    let layer = pd.querySelector<HTMLElement>('.document-background-color');
    if (!draft.color.trim()) { layer?.remove(); return; }
    if (!layer) { layer = pd.createElement('div'); layer.className = 'document-background-color'; pd.body.prepend(layer); }
    const rgb = [1, 3, 5].map(at => parseInt(draft.color.trim().slice(at, at + 2), 16));
    layer.style.backgroundColor = `rgba(${rgb.join(',')},${1 - amount / 100})`;
  }
  frame.addEventListener('load', () => {
    if (disposed) return;
    const pd = frame.contentDocument!;
    const style = pd.createElement('style');
    style.textContent = 'html,body{background:transparent!important;overflow:hidden!important}*{animation-play-state:paused!important}';
    pd.head.append(style); ready = true; update();
  });
  const refreshContent = () => {
    ready = false;
    frame.srcdoc = documentHtml(editor.getContent(), '画布效果预览', true);
  };
  refreshContent(); fit();
  const observer = new ResizeObserver(fit); observer.observe(preview);
  editor.on('change', refreshContent);
  return { update, dispose() { disposed = true; observer.disconnect(); editor.off('change', refreshContent); wrap.classList.remove('canvas-settings-wrap'); } };
}
