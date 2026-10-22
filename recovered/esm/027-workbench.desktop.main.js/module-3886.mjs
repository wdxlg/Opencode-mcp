// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/profiling/common/profiling.ts
import { createDecorator } from "./module-0077.mjs";
import { basename, isAbsolute, join } from "./module-0026.mjs";


// src/vs/platform/profiling/common/profiling.ts
var IV8InspectProfilingService = createDecorator("IV8InspectProfilingService");

var Utils;

((Utils2) => {
  function isValidProfile(profile) {
    return Boolean(profile.samples && profile.timeDeltas);
  }
  Utils2.isValidProfile = isValidProfile;
  function rewriteAbsolutePaths(profile, replace = "noAbsolutePaths") {
    for (const node of profile.nodes) {
      if (node.callFrame && node.callFrame.url) {
        if (isAbsolute(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
          node.callFrame.url = join(replace, basename(node.callFrame.url));
        }
      }
    }
    return profile;
  }
  Utils2.rewriteAbsolutePaths = rewriteAbsolutePaths;
})(Utils || (Utils = {}));
export { IV8InspectProfilingService, Utils };
