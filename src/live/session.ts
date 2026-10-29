import { ref } from 'vue';
import { biliRequest, loadDanmakuSdk, normalizeMessage, reportBiliEvent, socketAuth, type BiliClientEvent, type DanmakuSocket, type LiveConnection, type LiveMessage, type LiveStatus } from '../bilibili';
import { liveMessages } from './store';

const state = ref<'idle' | 'paused' | 'starting' | 'authenticating' | 'connected' | 'reconnecting' | 'stopping' | 'error'>('idle');
const status = ref<LiveStatus>();
const error = ref('');
let socket: DanmakuSocket | undefined;
let generation = 0;
let poll: ReturnType<typeof setInterval> | undefined;
let authTimer: ReturnType<typeof setTimeout> | undefined;
const ownsSession = ref(false);
let polling = false;
let statusFailed = false;

/** Start the official session before opening its authenticated socket; stale callbacks are ignored. */
async function connect() {
  if (['starting', 'authenticating', 'connected', 'reconnecting', 'stopping'].includes(state.value)) return;
  const ownGeneration = ++generation;
  error.value = '';
  state.value = 'starting';
  let phase: 'sdk' | 'api' | 'socket' = 'sdk';
  try {
    const Socket = await loadDanmakuSdk();
    if (ownGeneration !== generation) return;
    phase = 'api';
    const connection = await biliRequest<LiveConnection>('start');
    ownsSession.value = true;
    if (ownGeneration !== generation) { await biliRequest('pause', true); ownsSession.value = false; return; }
    status.value = { configured: true, appId: status.value?.appId || '', running: true, busy: false, anchor: connection.anchor };
    liveMessages.setSource(`bilibili:${connection.anchor.roomId}`);
    state.value = 'authenticating';
    phase = 'socket';
    const current = () => generation === ownGeneration;
    const fail = (message: string, event: BiliClientEvent, code?: number) => {
      if (current()) { reportBiliEvent(event, code); void disconnect(message, event === 'ws.auth_failed'); }
    };
    const armAuth = () => {
      clearTimeout(authTimer);
      authTimer = setTimeout(() => fail('弹幕通道认证超时，请重新连接', 'ws.timeout'), 15000);
    };
    armAuth();
    socket = new Socket({
      ...socketAuth(connection),
      onOpen: () => { if (current()) { state.value = 'authenticating'; armAuth(); } },
      onReceiveAuthRes: (response) => {
        if (!current()) return;
        const result = Array.isArray(response) ? response[0] : response;
        if (result?.code !== 0) { fail(`弹幕通道认证失败 (${result?.code ?? '未知'})`, 'ws.auth_failed', result?.code); return; }
      },
      onHeartBeatReply: () => {
        if (!current()) return;
        // This official SDK only calls onReceiveAuthRes for failures; a heartbeat reply confirms auth.
        clearTimeout(authTimer);
        if (state.value !== 'connected') reportBiliEvent('ws.connected');
        state.value = 'connected';
      },
      onReceivedMessage: (packet) => {
        if (!current()) return;
        const items = Array.isArray(packet) ? packet : [packet];
        const batch = items.map(normalizeMessage).filter((item): item is LiveMessage => item !== null);
        liveMessages.publish(batch);
      },
      onClose: () => { if (current()) { if (state.value !== 'reconnecting') reportBiliEvent('ws.reconnecting'); state.value = 'reconnecting'; armAuth(); } },
      onError: () => { if (current()) { if (state.value !== 'reconnecting') reportBiliEvent('ws.reconnecting'); state.value = 'reconnecting'; armAuth(); } },
      onListConnectError: () => fail('弹幕服务器连接失败，请检查网络或身份码后重试', 'ws.connect_failed')
    });
  } catch (cause) {
    if (ownGeneration !== generation) return;
    if (phase === 'sdk') reportBiliEvent('sdk.load_failed');
    if (phase === 'socket') reportBiliEvent('ws.connect_failed');
    await disconnect(cause instanceof Error ? cause.message : '连接失败');
  }
}

/** Pause closes only the socket; explicit ending/auth rejection releases the server-side session. */
async function disconnect(failure = '', endSession = false) {
  if (state.value === 'stopping') return;
  ++generation;
  clearTimeout(authTimer);
  state.value = 'stopping';
  socket?.destroy(); socket = undefined;
  try {
    if (ownsSession.value) {
      if (endSession) {
        await biliRequest('stop');
        ownsSession.value = false;
        if (status.value) { status.value.running = false; status.value.retained = false; status.value.retainedUntil = undefined; status.value.error = ''; }
      } else {
        status.value = await biliRequest<LiveStatus>('pause');
        ownsSession.value = Boolean(status.value.running || status.value.retained);
      }
    }
    error.value = failure;
    state.value = failure ? 'error' : ownsSession.value ? 'paused' : 'idle';
  } catch (cause) {
    error.value = [failure, cause instanceof Error ? cause.message : '更新直播会话失败'].filter(Boolean).join('；');
    state.value = 'error';
  }
}

async function refreshStatus() {
  if (polling) return;
  polling = true;
  const ownGeneration = generation;
  try {
    const latest = await biliRequest<LiveStatus>('status', false, ['authenticating', 'connected', 'reconnecting'].includes(state.value));
    if (ownGeneration !== generation) return;
    status.value = latest;
    statusFailed = false;
    if (state.value === 'starting' || state.value === 'stopping') return;
    if (ownsSession.value && !latest.running && !latest.retained) {
      ownsSession.value = false;
      if (state.value === 'paused') state.value = 'idle';
      else await disconnect(latest.error || '直播会话已结束，请重新连接');
    } else if (latest.retained && !socket) {
      ownsSession.value = true;
      if (state.value === 'idle') state.value = 'paused';
    }
    if (latest.error) error.value = latest.error;
  } catch (cause) {
    if (ownGeneration !== generation) return;
    if (!statusFailed) reportBiliEvent('client.status_failed');
    statusFailed = true;
    error.value = cause instanceof Error ? cause.message : '无法读取直播状态';
  }
  finally { polling = false; }
}


/** 应用持有连接；隐藏面板或重建编辑器不重启直播会话。 */
async function initialize() {
  if (poll) return;
  await refreshStatus();
  if (status.value?.running) await connect();
  poll = setInterval(() => void refreshStatus(), 15000);
}

/** 页面卸载只关闭浏览器资源；保留服务端短期会话供刷新复用。 */
function dispose() {
  ++generation; clearInterval(poll); poll = undefined;
  clearTimeout(authTimer); socket?.destroy(); socket = undefined;
}

export const liveSession = { state, status, error, ownsSession, connect, disconnect, end: () => disconnect('', true), initialize, dispose };
