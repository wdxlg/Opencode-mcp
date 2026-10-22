// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatSessions/chatSessions.contribution.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0964.mjs";
import { AgentHostCodexAgentEnabledSettingId, CodexPreferAgentHostEditorSettingId } from "./module-1108.mjs";
import { ChatSessionOptionsMap, IChatSessionsService, SessionType, isSessionInProgressStatus, localChatSessionType } from "./module-0961.mjs";
import { Disposable, DisposableMap, DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IExtensionService, isProposedApiEnabled } from "./module-0889.mjs";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderName } from "./module-0983.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { Schemas } from "./module-0033.mjs";
import { sep } from "./module-0026.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { IChatService } from "./module-0973.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { URI } from "./module-0032.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { isDark } from "./module-0247.mjs";
import { LocalChatSessionUri, getChatSessionType, isUntitledChatSession } from "./module-0962.mjs";
import { AsyncIterableProducer, DeferredPromise, raceCancellationError } from "./module-0036.mjs";
import { BugIndicatingError, isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ChatEditorInput } from "./module-1112.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IAgentHostImportConversationStore } from "./module-1476.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ChatViewId } from "./module-0982.mjs";
import { assertNever } from "./module-0009.mjs";
import { slashReg } from "./module-0992.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { toPromptFileVariableEntry } from "./module-0980.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/contrib/chat/browser/chatSessions/chatSessions.contribution.ts
var extensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "chatSessions",
  jsonSchema: {
    description: localize(11089, null),
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          description: localize(11094, null),
          type: "string"
        },
        name: {
          description: localize(11100, null),
          type: "string",
          pattern: "^[\\w-]+$"
        },
        displayName: {
          description: localize(11097, null),
          type: "string"
        },
        description: {
          description: localize(11096, null),
          type: "string"
        },
        when: {
          description: localize(11120, null),
          type: "string"
        },
        icon: {
          description: localize(11098, null, "$(github)", "$(cloud)"),
          anyOf: [
            {
              type: "string"
            },
            {
              type: "object",
              properties: {
                light: {
                  description: localize(11122, null),
                  type: "string"
                },
                dark: {
                  description: localize(11121, null),
                  type: "string"
                }
              }
            }
          ]
        },
        order: {
          description: localize(11101, null),
          type: "integer"
        },
        alternativeIds: {
          description: localize(11090, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        welcomeTitle: {
          description: localize(11119, null),
          type: "string"
        },
        welcomeMessage: {
          description: localize(11117, null),
          type: "string"
        },
        welcomeTips: {
          description: localize(11118, null),
          type: "string"
        },
        inputPlaceholder: {
          description: localize(11099, null),
          type: "string"
        },
        capabilities: {
          description: localize(11093, null),
          type: "object",
          additionalProperties: false,
          properties: {
            supportsFileAttachments: {
              description: localize(11105, null),
              type: "boolean"
            },
            supportsToolAttachments: {
              description: localize(11115, null),
              type: "boolean"
            },
            supportsMCPAttachments: {
              description: localize(11109, null),
              type: "boolean"
            },
            supportsImageAttachments: {
              description: localize(11107, null),
              type: "boolean"
            },
            supportsSearchResultAttachments: {
              description: localize(11112, null),
              type: "boolean"
            },
            supportsInstructionAttachments: {
              description: localize(11108, null),
              type: "boolean"
            },
            supportsSourceControlAttachments: {
              description: localize(11113, null),
              type: "boolean"
            },
            supportsProblemAttachments: {
              description: localize(11110, null),
              type: "boolean"
            },
            supportsSymbolAttachments: {
              description: localize(11114, null),
              type: "boolean"
            },
            supportsPromptAttachments: {
              description: localize(11111, null),
              type: "boolean"
            },
            supportsHandOffs: {
              description: localize(11106, null),
              type: "boolean"
            }
          }
        },
        commands: {
          markdownDescription: localize(11086, null),
          type: "array",
          items: {
            additionalProperties: false,
            type: "object",
            defaultSnippets: [{ body: { name: "", description: "" } }],
            required: ["name"],
            properties: {
              name: {
                description: localize(11084, null),
                type: "string"
              },
              description: {
                description: localize(11085, null),
                type: "string"
              },
              when: {
                description: localize(11087, null),
                type: "string"
              }
            }
          }
        },
        canDelegate: {
          description: localize(11092, null),
          type: "boolean",
          default: false
        },
        customAgentTarget: {
          description: localize(11095, null),
          type: "string"
        },
        requiresCustomModels: {
          description: localize(11103, null),
          type: "boolean",
          default: false
        },
        supportsAutoModel: {
          description: localize(11104, null),
          type: "boolean",
          default: false
        },
        requiresCopilotSignIn: {
          description: localize(11102, null),
          type: "boolean",
          default: false
        },
        autoAttachReferences: {
          description: localize(11091, null),
          type: "boolean",
          default: false
        },
        useRequestToPopulateBuiltInPickers: {
          description: localize(11116, null),
          type: "boolean",
          default: false
        }
      },
      required: ["type", "name", "displayName", "description"]
    }
  },
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      yield `onChatSession:${contrib.type}`;
    }
  }
});

var codexExtensionHostAvailableWhen = ContextKeyExpr.and(
  IsSessionsWindowContext.negate(),
  ContextKeyExpr.or(
    AGENT_HOST_ENABLED_CONTEXT_KEY.negate(),
    ContextKeyExpr.not(`config.${AgentHostCodexAgentEnabledSettingId}`),
    ContextKeyExpr.not(`config.${CodexPreferAgentHostEditorSettingId}`)
  )
);

function applyCodexAgentHostPreference(contribution) {
  if (contribution.type !== SessionType.Codex) {
    return contribution;
  }
  const contributedWhen = contribution.when ? ContextKeyExpr.deserialize(contribution.when) : void 0;
  return {
    ...contribution,
    when: ContextKeyExpr.and(contributedWhen, codexExtensionHostAvailableWhen)?.serialize()
  };
}

var ContributedChatSessionData = class extends Disposable {
  constructor(session, chatSessionType, resource, options3, onWillDispose) {
    super();
    this.session = session;
    this.chatSessionType = chatSessionType;
    this.resource = resource;
    this.options = options3;
    this.onWillDispose = onWillDispose;
    this._optionsCache = new Map(options3);
    this._register(this.session.onWillDispose(() => {
      this.onWillDispose(this.resource);
    }));
  }
  getOption(optionId) {
    return this._optionsCache.get(optionId);
  }
  getAllOptions() {
    return this._optionsCache.entries();
  }
  setOption(optionId, value2) {
    this._optionsCache.set(optionId, value2);
  }
};

