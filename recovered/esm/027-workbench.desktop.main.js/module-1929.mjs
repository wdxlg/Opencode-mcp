// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, append, hide, show } from "./module-0075.mjs";
import { CellUri, RENDERER_NOT_AVAILABLE } from "./module-0909.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { TEXT_BASED_MIMETYPES } from "./module-1912.mjs";
import { isTextStreamMime } from "./module-0136.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { mimetypeIcon } from "./module-1870.mjs";
import { NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS, NOTEBOOK_CELL_IS_FIRST_OUTPUT, NOTEBOOK_CELL_OUTPUT_MIMETYPE } from "./module-1868.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { COPY_OUTPUT_COMMAND_ID } from "./module-1928.mjs";
import { JUPYTER_EXTENSION_ID } from "./module-0941.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CellContentPart } from "./module-1896.mjs";
import { observableValue } from "./module-0048.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellOutput.ts
var CellOutputElement = class extends Disposable {
  constructor(notebookEditor, viewCell, cellOutputContainer, outputContainer, output, notebookService, quickInputService, parentContextKeyService, menuService, extensionsWorkbenchService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.cellOutputContainer = cellOutputContainer;
    this.outputContainer = outputContainer;
    this.output = output;
    this.notebookService = notebookService;
    this.quickInputService = quickInputService;
    this.menuService = menuService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.instantiationService = instantiationService;
    this.toolbarDisposables = this._register(new DisposableStore());
    this.toolbarAttached = false;
    this._outputHeightTimer = null;
    this.contextKeyService = parentContextKeyService;
    this._register(this.output.model.onDidChangeData(() => {
      this.rerender();
    }));
    this._register(this.output.onDidResetRenderer(() => {
      this.rerender();
    }));
  }
  detach() {
    this.renderedOutputContainer?.remove();
    let count2 = 0;
    if (this.innerContainer) {
      for (let i2 = 0; i2 < this.innerContainer.childNodes.length; i2++) {
        if (this.innerContainer.childNodes[i2].className === "rendered-output") {
          count2++;
        }
        if (count2 > 1) {
          break;
        }
      }
      if (count2 === 0) {
        this.innerContainer.remove();
      }
    }
    this.notebookEditor.removeInset(this.output);
  }
  updateDOMTop(top2) {
    if (this.innerContainer) {
      this.innerContainer.style.top = `${top2}px`;
    }
  }
  rerender() {
    if (this.notebookEditor.hasModel() && this.innerContainer && this.renderResult && this.renderResult.type === 1 /* Extension */) {
      const [mimeTypes, pick] = this.output.resolveMimeTypes(this.notebookEditor.textModel, this.notebookEditor.activeKernel?.preloadProvides);
      const pickedMimeType = mimeTypes[pick];
      if (pickedMimeType.mimeType === this.renderResult.mimeType && pickedMimeType.rendererId === this.renderResult.renderer.id) {
        const index2 = this.viewCell.outputsViewModels.indexOf(this.output);
        this.notebookEditor.updateOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index2));
        return;
      }
    }
    if (!this.innerContainer) {
      const currOutputIndex = this.cellOutputContainer.renderedOutputEntries.findIndex((entry) => entry.element === this);
      const previousSibling = currOutputIndex > 0 && !!this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer?.parentElement ? this.cellOutputContainer.renderedOutputEntries[currOutputIndex - 1].element.innerContainer : void 0;
      this.render(previousSibling);
    } else {
      const nextElement = this.innerContainer.nextElementSibling;
      this.toolbarDisposables.clear();
      const element = this.innerContainer;
      if (element) {
        element.remove();
        this.notebookEditor.removeInset(this.output);
      }
      this.render(nextElement);
    }
    this._relayoutCell();
  }
  // insert after previousSibling
  _generateInnerOutputContainer(previousSibling, pickedMimeTypeRenderer) {
    this.innerContainer = $(".output-inner-container");
    if (previousSibling && previousSibling.nextElementSibling) {
      this.outputContainer.domNode.insertBefore(this.innerContainer, previousSibling.nextElementSibling);
    } else {
      this.outputContainer.domNode.appendChild(this.innerContainer);
    }
    this.innerContainer.setAttribute("output-mime-type", pickedMimeTypeRenderer.mimeType);
    return this.innerContainer;
  }
  render(previousSibling) {
    const index2 = this.viewCell.outputsViewModels.indexOf(this.output);
    if (this.viewCell.isOutputCollapsed || !this.notebookEditor.hasModel()) {
      this.cellOutputContainer.flagAsStale();
      return void 0;
    }
    const notebookUri = CellUri.parse(this.viewCell.uri)?.notebook;
    if (!notebookUri) {
      return void 0;
    }
    const notebookTextModel = this.notebookEditor.textModel;
    const [mimeTypes, pick] = this.output.resolveMimeTypes(notebookTextModel, this.notebookEditor.activeKernel?.preloadProvides);
    const currentMimeType = mimeTypes[pick];
    if (!mimeTypes.find((mimeType) => mimeType.isTrusted) || mimeTypes.length === 0) {
      this.viewCell.updateOutputHeight(index2, 0, "CellOutputElement#noMimeType");
      return void 0;
    }
    const selectedPresentation = mimeTypes[pick];
    let renderer = this.notebookService.getRendererInfo(selectedPresentation.rendererId);
    if (!renderer && selectedPresentation.mimeType.indexOf("text/") > -1) {
      renderer = this.notebookService.getRendererInfo("vscode.builtin-renderer");
    }
    const innerContainer = this._generateInnerOutputContainer(previousSibling, selectedPresentation);
    if (index2 === 0 || this.output.visible.get()) {
      this._attachToolbar(innerContainer, notebookTextModel, this.notebookEditor.activeKernel, index2, currentMimeType, mimeTypes);
    } else {
      this._register(autorun((reader) => {
        const visible = reader.readObservable(this.output.visible);
        if (visible && !this.toolbarAttached) {
          this._attachToolbar(innerContainer, notebookTextModel, this.notebookEditor.activeKernel, index2, currentMimeType, mimeTypes);
        } else if (!visible) {
          this.toolbarDisposables.clear();
        }
        this.cellOutputContainer.checkForHiddenOutputs();
      }));
      this.cellOutputContainer.hasHiddenOutputs.set(true, void 0);
    }
    this.renderedOutputContainer = append(innerContainer, $(".rendered-output"));
    this.renderResult = renderer ? { type: 1 /* Extension */, renderer, source: this.output, mimeType: selectedPresentation.mimeType } : this._renderMissingRenderer(this.output, selectedPresentation.mimeType);
    this.output.pickedMimeType = selectedPresentation;
    if (!this.renderResult) {
      this.viewCell.updateOutputHeight(index2, 0, "CellOutputElement#renderResultUndefined");
      return void 0;
    }
    this.notebookEditor.createOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index2), false);
    innerContainer.classList.add("background");
    return { initRenderIsSynchronous: false };
  }
  _renderMissingRenderer(viewModel, preferredMimeType) {
    if (!viewModel.model.outputs.length) {
      return this._renderMessage(viewModel, localize(17873, null));
    }
    if (!preferredMimeType) {
      const mimeTypes = viewModel.model.outputs.map((op) => op.mime);
      const mimeTypesMessage = mimeTypes.join(", ");
      return this._renderMessage(viewModel, localize(17875, null, mimeTypesMessage));
    }
    return this._renderSearchForMimetype(viewModel, preferredMimeType);
  }
  _renderSearchForMimetype(viewModel, mimeType) {
    const query = `@tag:notebookRenderer ${mimeType}`;
    const p = $("p", void 0, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
    const a = $("a", { href: `command:workbench.extensions.search?%22${query}%22`, class: "monaco-button monaco-text-button", tabindex: 0, role: "button", style: "padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;" }, `Search Marketplace`);
    return {
      type: 0 /* Html */,
      source: viewModel,
      htmlContent: p.outerHTML + a.outerHTML
    };
  }
  _renderMessage(viewModel, message) {
    const el = $("p", void 0, message);
    return { type: 0 /* Html */, source: viewModel, htmlContent: el.outerHTML };
  }
  shouldEnableCopy(mimeTypes) {
    if (!mimeTypes.find((mimeType) => TEXT_BASED_MIMETYPES.indexOf(mimeType.mimeType) || mimeType.mimeType.startsWith("image/"))) {
      return false;
    }
    if (isTextStreamMime(mimeTypes[0].mimeType)) {
      const cellViewModel = this.output.cellViewModel;
      const index2 = cellViewModel.outputsViewModels.indexOf(this.output);
      if (index2 > 0) {
        const previousOutput = cellViewModel.model.outputs[index2 - 1];
        return !isTextStreamMime(previousOutput.outputs[0].mime);
      }
    }
    return true;
  }
  async _attachToolbar(outputItemDiv, notebookTextModel, kernel, index2, currentMimeType, mimeTypes) {
    const hasMultipleMimeTypes = mimeTypes.filter((mimeType) => mimeType.isTrusted).length > 1;
    const isCopyEnabled = this.shouldEnableCopy(mimeTypes);
    if (index2 > 0 && !hasMultipleMimeTypes && !isCopyEnabled) {
      return;
    }
    if (!this.notebookEditor.hasModel()) {
      return;
    }
    outputItemDiv.style.position = "relative";
    const mimeTypePicker = $(".cell-output-toolbar");
    outputItemDiv.appendChild(mimeTypePicker);
    const toolbar = this.toolbarDisposables.add(this.instantiationService.createInstance(WorkbenchToolBar, mimeTypePicker, {
      renderDropdownAsChildElement: false
    }));
    toolbar.context = {
      ui: true,
      cell: this.output.cellViewModel,
      outputViewModel: this.output,
      notebookEditor: this.notebookEditor,
      $mid: 13 /* NotebookCellActionContext */
    };
    const pickAction = this.toolbarDisposables.add(new Action(
      "notebook.output.pickMimetype",
      localize(17876, null),
      ThemeIcon.asClassName(mimetypeIcon),
      void 0,
      async (_context) => this._pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, this.output)
    ));
    const menuContextKeyService = this.toolbarDisposables.add(this.contextKeyService.createScoped(outputItemDiv));
    const hasHiddenOutputs = NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS.bindTo(menuContextKeyService);
    const isFirstCellOutput = NOTEBOOK_CELL_IS_FIRST_OUTPUT.bindTo(menuContextKeyService);
    const cellOutputMimetype = NOTEBOOK_CELL_OUTPUT_MIMETYPE.bindTo(menuContextKeyService);
    isFirstCellOutput.set(index2 === 0);
    cellOutputMimetype.set(currentMimeType.mimeType);
    this.toolbarDisposables.add(autorun((r2) => {
      hasHiddenOutputs.set(this.cellOutputContainer.hasHiddenOutputs.read(r2));
    }));
    const menu = this.toolbarDisposables.add(this.menuService.createMenu(MenuId.NotebookOutputToolbar, menuContextKeyService));
    const updateMenuToolbar = () => {
      let { secondary } = getActionBarActions(menu.getActions({ shouldForwardArgs: true }), () => false);
      if (!isCopyEnabled) {
        secondary = secondary.filter((action) => action.id !== COPY_OUTPUT_COMMAND_ID);
      }
      if (hasMultipleMimeTypes) {
        secondary = [pickAction, ...secondary];
      }
      toolbar.setActions([], secondary);
    };
    updateMenuToolbar();
    this.toolbarDisposables.add(menu.onDidChange(updateMenuToolbar));
  }
  async _pickActiveMimeTypeRenderer(outputItemDiv, notebookTextModel, kernel, viewModel) {
    const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, kernel?.preloadProvides);
    const items = [];
    const unsupportedItems = [];
    mimeTypes.forEach((mimeType2, index2) => {
      if (mimeType2.isTrusted) {
        const arr = mimeType2.rendererId === RENDERER_NOT_AVAILABLE ? unsupportedItems : items;
        arr.push({
          label: mimeType2.mimeType,
          id: mimeType2.mimeType,
          index: index2,
          picked: index2 === currIndex,
          detail: this._generateRendererInfo(mimeType2.rendererId),
          description: index2 === currIndex ? localize(17872, null) : void 0
        });
      }
    });
    if (unsupportedItems.some((m) => JUPYTER_RENDERER_MIMETYPES.includes(m.id))) {
      unsupportedItems.push({
        label: localize(17874, null),
        id: "installRenderers",
        index: mimeTypes.length
      });
    }
    const disposables = new DisposableStore();
    const picker = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    picker.items = [
      ...items,
      { type: "separator" },
      ...unsupportedItems
    ];
    picker.activeItems = items.filter((item) => !!item.picked);
    picker.placeholder = items.length !== mimeTypes.length ? localize(17878, null) : localize(17877, null);
    const pick = await new Promise((resolve3) => {
      disposables.add(picker.onDidAccept(() => {
        resolve3(picker.selectedItems.length === 1 ? picker.selectedItems[0] : void 0);
        disposables.dispose();
      }));
      picker.show();
    });
    if (pick === void 0 || pick.index === currIndex) {
      return;
    }
    if (pick.id === "installRenderers") {
      this._showJupyterExtension();
      return;
    }
    const nextElement = outputItemDiv.nextElementSibling;
    this.toolbarDisposables.clear();
    const element = this.innerContainer;
    if (element) {
      element.remove();
      this.notebookEditor.removeInset(viewModel);
    }
    viewModel.pickedMimeType = mimeTypes[pick.index];
    this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
    const { mimeType, rendererId } = mimeTypes[pick.index];
    this.notebookService.updateMimePreferredRenderer(notebookTextModel.viewType, mimeType, rendererId, mimeTypes.map((m) => m.mimeType));
    this.render(nextElement);
    this._validateFinalOutputHeight(false);
    this._relayoutCell();
  }
  async _showJupyterExtension() {
    await this.extensionsWorkbenchService.openSearch(`@id:${JUPYTER_EXTENSION_ID}`);
  }
  _generateRendererInfo(renderId) {
    const renderInfo = this.notebookService.getRendererInfo(renderId);
    if (renderInfo) {
      const displayName = renderInfo.displayName !== "" ? renderInfo.displayName : renderInfo.id;
      return `${displayName} (${renderInfo.extensionId.value})`;
    }
    return localize(17879, null);
  }
  _validateFinalOutputHeight(synchronous) {
    if (this._outputHeightTimer !== null) {
      clearTimeout(this._outputHeightTimer);
    }
    if (synchronous) {
      this.viewCell.unlockOutputHeight();
    } else {
      this._outputHeightTimer = setTimeout(() => {
        this.viewCell.unlockOutputHeight();
      }, 1e3);
    }
  }
  _relayoutCell() {
    this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
  }
  dispose() {
    if (this._outputHeightTimer) {
      this.viewCell.unlockOutputHeight();
      clearTimeout(this._outputHeightTimer);
    }
    super.dispose();
  }
};

