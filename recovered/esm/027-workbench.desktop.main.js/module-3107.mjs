// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane.ts
import { ViewPane } from "./module-1335.mjs";
import { MenuId } from "./module-0092.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { CachedFunction, LRUCachedFunction } from "./module-0027.mjs";
import { URI } from "./module-0032.mjs";
import { BulkEditPreviewProvider, BulkFileOperations } from "./module-3105.mjs";
import { BulkEditAccessibilityProvider, BulkEditDataSource, BulkEditDelegate, BulkEditIdentityProvider, BulkEditNaviLabelProvider, BulkEditSorter, CategoryElement, CategoryElementRenderer, FileElement2, FileElementRenderer, TextEditElement, TextEditElementRenderer, compareBulkFileOperations } from "./module-3106.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { ButtonBar } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { localize } from "./module-0001.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane.ts
var BulkEditPane = class extends ViewPane {
  constructor(options3, _instaService, _editorService, _labelService, _textModelService, _dialogService, _contextMenuService, _storageService, contextKeyService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, hoverService) {
    super(
      { ...options3, titleMenuId: MenuId.BulkEditTitle },
      keybindingService,
      contextMenuService,
      configurationService,
      contextKeyService,
      viewDescriptorService,
      _instaService,
      openerService,
      themeService,
      hoverService
    );
    this._instaService = _instaService;
    this._editorService = _editorService;
    this._labelService = _labelService;
    this._textModelService = _textModelService;
    this._dialogService = _dialogService;
    this._contextMenuService = _contextMenuService;
    this._storageService = _storageService;
    this._treeViewStates = /* @__PURE__ */ new Map();
    this._disposables = new DisposableStore();
    this._sessionDisposables = new DisposableStore();
    this._computeResourceDiffEditorInputs = new LRUCachedFunction(async (fileOperations) => {
      const computeDiffEditorInput = new CachedFunction(async (fileOperation) => {
        const fileOperationUri = fileOperation.uri;
        const previewUri = this._currentProvider.asPreviewUri(fileOperationUri);
        if (fileOperation.type & 4 /* Delete */) {
          return {
            original: { resource: URI.revive(previewUri) },
            modified: { resource: void 0 },
            goToFileResource: fileOperation.uri
          };
        } else {
          let leftResource;
          try {
            (await this._textModelService.createModelReference(fileOperationUri)).dispose();
            leftResource = fileOperationUri;
          } catch {
            leftResource = BulkEditPreviewProvider.emptyPreview;
          }
          return {
            original: { resource: URI.revive(leftResource) },
            modified: { resource: URI.revive(previewUri) },
            goToFileResource: leftResource
          };
        }
      });
      const sortedFileOperations = fileOperations.slice().sort(compareBulkFileOperations);
      const resources = [];
      for (const operation of sortedFileOperations) {
        resources.push(await computeDiffEditorInput.get(operation));
      }
      const getResourceDiffEditorInputIdOfOperation = async (operation) => {
        const resource = await computeDiffEditorInput.get(operation);
        return { original: resource.original.resource, modified: resource.modified.resource };
      };
      return {
        resources,
        getResourceDiffEditorInputIdOfOperation
      };
    });
    this.element.classList.add("bulk-edit-panel", "show-file-icons");
    this._ctxHasCategories = BulkEditPane.ctxHasCategories.bindTo(contextKeyService);
    this._ctxGroupByFile = BulkEditPane.ctxGroupByFile.bindTo(contextKeyService);
    this._ctxHasCheckedChanges = BulkEditPane.ctxHasCheckedChanges.bindTo(contextKeyService);
  }
  static {
    this.ID = "refactorPreview";
  }
  static {
    this.Schema = "vscode-bulkeditpreview-multieditor";
  }
  static {
    this.ctxHasCategories = new RawContextKey("refactorPreview.hasCategories", false);
  }
  static {
    this.ctxGroupByFile = new RawContextKey("refactorPreview.groupByFile", true);
  }
  static {
    this.ctxHasCheckedChanges = new RawContextKey("refactorPreview.hasCheckedChanges", true);
  }
  static {
    this._memGroupByFile = `${this.ID}.groupByFile`;
  }
  dispose() {
    this._tree.dispose();
    this._disposables.dispose();
    this._sessionDisposables.dispose();
    super.dispose();
  }
  renderBody(parent) {
    super.renderBody(parent);
    const resourceLabels = this._instaService.createInstance(
      ResourceLabels,
      { onDidChangeVisibility: this.onDidChangeBodyVisibility }
    );
    this._disposables.add(resourceLabels);
    const contentContainer = document.createElement("div");
    contentContainer.className = "content";
    parent.appendChild(contentContainer);
    const treeContainer = document.createElement("div");
    contentContainer.appendChild(treeContainer);
    this._treeDataSource = this._instaService.createInstance(BulkEditDataSource);
    this._treeDataSource.groupByFile = this._storageService.getBoolean(BulkEditPane._memGroupByFile, 0 /* PROFILE */, true);
    this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
    this._tree = this._instaService.createInstance(
      WorkbenchAsyncDataTree,
      this.id,
      treeContainer,
      new BulkEditDelegate(),
      [this._instaService.createInstance(TextEditElementRenderer), this._instaService.createInstance(FileElementRenderer, resourceLabels), this._instaService.createInstance(CategoryElementRenderer)],
      this._treeDataSource,
      {
        accessibilityProvider: this._instaService.createInstance(BulkEditAccessibilityProvider),
        identityProvider: new BulkEditIdentityProvider(),
        expandOnlyOnTwistieClick: true,
        multipleSelectionSupport: false,
        keyboardNavigationLabelProvider: new BulkEditNaviLabelProvider(),
        sorter: new BulkEditSorter(),
        selectionNavigation: true
      }
    );
    this._disposables.add(this._tree.onContextMenu(this._onContextMenu, this));
    this._disposables.add(this._tree.onDidOpen((e) => this._openElementInMultiDiffEditor(e)));
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "buttons";
    contentContainer.appendChild(buttonsContainer);
    const buttonBar = new ButtonBar(buttonsContainer);
    this._disposables.add(buttonBar);
    const btnConfirm = buttonBar.addButton({ supportIcons: true, ...defaultButtonStyles });
    btnConfirm.label = localize(8346, null);
    btnConfirm.onDidClick(() => this.accept(), this, this._disposables);
    const btnCancel = buttonBar.addButton({ ...defaultButtonStyles, secondary: true });
    btnCancel.label = localize(8342, null);
    btnCancel.onDidClick(() => this.discard(), this, this._disposables);
    this._message = document.createElement("span");
    this._message.className = "message";
    this._message.innerText = localize(8345, null);
    parent.appendChild(this._message);
    this._setState("message" /* Message */);
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    const treeHeight = height - 50;
    this._tree.getHTMLElement().parentElement.style.height = `${treeHeight}px`;
    this._tree.layout(treeHeight, width2);
  }
  _setState(state) {
    this.element.dataset["state"] = state;
  }
  async setInput(edit3, token) {
    this._setState("data" /* Data */);
    this._sessionDisposables.clear();
    this._treeViewStates.clear();
    if (this._currentResolve) {
      this._currentResolve(void 0);
      this._currentResolve = void 0;
    }
    const input = await this._instaService.invokeFunction(BulkFileOperations.create, edit3);
    this._currentProvider = this._instaService.createInstance(BulkEditPreviewProvider, input);
    this._sessionDisposables.add(this._currentProvider);
    this._sessionDisposables.add(input);
    const hasCategories = input.categories.length > 1;
    this._ctxHasCategories.set(hasCategories);
    this._treeDataSource.groupByFile = !hasCategories || this._treeDataSource.groupByFile;
    this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
    this._currentInput = input;
    return new Promise((resolve3) => {
      token.onCancellationRequested(() => resolve3(void 0));
      this._currentResolve = resolve3;
      this._setTreeInput(input);
      this._sessionDisposables.add(input.checked.onDidChange(() => {
        this._tree.updateChildren();
        this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
      }));
    });
  }
  hasInput() {
    return Boolean(this._currentInput);
  }
  async _setTreeInput(input) {
    const viewState = this._treeViewStates.get(this._treeDataSource.groupByFile);
    await this._tree.setInput(input, viewState);
    this._tree.domFocus();
    if (viewState) {
      return;
    }
    const expand = [...this._tree.getNode(input).children].slice(0, 10);
    while (expand.length > 0) {
      const { element } = expand.shift();
      if (element instanceof FileElement2) {
        await this._tree.expand(element, true);
      }
      if (element instanceof CategoryElement) {
        await this._tree.expand(element, true);
        expand.push(...this._tree.getNode(element).children);
      }
    }
  }
  accept() {
    const conflicts = this._currentInput?.conflicts.list();
    if (!conflicts || conflicts.length === 0) {
      this._done(true);
      return;
    }
    let message;
    if (conflicts.length === 1) {
      message = localize(8343, null, this._labelService.getUriLabel(conflicts[0], { relative: true }));
    } else {
      message = localize(8344, null, conflicts.length);
    }
    this._dialogService.warn(message).finally(() => this._done(false));
  }
  discard() {
    this._done(false);
  }
  _done(accept) {
    this._currentResolve?.(accept ? this._currentInput?.getWorkspaceEdit() : void 0);
    this._currentInput = void 0;
    this._setState("message" /* Message */);
    this._sessionDisposables.clear();
  }
  toggleChecked() {
    const [first2] = this._tree.getFocus();
    if ((first2 instanceof FileElement2 || first2 instanceof TextEditElement) && !first2.isDisabled()) {
      first2.setChecked(!first2.isChecked());
    } else if (first2 instanceof CategoryElement) {
      first2.setChecked(!first2.isChecked());
    }
  }
  groupByFile() {
    if (!this._treeDataSource.groupByFile) {
      this.toggleGrouping();
    }
  }
  groupByType() {
    if (this._treeDataSource.groupByFile) {
      this.toggleGrouping();
    }
  }
  toggleGrouping() {
    const input = this._tree.getInput();
    if (input) {
      const oldViewState = this._tree.getViewState();
      this._treeViewStates.set(this._treeDataSource.groupByFile, oldViewState);
      this._treeDataSource.groupByFile = !this._treeDataSource.groupByFile;
      this._setTreeInput(input);
      this._storageService.store(BulkEditPane._memGroupByFile, this._treeDataSource.groupByFile, 0 /* PROFILE */, 0 /* USER */);
      this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
    }
  }
  async _openElementInMultiDiffEditor(e) {
    const fileOperations = this._currentInput?.fileOperations;
    if (!fileOperations) {
      return;
    }
    let selection = void 0;
    let fileElement;
    if (e.element instanceof TextEditElement) {
      fileElement = e.element.parent;
      selection = e.element.edit.textEdit.textEdit.range;
    } else if (e.element instanceof FileElement2) {
      fileElement = e.element;
      selection = e.element.edit.textEdits[0]?.textEdit.textEdit.range;
    } else {
      return;
    }
    const result = await this._computeResourceDiffEditorInputs.get(fileOperations);
    const resourceId = await result.getResourceDiffEditorInputIdOfOperation(fileElement.edit);
    const options3 = {
      ...e.editorOptions,
      viewState: {
        revealData: {
          resource: resourceId,
          range: selection
        }
      }
    };
    const multiDiffSource = URI.from({ scheme: BulkEditPane.Schema });
    const label3 = "Refactor Preview";
    this._editorService.openEditor({
      multiDiffSource,
      label: label3,
      options: options3,
      isTransient: true,
      description: label3,
      resources: result.resources
    }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
  }
  _onContextMenu(e) {
    this._contextMenuService.showContextMenu({
      menuId: MenuId.BulkEditContext,
      contextKeyService: this.contextKeyService,
      getAnchor: () => e.anchor
    });
  }
};

BulkEditPane = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, IContextMenuService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, IOpenerService),
  __decorateParam(14, IThemeService),
  __decorateParam(15, IHoverService)
], BulkEditPane);
export { BulkEditPane };
