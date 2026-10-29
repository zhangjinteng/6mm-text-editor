import type { Editor } from 'tinymce';

/** 所有上下文工具栏共用停靠状态，菜单和对话框继续使用各自的定位。 */
export function registerToolbarPosition(editor: Editor): void {
  let mode: 'bottom' | 'right' = 'bottom';
  const positionChanged = 'ToolbarPositionChange';
  editor.ui.registry.addIcon('toolbar-dock', '<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm1 2v14h14V5H5Zm10 2h2v10H7v-2h8V7Z"/></svg>');
  editor.ui.registry.addToggleButton('toolbarposition', {
    icon: 'toolbar-dock', tooltip: '切换位置：居右 / 居下',
    onAction: () => {
      mode = mode === 'bottom' ? 'right' : 'bottom';
      editor.dispatch(positionChanged);
    },
    onSetup: (api) => {
      const update = () => api.setActive(mode === 'right');
      update(); editor.on(positionChanged, update);
      return () => editor.off(positionChanged, update);
    }
  });
  // 单独注册共用按钮组，避免文字选区与拖动文字工具栏合并时重复出现切换按钮。
  editor.on('PreInit', () => {
    const toolbars = Object.values(editor.ui.registry.getAll().contextToolbars)
      .filter(spec => spec.type === 'contexttoolbar');
    const matchesNode = (node: Element) => toolbars.some(spec => spec.position !== 'line' && spec.predicate?.(node));
    editor.ui.registry.addContextToolbar('toolbarpositionnode', {
      predicate: matchesNode, items: 'toolbarposition layersettings', position: 'node', scope: 'node'
    });
    editor.ui.registry.addContextToolbar('toolbarpositionline', {
      predicate: node => !matchesNode(node) && toolbars.some(spec => spec.position === 'line' && spec.predicate?.(node)),
      items: 'toolbarposition layersettings', position: 'line', scope: 'node'
    });
  });
  editor.on('init', () => {
    const doc = editor.getContainer().ownerDocument;
    const view = doc.defaultView!;
    const positioned = new Set<HTMLElement>();
    const groupPanels = new Set<HTMLElement>();
    let frame = 0;
    const properties = ['--editor-toolbar-x', '--editor-toolbar-y', '--editor-toolbar-transform', '--editor-toolbar-width'];
    const update = () => {
      frame = 0;
      if (editor.removed) return;
      const bounds = editor.getContentAreaContainer().getBoundingClientRect();
      for (const popup of doc.querySelectorAll<HTMLElement>('.tox-pop')) {
        if (!popup.querySelector('.tox-toolbar, .tox-toolbar-textfield')) continue;
        popup.setAttribute('data-editor-docked-toolbar', 'true');
        popup.setAttribute('data-editor-toolbar-position', mode);
        popup.style.setProperty('--editor-toolbar-x', `${mode === 'bottom' ? bounds.left + bounds.width / 2 : bounds.right - 50}px`);
        popup.style.setProperty('--editor-toolbar-y', `${mode === 'bottom' ? bounds.bottom - 50 : bounds.top + bounds.height / 2}px`);
        popup.style.setProperty('--editor-toolbar-transform', mode === 'bottom' ? 'translate(-50%, -100%)' : 'translate(-100%, -50%)');
        popup.style.setProperty('--editor-toolbar-width', `${Math.max(0, Math.min(bounds.width - (mode === 'right' ? 66 : 16), view.innerWidth - 16))}px`);
        positioned.add(popup);
      }
      // 分类面板跟随实际停靠后的按钮，避免沿用编辑器主工具栏的原始锚点。
      for (const panel of doc.querySelectorAll<HTMLElement>('.tox-toolbar__overflow[data-toolbar-group^="textgroup"]')) {
        const name = panel.getAttribute('data-toolbar-group');
        const anchor = doc.querySelector<HTMLElement>(`.tox-pop[data-editor-docked-toolbar] [data-mce-name="${name}"]`);
        if (!anchor || !panel.getClientRects().length) continue;
        const button = anchor.getBoundingClientRect(); const box = panel.getBoundingClientRect();
        if (!button.width || !button.height) continue;
        const left = mode === 'right' ? button.left - box.width - 8 : button.left + button.width / 2 - box.width / 2;
        const above = button.top - box.height - 8;
        const top = mode === 'right' ? button.top + button.height / 2 - box.height / 2 : above >= 8 ? above : button.bottom + 8;
        panel.style.setProperty('--text-group-x', `${Math.max(8, Math.min(left, view.innerWidth - box.width - 8))}px`);
        panel.style.setProperty('--text-group-y', `${Math.max(8, Math.min(top, view.innerHeight - box.height - 8))}px`);
        if (!groupPanels.has(panel)) { groupPanels.add(panel); resize.observe(panel); }
      }
    };
    const schedule = () => { if (!frame) frame = view.requestAnimationFrame(update); };
    const changes = new MutationObserver(schedule);
    changes.observe(doc.body, { childList: true, subtree: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(editor.getContentAreaContainer());
    view.addEventListener('resize', schedule);
    view.addEventListener('scroll', schedule, true);
    editor.on('NodeChange ScrollContent ResizeContent ToolbarPositionChange FullscreenStateChanged', schedule);
    schedule();
    editor.on('remove', () => {
      changes.disconnect(); resize.disconnect(); view.cancelAnimationFrame(frame);
      view.removeEventListener('resize', schedule); view.removeEventListener('scroll', schedule, true);
      editor.off('NodeChange ScrollContent ResizeContent ToolbarPositionChange FullscreenStateChanged', schedule);
      for (const panel of groupPanels) { panel.style.removeProperty('--text-group-x'); panel.style.removeProperty('--text-group-y'); }
      for (const popup of positioned) {
        popup.removeAttribute('data-editor-docked-toolbar');
        popup.removeAttribute('data-editor-toolbar-position');
        for (const property of properties) popup.style.removeProperty(property);
      }
    });
  });
}
