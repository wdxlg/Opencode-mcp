// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/main.ts
import { __require, __toESM } from "./module-0000.mjs";
import { require_minimist } from "./module-0002.mjs";
import { init_jsonc, parse } from "./module-0003.mjs";
import { getUserDataPath, init_userDataPath } from "./module-0004.mjs";
import { init_performance, mark } from "./module-0001.mjs";
import { addUNCHostToAllowlist, getUNCHost, init_unc } from "./module-0037.mjs";
import { configurePortable } from "./module-0394.mjs";
import { product } from "./module-0396.mjs";
import { resolveNLSConfiguration } from "./module-0397.mjs";
import { bootstrapESM } from "./module-0395.mjs";
import { init_main, main_exports } from "./module-0392.mjs";


// src/main.ts
import * as path3 from "node:path";

import * as fs14 from "original-fs";

import * as os5 from "node:os";

import { performance as performance2 } from "node:perf_hooks";


// src/main.ts
var import_minimist2 = __toESM(require_minimist(), 1);

import { app as app15, protocol as protocol3, crashReporter, Menu as Menu5, contentTracing as contentTracing2 } from "electron";

init_jsonc();

init_userDataPath();

init_performance();


// src/main.ts
init_unc();

mark("code/didStartMain");

mark("code/willLoadMainBundle", {
  // When built, the main bundle is a single JS file with all
  // dependencies inlined. As such, we mark `willLoadMainBundle`
  // as the start of the main bundle loading process.
  startTime: Math.floor(performance2.timeOrigin)
});

mark("code/didLoadMainBundle");

var portable = configurePortable(product);

var args = parseCLIArgs();

var argvConfig = configureCommandlineSwitchesSync(args);

if (args["sandbox"] && !args["disable-chromium-sandbox"] && !argvConfig["disable-chromium-sandbox"]) {
  app15.enableSandbox();
} else if (app15.commandLine.hasSwitch("no-sandbox") && !app15.commandLine.hasSwitch("disable-gpu-sandbox")) {
  app15.commandLine.appendSwitch("disable-gpu-sandbox");
} else {
  app15.commandLine.appendSwitch("no-sandbox");
  app15.commandLine.appendSwitch("disable-gpu-sandbox");
}

var userDataPath = getUserDataPath(args, product.nameShort ?? "code-oss-dev");

if (process.platform === "win32") {
  const userDataUNCHost = getUNCHost(userDataPath);
  if (userDataUNCHost) {
    addUNCHostToAllowlist(userDataUNCHost);
  }
}

app15.setPath("userData", userDataPath);

clearStaleBuildCaches(userDataPath);

appendStartupDiag(userDataPath, `platform ${os5.platform()} ${os5.release()} electron ${process.versions.electron} chrome ${process.versions.chrome}`);

migrateBrokenPaintWatchdogFallback(userDataPath);

applyGpuCrashFallback(userDataPath);

registerGpuCrashFallbackListeners(userDataPath);

registerFirstFrameWatchdog(userDataPath);

var codeCachePath = getCodeCachePath();

Menu5.setApplicationMenu(null);

mark("code/willStartCrashReporter");

if (args["crash-reporter-directory"] || argvConfig["enable-crash-reporter"] && !args["disable-crash-reporter"]) {
  configureCrashReporter();
}

mark("code/didStartCrashReporter");

if (portable.isPortable) {
  app15.setAppLogsPath(path3.join(userDataPath, "logs"));
}

protocol3.registerSchemesAsPrivileged([
  {
    scheme: "vscode-webview",
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, allowServiceWorkers: true, codeCache: true }
  },
  {
    scheme: "vscode-file",
    privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: true, codeCache: true }
  },
  {
    scheme: "vscode-remote-resource",
    privileges: { secure: true, supportFetchAPI: true, corsEnabled: true }
  },
  {
    scheme: "vscode-managed-remote-resource",
    privileges: { secure: true, supportFetchAPI: true, corsEnabled: true }
  }
]);

registerListeners();

var nlsConfigurationPromise = void 0;

var osLocale = processZhLocale((app15.getPreferredSystemLanguages()?.[0] ?? "en").toLowerCase());

var userLocale = getUserDefinedLocale(argvConfig) ?? "zh-cn";

