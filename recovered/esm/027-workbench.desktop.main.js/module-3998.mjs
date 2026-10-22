// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/nativeScreenshotService.ts
import { encodeBase64 } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";


// src/vs/workbench/contrib/issue/electron-browser/nativeScreenshotService.ts
var NativeScreenshotService = class {
  constructor(nativeHostService) {
    this.nativeHostService = nativeHostService;
  }
  async captureScreenshot(rect) {
    const buffer = await this.nativeHostService.getScreenshot(rect);
    if (!buffer) {
      return void 0;
    }
    return `data:image/jpeg;base64,${encodeBase64(buffer)}`;
  }
};

NativeScreenshotService = __decorateClass([
  __decorateParam(0, INativeHostService)
], NativeScreenshotService);
export { NativeScreenshotService };
