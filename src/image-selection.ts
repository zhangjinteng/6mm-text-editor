import type { Editor } from 'tinymce';

/** Keep image selection semantics while the shared object frame supplies its visuals. */
export function enableImageSelection(editor: Editor): () => void {
  const doc = editor.getDoc();
  // TinyMCE can restore data-mce-selected after pointerdown. Suppress its extra
  // outline without removing the selection state used by image commands.
  const style = doc.createElement('style');
  style.textContent = '.mce-content-body img[data-mce-selected]:not([data-mce-object]):not([data-mce-placeholder]) { outline: none; }';
  doc.head.append(style);
  function hideHighlight() {
    const selection = doc.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed || range.startContainer !== range.endContainer || range.endOffset !== range.startOffset + 1) return;
    const image = range.startContainer.childNodes[range.startOffset];
    if (image?.nodeName !== 'IMG' || !doc.body.contains(image)) return;
    // A caret inside the empty IMG paints no highlight. The public range hook
    // below keeps commands, clipboard operations and settings selecting the image.
    selection.collapse(image, 0);
  }
  function logicalRange(event: { range: Range }) {
    const range = event.range;
    if (!range.collapsed || range.startContainer.nodeName !== 'IMG' || !doc.body.contains(range.startContainer)) return;
    const imageRange = doc.createRange();
    imageRange.selectNode(range.startContainer);
    event.range = imageRange;
  }
  editor.on('GetSelectionRange', logicalRange);
  editor.on('AfterSetSelectionRange', hideHighlight);
  doc.addEventListener('selectionchange', hideHighlight);
  return () => {
    style.remove();
    editor.off('GetSelectionRange', logicalRange);
    editor.off('AfterSetSelectionRange', hideHighlight);
    doc.removeEventListener('selectionchange', hideHighlight);
  };
}
