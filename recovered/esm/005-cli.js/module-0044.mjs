// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/platform/environment/node/argvHelper.ts
import { init_nls, localize } from "./module-0001.mjs";
import { NATIVE_CLI_COMMANDS, OPTIONS, init_argv, parseArgs } from "./module-0043.mjs";
import { __esm } from "./module-0000.mjs";
import { init_path } from "./module-0004.mjs";
import { init_platform } from "./module-0002.mjs";


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
  const args = parseArgs(cmdLineArgs, OPTIONS, reportWarnings ? errorReporter : void 0);
  if (args.goto) {
    args._.forEach((arg) => assert2(/^(\w:)?[^:]+(:\d*){0,2}:?$/.test(arg), localize(2895, null)));
  }
  return args;
}

function stripAppPath(argv) {
  const index = argv.findIndex((a) => !/^-/.test(a));
  if (index > -1) {
    return [...argv.slice(0, index), ...argv.slice(index + 1)];
  }
  return void 0;
}

function parseCLIProcessArgv(processArgv) {
  let [, , ...args] = processArgv;
  if (process.env["VSCODE_DEV"]) {
    args = stripAppPath(args) || [];
  }
  return parseAndValidate(args, true);
}

function addArg(argv, ...args) {
  const endOfArgsMarkerIndex = argv.indexOf("--");
  if (endOfArgsMarkerIndex === -1) {
    argv.push(...args);
  } else {
    argv.splice(endOfArgsMarkerIndex, 0, ...args);
  }
  return argv;
}

var init_argvHelper = __esm({
  "src/vs/platform/environment/node/argvHelper.ts"() {
    init_path();
    init_platform();
    init_nls();
    init_argv();
  }
});
export { parseAndValidate, stripAppPath, parseCLIProcessArgv, addArg, assert2, init_argvHelper };
