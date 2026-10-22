// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/contextmenu/electron-main/contextmenu.ts
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL, init_contextmenu } from "./module-0061.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/parts/contextmenu/electron-main/contextmenu.ts
import { Menu, MenuItem } from "electron";

function registerContextMenuListener() {
  validatedIpcMain.on(CONTEXT_MENU_CHANNEL, (event, contextMenuId, items, onClickChannel, options) => {
    const menu = createMenu(event, onClickChannel, items);
    menu.popup({
      x: options ? options.x : void 0,
      y: options ? options.y : void 0,
      positioningItem: options ? options.positioningItem : void 0,
      callback: () => {
        if (menu) {
          event.sender.send(CONTEXT_MENU_CLOSE_CHANNEL, contextMenuId);
        }
      }
    });
  });
}

function createMenu(event, onClickChannel, items) {
  const menu = new Menu();
  items.forEach((item) => {
    let menuitem;
    if (item.type === "separator") {
      menuitem = new MenuItem({
        type: item.type
      });
    } else if (Array.isArray(item.submenu)) {
      menuitem = new MenuItem({
        submenu: createMenu(event, onClickChannel, item.submenu),
        label: item.label
      });
    } else {
      menuitem = new MenuItem({
        label: item.label,
        type: item.type,
        accelerator: item.accelerator,
        checked: item.checked,
        enabled: item.enabled,
        visible: item.visible,
        click: (menuItem, win, contextmenuEvent) => event.sender.send(onClickChannel, item.id, contextmenuEvent)
      });
    }
    menu.append(menuitem);
  });
  return menu;
}

var init_contextmenu2 = __esm({
  "src/vs/base/parts/contextmenu/electron-main/contextmenu.ts"() {
    init_ipcMain();
    init_contextmenu();
  }
});
export { registerContextMenuListener, createMenu, Menu, MenuItem, init_contextmenu2 };
