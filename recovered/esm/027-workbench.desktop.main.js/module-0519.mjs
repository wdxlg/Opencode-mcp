// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/browser/toolbar.ts
import { ToggleMenuAction, ToolBar } from "./module-0503.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { IMenuService, MenuItemAction, SubmenuItemAction } from "./module-0092.mjs";
import { intersection } from "./module-0003.mjs";
import { Iterable } from "./module-0011.mjs";
import { coalesceInPlace } from "./module-0007.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { createConfigureKeybindingAction } from "./module-0517.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { createActionViewItem, getActionBarActions } from "./module-0516.mjs";
import { Emitter } from "./module-0017.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/actions/browser/toolbar.ts
var WorkbenchToolBar = class extends ToolBar {
  constructor(container3, _options, _menuService, _contextKeyService, _contextMenuService, _keybindingService, _commandService, telemetryService) {
    super(container3, _contextMenuService, {
      // defaults
      getKeyBinding: (action) => _keybindingService.lookupKeybinding(action.id) ?? void 0,
      // options (override defaults)
      ..._options,
      // mandatory (overide options)
      allowContextMenu: true,
      skipTelemetry: typeof _options?.telemetrySource === "string"
    });
    this._options = _options;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._commandService = _commandService;
    this._sessionDisposables = this._store.add(new DisposableStore());
    const telemetrySource = _options?.telemetrySource;
    if (telemetrySource) {
      this._store.add(this.actionBar.onDidRun(
        (e) => telemetryService.publicLog2(
          "workbenchActionExecuted",
          { id: e.action.id, from: telemetrySource }
        )
      ));
    }
  }
  setActions(_primary, _secondary = [], menuIds) {
    this._sessionDisposables.clear();
    const primary = _primary.slice();
    const secondary = _secondary.slice();
    const toggleActions = [];
    let toggleActionsCheckedCount = 0;
    const extraSecondary = [];
    let someAreHidden = false;
    if (this._options?.hiddenItemStrategy !== -1 /* NoHide */) {
      for (let i2 = 0; i2 < primary.length; i2++) {
        const action = primary[i2];
        if (action instanceof Separator) {
          extraSecondary[i2] = action;
          continue;
        }
        if (!(action instanceof MenuItemAction) && !(action instanceof SubmenuItemAction)) {
          continue;
        }
        if (!action.hideActions) {
          continue;
        }
        toggleActions.push(action.hideActions.toggle);
        if (action.hideActions.toggle.checked) {
          toggleActionsCheckedCount++;
        }
        if (action.hideActions.isHidden) {
          someAreHidden = true;
          primary[i2] = void 0;
          if (this._options?.hiddenItemStrategy !== 0 /* Ignore */) {
            extraSecondary[i2] = action;
          }
        }
      }
    }
    if (this._options?.overflowBehavior !== void 0) {
      const exemptedIds = intersection(new Set(this._options.overflowBehavior.exempted), Iterable.map(primary, (a) => a?.id));
      const maxItems = this._options.overflowBehavior.maxItems - exemptedIds.size;
      let count2 = 0;
      for (let i2 = 0; i2 < primary.length; i2++) {
        const action = primary[i2];
        if (!action) {
          continue;
        }
        count2++;
        if (exemptedIds.has(action.id)) {
          continue;
        }
        if (count2 >= maxItems) {
          primary[i2] = void 0;
          extraSecondary[i2] = action;
        }
      }
    }
    coalesceInPlace(primary);
    coalesceInPlace(extraSecondary);
    super.setActions(Separator.clean(primary), Separator.join(Separator.clean(extraSecondary), secondary));
    if (toggleActions.length > 0 || primary.length > 0) {
      this._sessionDisposables.add(addDisposableListener(this.getElement(), "contextmenu", (e) => {
        const event = new StandardMouseEvent(getWindow(this.getElement()), e);
        const action = this.getItemAction(event.target);
        if (!action) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        const primaryActions = [];
        if (action instanceof MenuItemAction && action.menuKeybinding) {
          primaryActions.push(action.menuKeybinding);
        } else if (!(action instanceof SubmenuItemAction || action instanceof ToggleMenuAction)) {
          const supportsKeybindings = !!this._keybindingService.lookupKeybinding(action.id);
          primaryActions.push(createConfigureKeybindingAction(this._commandService, this._keybindingService, action.id, void 0, supportsKeybindings));
        }
        if (toggleActions.length > 0) {
          let noHide = false;
          if (toggleActionsCheckedCount === 1 && this._options?.hiddenItemStrategy === 0 /* Ignore */) {
            noHide = true;
            for (let i2 = 0; i2 < toggleActions.length; i2++) {
              if (toggleActions[i2].checked) {
                toggleActions[i2] = toAction({
                  id: action.id,
                  label: action.label,
                  checked: true,
                  enabled: false,
                  run() {
                  }
                });
                break;
              }
            }
          }
          if (!noHide && (action instanceof MenuItemAction || action instanceof SubmenuItemAction)) {
            if (!action.hideActions) {
              return;
            }
            primaryActions.push(action.hideActions.hide);
          } else {
            primaryActions.push(toAction({
              id: "label",
              label: localize(1840, null),
              enabled: false,
              run() {
              }
            }));
          }
        }
        const actions = Separator.join(primaryActions, toggleActions);
        if (this._options?.resetMenu && !menuIds) {
          menuIds = [this._options.resetMenu];
        }
        if (someAreHidden && menuIds) {
          actions.push(new Separator());
          actions.push(toAction({
            id: "resetThisMenu",
            label: localize(1841, null),
            run: () => this._menuService.resetHiddenStates(menuIds)
          }));
        }
        if (actions.length === 0) {
          return;
        }
        this._contextMenuService.showContextMenu({
          getAnchor: () => event,
          getActions: () => actions,
          // add context menu actions (iff appicable)
          menuId: this._options?.contextMenu,
          menuActionOptions: { renderShortTitle: true, ...this._options?.menuOptions },
          skipTelemetry: typeof this._options?.telemetrySource === "string",
          contextKeyService: this._contextKeyService
        });
      }));
    }
  }
};

