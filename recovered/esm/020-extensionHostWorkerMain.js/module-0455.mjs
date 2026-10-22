// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/worker/extensionHostWorkerMain.ts
import { create } from "./module-0454.mjs";


// src/vs/workbench/api/worker/extensionHostWorkerMain.ts
var data = create();

self.onmessage = (e) => data.onmessage(e.data);
export { data };
