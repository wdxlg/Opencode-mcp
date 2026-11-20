# 共享 Skills 与运行版生成

本版本仅从用户级 `.opencode/shared-skills.json` 指定的共享库加载 Skills。
当前机器配置指向 `E:\OpenCode-Skills\shared`。
不读取版本私有 Skills 配置，不回退到 data/skills，不加载工作区 Skills。
共享配置缺失、损坏或目录不可访问时明确失败，不替换为其他库。
保留手动导入到共享库的功能；关闭启动时内置 Skills 自动复制。
MCP 配置仍为版本私有，普通 JSON 自定义工具不受影响。

更新后交付命令：`node scripts/update.cjs`（或 `npm run build`）。
该命令编译、静态核验后发布到本源码根目录下 `opencode`。
`--source-only` 仅用于中间编译，不代表完成运行版交付。
发布器拒绝覆盖正在运行的目标，不自动停止实例；保留 data 和其他用户文件。

本机共享库不随程序文件夹移动。其他旧版本只有包含本项兼容代码才能使用本配置。
构建与文件核对不等于功能测试；本次不运行应用或功能测试。
