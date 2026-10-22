// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Event, init_event } from "./module-0021.mjs";
import { init_platform, isLinux, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IStateService, init_state } from "./module-0095.mjs";
import { hasNativeTitlebar, init_window } from "./module-0096.mjs";
import { init_window2 } from "./module-0097.mjs";
import { BaseWindow2, init_windowImpl } from "./module-0242.mjs";


// src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow.ts
import { BrowserWindow as BrowserWindow6 } from "electron";

var AuxiliaryWindow;

var init_auxiliaryWindow = __esm({
  "src/vs/platform/auxiliaryWindow/electron-main/auxiliaryWindow.ts"() {
    init_event();
    init_platform();
    init_configuration();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_state();
    init_window();
    init_window2();
    init_windowImpl();
    AuxiliaryWindow = class extends BaseWindow2 {
      constructor(webContents4, windowOptions, disableMaximize, environmentMainService, logService, configurationService, stateService, lifecycleMainService) {
        super(configurationService, stateService, environmentMainService, logService);
        this.webContents = webContents4;
        this.windowOptions = windowOptions;
        this.disableMaximize = disableMaximize;
        this.lifecycleMainService = lifecycleMainService;
        this.parentId = -1;
        this.stateApplied = false;
        this.id = this.webContents.id;
        this.tryClaimWindow();
      }
      get win() {
        if (!super.win) {
          this.tryClaimWindow();
        }
        return super.win;
      }
      tryClaimWindow(options) {
        if (this._store.isDisposed || this.webContents.isDestroyed()) {
          return;
        }
        const effectiveOptions = options ?? this.windowOptions;
        this.doTryClaimWindow(effectiveOptions);
        if (effectiveOptions && !this.stateApplied) {
          this.stateApplied = true;
          this.applyState({
            x: effectiveOptions.x,
            y: effectiveOptions.y,
            width: effectiveOptions.width,
            height: effectiveOptions.height,
            // We currently do not support restoring fullscreen state for auxiliary
            // windows because we do not get hold of the original `features` string
            // that contains that info in `window-fullscreen`. However, we can
            // probe the `options.show` value for whether the window should be maximized
            // or not because we never show maximized windows initially to reduce flicker.
            mode: effectiveOptions.show === false ? 0 /* Maximized */ : 1 /* Normal */
          });
        }
      }
      doTryClaimWindow(options) {
        if (this._win) {
          return;
        }
        const window2 = BrowserWindow6.fromWebContents(this.webContents);
        if (window2) {
          this.logService.trace("[aux window] Claimed browser window instance");
          this.setWin(window2, options);
          window2.setMenu(null);
          if ((isWindows2 || isLinux) && hasNativeTitlebar(
            this.configurationService,
            options?.titleBarStyle === "hidden" ? "custom" /* CUSTOM */ : void 0
            /* unknown */
          )) {
            window2.setAutoHideMenuBar(true);
          }
          this.lifecycleMainService.registerAuxWindow(this);
          if (options?.frame === false) {
            window2.setMinimumSize(1, 1);
            if (isMacintosh) {
              window2.setWindowButtonVisibility(false);
            }
          }
          if (options?.resizable === false) {
            window2.setResizable(false);
          }
          if (this.disableMaximize) {
            this._register(Event.fromNodeEventEmitter(window2, "maximize")(() => window2.unmaximize()));
          }
        }
      }
      matches(webContents4) {
        return this.webContents.id === webContents4.id;
      }
    };
    AuxiliaryWindow = __decorateClass([
      __decorateParam(3, IEnvironmentMainService),
      __decorateParam(4, ILogService),
      __decorateParam(5, IConfigurationService),
      __decorateParam(6, IStateService),
      __decorateParam(7, ILifecycleMainService)
    ], AuxiliaryWindow);
  }
});
export { BrowserWindow6, AuxiliaryWindow, init_auxiliaryWindow };
