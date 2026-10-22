// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostStoragePaths.ts
import { ExtensionStoragePaths } from "./module-0259.mjs";
import { Schemas } from "./module-0026.mjs";
import { join } from "./module-0019.mjs";
import { URI } from "./module-0025.mjs";
import { Disposable } from "./module-0011.mjs";
import { IntervalTimer, timeout } from "./module-0029.mjs";
import { Promises2 } from "./module-0033.mjs";


// src/vs/workbench/api/node/extHostStoragePaths.ts
import * as fs5 from "fs";

var ExtensionStoragePaths2 = class extends ExtensionStoragePaths {
  constructor() {
    super(...arguments);
    this._workspaceStorageLock = null;
  }
  async _getWorkspaceStorageURI(storageName) {
    const workspaceStorageURI = await super._getWorkspaceStorageURI(storageName);
    if (workspaceStorageURI.scheme !== Schemas.file) {
      return workspaceStorageURI;
    }
    if (this._environment.skipWorkspaceStorageLock) {
      this._logService.info(`Skipping acquiring lock for ${workspaceStorageURI.fsPath}.`);
      return workspaceStorageURI;
    }
    const workspaceStorageBase = workspaceStorageURI.fsPath;
    let attempt = 0;
    do {
      let workspaceStoragePath;
      if (attempt === 0) {
        workspaceStoragePath = workspaceStorageBase;
      } else {
        workspaceStoragePath = /[/\\]$/.test(workspaceStorageBase) ? `${workspaceStorageBase.substr(0, workspaceStorageBase.length - 1)}-${attempt}` : `${workspaceStorageBase}-${attempt}`;
      }
      await mkdir(workspaceStoragePath);
      const lockfile = join(workspaceStoragePath, "vscode.lock");
      const lock = await tryAcquireLock(this._logService, lockfile, false);
      if (lock) {
        this._workspaceStorageLock = lock;
        process.on("exit", () => {
          lock.dispose();
        });
        return URI.file(workspaceStoragePath);
      }
      attempt++;
    } while (attempt < 10);
    return workspaceStorageURI;
  }
  onWillDeactivateAll() {
    this._workspaceStorageLock?.setWillRelease(6e3);
  }
};

async function mkdir(dir) {
  try {
    await fs5.promises.stat(dir);
    return;
  } catch {
  }
  try {
    await fs5.promises.mkdir(dir, { recursive: true });
  } catch {
  }
}

var MTIME_UPDATE_TIME = 1e3;

var STALE_LOCK_TIME = 10 * 60 * 1e3;

var Lock = class extends Disposable {
  constructor(logService, filename) {
    super();
    this.logService = logService;
    this.filename = filename;
    this._timer = this._register(new IntervalTimer());
    this._timer.cancelAndSet(async () => {
      const contents = await readLockfileContents(logService, filename);
      if (!contents || contents.pid !== process.pid) {
        logService.info(`Lock '${filename}': The lock was lost unexpectedly.`);
        this._timer.cancel();
      }
      try {
        await fs5.promises.utimes(filename, /* @__PURE__ */ new Date(), /* @__PURE__ */ new Date());
      } catch (err) {
        logService.error(err);
        logService.info(`Lock '${filename}': Could not update mtime.`);
      }
    }, MTIME_UPDATE_TIME);
  }
  dispose() {
    super.dispose();
    try {
      fs5.unlinkSync(this.filename);
    } catch (err) {
    }
  }
  async setWillRelease(timeUntilReleaseMs) {
    this.logService.info(`Lock '${this.filename}': Marking the lockfile as scheduled to be released in ${timeUntilReleaseMs} ms.`);
    try {
      const contents = {
        pid: process.pid,
        willReleaseAt: Date.now() + timeUntilReleaseMs
      };
      await Promises2.writeFile(this.filename, JSON.stringify(contents), { flag: "w" });
    } catch (err) {
      this.logService.error(err);
    }
  }
};

