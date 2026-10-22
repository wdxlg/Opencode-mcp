// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/folderMatch.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { Lazy } from "./module-0028.mjs";
import { FOLDER_MATCH_PREFIX, getFileMatches, isSearchTreeFolderMatchNoRoot, isSearchTreeFolderMatchWorkspaceRoot } from "./module-2545.mjs";
import { isNotebookFileMatch } from "./module-2834.mjs";
import { resultIsMatch } from "./module-0999.mjs";
import { textSearchResultToMatches } from "./module-2847.mjs";
import { getIDFromINotebookCellMatch, isINotebookFileMatchWithModel } from "./module-2852.mjs";
import { isINotebookFileMatchNoModel } from "./module-2850.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IReplaceService } from "./module-2839.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { NotebookCompatibleFileMatch } from "./module-2853.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/folderMatch.ts
var FolderMatchImpl = class extends Disposable {
  constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
    super();
    this._resource = _resource;
    this._index = _index;
    this._query = _query;
    this._parent = _parent;
    this._searchResult = _searchResult;
    this._closestRoot = _closestRoot;
    this.replaceService = replaceService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._onDispose = this._register(new Emitter());
    this.onDispose = this._onDispose.event;
    this._replacingAll = false;
    this._fileMatches = new ResourceMap();
    this._folderMatches = new ResourceMap();
    this._folderMatchesMap = TernarySearchTree.forUris((key3) => this.uriIdentityService.extUri.ignorePathCasing(key3));
    this._unDisposedFileMatches = new ResourceMap();
    this._unDisposedFolderMatches = new ResourceMap();
    this._name = new Lazy(() => this.resource ? labelService.getUriBasenameLabel(this.resource) : "");
    this._id = FOLDER_MATCH_PREFIX + _id;
  }
  get searchModel() {
    return this._searchResult.searchModel;
  }
  get showHighlights() {
    return this._parent.showHighlights;
  }
  get closestRoot() {
    return this._closestRoot;
  }
  set replacingAll(b) {
    this._replacingAll = b;
  }
  id() {
    return this._id;
  }
  get resource() {
    return this._resource;
  }
  index() {
    return this._index;
  }
  name() {
    return this._name.value;
  }
  parent() {
    return this._parent;
  }
  isAIContributed() {
    return false;
  }
  get hasChildren() {
    return this._fileMatches.size > 0 || this._folderMatches.size > 0;
  }
  bindModel(model) {
    const fileMatch = this._fileMatches.get(model.uri);
    if (fileMatch) {
      fileMatch.bindModel(model);
    } else {
      const folderMatch = this.getFolderMatch(model.uri);
      const match2 = folderMatch?.getDownstreamFileMatch(model.uri);
      match2?.bindModel(model);
    }
  }
  createIntermediateFolderMatch(resource, id2, index2, query, baseWorkspaceFolder) {
    const folderMatch = this._register(this.instantiationService.createInstance(FolderMatchWithResourceImpl, resource, id2, index2, query, this, this._searchResult, baseWorkspaceFolder));
    this.configureIntermediateMatch(folderMatch);
    this.doAddFolder(folderMatch);
    return folderMatch;
  }
  configureIntermediateMatch(folderMatch) {
    const disposable = folderMatch.onChange((event) => this.onFolderChange(folderMatch, event));
    this._register(folderMatch.onDispose(() => disposable.dispose()));
  }
  clear(clearingAll = false) {
    const changed = this.allDownstreamFileMatches();
    this.disposeMatches();
    this._onChange.fire({ elements: changed, removed: true, added: false, clearingAll });
  }
  remove(matches2) {
    if (!Array.isArray(matches2)) {
      matches2 = [matches2];
    }
    const allMatches = getFileMatches(matches2);
    this.doRemoveFile(allMatches);
  }
  async replace(match2) {
    return this.replaceService.replace([match2]).then(() => {
      this.doRemoveFile([match2], true, true, true);
    });
  }
  replaceAll() {
    const matches2 = this.matches();
    return this.batchReplace(matches2);
  }
  matches() {
    return [...this.fileMatchesIterator(), ...this.folderMatchesIterator()];
  }
  fileMatchesIterator() {
    return this._fileMatches.values();
  }
  folderMatchesIterator() {
    return this._folderMatches.values();
  }
  isEmpty() {
    return this.fileCount() + this.folderCount() === 0;
  }
  getDownstreamFileMatch(uri5) {
    const directChildFileMatch = this._fileMatches.get(uri5);
    if (directChildFileMatch) {
      return directChildFileMatch;
    }
    const folderMatch = this.getFolderMatch(uri5);
    const match2 = folderMatch?.getDownstreamFileMatch(uri5);
    if (match2) {
      return match2;
    }
    return null;
  }
  allDownstreamFileMatches() {
    let recursiveChildren = [];
    const iterator = this.folderMatchesIterator();
    for (const elem of iterator) {
      recursiveChildren = recursiveChildren.concat(elem.allDownstreamFileMatches());
    }
    return [...this.fileMatchesIterator(), ...recursiveChildren];
  }
  fileCount() {
    return this._fileMatches.size;
  }
  folderCount() {
    return this._folderMatches.size;
  }
  count() {
    return this.fileCount() + this.folderCount();
  }
  recursiveFileCount() {
    return this.allDownstreamFileMatches().length;
  }
  recursiveMatchCount() {
    return this.allDownstreamFileMatches().reduce((prev, match2) => prev + match2.count(), 0);
  }
  get query() {
    return this._query;
  }
  doAddFile(fileMatch) {
    this._fileMatches.set(fileMatch.resource, fileMatch);
    this._unDisposedFileMatches.delete(fileMatch.resource);
  }
  hasOnlyReadOnlyMatches() {
    return Array.from(this._fileMatches.values()).every((fm) => fm.hasOnlyReadOnlyMatches());
  }
  uriHasParent(parent, child) {
    return this.uriIdentityService.extUri.isEqualOrParent(child, parent) && !this.uriIdentityService.extUri.isEqual(child, parent);
  }
  isInParentChain(folderMatch) {
    let matchItem = this;
    while (matchItem instanceof FolderMatchImpl) {
      if (matchItem.id() === folderMatch.id()) {
        return true;
      }
      matchItem = matchItem.parent();
    }
    return false;
  }
  getFolderMatch(resource) {
    const folderMatch = this._folderMatchesMap.findSubstr(resource);
    return folderMatch;
  }
  doAddFolder(folderMatch) {
    if (this.resource && !this.uriHasParent(this.resource, folderMatch.resource)) {
      throw Error(`${folderMatch.resource} does not belong as a child of ${this.resource}`);
    } else if (this.isInParentChain(folderMatch)) {
      throw Error(`${folderMatch.resource} is a parent of ${this.resource}`);
    }
    this._folderMatches.set(folderMatch.resource, folderMatch);
    this._folderMatchesMap.set(folderMatch.resource, folderMatch);
    this._unDisposedFolderMatches.delete(folderMatch.resource);
  }
  async batchReplace(matches2) {
    const allMatches = getFileMatches(matches2);
    await this.replaceService.replace(allMatches);
    this.doRemoveFile(allMatches, true, true, true);
  }
  onFileChange(fileMatch, removed = false) {
    let added = false;
    if (!this._fileMatches.has(fileMatch.resource)) {
      this.doAddFile(fileMatch);
      added = true;
    }
    if (fileMatch.count() === 0) {
      this.doRemoveFile([fileMatch], false, false);
      added = false;
      removed = true;
    }
    if (!this._replacingAll) {
      this._onChange.fire({ elements: [fileMatch], added, removed });
    }
  }
  onFolderChange(folderMatch, event) {
    if (!this._folderMatches.has(folderMatch.resource)) {
      this.doAddFolder(folderMatch);
    }
    if (folderMatch.isEmpty()) {
      this._folderMatches.delete(folderMatch.resource);
      folderMatch.dispose();
    }
    this._onChange.fire(event);
  }
  doRemoveFile(fileMatches, dispose2 = true, trigger = true, keepReadonly = false) {
    const removed = [];
    for (const match2 of fileMatches) {
      if (this._fileMatches.get(match2.resource)) {
        if (keepReadonly && match2.hasReadonlyMatches()) {
          continue;
        }
        this._fileMatches.delete(match2.resource);
        if (dispose2) {
          match2.dispose();
        } else {
          this._unDisposedFileMatches.set(match2.resource, match2);
        }
        removed.push(match2);
      } else {
        const folder = this.getFolderMatch(match2.resource);
        if (folder) {
          folder.doRemoveFile([match2], dispose2, trigger);
        } else {
          throw Error(`FileMatch ${match2.resource} is not located within FolderMatch ${this.resource}`);
        }
      }
    }
    if (trigger) {
      this._onChange.fire({ elements: removed, removed: true });
    }
  }
  async bindNotebookEditorWidget(editor, resource) {
    const fileMatch = this._fileMatches.get(resource);
    if (isNotebookFileMatch(fileMatch)) {
      if (fileMatch) {
        fileMatch.bindNotebookEditorWidget(editor);
        await fileMatch.updateMatchesForEditorWidget();
      } else {
        const folderMatches = this.folderMatchesIterator();
        for (const elem of folderMatches) {
          await elem.bindNotebookEditorWidget(editor, resource);
        }
      }
    }
  }
  addFileMatch(raw, silent, searchInstanceID) {
    const added = [];
    const updated = [];
    raw.forEach((rawFileMatch) => {
      const existingFileMatch = this.getDownstreamFileMatch(rawFileMatch.resource);
      if (existingFileMatch) {
        if (rawFileMatch.results) {
          rawFileMatch.results.filter(resultIsMatch).forEach((m) => {
            textSearchResultToMatches(m, existingFileMatch, false).forEach((m2) => existingFileMatch.add(m2));
          });
        }
        if (isINotebookFileMatchWithModel(rawFileMatch) || isINotebookFileMatchNoModel(rawFileMatch)) {
          rawFileMatch.cellResults?.forEach((rawCellMatch) => {
            if (isNotebookFileMatch(existingFileMatch)) {
              const existingCellMatch = existingFileMatch.getCellMatch(getIDFromINotebookCellMatch(rawCellMatch));
              if (existingCellMatch) {
                existingCellMatch.addContentMatches(rawCellMatch.contentResults);
                existingCellMatch.addWebviewMatches(rawCellMatch.webviewResults);
              } else {
                existingFileMatch.addCellMatch(rawCellMatch);
              }
            }
          });
        }
        updated.push(existingFileMatch);
        if (rawFileMatch.results && rawFileMatch.results.length > 0) {
          existingFileMatch.addContext(rawFileMatch.results);
        }
      } else {
        if (isSearchTreeFolderMatchWorkspaceRoot(this) || isSearchTreeFolderMatchNoRoot(this)) {
          const fileMatch = this.createAndConfigureFileMatch(rawFileMatch, searchInstanceID);
          added.push(fileMatch);
        }
      }
    });
    const elements = [...added, ...updated];
    if (!silent && elements.length) {
      this._onChange.fire({ elements, added: !!added.length });
    }
  }
  unbindNotebookEditorWidget(editor, resource) {
    const fileMatch = this._fileMatches.get(resource);
    if (isNotebookFileMatch(fileMatch)) {
      if (fileMatch) {
        fileMatch.unbindNotebookEditorWidget(editor);
      } else {
        const folderMatches = this.folderMatchesIterator();
        for (const elem of folderMatches) {
          elem.unbindNotebookEditorWidget(editor, resource);
        }
      }
    }
  }
  disposeMatches() {
    [...this._fileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
    [...this._folderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
    [...this._unDisposedFileMatches.values()].forEach((fileMatch) => fileMatch.dispose());
    [...this._unDisposedFolderMatches.values()].forEach((folderMatch) => folderMatch.disposeMatches());
    this._fileMatches.clear();
    this._folderMatches.clear();
    this._unDisposedFileMatches.clear();
    this._unDisposedFolderMatches.clear();
  }
  dispose() {
    this.disposeMatches();
    this._onDispose.fire();
    super.dispose();
  }
};

FolderMatchImpl = __decorateClass([
  __decorateParam(7, IReplaceService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IUriIdentityService)
], FolderMatchImpl);

var FolderMatchWithResourceImpl = class extends FolderMatchImpl {
  constructor(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService) {
    super(_resource, _id, _index, _query, _parent, _searchResult, _closestRoot, replaceService, instantiationService, labelService, uriIdentityService);
    this._normalizedResource = new Lazy(() => this.uriIdentityService.extUri.removeTrailingPathSeparator(this.uriIdentityService.extUri.normalizePath(
      this.resource
    )));
  }
  get resource() {
    return this._resource;
  }
  get normalizedResource() {
    return this._normalizedResource.value;
  }
};

FolderMatchWithResourceImpl = __decorateClass([
  __decorateParam(7, IReplaceService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, ILabelService),
  __decorateParam(10, IUriIdentityService)
], FolderMatchWithResourceImpl);

var FolderMatchWorkspaceRootImpl = class extends FolderMatchWithResourceImpl {
  constructor(_resource, _id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
    super(_resource, _id, _index, _query, _parent, _parent.parent(), null, replaceService, instantiationService, labelService, uriIdentityService);
  }
  normalizedUriParent(uri5) {
    return this.uriIdentityService.extUri.normalizePath(this.uriIdentityService.extUri.dirname(uri5));
  }
  uriEquals(uri1, ur2) {
    return this.uriIdentityService.extUri.isEqual(uri1, ur2);
  }
  createFileMatch(query, previewOptions, maxResults, parent, rawFileMatch, closestRoot, searchInstanceID) {
    const fileMatch = this.instantiationService.createInstance(
      NotebookCompatibleFileMatch,
      query,
      previewOptions,
      maxResults,
      parent,
      rawFileMatch,
      closestRoot,
      searchInstanceID
    );
    fileMatch.createMatches();
    parent.doAddFile(fileMatch);
    const disposable = fileMatch.onChange(({ didRemove }) => parent.onFileChange(fileMatch, didRemove));
    this._register(fileMatch.onDispose(() => disposable.dispose()));
    return fileMatch;
  }
  createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
    if (!this.uriHasParent(this.resource, rawFileMatch.resource)) {
      throw Error(`${rawFileMatch.resource} is not a descendant of ${this.resource}`);
    }
    const fileMatchParentParts = [];
    let uri5 = this.normalizedUriParent(rawFileMatch.resource);
    while (!this.uriEquals(this.normalizedResource, uri5)) {
      fileMatchParentParts.unshift(uri5);
      const prevUri = uri5;
      uri5 = this.uriIdentityService.extUri.removeTrailingPathSeparator(this.normalizedUriParent(uri5));
      if (this.uriEquals(prevUri, uri5)) {
        throw Error(`${rawFileMatch.resource} is not correctly configured as a child of ${this.normalizedResource}`);
      }
    }
    const root = this.closestRoot ?? this;
    let parent = this;
    for (let i2 = 0; i2 < fileMatchParentParts.length; i2++) {
      let folderMatch = parent.getFolderMatch(fileMatchParentParts[i2]);
      if (!folderMatch) {
        folderMatch = parent.createIntermediateFolderMatch(fileMatchParentParts[i2], fileMatchParentParts[i2].toString(), -1, this._query, root);
      }
      parent = folderMatch;
    }
    const contentPatternToUse = typeof this._query.contentPattern === "string" ? { pattern: this._query.contentPattern } : this._query.contentPattern;
    return this.createFileMatch(contentPatternToUse, this._query.previewOptions, this._query.maxResults, parent, rawFileMatch, root, searchInstanceID);
  }
};

