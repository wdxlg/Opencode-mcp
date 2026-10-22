// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsView.ts
import { Disposable } from "./module-0012.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { LineRange } from "./module-0174.mjs";
import { RangeMapping, lineRangeMappingFromRangeMappings } from "./module-0179.mjs";
import { StringText } from "./module-0177.mjs";
import { applyEditToModifiedRangeMappings, createReindentEdit } from "./module-0772.mjs";
import { StringEdit } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { getPositionOffsetTransformerFromTextModel } from "./module-0715.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { observableValue } from "./module-0048.mjs";
import { TextModel } from "./module-0423.mjs";
import { InlineEditsSideBySideView } from "./module-0790.mjs";
import { InlineEditsDeletionView } from "./module-0780.mjs";
import { InlineEditsInsertionView } from "./module-0781.mjs";
import { InlineEditsCollapsedView } from "./module-0778.mjs";
import { InlineEditsCustomView } from "./module-0779.mjs";
import { InlineEditsLongDistanceHint } from "./module-0789.mjs";
import { OriginalEditorInlineDiffView } from "./module-0792.mjs";
import { JumpToView } from "./module-0785.mjs";
import { equals3 } from "./module-0042.mjs";
import { InlineEditsWordReplacementView, WordReplacementsViewData } from "./module-0791.mjs";
import { mapObservableArrayCached } from "./module-0059.mjs";
import { InlineEditsLineReplacementView } from "./module-0782.mjs";
import { autorun } from "./module-0052.mjs";
import { Event2 } from "./module-0017.mjs";
import { $ } from "./module-0075.mjs";
import { TextLength } from "./module-0175.mjs";
import { TextReplacement } from "./module-0178.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { InlineCompletionViewData } from "./module-0727.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/inlineEditsView.ts
var InlineEditsView = class extends Disposable {
  constructor(_editor, _model, _simpleModel, _inlineSuggestInfo, _showCollapsed, _instantiationService) {
    super();
    this._editor = _editor;
    this._model = _model;
    this._simpleModel = _simpleModel;
    this._inlineSuggestInfo = _inlineSuggestInfo;
    this._showCollapsed = _showCollapsed;
    this._instantiationService = _instantiationService;
    this._tabAction = derived((reader) => this._model.read(reader)?.tabAction.read(reader) ?? "inactive" /* Inactive */);
    this.displayRange = derived(this, (reader) => {
      const state = this._uiState.read(reader);
      if (!state) {
        return void 0;
      }
      if (state.target.uri.toString() !== this._editorObs.model.read(reader)?.uri.toString()) {
        return void 0;
      }
      if (state.state?.kind === "custom") {
        const range2 = state.state.displayLocation?.range;
        if (!range2) {
          throw new BugIndicatingError("custom view should have a range");
        }
        return new LineRange(range2.startLineNumber, range2.endLineNumber);
      }
      if (state.state?.kind === "insertionMultiLine") {
        return this._insertion.originalLines.read(reader);
      }
      return state.edit.displayRange;
    });
    this._currentInlineEditCache = void 0;
    this._uiState = derived(this, (reader) => {
      const model = this._model.read(reader);
      const textModel = this._editorObs.model.read(reader);
      if (!model || !textModel || !this._constructorDone.read(reader)) {
        return void 0;
      }
      const inlineEdit = model.inlineEdit;
      let diff4;
      let mappings;
      let newText = void 0;
      if (inlineEdit.edit) {
        mappings = RangeMapping.fromEdit(inlineEdit.edit);
        newText = new StringText(inlineEdit.edit.apply(inlineEdit.originalText));
        diff4 = lineRangeMappingFromRangeMappings(mappings, inlineEdit.originalText, newText);
      } else {
        mappings = [];
        diff4 = [];
        newText = inlineEdit.originalText;
      }
      let state = this._determineRenderState(model, reader, diff4, newText);
      if (!state) {
        onUnexpectedError(new Error(`unable to determine view: tried to render ${this._previousView?.view}`));
        return void 0;
      }
      const longDistanceHint = this._getLongDistanceHintState(model, reader);
      if (longDistanceHint && longDistanceHint.isVisible) {
        state.viewData.setLongDistanceViewData(longDistanceHint.lineNumber, inlineEdit.lineEdit.lineRange.startLineNumber);
      }
      state.viewData.isForAnotherDocument = !inlineEdit.originalText.targets(textModel);
      if (state.kind === "sideBySide" /* SideBySide */) {
        const indentationAdjustmentEdit = createReindentEdit(newText.getValue(), inlineEdit.modifiedLineRange, textModel.getOptions().tabSize);
        newText = new StringText(indentationAdjustmentEdit.applyToString(newText.getValue()));
        mappings = applyEditToModifiedRangeMappings(mappings, indentationAdjustmentEdit);
        diff4 = lineRangeMappingFromRangeMappings(mappings, inlineEdit.originalText, newText);
      }
      this._previewTextModel.setLanguage(textModel.getLanguageId());
      const previousNewText = this._previewTextModel.getValue();
      if (previousNewText !== newText.getValue()) {
        this._previewTextModel.setEOL(textModel.getEndOfLineSequence());
        const updateOldValueEdit = StringEdit.replace(new OffsetRange(0, previousNewText.length), newText.getValue());
        const updateOldValueEditSmall = updateOldValueEdit.removeCommonSuffixPrefix(previousNewText);
        const textEdit = getPositionOffsetTransformerFromTextModel(this._previewTextModel).getTextEdit(updateOldValueEditSmall);
        this._previewTextModel.edit(textEdit);
      }
      if (this._showCollapsed.read(reader)) {
        state = { kind: "collapsed" /* Collapsed */, viewData: state.viewData };
      }
      model.handleInlineEditShownNextFrame(state.kind, state.viewData);
      const nextCursorPosition = inlineEdit.action?.kind === "jumpTo" ? inlineEdit.action.position : null;
      return {
        state,
        diff: diff4,
        edit: inlineEdit,
        newText: newText.getValue(),
        newTextLineCount: inlineEdit.modifiedLineRange.length,
        editorType: model.editorType,
        longDistanceHint,
        nextCursorPosition,
        target: inlineEdit.inlineCompletion.originalTextRef
      };
    });
    this.inlineEditsIsHovered = derived(this, (reader) => {
      return this._sideBySide.isHovered.read(reader) || this._wordReplacementViews.read(reader).some((v2) => v2.isHovered.read(reader)) || this._deletion.isHovered.read(reader) || this._inlineDiffView.isHovered.read(reader) || this._lineReplacementView.isHovered.read(reader) || this._insertion.isHovered.read(reader) || this._customView.isHovered.read(reader) || this._longDistanceHint.map((v2, r2) => v2?.isHovered.read(r2) ?? false).read(reader);
    });
    this.gutterIndicatorOffset = derived(this, (reader) => {
      if (this._uiState.read(reader)?.state?.kind === "insertionMultiLine") {
        return this._insertion.startLineOffset.read(reader);
      }
      return 0;
    });
    this._editorObs = observableCodeEditor(this._editor);
    this._constructorDone = observableValue(this, false);
    this._previewTextModel = this._register(this._instantiationService.createInstance(
      TextModel,
      "",
      this._editor.getModel().getLanguageId(),
      { ...TextModel.DEFAULT_CREATION_OPTIONS, bracketPairColorizationOptions: { enabled: true, independentColorPoolPerBracketType: false } },
      null
    ));
    this._sideBySide = this._register(this._instantiationService.createInstance(
      InlineEditsSideBySideView,
      this._editor,
      this._model.map((m) => m?.inlineEdit),
      this._previewTextModel,
      this._uiState.map((s) => s && s.state?.kind === "sideBySide" /* SideBySide */ ? {
        newTextLineCount: s.newTextLineCount,
        editorType: s.editorType
      } : void 0),
      this._tabAction
    ));
    this._deletion = this._register(this._instantiationService.createInstance(
      InlineEditsDeletionView,
      this._editor,
      this._model.map((m) => m?.inlineEdit),
      this._uiState.map((s) => s && s.state?.kind === "deletion" /* Deletion */ ? {
        originalRange: s.state.originalRange,
        deletions: s.state.deletions,
        editorType: s.editorType
      } : void 0),
      this._tabAction
    ));
    this._insertion = this._register(this._instantiationService.createInstance(
      InlineEditsInsertionView,
      this._editor,
      this._uiState.map((s) => s && s.state?.kind === "insertionMultiLine" /* InsertionMultiLine */ ? {
        lineNumber: s.state.lineNumber,
        startColumn: s.state.column,
        text: s.state.text,
        editorType: s.editorType
      } : void 0),
      this._tabAction
    ));
    this._inlineCollapsedView = this._register(this._instantiationService.createInstance(
      InlineEditsCollapsedView,
      this._editor,
      this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "collapsed" /* Collapsed */ ? m?.inlineEdit : void 0)
    ));
    this._customView = this._register(this._instantiationService.createInstance(
      InlineEditsCustomView,
      this._editor,
      this._model.map((m, reader) => this._uiState.read(reader)?.state?.kind === "custom" /* Custom */ ? m?.displayLocation : void 0),
      this._tabAction,
      this._uiState.map((s) => s?.editorType ?? "textEditor" /* TextEditor */)
    ));
    this._showLongDistanceHint = this._editorObs.getOption(71 /* inlineSuggest */).map(this, (s) => s.edits.showLongDistanceHint);
    this._longDistanceHint = derived(this, (reader) => {
      if (!this._showLongDistanceHint.read(reader)) {
        return void 0;
      }
      return reader.store.add(this._instantiationService.createInstance(
        InlineEditsLongDistanceHint,
        this._editor,
        this._uiState.map((s, reader2) => s?.longDistanceHint ? {
          hint: s.longDistanceHint,
          newTextLineCount: s.newTextLineCount,
          edit: s.edit,
          diff: s.diff,
          editorType: s.editorType,
          model: this._simpleModel.read(reader2),
          inlineSuggestInfo: this._inlineSuggestInfo.read(reader2),
          nextCursorPosition: s.nextCursorPosition,
          target: s.target
        } : void 0),
        this._previewTextModel,
        this._tabAction
      ));
    }).recomputeInitiallyAndOnChange(this._store);
    this._inlineDiffViewState = derived(this, (reader) => {
      const e4 = this._uiState.read(reader);
      if (!e4 || !e4.state) {
        return void 0;
      }
      if (e4.state.kind === "wordReplacements" || e4.state.kind === "insertionMultiLine" || e4.state.kind === "collapsed" || e4.state.kind === "custom" || e4.state.kind === "jumpTo") {
        return void 0;
      }
      return {
        modifiedText: new StringText(e4.newText),
        diff: e4.diff,
        mode: e4.state.kind,
        modifiedCodeEditor: this._sideBySide.previewEditor,
        editorType: e4.editorType
      };
    });
    this._inlineDiffView = this._register(new OriginalEditorInlineDiffView(this._editor, this._inlineDiffViewState, this._previewTextModel));
    this._jumpToView = this._register(this._instantiationService.createInstance(JumpToView, this._editorObs, { style: "label" }, derived((reader) => {
      const s = this._uiState.read(reader);
      if (s?.state?.kind === "jumpTo" /* JumpTo */) {
        return { jumpToPosition: s.state.position };
      }
      return void 0;
    })));
    const wordReplacements = derivedOpts({
      equalsFn: equals3.arrayC(equals3.thisC())
    }, (reader) => {
      const s = this._uiState.read(reader);
      return s?.state?.kind === "wordReplacements" /* WordReplacements */ ? s.state.replacements.map((replacement) => new WordReplacementsViewData(replacement, s.editorType, s.state?.alternativeAction)) : [];
    });
    this._wordReplacementViews = mapObservableArrayCached(this, wordReplacements, (viewData, store) => {
      return store.add(this._instantiationService.createInstance(InlineEditsWordReplacementView, this._editorObs, viewData, this._tabAction));
    });
    this._lineReplacementView = this._register(this._instantiationService.createInstance(
      InlineEditsLineReplacementView,
      this._editorObs,
      this._uiState.map((s) => s?.state?.kind === "lineReplacement" /* LineReplacement */ ? {
        originalRange: s.state.originalRange,
        modifiedRange: s.state.modifiedRange,
        modifiedLines: s.state.modifiedLines,
        replacements: s.state.replacements
      } : void 0),
      this._uiState.map((s) => s?.editorType ?? "textEditor" /* TextEditor */),
      this._tabAction
    ));
    this._useCodeShifting = this._editorObs.getOption(71 /* inlineSuggest */).map((s) => s.edits.allowCodeShifting);
    this._renderSideBySide = this._editorObs.getOption(71 /* inlineSuggest */).map((s) => s.edits.renderSideBySide);
    this._register(autorun((reader) => {
      const model = this._model.read(reader);
      if (!model) {
        return;
      }
      reader.store.add(
        Event2.any(
          this._sideBySide.onDidClick,
          this._lineReplacementView.onDidClick,
          this._insertion.onDidClick,
          ...this._wordReplacementViews.read(reader).map((w) => w.onDidClick),
          this._inlineDiffView.onDidClick,
          this._customView.onDidClick
        )((clickEvent) => {
          if (this._viewHasBeenShownLongerThan(350)) {
            clickEvent.event.preventDefault();
            model.accept(clickEvent.alternativeAction);
          }
        })
      );
    }));
    this._wordReplacementViews.recomputeInitiallyAndOnChange(this._store);
    const minEditorScrollHeight = derived(this, (reader) => {
      return Math.max(
        ...this._wordReplacementViews.read(reader).map((v2) => v2.minEditorScrollHeight.read(reader)),
        this._lineReplacementView.minEditorScrollHeight.read(reader),
        this._customView.minEditorScrollHeight.read(reader)
      );
    }).recomputeInitiallyAndOnChange(this._store);
    let viewZoneId;
    this._register(autorun((reader) => {
      const minScrollHeight = minEditorScrollHeight.read(reader);
      const textModel = this._editorObs.model.read(reader);
      if (!textModel) {
        return;
      }
      this._editor.changeViewZones((accessor) => {
        const scrollHeight = this._editor.getScrollHeight();
        const viewZoneHeight = minScrollHeight - scrollHeight + 1;
        if (viewZoneHeight !== 0 && viewZoneId !== void 0) {
          accessor.removeZone(viewZoneId);
          viewZoneId = void 0;
        }
        if (viewZoneHeight <= 0) {
          return;
        }
        viewZoneId = accessor.addZone({
          afterLineNumber: textModel.getLineCount(),
          heightInPx: viewZoneHeight,
          domNode: $("div.minScrollHeightViewZone")
        });
      });
    }));
    this._constructorDone.set(true, void 0);
  }
  _getLongDistanceHintState(model, reader) {
    if (model.inlineEdit.inlineCompletion.identity.jumpedTo.read(reader)) {
      return void 0;
    }
    if (model.inlineEdit.action === void 0) {
      return void 0;
    }
    const editorModel = this._editorObs.model.read(reader);
    if (!editorModel || !model.inlineEdit.originalText.targets(editorModel)) {
      return {
        isVisible: true,
        lineNumber: model.inlineEdit.cursorPosition.lineNumber
      };
    }
    if (this._currentInlineEditCache?.inlineSuggestionIdentity !== model.inlineEdit.inlineCompletion.identity) {
      this._currentInlineEditCache = {
        inlineSuggestionIdentity: model.inlineEdit.inlineCompletion.identity,
        firstCursorLineNumber: model.inlineEdit.cursorPosition.lineNumber
      };
    }
    return {
      lineNumber: this._currentInlineEditCache.firstCursorLineNumber,
      isVisible: !model.inViewPort.read(reader)
    };
  }
  _getCacheId(model) {
    return model.inlineEdit.inlineCompletion.identity.id;
  }
  _determineView(model, reader, diff4, newText) {
    const inlineEdit = model.inlineEdit;
    const canUseCache = this._previousView?.id === this._getCacheId(model) && this._previousView?.uri.toString() === this._editorObs.model.get().uri.toString();
    const reconsiderViewEditorWidthChange = this._previousView?.editorWidth !== this._editorObs.layoutInfoWidth.read(reader) && (this._previousView?.view === "sideBySide" /* SideBySide */ || this._previousView?.view === "lineReplacement" /* LineReplacement */);
    if (canUseCache && !reconsiderViewEditorWidthChange) {
      return this._previousView.view;
    }
    const action = model.inlineEdit.inlineCompletion.action;
    if (action?.kind === "edit" && action.alternativeAction) {
      return "wordReplacements" /* WordReplacements */;
    }
    const targetUri = model.inlineEdit.inlineCompletion.originalTextRef.uri;
    const currentUri = this._editorObs.model.read(reader)?.uri;
    if (currentUri && targetUri.toString() !== currentUri.toString()) {
      return "custom" /* Custom */;
    }
    if (model.displayLocation && !model.inlineEdit.inlineCompletion.identity.jumpedTo.read(reader)) {
      return "custom" /* Custom */;
    }
    const numOriginalLines = inlineEdit.originalLineRange.length;
    const numModifiedLines = inlineEdit.modifiedLineRange.length;
    const inner = diff4.flatMap((d) => d.innerChanges ?? []);
    const isSingleInnerEdit = inner.length === 1;
    if (model.editorType !== "diffEditor" /* DiffEditor */) {
      if (isSingleInnerEdit && this._useCodeShifting.read(reader) !== "never" && isSingleLineInsertion(diff4)) {
        if (isSingleLineInsertionAfterPosition(diff4, inlineEdit.cursorPosition)) {
          return "insertionInline" /* InsertionInline */;
        }
        return "lineReplacement" /* LineReplacement */;
      }
      if (isDeletion2(inner, inlineEdit, newText)) {
        return "deletion" /* Deletion */;
      }
      if (isSingleMultiLineInsertion(diff4) && this._useCodeShifting.read(reader) === "always") {
        return "insertionMultiLine" /* InsertionMultiLine */;
      }
      const allInnerChangesNotTooLong = inner.every((m) => TextLength.ofRange(m.originalRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH && TextLength.ofRange(m.modifiedRange).columnCount < InlineEditsWordReplacementView.MAX_LENGTH);
      if (allInnerChangesNotTooLong && isSingleInnerEdit && numOriginalLines === 1 && numModifiedLines === 1) {
        const modifiedText = inner.map((m) => newText.getValueOfRange(m.modifiedRange));
        const originalText = inner.map((m) => model.inlineEdit.originalText.getValueOfRange(m.originalRange));
        if (!modifiedText.some((v2) => v2.includes("	")) && !originalText.some((v2) => v2.includes("	"))) {
          if (!inner.some((m) => m.originalRange.isEmpty()) || !growEditsUntilWhitespace(inner.map((m) => new TextReplacement(m.originalRange, "")), inlineEdit.originalText).some((e4) => e4.range.isEmpty() && TextLength.ofRange(e4.range).columnCount < InlineEditsWordReplacementView.MAX_LENGTH)) {
            return "wordReplacements" /* WordReplacements */;
          }
        }
      }
    }
    if (numOriginalLines > 0 && numModifiedLines > 0) {
      if (numOriginalLines === 1 && numModifiedLines === 1 && model.editorType !== "diffEditor" /* DiffEditor */) {
        return "lineReplacement" /* LineReplacement */;
      }
      if (this._renderSideBySide.read(reader) !== "never" && InlineEditsSideBySideView.fitsInsideViewport(this._editor, this._previewTextModel, inlineEdit, reader)) {
        return "sideBySide" /* SideBySide */;
      }
      return "lineReplacement" /* LineReplacement */;
    }
    if (model.editorType === "diffEditor" /* DiffEditor */) {
      if (isDeletion2(inner, inlineEdit, newText)) {
        return "deletion" /* Deletion */;
      }
      if (isSingleMultiLineInsertion(diff4) && this._useCodeShifting.read(reader) === "always") {
        return "insertionMultiLine" /* InsertionMultiLine */;
      }
    }
    return "sideBySide" /* SideBySide */;
  }
  _determineRenderState(model, reader, diff4, newText) {
    if (model.inlineEdit.action?.kind === "jumpTo") {
      return {
        kind: "jumpTo" /* JumpTo */,
        position: model.inlineEdit.action.position,
        viewData: createEmptyViewData()
      };
    }
    const inlineEdit = model.inlineEdit;
    let view = this._determineView(model, reader, diff4, newText);
    if (this._willRenderAboveCursor(reader, inlineEdit, view)) {
      switch (view) {
        case "lineReplacement" /* LineReplacement */:
        case "wordReplacements" /* WordReplacements */:
          view = "sideBySide" /* SideBySide */;
          break;
      }
    }
    this._previousView = { id: this._getCacheId(model), view, editorWidth: this._editor.getLayoutInfo().width, timestamp: Date.now(), uri: this._editorObs.model.get().uri };
    const inner = diff4.flatMap((d) => d.innerChanges ?? []);
    const textModel = this._editor.getModel();
    const stringChanges = inner.map((m) => ({
      originalRange: m.originalRange,
      modifiedRange: m.modifiedRange,
      original: inlineEdit.originalText.getValueOfRange(m.originalRange),
      modified: newText.getValueOfRange(m.modifiedRange)
    }));
    const viewData = getViewData(inlineEdit, stringChanges, textModel);
    switch (view) {
      case "insertionInline" /* InsertionInline */:
        return { kind: "insertionInline" /* InsertionInline */, viewData };
      case "sideBySide" /* SideBySide */:
        return { kind: "sideBySide" /* SideBySide */, viewData };
      case "collapsed" /* Collapsed */:
        return { kind: "collapsed" /* Collapsed */, viewData };
      case "custom" /* Custom */:
        return { kind: "custom" /* Custom */, displayLocation: model.displayLocation, viewData };
    }
    if (view === "deletion" /* Deletion */) {
      return {
        kind: "deletion" /* Deletion */,
        originalRange: inlineEdit.originalLineRange,
        deletions: inner.map((m) => m.originalRange),
        viewData
      };
    }
    if (view === "insertionMultiLine" /* InsertionMultiLine */) {
      const change = inner[0];
      return {
        kind: "insertionMultiLine" /* InsertionMultiLine */,
        lineNumber: change.originalRange.startLineNumber,
        column: change.originalRange.startColumn,
        text: newText.getValueOfRange(change.modifiedRange),
        viewData
      };
    }
    const replacements = stringChanges.map((m) => new TextReplacement(m.originalRange, m.modified));
    if (replacements.length === 0) {
      return void 0;
    }
    if (view === "wordReplacements" /* WordReplacements */) {
      let grownEdits = growEditsToEntireWord(replacements, inlineEdit.originalText);
      if (grownEdits.some((e4) => e4.range.isEmpty())) {
        grownEdits = growEditsUntilWhitespace(replacements, inlineEdit.originalText);
      }
      return {
        kind: "wordReplacements" /* WordReplacements */,
        replacements: grownEdits,
        alternativeAction: model.inlineEdit.action?.alternativeAction,
        viewData
      };
    }
    if (view === "lineReplacement" /* LineReplacement */) {
      return {
        kind: "lineReplacement" /* LineReplacement */,
        originalRange: inlineEdit.originalLineRange,
        modifiedRange: inlineEdit.modifiedLineRange,
        modifiedLines: inlineEdit.modifiedLineRange.mapToLineArray((line) => newText.getLineAt(line)),
        replacements: inner.map((m) => ({ originalRange: m.originalRange, modifiedRange: m.modifiedRange })),
        viewData
      };
    }
    return void 0;
  }
  _willRenderAboveCursor(reader, inlineEdit, view) {
    const useCodeShifting = this._useCodeShifting.read(reader);
    if (useCodeShifting === "always") {
      return false;
    }
    for (const cursorPosition of inlineEdit.multiCursorPositions) {
      if (view === "wordReplacements" /* WordReplacements */ && cursorPosition.lineNumber === inlineEdit.originalLineRange.startLineNumber + 1) {
        return true;
      }
      if (view === "lineReplacement" /* LineReplacement */ && cursorPosition.lineNumber >= inlineEdit.originalLineRange.endLineNumberExclusive && cursorPosition.lineNumber < inlineEdit.modifiedLineRange.endLineNumberExclusive + inlineEdit.modifiedLineRange.length) {
        return true;
      }
    }
    return false;
  }
  _viewHasBeenShownLongerThan(durationMs) {
    const viewCreationTime = this._previousView?.timestamp;
    if (!viewCreationTime) {
      throw new BugIndicatingError("viewHasBeenShownLongThan called before a view has been shown");
    }
    const currentTime = Date.now();
    return currentTime - viewCreationTime >= durationMs;
  }
};