CellOutputElement = __decorateClass([
  __decorateParam(5, INotebookService),
  __decorateParam(6, IQuickInputService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IExtensionsWorkbenchService),
  __decorateParam(10, IInstantiationService)
], CellOutputElement);

var OutputEntryViewHandler = class {
  constructor(model, element) {
    this.model = model;
    this.element = element;
  }
};

var CellOutputContainer = class extends CellContentPart {
  constructor(notebookEditor, viewCell, templateData, options3, openerService, _notebookExecutionStateService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.viewCell = viewCell;
    this.templateData = templateData;
    this.options = options3;
    this.openerService = openerService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.instantiationService = instantiationService;
    this._outputEntries = [];
    this._hasStaleOutputs = false;
    this.hasHiddenOutputs = observableValue("hasHiddenOutputs", false);
    this._outputHeightTimer = null;
    this._register(viewCell.onDidStartExecution(() => {
      viewCell.updateOutputMinHeight(viewCell.layoutInfo.outputTotalHeight);
    }));
    this._register(viewCell.onDidStopExecution(() => {
      this._validateFinalOutputHeight(false);
    }));
    this._register(viewCell.onDidChangeOutputs((splice3) => {
      const executionState = this._notebookExecutionStateService.getCellExecution(viewCell.uri);
      const context2 = executionState ? 1 /* Execution */ : 2 /* Other */;
      this._updateOutputs(splice3, context2);
    }));
    this._register(viewCell.onDidChangeLayout(() => {
      this.updateInternalLayoutNow(viewCell);
    }));
  }
  checkForHiddenOutputs() {
    if (this._outputEntries.find((entry) => {
      return !entry.model.visible.get();
    })) {
      this.hasHiddenOutputs.set(true, void 0);
    } else {
      this.hasHiddenOutputs.set(false, void 0);
    }
  }
  get renderedOutputEntries() {
    return this._outputEntries;
  }
  updateInternalLayoutNow(viewCell) {
    this.templateData.outputContainer.setTop(viewCell.layoutInfo.outputContainerOffset);
    this.templateData.outputShowMoreContainer.setTop(viewCell.layoutInfo.outputShowMoreContainerOffset);
    this._outputEntries.forEach((entry) => {
      const index2 = this.viewCell.outputsViewModels.indexOf(entry.model);
      if (index2 >= 0) {
        const top2 = this.viewCell.getOutputOffsetInContainer(index2);
        entry.element.updateDOMTop(top2);
      }
    });
  }
  render() {
    try {
      this._doRender();
    } finally {
      this._relayoutCell();
    }
  }
  /**
   * Notify that an output may have been swapped out without the model getting rendered.
   */
  flagAsStale() {
    this._hasStaleOutputs = true;
  }
  _doRender() {
    if (this.viewCell.outputsViewModels.length > 0) {
      if (this.viewCell.layoutInfo.outputTotalHeight !== 0) {
        this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
      }
      show(this.templateData.outputContainer.domNode);
      for (let index2 = 0; index2 < Math.min(this.options.limit, this.viewCell.outputsViewModels.length); index2++) {
        const currOutput = this.viewCell.outputsViewModels[index2];
        const entry = this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, currOutput);
        this._outputEntries.push(new OutputEntryViewHandler(currOutput, entry));
        entry.render(void 0);
      }
      if (this.viewCell.outputsViewModels.length > this.options.limit) {
        show(this.templateData.outputShowMoreContainer.domNode);
        this.viewCell.updateOutputShowMoreContainerHeight(46);
      }
      this._validateFinalOutputHeight(false);
    } else {
      hide(this.templateData.outputContainer.domNode);
    }
    this.templateData.outputShowMoreContainer.domNode.innerText = "";
    if (this.viewCell.outputsViewModels.length > this.options.limit) {
      this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
    } else {
      hide(this.templateData.outputShowMoreContainer.domNode);
      this.viewCell.updateOutputShowMoreContainerHeight(0);
    }
  }
  viewUpdateShowOutputs(initRendering) {
    if (this._hasStaleOutputs) {
      this._hasStaleOutputs = false;
      this._outputEntries.forEach((entry) => {
        entry.element.rerender();
      });
    }
    for (let index2 = 0; index2 < this._outputEntries.length; index2++) {
      const viewHandler = this._outputEntries[index2];
      const outputEntry = viewHandler.element;
      if (outputEntry.renderResult) {
        this.notebookEditor.createOutput(this.viewCell, outputEntry.renderResult, this.viewCell.getOutputOffset(index2), false);
      } else {
        outputEntry.render(void 0);
      }
    }
    this._relayoutCell();
  }
  viewUpdateHideOuputs() {
    for (let index2 = 0; index2 < this._outputEntries.length; index2++) {
      this.notebookEditor.hideInset(this._outputEntries[index2].model);
    }
  }
  _validateFinalOutputHeight(synchronous) {
    if (this._outputHeightTimer !== null) {
      clearTimeout(this._outputHeightTimer);
    }
    const executionState = this._notebookExecutionStateService.getCellExecution(this.viewCell.uri);
    if (synchronous) {
      this.viewCell.unlockOutputHeight();
    } else if (executionState?.state !== 3 /* Executing */) {
      this._outputHeightTimer = setTimeout(() => {
        this.viewCell.unlockOutputHeight();
      }, 200);
    }
  }
  _updateOutputs(splice3, context2 = 2 /* Other */) {
    const previousOutputHeight = this.viewCell.layoutInfo.outputTotalHeight;
    this.viewCell.updateOutputMinHeight(previousOutputHeight);
    if (this.viewCell.outputsViewModels.length) {
      show(this.templateData.outputContainer.domNode);
    } else {
      hide(this.templateData.outputContainer.domNode);
    }
    this.viewCell.spliceOutputHeights(splice3.start, splice3.deleteCount, splice3.newOutputs.map((_) => 0));
    this._renderNow(splice3, context2);
  }
  _renderNow(splice3, context2) {
    if (splice3.start >= this.options.limit) {
      return;
    }
    const firstGroupEntries = this._outputEntries.slice(0, splice3.start);
    const deletedEntries = this._outputEntries.slice(splice3.start, splice3.start + splice3.deleteCount);
    const secondGroupEntries = this._outputEntries.slice(splice3.start + splice3.deleteCount);
    let newlyInserted = this.viewCell.outputsViewModels.slice(splice3.start, splice3.start + splice3.newOutputs.length);
    if (firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length > this.options.limit) {
      if (firstGroupEntries.length + newlyInserted.length > this.options.limit) {
        [...deletedEntries, ...secondGroupEntries].forEach((entry) => {
          entry.element.detach();
          entry.element.dispose();
        });
        newlyInserted = newlyInserted.slice(0, this.options.limit - firstGroupEntries.length);
        const newlyInsertedEntries = newlyInserted.map((insert2) => {
          return new OutputEntryViewHandler(insert2, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert2));
        });
        this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries];
        for (let i2 = firstGroupEntries.length; i2 < this._outputEntries.length; i2++) {
          this._outputEntries[i2].element.render(void 0);
        }
      } else {
        const elementsPushedOutOfView = secondGroupEntries.slice(this.options.limit - firstGroupEntries.length - newlyInserted.length);
        [...deletedEntries, ...elementsPushedOutOfView].forEach((entry) => {
          entry.element.detach();
          entry.element.dispose();
        });
        const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
        const newlyInsertedEntries = newlyInserted.map((insert2) => {
          return new OutputEntryViewHandler(insert2, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert2));
        });
        this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries.slice(0, this.options.limit - firstGroupEntries.length - newlyInserted.length)];
        for (let i2 = firstGroupEntries.length; i2 < reRenderRightBoundary; i2++) {
          const previousSibling = i2 - 1 >= 0 && this._outputEntries[i2 - 1] && !!this._outputEntries[i2 - 1].element.innerContainer?.parentElement ? this._outputEntries[i2 - 1].element.innerContainer : void 0;
          this._outputEntries[i2].element.render(previousSibling);
        }
      }
    } else {
      deletedEntries.forEach((entry) => {
        entry.element.detach();
        entry.element.dispose();
      });
      const reRenderRightBoundary = firstGroupEntries.length + newlyInserted.length;
      const newlyInsertedEntries = newlyInserted.map((insert2) => {
        return new OutputEntryViewHandler(insert2, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, insert2));
      });
      let outputsNewlyAvailable = [];
      if (firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length < this.viewCell.outputsViewModels.length) {
        const last = Math.min(this.options.limit, this.viewCell.outputsViewModels.length);
        outputsNewlyAvailable = this.viewCell.outputsViewModels.slice(firstGroupEntries.length + newlyInsertedEntries.length + secondGroupEntries.length, last).map((output) => {
          return new OutputEntryViewHandler(output, this.instantiationService.createInstance(CellOutputElement, this.notebookEditor, this.viewCell, this, this.templateData.outputContainer, output));
        });
      }
      this._outputEntries = [...firstGroupEntries, ...newlyInsertedEntries, ...secondGroupEntries, ...outputsNewlyAvailable];
      for (let i2 = firstGroupEntries.length; i2 < reRenderRightBoundary; i2++) {
        const previousSibling = i2 - 1 >= 0 && this._outputEntries[i2 - 1] && !!this._outputEntries[i2 - 1].element.innerContainer?.parentElement ? this._outputEntries[i2 - 1].element.innerContainer : void 0;
        this._outputEntries[i2].element.render(previousSibling);
      }
      for (let i2 = 0; i2 < outputsNewlyAvailable.length; i2++) {
        this._outputEntries[firstGroupEntries.length + newlyInserted.length + secondGroupEntries.length + i2].element.render(void 0);
      }
    }
    if (this.viewCell.outputsViewModels.length > this.options.limit) {
      show(this.templateData.outputShowMoreContainer.domNode);
      if (!this.templateData.outputShowMoreContainer.domNode.hasChildNodes()) {
        this.templateData.outputShowMoreContainer.domNode.appendChild(this._generateShowMoreElement(this.templateData.templateDisposables));
      }
      this.viewCell.updateOutputShowMoreContainerHeight(46);
    } else {
      hide(this.templateData.outputShowMoreContainer.domNode);
    }
    this._relayoutCell();
    this._validateFinalOutputHeight(context2 === 2 /* Other */ && this.viewCell.outputsViewModels.length === 0);
  }
  _generateShowMoreElement(disposables) {
    const md = {
      value: `There are more than ${this.options.limit} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
      isTrusted: true,
      supportThemeIcons: true
    };
    const rendered = disposables.add(renderMarkdown(md, {
      actionHandler: (content2) => {
        if (content2 === "command:workbench.action.openLargeOutput") {
          this.openerService.open(CellUri.generateCellOutputUriWithId(this.notebookEditor.textModel.uri));
        }
      }
    }));
    rendered.element.classList.add("output-show-more");
    return rendered.element;
  }
  _relayoutCell() {
    this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
  }
  dispose() {
    this.viewCell.updateOutputMinHeight(0);
    if (this._outputHeightTimer) {
      clearTimeout(this._outputHeightTimer);
    }
    this._outputEntries.forEach((entry) => {
      entry.element.dispose();
    });
    super.dispose();
  }
};

CellOutputContainer = __decorateClass([
  __decorateParam(4, IOpenerService),
  __decorateParam(5, INotebookExecutionStateService),
  __decorateParam(6, IInstantiationService)
], CellOutputContainer);

var JUPYTER_RENDERER_MIMETYPES = [
  "application/geo+json",
  "application/vdom.v1+json",
  "application/vnd.dataresource+json",
  "application/vnd.plotly.v1+json",
  "application/vnd.vega.v2+json",
  "application/vnd.vega.v3+json",
  "application/vnd.vega.v4+json",
  "application/vnd.vega.v5+json",
  "application/vnd.vegalite.v1+json",
  "application/vnd.vegalite.v2+json",
  "application/vnd.vegalite.v3+json",
  "application/vnd.vegalite.v4+json",
  "application/x-nteract-model-debug+json",
  "image/svg+xml",
  "text/latex",
  "text/vnd.plotly.v1+html",
  "application/vnd.jupyter.widget-view+json",
  "application/vnd.code.notebook.error"
];
export { CellOutputElement, OutputEntryViewHandler, CellOutputContainer, JUPYTER_RENDERER_MIMETYPES };
