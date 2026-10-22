// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.ts
import { lengthAdd, lengthDiff, lengthGetColumnCountIfZeroLineCount, lengthToObj, lengthZero, toLength } from "./module-0379.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { SmallImmutableSet } from "./module-0380.mjs";
import { TextAstNode } from "./module-0381.mjs";
import { NotSupportedError } from "./module-0004.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.ts
var Token3 = class {
  constructor(length, kind, bracketId, bracketIds, astNode) {
    this.length = length;
    this.kind = kind;
    this.bracketId = bracketId;
    this.bracketIds = bracketIds;
    this.astNode = astNode;
  }
};

var TextBufferTokenizer = class {
  constructor(textModel, bracketTokens) {
    this.textModel = textModel;
    this.bracketTokens = bracketTokens;
    this.reader = new NonPeekableTextBufferTokenizer(this.textModel, this.bracketTokens);
    this._offset = lengthZero;
    this.didPeek = false;
    this.peeked = null;
    this.textBufferLineCount = textModel.getLineCount();
    this.textBufferLastLineLength = textModel.getLineLength(this.textBufferLineCount);
  }
  get offset() {
    return this._offset;
  }
  get length() {
    return toLength(this.textBufferLineCount - 1, this.textBufferLastLineLength);
  }
  getText() {
    return this.textModel.getValue();
  }
  skip(length) {
    this.didPeek = false;
    this._offset = lengthAdd(this._offset, length);
    const obj = lengthToObj(this._offset);
    this.reader.setPosition(obj.lineCount, obj.columnCount);
  }
  read() {
    let token;
    if (this.peeked) {
      this.didPeek = false;
      token = this.peeked;
    } else {
      token = this.reader.read();
    }
    if (token) {
      this._offset = lengthAdd(this._offset, token.length);
    }
    return token;
  }
  peek() {
    if (!this.didPeek) {
      this.peeked = this.reader.read();
      this.didPeek = true;
    }
    return this.peeked;
  }
};

var NonPeekableTextBufferTokenizer = class {
  constructor(textModel, bracketTokens) {
    this.textModel = textModel;
    this.bracketTokens = bracketTokens;
    this.lineIdx = 0;
    this.line = null;
    this.lineCharOffset = 0;
    this.lineTokens = null;
    this.lineTokenOffset = 0;
    /** Must be a zero line token. The end of the document cannot be peeked. */
    this.peekedToken = null;
    this.textBufferLineCount = textModel.getLineCount();
    this.textBufferLastLineLength = textModel.getLineLength(this.textBufferLineCount);
  }
  setPosition(lineIdx, column) {
    if (lineIdx === this.lineIdx) {
      this.lineCharOffset = column;
      if (this.line !== null) {
        this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(this.lineCharOffset);
      }
    } else {
      this.lineIdx = lineIdx;
      this.lineCharOffset = column;
      this.line = null;
    }
    this.peekedToken = null;
  }
  read() {
    if (this.peekedToken) {
      const token = this.peekedToken;
      this.peekedToken = null;
      this.lineCharOffset += lengthGetColumnCountIfZeroLineCount(token.length);
      return token;
    }
    if (this.lineIdx > this.textBufferLineCount - 1 || this.lineIdx === this.textBufferLineCount - 1 && this.lineCharOffset >= this.textBufferLastLineLength) {
      return null;
    }
    if (this.line === null) {
      this.lineTokens = this.textModel.tokenization.getLineTokens(this.lineIdx + 1);
      this.line = this.lineTokens.getLineContent();
      this.lineTokenOffset = this.lineCharOffset === 0 ? 0 : this.lineTokens.findTokenIndexAtOffset(this.lineCharOffset);
    }
    const startLineIdx = this.lineIdx;
    const startLineCharOffset = this.lineCharOffset;
    let lengthHeuristic = 0;
    while (true) {
      const lineTokens = this.lineTokens;
      const tokenCount = lineTokens.getCount();
      let peekedBracketToken = null;
      if (this.lineTokenOffset < tokenCount) {
        const tokenMetadata = lineTokens.getMetadata(this.lineTokenOffset);
        while (this.lineTokenOffset + 1 < tokenCount && tokenMetadata === lineTokens.getMetadata(this.lineTokenOffset + 1)) {
          this.lineTokenOffset++;
        }
        const isOther = TokenMetadata.getTokenType(tokenMetadata) === 0 /* Other */;
        const containsBracketType = TokenMetadata.containsBalancedBrackets(tokenMetadata);
        const endOffset = lineTokens.getEndOffset(this.lineTokenOffset);
        if (containsBracketType && isOther && this.lineCharOffset < endOffset) {
          const languageId = lineTokens.getLanguageId(this.lineTokenOffset);
          const text2 = this.line.substring(this.lineCharOffset, endOffset);
          const brackets = this.bracketTokens.getSingleLanguageBracketTokens(languageId);
          const regexp2 = brackets.regExpGlobal;
          if (regexp2) {
            regexp2.lastIndex = 0;
            const match2 = regexp2.exec(text2);
            if (match2) {
              peekedBracketToken = brackets.getToken(match2[0]);
              if (peekedBracketToken) {
                this.lineCharOffset += match2.index;
              }
            }
          }
        }
        lengthHeuristic += endOffset - this.lineCharOffset;
        if (peekedBracketToken) {
          if (startLineIdx !== this.lineIdx || startLineCharOffset !== this.lineCharOffset) {
            this.peekedToken = peekedBracketToken;
            break;
          } else {
            this.lineCharOffset += lengthGetColumnCountIfZeroLineCount(peekedBracketToken.length);
            return peekedBracketToken;
          }
        } else {
          this.lineTokenOffset++;
          this.lineCharOffset = endOffset;
        }
      } else {
        if (this.lineIdx === this.textBufferLineCount - 1) {
          break;
        }
        this.lineIdx++;
        this.lineTokens = this.textModel.tokenization.getLineTokens(this.lineIdx + 1);
        this.lineTokenOffset = 0;
        this.line = this.lineTokens.getLineContent();
        this.lineCharOffset = 0;
        lengthHeuristic += 33;
        if (lengthHeuristic > 1e3) {
          break;
        }
      }
      if (lengthHeuristic > 1500) {
        break;
      }
    }
    const length = lengthDiff(startLineIdx, startLineCharOffset, this.lineIdx, this.lineCharOffset);
    return new Token3(length, 0 /* Text */, -1, SmallImmutableSet.getEmpty(), new TextAstNode(length));
  }
};

