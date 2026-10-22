// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionProtocol.ts
import { __esm } from "./module-0000.mjs";
import { init_commands9 } from "./module-0314.mjs";
import { init_state10 } from "./module-0301.mjs";
import { init_errors3 } from "./module-0325.mjs";


// src/vs/platform/agentHost/common/state/sessionProtocol.ts
var ProtocolError;

var init_sessionProtocol = __esm({
  "src/vs/platform/agentHost/common/state/sessionProtocol.ts"() {
    init_commands9();
    init_state10();
    init_errors3();
    ProtocolError = class extends Error {
      constructor(code2, message, data) {
        super(message);
        this.code = code2;
        this.data = data;
      }
    };
  }
});
export { ProtocolError, init_sessionProtocol };
