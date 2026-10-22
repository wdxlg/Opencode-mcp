// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatVoice.ts
import { URI } from "./module-0032.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { MenuId, MenuItemAction, MenuRegistry } from "./module-0092.mjs";
import { AGENTS_VOICE_ENABLED } from "./module-1343.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SegmentedVoiceInputModePillInactive } from "./module-2077.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { VoiceModeActionViewItem } from "./module-2082.mjs";
import { autorun } from "./module-0052.mjs";
import { setupVoiceInputDecorations } from "./module-2893.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { ITtsPlaybackService } from "./module-2063.mjs";
import { IMicCaptureService } from "./module-1345.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/sessions/contrib/chat/browser/newChatVoice.ts
var NEW_CHAT_VOICE_SENTINEL = URI.from({ scheme: "sessions-voice", authority: "new-chat", path: "/composer" });

function isNewChatVoiceSessionActive(connected, connecting, targetSession, hasDraftTarget) {
  return (connected || connecting) && targetSession === void 0 && hasDraftTarget;
}

var INewChatVoiceTargetService = createDecorator("newChatVoiceTargetService");

var NewChatVoiceTargetService = class extends Disposable {
  constructor(sessionsService, chatWidgetService) {
    super();
    this.sessionsService = sessionsService;
    this.chatWidgetService = chatWidgetService;
    this._composers = /* @__PURE__ */ new Set();
    this._activeComposer = observableValue(this, void 0);
    this.activeComposer = this._activeComposer;
    this._focusedSessionResource = observableFromEvent(
      this,
      this.chatWidgetService.onDidChangeFocusedSession,
      () => this.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource
    );
    this.currentVoiceInputResource = derivedOpts({ owner: this, equalsFn: isEqual2 }, (reader) => {
      const composer = this._activeComposer.read(reader);
      const active = this.sessionsService.activeSession.read(reader);
      const created = active?.isCreated.read(reader) ? active.activeChat.read(reader)?.resource : void 0;
      if (composer && (composer.routesWhileSessionActive || !created)) {
        return NEW_CHAT_VOICE_SENTINEL;
      }
      if (created) {
        return created;
      }
      return this._focusedSessionResource.read(reader);
    });
  }
  registerComposer(composer) {
    this._composers.add(composer);
    this._activeComposer.set(composer, void 0);
    return toDisposable(() => {
      this._composers.delete(composer);
      if (this._activeComposer.get() === composer) {
        const remaining = [...this._composers];
        this._activeComposer.set(remaining.length ? remaining[remaining.length - 1] : void 0, void 0);
      }
    });
  }
  setActive(composer) {
    if (this._composers.has(composer)) {
      this._activeComposer.set(composer, void 0);
    }
  }
};

NewChatVoiceTargetService = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, IChatWidgetService)
], NewChatVoiceTargetService);

registerSingleton(INewChatVoiceTargetService, NewChatVoiceTargetService, 1 /* Delayed */);

var SessionsNewChatVoiceMenu = new MenuId("SessionsNewChatVoiceMenu");

var WHEN_VOICE_ENABLED = AGENTS_VOICE_ENABLED;

var WHEN_VOICE_BUTTON_SHOWN = ContextKeyExpr.notEquals(`config.${"agents.voice.showButton" /* ShowButton */}`, false);

var WHEN_CONNECTING = ContextKeyExpr.equals("agentsVoiceConnecting", true);

var WHEN_LISTENING = ContextKeyExpr.equals("agentsVoiceListening", true);

var WHEN_CONNECTED = ContextKeyExpr.equals("agentsVoiceConnected", true);

var WHEN_INITIATED_HERE = ContextKeyExpr.equals("agentsVoiceInitiatedHere", true);

var WHEN_VOICE_SURFACE = ContextKeyExpr.equals("newChatVoiceSurface", true);

var WHEN_NOT_DICTATING = ContextKeyExpr.and(
  ContextKeyExpr.has("chatSpeechToTextRecording").negate(),
  ContextKeyExpr.has("chatSpeechToTextPreparing").negate()
);

var WHEN_NO_SEGMENTED_PILL = SegmentedVoiceInputModePillInactive;

MenuRegistry.appendMenuItem(SessionsNewChatVoiceMenu, {
  command: { id: "agentsVoice.connecting", title: localize(4471, null), icon: Codicon.loadingCompact },
  when: ContextKeyExpr.and(WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_CONNECTING, WHEN_INITIATED_HERE, WHEN_NO_SEGMENTED_PILL),
  group: "navigation",
  order: -10
});

MenuRegistry.appendMenuItem(SessionsNewChatVoiceMenu, {
  command: { id: "agentsVoice.startVoiceInChat", title: localize(4475, null), icon: Codicon.voiceModeCompact },
  when: ContextKeyExpr.and(WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_VOICE_SURFACE, WHEN_LISTENING.negate(), WHEN_CONNECTING.negate(), WHEN_NOT_DICTATING, WHEN_NO_SEGMENTED_PILL),
  group: "navigation",
  order: -10
});

