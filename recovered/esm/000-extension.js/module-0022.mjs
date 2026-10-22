// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/cross-spawn/index.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { require_parse } from "./module-0020.mjs";
import { require_enoent } from "./module-0021.mjs";


// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports2, module2) {
    "use strict";
    init_define_OPENCODE_BUILD_INFO();
    var cp2 = require("child_process");
    var parse3 = require_parse();
    var enoent = require_enoent();
    function spawn9(command, args, options) {
      const parsed = parse3(command, args, options);
      const spawned = cp2.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options) {
      const parsed = parse3(command, args, options);
      const result = cp2.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn9;
    module2.exports.spawn = spawn9;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse3;
    module2.exports._enoent = enoent;
  }
});
export { require_cross_spawn };
