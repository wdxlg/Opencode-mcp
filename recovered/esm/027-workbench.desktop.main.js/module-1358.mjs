// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippetCompletionProvider.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { Snippet } from "./module-1353.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { SnippetParser } from "./module-0544.mjs";
import { compare, compareSubstring } from "./module-0030.mjs";
import { StopWatch } from "./module-0016.mjs";
import { isPatternInWord } from "./module-0453.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";


// src/vs/workbench/contrib/snippets/browser/snippetCompletionProvider.ts
var markSnippetAsUsed = "_snippet.markAsUsed";

CommandsRegistry.registerCommand(markSnippetAsUsed, (accessor, ...args2) => {
  const snippetsService = accessor.get(ISnippetsService);
  const [first2] = args2;
  if (first2 instanceof Snippet) {
    snippetsService.updateUsageTimestamp(first2);
  }
});

var SnippetCompletion = class {
  constructor(snippet, range2) {
    this.snippet = snippet;
    this.label = { label: snippet.prefix, description: snippet.name };
    this.detail = localize(19346, null, snippet.description || snippet.name, snippet.source);
    this.insertText = snippet.codeSnippet;
    this.extensionId = snippet.extensionId;
    this.range = range2;
    this.sortText = `${snippet.snippetSource === 3 /* Extension */ ? "z" : "a"}-${snippet.prefix}`;
    this.kind = 28 /* Snippet */;
    this.insertTextRules = 4 /* InsertAsSnippet */;
    this.command = { id: markSnippetAsUsed, title: "", arguments: [snippet] };
  }
  resolve() {
    this.documentation = new MarkdownString().appendCodeblock("", SnippetParser.asInsertText(this.snippet.codeSnippet));
    return this;
  }
  static compareByLabel(a, b) {
    return compare(a.label.label, b.label.label);
  }
};

