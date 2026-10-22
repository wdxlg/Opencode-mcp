// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { EventType, addDisposableListener, clearNode, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { EventType2 } from "./module-0251.mjs";
import { FoldingController2 } from "./module-1937.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { foldingCollapsedIcon, foldingExpandedIcon } from "./module-0682.mjs";
import { Emitter } from "./module-0017.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { MenuId } from "./module-0092.mjs";
import { INotebookCellOutlineDataSourceFactory } from "./module-1956.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Delayer } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll.ts
var NotebookStickyLine = class _NotebookStickyLine extends Disposable {
  constructor(element, foldingIcon, header2, entry, notebookEditor) {
    super();
    this.element = element;
    this.foldingIcon = foldingIcon;
    this.header = header2;
    this.entry = entry;
    this.notebookEditor = notebookEditor;
    this._register(addDisposableListener(this.header, EventType.CLICK || EventType2.Tap, () => {
      this.focusCell();
    }));
    this._register(addDisposableListener(this.foldingIcon.domNode, EventType.CLICK || EventType2.Tap, () => {
      if (this.entry.cell.cellKind === 1 /* Markup */) {
        const currentFoldingState = this.entry.cell.foldingState;
        this.toggleFoldRange(currentFoldingState);
      }
    }));
  }
  toggleFoldRange(currentState) {
    const foldingController = this.notebookEditor.getContribution(FoldingController2.id);
    const index2 = this.entry.index;
    const headerLevel = this.entry.level;
    const newFoldingState = currentState === 2 /* Collapsed */ ? 1 /* Expanded */ : 2 /* Collapsed */;
    foldingController.setFoldingStateDown(index2, newFoldingState, headerLevel);
    this.focusCell();
  }
  focusCell() {
    this.notebookEditor.focusNotebookCell(this.entry.cell, "container");
    const cellScrollTop = this.notebookEditor.getAbsoluteTopOfElement(this.entry.cell);
    const parentCount = _NotebookStickyLine.getParentCount(this.entry);
    this.notebookEditor.setScrollTop(cellScrollTop - (parentCount + 1.1) * 22);
  }
  static getParentCount(entry) {
    let count2 = 0;
    while (entry.parent) {
      count2++;
      entry = entry.parent;
    }
    return count2;
  }
};

var StickyFoldingIcon2 = class {
  constructor(isCollapsed, dimension) {
    this.isCollapsed = isCollapsed;
    this.dimension = dimension;
    this.domNode = document.createElement("div");
    this.domNode.style.width = `${dimension}px`;
    this.domNode.style.height = `${dimension}px`;
    this.domNode.className = ThemeIcon.asClassName(isCollapsed ? foldingCollapsedIcon : foldingExpandedIcon);
  }
  setVisible(visible) {
    this.domNode.style.cursor = visible ? "pointer" : "default";
    this.domNode.style.opacity = visible ? "1" : "0";
  }
};

