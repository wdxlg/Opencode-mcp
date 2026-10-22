// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewParts/notebookCellOverlays.ts
import { Disposable } from "./module-0012.mjs";
import { createFastDomNode } from "./module-0212.mjs";


// src/vs/workbench/contrib/notebook/browser/viewParts/notebookCellOverlays.ts
var NotebookCellOverlays = class extends Disposable {
  constructor(listView) {
    super();
    this.listView = listView;
    this._lastOverlayId = 0;
    this._overlays = /* @__PURE__ */ Object.create(null);
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName("cell-overlays");
    this.domNode.setPosition("absolute");
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this.domNode.setWidth("100%");
    this.listView.containerDomNode.appendChild(this.domNode.domNode);
  }
  changeCellOverlays(callback) {
    let overlaysHaveChanged = false;
    const changeAccessor = {
      addOverlay: (overlay) => {
        overlaysHaveChanged = true;
        return this._addOverlay(overlay);
      },
      removeOverlay: (id2) => {
        overlaysHaveChanged = true;
        this._removeOverlay(id2);
      },
      layoutOverlay: (id2) => {
        overlaysHaveChanged = true;
        this._layoutOverlay(id2);
      }
    };
    callback(changeAccessor);
    return overlaysHaveChanged;
  }
  onCellsChanged(e4) {
    this.layout();
  }
  onHiddenRangesChange() {
    this.layout();
  }
  layout() {
    for (const id2 in this._overlays) {
      this._layoutOverlay(id2);
    }
  }
  _addOverlay(overlay) {
    const overlayId = `${++this._lastOverlayId}`;
    const overlayWidget = {
      overlayId,
      overlay,
      domNode: createFastDomNode(overlay.domNode)
    };
    this._overlays[overlayId] = overlayWidget;
    overlayWidget.domNode.setClassName("cell-overlay");
    overlayWidget.domNode.setPosition("absolute");
    this.domNode.appendChild(overlayWidget.domNode);
    return overlayId;
  }
  _removeOverlay(id2) {
    const overlay = this._overlays[id2];
    if (overlay) {
      try {
        this.domNode.removeChild(overlay.domNode);
      } catch {
      }
      delete this._overlays[id2];
    }
  }
  _layoutOverlay(id2) {
    const overlay = this._overlays[id2];
    if (!overlay) {
      return;
    }
    const isInHiddenRanges = this._isInHiddenRanges(overlay);
    if (isInHiddenRanges) {
      overlay.domNode.setDisplay("none");
      return;
    }
    overlay.domNode.setDisplay("block");
    const index2 = this.listView.indexOf(overlay.overlay.cell);
    if (index2 === -1) {
      return;
    }
    const top2 = this.listView.elementTop(index2);
    overlay.domNode.setTop(top2);
  }
  _isInHiddenRanges(zone) {
    const index2 = this.listView.indexOf(zone.overlay.cell);
    if (index2 === -1) {
      return true;
    }
    return false;
  }
};
export { NotebookCellOverlays };
