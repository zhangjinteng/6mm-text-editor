# TinyMCE 声明式弹幕订阅

## 需求与验收
沿用已确认方案：一个共享直播连接和最近 300 条消息仓库，多容器独立订阅。
在源码中给 div 添加 `data-danmaku-id`、`data-danmaku-source="current"`、`data-danmaku-skin`，源码保存后自动绑定。
预置 simple、card、blivechat 三种皮肤；支持消息类型过滤、条数上限、暂停。
现有示例 HTML 作为静态回退内容保留，声明绑定后显示实时内容。
不在文档中执行订阅脚本，不改变 TinyMCE 内核。

## 开发设计
- src/live/store.ts：内存消息仓库，去重、有界历史、即时回放、订阅清理、当前/指定直播间来源。
- src/live/session.ts：从 LivePanel 提升连接与会话生命周期，应用持有，面板仅展示和操作。
- src/bilibili.ts：保留可用的身份/头像/礼物/金额数据；无可用身份时不推断，协议未提供进房时不伪造。
- src/live/skins.ts：三套独立皮肤、安全文本节点渲染；blivechat 保留主要消息嵌套，不声称完整复刻上游。
- src/live/bindings.ts：扫描/协调容器，Shadow DOM 隔离运行时展示；实时内容不进入 HTML、撤销、自动保存；重复实例 ID 自动修正。
- src/editor.ts、src/App.vue：源码应用、撤销重做、重建的订阅生命周期；预览在同源 sandbox 下由父页面渲染，不执行文档脚本；HTML 导出物化当前快照。
- src/components/LivePanel.vue：消费共享状态，显示绑定帮助，保留手动插入。
- public/examples/danmaku.html：三个可直接导入的声明式区域示例。

属性约定：source=current 或 bilibili:房间号；skin=simple/card/blivechat；types=all 或 chat,gift,guard,superchat,entry；limit=1..300 默认50；paused=true 暂停并冻结本实例。
保存保留声明和静态回退，刷新后回放本次会话仓库历史。仓库不持久化直播消息。
导出 HTML 为静态快照，重新导入声明仍可绑定；JSON 文档备份只保存声明。

## TODO
- [x] 共享消息仓库与连接提升
- [x] 结构化消息与三套皮肤
- [x] TinyMCE 声明绑定、预览和导出
- [x] 帮助、三容器示例
- [x] 局部测试：独立订阅、生命周期、安全文本、源码、撤销、预览/导出
- [x] 完整应用测试及生产构建

验收：pnpm build 通过；pnpm test 通过（11 项服务端、17 项应用测试）。源码弹窗保存、空容器、去重/历史、独立过滤暂停、取消绑定、复制 ID 修正、嵌套恢复、撤销重做、重建、刷新、预览与无脚本 HTML 快照均已覆盖。

## 弹幕容器拖动（2026-10-29）
- [x] 编辑器内所有非嵌套绑定容器默认可拖动；`data-danmaku-draggable="false"` 禁用。
- [x] pointer capture 保持拖动；临时 head CSS 展示过程位置，不进入 HTML。
- [x] 松开一次提交 absolute 坐标，使用实际包含块原点适配父容器与文档滚动；支持撤销重做和自动保存。
- [x] Esc、pointercancel、源码替换、编辑器销毁释放拖动状态与事件。
- [x] 浏览器局部测试覆盖拖动、过程中不保存、刷新恢复、取消、禁用、父容器定位与后续消息接收；生产构建通过。

## 声明式 XY 坐标（2026-10-29）
- [x] `data-danmaku-x/y` 优先于内联旧定位，支持有限像素数值（负数/小数），缺失轴保留旧位置。
- [x] 统一定位 helper 应用于编辑器、预览、快照；坐标变更不重新订阅或重置暂停内容。
- [x] 拖动结束在同一个撤销事务中更新两属性及布局；源码属性被 TinyMCE schema 保留。
- [x] 测试覆盖声明定位、覆盖 inset、双向同步、撤销重做、刷新/预览、小数/负数/单轴/非法值。
