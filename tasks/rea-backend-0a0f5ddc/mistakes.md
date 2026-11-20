# 错题与纠正
1. 用户否定独立 REA 产品、专用 Node 与 MCP 子进程包装。已改为真正调用后端处理器的宿主原生工具，不以改入口名称替代架构纠正。
2. cliCommandNames 纯常量被过宽边界误拒，修正为拒绝真实 CLI 目录；canonicalize 的 exports 不开放 package.json，改为受控物理包根定位；Zod 双版本不能扁平化，按真实嵌套路径缓存，并把 REA 私有依赖放在 vendor/node_modules。前三次 port 有明确失败回执，最终成功后不重放。
3. 静态 new URL 扫描漏掉 import.meta.resolve 的两个 worker 别名、模板 Ghidra 资源及 Python 相邻实现。真实错题 Git 快照 013b690f7444b037e874fd55cb9ba1cbb692f5d0 / refs/heads/mistake-book/rea-backend-0a0f5ddc/resource-closure 后补全后端 bridge 辅助树与根 package imports，静态编译覆盖两个 worker。
4. 原准备脚本误将私有 Zod 放在错误父目录，实际执行退休前已修；新增依赖树内容锁及实际静态解析位置验证。
5. 补充静态脚本最初引用不存在的 Babel traverse，在写产品前明确失败；改为 parser 驱动的词法作用域遍历，不新增安装。
6. 静态校验器应使用工程已有 toolchain/esbuild，不依赖不存在的根安装；构建前补 POST。
7. 构建前发现其他对话正在修改共用 sync-shared，保护性拒绝而非覆盖；收紧本任务源码检查到自己拥有的修改，保留他人磁盘输入共同构建。遵循现有版本字段，撤回自行递增，不新建版本目录。
8. 遇到其他构建锁仅排队等待，不删除锁、不杀进程。
