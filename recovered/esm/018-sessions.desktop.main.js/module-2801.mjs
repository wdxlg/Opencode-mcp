// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCommandArgumentHint.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { ChatDynamicVariableModel } from "./module-0985.mjs";
import { getAgentHostCompletionReferenceKindFromValue } from "./module-0980.mjs";
import { getCommandArgumentHint } from "./module-2795.mjs";
import { getInputPlaceholderColor, getRangeForPlaceholder } from "./module-2800.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ChatWidget } from "./module-2369.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/editor/chatInputCommandArgumentHint.ts
var decorationDescription = "chat";

var commandArgumentHintDecorationType = "chat-command-argument-hint";

var InputEditorCommandArgumentHint = class extends Disposable {
  constructor(widget, codeEditorService, themeService) {
    super();
    this.widget = widget;
    this.codeEditorService = codeEditorService;
    this.themeService = themeService;
    this.id = "inputEditorCommandArgumentHint";
    /**
     * Subscription to {@link ChatDynamicVariableModel.onDidChangeReferences}.
     * Established lazily because that contribution may be constructed after this
     * one; accepting a completion adds the reference via a command that runs
     * after the insert, and it does not change the parsed input, so neither
     * `onDidChangeModelContent` nor `onDidChangeParsedInput` re-fires with the
     * reference present — this event is what triggers the hint on accept.
     */
    this._referencesListener = this._register(new MutableDisposable());
    this._register(this.codeEditorService.registerDecorationType(decorationDescription, commandArgumentHintDecorationType, {}));
    this.update();
    this._register(this.widget.onDidChangeParsedInput(() => this.update()));
    this._register(this.widget.inputEditor.onDidChangeModelContent(() => this.update()));
  }
  update() {
    this._ensureSubscribedToReferences();
    const decoration3 = this.getArgumentHintDecoration();
    this.widget.inputEditor.setDecorationsByType(decorationDescription, commandArgumentHintDecorationType, decoration3 ? [decoration3] : []);
  }
  _ensureSubscribedToReferences() {
    if (this._referencesListener.value) {
      return;
    }
    const dynamicVariableModel = this.widget.getContrib(ChatDynamicVariableModel.ID);
    if (dynamicVariableModel) {
      this._referencesListener.value = dynamicVariableModel.onDidChangeReferences(() => this.update());
    }
  }
  getArgumentHintDecoration() {
    const model = this.widget.inputEditor.getModel();
    if (!model) {
      return void 0;
    }
    const dynamicVariableModel = this.widget.getContrib(ChatDynamicVariableModel.ID);
    if (!dynamicVariableModel) {
      return void 0;
    }
    for (const ref of dynamicVariableModel.variables) {
      if (getAgentHostCompletionReferenceKindFromValue(ref.data) !== "command" /* Command */) {
        continue;
      }
      const argumentHint = getCommandArgumentHint(ref._meta);
      if (!argumentHint) {
        continue;
      }
      if (!this.isCommandOnlyContent(model, ref.range)) {
        return void 0;
      }
      return {
        range: getRangeForPlaceholder(ref.range),
        renderOptions: {
          after: {
            contentText: argumentHint,
            color: getInputPlaceholderColor(this.themeService)
          }
        }
      };
    }
    return void 0;
  }
  isCommandOnlyContent(model, range2) {
    const beforeRange = new Range2(1, 1, range2.startLineNumber, range2.startColumn);
    if (model.getValueInRange(beforeRange).trim().length > 0) {
      return false;
    }
    const fullRange = model.getFullModelRange();
    const afterRange = new Range2(range2.endLineNumber, range2.endColumn, fullRange.endLineNumber, fullRange.endColumn);
    return model.getValueInRange(afterRange) === " ";
  }
};

InputEditorCommandArgumentHint = __decorateClass([
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IThemeService)
], InputEditorCommandArgumentHint);

ChatWidget.CONTRIBS.push(InputEditorCommandArgumentHint);
export { decorationDescription, commandArgumentHintDecorationType, InputEditorCommandArgumentHint };
