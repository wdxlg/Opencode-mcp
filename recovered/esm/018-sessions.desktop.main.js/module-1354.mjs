// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/languagesRegistry.ts
import { ModesRegistry, PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { clearPlatformLanguageAssociations, getLanguageIds, registerPlatformLanguageAssociation } from "./module-1353.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { compareIgnoreCase, regExpLeadsToEndlessLoop } from "./module-0030.mjs";


// src/vs/editor/common/services/languagesRegistry.ts
var hasOwnProperty3 = Object.prototype.hasOwnProperty;

var NULL_LANGUAGE_ID = "vs.editor.nullLanguage";

var LanguageIdCodec = class {
  constructor() {
    this._languageIdToLanguage = [];
    this._languageToLanguageId = /* @__PURE__ */ new Map();
    this._register(NULL_LANGUAGE_ID, 0 /* Null */);
    this._register(PLAINTEXT_LANGUAGE_ID, 1 /* PlainText */);
    this._nextLanguageId = 2;
  }
  _register(language2, languageId) {
    this._languageIdToLanguage[languageId] = language2;
    this._languageToLanguageId.set(language2, languageId);
  }
  register(language2) {
    if (this._languageToLanguageId.has(language2)) {
      return;
    }
    const languageId = this._nextLanguageId++;
    this._register(language2, languageId);
  }
  encodeLanguageId(languageId) {
    return this._languageToLanguageId.get(languageId) || 0 /* Null */;
  }
  decodeLanguageId(languageId) {
    return this._languageIdToLanguage[languageId] || NULL_LANGUAGE_ID;
  }
};

var LanguagesRegistry = class _LanguagesRegistry extends Disposable {
  constructor(useModesRegistry = true, warnOnOverwrite = false) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    _LanguagesRegistry.instanceCount++;
    this._warnOnOverwrite = warnOnOverwrite;
    this.languageIdCodec = new LanguageIdCodec();
    this._dynamicLanguages = [];
    this._languages = {};
    this._mimeTypesMap = {};
    this._nameMap = {};
    this._lowercaseNameMap = {};
    if (useModesRegistry) {
      this._initializeFromRegistry();
      this._register(ModesRegistry.onDidChangeLanguages((m) => {
        this._initializeFromRegistry();
      }));
    }
  }
  static {
    this.instanceCount = 0;
  }
  dispose() {
    _LanguagesRegistry.instanceCount--;
    super.dispose();
  }
  setDynamicLanguages(def2) {
    this._dynamicLanguages = def2;
    this._initializeFromRegistry();
  }
  _initializeFromRegistry() {
    this._languages = {};
    this._mimeTypesMap = {};
    this._nameMap = {};
    this._lowercaseNameMap = {};
    clearPlatformLanguageAssociations();
    const desc = [].concat(ModesRegistry.getLanguages()).concat(this._dynamicLanguages);
    this._registerLanguages(desc);
  }
  registerLanguage(desc) {
    return ModesRegistry.registerLanguage(desc);
  }
  _registerLanguages(desc) {
    for (const d of desc) {
      this._registerLanguage(d);
    }
    this._mimeTypesMap = {};
    this._nameMap = {};
    this._lowercaseNameMap = {};
    Object.keys(this._languages).forEach((langId) => {
      const language2 = this._languages[langId];
      if (language2.name) {
        this._nameMap[language2.name] = language2.identifier;
      }
      language2.aliases.forEach((alias) => {
        this._lowercaseNameMap[alias.toLowerCase()] = language2.identifier;
      });
      language2.mimetypes.forEach((mimetype) => {
        this._mimeTypesMap[mimetype] = language2.identifier;
      });
    });
    Registry.as(Extensions4.Configuration).registerOverrideIdentifiers(this.getRegisteredLanguageIds());
    this._onDidChange.fire();
  }
  _registerLanguage(lang) {
    const langId = lang.id;
    let resolvedLanguage;
    if (hasOwnProperty3.call(this._languages, langId)) {
      resolvedLanguage = this._languages[langId];
    } else {
      this.languageIdCodec.register(langId);
      resolvedLanguage = {
        identifier: langId,
        name: null,
        mimetypes: [],
        aliases: [],
        extensions: [],
        filenames: [],
        configurationFiles: [],
        icons: []
      };
      this._languages[langId] = resolvedLanguage;
    }
    this._mergeLanguage(resolvedLanguage, lang);
  }
  _mergeLanguage(resolvedLanguage, lang) {
    const langId = lang.id;
    let primaryMime = null;
    if (Array.isArray(lang.mimetypes) && lang.mimetypes.length > 0) {
      resolvedLanguage.mimetypes.push(...lang.mimetypes);
      primaryMime = lang.mimetypes[0];
    }
    if (!primaryMime) {
      primaryMime = `text/x-${langId}`;
      resolvedLanguage.mimetypes.push(primaryMime);
    }
    if (Array.isArray(lang.extensions)) {
      if (lang.configuration) {
        resolvedLanguage.extensions = lang.extensions.concat(resolvedLanguage.extensions);
      } else {
        resolvedLanguage.extensions = resolvedLanguage.extensions.concat(lang.extensions);
      }
      for (const extension of lang.extensions) {
        registerPlatformLanguageAssociation({ id: langId, mime: primaryMime, extension }, this._warnOnOverwrite);
      }
    }
    if (Array.isArray(lang.filenames)) {
      for (const filename of lang.filenames) {
        registerPlatformLanguageAssociation({ id: langId, mime: primaryMime, filename }, this._warnOnOverwrite);
        resolvedLanguage.filenames.push(filename);
      }
    }
    if (Array.isArray(lang.filenamePatterns)) {
      for (const filenamePattern of lang.filenamePatterns) {
        registerPlatformLanguageAssociation({ id: langId, mime: primaryMime, filepattern: filenamePattern }, this._warnOnOverwrite);
      }
    }
    if (typeof lang.firstLine === "string" && lang.firstLine.length > 0) {
      let firstLineRegexStr = lang.firstLine;
      if (firstLineRegexStr.charAt(0) !== "^") {
        firstLineRegexStr = "^" + firstLineRegexStr;
      }
      try {
        const firstLineRegex = new RegExp(firstLineRegexStr);
        if (!regExpLeadsToEndlessLoop(firstLineRegex)) {
          registerPlatformLanguageAssociation({ id: langId, mime: primaryMime, firstline: firstLineRegex }, this._warnOnOverwrite);
        }
      } catch (err) {
        console.warn(`[${lang.id}]: Invalid regular expression \`${firstLineRegexStr}\`: `, err);
      }
    }
    resolvedLanguage.aliases.push(langId);
    let langAliases = null;
    if (typeof lang.aliases !== "undefined" && Array.isArray(lang.aliases)) {
      if (lang.aliases.length === 0) {
        langAliases = [null];
      } else {
        langAliases = lang.aliases;
      }
    }
    if (langAliases !== null) {
      for (const langAlias of langAliases) {
        if (!langAlias || langAlias.length === 0) {
          continue;
        }
        resolvedLanguage.aliases.push(langAlias);
      }
    }
    const containsAliases = langAliases !== null && langAliases.length > 0;
    if (containsAliases && langAliases[0] === null) {
    } else {
      const bestName = (containsAliases ? langAliases[0] : null) || langId;
      if (containsAliases || !resolvedLanguage.name) {
        resolvedLanguage.name = bestName;
      }
    }
    if (lang.configuration) {
      resolvedLanguage.configurationFiles.push(lang.configuration);
    }
    if (lang.icon) {
      resolvedLanguage.icons.push(lang.icon);
    }
  }
  isRegisteredLanguageId(languageId) {
    if (!languageId) {
      return false;
    }
    return hasOwnProperty3.call(this._languages, languageId);
  }
  getRegisteredLanguageIds() {
    return Object.keys(this._languages);
  }
  getSortedRegisteredLanguageNames() {
    const result = [];
    for (const languageName in this._nameMap) {
      if (hasOwnProperty3.call(this._nameMap, languageName)) {
        result.push({
          languageName,
          languageId: this._nameMap[languageName]
        });
      }
    }
    result.sort((a, b) => compareIgnoreCase(a.languageName, b.languageName));
    return result;
  }
  getLanguageName(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return null;
    }
    return this._languages[languageId].name;
  }
  getMimeType(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return null;
    }
    const language2 = this._languages[languageId];
    return language2.mimetypes[0] || null;
  }
  getExtensions(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return [];
    }
    return this._languages[languageId].extensions;
  }
  getFilenames(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return [];
    }
    return this._languages[languageId].filenames;
  }
  getIcon(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return null;
    }
    const language2 = this._languages[languageId];
    return language2.icons[0] || null;
  }
  getConfigurationFiles(languageId) {
    if (!hasOwnProperty3.call(this._languages, languageId)) {
      return [];
    }
    return this._languages[languageId].configurationFiles || [];
  }
  getLanguageIdByLanguageName(languageName) {
    const languageNameLower = languageName.toLowerCase();
    if (!hasOwnProperty3.call(this._lowercaseNameMap, languageNameLower)) {
      return null;
    }
    return this._lowercaseNameMap[languageNameLower];
  }
  getLanguageIdByMimeType(mimeType) {
    if (!mimeType) {
      return null;
    }
    if (hasOwnProperty3.call(this._mimeTypesMap, mimeType)) {
      return this._mimeTypesMap[mimeType];
    }
    return null;
  }
  guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
    if (!resource && !firstLine) {
      return [];
    }
    return getLanguageIds(resource, firstLine);
  }
};
export { hasOwnProperty3, NULL_LANGUAGE_ID, LanguageIdCodec, LanguagesRegistry };
