// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/uint.ts



// src/vs/base/common/uint.ts
function toUint8(v) {
  if (v < 0) {
    return 0;
  }
  if (v > 255 /* MAX_UINT_8 */) {
    return 255 /* MAX_UINT_8 */;
  }
  return v | 0;
}

function toUint32(v) {
  if (v < 0) {
    return 0;
  }
  if (v > 4294967295 /* MAX_UINT_32 */) {
    return 4294967295 /* MAX_UINT_32 */;
  }
  return v | 0;
}
export { toUint8, toUint32 };
