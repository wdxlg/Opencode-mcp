// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/skill-archive-worker.js
// Original module marker: src/skill-safe-zip.ts
import { __toESM } from "./module-0000.mjs";
import { ArchiveEntryBudget, NON_UTF8_HINT, REPACK_HINT, SKILL_ARCHIVE_ENTRY_RATIO, SKILL_ARCHIVE_ENTRY_RATIO_FLOOR, SKILL_ARCHIVE_MAX_BYTES, SKILL_ARCHIVE_TOO_LARGE_HINT, SKILL_ARCHIVE_TOTAL_RATIO, SKILL_ARCHIVE_TOTAL_RATIO_FLOOR, SkillArchiveError, crc32, isJunkArchiveEntry, safeArchiveParts } from "./module-0003.mjs";


// src/skill-safe-zip.ts
var import_node_fs = require("node:fs");

var import_node_path3 = __toESM(require("node:path"), 1);

var import_node_zlib = require("node:zlib");

function entryName(raw, flags, extra) {
  const text = raw.toString("utf8");
  if (flags & 2048 || Buffer.from(text, "utf8").equals(raw)) {
    if (!Buffer.from(text, "utf8").equals(raw)) throw new SkillArchiveError("non-utf8-name", NON_UTF8_HINT);
    return text;
  }
  for (let offset = 0; offset + 4 <= extra.length; ) {
    const id = extra.readUInt16LE(offset), size = extra.readUInt16LE(offset + 2), body = extra.subarray(offset + 4, offset + 4 + size);
    if (id === 28789 && body.length >= 5 && body[0] === 1 && body.readUInt32LE(1) === crc32(raw)) {
      const unicode = body.subarray(5), name = unicode.toString("utf8");
      if (Buffer.from(name, "utf8").equals(unicode)) return name;
    }
    offset += 4 + size;
  }
  throw new SkillArchiveError("non-utf8-name", NON_UTF8_HINT);
}

