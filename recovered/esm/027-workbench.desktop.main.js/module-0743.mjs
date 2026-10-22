// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableSignal } from "./module-0058.mjs";
import { derived, derivedHandleChanges, derivedOpts } from "./module-0054.mjs";
import { Position } from "./module-0079.mjs";
import { Emitter } from "./module-0017.mjs";
import { subtransaction, transaction } from "./module-0045.mjs";
import { isDefined } from "./module-0010.mjs";
import { arrayEqualsC } from "./module-0042.mjs";
import { GhostText, ghostTextOrReplacementEquals, ghostTextsOrReplacementsEqual } from "./module-0718.mjs";
import { LineRange } from "./module-0174.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { TextModelText } from "./module-0521.mjs";
import { URI } from "./module-0032.mjs";
import { singleTextEditAugments, singleTextRemoveCommonPrefix } from "./module-0719.mjs";
import { computeGhostText } from "./module-0720.mjs";
import { Range2 } from "./module-0106.mjs";
import { InlineCompletionsSource } from "./module-0737.mjs";
import { product_default } from "./module-0139.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { constObservable } from "./module-0061.mjs";
import { TypingInterval } from "./module-0739.mjs";
import { Schemas } from "./module-0033.mjs";
import { mapObservableArrayCached, recomputeInitiallyAndOnChange } from "./module-0059.mjs";
import { autorun } from "./module-0052.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { firstNonWhitespaceIndex } from "./module-0030.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { mapFindFirst } from "./module-0006.mjs";
import { EditSources } from "./module-0377.mjs";
import { BugIndicatingError, onUnexpectedExternalError } from "./module-0004.mjs";
import { getInlineCompletionsController } from "./module-0742.mjs";
import { getEndPositionsAfterApplying, removeTextReplacementCommonSuffixPrefix } from "./module-0716.mjs";
import { Selection } from "./module-0107.mjs";
import { TextLength } from "./module-0175.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInlineCompletionsService } from "./module-0738.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { StringReplacement } from "./module-0193.mjs";
import { AnimatedValue, ObservableAnimatedValue, easeOutCubic2 } from "./module-0717.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.ts
var InlineCompletionsModel = class extends Disposable {
  constructor(textModel, _selectedSuggestItem, _textModelVersionId, _positions, _debounceValue, _enabled, _isSuppressed, _editor, _instantiationService, _commandService, _languageConfigurationService, _accessibilityService, _languageFeaturesService, _codeEditorService, _inlineCompletionsService, defaultAccountService) {
    super();
    this.textModel = textModel;
    this._selectedSuggestItem = _selectedSuggestItem;
    this._textModelVersionId = _textModelVersionId;
    this._positions = _positions;
    this._debounceValue = _debounceValue;
    this._enabled = _enabled;
    this._isSuppressed = _isSuppressed;
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._commandService = _commandService;
    this._languageConfigurationService = _languageConfigurationService;
    this._accessibilityService = _accessibilityService;
    this._languageFeaturesService = _languageFeaturesService;
    this._codeEditorService = _codeEditorService;
    this._inlineCompletionsService = _inlineCompletionsService;
    this._isActive = observableValue(this, false);
    this._onlyRequestInlineEditsSignal = observableSignal(this);
    this._forceUpdateExplicitlySignal = observableSignal(this);
    this._noDelaySignal = observableSignal(this);
    this._fetchSpecificProviderSignal = observableSignal(this);
    // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
    this._selectedInlineCompletionId = observableValue(this, void 0);
    this.primaryPosition = derived(this, (reader) => this._positions.read(reader)[0] ?? new Position(1, 1));
    this.allPositions = derived(this, (reader) => this._positions.read(reader));
    this.sku = observableValue(this, void 0);
    this._isAcceptingPartially = false;
    this._appearedInsideViewport = derived(this, (reader) => {
      const state = this.state.read(reader);
      if (!state || !state.inlineSuggestion) {
        return false;
      }
      return isSuggestionInViewport(this._editor, state.inlineSuggestion, reader);
    });
    this._onDidAccept = this._register(new Emitter());
    this.onDidAccept = this._onDidAccept.event;
    this._lastShownInlineCompletionInfo = void 0;
    this._lastAcceptedInlineCompletionInfo = void 0;
    this._didUndoInlineEdits = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: () => ({ didUndo: false }),
        handleChange: (ctx, changeSummary) => {
          changeSummary.didUndo = ctx.didChange(this._textModelVersionId) && !!ctx.change?.isUndoing;
          return true;
        }
      }
    }, (reader, changeSummary) => {
      const versionId = this._textModelVersionId.read(reader);
      if (versionId !== null && this._lastAcceptedInlineCompletionInfo && this._lastAcceptedInlineCompletionInfo.textModelVersionIdAfter === versionId - 1 && this._lastAcceptedInlineCompletionInfo.inlineCompletion.isInlineEdit && changeSummary.didUndo) {
        this._lastAcceptedInlineCompletionInfo = void 0;
        return true;
      }
      return false;
    });
    this._preserveCurrentCompletionReasons = /* @__PURE__ */ new Set([
      1 /* Redo */,
      0 /* Undo */,
      2 /* AcceptWord */
    ]);
    this.dontRefetchSignal = observableSignal(this);
    this._fetchInlineCompletionsPromise = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: () => ({
          dontRefetch: false,
          preserveCurrentCompletion: false,
          inlineCompletionTriggerKind: 0 /* Automatic */,
          onlyRequestInlineEdits: false,
          shouldDebounce: true,
          provider: void 0,
          changeHint: void 0,
          textChange: false,
          changeReason: ""
        }),
        handleChange: (ctx, changeSummary) => {
          if (ctx.didChange(this._textModelVersionId)) {
            if (this._preserveCurrentCompletionReasons.has(this._getReason(ctx.change))) {
              changeSummary.preserveCurrentCompletion = true;
            }
            const detailedReasons = ctx.change?.detailedReasons ?? [];
            changeSummary.changeReason = detailedReasons.length > 0 ? detailedReasons[0].getType() : "";
            changeSummary.textChange = true;
          } else if (ctx.didChange(this._forceUpdateExplicitlySignal)) {
            changeSummary.preserveCurrentCompletion = true;
            changeSummary.inlineCompletionTriggerKind = 1 /* Explicit */;
          } else if (ctx.didChange(this.dontRefetchSignal)) {
            changeSummary.dontRefetch = true;
          } else if (ctx.didChange(this._onlyRequestInlineEditsSignal)) {
            changeSummary.onlyRequestInlineEdits = true;
          } else if (ctx.didChange(this._fetchSpecificProviderSignal)) {
            changeSummary.provider = ctx.change?.provider;
            changeSummary.changeHint = ctx.change?.changeHint;
          }
          return true;
        }
      }
    }, (reader, changeSummary) => {
      this._source.clearOperationOnTextModelChange.read(reader);
      this._noDelaySignal.read(reader);
      this.dontRefetchSignal.read(reader);
      this._onlyRequestInlineEditsSignal.read(reader);
      this._forceUpdateExplicitlySignal.read(reader);
      this._fetchSpecificProviderSignal.read(reader);
      const shouldUpdate = !this._isSuppressed() && (this._enabled.read(reader) && this._selectedSuggestItem.read(reader) || this._isActive.read(reader)) && (!this._inlineCompletionsService.isSnoozing() || changeSummary.inlineCompletionTriggerKind === 1 /* Explicit */);
      if (!shouldUpdate) {
        this._source.cancelUpdate();
        return void 0;
      }
      this._textModelVersionId.read(reader);
      const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(void 0);
      let suggestItem = this._selectedSuggestItem.read(reader);
      if (this._shouldShowOnSuggestConflict.read(void 0)) {
        suggestItem = void 0;
      }
      if (suggestWidgetInlineCompletions && !suggestItem) {
        this._source.seedInlineCompletionsWithSuggestWidget();
      }
      if (changeSummary.dontRefetch) {
        return Promise.resolve(true);
      }
      if (this._didUndoInlineEdits.read(reader) && changeSummary.inlineCompletionTriggerKind !== 1 /* Explicit */) {
        transaction((tx) => {
          this._source.clear(tx);
        });
        return void 0;
      }
      let reason = "";
      if (changeSummary.provider) {
        reason += "providerOnDidChange";
      } else if (changeSummary.inlineCompletionTriggerKind === 1 /* Explicit */) {
        reason += "explicit";
      }
      if (changeSummary.changeReason) {
        reason += reason.length > 0 ? `:${changeSummary.changeReason}` : changeSummary.changeReason;
      }
      const typingInterval = this._typing.getTypingInterval();
      const requestInfo = {
        editorType: this.editorType,
        startTime: Date.now(),
        languageId: this.textModel.getLanguageId(),
        reason,
        typingInterval: typingInterval.averageInterval,
        typingIntervalCharacterCount: typingInterval.characterCount,
        availableProviders: [],
        sku: this.sku.read(void 0)
      };
      let context2 = {
        triggerKind: changeSummary.inlineCompletionTriggerKind,
        selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo(),
        includeInlineCompletions: !changeSummary.onlyRequestInlineEdits,
        includeInlineEdits: this._inlineEditsEnabled.read(reader),
        requestIssuedDateTime: requestInfo.startTime,
        earliestShownDateTime: requestInfo.startTime + (changeSummary.inlineCompletionTriggerKind === 1 /* Explicit */ || this.inAcceptFlow.read(void 0) ? 0 : this._minShowDelay.read(void 0)),
        changeHint: changeSummary.changeHint
      };
      if (context2.triggerKind === 0 /* Automatic */ && changeSummary.textChange) {
        if (this.textModel.getAlternativeVersionId() === this._lastShownInlineCompletionInfo?.alternateTextModelVersionId) {
          context2 = {
            ...context2,
            includeInlineCompletions: !this._lastShownInlineCompletionInfo.inlineCompletion.isInlineEdit,
            includeInlineEdits: this._lastShownInlineCompletionInfo.inlineCompletion.isInlineEdit
          };
        }
      }
      const itemToPreserveCandidate = this.selectedInlineCompletion.read(void 0) ?? this._inlineSuggestionItems.read(void 0)?.inlineEdit;
      const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable ? itemToPreserveCandidate : void 0;
      const userJumpedToActiveCompletion = this._jumpedToId.map((jumpedTo) => !!jumpedTo && jumpedTo === this._inlineSuggestionItems.read(void 0)?.inlineEdit?.semanticId);
      const providers2 = changeSummary.provider ? { providers: [changeSummary.provider], label: "single:" + changeSummary.provider.providerId?.toString() } : { providers: this._languageFeaturesService.inlineCompletionsProvider.all(this.textModel), label: void 0 };
      const availableProviders = this.getAvailableProviders(providers2.providers);
      requestInfo.availableProviders = availableProviders.map((p) => p.providerId).filter(isDefined);
      return this._source.fetch(availableProviders, providers2.label, context2, itemToPreserve?.identity, changeSummary.shouldDebounce, userJumpedToActiveCompletion, requestInfo);
    });
    this._inlineSuggestionItems = derivedOpts({ owner: this }, (reader) => {
      const c = this._source.inlineCompletions.read(reader);
      if (!c) {
        return void 0;
      }
      const cursorPosition = this.primaryPosition.read(reader);
      let inlineEdit = void 0;
      const visibleCompletions = [];
      for (const completion of c.inlineCompletions) {
        if (!completion.isInlineEdit) {
          if (completion.isVisible(this.textModel, cursorPosition)) {
            visibleCompletions.push(completion);
          }
        } else {
          inlineEdit = completion;
        }
      }
      if (visibleCompletions.length !== 0) {
        inlineEdit = void 0;
      }
      return {
        inlineCompletions: visibleCompletions,
        inlineEdit
      };
    });
    this._inlineCompletionItems = derivedOpts({ owner: this, equalsFn: arrayEqualsC() }, (reader) => {
      const c = this._inlineSuggestionItems.read(reader);
      return c?.inlineCompletions ?? [];
    });
    this.selectedInlineCompletionIndex = derived(this, (reader) => {
      const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
      const filteredCompletions = this._inlineCompletionItems.read(reader);
      const idx = this._selectedInlineCompletionId === void 0 ? -1 : filteredCompletions.findIndex((v2) => v2.semanticId === selectedInlineCompletionId);
      if (idx === -1) {
        this._selectedInlineCompletionId.set(void 0, void 0);
        return 0;
      }
      return idx;
    });
    this.selectedInlineCompletion = derived(this, (reader) => {
      const filteredCompletions = this._inlineCompletionItems.read(reader);
      const idx = this.selectedInlineCompletionIndex.read(reader);
      return filteredCompletions[idx];
    });
    this.activeCommands = derivedOpts(
      { owner: this, equalsFn: arrayEqualsC() },
      (r2) => this.selectedInlineCompletion.read(r2)?.source.inlineSuggestions.commands ?? []
    );
    this.inlineCompletionsCount = derived(this, (reader) => {
      if (this.lastTriggerKind.read(reader) === 1 /* Explicit */) {
        return this._inlineCompletionItems.read(reader).length;
      } else {
        return void 0;
      }
    });
    this._hasVisiblePeekWidgets = derived(this, (reader) => this._editorObs.openedPeekWidgets.read(reader) > 0);
    this._shouldShowOnSuggestConflict = derived(this, (reader) => {
      const showOnSuggestConflict = this._showOnSuggestConflict.read(reader);
      if (showOnSuggestConflict !== "never") {
        const hasInlineCompletion = !!this.selectedInlineCompletion.read(reader);
        if (hasInlineCompletion) {
          const item = this._selectedSuggestItem.read(reader);
          if (!item) {
            return false;
          }
          if (showOnSuggestConflict === "whenSuggestListIsIncomplete") {
            return item.listIncomplete;
          }
          return true;
        }
      }
      return false;
    });
    this.state = derivedOpts({
      owner: this,
      equalsFn: (a, b) => {
        if (!a || !b) {
          return a === b;
        }
        if (a.kind === "ghostText" && b.kind === "ghostText") {
          return ghostTextsOrReplacementsEqual(a.ghostTexts, b.ghostTexts) && a.inlineSuggestion === b.inlineSuggestion && a.suggestItem === b.suggestItem;
        } else if (a.kind === "inlineEdit" && b.kind === "inlineEdit") {
          return a.inlineSuggestion === b.inlineSuggestion;
        }
        return false;
      }
    }, (reader) => {
      const model = this.textModel;
      if (this._suppressInSnippetMode.read(reader) && this._isInSnippetMode.read(reader)) {
        return void 0;
      }
      const item = this._inlineSuggestionItems.read(reader);
      const inlineEditResult = item?.inlineEdit;
      if (inlineEditResult) {
        if (this._hasVisiblePeekWidgets.read(reader)) {
          return void 0;
        }
        const cursorAtInlineEdit = this.primaryPosition.map((cursorPos) => LineRange.fromRangeInclusive(inlineEditResult.targetRange).addMargin(1, 1).contains(cursorPos.lineNumber));
        const stringEdit = inlineEditResult.action?.kind === "edit" ? inlineEditResult.action.stringEdit : void 0;
        const replacements = stringEdit ? TextEdit2.fromStringEdit(stringEdit, new TextModelText(this.textModel)).replacements : [];
        let nextEditUri = (item.inlineEdit?.command?.id === "vscode.open" || item.inlineEdit?.command?.id === "_workbench.open") && // eslint-disable-next-line local/code-no-any-casts
        item.inlineEdit?.command.arguments?.length ? URI.from(item.inlineEdit?.command.arguments[0]) : void 0;
        if (!inlineEditResult.originalTextRef.targets(this.textModel)) {
          nextEditUri = inlineEditResult.originalTextRef.uri;
        }
        return { kind: "inlineEdit", inlineSuggestion: inlineEditResult, edits: replacements, cursorAtInlineEdit, nextEditUri };
      }
      const suggestItem = this._selectedSuggestItem.read(reader);
      if (!this._shouldShowOnSuggestConflict.read(reader) && suggestItem) {
        const suggestCompletionEdit = singleTextRemoveCommonPrefix(suggestItem.getSingleTextEdit(), model);
        const augmentation = this._computeAugmentation(suggestCompletionEdit, reader);
        const isSuggestionPreviewEnabled = this._suggestPreviewEnabled.read(reader);
        if (!isSuggestionPreviewEnabled && !augmentation) {
          return void 0;
        }
        const fullEdit = augmentation?.edit ?? suggestCompletionEdit;
        const fullEditPreviewLength = augmentation ? augmentation.edit.text.length - suggestCompletionEdit.text.length : 0;
        const mode = this._suggestPreviewMode.read(reader);
        const positions = this._positions.read(reader);
        const allPotentialEdits = [fullEdit, ...getSecondaryEdits(this.textModel, positions, fullEdit)];
        const validEditsAndGhostTexts = allPotentialEdits.map((edit3, idx) => ({ edit: edit3, ghostText: edit3 ? computeGhostText(edit3, model, mode, positions[idx], fullEditPreviewLength) : void 0 })).filter(({ edit: edit3, ghostText }) => edit3 !== void 0 && ghostText !== void 0);
        const edits = validEditsAndGhostTexts.map(({ edit: edit3 }) => edit3);
        const ghostTexts = validEditsAndGhostTexts.map(({ ghostText }) => ghostText);
        const primaryGhostText = ghostTexts[0] ?? new GhostText(fullEdit.range.endLineNumber, []);
        return { kind: "ghostText", edits, primaryGhostText, ghostTexts, inlineSuggestion: augmentation?.completion, suggestItem };
      } else {
        if (!this._isActive.read(reader)) {
          return void 0;
        }
        const inlineSuggestion = this.selectedInlineCompletion.read(reader);
        if (!inlineSuggestion) {
          return void 0;
        }
        const replacement = inlineSuggestion.getSingleTextEdit();
        const mode = this._inlineSuggestMode.read(reader);
        const positions = this._positions.read(reader);
        const allPotentialEdits = [replacement, ...getSecondaryEdits(this.textModel, positions, replacement)];
        const validEditsAndGhostTexts = allPotentialEdits.map((edit3, idx) => ({ edit: edit3, ghostText: edit3 ? computeGhostText(edit3, model, mode, positions[idx], 0) : void 0 })).filter(({ edit: edit3, ghostText }) => edit3 !== void 0 && ghostText !== void 0);
        const edits = validEditsAndGhostTexts.map(({ edit: edit3 }) => edit3);
        const ghostTexts = validEditsAndGhostTexts.map(({ ghostText }) => ghostText);
        if (!ghostTexts[0]) {
          return void 0;
        }
        return { kind: "ghostText", edits, primaryGhostText: ghostTexts[0], ghostTexts, inlineSuggestion, suggestItem: void 0 };
      }
    });
    this.status = derived(this, (reader) => {
      if (this._source.loading.read(reader)) {
        return "loading";
      }
      const s = this.state.read(reader);
      if (s?.kind === "ghostText") {
        return "ghostText";
      }
      if (s?.kind === "inlineEdit") {
        return "inlineEdit";
      }
      return "noSuggestion";
    });
    this.inlineCompletionState = derived(this, (reader) => {
      const s = this.state.read(reader);
      if (!s || s.kind !== "ghostText") {
        return void 0;
      }
      if (this._editorObs.inComposition.read(reader)) {
        return void 0;
      }
      return s;
    });
    this.inlineEditState = derived(this, (reader) => {
      const s = this.state.read(reader);
      if (!s || s.kind !== "inlineEdit") {
        return void 0;
      }
      return s;
    });
    this.inlineEditAvailable = derived(this, (reader) => {
      const s = this.inlineEditState.read(reader);
      return !!s;
    });
    this.warning = derived(this, (reader) => {
      return this.inlineCompletionState.read(reader)?.inlineSuggestion?.warning;
    });
    this.ghostTexts = derivedOpts({ owner: this, equalsFn: ghostTextsOrReplacementsEqual }, (reader) => {
      const v2 = this.inlineCompletionState.read(reader);
      if (!v2) {
        return void 0;
      }
      return v2.ghostTexts;
    });
    this.primaryGhostText = derivedOpts({ owner: this, equalsFn: ghostTextOrReplacementEquals }, (reader) => {
      const v2 = this.inlineCompletionState.read(reader);
      if (!v2) {
        return void 0;
      }
      return v2?.primaryGhostText;
    });
    this.showCollapsed = derived(this, (reader) => {
      const state = this.state.read(reader);
      if (!state || state.kind !== "inlineEdit") {
        return false;
      }
      if (state.inlineSuggestion.hint || state.inlineSuggestion.action?.kind === "jumpTo") {
        return false;
      }
      const isCurrentModelVersion = state.inlineSuggestion.updatedEditModelVersion === this._textModelVersionId.read(reader);
      return (this._inlineEditsShowCollapsedEnabled.read(reader) || !isCurrentModelVersion) && this._jumpedToId.read(reader) !== state.inlineSuggestion.semanticId && !this._inAcceptFlow.read(reader);
    });
    this._tabShouldIndent = derived(this, (reader) => {
      if (this._inAcceptFlow.read(reader)) {
        return false;
      }
      function isMultiLine(range2) {
        return range2.startLineNumber !== range2.endLineNumber;
      }
      function getNonIndentationRange(model, lineNumber) {
        const columnStart = model.getLineIndentColumn(lineNumber);
        const lastNonWsColumn = model.getLineLastNonWhitespaceColumn(lineNumber);
        const columnEnd = Math.max(lastNonWsColumn, columnStart);
        return new Range2(lineNumber, columnStart, lineNumber, columnEnd);
      }
      const selections = this._editorObs.selections.read(reader);
      return selections?.some((s) => {
        if (s.isEmpty()) {
          return this.textModel.getLineLength(s.startLineNumber) === 0;
        } else {
          return isMultiLine(s) || s.containsRange(getNonIndentationRange(this.textModel, s.startLineNumber));
        }
      });
    });
    this.tabShouldJumpToInlineEdit = derived(this, (reader) => {
      if (this._tabShouldIndent.read(reader)) {
        return false;
      }
      const s = this.inlineEditState.read(reader);
      if (!s) {
        return false;
      }
      if (s.inlineSuggestion.action?.kind === "jumpTo") {
        return true;
      }
      if (this.showCollapsed.read(reader)) {
        return true;
      }
      if (this._inAcceptFlow.read(reader) && this._appearedInsideViewport.read(reader)) {
        return false;
      }
      return !s.cursorAtInlineEdit.read(reader);
    });
    this.tabShouldAcceptInlineEdit = derived(this, (reader) => {
      const s = this.inlineEditState.read(reader);
      if (!s) {
        return false;
      }
      if (s.inlineSuggestion.action?.kind === "jumpTo") {
        return false;
      }
      if (this.showCollapsed.read(reader)) {
        return false;
      }
      if (this._tabShouldIndent.read(reader)) {
        return false;
      }
      if (this._inAcceptFlow.read(reader) && this._appearedInsideViewport.read(reader)) {
        return true;
      }
      if (s.inlineSuggestion.targetRange.startLineNumber === this._editorObs.cursorLineNumber.read(reader)) {
        return true;
      }
      if (this._jumpedToId.read(reader) === s.inlineSuggestion.semanticId) {
        return true;
      }
      return s.cursorAtInlineEdit.read(reader);
    });
    this._jumpedToId = observableValue(this, void 0);
    this._inAcceptFlow = observableValue(this, false);
    this.inAcceptFlow = this._inAcceptFlow;
    this._source = this._register(this._instantiationService.createInstance(InlineCompletionsSource, this.textModel, this._textModelVersionId, this._debounceValue, this.primaryPosition, product_default.defaultChatAgent?.completionsEnablementSetting));
    this.lastTriggerKind = this._source.inlineCompletions.map(this, (v2) => v2?.request?.context.triggerKind);
    this._editorObs = observableCodeEditor(this._editor);
    const suggest = this._editorObs.getOption(134 /* suggest */);
    this._suggestPreviewEnabled = suggest.map((v2) => v2.preview);
    this._suggestPreviewMode = suggest.map((v2) => v2.previewMode);
    const inlineSuggest = this._editorObs.getOption(71 /* inlineSuggest */);
    this._inlineSuggestMode = inlineSuggest.map((v2) => v2.mode);
    this._suppressedInlineCompletionGroupIds = inlineSuggest.map((v2) => new Set(v2.experimental.suppressInlineSuggestions.split(",")));
    this._inlineEditsEnabled = inlineSuggest.map((v2) => !!v2.edits.enabled);
    this._inlineEditsShowCollapsedEnabled = inlineSuggest.map((s) => s.edits.showCollapsed);
    this._triggerCommandOnProviderChange = inlineSuggest.map((s) => s.triggerCommandOnProviderChange);
    this._minShowDelay = inlineSuggest.map((s) => s.minShowDelay);
    this._showOnSuggestConflict = inlineSuggest.map((s) => s.experimental.showOnSuggestConflict);
    this._suppressInSnippetMode = inlineSuggest.map((s) => s.suppressInSnippetMode);
    const snippetController = SnippetController2.get(this._editor);
    this._isInSnippetMode = snippetController?.isInSnippetObservable ?? constObservable(false);
    defaultAccountService.getDefaultAccount().then(createDisposableCb((account) => this.sku.set(skuFromAccount(account), void 0), this._store));
    this._register(defaultAccountService.onDidChangeDefaultAccount((account) => this.sku.set(skuFromAccount(account), void 0)));
    this._typing = this._register(new TypingInterval(this.textModel));
    this._register(this._inlineCompletionsService.onDidChangeIsSnoozing((isSnoozing) => {
      if (isSnoozing) {
        this.stop();
      }
    }));
    {
      const isNotebook = this.textModel.uri.scheme === Schemas.vscodeNotebookCell;
      const [diffEditor] = this._codeEditorService.listDiffEditors().filter((d) => d.getOriginalEditor().getId() === this._editor.getId() || d.getModifiedEditor().getId() === this._editor.getId());
      this.isInDiffEditor = !!diffEditor;
      this.editorType = isNotebook ? "notebook" /* Notebook */ : this.isInDiffEditor ? "diffEditor" /* DiffEditor */ : "textEditor" /* TextEditor */;
    }
    this._register(recomputeInitiallyAndOnChange(this.state, (s) => {
      if (s && s.inlineSuggestion) {
        this._inlineCompletionsService.reportNewCompletion(s.inlineSuggestion.requestUuid);
      }
    }));
    this._register(recomputeInitiallyAndOnChange(this._fetchInlineCompletionsPromise));
    this._register(autorun((reader) => {
      this._editorObs.versionId.read(reader);
      this._inAcceptFlow.set(false, void 0);
    }));
    this._register(autorun((reader) => {
      const jumpToReset = this.state.map((s, reader2) => !s || s.kind === "inlineEdit" && !s.cursorAtInlineEdit.read(reader2)).read(reader);
      if (jumpToReset) {
        this._jumpedToId.set(void 0, void 0);
      }
    }));
    this._register(autorun((reader) => {
      const inlineSuggestion = this.state.map((s) => s?.inlineSuggestion).read(reader);
      if (inlineSuggestion) {
        inlineSuggestion.addPerformanceMarker("activeSuggestion");
      }
    }));
    const inlineEditSemanticId = this.inlineEditState.map((s) => s?.inlineSuggestion.semanticId);
    this._register(autorun((reader) => {
      const id2 = inlineEditSemanticId.read(reader);
      if (id2) {
        this._editor.pushUndoStop();
        this._lastShownInlineCompletionInfo = {
          alternateTextModelVersionId: this.textModel.getAlternativeVersionId(),
          inlineCompletion: this.state.get().inlineSuggestion
        };
      }
    }));
    const inlineCompletionProviders = observableFromEvent(this._languageFeaturesService.inlineCompletionsProvider.onDidChange, () => this._languageFeaturesService.inlineCompletionsProvider.all(textModel));
    mapObservableArrayCached(this, inlineCompletionProviders, (provider, store) => {
      if (!provider.onDidChangeInlineCompletions) {
        return;
      }
      store.add(provider.onDidChangeInlineCompletions((changeHint) => {
        if (!this._enabled.get()) {
          return;
        }
        const activeEditor = this._codeEditorService.getFocusedCodeEditor() || this._codeEditorService.getActiveCodeEditor();
        if (activeEditor !== this._editor) {
          return;
        }
        if (this._triggerCommandOnProviderChange.get()) {
          this.trigger(void 0, { onlyFetchInlineEdits: true });
          return;
        }
        const activeState = this.state.get();
        if (activeState && (activeState.inlineSuggestion || activeState.edits) && activeState.inlineSuggestion?.source.provider !== provider) {
          return;
        }
        transaction((tx) => {
          this._fetchSpecificProviderSignal.trigger(tx, { provider, changeHint: changeHint ?? void 0 });
          this.trigger(tx);
        });
      }));
    }).recomputeInitiallyAndOnChange(this._store);
    this._didUndoInlineEdits.recomputeInitiallyAndOnChange(this._store);
  }
  get isAcceptingPartially() {
    return this._isAcceptingPartially;
  }
  get editor() {
    return this._editor;
  }
  debugGetSelectedSuggestItem() {
    return this._selectedSuggestItem;
  }
  getIndentationInfo(reader) {
    let startsWithIndentation = false;
    let startsWithIndentationLessThanTabSize = true;
    const ghostText = this?.primaryGhostText.read(reader);
    if (!!this?._selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
      const { column, lines } = ghostText.parts[0];
      const firstLine3 = lines[0].line;
      const indentationEndColumn = this.textModel.getLineIndentColumn(ghostText.lineNumber);
      const inIndentation = column <= indentationEndColumn;
      if (inIndentation) {
        let firstNonWsIdx = firstNonWhitespaceIndex(firstLine3);
        if (firstNonWsIdx === -1) {
          firstNonWsIdx = firstLine3.length - 1;
        }
        startsWithIndentation = firstNonWsIdx > 0;
        const tabSize = this.textModel.getOptions().tabSize;
        const visibleColumnIndentation = CursorColumns.visibleColumnFromColumn(firstLine3, firstNonWsIdx + 1, tabSize);
        startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
      }
    }
    return {
      startsWithIndentation,
      startsWithIndentationLessThanTabSize
    };
  }
  _getReason(e) {
    if (e?.isUndoing) {
      return 0 /* Undo */;
    }
    if (e?.isRedoing) {
      return 1 /* Redo */;
    }
    if (this.isAcceptingPartially) {
      return 2 /* AcceptWord */;
    }
    return 3 /* Other */;
  }
  // TODO: This is not an ideal implementation of excludesGroupIds, however as this is currently still behind proposed API
  // and due to the time constraints, we are using a simplified approach
  getAvailableProviders(providers2) {
    const suppressedProviderGroupIds = this._suppressedInlineCompletionGroupIds.get();
    const unsuppressedProviders = providers2.filter((provider) => !(provider.groupId && suppressedProviderGroupIds.has(provider.groupId)));
    const excludedGroupIds = /* @__PURE__ */ new Set();
    for (const provider of unsuppressedProviders) {
      provider.excludesGroupIds?.forEach((p) => excludedGroupIds.add(p));
    }
    const availableProviders = [];
    for (const provider of unsuppressedProviders) {
      if (provider.groupId && excludedGroupIds.has(provider.groupId)) {
        continue;
      }
      availableProviders.push(provider);
    }
    return availableProviders;
  }
  async trigger(tx, options3 = {}) {
    subtransaction(tx, (tx2) => {
      if (options3.onlyFetchInlineEdits) {
        this._onlyRequestInlineEditsSignal.trigger(tx2);
      }
      if (options3.noDelay) {
        this._noDelaySignal.trigger(tx2);
      }
      this._isActive.set(true, tx2);
      if (options3.explicit) {
        this._inAcceptFlow.set(true, tx2);
        this._forceUpdateExplicitlySignal.trigger(tx2);
      }
      if (options3.provider) {
        this._fetchSpecificProviderSignal.trigger(tx2, { provider: options3.provider, changeHint: options3.changeHint });
      }
    });
    await this._fetchInlineCompletionsPromise.get();
  }
  async triggerExplicitly(tx, onlyFetchInlineEdits = false) {
    return this.trigger(tx, { onlyFetchInlineEdits, explicit: true });
  }
  stop(stopReason = "automatic", tx) {
    subtransaction(tx, (tx2) => {
      if (stopReason === "explicitCancel") {
        const inlineCompletion = this.state.get()?.inlineSuggestion;
        if (inlineCompletion) {
          inlineCompletion.reportEndOfLife({ kind: 1 /* Rejected */ });
        }
      }
      this._isActive.set(false, tx2);
      this._source.clear(tx2);
    });
  }
  _computeAugmentation(suggestCompletion, reader) {
    const model = this.textModel;
    const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
    const candidateInlineCompletions = suggestWidgetInlineCompletions ? suggestWidgetInlineCompletions.inlineCompletions.filter((c) => !c.isInlineEdit) : [this.selectedInlineCompletion.read(reader)].filter(isDefined);
    const augmentedCompletion = mapFindFirst(candidateInlineCompletions, (completion) => {
      let r2 = completion.getSingleTextEdit();
      r2 = singleTextRemoveCommonPrefix(
        r2,
        model,
        Range2.fromPositions(r2.range.getStartPosition(), suggestCompletion.range.getEndPosition())
      );
      return singleTextEditAugments(r2, suggestCompletion) ? { completion, edit: r2 } : void 0;
    });
    return augmentedCompletion;
  }
  async _deltaSelectedInlineCompletionIndex(delta2) {
    await this.triggerExplicitly();
    const completions = this._inlineCompletionItems.get() || [];
    if (completions.length > 0) {
      const newIdx = (this.selectedInlineCompletionIndex.get() + delta2 + completions.length) % completions.length;
      this._selectedInlineCompletionId.set(completions[newIdx].semanticId, void 0);
    } else {
      this._selectedInlineCompletionId.set(void 0, void 0);
    }
  }
  async next() {
    await this._deltaSelectedInlineCompletionIndex(1);
  }
  async previous() {
    await this._deltaSelectedInlineCompletionIndex(-1);
  }
  _getMetadata(completion, languageId, type = void 0) {
    if (type) {
      return EditSources.inlineCompletionPartialAccept({
        nes: completion.isInlineEdit,
        requestUuid: completion.requestUuid,
        providerId: completion.source.provider.providerId,
        languageId,
        type,
        correlationId: completion.getSourceCompletion().correlationId
      });
    } else {
      return EditSources.inlineCompletionAccept({
        nes: completion.isInlineEdit,
        requestUuid: completion.requestUuid,
        correlationId: completion.getSourceCompletion().correlationId,
        providerId: completion.source.provider.providerId,
        languageId
      });
    }
  }
  async accept(editor = this._editor, alternativeAction = false) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    let completion;
    let isNextEditUri = false;
    const state = this.state.get();
    if (state?.kind === "ghostText") {
      if (!state || state.primaryGhostText.isEmpty() || !state.inlineSuggestion) {
        return;
      }
      completion = state.inlineSuggestion;
    } else if (state?.kind === "inlineEdit") {
      completion = state.inlineSuggestion;
      isNextEditUri = !!state.nextEditUri;
    } else {
      return;
    }
    completion.addRef();
    try {
      let followUpTrigger = false;
      editor.pushUndoStop();
      if (!completion.originalTextRef.targets(this.textModel)) {
        const targetEditor = await this._codeEditorService.openCodeEditor({ resource: completion.originalTextRef.uri }, this._editor);
        if (targetEditor) {
          const controller = getInlineCompletionsController(targetEditor);
          const m = controller?.model.get();
          targetEditor.focus();
          m?.transplantCompletion(completion);
          targetEditor.revealLineInCenter(completion.targetRange.startLineNumber);
        }
      } else if (isNextEditUri) {
      } else if (completion.action?.kind === "edit") {
        const action = completion.action;
        if (alternativeAction && action.alternativeAction) {
          followUpTrigger = true;
          const altCommand = action.alternativeAction.command;
          await this._commandService.executeCommand(altCommand.id, ...altCommand.arguments || []).then(void 0, onUnexpectedExternalError);
        } else if (action.snippetInfo) {
          const mainEdit = TextReplacement.delete(action.textReplacement.range);
          const additionalEdits = completion.additionalTextEdits.map((e) => new TextReplacement(Range2.lift(e.range), e.text ?? ""));
          const edit3 = TextEdit2.fromParallelReplacementsUnsorted([mainEdit, ...additionalEdits]);
          editor.edit(edit3, this._getMetadata(completion, this.textModel.getLanguageId()));
          editor.setPosition(action.snippetInfo.range.getStartPosition(), "inlineCompletionAccept");
          SnippetController2.get(editor)?.insert(action.snippetInfo.snippet, { undoStopBefore: false });
        } else {
          const edits = state.edits;
          let minimalEdits = edits;
          if (state.kind === "ghostText") {
            minimalEdits = removeTextReplacementCommonSuffixPrefix(edits, this.textModel);
          }
          const selections = getEndPositionsAfterApplying(minimalEdits).map((p) => Selection.fromPositions(p));
          const additionalEdits = completion.additionalTextEdits.map((e) => new TextReplacement(Range2.lift(e.range), e.text ?? ""));
          const edit3 = TextEdit2.fromParallelReplacementsUnsorted([...edits, ...additionalEdits]);
          editor.edit(edit3, this._getMetadata(completion, this.textModel.getLanguageId()));
          if (completion.hint === void 0) {
            editor.setSelections(state.kind === "inlineEdit" ? selections.slice(-1) : selections, "inlineCompletionAccept");
          }
          if (state.kind === "inlineEdit" && !this._accessibilityService.isMotionReduced()) {
            const editRanges = edit3.getNewRanges();
            const dec = this._store.add(new FadeoutDecoration(editor, editRanges, () => {
              this._store.delete(dec);
            }));
          }
        }
      }
      this._onDidAccept.fire();
      this.stop();
      if (completion.command) {
        await this._commandService.executeCommand(completion.command.id, ...completion.command.arguments || []).then(void 0, onUnexpectedExternalError);
      }
      if (followUpTrigger) {
        this.trigger(void 0);
      }
      completion.reportEndOfLife({ kind: 0 /* Accepted */, alternativeAction });
    } finally {
      completion.removeRef();
      this._inAcceptFlow.set(true, void 0);
      this._lastAcceptedInlineCompletionInfo = { textModelVersionIdAfter: this.textModel.getVersionId(), inlineCompletion: completion };
    }
  }
  async acceptNextWord() {
    await this._acceptNext(this._editor, "word", (pos, text2) => {
      const langId = this.textModel.getLanguageIdAtPosition(pos.lineNumber, pos.column);
      const config = this._languageConfigurationService.getLanguageConfiguration(langId);
      const wordRegExp = new RegExp(config.wordDefinition.source, config.wordDefinition.flags.replace("g", ""));
      const m1 = text2.match(wordRegExp);
      let acceptUntilIndexExclusive = 0;
      if (m1 && m1.index !== void 0) {
        if (m1.index === 0) {
          acceptUntilIndexExclusive = m1[0].length;
        } else {
          acceptUntilIndexExclusive = m1.index;
        }
      } else {
        acceptUntilIndexExclusive = text2.length;
      }
      const wsRegExp = /\s+/g;
      const m2 = wsRegExp.exec(text2);
      if (m2 && m2.index !== void 0) {
        if (m2.index + m2[0].length < acceptUntilIndexExclusive) {
          acceptUntilIndexExclusive = m2.index + m2[0].length;
        }
      }
      return acceptUntilIndexExclusive;
    }, 0 /* Word */);
  }
  async acceptNextLine() {
    await this._acceptNext(this._editor, "line", (pos, text2) => {
      const m = text2.match(/\n/);
      if (m && m.index !== void 0) {
        return m.index + 1;
      }
      return text2.length;
    }, 1 /* Line */);
  }
  async _acceptNext(editor, type, getAcceptUntilIndex, kind) {
    if (editor.getModel() !== this.textModel) {
      throw new BugIndicatingError();
    }
    const state = this.inlineCompletionState.get();
    if (!state || state.primaryGhostText.isEmpty() || !state.inlineSuggestion) {
      return;
    }
    const ghostText = state.primaryGhostText;
    const completion = state.inlineSuggestion;
    if (completion.snippetInfo) {
      await this.accept(editor);
      return;
    }
    const firstPart = ghostText.parts[0];
    const ghostTextPos = new Position(ghostText.lineNumber, firstPart.column);
    const ghostTextVal = firstPart.text;
    const acceptUntilIndexExclusive = getAcceptUntilIndex(ghostTextPos, ghostTextVal);
    if (acceptUntilIndexExclusive === ghostTextVal.length && ghostText.parts.length === 1) {
      this.accept(editor);
      return;
    }
    const partialGhostTextVal = ghostTextVal.substring(0, acceptUntilIndexExclusive);
    const positions = this._positions.get();
    const cursorPosition = positions[0];
    completion.addRef();
    try {
      this._isAcceptingPartially = true;
      try {
        editor.pushUndoStop();
        const replaceRange = Range2.fromPositions(cursorPosition, ghostTextPos);
        const newText = editor.getModel().getValueInRange(replaceRange) + partialGhostTextVal;
        const primaryEdit = new TextReplacement(replaceRange, newText);
        const edits = [primaryEdit, ...getSecondaryEdits(this.textModel, positions, primaryEdit)].filter(isDefined);
        const selections = getEndPositionsAfterApplying(edits).map((p) => Selection.fromPositions(p));
        editor.edit(TextEdit2.fromParallelReplacementsUnsorted(edits), this._getMetadata(completion, this.textModel.getLanguageId(), type));
        editor.setSelections(selections, "inlineCompletionPartialAccept");
        editor.revealPositionInCenterIfOutsideViewport(editor.getPosition(), 0 /* Smooth */);
      } finally {
        this._isAcceptingPartially = false;
      }
      const acceptedRange = Range2.fromPositions(completion.editRange.getStartPosition(), TextLength.ofText(partialGhostTextVal).addToPosition(ghostTextPos));
      const text2 = editor.getModel().getValueInRange(acceptedRange, 1 /* LF */);
      const acceptedLength = text2.length;
      completion.reportPartialAccept(
        acceptedLength,
        { kind, acceptedLength },
        { characters: acceptUntilIndexExclusive, ratio: acceptUntilIndexExclusive / ghostTextVal.length, count: 1 }
      );
    } finally {
      completion.removeRef();
    }
  }
  handleSuggestAccepted(item) {
    const itemEdit = singleTextRemoveCommonPrefix(item.getSingleTextEdit(), this.textModel);
    const augmentedCompletion = this._computeAugmentation(itemEdit, void 0);
    if (!augmentedCompletion) {
      return;
    }
    const alreadyAcceptedLength = this.textModel.getValueInRange(augmentedCompletion.completion.editRange, 1 /* LF */).length;
    const acceptedLength = alreadyAcceptedLength + itemEdit.text.length;
    augmentedCompletion.completion.reportPartialAccept(itemEdit.text.length, {
      kind: 2 /* Suggest */,
      acceptedLength
    }, {
      characters: itemEdit.text.length,
      count: 1,
      ratio: 1
    });
  }
  extractReproSample() {
    const value2 = this.textModel.getValue();
    const item = this.state.get()?.inlineSuggestion;
    return {
      documentValue: value2,
      inlineCompletion: item?.getSourceCompletion()
    };
  }
  jump() {
    const s = this.inlineEditState.get();
    if (!s) {
      return;
    }
    const suggestion = s.inlineSuggestion;
    if (!suggestion.originalTextRef.targets(this.textModel)) {
      this.accept(this._editor);
      return;
    }
    suggestion.addRef();
    try {
      transaction((tx) => {
        if (suggestion.action?.kind === "jumpTo") {
          this.stop(void 0, tx);
          suggestion.reportEndOfLife({ kind: 0 /* Accepted */, alternativeAction: false });
        }
        this._jumpedToId.set(s.inlineSuggestion.semanticId, tx);
        this.dontRefetchSignal.trigger(tx);
        const targetRange = s.inlineSuggestion.targetRange;
        const targetPosition = targetRange.getStartPosition();
        this._editor.setPosition(targetPosition, "inlineCompletions.jump");
        const isSingleLineChange = targetRange.isSingleLine() && (s.inlineSuggestion.hint || s.inlineSuggestion.action?.kind === "edit" && !s.inlineSuggestion.action.textReplacement.text.includes("\n"));
        if (isSingleLineChange || s.inlineSuggestion.action?.kind === "jumpTo") {
          this._editor.revealPosition(targetPosition, 0 /* Smooth */);
        } else {
          const revealRange = new Range2(targetRange.startLineNumber - 1, 1, targetRange.endLineNumber + 1, 1);
          this._editor.revealRange(revealRange, 0 /* Smooth */);
        }
        s.inlineSuggestion.identity.setJumpTo(tx);
        this._editor.focus();
      });
    } finally {
      suggestion.removeRef();
    }
  }
  async handleInlineSuggestionShown(inlineCompletion, viewKind, viewData, timeWhenShown) {
    await inlineCompletion.reportInlineEditShown(this._commandService, viewKind, viewData, this.textModel, timeWhenShown);
  }
  /**
   * Transplants an inline completion from another model to this one.
   * Used for cross-file inline edits.
   */
  transplantCompletion(item) {
    transaction((tx) => {
      this._source.seedWithCompletion(item, tx);
      this._isActive.set(true, tx);
      this._inAcceptFlow.set(true, tx);
      this.dontRefetchSignal.trigger(tx);
    });
  }
};

