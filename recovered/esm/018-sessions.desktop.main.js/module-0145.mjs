// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/lineTokens.ts
import { onUnexpectedError } from "./module-0004.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/common/tokens/lineTokens.ts
var LineTokens = class _LineTokens {
  constructor(tokens, text2, decoder2) {
    this._lineTokensBrand = void 0;
    const tokensLength = tokens.length > 1 ? tokens[tokens.length - 2] : 0;
    if (tokensLength !== text2.length) {
      onUnexpectedError(new Error("Token length and text length do not match!"));
    }
    this._tokens = tokens;
    this._tokensCount = this._tokens.length >>> 1;
    this._text = text2;
    this.languageIdCodec = decoder2;
  }
  static createEmpty(lineContent, decoder2) {
    const defaultMetadata = _LineTokens.defaultTokenMetadata;
    const tokens = new Uint32Array(2);
    tokens[0] = lineContent.length;
    tokens[1] = defaultMetadata;
    return new _LineTokens(tokens, lineContent, decoder2);
  }
  static createFromTextAndMetadata(data, decoder2) {
    let offset = 0;
    let fullText = "";
    const tokens = new Array();
    for (const { text: text2, metadata } of data) {
      tokens.push(offset + text2.length, metadata);
      offset += text2.length;
      fullText += text2;
    }
    return new _LineTokens(new Uint32Array(tokens), fullText, decoder2);
  }
  static convertToEndOffset(tokens, lineTextLength) {
    const tokenCount = tokens.length >>> 1;
    const lastTokenIndex = tokenCount - 1;
    for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
      tokens[tokenIndex << 1] = tokens[tokenIndex + 1 << 1];
    }
    tokens[lastTokenIndex << 1] = lineTextLength;
  }
  static findIndexInTokensArray(tokens, desiredIndex) {
    if (tokens.length <= 2) {
      return 0;
    }
    let low = 0;
    let high = (tokens.length >>> 1) - 1;
    while (low < high) {
      const mid = low + Math.floor((high - low) / 2);
      const endOffset = tokens[mid << 1];
      if (endOffset === desiredIndex) {
        return mid + 1;
      } else if (endOffset < desiredIndex) {
        low = mid + 1;
      } else if (endOffset > desiredIndex) {
        high = mid;
      }
    }
    return low;
  }
  static {
    this.defaultTokenMetadata = (0 /* None */ << 11 /* FONT_STYLE_OFFSET */ | 1 /* DefaultForeground */ << 15 /* FOREGROUND_OFFSET */ | 2 /* DefaultBackground */ << 24 /* BACKGROUND_OFFSET */) >>> 0;
  }
  getTextLength() {
    return this._text.length;
  }
  equals(other) {
    if (other instanceof _LineTokens) {
      return this.slicedEquals(other, 0, this._tokensCount);
    }
    return false;
  }
  slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
    if (this._text !== other._text) {
      return false;
    }
    if (this._tokensCount !== other._tokensCount) {
      return false;
    }
    const from = sliceFromTokenIndex << 1;
    const to = from + (sliceTokenCount << 1);
    for (let i2 = from; i2 < to; i2++) {
      if (this._tokens[i2] !== other._tokens[i2]) {
        return false;
      }
    }
    return true;
  }
  getLineContent() {
    return this._text;
  }
  getCount() {
    return this._tokensCount;
  }
  getStartOffset(tokenIndex) {
    if (tokenIndex > 0) {
      return this._tokens[tokenIndex - 1 << 1];
    }
    return 0;
  }
  getMetadata(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return metadata;
  }
  getLanguageId(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    const languageId = TokenMetadata.getLanguageId(metadata);
    return this.languageIdCodec.decodeLanguageId(languageId);
  }
  getStandardTokenType(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return TokenMetadata.getTokenType(metadata);
  }
  getForeground(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return TokenMetadata.getForeground(metadata);
  }
  getClassName(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return TokenMetadata.getClassNameFromMetadata(metadata);
  }
  getInlineStyle(tokenIndex, colorMap) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
  }
  getPresentation(tokenIndex) {
    const metadata = this._tokens[(tokenIndex << 1) + 1];
    return TokenMetadata.getPresentationFromMetadata(metadata);
  }
  getEndOffset(tokenIndex) {
    return this._tokens[tokenIndex << 1];
  }
  /**
   * Find the token containing offset `offset`.
   * @param offset The search offset
   * @return The index of the token containing the offset.
   */
  findTokenIndexAtOffset(offset) {
    return _LineTokens.findIndexInTokensArray(this._tokens, offset);
  }
  inflate() {
    return this;
  }
  sliceAndInflate(startOffset, endOffset, deltaOffset) {
    return new SliceLineTokens(this, startOffset, endOffset, deltaOffset);
  }
  sliceZeroCopy(range2) {
    return this.sliceAndInflate(range2.start, range2.endExclusive, 0);
  }
  /**
   * @pure
   * @param insertTokens Must be sorted by offset.
  */
  withInserted(insertTokens) {
    if (insertTokens.length === 0) {
      return this;
    }
    let nextOriginalTokenIdx = 0;
    let nextInsertTokenIdx = 0;
    let text2 = "";
    const newTokens = new Array();
    let originalEndOffset = 0;
    while (true) {
      const nextOriginalTokenEndOffset = nextOriginalTokenIdx < this._tokensCount ? this._tokens[nextOriginalTokenIdx << 1] : -1;
      const nextInsertToken = nextInsertTokenIdx < insertTokens.length ? insertTokens[nextInsertTokenIdx] : null;
      if (nextOriginalTokenEndOffset !== -1 && (nextInsertToken === null || nextOriginalTokenEndOffset <= nextInsertToken.offset)) {
        text2 += this._text.substring(originalEndOffset, nextOriginalTokenEndOffset);
        const metadata = this._tokens[(nextOriginalTokenIdx << 1) + 1];
        newTokens.push(text2.length, metadata);
        nextOriginalTokenIdx++;
        originalEndOffset = nextOriginalTokenEndOffset;
      } else if (nextInsertToken) {
        if (nextInsertToken.offset > originalEndOffset) {
          text2 += this._text.substring(originalEndOffset, nextInsertToken.offset);
          const metadata = this._tokens[(nextOriginalTokenIdx << 1) + 1];
          newTokens.push(text2.length, metadata);
          originalEndOffset = nextInsertToken.offset;
        }
        text2 += nextInsertToken.text;
        newTokens.push(text2.length, nextInsertToken.tokenMetadata);
        nextInsertTokenIdx++;
      } else {
        break;
      }
    }
    return new _LineTokens(new Uint32Array(newTokens), text2, this.languageIdCodec);
  }
  getTokensInRange(range2) {
    const builder = new TokenArrayBuilder();
    const startTokenIndex = this.findTokenIndexAtOffset(range2.start);
    const endTokenIndex = this.findTokenIndexAtOffset(range2.endExclusive);
    for (let tokenIndex = startTokenIndex; tokenIndex <= endTokenIndex; tokenIndex++) {
      const tokenRange = new OffsetRange(this.getStartOffset(tokenIndex), this.getEndOffset(tokenIndex));
      const length = tokenRange.intersectionLength(range2);
      if (length > 0) {
        builder.add(length, this.getMetadata(tokenIndex));
      }
    }
    return builder.build();
  }
  getTokenText(tokenIndex) {
    const startOffset = this.getStartOffset(tokenIndex);
    const endOffset = this.getEndOffset(tokenIndex);
    const text2 = this._text.substring(startOffset, endOffset);
    return text2;
  }
  forEach(callback) {
    const tokenCount = this.getCount();
    for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex++) {
      callback(tokenIndex);
    }
  }
  toString() {
    let result = "";
    this.forEach((i2) => {
      result += `[${this.getTokenText(i2)}]{${this.getClassName(i2)}}`;
    });
    return result;
  }
};

