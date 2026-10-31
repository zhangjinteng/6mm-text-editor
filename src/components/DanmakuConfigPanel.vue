<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { X } from '@lucide/vue';
import type { Editor } from 'tinymce';
import { isBlankSelection } from '../blank-selection';
import { alignments, applyDanmakuSettings, readDanmakuSettings, type Alignment } from '../live/settings';
import '../danmaku-config-panel.css';

const props = defineProps<{ editor?: Editor; enabled: boolean; shown?: boolean }>();
const emit = defineEmits<{ active: [value: boolean] }>();
const target = shallowRef<HTMLElement>();
const state = ref<{ alignment: Alignment; layer: number; count: number }>({ alignment: '', layer: 0, count: 0 });
let dismissed: HTMLElement | undefined;
let detach: (() => void) | undefined;
function valid(element?: Element | null): HTMLElement | undefined {
  if (element?.matches('div[data-danmaku-source]') && element.isConnected && !element.parentElement?.closest('div[data-danmaku-source]')) return element as HTMLElement;
}
function sync() {
  if (props.editor && target.value?.isConnected) state.value = readDanmakuSettings(props.editor, target.value);
}
function select(element?: HTMLElement) {
  if (!props.enabled || props.editor?.mode.isReadOnly()) element = undefined;
  if (element && element === dismissed) return;
  if (target.value === element) { sync(); return; }
  target.value = element; emit('active', !!element);
  void nextTick(() => {
    if (!props.editor || props.editor.removed) return;
    sync(); props.editor.dispatch('ResizeEditor');
    if (target.value) props.editor.nodeChanged();
  });
}
function close() { dismissed = target.value; select(); }
function apply(settings: { alignment?: Alignment; layer?: number }) {
  if (props.editor && props.enabled && target.value) applyDanmakuSettings(props.editor, target.value, settings);
}
watch(() => [props.editor, props.enabled] as const, ([editor, enabled]) => {
  detach?.(); detach = undefined; dismissed = undefined; select();
  if (!editor || !enabled) return;
  let followNativeSelection = true;
  const selected = (event: { element?: Element }) => {
    followNativeSelection = false; dismissed = undefined; select(valid(event.element));
  };
  const nodeChanged = () => {
    // Shadow DOM 弹幕失焦时原生选区可能回到正文；当前对象以显式对象选择事件为准。
    if (!editor.mode.isReadOnly() && target.value?.isConnected) { sync(); return; }
    if (!followNativeSelection) { select(); return; }
    select(isBlankSelection(editor) ? undefined : valid(editor.selection.getNode().closest('div[data-danmaku-source]')));
  };
  const reset = () => { followNativeSelection = false; dismissed = undefined; select(); };
  const contentReset = () => { reset(); followNativeSelection = true; };
  const canvasSelected = (event: { selected: boolean }) => { if (event.selected) reset(); };
  const resize = new ResizeObserver(sync);
  resize.observe(editor.getContentAreaContainer());
  editor.on('ObjectSelectionChanged', selected);
  editor.on('NodeChange Undo Redo SwitchMode', nodeChanged);
  editor.on('change ResizeContent', sync);
  editor.on('BeforeSetContent', contentReset);
  editor.on('TextBoxSelected', reset);
  editor.on('CanvasSelectionChanged', canvasSelected);
  detach = () => {
    resize.disconnect();
    editor.off('ObjectSelectionChanged', selected);
    editor.off('NodeChange Undo Redo SwitchMode', nodeChanged);
    editor.off('change ResizeContent', sync);
    editor.off('BeforeSetContent', contentReset);
    editor.off('TextBoxSelected', reset);
    editor.off('CanvasSelectionChanged', canvasSelected);
  };
  nodeChanged();
}, { immediate: true });
onBeforeUnmount(() => detach?.());
</script>

<template>
  <aside v-show="target && enabled && shown !== false" class="side-panel danmaku-config-panel" aria-label="弹幕配置面板">
    <header class="danmaku-config-heading">
      <div><h2>弹幕配置</h2><p>调整即时生效，可撤销</p></div>
      <button class="icon-button" aria-label="收起弹幕配置" @click="close"><X :size="18" /></button>
    </header>
    <div class="danmaku-settings-body">
      <section>
        <h3>对齐</h3>
        <div class="danmaku-settings-align" role="group" aria-label="弹幕对齐">
          <button v-for="[key, label] in alignments" :key="key" type="button" :aria-pressed="state.alignment === key" @click="apply({ alignment: key })">{{ label }}</button>
        </div>
        <p class="danmaku-settings-hint">对齐弹幕框，不改变消息文字的对齐方式。</p>
      </section>
      <section>
        <h3>图层设置 <span>第 {{ state.layer }} / {{ state.count }} 层</span></h3>
        <div class="danmaku-settings-layers" role="group" aria-label="图层设置">
          <button type="button" :disabled="state.layer <= 1" @click="apply({ layer: state.layer - 1 })">下一层</button>
          <button type="button" :disabled="state.layer >= state.count" @click="apply({ layer: state.layer + 1 })">上一层</button>
          <button type="button" :disabled="state.layer <= 1" @click="apply({ layer: 1 })">置于底层</button>
          <button type="button" :disabled="state.layer >= state.count" @click="apply({ layer: state.count })">置于顶层</button>
        </div>
      </section>
    </div>
  </aside>
</template>
