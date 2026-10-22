// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/bootstrap-fork.js
// Original module marker: src/bootstrap-node.ts



// src/bootstrap-node.ts
import * as path from "node:path";

import { Buffer } from "node:buffer";

import { createRequire } from "node:module";

var require2 = createRequire(import.meta.url);

var isWindows = process.platform === "win32";

if (process.platform === "linux") {
  Buffer.poolSize = 8 * 1024;
}

Error.stackTraceLimit = 100;

if (!process.env["VSCODE_HANDLES_SIGPIPE"]) {
  let didLogAboutSIGPIPE = false;
  process.on("SIGPIPE", () => {
    if (!didLogAboutSIGPIPE) {
      didLogAboutSIGPIPE = true;
      console.error(new Error(`Unexpected SIGPIPE`));
    }
  });
}

function setupCurrentWorkingDirectory() {
  try {
    if (typeof process.env["VSCODE_CWD"] !== "string") {
      process.env["VSCODE_CWD"] = process.cwd();
    }
    if (process.platform === "win32") {
      process.chdir(path.dirname(process.execPath));
    }
  } catch (err) {
    console.error(err);
  }
}

setupCurrentWorkingDirectory();

function enableASARSupport() {
  if (!process.env["ELECTRON_RUN_AS_NODE"] && !process.versions["electron"]) {
    return;
  }
  if (process.env["VSCODE_DEV"]) {
    return;
  }
  const normalizeDriveLetter = (p) => {
    if (isWindows && p.length >= 2 && p.charCodeAt(1) === 58) {
      const code = p.charCodeAt(0);
      if (code >= 65 && code <= 90 || code >= 97 && code <= 122) {
        return p[0].toLowerCase() + p.slice(1);
      }
    }
    return p;
  };
  const NODE_MODULES_PATH = normalizeDriveLetter(path.join(import.meta.dirname, "../node_modules"));
  const Module = require2("node:module");
  const originalResolveLookupPaths = Module._resolveLookupPaths;
  Module._resolveLookupPaths = function(request, parent) {
    const paths = originalResolveLookupPaths(request, parent);
    if (Array.isArray(paths)) {
      for (let i = 0, len = paths.length; i < len; i++) {
        if (normalizeDriveLetter(paths[i]) === NODE_MODULES_PATH) {
          paths.splice(i, 0, `${paths[i]}.asar`);
          break;
        }
      }
    }
    return paths;
  };
}

enableASARSupport();

function devInjectNodeModuleLookupPath(injectPath) {
  if (!process.env["VSCODE_DEV"]) {
    return;
  }
  if (!injectPath) {
    throw new Error("Missing injectPath");
  }
  const Module = require2("node:module");
  Module.register("./bootstrap-import.js", { parentURL: import.meta.url, data: injectPath });
}

function removeGlobalNodeJsModuleLookupPaths() {
  if (typeof process?.versions?.electron === "string") {
    return;
  }
  const Module = require2("module");
  const globalPaths = Module.globalPaths;
  const originalResolveLookupPaths = Module._resolveLookupPaths;
  Module._resolveLookupPaths = function(moduleName, parent) {
    const paths = originalResolveLookupPaths(moduleName, parent);
    if (Array.isArray(paths)) {
      let commonSuffixLength = 0;
      while (commonSuffixLength < paths.length && paths[paths.length - 1 - commonSuffixLength] === globalPaths[globalPaths.length - 1 - commonSuffixLength]) {
        commonSuffixLength++;
      }
      return paths.slice(0, paths.length - commonSuffixLength);
    }
    return paths;
  };
  const originalNodeModulePaths = Module._nodeModulePaths;
  Module._nodeModulePaths = function(from) {
    let paths = originalNodeModulePaths(from);
    if (!isWindows) {
      return paths;
    }
    const isDrive = (p) => p.length >= 3 && p.endsWith(":\\");
    if (!isDrive(from)) {
      paths = paths.filter((p) => !isDrive(path.dirname(p)));
    }
    if (process.env.HOMEDRIVE && process.env.HOMEPATH) {
      const userDir = path.dirname(path.join(process.env.HOMEDRIVE, process.env.HOMEPATH));
      const isUsersDir = (p) => path.relative(p, userDir).length === 0;
      if (!isUsersDir(from)) {
        paths = paths.filter((p) => !isUsersDir(path.dirname(p)));
      }
    }
    return paths;
  };
}
export { setupCurrentWorkingDirectory, enableASARSupport, devInjectNodeModuleLookupPath, removeGlobalNodeJsModuleLookupPaths, path, Buffer, createRequire, require2, isWindows };
