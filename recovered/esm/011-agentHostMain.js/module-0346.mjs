// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/scan/claudeNativePluginScan.ts
import { URI } from "./module-0023.mjs";
import { detectPluginFormat, parsePlugin, readJsonFile } from "./module-0126.mjs";
import { ResourceSet } from "./module-0006.mjs";
import { findMostSpecificClaudeWorkspaceRoot, selectEnabledClaudePluginIds } from "./module-0345.mjs";


// src/vs/platform/agentHost/node/claude/customizations/scan/claudeNativePluginScan.ts
var SKILLS_DIR_MARKETPLACE = "skills-dir";

function claudeSettingsFilesByPrecedence(workingDirectory, userHome) {
  const files = [URI.joinPath(userHome, ".claude", "settings.json")];
  if (workingDirectory) {
    files.push(URI.joinPath(workingDirectory, ".claude", "settings.json"));
    files.push(URI.joinPath(workingDirectory, ".claude", "settings.local.json"));
  }
  return files;
}

async function readEnabledPlugins(uri, fileService) {
  const result = /* @__PURE__ */ new Map();
  const raw = await readJsonFile(uri, fileService);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return result;
  }
  const enabledPlugins = raw["enabledPlugins"];
  if (!enabledPlugins || typeof enabledPlugins !== "object" || Array.isArray(enabledPlugins)) {
    return result;
  }
  for (const [id2, value] of Object.entries(enabledPlugins)) {
    result.set(id2, value !== false);
  }
  return result;
}

async function resolveEnabledPluginIds(workingDirectory, userHome, fileService) {
  const effective = /* @__PURE__ */ new Map();
  const seenFiles = new ResourceSet();
  for (const uri of claudeSettingsFilesByPrecedence(workingDirectory, userHome)) {
    if (seenFiles.has(uri)) {
      continue;
    }
    seenFiles.add(uri);
    const raw = await readJsonFile(uri, fileService);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      continue;
    }
    const enabledPlugins = raw["enabledPlugins"];
    if (!enabledPlugins || typeof enabledPlugins !== "object" || Array.isArray(enabledPlugins)) {
      continue;
    }
    for (const [id2, value] of Object.entries(enabledPlugins)) {
      effective.set(id2, value !== false);
    }
  }
  return [...effective].filter(([, enabled]) => enabled).map(([id2]) => id2);
}

function splitPluginId(id2) {
  const at = id2.lastIndexOf("@");
  if (at <= 0 || at === id2.length - 1) {
    return void 0;
  }
  const plugin = id2.slice(0, at);
  const marketplace = id2.slice(at + 1);
  const isUnsafeSegment = (s) => s.includes("/") || s.includes("\\") || s.includes("..");
  if (isUnsafeSegment(plugin) || isUnsafeSegment(marketplace)) {
    return void 0;
  }
  return { plugin, marketplace };
}

async function hasManifest(dir, fileService) {
  const format4 = await detectPluginFormat(dir, fileService);
  return fileService.exists(URI.joinPath(dir, format4.manifestPath));
}

async function resolveSkillsDirRoot(plugin, workingDirectories, userHome, fileService) {
  const candidates = [];
  for (const workingDirectory of workingDirectories) {
    candidates.push(URI.joinPath(workingDirectory, ".claude", "skills", plugin));
  }
  candidates.push(URI.joinPath(userHome, ".claude", "skills", plugin));
  for (const candidate of candidates) {
    if (await hasManifest(candidate, fileService)) {
      return candidate;
    }
  }
  return void 0;
}

async function resolveMarketplaceCacheRoot(plugin, marketplace, userHome, fileService) {
  const base = URI.joinPath(userHome, ".claude", "plugins", "cache", marketplace, plugin);
  if (await hasManifest(base, fileService)) {
    return base;
  }
  let stat3;
  try {
    stat3 = await fileService.resolve(base);
  } catch {
    return void 0;
  }
  if (!stat3.isDirectory || !stat3.children) {
    return void 0;
  }
  let best;
  for (const child of stat3.children) {
    if (!child.isDirectory || !await hasManifest(child.resource, fileService)) {
      continue;
    }
    const mtime = child.mtime ?? 0;
    if (!best || mtime > best.mtime || mtime === best.mtime && child.name.localeCompare(best.name, void 0, { numeric: true }) > 0) {
      best = { uri: child.resource, mtime, name: child.name };
    }
  }
  return best?.uri;
}

async function scanClaudeNativePlugins(workingDirectory, userHome, fileService, logService) {
  const ids = await resolveEnabledPluginIds(workingDirectory, userHome, fileService);
  return resolveNativePlugins(ids, workingDirectory ? [workingDirectory] : [], userHome, fileService, logService);
}

async function scanClaudeNativePluginsForRoots(workingDirectories, userHome, fileService, logService) {
  const settingsFiles = [];
  for (const workingDirectory of workingDirectories) {
    settingsFiles.push(
      URI.joinPath(workingDirectory, ".claude", "settings.local.json"),
      URI.joinPath(workingDirectory, ".claude", "settings.json")
    );
  }
  settingsFiles.push(URI.joinPath(userHome, ".claude", "settings.json"));
  const ids = selectEnabledClaudePluginIds(await Promise.all(settingsFiles.map((uri) => readEnabledPlugins(uri, fileService))));
  return resolveNativePlugins(ids, workingDirectories, userHome, fileService, logService);
}

async function resolveNativePlugins(ids, workingDirectories, userHome, fileService, logService) {
  const result = [];
  const seenRoots = new ResourceSet();
  for (const id2 of ids) {
    const parts = splitPluginId(id2);
    if (!parts) {
      logService.warn(`[claudeNativePluginScan] skipping malformed plugin id '${id2}'`);
      continue;
    }
    const root = parts.marketplace === SKILLS_DIR_MARKETPLACE ? await resolveSkillsDirRoot(parts.plugin, workingDirectories, userHome, fileService) : await resolveMarketplaceCacheRoot(parts.plugin, parts.marketplace, userHome, fileService);
    if (!root) {
      logService.warn(`[claudeNativePluginScan] could not resolve an on-disk root for enabled plugin '${id2}'`);
      continue;
    }
    if (seenRoots.has(root)) {
      continue;
    }
    seenRoots.add(root);
    try {
      const workspaceRoot = parts.marketplace === SKILLS_DIR_MARKETPLACE ? findMostSpecificClaudeWorkspaceRoot(root, workingDirectories) : void 0;
      const parsed = await parsePlugin(root, fileService, workspaceRoot ?? workingDirectories[0], userHome, root);
      result.push({ id: id2, root, parsed });
    } catch (err) {
      logService.warn(`[claudeNativePluginScan] failed to parse plugin '${id2}' at '${root.toString()}': ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  result.sort((a, b) => a.id.localeCompare(b.id));
  return result;
}
export { claudeSettingsFilesByPrecedence, readEnabledPlugins, resolveEnabledPluginIds, splitPluginId, hasManifest, resolveSkillsDirRoot, resolveMarketplaceCacheRoot, scanClaudeNativePlugins, scanClaudeNativePluginsForRoots, resolveNativePlugins, SKILLS_DIR_MARKETPLACE };
