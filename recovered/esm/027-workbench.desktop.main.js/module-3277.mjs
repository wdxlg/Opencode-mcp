// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEditorSerializer.ts
import { isNumber, isObject } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalEditorService } from "./module-1149.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEditorSerializer.ts
var TerminalInputSerializer = class {
  constructor(_terminalEditorService) {
    this._terminalEditorService = _terminalEditorService;
  }
  canSerialize(editorInput) {
    return isNumber(editorInput.terminalInstance?.persistentProcessId) && editorInput.terminalInstance.shouldPersist;
  }
  serialize(editorInput) {
    if (!this.canSerialize(editorInput)) {
      return;
    }
    return JSON.stringify(this._toJson(editorInput.terminalInstance));
  }
  deserialize(instantiationService, serializedEditorInput) {
    const editorInput = JSON.parse(serializedEditorInput);
    if (!isDeserializedTerminalEditorInput(editorInput)) {
      throw new Error(`Could not revive terminal editor input, ${editorInput}`);
    }
    return this._terminalEditorService.reviveInput(editorInput);
  }
  _toJson(instance2) {
    return {
      id: instance2.persistentProcessId,
      pid: instance2.processId || 0,
      title: instance2.title,
      titleSource: instance2.titleSource,
      cwd: "",
      icon: instance2.icon,
      color: instance2.color,
      hasChildProcesses: instance2.hasChildProcesses,
      isFeatureTerminal: instance2.shellLaunchConfig.isFeatureTerminal,
      hideFromUser: instance2.shellLaunchConfig.hideFromUser,
      reconnectionProperties: instance2.shellLaunchConfig.reconnectionProperties,
      shellIntegrationNonce: instance2.shellIntegrationNonce
    };
  }
};

TerminalInputSerializer = __decorateClass([
  __decorateParam(0, ITerminalEditorService)
], TerminalInputSerializer);

function isDeserializedTerminalEditorInput(obj) {
  return isObject(obj) && "id" in obj && "pid" in obj;
}
export { isDeserializedTerminalEditorInput, TerminalInputSerializer };
