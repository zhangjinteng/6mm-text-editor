# 稿定热门字体（本地资源）

列表依据 2026-11-01 稿定编辑器「字体 → 热门」的 53 个条目，保持该列表顺序。
项目使用 `GD-<稿定字体 ID>` 作为 CSS 别名，以区分同一字体的不同字重；菜单显示原名称。

- `fonts.css`：本地 `@font-face`，按字符范围加载 WOFF 分片。
- 各 ID 目录：完整字符映射对应的字体分片或作者发布的完整字体。
- `manifest.json`：逐字体来源、逐文件 SHA-256 和大小。
- `FONT-NOTICES.json`：原字体内的名称、作者、版权及许可元数据，不改写原声明。
- `src/fonts.generated.json`：应用内使用的名称与 ID 清单。

49 个字体来自稿定公开字体 CDN 的完整字符映射；4 个映射返回 404 的字体使用作者发布版本：

| 稿定列表名称 | 作者来源 | 文件说明 |
| --- | --- | --- |
| 标小智龙珠体 | https://github.com/maoken-fonts/LongZhuTi | 作者说明公开仓库版与冠名版字体内容相同；保留 OFL.txt |
| 汇文港黑 Medium | https://huozi.cool/ | 作者提供的汇文港黑 v1.001 完整字体，内部样式名为 Regular |
| 写意体 Regular | https://github.com/Steve-Yuu/YShi-Written | 作者发布的完整 YShi-Written 字体；保留 OFL.txt |
| 余繁细柳体 ExtraLight | https://github.com/chilingg/yufanxiliu | 作者 v1.0 发布的 YuFanXiLiu.otf，内部样式名为 Light；保留 LICENSE |

这四份文件为同名字体的作者版本，未声称与稿定当前托管版本逐字节一致。
所有字体保留原始文件及版权信息，具体许可按各作者声明执行；本目录不改变字体授权。

在项目根目录运行 `node scripts/verify-fonts.mjs` 校验文件和 CSS 引用。
编辑、文字效果预览、文档预览和打印从本项目加载字体；HTML 导出会内嵌文档所用字体分片，可离线打开。
JSON 备份保留字体 ID，重新导入本项目即可使用本地字体资源。
