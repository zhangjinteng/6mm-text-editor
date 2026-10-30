import type { Editor } from 'tinymce';
import { textSource, selectAdvancedObject } from './text-advanced';
import { selectionHasLockedText } from './text-box-state';

const boxSelector = 'span[data-text-draggable]';
const characterCommands = new Set(['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'fontname', 'fontsize', 'forecolor', 'hilitecolor', 'backcolor', 'mceapplytextcolor', 'mceremovetextcolor', 'removeformat', 'textletterspacing']);

/** Use the native formatters after resolving whether the scope is an object or a text range. */
export function registerTextTypography(editor: Editor): void {
  let applyingFormat = false;
  function box() { return editor.selection.getNode().closest<HTMLElement>(boxSelector); }
  function objectMode() { return editor.getBody().classList.contains('text-object-selected'); }
  function changed() { editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('change'); }
  function restore(element: HTMLElement) {
    if (!element.isConnected) return;
    if (element.querySelector(':scope > [data-text-render]')) selectAdvancedObject(editor, element);
    else { const walker = editor.getDoc().createTreeWalker(textSource(element), NodeFilter.SHOW_TEXT); editor.selection.setCursorLocation(walker.nextNode() ?? element, 0); }
    editor.nodeChanged();
  }
  editor.on('BeforeExecCommand', event => {
    if (editor.mode.isReadOnly() || applyingFormat) return;
    const element = box(); if (!element) return;
    const command = event.command.toLowerCase();
    const alignments: Record<string, string> = { justifyleft: 'left', justifycenter: 'center', justifyright: 'right', justifyfull: 'justify' };
    if (alignments[command] || command === 'lineheight') {
      event.preventDefault();
      const value = String(event.value);
      if (command === 'lineheight' && (!Number.isFinite(Number(value)) || Number(value) < 0.5 || Number(value) > 5)) return;
      const bookmark = editor.selection.getBookmark();
      editor.undoManager.transact(() => {
        editor.dom.setStyle(element, command === 'lineheight' ? 'lineHeight' : 'textAlign', alignments[command] ?? value);
        // Old inline line heights must not override a newly chosen paragraph line height.
        if (command === 'lineheight') for (const child of element.querySelectorAll<HTMLElement>('[style]')) editor.dom.setStyle(child, 'lineHeight', null);
      });
      editor.selection.moveToBookmark(bookmark); changed(); return;
    }
    const whole = objectMode(); const originalRange = editor.selection.getRng().cloneRange();
    const startsAtBox = originalRange.startContainer === element && originalRange.startOffset === 0;
    const endsAtBox = originalRange.endContainer === element && originalRange.endOffset === element.childNodes.length;
    if ((whole || (!originalRange.collapsed && element.contains(originalRange.startContainer) && element.contains(originalRange.endContainer))) && (characterCommands.has(command) || (command === 'mcetoggleformat' && ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'].includes(String(event.value))))) {
      event.preventDefault(); event.stopImmediatePropagation();
      applyingFormat = true;
      try {
        editor.undoManager.transact(() => {
          // Non-bookmark boundaries prevent TinyMCE from lifting inline formats outside the positioned box.
          const content = textSource(element);
          const start = editor.getDoc().createElement('span'); const end = start.cloneNode() as HTMLElement;
          start.setAttribute('data-mce-bogus', 'all'); end.setAttribute('data-mce-bogus', 'all');
          const walker = editor.getDoc().createTreeWalker(content, NodeFilter.SHOW_TEXT);
          const texts: Node[] = []; for (let node = walker.nextNode(); node; node = walker.nextNode()) texts.push(node);
          content.prepend(start); content.append(end);
          try {
            if (texts.length) {
              const range = whole ? editor.getDoc().createRange() : originalRange;
              if (whole || startsAtBox) range.setStart(texts[0], 0);
              if (whole || endsAtBox) range.setEnd(texts[texts.length - 1], texts[texts.length - 1].textContent!.length);
              editor.selection.setRng(range);
            } else editor.selection.setCursorLocation(element, 1);
            editor.execCommand(event.command, event.ui, event.value);
          } finally { start.remove(); end.remove(); }
        });
      } finally { applyingFormat = false; if (whole) restore(element); changed(); }
    }
  });
  editor.on('init', () => editor.formatter.register('textletterspacing', { inline: 'span', styles: { letterSpacing: '%value' }, exact: true }));
  editor.addCommand('TextLetterSpacing', (_ui, value: string) => {
    if (editor.mode.isReadOnly() || selectionHasLockedText(editor)) return;
    const number = Number(value); if (!Number.isFinite(number) || number < -10 || number > 100) return;
    editor.undoManager.transact(() => {
      editor.formatter.apply('textletterspacing', { value: `${number}px` });
    });
    changed();
  });
  function spacingValue() {
    const element = box(); const range = editor.selection.getRng();
    const root = objectMode() && element ? textSource(element) : range.commonAncestorContainer;
    const walker = editor.getDoc().createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const values = new Set<string>();
    for (let node: Node | null = root.nodeType === Node.TEXT_NODE ? root : walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent || (!objectMode() && !range.intersectsNode(node))) continue;
      if (node === range.startContainer && range.startOffset === node.textContent.length && !range.collapsed) continue;
      if (node === range.endContainer && range.endOffset === 0 && !range.collapsed) continue;
      values.add(String(parseFloat(editor.getWin().getComputedStyle(node.parentElement!).letterSpacing) || 0));
    }
    if (!values.size) values.add(String(parseFloat(editor.getWin().getComputedStyle(editor.selection.getNode()).letterSpacing) || 0));
    return values.size === 1 ? [...values][0] : '';
  }
  function openNumber(kind: 'spacing' | 'height') {
    if (editor.mode.isReadOnly()) return;
    const bookmark = editor.selection.getBookmark(); const element = box();
    const current = kind === 'spacing' ? spacingValue() : (() => {
      const computed = editor.getWin().getComputedStyle(element ?? editor.selection.getNode());
      const ratio = parseFloat(computed.lineHeight) / parseFloat(computed.fontSize);
      return Number.isFinite(ratio) ? String(Math.round(ratio * 100) / 100) : '1.2';
    })();
    editor.windowManager.open({
      title: kind === 'spacing' ? '字间距' : '自定义行距',
      body: { type: 'panel', items: [{ type: 'input', name: 'value', label: kind === 'spacing' ? '字间距（px，-10 至 100）' : '行距倍数（0.5 至 5）', inputMode: 'decimal', placeholder: current === '' ? '混合，请输入新值' : '' }] },
      initialData: { value: current },
      buttons: [{ type: 'cancel', text: '取消' }, { type: 'submit', text: '应用', primary: true }],
      onSubmit: api => {
        const text = api.getData().value.trim(); const value = Number(text);
        if (!text || !Number.isFinite(value) || value < (kind === 'spacing' ? -10 : 0.5) || value > (kind === 'spacing' ? 100 : 5)) {
          editor.windowManager.alert('请输入范围内的有效数值'); return;
        }
        api.close(); if (editor.mode.isReadOnly() || selectionHasLockedText(editor) || (element && !element.isConnected)) return;
        editor.focus(); editor.selection.moveToBookmark(bookmark);
        editor.execCommand(kind === 'spacing' ? 'TextLetterSpacing' : 'LineHeight', false, String(value));
      }
    });
  }
  const events = 'NodeChange SelectionChange SwitchMode TextBoxSelected FormatApply FormatRemove';
  for (const [name, command, tooltip] of [
    ['textalignleft', 'JustifyLeft', '文字左对齐'], ['textaligncenter', 'JustifyCenter', '文字居中'],
    ['textalignright', 'JustifyRight', '文字右对齐'], ['textalignjustify', 'JustifyFull', '文字两端对齐']
  ]) {
    editor.ui.registry.addToggleButton(name, {
      icon: name.replace('textalign', 'align-'), tooltip, onAction: () => editor.execCommand(command),
      onSetup: api => {
        const update = () => {
          const element = box();
          const expected: Record<string, string> = { JustifyLeft: 'left', JustifyCenter: 'center', JustifyRight: 'right', JustifyFull: 'justify' };
          const actual = element ? editor.getWin().getComputedStyle(element).textAlign : '';
          api.setEnabled(!editor.mode.isReadOnly() && !selectionHasLockedText(editor));
          api.setActive(element ? actual === expected[command] || (command === 'JustifyLeft' && actual === 'start') : editor.queryCommandState(command));
        };
        update(); editor.on(events, update); return () => editor.off(events, update);
      }
    });
  }
  editor.ui.registry.addButton('textspacing', {
    text: '字距', tooltip: '字间距', onAction: () => openNumber('spacing'),
    onSetup: api => { const update = () => api.setEnabled(!editor.mode.isReadOnly()); update(); editor.on(events, update); return () => editor.off(events, update); }
  });
  editor.ui.registry.addMenuButton('textlineheight', {
    text: '行距', tooltip: '文字行距',
    fetch: callback => callback([
      ...['1', '1.2', '1.5', '1.75', '2', '2.5', '3'].map(value => ({ type: 'togglemenuitem' as const, text: `${value} 倍`, active: (() => {
        const computed = editor.getWin().getComputedStyle(box() ?? editor.selection.getNode());
        return Math.abs(parseFloat(computed.lineHeight) / parseFloat(computed.fontSize) - Number(value)) < 0.01;
      })(), onAction: () => editor.execCommand('LineHeight', false, value) })),
      { type: 'menuitem', text: '自定义…', onAction: () => openNumber('height') }
    ]),
    onSetup: api => { const update = () => api.setEnabled(!editor.mode.isReadOnly()); update(); editor.on(events, update); return () => editor.off(events, update); }
  });
  editor.ui.registry.addGroupToolbarButton('textgrouplayout', { text: '排版', tooltip: '对齐、行距与字间距', items: 'textalignleft textaligncenter textalignright textalignjustify | textlineheight textspacing' });
}
