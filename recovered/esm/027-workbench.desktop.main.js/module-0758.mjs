// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestController.ts
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SuggestModel } from "./module-0750.mjs";
import { Context, suggestWidgetStatusbarMenu } from "./module-0696.mjs";
import { WindowIdleValue, getWindow } from "./module-0075.mjs";
import { SuggestWidget } from "./module-0757.mjs";
import { CommitCharacterController } from "./module-0751.mjs";
import { Position } from "./module-0079.mjs";
import { OvertypingCapturer } from "./module-0752.mjs";
import { SuggestAlternatives } from "./module-0746.mjs";
import { WordContextKey } from "./module-0745.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { StableEditorScrollState } from "./module-0447.mjs";
import { EditOperation } from "./module-0162.mjs";
import { StopWatch } from "./module-0016.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { EditSources } from "./module-0377.mjs";
import { ProviderId } from "./module-0164.mjs";
import { onUnexpectedError, onUnexpectedExternalError } from "./module-0004.mjs";
import { hash } from "./module-0039.mjs";
import { basename2, extname2 } from "./module-0034.mjs";
import { assertType, isObject } from "./module-0010.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISuggestMemoryService } from "./module-0744.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { EditorAction, EditorCommand, registerEditorAction, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/suggest/browser/suggestController.ts
var _sticky3 = false;

var LineSuffix = class {
  constructor(_model, _position) {
    this._model = _model;
    this._position = _position;
    this._decorationOptions = ModelDecorationOptions.register({
      description: "suggest-line-suffix",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
    const maxColumn = _model.getLineMaxColumn(_position.lineNumber);
    if (maxColumn !== _position.column) {
      const offset = _model.getOffsetAt(_position);
      const end = _model.getPositionAt(offset + 1);
      _model.changeDecorations((accessor) => {
        if (this._marker) {
          accessor.removeDecoration(this._marker);
        }
        this._marker = accessor.addDecoration(Range2.fromPositions(_position, end), this._decorationOptions);
      });
    }
  }
  dispose() {
    if (this._marker && !this._model.isDisposed()) {
      this._model.changeDecorations((accessor) => {
        accessor.removeDecoration(this._marker);
        this._marker = void 0;
      });
    }
  }
  delta(position2) {
    if (this._model.isDisposed() || this._position.lineNumber !== position2.lineNumber) {
      return 0;
    }
    if (this._marker) {
      const range2 = this._model.getDecorationRange(this._marker);
      const end = this._model.getOffsetAt(range2.getStartPosition());
      return end - this._model.getOffsetAt(position2);
    } else {
      return this._model.getLineMaxColumn(position2.lineNumber) - position2.column;
    }
  }
};

var SuggestController = class {
  constructor(editor, _memoryService, _commandService, _contextKeyService, _instantiationService, _logService, _telemetryService) {
    this._memoryService = _memoryService;
    this._commandService = _commandService;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._telemetryService = _telemetryService;
    this._lineSuffix = new MutableDisposable();
    this._toDispose = new DisposableStore();
    this._selectors = new PriorityRegistry((s) => s.priority);
    this._onWillInsertSuggestItem = new Emitter();
    this._wantsForceRenderingAbove = false;
    this.editor = editor;
    this.model = _instantiationService.createInstance(SuggestModel, this.editor);
    this._selectors.register({
      priority: 0,
      select: (model, pos, items) => this._memoryService.select(model, pos, items)
    });
    const ctxInsertMode = Context.InsertMode.bindTo(_contextKeyService);
    ctxInsertMode.set(editor.getOption(134 /* suggest */).insertMode);
    this._toDispose.add(this.model.onDidTrigger(() => ctxInsertMode.set(editor.getOption(134 /* suggest */).insertMode)));
    this.widget = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
      const widget = this._instantiationService.createInstance(SuggestWidget, this.editor);
      this._toDispose.add(widget);
      this._toDispose.add(widget.onDidSelect((item) => this._insertSuggestion(item, 0 /* None */), this));
      const commitCharacterController = new CommitCharacterController(this.editor, widget, this.model, (item) => this._insertSuggestion(item, 2 /* NoAfterUndoStop */));
      this._toDispose.add(commitCharacterController);
      const ctxMakesTextEdit = Context.MakesTextEdit.bindTo(this._contextKeyService);
      const ctxHasInsertAndReplace = Context.HasInsertAndReplaceRange.bindTo(this._contextKeyService);
      const ctxCanResolve = Context.CanResolve.bindTo(this._contextKeyService);
      this._toDispose.add(toDisposable(() => {
        ctxMakesTextEdit.reset();
        ctxHasInsertAndReplace.reset();
        ctxCanResolve.reset();
      }));
      this._toDispose.add(widget.onDidFocus(({ item }) => {
        const position2 = this.editor.getPosition();
        const startColumn = item.editStart.column;
        const endColumn = position2.column;
        let value2 = true;
        if (this.editor.getOption(1 /* acceptSuggestionOnEnter */) === "smart" && this.model.state === 2 /* Auto */ && !item.completion.additionalTextEdits && !(item.completion.insertTextRules & 4 /* InsertAsSnippet */) && endColumn - startColumn === item.completion.insertText.length) {
          const oldText = this.editor.getModel().getValueInRange({
            startLineNumber: position2.lineNumber,
            startColumn,
            endLineNumber: position2.lineNumber,
            endColumn
          });
          value2 = oldText !== item.completion.insertText;
        }
        ctxMakesTextEdit.set(value2);
        ctxHasInsertAndReplace.set(!Position.equals(item.editInsertEnd, item.editReplaceEnd));
        ctxCanResolve.set(Boolean(item.provider.resolveCompletionItem) || Boolean(item.completion.documentation) || item.completion.detail !== item.completion.label);
      }));
      if (this._wantsForceRenderingAbove) {
        widget.forceRenderingAbove();
      }
      return widget;
    }));
    this._overtypingCapturer = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
      return this._toDispose.add(new OvertypingCapturer(this.editor, this.model));
    }));
    this._alternatives = this._toDispose.add(new WindowIdleValue(getWindow(editor.getDomNode()), () => {
      return this._toDispose.add(new SuggestAlternatives(this.editor, this._contextKeyService));
    }));
    this._toDispose.add(_instantiationService.createInstance(WordContextKey, editor));
    this._toDispose.add(this.model.onDidTrigger((e) => {
      this.widget.value.showTriggered(e.auto, e.shy ? 250 : 50);
      this._lineSuffix.value = new LineSuffix(this.editor.getModel(), e.position);
    }));
    this._toDispose.add(this.model.onDidSuggest((e) => {
      if (e.triggerOptions.shy) {
        return;
      }
      let index2 = -1;
      for (const selector of this._selectors.itemsOrderedByPriorityDesc) {
        index2 = selector.select(this.editor.getModel(), this.editor.getPosition(), e.completionModel.items);
        if (index2 !== -1) {
          break;
        }
      }
      if (index2 === -1) {
        index2 = 0;
      }
      if (this.model.state === 0 /* Idle */) {
        return;
      }
      let noFocus = false;
      if (e.triggerOptions.auto) {
        const options3 = this.editor.getOption(134 /* suggest */);
        if (options3.selectionMode === "never" || options3.selectionMode === "always") {
          noFocus = options3.selectionMode === "never";
        } else if (options3.selectionMode === "whenTriggerCharacter") {
          noFocus = e.triggerOptions.triggerKind !== 1 /* TriggerCharacter */;
        } else if (options3.selectionMode === "whenQuickSuggestion") {
          noFocus = e.triggerOptions.triggerKind === 1 /* TriggerCharacter */ && !e.triggerOptions.refilter;
        }
      }
      this.widget.value.showSuggestions(e.completionModel, index2, e.isFrozen, e.triggerOptions.auto, noFocus);
    }));
    this._toDispose.add(this.model.onDidCancel((e) => {
      if (!e.retrigger) {
        this.widget.value.hideWidget();
      }
    }));
    this._toDispose.add(this.editor.onDidBlurEditorWidget(() => {
      if (!_sticky3) {
        this.model.cancel();
        this.model.clear();
      }
    }));
    const acceptSuggestionsOnEnter = Context.AcceptSuggestionsOnEnter.bindTo(_contextKeyService);
    const updateFromConfig = () => {
      const acceptSuggestionOnEnter = this.editor.getOption(1 /* acceptSuggestionOnEnter */);
      acceptSuggestionsOnEnter.set(acceptSuggestionOnEnter === "on" || acceptSuggestionOnEnter === "smart");
    };
    this._toDispose.add(this.editor.onDidChangeConfiguration(() => updateFromConfig()));
    updateFromConfig();
  }
  static {
    this.ID = "editor.contrib.suggestController";
  }
  static get(editor) {
    return editor.getContribution(SuggestController.ID);
  }
  get onWillInsertSuggestItem() {
    return this._onWillInsertSuggestItem.event;
  }
  dispose() {
    this._alternatives.dispose();
    this._toDispose.dispose();
    this.widget.dispose();
    this.model.dispose();
    this._lineSuffix.dispose();
    this._onWillInsertSuggestItem.dispose();
  }
  _insertSuggestion(event, flags) {
    if (!event || !event.item) {
      this._alternatives.value.reset();
      this.model.cancel();
      this.model.clear();
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    const snippetController = SnippetController2.get(this.editor);
    if (!snippetController) {
      return;
    }
    this._onWillInsertSuggestItem.fire({ item: event.item });
    const model = this.editor.getModel();
    const modelVersionNow = model.getAlternativeVersionId();
    const { item } = event;
    const tasks2 = [];
    const cts = new CancellationTokenSource();
    if (!(flags & 1 /* NoBeforeUndoStop */)) {
      this.editor.pushUndoStop();
    }
    const info = this.getOverwriteInfo(item, Boolean(flags & 8 /* AlternativeOverwriteConfig */));
    this._memoryService.memorize(model, this.editor.getPosition(), item);
    const isResolved = item.isResolved;
    let _commandExectionDuration = -1;
    let _additionalEditsAppliedAsync = -1;
    if (Array.isArray(item.completion.additionalTextEdits)) {
      this.model.cancel();
      const scrollState = StableEditorScrollState.capture(this.editor);
      this.editor.executeEdits(
        "suggestController.additionalTextEdits.sync",
        item.completion.additionalTextEdits.map((edit3) => {
          let range2 = Range2.lift(edit3.range);
          if (range2.startLineNumber === item.position.lineNumber && range2.startColumn > item.position.column) {
            const columnDelta = this.editor.getPosition().column - item.position.column;
            const startColumnDelta = columnDelta;
            const endColumnDelta = Range2.spansMultipleLines(range2) ? 0 : columnDelta;
            range2 = new Range2(range2.startLineNumber, range2.startColumn + startColumnDelta, range2.endLineNumber, range2.endColumn + endColumnDelta);
          }
          return EditOperation.replaceMove(range2, edit3.text);
        })
      );
      scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
    } else if (!isResolved) {
      const sw = new StopWatch();
      let position2;
      const docListener = model.onDidChangeContent((e) => {
        if (e.isFlush) {
          cts.cancel();
          docListener.dispose();
          return;
        }
        for (const change of e.changes) {
          const thisPosition = Range2.getEndPosition(change.range);
          if (!position2 || Position.isBefore(thisPosition, position2)) {
            position2 = thisPosition;
          }
        }
      });
      const oldFlags = flags;
      flags |= 2 /* NoAfterUndoStop */;
      let didType = false;
      const typeListener = this.editor.onWillType(() => {
        typeListener.dispose();
        didType = true;
        if (!(oldFlags & 2 /* NoAfterUndoStop */)) {
          this.editor.pushUndoStop();
        }
      });
      tasks2.push(item.resolve(cts.token).then(() => {
        if (!item.completion.additionalTextEdits || cts.token.isCancellationRequested) {
          return void 0;
        }
        if (position2 && item.completion.additionalTextEdits.some((edit3) => Position.isBefore(position2, Range2.getStartPosition(edit3.range)))) {
          return false;
        }
        if (didType) {
          this.editor.pushUndoStop();
        }
        const scrollState = StableEditorScrollState.capture(this.editor);
        this.editor.executeEdits(
          "suggestController.additionalTextEdits.async",
          item.completion.additionalTextEdits.map((edit3) => EditOperation.replaceMove(Range2.lift(edit3.range), edit3.text))
        );
        scrollState.restoreRelativeVerticalPositionOfCursor(this.editor);
        if (didType || !(oldFlags & 2 /* NoAfterUndoStop */)) {
          this.editor.pushUndoStop();
        }
        return true;
      }).then((applied) => {
        this._logService.trace("[suggest] async resolving of edits DONE (ms, applied?)", sw.elapsed(), applied);
        _additionalEditsAppliedAsync = applied === true ? 1 : applied === false ? 0 : -2;
      }).finally(() => {
        docListener.dispose();
        typeListener.dispose();
      }));
    }
    let { insertText } = item.completion;
    if (!(item.completion.insertTextRules & 4 /* InsertAsSnippet */)) {
      insertText = SnippetParser.escape(insertText);
    }
    this.model.cancel();
    snippetController.insert(insertText, {
      overwriteBefore: info.overwriteBefore,
      overwriteAfter: info.overwriteAfter,
      undoStopBefore: false,
      undoStopAfter: false,
      adjustWhitespace: !(item.completion.insertTextRules & 1 /* KeepWhitespace */),
      clipboardText: event.model.clipboardText,
      overtypingCapturer: this._overtypingCapturer.value,
      reason: EditSources.suggest({ providerId: ProviderId.fromExtensionId(item.extensionId?.value) })
    });
    if (!(flags & 2 /* NoAfterUndoStop */)) {
      this.editor.pushUndoStop();
    }
    if (item.completion.command) {
      if (item.completion.command.id === TriggerSuggestAction.id) {
        this.model.trigger({ auto: true, retrigger: true });
      } else {
        const sw = new StopWatch();
        tasks2.push(this._commandService.executeCommand(item.completion.command.id, ...item.completion.command.arguments ? [...item.completion.command.arguments] : []).catch((e) => {
          if (item.completion.extensionId) {
            onUnexpectedExternalError(e);
          } else {
            onUnexpectedError(e);
          }
        }).finally(() => {
          _commandExectionDuration = sw.elapsed();
        }));
      }
    }
    if (flags & 4 /* KeepAlternativeSuggestions */) {
      this._alternatives.value.set(event, (next) => {
        cts.cancel();
        while (model.canUndo()) {
          if (modelVersionNow !== model.getAlternativeVersionId()) {
            model.undo();
          }
          this._insertSuggestion(
            next,
            1 /* NoBeforeUndoStop */ | 2 /* NoAfterUndoStop */ | (flags & 8 /* AlternativeOverwriteConfig */ ? 8 /* AlternativeOverwriteConfig */ : 0)
          );
          break;
        }
      });
    }
    this._alertCompletionItem(item);
    Promise.all(tasks2).finally(() => {
      this._reportSuggestionAcceptedTelemetry(item, model, isResolved, _commandExectionDuration, _additionalEditsAppliedAsync, event.index, event.model.items);
      this.model.clear();
      cts.dispose();
    });
  }
  _reportSuggestionAcceptedTelemetry(item, model, itemResolved, commandExectionDuration, additionalEditsAppliedAsync, index2, completionItems) {
    if (Math.random() > 1e-4) {
      return;
    }
    const labelMap = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < Math.min(30, completionItems.length); i2++) {
      const label3 = completionItems[i2].textLabel;
      if (labelMap.has(label3)) {
        labelMap.get(label3).push(i2);
      } else {
        labelMap.set(label3, [i2]);
      }
    }
    const firstIndexArray = labelMap.get(item.textLabel);
    const hasDuplicates = firstIndexArray && firstIndexArray.length > 1;
    const firstIndex = hasDuplicates ? firstIndexArray[0] : -1;
    this._telemetryService.publicLog2("suggest.acceptedSuggestion", {
      extensionId: item.extensionId?.value ?? "unknown",
      providerId: item.provider._debugDisplayName ?? "unknown",
      kind: item.completion.kind,
      basenameHash: hash(basename2(model.uri)).toString(16),
      languageId: model.getLanguageId(),
      fileExtension: extname2(model.uri),
      resolveInfo: !item.provider.resolveCompletionItem ? -1 : itemResolved ? 1 : 0,
      resolveDuration: item.resolveDuration,
      commandDuration: commandExectionDuration,
      additionalEditsAsync: additionalEditsAppliedAsync,
      index: index2,
      firstIndex
    });
  }
  getOverwriteInfo(item, toggleMode) {
    assertType(this.editor.hasModel());
    let replace = this.editor.getOption(134 /* suggest */).insertMode === "replace";
    if (toggleMode) {
      replace = !replace;
    }
    const overwriteBefore = item.position.column - item.editStart.column;
    const overwriteAfter = (replace ? item.editReplaceEnd.column : item.editInsertEnd.column) - item.position.column;
    const columnDelta = this.editor.getPosition().column - item.position.column;
    const suffixDelta = this._lineSuffix.value ? this._lineSuffix.value.delta(this.editor.getPosition()) : 0;
    return {
      overwriteBefore: overwriteBefore + columnDelta,
      overwriteAfter: overwriteAfter + suffixDelta
    };
  }
  _alertCompletionItem(item) {
    if (isNonEmptyArray(item.completion.additionalTextEdits)) {
      const msg = localize(1652, null, item.textLabel, item.completion.additionalTextEdits.length);
      alert(msg);
    }
  }
  triggerSuggest(onlyFrom, auto, noFilter) {
    if (this.editor.hasModel()) {
      this.model.trigger({
        auto: auto ?? false,
        completionOptions: { providerFilter: onlyFrom, kindFilter: noFilter ? /* @__PURE__ */ new Set() : void 0 }
      });
      this.editor.revealPosition(this.editor.getPosition(), 0 /* Smooth */);
      this.editor.focus();
    }
  }
  triggerSuggestAndAcceptBest(arg) {
    if (!this.editor.hasModel()) {
      return;
    }
    const positionNow = this.editor.getPosition();
    const fallback2 = () => {
      if (positionNow.equals(this.editor.getPosition())) {
        this._commandService.executeCommand(arg.fallback);
      }
    };
    const makesTextEdit = (item) => {
      if (item.completion.insertTextRules & 4 /* InsertAsSnippet */ || item.completion.additionalTextEdits) {
        return true;
      }
      const position2 = this.editor.getPosition();
      const startColumn = item.editStart.column;
      const endColumn = position2.column;
      if (endColumn - startColumn !== item.completion.insertText.length) {
        return true;
      }
      const textNow = this.editor.getModel().getValueInRange({
        startLineNumber: position2.lineNumber,
        startColumn,
        endLineNumber: position2.lineNumber,
        endColumn
      });
      return textNow !== item.completion.insertText;
    };
    Event2.once(this.model.onDidTrigger)((_) => {
      const listener = [];
      Event2.any(this.model.onDidTrigger, this.model.onDidCancel)(() => {
        dispose(listener);
        fallback2();
      }, void 0, listener);
      this.model.onDidSuggest(({ completionModel }) => {
        dispose(listener);
        if (completionModel.items.length === 0) {
          fallback2();
          return;
        }
        const index2 = this._memoryService.select(this.editor.getModel(), this.editor.getPosition(), completionModel.items);
        const item = completionModel.items[index2];
        if (!makesTextEdit(item)) {
          fallback2();
          return;
        }
        this.editor.pushUndoStop();
        this._insertSuggestion({ index: index2, item, model: completionModel }, 4 /* KeepAlternativeSuggestions */ | 1 /* NoBeforeUndoStop */ | 2 /* NoAfterUndoStop */);
      }, void 0, listener);
    });
    this.model.trigger({ auto: false, shy: true });
    this.editor.revealPosition(positionNow, 0 /* Smooth */);
    this.editor.focus();
  }
  acceptSelectedSuggestion(keepAlternativeSuggestions, alternativeOverwriteConfig) {
    const item = this.widget.value.getFocusedItem();
    let flags = 0;
    if (keepAlternativeSuggestions) {
      flags |= 4 /* KeepAlternativeSuggestions */;
    }
    if (alternativeOverwriteConfig) {
      flags |= 8 /* AlternativeOverwriteConfig */;
    }
    this._insertSuggestion(item, flags);
  }
  acceptNextSuggestion() {
    this._alternatives.value.next();
  }
  acceptPrevSuggestion() {
    this._alternatives.value.prev();
  }
  cancelSuggestWidget() {
    this.model.cancel();
    this.model.clear();
    this.widget.value.hideWidget();
  }
  focusSuggestion() {
    this.widget.value.focusSelected();
  }
  selectNextSuggestion() {
    this.widget.value.selectNext();
  }
  selectNextPageSuggestion() {
    this.widget.value.selectNextPage();
  }
  selectLastSuggestion() {
    this.widget.value.selectLast();
  }
  selectPrevSuggestion() {
    this.widget.value.selectPrevious();
  }
  selectPrevPageSuggestion() {
    this.widget.value.selectPreviousPage();
  }
  selectFirstSuggestion() {
    this.widget.value.selectFirst();
  }
  toggleSuggestionDetails() {
    this.widget.value.toggleDetails();
  }
  toggleExplainMode() {
    this.widget.value.toggleExplainMode();
  }
  toggleSuggestionFocus() {
    this.widget.value.toggleDetailsFocus();
  }
  resetWidgetSize() {
    this.widget.value.resetPersistedSize();
  }
  forceRenderingAbove() {
    if (this.widget.isInitialized) {
      this.widget.value.forceRenderingAbove();
    } else {
      this._wantsForceRenderingAbove = true;
    }
  }
  stopForceRenderingAbove() {
    if (this.widget.isInitialized) {
      this.widget.value.stopForceRenderingAbove();
    } else {
      this._wantsForceRenderingAbove = false;
    }
  }
  registerSelector(selector) {
    return this._selectors.register(selector);
  }
};

