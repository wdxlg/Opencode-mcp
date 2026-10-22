// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/agent-host.js
// Original module marker: node_modules/shebang-command/index.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { require_shebang_regex } from "./module-0008.mjs";


// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports2, module2) {
    "use strict";
    init_define_OPENCODE_BUILD_INFO();
    var shebangRegex = require_shebang_regex();
    module2.exports = (string4 = "") => {
      const match = string4.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path2, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path2.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});
export { require_shebang_command };
