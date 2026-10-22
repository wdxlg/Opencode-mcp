// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/node/argvHelper.ts
import { init_nls, localize } from "./module-0005.mjs";
import { NATIVE_CLI_COMMANDS, OPTIONS, init_argv, parseArgs } from "./module-0116.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { dirname3, init_path, resolve2 } from "./module-0008.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/environment/node/argvHelper.ts
import assert2 from "assert";

function parseAndValidate(cmdLineArgs, reportWarnings) {
  const onMultipleValues = (id2, val) => {
    console.warn(localize(2896, null, id2, val));
  };
  const onEmptyValue = (id2) => {
    console.warn(localize(2894, null, id2));
  };
  const onDeprecatedOption = (deprecatedOption, message) => {
    console.warn(localize(2893, null, deprecatedOption, message));
  };
  const getSubcommandReporter = (command) => ({
    onUnknownOption: (id2) => {
      if (!NATIVE_CLI_COMMANDS.includes(command)) {
        console.warn(localize(2898, null, id2, command));
      }
    },
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter: NATIVE_CLI_COMMANDS.includes(command) ? getSubcommandReporter : void 0
  });
  const errorReporter = {
    onUnknownOption: (id2) => {
      console.warn(localize(2897, null, id2));
    },
    onMultipleValues,
    onEmptyValue,
    onDeprecatedOption,
    getSubcommandReporter
  };
  const args2 = parseArgs(cmdLineArgs, OPTIONS, reportWarnings ? errorReporter : void 0);
  if (args2.goto) {
    args2._.forEach((arg) => assert2(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), localize(2895, null)));
  }
  return args2;
}

function stripAppPath(argv) {
  const index = argv.findIndex((a) => !/^-/.test(a));
  if (index > -1) {
    return [...argv.slice(0, index), ...argv.slice(index + 1)];
  }
  return void 0;
}

function parseMainProcessArgv(processArgv) {
  let [, ...args2] = processArgv;
  if (isWindows2 && args2.length > 0) {
    const resolvedArg = resolve2(args2[0]).toLowerCase();
    const installDir = dirname3(process.execPath).toLowerCase() + "\\";
    if (resolvedArg.startsWith(installDir) && resolvedArg.endsWith("\\resources\\app\\out\\cli.js")) {
      args2.shift();
    }
  }
  if (process.env["VSCODE_DEV"]) {
    args2 = stripAppPath(args2) || [];
  }
  const reportWarnings = !isLaunchedFromCli(process.env);
  return parseAndValidate(args2, reportWarnings);
}

function addArg(argv, ...args2) {
  const endOfArgsMarkerIndex = argv.indexOf("--");
  if (endOfArgsMarkerIndex === -1) {
    argv.push(...args2);
  } else {
    argv.splice(endOfArgsMarkerIndex, 0, ...args2);
  }
  return argv;
}

function isLaunchedFromCli(env2) {
  return env2["VSCODE_CLI"] === "1";
}

var init_argvHelper = __esm({
  "src/vs/platform/environment/node/argvHelper.ts"() {
    init_path();
    init_platform();
    init_nls();
    init_argv();
  }
});
export { parseAndValidate, stripAppPath, parseMainProcessArgv, addArg, isLaunchedFromCli, assert2, init_argvHelper };
