// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/actions/common/menuService.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IStorageService } from "./module-0512.mjs";
import { DebounceEmitter, Emitter } from "./module-0017.mjs";
import { removeFastWithoutKeepingOrder } from "./module-0007.mjs";
import { MenuItemAction, MenuRegistry, SubmenuItemAction, isIMenuItem, isISubmenuItem } from "./module-0092.mjs";
import { Separator, toAction } from "./module-0082.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/actions/common/menuService.ts
var MenuService = class extends Disposable {
  constructor(_commandService, _keybindingService, storageService) {
    super();
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._hiddenStates = this._register(new PersistedMenuHideState(storageService));
  }
  createMenu(id2, contextKeyService, options3) {
    return new MenuImpl(id2, this._hiddenStates, { emitEventsForSubmenuChanges: false, eventDebounceDelay: 50, ...options3 }, this._commandService, this._keybindingService, contextKeyService);
  }
  getMenuActions(id2, contextKeyService, options3) {
    const menu = new MenuImpl(id2, this._hiddenStates, { emitEventsForSubmenuChanges: false, eventDebounceDelay: 50, ...options3 }, this._commandService, this._keybindingService, contextKeyService);
    const actions = menu.getActions(options3);
    menu.dispose();
    return actions;
  }
  getMenuContexts(id2) {
    const menuInfo = new MenuInfoSnapshot(id2, false);
    return /* @__PURE__ */ new Set([...menuInfo.structureContextKeys, ...menuInfo.preconditionContextKeys, ...menuInfo.toggledContextKeys]);
  }
  resetHiddenStates(ids) {
    this._hiddenStates.reset(ids);
  }
};

MenuService = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IStorageService)
], MenuService);

var PersistedMenuHideState = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    this._disposables = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._ignoreChangeEvent = false;
    this._hiddenByDefaultCache = /* @__PURE__ */ new Map();
    try {
      const raw = _storageService.get(PersistedMenuHideState._key, 0 /* PROFILE */, "{}");
      this._data = JSON.parse(raw);
    } catch (err) {
      this._data = /* @__PURE__ */ Object.create(null);
    }
    this._disposables.add(_storageService.onDidChangeValue(0 /* PROFILE */, PersistedMenuHideState._key, this._disposables)(() => {
      if (!this._ignoreChangeEvent) {
        try {
          const raw = _storageService.get(PersistedMenuHideState._key, 0 /* PROFILE */, "{}");
          this._data = JSON.parse(raw);
        } catch (err) {
          console.log("FAILED to read storage after UPDATE", err);
        }
      }
      this._onDidChange.fire();
    }));
  }
  static {
    this._key = "menu.hiddenCommands";
  }
  dispose() {
    this._onDidChange.dispose();
    this._disposables.dispose();
  }
  _isHiddenByDefault(menu, commandId) {
    return this._hiddenByDefaultCache.get(`${menu.id}/${commandId}`) ?? false;
  }
  setDefaultState(menu, commandId, hidden) {
    this._hiddenByDefaultCache.set(`${menu.id}/${commandId}`, hidden);
  }
  isHidden(menu, commandId) {
    const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
    const state = this._data[menu.id]?.includes(commandId) ?? false;
    return hiddenByDefault ? !state : state;
  }
  updateHidden(menu, commandId, hidden) {
    const hiddenByDefault = this._isHiddenByDefault(menu, commandId);
    if (hiddenByDefault) {
      hidden = !hidden;
    }
    const entries2 = this._data[menu.id];
    if (!hidden) {
      if (entries2) {
        const idx = entries2.indexOf(commandId);
        if (idx >= 0) {
          removeFastWithoutKeepingOrder(entries2, idx);
        }
        if (entries2.length === 0) {
          delete this._data[menu.id];
        }
      }
    } else {
      if (!entries2) {
        this._data[menu.id] = [commandId];
      } else {
        const idx = entries2.indexOf(commandId);
        if (idx < 0) {
          entries2.push(commandId);
        }
      }
    }
    this._persist();
  }
  reset(menus) {
    if (menus === void 0) {
      this._data = /* @__PURE__ */ Object.create(null);
      this._persist();
    } else {
      for (const { id: id2 } of menus) {
        if (this._data[id2]) {
          delete this._data[id2];
        }
      }
      this._persist();
    }
  }
  _persist() {
    try {
      this._ignoreChangeEvent = true;
      const raw = JSON.stringify(this._data);
      this._storageService.store(PersistedMenuHideState._key, raw, 0 /* PROFILE */, 0 /* USER */);
    } finally {
      this._ignoreChangeEvent = false;
    }
  }
};

PersistedMenuHideState = __decorateClass([
  __decorateParam(0, IStorageService)
], PersistedMenuHideState);

