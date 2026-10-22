// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadAiSettingsSearch.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IAiSettingsSearchService } from "./module-1209.mjs";


// src/vs/workbench/api/browser/mainThreadAiSettingsSearch.ts
var MainThreadAiSettingsSearch = class extends Disposable {
  constructor(context2, _settingsSearchService) {
    super();
    this._settingsSearchService = _settingsSearchService;
    this._registrations = this._register(new DisposableMap());
    this._proxy = context2.getProxy(ExtHostContext.ExtHostAiSettingsSearch);
  }
  $registerAiSettingsSearchProvider(handle2) {
    const provider = {
      searchSettings: (query, option2, token) => {
        return this._proxy.$startSearch(handle2, query, option2, token);
      }
    };
    this._registrations.set(handle2, this._settingsSearchService.registerSettingsSearchProvider(provider));
  }
  $unregisterAiSettingsSearchProvider(handle2) {
    this._registrations.deleteAndDispose(handle2);
  }
  $handleSearchResult(handle2, result) {
    if (!this._registrations.has(handle2)) {
      throw new Error(`No AI settings search provider found`);
    }
    this._settingsSearchService.handleSearchResult(result);
  }
};

MainThreadAiSettingsSearch = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadAiSettingsSearch),
  __decorateParam(1, IAiSettingsSearchService)
], MainThreadAiSettingsSearch);
export { MainThreadAiSettingsSearch };
