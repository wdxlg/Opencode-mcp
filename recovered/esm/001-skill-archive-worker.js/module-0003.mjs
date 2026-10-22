// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/skill-archive-worker.js
// Original module marker: src/skill-archive-limits.ts
import { __toESM } from "./module-0000.mjs";


// src/skill-archive-limits.ts
var import_node_path = __toESM(require("node:path"), 1);

var SKILL_ARCHIVE_MAX_BYTES = 2 * 1024 * 1024 * 1024 - 1;

var SKILL_ARCHIVE_TOO_LARGE_HINT = "\u538B\u7F29\u5305\u8D85\u8FC7 2 GB\uFF0C\u8D85\u51FA\u5355\u6587\u4EF6\u4E00\u6B21\u8BFB\u5165\u7684\u6280\u672F\u4E0A\u9650\uFF08\u4E0D\u662F Skill \u5927\u5C0F\u9650\u5236\uFF09\u3002\u8BF7\u89E3\u538B\u540E\u76F4\u63A5\u5BFC\u5165 Skill \u6587\u4EF6\u5939\uFF0C\u6587\u4EF6\u5939\u5BFC\u5165\u6CA1\u6709\u5927\u5C0F\u9650\u5236\u3002";

var SKILL_ARCHIVE_ENTRY_RATIO = 100;

var SKILL_ARCHIVE_ENTRY_RATIO_FLOOR = 1024 * 1024;

var SKILL_ARCHIVE_TOTAL_RATIO = 100;

var SKILL_ARCHIVE_TOTAL_RATIO_FLOOR = 8 * 1024 * 1024;

var SKILL_ARCHIVE_MAX_NAME_BYTES = 255;

var SKILL_ARCHIVE_MAX_PATH_BYTES = 1024;

var REPACK_HINT = "\u8BF7\u91CD\u65B0\u6253\u5305\u4E3A zip\u3002";

var NON_UTF8_HINT = "\u538B\u7F29\u5305\u91CC\u7684\u6587\u4EF6\u540D\u7F16\u7801\u4E0D\u662F UTF-8\uFF08\u5E38\u89C1\u4E8E\u7CFB\u7EDF\u81EA\u5E26\u7684\u538B\u7F29\u5DE5\u5177\uFF09\u3002\u8BF7\u7528 7-Zip \u6216 Bandizip \u4EE5 UTF-8 \u91CD\u65B0\u6253\u5305\u3002";

var SkillArchiveError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = "SkillArchiveError";
  }
  code;
};

var shown = (value) => {
  const clean = value.replace(/[\x00-\x1f\x7f]/g, "?");
  return clean.length > 120 ? `${clean.slice(0, 117)}\u2026` : clean;
};

function safeArchiveParts(raw) {
  const name = raw.replace(/\\/g, "/");
  const directory = name.endsWith("/");
  const parts = (directory ? name.slice(0, -1) : name).split("/");
  const unsafe = !name || parts.some((part) => !part || part === "." || part === ".." || /[\x00-\x1f\x7f<>:"|?*]/.test(part) || /[. ]$/.test(part) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part) || Buffer.byteLength(part, "utf8") > SKILL_ARCHIVE_MAX_NAME_BYTES);
  if (unsafe) throw new SkillArchiveError("unsafe-path", `\u538B\u7F29\u5305\u5305\u542B\u4E0D\u5B89\u5168\u7684\u8DEF\u5F84\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\uFF1A${shown(raw)}`);
  return { parts, directory };
}

function isJunkArchiveEntry(parts) {
  const last = parts[parts.length - 1] ?? "";
  return parts.includes("__MACOSX") || last.startsWith("._") || [".ds_store", "thumbs.db", "desktop.ini"].includes(last.toLowerCase());
}

function crc32(data) {
  let crc = 4294967295;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc >>> 1 ^ (crc & 1 ? 3988292384 : 0);
  }
  return (crc ^ 4294967295) >>> 0;
}

var ArchiveEntryBudget = class {
  constructor(destination) {
    this.destination = destination;
  }
  destination;
  files = /* @__PURE__ */ new Set();
  directories = /* @__PURE__ */ new Set();
  declared = /* @__PURE__ */ new Set();
  entries = 0;
  total = 0;
  admit(parts, directory, size) {
    if (!Number.isSafeInteger(size) || size < 0 || directory && size !== 0) throw new SkillArchiveError("corrupt", "\u538B\u7F29\u5305\u6761\u76EE\u5927\u5C0F\u4E0D\u5408\u6CD5\u3002");
    this.total += size;
    if (Buffer.byteLength(import_node_path.default.join(this.destination, ...parts), "utf8") > SKILL_ARCHIVE_MAX_PATH_BYTES) {
      throw new SkillArchiveError("unsafe-path", `\u538B\u7F29\u5305\u4E2D\u7684\u8DEF\u5F84\u8FC7\u957F\uFF1A${shown(parts.join("/"))}`);
    }
    const keys = parts.map((_, index) => parts.slice(0, index + 1).join("/").normalize("NFC").toLowerCase());
    const key = keys.pop();
    for (const parent of keys) {
      if (this.files.has(parent)) throw new SkillArchiveError("duplicate-path", `\u538B\u7F29\u5305\u4E2D\u6587\u4EF6\u4E0E\u76EE\u5F55\u540C\u540D\uFF1A${shown(parent)}`);
      this.directories.add(parent);
    }
    const clash = directory ? this.files.has(key) || this.declared.has(key) : this.files.has(key) || this.directories.has(key);
    if (clash) throw new SkillArchiveError("duplicate-path", `\u538B\u7F29\u5305\u5305\u542B\u91CD\u590D\u8DEF\u5F84\uFF08\u542B\u5927\u5C0F\u5199\u6216 Unicode \u89C4\u8303\u5316\u540E\u76F8\u540C\u7684\u540D\u79F0\uFF09\uFF1A${shown(parts.join("/"))}`);
    if (directory) {
      this.directories.add(key);
      this.declared.add(key);
    } else this.files.add(key);
  }
};
export { safeArchiveParts, isJunkArchiveEntry, crc32, import_node_path, SKILL_ARCHIVE_MAX_BYTES, SKILL_ARCHIVE_TOO_LARGE_HINT, SKILL_ARCHIVE_ENTRY_RATIO, SKILL_ARCHIVE_ENTRY_RATIO_FLOOR, SKILL_ARCHIVE_TOTAL_RATIO, SKILL_ARCHIVE_TOTAL_RATIO_FLOOR, SKILL_ARCHIVE_MAX_NAME_BYTES, SKILL_ARCHIVE_MAX_PATH_BYTES, REPACK_HINT, NON_UTF8_HINT, SkillArchiveError, shown, ArchiveEntryBudget };
