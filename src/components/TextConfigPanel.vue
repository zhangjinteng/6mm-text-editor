<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import type { Editor } from 'tinymce';
import { currentTextBox } from '../text-box-state';
import '../text-config-panel.css';

const props = defineProps<{ editor?: Editor; enabled: boolean; shown?: boolean }>();
const emit = defineEmits<{ active: [value: boolean] }>();
const host = ref<HTMLElement>();
const target = shallowRef<HTMLElement>();
let detach: (() => void) | undefined;
let version = 0;
let activeTab = 'basic';
function rememberTab(event: Event) {
  const tab = (event.target as Element).closest<HTMLElement>('[data-tab]');
  if (tab) activeTab = tab.dataset.tab!;
}
let dismissed: HTMLElement | undefined;

async function select(box?: HTMLElement, force = false) {
  if (!props.enabled || !box?.isConnected || props.editor?.mode.isReadOnly()) box = undefined;
  if (box && box === dismissed) return;
  if (!force && box === target.value) return;
  if (box !== target.value) activeTab = 'basic';
  target.value = box;
  emit('active', !!box);
  const request = ++version;
  await nextTick();
  if (request !== version || !props.editor || !host.value) return;
  props.editor.execCommand('TextSettingsPanel', false, box ? {
    host: host.value, box, tab: activeTab,
    onClose: () => { dismissed = box; target.value = undefined; emit('active', false); }
  } : null);
  props.editor.dispatch('ResizeEditor');
}

watch(() => [props.editor, props.enabled] as const, ([editor, enabled]) => {
  detach?.(); detach = undefined; dismissed = undefined;
  if (!editor || !enabled) { void select(); return; }
  const selected = (event: { box?: HTMLElement }) => {
    dismissed = undefined;
    void select(event.box);
  };
  const clicked = () => { dismissed = undefined; void select(currentTextBox(editor), !host.value?.firstChild); };
  const selection = () => {
    if (host.value?.contains(document.activeElement) || editor.selection.isCollapsed()) return;
    const range = editor.selection.getRng();
    const start = (range.startContainer.nodeType === 1 ? range.startContainer as Element : range.startContainer.parentElement)?.closest<HTMLElement>('span[data-text-draggable]');
    const end = (range.endContainer.nodeType === 1 ? range.endContainer as Element : range.endContainer.parentElement)?.closest('span[data-text-draggable]');
    if (start?.closest('[data-mce-bogus]')) return;
    if (start && start === end) void select(start);
    else if (start || end) void select();
  };
  const changed = () => {
    if (host.value?.contains(document.activeElement)) return;
    if (target.value?.isConnected) void select(target.value, true);
  };
  const locked = () => { void select(currentTextBox(editor), true); };
  const mode = () => { if (editor.mode.isReadOnly()) void select(); };
  const objectSelected = (event: { element?: HTMLElement }) => {
    if (event.element) { dismissed = undefined; void select(); }
  };
  editor.on('TextBoxSelectionChanged', selected);
  editor.on('TextBoxSelected', clicked);
  editor.on('SelectionChange', selection);
  editor.on('change input', changed);
  editor.on('TextBoxLockChanged', locked);
  editor.on('SwitchMode', mode);
  editor.on('ObjectSelectionChanged', objectSelected);
  detach = () => {
    editor.off('TextBoxSelectionChanged', selected); editor.off('TextBoxSelected', clicked);
    editor.off('SelectionChange', selection); editor.off('change input', changed);
    editor.off('TextBoxLockChanged', locked); editor.off('SwitchMode', mode);
    editor.off('ObjectSelectionChanged', objectSelected);
    if (!editor.removed) editor.execCommand('TextSettingsPanel', false, null);
  };
  void select(currentTextBox(editor), true);
}, { immediate: true });
onBeforeUnmount(() => { ++version; detach?.(); });
</script>

<template>
  <aside v-show="target && enabled && shown !== false" class="side-panel text-config-panel" aria-label="文字配置面板">
    <div ref="host" class="text-config-host" @click="rememberTab" @keyup="rememberTab"></div>
  </aside>
</template>
