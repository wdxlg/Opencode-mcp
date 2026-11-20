// 「复制记忆后接班」：把源任务的记忆文件夹完整复制一份，并把副本内所有指向旧文件夹或旧任务 ID 的地方
// 改写成新位置和新 ID。原文件夹只读不改。由 Bridge 任务存储在复制任务卡时调用。
import fs from "node:fs";
import path from "node:path";

const TEXT_EXT = new Set([".json", ".jsonl", ".md", ".txt", ".yaml", ".yml"]);
const MAX_TEXT_BYTES = 32 * 1024 * 1024;

function variants(from, to) {
  // 原样、正斜杠、JSON 转义（Windows 反斜杠在 JSON 里是双反斜杠）三种写法都替换。
  const pairs = [[from, to]];
  const fwdFrom = from.replace(/\\/g, "/"), fwdTo = to.replace(/\\/g, "/");
  if (fwdFrom !== from) pairs.push([fwdFrom, fwdTo]);
  const jsFrom = JSON.stringify(from).slice(1, -1), jsTo = JSON.stringify(to).slice(1, -1);
  if (jsFrom !== from) pairs.push([jsFrom, jsTo]);
  return pairs;
}

function rewriteTree(dir, pairs, counter) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { rewriteTree(full, pairs, counter); continue; }
    if (!entry.isFile() || !TEXT_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    if (fs.statSync(full).size > MAX_TEXT_BYTES) continue;
    const before = fs.readFileSync(full, "utf8");
    let after = before;
    for (const [a, b] of pairs) if (a) after = after.split(a).join(b);
    if (after !== before) { fs.writeFileSync(full, after, "utf8"); counter.files++; }
  }
}

/** 复制 sourceDir 到 targetDir（targetDir 必须不存在），并改写副本内的路径与任务 ID。返回改写的文件数。 */
export function copyTaskMemoryDir(sourceDir, targetDir, { sourceTaskId, targetTaskId, origin } = {}) {
  if (!sourceDir || !fs.existsSync(sourceDir)) throw new Error("源任务记忆文件夹不存在：" + sourceDir);
  if (fs.existsSync(targetDir)) throw new Error("目标记忆文件夹已存在：" + targetDir);
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true, errorOnExist: true, force: false });
  const pairs = variants(sourceDir, targetDir);
  if (sourceTaskId && targetTaskId) pairs.push([sourceTaskId, targetTaskId]);
  pairs.sort((a, b) => b[0].length - a[0].length);
  const counter = { files: 0 };
  rewriteTree(targetDir, pairs, counter);
  fs.writeFileSync(path.join(targetDir, "fork-origin.json"), JSON.stringify({
    note: "本文件夹是「复制记忆后接班」生成的独立副本，内部路径和任务 ID 已改写为本副本；原任务记忆未改动。",
    ...(origin || {}), sourceMemoryDir: sourceDir, copy: targetDir, rewrittenFiles: counter.files
  }, null, 2), "utf8");
  return counter.files;
}
