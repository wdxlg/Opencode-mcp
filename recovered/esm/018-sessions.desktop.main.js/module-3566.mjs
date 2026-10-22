// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/mobile/mobileWorkspacePickerSheet.ts
import { Codicon } from "./module-0085.mjs";
import { SubmenuAction } from "./module-0082.mjs";
import { isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { MOBILE_PICKER_SHEET_CONFIRM, MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX, showMobilePickerSheet } from "./module-3565.mjs";
import { isPhoneLayout } from "./module-3445.mjs";


// src/vs/sessions/contrib/chat/browser/mobile/mobileWorkspacePickerSheet.ts
var SEARCH_RESULT_ID_PREFIX = "searchResult:";

function buildMobileWorkspacePickerRows(items, dispatch) {
  const rows = [];
  let pendingSeparator = false;
  for (const item of items) {
    if (item.kind === "separator" /* Separator */) {
      pendingSeparator = rows.length > 0;
      continue;
    }
    const sectionTitle = pendingSeparator ? "" : void 0;
    pendingSeparator = false;
    if (item.submenuActions && item.submenuActions.length > 0) {
      let isFirst = true;
      const childActions = collectSubmenuActions(item.submenuActions);
      if (childActions.length === 0) {
        continue;
      }
      for (const child of childActions) {
        const id3 = `submenu:${rows.length}`;
        const childIcon = child.icon ?? item.group?.icon;
        rows.push({
          sheetItem: {
            id: id3,
            label: child.label,
            icon: childIcon,
            disabled: !child.enabled,
            sectionTitle: isFirst ? sectionTitle ?? item.label ?? "" : void 0
          },
          run: () => child.run()
        });
        isFirst = false;
      }
      continue;
    }
    const id2 = `item:${rows.length}`;
    const data = item.item;
    const isWorkspaceRow = !!data?.folderUri;
    const icon2 = isWorkspaceRow ? Codicon.folder : item.group?.icon;
    rows.push({
      sheetItem: {
        id: id2,
        label: item.label ?? "",
        description: descriptionToString(item.description),
        icon: icon2,
        checked: !!data?.checked,
        disabled: item.disabled,
        sectionTitle
      },
      run: () => {
        if (data) {
          dispatch(data);
        }
      }
    });
  }
  return rows;
}

function collectSubmenuActions(actions) {
  const out = [];
  for (const a of actions) {
    if (a instanceof SubmenuAction) {
      for (const inner of a.actions) {
        out.push(inner);
      }
    } else {
      out.push(a);
    }
  }
  return out;
}

function descriptionToString(value2) {
  if (value2 === void 0) {
    return void 0;
  }
  if (isString(value2)) {
    return value2;
  }
  return value2.value;
}

async function showMobileWorkspacePickerSheet(layoutService, triggerElement, items, dispatch, browseActions) {
  const { rowItems, headerBrowseActions } = partitionItems(items, dispatch, browseActions);
  const surfacedProviderIds = collectSurfacedBrowseProviderIds(items, browseActions);
  const inlineFolderActions = browseActions.filter(
    (b) => typeof b.listFolders === "function" && surfacedProviderIds.has(b.providerId)
  );
  if (rowItems.length === 0 && inlineFolderActions.length === 0 && headerBrowseActions.length === 1) {
    headerBrowseActions[0].invoke();
    return;
  }
  if (rowItems.length === 0 && inlineFolderActions.length === 0 && headerBrowseActions.length === 0) {
    return;
  }
  const rows = buildMobileWorkspacePickerRows(rowItems, dispatch);
  const headerActions = headerBrowseActions.map((b, i2) => ({
    id: String(i2),
    label: b.label,
    icon: b.icon
  }));
  const folderRunById = /* @__PURE__ */ new Map();
  const folderLabelById = /* @__PURE__ */ new Map();
  let currentFolder;
  let currentSearchQuery = "";
  const search2 = inlineFolderActions.length > 0 ? {
    placeholder: localize(4422, null),
    resultsSectionTitle: localize(4420, null),
    emptyMessage: localize(4421, null),
    loadItems: async (query, token) => {
      currentSearchQuery = query;
      folderRunById.clear();
      folderLabelById.clear();
      const results = await Promise.all(
        inlineFolderActions.map(async (action) => {
          try {
            const folders = await action.listFolders(query, token);
            return folders.map((workspace) => ({ workspace, providerId: action.providerId }));
          } catch {
            return [];
          }
        })
      );
      if (token.isCancellationRequested) {
        return [];
      }
      const flattened = results.flat();
      const sheetItems = [];
      flattened.forEach((entry, idx) => {
        const id2 = `${SEARCH_RESULT_ID_PREFIX}${idx}`;
        const folderUri = entry.workspace.folders[0]?.root;
        if (!folderUri) {
          return;
        }
        folderRunById.set(id2, () => dispatch({ folderUri, providerId: entry.providerId }));
        folderLabelById.set(id2, entry.workspace.label);
        sheetItems.push({
          id: id2,
          label: entry.workspace.label,
          description: entry.workspace.description,
          icon: entry.workspace.icon,
          navigates: true
        });
      });
      return sheetItems;
    },
    // The pinned "Select this folder" action follows the folder
    // we drilled into (when the live query still matches it),
    // instead of mixing a confirm row into the navigable list.
    getPrimaryAction: (query) => {
      if (currentFolder?.query !== query) {
        return void 0;
      }
      const folder = currentFolder;
      return {
        label: localize(4423, null, folder.label),
        icon: Codicon.arrowRight,
        run: folder.run
      };
    }
  } : void 0;
  triggerElement.setAttribute("aria-expanded", "true");
  let result;
  try {
    result = await showMobilePickerSheet(
      layoutService.mainContainer,
      localize(4424, null),
      rows.map((r2) => r2.sheetItem),
      {
        headerActions,
        search: search2,
        caption: localize(4419, null),
        stayOpenOnSelect: true,
        doneLabel: localize(4418, null),
        onDidSelect: (id2) => {
          if (id2.startsWith(SEARCH_RESULT_ID_PREFIX)) {
            const run = folderRunById.get(id2);
            const folderName = folderLabelById.get(id2);
            if (folderName) {
              const lastSlash = currentSearchQuery.lastIndexOf("/");
              const prefix = lastSlash >= 0 ? currentSearchQuery.slice(0, lastSlash + 1) : "";
              const query = `${prefix}${folderName}/`;
              if (run) {
                currentFolder = { query, label: folderName, run };
              }
              return query;
            }
            return;
          }
          const row = rows.find((r2) => r2.sheetItem.id === id2);
          if (row) {
            row.run();
            currentFolder = void 0;
            return MOBILE_PICKER_SHEET_CONFIRM;
          }
          return;
        }
      }
    );
  } finally {
    triggerElement.setAttribute("aria-expanded", "false");
    triggerElement.focus();
  }
  if (result?.startsWith(MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX)) {
    const index2 = Number(result.slice(MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX.length));
    headerBrowseActions[index2]?.invoke();
  }
}

function partitionItems(items, dispatch, browseActions) {
  const rowItems = [];
  const headerBrowseActions = [];
  const hasInlineSearch = (index2) => index2 !== void 0 && typeof browseActions[index2]?.listFolders === "function";
  for (const item of items) {
    if (item.kind === "separator" /* Separator */) {
      rowItems.push(item);
      continue;
    }
    if (item.submenuActions?.length) {
      let promoted = false;
      for (const child of collectSubmenuActions(item.submenuActions)) {
        if (!child.enabled) {
          continue;
        }
        headerBrowseActions.push({
          label: child.label || item.label || "",
          icon: child.icon ?? item.group?.icon ?? Codicon.folderOpened,
          invoke: () => child.run()
        });
        promoted = true;
      }
      if (!promoted) {
        rowItems.push(item);
      }
      continue;
    }
    if (item.item?.browseActionIndex !== void 0 && !item.disabled) {
      if (hasInlineSearch(item.item.browseActionIndex)) {
        continue;
      }
      const data = item.item;
      headerBrowseActions.push({
        label: item.label ?? "",
        icon: item.group?.icon ?? Codicon.folderOpened,
        invoke: () => dispatch(data)
      });
      continue;
    }
    rowItems.push(item);
  }
  while (rowItems.length && rowItems[0].kind === "separator" /* Separator */) {
    rowItems.shift();
  }
  while (rowItems.length && rowItems[rowItems.length - 1].kind === "separator" /* Separator */) {
    rowItems.pop();
  }
  return { rowItems, headerBrowseActions };
}

function shouldUseMobileWorkspacePickerSheet(layoutService) {
  return isPhoneLayout(layoutService);
}

function collectSurfacedBrowseProviderIds(items, browseActions) {
  const ids = /* @__PURE__ */ new Set();
  for (const item of items) {
    if (item.kind === "separator" /* Separator */) {
      continue;
    }
    const idx = item.item?.browseActionIndex;
    if (idx !== void 0) {
      const action = browseActions[idx];
      if (action) {
        ids.add(action.providerId);
      }
      continue;
    }
    if (item.submenuActions?.length) {
      for (const ba of browseActions) {
        ids.add(ba.providerId);
      }
    }
  }
  return ids;
}
export { buildMobileWorkspacePickerRows, collectSubmenuActions, descriptionToString, showMobileWorkspacePickerSheet, partitionItems, shouldUseMobileWorkspacePickerSheet, collectSurfacedBrowseProviderIds, SEARCH_RESULT_ID_PREFIX };
