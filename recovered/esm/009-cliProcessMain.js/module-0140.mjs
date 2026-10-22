// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/environment/node/argv.ts
import { localize } from "./module-0013.mjs";


// src/vs/platform/environment/node/argv.ts
import minimist from "minimist";

var helpCategories = {
  o: localize(2868, null),
  e: localize(2852, null),
  t: localize(2882, null),
  m: localize(2863, null)
};

var OPTIONS = {
  "chat": {
    type: "subcommand",
    description: "Pass in a prompt to run in a chat session in the current working directory.",
    options: {
      "_": { type: "string[]", description: localize(2872, null) },
      "mode": { type: "string", cat: "o", alias: "m", args: "mode", description: localize(2840, null) },
      "add-file": { type: "string[]", cat: "o", alias: "a", args: "path", description: localize(2835, null) },
      "maximize": { type: "boolean", cat: "o", description: localize(2839, null) },
      "reuse-window": { type: "boolean", cat: "o", alias: "r", description: localize(2875, null) },
      "new-window": { type: "boolean", cat: "o", alias: "n", description: localize(2866, null) },
      "profile": { type: "string", "cat": "o", args: "profileName", description: localize(2871, null) },
      "help": { type: "boolean", alias: "h", description: localize(2854, null) }
    }
  },
  "serve-web": {
    type: "subcommand",
    description: "Run a server that displays the editor UI in browsers.",
    options: {
      "cli-data-dir": { type: "string", args: "dir", description: localize(2841, null) },
      "disable-telemetry": { type: "boolean" },
      "telemetry-level": { type: "string" }
    }
  },
  "agent": {
    type: "subcommand",
    description: "Start and interact with AI agent hosts.",
    options: {
      "cli-data-dir": { type: "string", args: "dir", description: localize(2841, null) },
      "disable-telemetry": { type: "boolean" },
      "telemetry-level": { type: "string" }
    }
  },
  "tunnel": {
    type: "subcommand",
    description: "Make the current machine accessible from vscode.dev or other machines through a secure tunnel.",
    options: {
      "cli-data-dir": { type: "string", args: "dir", description: localize(2841, null) },
      "disable-telemetry": { type: "boolean" },
      "telemetry-level": { type: "string" },
      user: {
        type: "subcommand",
        options: {
          login: {
            type: "subcommand",
            options: {
              provider: { type: "string" },
              "access-token": { type: "string" }
            }
          }
        }
      }
    }
  },
  "diff": { type: "boolean", cat: "o", alias: "d", args: ["file", "file"], description: localize(2844, null) },
  "merge": { type: "boolean", cat: "o", alias: "m", args: ["path1", "path2", "base", "result"], description: localize(2864, null) },
  "add": { type: "boolean", cat: "o", alias: "a", args: "folder", description: localize(2834, null) },
  "remove": { type: "boolean", cat: "o", args: "folder", description: localize(2873, null) },
  "goto": { type: "boolean", cat: "o", alias: "g", args: "file:line[:character]", description: localize(2853, null) },
  "new-window": { type: "boolean", cat: "o", alias: "n", description: localize(2865, null) },
  "reuse-window": { type: "boolean", cat: "o", alias: "r", description: localize(2874, null) },
  "agents": { type: "boolean", cat: "o", deprecates: ["sessions"], description: localize(2837, null) },
  "wait": { type: "boolean", cat: "o", alias: "w", description: localize(2892, null) },
  "waitMarkerFilePath": { type: "string" },
  "locale": { type: "string", cat: "o", args: "locale", description: localize(2860, null) },
  "user-data-dir": { type: "string", cat: "o", args: "dir", description: localize(2889, null) },
  "profile": { type: "string", "cat": "o", args: "profileName", description: localize(2871, null) },
  "help": { type: "boolean", cat: "o", alias: "h", description: localize(2854, null) },
  "extensions-dir": { type: "string", deprecates: ["extensionHomePath"], cat: "e", args: "dir", description: localize(2851, null) },
  "extensions-download-dir": { type: "string" },
  "builtin-extensions-dir": { type: "string" },
  "shared-data-dir": { type: "string" },
  "list-extensions": { type: "boolean", cat: "e", description: localize(2859, null) },
  "agent-plugins-dir": { type: "string" },
  "agents-user-data-dir": { type: "string" },
  "agents-extensions-dir": { type: "string" },
  "show-versions": { type: "boolean", cat: "e", description: localize(2876, null) },
  "category": { type: "string", allowEmptyValue: true, cat: "e", description: localize(2838, null), args: "category" },
  "install-extension": { type: "string[]", cat: "e", args: "ext-id | path", description: localize(2858, null) },
  "pre-release": { type: "boolean", cat: "e", description: localize(2857, null) },
  "uninstall-extension": { type: "string[]", cat: "e", args: "ext-id", description: localize(2884, null) },
  "update-extensions": { type: "boolean", cat: "e", description: localize(2887, null) },
  "enable-proposed-api": { type: "string[]", allowEmptyValue: true, cat: "e", args: "ext-id", description: localize(2850, null) },
  "add-mcp": { type: "string[]", cat: "m", args: "json", description: localize(2836, null) },
  "version": { type: "boolean", cat: "t", alias: "v", description: localize(2891, null) },
  "verbose": { type: "boolean", cat: "t", global: true, description: localize(2890, null) },
  "log": { type: "string[]", cat: "t", args: "level", global: true, description: localize(2862, null) },
  "status": { type: "boolean", alias: "s", cat: "t", description: localize(2877, null) },
  "prof-startup": { type: "boolean", cat: "t", description: localize(2870, null) },
  "prof-append-timers": { type: "string" },
  "prof-duration-markers": { type: "string[]" },
  "prof-duration-markers-file": { type: "string" },
  "no-cached-data": { type: "boolean" },
  "prof-startup-prefix": { type: "string" },
  "prof-v8-extensions": { type: "boolean" },
  "disable-extensions": { type: "boolean", deprecates: ["disableExtensions"], cat: "t", description: localize(2847, null) },
  "disable-extension": { type: "string[]", cat: "t", args: "ext-id", description: localize(2846, null) },
  "sync": { type: "string", cat: "t", description: localize(2883, null), args: ["on | off"] },
  "inspect-extensions": { type: "string", allowEmptyValue: true, deprecates: ["debugPluginHost"], args: "port", cat: "t", description: localize(2856, null) },
  "inspect-brk-extensions": { type: "string", allowEmptyValue: true, deprecates: ["debugBrkPluginHost"], args: "port", cat: "t", description: localize(2855, null) },
  "disable-lcd-text": { type: "boolean", cat: "t", description: localize(2849, null) },
  "disable-gpu": { type: "boolean", cat: "t", description: localize(2848, null) },
  "disable-chromium-sandbox": { type: "boolean", cat: "t", description: localize(2845, null) },
  "sandbox": { type: "boolean" },
  "locate-shell-integration-path": { type: "string", cat: "t", args: ["shell"], description: localize(2861, null) },
  "telemetry": { type: "boolean", cat: "t", description: localize(2880, null) },
  "remote": { type: "string", allowEmptyValue: true },
  "folder-uri": { type: "string[]", cat: "o", args: "uri" },
  "file-uri": { type: "string[]", cat: "o", args: "uri" },
  "locate-extension": { type: "string[]" },
  "extensionDevelopmentPath": { type: "string[]" },
  "extensionDevelopmentKind": { type: "string[]" },
  "extensionTestsPath": { type: "string" },
  "extensionEnvironment": { type: "string" },
  "debugId": { type: "string" },
  "debugRenderer": { type: "boolean" },
  "inspect-ptyhost": { type: "string", allowEmptyValue: true },
  "inspect-brk-ptyhost": { type: "string", allowEmptyValue: true },
  "inspect-agenthost": { type: "string", allowEmptyValue: true },
  "inspect-brk-agenthost": { type: "string", allowEmptyValue: true },
  "inspect-sharedprocess": { type: "string", allowEmptyValue: true },
  "inspect-brk-sharedprocess": { type: "string", allowEmptyValue: true },
  "export-default-configuration": { type: "string" },
  "export-policy-data": { type: "string", allowEmptyValue: true },
  "export-default-keybindings": { type: "string", allowEmptyValue: true },
  "install-source": { type: "string" },
  "enable-smoke-test-driver": { type: "boolean" },
  "skip-sessions-welcome": { type: "boolean" },
  "logExtensionHostCommunication": { type: "boolean" },
  "skip-release-notes": { type: "boolean" },
  "skip-welcome": { type: "boolean" },
  "disable-telemetry": { type: "boolean" },
  "telemetry-level": { type: "string" },
  "disable-updates": { type: "boolean" },
  "share-secrets-with-agents-app": { type: "boolean" },
  "transient": { type: "boolean", cat: "t", description: localize(2881, null) },
  "use-inmemory-secretstorage": { type: "boolean", deprecates: ["disable-keytar"] },
  "password-store": { type: "string" },
  "disable-workspace-trust": { type: "boolean" },
  "disable-crash-reporter": { type: "boolean" },
  "crash-reporter-directory": { type: "string" },
  "crash-reporter-id": { type: "string" },
  "skip-add-to-recently-opened": { type: "boolean" },
  "open-url": { type: "boolean" },
  "file-write": { type: "boolean" },
  "file-chmod": { type: "boolean" },
  "install-builtin-extension": { type: "string[]" },
  "force": { type: "boolean" },
  "do-not-sync": { type: "boolean" },
  "do-not-include-pack-dependencies": { type: "boolean" },
  "trace": { type: "boolean" },
  "trace-memory-infra": { type: "boolean" },
  "trace-category-filter": { type: "string" },
  "trace-options": { type: "string" },
  "preserve-env": { type: "boolean" },
  "force-user-env": { type: "boolean" },
  "force-disable-user-env": { type: "boolean" },
  "open-devtools": { type: "boolean" },
  "disable-gpu-sandbox": { type: "boolean" },
  "logsPath": { type: "string" },
  "__enable-file-policy": { type: "boolean" },
  "editSessionId": { type: "string" },
  "continueOn": { type: "string" },
  "enable-coi": { type: "boolean" },
  "unresponsive-sample-interval": { type: "string" },
  "unresponsive-sample-period": { type: "string" },
  "enable-rdp-display-tracking": { type: "boolean" },
  "disable-layout-restore": { type: "boolean" },
  "disable-experiments": { type: "boolean" },
  // chromium flags
  "no-proxy-server": { type: "boolean" },
  // Minimist incorrectly parses keys that start with `--no`
  // https://github.com/substack/minimist/blob/aeb3e27dae0412de5c0494e9563a5f10c82cc7a9/index.js#L118-L121
  // If --no-sandbox is passed via cli wrapper it will be treated as --sandbox which is incorrect, we use
  // the alias here to make sure --no-sandbox is always respected.
  // For https://github.com/microsoft/vscode/issues/128279
  "no-sandbox": { type: "boolean", alias: "sandbox" },
  "proxy-server": { type: "string" },
  "proxy-bypass-list": { type: "string" },
  "proxy-pac-url": { type: "string" },
  "js-flags": { type: "string" },
  // chrome js flags
  "inspect": { type: "string", allowEmptyValue: true },
  "inspect-brk": { type: "string", allowEmptyValue: true },
  "nolazy": { type: "boolean" },
  // node inspect
  "force-device-scale-factor": { type: "string" },
  "force-renderer-accessibility": { type: "boolean" },
  "ignore-certificate-errors": { type: "boolean" },
  "allow-insecure-localhost": { type: "boolean" },
  "log-net-log": { type: "string" },
  "vmodule": { type: "string" },
  "_urls": { type: "string[]" },
  "disable-dev-shm-usage": { type: "boolean" },
  "profile-temp": { type: "boolean" },
  "ozone-platform": { type: "string" },
  "enable-tracing": { type: "string" },
  "trace-startup-format": { type: "string" },
  "trace-startup-file": { type: "string" },
  "trace-startup-duration": { type: "string" },
  "xdg-portal-required-version": { type: "string" },
  _: { type: "string[]" }
  // main arguments
};
export { minimist, helpCategories, OPTIONS };
