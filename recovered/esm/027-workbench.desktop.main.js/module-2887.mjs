// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/agentHostOutputChannel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/terminal/browser/agentHostOutputChannel.ts
var AgentHostOutputChannel = class extends Disposable {
  constructor(connection, terminalUri) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._output = "";
    this._hasExited = false;
    const subscriptionRef = this._register(connection.getSubscription(3 /* Terminal */, terminalUri, "AgentHostOutputChannel"));
    const subscription = subscriptionRef.object;
    if (subscription.value && !(subscription.value instanceof Error)) {
      this._acceptState(subscription.value);
    }
    this._register(subscription.onDidChange((state) => this._acceptState(state)));
  }
  get output() {
    return this._output;
  }
  get hasExited() {
    return this._hasExited;
  }
  get exitCode() {
    return this._exitCode;
  }
  _acceptState(state) {
    this._output = state.content.map((part) => part.type === "command" ? part.output : part.value).join("").replace(/\r?\n/g, "\r\n");
    const lifecycle = state.lifecycle;
    this._hasExited = lifecycle.status === "exited" /* Exited */;
    this._exitCode = lifecycle.status === "exited" /* Exited */ ? lifecycle.exitCode : void 0;
    this._onDidChange.fire();
  }
};
export { AgentHostOutputChannel };
