// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTestingPrivateApi.ts
import { InvalidTestItemError } from "./module-1210.mjs";


// src/vs/workbench/api/common/extHostTestingPrivateApi.ts
var eventPrivateApis = /* @__PURE__ */ new WeakMap();

var getPrivateApiFor = (impl) => {
  const api = eventPrivateApis.get(impl);
  if (!api) {
    throw new InvalidTestItemError(impl?.id || "<unknown>");
  }
  return api;
};
export { eventPrivateApis, getPrivateApiFor };
