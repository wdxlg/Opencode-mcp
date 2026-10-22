// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookDeletedCellDecorator.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { overviewRulerDeletedForeground } from "./module-1079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { $, append } from "./module-0075.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { splitLines } from "./module-0030.mjs";
import { DefaultLineHeight } from "./module-1970.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookDeletedCellDecorator.ts
var ttPolicy6 = createTrustedTypesPolicy("notebookRenderer", { createHTML: (value2) => value2 });

var NotebookDeletedCellDecorator = class extends Disposable {
  constructor(_notebookEditor, toolbar, languageService, instantiationService) {
    super();
    this._notebookEditor = _notebookEditor;
    this.toolbar = toolbar;
    this.languageService = languageService;
    this.instantiationService = instantiationService;
    this.zoneRemover = this._register(new DisposableStore());
    this.createdViewZones = /* @__PURE__ */ new Map();
    this.deletedCellInfos = /* @__PURE__ */ new Map();
  }
  getTop(deletedIndex) {
    const info = this.deletedCellInfos.get(deletedIndex);
    if (!info) {
      return;
    }
    if (info.previousIndex === -1) {
      return 0;
    }
    const cells = this._notebookEditor.getCellsInRange({ start: info.previousIndex, end: info.previousIndex + 1 });
    if (!cells.length) {
      return this._notebookEditor.getLayoutInfo().height + info.offset;
    }
    const cell = cells[0];
    const cellHeight = this._notebookEditor.getHeightOfElement(cell);
    const top2 = this._notebookEditor.getAbsoluteTopOfElement(cell);
    return top2 + cellHeight + info.offset;
  }
  reveal(deletedIndex) {
    const top2 = this.getTop(deletedIndex);
    if (typeof top2 === "number") {
      this._notebookEditor.focusContainer();
      this._notebookEditor.revealOffsetInCenterIfOutsideViewport(top2);
      const info = this.deletedCellInfos.get(deletedIndex);
      if (info) {
        const prevIndex = info.previousIndex === -1 ? 0 : info.previousIndex;
        this._notebookEditor.setFocus({ start: prevIndex, end: prevIndex });
        this._notebookEditor.setSelections([{ start: prevIndex, end: prevIndex }]);
      }
    }
  }
  apply(diffInfo, original) {
    this.clear();
    let currentIndex = -1;
    const deletedCellsToRender = { cells: [], index: 0 };
    diffInfo.forEach((diff4) => {
      if (diff4.type === "delete") {
        const deletedCell = original.cells[diff4.originalCellIndex];
        if (deletedCell) {
          deletedCellsToRender.cells.push({ cell: deletedCell, originalIndex: diff4.originalCellIndex, previousIndex: currentIndex });
          deletedCellsToRender.index = currentIndex;
        }
      } else {
        if (deletedCellsToRender.cells.length) {
          this._createWidget(deletedCellsToRender.index + 1, deletedCellsToRender.cells);
          deletedCellsToRender.cells.length = 0;
        }
        currentIndex = diff4.modifiedCellIndex;
      }
    });
    if (deletedCellsToRender.cells.length) {
      this._createWidget(deletedCellsToRender.index + 1, deletedCellsToRender.cells);
    }
  }
  clear() {
    this.deletedCellInfos.clear();
    this.zoneRemover.clear();
  }
  _createWidget(index2, cells) {
    this._createWidgetImpl(index2, cells);
  }
  async _createWidgetImpl(index2, cells) {
    const rootContainer = document.createElement("div");
    const widgets2 = [];
    const heights = await Promise.all(cells.map(async (cell) => {
      const widget = new NotebookDeletedCellWidget(this._notebookEditor, this.toolbar, cell.cell.getValue(), cell.cell.language, rootContainer, cell.originalIndex, this.languageService, this.instantiationService);
      widgets2.push(widget);
      const height = await widget.render();
      this.deletedCellInfos.set(cell.originalIndex, { height, previousIndex: cell.previousIndex, offset: 0 });
      return height;
    }));
    Array.from(this.deletedCellInfos.keys()).sort((a, b) => a - b).forEach((originalIndex) => {
      const previousDeletedCell = this.deletedCellInfos.get(originalIndex - 1);
      if (previousDeletedCell) {
        const deletedCell = this.deletedCellInfos.get(originalIndex);
        if (deletedCell) {
          deletedCell.offset = previousDeletedCell.height + previousDeletedCell.offset;
        }
      }
    });
    const totalHeight = heights.reduce((prev, curr) => prev + curr, 0);
    this._notebookEditor.changeViewZones((accessor) => {
      const notebookViewZone = {
        afterModelPosition: index2,
        heightInPx: totalHeight + 4,
        domNode: rootContainer
      };
      const id2 = accessor.addZone(notebookViewZone);
      accessor.layoutZone(id2);
      this.createdViewZones.set(index2, id2);
      const deletedCellOverviewRulereDecorationIds = this._notebookEditor.deltaCellDecorations([], [{
        viewZoneId: id2,
        options: {
          overviewRuler: {
            color: overviewRulerDeletedForeground,
            position: 2 /* Center */
          }
        }
      }]);
      this.zoneRemover.add(toDisposable(() => {
        if (this.createdViewZones.get(index2) === id2) {
          this.createdViewZones.delete(index2);
        }
        if (!this._notebookEditor.isDisposed) {
          this._notebookEditor.changeViewZones((accessor2) => {
            accessor2.removeZone(id2);
            dispose(widgets2);
          });
          this._notebookEditor.deltaCellDecorations(deletedCellOverviewRulereDecorationIds, []);
        }
      }));
    });
  }
};

