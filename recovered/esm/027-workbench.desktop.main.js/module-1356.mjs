// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/languageService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { LanguagesRegistry } from "./module-1355.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/editor/common/services/languageService.ts
var LanguageService = class _LanguageService extends Disposable {
  constructor(warnOnOverwrite = false) {
    super();
    this._onDidRequestBasicLanguageFeatures = this._register(new Emitter());
    this.onDidRequestBasicLanguageFeatures = this._onDidRequestBasicLanguageFeatures.event;
    this._onDidRequestRichLanguageFeatures = this._register(new Emitter());
    this.onDidRequestRichLanguageFeatures = this._onDidRequestRichLanguageFeatures.event;
    this._onDidChange = this._register(new Emitter({
      leakWarningThreshold: 200,
      leakWarningName: "LanguageService._onDidChange"
      /* https://github.com/microsoft/vscode/issues/119968 */
    }));
    this.onDidChange = this._onDidChange.event;
    this._requestedBasicLanguages = /* @__PURE__ */ new Set();
    this._requestedRichLanguages = /* @__PURE__ */ new Set();
    _LanguageService.instanceCount++;
    this._registry = this._register(new LanguagesRegistry(true, warnOnOverwrite));
    this.languageIdCodec = this._registry.languageIdCodec;
    this._register(this._registry.onDidChange(() => this._onDidChange.fire()));
  }
  static {
    this.instanceCount = 0;
  }
  dispose() {
    _LanguageService.instanceCount--;
    super.dispose();
  }
  registerLanguage(def2) {
    return this._registry.registerLanguage(def2);
  }
  isRegisteredLanguageId(languageId) {
    return this._registry.isRegisteredLanguageId(languageId);
  }
  getRegisteredLanguageIds() {
    return this._registry.getRegisteredLanguageIds();
  }
  getSortedRegisteredLanguageNames() {
    return this._registry.getSortedRegisteredLanguageNames();
  }
  getLanguageName(languageId) {
    return this._registry.getLanguageName(languageId);
  }
  getMimeType(languageId) {
    return this._registry.getMimeType(languageId);
  }
  getIcon(languageId) {
    return this._registry.getIcon(languageId);
  }
  getExtensions(languageId) {
    return this._registry.getExtensions(languageId);
  }
  getFilenames(languageId) {
    return this._registry.getFilenames(languageId);
  }
  getConfigurationFiles(languageId) {
    return this._registry.getConfigurationFiles(languageId);
  }
  getLanguageIdByLanguageName(languageName) {
    return this._registry.getLanguageIdByLanguageName(languageName);
  }
  getLanguageIdByMimeType(mimeType) {
    return this._registry.getLanguageIdByMimeType(mimeType);
  }
  guessLanguageIdByFilepathOrFirstLine(resource, firstLine3) {
    const languageIds = this._registry.guessLanguageIdByFilepathOrFirstLine(resource, firstLine3);
    return languageIds.at(0) ?? null;
  }
  createById(languageId) {
    return new LanguageSelection(this.onDidChange, () => {
      return this._createAndGetLanguageIdentifier(languageId);
    });
  }
  createByMimeType(mimeType) {
    return new LanguageSelection(this.onDidChange, () => {
      const languageId = this.getLanguageIdByMimeType(mimeType);
      return this._createAndGetLanguageIdentifier(languageId);
    });
  }
  createByFilepathOrFirstLine(resource, firstLine3) {
    return new LanguageSelection(this.onDidChange, () => {
      const languageId = this.guessLanguageIdByFilepathOrFirstLine(resource, firstLine3);
      return this._createAndGetLanguageIdentifier(languageId);
    });
  }
  _createAndGetLanguageIdentifier(languageId) {
    if (!languageId || !this.isRegisteredLanguageId(languageId)) {
      languageId = PLAINTEXT_LANGUAGE_ID;
    }
    return languageId;
  }
  requestBasicLanguageFeatures(languageId) {
    if (!this._requestedBasicLanguages.has(languageId)) {
      this._requestedBasicLanguages.add(languageId);
      this._onDidRequestBasicLanguageFeatures.fire(languageId);
    }
  }
  requestRichLanguageFeatures(languageId) {
    if (!this._requestedRichLanguages.has(languageId)) {
      this._requestedRichLanguages.add(languageId);
      this.requestBasicLanguageFeatures(languageId);
      TokenizationRegistry2.getOrCreate(languageId);
      this._onDidRequestRichLanguageFeatures.fire(languageId);
    }
  }
};

var LanguageSelection = class {
  constructor(onDidChangeLanguages, selector) {
    this._value = observableFromEvent(this, onDidChangeLanguages, () => selector());
    this.onDidChange = Event2.fromObservable(this._value);
  }
  get languageId() {
    return this._value.get();
  }
};
export { LanguageService, LanguageSelection };