if (userLocale) {
  nlsConfigurationPromise = resolveNLSConfiguration({
    userLocale,
    osLocale,
    commit: getNLSBuildKey(),
    userDataPath,
    nlsMetadataPath: import.meta.dirname
  });
}

if (process.platform === "win32" || process.platform === "linux") {
  const electronLocale = !userLocale || userLocale === "qps-ploc" ? "en" : userLocale;
  app15.commandLine.appendSwitch("lang", electronLocale);
}

app15.once("ready", function() {
  if (args["trace"]) {
    let traceOptions;
    if (args["trace-memory-infra"]) {
      const customCategories = args["trace-category-filter"]?.split(",") || [];
      customCategories.push("disabled-by-default-memory-infra", "disabled-by-default-memory-infra.v8.code_stats");
      traceOptions = {
        included_categories: customCategories,
        excluded_categories: ["*"],
        memory_dump_config: {
          allowed_dump_modes: ["light", "detailed"],
          triggers: [
            {
              type: "periodic_interval",
              mode: "detailed",
              min_time_between_dumps_ms: 1e4
            },
            {
              type: "periodic_interval",
              mode: "light",
              min_time_between_dumps_ms: 1e3
            }
          ]
        }
      };
    } else {
      traceOptions = {
        categoryFilter: args["trace-category-filter"] || "*",
        traceOptions: args["trace-options"] || "record-until-full,enable-sampling"
      };
    }
    contentTracing2.startRecording(traceOptions).finally(() => onReady());
  } else {
    onReady();
  }
});

async function onReady() {
  mark("code/mainAppReady");
  try {
    try {
      appendStartupDiag(userDataPath, "gpu feature status: " + JSON.stringify(app15.getGPUFeatureStatus()));
    } catch {
    }
    const [, nlsConfig] = await Promise.all([
      mkdirpIgnoreError(codeCachePath),
      resolveNlsConfiguration()
    ]);
    await startup(codeCachePath, nlsConfig);
  } catch (error) {
    console.error(error);
  }
}

async function startup(codeCachePath2, nlsConfig) {
  process.env["VSCODE_NLS_CONFIG"] = JSON.stringify(nlsConfig);
  process.env["VSCODE_CODE_CACHE_PATH"] = codeCachePath2 || "";
  await bootstrapESM();
  await Promise.resolve().then(() => (init_main(), main_exports));
  mark("code/didRunMainBundle");
}

