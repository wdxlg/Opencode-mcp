// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/skill-center.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { detectMigratableSkills, migrateGlobalSkills } from "./module-0052.mjs";
import { commitGlobalSkillImport, discardGlobalSkillImport, prepareGlobalSkillImport } from "./module-0044.mjs";
import { recoverSkillImports } from "./module-0051.mjs";
import { diagnoseGlobalSkills, loadGlobalSkills } from "./module-0027.mjs";
import { diagnoseSkillTools, loadSkillTools, resolveSkillDir, skillMarkdownName } from "./module-0028.mjs";
import { loadCustomTools } from "./module-0053.mjs";
import { GLOBAL_SKILLS_VERSION, configureGlobalSkills, defaultGlobalSkillsDirectory, globalSkillsDirectory, isGlobalSkillDirectory } from "./module-0025.mjs";
import { generateSkillRunner } from "./module-0045.mjs";
import { GlobalSkillSettings } from "./module-0026.mjs";
import { configureSkillArchiveWorker } from "./module-0046.mjs";
import { deleteCustomTool, toggleCustomTool } from "./module-0057.mjs";


// extensions/opencode/src/skill-center.ts
init_define_OPENCODE_BUILD_INFO();

var vscode = __toESM(require("vscode"));

var import_node_fs18 = require("node:fs");

var import_node_os3 = __toESM(require("node:os"));

var import_node_path23 = __toESM(require("node:path"));


// extensions/opencode/src/skill-center.ts
var settings;

var output;

var lastImported;

var roots = () => vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];

var message = (error2) => error2 instanceof Error ? error2.message : String(error2);

function probeDirectory(directory) {
  (0, import_node_fs18.mkdirSync)(directory, { recursive: true, mode: 448 });
  const probe = (0, import_node_fs18.mkdtempSync)(import_node_path23.default.join(directory, ".write-test-"));
  (0, import_node_fs18.rmSync)(probe, { recursive: true });
}

var MIGRATE_ACTION = "\u5207\u6362\u5E76\u8FC1\u79FB";

var SWITCH_ONLY_ACTION = "\u4EC5\u5207\u6362";

function migrationSummary(report) {
  const lines = [`\u5DF2\u8FC1\u79FB ${report.migrated.length} \u4E2A Skill \u5230\u65B0\u7684\u5168\u5C40\u76EE\u5F55\uFF08\u539F\u76EE\u5F55\u6587\u4EF6\u5B8C\u597D\u4FDD\u7559\uFF09\u3002`];
  if (report.skipped.length) lines.push(`\u672A\u8FC1\u79FB ${report.skipped.length} \u4E2A\uFF1A`, ...report.skipped.map((item) => `- ${item.name}\uFF1A${item.reason}`));
  return lines.join("\n");
}

import { safeGlobalSkillPath } from './shared-skills-paths.mjs';

