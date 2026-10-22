// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/views/explorerViewer.ts
import { Emitter, Event2, EventMultiplexer } from "./module-0017.mjs";
import { ExplorerItem, NewExplorerItem } from "./module-2019.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IFileService } from "./module-0269.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { IWorkspaceContextService, isTemporaryWorkspace } from "./module-0509.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { dirname2, distinctParents, joinPath, relativePath } from "./module-0034.mjs";
import { ExplorerFindProviderActive } from "./module-1542.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { ISearchService, getExcludes } from "./module-0999.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { match, parse4 } from "./module-0857.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { EventType, addDisposableListener, addStandardDisposableListener, getWindow, hasParentWithClass, isActiveElement, isHTMLElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { explorerFileContribRegistry } from "./module-2150.mjs";
import { createMatches } from "./module-0453.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { listFilterMatchHighlight, listFilterMatchHighlightBorder } from "./module-0232.mjs";
import { InputBox } from "./module-0600.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { timeout } from "./module-0036.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { deepClone, equals4 } from "./module-0098.mjs";
import { IgnoreFile } from "./module-2149.mjs";
import { relative } from "./module-0026.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { compareFileExtensionsDefault, compareFileExtensionsLower, compareFileExtensionsUnicode, compareFileExtensionsUpper, compareFileNamesDefault, compareFileNamesLower, compareFileNamesUnicode, compareFileNamesUpper } from "./module-1529.mjs";
import { isMacintosh, isWeb } from "./module-0014.mjs";
import { ExternalElementsDragAndDropData, NativeDragAndDropData } from "./module-0459.mjs";
import { CodeDataTransfers, containsDragType } from "./module-0273.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { fillEditorsDragData } from "./module-1381.mjs";
import { WebFileSystemAccess } from "./module-0270.mjs";
import { mainWindow } from "./module-0002.mjs";
import { BrowserFileUpload, ExternalFileImport, getMultipleFilesOverwriteConfirm } from "./module-2021.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { IDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { findValidPasteFileTarget } from "./module-2022.mjs";
import { ResourceFileEdit } from "./module-0537.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { isNumber } from "./module-0010.mjs";


// src/vs/workbench/contrib/files/browser/views/explorerViewer.ts
var ExplorerDelegate = class _ExplorerDelegate {
  static {
    this.ITEM_HEIGHT = 22;
  }
  getHeight(element) {
    return _ExplorerDelegate.ITEM_HEIGHT;
  }
  getTemplateId(element) {
    return FilesRenderer.ID;
  }
};

var explorerRootErrorEmitter = new Emitter();

var ExplorerDataSource = class {
  constructor(fileFilter, findProvider, progressService, configService, notificationService, layoutService, fileService, explorerService, contextService, filesConfigService) {
    this.fileFilter = fileFilter;
    this.findProvider = findProvider;
    this.progressService = progressService;
    this.configService = configService;
    this.notificationService = notificationService;
    this.layoutService = layoutService;
    this.fileService = fileService;
    this.explorerService = explorerService;
    this.contextService = contextService;
    this.filesConfigService = filesConfigService;
  }
  getParent(element) {
    if (element.parent) {
      return element.parent;
    }
    throw new Error("getParent only supported for cached parents");
  }
  hasChildren(element) {
    return Array.isArray(element) || element.hasChildren((stat) => this.fileFilter.filter(stat, 1 /* Visible */));
  }
  getChildren(element) {
    if (Array.isArray(element)) {
      return element;
    }
    if (this.findProvider.isShowingFilterResults()) {
      return Array.from(element.children.values());
    }
    const hasError = element.error;
    const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
    const children = element.fetchChildren(sortOrder);
    if (Array.isArray(children)) {
      return children;
    }
    const promise = children.then(
      (children2) => {
        if (element instanceof ExplorerItem && element.isRoot && !element.error && hasError && this.contextService.getWorkbenchState() !== 2 /* FOLDER */) {
          explorerRootErrorEmitter.fire(element.resource);
        }
        return children2;
      },
      (e) => {
        if (element instanceof ExplorerItem && element.isRoot) {
          if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
            const placeholder = new ExplorerItem(element.resource, this.fileService, this.configService, this.filesConfigService, void 0, void 0, false);
            placeholder.error = e;
            return [placeholder];
          } else {
            explorerRootErrorEmitter.fire(element.resource);
          }
        } else {
          this.notificationService.error(e);
        }
        return [];
      }
    );
    this.progressService.withProgress({
      location: 1 /* Explorer */,
      delay: this.layoutService.isRestored() ? 800 : 1500
      // reduce progress visibility when still restoring
    }, (_progress) => promise);
    return promise;
  }
};

ExplorerDataSource = __decorateClass([
  __decorateParam(2, IProgressService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IWorkbenchLayoutService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IExplorerService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IFilesConfigurationService)
], ExplorerDataSource);

var PhantomExplorerItem = class extends ExplorerItem {
};

var ExplorerFindHighlightTree = class {
  constructor() {
    this._tree = /* @__PURE__ */ new Map();
    this._highlightedItems = /* @__PURE__ */ new Map();
  }
  get highlightedItems() {
    return Array.from(this._highlightedItems.values());
  }
  get(item) {
    const result = this.find(item);
    if (result === void 0) {
      return 0;
    }
    const { treeLayer, relPath } = result;
    this._highlightedItems.set(relPath, item);
    return treeLayer.childMatches;
  }
  find(item) {
    const rootLayer = this._tree.get(item.root.name);
    if (rootLayer === void 0) {
      return void 0;
    }
    const relPath = relativePath(item.root.resource, item.resource);
    if (relPath === void 0 || relPath.startsWith("..")) {
      throw new Error("Resource is not a child of the root");
    }
    if (relPath === "") {
      return { treeLayer: rootLayer, relPath };
    }
    let treeLayer = rootLayer;
    for (const segment of relPath.split("/")) {
      if (!treeLayer.stats[segment]) {
        return void 0;
      }
      treeLayer = treeLayer.stats[segment];
    }
    return { treeLayer, relPath };
  }
  add(resource, root) {
    const relPath = relativePath(root.resource, resource);
    if (relPath === void 0 || relPath.startsWith("..")) {
      throw new Error("Resource is not a child of the root");
    }
    let rootLayer = this._tree.get(root.name);
    if (!rootLayer) {
      rootLayer = { childMatches: 0, stats: {}, isMatch: false };
      this._tree.set(root.name, rootLayer);
    }
    rootLayer.childMatches++;
    let treeLayer = rootLayer;
    for (const stat of relPath.split("/")) {
      if (!treeLayer.stats[stat]) {
        treeLayer.stats[stat] = { childMatches: 0, stats: {}, isMatch: false };
      }
      treeLayer = treeLayer.stats[stat];
      treeLayer.childMatches++;
    }
    treeLayer.childMatches--;
    treeLayer.isMatch = true;
  }
  isMatch(item) {
    const result = this.find(item);
    if (result === void 0) {
      return false;
    }
    const { treeLayer } = result;
    return treeLayer.isMatch;
  }
  clear() {
    this._tree.clear();
  }
};

