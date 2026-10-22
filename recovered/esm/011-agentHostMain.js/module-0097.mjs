// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/changesetUri.ts
import { localize } from "./module-0012.mjs";
import { readSessionGitState, readSessionWorkspaceless } from "./module-0047.mjs";


// src/vs/platform/agentHost/common/changesetUri.ts
var BRANCH_CHANGESET_ID = "branch";

var UNCOMMITTED_CHANGESET_ID = "uncommitted";

var SESSION_CHANGESET_ID = "session";

var TURN_CHANGESET_PREFIX = "turn/";

var TURN_TEMPLATE_VARIABLE = "{turnId}";

var COMPARE_CHANGESET_PREFIX = "compare/";

var COMPARE_ORIGINAL_TEMPLATE_VARIABLE = "{originalTurnId}";

var COMPARE_MODIFIED_TEMPLATE_VARIABLE = "{modifiedTurnId}";

var branchChangesetLabel = () => localize(2060, null);

var sessionChangesetLabel = () => localize(2064, null);

var sessionChangesetDescription = () => localize(2063, null);

var uncommittedChangesetLabel = () => localize(2068, null);

var uncommittedChangesetDescription = () => localize(2067, null);

var thisTurnChangesetLabel = () => localize(2066, null);

var thisTurnChangesetDescription = () => localize(2065, null);

var compareTurnsChangesetLabel = () => localize(2062, null);

var compareTurnsChangesetDescription = () => localize(2061, null);

function formatBranchChangesetDescription(gitState) {
  const { baseBranchName, branchName, upstreamBranchName } = gitState;
  if (baseBranchName && branchName) {
    return `${branchName} \u2192 ${baseBranchName}`;
  }
  if (upstreamBranchName && branchName) {
    return `${branchName} \u2192 ${upstreamBranchName}`;
  }
  return branchName;
}

var CHANGESET_PATH_SEGMENT = "/changeset/";

function buildBranchChangesetUri(sessionUri) {
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${BRANCH_CHANGESET_ID}`;
}

function buildSessionChangesetUri(sessionUri) {
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${SESSION_CHANGESET_ID}`;
}

function buildUncommittedChangesetUri(sessionUri) {
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${UNCOMMITTED_CHANGESET_ID}`;
}

function buildTurnChangesetUriTemplate(sessionUri) {
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${TURN_CHANGESET_PREFIX}${TURN_TEMPLATE_VARIABLE}`;
}

function buildTurnChangesetUri(sessionUri, turnId) {
  if (!turnId || turnId.includes("/")) {
    throw new Error(`buildTurnChangesetUri: turnId must be non-empty and not contain '/' (got ${JSON.stringify(turnId)})`);
  }
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${TURN_CHANGESET_PREFIX}${turnId}`;
}

function buildCompareTurnsChangesetUriTemplate(sessionUri) {
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${COMPARE_CHANGESET_PREFIX}${COMPARE_ORIGINAL_TEMPLATE_VARIABLE}/${COMPARE_MODIFIED_TEMPLATE_VARIABLE}`;
}

