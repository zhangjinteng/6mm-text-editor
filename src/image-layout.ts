import type { Editor } from 'tinymce';
import { imageGeometry } from './image-geometry';

export function registerImageFill(editor: Editor) {
  editor.addCommand('mceImageFill', () => {
    if (editor.mode.isReadOnly()) return;
    const node = editor.selection.getNode();
    const image = node.closest('img') ?? (node.matches('figure.image') ? node.querySelector('img') : null);
    if (!image || !editor.getBody().contains(image)) return;
    if (image.getAttribute('data-image-locked') === 'true') return;
    const before = image.getBoundingClientRect();
    const geometry = imageGeometry(image);
    const bounds = editor.getBody().getBoundingClientRect();
    if (before.width <= 0 || before.height <= 0 || bounds.width <= 0 || bounds.height <= 0) return;
    // cover：按当前显示比例等比放大，宽、高都覆盖 body，超出部分居中。
    const radians = geometry.angle * Math.PI / 180;
    const cos = Math.abs(Math.cos(radians)), sin = Math.abs(Math.sin(radians));
    // 将画布四角投影到图片本地坐标，旋转后也真正覆盖画布四角。
    const scale = Math.max((cos * bounds.width + sin * bounds.height) / geometry.width,
      (sin * bounds.width + cos * bounds.height) / geometry.height);
    const width = geometry.width * scale;
    const height = geometry.height * scale;
    const left = bounds.left + (bounds.width - before.width * scale) / 2;
    const top = bounds.top + (bounds.height - before.height * scale) / 2;
    // 已铺满时跳过亚像素舍入差异，避免重复点击累积误差和撤销步骤。
    if (Math.abs(geometry.width - width) < 0.1 && Math.abs(geometry.height - height) < 0.1 &&
        Math.abs(before.left - left) < 0.1 && Math.abs(before.top - top) < 0.1) return;
    editor.undoManager.transact(() => {
      for (const name of ['alignleft', 'aligncenter', 'alignright']) editor.formatter.remove(name, {}, image);
      editor.dom.setStyles(image, {
        position: 'absolute', left: '0px', top: '0px', right: 'auto', bottom: 'auto',
        width: `${width}px`, height: `${height}px`,
        maxWidth: 'none', maxHeight: 'none', minWidth: '0', minHeight: '0',
        aspectRatio: `${geometry.width} / ${geometry.height}`,
        boxSizing: 'border-box', display: 'block', float: 'none', margin: '0'
      });
      // 从真实定位包含块换算坐标，兼容已拖动、嵌套及相对定位的父容器。
      const origin = image.getBoundingClientRect();
      editor.dom.setStyles(image, { left: `${left - origin.left}px`, top: `${top - origin.top}px` });
    });
    editor.nodeChanged(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
  });
  editor.ui.registry.addButton('imagefill', {
    icon: 'resize', tooltip: '填充满',
    onAction: () => editor.execCommand('mceImageFill')
  });
}
