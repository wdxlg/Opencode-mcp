// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/parameterHints/browser/parameterHintsModel.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CharacterSet } from "./module-0121.mjs";
import { Delayer, createCancelablePromise } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { provideSignatureHelp } from "./module-0828.mjs";


// src/vs/editor/contrib/parameterHints/browser/parameterHintsModel.ts
var ParameterHintState;

((ParameterHintState2) => {
  let Type3;
  ((Type4) => {
    Type4[Type4["Default"] = 0] = "Default";
    Type4[Type4["Active"] = 1] = "Active";
    Type4[Type4["Pending"] = 2] = "Pending";
  })(Type3 = ParameterHintState2.Type || (ParameterHintState2.Type = {}));
  ParameterHintState2.Default = { type: 0 /* Default */ };
  class Pending {
    constructor(request2, previouslyActiveHints) {
      this.request = request2;
      this.previouslyActiveHints = previouslyActiveHints;
      this.type = 2 /* Pending */;
    }
  }
  ParameterHintState2.Pending = Pending;
  class Active {
    constructor(hints) {
      this.hints = hints;
      this.type = 1 /* Active */;
    }
  }
  ParameterHintState2.Active = Active;
})(ParameterHintState || (ParameterHintState = {}));

var ParameterHintsModel = class _ParameterHintsModel extends Disposable {
  constructor(editor, providers2, delay = _ParameterHintsModel.DEFAULT_DELAY) {
    super();
    // ms
    this._onChangedHints = this._register(new Emitter());
    this.onChangedHints = this._onChangedHints.event;
    this.triggerOnType = false;
    this._state = ParameterHintState.Default;
    this._pendingTriggers = [];
    this._lastSignatureHelpResult = this._register(new MutableDisposable());
    this.triggerChars = new CharacterSet();
    this.retriggerChars = new CharacterSet();
    this.triggerId = 0;
    this.editor = editor;
    this.providers = providers2;
    this.throttledDelayer = this._register(new Delayer(delay));
    this._register(this.editor.onDidBlurEditorWidget(() => this.cancel()));
    this._register(this.editor.onDidChangeConfiguration(() => this.onEditorConfigurationChange()));
    this._register(this.editor.onDidChangeModel((e4) => this.onModelChanged()));
    this._register(this.editor.onDidChangeModelLanguage((_) => this.onModelChanged()));
    this._register(this.editor.onDidChangeCursorSelection((e4) => this.onCursorChange(e4)));
    this._register(this.editor.onDidChangeModelContent((e4) => this.onModelContentChange()));
    this._register(this.providers.onDidChange(this.onModelChanged, this));
    this._register(this.editor.onDidType((text2) => this.onDidType(text2)));
    this.onEditorConfigurationChange();
    this.onModelChanged();
  }
  static {
    this.DEFAULT_DELAY = 120;
  }
  get state() {
    return this._state;
  }
  set state(value2) {
    if (this._state.type === 2 /* Pending */) {
      this._state.request.cancel();
    }
    this._state = value2;
  }
  cancel(silent = false) {
    this.state = ParameterHintState.Default;
    this.throttledDelayer.cancel();
    if (!silent) {
      this._onChangedHints.fire(void 0);
    }
  }
  trigger(context2, delay) {
    const model = this.editor.getModel();
    if (!model || !this.providers.has(model)) {
      return;
    }
    const triggerId = ++this.triggerId;
    this._pendingTriggers.push(context2);
    this.throttledDelayer.trigger(() => {
      return this.doTrigger(triggerId);
    }, delay).catch(onUnexpectedError);
  }
  next() {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    const length = this.state.hints.signatures.length;
    const activeSignature = this.state.hints.activeSignature;
    const last = activeSignature % length === length - 1;
    const cycle = this.editor.getOption(98 /* parameterHints */).cycle;
    if ((length < 2 || last) && !cycle) {
      this.cancel();
      return;
    }
    this.updateActiveSignature(last && cycle ? 0 : activeSignature + 1);
  }
  previous() {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    const length = this.state.hints.signatures.length;
    const activeSignature = this.state.hints.activeSignature;
    const first2 = activeSignature === 0;
    const cycle = this.editor.getOption(98 /* parameterHints */).cycle;
    if ((length < 2 || first2) && !cycle) {
      this.cancel();
      return;
    }
    this.updateActiveSignature(first2 && cycle ? length - 1 : activeSignature - 1);
  }
  updateActiveSignature(activeSignature) {
    if (this.state.type !== 1 /* Active */) {
      return;
    }
    this.state = new ParameterHintState.Active({ ...this.state.hints, activeSignature });
    this._onChangedHints.fire(this.state.hints);
  }
  async doTrigger(triggerId) {
    const isRetrigger = this.state.type === 1 /* Active */ || this.state.type === 2 /* Pending */;
    const activeSignatureHelp = this.getLastActiveHints();
    this.cancel(true);
    if (this._pendingTriggers.length === 0) {
      return false;
    }
    const context2 = this._pendingTriggers.reduce(mergeTriggerContexts);
    this._pendingTriggers = [];
    const triggerContext = {
      triggerKind: context2.triggerKind,
      triggerCharacter: context2.triggerCharacter,
      isRetrigger,
      activeSignatureHelp
    };
    if (!this.editor.hasModel()) {
      return false;
    }
    const model = this.editor.getModel();
    const position2 = this.editor.getPosition();
    this.state = new ParameterHintState.Pending(
      createCancelablePromise((token) => provideSignatureHelp(this.providers, model, position2, triggerContext, token)),
      activeSignatureHelp
    );
    try {
      const result = await this.state.request;
      if (triggerId !== this.triggerId) {
        result?.dispose();
        return false;
      }
      if (!result || !result.value.signatures || result.value.signatures.length === 0) {
        result?.dispose();
        this._lastSignatureHelpResult.clear();
        this.cancel();
        return false;
      } else {
        this.state = new ParameterHintState.Active(result.value);
        this._lastSignatureHelpResult.value = result;
        this._onChangedHints.fire(this.state.hints);
        return true;
      }
    } catch (error) {
      if (triggerId === this.triggerId) {
        this.state = ParameterHintState.Default;
      }
      onUnexpectedError(error);
      return false;
    }
  }
  getLastActiveHints() {
    switch (this.state.type) {
      case 1 /* Active */:
        return this.state.hints;
      case 2 /* Pending */:
        return this.state.previouslyActiveHints;
      default:
        return void 0;
    }
  }
  get isTriggered() {
    return this.state.type === 1 /* Active */ || this.state.type === 2 /* Pending */ || this.throttledDelayer.isTriggered();
  }
  onModelChanged() {
    this.cancel();
    this.triggerChars.clear();
    this.retriggerChars.clear();
    const model = this.editor.getModel();
    if (!model) {
      return;
    }
    for (const support of this.providers.ordered(model)) {
      for (const ch of support.signatureHelpTriggerCharacters || []) {
        if (ch.length) {
          const charCode = ch.charCodeAt(0);
          this.triggerChars.add(charCode);
          this.retriggerChars.add(charCode);
        }
      }
      for (const ch of support.signatureHelpRetriggerCharacters || []) {
        if (ch.length) {
          this.retriggerChars.add(ch.charCodeAt(0));
        }
      }
    }
  }
  onDidType(text2) {
    if (!this.triggerOnType) {
      return;
    }
    const lastCharIndex = text2.length - 1;
    const triggerCharCode = text2.charCodeAt(lastCharIndex);
    if (this.triggerChars.has(triggerCharCode) || this.isTriggered && this.retriggerChars.has(triggerCharCode)) {
      this.trigger({
        triggerKind: 2 /* TriggerCharacter */,
        triggerCharacter: text2.charAt(lastCharIndex)
      });
    }
  }
  onCursorChange(e4) {
    if (e4.source === "mouse") {
      this.cancel();
    } else if (this.isTriggered) {
      this.trigger({ triggerKind: 3 /* ContentChange */ });
    }
  }
  onModelContentChange() {
    if (this.isTriggered) {
      this.trigger({ triggerKind: 3 /* ContentChange */ });
    }
  }
  onEditorConfigurationChange() {
    this.triggerOnType = this.editor.getOption(98 /* parameterHints */).enabled;
    if (!this.triggerOnType) {
      this.cancel();
    }
  }
  dispose() {
    this.cancel(true);
    super.dispose();
  }
};

function mergeTriggerContexts(previous, current) {
  switch (current.triggerKind) {
    case 1 /* Invoke */:
      return current;
    case 3 /* ContentChange */:
      return previous;
    case 2 /* TriggerCharacter */:
    default:
      return current;
  }
}
export { mergeTriggerContexts, ParameterHintState, ParameterHintsModel };
