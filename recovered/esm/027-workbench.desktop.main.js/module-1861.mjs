// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/preferencesSearch.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { createRegExp, equalsIgnoreCase } from "./module-0030.mjs";
import { SettingKeyMatchTypes } from "./module-1294.mjs";
import { EMBEDDINGS_SEARCH_PROVIDER_NAME, IPreferencesSearchService, LLM_RANKED_SEARCH_PROVIDER_NAME, STRING_MATCH_SEARCH_PROVIDER_NAME, TF_IDF_SEARCH_PROVIDER_NAME } from "./module-1831.mjs";
import { distinct } from "./module-0007.mjs";
import { matchesBaseContiguousSubString, matchesContiguousSubString, matchesSubString, matchesWords } from "./module-0453.mjs";
import { nullRange } from "./module-1650.mjs";
import { TfIdfCalculator } from "./module-1860.mjs";
import { IAiSettingsSearchService } from "./module-1209.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/preferences/browser/preferencesSearch.ts
var PreferencesSearchService = class extends Disposable {
  constructor(instantiationService, configurationService) {
    super();
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
  }
  getLocalSearchProvider(filter2) {
    return this.instantiationService.createInstance(LocalSearchProvider, filter2);
  }
  get remoteSearchAllowed() {
    const workbenchSettings = this.configurationService.getValue().workbench.settings;
    return workbenchSettings.enableNaturalLanguageSearch;
  }
  getRemoteSearchProvider(filter2) {
    if (!this.remoteSearchAllowed) {
      return void 0;
    }
    this._remoteSearchProvider ??= this.instantiationService.createInstance(RemoteSearchProvider2);
    this._remoteSearchProvider.setFilter(filter2);
    return this._remoteSearchProvider;
  }
  getAiSearchProvider(filter2) {
    if (!this.remoteSearchAllowed) {
      return void 0;
    }
    this._aiSearchProvider ??= this.instantiationService.createInstance(AiSearchProvider);
    this._aiSearchProvider.setFilter(filter2);
    return this._aiSearchProvider;
  }
};

PreferencesSearchService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IConfigurationService)
], PreferencesSearchService);

