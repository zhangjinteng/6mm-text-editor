import type { Editor } from 'tinymce';
import { isCanvasSelection } from './blank-selection';

const selector = 'div.document-background-color';
export function registerCanvasBackground(editor: Editor): void {
  const background = () => {
    const layer = editor.getBody().querySelector<HTMLElement>(selector);
    const channels = layer ? editor.getWin().getComputedStyle(layer).backgroundColor.match(/[\d.]+/g)?.map(Number) : undefined;
    return { rgb: channels?.slice(0, 3) ?? [255, 255, 255], alpha: channels?.[3] ?? 1 };
  };
  const apply = (color: string, preserveAlpha = true) => {
    if (editor.mode.isReadOnly()) return;
    const test = editor.getDoc().createElement('span'); test.style.backgroundColor = color;
    if (color !== 'remove' && !test.style.backgroundColor) return;
    // 换色时保留已设置的透明度；透明度保存在颜色里，不作用于前景内容。
    const alpha = background().alpha;
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
    editor.focus(); editor.nodeChanged(); editor.dispatch('change');
  };
  // 复用原生 backcolor：色板、自定义选色器、颜色历史和按钮状态均由 TinyMCE 维护。
  // 在空白画布或空段落模式下将原生命令改为设置整张画布的底色。
  editor.on('BeforeExecCommand', event => {
    const command = event.command.toLowerCase();
    if (!isCanvasSelection(editor) || (event.ui as unknown) !== 'hilitecolor' ||
      !['mceapplytextcolor', 'mceremovetextcolor'].includes(command)) return;
    event.preventDefault();
    apply(command === 'mceremovetextcolor' ? 'remove' : String(event.value));
  });
  editor.ui.registry.addIcon('canvasopacity', '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></svg>');
  editor.ui.registry.addButton('canvasopacity', {
    icon: 'canvasopacity', tooltip: '背景透明度',
    onAction: () => {
      const { rgb, alpha } = background();
      editor.windowManager.open({
        title: '背景透明度',
        body: { type: 'panel', items: [
          { type: 'input', name: 'transparency', label: '透明度（0–100%）', inputMode: 'numeric' },
          { type: 'htmlpanel', html: '<p>0% 为不透明，100% 为完全透明；只影响画布背景颜色。</p>' }
        ] },
        initialData: { transparency: String(Math.round((1 - alpha) * 100)) },
        buttons: [{ type: 'cancel', text: '取消' }, { type: 'submit', text: '保存', primary: true }],
        onSubmit: api => {
          const value = api.getData().transparency.trim();
          const transparency = Number(value);
          if (!value || !Number.isFinite(transparency) || transparency < 0 || transparency > 100) {
            editor.windowManager.alert('请输入 0 到 100 之间的透明度。'); return;
          }
          apply(`rgba(${rgb.join(',')},${Number((1 - transparency / 100).toFixed(4))})`, false);
          api.close();
        }
      });
    }
  });
  editor.ui.registry.addContextToolbar('canvasbackground', {
    predicate: () => isCanvasSelection(editor) && !editor.mode.isReadOnly(),
    items: 'backcolor canvasopacity toolbarposition canvastext canvasimage emoticons code preview fullscreen', position: 'node', scope: 'editor'
  });
}
