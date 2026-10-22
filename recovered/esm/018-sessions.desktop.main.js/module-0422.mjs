// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/tokenizationTextModelPart.ts
import { TextModelPart } from "./module-0293.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { TreeSitterSyntaxTokenBackend } from "./module-0418.mjs";
import { TokenizerSyntaxTokenBackend } from "./module-0421.mjs";
import { SparseTokensStore } from "./module-0419.mjs";
import { countEOL } from "./module-0375.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { getWordAtText } from "./module-0103.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ILanguageConfigurationService } from "./module-0143.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITreeSitterLibraryService } from "./module-0417.mjs";


// src/vs/editor/common/model/tokens/tokenizationTextModelPart.ts
var TokenizationTextModelPart = class extends TextModelPart {
  constructor(_textModel, _bracketPairsTextModelPart, _languageId, _attachedViews, _languageService, _languageConfigurationService, _instantiationService, _treeSitterLibraryService) {
    super();
    this._textModel = _textModel;
    this._bracketPairsTextModelPart = _bracketPairsTextModelPart;
    this._languageId = _languageId;
    this._attachedViews = _attachedViews;
    this._languageService = _languageService;
    this._languageConfigurationService = _languageConfigurationService;
    this._instantiationService = _instantiationService;
    this._treeSitterLibraryService = _treeSitterLibraryService;
    this._onDidChangeFontTokens = this._register(new Emitter());
    this.onDidChangeFontTokens = this._onDidChangeFontTokens.event;
    this._languageIdObs = observableValue(this, this._languageId);
    this._useTreeSitter = derived(this, (reader) => {
      const languageId = this._languageIdObs.read(reader);
      return this._treeSitterLibraryService.supportsLanguage(languageId, reader);
    });
    this.tokens = derived(this, (reader) => {
      let tokens;
      if (this._useTreeSitter.read(reader)) {
        tokens = reader.store.add(this._instantiationService.createInstance(
          TreeSitterSyntaxTokenBackend,
          this._languageIdObs,
          this._languageService.languageIdCodec,
          this._textModel,
          this._attachedViews.visibleLineRanges
        ));
      } else {
        tokens = reader.store.add(new TokenizerSyntaxTokenBackend(this._languageService.languageIdCodec, this._textModel, () => this._languageId, this._attachedViews));
      }
      reader.store.add(tokens.onDidChangeTokens((e4) => {
        this._emitModelTokensChangedEvent(e4);
      }));
      reader.store.add(tokens.onDidChangeFontTokens((e4) => {
        if (!this._textModel._isDisposing()) {
          this._onDidChangeFontTokens.fire(e4);
        }
      }));
      reader.store.add(tokens.onDidChangeBackgroundTokenizationState((e4) => {
        this._bracketPairsTextModelPart.handleDidChangeBackgroundTokenizationState();
      }));
      return tokens;
    });
    let hadTokens = false;
    this.tokens.recomputeInitiallyAndOnChange(this._store, (value2) => {
      if (hadTokens) {
        value2.todo_resetTokenization();
      }
      hadTokens = true;
    });
    this._semanticTokens = new SparseTokensStore(this._languageService.languageIdCodec);
    this._onDidChangeLanguage = this._register(new Emitter());
    this.onDidChangeLanguage = this._onDidChangeLanguage.event;
    this._onDidChangeLanguageConfiguration = this._register(new Emitter());
    this.onDidChangeLanguageConfiguration = this._onDidChangeLanguageConfiguration.event;
    this._onDidChangeTokens = this._register(new Emitter());
    this.onDidChangeTokens = this._onDidChangeTokens.event;
    this._onDidChangeFontTokens = this._register(new Emitter());
    this.onDidChangeFontTokens = this._onDidChangeFontTokens.event;
  }
  _hasListeners() {
    return this._onDidChangeLanguage.hasListeners() || this._onDidChangeLanguageConfiguration.hasListeners() || this._onDidChangeTokens.hasListeners();
  }
  handleLanguageConfigurationServiceChange(e4) {
    if (e4.affects(this._languageId)) {
      this._onDidChangeLanguageConfiguration.fire({});
    }
  }
  handleDidChangeContent(e4) {
    if (e4.isFlush) {
      this._semanticTokens.flush();
    } else if (!e4.isEolChange) {
      for (const c of e4.changes) {
        const [eolCount, firstLineLength, lastLineLength] = countEOL(c.text);
        this._semanticTokens.acceptEdit(
          c.range,
          eolCount,
          firstLineLength,
          lastLineLength,
          c.text.length > 0 ? c.text.charCodeAt(0) : 0 /* Null */
        );
      }
    }
    this.tokens.get().handleDidChangeContent(e4);
  }
  handleDidChangeAttached() {
    this.tokens.get().handleDidChangeAttached();
  }
  /**
   * Includes grammar and semantic tokens.
   */
  getLineTokens(lineNumber) {
    this.validateLineNumber(lineNumber);
    const syntacticTokens = this.tokens.get().getLineTokens(lineNumber);
    return this._semanticTokens.addSparseTokens(lineNumber, syntacticTokens);
  }
  _emitModelTokensChangedEvent(e4) {
    if (!this._textModel._isDisposing()) {
      this._bracketPairsTextModelPart.handleDidChangeTokens(e4);
      this._onDidChangeTokens.fire(e4);
    }
  }
  // #region Grammar Tokens
  validateLineNumber(lineNumber) {
    if (lineNumber < 1 || lineNumber > this._textModel.getLineCount()) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
  }
  get hasTokens() {
    return this.tokens.get().hasTokens;
  }
  resetTokenization() {
    this.tokens.get().todo_resetTokenization();
  }
  get backgroundTokenizationState() {
    return this.tokens.get().backgroundTokenizationState;
  }
  forceTokenization(lineNumber) {
    this.validateLineNumber(lineNumber);
    this.tokens.get().forceTokenization(lineNumber);
  }
  hasAccurateTokensForLine(lineNumber) {
    this.validateLineNumber(lineNumber);
    return this.tokens.get().hasAccurateTokensForLine(lineNumber);
  }
  isCheapToTokenize(lineNumber) {
    this.validateLineNumber(lineNumber);
    return this.tokens.get().isCheapToTokenize(lineNumber);
  }
  tokenizeIfCheap(lineNumber) {
    this.validateLineNumber(lineNumber);
    this.tokens.get().tokenizeIfCheap(lineNumber);
  }
  getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
    return this.tokens.get().getTokenTypeIfInsertingCharacter(lineNumber, column, character);
  }
  tokenizeLinesAt(lineNumber, lines) {
    return this.tokens.get().tokenizeLinesAt(lineNumber, lines);
  }
  // #endregion
  // #region Semantic Tokens
  setSemanticTokens(tokens, isComplete) {
    this._semanticTokens.set(tokens, isComplete, this._textModel);
    this._emitModelTokensChangedEvent({
      semanticTokensApplied: tokens !== null,
      ranges: [{ fromLineNumber: 1, toLineNumber: this._textModel.getLineCount() }]
    });
  }
  hasCompleteSemanticTokens() {
    return this._semanticTokens.isComplete();
  }
  hasSomeSemanticTokens() {
    return !this._semanticTokens.isEmpty();
  }
  setPartialSemanticTokens(range2, tokens) {
    if (this.hasCompleteSemanticTokens()) {
      return;
    }
    const changedRange = this._textModel.validateRange(
      this._semanticTokens.setPartial(range2, tokens)
    );
    this._emitModelTokensChangedEvent({
      semanticTokensApplied: true,
      ranges: [
        {
          fromLineNumber: changedRange.startLineNumber,
          toLineNumber: changedRange.endLineNumber
        }
      ]
    });
  }
  // #endregion
  // #region Utility Methods
  getWordAtPosition(_position) {
    this.assertNotDisposed();
    const position2 = this._textModel.validatePosition(_position);
    const lineContent = this._textModel.getLineContent(position2.lineNumber);
    const lineTokens = this.getLineTokens(position2.lineNumber);
    const tokenIndex = lineTokens.findTokenIndexAtOffset(position2.column - 1);
    const [rbStartOffset, rbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(lineTokens, tokenIndex);
    const rightBiasedWord = getWordAtText(
      position2.column,
      this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex)).getWordDefinition(),
      lineContent.substring(rbStartOffset, rbEndOffset),
      rbStartOffset
    );
    if (rightBiasedWord && rightBiasedWord.startColumn <= _position.column && _position.column <= rightBiasedWord.endColumn) {
      return rightBiasedWord;
    }
    if (tokenIndex > 0 && rbStartOffset === position2.column - 1) {
      const [lbStartOffset, lbEndOffset] = TokenizationTextModelPart._findLanguageBoundaries(
        lineTokens,
        tokenIndex - 1
      );
      const leftBiasedWord = getWordAtText(
        position2.column,
        this.getLanguageConfiguration(lineTokens.getLanguageId(tokenIndex - 1)).getWordDefinition(),
        lineContent.substring(lbStartOffset, lbEndOffset),
        lbStartOffset
      );
      if (leftBiasedWord && leftBiasedWord.startColumn <= _position.column && _position.column <= leftBiasedWord.endColumn) {
        return leftBiasedWord;
      }
    }
    return null;
  }
  getLanguageConfiguration(languageId) {
    return this._languageConfigurationService.getLanguageConfiguration(languageId);
  }
  static _findLanguageBoundaries(lineTokens, tokenIndex) {
    const languageId = lineTokens.getLanguageId(tokenIndex);
    let startOffset = 0;
    for (let i2 = tokenIndex; i2 >= 0 && lineTokens.getLanguageId(i2) === languageId; i2--) {
      startOffset = lineTokens.getStartOffset(i2);
    }
    let endOffset = lineTokens.getLineContent().length;
    for (let i2 = tokenIndex, tokenCount = lineTokens.getCount(); i2 < tokenCount && lineTokens.getLanguageId(i2) === languageId; i2++) {
      endOffset = lineTokens.getEndOffset(i2);
    }
    return [startOffset, endOffset];
  }
  getWordUntilPosition(position2) {
    const wordAtPosition = this.getWordAtPosition(position2);
    if (!wordAtPosition) {
      return { word: "", startColumn: position2.column, endColumn: position2.column };
    }
    return {
      word: wordAtPosition.word.substr(0, position2.column - wordAtPosition.startColumn),
      startColumn: wordAtPosition.startColumn,
      endColumn: position2.column
    };
  }
  // #endregion
  // #region Language Id handling
  getLanguageId() {
    return this._languageId;
  }
  getLanguageIdAtPosition(lineNumber, column) {
    const position2 = this._textModel.validatePosition(new Position(lineNumber, column));
    const lineTokens = this.getLineTokens(position2.lineNumber);
    return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position2.column - 1));
  }
  setLanguageId(languageId, source = "api") {
    if (this._languageId === languageId) {
      return;
    }
    const e4 = {
      oldLanguage: this._languageId,
      newLanguage: languageId,
      source
    };
    this._languageId = languageId;
    this._languageIdObs.set(languageId, void 0);
    this._bracketPairsTextModelPart.handleDidChangeLanguage(e4);
    this._onDidChangeLanguage.fire(e4);
    this._onDidChangeLanguageConfiguration.fire({});
  }
  // #endregion
};

TokenizationTextModelPart = __decorateClass([
  __decorateParam(4, ILanguageService),
  __decorateParam(5, ILanguageConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITreeSitterLibraryService)
], TokenizationTextModelPart);
export { TokenizationTextModelPart };
