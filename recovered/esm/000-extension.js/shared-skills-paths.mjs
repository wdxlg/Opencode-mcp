import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
// User-owned pointer outside VSCODE_PORTABLE survives installation moves/upgrades.
export function sharedSkillsSettingsFile() {
  return path.join(os.homedir(), '.opencode', 'shared-skills.json');
}
function noLinks(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw Error('SHARED_SKILLS_ABSOLUTE_PATH_REQUIRED');
  const target = path.resolve(value);
  for (let cursor = target;;) {
    try { if (fs.lstatSync(cursor).isSymbolicLink()) throw Error('SHARED_SKILLS_LINK_NOT_ALLOWED'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return target;
}
export function safeGlobalSkillPath(value) {
  const target = noLinks(value);
  if (path.dirname(target) === target) throw Error('SHARED_SKILLS_ROOT_NOT_ALLOWED');
  try { if (!fs.statSync(target).isDirectory()) throw Error('SHARED_SKILLS_DIRECTORY_REQUIRED'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  return target;
}
export function readSharedSkillsDirectory() {
  const file = noLinks(sharedSkillsSettingsFile());
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return undefined; throw error; }
  const value = JSON.parse(text);
  if (value?.version !== 3 || value.kind !== 'opencode-shared-skills') throw Error('SHARED_SKILLS_CONFIG_INVALID');
  return safeGlobalSkillPath(value.directory);
}
export function writeSharedSkillsDirectory(directory) {
  directory = safeGlobalSkillPath(directory);
  const file = noLinks(sharedSkillsSettingsFile());
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 448 });
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temporary, JSON.stringify({ version: 3, kind: 'opencode-shared-skills', directory }, null, 2) + '\n', { flag: 'wx', mode: 384 });
    fs.renameSync(temporary, file);
  } finally { fs.rmSync(temporary, { force: true }); }
}
