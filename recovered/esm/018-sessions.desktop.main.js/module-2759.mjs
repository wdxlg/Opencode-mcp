// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSlashCommands.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { ChatSessionArchiveActionWordingSettingId, getChatSessionArchiveActionWording } from "./module-2468.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1475.mjs";
import { IChatSessionsService, SessionType } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { AICustomizationManagementCommands2 } from "./module-1471.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { showConfigureHooksQuickPick } from "./module-2524.mjs";
import { ChatSubmitAction, OpenModePickerAction, OpenModelPickerAction } from "./module-2056.mjs";
import { ConfigureToolsAction } from "./module-2178.mjs";
import { ManagePluginsAction } from "./module-2545.mjs";
import { CONFIGURE_SKILLS_ACTION_ID } from "./module-2522.mjs";
import { CONFIGURE_INSTRUCTIONS_ACTION_ID } from "./module-2139.mjs";
import { CONFIGURE_PROMPTS_ACTION_ID } from "./module-2521.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { MarkdownString, isMarkdownString } from "./module-0462.mjs";
import { agentSlashCommandToMarkdown, agentToMarkdown } from "./module-2250.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSlashCommandService } from "./module-0989.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IChatService } from "./module-0973.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IAgentHostService } from "./module-1108.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-1760.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2101.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/chatSlashCommands.ts
var ChatSlashCommandsContribution = class extends Disposable {
  constructor(slashCommandService, commandService, chatAgentService, instantiationService, agentSessionsService, chatService, configurationService, chatWidgetService, agentHostService, agentHostProvisionalService, agentHostWorkingDirectoryResolver, workspaceContextService, chatPetService, environmentService) {
    super();
    this.environmentService = environmentService;
    this._store.add(slashCommandService.registerSlashCommand({
      command: "vscode-pet",
      detail: localize(11213, null),
      sortText: "z3_vscodePet",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */]
    }, async () => {
      chatPetService.toggle();
    }));
    const clearCommandRegistration = this._register(new MutableDisposable());
    const registerClearCommand = () => {
      const wording = getChatSessionArchiveActionWording(configurationService);
      clearCommandRegistration.clear();
      clearCommandRegistration.value = slashCommandService.registerSlashCommand({
        command: "clear",
        detail: wording === "done" /* MarkAsDone */ ? localize(11199, null) : localize(11198, null),
        sortText: "z2_clear",
        executeImmediately: true,
        locations: ["panel" /* Chat */]
      }, async (_prompt, _progress, _history, _location, sessionResource) => {
        agentSessionsService.getSession(sessionResource)?.setArchived(true);
        commandService.executeCommand(ACTION_ID_NEW_CHAT);
      });
    };
    registerClearCommand();
    this._register(configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(ChatSessionArchiveActionWordingSettingId)) {
        registerClearCommand();
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "hooks",
      detail: localize(11205, null),
      sortText: "z3_hooks",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local, SessionType.AgentHostCopilot]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (getChatSessionType(sessionResource) === SessionType.AgentHostCopilot) {
        await commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Hooks);
      } else {
        await instantiationService.invokeFunction(showConfigureHooksQuickPick);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "models",
      detail: localize(11207, null),
      sortText: "z3_models",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */]
    }, async (_promp) => {
      await commandService.executeCommand(OpenModelPickerAction.ID);
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "tools",
      detail: localize(11212, null),
      sortText: "z3_tools",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local]
    }, async () => {
      await commandService.executeCommand(ConfigureToolsAction.ID);
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "plugins",
      detail: localize(11208, null),
      sortText: "z3_plugins",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local]
    }, async () => {
      await commandService.executeCommand(ManagePluginsAction.ID);
    }));
    if (!this.environmentService.isSessionsWindow) {
      this._store.add(slashCommandService.registerSlashCommand({
        command: "debug",
        detail: localize(11200, null),
        sortText: "z3_debug",
        executeImmediately: true,
        silent: true,
        locations: ["panel" /* Chat */]
      }, async () => {
        await commandService.executeCommand("github.copilot.debug.showChatLogView");
      }));
    }
    this._store.add(slashCommandService.registerSlashCommand({
      command: "agents",
      detail: localize(11194, null),
      sortText: "z3_agents",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local, SessionType.AgentHostCopilot]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (getChatSessionType(sessionResource) === SessionType.AgentHostCopilot) {
        await commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Agents);
      } else {
        await commandService.executeCommand(OpenModePickerAction.ID);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "skills",
      detail: localize(11211, null),
      sortText: "z3_skills",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local, SessionType.AgentHostCopilot]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (getChatSessionType(sessionResource) === SessionType.AgentHostCopilot) {
        await commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Skills);
      } else {
        await commandService.executeCommand(CONFIGURE_SKILLS_ACTION_ID);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "instructions",
      detail: localize(11206, null),
      sortText: "z3_instructions",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local, SessionType.AgentHostCopilot]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (getChatSessionType(sessionResource) === SessionType.AgentHostCopilot) {
        await commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Instructions);
      } else {
        await commandService.executeCommand(CONFIGURE_INSTRUCTIONS_ACTION_ID);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "prompts",
      detail: localize(11209, null),
      sortText: "z3_prompts",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local, SessionType.AgentHostCopilot]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (getChatSessionType(sessionResource) === SessionType.AgentHostCopilot) {
        await commandService.executeCommand(AICustomizationManagementCommands2.OpenEditor, AICustomizationManagementSection.Prompts);
      } else {
        await commandService.executeCommand(CONFIGURE_PROMPTS_ACTION_ID);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "fork",
      detail: localize(11204, null),
      sortText: "z2_fork",
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      when: ContextKeyExpr.or(
        ChatContextKeys.lockedToCodingAgent.negate(),
        ChatContextKeys.chatSessionSupportsFork
      )
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      await commandService.executeCommand("workbench.action.chat.forkConversation", sessionResource);
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "rename",
      detail: localize(11210, null),
      sortText: "z2_rename",
      executeImmediately: false,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [SessionType.Local]
    }, async (prompt, _progress, _history, _location, sessionResource) => {
      const title = prompt.trim();
      if (title) {
        chatService.setChatSessionTitle(sessionResource, title);
      }
    }));
    this._store.add(slashCommandService.registerSlashCommand({
      command: "help",
      detail: "",
      sortText: "z1_help",
      executeImmediately: true,
      locations: ["panel" /* Chat */],
      modes: ["ask" /* Ask */],
      sessionTypes: [SessionType.Local]
    }, async (prompt, progress, _history, _location, sessionResource) => {
      const defaultAgent = chatAgentService.getDefaultAgent("panel" /* Chat */);
      const agents = chatAgentService.getAgents();
      if (defaultAgent?.metadata.helpTextPrefix) {
        if (isMarkdownString(defaultAgent.metadata.helpTextPrefix)) {
          progress.report({ content: defaultAgent.metadata.helpTextPrefix, kind: "markdownContent" });
        } else {
          progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPrefix), kind: "markdownContent" });
        }
        progress.report({ content: new MarkdownString("\n\n"), kind: "markdownContent" });
      }
      const agentText = (await Promise.all(agents.filter((a) => !a.isDefault && !a.isCore).filter((a) => a.locations.includes("panel" /* Chat */)).map(async (a) => {
        const description = a.description ? `- ${a.description}` : "";
        const agentMarkdown = instantiationService.invokeFunction((accessor) => agentToMarkdown(a, sessionResource, true, accessor));
        const agentLine = `- ${agentMarkdown} ${description}`;
        const commandText = a.slashCommands.map((c) => {
          const description2 = c.description ? `- ${c.description}` : "";
          return `	* ${agentSlashCommandToMarkdown(a, c, sessionResource)} ${description2}`;
        }).join("\n");
        return (agentLine + "\n" + commandText).trim();
      }))).join("\n");
      progress.report({ content: new MarkdownString(agentText, { isTrusted: { enabledCommands: [ChatSubmitAction.ID] } }), kind: "markdownContent" });
      if (defaultAgent?.metadata.helpTextPostfix) {
        progress.report({ content: new MarkdownString("\n\n"), kind: "markdownContent" });
        if (isMarkdownString(defaultAgent.metadata.helpTextPostfix)) {
          progress.report({ content: defaultAgent.metadata.helpTextPostfix, kind: "markdownContent" });
        } else {
          progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPostfix), kind: "markdownContent" });
        }
      }
      await timeout(200);
    }));
  }
  static {
    this.ID = "workbench.contrib.chatSlashCommands";
  }
};

