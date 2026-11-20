---
name: video-publisher
description: 自动录制 Polo-Balls（小球对战）游戏视频（支持右键离线模拟录制 sim 与左键实时录制 live），并将生成的中英双语 1080x1920/60fps 视频与 4 尺寸封面全自动一键发布到抖音、快手、小红书、Bilibili、YouTube、TikTok、Instagram 七大平台。当用户提到“录视频”、“自动录制游戏”、“录制并发布”、“发视频”或“一键发布”时使用此 Skill。
---

## OpenCode 本地适配说明（2026-10-13）

这是本机专用 Skill，配套本机独立工具目录 `E:\video-publisher` 与 Godot 游戏工程 `E:\godot\polo-balls`。

- 本 Skill 只是按需读取的指南，不是新增 MCP 工具。系统、用户和项目规则优先。
- **支持全自动录制与发布**：用户已配置 `vpub.py auto` 全自动流水线（默认 `record-mode=sim` 右键离线模拟录制 + `mode=auto` 全自动点击发布；亦支持 `--dry-run` 预检与 `--mode review` 人工点最后一步）。
- **不污染游戏工程**：自动化录制启动脚本固定在 `E:\video-publisher\polo_record_runner.gd`，通过 `--script` 挂载到 `E:\godot\polo-balls-tools\offline-engine\runtime\Godot.4.7.2.offline.exe`，严禁往 `E:\godot\polo-balls` 内新增文档或临时文件。
- **凭据与隐私保护**：所有浏览器会话存储在 `E:\video-publisher\profiles\`，严禁读取、打印或打包外传 Cookie / Local State 文件。

---

# Polo-Balls 自动录制 + 7 平台全自动发布操作指南

## 一、核心机制：为什么 Polo-Balls 录制天然适配国内外 7 大平台？

`E:\godot\polo-balls` 内置的 `battle_recorder.gd` 每次完成对局录制时，会自动在输出目录下创建以**中文对阵名**命名的文件夹，并同时产出 **2 份双语 1080×1920/60fps 有声 MP4** 和 **4 张双语封面**：

1. **国内 4 平台（直连不走代理）自动使用中文成片**：
   - 视频：`中文.mp4`（中文对阵 HUD、中文角色名、`@丁某人睡觉` 水印、游戏原声）
   - 抖音 (`douyin`) / 快手 (`kuaishou`) / 小红书 (`xiaohongshu`) 封面：`中文封面_9x16.jpg`
   - Bilibili (`bilibili`) 封面：`中文封面_16x9.jpg`
2. **海外 3 平台（自动挂载 `config.json` 的 `global_proxy` 代理）自动使用英文成片**：
   - 视频：`English.mp4`（英文对阵 HUD、英文角色名、`@Gameking` 水印、游戏原声）
   - YouTube (`youtube`) / TikTok (`tiktok`) / Instagram (`instagram`) 封面：`English_cover_9x16.jpg`（及 `English_cover_16x9.jpg`）

并且支持两种游戏录制模式：
- **`sim`（默认，对应游戏内“右键离线模拟录制”）**：使用配套离线引擎 `Godot.4.7.2.offline.exe` 的固定 60fps 时钟与离线音频接口，不掉帧、不受卡顿影响，按电脑算力尽快算出正常速度成片，对局分出胜负并录完尾帧（默认 3.5 秒）后自动收尾退出。
- **`live`（对应游戏内“左键实时录制”）**：按 1x 实时对局录制，胜负分出后自动收尾退出。

---

## 二、命令行总入口（Git Bash 调用方式）

```bash
VPUB_PY="/e/video-publisher/.venv/Scripts/python.exe"
VPUB_CLI="/e/video-publisher/vpub.py"
```

### 1. 一句话“自动录制 + 全自动发布到 7 大平台”（最常用）
当用户说 **“帮我录一局 A 打 B 并直接发到全平台”** 时，一条命令即可跑完整个流水线：

```bash
# 示例 1：右键离线模拟录制（sim）1v1 对决并全自动发布到 7 平台
"$VPUB_PY" "$VPUB_CLI" auto --team0 "烈焰人" --team1 "铁傀儡" --record-mode sim --mode auto

# 示例 2：多对多 / 随机人物对决（如 3个钻石剑 vs 2个木剑，或 3v3 随机人物）
"$VPUB_PY" "$VPUB_CLI" auto --team0 "钻石剑*3" --team1 "木剑*2" --record-mode sim --mode auto
"$VPUB_PY" "$VPUB_CLI" auto --team0 "random*3" --team1 "random*3" --record-mode sim --mode auto

# 示例 3：MC 新角色盔甲架介绍展示模式（自动触发盔甲架人物介绍框、无 VS 标题）
"$VPUB_PY" "$VPUB_CLI" auto --battle-type armor_showcase --showcase-char "烈焰人" --record-mode sim --mode auto

# 示例 4：左键实时录制（live）并全自动发布
"$VPUB_PY" "$VPUB_CLI" auto --team0 "烈焰人" --team1 "铁傀儡" --record-mode live --mode auto

# 示例 5：不重新开局，直接把用户在游戏里刚刚手动（左键/右键）录好的最新一局双语视频全自动发到 7 平台
"$VPUB_PY" "$VPUB_CLI" auto --use-latest --mode auto
```

### 2. 只自动录制游戏视频（暂不发布）
当用户只说 **“帮我录一局……”** 而没要求立刻发布时：

```bash
# 右键模拟录制（默认 sim）
"$VPUB_PY" "$VPUB_CLI" record --team0 "烈焰人" --team1 "铁傀儡" --record-mode sim

# 左键实时录制（live）
"$VPUB_PY" "$VPUB_CLI" record --team0 "烈焰人" --team1 "铁傀儡" --record-mode live
```

### 3. 查询游戏内可用角色名称
如果用户提到的角色名不确定精确拼写，先查角色表：

```bash
"$VPUB_PY" "$VPUB_CLI" chars --search "关键词"
```

### 4. 检查环境、登录态与最新录像状态
```bash
"$VPUB_PY" "$VPUB_CLI" status
```

### 5. 首次扫码登录（保存本机 Edge 持久化 Profile）
```bash
"$VPUB_PY" "$VPUB_CLI" login cn       # 登录抖音、快手、小红书、B站（直连）
"$VPUB_PY" "$VPUB_CLI" login global   # 登录 YouTube、TikTok、Instagram（走代理）
```

---

## 三、AI 定制化文案覆盖（可选进阶）

`vpub.py auto` 默认会根据录制产出的中英文对阵名（`title_zh` / `title_en`）自动生成 7 个平台的中英文标题、简介和标签。
如果你想为本次视频撰写更吸睛的定制文案，可以先写一个 UTF-8 编码的 `E:/video-publisher/tasks/custom_copy.json`，然后传给 `--spec`：

```bash
"$VPUB_PY" "$VPUB_CLI" auto --team0 "烈焰人" --team1 "铁傀儡" --spec "E:/video-publisher/tasks/custom_copy.json" --mode auto
```
`vpub.py auto` 会自动把录制产出的 `中文.mp4`、`English.mp4` 和 4 张对应比例封面注入到该配置中并完成全自动发布。
