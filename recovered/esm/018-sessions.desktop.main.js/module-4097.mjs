// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/browser/screenshotAnnotation.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/contrib/issue/browser/screenshotAnnotation.ts
var COLORS = [
  "#ff3b30",
  // red
  "#007aff",
  // blue
  "#34c759",
  // green
  "#ffcc00",
  // yellow
  "#000000",
  // black
  "#ffffff"
  // white
];

var LIGHT_SWATCH_COLORS = /* @__PURE__ */ new Set(["#34c759", "#ffcc00", "#ffffff", "transparent"]);

var FONT_FAMILIES = [
  { label: "Sans-serif", value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: "Monospace", value: '"Cascadia Code", "Fira Code", Consolas, monospace' },
  { label: "Serif", value: 'Georgia, "Times New Roman", serif' }
];

var DEFAULT_TEXT_BOX_WIDTH = 240;

var MIN_TEXT_BOX_WIDTH = 48;

var TEXT_DRAG_THRESHOLD = 4;

var CANVAS_BREATHING_ROOM = 64;

var FILL_COLORS = ["transparent", ...COLORS];

var STROKE_WIDTHS = [2, 4, 8, 12];

var TEXT_SIZES = [14, 18, 24, 32, 48];

function cloneDrawAction(action, identityMap = /* @__PURE__ */ new Map()) {
  const existing = identityMap.get(action);
  if (existing) {
    return existing;
  }
  const clone2 = {
    type: action.type,
    strokeColor: action.strokeColor,
    fillColor: action.fillColor,
    opacity: action.opacity,
    lineWidth: action.lineWidth,
    fontSize: action.fontSize,
    fontFamily: action.fontFamily,
    points: action.points ? action.points.map((p) => ({ x: p.x, y: p.y })) : void 0,
    rect: action.rect ? { ...action.rect } : void 0,
    ellipseRect: action.ellipseRect ? { ...action.ellipseRect } : void 0,
    arrowStart: action.arrowStart ? { ...action.arrowStart } : void 0,
    arrowEnd: action.arrowEnd ? { ...action.arrowEnd } : void 0,
    text: action.text,
    textPos: action.textPos ? { ...action.textPos } : void 0,
    textWidth: action.textWidth,
    cropFrom: action.cropFrom === void 0 ? void 0 : action.cropFrom === null ? null : { ...action.cropFrom },
    cropTo: action.cropTo === void 0 ? void 0 : action.cropTo === null ? null : { ...action.cropTo },
    moveBefore: action.moveBefore ? cloneMoveSnapshot(action.moveBefore) : void 0,
    moveAfter: action.moveAfter ? cloneMoveSnapshot(action.moveAfter) : void 0
  };
  identityMap.set(action, clone2);
  clone2.erasedActions = action.erasedActions ? action.erasedActions.map((a) => cloneDrawAction(a, identityMap)) : void 0;
  clone2.erasedIndices = action.erasedIndices ? action.erasedIndices.slice() : void 0;
  clone2.moveTarget = action.moveTarget ? cloneDrawAction(action.moveTarget, identityMap) : void 0;
  return clone2;
}

function cloneMoveSnapshot(s) {
  return {
    points: s.points ? s.points.map((p) => ({ x: p.x, y: p.y })) : void 0,
    rect: s.rect ? { ...s.rect } : void 0,
    ellipseRect: s.ellipseRect ? { ...s.ellipseRect } : void 0,
    arrowStart: s.arrowStart ? { ...s.arrowStart } : void 0,
    arrowEnd: s.arrowEnd ? { ...s.arrowEnd } : void 0,
    textPos: s.textPos ? { ...s.textPos } : void 0,
    textWidth: s.textWidth
  };
}

function captureMoveSnapshot(action) {
  return cloneMoveSnapshot({
    points: action.points,
    rect: action.rect,
    ellipseRect: action.ellipseRect,
    arrowStart: action.arrowStart,
    arrowEnd: action.arrowEnd,
    textPos: action.textPos,
    textWidth: action.textWidth
  });
}

function applyMoveSnapshot(action, snapshot) {
  const fresh = cloneMoveSnapshot(snapshot);
  action.points = fresh.points;
  action.rect = fresh.rect;
  action.ellipseRect = fresh.ellipseRect;
  action.arrowStart = fresh.arrowStart;
  action.arrowEnd = fresh.arrowEnd;
  action.textPos = fresh.textPos;
  action.textWidth = fresh.textWidth;
}

function moveSnapshotsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

