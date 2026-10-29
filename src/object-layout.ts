import type { Editor } from 'tinymce';

/** 对象所在正文块的内容边界；对齐和填充使用同一个参照区域。 */
export function contentBounds(editor: Editor, element: HTMLElement) {
  const parent = element.parentElement?.closest<HTMLElement>('p,div,figure,td,th,li,body') ?? editor.getBody();
  const bounds = parent.getBoundingClientRect();
  const computed = editor.getWin().getComputedStyle(parent);
  const pixels = (value: string) => parseFloat(value) || 0;
  const left = bounds.left + pixels(computed.borderLeftWidth) + pixels(computed.paddingLeft);
  const right = bounds.right - pixels(computed.borderRightWidth) - pixels(computed.paddingRight);
  return { left, width: Math.max(0, right - left) };
}

