// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostWindow.ts
import { Emitter } from "./module-0019.mjs";
import { decodeBase64 } from "./module-0013.mjs";
import { MainContext } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { isFalsyOrWhitespace } from "./module-0029.mjs";
import { Schemas } from "./module-0031.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostWindow.ts
var ExtHostWindow = class {
  constructor(initData, extHostRpc) {
    this._onDidChangeWindowState = new Emitter();
    this.onDidChangeWindowState = this._onDidChangeWindowState.event;
    this._state = ExtHostWindow.InitialState;
    if (initData.handle) {
      this._nativeHandle = decodeBase64(initData.handle).buffer;
    }
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadWindow);
    this._proxy.$getInitialState().then(({ isFocused, isActive }) => {
      this.onDidChangeWindowProperty("focused", isFocused);
      this.onDidChangeWindowProperty("active", isActive);
    });
  }
  static {
    this.InitialState = {
      focused: true,
      active: true
    };
  }
  getState() {
    const state = this._state;
    return {
      get focused() {
        return state.focused;
      },
      get active() {
        return state.active;
      }
    };
  }
  get nativeHandle() {
    return this._nativeHandle;
  }
  $onDidChangeActiveNativeWindowHandle(handle) {
    this._nativeHandle = handle ? decodeBase64(handle).buffer : void 0;
  }
  $onDidChangeWindowFocus(value) {
    this.onDidChangeWindowProperty("focused", value);
  }
  $onDidChangeWindowActive(value) {
    this.onDidChangeWindowProperty("active", value);
  }
  onDidChangeWindowProperty(property, value) {
    if (value === this._state[property]) {
      return;
    }
    this._state = { ...this._state, [property]: value };
    this._onDidChangeWindowState.fire(this._state);
  }
  openUri(stringOrUri, options2) {
    let uriAsString;
    if (typeof stringOrUri === "string") {
      uriAsString = stringOrUri;
      try {
        stringOrUri = URI.parse(stringOrUri);
      } catch (e) {
        return Promise.reject(`Invalid uri - '${stringOrUri}'`);
      }
    }
    if (isFalsyOrWhitespace(stringOrUri.scheme)) {
      return Promise.reject("Invalid scheme - cannot be empty");
    } else if (stringOrUri.scheme === Schemas.command) {
      return Promise.reject(`Invalid scheme '${stringOrUri.scheme}'`);
    }
    return this._proxy.$openUri(stringOrUri, uriAsString, options2);
  }
  async asExternalUri(uri2, options2) {
    if (isFalsyOrWhitespace(uri2.scheme)) {
      return Promise.reject("Invalid scheme - cannot be empty");
    }
    const result = await this._proxy.$asExternalUri(uri2, options2);
    return URI.from(result);
  }
};

ExtHostWindow = __decorateClass([
  __decorateParam(0, IExtHostInitDataService),
  __decorateParam(1, IExtHostRpcService)
], ExtHostWindow);

var IExtHostWindow = createDecorator("IExtHostWindow");
export { ExtHostWindow, IExtHostWindow };