var ExplorerFindProvider = class {
  constructor(filesFilter, treeProvider, searchService, fileService, configurationService, filesConfigService, progressService, explorerService, contextKeyService) {
    this.filesFilter = filesFilter;
    this.treeProvider = treeProvider;
    this.searchService = searchService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.filesConfigService = filesConfigService;
    this.progressService = progressService;
    this.explorerService = explorerService;
    this.sessionId = 0;
    this.phantomParents = /* @__PURE__ */ new Set();
    this.findHighlightTree = new ExplorerFindHighlightTree();
    this.explorerFindActiveContextKey = ExplorerFindProviderActive.bindTo(contextKeyService);
  }
  get highlightTree() {
    return this.findHighlightTree;
  }
  isShowingFilterResults() {
    return !!this.filterSessionStartState;
  }
  isVisible(element) {
    if (!this.filterSessionStartState) {
      return true;
    }
    if (this.explorerService.isEditable(element)) {
      return true;
    }
    return this.filterSessionStartState.rootsWithProviders.has(element.root) ? element.isMarkedAsFiltered() : true;
  }
  startSession() {
    this.sessionId++;
  }
  async endSession() {
    if (this.filterSessionStartState) {
      await this.endFilterSession();
    }
    if (this.highlightSessionStartState) {
      this.endHighlightSession();
    }
  }
  async find(pattern, toggles, token) {
    const promise = this.doFind(pattern, toggles, token);
    return await this.progressService.withProgress({
      location: 1 /* Explorer */,
      delay: 750
    }, (_progress) => promise);
  }
  async doFind(pattern, toggles, token) {
    if (toggles.findMode === 0 /* Highlight */) {
      if (this.filterSessionStartState) {
        await this.endFilterSession();
      }
      if (!this.highlightSessionStartState) {
        this.startHighlightSession();
      }
      return await this.doHighlightFind(pattern, toggles.matchType, token);
    }
    if (this.highlightSessionStartState) {
      this.endHighlightSession();
    }
    if (!this.filterSessionStartState) {
      this.startFilterSession();
    }
    return await this.doFilterFind(pattern, toggles.matchType, token);
  }
  // Filter
  startFilterSession() {
    const tree = this.treeProvider();
    const input = tree.getInput();
    if (!input) {
      return;
    }
    const roots = this.explorerService.roots.filter((root) => this.searchSupportsScheme(root.resource.scheme));
    this.filterSessionStartState = { viewState: tree.getViewState(), input, rootsWithProviders: new Set(roots) };
    this.explorerFindActiveContextKey.set(true);
  }
  async doFilterFind(pattern, matchType, token) {
    if (!this.filterSessionStartState) {
      throw new Error("ExplorerFindProvider: no session state");
    }
    const roots = Array.from(this.filterSessionStartState.rootsWithProviders);
    const searchResults = await this.getSearchResults(pattern, roots, matchType, token);
    if (token.isCancellationRequested) {
      return void 0;
    }
    this.clearPhantomElements();
    for (const { explorerRoot, files, directories } of searchResults) {
      this.addWorkspaceFilterResults(explorerRoot, files, directories);
    }
    const tree = this.treeProvider();
    await tree.setInput(this.filterSessionStartState.input);
    const hitMaxResults = searchResults.some(({ hitMaxResults: hitMaxResults2 }) => hitMaxResults2);
    return {
      isMatch: (item) => item.isMarkedAsFiltered(),
      matchCount: searchResults.reduce((acc, { files, directories }) => acc + files.length + directories.length, 0),
      warningMessage: hitMaxResults ? localize(16026, null) : void 0
    };
  }
  addWorkspaceFilterResults(root, files, directories) {
    const results = [
      ...files.map((file) => ({ resource: file, isDirectory: false })),
      ...directories.map((directory) => ({ resource: directory, isDirectory: true }))
    ];
    for (const { resource, isDirectory } of results) {
      const element = root.find(resource);
      if (element && element.root === root) {
        element.markItemAndParentsAsFiltered();
        continue;
      }
      const phantomElements = this.createPhantomItems(resource, root, isDirectory);
      if (phantomElements.length === 0) {
        throw new Error("Phantom item was not created even though it is not in the model");
      }
      const firstPhantomParent = phantomElements[0].parent;
      if (!(firstPhantomParent instanceof PhantomExplorerItem)) {
        this.phantomParents.add(firstPhantomParent);
      }
      const phantomFileElement = phantomElements[phantomElements.length - 1];
      phantomFileElement.markItemAndParentsAsFiltered();
    }
  }
  createPhantomItems(resource, root, resourceIsDirectory) {
    const relativePathToRoot = relativePath(root.resource, resource);
    if (!relativePathToRoot) {
      throw new Error("Resource is not a child of the root");
    }
    const phantomElements = [];
    let currentItem = root;
    let currentResource = root.resource;
    const pathSegments = relativePathToRoot.split("/");
    for (const stat of pathSegments) {
      currentResource = currentResource.with({ path: `${currentResource.path}/${stat}` });
      let child = currentItem.getChild(stat);
      if (!child) {
        const isDirectory = pathSegments[pathSegments.length - 1] === stat ? resourceIsDirectory : true;
        child = new PhantomExplorerItem(currentResource, this.fileService, this.configurationService, this.filesConfigService, currentItem, isDirectory);
        currentItem.addChild(child);
        phantomElements.push(child);
      }
      currentItem = child;
    }
    return phantomElements;
  }
  async endFilterSession() {
    this.clearPhantomElements();
    this.explorerFindActiveContextKey.set(false);
    if (!this.filterSessionStartState) {
      throw new Error("ExplorerFindProvider: no session state to restore");
    }
    const tree = this.treeProvider();
    await tree.setInput(this.filterSessionStartState.input, this.filterSessionStartState.viewState);
    this.filterSessionStartState = void 0;
    this.explorerService.refresh();
  }
  clearPhantomElements() {
    for (const phantomParent of this.phantomParents) {
      phantomParent.forgetChildren();
    }
    this.phantomParents.clear();
    this.explorerService.roots.forEach((root) => root.unmarkItemAndChildren());
  }
  // Highlight
  startHighlightSession() {
    const roots = this.explorerService.roots.filter((root) => this.searchSupportsScheme(root.resource.scheme));
    this.highlightSessionStartState = { rootsWithProviders: new Set(roots) };
  }
  async doHighlightFind(pattern, matchType, token) {
    if (!this.highlightSessionStartState) {
      throw new Error("ExplorerFindProvider: no highlight session state");
    }
    const roots = Array.from(this.highlightSessionStartState.rootsWithProviders);
    const searchResults = await this.getSearchResults(pattern, roots, matchType, token);
    if (token.isCancellationRequested) {
      return void 0;
    }
    this.clearHighlights();
    for (const { explorerRoot, files, directories } of searchResults) {
      this.addWorkspaceHighlightResults(explorerRoot, files.concat(directories));
    }
    const hitMaxResults = searchResults.some(({ hitMaxResults: hitMaxResults2 }) => hitMaxResults2);
    return {
      isMatch: (item) => this.findHighlightTree.isMatch(item) || this.findHighlightTree.get(item) > 0 && this.treeProvider().isCollapsed(item),
      matchCount: searchResults.reduce((acc, { files, directories }) => acc + files.length + directories.length, 0),
      warningMessage: hitMaxResults ? localize(16026, null) : void 0
    };
  }
  addWorkspaceHighlightResults(root, resources) {
    const highlightedDirectories = /* @__PURE__ */ new Set();
    const storeDirectories = (item) => {
      while (item) {
        highlightedDirectories.add(item);
        item = item.parent;
      }
    };
    for (const resource of resources) {
      const element = root.find(resource);
      if (element && element.root === root) {
        this.findHighlightTree.add(resource, root);
        storeDirectories(element.parent);
        continue;
      }
      const firstParent = findFirstParent(resource, root);
      if (firstParent) {
        this.findHighlightTree.add(resource, root);
        storeDirectories(firstParent.parent);
      }
    }
    const tree = this.treeProvider();
    for (const directory of highlightedDirectories) {
      if (tree.hasNode(directory)) {
        tree.rerender(directory);
      }
    }
  }
  endHighlightSession() {
    this.highlightSessionStartState = void 0;
    this.clearHighlights();
  }
  clearHighlights() {
    const tree = this.treeProvider();
    for (const item of this.findHighlightTree.highlightedItems) {
      if (tree.hasNode(item)) {
        tree.rerender(item);
      }
    }
    this.findHighlightTree.clear();
  }
  // Search
  searchSupportsScheme(scheme) {
    if (scheme !== Schemas.file && scheme !== Schemas.vscodeRemote) {
      return false;
    }
    return this.searchService.schemeHasFileSearchProvider(scheme);
  }
  async getSearchResults(pattern, roots, matchType, token) {
    const patternLowercase = pattern.toLowerCase();
    const isFuzzyMatch = matchType === 0 /* Fuzzy */;
    return await Promise.all(roots.map((root, index2) => this.searchInWorkspace(patternLowercase, root, index2, isFuzzyMatch, token)));
  }
  async searchInWorkspace(patternLowercase, root, rootIndex, isFuzzyMatch, token) {
    const segmentMatchPattern = isFuzzyMatch ? fuzzyMatchingGlobPattern(patternLowercase) : continousMatchingGlobPattern(patternLowercase);
    const searchExcludePattern = getExcludes(this.configurationService.getValue({ resource: root.resource })) || {};
    const searchOptions = {
      folderQueries: [{
        folder: root.resource,
        disregardIgnoreFiles: !this.configurationService.getValue("explorer.excludeGitIgnore")
      }],
      type: 1 /* File */,
      shouldGlobMatchFilePattern: true,
      cacheKey: `explorerfindprovider:${root.name}:${rootIndex}:${this.sessionId}`,
      excludePattern: searchExcludePattern,
      ignoreGlobCase: true
    };
    let fileResults;
    let folderResults;
    try {
      [fileResults, folderResults] = await Promise.all([
        this.searchService.fileSearch({ ...searchOptions, filePattern: `**/${segmentMatchPattern}`, maxResults: 512 }, token),
        this.searchService.fileSearch({ ...searchOptions, filePattern: `**/${segmentMatchPattern}/**` }, token)
      ]);
    } catch (e) {
      if (!isCancellationError(e)) {
        throw e;
      }
    }
    if (!fileResults || !folderResults || token.isCancellationRequested) {
      return { explorerRoot: root, files: [], directories: [], hitMaxResults: false };
    }
    const fileResultResources = fileResults.results.map((result) => result.resource);
    const directoryResources = getMatchingDirectoriesFromFiles(folderResults.results.map((result) => result.resource), root, segmentMatchPattern);
    const filteredFileResources = fileResultResources.filter((resource) => !this.filesFilter.isIgnored(resource, root.resource, false));
    const filteredDirectoryResources = directoryResources.filter((resource) => !this.filesFilter.isIgnored(resource, root.resource, true));
    return { explorerRoot: root, files: filteredFileResources, directories: filteredDirectoryResources, hitMaxResults: !!fileResults.limitHit || !!folderResults.limitHit };
  }
};

