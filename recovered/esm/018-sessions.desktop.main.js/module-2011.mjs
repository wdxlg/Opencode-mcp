// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/breadcrumbsModel.ts
import { dirname2, isEqual2 } from "./module-0034.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { BreadcrumbsConfig } from "./module-2009.mjs";
import { Schemas, matchesSomeScheme } from "./module-0033.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceFolderLabelService } from "./module-2010.mjs";
import { IOutlineService } from "./module-0972.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/browser/parts/editor/breadcrumbsModel.ts
var FileElement = class {
  constructor(uri4, kind, label3) {
    this.uri = uri4;
    this.kind = kind;
    this.label = label3;
  }
  equals(other) {
    return isEqual2(this.uri, other.uri) && this.label === other.label;
  }
};

var OutlineElement2 = class {
  constructor(element, outline) {
    this.element = element;
    this.outline = outline;
  }
};

var BreadcrumbsModel = class {
  constructor(resource, editor, configurationService, _workspaceService, _workspaceFolderLabelService, _outlineService, _labelService) {
    this.resource = resource;
    this.editor = editor;
    this._workspaceService = _workspaceService;
    this._workspaceFolderLabelService = _workspaceFolderLabelService;
    this._outlineService = _outlineService;
    this._labelService = _labelService;
    this._disposables = new DisposableStore();
    this._currentOutline = new MutableDisposable();
    this._outlineDisposables = new DisposableStore();
    this._onDidUpdate = new Emitter();
    this.onDidUpdate = this._onDidUpdate.event;
    this._cfgFilePath = BreadcrumbsConfig.FilePath.bindTo(configurationService);
    this._cfgSymbolPath = BreadcrumbsConfig.SymbolPath.bindTo(configurationService);
    this._disposables.add(this._cfgFilePath.onDidChange((_) => this._onDidUpdate.fire(this)));
    this._disposables.add(this._cfgSymbolPath.onDidChange((_) => this._onDidUpdate.fire(this)));
    this._workspaceService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspaceFolders, this, this._disposables);
    this._disposables.add(this._labelService.onDidChangeFormatters((e4) => {
      if (e4.scheme === this.resource.scheme) {
        this._updateFileInfo();
      }
    }));
    this._fileInfo = this._initFilePathInfo(resource);
    if (editor) {
      this._bindToEditor(editor);
      this._disposables.add(_outlineService.onDidChange(() => this._bindToEditor(editor)));
      this._disposables.add(editor.onDidChangeControl(() => this._bindToEditor(editor)));
    }
    this._onDidUpdate.fire(this);
  }
  dispose() {
    this._disposables.dispose();
    this._cfgFilePath.dispose();
    this._cfgSymbolPath.dispose();
    this._currentOutline.dispose();
    this._outlineDisposables.dispose();
    this._onDidUpdate.dispose();
  }
  isRelative() {
    return Boolean(this._fileInfo.folder || this._fileInfo.home);
  }
  getElements() {
    let result = [];
    if (this._cfgFilePath.getValue() === "on") {
      result = result.concat(this._fileInfo.path);
    } else if (this._cfgFilePath.getValue() === "last" && this._fileInfo.path.length > 0) {
      result = result.concat(this._fileInfo.path.slice(-1));
    }
    if (this._cfgSymbolPath.getValue() === "off") {
      return result;
    }
    if (!this._currentOutline.value) {
      return result;
    }
    const breadcrumbsElements = this._currentOutline.value.config.breadcrumbsDataSource.getBreadcrumbElements();
    for (let i2 = this._cfgSymbolPath.getValue() === "last" && breadcrumbsElements.length > 0 ? breadcrumbsElements.length - 1 : 0; i2 < breadcrumbsElements.length; i2++) {
      result.push(new OutlineElement2(breadcrumbsElements[i2].element, this._currentOutline.value));
    }
    if (breadcrumbsElements.length === 0 && !this._currentOutline.value.isEmpty) {
      result.push(new OutlineElement2(this._currentOutline.value, this._currentOutline.value));
    }
    return result;
  }
  _initFilePathInfo(uri4) {
    if (matchesSomeScheme(uri4, Schemas.untitled, Schemas.data)) {
      return {
        folder: void 0,
        path: []
      };
    }
    const info = {
      folder: this._workspaceService.getWorkspaceFolder(uri4) ?? void 0,
      path: [],
      home: this._labelService.getUriHome(uri4)
    };
    let uriPrefix = uri4;
    while (uriPrefix && uriPrefix.path !== "/") {
      if (info.folder && isEqual2(info.folder.uri, uriPrefix) || info.home && isEqual2(info.home, uriPrefix.with({ query: null, fragment: null }))) {
        break;
      }
      info.path.unshift(new FileElement(uriPrefix, info.path.length === 0 ? 0 /* FILE */ : 1 /* FOLDER */));
      const prevPathLength = uriPrefix.path.length;
      uriPrefix = dirname2(uriPrefix);
      if (uriPrefix.path.length === prevPathLength) {
        break;
      }
    }
    if (info.home) {
      const separator2 = this._labelService.getSeparator(info.home.scheme, info.home.authority);
      const labels = this._labelService.getUriLabel(info.home).split(separator2).filter(Boolean);
      for (let index2 = labels.length - 1; index2 >= 0; index2--) {
        info.path.unshift(new FileElement(info.home, index2 === 0 ? 2 /* ROOT_FOLDER */ : 1 /* FOLDER */, labels[index2]));
      }
    }
    if (info.folder && this._workspaceService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const folderCount = this._workspaceService.getWorkspace().folders.length;
      if (folderCount > 1 || isEqual2(info.folder.uri, this.resource)) {
        info.path.unshift(new FileElement(
          info.folder.uri,
          2 /* ROOT_FOLDER */,
          this._workspaceFolderLabelService.getWorkspaceFolderLabel(info.folder)
        ));
      }
    }
    return info;
  }
  _onDidChangeWorkspaceFolders() {
    this._updateFileInfo();
  }
  _updateFileInfo() {
    this._fileInfo = this._initFilePathInfo(this.resource);
    this._onDidUpdate.fire(this);
  }
  _bindToEditor(editor) {
    const newCts = new CancellationTokenSource();
    this._currentOutline.clear();
    this._outlineDisposables.clear();
    this._outlineDisposables.add(toDisposable(() => newCts.dispose(true)));
    this._outlineService.createOutline(editor, 2 /* Breadcrumbs */, newCts.token).then((outline) => {
      if (newCts.token.isCancellationRequested) {
        outline?.dispose();
        outline = void 0;
      }
      this._currentOutline.value = outline;
      this._onDidUpdate.fire(this);
      if (outline) {
        this._outlineDisposables.add(outline.onDidChange(() => this._onDidUpdate.fire(this)));
      }
    }).catch((err) => {
      this._onDidUpdate.fire(this);
      onUnexpectedError(err);
    });
  }
};

BreadcrumbsModel = __decorateClass([
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IWorkspaceFolderLabelService),
  __decorateParam(5, IOutlineService),
  __decorateParam(6, ILabelService)
], BreadcrumbsModel);
export { FileElement, OutlineElement2, BreadcrumbsModel };
