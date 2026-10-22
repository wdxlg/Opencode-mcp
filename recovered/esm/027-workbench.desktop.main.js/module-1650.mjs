// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/common/preferencesModels.ts
import { EditorModel } from "./module-1096.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { visit } from "./module-0883.mjs";
import { Disposable } from "./module-0012.mjs";
import { coalesce } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { createValidator } from "./module-1649.mjs";
import { FOLDER_SCOPES, WORKSPACE_SCOPES } from "./module-1198.mjs";
import { Selection } from "./module-0107.mjs";
import { Range2 } from "./module-0106.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/workbench/services/preferences/common/preferencesModels.ts
var nullRange = { startLineNumber: -1, startColumn: -1, endLineNumber: -1, endColumn: -1 };

function isNullRange(range2) {
  return range2.startLineNumber === -1 && range2.startColumn === -1 && range2.endLineNumber === -1 && range2.endColumn === -1;
}

function fixSettingLinks(text2) {
  return text2.replace(/`#([^#`]*)#`/g, (_, settingName) => `\`${settingName}\``);
}

var AbstractSettingsModel = class extends EditorModel {
  constructor() {
    super(...arguments);
    this._currentResultGroups = /* @__PURE__ */ new Map();
  }
  updateResultGroup(id2, resultGroup) {
    if (resultGroup) {
      this._currentResultGroups.set(id2, resultGroup);
    } else {
      this._currentResultGroups.delete(id2);
    }
    this.removeDuplicateResults();
    return this.update();
  }
  /**
   * Remove duplicates between result groups, preferring results in earlier groups
   */
  removeDuplicateResults() {
    const settingKeys = /* @__PURE__ */ new Set();
    [...this._currentResultGroups.keys()].sort((a, b) => this._currentResultGroups.get(a).order - this._currentResultGroups.get(b).order).forEach((groupId) => {
      const group2 = this._currentResultGroups.get(groupId);
      group2.result.filterMatches = group2.result.filterMatches.filter((s) => !settingKeys.has(s.setting.key));
      group2.result.filterMatches.forEach((s) => settingKeys.add(s.setting.key));
    });
  }
  filterSettings(filter2, groupFilter, settingMatcher) {
    const allGroups = this.filterGroups;
    const filterMatches = [];
    for (const group2 of allGroups) {
      const groupMatched = groupFilter(group2);
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          const settingMatchResult = settingMatcher(setting, group2);
          if (groupMatched || settingMatchResult) {
            filterMatches.push({
              setting,
              matches: settingMatchResult && settingMatchResult.matches,
              matchType: settingMatchResult?.matchType ?? 0 /* None */,
              keyMatchScore: settingMatchResult?.keyMatchScore ?? 0,
              score: settingMatchResult?.score ?? 0
            });
          }
        }
      }
    }
    return filterMatches;
  }
  getPreference(key3) {
    for (const group2 of this.settingsGroups) {
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          if (key3 === setting.key) {
            return setting;
          }
        }
      }
    }
    return void 0;
  }
  get filterGroups() {
    return this.settingsGroups;
  }
};

var SettingsEditorModel = class extends AbstractSettingsModel {
  constructor(reference, _configurationTarget) {
    super();
    this._configurationTarget = _configurationTarget;
    this._onDidChangeGroups = this._register(new Emitter());
    this.onDidChangeGroups = this._onDidChangeGroups.event;
    this.settingsModel = reference.object.textEditorModel;
    this._register(this.onWillDispose(() => reference.dispose()));
    this._register(this.settingsModel.onDidChangeContent(() => {
      this._settingsGroups = void 0;
      this._onDidChangeGroups.fire();
    }));
  }
  get uri() {
    return this.settingsModel.uri;
  }
  get configurationTarget() {
    return this._configurationTarget;
  }
  get settingsGroups() {
    if (!this._settingsGroups) {
      this.parse();
    }
    return this._settingsGroups;
  }
  get content() {
    return this.settingsModel.getValue();
  }
  isSettingsProperty(property, previousParents) {
    return previousParents.length === 0;
  }
  parse() {
    this._settingsGroups = parse10(this.settingsModel, (property, previousParents) => this.isSettingsProperty(property, previousParents));
  }
  update() {
    const resultGroups = [...this._currentResultGroups.values()];
    if (!resultGroups.length) {
      return void 0;
    }
    const filteredSettings = [];
    const matches2 = [];
    resultGroups.forEach((group2) => {
      group2.result.filterMatches.forEach((filterMatch) => {
        filteredSettings.push(filterMatch.setting);
        if (filterMatch.matches) {
          matches2.push(...filterMatch.matches);
        }
      });
    });
    let filteredGroup;
    const modelGroup = this.settingsGroups[0];
    if (modelGroup) {
      filteredGroup = {
        id: modelGroup.id,
        range: modelGroup.range,
        sections: [{
          settings: filteredSettings
        }],
        title: modelGroup.title,
        titleRange: modelGroup.titleRange,
        order: modelGroup.order,
        extensionInfo: modelGroup.extensionInfo
      };
    }
    return {
      allGroups: this.settingsGroups,
      filteredGroups: filteredGroup ? [filteredGroup] : [],
      matches: matches2
    };
  }
};

