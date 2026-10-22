// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/grid/gridview.ts
import { Color } from "./module-0197.mjs";
import { rot } from "./module-0040.mjs";
import { Emitter, Event2, Relay } from "./module-0017.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { $ } from "./module-0075.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { isUndefined } from "./module-0010.mjs";
import { equals, tail } from "./module-0007.mjs";


// src/vs/base/browser/ui/grid/gridview.ts
var defaultStyles2 = {
  separatorBorder: Color.transparent
};

function orthogonal(orientation) {
  return orientation === 0 /* VERTICAL */ ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
}

var LayoutController = class {
  constructor(isLayoutEnabled) {
    this.isLayoutEnabled = isLayoutEnabled;
  }
};

function toAbsoluteBoundarySashes(sashes, orientation) {
  if (orientation === 1 /* HORIZONTAL */) {
    return { left: sashes.start, right: sashes.end, top: sashes.orthogonalStart, bottom: sashes.orthogonalEnd };
  } else {
    return { top: sashes.start, bottom: sashes.end, left: sashes.orthogonalStart, right: sashes.orthogonalEnd };
  }
}

function fromAbsoluteBoundarySashes(sashes, orientation) {
  if (orientation === 1 /* HORIZONTAL */) {
    return { start: sashes.left, end: sashes.right, orthogonalStart: sashes.top, orthogonalEnd: sashes.bottom };
  } else {
    return { start: sashes.top, end: sashes.bottom, orthogonalStart: sashes.left, orthogonalEnd: sashes.right };
  }
}

function validateIndex(index2, numChildren) {
  if (Math.abs(index2) > numChildren) {
    throw new Error("Invalid index");
  }
  return rot(index2, numChildren + 1);
}

