// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/bootstrap-esm.ts
import { init_performance, mark } from "./module-0001.mjs";
import { pkg, product } from "./module-0396.mjs";


// src/bootstrap-esm.ts
import * as fs2 from "node:fs";

import { createRequire as createRequire3, isBuiltin, registerHooks } from "node:module";

import { dirname as dirname2, join as join2 } from "node:path";

import { fileURLToPath, pathToFileURL } from "node:url";


// src/bootstrap-esm.ts
init_performance();

globalThis._VSCODE_PRODUCT_JSON = { ...product };

globalThis._VSCODE_PACKAGE_JSON = { ...pkg };

globalThis._VSCODE_FILE_ROOT = import.meta.dirname;

function enableASARSupport2() {
  if (!process.env["ELECTRON_RUN_AS_NODE"] && !process.versions["electron"]) {
    return;
  }
  let trace;
  const traceSink = process.env["VSCODE_ASAR_TRACE"] || void 0;
  if (traceSink) {
    const prefix = "[asar-resolve] ";
    if (traceSink === "1" || traceSink === "true" || traceSink === "on" || traceSink === "stderr") {
      trace = (message) => {
        try {
          process.stderr.write(`${prefix}${message}
`);
        } catch {
        }
      };
    } else {
      trace = (message) => {
        try {
          fs2.appendFileSync(traceSink, `${prefix}${message}
`);
        } catch {
        }
      };
    }
  }
  const normalizeDriveLetter2 = (path4) => {
    if (process.platform === "win32" && path4.length >= 2 && (path4.charCodeAt(0) >= 65 && path4.charCodeAt(0) <= 90 || path4.charCodeAt(0) >= 97 && path4.charCodeAt(0) <= 122) && path4.charCodeAt(1) === 58) {
      return path4[0].toLowerCase() + path4.slice(1);
    }
    return path4;
  };
  const isBarePackageSpecifier = (specifier) => {
    if (specifier === "") {
      return false;
    }
    const c = specifier[0];
    if (c === "." || c === "/" || c === "#") {
      return false;
    }
    return !URL.canParse(specifier);
  };
  const packageNameOf = (specifier) => {
    if (specifier[0] === "@") {
      const firstSlash = specifier.indexOf("/");
      if (firstSlash === -1) {
        return specifier;
      }
      const secondSlash = specifier.indexOf("/", firstSlash + 1);
      return secondSlash === -1 ? specifier : specifier.slice(0, secondSlash);
    }
    const slash = specifier.indexOf("/");
    return slash === -1 ? specifier : specifier.slice(0, slash);
  };
  const appRoot = dirname2(import.meta.dirname);
  const resourcesPath = process.env["VSCODE_DEV"] ? void 0 : normalizeDriveLetter2(appRoot);
  const asarRequire = resourcesPath ? createRequire3(join2(appRoot, "node_modules.asar", "x.js")) : void 0;
  trace?.(`tracing enabled (node ${process.versions.node}); resourcesPath=${resourcesPath}`);
  let commonJSConditions;
  let captureCommonJSConditions = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (captureCommonJSConditions) {
        captureCommonJSConditions = false;
        commonJSConditions = [...context.conditions];
        return nextResolve(specifier, context);
      }
      const cjsConditions = commonJSConditions;
      const isCommonJS = context.importAttributes === void 0 || cjsConditions !== void 0 && context.conditions.length === cjsConditions.length && context.conditions.every((condition, index) => condition === cjsConditions[index]);
      if (isCommonJS) {
        return nextResolve(specifier, context);
      }
      if (specifier === "fs") {
        trace?.(`map "fs" -> node:original-fs (from ${context.parentURL})`);
        return {
          format: "builtin",
          shortCircuit: true,
          url: "node:original-fs"
        };
      }
      if (asarRequire && resourcesPath && context.parentURL && isBarePackageSpecifier(specifier) && !isBuiltin(specifier) && specifier !== "electron" && !specifier.startsWith("electron/")) {
        let parentPath;
        try {
          parentPath = normalizeDriveLetter2(fileURLToPath(context.parentURL));
        } catch {
          parentPath = void 0;
        }
        if (parentPath && parentPath.startsWith(resourcesPath)) {
          trace?.(`resolve "${specifier}" from "${context.parentURL}"`);
          let defaultResult;
          let defaultError;
          try {
            defaultResult = nextResolve(specifier, context);
          } catch (error) {
            defaultError = error instanceof Error ? error : new Error(String(error));
          }
          if (defaultResult) {
            let resolvedPath;
            try {
              resolvedPath = normalizeDriveLetter2(fileURLToPath(defaultResult.url));
            } catch {
              resolvedPath = void 0;
            }
            if (!resolvedPath || resolvedPath.startsWith(resourcesPath)) {
              trace?.(`  default -> ${defaultResult.url} (in app, ACCEPT)`);
              return defaultResult;
            }
            trace?.(`  default -> ${defaultResult.url} (outside app, reject)`);
          } else {
            trace?.(`  default -> <none> (${defaultError?.message})`);
          }
          let packageJsonPath;
          try {
            packageJsonPath = asarRequire.resolve(`./${packageNameOf(specifier)}/package.json`);
          } catch {
            trace?.(`  archive: package "${packageNameOf(specifier)}" NOT in archive -> throw`);
            throw defaultError ?? new Error(`Cannot find package '${specifier}' within the application resources`);
          }
          trace?.(`  archive pkg.json -> ${packageJsonPath}`);
          try {
            const selfRef = nextResolve(specifier, { ...context, parentURL: pathToFileURL(packageJsonPath).href });
            let selfRefPath;
            try {
              selfRefPath = normalizeDriveLetter2(fileURLToPath(selfRef.url));
            } catch {
              selfRefPath = void 0;
            }
            if (selfRefPath && selfRefPath.startsWith(resourcesPath)) {
              trace?.(`  self-ref -> ${selfRef.url} (in app, ACCEPT)`);
              return selfRef;
            }
            trace?.(`  self-ref -> ${selfRef.url} (escaped app, reject)`);
          } catch (error) {
            trace?.(`  self-ref -> <throw> (${error instanceof Error ? error.message : String(error)})`);
          }
          const resolved = asarRequire.resolve(`./${specifier}`);
          const url = pathToFileURL(resolved).href;
          trace?.(`  direct -> ${url} (ACCEPT)`);
          return { url, shortCircuit: true };
        }
        trace?.(`defer "${specifier}" (parent outside app resources: ${context.parentURL})`);
      }
      return nextResolve(specifier, context);
    }
  });
  try {
    createRequire3(import.meta.url).resolve("node:fs");
  } finally {
    captureCommonJSConditions = false;
  }
  if (!commonJSConditions) {
    throw new Error("Failed to identify CommonJS module resolution conditions");
  }
}

