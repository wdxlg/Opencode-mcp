// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/dragScrolling.ts
import { Disposable } from "./module-0012.mjs";
import { getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { PageCoordinates, createCoordinatesRelativeToEditor, createEditorPagePosition } from "./module-0237.mjs";
import { MouseTarget } from "./module-0249.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/browser/controller/dragScrolling.ts
var DragScrolling = class extends Disposable {
  constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse) {
    super();
    this._context = _context;
    this._viewHelper = _viewHelper;
    this._mouseTargetFactory = _mouseTargetFactory;
    this._dispatchMouse = _dispatchMouse;
    this._operation = null;
  }
  dispose() {
    super.dispose();
    this.stop();
  }
  start(position2, mouseEvent) {
    if (this._operation) {
      this._operation.setPosition(position2, mouseEvent);
    } else {
      this._operation = this._createDragScrollingOperation(position2, mouseEvent);
    }
  }
  stop() {
    if (this._operation) {
      this._operation.dispose();
      this._operation = null;
    }
  }
};

var DragScrollingOperation = class extends Disposable {
  constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse, position2, mouseEvent) {
    super();
    this._context = _context;
    this._viewHelper = _viewHelper;
    this._mouseTargetFactory = _mouseTargetFactory;
    this._dispatchMouse = _dispatchMouse;
    this._position = position2;
    this._mouseEvent = mouseEvent;
    this._lastTime = Date.now();
    this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseEvent.browserEvent), () => this._execute());
  }
  dispose() {
    this._animationFrameDisposable.dispose();
    super.dispose();
  }
  setPosition(position2, mouseEvent) {
    this._position = position2;
    this._mouseEvent = mouseEvent;
  }
  /**
   * update internal state and return elapsed ms since last time
   */
  _tick() {
    const now = Date.now();
    const elapsed = now - this._lastTime;
    this._lastTime = now;
    return elapsed;
  }
};

var TopBottomDragScrolling = class extends DragScrolling {
  _createDragScrollingOperation(position2, mouseEvent) {
    return new TopBottomDragScrollingOperation(this._context, this._viewHelper, this._mouseTargetFactory, this._dispatchMouse, position2, mouseEvent);
  }
};

var TopBottomDragScrollingOperation = class extends DragScrollingOperation {
  /**
   * get the number of lines per second to auto-scroll
   */
  _getScrollSpeed() {
    const lineHeight = this._context.configuration.options.get(75 /* lineHeight */);
    const viewportInLines = this._context.configuration.options.get(165 /* layoutInfo */).height / lineHeight;
    const outsideDistanceInLines = this._position.outsideDistance / lineHeight;
    if (outsideDistanceInLines <= 1.5) {
      return Math.max(30, viewportInLines * (1 + outsideDistanceInLines));
    }
    if (outsideDistanceInLines <= 3) {
      return Math.max(60, viewportInLines * (2 + outsideDistanceInLines));
    }
    return Math.max(200, viewportInLines * (7 + outsideDistanceInLines));
  }
  _execute() {
    const lineHeight = this._context.configuration.options.get(75 /* lineHeight */);
    const scrollSpeedInLines = this._getScrollSpeed();
    const elapsed = this._tick();
    const scrollInPixels = scrollSpeedInLines * (elapsed / 1e3) * lineHeight;
    const scrollValue = this._position.outsidePosition === "above" ? -scrollInPixels : scrollInPixels;
    this._context.viewModel.viewLayout.deltaScrollNow(0, scrollValue);
    this._viewHelper.renderNow();
    const viewportData = this._context.viewLayout.getLinesViewportData();
    const edgeLineNumber = this._position.outsidePosition === "above" ? viewportData.startLineNumber : viewportData.endLineNumber;
    const cannotScrollAnymore = this._position.outsidePosition === "above" ? viewportData.startLineNumber === 1 : viewportData.endLineNumber === this._context.viewModel.getLineCount();
    let mouseTarget;
    {
      const editorPos = createEditorPagePosition(this._viewHelper.viewDomNode);
      const horizontalScrollbarHeight = this._context.configuration.options.get(165 /* layoutInfo */).horizontalScrollbarHeight;
      const pos = new PageCoordinates(this._mouseEvent.pos.x, editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1);
      const relativePos = createCoordinatesRelativeToEditor(this._viewHelper.viewDomNode, editorPos, pos);
      mouseTarget = this._mouseTargetFactory.createMouseTarget(this._viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
    }
    if (!mouseTarget.position || mouseTarget.position.lineNumber !== edgeLineNumber || cannotScrollAnymore) {
      if (this._position.outsidePosition === "above") {
        mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, new Position(edgeLineNumber, 1), "above", this._position.outsideDistance);
      } else {
        mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, new Position(edgeLineNumber, this._context.viewModel.getLineMaxColumn(edgeLineNumber)), "below", this._position.outsideDistance);
      }
    }
    this._dispatchMouse(mouseTarget, true, 2 /* None */);
    this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseTarget.element), () => this._execute());
  }
};

