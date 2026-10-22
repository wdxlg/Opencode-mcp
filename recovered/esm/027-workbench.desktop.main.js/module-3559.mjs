// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcomeInput.ts
import { EditorInput } from "./module-0928.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcomeInput.ts
var agentSessionsWelcomeInputTypeId = "workbench.editors.agentSessionsWelcomeInput";

var AgentSessionsWelcomeInput = class _AgentSessionsWelcomeInput extends EditorInput {
  static {
    this.ID = agentSessionsWelcomeInputTypeId;
  }
  static {
    this.RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: "vscode_agent_sessions_welcome" });
  }
  get typeId() {
    return _AgentSessionsWelcomeInput.ID;
  }
  get editorId() {
    return this.typeId;
  }
  toUntyped() {
    return {
      resource: _AgentSessionsWelcomeInput.RESOURCE,
      options: {
        override: _AgentSessionsWelcomeInput.ID,
        pinned: false
      }
    };
  }
  get resource() {
    return _AgentSessionsWelcomeInput.RESOURCE;
  }
  matches(other) {
    if (super.matches(other)) {
      return true;
    }
    return other instanceof _AgentSessionsWelcomeInput;
  }
  constructor(options3 = {}) {
    super();
    this._showTelemetryNotice = !!options3.showTelemetryNotice;
    this._initiator = options3.initiator ?? "command";
    this._workspaceKind = options3.workspaceKind;
  }
  getName() {
    return localize(21883, null);
  }
  get showTelemetryNotice() {
    return this._showTelemetryNotice;
  }
  set showTelemetryNotice(value2) {
    this._showTelemetryNotice = value2;
  }
  get initiator() {
    return this._initiator;
  }
  get workspaceKind() {
    return this._workspaceKind;
  }
  getTelemetryDescriptor() {
    const descriptor = super.getTelemetryDescriptor();
    descriptor["initiator"] = this._initiator;
    descriptor["workspaceKind"] = this._workspaceKind;
    return descriptor;
  }
};
export { agentSessionsWelcomeInputTypeId, AgentSessionsWelcomeInput };
