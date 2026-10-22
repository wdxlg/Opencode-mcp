// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/parts/ipc/electron-browser/ipc.mp.ts
import { generateUuid } from "./module-0190.mjs";
import { ipcMessagePort, ipcRenderer } from "./module-3821.mjs";
import { Event2 } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/base/parts/ipc/electron-browser/ipc.mp.ts
var MessagePortAcquisitionError = class extends Error {
  constructor(message, fatal) {
    super(message);
    this.fatal = fatal;
  }
};

function isMessageChannelErrorResponse(response) {
  return typeof response === "object" && response !== null && "nonce" in response && typeof response.nonce === "string";
}

async function acquirePort(requestChannel, responseChannel, nonce = generateUuid(), acquire = (channel, requestNonce) => ipcMessagePort.acquire(channel, requestNonce)) {
  acquire(responseChannel, nonce);
  if (typeof requestChannel === "string") {
    ipcRenderer.send(requestChannel, nonce);
  }
  const onMessageChannelResult = Event2.fromDOMEventEmitter(mainWindow, "message", (e4) => ({ response: e4.data, port: e4.ports[0], source: e4.source }));
  const result = await Event2.toPromise(Event2.once(Event2.filter(onMessageChannelResult, (e4) => {
    const responseNonce = typeof e4.response === "string" ? e4.response : isMessageChannelErrorResponse(e4.response) ? e4.response.nonce : void 0;
    return responseNonce === nonce && e4.source === mainWindow;
  })));
  if (isMessageChannelErrorResponse(result.response) && result.response.error) {
    throw new MessagePortAcquisitionError(result.response.error, result.response.fatal === true);
  }
  if (!result.port) {
    throw new Error(`MessagePort response '${responseChannel}' did not include a port.`);
  }
  return result.port;
}
export { isMessageChannelErrorResponse, acquirePort, MessagePortAcquisitionError };
