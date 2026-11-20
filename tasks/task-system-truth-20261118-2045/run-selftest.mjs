// 任务系统真实性无头自检入口：node tasks/task-system-truth-20261118-2045/run-selftest.mjs
// 把 recovered 下的 module-0144/0145 复制到临时目录（module-0000、task-memory-fork 用桩），再运行 selftest-task-truth.mjs。
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url"; import { spawnSync } from "node:child_process";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "../../recovered/esm/000-extension.js");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "task-truth-mod-"));
for (const f of ["module-0144.mjs", "module-0145.mjs"]) fs.copyFileSync(path.join(src, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "module-0000.mjs"), "export function init_define_OPENCODE_BUILD_INFO(){}\n");
fs.writeFileSync(path.join(tmp, "task-memory-fork.mjs"), "export function copyTaskMemoryDir(){return []}\n");
const r = spawnSync(process.execPath, [path.join(here, "selftest-task-truth.mjs"), tmp], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(r.status ?? 1);
