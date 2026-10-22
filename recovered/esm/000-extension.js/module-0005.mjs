// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/debug/src/index.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { require_browser } from "./module-0003.mjs";
import { require_node } from "./module-0004.mjs";


// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports2, module2) {
    init_define_OPENCODE_BUILD_INFO();
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});
export { require_src };
