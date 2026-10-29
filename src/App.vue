<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue';
import TinyEditor from '@tinymce/tinymce-vue';
import type { Editor } from 'tinymce';
import { FilePenLine, Save, Download, FolderOpen, Settings2, X, Check, LoaderCircle, History, Plus, RotateCcw, Puzzle, Code2, Eye, PenLine, ChevronDown, AlertCircle, Radio } from '@lucide/vue';
import { documentHtml, persistDraft, readDraft, sampleContent, SETTINGS_KEY, type Draft } from './document';
import { defaultSettings, pluginNames, resolvePlugins, type Settings } from './plugins';
import { editorOptions } from './editor';
import LivePanel from './components/LivePanel.vue';
import type { LiveMessage } from './bilibili';
import { liveSession } from './live/session';
import { bindDanmaku, bindDanmakuEditor, type Bindings } from './live/bindings';

const draft = reactive<Draft>(readDraft());
const editor = shallowRef<Editor>();
const editorKey = ref(0);
const mountEditor = ref(true);
const ready = ref(false);
const status = ref(draft.updatedAt ? '已保存到本地' : '尚未保存');
const error = ref('');
const toast = ref('');
const view = ref<'edit' | 'html' | 'preview'>('edit');
const source = ref('');
const panel = ref<'plugins' | 'history' | 'live' | null>('live');
const settingsOpen = ref(false);
const exportOpen = ref(false);
const fileInput = ref<HTMLInputElement>();
const previewFrame = ref<HTMLIFrameElement>();
let editorBindings: Bindings | undefined;
let previewBindings: Bindings | undefined;
const pluginSearch = ref('');
const registeredPlugins = ref<string[]>([]);
const settings = reactive<Settings>(loadSettings());
const pendingSettings = reactive<Settings>({ ...settings });
let timer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let loadTimer: ReturnType<typeof setTimeout> | undefined;

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return { ...defaultSettings };
    // Old cloud settings are ignored without resetting the user's saved document or revisions.
    return { autoresize: saved.autoresize === true };
  } catch { return { ...defaultSettings }; }
}

const options = shallowRef(makeOptions());
const configuredPlugins = computed(() => resolvePlugins(settings));
const allPluginIds = computed(() => [...new Set([...Object.keys(pluginNames), ...configuredPlugins.value])]);
const shownPlugins = computed(() => allPluginIds.value.filter((id) =>
  `${id} ${pluginNames[id]}`.toLowerCase().includes(pluginSearch.value.toLowerCase())));
const previewHtml = computed(() => documentHtml(draft.content, draft.title, true));
const savedTime = computed(() => draft.updatedAt ? new Date(draft.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '');

function makeOptions() {
  return editorOptions({ ...settings }, {
    save: () => save(true),
    ready: (instance) => {
      clearTimeout(loadTimer);
      editor.value = instance;
      ready.value = true;
      registeredPlugins.value = Object.keys(instance.plugins);
      editorBindings?.dispose();
      editorBindings = bindDanmakuEditor(instance);
    },
    failure: (message) => { error.value = message; }
  });
}

function notify(message: string) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ''; }, 3500);
}

/** Persist current editor HTML, including embedded comments, before showing a saved state. */
function save(withRevision = false) {
  clearTimeout(timer);
  if (view.value === 'html' && editor.value && ready.value) editor.value.setContent(source.value);
  if (editor.value && ready.value) draft.content = editor.value.getContent();
  try {
    Object.assign(draft, persistDraft({ ...draft, revisions: [...draft.revisions] }, withRevision));
    status.value = '已保存到本地';
    if (withRevision) notify('已保存，本地版本已更新');
    editor.value?.setDirty(false);
  } catch {
    status.value = '保存失败';
    error.value = '本地存储不可用或空间不足。请立即导出 HTML 备份，图片较多时可改用远程图片地址。';
  }
}

watch(() => [draft.content, draft.title], () => {
  status.value = '保存中';
  clearTimeout(timer);
  timer = setTimeout(() => save(), 600);
});

/** Source mode uses an explicit apply step so switching tabs cannot silently discard edits. */
async function changeView(target: typeof view.value) {
  if (view.value === 'html' && source.value !== draft.content) {
    editor.value?.setContent(source.value);
    draft.content = editor.value?.getContent() ?? source.value;
  }
  if (target === 'html') source.value = editor.value?.getContent() ?? draft.content;
  previewBindings?.dispose(); previewBindings = undefined;
  view.value = target;
  await nextTick();
  if (target === 'edit') editor.value?.dispatch('ResizeEditor');
}

