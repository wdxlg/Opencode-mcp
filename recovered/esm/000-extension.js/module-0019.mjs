// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/cross-spawn/lib/util/readShebang.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { require_shebang_command } from "./module-0018.mjs";


// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
    "use strict";
    init_define_OPENCODE_BUILD_INFO();
    var fs4 = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs4.openSync(command, "r");
        fs4.readSync(fd, buffer, 0, size, 0);
        fs4.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});
export { require_readShebang };
