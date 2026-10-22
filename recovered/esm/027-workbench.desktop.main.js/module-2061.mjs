// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatContinueInAction.ts
import { URI } from "./module-0032.mjs";
import { Action2, MenuId, MenuItemAction } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IsSessionsWindowContext, ResourceContextKey } from "./module-0949.mjs";
import { Schemas } from "./module-0033.mjs";
import { PROMPT_LANGUAGE_ID } from "./module-0985.mjs";
import { chatEditingWidgetFileStateContextKey } from "./module-1081.mjs";
import { ctxHasEditorModification } from "./module-2057.mjs";
import { ActionWidgetDropdownActionViewItem } from "./module-2059.mjs";
import { AgentSessionProviders, CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID, getAgentSessionProvider, getAgentSessionProviderIcon, getAgentSessionProviderName } from "./module-0982.mjs";
import { IChatSessionsService, SessionType, isAgentHostTarget } from "./module-0960.mjs";
import { ICommandService } from "./module-0087.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1476.mjs";
import { h } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ISCMService } from "./module-1080.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { toPasteVariableEntry, toPromptFileVariableEntry } from "./module-0979.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { IChatWidgetService, isIChatViewViewContext } from "./module-0981.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { ChatSendResult, IChatService } from "./module-0972.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IFileService } from "./module-0269.mjs";
import { isITextModel } from "./module-0117.mjs";
import { basename2 } from "./module-0034.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { importedTurnsFromChatModel } from "./module-2060.mjs";
import { openChatSession } from "./module-1478.mjs";
import { ChatRequestParser } from "./module-0991.mjs";
import { getDynamicVariablesForWidget, getSelectedToolAndToolSetsForWidget } from "./module-0992.mjs";
import { Disposable, markAsSingleton } from "./module-0012.mjs";
import { IActionViewItemService } from "./module-0518.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatContinueInAction.ts
function extractNwoFromRemoteUrl(remoteUrl) {
  const match2 = remoteUrl.match(/(?:github\.com)[/:](?<owner>[^/]+)\/(?<repo>[^/.]+)/);
  if (match2?.groups) {
    return `${match2.groups.owner}/${match2.groups.repo}`;
  }
  return void 0;
}

async function resolveGitRemoteNwo(repoPath, fileService) {
  try {
    const gitPath = `${repoPath}/.git`;
    const gitUri = URI.file(gitPath);
    let configUri;
    try {
      const stat = await fileService.stat(gitUri);
      if (stat.isDirectory) {
        configUri = URI.file(`${gitPath}/config`);
      } else {
        const gitFile = await fileService.readFile(gitUri);
        const gitDir = gitFile.value.toString().trim().replace(/^gitdir:\s*/, "");
        const resolvedGitDir = gitDir.startsWith("/") ? gitDir : `${repoPath}/${gitDir}`;
        const commonDir = resolvedGitDir.replace(/\/worktrees\/[^/]+$/, "");
        configUri = URI.file(`${commonDir}/config`);
      }
    } catch {
      return void 0;
    }
    const content2 = await fileService.readFile(configUri);
    const configText = content2.value.toString();
    const remoteMatch = configText.match(/\[remote\s+"origin"\][^[]*url\s*=\s*(.+)/m);
    if (remoteMatch?.[1]) {
      return extractNwoFromRemoteUrl(remoteMatch[1].trim());
    }
  } catch {
  }
  return void 0;
}

var ContinueChatInSessionAction = class _ContinueChatInSessionAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.continueChatInSession";
  }
  constructor() {
    super({
      id: _ContinueChatInSessionAction.ID,
      title: localize2(8619, "Continue Chat in..."),
      tooltip: localize(8620, null),
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ChatContextKeys.requestInProgress.negate(),
        ChatContextKeys.remoteJobCreating.negate(),
        ChatContextKeys.hasCanDelegateProviders
      ),
      menu: [
        {
          id: MenuId.ChatExecute,
          group: "navigation",
          order: 3.4,
          when: ContextKeyExpr.and(
            ChatContextKeys.lockedToCodingAgent.negate(),
            ChatContextKeys.hasCanDelegateProviders
          )
        },
        {
          id: MenuId.EditorContent,
          group: "continueIn",
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals(ResourceContextKey.Scheme.key, Schemas.untitled),
            ContextKeyExpr.equals(ResourceContextKey.LangId.key, PROMPT_LANGUAGE_ID),
            ContextKeyExpr.notEquals(chatEditingWidgetFileStateContextKey.key, 0 /* Modified */),
            ctxHasEditorModification.negate(),
            ChatContextKeys.hasCanDelegateProviders
          )
        }
      ]
    });
  }
  async run() {
  }
};

