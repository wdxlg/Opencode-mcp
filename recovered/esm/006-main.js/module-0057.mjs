// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/parts/ipc/common/webSocketFraming.ts
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { __esm } from "./module-0000.mjs";
import { ChunkStream, init_ipc_net } from "./module-0056.mjs";


// src/vs/base/parts/ipc/common/webSocketFraming.ts
function encodeWebSocketFrame(payload, options) {
  const final = options.final ?? true;
  const compressed = options.compressed ?? false;
  validateOpcode(options.opcode);
  validateMask(options.mask);
  validateFrame((final ? firstByteFinalMask : 0) | (compressed ? firstByteCompressedMask : 0) | options.opcode, payload.byteLength);
  const headerLength = getHeaderLength(payload.byteLength, options.mask !== void 0);
  const header = VSBuffer.alloc(headerLength);
  header.writeUInt8((final ? firstByteFinalMask : 0) | (compressed ? firstByteCompressedMask : 0) | options.opcode, 0);
  let offset = 2;
  if (payload.byteLength < extendedPayloadLength16) {
    header.writeUInt8((options.mask === void 0 ? 0 : secondByteMaskedMask) | payload.byteLength, 1);
  } else if (payload.byteLength < 2 ** 16) {
    header.writeUInt8((options.mask === void 0 ? 0 : secondByteMaskedMask) | extendedPayloadLength16, 1);
    header.writeUInt8(payload.byteLength >>> 8, offset++);
    header.writeUInt8(payload.byteLength, offset++);
  } else {
    header.writeUInt8((options.mask === void 0 ? 0 : secondByteMaskedMask) | extendedPayloadLength64, 1);
    header.writeUInt32BE(0, offset);
    offset += 4;
    header.writeUInt32BE(payload.byteLength, offset);
    offset += 4;
  }
  if (options.mask === void 0) {
    return VSBuffer.concat([header, payload]);
  }
  header.writeUInt32BE(options.mask, offset);
  return VSBuffer.concat([header, copyAndApplyWebSocketMask(payload, options.mask)]);
}

function applyWebSocketMask(payload, mask) {
  validateMask(mask);
  if (mask === 0) {
    return;
  }
  const wordCount = payload.byteLength >>> 2;
  for (let index = 0; index < wordCount; index++) {
    const offset2 = index * 4;
    payload.writeUInt32BE(payload.readUInt32BE(offset2) ^ mask, offset2);
  }
  const offset = wordCount * 4;
  const remainingByteCount = payload.byteLength - offset;
  if (remainingByteCount >= 1) {
    payload.writeUInt8(payload.readUInt8(offset) ^ mask >>> 24 & 255, offset);
  }
  if (remainingByteCount >= 2) {
    payload.writeUInt8(payload.readUInt8(offset + 1) ^ mask >>> 16 & 255, offset + 1);
  }
  if (remainingByteCount >= 3) {
    payload.writeUInt8(payload.readUInt8(offset + 2) ^ mask >>> 8 & 255, offset + 2);
  }
}

function getHeaderLength(payloadLength, masked) {
  if (payloadLength > maximum32BitPayloadLength) {
    throw new Error("WebSocket payload lengths greater than 2^32 - 1 are not supported.");
  }
  if (payloadLength < extendedPayloadLength16) {
    return 2 + (masked ? 4 : 0);
  }
  if (payloadLength < 2 ** 16) {
    return 4 + (masked ? 4 : 0);
  }
  return 10 + (masked ? 4 : 0);
}

function getPayloadLength(header, marker) {
  if (marker < extendedPayloadLength16) {
    return marker;
  }
  if (marker === extendedPayloadLength16) {
    return header.readUInt8(2) * 2 ** 8 + header.readUInt8(3);
  }
  const highBits = header.readUInt32BE(2);
  if (highBits !== 0) {
    throw new Error("WebSocket payload lengths greater than 2^32 - 1 are not supported.");
  }
  return header.readUInt32BE(6);
}

function validateFrame(firstByte, payloadLength) {
  if ((firstByte & firstByteReservedMask) !== 0) {
    throw new Error("WebSocket frames must not set RSV2 or RSV3.");
  }
  const opcode = firstByte & 15;
  validateOpcode(opcode);
  if (isControlOpcode(opcode)) {
    if ((firstByte & firstByteFinalMask) === 0) {
      throw new Error("WebSocket control frames must be final.");
    }
    if (payloadLength > 125) {
      throw new Error("WebSocket control frames must not exceed 125 bytes.");
    }
    if ((firstByte & firstByteCompressedMask) !== 0) {
      throw new Error("WebSocket control frames must not set RSV1.");
    }
  }
}

function validateOpcode(opcode) {
  if (opcode !== 0 /* Continuation */ && opcode !== 1 /* Text */ && opcode !== 2 /* Binary */ && opcode !== 8 /* Close */ && opcode !== 9 /* Ping */ && opcode !== 10 /* Pong */) {
    throw new Error(`WebSocket frame has reserved opcode ${opcode}.`);
  }
}