function cleanFilter(filter2) {
  return filter2.replace(/[":]/g, " ").replace(/  /g, " ").trim();
}

var LocalSearchProvider = class {
  constructor(_filter, configurationService) {
    this._filter = _filter;
    this.configurationService = configurationService;
    this._filter = cleanFilter(this._filter);
  }
  searchModel(preferencesModel, token) {
    if (!this._filter) {
      return Promise.resolve(null);
    }
    const settingMatcher = (setting) => {
      let { matches: matches2, matchType, keyMatchScore } = new SettingMatches(
        this._filter,
        setting,
        true,
        this.configurationService
      );
      if (matchType === 0 /* None */ || matches2.length === 0) {
        return null;
      }
      if (equalsIgnoreCase(this._filter, setting.key)) {
        matchType = 256 /* ExactMatch */;
      }
      return {
        matches: matches2,
        matchType,
        keyMatchScore,
        score: 0
        // only used for RemoteSearchProvider matches.
      };
    };
    const filterMatches = preferencesModel.filterSettings(this._filter, this.getGroupFilter(this._filter), settingMatcher);
    const topKeyMatchType = Math.max(...filterMatches.map((m) => m.matchType & SettingKeyMatchTypes));
    const alwaysAllowedMatchTypes = 8 /* DescriptionOrValueMatch */ | 1 /* LanguageTagSettingMatch */;
    const filteredMatches = filterMatches.filter((m) => m.matchType & topKeyMatchType || m.matchType & alwaysAllowedMatchTypes || m.matchType === 256 /* ExactMatch */).map((m) => ({ ...m, providerName: STRING_MATCH_SEARCH_PROVIDER_NAME }));
    return Promise.resolve({
      filterMatches: filteredMatches,
      exactMatch: filteredMatches.some((m) => m.matchType === 256 /* ExactMatch */)
    });
  }
  getGroupFilter(filter2) {
    const regex = createRegExp(filter2, false, { global: true });
    return (group2) => {
      return group2.id !== "defaultOverrides" && regex.test(group2.title);
    };
  }
};

LocalSearchProvider = __decorateClass([
  __decorateParam(1, IConfigurationService)
], LocalSearchProvider);

var SettingMatches = class {
  constructor(searchString, setting, searchDescription, configurationService) {
    this.searchDescription = searchDescription;
    this.configurationService = configurationService;
    this.matchType = 0 /* None */;
    /**
     * A match score for key matches to allow comparing key matches against each other.
     * Otherwise, all key matches are treated the same, and sorting is done by ToC order.
     */
    this.keyMatchScore = 0;
    this.matches = distinct(this._findMatchesInSetting(searchString, setting), (match2) => `${match2.startLineNumber}_${match2.startColumn}_${match2.endLineNumber}_${match2.endColumn}_`);
  }
  _findMatchesInSetting(searchString, setting) {
    const result = this._doFindMatchesInSetting(searchString, setting);
    return result;
  }
  _keyToLabel(settingId) {
    const label3 = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label3;
  }
  _toAlphaNumeric(s) {
    return s.replace(/[^\p{L}\p{N}]+/gu, "");
  }
  _doFindMatchesInSetting(searchString, setting) {
    const descriptionMatchingWords = /* @__PURE__ */ new Map();
    const keyMatchingWords = /* @__PURE__ */ new Map();
    const valueMatchingWords = /* @__PURE__ */ new Map();
    const settingKeyAsWords = this._keyToLabel(setting.key);
    const queryWords = new Set(searchString.split(" "));
    for (const word of queryWords) {
      const keyMatches = matchesWords(word, settingKeyAsWords, true);
      if (keyMatches?.length) {
        keyMatchingWords.set(word, keyMatches.map((match2) => this.toKeyRange(setting, match2)));
      }
    }
    if (keyMatchingWords.size === queryWords.size) {
      this.matchType |= 128 /* AllWordsInSettingsLabel */;
    } else if (keyMatchingWords.size >= 2) {
      this.matchType |= 32 /* ContiguousWordsInSettingsLabel */;
      this.keyMatchScore = keyMatchingWords.size;
    }
    const searchStringAlphaNumeric = this._toAlphaNumeric(searchString);
    const keyAlphaNumeric = this._toAlphaNumeric(setting.key);
    const keyIdMatches = matchesContiguousSubString(searchStringAlphaNumeric, keyAlphaNumeric);
    if (keyIdMatches?.length) {
      keyMatchingWords.set(setting.key, keyIdMatches.map((match2) => this.toKeyRange(setting, match2)));
      this.matchType |= 64 /* ContiguousQueryInSettingId */;
    }
    if (this.matchType === 0 /* None */) {
      keyMatchingWords.clear();
      for (const word of queryWords) {
        const keyMatches = matchesWords(word, settingKeyAsWords, false);
        if (keyMatches?.length) {
          keyMatchingWords.set(word, keyMatches.map((match2) => this.toKeyRange(setting, match2)));
        }
      }
      if (keyMatchingWords.size >= 2 || keyMatchingWords.size === 1 && queryWords.size === 1) {
        this.matchType |= 16 /* NonContiguousWordsInSettingsLabel */;
        this.keyMatchScore = keyMatchingWords.size;
      } else {
        const keyIdMatches2 = matchesSubString(searchStringAlphaNumeric, keyAlphaNumeric);
        if (keyIdMatches2?.length) {
          keyMatchingWords.set(setting.key, keyIdMatches2.map((match2) => this.toKeyRange(setting, match2)));
          this.matchType |= 4 /* NonContiguousQueryInSettingId */;
        }
      }
    }
    if (setting.overrides?.length && this.matchType !== 0 /* None */) {
      this.matchType = 1 /* LanguageTagSettingMatch */;
      const keyRanges2 = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
      return [...keyRanges2];
    }
    const hasContiguousKeyMatchTypes = this.matchType >= 32 /* ContiguousWordsInSettingsLabel */;
    if (this.searchDescription && !hasContiguousKeyMatchTypes) {
      const searchableLines = setting.keywords?.length ? [...setting.description, setting.keywords.join(" ")] : setting.description;
      for (const word of queryWords) {
        for (let lineIndex = 0; lineIndex < searchableLines.length; lineIndex++) {
          const descriptionMatches = matchesBaseContiguousSubString(word, searchableLines[lineIndex]);
          if (descriptionMatches?.length) {
            descriptionMatchingWords.set(word, descriptionMatches.map((match2) => this.toDescriptionRange(setting, match2, lineIndex)));
          }
        }
      }
      if (descriptionMatchingWords.size === queryWords.size) {
        this.matchType |= 8 /* DescriptionOrValueMatch */;
      } else {
        descriptionMatchingWords.clear();
      }
    }
    if (!hasContiguousKeyMatchTypes) {
      if (setting.enum?.length) {
        for (const option2 of setting.enum) {
          if (typeof option2 !== "string") {
            continue;
          }
          valueMatchingWords.clear();
          for (const word of queryWords) {
            const valueMatches = matchesContiguousSubString(word, option2);
            if (valueMatches?.length) {
              valueMatchingWords.set(word, valueMatches.map((match2) => this.toValueRange(setting, match2)));
            }
          }
          if (valueMatchingWords.size === queryWords.size) {
            this.matchType |= 8 /* DescriptionOrValueMatch */;
            break;
          } else {
            valueMatchingWords.clear();
          }
        }
      } else {
        const settingValue = this.configurationService.getValue(setting.key);
        if (typeof settingValue === "string") {
          for (const word of queryWords) {
            const valueMatches = matchesContiguousSubString(word, settingValue);
            if (valueMatches?.length) {
              valueMatchingWords.set(word, valueMatches.map((match2) => this.toValueRange(setting, match2)));
            }
          }
          if (valueMatchingWords.size === queryWords.size) {
            this.matchType |= 8 /* DescriptionOrValueMatch */;
          } else {
            valueMatchingWords.clear();
          }
        }
      }
    }
    const descriptionRanges = descriptionMatchingWords.size ? Array.from(descriptionMatchingWords.values()).flat() : [];
    const keyRanges = keyMatchingWords.size ? Array.from(keyMatchingWords.values()).flat() : [];
    const valueRanges = valueMatchingWords.size ? Array.from(valueMatchingWords.values()).flat() : [];
    return [...descriptionRanges, ...keyRanges, ...valueRanges];
  }
  toKeyRange(setting, match2) {
    return {
      startLineNumber: setting.keyRange.startLineNumber,
      startColumn: setting.keyRange.startColumn + match2.start,
      endLineNumber: setting.keyRange.startLineNumber,
      endColumn: setting.keyRange.startColumn + match2.end
    };
  }
  toDescriptionRange(setting, match2, lineIndex) {
    const descriptionRange = setting.descriptionRanges[lineIndex];
    if (!descriptionRange) {
      return nullRange;
    }
    return {
      startLineNumber: descriptionRange.startLineNumber,
      startColumn: descriptionRange.startColumn + match2.start,
      endLineNumber: descriptionRange.endLineNumber,
      endColumn: descriptionRange.startColumn + match2.end
    };
  }
  toValueRange(setting, match2) {
    return {
      startLineNumber: setting.valueRange.startLineNumber,
      startColumn: setting.valueRange.startColumn + match2.start + 1,
      endLineNumber: setting.valueRange.startLineNumber,
      endColumn: setting.valueRange.startColumn + match2.end + 1
    };
  }
};

var SettingsRecordProvider = class {
  constructor() {
    this._settingsRecord = {};
  }
  updateModel(preferencesModel) {
    if (preferencesModel === this._currentPreferencesModel) {
      return;
    }
    this._currentPreferencesModel = preferencesModel;
    this.refresh();
  }
  refresh() {
    this._settingsRecord = {};
    if (!this._currentPreferencesModel) {
      return;
    }
    for (const group2 of this._currentPreferencesModel.settingsGroups) {
      if (group2.id === "mostCommonlyUsed") {
        continue;
      }
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          this._settingsRecord[setting.key] = setting;
        }
      }
    }
  }
  getSettingsRecord() {
    return this._settingsRecord;
  }
};