SuggestController = __decorateClass([
  __decorateParam(1, ISuggestMemoryService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ITelemetryService)
], SuggestController);

var PriorityRegistry = class {
  constructor(prioritySelector) {
    this.prioritySelector = prioritySelector;
    this._items = new Array();
  }
  register(value2) {
    if (this._items.indexOf(value2) !== -1) {
      throw new Error("Value is already registered");
    }
    this._items.push(value2);
    this._items.sort((s1, s2) => this.prioritySelector(s2) - this.prioritySelector(s1));
    return {
      dispose: () => {
        const idx = this._items.indexOf(value2);
        if (idx >= 0) {
          this._items.splice(idx, 1);
        }
      }
    };
  }
  get itemsOrderedByPriorityDesc() {
    return this._items;
  }
};

var TriggerSuggestAction = class _TriggerSuggestAction extends EditorAction {
  static {
    this.id = "editor.action.triggerSuggest";
  }
  constructor() {
    super({
      id: _TriggerSuggestAction.id,
      label: localize2(1657, "Trigger Suggest"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasCompletionItemProvider, Context.Visible.toNegated()),
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 10 /* Space */,
        secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */],
        mac: { primary: 256 /* WinCtrl */ | 10 /* Space */, secondary: [512 /* Alt */ | 9 /* Escape */, 2048 /* CtrlCmd */ | 39 /* KeyI */] },
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(_accessor, editor, args2) {
    const controller = SuggestController.get(editor);
    if (!controller) {
      return;
    }
    let auto;
    if (args2 && typeof args2 === "object") {
      if (args2.auto === true) {
        auto = true;
      }
    }
    controller.triggerSuggest(void 0, auto, void 0);
  }
};

registerEditorContribution(SuggestController.ID, SuggestController, 2 /* BeforeFirstInteraction */);

registerEditorAction(TriggerSuggestAction);

var weight2 = 100 /* EditorContrib */ + 90;

var SuggestCommand = EditorCommand.bindToContribution(SuggestController.get);

registerEditorCommand(new SuggestCommand({
  id: "acceptSelectedSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, Context.HasFocusedSuggestion),
  handler(x) {
    x.acceptSelectedSuggestion(true, false);
  },
  kbOpts: [{
    // normal tab
    primary: 2 /* Tab */,
    kbExpr: ContextKeyExpr.and(Context.Visible, EditorContextKeys.textInputFocus),
    weight: weight2
  }, {
    // accept on enter has special rules
    primary: 3 /* Enter */,
    kbExpr: ContextKeyExpr.and(Context.Visible, EditorContextKeys.textInputFocus, Context.AcceptSuggestionsOnEnter, Context.MakesTextEdit),
    weight: weight2
  }],
  menuOpts: [{
    menuId: suggestWidgetStatusbarMenu,
    title: localize(1650, null),
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(Context.HasFocusedSuggestion, Context.HasInsertAndReplaceRange.toNegated())
  }, {
    menuId: suggestWidgetStatusbarMenu,
    title: localize(1650, null),
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(Context.HasFocusedSuggestion, Context.HasInsertAndReplaceRange, Context.InsertMode.isEqualTo("insert"))
  }, {
    menuId: suggestWidgetStatusbarMenu,
    title: localize(1651, null),
    group: "left",
    order: 1,
    when: ContextKeyExpr.and(Context.HasFocusedSuggestion, Context.HasInsertAndReplaceRange, Context.InsertMode.isEqualTo("replace"))
  }]
}));

registerEditorCommand(new SuggestCommand({
  id: "acceptAlternativeSelectedSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, EditorContextKeys.textInputFocus, Context.HasFocusedSuggestion),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 1024 /* Shift */ | 3 /* Enter */,
    secondary: [1024 /* Shift */ | 2 /* Tab */]
  },
  handler(x) {
    x.acceptSelectedSuggestion(false, true);
  },
  menuOpts: [{
    menuId: suggestWidgetStatusbarMenu,
    group: "left",
    order: 2,
    when: ContextKeyExpr.and(Context.HasFocusedSuggestion, Context.HasInsertAndReplaceRange, Context.InsertMode.isEqualTo("insert")),
    title: localize(1651, null)
  }, {
    menuId: suggestWidgetStatusbarMenu,
    group: "left",
    order: 2,
    when: ContextKeyExpr.and(Context.HasFocusedSuggestion, Context.HasInsertAndReplaceRange, Context.InsertMode.isEqualTo("replace")),
    title: localize(1650, null)
  }]
}));

CommandsRegistry.registerCommandAlias("acceptSelectedSuggestionOnEnter", "acceptSelectedSuggestion");

registerEditorCommand(new SuggestCommand({
  id: "hideSuggestWidget",
  precondition: Context.Visible,
  handler: (x) => x.cancelSuggestWidget(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "selectNextSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectNextSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 18 /* DownArrow */,
    secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */],
    mac: { primary: 18 /* DownArrow */, secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */, 256 /* WinCtrl */ | 44 /* KeyN */] }
  },
  menuOpts: {
    menuId: suggestWidgetStatusbarMenu,
    group: "left",
    order: 0,
    when: Context.HasFocusedSuggestion.toNegated(),
    title: localize(1655, null)
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "selectNextPageSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectNextPageSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 12 /* PageDown */,
    secondary: [2048 /* CtrlCmd */ | 12 /* PageDown */]
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "selectLastSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectLastSuggestion()
}));

