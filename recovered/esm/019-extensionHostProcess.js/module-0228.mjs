// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTestingPrivateApi.ts
import { InvalidTestItemError } from "./module-0227.mjs";


// src/vs/workbench/api/common/extHostTestingPrivateApi.ts
var eventPrivateApis = /* @__PURE__ */ new WeakMap();

var createPrivateApiFor = (impl, controllerId) => {
  const api = { controllerId };
  eventPrivateApis.set(impl, api);
  return api;
};

var getPrivateApiFor = (impl) => {
  const api = eventPrivateApis.get(impl);
  if (!api) {
    throw new InvalidTestItemError(impl?.id || "<unknown>");
  }
  return api;
};
export { eventPrivateApis, createPrivateApiFor, getPrivateApiFor };
