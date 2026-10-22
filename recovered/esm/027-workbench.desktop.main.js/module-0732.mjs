// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/inlineSuggestionItem.ts
import { InlineSuggestAlternativeAction } from "./module-0730.mjs";
import { Range2 } from "./module-0106.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { observableSignal } from "./module-0058.mjs";
import { observableValue } from "./module-0048.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { StringEdit, StringReplacement, applyEditsToRanges } from "./module-0193.mjs";
import { getPositionOffsetTransformerFromTextModel } from "./module-0715.mjs";
import { TextLength } from "./module-0175.mjs";
import { inlineCompletionIsVisible } from "./module-0725.mjs";
import { computeEditKind } from "./module-0724.mjs";
import { InlineSuggestData } from "./module-0729.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { TextModelValueReference } from "./module-0731.mjs";
import { TextModelText } from "./module-0521.mjs";
import { linesDiffComputers } from "./module-0196.mjs";
import { commonPrefixLength2, commonSuffixLength, splitLines } from "./module-0030.mjs";
import { StringText } from "./module-0177.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/inlineSuggestionItem.ts
var InlineSuggestionItem;

((InlineSuggestionItem2) => {
  function create2(data, textModel, shouldDiffEdit = true) {
    if (!data.isInlineEdit && !data.action?.uri && data.action?.kind === "edit") {
      return InlineCompletionItem.create(data, textModel, data.action);
    } else {
      return InlineEditItem.create(data, textModel, shouldDiffEdit);
    }
  }
  InlineSuggestionItem2.create = create2;
})(InlineSuggestionItem || (InlineSuggestionItem = {}));

function hashInlineSuggestionAction(action) {
  const obj = action?.kind === "edit" ? {
    ...action,
    alternativeAction: InlineSuggestAlternativeAction.toString(action.alternativeAction),
    target: action?.target.uri.toString()
  } : {
    ...action,
    target: action?.target.uri.toString()
  };
  return JSON.stringify(obj);
}

var InlineSuggestionItemBase = class {
  constructor(_data, identity2, hint, originalTextRef) {
    this._data = _data;
    this.identity = identity2;
    this.hint = hint;
    this.originalTextRef = originalTextRef;
  }
  /**
   * A reference to the original inline completion list this inline completion has been constructed from.
   * Used for event data to ensure referential equality.
  */
  get source() {
    return this._data.source;
  }
  get isFromExplicitRequest() {
    return this._data.context.triggerKind === 1 /* Explicit */;
  }
  get forwardStable() {
    return this.source.inlineSuggestions.enableForwardStability ?? false;
  }
  get targetRange() {
    if (this.hint) {
      return this.hint.range;
    }
    if (this.action?.kind === "edit") {
      return this.action.textReplacement.range;
    } else if (this.action?.kind === "jumpTo") {
      return Range2.fromPositions(this.action.position);
    }
    throw new BugIndicatingError("InlineSuggestionItem: Either hint or action must be set");
  }
  get semanticId() {
    return this.hash;
  }
  get gutterMenuLinkAction() {
    return this._sourceInlineCompletion.gutterMenuLinkAction;
  }
  get command() {
    return this._sourceInlineCompletion.command;
  }
  get supportsRename() {
    return this._data.supportsRename;
  }
  get warning() {
    return this._sourceInlineCompletion.warning;
  }
  get showInlineEditMenu() {
    return !!this._sourceInlineCompletion.showInlineEditMenu;
  }
  get hash() {
    return hashInlineSuggestionAction(this.action);
  }
  /** @deprecated */
  get shownCommand() {
    return this._sourceInlineCompletion.shownCommand;
  }
  get requestUuid() {
    return this._data.context.requestUuid;
  }
  get partialAccepts() {
    return this._data.partialAccepts;
  }
  /**
   * A reference to the original inline completion this inline completion has been constructed from.
   * Used for event data to ensure referential equality.
  */
  get _sourceInlineCompletion() {
    return this._data.sourceInlineCompletion;
  }
  addRef() {
    this.identity.addRef();
    this.source.addRef();
  }
  removeRef() {
    this.identity.removeRef();
    this.source.removeRef();
  }
  reportInlineEditShown(commandService, viewKind, viewData, model, timeWhenShown) {
    const insertText = this.action?.kind === "edit" ? this.action.textReplacement.text : "";
    this._data.reportInlineEditShown(commandService, insertText, viewKind, viewData, this.computeEditKind(model), timeWhenShown);
  }
  reportPartialAccept(acceptedCharacters, info, partialAcceptance) {
    this._data.reportPartialAccept(acceptedCharacters, info, partialAcceptance);
  }
  reportEndOfLife(reason) {
    this._data.reportEndOfLife(reason);
  }
  setEndOfLifeReason(reason) {
    this._data.setEndOfLifeReason(reason);
  }
  setIsPreceeded(item) {
    this._data.setIsPreceeded(item.partialAccepts);
  }
  setNotShownReasonIfNotSet(reason) {
    this._data.setNotShownReason(reason);
  }
  /**
   * Avoid using this method. Instead introduce getters for the needed properties.
  */
  getSourceCompletion() {
    return this._sourceInlineCompletion;
  }
  setRenameProcessingInfo(info) {
    this._data.setRenameProcessingInfo(info);
  }
  withAction(action) {
    return this._data.withAction(action);
  }
  addPerformanceMarker(marker) {
    this._data.addPerformanceMarker(marker);
  }
};