var LeftRightDragScrolling = class extends DragScrolling {
  _createDragScrollingOperation(position2, mouseEvent) {
    return new LeftRightDragScrollingOperation(this._context, this._viewHelper, this._mouseTargetFactory, this._dispatchMouse, position2, mouseEvent);
  }
};

var LeftRightDragScrollingOperation = class extends DragScrollingOperation {
  /**
   * get the number of cols per second to auto-scroll
   */
  _getScrollSpeed() {
    const charWidth = this._context.configuration.options.get(59 /* fontInfo */).typicalFullwidthCharacterWidth;
    const viewportInChars = this._context.configuration.options.get(165 /* layoutInfo */).contentWidth / charWidth;
    const outsideDistanceInChars = this._position.outsideDistance / charWidth;
    if (outsideDistanceInChars <= 1.5) {
      return Math.max(30, viewportInChars * (1 + outsideDistanceInChars));
    }
    if (outsideDistanceInChars <= 3) {
      return Math.max(60, viewportInChars * (2 + outsideDistanceInChars));
    }
    return Math.max(200, viewportInChars * (7 + outsideDistanceInChars));
  }
  _execute() {
    const charWidth = this._context.configuration.options.get(59 /* fontInfo */).typicalFullwidthCharacterWidth;
    const scrollSpeedInChars = this._getScrollSpeed();
    const elapsed = this._tick();
    const scrollInPixels = scrollSpeedInChars * (elapsed / 1e3) * charWidth * 0.5;
    const scrollValue = this._position.outsidePosition === "left" ? -scrollInPixels : scrollInPixels;
    this._context.viewModel.viewLayout.deltaScrollNow(scrollValue, 0);
    this._viewHelper.renderNow();
    if (!this._position.position) {
      return;
    }
    const edgeLineNumber = this._position.position.lineNumber;
    let mouseTarget;
    const isRtl = this._context.viewModel.getTextDirection(edgeLineNumber) === 1 /* RTL */;
    const exceedingPosition = isRtl ? "left" : "right";
    if (this._position.outsidePosition === exceedingPosition) {
      const lineWidth = this._context.viewModel.getLineMaxColumn(edgeLineNumber);
      mouseTarget = MouseTarget.createOutsideEditor(lineWidth, new Position(edgeLineNumber, lineWidth), "right", this._position.outsideDistance);
    } else {
      mouseTarget = MouseTarget.createOutsideEditor(1, new Position(edgeLineNumber, 1), "left", this._position.outsideDistance);
    }
    this._dispatchMouse(mouseTarget, true, 2 /* None */);
    this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseTarget.element), () => this._execute());
  }
};
export { DragScrolling, DragScrollingOperation, TopBottomDragScrolling, TopBottomDragScrollingOperation, LeftRightDragScrolling, LeftRightDragScrollingOperation };
