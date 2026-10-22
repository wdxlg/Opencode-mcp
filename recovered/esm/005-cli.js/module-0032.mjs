// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/node/pfs.ts
import { init_extpath, isEqualOrParent, isRootOrDriveLetter, randomPath } from "./module-0024.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0002.mjs";
import { init_path, join3, normalize, sep } from "./module-0004.mjs";
import { init_normalization, normalizeNFC } from "./module-0031.mjs";
import { URI, init_uri } from "./module-0026.mjs";
import { extUriBiasedIgnorePathCase, init_resources } from "./module-0028.mjs";
import { ResourceQueue, init_async, timeout } from "./module-0030.mjs";
import { init_strings, rtrim } from "./module-0023.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/node/pfs.ts
import * as fs3 from "fs";

import { tmpdir } from "os";

import { promisify } from "util";

async function rimraf(path3, mode = 0 /* UNLINK */, moveToPath) {
  if (isRootOrDriveLetter(path3)) {
    throw new Error("rimraf - will refuse to recursively delete root");
  }
  if (mode === 0 /* UNLINK */) {
    return rimrafUnlink(path3);
  }
  return rimrafMove(path3, moveToPath);
}

async function rimrafMove(path3, moveToPath = randomPath(tmpdir())) {
  try {
    try {
      await fs3.promises.rename(path3, moveToPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }
      return rimrafUnlink(path3);
    }
    rimrafUnlink(moveToPath).catch(() => {
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function rimrafUnlink(path3) {
  return fs3.promises.rm(path3, { recursive: true, force: true, maxRetries: 3 });
}

async function readdir(path3, options) {
  try {
    return await doReaddir(path3, options);
  } catch (error) {
    if (error.code === "ENOENT" && isWindows2 && isRootOrDriveLetter(path3)) {
      try {
        return await doReaddir(`${path3}.`, options);
      } catch {
      }
    }
    throw error;
  }
}

async function doReaddir(path3, options) {
  return handleDirectoryChildren(await (options ? safeReaddirWithFileTypes(path3) : fs3.promises.readdir(path3)));
}

async function safeReaddirWithFileTypes(path3) {
  try {
    return await fs3.promises.readdir(path3, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("[node.js fs] readdir with filetypes failed with error: ", error);
    }
  }
  const result = [];
  const children = await readdir(path3);
  for (const child of children) {
    let isFile = false;
    let isDirectory = false;
    let isSymbolicLink = false;
    try {
      const lstat = await fs3.promises.lstat(join3(path3, child));
      isFile = lstat.isFile();
      isDirectory = lstat.isDirectory();
      isSymbolicLink = lstat.isSymbolicLink();
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn("[node.js fs] unexpected error from lstat after readdir: ", error);
      }
    }
    result.push({
      name: child,
      isFile: () => isFile,
      isDirectory: () => isDirectory,
      isSymbolicLink: () => isSymbolicLink
    });
  }
  return result;
}

function handleDirectoryChildren(children) {
  return children.map((child) => {
    if (typeof child === "string") {
      return isMacintosh ? normalizeNFC(child) : child;
    }
    child.name = isMacintosh ? normalizeNFC(child.name) : child.name;
    return child;
  });
}

async function readDirsInDir(dirPath) {
  const children = await readdir(dirPath);
  const directories = [];
  for (const child of children) {
    if (await SymlinkSupport.existsDirectory(join3(dirPath, child))) {
      directories.push(child);
    }
  }
  return directories;
}

function whenDeleted(path3, intervalMs = 1e3) {
  return new Promise((resolve2) => {
    let running = false;
    const interval = setInterval(() => {
      if (!running) {
        running = true;
        fs3.access(path3, (err) => {
          running = false;
          if (err) {
            clearInterval(interval);
            resolve2(void 0);
          }
        });
      }
    }, intervalMs);
  });
}

function writeFile2(path3, data, options) {
  return writeQueues.queueFor(URI.file(path3), () => {
    const ensuredOptions = ensureWriteOptions(options);
    return new Promise((resolve2, reject) => doWriteFileAndFlush(path3, data, ensuredOptions, (error) => error ? reject(error) : resolve2()));
  }, extUriBiasedIgnorePathCase);
}

function configureFlushOnWrite(enabled) {
  canFlush = enabled;
}

function doWriteFileAndFlush(path3, data, options, callback) {
  if (!canFlush) {
    return fs3.writeFile(path3, data, { mode: options.mode, flag: options.flag }, callback);
  }
  fs3.open(path3, options.flag, options.mode, (openError, fd) => {
    if (openError) {
      return callback(openError);
    }
    fs3.writeFile(fd, data, (writeError) => {
      if (writeError) {
        return fs3.close(fd, () => callback(writeError));
      }
      fs3.fdatasync(fd, (syncError) => {
        if (syncError) {
          console.warn("[node.js fs] fdatasync is now disabled for this session because it failed: ", syncError);
          configureFlushOnWrite(false);
        }
        return fs3.close(fd, (closeError) => callback(closeError));
      });
    });
  });
}

function writeFileSync2(path3, data, options) {
  const ensuredOptions = ensureWriteOptions(options);
  if (!canFlush) {
    return fs3.writeFileSync(path3, data, { mode: ensuredOptions.mode, flag: ensuredOptions.flag });
  }
  const fd = fs3.openSync(path3, ensuredOptions.flag, ensuredOptions.mode);
  try {
    fs3.writeFileSync(fd, data);
    try {
      fs3.fdatasyncSync(fd);
    } catch (syncError) {
      console.warn("[node.js fs] fdatasyncSync is now disabled for this session because it failed: ", syncError);
      configureFlushOnWrite(false);
    }
  } finally {
    fs3.closeSync(fd);
  }
}

function ensureWriteOptions(options) {
  if (!options) {
    return { mode: 438, flag: "w" };
  }
  return {
    mode: typeof options.mode === "number" ? options.mode : 438,
    flag: typeof options.flag === "string" ? options.flag : "w"
  };
}

async function rename(source, target, windowsRetryTimeout = 6e4) {
  if (source === target) {
    return;
  }
  try {
    if (isWindows2 && typeof windowsRetryTimeout === "number") {
      await renameWithRetry(source, target, Date.now(), windowsRetryTimeout);
    } else {
      await fs3.promises.rename(source, target);
    }
  } catch (error) {
    if (source.toLowerCase() !== target.toLowerCase() && error.code === "EXDEV" || source.endsWith(".")) {
      await copy(source, target, {
        preserveSymlinks: false
        /* copying to another device */
      });
      await rimraf(source, 1 /* MOVE */);
    } else {
      throw error;
    }
  }
}

async function renameWithRetry(source, target, startTime, retryTimeout, attempt = 0) {
  try {
    return await fs3.promises.rename(source, target);
  } catch (error) {
    if (error.code !== "EACCES" && error.code !== "EPERM" && error.code !== "EBUSY") {
      throw error;
    }
    if (Date.now() - startTime >= retryTimeout) {
      console.error(`[node.js fs] rename failed after ${attempt} retries with error: ${error}`);
      throw error;
    }
    if (attempt === 0) {
      let abortRetry = false;
      try {
        const { stat } = await SymlinkSupport.stat(target);
        if (!stat.isFile()) {
          abortRetry = true;
        }
      } catch {
      }
      if (abortRetry) {
        throw error;
      }
    }
    await timeout(Math.min(100, attempt * 10));
    return renameWithRetry(source, target, startTime, retryTimeout, attempt + 1);
  }
}

async function copy(source, target, options) {
  return doCopy(source, target, { root: { source, target }, options, handledSourcePaths: /* @__PURE__ */ new Set() });
}

async function doCopy(source, target, payload) {
  if (payload.handledSourcePaths.has(source)) {
    return;
  } else {
    payload.handledSourcePaths.add(source);
  }
  const { stat, symbolicLink } = await SymlinkSupport.stat(source);
  if (symbolicLink) {
    if (payload.options.preserveSymlinks) {
      try {
        return await doCopySymlink(source, target, payload);
      } catch {
      }
    }
    if (symbolicLink.dangling) {
      return;
    }
  }
  if (stat.isDirectory()) {
    return doCopyDirectory(source, target, stat.mode & COPY_MODE_MASK, payload);
  } else {
    return doCopyFile(source, target, stat.mode & COPY_MODE_MASK);
  }
}

async function doCopyDirectory(source, target, mode, payload) {
  await fs3.promises.mkdir(target, { recursive: true, mode });
  const files = await readdir(source);
  for (const file of files) {
    await doCopy(join3(source, file), join3(target, file), payload);
  }
}

async function doCopyFile(source, target, mode) {
  await fs3.promises.copyFile(source, target);
  await fs3.promises.chmod(target, mode);
}

async function doCopySymlink(source, target, payload) {
  let linkTarget = await fs3.promises.readlink(source);
  if (isEqualOrParent(linkTarget, payload.root.source, !isLinux)) {
    linkTarget = join3(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
  }
  await fs3.promises.symlink(linkTarget, target);
}

async function realpath2(path3) {
  try {
    return await promisify(fs3.realpath)(path3);
  } catch {
    const normalizedPath = normalizePath2(path3);
    await fs3.promises.access(normalizedPath, fs3.constants.R_OK);
    return normalizedPath;
  }
}

function normalizePath2(path3) {
  return rtrim(normalize(path3), sep);
}

var SymlinkSupport, writeQueues, canFlush, COPY_MODE_MASK, Promises2;

var init_pfs = __esm({
  "src/vs/base/node/pfs.ts"() {
    init_async();
    init_extpath();
    init_normalization();
    init_path();
    init_platform();
    init_resources();
    init_uri();
    init_strings();
    ((SymlinkSupport2) => {
      async function stat(path3) {
        let lstats;
        try {
          lstats = await fs3.promises.lstat(path3);
          if (!lstats.isSymbolicLink()) {
            return { stat: lstats };
          }
        } catch {
        }
        try {
          const stats = await fs3.promises.stat(path3);
          return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : void 0 };
        } catch (error) {
          if (error.code === "ENOENT" && lstats) {
            return { stat: lstats, symbolicLink: { dangling: true } };
          }
          if (isWindows2 && error.code === "EACCES") {
            try {
              const stats = await fs3.promises.stat(await fs3.promises.readlink(path3));
              return { stat: stats, symbolicLink: { dangling: false } };
            } catch (error2) {
              if (error2.code === "ENOENT" && lstats) {
                return { stat: lstats, symbolicLink: { dangling: true } };
              }
              throw error2;
            }
          }
          throw error;
        }
      }
      SymlinkSupport2.stat = stat;
      async function existsFile(path3) {
        try {
          const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path3);
          return stat2.isFile() && symbolicLink?.dangling !== true;
        } catch {
        }
        return false;
      }
      SymlinkSupport2.existsFile = existsFile;
      async function existsDirectory(path3) {
        try {
          const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path3);
          return stat2.isDirectory() && symbolicLink?.dangling !== true;
        } catch {
        }
        return false;
      }
      SymlinkSupport2.existsDirectory = existsDirectory;
    })(SymlinkSupport || (SymlinkSupport = {}));
    writeQueues = new ResourceQueue();
    canFlush = true;
    COPY_MODE_MASK = 511;
    Promises2 = new class {
      //#region Implemented by node.js
      get read() {
        return (fd, buffer, offset, length, position) => {
          return new Promise((resolve2, reject) => {
            fs3.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
              if (err) {
                return reject(err);
              }
              return resolve2({ bytesRead, buffer: buffer2 });
            });
          });
        };
      }
      get write() {
        return (fd, buffer, offset, length, position) => {
          return new Promise((resolve2, reject) => {
            fs3.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer2) => {
              if (err) {
                return reject(err);
              }
              return resolve2({ bytesWritten, buffer: buffer2 });
            });
          });
        };
      }
      get fdatasync() {
        return promisify(fs3.fdatasync);
      }
      // not exposed as API in 22.x yet
      get open() {
        return promisify(fs3.open);
      }
      // changed to return `FileHandle` in promise API
      get close() {
        return promisify(fs3.close);
      }
      // not exposed as API due to the `FileHandle` return type of `open`
      get ftruncate() {
        return promisify(fs3.ftruncate);
      }
      // not exposed as API in 22.x yet
      //#endregion
      //#region Implemented by us
      async exists(path3) {
        try {
          await fs3.promises.access(path3);
          return true;
        } catch {
          return false;
        }
      }
      get readdir() {
        return readdir;
      }
      get readDirsInDir() {
        return readDirsInDir;
      }
      get writeFile() {
        return writeFile2;
      }
      get rm() {
        return rimraf;
      }
      get rename() {
        return rename;
      }
      get copy() {
        return copy;
      }
      get realpath() {
        return realpath2;
      }
      // `fs.promises.realpath` will use `fs.realpath.native` which we do not want
      //#endregion
    }();
  }
});
export { rimraf, rimrafMove, rimrafUnlink, readdir, doReaddir, safeReaddirWithFileTypes, handleDirectoryChildren, readDirsInDir, whenDeleted, writeFile2, configureFlushOnWrite, doWriteFileAndFlush, writeFileSync2, ensureWriteOptions, rename, renameWithRetry, copy, doCopy, doCopyDirectory, doCopyFile, doCopySymlink, realpath2, normalizePath2, fs3, tmpdir, promisify, SymlinkSupport, writeQueues, canFlush, COPY_MODE_MASK, Promises2, init_pfs };
