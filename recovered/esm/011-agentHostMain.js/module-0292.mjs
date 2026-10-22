// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotGitHubTelemetryForwarder.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0053.mjs";


// src/vs/platform/agentHost/node/copilot/copilotGitHubTelemetryForwarder.ts
var CopilotGitHubTelemetryForwarder = class {
  constructor(_isRestrictedTelemetryEnabled, _telemetryService) {
    this._isRestrictedTelemetryEnabled = _isRestrictedTelemetryEnabled;
    this._telemetryService = _telemetryService;
  }
  forward(notification, agentHostTurnId) {
    if (notification.restricted && !this._isRestrictedTelemetryEnabled()) {
      return;
    }
    const event = notification.event;
    const data = {
      ...event.client,
      ...event.properties,
      ...event.metrics,
      created_at: event.created_at,
      model_call_id: event.model_call_id,
      exp_assignment_context: event.exp_assignment_context,
      session_id: event.session_id ?? notification.sessionId,
      sdk_session_id: notification.sessionId,
      copilot_tracking_id: event.copilot_tracking_id,
      kind: event.kind,
      restricted: notification.restricted
    };
    if (event.kind === "response.success" || event.kind === "response.error") {
      if (agentHostTurnId) {
        data.turnId = agentHostTurnId;
      } else {
        delete data.turnId;
      }
    }
    if (event.features) {
      for (const [key, value] of Object.entries(event.features)) {
        if (value !== void 0) {
          data[`feature.${key}`] = value;
        }
      }
    }
    this._telemetryService.publicLog(`copilotSdk/${event.kind}`, data);
  }
};

CopilotGitHubTelemetryForwarder = __decorateClass([
  __decorateParam(1, ITelemetryService)
], CopilotGitHubTelemetryForwarder);
export { CopilotGitHubTelemetryForwarder };
