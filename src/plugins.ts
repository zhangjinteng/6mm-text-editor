export interface Settings { autoresize: boolean }
export const defaultSettings: Settings = { autoresize: false };

export const corePlugins = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave', 'charmap', 'code',
  'codesample', 'directionality', 'emoticons', 'fullscreen', 'help', 'image',
  'importcss', 'insertdatetime', 'link', 'lists', 'media', 'nonbreaking',
  'pagebreak', 'preview', 'quickbars', 'save', 'searchreplace', 'table',
  'visualblocks', 'visualchars', 'wordcount'
];

/** Resolve only plugins built from 6mm-tinymce, without a cloud-plugin fallback. */
export function resolvePlugins(settings: Settings): string[] {
  return [...corePlugins, ...(settings.autoresize ? ['autoresize'] : [])];
}

export const pluginNames: Record<string, string> = {
  accordion: '折叠区块', advlist: '列表样式', anchor: '锚点', autolink: '自动链接',
  autoresize: '自适应高度', autosave: '草稿恢复', charmap: '特殊字符', code: 'HTML 源码',
  codesample: '代码块', directionality: '文字方向', emoticons: '表情', fullscreen: '全屏',
  help: '帮助', image: '图片', importcss: '导入样式', insertdatetime: '日期时间',
  link: '链接', lists: '列表', media: '音视频', nonbreaking: '不换行空格',
  pagebreak: '分页', preview: '预览', quickbars: '快捷工具栏', save: '保存',
  searchreplace: '查找替换', table: '表格', visualblocks: '区块边界', visualchars: '隐藏字符', wordcount: '字数'
};
