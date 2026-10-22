// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/updateRelaunchArguments.ts
import { init_path, win32 } from "./module-0008.mjs";
import { cwd2, init_process } from "./module-0007.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/update/electron-main/updateRelaunchArguments.ts
function quoteWindowsArgument(arg) {
  if (arg.length > 0 && !/[ \t"]/.test(arg)) {
    return arg;
  }
  let result = '"';
  let backslashes = 0;
  for (const ch of arg) {
    if (ch === "\\") {
      backslashes++;
    } else if (ch === '"') {
      result += "\\".repeat(backslashes * 2 + 1) + '"';
      backslashes = 0;
    } else {
      result += "\\".repeat(backslashes) + ch;
      backslashes = 0;
    }
  }
  result += "\\".repeat(backslashes * 2) + '"';
  return result;
}

function toAbsolutePath(value, currentWorkingDirectory) {
  return win32.isAbsolute(value) ? value : win32.resolve(currentWorkingDirectory, value);
}

function getRelaunchArguments(args2, rawArgs, currentWorkingDirectory = cwd2()) {
  const argv = [];
  for (const key of RELAUNCH_STRING_ARGUMENTS) {
    const value = args2[key];
    if (typeof value === "string" && value.length > 0) {
      argv.push(`--${key}=${RELAUNCH_PATH_ARGUMENTS.has(key) ? toAbsolutePath(value, currentWorkingDirectory) : value}`);
    }
  }
  for (const key of RELAUNCH_FLAG_ARGUMENTS) {
    if (args2[key] === true) {
      argv.push(`--${key}`);
    }
  }
  const endOfOptions = rawArgs.indexOf("--");
  const rawOptions = endOfOptions === -1 ? rawArgs : rawArgs.slice(0, endOfOptions);
  for (const key of RELAUNCH_NEGATED_FLAG_ARGUMENTS) {
    if (rawOptions.includes(`--${key}`)) {
      argv.push(`--${key}`);
    }
  }
  return argv.map(quoteWindowsArgument).join(" ");
}

var RELAUNCH_STRING_ARGUMENTS, RELAUNCH_FLAG_ARGUMENTS, RELAUNCH_NEGATED_FLAG_ARGUMENTS, RELAUNCH_PATH_ARGUMENTS;

var init_updateRelaunchArguments = __esm({
  "src/vs/platform/update/electron-main/updateRelaunchArguments.ts"() {
    init_path();
    init_process();
    RELAUNCH_STRING_ARGUMENTS = [
      // Data & extension directories
      "user-data-dir",
      "extensions-dir",
      "builtin-extensions-dir",
      "extensions-download-dir",
      "shared-data-dir",
      "agents-user-data-dir",
      "agents-extensions-dir",
      "agent-plugins-dir",
      // Localization
      "locale",
      // Diagnostics
      "crash-reporter-directory",
      // Secret storage
      "password-store",
      // Proxy
      "proxy-server",
      "proxy-bypass-list",
      "proxy-pac-url",
      // Rendering / Chromium / tracing
      "force-device-scale-factor",
      "ozone-platform",
      "js-flags",
      "enable-tracing",
      "trace-startup-format",
      "trace-startup-file",
      "trace-startup-duration"
    ];
    RELAUNCH_FLAG_ARGUMENTS = [
      // Rendering / sandboxing
      "disable-gpu",
      "disable-lcd-text",
      "disable-chromium-sandbox",
      "disable-gpu-sandbox",
      "disable-dev-shm-usage",
      "enable-coi",
      "force-renderer-accessibility",
      "enable-rdp-display-tracking",
      // Networking
      "ignore-certificate-errors",
      "allow-insecure-localhost",
      // Persistent opt-outs / environment
      "disable-crash-reporter",
      "disable-telemetry",
      "disable-updates",
      "disable-workspace-trust",
      "disable-experiments",
      "disable-layout-restore",
      "use-inmemory-secretstorage"
    ];
    RELAUNCH_NEGATED_FLAG_ARGUMENTS = [
      "no-sandbox",
      "no-proxy-server"
    ];
    RELAUNCH_PATH_ARGUMENTS = /* @__PURE__ */ new Set([
      "user-data-dir",
      "extensions-dir",
      "builtin-extensions-dir",
      "extensions-download-dir",
      "shared-data-dir",
      "agents-user-data-dir",
      "agents-extensions-dir",
      "agent-plugins-dir",
      "crash-reporter-directory",
      "trace-startup-file"
    ]);
  }
});
export { quoteWindowsArgument, toAbsolutePath, getRelaunchArguments, RELAUNCH_STRING_ARGUMENTS, RELAUNCH_FLAG_ARGUMENTS, RELAUNCH_NEGATED_FLAG_ARGUMENTS, RELAUNCH_PATH_ARGUMENTS, init_updateRelaunchArguments };
