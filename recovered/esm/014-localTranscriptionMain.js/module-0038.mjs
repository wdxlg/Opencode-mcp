// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/base/node/pfs.ts
import { isEqualOrParent, isRootOrDriveLetter, randomPath } from "./module-0022.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0013.mjs";
import { join, normalize, sep } from "./module-0018.mjs";
import { normalizeNFC } from "./module-0039.mjs";
import { ResourceQueue, timeout } from "./module-0026.mjs";
import { URI } from "./module-0023.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";
import { rtrim } from "./module-0021.mjs";


// src/vs/base/node/pfs.ts
import * as fs2 from "fs";

import { tmpdir as tmpdir2 } from "os";

import { promisify } from "util";


// src/vs/base/node/pfs.ts
async function rimraf(path, mode = 0 /* UNLINK */, moveToPath) {
  if (isRootOrDriveLetter(path)) {
    throw new Error("rimraf - will refuse to recursively delete root");
  }
  if (mode === 0 /* UNLINK */) {
    return rimrafUnlink(path);
  }
  return rimrafMove(path, moveToPath);
}

async function rimrafMove(path, moveToPath = randomPath(tmpdir2())) {
  try {
    try {
      await fs2.promises.rename(path, moveToPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }
      return rimrafUnlink(path);
    }
    rimrafUnlink(moveToPath).catch(() => {
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function rimrafUnlink(path) {
  return fs2.promises.rm(path, { recursive: true, force: true, maxRetries: 3 });
}

async function readdir(path, options) {
  try {
    return await doReaddir(path, options);
  } catch (error) {
    if (error.code === "ENOENT" && isWindows && isRootOrDriveLetter(path)) {
      try {
        return await doReaddir(`${path}.`, options);
      } catch {
      }
    }
    throw error;
  }
}

async function doReaddir(path, options) {
  return handleDirectoryChildren(await (options ? safeReaddirWithFileTypes(path) : fs2.promises.readdir(path)));
}

async function safeReaddirWithFileTypes(path) {
  try {
    return await fs2.promises.readdir(path, { withFileTypes: true });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("[node.js fs] readdir with filetypes failed with error: ", error);
    }
  }
  const result = [];
  const children = await readdir(path);
  for (const child of children) {
    let isFile = false;
    let isDirectory = false;
    let isSymbolicLink = false;
    try {
      const lstat = await fs2.promises.lstat(join(path, child));
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
    if (await SymlinkSupport.existsDirectory(join(dirPath, child))) {
      directories.push(child);
    }
  }
  return directories;
}

var SymlinkSupport;

((SymlinkSupport2) => {
  async function stat(path) {
    let lstats;
    try {
      lstats = await fs2.promises.lstat(path);
      if (!lstats.isSymbolicLink()) {
        return { stat: lstats };
      }
    } catch {
    }
    try {
      const stats = await fs2.promises.stat(path);
      return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : void 0 };
    } catch (error) {
      if (error.code === "ENOENT" && lstats) {
        return { stat: lstats, symbolicLink: { dangling: true } };
      }
      if (isWindows && error.code === "EACCES") {
        try {
          const stats = await fs2.promises.stat(await fs2.promises.readlink(path));
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
  async function existsFile(path) {
    try {
      const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat2.isFile() && symbolicLink?.dangling !== true;
    } catch {
    }
    return false;
  }
  SymlinkSupport2.existsFile = existsFile;
  async function existsDirectory(path) {
    try {
      const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat2.isDirectory() && symbolicLink?.dangling !== true;
    } catch {
    }
    return false;
  }
  SymlinkSupport2.existsDirectory = existsDirectory;
})(SymlinkSupport || (SymlinkSupport = {}));

var writeQueues = new ResourceQueue();

function writeFile2(path, data, options) {
  return writeQueues.queueFor(URI.file(path), () => {
    const ensuredOptions = ensureWriteOptions(options);
    return new Promise((resolve2, reject) => doWriteFileAndFlush(path, data, ensuredOptions, (error) => error ? reject(error) : resolve2()));
  }, extUriBiasedIgnorePathCase);
}

var canFlush = true;

function configureFlushOnWrite(enabled) {
  canFlush = enabled;
}

function doWriteFileAndFlush(path, data, options, callback) {
  if (!canFlush) {
    return fs2.writeFile(path, data, { mode: options.mode, flag: options.flag }, callback);
  }
  fs2.open(path, options.flag, options.mode, (openError, fd) => {
    if (openError) {
      return callback(openError);
    }
    fs2.writeFile(fd, data, (writeError) => {
      if (writeError) {
        return fs2.close(fd, () => callback(writeError));
      }
      fs2.fdatasync(fd, (syncError) => {
        if (syncError) {
          console.warn("[node.js fs] fdatasync is now disabled for this session because it failed: ", syncError);
          configureFlushOnWrite(false);
        }
        return fs2.close(fd, (closeError) => callback(closeError));
      });
    });
  });
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
    if (isWindows && typeof windowsRetryTimeout === "number") {
      await renameWithRetry(source, target, Date.now(), windowsRetryTimeout);
    } else {
      await fs2.promises.rename(source, target);
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
    return await fs2.promises.rename(source, target);
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

var COPY_MODE_MASK = 511;

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
  await fs2.promises.mkdir(target, { recursive: true, mode });
  const files = await readdir(source);
  for (const file of files) {
    await doCopy(join(source, file), join(target, file), payload);
  }
}

async function doCopyFile(source, target, mode) {
  await fs2.promises.copyFile(source, target);
  await fs2.promises.chmod(target, mode);
}

async function doCopySymlink(source, target, payload) {
  let linkTarget = await fs2.promises.readlink(source);
  if (isEqualOrParent(linkTarget, payload.root.source, !isLinux)) {
    linkTarget = join(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
  }
  await fs2.promises.symlink(linkTarget, target);
}

async function realpath2(path) {
  try {
    return await promisify(fs2.realpath)(path);
  } catch {
    const normalizedPath = normalizePath2(path);
    await fs2.promises.access(normalizedPath, fs2.constants.R_OK);
    return normalizedPath;
  }
}

function normalizePath2(path) {
  return rtrim(normalize(path), sep);
}

var Promises2 = new class {
  //#region Implemented by node.js
  get read() {
    return (fd, buffer, offset, length, position) => {
      return new Promise((resolve2, reject) => {
        fs2.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
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
        fs2.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer2) => {
          if (err) {
            return reject(err);
          }
          return resolve2({ bytesWritten, buffer: buffer2 });
        });
      });
    };
  }
  get fdatasync() {
    return promisify(fs2.fdatasync);
  }
  // not exposed as API in 22.x yet
  get open() {
    return promisify(fs2.open);
  }
  // changed to return `FileHandle` in promise API
  get close() {
    return promisify(fs2.close);
  }
  // not exposed as API due to the `FileHandle` return type of `open`
  get ftruncate() {
    return promisify(fs2.ftruncate);
  }
  // not exposed as API in 22.x yet
  //#endregion
  //#region Implemented by us
  async exists(path) {
    try {
      await fs2.promises.access(path);
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
export { rimraf, rimrafMove, rimrafUnlink, readdir, doReaddir, safeReaddirWithFileTypes, handleDirectoryChildren, readDirsInDir, writeFile2, configureFlushOnWrite, doWriteFileAndFlush, ensureWriteOptions, rename, renameWithRetry, copy, doCopy, doCopyDirectory, doCopyFile, doCopySymlink, realpath2, normalizePath2, fs2, tmpdir2, promisify, SymlinkSupport, writeQueues, canFlush, COPY_MODE_MASK, Promises2 };