function configureCommandlineSwitchesSync(cliArgs) {
  const SUPPORTED_ELECTRON_SWITCHES = [
    // alias from us for --disable-gpu
    "disable-hardware-acceleration",
    // override for the color profile to use
    "force-color-profile",
    // disable LCD font rendering, a Chromium flag
    "disable-lcd-text",
    // bypass any specified proxy for the given semi-colon-separated list of hosts
    "proxy-bypass-list",
    "remote-debugging-port"
  ];
  if (process.platform === "linux") {
    SUPPORTED_ELECTRON_SWITCHES.push("force-renderer-accessibility");
    SUPPORTED_ELECTRON_SWITCHES.push("password-store");
  }
  const SUPPORTED_MAIN_PROCESS_SWITCHES = [
    // Persistently enable proposed api via argv.json: https://github.com/microsoft/vscode/issues/99775
    "enable-proposed-api",
    // Log level to use. Default is 'info'. Allowed values are 'error', 'warn', 'info', 'debug', 'trace', 'off'.
    "log-level",
    // Use an in-memory storage for secrets
    "use-inmemory-secretstorage",
    // Enables display tracking to restore maximized windows under RDP: https://github.com/electron/electron/issues/47016
    "enable-rdp-display-tracking"
  ];
  const argvConfig2 = readArgvConfigSync();
  Object.keys(argvConfig2).forEach((argvKey) => {
    const argvValue = argvConfig2[argvKey];
    if (SUPPORTED_ELECTRON_SWITCHES.indexOf(argvKey) !== -1) {
      if (argvValue === true || argvValue === "true") {
        if (argvKey === "disable-hardware-acceleration") {
          app15.disableHardwareAcceleration();
        } else {
          app15.commandLine.appendSwitch(argvKey);
        }
      } else if (typeof argvValue === "string" && argvValue) {
        if (argvKey === "password-store") {
          let migratedArgvValue = argvValue;
          if (argvValue === "gnome" || argvValue === "gnome-keyring") {
            migratedArgvValue = "gnome-libsecret";
          }
          app15.commandLine.appendSwitch(argvKey, migratedArgvValue);
        } else {
          app15.commandLine.appendSwitch(argvKey, argvValue);
        }
      }
    } else if (SUPPORTED_MAIN_PROCESS_SWITCHES.indexOf(argvKey) !== -1) {
      switch (argvKey) {
        case "enable-proposed-api":
          if (Array.isArray(argvValue)) {
            argvValue.forEach((id2) => id2 && typeof id2 === "string" && process.argv.push("--enable-proposed-api", id2));
          } else {
            console.error(`Unexpected value for \`enable-proposed-api\` in argv.json. Expected array of extension ids.`);
          }
          break;
        case "log-level":
          if (typeof argvValue === "string") {
            process.argv.push("--log", argvValue);
          } else if (Array.isArray(argvValue)) {
            for (const value of argvValue) {
              process.argv.push("--log", value);
            }
          }
          break;
        case "use-inmemory-secretstorage":
          if (argvValue) {
            process.argv.push("--use-inmemory-secretstorage");
          }
          break;
        case "enable-rdp-display-tracking":
          if (argvValue) {
            process.argv.push("--enable-rdp-display-tracking");
          }
          break;
      }
    }
  });
  const featuresToEnable = `NetAdapterMaxBufSizeFeature:NetAdapterMaxBufSize/8192,DocumentPolicyIncludeJSCallStacksInCrashReports,EarlyEstablishGpuChannel,EstablishGpuChannelAsync${process.platform === "linux" ? ",GlobalShortcutsPortal" : ""},${app15.commandLine.getSwitchValue("enable-features")}`;
  app15.commandLine.appendSwitch("enable-features", featuresToEnable);
  const featuresToDisable = `CalculateNativeWinOcclusion,${app15.commandLine.getSwitchValue("disable-features")}`;
  app15.commandLine.appendSwitch("disable-features", featuresToDisable);
  const blinkFeaturesToDisable = `FontMatchingCTMigration,StandardizedBrowserZoom,${app15.commandLine.getSwitchValue("disable-blink-features")}`;
  app15.commandLine.appendSwitch("disable-blink-features", blinkFeaturesToDisable);
  const jsFlags = getJSFlags(cliArgs, argvConfig2);
  if (jsFlags) {
    app15.commandLine.appendSwitch("js-flags", jsFlags);
  }
  app15.commandLine.appendSwitch("xdg-portal-required-version", "4");
  app15.commandLine.appendSwitch("max-active-webgl-contexts", "32");
  return argvConfig2;
}

