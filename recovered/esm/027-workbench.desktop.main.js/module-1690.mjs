// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/parts/request/common/request.ts



// src/vs/base/parts/request/common/request.ts
var offlineName = "Offline";

function isOfflineError(error) {
  if (error instanceof OfflineError) {
    return true;
  }
  return error instanceof Error && error.name === offlineName && error.message === offlineName;
}

var OfflineError = class extends Error {
  constructor() {
    super(offlineName);
    this.name = this.message;
  }
};
export { isOfflineError, offlineName, OfflineError };
