// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/viewModelLines.ts
import { Range2 } from "./module-0106.mjs";
import { createModelLineProjection } from "./module-0435.mjs";
import { ConstantTimePrefixSumComputer } from "./module-0200.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent } from "./module-0155.mjs";
import { Position } from "./module-0079.mjs";
import { IndentGuide, IndentGuideHorizontalLine } from "./module-0295.mjs";
import { IdentityCoordinatesConverter } from "./module-0436.mjs";
import { ViewLineData } from "./module-0315.mjs";


// src/vs/editor/common/viewModel/viewModelLines.ts
var ViewModelLinesFromProjectedModel = class {
  constructor(editorId, model, domLineBreaksComputerFactory, monospaceLineBreaksComputerFactory, fontInfo, tabSize, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak, wrapOnEscapedLineFeeds) {
    this._editorId = editorId;
    this.model = model;
    this._validModelVersionId = -1;
    this._domLineBreaksComputerFactory = domLineBreaksComputerFactory;
    this._monospaceLineBreaksComputerFactory = monospaceLineBreaksComputerFactory;
    this.fontInfo = fontInfo;
    this.tabSize = tabSize;
    this.wrappingStrategy = wrappingStrategy;
    this.wrappingColumn = wrappingColumn;
    this.wrappingIndent = wrappingIndent;
    this.wordBreak = wordBreak;
    this.wrapOnEscapedLineFeeds = wrapOnEscapedLineFeeds;
    this._constructLines(
      /*resetHiddenAreas*/
      true,
      null
    );
  }
  dispose() {
    this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, []);
  }
  createCoordinatesConverter() {
    return new CoordinatesConverter(this);
  }
  _constructLines(resetHiddenAreas, previousLineBreaks) {
    this.modelLineProjections = [];
    if (resetHiddenAreas) {
      this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, []);
    }
    const linesContent = this.model.getLinesContent();
    const lineCount = linesContent.length;
    const lineBreaksComputer = this.createLineBreaksComputer();
    for (let i2 = 0; i2 < lineCount; i2++) {
      lineBreaksComputer.addRequest(i2 + 1, previousLineBreaks ? previousLineBreaks[i2] : null);
    }
    const linesBreaks = lineBreaksComputer.finalize();
    const values = [];
    const hiddenAreas = this.hiddenAreasDecorationIds.map((areaId) => this.model.getDecorationRange(areaId)).sort(Range2.compareRangesUsingStarts);
    let hiddenAreaStart = 1, hiddenAreaEnd = 0;
    let hiddenAreaIdx = -1;
    let nextLineNumberToUpdateHiddenArea = hiddenAreaIdx + 1 < hiddenAreas.length ? hiddenAreaEnd + 1 : lineCount + 2;
    for (let i2 = 0; i2 < lineCount; i2++) {
      const lineNumber = i2 + 1;
      if (lineNumber === nextLineNumberToUpdateHiddenArea) {
        hiddenAreaIdx++;
        hiddenAreaStart = hiddenAreas[hiddenAreaIdx].startLineNumber;
        hiddenAreaEnd = hiddenAreas[hiddenAreaIdx].endLineNumber;
        nextLineNumberToUpdateHiddenArea = hiddenAreaIdx + 1 < hiddenAreas.length ? hiddenAreaEnd + 1 : lineCount + 2;
      }
      const isInHiddenArea = lineNumber >= hiddenAreaStart && lineNumber <= hiddenAreaEnd;
      const line = createModelLineProjection(linesBreaks[i2], !isInHiddenArea);
      values[i2] = line.getViewLineCount();
      this.modelLineProjections[i2] = line;
    }
    this._validModelVersionId = this.model.getVersionId();
    this.projectedModelLineLineCounts = new ConstantTimePrefixSumComputer(values);
    this._ensureAtLeastOneVisibleLine();
  }
  getHiddenAreas() {
    return this.hiddenAreasDecorationIds.map(
      (decId) => this.model.getDecorationRange(decId)
    );
  }
  setHiddenAreas(_ranges) {
    const validatedRanges = _ranges.map((r2) => this.model.validateRange(r2));
    const newRanges = normalizeLineRanges(validatedRanges);
    const oldRanges = this.hiddenAreasDecorationIds.map((areaId) => this.model.getDecorationRange(areaId)).sort(Range2.compareRangesUsingStarts);
    if (newRanges.length === oldRanges.length) {
      let hasDifference = false;
      for (let i2 = 0; i2 < newRanges.length; i2++) {
        if (!newRanges[i2].equalsRange(oldRanges[i2])) {
          hasDifference = true;
          break;
        }
      }
      if (!hasDifference) {
        return false;
      }
    }
    const newDecorations = newRanges.map(
      (r2) => ({
        range: r2,
        options: ModelDecorationOptions.EMPTY
      })
    );
    this.hiddenAreasDecorationIds = this.model.deltaDecorations(this.hiddenAreasDecorationIds, newDecorations);
    const hiddenAreas = newRanges;
    let hiddenAreaStart = 1, hiddenAreaEnd = 0;
    let hiddenAreaIdx = -1;
    let nextLineNumberToUpdateHiddenArea = hiddenAreaIdx + 1 < hiddenAreas.length ? hiddenAreaEnd + 1 : this.modelLineProjections.length + 2;
    let hasVisibleLine = false;
    for (let i2 = 0; i2 < this.modelLineProjections.length; i2++) {
      const lineNumber = i2 + 1;
      if (lineNumber === nextLineNumberToUpdateHiddenArea) {
        hiddenAreaIdx++;
        hiddenAreaStart = hiddenAreas[hiddenAreaIdx].startLineNumber;
        hiddenAreaEnd = hiddenAreas[hiddenAreaIdx].endLineNumber;
        nextLineNumberToUpdateHiddenArea = hiddenAreaIdx + 1 < hiddenAreas.length ? hiddenAreaEnd + 1 : this.modelLineProjections.length + 2;
      }
      let lineChanged = false;
      if (lineNumber >= hiddenAreaStart && lineNumber <= hiddenAreaEnd) {
        if (this.modelLineProjections[i2].isVisible()) {
          this.modelLineProjections[i2] = this.modelLineProjections[i2].setVisible(false);
          lineChanged = true;
        }
      } else {
        hasVisibleLine = true;
        if (!this.modelLineProjections[i2].isVisible()) {
          this.modelLineProjections[i2] = this.modelLineProjections[i2].setVisible(true);
          lineChanged = true;
        }
      }
      if (lineChanged) {
        const newOutputLineCount = this.modelLineProjections[i2].getViewLineCount();
        this.projectedModelLineLineCounts.setValue(i2, newOutputLineCount);
      }
    }
    if (!hasVisibleLine) {
      this.setHiddenAreas([]);
    }
    return true;
  }
  modelPositionIsVisible(modelLineNumber, _modelColumn) {
    if (modelLineNumber < 1 || modelLineNumber > this.modelLineProjections.length) {
      return false;
    }
    return this.modelLineProjections[modelLineNumber - 1].isVisible();
  }
  getModelLineViewLineCount(modelLineNumber) {
    if (modelLineNumber < 1 || modelLineNumber > this.modelLineProjections.length) {
      return 1;
    }
    return this.modelLineProjections[modelLineNumber - 1].getViewLineCount();
  }
  setTabSize(newTabSize) {
    if (this.tabSize === newTabSize) {
      return false;
    }
    this.tabSize = newTabSize;
    this._constructLines(
      /*resetHiddenAreas*/
      false,
      null
    );
    return true;
  }
  setWrappingSettings(fontInfo, wrappingStrategy, wrappingColumn, wrappingIndent, wordBreak) {
    const equalFontInfo = this.fontInfo.equals(fontInfo);
    const equalWrappingStrategy = this.wrappingStrategy === wrappingStrategy;
    const equalWrappingColumn = this.wrappingColumn === wrappingColumn;
    const equalWrappingIndent = this.wrappingIndent === wrappingIndent;
    const equalWordBreak = this.wordBreak === wordBreak;
    if (equalFontInfo && equalWrappingStrategy && equalWrappingColumn && equalWrappingIndent && equalWordBreak) {
      return false;
    }
    const onlyWrappingColumnChanged = equalFontInfo && equalWrappingStrategy && !equalWrappingColumn && equalWrappingIndent && equalWordBreak;
    this.fontInfo = fontInfo;
    this.wrappingStrategy = wrappingStrategy;
    this.wrappingColumn = wrappingColumn;
    this.wrappingIndent = wrappingIndent;
    this.wordBreak = wordBreak;
    let previousLineBreaks = null;
    if (onlyWrappingColumnChanged) {
      previousLineBreaks = [];
      for (let i2 = 0, len = this.modelLineProjections.length; i2 < len; i2++) {
        previousLineBreaks[i2] = this.modelLineProjections[i2].getProjectionData();
      }
    }
    this._constructLines(
      /*resetHiddenAreas*/
      false,
      previousLineBreaks
    );
    return true;
  }
  createLineBreaksComputer(_context) {
    const lineBreaksComputerFactory = this.wrappingStrategy === "advanced" ? this._domLineBreaksComputerFactory : this._monospaceLineBreaksComputerFactory;
    const context2 = _context ?? {
      getLineContent: (lineNumber) => {
        return this.model.getLineContent(lineNumber);
      },
      getLineInjectedText: (lineNumber) => {
        return this.model.getLineInjectedText(lineNumber, this._editorId);
      }
    };
    return lineBreaksComputerFactory.createLineBreaksComputer(context2, this.fontInfo, this.tabSize, this.wrappingColumn, this.wrappingIndent, this.wordBreak, this.wrapOnEscapedLineFeeds);
  }
  onModelFlushed() {
    this._constructLines(
      /*resetHiddenAreas*/
      true,
      null
    );
  }
  onModelLinesDeleted(versionId, fromLineNumber, toLineNumber) {
    if (!versionId || versionId <= this._validModelVersionId) {
      return null;
    }
    const outputFromLineNumber = fromLineNumber === 1 ? 1 : this.projectedModelLineLineCounts.getPrefixSum(fromLineNumber - 1) + 1;
    const outputToLineNumber = this.projectedModelLineLineCounts.getPrefixSum(toLineNumber);
    this.modelLineProjections.splice(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
    this.projectedModelLineLineCounts.removeValues(fromLineNumber - 1, toLineNumber - fromLineNumber + 1);
    return new ViewLinesDeletedEvent(outputFromLineNumber, outputToLineNumber);
  }
  onModelLinesInserted(versionId, fromLineNumber, _toLineNumber, lineBreaks) {
    if (!versionId || versionId <= this._validModelVersionId) {
      return null;
    }
    const isInHiddenArea = fromLineNumber > 2 && !this.modelLineProjections[fromLineNumber - 2].isVisible();
    const outputFromLineNumber = fromLineNumber === 1 ? 1 : this.projectedModelLineLineCounts.getPrefixSum(fromLineNumber - 1) + 1;
    let totalOutputLineCount = 0;
    const insertLines = [];
    const insertPrefixSumValues = [];
    for (let i2 = 0, len = lineBreaks.length; i2 < len; i2++) {
      const line = createModelLineProjection(lineBreaks[i2], !isInHiddenArea);
      insertLines.push(line);
      const outputLineCount = line.getViewLineCount();
      totalOutputLineCount += outputLineCount;
      insertPrefixSumValues[i2] = outputLineCount;
    }
    this.modelLineProjections = this.modelLineProjections.slice(0, fromLineNumber - 1).concat(insertLines).concat(this.modelLineProjections.slice(fromLineNumber - 1));
    this.projectedModelLineLineCounts.insertValues(fromLineNumber - 1, insertPrefixSumValues);
    return new ViewLinesInsertedEvent(outputFromLineNumber, outputFromLineNumber + totalOutputLineCount - 1);
  }
  onModelLineChanged(versionId, lineNumber, lineBreakData) {
    if (versionId !== null && versionId <= this._validModelVersionId) {
      return [false, null, null, null];
    }
    const lineIndex = lineNumber - 1;
    const oldOutputLineCount = this.modelLineProjections[lineIndex].getViewLineCount();
    const isVisible = this.modelLineProjections[lineIndex].isVisible();
    const line = createModelLineProjection(lineBreakData, isVisible);
    this.modelLineProjections[lineIndex] = line;
    const newOutputLineCount = this.modelLineProjections[lineIndex].getViewLineCount();
    let lineMappingChanged = false;
    let changeFrom = 0;
    let changeTo = -1;
    let insertFrom = 0;
    let insertTo = -1;
    let deleteFrom = 0;
    let deleteTo = -1;
    if (oldOutputLineCount > newOutputLineCount) {
      changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
      changeTo = changeFrom + newOutputLineCount - 1;
      deleteFrom = changeTo + 1;
      deleteTo = deleteFrom + (oldOutputLineCount - newOutputLineCount) - 1;
      lineMappingChanged = true;
    } else if (oldOutputLineCount < newOutputLineCount) {
      changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
      changeTo = changeFrom + oldOutputLineCount - 1;
      insertFrom = changeTo + 1;
      insertTo = insertFrom + (newOutputLineCount - oldOutputLineCount) - 1;
      lineMappingChanged = true;
    } else {
      changeFrom = this.projectedModelLineLineCounts.getPrefixSum(lineNumber - 1) + 1;
      changeTo = changeFrom + newOutputLineCount - 1;
    }
    this.projectedModelLineLineCounts.setValue(lineIndex, newOutputLineCount);
    const viewLinesChangedEvent = changeFrom <= changeTo ? new ViewLinesChangedEvent(changeFrom, changeTo - changeFrom + 1) : null;
    const viewLinesInsertedEvent = insertFrom <= insertTo ? new ViewLinesInsertedEvent(insertFrom, insertTo) : null;
    const viewLinesDeletedEvent = deleteFrom <= deleteTo ? new ViewLinesDeletedEvent(deleteFrom, deleteTo) : null;
    return [lineMappingChanged, viewLinesChangedEvent, viewLinesInsertedEvent, viewLinesDeletedEvent];
  }
  acceptVersionId(versionId) {
    this._validModelVersionId = versionId;
    this._ensureAtLeastOneVisibleLine();
  }
  _ensureAtLeastOneVisibleLine() {
    if (this.getViewLineCount() === 0 && this.modelLineProjections.length > 0) {
      this.modelLineProjections[0] = this.modelLineProjections[0].setVisible(true);
      this.projectedModelLineLineCounts.setValue(0, this.modelLineProjections[0].getViewLineCount());
    }
  }
  getViewLineCount() {
    return this.projectedModelLineLineCounts.getTotalSum();
  }
  _toValidViewLineNumber(viewLineNumber) {
    if (viewLineNumber < 1) {
      return 1;
    }
    const viewLineCount = this.getViewLineCount();
    if (viewLineNumber > viewLineCount) {
      return viewLineCount;
    }
    return viewLineNumber | 0;
  }
  getActiveIndentGuide(viewLineNumber, minLineNumber, maxLineNumber) {
    viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
    minLineNumber = this._toValidViewLineNumber(minLineNumber);
    maxLineNumber = this._toValidViewLineNumber(maxLineNumber);
    const modelPosition = this.convertViewPositionToModelPosition(viewLineNumber, this.getViewLineMinColumn(viewLineNumber));
    const modelMinPosition = this.convertViewPositionToModelPosition(minLineNumber, this.getViewLineMinColumn(minLineNumber));
    const modelMaxPosition = this.convertViewPositionToModelPosition(maxLineNumber, this.getViewLineMinColumn(maxLineNumber));
    const result = this.model.guides.getActiveIndentGuide(modelPosition.lineNumber, modelMinPosition.lineNumber, modelMaxPosition.lineNumber);
    const viewStartPosition = this.convertModelPositionToViewPosition(result.startLineNumber, 1);
    const viewEndPosition = this.convertModelPositionToViewPosition(result.endLineNumber, this.model.getLineMaxColumn(result.endLineNumber));
    return {
      startLineNumber: viewStartPosition.lineNumber,
      endLineNumber: viewEndPosition.lineNumber,
      indent: result.indent
    };
  }
  // #region ViewLineInfo
  getViewLineInfo(viewLineNumber) {
    viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
    const r2 = this.projectedModelLineLineCounts.getIndexOf(viewLineNumber - 1);
    const lineIndex = r2.index;
    const remainder = r2.remainder;
    return new ViewLineInfo(lineIndex + 1, remainder);
  }
  getMinColumnOfViewLine(viewLineInfo) {
    return this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewLineMinColumn(
      this.model,
      viewLineInfo.modelLineNumber,
      viewLineInfo.modelLineWrappedLineIdx
    );
  }
  getMaxColumnOfViewLine(viewLineInfo) {
    return this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewLineMaxColumn(
      this.model,
      viewLineInfo.modelLineNumber,
      viewLineInfo.modelLineWrappedLineIdx
    );
  }
  getModelStartPositionOfViewLine(viewLineInfo) {
    const line = this.modelLineProjections[viewLineInfo.modelLineNumber - 1];
    const minViewColumn = line.getViewLineMinColumn(
      this.model,
      viewLineInfo.modelLineNumber,
      viewLineInfo.modelLineWrappedLineIdx
    );
    const column = line.getModelColumnOfViewPosition(
      viewLineInfo.modelLineWrappedLineIdx,
      minViewColumn
    );
    return new Position(viewLineInfo.modelLineNumber, column);
  }
  getModelEndPositionOfViewLine(viewLineInfo) {
    const line = this.modelLineProjections[viewLineInfo.modelLineNumber - 1];
    const maxViewColumn = line.getViewLineMaxColumn(
      this.model,
      viewLineInfo.modelLineNumber,
      viewLineInfo.modelLineWrappedLineIdx
    );
    const column = line.getModelColumnOfViewPosition(
      viewLineInfo.modelLineWrappedLineIdx,
      maxViewColumn
    );
    return new Position(viewLineInfo.modelLineNumber, column);
  }
  getViewLineInfosGroupedByModelRanges(viewStartLineNumber, viewEndLineNumber) {
    const startViewLine = this.getViewLineInfo(viewStartLineNumber);
    const endViewLine = this.getViewLineInfo(viewEndLineNumber);
    const result = new Array();
    let lastVisibleModelPos = this.getModelStartPositionOfViewLine(startViewLine);
    let viewLines = new Array();
    for (let curModelLine = startViewLine.modelLineNumber; curModelLine <= endViewLine.modelLineNumber; curModelLine++) {
      const line = this.modelLineProjections[curModelLine - 1];
      if (line.isVisible()) {
        const startOffset = curModelLine === startViewLine.modelLineNumber ? startViewLine.modelLineWrappedLineIdx : 0;
        const endOffset = curModelLine === endViewLine.modelLineNumber ? endViewLine.modelLineWrappedLineIdx + 1 : line.getViewLineCount();
        for (let i2 = startOffset; i2 < endOffset; i2++) {
          viewLines.push(new ViewLineInfo(curModelLine, i2));
        }
      }
      if (!line.isVisible() && lastVisibleModelPos) {
        const lastVisibleModelPos2 = new Position(curModelLine - 1, this.model.getLineMaxColumn(curModelLine - 1) + 1);
        const modelRange = Range2.fromPositions(lastVisibleModelPos, lastVisibleModelPos2);
        result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
        viewLines = [];
        lastVisibleModelPos = null;
      } else if (line.isVisible() && !lastVisibleModelPos) {
        lastVisibleModelPos = new Position(curModelLine, 1);
      }
    }
    if (lastVisibleModelPos) {
      const modelRange = Range2.fromPositions(lastVisibleModelPos, this.getModelEndPositionOfViewLine(endViewLine));
      result.push(new ViewLineInfoGroupedByModelRange(modelRange, viewLines));
    }
    return result;
  }
  // #endregion
  getViewLinesBracketGuides(viewStartLineNumber, viewEndLineNumber, activeViewPosition, options3) {
    const modelActivePosition = activeViewPosition ? this.convertViewPositionToModelPosition(activeViewPosition.lineNumber, activeViewPosition.column) : null;
    const resultPerViewLine = [];
    for (const group2 of this.getViewLineInfosGroupedByModelRanges(viewStartLineNumber, viewEndLineNumber)) {
      const modelRangeStartLineNumber = group2.modelRange.startLineNumber;
      const bracketGuidesPerModelLine = this.model.guides.getLinesBracketGuides(
        modelRangeStartLineNumber,
        group2.modelRange.endLineNumber,
        modelActivePosition,
        options3
      );
      for (const viewLineInfo of group2.viewLines) {
        const bracketGuides = bracketGuidesPerModelLine[viewLineInfo.modelLineNumber - modelRangeStartLineNumber];
        const result = bracketGuides.map((g) => {
          if (g.forWrappedLinesAfterColumn !== -1) {
            const p2 = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesAfterColumn);
            if (p2.lineNumber >= viewLineInfo.modelLineWrappedLineIdx) {
              return void 0;
            }
          }
          if (g.forWrappedLinesBeforeOrAtColumn !== -1) {
            const p2 = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.forWrappedLinesBeforeOrAtColumn);
            if (p2.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
              return void 0;
            }
          }
          if (!g.horizontalLine) {
            return g;
          }
          let column = -1;
          if (g.column !== -1) {
            const p2 = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.column);
            if (p2.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
              column = p2.column;
            } else if (p2.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
              column = this.getMinColumnOfViewLine(viewLineInfo);
            } else if (p2.lineNumber > viewLineInfo.modelLineWrappedLineIdx) {
              return void 0;
            }
          }
          const viewPosition = this.convertModelPositionToViewPosition(viewLineInfo.modelLineNumber, g.horizontalLine.endColumn);
          const p = this.modelLineProjections[viewLineInfo.modelLineNumber - 1].getViewPositionOfModelPosition(0, g.horizontalLine.endColumn);
          if (p.lineNumber === viewLineInfo.modelLineWrappedLineIdx) {
            return new IndentGuide(
              g.visibleColumn,
              column,
              g.className,
              new IndentGuideHorizontalLine(
                g.horizontalLine.top,
                viewPosition.column
              ),
              -1,
              -1
            );
          } else if (p.lineNumber < viewLineInfo.modelLineWrappedLineIdx) {
            return void 0;
          } else {
            if (g.visibleColumn !== -1) {
              return void 0;
            }
            return new IndentGuide(
              g.visibleColumn,
              column,
              g.className,
              new IndentGuideHorizontalLine(
                g.horizontalLine.top,
                this.getMaxColumnOfViewLine(viewLineInfo)
              ),
              -1,
              -1
            );
          }
        });
        resultPerViewLine.push(result.filter((r2) => !!r2));
      }
    }
    return resultPerViewLine;
  }
  getViewLinesIndentGuides(viewStartLineNumber, viewEndLineNumber) {
    viewStartLineNumber = this._toValidViewLineNumber(viewStartLineNumber);
    viewEndLineNumber = this._toValidViewLineNumber(viewEndLineNumber);
    const modelStart = this.convertViewPositionToModelPosition(viewStartLineNumber, this.getViewLineMinColumn(viewStartLineNumber));
    const modelEnd = this.convertViewPositionToModelPosition(viewEndLineNumber, this.getViewLineMaxColumn(viewEndLineNumber));
    let result = [];
    const resultRepeatCount = [];
    const resultRepeatOption = [];
    const modelStartLineIndex = modelStart.lineNumber - 1;
    const modelEndLineIndex = modelEnd.lineNumber - 1;
    let reqStart = null;
    for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
      const line = this.modelLineProjections[modelLineIndex];
      if (line.isVisible()) {
        const viewLineStartIndex = line.getViewLineNumberOfModelPosition(0, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
        const viewLineEndIndex = line.getViewLineNumberOfModelPosition(0, this.model.getLineMaxColumn(modelLineIndex + 1));
        const count2 = viewLineEndIndex - viewLineStartIndex + 1;
        let option2 = 0 /* BlockNone */;
        if (count2 > 1 && line.getViewLineMinColumn(this.model, modelLineIndex + 1, viewLineEndIndex) === 1) {
          option2 = viewLineStartIndex === 0 ? 1 /* BlockSubsequent */ : 2 /* BlockAll */;
        }
        resultRepeatCount.push(count2);
        resultRepeatOption.push(option2);
        if (reqStart === null) {
          reqStart = new Position(modelLineIndex + 1, 0);
        }
      } else {
        if (reqStart !== null) {
          result = result.concat(this.model.guides.getLinesIndentGuides(reqStart.lineNumber, modelLineIndex));
          reqStart = null;
        }
      }
    }
    if (reqStart !== null) {
      result = result.concat(this.model.guides.getLinesIndentGuides(reqStart.lineNumber, modelEnd.lineNumber));
      reqStart = null;
    }
    const viewLineCount = viewEndLineNumber - viewStartLineNumber + 1;
    const viewIndents = new Array(viewLineCount);
    let currIndex = 0;
    for (let i2 = 0, len = result.length; i2 < len; i2++) {
      let value2 = result[i2];
      const count2 = Math.min(viewLineCount - currIndex, resultRepeatCount[i2]);
      const option2 = resultRepeatOption[i2];
      let blockAtIndex;
      if (option2 === 2 /* BlockAll */) {
        blockAtIndex = 0;
      } else if (option2 === 1 /* BlockSubsequent */) {
        blockAtIndex = 1;
      } else {
        blockAtIndex = count2;
      }
      for (let j = 0; j < count2; j++) {
        if (j === blockAtIndex) {
          value2 = 0;
        }
        viewIndents[currIndex++] = value2;
      }
    }
    return viewIndents;
  }
  getViewLineContent(viewLineNumber) {
    const info = this.getViewLineInfo(viewLineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].getViewLineContent(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
  }
  getViewLineLength(viewLineNumber) {
    const info = this.getViewLineInfo(viewLineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].getViewLineLength(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
  }
  getViewLineMinColumn(viewLineNumber) {
    const info = this.getViewLineInfo(viewLineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].getViewLineMinColumn(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
  }
  getViewLineMaxColumn(viewLineNumber) {
    const info = this.getViewLineInfo(viewLineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].getViewLineMaxColumn(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx);
  }
  getViewLineData(viewLineNumber) {
    const info = this.getViewLineInfo(viewLineNumber);
    const baseViewLineNumber = this.projectedModelLineLineCounts.getPrefixSum(info.modelLineNumber - 1) + 1;
    return this.modelLineProjections[info.modelLineNumber - 1].getViewLineData(this.model, info.modelLineNumber, info.modelLineWrappedLineIdx, baseViewLineNumber);
  }
  getViewLinesData(viewStartLineNumber, viewEndLineNumber, needed) {
    viewStartLineNumber = this._toValidViewLineNumber(viewStartLineNumber);
    viewEndLineNumber = this._toValidViewLineNumber(viewEndLineNumber);
    const start = this.projectedModelLineLineCounts.getIndexOf(viewStartLineNumber - 1);
    let viewLineNumber = viewStartLineNumber;
    const startModelLineIndex = start.index;
    const startRemainder = start.remainder;
    const result = [];
    for (let modelLineIndex = startModelLineIndex, len = this.model.getLineCount(); modelLineIndex < len; modelLineIndex++) {
      const line = this.modelLineProjections[modelLineIndex];
      if (!line.isVisible()) {
        continue;
      }
      const fromViewLineIndex = modelLineIndex === startModelLineIndex ? startRemainder : 0;
      let remainingViewLineCount = line.getViewLineCount() - fromViewLineIndex;
      let lastLine = false;
      if (viewLineNumber + remainingViewLineCount > viewEndLineNumber) {
        lastLine = true;
        remainingViewLineCount = viewEndLineNumber - viewLineNumber + 1;
      }
      const baseViewLineNumber = this.projectedModelLineLineCounts.getPrefixSum(modelLineIndex) + 1;
      line.getViewLinesData(this.model, modelLineIndex + 1, fromViewLineIndex, remainingViewLineCount, baseViewLineNumber, viewLineNumber - viewStartLineNumber, needed, result);
      viewLineNumber += remainingViewLineCount;
      if (lastLine) {
        break;
      }
    }
    return result;
  }
  validateViewPosition(viewLineNumber, viewColumn, expectedModelPosition) {
    viewLineNumber = this._toValidViewLineNumber(viewLineNumber);
    const r2 = this.projectedModelLineLineCounts.getIndexOf(viewLineNumber - 1);
    const lineIndex = r2.index;
    const remainder = r2.remainder;
    const line = this.modelLineProjections[lineIndex];
    const minColumn = line.getViewLineMinColumn(this.model, lineIndex + 1, remainder);
    const maxColumn = line.getViewLineMaxColumn(this.model, lineIndex + 1, remainder);
    if (viewColumn < minColumn) {
      viewColumn = minColumn;
    }
    if (viewColumn > maxColumn) {
      viewColumn = maxColumn;
    }
    const computedModelColumn = line.getModelColumnOfViewPosition(remainder, viewColumn);
    const computedModelPosition = this.model.validatePosition(new Position(lineIndex + 1, computedModelColumn));
    if (computedModelPosition.equals(expectedModelPosition)) {
      return new Position(viewLineNumber, viewColumn);
    }
    return this.convertModelPositionToViewPosition(expectedModelPosition.lineNumber, expectedModelPosition.column);
  }
  validateViewRange(viewRange, expectedModelRange) {
    const validViewStart = this.validateViewPosition(viewRange.startLineNumber, viewRange.startColumn, expectedModelRange.getStartPosition());
    const validViewEnd = this.validateViewPosition(viewRange.endLineNumber, viewRange.endColumn, expectedModelRange.getEndPosition());
    return new Range2(validViewStart.lineNumber, validViewStart.column, validViewEnd.lineNumber, validViewEnd.column);
  }
  convertViewPositionToModelPosition(viewLineNumber, viewColumn) {
    const info = this.getViewLineInfo(viewLineNumber);
    const inputColumn = this.modelLineProjections[info.modelLineNumber - 1].getModelColumnOfViewPosition(info.modelLineWrappedLineIdx, viewColumn);
    return this.model.validatePosition(new Position(info.modelLineNumber, inputColumn));
  }
  convertViewRangeToModelRange(viewRange) {
    const start = this.convertViewPositionToModelPosition(viewRange.startLineNumber, viewRange.startColumn);
    const end = this.convertViewPositionToModelPosition(viewRange.endLineNumber, viewRange.endColumn);
    return new Range2(start.lineNumber, start.column, end.lineNumber, end.column);
  }
  convertModelPositionToViewPosition(_modelLineNumber, _modelColumn, affinity = 2 /* None */, allowZeroLineNumber = false, belowHiddenRanges = false) {
    const validPosition = this.model.validatePosition(new Position(_modelLineNumber, _modelColumn));
    const inputLineNumber = validPosition.lineNumber;
    const inputColumn = validPosition.column;
    let lineIndex = inputLineNumber - 1, lineIndexChanged = false;
    if (belowHiddenRanges) {
      while (lineIndex < this.modelLineProjections.length && !this.modelLineProjections[lineIndex].isVisible()) {
        lineIndex++;
        lineIndexChanged = true;
      }
    } else {
      while (lineIndex > 0 && !this.modelLineProjections[lineIndex].isVisible()) {
        lineIndex--;
        lineIndexChanged = true;
      }
    }
    if (lineIndex === 0 && !this.modelLineProjections[lineIndex].isVisible()) {
      return new Position(allowZeroLineNumber ? 0 : 1, 1);
    }
    const deltaLineNumber = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
    let r2;
    if (lineIndexChanged) {
      if (belowHiddenRanges) {
        r2 = this.modelLineProjections[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, 1, affinity);
      } else {
        r2 = this.modelLineProjections[lineIndex].getViewPositionOfModelPosition(deltaLineNumber, this.model.getLineMaxColumn(lineIndex + 1), affinity);
      }
    } else {
      r2 = this.modelLineProjections[inputLineNumber - 1].getViewPositionOfModelPosition(deltaLineNumber, inputColumn, affinity);
    }
    return r2;
  }
  /**
   * @param affinity The affinity in case of an empty range. Has no effect for non-empty ranges.
  */
  convertModelRangeToViewRange(modelRange, affinity = 0 /* Left */) {
    if (modelRange.isEmpty()) {
      const start = this.convertModelPositionToViewPosition(modelRange.startLineNumber, modelRange.startColumn, affinity);
      return Range2.fromPositions(start);
    } else {
      const start = this.convertModelPositionToViewPosition(modelRange.startLineNumber, modelRange.startColumn, 1 /* Right */);
      const end = this.convertModelPositionToViewPosition(modelRange.endLineNumber, modelRange.endColumn, 0 /* Left */);
      return new Range2(start.lineNumber, start.column, end.lineNumber, end.column);
    }
  }
  getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
    let lineIndex = modelLineNumber - 1;
    if (this.modelLineProjections[lineIndex].isVisible()) {
      const deltaLineNumber2 = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
      return this.modelLineProjections[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber2, modelColumn);
    }
    while (lineIndex > 0 && !this.modelLineProjections[lineIndex].isVisible()) {
      lineIndex--;
    }
    if (lineIndex === 0 && !this.modelLineProjections[lineIndex].isVisible()) {
      return 1;
    }
    const deltaLineNumber = 1 + this.projectedModelLineLineCounts.getPrefixSum(lineIndex);
    return this.modelLineProjections[lineIndex].getViewLineNumberOfModelPosition(deltaLineNumber, this.model.getLineMaxColumn(lineIndex + 1));
  }
  getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations, onlyMarginDecorations) {
    const modelStart = this.convertViewPositionToModelPosition(range2.startLineNumber, range2.startColumn);
    const modelEnd = this.convertViewPositionToModelPosition(range2.endLineNumber, range2.endColumn);
    if (modelEnd.lineNumber - modelStart.lineNumber <= range2.endLineNumber - range2.startLineNumber) {
      return this.model.getDecorationsInRange(new Range2(modelStart.lineNumber, 1, modelEnd.lineNumber, modelEnd.column), ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations, onlyMarginDecorations);
    }
    let result = [];
    const modelStartLineIndex = modelStart.lineNumber - 1;
    const modelEndLineIndex = modelEnd.lineNumber - 1;
    let reqStart = null;
    for (let modelLineIndex = modelStartLineIndex; modelLineIndex <= modelEndLineIndex; modelLineIndex++) {
      const line = this.modelLineProjections[modelLineIndex];
      if (line.isVisible()) {
        if (reqStart === null) {
          reqStart = new Position(modelLineIndex + 1, modelLineIndex === modelStartLineIndex ? modelStart.column : 1);
        }
      } else {
        if (reqStart !== null) {
          const maxLineColumn = this.model.getLineMaxColumn(modelLineIndex);
          result = result.concat(this.model.getDecorationsInRange(new Range2(reqStart.lineNumber, reqStart.column, modelLineIndex, maxLineColumn), ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations));
          reqStart = null;
        }
      }
    }
    if (reqStart !== null) {
      result = result.concat(this.model.getDecorationsInRange(new Range2(reqStart.lineNumber, reqStart.column, modelEnd.lineNumber, modelEnd.column), ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations));
      reqStart = null;
    }
    result.sort((a, b) => {
      const res = Range2.compareRangesUsingStarts(a.range, b.range);
      if (res === 0) {
        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      }
      return res;
    });
    const finalResult = [];
    let finalResultLen = 0;
    let prevDecId = null;
    for (const dec of result) {
      const decId = dec.id;
      if (prevDecId === decId) {
        continue;
      }
      prevDecId = decId;
      finalResult[finalResultLen++] = dec;
    }
    return finalResult;
  }
  getInjectedTextAt(position2) {
    const info = this.getViewLineInfo(position2.lineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].getInjectedTextAt(info.modelLineWrappedLineIdx, position2.column);
  }
  normalizePosition(position2, affinity) {
    const info = this.getViewLineInfo(position2.lineNumber);
    return this.modelLineProjections[info.modelLineNumber - 1].normalizePosition(info.modelLineWrappedLineIdx, position2, affinity);
  }
  getLineIndentColumn(lineNumber) {
    const info = this.getViewLineInfo(lineNumber);
    if (info.modelLineWrappedLineIdx === 0) {
      return this.model.getLineIndentColumn(info.modelLineNumber);
    }
    return 0;
  }
};