var InlineSuggestionIdentity = class _InlineSuggestionIdentity {
  constructor() {
    this._onDispose = observableSignal(this);
    this.onDispose = this._onDispose;
    this._jumpedTo = observableValue(this, false);
    this._refCount = 0;
    this.id = "InlineCompletionIdentity" + _InlineSuggestionIdentity.idCounter++;
  }
  static {
    this.idCounter = 0;
  }
  get jumpedTo() {
    return this._jumpedTo;
  }
  addRef() {
    this._refCount++;
  }
  removeRef() {
    this._refCount--;
    if (this._refCount === 0) {
      this._onDispose.trigger(void 0);
    }
  }
  setJumpTo(tx) {
    this._jumpedTo.set(true, tx);
  }
};

var InlineSuggestHint = class _InlineSuggestHint {
  constructor(range2, content2, style) {
    this.range = range2;
    this.content = content2;
    this.style = style;
  }
  static create(hint) {
    return new _InlineSuggestHint(
      Range2.lift(hint.range),
      hint.content,
      hint.style
    );
  }
  withEdit(edit3, positionOffsetTransformer) {
    const offsetRange = new OffsetRange(
      positionOffsetTransformer.getOffset(this.range.getStartPosition()),
      positionOffsetTransformer.getOffset(this.range.getEndPosition())
    );
    const newOffsetRange = applyEditsToRanges([offsetRange], edit3)[0];
    if (!newOffsetRange) {
      return void 0;
    }
    const newRange = positionOffsetTransformer.getRange(newOffsetRange);
    return new _InlineSuggestHint(newRange, this.content, this.style);
  }
};

