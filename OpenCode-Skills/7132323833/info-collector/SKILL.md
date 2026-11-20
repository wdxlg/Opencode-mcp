---
name: info-collector
description: 全网热点聚合、特定平台（Bilibili/抖音/快手/小红书/知乎/微博/百度/头条/YouTube/TikTok/GitHub/HackerNews）关键词搜索与网页正文提取技能。当用户提到“近期热点”、“热搜”、“去某平台搜索”、“搜集信息”或“结合热点做视频选题”时使用此 Skill。
---

## OpenCode 本地适配说明（2026-10-13）

本 Skill 参考开源项目 **TrendRadar**（`sansan0/TrendRadar` 多平台热榜聚合与三层关键词过滤）、**MediaCrawler**（`NanmiCoder/MediaCrawler` 基于 Playwright 持久化浏览器上下文的跨平台检索）以及 **content-trend-researcher** 设计，配套本机独立执行脚本 `E:\video-publisher\info_cli.py`（命令别名 `E:\video-publisher\info.cmd`）。

- 本 Skill 只是按需读取的指南，不是新增 MCP 工具。系统、用户和项目规则优先。
- **只读合规边界**：仅抓取公开热榜与公开搜索结果，不绕过付费墙或私密权限，不读取或外传 `E:\video-publisher\profiles\` 下的浏览器 Cookie。
- **与 `video-publisher` 联动**：搜集到的热点或平台高赞选题可直接作为 `E:\video-publisher\vpub.py auto` 的对阵选题与文案依据。

---

# 多平台信息搜集与热点追踪（Info Collector）操作指南

## 一、可执行命令入口（Git Bash）

```bash
INFO_PY="/e/video-publisher/.venv/Scripts/python.exe"
# 默认使用 OpenCode 内置 Skill 自带的 scripts/info_cli.py（也可使用 /e/video-publisher/info_cli.py）
INFO_CLI="/e/opencode/data/skills/info-collector/scripts/info_cli.py"
```

---

## 二、三大核心功能与调用方式

### 1. 获取近期热点 / 全网实时热搜榜（`hot` 子命令，免登录直连）
支持一次性拉取 **Bilibili (`bilibili`)、抖音 (`douyin`)、微博 (`weibo`)、百度 (`baidu`)、今日头条 (`toutiao`)、GitHub (`github`)、HackerNews (`hackernews`)** 实时榜单，并支持 **TrendRadar 三层关键词过滤语法**（`+必含词`、`!排除词`、`普通匹配词`）：

```bash
# 获取国内主流平台（B站、抖音、微博、百度、头条）前 15 条实时热搜
"$INFO_PY" "$INFO_CLI" hot --platforms cn --limit 15

# 获取单个或多个指定平台热榜（如只看 B站 和 抖音）
"$INFO_PY" "$INFO_CLI" hot --platforms bilibili,douyin --limit 20

# 获取海外开发者热榜（GitHub 近 7 天飙升仓库 + HackerNews 首页）
"$INFO_PY" "$INFO_CLI" hot --platforms global --limit 15

# 使用 TrendRadar 风格过滤热榜（例如：筛选含“游戏/MC/独立游戏”且排除“广告”的热点）
"$INFO_PY" "$INFO_CLI" hot --platforms all --limit 30 --filter "!广告 游戏,我的世界,MC,独立游戏,AI"
```

### 2. 去特定平台搜索信息（`search` 子命令）
当用户指定 **“去小红书/抖音/B站/快手/知乎/微博/YouTube/TikTok/GitHub 搜一下 XXX”** 时：
- 对 `github`、`hackernews` 默认走高速官方 API；
- 对 `bilibili`、`douyin`、`kuaishou`、`xiaohongshu`、`zhihu`、`weibo`、`youtube`、`tiktok`、`bing` 自动复用 `E:\video-publisher\profiles\` 下的本机 Microsoft Edge 持久化登录态渲染搜索页并提取结构化标题、链接与摘要：

```bash
# 在 B站 搜索特定关键词
"$INFO_PY" "$INFO_CLI" search --platform bilibili --query "我的世界 电子斗蛐蛐" --limit 12

# 在 小红书 / 抖音 / 知乎 搜索特定主题
"$INFO_PY" "$INFO_CLI" search --platform xiaohongshu --query "独立游戏宣传" --limit 12
"$INFO_PY" "$INFO_CLI" search --platform douyin --query "Mc小球对战" --limit 12
"$INFO_PY" "$INFO_CLI" search --platform zhihu --query "Godot 游戏开发" --limit 10

# 在 YouTube / TikTok / GitHub 搜索
"$INFO_PY" "$INFO_CLI" search --platform youtube --query "Minecraft Mob Battle Shorts" --limit 10
"$INFO_PY" "$INFO_CLI" search --platform github --query "social-auto-upload" --limit 10

# 若目标平台首次搜索需要扫码或过滑块验证，加上 --headed 弹出可见窗口
"$INFO_PY" "$INFO_CLI" search --platform xiaohongshu --query "关键词" --headed
```

### 3. 提取指定网页链接正文（`fetch` 子命令）
当需要将搜索结果中的某个具体网页或帖子提取成干净正文时：

```bash
# 静态网页快速提取
"$INFO_PY" "$INFO_CLI" fetch --url "https://example.com/article" --max-chars 6000

# 动态渲染网页（SPA / 社交平台详情页）使用本机 Edge 提取
"$INFO_PY" "$INFO_CLI" fetch --url "https://www.bilibili.com/video/BVxxxx" --browser --max-chars 6000
```

---

## 三、标准 AI 信息搜集与选题联动工作流

1. **当用户问“最近有什么热点 / 某领域有什么新动态”**：
   - 先调用 `info_cli.py hot --platforms cn`（或 `all`）带 `--filter` 拉取多平台实时热榜；
   - 按热度与平台交叉对比，整理出结构化摘要（含话题名称、所属平台、热度与直达链接）。
2. **当用户说“去 XX 平台帮我搜一下 YY”**：
   - 调用 `info_cli.py search --platform <平台> --query "<关键词>"`；
   - 若需要深入看前 2～3 条结果的详情，再调用 `info_cli.py fetch --url "<链接>" --browser`；
   - 汇总核心结论、高赞观点或爆款标题规律。
3. **当用户说“结合近期热点/某平台爆款，帮我录一期 polo-balls 视频并发出去”**：
   - 第 1 步：用本 Skill (`info-collector`) 查出当前 B站/抖音/YouTube 的热门梗或高赞对阵形式；
   - 第 2 步：切到 `video-publisher` Skill，调用 `vpub.py chars` 选定对应角色，生成贴合热点的 7 平台标题/标签 JSON，再执行 `vpub.py auto` 完成自动录制与发布。
