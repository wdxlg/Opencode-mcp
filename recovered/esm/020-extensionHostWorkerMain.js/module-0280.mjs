// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLocalizationService.ts
import { MainContext } from "./module-0025.mjs";
import { LANGUAGE_DEFAULT } from "./module-0016.mjs";
import { format22 } from "./module-0029.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { ILogService } from "./module-0045.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostLocalizationService.ts
var ExtHostLocalizationService = class {
  constructor(initData, rpc, logService) {
    this.logService = logService;
    this.bundleCache = /* @__PURE__ */ new Map();
    this._proxy = rpc.getProxy(MainContext.MainThreadLocalization);
    this.currentLanguage = initData.environment.appLanguage;
    this.isDefaultLanguage = this.currentLanguage === LANGUAGE_DEFAULT;
  }
  getMessage(extensionId, details) {
    const { message, args, comment } = details;
    if (this.isDefaultLanguage) {
      return format22(message, args ?? {});
    }
    let key = message;
    if (comment && comment.length > 0) {
      key += `/${Array.isArray(comment) ? comment.join("") : comment}`;
    }
    const str = this.bundleCache.get(extensionId)?.contents[key];
    if (!str) {
      this.logService.warn(`Using default string since no string found in i18n bundle that has the key: ${key}`);
    }
    return format22(str ?? message, args ?? {});
  }
  getBundle(extensionId) {
    return this.bundleCache.get(extensionId)?.contents;
  }
  getBundleUri(extensionId) {
    return this.bundleCache.get(extensionId)?.uri;
  }
  async initializeLocalizedMessages(extension) {
    if (this.isDefaultLanguage || !extension.l10n && !extension.isBuiltin) {
      return;
    }
    if (this.bundleCache.has(extension.identifier.value)) {
      return;
    }
    let contents;
    const bundleUri = await this.getBundleLocation(extension);
    if (!bundleUri) {
      this.logService.error(`No bundle location found for extension ${extension.identifier.value}`);
      return;
    }
    try {
      const response = await this._proxy.$fetchBundleContents(bundleUri);
      const result = JSON.parse(response);
      contents = extension.isBuiltin ? result.contents?.bundle : result;
    } catch (e) {
      this.logService.error(`Failed to load translations for ${extension.identifier.value} from ${bundleUri}: ${e.message}`);
      return;
    }
    if (contents) {
      this.bundleCache.set(extension.identifier.value, {
        contents,
        uri: bundleUri
      });
    }
  }
  async getBundleLocation(extension) {
    if (extension.isBuiltin) {
      const uri2 = await this._proxy.$fetchBuiltInBundleUri(extension.identifier.value, this.currentLanguage);
      return URI.revive(uri2);
    }
    return extension.l10n ? URI.joinPath(extension.extensionLocation, extension.l10n, `bundle.l10n.${this.currentLanguage}.json`) : void 0;
  }
};

ExtHostLocalizationService = __decorateClass([
  __decorateParam(0, IExtHostInitDataService),
  __decorateParam(1, IExtHostRpcService),
  __decorateParam(2, ILogService)
], ExtHostLocalizationService);

var IExtHostLocalizationService = createDecorator("IExtHostLocalizationService");
export { ExtHostLocalizationService, IExtHostLocalizationService };
