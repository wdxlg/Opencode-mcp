// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/skill-archive-worker.js
// Original module marker: src/skill-archive-worker.ts
import { __export, __toCommonJS } from "./module-0000.mjs";
import { SKILL_ARCHIVE_MAX_BYTES, SkillArchiveError } from "./module-0003.mjs";
import { detectArchive } from "./module-0002.mjs";
import { extractSafeSkillZipBuffer } from "./module-0004.mjs";
import { extractSafeSkillTarGzBuffer } from "./module-0005.mjs";


// src/skill-archive-worker.ts
var skill_archive_worker_exports = {};

__export(skill_archive_worker_exports, {
  runSkillArchiveJob: () => runSkillArchiveJob
});

module.exports = __toCommonJS(skill_archive_worker_exports);

var import_node_crypto = require("node:crypto");

var import_node_fs3 = require("node:fs");

var import_node_worker_threads = require("node:worker_threads");


// src/skill-archive-worker.ts
function runSkillArchiveJob(job) {
  try {
    const data = (0, import_node_fs3.readFileSync)(job.file);
    if (data.length > SKILL_ARCHIVE_MAX_BYTES) throw new SkillArchiveError("too-large", "\u538B\u7F29\u5305\u8D85\u8FC7 2 GB\uFF0C\u8D85\u51FA\u5355\u6587\u4EF6\u4E00\u6B21\u8BFB\u5165\u7684\u6280\u672F\u4E0A\u9650\uFF08\u4E0D\u662F Skill \u5927\u5C0F\u9650\u5236\uFF09\u3002\u8BF7\u89E3\u538B\u540E\u76F4\u63A5\u5BFC\u5165 Skill \u6587\u4EF6\u5939\uFF0C\u6587\u4EF6\u5939\u5BFC\u5165\u6CA1\u6709\u5927\u5C0F\u9650\u5236\u3002");
    const kind = detectArchive(job.file, data.subarray(0, 512));
    const summary = kind === "zip" ? extractSafeSkillZipBuffer(data, job.destination) : extractSafeSkillTarGzBuffer(data, job.destination);
    return { ok: true, kind, digest: (0, import_node_crypto.createHash)("sha256").update(data).digest("hex"), ...summary, thread: import_node_worker_threads.threadId };
  } catch (error) {
    if (error instanceof SkillArchiveError) return { ok: false, code: error.code, message: error.message };
    return { ok: false, code: "corrupt", message: `\u65E0\u6CD5\u8BFB\u53D6 Skill \u538B\u7F29\u5305\uFF1A${error instanceof Error ? error.message : String(error)}` };
  }
}

if (import_node_worker_threads.parentPort && import_node_worker_threads.workerData) import_node_worker_threads.parentPort.postMessage(runSkillArchiveJob(import_node_worker_threads.workerData));

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  runSkillArchiveJob
});
export { runSkillArchiveJob, skill_archive_worker_exports, import_node_crypto, import_node_fs3, import_node_worker_threads };
