// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/amdX.ts
import { FileAccess, Schemas, VSCODE_AUTHORITY, nodeModulesAsarPath, nodeModulesPath } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { URI } from "./module-0032.mjs";
import { hasElectronUserAgent, isElectron, isWebWorker } from "./module-0014.mjs";


// src/vs/amdX.ts
var DefineCall = class {
  constructor(id2, dependencies, callback) {
    this.id = id2;
    this.dependencies = dependencies;
    this.callback = callback;
  }
};

var AMDModuleImporter = class _AMDModuleImporter {
  constructor() {
    this._isWebWorker = typeof self === "object" && self.constructor && self.constructor.name === "DedicatedWorkerGlobalScope";
    this._isRenderer = typeof document === "object";
    this._defineCalls = [];
    this._state = 1 /* Uninitialized */;
  }
  static {
    this.INSTANCE = new _AMDModuleImporter();
  }
  _initialize() {
    if (this._state === 1 /* Uninitialized */) {
      if (globalThis.define) {
        this._state = 3 /* InitializedExternal */;
        return;
      }
    } else {
      return;
    }
    this._state = 2 /* InitializedInternal */;
    globalThis.define = (id2, dependencies, callback) => {
      if (typeof id2 !== "string") {
        callback = dependencies;
        dependencies = id2;
        id2 = null;
      }
      if (typeof dependencies !== "object" || !Array.isArray(dependencies)) {
        callback = dependencies;
        dependencies = null;
      }
      this._defineCalls.push(new DefineCall(id2, dependencies, callback));
    };
    globalThis.define.amd = true;
    if (this._isRenderer) {
      this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? window.trustedTypes?.createPolicy("amdLoader", {
        createScriptURL(value2) {
          if (value2.startsWith(window.location.origin)) {
            return value2;
          }
          if (value2.startsWith(`${Schemas.vscodeFileResource}://${VSCODE_AUTHORITY}`)) {
            return value2;
          }
          throw new Error(`[trusted_script_src] Invalid script url: ${value2}`);
        }
      });
    } else if (this._isWebWorker) {
      this._amdPolicy = globalThis._VSCODE_WEB_PACKAGE_TTP ?? globalThis.trustedTypes?.createPolicy("amdLoader", {
        createScriptURL(value2) {
          return value2;
        }
      });
    }
  }
  async load(scriptSrc) {
    this._initialize();
    if (this._state === 3 /* InitializedExternal */) {
      return new Promise((resolve3) => {
        const tmpModuleId = generateUuid();
        globalThis.define(tmpModuleId, [scriptSrc], function(moduleResult) {
          resolve3(moduleResult);
        });
      });
    }
    const defineCall = await (this._isWebWorker ? this._workerLoadScript(scriptSrc) : this._isRenderer ? this._rendererLoadScript(scriptSrc) : this._nodeJSLoadScript(scriptSrc));
    if (!defineCall) {
      console.warn(`Did not receive a define call from script ${scriptSrc}`);
      return void 0;
    }
    const exports2 = {};
    const dependencyObjs = [];
    const dependencyModules = [];
    if (Array.isArray(defineCall.dependencies)) {
      for (const mod of defineCall.dependencies) {
        if (mod === "exports") {
          dependencyObjs.push(exports2);
        } else {
          dependencyModules.push(mod);
        }
      }
    }
    if (dependencyModules.length > 0) {
      throw new Error(`Cannot resolve dependencies for script ${scriptSrc}. The dependencies are: ${dependencyModules.join(", ")}`);
    }
    if (typeof defineCall.callback === "function") {
      return defineCall.callback(...dependencyObjs) ?? exports2;
    } else {
      return defineCall.callback;
    }
  }
  _rendererLoadScript(scriptSrc) {
    return new Promise((resolve3, reject) => {
      const scriptElement = document.createElement("script");
      scriptElement.setAttribute("async", "async");
      scriptElement.setAttribute("type", "text/javascript");
      const unbind = () => {
        scriptElement.removeEventListener("load", loadEventListener);
        scriptElement.removeEventListener("error", errorEventListener);
      };
      const loadEventListener = (e) => {
        unbind();
        resolve3(this._defineCalls.pop());
      };
      const errorEventListener = (e) => {
        unbind();
        reject(e);
      };
      scriptElement.addEventListener("load", loadEventListener);
      scriptElement.addEventListener("error", errorEventListener);
      if (this._amdPolicy) {
        scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
      }
      scriptElement.setAttribute("src", scriptSrc);
      window.document.getElementsByTagName("head")[0].appendChild(scriptElement);
    });
  }
  async _workerLoadScript(scriptSrc) {
    if (this._amdPolicy) {
      scriptSrc = this._amdPolicy.createScriptURL(scriptSrc);
    }
    await import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      scriptSrc
    );
    return this._defineCalls.pop();
  }
  async _nodeJSLoadScript(scriptSrc) {
    try {
      const module2 = (await import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        `${"module"}`
      )).default;
      const nodeRequire = module2.createRequire(import.meta.url);
      const fs = nodeRequire("fs");
      const vm = nodeRequire("vm");
      const filePath = URI.parse(scriptSrc).fsPath;
      const content2 = fs.readFileSync(filePath).toString();
      const scriptSource = module2.wrap(content2.replace(/^#!.*/, ""));
      const script = new vm.Script(scriptSource);
      const compileWrapper = script.runInThisContext();
      compileWrapper.apply();
      return this._defineCalls.pop();
    } catch (error) {
      throw error;
    }
  }
};

var cache = /* @__PURE__ */ new Map();

async function importAMDNodeModule(nodeModuleName, pathInsideNodeModule, isBuilt) {
  if (isBuilt === void 0) {
    const product2 = globalThis._VSCODE_PRODUCT_JSON;
    isBuilt = Boolean((product2 ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
  }
  const nodeModulePath = pathInsideNodeModule ? `${nodeModuleName}/${pathInsideNodeModule}` : nodeModuleName;
  if (cache.has(nodeModulePath)) {
    return cache.get(nodeModulePath);
  }
  let scriptSrc;
  if (/^\w[\w\d+.-]*:\/\//.test(nodeModulePath)) {
    scriptSrc = nodeModulePath;
  } else {
    const useASAR = isBuilt && (isElectron || isWebWorker && hasElectronUserAgent);
    const actualNodeModulesPath = useASAR ? nodeModulesAsarPath : nodeModulesPath;
    const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
    scriptSrc = FileAccess.asBrowserUri(resourcePath).toString(true);
  }
  const result = AMDModuleImporter.INSTANCE.load(scriptSrc);
  cache.set(nodeModulePath, result);
  return result;
}

function resolveAmdNodeModulePath(nodeModuleName, pathInsideNodeModule) {
  const product2 = globalThis._VSCODE_PRODUCT_JSON;
  const isBuilt = Boolean((product2 ?? globalThis.vscode?.context?.configuration()?.product)?.commit);
  const useASAR = isBuilt && (isElectron || isWebWorker && hasElectronUserAgent);
  const nodeModulePath = `${nodeModuleName}/${pathInsideNodeModule}`;
  const actualNodeModulesPath = useASAR ? nodeModulesAsarPath : nodeModulesPath;
  const resourcePath = `${actualNodeModulesPath}/${nodeModulePath}`;
  return FileAccess.asBrowserUri(resourcePath).toString(true);
}
export { importAMDNodeModule, resolveAmdNodeModulePath, DefineCall, AMDModuleImporter, cache };
