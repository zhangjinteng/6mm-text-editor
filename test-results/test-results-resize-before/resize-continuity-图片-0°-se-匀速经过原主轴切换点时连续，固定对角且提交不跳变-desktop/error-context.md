# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resize-continuity.spec.ts >> 图片 0° se 匀速经过原主轴切换点时连续，固定对角且提交不跳变
- Location: tests/resize-continuity.spec.ts:13:66

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 3
Received:   42
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
        - generic [ref=e16]: 保存中
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
                      - textbox [ref=e127]: 15px
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
                    - button "插入/编辑图片" [pressed] [ref=e172]
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
                - button "img" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "6 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "图片配置面板" [ref=e233]:
        - generic "图片设置" [ref=e235]:
          - generic [ref=e236]:
            - generic [ref=e237]:
              - heading "图片配置" [level=2] [ref=e238]
              - paragraph [ref=e239]: 调整即时生效，可撤销
            - button "收起图片配置" [ref=e240] [cursor=pointer]: ×
          - generic [ref=e242]:
            - tablist "图片设置分类" [ref=e243]:
              - tab "图片" [selected] [ref=e244] [cursor=pointer]
              - tab "外观" [ref=e245] [cursor=pointer]
              - tab "特效" [ref=e246] [cursor=pointer]
              - tab "阴影" [ref=e247] [cursor=pointer]
              - tab "蒙版" [ref=e248] [cursor=pointer]
              - tab "滤镜" [ref=e249] [cursor=pointer]
              - tab "描边" [ref=e250] [cursor=pointer]
              - tab "排版" [ref=e251] [cursor=pointer]
              - tab "动画" [ref=e252] [cursor=pointer]
            - tabpanel "图片" [ref=e253]:
              - heading "插入 / 编辑图片" [level=3] [ref=e254]
              - generic [ref=e255]:
                - text: 图片地址
                - textbox "图片地址" [ref=e256]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAADKUlEQVR4AezTXW7aQBSAUZQ1dIndRtfePiFZxDFlmGHuz6lUJQFszz2X7+vXn99//WfgO3D+Hfi6+UeAwI8CAvmRxhsEbjeB+BYQuBAQyAWOtwgsDAQugfwCAsm/QxMsFBDIQly3zi8gkPw7NMFCAYEsxHXr/AI5A8nvboIkAgJJsijH3CMgkD3unppEQCBJFuWYewQEssfdU5MICORhUf4kcBQQyFHD7wQeBATyAOJPAkcBgRw1/E7gQUAgDyD+JHAUEMhRY+3v7p5QQCAJl+bInxMQyOesPSmhgEASLs2RPycgkM9Ze1JCAYEkXNr3I3tllYBAVsm6bwkBgZRYoyFWCQhklaz7lhAQSIk1GmKVgEBWyVa5b/M5BNL8C2D8awGBXPt4t7mAQJp/AYx/LSCQax/vNhcQSPMvwM7xMzxbIBm25IzbBASyjd6DMwgIJMOWnHGbgEC20XtwBgGBZNiSM74qMO3zAplG6UYVBQRScatmmiYgkGmUblRRQCAVt2qmaQICmUbpRhUFvgdScUozERgUEMggnMt6CAikx55NOSggkEE4l/UQEEiPPZtyUOCjgQye0WUEtgkIZBu9B2cQEEiGLTnjNgGBbKP34AwCAsmwJWfcJlAlkG2AHlxbQCC192u6NwUE8iagy2sLCKT2fk33poBA3gR0eW0BgTzdrw90FhBI5+2b/amAQJ4S+UBnAYF03r7ZnwoI5CmRD3QWEMjO7Xt2eAGBhF+RA+4UEMhOfc8OLyCQ8CtywJ0CAtmp79nhBQQSfkVjB3TVHAGBzHF0l6ICAim6WGPNERDIHEd3KSogkKKLNdYcAYHMcex0l1azCqTVug37qoBAXhXz+VYCAmm1bsO+KiCQV8V8vpWAQFqtO/qw8c4nkHg7caJAAgIJtAxHiScgkHg7caJAAgIJtAxHiScgkHg7caIVAoP3FMggnMt6CAikx55NOSggkEE4l/UQEEiPPZtyUEAgg3Au6yHwP4H0kDAlgRMBgZygeInAXUAgdwk/CZwICOQExUsE7gICuUv4SeBEYHMgJyfyEoFAAgIJtAxHiScgkHg7caJAAv8AAAD//+4ZIbcAAAAGSURBVAMASPWHeHHRXQUAAAAASUVORK5CYII=
              - button "选择本地图片" [ref=e257] [cursor=pointer]
              - paragraph [ref=e258]: 支持 PNG、JPG、WebP、GIF、SVG，最大 5 MB。替换保留位置和尺寸，重置旧裁剪。
              - generic [ref=e259]:
                - text: 图片描述
                - textbox "图片描述" [ref=e260]
              - generic [ref=e261]:
                - text: 图片标题
                - textbox "图片标题" [ref=e262]
              - generic [ref=e263]:
                - generic [ref=e264]:
                  - text: 宽度（px）
                  - spinbutton "图片宽度" [ref=e265]: "200"
                - generic [ref=e266]:
                  - text: 高度（px）
                  - spinbutton "图片高度" [ref=e267]: "100"
              - generic [ref=e268]:
                - checkbox "保持宽高比" [checked] [ref=e269]
                - text: 保持宽高比
              - button "裁剪图片" [ref=e270] [cursor=pointer]
              - generic [ref=e271]:
                - generic [ref=e272]:
                  - checkbox "水平翻转" [ref=e273]
                  - text: 水平翻转
                - generic [ref=e274]:
                  - checkbox "垂直翻转" [ref=e275]
                  - text: 垂直翻转
                - generic [ref=e276]:
                  - checkbox "锁定位置与尺寸" [ref=e277]
                  - text: 锁定位置与尺寸
              - paragraph [ref=e278]: 锁定后仍可选中图片并在这里解锁。
              - generic [ref=e279]:
                - generic [ref=e280]:
                  - text: 旋转角度
                  - status "旋转角度" [ref=e281]: 0°
                - slider "旋转角度" [ref=e282] [cursor=pointer]: "0"
              - generic [ref=e283]:
                - button "↶ 左转 90°" [ref=e284] [cursor=pointer]
                - button "↷ 右转 90°" [ref=e285] [cursor=pointer]
          - button "重置效果" [ref=e287] [cursor=pointer]
    - contentinfo [ref=e288]:
      - generic [ref=e289]: 编辑器已就绪
      - generic [ref=e291]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e292]: 最近保存 02:14
  - toolbar [ref=e295]:
    - group [ref=e296]:
      - button "填充满" [ref=e297]
      - button "设为背景" [ref=e298]
      - button "图片设置" [ref=e299]
    - group [ref=e300]:
      - button "切换位置：居右 / 居下" [ref=e301]
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
> 28 |   expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
     |                                                                           ^ Error: expect(received).toBeLessThan(expected)
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
  42 |   expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
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