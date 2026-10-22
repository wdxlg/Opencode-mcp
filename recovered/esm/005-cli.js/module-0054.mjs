// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/bootstrap-node.ts



// src/bootstrap-node.ts
import * as path from "node:path";

import * as fs from "node:fs";

import { Buffer as Buffer2 } from "node:buffer";

import { createRequire } from "node:module";

var require2 = createRequire(import.meta.url);

var isWindows = process.platform === "win32";

if (process.platform === "linux") {
  Buffer2.poolSize = 8 * 1024;
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

function configurePortable(product3) {
  const appRoot = path.dirname(import.meta.dirname);
  function getApplicationPath() {
    if (process.env["VSCODE_DEV"]) {
      return appRoot;
    }
    if (process.platform === "darwin") {
      return path.dirname(path.dirname(path.dirname(appRoot)));
    }
    if (process.platform === "win32" && product3.win32VersionedUpdate) {
      return path.dirname(path.dirname(path.dirname(appRoot)));
    }
    return path.dirname(path.dirname(appRoot));
  }
  function getPortableDataPath() {
    if ((process.platform === "win32" || process.platform === "linux") && !("target" in product3)) {
      const application = getApplicationPath();
      const localData = path.join(application, "data");
      const recoveryData = path.join(application, ".recovery-profile");
      const requested = process.env["VSCODE_PORTABLE"];
      const same = (a, b) => process.platform === "win32" ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b);
      const selected = requested && same(requested, recoveryData) ? recoveryData : localData;
      // Never inherit another installation's profile, and never fall back to shared AppData.
      if (fs.existsSync(selected) && fs.lstatSync(selected).isSymbolicLink()) throw new Error("Portable profile cannot be a link: " + selected);
      fs.mkdirSync(selected, { recursive: true });
      if (!same(fs.realpathSync(selected), path.join(fs.realpathSync(application), path.basename(selected)))) throw new Error("Portable profile resolves outside this runtime");
      for (const name of ["tmp", "user-data", "extensions", ".opencode", "skills"]) {
        const owned = path.join(selected, name);
        if (fs.existsSync(owned) && fs.lstatSync(owned).isSymbolicLink()) throw new Error("Portable data cannot be a link: " + owned);
      }
      fs.mkdirSync(path.join(selected, "tmp"), { recursive: true });
      return selected;
    }
    if (process.env["VSCODE_PORTABLE"]) return process.env["VSCODE_PORTABLE"];
    if (process.platform === "win32" || process.platform === "linux") return path.join(getApplicationPath(), "data");
    const portableDataName = product3.portable || `${product3.applicationName}-portable-data`;
    return path.join(path.dirname(getApplicationPath()), portableDataName);
  }
  const portableDataPath = getPortableDataPath();
  const isPortable = !("target" in product3) && fs.existsSync(portableDataPath);
  const portableTempPath = path.join(portableDataPath, "tmp");
  const isTempPortable = isPortable && fs.existsSync(portableTempPath);
  if (isPortable) {
    process.env["VSCODE_PORTABLE"] = portableDataPath;
  } else {
    delete process.env["VSCODE_PORTABLE"];
  }
  if (isTempPortable) {
    if (process.platform === "win32") {
      process.env["TMP"] = portableTempPath;
      process.env["TEMP"] = portableTempPath;
    } else {
      process.env["TMPDIR"] = portableTempPath;
    }
  }
  return {
    portableDataPath,
    isPortable
  };
}
export { setupCurrentWorkingDirectory, enableASARSupport, configurePortable, path, fs, Buffer2, createRequire, require2, isWindows };
