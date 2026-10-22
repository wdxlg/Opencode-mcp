// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/platform/profiling/common/profiling.ts
import { __esm } from "./module-0000.mjs";
import { basename, init_path, isAbsolute, join3 } from "./module-0004.mjs";
import { createDecorator, init_instantiation } from "./module-0037.mjs";


// src/vs/platform/profiling/common/profiling.ts
var IV8InspectProfilingService, Utils;

var init_profiling2 = __esm({
  "src/vs/platform/profiling/common/profiling.ts"() {
    init_path();
    init_instantiation();
    IV8InspectProfilingService = createDecorator("IV8InspectProfilingService");
    ((Utils2) => {
      function isValidProfile(profile) {
        return Boolean(profile.samples && profile.timeDeltas);
      }
      Utils2.isValidProfile = isValidProfile;
      function rewriteAbsolutePaths(profile, replace = "noAbsolutePaths") {
        for (const node of profile.nodes) {
          if (node.callFrame && node.callFrame.url) {
            if (isAbsolute(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
              node.callFrame.url = join3(replace, basename(node.callFrame.url));
            }
          }
        }
        return profile;
      }
      Utils2.rewriteAbsolutePaths = rewriteAbsolutePaths;
    })(Utils || (Utils = {}));
  }
});
export { IV8InspectProfilingService, Utils, init_profiling2 };
