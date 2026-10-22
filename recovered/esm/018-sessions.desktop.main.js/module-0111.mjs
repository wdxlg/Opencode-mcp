// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/misc/indentation.ts
import { CursorColumns } from "./module-0110.mjs";
import { firstNonWhitespaceIndex } from "./module-0030.mjs";


// src/vs/editor/common/core/misc/indentation.ts
function _normalizeIndentationFromWhitespace(str, indentSize, insertSpaces) {
  let spacesCnt = 0;
  for (let i2 = 0; i2 < str.length; i2++) {
    if (str.charAt(i2) === "	") {
      spacesCnt = CursorColumns.nextIndentTabStop(spacesCnt, indentSize);
    } else {
      spacesCnt++;
    }
  }
  let result = "";
  if (!insertSpaces) {
    const tabsCnt = Math.floor(spacesCnt / indentSize);
    spacesCnt = spacesCnt % indentSize;
    for (let i2 = 0; i2 < tabsCnt; i2++) {
      result += "	";
    }
  }
  for (let i2 = 0; i2 < spacesCnt; i2++) {
    result += " ";
  }
  return result;
}

function normalizeIndentation(str, indentSize, insertSpaces) {
  let firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(str);
  if (firstNonWhitespaceIndex2 === -1) {
    firstNonWhitespaceIndex2 = str.length;
  }
  return _normalizeIndentationFromWhitespace(str.substring(0, firstNonWhitespaceIndex2), indentSize, insertSpaces) + str.substring(firstNonWhitespaceIndex2);
}
export { _normalizeIndentationFromWhitespace, normalizeIndentation };
