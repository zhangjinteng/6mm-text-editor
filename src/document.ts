import { animationStyles } from './animations';

export interface Revision {
  revisionId: string;
  createdAt: string;
  content: string;
  author: { id: string; name: string };
}

export interface Draft {
  title: string;
  content: string;
  updatedAt: string;
  revisions: Revision[];
}

export const DRAFT_KEY = 'test44.tinymce.document.v1';
export const SETTINGS_KEY = 'test44.tinymce.settings.v1';
export const author = { id: 'local-author', name: '本地用户' };

export const sampleContent = `
<p style="color: #147d64; font-size: 11pt;"><strong>工作手记 / 001</strong></p>
<h1>把想法，写成作品。</h1>
<p style="color: #63706d; font-size: 13pt;">一份关于专注、表达与创造的工作记录。</p>
<figure class="image"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=85" alt="桌面上的笔记本、书籍和写作工具" width="800" height="320" style="width: 100%; height: auto;" /><figcaption>留一点空间，给下一个好想法。</figcaption></figure>
<h2>01 / 从一个清晰的想法开始</h2>
<p>好的表达不必复杂。把重要的事情放在前面，让每一个段落都有自己的方向，也让每一张图片、每一处留白有存在的理由。</p>
<blockquote><p>写作不是把所有东西放进来，而是找到真正值得留下的部分。</p></blockquote>
<h2>02 / 本周工作安排</h2>
<table style="border-collapse: collapse; width: 100%;" border="1"><thead><tr style="background-color: #edf5f1;"><th>事项</th><th>负责人</th><th>状态</th></tr></thead><tbody><tr><td>整理创意与参考资料</td><td>林晓</td><td>已完成</td></tr><tr><td>完成第一版内容</td><td>陈予</td><td>进行中</td></tr><tr><td>校对与发布</td><td>周宁</td><td>待开始</td></tr></tbody></table>
<h2>03 / 下一步</h2><ul><li>梳理文章结构与核心观点</li><li>补充图片、引用和数据</li><li>与团队一起完成最后一轮审阅</li></ul>
<p>让每一次记录，都成为下一次出发的起点。</p>`;

/** Read only validated local drafts; corrupted storage must not prevent startup. */
export function readDraft(): Draft {
  try {
    const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (value && typeof value.content === 'string' && typeof value.title === 'string') {
      return {
        title: value.title,
        content: value.content,
        updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
        revisions: Array.isArray(value.revisions) ? value.revisions.filter((r: Revision) =>
          r && typeof r.revisionId === 'string' && typeof r.content === 'string' &&
          typeof r.createdAt === 'string' && r.author?.id && r.author?.name).slice(0, 20) : []
      };
    }
  } catch { /* A new document remains usable when storage is unavailable. */ }
  return { title: '创作手记', content: sampleContent, updatedAt: '', revisions: [] };
}

/** Save atomically before reporting success, retaining at most twenty explicit revisions. */
export function persistDraft(draft: Draft, withRevision = false): Draft {
  const updatedAt = new Date().toISOString();
  const revisions = [...draft.revisions];
  if (withRevision && revisions[0]?.content !== draft.content) {
    revisions.unshift({ revisionId: crypto.randomUUID(), createdAt: updatedAt, content: draft.content, author });
  }
  const saved = { ...draft, updatedAt, revisions: revisions.slice(0, 20) };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(saved));
  return saved;
}

export const contentStyles = `
${animationStyles}
span[data-text-draggable] { display: inline-block; }
body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; color: #25342f; font-size: 15px; line-height: 1.9; letter-spacing: 0; min-height: 100vh; isolation: isolate; box-sizing: border-box; margin: 0; padding: 0; overflow-wrap: break-word; }
h1 { font-size: 32px; line-height: 1.4; margin: 16px 0; font-weight: 650; }
h2 { font-size: 21px; margin-top: 32px; line-height: 1.5; }
h3 { font-size: 18px; } a { color: #147d64; }
.document-background-color { position: fixed; inset: 0; z-index: -2; pointer-events: none; user-select: none; margin: 0; border: 0; padding: 0; }
img[data-document-background] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; min-width: 0 !important; min-height: 0 !important; max-width: none !important; max-height: none !important; margin: 0 !important; padding: 0 !important; border: 0 !important; border-radius: 0 !important; object-fit: cover !important; object-position: center !important; transform: none !important; z-index: -1 !important; pointer-events: none !important; user-select: none !important; }
img, video, iframe { max-width: 100%; } figure.image { margin: 28px 0; } figure img { border-radius: 4px; }
figcaption { color: #7c8580; font-size: 12px; text-align: center; margin-top: 6px; }
blockquote { border-left: 3px solid #147d64; margin: 24px 0; padding: 2px 24px; color: #63706d; background: #f5f8f6; }
table { width: 100%; } td, th { border: 1px solid #dce4df; padding: 10px 14px; text-align: left; }
pre { background: #f0f3f2; padding: 16px; overflow: auto; } .mention { color: #147d64; }
@media (max-width: 600px) { h1 { font-size: 26px; } }
`;

/** Use a parsed document so full-page HTML and ordinary fragments both export correctly. */
export function documentHtml(content: string, title: string, preview = false): string {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  doc.documentElement.lang = 'zh-CN';
  doc.title = title;
  const charset = doc.createElement('meta');
  charset.setAttribute('charset', 'utf-8');
  doc.head.prepend(charset);
  const style = doc.createElement('style');
  style.textContent = contentStyles;
  doc.head.append(style);
  if (preview) {
    const csp = doc.createElement('meta');
    csp.httpEquiv = 'Content-Security-Policy';
    csp.content = "default-src 'none'; img-src https: data: blob:; media-src https: data: blob:; style-src 'unsafe-inline'; font-src https: data:; frame-src https:;";
    doc.head.prepend(csp);
  }
  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}