var Settings2EditorModel = class extends AbstractSettingsModel {
  constructor(_defaultSettings, configurationService) {
    super();
    this._defaultSettings = _defaultSettings;
    this._onDidChangeGroups = this._register(new Emitter());
    this.onDidChangeGroups = this._onDidChangeGroups.event;
    this.additionalGroups = [];
    this.dirty = false;
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.source === 7 /* DEFAULT */) {
        this.dirty = true;
        this._onDidChangeGroups.fire();
      }
    }));
    this._register(Registry.as(Extensions4.Configuration).onDidSchemaChange((e) => {
      this.dirty = true;
      this._onDidChangeGroups.fire();
    }));
  }
  /** Doesn't include the "Commonly Used" group */
  get filterGroups() {
    return this.settingsGroups.slice(1);
  }
  get settingsGroups() {
    const groups = this._defaultSettings.getSettingsGroups(this.dirty);
    this.dirty = false;
    return [...groups, ...this.additionalGroups];
  }
  /** For programmatically added groups outside of registered configurations */
  setAdditionalGroups(groups) {
    this.additionalGroups = groups;
  }
  update() {
    throw new Error("Not supported");
  }
};

Settings2EditorModel = __decorateClass([
  __decorateParam(1, IConfigurationService)
], Settings2EditorModel);