async function replaceContent(content: string, title?: string) {
  if (title) draft.title = title;
  editor.value?.setContent(content);
  draft.content = editor.value?.getContent() ?? content;
  source.value = draft.content;
  view.value = 'edit';
  save(true);
}

/** Treat usernames and message bodies as text, and keep each insertion undoable. */
async function insertLiveMessages(messages: LiveMessage[]) {
  await changeView('edit');
  const instance = editor.value;
  if (!instance || !ready.value) return;
  const html = messages.map((message) => {
    const paragraph = document.createElement('p');
    if (message.name) {
      const name = document.createElement('strong');
      name.textContent = message.name + '：';
      paragraph.append(name);
    }
    paragraph.append(document.createTextNode(message.text));
    return paragraph.outerHTML;
  }).join('');
  instance.undoManager.transact(() => { instance.focus(); instance.insertContent(html); });
  draft.content = instance.getContent();
  save();
  notify(`已插入 ${messages.length} 条消息`);
}

async function newDocument() {
  if (!confirm('新建空白文档？当前文档会先保留一个本地版本。')) return;
  save(true);
  await replaceContent('<p></p>', '未命名文档');
}

async function resetSample() {
  if (!confirm('恢复示例文档？当前内容会先保留一个本地版本。')) return;
  save(true);
  await replaceContent(sampleContent, '创作手记');
}

async function importFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('导入文件不能超过 5 MB');
    save(true);
    const content = await file.text();
    if (file.name.endsWith('.txt')) {
      const paragraph = document.createElement('p');
      paragraph.textContent = content;
      await replaceContent(paragraph.outerHTML, file.name.replace(/\.[^.]+$/, ''));
    } else if (file.name.endsWith('.json')) {
      const value = JSON.parse(content);
      if (typeof value.content !== 'string') throw new Error('JSON 文件缺少 content 字段');
      await replaceContent(value.content, typeof value.title === 'string' ? value.title : undefined);
    } else {
      await replaceContent(content, file.name.replace(/\.[^.]+$/, ''));
    }
    notify('文件已导入');
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '导入失败'; }
  input.value = '';
}

