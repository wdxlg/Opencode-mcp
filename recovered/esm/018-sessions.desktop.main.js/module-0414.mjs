// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/tokens/treeSitter/tokenStore.ts



// src/vs/editor/common/model/tokens/treeSitter/tokenStore.ts
var ListNode = class _ListNode {
  constructor(height) {
    this.height = height;
    this._children = [];
    this._length = 0;
  }
  get children() {
    return this._children;
  }
  get length() {
    return this._length;
  }
  static create(node1, node2) {
    const list2 = new _ListNode(node1.height + 1);
    list2.appendChild(node1);
    list2.appendChild(node2);
    return list2;
  }
  canAppendChild() {
    return this._children.length < 3;
  }
  appendChild(node) {
    if (!this.canAppendChild()) {
      throw new Error("Cannot insert more than 3 children in a ListNode");
    }
    this._children.push(node);
    this._length += node.length;
    this._updateParentLength(node.length);
    if (!isLeaf(node)) {
      node.parent = this;
    }
  }
  _updateParentLength(delta2) {
    let updateParent = this.parent;
    while (updateParent) {
      updateParent._length += delta2;
      updateParent = updateParent.parent;
    }
  }
  unappendChild() {
    const child = this._children.pop();
    this._length -= child.length;
    this._updateParentLength(-child.length);
    return child;
  }
  prependChild(node) {
    if (this._children.length >= 3) {
      throw new Error("Cannot prepend more than 3 children in a ListNode");
    }
    this._children.unshift(node);
    this._length += node.length;
    this._updateParentLength(node.length);
    if (!isLeaf(node)) {
      node.parent = this;
    }
  }
  unprependChild() {
    const child = this._children.shift();
    this._length -= child.length;
    this._updateParentLength(-child.length);
    return child;
  }
  lastChild() {
    return this._children[this._children.length - 1];
  }
  dispose() {
    this._children.splice(0, this._children.length);
  }
};

function isLeaf(node) {
  return node.token !== void 0;
}

function append3(node, nodeToAppend) {
  let curNode = node;
  const parents = [];
  let nodeToAppendOfCorrectHeight;
  while (true) {
    if (nodeToAppend.height === curNode.height) {
      nodeToAppendOfCorrectHeight = nodeToAppend;
      break;
    }
    if (isLeaf(curNode)) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.lastChild();
  }
  for (let i2 = parents.length - 1; i2 >= 0; i2--) {
    const parent = parents[i2];
    if (nodeToAppendOfCorrectHeight) {
      if (parent.children.length >= 3) {
        const newList = ListNode.create(parent.unappendChild(), nodeToAppendOfCorrectHeight);
        nodeToAppendOfCorrectHeight = newList;
      } else {
        parent.appendChild(nodeToAppendOfCorrectHeight);
        nodeToAppendOfCorrectHeight = void 0;
      }
    }
  }
  if (nodeToAppendOfCorrectHeight) {
    const newList = new ListNode(nodeToAppendOfCorrectHeight.height + 1);
    newList.appendChild(node);
    newList.appendChild(nodeToAppendOfCorrectHeight);
    return newList;
  } else {
    return node;
  }
}

function prepend3(list2, nodeToAppend) {
  let curNode = list2;
  const parents = [];
  while (nodeToAppend.height !== curNode.height) {
    if (isLeaf(curNode)) {
      throw new Error("unexpected");
    }
    parents.push(curNode);
    curNode = curNode.children[0];
  }
  let nodeToPrependOfCorrectHeight = nodeToAppend;
  for (let i2 = parents.length - 1; i2 >= 0; i2--) {
    const parent = parents[i2];
    if (nodeToPrependOfCorrectHeight) {
      if (parent.children.length >= 3) {
        nodeToPrependOfCorrectHeight = ListNode.create(nodeToPrependOfCorrectHeight, parent.unprependChild());
      } else {
        parent.prependChild(nodeToPrependOfCorrectHeight);
        nodeToPrependOfCorrectHeight = void 0;
      }
    }
  }
  if (nodeToPrependOfCorrectHeight) {
    return ListNode.create(nodeToPrependOfCorrectHeight, list2);
  } else {
    return list2;
  }
}

function concat2(node1, node2) {
  if (node1.height === node2.height) {
    return ListNode.create(node1, node2);
  } else if (node1.height > node2.height) {
    return append3(node1, node2);
  } else {
    return prepend3(node2, node1);
  }
}

