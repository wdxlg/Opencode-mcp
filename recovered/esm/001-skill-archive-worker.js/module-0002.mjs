// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/skill-archive-worker.js
// Original module marker: src/skill-archive-detect.ts
import { __toESM } from "./module-0000.mjs";
import { REPACK_HINT, SkillArchiveError } from "./module-0003.mjs";


// src/skill-archive-detect.ts
var import_node_path2 = __toESM(require("node:path"), 1);


// src/skill-archive-detect.ts
var SKILL_ARCHIVE_EXTENSIONS = [".zip", ".tar.gz", ".tgz"];

function archiveKindFromName(file) {
  const name = import_node_path2.default.basename(file).toLowerCase();
  if (name.endsWith(".zip")) return "zip";
  if (name.endsWith(".tar.gz") || name.endsWith(".tgz")) return "tar.gz";
  return void 0;
}

function displayExtension(file) {
  const name = import_node_path2.default.basename(file).toLowerCase();
  const known = SKILL_ARCHIVE_EXTENSIONS.find((extension) => name.endsWith(extension));
  return known ?? (/\.tar\.[a-z0-9]+$/.exec(name)?.[0] ?? import_node_path2.default.extname(name));
}

var LABELS = { zip: "ZIP", gzip: "gzip", "7z": "7z", rar: "RAR", xz: "xz", bzip2: "bzip2", zstd: "zstd", tar: "\u672A\u538B\u7F29\u7684 tar" };

function sniffArchive(head) {
  const starts = (bytes) => head.length >= bytes.length && bytes.every((byte, index) => head[index] === byte);
  if (starts([80, 75, 3, 4]) || starts([80, 75, 5, 6])) return "zip";
  if (starts([31, 139])) return "gzip";
  if (starts([55, 122, 188, 175, 39, 28])) return "7z";
  if (starts([82, 97, 114, 33, 26, 7])) return "rar";
  if (starts([253, 55, 122, 88, 90, 0])) return "xz";
  if (starts([66, 90, 104])) return "bzip2";
  if (starts([40, 181, 47, 253])) return "zstd";
  if (head.length >= 262 && head.subarray(257, 262).toString("latin1") === "ustar") return "tar";
  return void 0;
}

function unsupportedArchiveMessage(file) {
  const extension = displayExtension(file);
  return `\u4E0D\u652F\u6301${extension ? ` ${extension} ` : "\u8FD9\u79CD"}\u683C\u5F0F\u7684 Skill \u5305\uFF08\u652F\u6301 Skill \u6587\u4EF6\u5939\u6216 .zip\u3001.tar.gz\u3001.tgz\uFF09\u3002${REPACK_HINT}`;
}

function detectArchive(file, head) {
  const declared = archiveKindFromName(file);
  if (!declared) throw new SkillArchiveError("repack-required", unsupportedArchiveMessage(file));
  const content = sniffArchive(head);
  if (content !== (declared === "zip" ? "zip" : "gzip")) {
    const label = content ? LABELS[content] : "\u65E0\u6CD5\u8BC6\u522B\u7684\u5185\u5BB9";
    throw new SkillArchiveError("extension-mismatch", `\u6269\u5C55\u540D\u4E3A ${displayExtension(file)}\uFF0C\u5185\u5BB9\u5374\u662F ${label}\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002${REPACK_HINT}`);
  }
  return declared;
}
export { archiveKindFromName, displayExtension, sniffArchive, unsupportedArchiveMessage, detectArchive, import_node_path2, SKILL_ARCHIVE_EXTENSIONS, LABELS };
