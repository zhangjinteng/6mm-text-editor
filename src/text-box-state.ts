import type { Editor } from 'tinymce';
import { isBlankSelection } from './blank-selection';

const selected = new WeakMap<Editor, HTMLElement>();
export const isTextLocked = (element?: Element | null) => element?.getAttribute('data-text-locked') === 'true';
export function setSelectedTextBox(editor: Editor, element?: HTMLElement) {
  if (element) selected.set(editor, element); else selected.delete(editor);
}
export function currentTextBox(editor: Editor): HTMLElement | undefined {
  const cached = selected.get(editor);
  if (cached?.isConnected) return cached;
  if (!editor.getBody() || isBlankSelection(editor)) return undefined;
  return editor.selection.getNode().closest<HTMLElement>('span[data-text-draggable]') ?? undefined;
}
export function selectionHasLockedText(editor: Editor): boolean {
  if (!editor.getBody()) return false;
  if (isTextLocked(currentTextBox(editor))) return true;
  const range = editor.selection.getRng();
  if (range.collapsed) return false;
  return Array.from(editor.getBody().querySelectorAll('[data-text-locked="true"]')).some(element => !element.closest('[data-mce-bogus]') && range.intersectsNode(element));
}
