// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostConsoleForwarder.ts
import { AbstractExtHostConsoleForwarder } from "./module-0487.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";


// src/vs/workbench/api/node/extHostConsoleForwarder.ts
var MAX_STREAM_BUFFER_LENGTH = 1024 * 1024;

var ExtHostConsoleForwarder = class extends AbstractExtHostConsoleForwarder {
  constructor(extHostRpc, initData) {
    super(extHostRpc, initData);
    this._isMakingConsoleCall = false;
    this._wrapStream("stderr", "error");
    this._wrapStream("stdout", "log");
  }
  _nativeConsoleLogMessage(method, original, args2) {
    const stream = method === "error" || method === "warn" ? process.stderr : process.stdout;
    this._isMakingConsoleCall = true;
    stream.write(`
${"START_NATIVE_LOG" /* Start */}
`);
    original.apply(console, args2);
    stream.write(`
${"END_NATIVE_LOG" /* End */}
`);
    this._isMakingConsoleCall = false;
  }
  /**
   * Wraps process.stderr/stdout.write() so that it is transmitted to the
   * renderer or CLI. It both calls through to the original method as well
   * as to console.log with complete lines so that they're made available
   * to the debugger/CLI.
   */
  _wrapStream(streamName, severity) {
    const stream = process[streamName];
    const original = stream.write;
    let buf = "";
    Object.defineProperty(stream, "write", {
      set: () => {
      },
      get: () => (chunk, encoding, callback) => {
        if (!this._isMakingConsoleCall) {
          buf += chunk.toString(encoding);
          const eol = buf.length > MAX_STREAM_BUFFER_LENGTH ? buf.length : buf.lastIndexOf("\n");
          if (eol !== -1) {
            console[severity](buf.slice(0, eol));
            buf = buf.slice(eol + 1);
          }
        }
        original.call(stream, chunk, encoding, callback);
      }
    });
  }
};

ExtHostConsoleForwarder = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService)
], ExtHostConsoleForwarder);
export { MAX_STREAM_BUFFER_LENGTH, ExtHostConsoleForwarder };
