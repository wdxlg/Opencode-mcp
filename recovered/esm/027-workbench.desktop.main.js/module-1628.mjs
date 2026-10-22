// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/titlebar/menubar.contribution.ts
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IsMacNativeContext } from "./module-0635.mjs";


// src/vs/workbench/browser/parts/titlebar/menubar.contribution.ts
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarFileMenu,
  title: {
    value: "File",
    original: "File",
    mnemonicTitle: localize(6923, null)
  },
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarEditMenu,
  title: {
    value: "Edit",
    original: "Edit",
    mnemonicTitle: localize(6922, null)
  },
  order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarSelectionMenu,
  title: {
    value: "Selection",
    original: "Selection",
    mnemonicTitle: localize(6927, null)
  },
  order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarViewMenu,
  title: {
    value: "View",
    original: "View",
    mnemonicTitle: localize(6929, null)
  },
  order: 4
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarGoMenu,
  title: {
    value: "Go",
    original: "Go",
    mnemonicTitle: localize(6924, null)
  },
  order: 5
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarTerminalMenu,
  title: {
    value: "Terminal",
    original: "Terminal",
    mnemonicTitle: localize(6928, null)
  },
  order: 7
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarHelpMenu,
  title: {
    value: "Help",
    original: "Help",
    mnemonicTitle: localize(6925, null)
  },
  order: 8
});

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarPreferencesMenu,
  title: {
    value: "Preferences",
    original: "Preferences",
    mnemonicTitle: localize(6926, null)
  },
  when: IsMacNativeContext,
  order: 9
});
export {};