var NotebookStickyScroll = class extends Disposable {
  constructor(domNode, notebookEditor, notebookCellList, layoutFn, _contextMenuService, instantiationService) {
    super();
    this.domNode = domNode;
    this.notebookEditor = notebookEditor;
    this.notebookCellList = notebookCellList;
    this.layoutFn = layoutFn;
    this._contextMenuService = _contextMenuService;
    this.instantiationService = instantiationService;
    this._disposables = new DisposableStore();
    this.currentStickyLines = /* @__PURE__ */ new Map();
    this._onDidChangeNotebookStickyScroll = this._register(new Emitter());
    this.onDidChangeNotebookStickyScroll = this._onDidChangeNotebookStickyScroll.event;
    this._layoutDisposableStore = this._register(new DisposableStore());
    if (this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled) {
      this.init().catch(console.error);
    }
    this._register(this.notebookEditor.notebookOptions.onDidChangeOptions((e) => {
      if (e.stickyScrollEnabled || e.stickyScrollMode) {
        this.updateConfig(e);
      }
    }));
    this._register(addDisposableListener(this.domNode, EventType.CONTEXT_MENU, async (event) => {
      this.onContextMenu(event);
    }));
    this._register(addDisposableListener(this.domNode, EventType.WHEEL, (event) => {
      this.notebookCellList.triggerScrollFromMouseWheelEvent(event);
    }));
  }
  getDomNode() {
    return this.domNode;
  }
  getCurrentStickyHeight() {
    let height = 0;
    this.currentStickyLines.forEach((value2) => {
      if (value2.rendered) {
        height += 22;
      }
    });
    return height;
  }
  setCurrentStickyLines(newStickyLines) {
    this.currentStickyLines = newStickyLines;
  }
  compareStickyLineMaps(mapA, mapB) {
    if (mapA.size !== mapB.size) {
      return false;
    }
    for (const [key3, value2] of mapA) {
      const otherValue = mapB.get(key3);
      if (!otherValue || value2.rendered !== otherValue.rendered) {
        return false;
      }
    }
    return true;
  }
  onContextMenu(e) {
    const event = new StandardMouseEvent(getWindow(this.domNode), e);
    const selectedElement = event.target.parentElement;
    const selectedOutlineEntry = Array.from(this.currentStickyLines.values()).find((entry) => entry.line.element.contains(selectedElement))?.line.entry;
    if (!selectedOutlineEntry) {
      return;
    }
    const args2 = {
      outlineEntry: selectedOutlineEntry,
      notebookEditor: this.notebookEditor
    };
    this._contextMenuService.showContextMenu({
      menuId: MenuId.NotebookStickyScrollContext,
      getAnchor: () => event,
      menuActionOptions: { shouldForwardArgs: true, arg: args2, renderShortTitle: true }
    });
  }
  updateConfig(e) {
    if (e.stickyScrollEnabled) {
      if (this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled) {
        this.init().catch(console.error);
      } else {
        this._disposables.clear();
        this.notebookCellOutlineReference?.dispose();
        this.disposeCurrentStickyLines();
        clearNode(this.domNode);
        this.updateDisplay();
      }
    } else if (e.stickyScrollMode && this.notebookEditor.notebookOptions.getDisplayOptions().stickyScrollEnabled && this.notebookCellOutlineReference?.object) {
      this.updateContent(computeContent(this.notebookEditor, this.notebookCellList, this.notebookCellOutlineReference?.object?.entries, this.getCurrentStickyHeight()));
    }
  }
  async init() {
    const { object: notebookCellOutline } = this.notebookCellOutlineReference = this.instantiationService.invokeFunction((accessor) => accessor.get(INotebookCellOutlineDataSourceFactory).getOrCreate(this.notebookEditor));
    this._register(this.notebookCellOutlineReference);
    await notebookCellOutline.computeFullSymbols(CancellationToken.None);
    const computed = computeContent(this.notebookEditor, this.notebookCellList, notebookCellOutline.entries, this.getCurrentStickyHeight());
    this.updateContent(computed);
    this._disposables.add(notebookCellOutline.onDidChange(() => {
      const computed2 = computeContent(this.notebookEditor, this.notebookCellList, notebookCellOutline.entries, this.getCurrentStickyHeight());
      if (!this.compareStickyLineMaps(computed2, this.currentStickyLines)) {
        this.updateContent(computed2);
      } else {
        this.disposeStickyLineMap(computed2);
      }
    }));
    this._disposables.add(this.notebookEditor.onDidAttachViewModel(async () => {
      await notebookCellOutline.computeFullSymbols(CancellationToken.None);
      const computed2 = computeContent(this.notebookEditor, this.notebookCellList, notebookCellOutline.entries, this.getCurrentStickyHeight());
      this.updateContent(computed2);
    }));
    this._disposables.add(this.notebookEditor.onDidScroll(() => {
      const d = new Delayer(100);
      d.trigger(() => {
        d.dispose();
        const computed2 = computeContent(this.notebookEditor, this.notebookCellList, notebookCellOutline.entries, this.getCurrentStickyHeight());
        if (!this.compareStickyLineMaps(computed2, this.currentStickyLines)) {
          this.updateContent(computed2);
        } else {
          this.disposeStickyLineMap(computed2);
        }
      });
    }));
  }
  // Add helper method to dispose a map of sticky lines
  disposeStickyLineMap(map) {
    map.forEach((value2) => {
      if (value2.line) {
        value2.line.dispose();
      }
    });
  }
  // take in an cell index, and get the corresponding outline entry
  static getVisibleOutlineEntry(visibleIndex, notebookOutlineEntries) {
    let left = 0;
    let right = notebookOutlineEntries.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (notebookOutlineEntries[mid].index === visibleIndex) {
        const rootEntry = notebookOutlineEntries[mid];
        const flatList = [];
        rootEntry.asFlatList(flatList);
        return flatList.find((entry) => entry.index === visibleIndex);
      } else if (notebookOutlineEntries[mid].index < visibleIndex) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (right >= 0) {
      const rootEntry = notebookOutlineEntries[right];
      const flatList = [];
      rootEntry.asFlatList(flatList);
      return flatList.find((entry) => entry.index === visibleIndex);
    }
    return void 0;
  }
  updateContent(newMap) {
    clearNode(this.domNode);
    this.disposeCurrentStickyLines();
    this.renderStickyLines(newMap, this.domNode);
    const oldStickyHeight = this.getCurrentStickyHeight();
    this.setCurrentStickyLines(newMap);
    const sizeDelta = this.getCurrentStickyHeight() - oldStickyHeight;
    if (sizeDelta !== 0) {
      this._onDidChangeNotebookStickyScroll.fire(sizeDelta);
      const d = this._layoutDisposableStore.add(scheduleAtNextAnimationFrame(getWindow(this.getDomNode()), () => {
        this.layoutFn(sizeDelta);
        this.updateDisplay();
        this._layoutDisposableStore.delete(d);
      }));
    } else {
      this.updateDisplay();
    }
  }
  updateDisplay() {
    const hasSticky = this.getCurrentStickyHeight() > 0;
    if (!hasSticky) {
      this.domNode.style.display = "none";
    } else {
      this.domNode.style.display = "block";
    }
  }
  static computeStickyHeight(entry) {
    let height = 0;
    if (entry.cell.cellKind === 1 /* Markup */ && entry.level < 7) {
      height += 22;
    }
    while (entry.parent) {
      height += 22;
      entry = entry.parent;
    }
    return height;
  }
  static checkCollapsedStickyLines(entry, numLinesToRender, notebookEditor) {
    let currentEntry = entry;
    const newMap = /* @__PURE__ */ new Map();
    const elementsToRender = [];
    while (currentEntry) {
      if (currentEntry.level >= 7) {
        currentEntry = currentEntry.parent;
        continue;
      }
      const lineToRender = NotebookStickyScroll.createStickyElement(currentEntry, notebookEditor);
      newMap.set(currentEntry, { line: lineToRender, rendered: false });
      elementsToRender.unshift(lineToRender);
      currentEntry = currentEntry.parent;
    }
    for (let i2 = 0; i2 < elementsToRender.length; i2++) {
      if (i2 >= numLinesToRender) {
        break;
      }
      newMap.set(elementsToRender[i2].entry, { line: elementsToRender[i2], rendered: true });
    }
    return newMap;
  }
  renderStickyLines(stickyMap, containerElement) {
    const reversedEntries = Array.from(stickyMap.entries()).reverse();
    for (const [, value2] of reversedEntries) {
      if (!value2.rendered) {
        continue;
      }
      containerElement.append(value2.line.element);
    }
  }
  static createStickyElement(entry, notebookEditor) {
    const stickyElement = document.createElement("div");
    stickyElement.classList.add("notebook-sticky-scroll-element");
    const indentMode = notebookEditor.notebookOptions.getLayoutConfiguration().stickyScrollMode;
    if (indentMode === "indented") {
      stickyElement.style.paddingLeft = NotebookStickyLine.getParentCount(entry) * 10 + "px";
    }
    let isCollapsed = false;
    if (entry.cell.cellKind === 1 /* Markup */) {
      isCollapsed = entry.cell.foldingState === 2 /* Collapsed */;
    }
    const stickyFoldingIcon = new StickyFoldingIcon2(isCollapsed, 16);
    stickyFoldingIcon.domNode.classList.add("notebook-sticky-scroll-folding-icon");
    stickyFoldingIcon.setVisible(true);
    const stickyHeader = document.createElement("div");
    stickyHeader.classList.add("notebook-sticky-scroll-header");
    stickyHeader.innerText = entry.label;
    stickyElement.append(stickyFoldingIcon.domNode, stickyHeader);
    return new NotebookStickyLine(stickyElement, stickyFoldingIcon, stickyHeader, entry, notebookEditor);
  }
  disposeCurrentStickyLines() {
    this.currentStickyLines.forEach((value2) => {
      value2.line.dispose();
    });
  }
  dispose() {
    this._disposables.dispose();
    this.disposeCurrentStickyLines();
    this.notebookCellOutlineReference?.dispose();
    super.dispose();
  }
};

