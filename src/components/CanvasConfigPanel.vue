<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { Image, Wallpaper, Smile, Type, X } from '@lucide/vue';
import type { Editor } from 'tinymce';
import { isBlankSelection } from '../blank-selection';
import { applyCanvasBackground, readCanvasBackground } from '../canvas-background';
import { installColorPickers } from '../text-color-picker';
import { parseShadowColor } from '../text-shadow';
import '../canvas-config-panel.css';

const props = defineProps<{ editor?: Editor; enabled: boolean; objectActive: boolean; shown?: boolean }>();
const emit = defineEmits<{ active: [value: boolean] }>();
const host = ref<HTMLElement>();
let colorPickers: ReturnType<typeof installColorPickers> | undefined;
const visible = ref(false);
const tab = ref<'background' | 'insert'>('background');
const color = ref('#ffffff');
const transparency = ref(0);
const hasColor = ref(false);
const error = ref('');
let detach: (() => void) | undefined;
let initializedEditor: Editor | undefined;
function sync() {
  const editor = props.editor;
  if (!editor || editor.removed) return;
  const state = readCanvasBackground(editor);
  color.value = '#' + state.rgb.map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('');
  transparency.value = Math.round((1 - state.alpha) * 10000) / 100;
  hasColor.value = state.hasColor;
  error.value = '';
  void nextTick(() => colorPickers?.refresh());
}
function show(value: boolean) {
  value = value && props.enabled && !!props.editor && !props.editor.mode.isReadOnly();
  if (visible.value === value) return;
  visible.value = value; emit('active', value);
  if (value) sync();
  void nextTick(() => { if (props.editor && !props.editor.removed) props.editor.dispatch('ResizeEditor'); });
}
function apply() {
  const editor = props.editor;
  if (!editor || !visible.value || !props.enabled || editor.mode.isReadOnly()) return;
  if (!/^#[\da-f]{6}$/i.test(color.value.trim())) { error.value = '请输入六位十六进制颜色，例如 #FFFFFF。'; return; }
  if (typeof transparency.value !== 'number' || !Number.isFinite(transparency.value) || transparency.value < 0 || transparency.value > 100) {
    error.value = '请输入 0 到 100 之间的透明度。'; return;
  }
  const rgb = [1, 3, 5].map(index => parseInt(color.value.trim().slice(index, index + 2), 16));
  applyCanvasBackground(editor, `rgba(${rgb.join(',')},${Number((1 - transparency.value / 100).toFixed(4))})`, false, false);
}
function pickColor(event: Event) {
  // The shared picker emits RGBA so color and transparency change in one undo step.
  if (event.isTrusted) return;
  const parsed = parseShadowColor((event.target as HTMLInputElement).value, host.value!.ownerDocument);
  if (!parsed) return;
  color.value = parsed.color;
  if (parsed.opacity !== undefined) transparency.value = 100 - parsed.opacity;
  apply();
}
function clear() {
  if (props.editor && props.enabled && visible.value) applyCanvasBackground(props.editor, 'remove', false, false);
}
function insert(command: string) {
  if (props.editor && props.enabled && visible.value && !props.editor.mode.isReadOnly()) props.editor.execCommand(command);
}
function moveTab(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  tab.value = event.key === 'Home' ? 'background' : event.key === 'End' ? 'insert' : tab.value === 'background' ? 'insert' : 'background';
  (event.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(`[data-tab="${tab.value}"]`)?.focus();
}
watch(() => [props.editor, props.enabled] as const, ([editor, enabled]) => {
  detach?.(); detach = undefined; show(false);
  if (!editor || !enabled) return;
  const selected = (event: { selected: boolean }) => show(event.selected);
  const objectSelected = (event: { element?: Element }) => { if (event.element) show(false); };
  const mode = () => { if (editor.mode.isReadOnly()) show(false); };
  editor.on('CanvasSelectionChanged', selected);
  editor.on('ObjectSelectionChanged', objectSelected);
  editor.on('change Undo Redo SetContent', sync);
  editor.on('SwitchMode', mode);
  detach = () => {
    editor.off('CanvasSelectionChanged', selected); editor.off('ObjectSelectionChanged', objectSelected);
    editor.off('change Undo Redo SetContent', sync); editor.off('SwitchMode', mode);
  };
  const firstOpen = initializedEditor !== editor;
  initializedEditor = editor;
  show(!props.objectActive && (firstOpen || isBlankSelection(editor)));
}, { immediate: true });
watch(() => props.objectActive, active => { if (active) show(false); });
watch(() => [props.editor, host.value] as const, ([editor, root]) => {
  colorPickers?.dispose(); colorPickers = undefined;
  if (editor && root && !editor.removed) colorPickers = installColorPickers(root, editor.getDoc());
}, { flush: 'post' });
watch([visible, tab], () => { void nextTick(() => colorPickers?.refresh()); });
onBeforeUnmount(() => { detach?.(); colorPickers?.dispose(); });
</script>

<template>
  <aside ref="host" v-show="visible && enabled && shown !== false" class="side-panel canvas-config-panel" aria-label="画布配置面板">
    <header class="canvas-config-heading">
      <div><h2>画布配置</h2><p>调整即时生效，可撤销</p></div>
      <button class="icon-button" aria-label="收起画布配置" @click="show(false)"><X :size="18" /></button>
    </header>
    <div class="canvas-config-body">
      <div class="canvas-config-tabs" role="tablist" aria-label="画布配置分类" @keydown="moveTab">
        <button id="canvas-background-tab" role="tab" data-tab="background" :aria-selected="tab === 'background'" :tabindex="tab === 'background' ? 0 : -1" aria-controls="canvas-background-panel" @click="tab = 'background'">背景</button>
        <button id="canvas-insert-tab" role="tab" data-tab="insert" :aria-selected="tab === 'insert'" :tabindex="tab === 'insert' ? 0 : -1" aria-controls="canvas-insert-panel" @click="tab = 'insert'">插入</button>
      </div>
      <section v-show="tab === 'background'" id="canvas-background-panel" role="tabpanel" aria-labelledby="canvas-background-tab">
        <label class="canvas-config-color" data-color-control>背景颜色<span><input v-model="color" data-color-opacity="[data-canvas-transparency]" data-color-opacity-mode="transparency" type="color" aria-label="背景颜色色板" @input="apply"><input v-model="color" type="text" aria-label="背景颜色" spellcheck="false" @input="pickColor" @change="apply" @keydown.enter="apply"></span></label>
        <label class="canvas-config-opacity">背景透明度<span><input v-model.number="transparency" type="number" min="0" max="100" step="1" aria-label="背景透明度数值" @change="apply" @keydown.enter="apply">%</span></label>
        <input v-model.number="transparency" data-canvas-transparency class="canvas-config-slider" type="range" min="0" max="100" step="1" aria-label="背景透明度" @input="apply">
        <div class="canvas-config-scale"><span>不透明</span><span>完全透明</span></div>
        <p class="canvas-config-hint">只调整画布背景颜色的透明度，文字和图片保持原有效果。</p>
      </section>
      <section v-show="tab === 'insert'" id="canvas-insert-panel" role="tabpanel" aria-labelledby="canvas-insert-tab">
        <div class="canvas-config-insert">
          <button @click="insert('CanvasInsertText')"><Type :size="20" /><span>插入文字</span></button>
          <button @click="insert('mceImage')"><Image :size="20" /><span>插入图片</span></button>
          <button @click="insert('mceEmoticons')"><Smile :size="20" /><span>表情符号</span></button>
          <button @click="insert('CanvasSetBackgroundImage')"><Wallpaper :size="20" /><span>设置画布背景图</span></button>
        </div>
        <p class="canvas-config-hint">选择内容后加入画布，文字会插入到刚才点击的位置。</p>
      </section>
      <p v-if="error" class="canvas-config-error" role="alert">{{ error }}</p>
    </div>
    <footer><button class="text-button" :disabled="!hasColor" @click="clear">清除背景颜色</button></footer>
  </aside>
</template>
