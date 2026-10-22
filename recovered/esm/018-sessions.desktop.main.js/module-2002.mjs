// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorPanes.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions, isEditorOpenError } from "./module-0926.mjs";
import { IEditorProgressService, LongRunningOperation } from "./module-0446.mjs";
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from "./module-1089.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { ErrorPlaceholderEditor, WorkspaceTrustRequiredPlaceholderEditor } from "./module-1546.mjs";
import { severity_default } from "./module-0266.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { localize } from "./module-0001.mjs";
import { $, Dimension, getActiveElement, getWindowById, hide, isAncestor, isEditableElement, show } from "./module-0075.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1118.mjs";


// src/vs/workbench/browser/parts/editor/editorPanes.ts
var EditorPanes = class extends Disposable {
  constructor(editorGroupParent, editorPanesParent, groupView, layoutService, instantiationService, editorProgressService, workspaceTrustService, logService, dialogService, hostService) {
    super();
    this.editorGroupParent = editorGroupParent;
    this.editorPanesParent = editorPanesParent;
    this.groupView = groupView;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.workspaceTrustService = workspaceTrustService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    //#region Events
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidChangeSizeConstraints = this._register(new Emitter());
    this.onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
    this._activeEditorPane = null;
    this.editorPanes = [];
    this.mapEditorPaneToPendingSetInput = /* @__PURE__ */ new Map();
    this.activeEditorPaneDisposables = this._register(new DisposableStore());
    this.editorPanesRegistry = Registry.as(EditorExtensions.EditorPane);
    this.editorOperation = this._register(new LongRunningOperation(editorProgressService));
    this.registerListeners();
  }
  //#endregion
  get minimumWidth() {
    return this._activeEditorPane?.minimumWidth ?? DEFAULT_EDITOR_MIN_DIMENSIONS.width;
  }
  get minimumHeight() {
    return this._activeEditorPane?.minimumHeight ?? DEFAULT_EDITOR_MIN_DIMENSIONS.height;
  }
  get maximumWidth() {
    return this._activeEditorPane?.maximumWidth ?? DEFAULT_EDITOR_MAX_DIMENSIONS.width;
  }
  get maximumHeight() {
    return this._activeEditorPane?.maximumHeight ?? DEFAULT_EDITOR_MAX_DIMENSIONS.height;
  }
  get activeEditorPane() {
    return this._activeEditorPane;
  }
  registerListeners() {
    this._register(this.workspaceTrustService.onDidChangeTrust(() => this.onDidChangeWorkspaceTrust()));
  }
  onDidChangeWorkspaceTrust() {
    const editor = this._activeEditorPane?.input;
    const options3 = this._activeEditorPane?.options;
    if (editor?.hasCapability(16 /* RequiresTrust */)) {
      this.groupView.openEditor(editor, options3);
    }
  }
  async openEditor(editor, options3, internalOptions, context2 = /* @__PURE__ */ Object.create(null)) {
    try {
      return await this.doOpenEditor(this.getEditorPaneDescriptor(editor), editor, options3, internalOptions, context2);
    } catch (error) {
      if (options3?.ignoreError) {
        return { error };
      }
      return this.doShowError(error, editor, options3, internalOptions, context2);
    }
  }
  async doShowError(error, editor, options3, internalOptions, context2) {
    this.logService.error(error);
    let errorHandled = false;
    if (options3?.source === 1 /* USER */ && (!isEditorOpenError(error) || error.allowDialog)) {
      errorHandled = await this.doShowErrorDialog(error, editor);
    }
    if (errorHandled) {
      return { error };
    }
    const editorPlaceholderOptions = { ...options3 };
    if (!isCancellationError(error)) {
      editorPlaceholderOptions.error = error;
    }
    return {
      ...await this.doOpenEditor(ErrorPlaceholderEditor.DESCRIPTOR, editor, editorPlaceholderOptions, internalOptions, context2),
      error
    };
  }
  async doShowErrorDialog(error, editor) {
    let severity = severity_default.Error;
    let message = void 0;
    let detail2 = toErrorMessage(error);
    let errorActions = void 0;
    if (isEditorOpenError(error)) {
      errorActions = error.actions;
      severity = error.forceSeverity ?? severity_default.Error;
      if (error.forceMessage) {
        message = error.message;
        detail2 = void 0;
      }
    }
    if (!message) {
      message = localize(6670, null, editor.getName());
    }
    const buttons = [];
    if (errorActions && errorActions.length > 0) {
      for (const errorAction of errorActions) {
        buttons.push({
          label: errorAction.label,
          run: () => errorAction
        });
      }
    } else {
      buttons.push({
        label: localize(6671, null),
        run: () => void 0
      });
    }
    let cancelButton = void 0;
    if (buttons.length === 1) {
      cancelButton = {
        run: () => {
          errorHandled = true;
          return void 0;
        }
      };
    }
    let errorHandled = false;
    const { result } = await this.dialogService.prompt({
      type: severity,
      message,
      detail: detail2,
      buttons,
      cancelButton
    });
    if (result) {
      const errorActionResult = result.run();
      if (errorActionResult instanceof Promise) {
        errorActionResult.catch((error2) => this.dialogService.error(toErrorMessage(error2)));
      }
      errorHandled = true;
    }
    return errorHandled;
  }
  async doOpenEditor(descriptor, editor, options3, internalOptions, context2 = /* @__PURE__ */ Object.create(null)) {
    const pane = this.doShowEditorPane(descriptor);
    const activeElement = getActiveElement();
    const { changed, cancelled } = await this.doSetInput(pane, editor, options3, context2);
    if (!cancelled) {
      const focus = !options3?.preserveFocus;
      if (focus && this.shouldRestoreFocus(activeElement)) {
        pane.focus();
      } else if (!internalOptions?.preserveWindowOrder) {
        this.hostService.moveTop(getWindowById(this.groupView.windowId, true).window);
      }
    }
    return { pane, changed, cancelled };
  }
  shouldRestoreFocus(expectedActiveElement) {
    if (!this.layoutService.isRestored()) {
      return true;
    }
    if (!expectedActiveElement) {
      return true;
    }
    const activeElement = getActiveElement();
    if (!activeElement || activeElement === expectedActiveElement.ownerDocument.body) {
      return true;
    }
    const same = expectedActiveElement === activeElement;
    if (same) {
      return true;
    }
    if (!isEditableElement(activeElement)) {
      return true;
    }
    if (isAncestor(activeElement, this.editorGroupParent)) {
      return true;
    }
    return false;
  }
  getEditorPaneDescriptor(editor) {
    if (editor.hasCapability(16 /* RequiresTrust */) && !this.workspaceTrustService.isWorkspaceTrusted()) {
      return WorkspaceTrustRequiredPlaceholderEditor.DESCRIPTOR;
    }
    return assertReturnsDefined(this.editorPanesRegistry.getEditorPane(editor));
  }
  doShowEditorPane(descriptor) {
    if (this._activeEditorPane && descriptor.describes(this._activeEditorPane)) {
      return this._activeEditorPane;
    }
    this.doHideActiveEditorPane();
    const editorPane = this.doCreateEditorPane(descriptor);
    this.doSetActiveEditorPane(editorPane);
    const container2 = assertReturnsDefined(editorPane.getContainer());
    this.editorPanesParent.appendChild(container2);
    show(container2);
    editorPane.setVisible(true);
    if (this.pagePosition) {
      editorPane.layout(new Dimension(this.pagePosition.width, this.pagePosition.height), { top: this.pagePosition.top, left: this.pagePosition.left });
    }
    if (this.boundarySashes) {
      editorPane.setBoundarySashes(this.boundarySashes);
    }
    return editorPane;
  }
  doCreateEditorPane(descriptor) {
    const editorPane = this.doInstantiateEditorPane(descriptor);
    if (!editorPane.getContainer()) {
      const editorPaneContainer = $(".editor-instance");
      this.editorPanesParent.appendChild(editorPaneContainer);
      try {
        editorPane.create(editorPaneContainer);
      } catch (error) {
        editorPaneContainer.remove();
        hide(editorPaneContainer);
        throw error;
      }
    }
    return editorPane;
  }
  doInstantiateEditorPane(descriptor) {
    const existingEditorPane = this.editorPanes.find((editorPane2) => descriptor.describes(editorPane2));
    if (existingEditorPane) {
      return existingEditorPane;
    }
    const editorPane = this._register(descriptor.instantiate(this.instantiationService, this.groupView));
    this.editorPanes.push(editorPane);
    return editorPane;
  }
  doSetActiveEditorPane(editorPane) {
    this._activeEditorPane = editorPane;
    this.activeEditorPaneDisposables.clear();
    if (editorPane) {
      this.activeEditorPaneDisposables.add(editorPane.onDidChangeSizeConstraints((e4) => this._onDidChangeSizeConstraints.fire(e4)));
      this.activeEditorPaneDisposables.add(editorPane.onDidFocus(() => this._onDidFocus.fire()));
    }
    this._onDidChangeSizeConstraints.fire(void 0);
  }
  async doSetInput(editorPane, editor, options3, context2) {
    let inputMatches = editorPane.input?.matches(editor);
    if (inputMatches && !options3?.forceReload) {
      if (this.mapEditorPaneToPendingSetInput.has(editorPane)) {
        await this.mapEditorPaneToPendingSetInput.get(editorPane);
      }
      inputMatches = editorPane.input?.matches(editor);
      if (inputMatches) {
        editorPane.setOptions(options3);
      }
      return { changed: false, cancelled: !inputMatches };
    }
    const operation = this.editorOperation.start(this.layoutService.isRestored() ? 800 : 3200);
    let cancelled = false;
    try {
      editorPane.clearInput();
      const pendingSetInput = editorPane.setInput(editor, options3, context2, operation.token);
      this.mapEditorPaneToPendingSetInput.set(editorPane, pendingSetInput);
      await pendingSetInput;
      if (!operation.isCurrent()) {
        cancelled = true;
      }
    } catch (error) {
      if (!operation.isCurrent()) {
        cancelled = true;
      } else {
        throw error;
      }
    } finally {
      if (operation.isCurrent()) {
        this.mapEditorPaneToPendingSetInput.delete(editorPane);
      }
      operation.stop();
    }
    return { changed: !inputMatches, cancelled };
  }
  doHideActiveEditorPane() {
    if (!this._activeEditorPane) {
      return;
    }
    this.editorOperation.stop();
    this.safeRun(() => this._activeEditorPane?.clearInput());
    this.safeRun(() => this._activeEditorPane?.setVisible(false));
    this.mapEditorPaneToPendingSetInput.delete(this._activeEditorPane);
    const editorPaneContainer = this._activeEditorPane.getContainer();
    if (editorPaneContainer) {
      editorPaneContainer.remove();
      hide(editorPaneContainer);
    }
    this.doSetActiveEditorPane(null);
  }
  closeEditor(editor) {
    if (this._activeEditorPane?.input && editor.matches(this._activeEditorPane.input)) {
      this.doHideActiveEditorPane();
    }
  }
  setVisible(visible) {
    this.safeRun(() => this._activeEditorPane?.setVisible(visible));
  }
  layout(pagePosition) {
    this.pagePosition = pagePosition;
    this.safeRun(() => this._activeEditorPane?.layout(new Dimension(pagePosition.width, pagePosition.height), pagePosition));
  }
  setBoundarySashes(sashes) {
    this.boundarySashes = sashes;
    this.safeRun(() => this._activeEditorPane?.setBoundarySashes(sashes));
  }
  safeRun(fn) {
    try {
      fn();
    } catch (error) {
      this.logService.error(error);
    }
  }
};

EditorPanes = __decorateClass([
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IEditorProgressService),
  __decorateParam(6, IWorkspaceTrustManagementService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IHostService)
], EditorPanes);
export { EditorPanes };
