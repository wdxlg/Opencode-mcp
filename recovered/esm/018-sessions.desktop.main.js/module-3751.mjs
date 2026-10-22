// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestActions.ts
import { URI } from "./module-0032.mjs";
import { Action2, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { OPEN_PULL_REQUEST_ACTION_ID, computePullRequestIcon } from "./module-3594.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Menus } from "./module-3437.mjs";
import { SessionHasPullRequestContext } from "./module-1770.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IURLService } from "./module-1285.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { getGitHubPullRequestRefs, getHighestPriorityPullRequestIcon } from "./module-1767.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ChatPillActionViewItem } from "./module-2235.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { arrayEquals } from "./module-0042.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { computePullRequestIconStatus } from "./module-3656.mjs";
import { autorun } from "./module-0052.mjs";
import { $ } from "./module-0075.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { createPullRequestHoverElement } from "./module-3750.mjs";
import { GitHubReferenceList } from "./module-3749.mjs";
import { toAction } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IPullRequestIconCache } from "./module-3657.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Emitter } from "./module-0017.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/github/browser/pullRequestActions.ts
var githubPullRequestsExtensionId = "github.vscode-pull-request-github";

var openPullRequestWebviewPath = "/open-pull-request-webview";

var PullRequestActionContext = class {
  constructor(pullRequest) {
    this.pullRequest = pullRequest;
  }
};

function isPullRequestActionContext(target) {
  if (!target || typeof target !== "object") {
    return false;
  }
  const candidate = target;
  return !!candidate.pullRequest && typeof candidate.pullRequest.owner === "string" && typeof candidate.pullRequest.repo === "string" && typeof candidate.pullRequest.number === "number" && URI.isUri(candidate.pullRequest.uri);
}

var OpenPullRequestAction2 = class _OpenPullRequestAction extends Action2 {
  static {
    this.ID = OPEN_PULL_REQUEST_ACTION_ID;
  }
  constructor() {
    super({
      id: _OpenPullRequestAction.ID,
      title: localize2(4809, "Open Pull Request"),
      icon: Codicon.gitPullRequest,
      f1: false,
      // Metadata pill that summarizes the session's pull requests.
      menu: [{
        id: Menus.SessionHeaderMeta,
        group: "navigation",
        order: 1,
        when: SessionHasPullRequestContext
      }, {
        id: Menus.SessionItemContextMenu,
        group: "2_pullRequest",
        order: 0,
        when: SessionHasPullRequestContext
      }]
    });
  }
  async run(accessor, sessionOrContext) {
    const sessionsService = accessor.get(ISessionsService);
    const target = (Array.isArray(sessionOrContext) ? sessionOrContext[0] : sessionOrContext) ?? sessionsService.activeSession.get();
    const pullRequest = isPullRequestActionContext(target) ? target.pullRequest : getSessionPullRequest(target);
    if (!pullRequest) {
      return;
    }
    const extensionService = accessor.get(IExtensionService);
    const urlService = accessor.get(IURLService);
    const openerService = accessor.get(IOpenerService);
    if (await extensionService.getExtension(githubPullRequestsExtensionId)) {
      const uri4 = urlService.create({
        authority: githubPullRequestsExtensionId,
        path: openPullRequestWebviewPath,
        query: JSON.stringify({
          owner: pullRequest.owner,
          repo: pullRequest.repo,
          pullRequestNumber: pullRequest.number
        })
      });
      if (await urlService.open(uri4, { trusted: true })) {
        return;
      }
    }
    await openerService.open(pullRequest.uri, { openExternal: true });
  }
};

registerAction2(OpenPullRequestAction2);

function getSessionPullRequest(session) {
  const gitHubInfo = session?.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get();
  return getGitHubPullRequestRefs(gitHubInfo)[0];
}

