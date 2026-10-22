// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/browser/agentsVoice.contribution.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { Disposable } from "./module-0012.mjs";
import { AGENTS_VOICE_CONNECTED, AGENTS_VOICE_CONNECTING, AGENTS_VOICE_ENABLED, AGENTS_VOICE_ENTITLED, AGENTS_VOICE_LISTENING, AGENTS_VOICE_RECONNECTING } from "./module-1343.mjs";
import { IVoiceSessionController, isVoiceEntitled } from "./module-2070.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { autorun } from "./module-0052.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IVoiceModeOnboardingService } from "./module-2038.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SegmentedVoiceInputModePillInactive } from "./module-2077.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { ICommandService } from "./module-0087.mjs";
import { URI } from "./module-0032.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { SHOW_VOICE_MODE_ONBOARDING_COMMAND } from "./module-2075.mjs";
import { INotificationService } from "./module-0336.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { VOICE_AGENT_PROGRESS_SETTING, normalizeAgentsVoiceId } from "./module-1341.mjs";
import { CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID } from "./module-2032.mjs";
import { Extensions14 } from "./module-1113.mjs";


// src/vs/workbench/contrib/agentsVoice/browser/agentsVoice.contribution.ts
var AGENTS_VOICE_WIDGET_FOCUSED = new RawContextKey("agentsVoiceWidgetFocused", false);

var AGENTS_VOICE_INITIATED_HERE = ContextKeyExpr.equals("agentsVoiceInitiatedHere", true);

var VOICE_ACTIVE_ON_SURFACE = ContextKeyExpr.or(IsSessionsWindowContext.negate(), AGENTS_VOICE_INITIATED_HERE);

var AgentsVoiceEntitlementKeyContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentsVoiceEntitlementKey";
  }
  constructor(chatEntitlementService, contextKeyService) {
    super();
    const entitledKey = AGENTS_VOICE_ENTITLED.bindTo(contextKeyService);
    const update = () => entitledKey.set(isVoiceEntitled(chatEntitlementService));
    update();
    this._register(chatEntitlementService.onDidChangeEntitlement(update));
  }
};

AgentsVoiceEntitlementKeyContribution = __decorateClass([
  __decorateParam(0, IChatEntitlementService),
  __decorateParam(1, IContextKeyService)
], AgentsVoiceEntitlementKeyContribution);

registerWorkbenchContribution2(AgentsVoiceEntitlementKeyContribution.ID, AgentsVoiceEntitlementKeyContribution, WorkbenchPhase.AfterRestored);

var AgentsVoiceConnectedKeyContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentsVoiceConnectedKey";
  }
  constructor(voiceSessionController, contextKeyService) {
    super();
    const connectedKey = AGENTS_VOICE_CONNECTED.bindTo(contextKeyService);
    const connectingKey = AGENTS_VOICE_CONNECTING.bindTo(contextKeyService);
    const listeningKey = AGENTS_VOICE_LISTENING.bindTo(contextKeyService);
    const reconnectingKey = AGENTS_VOICE_RECONNECTING.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      connectedKey.set(voiceSessionController.isConnected.read(reader));
      connectingKey.set(voiceSessionController.isConnecting.read(reader));
      reconnectingKey.set(voiceSessionController.isReconnecting.read(reader));
      listeningKey.set(voiceSessionController.voiceState.read(reader) === "listening");
    }));
  }
};

AgentsVoiceConnectedKeyContribution = __decorateClass([
  __decorateParam(0, IVoiceSessionController),
  __decorateParam(1, IContextKeyService)
], AgentsVoiceConnectedKeyContribution);

registerWorkbenchContribution2(AgentsVoiceConnectedKeyContribution.ID, AgentsVoiceConnectedKeyContribution, WorkbenchPhase.Eventually);

var AgentsVoiceTelemetryContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentsVoiceTelemetry";
  }
  static {
    this._ENABLED_AT_KEY = "agents.voice.enabledAtMs";
  }
  constructor(configurationService, telemetryService, storageService) {
    super();
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("agents.voice.enabled")) {
        const enabled = configurationService.getValue("agents.voice.enabled");
        if (enabled) {
          storageService.store(AgentsVoiceTelemetryContribution._ENABLED_AT_KEY, Date.now(), 0 /* PROFILE */, 1 /* MACHINE */);
          telemetryService.publicLog2("voiceEnabled", { source: "setting" });
        } else {
          const enabledAt = storageService.getNumber(AgentsVoiceTelemetryContribution._ENABLED_AT_KEY, 0 /* PROFILE */, 0);
          const daysActive = enabledAt ? Math.round((Date.now() - enabledAt) / (1e3 * 60 * 60 * 24)) : 0;
          telemetryService.publicLog2("voiceDisabled", { daysActive });
          storageService.remove(AgentsVoiceTelemetryContribution._ENABLED_AT_KEY, 0 /* PROFILE */);
        }
      }
    }));
  }
};

AgentsVoiceTelemetryContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IStorageService)
], AgentsVoiceTelemetryContribution);

registerWorkbenchContribution2(AgentsVoiceTelemetryContribution.ID, AgentsVoiceTelemetryContribution, WorkbenchPhase.AfterRestored);

var AgentsVoiceOnboardingContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentsVoiceOnboarding";
  }
  constructor(voiceSessionController, voiceModeOnboardingService) {
    super();
    this._register(autorun((reader) => {
      if (voiceSessionController.isConnecting.read(reader) || voiceSessionController.isConnected.read(reader)) {
        voiceModeOnboardingService.showIfNeeded();
      }
    }));
  }
};

AgentsVoiceOnboardingContribution = __decorateClass([
  __decorateParam(0, IVoiceSessionController),
  __decorateParam(1, IVoiceModeOnboardingService)
], AgentsVoiceOnboardingContribution);

