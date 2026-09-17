# CaptionShift

平移或缩放字幕时间，转换 SRT 与 WebVTT。

[在线使用](https://utokyo2026.github.io/captionshift/) · [下载离线网页](https://github.com/UTokyo2026/captionshift/releases/latest) · [完整英文说明](README.md)

![演示界面](docs/demo.png)

## 怎么使用

1. 打开网页，点击 **Try an example** 体验内置的虚构示例。
2. 在输入区粘贴内容、选择文件或填写参数。
3. 点击主要操作按钮，检查预览后下载结果。

所有处理在当前浏览器中完成，不上传输入内容，不会修改原始文件。无需账户、API Key 或付费服务。界面目前为英文，本文件提供中文入门说明。

## 本地运行

构建需要 Node.js 20.19 或更新版本；生成的离线网页不需要 Node.js。

```sh
npm ci
npm test
npm run build
```

直接打开 `dist/index.html`，或运行 `npm start` 后访问 http://127.0.0.1:4178。

## 使用边界

请先查看页面底部的 **Scope, formats and limitations**，其中写明支持的格式、输入大小和限制。不能把工具输出视为对所有场景都成立的保证。打印类结果需要实际测量；配置类检查不能证明凭据可用；日历类结果不代表对方真的有空。

网页版本的托管方仍会收到普通网页请求和 IP 等信息；需要断网使用时，请下载 HTML。导出文件可能包含你的数据，分享前请检查。

这是第一版，欢迎通过合成示例反馈问题。MIT 开源协议。
