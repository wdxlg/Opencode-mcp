// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionDropTarget.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { LocalSelectionTransfer } from "./module-0273.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, DragAndDropObserver, EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { toDisposable } from "./module-0012.mjs";
import { assertReturnsAllDefined, assertReturnsDefined } from "./module-0010.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { DraggedSessionIdentifier } from "./module-3488.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/browser/parts/sessionDropTarget.ts
var SessionDropOverlay = class extends Themable {
  constructor(targetSessionId, _targetElement, themeService, _sessionsManagementService, _sessionsService) {
    super(themeService);
    this.targetSessionId = targetSessionId;
    this._targetElement = _targetElement;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._disposed = false;
    this._sessionTransfer = LocalSelectionTransfer.getInstance();
    this._cleanupOverlayScheduler = this._register(new RunOnceScheduler(() => this.dispose(), 300));
    this._create();
  }
  static {
    this.OVERLAY_ID = "monaco-workbench-session-drop-overlay";
  }
  get disposed() {
    return this._disposed;
  }
  _create() {
    const container2 = this._container = $("div", { id: SessionDropOverlay.OVERLAY_ID });
    this._targetElement.appendChild(container2);
    this._targetElement.classList.add("dragged-over");
    this._register(toDisposable(() => {
      container2.remove();
      this._targetElement.classList.remove("dragged-over");
    }));
    this._overlay = $(".session-drop-overlay-indicator");
    container2.appendChild(this._overlay);
    this._registerListeners(container2);
    this.updateStyles();
  }
  updateStyles() {
    const overlay = assertReturnsDefined(this._overlay);
    overlay.style.backgroundColor = this.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND) || "";
    const activeContrastBorderColor = this.getColor(activeContrastBorder);
    overlay.style.outlineColor = activeContrastBorderColor || "";
    overlay.style.outlineOffset = activeContrastBorderColor ? "-2px" : "";
    overlay.style.outlineStyle = activeContrastBorderColor ? "dashed" : "";
    overlay.style.outlineWidth = activeContrastBorderColor ? "2px" : "";
  }
  _registerListeners(container2) {
    this._register(new DragAndDropObserver(container2, {
      onDragOver: (e4) => {
        if (!this._sessionTransfer.hasData(DraggedSessionIdentifier.prototype)) {
          this._hideOverlay();
          return;
        }
        this._positionOverlay(e4.offsetX);
        if (this._cleanupOverlayScheduler.isScheduled()) {
          this._cleanupOverlayScheduler.cancel();
        }
      },
      onDragLeave: () => this.dispose(),
      onDragEnd: () => this.dispose(),
      onDrop: (e4) => {
        EventHelper.stop(e4, true);
        const side = this._currentSide;
        this.dispose();
        if (side) {
          this._handleDrop(side);
        }
      }
    }));
    this._register(addDisposableListener(container2, EventType.MOUSE_OVER, () => {
      if (!this._cleanupOverlayScheduler.isScheduled()) {
        this._cleanupOverlayScheduler.schedule();
      }
    }));
  }
  _handleDrop(side) {
    const data = this._sessionTransfer.getData(DraggedSessionIdentifier.prototype);
    this._sessionTransfer.clearData(DraggedSessionIdentifier.prototype);
    if (!Array.isArray(data) || data.length === 0) {
      return;
    }
    const sessions = [];
    for (const dragged of data) {
      if (dragged.sessionId === this.targetSessionId) {
        continue;
      }
      const session = this._sessionsManagementService.getSession(dragged.resource);
      if (session) {
        sessions.push(session);
      }
    }
    if (sessions.length === 0) {
      return;
    }
    const primary = sessions[0];
    const ordered = side === "right" ? [...sessions].reverse() : sessions;
    for (const session of ordered) {
      this._sessionsService.insertAt(session, this.targetSessionId, side, session === primary);
    }
  }
  _positionOverlay(mousePosX) {
    const width2 = this._targetElement.clientWidth;
    const side = mousePosX < width2 / 2 ? "left" : "right";
    if (side === "left") {
      this._doPositionOverlay({ left: "0", width: "50%" });
    } else {
      this._doPositionOverlay({ left: "50%", width: "50%" });
    }
    const overlay = assertReturnsDefined(this._overlay);
    overlay.style.opacity = "1";
    setTimeout(() => overlay.classList.add("overlay-move-transition"), 0);
    this._currentSide = side;
  }
  _doPositionOverlay(options3) {
    const [container2, overlay] = assertReturnsAllDefined(this._container, this._overlay);
    container2.style.height = "100%";
    overlay.style.top = "0";
    overlay.style.height = "100%";
    overlay.style.left = options3.left;
    overlay.style.width = options3.width;
  }
  _hideOverlay() {
    const overlay = assertReturnsDefined(this._overlay);
    this._doPositionOverlay({ left: "0", width: "100%" });
    overlay.style.opacity = "0";
    overlay.classList.remove("overlay-move-transition");
    this._currentSide = void 0;
  }
  contains(element) {
    return element === this._container || element === this._overlay;
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};

SessionDropOverlay = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, ISessionsManagementService),
  __decorateParam(4, ISessionsService)
], SessionDropOverlay);

var SessionDropTarget = class extends Themable {
  constructor(_container, _delegate2, themeService, _instantiationService) {
    super(themeService);
    this._container = _container;
    this._delegate = _delegate2;
    this._instantiationService = _instantiationService;
    this._counter = 0;
    this._sessionTransfer = LocalSelectionTransfer.getInstance();
    this._registerListeners();
  }
  get overlay() {
    if (this._overlay && !this._overlay.disposed) {
      return this._overlay;
    }
    return void 0;
  }
  _registerListeners() {
    this._register(addDisposableListener(this._container, EventType.DRAG_ENTER, (e4) => this._onDragEnter(e4)));
    this._register(addDisposableListener(this._container, EventType.DRAG_LEAVE, () => this._onDragLeave()));
    for (const target of [this._container, getWindow(this._container)]) {
      this._register(addDisposableListener(target, EventType.DRAG_END, () => this._onDragEnd()));
    }
  }
  _onDragEnter(event) {
    this._counter++;
    if (!this._sessionTransfer.hasData(DraggedSessionIdentifier.prototype)) {
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
      return;
    }
    this._updateContainer(true);
    const target = event.target;
    if (!target) {
      return;
    }
    if (this.overlay && !this.overlay.contains(target)) {
      this._disposeOverlay();
    }
    if (this.overlay) {
      return;
    }
    const targetView = this._delegate.findTargetView(target);
    if (!targetView) {
      return;
    }
    this._overlay = this._instantiationService.createInstance(
      SessionDropOverlay,
      targetView.sessionId,
      targetView.element
    );
  }
  _onDragLeave() {
    this._counter--;
    if (this._counter === 0) {
      this._updateContainer(false);
    }
  }
  _onDragEnd() {
    this._counter = 0;
    this._updateContainer(false);
    this._disposeOverlay();
  }
  _updateContainer(isDraggedOver) {
    this._container.classList.toggle("dragged-over", isDraggedOver);
  }
  dispose() {
    super.dispose();
    this._disposeOverlay();
  }
  _disposeOverlay() {
    if (this._overlay) {
      this._overlay.dispose();
      this._overlay = void 0;
    }
  }
};

SessionDropTarget = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService)
], SessionDropTarget);
export { SessionDropOverlay, SessionDropTarget };