var BranchNode = class _BranchNode {
  constructor(orientation, layoutController, styles, splitviewProportionalLayout, size3 = 0, orthogonalSize = 0, edgeSnapping = false, childDescriptors) {
    this.orientation = orientation;
    this.layoutController = layoutController;
    this.splitviewProportionalLayout = splitviewProportionalLayout;
    this.children = [];
    this._absoluteOffset = 0;
    this._absoluteOrthogonalOffset = 0;
    this.absoluteOrthogonalSize = 0;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._onDidVisibilityChange = new Emitter();
    this.onDidVisibilityChange = this._onDidVisibilityChange.event;
    this.childrenVisibilityChangeDisposable = new DisposableStore();
    this._onDidScroll = new Emitter();
    this.onDidScrollDisposable = Disposable.None;
    this.onDidScroll = this._onDidScroll.event;
    this.childrenChangeDisposable = Disposable.None;
    this._onDidSashReset = new Emitter();
    this.onDidSashReset = this._onDidSashReset.event;
    this.splitviewSashResetDisposable = Disposable.None;
    this.childrenSashResetDisposable = Disposable.None;
    this._boundarySashes = {};
    this._edgeSnapping = false;
    this._styles = styles;
    this._size = size3;
    this._orthogonalSize = orthogonalSize;
    this.element = $(".monaco-grid-branch-node");
    if (!childDescriptors) {
      this.splitview = new SplitView(this.element, { orientation, styles, proportionalLayout: splitviewProportionalLayout });
      this.splitview.layout(size3, { orthogonalSize, absoluteOffset: 0, absoluteOrthogonalOffset: 0, absoluteSize: size3, absoluteOrthogonalSize: orthogonalSize });
    } else {
      const descriptor = {
        views: childDescriptors.map((childDescriptor) => {
          return {
            view: childDescriptor.node,
            size: childDescriptor.node.size,
            visible: childDescriptor.visible !== false
          };
        }),
        size: this.orthogonalSize
      };
      const options3 = { proportionalLayout: splitviewProportionalLayout, orientation, styles };
      this.children = childDescriptors.map((c) => c.node);
      this.splitview = new SplitView(this.element, { ...options3, descriptor });
      this.children.forEach((node, index2) => {
        const first2 = index2 === 0;
        const last = index2 === this.children.length;
        node.boundarySashes = {
          start: this.boundarySashes.orthogonalStart,
          end: this.boundarySashes.orthogonalEnd,
          orthogonalStart: first2 ? this.boundarySashes.start : this.splitview.sashes[index2 - 1],
          orthogonalEnd: last ? this.boundarySashes.end : this.splitview.sashes[index2]
        };
      });
    }
    const onDidSashReset = Event2.map(this.splitview.onDidSashReset, (i2) => [i2]);
    this.splitviewSashResetDisposable = onDidSashReset(this._onDidSashReset.fire, this._onDidSashReset);
    this.updateChildrenEvents();
  }
  get size() {
    return this._size;
  }
  get orthogonalSize() {
    return this._orthogonalSize;
  }
  get absoluteOffset() {
    return this._absoluteOffset;
  }
  get absoluteOrthogonalOffset() {
    return this._absoluteOrthogonalOffset;
  }
  get styles() {
    return this._styles;
  }
  get width() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.size : this.orthogonalSize;
  }
  get height() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.orthogonalSize : this.size;
  }
  get top() {
    return this.orientation === 1 /* HORIZONTAL */ ? this._absoluteOffset : this._absoluteOrthogonalOffset;
  }
  get left() {
    return this.orientation === 1 /* HORIZONTAL */ ? this._absoluteOrthogonalOffset : this._absoluteOffset;
  }
  get minimumSize() {
    return this.children.length === 0 ? 0 : Math.max(...this.children.map((c, index2) => this.splitview.isViewVisible(index2) ? c.minimumOrthogonalSize : 0));
  }
  get maximumSize() {
    return Math.min(...this.children.map((c, index2) => this.splitview.isViewVisible(index2) ? c.maximumOrthogonalSize : Number.POSITIVE_INFINITY));
  }
  get priority() {
    if (this.children.length === 0) {
      return 0 /* Normal */;
    }
    const priorities = this.children.map((c) => typeof c.priority === "undefined" ? 0 /* Normal */ : c.priority);
    if (priorities.some((p) => p === 2 /* High */)) {
      return 2 /* High */;
    } else if (priorities.some((p) => p === 1 /* Low */)) {
      return 1 /* Low */;
    }
    return 0 /* Normal */;
  }
  get proportionalLayout() {
    if (this.children.length === 0) {
      return true;
    }
    return this.children.every((c) => c.proportionalLayout);
  }
  get minimumOrthogonalSize() {
    return this.splitview.minimumSize;
  }
  get maximumOrthogonalSize() {
    return this.splitview.maximumSize;
  }
  get minimumWidth() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.minimumOrthogonalSize : this.minimumSize;
  }
  get minimumHeight() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.minimumSize : this.minimumOrthogonalSize;
  }
  get maximumWidth() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.maximumOrthogonalSize : this.maximumSize;
  }
  get maximumHeight() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.maximumSize : this.maximumOrthogonalSize;
  }
  get boundarySashes() {
    return this._boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    if (this._boundarySashes.start === boundarySashes.start && this._boundarySashes.end === boundarySashes.end && this._boundarySashes.orthogonalStart === boundarySashes.orthogonalStart && this._boundarySashes.orthogonalEnd === boundarySashes.orthogonalEnd) {
      return;
    }
    this._boundarySashes = boundarySashes;
    this.splitview.orthogonalStartSash = boundarySashes.orthogonalStart;
    this.splitview.orthogonalEndSash = boundarySashes.orthogonalEnd;
    for (let index2 = 0; index2 < this.children.length; index2++) {
      const child = this.children[index2];
      const first2 = index2 === 0;
      const last = index2 === this.children.length - 1;
      child.boundarySashes = {
        start: boundarySashes.orthogonalStart,
        end: boundarySashes.orthogonalEnd,
        orthogonalStart: first2 ? boundarySashes.start : child.boundarySashes.orthogonalStart,
        orthogonalEnd: last ? boundarySashes.end : child.boundarySashes.orthogonalEnd
      };
    }
  }
  get edgeSnapping() {
    return this._edgeSnapping;
  }
  set edgeSnapping(edgeSnapping) {
    if (this._edgeSnapping === edgeSnapping) {
      return;
    }
    this._edgeSnapping = edgeSnapping;
    for (const child of this.children) {
      if (child instanceof _BranchNode) {
        child.edgeSnapping = edgeSnapping;
      }
    }
    this.updateSplitviewEdgeSnappingEnablement();
  }
  style(styles) {
    this._styles = styles;
    this.splitview.style(styles);
    for (const child of this.children) {
      if (child instanceof _BranchNode) {
        child.style(styles);
      }
    }
  }
  layout(size3, offset, ctx) {
    if (!this.layoutController.isLayoutEnabled) {
      return;
    }
    if (typeof ctx === "undefined") {
      throw new Error("Invalid state");
    }
    this._size = ctx.orthogonalSize;
    this._orthogonalSize = size3;
    this._absoluteOffset = ctx.absoluteOffset + offset;
    this._absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
    this.absoluteOrthogonalSize = ctx.absoluteOrthogonalSize;
    this.splitview.layout(ctx.orthogonalSize, {
      orthogonalSize: size3,
      absoluteOffset: this._absoluteOrthogonalOffset,
      absoluteOrthogonalOffset: this._absoluteOffset,
      absoluteSize: ctx.absoluteOrthogonalSize,
      absoluteOrthogonalSize: ctx.absoluteSize
    });
    this.updateSplitviewEdgeSnappingEnablement();
  }
  setVisible(visible) {
    for (const child of this.children) {
      child.setVisible(visible);
    }
  }
  addChild(node, size3, index2, skipLayout) {
    index2 = validateIndex(index2, this.children.length);
    this.splitview.addView(node, size3, index2, skipLayout);
    this.children.splice(index2, 0, node);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
  }
  removeChild(index2, sizing) {
    index2 = validateIndex(index2, this.children.length);
    const result = this.splitview.removeView(index2, sizing);
    this.children.splice(index2, 1);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
    return result;
  }
  removeAllChildren() {
    const result = this.splitview.removeAllViews();
    this.children.splice(0, this.children.length);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
    return result;
  }
  moveChild(from, to) {
    from = validateIndex(from, this.children.length);
    to = validateIndex(to, this.children.length);
    if (from === to) {
      return;
    }
    if (from < to) {
      to -= 1;
    }
    this.splitview.moveView(from, to);
    this.children.splice(to, 0, this.children.splice(from, 1)[0]);
    this.updateBoundarySashes();
    this.onDidChildrenChange();
  }
  swapChildren(from, to) {
    from = validateIndex(from, this.children.length);
    to = validateIndex(to, this.children.length);
    if (from === to) {
      return;
    }
    this.splitview.swapViews(from, to);
    [this.children[from].boundarySashes, this.children[to].boundarySashes] = [this.children[from].boundarySashes, this.children[to].boundarySashes];
    [this.children[from], this.children[to]] = [this.children[to], this.children[from]];
    this.onDidChildrenChange();
  }
  resizeChild(index2, size3) {
    index2 = validateIndex(index2, this.children.length);
    this.splitview.resizeView(index2, size3);
  }
  isChildExpanded(index2) {
    return this.splitview.isViewExpanded(index2);
  }
  distributeViewSizes(recursive = false) {
    this.splitview.distributeViewSizes();
    if (recursive) {
      for (const child of this.children) {
        if (child instanceof _BranchNode) {
          child.distributeViewSizes(true);
        }
      }
    }
  }
  getChildSize(index2) {
    index2 = validateIndex(index2, this.children.length);
    return this.splitview.getViewSize(index2);
  }
  isChildVisible(index2) {
    index2 = validateIndex(index2, this.children.length);
    return this.splitview.isViewVisible(index2);
  }
  setChildVisible(index2, visible) {
    index2 = validateIndex(index2, this.children.length);
    if (this.splitview.isViewVisible(index2) === visible) {
      return;
    }
    const wereAllChildrenHidden = this.splitview.contentSize === 0;
    this.splitview.setViewVisible(index2, visible);
    const areAllChildrenHidden = this.splitview.contentSize === 0;
    if (visible && wereAllChildrenHidden || !visible && areAllChildrenHidden) {
      this._onDidVisibilityChange.fire(visible);
    }
  }
  getChildCachedVisibleSize(index2) {
    index2 = validateIndex(index2, this.children.length);
    return this.splitview.getViewCachedVisibleSize(index2);
  }
  updateBoundarySashes() {
    for (let i2 = 0; i2 < this.children.length; i2++) {
      this.children[i2].boundarySashes = {
        start: this.boundarySashes.orthogonalStart,
        end: this.boundarySashes.orthogonalEnd,
        orthogonalStart: i2 === 0 ? this.boundarySashes.start : this.splitview.sashes[i2 - 1],
        orthogonalEnd: i2 === this.children.length - 1 ? this.boundarySashes.end : this.splitview.sashes[i2]
      };
    }
  }
  onDidChildrenChange() {
    this.updateChildrenEvents();
    this._onDidChange.fire(void 0);
  }
  updateChildrenEvents() {
    const onDidChildrenChange = Event2.map(Event2.any(...this.children.map((c) => c.onDidChange)), () => void 0);
    this.childrenChangeDisposable.dispose();
    this.childrenChangeDisposable = onDidChildrenChange(this._onDidChange.fire, this._onDidChange);
    const onDidChildrenSashReset = Event2.any(...this.children.map((c, i2) => Event2.map(c.onDidSashReset, (location2) => [i2, ...location2])));
    this.childrenSashResetDisposable.dispose();
    this.childrenSashResetDisposable = onDidChildrenSashReset(this._onDidSashReset.fire, this._onDidSashReset);
    const onDidScroll = Event2.any(Event2.signal(this.splitview.onDidScroll), ...this.children.map((c) => c.onDidScroll));
    this.onDidScrollDisposable.dispose();
    this.onDidScrollDisposable = onDidScroll(this._onDidScroll.fire, this._onDidScroll);
    this.childrenVisibilityChangeDisposable.clear();
    this.children.forEach((child, index2) => {
      if (child instanceof _BranchNode) {
        this.childrenVisibilityChangeDisposable.add(child.onDidVisibilityChange((visible) => {
          this.setChildVisible(index2, visible);
        }));
      }
    });
  }
  trySet2x2(other) {
    if (this.children.length !== 2 || other.children.length !== 2) {
      return Disposable.None;
    }
    if (this.getChildSize(0) !== other.getChildSize(0)) {
      return Disposable.None;
    }
    const [firstChild, secondChild] = this.children;
    const [otherFirstChild, otherSecondChild] = other.children;
    if (!(firstChild instanceof LeafNode) || !(secondChild instanceof LeafNode)) {
      return Disposable.None;
    }
    if (!(otherFirstChild instanceof LeafNode) || !(otherSecondChild instanceof LeafNode)) {
      return Disposable.None;
    }
    if (this.orientation === 0 /* VERTICAL */) {
      secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = firstChild;
      firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = secondChild;
      otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = otherFirstChild;
      otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = otherSecondChild;
    } else {
      otherFirstChild.linkedWidthNode = secondChild.linkedHeightNode = firstChild;
      otherSecondChild.linkedWidthNode = firstChild.linkedHeightNode = secondChild;
      firstChild.linkedWidthNode = otherSecondChild.linkedHeightNode = otherFirstChild;
      secondChild.linkedWidthNode = otherFirstChild.linkedHeightNode = otherSecondChild;
    }
    const mySash = this.splitview.sashes[0];
    const otherSash = other.splitview.sashes[0];
    mySash.linkedSash = otherSash;
    otherSash.linkedSash = mySash;
    this._onDidChange.fire(void 0);
    other._onDidChange.fire(void 0);
    return toDisposable(() => {
      mySash.linkedSash = otherSash.linkedSash = void 0;
      firstChild.linkedHeightNode = firstChild.linkedWidthNode = void 0;
      secondChild.linkedHeightNode = secondChild.linkedWidthNode = void 0;
      otherFirstChild.linkedHeightNode = otherFirstChild.linkedWidthNode = void 0;
      otherSecondChild.linkedHeightNode = otherSecondChild.linkedWidthNode = void 0;
    });
  }
  updateSplitviewEdgeSnappingEnablement() {
    this.splitview.startSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset > 0;
    this.splitview.endSnappingEnabled = this._edgeSnapping || this._absoluteOrthogonalOffset + this._size < this.absoluteOrthogonalSize;
  }
  dispose() {
    for (const child of this.children) {
      child.dispose();
    }
    this._onDidChange.dispose();
    this._onDidScroll.dispose();
    this._onDidSashReset.dispose();
    this._onDidVisibilityChange.dispose();
    this.childrenVisibilityChangeDisposable.dispose();
    this.splitviewSashResetDisposable.dispose();
    this.childrenSashResetDisposable.dispose();
    this.childrenChangeDisposable.dispose();
    this.onDidScrollDisposable.dispose();
    this.splitview.dispose();
  }
};

