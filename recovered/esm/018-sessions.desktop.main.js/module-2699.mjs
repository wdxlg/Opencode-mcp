// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/notebookCellChanges.ts



// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/notebookCellChanges.ts
function countChanges(changes) {
  return changes.reduce((count2, change) => {
    const diff4 = change.diff.get();
    if (diff4.identical) {
      return count2;
    }
    switch (change.type) {
      case "delete":
        return count2 + 1;
      // We want to see 1 deleted entry in the pill for navigation
      case "insert":
        return count2 + 1;
      // We want to see 1 new entry in the pill for navigation
      case "modified":
        return count2 + diff4.changes.length;
      default:
        return count2;
    }
  }, 0);
}

function sortCellChanges(changes) {
  const indexes = /* @__PURE__ */ new Map();
  changes.forEach((c, i2) => indexes.set(c, i2));
  return [...changes].sort((a, b) => {
    if ((a.type === "unchanged" || a.type === "modified") && (b.type === "unchanged" || b.type === "modified")) {
      return a.modifiedCellIndex - b.modifiedCellIndex;
    }
    if (a.type === "delete" && b.type === "delete") {
      return a.originalCellIndex - b.originalCellIndex;
    }
    if (a.type === "insert" && b.type === "insert") {
      return a.modifiedCellIndex - b.modifiedCellIndex;
    }
    if (a.type === "delete" && b.type === "insert") {
      return indexes.get(a) - indexes.get(b);
    }
    if (a.type === "insert" && b.type === "delete") {
      return indexes.get(a) - indexes.get(b);
    }
    if (a.type === "delete" && b.type !== "insert" || a.type !== "insert" && b.type === "delete") {
      return a.originalCellIndex - b.originalCellIndex;
    }
    const aIndex = a.type === "delete" ? a.originalCellIndex : a.type === "insert" ? a.modifiedCellIndex : a.modifiedCellIndex;
    const bIndex = b.type === "delete" ? b.originalCellIndex : b.type === "insert" ? b.modifiedCellIndex : b.modifiedCellIndex;
    return aIndex - bIndex;
  });
}
export { countChanges, sortCellChanges };
