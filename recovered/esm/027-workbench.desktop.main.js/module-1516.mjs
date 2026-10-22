// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/grid/grid.ts
import { GridView, orthogonal } from "./module-1515.mjs";
import { equals, tail } from "./module-0007.mjs";
import { Disposable } from "./module-0012.mjs";
import { Sizing } from "./module-0625.mjs";


// src/vs/base/browser/ui/grid/grid.ts
function oppositeDirection(direction) {
  switch (direction) {
    case 0 /* Up */:
      return 1 /* Down */;
    case 1 /* Down */:
      return 0 /* Up */;
    case 2 /* Left */:
      return 3 /* Right */;
    case 3 /* Right */:
      return 2 /* Left */;
  }
}

function isGridBranchNode(node) {
  return !!node.children;
}

function getGridNode(node, location2) {
  if (location2.length === 0) {
    return node;
  }
  if (!isGridBranchNode(node)) {
    throw new Error("Invalid location");
  }
  const [index2, ...rest] = location2;
  return getGridNode(node.children[index2], rest);
}

function intersects3(one, other) {
  return !(one.start >= other.end || other.start >= one.end);
}

function getBoxBoundary(box, direction) {
  const orientation = getDirectionOrientation(direction);
  const offset = direction === 0 /* Up */ ? box.top : direction === 3 /* Right */ ? box.left + box.width : direction === 1 /* Down */ ? box.top + box.height : box.left;
  const range2 = {
    start: orientation === 1 /* HORIZONTAL */ ? box.top : box.left,
    end: orientation === 1 /* HORIZONTAL */ ? box.top + box.height : box.left + box.width
  };
  return { offset, range: range2 };
}

function findAdjacentBoxLeafNodes(boxNode, direction, boundary) {
  const result = [];
  function _(boxNode2, direction2, boundary2) {
    if (isGridBranchNode(boxNode2)) {
      for (const child of boxNode2.children) {
        _(child, direction2, boundary2);
      }
    } else {
      const { offset, range: range2 } = getBoxBoundary(boxNode2.box, direction2);
      if (offset === boundary2.offset && intersects3(range2, boundary2.range)) {
        result.push(boxNode2);
      }
    }
  }
  _(boxNode, direction, boundary);
  return result;
}

function getLocationOrientation(rootOrientation, location2) {
  return location2.length % 2 === 0 ? orthogonal(rootOrientation) : rootOrientation;
}

function getDirectionOrientation(direction) {
  return direction === 0 /* Up */ || direction === 1 /* Down */ ? 0 /* VERTICAL */ : 1 /* HORIZONTAL */;
}

function getRelativeLocation(rootOrientation, location2, direction) {
  const orientation = getLocationOrientation(rootOrientation, location2);
  const directionOrientation = getDirectionOrientation(direction);
  if (orientation === directionOrientation) {
    let [rest, index2] = tail(location2);
    if (direction === 3 /* Right */ || direction === 1 /* Down */) {
      index2 += 1;
    }
    return [...rest, index2];
  } else {
    const index2 = direction === 3 /* Right */ || direction === 1 /* Down */ ? 1 : 0;
    return [...location2, index2];
  }
}

function indexInParent(element) {
  const parentElement = element.parentElement;
  if (!parentElement) {
    throw new Error("Invalid grid element");
  }
  let el = parentElement.firstElementChild;
  let index2 = 0;
  while (el !== element && el !== parentElement.lastElementChild && el) {
    el = el.nextElementSibling;
    index2++;
  }
  return index2;
}

function getGridLocation(element) {
  const parentElement = element.parentElement;
  if (!parentElement) {
    throw new Error("Invalid grid element");
  }
  if (/\bmonaco-grid-view\b/.test(parentElement.className)) {
    return [];
  }
  const index2 = indexInParent(parentElement);
  const ancestor = parentElement.parentElement.parentElement.parentElement.parentElement;
  return [...getGridLocation(ancestor), index2];
}

var Sizing2;

((Sizing3) => {
  Sizing3.Distribute = { type: "distribute" };
  Sizing3.Split = { type: "split" };
  Sizing3.Auto = { type: "auto" };
  function Invisible(cachedVisibleSize) {
    return { type: "invisible", cachedVisibleSize };
  }
  Sizing3.Invisible = Invisible;
})(Sizing2 || (Sizing2 = {}));