function parse10(model, isSettingsProperty) {
  const settings = [];
  let overrideSetting = null;
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  let settingsPropertyIndex = -1;
  const range2 = {
    startLineNumber: 0,
    startColumn: 0,
    endLineNumber: 0,
    endColumn: 0
  };
  function onValue(value2, offset, length) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value2);
    } else if (currentProperty) {
      currentParent[currentProperty] = value2;
    }
    if (previousParents.length === settingsPropertyIndex + 1 || previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null) {
      const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
      if (setting) {
        const valueStartPosition = model.getPositionAt(offset);
        const valueEndPosition = model.getPositionAt(offset + length);
        setting.value = value2;
        setting.valueRange = {
          startLineNumber: valueStartPosition.lineNumber,
          startColumn: valueStartPosition.column,
          endLineNumber: valueEndPosition.lineNumber,
          endColumn: valueEndPosition.column
        };
        setting.range = Object.assign(setting.range, {
          endLineNumber: valueEndPosition.lineNumber,
          endColumn: valueEndPosition.column
        });
      }
    }
  }
  const visitor = {
    onObjectBegin: (offset, length) => {
      if (isSettingsProperty(currentProperty, previousParents)) {
        settingsPropertyIndex = previousParents.length;
        const position2 = model.getPositionAt(offset);
        range2.startLineNumber = position2.lineNumber;
        range2.startColumn = position2.column;
      }
      const object2 = {};
      onValue(object2, offset, length);
      currentParent = object2;
      currentProperty = null;
      previousParents.push(currentParent);
    },
    onObjectProperty: (name, offset, length) => {
      currentProperty = name;
      if (previousParents.length === settingsPropertyIndex + 1 || previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null) {
        const settingStartPosition = model.getPositionAt(offset);
        const setting = {
          description: [],
          descriptionIsMarkdown: false,
          key: name,
          keyRange: {
            startLineNumber: settingStartPosition.lineNumber,
            startColumn: settingStartPosition.column + 1,
            endLineNumber: settingStartPosition.lineNumber,
            endColumn: settingStartPosition.column + length
          },
          range: {
            startLineNumber: settingStartPosition.lineNumber,
            startColumn: settingStartPosition.column,
            endLineNumber: 0,
            endColumn: 0
          },
          value: null,
          valueRange: nullRange,
          descriptionRanges: [],
          overrides: [],
          overrideOf: overrideSetting ?? void 0
        };
        if (previousParents.length === settingsPropertyIndex + 1) {
          settings.push(setting);
          if (OVERRIDE_PROPERTY_REGEX.test(name)) {
            overrideSetting = setting;
          }
        } else {
          overrideSetting.overrides.push(setting);
        }
      }
    },
    onObjectEnd: (offset, length) => {
      currentParent = previousParents.pop();
      if (settingsPropertyIndex !== -1 && (previousParents.length === settingsPropertyIndex + 1 || previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
        const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
        if (setting) {
          const valueEndPosition = model.getPositionAt(offset + length);
          setting.valueRange = Object.assign(setting.valueRange, {
            endLineNumber: valueEndPosition.lineNumber,
            endColumn: valueEndPosition.column
          });
          setting.range = Object.assign(setting.range, {
            endLineNumber: valueEndPosition.lineNumber,
            endColumn: valueEndPosition.column
          });
        }
        if (previousParents.length === settingsPropertyIndex + 1) {
          overrideSetting = null;
        }
      }
      if (previousParents.length === settingsPropertyIndex) {
        const position2 = model.getPositionAt(offset);
        range2.endLineNumber = position2.lineNumber;
        range2.endColumn = position2.column;
        settingsPropertyIndex = -1;
      }
    },
    onArrayBegin: (offset, length) => {
      const array3 = [];
      onValue(array3, offset, length);
      previousParents.push(currentParent);
      currentParent = array3;
      currentProperty = null;
    },
    onArrayEnd: (offset, length) => {
      currentParent = previousParents.pop();
      if (previousParents.length === settingsPropertyIndex + 1 || previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null) {
        const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
        if (setting) {
          const valueEndPosition = model.getPositionAt(offset + length);
          setting.valueRange = Object.assign(setting.valueRange, {
            endLineNumber: valueEndPosition.lineNumber,
            endColumn: valueEndPosition.column
          });
          setting.range = Object.assign(setting.range, {
            endLineNumber: valueEndPosition.lineNumber,
            endColumn: valueEndPosition.column
          });
        }
      }
    },
    onLiteralValue: onValue,
    onError: (error) => {
      const setting = settings[settings.length - 1];
      if (setting && (isNullRange(setting.range) || isNullRange(setting.keyRange) || isNullRange(setting.valueRange))) {
        settings.pop();
      }
    }
  };
  if (!model.isDisposed()) {
    visit(model.getValue(), visitor);
  }
  return settings.length > 0 ? [{
    id: model.isDisposed() ? "" : model.id,
    sections: [
      {
        settings
      }
    ],
    title: "",
    titleRange: nullRange,
    range: range2
  }] : [];
}

var WorkspaceConfigurationEditorModel = class extends SettingsEditorModel {
  constructor() {
    super(...arguments);
    this._configurationGroups = [];
  }
  get configurationGroups() {
    return this._configurationGroups;
  }
  parse() {
    super.parse();
    this._configurationGroups = parse10(this.settingsModel, (property, previousParents) => previousParents.length === 0);
  }
  isSettingsProperty(property, previousParents) {
    return property === "settings" && previousParents.length === 1;
  }
};