function buildCompareTurnsChangesetUri(sessionUri, originalTurnId, modifiedTurnId) {
  if (!originalTurnId || originalTurnId.includes("/")) {
    throw new Error(`buildCompareTurnsChangesetUri: originalTurnId must be non-empty and not contain '/' (got ${JSON.stringify(originalTurnId)})`);
  }
  if (!modifiedTurnId || modifiedTurnId.includes("/")) {
    throw new Error(`buildCompareTurnsChangesetUri: modifiedTurnId must be non-empty and not contain '/' (got ${JSON.stringify(modifiedTurnId)})`);
  }
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${COMPARE_CHANGESET_PREFIX}${originalTurnId}/${modifiedTurnId}`;
}

function parseChangesetUri(uri) {
  const idx = uri.lastIndexOf(CHANGESET_PATH_SEGMENT);
  if (idx < 0) {
    return void 0;
  }
  const changesetId = uri.slice(idx + CHANGESET_PATH_SEGMENT.length);
  if (!changesetId) {
    return void 0;
  }
  const sessionUri = uri.slice(0, idx);
  if (changesetId === BRANCH_CHANGESET_ID) {
    return { sessionUri, changesetId, kind: "branch" /* Branch */ };
  }
  if (changesetId === UNCOMMITTED_CHANGESET_ID) {
    return { sessionUri, changesetId, kind: "uncommitted" /* Uncommitted */ };
  }
  if (changesetId === SESSION_CHANGESET_ID) {
    return { sessionUri, changesetId, kind: "session" /* Session */ };
  }
  if (changesetId.startsWith(TURN_CHANGESET_PREFIX)) {
    const turnId = changesetId.slice(TURN_CHANGESET_PREFIX.length);
    if (!turnId || turnId.includes("/") || turnId === TURN_TEMPLATE_VARIABLE) {
      return void 0;
    }
    return { sessionUri, changesetId, kind: "turn" /* Turn */, turnId };
  }
  if (changesetId.startsWith(COMPARE_CHANGESET_PREFIX)) {
    const tail = changesetId.slice(COMPARE_CHANGESET_PREFIX.length);
    const parts = tail.split("/");
    if (parts.length !== 2) {
      return void 0;
    }
    const [originalTurnId, modifiedTurnId] = parts;
    if (!originalTurnId || !modifiedTurnId || originalTurnId === COMPARE_ORIGINAL_TEMPLATE_VARIABLE || modifiedTurnId === COMPARE_MODIFIED_TEMPLATE_VARIABLE) {
      return void 0;
    }
    return { sessionUri, changesetId, kind: "compare-turns" /* Compare */, originalTurnId, modifiedTurnId };
  }
  if (changesetId.includes("/")) {
    return void 0;
  }
  return { sessionUri, changesetId, kind: "unknown" /* Unknown */ };
}

function buildDefaultChangesetCatalog(sessionUri, state) {
  if (!state || state.lifecycle === "failed" /* Failed */) {
    return [];
  }
  if (state.lifecycle === "creating" /* Creating */) {
    if (readSessionWorkspaceless(state._meta)) {
      return [];
    }
    return [{
      label: uncommittedChangesetLabel(),
      description: uncommittedChangesetDescription(),
      uriTemplate: buildUncommittedChangesetUri(sessionUri),
      changeKind: "uncommitted" /* Uncommitted */
    }];
  }
  const gitState = readSessionGitState(state._meta);
  if (!gitState) {
    return [
      {
        label: sessionChangesetLabel(),
        description: sessionChangesetDescription(),
        uriTemplate: buildSessionChangesetUri(sessionUri),
        changeKind: "session" /* Session */
      },
      {
        label: thisTurnChangesetLabel(),
        description: thisTurnChangesetDescription(),
        uriTemplate: buildTurnChangesetUriTemplate(sessionUri),
        changeKind: "turn" /* Turn */
      }
    ];
  }
  return [
    {
      label: branchChangesetLabel(),
      description: gitState ? formatBranchChangesetDescription(gitState) : void 0,
      uriTemplate: buildBranchChangesetUri(sessionUri),
      changeKind: "branch" /* Branch */,
      capabilities: { review: {} }
    },
    {
      label: uncommittedChangesetLabel(),
      description: uncommittedChangesetDescription(),
      uriTemplate: buildUncommittedChangesetUri(sessionUri),
      changeKind: "uncommitted" /* Uncommitted */
    },
    {
      label: sessionChangesetLabel(),
      description: sessionChangesetDescription(),
      uriTemplate: buildSessionChangesetUri(sessionUri),
      changeKind: "session" /* Session */
    },
    {
      label: thisTurnChangesetLabel(),
      description: thisTurnChangesetDescription(),
      uriTemplate: buildTurnChangesetUriTemplate(sessionUri),
      changeKind: "turn" /* Turn */
    },
    {
      label: compareTurnsChangesetLabel(),
      description: compareTurnsChangesetDescription(),
      uriTemplate: buildCompareTurnsChangesetUriTemplate(sessionUri),
      changeKind: "compare-turns" /* Compare */
    }
  ];
}
export { formatBranchChangesetDescription, buildBranchChangesetUri, buildSessionChangesetUri, buildUncommittedChangesetUri, buildTurnChangesetUriTemplate, buildTurnChangesetUri, buildCompareTurnsChangesetUriTemplate, buildCompareTurnsChangesetUri, parseChangesetUri, buildDefaultChangesetCatalog, BRANCH_CHANGESET_ID, UNCOMMITTED_CHANGESET_ID, SESSION_CHANGESET_ID, TURN_CHANGESET_PREFIX, TURN_TEMPLATE_VARIABLE, COMPARE_CHANGESET_PREFIX, COMPARE_ORIGINAL_TEMPLATE_VARIABLE, COMPARE_MODIFIED_TEMPLATE_VARIABLE, branchChangesetLabel, sessionChangesetLabel, sessionChangesetDescription, uncommittedChangesetLabel, uncommittedChangesetDescription, thisTurnChangesetLabel, thisTurnChangesetDescription, compareTurnsChangesetLabel, compareTurnsChangesetDescription, CHANGESET_PATH_SEGMENT };
