// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/contextview/browser/contextMenuHandler.ts
import { $, EventType, addDisposableListener, getActiveElement, getWindow, isAncestor, isHTMLElement } from "./module-0075.mjs";
import { DisposableStore, combinedDisposable } from "./module-0012.mjs";
import { ActionRunner } from "./module-0082.mjs";
import { Menu } from "./module-3867.mjs";
import { defaultMenuStyles } from "./module-0513.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { isCancellationError } from "./module-0004.mjs";


// src/vs/platform/contextview/browser/contextMenuHandler.ts
var ContextMenuHandler = class {
  constructor(contextViewService, telemetryService, notificationService, keybindingService) {
    this.contextViewService = contextViewService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.keybindingService = keybindingService;
    this.focusToReturn = null;
    this.lastContainer = null;
    this.block = null;
    this.blockDisposable = null;
    this.options = { blockMouse: true };
  }
  configure(options3) {
    this.options = options3;
  }
  showContextMenu(delegate) {
    const actions = delegate.getActions();
    if (!actions.length) {
      return;
    }
    this.focusToReturn = getActiveElement();
    let menu;
    const shadowRootElement = isHTMLElement(delegate.domForShadowRoot) ? delegate.domForShadowRoot : void 0;
    this.contextViewService.showContextView({
      getAnchor: () => delegate.getAnchor(),
      canRelayout: false,
      anchorAlignment: delegate.anchorAlignment,
      anchorAxisAlignment: delegate.anchorAxisAlignment,
      closeAnimation: delegate.closeAnimation,
      layer: delegate.layer,
      render: (container2) => {
        this.lastContainer = container2;
        const className2 = delegate.getMenuClassName ? delegate.getMenuClassName() : "";
        if (className2) {
          container2.className += " " + className2;
        }
        if (this.options.blockMouse) {
          this.block = container2.appendChild($(".context-view-block"));
          this.block.style.position = "fixed";
          this.block.style.cursor = "initial";
          this.block.style.left = "0";
          this.block.style.top = "0";
          this.block.style.width = "100%";
          this.block.style.height = "100%";
          this.block.style.zIndex = "-1";
          this.blockDisposable?.dispose();
          this.blockDisposable = addDisposableListener(this.block, EventType.MOUSE_DOWN, (e4) => e4.stopPropagation());
        }
        const menuDisposables = new DisposableStore();
        const actionRunner = delegate.actionRunner || menuDisposables.add(new ActionRunner());
        actionRunner.onWillRun((evt) => this.onActionRun(evt, !delegate.skipTelemetry), this, menuDisposables);
        actionRunner.onDidRun(this.onDidActionRun, this, menuDisposables);
        menu = new Menu(
          container2,
          actions,
          {
            actionViewItemProvider: delegate.getActionViewItem,
            context: delegate.getActionsContext ? delegate.getActionsContext() : null,
            actionRunner,
            getKeyBinding: delegate.getKeyBinding ? delegate.getKeyBinding : (action) => this.keybindingService.lookupKeybinding(action.id)
          },
          defaultMenuStyles
        );
        menu.onDidCancel(() => this.contextViewService.hideContextView(true), null, menuDisposables);
        menu.onDidBlur(() => this.contextViewService.hideContextView(true), null, menuDisposables);
        const targetWindow = getWindow(container2);
        menuDisposables.add(addDisposableListener(targetWindow, EventType.BLUR, () => this.contextViewService.hideContextView(true)));
        menuDisposables.add(addDisposableListener(targetWindow, EventType.MOUSE_DOWN, (e4) => {
          if (e4.defaultPrevented) {
            return;
          }
          const event = new StandardMouseEvent(targetWindow, e4);
          let element = event.target;
          if (event.rightButton) {
            return;
          }
          while (element) {
            if (element === container2) {
              return;
            }
            element = element.parentElement;
          }
          this.contextViewService.hideContextView(true);
        }));
        return combinedDisposable(menuDisposables, menu);
      },
      focus: () => {
        menu?.focus(!!delegate.autoSelectFirstItem);
      },
      onHide: (didCancel) => {
        delegate.onHide?.(!!didCancel);
        if (this.block) {
          this.block.remove();
          this.block = null;
        }
        this.blockDisposable?.dispose();
        this.blockDisposable = null;
        if (!!this.lastContainer && (getActiveElement() === this.lastContainer || isAncestor(getActiveElement(), this.lastContainer))) {
          this.focusToReturn?.focus();
        }
        this.lastContainer = null;
      }
    }, shadowRootElement, !!shadowRootElement, delegate.useWindowContainerForShadowRoot);
  }
  onActionRun(e4, logTelemetry) {
    if (logTelemetry) {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: e4.action.id, from: "contextMenu" });
    }
    this.contextViewService.hideContextView(false);
  }
  onDidActionRun(e4) {
    if (e4.error && !isCancellationError(e4.error)) {
      this.notificationService.error(e4.error);
    }
  }
};
export { ContextMenuHandler };
