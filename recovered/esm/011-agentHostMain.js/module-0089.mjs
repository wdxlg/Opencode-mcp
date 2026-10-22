// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-root/reducer.ts
import { softAssertNever2 } from "./module-0088.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-root/reducer.ts
function rootReducer(state, action, log4) {
  switch (action.type) {
    case "root/agentsChanged" /* RootAgentsChanged */:
      return { ...state, agents: action.agents };
    case "root/activeSessionsChanged" /* RootActiveSessionsChanged */:
      return { ...state, activeSessions: action.activeSessions };
    case "root/terminalsChanged" /* RootTerminalsChanged */:
      return { ...state, terminals: action.terminals };
    case "root/configChanged" /* RootConfigChanged */:
      if (!state.config) {
        return state;
      }
      return {
        ...state,
        config: {
          ...state.config,
          values: action.replace ? { ...action.config } : { ...state.config.values, ...action.config }
        }
      };
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { rootReducer };