registerWorkbenchContribution2(AgentsVoiceOnboardingContribution.ID, AgentsVoiceOnboardingContribution, WorkbenchPhase.Eventually);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.connecting",
      title: localize2(7837, "Connecting..."),
      icon: Codicon.loadingCompact,
      precondition: ContextKeyExpr.and(
        AGENTS_VOICE_ENABLED,
        ContextKeyExpr.or(
          AGENTS_VOICE_CONNECTING.isEqualTo(true),
          AGENTS_VOICE_RECONNECTING.isEqualTo(true)
        )
      ),
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(
          SegmentedVoiceInputModePillInactive,
          AGENTS_VOICE_ENABLED,
          ContextKeyExpr.notEquals(`config.${"agents.voice.showButton" /* ShowButton */}`, false),
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ContextKeyExpr.or(
            AGENTS_VOICE_CONNECTING.isEqualTo(true),
            AGENTS_VOICE_RECONNECTING.isEqualTo(true)
          ),
          VOICE_ACTIVE_ON_SURFACE
        ),
        group: "navigation",
        order: -10
      }
    });
  }
  async run() {
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.startVoiceInChat",
      title: localize2(7844, "Voice Mode"),
      icon: Codicon.voiceModeCompact,
      precondition: AGENTS_VOICE_ENABLED,
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(
          SegmentedVoiceInputModePillInactive,
          AGENTS_VOICE_ENABLED,
          ContextKeyExpr.notEquals(`config.${"agents.voice.showButton" /* ShowButton */}`, false),
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ChatContextKeys.currentlyEditing.negate(),
          AGENTS_VOICE_LISTENING.negate(),
          AGENTS_VOICE_CONNECTING.negate(),
          AGENTS_VOICE_RECONNECTING.negate(),
          // Hide Voice Mode while dictation is active (recording or the
          // model is loading) so the two mic affordances never compete.
          ChatContextKeys.speechToTextRecording.negate(),
          ChatContextKeys.speechToTextPreparing.negate()
        ),
        group: "navigation",
        order: -10
      },
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */,
        when: ContextKeyExpr.and(
          SegmentedVoiceInputModePillInactive,
          AGENTS_VOICE_ENABLED,
          ChatContextKeys.inChatInput
        )
      }
    });
  }
  async run(accessor) {
    const voiceController = accessor.get(IVoiceSessionController);
    const keybindingService = accessor.get(IKeybindingService);
    const handsFree = accessor.get(IConfigurationService).getValue("agents.voice.handsFree") === true;
    const activeWindow = getActiveWindow();
    voiceController.setActiveWindow(activeWindow);
    const holdMode = keybindingService.enableKeybindingHoldMode("agentsVoice.startVoiceInChat");
    const currentSession = await accessor.get(ICommandService).executeCommand("_chat.voice.getCurrentSession");
    if (currentSession) {
      try {
        const resource = URI.parse(currentSession);
        if (resource.scheme === "sessions-voice") {
          voiceController.setDraftTarget();
        } else {
          voiceController.setTargetSession(resource);
          voiceController.activateSession(resource);
        }
      } catch {
      }
    }
    const wasConnected = voiceController.isConnected.get();
    if (!wasConnected) {
      await voiceController.connect(activeWindow);
    }
    if (!holdMode && !handsFree && !wasConnected) {
      return;
    }
    voiceController.pttDown();
    if (!holdMode) {
      voiceController.pttUp();
      return;
    }
    await holdMode;
    voiceController.pttUp();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.pttStopInChat",
      title: localize2(7841, "Voice Mode: Stop Recording"),
      icon: Codicon.voiceModeCompact,
      precondition: ContextKeyExpr.and(
        AGENTS_VOICE_ENABLED,
        AGENTS_VOICE_LISTENING.isEqualTo(true)
      ),
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(
          SegmentedVoiceInputModePillInactive,
          AGENTS_VOICE_ENABLED,
          ContextKeyExpr.notEquals(`config.${"agents.voice.showButton" /* ShowButton */}`, false),
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ChatContextKeys.currentlyEditing.negate(),
          AGENTS_VOICE_LISTENING.isEqualTo(true),
          VOICE_ACTIVE_ON_SURFACE
        ),
        group: "navigation",
        order: -10
      }
      // NOTE: intentionally no keybinding. The Cmd+Shift+Space chord is
      // owned solely by `agentsVoice.startVoiceInChat`, which handles both
      // starting and stopping (via the controller's push-to-talk model).
      // Binding the same chord here as well caused the two actions to
      // fight on every OS key-repeat, producing rapid start/stop toggling.
    });
  }
  async run(accessor) {
    const voiceController = accessor.get(IVoiceSessionController);
    voiceController.stopListening();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.disconnect",
      title: localize2(7838, "Disconnect Voice Mode"),
      icon: Codicon.debugDisconnectCompact,
      f1: true,
      precondition: ContextKeyExpr.and(
        AGENTS_VOICE_ENABLED,
        AGENTS_VOICE_CONNECTED.isEqualTo(true)
      ),
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(
          AGENTS_VOICE_ENABLED,
          ContextKeyExpr.notEquals(`config.${"agents.voice.showButton" /* ShowButton */}`, false),
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ChatContextKeys.currentlyEditing.negate(),
          AGENTS_VOICE_CONNECTED.isEqualTo(true),
          VOICE_ACTIVE_ON_SURFACE,
          // The segmented voice pill's voice cell is itself the on/off toggle,
          // so a separate disconnect button would be redundant there.
          SegmentedVoiceInputModePillInactive
        ),
        group: "navigation",
        order: -9
      },
      keybinding: {
        // Keep this below the editor widgets and negate their contexts so
        // Escape still dismisses IntelliSense/hover and clears selections
        // while the user is typing in the chat input.
        weight: 100 /* EditorContrib */ - 5,
        primary: 9 /* Escape */,
        when: ContextKeyExpr.and(
          AGENTS_VOICE_ENABLED,
          ChatContextKeys.inChatInput,
          AGENTS_VOICE_CONNECTED.isEqualTo(true),
          VOICE_ACTIVE_ON_SURFACE,
          // Don't disconnect voice while a request is running — pressing
          // Escape there is meant to interrupt/cancel that request, not
          // tear down the voice session (which is especially disruptive
          // in hands-free mode where there is no reconnect button).
          ChatContextKeys.hasActiveRequest.negate(),
          EditorContextKeys.hoverVisible.toNegated(),
          EditorContextKeys.hasNonEmptySelection.toNegated(),
          EditorContextKeys.hasMultipleSelections.toNegated()
        )
      }
    });
  }
  async run(accessor) {
    const voiceController = accessor.get(IVoiceSessionController);
    voiceController.disconnect("explicit");
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.cancelActiveRequest",
      title: localize2(7836, "Voice Mode: Cancel Request"),
      f1: false,
      keybinding: {
        weight: 100 /* EditorContrib */ - 5,
        primary: 9 /* Escape */,
        when: ContextKeyExpr.and(
          AGENTS_VOICE_ENABLED,
          ChatContextKeys.inChatInput,
          AGENTS_VOICE_CONNECTED.isEqualTo(true),
          // Mirror the disconnect binding's editor negations so Escape
          // still dismisses IntelliSense/hover and clears selections first.
          ChatContextKeys.hasActiveRequest,
          EditorContextKeys.hoverVisible.toNegated(),
          EditorContextKeys.hasNonEmptySelection.toNegated(),
          EditorContextKeys.hasMultipleSelections.toNegated()
        )
      }
    });
  }
  async run(accessor) {
    await accessor.get(ICommandService).executeCommand("workbench.action.chat.cancel");
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.openSettings",
      title: localize2(7840, "Voice Mode Settings"),
      f1: true,
      precondition: AGENTS_VOICE_ENABLED
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand("workbench.action.openSettings", { query: "agents.voice" });
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SHOW_VOICE_MODE_ONBOARDING_COMMAND,
      title: localize2(7842, "Voice Mode: Show Introduction"),
      f1: true,
      precondition: AGENTS_VOICE_ENABLED
    });
  }
  run(accessor) {
    if (!accessor.get(IVoiceModeOnboardingService).show()) {
      accessor.get(INotificationService).info(localize(7839, null));
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.simulateConnection",
      title: localize2(7843, "Voice: Simulate Connection (Dev)"),
      f1: true
    });
  }
  async run(accessor) {
    const voiceController = accessor.get(IVoiceSessionController);
    voiceController.simulateConnection();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.resetOnboarding",
      title: localize2(7847, "Voice: Reset Onboarding"),
      f1: true
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    storageService.remove("agentsVoice.onboardingCompleted" /* OnboardingCompleted */, 0 /* PROFILE */);
    storageService.remove("agentsVoice.introBannerShown" /* IntroBannerShown */, -1 /* APPLICATION */);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "agentsVoice.pushToTalk",
      title: localize2(7846, "Voice Mode: Push to Talk"),
      f1: true,
      precondition: AGENTS_VOICE_ENABLED,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */,
        when: ContextKeyExpr.and(
          AGENTS_VOICE_WIDGET_FOCUSED,
          ContextKeyExpr.not("inputFocus")
        )
      }
    });
  }
  async run(accessor) {
    const voiceController = accessor.get(IVoiceSessionController);
    const keybindingService = accessor.get(IKeybindingService);
    const holdMode = keybindingService.enableKeybindingHoldMode("agentsVoice.pushToTalk");
    if (!voiceController.isConnected.get() && !voiceController.isConnecting.get()) {
      await voiceController.connect(getActiveWindow());
    }
    if (!voiceController.isConnected.get()) {
      return;
    }
    voiceController.pttDown();
    if (!holdMode) {
      voiceController.pttUp();
      return;
    }
    await holdMode;
    voiceController.pttUp();
  }
});

