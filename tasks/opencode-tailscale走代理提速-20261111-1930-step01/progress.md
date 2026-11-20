# 进度
- 19:23 基线（Cloudflare）：ping 0.27-0.69s，规则 110KB 1.4s，tools/list 4.4MB 12.2s（360KB/s）。
- 19:23 基线（Tailscale 直连）：ping 5-12s，规则 14.7s（8KB/s），tools/list 约 8 分钟。
- 19:25 运行时验证（已获用户要求修复）：以 HTTPS_PROXY=http://127.0.0.1:10808 + TS_DEBUG_ALWAYS_USE_DERP=true 重启便携 tailscaled（新 PID 19672），OpenCode 自动重连 funnel，固定地址不变。
- 19:26 结果：ping 1.15s/复用 0.29s，规则 2.9s，tools/list 68.2s（64KB/s）。netstat 确认经 127.0.0.1:10808。
- 19:3x 源码：module-0114 注入代理环境；node --check 通过。未构建、未发布、未跑测试脚本。
