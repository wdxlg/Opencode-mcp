// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/AISearch/aiSearchModel.ts
import { TextSearchHeadingImpl } from "./module-2855.mjs";
import { AI_TEXT_SEARCH_RESULT_ID, FILE_MATCH_PREFIX, FOLDER_MATCH_PREFIX, TEXT_SEARCH_HEADING_PREFIX, getFileMatches } from "./module-2545.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Lazy } from "./module-0028.mjs";
import { ILabelService } from "./module-0641.mjs";
import { FileMatchImpl } from "./module-2848.mjs";
import { Range2 } from "./module-0106.mjs";
import { resultIsMatch } from "./module-0999.mjs";
import { textSearchResultToMatches } from "./module-2847.mjs";
import { IModelService } from "./module-0080.mjs";
import { IReplaceService } from "./module-2839.mjs";


// src/vs/workbench/contrib/search/browser/AISearch/aiSearchModel.ts
var AITextSearchHeadingImpl = class extends TextSearchHeadingImpl {
  constructor(parent, instantiationService, uriIdentityService) {
    super(false, parent, instantiationService, uriIdentityService);
    this.hidden = true;
  }
  name() {
    return "AI";
  }
  id() {
    return TEXT_SEARCH_HEADING_PREFIX + AI_TEXT_SEARCH_RESULT_ID;
  }
  get isAIContributed() {
    return true;
  }
  get query() {
    return this._query;
  }
  set query(query) {
    this.clearQuery();
    if (!query) {
      return;
    }
    this._folderMatches = (query && query.folderQueries || []).map((fq) => fq.folder).map((resource, index2) => this._createBaseFolderMatch(resource, resource.toString(), index2, query));
    this._folderMatches.forEach((fm) => this._folderMatchesMap.set(fm.resource, fm));
    this._query = query;
  }
  fileCount() {
    const uniqueFileUris = new ResourceSet();
    for (const folderMatch of this.folderMatches()) {
      if (folderMatch.isEmpty()) {
        continue;
      }
      for (const fileMatch of folderMatch.allDownstreamFileMatches()) {
        uniqueFileUris.add(fileMatch.resource);
      }
    }
    return uniqueFileUris.size;
  }
  _createBaseFolderMatch(resource, id2, index2, query) {
    const folderMatch = this._register(this.createWorkspaceRootWithResourceImpl(resource, id2, index2, query));
    const disposable = folderMatch.onChange((event) => this._onChange.fire(event));
    this._register(folderMatch.onDispose(() => disposable.dispose()));
    return folderMatch;
  }
  createWorkspaceRootWithResourceImpl(resource, id2, index2, query) {
    return this.instantiationService.createInstance(AIFolderMatchWorkspaceRootImpl, resource, id2, index2, query, this);
  }
};

AITextSearchHeadingImpl = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService)
], AITextSearchHeadingImpl);

