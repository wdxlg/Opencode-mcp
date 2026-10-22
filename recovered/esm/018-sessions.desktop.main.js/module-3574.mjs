// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionReference.ts
import { URI } from "./module-0032.mjs";


// src/vs/sessions/services/sessions/browser/sessionReference.ts
function isSessionReferenceVariableEntry(entry) {
  const value2 = entry.value;
  return !!value2 && typeof value2 === "object" && value2.sessionReference === true && typeof value2.sessionResource === "string";
}

function getSessionReferenceResource(entry) {
  if (!isSessionReferenceVariableEntry(entry)) {
    return void 0;
  }
  try {
    return URI.parse(entry.value.sessionResource);
  } catch {
    return void 0;
  }
}

function createSessionReferenceVariableEntry(rawId, name, sessionResource) {
  return {
    kind: "generic",
    id: `session:${rawId}`,
    name,
    value: { sessionReference: true, sessionResource: sessionResource.toString() }
  };
}
export { isSessionReferenceVariableEntry, getSessionReferenceResource, createSessionReferenceVariableEntry };
