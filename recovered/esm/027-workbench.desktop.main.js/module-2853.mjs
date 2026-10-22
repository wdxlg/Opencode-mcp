// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchModel.ts
import { MatchImpl, textSearchResultToMatches } from "./module-2847.mjs";
import { MATCH_PREFIX } from "./module-2545.mjs";
import { CellSearchModel } from "./module-2851.mjs";
import { getTextSearchMatchWithModelContext } from "./module-2846.mjs";
import { resultIsMatch } from "./module-0999.mjs";
import { isINotebookFileMatchNoModel, rawCellPrefix } from "./module-2850.mjs";
import { FileMatchImpl } from "./module-2848.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { contentMatchesToTextSearchMatches, isINotebookCellMatchWithModel, isINotebookFileMatchWithModel, webviewMatchesToTextSearchMatches } from "./module-2852.mjs";
import { FindMatchDecorationModel } from "./module-1942.mjs";
import { coalesce } from "./module-0007.mjs";
import { FindMatch } from "./module-0117.mjs";
import { CellFindMatchModel } from "./module-1943.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isIMatchInNotebook } from "./module-2834.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { IReplaceService } from "./module-2839.mjs";
import { ILabelService } from "./module-0641.mjs";
import { INotebookEditorService } from "./module-1386.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchModel.ts
var MatchInNotebook = class extends MatchImpl {
  constructor(_cellParent, _fullPreviewLines, _fullPreviewRange, _documentRange, webviewIndex) {
    super(_cellParent.parent, _fullPreviewLines, _fullPreviewRange, _documentRange, false);
    this._cellParent = _cellParent;
    this._id = MATCH_PREFIX + this._parent.resource.toString() + ">" + this._cellParent.cellIndex + (webviewIndex ? "_" + webviewIndex : "") + "_" + this.notebookMatchTypeString() + this._range + this.getMatchString();
    this._webviewIndex = webviewIndex;
  }
  parent() {
    return this._cellParent.parent;
  }
  get cellParent() {
    return this._cellParent;
  }
  notebookMatchTypeString() {
    return this.isWebviewMatch() ? "webview" : "content";
  }
  isWebviewMatch() {
    return this._webviewIndex !== void 0;
  }
  get isReadonly() {
    return super.isReadonly || !this._cellParent.hasCellViewModel() || this.isWebviewMatch();
  }
  get cellIndex() {
    return this._cellParent.cellIndex;
  }
  get webviewIndex() {
    return this._webviewIndex;
  }
  get cell() {
    return this._cellParent.cell;
  }
};

var CellMatch = class {
  constructor(_parent, _cell, _cellIndex) {
    this._parent = _parent;
    this._cell = _cell;
    this._cellIndex = _cellIndex;
    this._contentMatches = /* @__PURE__ */ new Map();
    this._webviewMatches = /* @__PURE__ */ new Map();
    this._context = /* @__PURE__ */ new Map();
  }
  hasCellViewModel() {
    return !(this._cell instanceof CellSearchModel);
  }
  get context() {
    return new Map(this._context);
  }
  matches() {
    return [...this._contentMatches.values(), ...this._webviewMatches.values()];
  }
  get contentMatches() {
    return Array.from(this._contentMatches.values());
  }
  get webviewMatches() {
    return Array.from(this._webviewMatches.values());
  }
  remove(matches2) {
    if (!Array.isArray(matches2)) {
      matches2 = [matches2];
    }
    for (const match2 of matches2) {
      this._contentMatches.delete(match2.id());
      this._webviewMatches.delete(match2.id());
    }
  }
  clearAllMatches() {
    this._contentMatches.clear();
    this._webviewMatches.clear();
  }
  addContentMatches(textSearchMatches) {
    const contentMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
    contentMatches.forEach((match2) => {
      this._contentMatches.set(match2.id(), match2);
    });
    this.addContext(textSearchMatches);
  }
  addContext(textSearchMatches) {
    if (!this.cell) {
      return;
    }
    this.cell.resolveTextModel().then((textModel) => {
      const textResultsWithContext = getTextSearchMatchWithModelContext(textSearchMatches, textModel, this.parent.parent().query);
      const contexts = textResultsWithContext.filter(((result) => !resultIsMatch(result)));
      contexts.map((context2) => ({ ...context2, lineNumber: context2.lineNumber + 1 })).forEach((context2) => {
        this._context.set(context2.lineNumber, context2.text);
      });
    });
  }
  addWebviewMatches(textSearchMatches) {
    const webviewMatches = textSearchMatchesToNotebookMatches(textSearchMatches, this);
    webviewMatches.forEach((match2) => {
      this._webviewMatches.set(match2.id(), match2);
    });
  }
  setCellModel(cell) {
    this._cell = cell;
  }
  get parent() {
    return this._parent;
  }
  get id() {
    return this._cell?.id ?? `${rawCellPrefix}${this.cellIndex}`;
  }
  get cellIndex() {
    return this._cellIndex;
  }
  get cell() {
    return this._cell;
  }
};

