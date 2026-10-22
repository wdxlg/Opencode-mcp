// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/editor/chatEditorInput.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { EditorInput } from "./module-0929.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { LocalChatSessionUri, getChatSessionType, getNewChatSessionResource, isUntitledChatSession } from "./module-0962.mjs";
import { IChatSessionsService, isAgentHostTarget, localChatSessionType } from "./module-0961.mjs";
import { ChatEditorTitleMaxLength, getDefaultNewChatSessionType, getDefaultNewChatSessionTypeAndReasonFromServices, getLocalFallbackSessionTypeSelectionReason, isNewChatSessionTypeUsable } from "./module-0965.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { truncate } from "./module-0030.mjs";
import { migratedCopilotCliResource } from "./module-1110.mjs";
import { LEGACY_MIGRATION_RESTORE_TIMEOUT_MS, adoptLegacyCopilotCliResource } from "./module-1111.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { IAgentHostConnectionsService } from "./module-0960.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProgressService } from "./module-0446.mjs";
import { revive } from "./module-0265.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/editor/chatEditorInput.ts
var ChatEditorIcon = registerIcon("chat-editor-label-icon", Codicon.chatSparkle, localize(12687, null));

var ChatEditorInput = class extends EditorInput {
  constructor(resource, options3, chatService, dialogService, configurationService, chatSessionsService, instantiationService, storageService, logService, workspaceContextService, agentHostEnablementService, agentHostConnectionsService, telemetryService, progressService) {
    super();
    this.resource = resource;
    this.options = options3;
    this.chatService = chatService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.chatSessionsService = chatSessionsService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.logService = logService;
    this.workspaceContextService = workspaceContextService;
    this.agentHostEnablementService = agentHostEnablementService;
    this.agentHostConnectionsService = agentHostConnectionsService;
    this.telemetryService = telemetryService;
    this.progressService = progressService;
    this.didTransferOutEditingSession = false;
    this.modelRef = this._register(new MutableDisposable());
    this._modelChangeListener = this._register(new MutableDisposable());
    this.closeHandler = this;
    if (resource.scheme === Schemas.vscodeChatEditor) {
      const parsed = ChatEditorUri.parse(resource);
      if (!parsed || typeof parsed !== "number") {
        throw new Error("Invalid chat URI");
      }
    } else if (resource.scheme === Schemas.vscodeLocalChatSession) {
      const localSessionId = LocalChatSessionUri.parseLocalSessionId(resource);
      if (!localSessionId) {
        throw new Error("Invalid local chat session URI");
      }
      this._sessionResource = resource;
    } else {
      this._sessionResource = resource;
    }
  }
  static {
    this.TypeID = "workbench.input.chatSession";
  }
  static {
    this.EditorID = "workbench.editor.chatSession";
  }
  /**
   * Get the uri of the session this editor input is associated with.
   *
   * This should be preferred over using `resource` directly, as it handles cases where a chat editor becomes a session
   */
  get sessionResource() {
    return this._sessionResource;
  }
  get model() {
    return this.modelRef.value?.object;
  }
  static getNewEditorUri() {
    return ChatEditorUri.getNewEditorUri();
  }
  showConfirm() {
    return !!(this.model && shouldShowClearEditingSessionConfirmation(this.model));
  }
  transferOutEditingSession() {
    this.didTransferOutEditingSession = true;
    return this.model?.editingSession;
  }
  async confirm(editors) {
    if (!this.model?.editingSession || this.didTransferOutEditingSession || this.getSessionType() !== localChatSessionType) {
      return 0 /* SAVE */;
    }
    const titleOverride = localize(12686, null);
    const messageOverride = localize(12683, null);
    const result = await showClearEditingSessionConfirmation(this.model, this.dialogService, { titleOverride, messageOverride });
    return result ? 0 /* SAVE */ : 2 /* CANCEL */;
  }
  get editorId() {
    return ChatEditorInput.EditorID;
  }
  get capabilities() {
    return super.capabilities | 1024 /* ForceReveal */ | 128 /* CanDropIntoEditor */;
  }
  copy() {
    return this.instantiationService.createInstance(ChatEditorInput, this.getNewResourceForCopy(), { sessionTypeSelectionReason: "currentSession" });
  }
  /**
   * A split or duplicate opens a new, empty chat of the same session type as the
   * source, falling back to a generic editor URI when that type is unknown or
   * cannot start a new session.
   */
  getNewResourceForCopy() {
    const sourceType = this._sessionResource ? getChatSessionType(this._sessionResource) : void 0;
    if (sourceType !== void 0 && (sourceType === localChatSessionType || isAgentHostTarget(sourceType)) && isNewChatSessionTypeUsable(sourceType, this.configurationService, this.chatSessionsService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.enabled.get())) {
      return getNewChatSessionResource(sourceType);
    }
    return ChatEditorInput.getNewEditorUri();
  }
  matches(otherInput) {
    if (!(otherInput instanceof ChatEditorInput)) {
      return false;
    }
    return isEqual2(this.sessionResource, otherInput.sessionResource);
  }
  get typeId() {
    return ChatEditorInput.TypeID;
  }
  getName() {
    if (this.model?.title) {
      return this.model.hasCustomTitle ? this.model.title : truncate(this.model.title, ChatEditorTitleMaxLength);
    }
    if (this._sessionResource) {
      const existingSession = this.chatService.getSession(this._sessionResource);
      if (existingSession?.title) {
        return existingSession.title;
      }
      const persistedTitle = this.chatService.getSessionTitle(this._sessionResource);
      if (persistedTitle && persistedTitle.trim()) {
        return persistedTitle;
      }
    }
    if (this.options.title?.preferred) {
      return this.options.title.preferred;
    }
    return this.options.title?.fallback ?? localize(12688, null);
  }
  getTitle(verbosity) {
    const name = this.getName();
    if (verbosity === 2 /* LONG */) {
      const sessionTypeDisplayName = this.getSessionTypeDisplayName();
      if (sessionTypeDisplayName) {
        return `${name} | ${sessionTypeDisplayName}`;
      }
    }
    return name;
  }
  getSessionTypeDisplayName() {
    const sessionType = this.getSessionType();
    if (sessionType === localChatSessionType) {
      return;
    }
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    const contribution = contributions.find((c) => c.type === sessionType);
    return contribution?.displayName;
  }
  getIcon() {
    const resolvedIcon = this.resolveIcon();
    if (resolvedIcon) {
      this.cachedIcon = resolvedIcon;
      return resolvedIcon;
    }
    return ChatEditorIcon;
  }
  resolveIcon() {
    const sessionType = this.getSessionType();
    if (sessionType !== localChatSessionType) {
      return this.chatSessionsService.getChatSessionContribution(sessionType)?.icon;
    }
    return void 0;
  }
  /**
   * Returns chat session type from a URI, or {@linkcode localChatSessionType} if not specified or cannot be determined.
   */
  getSessionType() {
    return getChatSessionType(this._sessionResource ?? this.resource);
  }
  async resolve() {
    const searchParams = new URLSearchParams(this.resource.query);
    const chatSessionType = searchParams.get("chatSessionType");
    const inputType = chatSessionType ?? this.resource.authority;
    if (this._sessionResource) {
      if (migratedCopilotCliResource(this._sessionResource)) {
        const migrated = await this.progressService.withProgress(
          { location: 10 /* Window */, title: localize(12679, null) },
          () => adoptLegacyCopilotCliResource(
            this.agentHostConnectionsService.ambientConnection,
            this._sessionResource,
            this.logService,
            this.configurationService,
            this.telemetryService,
            "restore",
            LEGACY_MIGRATION_RESTORE_TIMEOUT_MS
          )
        );
        if (migrated) {
          this._sessionResource = migrated;
        }
      }
      try {
        this.modelRef.value = await this.chatService.acquireOrLoadSession(this._sessionResource, "panel" /* Chat */, CancellationToken.None, "ChatEditorInput#resolve", this.options.sessionTypeSelectionReason);
      } catch (error) {
        this.logService.warn(`[ChatEditorInput] Failed to acquire session ${this._sessionResource.toString()}`, error);
      }
      if (!this.model && isUntitledChatSession(this._sessionResource) && getChatSessionType(this._sessionResource) !== localChatSessionType) {
        this.logService.warn(`[ChatEditorInput] Falling back to a local chat session because ${this._sessionResource.toString()} could not be acquired`);
        this.modelRef.value = this.chatService.startNewLocalSession("panel" /* Chat */, { canUseTools: !inputType, debugOwner: "ChatEditorInput#resolveUntitledFallback", sessionTypeSelectionReason: getLocalFallbackSessionTypeSelectionReason(getChatSessionType(this._sessionResource), false) });
      }
      if (this.shouldReplaceEmptyLocalSession(this._sessionResource)) {
        const defaultTypeAndReason = getDefaultNewChatSessionTypeAndReasonFromServices(this.configurationService, this.chatSessionsService, this.storageService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
        const defaultResource = getNewChatSessionResource(defaultTypeAndReason.sessionType);
        if (getChatSessionType(defaultResource) !== localChatSessionType) {
          let modelRef;
          try {
            modelRef = await this.chatService.acquireOrLoadSession(defaultResource, "panel" /* Chat */, CancellationToken.None, "ChatEditorInput#resolveDefaultSession", defaultTypeAndReason.selectionReason);
          } catch (error) {
            this.logService.warn(`[ChatEditorInput] Failed to acquire default session ${defaultResource.toString()}`, error);
          }
          if (modelRef) {
            this._sessionResource = defaultResource;
            this.modelRef.value = modelRef;
          } else {
            this.logService.warn(`[ChatEditorInput] Keeping local chat session because default session ${defaultResource.toString()} could not be acquired`);
          }
        }
      }
      if (!this.model && LocalChatSessionUri.parseLocalSessionId(this._sessionResource)) {
        this.modelRef.value = this.chatService.startNewLocalSession("panel" /* Chat */, { canUseTools: true, debugOwner: "ChatEditorInput#resolveNewLocalSession", sessionTypeSelectionReason: this.options.sessionTypeSelectionReason });
      }
    } else if (!this.options.target) {
      if (this.options.explicitSessionType === localChatSessionType) {
        this.modelRef.value = this.chatService.startNewLocalSession("panel" /* Chat */, { canUseTools: !inputType, debugOwner: "ChatEditorInput#resolveExplicitLocal", sessionTypeSelectionReason: this.options.sessionTypeSelectionReason ?? "explicitOverride" });
      } else {
        const defaultTypeAndReason = getDefaultNewChatSessionTypeAndReasonFromServices(this.configurationService, this.chatSessionsService, this.storageService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
        const defaultResource = getNewChatSessionResource(defaultTypeAndReason.sessionType);
        if (getChatSessionType(defaultResource) === localChatSessionType) {
          this.modelRef.value = this.chatService.startNewLocalSession("panel" /* Chat */, { canUseTools: !inputType, debugOwner: "ChatEditorInput#resolveUntitled", sessionTypeSelectionReason: defaultTypeAndReason.selectionReason });
        } else {
          try {
            this.modelRef.value = await this.chatService.acquireOrLoadSession(defaultResource, "panel" /* Chat */, CancellationToken.None, "ChatEditorInput#resolveDefaultUntitled", defaultTypeAndReason.selectionReason);
          } catch (error) {
            this.logService.warn(`[ChatEditorInput] Failed to acquire default session ${defaultResource.toString()}`, error);
          }
          if (this.model) {
            this._sessionResource = defaultResource;
          } else {
            this.logService.warn(`[ChatEditorInput] Falling back to a local chat session because ${defaultResource.toString()} could not be acquired`);
            this.modelRef.value = this.chatService.startNewLocalSession("panel" /* Chat */, { canUseTools: !inputType, debugOwner: "ChatEditorInput#resolveUntitledFallback", sessionTypeSelectionReason: getLocalFallbackSessionTypeSelectionReason(getChatSessionType(defaultResource), false) });
          }
        }
      }
    } else if (this.options.target.data) {
      this.modelRef.value = this.chatService.loadSessionFromData(this.options.target.data, "ChatEditorInput#resolveImportedData");
    }
    if (!this.model || this.isDisposed()) {
      return null;
    }
    this._sessionResource = this.model.sessionResource;
    this._trackModelChanges();
    const newIcon = this.resolveIcon();
    if (newIcon && (!this.cachedIcon || !this.iconsEqual(this.cachedIcon, newIcon))) {
      this.cachedIcon = newIcon;
    }
    this._onDidChangeLabel.fire();
    return this._register(new ChatEditorModel(this.model));
  }
  shouldReplaceEmptyLocalSession(sessionResource) {
    return LocalChatSessionUri.isLocalSession(sessionResource) && this.options.explicitSessionType !== localChatSessionType && !!this.model && !this.model.hasRequests && getDefaultNewChatSessionType(this.configurationService, this.chatSessionsService, this.storageService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get()) !== localChatSessionType;
  }
  /**
   * Updates the editor input to track a new model. Called when the widget swaps
   * from an untitled session to a real session.
   */
  updateModel(model) {
    this._sessionResource = model.sessionResource;
    this.modelRef.value = this.chatService.acquireExistingSession(model.sessionResource, "ChatEditorInput#updateModel");
    this._trackModelChanges();
    this.cachedIcon = void 0;
    this._onDidChangeLabel.fire();
  }
  _trackModelChanges() {
    if (!this.model) {
      return;
    }
    this._modelChangeListener.value = this.model.onDidChange(() => {
      this.cachedIcon = void 0;
      this._onDidChangeLabel.fire();
    });
  }
  iconsEqual(a, b) {
    if (ThemeIcon.isThemeIcon(a) && ThemeIcon.isThemeIcon(b)) {
      return a.id === b.id;
    }
    if (a instanceof URI && b instanceof URI) {
      return a.toString() === b.toString();
    }
    return false;
  }
};

ChatEditorInput = __decorateClass([
  __decorateParam(2, IChatService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IChatSessionsService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IAgentHostEnablementService),
  __decorateParam(11, IAgentHostConnectionsService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IProgressService)
], ChatEditorInput);

var ChatEditorModel = class extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this._isResolved = false;
  }
  async resolve() {
    this._isResolved = true;
  }
  isResolved() {
    return this._isResolved;
  }
  isDisposed() {
    return this._store.isDisposed;
  }
};

