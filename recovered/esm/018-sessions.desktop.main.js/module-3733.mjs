// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSkillButtons.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { BaseAgentHostSessionsProvider } from "./module-3672.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ActiveSessionContextKeys } from "./module-3620.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ChatSendResult, IChatService } from "./module-0973.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSkillButtons.ts
var IsAgentHostSession = new RawContextKey("sessions.isAgentHostSession", false);

var IsAgentHostSessionContextContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.agentHost.isAgentHostSession";
  }
  constructor(contextKeyService, sessionsService, sessionsProvidersService) {
    super();
    this._register(bindContextKey(IsAgentHostSession, contextKeyService, (reader) => {
      const activeSession = sessionsService.activeSession.read(reader);
      if (!activeSession) {
        return false;
      }
      const provider = sessionsProvidersService.getProvider(activeSession.providerId);
      return provider instanceof BaseAgentHostSessionsProvider;
    }));
  }
};

IsAgentHostSessionContextContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsProvidersService)
], IsAgentHostSessionContextContribution);

registerWorkbenchContribution2(IsAgentHostSessionContextContribution.ID, IsAgentHostSessionContextContribution, WorkbenchPhase.AfterRestored);

var AGENT_HOST_SKILL_BUTTON_ID_PREFIX = "workbench.action.agentSessions.runSkill.";

var AGENT_HOST_SKILL_BUTTONS = [
  {
    id: `${AGENT_HOST_SKILL_BUTTON_ID_PREFIX}merge`,
    title: localize2(4973, "Merge Changes"),
    skill: "merge",
    icon: Codicon.gitMerge,
    group: "merge",
    order: 1,
    extraWhen: ContextKeyExpr.and(
      ContextKeyExpr.false(),
      ActiveSessionContextKeys.IsolationMode.isEqualTo("worktree" /* Worktree */),
      ActiveSessionContextKeys.IsMergeBaseBranchProtected.negate(),
      ActiveSessionContextKeys.HasPullRequest.negate(),
      ContextKeyExpr.or(ActiveSessionContextKeys.HasUncommittedChanges, ActiveSessionContextKeys.HasOutgoingChanges)
    )
  },
  {
    id: `${AGENT_HOST_SKILL_BUTTON_ID_PREFIX}createPR`,
    title: localize2(4972, "Create PR"),
    skill: "create-pr",
    icon: Codicon.gitPullRequestCreate,
    group: "pull_request",
    order: 1,
    extraWhen: ContextKeyExpr.and(
      ContextKeyExpr.false(),
      ActiveSessionContextKeys.IsolationMode.isEqualTo("worktree" /* Worktree */),
      ActiveSessionContextKeys.HasGitHubRemote,
      ActiveSessionContextKeys.HasPullRequest.negate(),
      ContextKeyExpr.or(ActiveSessionContextKeys.HasUncommittedChanges, ActiveSessionContextKeys.HasOutgoingChanges)
    )
  },
  {
    id: `${AGENT_HOST_SKILL_BUTTON_ID_PREFIX}createDraftPR`,
    title: localize2(4971, "Create Draft PR"),
    skill: "create-draft-pr",
    icon: Codicon.gitPullRequestDraft,
    group: "pull_request",
    order: 2,
    extraWhen: ContextKeyExpr.and(
      ContextKeyExpr.false(),
      ActiveSessionContextKeys.IsolationMode.isEqualTo("worktree" /* Worktree */),
      ActiveSessionContextKeys.HasGitHubRemote,
      ActiveSessionContextKeys.HasPullRequest.negate(),
      ContextKeyExpr.or(ActiveSessionContextKeys.HasUncommittedChanges, ActiveSessionContextKeys.HasOutgoingChanges)
    )
  },
  {
    id: `${AGENT_HOST_SKILL_BUTTON_ID_PREFIX}updatePR`,
    title: localize2(4974, "Sync Pull Request"),
    skill: "update-pr",
    icon: Codicon.repoPush,
    group: "pull_request",
    order: 1,
    extraWhen: ContextKeyExpr.and(
      ContextKeyExpr.false(),
      ActiveSessionContextKeys.IsolationMode.isEqualTo("worktree" /* Worktree */),
      ActiveSessionContextKeys.HasGitHubRemote,
      ActiveSessionContextKeys.HasPullRequest,
      ActiveSessionContextKeys.HasOpenPullRequest,
      ContextKeyExpr.or(
        ActiveSessionContextKeys.HasIncomingChanges,
        ActiveSessionContextKeys.HasOutgoingChanges,
        ActiveSessionContextKeys.HasUncommittedChanges
      )
    )
  }
];

var AGENT_HOST_SKILL_BUTTON_UPDATE_PR_ID = `${AGENT_HOST_SKILL_BUTTON_ID_PREFIX}updatePR`;

function isAgentHostSkillButtonId(actionId) {
  return actionId.startsWith(AGENT_HOST_SKILL_BUTTON_ID_PREFIX);
}

function registerAgentHostSkillButton(spec) {
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: spec.id,
        title: spec.title,
        icon: spec.icon,
        f1: false,
        menu: {
          id: MenuId.AgentsChangesPrimaryActionSubMenu,
          group: spec.group,
          order: spec.order,
          when: ContextKeyExpr.and(
            IsSessionsWindowContext,
            IsAgentHostSession,
            ActiveSessionContextKeys.HasGitRepository,
            spec.extraWhen
          )
        }
      });
    }
    async run(accessor) {
      const sessionsService = accessor.get(ISessionsService);
      const chatService = accessor.get(IChatService);
      const activeSession = sessionsService.activeSession.get();
      if (!activeSession) {
        return;
      }
      const agentId = activeSession.resource.scheme;
      const prompt = `/${spec.skill}`;
      const ref = await chatService.acquireOrLoadSession(activeSession.resource, "panel" /* Chat */, CancellationToken.None, "AgentHostSkillButton");
      try {
        let result = await chatService.sendRequest(activeSession.resource, prompt, { agentIdSilent: agentId });
        if (ChatSendResult.isQueued(result)) {
          result = await result.deferred;
        }
        if (ChatSendResult.isSent(result)) {
          await result.data.responseCompletePromise;
        }
      } finally {
        ref?.dispose();
      }
    }
  });
}

for (const spec of AGENT_HOST_SKILL_BUTTONS) {
  registerAgentHostSkillButton(spec);
}
export { isAgentHostSkillButtonId, registerAgentHostSkillButton, IsAgentHostSession, IsAgentHostSessionContextContribution, AGENT_HOST_SKILL_BUTTON_ID_PREFIX, AGENT_HOST_SKILL_BUTTONS, AGENT_HOST_SKILL_BUTTON_UPDATE_PR_ID };
