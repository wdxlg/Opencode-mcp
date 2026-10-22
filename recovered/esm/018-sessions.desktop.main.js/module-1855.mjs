// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookEditor.ts
import { EditorPane } from "./module-1090.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { NOTEBOOK_EDITOR_ID, NotebookWorkingCopyTypeIdentifier } from "./module-0911.mjs";
import { NotebookEditorInput } from "./module-0940.mjs";
import { $, append, isAncestorOfActiveElement, setParentFlowTo } from "./module-0075.mjs";
import { generateUuid } from "./module-0190.mjs";
import { SELECT_KERNEL_ID } from "./module-1845.mjs";
import { NotebooKernelActionViewItem } from "./module-1848.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, createEditorOpenError, createTooLargeFileError, isEditorOpenError } from "./module-0926.mjs";
import { toAction } from "./module-0082.mjs";
import { timeout } from "./module-0036.mjs";
import { NotebookPerfMarks } from "./module-1849.mjs";
import { InstallRecommendedExtensionAction } from "./module-1854.mjs";
import { streamToBuffer } from "./module-0038.mjs";
import { ByteSize, IFileService, TooLargeFileOperationError } from "./module-0269.mjs";
import { StopWatch } from "./module-0016.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookEditor.ts
var NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = "NotebookEditorViewState";

var NOTEBOOK_WEB_HOST_OPEN_CONFIRMED_KEY = "notebook.webHost.openConfirmed";

var confirmedWebHostNotebooks = /* @__PURE__ */ new Set();

var NotebookEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, _instantiationService, _storageService, _editorService, _editorGroupService, _notebookWidgetService, _contextKeyService, _fileService, configurationService, _editorProgressService, _notebookService, _extensionsWorkbenchService, _workingCopyBackupService, logService, _preferencesService, _dialogService, _environmentService) {
    super(NotebookEditor.ID, group2, telemetryService, themeService, _storageService);
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._editorService = _editorService;
    this._editorGroupService = _editorGroupService;
    this._notebookWidgetService = _notebookWidgetService;
    this._contextKeyService = _contextKeyService;
    this._fileService = _fileService;
    this._editorProgressService = _editorProgressService;
    this._notebookService = _notebookService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._workingCopyBackupService = _workingCopyBackupService;
    this.logService = logService;
    this._preferencesService = _preferencesService;
    this._dialogService = _dialogService;
    this._environmentService = _environmentService;
    this._groupListener = this._register(new DisposableStore());
    this._widgetDisposableStore = this._register(new DisposableStore());
    this._widget = { value: void 0 };
    this._inputListener = this._register(new MutableDisposable());
    // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
    this._onDidFocusWidget = this._register(new Emitter());
    this._onDidBlurWidget = this._register(new Emitter());
    this._onDidChangeModel = this._register(new Emitter());
    this.onDidChangeModel = this._onDidChangeModel.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onDidChangeScroll = this._register(new Emitter());
    this.onDidChangeScroll = this._onDidChangeScroll.event;
    this._editorMemento = this.getEditorMemento(_editorGroupService, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
    this._register(this._fileService.onDidChangeFileSystemProviderCapabilities((e4) => this._onDidChangeFileSystemProvider(e4.scheme)));
    this._register(this._fileService.onDidChangeFileSystemProviderRegistrations((e4) => this._onDidChangeFileSystemProvider(e4.scheme)));
  }
  static {
    this.ID = NOTEBOOK_EDITOR_ID;
  }
  get onDidFocus() {
    return this._onDidFocusWidget.event;
  }
  get onDidBlur() {
    return this._onDidBlurWidget.event;
  }
  _onDidChangeFileSystemProvider(scheme) {
    if (this.input instanceof NotebookEditorInput && this.input.resource?.scheme === scheme) {
      this._updateReadonly(this.input);
    }
  }
  _onDidChangeInputCapabilities(input) {
    if (this.input === input) {
      this._updateReadonly(input);
    }
  }
  _updateReadonly(input) {
    this._widget.value?.setOptions({ isReadOnly: !!input.isReadonly() });
  }
  get textModel() {
    return this._widget.value?.textModel;
  }
  get minimumWidth() {
    return 220;
  }
  get maximumWidth() {
    return Number.POSITIVE_INFINITY;
  }
  // these setters need to exist because this extends from EditorPane
  set minimumWidth(value2) {
  }
  set maximumWidth(value2) {
  }
  //#region Editor Core
  get scopedContextKeyService() {
    return this._widget.value?.scopedContextKeyService;
  }
  createEditor(parent) {
    this._rootElement = append(parent, $(".notebook-editor"));
    this._rootElement.id = `notebook-editor-element-${generateUuid()}`;
  }
  getActionViewItem(action, options3) {
    if (action.id === SELECT_KERNEL_ID) {
      return this._register(this._instantiationService.createInstance(NotebooKernelActionViewItem, action, this, options3));
    }
    return void 0;
  }
  getControl() {
    return this._widget.value;
  }
  setVisible(visible) {
    super.setVisible(visible);
    if (!visible) {
      this._widget.value?.onWillHide();
    }
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    this._groupListener.clear();
    this._groupListener.add(this.group.onWillCloseEditor((e4) => this._saveEditorViewState(e4.editor)));
    this._groupListener.add(this.group.onDidModelChange(() => {
      if (this._editorGroupService.activeGroup !== this.group) {
        this._widget?.value?.updateEditorFocus();
      }
    }));
    if (!visible) {
      this._saveEditorViewState(this.input);
      if (this.input && this._widget.value) {
        this._widget.value.onWillHide();
      }
    }
  }
  focus() {
    super.focus();
    this._widget.value?.focus();
  }
  hasFocus() {
    const value2 = this._widget.value;
    if (!value2) {
      return false;
    }
    return !!value2 && isAncestorOfActiveElement(value2.getDomNode() || isAncestorOfActiveElement(value2.getOverflowContainerDomNode()));
  }
  /**
   * When running serverless on the web (i.e. in the browser with no remote server
   * connected), prompt the user to confirm that they really want to open the notebook.
   * The confirmation is only shown the first time a given notebook is opened in the
   * session (so switching back to an already-open notebook does not re-prompt), and the
   * choice can be remembered for the whole workspace via a "Don't ask again" checkbox.
   */
  async _confirmOpenOnWebHost(input) {
    const isServerlessWeb = isWeb && !this._environmentService.remoteAuthority;
    if (!isServerlessWeb) {
      return;
    }
    if (this._storageService.getBoolean(NOTEBOOK_WEB_HOST_OPEN_CONFIRMED_KEY, 1 /* WORKSPACE */, false)) {
      return;
    }
    const resourceKey = input.resource.toString();
    if (confirmedWebHostNotebooks.has(resourceKey)) {
      return;
    }
    const { confirmed, checkboxChecked } = await this._dialogService.confirm({
      type: "warning",
      message: localize(17761, null),
      detail: localize(17763, null),
      primaryButton: localize(17764, null),
      checkbox: { label: localize(17765, null) }
    });
    if (!confirmed) {
      throw createEditorOpenError(localize(17762, null), [
        toAction({
          id: "workbench.notebook.action.openAsText",
          label: localize(17766, null),
          run: async () => {
            this._editorService.openEditor({ resource: input.resource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id, pinned: true } });
          }
        })
      ], { forceMessage: true });
    }
    confirmedWebHostNotebooks.add(resourceKey);
    if (checkboxChecked) {
      this._storageService.store(NOTEBOOK_WEB_HOST_OPEN_CONFIRMED_KEY, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  async setInput(input, options3, context2, token, noRetry) {
    await this._confirmOpenOnWebHost(input);
    try {
      let perfMarksCaptured = false;
      const fileOpenMonitor = timeout(1e4);
      fileOpenMonitor.then(() => {
        perfMarksCaptured = true;
        this._handlePerfMark(perf2, input);
      });
      const perf2 = new NotebookPerfMarks();
      perf2.mark("startTime");
      this._inputListener.value = input.onDidChangeCapabilities(() => this._onDidChangeInputCapabilities(input));
      this._widgetDisposableStore.clear();
      this._widget.value?.onWillHide();
      this._widget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, this.group.id, input, void 0, this._pagePosition?.dimension, this.window);
      if (this._rootElement && this._widget.value.getDomNode()) {
        this._rootElement.setAttribute("aria-flowto", this._widget.value.getDomNode().id || "");
        setParentFlowTo(this._widget.value.getDomNode(), this._rootElement);
      }
      this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
      this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(() => this._onDidChangeSelection.fire({ reason: 2 /* USER */ })));
      if (this._pagePosition) {
        this._widget.value.layout(this._pagePosition.dimension, this._rootElement, this._pagePosition.position);
      }
      await super.setInput(input, options3, context2, token);
      const model = await input.resolve(options3, perf2);
      perf2.mark("inputLoaded");
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (!this._widget.value) {
        if (noRetry) {
          return void 0;
        }
        return this.setInput(input, options3, context2, token, true);
      }
      if (model === null) {
        const knownProvider = this._notebookService.getViewTypeProvider(input.viewType);
        if (!knownProvider) {
          throw new Error(localize(17759, null, input.viewType));
        }
        await this._extensionsWorkbenchService.whenInitialized;
        const extensionInfo = this._extensionsWorkbenchService.local.find((e4) => e4.identifier.id === knownProvider);
        throw createEditorOpenError(new Error(localize(17760, null, input.viewType)), [
          toAction({
            id: "workbench.notebook.action.installOrEnableMissing",
            label: extensionInfo ? localize(17767, null, input.viewType) : localize(17768, null, input.viewType),
            run: async () => {
              const d = this._notebookService.onAddViewType((viewType) => {
                if (viewType === input.viewType) {
                  this._editorService.openEditor({ resource: input.resource });
                  d.dispose();
                }
              });
              const extensionInfo2 = this._extensionsWorkbenchService.local.find((e4) => e4.identifier.id === knownProvider);
              try {
                if (extensionInfo2) {
                  await this._extensionsWorkbenchService.setEnablement(extensionInfo2, extensionInfo2.enablementState === 11 /* DisabledWorkspace */ ? 13 /* EnabledWorkspace */ : 12 /* EnabledGlobally */);
                } else {
                  await this._instantiationService.createInstance(InstallRecommendedExtensionAction, knownProvider).run();
                }
              } catch (ex) {
                this.logService.error(`Failed to install or enable extension ${knownProvider}`, ex);
                d.dispose();
              }
            }
          }),
          toAction({
            id: "workbench.notebook.action.openAsText",
            label: localize(17766, null),
            run: async () => {
              const backup = await this._workingCopyBackupService.resolve({ resource: input.resource, typeId: NotebookWorkingCopyTypeIdentifier.create(input.viewType) });
              if (backup) {
                const contents = await streamToBuffer(backup.value);
                this._editorService.openEditor({ resource: void 0, contents: contents.toString() });
              } else {
                this._editorService.openEditor({ resource: input.resource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id, pinned: true } });
              }
            }
          })
        ], { allowDialog: true });
      }
      this._widgetDisposableStore.add(model.notebook.onDidChangeContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EDIT */ })));
      const viewState = options3?.viewState ?? this._loadNotebookEditorViewState(input);
      this._widget.value.setParentContextKeyService(this._contextKeyService);
      this._widget.value.setEditorProgressService(this._editorProgressService);
      await this._widget.value.setModel(model.notebook, viewState, perf2);
      const isReadOnly2 = !!input.isReadonly();
      await this._widget.value.setOptions({ ...options3, isReadOnly: isReadOnly2 });
      this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
      this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(() => this._onDidBlurWidget.fire()));
      this._widgetDisposableStore.add(this._editorGroupService.createEditorDropTarget(this._widget.value.getDomNode(), {
        containsGroup: (group2) => this.group.id === group2.id
      }));
      this._widgetDisposableStore.add(this._widget.value.onDidScroll(() => {
        this._onDidChangeScroll.fire();
      }));
      perf2.mark("editorLoaded");
      fileOpenMonitor.cancel();
      if (perfMarksCaptured) {
        return;
      }
      this._handlePerfMark(perf2, input, model.notebook);
      this._onDidChangeControl.fire();
    } catch (e4) {
      this.logService.warn("NotebookEditorWidget#setInput failed", e4);
      if (isEditorOpenError(e4)) {
        throw e4;
      }
      if (e4.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
        let message;
        if (e4 instanceof TooLargeFileOperationError) {
          message = localize(17771, null, ByteSize.formatSize(e4.size));
        } else {
          message = localize(17770, null);
        }
        throw createTooLargeFileError(this.group, input, options3, message, this._preferencesService);
      }
      const error = createEditorOpenError(e4 instanceof Error ? e4 : new Error(e4 ? e4.message : ""), [
        toAction({
          id: "workbench.notebook.action.openInTextEditor",
          label: localize(17769, null),
          run: async () => {
            const activeEditorPane = this._editorService.activeEditorPane;
            if (!activeEditorPane) {
              return;
            }
            const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
            if (!activeEditorResource) {
              return;
            }
            if (activeEditorResource.toString() === input.resource?.toString()) {
              return this._editorService.openEditor({
                resource: activeEditorResource,
                options: {
                  override: DEFAULT_EDITOR_ASSOCIATION.id,
                  pinned: true
                  // new file gets pinned by default
                }
              });
            }
            return;
          }
        })
      ], { allowDialog: true });
      throw error;
    }
  }
  _handlePerfMark(perf2, input, notebook) {
    const perfMarks = perf2.value;
    const startTime = perfMarks["startTime"];
    const extensionActivated = perfMarks["extensionActivated"];
    const inputLoaded = perfMarks["inputLoaded"];
    const webviewCommLoaded = perfMarks["webviewCommLoaded"];
    const customMarkdownLoaded = perfMarks["customMarkdownLoaded"];
    const editorLoaded = perfMarks["editorLoaded"];
    let extensionActivationTimespan = -1;
    let inputLoadingTimespan = -1;
    let webviewCommLoadingTimespan = -1;
    let customMarkdownLoadingTimespan = -1;
    let editorLoadingTimespan = -1;
    if (startTime !== void 0 && extensionActivated !== void 0) {
      extensionActivationTimespan = extensionActivated - startTime;
      if (inputLoaded !== void 0) {
        inputLoadingTimespan = inputLoaded - extensionActivated;
      }
      if (webviewCommLoaded !== void 0) {
        webviewCommLoadingTimespan = webviewCommLoaded - extensionActivated;
      }
      if (customMarkdownLoaded !== void 0) {
        customMarkdownLoadingTimespan = customMarkdownLoaded - startTime;
      }
      if (editorLoaded !== void 0) {
        editorLoadingTimespan = editorLoaded - startTime;
      }
    }
    let codeCellCount = void 0;
    let mdCellCount = void 0;
    let outputCount = void 0;
    let outputBytes = void 0;
    let codeLength = void 0;
    let markdownLength = void 0;
    let notebookStatsLoaded = void 0;
    if (notebook) {
      const stopWatch = new StopWatch();
      for (const cell of notebook.cells) {
        if (cell.cellKind === 2 /* Code */) {
          codeCellCount = (codeCellCount || 0) + 1;
          codeLength = (codeLength || 0) + cell.getTextLength();
          outputCount = (outputCount || 0) + cell.outputs.length;
          outputBytes = (outputBytes || 0) + cell.outputs.reduce((prev, cur) => prev + cur.outputs.reduce((size3, item) => size3 + item.data.byteLength, 0), 0);
        } else {
          mdCellCount = (mdCellCount || 0) + 1;
          markdownLength = (codeLength || 0) + cell.getTextLength();
        }
      }
      notebookStatsLoaded = stopWatch.elapsed();
    }
    this.logService.trace(`[NotebookEditor] open notebook perf ${notebook?.uri.toString() ?? ""} - extensionActivation: ${extensionActivationTimespan}, inputLoad: ${inputLoadingTimespan}, webviewComm: ${webviewCommLoadingTimespan}, customMarkdown: ${customMarkdownLoadingTimespan}, editorLoad: ${editorLoadingTimespan}`);
    this.telemetryService.publicLog2("notebook/editorOpenPerf", {
      scheme: input.resource.scheme,
      ext: extname2(input.resource),
      viewType: input.viewType,
      extensionActivated: extensionActivationTimespan,
      inputLoaded: inputLoadingTimespan,
      webviewCommLoaded: webviewCommLoadingTimespan,
      customMarkdownLoaded: customMarkdownLoadingTimespan,
      editorLoaded: editorLoadingTimespan,
      codeCellCount,
      mdCellCount,
      outputCount,
      outputBytes,
      codeLength,
      markdownLength,
      notebookStatsLoaded
    });
  }
  clearInput() {
    this._inputListener.clear();
    if (this._widget.value) {
      this._saveEditorViewState(this.input);
      this._widget.value.onWillHide();
    }
    super.clearInput();
  }
  setOptions(options3) {
    this._widget.value?.setOptions(options3);
    super.setOptions(options3);
  }
  saveState() {
    this._saveEditorViewState(this.input);
    super.saveState();
  }
  getViewState() {
    const input = this.input;
    if (!(input instanceof NotebookEditorInput)) {
      return void 0;
    }
    this._saveEditorViewState(input);
    return this._loadNotebookEditorViewState(input);
  }
  getSelection() {
    if (this._widget.value) {
      const activeCell = this._widget.value.getActiveCell();
      if (activeCell) {
        const cellUri = activeCell.uri;
        return new NotebookEditorSelection(cellUri, activeCell.getSelections());
      }
    }
    return void 0;
  }
  getScrollPosition() {
    const widget = this.getControl();
    if (!widget) {
      throw new Error("Notebook widget has not yet been initialized");
    }
    return {
      scrollTop: widget.scrollTop,
      scrollLeft: 0
    };
  }
  setScrollPosition(scrollPosition) {
    const editor = this.getControl();
    if (!editor) {
      throw new Error("Control has not yet been initialized");
    }
    editor.setScrollTop(scrollPosition.scrollTop);
  }
  _saveEditorViewState(input) {
    if (this._widget.value && input instanceof NotebookEditorInput) {
      if (this._widget.value.isDisposed) {
        return;
      }
      const state = this._widget.value.getEditorViewState();
      this._editorMemento.saveEditorState(this.group, input.resource, state);
    }
  }
  _loadNotebookEditorViewState(input) {
    const result = this._editorMemento.loadEditorState(this.group, input.resource);
    if (result) {
      return result;
    }
    for (const group2 of this._editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      if (group2.activeEditorPane !== this && group2.activeEditorPane instanceof NotebookEditor && group2.activeEditor?.matches(input)) {
        return group2.activeEditorPane._widget.value?.getEditorViewState();
      }
    }
    return;
  }
  layout(dimension, position2) {
    this._rootElement.classList.toggle("mid-width", dimension.width < 1e3 && dimension.width >= 600);
    this._rootElement.classList.toggle("narrow-width", dimension.width < 600);
    this._pagePosition = { dimension, position: position2 };
    if (!this._widget.value || !(this.input instanceof NotebookEditorInput)) {
      return;
    }
    if (this.input.resource.toString() !== this.textModel?.uri.toString() && this._widget.value?.hasModel()) {
      return;
    }
    if (this.isVisible()) {
      this._widget.value.layout(dimension, this._rootElement, position2);
    }
  }
  //#endregion
};

NotebookEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, INotebookEditorService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ITextResourceConfigurationService),
  __decorateParam(11, IEditorProgressService),
  __decorateParam(12, INotebookService),
  __decorateParam(13, IExtensionsWorkbenchService),
  __decorateParam(14, IWorkingCopyBackupService),
  __decorateParam(15, ILogService),
  __decorateParam(16, IPreferencesService),
  __decorateParam(17, IDialogService),
  __decorateParam(18, IWorkbenchEnvironmentService)
], NotebookEditor);

var NotebookEditorSelection = class _NotebookEditorSelection {
  constructor(cellUri, selections) {
    this.cellUri = cellUri;
    this.selections = selections;
  }
  compare(other) {
    if (!(other instanceof _NotebookEditorSelection)) {
      return 3 /* DIFFERENT */;
    }
    if (isEqual2(this.cellUri, other.cellUri)) {
      return 1 /* IDENTICAL */;
    }
    return 3 /* DIFFERENT */;
  }
  restore(options3) {
    const notebookOptions = {
      cellOptions: {
        resource: this.cellUri,
        options: {
          selection: this.selections[0]
        }
      }
    };
    Object.assign(notebookOptions, options3);
    return notebookOptions;
  }
  log() {
    return this.cellUri.fragment;
  }
};

function isNotebookContainingCellEditor(editor, codeEditor) {
  if (editor?.getId() === NotebookEditor.ID) {
    const notebookWidget = editor.getControl();
    if (notebookWidget) {
      for (const [_, editor2] of notebookWidget.codeEditors) {
        if (editor2 === codeEditor) {
          return true;
        }
      }
    }
  }
  return false;
}
export { isNotebookContainingCellEditor, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY, NOTEBOOK_WEB_HOST_OPEN_CONFIRMED_KEY, confirmedWebHostNotebooks, NotebookEditor, NotebookEditorSelection };
