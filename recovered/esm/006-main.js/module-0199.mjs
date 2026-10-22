// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/launch/electron-main/launchMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { coalesce, init_arrays } from "./module-0013.mjs";
import { init_platform, isMacintosh } from "./module-0006.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_pfs, whenDeleted } from "./module-0036.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { init_argvHelper, isLaunchedFromCli } from "./module-0163.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IURLService, init_url } from "./module-0198.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";


// src/vs/platform/launch/electron-main/launchMainService.ts
import { app as app6 } from "electron";

var ID3, ILaunchMainService, LaunchMainService;

var init_launchMainService = __esm({
  "src/vs/platform/launch/electron-main/launchMainService.ts"() {
    init_arrays();
    init_platform();
    init_uri();
    init_pfs();
    init_configuration();
    init_argvHelper();
    init_instantiation();
    init_log();
    init_url();
    init_windows();
    ID3 = "launchMainService";
    ILaunchMainService = createDecorator(ID3);
    LaunchMainService = class {
      constructor(logService, windowsMainService, urlService, configurationService) {
        this.logService = logService;
        this.windowsMainService = windowsMainService;
        this.urlService = urlService;
        this.configurationService = configurationService;
      }
      async start(args2, userEnv) {
        this.logService.trace("Received data from other instance: ", args2, userEnv);
        if (isMacintosh) {
          app6.focus({ steal: true });
        }
        const urlsToOpen = this.parseOpenUrl(args2);
        if (urlsToOpen.length) {
          let whenWindowReady = Promise.resolve();
          if (this.windowsMainService.getWindowCount() === 0) {
            const window2 = (await this.windowsMainService.openEmptyWindow({ context: 4 /* DESKTOP */ })).at(0);
            if (window2) {
              whenWindowReady = window2.ready();
            }
          }
          whenWindowReady.then(() => {
            for (const { uri, originalUrl } of urlsToOpen) {
              this.urlService.open(uri, { originalUrl });
            }
          });
        } else {
          return this.startOpenWindow(args2, userEnv);
        }
      }
      parseOpenUrl(args2) {
        if (args2["open-url"] && args2._urls && args2._urls.length > 0) {
          return coalesce(args2._urls.map((url) => {
            try {
              return { uri: URI.parse(url), originalUrl: url };
            } catch (err) {
              return null;
            }
          }));
        }
        return [];
      }
      async startOpenWindow(args2, userEnv) {
        const context = isLaunchedFromCli(userEnv) ? 0 /* CLI */ : 4 /* DESKTOP */;
        let usedWindows = [];
        const waitMarkerFileURI = args2.wait && args2.waitMarkerFilePath ? URI.file(args2.waitMarkerFilePath) : void 0;
        const remoteAuthority = args2.remote || void 0;
        const baseConfig = {
          context,
          cli: args2,
          /**
           * When opening a new window from a second instance that sent args and env
           * over to this instance, we want to preserve the environment only if that second
           * instance was spawned from the CLI or used the `--preserve-env` flag (example:
           * when using `open -n "VSCode.app" --args --preserve-env WORKSPACE_FOLDER`).
           *
           * This is done to ensure that the second window gets treated exactly the same
           * as the first window, for example, it gets the same resolved user shell environment.
           *
           * https://github.com/microsoft/vscode/issues/194736
           */
          userEnv: args2["preserve-env"] || context === 0 /* CLI */ ? userEnv : void 0,
          waitMarkerFileURI,
          remoteAuthority,
          forceProfile: args2.profile,
          forceTempProfile: args2["profile-temp"]
        };
        if (args2.extensionDevelopmentPath) {
          await this.windowsMainService.openExtensionDevelopmentHostWindow(args2.extensionDevelopmentPath, baseConfig);
        } else if (args2["agents"]) {
          usedWindows = await this.windowsMainService.openAgentsWindow(baseConfig);
        } else if (!args2._.length && !args2["folder-uri"] && !args2["file-uri"]) {
          let openNewWindow = false;
          if (args2["new-window"] || baseConfig.forceProfile || baseConfig.forceTempProfile) {
            openNewWindow = true;
          } else if (args2["reuse-window"]) {
            openNewWindow = false;
          } else {
            const windowConfig = this.configurationService.getValue("window");
            const openWithoutArgumentsInNewWindowConfig = windowConfig?.openWithoutArgumentsInNewWindow || "default";
            switch (openWithoutArgumentsInNewWindowConfig) {
              case "on":
                openNewWindow = true;
                break;
              case "off":
                openNewWindow = false;
                break;
              default:
                openNewWindow = !isMacintosh;
            }
          }
          if (openNewWindow) {
            usedWindows = await this.windowsMainService.open({
              ...baseConfig,
              forceNewWindow: true,
              forceEmpty: true
            });
          } else {
            const lastActive = this.windowsMainService.getLastActiveWindow();
            if (lastActive) {
              this.windowsMainService.openExistingWindow(lastActive, baseConfig);
              usedWindows = [lastActive];
            } else {
              usedWindows = await this.windowsMainService.open({
                ...baseConfig,
                forceEmpty: true
              });
            }
          }
        } else {
          usedWindows = await this.windowsMainService.open({
            ...baseConfig,
            forceNewWindow: args2["new-window"],
            preferNewWindow: !args2["reuse-window"] && !args2.wait,
            forceReuseWindow: args2["reuse-window"],
            diffMode: args2.diff,
            mergeMode: args2.merge,
            addMode: args2.add,
            removeMode: args2.remove,
            noRecentEntry: !!args2["skip-add-to-recently-opened"],
            gotoLineMode: args2.goto
          });
        }
        if (waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
          return Promise.race([
            usedWindows[0].whenClosedOrLoaded,
            whenDeleted(waitMarkerFileURI.fsPath)
          ]).then(() => void 0, () => void 0);
        }
      }
      async getMainProcessId() {
        this.logService.trace("Received request for process ID from other instance.");
        return process.pid;
      }
    };
    LaunchMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, IURLService),
      __decorateParam(3, IConfigurationService)
    ], LaunchMainService);
  }
});
export { app6, ID3, ILaunchMainService, LaunchMainService, init_launchMainService };