NotebookStickyScroll = __decorateClass([
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IInstantiationService)
], NotebookStickyScroll);

function computeContent(notebookEditor, notebookCellList, notebookOutlineEntries, renderedStickyHeight) {
  const editorScrollTop = notebookEditor.scrollTop - renderedStickyHeight;
  const visibleRange = notebookEditor.visibleRanges[0];
  if (!visibleRange) {
    return /* @__PURE__ */ new Map();
  }
  if (visibleRange.start === 0) {
    const firstCell = notebookEditor.cellAt(0);
    const firstCellEntry = NotebookStickyScroll.getVisibleOutlineEntry(0, notebookOutlineEntries);
    if (firstCell && firstCellEntry && firstCell.cellKind === 1 /* Markup */ && firstCellEntry.level < 7) {
      if (notebookEditor.scrollTop > 22) {
        const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(firstCellEntry, 100, notebookEditor);
        return newMap2;
      }
    }
  }
  let cell;
  let cellEntry;
  const startIndex = visibleRange.start - 1;
  for (let currentIndex = startIndex; currentIndex < visibleRange.end; currentIndex++) {
    cell = notebookEditor.cellAt(currentIndex);
    if (!cell) {
      return /* @__PURE__ */ new Map();
    }
    cellEntry = NotebookStickyScroll.getVisibleOutlineEntry(currentIndex, notebookOutlineEntries);
    if (!cellEntry) {
      continue;
    }
    const nextCell = notebookEditor.cellAt(currentIndex + 1);
    if (!nextCell) {
      const sectionBottom2 = notebookEditor.getLayoutInfo().scrollHeight;
      const linesToRender2 = Math.floor(sectionBottom2 / 22);
      const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender2, notebookEditor);
      return newMap2;
    }
    const nextCellEntry = NotebookStickyScroll.getVisibleOutlineEntry(currentIndex + 1, notebookOutlineEntries);
    if (!nextCellEntry) {
      continue;
    }
    if (nextCell.cellKind === 1 /* Markup */ && nextCellEntry.level < 7) {
      const sectionBottom2 = notebookCellList.getCellViewScrollTop(nextCell);
      const currentSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(cellEntry);
      const nextSectionStickyHeight = NotebookStickyScroll.computeStickyHeight(nextCellEntry);
      if (editorScrollTop + currentSectionStickyHeight < sectionBottom2) {
        const linesToRender2 = Math.floor((sectionBottom2 - editorScrollTop) / 22);
        const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender2, notebookEditor);
        return newMap2;
      } else if (nextSectionStickyHeight >= currentSectionStickyHeight) {
        const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(nextCellEntry, 100, notebookEditor);
        return newMap2;
      } else if (nextSectionStickyHeight < currentSectionStickyHeight) {
        const availableSpace = sectionBottom2 - editorScrollTop;
        if (availableSpace >= nextSectionStickyHeight) {
          const linesToRender2 = Math.floor(availableSpace / 22);
          const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender2, notebookEditor);
          return newMap2;
        } else {
          const newMap2 = NotebookStickyScroll.checkCollapsedStickyLines(nextCellEntry, 100, notebookEditor);
          return newMap2;
        }
      }
    }
  }
  const sectionBottom = notebookEditor.getLayoutInfo().scrollHeight;
  const linesToRender = Math.floor((sectionBottom - editorScrollTop) / 22);
  const newMap = NotebookStickyScroll.checkCollapsedStickyLines(cellEntry, linesToRender, notebookEditor);
  return newMap;
}
export { computeContent, NotebookStickyLine, StickyFoldingIcon2, NotebookStickyScroll };