ExplorerFindProvider = __decorateClass([
  __decorateParam(2, ISearchService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IFilesConfigurationService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, IExplorerService),
  __decorateParam(8, IContextKeyService)
], ExplorerFindProvider);

function getMatchingDirectoriesFromFiles(resources, root, segmentMatchPattern) {
  const uniqueDirectories = new ResourceSet();
  for (const resource of resources) {
    const relativePathToRoot = relativePath(root.resource, resource);
    if (!relativePathToRoot) {
      throw new Error("Resource is not a child of the root");
    }
    let dirResource = root.resource;
    const stats = relativePathToRoot.split("/").slice(0, -1);
    for (const stat of stats) {
      dirResource = dirResource.with({ path: `${dirResource.path}/${stat}` });
      uniqueDirectories.add(dirResource);
    }
  }
  const matchingDirectories = [];
  for (const dirResource of uniqueDirectories) {
    const stats = dirResource.path.split("/");
    const dirStat = stats[stats.length - 1];
    if (!dirStat || !match(segmentMatchPattern, dirStat, { ignoreCase: true })) {
      continue;
    }
    matchingDirectories.push(dirResource);
  }
  return matchingDirectories;
}

function findFirstParent(resource, root) {
  const relativePathToRoot = relativePath(root.resource, resource);
  if (!relativePathToRoot) {
    throw new Error("Resource is not a child of the root");
  }
  let currentItem = root;
  let currentResource = root.resource;
  const pathSegments = relativePathToRoot.split("/");
  for (const stat of pathSegments) {
    currentResource = currentResource.with({ path: `${currentResource.path}/${stat}` });
    const child = currentItem.getChild(stat);
    if (!child) {
      return currentItem;
    }
    currentItem = child;
  }
  return void 0;
}

function fuzzyMatchingGlobPattern(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern.split("").join("*") + "*";
}

function continousMatchingGlobPattern(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern + "*";
}

var CompressedNavigationController = class {
  constructor(id2, items, templateData, depth, collapsed2) {
    this.id = id2;
    this.items = items;
    this.depth = depth;
    this.collapsed = collapsed2;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._index = items.length - 1;
    this.updateLabels(templateData);
    this._updateLabelDisposable = templateData.label.onDidRender(() => this.updateLabels(templateData));
  }
  static {
    this.ID = 0;
  }
  get index() {
    return this._index;
  }
  get count() {
    return this.items.length;
  }
  get current() {
    return this.items[this._index];
  }
  get currentId() {
    return `${this.id}_${this.index}`;
  }
  get labels() {
    return this._labels;
  }
  updateLabels(templateData) {
    this._labels = Array.from(templateData.container.querySelectorAll(".label-name"));
    let parents = "";
    for (let i2 = 0; i2 < this.labels.length; i2++) {
      const ariaLabel = parents.length ? `${this.items[i2].name}, compact, ${parents}` : this.items[i2].name;
      this.labels[i2].setAttribute("aria-label", ariaLabel);
      this.labels[i2].setAttribute("aria-level", `${this.depth + i2}`);
      parents = parents.length ? `${this.items[i2].name} ${parents}` : this.items[i2].name;
    }
    this.updateCollapsed(this.collapsed);
    if (this._index < this.labels.length) {
      this.labels[this._index].classList.add("active");
    }
  }
  previous() {
    if (this._index <= 0) {
      return;
    }
    this.setIndex(this._index - 1);
  }
  next() {
    if (this._index >= this.items.length - 1) {
      return;
    }
    this.setIndex(this._index + 1);
  }
  first() {
    if (this._index === 0) {
      return;
    }
    this.setIndex(0);
  }
  last() {
    if (this._index === this.items.length - 1) {
      return;
    }
    this.setIndex(this.items.length - 1);
  }
  setIndex(index2) {
    if (index2 < 0 || index2 >= this.items.length) {
      return;
    }
    this.labels[this._index].classList.remove("active");
    this._index = index2;
    this.labels[this._index].classList.add("active");
    this._onDidChange.fire();
  }
  updateCollapsed(collapsed2) {
    this.collapsed = collapsed2;
    for (let i2 = 0; i2 < this.labels.length; i2++) {
      this.labels[i2].setAttribute("aria-expanded", collapsed2 ? "false" : "true");
    }
  }
  dispose() {
    this._onDidChange.dispose();
    this._updateLabelDisposable.dispose();
  }
};

