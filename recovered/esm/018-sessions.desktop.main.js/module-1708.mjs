// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit.ts
import { Disposable } from "./module-0012.mjs";
import { keepObserved } from "./module-0059.mjs";
import { nullTokenizeEncoded } from "./module-0408.mjs";


// src/vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit.ts
var TokenizationSupportWithLineLimit = class extends Disposable {
  constructor(_encodedLanguageId, _actual, disposable, _maxTokenizationLineLength) {
    super();
    this._encodedLanguageId = _encodedLanguageId;
    this._actual = _actual;
    this._maxTokenizationLineLength = _maxTokenizationLineLength;
    this._register(keepObserved(this._maxTokenizationLineLength));
    this._register(disposable);
  }
  get backgroundTokenizerShouldOnlyVerifyTokens() {
    return this._actual.backgroundTokenizerShouldOnlyVerifyTokens;
  }
  getInitialState() {
    return this._actual.getInitialState();
  }
  tokenize(line, hasEOL, state) {
    throw new Error("Not supported!");
  }
  tokenizeEncoded(line, hasEOL, state) {
    if (line.length >= this._maxTokenizationLineLength.get()) {
      return nullTokenizeEncoded(this._encodedLanguageId, state);
    }
    return this._actual.tokenizeEncoded(line, hasEOL, state);
  }
  createBackgroundTokenizer(textModel, store) {
    if (this._actual.createBackgroundTokenizer) {
      return this._actual.createBackgroundTokenizer(textModel, store);
    } else {
      return void 0;
    }
  }
};
export { TokenizationSupportWithLineLimit };
