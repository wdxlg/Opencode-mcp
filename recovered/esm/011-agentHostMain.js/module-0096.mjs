// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-automation-run/reducer.ts
import { softAssertNever2 } from "./module-0088.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-automation-run/reducer.ts
function automationRunReducer(state, action, log4) {
  switch (action.type) {
    case "automationRun/lifecycleChanged" /* AutomationRunLifecycleChanged */:
      return { ...state, lifecycle: action.lifecycle };
    case "automationRun/sessionSet" /* AutomationRunSessionSet */:
      if (state.sessions.includes(action.session)) {
        return state;
      }
      return { ...state, sessions: [...state.sessions, action.session] };
    case "automationRun/sessionRemoved" /* AutomationRunSessionRemoved */: {
      const index = state.sessions.indexOf(action.session);
      if (index < 0) {
        return state;
      }
      const sessions = state.sessions.slice();
      sessions.splice(index, 1);
      const next = { ...state, sessions };
      if (state.primarySession === action.session) {
        delete next.primarySession;
      }
      return next;
    }
    case "automationRun/primarySessionChanged" /* AutomationRunPrimarySessionChanged */: {
      const next = { ...state };
      if (action.primarySession === void 0) {
        delete next.primarySession;
      } else {
        next.primarySession = action.primarySession;
      }
      return next;
    }
    case "automationRun/cancelRequested" /* AutomationRunCancelRequested */:
      return state;
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { automationRunReducer };
