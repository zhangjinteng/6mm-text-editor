export const writingModes = ['horizontal-tb', 'vertical-rl'] as const;

export function isVerticalText(box: HTMLElement): boolean {
  return box.ownerDocument.defaultView!.getComputedStyle(box).writingMode.startsWith('vertical');
}

export function readWritingMode(box: HTMLElement): string {
  return isVerticalText(box) ? 'vertical-rl' : 'horizontal-tb';
}

/** Swap the line's available length, keeping the object's top-left position. */
export function applyWritingMode(box: HTMLElement, mode: string) {
  const before = box.getBoundingClientRect();
  const length = isVerticalText(box) ? before.height : before.width;
  const vertical = mode === 'vertical-rl';
  box.dataset.textWritingMode = mode;
  Object.assign(box.style, {
    writingMode: mode, textOrientation: 'mixed', position: 'absolute', display: 'inline-block',
    boxSizing: 'border-box', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0',
    width: vertical ? 'auto' : `${length}px`, height: vertical ? `${length}px` : 'auto',
    maxWidth: 'none', maxHeight: 'none'
  });
  const source = box.querySelector<HTMLElement>(':scope > [data-text-source]');
  for (const node of source ? [source, ...source.querySelectorAll<HTMLElement>('*')] : Array.from(box.querySelectorAll<HTMLElement>('*'))) {
    if (node.closest('[data-text-render],[data-text-background-render],[data-mce-bogus]')) continue;
    node.style.removeProperty('writing-mode'); node.style.removeProperty('text-orientation');
    node.removeAttribute('data-mce-style');
  }
  const origin = box.getBoundingClientRect();
  box.style.left = `${before.left - origin.left}px`; box.style.top = `${before.top - origin.top}px`;
  box.removeAttribute('data-mce-style');
}

export const writingModeStyles = `
[data-text-writing-mode="vertical-rl"] > [data-text-source]{display:block;position:static;width:auto;height:100%;min-height:0}
[data-text-writing-mode="vertical-rl"][data-text-curve] > [data-text-source]{visibility:visible}
[data-text-writing-mode="vertical-rl"][data-text-curve] > [data-text-render]{position:absolute;left:0;top:0}
[data-text-writing-mode="vertical-rl"][data-text-stroke-render] > [data-text-source],
[data-text-writing-mode="vertical-rl"][data-text-fill-render] > [data-text-source]{visibility:hidden}
[data-text-writing-mode="vertical-rl"].text-advanced-editing > [data-text-source]{visibility:visible}
[data-text-render] > svg{writing-mode:horizontal-tb}
`;
