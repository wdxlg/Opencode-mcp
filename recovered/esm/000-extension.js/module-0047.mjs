// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/skill-archive-detect.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { REPACK_HINT } from "./module-0048.mjs";


// src/skill-archive-detect.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_path12 = __toESM(require("node:path"), 1);


// src/skill-archive-detect.ts
var SKILL_ARCHIVE_EXTENSIONS = [".zip", ".tar.gz", ".tgz"];

function archiveKindFromName(file) {
  const name = import_node_path12.default.basename(file).toLowerCase();
  if (name.endsWith(".zip")) return "zip";
  if (name.endsWith(".tar.gz") || name.endsWith(".tgz")) return "tar.gz";
  return void 0;
}

function displayExtension(file) {
  const name = import_node_path12.default.basename(file).toLowerCase();
  const known = SKILL_ARCHIVE_EXTENSIONS.find((extension) => name.endsWith(extension));
  return known ?? (/\.tar\.[a-z0-9]+$/.exec(name)?.[0] ?? import_node_path12.default.extname(name));
}

function unsupportedArchiveMessage(file) {
  const extension = displayExtension(file);
  return `\u4E0D\u652F\u6301${extension ? ` ${extension} ` : "\u8FD9\u79CD"}\u683C\u5F0F\u7684 Skill \u5305\uFF08\u652F\u6301 Skill \u6587\u4EF6\u5939\u6216 .zip\u3001.tar.gz\u3001.tgz\uFF09\u3002${REPACK_HINT}`;
}
export { archiveKindFromName, displayExtension, unsupportedArchiveMessage, import_node_path12, SKILL_ARCHIVE_EXTENSIONS };
