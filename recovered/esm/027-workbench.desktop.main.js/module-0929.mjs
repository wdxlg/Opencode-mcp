// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/resources.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { parse4 } from "./module-0857.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { getDriveLetter } from "./module-0031.mjs";
import { relativePath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/common/resources.ts
var ResourceGlobMatcher = class extends Disposable {
  constructor(getExpression, shouldUpdate, contextService, configurationService) {
    super();
    this.getExpression = getExpression;
    this.shouldUpdate = shouldUpdate;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this._onExpressionChange = this._register(new Emitter());
    this.onExpressionChange = this._onExpressionChange.event;
    this.mapFolderToParsedExpression = /* @__PURE__ */ new Map();
    this.mapFolderToConfiguredExpression = /* @__PURE__ */ new Map();
    this.updateExpressions(false);
    this.registerListeners();
  }
  static {
    this.NO_FOLDER = null;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (this.shouldUpdate(e)) {
        this.updateExpressions(true);
      }
    }));
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateExpressions(true)));
  }
  updateExpressions(fromEvent) {
    let changed = false;
    for (const folder of this.contextService.getWorkspace().folders) {
      const folderUriStr = folder.uri.toString();
      const newExpression = this.doGetExpression(folder.uri);
      const currentExpression = this.mapFolderToConfiguredExpression.get(folderUriStr);
      if (newExpression) {
        if (!currentExpression || !equals4(currentExpression.expression, newExpression.expression)) {
          changed = true;
          this.mapFolderToParsedExpression.set(folderUriStr, parse4(newExpression.expression));
          this.mapFolderToConfiguredExpression.set(folderUriStr, newExpression);
        }
      } else {
        if (currentExpression) {
          changed = true;
          this.mapFolderToParsedExpression.delete(folderUriStr);
          this.mapFolderToConfiguredExpression.delete(folderUriStr);
        }
      }
    }
    const foldersMap = new ResourceSet(this.contextService.getWorkspace().folders.map((folder) => folder.uri));
    for (const [folder] of this.mapFolderToConfiguredExpression) {
      if (folder === ResourceGlobMatcher.NO_FOLDER) {
        continue;
      }
      if (!foldersMap.has(URI.parse(folder))) {
        this.mapFolderToParsedExpression.delete(folder);
        this.mapFolderToConfiguredExpression.delete(folder);
        changed = true;
      }
    }
    const globalNewExpression = this.doGetExpression(void 0);
    const globalCurrentExpression = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher.NO_FOLDER);
    if (globalNewExpression) {
      if (!globalCurrentExpression || !equals4(globalCurrentExpression.expression, globalNewExpression.expression)) {
        changed = true;
        this.mapFolderToParsedExpression.set(ResourceGlobMatcher.NO_FOLDER, parse4(globalNewExpression.expression));
        this.mapFolderToConfiguredExpression.set(ResourceGlobMatcher.NO_FOLDER, globalNewExpression);
      }
    } else {
      if (globalCurrentExpression) {
        changed = true;
        this.mapFolderToParsedExpression.delete(ResourceGlobMatcher.NO_FOLDER);
        this.mapFolderToConfiguredExpression.delete(ResourceGlobMatcher.NO_FOLDER);
      }
    }
    if (fromEvent && changed) {
      this._onExpressionChange.fire();
    }
  }
  doGetExpression(resource) {
    const expression = this.getExpression(resource);
    if (!expression) {
      return void 0;
    }
    const keys = Object.keys(expression);
    if (keys.length === 0) {
      return void 0;
    }
    let hasAbsolutePath = false;
    const massagedExpression = /* @__PURE__ */ Object.create(null);
    for (const key3 of keys) {
      if (!hasAbsolutePath) {
        hasAbsolutePath = isAbsolute(key3);
      }
      let massagedKey = key3;
      const driveLetter = getDriveLetter(
        massagedKey,
        true
        /* probe for windows */
      );
      if (driveLetter) {
        const driveLetterLower = driveLetter.toLowerCase();
        if (driveLetter !== driveLetter.toLowerCase()) {
          massagedKey = `${driveLetterLower}${massagedKey.substring(1)}`;
        }
      }
      massagedExpression[massagedKey] = expression[key3];
    }
    return {
      expression: massagedExpression,
      hasAbsolutePath
    };
  }
  matches(resource, hasSibling) {
    if (this.mapFolderToParsedExpression.size === 0) {
      return false;
    }
    const folder = this.contextService.getWorkspaceFolder(resource);
    let expressionForFolder;
    let expressionConfigForFolder;
    if (folder && this.mapFolderToParsedExpression.has(folder.uri.toString())) {
      expressionForFolder = this.mapFolderToParsedExpression.get(folder.uri.toString());
      expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(folder.uri.toString());
    } else {
      expressionForFolder = this.mapFolderToParsedExpression.get(ResourceGlobMatcher.NO_FOLDER);
      expressionConfigForFolder = this.mapFolderToConfiguredExpression.get(ResourceGlobMatcher.NO_FOLDER);
    }
    if (!expressionForFolder) {
      return false;
    }
    let resourcePathToMatch;
    if (folder) {
      resourcePathToMatch = relativePath(folder.uri, resource);
    } else {
      resourcePathToMatch = this.uriToPath(resource);
    }
    if (typeof resourcePathToMatch === "string" && !!expressionForFolder(resourcePathToMatch, void 0, hasSibling)) {
      return true;
    }
    if (resourcePathToMatch !== this.uriToPath(resource) && expressionConfigForFolder?.hasAbsolutePath) {
      return !!expressionForFolder(this.uriToPath(resource), void 0, hasSibling);
    }
    return false;
  }
  uriToPath(uri5) {
    if (uri5.scheme === Schemas.file) {
      return uri5.fsPath;
    }
    return uri5.path;
  }
};

ResourceGlobMatcher = __decorateClass([
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IConfigurationService)
], ResourceGlobMatcher);
export { ResourceGlobMatcher };
