// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/fileMatch.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { Lazy } from "./module-0028.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { overviewRulerFindMatchForeground } from "./module-0229.mjs";
import { minimapFindMatch } from "./module-0230.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, resultIsMatch } from "./module-0999.mjs";
import { textSearchResultToMatches } from "./module-2847.mjs";
import { editorMatchesToTextSearchResults, getTextSearchMatchWithModelContext } from "./module-2846.mjs";
import { FILE_MATCH_PREFIX } from "./module-2545.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { IReplaceService } from "./module-2839.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/fileMatch.ts
var FileMatchImpl = class extends Disposable {
  constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, modelService, replaceService, labelService) {
    super();
    this._query = _query;
    this._previewOptions = _previewOptions;
    this._maxResults = _maxResults;
    this._parent = _parent;
    this.rawMatch = rawMatch;
    this._closestRoot = _closestRoot;
    this.modelService = modelService;
    this.replaceService = replaceService;
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._onDispose = this._register(new Emitter());
    this.onDispose = this._onDispose.event;
    this._model = null;
    this._modelListener = null;
    this._selectedMatch = null;
    this._modelDecorations = [];
    this._context = /* @__PURE__ */ new Map();
    this.replaceQ = Promise.resolve();
    this._resource = this.rawMatch.resource;
    this._textMatches = /* @__PURE__ */ new Map();
    this._removedTextMatches = /* @__PURE__ */ new Set();
    this._updateScheduler = this._register(new RunOnceScheduler(this.updateMatchesForModel.bind(this), 250));
    this._name = new Lazy(() => labelService.getUriBasenameLabel(this.resource));
  }
  static {
    this._CURRENT_FIND_MATCH = ModelDecorationOptions.register({
      description: "search-current-find-match",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      zIndex: 13,
      className: "currentFindMatch",
      inlineClassName: "currentFindMatchInline",
      overviewRuler: {
        color: themeColorFromId(overviewRulerFindMatchForeground),
        position: 2 /* Center */
      },
      minimap: {
        color: themeColorFromId(minimapFindMatch),
        position: 1 /* Inline */
      }
    });
  }
  static {
    this._FIND_MATCH = ModelDecorationOptions.register({
      description: "search-find-match",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "findMatch",
      inlineClassName: "findMatchInline",
      overviewRuler: {
        color: themeColorFromId(overviewRulerFindMatchForeground),
        position: 2 /* Center */
      },
      minimap: {
        color: themeColorFromId(minimapFindMatch),
        position: 1 /* Inline */
      }
    });
  }
  static getDecorationOption(selected) {
    return selected ? FileMatchImpl._CURRENT_FIND_MATCH : FileMatchImpl._FIND_MATCH;
  }
  get context() {
    return new Map(this._context);
  }
  get closestRoot() {
    return this._closestRoot;
  }
  hasReadonlyMatches() {
    return this.matches().some((m) => m.isReadonly);
  }
  createMatches() {
    const model = this.modelService.getModel(this._resource);
    if (model) {
      this.bindModel(model);
      this.updateMatchesForModel();
    } else {
      if (this.rawMatch.results) {
        this.rawMatch.results.filter(resultIsMatch).forEach((rawMatch) => {
          textSearchResultToMatches(rawMatch, this, false).forEach((m) => this.add(m));
        });
      }
    }
  }
  bindModel(model) {
    this._model = model;
    this._modelListener = new DisposableStore();
    this._modelListener.add(this._model.onDidChangeContent(() => {
      this._updateScheduler.schedule();
    }));
    this._modelListener.add(this._model.onWillDispose(() => this.onModelWillDispose()));
    this.updateHighlights();
  }
  onModelWillDispose() {
    this.updateMatchesForModel();
    this.unbindModel();
  }
  unbindModel() {
    if (this._model) {
      this._updateScheduler.cancel();
      this._model.changeDecorations((accessor) => {
        this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, []);
      });
      this._model = null;
      this._modelListener.dispose();
    }
  }
  updateMatchesForModel() {
    if (!this._model) {
      return;
    }
    this._textMatches = /* @__PURE__ */ new Map();
    const wordSeparators2 = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const matches2 = this._model.findMatches(this._query.pattern, this._model.getFullModelRange(), !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators2, false, this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS);
    this.updateMatches(matches2, true, this._model, false);
  }
  async updatesMatchesForLineAfterReplace(lineNumber, modelChange) {
    if (!this._model) {
      return;
    }
    const range2 = {
      startLineNumber: lineNumber,
      startColumn: this._model.getLineMinColumn(lineNumber),
      endLineNumber: lineNumber,
      endColumn: this._model.getLineMaxColumn(lineNumber)
    };
    const oldMatches = Array.from(this._textMatches.values()).filter((match2) => match2.range().startLineNumber === lineNumber);
    oldMatches.forEach((match2) => this._textMatches.delete(match2.id()));
    const wordSeparators2 = this._query.isWordMatch && this._query.wordSeparators ? this._query.wordSeparators : null;
    const matches2 = this._model.findMatches(this._query.pattern, range2, !!this._query.isRegExp, !!this._query.isCaseSensitive, wordSeparators2, false, this._maxResults ?? DEFAULT_MAX_SEARCH_RESULTS);
    this.updateMatches(matches2, modelChange, this._model, false);
  }
  updateMatches(matches2, modelChange, model, isAiContributed) {
    const textSearchResults = editorMatchesToTextSearchResults(matches2, model, this._previewOptions);
    textSearchResults.forEach((textSearchResult) => {
      textSearchResultToMatches(textSearchResult, this, isAiContributed).forEach((match2) => {
        if (!this._removedTextMatches.has(match2.id())) {
          this.add(match2);
          if (this.isMatchSelected(match2)) {
            this._selectedMatch = match2;
          }
        }
      });
    });
    this.addContext(getTextSearchMatchWithModelContext(textSearchResults, model, this.parent().parent().query));
    this._onChange.fire({ forceUpdateModel: modelChange });
    this.updateHighlights();
  }
  updateHighlights() {
    if (!this._model) {
      return;
    }
    this._model.changeDecorations((accessor) => {
      const newDecorations = this.parent().showHighlights ? this.matches().map((match2) => ({
        range: match2.range(),
        options: FileMatchImpl.getDecorationOption(this.isMatchSelected(match2))
      })) : [];
      this._modelDecorations = accessor.deltaDecorations(this._modelDecorations, newDecorations);
    });
  }
  id() {
    return FILE_MATCH_PREFIX + this.resource.toString();
  }
  parent() {
    return this._parent;
  }
  get hasChildren() {
    return this._textMatches.size > 0;
  }
  matches() {
    return [...this._textMatches.values()];
  }
  textMatches() {
    return Array.from(this._textMatches.values());
  }
  remove(matches2) {
    if (!Array.isArray(matches2)) {
      matches2 = [matches2];
    }
    for (const match2 of matches2) {
      this.removeMatch(match2);
      this._removedTextMatches.add(match2.id());
    }
    this._onChange.fire({ didRemove: true });
  }
  async replace(toReplace) {
    return this.replaceQ = this.replaceQ.finally(async () => {
      await this.replaceService.replace(toReplace);
      await this.updatesMatchesForLineAfterReplace(toReplace.range().startLineNumber, false);
    });
  }
  setSelectedMatch(match2) {
    if (match2) {
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
  getSelectedMatch() {
    return this._selectedMatch;
  }
  isMatchSelected(match2) {
    return !!this._selectedMatch && this._selectedMatch.id() === match2.id();
  }
  count() {
    return this.matches().length;
  }
  get resource() {
    return this._resource;
  }
  name() {
    return this._name.value;
  }
  addContext(results) {
    if (!results) {
      return;
    }
    const contexts = results.filter(((result) => !resultIsMatch(result)));
    return contexts.forEach((context2) => this._context.set(context2.lineNumber, context2.text));
  }
  add(match2, trigger) {
    this._textMatches.set(match2.id(), match2);
    if (trigger) {
      this._onChange.fire({ forceUpdateModel: true });
    }
  }
  removeMatch(match2) {
    this._textMatches.delete(match2.id());
    if (this.isMatchSelected(match2)) {
      this.setSelectedMatch(null);
      this._findMatchDecorationModel?.clearCurrentFindMatchDecoration();
    } else {
      this.updateHighlights();
    }
  }
  async resolveFileStat(fileService) {
    this._fileStat = await fileService.stat(this.resource).catch(() => void 0);
  }
  get fileStat() {
    return this._fileStat;
  }
  set fileStat(stat) {
    this._fileStat = stat;
  }
  dispose() {
    this.setSelectedMatch(null);
    this.unbindModel();
    this._onDispose.fire();
    super.dispose();
  }
  hasOnlyReadOnlyMatches() {
    return this.matches().every((match2) => match2.isReadonly);
  }
  // #region strictly notebook methods
  //#endregion
};

FileMatchImpl = __decorateClass([
  __decorateParam(6, IModelService),
  __decorateParam(7, IReplaceService),
  __decorateParam(8, ILabelService)
], FileMatchImpl);
export { FileMatchImpl };
