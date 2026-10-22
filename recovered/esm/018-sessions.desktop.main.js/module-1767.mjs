// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/common/session.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { arrayEquals } from "./module-0042.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/sessions/services/sessions/common/session.ts
var GITHUB_REMOTE_FILE_SCHEME = "github-remote-file";

function isActiveSessionStatus(status2) {
  return status2 === 1 /* InProgress */ || status2 === 2 /* NeedsInput */;
}

function getSessionStatusMessage(status2, description) {
  switch (status2) {
    case 1 /* InProgress */:
      return description ?? localize(5640, null);
    case 2 /* NeedsInput */:
      return description ?? localize(5636, null);
    case 4 /* Error */:
      return description ?? localize(5635, null);
    default:
      return void 0;
  }
}

function effectiveChatInteractivity2(isArchived, interactivity) {
  if (interactivity === "hidden" /* Hidden */) {
    return "hidden" /* Hidden */;
  }
  return isArchived ? "read-only" /* ReadOnly */ : interactivity;
}

function getSessionWorkspaceKind(workspace, worktreePending = false) {
  if (workspace?.isVirtualWorkspace) {
    return "virtual" /* Virtual */;
  }
  if (!worktreePending && workspace && workspace.folders.length > 0 && workspace.folders[0]?.gitRepository?.workTreeUri === void 0) {
    return "folder" /* Folder */;
  }
  return "worktree" /* Worktree */;
}

function getGitHubPullRequestRefs(gitHubInfo) {
  if (gitHubInfo?.pullRequests?.length) {
    return gitHubInfo.pullRequests;
  }
  if (!gitHubInfo?.pullRequest) {
    return [];
  }
  return [{
    owner: gitHubInfo.owner,
    repo: gitHubInfo.repo,
    number: gitHubInfo.pullRequest.number,
    uri: gitHubInfo.pullRequest.uri,
    icon: gitHubInfo.pullRequest.icon,
    title: gitHubInfo.pullRequest.title
  }];
}

var pullRequestIconPriority = /* @__PURE__ */ new Map([
  [Codicon.gitPullRequestError.id, 6],
  [Codicon.gitPullRequestComment.id, 5],
  [Codicon.gitPullRequest.id, 4],
  [Codicon.gitPullRequestDraft.id, 3],
  [Codicon.gitPullRequestDone.id, 2],
  [Codicon.gitPullRequestClosed.id, 1]
]);

function getHighestPriorityPullRequestIcon(icons2) {
  let result;
  let resultPriority = -1;
  for (const icon2 of icons2) {
    if (!icon2) {
      continue;
    }
    const priority = pullRequestIconPriority.get(icon2.id) ?? 0;
    if (priority > resultPriority) {
      result = icon2;
      resultPriority = priority;
    }
  }
  return result;
}

var BRANCH_CHANGES_CHANGESET_ID = "branchChanges";

var TURN_CHANGES_CHANGESET_ID = "turn";

var DEFAULT_CHAT_CAPABILITIES = { canRename: true, canDelete: true };

function getChatCapabilities(chat, session, reader) {
  const own = chat.capabilities?.read(reader) ?? DEFAULT_CHAT_CAPABILITIES;
  if (session && isEqual2(chat.resource, session.mainChat.read(reader).resource)) {
    return own.canDelete ? { ...own, canDelete: false } : own;
  }
  return own;
}

function sessionHasChanges(session, reader) {
  if (session.chats.read(reader).some((chat) => chat.changes.read(reader).length > 0)) {
    return true;
  }
  const changesSummary = session.changesSummary?.read(reader);
  if (changesSummary !== void 0) {
    return changesSummary.files > 0;
  }
  return session.changes.read(reader).length > 0;
}

function toSessionId(providerId, resource) {
  return `${providerId}:${resource.toString()}`;
}

var SESSION_WORKSPACE_GROUP_LOCAL = localize(5638, null);

var SESSION_WORKSPACE_GROUP_GITHUB = localize(5637, null);

var SESSION_WORKSPACE_GROUP_REMOTE = localize(5639, null);

function getUntitledSessionTitle(isQuickChat2) {
  return isQuickChat2 ? localize(5633, null) : localize(5634, null);
}

function sessionFileChangesEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i2 = 0; i2 < a.length; i2++) {
    const x = a[i2], y = b[i2];
    if (x === y) {
      continue;
    }
    if (x.insertions !== y.insertions || x.deletions !== y.deletions) {
      return false;
    }
    const xIsIChatSessionFileChange2 = isIChatSessionFileChange2(x);
    const yIsIChatSessionFileChange2 = isIChatSessionFileChange2(y);
    if (xIsIChatSessionFileChange2 !== yIsIChatSessionFileChange2) {
      return false;
    }
    const xUri = xIsIChatSessionFileChange2 ? x.uri : x.modifiedUri;
    const yUri = yIsIChatSessionFileChange2 ? y.uri : y.modifiedUri;
    if (!isEqual2(xUri, yUri)) {
      return false;
    }
    const xModified = xIsIChatSessionFileChange2 ? x.modifiedUri : void 0;
    const yModified = yIsIChatSessionFileChange2 ? y.modifiedUri : void 0;
    if (!isEqual2(xModified, yModified)) {
      return false;
    }
    if (!isEqual2(x.originalUri, y.originalUri)) {
      return false;
    }
    if (x.reviewed !== y.reviewed) {
      return false;
    }
  }
  return true;
}

function sessionTurnFileChangesEqual(a, b) {
  return sessionFileChangesEqual(a, b) && a.every((change, index2) => change.isOutsideWorkspace === b[index2].isOutsideWorkspace);
}

function gitHubInfoEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === void 0 || b === void 0) {
    return false;
  }
  const aIcon = a.pullRequest?.icon;
  const bIcon = b.pullRequest?.icon;
  return a.owner === b.owner && a.repo === b.repo && arrayEquals(a.pullRequests ?? [], b.pullRequests ?? [], (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number && isEqual2(x.uri, y.uri) && x.title === y.title && x.createdByThisSession === y.createdByThisSession && (x.icon === y.icon || !!x.icon && !!y.icon && ThemeIcon.isEqual(x.icon, y.icon))) && a.pullRequest?.number === b.pullRequest?.number && isEqual2(a.pullRequest?.uri, b.pullRequest?.uri) && (aIcon === bIcon || !!aIcon && !!bIcon && ThemeIcon.isEqual(aIcon, bIcon)) && a.pullRequest?.title === b.pullRequest?.title && a.pullRequest?.baseRefOid === b.pullRequest?.baseRefOid && a.pullRequest?.headRefOid === b.pullRequest?.headRefOid;
}

function sessionWorkspaceEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b || !isEqual2(a.uri, b.uri) || a.label !== b.label || a.description !== b.description || a.group !== b.group || !ThemeIcon.isEqual(a.icon, b.icon) || !!a.typeIcon !== !!b.typeIcon || !!a.typeIcon && !!b.typeIcon && !ThemeIcon.isEqual(a.typeIcon, b.typeIcon) || a.requiresWorkspaceTrust !== b.requiresWorkspaceTrust || a.isVirtualWorkspace !== b.isVirtualWorkspace || a.folders.length !== b.folders.length) {
    return false;
  }
  for (let i2 = 0; i2 < a.folders.length; i2++) {
    if (!sessionFolderEqual(a.folders[i2], b.folders[i2])) {
      return false;
    }
  }
  return true;
}

function sessionFolderEqual(a, b) {
  return isEqual2(a.root, b.root) && isEqual2(a.workingDirectory, b.workingDirectory) && a.name === b.name && a.description === b.description && sessionGitRepositoryEqual(a.gitRepository, b.gitRepository);
}

function sessionGitRepositoryEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return isEqual2(a.uri, b.uri) && isEqual2(a.workTreeUri, b.workTreeUri) && a.branchName === b.branchName && a.baseBranchName === b.baseBranchName && a.baseBranchProtected === b.baseBranchProtected && a.hasGitHubRemote === b.hasGitHubRemote && a.upstreamBranchName === b.upstreamBranchName && a.incomingChanges === b.incomingChanges && a.outgoingChanges === b.outgoingChanges && a.uncommittedChanges === b.uncommittedChanges && a.hasGitOperationInProgress === b.hasGitOperationInProgress && gitHubInfoEqual(a.gitHubInfo.get(), b.gitHubInfo.get());
}
export { isActiveSessionStatus, getSessionStatusMessage, effectiveChatInteractivity2, getSessionWorkspaceKind, getGitHubPullRequestRefs, getHighestPriorityPullRequestIcon, getChatCapabilities, sessionHasChanges, toSessionId, getUntitledSessionTitle, sessionFileChangesEqual, sessionTurnFileChangesEqual, gitHubInfoEqual, sessionWorkspaceEqual, sessionFolderEqual, sessionGitRepositoryEqual, GITHUB_REMOTE_FILE_SCHEME, pullRequestIconPriority, BRANCH_CHANGES_CHANGESET_ID, TURN_CHANGES_CHANGESET_ID, DEFAULT_CHAT_CAPABILITIES, SESSION_WORKSPACE_GROUP_LOCAL, SESSION_WORKSPACE_GROUP_GITHUB, SESSION_WORKSPACE_GROUP_REMOTE };
