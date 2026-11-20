# 任务：proxy-core 打包进构建并部署（opencode-proxy-core打包-20261111-2030-step01）

状态：源码修改、构建、部署 完成；界面导入/测速/选节点 未验证（需用户在 OpenCode 里实测）
快照：tag pre/opencode-proxy-core打包-20261111-2030-step01 → 0b851283
## 改动
- scripts/copy-static-assets.cjs：把 assets/resources/app/extensions/opencode/proxy-core 下全部文件加入拷贝；mihomo(.exe) 须与 ARTIFACT.json 的 binarySHA256 一致，否则构建失败。
## 构建
- node scripts/update.cjs --source-only：errors=[]，success=true（20:25）。未执行 publish-runtime：原发布目录 <源码根>/opencode 已不存在，实际运行的安装是 E:/opencode。
## 部署
- 仅新增 4 个文件到 E:/opencode/resources/app/extensions/opencode/proxy-core（ARTIFACT.json、LICENSE、NOTICE.txt、mihomo.exe），目标原先不存在，无覆盖；sha256 逐个复检一致。未改 OPENCODE-RELEASE.json，未停启任何进程。
- 构建时工作区有其他会话未提交改动（sourceDirty），这些改动未部署。
## 未做
- 未跑测试；未提交 SQL 记忆库。
