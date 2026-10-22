// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/textSearchHeading.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { RangeHighlightDecorations2 } from "./module-2824.mjs";
import { PLAIN_TEXT_SEARCH__RESULT_ID, TEXT_SEARCH_HEADING_PREFIX, isSearchTreeFileMatch, isSearchTreeFolderMatch } from "./module-2519.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { isNotebookFileMatch } from "./module-2809.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { FolderMatchNoRootImpl, FolderMatchWorkspaceRootImpl } from "./module-2829.mjs";
import { IReplaceService } from "./module-2814.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/textSearchHeading.ts
var TextSearchHeadingImpl = class extends Disposable {
  constructor(_allowOtherResults, _parent, instantiationService, uriIdentityService) {
    super();
    this._allowOtherResults = _allowOtherResults;
    this._parent = _parent;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._isDirty = false;
    this._showHighlights = false;
    this._query = null;
    this.disposePastResults = () => Promise.resolve();
    this._folderMatches = [];
    this._otherFilesMatch = null;
    this._folderMatchesMap = TernarySearchTree.forUris((key3) => this.uriIdentityService.extUri.ignorePathCasing(key3));
    this.resource = null;
    this.hidden = false;
    this._rangeHighlightDecorations = this.instantiationService.createInstance(RangeHighlightDecorations2);
    this._register(this.onChange((e4) => {
      if (e4.removed) {
        this._isDirty = !this.isEmpty();
      }
    }));
  }
  hide() {
    this.hidden = true;
    this.clear();
  }
  parent() {
    return this._parent;
  }
  get hasChildren() {
    return this._folderMatches.length > 0;
  }
  get isDirty() {
    return this._isDirty;
  }
  getFolderMatch(resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    if (!folderMatch && this._allowOtherResults && this._otherFilesMatch) {
      return this._otherFilesMatch;
    }
    return folderMatch;
  }
  add(allRaw, searchInstanceID, silent = false) {
    const { byFolder, other } = this.groupFilesByFolder(allRaw);
    byFolder.forEach((raw) => {
      if (!raw.length) {
        return;
      }
      const folderMatch = this.getFolderMatch(raw[0].resource);
      folderMatch?.addFileMatch(raw, silent, searchInstanceID);
    });
    if (!this.isAIContributed) {
      this._otherFilesMatch?.addFileMatch(other, silent, searchInstanceID);
    }
    this.disposePastResults();
  }
  remove(matches2, ai = false) {
    if (!Array.isArray(matches2)) {
      matches2 = [matches2];
    }
    matches2.forEach((m) => {
      if (isSearchTreeFolderMatch(m)) {
        m.clear();
      }
    });
    const fileMatches = matches2.filter((m) => isSearchTreeFileMatch(m));
    const { byFolder, other } = this.groupFilesByFolder(fileMatches);
    byFolder.forEach((matches3) => {
      if (!matches3.length) {
        return;
      }
      this.getFolderMatch(matches3[0].resource)?.remove(matches3);
    });
    if (other.length) {
      this.getFolderMatch(other[0].resource)?.remove(other);
    }
  }
  groupFilesByFolder(fileMatches) {
    const rawPerFolder = new ResourceMap();
    const otherFileMatches = [];
    this._folderMatches.forEach((fm) => rawPerFolder.set(fm.resource, []));
    fileMatches.forEach((rawFileMatch) => {
      const folderMatch = this.getFolderMatch(rawFileMatch.resource);
      if (!folderMatch) {
        return;
      }
      const resource = folderMatch.resource;
      if (resource) {
        rawPerFolder.get(resource).push(rawFileMatch);
      } else {
        otherFileMatches.push(rawFileMatch);
      }
    });
    return {
      byFolder: rawPerFolder,
      other: otherFileMatches
    };
  }
  isEmpty() {
    return this.folderMatches().every((folderMatch) => folderMatch.isEmpty());
  }
  findFolderSubstr(resource) {
    return this._folderMatchesMap.findSubstr(resource);
  }
  clearQuery() {
    const oldFolderMatches = this.folderMatches();
    this.disposePastResults = async () => {
      oldFolderMatches.forEach((match2) => match2.clear());
      oldFolderMatches.forEach((match2) => match2.dispose());
      this._isDirty = false;
    };
    this.cachedSearchComplete = void 0;
    this._rangeHighlightDecorations.removeHighlightRange();
    this._folderMatchesMap = TernarySearchTree.forUris((key3) => this.uriIdentityService.extUri.ignorePathCasing(key3));
  }
  folderMatches() {
    return this._otherFilesMatch && this._allowOtherResults ? [
      ...this._folderMatches,
      this._otherFilesMatch
    ] : this._folderMatches;
  }
  disposeMatches() {
    this.folderMatches().forEach((folderMatch) => folderMatch.dispose());
    this._folderMatches = [];
    this._folderMatchesMap = TernarySearchTree.forUris((key3) => this.uriIdentityService.extUri.ignorePathCasing(key3));
    this._rangeHighlightDecorations.removeHighlightRange();
  }
  matches() {
    const matches2 = [];
    this.folderMatches().forEach((folderMatch) => {
      matches2.push(folderMatch.allDownstreamFileMatches());
    });
    return [].concat(...matches2);
  }
  get showHighlights() {
    return this._showHighlights;
  }
  toggleHighlights(value2) {
    if (this._showHighlights === value2) {
      return;
    }
    this._showHighlights = value2;
    let selectedMatch = null;
    this.matches().forEach((fileMatch) => {
      fileMatch.updateHighlights();
      if (isNotebookFileMatch(fileMatch)) {
        fileMatch.updateNotebookHighlights();
      }
      if (!selectedMatch) {
        selectedMatch = fileMatch.getSelectedMatch();
      }
    });
    if (this._showHighlights && selectedMatch) {
      this._rangeHighlightDecorations.highlightRange(
        selectedMatch.parent().resource,
        selectedMatch.range()
      );
    } else {
      this._rangeHighlightDecorations.removeHighlightRange();
    }
  }
  get rangeHighlightDecorations() {
    return this._rangeHighlightDecorations;
  }
  fileCount() {
    return this.folderMatches().reduce((prev, match2) => prev + match2.recursiveFileCount(), 0);
  }
  count() {
    return this.matches().reduce((prev, match2) => prev + match2.count(), 0);
  }
  clear(clearAll = true) {
    this.cachedSearchComplete = void 0;
    this.folderMatches().forEach((folderMatch) => folderMatch.clear(clearAll));
    this.disposeMatches();
    this._folderMatches = [];
    this._otherFilesMatch = null;
  }
  async dispose() {
    this._rangeHighlightDecorations.dispose();
    this.disposeMatches();
    super.dispose();
    await this.disposePastResults();
  }
};

