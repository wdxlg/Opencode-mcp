// 任务卡多对话自检入口：node tasks/task-card-multi-conv-20261119-1315/run-selftest.mjs [--ref <git 引用>]
// 默认用工作区 recovered 源码；--ref 从 Git 取指定版本（例如修改前快照 pre/task-card-multi-conv-20261119-1315）用于确认旧代码失败。
// 依次运行：昨天的 task-system-truth 自检（回归）与本次 selftest-multi-conv（4 并发无状态对话 + 完成显示）。
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { spawnSync, execFileSync } from "node:child_process";
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const refIdx = process.argv.indexOf("--ref"); const ref = refIdx > 0 ? process.argv[refIdx + 1] : null;
const files = { "module-0144.mjs": "recovered/esm/000-extension.js/module-0144.mjs", "module-0145.mjs": "recovered/esm/000-extension.js/module-0145.mjs", "module-2763.mjs": "recovered/esm/027-workbench.desktop.main.js/module-2763.mjs" };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "task-multi-conv-mod-"));
for (const [name, rel] of Object.entries(files)) {
  const text = ref ? execFileSync("git", ["-C", repo, "show", `${ref}:${rel}`], { encoding: "utf8", maxBuffer: 64 << 20 }) : fs.readFileSync(path.join(repo, rel), "utf8");
  fs.writeFileSync(path.join(tmp, name), text);
}
fs.writeFileSync(path.join(tmp, "module-0000.mjs"), "export function init_define_OPENCODE_BUILD_INFO(){}\n");
fs.writeFileSync(path.join(tmp, "task-memory-fork.mjs"), "export function copyTaskMemoryDir(){return []}\n");
console.log(`[selftest] 源码：${ref ? "git " + ref : "工作区"}`);
let failed = 0;
for (const suite of [path.join(repo, "tasks/task-system-truth-20261118-2045/selftest-task-truth.mjs"), path.join(here, "selftest-multi-conv.mjs")]) {
  console.log(`\n===== ${path.relative(repo, suite)} =====`);
  const r = spawnSync(process.execPath, [suite, tmp], { stdio: "inherit" });
  if (r.status !== 0) failed++;
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n[selftest] ${failed ? failed + " 个套件失败" : "全部套件通过"}`);
process.exit(failed ? 1 : 0);
