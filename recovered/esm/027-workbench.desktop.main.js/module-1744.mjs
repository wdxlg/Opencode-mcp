// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/common/userDataSync.ts
import { createDecorator } from "./module-0077.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/services/userDataSync/common/userDataSync.ts
var IUserDataSyncWorkbenchService = createDecorator("IUserDataSyncWorkbenchService");

function getSyncAreaLabel(source) {
  switch (source) {
    case "settings" /* Settings */:
      return localize(23709, null);
    case "keybindings" /* Keybindings */:
      return localize(23705, null);
    case "snippets" /* Snippets */:
      return localize(23710, null);
    case "prompts" /* Prompts */:
      return localize(23708, null);
    case "tasks" /* Tasks */:
      return localize(23713, null);
    case "mcp" /* Mcp */:
      return localize(23706, null);
    case "extensions" /* Extensions */:
      return localize(23704, null);
    case "globalState" /* GlobalState */:
      return localize(23714, null);
    case "profiles" /* Profiles */:
      return localize(23707, null);
    case "workspaceState" /* WorkspaceState */:
      return localize(23715, null);
  }
}

var SYNC_TITLE = localize2(23711, "Settings Sync");

var SYNC_VIEW_ICON = registerIcon("settings-sync-view-icon", Codicon.sync, localize(23712, null));

var CONTEXT_SYNC_STATE = new RawContextKey("syncStatus", "uninitialized" /* Uninitialized */);

var CONTEXT_SYNC_ENABLEMENT = new RawContextKey("syncEnabled", false);

var CONTEXT_ACCOUNT_STATE = new RawContextKey("userDataSyncAccountStatus", "uninitialized" /* Uninitialized */);

var CONTEXT_ENABLE_ACTIVITY_VIEWS = new RawContextKey(`enableSyncActivityViews`, false);

var CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW = new RawContextKey(`enableSyncConflictsView`, false);

var CONTEXT_HAS_CONFLICTS = new RawContextKey("hasConflicts", false);

var CONFIGURE_SYNC_COMMAND_ID = "workbench.userDataSync.actions.configure";

var SHOW_SYNC_LOG_COMMAND_ID = "workbench.userDataSync.actions.showLog";

var SYNC_VIEW_CONTAINER_ID = "workbench.view.sync";

var SYNC_CONFLICTS_VIEW_ID = "workbench.views.sync.conflicts";

var DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR = {
  id: "workbench.userDataSync.actions.downloadSyncActivity",
  title: localize2(23703, "Download Settings Sync Activity"),
  category: Categories.Developer,
  f1: true,
  precondition: ContextKeyExpr.and(CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
};
export { getSyncAreaLabel, IUserDataSyncWorkbenchService, SYNC_TITLE, SYNC_VIEW_ICON, CONTEXT_SYNC_STATE, CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE, CONTEXT_ENABLE_ACTIVITY_VIEWS, CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, CONTEXT_HAS_CONFLICTS, CONFIGURE_SYNC_COMMAND_ID, SHOW_SYNC_LOG_COMMAND_ID, SYNC_VIEW_CONTAINER_ID, SYNC_CONFLICTS_VIEW_ID, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR };
