// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/base/node/zip.ts
import { dirname, join } from "./module-0018.mjs";
import { localize } from "./module-0012.mjs";
import { Sequencer, createCancelablePromise } from "./module-0026.mjs";
import { assertReturnsDefined } from "./module-0008.mjs";
import { Promises2 } from "./module-0038.mjs";


// src/vs/base/node/zip.ts
import { createWriteStream as createWriteStream2, promises as promises3 } from "fs";


// src/vs/base/node/zip.ts
var CorruptZipMessage = "end of central directory record signature not found";

var CORRUPT_ZIP_PATTERN = new RegExp(CorruptZipMessage);

var ExtractError = class extends Error {
  constructor(type, cause) {
    let message = cause.message;
    switch (type) {
      case "CorruptZip":
        message = `Corrupt ZIP: ${message}`;
        break;
    }
    super(message);
    this.type = type;
    this.cause = cause;
  }
};

function modeFromEntry(entry) {
  const attr = entry.externalFileAttributes >> 16 || 33188;
  return [
    448,
    56,
    7
    /* S_IRWXO */
  ].map((mask) => attr & mask).reduce(
    (a, b) => a + b,
    attr & 61440
    /* S_IFMT */
  );
}

function toExtractError(err) {
  if (err instanceof ExtractError) {
    return err;
  }
  let type = void 0;
  if (CORRUPT_ZIP_PATTERN.test(err.message)) {
    type = "CorruptZip";
  }
  return new ExtractError(type, err);
}

function extractEntry(stream, fileName, mode, targetPath, options, token) {
  const dirName = dirname(fileName);
  const targetDirName = join(targetPath, dirName);
  if (!targetDirName.startsWith(targetPath)) {
    return Promise.reject(new Error(localize(153, null, fileName)));
  }
  const targetFileName = join(targetPath, fileName);
  let istream;
  const listener = token.onCancellationRequested(() => {
    istream?.destroy();
  });
  return Promise.resolve(promises3.mkdir(targetDirName, { recursive: true })).then(() => new Promise((c, e) => {
    if (token.isCancellationRequested) {
      c();
      return;
    }
    try {
      istream = createWriteStream2(targetFileName, { mode });
      istream.once("close", () => c());
      istream.once("error", e);
      stream.once("error", e);
      stream.pipe(istream);
    } catch (error) {
      e(error);
    }
  })).finally(() => listener.dispose());
}

function extractZip(zipfile, targetPath, options, token) {
  let last = createCancelablePromise(() => Promise.resolve());
  let extractedEntriesCount = 0;
  const listener = token.onCancellationRequested(() => {
    last.cancel();
    zipfile.close();
  });
  return new Promise((c, e) => {
    const throttler = new Sequencer();
    const readNextEntry = (token2) => {
      if (token2.isCancellationRequested) {
        return;
      }
      extractedEntriesCount++;
      zipfile.readEntry();
    };
    zipfile.once("error", e);
    zipfile.once("close", () => last.then(() => {
      if (token.isCancellationRequested || zipfile.entryCount === extractedEntriesCount) {
        c();
      } else {
        e(new ExtractError("Incomplete", new Error(localize(152, null, extractedEntriesCount, zipfile.entryCount))));
      }
    }, e));
    zipfile.readEntry();
    zipfile.on("entry", (entry) => {
      if (token.isCancellationRequested) {
        return;
      }
      if (!options.sourcePathRegex.test(entry.fileName)) {
        readNextEntry(token);
        return;
      }
      const fileName = entry.fileName.replace(options.sourcePathRegex, "");
      if (/\/$/.test(fileName)) {
        const targetFileName = join(targetPath, fileName);
        last = createCancelablePromise((token2) => promises3.mkdir(targetFileName, { recursive: true }).then(() => readNextEntry(token2)).then(void 0, e));
        return;
      }
      const stream = openZipStream(zipfile, entry);
      const mode = modeFromEntry(entry);
      last = createCancelablePromise((token2) => throttler.queue(() => stream.then((stream2) => extractEntry(stream2, fileName, mode, targetPath, options, token2).then(() => readNextEntry(token2)))).then(null, e));
    });
  }).finally(() => listener.dispose());
}

async function openZip(zipFile, lazy = false) {
  const { open: open2 } = await import("yauzl");
  return new Promise((resolve2, reject) => {
    open2(zipFile, lazy ? { lazyEntries: true } : void 0, (error, zipfile) => {
      if (error) {
        reject(toExtractError(error));
      } else {
        resolve2(assertReturnsDefined(zipfile));
      }
    });
  });
}

function openZipStream(zipFile, entry) {
  return new Promise((resolve2, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error) {
        reject(toExtractError(error));
      } else {
        resolve2(assertReturnsDefined(stream));
      }
    });
  });
}

function extract(zipPath, targetPath, options = {}, token) {
  const sourcePathRegex = new RegExp(options.sourcePath ? `^${options.sourcePath}` : "");
  let promise = openZip(zipPath, true);
  if (options.overwrite) {
    promise = promise.then((zipfile) => Promises2.rm(targetPath).then(() => zipfile));
  }
  return promise.then((zipfile) => extractZip(zipfile, targetPath, { sourcePathRegex }, token));
}
export { modeFromEntry, toExtractError, extractEntry, extractZip, openZip, openZipStream, extract, createWriteStream2, promises3, CorruptZipMessage, CORRUPT_ZIP_PATTERN, ExtractError };
