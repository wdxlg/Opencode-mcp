// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/node/pfs.ts
import { __export } from "./module-0000.mjs";
import { isEqualOrParent, isRootOrDriveLetter, randomPath } from "./module-0024.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { basename, dirname, join, normalize, sep } from "./module-0019.mjs";
import { normalizeNFC } from "./module-0034.mjs";
import { ResourceQueue, timeout } from "./module-0029.mjs";
import { URI } from "./module-0025.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0027.mjs";
import { rtrim } from "./module-0023.mjs";


// src/vs/base/node/pfs.ts
var pfs_exports = {};

__export(pfs_exports, {
  Promises: () => Promises2,
  RimRafMode: () => RimRafMode,
  SymlinkSupport: () => SymlinkSupport,
  configureFlushOnWrite: () => configureFlushOnWrite,
  realcase: () => realcase,
  realpathSync: () => realpathSync2,
  whenDeleted: () => whenDeleted,
  writeFileSync: () => writeFileSync2
});

import * as fs from "fs";

import { tmpdir } from "os";

import { promisify } from "util";


// src/vs/base/node/pfs.ts
var RimRafMode = /* @__PURE__ */ ((RimRafMode2) => {
  RimRafMode2[RimRafMode2["UNLINK"] = 0] = "UNLINK";
  RimRafMode2[RimRafMode2["MOVE"] = 1] = "MOVE";
  return RimRafMode2;
})(RimRafMode || {});

async function rimraf(path, mode = 0 /* UNLINK */, moveToPath) {
  if (isRootOrDriveLetter(path)) {
    throw new Error("rimraf - will refuse to recursively delete root");
  }
  if (mode === 0 /* UNLINK */) {
    return rimrafUnlink(path);
  }
  return rimrafMove(path, moveToPath);
}

