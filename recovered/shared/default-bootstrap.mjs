import fs from 'node:fs/promises';
import path from 'node:path';
import { initializeBundledWindowsMcp } from './windows-mcp-integration.mjs';
import { initializeBundledRea } from './rea-integration.mjs';

const hasExactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join('\0') === [...keys].sort().join('\0');
const canonical = value => value && typeof value === 'object' && !Array.isArray(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  : Array.isArray(value) ? value.map(canonical) : value;

// Retire only a provably unmodified server registered by the old product.
// A partial match is deliberately insufficient: keep disabled, retargeted,
// environment-modified and otherwise customized records and all credentials.
export async function retireBundledRea(context, catalog, log = () => {}) {
  await catalog.exclusive(async () => {
    const current = catalog.snapshot();
    const server = current.servers.find(item => item.id === 'rea');
    if (!server) return;
    const marker = context.globalState.get('bundledReaOwner');
    const keep = () => log('[defaults] retained customized or unverifiable REA configuration');
    if (!hasExactKeys(server, ['id', 'label', 'transport', 'enabled', 'editorEnabled', 'bridgeEnabled', 'timeout', 'command', 'argsRef', 'envRefs']) ||
        !hasExactKeys(marker, ['argsRef', 'args', 'command', 'stateRoot']) ||
        !hasExactKeys(server.envRefs, ['ELECTRON_RUN_AS_NODE', 'OPENCODE_REA_STATE_ROOT']) ||
        server.label !== 'REA 6.4.0 (bundled)' || server.transport !== 'stdio' ||
        server.enabled !== true || server.editorEnabled !== false || server.bridgeEnabled !== true || server.timeout !== 360 ||
        server.argsRef !== marker.argsRef || server.command !== marker.command ||
        typeof marker.args !== 'string' || typeof marker.command !== 'string' || !path.isAbsolute(marker.command) ||
        typeof marker.stateRoot !== 'string' || !path.isAbsolute(marker.stateRoot) || path.basename(marker.stateRoot) !== 'rea-sessions') return keep();
    const refs = [server.argsRef, server.envRefs.ELECTRON_RUN_AS_NODE, server.envRefs.OPENCODE_REA_STATE_ROOT];
    if (refs.some(ref => typeof ref !== 'string' || !ref) || new Set(refs).size !== refs.length) return keep();
    let args;
    try { args = JSON.parse(marker.args); } catch { return keep(); }
    if (!Array.isArray(args) || args.length !== 1 || typeof args[0] !== 'string' || !path.isAbsolute(args[0]) ||
        path.basename(args[0]) !== 'rea-bridge.mjs' || path.basename(path.dirname(args[0])) !== 'defaults') return keep();
    let storedArgs, nodeMode, storedRoot;
    try { [storedArgs, nodeMode, storedRoot] = await Promise.all(refs.map(ref => context.secrets.get(ref))); }
    catch { return keep(); } // An unavailable secret store is not proof of ownership.
    if (storedArgs !== marker.args || nodeMode !== '1' || storedRoot !== marker.stateRoot) return keep();
    const backup = context.globalState.get('retiredBundledRea');
    if (backup && (backup.version !== 1 ||
        JSON.stringify(canonical(backup.server)) !== JSON.stringify(canonical(server)) ||
        JSON.stringify(canonical(backup.marker)) !== JSON.stringify(canonical(marker)))) {
      log('[defaults] existing REA retirement backup differs; preserving the server and backup');
      return;
    }
    if (!backup) await context.globalState.update('retiredBundledRea', { version: 1, server, marker });
    catalog.save(current.servers.filter(item => item !== server));
    // Leave all secret references and ownership metadata in place for rollback.
    log('[defaults] retired the verified previous bundled REA server');
  });
}

export async function initializeBundledDefaults(context, catalog, skillsDirectory, log) {
  const root = path.join(context.extensionPath, 'defaults');
  try { JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  await initializeBundledRea(context, catalog, log);
  await initializeBundledWindowsMcp(context, catalog, log);
  log('[defaults] LeanREA is bundled for Bridge discovery; shared Skills remain user-owned');
}
