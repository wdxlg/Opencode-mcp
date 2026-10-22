// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickPickPin.ts
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/quickinput/browser/quickPickPin.ts
var pinButtonClass = ThemeIcon.asClassName(Codicon.pin);

var pinnedButtonClass = ThemeIcon.asClassName(Codicon.pinned);

var buttonClasses = [pinButtonClass, pinnedButtonClass];

function showWithPinnedItems(storageService, storageKey, quickPick, filterDuplicates) {
  const itemsWithoutPinned = quickPick.items;
  let itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, void 0, filterDuplicates);
  const disposables = new DisposableStore();
  disposables.add(quickPick.onDidTriggerItemButton(async (buttonEvent) => {
    const expectedButton = buttonEvent.button.iconClass && buttonClasses.includes(buttonEvent.button.iconClass);
    if (expectedButton) {
      quickPick.items = itemsWithoutPinned;
      itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, buttonEvent.item, filterDuplicates);
      quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
    }
  }));
  disposables.add(quickPick.onDidChangeValue(async (value2) => {
    if (quickPick.items === itemsWithPinned && value2) {
      quickPick.items = itemsWithoutPinned;
    } else if (quickPick.items === itemsWithoutPinned && !value2) {
      quickPick.items = itemsWithPinned;
    }
  }));
  quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
  quickPick.show();
  return disposables;
}

function _formatPinnedItems(storageKey, quickPick, storageService, changedItem, filterDuplicates) {
  const formattedItems = [];
  let pinnedItems;
  if (changedItem) {
    pinnedItems = updatePinnedItems(storageKey, changedItem, storageService);
  } else {
    pinnedItems = getPinnedItems(storageKey, storageService);
  }
  if (pinnedItems.length) {
    formattedItems.push({ type: "separator", label: localize(3216, null) });
  }
  const pinnedIds = /* @__PURE__ */ new Set();
  for (const itemToFind of pinnedItems) {
    const itemToPin = quickPick.items.find((item) => itemsMatch(item, itemToFind));
    if (itemToPin) {
      const pinnedItemId = getItemIdentifier(itemToPin);
      const pinnedItem = { ...itemToPin };
      if (!filterDuplicates || !pinnedIds.has(pinnedItemId)) {
        pinnedIds.add(pinnedItemId);
        updateButtons(pinnedItem, false);
        formattedItems.push(pinnedItem);
      }
    }
  }
  for (const item of quickPick.items) {
    updateButtons(item, true);
    formattedItems.push(item);
  }
  return formattedItems;
}

function getItemIdentifier(item) {
  return item.type === "separator" ? "" : item.id || `${item.label}${item.description}${item.detail}`;
}

function updateButtons(item, removePin) {
  if (item.type === "separator") {
    return;
  }
  const newButtons = item.buttons?.filter((button) => button.iconClass && !buttonClasses.includes(button.iconClass)) ?? [];
  newButtons.unshift({
    iconClass: removePin ? pinButtonClass : pinnedButtonClass,
    tooltip: removePin ? localize(3214, null) : localize(3215, null),
    alwaysVisible: false
  });
  item.buttons = newButtons;
}

function itemsMatch(itemA, itemB) {
  return getItemIdentifier(itemA) === getItemIdentifier(itemB);
}

function updatePinnedItems(storageKey, changedItem, storageService) {
  const removePin = changedItem.buttons?.find((b) => b.iconClass === pinnedButtonClass);
  let items = getPinnedItems(storageKey, storageService);
  if (removePin) {
    items = items.filter((item) => getItemIdentifier(item) !== getItemIdentifier(changedItem));
  } else {
    items.push(changedItem);
  }
  storageService.store(storageKey, JSON.stringify(items.map(formatPinnedItemForStorage)), 1 /* WORKSPACE */, 1 /* MACHINE */);
  return items;
}

function getPinnedItems(storageKey, storageService) {
  const items = storageService.get(storageKey, 1 /* WORKSPACE */);
  return items ? JSON.parse(items) : [];
}

function formatPinnedItemForStorage(item) {
  return {
    label: item.label,
    description: item.description,
    detail: item.detail
  };
}
export { showWithPinnedItems, _formatPinnedItems, getItemIdentifier, updateButtons, itemsMatch, updatePinnedItems, getPinnedItems, formatPinnedItemForStorage, pinButtonClass, pinnedButtonClass, buttonClasses };