var DefaultSettings = class extends Disposable {
  constructor(_mostCommonlyUsedSettingsKeys, target, configurationService) {
    super();
    this._mostCommonlyUsedSettingsKeys = _mostCommonlyUsedSettingsKeys;
    this.target = target;
    this.configurationService = configurationService;
    this._settingsByName = /* @__PURE__ */ new Map();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.source === 7 /* DEFAULT */) {
        this.reset();
        this._onDidChange.fire();
      }
    }));
  }
  getContent(forceUpdate = false) {
    if (!this._content || forceUpdate) {
      this.initialize();
    }
    return this._content;
  }
  getContentWithoutMostCommonlyUsed(forceUpdate = false) {
    if (!this._contentWithoutMostCommonlyUsed || forceUpdate) {
      this.initialize();
    }
    return this._contentWithoutMostCommonlyUsed;
  }
  getSettingsGroups(forceUpdate = false) {
    if (!this._allSettingsGroups || forceUpdate) {
      this.initialize();
    }
    return this._allSettingsGroups;
  }
  initialize() {
    this._allSettingsGroups = this.parse();
    this._content = this.toContent(this._allSettingsGroups, 0);
    this._contentWithoutMostCommonlyUsed = this.toContent(this._allSettingsGroups, 1);
  }
  reset() {
    this._content = void 0;
    this._contentWithoutMostCommonlyUsed = void 0;
    this._allSettingsGroups = void 0;
  }
  parse() {
    const settingsGroups = this.getRegisteredGroups();
    this.initAllSettingsMap(settingsGroups);
    const mostCommonlyUsed = this.getMostCommonlyUsedSettings();
    return [mostCommonlyUsed, ...settingsGroups];
  }
  getRegisteredGroups() {
    const registry4 = Registry.as(Extensions4.Configuration);
    const allConfigurations = { ...registry4.getConfigurationProperties() };
    const excludedConfigurations = registry4.getExcludedConfigurationProperties();
    for (const policyKey of this.configurationService.keys().policy ?? []) {
      const policyConfiguration = excludedConfigurations[policyKey];
      if (policyConfiguration) {
        allConfigurations[policyKey] = policyConfiguration;
      }
    }
    const groups = this.removeEmptySettingsGroups(this.parseProperties(allConfigurations).sort(this.compareGroups));
    return this.sortGroups(groups);
  }
  sortGroups(groups) {
    groups.forEach((group2) => {
      group2.sections.forEach((section) => {
        section.settings.sort((a, b) => a.key.localeCompare(b.key));
      });
    });
    return groups;
  }
  initAllSettingsMap(allSettingsGroups) {
    this._settingsByName = /* @__PURE__ */ new Map();
    for (const group2 of allSettingsGroups) {
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          this._settingsByName.set(setting.key, setting);
        }
      }
    }
  }
  getMostCommonlyUsedSettings() {
    const settings = coalesce(this._mostCommonlyUsedSettingsKeys.map((key3) => {
      const setting = this._settingsByName.get(key3);
      if (setting) {
        return {
          description: setting.description,
          key: setting.key,
          value: setting.value,
          keyRange: nullRange,
          range: nullRange,
          valueRange: nullRange,
          overrides: [],
          scope: 5 /* RESOURCE */,
          type: setting.type,
          enum: setting.enum,
          enumDescriptions: setting.enumDescriptions,
          descriptionRanges: []
        };
      }
      return null;
    }));
    return {
      id: "mostCommonlyUsed",
      range: nullRange,
      title: localize(23291, null),
      titleRange: nullRange,
      sections: [
        {
          settings
        }
      ]
    };
  }
  parseProperties(properties) {
    const result = [];
    const byTitle = /* @__PURE__ */ new Map();
    const byId = /* @__PURE__ */ new Map();
    for (const [key3, property] of Object.entries(properties)) {
      if (!property.section) {
        continue;
      }
      let settingsGroup;
      if (property.section.title) {
        const groups = byTitle.get(property.section.title);
        if (groups) {
          const extensionId = property.section.extensionInfo?.id;
          settingsGroup = groups.find((g) => g.extensionInfo?.id === extensionId);
        }
      }
      if (!settingsGroup && property.section.id) {
        const groups = byId.get(property.section.id);
        if (groups) {
          const extensionId = property.section.extensionInfo?.id;
          settingsGroup = groups.find((g) => g.extensionInfo?.id === extensionId && !g.title);
        }
        if (settingsGroup && !settingsGroup?.title && property.section.title) {
          settingsGroup.title = property.section.title;
          const byTitleGroups = byTitle.get(property.section.title);
          if (byTitleGroups) {
            byTitleGroups.push(settingsGroup);
          } else {
            byTitle.set(property.section.title, [settingsGroup]);
          }
        }
      }
      if (!settingsGroup) {
        settingsGroup = { sections: [{ title: property.section.title, settings: [] }], id: property.section.id || "", title: property.section.title ?? "", titleRange: nullRange, order: property.section.order, range: nullRange, extensionInfo: isString(property.source) ? void 0 : property.source };
        result.push(settingsGroup);
        if (property.section.title) {
          const byTitleGroups = byTitle.get(property.section.title);
          if (byTitleGroups) {
            byTitleGroups.push(settingsGroup);
          } else {
            byTitle.set(property.section.title, [settingsGroup]);
          }
        }
        if (property.section.id) {
          const byIdGroups = byId.get(property.section.id);
          if (byIdGroups) {
            byIdGroups.push(settingsGroup);
          } else {
            byId.set(property.section.id, [settingsGroup]);
          }
        }
      }
      const setting = this.parseSetting(key3, property);
      if (setting) {
        settingsGroup.sections[0].settings.push(setting);
      }
    }
    return result;
  }
  removeEmptySettingsGroups(settingsGroups) {
    const result = [];
    for (const settingsGroup of settingsGroups) {
      settingsGroup.sections = settingsGroup.sections.filter((section) => section.settings.length > 0);
      if (settingsGroup.sections.length) {
        result.push(settingsGroup);
      }
    }
    return result;
  }
  parseSetting(key3, prop) {
    if (!this.matchesScope(prop)) {
      return void 0;
    }
    const value2 = prop.default;
    let description = prop.markdownDescription || prop.description || "";
    if (typeof description !== "string") {
      description = "";
    }
    const descriptionLines = description.split("\n");
    const overrides = OVERRIDE_PROPERTY_REGEX.test(key3) ? this.parseOverrideSettings(prop.default) : [];
    let listItemType;
    if (prop.type === "array" && prop.items && !Array.isArray(prop.items) && prop.items.type) {
      if (prop.items.enum) {
        listItemType = "enum";
      } else if (!Array.isArray(prop.items.type)) {
        listItemType = prop.items.type;
      }
    }
    const objectProperties = prop.type === "object" ? prop.properties : void 0;
    const objectPatternProperties = prop.type === "object" ? prop.patternProperties : void 0;
    const objectAdditionalProperties = prop.type === "object" ? prop.additionalProperties : void 0;
    const propertyNames = prop.type === "object" ? prop.propertyNames : void 0;
    let enumToUse = prop.enum;
    let enumDescriptions = prop.markdownEnumDescriptions ?? prop.enumDescriptions;
    let enumDescriptionsAreMarkdown = !!prop.markdownEnumDescriptions;
    if (listItemType === "enum" && !Array.isArray(prop.items)) {
      enumToUse = prop.items.enum;
      enumDescriptions = prop.items.markdownEnumDescriptions ?? prop.items.enumDescriptions;
      enumDescriptionsAreMarkdown = !!prop.items.markdownEnumDescriptions;
    }
    let allKeysAreBoolean = false;
    if (prop.type === "object" && !prop.additionalProperties && prop.properties && Object.keys(prop.properties).length) {
      allKeysAreBoolean = Object.keys(prop.properties).every((key4) => {
        return prop.properties[key4].type === "boolean";
      });
    }
    let isLanguageTagSetting = false;
    if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
      isLanguageTagSetting = true;
    }
    let defaultValueSource;
    if (!isLanguageTagSetting) {
      const registeredConfigurationProp = prop;
      if (registeredConfigurationProp && registeredConfigurationProp.defaultValueSource) {
        defaultValueSource = registeredConfigurationProp.defaultValueSource;
      }
    }
    if (!enumToUse && (prop.enumItemLabels || enumDescriptions || enumDescriptionsAreMarkdown)) {
      console.error(`The setting ${key3} has enum-related fields, but doesn't have an enum field. This setting may render improperly in the Settings editor.`);
    }
    return {
      key: key3,
      value: value2,
      description: descriptionLines,
      descriptionIsMarkdown: !!prop.markdownDescription,
      keywords: prop.keywords,
      range: nullRange,
      keyRange: nullRange,
      valueRange: nullRange,
      descriptionRanges: [],
      overrides,
      scope: prop.scope,
      type: prop.type,
      arrayItemType: listItemType,
      objectProperties,
      objectPatternProperties,
      objectAdditionalProperties,
      propertyNames,
      enum: enumToUse,
      enumDescriptions,
      enumDescriptionsAreMarkdown,
      enumItemLabels: prop.enumItemLabels,
      uniqueItems: prop.uniqueItems,
      tags: prop.tags,
      disallowSyncIgnore: prop.disallowSyncIgnore,
      restricted: prop.restricted,
      extensionInfo: isString(prop.source) ? void 0 : prop.source,
      deprecationMessage: prop.markdownDeprecationMessage || prop.deprecationMessage,
      deprecationMessageIsMarkdown: !!prop.markdownDeprecationMessage,
      validator: createValidator(prop),
      allKeysAreBoolean,
      editPresentation: prop.editPresentation,
      order: prop.order,
      nonLanguageSpecificDefaultValueSource: defaultValueSource,
      isLanguageTagSetting,
      categoryLabel: (isString(prop.source) ? void 0 : prop.source?.id) === prop.section?.id ? prop.title : prop.section?.id
    };
  }
  parseOverrideSettings(overrideSettings) {
    return Object.keys(overrideSettings).map((key3) => ({
      key: key3,
      value: overrideSettings[key3],
      description: [],
      descriptionIsMarkdown: false,
      range: nullRange,
      keyRange: nullRange,
      valueRange: nullRange,
      descriptionRanges: [],
      overrides: []
    }));
  }
  matchesScope(property) {
    if (!property.scope) {
      return true;
    }
    if (this.target === 6 /* WORKSPACE_FOLDER */) {
      return FOLDER_SCOPES.indexOf(property.scope) !== -1;
    }
    if (this.target === 5 /* WORKSPACE */) {
      return WORKSPACE_SCOPES.indexOf(property.scope) !== -1;
    }
    return true;
  }
  compareGroups(c1, c2) {
    if (typeof c1?.order !== "number") {
      return 1;
    }
    if (typeof c2?.order !== "number") {
      return -1;
    }
    if (c1.order === c2.order) {
      const title1 = c1.title || "";
      const title2 = c2.title || "";
      return title1.localeCompare(title2);
    }
    return c1.order - c2.order;
  }
  toContent(settingsGroups, startIndex) {
    const builder = new SettingsContentBuilder();
    for (let i2 = startIndex; i2 < settingsGroups.length; i2++) {
      builder.pushGroup(settingsGroups[i2], i2 === startIndex, i2 === settingsGroups.length - 1);
    }
    return builder.getContent();
  }
};

