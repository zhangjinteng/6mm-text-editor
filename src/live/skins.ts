import type { LiveMessage } from '../bilibili';

export const skinNames = ['simple', 'card', 'blivechat'] as const;
export type SkinName = typeof skinNames[number];
const typeNames = { chat: '弹幕', gift: '礼物', guard: '上舰', superchat: '醒目留言', entry: '进房' };

/** 基础样式只进入区域 ShadowRoot，避免污染编辑器与其他皮肤。 */
export const skinStyles = `
:host{display:block;min-height:32px;font-family:"Microsoft YaHei","PingFang SC",sans-serif;color:#172b26;font-size:14px;line-height:1.65;text-align:left}
*{box-sizing:border-box}p{margin:0} .empty{color:#7b8782;padding:12px;font-size:12px}
.message{padding:8px 12px;overflow-wrap:anywhere}time{color:#87938e;font-size:11px;margin-right:8px}
.author{font-weight:600;margin-right:8px;color:#64736e}.owner .author{background:#ffd600;color:#222;padding:1px 5px;border-radius:3px}
.moderator .author{color:#5e84f1}.member .author{color:#0f9d58}.badge{font-size:10px;margin-right:8px;opacity:.75}
.avatar{width:24px;height:24px;object-fit:cover;border-radius:50%;margin-right:12px;flex:none;vertical-align:middle}
.card .message{margin:8px 0;border:1px solid #dce8e1;border-radius:8px;background:#fff;box-shadow:0 2px 6px #143d2410}
.card .gift,.simple .gift{background:#fff3e0;border-left:3px solid #fb8c00}.card .guard,.simple .guard{background:#e6f5ec;border-left:3px solid #0f9d58}
.card .superchat,.simple .superchat{background:#e3f2fd;border-left:3px solid #1565c0}.entry{color:#87938e;font-size:12px}
.card .body{display:block;margin-top:4px}.amount{font-weight:700;margin-right:8px}
yt-live-chat-renderer,yt-live-chat-item-list-renderer,yt-live-chat-membership-item-renderer,yt-live-chat-paid-message-renderer{display:block}
yt-live-chat-text-message-renderer{display:flex;align-items:flex-start;padding:4px 24px;overflow-wrap:anywhere}
yt-img-shadow{display:block;flex:none;border-radius:50%;overflow:hidden;margin-right:16px;width:24px;height:24px;background:#e8efeb}
yt-img-shadow img{display:block;width:100%;height:100%;object-fit:cover}
yt-live-chat-text-message-renderer #content{min-width:0;align-self:center}
yt-live-chat-author-chip{display:inline;margin-right:8px}#author-name{color:#757575}#timestamp{color:#999;font-size:11px;margin-right:8px}
[author-type="owner"] #author-name{background:#ffd600;color:#111;padding:1px 4px;border-radius:2px}
[author-type="moderator"] #author-name{color:#5e84f1}[author-type="member"] #author-name,.member#author-name{color:#0f9d58}
yt-live-chat-author-badge-renderer{display:inline-block;color:#0f9d58;font-size:10px;margin-left:4px}
yt-live-chat-paid-message-renderer,yt-live-chat-membership-item-renderer{padding:4px 24px;overflow-wrap:anywhere}
#card{border-radius:4px;overflow:hidden;box-shadow:0 2px 5px #0002}#header{display:flex;align-items:center;padding:8px 16px;background:#125aac;color:#fff}
#header yt-img-shadow{width:40px;height:40px}#header-content{display:flex;flex:1;min-width:0;justify-content:space-between;align-items:center}
#header-content-primary-column{min-width:0}#header #author-name{color:#ffffffbc}#purchase-amount{font-weight:600}#header #timestamp{color:#ffffffa0}
yt-live-chat-paid-message-renderer #content{padding:8px 16px;background:#1565c0;color:#fff}
yt-live-chat-membership-item-renderer #header{background:#0b8043}#header-subtext{color:#fff}
`;

