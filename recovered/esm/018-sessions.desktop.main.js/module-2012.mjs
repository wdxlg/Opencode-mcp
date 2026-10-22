// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/breadcrumbsPicker.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { breadcrumbsPickerBackground, widgetBorder } from "./module-0229.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkspaceContextService, isWorkspace, isWorkspaceFolder } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { createMatches } from "./module-0453.mjs";
import { localize } from "./module-0001.mjs";
import { BreadcrumbsConfig } from "./module-2009.mjs";
import { posix, relative } from "./module-0026.mjs";
import { parse4 } from "./module-0857.mjs";
import { basename2, dirname2, isEqual2 } from "./module-0034.mjs";
import { compareFileNames } from "./module-1521.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { WorkbenchAsyncDataTree, WorkbenchDataTree } from "./module-0636.mjs";
import { IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";


// src/vs/workbench/browser/parts/editor/breadcrumbsPicker.ts
var BreadcrumbsPicker = class {
  constructor(parent, resource, _instantiationService, _themeService, _configurationService) {
    this.resource = resource;
    this._instantiationService = _instantiationService;
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._disposables = new DisposableStore();
    this._fakeEvent = new UIEvent("fakeEvent");
    this._onWillPickElement = new Emitter();
    this.onWillPickElement = this._onWillPickElement.event;
    this._previewDispoables = new MutableDisposable();
    this._domNode = document.createElement("div");
    this._domNode.className = "monaco-breadcrumbs-picker show-file-icons";
    parent.appendChild(this._domNode);
  }
  dispose() {
    this._disposables.dispose();
    this._previewDispoables.dispose();
    this._onWillPickElement.dispose();
    this._domNode.remove();
    setTimeout(() => this._tree.dispose(), 0);
  }
  async show(input, maxHeight, width2, arrowSize, arrowOffset) {
    const theme = this._themeService.getColorTheme();
    const color2 = theme.getColor(breadcrumbsPickerBackground);
    this._arrow = document.createElement("div");
    this._arrow.className = "arrow";
    this._arrow.style.borderColor = `transparent transparent ${color2 ? color2.toString() : ""}`;
    this._domNode.appendChild(this._arrow);
    this._treeContainer = document.createElement("div");
    this._treeContainer.style.background = color2 ? color2.toString() : "";
    this._treeContainer.style.paddingTop = "2px";
    this._treeContainer.style.borderRadius = "3px";
    this._treeContainer.style.boxShadow = "var(--vscode-shadow-lg)";
    this._treeContainer.style.border = `1px solid ${this._themeService.getColorTheme().getColor(widgetBorder)}`;
    this._domNode.appendChild(this._treeContainer);
    this._layoutInfo = { maxHeight, width: width2, arrowSize, arrowOffset, inputHeight: 0 };
    this._tree = this._createTree(this._treeContainer, input);
    this._disposables.add(this._tree.onDidOpen(async (e4) => {
      const { element, editorOptions, sideBySide } = e4;
      const didReveal = await this._revealElement(element, { ...editorOptions, preserveFocus: false }, sideBySide);
      if (!didReveal) {
        return;
      }
    }));
    this._disposables.add(this._tree.onDidChangeFocus((e4) => {
      this._previewDispoables.value = this._previewElement(e4.elements[0]);
    }));
    this._disposables.add(this._tree.onDidChangeContentHeight(() => {
      this._layout();
    }));
    this._domNode.focus();
    try {
      await this._setInput(input);
      this._layout();
    } catch (err) {
      onUnexpectedError(err);
    }
  }
  _layout() {
    const headerHeight = 2 * this._layoutInfo.arrowSize;
    const treeHeight = Math.min(this._layoutInfo.maxHeight - headerHeight, this._tree.contentHeight);
    const totalHeight = treeHeight + headerHeight;
    this._domNode.style.height = `${totalHeight}px`;
    this._domNode.style.width = `${this._layoutInfo.width}px`;
    this._arrow.style.top = `-${2 * this._layoutInfo.arrowSize}px`;
    this._arrow.style.borderWidth = `${this._layoutInfo.arrowSize}px`;
    this._arrow.style.marginLeft = `${this._layoutInfo.arrowOffset}px`;
    this._treeContainer.style.height = `${treeHeight}px`;
    this._treeContainer.style.width = `${this._layoutInfo.width}px`;
    this._tree.layout(treeHeight, this._layoutInfo.width);
  }
  restoreViewState() {
  }
};

BreadcrumbsPicker = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IConfigurationService)
], BreadcrumbsPicker);

var FileVirtualDelegate = class {
  getHeight(_element) {
    return 22;
  }
  getTemplateId(_element) {
    return "FileStat";
  }
};

var FileIdentityProvider = class {
  getId(element) {
    if (URI.isUri(element)) {
      return element.toString();
    } else if (isWorkspace(element)) {
      return element.id;
    } else if (isWorkspaceFolder(element)) {
      return element.uri.toString();
    } else {
      return element.resource.toString();
    }
  }
};

