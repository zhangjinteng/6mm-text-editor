<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { Editor } from 'tinymce';
import { isBlankSelection } from '../blank-selection';
import '../image-config-panel.css';

const props = defineProps<{ editor?: Editor; enabled: boolean; shown?: boolean }>();
const emit = defineEmits<{ active: [value: boolean] }>();
const host = ref<HTMLElement>();
const target = shallowRef<HTMLImageElement>();
let detach: (() => void) | undefined;
let version = 0;
let activeTab = 'source';
let dismissed: HTMLImageElement | undefined;
function rememberTab(event: Event) {
  const tab = (event.target as Element).closest<HTMLElement>('[data-tab]');
  if (tab) activeTab = tab.dataset.tab!;
}
function validImage(element?: Element | null): HTMLImageElement | undefined {
  if (!element?.matches('img') || !element.isConnected || element.closest('[data-mce-bogus], [data-mce-object], [data-mce-placeholder], [data-document-background], [data-text-render], div[data-danmaku-source]')) return;
  return element as HTMLImageElement;
}
async function select(image?: HTMLImageElement, force = false) {
  if (!props.enabled || !image?.isConnected || props.editor?.mode.isReadOnly()) image = undefined;
  if (image && image === dismissed) return;
  if (!force && image === target.value) return;
  if (image !== target.value) activeTab = 'source';
  target.value = image; emit('active', !!image);
  const request = ++version;
  await nextTick();
  if (request !== version || !props.editor || !host.value) return;
  props.editor.execCommand('ImageSettingsPanel', false, image ? {
    host: host.value, image, tab: activeTab,
    onClose: () => { dismissed = image; target.value = undefined; emit('active', false); }
  } : null);
  props.editor.dispatch('ResizeEditor');
}
watch(() => [props.editor, props.enabled] as const, ([editor, enabled]) => {
  detach?.(); detach = undefined; dismissed = undefined;
  if (!editor || !enabled) { void select(); return; }
  const selected = (event: { element?: Element }) => { dismissed = undefined; void select(validImage(event.element)); };
  const nodeChanged = () => {
    if (host.value?.contains(document.activeElement)) return;
    void select(isBlankSelection(editor) ? undefined : validImage(editor.selection.getNode().closest('img')));
  };
  const changed = () => {
    if (host.value?.contains(document.activeElement)) return;
    const image = validImage(target.value);
    if (image) void select(image, true);
    else nodeChanged();
  };
  const reset = () => { dismissed = undefined; void select(); };
  editor.on('ObjectSelectionChanged', selected);
  editor.on('NodeChange SwitchMode', nodeChanged);
  editor.on('change Undo Redo', changed);
  editor.on('BeforeSetContent TextBoxSelected', reset);
  detach = () => {
    editor.off('ObjectSelectionChanged', selected); editor.off('NodeChange SwitchMode', nodeChanged);
    editor.off('change Undo Redo', changed); editor.off('BeforeSetContent TextBoxSelected', reset);
    if (!editor.removed) editor.execCommand('ImageSettingsPanel', false, null);
  };
  nodeChanged();
}, { immediate: true });
onBeforeUnmount(() => { ++version; detach?.(); });
</script>

<template>
  <aside v-show="target && enabled && shown !== false" class="side-panel image-config-panel" aria-label="图片配置面板">
    <div ref="host" class="image-config-host" @click="rememberTab" @keyup="rememberTab"></div>
  </aside>
</template>