var AIFolderMatchWorkspaceRootImpl = class extends Disposable {
  // id to fileMatch
  constructor(_resource, _id, _index, _query, _parent, instantiationService, labelService) {
    super();
    this._resource = _resource;
    this._index = _index;
    this._query = _query;
    this._parent = _parent;
    this.instantiationService = instantiationService;
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._onDispose = this._register(new Emitter());
    this.onDispose = this._onDispose.event;
    this.latestRank = 0;
    this.replacingAll = false;
    this._fileMatches = /* @__PURE__ */ new Map();
    this._id = FOLDER_MATCH_PREFIX + _id;
    this._name = new Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : "");
    this._unDisposedFileMatches = /* @__PURE__ */ new Map();
  }
  get resource() {
    return this._resource;
  }
  id() {
    return this._id;
  }
  index() {
    return this._index;
  }
  name() {
    return this._name.value;
  }
  count() {
    return this._fileMatches.size;
  }
  doAddFile(fileMatch) {
    this._fileMatches.set(fileMatch.id(), fileMatch);
  }
  createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
    const fileMatch = this.instantiationService.createInstance(
      AIFileMatch,
      this._query.contentPattern,
      this._query.previewOptions,
      this._query.maxResults,
      this,
      rawFileMatch,
      this,
      rawFileMatch.resource.toString() + "_" + Date.now().toString(),
      this.latestRank++
    );
    fileMatch.createMatches();
    this.doAddFile(fileMatch);
    const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
    this._register(fileMatch.onDispose(() => disposable.dispose()));
    return fileMatch;
  }
  isAIContributed() {
    return true;
  }
  onFileChange(fileMatch, removed = false) {
    let added = false;
    if (!this._fileMatches.has(fileMatch.id())) {
      this.doAddFile(fileMatch);
      added = true;
    }
    if (fileMatch.count() === 0) {
      this.doRemoveFile([fileMatch], false, false);
      added = false;
      removed = true;
    }
    this._onChange.fire({ elements: [fileMatch], added, removed });
  }
  get hasChildren() {
    return this._fileMatches.size > 0;
  }
  parent() {
    return this._parent;
  }
  matches() {
    return [...this._fileMatches.values()];
  }
  allDownstreamFileMatches() {
    return [...this._fileMatches.values()];
  }
  remove(matches2) {
    if (!Array.isArray(matches2)) {
      matches2 = [matches2];
    }
    const allMatches = getFileMatches(matches2);
    this.doRemoveFile(allMatches);
  }
  addFileMatch(raw, silent, searchInstanceID) {
    const added = [];
    const updated = [];
    raw.forEach((rawFileMatch) => {
      const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
      added.push(fileMatch);
    });
    const elements = [...added, ...updated];
    if (!silent && elements.length) {
      this._onChange.fire({ elements, added: !!added.length });
    }
  }
  isEmpty() {
    return this.recursiveFileCount() === 0;
  }
  clear(clearingAll) {
    const changed = this.allDownstreamFileMatches();
    if (changed.length > 0) {
      this.disposeMatches();
      this._onChange.fire({ elements: changed, removed: true, added: false, clearingAll });
    }
  }
  get showHighlights() {
    return this._parent.showHighlights;
  }
  get searchModel() {
    return this._searchResult.searchModel;
  }
  get _searchResult() {
    return this._parent.parent();
  }
  get query() {
    return this._query;
  }
  getDownstreamFileMatch(uri5) {
    for (const fileMatch of this._fileMatches.values()) {
      if (fileMatch.resource.toString() === uri5.toString()) {
        return fileMatch;
      }
    }
    return null;
  }
  replaceAll() {
    throw new Error("Cannot replace in AI search");
  }
  recursiveFileCount() {
    return this._fileMatches.size;
  }
  doRemoveFile(fileMatches, dispose2 = true, trigger = true, keepReadonly = false) {
    const removed = [];
    for (const match2 of fileMatches) {
      if (this._fileMatches.get(match2.id())) {
        if (keepReadonly && match2.hasReadonlyMatches()) {
          continue;
        }
        this._fileMatches.delete(match2.id());
        if (dispose2) {
          match2.dispose();
        } else {
          this._unDisposedFileMatches.set(match2.id(), match2);
        }
        removed.push(match2);
      }
    }
    if (trigger) {
      this._onChange.fire({ elements: removed, removed: true });
    }
  }
  replace(match2) {
    throw new Error("Cannot replace in AI search");
  }
  bindModel(model) {
  }
  unbindNotebookEditorWidget(editor, resource) {
  }
  bindNotebookEditorWidget(editor, resource) {
    return Promise.resolve();
  }
  hasOnlyReadOnlyMatches() {
    return Array.from(this._fileMatches.values()).every((fm) => fm.hasOnlyReadOnlyMatches());
  }
  fileMatchesIterator() {
    return this._fileMatches.values();
  }
  folderMatchesIterator() {
    return [].values();
  }
  recursiveMatchCount() {
    return this._fileMatches.size;
  }
  disposeMatches() {
    [...this._fileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
    [...this._unDisposedFileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
    this._fileMatches.clear();
  }
  dispose() {
    this.disposeMatches();
    this._onDispose.fire();
    super.dispose();
  }
};

AIFolderMatchWorkspaceRootImpl = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILabelService)
], AIFolderMatchWorkspaceRootImpl);

var AIFileMatch = class extends FileMatchImpl {
  constructor(_query, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, _id, rank, modelService, replaceService, labelService) {
    super({ pattern: _query }, _previewOptions, _maxResults, _parent, rawMatch, _closestRoot, modelService, replaceService, labelService);
    this._id = _id;
    this.rank = rank;
  }
  id() {
    return FILE_MATCH_PREFIX + this._id;
  }
  getFullRange() {
    let earliestStart = void 0;
    let latestEnd = void 0;
    for (const match2 of this.matches()) {
      const matchStart = match2.range().getStartPosition();
      const matchEnd = match2.range().getEndPosition();
      if (earliestStart === void 0) {
        earliestStart = matchStart;
      } else if (matchStart.isBefore(earliestStart)) {
        earliestStart = matchStart;
      }
      if (latestEnd === void 0) {
        latestEnd = matchEnd;
      } else if (!matchEnd.isBefore(latestEnd)) {
        latestEnd = matchEnd;
      }
    }
    if (earliestStart === void 0 || latestEnd === void 0) {
      return void 0;
    }
    return new Range2(earliestStart.lineNumber, earliestStart.column, latestEnd.lineNumber, latestEnd.column);
  }
  rangeAsString() {
    const range2 = this.getFullRange();
    if (!range2) {
      return void 0;
    }
    return range2.startLineNumber + ":" + range2.startColumn + "-" + range2.endLineNumber + ":" + range2.endColumn;
  }
  name() {
    const range2 = this.rangeAsString();
    return super.name() + range2 ? " " + range2 : "";
  }
  createMatches() {
    if (this.rawMatch.results) {
      this.rawMatch.results.filter(resultIsMatch).forEach((rawMatch) => {
        textSearchResultToMatches(rawMatch, this, true).forEach((m) => this.add(m));
      });
    }
  }
};

AIFileMatch = __decorateClass([
  __decorateParam(8, IModelService),
  __decorateParam(9, IReplaceService),
  __decorateParam(10, ILabelService)
], AIFileMatch);
export { AITextSearchHeadingImpl, AIFolderMatchWorkspaceRootImpl, AIFileMatch };
