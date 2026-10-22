// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/files/node/watcher/watcherMain.js
// Original module marker: src/vs/platform/files/node/watcher/watcherMain.ts
import { isUtilityProcess } from "./module-0036.mjs";
import { Server2 } from "./module-0037.mjs";
import { Server } from "./module-0032.mjs";
import { UniversalWatcher } from "./module-0050.mjs";
import { ProxyChannel } from "./module-0031.mjs";
import { DisposableStore } from "./module-0010.mjs";


// src/vs/platform/files/node/watcher/watcherMain.ts
var server;

if (isUtilityProcess(process)) {
  server = new Server2();
} else {
  server = new Server("watcher");
}

var service = new UniversalWatcher();

server.registerChannel("watcher", ProxyChannel.fromService(service, new DisposableStore()));
export { server, service };
