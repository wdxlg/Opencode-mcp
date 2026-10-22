// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector.ts
import { Disposable } from "./module-0012.mjs";
import { convertLinkRangeToBuffer, getXtermLineContent3 } from "./module-3403.mjs";
import { matchesScheme } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { TERMINAL_CONFIG_SECTION } from "./module-1173.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalWordLinkDetector.ts
var TerminalWordLinkDetector = class extends Disposable {
  constructor(xterm, _configurationService, _productService) {
    super();
    this.xterm = xterm;
    this._configurationService = _configurationService;
    this._productService = _productService;
    // Word links typically search the workspace so it makes sense that their maximum link length is
    // quite small.
    this.maxLinkLength = 100;
    this._refreshSeparatorCodes();
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.wordSeparators" /* WordSeparators */)) {
        this._refreshSeparatorCodes();
      }
    }));
  }
  static {
    this.id = "word";
  }
  detect(lines, startLine, endLine) {
    const links = [];
    const text2 = getXtermLineContent3(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text2 === "" || text2.length > 2e3 /* MaxLineLength */) {
      return [];
    }
    const words = this._parseWords(text2);
    for (const word of words) {
      if (word.text === "") {
        continue;
      }
      if (word.text.length > 0 && word.text.charAt(word.text.length - 1) === ":") {
        word.text = word.text.slice(0, -1);
        word.endIndex--;
      }
      const bufferRange = convertLinkRangeToBuffer(
        lines,
        this.xterm.cols,
        {
          startColumn: word.startIndex + 1,
          startLineNumber: 1,
          endColumn: word.endIndex + 1,
          endLineNumber: 1
        },
        startLine
      );
      if (matchesScheme(word.text, this._productService.urlProtocol)) {
        const uri5 = URI.parse(word.text);
        if (uri5) {
          links.push({
            text: word.text,
            uri: uri5,
            bufferRange,
            type: "Url" /* Url */
          });
        }
        continue;
      }
      links.push({
        text: word.text,
        bufferRange,
        type: "Search" /* Search */,
        contextLine: text2
      });
    }
    return links;
  }
  _parseWords(text2) {
    const words = [];
    const splitWords = text2.split(this._separatorRegex);
    let runningIndex = 0;
    for (let i2 = 0; i2 < splitWords.length; i2++) {
      words.push({
        text: splitWords[i2],
        startIndex: runningIndex,
        endIndex: runningIndex + splitWords[i2].length
      });
      runningIndex += splitWords[i2].length + 1;
    }
    return words;
  }
  _refreshSeparatorCodes() {
    const separators = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).wordSeparators;
    let powerlineSymbols = "";
    for (let i2 = 57520; i2 <= 57535; i2++) {
      powerlineSymbols += String.fromCharCode(i2);
    }
    this._separatorRegex = new RegExp(`[${escapeRegExpCharacters(separators)}${powerlineSymbols}]`, "g");
  }
};

TerminalWordLinkDetector = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IProductService)
], TerminalWordLinkDetector);
export { TerminalWordLinkDetector };
