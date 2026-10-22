// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileSortGroupSheet.ts
import { $, EventType, addDisposableListener, append, getWindow } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";


// src/vs/sessions/browser/parts/mobile/mobileSortGroupSheet.ts
var $114 = $;

function showMobileSortGroupSheet(workbenchContainer, title, items) {
  return new Promise((resolve3) => {
    const disposables = [];
    let resolved = false;
    const finish = (id2) => {
      if (resolved) {
        return;
      }
      resolved = true;
      sheet.classList.add("closing");
      backdrop.classList.add("closing");
      getWindow(workbenchContainer).setTimeout(() => {
        for (const d of disposables) {
          try {
            d();
          } catch {
          }
        }
        overlay.remove();
        resolve3(id2);
      }, 180);
    };
    const overlay = append(workbenchContainer, $114("div.mobile-sort-group-sheet-overlay"));
    const backdrop = append(overlay, $114("div.mobile-sort-group-sheet-backdrop"));
    const sheet = append(overlay, $114("div.mobile-sort-group-sheet"));
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", title);
    append(sheet, $114("div.mobile-sort-group-sheet-handle"));
    const header2 = append(sheet, $114("div.mobile-sort-group-sheet-header"));
    append(header2, $114("div.mobile-sort-group-sheet-title")).textContent = title;
    const closeBtn = append(header2, $114("button.mobile-sort-group-sheet-close", { type: "button" }));
    closeBtn.setAttribute("aria-label", localize(3828, null));
    append(closeBtn, $114("span")).classList.add(...ThemeIcon.asClassNameArray(Codicon.close));
    const closeGesture = Gesture.addTarget(closeBtn);
    disposables.push(() => closeGesture.dispose());
    const closeClick = addDisposableListener(closeBtn, EventType.CLICK, (e4) => {
      e4.preventDefault();
      finish(void 0);
    });
    disposables.push(() => closeClick.dispose());
    const closeTap = addDisposableListener(closeBtn, EventType2.Tap, () => finish(void 0));
    disposables.push(() => closeTap.dispose());
    const list2 = append(sheet, $114("div.mobile-sort-group-sheet-list"));
    list2.setAttribute("role", "listbox");
    let lastGroup;
    let firstRow;
    let firstCheckedRow;
    for (const item of items) {
      if (item.group !== lastGroup) {
        if (lastGroup !== void 0) {
          append(list2, $114("div.mobile-sort-group-sheet-divider"));
        }
        if (item.groupTitle) {
          const sectionTitle = append(list2, $114("div.mobile-sort-group-sheet-section-title"));
          sectionTitle.textContent = item.groupTitle;
        }
        lastGroup = item.group;
      }
      const row = append(list2, $114("button.mobile-sort-group-sheet-item", { type: "button" }));
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(item.checked));
      if (item.checked) {
        row.classList.add("checked");
      }
      firstRow ??= row;
      if (item.checked && !firstCheckedRow) {
        firstCheckedRow = row;
      }
      const checkSlot = append(row, $114("span.mobile-sort-group-sheet-check"));
      if (item.checked) {
        checkSlot.classList.add(...ThemeIcon.asClassNameArray(Codicon.check));
      }
      append(row, $114("span.mobile-sort-group-sheet-label")).textContent = item.label;
      const rowGesture = Gesture.addTarget(row);
      disposables.push(() => rowGesture.dispose());
      const rowClick = addDisposableListener(row, EventType.CLICK, (e4) => {
        e4.preventDefault();
        finish(item.id);
      });
      disposables.push(() => rowClick.dispose());
      const rowTap = addDisposableListener(row, EventType2.Tap, () => finish(item.id));
      disposables.push(() => rowTap.dispose());
    }
    const backdropClick = addDisposableListener(backdrop, EventType.CLICK, () => finish(void 0));
    disposables.push(() => backdropClick.dispose());
    const backdropGesture = Gesture.addTarget(backdrop);
    disposables.push(() => backdropGesture.dispose());
    const backdropTap = addDisposableListener(backdrop, EventType2.Tap, () => finish(void 0));
    disposables.push(() => backdropTap.dispose());
    const keyHandler = addDisposableListener(getWindow(workbenchContainer), EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Escape") {
        e4.preventDefault();
        e4.stopPropagation();
        finish(void 0);
      }
    }, true);
    disposables.push(() => keyHandler.dispose());
    (firstCheckedRow ?? firstRow)?.focus();
  });
}
export { showMobileSortGroupSheet, $114 };