WorkbenchToolBar = __decorateClass([
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, ITelemetryService)
], WorkbenchToolBar);

var MenuWorkbenchToolBar = class extends WorkbenchToolBar {
  constructor(container3, menuId, options3, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService, actionViewService, instantiationService) {
    super(container3, {
      resetMenu: menuId,
      ...options3,
      actionViewItemProvider: (action, opts) => {
        let provider = actionViewService.lookUp(menuId, action instanceof SubmenuItemAction ? action.item.submenu.id : action.id);
        if (!provider) {
          provider = options3?.actionViewItemProvider;
        }
        const viewItem = provider?.(action, opts, instantiationService, getWindow(container3).vscodeWindowId);
        if (viewItem) {
          return viewItem;
        }
        return createActionViewItem(instantiationService, action, opts);
      }
    }, menuService, contextKeyService, contextMenuService, keybindingService, commandService, telemetryService);
    this._onDidChangeMenuItems = this._store.add(new Emitter());
    this._container = container3;
    this._menuOptions = options3?.menuOptions;
    this._toolbarOptions = options3?.toolbarOptions;
    this._menu = this._store.add(menuService.createMenu(menuId, contextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: options3?.eventDebounceDelay }));
    this._store.add(this._menu.onDidChange(() => {
      this._updateToolbar();
      this._onDidChangeMenuItems.fire(this);
    }));
    this._store.add(actionViewService.onDidChange((e) => {
      if (e === menuId) {
        this._updateToolbar();
      }
    }));
    this._updateToolbar();
  }
  get onDidChangeMenuItems() {
    return this._onDidChangeMenuItems.event;
  }
  _updateToolbar() {
    const { primary, secondary } = getActionBarActions(
      this._menu.getActions(this._menuOptions),
      this._toolbarOptions?.primaryGroup,
      this._toolbarOptions?.shouldInlineSubmenu,
      this._toolbarOptions?.useSeparatorsInPrimaryActions
    );
    this._container.classList.toggle("has-no-actions", primary.length === 0 && secondary.length === 0);
    super.setActions(primary, secondary);
  }
  /**
   * Force the toolbar to immediately re-evaluate its menu actions.
   * Use this after synchronously updating context keys to avoid
   * layout shifts caused by the debounced menu change event.
   */
  refresh() {
    this._updateToolbar();
  }
  /**
   * @deprecated The WorkbenchToolBar does not support this method because it works with menus.
   */
  setActions() {
    throw new BugIndicatingError("This toolbar is populated from a menu.");
  }
};

MenuWorkbenchToolBar = __decorateClass([
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IActionViewItemService),
  __decorateParam(10, IInstantiationService)
], MenuWorkbenchToolBar);
export { WorkbenchToolBar, MenuWorkbenchToolBar };