var MenuInfoSnapshot = class _MenuInfoSnapshot {
  constructor(_id, _collectContextKeysForSubmenus) {
    this._id = _id;
    this._collectContextKeysForSubmenus = _collectContextKeysForSubmenus;
    this._menuGroups = [];
    this._allMenuIds = /* @__PURE__ */ new Set();
    this._structureContextKeys = /* @__PURE__ */ new Set();
    this._preconditionContextKeys = /* @__PURE__ */ new Set();
    this._toggledContextKeys = /* @__PURE__ */ new Set();
    this.refresh();
  }
  get allMenuIds() {
    return this._allMenuIds;
  }
  get structureContextKeys() {
    return this._structureContextKeys;
  }
  get preconditionContextKeys() {
    return this._preconditionContextKeys;
  }
  get toggledContextKeys() {
    return this._toggledContextKeys;
  }
  refresh() {
    this._menuGroups.length = 0;
    this._allMenuIds.clear();
    this._structureContextKeys.clear();
    this._preconditionContextKeys.clear();
    this._toggledContextKeys.clear();
    const menuItems = this._sort(MenuRegistry.getMenuItems(this._id));
    let group2;
    for (const item of menuItems) {
      const groupName = item.group || "";
      if (!group2 || group2[0] !== groupName) {
        group2 = [groupName, []];
        this._menuGroups.push(group2);
      }
      group2[1].push(item);
      this._collectContextKeysAndSubmenuIds(item);
    }
    this._allMenuIds.add(this._id);
  }
  _sort(menuItems) {
    return menuItems;
  }
  _collectContextKeysAndSubmenuIds(item) {
    _MenuInfoSnapshot._fillInKbExprKeys(item.when, this._structureContextKeys);
    if (isIMenuItem(item)) {
      if (item.command.precondition) {
        _MenuInfoSnapshot._fillInKbExprKeys(item.command.precondition, this._preconditionContextKeys);
      }
      if (item.command.toggled) {
        const toggledExpression = item.command.toggled.condition || item.command.toggled;
        _MenuInfoSnapshot._fillInKbExprKeys(toggledExpression, this._toggledContextKeys);
      }
    } else if (this._collectContextKeysForSubmenus) {
      MenuRegistry.getMenuItems(item.submenu).forEach(this._collectContextKeysAndSubmenuIds, this);
      this._allMenuIds.add(item.submenu);
    }
  }
  static _fillInKbExprKeys(exp, set) {
    if (exp) {
      for (const key3 of exp.keys()) {
        set.add(key3);
      }
    }
  }
};

var MenuInfo = class extends MenuInfoSnapshot {
  constructor(_id, _hiddenStates, _collectContextKeysForSubmenus, _commandService, _keybindingService, _contextKeyService) {
    super(_id, _collectContextKeysForSubmenus);
    this._hiddenStates = _hiddenStates;
    this._commandService = _commandService;
    this._keybindingService = _keybindingService;
    this._contextKeyService = _contextKeyService;
    this.refresh();
  }
  createActionGroups(options3) {
    const result = [];
    for (const group2 of this._menuGroups) {
      const [id2, items] = group2;
      let activeActions;
      for (const item of items) {
        if (this._contextKeyService.contextMatchesRules(item.when)) {
          const isMenuItem = isIMenuItem(item);
          if (isMenuItem) {
            this._hiddenStates.setDefaultState(this._id, item.command.id, !!item.isHiddenByDefault);
          }
          const menuHide = createMenuHide(this._id, isMenuItem ? item.command : item, this._hiddenStates);
          if (isMenuItem) {
            const menuKeybinding = createConfigureKeybindingAction(this._commandService, this._keybindingService, item.command.id, item.when);
            (activeActions ??= []).push(new MenuItemAction(item.command, item.alt, options3, menuHide, menuKeybinding, this._contextKeyService, this._commandService));
          } else {
            const groups = new MenuInfo(item.submenu, this._hiddenStates, this._collectContextKeysForSubmenus, this._commandService, this._keybindingService, this._contextKeyService).createActionGroups(options3);
            const submenuActions = Separator.join(...groups.map((g) => g[1]));
            if (submenuActions.length > 0) {
              (activeActions ??= []).push(new SubmenuItemAction(item, menuHide, submenuActions));
            }
          }
        }
      }
      if (activeActions && activeActions.length > 0) {
        result.push([id2, activeActions]);
      }
    }
    return result;
  }
  _sort(menuItems) {
    return menuItems.sort(MenuInfo._compareMenuItems);
  }
  static _compareMenuItems(a, b) {
    const aGroup = a.group;
    const bGroup = b.group;
    if (aGroup !== bGroup) {
      if (!aGroup) {
        return 1;
      } else if (!bGroup) {
        return -1;
      }
      if (aGroup === "navigation") {
        return -1;
      } else if (bGroup === "navigation") {
        return 1;
      }
      const value2 = aGroup.localeCompare(bGroup);
      if (value2 !== 0) {
        return value2;
      }
    }
    const aPrio = a.order || 0;
    const bPrio = b.order || 0;
    if (aPrio < bPrio) {
      return -1;
    } else if (aPrio > bPrio) {
      return 1;
    }
    return MenuInfo._compareTitles(
      isIMenuItem(a) ? a.command.title : a.title,
      isIMenuItem(b) ? b.command.title : b.title
    );
  }
  static _compareTitles(a, b) {
    const aStr = typeof a === "string" ? a : a.original;
    const bStr = typeof b === "string" ? b : b.original;
    return aStr.localeCompare(bStr);
  }
};