async function rimrafMove(path, moveToPath = randomPath(tmpdir())) {
  try {
    try {
      await fs.promises.rename(path, moveToPath);
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
  return fs.promises.rm(path, { recursive: true, force: true, maxRetries: 3 });
}

async function readdir(path, options2) {
  try {
    return await doReaddir(path, options2);
  } catch (error) {
    if (error.code === "ENOENT" && isWindows && isRootOrDriveLetter(path)) {
      try {
        return await doReaddir(`${path}.`, options2);
      } catch {
      }
    }
    throw error;
  }
}

async function doReaddir(path, options2) {
  return handleDirectoryChildren(await (options2 ? safeReaddirWithFileTypes(path) : fs.promises.readdir(path)));
}

async function safeReaddirWithFileTypes(path) {
  try {
    return await fs.promises.readdir(path, { withFileTypes: true });
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
      const lstat2 = await fs.promises.lstat(join(path, child));
      isFile = lstat2.isFile();
      isDirectory = lstat2.isDirectory();
      isSymbolicLink = lstat2.isSymbolicLink();
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

function whenDeleted(path, intervalMs = 1e3) {
  return new Promise((resolve2) => {
    let running = false;
    const interval = setInterval(() => {
      if (!running) {
        running = true;
        fs.access(path, (err) => {
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

var SymlinkSupport;

((SymlinkSupport2) => {
  async function stat2(path) {
    let lstats;
    try {
      lstats = await fs.promises.lstat(path);
      if (!lstats.isSymbolicLink()) {
        return { stat: lstats };
      }
    } catch {
    }
    try {
      const stats = await fs.promises.stat(path);
      return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : void 0 };
    } catch (error) {
      if (error.code === "ENOENT" && lstats) {
        return { stat: lstats, symbolicLink: { dangling: true } };
      }
      if (isWindows && error.code === "EACCES") {
        try {
          const stats = await fs.promises.stat(await fs.promises.readlink(path));
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
  SymlinkSupport2.stat = stat2;
  async function existsFile(path) {
    try {
      const { stat: stat3, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat3.isFile() && symbolicLink?.dangling !== true;
    } catch {
    }
    return false;
  }
  SymlinkSupport2.existsFile = existsFile;
  async function existsDirectory(path) {
    try {
      const { stat: stat3, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat3.isDirectory() && symbolicLink?.dangling !== true;
    } catch {
    }
    return false;
  }
  SymlinkSupport2.existsDirectory = existsDirectory;
})(SymlinkSupport || (SymlinkSupport = {}));

var writeQueues = new ResourceQueue();

function writeFile2(path, data, options2) {
  return writeQueues.queueFor(URI.file(path), () => {
    const ensuredOptions = ensureWriteOptions(options2);
    return new Promise((resolve2, reject) => doWriteFileAndFlush(path, data, ensuredOptions, (error) => error ? reject(error) : resolve2()));
  }, extUriBiasedIgnorePathCase);
}

var canFlush = true;

function configureFlushOnWrite(enabled) {
  canFlush = enabled;
}

function doWriteFileAndFlush(path, data, options2, callback) {
  if (!canFlush) {
    return fs.writeFile(path, data, { mode: options2.mode, flag: options2.flag }, callback);
  }
  fs.open(path, options2.flag, options2.mode, (openError, fd) => {
    if (openError) {
      return callback(openError);
    }
    fs.writeFile(fd, data, (writeError) => {
      if (writeError) {
        return fs.close(fd, () => callback(writeError));
      }
      fs.fdatasync(fd, (syncError) => {
        if (syncError) {
          console.warn("[node.js fs] fdatasync is now disabled for this session because it failed: ", syncError);
          configureFlushOnWrite(false);
        }
        return fs.close(fd, (closeError) => callback(closeError));
      });
    });
  });
}

function writeFileSync2(path, data, options2) {
  const ensuredOptions = ensureWriteOptions(options2);
  if (!canFlush) {
    return fs.writeFileSync(path, data, { mode: ensuredOptions.mode, flag: ensuredOptions.flag });
  }
  const fd = fs.openSync(path, ensuredOptions.flag, ensuredOptions.mode);
  try {
    fs.writeFileSync(fd, data);
    try {
      fs.fdatasyncSync(fd);
    } catch (syncError) {
      console.warn("[node.js fs] fdatasyncSync is now disabled for this session because it failed: ", syncError);
      configureFlushOnWrite(false);
    }
  } finally {
    fs.closeSync(fd);
  }
}

function ensureWriteOptions(options2) {
  if (!options2) {
    return { mode: 438, flag: "w" };
  }
  return {
    mode: typeof options2.mode === "number" ? options2.mode : 438,
    flag: typeof options2.flag === "string" ? options2.flag : "w"
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
      await fs.promises.rename(source, target);
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
    return await fs.promises.rename(source, target);
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
        const { stat: stat2 } = await SymlinkSupport.stat(target);
        if (!stat2.isFile()) {
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

async function copy(source, target, options2) {
  return doCopy(source, target, { root: { source, target }, options: options2, handledSourcePaths: /* @__PURE__ */ new Set() });
}

var COPY_MODE_MASK = 511;

async function doCopy(source, target, payload) {
  if (payload.handledSourcePaths.has(source)) {
    return;
  } else {
    payload.handledSourcePaths.add(source);
  }
  const { stat: stat2, symbolicLink } = await SymlinkSupport.stat(source);
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
  if (stat2.isDirectory()) {
    return doCopyDirectory(source, target, stat2.mode & COPY_MODE_MASK, payload);
  } else {
    return doCopyFile(source, target, stat2.mode & COPY_MODE_MASK);
  }
}

async function doCopyDirectory(source, target, mode, payload) {
  await fs.promises.mkdir(target, { recursive: true, mode });
  const files = await readdir(source);
  for (const file of files) {
    await doCopy(join(source, file), join(target, file), payload);
  }
}

async function doCopyFile(source, target, mode) {
  await fs.promises.copyFile(source, target);
  await fs.promises.chmod(target, mode);
}

async function doCopySymlink(source, target, payload) {
  let linkTarget = await fs.promises.readlink(source);
  if (isEqualOrParent(linkTarget, payload.root.source, !isLinux)) {
    linkTarget = join(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
  }
  await fs.promises.symlink(linkTarget, target);
}

async function realcase(path, token) {
  if (isLinux) {
    return path;
  }
  const dir = dirname(path);
  if (path === dir) {
    return path;
  }
  const name = (basename(path) || path).toLowerCase();
  try {
    if (token?.isCancellationRequested) {
      return null;
    }
    const entries = await Promises2.readdir(dir);
    const found = entries.filter((e) => e.toLowerCase() === name);
    if (found.length === 1) {
      const prefix = await realcase(dir, token);
      if (prefix) {
        return join(prefix, found[0]);
      }
    } else if (found.length > 1) {
      const ix = found.indexOf(name);
      if (ix >= 0) {
        const prefix = await realcase(dir, token);
        if (prefix) {
          return join(prefix, found[ix]);
        }
      }
    }
  } catch {
  }
  return null;
}

async function realpath2(path) {
  try {
    return await promisify(fs.realpath)(path);
  } catch {
    const normalizedPath = normalizePath2(path);
    await fs.promises.access(normalizedPath, fs.constants.R_OK);
    return normalizedPath;
  }
}

function realpathSync2(path) {
  try {
    return fs.realpathSync(path);
  } catch {
    const normalizedPath = normalizePath2(path);
    fs.accessSync(normalizedPath, fs.constants.R_OK);
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
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
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
        fs.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer2) => {
          if (err) {
            return reject(err);
          }
          return resolve2({ bytesWritten, buffer: buffer2 });
        });
      });
    };
  }
  get fdatasync() {
    return promisify(fs.fdatasync);
  }
  // not exposed as API in 22.x yet
  get open() {
    return promisify(fs.open);
  }
  // changed to return `FileHandle` in promise API
  get close() {
    return promisify(fs.close);
  }
  // not exposed as API due to the `FileHandle` return type of `open`
  get ftruncate() {
    return promisify(fs.ftruncate);
  }
  // not exposed as API in 22.x yet
  //#endregion
  //#region Implemented by us
  async exists(path) {
    try {
      await fs.promises.access(path);
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
export { rimraf, rimrafMove, rimrafUnlink, readdir, doReaddir, safeReaddirWithFileTypes, handleDirectoryChildren, readDirsInDir, whenDeleted, writeFile2, configureFlushOnWrite, doWriteFileAndFlush, writeFileSync2, ensureWriteOptions, rename, renameWithRetry, copy, doCopy, doCopyDirectory, doCopyFile, doCopySymlink, realcase, realpath2, realpathSync2, normalizePath2, pfs_exports, fs, tmpdir, promisify, RimRafMode, SymlinkSupport, writeQueues, canFlush, COPY_MODE_MASK, Promises2 };