var EmbeddingsSearchProvider = class _EmbeddingsSearchProvider {
  constructor(_aiSettingsSearchService) {
    this._aiSettingsSearchService = _aiSettingsSearchService;
    this._filter = "";
    this._recordProvider = new SettingsRecordProvider();
  }
  static {
    this.EMBEDDINGS_SETTINGS_SEARCH_MAX_PICKS = 10;
  }
  setFilter(filter2) {
    this._filter = cleanFilter(filter2);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this._aiSettingsSearchService.isEnabled()) {
      return null;
    }
    this._recordProvider.updateModel(preferencesModel);
    this._aiSettingsSearchService.startSearch(this._filter, token);
    return {
      filterMatches: await this.getEmbeddingsItems(token),
      exactMatch: false
    };
  }
  async getEmbeddingsItems(token) {
    const settingsRecord = this._recordProvider.getSettingsRecord();
    const filterMatches = [];
    const settings = await this._aiSettingsSearchService.getEmbeddingsResults(this._filter, token);
    if (!settings) {
      return [];
    }
    const providerName = EMBEDDINGS_SEARCH_PROVIDER_NAME;
    for (const settingKey of settings) {
      if (filterMatches.length === _EmbeddingsSearchProvider.EMBEDDINGS_SETTINGS_SEARCH_MAX_PICKS) {
        break;
      }
      filterMatches.push({
        setting: settingsRecord[settingKey],
        matches: [settingsRecord[settingKey].range],
        matchType: 2 /* RemoteMatch */,
        keyMatchScore: 0,
        score: 0,
        // the results are sorted upstream.
        providerName
      });
    }
    return filterMatches;
  }
};

