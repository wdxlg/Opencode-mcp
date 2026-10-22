// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/contextmenu/electron-browser/contextmenuService.ts
import { ContextMenuMenuDelegate, ContextMenuService } from "./module-3934.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { ModifierKeyEmitter, getActiveWindow, getDomNodeZoomLevel, getWindow, isHTMLElement } from "./module-0075.mjs";
import { getZoomFactor } from "./module-0018.mjs";
import { isAnchor } from "./module-0471.mjs";
import { popup } from "./module-3932.mjs";
import { coalesce } from "./module-0007.mjs";
import { Separator, SubmenuAction } from "./module-0082.mjs";
import { unmnemonicLabel } from "./module-0711.mjs";
import { stripIcons } from "./module-0461.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/contextmenu/electron-browser/contextmenuService.ts
var ContextMenuService2 = class {
  get onDidShowContextMenu() {
    return this.impl.onDidShowContextMenu;
  }
  get onDidHideContextMenu() {
    return this.impl.onDidHideContextMenu;
  }
  constructor(notificationService, telemetryService, keybindingService, configurationService, contextViewService, menuService, contextKeyService) {
    function createContextMenuService(native) {
      return native ? new NativeContextMenuService(notificationService, telemetryService, keybindingService, menuService, contextKeyService) : new ContextMenuService(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService);
    }
    let isNativeContextMenu = hasNativeContextMenu(configurationService);
    this.impl = createContextMenuService(isNativeContextMenu);
    if (isMacintosh) {
      this.listener = configurationService.onDidChangeConfiguration((e4) => {
        if (!e4.affectsConfiguration("window.menuStyle" /* MenuStyle */)) {
          return;
        }
        const newIsNativeContextMenu = hasNativeContextMenu(configurationService);
        if (newIsNativeContextMenu === isNativeContextMenu) {
          return;
        }
        this.impl.dispose();
        this.impl = createContextMenuService(newIsNativeContextMenu);
        isNativeContextMenu = newIsNativeContextMenu;
      });
    }
  }
  dispose() {
    this.listener?.dispose();
    this.impl.dispose();
  }
  showContextMenu(delegate) {
    this.impl.showContextMenu(delegate);
  }
};

ContextMenuService2 = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, IContextKeyService)
], ContextMenuService2);

