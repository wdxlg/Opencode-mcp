// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/clipboard/electron-browser/clipboardService.ts
import { isMacintosh } from "./module-0014.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/services/clipboard/electron-browser/clipboardService.ts
var NativeClipboardService = class {
  constructor(nativeHostService, logService) {
    this.nativeHostService = nativeHostService;
    this.logService = logService;
  }
  static {
    this.FILE_FORMAT = "code/file-list";
  }
  async triggerPaste(targetWindowId) {
    this.logService.trace("NativeClipboardService#triggerPaste called");
    return this.nativeHostService.triggerPaste({ targetWindowId });
  }
  async readImage() {
    return this.nativeHostService.readImage();
  }
  async writeText(text2, type) {
    this.logService.trace("NativeClipboardService#writeText called with type:", type, " with text.length:", text2.length);
    return this.nativeHostService.writeClipboardText(text2, type);
  }
  async readText(type) {
    this.logService.trace("NativeClipboardService#readText called with type:", type);
    return this.nativeHostService.readClipboardText(type);
  }
  async readFindText() {
    if (isMacintosh) {
      return this.nativeHostService.readClipboardFindText();
    }
    return "";
  }
  async writeFindText(text2) {
    if (isMacintosh) {
      return this.nativeHostService.writeClipboardFindText(text2);
    }
  }
  async writeResources(resources) {
    if (resources.length) {
      return this.nativeHostService.writeClipboardBuffer(NativeClipboardService.FILE_FORMAT, this.resourcesToBuffer(resources));
    }
  }
  async readResources() {
    return this.bufferToResources(await this.nativeHostService.readClipboardBuffer(NativeClipboardService.FILE_FORMAT));
  }
  async hasResources() {
    return this.nativeHostService.hasClipboard(NativeClipboardService.FILE_FORMAT);
  }
  resourcesToBuffer(resources) {
    return VSBuffer.fromString(resources.map((r2) => r2.toString()).join("\n"));
  }
  bufferToResources(buffer) {
    if (!buffer) {
      return [];
    }
    const bufferValue = buffer.toString();
    if (!bufferValue) {
      return [];
    }
    try {
      return bufferValue.split("\n").map((f) => URI.parse(f));
    } catch (error) {
      return [];
    }
  }
};

NativeClipboardService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, ILogService)
], NativeClipboardService);

registerSingleton(IClipboardService, NativeClipboardService, 1 /* Delayed */);
export { NativeClipboardService };