function createLatchedOnDidChangeViewEvent(view) {
  const [onDidChangeViewConstraints, onDidSetViewSize] = Event2.split(view.onDidChange, isUndefined);
  return Event2.any(
    onDidSetViewSize,
    Event2.map(
      Event2.latch(
        Event2.map(onDidChangeViewConstraints, (_) => [view.minimumWidth, view.maximumWidth, view.minimumHeight, view.maximumHeight]),
        equals
      ),
      (_) => void 0
    )
  );
}

var LeafNode = class {
  constructor(view, orientation, layoutController, orthogonalSize, size3 = 0) {
    this.view = view;
    this.orientation = orientation;
    this.layoutController = layoutController;
    this._size = 0;
    this.absoluteOffset = 0;
    this.absoluteOrthogonalOffset = 0;
    this.onDidScroll = Event2.None;
    this.onDidSashReset = Event2.None;
    this._onDidLinkedWidthNodeChange = new Relay();
    this._linkedWidthNode = void 0;
    this._onDidLinkedHeightNodeChange = new Relay();
    this._linkedHeightNode = void 0;
    this._onDidSetLinkedNode = new Emitter();
    this.disposables = new DisposableStore();
    this._boundarySashes = {};
    this.cachedWidth = 0;
    this.cachedHeight = 0;
    this.cachedTop = 0;
    this.cachedLeft = 0;
    this._orthogonalSize = orthogonalSize;
    this._size = size3;
    const onDidChange = createLatchedOnDidChangeViewEvent(view);
    this._onDidViewChange = Event2.map(onDidChange, (e4) => e4 && (this.orientation === 0 /* VERTICAL */ ? e4.width : e4.height), this.disposables);
    this.onDidChange = Event2.any(this._onDidViewChange, this._onDidSetLinkedNode.event, this._onDidLinkedWidthNodeChange.event, this._onDidLinkedHeightNodeChange.event);
  }
  get size() {
    return this._size;
  }
  get orthogonalSize() {
    return this._orthogonalSize;
  }
  get linkedWidthNode() {
    return this._linkedWidthNode;
  }
  set linkedWidthNode(node) {
    this._onDidLinkedWidthNodeChange.input = node ? node._onDidViewChange : Event2.None;
    this._linkedWidthNode = node;
    this._onDidSetLinkedNode.fire(void 0);
  }
  get linkedHeightNode() {
    return this._linkedHeightNode;
  }
  set linkedHeightNode(node) {
    this._onDidLinkedHeightNodeChange.input = node ? node._onDidViewChange : Event2.None;
    this._linkedHeightNode = node;
    this._onDidSetLinkedNode.fire(void 0);
  }
  get width() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.orthogonalSize : this.size;
  }
  get height() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.size : this.orthogonalSize;
  }
  get top() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.absoluteOffset : this.absoluteOrthogonalOffset;
  }
  get left() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.absoluteOrthogonalOffset : this.absoluteOffset;
  }
  get element() {
    return this.view.element;
  }
  get minimumWidth() {
    return this.linkedWidthNode ? Math.max(this.linkedWidthNode.view.minimumWidth, this.view.minimumWidth) : this.view.minimumWidth;
  }
  get maximumWidth() {
    return this.linkedWidthNode ? Math.min(this.linkedWidthNode.view.maximumWidth, this.view.maximumWidth) : this.view.maximumWidth;
  }
  get minimumHeight() {
    return this.linkedHeightNode ? Math.max(this.linkedHeightNode.view.minimumHeight, this.view.minimumHeight) : this.view.minimumHeight;
  }
  get maximumHeight() {
    return this.linkedHeightNode ? Math.min(this.linkedHeightNode.view.maximumHeight, this.view.maximumHeight) : this.view.maximumHeight;
  }
  get minimumSize() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.minimumHeight : this.minimumWidth;
  }
  get maximumSize() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.maximumHeight : this.maximumWidth;
  }
  get priority() {
    return this.view.priority;
  }
  get proportionalLayout() {
    return this.view.proportionalLayout ?? true;
  }
  get snap() {
    return this.view.snap;
  }
  get minimumOrthogonalSize() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.minimumWidth : this.minimumHeight;
  }
  get maximumOrthogonalSize() {
    return this.orientation === 1 /* HORIZONTAL */ ? this.maximumWidth : this.maximumHeight;
  }
  get boundarySashes() {
    return this._boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    this._boundarySashes = boundarySashes;
    this.view.setBoundarySashes?.(toAbsoluteBoundarySashes(boundarySashes, this.orientation));
  }
  layout(size3, offset, ctx) {
    if (!this.layoutController.isLayoutEnabled) {
      return;
    }
    if (typeof ctx === "undefined") {
      throw new Error("Invalid state");
    }
    this._size = size3;
    this._orthogonalSize = ctx.orthogonalSize;
    this.absoluteOffset = ctx.absoluteOffset + offset;
    this.absoluteOrthogonalOffset = ctx.absoluteOrthogonalOffset;
    this._layout(this.width, this.height, this.top, this.left);
  }
  _layout(width2, height, top2, left) {
    if (this.cachedWidth === width2 && this.cachedHeight === height && this.cachedTop === top2 && this.cachedLeft === left) {
      return;
    }
    this.cachedWidth = width2;
    this.cachedHeight = height;
    this.cachedTop = top2;
    this.cachedLeft = left;
    this.view.layout(width2, height, top2, left);
  }
  setVisible(visible) {
    this.view.setVisible?.(visible);
  }
  dispose() {
    this._onDidSetLinkedNode.dispose();
    this.disposables.dispose();
  }
};