var NativeContextMenuService = class extends Disposable {
  constructor(notificationService, telemetryService, keybindingService, menuService, contextKeyService) {
    super();
    this.notificationService = notificationService;
    this.telemetryService = telemetryService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._onDidShowContextMenu = this._store.add(new Emitter());
    this.onDidShowContextMenu = this._onDidShowContextMenu.event;
    this._onDidHideContextMenu = this._store.add(new Emitter());
    this.onDidHideContextMenu = this._onDidHideContextMenu.event;
  }
  showContextMenu(delegate) {
    delegate = ContextMenuMenuDelegate.transform(delegate, this.menuService, this.contextKeyService);
    const actions = delegate.getActions();
    if (actions.length) {
      const onHide = createSingleCallFunction(() => {
        delegate.onHide?.(false);
        ModifierKeyEmitter.getInstance().resetKeyStatus();
        this._onDidHideContextMenu.fire();
      });
      const menu = this.createMenu(delegate, actions, onHide);
      const anchor = delegate.getAnchor();
      let x;
      let y;
      let zoom = getZoomFactor(isHTMLElement(anchor) ? getWindow(anchor) : getActiveWindow());
      if (isHTMLElement(anchor)) {
        const clientRect = anchor.getBoundingClientRect();
        const elementPosition = { left: clientRect.left, top: clientRect.top, width: clientRect.width, height: clientRect.height };
        const win = getWindow(anchor);
        const vw = win.innerWidth;
        const vh = win.innerHeight;
        const isClipped = clientRect.left < 0 || clientRect.top < 0 || clientRect.right > vw || clientRect.bottom > vh;
        zoom *= getDomNodeZoomLevel(anchor);
        if (isClipped) {
          x = Math.min(Math.max(clientRect.right, 0), vw);
          y = Math.min(Math.max(clientRect.bottom, 0), vh);
        } else {
          if (delegate.anchorAxisAlignment === 1 /* HORIZONTAL */) {
            if (delegate.anchorAlignment === 0 /* LEFT */) {
              x = elementPosition.left;
              y = elementPosition.top;
            } else {
              x = elementPosition.left + elementPosition.width;
              y = elementPosition.top;
            }
            if (!isMacintosh) {
              const window2 = getWindow(anchor);
              const availableHeightForMenu = window2.screen.height - y;
              if (availableHeightForMenu < actions.length * (isWindows ? 45 : 32)) {
                y += elementPosition.height;
              }
            }
          } else {
            if (delegate.anchorAlignment === 0 /* LEFT */) {
              x = elementPosition.left;
              y = elementPosition.top + elementPosition.height;
            } else {
              x = elementPosition.left + elementPosition.width;
              y = elementPosition.top + elementPosition.height;
            }
          }
        }
        if (isMacintosh) {
          y += 4 / zoom;
        }
      } else if (isAnchor(anchor)) {
        x = anchor.x;
        y = anchor.y;
      } else {
      }
      if (typeof x === "number") {
        x = Math.floor(x * zoom);
      }
      if (typeof y === "number") {
        y = Math.floor(y * zoom);
      }
      popup(menu, { x, y, positioningItem: delegate.autoSelectFirstItem ? 0 : void 0 }, () => onHide());
      this._onDidShowContextMenu.fire();
    }
  }
  createMenu(delegate, entries2, onHide, submenuIds = /* @__PURE__ */ new Set()) {
    return coalesce(entries2.map((entry) => this.createMenuItem(delegate, entry, onHide, submenuIds)));
  }
  createMenuItem(delegate, entry, onHide, submenuIds) {
    if (entry instanceof Separator) {
      return { type: "separator" };
    }
    if (entry instanceof SubmenuAction) {
      if (submenuIds.has(entry.id)) {
        console.warn(`Found submenu cycle: ${entry.id}`);
        return void 0;
      }
      return {
        label: unmnemonicLabel(stripIcons(entry.label)).trim(),
        submenu: this.createMenu(delegate, entry.actions, onHide, /* @__PURE__ */ new Set([...submenuIds, entry.id]))
      };
    } else {
      let type = void 0;
      if (entry.checked) {
        if (typeof delegate.getCheckedActionsRepresentation === "function") {
          type = delegate.getCheckedActionsRepresentation(entry);
        } else {
          type = "checkbox";
        }
      }
      const item = {
        label: unmnemonicLabel(stripIcons(entry.label)).trim(),
        checked: !!entry.checked,
        type,
        enabled: !!entry.enabled,
        click: (event) => {
          onHide();
          this.runAction(entry, delegate, event);
        }
      };
      const keybinding = delegate.getKeyBinding ? delegate.getKeyBinding(entry) : this.keybindingService.lookupKeybinding(entry.id);
      if (keybinding) {
        const electronAccelerator = keybinding.getElectronAccelerator();
        if (electronAccelerator) {
          item.accelerator = electronAccelerator;
        } else {
          const label3 = keybinding.getLabel();
          if (label3) {
            item.label = `${item.label} [${label3}]`;
          }
        }
      }
      return item;
    }
  }
  async runAction(actionToRun, delegate, event) {
    if (!delegate.skipTelemetry) {
      this.telemetryService.publicLog2("workbenchActionExecuted", { id: actionToRun.id, from: "contextMenu" });
    }
    const context2 = delegate.getActionsContext ? delegate.getActionsContext(event) : void 0;
    try {
      if (delegate.actionRunner) {
        await delegate.actionRunner.run(actionToRun, context2);
      } else if (actionToRun.enabled) {
        await actionToRun.run(context2);
      }
    } catch (error) {
      this.notificationService.error(error);
    }
  }
};

NativeContextMenuService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService)
], NativeContextMenuService);

registerSingleton(IContextMenuService, ContextMenuService2, 1 /* Delayed */);
export { ContextMenuService2, NativeContextMenuService };
