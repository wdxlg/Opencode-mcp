// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/voice/browser/terminalVoice.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { TerminalInitialHintContribution } from "./module-3402.mjs";
import { isNumber } from "./module-0010.mjs";
import { SpeechTimeoutDefault } from "./module-1370.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { getDictationPreparingLabel } from "./module-2079.mjs";
import { EventType, addDisposableListener, getActiveWindow } from "./module-0075.mjs";
import { alert } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISpeechService } from "./module-1254.mjs";
import { IChatSpeechToTextService } from "./module-1348.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/contrib/terminalContrib/voice/browser/terminalVoice.ts
var symbolMap = [
  ["dollar sign", "$"],
  ["double quote", '"'],
  ["open paren", "("],
  ["close paren", ")"],
  ["open parenthesis", "("],
  ["close parenthesis", ")"],
  ["open bracket", "["],
  ["close bracket", "]"],
  ["open brace", "{"],
  ["close brace", "}"],
  ["open angle bracket", "<"],
  ["close angle bracket", ">"],
  ["greater than", ">"],
  ["less than", "<"],
  ["ampersand", "&"],
  ["dollar", "$"],
  ["percent", "%"],
  ["asterisk", "*"],
  ["star", "*"],
  ["plus", "+"],
  ["equals", "="],
  ["exclamation", "!"],
  ["forward slash", "/"],
  ["slash", "/"],
  ["backslash", "\\"],
  ["pipe", "|"],
  ["tilde", "~"],
  ["caret", "^"],
  ["at sign", "@"],
  ["hashtag", "#"],
  ["pound", "#"],
  ["hash", "#"],
  ["colon", ":"],
  ["semicolon", ";"],
  ["underscore", "_"],
  ["hyphen", "-"],
  ["dash", "-"],
  ["dot", "."],
  ["period", "."],
  ["quote", "'"]
];

function postProcessTerminalDictation(text2) {
  let input = text2.replaceAll(/[.,?;!]/g, "");
  for (const [spoken, symbol] of symbolMap) {
    input = input.replace(new RegExp("\\b" + spoken + "\\b", "gi"), symbol);
  }
  input = input.replace(/^(\s*)([A-Z])/, (_, leading, letter) => leading + letter.toLowerCase());
  return input;
}

