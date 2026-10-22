// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadErrors.ts
import { onUnexpectedError, transformErrorFromSerialization } from "./module-0004.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";


// src/vs/workbench/api/browser/mainThreadErrors.ts
var MainThreadErrors = class {
  dispose() {
  }
  $onUnexpectedError(err) {
    if (err?.$isError) {
      err = transformErrorFromSerialization(err);
    }
    onUnexpectedError(err);
  }
};

MainThreadErrors = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadErrors)
], MainThreadErrors);
export { MainThreadErrors };
