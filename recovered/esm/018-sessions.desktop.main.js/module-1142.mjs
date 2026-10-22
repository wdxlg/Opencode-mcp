// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/common/mergeEditor.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/mergeEditor/common/mergeEditor.ts
var ctxIsMergeEditor = new RawContextKey("isMergeEditor", false, { type: "boolean", description: localize(17345, null) });

var ctxIsMergeResultEditor = new RawContextKey("isMergeResultEditor", false, { type: "boolean", description: localize(17346, null) });

var ctxMergeEditorLayout = new RawContextKey("mergeEditorLayout", "mixed", { type: "string", description: localize(17344, null) });

var ctxMergeEditorShowBase = new RawContextKey("mergeEditorShowBase", false, { type: "boolean", description: localize(17348, null) });

var ctxMergeEditorShowBaseAtTop = new RawContextKey("mergeEditorShowBaseAtTop", false, { type: "boolean", description: localize(17349, null) });

var ctxMergeEditorShowNonConflictingChanges = new RawContextKey("mergeEditorShowNonConflictingChanges", false, { type: "boolean", description: localize(17350, null) });

var ctxMergeBaseUri = new RawContextKey("mergeEditorBaseUri", "", { type: "string", description: localize(17343, null) });

var ctxMergeResultUri = new RawContextKey("mergeEditorResultUri", "", { type: "string", description: localize(17347, null) });

var StorageCloseWithConflicts = "mergeEditorCloseWithConflicts";
export { ctxIsMergeEditor, ctxIsMergeResultEditor, ctxMergeEditorLayout, ctxMergeEditorShowBase, ctxMergeEditorShowBaseAtTop, ctxMergeEditorShowNonConflictingChanges, ctxMergeBaseUri, ctxMergeResultUri, StorageCloseWithConflicts };
