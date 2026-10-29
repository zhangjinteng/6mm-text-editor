# 6mm-tinymce Vue 编辑器

## 启动

```sh
git clone --recurse-submodules https://github.com/zhangjinteng/6mm-text-editor.git
cd 6mm-text-editor
pnpm install
make dev
```

`make` 或 `make start` 也可启动。默认端口为 `5184`。启动前会检查端口：本项目的旧 Vite 服务会先被停止，等待端口释放后再启动；其他程序占用时不会误杀，会提示改用 `make dev PORT=5185` 或手动处理。按 `Ctrl+C` 或执行 `make stop` 停止本项目服务。

使用 `http://localhost:5184`，不要直接打开 index.html。编辑器本体使用本项目 `6mm-tinymce/` 内的源码，不再连接 Tiny Cloud，也不再使用 `VITE_TINYMCE_API_KEY`。原有 `.env`、`.env.local`、本地文档和版本数据保持不变；B 站配置仍仅在服务端使用。

需要 Node.js 22+、pnpm 和 Bun（源码仓库要求 Bun workspaces）。首次启动会构建源码，后续启动会校验源码指纹并复用本地构建。源码以子模块固定版本。源码目录缺失或未初始化时，先执行：

```sh
git submodule update --init --recursive
```

当前编辑器源码的本地修复保存在 `patches/6mm-tinymce.patch`，准备/构建时自动应用；如果与手动修改冲突，会停止并提示处理。补丁应用后子模块显示为已修改是预期状态。

## 源码构建

```sh
pnpm editor:build
```

该命令在 `6mm-tinymce/` 中执行 `bun install --frozen-lockfile` 和官方 `bun run build`，将 `modules/tinymce/js/tinymce/` 的构建产物同步到 `public/vendor/tinymce/`。该目录只保存自动生成的编辑器资源，已忽略提交，不要在其中手改源码。Vue 组件通过 `tinymce-script-src="/vendor/tinymce/tinymce.min.js"` 加载它，插件、模型、图标、皮肤和语言文件也从本机加载。未提供 CDN 回退。

修改源码后再次运行 `pnpm editor:build` 并刷新页面。`pnpm dev` 和 `pnpm build` 也会检测源码提交/本地修改，必要时重建。若已手动在源码目录执行完 `bun run build`，可用 `pnpm editor:sync` 仅同步现有产物。`BUN_BIN` 可指定 Bun 的完整可执行路径。

`/vendor/tinymce/build-info.json` 记录源码仓库、提交、源码指纹、版本、插件清单和核心脚本 SHA-256。当前源码版本为 8.10.0。父项目的 npm `tinymce` 依赖仅用于 Vue 集成的 peer/type 声明，不作为浏览器运行时来源。

## 功能范围

- Vue 3 + 官方 `@tinymce/tinymce-vue` 6.3，编辑器和插件来自自己的 6mm-tinymce 源码构建。
- 开源仓库共 29 个插件：默认加载 28 个，另外的 `autoresize` 可在配置中开启。覆盖文字格式、字体、颜色、表格、图片、本地图片嵌入、媒体、代码块、预览、打印、查找替换、折叠区块、锚点、分页及表情等。
- 文档自动保存到当前浏览器 localStorage，手动保存创建本地版本，最多 20 版。该本地版本面板是试用项目自身实现，不依赖商业 Revision History 插件。
- HTML 源码编辑、沙箱隔离预览，导入 HTML/TXT/JSON，导出 HTML/TXT/JSON；直播弹幕面板和诊断日志继续保留。
- 中文使用 `tinymce-i18n` 的本地语言文件，同步保留其许可证和声明。

## 许可及高级插件边界

本地源码遵守原仓库 GPLv2+，使用 `license-key="gpl"`，保留 LICENSE 和 NOTICES；复制到自己的 GitHub 仓库不会改变许可。中文语言包的适用许可见输出目录 `langs/LICENSE.md`。闭源商业部署仍需独立确认许可义务或取得适用商业授权。