var Grid = class extends Disposable {
  /**
   * Create a new {@link Grid}. A grid must *always* have a view
   * inside.
   *
   * @param view An initial view for this Grid.
   */
  constructor(view, options3 = {}) {
    super();
    this.views = /* @__PURE__ */ new Map();
    this.didLayout = false;
    if (view instanceof GridView) {
      this.gridview = view;
      this.gridview.getViewMap(this.views);
    } else {
      this.gridview = new GridView(options3);
    }
    this._register(this.gridview);
    this._register(this.gridview.onDidSashReset(this.onDidSashReset, this));
    if (!(view instanceof GridView)) {
      this._addView(view, 0, [0]);
    }
    this.onDidChange = this.gridview.onDidChange;
    this.onDidScroll = this.gridview.onDidScroll;
    this.onDidChangeViewMaximized = this.gridview.onDidChangeViewMaximized;
  }
  /**
   * The orientation of the grid. Matches the orientation of the root
   * {@link SplitView} in the grid's {@link GridLocation} model.
   */
  get orientation() {
    return this.gridview.orientation;
  }
  set orientation(orientation) {
    this.gridview.orientation = orientation;
  }
  /**
   * The width of the grid.
   */
  get width() {
    return this.gridview.width;
  }
  /**
   * The height of the grid.
   */
  get height() {
    return this.gridview.height;
  }
  /**
   * The minimum width of the grid.
   */
  get minimumWidth() {
    return this.gridview.minimumWidth;
  }
  /**
   * The minimum height of the grid.
   */
  get minimumHeight() {
    return this.gridview.minimumHeight;
  }
  /**
   * The maximum width of the grid.
   */
  get maximumWidth() {
    return this.gridview.maximumWidth;
  }
  /**
   * The maximum height of the grid.
   */
  get maximumHeight() {
    return this.gridview.maximumHeight;
  }
  /**
   * A collection of sashes perpendicular to each edge of the grid.
   * Corner sashes will be created for each intersection.
   */
  get boundarySashes() {
    return this.gridview.boundarySashes;
  }
  set boundarySashes(boundarySashes) {
    this.gridview.boundarySashes = boundarySashes;
  }
  /**
   * Enable/disable edge snapping across all grid views.
   */
  set edgeSnapping(edgeSnapping) {
    this.gridview.edgeSnapping = edgeSnapping;
  }
  /**
   * The DOM element for this view.
   */
  get element() {
    return this.gridview.element;
  }
  style(styles) {
    this.gridview.style(styles);
  }
  /**
   * Layout the {@link Grid}.
   *
   * Optionally provide a `top` and `left` positions, those will propagate
   * as an origin for positions passed to {@link IView.layout}.
   *
   * @param width The width of the {@link Grid}.
   * @param height The height of the {@link Grid}.
   * @param top Optional, the top location of the {@link Grid}.
   * @param left Optional, the left location of the {@link Grid}.
   */
  layout(width2, height, top2 = 0, left = 0) {
    this.gridview.layout(width2, height, top2, left);
    this.didLayout = true;
  }
  /**
   * Add a {@link IView view} to this {@link Grid}, based on another reference view.
   *
   * Take this grid as an example:
   *
   * ```
   *  +-----+---------------+
   *  |  A  |      B        |
   *  +-----+---------+-----+
   *  |        C      |     |
   *  +---------------+  D  |
   *  |        E      |     |
   *  +---------------+-----+
   * ```
   *
   * Calling `addView(X, Sizing.Distribute, C, Direction.Right)` will make the following
   * changes:
   *
   * ```
   *  +-----+---------------+
   *  |  A  |      B        |
   *  +-----+-+-------+-----+
   *  |   C   |   X   |     |
   *  +-------+-------+  D  |
   *  |        E      |     |
   *  +---------------+-----+
   * ```
   *
   * Or `addView(X, Sizing.Distribute, D, Direction.Down)`:
   *
   * ```
   *  +-----+---------------+
   *  |  A  |      B        |
   *  +-----+---------+-----+
   *  |        C      |  D  |
   *  +---------------+-----+
   *  |        E      |  X  |
   *  +---------------+-----+
   * ```
   *
   * @param newView The view to add.
   * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param referenceView Another view to place this new view next to.
   * @param direction The direction the new view should be placed next to the reference view.
   */
  addView(newView, size3, referenceView, direction) {
    if (this.views.has(newView)) {
      throw new Error("Can't add same view twice");
    }
    const orientation = getDirectionOrientation(direction);
    if (this.views.size === 1 && this.orientation !== orientation) {
      this.orientation = orientation;
    }
    const referenceLocation = this.getViewLocation(referenceView);
    const location2 = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
    let viewSize;
    if (typeof size3 === "number") {
      viewSize = size3;
    } else if (size3.type === "split") {
      const [, index2] = tail(referenceLocation);
      viewSize = Sizing.Split(index2);
    } else if (size3.type === "distribute") {
      viewSize = Sizing.Distribute;
    } else if (size3.type === "auto") {
      const [, index2] = tail(referenceLocation);
      viewSize = Sizing.Auto(index2);
    } else {
      viewSize = size3;
    }
    this._addView(newView, viewSize, location2);
  }
  addViewAt(newView, size3, location2) {
    if (this.views.has(newView)) {
      throw new Error("Can't add same view twice");
    }
    let viewSize;
    if (typeof size3 === "number") {
      viewSize = size3;
    } else if (size3.type === "distribute") {
      viewSize = Sizing.Distribute;
    } else {
      viewSize = size3;
    }
    this._addView(newView, viewSize, location2);
  }
  _addView(newView, size3, location2) {
    this.views.set(newView, newView.element);
    this.gridview.addView(newView, size3, location2);
  }
  /**
   * Remove a {@link IView view} from this {@link Grid}.
   *
   * @param view The {@link IView view} to remove.
   * @param sizing Whether to distribute other {@link IView view}'s sizes.
   */
  removeView(view, sizing) {
    if (this.views.size === 1) {
      throw new Error("Can't remove last view");
    }
    const location2 = this.getViewLocation(view);
    let gridViewSizing;
    if (sizing?.type === "distribute") {
      gridViewSizing = Sizing.Distribute;
    } else if (sizing?.type === "auto") {
      const index2 = location2[location2.length - 1];
      gridViewSizing = Sizing.Auto(index2 === 0 ? 1 : index2 - 1);
    }
    this.gridview.removeView(location2, gridViewSizing);
    this.views.delete(view);
  }
  /**
   * Move a {@link IView view} to another location in the grid.
   *
   * @remarks See {@link Grid.addView}.
   *
   * @param view The {@link IView view} to move.
   * @param sizing Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param referenceView Another view to place the view next to.
   * @param direction The direction the view should be placed next to the reference view.
   */
  moveView(view, sizing, referenceView, direction) {
    const sourceLocation = this.getViewLocation(view);
    const [sourceParentLocation, from] = tail(sourceLocation);
    const referenceLocation = this.getViewLocation(referenceView);
    const targetLocation = getRelativeLocation(this.gridview.orientation, referenceLocation, direction);
    const [targetParentLocation, to] = tail(targetLocation);
    if (equals(sourceParentLocation, targetParentLocation)) {
      this.gridview.moveView(sourceParentLocation, from, to);
    } else {
      this.removeView(view, typeof sizing === "number" ? void 0 : sizing);
      this.addView(view, sizing, referenceView, direction);
    }
  }
  /**
   * Move a {@link IView view} to another location in the grid.
   *
   * @remarks Internal method, do not use without knowing what you're doing.
   * @remarks See {@link GridView.moveView}.
   *
   * @param view The {@link IView view} to move.
   * @param location The {@link GridLocation location} to insert the view on.
   */
  moveViewTo(view, location2) {
    const sourceLocation = this.getViewLocation(view);
    const [sourceParentLocation, from] = tail(sourceLocation);
    const [targetParentLocation, to] = tail(location2);
    if (equals(sourceParentLocation, targetParentLocation)) {
      this.gridview.moveView(sourceParentLocation, from, to);
    } else {
      const size3 = this.getViewSize(view);
      const orientation = getLocationOrientation(this.gridview.orientation, sourceLocation);
      const cachedViewSize = this.getViewCachedVisibleSize(view);
      const sizing = typeof cachedViewSize === "undefined" ? orientation === 1 /* HORIZONTAL */ ? size3.width : size3.height : Sizing2.Invisible(cachedViewSize);
      this.removeView(view);
      this.addViewAt(view, sizing, location2);
    }
  }
  /**
   * Swap two {@link IView views} within the {@link Grid}.
   *
   * @param from One {@link IView view}.
   * @param to Another {@link IView view}.
   */
  swapViews(from, to) {
    const fromLocation = this.getViewLocation(from);
    const toLocation = this.getViewLocation(to);
    return this.gridview.swapViews(fromLocation, toLocation);
  }
  /**
   * Resize a {@link IView view}.
   *
   * @param view The {@link IView view} to resize.
   * @param size The size the view should be.
   */
  resizeView(view, size3) {
    const location2 = this.getViewLocation(view);
    return this.gridview.resizeView(location2, size3);
  }
  /**
   * Returns whether all other {@link IView views} are at their minimum size.
   *
   * @param view The reference {@link IView view}.
   */
  isViewExpanded(view) {
    const location2 = this.getViewLocation(view);
    return this.gridview.isViewExpanded(location2);
  }
  /**
   * Returns whether the {@link IView view} is maximized.
   *
   * @param view The reference {@link IView view}.
   */
  isViewMaximized(view) {
    const location2 = this.getViewLocation(view);
    return this.gridview.isViewMaximized(location2);
  }
  /**
   * Returns whether the {@link IView view} is maximized.
   *
   * @param view The reference {@link IView view}.
   */
  hasMaximizedView() {
    return this.gridview.hasMaximizedView();
  }
  /**
   * Get the size of a {@link IView view}.
   *
   * @param view The {@link IView view}. Provide `undefined` to get the size
   * of the grid itself.
   */
  getViewSize(view) {
    if (!view) {
      return this.gridview.getViewSize();
    }
    const location2 = this.getViewLocation(view);
    return this.gridview.getViewSize(location2);
  }
  /**
   * Get the cached visible size of a {@link IView view}. This was the size
   * of the view at the moment it last became hidden.
   *
   * @param view The {@link IView view}.
   */
  getViewCachedVisibleSize(view) {
    const location2 = this.getViewLocation(view);
    return this.gridview.getViewCachedVisibleSize(location2);
  }
  /**
   * Maximizes the specified view and hides all other views.
   * @param view The view to maximize.
   * @param excludeViews Optional array of views to exclude from being hidden.
   */
  maximizeView(view, excludeViews = []) {
    if (this.views.size < 2) {
      throw new Error("At least two views are required to maximize a view");
    }
    const location2 = this.getViewLocation(view);
    this.gridview.maximizeView(location2, excludeViews);
  }
  exitMaximizedView() {
    this.gridview.exitMaximizedView();
  }
  /**
   * Expand the size of a {@link IView view} by collapsing all other views
   * to their minimum sizes.
   *
   * @param view The {@link IView view}.
   */
  expandView(view) {
    const location2 = this.getViewLocation(view);
    this.gridview.expandView(location2);
  }
  /**
   * Distribute the size among all {@link IView views} within the entire grid.
   */
  distributeViewSizes() {
    this.gridview.distributeViewSizes();
  }
  /**
   * Returns whether a {@link IView view} is visible.
   *
   * @param view The {@link IView view}.
   */
  isViewVisible(view) {
    const location2 = this.getViewLocation(view);
    return this.gridview.isViewVisible(location2);
  }
  /**
   * Set the visibility state of a {@link IView view}.
   *
   * @param view The {@link IView view}.
   * @param sizing Whether to redistribute the containing {@link SplitView} after revealing the view.
   */
  setViewVisible(view, visible, sizing) {
    const location2 = this.getViewLocation(view);
    this.gridview.setViewVisible(location2, visible);
    if (visible && sizing?.type === "distribute") {
      const parentLocation = location2.length > 0 ? tail(location2)[0] : void 0;
      this.gridview.distributeViewSizes(parentLocation);
    }
  }
  /**
   * Returns a descriptor for the entire grid.
   */
  getViews() {
    return this.gridview.getView();
  }
  /**
   * Utility method to return the collection all views which intersect
   * a view's edge.
   *
   * @param view The {@link IView view}.
   * @param direction Which direction edge to be considered.
   * @param wrap Whether the grid wraps around (from right to left, from bottom to top).
   */
  getNeighborViews(view, direction, wrap = false) {
    if (!this.didLayout) {
      throw new Error("Can't call getNeighborViews before first layout");
    }
    const location2 = this.getViewLocation(view);
    const root = this.getViews();
    const node = getGridNode(root, location2);
    let boundary = getBoxBoundary(node.box, direction);
    if (wrap) {
      if (direction === 0 /* Up */ && node.box.top === 0) {
        boundary = { offset: root.box.top + root.box.height, range: boundary.range };
      } else if (direction === 3 /* Right */ && node.box.left + node.box.width === root.box.width) {
        boundary = { offset: 0, range: boundary.range };
      } else if (direction === 1 /* Down */ && node.box.top + node.box.height === root.box.height) {
        boundary = { offset: 0, range: boundary.range };
      } else if (direction === 2 /* Left */ && node.box.left === 0) {
        boundary = { offset: root.box.left + root.box.width, range: boundary.range };
      }
    }
    return findAdjacentBoxLeafNodes(root, oppositeDirection(direction), boundary).map((node2) => node2.view);
  }
  getViewLocation(view) {
    const element = this.views.get(view);
    if (!element) {
      throw new Error("View not found");
    }
    return getGridLocation(element);
  }
  onDidSashReset(location2) {
    const resizeToPreferredSize = (location3) => {
      const node = this.gridview.getView(location3);
      if (isGridBranchNode(node)) {
        return false;
      }
      const direction = getLocationOrientation(this.orientation, location3);
      const size3 = direction === 1 /* HORIZONTAL */ ? node.view.preferredWidth : node.view.preferredHeight;
      if (typeof size3 !== "number") {
        return false;
      }
      const viewSize = direction === 1 /* HORIZONTAL */ ? { width: Math.round(size3) } : { height: Math.round(size3) };
      this.gridview.resizeView(location3, viewSize);
      return true;
    };
    if (resizeToPreferredSize(location2)) {
      return;
    }
    const [parentLocation, index2] = tail(location2);
    if (resizeToPreferredSize([...parentLocation, index2 + 1])) {
      return;
    }
    this.gridview.distributeViewSizes(parentLocation);
  }
};

