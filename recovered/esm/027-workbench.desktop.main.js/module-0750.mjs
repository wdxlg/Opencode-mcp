// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestModel.ts
import { InlineCompletionContextKeys } from "./module-0697.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { TimeoutTimer, disposableTimeout } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { Selection } from "./module-0107.mjs";
import { CompletionOptions, QuickSuggestionsOptions, getSnippetSuggestSupport, provideSuggestionItems } from "./module-0696.mjs";
import { getLeadingWhitespace, isHighSurrogate, isLowSurrogate } from "./module-0030.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { getInlineCompletionsController } from "./module-0742.mjs";
import { autorun } from "./module-0052.mjs";
import { assertType } from "./module-0010.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { WordDistance } from "./module-0749.mjs";
import { FuzzyScoreOptions } from "./module-0453.mjs";
import { CompletionModel } from "./module-0747.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/editor/contrib/suggest/browser/suggestModel.ts
var LineContext2 = class {
  static shouldAutoTrigger(editor) {
    if (!editor.hasModel()) {
      return false;
    }
    const model = editor.getModel();
    const pos = editor.getPosition();
    model.tokenization.tokenizeIfCheap(pos.lineNumber);
    const word = model.getWordAtPosition(pos);
    if (!word) {
      return false;
    }
    if (word.endColumn !== pos.column && word.startColumn + 1 !== pos.column) {
      return false;
    }
    if (!isNaN(Number(word.word))) {
      return false;
    }
    return true;
  }
  constructor(model, position2, triggerOptions) {
    this.leadingLineContent = model.getLineContent(position2.lineNumber).substr(0, position2.column - 1);
    this.leadingWord = model.getWordUntilPosition(position2);
    this.lineNumber = position2.lineNumber;
    this.column = position2.column;
    this.triggerOptions = triggerOptions;
  }
};

function canShowQuickSuggest(editor, contextKeyService, configurationService) {
  if (!Boolean(contextKeyService.getContextKeyValue(InlineCompletionContextKeys.inlineSuggestionVisible.key))) {
    return true;
  }
  const suppressSuggestions = contextKeyService.getContextKeyValue(InlineCompletionContextKeys.suppressSuggestions.key);
  if (suppressSuggestions !== void 0) {
    return !suppressSuggestions;
  }
  return !editor.getOption(71 /* inlineSuggest */).suppressSuggestions;
}

function canShowSuggestOnTriggerCharacters(editor, contextKeyService, configurationService) {
  if (!Boolean(contextKeyService.getContextKeyValue("inlineSuggestionVisible"))) {
    return true;
  }
  const suppressSuggestions = contextKeyService.getContextKeyValue(InlineCompletionContextKeys.suppressSuggestions.key);
  if (suppressSuggestions !== void 0) {
    return !suppressSuggestions;
  }
  return !editor.getOption(71 /* inlineSuggest */).suppressSuggestions;
}

