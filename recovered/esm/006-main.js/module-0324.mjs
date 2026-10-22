// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/common/errors.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/agentHost/common/state/protocol/common/errors.ts
var JsonRpcErrorCodes;

var init_errors2 = __esm({
  "src/vs/platform/agentHost/common/state/protocol/common/errors.ts"() {
    JsonRpcErrorCodes = {
      /** Invalid JSON */
      ParseError: -32700,
      /** Not a valid JSON-RPC request */
      InvalidRequest: -32600,
      /** Unknown method name */
      MethodNotFound: -32601,
      /** Invalid method parameters */
      InvalidParams: -32602,
      /** Unspecified server error */
      InternalError: -32603
    };
  }
});
export { JsonRpcErrorCodes, init_errors2 };
