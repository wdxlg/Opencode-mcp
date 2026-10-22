// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/workspace/common/editSessions.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/platform/workspace/common/editSessions.ts
var IEditSessionIdentityService = createDecorator("editSessionIdentityService");

var EditSessionIdentityMatch = /* @__PURE__ */ ((EditSessionIdentityMatch2) => {
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Complete"] = 100] = "Complete";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Partial"] = 50] = "Partial";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["None"] = 0] = "None";
  return EditSessionIdentityMatch2;
})(EditSessionIdentityMatch || {});
export { IEditSessionIdentityService, EditSessionIdentityMatch };
