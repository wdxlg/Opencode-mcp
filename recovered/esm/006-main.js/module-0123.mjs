// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/dialogs/electron-main/dialogMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Queue, init_async } from "./module-0034.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { init_labels, mnemonicButtonLabel } from "./module-0048.mjs";
import { Disposable, dispose, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { init_normalization, normalizeNFC } from "./module-0035.mjs";
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_dialogMainUtils, massageMessageBoxOptions } from "./module-0122.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { WORKSPACE_FILTER, init_workspace } from "./module-0076.mjs";


// src/vs/platform/dialogs/electron-main/dialogMainService.ts
import electron5 from "electron";

var IDialogMainService, DialogMainService;

var init_dialogMainService = __esm({
  "src/vs/platform/dialogs/electron-main/dialogMainService.ts"() {
    init_async();
    init_hash();
    init_labels();
    init_lifecycle();
    init_normalization();
    init_platform();
    init_pfs();
    init_nls();
    init_dialogMainUtils();
    init_instantiation();
    init_log();
    init_productService();
    init_workspace();
    IDialogMainService = createDecorator("dialogMainService");
    DialogMainService = class {
      constructor(logService, productService) {
        this.logService = logService;
        this.productService = productService;
        this.windowFileDialogLocks = /* @__PURE__ */ new Map();
        this.windowDialogQueues = /* @__PURE__ */ new Map();
        this.noWindowDialogueQueue = new Queue();
      }
      pickFileFolder(options, window2) {
        return this.doPick({ ...options, pickFolders: true, pickFiles: true, title: localize(2827, null) }, window2);
      }
      pickFolder(options, window2) {
        let optionsInternal = {
          ...options,
          pickFolders: true,
          title: localize(2829, null)
        };
        if (isWindows2) {
          optionsInternal = {
            ...optionsInternal,
            buttonLabel: mnemonicButtonLabel(localize(2832, null)).withMnemonic
          };
        }
        return this.doPick(optionsInternal, window2);
      }
      pickFile(options, window2) {
        return this.doPick({ ...options, pickFiles: true, title: localize(2828, null) }, window2);
      }
      pickWorkspace(options, window2) {
        const title = localize(2831, null);
        const buttonLabel = mnemonicButtonLabel(localize(2830, null)).withMnemonic;
        const filters = WORKSPACE_FILTER;
        return this.doPick({ ...options, pickFiles: true, title, filters, buttonLabel }, window2);
      }
      async doPick(options, window2) {
        const dialogOptions = {
          title: options.title,
          buttonLabel: options.buttonLabel,
          filters: options.filters,
          defaultPath: options.defaultPath
        };
        if (typeof options.pickFiles === "boolean" || typeof options.pickFolders === "boolean") {
          dialogOptions.properties = void 0;
          if (options.pickFiles && options.pickFolders) {
            dialogOptions.properties = ["multiSelections", "openDirectory", "openFile", "createDirectory"];
          }
        }
        if (!dialogOptions.properties) {
          dialogOptions.properties = ["multiSelections", options.pickFolders ? "openDirectory" : "openFile", "createDirectory"];
        }
        if (isMacintosh) {
          dialogOptions.properties.push("treatPackageAsDirectory");
        }
        const result = await this.showOpenDialog(dialogOptions, (window2 || electron5.BrowserWindow.getFocusedWindow()) ?? void 0);
        if (result?.filePaths && result.filePaths.length > 0) {
          return result.filePaths;
        }
        return void 0;
      }
      getWindowDialogQueue(window2) {
        if (window2) {
          let windowDialogQueue = this.windowDialogQueues.get(window2.id);
          if (!windowDialogQueue) {
            windowDialogQueue = new Queue();
            this.windowDialogQueues.set(window2.id, windowDialogQueue);
          }
          return windowDialogQueue;
        } else {
          return this.noWindowDialogueQueue;
        }
      }
      showMessageBox(rawOptions, window2) {
        return this.getWindowDialogQueue(window2).queue(async () => {
          const { options, buttonIndeces } = massageMessageBoxOptions(rawOptions, this.productService);
          let result = void 0;
          if (window2) {
            result = await electron5.dialog.showMessageBox(window2, options);
          } else {
            result = await electron5.dialog.showMessageBox(options);
          }
          return {
            response: buttonIndeces[result.response],
            checkboxChecked: result.checkboxChecked
          };
        });
      }
      async showSaveDialog(options, window2) {
        const fileDialogLock = this.acquireFileDialogLock(options, window2);
        if (!fileDialogLock) {
          this.logService.error("[DialogMainService]: file save dialog is already or will be showing for the window with the same configuration");
          return { canceled: true, filePath: "" };
        }
        try {
          return await this.getWindowDialogQueue(window2).queue(async () => {
            let result;
            if (window2) {
              result = await electron5.dialog.showSaveDialog(window2, options);
            } else {
              result = await electron5.dialog.showSaveDialog(options);
            }
            result.filePath = this.normalizePath(result.filePath);
            return result;
          });
        } finally {
          dispose(fileDialogLock);
        }
      }
      normalizePath(path4) {
        if (path4 && isMacintosh) {
          path4 = normalizeNFC(path4);
        }
        return path4;
      }
      normalizePaths(paths) {
        return paths.map((path4) => this.normalizePath(path4));
      }
      async showOpenDialog(options, window2) {
        if (options.defaultPath) {
          const pathExists = await Promises2.exists(options.defaultPath);
          if (!pathExists) {
            options.defaultPath = void 0;
          }
        }
        const fileDialogLock = this.acquireFileDialogLock(options, window2);
        if (!fileDialogLock) {
          this.logService.error("[DialogMainService]: file open dialog is already or will be showing for the window with the same configuration");
          return { canceled: true, filePaths: [] };
        }
        try {
          return await this.getWindowDialogQueue(window2).queue(async () => {
            let result;
            if (window2) {
              result = await electron5.dialog.showOpenDialog(window2, options);
            } else {
              result = await electron5.dialog.showOpenDialog(options);
            }
            result.filePaths = this.normalizePaths(result.filePaths);
            return result;
          });
        } finally {
          dispose(fileDialogLock);
        }
      }
      acquireFileDialogLock(options, window2) {
        if (!window2) {
          return Disposable.None;
        }
        this.logService.trace("[DialogMainService]: request to acquire file dialog lock", options);
        let windowFileDialogLocks = this.windowFileDialogLocks.get(window2.id);
        if (!windowFileDialogLocks) {
          windowFileDialogLocks = /* @__PURE__ */ new Set();
          this.windowFileDialogLocks.set(window2.id, windowFileDialogLocks);
        }
        const optionsHash = hash(options);
        if (windowFileDialogLocks.has(optionsHash)) {
          return void 0;
        }
        this.logService.trace("[DialogMainService]: new file dialog lock created", options);
        windowFileDialogLocks.add(optionsHash);
        return toDisposable(() => {
          this.logService.trace("[DialogMainService]: file dialog lock disposed", options);
          windowFileDialogLocks?.delete(optionsHash);
          if (windowFileDialogLocks?.size === 0) {
            this.windowFileDialogLocks.delete(window2.id);
          }
        });
      }
    };
    DialogMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IProductService)
    ], DialogMainService);
  }
});
export { electron5, IDialogMainService, DialogMainService, init_dialogMainService };
