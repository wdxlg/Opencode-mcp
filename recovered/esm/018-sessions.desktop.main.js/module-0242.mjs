// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/viewModelDecoration.ts



// src/vs/editor/common/viewModel/viewModelDecoration.ts
var ViewModelDecoration = class {
  constructor(range2, options3) {
    this._viewModelDecorationBrand = void 0;
    this.range = range2;
    this.options = options3;
  }
};

function isModelDecorationVisible(model, decoration3) {
  if (decoration3.options.hideInCommentTokens && isModelDecorationInComment(model, decoration3)) {
    return false;
  }
  if (decoration3.options.hideInStringTokens && isModelDecorationInString(model, decoration3)) {
    return false;
  }
  return true;
}

function isModelDecorationInComment(model, decoration3) {
  return testTokensInRange(
    model,
    decoration3.range,
    (tokenType) => tokenType === 1 /* Comment */
  );
}

function isModelDecorationInString(model, decoration3) {
  return testTokensInRange(
    model,
    decoration3.range,
    (tokenType) => tokenType === 2 /* String */
  );
}

function testTokensInRange(model, range2, callback) {
  for (let lineNumber = range2.startLineNumber; lineNumber <= range2.endLineNumber; lineNumber++) {
    const lineTokens = model.tokenization.getLineTokens(lineNumber);
    const isFirstLine = lineNumber === range2.startLineNumber;
    const isEndLine = lineNumber === range2.endLineNumber;
    let tokenIdx = isFirstLine ? lineTokens.findTokenIndexAtOffset(range2.startColumn - 1) : 0;
    while (tokenIdx < lineTokens.getCount()) {
      if (isEndLine) {
        const startOffset = lineTokens.getStartOffset(tokenIdx);
        if (startOffset > range2.endColumn - 1) {
          break;
        }
      }
      const callbackResult = callback(lineTokens.getStandardTokenType(tokenIdx));
      if (!callbackResult) {
        return false;
      }
      tokenIdx++;
    }
  }
  return true;
}
export { isModelDecorationVisible, isModelDecorationInComment, isModelDecorationInString, testTokensInRange, ViewModelDecoration };
