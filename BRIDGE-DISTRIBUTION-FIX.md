# Bridge 新设备激活修复

## 源码定位
`activate()` 在注册 Bridge 命令之前 await `initializeBundledDefaults()`。
旧默认初始化调用共享 Skills 目录提供器；新设备未设置共享库时，
`GlobalSkillSettings.getDirectory()` 抛出 SHARED_SKILLS_CONFIG_REQUIRED，
使扩展激活在注册 opencode.bridge.getStatus 之前终止。
这是从源码确认的失败路径；未取得收件设备扩展宿主日志，不能排除其他激活错误。

## 修改
- 默认 MCP 初始化不再读取或访问共享 Skills 库；未配置技能不阻断 Bridge。
- 默认组件初始化失败写入 OpenCode 输出并明确提示，不再终止后续 Bridge 激活。
- 不自动创建共享库、不复制原设备配置，不删除路径、权限或规则门禁。
- 修改 shared 真源，经 sync-shared 同步入口副本并重新构建。

## 使用
将新的运行包解压到新的完整目录，运行其中 OpenCode.exe。
不要覆盖正在运行的旧目录，也不要混用旧版 resources。
共享 Skills 仍需在技能中心选择接收者自己机器上的目录。
本修复不附带发送者的 data、账号、聊天、Bridge 地址或令牌。

## 范围
本轮只生成、编译、进行静态构建完整性核对及压缩归档。
未运行 GUI、干净用户首次启动、跨机搬迁、端到端 MCP 或功能回归测试。
不把历史 test-suite.json 作为本轮验收结果。
