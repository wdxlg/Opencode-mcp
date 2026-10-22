// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remote/common/managedSocket.ts
import { VSBuffer, encodeBase64 } from "./module-0031.mjs";


// src/vs/platform/remote/common/managedSocket.ts
var makeRawSocketHeaders = (path, query, deubgLabel) => {
  const buffer2 = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    buffer2[i] = Math.round(Math.random() * 256);
  }
  const nonce = encodeBase64(VSBuffer.wrap(buffer2));
  const headers = [
    `GET ws://localhost${path}?${query}&skipWebSocketFrames=true HTTP/1.1`,
    `Connection: Upgrade`,
    `Upgrade: websocket`,
    `Sec-WebSocket-Key: ${nonce}`
  ];
  return headers.join("\r\n") + "\r\n\r\n";
};

var socketRawEndHeaderSequence = VSBuffer.fromString("\r\n\r\n");
export { makeRawSocketHeaders, socketRawEndHeaderSequence };