var InlineCompletionItem = class _InlineCompletionItem extends InlineSuggestionItemBase {
  constructor(_edit, _trimmedEdit, _textEdit, _originalRange, snippetInfo, additionalTextEdits, data, identity2, displayLocation, originalTextRef) {
    super(data, identity2, displayLocation, originalTextRef);
    this._edit = _edit;
    this._trimmedEdit = _trimmedEdit;
    this._textEdit = _textEdit;
    this._originalRange = _originalRange;
    this.snippetInfo = snippetInfo;
    this.additionalTextEdits = additionalTextEdits;
    this.isInlineEdit = false;
  }
  static create(data, textModel, action) {
    const identity2 = new InlineSuggestionIdentity();
    const transformer = textModel.getTransformer();
    const insertText = action.insertText.replace(/\r\n|\r|\n/g, textModel.getEOL());
    const edit3 = reshapeInlineCompletion(new StringReplacement(transformer.getOffsetRange(action.range), insertText), textModel);
    const trimmedEdit = edit3.removeCommonSuffixAndPrefix(textModel.getValue());
    const textEdit = transformer.getTextReplacement(edit3);
    const displayLocation = data.hint ? InlineSuggestHint.create(data.hint) : void 0;
    return new _InlineCompletionItem(edit3, trimmedEdit, textEdit, textEdit.range, action.snippetInfo, data.additionalTextEdits, data, identity2, displayLocation, textModel);
  }
  get action() {
    return {
      kind: "edit",
      textReplacement: this.getSingleTextEdit(),
      snippetInfo: this.snippetInfo,
      stringEdit: new StringEdit([this._trimmedEdit]),
      alternativeAction: void 0,
      target: this.originalTextRef
    };
  }
  get hash() {
    return JSON.stringify(this._trimmedEdit.toJson());
  }
  getSingleTextEdit() {
    return this._textEdit;
  }
  withIdentity(identity2) {
    return new _InlineCompletionItem(
      this._edit,
      this._trimmedEdit,
      this._textEdit,
      this._originalRange,
      this.snippetInfo,
      this.additionalTextEdits,
      this._data,
      identity2,
      this.hint,
      this.originalTextRef
    );
  }
  withEdit(textModelEdit, textModel) {
    if (!this.originalTextRef.targets(textModel)) {
      return this;
    }
    const newEditRange = applyEditsToRanges([this._edit.replaceRange], textModelEdit);
    if (newEditRange.length === 0) {
      return void 0;
    }
    const newEdit = new StringReplacement(newEditRange[0], this._textEdit.text);
    const positionOffsetTransformer = getPositionOffsetTransformerFromTextModel(textModel);
    const newTextEdit = positionOffsetTransformer.getTextReplacement(newEdit);
    let newDisplayLocation = this.hint;
    if (newDisplayLocation) {
      newDisplayLocation = newDisplayLocation.withEdit(textModelEdit, positionOffsetTransformer);
      if (!newDisplayLocation) {
        return void 0;
      }
    }
    const trimmedEdit = newEdit.removeCommonSuffixAndPrefix(textModel.getValue());
    return new _InlineCompletionItem(
      newEdit,
      trimmedEdit,
      newTextEdit,
      this._originalRange,
      this.snippetInfo,
      this.additionalTextEdits,
      this._data,
      this.identity,
      newDisplayLocation,
      this.originalTextRef
    );
  }
  canBeReused(model, position2) {
    const updatedRange = this._textEdit.range;
    const result = !!updatedRange && updatedRange.containsPosition(position2) && this.isVisible(model, position2) && TextLength.ofRange(updatedRange).isGreaterThanOrEqualTo(TextLength.ofRange(this._originalRange));
    return result;
  }
  isVisible(model, cursorPosition) {
    const singleTextEdit = this.getSingleTextEdit();
    return inlineCompletionIsVisible(singleTextEdit, this._originalRange, model, cursorPosition);
  }
  computeEditKind(model) {
    return computeEditKind(new StringEdit([this._edit]), model);
  }
  get editRange() {
    return this.getSingleTextEdit().range;
  }
  get insertText() {
    return this.getSingleTextEdit().text;
  }
};

