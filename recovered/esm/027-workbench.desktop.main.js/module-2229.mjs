// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-annotations/reducer.ts
import { softAssertNever2 } from "./module-2222.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-annotations/reducer.ts
function annotationsReducer(state, action, log4) {
  switch (action.type) {
    case "annotations/set" /* AnnotationsSet */: {
      const idx = state.annotations.findIndex((t2) => t2.id === action.annotation.id);
      if (idx < 0) {
        return { ...state, annotations: [...state.annotations, action.annotation] };
      }
      const next = [...state.annotations];
      next[idx] = action.annotation;
      return { ...state, annotations: next };
    }
    case "annotations/updated" /* AnnotationsUpdated */: {
      const idx = state.annotations.findIndex((t2) => t2.id === action.annotationId);
      if (idx < 0) {
        return state;
      }
      const annotation = state.annotations[idx];
      const updated = { ...annotation };
      if (action.origin !== void 0) {
        updated.origin = action.origin;
      }
      if (action.resource !== void 0) {
        updated.resource = action.resource;
      }
      if (action.range !== void 0) {
        updated.range = action.range;
      }
      if (action.resolved !== void 0) {
        updated.resolved = action.resolved;
      }
      const next = [...state.annotations];
      next[idx] = updated;
      return { ...state, annotations: next };
    }
    case "annotations/removed" /* AnnotationsRemoved */: {
      const idx = state.annotations.findIndex((t2) => t2.id === action.annotationId);
      if (idx < 0) {
        return state;
      }
      const next = [...state.annotations];
      next.splice(idx, 1);
      return { ...state, annotations: next };
    }
    case "annotations/entrySet" /* AnnotationsEntrySet */: {
      const tIdx = state.annotations.findIndex((t2) => t2.id === action.annotationId);
      if (tIdx < 0) {
        return state;
      }
      const annotation = state.annotations[tIdx];
      const cIdx = annotation.entries.findIndex((c) => c.id === action.entry.id);
      let nextEntries;
      if (cIdx < 0) {
        nextEntries = [...annotation.entries, action.entry];
      } else {
        nextEntries = [...annotation.entries];
        nextEntries[cIdx] = action.entry;
      }
      const nextAnnotations = [...state.annotations];
      nextAnnotations[tIdx] = { ...annotation, entries: nextEntries };
      return { ...state, annotations: nextAnnotations };
    }
    case "annotations/entryRemoved" /* AnnotationsEntryRemoved */: {
      const tIdx = state.annotations.findIndex((t2) => t2.id === action.annotationId);
      if (tIdx < 0) {
        return state;
      }
      const annotation = state.annotations[tIdx];
      const cIdx = annotation.entries.findIndex((c) => c.id === action.entryId);
      if (cIdx < 0) {
        return state;
      }
      const nextEntries = [...annotation.entries];
      nextEntries.splice(cIdx, 1);
      const nextAnnotations = [...state.annotations];
      nextAnnotations[tIdx] = { ...annotation, entries: nextEntries };
      return { ...state, annotations: nextAnnotations };
    }
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { annotationsReducer };
