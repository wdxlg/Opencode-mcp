// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/languagePackCachedDataCleaner.ts
import { Disposable } from "./module-0013.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { join } from "./module-0023.mjs";
import { Promises2 } from "./module-0038.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ILogService } from "./module-0044.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/languagePackCachedDataCleaner.ts
import { promises as promises3 } from "fs";


// src/vs/code/electron-utility/sharedProcess/contrib/languagePackCachedDataCleaner.ts
var LanguagePackCachedDataCleaner = class extends Disposable {
  constructor(environmentService, logService, productService) {
    super();
    this.environmentService = environmentService;
    this.logService = logService;
    this.dataMaxAge = productService.quality !== "stable" ? 1e3 * 60 * 60 * 24 * 7 : 1e3 * 60 * 60 * 24 * 30 * 3;
    if (this.environmentService.isBuilt) {
      const scheduler = this._register(new RunOnceScheduler(
        () => {
          this.cleanUpLanguagePackCache();
        },
        40 * 1e3
        /* after 40s */
      ));
      scheduler.schedule();
    }
  }
  /**
   * Public for testing.
   */
  async cleanUpLanguagePackCache() {
    this.logService.trace("[language pack cache cleanup]: Starting to clean up unused language packs.");
    try {
      const installed = /* @__PURE__ */ Object.create(null);
      const metaData = JSON.parse(await promises3.readFile(join(this.environmentService.userDataPath, "languagepacks.json"), "utf8"));
      for (const locale of Object.keys(metaData)) {
        const entry = metaData[locale];
        installed[`${entry.hash}.${locale}`] = true;
      }
      const cacheDir = join(this.environmentService.userDataPath, "clp");
      const cacheDirExists = await Promises2.exists(cacheDir);
      if (!cacheDirExists) {
        return;
      }
      const entries = await Promises2.readdir(cacheDir);
      for (const entry of entries) {
        if (installed[entry]) {
          this.logService.trace(`[language pack cache cleanup]: Skipping folder ${entry}. Language pack still in use.`);
          continue;
        }
        this.logService.trace(`[language pack cache cleanup]: Removing unused language pack: ${entry}`);
        await Promises2.rm(join(cacheDir, entry));
      }
      const now = Date.now();
      for (const packEntry of Object.keys(installed)) {
        const folder = join(cacheDir, packEntry);
        let entries2;
        try {
          entries2 = await Promises2.readdir(folder);
        } catch (error) {
          if (error.code === "ENOENT") {
            continue;
          }
          throw error;
        }
        for (const entry of entries2) {
          if (entry === "tcf.json") {
            continue;
          }
          const candidate = join(folder, entry);
          const stat = await promises3.stat(candidate);
          if (stat.isDirectory() && now - stat.mtime.getTime() > this.dataMaxAge) {
            this.logService.trace(`[language pack cache cleanup]: Removing language pack cache folder: ${join(packEntry, entry)}`);
            await Promises2.rm(candidate);
          }
        }
      }
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};

LanguagePackCachedDataCleaner = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService)
], LanguagePackCachedDataCleaner);
export { promises3, LanguagePackCachedDataCleaner };