var InlineEditItem = class _InlineEditItem extends InlineSuggestionItemBase {
  constructor(_action, data, identity2, _edits, hint, _lastChangePartOfInlineEdit = false, _inlineEditModelVersion, originalTextRef) {
    super(data, identity2, hint, originalTextRef);
    this._action = _action;
    this._edits = _edits;
    this._lastChangePartOfInlineEdit = _lastChangePartOfInlineEdit;
    this._inlineEditModelVersion = _inlineEditModelVersion;
    this.snippetInfo = void 0;
    this.additionalTextEdits = [];
    this.isInlineEdit = true;
  }
  static createForTest(textModel, range2, newText) {
    const action = {
      kind: "edit",
      snippetInfo: void 0,
      insertText: newText,
      range: range2,
      uri: textModel.uri,
      alternativeAction: void 0
    };
    return _InlineEditItem.create(InlineSuggestData.createForTest(action, textModel.uri), textModel);
  }
  static create(data, textModel, shouldDiffEdit = true) {
    let action;
    let edits = [];
    if (data.action?.kind === "edit") {
      const offsetEdit = shouldDiffEdit ? getDiffedStringEdit(textModel, data.action.range, data.action.insertText) : getStringEdit(textModel, data.action.range, data.action.insertText);
      const textEdit = TextEdit2.fromStringEdit(offsetEdit, textModel);
      const singleTextEdit = offsetEdit.isEmpty() ? new TextReplacement(new Range2(1, 1, 1, 1), "") : textEdit.toReplacement(textModel);
      edits = offsetEdit.replacements.map((edit3) => {
        const replacedRange = Range2.fromPositions(textModel.getPositionAt(edit3.replaceRange.start), textModel.getTransformer().getPosition(edit3.replaceRange.endExclusive));
        const replacedText = textModel.getValueInRange(replacedRange);
        return SingleUpdatedNextEdit.create(edit3, replacedText);
      });
      action = {
        kind: "edit",
        snippetInfo: data.action.snippetInfo,
        stringEdit: offsetEdit,
        textReplacement: singleTextEdit,
        alternativeAction: data.action.alternativeAction,
        target: textModel
      };
    } else if (data.action?.kind === "jumpTo") {
      action = {
        kind: "jumpTo",
        position: data.action.position,
        offset: textModel.getTransformer().getOffset(data.action.position),
        target: textModel
      };
    } else {
      action = void 0;
      if (!data.hint) {
        throw new BugIndicatingError("InlineEditItem: action is undefined and no hint is provided");
      }
    }
    const identity2 = new InlineSuggestionIdentity();
    const hint = data.hint ? InlineSuggestHint.create(data.hint) : void 0;
    return new _InlineEditItem(action, data, identity2, edits, hint, false, textModel.getVersionId(), textModel);
  }
  get updatedEditModelVersion() {
    return this._inlineEditModelVersion;
  }
  // public get updatedEdit(): StringEdit { return this._edit; }
  get action() {
    return this._action;
  }
  withIdentity(identity2) {
    return new _InlineEditItem(
      this._action,
      this._data,
      identity2,
      this._edits,
      this.hint,
      this._lastChangePartOfInlineEdit,
      this._inlineEditModelVersion,
      this.originalTextRef
    );
  }
  canBeReused(model, position2) {
    return this._lastChangePartOfInlineEdit && this.updatedEditModelVersion === model.getVersionId();
  }
  withEdit(textModelChanges, textModel) {
    if (!this.originalTextRef.targets(textModel)) {
      return this;
    }
    const edit3 = this._applyTextModelChanges(textModelChanges, this._edits, textModel);
    return edit3;
  }
  _applyTextModelChanges(textModelChanges, edits, textModel) {
    const positionOffsetTransformer = getPositionOffsetTransformerFromTextModel(textModel);
    let lastChangePartOfInlineEdit = false;
    let inlineEditModelVersion = this._inlineEditModelVersion;
    let newAction;
    const updatedTarget = TextModelValueReference.snapshot(textModel);
    if (this.action?.kind === "edit") {
      edits = edits.map((innerEdit) => innerEdit.applyTextModelChanges(textModelChanges));
      if (edits.some((edit3) => edit3.edit === void 0)) {
        return void 0;
      }
      const newTextModelVersion = textModel.getVersionId();
      lastChangePartOfInlineEdit = edits.some((edit3) => edit3.lastChangeUpdatedEdit);
      if (lastChangePartOfInlineEdit) {
        inlineEditModelVersion = newTextModelVersion ?? -1;
      }
      if (newTextModelVersion === null || inlineEditModelVersion + 20 < newTextModelVersion) {
        return void 0;
      }
      edits = edits.filter((innerEdit) => !innerEdit.edit.isEmpty);
      if (edits.length === 0) {
        return void 0;
      }
      const newEdit = new StringEdit(edits.map((edit3) => edit3.edit));
      const newTextEdit = positionOffsetTransformer.getTextEdit(newEdit).toReplacement(new TextModelText(textModel));
      newAction = {
        kind: "edit",
        textReplacement: newTextEdit,
        snippetInfo: this.snippetInfo,
        stringEdit: newEdit,
        alternativeAction: this.action.alternativeAction,
        target: updatedTarget
      };
    } else if (this.action?.kind === "jumpTo") {
      const jumpToOffset = this.action.offset;
      const newJumpToOffset = textModelChanges.applyToOffsetOrUndefined(jumpToOffset);
      if (newJumpToOffset === void 0) {
        return void 0;
      }
      const newJumpToPosition = positionOffsetTransformer.getPosition(newJumpToOffset);
      newAction = {
        kind: "jumpTo",
        position: newJumpToPosition,
        offset: newJumpToOffset,
        target: updatedTarget
      };
    } else {
      newAction = void 0;
    }
    let newDisplayLocation = this.hint;
    if (newDisplayLocation) {
      newDisplayLocation = newDisplayLocation.withEdit(textModelChanges, positionOffsetTransformer);
      if (!newDisplayLocation) {
        return void 0;
      }
    }
    return new _InlineEditItem(
      newAction,
      this._data,
      this.identity,
      edits,
      newDisplayLocation,
      lastChangePartOfInlineEdit,
      inlineEditModelVersion,
      updatedTarget
    );
  }
  computeEditKind(model) {
    const edit3 = this.action?.kind === "edit" ? this.action.stringEdit : void 0;
    if (!edit3) {
      return void 0;
    }
    return computeEditKind(edit3, model);
  }
};

