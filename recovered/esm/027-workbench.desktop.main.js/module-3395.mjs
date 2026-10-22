// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatService.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { TerminalChatContextKeys } from "./module-1153.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { isNumber, isString } from "./module-0010.mjs";
import { TreeSitterCommandParser } from "./module-3345.mjs";
import { CommandLineAutoApprover } from "./module-3347.mjs";
import { OS } from "./module-0014.mjs";
import { generateAutoApproveActions } from "./module-3320.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatService } from "./module-0972.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatService.ts
var TerminalChatService = class extends Disposable {
  constructor(_logService, _terminalService, _storageService, _contextKeyService, _chatService, _instantiationService) {
    super();
    this._logService = _logService;
    this._terminalService = _terminalService;
    this._storageService = _storageService;
    this._contextKeyService = _contextKeyService;
    this._chatService = _chatService;
    this._instantiationService = _instantiationService;
    this._terminalInstancesByToolSessionId = /* @__PURE__ */ new Map();
    this._toolSessionIdByTerminalInstance = /* @__PURE__ */ new Map();
    this._chatSessionResourceByTerminalInstance = /* @__PURE__ */ new Map();
    this._terminalInstanceListenersByToolSessionId = this._register(new DisposableMap());
    this._chatSessionListenersByTerminalInstance = this._register(new DisposableMap());
    this._terminalInstancesByExecutionId = /* @__PURE__ */ new Map();
    this._terminalInstanceListenersByExecutionId = this._register(new DisposableMap());
    this._ahpCommandSources = /* @__PURE__ */ new Map();
    this._outputSources = /* @__PURE__ */ new Map();
    this._onDidContinueInBackground = this._register(new Emitter());
    this.onDidContinueInBackground = this._onDidContinueInBackground.event;
    this._onDidRegisterTerminalInstanceForToolSession = this._register(new Emitter());
    this.onDidRegisterTerminalInstanceWithToolSession = this._onDidRegisterTerminalInstanceForToolSession.event;
    this._activeProgressParts = /* @__PURE__ */ new Set();
    /**
     * Pending mappings restored from storage that have not yet been matched to a live terminal
     * instance (we match by persistentProcessId when it becomes available after reconnection).
     * toolSessionId -> persistentProcessId
     */
    this._pendingRestoredMappings = /* @__PURE__ */ new Map();
    /**
     * Tracks chat session resources that have auto approval enabled for all commands. This is a temporary
     * approval that lasts only for the duration of the session.
     */
    this._sessionAutoApprovalEnabled = new ResourceMap();
    /**
     * Tracks session-scoped auto-approve rules per chat session. These are temporary rules that
     * last only for the duration of the chat session (not persisted to disk).
     */
    this._sessionAutoApproveRules = new ResourceMap();
    this._hasToolTerminalContext = TerminalChatContextKeys.hasChatTerminals.bindTo(this._contextKeyService);
    this._hasHiddenToolTerminalContext = TerminalChatContextKeys.hasHiddenChatTerminals.bindTo(this._contextKeyService);
    this._restoreFromStorage();
    this._register(this._chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResources) {
        this._sessionAutoApproveRules.delete(resource);
        this._sessionAutoApprovalEnabled.delete(resource);
      }
    }));
    this._register(this._terminalService.onDidChangeInstances(() => this._updateHasToolTerminalContextKeys()));
  }
  registerTerminalInstanceWithToolSession(terminalToolSessionId, instance2) {
    if (!terminalToolSessionId) {
      this._logService.warn("Attempted to register a terminal instance with an undefined tool session ID");
      return;
    }
    const existingToolSessionId = this._toolSessionIdByTerminalInstance.get(instance2);
    if (existingToolSessionId === terminalToolSessionId) {
      return;
    }
    if (existingToolSessionId !== void 0) {
      this._terminalInstanceListenersByToolSessionId.deleteAndDispose(existingToolSessionId);
      this._terminalInstancesByToolSessionId.delete(existingToolSessionId);
    }
    this._terminalInstancesByToolSessionId.set(terminalToolSessionId, instance2);
    this._toolSessionIdByTerminalInstance.set(instance2, terminalToolSessionId);
    this._onDidRegisterTerminalInstanceForToolSession.fire(instance2);
    const instanceStore = new DisposableStore();
    instanceStore.add(instance2.onDisposed(() => {
      this._terminalInstancesByToolSessionId.delete(terminalToolSessionId);
      this._toolSessionIdByTerminalInstance.delete(instance2);
      this._terminalInstanceListenersByToolSessionId.deleteAndDispose(terminalToolSessionId);
      this._persistToStorage();
      this._updateHasToolTerminalContextKeys();
    }));
    instanceStore.add(this._chatService.onDidDisposeSession((e) => {
      for (const resource of e.sessionResources) {
        if (LocalChatSessionUri.parseLocalSessionId(resource) === terminalToolSessionId) {
          this._terminalInstancesByToolSessionId.delete(terminalToolSessionId);
          this._toolSessionIdByTerminalInstance.delete(instance2);
          this._terminalInstanceListenersByToolSessionId.deleteAndDispose(terminalToolSessionId);
          this._sessionAutoApprovalEnabled.delete(resource);
          this._persistToStorage();
          this._updateHasToolTerminalContextKeys();
        }
      }
    }));
    this._terminalInstanceListenersByToolSessionId.set(terminalToolSessionId, instanceStore);
    if (isNumber(instance2.shellLaunchConfig?.attachPersistentProcess?.id) || isNumber(instance2.persistentProcessId)) {
      this._persistToStorage();
    }
    this._updateHasToolTerminalContextKeys();
  }
  async getTerminalInstanceByToolSessionId(terminalToolSessionId) {
    await this._terminalService.whenConnected;
    if (!terminalToolSessionId) {
      return void 0;
    }
    const pendingAhp = this._ahpCommandSources.get(terminalToolSessionId);
    if (pendingAhp) {
      try {
        return await pendingAhp.promisedTerminal;
      } catch (error) {
        this._logService.error(`Failed to resolve AHP terminal for tool session '${terminalToolSessionId}'`, error);
        return void 0;
      }
    }
    if (this._pendingRestoredMappings.has(terminalToolSessionId)) {
      const instance2 = this._terminalService.instances.find((i2) => i2.shellLaunchConfig.attachPersistentProcess?.id === this._pendingRestoredMappings.get(terminalToolSessionId));
      if (instance2) {
        this._tryAdoptRestoredMapping(instance2);
        return instance2;
      }
    }
    return this._terminalInstancesByToolSessionId.get(terminalToolSessionId);
  }
  getToolSessionTerminalInstances(hiddenOnly) {
    if (hiddenOnly) {
      const foregroundInstances = new Set(this._terminalService.foregroundInstances.map((i2) => i2.instanceId));
      const uniqueInstances = new Set(this._terminalInstancesByToolSessionId.values());
      return Array.from(uniqueInstances).filter((i2) => !foregroundInstances.has(i2.instanceId));
    }
    return Array.from(new Set(this._terminalInstancesByToolSessionId.values()));
  }
  getToolSessionIdForInstance(instance2) {
    return this._toolSessionIdByTerminalInstance.get(instance2);
  }
  registerTerminalInstanceWithExecutionId(terminalExecutionId, instance2) {
    this._terminalInstanceListenersByExecutionId.deleteAndDispose(terminalExecutionId);
    this._terminalInstancesByExecutionId.set(terminalExecutionId, instance2);
    const instanceStore = new DisposableStore();
    const unregister = () => {
      if (this._terminalInstancesByExecutionId.get(terminalExecutionId) !== instance2) {
        return;
      }
      this._terminalInstancesByExecutionId.delete(terminalExecutionId);
      this._terminalInstanceListenersByExecutionId.deleteAndDispose(terminalExecutionId);
    };
    instanceStore.add(instance2.onDisposed(unregister));
    this._terminalInstanceListenersByExecutionId.set(terminalExecutionId, instanceStore);
    return toDisposable(unregister);
  }
  getTerminalInstanceByExecutionId(terminalExecutionId) {
    return this._terminalInstancesByExecutionId.get(terminalExecutionId);
  }
  registerTerminalInstanceWithChatSession(chatSessionResource, instance2) {
    const existingResource = this._chatSessionResourceByTerminalInstance.get(instance2);
    if (existingResource && existingResource.toString() === chatSessionResource.toString()) {
      return;
    }
    this._chatSessionListenersByTerminalInstance.deleteAndDispose(instance2);
    this._chatSessionResourceByTerminalInstance.set(instance2, chatSessionResource);
    const disposable = instance2.onDisposed(() => {
      this._chatSessionResourceByTerminalInstance.delete(instance2);
      this._chatSessionListenersByTerminalInstance.deleteAndDispose(instance2);
    });
    this._chatSessionListenersByTerminalInstance.set(instance2, disposable);
  }
  getChatSessionResourceForInstance(instance2) {
    return this._chatSessionResourceByTerminalInstance.get(instance2);
  }
  registerOutputSource(terminalToolSessionId, source) {
    this._outputSources.set(terminalToolSessionId, source);
    for (const part of this._activeProgressParts) {
      part.didRegisterOutputSource(terminalToolSessionId);
    }
    return toDisposable(() => {
      if (this._outputSources.get(terminalToolSessionId) === source) {
        this._outputSources.delete(terminalToolSessionId);
      }
    });
  }
  getOutputSource(terminalToolSessionId) {
    return terminalToolSessionId ? this._outputSources.get(terminalToolSessionId) : void 0;
  }
  isBackgroundTerminal(terminalToolSessionId) {
    if (!terminalToolSessionId) {
      return false;
    }
    const instance2 = this._terminalInstancesByToolSessionId.get(terminalToolSessionId);
    if (!instance2) {
      return false;
    }
    return this._terminalService.instances.includes(instance2) && !this._terminalService.foregroundInstances.includes(instance2);
  }
  registerProgressPart(part) {
    this._activeProgressParts.add(part);
    if (this._isAfter(part, this._mostRecentProgressPart)) {
      this._mostRecentProgressPart = part;
    }
    return toDisposable(() => {
      this._activeProgressParts.delete(part);
      if (this._focusedProgressPart === part) {
        this._focusedProgressPart = void 0;
      }
      if (this._mostRecentProgressPart === part) {
        this._mostRecentProgressPart = this._getLastActiveProgressPart();
      }
    });
  }
  setFocusedProgressPart(part) {
    this._focusedProgressPart = part;
  }
  clearFocusedProgressPart(part) {
    if (this._focusedProgressPart === part) {
      this._focusedProgressPart = void 0;
    }
  }
  getFocusedProgressPart() {
    return this._focusedProgressPart;
  }
  getMostRecentProgressPart() {
    if (!this._mostRecentProgressPart || !this._activeProgressParts.has(this._mostRecentProgressPart)) {
      this._mostRecentProgressPart = this._getLastActiveProgressPart();
    }
    return this._mostRecentProgressPart;
  }
  _getLastActiveProgressPart() {
    let latest;
    for (const part of this._activeProgressParts) {
      if (this._isAfter(part, latest)) {
        latest = part;
      }
    }
    return latest;
  }
  _isAfter(candidate, current) {
    if (!current) {
      return true;
    }
    if (candidate.elementIndex === current.elementIndex) {
      return candidate.contentIndex >= current.contentIndex;
    }
    return candidate.elementIndex > current.elementIndex;
  }
  _restoreFromStorage() {
    try {
      const raw = this._storageService.get("terminalChat.toolSessionMappings" /* ToolSessionMappings */, 1 /* WORKSPACE */);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      for (const [toolSessionId, persistentProcessId] of parsed) {
        if (isString(toolSessionId) && isNumber(persistentProcessId)) {
          this._pendingRestoredMappings.set(toolSessionId, persistentProcessId);
        }
      }
    } catch (err) {
      this._logService.warn("Failed to restore terminal chat tool session mappings", err);
    }
  }
  _tryAdoptRestoredMapping(instance2) {
    if (this._pendingRestoredMappings.size === 0) {
      return;
    }
    for (const [toolSessionId, persistentProcessId] of this._pendingRestoredMappings) {
      if (persistentProcessId === instance2.shellLaunchConfig.attachPersistentProcess?.id) {
        this._terminalInstancesByToolSessionId.set(toolSessionId, instance2);
        this._toolSessionIdByTerminalInstance.set(instance2, toolSessionId);
        this._onDidRegisterTerminalInstanceForToolSession.fire(instance2);
        this._terminalInstanceListenersByToolSessionId.set(toolSessionId, instance2.onDisposed(() => {
          this._terminalInstancesByToolSessionId.delete(toolSessionId);
          this._toolSessionIdByTerminalInstance.delete(instance2);
          this._terminalInstanceListenersByToolSessionId.deleteAndDispose(toolSessionId);
          this._persistToStorage();
        }));
        this._pendingRestoredMappings.delete(toolSessionId);
        this._persistToStorage();
        break;
      }
    }
  }
  _persistToStorage() {
    this._updateHasToolTerminalContextKeys();
    try {
      const entries2 = [];
      for (const [toolSessionId, instance2] of this._terminalInstancesByToolSessionId.entries()) {
        const persistentId = isNumber(instance2.persistentProcessId) ? instance2.persistentProcessId : instance2.shellLaunchConfig.attachPersistentProcess?.id;
        const shouldPersist = instance2.shouldPersist || instance2.shellLaunchConfig.forcePersist;
        if (isNumber(persistentId) && shouldPersist) {
          entries2.push([toolSessionId, persistentId]);
        }
      }
      if (entries2.length > 0) {
        this._storageService.store("terminalChat.toolSessionMappings" /* ToolSessionMappings */, JSON.stringify(entries2), 1 /* WORKSPACE */, 1 /* MACHINE */);
      } else {
        this._storageService.remove("terminalChat.toolSessionMappings" /* ToolSessionMappings */, 1 /* WORKSPACE */);
      }
    } catch (err) {
      this._logService.warn("Failed to persist terminal chat tool session mappings", err);
    }
  }
  _updateHasToolTerminalContextKeys() {
    const toolCount = this._terminalInstancesByToolSessionId.size;
    this._hasToolTerminalContext.set(toolCount > 0);
    const hiddenTerminalCount = this.getToolSessionTerminalInstances(true).length;
    this._hasHiddenToolTerminalContext.set(hiddenTerminalCount > 0);
  }
  setChatSessionAutoApproval(chatSessionResource, enabled) {
    if (enabled) {
      this._sessionAutoApprovalEnabled.set(chatSessionResource, true);
    } else {
      this._sessionAutoApprovalEnabled.delete(chatSessionResource);
    }
  }
  hasChatSessionAutoApproval(chatSessionResource) {
    return this._sessionAutoApprovalEnabled.has(chatSessionResource);
  }
  addSessionAutoApproveRule(chatSessionResource, key3, value2) {
    let sessionRules = this._sessionAutoApproveRules.get(chatSessionResource);
    if (!sessionRules) {
      sessionRules = {};
      this._sessionAutoApproveRules.set(chatSessionResource, sessionRules);
    }
    sessionRules[key3] = value2;
  }
  getSessionAutoApproveRules(chatSessionResource) {
    return this._sessionAutoApproveRules.get(chatSessionResource) ?? {};
  }
  async getAutoApproveActions(commandLine, language2) {
    const trimmedCommandLine = commandLine.trimStart();
    if (trimmedCommandLine.length === 0) {
      return void 0;
    }
    this._autoApproveCommandParser ??= this._register(this._instantiationService.createInstance(TreeSitterCommandParser));
    const treeSitterLanguage = language2 === "powershell" ? "powershell" /* PowerShell */ : "bash" /* Bash */;
    let subCommands;
    try {
      const parseResult = await this._autoApproveCommandParser.extractAutoApprovalSubCommands(treeSitterLanguage, trimmedCommandLine);
      if (parseResult.hasUnanalyzableSyntax) {
        return void 0;
      }
      subCommands = parseResult.subCommands;
    } catch (e) {
      this._logService.warn("Failed to parse sub-commands when generating auto approve actions", e);
      return void 0;
    }
    if (subCommands.length === 0) {
      return void 0;
    }
    const shell = language2 === "powershell" ? "pwsh" : "bash";
    const evaluator = this._autoApproveEvaluator ??= this._register(this._instantiationService.createInstance(CommandLineAutoApprover));
    const subCommandResults = await Promise.all(subCommands.map((e) => evaluator.isCommandAutoApproved(e, shell, OS, void 0)));
    const commandLineResult = evaluator.isCommandLineAutoApproved(trimmedCommandLine);
    return generateAutoApproveActions(trimmedCommandLine, subCommands, { subCommandResults, commandLineResult }, { skipSessionScoped: true });
  }
  continueInBackground(terminalToolSessionId) {
    this._onDidContinueInBackground.fire(terminalToolSessionId);
    for (const part of this._activeProgressParts) {
      if (part.terminalToolSessionId === terminalToolSessionId) {
        part.markContinuedInBackground();
      }
    }
  }
  registerAhpCommandSource(terminalToolSessionId, source, promisedTerminal) {
    this._ahpCommandSources.set(terminalToolSessionId, { source, promisedTerminal });
    return toDisposable(() => {
      if (this._ahpCommandSources.get(terminalToolSessionId)?.source === source) {
        this._ahpCommandSources.delete(terminalToolSessionId);
      }
    });
  }
  getAhpCommandSource(terminalToolSessionId) {
    return this._ahpCommandSources.get(terminalToolSessionId)?.source;
  }
};

TerminalChatService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IInstantiationService)
], TerminalChatService);
export { TerminalChatService };
