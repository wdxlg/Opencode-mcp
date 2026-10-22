// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/remote/node/nodeSocketFactory.ts
import { makeRawSocketHeaders } from "./module-0502.mjs";
import { NodeSocket } from "./module-0039.mjs";


// src/vs/platform/remote/node/nodeSocketFactory.ts
import * as net5 from "net";

var nodeSocketFactory = new class {
  supports(connectTo) {
    return true;
  }
  connect({ host, port }, path, query, debugLabel) {
    return new Promise((resolve2, reject) => {
      const socket = net5.createConnection({ host, port }, () => {
        socket.removeListener("error", reject);
        socket.write(makeRawSocketHeaders(path, query, debugLabel));
        const onData = (data) => {
          const strData = data.toString();
          if (strData.indexOf("\r\n\r\n") >= 0) {
            socket.off("data", onData);
            resolve2(new NodeSocket(socket, debugLabel));
          }
        };
        socket.on("data", onData);
      });
      socket.setNoDelay(true);
      socket.once("error", reject);
    });
  }
}();
export { net5, nodeSocketFactory };