ChatSlashCommandsContribution = __decorateClass([
  __decorateParam(0, IChatSlashCommandService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IChatAgentService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IAgentSessionsService),
  __decorateParam(5, IChatService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IChatWidgetService),
  __decorateParam(8, IAgentHostService),
  __decorateParam(9, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(10, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(11, IWorkspaceContextService),
  __decorateParam(12, IChatPetService),
  __decorateParam(13, IWorkbenchEnvironmentService)
], ChatSlashCommandsContribution);

var ChatSessionOptionSlashCommandsContribution = class extends Disposable {
  constructor(chatSessionsService, slashCommandService, logService) {
    super();
    this.chatSessionsService = chatSessionsService;
    this.slashCommandService = slashCommandService;
    this.logService = logService;
    this._registrationsByType = this._register(new DisposableMap());
    this._register(this.chatSessionsService.onDidChangeOptionGroups((chatSessionType) => {
      this.refreshForSessionType(chatSessionType);
    }));
  }
  static {
    this.ID = "workbench.contrib.chatSessionOptionSlashCommands";
  }
  refreshForSessionType(chatSessionType) {
    this._registrationsByType.deleteAndDispose(chatSessionType);
    const groups = this.chatSessionsService.getOptionGroupsForSessionType(chatSessionType);
    if (!groups || groups.length === 0) {
      return;
    }
    const store = new DisposableStore();
    const seen = /* @__PURE__ */ new Set();
    for (const group2 of groups) {
      for (const item of group2.items) {
        const name = item.slashCommand?.trim();
        if (!name) {
          continue;
        }
        if (seen.has(name)) {
          this.logService.warn(`[ChatSessionOptionSlashCommands] Skipping duplicate slash command '${name}' contributed by session type '${chatSessionType}'.`);
          continue;
        }
        if (this.slashCommandService.hasCommand(name, chatSessionType)) {
          this.logService.warn(`[ChatSessionOptionSlashCommands] Slash command '${name}' contributed by session type '${chatSessionType}' is already registered; skipping.`);
          continue;
        }
        seen.add(name);
        store.add(this.registerOne(chatSessionType, group2, item, name));
      }
    }
    if (store.isDisposed || seen.size === 0) {
      store.dispose();
      return;
    }
    this._registrationsByType.set(chatSessionType, store);
  }
  registerOne(chatSessionType, group2, item, name) {
    return this.slashCommandService.registerSlashCommand({
      command: name,
      detail: item.description ?? localize(11197, null, item.name),
      sortText: `z1_${name}`,
      executeImmediately: true,
      silent: true,
      locations: ["panel" /* Chat */],
      sessionTypes: [chatSessionType]
    }, async (_prompt, _progress, _history, _location, sessionResource) => {
      if (!sessionResource) {
        return;
      }
      this.chatSessionsService.setSessionOption(sessionResource, group2.id, item);
    });
  }
};

ChatSessionOptionSlashCommandsContribution = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IChatSlashCommandService),
  __decorateParam(2, ILogService)
], ChatSessionOptionSlashCommandsContribution);
export { ChatSlashCommandsContribution, ChatSessionOptionSlashCommandsContribution };
