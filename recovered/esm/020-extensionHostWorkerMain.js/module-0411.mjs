// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/core/stringBuilder.ts
import { readUInt16LE } from "./module-0013.mjs";


// src/vs/editor/common/core/stringBuilder.ts
var _utf16LE_TextDecoder;

function getUTF16LE_TextDecoder() {
  if (!_utf16LE_TextDecoder) {
    _utf16LE_TextDecoder = new TextDecoder("UTF-16LE");
  }
  return _utf16LE_TextDecoder;
}

function decodeUTF16LE(source, offset, len) {
  const view = new Uint16Array(source.buffer, offset, len);
  if (len > 0 && (view[0] === 65279 || view[0] === 65534)) {
    return compatDecodeUTF16LE(source, offset, len);
  }
  return getUTF16LE_TextDecoder().decode(view);
}

function compatDecodeUTF16LE(source, offset, len) {
  const result = [];
  let resultLen = 0;
  for (let i = 0; i < len; i++) {
    const charCode = readUInt16LE(source, offset);
    offset += 2;
    result[resultLen++] = String.fromCharCode(charCode);
  }
  return result.join("");
}
export { getUTF16LE_TextDecoder, decodeUTF16LE, compatDecodeUTF16LE, _utf16LE_TextDecoder };
