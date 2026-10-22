// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostAiSettingsSearch.ts
import { MainContext } from "./module-0025.mjs";
import { Progress } from "./module-0089.mjs";
import { AiSettingsSearch } from "./module-0239.mjs";
import { Disposable2 } from "./module-0238.mjs";


// src/vs/workbench/api/common/extHostAiSettingsSearch.ts
var ExtHostAiSettingsSearch = class {
  constructor(mainContext) {
    this._settingsSearchProviders = /* @__PURE__ */ new Map();
    this._nextHandle = 0;
    this._proxy = mainContext.getProxy(MainContext.MainThreadAiSettingsSearch);
  }
  async $startSearch(handle, query, option, token) {
    if (this._settingsSearchProviders.size === 0) {
      throw new Error("No related information providers registered");
    }
    const provider = this._settingsSearchProviders.get(handle);
    if (!provider) {
      throw new Error("Settings search provider not found");
    }
    const progressReporter = new Progress((data2) => {
      this._proxy.$handleSearchResult(handle, AiSettingsSearch.fromSettingsSearchResult(data2));
    });
    return provider.provideSettingsSearchResults(query, option, progressReporter, token);
  }
  registerSettingsSearchProvider(extension, provider) {
    const handle = this._nextHandle;
    this._nextHandle++;
    this._settingsSearchProviders.set(handle, provider);
    this._proxy.$registerAiSettingsSearchProvider(handle);
    return new Disposable2(() => {
      this._proxy.$unregisterAiSettingsSearchProvider(handle);
      this._settingsSearchProviders.delete(handle);
    });
  }
};
export { ExtHostAiSettingsSearch };
