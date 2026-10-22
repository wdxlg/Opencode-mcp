// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/config/charWidthReader.ts
import { applyFontInfo } from "./module-0213.mjs";


// src/vs/editor/browser/config/charWidthReader.ts
var CharWidthRequest = class {
  constructor(chr, type) {
    this.chr = chr;
    this.type = type;
    this.width = 0;
  }
  fulfill(width2) {
    this.width = width2;
  }
};

var DomCharWidthReader = class _DomCharWidthReader {
  constructor(bareFontInfo, requests) {
    this._bareFontInfo = bareFontInfo;
    this._requests = requests;
    this._container = null;
    this._testElements = null;
  }
  read(targetWindow) {
    this._createDomElements();
    targetWindow.document.body.appendChild(this._container);
    this._readFromDomElements();
    this._container?.remove();
    this._container = null;
    this._testElements = null;
  }
  _createDomElements() {
    const container3 = document.createElement("div");
    container3.style.position = "absolute";
    container3.style.top = "-50000px";
    container3.style.width = "50000px";
    const regularDomNode = document.createElement("div");
    applyFontInfo(regularDomNode, this._bareFontInfo);
    container3.appendChild(regularDomNode);
    const boldDomNode = document.createElement("div");
    applyFontInfo(boldDomNode, this._bareFontInfo);
    boldDomNode.style.fontWeight = "bold";
    container3.appendChild(boldDomNode);
    const italicDomNode = document.createElement("div");
    applyFontInfo(italicDomNode, this._bareFontInfo);
    italicDomNode.style.fontStyle = "italic";
    container3.appendChild(italicDomNode);
    const testElements = [];
    for (const request2 of this._requests) {
      let parent;
      if (request2.type === 0 /* Regular */) {
        parent = regularDomNode;
      }
      if (request2.type === 2 /* Bold */) {
        parent = boldDomNode;
      }
      if (request2.type === 1 /* Italic */) {
        parent = italicDomNode;
      }
      parent.appendChild(document.createElement("br"));
      const testElement = document.createElement("span");
      _DomCharWidthReader._render(testElement, request2);
      parent.appendChild(testElement);
      testElements.push(testElement);
    }
    this._container = container3;
    this._testElements = testElements;
  }
  static _render(testElement, request2) {
    if (request2.chr === " ") {
      let htmlString = "\xA0";
      for (let i2 = 0; i2 < 8; i2++) {
        htmlString += htmlString;
      }
      testElement.innerText = htmlString;
    } else {
      let testString = request2.chr;
      for (let i2 = 0; i2 < 8; i2++) {
        testString += testString;
      }
      testElement.textContent = testString;
    }
  }
  _readFromDomElements() {
    for (let i2 = 0, len = this._requests.length; i2 < len; i2++) {
      const request2 = this._requests[i2];
      const testElement = this._testElements[i2];
      request2.fulfill(testElement.offsetWidth / 256);
    }
  }
};

function readCharWidths(targetWindow, bareFontInfo, requests) {
  const reader = new DomCharWidthReader(bareFontInfo, requests);
  reader.read(targetWindow);
}
export { readCharWidths, CharWidthRequest, DomCharWidthReader };