MenuInfo = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], MenuInfo);

var MenuImpl = class {
  constructor(id2, hiddenStates, options3, commandService, keybindingService, contextKeyService) {
    this._disposables = new DisposableStore();
    this._menuInfo = new MenuInfo(id2, hiddenStates, options3.emitEventsForSubmenuChanges, commandService, keybindingService, contextKeyService);
    const rebuildMenuSoon = new RunOnceScheduler(() => {
      this._menuInfo.refresh();
      this._onDidChange.fire({ menu: this, isStructuralChange: true, isEnablementChange: true, isToggleChange: true });
    }, options3.eventDebounceDelay);
    this._disposables.add(rebuildMenuSoon);
    this._disposables.add(MenuRegistry.onDidChangeMenu((e) => {
      for (const id3 of this._menuInfo.allMenuIds) {
        if (e.has(id3)) {
          rebuildMenuSoon.schedule();
          break;
        }
      }
    }));
    const lazyListener = this._disposables.add(new DisposableStore());
    const merge4 = (events) => {
      let isStructuralChange = false;
      let isEnablementChange = false;
      let isToggleChange = false;
      for (const item of events) {
        isStructuralChange = isStructuralChange || item.isStructuralChange;
        isEnablementChange = isEnablementChange || item.isEnablementChange;
        isToggleChange = isToggleChange || item.isToggleChange;
        if (isStructuralChange && isEnablementChange && isToggleChange) {
          break;
        }
      }
      return { menu: this, isStructuralChange, isEnablementChange, isToggleChange };
    };
    const startLazyListener = () => {
      lazyListener.add(contextKeyService.onDidChangeContext((e) => {
        const isStructuralChange = e.affectsSome(this._menuInfo.structureContextKeys);
        const isEnablementChange = e.affectsSome(this._menuInfo.preconditionContextKeys);
        const isToggleChange = e.affectsSome(this._menuInfo.toggledContextKeys);
        if (isStructuralChange || isEnablementChange || isToggleChange) {
          this._onDidChange.fire({ menu: this, isStructuralChange, isEnablementChange, isToggleChange });
        }
      }));
      lazyListener.add(hiddenStates.onDidChange((e) => {
        this._onDidChange.fire({ menu: this, isStructuralChange: true, isEnablementChange: false, isToggleChange: false });
      }));
    };
    this._onDidChange = new DebounceEmitter({
      // start/stop context key listener
      onWillAddFirstListener: startLazyListener,
      onDidRemoveLastListener: lazyListener.clear.bind(lazyListener),
      delay: options3.eventDebounceDelay,
      merge: merge4
    });
    this.onDidChange = this._onDidChange.event;
  }
  getActions(options3) {
    return this._menuInfo.createActionGroups(options3);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
  }
};

MenuImpl = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextKeyService)
], MenuImpl);

function createMenuHide(menu, command4, states) {
  const id2 = isISubmenuItem(command4) ? command4.submenu.id : command4.id;
  const title = typeof command4.title === "string" ? command4.title : command4.title.value;
  const hide4 = toAction({
    id: `hide/${menu.id}/${id2}`,
    label: localize(1844, null, title),
    run() {
      states.updateHidden(menu, id2, true);
    }
  });
  const toggle = toAction({
    id: `toggle/${menu.id}/${id2}`,
    label: title,
    get checked() {
      return !states.isHidden(menu, id2);
    },
    run() {
      states.updateHidden(menu, id2, !!this.checked);
    }
  });
  return {
    hide: hide4,
    toggle,
    get isHidden() {
      return !toggle.checked;
    }
  };
}

function createConfigureKeybindingAction(commandService, keybindingService, commandId, when = void 0, enabled = true) {
  return toAction({
    id: `configureKeybinding/${commandId}`,
    label: localize(1843, null),
    enabled,
    run() {
      const hasKeybinding = !!keybindingService.lookupKeybinding(commandId);
      const whenValue = !hasKeybinding && when ? when.serialize() : void 0;
      commandService.executeCommand("workbench.action.openGlobalKeybindings", `@command:${commandId}` + (whenValue ? ` +when:${whenValue}` : ""));
    }
  });
}
export { createMenuHide, createConfigureKeybindingAction, MenuService, PersistedMenuHideState, MenuInfoSnapshot, MenuInfo, MenuImpl };