var ScreenshotAnnotationEditor = class {
  constructor(screenshot, parentElement, initialState) {
    this.screenshot = screenshot;
    this.parentElement = parentElement;
    this.initialState = initialState;
    this.disposables = new DisposableStore();
    this.toolOptionsDisposables = new DisposableStore();
    this._onDidSave = new Emitter();
    this.onDidSave = this._onDidSave.event;
    this._onDidCancel = new Emitter();
    this.onDidCancel = this._onDidCancel.event;
    this.activeTool = "freehand" /* Freehand */;
    this.activeStrokeColor = COLORS[0];
    this.activeFillColor = "transparent";
    this.activeLineWidth = 4;
    this.activeOpacity = 1;
    this.actions = [];
    this.undoneActions = [];
    this.currentAction = null;
    this.isDrawing = false;
    this.isErasing = false;
    /** Actions erased during the current pointer drag; committed to undo stack on pointer-up. */
    this.pendingEraseActions = [];
    /** Original index (in `actions[]`) of each entry in `pendingEraseActions`, captured at the moment it was removed. */
    this.pendingEraseIndices = [];
    this.imageElement = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.scale = 1;
    // Pan & zoom
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.lastPanPoint = { x: 0, y: 0 };
    // Crop with handles
    this.cropMode = false;
    this.cropRegion = null;
    this.cropDragHandle = null;
    this.cropDragStart = { x: 0, y: 0 };
    this.cropRegionStart = null;
    this.hasUserZoomed = false;
    /** Pending wheel-zoom delta accumulated across rapid wheel events; flushed on rAF. */
    this.pendingZoom = null;
    this.pendingZoomRaf = 0;
    // Original image preserved so crops can be expanded back
    this.originalImage = null;
    // Current crop region in original-image coords (null = no crop applied)
    this.currentCrop = null;
    // Pre-crop state restored on Cancel
    this.preCropState = null;
    this.mainToolbar = null;
    this.cropToolbar = null;
    // Selection (Select tool)
    this.selectedActionIndex = -1;
    this.isDraggingSelected = false;
    this.isResizingSelectedText = false;
    this.dragStart = { x: 0, y: 0 };
    this.selectedTextResizeStartWidth = DEFAULT_TEXT_BOX_WIDTH;
    /** Captured at the start of a Select-tool drag/resize so a Move sentinel can be committed on pointer-up. */
    this.pendingMove = null;
    // Text configuration
    this.activeFontSize = 18;
    this.activeFontFamily = FONT_FAMILIES[0].value;
    this.textPlacementState = null;
    this.textEditState = null;
    this.textEditor = null;
    this.textCaretVisible = true;
    this.textCaretInterval = null;
    // Tool buttons (for active state management)
    this.toolButtons = [];
    this.undoBtn = null;
    this.redoBtn = null;
    this.toolOptionsPopover = null;
    this.createUI();
    this.loadImage();
  }
  /** Annotations are stored in original-image coords. While in crop mode the canvas already shows the original image, so the offset is 0. */
  get cropOffsetX() {
    return this.cropMode ? 0 : this.currentCrop?.x ?? 0;
  }
  get cropOffsetY() {
    return this.cropMode ? 0 : this.currentCrop?.y ?? 0;
  }
  createUI() {
    this.container = append(this.parentElement, $("div.issue-reporter-annotation-overlay"));
    this.container.tabIndex = -1;
    const toolbar = append(this.container, $("div.annotation-toolbar"));
    this.mainToolbar = toolbar;
    const drawingTools = [
      { tool: "select" /* Select */, label: localize(16453, null), icon: renderIcon(Codicon.inspect) },
      { tool: "pan" /* Pan */, label: localize(16449, null), icon: renderIcon(Codicon.move) }
    ];
    for (const { tool, label: label3, icon: icon2 } of drawingTools) {
      this.addToolButton(toolbar, tool, label3, icon2);
    }
    const cropBtn = append(toolbar, $("button.tool-btn.crop-btn"));
    cropBtn.appendChild(renderIcon(Codicon.screenCut));
    cropBtn.title = localize(16442, null);
    cropBtn.setAttribute("aria-label", localize(16442, null));
    this.toolButtons.push({ element: cropBtn, tool: "crop" /* Crop */ });
    this.disposables.add(addDisposableListener(cropBtn, EventType.CLICK, () => {
      this.setActiveTool("crop" /* Crop */);
    }));
    const moreDrawingTools = [
      { tool: "freehand" /* Freehand */, label: localize(16447, null), icon: renderIcon(Codicon.edit) },
      { tool: "rectangle" /* Rectangle */, label: localize(16450, null), icon: renderIcon(Codicon.primitiveSquare) },
      { tool: "ellipse" /* Ellipse */, label: localize(16444, null), icon: renderIcon(Codicon.circle) },
      { tool: "arrow" /* Arrow */, label: localize(16439, null), icon: renderIcon(Codicon.arrowRight) },
      { tool: "eraser" /* Eraser */, label: localize(16445, null), icon: renderIcon(Codicon.eraser) }
    ];
    for (const { tool, label: label3, icon: icon2 } of moreDrawingTools) {
      this.addToolButton(toolbar, tool, label3, icon2);
    }
    this.addToolButton(toolbar, "text" /* Text */, localize(16461, null), renderIcon(Codicon.symbolString));
    this.toolOptionsPopover = append(this.container, $("div.annotation-tool-options-popover"));
    this.toolOptionsPopover.style.display = "none";
    this.disposables.add(addDisposableListener(this.container, EventType.CLICK, (e4) => {
      if (!this.toolOptionsPopover || this.toolOptionsPopover.style.display === "none") {
        return;
      }
      const target = e4.target;
      if (!this.toolOptionsPopover.contains(target) && !this.toolButtons.some((button) => button.element.contains(target))) {
        this.hideToolOptions();
      }
    }));
    this.renderToolOptions();
    append(toolbar, $("div.toolbar-separator"));
    const undoBtn = append(toolbar, $("button.tool-btn"));
    undoBtn.appendChild(renderIcon(Codicon.discard));
    undoBtn.title = localize(16468, null);
    undoBtn.setAttribute("aria-label", localize(16468, null));
    this.disposables.add(addDisposableListener(undoBtn, EventType.CLICK, () => this.undo()));
    this.undoBtn = undoBtn;
    const redoBtn = append(toolbar, $("button.tool-btn"));
    redoBtn.appendChild(renderIcon(Codicon.redo));
    redoBtn.title = localize(16451, null);
    redoBtn.setAttribute("aria-label", localize(16451, null));
    this.disposables.add(addDisposableListener(redoBtn, EventType.CLICK, () => this.redo()));
    this.redoBtn = redoBtn;
    this.updateUndoRedoState();
    append(toolbar, $("div.toolbar-separator"));
    const discardBtn = this.disposables.add(new Button(toolbar, { ...defaultButtonStyles, secondary: true }));
    discardBtn.label = localize(16443, null);
    this.disposables.add(discardBtn.onDidClick(() => {
      this.cancelTextEdit();
      this._onDidCancel.fire();
      this.dispose();
    }));
    const saveBtn = this.disposables.add(new Button(toolbar, defaultButtonStyles));
    saveBtn.label = localize(16452, null);
    this.disposables.add(saveBtn.onDidClick(() => {
      this.commitTextEdit();
      const dataUrl = this.compositeToDataUrl();
      this._onDidSave.fire({ dataUrl, state: this.captureState() });
      this.dispose();
    }));
    const cropToolbar = append(this.container, $("div.annotation-toolbar.annotation-crop-toolbar"));
    cropToolbar.style.display = "none";
    this.cropToolbar = cropToolbar;
    const cropCancelBtn = this.disposables.add(new Button(cropToolbar, { ...defaultButtonStyles, secondary: true }));
    cropCancelBtn.label = localize(16440, null);
    this.disposables.add(cropCancelBtn.onDidClick(() => {
      this.cancelCrop();
    }));
    const cropApplyBtn = this.disposables.add(new Button(cropToolbar, defaultButtonStyles));
    cropApplyBtn.label = localize(16438, null);
    this.disposables.add(cropApplyBtn.onDidClick(() => {
      this.commitCrop();
    }));
    const hint = append(this.container, $("div.annotation-hint"));
    hint.textContent = localize(16437, null);
    const canvasContainer = append(this.container, $("div.annotation-canvas-container"));
    this.canvas = append(canvasContainer, $("canvas"));
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D canvas context");
    }
    this.ctx = ctx;
    this.disposables.add(addDisposableListener(this.canvas, EventType.POINTER_DOWN, (e4) => this.onPointerDown(e4)));
    this.disposables.add(addDisposableListener(this.canvas, EventType.POINTER_MOVE, (e4) => this.onPointerMove(e4)));
    this.disposables.add(addDisposableListener(this.canvas, EventType.POINTER_UP, (e4) => this.onPointerUp(e4)));
    this.disposables.add(addDisposableListener(this.canvas, EventType.DBLCLICK, () => {
      this.commitCrop();
    }));
    this.disposables.add(addDisposableListener(canvasContainer, EventType.WHEEL, (e4) => {
      e4.preventDefault();
      if (e4.ctrlKey) {
        const delta2 = e4.deltaY !== 0 ? e4.deltaY : e4.deltaX;
        const factor2 = delta2 < 0 ? 1.1 : 0.9;
        const containerRect = canvasContainer.getBoundingClientRect();
        const cx = e4.clientX - (containerRect.left + containerRect.width / 2);
        const cy = e4.clientY - (containerRect.top + containerRect.height / 2);
        if (this.pendingZoom) {
          this.pendingZoom.factor *= factor2;
          this.pendingZoom.cx = cx;
          this.pendingZoom.cy = cy;
        } else {
          this.pendingZoom = { factor: factor2, cx, cy };
        }
        if (!this.pendingZoomRaf) {
          const targetWindow = getWindow(this.canvas);
          this.pendingZoomRaf = targetWindow.requestAnimationFrame(() => {
            this.pendingZoomRaf = 0;
            this.flushPendingZoom();
          });
        }
      } else {
        this.panX -= e4.deltaX;
        this.panY -= e4.deltaY;
        this.clampPan();
        this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
      }
    }, { passive: false }));
    this.disposables.add(addDisposableListener(this.container, EventType.KEY_DOWN, (e4) => {
      if (this.textEditState) {
        return;
      }
      if (this.textPlacementState && e4.key === "Escape") {
        e4.preventDefault();
        e4.stopPropagation();
        this.cancelTextPlacement();
        return;
      }
      if (e4.key === "Escape") {
        if (this.cropMode) {
          e4.preventDefault();
          e4.stopPropagation();
          this.cancelCrop();
          return;
        }
        if (this.selectedActionIndex >= 0) {
          this.selectedActionIndex = -1;
          this.redraw();
          return;
        }
        e4.preventDefault();
        e4.stopPropagation();
        this._onDidCancel.fire();
        this.dispose();
      } else if (e4.key === "Enter" && this.cropMode) {
        e4.preventDefault();
        this.commitCrop();
      } else if ((e4.key === "Delete" || e4.key === "Backspace") && this.selectedActionIndex >= 0) {
        e4.preventDefault();
        const removedIndex = this.selectedActionIndex;
        const [removed] = this.actions.splice(removedIndex, 1);
        this.selectedActionIndex = -1;
        this.actions.push({
          type: "eraser" /* Eraser */,
          strokeColor: "",
          opacity: 1,
          lineWidth: 0,
          erasedActions: [removed],
          erasedIndices: [removedIndex]
        });
        this.undoneActions.length = 0;
        this.updateUndoRedoState();
        this.redraw();
      }
    }));
    const resizeObserver = new ResizeObserver(() => {
      if (this.imageElement) {
        if (this.hasUserZoomed) {
          const minScale = this.getFitScale();
          if (this.scale < minScale) {
            this.scale = minScale;
          }
        }
        this.sizeCanvas();
        this.clampPan();
        this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
        this.redraw();
      }
    });
    resizeObserver.observe(canvasContainer);
    this.disposables.add({ dispose: () => resizeObserver.disconnect() });
  }
  addToolButton(toolbar, tool, label3, icon2) {
    const btn = append(toolbar, $("button.tool-btn"));
    btn.appendChild(icon2);
    btn.title = label3;
    btn.setAttribute("aria-label", label3);
    btn.setAttribute("aria-pressed", String(tool === this.activeTool));
    if (tool === this.activeTool) {
      btn.classList.add("active");
    }
    this.toolButtons.push({ element: btn, tool });
    this.disposables.add(addDisposableListener(btn, EventType.CLICK, (e4) => {
      e4.stopPropagation();
      this.setActiveTool(tool);
    }));
  }
  renderToolOptions() {
    if (!this.toolOptionsPopover) {
      return;
    }
    this.toolOptionsDisposables.clear();
    this.toolOptionsPopover.textContent = "";
    this.toolOptionsPopover.setAttribute("role", "group");
    this.toolOptionsPopover.setAttribute("aria-label", localize(16465, null));
    this.appendColorOptions(
      this.toolOptionsPopover,
      this.activeTool === "text" /* Text */ ? localize(16463, null) : localize(16459, null),
      COLORS,
      this.activeStrokeColor,
      localize(16456, null),
      (color2) => {
        this.activeStrokeColor = color2;
        this.applyToolOptionsToTextEdit();
      }
    );
    if (this.activeTool !== "freehand" /* Freehand */ && this.activeTool !== "arrow" /* Arrow */) {
      this.appendColorOptions(
        this.toolOptionsPopover,
        this.activeTool === "text" /* Text */ ? localize(16462, null) : localize(16446, null),
        FILL_COLORS,
        this.activeFillColor,
        localize(16454, null),
        (color2) => {
          this.activeFillColor = color2;
          this.applyToolOptionsToTextEdit();
        }
      );
    }
    this.appendSizeOptions(this.toolOptionsPopover);
    this.appendOpacityOptions(this.toolOptionsPopover);
  }
  appendColorOptions(container2, label3, colors, selectedColor, ariaLabelPrefix, onSelect) {
    const group2 = append(container2, $("div.annotation-tool-options-group"));
    append(group2, $("span.annotation-tool-options-label")).textContent = label3;
    const swatches = append(group2, $("div.annotation-color-swatches"));
    for (const color2 of colors) {
      const swatch = append(swatches, $("button.annotation-color-swatch"));
      const isTransparent = color2 === "transparent";
      swatch.classList.toggle("transparent", isTransparent);
      swatch.classList.toggle("light-swatch", LIGHT_SWATCH_COLORS.has(color2));
      swatch.style.backgroundColor = isTransparent ? "transparent" : color2;
      swatch.setAttribute("aria-label", isTransparent ? localize(16466, null, ariaLabelPrefix) : localize(16441, null, ariaLabelPrefix, color2));
      swatch.setAttribute("aria-pressed", String(color2 === selectedColor));
      swatch.classList.toggle("active", color2 === selectedColor);
      this.toolOptionsDisposables.add(addDisposableListener(swatch, EventType.CLICK, (e4) => {
        e4.stopPropagation();
        onSelect(color2);
        this.renderToolOptions();
        this.redraw();
      }));
    }
  }
  appendSizeOptions(container2) {
    const isText = this.activeTool === "text" /* Text */;
    const values = isText ? TEXT_SIZES : STROKE_WIDTHS;
    const selectedValue = isText ? this.activeFontSize : this.activeLineWidth;
    const group2 = append(container2, $("div.annotation-tool-options-group"));
    append(group2, $("span.annotation-tool-options-label")).textContent = isText ? localize(16464, null) : localize(16460, null);
    const buttons = append(group2, $("div.annotation-size-buttons"));
    for (const value2 of values) {
      const button = append(buttons, $("button.annotation-size-button"));
      button.textContent = `${value2}`;
      button.setAttribute("aria-label", isText ? localize(16458, null, value2) : localize(16457, null, value2));
      button.setAttribute("aria-pressed", String(value2 === selectedValue));
      button.classList.toggle("active", value2 === selectedValue);
      this.toolOptionsDisposables.add(addDisposableListener(button, EventType.CLICK, (e4) => {
        e4.stopPropagation();
        if (isText) {
          this.activeFontSize = value2;
        } else {
          this.activeLineWidth = value2;
        }
        this.applyToolOptionsToTextEdit();
        this.renderToolOptions();
        this.redraw();
      }));
    }
  }
  appendOpacityOptions(container2) {
    const group2 = append(container2, $("div.annotation-tool-options-group.annotation-opacity-options"));
    const label3 = append(group2, $("label.annotation-tool-options-label"));
    label3.textContent = localize(16448, null);
    const input = append(group2, $("input.annotation-opacity-slider"));
    input.type = "range";
    input.min = "20";
    input.max = "100";
    input.step = "10";
    input.value = `${Math.round(this.activeOpacity * 100)}`;
    input.setAttribute("aria-label", localize(16455, null));
    const value2 = append(group2, $("span.annotation-opacity-value"));
    value2.textContent = `${input.value}%`;
    this.toolOptionsDisposables.add(addDisposableListener(input, EventType.INPUT, (e4) => {
      e4.stopPropagation();
      this.activeOpacity = Number(input.value) / 100;
      value2.textContent = `${input.value}%`;
      this.applyToolOptionsToTextEdit();
      this.redraw();
    }));
  }
  applyToolOptionsToTextEdit() {
    if (!this.textEditState) {
      return;
    }
    this.textEditState.strokeColor = this.activeStrokeColor;
    this.textEditState.fillColor = this.activeFillColor;
    this.textEditState.opacity = this.activeOpacity;
    this.textEditState.fontSize = this.activeFontSize;
  }
  showToolOptions(anchor) {
    if (!this.toolOptionsPopover || !this.hasToolOptions(this.activeTool)) {
      this.hideToolOptions();
      return;
    }
    this.renderToolOptions();
    const containerRect = this.container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    this.toolOptionsPopover.style.top = `${anchorRect.bottom - containerRect.top + 6}px`;
    this.toolOptionsPopover.style.display = "flex";
    const halfWidth = this.toolOptionsPopover.offsetWidth / 2;
    const desiredLeft = anchorRect.left + anchorRect.width / 2 - containerRect.left;
    const minLeft = halfWidth + 8;
    const maxLeft = Math.max(minLeft, containerRect.width - halfWidth - 8);
    this.toolOptionsPopover.style.left = `${Math.min(Math.max(desiredLeft, minLeft), maxLeft)}px`;
  }
  hideToolOptions() {
    if (this.toolOptionsPopover) {
      this.toolOptionsPopover.style.display = "none";
    }
  }
  hasToolOptions(tool) {
    return tool === "freehand" /* Freehand */ || tool === "rectangle" /* Rectangle */ || tool === "ellipse" /* Ellipse */ || tool === "arrow" /* Arrow */ || tool === "text" /* Text */;
  }
  setActiveTool(tool) {
    if (this.textEditState && tool !== "text" /* Text */) {
      this.commitTextEdit();
    }
    if (this.textPlacementState && tool !== "text" /* Text */) {
      this.cancelTextPlacement();
    }
    if (tool === "crop" /* Crop */) {
      this.hideToolOptions();
      this.enterCropMode();
      return;
    }
    this.activeTool = tool;
    this.selectedActionIndex = -1;
    for (const tb of this.toolButtons) {
      tb.element.classList.toggle("active", tb.tool === tool);
      tb.element.setAttribute("aria-pressed", String(tb.tool === tool));
    }
    const activeToolButton = this.toolButtons.find((tb) => tb.tool === tool)?.element;
    if (activeToolButton && this.hasToolOptions(tool)) {
      this.showToolOptions(activeToolButton);
    } else {
      this.hideToolOptions();
    }
    this.canvas.style.cursor = tool === "select" /* Select */ ? "default" : tool === "pan" /* Pan */ ? "grab" : tool === "eraser" /* Eraser */ ? `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewport='0 0 24 24'><circle cx='12' cy='12' r='9' fill='none' stroke='%23fff' stroke-width='2'/><circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='1' stroke-dasharray='2 2'/></svg>") 12 12, cell` : "crosshair";
    this.redraw();
  }
  enterCropMode() {
    if (this.cropMode || !this.originalImage) {
      return;
    }
    this.preCropState = {
      element: this.imageElement,
      width: this.imageWidth,
      height: this.imageHeight,
      currentCrop: this.currentCrop
    };
    this.imageElement = this.originalImage.element;
    this.imageWidth = this.originalImage.width;
    this.imageHeight = this.originalImage.height;
    this.cropRegion = this.currentCrop ? { ...this.currentCrop } : { x: 0, y: 0, width: this.originalImage.width, height: this.originalImage.height };
    this.cropMode = true;
    for (const tb of this.toolButtons) {
      tb.element.classList.toggle("active", tb.tool === "crop" /* Crop */);
    }
    if (this.mainToolbar) {
      this.mainToolbar.style.display = "none";
    }
    if (this.cropToolbar) {
      this.cropToolbar.style.display = "";
    }
    this.hasUserZoomed = false;
    this.panX = 0;
    this.panY = 0;
    this.canvas.style.transform = "";
    this.canvas.style.cursor = "default";
    this.sizeCanvas();
    this.redraw();
  }
  exitCropMode() {
    this.cropMode = false;
    this.cropRegion = null;
    this.cropDragHandle = null;
    this.cropRegionStart = null;
    this.preCropState = null;
    if (this.mainToolbar) {
      this.mainToolbar.style.display = "";
    }
    if (this.cropToolbar) {
      this.cropToolbar.style.display = "none";
    }
    this.setActiveTool(this.activeTool);
  }
  commitCrop() {
    if (!this.cropMode || !this.cropRegion || !this.originalImage) {
      return;
    }
    const cr = this.normalizeCropRect(this.cropRegion);
    if (cr.width < 10 || cr.height < 10) {
      return;
    }
    const cropFrom = this.preCropState?.currentCrop ?? null;
    const cropAction = {
      type: "crop" /* Crop */,
      strokeColor: "",
      opacity: 1,
      lineWidth: 0,
      cropFrom,
      cropTo: cr
    };
    this.actions.push(cropAction);
    this.undoneActions.length = 0;
    this.updateUndoRedoState();
    this.hasUserZoomed = false;
    this.panX = 0;
    this.panY = 0;
    this.canvas.style.transform = "";
    this.exitCropMode();
    this.applyDisplayedCrop(cr);
  }
  cancelCrop() {
    if (!this.cropMode || !this.preCropState) {
      this.exitCropMode();
      return;
    }
    this.imageElement = this.preCropState.element;
    this.imageWidth = this.preCropState.width;
    this.imageHeight = this.preCropState.height;
    this.currentCrop = this.preCropState.currentCrop;
    this.hasUserZoomed = false;
    this.panX = 0;
    this.panY = 0;
    this.canvas.style.transform = "";
    this.exitCropMode();
    this.sizeCanvas();
    this.redraw();
  }
  loadImage() {
    const img = mainWindow.document.createElement("img");
    img.onload = () => {
      this.imageElement = img;
      this.imageWidth = img.naturalWidth;
      this.imageHeight = img.naturalHeight;
      this.originalImage = { element: img, width: img.naturalWidth, height: img.naturalHeight };
      this.currentCrop = null;
      if (this.initialState && (this.initialState.actions.length || this.initialState.undoneActions.length)) {
        const identityMap = /* @__PURE__ */ new Map();
        this.actions.push(...this.initialState.actions.map((a) => cloneDrawAction(a, identityMap)));
        this.undoneActions.push(...this.initialState.undoneActions.map((a) => cloneDrawAction(a, identityMap)));
        this.updateUndoRedoState();
      }
      this.applyDisplayedCrop(this.initialState?.crop ?? null);
    };
    img.src = this.screenshot.dataUrl;
  }
  /**
   * Update the displayed image to reflect the given crop (or the full original
   * when null). Cropped images are re-rasterized from the preserved original so
   * undo/redo of crop actions is fully reversible without keeping intermediate
   * image elements around.
   */
  applyDisplayedCrop(crop) {
    if (!this.originalImage) {
      return;
    }
    if (!crop) {
      this.imageElement = this.originalImage.element;
      this.imageWidth = this.originalImage.width;
      this.imageHeight = this.originalImage.height;
      this.currentCrop = null;
      this.sizeCanvas();
      this.redraw();
      return;
    }
    const cr = {
      x: Math.max(0, Math.min(this.originalImage.width, crop.x)),
      y: Math.max(0, Math.min(this.originalImage.height, crop.y)),
      width: Math.max(1, Math.min(this.originalImage.width - Math.max(0, crop.x), crop.width)),
      height: Math.max(1, Math.min(this.originalImage.height - Math.max(0, crop.y), crop.height))
    };
    const cropCanvas = mainWindow.document.createElement("canvas");
    cropCanvas.width = cr.width;
    cropCanvas.height = cr.height;
    const cropCtx = cropCanvas.getContext("2d");
    cropCtx.drawImage(this.originalImage.element, cr.x, cr.y, cr.width, cr.height, 0, 0, cr.width, cr.height);
    const croppedImg = mainWindow.document.createElement("img");
    croppedImg.onload = () => {
      this.imageElement = croppedImg;
      this.imageWidth = croppedImg.naturalWidth;
      this.imageHeight = croppedImg.naturalHeight;
      this.currentCrop = cr;
      this.sizeCanvas();
      this.redraw();
    };
    croppedImg.src = cropCanvas.toDataURL("image/png");
  }
  captureState() {
    const identityMap = /* @__PURE__ */ new Map();
    return {
      actions: this.actions.map((a) => cloneDrawAction(a, identityMap)),
      undoneActions: this.undoneActions.map((a) => cloneDrawAction(a, identityMap)),
      crop: this.currentCrop ? { ...this.currentCrop } : null
    };
  }
  sizeCanvas() {
    const container2 = this.canvas.parentElement;
    if (!container2) {
      return;
    }
    const targetWindow = getWindow(this.canvas);
    const dpr = targetWindow.devicePixelRatio || 1;
    const maxWidth = container2.clientWidth - CANVAS_BREATHING_ROOM * 2;
    const maxHeight = container2.clientHeight - CANVAS_BREATHING_ROOM * 2;
    if (!this.hasUserZoomed) {
      const scaleX = maxWidth / this.imageWidth;
      const scaleY = maxHeight / this.imageHeight;
      this.scale = Math.min(scaleX, scaleY, 1);
    }
    const displayWidth = Math.floor(this.imageWidth * this.scale);
    const displayHeight = Math.floor(this.imageHeight * this.scale);
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;
    const MAX_BACKING_DIM = 4096;
    const naturalW = displayWidth * dpr;
    const naturalH = displayHeight * dpr;
    const overage = Math.max(1, naturalW / MAX_BACKING_DIM, naturalH / MAX_BACKING_DIM);
    const effectiveDpr = dpr / overage;
    this.canvas.width = Math.max(1, Math.floor(displayWidth * effectiveDpr));
    this.canvas.height = Math.max(1, Math.floor(displayHeight * effectiveDpr));
    this.ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);
  }
  canvasCoords(e4) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e4.clientX - rect.left) / this.scale + this.cropOffsetX,
      y: (e4.clientY - rect.top) / this.scale + this.cropOffsetY
    };
  }
  onPointerDown(e4) {
    const pos = this.canvasCoords(e4);
    if (this.cropMode && this.cropRegion) {
      const handle2 = this.cropHandleHitTest(pos);
      if (handle2) {
        this.cropDragHandle = handle2;
        this.cropDragStart = pos;
        this.cropRegionStart = { ...this.cropRegion };
        this.canvas.setPointerCapture(e4.pointerId);
      }
      return;
    }
    if (this.activeTool === "select" /* Select */) {
      const hitIndex = this.hitTest(pos);
      this.selectedActionIndex = hitIndex;
      if (hitIndex >= 0) {
        const hitAction = this.actions[hitIndex];
        this.pendingMove = { target: hitAction, before: captureMoveSnapshot(hitAction) };
        if (hitAction.type === "text" /* Text */ && this.isNearTextResizeHandle(pos, hitAction)) {
          this.isResizingSelectedText = true;
          this.dragStart = { x: pos.x, y: pos.y };
          this.selectedTextResizeStartWidth = hitAction.textWidth ?? DEFAULT_TEXT_BOX_WIDTH;
          this.canvas.setPointerCapture(e4.pointerId);
          this.canvas.style.cursor = "ew-resize";
        } else {
          this.isDraggingSelected = true;
          this.dragStart = { x: pos.x, y: pos.y };
          this.canvas.setPointerCapture(e4.pointerId);
          this.canvas.style.cursor = "move";
        }
      }
      this.redraw();
      return;
    }
    this.selectedActionIndex = -1;
    if (this.activeTool === "text" /* Text */) {
      this.commitTextEdit();
      this.textPlacementState = {
        start: pos,
        current: pos,
        pointerId: e4.pointerId
      };
      this.canvas.setPointerCapture(e4.pointerId);
      this.redraw();
      return;
    }
    if (this.activeTool === "eraser" /* Eraser */) {
      this.isErasing = true;
      this.canvas.setPointerCapture(e4.pointerId);
      this.eraseAt(pos);
      return;
    }
    if (this.activeTool === "pan" /* Pan */) {
      this.isPanning = true;
      this.lastPanPoint = { x: e4.clientX, y: e4.clientY };
      this.canvas.setPointerCapture(e4.pointerId);
      this.canvas.style.cursor = "grabbing";
      return;
    }
    this.isDrawing = true;
    this.canvas.setPointerCapture(e4.pointerId);
    switch (this.activeTool) {
      case "freehand" /* Freehand */:
        this.currentAction = {
          type: "freehand" /* Freehand */,
          strokeColor: this.activeStrokeColor,
          opacity: this.activeOpacity,
          lineWidth: this.activeLineWidth,
          points: [pos]
        };
        break;
      case "rectangle" /* Rectangle */:
        this.currentAction = {
          type: "rectangle" /* Rectangle */,
          strokeColor: this.activeStrokeColor,
          fillColor: this.activeFillColor,
          opacity: this.activeOpacity,
          lineWidth: this.activeLineWidth,
          rect: { x: pos.x, y: pos.y, width: 0, height: 0 }
        };
        break;
      case "ellipse" /* Ellipse */:
        this.currentAction = {
          type: "ellipse" /* Ellipse */,
          strokeColor: this.activeStrokeColor,
          fillColor: this.activeFillColor,
          opacity: this.activeOpacity,
          lineWidth: this.activeLineWidth,
          ellipseRect: { x: pos.x, y: pos.y, width: 0, height: 0 }
        };
        break;
      case "arrow" /* Arrow */:
        this.currentAction = {
          type: "arrow" /* Arrow */,
          strokeColor: this.activeStrokeColor,
          opacity: this.activeOpacity,
          lineWidth: this.activeLineWidth,
          arrowStart: pos,
          arrowEnd: pos
        };
        break;
    }
  }
  onPointerMove(e4) {
    if (this.cropMode) {
      const pos2 = this.canvasCoords(e4);
      if (this.cropDragHandle && this.cropRegionStart) {
        this.updateCropRegion(pos2);
        this.redraw();
        return;
      }
      const handle2 = this.cropHandleHitTest(pos2);
      this.canvas.style.cursor = this.cropCursorFor(handle2);
      return;
    }
    if (this.isResizingSelectedText && this.selectedActionIndex >= 0) {
      const pos2 = this.canvasCoords(e4);
      const action = this.actions[this.selectedActionIndex];
      if (action.type === "text" /* Text */) {
        action.textWidth = Math.max(MIN_TEXT_BOX_WIDTH, this.selectedTextResizeStartWidth + (pos2.x - this.dragStart.x));
        this.redraw();
      }
      return;
    }
    if (this.isDraggingSelected && this.selectedActionIndex >= 0) {
      const pos2 = this.canvasCoords(e4);
      const dx = pos2.x - this.dragStart.x;
      const dy = pos2.y - this.dragStart.y;
      this.moveAction(this.actions[this.selectedActionIndex], dx, dy);
      this.dragStart = { x: pos2.x, y: pos2.y };
      this.redraw();
      return;
    }
    if (this.isPanning) {
      const dx = e4.clientX - this.lastPanPoint.x;
      const dy = e4.clientY - this.lastPanPoint.y;
      this.panX += dx;
      this.panY += dy;
      this.lastPanPoint = { x: e4.clientX, y: e4.clientY };
      this.clampPan();
      this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
      return;
    }
    if (this.textPlacementState) {
      const pos2 = this.canvasCoords(e4);
      this.textPlacementState.current = pos2;
      this.redraw();
      return;
    }
    if (this.isErasing) {
      const pos2 = this.canvasCoords(e4);
      this.eraseAt(pos2);
      return;
    }
    if (this.activeTool === "select" /* Select */ && this.selectedActionIndex >= 0) {
      const pos2 = this.canvasCoords(e4);
      const action = this.actions[this.selectedActionIndex];
      if (action.type === "text" /* Text */ && this.isNearTextResizeHandle(pos2, action)) {
        this.canvas.style.cursor = "ew-resize";
      } else if (this.selectedActionIndex >= 0) {
        this.canvas.style.cursor = "default";
      }
    }
    if (!this.isDrawing) {
      return;
    }
    const pos = this.canvasCoords(e4);
    if (!this.currentAction) {
      return;
    }
    switch (this.currentAction.type) {
      case "freehand" /* Freehand */:
        this.currentAction.points.push(pos);
        break;
      case "rectangle" /* Rectangle */: {
        const rect = this.currentAction.rect;
        this.currentAction.rect = {
          ...rect,
          width: pos.x - rect.x,
          height: pos.y - rect.y
        };
        break;
      }
      case "ellipse" /* Ellipse */: {
        const er = this.currentAction.ellipseRect;
        let w = pos.x - er.x;
        let h3 = pos.y - er.y;
        if (e4.shiftKey) {
          const size3 = Math.max(Math.abs(w), Math.abs(h3));
          w = Math.sign(w) * size3;
          h3 = Math.sign(h3) * size3;
        }
        this.currentAction.ellipseRect = { ...er, width: w, height: h3 };
        break;
      }
      case "arrow" /* Arrow */:
        this.currentAction.arrowEnd = pos;
        break;
    }
    this.redraw();
  }
  onPointerUp(e4) {
    if (this.cropMode && this.cropDragHandle) {
      this.cropDragHandle = null;
      this.cropRegionStart = null;
      this.canvas.releasePointerCapture(e4.pointerId);
      return;
    }
    if (this.isResizingSelectedText) {
      this.isResizingSelectedText = false;
      this.canvas.releasePointerCapture(e4.pointerId);
      this.canvas.style.cursor = "default";
      this.commitPendingMove();
      return;
    }
    if (this.isDraggingSelected) {
      this.isDraggingSelected = false;
      this.canvas.releasePointerCapture(e4.pointerId);
      this.canvas.style.cursor = "default";
      this.commitPendingMove();
      return;
    }
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.releasePointerCapture(e4.pointerId);
      this.canvas.style.cursor = this.activeTool === "pan" /* Pan */ ? "grab" : "crosshair";
      return;
    }
    if (this.isErasing) {
      this.isErasing = false;
      this.canvas.releasePointerCapture(e4.pointerId);
      if (this.pendingEraseActions.length > 0) {
        this.actions.push({
          type: "eraser" /* Eraser */,
          strokeColor: "",
          opacity: 1,
          lineWidth: 0,
          erasedActions: this.pendingEraseActions.slice(),
          erasedIndices: this.pendingEraseIndices.slice()
        });
        this.pendingEraseActions = [];
        this.pendingEraseIndices = [];
        this.undoneActions.length = 0;
        this.updateUndoRedoState();
      }
      return;
    }
    if (this.textPlacementState) {
      const { start, current, pointerId } = this.textPlacementState;
      if (pointerId === e4.pointerId) {
        this.canvas.releasePointerCapture(e4.pointerId);
      }
      const dx = current.x - start.x;
      const didDrag = Math.abs(dx) >= TEXT_DRAG_THRESHOLD;
      const x = didDrag ? Math.min(start.x, current.x) : start.x;
      const rawWidth = didDrag ? Math.abs(dx) : this.getMaxTextWidthFrom(start.x);
      const width2 = didDrag ? Math.max(1, Math.min(rawWidth, this.getTextImageRight() - x)) : rawWidth;
      const y = start.y;
      this.textPlacementState = null;
      this.startTextEdit({ x, y }, width2, didDrag);
      return;
    }
    if (!this.isDrawing) {
      return;
    }
    this.canvas.releasePointerCapture(e4.pointerId);
    this.isDrawing = false;
    if (this.currentAction) {
      this.actions.push(this.currentAction);
      this.undoneActions.length = 0;
      this.updateUndoRedoState();
      this.currentAction = null;
    }
    this.redraw();
  }
  eraseAt(pos) {
    const hitIndex = this.hitTest(pos);
    if (hitIndex < 0) {
      return;
    }
    const [erased] = this.actions.splice(hitIndex, 1);
    this.pendingEraseActions.push(erased);
    this.pendingEraseIndices.push(hitIndex);
    this.selectedActionIndex = -1;
    this.redraw();
  }
  commitPendingMove() {
    const pending = this.pendingMove;
    this.pendingMove = null;
    if (!pending) {
      return;
    }
    const after2 = captureMoveSnapshot(pending.target);
    if (moveSnapshotsEqual(pending.before, after2)) {
      return;
    }
    this.actions.push({
      type: "move" /* Move */,
      strokeColor: "",
      opacity: 1,
      lineWidth: 0,
      moveTarget: pending.target,
      moveBefore: pending.before,
      moveAfter: after2
    });
    this.undoneActions.length = 0;
    this.updateUndoRedoState();
  }
  updateUndoRedoState() {
    if (this.undoBtn) {
      this.undoBtn.disabled = this.actions.length === 0;
    }
    if (this.redoBtn) {
      this.redoBtn.disabled = this.undoneActions.length === 0;
    }
  }
  undo() {
    if (this.textPlacementState) {
      this.cancelTextPlacement();
      return;
    }
    if (this.textEditState) {
      this.cancelTextEdit();
      return;
    }
    const action = this.actions.pop();
    if (!action) {
      return;
    }
    if (action.type === "eraser" /* Eraser */ && action.erasedActions) {
      const erased = action.erasedActions;
      const indices = action.erasedIndices ?? erased.map(() => this.actions.length);
      for (let i2 = erased.length - 1; i2 >= 0; i2--) {
        const idx = Math.min(indices[i2], this.actions.length);
        this.actions.splice(idx, 0, erased[i2]);
      }
    }
    this.undoneActions.push(action);
    this.updateUndoRedoState();
    this.selectedActionIndex = -1;
    if (action.type === "crop" /* Crop */) {
      this.applyDisplayedCrop(action.cropFrom ?? null);
    } else if (action.type === "move" /* Move */ && action.moveTarget && action.moveBefore) {
      applyMoveSnapshot(action.moveTarget, action.moveBefore);
      this.redraw();
    } else {
      this.redraw();
    }
  }
  redo() {
    if (this.textPlacementState) {
      return;
    }
    if (this.textEditState) {
      return;
    }
    const action = this.undoneActions.pop();
    if (!action) {
      return;
    }
    if (action.type === "eraser" /* Eraser */ && action.erasedActions) {
      for (const erased of action.erasedActions) {
        const idx = this.actions.indexOf(erased);
        if (idx >= 0) {
          this.actions.splice(idx, 1);
        }
      }
    }
    this.actions.push(action);
    this.selectedActionIndex = -1;
    this.updateUndoRedoState();
    if (action.type === "crop" /* Crop */) {
      this.applyDisplayedCrop(action.cropTo ?? null);
    } else if (action.type === "move" /* Move */ && action.moveTarget && action.moveAfter) {
      applyMoveSnapshot(action.moveTarget, action.moveAfter);
      this.redraw();
    } else {
      this.redraw();
    }
  }
  cropHandleHitTest(pos) {
    if (!this.cropRegion) {
      return null;
    }
    const r2 = this.normalizeCropRect(this.cropRegion);
    const handlePx = 12;
    const tol = handlePx / this.scale;
    const cx = r2.x + r2.width / 2;
    const cy = r2.y + r2.height / 2;
    const handles = [
      { name: "nw", x: r2.x, y: r2.y },
      { name: "n", x: cx, y: r2.y },
      { name: "ne", x: r2.x + r2.width, y: r2.y },
      { name: "e", x: r2.x + r2.width, y: cy },
      { name: "se", x: r2.x + r2.width, y: r2.y + r2.height },
      { name: "s", x: cx, y: r2.y + r2.height },
      { name: "sw", x: r2.x, y: r2.y + r2.height },
      { name: "w", x: r2.x, y: cy }
    ];
    for (const h3 of handles) {
      if (Math.abs(pos.x - h3.x) <= tol && Math.abs(pos.y - h3.y) <= tol) {
        return h3.name;
      }
    }
    if (pos.x >= r2.x && pos.x <= r2.x + r2.width && pos.y >= r2.y && pos.y <= r2.y + r2.height) {
      return "move";
    }
    return null;
  }
  cropCursorFor(handle2) {
    switch (handle2) {
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      case "move":
        return "move";
      default:
        return "default";
    }
  }
  updateCropRegion(pos) {
    if (!this.cropRegionStart || !this.cropDragHandle) {
      return;
    }
    const dx = pos.x - this.cropDragStart.x;
    const dy = pos.y - this.cropDragStart.y;
    const start = this.cropRegionStart;
    if (this.cropDragHandle === "move") {
      const x2 = Math.max(0, Math.min(this.imageWidth - start.width, start.x + dx));
      const y2 = Math.max(0, Math.min(this.imageHeight - start.height, start.y + dy));
      this.cropRegion = { x: x2, y: y2, width: start.width, height: start.height };
      return;
    }
    let { x, y, width: width2, height } = start;
    switch (this.cropDragHandle) {
      case "nw":
        x += dx;
        y += dy;
        width2 -= dx;
        height -= dy;
        break;
      case "n":
        y += dy;
        height -= dy;
        break;
      case "ne":
        y += dy;
        width2 += dx;
        height -= dy;
        break;
      case "e":
        width2 += dx;
        break;
      case "se":
        width2 += dx;
        height += dy;
        break;
      case "s":
        height += dy;
        break;
      case "sw":
        x += dx;
        width2 -= dx;
        height += dy;
        break;
      case "w":
        x += dx;
        width2 -= dx;
        break;
    }
    x = Math.max(0, Math.min(this.imageWidth, x));
    y = Math.max(0, Math.min(this.imageHeight, y));
    width2 = Math.max(10, Math.min(this.imageWidth - x, width2));
    height = Math.max(10, Math.min(this.imageHeight - y, height));
    this.cropRegion = { x, y, width: width2, height };
  }
  normalizeCropRect(r2) {
    return {
      x: r2.width < 0 ? r2.x + r2.width : r2.x,
      y: r2.height < 0 ? r2.y + r2.height : r2.y,
      width: Math.abs(r2.width),
      height: Math.abs(r2.height)
    };
  }
  startTextEdit(pos, width2, showBoxOutline) {
    this.commitTextEdit();
    const editor = mainWindow.document.createElement("textarea");
    editor.setAttribute("aria-label", localize(16467, null));
    editor.setAttribute("wrap", "off");
    editor.style.position = "fixed";
    editor.style.left = "-10000px";
    editor.style.top = "0";
    editor.style.width = "1px";
    editor.style.height = "1px";
    editor.style.opacity = "0";
    editor.style.pointerEvents = "none";
    editor.style.padding = "0";
    editor.style.border = "0";
    editor.style.margin = "0";
    editor.style.resize = "none";
    editor.style.overflow = "hidden";
    this.container.appendChild(editor);
    this.textEditState = {
      pos,
      text: "",
      caretIndex: 0,
      strokeColor: this.activeStrokeColor,
      fillColor: this.activeFillColor,
      opacity: this.activeOpacity,
      fontSize: this.activeFontSize,
      fontFamily: this.activeFontFamily,
      width: width2,
      showBoxOutline
    };
    this.textEditor = editor;
    this.startTextCaretBlink();
    const sync = () => {
      if (!this.textEditState || this.textEditor !== editor) {
        return;
      }
      this.textEditState.text = editor.value;
      this.textEditState.caretIndex = editor.selectionStart ?? editor.value.length;
      this.textCaretVisible = true;
      this.redraw();
    };
    editor.addEventListener("input", sync);
    editor.addEventListener("keyup", sync);
    editor.addEventListener("click", sync);
    editor.addEventListener("select", sync);
    editor.addEventListener("keydown", (e4) => {
      e4.stopPropagation();
      if (e4.key === "Enter" && (e4.ctrlKey || e4.metaKey)) {
        e4.preventDefault();
        this.commitTextEdit();
      } else if (e4.key === "Escape") {
        e4.preventDefault();
        this.cancelTextEdit();
      }
    });
    editor.addEventListener("blur", () => {
      if (this.textEditor === editor) {
        this.commitTextEdit();
      }
    });
    setTimeout(() => {
      if (this.textEditor === editor) {
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);
      }
    }, 0);
    this.redraw();
  }
  startTextCaretBlink() {
    if (this.textCaretInterval !== null) {
      getWindow(this.container).clearInterval(this.textCaretInterval);
    }
    this.textCaretVisible = true;
    this.textCaretInterval = getWindow(this.container).setInterval(() => {
      if (!this.textEditState) {
        return;
      }
      this.textCaretVisible = !this.textCaretVisible;
      this.redraw();
    }, 500);
  }
  stopTextCaretBlink() {
    if (this.textCaretInterval !== null) {
      getWindow(this.container).clearInterval(this.textCaretInterval);
      this.textCaretInterval = null;
    }
    this.textCaretVisible = true;
  }
  commitTextEdit() {
    if (!this.textEditState) {
      return;
    }
    const { text: text2, pos, strokeColor, fillColor, opacity, fontFamily, fontSize, width: width2 } = this.textEditState;
    this.cleanupTextEditor();
    if (text2.trim()) {
      this.actions.push({
        type: "text" /* Text */,
        strokeColor,
        fillColor,
        opacity,
        lineWidth: 1,
        fontSize,
        fontFamily,
        text: text2,
        textPos: pos,
        textWidth: width2
      });
      this.undoneActions.length = 0;
      this.updateUndoRedoState();
    }
    this.redraw();
  }
  cancelTextEdit() {
    if (!this.textEditState) {
      return;
    }
    this.cleanupTextEditor();
    this.redraw();
  }
  cancelTextPlacement() {
    if (!this.textPlacementState) {
      return;
    }
    if (this.canvas.hasPointerCapture(this.textPlacementState.pointerId)) {
      this.canvas.releasePointerCapture(this.textPlacementState.pointerId);
    }
    this.textPlacementState = null;
    this.redraw();
  }
  getTextImageRight() {
    return this.cropOffsetX + this.imageWidth;
  }
  getMaxTextWidthFrom(startX) {
    return Math.max(1, this.getTextImageRight() - startX);
  }
  cleanupTextEditor() {
    this.stopTextCaretBlink();
    this.textEditor?.remove();
    this.textEditor = null;
    this.textEditState = null;
    this.container.focus();
  }
  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.imageElement) {
      this.ctx.drawImage(this.imageElement, 0, 0, this.imageWidth * this.scale, this.imageHeight * this.scale);
    }
    this.ctx.save();
    this.ctx.translate(-this.cropOffsetX * this.scale, -this.cropOffsetY * this.scale);
    for (const action of this.actions) {
      this.drawAction(action);
    }
    if (this.selectedActionIndex >= 0 && this.selectedActionIndex < this.actions.length) {
      this.drawSelectionHighlight(this.actions[this.selectedActionIndex]);
    }
    if (this.currentAction) {
      this.drawAction(this.currentAction);
    }
    if (this.textEditState) {
      this.drawTextEditState();
    }
    if (this.textPlacementState) {
      this.drawTextPlacementState();
    }
    this.ctx.restore();
    if (this.cropMode && this.cropRegion) {
      const r2 = this.normalizeCropRect(this.cropRegion);
      const dpr = getWindow(this.canvas).devicePixelRatio || 1;
      const cw = this.canvas.width / dpr;
      const ch = this.canvas.height / dpr;
      const rx = r2.x * this.scale;
      const ry = r2.y * this.scale;
      const rw = r2.width * this.scale;
      const rh = r2.height * this.scale;
      this.ctx.save();
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.ctx.fillRect(0, 0, cw, ry);
      this.ctx.fillRect(0, ry + rh, cw, ch - (ry + rh));
      this.ctx.fillRect(0, ry, rx, rh);
      this.ctx.fillRect(rx + rw, ry, cw - (rx + rw), rh);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(rx, ry, rw, rh);
      const handleSize = 10;
      const half = handleSize / 2;
      const handles = [
        { x: rx, y: ry },
        // nw
        { x: rx + rw / 2, y: ry },
        // n
        { x: rx + rw, y: ry },
        // ne
        { x: rx + rw, y: ry + rh / 2 },
        // e
        { x: rx + rw, y: ry + rh },
        // se
        { x: rx + rw / 2, y: ry + rh },
        // s
        { x: rx, y: ry + rh },
        // sw
        { x: rx, y: ry + rh / 2 }
        // w
      ];
      this.ctx.fillStyle = "#ffffff";
      this.ctx.strokeStyle = "#000000";
      this.ctx.lineWidth = 1;
      for (const h3 of handles) {
        this.ctx.fillRect(h3.x - half, h3.y - half, handleSize, handleSize);
        this.ctx.strokeRect(h3.x - half, h3.y - half, handleSize, handleSize);
      }
      this.ctx.restore();
    }
  }
  drawAction(action) {
    if (action.type === "eraser" /* Eraser */ || action.type === "crop" /* Crop */ || action.type === "move" /* Move */) {
      return;
    }
    this.ctx.save();
    const fillColor = action.fillColor ?? "transparent";
    this.ctx.globalAlpha = action.opacity;
    this.ctx.strokeStyle = action.strokeColor;
    this.ctx.fillStyle = this.isTransparent(fillColor) ? action.strokeColor : fillColor;
    this.ctx.lineWidth = action.lineWidth * this.scale;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    switch (action.type) {
      case "freehand" /* Freehand */:
        if (action.points && action.points.length > 0) {
          this.ctx.beginPath();
          this.ctx.moveTo(action.points[0].x * this.scale, action.points[0].y * this.scale);
          for (let i2 = 1; i2 < action.points.length; i2++) {
            this.ctx.lineTo(action.points[i2].x * this.scale, action.points[i2].y * this.scale);
          }
          this.ctx.stroke();
        }
        break;
      case "rectangle" /* Rectangle */:
        if (action.rect) {
          if (!this.isTransparent(fillColor)) {
            this.ctx.fillRect(
              action.rect.x * this.scale,
              action.rect.y * this.scale,
              action.rect.width * this.scale,
              action.rect.height * this.scale
            );
          }
          this.ctx.strokeRect(
            action.rect.x * this.scale,
            action.rect.y * this.scale,
            action.rect.width * this.scale,
            action.rect.height * this.scale
          );
        }
        break;
      case "ellipse" /* Ellipse */:
        if (action.ellipseRect) {
          const r2 = action.ellipseRect;
          const cx = (r2.x + r2.width / 2) * this.scale;
          const cy = (r2.y + r2.height / 2) * this.scale;
          const rx = Math.abs(r2.width / 2) * this.scale;
          const ry = Math.abs(r2.height / 2) * this.scale;
          this.ctx.beginPath();
          this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          if (!this.isTransparent(fillColor)) {
            this.ctx.fill();
          }
          this.ctx.stroke();
        }
        break;
      case "arrow" /* Arrow */:
        if (action.arrowStart && action.arrowEnd) {
          this.drawArrow(
            action.arrowStart.x * this.scale,
            action.arrowStart.y * this.scale,
            action.arrowEnd.x * this.scale,
            action.arrowEnd.y * this.scale
          );
        }
        break;
      case "text" /* Text */:
        if (action.text && action.textPos) {
          const fontSize = (action.fontSize || 16) * this.scale;
          const fontFamily = action.fontFamily || "sans-serif";
          const width2 = (action.textWidth ?? DEFAULT_TEXT_BOX_WIDTH) * this.scale;
          this.ctx.font = `${fontSize}px ${fontFamily}`;
          this.ctx.textBaseline = "alphabetic";
          if (!this.isTransparent(fillColor)) {
            const layout2 = this.measureWrappedText(action.text, width2, fontSize, fontFamily);
            this.ctx.fillRect(
              action.textPos.x * this.scale,
              action.textPos.y * this.scale - fontSize,
              width2,
              Math.max(layout2.height, fontSize * 1.2)
            );
          }
          this.ctx.fillStyle = action.strokeColor;
          this.drawWrappedText(action.text, action.textPos.x * this.scale, action.textPos.y * this.scale, width2, fontSize, fontFamily);
        }
        break;
    }
    this.ctx.restore();
  }
  drawTextEditState() {
    if (!this.textEditState) {
      return;
    }
    const { pos, text: text2, strokeColor, fillColor, opacity, fontFamily, fontSize, caretIndex, width: width2, showBoxOutline } = this.textEditState;
    const scaledFontSize = fontSize * this.scale;
    const scaledWidth = width2 * this.scale;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = strokeColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = Math.max(1, this.scale);
    this.ctx.font = `${scaledFontSize}px ${fontFamily}`;
    this.ctx.textBaseline = "alphabetic";
    if (!this.isTransparent(fillColor)) {
      const layout3 = this.measureWrappedText(text2, scaledWidth, scaledFontSize, fontFamily);
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(
        pos.x * this.scale,
        pos.y * this.scale - scaledFontSize,
        scaledWidth,
        Math.max(layout3.height, scaledFontSize * 1.2)
      );
      this.ctx.fillStyle = strokeColor;
    }
    const layout2 = this.drawWrappedText(text2, pos.x * this.scale, pos.y * this.scale, scaledWidth, scaledFontSize, fontFamily);
    if (showBoxOutline) {
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      this.ctx.strokeRect(
        pos.x * this.scale,
        pos.y * this.scale - scaledFontSize,
        scaledWidth,
        Math.max(layout2.height, scaledFontSize * 1.2)
      );
      this.ctx.setLineDash([]);
    }
    if (this.textCaretVisible) {
      const caret2 = this.getTextCaretMetrics(text2, caretIndex, scaledWidth, scaledFontSize, fontFamily);
      const caretX = pos.x * this.scale + caret2.x;
      const baselineY = pos.y * this.scale + caret2.baselineOffsetY;
      this.ctx.beginPath();
      this.ctx.moveTo(caretX, baselineY - scaledFontSize);
      this.ctx.lineTo(caretX, baselineY + Math.max(2, this.scale));
      this.ctx.stroke();
    }
    this.ctx.restore();
  }
  isTransparent(color2) {
    return color2 === "transparent";
  }
  drawTextPlacementState() {
    if (!this.textPlacementState) {
      return;
    }
    const { start, current } = this.textPlacementState;
    const dx = current.x - start.x;
    const didDrag = Math.abs(dx) >= TEXT_DRAG_THRESHOLD;
    if (!didDrag) {
      return;
    }
    const x = Math.min(start.x, current.x);
    const width2 = Math.max(1, Math.min(Math.abs(dx), this.getTextImageRight() - x));
    const y = (start.y - this.activeFontSize) * this.scale;
    const height = this.activeFontSize * this.scale * 1.2;
    this.ctx.save();
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    this.ctx.lineWidth = Math.max(1, this.scale);
    this.ctx.strokeRect(x * this.scale, y, width2 * this.scale, height);
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }
  drawWrappedText(text2, x, baselineY, maxWidth, fontSize, fontFamily) {
    const layout2 = this.measureWrappedText(text2, maxWidth, fontSize, fontFamily);
    const lineHeight = layout2.lineHeight;
    for (let i2 = 0; i2 < layout2.lines.length; i2++) {
      const line = layout2.lines[i2];
      this.ctx.fillText(line.text, x, baselineY + i2 * lineHeight);
    }
    return {
      width: layout2.width,
      height: layout2.height,
      lineHeight
    };
  }
  getTextCaretMetrics(text2, caretIndex, maxWidth, fontSize, fontFamily) {
    const layout2 = this.measureWrappedText(text2, maxWidth, fontSize, fontFamily);
    const line = [...layout2.lines].reverse().find((candidate) => candidate.startIndex <= caretIndex) ?? layout2.lines[0];
    const safeCaretIndex = Math.min(Math.max(caretIndex, line.startIndex), line.endIndex);
    const beforeCaret = line.text.slice(0, safeCaretIndex - line.startIndex);
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const x = this.ctx.measureText(beforeCaret).width;
    this.ctx.restore();
    return {
      x,
      baselineOffsetY: line.lineIndex * layout2.lineHeight
    };
  }
  measureWrappedText(text2, maxWidth, fontSize, fontFamily) {
    this.ctx.save();
    this.ctx.font = `${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 1.2;
    const lines = [];
    const paragraphs = text2.split("\n");
    let globalIndex = 0;
    let lineIndex = 0;
    let maxLineWidth = 0;
    for (let p = 0; p < paragraphs.length; p++) {
      const paragraph2 = paragraphs[p];
      const paragraphStart = globalIndex;
      const paragraphEnd = paragraphStart + paragraph2.length;
      if (paragraph2.length === 0) {
        lines.push({ text: "", startIndex: paragraphStart, endIndex: paragraphStart, lineIndex });
        lineIndex++;
      } else {
        let lineStart = paragraphStart;
        while (lineStart < paragraphEnd) {
          let bestEnd = lineStart + 1;
          let lastWhitespaceBreak = -1;
          for (let i2 = lineStart + 1; i2 <= paragraphEnd; i2++) {
            const candidate = text2.slice(lineStart, i2);
            if (this.ctx.measureText(candidate).width <= maxWidth) {
              bestEnd = i2;
              if (/\s/.test(text2[i2 - 1])) {
                lastWhitespaceBreak = i2;
              }
            } else {
              break;
            }
          }
          let lineEnd = bestEnd;
          if (bestEnd < paragraphEnd && lastWhitespaceBreak > lineStart) {
            lineEnd = lastWhitespaceBreak;
          }
          if (lineEnd <= lineStart) {
            lineEnd = lineStart + 1;
          }
          const rawLineText = text2.slice(lineStart, lineEnd);
          const lineText = rawLineText.replace(/\s+$/u, "");
          lines.push({ text: lineText, startIndex: lineStart, endIndex: lineEnd, lineIndex });
          maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(lineText).width);
          lineIndex++;
          lineStart = lineEnd;
          while (lineStart < paragraphEnd && /\s/u.test(text2[lineStart])) {
            lineStart++;
          }
        }
      }
      globalIndex = paragraphEnd + 1;
    }
    if (lines.length === 0) {
      lines.push({ text: "", startIndex: 0, endIndex: 0, lineIndex: 0 });
    }
    if (maxLineWidth === 0) {
      for (const line of lines) {
        maxLineWidth = Math.max(maxLineWidth, this.ctx.measureText(line.text).width);
      }
    }
    this.ctx.restore();
    return {
      lines,
      width: Math.max(maxLineWidth, maxWidth),
      height: lines.length * lineHeight,
      lineHeight
    };
  }
  hitTest(pos) {
    for (let i2 = this.actions.length - 1; i2 >= 0; i2--) {
      if (this.isPointOnAction(pos, this.actions[i2])) {
        return i2;
      }
    }
    return -1;
  }
  isPointOnAction(pos, action) {
    const threshold = 8;
    switch (action.type) {
      case "freehand" /* Freehand */:
        if (action.points) {
          for (let i2 = 1; i2 < action.points.length; i2++) {
            if (this.pointToSegmentDist(pos, action.points[i2 - 1], action.points[i2]) < threshold) {
              return true;
            }
          }
        }
        return false;
      case "rectangle" /* Rectangle */:
        if (action.rect) {
          const r2 = action.rect;
          const nx = Math.min(r2.x, r2.x + r2.width);
          const ny = Math.min(r2.y, r2.y + r2.height);
          const nw = Math.abs(r2.width);
          const nh = Math.abs(r2.height);
          return pos.x >= nx - threshold && pos.x <= nx + nw + threshold && pos.y >= ny - threshold && pos.y <= ny + nh + threshold;
        }
        return false;
      case "ellipse" /* Ellipse */:
        if (action.ellipseRect) {
          const er = action.ellipseRect;
          const cx = er.x + er.width / 2;
          const cy = er.y + er.height / 2;
          const rx = Math.abs(er.width / 2);
          const ry = Math.abs(er.height / 2);
          if (rx < 1 || ry < 1) {
            return false;
          }
          const dx = (pos.x - cx) / rx;
          const dy = (pos.y - cy) / ry;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (!this.isTransparent(action.fillColor ?? "transparent")) {
            return dist <= 1 + threshold / Math.min(rx, ry);
          }
          const normalizedThreshold = threshold / Math.min(rx, ry);
          return Math.abs(dist - 1) < normalizedThreshold;
        }
        return false;
      case "arrow" /* Arrow */:
        if (action.arrowStart && action.arrowEnd) {
          return this.pointToSegmentDist(pos, action.arrowStart, action.arrowEnd) < threshold;
        }
        return false;
      case "text" /* Text */:
        if (action.text && action.textPos) {
          const bounds = this.getActionBounds(action);
          if (!bounds) {
            return false;
          }
          return pos.x >= action.textPos.x - threshold && pos.x <= bounds.x + bounds.width + threshold && pos.y >= bounds.y - threshold && pos.y <= bounds.y + bounds.height + threshold;
        }
        return false;
    }
    return false;
  }
  pointToSegmentDist(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) {
      return Math.hypot(p.x - a.x, p.y - a.y);
    }
    let t2 = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
    t2 = Math.max(0, Math.min(1, t2));
    const projX = a.x + t2 * dx;
    const projY = a.y + t2 * dy;
    return Math.hypot(p.x - projX, p.y - projY);
  }
  moveAction(action, dx, dy) {
    switch (action.type) {
      case "freehand" /* Freehand */:
        if (action.points) {
          for (const pt of action.points) {
            pt.x += dx;
            pt.y += dy;
          }
        }
        break;
      case "rectangle" /* Rectangle */:
        if (action.rect) {
          action.rect.x += dx;
          action.rect.y += dy;
        }
        break;
      case "ellipse" /* Ellipse */:
        if (action.ellipseRect) {
          action.ellipseRect.x += dx;
          action.ellipseRect.y += dy;
        }
        break;
      case "arrow" /* Arrow */:
        if (action.arrowStart) {
          action.arrowStart.x += dx;
          action.arrowStart.y += dy;
        }
        if (action.arrowEnd) {
          action.arrowEnd.x += dx;
          action.arrowEnd.y += dy;
        }
        break;
      case "text" /* Text */:
        if (action.textPos) {
          action.textPos.x += dx;
          action.textPos.y += dy;
        }
        break;
    }
  }
  drawSelectionHighlight(action) {
    this.ctx.save();
    this.ctx.strokeStyle = "#007acc";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);
    const pad = 6;
    const bounds = this.getActionBounds(action);
    if (bounds) {
      this.ctx.strokeRect(
        (bounds.x - pad) * this.scale,
        (bounds.y - pad) * this.scale,
        (bounds.width + pad * 2) * this.scale,
        (bounds.height + pad * 2) * this.scale
      );
      if (action.type === "text" /* Text */) {
        const handleSize = 8;
        const handleX = (bounds.x + bounds.width + pad) * this.scale;
        const handleY = (bounds.y + bounds.height / 2) * this.scale;
        this.ctx.fillStyle = "#007acc";
        this.ctx.fillRect(handleX - handleSize / 2, handleY - handleSize / 2, handleSize, handleSize);
      }
    }
    this.ctx.setLineDash([]);
    this.ctx.restore();
  }
  isNearTextResizeHandle(pos, action) {
    if (action.type !== "text" /* Text */) {
      return false;
    }
    const bounds = this.getActionBounds(action);
    if (!bounds) {
      return false;
    }
    const threshold = 8;
    const handleX = bounds.x + bounds.width;
    const handleY = bounds.y + bounds.height / 2;
    return Math.abs(pos.x - handleX) <= threshold && Math.abs(pos.y - handleY) <= threshold * 2;
  }
  getActionBounds(action) {
    switch (action.type) {
      case "freehand" /* Freehand */:
        if (action.points && action.points.length > 0) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const pt of action.points) {
            minX = Math.min(minX, pt.x);
            minY = Math.min(minY, pt.y);
            maxX = Math.max(maxX, pt.x);
            maxY = Math.max(maxY, pt.y);
          }
          return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
        return null;
      case "rectangle" /* Rectangle */:
        if (action.rect) {
          const r2 = action.rect;
          return {
            x: Math.min(r2.x, r2.x + r2.width),
            y: Math.min(r2.y, r2.y + r2.height),
            width: Math.abs(r2.width),
            height: Math.abs(r2.height)
          };
        }
        return null;
      case "ellipse" /* Ellipse */:
        if (action.ellipseRect) {
          const er = action.ellipseRect;
          return {
            x: Math.min(er.x, er.x + er.width),
            y: Math.min(er.y, er.y + er.height),
            width: Math.abs(er.width),
            height: Math.abs(er.height)
          };
        }
        return null;
      case "arrow" /* Arrow */:
        if (action.arrowStart && action.arrowEnd) {
          const minX = Math.min(action.arrowStart.x, action.arrowEnd.x);
          const minY = Math.min(action.arrowStart.y, action.arrowEnd.y);
          const maxX = Math.max(action.arrowStart.x, action.arrowEnd.x);
          const maxY = Math.max(action.arrowStart.y, action.arrowEnd.y);
          return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
        }
        return null;
      case "text" /* Text */:
        if (action.text && action.textPos) {
          const fontSize = action.fontSize || 16;
          const fontFamily = action.fontFamily || "sans-serif";
          const textWidth = action.textWidth ?? DEFAULT_TEXT_BOX_WIDTH;
          const layout2 = this.measureWrappedText(action.text, textWidth, fontSize, fontFamily);
          return {
            x: action.textPos.x,
            y: action.textPos.y - fontSize,
            width: textWidth,
            height: layout2.height
          };
        }
        return null;
    }
    return null;
  }
  drawArrow(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.hypot(dx, dy);
    if (length === 0) {
      return;
    }
    const unitX = dx / length;
    const unitY = dy / length;
    const normalX = -unitY;
    const normalY = unitX;
    const lineWidth = this.ctx.lineWidth;
    const headLength = Math.min(Math.max(12 * this.scale, lineWidth * 3), length);
    const headWidth = Math.max(10 * this.scale, lineWidth * 2.5);
    const baseX = toX - unitX * headLength;
    const baseY = toY - unitY * headLength;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(baseX, baseY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(baseX + normalX * headWidth / 2, baseY + normalY * headWidth / 2);
    this.ctx.lineTo(baseX - normalX * headWidth / 2, baseY - normalY * headWidth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = this.ctx.strokeStyle;
    this.ctx.fill();
  }
  flushPendingZoom() {
    const pending = this.pendingZoom;
    this.pendingZoom = null;
    if (!pending) {
      return;
    }
    const minScale = this.getFitScale();
    const maxScale = 8;
    const desiredScale = this.scale * pending.factor;
    const newScale = Math.max(minScale, Math.min(maxScale, desiredScale));
    if (newScale === this.scale) {
      return;
    }
    const halfImgW = this.imageWidth * this.scale / 2;
    const halfImgH = this.imageHeight * this.scale / 2;
    const anchorCx = this.panX + Math.max(-halfImgW, Math.min(halfImgW, pending.cx - this.panX));
    const anchorCy = this.panY + Math.max(-halfImgH, Math.min(halfImgH, pending.cy - this.panY));
    const r2 = newScale / this.scale;
    this.panX = anchorCx * (1 - r2) + this.panX * r2;
    this.panY = anchorCy * (1 - r2) + this.panY * r2;
    this.scale = newScale;
    this.hasUserZoomed = true;
    if (newScale === minScale) {
      this.panX = 0;
      this.panY = 0;
    }
    this.sizeCanvas();
    this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px)`;
    this.redraw();
  }
  getFitScale() {
    const container2 = this.canvas.parentElement;
    if (!container2 || !this.imageWidth || !this.imageHeight) {
      return 1;
    }
    const maxWidth = Math.max(1, container2.clientWidth - CANVAS_BREATHING_ROOM * 2);
    const maxHeight = Math.max(1, container2.clientHeight - CANVAS_BREATHING_ROOM * 2);
    return Math.min(maxWidth / this.imageWidth, maxHeight / this.imageHeight, 1);
  }
  clampPan() {
    const container2 = this.canvas.parentElement;
    if (!container2) {
      return;
    }
    const imgW = this.imageWidth * this.scale;
    const imgH = this.imageHeight * this.scale;
    const cW = container2.clientWidth;
    const cH = container2.clientHeight;
    const maxPanX = Math.abs(cW - imgW) / 2;
    const maxPanY = Math.abs(cH - imgH) / 2;
    this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
    this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
  }
  compositeToDataUrl() {
    const finalCanvas = mainWindow.document.createElement("canvas");
    finalCanvas.width = this.imageWidth;
    finalCanvas.height = this.imageHeight;
    const ctx = finalCanvas.getContext("2d");
    if (this.imageElement) {
      ctx.drawImage(this.imageElement, 0, 0, this.imageWidth, this.imageHeight);
    }
    const savedScale = this.scale;
    this.scale = 1;
    const savedCtx = this.ctx;
    this.ctx = ctx;
    const offX = this.currentCrop?.x ?? 0;
    const offY = this.currentCrop?.y ?? 0;
    ctx.save();
    ctx.translate(-offX, -offY);
    for (const action of this.actions) {
      this.drawAction(action);
    }
    ctx.restore();
    this.ctx = savedCtx;
    this.scale = savedScale;
    return finalCanvas.toDataURL("image/png");
  }
  dispose() {
    if (this.pendingZoomRaf) {
      getWindow(this.canvas).cancelAnimationFrame(this.pendingZoomRaf);
      this.pendingZoomRaf = 0;
      this.pendingZoom = null;
    }
    this.cancelTextPlacement();
    this.cleanupTextEditor();
    this.container.remove();
    this.toolOptionsDisposables.dispose();
    this.disposables.dispose();
    this._onDidSave.dispose();
    this._onDidCancel.dispose();
  }
};
export { cloneDrawAction, cloneMoveSnapshot, captureMoveSnapshot, applyMoveSnapshot, moveSnapshotsEqual, COLORS, LIGHT_SWATCH_COLORS, FONT_FAMILIES, DEFAULT_TEXT_BOX_WIDTH, MIN_TEXT_BOX_WIDTH, TEXT_DRAG_THRESHOLD, CANVAS_BREATHING_ROOM, FILL_COLORS, STROKE_WIDTHS, TEXT_SIZES, ScreenshotAnnotationEditor };