async function chooseLocation() {
  const selection = await vscode.window.showOpenDialog({ title: "\u9009\u62E9\u5168\u5C40 Skill \u76EE\u5F55\uFF08\u6240\u6709\u5DE5\u4F5C\u533A\u5171\u4EAB\uFF09", canSelectFiles: false, canSelectFolders: true, canSelectMany: false, openLabel: "\u4F7F\u7528\u6B64\u5168\u5C40\u76EE\u5F55" });
  const selected = selection?.[0]?.fsPath;
  if (!selected) return { changed: false };
  const directory = safeGlobalSkillPath(selected);
  if (/\.app(?:[\\/]|$)/i.test(directory) || roots().some((root) => directory === (0, import_node_fs18.realpathSync)(root) || directory.startsWith((0, import_node_fs18.realpathSync)(root) + import_node_path23.default.sep))) throw new Error("\u8BF7\u9009\u62E9\u5DE5\u4F5C\u533A\u4E4B\u5916\u7684\u72EC\u7ACB\u5168\u5C40\u76EE\u5F55\uFF1B\u4E0D\u80FD\u653E\u5728 macOS .app \u5185\u3002");
  probeDirectory(directory);
  let previous;
  try {
    previous = settings.getDirectory();
  } catch {
    previous = void 0;
  }
  const pending = detectMigratableSkills(previous, directory);
  let migrate = false;
  if (pending.length) {
    const names = pending.slice(0, 8).map((skill) => skill.name).join("\u3001") + (pending.length > 8 ? ` \u7B49` : "");
    const choice = await vscode.window.showWarningMessage(`\u5C06\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u5168\u5C40 Skill \u4F4D\u7F6E\u5207\u6362\u4E3A\uFF1A
${directory}

\u5728\u539F\u76EE\u5F55 ${previous} \u68C0\u6D4B\u5230 ${pending.length} \u4E2A\u5DF2\u6709 Skill\uFF1A${names}
\u662F\u5426\u81EA\u52A8\u8FC1\u79FB\u5230\u65B0\u76EE\u5F55\uFF1F\u8FC1\u79FB\u4E3A\u4E8B\u52A1\u590D\u5236\u5E76\u9010\u4E2A\u6821\u9A8C\uFF0C\u539F\u76EE\u5F55\u6587\u4EF6\u5B8C\u597D\u4FDD\u7559\uFF1B\u65B0\u76EE\u5F55\u4E2D\u7684\u540C\u540D Skill \u4E0D\u4F1A\u88AB\u8986\u76D6\u3002`, { modal: true }, MIGRATE_ACTION, SWITCH_ONLY_ACTION);
    if (!choice) return { changed: false };
    migrate = choice === MIGRATE_ACTION;
  } else {
    const confirmed = await vscode.window.showWarningMessage(`\u5C06\u6240\u6709\u5DE5\u4F5C\u533A\u7684\u5168\u5C40 Skill \u4F4D\u7F6E\u5207\u6362\u4E3A\uFF1A
${directory}
\u539F\u76EE\u5F55\u4E2D\u6CA1\u6709\u68C0\u6D4B\u5230\u9700\u8981\u8FC1\u79FB\u7684 Skill\u3002`, { modal: true }, "\u5207\u6362\u5168\u5C40\u4F4D\u7F6E");
    if (!confirmed) return { changed: false };
  }
  settings.setDirectory(directory);
  sweepInterruptedImports();
  if (!migrate || !previous) return { changed: true };
  const migration = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: `\u6B63\u5728\u8FC1\u79FB ${pending.length} \u4E2A Skill\u2026` },
    () => migrateGlobalSkills(previous, pending, (text2) => output.appendLine(text2))
  );
  const summary = migrationSummary(migration);
  output.appendLine(`[skills] ${summary.replace(/\n/g, " ")}`);
  if (migration.skipped.length) void vscode.window.showWarningMessage(summary);
  else void vscode.window.showInformationMessage(summary);
  return { changed: true, migration };
}

async function writableDirectory() {
  try {
    const directory = settings.getDirectory();
    probeDirectory(directory);
    return directory;
  } catch (error2) {
    const choice = await vscode.window.showWarningMessage(`\u5168\u5C40 Skill \u76EE\u5F55\u4E0D\u53EF\u7528\uFF1A${message(error2)}
\u8BF7\u9009\u62E9\u53E6\u4E00\u4E2A\u5168\u5C40\u4F4D\u7F6E\uFF1B\u4E0D\u4F1A\u56DE\u9000\u5230\u5F53\u524D\u9879\u76EE\u3002`, { modal: true }, "\u9009\u62E9\u5176\u4ED6\u5168\u5C40\u4F4D\u7F6E");
    if (!choice || !(await chooseLocation()).changed) throw new Error("\u5DF2\u53D6\u6D88\u5BFC\u5165\uFF1B\u6CA1\u6709\u5199\u5165\u9879\u76EE\u76EE\u5F55\u3002");
    return settings.getDirectory();
  }
}

