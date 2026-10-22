// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/url/browser/trustedDomainService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { WindowIdleValue } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { TRUSTED_DOMAINS_STORAGE_KEY, readStaticTrustedDomains } from "./module-1288.mjs";
import { isURLDomainTrusted } from "./module-1239.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/url/browser/trustedDomainService.ts
var TrustedDomainService = class extends Disposable {
  constructor(_instantiationService, _storageService) {
    super();
    this._instantiationService = _instantiationService;
    this._storageService = _storageService;
    this._onDidChangeTrustedDomains = this._register(new Emitter());
    this.onDidChangeTrustedDomains = this._onDidChangeTrustedDomains.event;
    const initStaticDomainsResult = () => {
      return new WindowIdleValue(mainWindow, () => {
        const { defaultTrustedDomains, trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
        return [
          ...defaultTrustedDomains,
          ...trustedDomains
        ];
      });
    };
    this._staticTrustedDomainsResult = initStaticDomainsResult();
    this._register(this._storageService.onDidChangeValue(-1 /* APPLICATION */, TRUSTED_DOMAINS_STORAGE_KEY, this._store)(() => {
      this._staticTrustedDomainsResult?.dispose();
      this._staticTrustedDomainsResult = initStaticDomainsResult();
      this._onDidChangeTrustedDomains.fire();
    }));
  }
  get trustedDomains() {
    return this._staticTrustedDomainsResult.value;
  }
  isValid(resource) {
    const { defaultTrustedDomains, trustedDomains } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
    const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
    return isURLDomainTrusted(resource, allTrustedDomains);
  }
};

TrustedDomainService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService)
], TrustedDomainService);
export { TrustedDomainService };