function normalizeLineRanges(ranges) {
  if (ranges.length === 0) {
    return [];
  }
  const sortedRanges = ranges.slice();
  sortedRanges.sort(Range2.compareRangesUsingStarts);
  const result = [];
  let currentRangeStart = sortedRanges[0].startLineNumber;
  let currentRangeEnd = sortedRanges[0].endLineNumber;
  for (let i2 = 1, len = sortedRanges.length; i2 < len; i2++) {
    const range2 = sortedRanges[i2];
    if (range2.startLineNumber > currentRangeEnd + 1) {
      result.push(new Range2(currentRangeStart, 1, currentRangeEnd, 1));
      currentRangeStart = range2.startLineNumber;
      currentRangeEnd = range2.endLineNumber;
    } else if (range2.endLineNumber > currentRangeEnd) {
      currentRangeEnd = range2.endLineNumber;
    }
  }
  result.push(new Range2(currentRangeStart, 1, currentRangeEnd, 1));
  return result;
}

var ViewLineInfo = class {
  constructor(modelLineNumber, modelLineWrappedLineIdx) {
    this.modelLineNumber = modelLineNumber;
    this.modelLineWrappedLineIdx = modelLineWrappedLineIdx;
  }
  get isWrappedLineContinuation() {
    return this.modelLineWrappedLineIdx > 0;
  }
};

