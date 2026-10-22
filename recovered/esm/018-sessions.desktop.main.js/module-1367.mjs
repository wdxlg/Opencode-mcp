// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentThreadAdditionalActions.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { CommentFormActions } from "./module-1338.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/comments/browser/commentThreadAdditionalActions.ts
var CommentThreadAdditionalActions = class extends Disposable {
  constructor(container2, _commentThread, _contextKeyService, _commentMenus, _actionRunDelegate, _keybindingService, _contextMenuService) {
    super();
    this._commentThread = _commentThread;
    this._contextKeyService = _contextKeyService;
    this._commentMenus = _commentMenus;
    this._actionRunDelegate = _actionRunDelegate;
    this._keybindingService = _keybindingService;
    this._contextMenuService = _contextMenuService;
    this._container = append(container2, $(".comment-additional-actions"));
    append(this._container, $(".section-separator"));
    this._buttonBar = append(this._container, $(".button-bar"));
    this._createAdditionalActions(this._buttonBar);
  }
  _showMenu() {
    this._container?.classList.remove("hidden");
  }
  _hideMenu() {
    this._container?.classList.add("hidden");
  }
  _enableDisableMenu(menu) {
    const groups = menu.getActions({ shouldForwardArgs: true });
    for (const group2 of groups) {
      const [, actions] = group2;
      for (const action of actions) {
        if (action.enabled) {
          this._showMenu();
          return;
        }
        for (const subAction of action.actions ?? []) {
          if (subAction.enabled) {
            this._showMenu();
            return;
          }
        }
      }
    }
    this._hideMenu();
  }
  _createAdditionalActions(container2) {
    const menu = this._commentMenus.getCommentThreadAdditionalActions(this._contextKeyService);
    this._register(menu);
    this._register(menu.onDidChange(() => {
      this._commentFormActions.setActions(
        menu,
        /*hasOnlySecondaryActions*/
        true
      );
      this._enableDisableMenu(menu);
    }));
    this._commentFormActions = new CommentFormActions(this._keybindingService, this._contextKeyService, this._contextMenuService, container2, async (action) => {
      this._actionRunDelegate?.();
      action.run({
        thread: this._commentThread,
        $mid: 8 /* CommentThreadInstance */
      });
    }, 4, true);
    this._register(this._commentFormActions);
    this._commentFormActions.setActions(
      menu,
      /*hasOnlySecondaryActions*/
      true
    );
    this._enableDisableMenu(menu);
  }
};

CommentThreadAdditionalActions = __decorateClass([
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextMenuService)
], CommentThreadAdditionalActions);
export { CommentThreadAdditionalActions };
