// Explicit opt-in isolated regressions. Fake compiler only; no app, network or user profile.
const fs = require('fs'), path = require('path'), os = require('os');
const cp = require('child_process'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..'), results = [];
const area = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-build-safety-'));
function write(file, text) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text, 'utf8'); }
function json(file, value) { write(file, JSON.stringify(value)); }
function fixture(name, script) {
  const dir = path.join(area, name);
  write(path.join(dir, 'scripts', script), fs.readFileSync(path.join(root, 'scripts', script), 'utf8'));
  fs.mkdirSync(path.join(dir, 'reports'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'generated/source-build/resources/app/out'), { recursive: true });
  return dir;
}
function run(dir, script) {
  return cp.spawnSync(process.execPath, [path.join(dir, 'scripts', script)], {
    cwd: dir, encoding: 'utf8', timeout: 15000,
    env: { ...process.env, OPENCODE_RECOVERY_ROOT: dir }
  });
}
async function test(name, fn) {
  try { await fn(); results.push({ name, passed: true }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, passed: false, error: String(error) }); console.error('FAIL ' + name + ': ' + error.message); }
}
function standalone(name) {
  const dir = fixture(name, 'build-standalone.cjs');
  json(path.join(dir, 'reports/baseline-manifest.json'), { files: [{ path: 'resources/app/out/probe.js' }] });
  json(path.join(dir, 'reports/bundle-manifest.json'), { bundles: [] });
  json(path.join(dir, 'generated/source-build/resources/app/product.json'), { checksums: {} });
  write(path.join(dir, 'recovered/standalone/resources/app/out/probe.js'), 'const fixture = 1;');
  function compiler(version) {
    write(path.join(dir, 'toolchain/node_modules/esbuild/index.js'), `const fs=require('fs');exports.version=${JSON.stringify(version)};exports.transform=async text=>{fs.appendFileSync(${JSON.stringify(path.join(dir, 'transforms.log'))},'call\\n');return {code:'// compiler '+exports.version+'\\n'+text,map:'{}'};};`.replaceAll('\\\\n', '\\n'));
  }
  compiler('fixture-1');
  return { dir, compiler };
}
(async () => {
  try {
    for (const malformed of [false, true]) await test('bundled compiler failure keeps original diagnostic' + (malformed ? ' (non-array errors)' : ''), () => {
      const dir = fixture('errors-' + malformed, 'build-recovered.cjs');
      json(path.join(dir, 'reports/bundle-manifest.json'), { bundles: [{ id: 'fixture', artifactPath: 'resources/app/out/fixture.js' }] });
      json(path.join(dir, 'recovered/esm/fixture/modules.json'), { modules: [{ file: 'module.mjs' }] });
      write(path.join(dir, 'recovered/esm/fixture/entry.mjs'), 'export {};');
      write(path.join(dir, 'recovered/esm/fixture/module.mjs'), 'export {};');
      write(path.join(dir, 'toolchain/node_modules/esbuild/index.js'), `exports.version='fixture';exports.build=async()=>{throw Object.assign(new Error('fixture compiler failure'),${malformed ? "{errors:'malformed diagnostic'}" : '{}'});};`);
      const result = run(dir, 'build-recovered.cjs');
      assert.equal(result.status, 2, result.stderr);
      const report = JSON.parse(fs.readFileSync(path.join(dir, 'reports/build/fixture.json'), 'utf8'));
      assert(Array.isArray(report.errors));
      assert.match(report.errors[0].text, /fixture compiler failure/);
      const summary = JSON.parse(fs.readFileSync(path.join(dir, 'reports/source-build.json'), 'utf8'));
      assert.equal(summary.complete, false);
      assert.equal(summary.results[0].status, 'failed');
    });
    await test('standalone cache invalidates when compiler version changes', () => {
      const { dir, compiler } = standalone('compiler-cache');
      let result = run(dir, 'build-standalone.cjs'); assert.equal(result.status, 0, result.stderr);
      compiler('fixture-2');
      result = run(dir, 'build-standalone.cjs'); assert.equal(result.status, 0, result.stderr);
      assert.match(fs.readFileSync(path.join(dir, 'generated/source-build/resources/app/out/probe.js'), 'utf8'), /compiler fixture-2/);
    });
    await test('standalone cache invalidates when build pipeline changes', () => {
      const { dir } = standalone('pipeline-cache');
      let result = run(dir, 'build-standalone.cjs'); assert.equal(result.status, 0, result.stderr);
      const before = fs.readFileSync(path.join(dir, 'transforms.log'), 'utf8');
      fs.appendFileSync(path.join(dir, 'scripts/build-standalone.cjs'), '\n// fixture pipeline revision\n');
      result = run(dir, 'build-standalone.cjs'); assert.equal(result.status, 0, result.stderr);
      assert.notEqual(fs.readFileSync(path.join(dir, 'transforms.log'), 'utf8'), before);
    });
    await test('empty command-output chunks do not grow the bounded ring', async () => {
      const { ChunkRing } = await import(pathToFileURL(path.join(root, 'recovered/shared/concurrency-runtime.mjs')));
      const ring = new ChunkRing(32);
      for (let i = 0; i < 10000; i++) ring.append(Buffer.alloc(0));
      assert.equal(ring.length, 0); assert.equal(ring.chunks.length, 0);
      ring.append('hello'); ring.append(''); assert.equal(ring.toString(), 'hello'); assert.equal(ring.chunks.length, 1);
    });
  } finally {
    fs.rmSync(area, { recursive: true, force: true });
    const report = { passed: results.every(x => x.passed), results, isolated: true, applicationStarted: false, realCompilerUsed: false, at: new Date().toISOString() };
    fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
    fs.writeFileSync(path.join(root, 'reports/build-safety-tests.json'), JSON.stringify(report, null, 2));
    if (!report.passed) process.exitCode = 1;
  }
})();
