const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'reports/classification-summary.json');
const classification = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : null;
console.log(JSON.stringify({
  status: 'blocked',
  fullSourceBuildCompleted: false,
  blockers: [
    'Custom modules missing original TS; recovered compiled fragments are not independent modules.',
    'Upstream path matches do not establish equality; custom changes to shared core modules need porting.',
    'Extension dependency/build metadata and outer harden-vendored-dependencies.mjs are not restored.',
    'Preserved TS must be reconciled with current independently patched runtime; never revive removed account/payment functions.',
    'Toolchain installation, native dependencies, packaging and runtime validation have not been performed.'
  ],
  classification
}, null, 2));
process.exitCode = 2;