var FilesRenderer = class {
  constructor(container3, labels2, highlightTree, updateWidth, contextViewService, themeService, configurationService, explorerService, labelService, contextService, contextMenuService, instantiationService) {
    this.labels = labels2;
    this.highlightTree = highlightTree;
    this.updateWidth = updateWidth;
    this.contextViewService = contextViewService;
    this.themeService = themeService;
    this.configurationService = configurationService;
    this.explorerService = explorerService;
    this.labelService = labelService;
    this.contextService = contextService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.compressedNavigationControllers = /* @__PURE__ */ new Map();
    this._onDidChangeActiveDescendant = new EventMultiplexer();
    this.onDidChangeActiveDescendant = this._onDidChangeActiveDescendant.event;
    this.config = this.configurationService.getValue();
    const updateOffsetStyles = () => {
      const indent = this.configurationService.getValue("workbench.tree.indent");
      const offset = Math.max(22 - indent, 0);
      container3.style.setProperty(`--vscode-explorer-align-offset-margin-left`, `${offset}px`);
    };
    this.configListener = this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("explorer")) {
        this.config = this.configurationService.getValue();
      }
      if (e.affectsConfiguration("workbench.tree.indent")) {
        updateOffsetStyles();
      }
    });
    updateOffsetStyles();
  }
  static {
    this.ID = "file";
  }
  getWidgetAriaLabel() {
    return localize(16027, null);
  }
  get templateId() {
    return FilesRenderer.ID;
  }
  renderTemplate(container3) {
    const templateDisposables = new DisposableStore();
    const label3 = templateDisposables.add(this.labels.create(container3, { supportHighlights: true }));
    templateDisposables.add(label3.onDidRender(() => {
      scheduleAtNextAnimationFrame(getWindow(templateData.container), () => {
        try {
          if (templateData.currentContext) {
            this.updateWidth(templateData.currentContext);
          }
        } catch (e) {
        }
      });
    }));
    const contribs = explorerFileContribRegistry.create(this.instantiationService, container3, templateDisposables);
    templateDisposables.add(explorerFileContribRegistry.onDidRegisterDescriptor((d) => {
      const contr = d.create(this.instantiationService, container3);
      contribs.push(templateDisposables.add(contr));
      contr.setResource(templateData.currentContext?.resource);
    }));
    const templateData = { templateDisposables, elementDisposables: templateDisposables.add(new DisposableStore()), label: label3, container: container3, contribs };
    return templateData;
  }
  renderElement(node, index2, templateData) {
    const stat = node.element;
    templateData.currentContext = stat;
    const editableData = this.explorerService.getEditableData(stat);
    templateData.label.element.classList.remove("compressed");
    if (!editableData) {
      templateData.label.element.style.display = "flex";
      this.renderStat(stat, stat.name, void 0, node.filterData, templateData);
    } else {
      templateData.label.element.style.display = "none";
      templateData.contribs.forEach((c) => c.setResource(void 0));
      templateData.elementDisposables.add(this.renderInputBox(templateData.container, stat, editableData));
    }
  }
  renderCompressedElements(node, index2, templateData) {
    const stat = node.element.elements[node.element.elements.length - 1];
    templateData.currentContext = stat;
    const editable = node.element.elements.filter((e) => this.explorerService.isEditable(e));
    const editableData = editable.length === 0 ? void 0 : this.explorerService.getEditableData(editable[0]);
    if (!editableData) {
      templateData.label.element.classList.add("compressed");
      templateData.label.element.style.display = "flex";
      const id2 = `compressed-explorer_${CompressedNavigationController.ID++}`;
      const labels2 = node.element.elements.map((e) => e.name);
      let fuzzyScore2 = node.filterData;
      if (fuzzyScore2 && fuzzyScore2.length > 2) {
        const filterDataOffset = labels2.join("/").length - labels2[labels2.length - 1].length;
        fuzzyScore2 = [fuzzyScore2[0], fuzzyScore2[1] + filterDataOffset, ...fuzzyScore2.slice(2)];
      }
      this.renderStat(stat, labels2, id2, fuzzyScore2, templateData);
      const compressedNavigationController = new CompressedNavigationController(id2, node.element.elements, templateData, node.depth, node.collapsed);
      templateData.elementDisposables.add(compressedNavigationController);
      const nodeControllers = this.compressedNavigationControllers.get(stat) ?? [];
      this.compressedNavigationControllers.set(stat, [...nodeControllers, compressedNavigationController]);
      templateData.elementDisposables.add(this._onDidChangeActiveDescendant.add(compressedNavigationController.onDidChange));
      templateData.elementDisposables.add(addDisposableListener(templateData.container, "mousedown", (e) => {
        const result = getIconLabelNameFromHTMLElement(e.target);
        if (result) {
          compressedNavigationController.setIndex(result.index);
        }
      }));
      templateData.elementDisposables.add(toDisposable(() => {
        const nodeControllers2 = this.compressedNavigationControllers.get(stat) ?? [];
        const renderedIndex = nodeControllers2.findIndex((controller) => controller === compressedNavigationController);
        if (renderedIndex < 0) {
          throw new Error("Disposing unknown navigation controller");
        }
        if (nodeControllers2.length === 1) {
          this.compressedNavigationControllers.delete(stat);
        } else {
          nodeControllers2.splice(renderedIndex, 1);
        }
      }));
    } else {
      templateData.label.element.classList.remove("compressed");
      templateData.label.element.style.display = "none";
      templateData.contribs.forEach((c) => c.setResource(void 0));
      templateData.elementDisposables.add(this.renderInputBox(templateData.container, editable[0], editableData));
    }
  }
  renderStat(stat, label3, domId, filterData, templateData) {
    templateData.label.element.style.display = "flex";
    const extraClasses = ["explorer-item"];
    if (this.explorerService.isCut(stat)) {
      extraClasses.push("cut");
    }
    const theme = this.themeService.getFileIconTheme();
    const twistieContainer = templateData.container.parentElement?.parentElement?.querySelector(".monaco-tl-twistie");
    twistieContainer?.classList.toggle("force-twistie", stat.hasNests && theme.hidesExplorerArrows);
    const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
    const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
    templateData.contribs.forEach((c) => c.setResource(stat.resource));
    templateData.label.setResource({ resource: stat.resource, name: label3 }, {
      fileKind: stat.isRoot ? 2 /* ROOT_FOLDER */ : stat.isDirectory ? 1 /* FOLDER */ : 0 /* FILE */,
      extraClasses: realignNestedChildren ? [...extraClasses, "align-nest-icon-with-parent-icon"] : extraClasses,
      fileDecorations: this.config.explorer.decorations,
      matches: createMatches(filterData),
      separator: this.labelService.getSeparator(stat.resource.scheme, stat.resource.authority),
      domId
    });
    const highlightResults = stat.isDirectory ? this.highlightTree.get(stat) : 0;
    if (highlightResults > 0) {
      const badge = new CountBadge(templateData.label.element.lastElementChild, {}, { ...defaultCountBadgeStyles, badgeBackground: asCssVariable(listFilterMatchHighlight), badgeBorder: asCssVariable(listFilterMatchHighlightBorder) });
      badge.setCount(highlightResults);
      badge.setTitleFormat(localize(16019, null, highlightResults));
      templateData.elementDisposables.add(badge);
    }
    templateData.label.element.classList.toggle("highlight-badge", highlightResults > 0);
  }
  renderInputBox(container3, stat, editableData) {
    const label3 = this.labels.create(container3);
    const extraClasses = ["explorer-item", "explorer-item-edited"];
    const fileKind = stat.isRoot ? 2 /* ROOT_FOLDER */ : stat.isDirectory ? 1 /* FOLDER */ : 0 /* FILE */;
    const theme = this.themeService.getFileIconTheme();
    const themeIsUnhappyWithNesting = theme.hasFileIcons && (theme.hidesExplorerArrows || !theme.hasFolderIcons);
    const realignNestedChildren = stat.nestedParent && themeIsUnhappyWithNesting;
    const labelOptions = {
      hidePath: true,
      hideLabel: true,
      fileKind,
      extraClasses: realignNestedChildren ? [...extraClasses, "align-nest-icon-with-parent-icon"] : extraClasses
    };
    const parent = stat.name ? dirname2(stat.resource) : stat.resource;
    const value2 = stat.name || "";
    label3.setFile(joinPath(parent, value2 || " "), labelOptions);
    label3.element.firstElementChild.style.display = "none";
    const inputBox = new InputBox(label3.element, this.contextViewService, {
      validationOptions: {
        validation: (value3) => {
          const message = editableData.validationMessage(value3);
          if (!message || message.severity !== Severity2.Error) {
            return null;
          }
          return {
            content: message.content,
            formatContent: true,
            type: 3 /* ERROR */
          };
        }
      },
      ariaLabel: localize(16020, null),
      inputBoxStyles: defaultInputBoxStyles
    });
    const lastDot = value2.lastIndexOf(".");
    let currentSelectionState = "prefix";
    inputBox.value = value2;
    inputBox.focus();
    inputBox.select({ start: 0, end: lastDot > 0 && !stat.isDirectory ? lastDot : value2.length });
    const done = createSingleCallFunction((success, finishEditing) => {
      label3.element.style.display = "none";
      const value3 = inputBox.value;
      dispose(toDispose);
      label3.element.remove();
      if (finishEditing) {
        editableData.onFinish(value3, success);
      }
    });
    const showInputBoxNotification = () => {
      if (inputBox.isInputValid()) {
        const message = editableData.validationMessage(inputBox.value);
        if (message) {
          inputBox.showMessage({
            content: message.content,
            formatContent: true,
            type: message.severity === Severity2.Info ? 1 /* INFO */ : message.severity === Severity2.Warning ? 2 /* WARNING */ : 3 /* ERROR */
          });
        } else {
          inputBox.hideMessage();
        }
      }
    };
    showInputBoxNotification();
    const toDispose = [
      inputBox,
      inputBox.onDidChange((value3) => {
        label3.setFile(joinPath(parent, value3 || " "), labelOptions);
      }),
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, (e) => {
        if (e.equals(60 /* F2 */)) {
          const dotIndex = inputBox.value.lastIndexOf(".");
          if (stat.isDirectory || dotIndex === -1) {
            return;
          }
          if (currentSelectionState === "prefix") {
            currentSelectionState = "all";
            inputBox.select({ start: 0, end: inputBox.value.length });
          } else if (currentSelectionState === "all") {
            currentSelectionState = "suffix";
            inputBox.select({ start: dotIndex + 1, end: inputBox.value.length });
          } else {
            currentSelectionState = "prefix";
            inputBox.select({ start: 0, end: dotIndex });
          }
        } else if (e.equals(3 /* Enter */)) {
          if (!inputBox.validate()) {
            done(true, true);
          }
        } else if (e.equals(9 /* Escape */)) {
          done(false, true);
        }
      }),
      addStandardDisposableListener(inputBox.inputElement, EventType.KEY_UP, (e) => {
        showInputBoxNotification();
      }),
      addDisposableListener(inputBox.inputElement, EventType.BLUR, async () => {
        while (true) {
          await timeout(0);
          const ownerDocument = inputBox.inputElement.ownerDocument;
          if (!ownerDocument.hasFocus()) {
            break;
          }
          if (isActiveElement(inputBox.inputElement)) {
            return;
          } else if (isHTMLElement(ownerDocument.activeElement) && hasParentWithClass(ownerDocument.activeElement, "context-view")) {
            await Event2.toPromise(this.contextMenuService.onDidHideContextMenu);
          } else {
            break;
          }
        }
        done(inputBox.isInputValid(), true);
      }),
      label3
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(element, index2, templateData) {
    templateData.currentContext = void 0;
    templateData.elementDisposables.clear();
  }
  disposeCompressedElements(node, index2, templateData) {
    templateData.currentContext = void 0;
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateDisposables.dispose();
  }
  getCompressedNavigationController(stat) {
    return this.compressedNavigationControllers.get(stat);
  }
  // IAccessibilityProvider
  getAriaLabel(element) {
    return element.name;
  }
  getAriaLevel(element) {
    let depth = 0;
    let parent = element.parent;
    while (parent) {
      parent = parent.parent;
      depth++;
    }
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      depth = depth + 1;
    }
    return depth;
  }
  getActiveDescendantId(stat) {
    return this.compressedNavigationControllers.get(stat)?.[0]?.currentId ?? void 0;
  }
  dispose() {
    this.configListener.dispose();
  }
};

