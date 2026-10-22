// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatImageExtraction.ts



// src/vs/workbench/contrib/chat/common/chatImageExtraction.ts
function coerceImageBuffer(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const record = value;
  const keys = Object.keys(record).sort((a, b) => Number(a) - Number(b));
  if (keys.length === 0) {
    return void 0;
  }
  const result = new Uint8Array(keys.length);
  for (let index = 0; index < keys.length; index++) {
    const byte = record[keys[index]];
    if (keys[index] !== String(index) || typeof byte !== "number" || !Number.isInteger(byte) || byte < 0 || byte > 255) {
      return void 0;
    }
    result[index] = byte;
  }
  return result;
}
export { coerceImageBuffer };