var SerializableGrid = class _SerializableGrid extends Grid {
  constructor() {
    super(...arguments);
    /**
     * Useful information in order to proportionally restore view sizes
     * upon the very first layout call.
     */
    this.initialLayoutContext = true;
  }
  static serializeNode(node, orientation) {
    const size3 = orientation === 0 /* VERTICAL */ ? node.box.width : node.box.height;
    if (!isGridBranchNode(node)) {
      const serializedLeafNode = { type: "leaf", data: node.view.toJSON(), size: size3 };
      if (typeof node.cachedVisibleSize === "number") {
        serializedLeafNode.size = node.cachedVisibleSize;
        serializedLeafNode.visible = false;
      } else if (node.maximized) {
        serializedLeafNode.maximized = true;
      }
      return serializedLeafNode;
    }
    const data = node.children.map((c) => _SerializableGrid.serializeNode(c, orthogonal(orientation)));
    if (data.some((c) => c.visible !== false)) {
      return { type: "branch", data, size: size3 };
    }
    return { type: "branch", data, size: size3, visible: false };
  }
  /**
   * Construct a new {@link SerializableGrid} from a JSON object.
   *
   * @param json The JSON object.
   * @param deserializer A deserializer which can revive each view.
   * @returns A new {@link SerializableGrid} instance.
   */
  static deserialize(json, deserializer, options3 = {}) {
    if (typeof json.orientation !== "number") {
      throw new Error("Invalid JSON: 'orientation' property must be a number.");
    } else if (typeof json.width !== "number") {
      throw new Error("Invalid JSON: 'width' property must be a number.");
    } else if (typeof json.height !== "number") {
      throw new Error("Invalid JSON: 'height' property must be a number.");
    }
    const gridview = GridView.deserialize(json, deserializer, options3);
    const result = new _SerializableGrid(gridview, options3);
    return result;
  }
  /**
   * Construct a new {@link SerializableGrid} from a grid descriptor.
   *
   * @param gridDescriptor A grid descriptor in which leaf nodes point to actual views.
   * @returns A new {@link SerializableGrid} instance.
   */
  static from(gridDescriptor, options3 = {}) {
    return _SerializableGrid.deserialize(createSerializedGrid(gridDescriptor), { fromJSON: (view) => view }, options3);
  }
  /**
   * Serialize this grid into a JSON object.
   */
  serialize() {
    return {
      root: _SerializableGrid.serializeNode(this.getViews(), this.orientation),
      orientation: this.orientation,
      width: this.width,
      height: this.height
    };
  }
  layout(width2, height, top2 = 0, left = 0) {
    super.layout(width2, height, top2, left);
    if (this.initialLayoutContext) {
      this.initialLayoutContext = false;
      this.gridview.trySet2x2();
    }
  }
};