NotebookDeletedCellDecorator = __decorateClass([
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IInstantiationService)
], NotebookDeletedCellDecorator);

var NotebookDeletedCellWidget = class extends Disposable {
  // private readonly toolbar: HTMLElement;
  constructor(_notebookEditor, _toolbarOptions, code, language2, container3, _originalIndex, languageService, instantiationService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._toolbarOptions = _toolbarOptions;
    this.code = code;
    this.language = language2;
    this._originalIndex = _originalIndex;
    this.languageService = languageService;
    this.instantiationService = instantiationService;
    this.container = append(container3, document.createElement("div"));
    this._register(toDisposable(() => {
      container3.removeChild(this.container);
    }));
  }
  async render() {
    const code = this.code;
    const languageId = this.language;
    const codeHtml = await tokenizeToString(this.languageService, code, languageId);
    const fontInfo = this._notebookEditor.getBaseCellEditorOptions(languageId).value;
    const fontFamilyVar = "--notebook-editor-font-family";
    const fontSizeVar = "--notebook-editor-font-size";
    const fontWeightVar = "--notebook-editor-font-weight";
    const editor = this._notebookEditor.codeEditors.map((c) => c[1]).find((c) => c);
    const layoutInfo = editor?.getOptions().get(165 /* layoutInfo */);
    const style = `font-family: var(${fontFamilyVar});font-weight: var(${fontWeightVar});font-size: var(${fontSizeVar});` + fontInfo.lineHeight ? `line-height: ${fontInfo.lineHeight}px;` : "" + layoutInfo?.contentLeft ? `margin-left: ${layoutInfo}px;` : `white-space: pre;`;
    const rootContainer = this.container;
    rootContainer.classList.add("code-cell-row");
    if (this._toolbarOptions) {
      const toolbar = document.createElement("div");
      toolbar.className = this._toolbarOptions.className;
      rootContainer.appendChild(toolbar);
      const scopedInstaService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this._notebookEditor.scopedContextKeyService])));
      const toolbarWidget = scopedInstaService.createInstance(MenuWorkbenchToolBar, toolbar, this._toolbarOptions.menuId, {
        telemetrySource: this._toolbarOptions.telemetrySource,
        hiddenItemStrategy: -1 /* NoHide */,
        toolbarOptions: { primaryGroup: () => true },
        menuOptions: {
          renderShortTitle: true,
          arg: this._toolbarOptions.argFactory(this._originalIndex)
        },
        actionViewItemProvider: this._toolbarOptions.actionViewItemProvider
      });
      this._store.add(toolbarWidget);
      toolbar.style.position = "absolute";
      toolbar.style.right = "40px";
      toolbar.style.zIndex = "10";
      toolbar.classList.add("hover");
    }
    const container3 = append(rootContainer, $(".cell-inner-container"));
    container3.style.position = "relative";
    const focusIndicatorLeft = append(container3, $(".cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left"));
    const cellContainer = append(container3, $(".cell.code"));
    append(focusIndicatorLeft, $("div.execution-count-label"));
    const editorPart = append(cellContainer, $(".cell-editor-part"));
    let editorContainer = append(editorPart, $(".cell-editor-container"));
    editorContainer = append(editorContainer, $(".code", { style }));
    if (fontInfo.fontFamily) {
      editorContainer.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
    }
    if (fontInfo.fontSize) {
      editorContainer.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
    }
    if (fontInfo.fontWeight) {
      editorContainer.style.setProperty(fontWeightVar, fontInfo.fontWeight);
    }
    editorContainer.innerHTML = ttPolicy6?.createHTML(codeHtml) || codeHtml;
    const lineCount = splitLines(code).length;
    const height = lineCount * (fontInfo.lineHeight || DefaultLineHeight) + 12 + 12;
    const totalHeight = height + 16 + 16;
    return totalHeight;
  }
};

NotebookDeletedCellWidget = __decorateClass([
  __decorateParam(6, ILanguageService),
  __decorateParam(7, IInstantiationService)
], NotebookDeletedCellWidget);
export { ttPolicy6, NotebookDeletedCellDecorator, NotebookDeletedCellWidget };