function extractSafeSkillZipBuffer(zip, destination) {
  if (zip.length > SKILL_ARCHIVE_MAX_BYTES) throw new SkillArchiveError("too-large", SKILL_ARCHIVE_TOO_LARGE_HINT);
  let end = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
    if (zip.readUInt32LE(i) === 101010256 && i + 22 + zip.readUInt16LE(i + 20) === zip.length) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new SkillArchiveError("corrupt", "ZIP \u76EE\u5F55\u635F\u574F\u3002");
  const count = zip.readUInt16LE(end + 10), centralSize = zip.readUInt32LE(end + 12), central = zip.readUInt32LE(end + 16);
  if (zip.readUInt16LE(end + 4) || zip.readUInt16LE(end + 6) || zip.readUInt16LE(end + 8) !== count || count === 65535 || central === 4294967295 || central + centralSize !== end) {
    throw new SkillArchiveError("encrypted", `\u4E0D\u652F\u6301\u5206\u5377\u6216 ZIP64 \u683C\u5F0F\u7684 ZIP\u3002${REPACK_HINT}`);
  }
  const entries = [];
  const budget = new ArchiveEntryBudget(destination);
  let cursor = central;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > end || zip.readUInt32LE(cursor) !== 33639248) throw new SkillArchiveError("corrupt", "ZIP \u4E2D\u592E\u76EE\u5F55\u635F\u574F\u3002");
    const flags = zip.readUInt16LE(cursor + 8), method = zip.readUInt16LE(cursor + 10);
    const compressed = zip.readUInt32LE(cursor + 20), size = zip.readUInt32LE(cursor + 24);
    const nameLength = zip.readUInt16LE(cursor + 28), extraLength = zip.readUInt16LE(cursor + 30), commentLength = zip.readUInt16LE(cursor + 32);
    const mode = zip.readUInt32LE(cursor + 38) >>> 16 & 61440, offset = zip.readUInt32LE(cursor + 42);
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > end) throw new SkillArchiveError("corrupt", "ZIP \u4E2D\u592E\u76EE\u5F55\u635F\u574F\u3002");
    if (flags & 1 || flags & 64) throw new SkillArchiveError("encrypted", `ZIP \u5DF2\u52A0\u5BC6\uFF0C\u65E0\u6CD5\u5BFC\u5165\u3002${REPACK_HINT}`);
    if (zip.readUInt16LE(cursor + 34)) throw new SkillArchiveError("encrypted", `\u4E0D\u652F\u6301\u5206\u5377 ZIP\u3002${REPACK_HINT}`);
    if (method !== 0 && method !== 8) throw new SkillArchiveError("repack-required", `ZIP \u4F7F\u7528\u4E86\u4E0D\u652F\u6301\u7684\u538B\u7F29\u65B9\u5F0F\uFF08\u4EC5\u652F\u6301\u5B58\u50A8\u4E0E Deflate\uFF09\u3002${REPACK_HINT}`);
    if (mode !== 0 && mode !== 32768 && mode !== 16384) throw new SkillArchiveError("link-or-special", "ZIP \u5305\u542B\u7B26\u53F7\u94FE\u63A5\u6216\u7279\u6B8A\u6587\u4EF6\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002");
    const rawName = zip.subarray(cursor + 46, cursor + 46 + nameLength);
    const { parts, directory } = safeArchiveParts(entryName(rawName, flags, zip.subarray(cursor + 46 + nameLength, cursor + 46 + nameLength + extraLength)));
    budget.admit(parts, directory, size);
    if (size > SKILL_ARCHIVE_ENTRY_RATIO_FLOOR && size > SKILL_ARCHIVE_ENTRY_RATIO * Math.max(1, compressed)) {
      throw new SkillArchiveError("ratio", `\u538B\u7F29\u6BD4\u5F02\u5E38\uFF08${parts.join("/")} \u8D85\u8FC7 ${SKILL_ARCHIVE_ENTRY_RATIO} \u500D\uFF09\uFF0C\u7591\u4F3C\u538B\u7F29\u70B8\u5F39\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002`);
    }
    if (offset + 30 > central || zip.readUInt32LE(offset) !== 67324752 || zip.readUInt16LE(offset + 6) !== flags || zip.readUInt16LE(offset + 8) !== method) throw new SkillArchiveError("corrupt", "ZIP \u672C\u5730\u6587\u4EF6\u5934\u635F\u574F\u3002");
    const localNameLength = zip.readUInt16LE(offset + 26), localExtraLength = zip.readUInt16LE(offset + 28);
    const start = offset + 30 + localNameLength + localExtraLength;
    if (start + compressed > central || !zip.subarray(offset + 30, offset + 30 + localNameLength).equals(rawName)) throw new SkillArchiveError("corrupt", "ZIP \u6587\u4EF6\u6570\u636E\u8D8A\u754C\u3002");
    entries.push({ parts, directory, start, compressed, size, method, crc: zip.readUInt32LE(cursor + 16) });
    cursor = next;
  }
  if (cursor !== end) throw new SkillArchiveError("corrupt", "ZIP \u76EE\u5F55\u957F\u5EA6\u4E0D\u4E00\u81F4\u3002");
  if (budget.total > SKILL_ARCHIVE_TOTAL_RATIO_FLOOR && budget.total > SKILL_ARCHIVE_TOTAL_RATIO * zip.length) {
    throw new SkillArchiveError("ratio", `\u538B\u7F29\u6BD4\u5F02\u5E38\uFF08\u6574\u4F53\u8D85\u8FC7 ${SKILL_ARCHIVE_TOTAL_RATIO} \u500D\uFF09\uFF0C\u7591\u4F3C\u538B\u7F29\u70B8\u5F39\uFF0C\u5DF2\u62D2\u7EDD\u5BFC\u5165\u3002`);
  }
  let written = 0;
  for (const entry of entries) {
    if (isJunkArchiveEntry(entry.parts)) continue;
    const target = import_node_path3.default.join(destination, ...entry.parts);
    if (entry.directory) {
      (0, import_node_fs.mkdirSync)(target, { recursive: true });
      continue;
    }
    const packed = zip.subarray(entry.start, entry.start + entry.compressed);
    let content;
    try {
      content = entry.method === 0 ? packed : (0, import_node_zlib.inflateRawSync)(packed, { maxOutputLength: Math.max(1, entry.size) });
    } catch {
      throw new SkillArchiveError("corrupt", "ZIP \u6587\u4EF6\u6821\u9A8C\u5931\u8D25\u3002");
    }
    if (content.length !== entry.size || crc32(content) !== entry.crc) throw new SkillArchiveError("corrupt", "ZIP \u6587\u4EF6\u6821\u9A8C\u5931\u8D25\u3002");
    (0, import_node_fs.mkdirSync)(import_node_path3.default.dirname(target), { recursive: true });
    (0, import_node_fs.writeFileSync)(target, content, { flag: "wx", mode: 384 });
    written++;
  }
  return { entries: written, bytes: budget.total };
}
export { entryName, extractSafeSkillZipBuffer, import_node_fs, import_node_path3, import_node_zlib };