var CopyPullRequestUrlAction = class _CopyPullRequestUrlAction extends Action2 {
  static {
    this.ID = "workbench.agentSessions.action.copyPullRequestUrl";
  }
  constructor() {
    super({
      id: _CopyPullRequestUrlAction.ID,
      title: localize2(4808, "Copy Pull Request URL"),
      f1: false,
      menu: [{
        id: Menus.SessionItemContextMenu,
        group: "2_pullRequest",
        order: 1,
        when: SessionHasPullRequestContext
      }]
    });
  }
  async run(accessor, sessionOrContext) {
    const clipboardService = accessor.get(IClipboardService);
    const sessionsService = accessor.get(ISessionsService);
    const target = (Array.isArray(sessionOrContext) ? sessionOrContext[0] : sessionOrContext) ?? sessionsService.activeSession.get();
    const pullRequest = isPullRequestActionContext(target) ? target.pullRequest : getSessionPullRequest(target);
    if (!pullRequest) {
      return;
    }
    await clipboardService.writeText(pullRequest.uri.toString(true));
  }
};

registerAction2(CopyPullRequestUrlAction);

var OpenPullRequestActionViewItem = class extends ChatPillActionViewItem {
  constructor(action, options3, sessionContext, _commandService, _gitHubService, _pullRequestIconCache, _openerService, _hoverService) {
    super(void 0, action, options3);
    this._commandService = _commandService;
    this._gitHubService = _gitHubService;
    this._pullRequestIconCache = _pullRequestIconCache;
    this._openerService = _openerService;
    this._hoverService = _hoverService;
    this._pullRequestList = this._register(new MutableDisposable());
    this._pullRequestRefsObs = derivedOpts({
      owner: this,
      equalsFn: (a, b) => arrayEquals(a, b, (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number && isEqual2(x.uri, y.uri) && (x.icon === y.icon || !!x.icon && !!y.icon && ThemeIcon.isEqual(x.icon, y.icon)))
    }, (reader) => {
      const session = sessionContext.session.read(reader);
      const workspace = session?.workspace.read(reader);
      const gitHubInfo = workspace?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
      return getGitHubPullRequestRefs(gitHubInfo);
    });
    this._pullRequestIdentitiesObs = derivedOpts({
      owner: this,
      equalsFn: (a, b) => arrayEquals(a, b, (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number)
    }, (reader) => this._pullRequestRefsObs.read(reader).map(({ owner, repo, number }) => ({ owner, repo, number })));
    this._pullRequestsObs = derived((reader) => this._pullRequestRefsObs.read(reader).map((ref, index2) => {
      const reference = reader.store.add(this._gitHubService.createPullRequestModelReference(ref.owner, ref.repo, ref.number));
      const pullRequest = reference.object.pullRequest.read(reader);
      const status2 = pullRequest ? computePullRequestIconStatus(reader, this._gitHubService, ref.owner, ref.repo, pullRequest) : {};
      const icon2 = pullRequest ? computePullRequestIcon(pullRequest.isDraft ? "draft" : pullRequest.state, status2) : this._pullRequestIconCache.get(ref.uri.toString()) ?? ref.icon ?? (index2 === 0 ? computePullRequestIcon("open" /* Open */) : void 0);
      if (pullRequest && icon2) {
        this._pullRequestIconCache.set(ref.uri.toString(), icon2);
      }
      return {
        ref,
        pullRequest,
        icon: icon2,
        status: status2
      };
    }));
    this._register(autorun((reader) => {
      for (const identity2 of this._pullRequestIdentitiesObs.read(reader)) {
        const reference = reader.store.add(this._gitHubService.createPullRequestModelReference(identity2.owner, identity2.repo, identity2.number));
        const model = reference.object;
        model.refresh();
        const shouldPoll = derived(this, (pollReader) => {
          const state = model.pullRequest.read(pollReader)?.state;
          return state === void 0 || state === "open" /* Open */;
        });
        reader.store.add(autorun((pollReader) => {
          if (shouldPoll.read(pollReader)) {
            pollReader.store.add(model.startPolling());
          }
        }));
        reader.store.add(autorun((statusReader) => {
          const pullRequest = model.pullRequest.read(statusReader);
          if (!pullRequest || pullRequest.isDraft || pullRequest.state !== "open" /* Open */) {
            return;
          }
          const ciReference = statusReader.store.add(this._gitHubService.createPullRequestCIModelReference(identity2.owner, identity2.repo, identity2.number, pullRequest.headSha));
          ciReference.object.refresh();
          statusReader.store.add(ciReference.object.startPolling());
          const reviewThreadsReference = statusReader.store.add(this._gitHubService.createPullRequestReviewThreadsModelReference(identity2.owner, identity2.repo, identity2.number));
          reviewThreadsReference.object.refresh();
          statusReader.store.add(reviewThreadsReference.object.startPolling());
        }));
      }
    }));
    this._register(autorun((reader) => {
      const pullRequests = this._pullRequestsObs.read(reader);
      this._pullRequestList.value?.update(this._getPullRequestListEntries(pullRequests));
      this.updateLabel();
      this.updateTooltip();
    }));
  }
  hasOpenDropdown() {
    return !!this._pullRequestList.value;
  }
  onDidClickButton() {
    if (this.hasOpenDropdown()) {
      this._hoverService.hideHover(true);
      return;
    }
    const pullRequests = this._pullRequestsObs.get();
    if (pullRequests.length > 1) {
      this._showPullRequestPicker(pullRequests);
      return;
    }
    super.onDidClickButton();
  }
  getIconElement() {
    const icon2 = getHighestPriorityPullRequestIcon(this._pullRequestsObs.get().map((pullRequest) => pullRequest.icon)) ?? Codicon.gitPullRequest;
    const iconElement = $(`span.chat-pill-icon${ThemeIcon.asCSSSelector(icon2)}`, { "aria-hidden": "true" });
    if (icon2.color) {
      iconElement.style.setProperty("color", asCssVariable(icon2.color.id), "important");
    }
    return iconElement;
  }
  getLabelText() {
    const pullRequests = this._pullRequestsObs.get();
    if (pullRequests.length === 0) {
      return "";
    }
    return pullRequests.length === 1 ? `#${pullRequests[0].ref.number}` : localize(4810, null, pullRequests.length);
  }
  getHoverContents() {
    const pullRequests = this._pullRequestsObs.get();
    if (pullRequests.length !== 1) {
      return this.getTooltip();
    }
    const { ref, pullRequest } = pullRequests[0];
    return {
      element: () => createPullRequestHoverElement({
        owner: ref.owner,
        repo: ref.repo,
        number: ref.number,
        repositoryHref: this._getRepositoryUri(ref).toString(true),
        pullRequest,
        onDidClickRepository: () => this._openerService.open(this._getRepositoryUri(ref), { openExternal: true })
      })
    };
  }
  getHoverOptions() {
    const pullRequests = this._pullRequestsObs.get();
    if (pullRequests.length !== 1) {
      return void 0;
    }
    const ref = pullRequests[0].ref;
    return {
      actions: [{
        commandId: CopyPullRequestUrlAction.ID,
        label: localize(4814, null),
        iconClass: ThemeIcon.asClassName(Codicon.copy),
        run: () => this._copyPullRequestLink(ref)
      }]
    };
  }
  getTooltip() {
    const pullRequests = this._pullRequestsObs.get();
    if (pullRequests.length > 1) {
      return localize(4812, null, pullRequests.length);
    }
    const number = pullRequests[0]?.ref.number;
    return number !== void 0 ? localize(4813, null, number) : localize(4811, null);
  }
  _copyPullRequestLink(ref) {
    this._commandService.executeCommand(CopyPullRequestUrlAction.ID, new PullRequestActionContext(ref));
  }
  _showPullRequestPicker(pullRequests) {
    const target = this.button?.element;
    if (!target) {
      return;
    }
    const list2 = this._pullRequestList.value = new GitHubReferenceList(this._getPullRequestListEntries(pullRequests), (entry) => {
      this._hoverService.hideHover();
      this.actionRunner.run(this._action, new PullRequestActionContext(entry));
    });
    list2.element.onkeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this._hoverService.hideHover();
      }
    };
    const hover = this._hoverService.showInstantHover({
      content: list2.element,
      target,
      position: { hoverPosition: 2 /* BELOW */ },
      persistence: { sticky: true, hideOnKeyDown: false },
      appearance: { showPointer: false, skipFadeInAnimation: true },
      trapFocus: true,
      onDidHide: () => {
        if (this._pullRequestList.value === list2) {
          this._pullRequestList.clear();
        }
      }
    }, true);
    if (!hover) {
      this._pullRequestList.clear();
    }
  }
  _getRepositoryUri(ref) {
    return URI.parse(`https://github.com/${ref.owner}/${ref.repo}`);
  }
  _getPullRequestListEntries(pullRequests) {
    return pullRequests.map(({ ref, pullRequest, icon: icon2, status: status2 }) => ({
      owner: ref.owner,
      repo: ref.repo,
      number: ref.number,
      title: pullRequest?.title,
      icon: icon2 ?? Codicon.gitPullRequest,
      uri: ref.uri,
      ariaLabel: getPullRequestAriaLabel(ref, pullRequest, status2),
      toolbarActions: [toAction({
        id: CopyPullRequestUrlAction.ID,
        label: localize(4816, null),
        class: ThemeIcon.asClassName(Codicon.copy),
        run: () => this._copyPullRequestLink(ref)
      })]
    }));
  }
};

