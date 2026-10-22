// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase.ts



// src/vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase.ts
var TreeNode = class {
  // line feeds cnt in the left subtree (not in order)
  constructor(piece, color2) {
    this.piece = piece;
    this.color = color2;
    this.size_left = 0;
    this.lf_left = 0;
    this.parent = this;
    this.left = this;
    this.right = this;
  }
  next() {
    if (this.right !== SENTINEL2) {
      return leftest2(this.right);
    }
    let node = this;
    while (node.parent !== SENTINEL2) {
      if (node.parent.left === node) {
        break;
      }
      node = node.parent;
    }
    if (node.parent === SENTINEL2) {
      return SENTINEL2;
    } else {
      return node.parent;
    }
  }
  prev() {
    if (this.left !== SENTINEL2) {
      return righttest(this.left);
    }
    let node = this;
    while (node.parent !== SENTINEL2) {
      if (node.parent.right === node) {
        break;
      }
      node = node.parent;
    }
    if (node.parent === SENTINEL2) {
      return SENTINEL2;
    } else {
      return node.parent;
    }
  }
  detach() {
    this.parent = null;
    this.left = null;
    this.right = null;
  }
};

var SENTINEL2 = new TreeNode(null, 0 /* Black */);

SENTINEL2.parent = SENTINEL2;

SENTINEL2.left = SENTINEL2;

SENTINEL2.right = SENTINEL2;

SENTINEL2.color = 0 /* Black */;

function leftest2(node) {
  while (node.left !== SENTINEL2) {
    node = node.left;
  }
  return node;
}

function righttest(node) {
  while (node.right !== SENTINEL2) {
    node = node.right;
  }
  return node;
}

function calculateSize(node) {
  if (node === SENTINEL2) {
    return 0;
  }
  return node.size_left + node.piece.length + calculateSize(node.right);
}

function calculateLF(node) {
  if (node === SENTINEL2) {
    return 0;
  }
  return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
}

function resetSentinel2() {
  SENTINEL2.parent = SENTINEL2;
}

function leftRotate3(tree, x) {
  const y = x.right;
  y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
  y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
  x.right = y.left;
  if (y.left !== SENTINEL2) {
    y.left.parent = x;
  }
  y.parent = x.parent;
  if (x.parent === SENTINEL2) {
    tree.root = y;
  } else if (x.parent.left === x) {
    x.parent.left = y;
  } else {
    x.parent.right = y;
  }
  y.left = x;
  x.parent = y;
}

function rightRotate2(tree, y) {
  const x = y.left;
  y.left = x.right;
  if (x.right !== SENTINEL2) {
    x.right.parent = y;
  }
  x.parent = y.parent;
  y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
  y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
  if (y.parent === SENTINEL2) {
    tree.root = x;
  } else if (y === y.parent.right) {
    y.parent.right = x;
  } else {
    y.parent.left = x;
  }
  x.right = y;
  y.parent = x;
}