FilesRenderer = __decorateClass([
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExplorerService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IContextMenuService),
  __decorateParam(11, IInstantiationService)
], FilesRenderer);

var FilesFilter = class {
  constructor(contextService, configurationService, explorerService, editorService, uriIdentityService, fileService) {
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.hiddenExpressionPerRoot = /* @__PURE__ */ new Map();
    this.editorsAffectingFilter = /* @__PURE__ */ new Set();
    this._onDidChange = new Emitter();
    this.toDispose = [];
    // List of ignoreFile resources. Used to detect changes to the ignoreFiles.
    this.ignoreFileResourcesPerRoot = /* @__PURE__ */ new Map();
    // Ignore tree per root. Similar to `hiddenExpressionPerRoot`
    // Note: URI in the ternary search tree is the URI of the folder containing the ignore file
    // It is not the ignore file itself. This is because of the way the IgnoreFile works and nested paths
    this.ignoreTreesPerRoot = /* @__PURE__ */ new Map();
    this.toDispose.push(this._onDidChange);
    this.toDispose.push(this.contextService.onDidChangeWorkspaceFolders(() => this.updateConfiguration()));
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("files.exclude") || e.affectsConfiguration("explorer.excludeGitIgnore")) {
        this.updateConfiguration();
      }
    }));
    this.toDispose.push(this.fileService.onDidFilesChange((e) => {
      for (const [root, ignoreFileResourceSet] of this.ignoreFileResourcesPerRoot.entries()) {
        ignoreFileResourceSet.forEach(async (ignoreResource) => {
          if (e.contains(ignoreResource, 0 /* UPDATED */)) {
            await this.processIgnoreFile(root, ignoreResource, true);
          }
          if (e.contains(ignoreResource, 2 /* DELETED */)) {
            this.ignoreTreesPerRoot.get(root)?.delete(dirname2(ignoreResource));
            ignoreFileResourceSet.delete(ignoreResource);
            this._onDidChange.fire();
          }
        });
      }
    }));
    this.toDispose.push(this.editorService.onDidVisibleEditorsChange(() => {
      const editors = this.editorService.visibleEditors;
      let shouldFire = false;
      for (const e of editors) {
        if (!e.resource) {
          continue;
        }
        const stat = this.explorerService.findClosest(e.resource);
        if (stat?.isExcluded) {
          shouldFire = true;
          break;
        }
      }
      for (const e of this.editorsAffectingFilter) {
        if (!editors.includes(e)) {
          shouldFire = true;
          break;
        }
      }
      if (shouldFire) {
        this.editorsAffectingFilter.clear();
        this._onDidChange.fire();
      }
    }));
    this.updateConfiguration();
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  updateConfiguration() {
    let shouldFire = false;
    let updatedGitIgnoreSetting = false;
    this.contextService.getWorkspace().folders.forEach((folder) => {
      const configuration2 = this.configurationService.getValue({ resource: folder.uri });
      const excludesConfig = configuration2?.files?.exclude || /* @__PURE__ */ Object.create(null);
      const parseIgnoreFile = configuration2.explorer.excludeGitIgnore;
      if (parseIgnoreFile && !this.ignoreTreesPerRoot.has(folder.uri.toString())) {
        updatedGitIgnoreSetting = true;
        this.ignoreFileResourcesPerRoot.set(folder.uri.toString(), new ResourceSet());
        this.ignoreTreesPerRoot.set(folder.uri.toString(), TernarySearchTree.forUris((uri5) => this.uriIdentityService.extUri.ignorePathCasing(uri5)));
      }
      if (!parseIgnoreFile && this.ignoreTreesPerRoot.has(folder.uri.toString())) {
        updatedGitIgnoreSetting = true;
        this.ignoreFileResourcesPerRoot.delete(folder.uri.toString());
        this.ignoreTreesPerRoot.delete(folder.uri.toString());
      }
      if (!shouldFire) {
        const cached = this.hiddenExpressionPerRoot.get(folder.uri.toString());
        shouldFire = !cached || !equals4(cached.original, excludesConfig);
      }
      const excludesConfigCopy = deepClone(excludesConfig);
      this.hiddenExpressionPerRoot.set(folder.uri.toString(), { original: excludesConfigCopy, parsed: parse4(excludesConfigCopy) });
    });
    if (shouldFire || updatedGitIgnoreSetting) {
      this.editorsAffectingFilter.clear();
      this._onDidChange.fire();
    }
  }
  /**
   * Given a .gitignore file resource, processes the resource and adds it to the ignore tree which hides explorer items
   * @param root The root folder of the workspace as a string. Used for lookup key for ignore tree and resource list
   * @param ignoreFileResource The resource of the .gitignore file
   * @param update Whether or not we're updating an existing ignore file. If true it deletes the old entry
   */
  async processIgnoreFile(root, ignoreFileResource, update) {
    const dirUri = dirname2(ignoreFileResource);
    const ignoreTree = this.ignoreTreesPerRoot.get(root);
    if (!ignoreTree) {
      return;
    }
    if (!update && ignoreTree.has(dirUri)) {
      return;
    }
    const content2 = await this.fileService.readFile(ignoreFileResource);
    if (update) {
      const ignoreFile = ignoreTree.get(dirUri);
      ignoreFile?.updateContents(content2.value.toString());
    } else {
      const ignoreParent = ignoreTree.findSubstr(dirUri);
      const ignoreCase = !this.fileService.hasCapability(ignoreFileResource, 1024 /* PathCaseSensitive */);
      const ignoreFile = new IgnoreFile(content2.value.toString(), dirUri.path, ignoreParent, ignoreCase);
      ignoreTree.set(dirUri, ignoreFile);
      if (!this.ignoreFileResourcesPerRoot.get(root)?.has(ignoreFileResource)) {
        this.ignoreFileResourcesPerRoot.get(root)?.add(ignoreFileResource);
      }
    }
    this._onDidChange.fire();
  }
  filter(stat, parentVisibility) {
    if (stat.name === ".gitignore" && this.ignoreTreesPerRoot.has(stat.root.resource.toString())) {
      this.processIgnoreFile(stat.root.resource.toString(), stat.resource, false);
      return true;
    }
    return this.isVisible(stat, parentVisibility);
  }
  isVisible(stat, parentVisibility) {
    stat.isExcluded = false;
    if (parentVisibility === 0 /* Hidden */) {
      stat.isExcluded = true;
      return false;
    }
    if (this.explorerService.getEditableData(stat)) {
      return true;
    }
    const cached = this.hiddenExpressionPerRoot.get(stat.root.resource.toString());
    const globMatch = cached?.parsed(relative(stat.root.resource.path, stat.resource.path), stat.name, (name) => !!stat.parent?.getChild(name));
    const isHiddenResource = globMatch ? true : this.isIgnored(stat.resource, stat.root.resource, stat.isDirectory);
    if (isHiddenResource || stat.parent?.isExcluded) {
      stat.isExcluded = true;
      const editors = this.editorService.visibleEditors;
      const editor = editors.find((e) => e.resource && this.uriIdentityService.extUri.isEqualOrParent(e.resource, stat.resource));
      if (editor && stat.root === this.explorerService.findClosestRoot(stat.resource)) {
        this.editorsAffectingFilter.add(editor);
        return true;
      }
      return false;
    }
    return true;
  }
  isIgnored(resource, rootResource, isDirectory) {
    const ignoreFile = this.ignoreTreesPerRoot.get(rootResource.toString())?.findSubstr(resource);
    const isIncludedInTraversal = ignoreFile?.isPathIncludedInTraversal(resource.path, isDirectory);
    return isIncludedInTraversal === void 0 ? false : !isIncludedInTraversal;
  }
  dispose() {
    dispose(this.toDispose);
  }
};

