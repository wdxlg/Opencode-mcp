// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionMetadataPills.ts
import { Disposable } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ISessionContext, SessionContext } from "./module-3499.mjs";
import { autorun } from "./module-0052.mjs";
import { setSessionContextKeys } from "./module-1778.mjs";
import { Menus } from "./module-3437.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { derived } from "./module-0054.mjs";
import { IMenuService, SubmenuItemAction } from "./module-0092.mjs";
import { getWindow } from "./module-0075.mjs";
import { ChatPillActionViewItem } from "./module-2235.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionChangesStatsCache } from "./module-1777.mjs";


// src/vs/sessions/contrib/chat/browser/sessionMetadataPills.ts
var SessionMetadataPills = class extends Disposable {
  constructor(container2, session, _actionViewItemService, contextKeyService, instantiationService, menuService, changesStatsCache) {
    super();
    this._actionViewItemService = _actionViewItemService;
    const scopedContextKeyService = this._register(contextKeyService.createScoped(container2));
    this._scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, scopedContextKeyService],
      [ISessionContext, new SessionContext(session)]
    )));
    this._register(autorun((reader) => {
      setSessionContextKeys(session.read(reader), scopedContextKeyService, reader, changesStatsCache);
    }));
    const menu = this._register(menuService.createMenu(Menus.SessionHeaderMeta, scopedContextKeyService, { emitEventsForSubmenuChanges: true }));
    const menuSignal = observableSignalFromEvent(this, Event2.any(
      menu.onDidChange,
      Event2.filter(this._actionViewItemService.onDidChange, (menuId) => menuId === Menus.SessionHeaderMeta)
    ));
    this.pills = derived(this, (reader) => {
      menuSignal.read(reader);
      return menu.getActions({ shouldForwardArgs: true }).flatMap(([group2, actions]) => {
        if (group2 !== "navigation") {
          return [];
        }
        return actions.map((action) => ({
          action,
          createActionViewItem: (options3) => {
            const provider = this._actionViewItemService.lookUp(
              Menus.SessionHeaderMeta,
              action instanceof SubmenuItemAction ? action.item.submenu.id : action.id
            );
            return provider?.(action, options3, this._scopedInstantiationService, getWindow(container2).vscodeWindowId) ?? this._scopedInstantiationService.createInstance(ChatPillActionViewItem, void 0, action, options3);
          }
        }));
      });
    });
  }
};

SessionMetadataPills = __decorateClass([
  __decorateParam(2, IActionViewItemService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMenuService),
  __decorateParam(6, ISessionChangesStatsCache)
], SessionMetadataPills);
export { SessionMetadataPills };
