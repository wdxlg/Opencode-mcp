# 任务：OpenCode 接入 dsh-see-now

- 任务 ID：opencode-dsh-see-now-integration-20261110-023226-step01
- 仓库：E:\OpenCode-Source-Recovery-20261013，分支 task/opencode-leanrea-replace-20261027
- 修改前 HEAD：2599e7d6bdf1ee51acadf2e719825a67761dbc9b（2026-11-10 02:32 CST 核实）
- 快照：tag pre/opencode-dsh-see-now-integration-20261110-023226-step01
- 规则：通用规则 v19（global，hash 7b60356c…0d902，已读并确认）
- 任务卡：a2c00c5b-66c6-4954-a4df-d2a98454abb6
- 采用的 Skills：mcp-builder（已读正文前 120 行：工具命名、可执行错误信息、结构化输出；未运行其脚本）

## 总目标
把 dsh-see-now（按变化量筛帧、多帧拼图的实时视觉）作为原生工具 see_now 接入 OpenCode；看屏幕、截图、看视频统一走 see_now，Windows-MCP 只负责点击和键入，read_image 不变。

## 分目标与状态
| # | 分目标 | 状态 |
|---|---|---|
| 1 | 复核仓库状态、影响清单、pre tag | 完成 |
| 2 | 获取 dsh-see-now 源码（来源、commit、许可证） | 完成 |
| 3 | 去掉悬浮窗、调试窗、DSH 依赖 | 完成 |
| 4 | 注册原生工具 see_now（watch/peek/start/stop/status/region/help） | 完成 |
| 5 | 路由：看屏幕/截图/看视频走 see_now | 完成 |
| 6 | npm run build 与无屏幕测试 | 完成 |
| 7 | 本地提交 + post tag（不 push） | 完成 |

## 修改前影响清单
- 涉及内容：新增 see-now 核心（上游 Apache-2.0 源码，取用子集）与 OpenCode 胶水模块；在原生文件工具注册表 module-0030 注册 see_now；Windows-MCP 预设说明改为“只负责点击和键入”。
- 涉及文件（计划）：
  - 新增 recovered/shared/see-now/（上游核心 + asr.js + opencode-see-now.mjs + LICENSE + NOTICE + SOURCE.json + README.md）
  - 新增 recovered/esm/000-extension.js/see-now/（由 sync-shared 从 shared 同步的 JS 副本）
  - 修改 recovered/esm/000-extension.js/module-0030.mjs（注册 see_now，非重叠文件）
  - 修改 recovered/shared/windows-mcp-integration.mjs 及其 esm 副本（描述文字，非重叠文件）
  - 修改 scripts/sync-shared.cjs（追加 see-now 目录同步；与 REA 会话重叠，只暂存自己的 hunk）
  - 修改 recovered/esm/000-extension.js/modules.json（登记 see-now 模块；与 REA 会话重叠，只暂存自己的 hunk）
  - tasks/<本任务>/task.md、progress.md；.ai-workflow/logs、index 下本任务文件
- 需要工具：opencode-bridge（read_files/apply_patch/run_command）、git、node、npm run build（esbuild 已在 toolchain）
- 需要数据：上游仓库 https://github.com/SAOS-3624/dsh-see-now 指定 commit
- 运行环境：Windows 主机，Node ≥22；不启动 OpenCode、不抓屏、不录音
- 预计效果：Bridge 与原生 Chat 工具表出现 see_now；无 ffmpeg 时 status/help 说明配置方式而不报假成功
- 验收方式：构建成功；临时目录模块加载冒烟（status/help/region/参数校验、合成帧走管线出 PNG）；语法检查
- 是否符合中心需求：是
- 残差预估：真实抓屏/看视频/转写未在本机验证（无 ffmpeg.exe、禁止抓屏录音）；Windows-MCP 的 Screenshot/Snapshot 仍由上游 MCP 暴露，仅靠描述路由

