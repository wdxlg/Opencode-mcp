// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees.ts
import { ListAstNode } from "./module-0381.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/concat23Trees.ts
function concat23Trees(items) {
  if (items.length === 0) {
    return null;
  }
  if (items.length === 1) {
    return items[0];
  }
  let i2 = 0;
  function readNode() {
    if (i2 >= items.length) {
      return null;
    }
    const start = i2;
    const height = items[start].listHeight;
    i2++;
    while (i2 < items.length && items[i2].listHeight === height) {
      i2++;
    }
    if (i2 - start >= 2) {
      return concat23TreesOfSameHeight(start === 0 && i2 === items.length ? items : items.slice(start, i2), false);
    } else {
      return items[start];
    }
  }
  let first2 = readNode();
  let second = readNode();
  if (!second) {
    return first2;
  }
  for (let item = readNode(); item; item = readNode()) {
    if (heightDiff(first2, second) <= heightDiff(second, item)) {
      first2 = concat(first2, second);
      second = item;
    } else {
      second = concat(second, item);
    }
  }
  const result = concat(first2, second);
  return result;
}

function concat23TreesOfSameHeight(items, createImmutableLists = false) {
  if (items.length === 0) {
    return null;
  }
  if (items.length === 1) {
    return items[0];
  }
  let length = items.length;
  while (length > 3) {
    const newLength = length >> 1;
    for (let i2 = 0; i2 < newLength; i2++) {
      const j = i2 << 1;
      items[i2] = ListAstNode.create23(items[j], items[j + 1], j + 3 === length ? items[j + 2] : null, createImmutableLists);
    }
    length = newLength;
  }
  return ListAstNode.create23(items[0], items[1], length >= 3 ? items[2] : null, createImmutableLists);
}

function heightDiff(node1, node2) {
  return Math.abs(node1.listHeight - node2.listHeight);
}

function concat(node1, node2) {
  if (node1.listHeight === node2.listHeight) {
    return ListAstNode.create23(node1, node2, null, false);
  } else if (node1.listHeight > node2.listHeight) {
    return append2(node1, node2);
  } else {
    return prepend2(node2, node1);
  }
}

function append2(list2, nodeToAppend) {
  list2 = list2.toMutable();
  let curNode = list2;
  const parents = [];
  let nodeToAppendOfCorrectHeight;
  while (true) {
    if (nodeToAppend.listHeight === curNode.listHeight) {
      nodeToAppendOfCorrectHeight = nodeToAppend;
      break;
    }
    if (curNode.kind !== 4 /* List */) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.makeLastElementMutable();
  }
  for (let i2 = parents.length - 1; i2 >= 0; i2--) {
    const parent = parents[i2];
    if (nodeToAppendOfCorrectHeight) {
      if (parent.childrenLength >= 3) {
        nodeToAppendOfCorrectHeight = ListAstNode.create23(parent.unappendChild(), nodeToAppendOfCorrectHeight, null, false);
      } else {
        parent.appendChildOfSameHeight(nodeToAppendOfCorrectHeight);
        nodeToAppendOfCorrectHeight = void 0;
      }
    } else {
      parent.handleChildrenChanged();
    }
  }
  if (nodeToAppendOfCorrectHeight) {
    return ListAstNode.create23(list2, nodeToAppendOfCorrectHeight, null, false);
  } else {
    return list2;
  }
}

function prepend2(list2, nodeToAppend) {
  list2 = list2.toMutable();
  let curNode = list2;
  const parents = [];
  while (nodeToAppend.listHeight !== curNode.listHeight) {
    if (curNode.kind !== 4 /* List */) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.makeFirstElementMutable();
  }
  let nodeToPrependOfCorrectHeight = nodeToAppend;
  for (let i2 = parents.length - 1; i2 >= 0; i2--) {
    const parent = parents[i2];
    if (nodeToPrependOfCorrectHeight) {
      if (parent.childrenLength >= 3) {
        nodeToPrependOfCorrectHeight = ListAstNode.create23(nodeToPrependOfCorrectHeight, parent.unprependChild(), null, false);
      } else {
        parent.prependChildOfSameHeight(nodeToPrependOfCorrectHeight);
        nodeToPrependOfCorrectHeight = void 0;
      }
    } else {
      parent.handleChildrenChanged();
    }
  }
  if (nodeToPrependOfCorrectHeight) {
    return ListAstNode.create23(nodeToPrependOfCorrectHeight, list2, null, false);
  } else {
    return list2;
  }
}
export { concat23Trees, concat23TreesOfSameHeight, heightDiff, concat, append2, prepend2 };
