// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/platform/localTranscription/node/localTranscriptionMain.ts
import { isUtilityProcess } from "./module-0031.mjs";
import { Server } from "./module-0032.mjs";
import { LocalTranscriptionService } from "./module-0040.mjs";
import { localTranscriptionChannelName } from "./module-0034.mjs";
import { ProxyChannel } from "./module-0030.mjs";
import { DisposableStore } from "./module-0010.mjs";


// src/vs/platform/localTranscription/node/localTranscriptionMain.ts
if (!isUtilityProcess(process)) {
  throw new Error("localTranscriptionMain must run in a utility process");
}

var server = new Server();

var service = new LocalTranscriptionService();

server.registerChannel(localTranscriptionChannelName, ProxyChannel.fromService(service, new DisposableStore()));
export { server, service };