当前自有仓库不包含商业高级插件源码，因此不再加载先前云端试用的 PowerPaste、批注、提及、修订建议、商业修订历史、公式、Word/PDF 转换、内联 CSS、AI、Uploadcare、Tiny Drive 等，也不请求这些插件的云端脚本。没有伪造替代实现、破解或绕过授权。

## 验证

```sh
pnpm build
pnpm test
```

测试使用本机 Google Chrome。编辑器测试拦截 Tiny Cloud 请求，并校验实际脚本与源码构建产物逐字节一致。覆盖持久化、刷新、源码、导入导出、插件加载、配置切换及窄屏布局。直播协议测试使用本地模拟，不消耗真实 B 站场次。示例图片本身仍来自 Unsplash，不属于编辑器运行时依赖。

资料：[自有源码](https://github.com/zhangjinteng/6mm-tinymce)、[Vue 集成](https://github.com/tinymce/tinymce-vue)、[自托管许可证配置](https://www.tiny.cloud/docs/tinymce/latest/license-key/)。

## B 站直播弹幕

右上角“直播弹幕”打开面板，点击“连接直播间”。支持弹幕、醒目留言、礼物和大航海消息，可搜索、筛选、多选后插入正文；默认包含用户名。消息不自动写入文档，最多保留最近 300 条内存记录。插入后进入现有自动保存流程，支持撤销。

服务端配置放在忽略提交的 `.env.local`：`BILI_ACCESS_KEY_ID`、`BILI_ACCESS_KEY_SECRET`、`BILI_APP_ID`、`BILI_IDENTITY_CODE`。不要加 `VITE_` 前缀。浏览器只拿到本次场次的短期弹幕认证信息，不接触 Access Key Secret。WebSocket 使用附件提供的官方 SDK 原文件，出处见 `public/vendor/bilibili/NOTICE.md`。

`server/bilibili.ts` 通过 Vite 的开发和预览中间件提供同源接口，固定调用官方 `live-open.biliapi.com`。正常使用时持续每 20 秒维护场次心跳，浏览器每 15 秒更新活跃状态，不按固定时长重建场次。

“暂停接收”只关闭浏览器 WebSocket，后端继续每 20 秒心跳，最多保留场次 10 分钟。暂停后的状态轮询、刷新或重复暂停不会延长这个期限，页面显示保留截止时间；“恢复接收”优先复用同一浏览器的场次，超过一次心跳周期未确认有效时先验证心跳，并合并并发验证/创建请求。“结束场次”立即调用结束接口；收起面板不暂停。页面关闭后，从最后一次活跃状态起最多保留 10 分钟。

临时网络错误、平台限流不会因连续两次心跳失败就立即销毁场次，继续按原间隔重试；明确的场次过期（心跳错误 7003）会清理失效缓存。重连验证遇到临时错误时不会盲目创建第二个场次，一个心跳周期内重复点击复用失败结果，避免密集验证。暂停、失败及闲置状态的轮询不延长浏览器活跃期限。保留到期会调用 `/end`，失败记录日志并在后续心跳周期重试释放。服务重启会清理内存场次，不将认证信息写入磁盘；10 分钟是本地最大保留策略，不保证平台凭证在此期间必定有效，也不绕过平台 `4009` 限制。

这是单用户本机试用集成，只允许 localhost/127.0.0.1 Host，使用 HttpOnly 会话 Cookie、同源校验和自定义请求头限制访问；同一时刻只允许一个浏览器拥有连接。正式公开部署需要独立的登录鉴权、用户隔离、限流、HTTPS 和服务端托管，不应直接把 Vite 开发服务暴露到公网。B 站是否允许连接取决于应用审核、身份码有效性及开发者权限，业务错误码会直接显示。

### 多个弹幕区独立订阅

连接直播间后，给源码中的每个外层 `div` 加上绑定属性，点击源码窗口的“保存”或 HTML 页签的“应用修改”即生效：

```html
<div data-danmaku-id="chat-a" data-danmaku-source="current" data-danmaku-skin="simple"><p>等待消息</p></div>
<div data-danmaku-id="chat-b" data-danmaku-source="current" data-danmaku-skin="card"><p>等待消息</p></div>
<div data-danmaku-id="chat-c" data-danmaku-source="current" data-danmaku-skin="blivechat"><p>等待消息</p></div>
```

- `data-danmaku-source`：`current` 跟随当前直播间；`bilibili:23975022` 订阅指定房间已进入本页仓库的消息。这是来源过滤，不会另开连接。
- `data-danmaku-skin`：`simple` 简洁列表、`card` 卡片、`blivechat` 主要消息 DOM 结构适配。最后一种不是原项目的完整运行时，也不包含置顶 ticker。三套内置模板不执行导入 HTML 中的脚本；原有内部 HTML 保留为静态回退，绑定后展示所选模板。
- `data-danmaku-id`：可省略，自动生成；复制导致重复时自动修正。
- `data-danmaku-x="34"`、`data-danmaku-y="32"`：以像素指定相对于定位包含块的 X/Y 坐标，优先于旧的 `left/top/inset`；支持负数、小数，空值或非法值忽略，缺失轴保留现有坐标。有效坐标自动启用绝对定位，不必在 style 中手写坐标。拖动松开时同时更新这两个属性和实际样式，撤销重做同步恢复。
- 编辑器内可直接按住弹幕容器拖动，松开后将绝对位置写入容器样式，支持撤销重做及刷新恢复；移动过程不写入文档，Esc 取消。添加 `data-danmaku-draggable="false"` 可禁用拖动。移动范围为编辑器文档，预览和静态导出只展示保存的位置。
- `data-danmaku-types="gift,guard,superchat"`：按类型过滤；默认 `all`，可选 `chat/gift/guard/superchat/entry`，多个用英文逗号隔开。
- `data-danmaku-limit="50"`：显示最近多少条匹配消息，默认 50，范围 1—300。
- `data-danmaku-paused="true"`：冻结当前区域；删除该属性或改成 `false` 后恢复并回放最新消息。

右侧面板与所有区域共用一个连接和最近 300 条内存消息。初次绑定立即回放；切换皮肤、撤销重做、删除区域、重建编辑器会协调各自订阅。区域之间使用 Shadow DOM 隔离样式，绑定区域不支持嵌套。无效配置在对应区域显示错误，其他区域继续工作。

源码、自动保存、JSON 备份保留声明和静态回退，不写入实时消息或新增撤销记录。预览继续订阅；HTML 导出带有当前消息的静态快照，使用浏览器原生声明式 Shadow DOM（建议用当前 Chrome 打开），不需要脚本或在线直播连接。导出文件重新导入应用后按绑定属性恢复实时订阅。历史消息不存 localStorage，刷新后等待服务器后续消息。

当前上游适配器接收弹幕、礼物、上舰、醒目留言；主播/房管身份仅在消息明确提供对应标记时显示，不根据昵称推断。`entry` 过滤与模板已预留，但当前接入未提供进房事件，页面不会生成虚假进房消息。

完整示例见 `public/examples/danmaku.html`，也可从直播面板的“自动订阅”帮助中下载后导入。

### 诊断日志

日志自动写入 `.data/logs/bilibili/bilibili-YYYY-MM-DD.jsonl`，按 UTC 日期分文件，保留最近 7 天，开发和预览服务均可用。目录已由 `.gitignore` 中的 `.data/` 排除。错误和警告同时打印到启动终端。日志写入失败只在终端提示，不改变直播请求结果。

每行一个 JSON 对象，包含 UTC 时间、进程 PID、服务实例 ID 及事件。B 站请求记录接口路径、请求 ID、开始时间、耗时、HTTP 状态、平台业务码、平台请求 ID（若有）、Retry-After（若有）、距同接口上次调用间隔。开始、成功和失败均记录，因此可以区分“尚未完成”和“已恢复”。本地错误响应包含 `requestId`，可据此检索日志。

针对 `4009`，请求日志额外记录以下证据（均为观测值，不把错误码直接解释为频率超限）：

- `requestContext`：凭证及主播配置的 HMAC 指纹（可跨重启比较，Secret 更换后指纹也会变化）、实际请求的场次标签及其与本地会话是否一致、参数名、请求 appId、正文长度和实际签名时间戳。启动成功的 `returnedGameTag` 可与心跳/结束请求的 `gameTag` 核对；不记录正文、签名或原始凭证。
- 同一进程内距任意接口上次请求的间隔、最近 60 秒三个接口各自的请求数（包含当前请求，窗口最多保存 1,000 次请求），以及会话年龄、最近成功心跳及间隔、浏览器闲置时长、暂停状态和本地过期时间。请求频率只覆盖当前管理器，不能判断其他进程或应用是否共享平台额度。
- `responseContext`：分别保留响应头 `x-request-id`、`x-bili-trace-id` 和响应体 `request_id`，以及服务器 Date 和粗略时钟差；Date 只有秒级精度并受网络延迟影响，不能据此直接认定签名时钟错误。保留 Retry-After 和脱敏的平台消息（最多 1,024 字符），不记录任意响应头或响应 data。
- `endpointFailures`、`firstEndpointFailureAt`、`lastEndpointSuccessAt`：同一接口连续失败次数、这轮首次失败时间和最近成功时间；成功事件的 `recoveredFromFailures` 标明恢复前失败次数。

`restrictionReason: upstream_unspecified_access_restriction` 表示平台未提供具体限制原因，并非已经确认限流。若平台只返回“接口访问限制”，本地日志无法保证揭示平台内部规则；需携带 `upstreamRequestId`、`responseContext` 中的追踪 ID、UTC 时间及 appId 向平台追查。新增字段仅在更新后的服务加载后产生，历史日志无法补齐。

此外记录会话创建/结束及原因、心跳连续失败次数和恢复、WebSocket 认证失败/超时/重连、SDK 加载失败及本地状态查询失败。会话 ID 和浏览器会话只记录哈希标签。不会记录请求签名、Access Key、Secret、身份码、Cookie、完整认证响应或弹幕正文；浏览器诊断接口只接受限定事件名和数字错误码，不接收自由文本。

```sh
tail -f .data/logs/bilibili/bilibili-*.jsonl
rg '4009|heartbeat.failed|heartbeat.recovered' .data/logs/bilibili/
```

### bilibili 礼物表情

表情符号窗口新增“bilibili礼物”分类，支持按礼物名称或 ID 搜索并插入图片。
数据快照保存在 `src/data/bilibili-gifts.json`，包含接口来源、获取时间、礼物 ID、名称、价格及图片地址。配置来自房间 23975022 的礼物接口响应，活动和房间专属礼物可能变化；图片仍由哔哩哔哩 CDN 加载，JSON 不包含图片二进制文件。

手动更新本地快照后开发服务器会重新加载，发布版本需要重新构建：

```sh
pnpm gifts:update
```

### 图片裁剪

选中图片后，浮动工具栏提供“裁剪图片”。支持移动选区、拖动四角、百分比精调和 1:1 / 4:3 / 16:9 快捷范围。比例按钮设置初始选区，之后可继续自由调整；重置可恢复完整原图，取消和 Esc 不修改文档。

裁剪采用保留原始图片 URL 的 `object-view-box` 样式，支持本地和无 CORS 授权的远程图片，结果和范围保存在 HTML 中，支持撤销重做及再次裁剪。目前需要支持该属性的新版 Chrome / Edge；其他浏览器会提示不支持，预览和导出也应在支持该属性的浏览器中打开。

### 图片背景

选中图片后点击浮动工具栏“设为背景”，图片会等比居中铺满编辑区并位于内容底层，不接收点击或拖动，文字、弹幕和其他图片可继续编辑。每份文档保留一个背景，再设置另一张图片会替换旧背景。支持撤销重做、保存刷新、预览和 HTML 导出；使用“格式 → 移除图片背景”可清除背景。

### 画布背景颜色

点击编辑区空白处显示画布工具栏，可通过“背景颜色”选择色板颜色、自定义颜色或清除底色。颜色覆盖整个编辑区，不改变文字高亮或字体颜色，并随撤销重做、保存、预览和 HTML 导出保留。已有图片背景显示在底色上方；点击文字或图片后切回对应工具栏。