var FileDataSource = class {
  constructor(_fileService) {
    this._fileService = _fileService;
  }
  hasChildren(element) {
    return URI.isUri(element) || isWorkspace(element) || isWorkspaceFolder(element) || element.isDirectory;
  }
  async getChildren(element) {
    if (isWorkspace(element)) {
      return element.folders;
    }
    let uri4;
    if (isWorkspaceFolder(element)) {
      uri4 = element.uri;
    } else if (URI.isUri(element)) {
      uri4 = element;
    } else {
      uri4 = element.resource;
    }
    const stat = await this._fileService.resolve(uri4);
    return stat.children ?? [];
  }
};

FileDataSource = __decorateClass([
  __decorateParam(0, IFileService)
], FileDataSource);

var FileRenderer = class {
  constructor(_labels, _configService) {
    this._labels = _labels;
    this._configService = _configService;
    this.templateId = "FileStat";
  }
  renderTemplate(container2) {
    return this._labels.create(container2, { supportHighlights: true });
  }
  renderElement(node, index2, templateData) {
    const fileDecorations = this._configService.getValue("explorer.decorations");
    const { element } = node;
    let resource;
    let fileKind;
    if (isWorkspaceFolder(element)) {
      resource = element.uri;
      fileKind = 2 /* ROOT_FOLDER */;
    } else {
      resource = element.resource;
      fileKind = element.isDirectory ? 1 /* FOLDER */ : 0 /* FILE */;
    }
    templateData.setFile(resource, {
      fileKind,
      hidePath: true,
      fileDecorations,
      matches: createMatches(node.filterData),
      extraClasses: ["picker-item"]
    });
  }
  disposeTemplate(templateData) {
    templateData.dispose();
  }
};

FileRenderer = __decorateClass([
  __decorateParam(1, IConfigurationService)
], FileRenderer);

var FileNavigationLabelProvider = class {
  getKeyboardNavigationLabel(element) {
    return element.name;
  }
};

var FileAccessibilityProvider = class {
  getWidgetAriaLabel() {
    return localize(6333, null);
  }
  getAriaLabel(element) {
    return element.name;
  }
};

var FileFilter = class {
  constructor(_workspaceService, configService, fileService) {
    this._workspaceService = _workspaceService;
    this._cachedExpressions = /* @__PURE__ */ new Map();
    this._disposables = new DisposableStore();
    const config = BreadcrumbsConfig.FileExcludes.bindTo(configService);
    const update = () => {
      _workspaceService.getWorkspace().folders.forEach((folder) => {
        const excludesConfig = config.getValue({ resource: folder.uri });
        if (!excludesConfig) {
          return;
        }
        const adjustedConfig = {};
        for (const pattern in excludesConfig) {
          if (typeof excludesConfig[pattern] !== "boolean") {
            continue;
          }
          const patternAbs = pattern.indexOf("**/") !== 0 ? posix.join(folder.uri.path, pattern) : pattern;
          adjustedConfig[patternAbs] = excludesConfig[pattern];
        }
        const ignoreCase = !fileService.hasCapability(folder.uri, 1024 /* PathCaseSensitive */);
        this._cachedExpressions.set(folder.uri.toString(), parse4(adjustedConfig, { ignoreCase }));
      });
    };
    update();
    this._disposables.add(config);
    this._disposables.add(config.onDidChange(update));
    this._disposables.add(_workspaceService.onDidChangeWorkspaceFolders(update));
  }
  dispose() {
    this._disposables.dispose();
  }
  filter(element, _parentVisibility) {
    if (isWorkspaceFolder(element)) {
      return true;
    }
    const folder = this._workspaceService.getWorkspaceFolder(element.resource);
    if (!folder || !this._cachedExpressions.has(folder.uri.toString())) {
      return true;
    }
    const expression = this._cachedExpressions.get(folder.uri.toString());
    return !expression(relative(folder.uri.path, element.resource.path), basename2(element.resource));
  }
};

FileFilter = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IFileService)
], FileFilter);

var FileSorter = class {
  compare(a, b) {
    if (isWorkspaceFolder(a) && isWorkspaceFolder(b)) {
      return a.index - b.index;
    }
    if (a.isDirectory === b.isDirectory) {
      return compareFileNames(a.name, b.name);
    } else if (a.isDirectory) {
      return -1;
    } else {
      return 1;
    }
  }
};

