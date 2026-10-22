// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/skill-archive-worker.js
// Original module marker: src/skill-safe-targz.ts
import { __toESM } from "./module-0000.mjs";
import { ArchiveEntryBudget, NON_UTF8_HINT, SKILL_ARCHIVE_MAX_BYTES, SKILL_ARCHIVE_TOO_LARGE_HINT, SKILL_ARCHIVE_TOTAL_RATIO, SKILL_ARCHIVE_TOTAL_RATIO_FLOOR, SkillArchiveError, isJunkArchiveEntry, safeArchiveParts } from "./module-0003.mjs";


// src/skill-safe-targz.ts
var import_node_fs2 = require("node:fs");

var import_node_path4 = __toESM(require("node:path"), 1);

var import_node_zlib2 = require("node:zlib");

var BLOCK = 512;

var corrupt = (detail) => new SkillArchiveError("corrupt", `tar.gz \u635F\u574F\u6216\u4E0D\u662F\u6709\u6548\u7684 tar \u5305\uFF08${detail}\uFF09\u3002`);

function utf8(bytes) {
  const text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new SkillArchiveError("non-utf8-name", NON_UTF8_HINT);
  return text;
}

function field(header, offset, length) {
  const bytes = header.subarray(offset, offset + length), nul = bytes.indexOf(0);
  return nul < 0 ? bytes : bytes.subarray(0, nul);
}

function octal(header, offset, length) {
  if (header[offset] & 128) throw new SkillArchiveError("corrupt", "tar \u4F7F\u7528\u4E86 base-256 \u6570\u5B57\u5B57\u6BB5\uFF08\u8D85\u5927\u6587\u4EF6\u6216\u7279\u6B8A\u5F52\u6863\uFF09\uFF0C\u4E0D\u652F\u6301\u3002");
  const text = field(header, offset, length).toString("latin1").trim();
  if (!text) return 0;
  if (!/^[0-7]+$/.test(text)) throw corrupt("\u6570\u5B57\u5B57\u6BB5\u65E0\u6548");
  return parseInt(text, 8);
}

function checksumOk(header) {
  let unsigned = 0, signed = 0;
  for (let i = 0; i < BLOCK; i++) {
    const byte = i >= 148 && i < 156 ? 32 : header[i];
    unsigned += byte;
    signed += byte > 127 ? byte - 256 : byte;
  }
  const expected = octal(header, 148, 8);
  return expected === unsigned || expected === signed;
}

var isZero = (tar, offset) => offset + BLOCK <= tar.length && tar.subarray(offset, offset + BLOCK).every((byte) => byte === 0);

function paxRecords(data) {
  const records = /* @__PURE__ */ new Map();
  let offset = 0;
  while (offset < data.length) {
    const space = data.indexOf(32, offset);
    const length = space > offset ? Number(data.subarray(offset, space).toString("latin1")) : NaN;
    if (!Number.isInteger(length) || length <= 0 || offset + length > data.length || data[offset + length - 1] !== 10) throw corrupt("PAX \u6269\u5C55\u5934\u65E0\u6548");
    const record = data.subarray(space + 1, offset + length - 1), equals = record.indexOf(61);
    if (equals <= 0) throw corrupt("PAX \u6269\u5C55\u5934\u65E0\u6548");
    records.set(record.subarray(0, equals).toString("latin1"), utf8(record.subarray(equals + 1)));
    offset += length;
  }
  return records;
}

