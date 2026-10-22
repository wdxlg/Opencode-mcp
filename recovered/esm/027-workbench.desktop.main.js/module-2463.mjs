// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/compressedVirtualizedScrollView.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableSignal } from "./module-0058.mjs";
import { asLayoutRevision, computeCompressedVirtualizedScrollHeight, computeCompressedVirtualizedScrollLayout, computeItemRanges, createAnchoredSizeEditBatch, mapLogicalPosition } from "./module-2462.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { getWindow, h, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Scrollable } from "./module-0099.mjs";
import { SmoothScrollableElement } from "./module-0259.mjs";
import { ObservableElementSizeObserver } from "./module-0478.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { findFirstMax } from "./module-0006.mjs";
import { compareBy, numberComparator } from "./module-0007.mjs";
import { globalTransaction } from "./module-0045.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/compressedVirtualizedScrollView.ts
var scrollDirectionRetentionDurationMs = 100;

var CompressedVirtualizedScrollView = class extends Disposable {
  constructor(elementToObserve, dimension, itemGap, createItems) {
    super();
    this._lastGeometryEdit = observableValue(this, void 0);
    this._itemAnchorEditSignal = observableSignal(this);
    this._revision = asLayoutRevision(0);
    this._leadingScrollSlack = 0;
    this._trailingScrollSlack = 0;
    this._previousItemGap = 0;
    this._lastScrollTop = 0;
    this._clearScrollDirection = this._register(new RunOnceScheduler(() => this._lastScrollDirection = void 0, scrollDirectionRetentionDurationMs));
    this._isUpdating = false;
    this.lastGeometryEdit = this._lastGeometryEdit;
    this._scrollableElements = h("div.scrollContent", [
      h("div@content", {
        style: {
          overflow: "hidden",
          position: "relative"
        }
      }),
      h("div.monaco-editor@overflowWidgetsDomNode")
    ]);
    this._scrollable = this._register(new Scrollable({
      forceIntegerValues: false,
      scheduleAtNextAnimationFrame: (callback) => scheduleAtNextAnimationFrame(getWindow(elementToObserve), callback),
      smoothScrollDuration: 100
    }));
    this._scrollableElement = this._register(new SmoothScrollableElement(this._scrollableElements.root, {
      vertical: 1 /* Auto */,
      horizontal: 1 /* Auto */,
      useShadows: false
    }, this._scrollable));
    this.domNode = h("div", {}, [this._scrollableElement.getDomNode()]).root;
    this._sizeObserver = this._register(new ObservableElementSizeObserver(elementToObserve, void 0));
    this.scrollTop = observableFromEvent(this, this._scrollableElement.onScroll, () => (
      /** @description scrollTop */
      this._scrollableElement.getScrollPosition().scrollTop
    ));
    this.scrollLeft = observableFromEvent(this, this._scrollableElement.onScroll, () => (
      /** @description scrollLeft */
      this._scrollableElement.getScrollPosition().scrollLeft
    ));
    this._items = createItems({
      contentDomNode: this._scrollableElements.content,
      overflowWidgetsDomNode: this._scrollableElements.overflowWidgetsDomNode,
      scrollLeft: this.scrollLeft
    });
    this._layout = observableValue(this, computeCompressedVirtualizedScrollLayout({
      revision: this._revision,
      scrollTop: 0,
      viewportHeight: 0,
      itemGap: 0,
      itemHeights: []
    }));
    this.layout = this._layout;
    this._scrollDimensions = observableValue(this, { width: 0, height: 0, scrollWidth: 0, scrollHeight: 0 });
    this.scrollDimensions = this._scrollDimensions;
    this._register(autorun((reader) => {
      this._sizeObserver.observe(dimension.read(reader));
    }));
    this._register(autorun((reader) => {
      this._itemAnchorEditSignal.read(reader);
      const width2 = this._sizeObserver.width.read(reader);
      const height = this._sizeObserver.height.read(reader);
      const items = this._items.read(reader);
      const itemHeights = items.map((item) => item.size.read(reader));
      const max = findFirstMax(items, compareBy((item) => item.maxScroll.read(reader).maxScroll, numberComparator));
      const maxScroll = max?.maxScroll.read(reader).maxScroll ?? 0;
      const gap = itemGap.read(reader);
      const requestedScrollTop = this.scrollTop.read(reader);
      globalTransaction((tx) => this._update(items, itemHeights, gap, width2, height, width2 + maxScroll, requestedScrollTop, tx));
    }));
  }
  setScrollPosition(position2, smooth = false) {
    this._scrollableElement.setScrollPosition({
      ...position2,
      reuseAnimation: smooth
    });
  }
  getScrollPosition() {
    return this._scrollableElement.getScrollPosition();
  }
  runWithScrollAnchor(anchor, update) {
    if (anchor.revision !== this._revision) {
      throw new BugIndicatingError(`Cannot use layout revision ${anchor.revision} as an anchor for revision ${this._revision}`);
    }
    const logicalScrollHeight = this._layout.get().logicalScrollHeight;
    if (!Number.isFinite(anchor.offset) || anchor.offset < 0 || anchor.offset > logicalScrollHeight) {
      throw new BugIndicatingError(`Logical anchor ${anchor.offset} is outside layout revision ${this._revision}`);
    }
    const logicalViewportTop = this.getScrollPosition().scrollTop - this._leadingScrollSlack;
    this._runWithPendingAnchor({
      position: anchor,
      viewportOffset: anchor.offset - logicalViewportTop
    }, update);
  }
  _runWithItemScrollAnchor(item, getItemOffset, update) {
    const items = this._items.get();
    const itemIndex = items.findIndex((candidate) => candidate === item);
    if (itemIndex === -1) {
      throw new BugIndicatingError("Cannot anchor an item that is not in the compacted virtualized scroll view");
    }
    const itemRange = this._layout.get().items[itemIndex].contentRange;
    const itemOffset = getItemOffset();
    if (!Number.isFinite(itemOffset) || itemOffset < 0 || itemOffset > itemRange.length) {
      throw new BugIndicatingError(`Item anchor ${itemOffset} is outside item range ${itemRange}`);
    }
    const position2 = {
      revision: this._revision,
      offset: itemRange.start + itemOffset
    };
    const logicalViewportTop = this.getScrollPosition().scrollTop - this._leadingScrollSlack;
    this._runWithPendingAnchor({
      position: position2,
      viewportOffset: position2.offset - logicalViewportTop,
      item,
      getItemOffset
    }, (tx) => {
      update(tx);
      if (getItemOffset() !== itemOffset) {
        this._itemAnchorEditSignal.trigger(tx);
      }
    });
  }
  _runWithPendingAnchor(pendingAnchor, update) {
    if (this._pendingAnchor) {
      throw new BugIndicatingError("Cannot nest compacted virtualized scroll anchors");
    }
    this._pendingAnchor = pendingAnchor;
    try {
      globalTransaction(update);
    } finally {
      if (this._pendingAnchor === pendingAnchor) {
        this._pendingAnchor = void 0;
      }
    }
  }
  _update(items, itemHeights, itemGap, width2, height, scrollWidth, requestedScrollTop, tx) {
    if (this._isUpdating) {
      return;
    }
    this._isUpdating = true;
    try {
      let targetScrollTop = requestedScrollTop;
      const scrollDelta = requestedScrollTop - this._lastScrollTop;
      if (scrollDelta !== 0) {
        this._lastScrollDirection = scrollDelta < 0 ? "up" : "down";
        this._clearScrollDirection.schedule();
      }
      const previousItemHeights = this._previousItemHeights;
      const geometryChanged = previousItemHeights !== void 0 && (itemGap !== this._previousItemGap || !arrayEquals2(previousItemHeights, itemHeights));
      const hasStableItems = this._previousItems !== void 0 && this._previousItems.length === items.length && this._previousItems.every((item, index2) => item === items[index2]);
      let didApplyAnchor = false;
      const appliesPendingAnchor = !!this._pendingAnchor && hasStableItems;
      if (previousItemHeights && (geometryChanged || appliesPendingAnchor) && hasStableItems) {
        const oldLogicalScrollHeight = computeCompressedVirtualizedScrollHeight(previousItemHeights, this._previousItemGap);
        const oldLogicalViewportTop = requestedScrollTop - this._leadingScrollSlack;
        const pendingAnchor = this._pendingAnchor;
        const isScrollingUp = this._lastScrollDirection === "up";
        const defaultAnchorViewportOffset = isScrollingUp ? height : 0;
        const anchorKind = pendingAnchor?.item ? "item" : pendingAnchor ? "logical" : isScrollingUp ? "viewportBottom" : "viewportTop";
        const anchorOffset = pendingAnchor?.position.offset ?? Math.max(0, Math.min(oldLogicalViewportTop + defaultAnchorViewportOffset, oldLogicalScrollHeight));
        const anchorViewportOffset = pendingAnchor?.viewportOffset ?? anchorOffset - oldLogicalViewportTop;
        const fromRevision = this._revision;
        const toRevision = geometryChanged ? asLayoutRevision(fromRevision + 1) : fromRevision;
        const edit3 = createAnchoredSizeEditBatch(fromRevision, toRevision, previousItemHeights, itemHeights, this._previousItemGap, itemGap, anchorOffset);
        let mappedAnchor = mapLogicalPosition(edit3.anchor, edit3);
        if (pendingAnchor?.item && pendingAnchor.getItemOffset) {
          const itemIndex = items.findIndex((item) => item === pendingAnchor.item);
          if (itemIndex === -1) {
            throw new BugIndicatingError("Compacted virtualized scroll anchor item was removed during its edit");
          }
          const itemRange = computeItemRanges(itemHeights, itemGap)[itemIndex];
          const itemOffset = pendingAnchor.getItemOffset();
          if (!Number.isFinite(itemOffset) || itemOffset < 0 || itemOffset > itemRange.length) {
            throw new BugIndicatingError(`Mapped item anchor ${itemOffset} is outside item range ${itemRange}`);
          }
          mappedAnchor = {
            revision: toRevision,
            offset: itemRange.start + itemOffset
          };
        }
        const newLogicalScrollHeight = computeCompressedVirtualizedScrollHeight(itemHeights, itemGap);
        const desiredLogicalScrollTop = mappedAnchor.offset - anchorViewportOffset;
        const naturalMaxScrollTop = Math.max(0, newLogicalScrollHeight - height);
        this._leadingScrollSlack = Math.max(0, -desiredLogicalScrollTop);
        this._trailingScrollSlack = Math.max(0, desiredLogicalScrollTop - naturalMaxScrollTop);
        targetScrollTop = this._leadingScrollSlack + desiredLogicalScrollTop;
        this._revision = toRevision;
        this._pendingAnchor = void 0;
        didApplyAnchor = true;
        this._lastGeometryEdit.set({
          fromRevision,
          toRevision,
          edits: edit3.edits,
          anchorKind,
          anchorOffset,
          mappedAnchorOffset: mappedAnchor.offset,
          anchorViewportOffset,
          desiredScrollTop: targetScrollTop,
          appliedScrollTop: targetScrollTop,
          leadingScrollSlack: this._leadingScrollSlack,
          trailingScrollSlack: this._trailingScrollSlack
        }, tx);
      } else if (geometryChanged) {
        this._revision = asLayoutRevision(this._revision + 1);
        this._leadingScrollSlack = 0;
        this._trailingScrollSlack = 0;
        this._lastGeometryEdit.set(void 0, tx);
      } else {
        if (scrollDelta > 0 && this._leadingScrollSlack > 0) {
          const consumedSlack = Math.min(scrollDelta, this._leadingScrollSlack);
          this._leadingScrollSlack -= consumedSlack;
          targetScrollTop -= consumedSlack;
        } else if (scrollDelta < 0 && this._trailingScrollSlack > 0) {
          const logicalScrollHeight = computeCompressedVirtualizedScrollHeight(itemHeights, itemGap);
          const naturalMaxScrollTop = this._leadingScrollSlack + Math.max(0, logicalScrollHeight - height);
          this._trailingScrollSlack = Math.max(0, targetScrollTop - naturalMaxScrollTop);
        }
      }
      let layout2 = computeCompressedVirtualizedScrollLayout({
        revision: this._revision,
        scrollTop: targetScrollTop,
        viewportHeight: height,
        itemGap,
        itemHeights,
        leadingScrollSlack: this._leadingScrollSlack,
        trailingScrollSlack: this._trailingScrollSlack
      });
      const dimensions = { width: width2, height, scrollWidth, scrollHeight: layout2.scrollHeight };
      this._scrollableElements.root.style.height = `${height}px`;
      this._scrollableElements.content.style.height = `${layout2.scrollHeight}px`;
      this._scrollable.setScrollDimensions(dimensions, true);
      const needsImmediateScrollCorrection = geometryChanged || targetScrollTop !== requestedScrollTop;
      if (needsImmediateScrollCorrection) {
        this._scrollable.setScrollPositionNow({ scrollTop: layout2.scrollTop });
      }
      const appliedScrollTop = this._scrollableElement.getScrollPosition().scrollTop;
      if (appliedScrollTop !== layout2.scrollTop) {
        layout2 = computeCompressedVirtualizedScrollLayout({
          revision: this._revision,
          scrollTop: appliedScrollTop,
          viewportHeight: height,
          itemGap,
          itemHeights,
          leadingScrollSlack: this._leadingScrollSlack,
          trailingScrollSlack: this._trailingScrollSlack
        });
      }
      const geometryEdit = this._lastGeometryEdit.get();
      if (didApplyAnchor && geometryEdit) {
        this._lastGeometryEdit.set({ ...geometryEdit, appliedScrollTop }, tx);
      }
      this._layout.set(layout2, tx);
      this._scrollDimensions.set(dimensions, tx);
      this._render(items, layout2, width2);
      this._previousItems = items;
      this._previousItemHeights = itemHeights;
      this._previousItemGap = itemGap;
      this._lastScrollTop = layout2.scrollTop;
    } finally {
      this._isUpdating = false;
    }
  }
  _render(items, layout2, width2) {
    for (let index2 = 0; index2 < items.length; index2++) {
      const item = items[index2];
      const itemLayout = layout2.items[index2];
      if (itemLayout.visibility !== "visible") {
        item.hide();
      } else {
        item.render(itemLayout.renderedRange, itemLayout.scrollOffset, width2, layout2.renderedViewport, {
          runWithScrollAnchor: (getItemOffset, update) => this._runWithItemScrollAnchor(item, getItemOffset, update)
        });
      }
    }
    this._scrollableElements.content.style.transform = `translateY(${-layout2.renderedViewport.start}px)`;
  }
};

function arrayEquals2(a, b) {
  return a.length === b.length && a.every((value2, index2) => value2 === b[index2]);
}
export { arrayEquals2, scrollDirectionRetentionDurationMs, CompressedVirtualizedScrollView };
