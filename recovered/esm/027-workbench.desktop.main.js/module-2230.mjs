// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-automation/reducer.ts
import { softAssertNever2 } from "./module-2222.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-automation/reducer.ts
function automationReducer(state, action, log4) {
  switch (action.type) {
    case "automation/createRequested" /* AutomationCreateRequested */:
    case "automation/updateRequested" /* AutomationUpdateRequested */:
      return state;
    case "automation/set" /* AutomationSet */: {
      const idx = state.automations.findIndex((automation) => automation.resource === action.automation.resource);
      if (idx < 0) {
        return {
          ...state,
          automations: [...state.automations, action.automation]
        };
      }
      const automations = state.automations.slice();
      automations[idx] = action.automation;
      return { ...state, automations };
    }
    case "automation/removed" /* AutomationRemoved */: {
      const idx = state.automations.findIndex((automation) => automation.resource === action.resource);
      if (idx < 0) {
        return state;
      }
      const automations = state.automations.slice();
      automations.splice(idx, 1);
      return { ...state, automations };
    }
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { automationReducer };