function flipNode(node, size3, orthogonalSize) {
  if (node instanceof BranchNode) {
    const result = new BranchNode(orthogonal(node.orientation), node.layoutController, node.styles, node.splitviewProportionalLayout, size3, orthogonalSize, node.edgeSnapping);
    let totalSize = 0;
    for (let i2 = node.children.length - 1; i2 >= 0; i2--) {
      const child = node.children[i2];
      const childSize = child instanceof BranchNode ? child.orthogonalSize : child.size;
      let newSize = node.size === 0 ? 0 : Math.round(size3 * childSize / node.size);
      totalSize += newSize;
      if (i2 === 0) {
        newSize += size3 - totalSize;
      }
      result.addChild(flipNode(child, orthogonalSize, newSize), newSize, 0, true);
    }
    node.dispose();
    return result;
  } else {
    const result = new LeafNode(node.view, orthogonal(node.orientation), node.layoutController, orthogonalSize);
    node.dispose();
    return result;
  }
}

var GridView = class _GridView {
  /**
   * Create a new {@link GridView} instance.
   *
   * @remarks It's the caller's responsibility to append the
   * {@link GridView.element} to the page's DOM.
   */
  constructor(options3 = {}) {
    this.onDidSashResetRelay = new Relay();
    this._onDidScroll = new Relay();
    this._onDidChange = new Relay();
    this._boundarySashes = {};
    this.disposable2x2 = Disposable.None;
    /**
     * Fires whenever the user double clicks a {@link Sash sash}.
     */
    this.onDidSashReset = this.onDidSashResetRelay.event;
    /**
     * Fires whenever the user scrolls a {@link SplitView} within
     * the grid.
     */
    this.onDidScroll = this._onDidScroll.event;
    /**
     * Fires whenever a view within the grid changes its size constraints.
     */
    this.onDidChange = this._onDidChange.event;
    this.maximizedNode = void 0;
    this._onDidChangeViewMaximized = new Emitter();
    this.onDidChangeViewMaximized = this._onDidChangeViewMaximized.event;
    this.element = $(".monaco-grid-view");
    this.styles = options3.styles || defaultStyles2;
    this.proportionalLayout = typeof options3.proportionalLayout !== "undefined" ? !!options3.proportionalLayout : true;
    this.layoutController = new LayoutController(false);
    this.root = new BranchNode(0 /* VERTICAL */, this.layoutController, this.styles, this.proportionalLayout);
  }
  get root() {
    return this._root;
  }
  set root(root) {
    const oldRoot = this._root;
    if (oldRoot) {
      oldRoot.element.remove();
      oldRoot.dispose();
    }
    this._root = root;
    this.element.appendChild(root.element);
    this.onDidSashResetRelay.input = root.onDidSashReset;
    this._onDidChange.input = Event2.map(root.onDidChange, () => void 0);
    this._onDidScroll.input = root.onDidScroll;
  }
  /**
   * The width of the grid.
   */
  get width() {
    return this.root.width;
  }
  /**
   * The height of the grid.
   */
  get height() {
    return this.root.height;
  }
  /**
   * The minimum width of the grid.
   */
  get minimumWidth() {
    return this.root.minimumWidth;
  }
  /**
   * The minimum height of the grid.
   */
  get minimumHeight() {
    return this.root.minimumHeight;
  }
  /**
   * The maximum width of the grid.
   */
  get maximumWidth() {
    return this.root.maximumHeight;
  }
  /**
   * The maximum height of the grid.
   */
  get maximumHeight() {
    return this.root.maximumHeight;
  }
  get orientation() {
    return this._root.orientation;
  }
  get boundarySashes() {
    return this._boundarySashes;
  }
  /**
   * The orientation of the grid. Matches the orientation of the root
   * {@link SplitView} in the grid's tree model.
   */
  set orientation(orientation) {
    if (this._root.orientation === orientation) {
      return;
    }
    const { size: size3, orthogonalSize, absoluteOffset, absoluteOrthogonalOffset } = this._root;
    this.root = flipNode(this._root, orthogonalSize, size3);
    this.root.layout(size3, 0, { orthogonalSize, absoluteOffset: absoluteOrthogonalOffset, absoluteOrthogonalOffset: absoluteOffset, absoluteSize: size3, absoluteOrthogonalSize: orthogonalSize });
    this.boundarySashes = this.boundarySashes;
  }
  /**
   * A collection of sashes perpendicular to each edge of the grid.
   * Corner sashes will be created for each intersection.
   */
  set boundarySashes(boundarySashes) {
    this._boundarySashes = boundarySashes;
    this.root.boundarySashes = fromAbsoluteBoundarySashes(boundarySashes, this.orientation);
  }
  /**
   * Enable/disable edge snapping across all grid views.
   */
  set edgeSnapping(edgeSnapping) {
    this.root.edgeSnapping = edgeSnapping;
  }
  style(styles) {
    this.styles = styles;
    this.root.style(styles);
  }
  /**
   * Layout the {@link GridView}.
   *
   * Optionally provide a `top` and `left` positions, those will propagate
   * as an origin for positions passed to {@link IView.layout}.
   *
   * @param width The width of the {@link GridView}.
   * @param height The height of the {@link GridView}.
   * @param top Optional, the top location of the {@link GridView}.
   * @param left Optional, the left location of the {@link GridView}.
   */
  layout(width2, height, top2 = 0, left = 0) {
    this.layoutController.isLayoutEnabled = true;
    const [size3, orthogonalSize, offset, orthogonalOffset] = this.root.orientation === 1 /* HORIZONTAL */ ? [height, width2, top2, left] : [width2, height, left, top2];
    this.root.layout(size3, 0, { orthogonalSize, absoluteOffset: offset, absoluteOrthogonalOffset: orthogonalOffset, absoluteSize: size3, absoluteOrthogonalSize: orthogonalSize });
  }
  /**
   * Add a {@link IView view} to this {@link GridView}.
   *
   * @param view The view to add.
   * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param location The {@link GridLocation location} to insert the view on.
   */
  addView(view, size3, location2) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    const [rest, index2] = tail(location2);
    const [pathToParent, parent] = this.getNode(rest);
    if (parent instanceof BranchNode) {
      const node = new LeafNode(view, orthogonal(parent.orientation), this.layoutController, parent.orthogonalSize);
      try {
        parent.addChild(node, size3, index2);
      } catch (err) {
        node.dispose();
        throw err;
      }
    } else {
      const [, grandParent] = tail(pathToParent);
      const [, parentIndex] = tail(rest);
      let newSiblingSize = 0;
      const newSiblingCachedVisibleSize = grandParent.getChildCachedVisibleSize(parentIndex);
      if (typeof newSiblingCachedVisibleSize === "number") {
        newSiblingSize = Sizing.Invisible(newSiblingCachedVisibleSize);
      }
      const oldChild = grandParent.removeChild(parentIndex);
      oldChild.dispose();
      const newParent = new BranchNode(parent.orientation, parent.layoutController, this.styles, this.proportionalLayout, parent.size, parent.orthogonalSize, grandParent.edgeSnapping);
      grandParent.addChild(newParent, parent.size, parentIndex);
      const newSibling = new LeafNode(parent.view, grandParent.orientation, this.layoutController, parent.size);
      newParent.addChild(newSibling, newSiblingSize, 0);
      if (typeof size3 !== "number" && size3.type === "split") {
        size3 = Sizing.Split(0);
      }
      const node = new LeafNode(view, grandParent.orientation, this.layoutController, parent.size);
      newParent.addChild(node, size3, index2);
    }
    this.trySet2x2();
  }
  /**
   * Remove a {@link IView view} from this {@link GridView}.
   *
   * @param location The {@link GridLocation location} of the {@link IView view}.
   * @param sizing Whether to distribute other {@link IView view}'s sizes.
   */
  removeView(location2, sizing) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    const [rest, index2] = tail(location2);
    const [pathToParent, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    const node = parent.children[index2];
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    parent.removeChild(index2, sizing);
    node.dispose();
    if (parent.children.length === 0) {
      throw new Error("Invalid grid state");
    }
    if (parent.children.length > 1) {
      this.trySet2x2();
      return node.view;
    }
    if (pathToParent.length === 0) {
      const sibling2 = parent.children[0];
      if (sibling2 instanceof LeafNode) {
        return node.view;
      }
      parent.removeChild(0);
      parent.dispose();
      this.root = sibling2;
      this.boundarySashes = this.boundarySashes;
      this.trySet2x2();
      return node.view;
    }
    const [, grandParent] = tail(pathToParent);
    const [, parentIndex] = tail(rest);
    const isSiblingVisible = parent.isChildVisible(0);
    const sibling = parent.removeChild(0);
    const sizes = grandParent.children.map((_, i2) => grandParent.getChildSize(i2));
    grandParent.removeChild(parentIndex, sizing);
    parent.dispose();
    if (sibling instanceof BranchNode) {
      sizes.splice(parentIndex, 1, ...sibling.children.map((c) => c.size));
      const siblingChildren = sibling.removeAllChildren();
      for (let i2 = 0; i2 < siblingChildren.length; i2++) {
        grandParent.addChild(siblingChildren[i2], siblingChildren[i2].size, parentIndex + i2);
      }
    } else {
      const newSibling = new LeafNode(sibling.view, orthogonal(sibling.orientation), this.layoutController, sibling.size);
      const sizing2 = isSiblingVisible ? sibling.orthogonalSize : Sizing.Invisible(sibling.orthogonalSize);
      grandParent.addChild(newSibling, sizing2, parentIndex);
    }
    sibling.dispose();
    for (let i2 = 0; i2 < sizes.length; i2++) {
      grandParent.resizeChild(i2, sizes[i2]);
    }
    this.trySet2x2();
    return node.view;
  }
  /**
   * Move a {@link IView view} within its parent.
   *
   * @param parentLocation The {@link GridLocation location} of the {@link IView view}'s parent.
   * @param from The index of the {@link IView view} to move.
   * @param to The index where the {@link IView view} should move to.
   */
  moveView(parentLocation, from, to) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [, parent] = this.getNode(parentLocation);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    parent.moveChild(from, to);
    this.trySet2x2();
  }
  /**
   * Swap two {@link IView views} within the {@link GridView}.
   *
   * @param from The {@link GridLocation location} of one view.
   * @param to The {@link GridLocation location} of another view.
   */
  swapViews(from, to) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [fromRest, fromIndex] = tail(from);
    const [, fromParent] = this.getNode(fromRest);
    if (!(fromParent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    const fromSize = fromParent.getChildSize(fromIndex);
    const fromNode = fromParent.children[fromIndex];
    if (!(fromNode instanceof LeafNode)) {
      throw new Error("Invalid from location");
    }
    const [toRest, toIndex] = tail(to);
    const [, toParent] = this.getNode(toRest);
    if (!(toParent instanceof BranchNode)) {
      throw new Error("Invalid to location");
    }
    const toSize2 = toParent.getChildSize(toIndex);
    const toNode = toParent.children[toIndex];
    if (!(toNode instanceof LeafNode)) {
      throw new Error("Invalid to location");
    }
    if (fromParent === toParent) {
      fromParent.swapChildren(fromIndex, toIndex);
    } else {
      fromParent.removeChild(fromIndex);
      toParent.removeChild(toIndex);
      fromParent.addChild(toNode, fromSize, fromIndex);
      toParent.addChild(fromNode, toSize2, toIndex);
    }
    this.trySet2x2();
  }
  /**
   * Resize a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view.
   * @param size The size the view should be. Optionally provide a single dimension.
   */
  resizeView(location2, size3) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [rest, index2] = tail(location2);
    const [pathToParent, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    if (!size3.width && !size3.height) {
      return;
    }
    const [parentSize, grandParentSize] = parent.orientation === 1 /* HORIZONTAL */ ? [size3.width, size3.height] : [size3.height, size3.width];
    if (typeof grandParentSize === "number" && pathToParent.length > 0) {
      const [, grandParent] = tail(pathToParent);
      const [, parentIndex] = tail(rest);
      grandParent.resizeChild(parentIndex, grandParentSize);
    }
    if (typeof parentSize === "number") {
      parent.resizeChild(index2, parentSize);
    }
    this.trySet2x2();
  }
  /**
   * Get the size of a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view. Provide `undefined` to get
   * the size of the grid itself.
   */
  getViewSize(location2) {
    if (!location2) {
      return { width: this.root.width, height: this.root.height };
    }
    const [, node] = this.getNode(location2);
    return { width: node.width, height: node.height };
  }
  /**
   * Get the cached visible size of a {@link IView view}. This was the size
   * of the view at the moment it last became hidden.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  getViewCachedVisibleSize(location2) {
    const [rest, index2] = tail(location2);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    return parent.getChildCachedVisibleSize(index2);
  }
  /**
   * Maximize the size of a {@link IView view} by collapsing all other views
   * to their minimum sizes.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  expandView(location2) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const [ancestors, node] = this.getNode(location2);
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    for (let i2 = 0; i2 < ancestors.length; i2++) {
      ancestors[i2].resizeChild(location2[i2], Number.POSITIVE_INFINITY);
    }
  }
  /**
   * Returns whether all other {@link IView views} are at their minimum size.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewExpanded(location2) {
    if (this.hasMaximizedView()) {
      return false;
    }
    const [ancestors, node] = this.getNode(location2);
    if (!(node instanceof LeafNode)) {
      throw new Error("Invalid location");
    }
    for (let i2 = 0; i2 < ancestors.length; i2++) {
      if (!ancestors[i2].isChildExpanded(location2[i2])) {
        return false;
      }
    }
    return true;
  }
  maximizeView(location2, excludeViews = []) {
    const [, nodeToMaximize] = this.getNode(location2);
    if (!(nodeToMaximize instanceof LeafNode)) {
      throw new Error("Location is not a LeafNode");
    }
    if (this.maximizedNode === nodeToMaximize) {
      return;
    }
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    const excludeViewSet = new Set(excludeViews);
    function hideAllViewsBut(parent, exclude) {
      for (let i2 = 0; i2 < parent.children.length; i2++) {
        const child = parent.children[i2];
        if (child instanceof LeafNode) {
          if (child !== exclude && !excludeViewSet.has(child.view)) {
            parent.setChildVisible(i2, false);
          }
        } else {
          hideAllViewsBut(child, exclude);
        }
      }
    }
    hideAllViewsBut(this.root, nodeToMaximize);
    this.maximizedNode = nodeToMaximize;
    this._onDidChangeViewMaximized.fire(true);
  }
  exitMaximizedView() {
    if (!this.maximizedNode) {
      return;
    }
    this.maximizedNode = void 0;
    function showViewsInReverseOrder(parent) {
      for (let index2 = parent.children.length - 1; index2 >= 0; index2--) {
        const child = parent.children[index2];
        if (child instanceof LeafNode) {
          parent.setChildVisible(index2, true);
        } else {
          showViewsInReverseOrder(child);
        }
      }
    }
    showViewsInReverseOrder(this.root);
    this._onDidChangeViewMaximized.fire(false);
  }
  hasMaximizedView() {
    return this.maximizedNode !== void 0;
  }
  /**
   * Returns whether the {@link IView view} is maximized.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewMaximized(location2) {
    const [, node] = this.getNode(location2);
    if (!(node instanceof LeafNode)) {
      throw new Error("Location is not a LeafNode");
    }
    return node === this.maximizedNode;
  }
  /**
   * Distribute the size among all {@link IView views} within the entire
   * grid or within a single {@link SplitView}.
   *
   * @param location The {@link GridLocation location} of a view containing
   * children views, which will have their sizes distributed within the parent
   * view's size. Provide `undefined` to recursively distribute all views' sizes
   * in the entire grid.
   */
  distributeViewSizes(location2) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
    }
    if (!location2) {
      this.root.distributeViewSizes(true);
      return;
    }
    const [, node] = this.getNode(location2);
    if (!(node instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    node.distributeViewSizes();
    this.trySet2x2();
  }
  /**
   * Returns whether a {@link IView view} is visible.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  isViewVisible(location2) {
    const [rest, index2] = tail(location2);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    return parent.isChildVisible(index2);
  }
  /**
   * Set the visibility state of a {@link IView view}.
   *
   * @param location The {@link GridLocation location} of the view.
   */
  setViewVisible(location2, visible) {
    if (this.hasMaximizedView()) {
      this.exitMaximizedView();
      return;
    }
    const [rest, index2] = tail(location2);
    const [, parent] = this.getNode(rest);
    if (!(parent instanceof BranchNode)) {
      throw new Error("Invalid from location");
    }
    parent.setChildVisible(index2, visible);
  }
  getView(location2) {
    const node = location2 ? this.getNode(location2)[1] : this._root;
    return this._getViews(node, this.orientation);
  }
  /**
   * Construct a new {@link GridView} from a JSON object.
   *
   * @param json The JSON object.
   * @param deserializer A deserializer which can revive each view.
   * @returns A new {@link GridView} instance.
   */
  static deserialize(json, deserializer, options3 = {}) {
    if (typeof json.orientation !== "number") {
      throw new Error("Invalid JSON: 'orientation' property must be a number.");
    } else if (typeof json.width !== "number") {
      throw new Error("Invalid JSON: 'width' property must be a number.");
    } else if (typeof json.height !== "number") {
      throw new Error("Invalid JSON: 'height' property must be a number.");
    } else if (json.root?.type !== "branch") {
      throw new Error("Invalid JSON: 'root' property must have 'type' value of branch.");
    }
    const orientation = json.orientation;
    const height = json.height;
    const result = new _GridView(options3);
    result._deserialize(json.root, orientation, deserializer, height);
    return result;
  }
  _deserialize(root, orientation, deserializer, orthogonalSize) {
    this.root = this._deserializeNode(root, orientation, deserializer, orthogonalSize);
  }
  _deserializeNode(node, orientation, deserializer, orthogonalSize) {
    let result;
    if (node.type === "branch") {
      const serializedChildren = node.data;
      const children = serializedChildren.map((serializedChild) => {
        return {
          node: this._deserializeNode(serializedChild, orthogonal(orientation), deserializer, node.size),
          visible: serializedChild.visible
        };
      });
      result = new BranchNode(orientation, this.layoutController, this.styles, this.proportionalLayout, node.size, orthogonalSize, void 0, children);
    } else {
      result = new LeafNode(deserializer.fromJSON(node.data), orientation, this.layoutController, orthogonalSize, node.size);
      if (node.maximized && !this.maximizedNode) {
        this.maximizedNode = result;
        this._onDidChangeViewMaximized.fire(true);
      }
    }
    return result;
  }
  _getViews(node, orientation, cachedVisibleSize) {
    const box = { top: node.top, left: node.left, width: node.width, height: node.height };
    if (node instanceof LeafNode) {
      return { view: node.view, box, cachedVisibleSize, maximized: this.maximizedNode === node };
    }
    const children = [];
    for (let i2 = 0; i2 < node.children.length; i2++) {
      const child = node.children[i2];
      const cachedVisibleSize2 = node.getChildCachedVisibleSize(i2);
      children.push(this._getViews(child, orthogonal(orientation), cachedVisibleSize2));
    }
    return { children, box };
  }
  getNode(location2, node = this.root, path = []) {
    if (location2.length === 0) {
      return [path, node];
    }
    if (!(node instanceof BranchNode)) {
      throw new Error("Invalid location");
    }
    const [index2, ...rest] = location2;
    if (index2 < 0 || index2 >= node.children.length) {
      throw new Error("Invalid location");
    }
    const child = node.children[index2];
    path.push(node);
    return this.getNode(rest, child, path);
  }
  /**
   * Attempt to lock the {@link Sash sashes} in this {@link GridView} so
   * the grid behaves as a 2x2 matrix, with a corner sash in the middle.
   *
   * In case the grid isn't a 2x2 grid _and_ all sashes are not aligned,
   * this method is a no-op.
   */
  trySet2x2() {
    this.disposable2x2.dispose();
    this.disposable2x2 = Disposable.None;
    if (this.root.children.length !== 2) {
      return;
    }
    const [first2, second] = this.root.children;
    if (!(first2 instanceof BranchNode) || !(second instanceof BranchNode)) {
      return;
    }
    this.disposable2x2 = first2.trySet2x2(second);
  }
  /**
   * Populate a map with views to DOM nodes.
   * @remarks To be used internally only.
   */
  getViewMap(map, node) {
    if (!node) {
      node = this.root;
    }
    if (node instanceof BranchNode) {
      node.children.forEach((child) => this.getViewMap(map, child));
    } else {
      map.set(node.view, node.element);
    }
  }
  dispose() {
    this._onDidChangeViewMaximized.dispose();
    this.onDidSashResetRelay.dispose();
    this.root.dispose();
    this.element.remove();
  }
};
export { orthogonal, toAbsoluteBoundarySashes, fromAbsoluteBoundarySashes, validateIndex, createLatchedOnDidChangeViewEvent, flipNode, defaultStyles2, LayoutController, BranchNode, LeafNode, GridView };
