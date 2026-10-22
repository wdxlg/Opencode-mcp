// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionHoverContent.ts
import { getSessionWorkspaceKind, getUntitledSessionTitle } from "./module-1767.mjs";
import { Codicon } from "./module-0085.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionHoverContent.ts
function getSessionDiffStats(session) {
  const changes = session.changes.get();
  if (changes.length === 0) {
    return void 0;
  }
  let insertions = 0;
  let deletions = 0;
  for (const change of changes) {
    insertions += change.insertions;
    deletions += change.deletions;
  }
  if (insertions === 0 && deletions === 0) {
    return void 0;
  }
  return { files: changes.length, insertions, deletions };
}

function getSessionSummaryHoverData(session, sessionsProvidersService, openerService, labelService, preferencesService, createdBy) {
  return {
    title: session.title.get() || getUntitledSessionTitle(session.isQuickChat?.get() ?? false),
    location: getLocation(session, labelService),
    pullRequests: getPullRequests(session, openerService),
    createdBy,
    externalSession: getExternalSession(session, preferencesService),
    providerLabel: getProviderLabel(session, sessionsProvidersService)
  };
}

function getLocation(session, labelService) {
  const workspace = session.workspace.get();
  const folder = workspace?.folders[0];
  if (!workspace || !folder) {
    return void 0;
  }
  const worktreePending = session.worktreePending?.get() ?? false;
  const isVirtual = getSessionWorkspaceKind(workspace, worktreePending) === "virtual" /* Virtual */;
  const worktreeUri = worktreePending ? void 0 : folder.gitRepository?.workTreeUri;
  return {
    // A virtual workspace has no path a user could act on, so it is named by
    // its repository label instead.
    workspace: isVirtual ? workspace.label : labelService.getUriLabel(folder.root),
    workspaceIcon: workspace.typeIcon ?? (isVirtual ? Codicon.cloud : Codicon.folder),
    worktree: worktreeUri ? labelService.getUriLabel(worktreeUri) : void 0,
    worktreePending,
    branch: worktreePending ? void 0 : folder.gitRepository?.branchName?.trim() || void 0,
    changes: worktreePending ? void 0 : getSessionDiffStats(session)
  };
}

function getPullRequests(session, openerService) {
  const gitHubInfo = session.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get();
  if (!gitHubInfo) {
    return void 0;
  }
  const refs = gitHubInfo.pullRequests ? gitHubInfo.pullRequests.filter((ref) => ref.createdByThisSession) : gitHubInfo.pullRequest ? [{ owner: gitHubInfo.owner, repo: gitHubInfo.repo, ...gitHubInfo.pullRequest }] : [];
  return refs.length ? refs.map((ref) => ({
    title: ref.title ?? `#${ref.number}`,
    icon: ref.icon,
    uri: ref.uri,
    onOpen: () => openerService.open(ref.uri, { openExternal: true }).catch(onUnexpectedError)
  })) : void 0;
}

function getExternalSession(session, preferencesService) {
  if (session.isExternal?.get() !== true) {
    return void 0;
  }
  return {
    onOpen: () => {
      preferencesService.openSettings({
        jsonEditor: false,
        query: `@id:${"chat.agentSessions.showExternal" /* ShowExternalAgentSessions */}`
      }).catch(onUnexpectedError);
    }
  };
}

function getProviderLabel(session, sessionsProvidersService) {
  const provider = sessionsProvidersService.getProvider(session.providerId);
  if (!provider) {
    return void 0;
  }
  return provider.sessionTypes.find((type) => type.id === session.sessionType)?.label ?? provider.label;
}
export { getSessionDiffStats, getSessionSummaryHoverData, getLocation, getPullRequests, getExternalSession, getProviderLabel };