function readArgvConfigSync() {
  const argvConfigPath = getArgvConfigPath();
  let argvConfig2 = void 0;
  try {
    argvConfig2 = parse(fs14.readFileSync(argvConfigPath).toString());
  } catch (error) {
    if (error && error.code === "ENOENT") {
      createDefaultArgvConfigSync(argvConfigPath);
    } else {
      console.warn(`Unable to read argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
    }
  }
  if (!argvConfig2) {
    argvConfig2 = {};
  }
  return argvConfig2;
}

function createDefaultArgvConfigSync(argvConfigPath) {
  try {
    const argvConfigPathDirname = path3.dirname(argvConfigPath);
    if (!fs14.existsSync(argvConfigPathDirname)) {
      fs14.mkdirSync(argvConfigPathDirname);
    }
    const defaultArgvConfigContent = [
      "// This configuration file allows you to pass permanent command line arguments to VS Code.",
      "// Only a subset of arguments is currently supported to reduce the likelihood of breaking",
      "// the installation.",
      "//",
      "// PLEASE DO NOT CHANGE WITHOUT UNDERSTANDING THE IMPACT",
      "//",
      "// NOTE: Changing this file requires a restart of VS Code.",
      "{",
      "	// Use software rendering instead of hardware accelerated rendering.",
      "	// This can help in cases where you see rendering issues in VS Code.",
      '	// "disable-hardware-acceleration": true',
      "}"
    ];
    fs14.writeFileSync(argvConfigPath, defaultArgvConfigContent.join("\n"));
  } catch (error) {
    console.error(`Unable to create argv.json configuration file in ${argvConfigPath}, falling back to defaults (${error})`);
  }
}

function getArgvConfigPath() {
  const vscodePortable = process.env["VSCODE_PORTABLE"];
  if (vscodePortable) {
    return path3.join(vscodePortable, "argv.json");
  }
  let dataFolderName = product.dataFolderName;
  if (process.env["VSCODE_DEV"]) {
    dataFolderName = `${dataFolderName}-dev`;
  }
  return path3.join(os5.homedir(), dataFolderName, "argv.json");
}

function configureCrashReporter() {
  let crashReporterDirectory = args["crash-reporter-directory"];
  let submitURL = "";
  if (crashReporterDirectory) {
    crashReporterDirectory = path3.normalize(crashReporterDirectory);
    if (!path3.isAbsolute(crashReporterDirectory)) {
      console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory must be absolute.`);
      app15.exit(1);
    }
    if (!fs14.existsSync(crashReporterDirectory)) {
      try {
        fs14.mkdirSync(crashReporterDirectory, { recursive: true });
      } catch (error) {
        console.error(`The path '${crashReporterDirectory}' specified for --crash-reporter-directory does not seem to exist or cannot be created.`);
        app15.exit(1);
      }
    }
    console.log(`Found --crash-reporter-directory argument. Setting crashDumps directory to be '${crashReporterDirectory}'`);
    app15.setPath("crashDumps", crashReporterDirectory);
  } else {
    const appCenter = product.appCenter;
    if (appCenter) {
      const isWindows3 = process.platform === "win32";
      const isLinux2 = process.platform === "linux";
      const isDarwin = process.platform === "darwin";
      const crashReporterId = argvConfig["crash-reporter-id"];
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (crashReporterId && uuidPattern.test(crashReporterId)) {
        if (isWindows3) {
          switch (process.arch) {
            case "x64":
              submitURL = appCenter["win32-x64"];
              break;
            case "arm64":
              submitURL = appCenter["win32-arm64"];
              break;
          }
        } else if (isDarwin) {
          if (product.darwinUniversalAssetId) {
            submitURL = appCenter["darwin-universal"];
          } else {
            switch (process.arch) {
              case "x64":
                submitURL = appCenter["darwin"];
                break;
              case "arm64":
                submitURL = appCenter["darwin-arm64"];
                break;
            }
          }
        } else if (isLinux2) {
          submitURL = appCenter["linux-x64"];
        }
        submitURL = submitURL.concat("&uid=", crashReporterId, "&iid=", crashReporterId, "&sid=", crashReporterId);
        const argv = process.argv;
        const endOfArgsMarkerIndex = argv.indexOf("--");
        if (endOfArgsMarkerIndex === -1) {
          argv.push("--crash-reporter-id", crashReporterId);
        } else {
          argv.splice(endOfArgsMarkerIndex, 0, "--crash-reporter-id", crashReporterId);
        }
      }
    }
  }
  const productName = (product.crashReporter ? product.crashReporter.productName : void 0) || product.nameShort;
  const companyName = (product.crashReporter ? product.crashReporter.companyName : void 0) || "Microsoft";
  const uploadToServer = Boolean(!process.env["VSCODE_DEV"] && submitURL && !crashReporterDirectory);
  crashReporter.start({
    companyName,
    productName: process.env["VSCODE_DEV"] ? `${productName} Dev` : productName,
    submitURL,
    uploadToServer,
    compress: true,
    ignoreSystemCrashHandler: true
  });
}

function getJSFlags(cliArgs, argvConfig2) {
  const jsFlags = [];
  if (cliArgs["js-flags"]) {
    jsFlags.push(cliArgs["js-flags"]);
  }
  if (typeof argvConfig2["js-flags"] === "string" && argvConfig2["js-flags"]) {
    jsFlags.push(argvConfig2["js-flags"]);
  }
  return jsFlags.length > 0 ? jsFlags.join(" ") : null;
}

function parseCLIArgs() {
  return (0, import_minimist2.default)(process.argv, {
    string: [
      "user-data-dir",
      "locale",
      "js-flags",
      "crash-reporter-directory"
    ],
    boolean: [
      "disable-chromium-sandbox"
    ],
    default: {
      "sandbox": true
    },
    alias: {
      "no-sandbox": "sandbox"
    }
  });
}