registerEditorCommand(new SuggestCommand({
  id: "selectPrevSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectPrevSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 16 /* UpArrow */,
    secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */],
    mac: { primary: 16 /* UpArrow */, secondary: [2048 /* CtrlCmd */ | 16 /* UpArrow */, 256 /* WinCtrl */ | 46 /* KeyP */] }
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "selectPrevPageSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectPrevPageSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 11 /* PageUp */,
    secondary: [2048 /* CtrlCmd */ | 11 /* PageUp */]
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "selectFirstSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, ContextKeyExpr.or(Context.MultipleSuggestions, Context.HasFocusedSuggestion.negate())),
  handler: (c) => c.selectFirstSuggestion()
}));

registerEditorCommand(new SuggestCommand({
  id: "focusSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, Context.HasFocusedSuggestion.negate()),
  handler: (x) => x.focusSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 2048 /* CtrlCmd */ | 10 /* Space */,
    secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */],
    mac: { primary: 256 /* WinCtrl */ | 10 /* Space */, secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */] }
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "focusAndAcceptSuggestion",
  precondition: ContextKeyExpr.and(Context.Visible, Context.HasFocusedSuggestion.negate()),
  handler: (c) => {
    c.focusSuggestion();
    c.acceptSelectedSuggestion(true, false);
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "toggleSuggestionDetails",
  precondition: ContextKeyExpr.and(Context.Visible, Context.HasFocusedSuggestion),
  handler: (x) => x.toggleSuggestionDetails(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 2048 /* CtrlCmd */ | 10 /* Space */,
    secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */],
    mac: { primary: 256 /* WinCtrl */ | 10 /* Space */, secondary: [2048 /* CtrlCmd */ | 39 /* KeyI */] }
  },
  menuOpts: [{
    menuId: suggestWidgetStatusbarMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.and(Context.DetailsVisible, Context.CanResolve),
    title: localize(1654, null)
  }, {
    menuId: suggestWidgetStatusbarMenu,
    group: "right",
    order: 1,
    when: ContextKeyExpr.and(Context.DetailsVisible.toNegated(), Context.CanResolve),
    title: localize(1653, null)
  }]
}));

