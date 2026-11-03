import type { Editor } from 'tinymce';
import { installColorPickers } from './text-color-picker';
import { parseShadowColor } from './text-shadow';
import { isCanvasSelection } from './blank-selection';
import { decorateCanvasSettings } from './canvas-settings-dialog';

const selector = 'div.document-background-color';
export function readCanvasBackground(editor: Editor) {
  const layer = editor.getBody().querySelector<HTMLElement>(selector);
  const channels = layer ? editor.getWin().getComputedStyle(layer).backgroundColor.match(/[\d.]+/g)?.map(Number) : undefined;
  return { rgb: channels?.slice(0, 3) ?? [255, 255, 255], alpha: channels?.[3] ?? 1, hasColor: !!layer };
}
export function applyCanvasBackground(editor: Editor, color: string, preserveAlpha = true, focus = true): void {
  if (editor.mode.isReadOnly()) return;
  const test = editor.getDoc().createElement('span'); test.style.backgroundColor = color;
  if (color !== 'remove' && !test.style.backgroundColor) return;
  // 换色时保留透明度；透明度只作用于背景层。
  const alpha = readCanvasBackground(editor).alpha;
  if (color !== 'remove' && preserveAlpha && alpha < 1) {
    editor.getBody().append(test);
    const channels = editor.getWin().getComputedStyle(test).backgroundColor.match(/[\d.]+/g)?.slice(0, 3);
    test.remove();
    if (channels) color = `rgba(${channels.join(',')},${alpha})`;
  }
  editor.undoManager.transact(() => {
    let layer = editor.getBody().querySelector<HTMLElement>(selector);
    if (color === 'remove') { if (layer) editor.dom.remove(layer); }
    else {
      if (!layer) {
        layer = editor.dom.create('div', { class: 'document-background-color', contenteditable: 'false' });
        editor.getBody().prepend(layer);
      }
      editor.dom.setStyle(layer, 'background-color', color);
    }
  });
  if (focus) { editor.focus(); editor.nodeChanged(); }
  editor.dispatch('change');
}
export function registerCanvasBackground(editor: Editor): void {
  const background = () => readCanvasBackground(editor);
  const apply = (color: string, preserveAlpha = true) => applyCanvasBackground(editor, color, preserveAlpha);
  // 复用原生 backcolor：色板、自定义选色器、颜色历史和按钮状态均由 TinyMCE 维护。
  // 在空白画布或空段落模式下将原生命令改为设置整张画布的底色。
  editor.on('BeforeExecCommand', event => {
    const command = event.command.toLowerCase();
    if (!isCanvasSelection(editor) || (event.ui as unknown) !== 'hilitecolor' ||
      !['mceapplytextcolor', 'mceremovetextcolor'].includes(command)) return;
    event.preventDefault();
    apply(command === 'mceremovetextcolor' ? 'remove' : String(event.value));
  });
  editor.ui.registry.addIcon('canvassettings', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 16h10"/><circle cx="10" cy="8" r="2" fill="white"/><circle cx="14" cy="16" r="2" fill="white"/></svg>');
  editor.ui.registry.addButton('canvassettings', {
    icon: 'canvassettings', tooltip: '画布设置',
    onAction: () => {
      if (editor.mode.isReadOnly()) return;
      const { rgb, alpha } = background();
      const initialColor = '#' + rgb.map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
      let colorPickers: ReturnType<typeof installColorPickers> | undefined;
      let presentation: ReturnType<typeof decorateCanvasSettings> | undefined;
      const api = editor.windowManager.open({
        title: '画布设置',
        body: { type: 'panel', items: [
          { type: 'htmlpanel', html: '<h3 data-canvas-color-fields>画布背景</h3>' },
          { type: 'input', name: 'color', label: '背景颜色' },
          { type: 'input', name: 'transparency', label: '背景透明度（0–100%）', inputMode: 'numeric' },
          { type: 'button', name: 'clear', text: '清除背景颜色' },
          { type: 'htmlpanel', html: '<p data-canvas-background-hint>只调整背景颜色的透明度，文字和图片保持原有效果。</p>' },
          { type: 'htmlpanel', html: '<p data-canvas-insert-hint>选择内容加入画布，确认插入后即生效。</p>' },
          { type: 'bar', items: [
            { type: 'button', name: 'text', text: '插入文字' },
            { type: 'button', name: 'image', text: '插入图片' },
            { type: 'button', name: 'emoji', text: '表情符号' }
          ] }
        ] },
        initialData: { color: initialColor, transparency: String(Math.round((1 - alpha) * 100)) },
        buttons: [{ type: 'cancel', text: '取消' }, { type: 'submit', text: '应用设置', primary: true }],
        onAction: (api, details) => {
          if (details.name === 'clear') { api.setData({ color: '', transparency: '0' }); colorPickers?.refresh(); presentation?.update(); return; }
          const command = { text: 'CanvasInsertText', image: 'mceImage', emoji: 'mceEmoticons' }[details.name];
          if (command && !editor.mode.isReadOnly()) editor.execCommand(command);
        },
        onClose: () => { colorPickers?.dispose(); presentation?.dispose(); },
        onChange: (api, details) => {
          if (details.name === 'color') {
            const parsed = parseShadowColor(api.getData().color, editor.getContainer().ownerDocument);
            if (parsed) api.setData({ color: parsed.color, ...(parsed.opacity === undefined ? {} : { transparency: String(100 - parsed.opacity) }) });
          }
          colorPickers?.refresh();
          presentation?.update();
        },
        onSubmit: api => {
          const { color, transparency: raw } = api.getData();
          const transparency = Number(raw.trim());
          if (!raw.trim() || !Number.isFinite(transparency) || transparency < 0 || transparency > 100) {
            editor.windowManager.alert('请输入 0 到 100 之间的透明度。'); return;
          }
          if (!color.trim()) { api.close(); apply('remove'); return; }
          if (!/^#[\da-f]{6}$/i.test(color.trim())) {
            editor.windowManager.alert('请输入有效的六位十六进制背景颜色，例如 #FFFFFF。'); return;
          }
          const channels = [1, 3, 5].map(index => parseInt(color.trim().slice(index, index + 2), 16));
          api.close();
          // 未调整背景时不创建白色图层，也不新增撤销步骤。
          if (color.toLowerCase() !== initialColor || transparency !== Math.round((1 - alpha) * 100)) {
            apply(`rgba(${channels.join(',')},${Number((1 - transparency / 100).toFixed(4))})`, false);
          }
        }
      });
      const doc = editor.getContainer().ownerDocument;
      const root = doc.querySelector<HTMLElement>('[data-canvas-color-fields]')!.closest<HTMLElement>('.tox-dialog')!;
      presentation = decorateCanvasSettings(editor, root, api);
      const [colorField, transparencyField] = root.querySelectorAll<HTMLInputElement>('.tox-dialog__body input');
      if (colorField && transparencyField) {
        const group = colorField.parentElement!;
        group.setAttribute('data-color-control', ''); group.classList.add('canvas-dialog-color');
        const native = doc.createElement('input'); native.type = 'color'; native.value = initialColor;
        native.setAttribute('aria-label', '背景颜色色板'); native.dataset.colorOpacity = '[data-canvas-transparency]'; native.dataset.colorOpacityMode = 'transparency';
        colorField.setAttribute('aria-label', '背景颜色'); transparencyField.setAttribute('data-canvas-transparency', '');
        colorField.before(native);
        // Keep the shared popover outside TinyMCE's descendant style reset.
        colorPickers = installColorPickers(root, editor.getDoc(), doc.body);
      }
    }
  });
  editor.ui.registry.addContextToolbar('canvasbackground', {
    predicate: () => isCanvasSelection(editor) && !editor.mode.isReadOnly(),
    items: 'canvassettings toolbarposition code preview fullscreen', position: 'node', scope: 'editor'
  });
}
