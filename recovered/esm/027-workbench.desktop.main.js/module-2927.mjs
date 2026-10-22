// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/fileBasedRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { localize } from "./module-0001.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { Schemas } from "./module-0033.mjs";
import { CellUri } from "./module-0909.mjs";
import { distinct } from "./module-0007.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { basename2, extname2 } from "./module-0034.mjs";
import { match } from "./module-0857.mjs";
import { areSameExtensions } from "./module-0886.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IProductService } from "./module-0873.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionRecommendationNotificationService } from "./module-2916.mjs";
import { IExtensionIgnoredRecommendationsService } from "./module-1702.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUntitledTextEditorService } from "./module-1125.mjs";


// src/vs/workbench/contrib/extensions/browser/fileBasedRecommendations.ts
var promptedRecommendationsStorageKey = "fileBasedRecommendations/promptedRecommendations";

var recommendationsStorageKey = "extensionsAssistant/recommendations";

var milliSecondsInADay = 1e3 * 60 * 60 * 24;

var untitledFileRecommendationsMinLength = 1e3;

var FileBasedRecommendations = class extends ExtensionRecommendations {
  constructor(extensionsWorkbenchService, modelService, languageService, productService, storageService, extensionRecommendationNotificationService, extensionIgnoredRecommendationsService, workspaceContextService, untitledTextEditorService) {
    super();
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.storageService = storageService;
    this.extensionRecommendationNotificationService = extensionRecommendationNotificationService;
    this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
    this.workspaceContextService = workspaceContextService;
    this.untitledTextEditorService = untitledTextEditorService;
    this.recommendationsByPattern = /* @__PURE__ */ new Map();
    this.fileBasedRecommendations = /* @__PURE__ */ new Map();
    this.fileBasedImportantRecommendations = /* @__PURE__ */ new Set();
    this.fileOpenRecommendations = {};
    if (productService.extensionRecommendations) {
      for (const [extensionId, recommendation] of Object.entries(productService.extensionRecommendations)) {
        if (recommendation.onFileOpen) {
          this.fileOpenRecommendations[extensionId.toLowerCase()] = recommendation.onFileOpen;
        }
      }
    }
  }
  get recommendations() {
    const recommendations = [];
    [...this.fileBasedRecommendations.keys()].sort((a, b) => {
      if (this.fileBasedRecommendations.get(a).recommendedTime === this.fileBasedRecommendations.get(b).recommendedTime) {
        if (this.fileBasedImportantRecommendations.has(a)) {
          return -1;
        }
        if (this.fileBasedImportantRecommendations.has(b)) {
          return 1;
        }
      }
      return this.fileBasedRecommendations.get(a).recommendedTime > this.fileBasedRecommendations.get(b).recommendedTime ? -1 : 1;
    }).forEach((extensionId) => {
      recommendations.push({
        extension: extensionId,
        reason: {
          reasonId: 1 /* File */,
          reasonText: localize(15595, null)
        }
      });
    });
    return recommendations;
  }
  get importantRecommendations() {
    return this.recommendations.filter((e) => this.fileBasedImportantRecommendations.has(e.extension));
  }
  get otherRecommendations() {
    return this.recommendations.filter((e) => !this.fileBasedImportantRecommendations.has(e.extension));
  }
  async doActivate() {
    if (isEmptyObject(this.fileOpenRecommendations)) {
      return;
    }
    await this.extensionsWorkbenchService.whenInitialized;
    const cachedRecommendations = this.getCachedRecommendations();
    const now = Date.now();
    Object.entries(cachedRecommendations).forEach(([key3, value2]) => {
      const diff4 = (now - value2) / milliSecondsInADay;
      if (diff4 <= 7 && this.fileOpenRecommendations[key3]) {
        this.fileBasedRecommendations.set(key3.toLowerCase(), { recommendedTime: value2 });
      }
    });
    this._register(this.modelService.onModelAdded((model) => this.onModelAdded(model)));
    this.modelService.getModels().forEach((model) => this.onModelAdded(model));
  }
  onModelAdded(model) {
    const uri5 = model.uri.scheme === Schemas.vscodeNotebookCell ? CellUri.parse(model.uri)?.notebook : model.uri;
    if (!uri5) {
      return;
    }
    const supportedSchemes = distinct([Schemas.untitled, Schemas.file, Schemas.vscodeRemote, ...this.workspaceContextService.getWorkspace().folders.map((folder) => folder.uri.scheme)]);
    if (!uri5 || !supportedSchemes.includes(uri5.scheme)) {
      return;
    }
    disposableTimeout(() => this.promptImportantRecommendations(uri5, model), 0, this._store);
  }
  /**
   * Prompt the user to either install the recommended extension for the file type in the current editor model
   * or prompt to search the marketplace if it has extensions that can support the file type
   */
  promptImportantRecommendations(uri5, model, extensionRecommendations) {
    if (model.isDisposed()) {
      return;
    }
    const pattern = extname2(uri5).toLowerCase();
    extensionRecommendations = extensionRecommendations ?? this.recommendationsByPattern.get(pattern) ?? this.fileOpenRecommendations;
    const extensionRecommendationEntries = Object.entries(extensionRecommendations);
    if (extensionRecommendationEntries.length === 0) {
      return;
    }
    const processedPathGlobs = /* @__PURE__ */ new Map();
    const installed = this.extensionsWorkbenchService.local;
    const recommendationsByPattern = {};
    const matchedRecommendations = {};
    const unmatchedRecommendations = {};
    let listenOnLanguageChange = false;
    const languageId = model.getLanguageId();
    const untitledModel = this.untitledTextEditorService.get(uri5);
    const allowLanguageMatch = !untitledModel || untitledModel.hasLanguageSetExplicitly || model.getValueLength() > untitledFileRecommendationsMinLength;
    for (const [extensionId, conditions] of extensionRecommendationEntries) {
      const conditionsByPattern = [];
      const matchedConditions = [];
      const unmatchedConditions = [];
      for (const condition of conditions) {
        let languageMatched = false;
        let pathGlobMatched = false;
        const isLanguageCondition = !!condition.languages;
        const isFileContentCondition = !!condition.contentPattern;
        if (isLanguageCondition || isFileContentCondition) {
          conditionsByPattern.push(condition);
        }
        if (isLanguageCondition && allowLanguageMatch) {
          if (condition.languages.includes(languageId)) {
            languageMatched = true;
          }
        }
        const pathGlob = condition.pathGlob;
        if (pathGlob) {
          if (processedPathGlobs.get(pathGlob) ?? match(pathGlob, uri5.with({ fragment: "" }).toString(), { ignoreCase: true })) {
            pathGlobMatched = true;
          }
          processedPathGlobs.set(pathGlob, pathGlobMatched);
        }
        let matched = languageMatched || pathGlobMatched;
        if (pattern && !matched) {
          continue;
        }
        if (matched && condition.whenInstalled) {
          if (!condition.whenInstalled.every((id2) => installed.some((local) => areSameExtensions({ id: id2 }, local.identifier)))) {
            matched = false;
          }
        }
        if (matched && condition.whenNotInstalled) {
          if (installed.some((local) => condition.whenNotInstalled?.some((id2) => areSameExtensions({ id: id2 }, local.identifier)))) {
            matched = false;
          }
        }
        if (matched && isFileContentCondition) {
          if (!model.findMatches(condition.contentPattern, false, true, false, null, false).length) {
            matched = false;
          }
        }
        if (matched) {
          matchedConditions.push(condition);
          conditionsByPattern.pop();
        } else {
          if (isLanguageCondition || isFileContentCondition) {
            unmatchedConditions.push(condition);
            if (isLanguageCondition) {
              listenOnLanguageChange = true;
            }
          }
        }
      }
      if (matchedConditions.length) {
        matchedRecommendations[extensionId] = matchedConditions;
      }
      if (unmatchedConditions.length) {
        unmatchedRecommendations[extensionId] = unmatchedConditions;
      }
      if (conditionsByPattern.length) {
        recommendationsByPattern[extensionId] = conditionsByPattern;
      }
    }
    if (pattern) {
      this.recommendationsByPattern.set(pattern, recommendationsByPattern);
    }
    if (Object.keys(unmatchedRecommendations).length) {
      if (listenOnLanguageChange) {
        const disposables = new DisposableStore();
        disposables.add(model.onDidChangeLanguage(() => {
          disposableTimeout(() => {
            if (!disposables.isDisposed) {
              this.promptImportantRecommendations(uri5, model, unmatchedRecommendations);
              disposables.dispose();
            }
          }, 0, disposables);
        }));
        disposables.add(model.onWillDispose(() => disposables.dispose()));
      }
    }
    if (Object.keys(matchedRecommendations).length) {
      this.promptFromRecommendations(uri5, model, matchedRecommendations);
    }
  }
  promptFromRecommendations(uri5, model, extensionRecommendations) {
    let isImportantRecommendationForLanguage = false;
    const importantRecommendations = /* @__PURE__ */ new Set();
    const fileBasedRecommendations = /* @__PURE__ */ new Set();
    for (const [extensionId, conditions] of Object.entries(extensionRecommendations)) {
      for (const condition of conditions) {
        fileBasedRecommendations.add(extensionId);
        if (condition.important) {
          importantRecommendations.add(extensionId);
          this.fileBasedImportantRecommendations.add(extensionId);
        }
        if (condition.languages) {
          isImportantRecommendationForLanguage = true;
        }
      }
    }
    for (const recommendation of fileBasedRecommendations) {
      const filedBasedRecommendation = this.fileBasedRecommendations.get(recommendation) || { recommendedTime: Date.now(), sources: [] };
      filedBasedRecommendation.recommendedTime = Date.now();
      this.fileBasedRecommendations.set(recommendation, filedBasedRecommendation);
    }
    this.storeCachedRecommendations();
    if (this.extensionRecommendationNotificationService.hasToIgnoreRecommendationNotifications()) {
      return;
    }
    const language2 = model.getLanguageId();
    const languageName = this.languageService.getLanguageName(language2);
    if (importantRecommendations.size && this.promptRecommendedExtensionForFileType(languageName && isImportantRecommendationForLanguage && language2 !== PLAINTEXT_LANGUAGE_ID ? localize(15596, null, languageName) : basename2(uri5), language2, [...importantRecommendations])) {
      return;
    }
  }
  promptRecommendedExtensionForFileType(name, language2, recommendations) {
    recommendations = this.filterIgnoredOrNotAllowed(recommendations);
    if (recommendations.length === 0) {
      return false;
    }
    recommendations = this.filterInstalled(recommendations, this.extensionsWorkbenchService.local).filter((extensionId) => this.fileBasedImportantRecommendations.has(extensionId));
    const promptedRecommendations = language2 !== PLAINTEXT_LANGUAGE_ID ? this.getPromptedRecommendations()[language2] : void 0;
    if (promptedRecommendations) {
      recommendations = recommendations.filter((extensionId) => !promptedRecommendations.includes(extensionId));
    }
    if (recommendations.length === 0) {
      return false;
    }
    this.promptImportantExtensionsInstallNotification(recommendations, name, language2);
    return true;
  }
  async promptImportantExtensionsInstallNotification(extensions, name, language2) {
    try {
      const result = await this.extensionRecommendationNotificationService.promptImportantExtensionsInstallNotification({ extensions, name, source: 1 /* FILE */ });
      if (result === "reacted" /* Accepted */) {
        this.addToPromptedRecommendations(language2, extensions);
      }
    } catch (error) {
    }
  }
  getPromptedRecommendations() {
    return JSON.parse(this.storageService.get(promptedRecommendationsStorageKey, 0 /* PROFILE */, "{}"));
  }
  addToPromptedRecommendations(language2, extensions) {
    const promptedRecommendations = this.getPromptedRecommendations();
    promptedRecommendations[language2] = distinct([...promptedRecommendations[language2] ?? [], ...extensions]);
    this.storageService.store(promptedRecommendationsStorageKey, JSON.stringify(promptedRecommendations), 0 /* PROFILE */, 0 /* USER */);
  }
  filterIgnoredOrNotAllowed(recommendationsToSuggest) {
    const ignoredRecommendations = [...this.extensionIgnoredRecommendationsService.ignoredRecommendations, ...this.extensionRecommendationNotificationService.ignoredRecommendations];
    return recommendationsToSuggest.filter((id2) => !ignoredRecommendations.includes(id2));
  }
  filterInstalled(recommendationsToSuggest, installed) {
    const installedExtensionsIds = installed.reduce((result, i2) => {
      if (i2.enablementState !== 1 /* DisabledByExtensionKind */) {
        result.add(i2.identifier.id.toLowerCase());
      }
      return result;
    }, /* @__PURE__ */ new Set());
    return recommendationsToSuggest.filter((id2) => !installedExtensionsIds.has(id2.toLowerCase()));
  }
  getCachedRecommendations() {
    let storedRecommendations = JSON.parse(this.storageService.get(recommendationsStorageKey, 0 /* PROFILE */, "[]"));
    if (Array.isArray(storedRecommendations)) {
      storedRecommendations = storedRecommendations.reduce((result2, id2) => {
        result2[id2] = Date.now();
        return result2;
      }, {});
    }
    const result = {};
    Object.entries(storedRecommendations).forEach(([key3, value2]) => {
      if (typeof value2 === "number") {
        result[key3.toLowerCase()] = value2;
      }
    });
    return result;
  }
  storeCachedRecommendations() {
    const storedRecommendations = {};
    this.fileBasedRecommendations.forEach((value2, key3) => storedRecommendations[key3] = value2.recommendedTime);
    this.storageService.store(recommendationsStorageKey, JSON.stringify(storedRecommendations), 0 /* PROFILE */, 1 /* MACHINE */);
  }
};

FileBasedRecommendations = __decorateClass([
  __decorateParam(0, IExtensionsWorkbenchService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IExtensionRecommendationNotificationService),
  __decorateParam(6, IExtensionIgnoredRecommendationsService),
  __decorateParam(7, IWorkspaceContextService),
  __decorateParam(8, IUntitledTextEditorService)
], FileBasedRecommendations);
export { promptedRecommendationsStorageKey, recommendationsStorageKey, milliSecondsInADay, untitledFileRecommendationsMinLength, FileBasedRecommendations };
