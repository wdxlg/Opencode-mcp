// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/treeSitter/cursorUtils.ts



// src/vs/editor/common/model/tokens/treeSitter/cursorUtils.ts
function gotoNextSibling(newCursor, oldCursor) {
  const n2 = newCursor.gotoNextSibling();
  const o = oldCursor.gotoNextSibling();
  if (n2 !== o) {
    throw new Error("Trees are out of sync");
  }
  return n2 && o;
}

function gotoParent(newCursor, oldCursor) {
  const n2 = newCursor.gotoParent();
  const o = oldCursor.gotoParent();
  if (n2 !== o) {
    throw new Error("Trees are out of sync");
  }
  return n2 && o;
}

function gotoNthChild(newCursor, oldCursor, index2) {
  const n2 = newCursor.gotoFirstChild();
  const o = oldCursor.gotoFirstChild();
  if (n2 !== o) {
    throw new Error("Trees are out of sync");
  }
  if (index2 === 0) {
    return n2 && o;
  }
  for (let i2 = 1; i2 <= index2; i2++) {
    const nn = newCursor.gotoNextSibling();
    const oo = oldCursor.gotoNextSibling();
    if (nn !== oo) {
      throw new Error("Trees are out of sync");
    }
    if (!nn || !oo) {
      return false;
    }
  }
  return n2 && o;
}

function nextSiblingOrParentSibling(newCursor, oldCursor) {
  do {
    if (newCursor.currentNode.nextSibling) {
      return gotoNextSibling(newCursor, oldCursor);
    }
    if (newCursor.currentNode.parent) {
      gotoParent(newCursor, oldCursor);
    }
  } while (newCursor.currentNode.nextSibling || newCursor.currentNode.parent);
  return false;
}

function getClosestPreviousNodes(cursor, tree) {
  const findPrev = tree.walk();
  findPrev.resetTo(cursor);
  const startingNode = cursor.currentNode;
  do {
    if (findPrev.currentNode.previousSibling && findPrev.currentNode.endIndex - findPrev.currentNode.startIndex !== 0) {
      findPrev.gotoPreviousSibling();
    } else {
      while (!findPrev.currentNode.previousSibling && findPrev.currentNode.parent) {
        findPrev.gotoParent();
      }
      findPrev.gotoPreviousSibling();
    }
  } while (findPrev.currentNode.endIndex > startingNode.startIndex && (findPrev.currentNode.parent || findPrev.currentNode.previousSibling) && findPrev.currentNode.id !== startingNode.id);
  if (findPrev.currentNode.id !== startingNode.id && findPrev.currentNode.endIndex <= startingNode.startIndex) {
    return findPrev.currentNode;
  } else {
    return void 0;
  }
}
export { gotoNextSibling, gotoParent, gotoNthChild, nextSiblingOrParentSibling, getClosestPreviousNodes };
