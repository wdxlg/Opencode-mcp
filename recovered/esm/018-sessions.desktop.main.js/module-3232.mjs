// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestTelemetry.ts
import { Disposable } from "./module-0012.mjs";
import { isString } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/terminalSuggestTelemetry.ts
var TerminalSuggestTelemetry = class extends Disposable {
  constructor(commandDetection, _promptInputModel, _telemetryService) {
    super();
    this._promptInputModel = _promptInputModel;
    this._telemetryService = _telemetryService;
    this._kindMap = /* @__PURE__ */ new Map([
      [0 /* File */, "File"],
      [1 /* Folder */, "Folder"],
      [2 /* Method */, "Method"],
      [3 /* Alias */, "Alias"],
      [4 /* Argument */, "Argument"],
      [5 /* Option */, "Option"],
      [6 /* OptionValue */, "Option Value"],
      [7 /* Flag */, "Flag"],
      [100 /* InlineSuggestion */, "Inline Suggestion"],
      [101 /* InlineSuggestionAlwaysOnTop */, "Inline Suggestion"]
    ]);
    this._register(commandDetection.onCommandFinished((e4) => {
      this._sendTelemetryInfo(false, e4.exitCode);
      this._acceptedCompletions = void 0;
    }));
    this._register(this._promptInputModel.onDidInterrupt(() => {
      this._sendTelemetryInfo(true);
      this._acceptedCompletions = void 0;
    }));
  }
  acceptCompletion(sessionId, completion, commandLine) {
    if (!completion || !commandLine) {
      this._acceptedCompletions = void 0;
      return;
    }
    this._acceptedCompletions = this._acceptedCompletions || [];
    this._acceptedCompletions.push({ label: isString(completion.label) ? completion.label : completion.label.label, kind: this._kindMap.get(completion.kind), sessionId, provider: completion.provider });
  }
  /**
   * Logs the latency (ms) from completion request to completions shown.
   * @param sessionId The terminal session ID
   * @param latency The measured latency in ms
   * @param firstShownFor Object indicating if completions have been shown for window/shell
   */
  logCompletionLatency(sessionId, latency, firstShownFor) {
    this._telemetryService.publicLog2("terminal.suggest.completionLatency", {
      terminalSessionId: sessionId,
      latency,
      firstWindow: firstShownFor.window,
      firstShell: firstShownFor.shell
    });
  }
  _sendTelemetryInfo(fromInterrupt, exitCode) {
    const commandLine = this._promptInputModel?.value;
    for (const completion of this._acceptedCompletions || []) {
      const label3 = completion?.label;
      const kind = completion?.kind;
      const provider = completion?.provider;
      if (label3 === void 0 || commandLine === void 0 || kind === void 0 || provider === void 0) {
        return;
      }
      let outcome;
      if (fromInterrupt) {
        outcome = "Interrupted" /* Interrupted */;
      } else if (commandLine.trim() && commandLine.includes(label3)) {
        outcome = "Accepted" /* Accepted */;
      } else if (inputContainsFirstHalfOfLabel(commandLine, label3)) {
        outcome = "AcceptedWithEdit" /* AcceptedWithEdit */;
      } else {
        outcome = "Deleted" /* Deleted */;
      }
      this._telemetryService.publicLog2("terminal.suggest.acceptedCompletion", {
        kind,
        outcome,
        exitCode,
        terminalSessionId: completion.sessionId,
        provider
      });
    }
  }
};

TerminalSuggestTelemetry = __decorateClass([
  __decorateParam(2, ITelemetryService)
], TerminalSuggestTelemetry);

function inputContainsFirstHalfOfLabel(commandLine, label3) {
  return commandLine.includes(label3.substring(0, Math.ceil(label3.length / 2)));
}
export { inputContainsFirstHalfOfLabel, TerminalSuggestTelemetry };
