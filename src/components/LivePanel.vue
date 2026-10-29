<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { Radio, Plug, Pause, Square, LoaderCircle, AlertCircle, ArrowDownToLine, Trash2, Search, Check } from '@lucide/vue';
import type { LiveMessage } from '../bilibili';
import { liveSession } from '../live/session';
import { liveMessages } from '../live/store';

defineProps<{ editorReady: boolean }>();
const emit = defineEmits<{ insert: [messages: LiveMessage[]] }>();
const { state, status, error, ownsSession, connect, disconnect, end } = liveSession;
const messages = liveMessages.messages;
const selected = ref<string[]>([]);
const query = ref('');
const type = ref('all');
const includeName = ref(true);
const list = ref<HTMLDivElement>();
const labels = { idle: '未连接', paused: '已暂停', starting: '连接中', authenticating: '通道认证中', connected: '已连接', reconnecting: '重新连接中', stopping: '正在断开', error: '连接失败' };
const busy = computed(() => ['starting', 'stopping'].includes(state.value));
const active = computed(() => ['starting', 'authenticating', 'connected', 'reconnecting', 'stopping'].includes(state.value));
const retainedUntil = computed(() => status.value?.retained && status.value.retainedUntil ? new Date(status.value.retainedUntil).toLocaleTimeString('zh-CN', { hour12: false }) : '');
const filtered = computed(() => messages.value.filter((item) => (type.value === 'all' || item.type === type.value) && `${item.name} ${item.text}`.toLowerCase().includes(query.value.toLowerCase())));
const selectedMessages = computed(() => messages.value.filter((item) => selected.value.includes(item.id)));
const badge = { chat: '弹幕', gift: '礼物', superchat: '醒目留言', guard: '大航海', entry: '进房' };

function insert(items: LiveMessage[]) {
  emit('insert', items.map((item) => ({ ...item, name: includeName.value ? item.name : '' })));
  selected.value = [];
}


watch(messages, () => {
  const follow = !list.value || list.value.scrollHeight - list.value.scrollTop - list.value.clientHeight < 80;
  selected.value = selected.value.filter((id) => messages.value.some((message) => message.id === id));
  if (follow) void nextTick(() => { if (list.value) list.value.scrollTop = list.value.scrollHeight; });
});
</script>

<template>
  <div class="live-content">
    <div class="live-connection">
      <div class="live-state" :class="{ online: state === 'connected' }"><Radio :size="15" /><strong>{{ labels[state] }}</strong><span v-if="status?.anchor">{{ status.anchor.name }} · {{ status.anchor.roomId }}</span></div>
      <div class="live-app-id">APP {{ status?.appId || '—' }}</div>
      <button v-if="active" class="secondary-button live-connect" :disabled="busy" @click="disconnect()"><LoaderCircle v-if="busy" :size="15" class="spin" /><Pause v-else :size="15" />暂停接收</button>
      <button v-else class="primary-button live-connect" :disabled="!status?.configured || status?.busy" @click="connect"><Plug :size="15" />{{ status?.retained ? '恢复接收' : '连接直播间' }}</button>
      <div v-if="ownsSession" class="live-session-actions"><span>{{ retainedUntil ? `保留至 ${retainedUntil}` : '' }}</span><button :disabled="busy" title="立即结束场次" @click="end"><Square :size="12" />结束场次</button></div>
      <div v-if="status?.busy && !ownsSession && !active" class="live-inline-error">连接正由其他浏览器使用</div>
      <div v-if="status && !status.configured" class="live-inline-error">服务端直播配置未完成</div>
      <div v-if="error" class="live-inline-error" role="alert"><AlertCircle :size="14" /><span>{{ error }}</span></div>
    </div>
    <details class="live-binding-help" style="margin:0 16px 12px;font-size:12px;overflow-wrap:anywhere;">
      <summary>自动订阅：给容器添加属性</summary>
      <p>在源码窗口给 div 添加以下属性，保存后自动生效：</p>
      <code>data-danmaku-source="current" data-danmaku-skin="simple"</code>
      <p>皮肤：simple / card / blivechat。实例 ID 自动补齐；可用 data-danmaku-types="gift,guard,superchat" 过滤、data-danmaku-limit="50" 限制条数、data-danmaku-paused="true" 暂停。</p>
      <p>替换绑定区域内的实时展示；原 HTML 保留为回退。HTML 导出包含当前静态快照。</p>
      <a href="/examples/danmaku.html" download>下载三个弹幕区示例 HTML</a>
    </details>
    <div class="live-filters"><label class="live-search"><Search :size="14" /><input v-model="query" placeholder="搜索弹幕或用户" aria-label="搜索弹幕" /></label><select v-model="type" aria-label="弹幕类型"><option value="all">全部</option><option value="chat">弹幕</option><option value="superchat">醒目留言</option><option value="gift">礼物</option><option value="guard">大航海</option></select></div>
    <div class="live-list-bar"><span>{{ messages.length }} 条消息 · 已选 {{ selected.length }}</span><button class="icon-button" title="清空消息" aria-label="清空弹幕" :disabled="!messages.length" @click="liveMessages.clear(); selected = []"><Trash2 :size="14" /></button></div>
    <div ref="list" class="live-message-list">
      <div v-if="!messages.length" class="live-empty"><Radio :size="28" /><span>{{ state === 'connected' ? '等待直播间消息' : '暂无弹幕消息' }}</span></div>
      <p v-else-if="!filtered.length" class="empty">没有匹配的消息</p>
      <article v-for="message in filtered" :key="message.id" class="live-message" :class="{ checked: selected.includes(message.id) }">
        <input v-model="selected" type="checkbox" :value="message.id" :aria-label="`选择 ${message.name} 的消息`" />
        <div class="live-message-body"><div class="live-message-meta"><strong>{{ message.name }}</strong><small v-if="message.type !== 'chat'" :class="message.type">{{ badge[message.type] }}</small><time>{{ message.time }}</time></div><p>{{ message.text }}</p></div>
        <button class="icon-button live-insert-one" :disabled="!editorReady" title="插入正文" :aria-label="`插入 ${message.name} 的消息`" @click="insert([message])"><ArrowDownToLine :size="16" /></button>
      </article>
    </div>
    <div class="live-bottom"><label><input v-model="includeName" type="checkbox" />包含用户名</label><button class="primary-button" :disabled="!selectedMessages.length || !editorReady" @click="insert(selectedMessages)"><Check :size="15" />插入选中 {{ selectedMessages.length || '' }}</button></div>
  </div>
</template>
