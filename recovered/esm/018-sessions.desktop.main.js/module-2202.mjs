// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-terminal/reducer.ts
import { softAssertNever2 } from "./module-2197.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-terminal/reducer.ts
function terminalReducer(state, action, log4) {
  switch (action.type) {
    case "terminal/data" /* TerminalData */: {
      const content = [...state.content];
      const tail2 = content.length > 0 ? content[content.length - 1] : void 0;
      if (tail2 && tail2.type === "command" && !tail2.isComplete) {
        content[content.length - 1] = { ...tail2, output: tail2.output + action.data };
      } else if (tail2 && tail2.type === "unclassified") {
        content[content.length - 1] = { ...tail2, value: tail2.value + action.data };
      } else {
        content.push({ type: "unclassified", value: action.data });
      }
      return { ...state, content };
    }
    case "terminal/input" /* TerminalInput */:
      return state;
    case "terminal/resized" /* TerminalResized */:
      return { ...state, cols: action.cols, rows: action.rows };
    case "terminal/claimed" /* TerminalClaimed */:
      return { ...state, claim: action.claim };
    case "terminal/titleChanged" /* TerminalTitleChanged */:
      return { ...state, title: action.title };
    case "terminal/cwdChanged" /* TerminalCwdChanged */:
      return { ...state, cwd: action.cwd };
    case "terminal/exited" /* TerminalExited */:
      return {
        ...state,
        lifecycle: {
          status: "exited" /* Exited */,
          exitCode: action.exitCode
        }
      };
    case "terminal/cleared" /* TerminalCleared */:
      return { ...state, content: [] };
    case "terminal/commandDetectionAvailable" /* TerminalCommandDetectionAvailable */:
      return { ...state, supportsCommandDetection: true };
    case "terminal/commandExecuted" /* TerminalCommandExecuted */: {
      const part = {
        type: "command",
        commandId: action.commandId,
        commandLine: action.commandLine,
        output: "",
        timestamp: action.timestamp,
        isComplete: false
      };
      return {
        ...state,
        content: [...state.content, part],
        supportsCommandDetection: true
      };
    }
    case "terminal/commandFinished" /* TerminalCommandFinished */: {
      const content = state.content.map((p) => {
        if (p.type === "command" && p.commandId === action.commandId) {
          return {
            ...p,
            isComplete: true,
            exitCode: action.exitCode,
            durationMs: action.durationMs
          };
        }
        return p;
      });
      return { ...state, content };
    }
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { terminalReducer };