function getDiffedStringEdit(textModel, editRange, replaceText) {
  const eol = textModel.getEOL();
  const editOriginalText = textModel.getValueOfRange(editRange);
  const editReplaceText = replaceText.replace(/\r\n|\r|\n/g, eol);
  const diffAlgorithm = linesDiffComputers.getDefault();
  const lineDiffs = diffAlgorithm.computeDiff(
    splitLines(editOriginalText),
    splitLines(editReplaceText),
    {
      ignoreTrimWhitespace: false,
      computeMoves: false,
      extendToSubwords: true,
      maxComputationTimeMs: 50
    }
  );
  const innerChanges = lineDiffs.changes.flatMap((c) => c.innerChanges ?? []);
  function addRangeToPos(pos, range2) {
    const start = TextLength.fromPosition(range2.getStartPosition());
    return TextLength.ofRange(range2).createRange(start.addToPosition(pos));
  }
  const modifiedText = new StringText(editReplaceText);
  const offsetEdit = new StringEdit(
    innerChanges.map((c) => {
      const rangeInModel = addRangeToPos(editRange.getStartPosition(), c.originalRange);
      const originalRange = textModel.getTransformer().getOffsetRange(rangeInModel);
      const replaceText2 = modifiedText.getValueOfRange(c.modifiedRange);
      const edit3 = new StringReplacement(originalRange, replaceText2);
      const originalText = textModel.getValueOfRange(rangeInModel);
      return reshapeInlineEdit(edit3, originalText, innerChanges.length, textModel);
    })
  );
  return offsetEdit;
}

function getStringEdit(textModel, editRange, replaceText) {
  return new StringEdit([new StringReplacement(
    textModel.getTransformer().getOffsetRange(editRange),
    replaceText
  )]);
}

var SingleUpdatedNextEdit = class _SingleUpdatedNextEdit {
  constructor(_edit, _trimmedNewText, _prefixLength, _suffixLength, _lastChangeUpdatedEdit = false) {
    this._edit = _edit;
    this._trimmedNewText = _trimmedNewText;
    this._prefixLength = _prefixLength;
    this._suffixLength = _suffixLength;
    this._lastChangeUpdatedEdit = _lastChangeUpdatedEdit;
  }
  static create(edit3, replacedText) {
    const prefixLength = commonPrefixLength2(edit3.newText, replacedText);
    const suffixLength = commonSuffixLength(edit3.newText, replacedText);
    const trimmedNewText = edit3.newText.substring(prefixLength, edit3.newText.length - suffixLength);
    return new _SingleUpdatedNextEdit(edit3, trimmedNewText, prefixLength, suffixLength);
  }
  get edit() {
    return this._edit;
  }
  get lastChangeUpdatedEdit() {
    return this._lastChangeUpdatedEdit;
  }
  applyTextModelChanges(textModelChanges) {
    const c = this._clone();
    c._applyTextModelChanges(textModelChanges);
    return c;
  }
  _clone() {
    return new _SingleUpdatedNextEdit(
      this._edit,
      this._trimmedNewText,
      this._prefixLength,
      this._suffixLength,
      this._lastChangeUpdatedEdit
    );
  }
  _applyTextModelChanges(textModelChanges) {
    this._lastChangeUpdatedEdit = false;
    if (!this._edit) {
      throw new BugIndicatingError("UpdatedInnerEdits: No edit to apply changes to");
    }
    const result = this._applyChanges(this._edit, textModelChanges);
    if (!result) {
      this._edit = void 0;
      return;
    }
    this._edit = result.edit;
    this._lastChangeUpdatedEdit = result.editHasChanged;
  }
  _applyChanges(edit3, textModelChanges) {
    let editStart = edit3.replaceRange.start;
    let editEnd = edit3.replaceRange.endExclusive;
    let editReplaceText = edit3.newText;
    let editHasChanged = false;
    const shouldPreserveEditShape = this._prefixLength > 0 || this._suffixLength > 0;
    for (let i2 = textModelChanges.replacements.length - 1; i2 >= 0; i2--) {
      const change = textModelChanges.replacements[i2];
      const isInsertion2 = change.newText.length > 0 && change.replaceRange.isEmpty;
      if (isInsertion2 && !shouldPreserveEditShape && change.replaceRange.start === editStart && editReplaceText.startsWith(change.newText)) {
        editStart += change.newText.length;
        editReplaceText = editReplaceText.substring(change.newText.length);
        editEnd += change.newText.length;
        editHasChanged = true;
        continue;
      }
      if (isInsertion2 && shouldPreserveEditShape && change.replaceRange.start === editStart + this._prefixLength && this._trimmedNewText.startsWith(change.newText)) {
        editEnd += change.newText.length;
        editHasChanged = true;
        this._prefixLength += change.newText.length;
        this._trimmedNewText = this._trimmedNewText.substring(change.newText.length);
        continue;
      }
      const isDeletion3 = change.newText.length === 0 && change.replaceRange.length > 0;
      if (isDeletion3 && change.replaceRange.start >= editStart + this._prefixLength && change.replaceRange.endExclusive <= editEnd - this._suffixLength) {
        editEnd -= change.replaceRange.length;
        editHasChanged = true;
        continue;
      }
      if (change.equals(edit3)) {
        editHasChanged = true;
        editStart = change.replaceRange.endExclusive;
        editReplaceText = "";
        continue;
      }
      if (change.replaceRange.start > editEnd) {
        continue;
      }
      if (change.replaceRange.endExclusive < editStart) {
        editStart += change.newText.length - change.replaceRange.length;
        editEnd += change.newText.length - change.replaceRange.length;
        continue;
      }
      return void 0;
    }
    if (this._trimmedNewText.length === 0 && editStart + this._prefixLength === editEnd - this._suffixLength) {
      return { edit: new StringReplacement(new OffsetRange(editStart + this._prefixLength, editStart + this._prefixLength), ""), editHasChanged: true };
    }
    return { edit: new StringReplacement(new OffsetRange(editStart, editEnd), editReplaceText), editHasChanged };
  }
};

