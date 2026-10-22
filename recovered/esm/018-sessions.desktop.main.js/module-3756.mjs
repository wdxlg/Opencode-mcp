// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/issueActions.ts
import { URI } from "./module-0032.mjs";
import { Action2, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { OPEN_ISSUE_ACTION_ID, computeAggregateIssueIcon, computeIssueIcon } from "./module-3594.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Menus } from "./module-3437.mjs";
import { SessionHasIssuesContext } from "./module-1770.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IURLService } from "./module-1285.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ChatPillActionViewItem } from "./module-2235.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { arrayEquals } from "./module-0042.mjs";
import { autorun } from "./module-0052.mjs";
import { $ } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { createIssueHoverElement } from "./module-3755.mjs";
import { GitHubReferenceList } from "./module-3749.mjs";
import { toAction } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IHoverService } from "./module-0520.mjs";
import { Emitter } from "./module-0017.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/github/browser/issueActions.ts
var githubPullRequestsExtensionId2 = "github.vscode-pull-request-github";

var openIssueWebviewPath = "/open-issue-webview";

var IssueActionContext = class {
  constructor(issue) {
    this.issue = issue;
  }
};

function isIssueActionContext(target) {
  if (!target || typeof target !== "object") {
    return false;
  }
  const candidate = target;
  return !!candidate.issue && typeof candidate.issue.owner === "string" && typeof candidate.issue.repo === "string" && typeof candidate.issue.number === "number" && URI.isUri(candidate.issue.uri);
}

var OpenIssueAction = class _OpenIssueAction extends Action2 {
  static {
    this.ID = OPEN_ISSUE_ACTION_ID;
  }
  constructor() {
    super({
      id: _OpenIssueAction.ID,
      title: localize2(4800, "Open Issue"),
      icon: Codicon.issues,
      f1: false,
      // Metadata pill shown after pull requests.
      menu: [{
        id: Menus.SessionHeaderMeta,
        group: "navigation",
        order: 2,
        when: SessionHasIssuesContext
      }]
    });
  }
  async run(accessor, sessionOrContext) {
    const openerService = accessor.get(IOpenerService);
    const sessionsService = accessor.get(ISessionsService);
    const extensionService = accessor.get(IExtensionService);
    const urlService = accessor.get(IURLService);
    const target = (Array.isArray(sessionOrContext) ? sessionOrContext[0] : sessionOrContext) ?? sessionsService.activeSession.get();
    const issue = isIssueActionContext(target) ? target.issue : getSessionIssues(target)[0];
    if (!issue) {
      return;
    }
    if (await extensionService.getExtension(githubPullRequestsExtensionId2)) {
      const uri4 = urlService.create({
        authority: githubPullRequestsExtensionId2,
        path: openIssueWebviewPath,
        query: JSON.stringify({
          owner: issue.owner,
          repo: issue.repo,
          issueNumber: issue.number
        })
      });
      if (await urlService.open(uri4, { trusted: true })) {
        return;
      }
    }
    await openerService.open(issue.uri, { openExternal: true });
  }
};

registerAction2(OpenIssueAction);

function getSessionIssues(session) {
  return session?.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get()?.issues ?? [];
}

var CopyIssueUrlAction = class _CopyIssueUrlAction extends Action2 {
  static {
    this.ID = "workbench.agentSessions.action.copyIssueUrl";
  }
  constructor() {
    super({
      id: _CopyIssueUrlAction.ID,
      title: localize2(4797, "Copy Issue URL"),
      f1: false
    });
  }
  async run(accessor, sessionOrContext) {
    const clipboardService = accessor.get(IClipboardService);
    const sessionsService = accessor.get(ISessionsService);
    const target = (Array.isArray(sessionOrContext) ? sessionOrContext[0] : sessionOrContext) ?? sessionsService.activeSession.get();
    const issue = isIssueActionContext(target) ? target.issue : getSessionIssues(target)[0];
    if (!issue) {
      return;
    }
    await clipboardService.writeText(issue.uri.toString(true));
  }
};

registerAction2(CopyIssueUrlAction);

