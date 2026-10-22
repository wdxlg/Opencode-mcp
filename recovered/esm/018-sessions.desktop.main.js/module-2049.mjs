// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/actions/chatActions.ts
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/actions/chatActions.ts
function isChatViewTitleActionContext(obj) {
  return !!obj && URI.isUri(obj.sessionResource) && obj.$mid === 19 /* ChatViewContext */;
}
export { isChatViewTitleActionContext };
