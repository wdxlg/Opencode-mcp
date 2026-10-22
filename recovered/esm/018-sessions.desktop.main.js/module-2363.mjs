// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatTipService.ts
import { ChatTipStorageKeys, TipTrackingCommands } from "./module-2360.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TipEligibilityTracker } from "./module-2361.mjs";
import { TIP_CATALOG, extractCommandIds } from "./module-2362.mjs";
import { CreateSlashCommandsUsageTracker } from "./module-2359.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart } from "./module-0988.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { getSelectedModelIdentifier } from "./module-2040.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatService } from "./module-0973.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/browser/chatTipService.ts
var ATTACH_FILES_REFERENCE_TRACKING_COMMAND = TipTrackingCommands.AttachFilesReferenceUsed;

var CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND = TipTrackingCommands.CreateAgentInstructionsUsed;

var CREATE_PROMPT_TRACKING_COMMAND = TipTrackingCommands.CreatePromptUsed;

var CREATE_AGENT_TRACKING_COMMAND = TipTrackingCommands.CreateAgentUsed;

var CREATE_SKILL_TRACKING_COMMAND = TipTrackingCommands.CreateSkillUsed;

var FORK_CONVERSATION_TRACKING_COMMAND = TipTrackingCommands.ForkConversationUsed;

var IChatTipService = createDecorator("chatTipService");

