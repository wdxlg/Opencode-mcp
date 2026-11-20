# recovered.22 — 范围一致性与真实连接回执

## 目录范围
Bridge list_directory 由服务端注入与文件工具相同的 allowed roots，遵守 Entire device/Project files；不从工具参数接受根目录。真实路径解析复用 resolveSafePath，子目录逐层重新验证，链接只列举、不遍历。设备范围允许无打开文件夹时使用可用本地盘；外部目录返回绝对路径。修正盘符根包含判断。
协作运行时绑定任务相对目录；只取消 list_directory 的旧 worktree 禁用项，保留角色、规则、租约、只读和写入隔离。LSP/诊断仍保持 IDE 限制。原生非 Bridge IDE 调用保留工作区范围。

## 连接证据
认证来源能力绑定 + 真实 Host 对应当前 publicUrl + legacy initialized / stateless tools 请求。来源登记和 bindOwner 不记录已连接。证据以地址散列保存到现有来源注册文件，按工作区/实例/真实对话匹配，跨地址/窗口可查询；不公开会话 ID 或旧秘密。数量预算超限标记历史不完整并禁用提醒，而非丢弃历史后误报。
同用户 DPAPI 认证 loopback /v1/reconnect-status 查询；普通查询无历史不创建首个绑定，有旧地址证据且当前地址未连接才提供新绑定地址。协作关闭不阻止回执归属/查询，不因此授予业务权限。
Arena v598 无条件附加和定时刷新已移除；明确断开命令持久化到对应实例/对话，显式重新连接才解除。已选/临时配置及歧义候选不替换。
旧版本无持久证据，通用未归属会话、Host 被隧道改写而无法验证时不推断已连接；不得补造历史或要求用户配对。此限制为证据不足时的保守处理。

## 生成
仅执行审阅后的 scripts/update.cjs（构建、静态完整性核对、发布源码根 opencode/）；不运行应用或功能测试，不新建 packages ZIP，不触碰 baseline 或现有安装。保留用户数据与非构建管理文件。
