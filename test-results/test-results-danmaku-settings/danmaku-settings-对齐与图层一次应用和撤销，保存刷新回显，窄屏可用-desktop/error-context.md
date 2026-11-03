# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-settings.spec.ts >> 对齐与图层一次应用和撤销，保存刷新回显，窄屏可用
- Location: tests/danmaku-settings.spec.ts:40:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true })
Expected: "true"
Received: "false"
Timeout:  20000ms

Call log:
  - Expect "toHaveAttribute" getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true }) with timeout 20000ms
  - waiting for getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true })
    43 × locator resolved to <button type="button" data-align="center" aria-pressed="false">居中对齐</button>
       - unexpected value "false"

```

```yaml
- button "居中对齐"
```

```
Error: browserContext._wrapApiCall: file data stream has unexpected number of bytes
```