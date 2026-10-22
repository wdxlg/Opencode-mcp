// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/towersLayout.ts



// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/towersLayout.ts
function getMaxTowerHeightInAvailableArea(towerHorizontalRange, availableTowerAreas) {
  const towerLeftOffset = towerHorizontalRange.start;
  const towerRightOffset = towerHorizontalRange.endExclusive;
  let minHeight = Number.MAX_VALUE;
  let currentLeftOffset = 0;
  for (const availableArea of availableTowerAreas) {
    const currentRightOffset = currentLeftOffset + availableArea.width;
    const overlapLeft = Math.max(towerLeftOffset, currentLeftOffset);
    const overlapRight = Math.min(towerRightOffset, currentRightOffset);
    if (overlapLeft < overlapRight) {
      minHeight = Math.min(minHeight, availableArea.height);
    }
    currentLeftOffset = currentRightOffset;
  }
  if (towerRightOffset > currentLeftOffset) {
    return 0;
  }
  return minHeight === Number.MAX_VALUE ? 0 : minHeight;
}
export { getMaxTowerHeightInAvailableArea };
