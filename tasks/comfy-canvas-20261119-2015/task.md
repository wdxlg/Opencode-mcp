# task — comfy-canvas-20261119-2015（团队协作画布改为 ComfyUI 式节点编辑器）

接管任务卡 0437788d。快照：pre/comfy-canvas-20261119-2015（043dccda）。

| 步 | 内容 | 状态 |
|---|---|---|
| 01 | 核心交互：成员编排画布每个节点 4 个端口（下=管理、上=接上级、左右=协作）；拖端口出实时连线，放到成员上建连线；从上端口拖起已有上级连线可改接、放空白处删除；Esc 取消；Delete 删选中连线 | 完成（源码+无头 Edge e2e 18/18+构建暂存） |
| 02 | 撤销/右键菜单/分组/小地图 等其余 ComfyUI 功能；成员编排与 AI 画布合并 | 未完成 |

改动文件：recovered/standalone/.../task-workbench/collaboration.js、assets/.../task-workbench/automation.css。
使用方法：自测 `node tasks/comfy-canvas-20261119-2015/test-comfy-wires.mjs`；构建 `node scripts/update.cjs`。
残差：无头截图里没有 VS Code 主题变量，节点颜色不代表实机；实机界面未验收（需重启 OpenCode 应用 opencode.next）。
