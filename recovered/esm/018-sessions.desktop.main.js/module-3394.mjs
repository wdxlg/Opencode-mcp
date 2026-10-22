// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/speech/browser/speechAccessibilitySignal.ts
import { Disposable } from "./module-0012.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISpeechService } from "./module-1254.mjs";


// src/vs/workbench/contrib/speech/browser/speechAccessibilitySignal.ts
var SpeechAccessibilitySignalContribution = class extends Disposable {
  constructor(_accessibilitySignalService, _speechService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._speechService = _speechService;
    this._register(this._speechService.onDidStartSpeechToTextSession(() => this._accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStarted)));
    this._register(this._speechService.onDidEndSpeechToTextSession(() => this._accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStopped)));
  }
  static {
    this.ID = "workbench.contrib.speechAccessibilitySignal";
  }
};

SpeechAccessibilitySignalContribution = __decorateClass([
  __decorateParam(0, IAccessibilitySignalService),
  __decorateParam(1, ISpeechService)
], SpeechAccessibilitySignalContribution);
export { SpeechAccessibilitySignalContribution };
