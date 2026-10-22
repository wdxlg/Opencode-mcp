// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/core/misc/eolCounter.ts



// src/vs/editor/common/core/misc/eolCounter.ts
function countEOL(text) {
  let eolCount = 0;
  let firstLineLength = 0;
  let lastLineStart = 0;
  let eol = 0 /* Unknown */;
  for (let i = 0, len = text.length; i < len; i++) {
    const chr = text.charCodeAt(i);
    if (chr === 13 /* CarriageReturn */) {
      if (eolCount === 0) {
        firstLineLength = i;
      }
      eolCount++;
      if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* LineFeed */) {
        eol |= 2 /* CRLF */;
        i++;
      } else {
        eol |= 3 /* Invalid */;
      }
      lastLineStart = i + 1;
    } else if (chr === 10 /* LineFeed */) {
      eol |= 1 /* LF */;
      if (eolCount === 0) {
        firstLineLength = i;
      }
      eolCount++;
      lastLineStart = i + 1;
    }
  }
  if (eolCount === 0) {
    firstLineLength = text.length;
  }
  return [eolCount, firstLineLength, text.length - lastLineStart, eol];
}
export { countEOL };
