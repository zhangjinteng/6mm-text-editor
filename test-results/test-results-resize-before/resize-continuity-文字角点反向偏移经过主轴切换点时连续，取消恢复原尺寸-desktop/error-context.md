# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resize-continuity.spec.ts >> 文字角点反向偏移经过主轴切换点时连续，取消恢复原尺寸
- Location: tests/resize-continuity.spec.ts:36:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3
Received:   82
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
                    - button "恢复" [disabled] [ref=e106]
                    - button "重做" [disabled] [ref=e107]
                  - group [ref=e108]:
                    - button "保存" [ref=e109]
                    - button "恢复上次的草稿" [disabled] [ref=e110]
                  - group [ref=e111]:
                    - button "文本块段落" [ref=e112]:
                      - generic [ref=e113]: 段落
                    - button "字体思源黑体 常规" [ref=e117]:
                      - generic [ref=e118]: 思源黑体 常规
                    - generic [ref=e122]:
                      - button "Decrease font size" [ref=e123]
                      - textbox [ref=e127]: 20px
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
            - iframe [active] [ref=e211]:
              - generic [active] [ref=f1e1]:
                - paragraph
                - paragraph:
                  - generic [ref=f1e3]: 平滑缩放文字
                - paragraph [ref=f1e6]: 等待消息 · 连接直播间后自动显示
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
                - generic [aria-hidden] [ref=e216]: ›
                - button "span" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "6 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "文字配置面板" [ref=e233]:
        - generic "文字设置" [ref=e235]:
          - generic [ref=e236]:
            - generic [ref=e237]:
              - heading "文字配置" [level=2] [ref=e238]
              - paragraph [ref=e239]: 调整即时生效，可撤销
            - button "收起文字配置" [ref=e240] [cursor=pointer]: ×
          - generic [ref=e242]:
            - tablist "文字设置分类" [ref=e243]:
              - tab "基础" [selected] [ref=e244] [cursor=pointer]
              - tab "样式" [ref=e245] [cursor=pointer]
              - tab "段落" [ref=e246] [cursor=pointer]
              - tab "排版" [ref=e247] [cursor=pointer]
              - tab "外观" [ref=e248] [cursor=pointer]
              - tab "填充" [ref=e249] [cursor=pointer]
              - tab "变形" [ref=e250] [cursor=pointer]
              - tab "动画" [ref=e251] [cursor=pointer]
              - tab "对象" [ref=e252] [cursor=pointer]
            - tabpanel "基础" [ref=e253]:
              - generic [ref=e254]:
                - text: 字体
                - combobox "字体" [ref=e255]:
                  - option "Aa剑豪体 Regular"
                  - option "阿朱泡泡体"
                  - option "标小智龙珠体"
                  - option "标小智无界黑"
                  - option "点点像素体"
                  - option "抖音美好体"
                  - option "二字元心游手绘"
                  - option "汉字之美斑驳标宋 特黑"
                  - option "鸿雷板书简体"
                  - option "鸿雷拙书简体"
                  - option "汇文港黑 Medium"
                  - option "汇文明朝体"
                  - option "胡晓波男神体"
                  - option "胡晓波青年宋 粗"
                  - option "胡晓波骚包体"
                  - option "胡晓波刷刷体 Regular"
                  - option "胡晓波影隶简体 Regular"
                  - option "胡晓波真帅体"
                  - option "江西拙楷"
                  - option "荆南缘默体"
                  - option "快去写作业-CJK 常规 Regular"
                  - option "励字侠义简繁"
                  - option "沐瑶软笔手写体"
                  - option "庞门正道粗书体"
                  - option "庞门正道真贵楷体"
                  - option "清松手写体"
                  - option "锐字真言体免费商用"
                  - option "手书体"
                  - option "文鼎新艺体"
                  - option "小濑字体"
                  - option "写意体 Regular"
                  - option "演示佛系体"
                  - option "演示秋鸿楷"
                  - option "优设标题黑"
                  - option "优设标题圆"
                  - option "有字库龙藏体"
                  - option "余繁细柳体 ExtraLight"
                  - option "站酷快乐体"
                  - option "钟齐志莽行书"
                  - option "字恋狂深夜简繁"
                  - option "字体圈欣意冠黑体"
                  - option "字由棒棒体"
                  - option "字由芳华体"
                  - option "字由文艺黑"
                  - option "字制区喜脉喜欢体"
                  - option "Fondamento Regular"
                  - option "Molle"
                  - option "Open Sans Bold"
                  - option "Open Sans Regular"
                  - option "Saira Stencil One"
                  - option "思源黑体 常规" [selected]
                  - option "StarLoveMarker Regular"
                  - option "StarLovePencil Regular"
              - generic [ref=e256]:
                - text: 字号
                - generic [ref=e257]:
                  - button "减小字号" [ref=e258] [cursor=pointer]: −
                  - textbox "字号" [ref=e259]:
                    - /placeholder: 1—1000
                    - text: "20"
                  - generic [ref=e260]: px
                  - button "增大字号" [ref=e261] [cursor=pointer]: +
              - generic [ref=e262]:
                - text: 文字颜色
                - generic [ref=e263]:
                  - button "文字颜色色板" [ref=e264] [cursor=pointer]
                  - textbox "文字颜色" [ref=e265]: rgb(37, 52, 47)
              - generic [ref=e266]:
                - text: 背景颜色
                - generic [ref=e267]:
                  - button "背景颜色色板" [ref=e268] [cursor=pointer]
                  - textbox "背景颜色" [ref=e269]: transparent
              - button "清除背景颜色" [disabled] [ref=e270]
              - paragraph [ref=e271]: 应用到当前文字对象。背景颜色用于文字高亮，背景形状可在“外观 → 背景”中设置。
          - button "重置效果" [ref=e273] [cursor=pointer]
    - contentinfo [ref=e274]:
      - generic [ref=e275]: 编辑器已就绪
      - generic [ref=e277]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e278]: 最近保存 02:14
  - toolbar [ref=e281]:
    - group [ref=e282]:
      - button "文字设置" [ref=e283]
    - group [ref=e284]:
      - button "切换位置：居右 / 居下" [ref=e285]
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
  3  | test.beforeEach(async ({page}) => {
  4  |   await page.goto('/'); await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  5  |   await page.evaluate(async()=>{
  6  |     const c=document.createElement('canvas');c.width=200;c.height=100;const ctx=c.getContext('2d')!;ctx.fillStyle='#147d64';ctx.fillRect(0,0,200,100);
  7  |     const e=window.tinymce.activeEditor;
  8  |     e.setContent(`<p><img id="photo" src="${c.toDataURL()}" style="position:absolute;left:180px;top:100px;width:200px;height:100px"></p><p><span id="words" data-text-draggable="true" style="position:absolute;left:180px;top:250px;width:240px;font-size:20px;line-height:1.2">平滑缩放文字</span></p><div id="live" data-danmaku-source="current" data-danmaku-id="resize" style="position:absolute;left:450px;top:100px;width:160px;height:120px"></div>`);
  9  |     await e.uploadImages();e.undoManager.clear();e.undoManager.add();
  10 |   });
  11 | });
  12 | 
  13 | for (const angle of [0,30,90]) for (const corner of ['se','nw']) test(`图片 ${angle}° ${corner} 匀速经过原主轴切换点时连续，固定对角且提交不跳变`,async({page})=>{
  14 |   await page.evaluate(angle=>{const e=window.tinymce.activeEditor;e.dom.setStyle(e.getBody().querySelector('#photo')!,'rotate',`${angle}deg`);e.undoManager.clear();e.undoManager.add();},angle);
  15 |   const image=frame(page).locator('#photo');await image.click();
  16 |   const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());
  17 |   const handle=(await frame(page).locator(`#objectResizeHandle${corner}`).boundingBox())!;
  18 |   const opposite=frame(page).locator(`#objectResizeHandle${corner==='se'?'nw':'se'}`),anchor=(await opposite.boundingBox())!;
  19 |   const start={x:handle.x+handle.width/2,y:handle.y+handle.height/2};
  20 |   await page.mouse.move(start.x,start.y);await page.mouse.down();
  21 |   const widths:number[]=[];const sign=corner==='se'?1:-1;const rad=angle*Math.PI/180;
  22 |   for(const dy of [38,39,40,41,42]){
  23 |     const x=40*sign,y=dy*sign;
  24 |     await page.mouse.move(start.x+x*Math.cos(rad)-y*Math.sin(rad),start.y+x*Math.sin(rad)+y*Math.cos(rad));
  25 |     widths.push(await image.evaluate(el=>parseFloat(getComputedStyle(el).width)));
  26 |     const fixed=(await opposite.boundingBox())!;expect(fixed.x).toBeCloseTo(anchor.x,0);expect(fixed.y).toBeCloseTo(anchor.y,0);
  27 |   }
  28 |   expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
  29 |   expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  30 |   const preview=(await image.boundingBox())!;await page.mouse.up();const after=(await image.boundingBox())!;
  31 |   for(const key of ['x','y','width','height'] as const)expect(after[key]).toBeCloseTo(preview[key],0);
  32 |   expect(await image.evaluate(el=>parseFloat(getComputedStyle(el).width)/parseFloat(getComputedStyle(el).height))).toBeCloseTo(2,3);
  33 |   await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  34 | });
  35 | 
  36 | test('文字角点反向偏移经过主轴切换点时连续，取消恢复原尺寸',async({page})=>{
  37 |   const text=frame(page).locator('#words');await text.click();const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());
  38 |   const box=(await text.boundingBox())!,handle=(await frame(page).locator('[data-text-resize=se]').boundingBox())!;
  39 |   const x=handle.x+handle.width/2,y=handle.y+handle.height/2;await page.mouse.move(x,y);await page.mouse.down();
  40 |   const widths:number[]=[];
  41 |   for(const offset of [2,1,0,-1,-2]){await page.mouse.move(x+box.width*.15,y-box.height*.15+offset);widths.push(await text.evaluate(el=>parseFloat(getComputedStyle(el).width)));}
> 42 |   expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
     |                                                                           ^ Error: expect(received).toBeLessThan(expected)
  43 |   await page.keyboard.press('Escape');await page.mouse.up();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  44 |   expect((await text.boundingBox())!.width).toBeCloseTo(box.width,0);
  45 | });
  46 | 
  47 | test('弹幕自由缩放连续，最小尺寸处折返不会累计误差',async({page})=>{
  48 |   const live=frame(page).locator('#live');await live.click({position:{x:20,y:20}});
  49 |   const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());const box=(await live.boundingBox())!;
  50 |   const handle=(await frame(page).locator('#objectResizeHandlese').boundingBox())!;
  51 |   const x=handle.x+handle.width/2,y=handle.y+handle.height/2;await page.mouse.move(x,y);await page.mouse.down();
  52 |   for(const dx of [-200,-129,-128,-127,-126,0,20]){await page.mouse.move(x+dx,y+10);const bounds=(await live.boundingBox())!;expect(bounds.width).toBeCloseTo(Math.max(32,box.width+dx),0);expect(bounds.height).toBeCloseTo(box.height+10,0);}
  53 |   const preview=(await live.boundingBox())!;await page.mouse.up();expect((await live.boundingBox())!.width).toBeCloseTo(preview.width,0);
  54 |   await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  55 | });
  56 | 
```