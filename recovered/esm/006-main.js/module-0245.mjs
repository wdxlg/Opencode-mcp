// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/cssDev/node/cssDevService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_path, relative2 } from "./module-0008.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { init_ripgrep, rgDiskPath } from "./module-0244.mjs";
import { StopWatch, init_stopwatch } from "./module-0020.mjs";
import { IEnvironmentService, init_environment } from "./module-0071.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/cssDev/node/cssDevService.ts
import { spawn as spawn6 } from "child_process";

var ICSSDevelopmentService, CSSDevelopmentService;

var init_cssDevService = __esm({
  "src/vs/platform/cssDev/node/cssDevService.ts"() {
    init_path();
    init_network();
    init_ripgrep();
    init_stopwatch();
    init_environment();
    init_instantiation();
    init_log();
    ICSSDevelopmentService = createDecorator("ICSSDevelopmentService");
    CSSDevelopmentService = class {
      constructor(envService, logService) {
        this.envService = envService;
        this.logService = logService;
      }
      get isEnabled() {
        return !this.envService.isBuilt;
      }
      getCssModules() {
        this._cssModules ??= this.computeCssModules();
        return this._cssModules;
      }
      async computeCssModules() {
        if (!this.isEnabled) {
          return [];
        }
        const rgBinPath = await rgDiskPath();
        return await new Promise((resolve3) => {
          const sw = StopWatch.create();
          const chunks = [];
          const basePath = FileAccess.asFileUri("").fsPath;
          const process2 = spawn6(rgBinPath, ["-g", "**/*.css", "--files", "--no-ignore", basePath], {});
          process2.stdout.on("data", (data) => {
            chunks.push(data);
          });
          process2.on("error", (err) => {
            this.logService.error("[CSS_DEV] FAILED to compute CSS data", err);
            resolve3([]);
          });
          process2.on("close", () => {
            const data = Buffer.concat(chunks).toString("utf8");
            const result = data.split("\n").filter(Boolean).map((path4) => relative2(basePath, path4).replace(/\\/g, "/")).filter(Boolean).sort();
            if (result.some((path4) => path4.indexOf("vs/") !== 0)) {
              this.logService.error(`[CSS_DEV] Detected invalid paths in css modules, raw output: ${data}`);
            }
            resolve3(result);
            this.logService.info(`[CSS_DEV] DONE, ${result.length} css modules (${Math.round(sw.elapsed())}ms)`);
          });
        });
      }
    };
    CSSDevelopmentService = __decorateClass([
      __decorateParam(0, IEnvironmentService),
      __decorateParam(1, ILogService)
    ], CSSDevelopmentService);
  }
});
export { spawn6, ICSSDevelopmentService, CSSDevelopmentService, init_cssDevService };
