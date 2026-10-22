// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/contextview/browser/contextMenuService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ContextMenuHandler } from "./module-3933.mjs";
import { ModifierKeyEmitter } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { getFlatContextMenuActions } from "./module-0516.mjs";
import { Separator } from "./module-0082.mjs";


// src/vs/platform/contextview/browser/contextMenuService.ts
var ContextMenuService = class extends Disposable {
  constructor(telemetryService, notificationService, contextViewService, keybindingService, menuService, contextKeyService) {
    super();
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.contextViewService = contextViewService;
    this.keybindingService = keybindingService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this._contextMenuHandler = void 0;
    this._onDidShowContextMenu = this._store.add(new Emitter());
    this.onDidShowContextMenu = this._onDidShowContextMenu.event;
    this._onDidHideContextMenu = this._store.add(new Emitter());
    this.onDidHideContextMenu = this._onDidHideContextMenu.event;
  }
  get contextMenuHandler() {
    if (!this._contextMenuHandler) {
      this._contextMenuHandler = new ContextMenuHandler(this.contextViewService, this.telemetryService, this.notificationService, this.keybindingService);
    }
    return this._contextMenuHandler;
  }
  configure(options3) {
    this.contextMenuHandler.configure(options3);
  }
  // ContextMenu
  showContextMenu(delegate) {
    delegate = ContextMenuMenuDelegate.transform(delegate, this.menuService, this.contextKeyService);
    this.contextMenuHandler.showContextMenu({
      ...delegate,
      onHide: (didCancel) => {
        delegate.onHide?.(didCancel);
        this._onDidHideContextMenu.fire();
      }
    });
    ModifierKeyEmitter.getInstance().resetKeyStatus();
    this._onDidShowContextMenu.fire();
  }
};

ContextMenuService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], ContextMenuService);

var ContextMenuMenuDelegate;

((ContextMenuMenuDelegate2) => {
  function is(thing) {
    return thing && thing.menuId instanceof MenuId;
  }
  function transform2(delegate, menuService, globalContextKeyService) {
    if (!is(delegate)) {
      return delegate;
    }
    const { menuId, menuActionOptions, contextKeyService } = delegate;
    return {
      ...delegate,
      getActions: () => {
        let target = [];
        if (menuId) {
          const menu = menuService.getMenuActions(menuId, contextKeyService ?? globalContextKeyService, menuActionOptions);
          target = getFlatContextMenuActions(menu);
        }
        if (!delegate.getActions) {
          return target;
        } else {
          return Separator.join(delegate.getActions(), target);
        }
      }
    };
  }
  ContextMenuMenuDelegate2.transform = transform2;
})(ContextMenuMenuDelegate || (ContextMenuMenuDelegate = {}));
export { ContextMenuService, ContextMenuMenuDelegate };
