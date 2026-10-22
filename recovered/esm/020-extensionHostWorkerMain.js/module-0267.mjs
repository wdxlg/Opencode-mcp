// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostProgress.ts
import { createDecorator } from "./module-0038.mjs";
import { MainContext } from "./module-0025.mjs";
import { ProgressLocation3 } from "./module-0239.mjs";
import { onUnexpectedExternalError } from "./module-0002.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { Progress } from "./module-0089.mjs";
import { throttle } from "./module-0266.mjs";


// src/vs/workbench/api/common/extHostProgress.ts
var IExtHostProgress = createDecorator("IExtHostProgress");

var ExtHostProgress = class {
  constructor(extHostRpc) {
    this._handles = 0;
    this._mapHandleToCancellationSource = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadProgress);
  }
  async withProgress(extension, options2, task) {
    const handle = this._handles++;
    const { title, location: location2, cancellable } = options2;
    const source = { label: extension.displayName || extension.name, id: extension.identifier.value };
    this._proxy.$startProgress(handle, { location: ProgressLocation3.from(location2), title, source, cancellable }, !extension.isUnderDevelopment ? extension.identifier.value : void 0).catch(onUnexpectedExternalError);
    return this._withProgress(handle, task, !!cancellable);
  }
  async withProgressFromSource(source, options2, task) {
    const handle = this._handles++;
    const { title, location: location2, cancellable } = options2;
    this._proxy.$startProgress(handle, { location: ProgressLocation3.from(location2), title, source, cancellable }, void 0).catch(onUnexpectedExternalError);
    return this._withProgress(handle, task, !!cancellable);
  }
  _withProgress(handle, task, cancellable) {
    let source;
    if (cancellable) {
      source = new CancellationTokenSource();
      this._mapHandleToCancellationSource.set(handle, source);
    }
    const progressEnd = (handle2) => {
      this._proxy.$progressEnd(handle2);
      this._mapHandleToCancellationSource.delete(handle2);
      source?.dispose();
    };
    let p;
    try {
      p = task(new ProgressCallback(this._proxy, handle), cancellable && source ? source.token : CancellationToken.None);
    } catch (err) {
      progressEnd(handle);
      throw err;
    }
    p.then((result) => progressEnd(handle), (err) => progressEnd(handle));
    return p;
  }
  $acceptProgressCanceled(handle) {
    const source = this._mapHandleToCancellationSource.get(handle);
    if (source) {
      source.cancel();
      this._mapHandleToCancellationSource.delete(handle);
    }
  }
};

ExtHostProgress = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostProgress);

function mergeProgress(result, currentValue) {
  result.message = currentValue.message;
  if (typeof currentValue.increment === "number") {
    if (typeof result.increment === "number") {
      result.increment += currentValue.increment;
    } else {
      result.increment = currentValue.increment;
    }
  }
  return result;
}

var ProgressCallback = class extends Progress {
  constructor(_proxy, _handle) {
    super((p) => this.throttledReport(p));
    this._proxy = _proxy;
    this._handle = _handle;
  }
  throttledReport(p) {
    this._proxy.$progressReport(this._handle, p);
  }
};

__decorateClass([
  throttle(100, (result, currentValue) => mergeProgress(result, currentValue), () => /* @__PURE__ */ Object.create(null))
], ProgressCallback.prototype, "throttledReport", 1);
export { mergeProgress, IExtHostProgress, ExtHostProgress, ProgressCallback };
