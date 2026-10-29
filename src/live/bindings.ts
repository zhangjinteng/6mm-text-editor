import type { Editor } from 'tinymce';
import { enableDanmakuDragging } from './drag';
import { enableObjectSelection } from '../object-selection';
import { applyDanmakuPosition } from './position';
import type { LiveMessage } from '../bilibili';
import { liveMessages, type MessageStore } from './store';
import { renderMessages, skinNames, skinStyles, type SkinName } from './skins';

const selector = 'div[data-danmaku-source]';
const attributes = ['data-danmaku-id', 'data-danmaku-source', 'data-danmaku-skin', 'data-danmaku-types', 'data-danmaku-limit', 'data-danmaku-paused'];
const messageTypes = ['chat', 'gift', 'guard', 'superchat', 'entry'];
interface Configuration { source: string; skin: SkinName; types: string[]; limit: number; paused: boolean }

/** 声明只引用注册的消息源和皮肤，错误配置局部显示，不影响其他实例。 */
function configuration(element: Element): Configuration {
  const source = element.getAttribute('data-danmaku-source') || '';
  if (source !== 'current' && !/^bilibili:\d+$/.test(source)) throw new Error('消息源应为 current 或 bilibili:房间号');
  const skin = element.getAttribute('data-danmaku-skin') || 'simple';
  if (!skinNames.includes(skin as SkinName)) throw new Error(`未知皮肤 ${skin}，可选 simple / card / blivechat`);
  const filter = element.getAttribute('data-danmaku-types') || 'all';
  const types = filter === 'all' ? [] : filter.split(',').map((type) => type.trim());
  if (types.some((type) => !messageTypes.includes(type))) throw new Error('消息类型应为 chat / gift / guard / superchat / entry');
  const limit = Number(element.getAttribute('data-danmaku-limit') || 50);
  if (!Number.isInteger(limit) || limit < 1 || limit > 300) throw new Error('显示条数应为 1 到 300 的整数');
  return { source, skin: skin as SkinName, types, limit, paused: element.getAttribute('data-danmaku-paused') === 'true' };
}

function filterMessages(messages: readonly LiveMessage[], config: Configuration) {
  return messages.filter((message) => !config.types.length || config.types.includes(message.type)).slice(-config.limit);
}

interface Binding { key: string; config?: Configuration; last: readonly LiveMessage[]; unsubscribe: () => void }
export interface Bindings { reconcile: () => void; dispose: () => void; snapshot: (html: string) => string }

/**
 * Shadow DOM 承载实时视图，light DOM 保留原始回退内容；getContent 和撤销记录不包含直播流。
 * 每个容器独立订阅；源码应用/撤销/移除/重挂载时协调订阅，销毁时释放。
 */
