// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadCommands.ts
import { DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { revive } from "./module-0265.mjs";
import { SerializableObjectWithBuffers } from "./module-0920.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { isString } from "./module-0010.mjs";


// src/vs/workbench/api/browser/mainThreadCommands.ts
var MainThreadCommands = class {
  constructor(extHostContext, _commandService, _extensionService) {
    this._commandService = _commandService;
    this._extensionService = _extensionService;
    this._commandRegistrations = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCommands);
    this._generateCommandsDocumentationRegistration = CommandsRegistry.registerCommand("_generateCommandsDocumentation", () => this._generateCommandsDocumentation());
  }
  dispose() {
    this._commandRegistrations.dispose();
    this._generateCommandsDocumentationRegistration.dispose();
  }
  async _generateCommandsDocumentation() {
    const result = await this._proxy.$getContributedCommandMetadata();
    const commands = CommandsRegistry.getCommands();
    for (const [id2, command4] of commands) {
      if (command4.metadata) {
        result[id2] = command4.metadata;
      }
    }
    const all = [];
    for (const id2 in result) {
      all.push("`" + id2 + "` - " + _generateMarkdown(result[id2]));
    }
    console.log(all.join("\n"));
  }
  $registerCommand(id2) {
    this._commandRegistrations.set(
      id2,
      CommandsRegistry.registerCommand(id2, (accessor, ...args2) => {
        return this._proxy.$executeContributedCommand(id2, ...args2).then((result) => {
          return revive(result);
        });
      })
    );
  }
  $unregisterCommand(id2) {
    this._commandRegistrations.deleteAndDispose(id2);
  }
  $fireCommandActivationEvent(id2) {
    const activationEvent = `onCommand:${id2}`;
    if (!this._extensionService.activationEventIsDone(activationEvent)) {
      this._extensionService.activateByEvent(activationEvent);
    }
  }
  async $executeCommand(id2, args2, retry2) {
    if (args2 instanceof SerializableObjectWithBuffers) {
      args2 = args2.value;
    }
    for (let i2 = 0; i2 < args2.length; i2++) {
      args2[i2] = revive(args2[i2]);
    }
    if (retry2 && args2.length > 0 && !CommandsRegistry.getCommand(id2)) {
      await this._extensionService.activateByEvent(`onCommand:${id2}`);
      throw new Error("$executeCommand:retry");
    }
    return this._commandService.executeCommand(id2, ...args2);
  }
  $getCommands() {
    return Promise.resolve([...CommandsRegistry.getCommands().keys()]);
  }
};

MainThreadCommands = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadCommands),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IExtensionService)
], MainThreadCommands);

function _generateMarkdown(description) {
  if (typeof description === "string") {
    return description;
  } else {
    const descriptionString = isString(description.description) ? description.description : description.description.original;
    const parts = [descriptionString];
    parts.push("\n\n");
    if (description.args) {
      for (const arg of description.args) {
        parts.push(`* _${arg.name}_ - ${arg.description || ""}
`);
      }
    }
    if (description.returns) {
      parts.push(`* _(returns)_ - ${description.returns}`);
    }
    parts.push("\n\n");
    return parts.join("");
  }
}
export { _generateMarkdown, MainThreadCommands };
