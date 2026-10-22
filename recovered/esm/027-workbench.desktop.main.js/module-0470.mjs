// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/layout.ts
import { Range3 } from "./module-0455.mjs";


// src/vs/base/common/layout.ts
function layout(viewportSize, viewSize, anchor) {
  const layoutAfterAnchorBoundary = anchor.mode === 1 /* ALIGN */ ? anchor.offset : anchor.offset + anchor.size;
  const layoutBeforeAnchorBoundary = anchor.mode === 1 /* ALIGN */ ? anchor.offset + anchor.size : anchor.offset;
  if (anchor.position === 0 /* Before */) {
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
      return { position: layoutAfterAnchorBoundary, result: "ok" };
    }
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return { position: layoutBeforeAnchorBoundary - viewSize, result: "flipped" };
    }
    return { position: Math.max(viewportSize - viewSize, 0), result: "overlap" };
  } else {
    if (viewSize <= layoutBeforeAnchorBoundary) {
      return { position: layoutBeforeAnchorBoundary - viewSize, result: "ok" };
    }
    if (viewSize <= viewportSize - layoutAfterAnchorBoundary && layoutBeforeAnchorBoundary < viewSize / 2) {
      return { position: layoutAfterAnchorBoundary, result: "flipped" };
    }
    return { position: 0, result: "overlap" };
  }
}

function layout2d(viewport, view, anchor, options3) {
  let anchorAlignment = options3?.anchorAlignment ?? 0 /* LEFT */;
  let anchorPosition = options3?.anchorPosition ?? 0 /* BELOW */;
  const anchorAxisAlignment = options3?.anchorAxisAlignment ?? 0 /* VERTICAL */;
  let top2;
  let left;
  if (anchorAxisAlignment === 0 /* VERTICAL */) {
    const verticalAnchor = { offset: anchor.top - viewport.top, size: anchor.height, position: anchorPosition === 0 /* BELOW */ ? 0 /* Before */ : 1 /* After */ };
    const horizontalAnchor = { offset: anchor.left, size: anchor.width, position: anchorAlignment === 0 /* LEFT */ ? 0 /* Before */ : 1 /* After */, mode: 1 /* ALIGN */ };
    const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
    top2 = verticalLayoutResult.position + viewport.top;
    if (verticalLayoutResult.result === "flipped") {
      anchorPosition = anchorPosition === 0 /* BELOW */ ? 1 /* ABOVE */ : 0 /* BELOW */;
    }
    if (Range3.intersects({ start: top2, end: top2 + view.height }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
      horizontalAnchor.mode = 0 /* AVOID */;
    }
    const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
    left = horizontalLayoutResult.position;
    if (horizontalLayoutResult.result === "flipped") {
      anchorAlignment = anchorAlignment === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */;
    }
  } else {
    const horizontalAnchor = { offset: anchor.left, size: anchor.width, position: anchorAlignment === 0 /* LEFT */ ? 0 /* Before */ : 1 /* After */ };
    const verticalAnchor = { offset: anchor.top, size: anchor.height, position: anchorPosition === 0 /* BELOW */ ? 0 /* Before */ : 1 /* After */, mode: 1 /* ALIGN */ };
    const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
    left = horizontalLayoutResult.position;
    if (horizontalLayoutResult.result === "flipped") {
      anchorAlignment = anchorAlignment === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */;
    }
    if (Range3.intersects({ start: left, end: left + view.width }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
      verticalAnchor.mode = 0 /* AVOID */;
    }
    const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
    top2 = verticalLayoutResult.position + viewport.top;
    if (verticalLayoutResult.result === "flipped") {
      anchorPosition = anchorPosition === 0 /* BELOW */ ? 1 /* ABOVE */ : 0 /* BELOW */;
    }
  }
  const right = viewport.width - (left + view.width);
  const bottom = viewport.height - (top2 + view.height);
  return { top: top2, left, bottom, right, anchorAlignment, anchorPosition };
}
export { layout, layout2d };
