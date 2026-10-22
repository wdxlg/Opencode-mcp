// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatDynamicVariables.ts
import { Disposable, MutableDisposable, dispose, isDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { coalesce } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { toAttachedContextDynamicVariable } from "./module-0984.mjs";
import { IChatRequestVariableEntry, isImageVariableEntry } from "./module-0980.mjs";
import { URI } from "./module-0032.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { isLocation } from "./module-0164.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatDynamicVariables.ts
var dynamicVariableDecorationType = "chat-dynamic-variable";

var ChatDynamicVariableModel = class extends Disposable {
  constructor(widget, labelService) {
    super();
    this.widget = widget;
    this.labelService = labelService;
    this._variables = [];
    this._onDidChangeReferences = this._register(new Emitter());
    /**
     * Fires whenever the set of dynamic-variable references changes (added,
     * removed, moved, or restored). Consumers that render UI derived from the
     * references should listen to this instead of relying on
     * `onDidChangeParsedInput`, which does not fire when a reference is added
     * without changing the parsed request (e.g. a `/command` reference that the
     * parser resolves as a slash-prompt part).
     */
    this.onDidChangeReferences = this._onDidChangeReferences.event;
    this.decorationData = [];
    this._editorListener = this._register(new MutableDisposable());
    this._subscribeToEditor();
    this._register(widget.onDidChangeActiveInputEditor(() => {
      this._subscribeToEditor();
      this.updateDecorations();
    }));
    this._register(widget.input.attachmentModel.onDidChange(() => this.updateDecorations()));
  }
  static {
    this.ID = "chatDynamicVariableModel";
  }
  get variables() {
    return [...this._variables];
  }
  get id() {
    return ChatDynamicVariableModel.ID;
  }
  _subscribeToEditor() {
    this._editorListener.value = this.widget.inputEditor.onDidChangeModelContent((e4) => {
      const removed = [];
      let didChange = false;
      this._variables = coalesce(this._variables.map((ref, idx) => {
        const model = this.widget.inputEditor.getModel();
        if (!model) {
          removed.push(ref);
          return null;
        }
        const data = this.decorationData[idx];
        if (!data) {
          removed.push(ref);
          return null;
        }
        const newRange = model.getDecorationRange(data.id);
        if (!newRange) {
          removed.push(ref);
          return null;
        }
        const newText = model.getValueInRange(newRange);
        if (newText !== data.text) {
          const replacement = e4.changes.find(
            (change) => change.rangeOffset <= data.rangeOffset && change.rangeOffset + change.rangeLength >= data.rangeOffset + data.text.length
          );
          const preservedRange = replacement && this.findReferenceRangeInReplacement(model, e4.changes, replacement, data);
          if (preservedRange) {
            didChange = true;
            return { ...ref, range: preservedRange };
          }
          if (!replacement) {
            this.widget.inputEditor.executeEdits(this.id, [{
              range: newRange,
              text: ""
            }]);
            this.widget.refreshParsedInput();
          }
          removed.push(ref);
          return null;
        }
        if (newRange.equalsRange(ref.range)) {
          return ref;
        }
        didChange = true;
        return { ...ref, range: newRange };
      }));
      dispose(removed.filter(isDisposable));
      if (didChange || removed.length > 0) {
        this.widget.refreshParsedInput();
        this._onDidChangeReferences.fire();
      }
      this.updateDecorations();
    });
  }
  findReferenceRangeInReplacement(model, changes, replacement, data) {
    if (!data.text) {
      return void 0;
    }
    const previousRelativeOffset = data.rangeOffset - replacement.rangeOffset;
    let matchOffset = replacement.text.indexOf(data.text);
    let closestMatchOffset = matchOffset;
    while (matchOffset !== -1) {
      if (Math.abs(matchOffset - previousRelativeOffset) < Math.abs(closestMatchOffset - previousRelativeOffset)) {
        closestMatchOffset = matchOffset;
      }
      matchOffset = replacement.text.indexOf(data.text, matchOffset + data.text.length);
    }
    if (closestMatchOffset === -1) {
      return void 0;
    }
    const precedingChangesDelta = changes.reduce((delta2, change) => change.rangeOffset < replacement.rangeOffset ? delta2 + change.text.length - change.rangeLength : delta2, 0);
    const startOffset = replacement.rangeOffset + precedingChangesDelta + closestMatchOffset;
    const range2 = Range2.fromPositions(
      model.getPositionAt(startOffset),
      model.getPositionAt(startOffset + data.text.length)
    );
    return model.getValueInRange(range2) === data.text ? range2 : void 0;
  }
  getInputState(contrib) {
    contrib[ChatDynamicVariableModel.ID] = [...this._variables];
  }
  setInputState(contrib) {
    let s = contrib[ChatDynamicVariableModel.ID];
    if (!Array.isArray(s)) {
      s = [];
    }
    this.disposeVariables();
    this._variables = [];
    for (const variable of s) {
      if (!isDynamicVariable(variable)) {
        continue;
      }
      this.addReference(variable);
    }
  }
  addReference(ref) {
    if (!isValidEditorRange(ref.range)) {
      return;
    }
    const existingAttachment = this.widget.input.attachmentModel.attachments.find((attachment) => attachment.id === ref.id && !attachment.range);
    if (existingAttachment) {
      ref = toAttachedContextDynamicVariable(existingAttachment, ref.range);
    }
    this._variables.push(ref);
    this.updateDecorations();
    this.widget.refreshParsedInput();
    this._onDidChangeReferences.fire();
  }
  updateDecorations() {
    const model = this.widget.inputEditor.getModel();
    if (!model) {
      this.decorationData = [];
      return;
    }
    const validVariables = this._variables.filter((v2) => isValidEditorRange(v2.range));
    const decorationIds = this.widget.inputEditor.setDecorationsByType("chat", dynamicVariableDecorationType, validVariables.map((r2) => ({
      range: r2.range,
      hoverMessage: this.getHoverForReference(r2)
    })));
    this._variables = validVariables.slice(0, decorationIds.length);
    this.decorationData = [];
    for (let i2 = 0; i2 < decorationIds.length; i2++) {
      const range2 = this._variables[i2].range;
      this.decorationData.push({
        id: decorationIds[i2],
        text: model.getValueInRange(range2),
        rangeOffset: model.getOffsetAt({ lineNumber: range2.startLineNumber, column: range2.startColumn })
      });
    }
  }
  getHoverForReference(ref) {
    const attachment = this.widget.input.attachmentModel.attachments.find((attachment2) => attachment2.id === ref.id && !attachment2.range);
    if (attachment) {
      return isImageVariableEntry(attachment) ? void 0 : this.createAttachmentLabelHover(attachment);
    }
    const value2 = ref.data;
    if (URI.isUri(value2)) {
      return new MarkdownString(this.labelService.getUriLabel(value2, { relative: true }));
    } else if (isLocation(value2)) {
      const prefix = ref.fullName ? ` ${ref.fullName}` : "";
      const rangeString = `#${value2.range.startLineNumber}-${value2.range.endLineNumber}`;
      return new MarkdownString(prefix + this.labelService.getUriLabel(value2.uri, { relative: true }) + rangeString);
    } else {
      return void 0;
    }
  }
  createAttachmentLabelHover(attachment) {
    const resource = IChatRequestVariableEntry.toUri(attachment) ?? attachment.references?.find((reference) => URI.isUri(reference.reference))?.reference;
    const label3 = URI.isUri(resource) ? this.labelService.getUriLabel(resource, { relative: true }) : attachment.modelDescription ?? attachment.fullName ?? attachment.name;
    return new MarkdownString().appendText(label3);
  }
  /**
   * Dispose all existing variables.
   */
  disposeVariables() {
    for (const variable of this._variables) {
      if (isDisposable(variable)) {
        variable.dispose();
      }
    }
  }
  dispose() {
    this.disposeVariables();
    super.dispose();
  }
};

ChatDynamicVariableModel = __decorateClass([
  __decorateParam(1, ILabelService)
], ChatDynamicVariableModel);

function isDynamicVariable(obj) {
  return obj && typeof obj.id === "string" && Range2.isIRange(obj.range) && isValidEditorRange(obj.range) && "data" in obj;
}

function isValidEditorRange(range2) {
  if (range2.startLineNumber < 1 || range2.endLineNumber < 1 || range2.startColumn < 1 || range2.endColumn < 1) {
    return false;
  }
  if (range2.startLineNumber > range2.endLineNumber) {
    return false;
  }
  if (range2.startLineNumber === range2.endLineNumber && range2.startColumn >= range2.endColumn) {
    return false;
  }
  return true;
}

function isAddDynamicVariableContext(context2) {
  return "widget" in context2 && "range" in context2 && "variableData" in context2;
}

var AddDynamicVariableAction = class _AddDynamicVariableAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.addDynamicVariable";
  }
  constructor() {
    super({
      id: _AddDynamicVariableAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    if (!isAddDynamicVariableContext(context2)) {
      return;
    }
    let range2 = context2.range;
    const variableData = context2.variableData;
    const doCleanup = () => {
      context2.widget.inputEditor.executeEdits("chatInsertDynamicVariableWithArguments", [{ range: context2.range, text: `` }]);
    };
    if (context2.command) {
      const commandService = accessor.get(ICommandService);
      const selection = await commandService.executeCommand(context2.command.id, ...context2.command.arguments ?? []);
      if (!selection) {
        doCleanup();
        return;
      }
      const insertText = ":" + selection;
      const insertRange = new Range2(range2.startLineNumber, range2.endColumn, range2.endLineNumber, range2.endColumn + insertText.length);
      range2 = new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, range2.endColumn + insertText.length);
      const editor = context2.widget.inputEditor;
      const success = editor.executeEdits("chatInsertDynamicVariableWithArguments", [{ range: insertRange, text: insertText + " " }]);
      if (!success) {
        doCleanup();
        return;
      }
    }
    context2.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: context2.id,
      range: range2,
      isFile: true,
      data: variableData
    });
  }
};

registerAction2(AddDynamicVariableAction);
export { isDynamicVariable, isValidEditorRange, isAddDynamicVariableContext, dynamicVariableDecorationType, ChatDynamicVariableModel, AddDynamicVariableAction };
