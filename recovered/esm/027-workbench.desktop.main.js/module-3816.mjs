// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/contextmenu/electron-browser/contextmenu.ts
import { ipcRenderer } from "./module-3724.mjs";
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL } from "./module-3815.mjs";


// src/vs/base/parts/contextmenu/electron-browser/contextmenu.ts
var contextMenuIdPool = 0;

function popup(items, options3, onHide) {
  const processedItems = [];
  const contextMenuId = contextMenuIdPool++;
  const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
  const onClickChannelHandler = (_event, ...args2) => {
    const itemId = args2[0];
    const context2 = args2[1];
    const item = processedItems[itemId];
    item.click?.(context2);
  };
  ipcRenderer.once(onClickChannel, onClickChannelHandler);
  ipcRenderer.once(CONTEXT_MENU_CLOSE_CHANNEL, (_event, ...args2) => {
    const closedContextMenuId = args2[0];
    if (closedContextMenuId !== contextMenuId) {
      return;
    }
    ipcRenderer.removeListener(onClickChannel, onClickChannelHandler);
    onHide?.();
  });
  ipcRenderer.send(CONTEXT_MENU_CHANNEL, contextMenuId, items.map((item) => createItem(item, processedItems)), onClickChannel, options3);
}

function createItem(item, processedItems) {
  const serializableItem = {
    id: processedItems.length,
    label: item.label,
    type: item.type,
    accelerator: item.accelerator,
    checked: item.checked,
    enabled: typeof item.enabled === "boolean" ? item.enabled : true,
    visible: typeof item.visible === "boolean" ? item.visible : true
  };
  processedItems.push(item);
  if (Array.isArray(item.submenu)) {
    serializableItem.submenu = item.submenu.map((submenuItem) => createItem(submenuItem, processedItems));
  }
  return serializableItem;
}
export { popup, createItem, contextMenuIdPool };
