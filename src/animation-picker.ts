import { animationStyles, defaultAnimation, textAnimations, type TextAnimation } from './animations';
import './animation-picker.css';

const paths = [
  '<path d="M12 3v13m-4-4 4 4 4-4M5 21h14"/><circle cx="12" cy="5" r="2"/>',
  '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  '<circle cx="12" cy="12" r="5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  '<path d="M3 7v10m18-10v10M3 12h18M7 8l-4 4 4 4m10-8 4 4-4 4"/><rect x="8" y="6" width="8" height="12" rx="3"/>',
  '<path d="m5 8-4 4 4 4m14-8 4 4-4 4M1 12h5m12 0h5"/><rect x="8" y="7" width="8" height="10" rx="2"/>',
  '<path d="m8 5 4-4 4 4m-8 14 4 4 4-4M12 1v5m0 12v5"/><rect x="7" y="8" width="10" height="8" rx="2"/>',
  '<circle cx="12" cy="12" r="6"/><path d="M9 11h.01M15 11h.01m-6 4h6M2 8l2-3m16 0 2 3M1 12h3m16 0h3"/>',
  '<path d="M12 3 6 16m6-13 6 13M4 18q8 6 16 0"/><circle cx="12" cy="3" r="1"/>',
  '<path d="m12 4 2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1zM2 3l2 2m16 0 2-2M1 14h2m18 0h2"/>',
  '<path d="M3 5q9-7 18 0M3 19q9 7 18 0"/><rect x="7" y="6" width="10" height="12" rx="2" transform="rotate(-15 12 12)"/>',
  '<path d="m6 4 14 3-2 14-14-3zM4 7l16 10M6 4l12 17M3 3l2 1m15 16 2 1"/>',
  '<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1s-1 7 8 15c9-8 11-12 8-15Z"/><path d="M3 12h5l2-4 3 8 2-4h6"/>'
];

const labels = ['弹跳', '闪烁', '脉冲', '橡皮筋', '左右摇动', '上下摇动', '摇头', '摆动', '欢呼', '晃动', '果冻', '心跳'];

/** All controls edit a draft; the containing settings dialog owns the commit. */
export function createAnimationEditor(doc: Document, initial: TextAnimation, change: (value: TextAnimation) => void) {
  let value = { ...initial };
  const root = doc.createElement('div'); root.className = 'text-animation-editor';
  root.innerHTML = `<div class="animation-picker-heading"><strong>动画效果</strong><button type="button" data-clear aria-label="无动画">无动画</button></div>
    <div class="animation-picker-grid" role="group" aria-label="动画效果">${Object.keys(textAnimations).map((name, i) => `<button type="button" class="animation-effect" data-animation="${name}" aria-label="${name}" title="${labels[i]}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" data-text-animation="${name}">${paths[i]}</svg><span>${labels[i]}</span></button>`).join('')}</div>
    <div class="animation-playback"><label>每轮时长（秒）<input aria-label="每轮时长（秒）" data-animation-key="duration" type="number" min="0.1" max="60" step="0.1"></label>
    <label>循环播放<input aria-label="循环播放" data-animation-key="loop" type="checkbox"></label>
    <label>循环总时长（秒）<input aria-label="循环总时长（秒）" data-animation-key="total" type="number" min="0" max="3600" step="0.1"></label>
    <p>总时长为 0 时持续循环</p></div>`;
  const style = doc.createElement('style'); style.textContent = animationStyles; root.append(style);
  const fields = Array.from(root.querySelectorAll<HTMLInputElement>('[data-animation-key]'));
  const refresh = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-animation]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.animation === value.name)));
    root.querySelector('[data-clear]')!.setAttribute('aria-pressed', String(!value.name));
    fields.forEach(field => {
      if (field.type === 'checkbox') field.checked = value.loop;
      else field.value = String(value[field.dataset.animationKey as 'duration' | 'total']);
      field.disabled = !value.name || (field.dataset.animationKey === 'total' && !value.loop);
    });
  };
  root.querySelectorAll<HTMLButtonElement>('[data-animation]').forEach(button => button.addEventListener('click', () => {
    value.name = button.dataset.animation as TextAnimation['name']; refresh(); change({ ...value });
  }));
  root.querySelector('[data-clear]')!.addEventListener('click', () => { value = { ...defaultAnimation }; refresh(); change({ ...value }); });
  root.addEventListener('input', event => {
    const field = event.target as HTMLInputElement;
    const key = field.dataset.animationKey; if (!key) return;
    if (key === 'loop') { value.loop = field.checked; root.querySelector<HTMLInputElement>('[data-animation-key="total"]')!.disabled = !value.loop; }
    else value[key as 'duration' | 'total'] = field.valueAsNumber;
    change({ ...value });
  });
  refresh();
  return { element: root, reset(next: TextAnimation) { value = { ...next }; refresh(); } };
}