function registerListeners() {
  const macOpenFiles = [];
  globalThis.macOpenFiles = macOpenFiles;
  app15.on("open-file", function(event, path4) {
    macOpenFiles.push(path4);
  });
  const openUrls = [];
  const onOpenUrl = function(event, url) {
    event.preventDefault();
    openUrls.push(url);
  };
  app15.on("will-finish-launching", function() {
    app15.on("open-url", onOpenUrl);
  });
  globalThis.getOpenUrls = function() {
    app15.removeListener("open-url", onOpenUrl);
    return openUrls;
  };
}

function getOpenCodeCacheIdentity() {
  const buildIdentity = product.opencodeBuildId ?? product.date?.replace(/[^a-zA-Z0-9]/g, "") ?? product.commit;
  if (!buildIdentity) {
    return void 0;
  }
  return `${buildIdentity}-${process.versions.electron ?? ""}`;
}

function getNLSBuildKey() {
  return product.opencodeBuildId ?? product.commit;
}

function getCodeCacheKey() {
  const commit = product.commit;
  if (!commit) {
    return void 0;
  }
  const identity2 = getOpenCodeCacheIdentity();
  return identity2 ? `${commit}-${identity2}` : commit;
}

function getCodeCachePath() {
  if (process.argv.indexOf("--no-cached-data") > 0) {
    return void 0;
  }
  if (process.env["VSCODE_DEV"]) {
    return void 0;
  }
  const cacheKey = getCodeCacheKey();
  return cacheKey ? path3.join(userDataPath, "CachedData", cacheKey) : void 0;
}

function clearStaleBuildCaches(userDataPath2) {
  const buildIdentity = getOpenCodeCacheIdentity();
  if (!buildIdentity) {
    return;
  }
  const markerPath = path3.join(userDataPath2, "opencode-cache-build");
  let lastBuild;
  try {
    lastBuild = fs14.readFileSync(markerPath, "utf8");
  } catch {
  }
  appendStartupDiag(userDataPath2, `cache identity=${buildIdentity} lastMarker=${lastBuild ?? "(none)"}`);
  if (lastBuild !== buildIdentity) {
    let allSucceeded = true;
    for (const dir of [
      "CachedData",
      "Code Cache",
      "Cache",
      "GPUCache",
      "DawnGraphiteCache",
      "DawnWebGPUCache",
      "Service Worker",
      "blob_storage",
      "CachedProfilesData",
      "GrShaderCache",
      "ShaderCache",
      // Language-pack NLS cache. It is derived from the language pack plus
      // the current bundle's nls.keys.json and is regenerated on the next
      // start, so deleting it is safe. See getNLSBuildKey() for the
      // stale-cache mechanism that causes `NLS MISSING` black screens
      // after an overwrite install.
      "clp"
    ]) {
      try {
        fs14.rmSync(path3.join(userDataPath2, dir), { recursive: true, force: true });
      } catch {
        allSucceeded = false;
      }
    }
    appendStartupDiag(userDataPath2, `cache cleanup ${allSucceeded ? "complete" : "partial (will retry next start)"}`);
    if (allSucceeded) {
      try {
        fs14.mkdirSync(userDataPath2, { recursive: true });
        fs14.writeFileSync(markerPath, buildIdentity);
        appendStartupDiag(userDataPath2, "cache marker written");
      } catch {
      }
    }
  }
  sweepStaleCachedData(userDataPath2);
}

function sweepStaleCachedData(userDataPath2) {
  const currentKey = getCodeCacheKey();
  if (!currentKey) {
    return;
  }
  const cachedDataRoot = path3.join(userDataPath2, "CachedData");
  let entries = [];
  let removed = 0;
  try {
    entries = fs14.readdirSync(cachedDataRoot);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry === currentKey) {
      continue;
    }
    try {
      fs14.rmSync(path3.join(cachedDataRoot, entry), { recursive: true, force: true });
      removed++;
    } catch {
    }
  }
  if (removed > 0) {
    appendStartupDiag(userDataPath2, `swept ${removed} stale CachedData dir(s)`);
  }
}

