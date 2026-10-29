import type { Editor, RawEditorOptions } from 'tinymce';
import { contentStyles } from './document';
import { registerBlankSelection } from './blank-selection';
import { registerCanvasBackground } from './canvas-background';
import { registerToolbarPosition } from './toolbar-position';
import { registerLayerSettings } from './object-layers';
import { bilibiliGiftEmoticons } from './bilibili-gifts';
import { registerTextAnimations } from './animations';
import { registerTextDragging } from './text-dragging';
import { registerTextClearFormat } from './text-clear-format';
import { registerSelectionHeadings } from './selection-headings';
import { registerTextToolGroups } from './text-tool-groups';
import { registerImageFill } from './image-layout';
import { registerCanvasInsertion } from './canvas-insertion';
import { registerImageCrop } from './image-crop';
import { registerImageClipboard } from './image-clipboard';
import { registerImageBackground } from './image-background';
import { registerDanmakuToolbar } from './live/toolbar';
import { resolvePlugins, type Settings } from './plugins';

/** Configure the own-source GPL editor; all editor assets are served by this application. */
export function editorOptions(settings: Settings, callbacks: {
  save: () => void;
  ready: (editor: Editor) => void;
  failure: (message: string) => void;
}): RawEditorOptions {
  const toolbars = [
    'undo redo | save restoredraft | blocks fontfamily fontsizeinput | bold italic underline strikethrough | forecolor backcolor | removeformat',
    'alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent lineheight | link image media table | charmap | searchreplace',
    'code preview print | accordion accordionremove | anchor pagebreak nonbreaking insertdatetime codesample | ltr rtl | subscript superscript | visualblocks visualchars help'
  ];
  return {
    base_url: '/vendor/tinymce', suffix: '.min', license_key: 'gpl',
    plugins: resolvePlugins(settings),
    // 显式保留声明属性，保证源码应用、粘贴、保存后可重新绑定。
    extended_valid_elements: 'div[data-danmaku-id|data-danmaku-source|data-danmaku-skin|data-danmaku-types|data-danmaku-limit|data-danmaku-paused|data-danmaku-draggable|data-danmaku-x|data-danmaku-y|class|style|id|title|contenteditable]',
    language: 'zh-CN', language_url: '/vendor/tinymce/langs/zh-CN.js',
    menubar: 'file edit view insert format tools table help',
    menu: { format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat | removeimagebackground' } },
    toolbar: window.matchMedia('(max-width: 620px)').matches ? toolbars.join(' | ') : toolbars,
    toolbar_mode: 'sliding',
    height: Math.max(600, window.innerHeight - 210), min_height: 500,
    max_height: settings.autoresize ? 1600 : undefined,
    resize: true, promotion: false, branding: true,
    // 图片和弹幕由同一个选中框组件处理，其余对象沿用 TinyMCE 的缩放。
    object_resizing: 'table,div:not([data-danmaku-source]),video,iframe',
    content_style: `${contentStyles}\nhtml, body { overflow: hidden !important; }`, browser_spellcheck: false,
    codesample_global_prismjs: true,
    emoticons_database: 'emojis',
    emoticons_images_url: '',
    emoticons_append: bilibiliGiftEmoticons,
    emoticons_database_url: '/vendor/tinymce/plugins/emoticons/js/emojis.min.js',
    contextmenu: 'link image table',
    quickbars_selection_toolbar: 'fontfamily fontsizeinput | textgroupstyle forecolor backcolor textgroupparagraph | textanimation textdrag quicklink',
    quickbars_insert_toolbar: false,
    quickbars_image_toolbar: 'image | alignleft aligncenter alignright | imagefill imagecrop imagebackground',
    image_advtab: true, image_caption: true, image_title: true, image_uploadtab: true,
    automatic_uploads: true, file_picker_types: 'image media', images_file_types: 'jpeg,jpg,png,gif,webp,bmp',
    images_upload_handler: async (blobInfo) => {
      if (blobInfo.blob().size > 5 * 1024 * 1024) throw new Error('本地试用图片不能超过 5 MB');
      return `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`;
    },
    file_picker_callback: (callback, _value, meta) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = meta.filetype === 'image' ? 'image/png,image/jpeg,image/webp,image/gif,image/bmp' : 'video/*,audio/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { callbacks.failure('本地嵌入文件不能超过 5 MB，请使用远程媒体地址'); return; }
        const reader = new FileReader();
        reader.onload = () => callback(String(reader.result), { title: file.name, alt: file.name });
        reader.onerror = () => callbacks.failure('读取文件失败');
        reader.readAsDataURL(file);
      };
      input.click();
    },
    autosave_ask_before_unload: true, autosave_interval: '15s', autosave_retention: '1440m', autosave_prefix: 'test44-tinymce-',
    save_onsavecallback: callbacks.save,
    setup: (editor) => {
      registerToolbarPosition(editor);
      registerLayerSettings(editor);
      registerTextAnimations(editor);
      registerTextDragging(editor);
      registerTextClearFormat(editor);
      registerSelectionHeadings(editor);
      registerTextToolGroups(editor);
      registerImageFill(editor);
      registerCanvasInsertion(editor);
      registerImageCrop(editor);
      registerImageClipboard(editor);
      registerImageBackground(editor);
      registerDanmakuToolbar(editor);
      registerCanvasBackground(editor);
      registerBlankSelection(editor);
      editor.on('init', () => callbacks.ready(editor));
      editor.on('PluginLoadError SkinLoadError LanguageLoadError', (event) => callbacks.failure(event.message));
    }
  };
}