var ChatContinueInSessionActionItem = class extends ActionWidgetDropdownActionViewItem {
  constructor(action, location2, actionWidgetService, contextKeyService, keybindingService, chatSessionsService, instantiationService, openerService, telemetryService, scmService, workspaceContextService) {
    super(action, {
      actionProvider: ChatContinueInSessionActionItem.actionProvider(chatSessionsService, instantiationService, scmService, workspaceContextService, location2),
      actionBarActions: ChatContinueInSessionActionItem.getActionBarActions(openerService),
      reporter: { id: "ChatContinueInSession", name: "ChatContinueInSession", includeOptions: true }
    }, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.location = location2;
    this.contextKeyService = contextKeyService;
  }
  static getActionBarActions(openerService) {
    const learnMoreUrl = "https://aka.ms/vscode-agent-handoff";
    return [{
      id: "workbench.action.chat.continueChatInSession.learnMore",
      label: localize(8618, null),
      tooltip: localize(8618, null),
      class: void 0,
      enabled: true,
      run: async () => {
        await openerService.open(URI.parse(learnMoreUrl));
      }
    }];
  }
  static actionProvider(chatSessionsService, instantiationService, scmService, workspaceContextService, location2) {
    return {
      getActions: () => {
        const actions = [];
        const contributions = chatSessionsService.getAllChatSessionContributions();
        const folders = workspaceContextService.getWorkspace().folders;
        let hasGitRepo = false;
        if (folders.length > 0) {
          for (const repo of scmService.repositories) {
            if (repo.provider.rootUri && workspaceContextService.getWorkspaceFolder(repo.provider.rootUri)) {
              hasGitRepo = true;
              break;
            }
          }
        }
        const backgroundContrib = contributions.find((contrib) => contrib.type === AgentSessionProviders.Background);
        if (backgroundContrib && backgroundContrib.canDelegate) {
          actions.push(this.toAction(AgentSessionProviders.Background, backgroundContrib, instantiationService, location2));
        }
        const cloudContrib = contributions.find((contrib) => contrib.type === AgentSessionProviders.Cloud);
        if (cloudContrib && cloudContrib.canDelegate) {
          actions.push(this.toAction(AgentSessionProviders.Cloud, cloudContrib, instantiationService, location2, hasGitRepo));
        }
        for (const contrib of contributions) {
          if (contrib.canDelegate && isAgentHostTarget(contrib.type)) {
            actions.push(this.toAction(contrib.type, contrib, instantiationService, location2));
          }
        }
        if (actions.length === 0) {
          actions.push(this.toSetupAction(AgentSessionProviders.Background, instantiationService));
          actions.push(this.toSetupAction(AgentSessionProviders.Cloud, instantiationService));
        }
        return actions;
      }
    };
  }
  static toAction(provider, contrib, instantiationService, location2, enabled = true) {
    const providerName = getAgentSessionProviderName(provider);
    const label3 = providerName === provider ? contrib.displayName ?? providerName : providerName;
    return {
      id: contrib.type,
      enabled,
      icon: getAgentSessionProviderIcon(provider),
      class: void 0,
      description: `@${contrib.name}`,
      label: label3,
      tooltip: localize(8623, null, label3),
      category: { label: localize(8621, null), order: 0, showHeader: true },
      run: () => instantiationService.invokeFunction((accessor) => {
        if (location2 === "editor" /* Editor */) {
          return new CreateRemoteAgentJobFromEditorAction().run(accessor, contrib);
        }
        return new CreateRemoteAgentJobAction().run(accessor, contrib);
      })
    };
  }
  static toSetupAction(provider, instantiationService) {
    return {
      id: provider,
      enabled: true,
      icon: getAgentSessionProviderIcon(provider),
      class: void 0,
      label: getAgentSessionProviderName(provider),
      tooltip: localize(8623, null, getAgentSessionProviderName(provider)),
      category: { label: localize(8621, null), order: 0, showHeader: true },
      run: () => instantiationService.invokeFunction((accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(CHAT_SETUP_ACTION_ID);
      })
    };
  }
  renderLabel(element) {
    if (this.location === "editor" /* Editor */) {
      const view = h("span.action-widget-delegate-label", [
        h("span", { className: ThemeIcon.asClassName(Codicon.forward) }),
        h("span", [localize(8622, null)])
      ]);
      element.appendChild(view.root);
      return null;
    } else {
      const icon2 = this.contextKeyService.contextMatchesRules(ChatContextKeys.remoteJobCreating) ? Codicon.sync : Codicon.forward;
      element.classList.add(...ThemeIcon.asClassNameArray(icon2));
      return super.renderLabel(element);
    }
  }
};

ChatContinueInSessionActionItem = __decorateClass([
  __decorateParam(2, IActionWidgetService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IChatSessionsService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, ISCMService),
  __decorateParam(10, IWorkspaceContextService)
], ChatContinueInSessionActionItem);

var NEW_CHAT_SESSION_ACTION_ID = "workbench.action.chat.openNewSessionEditor";

var MAX_DELEGATION_TRANSCRIPT_LENGTH = 2e4;

function buildDelegationTranscript(requests, maxLength = MAX_DELEGATION_TRANSCRIPT_LENGTH) {
  let transcript = requests.map((req) => {
    const userMsg = `User: ${req.message.text}`;
    const respMsg = req.response?.response ? `Assistant: ${req.response.response.getMarkdown()}` : "";
    return respMsg ? `${userMsg}
${respMsg}` : userMsg;
  }).join("\n\n");
  if (transcript.length > maxLength) {
    transcript = transcript.substring(transcript.length - maxLength);
  }
  return transcript;
}

function createDelegationTranscriptAttachment(transcript, sourceName) {
  if (!transcript) {
    return void 0;
  }
  const transcriptName = localize(8617, null);
  const transcriptContent = localize(8616, null, sourceName, transcript);
  return toPasteVariableEntry(transcriptName, transcriptContent, {
    id: `chat-delegation-transcript-${generateUuid()}`,
    icon: Codicon.history,
    language: "markdown",
    pastedLines: transcriptName,
    fileName: transcriptName
  });
}

var CreateRemoteAgentJobAction = class {
  constructor() {
  }
  openUntitledEditor(commandService, continuationTarget) {
    commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${continuationTarget.type}`);
  }
  /**
   * Extracts the GitHub "owner/repo" NWO from the source session by checking
   * multiple data sources: chat model repoData, session metadata, and session options.
   */
  async extractRepoNwoFromSession(agentSessionsService, chatSessionsService, fileService, sessionResource, chatModel) {
    const repoData = chatModel.repoData;
    if (repoData?.remoteUrl) {
      const nwo = extractNwoFromRemoteUrl(repoData.remoteUrl);
      if (nwo) {
        return nwo;
      }
    }
    const agentSession = agentSessionsService.getSession(sessionResource);
    if (agentSession?.metadata) {
      const metadata = agentSession.metadata;
      const owner = metadata.owner;
      const name = metadata.name;
      if (owner && name) {
        return `${owner}/${name}`;
      }
      const repositoryNwo = metadata.repositoryNwo;
      if (repositoryNwo?.includes("/")) {
        return repositoryNwo;
      }
      const repositoryUrl = metadata.repositoryUrl;
      if (repositoryUrl) {
        const nwo = extractNwoFromRemoteUrl(repositoryUrl);
        if (nwo) {
          return nwo;
        }
      }
      const workingDir = metadata.workingDirectoryPath ?? metadata.repositoryPath ?? metadata.worktreePath;
      if (workingDir) {
        const nwo = await resolveGitRemoteNwo(workingDir, fileService);
        if (nwo) {
          return nwo;
        }
      }
    }
    for (const optionId of ["repositories", "repository"]) {
      const repoOption = chatSessionsService.getSessionOption(sessionResource, optionId);
      if (repoOption) {
        const optionValue = typeof repoOption === "string" ? repoOption : repoOption.id;
        if (optionValue) {
          const segments = optionValue.split("/").filter(Boolean);
          if (segments.length === 2) {
            return optionValue;
          }
          const nwo = extractNwoFromRemoteUrl(optionValue);
          if (nwo) {
            return nwo;
          }
          try {
            const uri5 = URI.parse(optionValue);
            if (uri5.authority === "github") {
              const parts = uri5.path.split("/").filter(Boolean);
              if (parts.length >= 2) {
                return `${parts[0]}/${parts[1]}`;
              }
            }
          } catch {
          }
          if (isAbsolute(optionValue)) {
            const nwoFromGit = await resolveGitRemoteNwo(optionValue, fileService);
            if (nwoFromGit) {
              return nwoFromGit;
            }
          }
        }
      }
    }
    return void 0;
  }
  async run(accessor, continuationTarget, _widget) {
    const contextKeyService = accessor.get(IContextKeyService);
    const commandService = accessor.get(ICommandService);
    const widgetService = accessor.get(IChatWidgetService);
    const chatAgentService = accessor.get(IChatAgentService);
    const chatService = accessor.get(IChatService);
    const editorService = accessor.get(IEditorService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const chatSessionsService = accessor.get(IChatSessionsService);
    const fileService = accessor.get(IFileService);
    const instantiationService = accessor.get(IInstantiationService);
    const remoteJobCreatingKey = ChatContextKeys.remoteJobCreating.bindTo(contextKeyService);
    try {
      remoteJobCreatingKey.set(true);
      const widget = _widget ?? widgetService.lastFocusedWidget;
      if (!widget || !widget.viewModel) {
        return this.openUntitledEditor(commandService, continuationTarget);
      }
      const chatModel = widget.viewModel.model;
      if (!chatModel) {
        return;
      }
      const sessionResource = widget.viewModel.sessionResource;
      const chatRequests = chatModel.getRequests();
      let userPrompt = widget.getInput();
      if (!userPrompt) {
        if (!chatRequests.length) {
          return this.openUntitledEditor(commandService, continuationTarget);
        }
        userPrompt = "implement this.";
      }
      const attachedContext = widget.input.getAttachedAndImplicitContext();
      widget.input.acceptInput(true);
      if (widget.location === "editor" /* EditorInline */) {
        const activeEditor = editorService.activeTextEditorControl;
        if (activeEditor) {
          const model = activeEditor.getModel();
          let activeEditorUri = void 0;
          if (model && isITextModel(model)) {
            activeEditorUri = model.uri;
          }
          const selection = activeEditor.getSelection();
          if (activeEditorUri && selection) {
            attachedContext.add({
              kind: "file",
              id: "vscode.implicit.selection",
              name: basename2(activeEditorUri),
              value: {
                uri: activeEditorUri,
                range: selection
              }
            });
          }
        }
      }
      const continuationTargetType = continuationTarget.type;
      const isSessionsWindow = IsSessionsWindowContext.getValue(contextKeyService);
      const sourceSessionType = getAgentSessionProvider(sessionResource) ?? getChatSessionType(sessionResource);
      const handoffToNewSession = isSessionsWindow || isAgentHostTarget(continuationTargetType) || !!sourceSessionType && isAgentHostTarget(sourceSessionType);
      if (handoffToNewSession && sourceSessionType && sourceSessionType !== continuationTargetType) {
        const isSidebar = isIChatViewViewContext(widget.viewContext);
        const transcript = buildDelegationTranscript(chatRequests);
        const sourceContribution = chatSessionsService.getAllChatSessionContributions().find((c) => c.type === sourceSessionType || getAgentSessionProvider(c.type) === sourceSessionType);
        const sourceName = sourceContribution?.displayName ?? getAgentSessionProviderName(sourceSessionType);
        const continuationContext = attachedContext.asArray();
        let handoffPrompt = userPrompt;
        const importConversationTurns = continuationTargetType === SessionType.AgentHostCopilot && !isSessionsWindow ? importedTurnsFromChatModel(chatModel) : void 0;
        const importConversationModelId = importConversationTurns ? widget.input.selectedLanguageModel.get()?.metadata.id : void 0;
        const importConversationModel = importConversationModelId ? { id: importConversationModelId } : void 0;
        if (transcript && !importConversationTurns) {
          if (isAgentHostTarget(continuationTargetType)) {
            const transcriptAttachment = createDelegationTranscriptAttachment(transcript, sourceName);
            if (transcriptAttachment) {
              continuationContext.unshift(transcriptAttachment);
            }
          } else {
            handoffPrompt = localize(8615, null, sourceName, transcript, userPrompt);
          }
        }
        const initialSessionOptions = /* @__PURE__ */ new Map();
        const repoNwo = await this.extractRepoNwoFromSession(agentSessionsService, chatSessionsService, fileService, sessionResource, chatModel);
        if (repoNwo) {
          initialSessionOptions.set("repositories", repoNwo);
        }
        if (isAgentHostTarget(continuationTargetType)) {
          if (isSessionsWindow) {
            const delegationRequest = {
              type: continuationTargetType,
              displayName: continuationTarget.displayName,
              prompt: handoffPrompt,
              attachedContext: continuationContext
            };
            await commandService.executeCommand(CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID, delegationRequest);
          } else {
            await instantiationService.invokeFunction((innerAccessor) => openChatSession(
              innerAccessor,
              {
                type: continuationTargetType,
                displayName: continuationTarget.displayName,
                position: isSidebar ? "sidebar" /* Sidebar */ : "editor" /* Editor */,
                // Replace the source chat editor in place so switching harness
                // feels like the same chat continues rather than opening a new
                // tab. The source (local) session stays in chat history and is
                // recoverable. The sidebar path already swaps in place via
                // `loadSession`, so it needs no replacement. Pass the source
                // resource (not a bare flag) so the correct editor is resolved
                // at replace time even if the active editor changed meanwhile.
                replaceEditorForResource: isSidebar ? void 0 : sessionResource
              },
              {
                prompt: handoffPrompt,
                attachedContext: continuationContext,
                initialSessionOptions: initialSessionOptions.size > 0 ? initialSessionOptions : void 0,
                importConversation: importConversationTurns ? { turns: importConversationTurns, model: importConversationModel } : void 0
              }
            ));
          }
          return;
        }
        const actionId = isSidebar ? `workbench.action.chat.openNewSessionSidebar.${continuationTargetType}` : `${NEW_CHAT_SESSION_ACTION_ID}.${continuationTargetType}`;
        await commandService.executeCommand(actionId, {
          prompt: handoffPrompt,
          attachedContext: continuationContext,
          initialSessionOptions: initialSessionOptions.size > 0 ? initialSessionOptions : void 0
        });
        return;
      }
      const defaultAgent = chatAgentService.getDefaultAgent("panel" /* Chat */);
      const requestParser = instantiationService.createInstance(ChatRequestParser);
      const context2 = { sessionType: getChatSessionType(sessionResource) };
      const parsedRequest = requestParser.parseChatRequestWithReferences(getDynamicVariablesForWidget(widget), getSelectedToolAndToolSetsForWidget(widget), userPrompt, "panel" /* Chat */, context2);
      const addedRequest = chatModel.addRequest(
        parsedRequest,
        { variables: attachedContext.asArray() },
        0,
        void 0,
        defaultAgent
      );
      await chatService.removeRequest(sessionResource, addedRequest.id);
      const sendResult = await chatService.sendRequest(sessionResource, userPrompt, {
        agentIdSilent: continuationTargetType,
        attachedContext: attachedContext.asArray(),
        ...widget.getSelectedModelRequestOptions(),
        ...widget.getModeRequestOptions()
      });
      if (ChatSendResult.isSent(sendResult)) {
        await widget.handleDelegationExitIfNeeded(defaultAgent, sendResult.data.agent);
      }
    } catch (e) {
      console.error("[Delegation] Error creating remote coding agent job", e);
      throw e;
    } finally {
      remoteJobCreatingKey.set(false);
    }
  }
};

var CreateRemoteAgentJobFromEditorAction = class {
  constructor() {
  }
  async run(accessor, continuationTarget) {
    try {
      const editorService = accessor.get(IEditorService);
      const activeEditor = editorService.activeTextEditorControl;
      const commandService = accessor.get(ICommandService);
      if (!activeEditor) {
        return;
      }
      const model = activeEditor.getModel();
      if (!model || !isITextModel(model)) {
        return;
      }
      const uri5 = model.uri;
      const attachedContext = [toPromptFileVariableEntry(uri5, "vscode.prompt.file" /* PromptFile */, void 0, false, [])];
      const prompt = `Follow instructions in [${basename2(uri5)}](${uri5.toString()}).`;
      await commandService.executeCommand(`${NEW_CHAT_SESSION_ACTION_ID}.${continuationTarget.type}`, { prompt, attachedContext });
    } catch (e) {
      console.error("Error creating remote agent job from editor", e);
      throw e;
    }
  }
};

var ContinueChatInSessionActionRendering = class extends Disposable {
  static {
    this.ID = "chat.continueChatInSessionActionRendering";
  }
  constructor(actionViewItemService, instantiationService) {
    super();
    const disposable = actionViewItemService.register(MenuId.EditorContent, ContinueChatInSessionAction.ID, (action, options3, instantiationService2) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChatContinueInSessionActionItem, action, "editor" /* Editor */);
    });
    markAsSingleton(disposable);
  }
};

ContinueChatInSessionActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService)
], ContinueChatInSessionActionRendering);
export { extractNwoFromRemoteUrl, resolveGitRemoteNwo, buildDelegationTranscript, createDelegationTranscriptAttachment, ContinueChatInSessionAction, ChatContinueInSessionActionItem, NEW_CHAT_SESSION_ACTION_ID, MAX_DELEGATION_TRANSCRIPT_LENGTH, CreateRemoteAgentJobAction, CreateRemoteAgentJobFromEditorAction, ContinueChatInSessionActionRendering };
