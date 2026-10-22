// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-changeset/reducer.ts
import { softAssertNever2 } from "./module-2222.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-changeset/reducer.ts
function changesetReducer(state, action, log4) {
  switch (action.type) {
    case "changeset/statusChanged" /* ChangesetStatusChanged */: {
      if (action.status === "error" /* Error */) {
        return { ...state, status: action.status, error: action.error };
      }
      const { error: _ignored, ...rest } = state;
      return { ...rest, status: action.status };
    }
    case "changeset/fileSet" /* ChangesetFileSet */: {
      const idx = state.files.findIndex((f) => f.id === action.file.id);
      if (idx < 0) {
        return { ...state, files: [...state.files, action.file] };
      }
      const next = [...state.files];
      next[idx] = action.file;
      return { ...state, files: next };
    }
    case "changeset/fileRemoved" /* ChangesetFileRemoved */: {
      const idx = state.files.findIndex((f) => f.id === action.fileId);
      if (idx < 0) {
        return state;
      }
      const next = [...state.files];
      next.splice(idx, 1);
      return { ...state, files: next };
    }
    case "changeset/filesReviewChanged" /* ChangesetFilesReviewChanged */: {
      let changed = false;
      const ids = new Set(action.files);
      const next = state.files.map((f) => {
        if (!ids.has(f.id) || f.reviewed === action.reviewed) {
          return f;
        }
        changed = true;
        return { ...f, reviewed: action.reviewed };
      });
      return changed ? { ...state, files: next } : state;
    }
    case "changeset/contentChanged" /* ChangesetContentChanged */: {
      return action.operations === void 0 ? { ...state, files: action.files } : { ...state, files: action.files, operations: action.operations };
    }
    case "changeset/operationsChanged" /* ChangesetOperationsChanged */: {
      if (action.operations === void 0) {
        const { operations: _ignored, ...rest } = state;
        return rest;
      }
      return { ...state, operations: action.operations };
    }
    case "changeset/operationStatusChanged" /* ChangesetOperationStatusChanged */: {
      if (state.operations === void 0) {
        return state;
      }
      const idx = state.operations.findIndex((o) => o.id === action.operationId);
      if (idx < 0) {
        return state;
      }
      const current = state.operations[idx];
      let nextOp;
      if (action.status === "error" /* Error */) {
        nextOp = { ...current, status: action.status, error: action.error };
      } else {
        const { error: _ignored, ...rest } = current;
        nextOp = { ...rest, status: action.status };
      }
      const next = [...state.operations];
      next[idx] = nextOp;
      return { ...state, operations: next };
    }
    case "changeset/cleared" /* ChangesetCleared */:
      if (state.files.length === 0) {
        return state;
      }
      return { ...state, files: [] };
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { changesetReducer };