registerEditorCommand(new SuggestCommand({
  id: "toggleExplainMode",
  precondition: Context.Visible,
  handler: (x) => x.toggleExplainMode(),
  kbOpts: {
    weight: 100 /* EditorContrib */,
    primary: 2048 /* CtrlCmd */ | 90 /* Slash */
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "toggleSuggestionFocus",
  precondition: Context.Visible,
  handler: (x) => x.toggleSuggestionFocus(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 10 /* Space */,
    mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 10 /* Space */ }
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "insertBestCompletion",
  precondition: ContextKeyExpr.and(
    EditorContextKeys.textInputFocus,
    ContextKeyExpr.equals("config.editor.tabCompletion", "on"),
    WordContextKey.AtEnd,
    Context.Visible.toNegated(),
    SuggestAlternatives.OtherSuggestions.toNegated(),
    SnippetController2.InSnippetMode.toNegated()
  ),
  handler: (x, arg) => {
    x.triggerSuggestAndAcceptBest(isObject(arg) ? { fallback: "tab", ...arg } : { fallback: "tab" });
  },
  kbOpts: {
    weight: weight2,
    primary: 2 /* Tab */
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "insertNextSuggestion",
  precondition: ContextKeyExpr.and(
    EditorContextKeys.textInputFocus,
    ContextKeyExpr.equals("config.editor.tabCompletion", "on"),
    SuggestAlternatives.OtherSuggestions,
    Context.Visible.toNegated(),
    SnippetController2.InSnippetMode.toNegated()
  ),
  handler: (x) => x.acceptNextSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 2 /* Tab */
  }
}));

registerEditorCommand(new SuggestCommand({
  id: "insertPrevSuggestion",
  precondition: ContextKeyExpr.and(
    EditorContextKeys.textInputFocus,
    ContextKeyExpr.equals("config.editor.tabCompletion", "on"),
    SuggestAlternatives.OtherSuggestions,
    Context.Visible.toNegated(),
    SnippetController2.InSnippetMode.toNegated()
  ),
  handler: (x) => x.acceptPrevSuggestion(),
  kbOpts: {
    weight: weight2,
    kbExpr: EditorContextKeys.textInputFocus,
    primary: 1024 /* Shift */ | 2 /* Tab */
  }
}));

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "suggestWidgetCopy",
      precondition: Context.DetailsFocused,
      kbOpts: {
        weight: weight2 + 10,
        kbExpr: Context.DetailsFocused,
        primary: 2048 /* CtrlCmd */ | 33 /* KeyC */,
        win: { primary: 2048 /* CtrlCmd */ | 33 /* KeyC */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] }
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    getWindow(editor.getDomNode()).document.execCommand("copy");
  }
}());

registerEditorAction(class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.resetSuggestSize",
      label: localize2(1656, "Reset Suggest Widget Size"),
      precondition: void 0
    });
  }
  run(_accessor, editor) {
    SuggestController.get(editor)?.resetWidgetSize();
  }
});
export { _sticky3, LineSuffix, SuggestController, PriorityRegistry, TriggerSuggestAction, weight2, SuggestCommand };
