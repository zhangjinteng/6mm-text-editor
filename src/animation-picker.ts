import './animation-picker.css';

export interface AnimationPlayback { duration: number; loop: boolean; total: number }
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

export function openAnimationPicker(anchor: HTMLElement, names: string[], selected: string | undefined,
  playback: AnimationPlayback, apply: (name: string | undefined, settings: AnimationPlayback) => void,
  onClose: (restoreFocus: boolean) => void, styles: string): () => void {
  const panel = document.createElement('div');
  panel.className = 'animation-picker';
  panel.setAttribute('popover', 'manual');
  panel.setAttribute('role', 'dialog');
  panel.tabIndex = -1;
  panel.setAttribute('aria-label', '文字动画设置');
  panel.innerHTML = `<div class="animation-picker-heading"><span>文字动画</span><span>悬停预览</span></div><div class="animation-picker-grid" role="group" aria-label="动画效果">${names.map((name, i) => `<button type="button" class="animation-effect" data-effect="${name}" title="${name}" aria-label="${name}" aria-pressed="${selected === name}"><svg viewBox="0 0 24 24" aria-hidden="true" data-text-animation="${name}">${paths[i]}</svg></button>`).join('')}</div>
    <div class="animation-playback" hidden><label>每轮时长（秒）<input aria-label="每轮时长（秒）" type="number" min="0.1" max="60" step="0.1" value="${playback.duration}"></label>
    <label class="animation-loop"><span>循环播放</span><input aria-label="循环播放" type="checkbox" ${playback.loop ? 'checked' : ''}></label>
    <label>循环总时长（秒）<input aria-label="循环总时长（秒）" type="number" min="0" max="3600" step="0.1" value="${playback.total}"></label>
    <p>总时长为 0 时持续循环</p><button type="button" data-apply>应用设置</button></div>
    <div class="animation-picker-actions">
      <button type="button" data-clear aria-label="无动画" title="无动画"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 16-16" stroke="#e34840" stroke-width="2"/></svg><span>清除</span></button>
      <button type="button" data-settings aria-label="播放设置" title="播放设置" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="9" cy="18" r="2" fill="white"/></g></svg><span>设置</span></button>
      <button type="button" aria-label="关闭动画设置" title="关闭"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
    </div>`;
  const style = document.createElement('style');
  style.textContent = styles;
  panel.append(style);
  // 放入编辑器的 UI 区域，焦点进入面板时 TinyMCE 仍将它视为工具栏操作。
  (anchor.closest('.tox-tinymce-aux') || document.body).append(panel);
  const duration = panel.querySelector<HTMLInputElement>('[aria-label="每轮时长（秒）"]')!;
  const loop = panel.querySelector<HTMLInputElement>('[aria-label="循环播放"]')!;
  const total = panel.querySelector<HTMLInputElement>('[aria-label="循环总时长（秒）"]')!;
  const syncLoop = () => { total.disabled = !loop.checked; };
  syncLoop(); loop.addEventListener('change', syncLoop);
  // 整个面板都属于编辑器 UI：空白处也必须有可保留的焦点。
  // 输入框保留光标和数字选择；按钮、复选框以及空白处阻止默认失焦，
  // 但仍保留 click 的按钮动作和标签/复选框切换。
  panel.addEventListener('mousedown', event => {
    event.stopPropagation();
    const target = event.target as Element;
    const control = target.closest<HTMLElement>('input, button, select, textarea') ||
      target.closest('label')?.querySelector<HTMLElement>('input, select, textarea');
    if (control && !control.matches(':disabled')) {
      control.focus({ preventScroll: true });
      if (control.matches('button, input[type="checkbox"]')) event.preventDefault();
    } else {
      event.preventDefault();
      panel.focus({ preventScroll: true });
    }
  });
  panel.addEventListener('touchstart', event => event.stopPropagation(), { passive: true });
  let anchorRect = anchor.getBoundingClientRect();
  const place = () => {
    const current = anchor.getBoundingClientRect();
    // TinyMCE 在焦点进入弹层时可能卸载工具栏，保留最后一次有效锚点。
    if (current.width > 0 && current.height > 0) anchorRect = current;
    const rect = anchorRect;
    panel.style.left = `${Math.max(8, Math.min(rect.left + rect.width / 2 - panel.offsetWidth / 2, window.innerWidth - panel.offsetWidth - 8))}px`;
    const above = rect.top - panel.offsetHeight - 6;
    panel.style.top = `${Math.max(8, Math.min(above >= 8 ? above : rect.bottom + 6, window.innerHeight - panel.offsetHeight - 8))}px`;
  };
  let frame = 0;
  const schedulePlace = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(place);
  };
  const anchorChanges = new MutationObserver(schedulePlace);
  anchorChanges.observe(anchor.closest('.tox-pop') || anchor, { attributes: true, attributeFilter: ['class', 'style', 'data-editor-docked-toolbar'] });
  let closed = false;
  const outside = (event: Event) => {
    const target = event.target as Node;
    if (!panel.contains(target) && !anchor.contains(target)) close(false);
  };
  const escape = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation(); close(true);
  };
  const documents = [document, ...Array.from(document.querySelectorAll<HTMLIFrameElement>('.tox-edit-area iframe'))
    .map(iframe => iframe.contentDocument).filter((doc): doc is Document => !!doc)];
  const close = (restoreFocus = true) => {
    if (closed) return;
    closed = true;
    anchorChanges.disconnect(); cancelAnimationFrame(frame);
    window.removeEventListener('resize', schedulePlace); window.removeEventListener('scroll', schedulePlace, true);
    for (const doc of documents) {
      doc.removeEventListener('pointerdown', outside, true); doc.removeEventListener('keydown', escape, true);
    }
    panel.remove(); onClose(restoreFocus);
  };
  const settingsButton = panel.querySelector<HTMLButtonElement>('[data-settings]')!;
  const playbackPanel = panel.querySelector<HTMLElement>('.animation-playback')!;
  settingsButton.addEventListener('click', () => {
    playbackPanel.hidden = !playbackPanel.hidden;
    settingsButton.setAttribute('aria-expanded', String(!playbackPanel.hidden));
    place();
  });
  panel.querySelector('[aria-label="关闭动画设置"]')!.addEventListener('click', () => close(true));
  const commit = (name?: string) => {
    if (!duration.reportValidity() || !total.reportValidity()) return;
    if (!name) { apply(undefined, playback); close(false); return; }
    apply(name, { duration: duration.valueAsNumber, loop: loop.checked, total: total.valueAsNumber }); close(false);
  };
  panel.querySelectorAll<HTMLButtonElement>('[data-effect]').forEach(button => button.addEventListener('click', () => commit(button.dataset.effect)));
  panel.querySelector('[data-clear]')!.addEventListener('click', () => commit());
  const applyButton = panel.querySelector<HTMLButtonElement>('[data-apply]')!;
  applyButton.disabled = !selected;
  applyButton.addEventListener('click', () => commit(selected));
  for (const doc of documents) {
    doc.addEventListener('pointerdown', outside, true); doc.addEventListener('keydown', escape, true);
  }
  panel.showPopover();
  place();
  schedulePlace();
  window.addEventListener('resize', schedulePlace); window.addEventListener('scroll', schedulePlace, true);
  panel.querySelector<HTMLButtonElement>(selected ? `[data-effect="${selected}"]` : '[data-effect]')?.focus();
  return () => close(true);
}
