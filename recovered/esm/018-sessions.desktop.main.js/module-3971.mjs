// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/localization/electron-browser/localeService.ts
import { parse12 } from "./module-2175.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { toAction } from "./module-0082.mjs";
import { LANGUAGE_DEFAULT, Language } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILanguagePackService } from "./module-0924.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1118.mjs";
import { IProductService } from "./module-0875.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IActiveLanguagePackService, ILocaleService } from "./module-1665.mjs";


// src/vs/workbench/services/localization/electron-browser/localeService.ts
var EXTENSIONS_VIEWLET_ID = "workbench.view.extensions";

var NativeLocaleService = class {
  constructor(jsonEditingService, environmentService, notificationService, languagePackService, paneCompositePartService, extensionManagementService, progressService, textFileService, editorService, dialogService, hostService, productService) {
    this.jsonEditingService = jsonEditingService;
    this.environmentService = environmentService;
    this.notificationService = notificationService;
    this.languagePackService = languagePackService;
    this.paneCompositePartService = paneCompositePartService;
    this.extensionManagementService = extensionManagementService;
    this.progressService = progressService;
    this.textFileService = textFileService;
    this.editorService = editorService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.productService = productService;
  }
  async validateLocaleFile() {
    try {
      const content = await this.textFileService.read(this.environmentService.argvResource, { encoding: "utf8" });
      parse12(content.value);
    } catch (error) {
      this.notificationService.notify({
        severity: Severity2.Error,
        message: localize(23242, null),
        actions: {
          primary: [
            toAction({
              id: "openArgv",
              label: localize(23244, null),
              run: () => this.editorService.openEditor({ resource: this.environmentService.argvResource })
            })
          ]
        }
      });
      return false;
    }
    return true;
  }
  async writeLocaleValue(locale2) {
    if (!await this.validateLocaleFile()) {
      return false;
    }
    await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ["locale"], value: locale2 }], true);
    return true;
  }
  async setLocale(languagePackItem, skipDialog = false) {
    const locale2 = languagePackItem.id;
    if (locale2 === Language.value() || !locale2 && Language.isDefaultVariant()) {
      return;
    }
    const installedLanguages = await this.languagePackService.getInstalledLanguages();
    try {
      if (!installedLanguages.some((installedLanguage) => installedLanguage.id === languagePackItem.id)) {
        if (languagePackItem.galleryExtension?.publisher.toLowerCase() !== "ms-ceintl") {
          const viewlet = await this.paneCompositePartService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* Sidebar */);
          (viewlet?.getViewPaneContainer()).search(`@id:${languagePackItem.extensionId}`);
          return;
        }
        await this.progressService.withProgress(
          {
            location: 15 /* Notification */,
            title: localize(23243, null, languagePackItem.label)
          },
          (progress) => this.extensionManagementService.installFromGallery(languagePackItem.galleryExtension, {
            // Setting this to false is how you get the extension to be synced with Settings Sync (if enabled).
            isMachineScoped: false
          })
        );
      }
      if (!skipDialog && !await this.showRestartDialog(languagePackItem.label)) {
        return;
      }
      await this.writeLocaleValue(locale2);
      await this.hostService.restart();
    } catch (err) {
      this.notificationService.error(err);
    }
  }
  async clearLocalePreference() {
    try {
      await this.writeLocaleValue(void 0);
      if (!Language.isDefaultVariant()) {
        await this.showRestartDialog("English");
      }
    } catch (err) {
      this.notificationService.error(err);
    }
  }
  async showRestartDialog(languageName) {
    const { confirmed } = await this.dialogService.confirm({
      message: localize(23247, null, this.productService.nameLong, languageName),
      detail: localize(
        23246,
        null,
        languageName,
        this.productService.nameLong
      ),
      primaryButton: localize(23245, null)
    });
    return confirmed;
  }
};

NativeLocaleService = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ILanguagePackService),
  __decorateParam(4, IPaneCompositePartService),
  __decorateParam(5, IExtensionManagementService),
  __decorateParam(6, IProgressService),
  __decorateParam(7, ITextFileService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, IHostService),
  __decorateParam(11, IProductService)
], NativeLocaleService);

var NativeActiveLanguagePackService = class {
  constructor(languagePackService) {
    this.languagePackService = languagePackService;
  }
  async getExtensionIdProvidingCurrentLocale() {
    const language2 = Language.value();
    if (language2 === LANGUAGE_DEFAULT) {
      return void 0;
    }
    const languages = await this.languagePackService.getInstalledLanguages();
    const languagePack = languages.find((l) => l.id === language2);
    return languagePack?.extensionId;
  }
};

NativeActiveLanguagePackService = __decorateClass([
  __decorateParam(0, ILanguagePackService)
], NativeActiveLanguagePackService);

registerSingleton(ILocaleService, NativeLocaleService, 1 /* Delayed */);

registerSingleton(IActiveLanguagePackService, NativeActiveLanguagePackService, 1 /* Delayed */);
export { EXTENSIONS_VIEWLET_ID, NativeLocaleService, NativeActiveLanguagePackService };
