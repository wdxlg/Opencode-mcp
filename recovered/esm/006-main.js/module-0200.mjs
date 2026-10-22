// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/menubar/common/menubar.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/menubar/common/menubar.ts
function isMenubarMenuItemSubmenu(menuItem) {
  return menuItem.submenu !== void 0;
}

function isMenubarMenuItemSeparator(menuItem) {
  return menuItem.id === "vscode.menubar.separator";
}

function isMenubarMenuItemRecentAction(menuItem) {
  return menuItem.uri !== void 0;
}

function isMenubarMenuItemAction(menuItem) {
  return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemRecentAction(menuItem);
}

var init_menubar = __esm({
  "src/vs/platform/menubar/common/menubar.ts"() {
  }
});
export { isMenubarMenuItemSubmenu, isMenubarMenuItemSeparator, isMenubarMenuItemRecentAction, isMenubarMenuItemAction, init_menubar };