function applyGpuCrashFallback(userDataPath2) {
  const stage = getGpuFallbackStage(userDataPath2);
  if (stage >= 1 && !app15.commandLine.hasSwitch("disable-gpu-sandbox")) {
    app15.commandLine.appendSwitch("disable-gpu-sandbox");
    appendStartupDiag(userDataPath2, `gpu fallback stage=${stage}: disable-gpu-sandbox`);
  }
  if (stage >= 2 && app15.commandLine.getSwitchValue("use-angle") !== "gl") {
    app15.commandLine.appendSwitch("use-angle", "gl");
    appendStartupDiag(userDataPath2, `gpu fallback stage=${stage}: use-angle=gl`);
  }
  if (stage >= 3 && !app15.commandLine.hasSwitch("disable-gpu")) {
    app15.commandLine.appendSwitch("disable-gpu");
    appendStartupDiag(userDataPath2, `gpu fallback stage=${stage}: disable-gpu`);
  }
}

function migrateBrokenPaintWatchdogFallback(userDataPath2) {
  const migrationMarker = path3.join(userDataPath2, "opencode-gpu-watchdog-ready-to-show");
  if (fs14.existsSync(migrationMarker)) {
    return;
  }
  try {
    const startupLog = fs14.readFileSync(path3.join(userDataPath2, "opencode-startup.log"), "utf8");
    const escalations = [...startupLog.matchAll(/escalating gpu fallback to stage \d+ \(cause=([^)]+)\)/g)];
    const lastCause = escalations.length ? escalations[escalations.length - 1][1] : void 0;
    if (lastCause === "no-first-paint") {
      fs14.rmSync(path3.join(userDataPath2, "opencode-gpu-fallback"), { force: true });
      appendStartupDiag(userDataPath2, "cleared false GPU fallback from legacy paint watchdog");
    }
  } catch {
  }
  try {
    fs14.mkdirSync(userDataPath2, { recursive: true });
    fs14.writeFileSync(migrationMarker, "ready-to-show");
  } catch {
  }
}

function registerGpuCrashFallbackListeners(userDataPath2) {
  const startedAt = Date.now();
  app15.on("child-process-gone", (_event, details) => {
    if (details.type === "GPU" && (details.reason === "crashed" || details.reason === "killed")) {
      appendStartupDiag(userDataPath2, `gpu process gone: ${details.reason} (exit=${details.exitCode})`);
      if (!firstWindowPainted && Date.now() - startedAt < 6e4) {
        recordGpuFallback(userDataPath2, "gpu-process-crash-at-startup");
      }
    }
  });
  app15.on("web-contents-created", (_event, contents) => {
    contents.on("render-process-gone", (_event2, details) => {
      appendStartupDiag(userDataPath2, `renderer gone: ${details.reason} (exit=${details.exitCode})`);
      if (Date.now() - startedAt < 6e4 && details.reason === "crashed") {
        recordGpuFallback(userDataPath2, "renderer-crash-at-startup");
      }
    });
    contents.on("console-message", (_event2, level, message, _line, _sourceId) => {
      if (level >= 2 && Date.now() - startedAt < 12e4) {
        const tag = level >= 3 ? "renderer:error" : "renderer:warn";
        appendStartupDiag(userDataPath2, `[${tag}] ${message.slice(0, 500)}`);
      }
    });
  });
}