FilesFilter = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IExplorerService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IFileService)
], FilesFilter);

var FileSorter2 = class {
  constructor(explorerService, contextService) {
    this.explorerService = explorerService;
    this.contextService = contextService;
  }
  compare(statA, statB) {
    if (statA.isRoot) {
      if (statB.isRoot) {
        const workspaceA = this.contextService.getWorkspaceFolder(statA.resource);
        const workspaceB = this.contextService.getWorkspaceFolder(statB.resource);
        return workspaceA && workspaceB ? workspaceA.index - workspaceB.index : -1;
      }
      return -1;
    }
    if (statB.isRoot) {
      return 1;
    }
    const sortOrder = this.explorerService.sortOrderConfiguration.sortOrder;
    const lexicographicOptions = this.explorerService.sortOrderConfiguration.lexicographicOptions;
    const reverse = this.explorerService.sortOrderConfiguration.reverse;
    if (reverse) {
      [statA, statB] = [statB, statA];
    }
    let compareFileNames2;
    let compareFileExtensions2;
    switch (lexicographicOptions) {
      case "upper":
        compareFileNames2 = compareFileNamesUpper;
        compareFileExtensions2 = compareFileExtensionsUpper;
        break;
      case "lower":
        compareFileNames2 = compareFileNamesLower;
        compareFileExtensions2 = compareFileExtensionsLower;
        break;
      case "unicode":
        compareFileNames2 = compareFileNamesUnicode;
        compareFileExtensions2 = compareFileExtensionsUnicode;
        break;
      default:
        compareFileNames2 = compareFileNamesDefault;
        compareFileExtensions2 = compareFileExtensionsDefault;
    }
    switch (sortOrder) {
      case "type":
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        if (statA.isDirectory && statB.isDirectory) {
          return compareFileNames2(statA.name, statB.name);
        }
        break;
      case "filesFirst":
        if (statA.isDirectory && !statB.isDirectory) {
          return 1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return -1;
        }
        break;
      case "foldersNestsFiles":
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        if (statA.hasNests && !statB.hasNests) {
          return -1;
        }
        if (statB.hasNests && !statA.hasNests) {
          return 1;
        }
        break;
      case "mixed":
        break;
      // not sorting when "mixed" is on
      default:
        if (statA.isDirectory && !statB.isDirectory) {
          return -1;
        }
        if (statB.isDirectory && !statA.isDirectory) {
          return 1;
        }
        break;
    }
    switch (sortOrder) {
      case "type":
        return compareFileExtensions2(statA.name, statB.name);
      case "modified":
        if (statA.mtime !== statB.mtime) {
          return statA.mtime && statB.mtime && statA.mtime < statB.mtime ? 1 : -1;
        }
        return compareFileNames2(statA.name, statB.name);
      default:
        return compareFileNames2(statA.name, statB.name);
    }
  }
};

FileSorter2 = __decorateClass([
  __decorateParam(0, IExplorerService),
  __decorateParam(1, IWorkspaceContextService)
], FileSorter2);

