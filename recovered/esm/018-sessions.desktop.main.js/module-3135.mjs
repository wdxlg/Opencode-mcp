// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/autoApprove/npmScriptAutoApprover.ts
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { visit } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/browser/tools/commandLineAnalyzer/autoApprove/npmScriptAutoApprover.ts
var npmRunPatterns = [
  // npm run <script>
  // npm run-script <script>
  /^(?<command>npm)\s+(?:run(?:-script)?)\s+(?<scriptName>[^\s&|;]+)/i,
  // npm test, npm start, npm stop, npm restart (shorthand commands)
  // See https://docs.npmjs.com/cli/v10/commands/npm-run-script
  /^(?<command>npm)\s+(?<scriptName>test|start|stop|restart)\b/i,
  // yarn <script>
  // yarn run <script>
  /^(?<command>yarn)\s+(?:run\s+)?(?<scriptName>[^\s&|;]+)/i,
  // pnpm <script>
  // pnpm run <script>
  /^(?<command>pnpm)\s+(?:run\s+)?(?<scriptName>[^\s&|;]+)/i
];

var yarnBuiltinCommands = /* @__PURE__ */ new Set([
  "add",
  "audit",
  "autoclean",
  "bin",
  "cache",
  "check",
  "config",
  "create",
  "dedupe",
  "dlx",
  "exec",
  "explain",
  "generate-lock-entry",
  "global",
  "help",
  "import",
  "info",
  "init",
  "install",
  "licenses",
  "link",
  "list",
  "login",
  "logout",
  "node",
  "outdated",
  "owner",
  "pack",
  "patch",
  "patch-commit",
  "plugin",
  "policies",
  "publish",
  "rebuild",
  "remove",
  "run",
  "search",
  "set",
  "stage",
  "tag",
  "team",
  "unlink",
  "unplug",
  "up",
  "upgrade",
  "upgrade-interactive",
  "version",
  "versions",
  "why",
  "workspace",
  "workspaces"
]);

var pnpmBuiltinCommands = /* @__PURE__ */ new Set([
  "add",
  "audit",
  "bin",
  "config",
  "dedupe",
  "deploy",
  "dlx",
  "doctor",
  "env",
  "exec",
  "fetch",
  "import",
  "init",
  "install",
  "install-test",
  "licenses",
  "link",
  "list",
  "ln",
  "ls",
  "outdated",
  "pack",
  "patch",
  "patch-commit",
  "patch-remove",
  "prune",
  "publish",
  "rb",
  "rebuild",
  "remove",
  "rm",
  "root",
  "run",
  "server",
  "setup",
  "store",
  "un",
  "uninstall",
  "unlink",
  "up",
  "update",
  "why"
]);

var NpmScriptAutoApprover = class extends Disposable {
  constructor(_configurationService, _fileService, _uriIdentityService, _workspaceContextService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
  }
  /**
   * Checks if a single command is an npm/yarn/pnpm script that exists in package.json.
   * Returns auto-approve result if the command is a valid script.
   */
  async isCommandAutoApproved(command4, cwd2) {
    const isNpmScriptAutoApproveEnabled = this._configurationService.getValue("chat.tools.terminal.autoApproveWorkspaceNpmScripts" /* AutoApproveWorkspaceNpmScripts */) === true;
    if (!isNpmScriptAutoApproveEnabled) {
      return { isAutoApproved: false };
    }
    const scriptName = this._extractScriptName(command4);
    if (!scriptName) {
      return { isAutoApproved: false };
    }
    const packageJsonScripts = await this._getPackageJsonScripts(cwd2);
    if (!packageJsonScripts) {
      return { isAutoApproved: false };
    }
    if (!packageJsonScripts.scripts.has(scriptName)) {
      return { isAutoApproved: false };
    }
    return {
      isAutoApproved: true,
      scriptName,
      autoApproveInfo: new MarkdownString(
        localize(20458, null, `\`${scriptName}\``)
      )
    };
  }
  /**
   * Extracts script name from an npm/yarn/pnpm run command.
   */
  _extractScriptName(command4) {
    const trimmedCommand = command4.trim();
    for (const pattern of npmRunPatterns) {
      const match2 = trimmedCommand.match(pattern);
      if (match2?.groups?.scriptName) {
        const { command: pkgManager, scriptName } = match2.groups;
        if (pkgManager.toLowerCase() === "yarn" && yarnBuiltinCommands.has(scriptName.toLowerCase())) {
          continue;
        }
        if (pkgManager.toLowerCase() === "pnpm" && pnpmBuiltinCommands.has(scriptName.toLowerCase())) {
          continue;
        }
        return scriptName;
      }
    }
    return void 0;
  }
  /**
   * Checks if a URI is within any workspace folder.
   */
  _isWithinWorkspace(uri4) {
    const workspaceFolders = this._workspaceContextService.getWorkspace().folders;
    return workspaceFolders.some((folder) => this._uriIdentityService.extUri.isEqualOrParent(uri4, folder.uri));
  }
  /**
   * Finds and parses package.json to get the scripts section.
   * Only looks within the workspace for security.
   */
  async _getPackageJsonScripts(cwd2) {
    if (!cwd2 || !this._isWithinWorkspace(cwd2)) {
      return void 0;
    }
    const packageJsonUri = URI.joinPath(cwd2, "package.json");
    const scripts = await this._readPackageJsonScripts(packageJsonUri);
    if (scripts) {
      return { uri: packageJsonUri, scripts };
    }
    return void 0;
  }
  /**
   * Reads and parses the scripts section from a package.json file.
   */
  async _readPackageJsonScripts(packageJsonUri) {
    try {
      const exists = await this._fileService.exists(packageJsonUri);
      if (!exists) {
        return void 0;
      }
      const content = await this._fileService.readFile(packageJsonUri);
      const text2 = content.value.toString();
      return this._parsePackageJsonScripts(text2);
    } catch {
      return void 0;
    }
  }
  /**
   * Parses the scripts section from package.json content using jsonc-parser.
   */
  _parsePackageJsonScripts(content) {
    const scripts = /* @__PURE__ */ new Set();
    let inScripts = false;
    let level = 0;
    const visitor = {
      onError() {
      },
      onObjectBegin() {
        level++;
      },
      onObjectEnd() {
        if (inScripts && level === 2) {
          inScripts = false;
        }
        level--;
      },
      onObjectProperty(property) {
        if (level === 1 && property === "scripts") {
          inScripts = true;
        } else if (inScripts && level === 2) {
          scripts.add(property);
        }
      }
    };
    visit(content, visitor);
    return scripts.size > 0 ? scripts : void 0;
  }
};

NpmScriptAutoApprover = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IWorkspaceContextService)
], NpmScriptAutoApprover);
export { npmRunPatterns, yarnBuiltinCommands, pnpmBuiltinCommands, NpmScriptAutoApprover };
