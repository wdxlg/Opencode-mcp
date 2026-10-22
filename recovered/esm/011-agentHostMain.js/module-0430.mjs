// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/files/common/io.ts
import { VSBuffer } from "./module-0029.mjs";
import { createFileSystemProviderError, ensureFileSystemProviderError } from "./module-0128.mjs";
import { canceled } from "./module-0002.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/files/common/io.ts
async function readFileIntoStream(provider, resource, target, transformer, options, token) {
  let error = void 0;
  try {
    await doReadFileIntoStream(provider, resource, target, transformer, options, token);
  } catch (err) {
    error = err;
  } finally {
    if (error && options.errorTransformer) {
      error = options.errorTransformer(error);
    }
    if (typeof error !== "undefined") {
      target.error(error);
    }
    target.end();
  }
}

async function doReadFileIntoStream(provider, resource, target, transformer, options, token) {
  throwIfCancelled2(token);
  const handle = await provider.open(resource, { create: false });
  try {
    throwIfCancelled2(token);
    let totalBytesRead = 0;
    let bytesRead = 0;
    let allowedRemainingBytes = options && typeof options.length === "number" ? options.length : void 0;
    let buffer = VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options.bufferSize));
    let posInFile = options && typeof options.position === "number" ? options.position : 0;
    let posInBuffer = 0;
    do {
      bytesRead = await provider.read(handle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
      posInFile += bytesRead;
      posInBuffer += bytesRead;
      totalBytesRead += bytesRead;
      if (typeof allowedRemainingBytes === "number") {
        allowedRemainingBytes -= bytesRead;
      }
      if (posInBuffer === buffer.byteLength) {
        await target.write(transformer(buffer));
        buffer = VSBuffer.alloc(Math.min(options.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options.bufferSize));
        posInBuffer = 0;
      }
    } while (bytesRead > 0 && (typeof allowedRemainingBytes !== "number" || allowedRemainingBytes > 0) && throwIfCancelled2(token) && throwIfTooLarge(totalBytesRead, options));
    if (posInBuffer > 0) {
      let lastChunkLength = posInBuffer;
      if (typeof allowedRemainingBytes === "number") {
        lastChunkLength = Math.min(posInBuffer, allowedRemainingBytes);
      }
      target.write(transformer(buffer.slice(0, lastChunkLength)));
    }
  } catch (error) {
    throw ensureFileSystemProviderError(error);
  } finally {
    await provider.close(handle);
  }
}

function throwIfCancelled2(token) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  return true;
}

function throwIfTooLarge(totalBytesRead, options) {
  if (typeof options?.limits?.size === "number" && totalBytesRead > options.limits.size) {
    throw createFileSystemProviderError(localize(3045, null), "EntryTooLarge" /* FileTooLarge */);
  }
  return true;
}
export { readFileIntoStream, doReadFileIntoStream, throwIfCancelled2, throwIfTooLarge };
