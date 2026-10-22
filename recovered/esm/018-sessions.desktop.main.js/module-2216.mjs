// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/sessionDbUri.ts
import { URI } from "./module-0032.mjs";
import { decodeHex } from "./module-0038.mjs";


// src/vs/platform/agentHost/common/sessionDbUri.ts
var SESSION_DB_SCHEME = "session-db";

function sessionDbUri(path, fields) {
  return URI.from({ scheme: SESSION_DB_SCHEME, path, query: JSON.stringify(fields) });
}

function canonicalizeSessionDbUri(uri4, fileUri) {
  if (uri4.scheme !== SESSION_DB_SCHEME || uri4.query) {
    return uri4;
  }
  const fields = parseLegacySessionDbUri(uri4);
  if (!fields) {
    return uri4;
  }
  return sessionDbUri(fileUri.path, fields);
}

function parseLegacySessionDbUri(uri4) {
  const [, toolCallId, filePath, part] = uri4.path.split("/");
  if (!toolCallId || !filePath || part !== "before" && part !== "after") {
    return void 0;
  }
  try {
    return {
      sessionUri: decodeHex(uri4.authority).toString(),
      toolCallId: decodeURIComponent(toolCallId),
      filePath: decodeHex(filePath).toString(),
      part
    };
  } catch {
    return void 0;
  }
}
export { sessionDbUri, canonicalizeSessionDbUri, parseLegacySessionDbUri, SESSION_DB_SCHEME };
