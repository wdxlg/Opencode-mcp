// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestInlineCompletions.ts
import { Disposable, RefCountedDisposable } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";
import { FuzzyScore } from "./module-0453.mjs";
import { Range2 } from "./module-0106.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISuggestMemoryService } from "./module-0744.mjs";
import { CompletionOptions, QuickSuggestionsOptions, provideSuggestionItems } from "./module-0696.mjs";
import { CompletionModel, LineContext } from "./module-0747.mjs";
import { SuggestModel } from "./module-0750.mjs";
import { WordDistance } from "./module-0749.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { registerEditorFeature } from "./module-0574.mjs";


// src/vs/editor/contrib/suggest/browser/suggestInlineCompletions.ts
var SuggestInlineCompletion = class {
  constructor(range2, insertText, filterText, additionalTextEdits, command4, gutterMenuLinkAction, completion) {
    this.range = range2;
    this.insertText = insertText;
    this.filterText = filterText;
    this.additionalTextEdits = additionalTextEdits;
    this.command = command4;
    this.gutterMenuLinkAction = gutterMenuLinkAction;
    this.completion = completion;
    this.doNotLog = true;
  }
};

var InlineCompletionResults = class extends RefCountedDisposable {
  constructor(model, line, word, completionModel, completions, _suggestMemoryService) {
    super(completions.disposable);
    this.model = model;
    this.line = line;
    this.word = word;
    this.completionModel = completionModel;
    this._suggestMemoryService = _suggestMemoryService;
  }
  canBeReused(model, line, word) {
    return this.model === model && this.line === line && this.word.word.length > 0 && this.word.startColumn === word.startColumn && this.word.endColumn < word.endColumn && this.completionModel.getIncompleteProvider().size === 0;
  }
  get items() {
    const result = [];
    const { items } = this.completionModel;
    const selectedIndex = this._suggestMemoryService.select(this.model, { lineNumber: this.line, column: this.word.endColumn + this.completionModel.lineContext.characterCountDelta }, items);
    const first2 = Iterable.slice(items, selectedIndex);
    const second = Iterable.slice(items, 0, selectedIndex);
    let resolveCount = 5;
    for (const item of Iterable.concat(first2, second)) {
      if (item.score === FuzzyScore.Default) {
        continue;
      }
      const range2 = new Range2(
        item.editStart.lineNumber,
        item.editStart.column,
        item.editInsertEnd.lineNumber,
        item.editInsertEnd.column + this.completionModel.lineContext.characterCountDelta
        // end PLUS character delta
      );
      const insertText = item.completion.insertTextRules && item.completion.insertTextRules & 4 /* InsertAsSnippet */ ? { snippet: item.completion.insertText } : item.completion.insertText;
      result.push(new SuggestInlineCompletion(
        range2,
        insertText,
        item.filterTextLow ?? item.labelLow,
        item.completion.additionalTextEdits,
        item.completion.command,
        item.completion.action,
        item
      ));
      if (resolveCount-- >= 0) {
        item.resolve(CancellationToken.None);
      }
    }
    return result;
  }
};

InlineCompletionResults = __decorateClass([
  __decorateParam(5, ISuggestMemoryService)
], InlineCompletionResults);

var SuggestInlineCompletions = class extends Disposable {
  constructor(_languageFeatureService, _clipboardService, _suggestMemoryService, _editorService) {
    super();
    this._languageFeatureService = _languageFeatureService;
    this._clipboardService = _clipboardService;
    this._suggestMemoryService = _suggestMemoryService;
    this._editorService = _editorService;
    this._store.add(_languageFeatureService.inlineCompletionsProvider.register("*", this));
  }
  async provideInlineCompletions(model, position2, context2, token) {
    if (context2.selectedSuggestionInfo) {
      return;
    }
    let editor;
    for (const candidate of this._editorService.listCodeEditors()) {
      if (candidate.getModel() === model) {
        editor = candidate;
        break;
      }
    }
    if (!editor) {
      return;
    }
    const config = editor.getOption(102 /* quickSuggestions */);
    if (QuickSuggestionsOptions.isAllOff(config)) {
      return;
    }
    model.tokenization.tokenizeIfCheap(position2.lineNumber);
    const lineTokens = model.tokenization.getLineTokens(position2.lineNumber);
    const tokenType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(Math.max(position2.column - 1 - 1, 0)));
    if (QuickSuggestionsOptions.valueFor(config, tokenType) !== "inline") {
      return void 0;
    }
    let wordInfo = model.getWordAtPosition(position2);
    let triggerCharacterInfo;
    if (!wordInfo?.word) {
      triggerCharacterInfo = this._getTriggerCharacterInfo(model, position2);
    }
    if (!wordInfo?.word && !triggerCharacterInfo) {
      return;
    }
    if (!wordInfo) {
      wordInfo = model.getWordUntilPosition(position2);
    }
    if (wordInfo.endColumn !== position2.column) {
      return;
    }
    let result;
    const leadingLineContents = model.getValueInRange(new Range2(position2.lineNumber, 1, position2.lineNumber, position2.column));
    if (!triggerCharacterInfo && this._lastResult?.canBeReused(model, position2.lineNumber, wordInfo)) {
      const newLineContext = new LineContext(leadingLineContents, position2.column - this._lastResult.word.endColumn);
      this._lastResult.completionModel.lineContext = newLineContext;
      this._lastResult.acquire();
      result = this._lastResult;
    } else {
      const completions = await provideSuggestionItems(
        this._languageFeatureService.completionProvider,
        model,
        position2,
        new CompletionOptions(void 0, SuggestModel.createSuggestFilter(editor).itemKind, triggerCharacterInfo?.providers),
        triggerCharacterInfo && { triggerKind: 1 /* TriggerCharacter */, triggerCharacter: triggerCharacterInfo.ch },
        token
      );
      let clipboardText;
      if (completions.needsClipboard) {
        clipboardText = await this._clipboardService.readText();
      }
      const completionModel = new CompletionModel(
        completions.items,
        position2.column,
        new LineContext(leadingLineContents, 0),
        WordDistance.None,
        editor.getOption(134 /* suggest */),
        editor.getOption(128 /* snippetSuggestions */),
        { boostFullMatch: false, firstMatchCanBeWeak: false },
        clipboardText
      );
      result = new InlineCompletionResults(model, position2.lineNumber, wordInfo, completionModel, completions, this._suggestMemoryService);
    }
    this._lastResult = result;
    return result;
  }
  handleItemDidShow(_completions, item) {
    item.completion.resolve(CancellationToken.None);
  }
  disposeInlineCompletions(result) {
    result.release();
  }
  _getTriggerCharacterInfo(model, position2) {
    const ch = model.getValueInRange(Range2.fromPositions({ lineNumber: position2.lineNumber, column: position2.column - 1 }, position2));
    const providers2 = /* @__PURE__ */ new Set();
    for (const provider of this._languageFeatureService.completionProvider.all(model)) {
      if (provider.triggerCharacters?.includes(ch)) {
        providers2.add(provider);
      }
    }
    if (providers2.size === 0) {
      return void 0;
    }
    return { providers: providers2, ch };
  }
};

SuggestInlineCompletions = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IClipboardService),
  __decorateParam(2, ISuggestMemoryService),
  __decorateParam(3, ICodeEditorService)
], SuggestInlineCompletions);

registerEditorFeature(SuggestInlineCompletions);
export { SuggestInlineCompletion, InlineCompletionResults, SuggestInlineCompletions };
