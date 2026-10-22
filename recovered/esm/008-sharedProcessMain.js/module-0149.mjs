// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/languagePacks/node/languagePacks.ts
import { LanguagePackBaseService } from "./module-0059.mjs";
import { URI } from "./module-0024.mjs";
import { areSameExtensions } from "./module-0091.mjs";
import { equals } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionGalleryService, IExtensionManagementService } from "./module-0058.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ILogService } from "./module-0044.mjs";
import { Disposable } from "./module-0013.mjs";
import { join } from "./module-0023.mjs";
import { Queue } from "./module-0029.mjs";
import { Schemas } from "./module-0025.mjs";
import { Promises2 } from "./module-0038.mjs";


// src/vs/platform/languagePacks/node/languagePacks.ts
import * as fs4 from "fs";

import { createHash as createHash3 } from "crypto";

var NativeLanguagePackService = class extends LanguagePackBaseService {
  constructor(extensionManagementService, environmentService, extensionGalleryService, logService) {
    super(extensionGalleryService);
    this.extensionManagementService = extensionManagementService;
    this.logService = logService;
    this.cache = this._register(new LanguagePacksCache(environmentService, logService));
    this.extensionManagementService.registerParticipant({
      postInstall: async (extension) => {
        return this.postInstallExtension(extension);
      },
      postUninstall: async (extension) => {
        return this.postUninstallExtension(extension);
      }
    });
  }
  async getBuiltInExtensionTranslationsUri(id2, language2) {
    const packs = await this.cache.getLanguagePacks();
    const pack = packs[language2];
    if (!pack) {
      this.logService.warn(`No language pack found for ${language2}`);
      return void 0;
    }
    const translation = pack.translations[id2];
    return translation ? URI.file(translation) : void 0;
  }
  async getInstalledLanguages() {
    const languagePacks = await this.cache.getLanguagePacks();
    const languages = Object.keys(languagePacks).map((locale) => {
      const languagePack = languagePacks[locale];
      const baseQuickPick = this.createQuickPickItem(locale, languagePack.label);
      return {
        ...baseQuickPick,
        extensionId: languagePack.extensions[0].extensionIdentifier.id
      };
    });
    languages.push(this.createQuickPickItem("en", "English"));
    languages.sort((a, b) => a.label.localeCompare(b.label));
    return languages;
  }
  async postInstallExtension(extension) {
    if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
      this.logService.info("Adding language packs from the extension", extension.identifier.id);
      await this.update();
    }
  }
  async postUninstallExtension(extension) {
    const languagePacks = await this.cache.getLanguagePacks();
    if (Object.keys(languagePacks).some((language2) => languagePacks[language2] && languagePacks[language2].extensions.some((e) => areSameExtensions(e.extensionIdentifier, extension.identifier)))) {
      this.logService.info("Removing language packs from the extension", extension.identifier.id);
      await this.update();
    }
  }
  async update() {
    const [current, installed] = await Promise.all([this.cache.getLanguagePacks(), this.extensionManagementService.getInstalled()]);
    const updated = await this.cache.update(installed);
    return !equals(Object.keys(current), Object.keys(updated));
  }
};

NativeLanguagePackService = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, INativeEnvironmentService),
  __decorateParam(2, IExtensionGalleryService),
  __decorateParam(3, ILogService)
], NativeLanguagePackService);