var TerminalVoiceSession = class extends Disposable {
  constructor(_speechService, _chatSpeechToTextService, _terminalService, _configurationService, contextKeyService, _hoverService, _keybindingService) {
    super();
    this._speechService = _speechService;
    this._chatSpeechToTextService = _chatSpeechToTextService;
    this._terminalService = _terminalService;
    this._configurationService = _configurationService;
    this._hoverService = _hoverService;
    this._keybindingService = _keybindingService;
    this._input = "";
    /** True while the current session is driven by the built-in on-device engine. */
    this._usingBuiltin = false;
    /** True while awaiting the built-in engine's final transcript during accept. */
    this._builtinFinalizing = false;
    this._sessionTerminalDisposed = false;
    this._disposables = this._register(new DisposableStore());
    this._decorationDisposables = this._register(new DisposableStore());
    this._terminalDictationInProgress = TerminalContextKeys.terminalDictationInProgress.bindTo(contextKeyService);
  }
  static {
    this._instance = void 0;
  }
  static getInstance(instantiationService) {
    if (!TerminalVoiceSession._instance) {
      TerminalVoiceSession._instance = instantiationService.createInstance(TerminalVoiceSession);
    }
    return TerminalVoiceSession._instance;
  }
  async start() {
    this.stop();
    const activeInstance = this._terminalService.activeInstance;
    this._sessionTerminalInstanceId = activeInstance?.instanceId;
    this._sessionTerminalDisposed = false;
    this._disposables.add(this._terminalService.onDidChangeActiveInstance((instance2) => {
      if (instance2?.instanceId !== this._sessionTerminalInstanceId) {
        this.stop();
      }
    }));
    this._disposables.add(this._terminalService.onDidDisposeInstance((instance2) => {
      if (instance2.instanceId === this._sessionTerminalInstanceId) {
        this._sessionTerminalDisposed = true;
        this.stop();
      }
    }));
    if (activeInstance) {
      TerminalInitialHintContribution.get(activeInstance)?.dispose();
    }
    let voiceTimeout = this._configurationService.getValue("accessibility.voice.speechTimeout" /* SpeechTimeout */);
    if (!isNumber(voiceTimeout) || voiceTimeout < 0) {
      voiceTimeout = SpeechTimeoutDefault;
    }
    this._acceptTranscriptionScheduler = this._disposables.add(new RunOnceScheduler(() => {
      if (this._usingBuiltin) {
        this.stop(true);
        return;
      }
      this._sendText();
      this.stop();
    }, voiceTimeout));
    this._cancellationTokenSource = new CancellationTokenSource();
    this._register(toDisposable(() => this._cancellationTokenSource?.dispose(true)));
    if (this._chatSpeechToTextService.isConfigured) {
      return this._startBuiltin(voiceTimeout);
    }
    const session = await this._speechService.createSpeechToTextSession(this._cancellationTokenSource?.token, "terminal");
    this._disposables.add(session.onDidChange((e) => {
      if (this._cancellationTokenSource?.token.isCancellationRequested) {
        return;
      }
      switch (e.status) {
        case 1 /* Started */:
          this._terminalDictationInProgress.set(true);
          if (!this._decoration) {
            this._createDecoration();
          }
          break;
        case 2 /* Recognizing */: {
          this._updateInput(e);
          this._renderGhostText(e);
          this._updateDecoration();
          if (voiceTimeout > 0) {
            this._acceptTranscriptionScheduler.cancel();
          }
          break;
        }
        case 3 /* Recognized */:
          this._updateInput(e);
          this._sendText();
          this._ghostText?.dispose();
          this._ghostText = void 0;
          this._ghostTextMarker?.dispose();
          this._ghostTextMarker = void 0;
          this._updateDecoration();
          this._input = "";
          break;
        case 4 /* Stopped */:
          this.stop();
          break;
      }
    }));
  }
  /**
   * Drive terminal dictation from the built-in on-device engine. Unlike the
   * extension provider (which emits discrete `Recognizing`/`Recognized` events
   * per utterance), the built-in engine streams a single growing cumulative
   * transcript. We render it live as ghost text and keep it staged in
   * `_input`, then send it once the silence timeout elapses or the user stops.
   */
  async _startBuiltin(voiceTimeout) {
    const service = this._chatSpeechToTextService;
    if (service.isBusy) {
      await service.cancel();
    }
    if (service.state !== "idle" /* Idle */) {
      this.stop();
      return;
    }
    this._usingBuiltin = true;
    this._terminalDictationInProgress.set(true);
    if (!this._decoration) {
      this._createDecoration();
    }
    const renderPreparing = () => {
      if (this._cancellationTokenSource?.token.isCancellationRequested || this._builtinFinalizing) {
        return;
      }
      if (service.isPreparingModel) {
        this._renderPreparingText(getDictationPreparingLabel(service));
      }
    };
    renderPreparing();
    this._disposables.add(service.onDidChangePreparingModel(() => renderPreparing()));
    this._disposables.add(service.onDidChangeModelDownloadProgress(() => renderPreparing()));
    this._disposables.add(service.onDidUpdateTranscript((update) => {
      if (this._cancellationTokenSource?.token.isCancellationRequested || this._builtinFinalizing) {
        return;
      }
      const event = { status: 2 /* Recognizing */, text: update.text };
      this._updateInput(event);
      this._renderGhostText(event);
      this._updateDecoration();
      if (voiceTimeout > 0) {
        this._acceptTranscriptionScheduler.cancel();
        this._acceptTranscriptionScheduler.schedule();
      }
    }));
    this._disposables.add(service.onDidChangeState((state) => {
      if (state === "idle" /* Idle */ && !this._builtinFinalizing && !this._cancellationTokenSource?.token.isCancellationRequested) {
        this.stop();
      }
    }));
    try {
      await service.start(getActiveWindow(), "terminal");
    } catch {
      this.stop();
    }
  }
  /**
   * Accept the built-in dictation: fetch the engine's final transcript (the
   * last utterance is only returned by `stopAndTranscribe`, not the interim
   * stream), stage it, then tear down and send it. Used by the silence timeout
   * and the Stop Dictation action; abort/error teardown uses `cancel()` instead.
   */
  async _finalizeBuiltinThenStop() {
    let finalText;
    try {
      finalText = await this._chatSpeechToTextService.stopAndTranscribe();
    } catch {
    }
    if (!this._usingBuiltin || this._cancellationTokenSource?.token.isCancellationRequested) {
      return;
    }
    if (finalText !== void 0) {
      this._updateInput({ status: 3 /* Recognized */, text: finalText });
    }
    this.stop(true);
  }
  stop(send) {
    if (this._usingBuiltin && send && !this._builtinFinalizing) {
      this._builtinFinalizing = true;
      this._acceptTranscriptionScheduler?.cancel();
      this._finalizeBuiltinThenStop();
      return;
    }
    if (this._builtinFinalizing && !send && !this._sessionTerminalDisposed && this._terminalService.activeInstance?.instanceId === this._sessionTerminalInstanceId) {
      return;
    }
    this._setInactive();
    if (send) {
      this._acceptTranscriptionScheduler.cancel();
      this._sendText();
    }
    this._ghostText = void 0;
    this._decoration?.dispose();
    this._decoration = void 0;
    this._marker?.dispose();
    this._marker = void 0;
    this._ghostTextMarker = void 0;
    this._cancellationTokenSource?.cancel();
    if (this._usingBuiltin) {
      void this._chatSpeechToTextService.cancel();
    }
    this._disposables.clear();
    this._input = "";
    this._terminalDictationInProgress.reset();
    this._usingBuiltin = false;
    this._builtinFinalizing = false;
    this._sessionTerminalInstanceId = void 0;
    this._sessionTerminalDisposed = false;
  }
  _sendText() {
    this._terminalService.activeInstance?.sendText(this._input, false);
    alert(localize(20974, null, this._input));
  }
  _updateInput(e) {
    if (e.text) {
      this._input = " " + postProcessTerminalDictation(e.text);
    }
  }
  _createDecoration() {
    const activeInstance = this._terminalService.activeInstance;
    const xterm = activeInstance?.xterm?.raw;
    if (!xterm) {
      return;
    }
    const onFirstLine = xterm.buffer.active.cursorY === 0;
    const inputLength = this._input.length;
    const xPosition = xterm.buffer.active.cursorX + inputLength;
    this._marker = activeInstance.registerMarker(onFirstLine ? 0 : -1);
    if (!this._marker) {
      return;
    }
    this._decoration = xterm.registerDecoration({
      marker: this._marker,
      layer: "top",
      x: xPosition
    });
    if (!this._decoration) {
      this._marker.dispose();
      this._marker = void 0;
      return;
    }
    this._decoration.onRender((e) => {
      e.classList.add(...ThemeIcon.asClassNameArray(Codicon.micFilled), "terminal-voice", "recording");
      e.style.transform = onFirstLine ? "translate(10px, -2px)" : "translate(-6px, -5px)";
      this._registerMicInteractions(e);
    });
  }
  /**
   * Make the recording mic icon a discoverable Stop affordance: clicking it
   * stops (and accepts) the dictation, mirroring the animated mic button in the
   * editor and chat input, and a hover surfaces the Escape keybinding so the
   * stop gesture is not hidden.
   */
  _registerMicInteractions(element) {
    if (element.dataset.terminalVoiceInteractive) {
      return;
    }
    element.dataset.terminalVoiceInteractive = "true";
    element.style.cursor = "pointer";
    this._decorationDisposables.add(addDisposableListener(element, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this._builtinFinalizing) {
        this.stop(true);
      }
    }));
    const keybindingLabel2 = this._keybindingService.lookupKeybinding("workbench.action.terminal.stopVoice" /* StopVoice */)?.getLabel();
    const title = keybindingLabel2 ? localize(20972, null, keybindingLabel2) : localize(20973, null);
    this._decorationDisposables.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), element, title));
  }
  _updateDecoration() {
    this._decorationDisposables.clear();
    this._decoration?.dispose();
    this._marker?.dispose();
    this._decoration = void 0;
    this._marker = void 0;
    this._createDecoration();
  }
  _setInactive() {
    this._decoration?.element?.classList.remove("recording");
  }
  _renderGhostText(e) {
    this._renderGhostTextContent(e.text, "terminal-voice-progress-text");
  }
  /**
   * Render a non-transcript hint (e.g. "Preparing…/Downloading… X%") in the
   * ghost-text slot while the on-device model is still preparing on first use.
   * Styled distinctly from the live transcript so it does not read as speech.
   */
  _renderPreparingText(label3) {
    this._renderGhostTextContent(label3, "terminal-voice-preparing-text");
  }
  _renderGhostTextContent(text2, className2) {
    this._ghostText?.dispose();
    if (!text2) {
      return;
    }
    const activeInstance = this._terminalService.activeInstance;
    const xterm = activeInstance?.xterm?.raw;
    if (!xterm) {
      return;
    }
    this._ghostTextMarker = activeInstance.registerMarker();
    if (!this._ghostTextMarker) {
      return;
    }
    this._disposables.add(this._ghostTextMarker);
    const onFirstLine = xterm.buffer.active.cursorY === 0;
    this._ghostText = xterm.registerDecoration({
      marker: this._ghostTextMarker,
      layer: "top",
      x: onFirstLine ? xterm.buffer.active.cursorX + 4 : xterm.buffer.active.cursorX + 1
    });
    if (this._ghostText) {
      this._disposables.add(this._ghostText);
    }
    this._ghostText?.onRender((e) => {
      e.classList.add(className2);
      e.textContent = text2;
      e.style.width = (xterm.cols - xterm.buffer.active.cursorX) / xterm.cols * 100 + "%";
    });
  }
};

TerminalVoiceSession = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IChatSpeechToTextService),
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IKeybindingService)
], TerminalVoiceSession);
export { postProcessTerminalDictation, symbolMap, TerminalVoiceSession };