InlineCompletionsModel = __decorateClass([
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ICommandService),
  __decorateParam(10, ILanguageConfigurationService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, ILanguageFeaturesService),
  __decorateParam(13, ICodeEditorService),
  __decorateParam(14, IInlineCompletionsService),
  __decorateParam(15, IDefaultAccountService)
], InlineCompletionsModel);

function getSecondaryEdits(textModel, positions, primaryTextRepl) {
  if (positions.length === 1) {
    return [];
  }
  const text2 = new TextModelText(textModel);
  const textTransformer = text2.getTransformer();
  const primaryOffset = textTransformer.getOffset(positions[0]);
  const secondaryOffsets = positions.slice(1).map((pos) => textTransformer.getOffset(pos));
  primaryTextRepl = primaryTextRepl.removeCommonPrefixAndSuffix(text2);
  const primaryStringRepl = textTransformer.getStringReplacement(primaryTextRepl);
  const deltaFromOffsetToRangeStart = primaryStringRepl.replaceRange.start - primaryOffset;
  const primaryContextRange = primaryStringRepl.replaceRange.join(OffsetRange.emptyAt(primaryOffset));
  const primaryContextValue = text2.getValueOfOffsetRange(primaryContextRange);
  const replacements = secondaryOffsets.map((secondaryOffset) => {
    const newRangeStart = secondaryOffset + deltaFromOffsetToRangeStart;
    const newRangeEnd = newRangeStart + primaryStringRepl.replaceRange.length;
    const range2 = new OffsetRange(newRangeStart, newRangeEnd);
    const contextRange = range2.join(OffsetRange.emptyAt(secondaryOffset));
    const contextValue = text2.getValueOfOffsetRange(contextRange);
    if (contextValue !== primaryContextValue) {
      return void 0;
    }
    const stringRepl = new StringReplacement(range2, primaryStringRepl.newText);
    const repl = textTransformer.getTextReplacement(stringRepl);
    return repl;
  }).filter(isDefined);
  return replacements;
}