var ChatEditorUri;

((ChatEditorUri2) => {
  const scheme = Schemas.vscodeChatEditor;
  function getNewEditorUri() {
    const handle2 = Math.floor(Math.random() * 1e9);
    return URI.from({ scheme, path: `chat-${handle2}` });
  }
  ChatEditorUri2.getNewEditorUri = getNewEditorUri;
  function parse14(resource) {
    if (resource.scheme !== scheme) {
      return void 0;
    }
    const match2 = resource.path.match(/chat-(\d+)/);
    const handleStr = match2?.[1];
    if (typeof handleStr !== "string") {
      return void 0;
    }
    const handle2 = parseInt(handleStr);
    if (isNaN(handle2)) {
      return void 0;
    }
    return handle2;
  }
  ChatEditorUri2.parse = parse14;
})(ChatEditorUri || (ChatEditorUri = {}));

var ChatEditorInputSerializer = class {
  canSerialize(input) {
    return input instanceof ChatEditorInput && !!input.sessionResource;
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    const obj = {
      options: { ...input.options, sessionTypeSelectionReason: void 0 },
      sessionResource: input.sessionResource,
      resource: input.resource
    };
    return JSON.stringify(obj);
  }
  deserialize(instantiationService, serializedEditor) {
    try {
      const parsed = revive(JSON.parse(serializedEditor));
      if (parsed.sessionResource) {
        const sessionResource = URI.revive(parsed.sessionResource);
        return instantiationService.createInstance(ChatEditorInput, sessionResource, parsed.options);
      }
      let resource = URI.revive(parsed.resource);
      if (resource.scheme === Schemas.vscodeChatEditor && parsed.sessionId) {
        resource = LocalChatSessionUri.forSession(parsed.sessionId);
      }
      return instantiationService.createInstance(ChatEditorInput, resource, parsed.options);
    } catch (err) {
      return void 0;
    }
  }
};

