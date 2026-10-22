// Artifact reassembly only. This does NOT compile recovered TypeScript or native code.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const readJSON = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const args = process.argv.slice(2);
if (args.some(a => a !== '--allow-edits' && !a.startsWith('--bundle='))) {
  throw new Error('Usage: node scripts/reassemble.cjs [--allow-edits] [--bundle=ID]');
}
const allowEdits = args.includes('--allow-edits');
const selected = args.find(a => a.startsWith('--bundle='))?.slice(9);
const manifest = readJSON('reports/bundle-manifest.json');
const bundles = manifest.bundles.filter(b => !selected || b.id === selected);
if (!bundles.length) throw new Error('Unknown bundle ID');
const generated = path.join(root, 'generated');
fs.mkdirSync(generated, { recursive: true });
const output = path.join(generated, (selected ? 'bundle-overlay-' : 'artifact-application-') + Date.now());
fs.mkdirSync(output); // Existing destinations are never replaced.
const safePath = (base, relative) => {
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(path.resolve(base) + path.sep)) throw new Error('Unsafe manifest path');
  return resolved;
};
if (!selected) {
  for (const record of readJSON('reports/baseline-manifest.json').files) {
    const data = fs.readFileSync(safePath(path.join(root, 'baseline'), record.path));
    if (hash(data) !== record.sha256) throw new Error('Baseline changed: ' + record.path);
    const destination = safePath(output, record.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, data, { flag: 'wx' });
  }
}
const rebuilt = [];
for (const bundle of bundles) {
  const pieces = bundle.sections.map(section => {
    const data = fs.readFileSync(safePath(root, section.file));
    if (!allowEdits && hash(data) !== section.sha256) throw new Error('Edited fragment requires --allow-edits: ' + section.file);
    return data;
  });
  const data = Buffer.concat(pieces);
  if (!allowEdits && hash(data) !== bundle.sha256) throw new Error('Bundle differs from baseline: ' + bundle.id);
  const destination = safePath(output, bundle.artifactPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, data);
  rebuilt.push({ id: bundle.id, sha256: hash(data), unchanged: hash(data) === bundle.sha256 });
}
const receipt = {
  mode: selected ? 'compiled-bundle-overlay' : 'artifact-application-reassembly',
  fullSourceBuild: false,
  precompiledElectronAndNativeDependencies: true,
  applicationExecuted: false,
  generatedAt: new Date().toISOString(),
  output,
  bundles: rebuilt,
  warning: 'This recombines readable compiled JavaScript. It does not recover TS types, compile upstream sources, or demonstrate runtime equivalence.'
};
fs.writeFileSync(path.join(output, 'REASSEMBLY-RECEIPT.json'), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
