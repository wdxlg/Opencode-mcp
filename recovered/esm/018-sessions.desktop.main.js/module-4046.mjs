// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/resourceReadLogging.ts
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { hasKey } from "./module-0010.mjs";


// src/vs/platform/agentHost/common/resourceReadLogging.ts
function isFileResourceRead(method, params) {
  if (method !== "resourceRead" || !hasUriParam(params)) {
    return false;
  }
  const uri4 = params.uri;
  if (typeof uri4 !== "string") {
    return false;
  }
  try {
    return URI.parse(uri4).scheme === Schemas.file;
  } catch {
    return false;
  }
}

function hasUriParam(params) {
  return typeof params === "object" && params !== null && hasKey(params, { uri: true });
}
export { isFileResourceRead, hasUriParam };