function extractSafeSkillTarGzBuffer(gz, destination) {
  if (gz.length > SKILL_ARCHIVE_MAX_BYTES) throw new SkillArchiveError("too-large", SKILL_ARCHIVE_TOO_LARGE_HINT);
  let tar;
  try {
    tar = (0, import_node_zlib2.gunzipSync)(gz);
  } catch (error) {
    if (error instanceof RangeError || error.code === "ERR_BUFFER_TOO_LARGE") throw new SkillArchiveError("too-large", "tar.gz \u89E3\u538B\u540E\u8D85\u8FC7\u5355\u6B21\u5185\u5B58\u89E3\u7801\u7684\u6280\u672F\u4E0A\u9650\uFF08\u4E0D\u662F Skill \u5927\u5C0F\u9650\u5236\uFF09\u3002\u8BF7\u89E3\u538B\u540E\u76F4\u63A5\u5BFC\u5165 Skill \u6587\u4EF6\u5939\uFF0C\u6587\u4EF6\u5939\u5BFC\u5165\u6CA1\u6709\u5927\u5C0F\u9650\u5236\u3002");
    throw corrupt("gzip \u6570\u636E\u65E0\u6CD5\u89E3\u538B");
  }
  if (tar.length > SKILL_ARCHIVE_TOTAL_RATIO_FLOOR && tar.length > SKILL_ARCHIVE_TOTAL_RATIO * gz.length) {
    throw new SkillArchiveError("ratio", `\u538B\u7F29\u6BD4\u5F02\u5E38\uFF08\u6574\u4F53\u8D85\u8FC7 ${SKILL_ARCHIVE_TOTAL_RATIO} \u500D\uFF09\uFF0C\u7591\u4F3C\u538B\u7F29\u70B8\u5F39\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002`);
  }
  const budget = new ArchiveEntryBudget(destination);
  const entries = [];
  let pax = /* @__PURE__ */ new Map(), longName, offset = 0, headers = 0;
  for (; ; ) {
    if (offset === tar.length) break;
    if (offset + BLOCK > tar.length) throw corrupt("\u6570\u636E\u610F\u5916\u7ED3\u675F");
    if (isZero(tar, offset)) break;
    ++headers;
    const header = tar.subarray(offset, offset + BLOCK);
    if (!checksumOk(header)) throw corrupt("\u5934\u90E8\u6821\u9A8C\u548C\u4E0D\u7B26");
    const type = header[156] === 0 ? "0" : String.fromCharCode(header[156]);
    const paxSize = pax.get("size");
    if (paxSize !== void 0 && !/^\d+$/.test(paxSize)) throw corrupt("PAX size \u65E0\u6548");
    const size = paxSize !== void 0 && type !== "x" && type !== "g" ? Number(paxSize) : octal(header, 124, 12);
    const start = offset + BLOCK, next = start + Math.ceil(size / BLOCK) * BLOCK;
    if (!Number.isSafeInteger(size) || start + size > tar.length) throw corrupt("\u6761\u76EE\u6570\u636E\u8D8A\u754C");
    if (type === "x" || type === "g" || type === "L") {
      if (size > 64 * 1024) throw corrupt("\u6269\u5C55\u5934\u8FC7\u5927");
      const data = tar.subarray(start, start + size);
      if (type === "x") pax = paxRecords(data);
      else if (type === "L") longName = utf8(field(data, 0, data.length));
      offset = next;
      continue;
    }
    if ([...pax.keys()].some((key) => key.startsWith("GNU.sparse."))) throw new SkillArchiveError("link-or-special", "tar \u5305\u542B\u7A00\u758F\u6587\u4EF6\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002");
    if ("12346K".includes(type)) throw new SkillArchiveError("link-or-special", "tar \u5305\u542B\u7B26\u53F7\u94FE\u63A5\u3001\u786C\u94FE\u63A5\u6216\u8BBE\u5907\u7B49\u7279\u6B8A\u6587\u4EF6\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002");
    if (type !== "0" && type !== "7" && type !== "5") throw new SkillArchiveError("link-or-special", `tar \u5305\u542B\u4E0D\u652F\u6301\u7684\u6761\u76EE\u7C7B\u578B\uFF08${type}\uFF09\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002`);
    const posix = header.subarray(257, 263).toString("latin1") === "ustar\0";
    const prefix = posix ? utf8(field(header, 345, 155)) : "";
    const ownName = utf8(field(header, 0, 100));
    const name = pax.get("path") ?? longName ?? (prefix ? `${prefix}/${ownName}` : ownName);
    const directory = type === "5" || name.endsWith("/");
    const safe = safeArchiveParts(directory && !name.endsWith("/") ? `${name}/` : name);
    budget.admit(safe.parts, safe.directory, safe.directory ? 0 : size);
    entries.push({ parts: safe.parts, directory: safe.directory, start, size });
    pax = /* @__PURE__ */ new Map();
    longName = void 0;
    offset = next;
  }
  let written = 0;
  for (const entry of entries) {
    if (isJunkArchiveEntry(entry.parts)) continue;
    const target = import_node_path4.default.join(destination, ...entry.parts);
    if (entry.directory) {
      (0, import_node_fs2.mkdirSync)(target, { recursive: true });
      continue;
    }
    (0, import_node_fs2.mkdirSync)(import_node_path4.default.dirname(target), { recursive: true });
    (0, import_node_fs2.writeFileSync)(target, tar.subarray(entry.start, entry.start + entry.size), { flag: "wx", mode: 384 });
    written++;
  }
  return { entries: written, bytes: budget.total };
}
export { utf8, field, octal, checksumOk, paxRecords, extractSafeSkillTarGzBuffer, import_node_fs2, import_node_path4, import_node_zlib2, BLOCK, corrupt, isZero };
