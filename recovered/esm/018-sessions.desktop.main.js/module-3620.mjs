// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/common/changes.ts
import { RawContextKey } from "./module-0089.mjs";


// src/vs/sessions/contrib/changes/common/changes.ts
var CHANGES_VIEW_ID = "workbench.view.agentSessions.changes";

var CHANGES_VIEW_CONTAINER_ID = "workbench.view.agentSessions.changesContainer";

var VIEW_SESSION_CHANGES_COMMAND_ID = "workbench.agentSessions.action.viewChanges";

var SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING = "sessions.changes.openSingleFileDiff";

var ChangesContextKeys = {
  ChangeKind: new RawContextKey("sessions.changeKind", "file"),
  VersionMode: new RawContextKey("sessions.changesVersionMode", ""),
  ViewMode: new RawContextKey("sessions.changesViewMode", "list" /* List */)
};

var ActiveSessionContextKeys = {
  IsolationMode: new RawContextKey("sessions.isolationMode", "workspace" /* Workspace */),
  HasChanges: new RawContextKey("sessions.hasChanges", false),
  HasGitRepository: new RawContextKey("sessions.hasGitRepository", true),
  HasUpstream: new RawContextKey("sessions.hasUpstream", false),
  HasIncomingChanges: new RawContextKey("sessions.hasIncomingChanges", false),
  HasOutgoingChanges: new RawContextKey("sessions.hasOutgoingChanges", false),
  HasUncommittedChanges: new RawContextKey("sessions.hasUncommittedChanges", true),
  HasBranchChanges: new RawContextKey("sessions.hasBranchChanges", false),
  IsMergeBaseBranchProtected: new RawContextKey("sessions.isMergeBaseBranchProtected", false),
  HasGitHubRemote: new RawContextKey("sessions.hasGitHubRemote", false),
  HasPullRequest: new RawContextKey("sessions.hasPullRequest", false),
  HasGitOperationInProgress: new RawContextKey("sessions.hasGitOperationInProgress", false),
  HasOpenPullRequest: new RawContextKey("sessions.hasOpenPullRequest", false)
};
export { CHANGES_VIEW_ID, CHANGES_VIEW_CONTAINER_ID, VIEW_SESSION_CHANGES_COMMAND_ID, SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING, ChangesContextKeys, ActiveSessionContextKeys };
