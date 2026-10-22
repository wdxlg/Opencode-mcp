// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggest.ts
import { historyNavigationVisible } from "./module-0603.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";
import { FuzzyScore } from "./module-0453.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { StopWatch } from "./module-0016.mjs";
import { CancellationError, isCancellationError, onUnexpectedExternalError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { DisposableStore, isDisposable } from "./module-0012.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/editor/contrib/suggest/browser/suggest.ts
var Context = {
  Visible: historyNavigationVisible,
  HasFocusedSuggestion: new RawContextKey("suggestWidgetHasFocusedSuggestion", false, localize(1648, null)),
  DetailsVisible: new RawContextKey("suggestWidgetDetailsVisible", false, localize(1647, null)),
  DetailsFocused: new RawContextKey("suggestWidgetDetailsFocused", false, localize(1646, null)),
  MultipleSuggestions: new RawContextKey("suggestWidgetMultipleSuggestions", false, localize(1649, null)),
  MakesTextEdit: new RawContextKey("suggestionMakesTextEdit", true, localize(1645, null)),
  AcceptSuggestionsOnEnter: new RawContextKey("acceptSuggestionOnEnter", true, localize(1641, null)),
  HasInsertAndReplaceRange: new RawContextKey("suggestionHasInsertAndReplaceRange", false, localize(1643, null)),
  InsertMode: new RawContextKey("suggestionInsertMode", void 0, { type: "string", description: localize(1644, null) }),
  CanResolve: new RawContextKey("suggestionCanResolve", false, localize(1642, null))
};

var suggestWidgetStatusbarMenu = new MenuId("suggestWidgetStatusBar");

var CompletionItem = class {
  constructor(position2, completion, container2, provider) {
    this.position = position2;
    this.completion = completion;
    this.container = container2;
    this.provider = provider;
    // validation
    this.isInvalid = false;
    // sorting, filtering
    this.score = FuzzyScore.Default;
    this.distance = 0;
    this.textLabel = typeof completion.label === "string" ? completion.label : completion.label?.label;
    this.labelLow = this.textLabel.toLowerCase();
    this.isInvalid = !this.textLabel;
    this.sortTextLow = completion.sortText && completion.sortText.toLowerCase();
    this.filterTextLow = completion.filterText && completion.filterText.toLowerCase();
    this.extensionId = completion.extensionId;
    if (Range2.isIRange(completion.range)) {
      this.editStart = new Position(completion.range.startLineNumber, completion.range.startColumn);
      this.editInsertEnd = new Position(completion.range.endLineNumber, completion.range.endColumn);
      this.editReplaceEnd = new Position(completion.range.endLineNumber, completion.range.endColumn);
      this.isInvalid = this.isInvalid || Range2.spansMultipleLines(completion.range) || completion.range.startLineNumber !== position2.lineNumber;
    } else {
      this.editStart = new Position(completion.range.insert.startLineNumber, completion.range.insert.startColumn);
      this.editInsertEnd = new Position(completion.range.insert.endLineNumber, completion.range.insert.endColumn);
      this.editReplaceEnd = new Position(completion.range.replace.endLineNumber, completion.range.replace.endColumn);
      this.isInvalid = this.isInvalid || Range2.spansMultipleLines(completion.range.insert) || Range2.spansMultipleLines(completion.range.replace) || completion.range.insert.startLineNumber !== position2.lineNumber || completion.range.replace.startLineNumber !== position2.lineNumber || completion.range.insert.startColumn !== completion.range.replace.startColumn;
    }
    if (typeof provider.resolveCompletionItem !== "function") {
      this._resolveCache = Promise.resolve();
      this._resolveDuration = 0;
    }
  }
  // ---- resolving
  get isResolved() {
    return this._resolveDuration !== void 0;
  }
  get resolveDuration() {
    return this._resolveDuration !== void 0 ? this._resolveDuration : -1;
  }
  async resolve(token) {
    if (!this._resolveCache) {
      const sub = token.onCancellationRequested(() => {
        this._resolveCache = void 0;
        this._resolveDuration = void 0;
      });
      const sw = new StopWatch(true);
      this._resolveCache = Promise.resolve(this.provider.resolveCompletionItem(this.completion, token)).then((value2) => {
        Object.assign(this.completion, value2);
        this._resolveDuration = sw.elapsed();
      }, (err) => {
        if (isCancellationError(err)) {
          this._resolveCache = void 0;
          this._resolveDuration = void 0;
        }
      }).finally(() => {
        sub.dispose();
      });
    }
    return this._resolveCache;
  }
};

var CompletionOptions = class _CompletionOptions {
  constructor(snippetSortOrder = 2 /* Bottom */, kindFilter = /* @__PURE__ */ new Set(), providerFilter = /* @__PURE__ */ new Set(), providerItemsToReuse = /* @__PURE__ */ new Map(), showDeprecated = true) {
    this.snippetSortOrder = snippetSortOrder;
    this.kindFilter = kindFilter;
    this.providerFilter = providerFilter;
    this.providerItemsToReuse = providerItemsToReuse;
    this.showDeprecated = showDeprecated;
  }
  static {
    this.default = new _CompletionOptions();
  }
};

var _snippetSuggestSupport;

function getSnippetSuggestSupport() {
  return _snippetSuggestSupport;
}

function setSnippetSuggestSupport(support) {
  const old = _snippetSuggestSupport;
  _snippetSuggestSupport = support;
  return old;
}

var CompletionItemModel = class {
  constructor(items, needsClipboard, durations, disposable) {
    this.items = items;
    this.needsClipboard = needsClipboard;
    this.durations = durations;
    this.disposable = disposable;
  }
};

async function provideSuggestionItems(registry4, model, position2, options3 = CompletionOptions.default, context2 = { triggerKind: 0 /* Invoke */ }, token = CancellationToken.None) {
  const sw = new StopWatch();
  position2 = position2.clone();
  const word = model.getWordAtPosition(position2);
  const defaultReplaceRange = word ? new Range2(position2.lineNumber, word.startColumn, position2.lineNumber, word.endColumn) : Range2.fromPositions(position2);
  const defaultRange = { replace: defaultReplaceRange, insert: defaultReplaceRange.setEndPosition(position2.lineNumber, position2.column) };
  const result = [];
  const disposables = new DisposableStore();
  const durations = [];
  let needsClipboard = false;
  const onCompletionList = (provider, container2, sw2) => {
    let didAddResult = false;
    if (!container2) {
      return didAddResult;
    }
    for (const suggestion of container2.suggestions) {
      if (!options3.kindFilter.has(suggestion.kind)) {
        if (!options3.showDeprecated && suggestion?.tags?.includes(1 /* Deprecated */)) {
          continue;
        }
        if (!suggestion.range) {
          suggestion.range = defaultRange;
        }
        if (!suggestion.sortText) {
          suggestion.sortText = typeof suggestion.label === "string" ? suggestion.label : suggestion.label.label;
        }
        if (!needsClipboard && suggestion.insertTextRules && suggestion.insertTextRules & 4 /* InsertAsSnippet */) {
          needsClipboard = SnippetParser.guessNeedsClipboard(suggestion.insertText);
        }
        result.push(new CompletionItem(position2, suggestion, container2, provider));
        didAddResult = true;
      }
    }
    if (isDisposable(container2)) {
      disposables.add(container2);
    }
    durations.push({
      providerName: provider._debugDisplayName ?? "unknown_provider",
      elapsedProvider: container2.duration ?? -1,
      elapsedOverall: sw2.elapsed()
    });
    return didAddResult;
  };
  const snippetCompletions = (async () => {
    if (!_snippetSuggestSupport || options3.kindFilter.has(28 /* Snippet */)) {
      return;
    }
    const reuseItems = options3.providerItemsToReuse.get(_snippetSuggestSupport);
    if (reuseItems) {
      reuseItems.forEach((item) => result.push(item));
      return;
    }
    if (options3.providerFilter.size > 0 && !options3.providerFilter.has(_snippetSuggestSupport)) {
      return;
    }
    const sw2 = new StopWatch();
    const list2 = await _snippetSuggestSupport.provideCompletionItems(model, position2, context2, token);
    onCompletionList(_snippetSuggestSupport, list2, sw2);
  })();
  for (const providerGroup of registry4.orderedGroups(model)) {
    let didAddResult = false;
    await Promise.all(providerGroup.map(async (provider) => {
      if (options3.providerItemsToReuse.has(provider)) {
        const items = options3.providerItemsToReuse.get(provider);
        items.forEach((item) => result.push(item));
        didAddResult = didAddResult || items.length > 0;
        return;
      }
      if (options3.providerFilter.size > 0 && !options3.providerFilter.has(provider)) {
        return;
      }
      try {
        const sw2 = new StopWatch();
        const list2 = await provider.provideCompletionItems(model, position2, context2, token);
        didAddResult = onCompletionList(provider, list2, sw2) || didAddResult;
      } catch (err) {
        onUnexpectedExternalError(err);
      }
    }));
    if (didAddResult || token.isCancellationRequested) {
      break;
    }
  }
  await snippetCompletions;
  if (token.isCancellationRequested) {
    disposables.dispose();
    return Promise.reject(new CancellationError());
  }
  return new CompletionItemModel(
    result.sort(getSuggestionComparator(options3.snippetSortOrder)),
    needsClipboard,
    { entries: durations, elapsed: sw.elapsed() },
    disposables
  );
}

function defaultComparator(a, b) {
  if (a.sortTextLow && b.sortTextLow) {
    if (a.sortTextLow < b.sortTextLow) {
      return -1;
    } else if (a.sortTextLow > b.sortTextLow) {
      return 1;
    }
  }
  if (a.textLabel < b.textLabel) {
    return -1;
  } else if (a.textLabel > b.textLabel) {
    return 1;
  }
  return a.completion.kind - b.completion.kind;
}

function snippetUpComparator(a, b) {
  if (a.completion.kind !== b.completion.kind) {
    if (a.completion.kind === 28 /* Snippet */) {
      return -1;
    } else if (b.completion.kind === 28 /* Snippet */) {
      return 1;
    }
  }
  return defaultComparator(a, b);
}

function snippetDownComparator(a, b) {
  if (a.completion.kind !== b.completion.kind) {
    if (a.completion.kind === 28 /* Snippet */) {
      return 1;
    } else if (b.completion.kind === 28 /* Snippet */) {
      return -1;
    }
  }
  return defaultComparator(a, b);
}

var _snippetComparators = /* @__PURE__ */ new Map();

_snippetComparators.set(0 /* Top */, snippetUpComparator);

_snippetComparators.set(2 /* Bottom */, snippetDownComparator);

_snippetComparators.set(1 /* Inline */, defaultComparator);

function getSuggestionComparator(snippetConfig) {
  return _snippetComparators.get(snippetConfig);
}

CommandsRegistry.registerCommand("_executeCompletionItemProvider", async (accessor, ...args2) => {
  const [uri4, position2, triggerCharacter, maxItemsToResolve] = args2;
  assertType(URI.isUri(uri4));
  assertType(Position.isIPosition(position2));
  assertType(typeof triggerCharacter === "string" || !triggerCharacter);
  assertType(typeof maxItemsToResolve === "number" || !maxItemsToResolve);
  const { completionProvider } = accessor.get(ILanguageFeaturesService);
  const ref = await accessor.get(ITextModelService).createModelReference(uri4);
  try {
    const result = {
      incomplete: false,
      suggestions: []
    };
    const resolving = [];
    const actualPosition = ref.object.textEditorModel.validatePosition(position2);
    const completions = await provideSuggestionItems(completionProvider, ref.object.textEditorModel, actualPosition, void 0, { triggerCharacter: triggerCharacter ?? void 0, triggerKind: triggerCharacter ? 1 /* TriggerCharacter */ : 0 /* Invoke */ });
    for (const item of completions.items) {
      if (resolving.length < (maxItemsToResolve ?? 0)) {
        resolving.push(item.resolve(CancellationToken.None));
      }
      result.incomplete = result.incomplete || item.container.incomplete;
      result.suggestions.push(item.completion);
    }
    try {
      await Promise.all(resolving);
      return result;
    } finally {
      setTimeout(() => completions.disposable.dispose(), 100);
    }
  } finally {
    ref.dispose();
  }
});

function showSimpleSuggestions(editor, provider) {
  editor.getContribution("editor.contrib.suggestController")?.triggerSuggest(
    (/* @__PURE__ */ new Set()).add(provider),
    void 0,
    true
  );
}

var QuickSuggestionsOptions = class {
  static isAllOff(config) {
    return config.other === "off" && config.comments === "off" && config.strings === "off";
  }
  static isAllOn(config) {
    return config.other === "on" && config.comments === "on" && config.strings === "on";
  }
  static valueFor(config, tokenType) {
    switch (tokenType) {
      case 1 /* Comment */:
        return config.comments;
      case 2 /* String */:
        return config.strings;
      default:
        return config.other;
    }
  }
};
export { getSnippetSuggestSupport, setSnippetSuggestSupport, provideSuggestionItems, defaultComparator, snippetUpComparator, snippetDownComparator, getSuggestionComparator, showSimpleSuggestions, Context, suggestWidgetStatusbarMenu, CompletionItem, CompletionOptions, _snippetSuggestSupport, CompletionItemModel, _snippetComparators, QuickSuggestionsOptions };