async function showClearEditingSessionConfirmation(model, dialogService, options3) {
  const undecidedEdits = shouldShowClearEditingSessionConfirmation(model, options3);
  if (!undecidedEdits) {
    return true;
  }
  const defaultPhrase = localize(12684, null);
  const defaultTitle = localize(12685, null);
  const phrase = options3?.messageOverride ?? defaultPhrase;
  const title = options3?.titleOverride ?? defaultTitle;
  const { result } = await dialogService.prompt({
    title,
    message: phrase + " " + localize(12682, null, undecidedEdits),
    type: "info",
    cancelButton: true,
    buttons: [
      {
        label: localize(12680, null),
        run: async () => {
          await model.editingSession.accept();
          return true;
        }
      },
      {
        label: localize(12681, null),
        run: async () => {
          await model.editingSession.reject();
          return true;
        }
      }
    ]
  });
  return Boolean(result);
}

function shouldShowClearEditingSessionConfirmation(model, options3) {
  if (!model.editingSession || model.willKeepAlive && !options3?.isArchiveAction) {
    return 0;
  }
  const currentEdits = model.editingSession.entries.get();
  const undecidedEdits = currentEdits.filter((edit3) => edit3.state.get() === 0 /* Modified */);
  return undecidedEdits.length;
}
export { showClearEditingSessionConfirmation, shouldShowClearEditingSessionConfirmation, ChatEditorIcon, ChatEditorInput, ChatEditorModel, ChatEditorUri, ChatEditorInputSerializer };