var SuggestModel = class {
  constructor(_editor, _editorWorkerService, _clipboardService, _telemetryService, _logService, _contextKeyService, _configurationService, _languageFeaturesService, _envService) {
    this._editor = _editor;
    this._editorWorkerService = _editorWorkerService;
    this._clipboardService = _clipboardService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._languageFeaturesService = _languageFeaturesService;
    this._envService = _envService;
    this._toDispose = new DisposableStore();
    this._triggerCharacterListener = new DisposableStore();
    this._triggerQuickSuggest = new TimeoutTimer();
    this._triggerState = void 0;
    this._completionDisposables = new DisposableStore();
    this._onDidCancel = new Emitter();
    this._onDidTrigger = new Emitter();
    this._onDidSuggest = new Emitter();
    this.onDidCancel = this._onDidCancel.event;
    this.onDidTrigger = this._onDidTrigger.event;
    this.onDidSuggest = this._onDidSuggest.event;
    this._currentSelection = this._editor.getSelection() || new Selection(1, 1, 1, 1);
    this._toDispose.add(this._editor.onDidChangeModel(() => {
      this._updateTriggerCharacters();
      this.cancel();
    }));
    this._toDispose.add(this._editor.onDidChangeModelLanguage(() => {
      this._updateTriggerCharacters();
      this.cancel();
    }));
    this._toDispose.add(this._editor.onDidChangeConfiguration(() => {
      this._updateTriggerCharacters();
    }));
    this._toDispose.add(this._languageFeaturesService.completionProvider.onDidChange(() => {
      this._updateTriggerCharacters();
      this._updateActiveSuggestSession();
    }));
    let editorIsComposing = false;
    this._toDispose.add(this._editor.onDidCompositionStart(() => {
      editorIsComposing = true;
    }));
    this._toDispose.add(this._editor.onDidCompositionEnd(() => {
      editorIsComposing = false;
      this._onCompositionEnd();
    }));
    this._toDispose.add(this._editor.onDidChangeCursorSelection((e) => {
      if (!editorIsComposing) {
        this._onCursorChange(e);
      }
    }));
    this._toDispose.add(this._editor.onDidChangeModelContent(() => {
      if (!editorIsComposing && this._triggerState !== void 0) {
        this._refilterCompletionItems();
      }
    }));
    this._updateTriggerCharacters();
  }
  dispose() {
    dispose(this._triggerCharacterListener);
    dispose([this._onDidCancel, this._onDidSuggest, this._onDidTrigger, this._triggerQuickSuggest]);
    this._waitForInlineCompletions?.dispose();
    this._toDispose.dispose();
    this._completionDisposables.dispose();
    this.cancel();
  }
  _updateTriggerCharacters() {
    this._triggerCharacterListener.clear();
    if (this._editor.getOption(104 /* readOnly */) || !this._editor.hasModel() || !this._editor.getOption(137 /* suggestOnTriggerCharacters */)) {
      return;
    }
    const supportsByTriggerCharacter = /* @__PURE__ */ new Map();
    for (const support of this._languageFeaturesService.completionProvider.all(this._editor.getModel())) {
      for (const ch of support.triggerCharacters || []) {
        let set = supportsByTriggerCharacter.get(ch);
        if (!set) {
          set = /* @__PURE__ */ new Set();
          const suggestSupport = getSnippetSuggestSupport();
          if (suggestSupport) {
            set.add(suggestSupport);
          }
          supportsByTriggerCharacter.set(ch, set);
        }
        set.add(support);
      }
    }
    const checkTriggerCharacter = (text2) => {
      if (!canShowSuggestOnTriggerCharacters(this._editor, this._contextKeyService, this._configurationService)) {
        return;
      }
      if (LineContext2.shouldAutoTrigger(this._editor)) {
        return;
      }
      if (!text2) {
        const position2 = this._editor.getPosition();
        const model = this._editor.getModel();
        text2 = model.getLineContent(position2.lineNumber).substr(0, position2.column - 1);
      }
      let lastChar = "";
      if (isLowSurrogate(text2.charCodeAt(text2.length - 1))) {
        if (isHighSurrogate(text2.charCodeAt(text2.length - 2))) {
          lastChar = text2.substr(text2.length - 2);
        }
      } else {
        lastChar = text2.charAt(text2.length - 1);
      }
      const supports = supportsByTriggerCharacter.get(lastChar);
      if (supports) {
        const providerItemsToReuse = /* @__PURE__ */ new Map();
        if (this._completionModel) {
          for (const [provider, items] of this._completionModel.getItemsByProvider()) {
            if (!supports.has(provider)) {
              providerItemsToReuse.set(provider, items);
            }
          }
        }
        this.trigger({
          auto: true,
          triggerKind: 1 /* TriggerCharacter */,
          triggerCharacter: lastChar,
          retrigger: Boolean(this._completionModel),
          clipboardText: this._completionModel?.clipboardText,
          completionOptions: { providerFilter: supports, providerItemsToReuse }
        });
      }
    };
    this._triggerCharacterListener.add(this._editor.onDidType(checkTriggerCharacter));
    this._triggerCharacterListener.add(this._editor.onDidCompositionEnd(() => checkTriggerCharacter()));
  }
  // --- trigger/retrigger/cancel suggest
  get state() {
    if (!this._triggerState) {
      return 0 /* Idle */;
    } else if (!this._triggerState.auto) {
      return 1 /* Manual */;
    } else {
      return 2 /* Auto */;
    }
  }
  cancel(retrigger = false) {
    this._triggerQuickSuggest.cancel();
    this._waitForInlineCompletions?.dispose();
    this._waitForInlineCompletions = void 0;
    if (this._triggerState !== void 0) {
      this._requestToken?.cancel();
      this._requestToken = void 0;
      this._triggerState = void 0;
      this._completionModel = void 0;
      this._context = void 0;
      this._onDidCancel.fire({ retrigger });
    }
  }
  clear() {
    this._completionDisposables.clear();
  }
  _updateActiveSuggestSession() {
    if (this._triggerState !== void 0) {
      if (!this._editor.hasModel() || !this._languageFeaturesService.completionProvider.has(this._editor.getModel())) {
        this.cancel();
      } else {
        this.trigger({ auto: this._triggerState.auto, retrigger: true });
      }
    }
  }
  _onCursorChange(e) {
    if (!this._editor.hasModel()) {
      return;
    }
    const prevSelection = this._currentSelection;
    this._currentSelection = this._editor.getSelection();
    if (!e.selection.isEmpty() || e.reason !== 0 /* NotSet */ && e.reason !== 3 /* Explicit */ || e.source !== "keyboard" && e.source !== "deleteLeft") {
      this.cancel();
      return;
    }
    if (this._triggerState === void 0 && e.reason === 0 /* NotSet */) {
      if (prevSelection.containsRange(this._currentSelection) || prevSelection.getEndPosition().isBeforeOrEqual(this._currentSelection.getPosition())) {
        this._doTriggerQuickSuggest();
      }
    } else if (this._triggerState !== void 0 && e.reason === 3 /* Explicit */) {
      this._refilterCompletionItems();
    }
  }
  _onCompositionEnd() {
    if (this._triggerState === void 0) {
      this._doTriggerQuickSuggest();
    } else {
      this._refilterCompletionItems();
    }
  }
  _doTriggerQuickSuggest() {
    if (QuickSuggestionsOptions.isAllOff(this._editor.getOption(102 /* quickSuggestions */))) {
      return;
    }
    if (this._editor.getOption(134 /* suggest */).snippetsPreventQuickSuggestions && SnippetController2.get(this._editor)?.isInSnippet()) {
      return;
    }
    this.cancel();
    this._waitForInlineCompletions?.dispose();
    this._waitForInlineCompletions = void 0;
    this._triggerQuickSuggest.cancelAndSet(() => {
      if (this._triggerState !== void 0) {
        return;
      }
      if (!LineContext2.shouldAutoTrigger(this._editor)) {
        return;
      }
      if (!this._editor.hasModel() || !this._editor.hasWidgetFocus()) {
        return;
      }
      const model = this._editor.getModel();
      const pos = this._editor.getPosition();
      const config = this._editor.getOption(102 /* quickSuggestions */);
      if (QuickSuggestionsOptions.isAllOff(config)) {
        return;
      }
      let waitForInlineCompletions = false;
      if (!QuickSuggestionsOptions.isAllOn(config)) {
        model.tokenization.tokenizeIfCheap(pos.lineNumber);
        const lineTokens = model.tokenization.getLineTokens(pos.lineNumber);
        const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(pos.column - 1 - 1, 0)));
        const value2 = QuickSuggestionsOptions.valueFor(config, tokenType);
        if (value2 === "off" || value2 === "inline") {
          return;
        }
        if (value2 === "offWhenInlineCompletions") {
          waitForInlineCompletions = this._languageFeaturesService.inlineCompletionsProvider.has(model) && this._editor.getOption(71 /* inlineSuggest */).enabled;
        }
      }
      if (!canShowQuickSuggest(this._editor, this._contextKeyService, this._configurationService)) {
        return;
      }
      if (!this._languageFeaturesService.completionProvider.has(model)) {
        return;
      }
      if (waitForInlineCompletions) {
        this._waitForInlineCompletionsAndTrigger(model, pos);
      } else {
        this.trigger({ auto: true });
      }
    }, this._editor.getOption(103 /* quickSuggestionsDelay */));
  }
  _waitForInlineCompletionsAndTrigger(initialModel, initialPosition) {
    const initialModelVersion = initialModel.getVersionId();
    const inlineController = getInlineCompletionsController(this._editor);
    const inlineModel = inlineController?.model.get();
    if (!inlineController || !inlineModel) {
      this.trigger({ auto: true });
      return;
    }
    const state = inlineModel.state.get();
    if (state?.inlineSuggestion) {
      return;
    }
    const store = new DisposableStore();
    this._waitForInlineCompletions = store;
    const triggerAndCleanUp = (doTrigger) => {
      store.dispose();
      if (this._waitForInlineCompletions === store) {
        this._waitForInlineCompletions = void 0;
      }
      if (this._triggerState !== void 0) {
        return;
      }
      if (!doTrigger) {
        return;
      }
      const currentModel = this._editor.getModel();
      const currentPosition = this._editor.getPosition();
      if (currentModel === initialModel && currentModel.getVersionId() === initialModelVersion && currentPosition?.equals(initialPosition) && this._editor.hasWidgetFocus()) {
        this.trigger({ auto: true });
      }
    };
    disposableTimeout(() => {
      triggerAndCleanUp(true);
      inlineModel.stop("automatic");
    }, 750, store);
    store.add(autorun((reader) => {
      const currentInlineModel = inlineController.model.read(reader);
      if (currentInlineModel !== inlineModel) {
        triggerAndCleanUp(false);
        return;
      }
      const status2 = inlineModel.status.read(reader);
      const currentState = inlineModel.state.read(reader);
      if (!currentState && status2 === "loading") {
        return;
      }
      triggerAndCleanUp(!currentState);
    }));
  }
  _refilterCompletionItems() {
    assertType(this._editor.hasModel());
    assertType(this._triggerState !== void 0);
    const model = this._editor.getModel();
    const position2 = this._editor.getPosition();
    const ctx = new LineContext2(model, position2, { ...this._triggerState, refilter: true });
    this._onNewContext(ctx);
  }
  trigger(options3) {
    if (!this._editor.hasModel()) {
      return;
    }
    const model = this._editor.getModel();
    const ctx = new LineContext2(model, this._editor.getPosition(), options3);
    this.cancel(options3.retrigger);
    this._triggerState = options3;
    this._onDidTrigger.fire({ auto: options3.auto, shy: options3.shy ?? false, position: this._editor.getPosition() });
    this._context = ctx;
    let suggestCtx = { triggerKind: options3.triggerKind ?? 0 /* Invoke */ };
    if (options3.triggerCharacter) {
      suggestCtx = {
        triggerKind: 1 /* TriggerCharacter */,
        triggerCharacter: options3.triggerCharacter
      };
    }
    this._requestToken = new CancellationTokenSource();
    const snippetSuggestions = this._editor.getOption(128 /* snippetSuggestions */);
    let snippetSortOrder = 1 /* Inline */;
    switch (snippetSuggestions) {
      case "top":
        snippetSortOrder = 0 /* Top */;
        break;
      // 	↓ that's the default anyways...
      // case 'inline':
      // 	snippetSortOrder = SnippetSortOrder.Inline;
      // 	break;
      case "bottom":
        snippetSortOrder = 2 /* Bottom */;
        break;
    }
    const { itemKind: itemKindFilter, showDeprecated } = SuggestModel.createSuggestFilter(this._editor);
    const completionOptions = new CompletionOptions(snippetSortOrder, options3.completionOptions?.kindFilter ?? itemKindFilter, options3.completionOptions?.providerFilter, options3.completionOptions?.providerItemsToReuse, showDeprecated);
    const wordDistance = WordDistance.create(this._editorWorkerService, this._editor);
    const completions = provideSuggestionItems(
      this._languageFeaturesService.completionProvider,
      model,
      this._editor.getPosition(),
      completionOptions,
      suggestCtx,
      this._requestToken.token
    );
    Promise.all([completions, wordDistance]).then(async ([completions2, wordDistance2]) => {
      this._requestToken?.dispose();
      if (!this._editor.hasModel()) {
        completions2.disposable.dispose();
        return;
      }
      let clipboardText = options3?.clipboardText;
      if (!clipboardText && completions2.needsClipboard) {
        clipboardText = await this._clipboardService.readText();
      }
      if (this._triggerState === void 0) {
        completions2.disposable.dispose();
        return;
      }
      const model2 = this._editor.getModel();
      const ctx2 = new LineContext2(model2, this._editor.getPosition(), options3);
      const fuzzySearchOptions = {
        ...FuzzyScoreOptions.default,
        firstMatchCanBeWeak: !this._editor.getOption(134 /* suggest */).matchOnWordStartOnly
      };
      this._completionModel = new CompletionModel(
        completions2.items,
        this._context.column,
        {
          leadingLineContent: ctx2.leadingLineContent,
          characterCountDelta: ctx2.column - this._context.column
        },
        wordDistance2,
        this._editor.getOption(134 /* suggest */),
        this._editor.getOption(128 /* snippetSuggestions */),
        fuzzySearchOptions,
        clipboardText
      );
      this._completionDisposables.add(completions2.disposable);
      this._onNewContext(ctx2);
      this._reportDurationsTelemetry(completions2.durations);
      if (!this._envService.isBuilt || this._envService.isExtensionDevelopment) {
        for (const item of completions2.items) {
          if (item.isInvalid) {
            this._logService.warn(`[suggest] did IGNORE invalid completion item from ${item.provider._debugDisplayName}`, item.completion);
          }
        }
      }
    }).catch(onUnexpectedError);
  }
  /**
   * Report durations telemetry with a 1% sampling rate.
   * The telemetry is reported only if a random number between 0 and 100 is less than or equal to 1.
   */
  _reportDurationsTelemetry(durations) {
    if (Math.random() > 1e-4) {
      return;
    }
    setTimeout(() => {
      this._telemetryService.publicLog2("suggest.durations.json", { data: JSON.stringify(durations) });
      this._logService.debug("suggest.durations.json", durations);
    });
  }
  static createSuggestFilter(editor) {
    const result = /* @__PURE__ */ new Set();
    const snippetSuggestions = editor.getOption(128 /* snippetSuggestions */);
    if (snippetSuggestions === "none") {
      result.add(28 /* Snippet */);
    }
    const suggestOptions = editor.getOption(134 /* suggest */);
    if (!suggestOptions.showMethods) {
      result.add(0 /* Method */);
    }
    if (!suggestOptions.showFunctions) {
      result.add(1 /* Function */);
    }
    if (!suggestOptions.showConstructors) {
      result.add(2 /* Constructor */);
    }
    if (!suggestOptions.showFields) {
      result.add(3 /* Field */);
    }
    if (!suggestOptions.showVariables) {
      result.add(4 /* Variable */);
    }
    if (!suggestOptions.showClasses) {
      result.add(5 /* Class */);
    }
    if (!suggestOptions.showStructs) {
      result.add(6 /* Struct */);
    }
    if (!suggestOptions.showInterfaces) {
      result.add(7 /* Interface */);
    }
    if (!suggestOptions.showModules) {
      result.add(8 /* Module */);
    }
    if (!suggestOptions.showProperties) {
      result.add(9 /* Property */);
    }
    if (!suggestOptions.showEvents) {
      result.add(10 /* Event */);
    }
    if (!suggestOptions.showOperators) {
      result.add(11 /* Operator */);
    }
    if (!suggestOptions.showUnits) {
      result.add(12 /* Unit */);
    }
    if (!suggestOptions.showValues) {
      result.add(13 /* Value */);
    }
    if (!suggestOptions.showConstants) {
      result.add(14 /* Constant */);
    }
    if (!suggestOptions.showEnums) {
      result.add(15 /* Enum */);
    }
    if (!suggestOptions.showEnumMembers) {
      result.add(16 /* EnumMember */);
    }
    if (!suggestOptions.showKeywords) {
      result.add(17 /* Keyword */);
    }
    if (!suggestOptions.showWords) {
      result.add(18 /* Text */);
    }
    if (!suggestOptions.showColors) {
      result.add(19 /* Color */);
    }
    if (!suggestOptions.showFiles) {
      result.add(20 /* File */);
    }
    if (!suggestOptions.showReferences) {
      result.add(21 /* Reference */);
    }
    if (!suggestOptions.showColors) {
      result.add(22 /* Customcolor */);
    }
    if (!suggestOptions.showFolders) {
      result.add(23 /* Folder */);
    }
    if (!suggestOptions.showTypeParameters) {
      result.add(24 /* TypeParameter */);
    }
    if (!suggestOptions.showSnippets) {
      result.add(28 /* Snippet */);
    }
    if (!suggestOptions.showUsers) {
      result.add(25 /* User */);
    }
    if (!suggestOptions.showIssues) {
      result.add(26 /* Issue */);
    }
    return { itemKind: result, showDeprecated: suggestOptions.showDeprecated };
  }
  _onNewContext(ctx) {
    if (!this._context) {
      return;
    }
    if (ctx.lineNumber !== this._context.lineNumber) {
      this.cancel();
      return;
    }
    if (getLeadingWhitespace(ctx.leadingLineContent) !== getLeadingWhitespace(this._context.leadingLineContent)) {
      this.cancel();
      return;
    }
    if (ctx.column < this._context.column) {
      if (ctx.leadingWord.word) {
        this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
      } else {
        this.cancel();
      }
      return;
    }
    if (!this._completionModel) {
      return;
    }
    if (ctx.leadingWord.word.length !== 0 && ctx.leadingWord.startColumn > this._context.leadingWord.startColumn) {
      const shouldAutoTrigger = LineContext2.shouldAutoTrigger(this._editor);
      if (shouldAutoTrigger && this._context) {
        const map = this._completionModel.getItemsByProvider();
        this.trigger({
          auto: this._context.triggerOptions.auto,
          retrigger: true,
          clipboardText: this._completionModel.clipboardText,
          completionOptions: { providerItemsToReuse: map }
        });
      }
      return;
    }
    if (ctx.column > this._context.column && this._completionModel.getIncompleteProvider().size > 0 && ctx.leadingWord.word.length !== 0) {
      const providerItemsToReuse = /* @__PURE__ */ new Map();
      const providerFilter = /* @__PURE__ */ new Set();
      for (const [provider, items] of this._completionModel.getItemsByProvider()) {
        if (items.length > 0 && items[0].container.incomplete) {
          providerFilter.add(provider);
        } else {
          providerItemsToReuse.set(provider, items);
        }
      }
      this.trigger({
        auto: this._context.triggerOptions.auto,
        triggerKind: 2 /* TriggerForIncompleteCompletions */,
        retrigger: true,
        clipboardText: this._completionModel.clipboardText,
        completionOptions: { providerFilter, providerItemsToReuse }
      });
    } else {
      const oldLineContext = this._completionModel.lineContext;
      let isFrozen2 = false;
      this._completionModel.lineContext = {
        leadingLineContent: ctx.leadingLineContent,
        characterCountDelta: ctx.column - this._context.column
      };
      if (this._completionModel.items.length === 0) {
        const shouldAutoTrigger = LineContext2.shouldAutoTrigger(this._editor);
        if (!this._context) {
          this.cancel();
          return;
        }
        if (shouldAutoTrigger && this._context.leadingWord.endColumn < ctx.leadingWord.startColumn) {
          this.trigger({ auto: this._context.triggerOptions.auto, retrigger: true });
          return;
        }
        if (!this._context.triggerOptions.auto) {
          this._completionModel.lineContext = oldLineContext;
          isFrozen2 = this._completionModel.items.length > 0;
          if (isFrozen2 && ctx.leadingWord.word.length === 0) {
            this.cancel();
            return;
          }
        } else {
          this.cancel();
          return;
        }
      }
      this._onDidSuggest.fire({
        completionModel: this._completionModel,
        triggerOptions: ctx.triggerOptions,
        isFrozen: isFrozen2
      });
    }
  }
};

SuggestModel = __decorateClass([
  __decorateParam(1, IEditorWorkerService),
  __decorateParam(2, IClipboardService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, IEnvironmentService)
], SuggestModel);
export { canShowQuickSuggest, canShowSuggestOnTriggerCharacters, LineContext2, SuggestModel };