async function exportFile(format: 'html' | 'json' | 'txt') {
  await changeView(view.value === 'html' ? 'edit' : view.value);
  save();
  const text = format === 'html' ? documentHtml(editorBindings?.snapshot(draft.content) ?? draft.content, draft.title)
    : format === 'json' ? JSON.stringify(draft, null, 2)
    : new DOMParser().parseFromString(draft.content, 'text/html').body.textContent || '';
  const blob = new Blob([text], { type: format === 'html' ? 'text/html;charset=utf-8' : format === 'json' ? 'application/json' : 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${draft.title.replace(/[<>:"/\\|?*]/g, '_') || 'document'}.${format}`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  exportOpen.value = false;
}

function openSettings() { Object.assign(pendingSettings, settings); settingsOpen.value = true; }

/** Recreate TinyMCE only after the draft is flushed; plugin combinations cannot change in place. */
async function applySettings() {
  await changeView('edit');
  save();
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(pendingSettings)); }
  catch { error.value = '无法保存配置，本地存储不可用'; return; }
  Object.assign(settings, pendingSettings);
  ready.value = false;
  // TinyMCE replaces its textarea DOM; remove the parent before creating a new instance.
  editorBindings?.dispose(); editorBindings = undefined;
  mountEditor.value = false;
  await nextTick();
  editor.value = undefined;
  registeredPlugins.value = [];
  options.value = makeOptions();
  editorKey.value++;
  mountEditor.value = true;
  settingsOpen.value = false;
  error.value = '';
  armLoadTimeout();
}

function armLoadTimeout() {
  clearTimeout(loadTimer);
  loadTimer = setTimeout(() => {
    if (!ready.value) error.value = '本地编辑器加载超时，请执行 pnpm editor:build 后重新启动项目。';
  }, 30000);
}
armLoadTimeout();

/** 预览 iframe 只授予同源 DOM 访问，由父页面渲染；文档脚本仍禁止运行。 */
function bindPreview() {
  previewBindings?.dispose();
  const body = previewFrame.value?.contentDocument?.body;
  previewBindings = body ? bindDanmaku(body) : undefined;
}

onMounted(() => { void liveSession.initialize(); });

function beforeUnload() { if (view.value === 'html') draft.content = source.value; save(); }
window.addEventListener('beforeunload', beforeUnload);
onBeforeUnmount(() => {
  beforeUnload();
  editorBindings?.dispose(); previewBindings?.dispose(); liveSession.dispose();
  window.removeEventListener('beforeunload', beforeUnload);
  clearTimeout(timer); clearTimeout(toastTimer); clearTimeout(loadTimer);
});
</script>

<template>
  <div class="studio" @click="exportOpen = false">
    <header class="app-header">
      <a class="brand" href="/" aria-label="TinyMCE Studio"><span class="brand-icon"><FilePenLine :size="23" /></span><span>TinyMCE <b>Studio</b><small>VUE PLAYGROUND</small></span></a>
      <span class="header-divider"></span>
      <div class="document-name"><input v-model="draft.title" aria-label="文档名称" maxlength="100" /><span class="save-state" :class="{ failed: status === '保存失败' }"><LoaderCircle v-if="status === '保存中'" class="spin" :size="12" /><Check v-else :size="12" />{{ status }}</span></div>
      <div class="header-actions">
        <button class="icon-button" title="新建文档" aria-label="新建文档" @click="newDocument"><Plus :size="18" /></button>
        <button class="icon-button" title="导入 HTML、文本或 JSON" aria-label="导入文件" :disabled="!ready" @click="fileInput?.click()"><FolderOpen :size="18" /></button>
        <button class="icon-button" title="保存并创建本地版本" aria-label="保存文档" :disabled="!ready" @click="changeView('edit').then(() => save(true))"><Save :size="18" /></button>
        <div class="export-wrap" @click.stop><button class="primary-button" :disabled="!ready" @click="exportOpen = !exportOpen"><Download :size="16" /><span>导出</span><ChevronDown :size="13" /></button><div v-if="exportOpen" class="dropdown"><button @click="exportFile('html')">HTML 文档</button><button @click="exportFile('txt')">纯文本 .txt</button><button @click="exportFile('json')">文档备份 .json</button></div></div>
        <button class="icon-button" title="编辑器配置" aria-label="编辑器配置" @click="openSettings"><Settings2 :size="18" /></button>
      </div>
    </header>

    <nav class="workspace-bar" aria-label="文档视图">
      <div class="tabs"><button :class="{ active: view === 'edit' }" @click="changeView('edit')"><PenLine :size="15" />编辑</button><button :class="{ active: view === 'html' }" :disabled="!ready" @click="changeView('html')"><Code2 :size="16" />HTML</button><button :class="{ active: view === 'preview' }" :disabled="!ready" @click="changeView('preview')"><Eye :size="16" />预览</button></div>
      <div class="workspace-actions"><span class="cloud-label"><span></span>6mm · 本地</span><button :class="{ selected: panel === 'live' }" title="直播弹幕" aria-label="直播弹幕" @click="panel = panel === 'live' ? null : 'live'"><Radio :size="16" /><span>直播弹幕</span></button><button :class="{ selected: panel === 'history' }" title="本地版本" aria-label="本地版本" @click="panel = panel === 'history' ? null : 'history'"><History :size="16" /><span>版本</span><small>{{ draft.revisions.length }}</small></button><button :class="{ selected: panel === 'plugins' }" @click="panel = panel === 'plugins' ? null : 'plugins'"><Puzzle :size="16" /><span>插件</span><small>{{ registeredPlugins.length }}</small></button></div>
    </nav>

    <div v-if="error" class="error-banner" role="alert"><AlertCircle :size="17" /><span>{{ error }}</span><button class="icon-button" aria-label="关闭错误提示" @click="error = ''"><X :size="16" /></button></div>

    <main class="workspace">
      <section class="editor-pane" aria-label="文档编辑区">
        <div v-if="!ready && view === 'edit'" class="loading"><LoaderCircle :size="22" class="spin" /><span>正在加载本地编辑器…</span></div>
        <div v-if="mountEditor" :key="editorKey" v-show="view === 'edit'" class="editor-container"><TinyEditor v-model="draft.content" tinymce-script-src="/vendor/tinymce/tinymce.min.js" license-key="gpl" :init="options" /></div>
        <div v-if="view === 'html'" class="source-pane"><div class="source-header"><span>{{ draft.title }}.html</span><button class="text-button" @click="changeView('edit')"><Check :size="15" />应用修改</button></div><textarea v-model="source" aria-label="HTML 源码" spellcheck="false"></textarea></div>
        <div v-if="view === 'preview'" class="preview-pane"><iframe ref="previewFrame" title="文档预览" sandbox="allow-same-origin" :srcdoc="previewHtml" @load="bindPreview"></iframe></div>
      </section>
      <aside v-show="panel === 'live'" class="side-panel live-panel" aria-label="直播弹幕面板">
        <div class="panel-heading"><h2>直播弹幕</h2><button class="icon-button" aria-label="收起直播弹幕" @click="panel = null"><X :size="17" /></button></div>
        <LivePanel :editor-ready="ready" @insert="insertLiveMessages" />
      </aside>
      <aside v-if="panel && panel !== 'live'" class="side-panel">
        <div class="panel-heading"><h2>{{ panel === 'plugins' ? '插件目录' : '本地版本' }}</h2><button class="icon-button" aria-label="关闭侧栏" @click="panel = null"><X :size="17" /></button></div>
        <template v-if="panel === 'plugins'"><input v-model="pluginSearch" class="search" placeholder="搜索插件" aria-label="搜索插件" /><div class="plugin-list"><div v-for="id in shownPlugins" :key="id" class="plugin-row"><div><strong>{{ pluginNames[id] || id }}</strong><code>{{ id }}</code></div><span class="plugin-status" :class="{ loaded: registeredPlugins.includes(id) }">{{ registeredPlugins.includes(id) ? '已注册' : configuredPlugins.includes(id) ? '待加载' : '未启用' }}</span></div></div><button class="panel-footer text-button" @click="openSettings"><Settings2 :size="15" />配置插件</button></template>
        <template v-else><button class="text-button history-save" :disabled="!ready" @click="save(true)"><Plus :size="16" />创建版本</button><p v-if="!draft.revisions.length" class="empty">暂无本地版本</p><div class="revision-list"><div v-for="revision in draft.revisions" :key="revision.revisionId" class="revision-row"><History :size="16" /><div><strong>{{ new Date(revision.createdAt).toLocaleString('zh-CN') }}</strong><small>{{ revision.author.name }}</small></div><button class="icon-button" :disabled="!ready" title="恢复此版本" aria-label="恢复此版本" @click="save(true); replaceContent(revision.content); notify('已恢复版本')"><RotateCcw :size="16" /></button></div></div></template>
      </aside>
    </main>
    <footer class="app-footer"><span><i></i>{{ ready ? '编辑器已就绪' : '加载中' }}</span><span class="footer-middle">6mm 源码构建 · GPLv2+ · {{ registeredPlugins.length }} 个插件已注册</span><span>{{ savedTime ? `最近保存 ${savedTime}` : '本地文档' }}</span></footer>
    <input ref="fileInput" class="hidden" type="file" accept=".html,.htm,.txt,.json" @change="importFile" />
    <div v-if="toast" class="toast" role="status"><Check :size="16" />{{ toast }}</div>

    <div v-if="settingsOpen" class="modal-backdrop" @click.self="settingsOpen = false" @keydown.esc="settingsOpen = false">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="panel-heading"><h2 id="settings-title">编辑器配置</h2><button class="icon-button" aria-label="关闭配置" @click="settingsOpen = false"><X :size="19" /></button></div>
        <form @submit.prevent="applySettings"><div class="settings-body">
          <label class="toggle-row"><span>自适应文档高度</span><input v-model="pendingSettings.autoresize" type="checkbox" /></label>
          <div class="settings-links"><a href="https://github.com/zhangjinteng/6mm-tinymce" target="_blank" rel="noopener noreferrer">6mm-tinymce 源码</a><a href="/vendor/tinymce/license.md" target="_blank" rel="noopener noreferrer">GPLv2+ 许可证</a></div>
        </div><div class="modal-footer"><button type="button" class="icon-button" title="恢复示例文档" aria-label="恢复示例文档" :disabled="!ready" @click="resetSample"><RotateCcw :size="17" /></button><div><button type="button" class="secondary-button" @click="settingsOpen = false">取消</button><button type="submit" class="primary-button">应用配置</button></div></div></form>
      </section>
    </div>
  </div>
</template>