var FileDragAndDrop = class {
  constructor(isCollapsed, explorerService, editorService, dialogService, contextService, fileService, configurationService, instantiationService, workspaceEditingService, uriIdentityService) {
    this.isCollapsed = isCollapsed;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.dialogService = dialogService;
    this.contextService = contextService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.workspaceEditingService = workspaceEditingService;
    this.uriIdentityService = uriIdentityService;
    this.compressedDropTargetDisposable = Disposable.None;
    this.disposables = new DisposableStore();
    this.dropEnabled = false;
    const updateDropEnablement = (e) => {
      if (!e || e.affectsConfiguration("explorer.enableDragAndDrop")) {
        this.dropEnabled = this.configurationService.getValue("explorer.enableDragAndDrop");
      }
    };
    updateDropEnablement(void 0);
    this.disposables.add(this.configurationService.onDidChangeConfiguration((e) => updateDropEnablement(e)));
  }
  static {
    this.CONFIRM_DND_SETTING_KEY = "explorer.confirmDragAndDrop";
  }
  onDragOver(data, target, targetIndex, targetSector, originalEvent) {
    if (!this.dropEnabled) {
      return false;
    }
    if (target) {
      const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(target, originalEvent);
      if (compressedTarget) {
        const iconLabelName = getIconLabelNameFromHTMLElement(originalEvent.target);
        if (iconLabelName && iconLabelName.index < iconLabelName.count - 1) {
          const result = this.handleDragOver(data, compressedTarget, targetIndex, targetSector, originalEvent);
          if (result) {
            if (iconLabelName.element !== this.compressedDragOverElement) {
              this.compressedDragOverElement = iconLabelName.element;
              this.compressedDropTargetDisposable.dispose();
              this.compressedDropTargetDisposable = toDisposable(() => {
                iconLabelName.element.classList.remove("drop-target");
                this.compressedDragOverElement = void 0;
              });
              iconLabelName.element.classList.add("drop-target");
            }
            return typeof result === "boolean" ? result : { ...result, feedback: [] };
          }
          this.compressedDropTargetDisposable.dispose();
          return false;
        }
      }
    }
    this.compressedDropTargetDisposable.dispose();
    return this.handleDragOver(data, target, targetIndex, targetSector, originalEvent);
  }
  handleDragOver(data, target, targetIndex, targetSector, originalEvent) {
    const isCopy = originalEvent && (originalEvent.ctrlKey && !isMacintosh || originalEvent.altKey && isMacintosh);
    const isNative2 = data instanceof NativeDragAndDropData;
    const effectType = isNative2 || isCopy ? 0 /* Copy */ : 1 /* Move */;
    const effect = { type: effectType, position: "drop-target" /* Over */ };
    if (isNative2) {
      if (!containsDragType(originalEvent, DataTransfers.FILES, CodeDataTransfers.FILES, DataTransfers.RESOURCES)) {
        return false;
      }
    } else if (data instanceof ExternalElementsDragAndDropData) {
      return false;
    } else {
      const items = FileDragAndDrop.getStatsFromDragAndDropData(data);
      const isRootsReorder = items.every((item) => item.isRoot);
      if (!target) {
        if (!isCopy && items.every((i2) => !!i2.parent && i2.parent.isRoot)) {
          return false;
        }
        if (isRootsReorder) {
          return { accept: true, effect: { type: 1 /* Move */, position: "drop-target-after" /* After */ } };
        }
        return { accept: true, bubble: 0 /* Down */, effect, autoExpand: false };
      }
      if (!Array.isArray(items)) {
        return false;
      }
      if (!isCopy && items.every((source) => source.isReadonly)) {
        return false;
      }
      if (items.some((source) => {
        if (source.isRoot) {
          return false;
        }
        if (this.uriIdentityService.extUri.isEqual(source.resource, target.resource)) {
          return true;
        }
        if (!isCopy && this.uriIdentityService.extUri.isEqual(dirname2(source.resource), target.resource)) {
          return true;
        }
        if (this.uriIdentityService.extUri.isEqualOrParent(target.resource, source.resource)) {
          return true;
        }
        return false;
      })) {
        return false;
      }
      if (isRootsReorder) {
        if (!target.isRoot) {
          return false;
        }
        let dropEffectPosition = void 0;
        switch (targetSector) {
          case 0 /* TOP */:
          case 1 /* CENTER_TOP */:
            dropEffectPosition = "drop-target-before" /* Before */;
            break;
          case 2 /* CENTER_BOTTOM */:
          case 3 /* BOTTOM */:
            dropEffectPosition = "drop-target-after" /* After */;
            break;
        }
        return { accept: true, effect: { type: 1 /* Move */, position: dropEffectPosition } };
      }
    }
    if (!target) {
      return { accept: true, bubble: 0 /* Down */, effect };
    } else {
      if (target.isDirectory) {
        if (target.isReadonly) {
          return false;
        }
        return { accept: true, bubble: 0 /* Down */, effect, autoExpand: true };
      }
      if (this.contextService.getWorkspace().folders.every((folder) => folder.uri.toString() !== target.resource.toString())) {
        return { accept: true, bubble: 1 /* Up */, effect };
      }
    }
    return false;
  }
  getDragURI(element) {
    if (this.explorerService.isEditable(element)) {
      return null;
    }
    return element.resource.toString();
  }
  getDragLabel(elements, originalEvent) {
    if (elements.length === 1) {
      const stat = FileDragAndDrop.getCompressedStatFromDragEvent(elements[0], originalEvent);
      return stat.name;
    }
    return String(elements.length);
  }
  onDragStart(data, originalEvent) {
    const items = FileDragAndDrop.getStatsFromDragAndDropData(data, originalEvent);
    if (items.length && originalEvent.dataTransfer) {
      this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, items, originalEvent));
      const fileResources = items.filter((s) => s.resource.scheme === Schemas.file).map((r2) => r2.resource.fsPath);
      if (fileResources.length) {
        originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
      }
    }
  }
  async drop(data, target, targetIndex, targetSector, originalEvent) {
    this.compressedDropTargetDisposable.dispose();
    if (target) {
      const compressedTarget = FileDragAndDrop.getCompressedStatFromDragEvent(target, originalEvent);
      if (compressedTarget) {
        target = compressedTarget;
      }
    }
    if (!target) {
      target = this.explorerService.roots[this.explorerService.roots.length - 1];
      targetSector = 3 /* BOTTOM */;
    }
    if (!target.isDirectory && target.parent) {
      target = target.parent;
    }
    if (target.isReadonly) {
      return;
    }
    const resolvedTarget = target;
    if (!resolvedTarget) {
      return;
    }
    try {
      if (data instanceof NativeDragAndDropData) {
        if (!isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) && WebFileSystemAccess.supported(mainWindow)) {
          const fileImport = this.instantiationService.createInstance(ExternalFileImport);
          await fileImport.import(resolvedTarget, originalEvent, mainWindow);
        } else {
          const browserUpload = this.instantiationService.createInstance(BrowserFileUpload);
          await browserUpload.upload(target, originalEvent);
        }
      } else {
        await this.handleExplorerDrop(data, resolvedTarget, targetIndex, targetSector, originalEvent);
      }
    } catch (error) {
      this.dialogService.error(toErrorMessage(error));
    }
  }
  async handleExplorerDrop(data, target, targetIndex, targetSector, originalEvent) {
    const elementsData = FileDragAndDrop.getStatsFromDragAndDropData(data);
    const distinctItems = new Map(elementsData.map((element) => [element, this.isCollapsed(element)]));
    for (const [item, collapsed2] of distinctItems) {
      if (collapsed2) {
        const nestedChildren = item.nestedChildren;
        if (nestedChildren) {
          for (const child of nestedChildren) {
            distinctItems.set(child, true);
          }
        }
      }
    }
    const items = distinctParents([...distinctItems.keys()], (s) => s.resource);
    const isCopy = originalEvent.ctrlKey && !isMacintosh || originalEvent.altKey && isMacintosh;
    const confirmDragAndDrop = !isCopy && this.configurationService.getValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY);
    if (confirmDragAndDrop) {
      const message = items.length > 1 && items.every((s) => s.isRoot) ? localize(16015, null) : items.length > 1 ? localize(16013, null, items.length, target.name) : items[0].isRoot ? localize(16014, null, items[0].name) : localize(16012, null, items[0].name, target.name);
      const detail2 = items.length > 1 && !items.every((s) => s.isRoot) ? getFileNamesMessage(items.map((i2) => i2.resource)) : void 0;
      const confirmation = await this.dialogService.confirm({
        message,
        detail: detail2,
        checkbox: {
          label: localize(16018, null)
        },
        primaryButton: localize(16022, null)
      });
      if (!confirmation.confirmed) {
        return;
      }
      if (confirmation.checkboxChecked === true) {
        await this.configurationService.updateValue(FileDragAndDrop.CONFIRM_DND_SETTING_KEY, false);
      }
    }
    await this.doHandleRootDrop(items.filter((s) => s.isRoot), target, targetSector);
    const sources = items.filter((s) => !s.isRoot);
    if (isCopy) {
      return this.doHandleExplorerDropOnCopy(sources, target);
    }
    return this.doHandleExplorerDropOnMove(sources, target);
  }
  async doHandleRootDrop(roots, target, targetSector) {
    if (roots.length === 0) {
      return;
    }
    const folders = this.contextService.getWorkspace().folders;
    let targetIndex;
    const sourceIndices = [];
    const workspaceCreationData = [];
    const rootsToMove = [];
    for (let index2 = 0; index2 < folders.length; index2++) {
      const data = {
        uri: folders[index2].uri,
        name: folders[index2].name
      };
      if (target instanceof ExplorerItem && this.uriIdentityService.extUri.isEqual(folders[index2].uri, target.resource)) {
        targetIndex = index2;
      }
      for (const root of roots) {
        if (this.uriIdentityService.extUri.isEqual(folders[index2].uri, root.resource)) {
          sourceIndices.push(index2);
          break;
        }
      }
      if (roots.every((r2) => r2.resource.toString() !== folders[index2].uri.toString())) {
        workspaceCreationData.push(data);
      } else {
        rootsToMove.push(data);
      }
    }
    if (targetIndex === void 0) {
      targetIndex = workspaceCreationData.length;
    } else {
      switch (targetSector) {
        case 3 /* BOTTOM */:
        case 2 /* CENTER_BOTTOM */:
          targetIndex++;
          break;
      }
      for (const sourceIndex of sourceIndices) {
        if (sourceIndex < targetIndex) {
          targetIndex--;
        }
      }
    }
    workspaceCreationData.splice(targetIndex, 0, ...rootsToMove);
    return this.workspaceEditingService.updateFolders(0, workspaceCreationData.length, workspaceCreationData);
  }
  async doHandleExplorerDropOnCopy(sources, target) {
    const explorerConfig = this.configurationService.getValue().explorer;
    const resourceFileEdits = [];
    for (const { resource, isDirectory } of sources) {
      const allowOverwrite = explorerConfig.incrementalNaming === "disabled";
      const newResource = await findValidPasteFileTarget(
        this.explorerService,
        this.fileService,
        this.dialogService,
        target,
        { resource, isDirectory, allowOverwrite },
        explorerConfig.incrementalNaming
      );
      if (!newResource) {
        continue;
      }
      const resourceEdit = new ResourceFileEdit(resource, newResource, { copy: true, overwrite: allowOverwrite });
      resourceFileEdits.push(resourceEdit);
    }
    const labelSuffix = getFileOrFolderLabelSuffix(sources);
    await this.explorerService.applyBulkEdit(resourceFileEdits, {
      confirmBeforeUndo: explorerConfig.confirmUndo === "default" /* Default */ || explorerConfig.confirmUndo === "verbose" /* Verbose */,
      undoLabel: localize(16016, null, labelSuffix),
      progressLabel: localize(16017, null, labelSuffix)
    });
    const editors = resourceFileEdits.filter((edit3) => {
      const item = edit3.newResource ? this.explorerService.findClosest(edit3.newResource) : void 0;
      return item && !item.isDirectory;
    }).map((edit3) => ({ resource: edit3.newResource, options: { pinned: true } }));
    await this.editorService.openEditors(editors);
  }
  async doHandleExplorerDropOnMove(sources, target) {
    const resourceFileEdits = sources.filter((source) => !source.isReadonly).map((source) => new ResourceFileEdit(source.resource, joinPath(target.resource, source.name)));
    const labelSuffix = getFileOrFolderLabelSuffix(sources);
    const options3 = {
      confirmBeforeUndo: this.configurationService.getValue().explorer.confirmUndo === "verbose" /* Verbose */,
      undoLabel: localize(16021, null, labelSuffix),
      progressLabel: localize(16023, null, labelSuffix)
    };
    try {
      await this.explorerService.applyBulkEdit(resourceFileEdits, options3);
    } catch (error) {
      if (error.fileOperationResult === 4 /* FILE_MOVE_CONFLICT */) {
        const overwrites = [];
        for (const edit3 of resourceFileEdits) {
          if (edit3.newResource && await this.fileService.exists(edit3.newResource)) {
            overwrites.push(edit3.newResource);
          }
        }
        const confirm = getMultipleFilesOverwriteConfirm(overwrites);
        const { confirmed } = await this.dialogService.confirm(confirm);
        if (confirmed) {
          await this.explorerService.applyBulkEdit(resourceFileEdits.map((re) => new ResourceFileEdit(re.oldResource, re.newResource, { overwrite: true })), options3);
        }
      } else {
        throw error;
      }
    }
  }
  static getStatsFromDragAndDropData(data, dragStartEvent) {
    if (data.context) {
      return data.context;
    }
    if (dragStartEvent && data.elements.length === 1) {
      data.context = [FileDragAndDrop.getCompressedStatFromDragEvent(data.elements[0], dragStartEvent)];
      return data.context;
    }
    return data.elements;
  }
  static getCompressedStatFromDragEvent(stat, dragEvent) {
    const target = getWindow(dragEvent).document.elementFromPoint(dragEvent.clientX, dragEvent.clientY);
    const iconLabelName = getIconLabelNameFromHTMLElement(target);
    if (iconLabelName) {
      const { count: count2, index: index2 } = iconLabelName;
      let i2 = count2 - 1;
      while (i2 > index2 && stat.parent) {
        stat = stat.parent;
        i2--;
      }
      return stat;
    }
    return stat;
  }
  onDragEnd() {
    this.compressedDropTargetDisposable.dispose();
  }
  dispose() {
    this.compressedDropTargetDisposable.dispose();
    this.disposables.dispose();
  }
};

