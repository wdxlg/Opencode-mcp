// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/node/ports.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/ports.ts
import * as net from "net";

function findFreePort(startPort, giveUpAfter, timeout2, stride = 1) {
  let done = false;
  return new Promise((resolve2) => {
    const timeoutHandle = setTimeout(() => {
      if (!done) {
        done = true;
        return resolve2(0);
      }
    }, timeout2);
    doFindFreePort(startPort, giveUpAfter, stride, (port) => {
      if (!done) {
        done = true;
        clearTimeout(timeoutHandle);
        return resolve2(port);
      }
    });
  });
}

function doFindFreePort(startPort, giveUpAfter, stride, clb) {
  if (giveUpAfter === 0) {
    return clb(0);
  }
  const client = new net.Socket();
  client.once("connect", () => {
    dispose2(client);
    return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
  });
  client.once("data", () => {
  });
  client.once("error", (err) => {
    dispose2(client);
    if (err.code !== "ECONNREFUSED") {
      return doFindFreePort(startPort + stride, giveUpAfter - 1, stride, clb);
    }
    return clb(startPort);
  });
  client.connect(startPort, "127.0.0.1");
}

function dispose2(socket) {
  try {
    socket.removeAllListeners("connect");
    socket.removeAllListeners("error");
    socket.end();
    socket.destroy();
    socket.unref();
  } catch (error) {
    console.error(error);
  }
}

var init_ports2 = __esm({
  "src/vs/base/node/ports.ts"() {
  }
});
export { findFreePort, doFindFreePort, dispose2, net, init_ports2 };
