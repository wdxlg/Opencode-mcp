// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModelStringEdit.ts
import { Range2 } from "./module-0106.mjs";
import { EditOperation } from "./module-0162.mjs";
import { StringEdit, StringReplacement } from "./module-0193.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { LengthEdit } from "./module-0403.mjs";
import { countEOL } from "./module-0375.mjs";


// src/vs/editor/common/model/textModelStringEdit.ts
function offsetEditToEditOperations(offsetEdit, doc) {
  const edits = [];
  for (const singleEdit of offsetEdit.replacements) {
    const range2 = Range2.fromPositions(
      doc.getPositionAt(singleEdit.replaceRange.start),
      doc.getPositionAt(singleEdit.replaceRange.start + singleEdit.replaceRange.length)
    );
    edits.push(EditOperation.replace(range2, singleEdit.newText));
  }
  return edits;
}

function offsetEditFromContentChanges(contentChanges) {
  const editsArr = contentChanges.map((c) => new StringReplacement(OffsetRange.ofStartAndLength(c.rangeOffset, c.rangeLength), c.text));
  editsArr.reverse();
  const edits = new StringEdit(editsArr);
  return edits;
}

function offsetEditFromLineRangeMapping(original, modified, changes) {
  const edits = [];
  for (const c of changes) {
    for (const i2 of c.innerChanges ?? []) {
      const newText = modified.getValueInRange(i2.modifiedRange);
      const startOrig = original.getOffsetAt(i2.originalRange.getStartPosition());
      const endExOrig = original.getOffsetAt(i2.originalRange.getEndPosition());
      const origRange = new OffsetRange(startOrig, endExOrig);
      edits.push(new StringReplacement(origRange, newText));
    }
  }
  return new StringEdit(edits);
}

function linesLengthEditFromModelContentChange(c) {
  const contentChanges = c.slice().reverse();
  const lengthEdits = contentChanges.map(
    (c2) => LengthEdit.replace(
      // Expand the edit range to include the entire line
      new OffsetRange(c2.range.startLineNumber - 1, c2.range.endLineNumber),
      countEOL(c2.text)[0] + 1
    )
  );
  const lengthEdit = LengthEdit.compose(lengthEdits);
  return lengthEdit;
}
export { offsetEditToEditOperations, offsetEditFromContentChanges, offsetEditFromLineRangeMapping, linesLengthEditFromModelContentChange };
