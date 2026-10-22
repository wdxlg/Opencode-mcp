// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobilePickerSheet.ts
import { $, EventType, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";


// src/vs/sessions/browser/parts/mobile/mobilePickerSheet.ts
var $116 = $;

function isMobilePickerSheetTarget(target) {
  return !!target.closest(".mobile-picker-sheet");
}

var MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX = "headerAction:";

var MOBILE_PICKER_SHEET_CONFIRM = /* @__PURE__ */ Symbol("mobilePickerSheetConfirm");

function showMobilePickerSheet(workbenchContainer, title, items, options3) {
  return new Promise((resolve3) => {
    let resolved = false;
    const finish = (id2) => {
      if (resolved) {
        return;
      }
      resolved = true;
      shell.close(() => resolve3(id2));
    };
    const shell = buildMobileSheetShell(workbenchContainer, title, {
      caption: options3?.caption,
      headerActions: options3?.headerActions,
      doneLabel: options3?.doneLabel,
      onDismiss: () => finish(void 0),
      onHeaderAction: (actionId) => finish(`${MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX}${actionId}`)
    });
    const { sheet, disposables } = shell;
    let searchInput;
    if (options3?.search) {
      const searchRow = append(sheet, $116("div.mobile-picker-sheet-search"));
      const iconHost = append(searchRow, $116("span.mobile-picker-sheet-search-icon"));
      const iconEl = append(iconHost, $116("span.mobile-picker-sheet-search-icon-glyph"));
      iconEl.classList.add(...ThemeIcon.asClassNameArray(Codicon.search));
      searchInput = append(searchRow, $116("input.mobile-picker-sheet-search-input", { type: "search", autocomplete: "off", autocorrect: "off", autocapitalize: "off", spellcheck: "false" }));
      searchInput.placeholder = options3.search.placeholder;
      searchInput.setAttribute("aria-label", options3.search.ariaLabel ?? options3.search.placeholder);
    }
    const pinnedContainer = append(sheet, $116("div.mobile-picker-sheet-pinned"));
    pinnedContainer.style.display = "none";
    const pinnedStore = disposables.add(new DisposableStore());
    const setPrimaryAction = (action) => {
      pinnedStore.clear();
      clearNode(pinnedContainer);
      if (!action) {
        pinnedContainer.style.display = "none";
        return;
      }
      pinnedContainer.style.display = "";
      const btn = append(pinnedContainer, $116("button.mobile-picker-sheet-primary-action", { type: "button" }));
      btn.setAttribute("aria-label", action.label);
      if (action.icon) {
        const iconSlot = append(btn, $116("span.mobile-picker-sheet-primary-action-icon"));
        const iconGlyph = append(iconSlot, $116("span.mobile-picker-sheet-primary-action-icon-glyph"));
        iconGlyph.classList.add(...ThemeIcon.asClassNameArray(action.icon));
      }
      const textCol = append(btn, $116("span.mobile-picker-sheet-primary-action-text"));
      append(textCol, $116("span.mobile-picker-sheet-primary-action-label")).textContent = action.label;
      pinnedStore.add(addDisposableListener(btn, EventType.CLICK, (e4) => {
        e4.preventDefault();
        action.run();
        finish(void 0);
      }));
    };
    const list2 = append(sheet, $116("div.mobile-picker-sheet-list"));
    list2.setAttribute("role", "list");
    const rowsBySection = /* @__PURE__ */ new Map();
    let setSearchQuery;
    const handleRowTap = options3?.stayOpenOnSelect && options3.onDidSelect ? (id2, _row, sectionIndex) => {
      const sectionRows = rowsBySection.get(sectionIndex);
      const targetEntry = sectionRows?.find((entry) => entry.id === id2);
      if (sectionRows && !targetEntry?.navigates) {
        for (const entry of sectionRows) {
          if (!entry.checkSlot) {
            continue;
          }
          const isTarget2 = entry.id === id2;
          entry.row.classList.toggle("checked", isTarget2);
          entry.row.setAttribute("aria-current", isTarget2 ? "true" : "false");
          clearNode(entry.checkSlot);
          if (isTarget2) {
            const checkGlyph = append(entry.checkSlot, $116("span.mobile-picker-sheet-check-glyph"));
            checkGlyph.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
          }
        }
      }
      const selectResult = options3.onDidSelect(id2);
      if (selectResult === MOBILE_PICKER_SHEET_CONFIRM) {
        finish(id2);
      } else if (typeof selectResult === "string" && searchInput && setSearchQuery) {
        searchInput.value = selectResult;
        setSearchQuery(selectResult);
      }
    } : (id2, _row, _sectionIndex) => {
      finish(id2);
    };
    const staticContainer = append(list2, $116("div.mobile-picker-sheet-static"));
    const renderState = { firstRow: void 0, firstCheckedRow: void 0, sectionCount: 0 };
    for (const item of items) {
      renderRow(staticContainer, item, renderState, handleRowTap, disposables, rowsBySection);
    }
    const search2 = options3?.search;
    if (search2 && searchInput) {
      const resultsContainer = append(list2, $116("div.mobile-picker-sheet-search-results"));
      let currentQueryTokens;
      let debounceTimer;
      const searchSectionBase = renderState.sectionCount + 1;
      const pruneSearchRows = () => {
        for (const key3 of [...rowsBySection.keys()]) {
          if (key3 >= searchSectionBase) {
            rowsBySection.delete(key3);
          }
        }
      };
      const searchRowsStore = disposables.add(new DisposableStore());
      const cancelInflight = () => {
        currentQueryTokens?.cancel();
        currentQueryTokens?.dispose();
        currentQueryTokens = void 0;
        if (debounceTimer !== void 0) {
          clearTimeout(debounceTimer);
          debounceTimer = void 0;
        }
      };
      disposables.add(toDisposable(cancelInflight));
      const renderResults = async (query) => {
        cancelInflight();
        staticContainer.style.display = query ? "none" : "";
        const tokens = new CancellationTokenSource();
        currentQueryTokens = tokens;
        clearNode(resultsContainer);
        pruneSearchRows();
        searchRowsStore.clear();
        const status2 = append(resultsContainer, $116("div.mobile-picker-sheet-search-status"));
        status2.textContent = localize(3820, null);
        let results;
        try {
          results = await search2.loadItems(query, tokens.token);
        } catch {
          results = [];
        }
        if (tokens.token.isCancellationRequested || resolved) {
          return;
        }
        setPrimaryAction(search2.getPrimaryAction?.(query));
        clearNode(resultsContainer);
        const localState = { firstRow: void 0, firstCheckedRow: void 0, sectionCount: searchSectionBase };
        if (search2.resultsSectionTitle) {
          const sectionTitle = append(resultsContainer, $116("div.mobile-picker-sheet-section-title"));
          sectionTitle.textContent = search2.resultsSectionTitle;
        }
        if (results.length === 0) {
          const empty = append(resultsContainer, $116("div.mobile-picker-sheet-search-empty"));
          empty.textContent = search2.emptyMessage ?? localize(3819, null);
          return;
        }
        for (const item of results) {
          renderRow(resultsContainer, item, localState, handleRowTap, searchRowsStore, rowsBySection);
        }
      };
      const onInput = () => {
        if (debounceTimer !== void 0) {
          clearTimeout(debounceTimer);
        }
        const value2 = searchInput.value;
        debounceTimer = setTimeout(() => {
          debounceTimer = void 0;
          renderResults(value2);
        }, 150);
      };
      const inputListener = addDisposableListener(searchInput, "input", onInput);
      disposables.add(inputListener);
      renderResults("");
      setSearchQuery = (query) => renderResults(query);
    }
    if (searchInput) {
      searchInput.focus();
    } else {
      (renderState.firstCheckedRow ?? renderState.firstRow)?.focus();
    }
  });
}

function buildMobileSheetShell(workbenchContainer, title, options3) {
  const disposables = new DisposableStore();
  let closed = false;
  const overlay = append(workbenchContainer, $116("div.mobile-picker-sheet-overlay"));
  const backdrop = append(overlay, $116("div.mobile-picker-sheet-backdrop"));
  const sheet = append(overlay, $116("div.mobile-picker-sheet"));
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", title);
  append(sheet, $116("div.mobile-picker-sheet-handle"));
  const titleRow = append(sheet, $116("div.mobile-picker-sheet-title-row"));
  const titleEl = append(titleRow, $116("div.mobile-picker-sheet-title"));
  titleEl.textContent = title;
  if (options3.headerActions) {
    for (const action of options3.headerActions) {
      const btn = append(titleRow, $116("button.mobile-picker-sheet-header-action", { type: "button" }));
      btn.setAttribute("aria-label", action.label);
      btn.title = action.label;
      const iconHost = append(btn, $116("span.mobile-picker-sheet-header-action-icon"));
      const iconEl = append(iconHost, $116("span.mobile-picker-sheet-header-action-icon-glyph"));
      iconEl.classList.add(...ThemeIcon.asClassNameArray(action.icon));
      const btnGesture = Gesture.addTarget(btn);
      disposables.add(btnGesture);
      const onActivate = () => {
        if (options3.onHeaderAction) {
          options3.onHeaderAction(action.id);
        } else {
          options3.onDismiss();
        }
      };
      const btnClick = addDisposableListener(btn, EventType.CLICK, (e4) => {
        e4.preventDefault();
        onActivate();
      });
      disposables.add(btnClick);
      const btnTap = addDisposableListener(btn, EventType2.Tap, onActivate);
      disposables.add(btnTap);
    }
  }
  if (!options3.hideDoneButton) {
    const doneBtn = append(titleRow, $116("button.mobile-picker-sheet-done", { type: "button" }));
    doneBtn.textContent = options3.doneLabel ?? localize(3817, null);
    doneBtn.setAttribute("aria-label", localize(3818, null, title));
    const doneGesture = Gesture.addTarget(doneBtn);
    disposables.add(doneGesture);
    const doneClick = addDisposableListener(doneBtn, EventType.CLICK, (e4) => {
      e4.preventDefault();
      options3.onDismiss();
    });
    disposables.add(doneClick);
    const doneTap = addDisposableListener(doneBtn, EventType2.Tap, () => options3.onDismiss());
    disposables.add(doneTap);
  }
  if (options3.caption) {
    const caption = append(sheet, $116("div.mobile-picker-sheet-caption"));
    caption.textContent = options3.caption;
  }
  const backdropClick = addDisposableListener(backdrop, EventType.CLICK, () => options3.onDismiss());
  disposables.add(backdropClick);
  const backdropGesture = Gesture.addTarget(backdrop);
  disposables.add(backdropGesture);
  const backdropTap = addDisposableListener(backdrop, EventType2.Tap, () => options3.onDismiss());
  disposables.add(backdropTap);
  const keyHandler = addDisposableListener(getWindow(workbenchContainer), EventType.KEY_DOWN, (e4) => {
    if (e4.key === "Escape") {
      e4.preventDefault();
      e4.stopPropagation();
      options3.onDismiss();
    }
  }, true);
  disposables.add(keyHandler);
  const win = getWindow(workbenchContainer);
  const vv = win.visualViewport;
  if (vv) {
    const adjustForKeyboard = () => {
      const keyboardHeight = win.innerHeight - vv.height;
      overlay.style.bottom = `${Math.max(0, keyboardHeight)}px`;
      overlay.style.height = `${vv.height}px`;
    };
    vv.addEventListener("resize", adjustForKeyboard);
    vv.addEventListener("scroll", adjustForKeyboard);
    disposables.add(toDisposable(() => {
      vv.removeEventListener("resize", adjustForKeyboard);
      vv.removeEventListener("scroll", adjustForKeyboard);
      overlay.style.bottom = "";
      overlay.style.height = "";
    }));
    adjustForKeyboard();
  }
  const close2 = (onAnimationEnd) => {
    if (closed) {
      return;
    }
    closed = true;
    sheet.classList.add("closing");
    backdrop.classList.add("closing");
    disposables.dispose();
    getWindow(workbenchContainer).setTimeout(() => {
      overlay.remove();
      onAnimationEnd?.();
    }, 180);
  };
  return { overlay, backdrop, sheet, disposables, close: close2 };
}

function renderRow(list2, item, state, onTap, disposables, rowsBySection) {
  if (item.sectionTitle !== void 0) {
    if (state.sectionCount > 0) {
      append(list2, $116("div.mobile-picker-sheet-divider"));
    }
    if (item.sectionTitle) {
      const sectionTitle = append(list2, $116("div.mobile-picker-sheet-section-title"));
      sectionTitle.textContent = item.sectionTitle;
    }
    state.sectionCount++;
  }
  const row = append(list2, $116("button.mobile-picker-sheet-item", { type: "button" }));
  row.setAttribute("role", "listitem");
  row.setAttribute("aria-current", item.checked ? "true" : "false");
  if (item.checked) {
    row.classList.add("checked");
  }
  if (item.disabled) {
    row.classList.add("disabled");
    row.disabled = true;
    row.setAttribute("aria-disabled", "true");
  }
  state.firstRow ??= row;
  if (item.checked && !state.firstCheckedRow) {
    state.firstCheckedRow = row;
  }
  if (item.icon) {
    const iconSlot = append(row, $116("span.mobile-picker-sheet-icon"));
    const iconGlyph = append(iconSlot, $116("span.mobile-picker-sheet-icon-glyph"));
    iconGlyph.classList.add(...ThemeIcon.asClassNameArray(item.icon));
  }
  const textCol = append(row, $116("span.mobile-picker-sheet-text"));
  append(textCol, $116("span.mobile-picker-sheet-label")).textContent = item.label;
  if (item.description) {
    append(textCol, $116("span.mobile-picker-sheet-description")).textContent = item.description;
  }
  let checkSlot;
  if (item.navigates && !item.checked) {
    const chevronSlot = append(row, $116("span.mobile-picker-sheet-chevron"));
    const chevronGlyph = append(chevronSlot, $116("span.mobile-picker-sheet-chevron-glyph"));
    chevronGlyph.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
  } else {
    checkSlot = append(row, $116("span.mobile-picker-sheet-check"));
    if (item.checked) {
      const checkGlyph = append(checkSlot, $116("span.mobile-picker-sheet-check-glyph"));
      checkGlyph.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
    }
  }
  if (rowsBySection) {
    const entry = { row, checkSlot, id: item.id, navigates: item.navigates };
    const sectionRows = rowsBySection.get(state.sectionCount);
    if (sectionRows) {
      sectionRows.push(entry);
    } else {
      rowsBySection.set(state.sectionCount, [entry]);
    }
  }
  const currentSectionIndex = state.sectionCount;
  if (!item.disabled) {
    const rowClick = addDisposableListener(row, EventType.CLICK, (e4) => {
      e4.preventDefault();
      onTap(item.id, row, currentSectionIndex);
    });
    disposables.add(rowClick);
  }
}
export { isMobilePickerSheetTarget, showMobilePickerSheet, buildMobileSheetShell, renderRow, $116, MOBILE_PICKER_SHEET_HEADER_ACTION_PREFIX, MOBILE_PICKER_SHEET_CONFIRM };
