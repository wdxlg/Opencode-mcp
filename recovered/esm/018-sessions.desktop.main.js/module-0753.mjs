// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestWidgetStatus.ts
import { DisposableStore } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { MenuEntryActionViewItem, TextOnlyMenuEntryActionViewItem } from "./module-0516.mjs";
import { ActionBar } from "./module-0477.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/editor/contrib/suggest/browser/suggestWidgetStatus.ts
var SuggestWidgetStatus = class {
  constructor(container2, _menuId, options3, instantiationService, _menuService, _contextKeyService) {
    this._menuId = _menuId;
    this._menuService = _menuService;
    this._contextKeyService = _contextKeyService;
    this._menuDisposables = new DisposableStore();
    this.element = append(container2, $(".suggest-status-bar"));
    const actionViewItemProvider = ((action) => {
      if (options3?.showIconsNoKeybindings) {
        return action instanceof MenuItemAction ? instantiationService.createInstance(MenuEntryActionViewItem, action, void 0) : void 0;
      } else {
        return action instanceof MenuItemAction ? instantiationService.createInstance(TextOnlyMenuEntryActionViewItem, action, { useComma: false }) : void 0;
      }
    });
    this._leftActions = new ActionBar(this.element, { actionViewItemProvider });
    this._rightActions = new ActionBar(this.element, { actionViewItemProvider });
    this._leftActions.domNode.classList.add("left");
    this._rightActions.domNode.classList.add("right");
  }
  dispose() {
    this._menuDisposables.dispose();
    this._leftActions.dispose();
    this._rightActions.dispose();
    this.element.remove();
  }
  show() {
    const menu = this._menuService.createMenu(this._menuId, this._contextKeyService);
    const renderMenu = () => {
      const left = [];
      const right = [];
      for (const [group2, actions] of menu.getActions()) {
        if (group2 === "left") {
          left.push(...actions);
        } else {
          right.push(...actions);
        }
      }
      this._leftActions.clear();
      this._leftActions.push(left);
      this._rightActions.clear();
      this._rightActions.push(right);
    };
    this._menuDisposables.add(menu.onDidChange(() => renderMenu()));
    this._menuDisposables.add(menu);
  }
  hide() {
    this._menuDisposables.clear();
  }
};

SuggestWidgetStatus = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], SuggestWidgetStatus);
export { SuggestWidgetStatus };
