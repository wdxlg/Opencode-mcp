// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports.ts



// src/vs/editor/common/languages/supports.ts
function createScopedLineTokens(context2, offset) {
  const tokenCount = context2.getCount();
  const tokenIndex = context2.findTokenIndexAtOffset(offset);
  const desiredLanguageId = context2.getLanguageId(tokenIndex);
  let lastTokenIndex = tokenIndex;
  while (lastTokenIndex + 1 < tokenCount && context2.getLanguageId(lastTokenIndex + 1) === desiredLanguageId) {
    lastTokenIndex++;
  }
  let firstTokenIndex = tokenIndex;
  while (firstTokenIndex > 0 && context2.getLanguageId(firstTokenIndex - 1) === desiredLanguageId) {
    firstTokenIndex--;
  }
  return new ScopedLineTokens(
    context2,
    desiredLanguageId,
    firstTokenIndex,
    lastTokenIndex + 1,
    context2.getStartOffset(firstTokenIndex),
    context2.getEndOffset(lastTokenIndex)
  );
}

var ScopedLineTokens = class {
  constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
    this._scopedLineTokensBrand = void 0;
    this._actual = actual;
    this.languageId = languageId;
    this._firstTokenIndex = firstTokenIndex;
    this._lastTokenIndex = lastTokenIndex;
    this.firstCharOffset = firstCharOffset;
    this._lastCharOffset = lastCharOffset;
    this.languageIdCodec = actual.languageIdCodec;
  }
  getLineContent() {
    const actualLineContent = this._actual.getLineContent();
    return actualLineContent.substring(this.firstCharOffset, this._lastCharOffset);
  }
  getLineLength() {
    return this._lastCharOffset - this.firstCharOffset;
  }
  getActualLineContentBefore(offset) {
    const actualLineContent = this._actual.getLineContent();
    return actualLineContent.substring(0, this.firstCharOffset + offset);
  }
  getTokenCount() {
    return this._lastTokenIndex - this._firstTokenIndex;
  }
  findTokenIndexAtOffset(offset) {
    return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
  }
  getStandardTokenType(tokenIndex) {
    return this._actual.getStandardTokenType(tokenIndex + this._firstTokenIndex);
  }
  toIViewLineTokens() {
    return this._actual.sliceAndInflate(this.firstCharOffset, this._lastCharOffset, 0);
  }
};

var IgnoreBracketsInTokens = ((IgnoreBracketsInTokens2) => {
  IgnoreBracketsInTokens2[IgnoreBracketsInTokens2["value"] = 1 /* Comment */ | 2 /* String */ | 3 /* RegEx */] = "value";
  return IgnoreBracketsInTokens2;
})(IgnoreBracketsInTokens || {});

function ignoreBracketsInToken(standardTokenType) {
  return (standardTokenType & IgnoreBracketsInTokens.value) !== 0;
}
export { createScopedLineTokens, ignoreBracketsInToken, ScopedLineTokens, IgnoreBracketsInTokens };
