// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/voiceBridge.contribution.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { combineVoiceInput } from "./module-2735.mjs";
import { INewChatVoiceTargetService, NEW_CHAT_VOICE_SENTINEL } from "./module-2894.mjs";
import { resolveVoiceModel } from "./module-2066.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/sessions/contrib/chat/browser/voiceBridge.contribution.ts
var SessionsVoiceBridgeContribution = class extends Disposable {
  constructor(configurationService, chatWidgetService, sessionsService, sessionsManagementService, newChatVoiceTargetService, voiceSessionController) {
    super();
    this.configurationService = configurationService;
    this.chatWidgetService = chatWidgetService;
    this.sessionsService = sessionsService;
    this.sessionsManagementService = sessionsManagementService;
    this.newChatVoiceTargetService = newChatVoiceTargetService;
    this.voiceSessionController = voiceSessionController;
    this._commandDisposables = this._register(new DisposableStore());
    this._updateCommands();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("agents.voice.enabled")) {
        this._updateCommands();
      }
    }));
  }
  static {
    this.ID = "sessions.voiceBridge";
  }
  _updateCommands() {
    this._commandDisposables.clear();
    if (this.configurationService.getValue("agents.voice.enabled") !== true) {
      return;
    }
    this._commandDisposables.add(CommandsRegistry.registerCommand("_chat.voice.acceptInput", (_accessor, text2) => {
      if (!text2) {
        return;
      }
      const composer = this._activeComposerTarget();
      if (composer) {
        composer.sendQuery(text2);
        return;
      }
      const widget = this._activeSessionWidget() ?? this.chatWidgetService.lastFocusedWidget;
      if (widget?.viewModel) {
        if (widget.viewModel.editing) {
          widget.input.setValue(text2, false);
        } else {
          widget.acceptInput(combineVoiceInput(widget.getInput(), text2), { preserveFocus: true });
        }
      }
    }));
    this._commandDisposables.add(CommandsRegistry.registerCommand("_chat.voice.getCurrentSession", () => {
      if (this._activeComposerTarget()) {
        return NEW_CHAT_VOICE_SENTINEL.toString();
      }
      const activeChat = this._createdActiveChatResource();
      if (activeChat) {
        return activeChat.toString();
      }
      return this.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource?.toString();
    }));
    this._commandDisposables.add(CommandsRegistry.registerCommand("_chat.voice.selectModel", (_accessor, requestedModel) => {
      const composer = this._activeComposerTarget();
      const widget = composer ? void 0 : this._activeSessionWidget() ?? this.chatWidgetService.lastFocusedWidget;
      const models = composer?.getVoiceModels() ?? widget?.inputPart.availableLanguageModels;
      if (!models) {
        return { ok: false, reason: "no_input" };
      }
      const resolved = resolveVoiceModel(models, requestedModel);
      if (!resolved.ok || !resolved.identifier) {
        return resolved;
      }
      const selected = composer ? composer.selectVoiceModel(resolved.identifier) : widget.inputPart.switchModelByIdentifier(resolved.identifier, true, true);
      return selected ? resolved : { ok: false, reason: "selection_failed", available_models: resolved.available_models };
    }));
    this._commandDisposables.add(CommandsRegistry.registerCommand("_chat.voice.switchToSession", async (_accessor, resourceStr) => {
      if (!resourceStr) {
        return false;
      }
      if (resourceStr === NEW_CHAT_VOICE_SENTINEL.toString()) {
        const composer = this._activeComposerTarget();
        composer?.focus();
        return !!composer;
      }
      let resource;
      try {
        resource = URI.parse(resourceStr);
      } catch {
        return false;
      }
      const owner = this.sessionsManagementService.getSessionForChatResource(resource);
      if (owner) {
        await this.sessionsService.openSession(owner.session.resource, { preserveFocus: true, source: "voice" });
        if (!isEqual2(owner.chat.resource, owner.session.resource)) {
          await this.sessionsService.openChat(owner.session, owner.chat.resource);
        }
        return true;
      }
      const session = this.sessionsManagementService.getSession(resource);
      if (session) {
        await this.sessionsService.openSession(session.resource, { preserveFocus: true, source: "voice" });
        return true;
      }
      try {
        await this.sessionsService.openSession(resource, { preserveFocus: true, source: "voice" });
        return true;
      } catch {
        return false;
      }
    }));
    this._commandDisposables.add(CommandsRegistry.registerCommand("_chat.voice.activateSession", (_accessor, resourceStr) => {
      if (!resourceStr || resourceStr === NEW_CHAT_VOICE_SENTINEL.toString()) {
        return false;
      }
      let resource;
      try {
        resource = URI.parse(resourceStr);
      } catch {
        return false;
      }
      this.voiceSessionController.activateSession(resource);
      return true;
    }));
  }
  /**
   * The active chat resource, only after its session exists.
   * {@link IActiveSession.isCreated} distinguishes it from the welcome composer.
   */
  _createdActiveChatResource() {
    const active = this.sessionsService.activeSession.get();
    return active?.isCreated.get() ? active.activeChat.get()?.resource : void 0;
  }
  /** The chat widget backing the currently active (created) session, if any. */
  _activeSessionWidget() {
    const resource = this._createdActiveChatResource();
    return resource ? this.chatWidgetService.getWidgetBySessionResource(resource) : void 0;
  }
  /**
   * The new-session composer voice should target.
   * Welcome composers stop targeting once a session exists; in-session composers
   * can opt in via {@link INewChatVoiceComposer.routesWhileSessionActive}.
   */
  _activeComposerTarget() {
    const composer = this.newChatVoiceTargetService.activeComposer.get();
    if (!composer) {
      return void 0;
    }
    if (composer.routesWhileSessionActive || !this._createdActiveChatResource()) {
      return composer;
    }
    return void 0;
  }
};

SessionsVoiceBridgeContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IChatWidgetService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsManagementService),
  __decorateParam(4, INewChatVoiceTargetService),
  __decorateParam(5, IVoiceSessionController)
], SessionsVoiceBridgeContribution);

registerWorkbenchContribution2(SessionsVoiceBridgeContribution.ID, SessionsVoiceBridgeContribution, WorkbenchPhase.AfterRestored);

var SessionsVoiceActiveSessionContribution = class extends Disposable {
  constructor(voiceSessionController, sessionsService) {
    super();
    this.voiceSessionController = voiceSessionController;
    this.sessionsService = sessionsService;
    let voiceDraftSession;
    this._register(autorun((reader) => {
      const active = this.sessionsService.activeSession.read(reader);
      const hasDraftTarget = this.voiceSessionController.hasDraftTarget.read(reader);
      if (!hasDraftTarget) {
        voiceDraftSession = void 0;
      } else if (!voiceDraftSession && active && !active.isCreated.read(reader)) {
        voiceDraftSession = active;
      }
      if (voiceDraftSession?.isCreated.read(reader)) {
        this.voiceSessionController.promoteDraftTarget(voiceDraftSession.activeChat.read(reader).resource);
        voiceDraftSession = void 0;
      }
      if (!active) {
        this.voiceSessionController.setActiveSessionShown(void 0);
        return;
      }
      if (!active.isCreated.read(reader)) {
        this.voiceSessionController.setActiveSessionShown(null);
        return;
      }
      this.voiceSessionController.setActiveSessionShown(active.activeChat.read(reader)?.resource);
    }));
  }
  static {
    this.ID = "sessions.voiceActiveSession";
  }
};

SessionsVoiceActiveSessionContribution = __decorateClass([
  __decorateParam(0, IVoiceSessionController),
  __decorateParam(1, ISessionsService)
], SessionsVoiceActiveSessionContribution);

registerWorkbenchContribution2(SessionsVoiceActiveSessionContribution.ID, SessionsVoiceActiveSessionContribution, WorkbenchPhase.AfterRestored);

var SessionsVoiceListeningContribution = class extends Disposable {
  static {
    this.ID = "sessions.voiceListening";
  }
  constructor(voiceSessionController, sessionsService) {
    super();
    let listeningSession;
    this._register(autorun((reader) => {
      const connected = voiceSessionController.isConnected.read(reader);
      const voiceState = voiceSessionController.voiceState.read(reader);
      const targetSession = voiceSessionController.targetSession.read(reader);
      const turns = voiceSessionController.transcriptTurns.read(reader);
      const activeSession = sessionsService.activeSession.read(reader);
      const currentSession = activeSession?.activeChat.read(reader)?.resource;
      if (!connected) {
        listeningSession = void 0;
        return;
      }
      if (voiceState !== "listening") {
        listeningSession = void 0;
        return;
      }
      if (!listeningSession) {
        listeningSession = targetSession ?? currentSession;
      } else if (!targetSession && currentSession && !isEqual2(currentSession, listeningSession)) {
        const dictationSession = listeningSession;
        const activelyDictating = turns.some((t2) => t2.speaker === "user" && t2.isPartial && t2.text.trim().length > 0);
        if (activelyDictating) {
          voiceSessionController.finishListeningAndSubmitTo(dictationSession);
        } else {
          voiceSessionController.discardListening();
        }
        listeningSession = void 0;
      }
    }));
  }
};

SessionsVoiceListeningContribution = __decorateClass([
  __decorateParam(0, IVoiceSessionController),
  __decorateParam(1, ISessionsService)
], SessionsVoiceListeningContribution);

registerWorkbenchContribution2(SessionsVoiceListeningContribution.ID, SessionsVoiceListeningContribution, WorkbenchPhase.Eventually);

var SessionsVoiceNewComposerContribution = class extends Disposable {
  static {
    this.ID = "sessions.voiceNewComposer";
  }
  constructor(voiceSessionController, newChatVoiceTargetService) {
    super();
    let voiceComposer;
    let voiceComposerCaptured = false;
    this._register(autorun((reader) => {
      const connected = voiceSessionController.isConnected.read(reader) || voiceSessionController.isConnecting.read(reader);
      const activeComposer = newChatVoiceTargetService.activeComposer.read(reader);
      if (!connected) {
        voiceComposer = activeComposer;
        voiceComposerCaptured = false;
        return;
      }
      if (!voiceComposerCaptured) {
        voiceComposer = activeComposer;
        voiceComposerCaptured = true;
        return;
      }
      if (activeComposer && activeComposer !== voiceComposer && !activeComposer.routesWhileSessionActive) {
        voiceSessionController.disconnect("internal");
      }
    }));
  }
};

SessionsVoiceNewComposerContribution = __decorateClass([
  __decorateParam(0, IVoiceSessionController),
  __decorateParam(1, INewChatVoiceTargetService)
], SessionsVoiceNewComposerContribution);

registerWorkbenchContribution2(SessionsVoiceNewComposerContribution.ID, SessionsVoiceNewComposerContribution, WorkbenchPhase.AfterRestored);
export { SessionsVoiceBridgeContribution, SessionsVoiceActiveSessionContribution, SessionsVoiceListeningContribution, SessionsVoiceNewComposerContribution };
