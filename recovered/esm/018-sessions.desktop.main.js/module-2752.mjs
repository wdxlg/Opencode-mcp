// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/common/update.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { InEditorZenModeContext, MenuBarVisibleContext } from "./module-0950.mjs";


// src/vs/workbench/contrib/update/common/update.ts
var ShowCurrentReleaseNotesActionId = "update.showCurrentReleaseNotes";

var ShowCurrentReleaseNotesFromCurrentFileActionId = "developer.showCurrentFileAsReleaseNotes";

var UpdateTitleBarContext = new RawContextKey("updateTitleBar", false);

var UpdateTitleBarChatInProgressContext = new RawContextKey("updateTitleBarChatRequestInProgress", false);

var UpdateTitleBarEditorVisibleContext = ContextKeyExpr.and(
  UpdateTitleBarContext,
  InEditorZenModeContext.negate(),
  ContextKeyExpr.not("inDebugMode"),
  UpdateTitleBarChatInProgressContext.negate()
);

var UpdateGlobalActivityBadgeVisibleContext = ContextKeyExpr.or(
  UpdateTitleBarEditorVisibleContext.negate(),
  MenuBarVisibleContext.negate(),
  ContextKeyExpr.notEquals("config.workbench.activityBar.location", "top")
);
export { ShowCurrentReleaseNotesActionId, ShowCurrentReleaseNotesFromCurrentFileActionId, UpdateTitleBarContext, UpdateTitleBarChatInProgressContext, UpdateTitleBarEditorVisibleContext, UpdateGlobalActivityBadgeVisibleContext };
