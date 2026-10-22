// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/webview/electron-main/webviewMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { WebviewProtocolProvider, init_webviewProtocolProvider } from "./module-0236.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { IFileService, init_files } from "./module-0072.mjs";


// src/vs/platform/webview/electron-main/webviewMainService.ts
import { webContents as webContents3 } from "electron";

var WebviewMainService;

var init_webviewMainService = __esm({
  "src/vs/platform/webview/electron-main/webviewMainService.ts"() {
    init_event();
    init_lifecycle();
    init_webviewProtocolProvider();
    init_windows();
    init_files();
    WebviewMainService = class extends Disposable {
      constructor(fileService, windowsMainService) {
        super();
        this.windowsMainService = windowsMainService;
        this._onFoundInFrame = this._register(new Emitter());
        this.onFoundInFrame = this._onFoundInFrame.event;
        this._register(new WebviewProtocolProvider(fileService));
      }
      async setIgnoreMenuShortcuts(id2, enabled) {
        let contents;
        if (typeof id2.windowId === "number") {
          const { windowId } = id2;
          const window2 = this.windowsMainService.getWindowById(windowId);
          if (!window2?.win) {
            throw new Error(`Invalid windowId: ${windowId}`);
          }
          contents = window2.win.webContents;
        } else {
          const { webContentsId } = id2;
          contents = webContents3.fromId(webContentsId);
          if (!contents) {
            throw new Error(`Invalid webContentsId: ${webContentsId}`);
          }
        }
        if (!contents.isDestroyed()) {
          contents.setIgnoreMenuShortcuts(enabled);
        }
      }
      async findInFrame(windowId, frameName, text, options) {
        const initialFrame = this.getFrameByName(windowId, frameName);
        const frame = initialFrame;
        if (typeof frame.findInFrame === "function") {
          frame.findInFrame(text, {
            findNext: options.findNext,
            forward: options.forward
          });
          const foundInFrameHandler = (_, result) => {
            if (result.finalUpdate) {
              this._onFoundInFrame.fire(result);
              frame.removeListener("found-in-frame", foundInFrameHandler);
            }
          };
          frame.on("found-in-frame", foundInFrameHandler);
        }
      }
      async stopFindInFrame(windowId, frameName, options) {
        const initialFrame = this.getFrameByName(windowId, frameName);
        const frame = initialFrame;
        if (typeof frame.stopFindInFrame === "function") {
          frame.stopFindInFrame(options.keepSelection ? "keepSelection" : "clearSelection");
        }
      }
      getFrameByName(windowId, frameName) {
        const window2 = this.windowsMainService.getWindowById(windowId.windowId);
        if (!window2?.win) {
          throw new Error(`Invalid windowId: ${windowId}`);
        }
        const frame = window2.win.webContents.mainFrame.framesInSubtree.find((frame2) => {
          return frame2.name === frameName;
        });
        if (!frame) {
          throw new Error(`Unknown frame: ${frameName}`);
        }
        return frame;
      }
    };
    WebviewMainService = __decorateClass([
      __decorateParam(0, IFileService),
      __decorateParam(1, IWindowsMainService)
    ], WebviewMainService);
  }
});
export { webContents3, WebviewMainService, init_webviewMainService };
