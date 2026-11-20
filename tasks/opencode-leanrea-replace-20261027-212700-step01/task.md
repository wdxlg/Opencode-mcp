# OpenCode 内置 REA 替换为 LeanREA

状态：已完成源码替换、离线验证和源码内运行版发布；真实启动与业务逆向未验证。

## 用户目标与授权
- 使用 C 盘下载的 leanrea-main.zip 完整替换本工程内置 REA；接受丢失原 MCP 接口，不能宣称能力等价。
- 交付唯一运行版为本工程 opencode/；不修改或停止 E:\OpenCode 或其配置，不修改用户共享 Skills。
- 授权使用临时目录、虚拟样本和隔离进程进行离线测试，不联网、不运行真实目标、不启停既有实例。
- 本次提问用户明确同意当前对话界面答复作为单次例外；Bridge 未提供 bridge_ask_user，未取得或伪造 answered 回执。

## 理解、未知与影响
已知：LeanREA 是 MIT 许可的纯 Skill，原包无 MCP 服务或 170 项工具；当前 Bridge Bash 的 PATH 未发现多个常用逆向依赖。旧 REA 的产品默认注册、旧 Skill、托管资源和默认规则需要同步替换；用户自定义配置优先。
未知：不同目标和外部工具在实际业务环境中的可用性；真实用户启动后的表现。原正式运行版不会因本次发布自动变化。
影响：defaults 受管内容与 manifest、默认注册与规则、Bridge Skill 发现和只读访问、构建时旧受管资产清理、针对性离线测试、工程内 opencode/ 受管文件。其余用户数据、正式实例和现有外部 Skills 不动。
参考评估：用户指定 ZIP 与目标强相关；其中自动下载、删除和 macOS 示例受本地安全规则约束，不直接执行。mcp-builder 和 reverse-engineer-anything Skill 只用于理解旧接口与权限边界，不执行其脚本。

## 快照与回滚
- 修改前基线：f06af9657f62c398a64dd325989e94852d7c1d8e；本地标签：pre/opencode-leanrea-replace-20261027-212700-step01。
- 因旧 node_modules 被 Git 忽略，已将 6572 个旧默认文件和旧 manifest 备份到 backup/opencode-leanrea-replace-20261027-212700-step01/bundled-rea-before.zip，逐项 SHA-256 校验，压缩包 SHA-256 bfdaa77b2ff1dc84664394a3a3a15774f48782d27ba30e2fb5fdeea448337425。
- SQL 库在备份目录保留一致性副本，不提交 Git；构建前报告备份 reports-before-build.zip 已逐项校验，SHA-256 5207a43c4a1beb9cb384323d1587262feac4a2de738ca1d1d70ec1fd3206e2dd。
- 运行版发布备份：.update-backup/1793108798771-f15c118f，含旧版本标记、变更和退役文件；回滚前必须确认源码内运行版未运行，依更新日志反向恢复并保留 data/，不要触碰正式安装。
- 操作只在本地 Git，明确暂存文件，不 push，不包含凭据、原有未跟踪用户文件、运行数据或备份。

## 强制读取清单
- 用户指定 leanrea-main.zip：强相关，ZIP SHA-256 3cc768730c91ccd8d9da683f0932b03edc672a1895feae869b9b634887743c5b；README、SKILL.md（53581bd7fb1fae4352ab43252e67b84667b68895a68e372b99d302b58d9c782d）、LICENSE（f126681f66a89b4f610999a64f1a1fc6da98d221a39f65799a6d6bb6e051d922）已完整读取；不执行基准脚本。
- AGENTS.md：已完整读取，SHA-256 1d1d07f43c1a2487fd40211d606326517e51b4ebab307a416168963976b6590d。
- reverse-engineer-anything/SKILL.md：已完整读取，SHA-256 ebb8eb3058ae824c17525cd72d32502e05c5fbeebdba2be3c574355301fac3a6。
- mcp-builder/SKILL.md：已完整读取，SHA-256 928cf3069804b3acbe9d1ebebbea41cc4fcc4afc52e982aea4cf5dd6dc62a7c5。
- 既定更新脚本链及拟修改接口已逐项阅读；编写后的新增脚本须审阅后运行。
- 本 task.md / progress.md 是阶段恢复时必读文件。
读取时间：2026-10-27T21:28:05+08:00（ZIP SHA 和备份复核时间；其他文件为本次只读调查期间）。

## 子目标及验收
1. 只读调查与用户关键决策：完成。
2. 修改前 Git 和旧依赖备份：完成。
3. 替换源码、默认资源、按需只读规则适配及安全退役：完成。未定制旧规则仅在本版输出时映射，不改共享规则库；定制/不可核验 MCP 配置和全部密钥保留。
4. 经授权的离线验证：专项 27/27；并发/取消/跨进程锁/进程预算 7 项、版本隔离 13 项以及发布器夹具通过。增量源码构建和 10 项产品完整性检查通过；扩展构建 1 项 CommonJS 警告与旧基线完全相同。真实外部工具、真实分析、GUI 和实际 MCP 首次启动未验证。
5. 工程内 opencode/ 已发布 recovered.26；本地提交 2722df0f9023bf85238d509a0ace5cb4a4d81021，受管 11020 个文件完整 SHA-256 校验通过，旧 REA 受管文件移除 6572 个；未覆盖、停止或重启 E:\OpenCode。

## 首次启动与限制
- 源码内运行版现存 1 条旧 REA 配置；公开字段形态及归属标记与旧默认一致，未读取密钥。新版本首次启动时仅在全部归属和密钥值校验通过后备份引用并退役；尚未启动，因此此步骤未实际验证，也不声称当前配置已删除。
- 旧 REA MCP 接口不再内置，LeanREA 是 Skill 而非 MCP 或自动分析引擎；用户同名 Skill 优先。用户自行定制的旧规则或服务保留，可能需用户按需处理。
- 旧全量 test-suite.json 是先前版本报告，本轮未重新执行该套件。构建不代表 GUI、实际模型、真实目标或特定系统工具可用。
- 测试和依赖未访问外网；按用户要求使用了既有 Bridge 控制连接。Bridge 的 run_command 会在现有实例的 data/tmp 写入临时命令脚本，抽查已自动清理；未覆盖其程序或配置，也未停止进程。
- 过程性失败记录：原版本隔离测试夹具与既有共享 Skills 实现/VM 依赖和遗留文件前置状态不一致，三次失败日志保留，修正夹具后 13 项通过；发布器夹具首次缺少 reports 目录，修正隔离夹具后通过。一次补丁上下文不匹配及一次工具超时参数超限均未写入，Git 分页器已正常退出。

## 使用方法
交付后从本工程 opencode/ 启动；通过 Bridge 的 list_skills 发现并读取 leanrea，按当次授权使用已安装的本地工具。具体发布与测试结果以最终记录为准。