FileDragAndDrop = __decorateClass([
  __decorateParam(1, IExplorerService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IWorkspaceEditingService),
  __decorateParam(9, IUriIdentityService)
], FileDragAndDrop);

function getIconLabelNameFromHTMLElement(target) {
  if (!isHTMLElement(target)) {
    return null;
  }
  let element = target;
  while (element && !element.classList.contains("monaco-list-row")) {
    if (element.classList.contains("label-name") && element.hasAttribute("data-icon-label-count")) {
      const count2 = Number(element.getAttribute("data-icon-label-count"));
      const index2 = Number(element.getAttribute("data-icon-label-index"));
      if (isNumber(count2) && isNumber(index2)) {
        return { element, count: count2, index: index2 };
      }
    }
    element = element.parentElement;
  }
  return null;
}

function isCompressedFolderName(target) {
  return !!getIconLabelNameFromHTMLElement(target);
}

var ExplorerCompressionDelegate = class {
  isIncompressible(stat) {
    return stat.isRoot || !stat.isDirectory || stat instanceof NewExplorerItem || (!stat.parent || stat.parent.isRoot);
  }
};

function getFileOrFolderLabelSuffix(items) {
  if (items.length === 1) {
    return items[0].name;
  }
  if (items.every((i2) => i2.isDirectory)) {
    return localize(16025, null, items.length);
  }
  if (items.every((i2) => !i2.isDirectory)) {
    return localize(16024, null, items.length);
  }
  return `${items.length} files and folders`;
}
export { getMatchingDirectoriesFromFiles, findFirstParent, fuzzyMatchingGlobPattern, continousMatchingGlobPattern, getIconLabelNameFromHTMLElement, isCompressedFolderName, getFileOrFolderLabelSuffix, ExplorerDelegate, explorerRootErrorEmitter, ExplorerDataSource, PhantomExplorerItem, ExplorerFindHighlightTree, ExplorerFindProvider, CompressedNavigationController, FilesRenderer, FilesFilter, FileSorter2, FileDragAndDrop, ExplorerCompressionDelegate };
