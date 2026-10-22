// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/commands/common/commands.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { validateConstraints } from "./module-0010.mjs";
import { LinkedList } from "./module-0013.mjs";
import { markAsSingleton, toDisposable } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/platform/commands/common/commands.ts
var ICommandService = createDecorator("commandService");

var CommandsRegistry = new class {
  constructor() {
    this._commands = /* @__PURE__ */ new Map();
    this._onDidRegisterCommand = new Emitter();
    this.onDidRegisterCommand = this._onDidRegisterCommand.event;
  }
  registerCommand(idOrCommand, handler) {
    if (!idOrCommand) {
      throw new Error(`invalid command`);
    }
    if (typeof idOrCommand === "string") {
      if (!handler) {
        throw new Error(`invalid command`);
      }
      return this.registerCommand({ id: idOrCommand, handler });
    }
    if (idOrCommand.metadata && Array.isArray(idOrCommand.metadata.args)) {
      const constraints = [];
      for (const arg of idOrCommand.metadata.args) {
        constraints.push(arg.constraint);
      }
      const actualHandler = idOrCommand.handler;
      idOrCommand.handler = function(accessor, ...args2) {
        validateConstraints(args2, constraints);
        return actualHandler(accessor, ...args2);
      };
    }
    const { id: id2 } = idOrCommand;
    let commands = this._commands.get(id2);
    if (!commands) {
      commands = new LinkedList();
      this._commands.set(id2, commands);
    }
    const removeFn = commands.unshift(idOrCommand);
    const ret = toDisposable(() => {
      removeFn();
      const command4 = this._commands.get(id2);
      if (command4?.isEmpty()) {
        this._commands.delete(id2);
      }
    });
    this._onDidRegisterCommand.fire(id2);
    return markAsSingleton(ret);
  }
  registerCommandAlias(oldId, newId) {
    return CommandsRegistry.registerCommand(oldId, (accessor, ...args2) => accessor.get(ICommandService).executeCommand(newId, ...args2));
  }
  getCommand(id2) {
    const list2 = this._commands.get(id2);
    if (!list2 || list2.isEmpty()) {
      return void 0;
    }
    return Iterable.first(list2);
  }
  getCommands() {
    const result = /* @__PURE__ */ new Map();
    for (const key3 of this._commands.keys()) {
      const command4 = this.getCommand(key3);
      if (command4) {
        result.set(key3, command4);
      }
    }
    return result;
  }
}();

CommandsRegistry.registerCommand("noop", () => {
});
export { ICommandService, CommandsRegistry };