export function bindDanmaku(root: HTMLElement, store: MessageStore = liveMessages, setStyles?: (element: HTMLElement, styles: Record<string, string>) => void): Bindings {
  const bindings = new Map<HTMLElement, Binding>();
  let disposed = false;
  let queued = false;
  const doc = root.ownerDocument;

  function draw(element: HTMLElement, config: Configuration, messages: readonly LiveMessage[]) {
    const shadow = element.shadowRoot || element.attachShadow({ mode: 'open' });
    const style = doc.createElement('style'); style.textContent = skinStyles;
    shadow.replaceChildren(style, renderMessages(doc, config.skin, filterMessages(messages, config)));
  }
  function reconcile() {
    if (disposed) return;
    const elements = new Set(Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => !element.parentElement?.closest(selector)));
    for (const [element, binding] of bindings) {
      if (!elements.has(element)) {
        binding.unsubscribe(); bindings.delete(element);
        // 取消绑定后恢复原来的静态内容，ShadowRoot 本身无法 detach。
        if (element.shadowRoot) element.shadowRoot.replaceChildren(doc.createElement('slot'));
      }
    }
    const ids = new Set<string>();
    for (const element of elements) {
      applyDanmakuPosition(element, setStyles);
      let id = element.getAttribute('data-danmaku-id');
      if (!id || ids.has(id)) { id = `chat-${crypto.randomUUID()}`; element.setAttribute('data-danmaku-id', id); }
      ids.add(id);
      const key = attributes.map((attribute) => element.getAttribute(attribute)).join('\u0000');
      const previous = bindings.get(element);
      if (previous?.key === key) continue;
      previous?.unsubscribe();
      const binding: Binding = { key, last: [], unsubscribe: () => {} };
      bindings.set(element, binding);
      try {
        const config = configuration(element); binding.config = config;
        if (config.paused && previous?.config?.source === config.source) binding.last = previous.last;
        else binding.last = store.snapshot(config.source);
        draw(element, config, binding.last);
        binding.unsubscribe = store.subscribe(config.source, (messages) => {
          if (config.paused) return;
          binding.last = messages; draw(element, config, messages);
        });
      } catch (cause) {
        const shadow = element.shadowRoot || element.attachShadow({ mode: 'open' });
        const error = doc.createElement('p'); error.style.cssText = 'color:#b42318;font:13px sans-serif;padding:12px';
        error.textContent = `弹幕绑定失败：${cause instanceof Error ? cause.message : String(cause)}`;
        shadow.replaceChildren(error);
      }
    }
  }
  const observer = new MutationObserver(() => {
    if (queued || disposed) return;
    queued = true;
    queueMicrotask(() => { queued = false; reconcile(); });
  });
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: [...attributes, 'data-danmaku-x', 'data-danmaku-y'] });
  reconcile();
  return {
    reconcile,
    dispose() {
      disposed = true; observer.disconnect();
      for (const [element, binding] of bindings) {
        binding.unsubscribe();
        if (element.shadowRoot) element.shadowRoot.replaceChildren(doc.createElement('slot'));
      }
      bindings.clear();
    },
    /** 导出为无脚本的声明式 Shadow DOM 快照；原始声明和回退内容依旧保留。 */
    snapshot(html: string) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      for (const element of parsed.querySelectorAll<HTMLElement>(selector)) {
        if (element.parentElement?.closest(selector)) continue;
        try {
          applyDanmakuPosition(element);
          const config = configuration(element);
          const original = Array.from(bindings).find(([node]) => node.getAttribute('data-danmaku-id') === element.getAttribute('data-danmaku-id'))?.[1];
          const messages = original?.last || store.snapshot(config.source);
          // 删除旧快照，避免重复导出叠加 template。
          for (const child of Array.from(element.children)) if (child.matches('template[shadowrootmode]')) child.remove();
          const template = parsed.createElement('template'); template.setAttribute('shadowrootmode', 'open');
          const style = parsed.createElement('style'); style.textContent = skinStyles;
          template.content.append(style, renderMessages(parsed, config.skin, filterMessages(messages, config)));
          element.prepend(template);
        } catch { /* 无效声明保持原文，避免因一个区域阻断整份文档导出。 */ }
      }
      return /^\s*<!doctype|<html[\s>]/i.test(html) ? '<!DOCTYPE html>\n' + parsed.documentElement.outerHTML : parsed.body.innerHTML;
    }
  };
}

/** 接入 TinyMCE 生命周期；不使用实时消息触发 editor.change 或 setContent。 */
export function bindDanmakuEditor(editor: Editor): Bindings {
  const bindings = bindDanmaku(editor.getBody(), liveMessages, (element, styles) => editor.dom.setStyles(element, styles));
  const stopSelection = enableObjectSelection(editor);
  const stopDragging = enableDanmakuDragging(editor);
  const reconcile = () => bindings.reconcile();
  editor.on('SetContent Undo Redo', reconcile);
  editor.on('remove', () => { editor.off('SetContent Undo Redo', reconcile); stopSelection(); stopDragging(); bindings.dispose(); });
  return bindings;
}
