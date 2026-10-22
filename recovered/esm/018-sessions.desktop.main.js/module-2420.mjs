// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { n } from "./module-0075.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { IEditorService } from "./module-0935.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { INotebookService } from "./module-0927.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout.ts
var TroubleshootController = class extends Disposable {
  constructor(_notebookEditor) {
    super();
    this._notebookEditor = _notebookEditor;
    this._localStore = this._register(new DisposableStore());
    this._cellDisposables = [];
    this._enabled = false;
    this._cellStatusItems = [];
    this._register(this._notebookEditor.onDidChangeModel(() => {
      this._update();
    }));
    this._update();
  }
  static {
    this.id = "workbench.notebook.troubleshoot";
  }
  toggle() {
    this._enabled = !this._enabled;
    this._update();
  }
  _update() {
    this._localStore.clear();
    this._cellDisposables.forEach((d) => d.dispose());
    this._cellDisposables = [];
    this._removeNotebookOverlay();
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    if (this._enabled) {
      this._updateListener();
      this._createNotebookOverlay();
      this._createCellOverlays();
    }
  }
  _log(cell, e4) {
    if (this._enabled) {
      const oldHeight = this._notebookEditor.getViewHeight(cell);
      console.log(`cell#${cell.handle}`, e4, `${oldHeight} -> ${cell.layoutInfo.totalHeight}`);
    }
  }
  _createCellOverlays() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    for (let i2 = 0; i2 < this._notebookEditor.getLength(); i2++) {
      const cell = this._notebookEditor.cellAt(i2);
      this._createCellOverlay(cell, i2);
    }
    this._localStore.add(this._notebookEditor.onDidChangeViewCells((e4) => {
      const addedCells = e4.splices.reduce((acc, [, , newCells]) => [...acc, ...newCells], []);
      for (let i2 = 0; i2 < addedCells.length; i2++) {
        const cellIndex = this._notebookEditor.getCellIndex(addedCells[i2]);
        if (cellIndex !== void 0) {
          this._createCellOverlay(addedCells[i2], cellIndex);
        }
      }
    }));
  }
  _createNotebookOverlay() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const listViewTop = this._notebookEditor.getLayoutInfo().listViewOffsetTop;
    const scrollTop = this._notebookEditor.scrollTop;
    const overlay = n.div({
      style: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "1000"
      }
    }, [
      // Top line
      n.div({
        style: {
          position: "absolute",
          top: `${listViewTop}px`,
          left: "0",
          width: "100%",
          height: "2px",
          backgroundColor: "rgba(0, 0, 255, 0.7)"
        }
      }),
      // Text label for the notebook overlay
      n.div({
        style: {
          position: "absolute",
          top: `${listViewTop}px`,
          left: "10px",
          backgroundColor: "rgba(0, 0, 255, 0.7)",
          color: "white",
          fontSize: "11px",
          fontWeight: "bold",
          padding: "2px 6px",
          borderRadius: "3px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: "1001"
        }
      }, [`ScrollTop: ${scrollTop}px`])
    ]).keepUpdated(this._store);
    this._notebookOverlayDomNode = overlay.element;
    if (this._notebookOverlayDomNode) {
      this._notebookEditor.getDomNode().appendChild(this._notebookOverlayDomNode);
    }
    this._localStore.add(this._notebookEditor.onDidScroll(() => {
      const scrollTop2 = this._notebookEditor.scrollTop;
      const listViewTop2 = this._notebookEditor.getLayoutInfo().listViewOffsetTop;
      if (this._notebookOverlayDomNode) {
        const labelElement = this._notebookOverlayDomNode.querySelector("div:nth-child(2)");
        if (labelElement) {
          labelElement.textContent = `ScrollTop: ${scrollTop2}px`;
          labelElement.style.top = `${listViewTop2}px`;
        }
        const topLineElement = this._notebookOverlayDomNode.querySelector("div:first-child");
        if (topLineElement) {
          topLineElement.style.top = `${listViewTop2}px`;
        }
      }
    }));
  }
  _createCellOverlay(cell, index2) {
    const overlayContainer = document.createElement("div");
    overlayContainer.style.position = "absolute";
    overlayContainer.style.top = "0";
    overlayContainer.style.left = "0";
    overlayContainer.style.width = "100%";
    overlayContainer.style.height = "100%";
    overlayContainer.style.pointerEvents = "none";
    overlayContainer.style.zIndex = "1000";
    const topLine = document.createElement("div");
    topLine.style.position = "absolute";
    topLine.style.top = "0";
    topLine.style.left = "0";
    topLine.style.width = "100%";
    topLine.style.height = "2px";
    topLine.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
    overlayContainer.appendChild(topLine);
    const getLayoutInfo = () => {
      const eol = cell.textBuffer.getEOL() === "\n" ? "LF" : "CRLF";
      let scrollTop = "";
      if (cell.layoutInfo.layoutState > 0) {
        scrollTop = `| AbsoluteTopOfElement: ${this._notebookEditor.getAbsoluteTopOfElement(cell)}px`;
      }
      return `cell #${index2} (handle: ${cell.handle}) ${scrollTop} | EOL: ${eol}`;
    };
    const label3 = document.createElement("div");
    label3.textContent = getLayoutInfo();
    label3.style.position = "absolute";
    label3.style.top = "0px";
    label3.style.right = "10px";
    label3.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    label3.style.color = "white";
    label3.style.fontSize = "11px";
    label3.style.fontWeight = "bold";
    label3.style.padding = "2px 6px";
    label3.style.borderRadius = "3px";
    label3.style.whiteSpace = "nowrap";
    label3.style.pointerEvents = "none";
    label3.style.zIndex = "1001";
    overlayContainer.appendChild(label3);
    let overlayId = void 0;
    this._notebookEditor.changeCellOverlays((accessor) => {
      overlayId = accessor.addOverlay({
        cell,
        domNode: overlayContainer
      });
    });
    if (overlayId) {
      const updateLayout2 = () => {
        label3.textContent = getLayoutInfo();
        if (overlayId) {
          this._notebookEditor.changeCellOverlays((accessor) => {
            accessor.layoutOverlay(overlayId);
          });
        }
      };
      const disposables = this._cellDisposables[index2];
      disposables.add(cell.onDidChangeLayout((e4) => {
        updateLayout2();
      }));
      disposables.add(cell.textBuffer.onDidChangeContent(() => {
        updateLayout2();
      }));
      if (cell.textModel) {
        disposables.add(cell.textModel.onDidChangeContent(() => {
          updateLayout2();
        }));
      }
      disposables.add(this._notebookEditor.onDidChangeLayout(() => {
        updateLayout2();
      }));
      disposables.add(toDisposable(() => {
        this._notebookEditor.changeCellOverlays((accessor) => {
          if (overlayId) {
            accessor.removeOverlay(overlayId);
          }
        });
      }));
    }
  }
  _removeNotebookOverlay() {
    if (this._notebookOverlayDomNode) {
      this._notebookOverlayDomNode.remove();
      this._notebookOverlayDomNode = void 0;
    }
  }
  _updateListener() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    for (let i2 = 0; i2 < this._notebookEditor.getLength(); i2++) {
      const cell = this._notebookEditor.cellAt(i2);
      const disposableStore = new DisposableStore();
      this._cellDisposables.push(disposableStore);
      disposableStore.add(cell.onDidChangeLayout((e4) => {
        this._log(cell, e4);
      }));
    }
    this._localStore.add(this._notebookEditor.onDidChangeViewCells((e4) => {
      [...e4.splices].reverse().forEach((splice3) => {
        const [start, deleted, newCells] = splice3;
        const deletedCells = this._cellDisposables.splice(start, deleted, ...newCells.map((cell) => {
          const disposableStore = new DisposableStore();
          disposableStore.add(cell.onDidChangeLayout((e5) => {
            this._log(cell, e5);
          }));
          return disposableStore;
        }));
        dispose(deletedCells);
      });
      const addedCells = e4.splices.reduce((acc, [, , newCells]) => [...acc, ...newCells], []);
      for (let i2 = 0; i2 < addedCells.length; i2++) {
        const cellIndex = this._notebookEditor.getCellIndex(addedCells[i2]);
        if (cellIndex !== void 0) {
          this._createCellOverlay(addedCells[i2], cellIndex);
        }
      }
    }));
    const vm = this._notebookEditor.getViewModel();
    let items = [];
    if (this._enabled) {
      items = this._getItemsForCells();
    }
    this._cellStatusItems = vm.deltaCellStatusBarItems(this._cellStatusItems, items);
  }
  _getItemsForCells() {
    const items = [];
    for (let i2 = 0; i2 < this._notebookEditor.getLength(); i2++) {
      items.push({
        handle: i2,
        items: [
          {
            text: `index: ${i2}`,
            alignment: 1 /* Left */,
            priority: Number.MAX_SAFE_INTEGER
          }
        ]
      });
    }
    return items;
  }
  dispose() {
    dispose(this._cellDisposables);
    this._removeNotebookOverlay();
    this._localStore.clear();
    super.dispose();
  }
};

registerNotebookContribution(TroubleshootController.id, TroubleshootController);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.toggleLayoutTroubleshoot",
      title: localize2(17512, "Toggle Notebook Layout Troubleshoot"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
      return;
    }
    const controller = editor.getContribution(TroubleshootController.id);
    controller?.toggle();
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.inspectLayout",
      title: localize2(17511, "Inspect Notebook Layout"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor || !editor.hasModel()) {
      return;
    }
    for (let i2 = 0; i2 < editor.getLength(); i2++) {
      const cell = editor.cellAt(i2);
      console.log(`cell#${cell.handle}`, cell.layoutInfo);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "notebook.clearNotebookEdtitorTypeCache",
      title: localize2(17510, "Clear Notebook Editor Type Cache"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const notebookService = accessor.get(INotebookService);
    notebookService.clearEditorCache();
  }
});
export { TroubleshootController };
