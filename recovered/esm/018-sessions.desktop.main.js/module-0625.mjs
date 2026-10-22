// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/ui/splitview/splitview.ts
import { Color } from "./module-0197.mjs";
import { clamp } from "./module-0040.mjs";
import { Disposable, combinedDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, addDisposableListener, append, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Scrollable } from "./module-0099.mjs";
import { SmoothScrollableElement } from "./module-0259.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { isUndefined } from "./module-0010.mjs";
import { pushToEnd, pushToStart, range } from "./module-0007.mjs";
import { Sash } from "./module-0496.mjs";


// src/vs/base/browser/ui/splitview/splitview.ts
var defaultStyles = {
  separatorBorder: Color.transparent
};

var ViewItem = class {
  constructor(container2, view, size3, disposable) {
    this.container = container2;
    this.view = view;
    this.disposable = disposable;
    this._cachedVisibleSize = void 0;
    if (typeof size3 === "number") {
      this._size = size3;
      this._cachedVisibleSize = void 0;
      container2.classList.add("visible");
    } else {
      this._size = 0;
      this._cachedVisibleSize = size3.cachedVisibleSize;
    }
  }
  set size(size3) {
    this._size = size3;
  }
  get size() {
    return this._size;
  }
  get cachedVisibleSize() {
    return this._cachedVisibleSize;
  }
  get visible() {
    return typeof this._cachedVisibleSize === "undefined";
  }
  setVisible(visible, size3) {
    if (visible === this.visible) {
      return;
    }
    if (visible) {
      this.size = clamp(this._cachedVisibleSize, this.viewMinimumSize, this.viewMaximumSize);
      this._cachedVisibleSize = void 0;
    } else {
      this._cachedVisibleSize = typeof size3 === "number" ? size3 : this.size;
      this.size = 0;
    }
    this.container.classList.toggle("visible", visible);
    try {
      this.view.setVisible?.(visible);
    } catch (e4) {
      console.error("Splitview: Failed to set visible view");
      console.error(e4);
    }
  }
  get minimumSize() {
    return this.visible ? this.view.minimumSize : 0;
  }
  get viewMinimumSize() {
    return this.view.minimumSize;
  }
  get maximumSize() {
    return this.visible ? this.view.maximumSize : 0;
  }
  get viewMaximumSize() {
    return this.view.maximumSize;
  }
  get priority() {
    return this.view.priority;
  }
  get proportionalLayout() {
    return this.view.proportionalLayout ?? true;
  }
  get snap() {
    return !!this.view.snap;
  }
  set enabled(enabled) {
    this.container.style.pointerEvents = enabled ? "" : "none";
  }
  layout(offset, layoutContext) {
    this.layoutContainer(offset);
    try {
      this.view.layout(this.size, offset, layoutContext);
    } catch (e4) {
      console.error("Splitview: Failed to layout view");
      console.error(e4);
    }
  }
  dispose() {
    this.disposable.dispose();
  }
};

var VerticalViewItem = class extends ViewItem {
  layoutContainer(offset) {
    this.container.style.top = `${offset}px`;
    this.container.style.height = `${this.size}px`;
  }
};

var HorizontalViewItem = class extends ViewItem {
  layoutContainer(offset) {
    this.container.style.left = `${offset}px`;
    this.container.style.width = `${this.size}px`;
  }
};

var Sizing;

((Sizing3) => {
  Sizing3.Distribute = { type: "distribute" };
  function Split(index2) {
    return { type: "split", index: index2 };
  }
  Sizing3.Split = Split;
  function Auto(index2) {
    return { type: "auto", index: index2 };
  }
  Sizing3.Auto = Auto;
  function Invisible(cachedVisibleSize) {
    return { type: "invisible", cachedVisibleSize };
  }
  Sizing3.Invisible = Invisible;
})(Sizing || (Sizing = {}));

