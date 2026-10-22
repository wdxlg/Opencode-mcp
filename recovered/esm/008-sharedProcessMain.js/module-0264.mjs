// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remote/node/nodeSocketFactory.ts
import { makeRawSocketHeaders } from "./module-0265.mjs";
import { NodeSocket } from "./module-0197.mjs";


// src/vs/platform/remote/node/nodeSocketFactory.ts
import * as net3 from "net";


// src/vs/platform/remote/node/nodeSocketFactory.ts
var nodeSocketFactory = new class {
  supports(connectTo) {
    return true;
  }
  connect({ host, port }, path, query, debugLabel) {
    return new Promise((resolve3, reject) => {
      const socket = net3.createConnection({ host, port }, () => {
        socket.removeListener("error", reject);
        socket.write(makeRawSocketHeaders(path, query, debugLabel));
        const onData = (data) => {
          const strData = data.toString();
          if (strData.indexOf("\r\n\r\n") >= 0) {
            socket.off("data", onData);
            resolve3(new NodeSocket(socket, debugLabel));
          }
        };
        socket.on("data", onData);
      });
      socket.setNoDelay(true);
      socket.once("error", reject);
    });
  }
}();
export { net3, nodeSocketFactory };