var FadeoutDecoration = class extends Disposable {
  constructor(editor, ranges, onDispose) {
    super();
    if (onDispose) {
      this._register({ dispose: () => onDispose() });
    }
    this._register(observableCodeEditor(editor).setDecorations(constObservable(ranges.map((range2) => ({
      range: range2,
      options: {
        description: "animation",
        className: "edits-fadeout-decoration",
        zIndex: 1
      }
    })))));
    const val = new ObservableAnimatedValue(AnimatedValue.startNow(1, 0, 1e3, easeOutCubic2));
    this._register(autorun((reader) => {
      const opacity = val.getValue(reader);
      editor.getContainerDomNode().style.setProperty("--animation-opacity", opacity.toString());
      if (val.isFinished(reader)) {
        this.dispose();
      }
    }));
  }
};

function isSuggestionInViewport(editor, suggestion, reader = void 0) {
  const targetRange = suggestion.targetRange;
  observableCodeEditor(editor).scrollTop.read(reader);
  const visibleRanges = editor.getVisibleRanges();
  if (visibleRanges.length < 1) {
    return false;
  }
  const viewportRange = new Range2(
    visibleRanges[0].startLineNumber,
    visibleRanges[0].startColumn,
    visibleRanges[visibleRanges.length - 1].endLineNumber,
    visibleRanges[visibleRanges.length - 1].endColumn
  );
  return viewportRange.containsRange(targetRange);
}

function skuFromAccount(account) {
  if (account?.entitlementsData?.access_type_sku && account?.entitlementsData?.copilot_plan) {
    return { type: account.entitlementsData.access_type_sku, plan: account.entitlementsData.copilot_plan };
  }
  return void 0;
}

var DisposableCallback = class {
  constructor(cb) {
    this.handler = (val) => {
      return this._cb?.(val);
    };
    this._cb = cb;
  }
  dispose() {
    this._cb = void 0;
  }
};

function createDisposableCb(cb, store) {
  const dcb = new DisposableCallback(cb);
  store.add(dcb);
  return dcb.handler;
}
export { getSecondaryEdits, isSuggestionInViewport, skuFromAccount, createDisposableCb, InlineCompletionsModel, FadeoutDecoration, DisposableCallback };