var TfIdfSearchProvider = class _TfIdfSearchProvider {
  constructor() {
    this._filter = "";
    this._documents = [];
    this._settingsRecord = {};
  }
  static {
    this.TF_IDF_PRE_NORMALIZE_THRESHOLD = 50;
  }
  static {
    this.TF_IDF_POST_NORMALIZE_THRESHOLD = 0.7;
  }
  static {
    this.TF_IDF_MAX_PICKS = 5;
  }
  setFilter(filter2) {
    this._filter = cleanFilter(filter2);
  }
  keyToLabel(settingId) {
    const label3 = settingId.replace(/[-._]/g, " ").replace(/([a-z]+)([A-Z])/g, "$1 $2").replace(/([A-Za-z]+)(\d+)/g, "$1 $2").replace(/(\d+)([A-Za-z]+)/g, "$1 $2").toLowerCase();
    return label3;
  }
  settingItemToEmbeddingString(item) {
    let result = `Setting Id: ${item.key}
`;
    result += `Label: ${this.keyToLabel(item.key)}
`;
    result += `Description: ${item.description}
`;
    return result;
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter) {
      return null;
    }
    if (this._currentPreferencesModel !== preferencesModel) {
      this._currentPreferencesModel = preferencesModel;
      this._documents = [];
      this._settingsRecord = {};
      for (const group2 of preferencesModel.settingsGroups) {
        if (group2.id === "mostCommonlyUsed") {
          continue;
        }
        for (const section of group2.sections) {
          for (const setting of section.settings) {
            this._documents.push({
              key: setting.key,
              textChunks: [this.settingItemToEmbeddingString(setting)]
            });
            this._settingsRecord[setting.key] = setting;
          }
        }
      }
    }
    return {
      filterMatches: await this.getTfIdfItems(token),
      exactMatch: false
    };
  }
  async getTfIdfItems(token) {
    const filterMatches = [];
    const tfIdfCalculator = new TfIdfCalculator();
    tfIdfCalculator.updateDocuments(this._documents);
    const tfIdfRankings = tfIdfCalculator.calculateScores(this._filter, token);
    tfIdfRankings.sort((a, b) => b.score - a.score);
    const maxScore = tfIdfRankings[0].score;
    if (maxScore < _TfIdfSearchProvider.TF_IDF_PRE_NORMALIZE_THRESHOLD) {
      return [];
    }
    for (const info of tfIdfRankings) {
      if (info.score / maxScore < _TfIdfSearchProvider.TF_IDF_POST_NORMALIZE_THRESHOLD || filterMatches.length === _TfIdfSearchProvider.TF_IDF_MAX_PICKS) {
        break;
      }
      const pick = info.key;
      filterMatches.push({
        setting: this._settingsRecord[pick],
        matches: [this._settingsRecord[pick].range],
        matchType: 2 /* RemoteMatch */,
        keyMatchScore: 0,
        score: info.score,
        providerName: TF_IDF_SEARCH_PROVIDER_NAME
      });
    }
    return filterMatches;
  }
};

