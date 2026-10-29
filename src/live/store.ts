import { shallowRef } from 'vue';
import type { LiveMessage } from '../bilibili';

type Listener = (messages: readonly LiveMessage[]) => void;

/** 有界内存历史与同步订阅；订阅时回放快照，取消订阅不会影响其他消费者。 */
export function createMessageStore(capacity = 300) {
  const messages = shallowRef<readonly LiveMessage[]>([]);
  const activeSource = shallowRef('');
  const listeners = new Map<Listener, string>();
  const seen = new Set<string>();
  const recentIds: string[] = [];

  function snapshot(source = 'current') {
    const target = source === 'current' ? activeSource.value : source;
    return messages.value.filter((message) => (message.source || activeSource.value) === target);
  }
  function notify() {
    // 一个消费者失败不能阻断消息接收或其他订阅。
    for (const [listener, source] of [...listeners]) {
      try { listener(snapshot(source)); } catch (error) { console.error('[danmaku] subscriber failed', error); }
    }
  }
  return {
    messages, activeSource, snapshot,
    /** 当前源切换时保留各房间有界历史，current 订阅立即切换到新源。 */
    setSource(source: string) { if (activeSource.value !== source) { activeSource.value = source; notify(); } },
    publish(batch: readonly LiveMessage[]) {
      const next = [...messages.value];
      for (const message of batch) {
        const copy = Object.freeze({ ...message, source: message.source || activeSource.value });
        const key = `${copy.source}:${copy.id}`;
        if (seen.has(key)) continue;
        seen.add(key); recentIds.push(key); next.push(copy);
      }
      // 单独保留较长去重窗口，避免刚滚出展示列表的重传消息再次出现。
      while (recentIds.length > capacity * 4) seen.delete(recentIds.shift()!);
      messages.value = Object.freeze(next.slice(-capacity));
      notify();
    },
    clear() { messages.value = []; seen.clear(); recentIds.length = 0; notify(); },
    subscribe(source: string, listener: Listener) {
      listeners.set(listener, source);
      try { listener(snapshot(source)); } catch (error) { listeners.delete(listener); throw error; }
      return () => { listeners.delete(listener); };
    }
  };
}

export const liveMessages = createMessageStore();
export type MessageStore = ReturnType<typeof createMessageStore>;
