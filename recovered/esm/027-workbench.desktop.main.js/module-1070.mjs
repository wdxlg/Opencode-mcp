// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDialogs.ts
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { IFileDialogService } from "./module-0267.mjs";


// src/vs/workbench/api/browser/mainThreadDialogs.ts
var MainThreadDialogs = class {
  constructor(context2, _fileDialogService) {
    this._fileDialogService = _fileDialogService;
  }
  dispose() {
  }
  async $showOpenDialog(options3) {
    const convertedOptions = MainThreadDialogs._convertOpenOptions(options3);
    if (!convertedOptions.defaultUri) {
      convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
    }
    return Promise.resolve(this._fileDialogService.showOpenDialog(convertedOptions));
  }
  async $showSaveDialog(options3) {
    const convertedOptions = MainThreadDialogs._convertSaveOptions(options3);
    if (!convertedOptions.defaultUri) {
      convertedOptions.defaultUri = await this._fileDialogService.defaultFilePath();
    }
    return Promise.resolve(this._fileDialogService.showSaveDialog(convertedOptions));
  }
  static _convertOpenOptions(options3) {
    const result = {
      openLabel: options3?.openLabel || void 0,
      canSelectFiles: options3?.canSelectFiles || !options3?.canSelectFiles && !options3?.canSelectFolders,
      canSelectFolders: options3?.canSelectFolders,
      canSelectMany: options3?.canSelectMany,
      defaultUri: options3?.defaultUri ? URI.revive(options3.defaultUri) : void 0,
      title: options3?.title || void 0,
      availableFileSystems: []
    };
    if (options3?.filters) {
      result.filters = [];
      for (const [key3, value2] of Object.entries(options3.filters)) {
        result.filters.push({ name: key3, extensions: value2 });
      }
    }
    return result;
  }
  static _convertSaveOptions(options3) {
    const result = {
      defaultUri: options3?.defaultUri ? URI.revive(options3.defaultUri) : void 0,
      saveLabel: options3?.saveLabel || void 0,
      title: options3?.title || void 0
    };
    if (options3?.filters) {
      result.filters = [];
      for (const [key3, value2] of Object.entries(options3.filters)) {
        result.filters.push({ name: key3, extensions: value2 });
      }
    }
    return result;
  }
};

MainThreadDialogs = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDialogs),
  __decorateParam(1, IFileDialogService)
], MainThreadDialogs);
export { MainThreadDialogs };