var DefaultSettingsEditorModel = class extends AbstractSettingsModel {
  constructor(_uri, reference, defaultSettings) {
    super();
    this._uri = _uri;
    this.defaultSettings = defaultSettings;
    this._onDidChangeGroups = this._register(new Emitter());
    this.onDidChangeGroups = this._onDidChangeGroups.event;
    this._register(defaultSettings.onDidChange(() => this._onDidChangeGroups.fire()));
    this._model = reference.object.textEditorModel;
    this._register(this.onWillDispose(() => reference.dispose()));
  }
  get uri() {
    return this._uri;
  }
  get target() {
    return this.defaultSettings.target;
  }
  get settingsGroups() {
    return this.defaultSettings.getSettingsGroups();
  }
  get filterGroups() {
    return this.settingsGroups.slice(1);
  }
  update() {
    if (this._model.isDisposed()) {
      return void 0;
    }
    const resultGroups = [...this._currentResultGroups.values()].sort((a, b) => a.order - b.order);
    const nonEmptyResultGroups = resultGroups.filter((group2) => group2.result.filterMatches.length);
    const startLine = this.settingsGroups.at(-1).range.endLineNumber + 2;
    const { settingsGroups: filteredGroups, matches: matches2 } = this.writeResultGroups(nonEmptyResultGroups, startLine);
    return resultGroups.length ? {
      allGroups: this.settingsGroups,
      filteredGroups,
      matches: matches2
    } : void 0;
  }
  /**
   * Translate the ISearchResultGroups to text, and write it to the editor model
   */
  writeResultGroups(groups, startLine) {
    const contentBuilderOffset = startLine - 1;
    const builder = new SettingsContentBuilder(contentBuilderOffset);
    const settingsGroups = [];
    const matches2 = [];
    if (groups.length) {
      builder.pushLine(",");
      groups.forEach((resultGroup) => {
        const settingsGroup = this.getGroup(resultGroup);
        settingsGroups.push(settingsGroup);
        matches2.push(...this.writeSettingsGroupToBuilder(builder, settingsGroup, resultGroup.result.filterMatches));
      });
    }
    const groupContent = builder.getContent() + "\n";
    const groupEndLine = this._model.getLineCount();
    const cursorPosition = new Selection(startLine, 1, startLine, 1);
    const edit3 = {
      text: groupContent,
      forceMoveMarkers: true,
      range: new Range2(startLine, 1, groupEndLine, 1)
    };
    this._model.pushEditOperations([cursorPosition], [edit3], () => [cursorPosition]);
    const tokenizeTo = Math.min(startLine + 60, this._model.getLineCount());
    this._model.tokenization.forceTokenization(tokenizeTo);
    return { matches: matches2, settingsGroups };
  }
  writeSettingsGroupToBuilder(builder, settingsGroup, filterMatches) {
    filterMatches = filterMatches.map((filteredMatch) => {
      return {
        setting: filteredMatch.setting,
        score: filteredMatch.score,
        matchType: filteredMatch.matchType,
        keyMatchScore: filteredMatch.keyMatchScore,
        matches: filteredMatch.matches && filteredMatch.matches.map((match2) => {
          return new Range2(
            match2.startLineNumber - filteredMatch.setting.range.startLineNumber,
            match2.startColumn,
            match2.endLineNumber - filteredMatch.setting.range.startLineNumber,
            match2.endColumn
          );
        })
      };
    });
    builder.pushGroup(settingsGroup);
    const fixedMatches = filterMatches.map((m) => m.matches || []).flatMap((settingMatches2, i2) => {
      const setting = settingsGroup.sections[0].settings[i2];
      return settingMatches2.map((range2) => {
        return new Range2(
          range2.startLineNumber + setting.range.startLineNumber,
          range2.startColumn,
          range2.endLineNumber + setting.range.startLineNumber,
          range2.endColumn
        );
      });
    });
    return fixedMatches;
  }
  copySetting(setting) {
    return {
      description: setting.description,
      scope: setting.scope,
      type: setting.type,
      enum: setting.enum,
      enumDescriptions: setting.enumDescriptions,
      key: setting.key,
      value: setting.value,
      range: setting.range,
      overrides: [],
      overrideOf: setting.overrideOf,
      tags: setting.tags,
      deprecationMessage: setting.deprecationMessage,
      keyRange: nullRange,
      valueRange: nullRange,
      descriptionIsMarkdown: void 0,
      descriptionRanges: []
    };
  }
  getPreference(key3) {
    for (const group2 of this.settingsGroups) {
      for (const section of group2.sections) {
        for (const setting of section.settings) {
          if (setting.key === key3) {
            return setting;
          }
        }
      }
    }
    return void 0;
  }
  getGroup(resultGroup) {
    return {
      id: resultGroup.id,
      range: nullRange,
      title: resultGroup.label,
      titleRange: nullRange,
      sections: [
        {
          settings: resultGroup.result.filterMatches.map((m) => this.copySetting(m.setting))
        }
      ]
    };
  }
};