var NotebookCompatibleFileMatch = class extends FileMatchImpl {
  constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, searchInstanceID, modelService, replaceService, labelService, notebookEditorService) {
    super(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, modelService, replaceService, labelService);
    this.searchInstanceID = searchInstanceID;
    this.notebookEditorService = notebookEditorService;
    this._notebookEditorWidget = null;
    this._editorWidgetListener = null;
    this._cellMatches = /* @__PURE__ */ new Map();
    this._notebookUpdateScheduler = this._register(new RunOnceScheduler(this.updateMatchesForEditorWidget.bind(this), 250));
  }
  get cellContext() {
    const cellContext = /* @__PURE__ */ new Map();
    this._cellMatches.forEach((cellMatch) => {
      cellContext.set(cellMatch.id, cellMatch.context);
    });
    return cellContext;
  }
  getCellMatch(cellID) {
    return this._cellMatches.get(cellID);
  }
  addCellMatch(rawCell) {
    const cellMatch = new CellMatch(this, isINotebookCellMatchWithModel(rawCell) ? rawCell.cell : void 0, rawCell.index);
    this._cellMatches.set(cellMatch.id, cellMatch);
    this.addWebviewMatchesToCell(cellMatch.id, rawCell.webviewResults);
    this.addContentMatchesToCell(cellMatch.id, rawCell.contentResults);
  }
  addWebviewMatchesToCell(cellID, webviewMatches) {
    const cellMatch = this.getCellMatch(cellID);
    if (cellMatch !== void 0) {
      cellMatch.addWebviewMatches(webviewMatches);
    }
  }
  addContentMatchesToCell(cellID, contentMatches) {
    const cellMatch = this.getCellMatch(cellID);
    if (cellMatch !== void 0) {
      cellMatch.addContentMatches(contentMatches);
    }
  }
  revealCellRange(match2, outputOffset) {
    if (!this._notebookEditorWidget || !match2.cell) {
      return;
    }
    if (match2.webviewIndex !== void 0) {
      const index2 = this._notebookEditorWidget.getCellIndex(match2.cell);
      if (index2 !== void 0) {
        this._notebookEditorWidget.revealCellOffsetInCenter(match2.cell, outputOffset ?? 0);
      }
    } else {
      match2.cell.updateEditState(match2.cell.getEditState(), "focusNotebookCell");
      this._notebookEditorWidget.setCellEditorSelection(match2.cell, match2.range());
      this._notebookEditorWidget.revealRangeInCenterIfOutsideViewportAsync(match2.cell, match2.range());
    }
  }
  bindNotebookEditorWidget(widget) {
    if (this._notebookEditorWidget === widget) {
      return;
    }
    this._notebookEditorWidget = widget;
    this._editorWidgetListener = this._notebookEditorWidget.textModel?.onDidChangeContent((e) => {
      if (!e.rawEvents.some((event) => event.kind === 10 /* ChangeCellContent */ || event.kind === 1 /* ModelChange */)) {
        return;
      }
      this._notebookUpdateScheduler.schedule();
    }) ?? null;
    this._addNotebookHighlights();
  }
  unbindNotebookEditorWidget(widget) {
    if (widget && this._notebookEditorWidget !== widget) {
      return;
    }
    if (this._notebookEditorWidget) {
      this._notebookUpdateScheduler.cancel();
      this._editorWidgetListener?.dispose();
    }
    this._removeNotebookHighlights();
    this._notebookEditorWidget = null;
  }
  updateNotebookHighlights() {
    if (this.parent().showHighlights) {
      this._addNotebookHighlights();
      this.setNotebookFindMatchDecorationsUsingCellMatches(Array.from(this._cellMatches.values()));
    } else {
      this._removeNotebookHighlights();
    }
  }
  _addNotebookHighlights() {
    if (!this._notebookEditorWidget) {
      return;
    }
    this._findMatchDecorationModel?.stopWebviewFind();
    this._findMatchDecorationModel?.dispose();
    this._findMatchDecorationModel = new FindMatchDecorationModel(this._notebookEditorWidget, this.searchInstanceID);
    if (this._selectedMatch instanceof MatchInNotebook) {
      this.highlightCurrentFindMatchDecoration(this._selectedMatch);
    }
  }
  _removeNotebookHighlights() {
    if (this._findMatchDecorationModel) {
      this._findMatchDecorationModel?.stopWebviewFind();
      this._findMatchDecorationModel?.dispose();
      this._findMatchDecorationModel = void 0;
    }
  }
  updateNotebookMatches(matches2, modelChange) {
    if (!this._notebookEditorWidget) {
      return;
    }
    const oldCellMatches = new Map(this._cellMatches);
    if (this._notebookEditorWidget.getId() !== this._lastEditorWidgetIdForUpdate) {
      this._cellMatches.clear();
      this._lastEditorWidgetIdForUpdate = this._notebookEditorWidget.getId();
    }
    matches2.forEach((match2) => {
      let existingCell = this._cellMatches.get(match2.cell.id);
      if (this._notebookEditorWidget && !existingCell) {
        const index2 = this._notebookEditorWidget.getCellIndex(match2.cell);
        const existingRawCell = oldCellMatches.get(`${rawCellPrefix}${index2}`);
        if (existingRawCell) {
          existingRawCell.setCellModel(match2.cell);
          existingRawCell.clearAllMatches();
          existingCell = existingRawCell;
        }
      }
      existingCell?.clearAllMatches();
      const cell = existingCell ?? new CellMatch(this, match2.cell, match2.index);
      cell.addContentMatches(contentMatchesToTextSearchMatches(match2.contentMatches, match2.cell));
      cell.addWebviewMatches(webviewMatchesToTextSearchMatches(match2.webviewMatches));
      this._cellMatches.set(cell.id, cell);
    });
    this._findMatchDecorationModel?.setAllFindMatchesDecorations(matches2);
    if (this._selectedMatch instanceof MatchInNotebook) {
      this.highlightCurrentFindMatchDecoration(this._selectedMatch);
    }
    this._onChange.fire({ forceUpdateModel: modelChange });
  }
  setNotebookFindMatchDecorationsUsingCellMatches(cells) {
    if (!this._findMatchDecorationModel) {
      return;
    }
    const cellFindMatch = coalesce(cells.map((cell) => {
      const webviewMatches = coalesce(cell.webviewMatches.map((match2) => {
        if (!match2.webviewIndex) {
          return void 0;
        }
        return {
          index: match2.webviewIndex
        };
      }));
      if (!cell.cell) {
        return void 0;
      }
      const findMatches = cell.contentMatches.map((match2) => {
        return new FindMatch(match2.range(), [match2.text()]);
      });
      return new CellFindMatchModel(cell.cell, cell.cellIndex, findMatches, webviewMatches);
    }));
    try {
      this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatch);
    } catch (e) {
    }
  }
  async updateMatchesForEditorWidget() {
    if (!this._notebookEditorWidget) {
      return;
    }
    this._textMatches = /* @__PURE__ */ new Map();
    const wordSeparators2 = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const allMatches = await this._notebookEditorWidget.find(this._query.pattern, {
      regex: this._query.isRegExp,
      wholeWord: this._query.isWordMatch,
      caseSensitive: this._query.isCaseSensitive,
      wordSeparators: wordSeparators2 ?? void 0,
      includeMarkupInput: this._query.notebookInfo?.isInNotebookMarkdownInput,
      includeMarkupPreview: this._query.notebookInfo?.isInNotebookMarkdownPreview,
      includeCodeInput: this._query.notebookInfo?.isInNotebookCellInput,
      includeOutput: this._query.notebookInfo?.isInNotebookCellOutput
    }, CancellationToken.None, false, true, this.searchInstanceID);
    this.updateNotebookMatches(allMatches, true);
  }
  async showMatch(match2) {
    const offset = await this.highlightCurrentFindMatchDecoration(match2);
    this.setSelectedMatch(match2);
    this.revealCellRange(match2, offset);
  }
  async highlightCurrentFindMatchDecoration(match2) {
    if (!this._findMatchDecorationModel || !match2.cell) {
      return null;
    }
    if (match2.webviewIndex === void 0) {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(match2.cell, match2.range());
    } else {
      return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(match2.cell, match2.webviewIndex);
    }
  }
  matches() {
    const matches2 = Array.from(this._cellMatches.values()).flatMap((e) => e.matches());
    return [...super.matches(), ...matches2];
  }
  removeMatch(match2) {
    if (match2 instanceof MatchInNotebook) {
      match2.cellParent.remove(match2);
      if (match2.cellParent.matches().length === 0) {
        this._cellMatches.delete(match2.cellParent.id);
      }
      if (this.isMatchSelected(match2)) {
        this.setSelectedMatch(null);
        this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
      } else {
        this.updateHighlights();
      }
      this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
    } else {
      super.removeMatch(match2);
    }
  }
  cellMatches() {
    return Array.from(this._cellMatches.values());
  }
  createMatches() {
    const model = this.modelService.getModel(this._resource);
    if (model) {
      this.bindModel(model);
      this.updateMatchesForModel();
    } else {
      const notebookEditorWidgetBorrow = this.notebookEditorService.retrieveExistingWidgetFromURI(this.resource);
      if (notebookEditorWidgetBorrow?.value) {
        this.bindNotebookEditorWidget(notebookEditorWidgetBorrow.value);
      }
      if (this.rawMatch.results) {
        this.rawMatch.results.filter(resultIsMatch).forEach((rawMatch) => {
          textSearchResultToMatches(rawMatch, this, false).forEach((m) => this.add(m));
        });
      }
      if (isINotebookFileMatchWithModel(this.rawMatch) || isINotebookFileMatchNoModel(this.rawMatch)) {
        this.rawMatch.cellResults?.forEach((cell) => this.addCellMatch(cell));
        this.setNotebookFindMatchDecorationsUsingCellMatches(this.cellMatches());
        this._onChange.fire({ forceUpdateModel: true });
      }
      this.addContext(this.rawMatch.results);
    }
  }
  get hasChildren() {
    return super.hasChildren || this._cellMatches.size > 0;
  }
  setSelectedMatch(match2) {
    if (match2) {
      if (!this.isMatchSelected(match2) && isIMatchInNotebook(match2)) {
        this._selectedMatch = match2;
        return;
      }
      if (!this._textMatches.has(match2.id())) {
        return;
      }
      if (this.isMatchSelected(match2)) {
        return;
      }
    }
    this._selectedMatch = match2;
    this.updateHighlights();
  }
  dispose() {
    this.unbindNotebookEditorWidget();
    super.dispose();
  }
};

NotebookCompatibleFileMatch = __decorateClass([
  __decorateParam(7, IModelService),
  __decorateParam(8, IReplaceService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, INotebookEditorService)
], NotebookCompatibleFileMatch);

function textSearchMatchesToNotebookMatches(textSearchMatches, cell) {
  const notebookMatches = [];
  textSearchMatches.forEach((textSearchMatch) => {
    const previewLines = textSearchMatch.previewText.split("\n");
    textSearchMatch.rangeLocations.map((rangeLocation) => {
      const previewRange = rangeLocation.preview;
      const match2 = new MatchInNotebook(cell, previewLines, previewRange, rangeLocation.source, textSearchMatch.webviewIndex);
      notebookMatches.push(match2);
    });
  });
  return notebookMatches;
}
export { textSearchMatchesToNotebookMatches, MatchInNotebook, CellMatch, NotebookCompatibleFileMatch };
