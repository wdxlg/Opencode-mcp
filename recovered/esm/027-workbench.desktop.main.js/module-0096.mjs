// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/triggerInlineEditCommandsRegistry.ts



// src/vs/editor/browser/triggerInlineEditCommandsRegistry.ts
var TriggerInlineEditCommandsRegistry = class _TriggerInlineEditCommandsRegistry {
  static {
    this.REGISTERED_COMMANDS = /* @__PURE__ */ new Set();
  }
  static getRegisteredCommands() {
    return [..._TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS];
  }
  static registerCommand(commandId) {
    _TriggerInlineEditCommandsRegistry.REGISTERED_COMMANDS.add(commandId);
  }
};
export { TriggerInlineEditCommandsRegistry };
