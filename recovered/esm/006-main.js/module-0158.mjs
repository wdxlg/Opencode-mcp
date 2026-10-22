// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/cdp/types.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/browserView/common/cdp/types.ts
var CDPErrorCode, CDPError, CDPMethodNotFoundError, CDPInvalidParamsError, CDPServerError;

var init_types2 = __esm({
  "src/vs/platform/browserView/common/cdp/types.ts"() {
    CDPErrorCode = {
      /** Method not found */
      MethodNotFound: -32601,
      /** Invalid params */
      InvalidParams: -32602,
      /** Internal error */
      InternalError: -32603,
      /** Server error (generic) */
      ServerError: -32e3
    };
    CDPError = class extends Error {
      constructor(message, code2) {
        super(message);
        this.code = code2;
        this.name = "CDPError";
      }
    };
    CDPMethodNotFoundError = class extends CDPError {
      constructor(method) {
        super(`Method not found: ${method}`, CDPErrorCode.MethodNotFound);
        this.name = "CDPMethodNotFoundError";
      }
    };
    CDPInvalidParamsError = class extends CDPError {
      constructor(message) {
        super(message, CDPErrorCode.InvalidParams);
        this.name = "CDPInvalidParamsError";
      }
    };
    CDPServerError = class extends CDPError {
      constructor(message) {
        super(message, CDPErrorCode.ServerError);
        this.name = "CDPServerError";
      }
    };
  }
});
export { CDPErrorCode, CDPError, CDPMethodNotFoundError, CDPInvalidParamsError, CDPServerError, init_types2 };
