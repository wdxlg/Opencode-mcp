// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatService/openCodeSharedChat.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { LocalChatSessionUri } from "./module-0962.mjs";
import { stringifyEntryWithFallback } from "./module-2473.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/common/chatService/openCodeSharedChat.ts
var OPENCODE_SHARED_CHAT_SETTING = "opencode.chat.sharedHistory";

var OpenCodeSharedChat = class extends Disposable {
  constructor(models, sessionStore, commands, configuration2, log4) {
    super();
    this.sessionStore = sessionStore;
    this.commands = commands;
    this.configuration = configuration2;
    this.log = log4;
    this.tracked = /* @__PURE__ */ new Map();
    this.flushing = false;
    this.lastWarning = "";
    this.scheduler = this._register(new RunOnceScheduler(() => {
      void this.flush();
    }, 300));
    this._register(autorun((reader) => {
      const live = [...models.read(reader)];
      const keys = new Set(live.map((m) => m.sessionResource.toString()));
      for (const [key3, item] of this.tracked) if (!keys.has(key3)) {
        item.listeners.dispose();
        this.tracked.delete(key3);
      }
      for (const model of live) {
        if (!LocalChatSessionUri.isLocalSession(model.sessionResource) || model.isReadOnly.get()) continue;
        const key3 = model.sessionResource.toString();
        if (this.tracked.has(key3)) continue;
        const item = this.item(model);
        this.attachResponses(item);
        this.dirty(item);
      }
    }));
    this._register(configuration2.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(OPENCODE_SHARED_CHAT_SETTING)) this.scheduler.schedule();
    }));
    void this.importHistory().catch((e4) => this.warn(e4));
  }
  get enabled() {
    return this.configuration.getValue(OPENCODE_SHARED_CHAT_SETTING) === true;
  }
  dirty(item) {
    item.dirty = true;
    if (!this.scheduler.isScheduled()) this.scheduler.schedule();
  }
  attachResponses(item) {
    for (const request2 of item.model.getRequests()) {
      if (!request2.response || item.responseIds.has(request2.response.id)) continue;
      item.responseIds.add(request2.response.id);
      item.listeners.add(request2.response.onDidChange(() => this.dirty(item)));
    }
  }
  item(model) {
    const key3 = model.sessionResource.toString();
    let value2 = this.tracked.get(key3);
    if (!value2) {
      value2 = { model, listeners: new DisposableStore(), responseIds: /* @__PURE__ */ new Set(), sequence: 0, dirty: false };
      this.tracked.set(key3, value2);
      const item = value2;
      item.listeners.add(model.onDidChange(() => {
        this.attachResponses(item);
        this.dirty(item);
      }));
      this.attachResponses(item);
    }
    return value2;
  }
  frame(item, generation = item.generation) {
    const data = JSON.parse(stringifyEntryWithFallback(item.model));
    delete data.inputState;
    delete data.pendingRequests;
    return { sessionId: LocalChatSessionUri.parseLocalSessionId(item.model.sessionResource), sessionResource: item.model.sessionResource.toString(), serialized: JSON.stringify(data), sequence: ++item.sequence, generation };
  }
  warn(error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== this.lastWarning) {
      this.lastWarning = message;
      this.log.warn("[OpenCode shared chat]", message);
    }
  }
  async flush() {
    if (!this.enabled || this.flushing) return;
    this.flushing = true;
    try {
      for (const item of this.tracked.values()) {
        if (!item.dirty || !item.model.getRequests().length) continue;
        item.dirty = false;
        try {
          await this.commands.executeCommand("opencode.workspaceHub.publishChat", this.frame(item));
        } catch (e4) {
          item.dirty = true;
          this.warn(e4);
        }
      }
    } finally {
      this.flushing = false;
      if ([...this.tracked.values()].some((v2) => v2.dirty)) this.scheduler.schedule(1e3);
    }
  }
  async begin(model) {
    if (!this.enabled || !LocalChatSessionUri.isLocalSession(model.sessionResource)) return void 0;
    const item = this.item(model);
    const generation = await this.commands.executeCommand("opencode.workspaceHub.beginChat", this.frame(item));
    if (typeof generation !== "string" || !generation) throw new Error("\u5171\u4EAB\u804A\u5929\u7EC4\u4EF6\u672A\u5C31\u7EEA\uFF0C\u672A\u5F00\u59CB\u6267\u884C\u4EFB\u52A1\u3002");
    item.generation = generation;
    this.dirty(item);
    return generation;
  }
  async finish(model, generation) {
    const item = this.item(model);
    await this.commands.executeCommand("opencode.workspaceHub.finishChat", this.frame(item, generation));
  }
  async remove(resource) {
    if (this.enabled && LocalChatSessionUri.isLocalSession(resource)) await this.commands.executeCommand("opencode.workspaceHub.deleteChat", resource.toString());
  }
  async removeWorkspaceHistory() {
    if (!this.enabled) return;
    for (const id2 of Object.keys(await this.sessionStore.getIndex())) if (!id2.includes("://")) await this.remove(LocalChatSessionUri.forSession(id2));
  }
  async importHistory() {
    if (!this.enabled) return;
    const existing = new Set(await this.commands.executeCommand("opencode.workspaceHub.importedKeys"));
    for (const id2 of Object.keys(await this.sessionStore.getIndex())) {
      if (id2.includes("://")) continue;
      const resource = LocalChatSessionUri.forSession(id2).toString();
      const key3 = await this.commands.executeCommand("opencode.workspaceHub.chatKey", resource);
      if (!key3 || existing.has(key3)) continue;
      const stored = await this.sessionStore.readSession(id2);
      if (!stored) continue;
      const data = { ...stored.value, inputState: void 0, pendingRequests: void 0 };
      await this.commands.executeCommand("opencode.workspaceHub.publishChat", { sessionId: id2, sessionResource: resource, serialized: JSON.stringify(data), sequence: 0 }, true);
    }
  }
  dispose() {
    for (const item of this.tracked.values()) item.listeners.dispose();
    this.tracked.clear();
    super.dispose();
  }
};

OpenCodeSharedChat = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILogService)
], OpenCodeSharedChat);
export { OPENCODE_SHARED_CHAT_SETTING, OpenCodeSharedChat };
