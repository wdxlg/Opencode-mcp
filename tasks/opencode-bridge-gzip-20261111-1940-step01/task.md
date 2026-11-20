# Bridge JSON 响应 gzip 压缩

- 需求：Tailscale Funnel 大数据（tools/list 约 4.4MB）仍比 Cloudflare 慢约 5 倍，用户要求继续改进。
- 方案：bridge-http-router 的 POST 分支，客户端声明 Accept-Encoding: gzip 且响应为 application/json、>=1KB、无既有 Content-Encoding 时异步 gzip；SSE、小响应、未声明 gzip 的客户端原样透传；压缩失败回退原文。
- 影响清单：仅 recovered/esm/000-extension.js/module-0132.mjs（新增 enableBridgeJsonGzip 与一行调用、一行 node:zlib 导入）。
- 本地离线验证（Hark 沙箱 node 模拟）：大 JSON 压缩并可还原、未声明 gzip 原样、小响应原样、SSE 原样。tools/list 4.4MB→约 422KB。
- 快照：pre/opencode-bridge-gzip-20261111-1940-step01
