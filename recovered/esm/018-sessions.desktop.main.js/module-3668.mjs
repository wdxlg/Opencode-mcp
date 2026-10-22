// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/changesetUri.ts



// src/vs/platform/agentHost/common/changesetUri.ts
var TURN_CHANGESET_PREFIX = "turn/";

var CHANGESET_PATH_SEGMENT = "/changeset/";

var URI_SCHEME_PREFIX = /^[a-zA-Z][a-zA-Z0-9+.\-]*:/;

function resolveChangesetUriTemplate(sessionUri, uriTemplate) {
  if (URI_SCHEME_PREFIX.test(uriTemplate)) {
    return uriTemplate;
  }
  return `${sessionUri.replace(/\/+$/, "")}/${uriTemplate.replace(/^\/+/, "")}`;
}

function buildTurnChangesetUri(sessionUri, turnId) {
  if (!turnId || turnId.includes("/")) {
    throw new Error(`buildTurnChangesetUri: turnId must be non-empty and not contain '/' (got ${JSON.stringify(turnId)})`);
  }
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${TURN_CHANGESET_PREFIX}${turnId}`;
}
export { resolveChangesetUriTemplate, buildTurnChangesetUri, TURN_CHANGESET_PREFIX, CHANGESET_PATH_SEGMENT, URI_SCHEME_PREFIX };
