// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/compressedVirtualizedScrollLayout.ts
import { OffsetRange } from "./module-0144.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/compressedVirtualizedScrollLayout.ts
function asLayoutRevision(value2) {
  return value2;
}

function computeCompressedVirtualizedScrollLayout(input) {
  assertNonNegative("viewportHeight", input.viewportHeight);
  const leadingScrollSlack = input.leadingScrollSlack ?? 0;
  const trailingScrollSlack = input.trailingScrollSlack ?? 0;
  assertNonNegative("leadingScrollSlack", leadingScrollSlack);
  assertNonNegative("trailingScrollSlack", trailingScrollSlack);
  const logicalScrollHeight = computeCompressedVirtualizedScrollHeight(input.itemHeights, input.itemGap);
  const scrollHeight = leadingScrollSlack + logicalScrollHeight + trailingScrollSlack;
  const maxScrollTop = Math.max(0, scrollHeight - input.viewportHeight);
  const scrollTop = Math.max(0, Math.min(input.scrollTop, maxScrollTop));
  const contentViewport = OffsetRange.ofStartAndLength(scrollTop - leadingScrollSlack, input.viewportHeight);
  let contentTop = 0;
  let renderedTop = leadingScrollSlack;
  let hiddenContentHeightAboveViewport = 0;
  const items = [];
  for (let index2 = 0; index2 < input.itemHeights.length; index2++) {
    const fullHeight = input.itemHeights[index2];
    const renderedHeight = Math.min(fullHeight, input.viewportHeight);
    const maxScrollOffset = fullHeight - renderedHeight;
    const contentRange = OffsetRange.ofStartAndLength(contentTop, fullHeight);
    const renderedRange = OffsetRange.ofStartAndLength(renderedTop, renderedHeight);
    let visibility;
    let scrollOffset;
    if (contentRange.isBefore(contentViewport)) {
      visibility = "before";
      scrollOffset = maxScrollOffset;
    } else if (contentRange.isAfter(contentViewport)) {
      visibility = "after";
      scrollOffset = 0;
    } else {
      visibility = "visible";
      scrollOffset = Math.max(0, Math.min(contentViewport.start - contentRange.start, maxScrollOffset));
    }
    hiddenContentHeightAboveViewport += scrollOffset;
    items.push({
      contentRange,
      renderedRange,
      maxScrollOffset,
      scrollOffset,
      visibility
    });
    if (index2 < input.itemHeights.length - 1) {
      contentTop += fullHeight + input.itemGap;
      renderedTop += renderedHeight + input.itemGap;
    } else {
      contentTop += fullHeight;
      renderedTop += renderedHeight;
    }
  }
  const renderedScrollTop = scrollTop - hiddenContentHeightAboveViewport;
  return {
    revision: input.revision ?? asLayoutRevision(0),
    scrollTop,
    logicalScrollHeight,
    scrollHeight,
    leadingScrollSlack,
    trailingScrollSlack,
    renderedHeight: renderedTop + trailingScrollSlack,
    contentViewport,
    renderedViewport: OffsetRange.ofStartAndLength(renderedScrollTop, input.viewportHeight),
    hiddenContentHeightAboveViewport,
    items
  };
}

function computeItemRanges(itemHeights, itemGap) {
  assertNonNegative("itemGap", itemGap);
  const ranges = [];
  let offset = 0;
  for (let index2 = 0; index2 < itemHeights.length; index2++) {
    const height = itemHeights[index2];
    assertNonNegative(`itemHeights[${index2}]`, height);
    ranges.push(OffsetRange.ofStartAndLength(offset, height));
    offset += height + (index2 < itemHeights.length - 1 ? itemGap : 0);
  }
  return ranges;
}

function createAnchoredSizeEditBatch(fromRevision, toRevision, oldItemHeights, newItemHeights, oldItemGap, newItemGap, anchorOffset) {
  if (oldItemHeights.length !== newItemHeights.length) {
    throw new BugIndicatingError("Size edits require stable item identity and ordering");
  }
  const oldRanges = computeItemRanges(oldItemHeights, oldItemGap);
  const newRanges = computeItemRanges(newItemHeights, newItemGap);
  const edits = [];
  for (let index2 = 0; index2 < oldRanges.length; index2++) {
    if (!oldRanges[index2].equals(newRanges[index2])) {
      edits.push({ oldRange: oldRanges[index2], newRange: newRanges[index2] });
    }
  }
  return {
    fromRevision,
    toRevision,
    edits,
    anchor: { revision: fromRevision, offset: anchorOffset }
  };
}

function mapLogicalPosition(position2, edit3) {
  if (position2.revision !== edit3.fromRevision) {
    throw new BugIndicatingError(`Cannot map layout revision ${position2.revision} through revision ${edit3.fromRevision}`);
  }
  let mappedOffset = position2.offset;
  for (const sizeEdit of edit3.edits) {
    if (position2.offset < sizeEdit.oldRange.start) {
      break;
    }
    if (sizeEdit.oldRange.contains(position2.offset)) {
      const relativeOffset = position2.offset - sizeEdit.oldRange.start;
      mappedOffset = relativeOffset < sizeEdit.newRange.length ? sizeEdit.newRange.start + relativeOffset : sizeEdit.newRange.start;
      return { revision: edit3.toRevision, offset: mappedOffset };
    }
    mappedOffset = position2.offset + sizeEdit.newRange.endExclusive - sizeEdit.oldRange.endExclusive;
  }
  return { revision: edit3.toRevision, offset: mappedOffset };
}

function computeCompressedVirtualizedScrollHeight(itemHeights, itemGap) {
  assertNonNegative("itemGap", itemGap);
  for (let i2 = 0; i2 < itemHeights.length; i2++) {
    assertNonNegative(`itemHeights[${i2}]`, itemHeights[i2]);
  }
  if (itemHeights.length === 0) {
    return 0;
  }
  return itemHeights.reduce((result, height) => result + height, 0) + itemGap * (itemHeights.length - 1);
}

function assertNonNegative(name, value2) {
  if (!Number.isFinite(value2) || value2 < 0) {
    throw new BugIndicatingError(`${name} must be a finite non-negative number, got ${value2}`);
  }
}
export { asLayoutRevision, computeCompressedVirtualizedScrollLayout, computeItemRanges, createAnchoredSizeEditBatch, mapLogicalPosition, computeCompressedVirtualizedScrollHeight, assertNonNegative };