var SplitView = class extends Disposable {
  /**
   * Create a new {@link SplitView} instance.
   */
  constructor(container2, options3 = {}) {
    super();
    this.size = 0;
    this._contentSize = 0;
    this.proportions = void 0;
    this.viewItems = [];
    this.sashItems = [];
    this.state = 0 /* Idle */;
    this._onDidSashChange = this._register(new Emitter());
    this._onDidSashReset = this._register(new Emitter());
    this._startSnappingEnabled = true;
    this._endSnappingEnabled = true;
    /**
     * Fires whenever the user resizes a {@link Sash sash}.
     */
    this.onDidSashChange = this._onDidSashChange.event;
    /**
     * Fires whenever the user double clicks a {@link Sash sash}.
     */
    this.onDidSashReset = this._onDidSashReset.event;
    this.orientation = options3.orientation ?? 0 /* VERTICAL */;
    this.inverseAltBehavior = options3.inverseAltBehavior ?? false;
    this.proportionalLayout = options3.proportionalLayout ?? true;
    this.getSashOrthogonalSize = options3.getSashOrthogonalSize;
    this.el = document.createElement("div");
    this.el.classList.add("monaco-split-view2");
    this.el.classList.add(this.orientation === 0 /* VERTICAL */ ? "vertical" : "horizontal");
    container2.appendChild(this.el);
    this.sashContainer = append(this.el, $(".sash-container"));
    this.viewContainer = $(".split-view-container");
    this.scrollable = this._register(new Scrollable({
      forceIntegerValues: true,
      smoothScrollDuration: 125,
      scheduleAtNextAnimationFrame: (callback) => scheduleAtNextAnimationFrame(getWindow(this.el), callback)
    }));
    this.scrollableElement = this._register(new SmoothScrollableElement(this.viewContainer, {
      vertical: this.orientation === 0 /* VERTICAL */ ? options3.scrollbarVisibility ?? 1 /* Auto */ : 2 /* Hidden */,
      horizontal: this.orientation === 1 /* HORIZONTAL */ ? options3.scrollbarVisibility ?? 1 /* Auto */ : 2 /* Hidden */
    }, this.scrollable));
    const onDidScrollViewContainer = this._register(new DomEmitter(this.viewContainer, "scroll")).event;
    this._register(onDidScrollViewContainer((_) => {
      const position2 = this.scrollableElement.getScrollPosition();
      const scrollLeft = Math.abs(this.viewContainer.scrollLeft - position2.scrollLeft) <= 1 ? void 0 : this.viewContainer.scrollLeft;
      const scrollTop = Math.abs(this.viewContainer.scrollTop - position2.scrollTop) <= 1 ? void 0 : this.viewContainer.scrollTop;
      if (scrollLeft !== void 0 || scrollTop !== void 0) {
        this.scrollableElement.setScrollPosition({ scrollLeft, scrollTop });
      }
    }));
    this.onDidScroll = this.scrollableElement.onScroll;
    this._register(this.onDidScroll((e4) => {
      if (e4.scrollTopChanged) {
        this.viewContainer.scrollTop = e4.scrollTop;
      }
      if (e4.scrollLeftChanged) {
        this.viewContainer.scrollLeft = e4.scrollLeft;
      }
    }));
    append(this.el, this.scrollableElement.getDomNode());
    this.style(options3.styles || defaultStyles);
    if (options3.descriptor) {
      this.size = options3.descriptor.size;
      options3.descriptor.views.forEach((viewDescriptor3, index2) => {
        const sizing = isUndefined(viewDescriptor3.visible) || viewDescriptor3.visible ? viewDescriptor3.size : { type: "invisible", cachedVisibleSize: viewDescriptor3.size };
        const view = viewDescriptor3.view;
        this.doAddView(view, sizing, index2, true);
      });
      this._contentSize = this.viewItems.reduce((r2, i2) => r2 + i2.size, 0);
      this.saveProportions();
    }
  }
  /**
   * The sum of all views' sizes.
   */
  get contentSize() {
    return this._contentSize;
  }
  /**
   * The amount of views in this {@link SplitView}.
   */
  get length() {
    return this.viewItems.length;
  }
  /**
   * The minimum size of this {@link SplitView}.
   */
  get minimumSize() {
    return this.viewItems.reduce((r2, item) => r2 + item.minimumSize, 0);
  }
  /**
   * The maximum size of this {@link SplitView}.
   */
  get maximumSize() {
    return this.length === 0 ? Number.POSITIVE_INFINITY : this.viewItems.reduce((r2, item) => r2 + item.maximumSize, 0);
  }
  get orthogonalStartSash() {
    return this._orthogonalStartSash;
  }
  get orthogonalEndSash() {
    return this._orthogonalEndSash;
  }
  get startSnappingEnabled() {
    return this._startSnappingEnabled;
  }
  get endSnappingEnabled() {
    return this._endSnappingEnabled;
  }
  /**
   * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
   * located at the left- or top-most side of the SplitView.
   * Corner sashes will be created automatically at the intersections.
   */
  set orthogonalStartSash(sash) {
    for (const sashItem of this.sashItems) {
      sashItem.sash.orthogonalStartSash = sash;
    }
    this._orthogonalStartSash = sash;
  }
  /**
   * A reference to a sash, perpendicular to all sashes in this {@link SplitView},
   * located at the right- or bottom-most side of the SplitView.
   * Corner sashes will be created automatically at the intersections.
   */
  set orthogonalEndSash(sash) {
    for (const sashItem of this.sashItems) {
      sashItem.sash.orthogonalEndSash = sash;
    }
    this._orthogonalEndSash = sash;
  }
  /**
   * The internal sashes within this {@link SplitView}.
   */
  get sashes() {
    return this.sashItems.map((s) => s.sash);
  }
  /**
   * Enable/disable snapping at the beginning of this {@link SplitView}.
   */
  set startSnappingEnabled(startSnappingEnabled) {
    if (this._startSnappingEnabled === startSnappingEnabled) {
      return;
    }
    this._startSnappingEnabled = startSnappingEnabled;
    this.updateSashEnablement();
  }
  /**
   * Enable/disable snapping at the end of this {@link SplitView}.
   */
  set endSnappingEnabled(endSnappingEnabled) {
    if (this._endSnappingEnabled === endSnappingEnabled) {
      return;
    }
    this._endSnappingEnabled = endSnappingEnabled;
    this.updateSashEnablement();
  }
  style(styles) {
    if (styles.separatorBorder.isTransparent()) {
      this.el.classList.remove("separator-border");
      this.el.style.removeProperty("--separator-border");
    } else {
      this.el.classList.add("separator-border");
      this.el.style.setProperty("--separator-border", styles.separatorBorder.toString());
    }
  }
  /**
   * Add a {@link IView view} to this {@link SplitView}.
   *
   * @param view The view to add.
   * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
   * @param index The index to insert the view on.
   * @param skipLayout Whether layout should be skipped.
   */
  addView(view, size3, index2 = this.viewItems.length, skipLayout) {
    this.doAddView(view, size3, index2, skipLayout);
  }
  /**
   * Remove a {@link IView view} from this {@link SplitView}.
   *
   * @param index The index where the {@link IView view} is located.
   * @param sizing Whether to distribute other {@link IView view}'s sizes.
   */
  removeView(index2, sizing) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      if (sizing?.type === "auto") {
        if (this.areViewsDistributed()) {
          sizing = { type: "distribute" };
        } else {
          sizing = { type: "split", index: sizing.index };
        }
      }
      const referenceViewItem = sizing?.type === "split" ? this.viewItems[sizing.index] : void 0;
      const viewItemToRemove = this.viewItems.splice(index2, 1)[0];
      if (referenceViewItem) {
        referenceViewItem.size += viewItemToRemove.size;
      }
      if (this.viewItems.length >= 1) {
        const sashIndex = Math.max(index2 - 1, 0);
        const sashItem = this.sashItems.splice(sashIndex, 1)[0];
        sashItem.disposable.dispose();
      }
      this.relayout();
      if (sizing?.type === "distribute") {
        this.distributeViewSizes();
      }
      const result = viewItemToRemove.view;
      viewItemToRemove.dispose();
      return result;
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  removeAllViews() {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const viewItems = this.viewItems.splice(0, this.viewItems.length);
      for (const viewItem of viewItems) {
        viewItem.dispose();
      }
      const sashItems = this.sashItems.splice(0, this.sashItems.length);
      for (const sashItem of sashItems) {
        sashItem.disposable.dispose();
      }
      this.relayout();
      return viewItems.map((i2) => i2.view);
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  /**
   * Move a {@link IView view} to a different index.
   *
   * @param from The source index.
   * @param to The target index.
   */
  moveView(from, to) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    const cachedVisibleSize = this.getViewCachedVisibleSize(from);
    const sizing = typeof cachedVisibleSize === "undefined" ? this.getViewSize(from) : Sizing.Invisible(cachedVisibleSize);
    const view = this.removeView(from);
    this.addView(view, sizing, to);
  }
  /**
   * Swap two {@link IView views}.
   *
   * @param from The source index.
   * @param to The target index.
   */
  swapViews(from, to) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    if (from > to) {
      return this.swapViews(to, from);
    }
    const fromSize = this.getViewSize(from);
    const toSize2 = this.getViewSize(to);
    const toView = this.removeView(to);
    const fromView = this.removeView(from);
    this.addView(toView, fromSize, from);
    this.addView(fromView, toSize2, to);
  }
  /**
   * Returns whether the {@link IView view} is visible.
   *
   * @param index The {@link IView view} index.
   */
  isViewVisible(index2) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index2];
    return viewItem.visible;
  }
  /**
   * Set a {@link IView view}'s visibility.
   *
   * @param index The {@link IView view} index.
   * @param visible Whether the {@link IView view} should be visible.
   */
  setViewVisible(index2, visible) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index2];
    viewItem.setVisible(visible);
    this.distributeEmptySpace(index2);
    this.layoutViews();
    this.saveProportions();
  }
  /**
   * Returns the {@link IView view}'s size previously to being hidden.
   *
   * @param index The {@link IView view} index.
   */
  getViewCachedVisibleSize(index2) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      throw new Error("Index out of bounds");
    }
    const viewItem = this.viewItems[index2];
    return viewItem.cachedVisibleSize;
  }
  /**
   * Layout the {@link SplitView}.
   *
   * @param size The entire size of the {@link SplitView}.
   * @param layoutContext An optional layout context to pass along to {@link IView views}.
   */
  layout(size3, layoutContext) {
    const previousSize = Math.max(this.size, this._contentSize);
    this.size = size3;
    this.layoutContext = layoutContext;
    if (!this.proportions) {
      const indexes = range(this.viewItems.length);
      const lowPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 1 /* Low */);
      const highPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 2 /* High */);
      this.resize(this.viewItems.length - 1, size3 - previousSize, void 0, lowPriorityIndexes, highPriorityIndexes);
    } else {
      let total = 0;
      for (let i2 = 0; i2 < this.viewItems.length; i2++) {
        const item = this.viewItems[i2];
        const proportion = this.proportions[i2];
        if (typeof proportion === "number") {
          total += proportion;
        } else {
          size3 -= item.size;
        }
      }
      for (let i2 = 0; i2 < this.viewItems.length; i2++) {
        const item = this.viewItems[i2];
        const proportion = this.proportions[i2];
        if (typeof proportion === "number" && total > 0) {
          item.size = clamp(Math.round(proportion * size3 / total), item.minimumSize, item.maximumSize);
        }
      }
    }
    this.distributeEmptySpace();
    this.layoutViews();
  }
  saveProportions() {
    if (this.proportionalLayout && this._contentSize > 0) {
      this.proportions = this.viewItems.map((v2) => v2.proportionalLayout && v2.visible ? v2.size / this._contentSize : void 0);
    }
  }
  onSashStart({ sash, start, alt }) {
    for (const item of this.viewItems) {
      item.enabled = false;
    }
    const index2 = this.sashItems.findIndex((item) => item.sash === sash);
    const disposable = combinedDisposable(
      addDisposableListener(this.el.ownerDocument.body, "keydown", (e4) => resetSashDragState(this.sashDragState.current, e4.altKey)),
      addDisposableListener(this.el.ownerDocument.body, "keyup", () => resetSashDragState(this.sashDragState.current, false))
    );
    const resetSashDragState = (start2, alt2) => {
      const sizes = this.viewItems.map((i2) => i2.size);
      let minDelta = Number.NEGATIVE_INFINITY;
      let maxDelta = Number.POSITIVE_INFINITY;
      if (this.inverseAltBehavior) {
        alt2 = !alt2;
      }
      if (alt2) {
        const isLastSash = index2 === this.sashItems.length - 1;
        if (isLastSash) {
          const viewItem = this.viewItems[index2];
          minDelta = (viewItem.minimumSize - viewItem.size) / 2;
          maxDelta = (viewItem.maximumSize - viewItem.size) / 2;
        } else {
          const viewItem = this.viewItems[index2 + 1];
          minDelta = (viewItem.size - viewItem.maximumSize) / 2;
          maxDelta = (viewItem.size - viewItem.minimumSize) / 2;
        }
      }
      let snapBefore;
      let snapAfter;
      if (!alt2) {
        const upIndexes = range(index2, -1);
        const downIndexes = range(index2 + 1, this.viewItems.length);
        const minDeltaUp = upIndexes.reduce((r2, i2) => r2 + (this.viewItems[i2].minimumSize - sizes[i2]), 0);
        const maxDeltaUp = upIndexes.reduce((r2, i2) => r2 + (this.viewItems[i2].viewMaximumSize - sizes[i2]), 0);
        const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r2, i2) => r2 + (sizes[i2] - this.viewItems[i2].minimumSize), 0);
        const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r2, i2) => r2 + (sizes[i2] - this.viewItems[i2].viewMaximumSize), 0);
        const minDelta2 = Math.max(minDeltaUp, minDeltaDown);
        const maxDelta2 = Math.min(maxDeltaDown, maxDeltaUp);
        const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
        const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
        if (typeof snapBeforeIndex === "number") {
          const viewItem = this.viewItems[snapBeforeIndex];
          const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
          snapBefore = {
            index: snapBeforeIndex,
            limitDelta: viewItem.visible ? minDelta2 - halfSize : minDelta2 + halfSize,
            size: viewItem.size
          };
        }
        if (typeof snapAfterIndex === "number") {
          const viewItem = this.viewItems[snapAfterIndex];
          const halfSize = Math.floor(viewItem.viewMinimumSize / 2);
          snapAfter = {
            index: snapAfterIndex,
            limitDelta: viewItem.visible ? maxDelta2 + halfSize : maxDelta2 - halfSize,
            size: viewItem.size
          };
        }
      }
      this.sashDragState = { start: start2, current: start2, index: index2, sizes, minDelta, maxDelta, alt: alt2, snapBefore, snapAfter, disposable };
    };
    resetSashDragState(start, alt);
  }
  onSashChange({ current }) {
    const { index: index2, start, sizes, alt, minDelta, maxDelta, snapBefore, snapAfter } = this.sashDragState;
    this.sashDragState.current = current;
    const delta2 = current - start;
    const newDelta = this.resize(index2, delta2, sizes, void 0, void 0, minDelta, maxDelta, snapBefore, snapAfter);
    if (alt) {
      const isLastSash = index2 === this.sashItems.length - 1;
      const newSizes = this.viewItems.map((i2) => i2.size);
      const viewItemIndex = isLastSash ? index2 : index2 + 1;
      const viewItem = this.viewItems[viewItemIndex];
      const newMinDelta = viewItem.size - viewItem.maximumSize;
      const newMaxDelta = viewItem.size - viewItem.minimumSize;
      const resizeIndex = isLastSash ? index2 - 1 : index2 + 1;
      this.resize(resizeIndex, -newDelta, newSizes, void 0, void 0, newMinDelta, newMaxDelta);
    }
    this.distributeEmptySpace();
    this.layoutViews();
  }
  onSashEnd(index2) {
    this._onDidSashChange.fire(index2);
    this.sashDragState.disposable.dispose();
    this.saveProportions();
    for (const item of this.viewItems) {
      item.enabled = true;
    }
  }
  onViewChange(item, size3) {
    const index2 = this.viewItems.indexOf(item);
    if (index2 < 0 || index2 >= this.viewItems.length) {
      return;
    }
    size3 = typeof size3 === "number" ? size3 : item.size;
    size3 = clamp(size3, item.minimumSize, item.maximumSize);
    if (this.inverseAltBehavior && index2 > 0) {
      this.resize(index2 - 1, Math.floor((item.size - size3) / 2));
      this.distributeEmptySpace();
      this.layoutViews();
    } else {
      item.size = size3;
      this.relayout([index2], void 0);
    }
  }
  /**
   * Resize a {@link IView view} within the {@link SplitView}.
   *
   * @param index The {@link IView view} index.
   * @param size The {@link IView view} size.
   */
  resizeView(index2, size3) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      return;
    }
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const indexes = range(this.viewItems.length).filter((i2) => i2 !== index2);
      const lowPriorityIndexes = [...indexes.filter((i2) => this.viewItems[i2].priority === 1 /* Low */), index2];
      const highPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 2 /* High */);
      const item = this.viewItems[index2];
      size3 = Math.round(size3);
      size3 = clamp(size3, item.minimumSize, Math.min(item.maximumSize, this.size));
      item.size = size3;
      this.relayout(lowPriorityIndexes, highPriorityIndexes);
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  /**
   * Returns whether all other {@link IView views} are at their minimum size.
   */
  isViewExpanded(index2) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      return false;
    }
    for (const item of this.viewItems) {
      if (item !== this.viewItems[index2] && item.size > item.minimumSize) {
        return false;
      }
    }
    return true;
  }
  /**
   * Distribute the entire {@link SplitView} size among all {@link IView views}.
   */
  distributeViewSizes() {
    const flexibleViewItems = [];
    let flexibleSize = 0;
    for (const item of this.viewItems) {
      if (item.maximumSize - item.minimumSize > 0) {
        flexibleViewItems.push(item);
        flexibleSize += item.size;
      }
    }
    const size3 = Math.floor(flexibleSize / flexibleViewItems.length);
    for (const item of flexibleViewItems) {
      item.size = clamp(size3, item.minimumSize, item.maximumSize);
    }
    const indexes = range(this.viewItems.length);
    const lowPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 1 /* Low */);
    const highPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 2 /* High */);
    this.relayout(lowPriorityIndexes, highPriorityIndexes);
  }
  /**
   * Returns the size of a {@link IView view}.
   */
  getViewSize(index2) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      return -1;
    }
    return this.viewItems[index2].size;
  }
  doAddView(view, size3, index2 = this.viewItems.length, skipLayout) {
    if (this.state !== 0 /* Idle */) {
      throw new Error("Cant modify splitview");
    }
    this.state = 1 /* Busy */;
    try {
      const container2 = $(".split-view-view");
      if (index2 === this.viewItems.length) {
        this.viewContainer.appendChild(container2);
      } else {
        this.viewContainer.insertBefore(container2, this.viewContainer.children.item(index2));
      }
      const onChangeDisposable = view.onDidChange((size4) => this.onViewChange(item, size4));
      const containerDisposable = toDisposable(() => container2.remove());
      const disposable = combinedDisposable(onChangeDisposable, containerDisposable);
      let viewSize;
      if (typeof size3 === "number") {
        viewSize = size3;
      } else {
        if (size3.type === "auto") {
          if (this.areViewsDistributed()) {
            size3 = { type: "distribute" };
          } else {
            size3 = { type: "split", index: size3.index };
          }
        }
        if (size3.type === "split") {
          viewSize = this.getViewSize(size3.index) / 2;
        } else if (size3.type === "invisible") {
          viewSize = { cachedVisibleSize: size3.cachedVisibleSize };
        } else {
          viewSize = view.minimumSize;
        }
      }
      const item = this.orientation === 0 /* VERTICAL */ ? new VerticalViewItem(container2, view, viewSize, disposable) : new HorizontalViewItem(container2, view, viewSize, disposable);
      this.viewItems.splice(index2, 0, item);
      if (this.viewItems.length > 1) {
        const opts = { orthogonalStartSash: this.orthogonalStartSash, orthogonalEndSash: this.orthogonalEndSash };
        const sash = this.orientation === 0 /* VERTICAL */ ? new Sash(this.sashContainer, { getHorizontalSashTop: (s) => this.getSashPosition(s), getHorizontalSashWidth: this.getSashOrthogonalSize }, { ...opts, orientation: 1 /* HORIZONTAL */ }) : new Sash(this.sashContainer, { getVerticalSashLeft: (s) => this.getSashPosition(s), getVerticalSashHeight: this.getSashOrthogonalSize }, { ...opts, orientation: 0 /* VERTICAL */ });
        const sashEventMapper = this.orientation === 0 /* VERTICAL */ ? (e4) => ({ sash, start: e4.startY, current: e4.currentY, alt: e4.altKey }) : (e4) => ({ sash, start: e4.startX, current: e4.currentX, alt: e4.altKey });
        const onStart = Event2.map(sash.onDidStart, sashEventMapper);
        const onStartDisposable = onStart(this.onSashStart, this);
        const onChange = Event2.map(sash.onDidChange, sashEventMapper);
        const onChangeDisposable2 = onChange(this.onSashChange, this);
        const onEnd = Event2.map(sash.onDidEnd, () => this.sashItems.findIndex((item2) => item2.sash === sash));
        const onEndDisposable = onEnd(this.onSashEnd, this);
        const onDidResetDisposable = sash.onDidReset(() => {
          const index3 = this.sashItems.findIndex((item2) => item2.sash === sash);
          const upIndexes = range(index3, -1);
          const downIndexes = range(index3 + 1, this.viewItems.length);
          const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
          const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
          if (typeof snapBeforeIndex === "number" && !this.viewItems[snapBeforeIndex].visible) {
            return;
          }
          if (typeof snapAfterIndex === "number" && !this.viewItems[snapAfterIndex].visible) {
            return;
          }
          this._onDidSashReset.fire(index3);
        });
        const disposable2 = combinedDisposable(onStartDisposable, onChangeDisposable2, onEndDisposable, onDidResetDisposable, sash);
        const sashItem = { sash, disposable: disposable2 };
        this.sashItems.splice(index2 - 1, 0, sashItem);
      }
      container2.appendChild(view.element);
      let highPriorityIndexes;
      if (typeof size3 !== "number" && size3.type === "split") {
        highPriorityIndexes = [size3.index];
      }
      if (!skipLayout) {
        this.relayout([index2], highPriorityIndexes);
      }
      if (!skipLayout && typeof size3 !== "number" && size3.type === "distribute") {
        this.distributeViewSizes();
      }
    } finally {
      this.state = 0 /* Idle */;
    }
  }
  relayout(lowPriorityIndexes, highPriorityIndexes) {
    const contentSize = this.viewItems.reduce((r2, i2) => r2 + i2.size, 0);
    this.resize(this.viewItems.length - 1, this.size - contentSize, void 0, lowPriorityIndexes, highPriorityIndexes);
    this.distributeEmptySpace();
    this.layoutViews();
    this.saveProportions();
  }
  resize(index2, delta2, sizes = this.viewItems.map((i2) => i2.size), lowPriorityIndexes, highPriorityIndexes, overloadMinDelta = Number.NEGATIVE_INFINITY, overloadMaxDelta = Number.POSITIVE_INFINITY, snapBefore, snapAfter) {
    if (index2 < 0 || index2 >= this.viewItems.length) {
      return 0;
    }
    const upIndexes = range(index2, -1);
    const downIndexes = range(index2 + 1, this.viewItems.length);
    if (highPriorityIndexes) {
      for (const index3 of highPriorityIndexes) {
        pushToStart(upIndexes, index3);
        pushToStart(downIndexes, index3);
      }
    }
    if (lowPriorityIndexes) {
      for (const index3 of lowPriorityIndexes) {
        pushToEnd(upIndexes, index3);
        pushToEnd(downIndexes, index3);
      }
    }
    const upItems = upIndexes.map((i2) => this.viewItems[i2]);
    const upSizes = upIndexes.map((i2) => sizes[i2]);
    const downItems = downIndexes.map((i2) => this.viewItems[i2]);
    const downSizes = downIndexes.map((i2) => sizes[i2]);
    const minDeltaUp = upIndexes.reduce((r2, i2) => r2 + (this.viewItems[i2].minimumSize - sizes[i2]), 0);
    const maxDeltaUp = upIndexes.reduce((r2, i2) => r2 + (this.viewItems[i2].maximumSize - sizes[i2]), 0);
    const maxDeltaDown = downIndexes.length === 0 ? Number.POSITIVE_INFINITY : downIndexes.reduce((r2, i2) => r2 + (sizes[i2] - this.viewItems[i2].minimumSize), 0);
    const minDeltaDown = downIndexes.length === 0 ? Number.NEGATIVE_INFINITY : downIndexes.reduce((r2, i2) => r2 + (sizes[i2] - this.viewItems[i2].maximumSize), 0);
    const minDelta = Math.max(minDeltaUp, minDeltaDown, overloadMinDelta);
    const maxDelta = Math.min(maxDeltaDown, maxDeltaUp, overloadMaxDelta);
    let snapped = false;
    if (snapBefore) {
      const snapView = this.viewItems[snapBefore.index];
      const visible = delta2 >= snapBefore.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible, snapBefore.size);
    }
    if (!snapped && snapAfter) {
      const snapView = this.viewItems[snapAfter.index];
      const visible = delta2 < snapAfter.limitDelta;
      snapped = visible !== snapView.visible;
      snapView.setVisible(visible, snapAfter.size);
    }
    if (snapped) {
      return this.resize(index2, delta2, sizes, lowPriorityIndexes, highPriorityIndexes, overloadMinDelta, overloadMaxDelta);
    }
    delta2 = clamp(delta2, minDelta, maxDelta);
    for (let i2 = 0, deltaUp = delta2; i2 < upItems.length; i2++) {
      const item = upItems[i2];
      const size3 = clamp(upSizes[i2] + deltaUp, item.minimumSize, item.maximumSize);
      const viewDelta = size3 - upSizes[i2];
      deltaUp -= viewDelta;
      item.size = size3;
    }
    for (let i2 = 0, deltaDown = delta2; i2 < downItems.length; i2++) {
      const item = downItems[i2];
      const size3 = clamp(downSizes[i2] - deltaDown, item.minimumSize, item.maximumSize);
      const viewDelta = size3 - downSizes[i2];
      deltaDown += viewDelta;
      item.size = size3;
    }
    return delta2;
  }
  distributeEmptySpace(lowPriorityIndex) {
    const contentSize = this.viewItems.reduce((r2, i2) => r2 + i2.size, 0);
    let emptyDelta = this.size - contentSize;
    const indexes = range(this.viewItems.length - 1, -1);
    const lowPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 1 /* Low */);
    const highPriorityIndexes = indexes.filter((i2) => this.viewItems[i2].priority === 2 /* High */);
    for (const index2 of highPriorityIndexes) {
      pushToStart(indexes, index2);
    }
    for (const index2 of lowPriorityIndexes) {
      pushToEnd(indexes, index2);
    }
    if (typeof lowPriorityIndex === "number") {
      pushToEnd(indexes, lowPriorityIndex);
    }
    for (let i2 = 0; emptyDelta !== 0 && i2 < indexes.length; i2++) {
      const item = this.viewItems[indexes[i2]];
      const size3 = clamp(item.size + emptyDelta, item.minimumSize, item.maximumSize);
      const viewDelta = size3 - item.size;
      emptyDelta -= viewDelta;
      item.size = size3;
    }
  }
  layoutViews() {
    this._contentSize = this.viewItems.reduce((r2, i2) => r2 + i2.size, 0);
    let offset = 0;
    for (const viewItem of this.viewItems) {
      viewItem.layout(offset, this.layoutContext);
      offset += viewItem.size;
    }
    this.sashItems.forEach((item) => item.sash.layout());
    this.updateSashEnablement();
    this.updateScrollableElement();
  }
  updateScrollableElement() {
    if (this.orientation === 0 /* VERTICAL */) {
      this.scrollableElement.setScrollDimensions({
        height: this.size,
        scrollHeight: this._contentSize
      });
    } else {
      this.scrollableElement.setScrollDimensions({
        width: this.size,
        scrollWidth: this._contentSize
      });
    }
  }
  updateSashEnablement() {
    let previous = false;
    const collapsesDown = this.viewItems.map((i2) => previous = i2.size - i2.minimumSize > 0 || previous);
    previous = false;
    const expandsDown = this.viewItems.map((i2) => previous = i2.maximumSize - i2.size > 0 || previous);
    const reverseViews = [...this.viewItems].reverse();
    previous = false;
    const collapsesUp = reverseViews.map((i2) => previous = i2.size - i2.minimumSize > 0 || previous).reverse();
    previous = false;
    const expandsUp = reverseViews.map((i2) => previous = i2.maximumSize - i2.size > 0 || previous).reverse();
    let position2 = 0;
    for (let index2 = 0; index2 < this.sashItems.length; index2++) {
      const { sash } = this.sashItems[index2];
      const viewItem = this.viewItems[index2];
      position2 += viewItem.size;
      const min = !(collapsesDown[index2] && expandsUp[index2 + 1]);
      const max = !(expandsDown[index2] && collapsesUp[index2 + 1]);
      if (min && max) {
        const upIndexes = range(index2, -1);
        const downIndexes = range(index2 + 1, this.viewItems.length);
        const snapBeforeIndex = this.findFirstSnapIndex(upIndexes);
        const snapAfterIndex = this.findFirstSnapIndex(downIndexes);
        const snappedBefore = typeof snapBeforeIndex === "number" && !this.viewItems[snapBeforeIndex].visible;
        const snappedAfter = typeof snapAfterIndex === "number" && !this.viewItems[snapAfterIndex].visible;
        if (snappedBefore && collapsesUp[index2] && (position2 > 0 || this.startSnappingEnabled)) {
          sash.state = 1 /* AtMinimum */;
        } else if (snappedAfter && collapsesDown[index2] && (position2 < this._contentSize || this.endSnappingEnabled)) {
          sash.state = 2 /* AtMaximum */;
        } else {
          sash.state = 0 /* Disabled */;
        }
      } else if (min && !max) {
        sash.state = 1 /* AtMinimum */;
      } else if (!min && max) {
        sash.state = 2 /* AtMaximum */;
      } else {
        sash.state = 3 /* Enabled */;
      }
    }
  }
  getSashPosition(sash) {
    let position2 = 0;
    for (let i2 = 0; i2 < this.sashItems.length; i2++) {
      position2 += this.viewItems[i2].size;
      if (this.sashItems[i2].sash === sash) {
        return position2;
      }
    }
    return 0;
  }
  findFirstSnapIndex(indexes) {
    for (const index2 of indexes) {
      const viewItem = this.viewItems[index2];
      if (!viewItem.visible) {
        continue;
      }
      if (viewItem.snap) {
        return index2;
      }
    }
    for (const index2 of indexes) {
      const viewItem = this.viewItems[index2];
      if (viewItem.visible && viewItem.maximumSize - viewItem.minimumSize > 0) {
        return void 0;
      }
      if (!viewItem.visible && viewItem.snap) {
        return index2;
      }
    }
    return void 0;
  }
  areViewsDistributed() {
    let min = void 0, max = void 0;
    for (const view of this.viewItems) {
      min = min === void 0 ? view.size : Math.min(min, view.size);
      max = max === void 0 ? view.size : Math.max(max, view.size);
      if (max - min > 2) {
        return false;
      }
    }
    return true;
  }
  dispose() {
    this.sashDragState?.disposable.dispose();
    dispose(this.viewItems);
    this.viewItems = [];
    this.sashItems.forEach((i2) => i2.disposable.dispose());
    this.sashItems = [];
    super.dispose();
  }
};
export { defaultStyles, ViewItem, VerticalViewItem, HorizontalViewItem, Sizing, SplitView };