function validateMask(mask) {
  if (mask !== void 0 && (!Number.isInteger(mask) || mask < 0 || mask > maximum32BitPayloadLength)) {
    throw new Error("WebSocket masks must be unsigned 32-bit integers.");
  }
}

function isControlOpcode(opcode) {
  return (opcode & 8) !== 0;
}

function copyAndApplyWebSocketMask(payload, mask) {
  const maskedPayload = VSBuffer.alloc(payload.byteLength);
  maskedPayload.set(payload);
  applyWebSocketMask(maskedPayload, mask);
  return maskedPayload;
}

var firstByteFinalMask, firstByteCompressedMask, firstByteReservedMask, secondByteMaskedMask, payloadLengthMask, extendedPayloadLength16, extendedPayloadLength64, maximum32BitPayloadLength, WebSocketFrameTooLargeError, WebSocketFrameParser;

var init_webSocketFraming = __esm({
  "src/vs/base/parts/ipc/common/webSocketFraming.ts"() {
    init_buffer();
    init_ipc_net();
    firstByteFinalMask = 128;
    firstByteCompressedMask = 64;
    firstByteReservedMask = 48;
    secondByteMaskedMask = 128;
    payloadLengthMask = 127;
    extendedPayloadLength16 = 126;
    extendedPayloadLength64 = 127;
    maximum32BitPayloadLength = 4294967295;
    WebSocketFrameTooLargeError = class extends Error {
      constructor(payloadLength, maxPayloadLength) {
        super(`WebSocket frame payload length ${payloadLength} exceeds the configured limit of ${maxPayloadLength}.`);
        this.payloadLength = payloadLength;
        this.maxPayloadLength = maxPayloadLength;
      }
    };
    WebSocketFrameParser = class {
      constructor(options = {}) {
        this._incomingData = new ChunkStream();
        this._maxPayloadLength = options.maxPayloadLength ?? maximum32BitPayloadLength;
        this._unmaskInPlace = options.unmaskInPlace ?? false;
        if (!Number.isInteger(this._maxPayloadLength) || this._maxPayloadLength < 0 || this._maxPayloadLength > maximum32BitPayloadLength) {
          throw new Error("WebSocket frame payload limits must be unsigned 32-bit integers.");
        }
      }
      /**
       * Accepts a network chunk and returns every complete frame it contains.
       */
      acceptChunk(data) {
        if (data.byteLength === 0) {
          return [];
        }
        this._incomingData.acceptChunk(data);
        const frames = [];
        while (this._incomingData.byteLength >= 2) {
          const initialHeader = this._incomingData.peek(2);
          const firstByte = initialHeader.readUInt8(0);
          const secondByte = initialHeader.readUInt8(1);
          const payloadLengthMarker = secondByte & payloadLengthMask;
          const extendedPayloadLengthSize = payloadLengthMarker === extendedPayloadLength16 ? 2 : payloadLengthMarker === extendedPayloadLength64 ? 8 : 0;
          const masked = (secondByte & secondByteMaskedMask) !== 0;
          const headerLength = 2 + extendedPayloadLengthSize + (masked ? 4 : 0);
          if (this._incomingData.byteLength < headerLength) {
            break;
          }
          const header = this._incomingData.peek(headerLength);
          const payloadLength = getPayloadLength(header, payloadLengthMarker);
          if (payloadLength > this._maxPayloadLength) {
            throw new WebSocketFrameTooLargeError(payloadLength, this._maxPayloadLength);
          }
          validateFrame(firstByte, payloadLength);
          const opcode = firstByte & 15;
          validateOpcode(opcode);
          if (this._incomingData.byteLength < headerLength + payloadLength) {
            break;
          }
          this._incomingData.read(headerLength);
          const payload = this._incomingData.read(payloadLength);
          const mask = masked ? header.readUInt32BE(headerLength - 4) : void 0;
          let unmaskedPayload = payload;
          if (mask !== void 0) {
            if (this._unmaskInPlace) {
              applyWebSocketMask(unmaskedPayload, mask);
            } else {
              unmaskedPayload = copyAndApplyWebSocketMask(payload, mask);
            }
          }
          frames.push({
            final: (firstByte & firstByteFinalMask) !== 0,
            compressed: (firstByte & firstByteCompressedMask) !== 0,
            opcode,
            payload: unmaskedPayload,
            mask
          });
        }
        return frames;
      }
    };
  }
});
export { encodeWebSocketFrame, applyWebSocketMask, getHeaderLength, getPayloadLength, validateFrame, validateOpcode, validateMask, isControlOpcode, copyAndApplyWebSocketMask, firstByteFinalMask, firstByteCompressedMask, firstByteReservedMask, secondByteMaskedMask, payloadLengthMask, extendedPayloadLength16, extendedPayloadLength64, maximum32BitPayloadLength, WebSocketFrameTooLargeError, WebSocketFrameParser, init_webSocketFraming };