function isGridBranchNodeDescriptor(nodeDescriptor) {
  return !!nodeDescriptor.groups;
}

function sanitizeGridNodeDescriptor(nodeDescriptor, rootNode) {
  if (!rootNode && nodeDescriptor.groups && nodeDescriptor.groups.length <= 1) {
    nodeDescriptor.groups = void 0;
  }
  if (!isGridBranchNodeDescriptor(nodeDescriptor)) {
    return;
  }
  let totalDefinedSize = 0;
  let totalDefinedSizeCount = 0;
  for (const child of nodeDescriptor.groups) {
    sanitizeGridNodeDescriptor(child, false);
    if (child.size) {
      totalDefinedSize += child.size;
      totalDefinedSizeCount++;
    }
  }
  const totalUndefinedSize = totalDefinedSizeCount > 0 ? totalDefinedSize : 1;
  const totalUndefinedSizeCount = nodeDescriptor.groups.length - totalDefinedSizeCount;
  const eachUndefinedSize = totalUndefinedSize / totalUndefinedSizeCount;
  for (const child of nodeDescriptor.groups) {
    if (!child.size) {
      child.size = eachUndefinedSize;
    }
  }
}

function createSerializedNode(nodeDescriptor) {
  if (isGridBranchNodeDescriptor(nodeDescriptor)) {
    return { type: "branch", data: nodeDescriptor.groups.map((c) => createSerializedNode(c)), size: nodeDescriptor.size };
  } else {
    return { type: "leaf", data: nodeDescriptor.data, size: nodeDescriptor.size };
  }
}

