// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/node/zip.ts



// src/vs/base/node/zip.ts
import { createWriteStream as createWriteStream3, promises as promises11 } from "fs";

var CorruptZipMessage = "end of central directory record signature not found";

var CORRUPT_ZIP_PATTERN = new RegExp(CorruptZipMessage);

async function zip(zipPath, files) {
  const { ZipFile } = await import("yazl");
  const zip2 = new ZipFile();
  const zipStream = createWriteStream3(zipPath);
  const result = new Promise((c, e) => {
    zip2.outputStream.once("error", e);
    zipStream.once("error", e);
    zipStream.once("finish", () => c(zipPath));
  });
  zip2.outputStream.pipe(zipStream);
  for (const f of files) {
    if (f.contents !== void 0) {
      zip2.addBuffer(typeof f.contents === "string" ? Buffer.from(f.contents, "utf8") : f.contents, f.path);
    } else if (f.localPath) {
      if (f.localPathSize === void 0 && !f.skipSourceErrors) {
        zip2.addFile(f.localPath, f.path);
      } else {
        let handle;
        try {
          handle = await promises11.open(f.localPath, "r");
        } catch (error) {
          if (f.skipSourceErrors) {
            continue;
          }
          throw error;
        }
        let streamOwnsHandle = false;
        try {
          let size;
          try {
            const currentSize = (await handle.stat()).size;
            size = f.localPathSize === void 0 ? currentSize : Math.min(f.localPathSize, currentSize);
          } catch (error) {
            if (f.skipSourceErrors) {
              continue;
            }
            throw error;
          }
          if (size === 0) {
            zip2.addBuffer(Buffer.alloc(0), f.path);
          } else {
            const readStream = handle.createReadStream({ start: 0, end: size - 1 });
            readStream.once("error", (error) => zip2.outputStream.emit("error", error));
            zip2.addReadStream(readStream, f.path, { size });
            streamOwnsHandle = true;
          }
        } finally {
          if (!streamOwnsHandle) {
            await handle.close();
          }
        }
      }
    }
  }
  zip2.end();
  return result;
}
export { zip, createWriteStream3, promises11, CorruptZipMessage, CORRUPT_ZIP_PATTERN };
