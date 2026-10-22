// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostAiSettingsSearch.ts
import { MainContext } from "./module-0054.mjs";
import { Progress } from "./module-0096.mjs";
import { AiSettingsSearch } from "./module-0245.mjs";
import { Disposable3 } from "./module-0244.mjs";


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
    const progressReporter = new Progress((data) => {
      this._proxy.$handleSearchResult(handle, AiSettingsSearch.fromSettingsSearchResult(data));
    });
    return provider.provideSettingsSearchResults(query, option, progressReporter, token);
  }
  registerSettingsSearchProvider(extension, provider) {
    const handle = this._nextHandle;
    this._nextHandle++;
    this._settingsSearchProviders.set(handle, provider);
    this._proxy.$registerAiSettingsSearchProvider(handle);
    return new Disposable3(() => {
      this._proxy.$unregisterAiSettingsSearchProvider(handle);
      this._settingsSearchProviders.delete(handle);
    });
  }
};
export { ExtHostAiSettingsSearch };
