// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/codeCacheCleaner.ts
import { Disposable } from "./module-0013.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { basename, dirname, join } from "./module-0023.mjs";
import { Promises2 } from "./module-0038.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0045.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/codeCacheCleaner.ts
import { promises as promises2 } from "fs";


// src/vs/code/electron-utility/sharedProcess/contrib/codeCacheCleaner.ts
var CodeCacheCleaner = class extends Disposable {
  constructor(currentCodeCachePath, productService, logService) {
    super();
    this.logService = logService;
    this.dataMaxAge = productService.quality !== "stable" ? 1e3 * 60 * 60 * 24 * 7 : 1e3 * 60 * 60 * 24 * 30 * 3;
    if (currentCodeCachePath) {
      const scheduler = this._register(new RunOnceScheduler(
        () => {
          this.cleanUpCodeCaches(currentCodeCachePath);
        },
        30 * 1e3
        /* after 30s */
      ));
      scheduler.schedule();
    }
  }
  async cleanUpCodeCaches(currentCodeCachePath) {
    this.logService.trace("[code cache cleanup]: Starting to clean up old code cache folders.");
    try {
      const now = Date.now();
      const codeCacheRootPath = dirname(currentCodeCachePath);
      const currentCodeCache = basename(currentCodeCachePath);
      const codeCaches = await Promises2.readdir(codeCacheRootPath);
      await Promise.all(codeCaches.map(async (codeCache) => {
        if (codeCache === currentCodeCache) {
          return;
        }
        const codeCacheEntryPath = join(codeCacheRootPath, codeCache);
        const codeCacheEntryStat = await promises2.stat(codeCacheEntryPath);
        if (codeCacheEntryStat.isDirectory() && now - codeCacheEntryStat.mtime.getTime() > this.dataMaxAge) {
          this.logService.trace(`[code cache cleanup]: Removing code cache folder ${codeCache}.`);
          return Promises2.rm(codeCacheEntryPath);
        }
      }));
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};

CodeCacheCleaner = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, ILogService)
], CodeCacheCleaner);
export { promises2, CodeCacheCleaner };