var ChatSessionsService = class extends Disposable {
  constructor(_logService, _chatAgentService, _extensionService, _contextKeyService, _menuService, _themeService, _labelService, _instantiationService) {
    super();
    this._logService = _logService;
    this._chatAgentService = _chatAgentService;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._themeService = _themeService;
    this._labelService = _labelService;
    this._instantiationService = _instantiationService;
    this._itemControllers = /* @__PURE__ */ new Map();
    this._asyncActivationRegistry = Registry.as("workbench.contrib.chatSessions.asyncActivation" /* AsyncActivation */);
    this._contributions = /* @__PURE__ */ new Map();
    this._contributionDisposables = this._register(new DisposableMap());
    this._contentProviders = /* @__PURE__ */ new Map();
    this._alternativeIdMap = /* @__PURE__ */ new Map();
    this._contextKeys = /* @__PURE__ */ new Set();
    this._onDidChangeItemsProviders = this._register(new Emitter());
    this.onDidChangeItemsProviders = this._onDidChangeItemsProviders.event;
    this._onDidChangeSessionItems = this._register(new Emitter());
    this.onDidChangeSessionItems = this._onDidChangeSessionItems.event;
    this._onDidCommitSession = this._register(new Emitter());
    this.onDidCommitSession = this._onDidCommitSession.event;
    this._onDidChangeAvailability = this._register(new Emitter());
    this.onDidChangeAvailability = this._onDidChangeAvailability.event;
    this._onDidChangeInProgress = this._register(new Emitter());
    this._onDidChangeContentProviderSchemes = this._register(new Emitter());
    this._onDidChangeSessionOptions = this._register(new Emitter());
    this._onDidChangeOptionGroups = this._register(new Emitter());
    this.inProgressMap = /* @__PURE__ */ new Map();
    this._sessionTypeOptions = /* @__PURE__ */ new Map();
    this._sessions = new ResourceMap();
    this._resourceAliases = new ResourceMap();
    // real resource -> untitled resource (kept for the workbench lifetime so option lookups for the real session resolve to the untitled entry)
    this._realResources = new ResourceMap();
    // untitled resource -> real resource (cleared when the session is disposed)
    this._pendingSessionResolutions = /* @__PURE__ */ new Map();
    this._customizationsProviders = /* @__PURE__ */ new Map();
    this._onDidChangeCustomizations = this._register(new Emitter());
    this.onDidChangeCustomizations = this._onDidChangeCustomizations.event;
    this._hasCanDelegateProvidersKey = ChatContextKeys.hasCanDelegateProviders.bindTo(this._contextKeyService);
    this._register(extensionPoint.setHandler((extensions) => {
      for (const ext of extensions) {
        if (!isProposedApiEnabled(ext.description, "chatSessionsProvider")) {
          continue;
        }
        if (!Array.isArray(ext.value)) {
          continue;
        }
        for (const contribution of ext.value) {
          this._register(this.registerContribution(contribution, ext.description));
        }
      }
    }));
    this._register(Event2.filter(this._contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(this._contextKeys))(() => {
      this._evaluateAvailability();
    }));
    const builtinSessionProviders = [AgentSessionProviders.Local];
    const contributedSessionProviders = observableFromEvent(
      this.onDidChangeAvailability,
      () => Array.from(this._contributions.keys()).filter((key3) => this._contributionDisposables.has(key3))
    ).recomputeInitiallyAndOnChange(this._store);
    this._register(autorun((reader) => {
      const activatedProviders = contributedSessionProviders.read(reader);
      for (const provider of builtinSessionProviders) {
        reader.store.add(registerNewSessionInPlaceAction(provider, getAgentSessionProviderName(provider)));
      }
      for (const type of activatedProviders) {
        const knownProvider = getAgentSessionProvider(type);
        if (knownProvider) {
          const label3 = getAgentSessionProviderName(knownProvider);
          reader.store.add(registerNewSessionInPlaceAction(type, label3));
        } else {
          const contrib = this._contributions.get(type);
          if (contrib) {
            reader.store.add(registerNewSessionInPlaceAction(type, contrib.contribution.displayName ?? contrib.contribution.name ?? type));
          }
        }
      }
    }));
    this._register(this._labelService.registerFormatter({
      scheme: Schemas.copilotPr,
      formatting: {
        label: "${authority}${path}",
        separator: sep,
        stripPathStartingSeparator: true
      }
    }));
  }
  get onDidChangeInProgress() {
    return this._onDidChangeInProgress.event;
  }
  get onDidChangeContentProviderSchemes() {
    return this._onDidChangeContentProviderSchemes.event;
  }
  get onDidChangeSessionOptions() {
    return this._onDidChangeSessionOptions.event;
  }
  get onDidChangeOptionGroups() {
    return this._onDidChangeOptionGroups.event;
  }
  reportInProgress(chatSessionType, count2) {
    if (!this._itemControllers.has(chatSessionType)) {
      this._logService.warn(`Attempted to report in-progress status for unknown chat session type '${chatSessionType}'`);
    }
    this.inProgressMap.set(chatSessionType, count2);
    this._onDidChangeInProgress.fire();
  }
  getInProgress() {
    return Array.from(this.inProgressMap.entries()).map(([chatSessionType, count2]) => ({ chatSessionType, count: count2 }));
  }
  async resolveChatSessionItem(chatSessionType, resource, token) {
    const entry = this._itemControllers.get(chatSessionType);
    if (!entry?.controller.resolveChatSessionItem) {
      return void 0;
    }
    return entry.controller.resolveChatSessionItem(resource, token);
  }
  canSetChatSessionItemArchived(sessionResource) {
    return typeof this._getChatSessionItemController(sessionResource)?.controller.setChatSessionItemArchived === "function";
  }
  setChatSessionItemArchived(sessionResource, archived) {
    const controller = this._getChatSessionItemController(sessionResource)?.controller;
    if (!controller?.setChatSessionItemArchived) {
      throw new Error(`Session ${sessionResource.toString()} does not support archiving`);
    }
    controller.setChatSessionItemArchived(sessionResource, archived);
  }
  canSetChatSessionItemRead(sessionResource) {
    return typeof this._getChatSessionItemController(sessionResource)?.controller.setChatSessionItemRead === "function";
  }
  setChatSessionItemRead(sessionResource, isRead) {
    const controller = this._getChatSessionItemController(sessionResource)?.controller;
    if (!controller?.setChatSessionItemRead) {
      throw new Error(`Session ${sessionResource.toString()} does not own read state`);
    }
    controller.setChatSessionItemRead(sessionResource, isRead);
  }
  async updateInProgressStatus(chatSessionType) {
    const controller = this._itemControllers.get(chatSessionType)?.controller;
    if (!controller) {
      return;
    }
    try {
      const items = [];
      for await (const result of this.getChatSessionItems([chatSessionType], CancellationToken.None)) {
        items.push(...result.items);
      }
      if (this._itemControllers.get(chatSessionType)?.controller !== controller) {
        return;
      }
      const inProgress = items.filter((item) => !item.archived && item.status && isSessionInProgressStatus(item.status));
      this.reportInProgress(chatSessionType, inProgress.length);
    } catch (error) {
      this._logService.warn(`Failed to update in-progress status for chat session type '${chatSessionType}':`, error);
    }
  }
  registerContribution(contribution, ext) {
    contribution = applyCodexAgentHostPreference(contribution);
    this._logService.trace(`[ChatSessionsService] registerContribution called for type='${contribution.type}', canDelegate=${contribution.canDelegate}, when='${contribution.when}', extension='${ext.identifier.value}'`);
    if (this._contributions.has(contribution.type)) {
      this._logService.trace(`[ChatSessionsService] registerContribution: type='${contribution.type}' already registered, skipping`);
      return Disposable.None;
    }
    if (contribution.when) {
      const whenExpr = ContextKeyExpr.deserialize(contribution.when);
      if (whenExpr) {
        for (const key3 of whenExpr.keys()) {
          this._contextKeys.add(key3);
        }
      }
    }
    this._contributions.set(contribution.type, { contribution, extension: ext });
    if (contribution.alternativeIds) {
      for (const altId of contribution.alternativeIds) {
        if (this._alternativeIdMap.has(altId)) {
          this._logService.warn(`Alternative ID '${altId}' is already mapped to '${this._alternativeIdMap.get(altId)}'. Remapping to '${contribution.type}'.`);
        }
        this._alternativeIdMap.set(altId, contribution.type);
      }
    }
    this._evaluateAvailability();
    return {
      dispose: () => {
        this._contributions.delete(contribution.type);
        if (contribution.alternativeIds) {
          for (const altId of contribution.alternativeIds) {
            if (this._alternativeIdMap.get(altId) === contribution.type) {
              this._alternativeIdMap.delete(altId);
            }
          }
        }
        this._contributionDisposables.deleteAndDispose(contribution.type);
        this._updateHasCanDelegateProvidersContextKey();
      }
    };
  }
  _isContributionAvailable(contribution) {
    if (!contribution.when) {
      return true;
    }
    const whenExpr = ContextKeyExpr.deserialize(contribution.when);
    return !whenExpr || this._contextKeyService.contextMatchesRules(whenExpr);
  }
  /**
   * Type-keyed companion to {@link _isContributionAvailable}. Resolves the
   * session type (including alternative ids) to its contribution and reports
   * whether that contribution is currently enabled by its `when` clause.
   *
   * Session types with no contribution entry (e.g. the built-in `local`
   * provider, or item controllers registered without a matching contribution)
   * are treated as available, since there is no `when` clause gating them.
   */
  _isContributionAvailableForType(sessionType) {
    const primaryType = this._contributions.has(sessionType) ? sessionType : this._alternativeIdMap.get(sessionType);
    const contribution = primaryType ? this._contributions.get(primaryType)?.contribution : void 0;
    return !contribution || this._isContributionAvailable(contribution);
  }
  /**
   * Resolves a session type to its primary type, checking for alternative IDs.
   * @param sessionType The session type or alternative ID to resolve
   * @returns The primary session type, or undefined if not found or not available
   */
  _resolveToPrimaryType(sessionType) {
    const contribution = this._contributions.get(sessionType)?.contribution;
    if (contribution) {
      if (this._isContributionAvailable(contribution)) {
        return sessionType;
      }
    }
    const primaryType = this._alternativeIdMap.get(sessionType);
    if (primaryType) {
      const altContribution = this._contributions.get(primaryType)?.contribution;
      if (altContribution && this._isContributionAvailable(altContribution)) {
        return primaryType;
      }
    }
    return void 0;
  }
  _registerMenuItems(contribution, extensionDescription) {
    const disposables = new DisposableStore();
    if (!contribution.canDelegate) {
      disposables.add(registerNewSessionExternalAction(
        contribution.type,
        contribution.displayName,
        () => this._resolveCreateSubMenuCommandId(contribution.type)
      ));
    }
    const contextKeyService = this._contextKeyService.createOverlay([
      ["chatSessionType", contribution.type]
    ]);
    const rawMenuActions = this._menuService.getMenuActions(MenuId.AgentSessionsCreateSubMenu, contextKeyService);
    const menuActions = rawMenuActions.map((value2) => value2[1]).flat();
    const menuItemActions = menuActions.filter((action) => action instanceof MenuItemAction);
    const actionsToMirror = contribution.canDelegate ? menuItemActions : menuItemActions.slice(1);
    for (const action of actionsToMirror) {
      disposables.add(MenuRegistry.appendMenuItem(MenuId.ChatNewMenu, {
        command: action.item,
        group: "4_externally_contributed"
      }));
    }
    return {
      dispose: () => disposables.dispose()
    };
  }
  /**
   * Resolves the command id of the primary create action contributed to
   * {@link MenuId.AgentSessionsCreateSubMenu} for the given session type, or
   * `undefined` when no such action is contributed (yet). Read at execution
   * time so it is unaffected by the ordering of extension menu registration.
   */
  _resolveCreateSubMenuCommandId(type) {
    const contextKeyService = this._contextKeyService.createOverlay([
      ["chatSessionType", type]
    ]);
    const rawMenuActions = this._menuService.getMenuActions(MenuId.AgentSessionsCreateSubMenu, contextKeyService);
    const menuActions = rawMenuActions.map((value2) => value2[1]).flat();
    for (const action of menuActions) {
      if (action instanceof MenuItemAction) {
        return action.item.id;
      }
    }
    return void 0;
  }
  _registerCommands(contribution) {
    const isAvailableInSessionTypePicker = isAgentSessionProviderType(contribution.type);
    return combinedDisposable(
      registerAction2(class OpenChatSessionAction extends Action2 {
        constructor() {
          super({
            id: `workbench.action.chat.openSessionWithPrompt.${contribution.type}`,
            title: localize2(11127, "New {0} with Prompt", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: false,
            precondition: ChatContextKeys.enabled
          });
        }
        async run(accessor, chatOptions) {
          const chatService = accessor.get(IChatService);
          const customizationHarnessService = accessor.get(ICustomizationHarnessService);
          const toolsService = accessor.get(ILanguageModelToolsService);
          const { type } = contribution;
          if (chatOptions) {
            let attachedContext = chatOptions.attachedContext;
            const sessionResource = URI.revive(chatOptions.resource);
            const ref = await chatService.acquireOrLoadSession(sessionResource, "panel" /* Chat */, CancellationToken.None, "ChatSessionsContribution#sendPrompt");
            try {
              const promptFile = await resolvePromptSlashCommand(chatOptions.prompt, sessionResource, customizationHarnessService, toolsService);
              if (promptFile) {
                attachedContext = [promptFile, ...attachedContext ?? []];
              }
              const result = await chatService.sendRequest(sessionResource, chatOptions.prompt, { agentIdSilent: type, attachedContext });
              if (result.kind === "queued") {
                await result.deferred;
              } else if (result.kind === "sent") {
                await result.data.responseCompletePromise;
              }
            } finally {
              ref?.dispose();
            }
          }
        }
      }),
      // Creates a chat editor
      registerAction2(class OpenNewChatSessionEditorAction extends Action2 {
        constructor() {
          super({
            id: `workbench.action.chat.openNewSessionEditor.${contribution.type}`,
            title: localize2(11125, "New {0} Session", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: true,
            precondition: ChatContextKeys.enabled
          });
        }
        async run(accessor, chatOptions) {
          const { type, displayName } = contribution;
          await openChatSession(accessor, { type, displayName, position: "editor" /* Editor */ }, chatOptions);
        }
      }),
      // New chat in sidebar chat (+ button)
      registerAction2(class OpenNewChatSessionSidebarAction extends Action2 {
        constructor() {
          super({
            id: `workbench.action.chat.openNewSessionSidebar.${contribution.type}`,
            title: localize2(11126, "New {0} Session", contribution.displayName),
            category: CHAT_CATEGORY,
            icon: Codicon.plus,
            f1: false,
            // Hide from Command Palette
            precondition: ChatContextKeys.enabled,
            menu: !isAvailableInSessionTypePicker ? {
              id: MenuId.ChatNewMenu,
              group: "3_new_special"
            } : void 0
          });
        }
        async run(accessor, chatOptions) {
          const { type, displayName } = contribution;
          await openChatSession(accessor, { type, displayName, position: "sidebar" /* Sidebar */ }, chatOptions);
        }
      })
    );
  }
  _evaluateAvailability() {
    const newlyEnabledChatSessionTypes = /* @__PURE__ */ new Set();
    const newlyDisabledChatSessionTypes = /* @__PURE__ */ new Set();
    const disposedChatSessions = new ResourceSet();
    for (const { contribution, extension } of this._contributions.values()) {
      const isCurrentlyRegistered = this._contributionDisposables.has(contribution.type);
      const shouldBeRegistered = this._isContributionAvailable(contribution);
      this._logService.trace(`[ChatSessionsService] _evaluateAvailability: type='${contribution.type}', isCurrentlyRegistered=${isCurrentlyRegistered}, shouldBeRegistered=${shouldBeRegistered}, when='${contribution.when}'`);
      if (isCurrentlyRegistered && !shouldBeRegistered) {
        this._contributionDisposables.deleteAndDispose(contribution.type);
        for (const sessionResource of this._disposeSessionsForContribution(contribution.type)) {
          disposedChatSessions.add(sessionResource);
        }
        newlyDisabledChatSessionTypes.add(contribution.type);
      } else if (!isCurrentlyRegistered && shouldBeRegistered) {
        if (extension) {
          this._enableContribution(contribution, extension);
        }
        newlyEnabledChatSessionTypes.add(contribution.type);
      }
    }
    if (newlyEnabledChatSessionTypes.size > 0 || newlyDisabledChatSessionTypes.size > 0) {
      this._onDidChangeAvailability.fire();
      for (const chatSessionType of [...newlyEnabledChatSessionTypes, ...newlyDisabledChatSessionTypes]) {
        this._onDidChangeItemsProviders.fire({ chatSessionType });
      }
      if (disposedChatSessions.size > 0) {
        this._onDidChangeSessionItems.fire({ removed: Array.from(disposedChatSessions) });
      }
    }
    this._updateHasCanDelegateProvidersContextKey();
  }
  _enableContribution(contribution, ext) {
    this._logService.trace(`[ChatSessionsService] _enableContribution: type='${contribution.type}', canDelegate=${contribution.canDelegate}`);
    const disposableStore = new DisposableStore();
    this._contributionDisposables.set(contribution.type, disposableStore);
    if (contribution.canDelegate) {
      disposableStore.add(this._registerAgent(contribution, ext));
      disposableStore.add(this._registerCommands(contribution));
    }
    disposableStore.add(this._registerMenuItems(contribution, ext));
  }
  /**
   * Disposes of all sessions that belong to a contribution
   *
   * @returns List of session resources that were disposed.
   */
  _disposeSessionsForContribution(contributionId) {
    const sessionsToDispose = [];
    for (const [sessionResource, sessionData] of this._sessions) {
      if (sessionData.chatSessionType === contributionId) {
        sessionsToDispose.push(sessionResource);
      }
    }
    if (sessionsToDispose.length > 0) {
      this._logService.info(`Disposing ${sessionsToDispose.length} cached sessions for contribution '${contributionId}' due to when clause change`);
    }
    for (const sessionKey of sessionsToDispose) {
      const sessionData = this._sessions.get(sessionKey);
      if (sessionData) {
        sessionData.dispose();
      }
    }
    return sessionsToDispose;
  }
  _registerAgent(contribution, ext) {
    const storedIcon = this.getContributionIcon(ext, contribution);
    const icons2 = ThemeIcon.isThemeIcon(storedIcon) ? { themeIcon: storedIcon, icon: void 0, iconDark: void 0 } : storedIcon ? { icon: storedIcon.light, iconDark: storedIcon.dark } : { themeIcon: Codicon.sendToRemoteAgent };
    const id2 = contribution.type;
    const agentData = {
      id: id2,
      name: contribution.name,
      fullName: contribution.displayName,
      description: contribution.description,
      isDefault: false,
      isCore: false,
      isDynamic: true,
      slashCommands: contribution.commands ?? [],
      locations: contribution.locations ?? ["panel" /* Chat */],
      modes: ["agent" /* Agent */, "ask" /* Ask */],
      disambiguation: [],
      metadata: {
        ...icons2
      },
      capabilities: contribution.capabilities,
      canAccessPreviousChatHistory: true,
      extensionId: ext.identifier,
      extensionVersion: ext.version,
      extensionDisplayName: ext.displayName || ext.name,
      extensionPublisherId: ext.publisher
    };
    return this._chatAgentService.registerAgent(id2, agentData);
  }
  getAllChatSessionContributions() {
    return Array.from(this._contributions.values()).filter((entry) => this._isContributionAvailable(entry.contribution)).map((entry) => this.resolveChatSessionContribution(entry.extension, entry.contribution));
  }
  _updateHasCanDelegateProvidersContextKey() {
    const hasCanDelegate = this.getAllChatSessionContributions().filter((c) => c.canDelegate);
    const canDelegateEnabled = hasCanDelegate.length > 0;
    this._logService.trace(`[ChatSessionsService] hasCanDelegateProvidersAvailable=${canDelegateEnabled} (${hasCanDelegate.map((c) => c.type).join(", ")})`);
    this._hasCanDelegateProvidersKey.set(canDelegateEnabled);
  }
  getChatSessionContribution(chatSessionType) {
    const entry = this._contributions.get(chatSessionType);
    if (!entry) {
      return void 0;
    }
    if (!this._isContributionAvailable(entry.contribution)) {
      return void 0;
    }
    return this.resolveChatSessionContribution(entry.extension, entry.contribution);
  }
  resolveChatSessionContribution(ext, contribution) {
    return {
      ...contribution,
      icon: this.resolveIconForCurrentColorTheme(this.getContributionIcon(ext, contribution))
    };
  }
  getContributionIcon(ext, contribution) {
    if (!contribution.icon) {
      return void 0;
    }
    if (typeof contribution.icon === "string") {
      return contribution.icon.startsWith("$(") && contribution.icon.endsWith(")") ? ThemeIcon.fromString(contribution.icon) : ThemeIcon.fromId(contribution.icon);
    }
    return {
      dark: ext ? joinPath(ext.extensionLocation, contribution.icon.dark) : URI.parse(contribution.icon.dark),
      light: ext ? joinPath(ext.extensionLocation, contribution.icon.light) : URI.parse(contribution.icon.light)
    };
  }
  resolveIconForCurrentColorTheme(rawIcon) {
    if (!rawIcon) {
      return void 0;
    }
    if (ThemeIcon.isThemeIcon(rawIcon)) {
      return rawIcon;
    } else if (isDark(this._themeService.getColorTheme().type)) {
      return rawIcon.dark;
    } else {
      return rawIcon.light;
    }
  }
  registerChatSessionContribution(contribution) {
    if (this._contributions.has(contribution.type)) {
      return { dispose: () => {
      } };
    }
    this._contributions.set(contribution.type, { contribution, extension: void 0 });
    if (contribution.alternativeIds) {
      for (const alternativeId of contribution.alternativeIds) {
        this._alternativeIdMap.set(alternativeId, contribution.type);
      }
    }
    const disposables = new DisposableStore();
    this._contributionDisposables.set(contribution.type, disposables);
    if (contribution.onDidChangeRequiresCopilotSignIn) {
      disposables.add(contribution.onDidChangeRequiresCopilotSignIn(() => this._onDidChangeAvailability.fire()));
    }
    this._updateHasCanDelegateProvidersContextKey();
    this._onDidChangeAvailability.fire();
    return toDisposable(() => {
      this._contributions.delete(contribution.type);
      if (contribution.alternativeIds) {
        for (const alternativeId of contribution.alternativeIds) {
          if (this._alternativeIdMap.get(alternativeId) === contribution.type) {
            this._alternativeIdMap.delete(alternativeId);
          }
        }
      }
      this._contributionDisposables.deleteAndDispose(contribution.type);
      this._updateHasCanDelegateProvidersContextKey();
      this._onDidChangeAvailability.fire();
    });
  }
  async activateChatSessionItemProvider(chatViewType) {
    await this.doActivateChatSessionItemController(chatViewType);
  }
  async doActivateChatSessionItemController(chatViewType) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const resolvedType = this._resolveToPrimaryType(chatViewType);
    if (resolvedType) {
      chatViewType = resolvedType;
    }
    if (!this._isContributionAvailableForType(chatViewType)) {
      return false;
    }
    if (this._itemControllers.has(chatViewType)) {
      return true;
    }
    await this._extensionService.activateByEvent(`onChatSession:${chatViewType}`);
    const controller = this._itemControllers.get(chatViewType);
    return !!controller;
  }
  async canResolveChatSession(sessionType) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    if (!this._isContributionAvailableForType(sessionType)) {
      return false;
    }
    if (this._contentProviders.has(sessionType)) {
      return true;
    }
    const asyncActivators = this._asyncActivationRegistry.getActivators(sessionType);
    if (asyncActivators.length) {
      for (const activator of asyncActivators) {
        if (await this._instantiationService.invokeFunction((accessor) => activator.waitForActivation(accessor, sessionType))) {
          await this.waitForContentProvider(sessionType);
          if (this._contentProviders.has(sessionType)) {
            return true;
          }
        }
      }
      return false;
    }
    await this._extensionService.activateByEvent(`onChatSession:${sessionType}`);
    return this._contentProviders.has(sessionType);
  }
  async waitForContentProvider(sessionType) {
    if (this._contentProviders.has(sessionType)) {
      return;
    }
    await Event2.toPromise(Event2.filter(this.onDidChangeContentProviderSchemes, (e4) => e4.added.includes(sessionType)));
  }
  async provideChatInputCompletions(sessionResource, params, token) {
    const sessionType = getChatSessionType(sessionResource);
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    const provider = this._contentProviders.get(resolvedType);
    if (!provider?.provideChatInputCompletions) {
      return void 0;
    }
    return provider.provideChatInputCompletions(sessionResource, params, token);
  }
  resolveChatResponseUri(sessionResource, href, kind) {
    const sessionType = getChatSessionType(sessionResource);
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    return this._contentProviders.get(resolvedType)?.resolveChatResponseUri?.(sessionResource, href, kind) ?? href;
  }
  updateChatSessionMetadata(sessionResource, metadata) {
    const sessionType = getChatSessionType(sessionResource);
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    const provider = this._contentProviders.get(resolvedType);
    if (!provider?.updateChatSessionMetadata) {
      return false;
    }
    provider.updateChatSessionMetadata(sessionResource, metadata);
    return true;
  }
  async getChatInputCompletionTriggerCharacters(sessionType) {
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    const provider = this._contentProviders.get(resolvedType);
    if (!provider) {
      return void 0;
    }
    if (!provider.provideChatInputCompletionTriggerCharacters) {
      return [];
    }
    return provider.provideChatInputCompletionTriggerCharacters();
  }
  async tryActivateControllers(providersToResolve) {
    await Promise.all(this.getAllChatSessionContributions().map(async (contrib) => {
      if (providersToResolve && !providersToResolve.includes(contrib.type)) {
        return;
      }
      if (!await this.doActivateChatSessionItemController(contrib.type)) {
        if (providersToResolve?.includes(contrib.type)) {
          this._logService.trace(`[ChatSessionsService] No enabled provider found for chat session type ${contrib.type}`);
        }
      }
    }));
  }
  getChatSessionItems(providersToResolve, token) {
    return new AsyncIterableProducer(async (writer) => {
      await raceCancellationError(this.tryActivateControllers(providersToResolve), token);
      await Promise.all(Array.from(this._itemControllers, async ([chatSessionType, controllerEntry]) => {
        const resolvedType = this._resolveToPrimaryType(chatSessionType) ?? chatSessionType;
        if (providersToResolve && !providersToResolve.includes(resolvedType)) {
          return;
        }
        if (!this._isContributionAvailableForType(chatSessionType)) {
          return;
        }
        try {
          await raceCancellationError(controllerEntry.initialRefresh, token);
          const providerSessions = controllerEntry.controller.items;
          this._logService.trace(`[ChatSessionsService] Resolved ${providerSessions.length} sessions for provider ${resolvedType}`);
          writer.emitOne({ chatSessionType: resolvedType, items: providerSessions });
        } catch (err) {
          if (!isCancellationError(err)) {
            this._logService.error(`[ChatSessionsService] Failed to resolve sessions for provider ${resolvedType}`, err);
          }
        }
      }));
    });
  }
  async refreshChatSessionItems(providersToResolve, token) {
    await this.tryActivateControllers(providersToResolve);
    await Promise.all(Array.from(this._itemControllers).map(async ([chatSessionType, controllerEntry]) => {
      const resolvedType = this._resolveToPrimaryType(chatSessionType) ?? chatSessionType;
      if (providersToResolve && !providersToResolve.includes(resolvedType)) {
        return;
      }
      try {
        await controllerEntry.controller.refresh(token);
      } catch (err) {
        if (!isCancellationError(err)) {
          this._logService.error(`[ChatSessionsService] Failed to resolve sessions for provider ${resolvedType}`, err);
        }
      }
    }));
  }
  getRegisteredChatSessionItemProviders() {
    return [...new Set(Array.from(this._itemControllers.keys()).map((key3) => this._resolveToPrimaryType(key3) ?? key3))];
  }
  registerChatSessionItemController(chatSessionType, controller) {
    const disposables = new DisposableStore();
    const initialRefreshCts = disposables.add(new CancellationTokenSource());
    this._itemControllers.set(chatSessionType, { controller, initialRefresh: controller.refresh(initialRefreshCts.token) });
    this._onDidChangeItemsProviders.fire({ chatSessionType });
    disposables.add(controller.onDidChangeChatSessionItems((e4) => {
      this._onDidChangeSessionItems.fire(e4);
      this.updateInProgressStatus(chatSessionType);
    }));
    return {
      dispose: () => {
        initialRefreshCts.cancel();
        disposables.dispose();
        const registeredController = this._itemControllers.get(chatSessionType)?.controller;
        if (registeredController === controller) {
          this._itemControllers.delete(chatSessionType);
          this._onDidChangeItemsProviders.fire({ chatSessionType });
          if (this.inProgressMap.delete(chatSessionType)) {
            this._onDidChangeInProgress.fire();
          }
        }
      }
    };
  }
  registerChatSessionContentProvider(chatSessionType, provider) {
    if (this._contentProviders.has(chatSessionType)) {
      throw new Error(`Content provider for ${chatSessionType} is already registered.`);
    }
    this._contentProviders.set(chatSessionType, provider);
    this._onDidChangeContentProviderSchemes.fire({ added: [chatSessionType], removed: [] });
    return {
      dispose: () => {
        this._contentProviders.delete(chatSessionType);
        this._onDidChangeContentProviderSchemes.fire({ added: [], removed: [chatSessionType] });
        for (const [key3, session] of this._sessions) {
          if (session.chatSessionType === chatSessionType) {
            session.dispose();
            this._sessions.delete(key3);
          }
        }
      }
    };
  }
  registerCustomizationsProvider(chatSessionType, provider) {
    this._customizationsProviders.set(chatSessionType, provider);
    const onChangeDisposable = provider.onDidChangeCustomizations(() => {
      this._onDidChangeCustomizations.fire({ chatSessionType });
    });
    return toDisposable(() => {
      onChangeDisposable.dispose();
      if (this._customizationsProviders.get(chatSessionType) === provider) {
        this._customizationsProviders.delete(chatSessionType);
      }
    });
  }
  hasCustomizationsProvider(chatSessionType) {
    return this._customizationsProviders.has(chatSessionType);
  }
  async getCustomizations(chatSessionType, token) {
    const provider = this._customizationsProviders.get(chatSessionType);
    if (!provider) {
      return void 0;
    }
    return provider.provideCustomizations(token);
  }
  async createNewChatSessionItem(chatSessionType, request2, token) {
    const controllerData = this._itemControllers.get(chatSessionType);
    if (!controllerData) {
      return void 0;
    }
    await controllerData.initialRefresh;
    return controllerData.controller.newChatSessionItem?.(request2, token);
  }
  notifySessionMaterialized(sessionResource) {
    this._getChatSessionItemController(sessionResource)?.controller.notifySessionMaterialized?.(sessionResource);
  }
  async deleteChatSessionItem(sessionResource, token) {
    const controllerData = this._getChatSessionItemController(sessionResource);
    if (!controllerData?.controller.deleteChatSessionItem) {
      throw new Error(`Session ${sessionResource.toString()} does not support deletion`);
    }
    await controllerData.initialRefresh;
    await controllerData.controller.deleteChatSessionItem(sessionResource, token);
    const sessionData = this._sessions.get(sessionResource) ?? this._sessions.get(this._resolveResource(sessionResource));
    if (sessionData) {
      this._sessions.delete(sessionData.resource);
      sessionData.dispose();
      sessionData.session.dispose();
    }
  }
  _getChatSessionItemController(sessionResource) {
    const sessionType = getChatSessionType(sessionResource);
    const resolvedType = this._resolveToPrimaryType(sessionType) ?? sessionType;
    return this._itemControllers.get(resolvedType);
  }
  async getOrCreateChatSession(sessionResource, token) {
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        this._logService.trace(`[ChatSessionsService] getOrCreateChatSession: cache hit for ${sessionResource.toString()}`);
        return existingSessionData.session;
      }
    }
    const resourceKey = sessionResource.toString();
    let pendingSession = this._pendingSessionResolutions.get(resourceKey);
    if (!pendingSession) {
      const cancellationTokenSource = new CancellationTokenSource();
      const promise = this._getOrCreateChatSession(sessionResource, cancellationTokenSource.token);
      pendingSession = { promise, cancellationTokenSource, waiterCount: 0 };
      this._pendingSessionResolutions.set(resourceKey, pendingSession);
      const clearPendingSession = () => {
        if (this._pendingSessionResolutions.get(resourceKey) === pendingSession) {
          this._pendingSessionResolutions.delete(resourceKey);
        }
        cancellationTokenSource.dispose();
      };
      void promise.then(clearPendingSession, clearPendingSession);
    }
    return this._waitForPendingSessionResolution(resourceKey, pendingSession, token);
  }
  _waitForPendingSessionResolution(resourceKey, pendingSession, token) {
    pendingSession.waiterCount++;
    let released = false;
    const release = () => {
      if (released) {
        return;
      }
      released = true;
      pendingSession.waiterCount--;
      if (pendingSession.waiterCount === 0 && this._pendingSessionResolutions.get(resourceKey) === pendingSession) {
        this._pendingSessionResolutions.delete(resourceKey);
        pendingSession.cancellationTokenSource.cancel();
      }
    };
    const cancellationListener = token.onCancellationRequested(release);
    return raceCancellationError(pendingSession.promise, token).finally(() => {
      cancellationListener.dispose();
      release();
    });
  }
  async _getOrCreateChatSession(sessionResource, token) {
    const sessionType = getChatSessionType(sessionResource);
    if (!await raceCancellationError(this.canResolveChatSession(sessionType), token)) {
      throw Error(`Cannot find provider '${sessionType}'`);
    }
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        return existingSessionData.session;
      }
    }
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    const provider = this._contentProviders.get(resolvedType);
    if (!provider) {
      throw Error(`Cannot find provider '${resolvedType}'`);
    }
    let session;
    const newSessionOptionGroups = isUntitledChatSession(sessionResource) ? await this.getNewChatSessionInputState(resolvedType, sessionResource) : void 0;
    if (isUntitledChatSession(sessionResource) && (newSessionOptionGroups || resolvedType.startsWith("agent-host-"))) {
      const options3 = /* @__PURE__ */ new Map();
      for (const group2 of newSessionOptionGroups ?? []) {
        const selected = group2.selected ?? group2.items.find((item) => item.default) ?? group2.items[0];
        if (selected) {
          options3.set(group2.id, selected);
        }
      }
      session = {
        sessionResource,
        onWillDispose: Event2.None,
        history: [],
        options: options3.size > 0 ? options3 : void 0,
        dispose: () => {
        }
      };
    } else {
      this._logService.trace(`[ChatSessionsService] getOrCreateChatSession: resolving content from provider '${resolvedType}' for ${sessionResource.toString()}`);
      const contentPromise = provider.provideChatSessionContent(sessionResource, token);
      void contentPromise.then((session2) => {
        if (token.isCancellationRequested) {
          session2.dispose();
        }
      }, () => {
      });
      session = await raceCancellationError(contentPromise, token);
      this._logService.trace(`[ChatSessionsService] getOrCreateChatSession: provider returned ${session.history.length} history item(s) for ${sessionResource.toString()}`);
    }
    if (session.options) {
      for (const [optionId, value2] of session.options) {
        this.setSessionOption(sessionResource, optionId, value2);
      }
    }
    {
      const existingSessionData = this._sessions.get(sessionResource);
      if (existingSessionData) {
        session.dispose();
        return existingSessionData.session;
      }
    }
    const sessionData = new ContributedChatSessionData(session, sessionType, sessionResource, session.options, (resource) => {
      sessionData.dispose();
      this._sessions.delete(resource);
    });
    this._sessions.set(sessionResource, sessionData);
    if (session.options) {
      this._onDidChangeSessionOptions.fire({ sessionResource, updates: session.options });
    }
    return session;
  }
  async getChatSessionHistory(sessionResource, token) {
    const existing = this._sessions.get(this._resolveResource(sessionResource));
    if (existing) {
      return [...existing.session.history];
    }
    if (isUntitledChatSession(sessionResource)) {
      return [];
    }
    const sessionType = getChatSessionType(sessionResource);
    const resolvedType = this._resolveToPrimaryType(sessionType) || sessionType;
    if (!await raceCancellationError(this.canResolveChatSession(resolvedType), token)) {
      throw Error(`Cannot find provider '${resolvedType}'`);
    }
    const provider = this._contentProviders.get(resolvedType);
    if (!provider) {
      throw Error(`Cannot find provider '${resolvedType}'`);
    }
    const session = await raceCancellationError(provider.provideChatSessionContent(sessionResource, token), token);
    try {
      return [...session.history];
    } finally {
      session.dispose();
    }
  }
  hasAnySessionOptions(sessionResource) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    return !!session && !!session.options && session.options.size > 0;
  }
  getSessionOptions(sessionResource) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    if (!session) {
      return void 0;
    }
    const result = /* @__PURE__ */ new Map();
    for (const [key3, value2] of session.getAllOptions()) {
      result.set(key3, typeof value2 === "string" ? value2 : value2.id);
    }
    return result.size > 0 ? result : void 0;
  }
  getSessionOption(sessionResource, optionId) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    return session?.getOption(optionId);
  }
  setSessionOption(sessionResource, optionId, value2) {
    return this.updateSessionOptions(sessionResource, /* @__PURE__ */ new Map([[optionId, value2]]));
  }
  updateSessionOptions(sessionResource, updates) {
    const session = this._sessions.get(this._resolveResource(sessionResource));
    if (!session) {
      return false;
    }
    let didChange = false;
    for (const [optionId, value2] of updates) {
      const existingValue = session.getOption(optionId);
      if (existingValue !== value2) {
        session.setOption(optionId, value2);
        didChange = true;
      }
    }
    if (didChange) {
      this._onDidChangeSessionOptions.fire({ sessionResource, updates });
    }
    return didChange;
  }
  /**
   * Resolve a resource through the alias map. If the resource is a real
   * resource that has been aliased to an untitled resource, return the
   * untitled resource (the canonical key in {@link _sessions}).
   */
  _resolveResource(resource) {
    return this._resourceAliases.get(resource) ?? resource;
  }
  registerSessionResourceAlias(untitledResource, realResource) {
    this._resourceAliases.set(realResource, untitledResource);
  }
  setMaterializedSessionResource(untitledResource, realResource) {
    this._realResources.set(untitledResource, realResource);
  }
  getMaterializedSessionResource(untitledResource) {
    return this._realResources.get(untitledResource);
  }
  clearMaterializedSessionResource(sessionResource) {
    this._realResources.delete(sessionResource);
    const untitled = this._resourceAliases.get(sessionResource);
    if (untitled) {
      this._realResources.delete(untitled);
    }
  }
  fireSessionCommitted(original, committed) {
    this._onDidCommitSession.fire({ original, committed });
  }
  /**
   * Store option groups for a session type
   */
  setOptionGroupsForSessionType(chatSessionType, handle2, optionGroups) {
    if (optionGroups) {
      this._sessionTypeOptions.set(chatSessionType, optionGroups);
    } else {
      this._sessionTypeOptions.delete(chatSessionType);
    }
    this._onDidChangeOptionGroups.fire(chatSessionType);
  }
  /**
   * Get available option groups for a session type
   */
  getOptionGroupsForSessionType(chatSessionType) {
    return this._sessionTypeOptions.get(chatSessionType);
  }
  async getNewChatSessionInputState(chatSessionType, sessionResource) {
    const controllerData = this._itemControllers.get(chatSessionType);
    if (controllerData?.controller.getNewChatSessionInputState) {
      const groups2 = await controllerData.controller.getNewChatSessionInputState(sessionResource, CancellationToken.None);
      if (groups2?.length) {
        this._sessionTypeOptions.set(chatSessionType, [...groups2]);
        this._onDidChangeOptionGroups.fire(chatSessionType);
      }
      return groups2;
    }
    const groups = this._sessionTypeOptions.get(chatSessionType);
    if (!groups?.length) {
      return void 0;
    }
    return groups;
  }
  /**
   * Get the capabilities for a specific session type
   */
  getCapabilitiesForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return contribution?.capabilities;
  }
  /**
   * Get the customAgentTarget for a specific session type.
   * When set, the mode picker should show filtered custom agents matching this target.
   */
  getCustomAgentTargetForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return contribution?.customAgentTarget ?? "undefined" /* Undefined */;
  }
  requiresCustomModelsForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return !!contribution?.requiresCustomModels;
  }
  supportsAutoModelForSessionType(chatSessionType) {
    if (chatSessionType === localChatSessionType) {
      return true;
    }
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return !!contribution?.supportsAutoModel;
  }
  supportsDelegationForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    return contribution?.supportsDelegation !== false;
  }
  requiresCopilotSignInForSessionType(chatSessionType) {
    const contribution = this._contributions.get(chatSessionType)?.contribution;
    if (!contribution) {
      return false;
    }
    const requires = contribution.requiresCopilotSignIn;
    return typeof requires === "function" ? requires() : !!requires;
  }
  sessionSupportsFork(sessionResource) {
    const session = this._sessions.get(sessionResource) ?? this._sessions.get(this._resolveResource(sessionResource));
    return !!session?.session.forkSession;
  }
  async forkChatSession(sessionResource, request2, token) {
    const session = this._sessions.get(sessionResource) ?? this._sessions.get(this._resolveResource(sessionResource));
    if (!session?.session.forkSession) {
      throw new Error(`Session ${sessionResource.toString()} does not support forking`);
    }
    return session.session.forkSession(request2, token);
  }
  sessionSupportsRename(sessionResource) {
    const session = this._sessions.get(sessionResource) ?? this._sessions.get(this._resolveResource(sessionResource));
    return !!session?.session.renameSession;
  }
  async renameChatSession(sessionResource, title, token) {
    const session = await this.getOrCreateChatSession(sessionResource, token);
    if (!session.renameSession) {
      throw new Error(`Session ${sessionResource.toString()} does not support renaming`);
    }
    return session.renameSession(title, token);
  }
  getContentProviderSchemes() {
    return Array.from(this._contentProviders.keys());
  }
};

