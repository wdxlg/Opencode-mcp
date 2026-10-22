// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownTableScrolling.ts
import { DisposableStore } from "./module-0012.mjs";
import { isHTMLElement } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatMarkdownTableScrolling.ts
function wrapTablesWithScrollable(domNode, layoutParticipants) {
  const store = new DisposableStore();
  for (const table of domNode.querySelectorAll("table")) {
    if (!isHTMLElement(table)) {
      continue;
    }
    applyTableColumnMinWidths(table);
    const parent = table.parentElement;
    const nextSibling = table.nextSibling;
    const tableContainer = document.createElement("div");
    tableContainer.appendChild(table);
    const scrollable = store.add(new DomScrollableElement(tableContainer, {
      // moves tableContainer into scrollNode
      vertical: 2 /* Hidden */,
      horizontal: 1 /* Auto */
    }));
    const scrollNode = scrollable.getDomNode();
    scrollNode.classList.add("rendered-markdown-table-scroll-wrapper");
    parent?.insertBefore(scrollNode, nextSibling);
    layoutParticipants.value.add(() => {
      scrollable.scanDomNode();
    });
    scrollable.scanDomNode();
  }
  return store;
}

var TABLE_COLUMN_MIN_WIDTH_CAP_CH = 3;

function applyTableColumnMinWidths(table) {
  const rows = table.rows;
  const colMaxChars = [];
  for (const row of rows) {
    for (let c = 0; c < row.cells.length; c++) {
      const len = row.cells[c].textContent?.length ?? 0;
      if (len > (colMaxChars[c] ?? 0)) {
        colMaxChars[c] = len;
      }
    }
  }
  const firstRow = rows[0];
  if (firstRow) {
    for (let c = 0; c < firstRow.cells.length; c++) {
      const minCh = colMaxChars[c];
      if (minCh !== void 0 && minCh > 1) {
        firstRow.cells[c].style.minWidth = Math.min(minCh, TABLE_COLUMN_MIN_WIDTH_CAP_CH) + "ch";
      }
    }
  }
}
export { wrapTablesWithScrollable, applyTableColumnMinWidths, TABLE_COLUMN_MIN_WIDTH_CAP_CH };