var ViewLineInfoGroupedByModelRange = class {
  constructor(modelRange, viewLines) {
    this.modelRange = modelRange;
    this.viewLines = viewLines;
  }
};

var CoordinatesConverter = class {
  constructor(lines) {
    this._lines = lines;
  }
  // View -> Model conversion and related methods
  convertViewPositionToModelPosition(viewPosition) {
    return this._lines.convertViewPositionToModelPosition(viewPosition.lineNumber, viewPosition.column);
  }
  convertViewRangeToModelRange(viewRange) {
    return this._lines.convertViewRangeToModelRange(viewRange);
  }
  validateViewPosition(viewPosition, expectedModelPosition) {
    return this._lines.validateViewPosition(viewPosition.lineNumber, viewPosition.column, expectedModelPosition);
  }
  validateViewRange(viewRange, expectedModelRange) {
    return this._lines.validateViewRange(viewRange, expectedModelRange);
  }
  // Model -> View conversion and related methods
  convertModelPositionToViewPosition(modelPosition, affinity, allowZero, belowHiddenRanges) {
    return this._lines.convertModelPositionToViewPosition(modelPosition.lineNumber, modelPosition.column, affinity, allowZero, belowHiddenRanges);
  }
  convertModelRangeToViewRange(modelRange, affinity) {
    return this._lines.convertModelRangeToViewRange(modelRange, affinity);
  }
  modelPositionIsVisible(modelPosition) {
    return this._lines.modelPositionIsVisible(modelPosition.lineNumber, modelPosition.column);
  }
  getModelLineViewLineCount(modelLineNumber) {
    return this._lines.getModelLineViewLineCount(modelLineNumber);
  }
  getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
    return this._lines.getViewLineNumberOfModelPosition(modelLineNumber, modelColumn);
  }
};

