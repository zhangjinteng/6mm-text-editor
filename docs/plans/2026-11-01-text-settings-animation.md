# Text Settings Animation Implementation Plan

**Goal:** 将文字工具栏的动画入口移入文字设置弹窗，保留全部效果和播放设置。

**Architecture:** 新增动画选项卡，动画进入弹窗的同一份草稿、预览、校验、重置和单步撤销流程。保留现有动画属性与关键帧，兼容旧内容；独立定位外层保持静止，文字源及高级渲染层播放同步动画。

**Tech Stack:** TypeScript, TinyMCE, CSS, Playwright.

### Task 1: 动画草稿
- 在 src/animations.ts 统一读取、校验与写入动画，保留现有数据属性和样式。
- 将 src/animation-picker.ts 和 CSS 改为可嵌入的编辑组件，包含 12 种效果、无动画、时长、循环与总时长。

### Task 2: 弹窗与工具栏
- 在 src/text-settings.ts 增加动画选项卡及草稿字段，复用应用、取消和重置。
- 预览使用相同动画 CSS，在独立定位外层进行预览居中缩放，内部文字及效果图层播放动画。
- 从 src/editor.ts、src/text-dragging.ts 的文字工具栏移除动画按钮。

### Task 3: 验证
- 更新 tests/animations.spec.ts 覆盖全部效果、预览隔离、取消、循环参数校验、保存导出、旧内容、撤销和高级效果。
- 更新 tests/text-settings.spec.ts 和 tests/text-tool-groups.spec.ts 的入口与选项卡断言。
- 执行 pnpm build 及相关 Playwright 用例，查看桌面与窄屏截图。