function describeImport(prepared) {
  const { bytes, entries } = prepared.snapshot;
  const size = bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return [
    `\u540D\u79F0\uFF1A${prepared.name}`,
    prepared.mode === "replace" ? "\u65B9\u5F0F\uFF1A\u66FF\u6362\u5DF2\u5B89\u88C5\u7684\u540C\u540D Skill\uFF08\u65E7\u7248\u672C\u5148\u5907\u4EFD\uFF0C\u5931\u8D25\u81EA\u52A8\u6062\u590D\uFF09" : "\u65B9\u5F0F\uFF1A\u65B0\u589E",
    `\u5185\u5BB9\uFF1A${entries} \u4E2A\u6587\u4EF6\uFF0C${size}`,
    `\u6765\u6E90\uFF1A${prepared.source}`,
    `\u76EE\u6807\uFF1A${prepared.target}`
  ].join("\n");
}

async function importGlobalSkillWithPrompt(source, origin = "legacy") {
  const directory = await writableDirectory();
  const log = (text2) => output.appendLine(text2);
  const prepared = await prepareGlobalSkillImport(source, { origin, log });
  try {
    const confirm = await vscode.window.showWarningMessage(`\u5C06 Skill \u5BFC\u5165\u5168\u5C40\u76EE\u5F55\uFF0C\u6240\u6709\u5DE5\u4F5C\u533A\u5747\u53EF\u53D1\u73B0\u5E76\u8C03\u7528\u3002Skill \u811A\u672C\u5177\u6709\u5F53\u524D\u7528\u6237\u6743\u9650\uFF0C\u8BF7\u4EC5\u5BFC\u5165\u4FE1\u4EFB\u7684\u6765\u6E90\u3002
${describeImport(prepared)}`, { modal: true }, prepared.mode === "replace" ? "\u66FF\u6362\u5E76\u5BFC\u5165" : "\u4FE1\u4EFB\u5E76\u5BFC\u5165");
    if (!confirm) throw new Error("\u5DF2\u53D6\u6D88\u5BFC\u5165\u3002");
    if (settings.getDirectory() !== directory) throw new Error("\u53E6\u4E00\u7A97\u53E3\u5DF2\u66F4\u6539\u5168\u5C40\u4F4D\u7F6E\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u786E\u8BA4\u76EE\u6807\u76EE\u5F55\u3002");
    const result = commitGlobalSkillImport(prepared, { replace: prepared.mode === "replace", log });
    try {
      if (settings.getDirectory() === directory) settings.setDirectory(directory);
      else void vscode.window.showWarningMessage(`Skill \u5DF2\u5BFC\u5165 ${result.directory}\uFF0C\u4F46\u53E6\u4E00\u7A97\u53E3\u5DF2\u5207\u6362\u5168\u5C40\u4F4D\u7F6E\u3002\u6587\u4EF6\u4ECD\u4FDD\u7559\u5728\u4E0A\u8FF0\u76EE\u5F55\u3002`);
    } catch (error2) {
      output.appendLine(`[skills] imported, but could not remember location: ${message(error2)}`);
      void vscode.window.showWarningMessage(`Skill \u5DF2\u5BFC\u5165 ${result.directory}\uFF0C\u4F46\u4FDD\u5B58\u5168\u5C40\u4F4D\u7F6E\u5931\u8D25\uFF1A${message(error2)}`);
    }
    lastImported = { directory: result.directory, at: Date.now() };
    return result;
  } finally {
    discardGlobalSkillImport(prepared);
  }
}

function promoteWorkspaceSkill(directory) {
  return importGlobalSkillWithPrompt(directory, "promote");
}

function importOrigin(options, fallback) {
  if (options === void 0 || options === null) return fallback;
  const origin = typeof options === "object" ? options.origin : void 0;
  if (origin === "dialog" || origin === "drop" || origin === "legacy") return origin;
  throw new Error("Skill \u5BFC\u5165\u6765\u6E90\u53EA\u80FD\u662F dialog\u3001drop \u6216 legacy\u3002");
}

function sweepInterruptedImports() {
  try {
    const report = recoverSkillImports(settings.getDirectory());
    if (report.rolledBack.length || report.rolledForward.length || report.removed.length) output.appendLine(`[skills] settled interrupted imports: ${JSON.stringify(report)}`);
  } catch (error2) {
    output.appendLine(`[skills] import recovery skipped: ${message(error2)}`);
  }
}