MenuRegistry.appendMenuItem(SessionsNewChatVoiceMenu, {
  command: { id: "agentsVoice.pttStopInChat", title: localize(4474, null), icon: Codicon.voiceModeCompact },
  when: ContextKeyExpr.and(WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_LISTENING, WHEN_INITIATED_HERE, WHEN_NO_SEGMENTED_PILL),
  group: "navigation",
  order: -10
});

MenuRegistry.appendMenuItem(SessionsNewChatVoiceMenu, {
  command: { id: "agentsVoice.openSettings", title: localize(4473, null), icon: Codicon.settingsGear },
  when: ContextKeyExpr.and(WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_CONNECTED, WHEN_INITIATED_HERE, WHEN_NO_SEGMENTED_PILL),
  group: "navigation",
  order: -9.5
});

MenuRegistry.appendMenuItem(SessionsNewChatVoiceMenu, {
  command: { id: "agentsVoice.disconnect", title: localize(4472, null), icon: Codicon.debugDisconnectCompact },
  when: ContextKeyExpr.and(WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_CONNECTED, WHEN_INITIATED_HERE, WHEN_NO_SEGMENTED_PILL),
  group: "navigation",
  order: -9
});

var NewChatVoiceController = class extends Disposable {
  constructor(options3, instantiationService, contextKeyService, targetService, voiceSessionController, sessionsService, ttsPlaybackService, micCaptureService, configurationService, keybindingService, themeService, accessibilityService) {
    super();
    this._register(targetService.registerComposer(options3.composer));
    this._register(options3.composer.onDidFocus(() => targetService.setActive(options3.composer)));
    const scopedContextKeyService = this._register(contextKeyService.createScoped(options3.toolbarContainer));
    const voiceSurfaceKey = scopedContextKeyService.createKey("newChatVoiceSurface", false);
    const initiatedHereKey = scopedContextKeyService.createKey("agentsVoiceInitiatedHere", false);
    const scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const toolbar = this._register(scopedInstantiationService.createInstance(MenuWorkbenchToolBar, options3.toolbarContainer, SessionsNewChatVoiceMenu, {
      hiddenItemStrategy: -1 /* NoHide */,
      actionViewItemProvider: (action, itemOptions) => {
        if ((action.id === "agentsVoice.startVoiceInChat" || action.id === "agentsVoice.pttStopInChat") && action instanceof MenuItemAction) {
          return scopedInstantiationService.createInstance(VoiceModeActionViewItem, action, itemOptions);
        }
        return void 0;
      }
    }));
    if (options3.onDidChangeActions) {
      const onDidChangeActions = () => {
        let actionCount = 0;
        while (toolbar.getItemAction(actionCount)) {
          actionCount++;
        }
        options3.onDidChangeActions?.(actionCount);
      };
      this._register(toolbar.onDidChangeMenuItems(onDidChangeActions));
      onDidChangeActions();
    }
    const isVoiceSurface = derived((reader) => {
      const active = sessionsService.activeSession.read(reader);
      const hasCreatedSession = !!active && active.isCreated.read(reader);
      const isActiveComposer = targetService.activeComposer.read(reader) === options3.composer;
      return (options3.composer.routesWhileSessionActive || !hasCreatedSession) && isActiveComposer;
    });
    const isVoiceTarget = derived((reader) => {
      const voiceActive = isNewChatVoiceSessionActive(
        voiceSessionController.isConnected.read(reader),
        voiceSessionController.isConnecting.read(reader),
        voiceSessionController.targetSession.read(reader),
        voiceSessionController.hasDraftTarget.read(reader)
      );
      return voiceActive && isVoiceSurface.read(reader);
    });
    this._register(autorun((reader) => {
      voiceSurfaceKey.set(isVoiceSurface.read(reader));
      initiatedHereKey.set(isVoiceTarget.read(reader));
    }));
    this._register(setupVoiceInputDecorations({
      voiceSessionController,
      ttsPlaybackService,
      micCaptureService,
      configurationService,
      keybindingService,
      themeService,
      accessibilityService
    }, {
      inputContainer: options3.inputContainer,
      isActive: isVoiceTarget,
      getCurrentResource: () => NEW_CHAT_VOICE_SENTINEL,
      currentVoiceInputResource: targetService.currentVoiceInputResource
    }));
  }
};

NewChatVoiceController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, INewChatVoiceTargetService),
  __decorateParam(4, IVoiceSessionController),
  __decorateParam(5, ISessionsService),
  __decorateParam(6, ITtsPlaybackService),
  __decorateParam(7, IMicCaptureService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IThemeService),
  __decorateParam(11, IAccessibilityService)
], NewChatVoiceController);
export { isNewChatVoiceSessionActive, NEW_CHAT_VOICE_SENTINEL, INewChatVoiceTargetService, NewChatVoiceTargetService, SessionsNewChatVoiceMenu, WHEN_VOICE_ENABLED, WHEN_VOICE_BUTTON_SHOWN, WHEN_CONNECTING, WHEN_LISTENING, WHEN_CONNECTED, WHEN_INITIATED_HERE, WHEN_VOICE_SURFACE, WHEN_NOT_DICTATING, WHEN_NO_SEGMENTED_PILL, NewChatVoiceController };
