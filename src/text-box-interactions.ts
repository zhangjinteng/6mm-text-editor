import type { Editor } from 'tinymce';
import { setAdvancedEditing, textSource, selectAdvancedObject } from './text-advanced';
import { isTextLocked, setSelectedTextBox, selectionHasLockedText } from './text-box-state';

const selector = 'span[data-text-draggable]';

/** Selection and editing are separate modes. Preview styles never enter serialized content. */
export function enableTextBoxInteractions(editor: Editor): () => void {
  const doc = editor.getDoc(); const view = editor.getWin();
  const frame = doc.createElement('div');
  frame.className = 'text-box-frame'; frame.setAttribute('data-mce-bogus', 'all'); frame.contentEditable = 'false';
  frame.style.cssText = 'display:none;position:fixed;border:1px solid #4099ff;box-sizing:border-box;pointer-events:none;z-index:2147483646';
  for (const side of ['nw', 'ne', 'sw', 'se', 'w', 'e']) {
    const handle = doc.createElement('span'); handle.dataset.textResize = side;
    handle.setAttribute('aria-label', `调整文本框 ${side}`);
    handle.style.cssText = `position:absolute;width:10px;height:10px;background:white;border:1px solid #4099ff;box-sizing:border-box;pointer-events:auto;touch-action:none;cursor:${side.length === 1 ? 'ew' : side}-resize;${side.includes('w') ? 'left:-6px' : 'right:-6px'};${side.includes('n') ? 'top:-6px' : side.includes('s') ? 'bottom:-6px' : 'top:calc(50% - 5px)'}`;
    frame.append(handle);
  }
  doc.documentElement.append(frame);
  const css = doc.createElement('style'); const preview = doc.createElement('style');
  css.textContent = `${selector}{cursor:grab;touch-action:none;min-height:1em;white-space:pre-wrap;overflow-wrap:anywhere} body.text-object-selected{caret-color:transparent} body.text-object-selected ::selection{background:transparent} body.text-content-editing ${selector}{cursor:text;touch-action:auto}`;
  doc.head.append(css, preview);
  let selected: HTMLElement | undefined; let editing = false;
  type Gesture = { element: HTMLElement; capture: HTMLElement; pointer: number; kind: string; x: number; y: number; left: number; top: number; width: number; height: number; dx: number; dy: number; moved: boolean; fonts: { node: HTMLElement; size: number }[] };
  let gesture: Gesture | undefined;
  function path(node: Element) {
    const parts: string[] = [];
    for (let el: Element | null = node; el && el !== doc.body; el = el.parentElement) parts.unshift(`:nth-child(${Array.from(el.parentElement!.children).indexOf(el) + 1})`);
    return `body > ${parts.join(' > ')}`;
  }
  function update() {
    if (!selected?.isConnected) { setSelectedTextBox(editor); selected = undefined; editing = false; doc.body.classList.remove('text-object-selected', 'text-content-editing'); }
    if (!selected || editor.mode.isReadOnly()) { frame.style.display = 'none'; return; }
    const box = selected.getBoundingClientRect();
    Object.assign(frame.style, { display: 'block', left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    for (const child of frame.children) (child as HTMLElement).style.display = editing || isTextLocked(selected) ? 'none' : 'block';
  }
  function mode(value: boolean) {
    editing = value; setSelectedTextBox(editor, selected); setAdvancedEditing(selected, editing);
    doc.body.classList.toggle('text-object-selected', !!selected && !editing);
    doc.body.classList.toggle('text-content-editing', !!selected && editing);
    update();
  }
  function select(element?: HTMLElement) {
    setAdvancedEditing(selected, false); selected = element; mode(false);
    if (element) {
      editor.selection.controlSelection.hideResizeRect();
      for (const node of doc.body.querySelectorAll('[data-mce-selected]')) node.removeAttribute('data-mce-selected');
      editor.focus(); if (isTextLocked(element)) editor.selection.select(element); else selectAdvancedObject(editor, element);
      editor.dispatch('TextBoxSelected'); editor.nodeChanged();
    }
  }
  function cancel() {
    const old = gesture; gesture = undefined; preview.textContent = '';
    if (old?.capture.hasPointerCapture(old.pointer)) old.capture.releasePointerCapture(old.pointer);
    update();
  }
  function targetBox(target: Element) {
    const existing = target.closest<HTMLElement>(selector);
    if (existing) return existing;
    const block = target.closest<HTMLElement>('p,h1,h2,h3,h4,h5,h6');
    if (!block || !block.textContent?.trim() || block.closest('table,li,blockquote,[contenteditable="false"],div[data-danmaku-source]') || block.querySelector('img,video,iframe,table,div,span[data-text-draggable]')) return;
    let box: HTMLElement;
    editor.undoManager.transact(() => {
      box = doc.createElement('span'); box.dataset.textDraggable = 'true';
      while (block.firstChild) box.append(block.firstChild);
      block.append(box);
    });
    editor.dispatch('change'); return box!;
  }
  function down(event: PointerEvent) {
    if (event.button !== 0 || editor.mode.isReadOnly()) return;
    const target = event.target as Element;
    const handle = target.closest<HTMLElement>('[data-text-resize]');
    if (!frame.contains(target) && target.closest('[data-mce-bogus],img:not([data-text-render] img),video,iframe,div[data-danmaku-source]')) { select(); return; }
    // Do not convert line-end whitespace into a text object.
    if (!handle && !target.closest(selector)) {
      const range = doc.createRange(); range.selectNodeContents(target);
      if (!Array.from(range.getClientRects()).some(r => event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom)) { select(); return; }
    }
    const element = handle && frame.contains(handle) ? selected : targetBox(target);
    if (!element) { select(); return; }
    if (isTextLocked(element)) { select(element); event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (editing && element === selected && !handle) return;
    select(element);
    const rect = element.getBoundingClientRect(); const capture = handle ?? element;
    gesture = { element, capture, pointer: event.pointerId, kind: handle?.dataset.textResize ?? 'move', x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height, dx: 0, dy: 0, moved: false,
      fonts: [element, ...element.querySelectorAll<HTMLElement>('*')].filter(node => !node.closest('[data-text-render],[data-text-background-render],[data-mce-bogus]')).map(node => ({ node, size: parseFloat(view.getComputedStyle(node).fontSize) })) };
    capture.setPointerCapture(event.pointerId);
    event.preventDefault(); event.stopImmediatePropagation();
  }
  function dimensions(g: Gesture) {
    if (g.kind === 'move') return { width: g.width, x: g.dx, y: g.dy, scale: 1 };
    const west = g.kind.includes('w'); const north = g.kind.includes('n');
    let width = Math.max(32, g.width + (west ? -g.dx : g.dx));
    if (g.kind.length === 2) {
      const scale = Math.max(8 / g.fonts[0].size, 32 / g.width, Math.abs(g.dx / g.width) >= Math.abs(g.dy / g.height) ? width / g.width : (g.height + (north ? -g.dy : g.dy)) / g.height);
      width = g.width * scale;
      return { width, x: west ? g.width - width : 0, y: north ? g.height * (1 - scale) : 0, scale };
    }
    return { width, x: west ? g.width - width : 0, y: 0, scale: 1 };
  }
  function move(event: PointerEvent) {
    const g = gesture; if (!g || g.pointer !== event.pointerId) return;
    if (!g.element.isConnected || isTextLocked(g.element)) { cancel(); return; }
    g.dx = event.clientX - g.x; g.dy = event.clientY - g.y;
    if (!g.moved && Math.hypot(g.dx, g.dy) < 4) return;
    g.moved = true; const size = dimensions(g);
    preview.textContent = `${path(g.element)}{width:${size.width}px!important;max-width:none!important;height:auto!important;box-sizing:border-box!important;translate:${size.x}px ${size.y}px!important}` + (g.kind.length === 2 ? g.fonts.map(f => `${path(f.node)}{font-size:${f.size * size.scale}px!important}`).join('') : '');
    update(); editor.dispatch('ScrollContent'); event.preventDefault(); event.stopImmediatePropagation();
  }
  function up(event: PointerEvent) {
    const g = gesture; if (!g || g.pointer !== event.pointerId) return;
    const size = dimensions(g); cancel();
    if (g.moved && g.element.isConnected) {
      editor.undoManager.transact(() => {
        editor.dom.setStyles(g.element, { position: 'absolute', display: 'inline-block', boxSizing: 'border-box', left: '0px', top: '0px', right: 'auto', bottom: 'auto', margin: '0', width: `${size.width}px`, maxWidth: 'none', height: 'auto' });
        if (g.kind.length === 2) for (const f of g.fonts) editor.dom.setStyle(f.node, 'fontSize', `${f.size * size.scale}px`);
        const origin = g.element.getBoundingClientRect();
        editor.dom.setStyles(g.element, { left: `${g.left + size.x - origin.left}px`, top: `${g.top + size.y - origin.top}px` });
      });
      editor.nodeChanged(); editor.dispatch('change'); editor.dispatch('ResizeContent'); update();
    }
    event.preventDefault(); event.stopImmediatePropagation();
  }
  function double(event: MouseEvent) {
    const box = (event.target as Element).closest<HTMLElement>(selector);
    if (!box || editor.mode.isReadOnly()) return;
    if (isTextLocked(box)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    cancel(); selected = box; mode(true); editor.focus();
    const range = doc.caretRangeFromPoint(event.clientX, event.clientY);
    if (range && box.contains(range.startContainer)) editor.selection.setRng(range);
    else editor.selection.setCursorLocation(textSource(box), 0);
    editor.nodeChanged(); event.preventDefault(); event.stopImmediatePropagation();
  }
  function key(event: KeyboardEvent) {
    if (event.isComposing || !selected || editor.mode.isReadOnly()) return;
    if (event.key === 'Escape') {
      if (gesture) cancel();
      else if (editing) { mode(false); selectAdvancedObject(editor, selected); editor.nodeChanged(); }
      else select();
      event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    if (isTextLocked(selected) && !((event.metaKey || event.ctrlKey) && ['c', 'z', 'a'].includes(event.key.toLowerCase()))) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (editing && event.key === 'Enter') { editor.execCommand('InsertLineBreak'); event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (editing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const element = selected; select(); editor.undoManager.transact(() => element.remove()); editor.dispatch('change');
    }
    if (event.key.length === 1 || ['Enter', 'Delete', 'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  }
  function reset() { cancel(); select(); }
  function inserted() { select(editor.selection.getNode().closest<HTMLElement>(selector) ?? undefined); }
  function beforeInput(event: InputEvent) { if ((selected && !editing) || selectionHasLockedText(editor)) event.preventDefault(); }
  function lockChanged() { cancel(); if (selected) select(selected); }
  function blockMutation(event: Event) { if (selectionHasLockedText(editor)) { event.preventDefault(); event.stopImmediatePropagation(); } }
  doc.addEventListener('paste', blockMutation, true); doc.addEventListener('cut', blockMutation, true); doc.addEventListener('drop', blockMutation, true);
  editor.on('TextBoxLockChanged', lockChanged);
  const observer = new MutationObserver(update);
  observer.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'data-text-locked', 'contenteditable'] });
  doc.addEventListener('pointerdown', down, true); doc.addEventListener('pointermove', move, true); doc.addEventListener('pointerup', up, true);
  doc.addEventListener('pointercancel', cancel, true); doc.addEventListener('lostpointercapture', cancel, true);
  doc.addEventListener('beforeinput', beforeInput, true);
  editor.on('CanvasTextInserted', inserted);
  doc.addEventListener('dblclick', double, true); doc.addEventListener('keydown', key, true); doc.addEventListener('scroll', update, true);
  editor.on('BeforeSetContent Undo Redo', reset);
  editor.on('NodeChange ResizeContent ScrollContent SwitchMode input', update);
  return () => {
    editor.off('TextBoxLockChanged', lockChanged);
    doc.removeEventListener('paste', blockMutation, true); doc.removeEventListener('cut', blockMutation, true); doc.removeEventListener('drop', blockMutation, true);
    reset(); observer.disconnect(); frame.remove(); css.remove(); preview.remove();
    doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('pointermove', move, true); doc.removeEventListener('pointerup', up, true);
    doc.removeEventListener('pointercancel', cancel, true); doc.removeEventListener('lostpointercapture', cancel, true);
    doc.removeEventListener('beforeinput', beforeInput, true); editor.off('CanvasTextInserted', inserted);
    doc.removeEventListener('dblclick', double, true); doc.removeEventListener('keydown', key, true); doc.removeEventListener('scroll', update, true);
    editor.off('BeforeSetContent Undo Redo', reset); editor.off('NodeChange ResizeContent ScrollContent SwitchMode input', update);
  };
}