var SKILLS_ENABLED_SETTING = "bridge.skillsEnabled";

var SKILLS_DISABLED_REASON = "Skill \u603B\u5F00\u5173\u5DF2\u5173\u95ED\u3002";

var SHADOWED_REASON = "\u540C\u540D\u5168\u5C40 Skill / \u66F4\u9AD8\u4F18\u5148\u7EA7\u5DE5\u5177\u5DF2\u5360\u7528\u540D\u79F0";

function readSkillsEnabled() {
  return vscode.workspace.getConfiguration("opencode").get(SKILLS_ENABLED_SETTING, true);
}

function skillAvailability() {
  const inspected = vscode.workspace.getConfiguration("opencode").inspect(SKILLS_ENABLED_SETTING);
  const userValue = typeof inspected?.globalValue === "boolean" ? inspected.globalValue : void 0;
  const workspaceValue = typeof inspected?.workspaceValue === "boolean" ? inspected.workspaceValue : void 0;
  const source = workspaceValue !== void 0 ? "workspace" : userValue !== void 0 ? "user" : "default";
  const hasWorkspace = roots().length > 0;
  const effectiveTarget = source === "default" ? hasWorkspace ? "workspace" : "user" : source;
  const workspaceFile = vscode.workspace.workspaceFile;
  const workspaceSettingsFile = !hasWorkspace ? void 0 : workspaceFile ? workspaceFile.scheme === "file" ? workspaceFile.fsPath : void 0 : import_node_path23.default.join(roots()[0], ".vscode", "settings.json");
  return { effective: readSkillsEnabled(), source, userValue, workspaceValue, effectiveTarget, hasWorkspace, workspaceSettingsFile };
}

async function setSkillsEnabled(enabled, target) {
  if (typeof enabled !== "boolean") throw new Error("Skill \u5F00\u5173\u5FC5\u987B\u662F\u5E03\u5C14\u503C\u3002");
  const requested = target ?? "effective";
  if (requested !== "effective" && requested !== "user" && requested !== "workspace" && requested !== "all-projects") throw new Error("Skill \u5F00\u5173\u7684\u5199\u5165\u4F4D\u7F6E\u53EA\u80FD\u662F effective\u3001user\u3001workspace \u6216 all-projects\u3002");
  const current = skillAvailability();
  if (requested === "all-projects") {
    const config2 = vscode.workspace.getConfiguration("opencode");
    await config2.update(SKILLS_ENABLED_SETTING, enabled, vscode.ConfigurationTarget.Global);
    if (current.workspaceValue !== void 0) await config2.update(SKILLS_ENABLED_SETTING, void 0, vscode.ConfigurationTarget.Workspace);
    return skillAvailability();
  }
  const layer = requested === "effective" ? current.effectiveTarget : requested;
  if (layer === "workspace" && !current.hasWorkspace) throw new Error("\u6CA1\u6709\u6253\u5F00\u9879\u76EE\uFF0C\u65E0\u6CD5\u5199\u5165\u9879\u76EE\u8BBE\u7F6E\u3002");
  await vscode.workspace.getConfiguration("opencode").update(SKILLS_ENABLED_SETTING, enabled, layer === "workspace" ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global);
  return skillAvailability();
}

function catalogEntries() {
  const skillsOn = readSkillsEnabled();
  const globals = loadGlobalSkills();
  const projects = []; // Shared Skills only; workspace libraries are not loaded.
  const selected = loadCustomTools(roots());
  const projectDiagnoses = []; // Do not scan workspace Skill directories.
  return [...diagnoseGlobalSkills(), ...projectDiagnoses].map((item) => {
    const directory = item.directory;
    const tool = [...globals, ...projects].find((candidate) => candidate.skillDir === directory);
    const managed = !!tool && selected.find((candidate) => candidate.name === tool.name)?.skillDir === directory;
    const shadowed = item.loaded && !managed;
    const verdict = !skillsOn ? { reasonCode: "skills-disabled", fix: "enable-skills" } : shadowed ? { reasonCode: "duplicate-name", fix: "open-folder" } : item.loaded ? {} : { reasonCode: item.reasonCode ?? "unknown", fix: item.fix };
    return {
      id: JSON.stringify([item.scope, directory]),
      scope: item.scope ?? "workspace",
      directory,
      name: tool?.name || item.name,
      title: item.dirName,
      description: tool?.description || "",
      loaded: item.loaded,
      enabled: tool?.enabled ?? false,
      managed,
      reason: shadowed ? SHADOWED_REASON : item.reason,
      ...verdict
    };
  });
}