var OpenIssueActionViewItem = class extends ChatPillActionViewItem {
  constructor(action, options3, sessionContext, _commandService, _gitHubService, _openerService, _hoverService) {
    super(void 0, action, options3);
    this._commandService = _commandService;
    this._gitHubService = _gitHubService;
    this._openerService = _openerService;
    this._hoverService = _hoverService;
    this._issueList = this._register(new MutableDisposable());
    this._issuePickerVisible = false;
    this._issueRefsObs = derivedOpts({
      owner: this,
      equalsFn: (a, b) => arrayEquals(a, b, (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number)
    }, (reader) => {
      const session = sessionContext.session.read(reader);
      const workspace = session?.workspace.read(reader);
      return workspace?.folders[0]?.gitRepository?.gitHubInfo.read(reader)?.issues ?? [];
    });
    this._issuesObs = derived((reader) => this._issueRefsObs.read(reader).map((ref) => {
      const reference = reader.store.add(this._gitHubService.createIssueModelReference(ref.owner, ref.repo, ref.number));
      return { ref, issue: reference.object.issue.read(reader) };
    }));
    this._register(autorun((reader) => {
      for (const ref of this._issueRefsObs.read(reader)) {
        const reference = reader.store.add(this._gitHubService.createIssueModelReference(ref.owner, ref.repo, ref.number));
        const model = reference.object;
        model.refresh();
        const shouldPoll = derived(this, (pollReader) => model.issue.read(pollReader)?.state !== "closed" /* Closed */);
        reader.store.add(autorun((pollReader) => {
          if (shouldPoll.read(pollReader)) {
            pollReader.store.add(model.startPolling());
          }
        }));
      }
    }));
    this._register(autorun((reader) => {
      const issues = this._issuesObs.read(reader);
      this._issueList.value?.update(this._getIssueListEntries(issues));
      this.updateLabel();
      this.updateTooltip();
    }));
  }
  hasOpenDropdown() {
    return this._issuePickerVisible;
  }
  onDidClickButton() {
    if (this.hasOpenDropdown()) {
      this._hoverService.hideHover(true);
      return;
    }
    const issues = this._issuesObs.get();
    if (issues.length > 1) {
      this._showIssuePicker(issues);
      return;
    }
    super.onDidClickButton();
  }
  getIconElement() {
    const icon2 = this._computeIcon();
    const iconElement = $(`span.chat-pill-icon${ThemeIcon.asCSSSelector(icon2)}`, { "aria-hidden": "true" });
    if (icon2.color) {
      iconElement.style.setProperty("color", asCssVariable(icon2.color.id), "important");
    }
    return iconElement;
  }
  getLabelText() {
    const issues = this._issuesObs.get();
    if (issues.length === 0) {
      return "";
    }
    return issues.length === 1 ? `#${issues[0].ref.number}` : localize(4801, null, issues.length);
  }
  getHoverContents() {
    const issues = this._issuesObs.get();
    if (issues.length !== 1) {
      return this.getTooltip();
    }
    const { ref, issue } = issues[0];
    return {
      element: () => createIssueHoverElement({
        owner: ref.owner,
        repo: ref.repo,
        number: ref.number,
        repositoryHref: this._getRepositoryUri(ref).toString(true),
        issue,
        onDidClickRepository: () => this._openerService.open(this._getRepositoryUri(ref), { openExternal: true })
      })
    };
  }
  getHoverOptions() {
    const issues = this._issuesObs.get();
    if (issues.length !== 1) {
      return void 0;
    }
    const ref = issues[0].ref;
    return {
      actions: [{
        commandId: CopyIssueUrlAction.ID,
        label: localize(4798, null),
        iconClass: ThemeIcon.asClassName(Codicon.copy),
        run: () => this._copyIssueLink(ref)
      }]
    };
  }
  getTooltip() {
    const issues = this._issuesObs.get();
    if (issues.length > 1) {
      return localize(4803, null, issues.length);
    }
    const number = issues[0]?.ref.number;
    return number !== void 0 ? localize(4804, null, number) : localize(4802, null);
  }
  _computeIcon() {
    const issues = this._issuesObs.get();
    if (issues.length === 1) {
      const issue = issues[0].issue;
      return issue ? computeIssueIcon(issue.state, issue.stateReason) : computeIssueIcon("open" /* Open */, void 0);
    }
    return computeAggregateIssueIcon(issues.map(({ issue }) => issue));
  }
  _copyIssueLink(ref) {
    this._commandService.executeCommand(CopyIssueUrlAction.ID, new IssueActionContext(ref));
  }
  /**
   * Shows the referenced issues below the pill. A sticky hover is used rather than a
   * context menu because menu items render their icon on the label element, which would
   * lose the per-issue state color.
   */
  _showIssuePicker(issues) {
    const target = this.button?.element;
    if (!target) {
      return;
    }
    const list2 = this._issueList.value = new GitHubReferenceList(this._getIssueListEntries(issues), (entry) => {
      this._hoverService.hideHover();
      this.actionRunner.run(this._action, new IssueActionContext(entry));
    });
    this._issuePickerVisible = true;
    const hover = this._hoverService.showInstantHover({
      content: list2.element,
      target,
      position: { hoverPosition: 2 /* BELOW */ },
      persistence: { sticky: true, hideOnKeyDown: true },
      appearance: { showPointer: false, skipFadeInAnimation: true },
      trapFocus: true,
      onDidHide: () => {
        this._issuePickerVisible = false;
        if (this._issueList.value === list2) {
          this._issueList.clear();
        }
      }
    }, true);
    if (!hover) {
      this._issuePickerVisible = false;
      this._issueList.clear();
    }
  }
  _getIssueListEntries(issues) {
    return issues.map(({ ref, issue }) => ({
      owner: ref.owner,
      repo: ref.repo,
      number: ref.number,
      title: issue?.title,
      icon: issue ? computeIssueIcon(issue.state, issue.stateReason) : computeIssueIcon("open" /* Open */, void 0),
      uri: ref.uri,
      toolbarActions: [toAction({
        id: CopyIssueUrlAction.ID,
        label: localize(4799, null),
        class: ThemeIcon.asClassName(Codicon.copy),
        run: () => this._copyIssueLink(ref)
      })]
    }));
  }
  _getRepositoryUri(ref) {
    return URI.parse(`https://github.com/${ref.owner}/${ref.repo}`);
  }
};

OpenIssueActionViewItem = __decorateClass([
  __decorateParam(2, ISessionContext),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IGitHubService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IHoverService)
], OpenIssueActionViewItem);

var OpenIssueActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openIssueActionViewItem";
  }
  constructor(actionViewItemService) {
    super();
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(Menus.SessionHeaderMeta, OpenIssueAction.ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(OpenIssueActionViewItem, action, options3);
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

OpenIssueActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService)
], OpenIssueActionViewItemContribution);

registerWorkbenchContribution2(OpenIssueActionViewItemContribution.ID, OpenIssueActionViewItemContribution, WorkbenchPhase.AfterRestored);
export { isIssueActionContext, getSessionIssues, githubPullRequestsExtensionId2, openIssueWebviewPath, IssueActionContext, OpenIssueAction, CopyIssueUrlAction, OpenIssueActionViewItem, OpenIssueActionViewItemContribution };
