// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneSharedHelpers.ts
import { DiffEditorInput } from "./module-1102.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { WebviewInput } from "./module-1117.mjs";
import { EmptyFileEditorInput } from "./module-3767.mjs";
import { FileEditorInput } from "./module-2000.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneSharedHelpers.ts
var MARKDOWN_EDITOR_VIEW_TYPES = /* @__PURE__ */ new Set([
  "markdown.preview",
  "vscode.markdown.editor",
  "vscode.markdown.preview.editor"
]);

var PULL_REQUEST_OVERVIEW_VIEW_TYPE = "PullRequestOverview";

var ISSUE_OVERVIEW_VIEW_TYPE = "IssueOverview";

function isMainPartEmpty(editorGroupsService) {
  for (const group2 of editorGroupsService.mainPart.groups) {
    if (!group2.isEmpty) {
      return false;
    }
  }
  return true;
}

function isChangesEditorInput(editor, sessionChangesService) {
  if (editor instanceof DiffEditorInput || editor instanceof MultiDiffEditorInput) {
    return true;
  }
  const resource = editor.resource;
  return !!resource && sessionChangesService.getSessionResource(resource) !== void 0;
}

function isFileEditorInput(editor) {
  if (editor instanceof WebviewInput) {
    return MARKDOWN_EDITOR_VIEW_TYPES.has(editor.viewType) || MARKDOWN_EDITOR_VIEW_TYPES.has(editor.providerId ?? "");
  }
  return editor instanceof EmptyFileEditorInput || editor instanceof FileEditorInput;
}

function isEditorWithoutDockedDetails(editor) {
  return editor instanceof BrowserEditorInput || editor instanceof WebviewInput && (editor.viewType === PULL_REQUEST_OVERVIEW_VIEW_TYPE || editor.providerId === PULL_REQUEST_OVERVIEW_VIEW_TYPE || editor.viewType === ISSUE_OVERVIEW_VIEW_TYPE || editor.providerId === ISSUE_OVERVIEW_VIEW_TYPE);
}
export { isMainPartEmpty, isChangesEditorInput, isFileEditorInput, isEditorWithoutDockedDetails, MARKDOWN_EDITOR_VIEW_TYPES, PULL_REQUEST_OVERVIEW_VIEW_TYPE, ISSUE_OVERVIEW_VIEW_TYPE };