var FastTokenizer = class {
  constructor(text2, brackets) {
    this.text = text2;
    this._offset = lengthZero;
    this.idx = 0;
    const regExpStr = brackets.getRegExpStr();
    const regexp2 = regExpStr ? new RegExp(regExpStr + "|\n", "gi") : null;
    const tokens = [];
    let match2;
    let curLineCount = 0;
    let lastLineBreakOffset = 0;
    let lastTokenEndOffset = 0;
    let lastTokenEndLine = 0;
    const smallTextTokens0Line = [];
    for (let i2 = 0; i2 < 60; i2++) {
      smallTextTokens0Line.push(
        new Token3(
          toLength(0, i2),
          0 /* Text */,
          -1,
          SmallImmutableSet.getEmpty(),
          new TextAstNode(toLength(0, i2))
        )
      );
    }
    const smallTextTokens1Line = [];
    for (let i2 = 0; i2 < 60; i2++) {
      smallTextTokens1Line.push(
        new Token3(
          toLength(1, i2),
          0 /* Text */,
          -1,
          SmallImmutableSet.getEmpty(),
          new TextAstNode(toLength(1, i2))
        )
      );
    }
    if (regexp2) {
      regexp2.lastIndex = 0;
      while ((match2 = regexp2.exec(text2)) !== null) {
        const curOffset = match2.index;
        const value2 = match2[0];
        if (value2 === "\n") {
          curLineCount++;
          lastLineBreakOffset = curOffset + 1;
        } else {
          if (lastTokenEndOffset !== curOffset) {
            let token;
            if (lastTokenEndLine === curLineCount) {
              const colCount = curOffset - lastTokenEndOffset;
              if (colCount < smallTextTokens0Line.length) {
                token = smallTextTokens0Line[colCount];
              } else {
                const length = toLength(0, colCount);
                token = new Token3(length, 0 /* Text */, -1, SmallImmutableSet.getEmpty(), new TextAstNode(length));
              }
            } else {
              const lineCount = curLineCount - lastTokenEndLine;
              const colCount = curOffset - lastLineBreakOffset;
              if (lineCount === 1 && colCount < smallTextTokens1Line.length) {
                token = smallTextTokens1Line[colCount];
              } else {
                const length = toLength(lineCount, colCount);
                token = new Token3(length, 0 /* Text */, -1, SmallImmutableSet.getEmpty(), new TextAstNode(length));
              }
            }
            tokens.push(token);
          }
          tokens.push(brackets.getToken(value2));
          lastTokenEndOffset = curOffset + value2.length;
          lastTokenEndLine = curLineCount;
        }
      }
    }
    const offset = text2.length;
    if (lastTokenEndOffset !== offset) {
      const length = lastTokenEndLine === curLineCount ? toLength(0, offset - lastTokenEndOffset) : toLength(curLineCount - lastTokenEndLine, offset - lastLineBreakOffset);
      tokens.push(new Token3(length, 0 /* Text */, -1, SmallImmutableSet.getEmpty(), new TextAstNode(length)));
    }
    this.length = toLength(curLineCount, offset - lastLineBreakOffset);
    this.tokens = tokens;
  }
  get offset() {
    return this._offset;
  }
  read() {
    return this.tokens[this.idx++] || null;
  }
  peek() {
    return this.tokens[this.idx] || null;
  }
  skip(length) {
    throw new NotSupportedError();
  }
  getText() {
    return this.text;
  }
};
export { Token3, TextBufferTokenizer, NonPeekableTextBufferTokenizer, FastTokenizer };
