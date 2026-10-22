// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/files/common/io.ts
import { VSBuffer } from "./module-0031.mjs";
import { createFileSystemProviderError, ensureFileSystemProviderError } from "./module-0073.mjs";
import { canceled } from "./module-0003.mjs";
import { localize } from "./module-0013.mjs";


// src/vs/platform/files/common/io.ts
async function readFileIntoStream(provider, resource, target, transformer, options2, token) {
  let error = void 0;
  try {
    await doReadFileIntoStream(provider, resource, target, transformer, options2, token);
  } catch (err) {
    error = err;
  } finally {
    if (error && options2.errorTransformer) {
      error = options2.errorTransformer(error);
    }
    if (typeof error !== "undefined") {
      target.error(error);
    }
    target.end();
  }
}

async function doReadFileIntoStream(provider, resource, target, transformer, options2, token) {
  throwIfCancelled(token);
  const handle = await provider.open(resource, { create: false });
  try {
    throwIfCancelled(token);
    let totalBytesRead = 0;
    let bytesRead = 0;
    let allowedRemainingBytes = options2 && typeof options2.length === "number" ? options2.length : void 0;
    let buffer = VSBuffer.alloc(Math.min(options2.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options2.bufferSize));
    let posInFile = options2 && typeof options2.position === "number" ? options2.position : 0;
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
        buffer = VSBuffer.alloc(Math.min(options2.bufferSize, typeof allowedRemainingBytes === "number" ? allowedRemainingBytes : options2.bufferSize));
        posInBuffer = 0;
      }
    } while (bytesRead > 0 && (typeof allowedRemainingBytes !== "number" || allowedRemainingBytes > 0) && throwIfCancelled(token) && throwIfTooLarge(totalBytesRead, options2));
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

function throwIfCancelled(token) {
  if (token.isCancellationRequested) {
    throw canceled();
  }
  return true;
}

function throwIfTooLarge(totalBytesRead, options2) {
  if (typeof options2?.limits?.size === "number" && totalBytesRead > options2.limits.size) {
    throw createFileSystemProviderError(localize(3045, null), "EntryTooLarge" /* FileTooLarge */);
  }
  return true;
}
export { readFileIntoStream, doReadFileIntoStream, throwIfCancelled, throwIfTooLarge };
