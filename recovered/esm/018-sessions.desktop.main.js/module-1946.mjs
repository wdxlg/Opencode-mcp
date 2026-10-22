// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/model/notebookMetadataTextModel.ts
import { toFormattedString } from "./module-1376.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotebookMetadataUri } from "./module-0911.mjs";
import { createTextBuffer } from "./module-0423.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/notebook/common/model/notebookMetadataTextModel.ts
function getFormattedNotebookMetadataJSON(transientMetadata, metadata) {
  let filteredMetadata = {};
  if (transientMetadata) {
    const keys = /* @__PURE__ */ new Set([...Object.keys(metadata)]);
    for (const key3 of keys) {
      if (!transientMetadata[key3]) {
        filteredMetadata[key3] = metadata[key3];
      }
    }
  } else {
    filteredMetadata = metadata;
  }
  const metadataSource = toFormattedString(filteredMetadata, {});
  return metadataSource;
}

var NotebookDocumentMetadataTextModel = class extends Disposable {
  constructor(notebookModel) {
    super();
    this.notebookModel = notebookModel;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._textBufferHash = null;
    this.uri = NotebookMetadataUri.generate(this.notebookModel.uri);
    this._register(this.notebookModel.onDidChangeContent((e4) => {
      if (e4.rawEvents.some((event) => event.kind === 11 /* ChangeDocumentMetadata */ || event.kind === 1 /* ModelChange */)) {
        this._textBuffer?.dispose();
        this._textBuffer = void 0;
        this._textBufferHash = null;
        this._onDidChange.fire();
      }
    }));
  }
  get metadata() {
    return this.notebookModel.metadata;
  }
  get textBuffer() {
    if (this._textBuffer) {
      return this._textBuffer;
    }
    const source = getFormattedNotebookMetadataJSON(this.notebookModel.transientOptions.transientDocumentMetadata, this.metadata);
    this._textBuffer = this._register(createTextBuffer(source, 1 /* LF */).textBuffer);
    this._register(this._textBuffer.onDidChangeContent(() => {
      this._onDidChange.fire();
    }));
    return this._textBuffer;
  }
  getHash() {
    if (this._textBufferHash !== null) {
      return this._textBufferHash;
    }
    const shaComputer = new StringSHA1();
    const snapshot = this.textBuffer.createSnapshot(false);
    let text2;
    while (text2 = snapshot.read()) {
      shaComputer.update(text2);
    }
    this._textBufferHash = shaComputer.digest();
    return this._textBufferHash;
  }
  getValue() {
    const fullRange = this.getFullModelRange();
    const eol = this.textBuffer.getEOL();
    if (eol === "\n") {
      return this.textBuffer.getValueInRange(fullRange, 1 /* LF */);
    } else {
      return this.textBuffer.getValueInRange(fullRange, 2 /* CRLF */);
    }
  }
  getFullModelRange() {
    const lineCount = this.textBuffer.getLineCount();
    return new Range2(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
  }
};
export { getFormattedNotebookMetadataJSON, NotebookDocumentMetadataTextModel };
