const fs = require('fs'), path = require('path'), crypto = require('crypto');
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
// Hash of the immediately preceding, checked-in defaults manifest. Any future
// retirement must explicitly add the prior trusted manifest hash here.
const TRUSTED_RETIREMENTS = new Set(['5294ce600e930a5e7bd9a3404d0c15c961aa80065e87a850b4f131d5118f64cf','959d7e5e80d2c05bb1a1c689dbfb0807c29123273f360fe710f76bcc5c92604d']);
function resolveInside(base, rel) {
  if (typeof rel !== 'string' || !rel || rel.includes('\\') || path.isAbsolute(rel) || rel.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Unsafe default manifest path: ' + rel);
  const file = path.resolve(base, ...rel.split('/'));
  if (!file.startsWith(path.resolve(base) + path.sep)) throw Error('Default manifest path escapes its root: ' + rel);
  return file;
}
function safeExisting(file, base) {
  for (let cursor = file;; cursor = path.dirname(cursor)) {
    try { if (fs.lstatSync(cursor).isSymbolicLink()) throw Error('Linked default path refused: ' + cursor); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (cursor === base) break;
    if (path.dirname(cursor) === cursor) throw Error('Invalid default path root');
  }
}
function validateEntry(item, seen) {
  if (!item || typeof item.path !== 'string' || typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(item.sha256)) throw Error('Invalid default manifest entry');
  const key = process.platform === 'win32' ? item.path.toLowerCase() : item.path;
  if (seen.has(key)) throw Error('Duplicate default manifest entry: ' + item.path);
  seen.add(key);
}
function copyDefaults(root, trustedRetirements = TRUSTED_RETIREMENTS) {
  root = path.resolve(root);
  const src = path.join(root, 'defaults');
  const dest = path.join(root, 'generated', 'source-build', 'resources', 'app', 'extensions', 'opencode', 'defaults');
  const sourceManifest = path.join(src, 'manifest.json');
  safeExisting(sourceManifest, src);
  const manifestBytes = fs.readFileSync(sourceManifest);
  const manifest = JSON.parse(manifestBytes);
  if (!Array.isArray(manifest.files) || !Array.isArray(manifest.skills)) throw Error('Invalid default manifest');
  const entries = new Map(), sourceSeen = new Set();
  for (const item of manifest.files) {
    validateEntry(item, sourceSeen);
    const source = resolveInside(src, item.path), target = resolveInside(dest, item.path);
    safeExisting(source, src); safeExisting(target, dest);
    const data = fs.readFileSync(source);
    if (digest(data) !== item.sha256 || (item.bytes !== undefined && item.bytes !== data.length)) throw Error('Default source differs from manifest: ' + item.path);
    entries.set(item.path, { target, data });
  }
  const oldManifestPath = path.join(dest, 'manifest.json');
  safeExisting(oldManifestPath, dest);
  const oldBytes = fs.existsSync(oldManifestPath) ? fs.readFileSync(oldManifestPath) : null;
  const old = oldBytes ? JSON.parse(oldBytes) : { files: [] };
  if (!Array.isArray(old.files)) throw Error('Invalid previous generated default manifest');
  const removals = [], oldEntries = new Map(), oldSeen = new Set();
  let retired = 0;
  for (const item of old.files) {
    validateEntry(item, oldSeen);
    const target = resolveInside(dest, item.path);
    oldEntries.set(item.path, item);
    safeExisting(target, dest);
    const replacement = entries.get(item.path);
    if (replacement) {
      if (fs.existsSync(target)) {
        if (!fs.lstatSync(target).isFile()) throw Error('Generated default is not a file: ' + item.path);
        const existing = fs.readFileSync(target);
        if (!existing.equals(replacement.data) && digest(existing) !== item.sha256) throw Error('Generated default was customized; refusing overwrite: ' + item.path);
      }
      continue;
    }
    retired++;
    if (!fs.existsSync(target)) continue;
    if (!fs.lstatSync(target).isFile() || digest(fs.readFileSync(target)) !== item.sha256) throw Error('Obsolete generated default was customized; refusing removal: ' + item.path);
    removals.push(target);
  }
  if (retired && (!oldBytes || !trustedRetirements.has(digest(oldBytes)))) throw Error('Previous default manifest is not trusted for retirement');
  for (const [rel, { target }] of entries) {
    if (!oldEntries.has(rel) && fs.existsSync(target)) throw Error('New default conflicts with an unmanaged file: ' + rel);
  }
  // All conflicts are checked before mutation. Only manifest-owned, unmodified
  // obsolete files from a known previous release may be removed.
  const directories = new Set();
  for (const file of removals) {
    fs.unlinkSync(file);
    for (let dir = path.dirname(file); dir !== dest && dir.startsWith(dest + path.sep); dir = path.dirname(dir)) directories.add(dir);
  }
  for (const dir of [...directories].sort((a, b) => b.length - a.length)) {
    if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory() && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
  let changed = 0;
  for (const { target, data } of entries.values()) {
    if (!fs.existsSync(target) || !fs.readFileSync(target).equals(data)) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, data);
      changed++;
    }
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(oldManifestPath, manifestBytes);
  return { skills: manifest.skills.length, files: manifest.files.length, changed, removed: removals.length };
}
if (require.main === module) {
  const root = path.resolve(process.env.OPENCODE_RECOVERY_ROOT || path.resolve(__dirname, '..'));
  console.log('DEFAULTS ' + JSON.stringify(copyDefaults(root)));
}
module.exports = { copyDefaults };
