// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/tokenWithTextArray.ts
import { LineTokens } from "./module-0145.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/common/tokens/tokenWithTextArray.ts
var TokenWithTextArray = class _TokenWithTextArray {
  constructor(_tokenInfo) {
    this._tokenInfo = _tokenInfo;
  }
  static fromLineTokens(lineTokens) {
    const tokenInfo = [];
    for (let i2 = 0; i2 < lineTokens.getCount(); i2++) {
      tokenInfo.push(new TokenWithTextInfo(lineTokens.getTokenText(i2), lineTokens.getMetadata(i2)));
    }
    return _TokenWithTextArray.create(tokenInfo);
  }
  static create(tokenInfo) {
    return new _TokenWithTextArray(tokenInfo);
  }
  toLineTokens(decoder2) {
    return LineTokens.createFromTextAndMetadata(this.map((_r, t2) => ({ text: t2.text, metadata: t2.metadata })), decoder2);
  }
  forEach(cb) {
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range2 = new OffsetRange(lengthSum, lengthSum + tokenInfo.text.length);
      cb(range2, tokenInfo);
      lengthSum += tokenInfo.text.length;
    }
  }
  map(cb) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const range2 = new OffsetRange(lengthSum, lengthSum + tokenInfo.text.length);
      result.push(cb(range2, tokenInfo));
      lengthSum += tokenInfo.text.length;
    }
    return result;
  }
  slice(range2) {
    const result = [];
    let lengthSum = 0;
    for (const tokenInfo of this._tokenInfo) {
      const tokenStart = lengthSum;
      const tokenEndEx = tokenStart + tokenInfo.text.length;
      if (tokenEndEx > range2.start) {
        if (tokenStart >= range2.endExclusive) {
          break;
        }
        const deltaBefore = Math.max(0, range2.start - tokenStart);
        const deltaAfter = Math.max(0, tokenEndEx - range2.endExclusive);
        result.push(new TokenWithTextInfo(tokenInfo.text.slice(deltaBefore, tokenInfo.text.length - deltaAfter), tokenInfo.metadata));
      }
      lengthSum += tokenInfo.text.length;
    }
    return _TokenWithTextArray.create(result);
  }
  append(other) {
    const result = this._tokenInfo.concat(other._tokenInfo);
    return _TokenWithTextArray.create(result);
  }
};

var TokenWithTextInfo = class {
  constructor(text2, metadata) {
    this.text = text2;
    this.metadata = metadata;
  }
};
export { TokenWithTextArray, TokenWithTextInfo };