InlineEditsView = __decorateClass([
  __decorateParam(5, IInstantiationService)
], InlineEditsView);

var createEmptyViewData = () => new InlineCompletionViewData(-1, -1, -1, -1, -1, -1, -1, true);

function getViewData(inlineEdit, stringChanges, textModel) {
  if (!inlineEdit.edit) {
    return createEmptyViewData();
  }
  const cursorPosition = inlineEdit.cursorPosition;
  const startsWithEOL = stringChanges.length === 0 ? false : stringChanges[0].modified.startsWith(textModel.getEOL());
  const viewData = new InlineCompletionViewData(
    inlineEdit.edit.replacements.length === 0 ? 0 : inlineEdit.edit.replacements[0].range.getStartPosition().column - cursorPosition.column,
    inlineEdit.lineEdit.lineRange.startLineNumber - cursorPosition.lineNumber + (startsWithEOL && inlineEdit.lineEdit.lineRange.startLineNumber >= cursorPosition.lineNumber ? 1 : 0),
    inlineEdit.lineEdit.lineRange.length,
    inlineEdit.lineEdit.newLines.length,
    stringChanges.reduce((acc, r2) => acc + r2.original.length, 0),
    stringChanges.reduce((acc, r2) => acc + r2.modified.length, 0),
    stringChanges.length,
    stringChanges.every((r2) => r2.original === stringChanges[0].original && r2.modified === stringChanges[0].modified)
  );
  return viewData;
}

