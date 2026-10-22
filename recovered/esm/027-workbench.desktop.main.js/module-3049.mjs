// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/browser/testMessageColorizer.ts
import { GraphemeIterator, forAnsiStringParts, removeAnsiEscapeCodes } from "./module-0030.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/testing/browser/testMessageColorizer.ts
var colorAttrRe = /^\x1b\[([0-9]+)m$/;

var renderTestMessageAsText = (tm) => typeof tm === "string" ? removeAnsiEscapeCodes(tm) : renderAsPlaintext(tm);

var colorizeTestMessageInEditor = (message, editor) => {
  const decos = [];
  editor.changeDecorations((changeAccessor) => {
    let start = new Position(1, 1);
    let cls = [];
    for (const part of forAnsiStringParts(message)) {
      if (part.isCode) {
        const colorAttr = colorAttrRe.exec(part.str)?.[1];
        if (!colorAttr) {
          continue;
        }
        const n2 = Number(colorAttr);
        if (n2 === 0) {
          cls.length = 0;
        } else if (n2 === 22) {
          cls = cls.filter((c) => c !== "tstm-ansidec-1" /* Bold */ && c !== "tstm-ansidec-3" /* Italic */);
        } else if (n2 === 23) {
          cls = cls.filter((c) => c !== "tstm-ansidec-3" /* Italic */);
        } else if (n2 === 24) {
          cls = cls.filter((c) => c !== "tstm-ansidec-4" /* Underline */);
        } else if (n2 >= 30 && n2 <= 39 || n2 >= 90 && n2 <= 99) {
          cls = cls.filter((c) => !c.startsWith("tstm-ansidec-fg" /* ForegroundPrefix */));
          cls.push("tstm-ansidec-fg" /* ForegroundPrefix */ + colorAttr);
        } else if (n2 >= 40 && n2 <= 49 || n2 >= 100 && n2 <= 109) {
          cls = cls.filter((c) => !c.startsWith("tstm-ansidec-bg" /* BackgroundPrefix */));
          cls.push("tstm-ansidec-bg" /* BackgroundPrefix */ + colorAttr);
        } else {
          cls.push("tstm-ansidec-" /* Prefix */ + colorAttr);
        }
      } else {
        let line = start.lineNumber;
        let col = start.column;
        const graphemes = new GraphemeIterator(part.str);
        for (let i2 = 0; !graphemes.eol(); i2 += graphemes.nextGraphemeLength()) {
          if (part.str[i2] === "\n") {
            line++;
            col = 1;
          } else {
            col++;
          }
        }
        const end = new Position(line, col);
        if (cls.length) {
          decos.push(changeAccessor.addDecoration(Range2.fromPositions(start, end), {
            inlineClassName: cls.join(" "),
            description: "test-message-colorized"
          }));
        }
        start = end;
      }
    }
  });
  return toDisposable(() => editor.removeDecorations(decos));
};
export { colorAttrRe, renderTestMessageAsText, colorizeTestMessageInEditor };
