// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentMenus.ts
import { IMenuService, MenuId } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/comments/browser/commentMenus.ts
var CommentMenus = class {
  constructor(menuService) {
    this.menuService = menuService;
  }
  getCommentThreadTitleActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadTitle, contextKeyService);
  }
  getCommentThreadActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadActions, contextKeyService);
  }
  getCommentEditorActions(contextKeyService) {
    return this.getMenu(MenuId.CommentEditorActions, contextKeyService);
  }
  getCommentThreadAdditionalActions(contextKeyService) {
    return this.getMenu(MenuId.CommentThreadAdditionalActions, contextKeyService, { emitEventsForSubmenuChanges: true });
  }
  getCommentTitleActions(comment, contextKeyService) {
    return this.getMenu(MenuId.CommentTitle, contextKeyService);
  }
  getCommentActions(comment, contextKeyService) {
    return this.getMenu(MenuId.CommentActions, contextKeyService);
  }
  getCommentThreadTitleContextActions(contextKeyService) {
    return this.getActions(MenuId.CommentThreadTitleContext, contextKeyService, { shouldForwardArgs: true });
  }
  getMenu(menuId, contextKeyService, options3) {
    return this.menuService.createMenu(menuId, contextKeyService, options3);
  }
  getActions(menuId, contextKeyService, options3) {
    return this.menuService.getMenuActions(menuId, contextKeyService, options3).map((value2) => value2[1]).flat();
  }
  dispose() {
  }
};

CommentMenus = __decorateClass([
  __decorateParam(0, IMenuService)
], CommentMenus);
export { CommentMenus };
