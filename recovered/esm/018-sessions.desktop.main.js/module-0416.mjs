// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/treeSitter/treeSitterTokenizationImpl.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { runOnChange } from "./module-0064.mjs";
import { TokenStore } from "./module-0414.mjs";
import { autorun, autorunHandleChanges } from "./module-0052.mjs";
import { recordChanges } from "./module-0060.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { LineTokens } from "./module-0145.mjs";
import { Range2 } from "./module-0106.mjs";
import { isDefined } from "./module-0010.mjs";
import { findLikelyRelevantLines } from "./module-0413.mjs";
import { Position } from "./module-0079.mjs";
import { setTimeout0 } from "./module-0014.mjs";
import { StopWatch } from "./module-0016.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITreeSitterThemeService } from "./module-0415.mjs";


// src/vs/editor/common/model/tokens/treeSitter/treeSitterTokenizationImpl.ts
var TreeSitterTokenizationImpl = class extends Disposable {
  constructor(_tree, _highlightingQueries, _languageIdCodec, _visibleLineRanges, _treeSitterThemeService) {
    super();
    this._tree = _tree;
    this._highlightingQueries = _highlightingQueries;
    this._languageIdCodec = _languageIdCodec;
    this._visibleLineRanges = _visibleLineRanges;
    this._treeSitterThemeService = _treeSitterThemeService;
    this._onDidChangeTokens = this._register(new Emitter());
    this.onDidChangeTokens = this._onDidChangeTokens.event;
    this._onDidCompleteBackgroundTokenization = this._register(new Emitter());
    this.onDidChangeBackgroundTokenization = this._onDidCompleteBackgroundTokenization.event;
    this._encodedLanguageId = this._languageIdCodec.encodeLanguageId(this._tree.languageId);
    this._register(runOnChange(this._treeSitterThemeService.onChange, () => {
      this._updateTheme();
    }));
    this._tokenStore = this._register(new TokenStore(this._textModel));
    this._accurateVersion = this._textModel.getVersionId();
    this._guessVersion = this._textModel.getVersionId();
    this._tokenStore.buildStore(this._createEmptyTokens(), 0 /* None */);
    this._register(autorun((reader) => {
      const visibleLineRanges = this._visibleLineRanges.read(reader);
      this._parseAndTokenizeViewPort(visibleLineRanges);
    }));
    this._register(autorunHandleChanges({
      owner: this,
      changeTracker: recordChanges({ tree: this._tree.tree })
    }, (reader, ctx) => {
      const changeEvent = ctx.changes.at(0)?.change;
      if (ctx.changes.length > 1) {
        throw new BugIndicatingError("The tree changed twice in one transaction. This is currently not supported and should not happen.");
      }
      if (!changeEvent) {
        if (ctx.tree) {
          this._firstTreeUpdate(this._tree.treeLastParsedVersion.read(reader));
        }
      } else {
        if (this.hasTokens()) {
          for (const range2 of changeEvent.ranges) {
            this._markForRefresh(range2.newRange);
          }
        }
        if (!this.hasTokens()) {
          this._firstTreeUpdate(changeEvent.versionId);
        } else {
          this._handleTreeUpdate(changeEvent.ranges, changeEvent.versionId);
        }
      }
    }));
  }
  get _textModel() {
    return this._tree.textModel;
  }
  handleContentChanged(e4) {
    this._guessVersion = e4.versionId;
    for (const change of e4.changes) {
      if (change.text.length > change.rangeLength) {
        const offset = change.rangeOffset > 0 ? change.rangeOffset - 1 : change.rangeOffset;
        const oldToken = this._tokenStore.getTokenAt(offset);
        let newToken;
        if (oldToken) {
          newToken = { startOffsetInclusive: oldToken.startOffsetInclusive, length: oldToken.length + change.text.length - change.rangeLength, token: oldToken.token };
          this._tokenStore.markForRefresh(offset, change.rangeOffset + (change.text.length > change.rangeLength ? change.text.length : change.rangeLength));
        } else {
          newToken = { startOffsetInclusive: offset, length: change.text.length, token: 0 };
        }
        this._tokenStore.update(oldToken?.length ?? 0, [newToken], 2 /* EditGuess */);
      } else if (change.text.length < change.rangeLength) {
        const deletedCharCount = change.rangeLength - change.text.length;
        this._tokenStore.delete(deletedCharCount, change.rangeOffset);
      }
    }
  }
  getLineTokens(lineNumber) {
    const content = this._textModel.getLineContent(lineNumber);
    const rawTokens = this.getTokens(lineNumber);
    return new LineTokens(rawTokens, content, this._languageIdCodec);
  }
  _createEmptyTokens() {
    const emptyToken = this._emptyToken();
    const modelEndOffset = this._textModel.getValueLength();
    const emptyTokens = [this._emptyTokensForOffsetAndLength(0, modelEndOffset, emptyToken)];
    return emptyTokens;
  }
  _emptyToken() {
    return this._treeSitterThemeService.findMetadata([], this._encodedLanguageId, false, void 0);
  }
  _emptyTokensForOffsetAndLength(offset, length, emptyToken) {
    return { token: emptyToken, length: offset + length, startOffsetInclusive: 0 };
  }
  hasAccurateTokensForLine(lineNumber) {
    return this.hasTokens(new Range2(lineNumber, 1, lineNumber, this._textModel.getLineMaxColumn(lineNumber)));
  }
  tokenizeLinesAt(lineNumber, lines) {
    const rawLineTokens = this._guessTokensForLinesContent(lineNumber, lines);
    const lineTokens = [];
    if (!rawLineTokens) {
      return null;
    }
    for (let i2 = 0; i2 < rawLineTokens.length; i2++) {
      lineTokens.push(new LineTokens(rawLineTokens[i2], lines[i2], this._languageIdCodec));
    }
    return lineTokens;
  }
  _rangeHasTokens(range2, minimumTokenQuality) {
    return this._tokenStore.rangeHasTokens(this._textModel.getOffsetAt(range2.getStartPosition()), this._textModel.getOffsetAt(range2.getEndPosition()), minimumTokenQuality);
  }
  hasTokens(accurateForRange) {
    if (!accurateForRange || this._guessVersion === this._accurateVersion) {
      return true;
    }
    return !this._tokenStore.rangeNeedsRefresh(this._textModel.getOffsetAt(accurateForRange.getStartPosition()), this._textModel.getOffsetAt(accurateForRange.getEndPosition()));
  }
  getTokens(line) {
    const lineStartOffset = this._textModel.getOffsetAt({ lineNumber: line, column: 1 });
    const lineEndOffset = this._textModel.getOffsetAt({ lineNumber: line, column: this._textModel.getLineLength(line) + 1 });
    const lineTokens = this._tokenStore.getTokensInRange(lineStartOffset, lineEndOffset);
    const result = new Uint32Array(lineTokens.length * 2);
    for (let i2 = 0; i2 < lineTokens.length; i2++) {
      result[i2 * 2] = lineTokens[i2].startOffsetInclusive - lineStartOffset + lineTokens[i2].length;
      result[i2 * 2 + 1] = lineTokens[i2].token;
    }
    return result;
  }
  getTokensInRange(range2, rangeStartOffset, rangeEndOffset, captures) {
    const tokens = captures ? this._tokenizeCapturesWithMetadata(captures, rangeStartOffset, rangeEndOffset) : this._tokenize(range2, rangeStartOffset, rangeEndOffset);
    if (tokens?.endOffsetsAndMetadata) {
      return this._rangeTokensAsUpdates(rangeStartOffset, tokens.endOffsetsAndMetadata);
    }
    return void 0;
  }
  _updateTokensInStore(version2, updates, tokenQuality) {
    this._accurateVersion = version2;
    for (const update of updates) {
      const lastToken = update.newTokens.length > 0 ? update.newTokens[update.newTokens.length - 1] : void 0;
      let oldRangeLength;
      if (lastToken && this._guessVersion >= version2) {
        oldRangeLength = lastToken.startOffsetInclusive + lastToken.length - update.newTokens[0].startOffsetInclusive;
      } else if (update.oldRangeLength) {
        oldRangeLength = update.oldRangeLength;
      } else {
        oldRangeLength = 0;
      }
      this._tokenStore.update(oldRangeLength, update.newTokens, tokenQuality);
    }
  }
  _markForRefresh(range2) {
    this._tokenStore.markForRefresh(this._textModel.getOffsetAt(range2.getStartPosition()), this._textModel.getOffsetAt(range2.getEndPosition()));
  }
  _getNeedsRefresh() {
    const needsRefreshOffsetRanges = this._tokenStore.getNeedsRefresh();
    if (!needsRefreshOffsetRanges) {
      return [];
    }
    return needsRefreshOffsetRanges.map((range2) => ({
      range: Range2.fromPositions(this._textModel.getPositionAt(range2.startOffset), this._textModel.getPositionAt(range2.endOffset)),
      startOffset: range2.startOffset,
      endOffset: range2.endOffset
    }));
  }
  _parseAndTokenizeViewPort(lineRanges) {
    const viewportRanges = lineRanges.map((r2) => r2.toInclusiveRange()).filter(isDefined);
    for (const range2 of viewportRanges) {
      const startOffsetOfRangeInDocument = this._textModel.getOffsetAt(range2.getStartPosition());
      const endOffsetOfRangeInDocument = this._textModel.getOffsetAt(range2.getEndPosition());
      const version2 = this._textModel.getVersionId();
      if (this._rangeHasTokens(range2, 1 /* ViewportGuess */)) {
        continue;
      }
      const content = this._textModel.getValueInRange(range2);
      const tokenUpdates = this._forceParseAndTokenizeContent(range2, startOffsetOfRangeInDocument, endOffsetOfRangeInDocument, content, true);
      if (!tokenUpdates || this._rangeHasTokens(range2, 1 /* ViewportGuess */)) {
        continue;
      }
      if (tokenUpdates.length === 0) {
        continue;
      }
      const lastToken = tokenUpdates[tokenUpdates.length - 1];
      const oldRangeLength = lastToken.startOffsetInclusive + lastToken.length - tokenUpdates[0].startOffsetInclusive;
      this._updateTokensInStore(version2, [{ newTokens: tokenUpdates, oldRangeLength }], 1 /* ViewportGuess */);
      this._onDidChangeTokens.fire({ changes: { semanticTokensApplied: false, ranges: [{ fromLineNumber: range2.startLineNumber, toLineNumber: range2.endLineNumber }] } });
    }
  }
  _guessTokensForLinesContent(lineNumber, lines) {
    if (lines.length === 0) {
      return void 0;
    }
    const lineContent = lines.join(this._textModel.getEOL());
    const range2 = new Range2(1, 1, lineNumber + lines.length, lines[lines.length - 1].length + 1);
    const startOffset = this._textModel.getOffsetAt({ lineNumber, column: 1 });
    const tokens = this._forceParseAndTokenizeContent(range2, startOffset, startOffset + lineContent.length, lineContent, false);
    if (!tokens) {
      return void 0;
    }
    const tokensByLine = new Array(lines.length);
    let tokensIndex = 0;
    let tokenStartOffset = 0;
    let lineStartOffset = 0;
    for (let i2 = 0; i2 < lines.length; i2++) {
      const tokensForLine = [];
      let moveToNextLine = false;
      for (let j = tokensIndex; !moveToNextLine && j < tokens.length; j++) {
        const token = tokens[j];
        const lineAdjustedEndOffset = token.endOffset - lineStartOffset;
        const lineAdjustedStartOffset = tokenStartOffset - lineStartOffset;
        if (lineAdjustedEndOffset <= lines[i2].length) {
          tokensForLine.push({ endOffset: lineAdjustedEndOffset, metadata: token.metadata });
          tokensIndex++;
        } else if (lineAdjustedStartOffset < lines[i2].length) {
          const partialToken = { endOffset: lines[i2].length, metadata: token.metadata };
          tokensForLine.push(partialToken);
          moveToNextLine = true;
        } else {
          moveToNextLine = true;
        }
        tokenStartOffset = token.endOffset;
      }
      tokensByLine[i2] = this._endOffsetTokensToUint32Array(tokensForLine);
      lineStartOffset += lines[i2].length + this._textModel.getEOL().length;
    }
    return tokensByLine;
  }
  _forceParseAndTokenizeContent(range2, startOffsetOfRangeInDocument, endOffsetOfRangeInDocument, content, asUpdate) {
    const likelyRelevantLines = findLikelyRelevantLines(this._textModel, range2.startLineNumber).likelyRelevantLines;
    const likelyRelevantPrefix = likelyRelevantLines.join(this._textModel.getEOL());
    const tree = this._tree.createParsedTreeSync(`${likelyRelevantPrefix}${content}`);
    if (!tree) {
      return;
    }
    const treeRange = new Range2(1, 1, range2.endLineNumber - range2.startLineNumber + 1 + likelyRelevantLines.length, range2.endColumn);
    const captures = this.captureAtRange(treeRange);
    const tokens = this._tokenizeCapturesWithMetadata(captures, likelyRelevantPrefix.length, endOffsetOfRangeInDocument - startOffsetOfRangeInDocument + likelyRelevantPrefix.length);
    tree.delete();
    if (!tokens) {
      return;
    }
    if (asUpdate) {
      return this._rangeTokensAsUpdates(startOffsetOfRangeInDocument, tokens.endOffsetsAndMetadata, likelyRelevantPrefix.length);
    } else {
      return tokens.endOffsetsAndMetadata;
    }
  }
  _firstTreeUpdate(versionId) {
    return this._setViewPortTokens(versionId);
  }
  _setViewPortTokens(versionId) {
    const rangeChanges = this._visibleLineRanges.get().map((lineRange) => {
      const range2 = lineRange.toInclusiveRange();
      if (!range2) {
        return void 0;
      }
      const newRangeStartOffset = this._textModel.getOffsetAt(range2.getStartPosition());
      const newRangeEndOffset = this._textModel.getOffsetAt(range2.getEndPosition());
      return {
        newRange: range2,
        newRangeEndOffset,
        newRangeStartOffset
      };
    }).filter(isDefined);
    return this._handleTreeUpdate(rangeChanges, versionId);
  }
  /**
   * Do not await in this method, it will cause a race
   */
  _handleTreeUpdate(ranges, versionId) {
    const rangeChanges = [];
    const chunkSize = 1e3;
    for (let i2 = 0; i2 < ranges.length; i2++) {
      const rangeLinesLength = ranges[i2].newRange.endLineNumber - ranges[i2].newRange.startLineNumber;
      if (rangeLinesLength > chunkSize) {
        const fullRangeEndLineNumber = ranges[i2].newRange.endLineNumber;
        let chunkLineStart = ranges[i2].newRange.startLineNumber;
        let chunkColumnStart = ranges[i2].newRange.startColumn;
        let chunkLineEnd = chunkLineStart + chunkSize;
        do {
          const chunkStartingPosition = new Position(chunkLineStart, chunkColumnStart);
          const chunkEndColumn = chunkLineEnd === ranges[i2].newRange.endLineNumber ? ranges[i2].newRange.endColumn : this._textModel.getLineMaxColumn(chunkLineEnd);
          const chunkEndPosition = new Position(chunkLineEnd, chunkEndColumn);
          const chunkRange = Range2.fromPositions(chunkStartingPosition, chunkEndPosition);
          rangeChanges.push({
            range: chunkRange,
            startOffset: this._textModel.getOffsetAt(chunkRange.getStartPosition()),
            endOffset: this._textModel.getOffsetAt(chunkRange.getEndPosition())
          });
          chunkLineStart = chunkLineEnd + 1;
          chunkColumnStart = 1;
          if (chunkLineEnd < fullRangeEndLineNumber && chunkLineEnd + chunkSize > fullRangeEndLineNumber) {
            chunkLineEnd = fullRangeEndLineNumber;
          } else {
            chunkLineEnd = chunkLineEnd + chunkSize;
          }
        } while (chunkLineEnd <= fullRangeEndLineNumber);
      } else {
        if (i2 === 0 || rangeChanges[i2 - 1].endOffset < ranges[i2].newRangeStartOffset) {
          rangeChanges.push({
            range: ranges[i2].newRange,
            startOffset: ranges[i2].newRangeStartOffset,
            endOffset: ranges[i2].newRangeEndOffset
          });
        } else if (rangeChanges[i2 - 1].endOffset < ranges[i2].newRangeEndOffset) {
          const startPosition = this._textModel.getPositionAt(rangeChanges[i2 - 1].endOffset + 1);
          const range2 = new Range2(startPosition.lineNumber, startPosition.column, ranges[i2].newRange.endLineNumber, ranges[i2].newRange.endColumn);
          rangeChanges.push({
            range: range2,
            startOffset: rangeChanges[i2 - 1].endOffset + 1,
            endOffset: ranges[i2].newRangeEndOffset
          });
        }
      }
    }
    const captures = rangeChanges.map((range2) => this._getCaptures(range2.range));
    return this._updateTreeForRanges(rangeChanges, versionId, captures).then(() => {
      if (!this._textModel.isDisposed() && this._tree.treeLastParsedVersion.get() === this._textModel.getVersionId()) {
        this._refreshNeedsRefresh(versionId);
      }
    });
  }
  async _updateTreeForRanges(rangeChanges, versionId, captures) {
    let tokenUpdate;
    for (let i2 = 0; i2 < rangeChanges.length; i2++) {
      if (!this._textModel.isDisposed() && versionId !== this._textModel.getVersionId()) {
        break;
      }
      const capture = captures[i2];
      const range2 = rangeChanges[i2];
      const updates = this.getTokensInRange(range2.range, range2.startOffset, range2.endOffset, capture);
      if (updates) {
        tokenUpdate = { newTokens: updates };
      } else {
        tokenUpdate = { newTokens: [] };
      }
      this._updateTokensInStore(versionId, [tokenUpdate], 3 /* Accurate */);
      this._onDidChangeTokens.fire({
        changes: {
          semanticTokensApplied: false,
          ranges: [{ fromLineNumber: range2.range.getStartPosition().lineNumber, toLineNumber: range2.range.getEndPosition().lineNumber }]
        }
      });
      await new Promise((resolve3) => setTimeout0(resolve3));
    }
    this._onDidCompleteBackgroundTokenization.fire();
  }
  _refreshNeedsRefresh(versionId) {
    const rangesToRefresh = this._getNeedsRefresh();
    if (rangesToRefresh.length === 0) {
      return;
    }
    const rangeChanges = new Array(rangesToRefresh.length);
    for (let i2 = 0; i2 < rangesToRefresh.length; i2++) {
      const range2 = rangesToRefresh[i2];
      rangeChanges[i2] = {
        newRange: range2.range,
        newRangeStartOffset: range2.startOffset,
        newRangeEndOffset: range2.endOffset
      };
    }
    this._handleTreeUpdate(rangeChanges, versionId);
  }
  _rangeTokensAsUpdates(rangeOffset, endOffsetToken, startingOffsetInArray) {
    const updates = [];
    let lastEnd = 0;
    for (const token of endOffsetToken) {
      if (token.endOffset <= lastEnd || startingOffsetInArray && token.endOffset < startingOffsetInArray) {
        continue;
      }
      let tokenUpdate;
      if (startingOffsetInArray && lastEnd < startingOffsetInArray) {
        tokenUpdate = { startOffsetInclusive: rangeOffset + startingOffsetInArray, length: token.endOffset - startingOffsetInArray, token: token.metadata };
      } else {
        tokenUpdate = { startOffsetInclusive: rangeOffset + lastEnd, length: token.endOffset - lastEnd, token: token.metadata };
      }
      updates.push(tokenUpdate);
      lastEnd = token.endOffset;
    }
    return updates;
  }
  _updateTheme() {
    const modelRange = this._textModel.getFullModelRange();
    this._markForRefresh(modelRange);
    this._parseAndTokenizeViewPort(this._visibleLineRanges.get());
  }
  // Was used for inspect editor tokens command
  captureAtPosition(lineNumber, column) {
    const captures = this.captureAtRangeWithInjections(new Range2(lineNumber, column, lineNumber, column + 1));
    return captures;
  }
  // Was used for the colorization tests
  captureAtRangeTree(range2) {
    const captures = this.captureAtRangeWithInjections(range2);
    return captures;
  }
  captureAtRange(range2) {
    const tree = this._tree.tree.get();
    if (!tree) {
      return [];
    }
    return this._highlightingQueries.captures(tree.rootNode, { startPosition: { row: range2.startLineNumber - 1, column: range2.startColumn - 1 }, endPosition: { row: range2.endLineNumber - 1, column: range2.endColumn - 1 } }).map((capture) => ({
      name: capture.name,
      text: capture.node.text,
      node: {
        startIndex: capture.node.startIndex,
        endIndex: capture.node.endIndex,
        startPosition: {
          lineNumber: capture.node.startPosition.row + 1,
          column: capture.node.startPosition.column + 1
        },
        endPosition: {
          lineNumber: capture.node.endPosition.row + 1,
          column: capture.node.endPosition.column + 1
        }
      },
      encodedLanguageId: this._encodedLanguageId
    }));
  }
  captureAtRangeWithInjections(range2) {
    const captures = this.captureAtRange(range2);
    for (let i2 = 0; i2 < captures.length; i2++) {
      const capture = captures[i2];
      const capStartLine = capture.node.startPosition.lineNumber;
      const capEndLine = capture.node.endPosition.lineNumber;
      const capStartColumn = capture.node.startPosition.column;
      const capEndColumn = capture.node.endPosition.column;
      const startLine = capStartLine > range2.startLineNumber && capStartLine < range2.endLineNumber ? capStartLine : range2.startLineNumber;
      const endLine = capEndLine > range2.startLineNumber && capEndLine < range2.endLineNumber ? capEndLine : range2.endLineNumber;
      const startColumn = capStartLine === range2.startLineNumber ? capStartColumn < range2.startColumn ? range2.startColumn : capStartColumn : capStartLine < range2.startLineNumber ? range2.startColumn : capStartColumn;
      const endColumn = capEndLine === range2.endLineNumber ? capEndColumn > range2.endColumn ? range2.endColumn : capEndColumn : capEndLine > range2.endLineNumber ? range2.endColumn : capEndColumn;
      const injectionRange = new Range2(startLine, startColumn, endLine, endColumn);
      const injection = this._getInjectionCaptures(capture, injectionRange);
      if (injection && injection.length > 0) {
        captures.splice(i2 + 1, 0, ...injection);
        i2 += injection.length;
      }
    }
    return captures;
  }
  /**
   * Gets the tokens for a given line.
   * Each token takes 2 elements in the array. The first element is the offset of the end of the token *in the line, not in the document*, and the second element is the metadata.
   *
   * @param lineNumber
   * @returns
   */
  tokenizeEncoded(lineNumber) {
    const tokens = this._tokenizeEncoded(lineNumber);
    if (!tokens) {
      return void 0;
    }
    const updates = this._rangeTokensAsUpdates(this._textModel.getOffsetAt({ lineNumber, column: 1 }), tokens.result);
    if (tokens.versionId === this._textModel.getVersionId()) {
      this._updateTokensInStore(tokens.versionId, [{ newTokens: updates, oldRangeLength: this._textModel.getLineLength(lineNumber) }], 3 /* Accurate */);
    }
  }
  tokenizeEncodedInstrumented(lineNumber) {
    const tokens = this._tokenizeEncoded(lineNumber);
    if (!tokens) {
      return void 0;
    }
    return { result: this._endOffsetTokensToUint32Array(tokens.result), captureTime: tokens.captureTime, metadataTime: tokens.metadataTime };
  }
  _getCaptures(range2) {
    const captures = this.captureAtRangeWithInjections(range2);
    return captures;
  }
  _tokenize(range2, rangeStartOffset, rangeEndOffset) {
    const captures = this._getCaptures(range2);
    const result = this._tokenizeCapturesWithMetadata(captures, rangeStartOffset, rangeEndOffset);
    if (!result) {
      return void 0;
    }
    return { ...result, versionId: this._tree.treeLastParsedVersion.get() };
  }
  _createTokensFromCaptures(captures, rangeStartOffset, rangeEndOffset) {
    const tree = this._tree.tree.get();
    const stopwatch = StopWatch.create();
    const rangeLength = rangeEndOffset - rangeStartOffset;
    const encodedLanguageId = this._languageIdCodec.encodeLanguageId(this._tree.languageId);
    const baseScope = TREESITTER_BASE_SCOPES[this._tree.languageId] || "source";
    if (captures.length === 0) {
      if (tree) {
        stopwatch.stop();
        const endOffsetsAndMetadata = [{ endOffset: rangeLength, scopes: [], encodedLanguageId }];
        return { endOffsets: endOffsetsAndMetadata, captureTime: stopwatch.elapsed() };
      }
      return void 0;
    }
    const endOffsetsAndScopes = Array(captures.length);
    endOffsetsAndScopes.fill({ endOffset: 0, scopes: [baseScope], encodedLanguageId });
    let tokenIndex = 0;
    const increaseSizeOfTokensByOneToken = () => {
      endOffsetsAndScopes.push({ endOffset: 0, scopes: [baseScope], encodedLanguageId });
    };
    const brackets = (capture, startOffset) => {
      return capture.name.includes("punctuation") && capture.text ? Array.from(capture.text.matchAll(BRACKETS)).map((match2) => startOffset + match2.index) : void 0;
    };
    const addCurrentTokenToArray = (capture, startOffset, endOffset, position2) => {
      if (position2 !== void 0) {
        const oldScopes = endOffsetsAndScopes[position2].scopes;
        let oldBracket = endOffsetsAndScopes[position2].bracket;
        const prevEndOffset = position2 > 0 ? endOffsetsAndScopes[position2 - 1].endOffset : 0;
        if (prevEndOffset !== startOffset) {
          let preInsertBracket = void 0;
          if (oldBracket && oldBracket.length > 0) {
            preInsertBracket = [];
            const postInsertBracket = [];
            for (let i2 = 0; i2 < oldBracket.length; i2++) {
              const bracket = oldBracket[i2];
              if (bracket < startOffset) {
                preInsertBracket.push(bracket);
              } else if (bracket > endOffset) {
                postInsertBracket.push(bracket);
              }
            }
            if (preInsertBracket.length === 0) {
              preInsertBracket = void 0;
            }
            if (postInsertBracket.length === 0) {
              oldBracket = void 0;
            } else {
              oldBracket = postInsertBracket;
            }
          }
          endOffsetsAndScopes.splice(position2, 0, { endOffset: startOffset, scopes: [...oldScopes], bracket: preInsertBracket, encodedLanguageId: capture.encodedLanguageId });
          position2++;
          increaseSizeOfTokensByOneToken();
          tokenIndex++;
        }
        endOffsetsAndScopes.splice(position2, 0, { endOffset, scopes: [...oldScopes, capture.name], bracket: brackets(capture, startOffset), encodedLanguageId: capture.encodedLanguageId });
        endOffsetsAndScopes[tokenIndex].bracket = oldBracket;
      } else {
        endOffsetsAndScopes[tokenIndex] = { endOffset, scopes: [baseScope, capture.name], bracket: brackets(capture, startOffset), encodedLanguageId: capture.encodedLanguageId };
      }
      tokenIndex++;
    };
    for (let captureIndex = 0; captureIndex < captures.length; captureIndex++) {
      const capture = captures[captureIndex];
      const tokenEndIndex = capture.node.endIndex < rangeEndOffset ? capture.node.endIndex < rangeStartOffset ? rangeStartOffset : capture.node.endIndex : rangeEndOffset;
      const tokenStartIndex = capture.node.startIndex < rangeStartOffset ? rangeStartOffset : capture.node.startIndex;
      const endOffset = tokenEndIndex - rangeStartOffset;
      let previousEndOffset;
      const currentTokenLength = tokenEndIndex - tokenStartIndex;
      if (captureIndex > 0) {
        previousEndOffset = endOffsetsAndScopes[tokenIndex - 1].endOffset;
      } else {
        previousEndOffset = tokenStartIndex - rangeStartOffset - 1;
      }
      const startOffset = endOffset - currentTokenLength;
      if (previousEndOffset >= 0 && previousEndOffset < startOffset) {
        endOffsetsAndScopes[tokenIndex] = { endOffset: startOffset, scopes: [baseScope], encodedLanguageId: this._encodedLanguageId };
        tokenIndex++;
        increaseSizeOfTokensByOneToken();
      }
      if (currentTokenLength < 0) {
        continue;
      }
      if (previousEndOffset >= endOffset) {
        let withinTokenIndex = tokenIndex - 1;
        let previousTokenEndOffset = endOffsetsAndScopes[withinTokenIndex].endOffset;
        let previousTokenStartOffset = withinTokenIndex >= 2 ? endOffsetsAndScopes[withinTokenIndex - 1].endOffset : 0;
        do {
          if (previousTokenStartOffset + currentTokenLength === previousTokenEndOffset) {
            if (previousTokenStartOffset === startOffset) {
              endOffsetsAndScopes[withinTokenIndex].scopes.push(capture.name);
              const oldBracket = endOffsetsAndScopes[withinTokenIndex].bracket;
              endOffsetsAndScopes[withinTokenIndex].bracket = oldBracket && oldBracket.length > 0 ? oldBracket : brackets(capture, startOffset);
            }
          } else if (previousTokenStartOffset <= startOffset) {
            addCurrentTokenToArray(capture, startOffset, endOffset, withinTokenIndex);
            break;
          }
          withinTokenIndex--;
          previousTokenStartOffset = withinTokenIndex >= 1 ? endOffsetsAndScopes[withinTokenIndex - 1].endOffset : 0;
          previousTokenEndOffset = withinTokenIndex >= 0 ? endOffsetsAndScopes[withinTokenIndex].endOffset : 0;
        } while (previousTokenEndOffset > startOffset);
      } else {
        addCurrentTokenToArray(capture, startOffset, endOffset);
      }
    }
    if (endOffsetsAndScopes[tokenIndex - 1].endOffset < rangeLength) {
      if (rangeLength - endOffsetsAndScopes[tokenIndex - 1].endOffset > 0) {
        increaseSizeOfTokensByOneToken();
        endOffsetsAndScopes[tokenIndex] = { endOffset: rangeLength, scopes: endOffsetsAndScopes[tokenIndex].scopes, encodedLanguageId: this._encodedLanguageId };
        tokenIndex++;
      }
    }
    for (let i2 = 0; i2 < endOffsetsAndScopes.length; i2++) {
      const token = endOffsetsAndScopes[i2];
      if (token.endOffset === 0 && i2 !== 0) {
        endOffsetsAndScopes.splice(i2, endOffsetsAndScopes.length - i2);
        break;
      }
    }
    const captureTime = stopwatch.elapsed();
    return { endOffsets: endOffsetsAndScopes, captureTime };
  }
  _getInjectionCaptures(parentCapture, range2) {
    return [];
  }
  _tokenizeCapturesWithMetadata(captures, rangeStartOffset, rangeEndOffset) {
    const stopwatch = StopWatch.create();
    const emptyTokens = this._createTokensFromCaptures(captures, rangeStartOffset, rangeEndOffset);
    if (!emptyTokens) {
      return void 0;
    }
    const endOffsetsAndScopes = emptyTokens.endOffsets;
    for (let i2 = 0; i2 < endOffsetsAndScopes.length; i2++) {
      const token = endOffsetsAndScopes[i2];
      token.metadata = this._treeSitterThemeService.findMetadata(token.scopes, token.encodedLanguageId, !!token.bracket && token.bracket.length > 0, void 0);
    }
    const metadataTime = stopwatch.elapsed();
    return { endOffsetsAndMetadata: endOffsetsAndScopes, captureTime: emptyTokens.captureTime, metadataTime };
  }
  _tokenizeEncoded(lineNumber) {
    const lineOffset = this._textModel.getOffsetAt({ lineNumber, column: 1 });
    const maxLine = this._textModel.getLineCount();
    const lineEndOffset = lineNumber + 1 <= maxLine ? this._textModel.getOffsetAt({ lineNumber: lineNumber + 1, column: 1 }) : this._textModel.getValueLength();
    const lineLength = lineEndOffset - lineOffset;
    const result = this._tokenize(new Range2(lineNumber, 1, lineNumber, lineLength + 1), lineOffset, lineEndOffset);
    if (!result) {
      return void 0;
    }
    return { result: result.endOffsetsAndMetadata, captureTime: result.captureTime, metadataTime: result.metadataTime, versionId: result.versionId };
  }
  _endOffsetTokensToUint32Array(endOffsetsAndMetadata) {
    const uint32Array = new Uint32Array(endOffsetsAndMetadata.length * 2);
    for (let i2 = 0; i2 < endOffsetsAndMetadata.length; i2++) {
      uint32Array[i2 * 2] = endOffsetsAndMetadata[i2].endOffset;
      uint32Array[i2 * 2 + 1] = endOffsetsAndMetadata[i2].metadata;
    }
    return uint32Array;
  }
};

TreeSitterTokenizationImpl = __decorateClass([
  __decorateParam(4, ITreeSitterThemeService)
], TreeSitterTokenizationImpl);

var TREESITTER_BASE_SCOPES = {
  "css": "source.css",
  "typescript": "source.ts",
  "ini": "source.ini",
  "regex": "source.regex"
};

var BRACKETS = /[\{\}\[\]\<\>\(\)]/g;
export { TreeSitterTokenizationImpl, TREESITTER_BASE_SCOPES, BRACKETS };