OpenPullRequestActionViewItem = __decorateClass([
  __decorateParam(2, ISessionContext),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IGitHubService),
  __decorateParam(5, IPullRequestIconCache),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IHoverService)
], OpenPullRequestActionViewItem);

function getPullRequestAriaLabel(ref, pullRequest, status2) {
  let kind;
  if (pullRequest?.isDraft) {
    kind = localize(4817, null);
  } else {
    switch (pullRequest?.state) {
      case "open" /* Open */:
        kind = localize(4824, null);
        break;
      case "merged" /* Merged */:
        kind = localize(4823, null);
        break;
      case "closed" /* Closed */:
        kind = localize(4815, null);
        break;
      default:
        kind = localize(4825, null);
    }
  }
  const baseLabel = pullRequest?.title ? localize(4822, null, kind, ref.number, pullRequest.title) : localize(4820, null, kind, ref.number);
  let attention;
  if (status2.hasFailingChecks && status2.hasUnresolvedComments) {
    attention = localize(4819, null);
  } else if (status2.hasFailingChecks) {
    attention = localize(4818, null);
  } else if (status2.hasUnresolvedComments) {
    attention = localize(4826, null);
  }
  return attention ? localize(4821, null, baseLabel, attention) : baseLabel;
}

var OpenPullRequestActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openPullRequestActionViewItem";
  }
  constructor(actionViewItemService) {
    super();
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(Menus.SessionHeaderMeta, OpenPullRequestAction2.ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(OpenPullRequestActionViewItem, action, options3);
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

OpenPullRequestActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService)
], OpenPullRequestActionViewItemContribution);

registerWorkbenchContribution2(OpenPullRequestActionViewItemContribution.ID, OpenPullRequestActionViewItemContribution, WorkbenchPhase.AfterRestored);
export { isPullRequestActionContext, getSessionPullRequest, getPullRequestAriaLabel, githubPullRequestsExtensionId, openPullRequestWebviewPath, PullRequestActionContext, OpenPullRequestAction2, CopyPullRequestUrlAction, OpenPullRequestActionViewItem, OpenPullRequestActionViewItemContribution };
