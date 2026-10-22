// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/buffer.ts
import { Lazy } from "./module-0028.mjs";
import { consumeReadable, consumeStream, newWriteableStream, prefixedReadable, prefixedStream, toReadable, toStream } from "./module-0037.mjs";


// src/vs/base/common/buffer.ts
var hasBuffer = typeof Buffer !== "undefined";

var indexOfTable = new Lazy(() => new Uint8Array(256));

var textEncoder;

var textDecoder;

var VSBuffer = class _VSBuffer {
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static alloc(byteLength2) {
    if (hasBuffer) {
      return new _VSBuffer(Buffer.allocUnsafe(byteLength2));
    } else {
      return new _VSBuffer(new Uint8Array(byteLength2));
    }
  }
  /**
   * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
   * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
   * which is not transferrable.
   */
  static wrap(actual) {
    if (hasBuffer && !Buffer.isBuffer(actual)) {
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }
    return new _VSBuffer(actual);
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static fromString(source, options3) {
    const dontUseNodeBuffer = options3?.dontUseNodeBuffer || false;
    if (!dontUseNodeBuffer && hasBuffer) {
      return new _VSBuffer(Buffer.from(source));
    } else {
      if (!textEncoder) {
        textEncoder = new TextEncoder();
      }
      return new _VSBuffer(textEncoder.encode(source));
    }
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static fromByteArray(source) {
    const result = _VSBuffer.alloc(source.length);
    for (let i2 = 0, len = source.length; i2 < len; i2++) {
      result.buffer[i2] = source[i2];
    }
    return result;
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  static concat(buffers, totalLength) {
    if (typeof totalLength === "undefined") {
      totalLength = 0;
      for (let i2 = 0, len = buffers.length; i2 < len; i2++) {
        totalLength += buffers[i2].byteLength;
      }
    }
    const ret = _VSBuffer.alloc(totalLength);
    let offset = 0;
    for (let i2 = 0, len = buffers.length; i2 < len; i2++) {
      const element = buffers[i2];
      ret.set(element, offset);
      offset += element.byteLength;
    }
    return ret;
  }
  static isNativeBuffer(buffer) {
    return hasBuffer && Buffer.isBuffer(buffer);
  }
  constructor(buffer) {
    this.buffer = buffer;
    this.byteLength = this.buffer.byteLength;
  }
  /**
   * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
   * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
   */
  clone() {
    const result = _VSBuffer.alloc(this.byteLength);
    result.set(this);
    return result;
  }
  toString() {
    if (hasBuffer) {
      return this.buffer.toString();
    } else {
      if (!textDecoder) {
        textDecoder = new TextDecoder(void 0, { ignoreBOM: true });
      }
      return textDecoder.decode(this.buffer);
    }
  }
  slice(start, end) {
    return new _VSBuffer(this.buffer.subarray(start, end));
  }
  set(array3, offset) {
    if (array3 instanceof _VSBuffer) {
      this.buffer.set(array3.buffer, offset);
    } else if (array3 instanceof Uint8Array) {
      this.buffer.set(array3, offset);
    } else if (array3 instanceof ArrayBuffer) {
      this.buffer.set(new Uint8Array(array3), offset);
    } else if (ArrayBuffer.isView(array3)) {
      this.buffer.set(new Uint8Array(array3.buffer, array3.byteOffset, array3.byteLength), offset);
    } else {
      throw new Error(`Unknown argument 'array'`);
    }
  }
  readUInt32BE(offset) {
    return readUInt32BE(this.buffer, offset);
  }
  writeUInt32BE(value2, offset) {
    writeUInt32BE(this.buffer, value2, offset);
  }
  readUInt32LE(offset) {
    return readUInt32LE(this.buffer, offset);
  }
  writeUInt32LE(value2, offset) {
    writeUInt32LE(this.buffer, value2, offset);
  }
  readUInt8(offset) {
    return readUInt8(this.buffer, offset);
  }
  writeUInt8(value2, offset) {
    writeUInt8(this.buffer, value2, offset);
  }
  indexOf(subarray, offset = 0) {
    return binaryIndexOf(this.buffer, subarray instanceof _VSBuffer ? subarray.buffer : subarray, offset);
  }
  equals(other) {
    if (this === other) {
      return true;
    }
    if (this.byteLength !== other.byteLength) {
      return false;
    }
    return this.buffer.every((value2, index2) => value2 === other.buffer[index2]);
  }
};

function binaryIndexOf(haystack, needle, offset = 0) {
  const needleLen = needle.byteLength;
  const haystackLen = haystack.byteLength;
  if (needleLen === 0) {
    return 0;
  }
  if (needleLen === 1) {
    return haystack.indexOf(needle[0], offset);
  }
  if (needleLen > haystackLen - offset) {
    return -1;
  }
  const table = indexOfTable.value;
  table.fill(needle.length);
  for (let i3 = 0; i3 < needle.length; i3++) {
    table[needle[i3]] = needle.length - i3 - 1;
  }
  let i2 = offset + needle.length - 1;
  let j = i2;
  let result = -1;
  while (i2 < haystackLen) {
    if (haystack[i2] === needle[j]) {
      if (j === 0) {
        result = i2;
        break;
      }
      i2--;
      j--;
    } else {
      i2 += Math.max(needle.length - j, table[haystack[i2]]);
      j = needle.length - 1;
    }
  }
  return result;
}

function readUInt16LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0;
}

function writeUInt16LE(destination, value2, offset) {
  destination[offset + 0] = value2 & 255;
  value2 = value2 >>> 8;
  destination[offset + 1] = value2 & 255;
}

function readUInt32BE(source, offset) {
  return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
}

function writeUInt32BE(destination, value2, offset) {
  destination[offset + 3] = value2;
  value2 = value2 >>> 8;
  destination[offset + 2] = value2;
  value2 = value2 >>> 8;
  destination[offset + 1] = value2;
  value2 = value2 >>> 8;
  destination[offset] = value2;
}

function readUInt32LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0 | source[offset + 2] << 16 >>> 0 | source[offset + 3] << 24 >>> 0;
}

function writeUInt32LE(destination, value2, offset) {
  destination[offset + 0] = value2 & 255;
  value2 = value2 >>> 8;
  destination[offset + 1] = value2 & 255;
  value2 = value2 >>> 8;
  destination[offset + 2] = value2 & 255;
  value2 = value2 >>> 8;
  destination[offset + 3] = value2 & 255;
}

function readUInt8(source, offset) {
  return source[offset];
}

function writeUInt8(destination, value2, offset) {
  destination[offset] = value2;
}

function readableToBuffer(readable) {
  return consumeReadable(readable, (chunks) => VSBuffer.concat(chunks));
}

function bufferToReadable(buffer) {
  return toReadable(buffer);
}

function streamToBuffer(stream) {
  return consumeStream(stream, (chunks) => VSBuffer.concat(chunks));
}

async function bufferedStreamToBuffer(bufferedStream) {
  if (bufferedStream.ended) {
    return VSBuffer.concat(bufferedStream.buffer);
  }
  return VSBuffer.concat([
    // Include already read chunks...
    ...bufferedStream.buffer,
    // ...and all additional chunks
    await streamToBuffer(bufferedStream.stream)
  ]);
}

function bufferToStream(buffer) {
  return toStream(buffer, (chunks) => VSBuffer.concat(chunks));
}

function newWriteableBufferStream(options3) {
  return newWriteableStream((chunks) => VSBuffer.concat(chunks), options3);
}

function prefixedBufferReadable(prefix, readable) {
  return prefixedReadable(prefix, readable, (chunks) => VSBuffer.concat(chunks));
}

function prefixedBufferStream(prefix, stream) {
  return prefixedStream(prefix, stream, (chunks) => VSBuffer.concat(chunks));
}

function decodeBase64(encoded) {
  let building = 0;
  let remainder = 0;
  let bufi = 0;
  const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
  const append4 = (value2) => {
    switch (remainder) {
      case 3:
        buffer[bufi++] = building | value2;
        remainder = 0;
        break;
      case 2:
        buffer[bufi++] = building | value2 >>> 2;
        building = value2 << 6;
        remainder = 3;
        break;
      case 1:
        buffer[bufi++] = building | value2 >>> 4;
        building = value2 << 4;
        remainder = 2;
        break;
      default:
        building = value2 << 2;
        remainder = 1;
    }
  };
  for (let i2 = 0; i2 < encoded.length; i2++) {
    const code = encoded.charCodeAt(i2);
    if (code >= 65 && code <= 90) {
      append4(code - 65);
    } else if (code >= 97 && code <= 122) {
      append4(code - 97 + 26);
    } else if (code >= 48 && code <= 57) {
      append4(code - 48 + 52);
    } else if (code === 43 || code === 45) {
      append4(62);
    } else if (code === 47 || code === 95) {
      append4(63);
    } else if (code === 61) {
      break;
    } else {
      throw new SyntaxError(`Unexpected base64 character ${encoded[i2]}`);
    }
  }
  const unpadded = bufi;
  while (remainder > 0) {
    append4(0);
  }
  return VSBuffer.wrap(buffer).slice(0, unpadded);
}

var base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var base64UrlSafeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function encodeBase64({ buffer }, padded = true, urlSafe = false) {
  const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
  let output = "";
  const remainder = buffer.byteLength % 3;
  let i2 = 0;
  for (; i2 < buffer.byteLength - remainder; i2 += 3) {
    const a = buffer[i2 + 0];
    const b = buffer[i2 + 1];
    const c = buffer[i2 + 2];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 63];
    output += dictionary[(b << 2 | c >>> 6) & 63];
    output += dictionary[c & 63];
  }
  if (remainder === 1) {
    const a = buffer[i2 + 0];
    output += dictionary[a >>> 2];
    output += dictionary[a << 4 & 63];
    if (padded) {
      output += "==";
    }
  } else if (remainder === 2) {
    const a = buffer[i2 + 0];
    const b = buffer[i2 + 1];
    output += dictionary[a >>> 2];
    output += dictionary[(a << 4 | b >>> 4) & 63];
    output += dictionary[b << 2 & 63];
    if (padded) {
      output += "=";
    }
  }
  return output;
}

