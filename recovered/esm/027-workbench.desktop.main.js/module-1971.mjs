// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/diffElementOutputs.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, addStandardDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { mimetypeIcon } from "./module-1870.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { SideBySideDiffElementViewModel } from "./module-1970.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/diffElementOutputs.ts
var OutputElement = class extends Disposable {
  constructor(_notebookEditor, _notebookTextModel, _notebookService, _quickInputService, _diffElementViewModel, _diffSide, _nestedCell, _outputContainer, output) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookTextModel = _notebookTextModel;
    this._notebookService = _notebookService;
    this._quickInputService = _quickInputService;
    this._diffElementViewModel = _diffElementViewModel;
    this._diffSide = _diffSide;
    this._nestedCell = _nestedCell;
    this._outputContainer = _outputContainer;
    this.output = output;
    this.resizeListener = this._register(new DisposableStore());
  }
  render(index2, beforeElement) {
    const outputItemDiv = document.createElement("div");
    let result = void 0;
    const [mimeTypes, pick] = this.output.resolveMimeTypes(this._notebookTextModel, void 0);
    const pickedMimeTypeRenderer = this.output.pickedMimeType || mimeTypes[pick];
    if (mimeTypes.length > 1) {
      outputItemDiv.style.position = "relative";
      const mimeTypePicker = $(".multi-mimetype-output");
      mimeTypePicker.classList.add(...ThemeIcon.asClassNameArray(mimetypeIcon));
      mimeTypePicker.tabIndex = 0;
      mimeTypePicker.title = localize(17643, null, mimeTypes.map((mimeType) => mimeType.mimeType).join(", "));
      outputItemDiv.appendChild(mimeTypePicker);
      this.resizeListener.add(addStandardDisposableListener(mimeTypePicker, "mousedown", async (e) => {
        if (e.leftButton) {
          e.preventDefault();
          e.stopPropagation();
          await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
        }
      }));
      this.resizeListener.add(addDisposableListener(mimeTypePicker, EventType.KEY_DOWN, async (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
          e.preventDefault();
          e.stopPropagation();
          await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
        }
      }));
    }
    const innerContainer = $(".output-inner-container");
    append(outputItemDiv, innerContainer);
    if (mimeTypes.length !== 0) {
      const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
      result = renderer ? { type: 1 /* Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType } : this._renderMissingRenderer(this.output, pickedMimeTypeRenderer.mimeType);
      this.output.pickedMimeType = pickedMimeTypeRenderer;
    }
    this.domNode = outputItemDiv;
    this.renderResult = result;
    if (!result) {
      return;
    }
    if (beforeElement) {
      this._outputContainer.insertBefore(outputItemDiv, beforeElement);
    } else {
      this._outputContainer.appendChild(outputItemDiv);
    }
    this._notebookEditor.createOutput(
      this._diffElementViewModel,
      this._nestedCell,
      result,
      () => this.getOutputOffsetInCell(index2),
      this._diffElementViewModel instanceof SideBySideDiffElementViewModel ? this._diffSide : this._diffElementViewModel.type === "insert" ? 1 /* Modified */ : 0 /* Original */
    );
  }
  _renderMissingRenderer(viewModel, preferredMimeType) {
    if (!viewModel.model.outputs.length) {
      return this._renderMessage(viewModel, localize(17642, null));
    }
    if (!preferredMimeType) {
      const mimeTypes = viewModel.model.outputs.map((op) => op.mime);
      const mimeTypesMessage = mimeTypes.join(", ");
      return this._renderMessage(viewModel, localize(17644, null, mimeTypesMessage));
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
  async pickActiveMimeTypeRenderer(notebookTextModel, viewModel) {
    const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, void 0);
    const items = mimeTypes.filter((mimeType) => mimeType.isTrusted).map((mimeType, index2) => ({
      label: mimeType.mimeType,
      id: mimeType.mimeType,
      index: index2,
      picked: index2 === currIndex,
      detail: this.generateRendererInfo(mimeType.rendererId),
      description: index2 === currIndex ? localize(17641, null) : void 0
    }));
    const disposables = new DisposableStore();
    const picker = disposables.add(this._quickInputService.createQuickPick());
    picker.items = items;
    picker.activeItems = items.filter((item) => !!item.picked);
    picker.placeholder = items.length !== mimeTypes.length ? localize(17646, null) : localize(17645, null);
    const pick = await new Promise((resolve3) => {
      disposables.add(picker.onDidAccept(() => {
        resolve3(picker.selectedItems.length === 1 ? picker.selectedItems[0].index : void 0);
        disposables.dispose();
      }));
      picker.show();
    });
    if (pick === void 0) {
      return;
    }
    if (pick !== currIndex) {
      const index2 = this._nestedCell.outputsViewModels.indexOf(viewModel);
      const nextElement = this.domNode.nextElementSibling;
      this.resizeListener.clear();
      const element = this.domNode;
      if (element) {
        element.remove();
        this._notebookEditor.removeInset(
          this._diffElementViewModel,
          this._nestedCell,
          viewModel,
          this._diffSide
        );
      }
      viewModel.pickedMimeType = mimeTypes[pick];
      this.render(index2, nextElement);
    }
  }
  generateRendererInfo(renderId) {
    const renderInfo = this._notebookService.getRendererInfo(renderId);
    if (renderInfo) {
      const displayName = renderInfo.displayName !== "" ? renderInfo.displayName : renderInfo.id;
      return `${displayName} (${renderInfo.extensionId.value})`;
    }
    return localize(17640, null);
  }
  getCellOutputCurrentIndex() {
    return this._diffElementViewModel.getNestedCellViewModel(this._diffSide).outputs.indexOf(this.output.model);
  }
  updateHeight(index2, height) {
    this._diffElementViewModel.updateOutputHeight(this._diffSide, index2, height);
  }
  getOutputOffsetInContainer(index2) {
    return this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index2);
  }
  getOutputOffsetInCell(index2) {
    return this._diffElementViewModel.getOutputOffsetInCell(this._diffSide, index2);
  }
};