enableASARSupport2();

var setupNLSResult = void 0;

function setupNLS() {
  if (!setupNLSResult) {
    setupNLSResult = doSetupNLS();
  }
  return setupNLSResult;
}

async function doSetupNLS() {
  mark("code/willLoadNls");
  let nlsConfig = void 0;
  let messagesFile;
  if (process.env["VSCODE_NLS_CONFIG"]) {
    try {
      nlsConfig = JSON.parse(process.env["VSCODE_NLS_CONFIG"]);
      if (nlsConfig?.languagePack?.messagesFile) {
        messagesFile = nlsConfig.languagePack.messagesFile;
      } else if (nlsConfig?.defaultMessagesFile) {
        messagesFile = nlsConfig.defaultMessagesFile;
      }
      globalThis._VSCODE_NLS_LANGUAGE = nlsConfig?.resolvedLanguage;
    } catch (e) {
      console.error(`Error reading VSCODE_NLS_CONFIG from environment: ${e}`);
    }
  }
  if (process.env["VSCODE_DEV"] || // no NLS support in dev mode
  !messagesFile) {
    return void 0;
  }
  try {
    globalThis._VSCODE_NLS_MESSAGES = JSON.parse((await fs2.promises.readFile(messagesFile)).toString());
  } catch (error) {
    console.error(`Error reading NLS messages file ${messagesFile}: ${error}`);
    if (nlsConfig?.languagePack?.corruptMarkerFile) {
      try {
        await fs2.promises.writeFile(nlsConfig.languagePack.corruptMarkerFile, "corrupted");
      } catch (error2) {
        console.error(`Error writing corrupted NLS marker file: ${error2}`);
      }
    }
    if (nlsConfig?.defaultMessagesFile && nlsConfig.defaultMessagesFile !== messagesFile) {
      try {
        globalThis._VSCODE_NLS_MESSAGES = JSON.parse((await fs2.promises.readFile(nlsConfig.defaultMessagesFile)).toString());
      } catch (error2) {
        console.error(`Error reading default NLS messages file ${nlsConfig.defaultMessagesFile}: ${error2}`);
      }
    }
  }
  mark("code/didLoadNls");
  return nlsConfig;
}

async function bootstrapESM() {
  await setupNLS();
}
export { enableASARSupport2, setupNLS, doSetupNLS, bootstrapESM, fs2, createRequire3, isBuiltin, registerHooks, dirname2, join2, fileURLToPath, pathToFileURL, setupNLSResult };
