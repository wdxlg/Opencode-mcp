// Item 10 — skills lock: skills-lock.json records the exact Skill versions a workspace/task used (name, path,
// declared version/provenance, file count, sha256 tree hash). Skills read through read_files (SKILL.md / skill.md)
// are remembered per task, so the lock can be limited to the Skills a task actually used.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { statePath, readJson, writeJsonAtomic, nowIso, safeName } from "./core.mjs";

const SKIP = new Set([".git", "node_modules", "__pycache__", ".venv"]);
const usedFile = (taskId) => statePath("skills-used", `${safeName(taskId ?? "_none")}.json`);

export function treeHash(dir) {
  const files = [];
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (SKIP.has(e.name)) continue;
      const abs = path.join(d, e.name), r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(abs, r);
      else if (e.isFile()) files.push([r, crypto.createHash("sha256").update(fs.readFileSync(abs)).digest("hex")]);
    }
  };
  walk(dir, "");
  const h = crypto.createHash("sha256");
  for (const [r, fh] of files) h.update(`${r}\0${fh}\n`);
  return { sha256: h.digest("hex"), files: files.length };
}
function frontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out = {};
  if (m) for (const l of m[1].split(/\r?\n/)) { const kv = l.match(/^([A-Za-z_][\w-]*):\s*(.*)$/); if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, ""); }
  return out;
}
export function describeSkill(dir) {
  const skillFile = ["SKILL.md", "skill.md"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  if (!skillFile) return null;
  const fm = frontMatter(fs.readFileSync(skillFile, "utf8"));
  const prov = readJson(path.join(dir, "_provenance", "SOURCE.json"), null) ?? readJson(path.join(dir, "SOURCE.json"), null);
  const { sha256, files } = treeHash(dir);
  return { name: fm.name ?? path.basename(dir), path: dir, version: fm.version ?? null, source: prov ? { repo: prov.repo ?? prov.repository ?? prov.source ?? null, commit: prov.commit ?? prov.ref ?? null } : null, files, sha256 };
}
function skillDirs({ skill_dirs, roots }) {
  if (Array.isArray(skill_dirs) && skill_dirs.length) return skill_dirs.map((d) => path.resolve(d));
  const out = [];
  for (const r of roots ?? []) { let names = []; try { names = fs.readdirSync(r, { withFileTypes: true }); } catch { continue; } for (const e of names) if (e.isDirectory()) out.push(path.join(r, e.name)); }
  return out;
}
export function usedSkills(taskId) { return readJson(usedFile(taskId), { skills: [] }).skills; }

export function writeLock({ root, skill_dirs, used_only = false, task_id = null }, config) {
  if (!root) throw Object.assign(new Error("root（写入 skills-lock.json 的工作区根目录）必填"), { code: "INVALID_ARGUMENT" });
  const dirs = used_only ? usedSkills(task_id) : skillDirs({ skill_dirs, roots: config.skillsLock?.skillRoots });
  const skills = dirs.map((d) => describeSkill(d)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const lock = { lockfileVersion: 1, generatedAt: nowIso(), task_id, scope: used_only ? "used-by-task" : "listed", skills };
  writeJsonAtomic(path.join(path.resolve(root), "skills-lock.json"), lock);
  return { path: path.join(path.resolve(root), "skills-lock.json"), count: skills.length };
}
export function verifyLock({ root }) {
  const lock = readJson(path.join(path.resolve(root), "skills-lock.json"), null);
  if (!lock) return { ok: false, missingLock: true };
  const changed = [], missing = [];
  for (const s of lock.skills) {
    if (!fs.existsSync(s.path)) { missing.push(s.name); continue; }
    const now = treeHash(s.path);
    if (now.sha256 !== s.sha256) changed.push({ name: s.name, locked: s.sha256.slice(0, 12), current: now.sha256.slice(0, 12) });
  }
  return { ok: !changed.length && !missing.length, checked: lock.skills.length, changed, missing };
}

export const skillsLockFeature = {
  id: "skillsLock",
  after(ctx) {
    if (!ctx.config.skillsLock?.enabled) return;
    for (const c of ctx.calls) {
      if (c.tool !== "read_files" || c.result?.isError) continue;
      const dirs = (c.args?.files ?? []).map((f) => String(f?.path ?? "")).filter((p) => /[\\/]skill\.md$/i.test(p)).map((p) => path.dirname(p));
      if (!dirs.length) continue;
      const f = usedFile(ctx.session?.taskId);
      const db = readJson(f, { skills: [] });
      db.skills = [...new Set([...db.skills, ...dirs])];
      writeJsonAtomic(f, db);
    }
  },
  actions: {
    skills_lock_write: (a, c) => writeLock({ ...a, task_id: a.task_id ?? c.session?.taskId ?? null }, c.config),
    skills_lock_verify: (a) => verifyLock(a),
    skills_used: (a, c) => ({ task_id: a.task_id ?? c.session?.taskId ?? null, skills: usedSkills(a.task_id ?? c.session?.taskId) })
  }
};
