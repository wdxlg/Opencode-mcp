// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/electron-main/ipc.electron.ts
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { __esm } from "./module-0000.mjs";
import { init_lifecycle, toDisposable } from "./module-0018.mjs";
import { IPCServer, init_ipc } from "./module-0054.mjs";
import { Protocol2, init_ipc_electron } from "./module-0063.mjs";


// src/vs/base/parts/ipc/electron-main/ipc.electron.ts
function createScopedOnMessageEvent(senderId, eventName) {
  const onMessage = Event.fromNodeEventEmitter(validatedIpcMain, eventName, (event, message) => ({ event, message }));
  const onMessageFromSender = Event.filter(onMessage, ({ event }) => event.sender.id === senderId);
  return Event.map(onMessageFromSender, ({ message }) => message ? VSBuffer.wrap(message) : message);
}

var Server2;

var init_ipc_electron2 = __esm({
  "src/vs/base/parts/ipc/electron-main/ipc.electron.ts"() {
    init_ipcMain();
    init_buffer();
    init_event();
    init_lifecycle();
    init_ipc();
    init_ipc_electron();
    Server2 = class _Server extends IPCServer {
      static {
        this.Clients = /* @__PURE__ */ new Map();
      }
      static getOnDidClientConnect() {
        const onHello = Event.fromNodeEventEmitter(validatedIpcMain, "vscode:hello", ({ sender }) => sender);
        return Event.map(onHello, (webContents4) => {
          const id2 = webContents4.id;
          const client = _Server.Clients.get(id2);
          client?.dispose();
          const onDidClientReconnect = new Emitter();
          const reconnectDisposable = toDisposable(() => {
            onDidClientReconnect.fire();
          });
          _Server.Clients.set(id2, reconnectDisposable);
          const onMessage = createScopedOnMessageEvent(id2, "vscode:message");
          const onDidClientDisconnect = Event.any(Event.signal(createScopedOnMessageEvent(id2, "vscode:disconnect")), onDidClientReconnect.event);
          Event.once(onDidClientDisconnect)(() => {
            if (_Server.Clients.get(id2) === reconnectDisposable) {
              _Server.Clients.delete(id2);
            }
            onDidClientReconnect.dispose();
          });
          const protocol4 = new Protocol2(webContents4, onMessage);
          return { protocol: protocol4, onDidClientDisconnect };
        });
      }
      constructor() {
        super(_Server.getOnDidClientConnect());
      }
    };
  }
});
export { createScopedOnMessageEvent, Server2, init_ipc_electron2 };
