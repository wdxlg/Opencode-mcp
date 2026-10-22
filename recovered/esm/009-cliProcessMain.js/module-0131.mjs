// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/languagePacks/common/languagePacks.ts
import { createDecorator } from "./module-0030.mjs";
import { Disposable } from "./module-0011.mjs";
import { CancellationTokenSource } from "./module-0018.mjs";
import { language } from "./module-0014.mjs";
import { localize } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionGalleryService } from "./module-0066.mjs";


// src/vs/platform/languagePacks/common/languagePacks.ts
function getLocale(extension) {
  return extension.tags.find((t) => t.startsWith("lp-"))?.split("lp-")[1];
}

var ILanguagePackService = createDecorator("languagePackService");

var LanguagePackBaseService = class extends Disposable {
  constructor(extensionGalleryService) {
    super();
    this.extensionGalleryService = extensionGalleryService;
  }
  async getAvailableLanguages() {
    const timeout2 = new CancellationTokenSource();
    setTimeout(() => timeout2.cancel(), 1e3);
    let result;
    try {
      result = await this.extensionGalleryService.query({
        text: 'category:"language packs"',
        pageSize: 20
      }, timeout2.token);
    } catch (_) {
      return [];
    }
    const languagePackExtensions = result.firstPage.filter((e) => e.properties.localizedLanguages?.length && e.tags.some((t) => t.startsWith("lp-")));
    const allFromMarketplace = languagePackExtensions.map((lp) => {
      const languageName = lp.properties.localizedLanguages?.[0];
      const locale = getLocale(lp);
      const baseQuickPick = this.createQuickPickItem(locale, languageName, lp);
      return {
        ...baseQuickPick,
        extensionId: lp.identifier.id,
        galleryExtension: lp
      };
    });
    allFromMarketplace.push(this.createQuickPickItem("en", "English"));
    return allFromMarketplace;
  }
  createQuickPickItem(locale, languageName, languagePack) {
    const label = languageName ?? locale;
    let description;
    if (label !== locale) {
      description = `(${locale})`;
    }
    if (locale.toLowerCase() === language.toLowerCase()) {
      description ??= "";
      description += localize(3068, null);
    }
    if (languagePack?.installCount) {
      description ??= "";
      const count = languagePack.installCount;
      let countLabel;
      if (count > 1e6) {
        countLabel = `${Math.floor(count / 1e5) / 10}M`;
      } else if (count > 1e3) {
        countLabel = `${Math.floor(count / 1e3)}K`;
      } else {
        countLabel = String(count);
      }
      description += ` $(cloud-download) ${countLabel}`;
    }
    return {
      id: locale,
      label,
      description
    };
  }
};

LanguagePackBaseService = __decorateClass([
  __decorateParam(0, IExtensionGalleryService)
], LanguagePackBaseService);
export { getLocale, ILanguagePackService, LanguagePackBaseService };