var configurationRegistry14 = Registry.as(Extensions4.Configuration);

configurationRegistry14.registerConfiguration({
  id: "agentsVoice",
  title: localize(7845, null),
  type: "object",
  properties: {
    "agents.voice.enabled": {
      type: "boolean",
      description: localize(7811, null),
      default: false,
      experiment: {
        mode: "auto"
      },
      tags: ["experimental"],
      scope: 1 /* APPLICATION */,
      restricted: true
    },
    ["agents.voice.showButton" /* ShowButton */]: {
      type: "boolean",
      markdownDescription: localize(7825, null),
      default: true,
      tags: ["experimental"],
      scope: 1 /* APPLICATION */
    },
    "agents.voice.backendUrl": {
      type: "string",
      description: localize(7810, null),
      default: "",
      scope: 1 /* APPLICATION */,
      included: false
    },
    "agents.voice.speakResponses": {
      type: "boolean",
      markdownDescription: localize(7827, null),
      default: true,
      scope: 1 /* APPLICATION */
    },
    [VOICE_AGENT_PROGRESS_SETTING]: {
      type: "boolean",
      markdownDescription: localize(7809, null),
      default: true,
      tags: ["experimental"],
      scope: 1 /* APPLICATION */
    },
    "agents.voice.voice": {
      type: "string",
      enum: ["harper_neutral", "birch_neutral", "junho_neutral", "oak_neutral"],
      enumItemLabels: ["Harper", "Birch", "Junho", "Oak"],
      enumDescriptions: [
        localize(7833, null),
        localize(7832, null),
        localize(7834, null),
        localize(7835, null)
      ],
      markdownDescription: localize(7831, null, CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID),
      default: "birch_neutral",
      scope: 1 /* APPLICATION */
    },
    "agents.voice.language": {
      type: "string",
      enum: ["auto", "en", "de", "es", "fr", "it", "pt", "ja", "ko", "zh"],
      enumItemLabels: [
        localize(7814, null),
        localize(7816, null),
        localize(7815, null),
        localize(7817, null),
        localize(7818, null),
        localize(7819, null),
        localize(7822, null),
        localize(7820, null),
        localize(7821, null),
        localize(7823, null)
      ],
      markdownDescription: localize(7813, null),
      default: "auto",
      scope: 1 /* APPLICATION */
    },
    "agents.voice.showTranscript": {
      type: "boolean",
      markdownDescription: localize(7826, null),
      default: false,
      scope: 1 /* APPLICATION */
    },
    "agents.voice.liveTranscript": {
      type: "boolean",
      markdownDescription: localize(7824, null),
      default: false,
      scope: 1 /* APPLICATION */
    },
    "agents.voice.handsFree": {
      type: "boolean",
      markdownDescription: localize(7812, null, "`#agents.voice.turn.silenceMs#`", "`#agents.voice.turn.stopPhrases#`"),
      default: true,
      scope: 1 /* APPLICATION */
    },
    "agents.voice.turn.silenceMs": {
      type: "number",
      markdownDescription: localize(7828, null, "`#agents.voice.turn.stopPhrases#`", "`#agents.voice.handsFree#`"),
      default: 800,
      anyOf: [
        {
          const: -1,
          description: localize(7829, null)
        },
        {
          type: "number",
          minimum: 200,
          maximum: 5e3
        }
      ],
      scope: 1 /* APPLICATION */
    },
    "agents.voice.turn.stopPhrases": {
      type: "array",
      items: { type: "string" },
      markdownDescription: localize(7830, null, "`#agents.voice.turn.silenceMs#`", "`#agents.voice.handsFree#`"),
      default: ["send it"],
      scope: 1 /* APPLICATION */
    }
  }
});

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "agents.voice.voice",
  includeApplication: true,
  migrateFn: (value2) => ({ value: normalizeAgentsVoiceId(value2) })
}, {
  key: "agents.voice.turn.autoEndMode",
  migrateFn: (value2) => {
    const result = [["agents.voice.turn.autoEndMode", { value: void 0 }]];
    if (value2 === "off" || value2 === "vad" || value2 === "phrase" || value2 === "both") {
      const silenceEnabled = value2 === "vad" || value2 === "both";
      const phraseEnabled = value2 === "phrase" || value2 === "both";
      if (!silenceEnabled) {
        result.push(["agents.voice.turn.silenceMs", { value: -1 }]);
      }
      if (!phraseEnabled) {
        result.push(["agents.voice.turn.stopPhrases", { value: [] }]);
      }
    }
    return result;
  }
}]);
export { AGENTS_VOICE_WIDGET_FOCUSED, AGENTS_VOICE_INITIATED_HERE, VOICE_ACTIVE_ON_SURFACE, AgentsVoiceEntitlementKeyContribution, AgentsVoiceConnectedKeyContribution, AgentsVoiceTelemetryContribution, AgentsVoiceOnboardingContribution, configurationRegistry14 };
