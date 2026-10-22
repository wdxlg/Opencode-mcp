// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/splash/electron-browser/splash.contribution.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ISplashStorageService } from "./module-4092.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { PartsSplash } from "./module-4093.mjs";


// src/vs/workbench/contrib/splash/electron-browser/splash.contribution.ts
var SplashStorageService = class {
  constructor(nativeHostService) {
    this.saveWindowSplash = nativeHostService.saveWindowSplash.bind(nativeHostService);
  }
};

SplashStorageService = __decorateClass([
  __decorateParam(0, INativeHostService)
], SplashStorageService);

registerSingleton(ISplashStorageService, SplashStorageService, 1 /* Delayed */);

registerWorkbenchContribution2(
  PartsSplash.ID,
  PartsSplash,
  WorkbenchPhase.BlockStartup
);
export { SplashStorageService };