var OutputContainer = class extends Disposable {
  constructor(_editor, _notebookTextModel, _diffElementViewModel, _nestedCellViewModel, _diffSide, _outputContainer, _notebookService, _quickInputService) {
    super();
    this._editor = _editor;
    this._notebookTextModel = _notebookTextModel;
    this._diffElementViewModel = _diffElementViewModel;
    this._nestedCellViewModel = _nestedCellViewModel;
    this._diffSide = _diffSide;
    this._outputContainer = _outputContainer;
    this._notebookService = _notebookService;
    this._quickInputService = _quickInputService;
    this._outputEntries = /* @__PURE__ */ new Map();
    this._register(this._diffElementViewModel.onDidLayoutChange(() => {
      this._outputEntries.forEach((value2, key3) => {
        const index2 = _nestedCellViewModel.outputs.indexOf(key3.model);
        if (index2 >= 0) {
          const top2 = this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index2);
          value2.domNode.style.top = `${top2}px`;
        }
      });
    }));
    this._register(this._nestedCellViewModel.textModel.onDidChangeOutputs((splice3) => {
      this._updateOutputs(splice3);
    }));
  }
  _updateOutputs(splice3) {
    const removedKeys = [];
    this._outputEntries.forEach((value2, key3) => {
      if (this._nestedCellViewModel.outputsViewModels.indexOf(key3) < 0) {
        removedKeys.push(key3);
        value2.domNode.remove();
        this._editor.removeInset(this._diffElementViewModel, this._nestedCellViewModel, key3, this._diffSide);
      }
    });
    removedKeys.forEach((key3) => {
      this._outputEntries.get(key3)?.dispose();
      this._outputEntries.delete(key3);
    });
    let prevElement = void 0;
    const outputsToRender = this._nestedCellViewModel.outputsViewModels;
    outputsToRender.reverse().forEach((output) => {
      if (this._outputEntries.has(output)) {
        prevElement = this._outputEntries.get(output).domNode;
        return;
      }
      const currIndex = this._nestedCellViewModel.outputsViewModels.indexOf(output);
      this._renderOutput(output, currIndex, prevElement);
      prevElement = this._outputEntries.get(output)?.domNode;
    });
  }
  render() {
    for (let index2 = 0; index2 < this._nestedCellViewModel.outputsViewModels.length; index2++) {
      const currOutput = this._nestedCellViewModel.outputsViewModels[index2];
      this._renderOutput(currOutput, index2, void 0);
    }
  }
  showOutputs() {
    for (let index2 = 0; index2 < this._nestedCellViewModel.outputsViewModels.length; index2++) {
      const currOutput = this._nestedCellViewModel.outputsViewModels[index2];
      this._editor.showInset(this._diffElementViewModel, currOutput.cellViewModel, currOutput, this._diffSide);
    }
  }
  hideOutputs() {
    this._outputEntries.forEach((outputElement, cellOutputViewModel) => {
      this._editor.hideInset(this._diffElementViewModel, this._nestedCellViewModel, cellOutputViewModel);
    });
  }
  _renderOutput(currOutput, index2, beforeElement) {
    if (!this._outputEntries.has(currOutput)) {
      this._outputEntries.set(currOutput, new OutputElement(this._editor, this._notebookTextModel, this._notebookService, this._quickInputService, this._diffElementViewModel, this._diffSide, this._nestedCellViewModel, this._outputContainer, currOutput));
    }
    const renderElement = this._outputEntries.get(currOutput);
    renderElement.render(index2, beforeElement);
  }
};

OutputContainer = __decorateClass([
  __decorateParam(6, INotebookService),
  __decorateParam(7, IQuickInputService)
], OutputContainer);
export { OutputElement, OutputContainer };
