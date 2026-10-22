// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/chatGroupDropTarget.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, DragAndDropObserver, EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { toDisposable } from "./module-0012.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { getSessionChatDragData } from "./module-3488.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/browser/parts/chatGroupDropTarget.ts
var EDGE_THRESHOLD = 0.25;

var ChatGroupDropOverlay = class extends Themable {
  constructor(targetGroupId, _targetElement, _onDrop, _isChatDrag, themeService) {
    super(themeService);
    this.targetGroupId = targetGroupId;
    this._targetElement = _targetElement;
    this._onDrop = _onDrop;
    this._isChatDrag = _isChatDrag;
    this._disposed = false;
    this._cleanupOverlayScheduler = this._register(new RunOnceScheduler(() => this.dispose(), 300));
    this._create();
  }
  static {
    this.OVERLAY_ID = "monaco-workbench-chat-group-drop-overlay";
  }
  get disposed() {
    return this._disposed;
  }
  _create() {
    const container2 = this._container = $("div", { id: ChatGroupDropOverlay.OVERLAY_ID });
    this._targetElement.appendChild(container2);
    this._targetElement.classList.add("chat-group-dragged-over");
    this._register(toDisposable(() => {
      container2.remove();
      this._targetElement.classList.remove("chat-group-dragged-over");
    }));
    this._overlay = $(".chat-group-drop-overlay-indicator");
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
        if (!this._isChatDrag(e4)) {
          this._hideOverlay();
          return;
        }
        this._positionOverlay(e4.offsetX, e4.offsetY);
        if (this._cleanupOverlayScheduler.isScheduled()) {
          this._cleanupOverlayScheduler.cancel();
        }
      },
      onDragLeave: () => this.dispose(),
      onDragEnd: () => this.dispose(),
      onDrop: (e4) => {
        EventHelper.stop(e4, true);
        const zone = this._currentZone;
        const data = getSessionChatDragData(e4);
        this.dispose();
        if (zone) {
          this._onDrop(this.targetGroupId, zone, data);
        }
      }
    }));
    this._register(addDisposableListener(container2, EventType.MOUSE_OVER, () => {
      if (!this._cleanupOverlayScheduler.isScheduled()) {
        this._cleanupOverlayScheduler.schedule();
      }
    }));
  }
  _positionOverlay(mousePosX, mousePosY) {
    const width2 = this._targetElement.clientWidth;
    const height = this._targetElement.clientHeight;
    const zone = this._computeZone(mousePosX, mousePosY, width2, height);
    switch (zone) {
      case "left":
        this._doPositionOverlay({ left: "0", top: "0", width: "50%", height: "100%" });
        break;
      case "right":
        this._doPositionOverlay({ left: "50%", top: "0", width: "50%", height: "100%" });
        break;
      case "top":
        this._doPositionOverlay({ left: "0", top: "0", width: "100%", height: "50%" });
        break;
      case "bottom":
        this._doPositionOverlay({ left: "0", top: "50%", width: "100%", height: "50%" });
        break;
      case "center":
        this._doPositionOverlay({ left: "0", top: "0", width: "100%", height: "100%" });
        break;
    }
    const overlay = assertReturnsDefined(this._overlay);
    overlay.style.opacity = "1";
    this._currentZone = zone;
  }
  _computeZone(x, y, width2, height) {
    const edgeX = width2 * EDGE_THRESHOLD;
    const edgeY = height * EDGE_THRESHOLD;
    const distLeft = x;
    const distRight = width2 - x;
    const distTop = y;
    const distBottom = height - y;
    const inLeft = distLeft <= edgeX;
    const inRight = distRight <= edgeX;
    const inTop = distTop <= edgeY;
    const inBottom = distBottom <= edgeY;
    if (!inLeft && !inRight && !inTop && !inBottom) {
      return "center";
    }
    const candidates = [];
    if (inLeft) {
      candidates.push({ zone: "left", ratio: distLeft / edgeX });
    }
    if (inRight) {
      candidates.push({ zone: "right", ratio: distRight / edgeX });
    }
    if (inTop) {
      candidates.push({ zone: "top", ratio: distTop / edgeY });
    }
    if (inBottom) {
      candidates.push({ zone: "bottom", ratio: distBottom / edgeY });
    }
    candidates.sort((a, b) => a.ratio - b.ratio);
    return candidates[0].zone;
  }
  _doPositionOverlay(options3) {
    const container2 = assertReturnsDefined(this._container);
    const overlay = assertReturnsDefined(this._overlay);
    container2.style.height = "100%";
    overlay.style.left = options3.left;
    overlay.style.top = options3.top;
    overlay.style.width = options3.width;
    overlay.style.height = options3.height;
  }
  _hideOverlay() {
    const overlay = assertReturnsDefined(this._overlay);
    this._doPositionOverlay({ left: "0", top: "0", width: "100%", height: "100%" });
    overlay.style.opacity = "0";
    this._currentZone = void 0;
  }
  contains(element) {
    return element === this._container || element === this._overlay;
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};

ChatGroupDropOverlay = __decorateClass([
  __decorateParam(4, IThemeService)
], ChatGroupDropOverlay);

var ChatGroupDropTarget = class extends Themable {
  constructor(_container, _delegate2, themeService, _instantiationService) {
    super(themeService);
    this._container = _container;
    this._delegate = _delegate2;
    this._instantiationService = _instantiationService;
    this._counter = 0;
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
    if (!this._delegate.isChatDrag(event)) {
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
    const targetGroup = this._delegate.findTargetGroup(target);
    if (!targetGroup) {
      return;
    }
    this._overlay = this._instantiationService.createInstance(
      ChatGroupDropOverlay,
      targetGroup.id,
      targetGroup.element,
      (groupId, zone, data) => this._delegate.onChatDrop(groupId, zone, data),
      (event2) => this._delegate.isChatDrag(event2)
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
    this._container.classList.toggle("chat-groups-dragged-over", isDraggedOver);
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

ChatGroupDropTarget = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService)
], ChatGroupDropTarget);
export { EDGE_THRESHOLD, ChatGroupDropOverlay, ChatGroupDropTarget };
