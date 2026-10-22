// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/output/common/outputLinkComputerMain.js
// Original module marker: src/vs/base/common/worker/webWorkerBootstrap.ts
import { WebWorkerServer } from "./module-0033.mjs";


// src/vs/base/common/worker/webWorkerBootstrap.ts
var initialized = false;

function initialize(factory) {
  if (initialized) {
    throw new Error("WebWorker already initialized!");
  }
  initialized = true;
  const webWorkerServer = new WebWorkerServer(
    (msg) => globalThis.postMessage(msg),
    (workerServer) => factory(workerServer)
  );
  globalThis.onmessage = (e) => {
    webWorkerServer.onmessage(e.data);
  };
  return webWorkerServer;
}

function bootstrapWebWorker(factory) {
  globalThis.onmessage = (_e) => {
    if (!initialized) {
      initialize(factory);
    }
  };
}
export { initialize, bootstrapWebWorker, initialized };
