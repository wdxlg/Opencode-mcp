// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: node_modules/isexe/windows.js
import { __commonJS, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";


// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports2, module2) {
    init_define_OPENCODE_BUILD_INFO();
    module2.exports = isexe;
    isexe.sync = sync;
    var fs4 = require("fs");
    function checkPathExt(path36, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path36.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat9, path36, options) {
      if (!stat9.isSymbolicLink() && !stat9.isFile()) {
        return false;
      }
      return checkPathExt(path36, options);
    }
    function isexe(path36, options, cb) {
      fs4.stat(path36, function(er, stat9) {
        cb(er, er ? false : checkStat(stat9, path36, options));
      });
    }
    function sync(path36, options) {
      return checkStat(fs4.statSync(path36), path36, options);
    }
  }
});
export { require_windows };