var RemoteSearchProvider2 = class {
  constructor() {
    this._filter = "";
    this._tfIdfSearchProvider = new TfIdfSearchProvider();
  }
  setFilter(filter2) {
    this._filter = filter2;
    this._tfIdfSearchProvider.setFilter(filter2);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter) {
      return null;
    }
    const results = await this._tfIdfSearchProvider.searchModel(preferencesModel, token);
    return results;
  }
};

var AiSearchProvider = class {
  constructor(aiSettingsSearchService) {
    this.aiSettingsSearchService = aiSettingsSearchService;
    this._filter = "";
    this._embeddingsSearchProvider = new EmbeddingsSearchProvider(this.aiSettingsSearchService);
    this._recordProvider = new SettingsRecordProvider();
  }
  setFilter(filter2) {
    this._filter = filter2;
    this._embeddingsSearchProvider.setFilter(filter2);
  }
  async searchModel(preferencesModel, token) {
    if (!this._filter || !this.aiSettingsSearchService.isEnabled()) {
      return null;
    }
    this._recordProvider.updateModel(preferencesModel);
    const results = await this._embeddingsSearchProvider.searchModel(preferencesModel, token);
    return results;
  }
  async getLLMRankedResults(token) {
    if (!this._filter || !this.aiSettingsSearchService.isEnabled()) {
      return null;
    }
    const items = await this.getLLMRankedItems(token);
    return {
      filterMatches: items,
      exactMatch: false
    };
  }
  async getLLMRankedItems(token) {
    const settingsRecord = this._recordProvider.getSettingsRecord();
    const filterMatches = [];
    const settings = await this.aiSettingsSearchService.getLLMRankedResults(this._filter, token);
    if (!settings) {
      return [];
    }
    for (const settingKey of settings) {
      if (!settingsRecord[settingKey]) {
        continue;
      }
      filterMatches.push({
        setting: settingsRecord[settingKey],
        matches: [settingsRecord[settingKey].range],
        matchType: 2 /* RemoteMatch */,
        keyMatchScore: 0,
        score: 0,
        // the results are sorted upstream.
        providerName: LLM_RANKED_SEARCH_PROVIDER_NAME
      });
    }
    return filterMatches;
  }
};

AiSearchProvider = __decorateClass([
  __decorateParam(0, IAiSettingsSearchService)
], AiSearchProvider);

registerSingleton(IPreferencesSearchService, PreferencesSearchService, 1 /* Delayed */);
export { cleanFilter, PreferencesSearchService, LocalSearchProvider, SettingMatches, SettingsRecordProvider, EmbeddingsSearchProvider, TfIdfSearchProvider, RemoteSearchProvider2, AiSearchProvider };
