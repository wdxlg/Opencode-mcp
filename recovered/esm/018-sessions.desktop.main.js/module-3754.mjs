// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/createSessionFromPullRequestAction.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Menus } from "./module-3437.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SessionSectionHasGitHubRepositoryContext, SessionSectionHasNonCloudRepositoryContext, SessionSectionTypeContext } from "./module-3523.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { createPullRequestBootstrapPrompt, createPullRequestContextAttachment, createPullRequestQuickPickItems, createPullRequestSessionMetadata, getExistingPullRequests, isPullRequestAvailable, mergePullRequestSummaries, pullRequestMatchesQuery, resolvePullRequestSessionRepository } from "./module-3752.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { createAndOpenPullRequestSession } from "./module-3753.mjs";
import { isMobile, isWeb } from "./module-0014.mjs";
import { CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID } from "./module-3474.mjs";
import { waitForState } from "./module-0056.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/sessions/contrib/github/browser/createSessionFromPullRequestAction.ts
var NEW_SESSION_FROM_PULL_REQUEST_COMMAND_ID = "workbench.agentSessions.newSessionFromPullRequest";

registerAction2(class NewSessionFromPullRequestAction extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_FROM_PULL_REQUEST_COMMAND_ID,
      title: localize2(4792, "New Session from Pull Request"),
      icon: Codicon.gitPullRequestCreate,
      precondition: ChatContextKeys.enabled,
      menu: {
        id: Menus.SessionSectionNewSession,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          SessionSectionHasGitHubRepositoryContext,
          SessionSectionHasNonCloudRepositoryContext,
          SessionSectionTypeContext.isEqualTo("workspace")
        )
      }
    });
  }
  async run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const notificationService = accessor.get(INotificationService);
    const gitHubService = accessor.get(IGitHubService);
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const quickInputService = accessor.get(IQuickInputService);
    const commandService = accessor.get(ICommandService);
    const picker = quickInputService.createQuickPick({ useSeparators: true });
    const store = new DisposableStore();
    const pickerCts = store.add(new CancellationTokenSource());
    let sessionCreated = false;
    picker.title = localize(4794, null);
    picker.placeholder = localize(4793, null);
    picker.matchOnDescription = true;
    picker.matchOnDetail = true;
    picker.sortByLabel = false;
    picker.enabled = false;
    picker.busy = true;
    store.add(picker.onDidHide(() => {
      if (!sessionCreated) {
        pickerCts.cancel();
      }
      store.dispose();
    }));
    store.add(picker);
    picker.show();
    let repository;
    try {
      repository = await resolvePullRequestSessionRepository(context2.sessions);
    } catch (error) {
      picker.hide();
      if (!isCancellationError(error)) {
        notificationService.error(localize(4791, null, toErrorMessage(error)));
      }
      return;
    }
    if (store.isDisposed) {
      return;
    }
    if (!repository) {
      picker.hide();
      notificationService.warn(localize(4789, null));
      return;
    }
    const existingPullRequests = getExistingPullRequests(sessionsManagementService.getSessions(), repository.owner, repository.repo, context2.sessions);
    picker.placeholder = localize(4790, null);
    picker.enabled = true;
    let pullRequests = [];
    let cursor;
    let hasNextPage = true;
    let pagePromise;
    let searchGeneration = 0;
    let waitingForReview = [];
    let assignedToViewer = [];
    let waitingForReviewNumbers = /* @__PURE__ */ new Set();
    let assignedToViewerNumbers = /* @__PURE__ */ new Set();
    const updateItems = () => {
      picker.items = createPullRequestQuickPickItems(pullRequests, existingPullRequests);
    };
    const applyViewerGroups = (pullRequest) => ({
      ...pullRequest,
      reviewRequestedFromViewer: waitingForReviewNumbers.has(pullRequest.number),
      assignedToViewer: assignedToViewerNumbers.has(pullRequest.number)
    });
    const loadNextPage = (render = true) => {
      if (!hasNextPage) {
        return Promise.resolve();
      }
      if (!pagePromise) {
        picker.busy = true;
        const promise = gitHubService.getPullRequests(repository.owner, repository.repo, cursor).then((page) => {
          pullRequests = mergePullRequestSummaries(pullRequests, page.pullRequests.map(applyViewerGroups));
          cursor = page.cursor;
          hasNextPage = page.hasNextPage && page.cursor !== void 0;
          if (render) {
            updateItems();
          }
        }).finally(() => {
          pagePromise = void 0;
          if (render) {
            picker.busy = false;
          }
        });
        pagePromise = promise;
        return promise;
      }
      return pagePromise;
    };
    const appendGroup2 = (group2) => {
      const items = createPullRequestQuickPickItems(group2, existingPullRequests);
      if (items.length > 0) {
        picker.items = [...picker.items, ...items];
      }
    };
    const loadGroup = async (request2, groupLabel) => {
      try {
        return await request2;
      } catch (error) {
        notificationService.warn(localize(4787, null, groupLabel, toErrorMessage(error)));
        return [];
      }
    };
    const loadInitialGroups = async () => {
      const firstPage = loadNextPage(false);
      const waitingForReviewPromise = loadGroup(
        gitHubService.getPullRequestsWaitingForReview(repository.owner, repository.repo),
        localize(4796, null)
      );
      const assignedToViewerPromise = loadGroup(
        gitHubService.getPullRequestsAssignedToViewer(repository.owner, repository.repo),
        localize(4795, null)
      );
      waitingForReview = await waitingForReviewPromise;
      waitingForReviewNumbers = new Set(waitingForReview.map((pullRequest) => pullRequest.number));
      pullRequests = mergePullRequestSummaries(pullRequests, waitingForReview.map(applyViewerGroups));
      appendGroup2(waitingForReview);
      assignedToViewer = (await assignedToViewerPromise).filter((pullRequest) => !waitingForReviewNumbers.has(pullRequest.number));
      assignedToViewerNumbers = new Set(assignedToViewer.map((pullRequest) => pullRequest.number));
      pullRequests = mergePullRequestSummaries(pullRequests, assignedToViewer.map(applyViewerGroups));
      appendGroup2(assignedToViewer);
      await firstPage;
      pullRequests = pullRequests.map(applyViewerGroups);
      updateItems();
      picker.busy = false;
    };
    const initialGroupsPromise = loadInitialGroups();
    const loadUntilMatch = async (query, generation) => {
      await initialGroupsPromise;
      while (generation === searchGeneration && query && hasNextPage && !pullRequests.some((pullRequest) => isPullRequestAvailable(pullRequest, existingPullRequests) && pullRequestMatchesQuery(pullRequest, query))) {
        await loadNextPage();
      }
    };
    store.add(picker.onDidChangeValue((value2) => {
      const generation = ++searchGeneration;
      void loadUntilMatch(value2, generation).catch((error) => {
        notificationService.error(localize(4788, null, toErrorMessage(error)));
      });
    }));
    store.add(picker.onDidAccept(async () => {
      const pullRequest = picker.selectedItems[0]?.pullRequest;
      if (!pullRequest) {
        return;
      }
      picker.enabled = false;
      picker.busy = true;
      try {
        await waitForWorktreeSessionType(sessionsManagementService, repository.folderUri, pickerCts.token);
        if (pickerCts.token.isCancellationRequested) {
          return;
        }
        await createAndOpenPullRequestSession(
          (onSessionCreated) => sessionsManagementService.createAndSendNewChatRequest(repository.folderUri, {
            kind: "deferred",
            activity: localize(4786, null),
            async resolve() {
              const pullRequestContext = await gitHubService.getPullRequestContext(repository.owner, repository.repo, pullRequest.number);
              return {
                query: createPullRequestBootstrapPrompt(pullRequest),
                title: pullRequest.title,
                attachedContext: [createPullRequestContextAttachment(pullRequestContext)],
                hideFromTranscript: true
              };
            }
          }, {
            isolationMode: "worktree",
            branch: pullRequest.headRef,
            worktreeBranchTrack: true,
            worktreeCreateNewBranch: false,
            metadata: createPullRequestSessionMetadata(repository.owner, repository.repo, pullRequest),
            onSessionCreated
          }, pickerCts.token),
          (resource) => sessionsService.showSession(resource),
          () => {
            sessionCreated = true;
            if (!store.isDisposed) {
              picker.hide();
            }
          }
        );
        if (isWeb && isMobile) {
          await commandService.executeCommand(CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID);
        }
        sessionsPartService.focusSession(sessionsService.activeSession.get());
      } catch (error) {
        if (isCancellationError(error)) {
          return;
        }
        if (!store.isDisposed) {
          picker.hide();
        }
        notificationService.error(localize(4785, null, pullRequest.number, toErrorMessage(error)));
        await sessionsService.openNewSession();
      }
    }));
    void initialGroupsPromise.catch((error) => {
      picker.busy = false;
      notificationService.error(localize(4788, null, toErrorMessage(error)));
    });
  }
});

async function waitForWorktreeSessionType(sessionsManagementService, folderUri, token) {
  const isAvailable = () => sessionsManagementService.getSessionTypesForFolder(folderUri).some((candidate) => candidate.sessionType.supportsWorktreeConfiguration === true);
  if (isAvailable()) {
    return;
  }
  await waitForState(
    observableFromEvent(sessionsManagementService.onDidChangeSessionTypes, isAvailable),
    (available) => available,
    void 0,
    token
  );
}
export { waitForWorktreeSessionType, NEW_SESSION_FROM_PULL_REQUEST_COMMAND_ID };