var SliceLineTokens = class _SliceLineTokens {
  constructor(source, startOffset, endOffset, deltaOffset) {
    this._source = source;
    this._startOffset = startOffset;
    this._endOffset = endOffset;
    this._deltaOffset = deltaOffset;
    this._firstTokenIndex = source.findTokenIndexAtOffset(startOffset);
    this.languageIdCodec = source.languageIdCodec;
    this._tokensCount = 0;
    for (let i2 = this._firstTokenIndex, len = source.getCount(); i2 < len; i2++) {
      const tokenStartOffset = source.getStartOffset(i2);
      if (tokenStartOffset >= endOffset) {
        break;
      }
      this._tokensCount++;
    }
  }
  getMetadata(tokenIndex) {
    return this._source.getMetadata(this._firstTokenIndex + tokenIndex);
  }
  getLanguageId(tokenIndex) {
    return this._source.getLanguageId(this._firstTokenIndex + tokenIndex);
  }
  getLineContent() {
    return this._source.getLineContent().substring(this._startOffset, this._endOffset);
  }
  equals(other) {
    if (other instanceof _SliceLineTokens) {
      return this._startOffset === other._startOffset && this._endOffset === other._endOffset && this._deltaOffset === other._deltaOffset && this._source.slicedEquals(other._source, this._firstTokenIndex, this._tokensCount);
    }
    return false;
  }
  getCount() {
    return this._tokensCount;
  }
  getStandardTokenType(tokenIndex) {
    return this._source.getStandardTokenType(this._firstTokenIndex + tokenIndex);
  }
  getForeground(tokenIndex) {
    return this._source.getForeground(this._firstTokenIndex + tokenIndex);
  }
  getEndOffset(tokenIndex) {
    const tokenEndOffset = this._source.getEndOffset(this._firstTokenIndex + tokenIndex);
    return Math.min(this._endOffset, tokenEndOffset) - this._startOffset + this._deltaOffset;
  }
  getClassName(tokenIndex) {
    return this._source.getClassName(this._firstTokenIndex + tokenIndex);
  }
  getInlineStyle(tokenIndex, colorMap) {
    return this._source.getInlineStyle(this._firstTokenIndex + tokenIndex, colorMap);
  }
  getPresentation(tokenIndex) {
    return this._source.getPresentation(this._firstTokenIndex + tokenIndex);
  }
  findTokenIndexAtOffset(offset) {
    return this._source.findTokenIndexAtOffset(offset + this._startOffset - this._deltaOffset) - this._firstTokenIndex;
  }
  getTokenText(tokenIndex) {
    const adjustedTokenIndex = this._firstTokenIndex + tokenIndex;
    const tokenStartOffset = this._source.getStartOffset(adjustedTokenIndex);
    const tokenEndOffset = this._source.getEndOffset(adjustedTokenIndex);
    let text2 = this._source.getTokenText(adjustedTokenIndex);
    if (tokenStartOffset < this._startOffset) {
      text2 = text2.substring(this._startOffset - tokenStartOffset);
    }
    if (tokenEndOffset > this._endOffset) {
      text2 = text2.substring(0, text2.length - (tokenEndOffset - this._endOffset));
    }
    return text2;
  }
  forEach(callback) {
    for (let tokenIndex = 0; tokenIndex < this.getCount(); tokenIndex++) {
      callback(tokenIndex);
    }
  }
};

