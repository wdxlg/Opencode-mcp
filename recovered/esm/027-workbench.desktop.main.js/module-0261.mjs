// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/mouseHandler.ts
import { ViewEventHandler } from "./module-0238.mjs";
import { HitTestContext, MouseTarget, MouseTargetFactory } from "./module-0249.mjs";
import { ClientCoordinates, EditorMouseEvent, EditorMouseEventFactory, GlobalEditorPointerMoveMonitor, createCoordinatesRelativeToEditor, createEditorPagePosition } from "./module-0237.mjs";
import { EventType, addDisposableListener, getShadowRoot, getWindow, isKeyboardEvent } from "./module-0075.mjs";
import { MouseWheelClassifier } from "./module-0259.mjs";
import { EditorZoom } from "./module-0100.mjs";
import { StandardWheelEvent } from "./module-0024.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { Disposable } from "./module-0012.mjs";
import { LeftRightDragScrolling, TopBottomDragScrolling } from "./module-0260.mjs";
import { Selection } from "./module-0107.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/browser/controller/mouseHandler.ts
var MouseHandler = class extends ViewEventHandler {
  constructor(context2, viewController, viewHelper) {
    super();
    this._mouseLeaveMonitor = null;
    this._context = context2;
    this.viewController = viewController;
    this.viewHelper = viewHelper;
    this.mouseTargetFactory = new MouseTargetFactory(this._context, viewHelper);
    this._mouseDownOperation = this._register(new MouseDownOperation(
      this._context,
      this.viewController,
      this.viewHelper,
      this.mouseTargetFactory,
      (e, testEventTarget) => this._createMouseTarget(e, testEventTarget),
      (e) => this._getMouseColumn(e)
    ));
    this.lastMouseLeaveTime = -1;
    this._height = this._context.configuration.options.get(165 /* layoutInfo */).height;
    const mouseEvents = new EditorMouseEventFactory(this.viewHelper.viewDomNode);
    this._register(mouseEvents.onContextMenu(this.viewHelper.viewDomNode, (e) => this._onContextMenu(e, true)));
    this._register(mouseEvents.onMouseMove(this.viewHelper.viewDomNode, (e) => {
      this._onMouseMove(e);
      if (!this._mouseLeaveMonitor) {
        this._mouseLeaveMonitor = addDisposableListener(this.viewHelper.viewDomNode.ownerDocument, "mousemove", (e2) => {
          if (!this.viewHelper.viewDomNode.contains(e2.target)) {
            this._onMouseLeave(new EditorMouseEvent(e2, false, this.viewHelper.viewDomNode));
          }
        });
      }
    }));
    this._register(mouseEvents.onMouseUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
    this._register(mouseEvents.onMouseLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
    let capturePointerId = 0;
    this._register(mouseEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => {
      capturePointerId = pointerId;
    }));
    this._register(addDisposableListener(this.viewHelper.viewDomNode, EventType.POINTER_UP, (e) => {
      this._mouseDownOperation.onPointerUp();
    }));
    this._register(mouseEvents.onMouseDown(this.viewHelper.viewDomNode, (e) => this._onMouseDown(e, capturePointerId)));
    this._setupMouseWheelZoomListener();
    this._context.addEventHandler(this);
  }
  _setupMouseWheelZoomListener() {
    const classifier = MouseWheelClassifier.INSTANCE;
    let prevMouseWheelTime = 0;
    let gestureStartZoomLevel = EditorZoom.getZoomLevel();
    let gestureHasZoomModifiers = false;
    let gestureAccumulatedDelta = 0;
    const onMouseWheel = (browserEvent) => {
      this.viewController.emitMouseWheel(browserEvent);
      if (!this._context.configuration.options.get(84 /* mouseWheelZoom */)) {
        return;
      }
      const e = new StandardWheelEvent(browserEvent);
      classifier.acceptStandardWheelEvent(e);
      if (classifier.isPhysicalMouseWheel()) {
        if (hasMouseWheelZoomModifiers(browserEvent)) {
          const zoomLevel = EditorZoom.getZoomLevel();
          const delta2 = e.deltaY > 0 ? 1 : -1;
          EditorZoom.setZoomLevel(zoomLevel + delta2);
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        if (Date.now() - prevMouseWheelTime > 50) {
          gestureStartZoomLevel = EditorZoom.getZoomLevel();
          gestureHasZoomModifiers = hasMouseWheelZoomModifiers(browserEvent);
          gestureAccumulatedDelta = 0;
        }
        prevMouseWheelTime = Date.now();
        gestureAccumulatedDelta += e.deltaY;
        if (gestureHasZoomModifiers) {
          EditorZoom.setZoomLevel(gestureStartZoomLevel + gestureAccumulatedDelta / 5);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    this._register(addDisposableListener(this.viewHelper.viewDomNode, EventType.MOUSE_WHEEL, onMouseWheel, { capture: true, passive: false }));
    function hasMouseWheelZoomModifiers(browserEvent) {
      return isMacintosh ? (browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey : browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey;
    }
  }
  dispose() {
    this._context.removeEventHandler(this);
    if (this._mouseLeaveMonitor) {
      this._mouseLeaveMonitor.dispose();
      this._mouseLeaveMonitor = null;
    }
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    if (e.hasChanged(165 /* layoutInfo */)) {
      const height = this._context.configuration.options.get(165 /* layoutInfo */).height;
      if (this._height !== height) {
        this._height = height;
        this._mouseDownOperation.onHeightChanged();
      }
    }
    return false;
  }
  onCursorStateChanged(e) {
    this._mouseDownOperation.onCursorStateChanged(e);
    return false;
  }
  onFocusChanged(e) {
    return false;
  }
  // --- end event handlers
  getTargetAtClientPoint(clientX, clientY) {
    const clientPos = new ClientCoordinates(clientX, clientY);
    const pos = clientPos.toPageCoordinates(getWindow(this.viewHelper.viewDomNode));
    const editorPos = createEditorPagePosition(this.viewHelper.viewDomNode);
    if (pos.y < editorPos.y || pos.y > editorPos.y + editorPos.height || pos.x < editorPos.x || pos.x > editorPos.x + editorPos.width) {
      return null;
    }
    const relativePos = createCoordinatesRelativeToEditor(this.viewHelper.viewDomNode, editorPos, pos);
    return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
  }
  _createMouseTarget(e, testEventTarget) {
    let target = e.target;
    if (!this.viewHelper.viewDomNode.contains(target)) {
      const shadowRoot = getShadowRoot(this.viewHelper.viewDomNode);
      if (shadowRoot) {
        const potentialTarget = shadowRoot.elementsFromPoint(e.posx, e.posy).find(
          (el) => this.viewHelper.viewDomNode.contains(el)
        ) ?? null;
        target = potentialTarget;
      }
    }
    return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), e.editorPos, e.pos, e.relativePos, testEventTarget ? target : null);
  }
  _getMouseColumn(e) {
    return this.mouseTargetFactory.getMouseColumn(e.relativePos);
  }
  _onContextMenu(e, testEventTarget) {
    this.viewController.emitContextMenu({
      event: e,
      target: this._createMouseTarget(e, testEventTarget)
    });
  }
  _onMouseMove(e) {
    const targetIsWidget = this.mouseTargetFactory.mouseTargetIsWidget(e);
    if (!targetIsWidget) {
      e.preventDefault();
    }
    if (this._mouseDownOperation.isActive()) {
      return;
    }
    const actualMouseMoveTime = e.timestamp;
    if (actualMouseMoveTime < this.lastMouseLeaveTime) {
      return;
    }
    this.viewController.emitMouseMove({
      event: e,
      target: this._createMouseTarget(e, true)
    });
  }
  _onMouseLeave(e) {
    if (this._mouseLeaveMonitor) {
      this._mouseLeaveMonitor.dispose();
      this._mouseLeaveMonitor = null;
    }
    this.lastMouseLeaveTime = (/* @__PURE__ */ new Date()).getTime();
    this.viewController.emitMouseLeave({
      event: e,
      target: null
    });
  }
  _onMouseUp(e) {
    this.viewController.emitMouseUp({
      event: e,
      target: this._createMouseTarget(e, true)
    });
  }
  _onMouseDown(e, pointerId) {
    const t2 = this._createMouseTarget(e, true);
    const targetIsContent = t2.type === 6 /* CONTENT_TEXT */ || t2.type === 7 /* CONTENT_EMPTY */;
    const targetIsGutter = t2.type === 2 /* GUTTER_GLYPH_MARGIN */ || t2.type === 3 /* GUTTER_LINE_NUMBERS */ || t2.type === 4 /* GUTTER_LINE_DECORATIONS */;
    const targetIsLineNumbers = t2.type === 3 /* GUTTER_LINE_NUMBERS */;
    const selectOnLineNumbers = this._context.configuration.options.get(125 /* selectOnLineNumbers */);
    const targetIsViewZone = t2.type === 8 /* CONTENT_VIEW_ZONE */ || t2.type === 5 /* GUTTER_VIEW_ZONE */;
    const targetIsWidget = t2.type === 9 /* CONTENT_WIDGET */;
    let shouldHandle = e.leftButton || e.middleButton;
    if (isMacintosh && e.leftButton && e.ctrlKey) {
      shouldHandle = false;
    }
    const focus = () => {
      e.preventDefault();
      this.viewHelper.focusTextArea();
    };
    if (shouldHandle && (targetIsContent || targetIsLineNumbers && selectOnLineNumbers)) {
      focus();
      this._mouseDownOperation.start(t2.type, e, pointerId);
    } else if (targetIsGutter) {
      e.preventDefault();
    } else if (targetIsViewZone) {
      const viewZoneData = t2.detail;
      if (shouldHandle && this.viewHelper.shouldSuppressMouseDownOnViewZone(viewZoneData.viewZoneId)) {
        focus();
        this._mouseDownOperation.start(t2.type, e, pointerId);
        e.preventDefault();
      }
    } else if (targetIsWidget && this.viewHelper.shouldSuppressMouseDownOnWidget(t2.detail)) {
      focus();
      e.preventDefault();
    }
    this.viewController.emitMouseDown({
      event: e,
      target: t2
    });
  }
  _onMouseWheel(e) {
    this.viewController.emitMouseWheel(e);
  }
};

var MouseDownOperation = class extends Disposable {
  constructor(_context, _viewController, _viewHelper, _mouseTargetFactory, createMouseTarget, getMouseColumn) {
    super();
    this._context = _context;
    this._viewController = _viewController;
    this._viewHelper = _viewHelper;
    this._mouseTargetFactory = _mouseTargetFactory;
    this._createMouseTarget = createMouseTarget;
    this._getMouseColumn = getMouseColumn;
    this._mouseMoveMonitor = this._register(new GlobalEditorPointerMoveMonitor(this._viewHelper.viewDomNode));
    this._topBottomDragScrolling = this._register(new TopBottomDragScrolling(
      this._context,
      this._viewHelper,
      this._mouseTargetFactory,
      (position2, inSelectionMode, revealType) => this._dispatchMouse(position2, inSelectionMode, revealType)
    ));
    this._leftRightDragScrolling = this._register(new LeftRightDragScrolling(
      this._context,
      this._viewHelper,
      this._mouseTargetFactory,
      (position2, inSelectionMode, revealType) => this._dispatchMouse(position2, inSelectionMode, revealType)
    ));
    this._mouseState = new MouseDownState();
    this._currentSelection = new Selection(1, 1, 1, 1);
    this._isActive = false;
    this._lastMouseEvent = null;
  }
  isActive() {
    return this._isActive;
  }
  _onMouseDownThenMove(e) {
    this._lastMouseEvent = e;
    this._mouseState.setModifiers(e);
    const position2 = this._findMousePosition(e, false);
    if (!position2) {
      return;
    }
    if (this._mouseState.isDragAndDrop) {
      this._viewController.emitMouseDrag({
        event: e,
        target: position2
      });
    } else {
      if (position2.type === 13 /* OUTSIDE_EDITOR */) {
        if (position2.outsidePosition === "above" || position2.outsidePosition === "below") {
          this._topBottomDragScrolling.start(position2, e);
          this._leftRightDragScrolling.stop();
        } else {
          this._leftRightDragScrolling.start(position2, e);
          this._topBottomDragScrolling.stop();
        }
      } else {
        this._topBottomDragScrolling.stop();
        this._leftRightDragScrolling.stop();
        this._dispatchMouse(position2, true, 1 /* Minimal */);
      }
    }
  }
  start(targetType, e, pointerId) {
    this._lastMouseEvent = e;
    this._mouseState.setStartedOnLineNumbers(targetType === 3 /* GUTTER_LINE_NUMBERS */);
    this._mouseState.setStartButtons(e);
    this._mouseState.setModifiers(e);
    const position2 = this._findMousePosition(e, true);
    if (!position2 || !position2.position) {
      return;
    }
    this._mouseState.trySetCount(e.detail, position2.position);
    e.detail = this._mouseState.count;
    const options3 = this._context.configuration.options;
    if (!options3.get(104 /* readOnly */) && options3.get(42 /* dragAndDrop */) && !options3.get(28 /* columnSelection */) && !this._mouseState.altKey && e.detail < 2 && !this._isActive && !this._currentSelection.isEmpty() && position2.type === 6 /* CONTENT_TEXT */ && position2.position && this._currentSelection.containsPosition(position2.position)) {
      this._mouseState.isDragAndDrop = true;
      this._isActive = true;
      this._mouseMoveMonitor.startMonitoring(
        this._viewHelper.viewLinesDomNode,
        pointerId,
        e.buttons,
        (e2) => this._onMouseDownThenMove(e2),
        (browserEvent) => {
          const position3 = this._findMousePosition(this._lastMouseEvent, false);
          if (isKeyboardEvent(browserEvent)) {
            this._viewController.emitMouseDropCanceled();
          } else {
            this._viewController.emitMouseDrop({
              event: this._lastMouseEvent,
              target: position3 ? this._createMouseTarget(this._lastMouseEvent, true) : null
              // Ignoring because position is unknown, e.g., Content View Zone
            });
          }
          this._stop();
        }
      );
      return;
    }
    this._mouseState.isDragAndDrop = false;
    this._dispatchMouse(position2, e.shiftKey, 1 /* Minimal */);
    if (!this._isActive) {
      this._isActive = true;
      this._mouseMoveMonitor.startMonitoring(
        this._viewHelper.viewLinesDomNode,
        pointerId,
        e.buttons,
        (e2) => this._onMouseDownThenMove(e2),
        () => this._stop()
      );
    }
  }
  _stop() {
    this._isActive = false;
    this._topBottomDragScrolling.stop();
    this._leftRightDragScrolling.stop();
  }
  onHeightChanged() {
    this._mouseMoveMonitor.stopMonitoring();
  }
  onPointerUp() {
    this._mouseMoveMonitor.stopMonitoring();
  }
  onCursorStateChanged(e) {
    this._currentSelection = e.selections[0];
  }
  _getPositionOutsideEditor(e) {
    const editorContent = e.editorPos;
    const model = this._context.viewModel;
    const viewLayout = this._context.viewLayout;
    const mouseColumn = this._getMouseColumn(e);
    if (e.posy < editorContent.y) {
      const outsideDistance = editorContent.y - e.posy;
      const verticalOffset = Math.max(viewLayout.getCurrentScrollTop() - outsideDistance, 0);
      const viewZoneData = HitTestContext.getZoneAtCoord(this._context, verticalOffset);
      if (viewZoneData) {
        const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
        if (newPosition) {
          return MouseTarget.createOutsideEditor(mouseColumn, newPosition, "above", outsideDistance);
        }
      }
      const aboveLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
      return MouseTarget.createOutsideEditor(mouseColumn, new Position(aboveLineNumber, 1), "above", outsideDistance);
    }
    if (e.posy > editorContent.y + editorContent.height) {
      const outsideDistance = e.posy - editorContent.y - editorContent.height;
      const verticalOffset = viewLayout.getCurrentScrollTop() + e.relativePos.y;
      const viewZoneData = HitTestContext.getZoneAtCoord(this._context, verticalOffset);
      if (viewZoneData) {
        const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
        if (newPosition) {
          return MouseTarget.createOutsideEditor(mouseColumn, newPosition, "below", outsideDistance);
        }
      }
      const belowLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
      return MouseTarget.createOutsideEditor(mouseColumn, new Position(belowLineNumber, model.getLineMaxColumn(belowLineNumber)), "below", outsideDistance);
    }
    const possibleLineNumber = viewLayout.getLineNumberAtVerticalOffset(viewLayout.getCurrentScrollTop() + e.relativePos.y);
    const layoutInfo = this._context.configuration.options.get(165 /* layoutInfo */);
    const xLeftBoundary = layoutInfo.contentLeft;
    if (e.relativePos.x <= xLeftBoundary) {
      const outsideDistance = xLeftBoundary - e.relativePos.x;
      const isRtl = model.getTextDirection(possibleLineNumber) === 1 /* RTL */;
      return MouseTarget.createOutsideEditor(mouseColumn, new Position(possibleLineNumber, isRtl ? model.getLineMaxColumn(possibleLineNumber) : 1), "left", outsideDistance);
    }
    const contentRight = layoutInfo.minimap.minimapLeft === 0 ? layoutInfo.width - layoutInfo.verticalScrollbarWidth : layoutInfo.minimap.minimapLeft;
    const xRightBoundary = contentRight;
    if (e.relativePos.x >= xRightBoundary) {
      const outsideDistance = e.relativePos.x - xRightBoundary;
      const isRtl = model.getTextDirection(possibleLineNumber) === 1 /* RTL */;
      return MouseTarget.createOutsideEditor(mouseColumn, new Position(possibleLineNumber, isRtl ? 1 : model.getLineMaxColumn(possibleLineNumber)), "right", outsideDistance);
    }
    return null;
  }
  _findMousePosition(e, testEventTarget) {
    const positionOutsideEditor = this._getPositionOutsideEditor(e);
    if (positionOutsideEditor) {
      return positionOutsideEditor;
    }
    const t2 = this._createMouseTarget(e, testEventTarget);
    const hintedPosition = t2.position;
    if (!hintedPosition) {
      return null;
    }
    if (t2.type === 8 /* CONTENT_VIEW_ZONE */ || t2.type === 5 /* GUTTER_VIEW_ZONE */) {
      const newPosition = this._helpPositionJumpOverViewZone(t2.detail);
      if (newPosition) {
        return MouseTarget.createViewZone(t2.type, t2.element, t2.mouseColumn, newPosition, t2.detail);
      }
    }
    return t2;
  }
  _helpPositionJumpOverViewZone(viewZoneData) {
    const selectionStart = new Position(this._currentSelection.selectionStartLineNumber, this._currentSelection.selectionStartColumn);
    const positionBefore = viewZoneData.positionBefore;
    const positionAfter = viewZoneData.positionAfter;
    if (positionBefore && positionAfter) {
      if (positionBefore.isBefore(selectionStart)) {
        return positionBefore;
      } else {
        return positionAfter;
      }
    }
    return null;
  }
  _dispatchMouse(position2, inSelectionMode, revealType) {
    if (!position2.position) {
      return;
    }
    this._viewController.dispatchMouse({
      position: position2.position,
      mouseColumn: position2.mouseColumn,
      startedOnLineNumbers: this._mouseState.startedOnLineNumbers,
      revealType,
      inSelectionMode,
      mouseDownCount: this._mouseState.count,
      altKey: this._mouseState.altKey,
      ctrlKey: this._mouseState.ctrlKey,
      metaKey: this._mouseState.metaKey,
      shiftKey: this._mouseState.shiftKey,
      leftButton: this._mouseState.leftButton,
      middleButton: this._mouseState.middleButton,
      onInjectedText: position2.type === 6 /* CONTENT_TEXT */ && position2.detail.injectedText !== null
    });
  }
};

var MouseDownState = class _MouseDownState {
  static {
    this.CLEAR_MOUSE_DOWN_COUNT_TIME = 400;
  }
  get altKey() {
    return this._altKey;
  }
  get ctrlKey() {
    return this._ctrlKey;
  }
  get metaKey() {
    return this._metaKey;
  }
  get shiftKey() {
    return this._shiftKey;
  }
  get leftButton() {
    return this._leftButton;
  }
  get middleButton() {
    return this._middleButton;
  }
  get startedOnLineNumbers() {
    return this._startedOnLineNumbers;
  }
  constructor() {
    this._altKey = false;
    this._ctrlKey = false;
    this._metaKey = false;
    this._shiftKey = false;
    this._leftButton = false;
    this._middleButton = false;
    this._startedOnLineNumbers = false;
    this._lastMouseDownPosition = null;
    this._lastMouseDownPositionEqualCount = 0;
    this._lastMouseDownCount = 0;
    this._lastSetMouseDownCountTime = 0;
    this.isDragAndDrop = false;
  }
  get count() {
    return this._lastMouseDownCount;
  }
  setModifiers(source) {
    this._altKey = source.altKey;
    this._ctrlKey = source.ctrlKey;
    this._metaKey = source.metaKey;
    this._shiftKey = source.shiftKey;
  }
  setStartButtons(source) {
    this._leftButton = source.leftButton;
    this._middleButton = source.middleButton;
  }
  setStartedOnLineNumbers(startedOnLineNumbers) {
    this._startedOnLineNumbers = startedOnLineNumbers;
  }
  trySetCount(setMouseDownCount, newMouseDownPosition) {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    if (currentTime - this._lastSetMouseDownCountTime > _MouseDownState.CLEAR_MOUSE_DOWN_COUNT_TIME) {
      setMouseDownCount = 1;
    }
    this._lastSetMouseDownCountTime = currentTime;
    if (setMouseDownCount > this._lastMouseDownCount + 1) {
      setMouseDownCount = this._lastMouseDownCount + 1;
    }
    if (this._lastMouseDownPosition && this._lastMouseDownPosition.equals(newMouseDownPosition)) {
      this._lastMouseDownPositionEqualCount++;
    } else {
      this._lastMouseDownPositionEqualCount = 1;
    }
    this._lastMouseDownPosition = newMouseDownPosition;
    this._lastMouseDownCount = Math.min(setMouseDownCount, this._lastMouseDownPositionEqualCount);
  }
};
export { MouseHandler, MouseDownOperation, MouseDownState };
