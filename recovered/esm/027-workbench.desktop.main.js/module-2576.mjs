// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentTitleBarStatusService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentTitleBarStatusService.ts
var IAgentTitleBarStatusService = createDecorator("agentTitleBarStatusService");

var AgentTitleBarStatusService = class extends Disposable {
  constructor() {
    super(...arguments);
    this._mode = "default" /* Default */;
    this._onDidChangeMode = this._register(new Emitter());
    this.onDidChangeMode = this._onDidChangeMode.event;
    this._onDidChangeSessionInfo = this._register(new Emitter());
    this.onDidChangeSessionInfo = this._onDidChangeSessionInfo.event;
  }
  get mode() {
    return this._mode;
  }
  get sessionInfo() {
    return this._sessionInfo;
  }
  enterSessionMode(sessionResource, title) {
    const newInfo = { sessionResource, title };
    const modeChanged = this._mode !== "session" /* Session */;
    this._mode = "session" /* Session */;
    this._sessionInfo = newInfo;
    if (modeChanged) {
      this._onDidChangeMode.fire(this._mode);
    }
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
  enterSessionReadyMode(sessionResource, title) {
    const newInfo = { sessionResource, title };
    const modeChanged = this._mode !== "sessionReady" /* SessionReady */;
    this._mode = "sessionReady" /* SessionReady */;
    this._sessionInfo = newInfo;
    if (modeChanged) {
      this._onDidChangeMode.fire(this._mode);
    }
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
  exitSessionReadyMode() {
    if (this._mode !== "sessionReady" /* SessionReady */) {
      return;
    }
    this._mode = "default" /* Default */;
    this._sessionInfo = void 0;
    this._onDidChangeMode.fire(this._mode);
    this._onDidChangeSessionInfo.fire(void 0);
  }
  exitSessionMode() {
    if (this._mode === "default" /* Default */) {
      return;
    }
    this._mode = "default" /* Default */;
    this._sessionInfo = void 0;
    this._onDidChangeMode.fire(this._mode);
    this._onDidChangeSessionInfo.fire(void 0);
  }
  updateSessionTitle(title) {
    if (this._mode !== "session" /* Session */ || !this._sessionInfo) {
      return;
    }
    this._sessionInfo = { ...this._sessionInfo, title };
    this._onDidChangeSessionInfo.fire(this._sessionInfo);
  }
};
export { IAgentTitleBarStatusService, AgentTitleBarStatusService };