/** 只使用文本节点填充用户内容；头像只允许 HTTP(S)，皮肤代码由应用注册。 */
export function renderMessages(doc: Document, skin: SkinName, messages: readonly LiveMessage[]): HTMLElement {
  function node(tag: string, text?: string, id?: string, scope?: string): HTMLElement {
    const element = doc.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (id) element.id = id;
    if (scope) element.className = `style-scope ${scope}`;
    return element;
  }
  function avatar(message: LiveMessage, scope?: string, size = 24) {
    const host = node(scope ? 'yt-img-shadow' : 'span', undefined, scope ? 'author-photo' : undefined, scope);
    host.classList.add(scope ? 'no-transition' : 'avatar');
    if (scope) { host.setAttribute('width', String(size)); host.setAttribute('height', String(size)); host.setAttribute('loaded', ''); }
    if (message.avatar && /^https?:\/\//.test(message.avatar)) {
      const image = doc.createElement('img'); image.src = message.avatar; image.alt = '';
      image.width = size; image.height = size;
      image.referrerPolicy = 'no-referrer';
      if (scope) { image.id = 'img'; image.className = 'style-scope yt-img-shadow'; }
      host.append(image);
    }
    return host;
  }
  function authorChip(message: LiveMessage, scope: string) {
    const chip = node('yt-live-chat-author-chip', undefined, undefined, scope);
    const name = node('span', message.name, 'author-name', 'yt-live-chat-author-chip');
    name.setAttribute('dir', 'auto'); name.setAttribute('type', message.role || '');
    if (message.guardLevel) name.classList.add('member');
    name.append(node('span', undefined, 'chip-badges', 'yt-live-chat-author-chip'));
    const badges = node('span', undefined, 'chat-badges', 'yt-live-chat-author-chip');
    if (message.role === 'moderator' || message.guardLevel) {
      const badge = node('yt-live-chat-author-badge-renderer', message.role === 'moderator' ? '房管' : ['', '总督', '提督', '舰长'][message.guardLevel || 0] || '舰队');
      badge.setAttribute('type', message.role === 'moderator' ? 'moderator' : 'member'); badges.append(badge);
    }
    chip.append(name, badges); return chip;
  }
  const wrapper = node('div'); wrapper.className = skin;
  wrapper.setAttribute('contenteditable', 'false');
  if (!messages.length) { const empty = node('p', '等待消息 · 连接直播间后自动显示'); empty.className = 'empty'; wrapper.append(empty); return wrapper; }
  let target = wrapper;
  if (skin === 'blivechat') {
    const renderer = node('yt-live-chat-renderer', undefined, undefined, 'yt-live-chat-app');
    const list = node('yt-live-chat-item-list-renderer', undefined, undefined, 'yt-live-chat-renderer');
    list.setAttribute('allow-scroll', '');
    const scroller = node('div', undefined, 'item-scroller', 'yt-live-chat-item-list-renderer');
    const offset = node('div', undefined, 'item-offset', 'yt-live-chat-item-list-renderer');
    target = node('div', undefined, 'items', 'yt-live-chat-item-list-renderer');
    offset.append(target); scroller.append(offset); list.append(scroller); renderer.append(list); wrapper.append(renderer);
  }
  for (const message of messages) {
    let item: HTMLElement;
    if (skin !== 'blivechat' || message.type === 'entry') {
      item = node('div'); item.className = `message ${message.type} ${message.role || ''}`;
      const time = node('time', message.time);
      const author = node('span', message.name); author.className = 'author';
      const label = node('span', typeNames[message.type]); label.className = 'badge';
      const body = node('span', message.text); body.className = 'body';
      item.append(time, author, label);
      if (message.price !== undefined && message.type === 'superchat') { const price = node('span', `¥${message.price.toFixed(2)}`); price.className = 'amount'; item.append(price); }
      item.append(body);
    } else if (message.type === 'chat') {
      const scope = 'yt-live-chat-text-message-renderer';
      item = node(scope, undefined, undefined, 'yt-live-chat-item-list-renderer');
      item.setAttribute('author-type', message.role || '');
      const content = node('div', undefined, 'content', scope);
      content.append(node('span', message.time, 'timestamp', scope), authorChip(message, scope), node('span', message.text, 'message', scope));
      item.append(avatar(message, scope), content);
    } else {
      const membership = message.type === 'guard';
      const scope = membership ? 'yt-live-chat-membership-item-renderer' : 'yt-live-chat-paid-message-renderer';
      item = node(scope, undefined, undefined, 'yt-live-chat-item-list-renderer');
      item.setAttribute(membership ? 'show-only-header' : 'allow-animations', '');
      const card = node('div', undefined, 'card', scope);
      const header = node('div', undefined, 'header', scope);
      const headerContent = node('div', undefined, 'header-content', scope);
      const primary = node('div', undefined, 'header-content-primary-column', scope);
      if (membership) {
        const inner = node('div', undefined, 'header-content-inner-column', scope);
        inner.append(authorChip(message, scope));
        primary.append(inner, node('div', message.text, 'header-subtext', scope));
      } else {
        primary.append(node('div', message.name, 'author-name', scope), node('div', message.price === undefined ? typeNames[message.type] : `¥${message.price.toFixed(2)}`, 'purchase-amount', scope));
      }
      headerContent.append(primary, node(membership ? 'div' : 'span', message.time, 'timestamp', scope));
      header.append(avatar(message, scope, 40), headerContent); card.append(header);
      if (!membership) {
        const content = node('div', undefined, 'content', scope);
        const body = node('div', message.text, 'message', scope); body.setAttribute('dir', 'auto'); content.append(body); card.append(content);
      }
      item.append(card);
    }
    item.setAttribute('data-message-id', message.id); target.append(item);
  }
  return wrapper;
}