var LanguagePacksCache = class extends Disposable {
  constructor(environmentService, logService) {
    super();
    this.logService = logService;
    this.languagePacks = {};
    this.languagePacksFilePath = join(environmentService.userDataPath, "languagepacks.json");
    this.languagePacksFileLimiter = new Queue();
  }
  getLanguagePacks() {
    if (this.languagePacksFileLimiter.size || !this.initializedCache) {
      return this.withLanguagePacks().then(() => this.languagePacks);
    }
    return Promise.resolve(this.languagePacks);
  }
  update(extensions) {
    return this.withLanguagePacks((languagePacks) => {
      Object.keys(languagePacks).forEach((language2) => delete languagePacks[language2]);
      this.createLanguagePacksFromExtensions(languagePacks, ...extensions);
    }).then(() => this.languagePacks);
  }
  createLanguagePacksFromExtensions(languagePacks, ...extensions) {
    for (const extension of extensions) {
      if (extension && extension.manifest && extension.manifest.contributes && extension.manifest.contributes.localizations && extension.manifest.contributes.localizations.length) {
        this.createLanguagePacksFromExtension(languagePacks, extension);
      }
    }
    Object.keys(languagePacks).forEach((languageId) => this.updateHash(languagePacks[languageId]));
  }
  createLanguagePacksFromExtension(languagePacks, extension) {
    const extensionIdentifier = extension.identifier;
    const localizations = extension.manifest.contributes && extension.manifest.contributes.localizations ? extension.manifest.contributes.localizations : [];
    for (const localizationContribution of localizations) {
      if (extension.location.scheme === Schemas.file && isValidLocalization(localizationContribution)) {
        let languagePack = languagePacks[localizationContribution.languageId];
        if (!languagePack) {
          languagePack = {
            hash: "",
            extensions: [],
            translations: {},
            label: localizationContribution.localizedLanguageName ?? localizationContribution.languageName
          };
          languagePacks[localizationContribution.languageId] = languagePack;
        }
        const extensionInLanguagePack = languagePack.extensions.filter((e) => areSameExtensions(e.extensionIdentifier, extensionIdentifier))[0];
        if (extensionInLanguagePack) {
          extensionInLanguagePack.version = extension.manifest.version;
        } else {
          languagePack.extensions.push({ extensionIdentifier, version: extension.manifest.version });
        }
        for (const translation of localizationContribution.translations) {
          languagePack.translations[translation.id] = join(extension.location.fsPath, translation.path);
        }
      }
    }
  }
  updateHash(languagePack) {
    if (languagePack) {
      const md5 = createHash3("md5");
      for (const extension of languagePack.extensions) {
        md5.update(extension.extensionIdentifier.uuid || extension.extensionIdentifier.id).update(extension.version);
      }
      languagePack.hash = md5.digest("hex");
    }
  }
  withLanguagePacks(fn = () => null) {
    return this.languagePacksFileLimiter.queue(() => {
      let result = null;
      return fs4.promises.readFile(this.languagePacksFilePath, "utf8").then(void 0, (err) => err.code === "ENOENT" ? Promise.resolve("{}") : Promise.reject(err)).then((raw) => {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return {};
        }
      }).then((languagePacks) => {
        result = fn(languagePacks);
        return languagePacks;
      }).then((languagePacks) => {
        for (const language2 of Object.keys(languagePacks)) {
          if (!languagePacks[language2]) {
            delete languagePacks[language2];
          }
        }
        this.languagePacks = languagePacks;
        this.initializedCache = true;
        const raw = JSON.stringify(this.languagePacks);
        this.logService.debug("Writing language packs", raw);
        return Promises2.writeFile(this.languagePacksFilePath, raw);
      }).then(() => result, (error) => this.logService.error(error));
    });
  }
};

LanguagePacksCache = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, ILogService)
], LanguagePacksCache);

function isValidLocalization(localization) {
  if (typeof localization.languageId !== "string") {
    return false;
  }
  if (!Array.isArray(localization.translations) || localization.translations.length === 0) {
    return false;
  }
  for (const translation of localization.translations) {
    if (typeof translation.id !== "string") {
      return false;
    }
    if (typeof translation.path !== "string") {
      return false;
    }
  }
  if (localization.languageName && typeof localization.languageName !== "string") {
    return false;
  }
  if (localization.localizedLanguageName && typeof localization.localizedLanguageName !== "string") {
    return false;
  }
  return true;
}
export { isValidLocalization, fs4, createHash3, NativeLanguagePackService, LanguagePacksCache };