var ChatTipService = class extends Disposable {
  constructor(_productService, _configurationService, _storageService, _chatService, instantiationService, _logService, _chatEntitlementService, _commandService, _telemetryService, _keybindingService, _assignmentService, _chatWidgetService) {
    super();
    this._productService = _productService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._chatService = _chatService;
    this._logService = _logService;
    this._chatEntitlementService = _chatEntitlementService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._keybindingService = _keybindingService;
    this._assignmentService = _assignmentService;
    this._chatWidgetService = _chatWidgetService;
    this._onDidDismissTip = this._register(new Emitter());
    this.onDidDismissTip = this._onDidDismissTip.event;
    this._onDidNavigateTip = this._register(new Emitter());
    this.onDidNavigateTip = this._onDidNavigateTip.event;
    this._onDidHideTip = this._register(new Emitter());
    this.onDidHideTip = this._onDidHideTip.event;
    this._onDidDisableTips = this._register(new Emitter());
    this.onDidDisableTips = this._onDidDisableTips.event;
    this._tipsHiddenForSession = false;
    this._tipCommandListener = this._register(new MutableDisposable());
    this._experimentalTipMessages = /* @__PURE__ */ new Map();
    this._tracker = this._register(instantiationService.createInstance(TipEligibilityTracker, TIP_CATALOG));
    this._createSlashCommandsUsageTracker = this._register(new CreateSlashCommandsUsageTracker(this._chatService, this._storageService, () => this._contextKeyService));
    this._fetchExperimentalTipMessages();
    this._register(this._assignmentService.onDidRefetchAssignments(() => this._fetchExperimentalTipMessages()));
    this._register(this._chatEntitlementService.onDidChangeQuotaExceeded(() => {
      if (this._chatEntitlementService.quotas.chat?.percentRemaining === 0 && this._shownTip) {
        this.hideTip();
      }
    }));
    this._register(this._chatService.onDidSubmitRequest((e4) => {
      const message = e4.message ?? this._chatService.getSession(e4.chatSessionResource)?.lastRequest?.message;
      if (!message) {
        return;
      }
      if (this._hasFileOrFolderReference(message)) {
        this._tracker.recordCommandExecuted(TipTrackingCommands.AttachFilesReferenceUsed);
      }
      const slashCommandTrackingId = this._getSlashCommandTrackingId(message);
      if (slashCommandTrackingId) {
        this._tracker.recordCommandExecuted(slashCommandTrackingId);
      }
      this._hideShownTipIfNowIneligible();
    }));
    this._thinkingPhrasesEverModified = this._storageService.getBoolean(ChatTipStorageKeys.ThinkingPhrasesEverModified, -1 /* APPLICATION */, false);
    if (!this._thinkingPhrasesEverModified && this._isSettingModified("chat.agent.thinking.phrases" /* ThinkingPhrases */)) {
      this._thinkingPhrasesEverModified = true;
      this._storageService.store(ChatTipStorageKeys.ThinkingPhrasesEverModified, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    if (!this._thinkingPhrasesEverModified) {
      this._register(this._configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration("chat.agent.thinking.phrases" /* ThinkingPhrases */)) {
          this._thinkingPhrasesEverModified = true;
          this._storageService.store(ChatTipStorageKeys.ThinkingPhrasesEverModified, true, -1 /* APPLICATION */, 1 /* MACHINE */);
        }
      }));
    }
    this._register(CommandsRegistry.onDidRegisterCommand((commandId) => {
      this._hideShownTipIfNowIneligible();
      if (this._tipRequestId === "welcome" && TIP_CATALOG.some((tip) => tip.requiresCommands?.includes(commandId))) {
        this._tipRequestId = void 0;
      }
    }));
  }
  _hasFileOrFolderReference(message) {
    return message.parts.some((part) => {
      if (part.kind !== ChatRequestDynamicVariablePart.Kind) {
        return false;
      }
      const dynamicPart = part;
      return dynamicPart.isFile === true || dynamicPart.isDirectory === true;
    });
  }
  _getSlashCommandTrackingId(message) {
    for (const part of message.parts) {
      if (part.kind === ChatRequestSlashCommandPart.Kind) {
        const slashCommand = part.slashCommand.command;
        return this._toSlashCommandTrackingId(slashCommand);
      }
      if (part.kind === ChatRequestAgentSubcommandPart.Kind) {
        const subCommand = part.command.name;
        return this._toSlashCommandTrackingId(subCommand);
      }
    }
    const trimmed = message.text.trimStart();
    const match2 = /^(?:@\S+\s+)?\/(init|create-(?:instructions|prompt|agent|skill)|fork)(?:\s|$)/.exec(trimmed);
    return match2 ? this._toSlashCommandTrackingId(match2[1]) : void 0;
  }
  _toSlashCommandTrackingId(command4) {
    switch (command4) {
      case "init":
      case "create-instructions":
        return CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND;
      case "create-prompt":
        return CREATE_PROMPT_TRACKING_COMMAND;
      case "create-agent":
        return CREATE_AGENT_TRACKING_COMMAND;
      case "create-skill":
        return CREATE_SKILL_TRACKING_COMMAND;
      case "fork":
        return FORK_CONVERSATION_TRACKING_COMMAND;
      default:
        return void 0;
    }
  }
  recordSlashCommandUsage(command4) {
    const trackingId = this._toSlashCommandTrackingId(command4);
    if (!trackingId) {
      return;
    }
    this._tracker.recordCommandExecuted(trackingId);
    this._hideShownTipIfNowIneligible();
  }
  resetSession() {
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._contextKeyService = void 0;
    this._tipsHiddenForSession = false;
  }
  dismissTip() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "dismissed");
      const dismissed = new Set(this._getDismissedTipIds());
      dismissed.add(this._shownTip.id);
      this._storageService.store(ChatTipStorageKeys.DismissedTips, JSON.stringify([...dismissed]), -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    this._tipRequestId = void 0;
    this._onDidDismissTip.fire();
  }
  dismissTipForSession() {
    this.dismissTip();
    this.hideTipsForSession();
  }
  clearDismissedTips() {
    this._storageService.remove(ChatTipStorageKeys.DismissedTips, -1 /* APPLICATION */);
    this._storageService.remove(ChatTipStorageKeys.DismissedTips, 0 /* PROFILE */);
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._contextKeyService = void 0;
    this._tipsHiddenForSession = false;
    this._onDidDismissTip.fire();
  }
  _getDismissedTipIds() {
    const raw = this._readApplicationWithProfileFallback(ChatTipStorageKeys.DismissedTips);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      this._logService.debug("#ChatTips dismissed:", parsed);
      if (!Array.isArray(parsed)) {
        return [];
      }
      const knownTipIds = new Set(TIP_CATALOG.map((tip) => tip.id));
      const dismissed = /* @__PURE__ */ new Set();
      for (const value2 of parsed) {
        if (typeof value2 === "string" && knownTipIds.has(value2)) {
          dismissed.add(value2);
        }
      }
      return [...dismissed];
    } catch {
      return [];
    }
  }
  hideTip() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "hidden");
    }
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._onDidHideTip.fire();
  }
  hideTipsForSession() {
    if (this._tipsHiddenForSession) {
      return;
    }
    this._tipsHiddenForSession = true;
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    this._onDidHideTip.fire();
  }
  async disableTips() {
    if (this._shownTip) {
      this._logTipTelemetry(this._shownTip.id, "disabled");
    }
    this._shownTip = void 0;
    this._tipRequestId = void 0;
    await this._configurationService.updateValue("chat.tips.enabled", false, 1 /* APPLICATION */);
    this._onDidDisableTips.fire();
  }
  getWelcomeTip(contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    this._tracker.recordCurrentMode(contextKeyService);
    this._tracker.refreshPromptFileExclusions();
    if (!this._configurationService.getValue("chat.tips.enabled")) {
      return void 0;
    }
    if (this._tipsHiddenForSession) {
      return void 0;
    }
    this._contextKeyService = contextKeyService;
    if (!this._isCopilotEnabled()) {
      return void 0;
    }
    if (this._chatEntitlementService.entitlement === 1 /* Unknown */ && !this._chatEntitlementService.hasByokModels) {
      return void 0;
    }
    if (!this._isChatLocation(contextKeyService)) {
      return void 0;
    }
    if (!this._hasSingleForegroundChatSurface(contextKeyService)) {
      return void 0;
    }
    if (this._isChatQuotaExceeded(contextKeyService)) {
      return void 0;
    }
    if (this._tipRequestId === "welcome" && this._shownTip) {
      if (this._shownTip.id !== "tip.switchToAuto") {
        const switchToAutoTip = TIP_CATALOG.find((tip2) => tip2.id === "tip.switchToAuto");
        if (switchToAutoTip) {
          const dismissedIds = new Set(this._getDismissedTipIds());
          if (!dismissedIds.has(switchToAutoTip.id) && this._isEligible(switchToAutoTip, contextKeyService)) {
            this._shownTip = switchToAutoTip;
            this._storageService.store(ChatTipStorageKeys.LastTipId, switchToAutoTip.id, -1 /* APPLICATION */, 0 /* USER */);
            const tip2 = this._createTip(switchToAutoTip);
            this._logTipTelemetry(switchToAutoTip.id, "shown");
            this._trackTipCommandClicks(switchToAutoTip);
            this._onDidNavigateTip.fire(tip2);
            return tip2;
          }
        }
      }
      if (!this._isEligible(this._shownTip, contextKeyService)) {
        if (this._tracker.isExcluded(this._shownTip)) {
          this.hideTip();
          return void 0;
        }
        const nextTip = this._findNextEligibleTip(this._shownTip.id, contextKeyService);
        if (nextTip) {
          this._shownTip = nextTip;
          this._storageService.store(ChatTipStorageKeys.LastTipId, nextTip.id, -1 /* APPLICATION */, 0 /* USER */);
          const tip2 = this._createTip(nextTip);
          this._onDidNavigateTip.fire(tip2);
          return tip2;
        }
        this.hideTip();
        return void 0;
      }
      return this._createTip(this._shownTip);
    }
    const tip = this._pickTip("welcome", contextKeyService);
    return tip;
  }
  _hasSingleForegroundChatSurface(contextKeyService) {
    const foregroundSessionCount = contextKeyService.getContextKeyValue(ChatContextKeys.foregroundSessionCount.key);
    return foregroundSessionCount === 1 || foregroundSessionCount === 0 && contextKeyService.getContextKeyValue(IsSessionsWindowContext.key) === true;
  }
  _findNextEligibleTip(currentTipId, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    const currentIndex = TIP_CATALOG.findIndex((tip) => tip.id === currentTipId);
    if (currentIndex === -1) {
      return void 0;
    }
    const dismissedIds = new Set(this._getDismissedTipIds());
    for (let i2 = 1; i2 < TIP_CATALOG.length; i2++) {
      const idx = (currentIndex + i2) % TIP_CATALOG.length;
      const candidate = TIP_CATALOG[idx];
      if (!dismissedIds.has(candidate.id) && this._isEligible(candidate, contextKeyService)) {
        return candidate;
      }
    }
    return void 0;
  }
  _hideShownTipIfNowIneligible() {
    if (!this._shownTip || !this._contextKeyService) {
      return;
    }
    if (this._tipsHiddenForSession) {
      return;
    }
    let eligible;
    try {
      eligible = this._isEligible(this._shownTip, this._contextKeyService);
    } catch (err) {
      this._contextKeyService = void 0;
      return;
    }
    if (eligible) {
      return;
    }
    this.hideTip();
  }
  _pickTip(sourceId, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    this._tracker.recordCurrentMode(contextKeyService);
    const dismissedIds = new Set(this._getDismissedTipIds());
    const eligibleTips = TIP_CATALOG.filter((tip) => !dismissedIds.has(tip.id) && this._isEligible(tip, contextKeyService));
    const selectedTip = this._selectTipByTier(eligibleTips);
    if (!selectedTip) {
      return void 0;
    }
    this._storageService.store(ChatTipStorageKeys.LastTipId, selectedTip.id, -1 /* APPLICATION */, 0 /* USER */);
    this._tipRequestId = sourceId;
    this._shownTip = selectedTip;
    this._logTipTelemetry(selectedTip.id, "shown");
    this._trackTipCommandClicks(selectedTip);
    return this._createTip(selectedTip);
  }
  _selectTipByTier(eligibleTips) {
    const foundationalTips = eligibleTips.filter((tip) => tip.tier === "foundational" /* Foundational */);
    if (foundationalTips.length) {
      return this._sortByPriorityAndCatalogOrder(foundationalTips)[0];
    }
    const qolTips = eligibleTips.filter((tip) => tip.tier === "qol" /* Qol */);
    if (!qolTips.length) {
      return void 0;
    }
    const randomIndex = Math.floor(Math.random() * qolTips.length);
    return qolTips[randomIndex];
  }
  navigateToNextTip() {
    if (!this._contextKeyService) {
      return void 0;
    }
    return this._navigateTip(1, this._contextKeyService);
  }
  navigateToPreviousTip() {
    if (!this._contextKeyService) {
      return void 0;
    }
    return this._navigateTip(-1, this._contextKeyService);
  }
  getNextEligibleTip() {
    if (!this._contextKeyService || !this._shownTip) {
      return void 0;
    }
    const contextKeyService = this._contextKeyService;
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    const currentTipId = this._shownTip.id;
    const orderedTips = this._getOrderedEligibleTips(contextKeyService, { includeTipId: currentTipId });
    if (!orderedTips.length) {
      return void 0;
    }
    const currentIndex = orderedTips.findIndex((tip) => tip.id === currentTipId);
    const candidate = this._getNextTipFromOrderedList(orderedTips, currentIndex, currentTipId);
    if (candidate) {
      this._shownTip = candidate;
      this._tipRequestId = "welcome";
      this._storageService.store(ChatTipStorageKeys.LastTipId, candidate.id, -1 /* APPLICATION */, 0 /* USER */);
      this._logTipTelemetry(candidate.id, "shown");
      this._trackTipCommandClicks(candidate);
      return this._createTip(candidate);
    }
    return void 0;
  }
  _getNextTipFromOrderedList(orderedTips, startIndex, currentTipId) {
    if (!orderedTips.length) {
      return void 0;
    }
    const fallbackIndex = 0;
    const normalizedStartIndex = startIndex === -1 ? fallbackIndex : startIndex;
    for (let i2 = 1; i2 <= orderedTips.length; i2++) {
      const index2 = (normalizedStartIndex + i2) % orderedTips.length;
      const candidate = orderedTips[index2];
      if (candidate.id !== currentTipId) {
        return candidate;
      }
    }
    return void 0;
  }
  hasMultipleTips() {
    if (!this._contextKeyService) {
      return false;
    }
    this._createSlashCommandsUsageTracker.syncContextKey(this._contextKeyService);
    return this._hasNavigableTip(this._contextKeyService);
  }
  _navigateTip(direction, contextKeyService) {
    this._createSlashCommandsUsageTracker.syncContextKey(contextKeyService);
    if (!this._shownTip) {
      return void 0;
    }
    const orderedTips = this._getOrderedEligibleTips(contextKeyService);
    if (!orderedTips.length) {
      return void 0;
    }
    const currentIndex = orderedTips.findIndex((tip) => tip.id === this._shownTip.id);
    if (orderedTips.length === 1 && currentIndex !== -1) {
      return void 0;
    }
    const fallbackIndex = direction === 1 ? 0 : orderedTips.length - 1;
    const nextIndex = currentIndex === -1 ? fallbackIndex : (currentIndex + direction + orderedTips.length) % orderedTips.length;
    const candidate = orderedTips[nextIndex];
    if (candidate) {
      this._logTipTelemetry(this._shownTip.id, direction === 1 ? "navigateNext" : "navigatePrevious");
      this._shownTip = candidate;
      this._tipRequestId = "welcome";
      this._storageService.store(ChatTipStorageKeys.LastTipId, candidate.id, -1 /* APPLICATION */, 0 /* USER */);
      this._logTipTelemetry(candidate.id, "shown");
      this._trackTipCommandClicks(candidate);
      const tip = this._createTip(candidate);
      this._onDidNavigateTip.fire(tip);
      return tip;
    }
    return void 0;
  }
  _hasNavigableTip(contextKeyService) {
    const orderedTips = this._getOrderedEligibleTips(contextKeyService);
    if (!orderedTips.length) {
      return false;
    }
    if (!this._shownTip) {
      return orderedTips.length > 1;
    }
    if (orderedTips.length > 1) {
      return true;
    }
    return orderedTips[0].id !== this._shownTip.id;
  }
  _getOrderedEligibleTips(contextKeyService, options3) {
    const dismissedIds = new Set(this._getDismissedTipIds());
    const eligibleTips = TIP_CATALOG.filter((tip) => {
      if (options3?.includeTipId && tip.id === options3.includeTipId) {
        return true;
      }
      if (options3?.excludeShownTip && this._shownTip && tip.id === this._shownTip.id) {
        return false;
      }
      return !dismissedIds.has(tip.id) && this._isEligible(tip, contextKeyService);
    });
    const foundationalTips = this._sortByPriorityAndCatalogOrder(eligibleTips.filter((tip) => tip.tier === "foundational" /* Foundational */));
    const qolTips = this._sortByPriorityAndCatalogOrder(eligibleTips.filter((tip) => tip.tier === "qol" /* Qol */));
    return [...foundationalTips, ...qolTips];
  }
  _sortByPriorityAndCatalogOrder(tips) {
    return [...tips].sort((a, b) => {
      const aPriority = a.priority ?? Number.POSITIVE_INFINITY;
      const bPriority = b.priority ?? Number.POSITIVE_INFINITY;
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      const aCatalogIndex = TIP_CATALOG.findIndex((tip) => tip.id === a.id);
      const bCatalogIndex = TIP_CATALOG.findIndex((tip) => tip.id === b.id);
      return aCatalogIndex - bCatalogIndex;
    });
  }
  _isEligible(tip, contextKeyService) {
    if (tip.onlyWhenModelIds?.length) {
      const currentModelId = this._getCurrentChatModelId(contextKeyService);
      const isModelMatch = tip.onlyWhenModelIds.some((modelId) => currentModelId === modelId || currentModelId.startsWith(`${modelId}-`));
      if (!isModelMatch) {
        return false;
      }
    }
    if (tip.excludeWhenSettingsChanged?.some((setting) => this._isSettingModified(setting))) {
      this._logService.debug("#ChatTips: tip excluded because setting was modified", tip.id, tip.excludeWhenSettingsChanged);
      return false;
    }
    if (tip.when && !contextKeyService.contextMatchesRules(tip.when)) {
      this._logService.debug("#ChatTips: tip is not eligible due to when clause", tip.id, tip.when.serialize());
      return false;
    }
    if (tip.requiresModeNames?.some((modeName) => !this._isModeAvailable(modeName, contextKeyService))) {
      this._logService.debug("#ChatTips: tip is not eligible because a required mode is not available", tip.id, tip.requiresModeNames);
      return false;
    }
    if (tip.requiresCommands?.some((commandId) => !CommandsRegistry.getCommand(commandId))) {
      this._logService.debug("#ChatTips: tip is not eligible because a required command is not registered", tip.id, tip.requiresCommands);
      return false;
    }
    if (this._tracker.isExcluded(tip)) {
      return false;
    }
    if (tip.id === "tip.thinkingPhrases" && this._thinkingPhrasesEverModified) {
      this._logService.debug("#ChatTips: tip excluded because thinking phrases setting was previously modified", tip.id);
      return false;
    }
    if (!this._areTipCommandsRegistered(tip)) {
      return false;
    }
    this._logService.debug("#ChatTips: tip is eligible", tip.id);
    return true;
  }
  _isModeAvailable(modeName, contextKeyService) {
    const widget = this._chatWidgetService.getAllWidgets().find((widget2) => widget2.scopedContextKeyService === contextKeyService);
    return !!widget?.input.currentChatModesObs.get().findModeByName(modeName);
  }
  _areTipCommandsRegistered(tip) {
    const ctx = { keybindingService: this._keybindingService, experimentalTipMessages: this._experimentalTipMessages };
    const rawMessage = tip.buildMessage(ctx);
    const commandIds = extractCommandIds(rawMessage.value);
    for (const commandId of commandIds) {
      if (!CommandsRegistry.getCommand(commandId)) {
        this._logService.debug("#ChatTips: tip excluded because command is not registered", tip.id, commandId);
        return false;
      }
    }
    return true;
  }
  _isSettingModified(key3) {
    const inspected = this._configurationService.inspect(key3);
    return inspected.userValue !== void 0 || inspected.userLocalValue !== void 0 || inspected.userRemoteValue !== void 0 || inspected.workspaceValue !== void 0 || inspected.workspaceFolderValue !== void 0;
  }
  _getCurrentChatModelId(contextKeyService) {
    const normalize3 = (modelId) => {
      const normalizedModelId = modelId?.toLowerCase() ?? "";
      if (!normalizedModelId) {
        return "";
      }
      if (normalizedModelId.includes("/")) {
        return normalizedModelId.split("/").at(-1) ?? "";
      }
      return normalizedModelId;
    };
    return normalize3(getSelectedModelIdentifier(contextKeyService, this._storageService));
  }
  _isChatLocation(contextKeyService) {
    const location2 = contextKeyService.getContextKeyValue(ChatContextKeys.location.key);
    return !location2 || location2 === "panel" /* Chat */;
  }
  _isChatQuotaExceeded(contextKeyService) {
    return contextKeyService.getContextKeyValue(ChatContextKeys.chatQuotaExceeded.key) === true;
  }
  _isCopilotEnabled() {
    const defaultChatAgent2 = this._productService.defaultChatAgent;
    return !!defaultChatAgent2?.chatExtensionId;
  }
  _fetchExperimentalTipMessages() {
    this._assignmentService.getTreatment("openagentswindowtip" /* OpenAgentsWindowTip */).then((value2) => {
      if (typeof value2 === "string" && value2.length > 0) {
        this._experimentalTipMessages.set("openagentswindowtip" /* OpenAgentsWindowTip */, value2);
      }
    });
  }
  _createTip(tipDef) {
    const ctx = { keybindingService: this._keybindingService, experimentalTipMessages: this._experimentalTipMessages };
    const rawMessage = tipDef.buildMessage(ctx);
    const prefixedMessage = localize(11308, null, rawMessage.value);
    const enabledCommands = extractCommandIds(prefixedMessage);
    const markdown = new MarkdownString(prefixedMessage, {
      isTrusted: enabledCommands.length > 0 ? { enabledCommands } : false
    });
    return {
      id: tipDef.id,
      content: markdown,
      enabledCommands
    };
  }
  _logTipTelemetry(tipId, action, commandId) {
    this._telemetryService.publicLog2("chatTip", {
      tipId,
      action,
      commandId
    });
  }
  _trackTipCommandClicks(tip) {
    this._tipCommandListener.clear();
    const ctx = { keybindingService: this._keybindingService, experimentalTipMessages: this._experimentalTipMessages };
    const rawMessage = tip.buildMessage(ctx);
    const enabledCommands = extractCommandIds(rawMessage.value);
    if (!enabledCommands.length) {
      return;
    }
    const enabledCommandSet = new Set(enabledCommands);
    this._tipCommandListener.value = this._commandService.onDidExecuteCommand((e4) => {
      if (enabledCommandSet.has(e4.commandId) && this._shownTip?.id === tip.id) {
        this._logTipTelemetry(tip.id, "commandClicked", e4.commandId);
        this.dismissTipForSession();
      }
    });
  }
  _readApplicationWithProfileFallback(key3) {
    const applicationValue = this._storageService.get(key3, -1 /* APPLICATION */);
    if (applicationValue) {
      return applicationValue;
    }
    const profileValue = this._storageService.get(key3, 0 /* PROFILE */);
    if (profileValue) {
      this._storageService.store(key3, profileValue, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    return profileValue;
  }
};

ChatTipService = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IChatEntitlementService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IWorkbenchAssignmentService),
  __decorateParam(11, IChatWidgetService)
], ChatTipService);
export { ATTACH_FILES_REFERENCE_TRACKING_COMMAND, CREATE_AGENT_INSTRUCTIONS_TRACKING_COMMAND, CREATE_PROMPT_TRACKING_COMMAND, CREATE_AGENT_TRACKING_COMMAND, CREATE_SKILL_TRACKING_COMMAND, FORK_CONVERSATION_TRACKING_COMMAND, IChatTipService, ChatTipService };
