// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/isexe/mode.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports2, module2) {
    init_define_OPENCODE_BUILD_INFO();
    module2.exports = isexe;
    isexe.sync = sync;
    var fs4 = require("fs");
    function isexe(path36, options, cb) {
      fs4.stat(path36, function(er, stat9) {
        cb(er, er ? false : checkStat(stat9, options));
      });
    }
    function sync(path36, options) {
      return checkStat(fs4.statSync(path36), options);
    }
    function checkStat(stat9, options) {
      return stat9.isFile() && checkMode(stat9, options);
    }
    function checkMode(stat9, options) {
      var mod = stat9.mode;
      var uid2 = stat9.uid;
      var gid = stat9.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid2 === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});
export { require_mode };
