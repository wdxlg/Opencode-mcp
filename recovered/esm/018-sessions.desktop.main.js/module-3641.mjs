// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/contributions/mobileMultiDiffVirtualizer.ts



// src/vs/sessions/browser/parts/mobile/contributions/mobileMultiDiffVirtualizer.ts
function computeMobileMultiDiffItemHeight(item, metrics) {
  if (item.collapsed) {
    return metrics.fileHeaderHeight;
  }
  if (item.state !== "loaded") {
    if (item.state === "unloaded" || item.state === "loading") {
      const estimatedHeight = computeDiffBodyHeight(item.estimatedHunkCount, item.estimatedRowCount, metrics);
      if (estimatedHeight !== void 0) {
        return metrics.fileHeaderHeight + estimatedHeight;
      }
    }
    return metrics.fileHeaderHeight + metrics.placeholderHeight;
  }
  const bodyHeight = computeDiffBodyHeight(item.hunkCount, item.rowCount, metrics);
  if (bodyHeight === void 0) {
    return metrics.fileHeaderHeight + metrics.placeholderHeight;
  }
  return metrics.fileHeaderHeight + bodyHeight;
}

function computeDiffBodyHeight(hunkCount, rowCount, metrics) {
  const normalizedHunkCount = Math.max(0, hunkCount ?? 0);
  const normalizedRowCount = Math.max(0, rowCount ?? 0);
  if (normalizedHunkCount === 0 && normalizedRowCount === 0) {
    return void 0;
  }
  return metrics.bodyVerticalPadding + normalizedHunkCount * metrics.hunkHeaderHeight + normalizedRowCount * metrics.rowHeight;
}

function computeMobileMultiDiffVirtualLayout(items, options3) {
  const viewportHeight = Math.max(0, options3.viewportHeight);
  const scrollTop = Math.max(0, options3.scrollTop);
  const overscan = Math.max(0, options3.overscan ?? 0);
  const visibleStart = Math.max(0, scrollTop - overscan);
  const visibleEnd = scrollTop + viewportHeight + overscan;
  let totalHeight = 0;
  const visibleItems = [];
  for (let index2 = 0; index2 < items.length; index2++) {
    const virtualTop = totalHeight;
    const virtualHeight = computeMobileMultiDiffItemHeight(items[index2], options3.metrics);
    const virtualBottom = virtualTop + virtualHeight;
    totalHeight = virtualBottom;
    if (virtualHeight <= 0 || virtualTop >= visibleEnd || virtualBottom <= visibleStart) {
      continue;
    }
    const innerOffset = clamp3(scrollTop - virtualTop, 0, virtualHeight);
    visibleItems.push({
      index: index2,
      virtualTop,
      virtualHeight,
      renderTop: virtualTop,
      renderHeight: virtualHeight,
      innerOffset
    });
  }
  return {
    totalHeight,
    items: visibleItems
  };
}

function clamp3(value2, min, max) {
  return Math.min(Math.max(value2, min), max);
}
export { computeMobileMultiDiffItemHeight, computeDiffBodyHeight, computeMobileMultiDiffVirtualLayout, clamp3 };
