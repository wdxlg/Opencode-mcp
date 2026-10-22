// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/base/parts/ipc/node/ipc.cp.ts
import { ChannelServer } from "./module-0031.mjs";
import { Event } from "./module-0021.mjs";
import { VSBuffer } from "./module-0012.mjs";


// src/vs/base/parts/ipc/node/ipc.cp.ts
import { fork } from "child_process";


// src/vs/base/parts/ipc/node/ipc.cp.ts
var Server = class extends ChannelServer {
  constructor(ctx) {
    super({
      send: (r) => {
        try {
          process.send?.(r.buffer.toString("base64"));
        } catch (e) {
        }
      },
      onMessage: Event.fromNodeEventEmitter(process, "message", (msg) => VSBuffer.wrap(Buffer.from(msg, "base64")))
    }, ctx);
    process.once("disconnect", () => this.dispose());
  }
};
export { fork, Server };
