# see-now（OpenCode 接入）

本目录是 [dsh-see-now](https://github.com/SAOS-3624/dsh-see-now)（Apache-2.0，commit 8b8e6c6）的核心子集，
加上 OpenCode 自写的 `opencode-see-now.mjs`，在原生文件工具注册表（module-0030）里注册为工具 `see_now`。
来源、逐文件校验值和改动说明见 `SOURCE.json`；许可证见 `LICENSE`、`NOTICE`（原样保留）。

- 去掉了：悬浮窗、调试窗、DSH 宿主（cordis 插件、@deepseek-ai/dsh-tools、~/.dsh 配置、speechToText）、麦克风/系统声音监听。
- 保留了：按变化量筛帧（cuts）、档位与拼图（tiers/pack/sheet/layout/scale/tokens）、PNG 编码、ffmpeg 采集（Windows ddagrab/gdigrab、macOS avfoundation、摄像头、视频文件）。
- 依赖：运行时需要 `ffmpeg.exe`（PATH 或环境变量 `OPENCODE_SEE_NOW_FFMPEG`），不随工程分发、不自动安装。
- 听声音：只转写视频文件音轨，需要用户自备 HTTP 转写服务（`OPENCODE_SEE_NOW_ASR_BASE_URL` 等）。
- 同步：`scripts/sync-shared.cjs` 把本目录的 `.js/.mjs` 复制到 `recovered/esm/000-extension.js/see-now/`；改源码只改本目录。
