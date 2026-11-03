# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: text-tool-groups.spec.ts >> 点击文字工具栏及分组的空白、边框和控件不会关闭，字号仍可编辑
- Location: tests/text-tool-groups.spec.ts:4:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('.tox-pop:visible [data-mce-name="textgroupcolor"]')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link "TinyMCE Studio" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e11]:
          - text: TinyMCE Studio
          - generic [ref=e12]: VUE PLAYGROUND
      - generic [ref=e14]:
        - textbox "文档名称" [ref=e15]: 创作手记
        - generic [ref=e16]: 已保存到本地
      - generic [ref=e19]:
        - button "新建文档" [ref=e20] [cursor=pointer]
        - button "导入文件" [ref=e22] [cursor=pointer]
        - button "保存文档" [ref=e25] [cursor=pointer]
        - button "导出" [ref=e31] [cursor=pointer]
        - button "编辑器配置" [ref=e38] [cursor=pointer]
    - navigation "文档视图" [ref=e42]:
      - generic [ref=e43]:
        - button "编辑" [ref=e44] [cursor=pointer]
        - button "HTML" [ref=e47] [cursor=pointer]
        - button "预览" [ref=e52] [cursor=pointer]
      - generic [ref=e56]:
        - generic [ref=e57]: 6mm · 本地
        - button "直播弹幕" [ref=e59] [cursor=pointer]
        - button "本地版本" [ref=e67] [cursor=pointer]:
          - generic [ref=e72]: 版本
          - generic [ref=e73]: "0"
        - button "插件 28" [ref=e74] [cursor=pointer]:
          - generic [ref=e77]: 插件
          - generic [ref=e78]: "28"
    - main [ref=e79]:
      - region "文档编辑区" [ref=e80]:
        - application [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - menubar [ref=e86]:
                - menuitem "文件" [ref=e87]
                - menuitem "编辑" [ref=e89]
                - menuitem "查看" [ref=e91]
                - menuitem "插入" [ref=e93]
                - menuitem "格式" [ref=e95]
                - menuitem "工具" [ref=e97]
                - menuitem "表格" [ref=e99]
                - menuitem "帮助" [ref=e101]
              - generic [ref=e103]:
                - toolbar [ref=e104]:
                  - group [ref=e105]:
                    - button "恢复" [ref=e106]
                    - button "重做" [disabled] [ref=e107]
                  - group [ref=e108]:
                    - button "保存" [ref=e109]
                    - button "恢复上次的草稿" [disabled] [ref=e110]
                  - group [ref=e111]:
                    - button "文本块段落" [ref=e112]:
                      - generic [ref=e113]: 段落
                    - button "字体PingFang SC,Microsoft YaHei,sans-serif" [ref=e117]:
                      - generic [ref=e118]: PingFang SC,Microsoft YaHei,sans-serif
                    - generic [ref=e122]:
                      - button "Decrease font size" [ref=e123]
                      - textbox [ref=e127]: 28px
                      - button "Increase font size" [ref=e128]
                  - group [ref=e132]:
                    - button "粗体" [ref=e133]
                    - button "斜体" [ref=e134]
                    - button "下划线" [ref=e135]
                    - button "删除线" [ref=e136]
                  - group [ref=e137]:
                    - button "文本颜色 黑色" [ref=e138]
                    - button "字体颜色菜单" [ref=e139]
                    - button "背景颜色 黑色" [ref=e142]
                    - button "背景颜色菜单" [ref=e143]
                  - group [ref=e146]:
                    - button "清除格式" [ref=e147]
                - toolbar [ref=e148]:
                  - group [ref=e149]:
                    - button "左对齐" [ref=e150]
                    - button "居中对齐" [ref=e151]
                    - button "右对齐" [ref=e152]
                    - button "两端对齐" [ref=e153]
                  - group [ref=e154]:
                    - button "无序列表" [ref=e155]
                    - button "无序列表" [ref=e156]
                    - button "有序列表" [ref=e159]
                    - button "有序列表" [ref=e160]
                  - group [ref=e163]:
                    - button "减少缩进" [disabled] [ref=e164]
                    - button "增加缩进" [ref=e165]
                    - button "行高" [ref=e166]
                  - group [ref=e170]:
                    - button "插入/编辑链接" [ref=e171]
                    - button "插入/编辑图片" [ref=e172]
                    - button "插入/编辑媒体" [ref=e173]
                    - button "表格" [ref=e174]
                  - group [ref=e178]:
                    - button "特殊字符" [ref=e179]
                  - group [ref=e180]:
                    - button "查找和替换" [ref=e181]
                - toolbar [ref=e182]:
                  - group [ref=e183]:
                    - button "源代码" [ref=e184]
                    - button "预览" [ref=e185]
                    - button "打印" [ref=e186]
                  - group [ref=e187]:
                    - button "插入折叠面板" [ref=e188]
                    - button "删除折叠面板" [ref=e189]
                  - group [ref=e190]:
                    - button "锚点" [ref=e191]
                    - button "分页符" [ref=e192]
                    - button "不间断空格" [ref=e193]
                    - button "插入日期/时间" [ref=e194]
                    - button "插入日期/时间菜单" [ref=e195]
                    - button "插入/编辑代码示例" [ref=e198]
                  - group [ref=e199]:
                    - button "由左到右" [ref=e200]
                    - button "由右到左" [ref=e201]
                  - group [ref=e202]:
                    - button "下标" [ref=e203]
                    - button "上标" [ref=e204]
                  - group [ref=e205]:
                    - button "显示区块边框" [ref=e206]
                    - button "显示不可见字符" [ref=e207]
                    - button "帮助" [ref=e208]
            - iframe [ref=e211]:
              - paragraph [ref=f1e2]: 工具栏保持显示
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
                - generic [aria-hidden] [ref=e216]: ›
                - button "span" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "7 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "直播弹幕面板" [ref=e233]:
        - generic [ref=e234]:
          - heading "直播弹幕" [level=2] [ref=e235]
          - button "收起直播弹幕" [ref=e236] [cursor=pointer]
        - generic [ref=e240]:
          - generic [ref=e241]:
            - strong [ref=e249]: 未连接
            - generic [ref=e250]: APP 1717059966646
            - button "连接直播间" [disabled] [ref=e251]
            - generic [ref=e254]: 连接正由其他浏览器使用
          - group [ref=e255]:
            - generic "自动订阅：给容器添加属性" [ref=e256]
          - generic [ref=e257]:
            - textbox "搜索弹幕" [ref=e262]:
              - /placeholder: 搜索弹幕或用户
            - combobox "弹幕类型" [ref=e263]:
              - option "全部" [selected]
              - option "弹幕"
              - option "醒目留言"
              - option "礼物"
              - option "大航海"
          - generic [ref=e264]:
            - generic [ref=e265]: 0 条消息 · 已选 0
            - button "清空弹幕" [disabled] [ref=e266]
          - generic [ref=e270]: 暂无弹幕消息
          - generic [ref=e279]:
            - generic [ref=e280]:
              - checkbox "包含用户名" [checked] [ref=e281]
              - text: 包含用户名
            - button "插入选中" [disabled] [ref=e282]
    - contentinfo [ref=e285]:
      - generic [ref=e286]: 编辑器已就绪
      - generic [ref=e288]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e289]: 最近保存 00:56
  - toolbar [ref=e292]:
    - group [ref=e293]:
      - button "背景颜色 黑色" [active] [ref=e294]
      - button "背景颜色菜单" [ref=e295]
      - button "背景透明度" [ref=e298]
      - button "切换位置：居右 / 居下" [ref=e299]
      - button "插入文字" [ref=e300]
      - button "插入图片" [ref=e301]
      - button "表情符号" [ref=e302]
      - button "源代码" [ref=e303]
      - button "预览" [ref=e304]
      - button "全屏" [ref=e305]
```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test';
  2  | 
  3  | export async function openTextGroup(page: Page, group: 'style' | 'color' | 'paragraph') {
  4  |   const panel = page.locator(`[data-toolbar-group="textgroup${group}"]`);
> 5  |   if (!await panel.isVisible()) await page.locator(`.tox-pop:visible [data-mce-name="textgroup${group}"]`).click();
     |                                                                                                            ^ Error: locator.click: Test timeout of 90000ms exceeded.
  6  |   await expect(panel).toBeVisible();
  7  |   return panel;
  8  | }
  9  | 
  10 | export async function textTool(page: Page, name: string) {
  11 |   if (['fontfamily', 'fontsizeinput', 'plus', 'minus'].includes(name)) return page.locator(`.tox-pop:visible [data-mce-name="${name}"]`);
  12 |   const group = ['forecolor', 'forecolor-chevron', 'backcolor', 'backcolor-chevron'].includes(name) ? 'color'
  13 |       : /^h[1-6]$/.test(name) || ['ltr', 'rtl', 'blockquote'].includes(name) ? 'paragraph' : 'style';
  14 |   return (await openTextGroup(page, group)).locator(`[data-mce-name="${name}"]`);
  15 | }
  16 | 
```