var hexChars = "0123456789abcdef";

function encodeHex({ buffer }) {
  let result = "";
  for (let i2 = 0; i2 < buffer.length; i2++) {
    const byte = buffer[i2];
    result += hexChars[byte >>> 4];
    result += hexChars[byte & 15];
  }
  return result;
}

function decodeHex(hex) {
  if (hex.length % 2 !== 0) {
    throw new SyntaxError("Hex string must have an even length");
  }
  const out = new Uint8Array(hex.length >> 1);
  for (let i2 = 0; i2 < hex.length; ) {
    out[i2 >> 1] = decodeHexChar(hex, i2++) << 4 | decodeHexChar(hex, i2++);
  }
  return VSBuffer.wrap(out);
}

function decodeHexChar(str, position2) {
  const s = str.charCodeAt(position2);
  if (s >= 48 && s <= 57) {
    return s - 48;
  } else if (s >= 97 && s <= 102) {
    return s - 87;
  } else if (s >= 65 && s <= 70) {
    return s - 55;
  } else {
    throw new SyntaxError(`Invalid hex character at position ${position2}`);
  }
}
export { binaryIndexOf, readUInt16LE, writeUInt16LE, readUInt32BE, writeUInt32BE, readUInt32LE, writeUInt32LE, readUInt8, writeUInt8, readableToBuffer, bufferToReadable, streamToBuffer, bufferedStreamToBuffer, bufferToStream, newWriteableBufferStream, prefixedBufferReadable, prefixedBufferStream, decodeBase64, encodeBase64, encodeHex, decodeHex, decodeHexChar, hasBuffer, indexOfTable, textEncoder, textDecoder, VSBuffer, base64Alphabet, base64UrlSafeAlphabet, hexChars };
