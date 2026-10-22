// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { StopWatch } from "./module-0016.mjs";
import { EncodedTokenizationResult } from "./module-0164.mjs";
import { TokenMetadata } from "./module-0108.mjs";


// src/vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport.ts
var TextMateTokenizationSupport = class extends Disposable {
  constructor(_grammar, _initialState, _containsEmbeddedLanguages, _createBackgroundTokenizer, _backgroundTokenizerShouldOnlyVerifyTokens, _reportTokenizationTime, _reportSlowTokenization) {
    super();
    this._grammar = _grammar;
    this._initialState = _initialState;
    this._containsEmbeddedLanguages = _containsEmbeddedLanguages;
    this._createBackgroundTokenizer = _createBackgroundTokenizer;
    this._backgroundTokenizerShouldOnlyVerifyTokens = _backgroundTokenizerShouldOnlyVerifyTokens;
    this._reportTokenizationTime = _reportTokenizationTime;
    this._reportSlowTokenization = _reportSlowTokenization;
    this._seenLanguages = [];
    this._onDidEncounterLanguage = this._register(new Emitter());
  }
  get onDidEncounterLanguage() {
    return this._onDidEncounterLanguage.event;
  }
  get backgroundTokenizerShouldOnlyVerifyTokens() {
    return this._backgroundTokenizerShouldOnlyVerifyTokens();
  }
  getInitialState() {
    return this._initialState;
  }
  tokenize(line, hasEOL, state) {
    throw new Error("Not supported!");
  }
  createBackgroundTokenizer(textModel, store) {
    if (this._createBackgroundTokenizer) {
      return this._createBackgroundTokenizer(textModel, store);
    }
    return void 0;
  }
  tokenizeEncoded(line, hasEOL, state) {
    const isRandomSample = Math.random() * 1e4 < 1;
    const shouldMeasure = this._reportSlowTokenization || isRandomSample;
    const sw = shouldMeasure ? new StopWatch(true) : void 0;
    const textMateResult = this._grammar.tokenizeLine2(line, state, 500);
    if (shouldMeasure) {
      const timeMS = sw.elapsed();
      if (isRandomSample || timeMS > 32) {
        this._reportTokenizationTime(timeMS, line.length, isRandomSample);
      }
    }
    if (textMateResult.stoppedEarly) {
      console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
      return new EncodedTokenizationResult(textMateResult.tokens, textMateResult.fonts, state);
    }
    if (this._containsEmbeddedLanguages) {
      const seenLanguages = this._seenLanguages;
      const tokens = textMateResult.tokens;
      for (let i2 = 0, len = tokens.length >>> 1; i2 < len; i2++) {
        const metadata = tokens[(i2 << 1) + 1];
        const languageId = TokenMetadata.getLanguageId(metadata);
        if (!seenLanguages[languageId]) {
          seenLanguages[languageId] = true;
          this._onDidEncounterLanguage.fire(languageId);
        }
      }
    }
    let endState;
    if (state.equals(textMateResult.ruleStack)) {
      endState = state;
    } else {
      endState = textMateResult.ruleStack;
    }
    return new EncodedTokenizationResult(textMateResult.tokens, textMateResult.fonts, endState);
  }
};
export { TextMateTokenizationSupport };