function reshapeInlineCompletion(edit3, textModel) {
  const eol = textModel.getEOL();
  if (edit3.replaceRange.isEmpty && edit3.newText.includes(eol)) {
    edit3 = reshapeMultiLineInsertion(edit3, textModel);
  }
  return edit3;
}

function reshapeInlineEdit(edit3, originalText, totalInnerEdits, textModel) {
  const eol = textModel.getEOL();
  if (edit3.newText.endsWith(eol) && originalText.endsWith(eol)) {
    edit3 = new StringReplacement(edit3.replaceRange.deltaEnd(-eol.length), edit3.newText.slice(0, -eol.length));
  }
  if (totalInnerEdits === 1 && edit3.replaceRange.isEmpty && edit3.newText.includes(eol)) {
    const startPosition = textModel.getTransformer().getPosition(edit3.replaceRange.start);
    const hasTextOnInsertionLine = textModel.getLineLength(startPosition.lineNumber) !== 0;
    if (hasTextOnInsertionLine) {
      edit3 = reshapeMultiLineInsertion(edit3, textModel);
    }
  }
  if (totalInnerEdits === 1) {
    const prefixLength = commonPrefixLength2(originalText, edit3.newText);
    const suffixLength = commonSuffixLength(originalText.slice(prefixLength), edit3.newText.slice(prefixLength));
    if (prefixLength + suffixLength === originalText.length) {
      return new StringReplacement(edit3.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), edit3.newText.substring(prefixLength, edit3.newText.length - suffixLength));
    }
    if (prefixLength + suffixLength === edit3.newText.length) {
      return new StringReplacement(edit3.replaceRange.deltaStart(prefixLength).deltaEnd(-suffixLength), "");
    }
  }
  return edit3;
}

function reshapeMultiLineInsertion(edit3, textModel) {
  if (!edit3.replaceRange.isEmpty) {
    throw new BugIndicatingError("Unexpected original range");
  }
  if (edit3.replaceRange.start === 0) {
    return edit3;
  }
  const eol = textModel.getEOL();
  const startPosition = textModel.getTransformer().getPosition(edit3.replaceRange.start);
  const startColumn = startPosition.column;
  const startLineNumber = startPosition.lineNumber;
  if (startColumn === 1 && startLineNumber > 1 && edit3.newText.endsWith(eol) && !edit3.newText.startsWith(eol)) {
    return new StringReplacement(edit3.replaceRange.delta(-1), eol + edit3.newText.slice(0, -eol.length));
  }
  return edit3;
}
export { hashInlineSuggestionAction, getDiffedStringEdit, getStringEdit, reshapeInlineCompletion, reshapeInlineEdit, reshapeMultiLineInsertion, InlineSuggestionItem, InlineSuggestionItemBase, InlineSuggestionIdentity, InlineSuggestHint, InlineCompletionItem, InlineEditItem, SingleUpdatedNextEdit };