function listInstalledSkillsForAgent() {
  if (!settings) throw new Error("Skill catalog is not initialized yet; retry after extension activation.");
  const directory = settings.getDirectory();
  const enabled = readSkillsEnabled();
  return { directory, enabled, skills: catalogEntries().map((entry) => {
    let skillFile = null;
    try {
      const markdown = skillMarkdownName(entry.directory);
      if (markdown) {
        const candidate = import_node_path23.default.join(entry.directory, markdown);
        if ((0, import_node_fs18.lstatSync)(candidate).isFile()) skillFile = candidate;
      }
    } catch {
    }
    return {
      name: entry.name ?? import_node_path23.default.basename(entry.directory),
      title: entry.title,
      description: entry.description,
      scope: entry.scope,
      directory: entry.directory,
      skillFile,
      loaded: skillFile !== null,
      enabled: entry.enabled,
      ...skillFile ? {} : { reasonCode: "skill-file-missing", reason: "Skill \u4E0D\u5408\u89C4\uFF1A\u7F3A\u5C11\u552F\u4E00\u7684\u6839\u76EE\u5F55 skill.md / SKILL.md \u666E\u901A\u6587\u4EF6\u3002" }
    };
  }) };
}

var isInside = (root, file) => {
  const relative = import_node_path23.default.relative(root, file);
  return !!relative && !relative.startsWith("..") && !import_node_path23.default.isAbsolute(relative);
};

function jsonTools() {
  const folders = roots();
  return loadCustomTools(folders, void 0, { skillsEnabled: readSkillsEnabled() }).filter((tool) => !tool.skillDir).map((tool) => ({
    name: tool.name,
    title: tool.title,
    description: tool.description,
    enabled: tool.enabled,
    sourcePath: tool.sourcePath,
    workspace: folders.find((root) => isInside(root, tool.sourcePath))
  }));
}

function diagnosisFor(entry) {
  return {
    scope: entry.scope,
    directory: entry.directory,
    dirName: import_node_path23.default.basename(entry.directory),
    name: entry.name,
    loaded: entry.reasonCode === void 0,
    reasonCode: entry.reasonCode,
    reason: entry.reasonCode === "skills-disabled" ? SKILLS_DISABLED_REASON : entry.reason,
    fix: entry.fix ?? (entry.reasonCode ? "open-folder" : "none")
  };
}

function generateRunnerFor(entry) {
  const dirName = import_node_path23.default.basename(entry.directory);
  const log = (text2) => output.appendLine(text2);
  if (entry.scope === "global") {
    const directory = globalSkillsDirectory();
    const resolved = directory ? resolveSkillDir(directory, dirName, directory) : void 0;
    if (!directory || !resolved || import_node_path23.default.resolve(resolved) !== import_node_path23.default.resolve(entry.directory) || !isGlobalSkillDirectory(resolved)) throw new Error("\u5168\u5C40 Skill \u8DEF\u5F84\u4E0D\u5B89\u5168\uFF0C\u5DF2\u62D2\u7EDD\u5199\u5165\u3002");
    return generateSkillRunner(directory, dirName, log, directory);
  }
  const root = roots().find((candidate) => import_node_path23.default.resolve(candidate, ".opencode/mcp-tools", dirName) === import_node_path23.default.resolve(entry.directory));
  if (!root) throw new Error("Skill \u6765\u6E90\u5DF2\u6539\u53D8\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002");
  return generateSkillRunner(root, dirName, log);
}

