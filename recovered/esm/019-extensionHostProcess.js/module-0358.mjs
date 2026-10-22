// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/workspace/common/editSessions.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/platform/workspace/common/editSessions.ts
var IEditSessionIdentityService = createDecorator2("editSessionIdentityService");

var EditSessionIdentityMatch = /* @__PURE__ */ ((EditSessionIdentityMatch2) => {
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Complete"] = 100] = "Complete";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["Partial"] = 50] = "Partial";
  EditSessionIdentityMatch2[EditSessionIdentityMatch2["None"] = 0] = "None";
  return EditSessionIdentityMatch2;
})(EditSessionIdentityMatch || {});
export { IEditSessionIdentityService, EditSessionIdentityMatch };