function rbDelete(tree, z) {
  let x;
  let y;
  if (z.left === SENTINEL2) {
    y = z;
    x = y.right;
  } else if (z.right === SENTINEL2) {
    y = z;
    x = y.left;
  } else {
    y = leftest2(z.right);
    x = y.right;
  }
  if (y === tree.root) {
    tree.root = x;
    x.color = 0 /* Black */;
    z.detach();
    resetSentinel2();
    tree.root.parent = SENTINEL2;
    return;
  }
  const yWasRed = y.color === 1 /* Red */;
  if (y === y.parent.left) {
    y.parent.left = x;
  } else {
    y.parent.right = x;
  }
  if (y === z) {
    x.parent = y.parent;
    recomputeTreeMetadata(tree, x);
  } else {
    if (y.parent === z) {
      x.parent = y;
    } else {
      x.parent = y.parent;
    }
    recomputeTreeMetadata(tree, x);
    y.left = z.left;
    y.right = z.right;
    y.parent = z.parent;
    y.color = z.color;
    if (z === tree.root) {
      tree.root = y;
    } else {
      if (z === z.parent.left) {
        z.parent.left = y;
      } else {
        z.parent.right = y;
      }
    }
    if (y.left !== SENTINEL2) {
      y.left.parent = y;
    }
    if (y.right !== SENTINEL2) {
      y.right.parent = y;
    }
    y.size_left = z.size_left;
    y.lf_left = z.lf_left;
    recomputeTreeMetadata(tree, y);
  }
  z.detach();
  if (x.parent.left === x) {
    const newSizeLeft = calculateSize(x);
    const newLFLeft = calculateLF(x);
    if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
      const delta2 = newSizeLeft - x.parent.size_left;
      const lf_delta = newLFLeft - x.parent.lf_left;
      x.parent.size_left = newSizeLeft;
      x.parent.lf_left = newLFLeft;
      updateTreeMetadata(tree, x.parent, delta2, lf_delta);
    }
  }
  recomputeTreeMetadata(tree, x.parent);
  if (yWasRed) {
    resetSentinel2();
    return;
  }
  let w;
  while (x !== tree.root && x.color === 0 /* Black */) {
    if (x === x.parent.left) {
      w = x.parent.right;
      if (w.color === 1 /* Red */) {
        w.color = 0 /* Black */;
        x.parent.color = 1 /* Red */;
        leftRotate3(tree, x.parent);
        w = x.parent.right;
      }
      if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
        w.color = 1 /* Red */;
        x = x.parent;
      } else {
        if (w.right.color === 0 /* Black */) {
          w.left.color = 0 /* Black */;
          w.color = 1 /* Red */;
          rightRotate2(tree, w);
          w = x.parent.right;
        }
        w.color = x.parent.color;
        x.parent.color = 0 /* Black */;
        w.right.color = 0 /* Black */;
        leftRotate3(tree, x.parent);
        x = tree.root;
      }
    } else {
      w = x.parent.left;
      if (w.color === 1 /* Red */) {
        w.color = 0 /* Black */;
        x.parent.color = 1 /* Red */;
        rightRotate2(tree, x.parent);
        w = x.parent.left;
      }
      if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
        w.color = 1 /* Red */;
        x = x.parent;
      } else {
        if (w.left.color === 0 /* Black */) {
          w.right.color = 0 /* Black */;
          w.color = 1 /* Red */;
          leftRotate3(tree, w);
          w = x.parent.left;
        }
        w.color = x.parent.color;
        x.parent.color = 0 /* Black */;
        w.left.color = 0 /* Black */;
        rightRotate2(tree, x.parent);
        x = tree.root;
      }
    }
  }
  x.color = 0 /* Black */;
  resetSentinel2();
}

function fixInsert(tree, x) {
  recomputeTreeMetadata(tree, x);
  while (x !== tree.root && x.parent.color === 1 /* Red */) {
    if (x.parent === x.parent.parent.left) {
      const y = x.parent.parent.right;
      if (y.color === 1 /* Red */) {
        x.parent.color = 0 /* Black */;
        y.color = 0 /* Black */;
        x.parent.parent.color = 1 /* Red */;
        x = x.parent.parent;
      } else {
        if (x === x.parent.right) {
          x = x.parent;
          leftRotate3(tree, x);
        }
        x.parent.color = 0 /* Black */;
        x.parent.parent.color = 1 /* Red */;
        rightRotate2(tree, x.parent.parent);
      }
    } else {
      const y = x.parent.parent.left;
      if (y.color === 1 /* Red */) {
        x.parent.color = 0 /* Black */;
        y.color = 0 /* Black */;
        x.parent.parent.color = 1 /* Red */;
        x = x.parent.parent;
      } else {
        if (x === x.parent.left) {
          x = x.parent;
          rightRotate2(tree, x);
        }
        x.parent.color = 0 /* Black */;
        x.parent.parent.color = 1 /* Red */;
        leftRotate3(tree, x.parent.parent);
      }
    }
  }
  tree.root.color = 0 /* Black */;
}

function updateTreeMetadata(tree, x, delta2, lineFeedCntDelta) {
  while (x !== tree.root && x !== SENTINEL2) {
    if (x.parent.left === x) {
      x.parent.size_left += delta2;
      x.parent.lf_left += lineFeedCntDelta;
    }
    x = x.parent;
  }
}

function recomputeTreeMetadata(tree, x) {
  let delta2 = 0;
  let lf_delta = 0;
  if (x === tree.root) {
    return;
  }
  while (x !== tree.root && x === x.parent.right) {
    x = x.parent;
  }
  if (x === tree.root) {
    return;
  }
  x = x.parent;
  delta2 = calculateSize(x.left) - x.size_left;
  lf_delta = calculateLF(x.left) - x.lf_left;
  x.size_left += delta2;
  x.lf_left += lf_delta;
  while (x !== tree.root && (delta2 !== 0 || lf_delta !== 0)) {
    if (x.parent.left === x) {
      x.parent.size_left += delta2;
      x.parent.lf_left += lf_delta;
    }
    x = x.parent;
  }
}
export { leftest2, righttest, calculateSize, calculateLF, resetSentinel2, leftRotate3, rightRotate2, rbDelete, fixInsert, updateTreeMetadata, recomputeTreeMetadata, TreeNode, SENTINEL2 };
