// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/languagePacks/common/languagePacks.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { language } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionGalleryService } from "./module-0874.mjs";


// src/vs/platform/languagePacks/common/languagePacks.ts
function getLocale(extension) {
  return extension.tags.find((t2) => t2.startsWith("lp-"))?.split("lp-")[1];
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
    const languagePackExtensions = result.firstPage.filter((e4) => e4.properties.localizedLanguages?.length && e4.tags.some((t2) => t2.startsWith("lp-")));
    const allFromMarketplace = languagePackExtensions.map((lp) => {
      const languageName = lp.properties.localizedLanguages?.[0];
      const locale2 = getLocale(lp);
      const baseQuickPick = this.createQuickPickItem(locale2, languageName, lp);
      return {
        ...baseQuickPick,
        extensionId: lp.identifier.id,
        galleryExtension: lp
      };
    });
    allFromMarketplace.push(this.createQuickPickItem("en", "English"));
    return allFromMarketplace;
  }
  createQuickPickItem(locale2, languageName, languagePack) {
    const label3 = languageName ?? locale2;
    let description;
    if (label3 !== locale2) {
      description = `(${locale2})`;
    }
    if (locale2.toLowerCase() === language.toLowerCase()) {
      description ??= "";
      description += localize(3068, null);
    }
    if (languagePack?.installCount) {
      description ??= "";
      const count2 = languagePack.installCount;
      let countLabel;
      if (count2 > 1e6) {
        countLabel = `${Math.floor(count2 / 1e5) / 10}M`;
      } else if (count2 > 1e3) {
        countLabel = `${Math.floor(count2 / 1e3)}K`;
      } else {
        countLabel = String(count2);
      }
      description += ` $(cloud-download) ${countLabel}`;
    }
    return {
      id: locale2,
      label: label3,
      description
    };
  }
};

LanguagePackBaseService = __decorateClass([
  __decorateParam(0, IExtensionGalleryService)
], LanguagePackBaseService);
export { getLocale, ILanguagePackService, LanguagePackBaseService };
