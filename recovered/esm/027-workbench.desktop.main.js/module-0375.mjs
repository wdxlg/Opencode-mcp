// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/misc/eolCounter.ts



// src/vs/editor/common/core/misc/eolCounter.ts
function countEOL(text2) {
  let eolCount = 0;
  let firstLineLength = 0;
  let lastLineStart = 0;
  let eol = 0 /* Unknown */;
  for (let i2 = 0, len = text2.length; i2 < len; i2++) {
    const chr = text2.charCodeAt(i2);
    if (chr === 13 /* CarriageReturn */) {
      if (eolCount === 0) {
        firstLineLength = i2;
      }
      eolCount++;
      if (i2 + 1 < len && text2.charCodeAt(i2 + 1) === 10 /* LineFeed */) {
        eol |= 2 /* CRLF */;
        i2++;
      } else {
        eol |= 3 /* Invalid */;
      }
      lastLineStart = i2 + 1;
    } else if (chr === 10 /* LineFeed */) {
      eol |= 1 /* LF */;
      if (eolCount === 0) {
        firstLineLength = i2;
      }
      eolCount++;
      lastLineStart = i2 + 1;
    }
  }
  if (eolCount === 0) {
    firstLineLength = text2.length;
  }
  return [eolCount, firstLineLength, text2.length - lastLineStart, eol];
}
export { countEOL };