async function tryAcquireLock(logService, filename, isSecondAttempt) {
  try {
    const contents2 = {
      pid: process.pid,
      willReleaseAt: 0
    };
    await Promises2.writeFile(filename, JSON.stringify(contents2), { flag: "wx" });
  } catch (err) {
    logService.error(err);
  }
  const contents = await readLockfileContents(logService, filename);
  if (!contents || contents.pid !== process.pid) {
    if (isSecondAttempt) {
      logService.info(`Lock '${filename}': Could not acquire lock, giving up.`);
      return null;
    }
    logService.info(`Lock '${filename}': Could not acquire lock, checking if the file is stale.`);
    return checkStaleAndTryAcquireLock(logService, filename);
  }
  logService.info(`Lock '${filename}': Lock acquired.`);
  return new Lock(logService, filename);
}

async function readLockfileContents(logService, filename) {
  let contents;
  try {
    contents = await fs5.promises.readFile(filename);
  } catch (err) {
    logService.error(err);
    return null;
  }
  try {
    return JSON.parse(String(contents));
  } catch (err) {
    logService.error(err);
    return null;
  }
}

async function readmtime(logService, filename) {
  let stats;
  try {
    stats = await fs5.promises.stat(filename);
  } catch (err) {
    logService.error(err);
    return 0;
  }
  return stats.mtime.getTime();
}

function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

async function checkStaleAndTryAcquireLock(logService, filename) {
  const contents = await readLockfileContents(logService, filename);
  if (!contents) {
    logService.info(`Lock '${filename}': Could not read pid of lock holder.`);
    return tryDeleteAndAcquireLock(logService, filename);
  }
  if (contents.willReleaseAt) {
    let timeUntilRelease = contents.willReleaseAt - Date.now();
    if (timeUntilRelease < 5e3) {
      if (timeUntilRelease > 0) {
        logService.info(`Lock '${filename}': The lockfile is scheduled to be released in ${timeUntilRelease} ms.`);
      } else {
        logService.info(`Lock '${filename}': The lockfile is scheduled to have been released.`);
      }
      while (timeUntilRelease > 0) {
        await timeout(Math.min(100, timeUntilRelease));
        const mtime = await readmtime(logService, filename);
        if (mtime === 0) {
          return tryDeleteAndAcquireLock(logService, filename);
        }
        timeUntilRelease = contents.willReleaseAt - Date.now();
      }
      return tryDeleteAndAcquireLock(logService, filename);
    }
  }
  if (!processExists(contents.pid)) {
    logService.info(`Lock '${filename}': The pid ${contents.pid} appears to be gone.`);
    return tryDeleteAndAcquireLock(logService, filename);
  }
  const mtime1 = await readmtime(logService, filename);
  const elapsed1 = Date.now() - mtime1;
  if (elapsed1 <= STALE_LOCK_TIME) {
    logService.info(`Lock '${filename}': The lock does not look stale, elapsed: ${elapsed1} ms, giving up.`);
    return null;
  }
  logService.info(`Lock '${filename}': The lock looks stale, waiting for 2s.`);
  await timeout(2e3);
  const mtime2 = await readmtime(logService, filename);
  const elapsed2 = Date.now() - mtime2;
  if (elapsed2 <= STALE_LOCK_TIME) {
    logService.info(`Lock '${filename}': The lock does not look stale, elapsed: ${elapsed2} ms, giving up.`);
    return null;
  }
  logService.info(`Lock '${filename}': The lock looks stale even after waiting for 2s.`);
  return tryDeleteAndAcquireLock(logService, filename);
}

async function tryDeleteAndAcquireLock(logService, filename) {
  logService.info(`Lock '${filename}': Deleting a stale lock.`);
  try {
    await fs5.promises.unlink(filename);
  } catch (err) {
  }
  return tryAcquireLock(logService, filename, true);
}
export { mkdir, tryAcquireLock, readLockfileContents, readmtime, processExists, checkStaleAndTryAcquireLock, tryDeleteAndAcquireLock, fs5, ExtensionStoragePaths2, MTIME_UPDATE_TIME, STALE_LOCK_TIME, Lock };