function registerFirstFrameWatchdog(userDataPath2) {
  let handled = false;
  app15.on("browser-window-created", (_event, window2) => {
    if (handled) {
      return;
    }
    handled = true;
    const contents = window2.webContents;
    let readyToShow = false;
    let watchdog;
    const markReadyToShow = () => {
      readyToShow = true;
      firstWindowPainted = true;
      clearNoPaintHits(userDataPath2);
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = void 0;
      }
      appendStartupDiag(userDataPath2, "first window ready to show");
    };
    window2.once("ready-to-show", markReadyToShow);
    window2.once("closed", () => {
      if (watchdog) {
        clearTimeout(watchdog);
        watchdog = void 0;
      }
    });
    let workbenchLoaded = false;
    const ipcHandler = () => {
      workbenchLoaded = true;
    };
    contents.ipc.once("vscode:startupTimers", ipcHandler);
    contents.ipc.once("vscode:extensionLog", ipcHandler);
    contents.once("did-finish-load", () => {
      workbenchLoaded = true;
    });
    window2.once("ready-to-show", () => {
      setTimeout(() => {
        if (workbenchLoaded || window2.isDestroyed()) {
          return;
        }
        appendStartupDiag(userDataPath2, "workbench did not initialize within 30s after ready-to-show (splash-only black screen)");
        const { dialog: dialog2 } = __require("electron");
        dialog2.showErrorBox(
          "OpenCode",
          `The application window failed to initialize. This may be caused by a corrupted installation or extension conflict.

Try launching with extensions disabled:
  OpenCode.exe --disable-extensions

If the problem persists, delete the cache:
  ${userDataPath2}\\CachedData
  ${userDataPath2}\\Code Cache`
        );
      }, 3e4);
    });
    appendStartupDiag(userDataPath2, "first window created");
    watchdog = setTimeout(() => {
      watchdog = void 0;
      if (readyToShow || window2.isDestroyed()) {
        return;
      }
      if (contents.isCrashed()) {
        appendStartupDiag(userDataPath2, "first window renderer crashed before first paint");
        recordGpuFallback(userDataPath2, "no-first-paint-crashed");
      } else {
        appendStartupDiag(userDataPath2, "first window did not paint within 45s");
        recordGpuFallback(userDataPath2, "no-first-paint");
      }
    }, 45e3);
  });
}

var firstWindowPainted = false;

var gpuFallbackRecorded = false;

var OPENCODE_AUTO_RELAUNCH_LIMIT_PER_DAY = 3;

function recordNoPaintHit(userDataPath2, stage) {
  const markerPath = path3.join(userDataPath2, "opencode-gpu-fallback-hits");
  let state = { stage, hits: 0 };
  try {
    const parsed = JSON.parse(fs14.readFileSync(markerPath, "utf8"));
    if (parsed && typeof parsed === "object") {
      state = { stage: Number(parsed.stage) || 0, hits: Number(parsed.hits) || 0 };
    }
  } catch {
  }
  if (state.stage !== stage) {
    state = { stage, hits: 0 };
  }
  state.hits += 1;
  try {
    fs14.mkdirSync(userDataPath2, { recursive: true });
    fs14.writeFileSync(markerPath, JSON.stringify(state));
  } catch {
  }
  return state.hits;
}

function clearNoPaintHits(userDataPath2) {
  try {
    fs14.rmSync(path3.join(userDataPath2, "opencode-gpu-fallback-hits"), { force: true });
  } catch {
  }
}

function tryAutoRelaunchAfterGpuFailure(userDataPath2, cause, fallbackStage) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const markerPath = path3.join(userDataPath2, "opencode-auto-relaunch");
  let day2 = "";
  let count = 0;
  try {
    const state = JSON.parse(fs14.readFileSync(markerPath, "utf8"));
    day2 = typeof state.day === "string" ? state.day : "";
    count = Number(state.count) || 0;
  } catch {
  }
  if (day2 !== today) {
    day2 = today;
    count = 0;
  }
  if (count >= OPENCODE_AUTO_RELAUNCH_LIMIT_PER_DAY) {
    appendStartupDiag(userDataPath2, `auto relaunch budget exhausted for ${today} (cause=${cause}, stage=${fallbackStage})`);
    return;
  }
  count += 1;
  try {
    fs14.mkdirSync(userDataPath2, { recursive: true });
    fs14.writeFileSync(markerPath, JSON.stringify({ day: day2, count }));
  } catch {
    return;
  }
  appendStartupDiag(userDataPath2, `auto relaunching with gpu fallback stage ${fallbackStage} (cause=${cause}, budgetUsed=${count})`);
  setTimeout(() => {
    app15.relaunch();
    app15.exit(0);
  }, 500);
}