function getStandardTokenTypeAtPosition(model, position2) {
  const lineNumber = position2.lineNumber;
  if (!model.tokenization.isCheapToTokenize(lineNumber)) {
    return void 0;
  }
  model.tokenization.forceTokenization(lineNumber);
  const lineTokens = model.tokenization.getLineTokens(lineNumber);
  const tokenIndex = lineTokens.findTokenIndexAtOffset(position2.column - 1);
  const tokenType = lineTokens.getStandardTokenType(tokenIndex);
  return tokenType;
}

var TokenArray = class _TokenArray {
  constructor(_tokenInfo) {
    this._tokenInfo = _tokenInfo;
  }
  static fromLineTokens(lineTokens) {
    const tokenInfo = [];
    for (let i2 = 0; i2 < lineTokens.getCount(); i2++) {
      tokenInfo.push(new TokenInfo(lineTokens.getEndOffset(i2) - lineTokens.getStartOffset(i2), lineTokens.getMetadata(i2)));
    }
    return _TokenArray.create(tokenInfo);
  }
  static create(tokenInfo) {
    return new _TokenArray(tokenInfo);
  }
  toLineTokens(lineContent, decoder2) {
    return LineTokens.createFromTextAndMetadata(this.map((r2, t2) => ({ text: r2.substring(lineContent), metadata: t2.metadata })), decoder2);
  }
  forEach(cb) {
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range2 = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
      cb(range2, tokenInfo);
      lengthSum += tokenInfo.length;
    }
  }
  map(cb) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range2 = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
      result.push(cb(range2, tokenInfo));
      lengthSum += tokenInfo.length;
    }
    return result;
  }
  slice(range2) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const tokenStart = lengthSum;
      const tokenEndEx = tokenStart + tokenInfo.length;
      if (tokenEndEx > range2.start) {
        if (tokenStart >= range2.endExclusive) {
          break;
        }
        const deltaBefore = Math.max(0, range2.start - tokenStart);
        const deltaAfter = Math.max(0, tokenEndEx - range2.endExclusive);
        result.push(new TokenInfo(tokenInfo.length - deltaBefore - deltaAfter, tokenInfo.metadata));
      }
      lengthSum += tokenInfo.length;
    }
    return _TokenArray.create(result);
  }
  append(other) {
    const result = this._tokenInfo.concat(other._tokenInfo);
    return _TokenArray.create(result);
  }
};

var TokenInfo = class {
  constructor(length, metadata) {
    this.length = length;
    this.metadata = metadata;
  }
};

var TokenArrayBuilder = class {
  constructor() {
    this._tokens = [];
  }
  add(length, metadata) {
    this._tokens.push(new TokenInfo(length, metadata));
  }
  build() {
    return TokenArray.create(this._tokens);
  }
};
export { getStandardTokenTypeAtPosition, LineTokens, SliceLineTokens, TokenArray, TokenInfo, TokenArrayBuilder };