function getDimensions(node, orientation) {
  if (node.type === "branch") {
    const childrenDimensions = node.data.map((c) => getDimensions(c, orthogonal(orientation)));
    if (orientation === 0 /* VERTICAL */) {
      const width2 = node.size || (childrenDimensions.length === 0 ? void 0 : Math.max(...childrenDimensions.map((d) => d.width || 0)));
      const height = childrenDimensions.length === 0 ? void 0 : childrenDimensions.reduce((r2, d) => r2 + (d.height || 0), 0);
      return { width: width2, height };
    } else {
      const width2 = childrenDimensions.length === 0 ? void 0 : childrenDimensions.reduce((r2, d) => r2 + (d.width || 0), 0);
      const height = node.size || (childrenDimensions.length === 0 ? void 0 : Math.max(...childrenDimensions.map((d) => d.height || 0)));
      return { width: width2, height };
    }
  } else {
    const width2 = orientation === 0 /* VERTICAL */ ? node.size : void 0;
    const height = orientation === 0 /* VERTICAL */ ? void 0 : node.size;
    return { width: width2, height };
  }
}

function createSerializedGrid(gridDescriptor) {
  sanitizeGridNodeDescriptor(gridDescriptor, true);
  const root = createSerializedNode(gridDescriptor);
  const { width: width2, height } = getDimensions(root, gridDescriptor.orientation);
  return {
    root,
    orientation: gridDescriptor.orientation,
    width: width2 || 1,
    height: height || 1
  };
}
export { oppositeDirection, isGridBranchNode, getGridNode, intersects3, getBoxBoundary, findAdjacentBoxLeafNodes, getLocationOrientation, getDirectionOrientation, getRelativeLocation, indexInParent, getGridLocation, isGridBranchNodeDescriptor, sanitizeGridNodeDescriptor, createSerializedNode, getDimensions, createSerializedGrid, Sizing2, Grid, SerializableGrid };
