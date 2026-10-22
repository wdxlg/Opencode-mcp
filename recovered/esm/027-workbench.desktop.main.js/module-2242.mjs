// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/fileEditDiff.ts
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { canonicalizeSessionDbUri } from "./module-2241.mjs";


// src/vs/platform/agentHost/common/fileEditDiff.ts
function normalizeFileEdit(edit3) {
  const beforeUri = edit3.before ? URI.parse(edit3.before.uri) : void 0;
  const afterUri = edit3.after ? URI.parse(edit3.after.uri) : void 0;
  const resource = afterUri ?? beforeUri;
  if (!resource) {
    return void 0;
  }
  let kind;
  if (!beforeUri && afterUri) {
    kind = "create" /* Create */;
  } else if (beforeUri && !afterUri) {
    kind = "delete" /* Delete */;
  } else if (beforeUri && afterUri && !isEqual2(beforeUri, afterUri)) {
    kind = "rename" /* Rename */;
  } else {
    kind = "edit" /* Edit */;
  }
  return {
    kind,
    resource,
    beforeUri,
    afterUri,
    beforeContentUri: edit3.before?.content.uri && beforeUri ? canonicalizeSessionDbUri(URI.parse(edit3.before.content.uri), beforeUri) : void 0,
    afterContentUri: edit3.after?.content.uri && afterUri ? canonicalizeSessionDbUri(URI.parse(edit3.after.content.uri), afterUri) : void 0
  };
}
export { normalizeFileEdit };
