// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/terminal/common/terminalDataBuffering.ts
import { isString } from "./module-0009.mjs";


// src/vs/platform/terminal/common/terminalDataBuffering.ts
var TerminalDataBufferer = class {
  constructor(_callback) {
    this._callback = _callback;
    this._terminalBufferMap = /* @__PURE__ */ new Map();
  }
  dispose() {
    for (const buffer of this._terminalBufferMap.values()) {
      buffer.dispose();
    }
  }
  startBuffering(id2, event, throttleBy = 5) {
    const disposable = event((e) => {
      const data2 = isString(e) ? e : e.data;
      let buffer = this._terminalBufferMap.get(id2);
      if (buffer) {
        buffer.data.push(data2);
        return;
      }
      const timeoutId = setTimeout(() => this.flushBuffer(id2), throttleBy);
      buffer = {
        data: [data2],
        timeoutId,
        dispose: () => {
          clearTimeout(timeoutId);
          this.flushBuffer(id2);
          disposable.dispose();
        }
      };
      this._terminalBufferMap.set(id2, buffer);
    });
    return disposable;
  }
  stopBuffering(id2) {
    const buffer = this._terminalBufferMap.get(id2);
    buffer?.dispose();
  }
  flushBuffer(id2) {
    const buffer = this._terminalBufferMap.get(id2);
    if (buffer) {
      this._terminalBufferMap.delete(id2);
      this._callback(id2, buffer.data.join(""));
    }
  }
};
export { TerminalDataBufferer };
