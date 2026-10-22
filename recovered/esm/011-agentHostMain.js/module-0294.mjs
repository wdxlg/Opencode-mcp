// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotSecondaryAssignmentContext.ts
import { isValidAssignmentContext } from "./module-0293.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0053.mjs";


// src/vs/platform/agentHost/node/copilot/copilotSecondaryAssignmentContext.ts
var SECONDARY_ASSIGNMENT_CONTEXT_PROPERTY = "secondary_assignment_context";

var CopilotSecondaryAssignmentContext = class {
  constructor(_telemetryService) {
    this._telemetryService = _telemetryService;
  }
  update(notification) {
    const value = notification.event.properties.secondary_assignment_context;
    if (!value || value === this._value || !isValidAssignmentContext(value)) {
      return;
    }
    this._telemetryService.setExperimentProperty(SECONDARY_ASSIGNMENT_CONTEXT_PROPERTY, value);
    this._value = value;
  }
};

CopilotSecondaryAssignmentContext = __decorateClass([
  __decorateParam(0, ITelemetryService)
], CopilotSecondaryAssignmentContext);
export { SECONDARY_ASSIGNMENT_CONTEXT_PROPERTY, CopilotSecondaryAssignmentContext };