var SettingsContentBuilder = class {
  constructor(_rangeOffset = 0) {
    this._rangeOffset = _rangeOffset;
    this._contentByLines = [];
  }
  get lineCountWithOffset() {
    return this._contentByLines.length + this._rangeOffset;
  }
  get lastLine() {
    return this._contentByLines[this._contentByLines.length - 1] || "";
  }
  pushLine(...lineText) {
    this._contentByLines.push(...lineText);
  }
  pushGroup(settingsGroups, isFirst, isLast) {
    this._contentByLines.push(isFirst ? "[{" : "{");
    const lastSetting = this._pushGroup(settingsGroups, "  ");
    if (lastSetting) {
      const lineIdx = lastSetting.range.endLineNumber - this._rangeOffset;
      const content2 = this._contentByLines[lineIdx - 2];
      this._contentByLines[lineIdx - 2] = content2.substring(0, content2.length - 1);
    }
    this._contentByLines.push(isLast ? "}]" : "},");
  }
  _pushGroup(group2, indent) {
    let lastSetting = null;
    const groupStart = this.lineCountWithOffset + 1;
    for (const section of group2.sections) {
      if (section.title) {
        this.addDescription([section.title], indent, this._contentByLines);
      }
      if (section.settings.length) {
        for (const setting of section.settings) {
          this.pushSetting(setting, indent);
          lastSetting = setting;
        }
      }
    }
    group2.range = { startLineNumber: groupStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
    return lastSetting;
  }
  getContent() {
    return this._contentByLines.join("\n");
  }
  pushSetting(setting, indent) {
    const settingStart = this.lineCountWithOffset + 1;
    this.pushSettingDescription(setting, indent);
    let preValueContent = indent;
    const keyString = JSON.stringify(setting.key);
    preValueContent += keyString;
    setting.keyRange = { startLineNumber: this.lineCountWithOffset + 1, startColumn: preValueContent.indexOf(setting.key) + 1, endLineNumber: this.lineCountWithOffset + 1, endColumn: setting.key.length };
    preValueContent += ": ";
    const valueStart = this.lineCountWithOffset + 1;
    this.pushValue(setting, preValueContent, indent);
    setting.valueRange = { startLineNumber: valueStart, startColumn: preValueContent.length + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length + 1 };
    this._contentByLines[this._contentByLines.length - 1] += ",";
    this._contentByLines.push("");
    setting.range = { startLineNumber: settingStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
  }
  pushSettingDescription(setting, indent) {
    setting.descriptionRanges = [];
    const descriptionPreValue = indent + "// ";
    const deprecationMessageLines = setting.deprecationMessage?.split(/\n/g) ?? [];
    for (let line of [...deprecationMessageLines, ...setting.description]) {
      line = fixSettingLinks(line);
      this._contentByLines.push(descriptionPreValue + line);
      setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
    }
    if (setting.enum && setting.enumDescriptions?.some((desc) => !!desc)) {
      setting.enumDescriptions.forEach((desc, i2) => {
        const displayEnum = escapeInvisibleChars(String(setting.enum[i2]));
        const line = desc ? `${displayEnum}: ${fixSettingLinks(desc)}` : displayEnum;
        const lines = line.split(/\n/g);
        lines[0] = " - " + lines[0];
        this._contentByLines.push(...lines.map((l) => `${indent}// ${l}`));
        setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
      });
    }
  }
  pushValue(setting, preValueConent, indent) {
    const valueString = JSON.stringify(setting.value, null, indent);
    if (valueString && typeof setting.value === "object") {
      if (setting.overrides && setting.overrides.length) {
        this._contentByLines.push(preValueConent + " {");
        for (const subSetting of setting.overrides) {
          this.pushSetting(subSetting, indent + indent);
          this._contentByLines.pop();
        }
        const lastSetting = setting.overrides[setting.overrides.length - 1];
        const content2 = this._contentByLines[lastSetting.range.endLineNumber - 2];
        this._contentByLines[lastSetting.range.endLineNumber - 2] = content2.substring(0, content2.length - 1);
        this._contentByLines.push(indent + "}");
      } else {
        const mulitLineValue = valueString.split("\n");
        this._contentByLines.push(preValueConent + mulitLineValue[0]);
        for (let i2 = 1; i2 < mulitLineValue.length; i2++) {
          this._contentByLines.push(indent + mulitLineValue[i2]);
        }
      }
    } else {
      this._contentByLines.push(preValueConent + valueString);
    }
  }
  addDescription(description, indent, result) {
    for (const line of description) {
      result.push(indent + "// " + line);
    }
  }
};

var RawSettingsContentBuilder = class extends SettingsContentBuilder {
  constructor(indent = "	") {
    super(0);
    this.indent = indent;
  }
  pushGroup(settingsGroups) {
    this._pushGroup(settingsGroups, this.indent);
  }
};

var DefaultRawSettingsEditorModel = class extends Disposable {
  constructor(defaultSettings) {
    super();
    this.defaultSettings = defaultSettings;
    this._content = null;
    this._onDidContentChanged = this._register(new Emitter());
    this.onDidContentChanged = this._onDidContentChanged.event;
    this._register(defaultSettings.onDidChange(() => {
      this._content = null;
      this._onDidContentChanged.fire();
    }));
  }
  get content() {
    if (this._content === null) {
      const builder = new RawSettingsContentBuilder();
      builder.pushLine("{");
      for (const settingsGroup of this.defaultSettings.getRegisteredGroups()) {
        builder.pushGroup(settingsGroup);
      }
      builder.pushLine("}");
      this._content = builder.getContent();
    }
    return this._content;
  }
};

function escapeInvisibleChars(enumValue) {
  return enumValue && enumValue.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function defaultKeybindingsContents(keybindingService) {
  const defaultsHeader = "// " + localize(23292, null);
  return defaultsHeader + "\n" + keybindingService.getDefaultKeybindingsContent();
}

var DefaultKeybindingsEditorModel = class {
  constructor(_uri, keybindingService) {
    this._uri = _uri;
    this.keybindingService = keybindingService;
  }
  get uri() {
    return this._uri;
  }
  get content() {
    if (!this._content) {
      this._content = defaultKeybindingsContents(this.keybindingService);
    }
    return this._content;
  }
  getPreference() {
    return null;
  }
  dispose() {
  }
};

DefaultKeybindingsEditorModel = __decorateClass([
  __decorateParam(1, IKeybindingService)
], DefaultKeybindingsEditorModel);
export { isNullRange, fixSettingLinks, parse10, escapeInvisibleChars, defaultKeybindingsContents, nullRange, AbstractSettingsModel, SettingsEditorModel, Settings2EditorModel, WorkspaceConfigurationEditorModel, DefaultSettings, DefaultSettingsEditorModel, SettingsContentBuilder, RawSettingsContentBuilder, DefaultRawSettingsEditorModel, DefaultKeybindingsEditorModel };
