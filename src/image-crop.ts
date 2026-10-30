import type { Editor } from 'tinymce';
import './image-crop.css';
import { imageGeometry } from './image-geometry';

type Crop = { x: number; y: number; width: number; height: number };
const full = (): Crop => ({ x: 0, y: 0, width: 1, height: 1 });
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
function readCrop(image: HTMLImageElement): Crop {
  try {
    const crop = JSON.parse(image.getAttribute('data-image-crop') || 'null');
    if (crop && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(crop[key])) &&
      crop.x >= 0 && crop.y >= 0 && crop.width > 0 && crop.height > 0 && crop.x + crop.width <= 1.00001 && crop.y + crop.height <= 1.00001) return crop;
  } catch { /* Older images start with the entire image selected. */ }
  return full();
}

export function registerImageCrop(editor: Editor): void {
  let closeDialog: (() => void) | undefined;
  let disposing = false;
  editor.on('remove', () => { disposing = true; closeDialog?.(); });
  editor.ui.registry.addIcon('image-crop', '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>');
  editor.ui.registry.addButton('imagecrop', {
    icon: 'image-crop', tooltip: '裁剪图片',
    onAction: () => {
      if (editor.mode.isReadOnly() || closeDialog) return;
      const node = editor.selection.getNode();
      const image = node.closest('img') || node.querySelector('img');
      if (!image || !editor.getBody().contains(image)) return;
      if (image.getAttribute('data-image-locked') === 'true') {
        editor.notificationManager.open({ text: '请先在图片设置中解锁，再裁剪图片。', type: 'info' }); return;
      }
      if (!CSS.supports('object-view-box', 'inset(0%)')) {
        editor.notificationManager.open({ text: '当前浏览器不支持图片裁剪，请使用新版 Chrome 或 Edge。', type: 'warning' });
        return;
      }
      const bounds = imageGeometry(image);
      if (!bounds.width || !bounds.height || !image.complete || !image.naturalWidth) {
        editor.notificationManager.open({ text: '图片尚未加载完成，请稍后重试。', type: 'warning' }); return;
      }
      const previous = readCrop(image);
      const baseWidth = bounds.width / previous.width;
      const baseHeight = bounds.height / previous.height;
      const bookmark = editor.selection.getBookmark(2, true);
      let crop = { ...previous };
      const doc = editor.getContainer().ownerDocument;
      const dialog = doc.createElement('dialog');
      dialog.className = 'image-crop-dialog'; dialog.setAttribute('aria-label', '裁剪图片');
      dialog.innerHTML = `<div class="crop-heading"><div><h2>裁剪图片</h2><p>拖动选区或四角调整范围，原图保留</p></div><button type="button" data-cancel aria-label="关闭裁剪">×</button></div>
      <div class="crop-presets" role="group" aria-label="裁剪比例"><button type="button" data-ratio="reset">重置</button><button type="button" data-ratio="1">1:1</button><button type="button" data-ratio="${4 / 3}">4:3</button><button type="button" data-ratio="${16 / 9}">16:9</button><span>自由裁剪</span></div>
      <div class="crop-workspace"><div class="crop-stage"><img class="crop-preview" alt="裁剪预览" draggable="false"><div class="crop-selection" tabindex="0" aria-label="裁剪选区"><i></i><i></i><i></i><i></i>${['nw', 'ne', 'sw', 'se'].map(c => `<button type="button" data-corner="${c}" aria-label="调整${c}裁剪角"></button>`).join('')}</div></div></div>
      <div class="crop-fields">${[['x', '左侧'], ['y', '顶部'], ['width', '宽度'], ['height', '高度']].map(([key, label]) => `<label>${label} %<input data-field="${key}" aria-label="裁剪${label}百分比" type="number" min="${key === 'x' || key === 'y' ? 0 : 1}" max="100" step="1"></label>`).join('')}</div>
      <div class="crop-footer"><span data-size></span><div><button type="button" data-cancel>取消</button><button type="button" data-apply>应用裁剪</button></div></div>`;
      const stage = dialog.querySelector<HTMLElement>('.crop-stage')!;
      const preview = dialog.querySelector<HTMLImageElement>('.crop-preview')!;
      preview.src = image.currentSrc || image.src;
      preview.referrerPolicy = image.referrerPolicy as ReferrerPolicy;
      const selection = dialog.querySelector<HTMLElement>('.crop-selection')!;
      const fields = dialog.querySelectorAll<HTMLInputElement>('[data-field]');
      const resize = () => {
        const ratio = baseWidth / baseHeight;
        const width = Math.max(1, Math.min(600, window.innerWidth - 72, Math.max(100, window.innerHeight - 300) * ratio));
        stage.style.width = `${width}px`; stage.style.height = `${width / ratio}px`;
      };
      const update = () => {
        Object.assign(selection.style, { left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.width * 100}%`, height: `${crop.height * 100}%` });
        for (const input of fields) input.value = String(Math.round(crop[input.dataset.field as keyof Crop] * 10000) / 100);
        dialog.querySelector('[data-size]')!.textContent = `${Math.round(baseWidth * crop.width)} × ${Math.round(baseHeight * crop.height)} px`;
      };
      let gesture: { id: number; startX: number; startY: number; crop: Crop; corner?: string } | undefined;
      const release = () => {
        if (gesture && selection.hasPointerCapture(gesture.id)) selection.releasePointerCapture(gesture.id);
        gesture = undefined;
      };
      const close = () => {
        release(); window.removeEventListener('resize', resize); dialog.remove(); closeDialog = undefined;
        if (!disposing && !editor.removed && image.isConnected) {
          editor.focus(); editor.selection.moveToBookmark(bookmark); editor.nodeChanged();
        }
      };
      closeDialog = close;
      dialog.querySelectorAll('[data-cancel]').forEach(button => button.addEventListener('click', close));
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      selection.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        gesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY, crop: { ...crop }, corner: (event.target as Element).closest<HTMLElement>('[data-corner]')?.dataset.corner };
        selection.setPointerCapture(event.pointerId); event.preventDefault();
      });
      selection.addEventListener('pointermove', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const rect = stage.getBoundingClientRect();
        const dx = (event.clientX - gesture.startX) / rect.width, dy = (event.clientY - gesture.startY) / rect.height;
        const start = gesture.crop;
        if (!gesture.corner) crop = { ...start, x: clamp(start.x + dx, 0, 1 - start.width), y: clamp(start.y + dy, 0, 1 - start.height) };
        else {
          const west = gesture.corner.includes('w'), north = gesture.corner.includes('n');
          const left = west ? clamp(start.x + dx, 0, start.x + start.width - 0.01) : start.x;
          const top = north ? clamp(start.y + dy, 0, start.y + start.height - 0.01) : start.y;
          const right = west ? start.x + start.width : clamp(start.x + start.width + dx, start.x + 0.01, 1);
          const bottom = north ? start.y + start.height : clamp(start.y + start.height + dy, start.y + 0.01, 1);
          crop = { x: left, y: top, width: right - left, height: bottom - top };
        }
        update();
      });
      selection.addEventListener('pointerup', release); selection.addEventListener('pointercancel', release);
      selection.addEventListener('keydown', event => {
        const moves: Record<string, [number, number]> = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] };
        const move = moves[event.key]; if (!move) return;
        crop.x = clamp(crop.x + move[0], 0, 1 - crop.width); crop.y = clamp(crop.y + move[1], 0, 1 - crop.height);
        event.preventDefault(); update();
      });
      for (const input of fields) input.addEventListener('change', () => {
        const key = input.dataset.field as keyof Crop;
        const value = input.valueAsNumber / 100;
        if (!Number.isFinite(value)) { update(); return; }
        if (key === 'x') crop.x = clamp(value, 0, 1 - crop.width);
        if (key === 'y') crop.y = clamp(value, 0, 1 - crop.height);
        if (key === 'width') crop.width = clamp(value, 0.01, 1 - crop.x);
        if (key === 'height') crop.height = clamp(value, 0.01, 1 - crop.y);
        update();
      });
      dialog.querySelectorAll<HTMLButtonElement>('[data-ratio]').forEach(button => button.addEventListener('click', () => {
        const value = button.dataset.ratio;
        crop = full();
        if (value !== 'reset') {
          const fraction = Number(value) / (baseWidth / baseHeight);
          if (fraction <= 1) { crop.width = fraction; crop.x = (1 - fraction) / 2; }
          else { crop.height = 1 / fraction; crop.y = (1 - crop.height) / 2; }
        }
        update();
      }));
      dialog.querySelector('[data-apply]')!.addEventListener('click', () => {
        if (!image.isConnected || editor.mode.isReadOnly()) { close(); return; }
        editor.undoManager.transact(() => {
          const width = baseWidth * crop.width, height = baseHeight * crop.height;
          editor.dom.setAttrib(image, 'data-image-crop', JSON.stringify(crop));
          editor.dom.setStyles(image, {
            width: `${width}px`, height: `${height}px`, aspectRatio: `${width} / ${height}`, objectFit: 'fill',
            objectViewBox: `inset(${crop.y * 100}% ${Math.max(0, 1 - crop.x - crop.width) * 100}% ${Math.max(0, 1 - crop.y - crop.height) * 100}% ${crop.x * 100}%)`
          });
        });
        close(); editor.dispatch('ResizeContent'); editor.dispatch('ScrollContent'); editor.dispatch('change');
      });
      doc.body.append(dialog); resize(); update(); dialog.showModal();
      window.addEventListener('resize', resize);
    }
  });
}