var SnippetCompletionProvider = class {
  constructor(_languageService, _snippets, _languageConfigurationService) {
    this._languageService = _languageService;
    this._snippets = _snippets;
    this._languageConfigurationService = _languageConfigurationService;
    this._debugDisplayName = "snippetCompletions";
  }
  async provideCompletionItems(model, position2, context2) {
    const sw = new StopWatch();
    const line = position2.lineNumber;
    const word = model.getWordAtPosition(position2) ?? { startColumn: position2.column, endColumn: position2.column, word: "" };
    const lineContentLow = model.getLineContent(position2.lineNumber).toLowerCase();
    const lineContentWithWordLow = lineContentLow.substring(0, word.startColumn + word.word.length - 1);
    const anchors = this._computeSnippetPositions(model, line, word, lineContentWithWordLow);
    const columnOffset = position2.column - 1;
    const triggerCharacterLow = context2.triggerCharacter?.toLowerCase() ?? "";
    const languageId = this._getLanguageIdAtPosition(model, position2);
    const languageConfig = this._languageConfigurationService.getLanguageConfiguration(languageId);
    const snippets = new Set(await this._snippets.getSnippets(languageId, model.uri));
    const suggestions = [];
    for (const snippet of snippets) {
      if (context2.triggerKind === 1 /* TriggerCharacter */ && !snippet.prefixLow.startsWith(triggerCharacterLow)) {
        continue;
      }
      let candidate;
      for (const anchor of anchors) {
        if (anchor.prefixLow.match(/^\s/) && !snippet.prefixLow.match(/^\s/)) {
          continue;
        }
        if (isPatternInWord(anchor.prefixLow, 0, anchor.prefixLow.length, snippet.prefixLow, 0, snippet.prefixLow.length)) {
          candidate = anchor;
          break;
        }
      }
      if (!candidate) {
        continue;
      }
      const pos = candidate.startColumn - 1;
      const prefixRestLen = snippet.prefixLow.length - (columnOffset - pos);
      const endsWithPrefixRest = compareSubstring(lineContentLow, snippet.prefixLow, columnOffset, columnOffset + prefixRestLen, columnOffset - pos);
      const startPosition = position2.with(void 0, pos + 1);
      let endColumn = endsWithPrefixRest === 0 ? position2.column + prefixRestLen : position2.column;
      if (columnOffset < lineContentLow.length) {
        const autoClosingPairs = languageConfig.getAutoClosingPairs();
        const standardAutoClosingPairConditionals = autoClosingPairs.autoClosingPairsCloseSingleChar.get(lineContentLow[columnOffset]);
        if (standardAutoClosingPairConditionals?.some((p) => (
          // and the start position is the opening character of an autoclosing pair
          p.open === lineContentLow[startPosition.column - 1] && // and the snippet prefix contains the opening and closing pair at its edges
          snippet.prefix.startsWith(p.open) && snippet.prefix[snippet.prefix.length - 1] === p.close
        ))) {
          endColumn++;
        }
      }
      const replace = Range2.fromPositions({ lineNumber: line, column: candidate.startColumn }, { lineNumber: line, column: endColumn });
      const insert2 = replace.setEndPosition(line, position2.column);
      suggestions.push(new SnippetCompletion(snippet, { replace, insert: insert2 }));
      snippets.delete(snippet);
    }
    if (!triggerCharacterLow && (/\s/.test(lineContentLow[position2.column - 2]) || !lineContentLow)) {
      for (const snippet of snippets) {
        const insert2 = Range2.fromPositions(position2);
        const replace = lineContentLow.indexOf(snippet.prefixLow, columnOffset) === columnOffset ? insert2.setEndPosition(position2.lineNumber, position2.column + snippet.prefixLow.length) : insert2;
        suggestions.push(new SnippetCompletion(snippet, { replace, insert: insert2 }));
      }
    }
    this._disambiguateSnippets(suggestions);
    return {
      suggestions,
      duration: sw.elapsed()
    };
  }
  _disambiguateSnippets(suggestions) {
    suggestions.sort(SnippetCompletion.compareByLabel);
    for (let i2 = 0; i2 < suggestions.length; i2++) {
      const item = suggestions[i2];
      let to = i2 + 1;
      for (; to < suggestions.length && item.label === suggestions[to].label; to++) {
        suggestions[to].label.label = localize(19347, null, suggestions[to].label.label, suggestions[to].snippet.name);
      }
      if (to > i2 + 1) {
        suggestions[i2].label.label = localize(19347, null, suggestions[i2].label.label, suggestions[i2].snippet.name);
        i2 = to;
      }
    }
  }
  resolveCompletionItem(item) {
    return item instanceof SnippetCompletion ? item.resolve() : item;
  }
  _computeSnippetPositions(model, line, word, lineContentWithWordLow) {
    const result = [];
    for (let column = 1; column < word.startColumn; column++) {
      const wordInfo = model.getWordAtPosition(new Position(line, column));
      result.push({
        startColumn: column,
        prefixLow: lineContentWithWordLow.substring(column - 1),
        isWord: Boolean(wordInfo)
      });
      if (wordInfo) {
        column = wordInfo.endColumn;
        result.push({
          startColumn: wordInfo.endColumn,
          prefixLow: lineContentWithWordLow.substring(wordInfo.endColumn - 1),
          isWord: false
        });
      }
    }
    if (word.word.length > 0 || result.length === 0) {
      result.push({
        startColumn: word.startColumn,
        prefixLow: lineContentWithWordLow.substring(word.startColumn - 1),
        isWord: true
      });
    }
    return result;
  }
  _getLanguageIdAtPosition(model, position2) {
    model.tokenization.tokenizeIfCheap(position2.lineNumber);
    let languageId = model.getLanguageIdAtPosition(position2.lineNumber, position2.column);
    if (!this._languageService.getLanguageName(languageId)) {
      languageId = model.getLanguageId();
    }
    return languageId;
  }
};

SnippetCompletionProvider = __decorateClass([
  __decorateParam(0, ILanguageService),
  __decorateParam(1, ISnippetsService),
  __decorateParam(2, ILanguageConfigurationService)
], SnippetCompletionProvider);
export { markSnippetAsUsed, SnippetCompletion, SnippetCompletionProvider };