var TokenStore = class _TokenStore {
  constructor(_textModel) {
    this._textModel = _textModel;
    this._root = this.createEmptyRoot();
  }
  get root() {
    return this._root;
  }
  createEmptyRoot() {
    return {
      length: this._textModel.getValueLength(),
      token: 0,
      height: 0,
      tokenQuality: 0 /* None */
    };
  }
  /**
   *
   * @param update all the tokens for the document in sequence
   */
  buildStore(tokens, tokenQuality) {
    this._root = this.createFromUpdates(tokens, tokenQuality);
  }
  createFromUpdates(tokens, tokenQuality) {
    if (tokens.length === 0) {
      return this.createEmptyRoot();
    }
    let newRoot = {
      length: tokens[0].length,
      token: tokens[0].token,
      height: 0,
      tokenQuality
    };
    for (let j = 1; j < tokens.length; j++) {
      newRoot = append3(newRoot, { length: tokens[j].length, token: tokens[j].token, height: 0, tokenQuality });
    }
    return newRoot;
  }
  /**
   *
   * @param tokens tokens are in sequence in the document.
   */
  update(length, tokens, tokenQuality) {
    if (tokens.length === 0) {
      return;
    }
    this.replace(length, tokens[0].startOffsetInclusive, tokens, tokenQuality);
  }
  delete(length, startOffset) {
    this.replace(length, startOffset, [], 2 /* EditGuess */);
  }
  /**
   *
   * @param tokens tokens are in sequence in the document.
   */
  replace(length, updateOffsetStart, tokens, tokenQuality) {
    const firstUnchangedOffsetAfterUpdate = updateOffsetStart + length;
    const precedingNodes = [];
    const postcedingNodes = [];
    const stack = [{ node: this._root, offset: 0 }];
    while (stack.length > 0) {
      const node = stack.pop();
      const currentOffset = node.offset;
      if (currentOffset < updateOffsetStart && currentOffset + node.node.length <= updateOffsetStart) {
        if (!isLeaf(node.node)) {
          node.node.parent = void 0;
        }
        precedingNodes.push(node.node);
        continue;
      } else if (isLeaf(node.node) && currentOffset < updateOffsetStart) {
        precedingNodes.push({ length: updateOffsetStart - currentOffset, token: node.node.token, height: 0, tokenQuality: node.node.tokenQuality });
      }
      if (updateOffsetStart <= currentOffset && currentOffset + node.node.length <= firstUnchangedOffsetAfterUpdate) {
        continue;
      }
      if (currentOffset >= firstUnchangedOffsetAfterUpdate) {
        if (!isLeaf(node.node)) {
          node.node.parent = void 0;
        }
        postcedingNodes.push(node.node);
        continue;
      } else if (isLeaf(node.node) && currentOffset + node.node.length > firstUnchangedOffsetAfterUpdate) {
        postcedingNodes.push({ length: currentOffset + node.node.length - firstUnchangedOffsetAfterUpdate, token: node.node.token, height: 0, tokenQuality: node.node.tokenQuality });
        continue;
      }
      if (!isLeaf(node.node)) {
        let childOffset = currentOffset + node.node.length;
        for (let i2 = node.node.children.length - 1; i2 >= 0; i2--) {
          childOffset -= node.node.children[i2].length;
          stack.push({ node: node.node.children[i2], offset: childOffset });
        }
      }
    }
    let allNodes;
    if (tokens.length > 0) {
      allNodes = precedingNodes.concat(this.createFromUpdates(tokens, tokenQuality), postcedingNodes);
    } else {
      allNodes = precedingNodes.concat(postcedingNodes);
    }
    let newRoot = allNodes[0];
    for (let i2 = 1; i2 < allNodes.length; i2++) {
      newRoot = concat2(newRoot, allNodes[i2]);
    }
    this._root = newRoot ?? this.createEmptyRoot();
  }
  /**
   *
   * @param startOffsetInclusive
   * @param endOffsetExclusive
   * @param visitor Return true from visitor to exit early
   * @returns
   */
  traverseInOrderInRange(startOffsetInclusive, endOffsetExclusive, visitor) {
    const stack = [{ node: this._root, offset: 0 }];
    while (stack.length > 0) {
      const { node, offset } = stack.pop();
      const nodeEnd = offset + node.length;
      if (nodeEnd <= startOffsetInclusive || offset >= endOffsetExclusive) {
        continue;
      }
      if (visitor(node, offset)) {
        return;
      }
      if (!isLeaf(node)) {
        let childOffset = offset + node.length;
        for (let i2 = node.children.length - 1; i2 >= 0; i2--) {
          childOffset -= node.children[i2].length;
          stack.push({ node: node.children[i2], offset: childOffset });
        }
      }
    }
  }
  getTokenAt(offset) {
    let result;
    this.traverseInOrderInRange(offset, this._root.length, (node, offset2) => {
      if (isLeaf(node)) {
        result = { token: node.token, startOffsetInclusive: offset2, length: node.length };
        return true;
      }
      return false;
    });
    return result;
  }
  getTokensInRange(startOffsetInclusive, endOffsetExclusive) {
    const result = [];
    this.traverseInOrderInRange(startOffsetInclusive, endOffsetExclusive, (node, offset) => {
      if (isLeaf(node)) {
        let clippedLength = node.length;
        let clippedOffset = offset;
        if (offset < startOffsetInclusive && offset + node.length > endOffsetExclusive) {
          clippedOffset = startOffsetInclusive;
          clippedLength = endOffsetExclusive - startOffsetInclusive;
        } else if (offset < startOffsetInclusive) {
          clippedLength -= startOffsetInclusive - offset;
          clippedOffset = startOffsetInclusive;
        } else if (offset + node.length > endOffsetExclusive) {
          clippedLength -= offset + node.length - endOffsetExclusive;
        }
        result.push({ token: node.token, startOffsetInclusive: clippedOffset, length: clippedLength });
      }
      return false;
    });
    return result;
  }
  markForRefresh(startOffsetInclusive, endOffsetExclusive) {
    this.traverseInOrderInRange(startOffsetInclusive, endOffsetExclusive, (node) => {
      if (isLeaf(node)) {
        node.tokenQuality = 0 /* None */;
      }
      return false;
    });
  }
  rangeHasTokens(startOffsetInclusive, endOffsetExclusive, minimumTokenQuality) {
    let hasAny = true;
    this.traverseInOrderInRange(startOffsetInclusive, endOffsetExclusive, (node) => {
      if (isLeaf(node) && node.tokenQuality < minimumTokenQuality) {
        hasAny = false;
      }
      return false;
    });
    return hasAny;
  }
  rangeNeedsRefresh(startOffsetInclusive, endOffsetExclusive) {
    let needsRefresh = false;
    this.traverseInOrderInRange(startOffsetInclusive, endOffsetExclusive, (node) => {
      if (isLeaf(node) && node.tokenQuality !== 3 /* Accurate */) {
        needsRefresh = true;
      }
      return false;
    });
    return needsRefresh;
  }
  getNeedsRefresh() {
    const result = [];
    this.traverseInOrderInRange(0, this._textModel.getValueLength(), (node, offset) => {
      if (isLeaf(node) && node.tokenQuality !== 3 /* Accurate */) {
        if (result.length > 0 && result[result.length - 1].endOffset === offset) {
          result[result.length - 1].endOffset += node.length;
        } else {
          result.push({ startOffset: offset, endOffset: offset + node.length });
        }
      }
      return false;
    });
    return result;
  }
  deepCopy() {
    const newStore = new _TokenStore(this._textModel);
    newStore._root = this._copyNodeIterative(this._root);
    return newStore;
  }
  _copyNodeIterative(root) {
    const newRoot = isLeaf(root) ? { length: root.length, token: root.token, tokenQuality: root.tokenQuality, height: root.height } : new ListNode(root.height);
    const stack = [[root, newRoot]];
    while (stack.length > 0) {
      const [oldNode, clonedNode] = stack.pop();
      if (!isLeaf(oldNode)) {
        for (const child of oldNode.children) {
          const childCopy = isLeaf(child) ? { length: child.length, token: child.token, tokenQuality: child.tokenQuality, height: child.height } : new ListNode(child.height);
          clonedNode.appendChild(childCopy);
          stack.push([child, childCopy]);
        }
      }
    }
    return newRoot;
  }
  /**
   * Returns a string representation of the token tree using an iterative approach
   */
  printTree(root = this._root) {
    const result = [];
    const stack = [[root, 0]];
    while (stack.length > 0) {
      const [node, depth] = stack.pop();
      const indent = "  ".repeat(depth);
      if (isLeaf(node)) {
        result.push(`${indent}Leaf(length: ${node.length}, token: ${node.token}, refresh: ${node.tokenQuality})
`);
      } else {
        result.push(`${indent}List(length: ${node.length})
`);
        for (let i2 = node.children.length - 1; i2 >= 0; i2--) {
          stack.push([node.children[i2], depth + 1]);
        }
      }
    }
    return result.join("");
  }
  dispose() {
    const stack = [[this._root, false]];
    while (stack.length > 0) {
      const [node, visited] = stack.pop();
      if (isLeaf(node)) {
      } else if (!visited) {
        stack.push([node, true]);
        for (let i2 = node.children.length - 1; i2 >= 0; i2--) {
          stack.push([node.children[i2], false]);
        }
      } else {
        node.dispose();
        node.parent = void 0;
      }
    }
    this._root = void 0;
  }
};
export { isLeaf, append3, prepend3, concat2, ListNode, TokenStore };
