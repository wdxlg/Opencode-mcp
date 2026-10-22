// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/resourceReadLogging.ts
import { URI } from "./module-0023.mjs";
import { Schemas } from "./module-0024.mjs";
import { hasKey } from "./module-0008.mjs";


// src/vs/platform/agentHost/common/resourceReadLogging.ts
function isFileResourceRead(method, params) {
  if (method !== "resourceRead" || !hasUriParam(params)) {
    return false;
  }
  const uri = params.uri;
  if (typeof uri !== "string") {
    return false;
  }
  try {
    return URI.parse(uri).scheme === Schemas.file;
  } catch {
    return false;
  }
}

function hasUriParam(params) {
  return typeof params === "object" && params !== null && hasKey(params, { uri: true });
}
export { isFileResourceRead, hasUriParam };