function recordGpuFallback(userDataPath2, cause) {
  if (gpuFallbackRecorded || process.env["VSCODE_DEV"]) {
    return;
  }
  const stage = getGpuFallbackStage(userDataPath2);
  if (stage >= 3) {
    gpuFallbackRecorded = true;
    appendStartupDiag(userDataPath2, `gpu fallback already at final stage (cause=${cause}); automatic restart disabled`);
    return;
  }
  const crashEvidence = cause === "gpu-process-crash-at-startup" || cause === "renderer-crash-at-startup" || cause === "no-first-paint-crashed";
  const escalate = crashEvidence || recordNoPaintHit(userDataPath2, stage) >= 2;
  if (!escalate) {
    gpuFallbackRecorded = true;
    appendStartupDiag(userDataPath2, `slow first start without crash evidence (cause=${cause}); keeping stage ${stage} and relaunching`);
    tryAutoRelaunchAfterGpuFailure(userDataPath2, cause, stage);
    return;
  }
  const nextStage = stage + 1;
  try {
    fs14.mkdirSync(userDataPath2, { recursive: true });
    fs14.writeFileSync(path3.join(userDataPath2, "opencode-gpu-fallback"), String(nextStage));
  } catch {
    return;
  }
  gpuFallbackRecorded = true;
  appendStartupDiag(userDataPath2, `recorded gpu fallback stage ${nextStage} (cause=${cause})`);
  tryAutoRelaunchAfterGpuFailure(userDataPath2, cause, nextStage);
}

function appendStartupDiag(userDataPath2, line) {
  try {
    fs14.mkdirSync(userDataPath2, { recursive: true });
    fs14.appendFileSync(path3.join(userDataPath2, "opencode-startup.log"), `${(/* @__PURE__ */ new Date()).toISOString()} ${line}
`);
  } catch {
  }
}

function getGpuFallbackStage(userDataPath2) {
  try {
    return Number(fs14.readFileSync(path3.join(userDataPath2, "opencode-gpu-fallback"), "utf8")) || 0;
  } catch {
    return 0;
  }
}

async function mkdirpIgnoreError(dir) {
  if (typeof dir === "string") {
    try {
      await fs14.promises.mkdir(dir, { recursive: true });
      return dir;
    } catch (error) {
    }
  }
  return void 0;
}

function processZhLocale(appLocale) {
  if (appLocale.startsWith("zh")) {
    const region = appLocale.split("-")[1];
    if (["hans", "cn", "sg", "my"].includes(region)) {
      return "zh-cn";
    }
    return "zh-tw";
  }
  return appLocale;
}

async function resolveNlsConfiguration() {
  const nlsConfiguration = nlsConfigurationPromise ? await nlsConfigurationPromise : void 0;
  if (nlsConfiguration) {
    return nlsConfiguration;
  }
  let userLocale2 = app15.getLocale();
  if (!userLocale2) {
    return {
      userLocale: "en",
      osLocale,
      resolvedLanguage: "en",
      defaultMessagesFile: path3.join(import.meta.dirname, "nls.messages.json"),
      // NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
      locale: "en",
      availableLanguages: {}
    };
  }
  userLocale2 = processZhLocale(userLocale2.toLowerCase());
  return resolveNLSConfiguration({
    userLocale: userLocale2,
    osLocale,
    commit: getNLSBuildKey(),
    userDataPath,
    nlsMetadataPath: import.meta.dirname
  });
}

function getUserDefinedLocale(argvConfig2) {
  const locale = args["locale"];
  if (locale) {
    return locale.toLowerCase();
  }
  return typeof argvConfig2?.locale === "string" ? argvConfig2.locale.toLowerCase() : void 0;
}
export { onReady, startup, configureCommandlineSwitchesSync, readArgvConfigSync, createDefaultArgvConfigSync, getArgvConfigPath, configureCrashReporter, getJSFlags, parseCLIArgs, registerListeners, getOpenCodeCacheIdentity, getNLSBuildKey, getCodeCacheKey, getCodeCachePath, clearStaleBuildCaches, sweepStaleCachedData, applyGpuCrashFallback, migrateBrokenPaintWatchdogFallback, registerGpuCrashFallbackListeners, registerFirstFrameWatchdog, recordNoPaintHit, clearNoPaintHits, tryAutoRelaunchAfterGpuFailure, recordGpuFallback, appendStartupDiag, getGpuFallbackStage, mkdirpIgnoreError, processZhLocale, resolveNlsConfiguration, getUserDefinedLocale, path3, fs14, os5, performance2, import_minimist2, app15, protocol3, crashReporter, Menu5, contentTracing2, portable, args, argvConfig, userDataPath, codeCachePath, nlsConfigurationPromise, osLocale, userLocale, firstWindowPainted, gpuFallbackRecorded, OPENCODE_AUTO_RELAUNCH_LIMIT_PER_DAY };
