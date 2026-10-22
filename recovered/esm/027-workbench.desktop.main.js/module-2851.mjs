// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/common/cellSearchModel.ts
import { Disposable } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";
import { PieceTreeTextBufferBuilder } from "./module-0398.mjs";
import { SearchParams } from "./module-0171.mjs";


// src/vs/workbench/contrib/search/common/cellSearchModel.ts
var CellSearchModel = class extends Disposable {
  constructor(_source, _inputTextBuffer, _outputs) {
    super();
    this._source = _source;
    this._inputTextBuffer = _inputTextBuffer;
    this._outputs = _outputs;
    this._outputTextBuffers = void 0;
  }
  _getFullModelRange(buffer) {
    const lineCount = buffer.getLineCount();
    return new Range2(1, 1, lineCount, this._getLineMaxColumn(buffer, lineCount));
  }
  _getLineMaxColumn(buffer, lineNumber) {
    if (lineNumber < 1 || lineNumber > buffer.getLineCount()) {
      throw new Error("Illegal value for lineNumber");
    }
    return buffer.getLineLength(lineNumber) + 1;
  }
  get inputTextBuffer() {
    if (!this._inputTextBuffer) {
      const builder = new PieceTreeTextBufferBuilder();
      builder.acceptChunk(this._source);
      const bufferFactory = builder.finish(true);
      const { textBuffer, disposable } = bufferFactory.create(1 /* LF */);
      this._inputTextBuffer = textBuffer;
      this._register(disposable);
    }
    return this._inputTextBuffer;
  }
  get outputTextBuffers() {
    if (!this._outputTextBuffers) {
      this._outputTextBuffers = this._outputs.map((output) => {
        const builder = new PieceTreeTextBufferBuilder();
        builder.acceptChunk(output);
        const bufferFactory = builder.finish(true);
        const { textBuffer, disposable } = bufferFactory.create(1 /* LF */);
        this._register(disposable);
        return textBuffer;
      });
    }
    return this._outputTextBuffers;
  }
  findInInputs(target) {
    const searchParams = new SearchParams(target, false, false, null);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return [];
    }
    const fullInputRange = this._getFullModelRange(this.inputTextBuffer);
    return this.inputTextBuffer.findMatchesLineByLine(fullInputRange, searchData, true, 5e3);
  }
  findInOutputs(target) {
    const searchParams = new SearchParams(target, false, false, null);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return [];
    }
    return this.outputTextBuffers.map((buffer) => {
      const matches2 = buffer.findMatchesLineByLine(
        this._getFullModelRange(buffer),
        searchData,
        true,
        5e3
      );
      if (matches2.length === 0) {
        return void 0;
      }
      return {
        textBuffer: buffer,
        matches: matches2
      };
    }).filter((item) => !!item);
  }
};
export { CellSearchModel };