function entryById(id) {
  if (typeof id !== "string") throw new Error("Skill \u6807\u8BC6\u65E0\u6548\u3002");
  const entry = catalogEntries().find((item) => item.id === id);
  if (!entry) throw new Error("Skill \u6765\u6E90\u5DF2\u6539\u53D8\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002");
  return entry;
}

function registerSkillCenter(context, channel) {
  output = channel;
  settings = new GlobalSkillSettings(import_node_path23.default.join(process.env.VSCODE_PORTABLE || import_node_os3.default.homedir(), ".opencode", "global-skills.json"), defaultGlobalSkillsDirectory(vscode.env.appRoot, import_node_os3.default.userInfo().username, process.platform, process.env.APPIMAGE));
  configureGlobalSkills(() => settings.getDirectory());
  configureSkillArchiveWorker(context.extensionPath ? import_node_path23.default.join(context.extensionPath, "dist", "skill-archive-worker.js") : void 0);
  output.appendLine(`[skills] ${GLOBAL_SKILLS_VERSION}; skill-settings-page-v1`);
  sweepInterruptedImports();
  const openPage = () => vscode.commands.executeCommand("aiCustomization.openManagementEditor", "skillCenter");
  const register3 = (id, action) => vscode.commands.registerCommand(id, async (...args) => {
    try {
      return await action(...args);
    } catch (error2) {
      output.appendLine(`[skills] ${message(error2)}`);
      throw error2;
    }
  });
  context.subscriptions.push(
    { dispose() {
      configureGlobalSkills(void 0);
      configureSkillArchiveWorker(void 0);
      lastImported = void 0;
    } },
    register3("opencode.skills.center", openPage),
    register3("opencode.skills.search", openPage),
    register3("opencode.skills.refresh", openPage),
    register3("opencode.skills.getCatalog", () => {
      const availability = skillAvailability();
      return {
        version: "skill-settings-page-v1",
        directory: settings.getDirectory(),
        entries: catalogEntries(),
        skillsEnabled: availability.effective,
        availability,
        jsonTools: jsonTools(),
        trusted: vscode.workspace.isTrusted,
        highlightedDirectory: lastImported && Date.now() - lastImported.at < 7e3 ? lastImported.directory : void 0
      };
    }),
    register3("opencode.skills.setEnabled", async (enabled, target) => setSkillsEnabled(enabled, target)),
    register3("opencode.skills.changeLocation", async () => chooseLocation()),
    register3("opencode.skills.openDirectory", async () => {
      const directory = await writableDirectory();
      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(directory));
    }),
    register3("opencode.skills.import", async (source, options) => {
      if (source !== void 0 && source !== null && (typeof source !== "string" || !source.trim())) throw new Error("Skill \u6765\u6E90\u5FC5\u987B\u662F\u672C\u5730\u8DEF\u5F84\u3002");
      const origin = importOrigin(options, typeof source === "string" ? "legacy" : "dialog");
      const kind = typeof options === "object" && options !== null ? options.kind : void 0;
      if (kind !== void 0 && kind !== "folder" && kind !== "archive") throw new Error("Skill \u9009\u62E9\u7C7B\u578B\u65E0\u6548\u3002");
      const archive = kind === "archive";
      const selection = typeof source === "string" ? void 0 : await vscode.window.showOpenDialog({
        title: archive ? "\u5BFC\u5165\u5168\u5C40 Skill \u538B\u7F29\u5305" : "\u9009\u62E9 Skill \u6587\u4EF6\u5939\uFF08\u8FDB\u5165\u8BE5\u6587\u4EF6\u5939\u540E\u70B9\u51FB\u53F3\u4E0B\u89D2\u6309\u94AE\u76F4\u63A5\u5BFC\u5165\uFF09",
        canSelectFiles: archive,
        canSelectFolders: !archive,
        canSelectMany: false,
        openLabel: archive ? "\u5BFC\u5165\u538B\u7F29\u5305" : "\u9009\u62E9\u6B64\u6587\u4EF6\u5939",
        ...archive ? { filters: { "Skill \u538B\u7F29\u5305\uFF08.zip\u3001.tar.gz\u3001.tgz\uFF09": ["zip", "tgz", "gz"] } } : {}
      });
      const sourcePath = typeof source === "string" ? source : selection?.[0]?.fsPath;
      if (!sourcePath) return { cancelled: true };
      const result = await importGlobalSkillWithPrompt(sourcePath, origin);
      await openPage();
      return { result };
    }),
    register3("opencode.skills.openSkill", async (name) => {
      if (typeof name !== "string") throw new Error("Skill \u540D\u79F0\u65E0\u6548\u3002");
      const entry = catalogEntries().find((item) => item.scope === "global" && (item.name === name || import_node_path23.default.basename(item.directory) === name));
      if (!entry) throw new Error("\u672A\u627E\u5230\u5168\u5C40 Skill\uFF0C\u8BF7\u5237\u65B0\u3002");
      await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(entry.directory));
    }),
    register3("opencode.skills.action", async (id, action) => {
      const entry = entryById(id);
      if (action === "folder") {
        await vscode.commands.executeCommand("revealFileInOS", vscode.Uri.file(entry.directory));
        return;
      }
      if (action === "document") {
        const marker = skillMarkdownName(entry.directory), file = marker ? import_node_path23.default.join(entry.directory, marker) : "";
        if (!file || !(0, import_node_fs18.existsSync)(file)) throw new Error("\u76EE\u5F55\u4E2D\u6CA1\u6709\u552F\u4E00\u7684 skill.md / SKILL.md\u3002");
        await vscode.window.showTextDocument(vscode.Uri.file(file));
        return;
      }
      if (action === "promote") {
        if (entry.scope !== "workspace") throw new Error("\u8BE5 Skill \u5DF2\u662F\u5168\u5C40\u6765\u6E90\u3002");
        return { result: await promoteWorkspaceSkill(entry.directory) };
      }
      if (action === "diagnose") return { diagnosis: diagnosisFor(entry) };
      if (action === "generate-runner") return { result: generateRunnerFor(entry) };
      if (action !== "toggle" && action !== "delete") throw new Error("\u672A\u77E5 Skill \u64CD\u4F5C\u3002");
      if (!entry.loaded || !entry.managed || !entry.name) throw new Error("\u6B64 Skill \u672A\u52A0\u8F7D\u6216\u88AB\u540C\u540D\u7248\u672C\u8986\u76D6\uFF0C\u8BF7\u6253\u5F00\u76EE\u5F55\u68C0\u67E5\u3002");
      if (action === "delete") {
        const confirm = await vscode.window.showWarningMessage(`\u6C38\u4E45\u5220\u9664 ${entry.title}\uFF1F${entry.scope === "global" ? "\u8FD9\u5C06\u5F71\u54CD\u6240\u6709\u5DE5\u4F5C\u533A\u3002" : "\u4EC5\u5220\u9664\u9879\u76EE\u526F\u672C\u3002"}
${entry.directory}`, { modal: true }, "\u6C38\u4E45\u5220\u9664");
        if (!confirm) return { cancelled: true };
        const current = entryById(id);
        if (!current.managed || current.name !== entry.name) throw new Error("Skill \u6765\u6E90\u5DF2\u6539\u53D8\uFF0C\u5DF2\u53D6\u6D88\u5220\u9664\u3002");
        deleteCustomTool(roots(), entry.name);
      } else toggleCustomTool(roots(), entry.name);
    })
  );
}
export { probeDirectory, migrationSummary, chooseLocation, writableDirectory, describeImport, importGlobalSkillWithPrompt, promoteWorkspaceSkill, importOrigin, sweepInterruptedImports, readSkillsEnabled, skillAvailability, setSkillsEnabled, catalogEntries, listInstalledSkillsForAgent, jsonTools, diagnosisFor, generateRunnerFor, entryById, registerSkillCenter, vscode, import_node_fs18, import_node_os3, import_node_path23, settings, output, lastImported, roots, message, MIGRATE_ACTION, SWITCH_ONLY_ACTION, SKILLS_ENABLED_SETTING, SKILLS_DISABLED_REASON, SHADOWED_REASON, isInside };
