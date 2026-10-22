// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/files/common/io.ts
import { VSBuffer } from "./module-0038.mjs";
import { createFileSystemProviderError, ensureFileSystemProviderError } from "./module-0269.mjs";
import { canceled } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/files/common/io.ts
async function readFileIntoStream(provider, resource, target, transformer, options3, token) {
  let error = void 0;
  try {
    await doReadFileIntoStream(provider, resource, target, transformer, options3, token);
  } catch (err) {
    error = err;
  } finally {
    if (error && options3.errorTransformer) {
      error = options3.errorTransformer(error);
    }
    if (typeof error !== "undefined") {
      target.error(error);
    }
    target.end();
  }
}

async function doReadFileIntoStream(provider, resource, target, transformer, options3, token) {
  throwIfCancelled(token);
  const handle2 = await provider.open(resource, { create: false });
  try {
    throwIfCancelled(token);
    let totalBytesRead = 0;
    let bytesRead = 0;
    let allowedRemainingBytes = options3 && typeof options3.length === "number" ? options3.length : void 0;
    let buffer = VSBuffer.alloc(Math.min(options3.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options3.bufferSize));
    let posInFile = options3 && typeof options3.position === "number" ? options3.position : 0;
    let posInBuffer = 0;
    do {
      bytesRead = await provider.read(handle2, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
      posInFile += bytesRead;
      posInBuffer += bytesRead;
      totalBytesRead += bytesRead;
      if (typeof allowedRemainingBytes === "number") {
        allowedRemainingBytes -= bytesRead;
      }
      if (posInBuffer === buffer.byteLength) {
        await target.write(transformer(buffer));
        buffer = VSBuffer.alloc(Math.min(options3.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options3.bufferSize));
        posInBuffer = 0;
      }
    } while (bytesRead > 0 && (typeof allowedRemainingBytes !== "number" || allowedRemainingBytes > 0) && throwIfCancelled(token) && throwIfTooLarge(totalBytesRead, options3));
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
    await provider.close(handle2);
  }
}

function throwIfCancelled(token) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  return true;
}

function throwIfTooLarge(totalBytesRead, options3) {
  if (typeof options3?.limits?.size === "number" && totalBytesRead > options3.limits.size) {
    throw createFileSystemProviderError(localize(3045, null), "EntryTooLarge" /* FileTooLarge */);
  }
  return true;
}
export { readFileIntoStream, doReadFileIntoStream, throwIfCancelled, throwIfTooLarge };