var BreadcrumbsFilePicker = class extends BreadcrumbsPicker {
  constructor(parent, resource, instantiationService, themeService, configService, _workspaceService, _editorService) {
    super(parent, resource, instantiationService, themeService, configService);
    this._workspaceService = _workspaceService;
    this._editorService = _editorService;
  }
  _createTree(container2) {
    this._treeContainer.classList.add("file-icon-themable-tree");
    this._treeContainer.classList.add("show-file-icons");
    const onFileIconThemeChange = (fileIconTheme) => {
      this._treeContainer.classList.toggle("align-icons-and-twisties", fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
      this._treeContainer.classList.toggle("hide-arrows", fileIconTheme.hidesExplorerArrows === true);
    };
    this._disposables.add(this._themeService.onDidFileIconThemeChange(onFileIconThemeChange));
    onFileIconThemeChange(this._themeService.getFileIconTheme());
    const labels = this._instantiationService.createInstance(
      ResourceLabels,
      DEFAULT_LABELS_CONTAINER
      /* TODO@Jo visibility propagation */
    );
    this._disposables.add(labels);
    return this._instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "BreadcrumbsFilePicker",
      container2,
      new FileVirtualDelegate(),
      [this._instantiationService.createInstance(FileRenderer, labels)],
      this._instantiationService.createInstance(FileDataSource),
      {
        multipleSelectionSupport: false,
        sorter: new FileSorter(),
        filter: this._instantiationService.createInstance(FileFilter),
        identityProvider: new FileIdentityProvider(),
        keyboardNavigationLabelProvider: new FileNavigationLabelProvider(),
        accessibilityProvider: this._instantiationService.createInstance(FileAccessibilityProvider),
        showNotFoundMessage: false,
        overrideStyles: {
          listBackground: breadcrumbsPickerBackground
        }
      }
    );
  }
  async _setInput(element) {
    const { uri: uri4, kind } = element;
    let input;
    if (kind === 2 /* ROOT_FOLDER */) {
      input = this._workspaceService.getWorkspace();
    } else {
      input = dirname2(uri4);
    }
    const tree = this._tree;
    await tree.setInput(input);
    let focusElement;
    for (const { element: element2 } of tree.getNode().children) {
      if (isWorkspaceFolder(element2) && isEqual2(element2.uri, uri4)) {
        focusElement = element2;
        break;
      } else if (isEqual2(element2.resource, uri4)) {
        focusElement = element2;
        break;
      }
    }
    if (focusElement) {
      tree.reveal(focusElement, 0.5);
      tree.setFocus([focusElement], this._fakeEvent);
    }
    tree.domFocus();
  }
  _previewElement(_element) {
    return Disposable.None;
  }
  async _revealElement(element, options3, sideBySide) {
    if (!isWorkspaceFolder(element) && element.isFile) {
      this._onWillPickElement.fire();
      await this._editorService.openEditor({ resource: element.resource, options: options3 }, sideBySide ? SIDE_GROUP : void 0);
      return true;
    }
    return false;
  }
};

BreadcrumbsFilePicker = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IEditorService)
], BreadcrumbsFilePicker);

var OutlineTreeSorter = class {
  constructor(comparator, uri4, configService) {
    this.comparator = comparator;
    this._order = configService.getValue(uri4, "breadcrumbs.symbolSortOrder");
  }
  compare(a, b) {
    if (this._order === "name") {
      return this.comparator.compareByName(a, b);
    } else if (this._order === "type") {
      return this.comparator.compareByType(a, b);
    } else {
      return this.comparator.compareByPosition(a, b);
    }
  }
};

OutlineTreeSorter = __decorateClass([
  __decorateParam(2, ITextResourceConfigurationService)
], OutlineTreeSorter);

var BreadcrumbsOutlinePicker = class extends BreadcrumbsPicker {
  _createTree(container2, input) {
    const { config } = input.outline;
    return this._instantiationService.createInstance(
      WorkbenchDataTree,
      "BreadcrumbsOutlinePicker",
      container2,
      config.delegate,
      config.renderers,
      config.treeDataSource,
      {
        ...config.options,
        sorter: this._instantiationService.createInstance(OutlineTreeSorter, config.comparator, void 0),
        collapseByDefault: true,
        expandOnlyOnTwistieClick: true,
        multipleSelectionSupport: false,
        showNotFoundMessage: false
      }
    );
  }
  _setInput(input) {
    const viewState = input.outline.captureViewState();
    this.restoreViewState = () => {
      viewState.dispose();
    };
    const tree = this._tree;
    tree.setInput(input.outline);
    if (input.element !== input.outline) {
      tree.reveal(input.element, 0.5);
      tree.setFocus([input.element], this._fakeEvent);
    }
    tree.domFocus();
    return Promise.resolve();
  }
  _previewElement(element) {
    const outline = this._tree.getInput();
    return outline.preview(element);
  }
  async _revealElement(element, options3, sideBySide) {
    this._onWillPickElement.fire();
    const outline = this._tree.getInput();
    await outline.reveal(element, options3, sideBySide, false);
    return true;
  }
};
export { BreadcrumbsPicker, FileVirtualDelegate, FileIdentityProvider, FileDataSource, FileRenderer, FileNavigationLabelProvider, FileAccessibilityProvider, FileFilter, FileSorter, BreadcrumbsFilePicker, OutlineTreeSorter, BreadcrumbsOutlinePicker };
