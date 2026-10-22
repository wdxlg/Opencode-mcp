// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/common/editSessions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { StringSHA1 } from "./module-0039.mjs";


// src/vs/workbench/contrib/editSessions/common/editSessions.ts
var EDIT_SESSION_SYNC_CATEGORY = localize2(14954, "Cloud Changes");

var IEditSessionsStorageService = createDecorator("IEditSessionsStorageService");

var IEditSessionsLogService = createDecorator("IEditSessionsLogService");

var EditSessionSchemaVersion = 3;

var EDIT_SESSIONS_SIGNED_IN_KEY = "editSessionsSignedIn";

var EDIT_SESSIONS_SIGNED_IN = new RawContextKey(EDIT_SESSIONS_SIGNED_IN_KEY, false);

var EDIT_SESSIONS_PENDING_KEY = "editSessionsPending";

var EDIT_SESSIONS_PENDING = new RawContextKey(EDIT_SESSIONS_PENDING_KEY, false);

var EDIT_SESSIONS_CONTAINER_ID = "workbench.view.editSessions";

var EDIT_SESSIONS_DATA_VIEW_ID = "workbench.views.editSessions.data";

var EDIT_SESSIONS_TITLE = localize2(14954, "Cloud Changes");

var EDIT_SESSIONS_VIEW_ICON = registerIcon("edit-sessions-view-icon", Codicon.cloudDownload, localize(14955, null));

var EDIT_SESSIONS_SHOW_VIEW = new RawContextKey("editSessionsShowView", false);

var EDIT_SESSIONS_SCHEME = "vscode-edit-sessions";

function decodeEditSessionFileContent(version2, content) {
  switch (version2) {
    case 1:
      return VSBuffer.fromString(content);
    case 2:
      return decodeBase64(content);
    default:
      throw new Error("Upgrade to a newer version to decode this content.");
  }
}

function hashedEditSessionId(editSessionId) {
  const sha1 = new StringSHA1();
  sha1.update(editSessionId);
  return sha1.digest();
}

var editSessionsLogId = "editSessions";
export { decodeEditSessionFileContent, hashedEditSessionId, EDIT_SESSION_SYNC_CATEGORY, IEditSessionsStorageService, IEditSessionsLogService, EditSessionSchemaVersion, EDIT_SESSIONS_SIGNED_IN_KEY, EDIT_SESSIONS_SIGNED_IN, EDIT_SESSIONS_PENDING_KEY, EDIT_SESSIONS_PENDING, EDIT_SESSIONS_CONTAINER_ID, EDIT_SESSIONS_DATA_VIEW_ID, EDIT_SESSIONS_TITLE, EDIT_SESSIONS_VIEW_ICON, EDIT_SESSIONS_SHOW_VIEW, EDIT_SESSIONS_SCHEME, editSessionsLogId };