## 他会话重叠文件处理
REA 会话未提交改动：modules.json、module-0154、module-0143、sync-shared.cjs、update.cjs 等。不 stash/checkout/reset；重叠文件在其最新内容上改，提交时用临时索引 + git apply --cached 只暂存本任务 hunk。

## 失败原因记录
- sync-shared 首次构建失败：本任务先登记了 modules.json 中的 see-now 条目，而原同步循环会先读取所有登记文件 → ENOENT。已把 see-now 同步块移到原循环之前，重建通过。
- 主机 git clone 两次失败：schannel CRYPT_E_REVOCATION_OFFLINE（加 http.schannelCheckRevoke=false 仍失败）。改为在 Hark 沙箱 clone 同一仓库、按 commit 取文件写入主机，SOURCE.json 记录。

## 使用方法
- 工具：see_now（原生文件工具表 module-0030 注册，Bridge 工具表经 module-0140 自动带出，分发走 invokeFileTool）。
  - peek：单张截图（screen / region / camera / 视频 path+seek 一帧）
  - watch：屏幕录 seconds 秒（默认 8，≤60）只留变化帧拼图；source:"file" 离线扫视频 [seek, seek+seconds]（默认 120，≤1800）；listen:true 同时转写该段音轨
  - start / stop：后台采集（最长 30 分钟），期间 watch 取拼图、peek 取最新帧
  - status：只读依赖检查；region："x,y,w,h" / "off"；help：说明
- 配置：主机 PATH 已有 C:\ffmpeg\bin\ffmpeg（只读定位，OpenCode 进程若继承该 PATH 即可用）；否则把 ffmpeg.exe 放进 PATH 或设 OPENCODE_SEE_NOW_FFMPEG（也认 FFMPEG_PATH、OPENCODE_SEE_NOW_FFMPEG_DIR），重启 OpenCode；仓库自带的 ffmpeg.dll 不能代替。
  转写：OPENCODE_SEE_NOW_ASR_BASE_URL（必填）、_API（openai-audio|chat-audio）、_MODEL、_LANGUAGE、_KEY；服务由用户自备（通常 Python 跑）。
- 改源码只改 recovered/shared/see-now/，`npm run build` 时 sync-shared.cjs 同步到 recovered/esm/000-extension.js/see-now/。
- 复现构建：`npm run build`（本次退出码 0，版本 1.0.0-recovered.34，产物 generated/source-build 与仓库内 opencode/）。

## 验收结果
- 构建：npm run build 退出码 0；000-extension.js 编译 227 模块，唯一 warning 为既有 module-0023（非本任务）。
- 测试（主机临时目录 %TEMP%/opencode-see-now-smoke-20261110，ffmpeg 强制指向不存在路径，未抓屏、未录音）：
  语法检查 13 个文件通过；shared 与 esm 副本逐字节一致；help/status/region 设置-查询-取消/非法参数×3/无 ffmpeg 时 peek/watch/start 返回 FFMPEG_MISSING/空闲 stop/合成帧走上游管线出 PNG —— 13 项全 PASS；构建产物 extension.js 含 see_now 定义且 node --check 通过。
- 沙箱额外验证（Linux，ffmpeg 合成测试视频，非真实屏幕）：file 源 peek、watch（含 listen 未配置提示）、start→watch→peek→status→stop 流程正常。
- 未执行、未验证：真实屏幕/摄像头采集（Windows ddagrab/gdigrab）、真实视频文件在主机上的解码（主机 PATH 上有 C:\ffmpeg\bin\ffmpeg，仅只读定位、未执行；按任务约束未抓屏/未录音，冒烟时把 ffmpeg 强制指向不存在路径）、ASR 转写请求、OpenCode 实例内工具加载与原生 Chat 侧显示、仓库既有测试脚本（test-* 未运行）。
- 残差：Windows-MCP 的 Screenshot/Snapshot 仍由上游 MCP 暴露，路由只靠 see_now 与 Windows-MCP 预设的描述文字（已存在的 windows_mcp 配置不会被改写）；实时听声音（麦克风/系统声音）未移植。
