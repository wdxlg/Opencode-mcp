// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostChangesetService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostChangesetService.ts
var META_CHANGESET_BRANCH = "agentHost.changeset.branch";

var META_CHANGESET_SESSION = "agentHost.changeset.session";

var META_LEGACY_DIFFS = "diffs";

var META_CHANGES_SUMMARY = "agentHost.changes";

var CHANGESET_DB_METADATA_KEYS = {
  [META_CHANGESET_BRANCH]: true,
  [META_CHANGESET_SESSION]: true,
  [META_CHANGES_SUMMARY]: true,
  [META_LEGACY_DIFFS]: true
};

var CHANGES_SUMMARY_METADATA_KEYS = {
  [META_CHANGES_SUMMARY]: true
};

var IAgentHostChangesetService = createDecorator("agentHostChangesetService");
export { META_CHANGESET_BRANCH, META_CHANGESET_SESSION, META_LEGACY_DIFFS, META_CHANGES_SUMMARY, CHANGESET_DB_METADATA_KEYS, CHANGES_SUMMARY_METADATA_KEYS, IAgentHostChangesetService };