ChatSessionsService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IChatAgentService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IInstantiationService)
], ChatSessionsService);

registerSingleton(IChatSessionsService, ChatSessionsService, 1 /* Delayed */);

function registerNewSessionInPlaceAction(type, displayName) {
  return registerAction2(class NewChatSessionInPlaceAction extends Action2 {
    constructor() {
      super({
        id: `workbench.action.chat.openNewChatSessionInPlace.${type}`,
        title: localize2(11124, "New {0} Session", displayName),
        category: CHAT_CATEGORY,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    // Expected args: [chatSessionPosition: 'sidebar' | 'editor']
    async run(accessor, ...args2) {
      if (args2.length === 0) {
        throw new BugIndicatingError("Expected chat session position argument");
      }
      const chatSessionPosition = args2[0];
      if (chatSessionPosition !== "sidebar" /* Sidebar */ && chatSessionPosition !== "editor" /* Editor */) {
        throw new BugIndicatingError(`Invalid chat session position argument: ${chatSessionPosition}`);
      }
      const activeEditor = accessor.get(IEditorGroupsService).activeGroup.activeEditor;
      const replaceEditorForResource = activeEditor instanceof ChatEditorInput ? activeEditor.sessionResource : void 0;
      await openChatSession(accessor, { type, displayName: localize(11083, null), position: chatSessionPosition, replaceEditorForResource });
    }
  });
}

function registerNewSessionExternalAction(type, displayName, resolveCommandId) {
  return registerAction2(class NewChatSessionExternalAction extends Action2 {
    constructor() {
      super({
        id: `workbench.action.chat.openNewChatSessionExternal.${type}`,
        title: localize2(11123, "New {0} Session", displayName),
        category: CHAT_CATEGORY,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      const logService = accessor.get(ILogService);
      const commandId = resolveCommandId();
      if (!commandId) {
        logService.warn(`[ChatSessionsService] No create command contributed to '${MenuId.AgentSessionsCreateSubMenu.id}' for chat session type '${type}'; cannot open a new session.`);
        return;
      }
      await commandService.executeCommand(commandId);
    }
  });
}

async function openChatSession(accessor, openOptions, chatSendOptions) {
  const viewsService = accessor.get(IViewsService);
  const chatService = accessor.get(IChatService);
  const chatSessionService = accessor.get(IChatSessionsService);
  const logService = accessor.get(ILogService);
  const editorGroupService = accessor.get(IEditorGroupsService);
  const editorService = accessor.get(IEditorService);
  const customizationHarnessService = accessor.get(ICustomizationHarnessService);
  const toolsService = accessor.get(ILanguageModelToolsService);
  const importConversationStore = accessor.get(IAgentHostImportConversationStore);
  const progressService = accessor.get(IProgressService);
  const sessionResource = getResourceForNewChatSession(openOptions);
  if (chatSendOptions?.importConversation && chatSendOptions.importConversation.turns.length > 0) {
    importConversationStore.set(sessionResource, chatSendOptions.importConversation);
  }
  let sessionsListSuppression;
  let transitionProgress;
  try {
    switch (openOptions.position) {
      case "sidebar" /* Sidebar */: {
        const view = await viewsService.openView(ChatViewId);
        if (chatSendOptions?.importConversation) {
          sessionsListSuppression = view.beginSessionsListSuppression();
          transitionProgress = new DeferredPromise();
          progressService.withProgress({ location: ChatViewId }, () => transitionProgress.p);
        }
        if (openOptions.type === AgentSessionProviders.Local) {
          await view.startNewLocalSession();
        } else {
          await view.loadSession(sessionResource, "explicitOverride");
        }
        view.focus();
        break;
      }
      case "editor" /* Editor */: {
        const options3 = {
          override: ChatEditorInput.EditorID,
          pinned: true,
          sessionTypeSelectionReason: "explicitOverride",
          ...openOptions.type === AgentSessionProviders.Local ? { explicitSessionType: localChatSessionType } : {},
          title: {
            fallback: localize(11088, null, openOptions.displayName)
          }
        };
        if (openOptions.replaceEditorForResource) {
          const sourceResource = openOptions.replaceEditorForResource;
          let replaced = false;
          for (const group2 of editorGroupService.groups) {
            const editor = group2.editors.find((e4) => e4 instanceof ChatEditorInput && isEqual2(e4.sessionResource, sourceResource));
            if (editor) {
              await editorService.replaceEditors([{ editor, replacement: { resource: sessionResource, options: options3 } }], group2);
              replaced = true;
              break;
            }
          }
          if (!replaced) {
            await editorService.openEditor({ resource: sessionResource, options: options3 });
          }
        } else {
          await editorService.openEditor({ resource: sessionResource, options: options3 });
        }
        break;
      }
      default:
        assertNever(openOptions.position, `Unknown chat session position: ${openOptions.position}`);
    }
  } catch (e4) {
    logService.error(`Failed to open '${openOptions.type}' chat session with openOptions: ${JSON.stringify(openOptions)}`, e4);
    sessionsListSuppression?.dispose();
    transitionProgress?.complete();
    return;
  }
  if (chatSendOptions) {
    try {
      if (chatSendOptions.initialSessionOptions) {
        chatSessionService.updateSessionOptions(sessionResource, normalizeSessionOptions(chatSendOptions.initialSessionOptions));
      }
      let attachedContext = chatSendOptions.attachedContext;
      const promptFile = await resolvePromptSlashCommand(chatSendOptions.prompt, sessionResource, customizationHarnessService, toolsService);
      if (promptFile) {
        attachedContext = [promptFile, ...attachedContext ?? []];
      }
      const result = await chatService.sendRequest(sessionResource, chatSendOptions.prompt, { agentIdSilent: openOptions.type, attachedContext });
      const newSessionResource = result.kind === "sent" || result.kind === "rejected" ? result.newSessionResource : void 0;
      if (newSessionResource && !isEqual2(newSessionResource, sessionResource)) {
        switch (openOptions.position) {
          case "sidebar" /* Sidebar */: {
            const view = await viewsService.openView(ChatViewId);
            await view.loadSession(newSessionResource);
            break;
          }
          case "editor" /* Editor */: {
            for (const group2 of editorGroupService.groups) {
              const editor = group2.editors.find((e4) => e4 instanceof ChatEditorInput && isEqual2(e4.sessionResource, sessionResource));
              if (editor) {
                await editorService.replaceEditors([{ editor, replacement: { resource: newSessionResource, options: { override: ChatEditorInput.EditorID, pinned: true } } }], group2);
                break;
              }
            }
            break;
          }
          default:
            assertNever(openOptions.position, `Unknown chat session position: ${openOptions.position}`);
        }
      }
    } catch (e4) {
      logService.error(`Failed to send initial request to '${openOptions.type}' chat session with contextOptions: ${JSON.stringify(chatSendOptions)}`, e4);
    }
  }
  sessionsListSuppression?.dispose();
  transitionProgress?.complete();
}

function normalizeSessionOptions(options3) {
  if (options3 instanceof Map) {
    return options3;
  }
  if (Array.isArray(options3)) {
    return new Map(options3.map((o) => [o.optionId, o.value]));
  }
  return ChatSessionOptionsMap.fromRecord(options3);
}

async function resolvePromptSlashCommand(prompt, sessionResource, customizationHarnessService, toolsService) {
  const slashMatch = prompt.match(slashReg);
  if (slashMatch) {
    const slashCommand = await customizationHarnessService.resolvePromptSlashCommand(slashMatch[1], sessionResource, CancellationToken.None);
    if (slashCommand) {
      const parseResult = slashCommand.parsedPromptFile;
      const refs = parseResult.body?.variableReferences.map(({ name, offset, fullLength }) => ({ name, range: new OffsetRange(offset, offset + fullLength) })) ?? [];
      const toolReferences = toolsService.toToolReferences(refs);
      return toPromptFileVariableEntry(parseResult.uri, "vscode.prompt.file" /* PromptFile */, void 0, true, toolReferences);
    }
  }
  return void 0;
}

function getResourceForNewChatSession(options3) {
  const isRemoteSession = options3.type !== AgentSessionProviders.Local;
  if (isRemoteSession) {
    return URI.from({
      scheme: options3.type,
      path: `/untitled-${generateUuid()}`
    });
  }
  const isEditorPosition = options3.position === "editor" /* Editor */;
  if (isEditorPosition) {
    return ChatEditorInput.getNewEditorUri();
  }
  return LocalChatSessionUri.getNewSessionUri();
}

function isAgentSessionProviderType(type) {
  return Object.values(AgentSessionProviders).includes(type);
}

function getSessionStatusForModel(model) {
  if (model.requestInProgress.get()) {
    return 2 /* InProgress */;
  }
  const lastRequest2 = model.getRequests().at(-1);
  if (lastRequest2?.response) {
    if (lastRequest2.response.state === 4 /* NeedsInput */) {
      return 3 /* NeedsInput */;
    } else if (lastRequest2.response.isCanceled || lastRequest2.response.result?.errorDetails?.code === "canceled") {
      return 1 /* Completed */;
    } else if (lastRequest2.response.result?.errorDetails) {
      return 0 /* Failed */;
    } else if (lastRequest2.response.isComplete) {
      return 1 /* Completed */;
    } else {
      return 2 /* InProgress */;
    }
  }
  return void 0;
}

function chatResponseStateToSessionStatus(state) {
  switch (state) {
    case 2 /* Cancelled */:
    case 1 /* Complete */:
      return 1 /* Completed */;
    case 3 /* Failed */:
      return 0 /* Failed */;
    case 0 /* Pending */:
      return 2 /* InProgress */;
    case 4 /* NeedsInput */:
      return 3 /* NeedsInput */;
  }
}
export { applyCodexAgentHostPreference, registerNewSessionInPlaceAction, registerNewSessionExternalAction, openChatSession, normalizeSessionOptions, resolvePromptSlashCommand, getResourceForNewChatSession, isAgentSessionProviderType, getSessionStatusForModel, chatResponseStateToSessionStatus, extensionPoint, codexExtensionHostAvailableWhen, ContributedChatSessionData, ChatSessionsService };