function isSingleLineInsertion(diff4) {
  return diff4.every((m) => m.innerChanges.every((r2) => isWordInsertion(r2)));
  function isWordInsertion(r2) {
    if (!r2.originalRange.isEmpty()) {
      return false;
    }
    const isInsertionWithinLine = r2.modifiedRange.startLineNumber === r2.modifiedRange.endLineNumber;
    if (!isInsertionWithinLine) {
      return false;
    }
    return true;
  }
}

function isSingleLineInsertionAfterPosition(diff4, position2) {
  if (!position2) {
    return false;
  }
  if (!isSingleLineInsertion(diff4)) {
    return false;
  }
  const pos = position2;
  return diff4.every((m) => m.innerChanges.every((r2) => isStableWordInsertion(r2)));
  function isStableWordInsertion(r2) {
    const insertPosition = r2.originalRange.getStartPosition();
    if (pos.isBeforeOrEqual(insertPosition)) {
      return true;
    }
    if (insertPosition.lineNumber < pos.lineNumber) {
      return true;
    }
    return false;
  }
}

function isSingleMultiLineInsertion(diff4) {
  const inner = diff4.flatMap((d) => d.innerChanges ?? []);
  if (inner.length !== 1) {
    return false;
  }
  const change = inner[0];
  if (!change.originalRange.isEmpty()) {
    return false;
  }
  if (change.modifiedRange.startLineNumber === change.modifiedRange.endLineNumber) {
    return false;
  }
  return true;
}

