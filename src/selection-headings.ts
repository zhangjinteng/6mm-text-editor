import type { Editor } from 'tinymce';

/** 局部文字选区使用行内标题样式，避免 H1–H6 将整个拖动文字块一起改掉。 */
export function registerSelectionHeadings(editor: Editor): void {
  const format = 'selectionheading';
  function partialSelection() {
    const range = editor.selection.getRng();
    if (range.collapsed || !editor.selection.getContent({ format: 'text' }).trim()) return false;
    return editor.selection.getSelectedBlocks().some(block => {
      const before = editor.getDoc().createRange(); before.selectNodeContents(block);
      const after = before.cloneRange();
      if (block.contains(range.startContainer)) before.setEnd(range.startContainer, range.startOffset);
      else before.collapse(true);
      if (block.contains(range.endContainer)) after.setStart(range.endContainer, range.endOffset);
      else after.collapse(false);
      return !!(before.toString().trim() || after.toString().trim());
    });
  }
  function isActive(name: string) {
    const range = editor.selection.getRng();
    if (range.collapsed) {
      const inline = editor.selection.getNode().closest('[data-selection-heading]');
      return inline ? inline.getAttribute('data-selection-heading') === name : editor.formatter.match(name);
    }
    // 格式化后选区边界可能停在 strong 上，需读取选区实际覆盖的文字，而非仅看 getNode()。
    const root = range.commonAncestorContainer;
    const walker = editor.getDoc().createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const headings: string[] = [];
    for (let node: Node | null = root.nodeType === Node.TEXT_NODE ? root : walker.nextNode(); node; node = walker.nextNode()) {
      if (!range.intersectsNode(node)) continue;
      const start = range.startContainer === node ? range.startOffset : 0;
      const end = range.endContainer === node ? range.endOffset : node.textContent!.length;
      if (!node.textContent!.slice(start, end).trim()) continue;
      const element = node.parentElement!;
      headings.push(element.closest('[data-selection-heading]')?.getAttribute('data-selection-heading')
        ?? element.closest('h1,h2,h3,h4,h5,h6')?.tagName.toLowerCase() ?? 'p');
    }
    return headings.length > 0 && headings.every(heading => heading === name);
  }
  editor.on('init', () => editor.formatter.register(format, {
    inline: 'span', attributes: { 'data-selection-heading': '%heading' },
    styles: { fontSize: '%size', fontWeight: '%weight' }, remove_similar: true
  }));
  editor.on('BeforeExecCommand', event => {
    const command = event.command.toLowerCase();
    if (!['mcetoggleformat', 'formatblock'].includes(command) || !/^h[1-6]$/.test(String(event.value)) || editor.mode.isReadOnly() || !partialSelection()) return;
    event.preventDefault();
    const heading = isActive(String(event.value)) ? 'p' : String(event.value);
    const probe = editor.getDoc().createElement(heading);
    probe.setAttribute('data-mce-bogus', 'all');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
    editor.getBody().append(probe);
    const computed = editor.getWin().getComputedStyle(probe);
    const size = computed.fontSize; const weight = computed.fontWeight;
    probe.remove();
    editor.undoManager.transact(() => {
      editor.formatter.remove(format);
      editor.formatter.apply(format, { heading, size, weight });
    });
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('change');
  });
  // 覆盖原生浮动按钮的状态读取，使行内 H3 不会与外层 H2 同时高亮。
  editor.on('PreInit', () => {
    for (const name of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) editor.ui.registry.addToggleButton(name, {
      text: name.toUpperCase(), tooltip: `${['一', '二', '三', '四', '五', '六'][Number(name[1]) - 1]}级标题`,
      onAction: () => editor.execCommand('mceToggleFormat', false, name),
      onSetup: api => {
        const update = () => api.setActive(isActive(name));
        const events = 'NodeChange SelectionChange FormatApply FormatRemove';
        editor.on(events, update); update();
        return () => editor.off(events, update);
      }
    });
  });
}
