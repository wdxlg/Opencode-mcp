// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/build-info.ts
import { define_OPENCODE_BUILD_INFO_default, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { OPENCODE_BEHAVIOR_VERSION } from "./module-0134.mjs";


// src/build-info.ts
init_define_OPENCODE_BUILD_INFO();


// src/build-info.ts
function injectedBuildInfo() {
  if (typeof define_OPENCODE_BUILD_INFO_default === "undefined") return {};
  return define_OPENCODE_BUILD_INFO_default ?? {};
}

function asNonEmptyString(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}

function getBuildInfo() {
  const injected = injectedBuildInfo();
  return {
    version: asNonEmptyString(injected.version) ?? OPENCODE_BEHAVIOR_VERSION,
    gitSha: asNonEmptyString(injected.gitSha) ?? "unknown",
    builtAt: asNonEmptyString(injected.builtAt) ?? "unknown",
    release: injected.release === true
  };
}
export { injectedBuildInfo, asNonEmptyString, getBuildInfo };
