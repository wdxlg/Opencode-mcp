// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputModeContextKeys.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { AGENTS_VOICE_CONNECTED, AGENTS_VOICE_ENABLED } from "./module-1344.mjs";


// src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputModeContextKeys.ts
var VoiceModeButtonShown = ContextKeyExpr.notEquals("config.agents.voice.showButton", false);

var DictationConfigured = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.has(ChatContextKeys.speechToTextConfigured.key));

var DictationButtonShown = ContextKeyExpr.notEquals("config.dictation.showButton", false);

var VisibleVoiceMode = ContextKeyExpr.and(AGENTS_VOICE_ENABLED, VoiceModeButtonShown);

var VisibleDictation = ContextKeyExpr.and(DictationConfigured, DictationButtonShown);

var SegmentedVoiceInputModePillActive = ContextKeyExpr.and(
  VisibleVoiceMode,
  ContextKeyExpr.or(
    VisibleDictation,
    AGENTS_VOICE_CONNECTED
  )
);

var SegmentedVoiceInputModePillInactive = SegmentedVoiceInputModePillActive.negate();
export { VoiceModeButtonShown, DictationConfigured, DictationButtonShown, VisibleVoiceMode, VisibleDictation, SegmentedVoiceInputModePillActive, SegmentedVoiceInputModePillInactive };
