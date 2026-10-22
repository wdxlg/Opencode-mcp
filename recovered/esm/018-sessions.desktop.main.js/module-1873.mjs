// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellPart.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { modify } from "./module-0075.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellPart.ts
var CellContentPart = class extends Disposable {
  constructor() {
    super();
    this.cellDisposables = this._register(new DisposableStore());
  }
  /**
   * Prepare model for cell part rendering
   * No DOM operations recommended within this operation
   */
  prepareRenderCell(element) {
  }
  /**
   * Update the DOM for the cell `element`
   */
  renderCell(element) {
    this.currentCell = element;
    safeInvokeNoArg2(() => this.didRenderCell(element));
  }
  didRenderCell(element) {
  }
  /**
   * Dispose any disposables generated from `didRenderCell`
   */
  unrenderCell(element) {
    this.currentCell = void 0;
    this.cellDisposables.clear();
  }
  /**
   * Perform DOM read operations to prepare for the list/cell layout update.
   */
  prepareLayout() {
  }
  /**
   * Update internal DOM (top positions) per cell layout info change
   * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
   * the list view will ensure that layout call is invoked in the right frame
   */
  updateInternalLayoutNow(element) {
  }
  /**
   * Update per cell state change
   */
  updateState(element, e4) {
  }
  /**
   * Update per execution state change.
   */
  updateForExecutionState(element, e4) {
  }
};

var CellOverlayPart = class extends Disposable {
  constructor() {
    super();
    this.cellDisposables = this._register(new DisposableStore());
  }
  /**
   * Prepare model for cell part rendering
   * No DOM operations recommended within this operation
   */
  prepareRenderCell(element) {
  }
  /**
   * Update the DOM for the cell `element`
   */
  renderCell(element) {
    this.currentCell = element;
    this.didRenderCell(element);
  }
  didRenderCell(element) {
  }
  /**
   * Dispose any disposables generated from `didRenderCell`
   */
  unrenderCell(element) {
    this.currentCell = void 0;
    this.cellDisposables.clear();
  }
  /**
   * Update internal DOM (top positions) per cell layout info change
   * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
   * the list view will ensure that layout call is invoked in the right frame
   */
  updateInternalLayoutNow(element) {
  }
  /**
   * Update per cell state change
   */
  updateState(element, e4) {
  }
  /**
   * Update per execution state change.
   */
  updateForExecutionState(element, e4) {
  }
};

function safeInvokeNoArg2(func) {
  try {
    return func();
  } catch (e4) {
    onUnexpectedError(e4);
    return null;
  }
}

var CellPartsCollection = class _CellPartsCollection extends Disposable {
  constructor(targetWindow, contentParts, overlayParts) {
    super();
    this.targetWindow = targetWindow;
    this.contentParts = contentParts;
    this.overlayParts = overlayParts;
    this._scheduledOverlayRendering = this._register(new MutableDisposable());
    this._scheduledOverlayUpdateState = this._register(new MutableDisposable());
    this._scheduledOverlayUpdateExecutionState = this._register(new MutableDisposable());
  }
  concatContentPart(other, targetWindow) {
    return new _CellPartsCollection(targetWindow, this.contentParts.concat(other), this.overlayParts);
  }
  concatOverlayPart(other, targetWindow) {
    return new _CellPartsCollection(targetWindow, this.contentParts, this.overlayParts.concat(other));
  }
  scheduleRenderCell(element) {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.prepareRenderCell(element));
    }
    for (const part of this.overlayParts) {
      safeInvokeNoArg2(() => part.prepareRenderCell(element));
    }
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.renderCell(element));
    }
    this._scheduledOverlayRendering.value = modify(this.targetWindow, () => {
      for (const part of this.overlayParts) {
        safeInvokeNoArg2(() => part.renderCell(element));
      }
    });
  }
  unrenderCell(element) {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.unrenderCell(element));
    }
    this._scheduledOverlayRendering.value = void 0;
    this._scheduledOverlayUpdateState.value = void 0;
    this._scheduledOverlayUpdateExecutionState.value = void 0;
    for (const part of this.overlayParts) {
      safeInvokeNoArg2(() => part.unrenderCell(element));
    }
  }
  updateInternalLayoutNow(viewCell) {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.updateInternalLayoutNow(viewCell));
    }
    for (const part of this.overlayParts) {
      safeInvokeNoArg2(() => part.updateInternalLayoutNow(viewCell));
    }
  }
  prepareLayout() {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.prepareLayout());
    }
  }
  updateState(viewCell, e4) {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.updateState(viewCell, e4));
    }
    this._scheduledOverlayUpdateState.value = modify(this.targetWindow, () => {
      for (const part of this.overlayParts) {
        safeInvokeNoArg2(() => part.updateState(viewCell, e4));
      }
    });
  }
  updateForExecutionState(viewCell, e4) {
    for (const part of this.contentParts) {
      safeInvokeNoArg2(() => part.updateForExecutionState(viewCell, e4));
    }
    this._scheduledOverlayUpdateExecutionState.value = modify(this.targetWindow, () => {
      for (const part of this.overlayParts) {
        safeInvokeNoArg2(() => part.updateForExecutionState(viewCell, e4));
      }
    });
  }
};
export { safeInvokeNoArg2, CellContentPart, CellOverlayPart, CellPartsCollection };
