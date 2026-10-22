// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/environmentVariableInfo.ts
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/terminal/browser/environmentVariableInfo.ts
var EnvironmentVariableInfoStale = class {
  constructor(_diff, _terminalId, _collection, _terminalService, _extensionService) {
    this._diff = _diff;
    this._terminalId = _terminalId;
    this._collection = _collection;
    this._terminalService = _terminalService;
    this._extensionService = _extensionService;
    this.requiresAction = true;
  }
  _getInfo(scope) {
    const extSet = /* @__PURE__ */ new Set();
    addExtensionIdentifiers(extSet, this._diff.added.values());
    addExtensionIdentifiers(extSet, this._diff.removed.values());
    addExtensionIdentifiers(extSet, this._diff.changed.values());
    let message = localize(19916, null);
    message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
    return message;
  }
  _getActions() {
    return [{
      label: localize(19917, null),
      run: () => this._terminalService.getInstanceFromId(this._terminalId)?.relaunch(),
      commandId: "workbench.action.terminal.relaunch" /* Relaunch */
    }];
  }
  getStatus(scope) {
    return {
      id: "relaunch-needed" /* RelaunchNeeded */,
      severity: severity_default.Warning,
      icon: Codicon.warning,
      tooltip: this._getInfo(scope),
      hoverActions: this._getActions()
    };
  }
};

EnvironmentVariableInfoStale = __decorateClass([
  __decorateParam(3, ITerminalService),
  __decorateParam(4, IExtensionService)
], EnvironmentVariableInfoStale);

var EnvironmentVariableInfoChangesActive = class {
  constructor(_collection, _commandService, _extensionService) {
    this._collection = _collection;
    this._commandService = _commandService;
    this._extensionService = _extensionService;
    this.requiresAction = false;
  }
  _getInfo(scope) {
    const extSet = /* @__PURE__ */ new Set();
    addExtensionIdentifiers(extSet, this._collection.getVariableMap(scope).values());
    let message = localize(19915, null);
    message += getMergedDescription(this._collection, scope, this._extensionService, extSet);
    return message;
  }
  _getActions(scope) {
    return [{
      label: localize(19919, null),
      run: () => this._commandService.executeCommand("workbench.action.terminal.showEnvironmentContributions" /* ShowEnvironmentContributions */, scope),
      commandId: "workbench.action.terminal.showEnvironmentContributions" /* ShowEnvironmentContributions */
    }];
  }
  getStatus(scope) {
    return {
      id: "env-var-info-changes-active" /* EnvironmentVariableInfoChangesActive */,
      severity: severity_default.Info,
      tooltip: void 0,
      // The action is present when details aren't shown
      detailedTooltip: this._getInfo(scope),
      hoverActions: this._getActions(scope)
    };
  }
};

EnvironmentVariableInfoChangesActive = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IExtensionService)
], EnvironmentVariableInfoChangesActive);

function getMergedDescription(collection, scope, extensionService, extSet) {
  const message = ["\n"];
  const globalDescriptions = collection.getDescriptionMap(void 0);
  const workspaceDescriptions = collection.getDescriptionMap(scope);
  for (const ext of extSet) {
    const globalDescription = globalDescriptions.get(ext);
    if (globalDescription) {
      message.push(`
- \`${getExtensionName(ext, extensionService)}\``);
      message.push(`: ${globalDescription}`);
    }
    const workspaceDescription = workspaceDescriptions.get(ext);
    if (workspaceDescription) {
      const workspaceSuffix = globalDescription ? ` (${localize(19918, null)})` : "";
      message.push(`
- \`${getExtensionName(ext, extensionService)}${workspaceSuffix}\``);
      message.push(`: ${workspaceDescription}`);
    }
    if (!globalDescription && !workspaceDescription) {
      message.push(`
- \`${getExtensionName(ext, extensionService)}\``);
    }
  }
  return message.join("");
}

function addExtensionIdentifiers(extSet, diff4) {
  for (const mutators of diff4) {
    for (const mutator of mutators) {
      extSet.add(mutator.extensionIdentifier);
    }
  }
}

function getExtensionName(id2, extensionService) {
  return extensionService.extensions.find((e) => e.id === id2)?.displayName || id2;
}
export { getMergedDescription, addExtensionIdentifiers, getExtensionName, EnvironmentVariableInfoStale, EnvironmentVariableInfoChangesActive };