TextSearchHeadingImpl = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IUriIdentityService)
], TextSearchHeadingImpl);

var PlainTextSearchHeadingImpl = class extends TextSearchHeadingImpl {
  constructor(parent, instantiationService, uriIdentityService, replaceService) {
    super(true, parent, instantiationService, uriIdentityService);
    this.replaceService = replaceService;
  }
  id() {
    return TEXT_SEARCH_HEADING_PREFIX + PLAIN_TEXT_SEARCH__RESULT_ID;
  }
  get isAIContributed() {
    return false;
  }
  replace(match2) {
    return this.getFolderMatch(match2.resource)?.replace(match2) ?? Promise.resolve();
  }
  name() {
    return "Text";
  }
  replaceAll(progress) {
    this.replacingAll = true;
    const promise = this.replaceService.replace(this.matches(), progress);
    return promise.then(() => {
      this.replacingAll = false;
      this.clear();
    }, () => {
      this.replacingAll = false;
    });
  }
  set replacingAll(running) {
    this.folderMatches().forEach((folderMatch) => {
      folderMatch.replacingAll = running;
    });
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
    this._otherFilesMatch = this._createBaseFolderMatch(null, "otherFiles", this._folderMatches.length + 1, query);
    this._query = query;
  }
  _createBaseFolderMatch(resource, id2, index2, query) {
    let folderMatch;
    if (resource) {
      folderMatch = this.createWorkspaceRootWithResourceImpl(resource, id2, index2, query);
    } else {
      folderMatch = this.createNoRootWorkspaceImpl(id2, index2, query);
    }
    const disposable = folderMatch.onChange((event) => this._onChange.fire(event));
    Event2.once(folderMatch.onDispose)(() => disposable.dispose());
    return folderMatch;
  }
  createWorkspaceRootWithResourceImpl(resource, id2, index2, query) {
    return this.instantiationService.createInstance(FolderMatchWorkspaceRootImpl, resource, id2, index2, query, this);
  }
  createNoRootWorkspaceImpl(id2, index2, query) {
    return this.instantiationService.createInstance(FolderMatchNoRootImpl, id2, index2, query, this);
  }
};

PlainTextSearchHeadingImpl = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IReplaceService)
], PlainTextSearchHeadingImpl);
export { TextSearchHeadingImpl, PlainTextSearchHeadingImpl };