FolderMatchWorkspaceRootImpl = __decorateClass([
  __decorateParam(5, IReplaceService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IUriIdentityService)
], FolderMatchWorkspaceRootImpl);

var FolderMatchNoRootImpl = class extends FolderMatchImpl {
  constructor(_id, _index, _query, _parent, replaceService, instantiationService, labelService, uriIdentityService) {
    super(null, _id, _index, _query, _parent, _parent.parent(), null, replaceService, instantiationService, labelService, uriIdentityService);
  }
  createAndConfigureFileMatch(rawFileMatch, searchInstanceID) {
    const contentPatternToUse = typeof this._query.contentPattern === "string" ? { pattern: this._query.contentPattern } : this._query.contentPattern;
    const fileMatch = this._register(this.instantiationService.createInstance(
      NotebookCompatibleFileMatch,
      contentPatternToUse,
      this._query.previewOptions,
      this._query.maxResults,
      this,
      rawFileMatch,
      null,
      searchInstanceID
    ));
    fileMatch.createMatches();
    this.doAddFile(fileMatch);
    const disposable = fileMatch.onChange(({ didRemove }) => this.onFileChange(fileMatch, didRemove));
    this._register(fileMatch.onDispose(() => disposable.dispose()));
    return fileMatch;
  }
};

FolderMatchNoRootImpl = __decorateClass([
  __decorateParam(4, IReplaceService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ILabelService),
  __decorateParam(7, IUriIdentityService)
], FolderMatchNoRootImpl);
export { FolderMatchImpl, FolderMatchWithResourceImpl, FolderMatchWorkspaceRootImpl, FolderMatchNoRootImpl };
