// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/semanticTokensDto.ts
import { isLittleEndian } from "./module-0014.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/editor/common/services/semanticTokensDto.ts
function reverseEndianness(arr) {
  for (let i2 = 0, len = arr.length; i2 < len; i2 += 4) {
    const b0 = arr[i2 + 0];
    const b1 = arr[i2 + 1];
    const b2 = arr[i2 + 2];
    const b3 = arr[i2 + 3];
    arr[i2 + 0] = b3;
    arr[i2 + 1] = b2;
    arr[i2 + 2] = b1;
    arr[i2 + 3] = b0;
  }
}

function toLittleEndianBuffer(arr) {
  const uint8Arr = new Uint8Array(arr.buffer, arr.byteOffset, arr.length * 4);
  if (!isLittleEndian()) {
    reverseEndianness(uint8Arr);
  }
  return VSBuffer.wrap(uint8Arr);
}

function fromLittleEndianBuffer(buff) {
  const uint8Arr = buff.buffer;
  if (!isLittleEndian()) {
    reverseEndianness(uint8Arr);
  }
  if (uint8Arr.byteOffset % 4 === 0) {
    return new Uint32Array(uint8Arr.buffer, uint8Arr.byteOffset, uint8Arr.length / 4);
  } else {
    const data = new Uint8Array(uint8Arr.byteLength);
    data.set(uint8Arr);
    return new Uint32Array(data.buffer, data.byteOffset, data.length / 4);
  }
}

function encodeSemanticTokensDto(semanticTokens) {
  const dest = new Uint32Array(encodeSemanticTokensDtoSize(semanticTokens));
  let offset = 0;
  dest[offset++] = semanticTokens.id;
  if (semanticTokens.type === "full") {
    dest[offset++] = 1 /* Full */;
    dest[offset++] = semanticTokens.data.length;
    dest.set(semanticTokens.data, offset);
    offset += semanticTokens.data.length;
  } else {
    dest[offset++] = 2 /* Delta */;
    dest[offset++] = semanticTokens.deltas.length;
    for (const delta2 of semanticTokens.deltas) {
      dest[offset++] = delta2.start;
      dest[offset++] = delta2.deleteCount;
      if (delta2.data) {
        dest[offset++] = delta2.data.length;
        dest.set(delta2.data, offset);
        offset += delta2.data.length;
      } else {
        dest[offset++] = 0;
      }
    }
  }
  return toLittleEndianBuffer(dest);
}

function encodeSemanticTokensDtoSize(semanticTokens) {
  let result = 0;
  result += 1 + 1;
  if (semanticTokens.type === "full") {
    result += 1 + semanticTokens.data.length;
  } else {
    result += 1;
    result += (1 + 1 + 1) * semanticTokens.deltas.length;
    for (const delta2 of semanticTokens.deltas) {
      if (delta2.data) {
        result += delta2.data.length;
      }
    }
  }
  return result;
}

function decodeSemanticTokensDto(_buff) {
  const src = fromLittleEndianBuffer(_buff);
  let offset = 0;
  const id2 = src[offset++];
  const type = src[offset++];
  if (type === 1 /* Full */) {
    const length = src[offset++];
    const data = src.subarray(offset, offset + length);
    offset += length;
    return {
      id: id2,
      type: "full",
      data
    };
  }
  const deltaCount = src[offset++];
  const deltas = [];
  for (let i2 = 0; i2 < deltaCount; i2++) {
    const start = src[offset++];
    const deleteCount = src[offset++];
    const length = src[offset++];
    let data;
    if (length > 0) {
      data = src.subarray(offset, offset + length);
      offset += length;
    }
    deltas[i2] = { start, deleteCount, data };
  }
  return {
    id: id2,
    type: "delta",
    deltas
  };
}
export { reverseEndianness, toLittleEndianBuffer, fromLittleEndianBuffer, encodeSemanticTokensDto, encodeSemanticTokensDtoSize, decodeSemanticTokensDto };