var ViewModelLinesFromModelAsIs = class {
  constructor(model) {
    this.model = model;
  }
  dispose() {
  }
  createCoordinatesConverter() {
    return new IdentityCoordinatesConverter(this.model);
  }
  getHiddenAreas() {
    return [];
  }
  setHiddenAreas(_ranges) {
    return false;
  }
  setTabSize(_newTabSize) {
    return false;
  }
  setWrappingSettings(_fontInfo, _wrappingStrategy, _wrappingColumn, _wrappingIndent) {
    return false;
  }
  createLineBreaksComputer() {
    const result = [];
    return {
      addRequest: (lineNumber, previousLineBreakData) => {
        result.push(null);
      },
      finalize: () => {
        return result;
      }
    };
  }
  onModelFlushed() {
  }
  onModelLinesDeleted(_versionId, fromLineNumber, toLineNumber) {
    return new ViewLinesDeletedEvent(fromLineNumber, toLineNumber);
  }
  onModelLinesInserted(_versionId, fromLineNumber, toLineNumber, lineBreaks) {
    return new ViewLinesInsertedEvent(fromLineNumber, toLineNumber);
  }
  onModelLineChanged(_versionId, lineNumber, lineBreakData) {
    return [false, new ViewLinesChangedEvent(lineNumber, 1), null, null];
  }
  acceptVersionId(_versionId) {
  }
  getViewLineCount() {
    return this.model.getLineCount();
  }
  getActiveIndentGuide(viewLineNumber, _minLineNumber, _maxLineNumber) {
    return {
      startLineNumber: viewLineNumber,
      endLineNumber: viewLineNumber,
      indent: 0
    };
  }
  getViewLinesBracketGuides(startLineNumber, endLineNumber, activePosition) {
    return new Array(endLineNumber - startLineNumber + 1).fill([]);
  }
  getViewLinesIndentGuides(viewStartLineNumber, viewEndLineNumber) {
    const viewLineCount = viewEndLineNumber - viewStartLineNumber + 1;
    const result = new Array(viewLineCount);
    for (let i2 = 0; i2 < viewLineCount; i2++) {
      result[i2] = 0;
    }
    return result;
  }
  getViewLineContent(viewLineNumber) {
    return this.model.getLineContent(viewLineNumber);
  }
  getViewLineLength(viewLineNumber) {
    return this.model.getLineLength(viewLineNumber);
  }
  getViewLineMinColumn(viewLineNumber) {
    return this.model.getLineMinColumn(viewLineNumber);
  }
  getViewLineMaxColumn(viewLineNumber) {
    return this.model.getLineMaxColumn(viewLineNumber);
  }
  getViewLineData(viewLineNumber) {
    const lineTokens = this.model.tokenization.getLineTokens(viewLineNumber);
    const lineContent = lineTokens.getLineContent();
    return new ViewLineData(
      lineContent,
      false,
      1,
      lineContent.length + 1,
      0,
      lineTokens.inflate(),
      null
    );
  }
  getViewLinesData(viewStartLineNumber, viewEndLineNumber, needed) {
    const lineCount = this.model.getLineCount();
    viewStartLineNumber = Math.min(Math.max(1, viewStartLineNumber), lineCount);
    viewEndLineNumber = Math.min(Math.max(1, viewEndLineNumber), lineCount);
    const result = [];
    for (let lineNumber = viewStartLineNumber; lineNumber <= viewEndLineNumber; lineNumber++) {
      const idx = lineNumber - viewStartLineNumber;
      result[idx] = needed[idx] ? this.getViewLineData(lineNumber) : null;
    }
    return result;
  }
  getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations, onlyMarginDecorations) {
    return this.model.getDecorationsInRange(range2, ownerId2, filterOutValidation, filterFontDecorations2, onlyMinimapDecorations, onlyMarginDecorations);
  }
  normalizePosition(position2, affinity) {
    return this.model.normalizePosition(position2, affinity);
  }
  getLineIndentColumn(lineNumber) {
    return this.model.getLineIndentColumn(lineNumber);
  }
  getInjectedTextAt(position2) {
    return null;
  }
};
export { normalizeLineRanges, ViewModelLinesFromProjectedModel, ViewLineInfo, ViewLineInfoGroupedByModelRange, CoordinatesConverter, ViewModelLinesFromModelAsIs };
