// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/services/semanticTokensDto.ts
import { isLittleEndian } from "./module-0016.mjs";
import { VSBuffer } from "./module-0013.mjs";


// src/vs/editor/common/services/semanticTokensDto.ts
function reverseEndianness(arr) {
  for (let i = 0, len = arr.length; i < len; i += 4) {
    const b0 = arr[i + 0];
    const b1 = arr[i + 1];
    const b2 = arr[i + 2];
    const b3 = arr[i + 3];
    arr[i + 0] = b3;
    arr[i + 1] = b2;
    arr[i + 2] = b1;
    arr[i + 3] = b0;
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
    const data2 = new Uint8Array(uint8Arr.byteLength);
    data2.set(uint8Arr);
    return new Uint32Array(data2.buffer, data2.byteOffset, data2.length / 4);
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
    for (const delta3 of semanticTokens.deltas) {
      dest[offset++] = delta3.start;
      dest[offset++] = delta3.deleteCount;
      if (delta3.data) {
        dest[offset++] = delta3.data.length;
        dest.set(delta3.data, offset);
        offset += delta3.data.length;
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
    for (const delta3 of semanticTokens.deltas) {
      if (delta3.data) {
        result += delta3.data.length;
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
    const data2 = src.subarray(offset, offset + length);
    offset += length;
    return {
      id: id2,
      type: "full",
      data: data2
    };
  }
  const deltaCount = src[offset++];
  const deltas = [];
  for (let i = 0; i < deltaCount; i++) {
    const start = src[offset++];
    const deleteCount = src[offset++];
    const length = src[offset++];
    let data2;
    if (length > 0) {
      data2 = src.subarray(offset, offset + length);
      offset += length;
    }
    deltas[i] = { start, deleteCount, data: data2 };
  }
  return {
    id: id2,
    type: "delta",
    deltas
  };
}
export { reverseEndianness, toLittleEndianBuffer, fromLittleEndianBuffer, encodeSemanticTokensDto, encodeSemanticTokensDtoSize, decodeSemanticTokensDto };
