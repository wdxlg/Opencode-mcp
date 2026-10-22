// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/hotReload.ts



// src/vs/base/common/hotReload.ts
var _isHotReloadEnabled = false;

function isHotReloadEnabled() {
  return _isHotReloadEnabled;
}

function registerHotReloadHandler(handler) {
  if (!isHotReloadEnabled()) {
    return { dispose() {
    } };
  } else {
    const handlers = registerGlobalHotReloadHandler();
    handlers.add(handler);
    return {
      dispose() {
        handlers.delete(handler);
      }
    };
  }
}

function registerGlobalHotReloadHandler() {
  if (!hotReloadHandlers) {
    hotReloadHandlers = /* @__PURE__ */ new Set();
  }
  const g = globalThis;
  if (!g.$hotReload_applyNewExports) {
    g.$hotReload_applyNewExports = (args2) => {
      const args22 = { config: { mode: void 0 }, ...args2 };
      const results = [];
      for (const h3 of hotReloadHandlers) {
        const result = h3(args22);
        if (result) {
          results.push(result);
        }
      }
      if (results.length > 0) {
        return (newExports) => {
          let result = false;
          for (const r2 of results) {
            if (r2(newExports)) {
              result = true;
            }
          }
          return result;
        };
      }
      return void 0;
    };
  }
  return hotReloadHandlers;
}

var hotReloadHandlers = void 0;

if (isHotReloadEnabled()) {
  registerHotReloadHandler(({ oldExports, newSrc, config }) => {
    if (config.mode !== "patch-prototype") {
      return void 0;
    }
    return (newExports) => {
      for (const key3 in newExports) {
        const exportedItem = newExports[key3];
        console.log(`[hot-reload] Patching prototype methods of '${key3}'`, { exportedItem });
        if (typeof exportedItem === "function" && exportedItem.prototype) {
          const oldExportedItem = oldExports[key3];
          if (oldExportedItem) {
            for (const prop of Object.getOwnPropertyNames(exportedItem.prototype)) {
              const descriptor = Object.getOwnPropertyDescriptor(exportedItem.prototype, prop);
              const oldDescriptor = Object.getOwnPropertyDescriptor(oldExportedItem.prototype, prop);
              if (descriptor?.value?.toString() !== oldDescriptor?.value?.toString()) {
                console.log(`[hot-reload] Patching prototype method '${key3}.${prop}'`);
              }
              Object.defineProperty(oldExportedItem.prototype, prop, descriptor);
            }
            newExports[key3] = oldExportedItem;
          }
        }
      }
      return true;
    };
  });
}
export { isHotReloadEnabled, registerHotReloadHandler, registerGlobalHotReloadHandler, _isHotReloadEnabled, hotReloadHandlers };
