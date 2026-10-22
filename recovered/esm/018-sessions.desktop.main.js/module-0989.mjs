// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/participants/chatSlashCommands.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { matchesSessionType } from "./module-0987.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/contrib/chat/common/participants/chatSlashCommands.ts
var IChatSlashCommandService = createDecorator("chatSlashCommandService");

var ChatSlashCommandService = class extends Disposable {
  constructor(_extensionService) {
    super();
    this._extensionService = _extensionService;
    this._commands = /* @__PURE__ */ new Map();
    this._onDidChangeCommands = this._register(new Emitter());
    this.onDidChangeCommands = this._onDidChangeCommands.event;
  }
  dispose() {
    super.dispose();
    this._commands.clear();
  }
  getSessionScopedCommands(id2) {
    return this._commands.get(id2) ?? [];
  }
  commandsOverlap(dataA, dataB) {
    if (dataA.sessionTypes === void 0 || dataB.sessionTypes === void 0) {
      return true;
    }
    return dataA.sessionTypes.some((sessionType) => dataB.sessionTypes?.includes(sessionType));
  }
  getCommand(id2, sessionType) {
    return this.getSessionScopedCommands(id2).find((candidate) => matchesSessionType(candidate.data.sessionTypes, sessionType));
  }
  registerSlashCommand(data, command4) {
    const commandsForId = this.getSessionScopedCommands(data.command);
    if (commandsForId.some((candidate) => this.commandsOverlap(candidate.data, data))) {
      throw new Error(`Already registered a command with id ${data.command}`);
    }
    const entry = { data, command: command4 };
    commandsForId.push(entry);
    this._commands.set(data.command, commandsForId);
    this._onDidChangeCommands.fire();
    return toDisposable(() => {
      const commandsForId2 = this._commands.get(data.command);
      if (!commandsForId2) {
        return;
      }
      const entryIndex = commandsForId2.indexOf(entry);
      if (entryIndex === -1) {
        return;
      }
      commandsForId2.splice(entryIndex, 1);
      if (commandsForId2.length === 0) {
        this._commands.delete(data.command);
      }
      this._onDidChangeCommands.fire();
    });
  }
  getCommands(location2, mode) {
    return Array.from(this._commands.values()).flatMap((commands) => commands.map((v2) => v2.data)).filter((c) => c.locations.includes(location2) && (!c.modes || c.modes.includes(mode)));
  }
  hasCommand(id2, sessionType) {
    return !!this.getCommand(id2, sessionType);
  }
  async executeCommand(id2, prompt, progress, history, location2, sessionResource, token, options3) {
    const data = this.getCommand(id2, getChatSessionType(sessionResource));
    if (!data) {
      throw new Error(`No command with id ${id2} NOT registered`);
    }
    if (!data.command) {
      await this._extensionService.activateByEvent(`onSlash:${id2}`);
    }
    if (!data.command) {
      throw new Error(`No command with id ${id2} NOT resolved`);
    }
    return await data.command(prompt, progress, history, location2, sessionResource, token, options3);
  }
};

ChatSlashCommandService = __decorateClass([
  __decorateParam(0, IExtensionService)
], ChatSlashCommandService);
export { IChatSlashCommandService, ChatSlashCommandService };
