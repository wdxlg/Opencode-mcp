// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector.ts
import { convertLinkRangeToBuffer, getXtermLineContent3 } from "./module-3403.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalExternalLinkDetector.ts
var TerminalExternalLinkDetector = class {
  constructor(id2, xterm, _provideLinks) {
    this.id = id2;
    this.xterm = xterm;
    this._provideLinks = _provideLinks;
    this.maxLinkLength = 2e3;
  }
  async detect(lines, startLine, endLine) {
    const text2 = getXtermLineContent3(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text2 === "" || text2.length > this.maxLinkLength) {
      return [];
    }
    const externalLinks = await this._provideLinks(text2);
    if (!externalLinks) {
      return [];
    }
    const result = externalLinks.map((link2) => {
      const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
        startColumn: link2.startIndex + 1,
        startLineNumber: 1,
        endColumn: link2.startIndex + link2.length + 1,
        endLineNumber: 1
      }, startLine);
      const matchingText = text2.substring(link2.startIndex, link2.startIndex + link2.length) || "";
      const l = {
        text: matchingText,
        label: link2.label,
        bufferRange,
        type: { id: this.id },
        activate: link2.activate
      };
      return l;
    });
    return result;
  }
};
export { TerminalExternalLinkDetector };
