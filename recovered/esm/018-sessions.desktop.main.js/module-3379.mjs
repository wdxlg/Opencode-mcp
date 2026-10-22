// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/workspace/common/workspace.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/workspace/common/workspace.ts
var WorkspaceTrustContext = {
  IsEnabled: new RawContextKey("isWorkspaceTrustEnabled", false, localize(22396, null)),
  IsTrusted: new RawContextKey("isWorkspaceTrusted", false, localize(22395, null))
};

var MANAGE_TRUST_COMMAND_ID = "workbench.trust.manage";
export { WorkspaceTrustContext, MANAGE_TRUST_COMMAND_ID };
