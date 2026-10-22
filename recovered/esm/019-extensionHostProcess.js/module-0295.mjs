// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostDecorations.ts
import { MainContext } from "./module-0054.mjs";
import { asArray, groupBy2 } from "./module-0006.mjs";
import { compare, count } from "./module-0023.mjs";
import { dirname } from "./module-0019.mjs";
import { Disposable3, FileDecoration } from "./module-0244.mjs";
import { URI } from "./module-0025.mjs";
import { checkProposedApiEnabled } from "./module-0173.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { ILogService } from "./module-0062.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostDecorations.ts
var ExtHostDecorations = class {
  constructor(extHostRpc, _logService) {
    this._logService = _logService;
    this._provider = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadDecorations);
  }
  static {
    this._handlePool = 0;
  }
  static {
    this._maxEventSize = 250;
  }
  registerFileDecorationProvider(provider, extensionDescription) {
    const handle = ExtHostDecorations._handlePool++;
    this._provider.set(handle, { provider, extensionDescription });
    this._proxy.$registerDecorationProvider(handle, extensionDescription.identifier.value);
    const listener = provider.onDidChangeFileDecorations && provider.onDidChangeFileDecorations((e) => {
      if (!e) {
        this._proxy.$onDidChange(handle, null);
        return;
      }
      const array = asArray(e);
      if (array.length <= ExtHostDecorations._maxEventSize) {
        this._proxy.$onDidChange(handle, array);
        return;
      }
      this._logService.warn("[Decorations] CAPPING events from decorations provider", extensionDescription.identifier.value, array.length);
      const mapped = array.map((uri2) => ({ uri: uri2, rank: count(uri2.path, "/") }));
      const groups = groupBy2(mapped, (a, b) => a.rank - b.rank || compare(a.uri.path, b.uri.path));
      const picked = [];
      outer: for (const uris of groups) {
        let lastDirname;
        for (const obj of uris) {
          const myDirname = dirname(obj.uri.path);
          if (lastDirname !== myDirname) {
            lastDirname = myDirname;
            if (picked.push(obj.uri) >= ExtHostDecorations._maxEventSize) {
              break outer;
            }
          }
        }
      }
      this._proxy.$onDidChange(handle, picked);
    });
    return new Disposable3(() => {
      listener?.dispose();
      this._proxy.$unregisterDecorationProvider(handle);
      this._provider.delete(handle);
    });
  }
  async $provideDecorations(handle, requests, token) {
    if (!this._provider.has(handle)) {
      return /* @__PURE__ */ Object.create(null);
    }
    const result = /* @__PURE__ */ Object.create(null);
    const { provider, extensionDescription: extensionId } = this._provider.get(handle);
    await Promise.all(requests.map(async (request) => {
      try {
        const { uri: uri2, id: id2 } = request;
        const data = await Promise.resolve(provider.provideFileDecoration(URI.revive(uri2), token));
        if (!data) {
          return;
        }
        try {
          FileDecoration.validate(data);
          if (data.badge && typeof data.badge !== "string") {
            checkProposedApiEnabled(extensionId, "codiconDecoration");
          }
          result[id2] = [data.propagate, data.tooltip, data.badge, data.color];
        } catch (e) {
          this._logService.warn(`INVALID decoration from extension '${extensionId.identifier.value}': ${e}`);
        }
      } catch (err) {
        this._logService.error(err);
      }
    }));
    return result;
  }
};

ExtHostDecorations = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService)
], ExtHostDecorations);

var IExtHostDecorations = createDecorator2("IExtHostDecorations");
export { ExtHostDecorations, IExtHostDecorations };
