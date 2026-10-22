// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/copySelection.ts
import { DisposableStore } from "./module-0012.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/copySelection.ts
function enableCopySelection(options3) {
  const { domNode, renderLinesResult, diffEntry, originalModel, clipboardService } = options3;
  const viewZoneDisposable = new DisposableStore();
  viewZoneDisposable.add(addDisposableListener(domNode, "copy", (e) => {
    e.preventDefault();
    const selection = domNode.ownerDocument.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const domRange = selection.getRangeAt(0);
    if (!domRange || domRange.collapsed) {
      return;
    }
    const startElement = domRange.startContainer.nodeType === Node.TEXT_NODE ? domRange.startContainer.parentElement : domRange.startContainer;
    const endElement = domRange.endContainer.nodeType === Node.TEXT_NODE ? domRange.endContainer.parentElement : domRange.endContainer;
    if (!startElement || !endElement) {
      return;
    }
    const startPosition = renderLinesResult.getModelPositionAt(startElement, domRange.startOffset);
    const endPosition = renderLinesResult.getModelPositionAt(endElement, domRange.endOffset);
    if (!startPosition || !endPosition) {
      return;
    }
    const adjustedStart = startPosition.delta(diffEntry.original.startLineNumber - 1);
    const adjustedEnd = endPosition.delta(diffEntry.original.startLineNumber - 1);
    const range2 = adjustedEnd.isBefore(adjustedStart) ? Range2.fromPositions(adjustedEnd, adjustedStart) : Range2.fromPositions(adjustedStart, adjustedEnd);
    const selectedText = originalModel.getValueInRange(range2);
    clipboardService.writeText(selectedText);
  }));
  return viewZoneDisposable;
}
export { enableCopySelection };
