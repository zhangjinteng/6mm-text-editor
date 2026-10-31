# Text Settings Basics Implementation Plan

**Goal:** 将悬浮文字工具栏的字体、字号、文字颜色、背景颜色移入文字设置弹窗。

**Architecture:** 在现有弹窗增加基础页，基础字段进入同一份草稿。只对改变的字段更新文字源，复用预览、校验、取消、应用和撤销流程。背景颜色仍是文字高亮，独立于背景效果。

**Tech Stack:** TypeScript, TinyMCE, CSS, Playwright.

### Task 1: 基础设置
- 修改 src/text-settings.ts 和 src/text-settings.css。
- 读取实际文字字体、字号、颜色和高亮；字体选项来自编辑器配置。
- 新增基础页、字号步进和颜色清除；预览和提交共享实现。
- 未修改字段保留原始混合格式；重置效果保留基础排版。

### Task 2: 精简悬浮工具栏
- 修改 src/text-dragging.ts、src/editor.ts，移除这四项，保留顶部主工具栏。
- 调整 src/text-tool-groups.ts 的焦点识别，避免依赖已移除的字体按钮。

### Task 3: 验证
- 在 tests/text-settings.spec.ts 覆盖预览隔离、取消、应用、重新打开、撤销及高级效果兼容。
- 更新受影响的旧工具栏测试。
- 运行 pnpm build 和相关 Playwright 用例，检查桌面及窄屏截图。

### 验证结果
- 文字设置、文字排版及工具栏共 13 项浏览器测试通过。
- 其他文字效果与画布回归 41 项通过，1 项在开发热更新时超时，单独重跑通过。
- 桌面、390 px 窄屏基础页截图已检查。
- vue-tsc、服务端 TypeScript、Vite 生产打包及 git diff --check 通过。
- pnpm build 的 TinyMCE 源码预构建因子项目缺少 grunt 失败；应用本身的类型检查与生产打包已单独完成。
