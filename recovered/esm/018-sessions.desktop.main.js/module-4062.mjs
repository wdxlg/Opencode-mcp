// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localization/electron-browser/localization.contribution.ts
import { BaseLocalizationWorkbenchContribution } from "./module-4061.mjs";
import { Language, language, locale } from "./module-0014.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { minimumTranslatedStrings } from "./module-4059.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILocaleService } from "./module-1665.mjs";
import { IProductService } from "./module-0875.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0874.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/localization/electron-browser/localization.contribution.ts
var NativeLocalizationWorkbenchContribution = class extends BaseLocalizationWorkbenchContribution {
  constructor(notificationService, localeService, productService, storageService, extensionManagementService, galleryService, extensionsWorkbenchService, telemetryService) {
    super();
    this.notificationService = notificationService;
    this.localeService = localeService;
    this.productService = productService;
    this.storageService = storageService;
    this.extensionManagementService = extensionManagementService;
    this.galleryService = galleryService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.telemetryService = telemetryService;
    this.checkAndInstall();
    this._register(this.extensionManagementService.onDidInstallExtensions((e4) => this.onDidInstallExtensions(e4)));
    this._register(this.extensionManagementService.onDidUninstallExtension((e4) => this.onDidUninstallExtension(e4)));
  }
  static {
    this.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY = "extensionsAssistant/languagePackSuggestionIgnore";
  }
  async onDidInstallExtensions(results) {
    for (const result of results) {
      if (result.operation === 2 /* Install */ && result.local) {
        await this.onDidInstallExtension(result.local, !!result.context?.extensionsSync);
      }
    }
  }
  async onDidInstallExtension(localExtension, fromSettingsSync) {
    const localization = localExtension.manifest.contributes?.localizations?.[0];
    if (!localization || language === localization.languageId) {
      return;
    }
    const { languageId, languageName } = localization;
    this.notificationService.prompt(
      severity_default.Info,
      localize(16580, null, this.productService.nameLong, languageName || languageId),
      [{
        label: localize(16578, null),
        run: async () => {
          await this.localeService.setLocale({
            id: languageId,
            label: languageName ?? languageId,
            extensionId: localExtension.identifier.id
            // If settings sync installs the language pack, then we would have just shown the notification so no
            // need to show the dialog.
          }, true);
        }
      }],
      {
        sticky: true,
        priority: 3 /* URGENT */,
        neverShowAgain: { id: "langugage.update.donotask", isSecondary: true, scope: 2 /* APPLICATION */ }
      }
    );
  }
  async onDidUninstallExtension(_event) {
    if (!await this.isLocaleInstalled(language)) {
      this.localeService.setLocale({
        id: "en",
        label: "English"
      });
    }
  }
  async checkAndInstall() {
    const language2 = language;
    let locale2 = locale ?? "";
    const languagePackSuggestionIgnoreList = JSON.parse(
      this.storageService.get(
        NativeLocalizationWorkbenchContribution.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY,
        -1 /* APPLICATION */,
        "[]"
      )
    );
    if (!this.galleryService.isEnabled()) {
      return;
    }
    if (!language2 || !locale2 || Language.isDefaultVariant()) {
      return;
    }
    if (locale2.startsWith(language2) || languagePackSuggestionIgnoreList.includes(locale2)) {
      return;
    }
    const installed = await this.isLocaleInstalled(locale2);
    if (installed) {
      return;
    }
    const fullLocale = locale2;
    let tagResult = await this.galleryService.query({ text: `tag:lp-${locale2}` }, CancellationToken.None);
    if (tagResult.total === 0) {
      locale2 = locale2.split("-")[0];
      tagResult = await this.galleryService.query({ text: `tag:lp-${locale2}` }, CancellationToken.None);
      if (tagResult.total === 0) {
        return;
      }
    }
    const extensionToInstall = tagResult.total === 1 ? tagResult.firstPage[0] : tagResult.firstPage.find((e4) => e4.publisher === "MS-CEINTL" && e4.name.startsWith("vscode-language-pack"));
    const extensionToFetchTranslationsFrom = extensionToInstall ?? tagResult.firstPage[0];
    if (!extensionToFetchTranslationsFrom.assets.manifest) {
      return;
    }
    const [manifest, translation] = await Promise.all([
      this.galleryService.getManifest(extensionToFetchTranslationsFrom, CancellationToken.None),
      this.galleryService.getCoreTranslation(extensionToFetchTranslationsFrom, locale2)
    ]);
    const loc = manifest?.contributes?.localizations?.find((x) => locale2.startsWith(x.languageId.toLowerCase()));
    const languageName = loc ? loc.languageName || locale2 : locale2;
    const languageDisplayName = loc ? loc.localizedLanguageName || loc.languageName || locale2 : locale2;
    const translationsFromPack = translation?.contents?.["vs/workbench/contrib/localization/electron-browser/minimalTranslations"] ?? {};
    const promptMessageKey = extensionToInstall ? "installAndRestartMessage" : "showLanguagePackExtensions";
    const useEnglish = !translationsFromPack[promptMessageKey];
    const translations = {};
    Object.keys(minimumTranslatedStrings).forEach((key3) => {
      if (!translationsFromPack[key3] || useEnglish) {
        translations[key3] = minimumTranslatedStrings[key3].replace("{0}", () => languageName);
      } else {
        translations[key3] = `${translationsFromPack[key3].replace("{0}", () => languageDisplayName)} (${minimumTranslatedStrings[key3].replace("{0}", () => languageName)})`;
      }
    });
    const logUserReaction = (userReaction) => {
      this.telemetryService.publicLog("languagePackSuggestion:popup", { userReaction, language: locale2 });
    };
    const searchAction = {
      label: translations["searchMarketplace"],
      run: async () => {
        logUserReaction("search");
        await this.extensionsWorkbenchService.openSearch(`tag:lp-${locale2}`);
      }
    };
    const installAndRestartAction = {
      label: translations["installAndRestart"],
      run: async () => {
        logUserReaction("installAndRestart");
        await this.localeService.setLocale({
          id: locale2,
          label: languageName,
          extensionId: extensionToInstall?.identifier.id,
          galleryExtension: extensionToInstall
          // The user will be prompted if they want to install the language pack before this.
        }, true);
      }
    };
    const promptMessage = translations[promptMessageKey];
    this.notificationService.prompt(
      severity_default.Info,
      promptMessage,
      [
        extensionToInstall ? installAndRestartAction : searchAction,
        {
          label: localize(16579, null),
          isSecondary: true,
          run: () => {
            languagePackSuggestionIgnoreList.push(fullLocale);
            this.storageService.store(
              NativeLocalizationWorkbenchContribution.LANGUAGEPACK_SUGGESTION_IGNORE_STORAGE_KEY,
              JSON.stringify(languagePackSuggestionIgnoreList),
              -1 /* APPLICATION */,
              0 /* USER */
            );
            logUserReaction("neverShowAgain");
          }
        }
      ],
      {
        priority: 1 /* OPTIONAL */,
        onCancel: () => {
          logUserReaction("cancelled");
        }
      }
    );
  }
  async isLocaleInstalled(locale2) {
    const installed = await this.extensionManagementService.getInstalled();
    return installed.some((i2) => !!i2.manifest.contributes?.localizations?.length && i2.manifest.contributes.localizations.some((l) => locale2.startsWith(l.languageId.toLowerCase())));
  }
};

NativeLocalizationWorkbenchContribution = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ILocaleService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IExtensionManagementService),
  __decorateParam(5, IExtensionGalleryService),
  __decorateParam(6, IExtensionsWorkbenchService),
  __decorateParam(7, ITelemetryService)
], NativeLocalizationWorkbenchContribution);

var workbenchRegistry6 = Registry.as(Extensions10.Workbench);

workbenchRegistry6.registerWorkbenchContribution(NativeLocalizationWorkbenchContribution, 4 /* Eventually */);
export { NativeLocalizationWorkbenchContribution, workbenchRegistry6 };
