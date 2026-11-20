# 任务：隧道代理节点全部超时 + 节点表滚动条风格（opencode-隧道代理测速修复与滚动条-20261111-2125-step01）

状态：源码修改、构建校验通过；发布到 opencode/ 被拦（该运行时正在运行，脚本不停进程），待用户关闭后发布
## 原因
- 节点在 proxy-provider 里，mihomo `/proxies/{name}/delay` 对它们返回 404，所以全部记成超时；实测 `/providers/proxies/{provider}/{name}/healthcheck` 正常（edgetunnel 281 ms、HK 159 ms 等）。
## 改动
- tunnel-proxy.mjs：节点改走 provider healthcheck；先全部测「Cloudflare 边缘」，通的再测其余目标（不通的其余记超时）；并发 32；v2rayN AllowInsecure 映射 skip-cert-verify。
- opencode-tunnel-proxy-section.mjs：节点表滚动条用主题色细条、去白底与箭头；禁止横向滚动，固定列宽、表头可换行；行悬停高亮；类型列悬停显示全文。
