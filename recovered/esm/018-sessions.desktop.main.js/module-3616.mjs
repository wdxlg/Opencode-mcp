// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/checksActions.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { SessionIsActiveContext } from "./module-1770.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILogService } from "./module-0095.mjs";
import { whenChatWidgetForSession } from "./module-3610.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/changes/browser/checksActions.ts
var hasActiveSessionFailedCIChecks = new RawContextKey("sessions.hasActiveSessionFailedCIChecks", false);

var activeSessionCIFixRequested = new RawContextKey("sessions.activeSessionCIFixRequested", false);

var FIX_CI_CHECKS_COMMAND_ID = "sessions.action.fixCIChecks";

var REVEAL_CI_CHECKS_COMMAND_ID = "sessions.action.revealCIChecks";

var FIX_CI_QUERY = "/fix-ci";

function isFailedConclusion(conclusion) {
  return conclusion === "failure" /* Failure */ || conclusion === "timed_out" /* TimedOut */ || conclusion === "action_required" /* ActionRequired */;
}

function getCheckGroup(check) {
  switch (check.status) {
    case "in_progress" /* InProgress */:
      return 0 /* Running */;
    case "queued" /* Queued */:
      return 1 /* Pending */;
    case "completed" /* Completed */:
      return isFailedConclusion(check.conclusion) ? 2 /* Failed */ : 3 /* Successful */;
  }
}

function getCheckStateLabel(check) {
  switch (getCheckGroup(check)) {
    case 0 /* Running */:
      return localize(4289, null);
    case 1 /* Pending */:
      return localize(4288, null);
    case 2 /* Failed */:
      return localize(4287, null);
    case 3 /* Successful */:
      return localize(4290, null);
  }
}

function getFailedChecks(checks) {
  return checks.filter((check) => getCheckGroup(check) === 2 /* Failed */);
}

function getPullRequestUrl(coords) {
  return `https://github.com/${coords.owner}/${coords.repo}/pull/${coords.prNumber}`;
}

function buildFixChecksPrompt(failedChecks, prUrl, query = FIX_CI_QUERY) {
  const sections = failedChecks.map(({ check, annotations }) => {
    const parts = [
      `Check: ${check.name}`,
      `Status: ${getCheckStateLabel(check)}`,
      `Conclusion: ${check.conclusion ?? "unknown"}`
    ];
    if (check.detailsUrl) {
      parts.push(`Details: ${check.detailsUrl}`);
    }
    parts.push("", "Annotations and output:", annotations || "No output available for this check run.");
    return parts.join("\n");
  });
  const lines = [query];
  if (prUrl) {
    lines.push(`Pull request: ${prUrl}`);
  }
  lines.push(
    "Failed CI checks:",
    "",
    sections.join("\n\n---\n\n")
  );
  return lines.join("\n");
}

async function buildFixCIPrompt(ciModel, query) {
  const checks = ciModel.checks.get();
  const failedChecks = getFailedChecks(checks);
  if (failedChecks.length === 0) {
    return void 0;
  }
  const failedCheckDetails = await Promise.all(failedChecks.map(async (check) => {
    const annotations = await ciModel.getCheckRunAnnotations(check.id);
    return { check, annotations };
  }));
  return buildFixChecksPrompt(failedCheckDetails, getPullRequestUrl(ciModel), query);
}

async function submitFixCIChecks(ciModel, chatWidget, query) {
  const prompt = await buildFixCIPrompt(ciModel, query);
  if (!prompt) {
    return;
  }
  const response = await chatWidget.acceptInput(prompt);
  if (response) {
    ciModel.markFixRequested();
  }
}

var ActiveSessionFailedCIChecksContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.activeSessionFailedCIChecksContext";
  }
  constructor(contextKeyService, gitHubService) {
    super();
    this._register(bindContextKey(hasActiveSessionFailedCIChecks, contextKeyService, (reader) => {
      const ciModel = gitHubService.activeSessionPullRequestCIObs.read(reader);
      if (!ciModel) {
        return false;
      }
      const checks = ciModel.checks.read(reader);
      return getFailedChecks(checks).length > 0;
    }));
    this._register(bindContextKey(activeSessionCIFixRequested, contextKeyService, (reader) => {
      const ciModel = gitHubService.activeSessionPullRequestCIObs.read(reader);
      if (!ciModel) {
        return false;
      }
      return ciModel.fixRequested.read(reader);
    }));
  }
};

ActiveSessionFailedCIChecksContextContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IGitHubService)
], ActiveSessionFailedCIChecksContextContribution);

var FixCIChecksAction = class _FixCIChecksAction extends Action2 {
  static {
    this.ID = FIX_CI_CHECKS_COMMAND_ID;
  }
  constructor() {
    super({
      id: _FixCIChecksAction.ID,
      title: localize2(4291, "Fix Checks"),
      icon: Codicon.lightbulbAutofix,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasActiveSessionFailedCIChecks, activeSessionCIFixRequested.negate(), SessionIsActiveContext.negate()),
      menu: [{
        id: MenuId.AgentsChangesPrimaryActionSubMenu,
        group: "5_checks",
        order: 4,
        when: ContextKeyExpr.and(IsSessionsWindowContext, hasActiveSessionFailedCIChecks, activeSessionCIFixRequested.negate())
      }]
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const gitHubService = accessor.get(IGitHubService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const logService = accessor.get(ILogService);
    const activeSession = sessionsService.activeSession.get();
    if (!activeSession) {
      return;
    }
    const ciModel = gitHubService.activeSessionPullRequestCIObs.get();
    if (!ciModel) {
      return;
    }
    const sessionResource = activeSession.resource;
    const chatWidget = await whenChatWidgetForSession(chatWidgetService, sessionResource);
    if (!chatWidget) {
      logService.error("[FixCIChecks] Cannot fix CI checks: no chat widget found for session", sessionResource.toString());
      return;
    }
    await submitFixCIChecks(ciModel, chatWidget);
  }
};

registerWorkbenchContribution2(ActiveSessionFailedCIChecksContextContribution.ID, ActiveSessionFailedCIChecksContextContribution, WorkbenchPhase.AfterRestored);

registerAction2(FixCIChecksAction);
export { isFailedConclusion, getCheckGroup, getCheckStateLabel, getFailedChecks, getPullRequestUrl, buildFixChecksPrompt, buildFixCIPrompt, submitFixCIChecks, hasActiveSessionFailedCIChecks, activeSessionCIFixRequested, FIX_CI_CHECKS_COMMAND_ID, REVEAL_CI_CHECKS_COMMAND_ID, FIX_CI_QUERY, ActiveSessionFailedCIChecksContextContribution, FixCIChecksAction };