function isDeletion2(inner, inlineEdit, newText) {
  const innerValues = inner.map((m) => ({ original: inlineEdit.originalText.getValueOfRange(m.originalRange), modified: newText.getValueOfRange(m.modifiedRange) }));
  return innerValues.every(({ original, modified }) => modified.trim() === "" && original.length > 0 && (original.length > modified.length || original.trim() !== ""));
}

function growEditsToEntireWord(replacements, originalText) {
  return _growEdits(replacements, originalText, (char) => /^[a-zA-Z]$/.test(char));
}

function growEditsUntilWhitespace(replacements, originalText) {
  return _growEdits(replacements, originalText, (char) => !/^\s$/.test(char));
}

function _growEdits(replacements, originalText, fn) {
  const result = [];
  replacements.sort((a, b) => Range2.compareRangesUsingStarts(a.range, b.range));
  for (const edit3 of replacements) {
    let startIndex = edit3.range.startColumn - 1;
    let endIndex = edit3.range.endColumn - 2;
    let prefix = "";
    let suffix = "";
    const startLineContent = originalText.getLineAt(edit3.range.startLineNumber);
    const endLineContent = originalText.getLineAt(edit3.range.endLineNumber);
    if (isIncluded(startLineContent[startIndex])) {
      while (isIncluded(startLineContent[startIndex - 1])) {
        prefix = startLineContent[startIndex - 1] + prefix;
        startIndex--;
      }
    }
    if (isIncluded(endLineContent[endIndex]) || endIndex < startIndex) {
      while (isIncluded(endLineContent[endIndex + 1])) {
        suffix += endLineContent[endIndex + 1];
        endIndex++;
      }
    }
    let newEdit = new TextReplacement(new Range2(edit3.range.startLineNumber, startIndex + 1, edit3.range.endLineNumber, endIndex + 2), prefix + edit3.text + suffix);
    if (result.length > 0 && Range2.areIntersectingOrTouching(result[result.length - 1].range, newEdit.range)) {
      newEdit = TextReplacement.joinReplacements([result.pop(), newEdit], originalText);
    }
    result.push(newEdit);
  }
  function isIncluded(c) {
    if (c === void 0) {
      return false;
    }
    return fn(c);
  }
  return result;
}
export { getViewData, isSingleLineInsertion, isSingleLineInsertionAfterPosition, isSingleMultiLineInsertion, isDeletion2, growEditsToEntireWord, growEditsUntilWhitespace, _growEdits, InlineEditsView, createEmptyViewData };
