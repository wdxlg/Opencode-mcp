// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsTreeModels.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { AGENTS_WINDOW_SETTING_TAG, ENABLE_EXTENSION_TOGGLE_SETTINGS, ENABLE_LANGUAGE_FILTER, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, compareTwoNullableNumbers, wordifyKey } from "./module-1807.mjs";
import { URI } from "./module-0032.mjs";
import { APPLICATION_SCOPES, FOLDER_SCOPES, IWorkbenchConfigurationService, LOCAL_MACHINE_SCOPES, REMOTE_MACHINE_SCOPES, WORKSPACE_SCOPES } from "./module-1198.mjs";
import { USER_LOCAL_AND_REMOTE_SETTINGS } from "./module-0947.mjs";
import { tocData } from "./module-1823.mjs";
import { escapeRegExpCharacters, isFalsyOrWhitespace } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IProductService } from "./module-0875.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { getLanguageTagSettingPlainKey } from "./module-0132.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsTreeModels.ts
var SettingsTreeElement = class extends Disposable {
  constructor(_id) {
    super();
    this._tabbable = false;
    this._onDidChangeTabbable = this._register(new Emitter());
    this.id = _id;
  }
  get onDidChangeTabbable() {
    return this._onDidChangeTabbable.event;
  }
  get tabbable() {
    return this._tabbable;
  }
  set tabbable(value2) {
    this._tabbable = value2;
    this._onDidChangeTabbable.fire();
  }
};

var SettingsTreeGroupElement = class extends SettingsTreeElement {
  constructor(_id, count2, label3, level, isFirstGroup) {
    super(_id);
    this._childSettingKeys = /* @__PURE__ */ new Set();
    this._children = [];
    this.count = count2;
    this.label = label3;
    this.level = level;
    this.isFirstGroup = isFirstGroup;
  }
  get children() {
    return this._children;
  }
  set children(newChildren) {
    this._children = newChildren;
    this._childSettingKeys = /* @__PURE__ */ new Set();
    this._children.forEach((child) => {
      if (child instanceof SettingsTreeSettingElement) {
        this._childSettingKeys.add(child.setting.key);
      }
    });
  }
  /**
   * Returns whether this group contains the given child key (to a depth of 1 only)
   */
  containsSetting(key3) {
    return this._childSettingKeys.has(key3);
  }
};

var SettingsTreeNewExtensionsElement = class extends SettingsTreeElement {
  constructor(_id, extensionIds) {
    super(_id);
    this.extensionIds = extensionIds;
  }
};

var SettingsTreeSettingElement = class _SettingsTreeSettingElement extends SettingsTreeElement {
  constructor(setting, parent, settingsTarget, isWorkspaceTrusted, languageFilter, languageService, productService, userDataProfileService, configurationService, isSessionsWindow) {
    super(sanitizeId(parent.id + "_" + setting.key));
    this.settingsTarget = settingsTarget;
    this.isWorkspaceTrusted = isWorkspaceTrusted;
    this.languageFilter = languageFilter;
    this.languageService = languageService;
    this.productService = productService;
    this.userDataProfileService = userDataProfileService;
    this.configurationService = configurationService;
    this.isSessionsWindow = isSessionsWindow;
    this._displayCategory = null;
    this._displayLabel = null;
    /**
     * Whether the setting is configured in the selected scope.
     */
    this.isConfigured = false;
    /**
     * Whether the setting requires trusted target
     */
    this.isUntrusted = false;
    /**
     * Whether the setting is under a policy that blocks all changes.
     */
    this.hasPolicyValue = false;
    /**
     * Whether the setting is read-only in the Agents window.
     */
    this.isAgentsWindowReadOnly = false;
    this.overriddenScopeList = [];
    this.overriddenDefaultsLanguageList = [];
    /**
     * For each language that contributes setting values or default overrides, we can see those values here.
     */
    this.languageOverrideValues = /* @__PURE__ */ new Map();
    this.setting = setting;
    this.parent = parent;
    this.initSettingDescription();
    this.initSettingValueType();
  }
  static {
    this.MAX_DESC_LINES = 20;
  }
  get displayCategory() {
    if (!this._displayCategory) {
      this.initLabels();
    }
    return this._displayCategory;
  }
  get displayLabel() {
    if (!this._displayLabel) {
      this.initLabels();
    }
    return this._displayLabel;
  }
  initLabels() {
    if (this.setting.title) {
      this._displayLabel = this.setting.title;
      this._displayCategory = this.setting.categoryLabel ?? null;
      return;
    }
    const displayKeyFormat = settingKeyToDisplayFormat(this.setting.key, this.parent.id, this.setting.isLanguageTagSetting);
    this._displayLabel = displayKeyFormat.label;
    this._displayCategory = displayKeyFormat.category;
  }
  initSettingDescription() {
    if (this.setting.description.length > _SettingsTreeSettingElement.MAX_DESC_LINES) {
      const truncatedDescLines = this.setting.description.slice(0, _SettingsTreeSettingElement.MAX_DESC_LINES);
      truncatedDescLines.push("[...]");
      this.description = truncatedDescLines.join("\n");
    } else {
      this.description = this.setting.description.join("\n");
    }
  }
  initSettingValueType() {
    if (isExtensionToggleSetting(this.setting, this.productService)) {
      this.valueType = "extension-toggle" /* ExtensionToggle */;
    } else if (this.setting.enum && (!this.setting.type || settingTypeEnumRenderable(this.setting.type))) {
      this.valueType = "enum" /* Enum */;
    } else if (this.setting.type === "string") {
      if (this.setting.editPresentation === "multilineText" /* Multiline */) {
        this.valueType = "multiline-string" /* MultilineString */;
      } else {
        this.valueType = "string" /* String */;
      }
    } else if (isExcludeSetting(this.setting)) {
      this.valueType = "exclude" /* Exclude */;
    } else if (isIncludeSetting(this.setting)) {
      this.valueType = "include" /* Include */;
    } else if (this.setting.type === "integer") {
      this.valueType = "integer" /* Integer */;
    } else if (this.setting.type === "number") {
      this.valueType = "number" /* Number */;
    } else if (this.setting.type === "boolean") {
      this.valueType = "boolean" /* Boolean */;
    } else if (this.setting.type === "array" && this.setting.arrayItemType && ["string", "enum", "number", "integer"].includes(this.setting.arrayItemType)) {
      this.valueType = "array" /* Array */;
    } else if (Array.isArray(this.setting.type) && this.setting.type.includes("null" /* Null */) && this.setting.type.length === 2) {
      if (this.setting.type.includes("integer" /* Integer */)) {
        this.valueType = "nullable-integer" /* NullableInteger */;
      } else if (this.setting.type.includes("number" /* Number */)) {
        this.valueType = "nullable-number" /* NullableNumber */;
      } else {
        this.valueType = "complex" /* Complex */;
      }
    } else {
      const schemaType = getObjectSettingSchemaType(this.setting);
      if (schemaType) {
        if (this.setting.allKeysAreBoolean) {
          this.valueType = "boolean-object" /* BooleanObject */;
        } else if (schemaType === "simple") {
          this.valueType = "object" /* Object */;
        } else {
          this.valueType = "complex-object" /* ComplexObject */;
        }
      } else if (this.setting.isLanguageTagSetting) {
        this.valueType = "language-tag" /* LanguageTag */;
      } else {
        this.valueType = "complex" /* Complex */;
      }
    }
  }
  inspectSelf() {
    const targetToInspect = this.getTargetToInspect(this.setting);
    const inspectResult = inspectSetting(this.setting.key, targetToInspect, this.languageFilter, this.configurationService);
    this.update(inspectResult, this.isWorkspaceTrusted);
  }
  getTargetToInspect(setting) {
    if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
      if (setting.scope === 1 /* APPLICATION */) {
        return 1 /* APPLICATION */;
      }
      if (this.configurationService.isSettingAppliedForAllProfiles(setting.key) && this.settingsTarget === 3 /* USER_LOCAL */) {
        return 1 /* APPLICATION */;
      }
    }
    return this.settingsTarget;
  }
  update(inspectResult, isWorkspaceTrusted) {
    let { isConfigured: isConfigured2, inspected, targetSelector, inspectedLanguageOverrides, languageSelector } = inspectResult;
    switch (targetSelector) {
      case "workspaceFolderValue":
      case "workspaceValue":
        this.isUntrusted = !!this.setting.restricted && !isWorkspaceTrusted;
        break;
    }
    let displayValue = isConfigured2 ? inspected[targetSelector] : inspected.defaultValue;
    const overriddenScopeList = [];
    const overriddenDefaultsLanguageList = [];
    if ((languageSelector || targetSelector !== "workspaceValue") && typeof inspected.workspaceValue !== "undefined") {
      overriddenScopeList.push("workspace:");
    }
    if ((languageSelector || targetSelector !== "userRemoteValue") && typeof inspected.userRemoteValue !== "undefined") {
      overriddenScopeList.push("remote:");
    }
    if ((languageSelector || targetSelector !== "userLocalValue") && typeof inspected.userLocalValue !== "undefined") {
      overriddenScopeList.push("user:");
    }
    if (inspected.overrideIdentifiers) {
      for (const overrideIdentifier of inspected.overrideIdentifiers) {
        const inspectedOverride = inspectedLanguageOverrides.get(overrideIdentifier);
        if (inspectedOverride) {
          if (this.languageService.isRegisteredLanguageId(overrideIdentifier)) {
            if (languageSelector !== overrideIdentifier && typeof inspectedOverride.default?.override !== "undefined") {
              overriddenDefaultsLanguageList.push(overrideIdentifier);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "workspaceValue") && typeof inspectedOverride.workspace?.override !== "undefined") {
              overriddenScopeList.push(`workspace:${overrideIdentifier}`);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "userRemoteValue") && typeof inspectedOverride.userRemote?.override !== "undefined") {
              overriddenScopeList.push(`remote:${overrideIdentifier}`);
            }
            if ((languageSelector !== overrideIdentifier || targetSelector !== "userLocalValue") && typeof inspectedOverride.userLocal?.override !== "undefined") {
              overriddenScopeList.push(`user:${overrideIdentifier}`);
            }
          }
          this.languageOverrideValues.set(overrideIdentifier, inspectedOverride);
        }
      }
    }
    this.overriddenScopeList = overriddenScopeList;
    this.overriddenDefaultsLanguageList = overriddenDefaultsLanguageList;
    this.defaultValueSource = this.setting.nonLanguageSpecificDefaultValueSource;
    if (inspected.policyValue !== void 0) {
      this.hasPolicyValue = true;
      isConfigured2 = false;
      displayValue = inspected.policyValue;
      this.scopeValue = inspected.policyValue;
      this.defaultValue = inspected.defaultValue;
    } else if (languageSelector && this.languageOverrideValues.has(languageSelector)) {
      const overrideValues = this.languageOverrideValues.get(languageSelector);
      displayValue = (isConfigured2 ? overrideValues[targetSelector] : overrideValues.defaultValue) ?? displayValue;
      this.scopeValue = isConfigured2 && overrideValues[targetSelector];
      this.defaultValue = overrideValues.defaultValue ?? inspected.defaultValue;
      const registryValues = Registry.as(Extensions4.Configuration).getConfigurationDefaultsOverrides();
      const source = registryValues.get(`[${languageSelector}]`)?.source;
      const overrideValueSource = source instanceof Map ? source.get(this.setting.key) : void 0;
      if (overrideValueSource) {
        this.defaultValueSource = overrideValueSource;
      }
    } else {
      this.scopeValue = isConfigured2 && inspected[targetSelector];
      this.defaultValue = inspected.defaultValue;
    }
    let hasAgentsWindowOverride = false;
    if (this.isSessionsWindow) {
      const property = Registry.as(Extensions4.Configuration).getConfigurationProperties()[this.setting.key];
      hasAgentsWindowOverride = !!property?.agentsWindow;
      this.isAgentsWindowReadOnly = !!property?.agentsWindow?.readOnly;
      if (this.isAgentsWindowReadOnly) {
        isConfigured2 = false;
      }
    }
    this.value = displayValue;
    this.isConfigured = isConfigured2;
    if (isConfigured2 || this.setting.tags || this.tags || this.setting.restricted || this.hasPolicyValue || hasAgentsWindowOverride) {
      this.tags = /* @__PURE__ */ new Set();
      if (isConfigured2) {
        this.tags.add(MODIFIED_SETTING_TAG);
      }
      this.setting.tags?.forEach((tag2) => this.tags.add(tag2));
      if (this.setting.restricted) {
        this.tags.add(REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG);
      }
      if (this.hasPolicyValue) {
        this.tags.add(POLICY_SETTING_TAG);
      }
      if (hasAgentsWindowOverride) {
        this.tags.add(AGENTS_WINDOW_SETTING_TAG);
      }
    }
  }
  matchesAllTags(tagFilters) {
    if (!tagFilters?.size) {
      return true;
    }
    if (!this.tags) {
      this.inspectSelf();
    }
    if (tagFilters.has("stable")) {
      if (this.tags?.has("preview") || this.tags?.has("experimental")) {
        return false;
      }
      const otherFilters = new Set(Array.from(tagFilters).filter((tag2) => tag2 !== "stable"));
      if (otherFilters.size === 0) {
        return true;
      }
      return !!this.tags?.size && Array.from(otherFilters).every((tag2) => this.tags.has(tag2));
    }
    return !!this.tags?.size && Array.from(tagFilters).every((tag2) => this.tags.has(tag2));
  }
  matchesScope(scope, isRemote) {
    const configTarget = URI.isUri(scope) ? 6 /* WORKSPACE_FOLDER */ : scope;
    if (!this.setting.scope) {
      return true;
    }
    if (configTarget === 1 /* APPLICATION */) {
      return APPLICATION_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === 6 /* WORKSPACE_FOLDER */) {
      return FOLDER_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === 5 /* WORKSPACE */) {
      return WORKSPACE_SCOPES.includes(this.setting.scope);
    }
    if (configTarget === 4 /* USER_REMOTE */) {
      return REMOTE_MACHINE_SCOPES.includes(this.setting.scope) || USER_LOCAL_AND_REMOTE_SETTINGS.includes(this.setting.key);
    }
    if (configTarget === 3 /* USER_LOCAL */) {
      if (isRemote) {
        return LOCAL_MACHINE_SCOPES.includes(this.setting.scope) || USER_LOCAL_AND_REMOTE_SETTINGS.includes(this.setting.key);
      }
    }
    return true;
  }
  matchesAnyExtension(extensionFilters) {
    if (!extensionFilters || !extensionFilters.size) {
      return true;
    }
    if (!this.setting.extensionInfo) {
      return false;
    }
    return Array.from(extensionFilters).some((extensionId) => extensionId.toLowerCase() === this.setting.extensionInfo.id.toLowerCase());
  }
  matchesAnyFeature(featureFilters) {
    if (!featureFilters || !featureFilters.size) {
      return true;
    }
    if (this.setting.extensionInfo) {
      return false;
    }
    if (featureFilters.has("chat")) {
      const chatFeatures = tocData.children.find((child) => child.id === "chat");
      if (chatFeatures?.children) {
        const patterns = chatFeatures.children.flatMap((feature) => feature.settings ?? []).map((setting) => createSettingMatchRegExp(setting));
        if (patterns.some((pattern) => pattern.test(this.setting.key))) {
          return true;
        }
      }
    }
    const features = tocData.children.find((child) => child.id === "features");
    return Array.from(featureFilters).some((filter2) => {
      if (features?.children) {
        const feature = features.children.find((feature2) => "features/" + filter2 === feature2.id);
        if (feature?.settings) {
          const patterns = feature.settings.map((setting) => createSettingMatchRegExp(setting));
          return patterns.some((pattern) => pattern.test(this.setting.key));
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  }
  matchesAnyId(idFilters) {
    if (!idFilters || !idFilters.size) {
      return true;
    }
    if (idFilters.has(this.setting.key)) {
      return true;
    }
    for (const filter2 of idFilters) {
      if (filter2.endsWith("*")) {
        const prefix = filter2.slice(0, -1);
        if (this.setting.key.startsWith(prefix)) {
          return true;
        }
      }
    }
    return false;
  }
  matchesAllLanguages(languageFilter) {
    if (!languageFilter) {
      return true;
    }
    if (!this.languageService.isRegisteredLanguageId(languageFilter)) {
      return false;
    }
    if (this.setting.scope === 6 /* LANGUAGE_OVERRIDABLE */) {
      return true;
    }
    return false;
  }
};

function createSettingMatchRegExp(pattern) {
  pattern = escapeRegExpCharacters(pattern).replace(/\\\*/g, ".*");
  return new RegExp(`^${pattern}$`, "i");
}

var SettingsTreeModel = class {
  constructor(_viewState, _isWorkspaceTrusted, _configurationService, _languageService, _userDataProfileService, _productService, _environmentService) {
    this._viewState = _viewState;
    this._isWorkspaceTrusted = _isWorkspaceTrusted;
    this._configurationService = _configurationService;
    this._languageService = _languageService;
    this._userDataProfileService = _userDataProfileService;
    this._productService = _productService;
    this._environmentService = _environmentService;
    this._treeElementsBySettingName = /* @__PURE__ */ new Map();
  }
  get root() {
    return this._root;
  }
  update(newTocRoot = this._tocRoot) {
    this._treeElementsBySettingName.clear();
    const newRoot = this.createSettingsTreeGroupElement(newTocRoot);
    if (newRoot.children[0] instanceof SettingsTreeGroupElement) {
      newRoot.children[0].isFirstGroup = true;
    }
    if (this._root) {
      this.disposeChildren(this._root.children);
      this._root.children = newRoot.children;
      newRoot.dispose();
    } else {
      this._root = newRoot;
    }
  }
  updateWorkspaceTrust(workspaceTrusted) {
    this._isWorkspaceTrusted = workspaceTrusted;
    this.updateRequireTrustedTargetElements();
  }
  disposeChildren(children) {
    for (const child of children) {
      this.disposeChildAndRecurse(child);
    }
  }
  disposeChildAndRecurse(element) {
    if (element instanceof SettingsTreeGroupElement) {
      this.disposeChildren(element.children);
    }
    element.dispose();
  }
  getElementsByName(name) {
    return this._treeElementsBySettingName.get(name) ?? null;
  }
  updateElementsByName(name) {
    if (!this._treeElementsBySettingName.has(name)) {
      return;
    }
    this.reinspectSettings(this._treeElementsBySettingName.get(name));
  }
  updateRequireTrustedTargetElements() {
    this.reinspectSettings([...this._treeElementsBySettingName.values()].flat().filter((s) => s.isUntrusted));
  }
  reinspectSettings(settings) {
    for (const element of settings) {
      element.inspectSelf();
    }
  }
  createSettingsTreeGroupElement(tocEntry, parent) {
    const depth = parent ? this.getDepth(parent) + 1 : 0;
    const element = new SettingsTreeGroupElement(tocEntry.id, void 0, tocEntry.label, depth, false);
    element.parent = parent;
    const children = [];
    if (tocEntry.settings) {
      const settingChildren = tocEntry.settings.map((s) => this.createSettingsTreeSettingElement(s, element));
      for (const child of settingChildren) {
        if (!child.setting.deprecationMessage) {
          children.push(child);
        } else {
          child.inspectSelf();
          if (child.isConfigured) {
            children.push(child);
          } else {
            child.dispose();
          }
        }
      }
    }
    if (tocEntry.children) {
      const groupChildren2 = tocEntry.children.map((child) => this.createSettingsTreeGroupElement(child, element));
      children.push(...groupChildren2);
    }
    element.children = children;
    return element;
  }
  getDepth(element) {
    if (element.parent) {
      return 1 + this.getDepth(element.parent);
    } else {
      return 0;
    }
  }
  createSettingsTreeSettingElement(setting, parent) {
    const element = new SettingsTreeSettingElement(
      setting,
      parent,
      this._viewState.settingsTarget,
      this._isWorkspaceTrusted,
      this._viewState.languageFilter,
      this._languageService,
      this._productService,
      this._userDataProfileService,
      this._configurationService,
      this._environmentService.isSessionsWindow
    );
    const nameElements = this._treeElementsBySettingName.get(setting.key) ?? [];
    nameElements.push(element);
    this._treeElementsBySettingName.set(setting.key, nameElements);
    return element;
  }
  dispose() {
    this._treeElementsBySettingName.clear();
    this.disposeChildAndRecurse(this._root);
  }
};

SettingsTreeModel = __decorateClass([
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IUserDataProfileService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IWorkbenchEnvironmentService)
], SettingsTreeModel);

function inspectSetting(key3, target, languageFilter, configurationService) {
  const inspectOverrides = URI.isUri(target) ? { resource: target } : void 0;
  const inspected = configurationService.inspect(key3, inspectOverrides);
  const targetSelector = target === 1 /* APPLICATION */ ? "applicationValue" : target === 3 /* USER_LOCAL */ ? "userLocalValue" : target === 4 /* USER_REMOTE */ ? "userRemoteValue" : target === 5 /* WORKSPACE */ ? "workspaceValue" : "workspaceFolderValue";
  const targetOverrideSelector = target === 1 /* APPLICATION */ ? "application" : target === 3 /* USER_LOCAL */ ? "userLocal" : target === 4 /* USER_REMOTE */ ? "userRemote" : target === 5 /* WORKSPACE */ ? "workspace" : "workspaceFolder";
  let isConfigured2 = typeof inspected[targetSelector] !== "undefined";
  const overrideIdentifiers = inspected.overrideIdentifiers;
  const inspectedLanguageOverrides = /* @__PURE__ */ new Map();
  if (languageFilter) {
    isConfigured2 = false;
  }
  if (overrideIdentifiers) {
    for (const overrideIdentifier of overrideIdentifiers) {
      inspectedLanguageOverrides.set(overrideIdentifier, configurationService.inspect(key3, { overrideIdentifier }));
    }
    if (languageFilter) {
      if (inspectedLanguageOverrides.has(languageFilter)) {
        const overrideValue = inspectedLanguageOverrides.get(languageFilter)[targetOverrideSelector]?.override;
        if (typeof overrideValue !== "undefined") {
          isConfigured2 = true;
        }
      }
    }
  }
  return { isConfigured: isConfigured2, inspected, targetSelector, inspectedLanguageOverrides, languageSelector: languageFilter };
}

function sanitizeId(id2) {
  return id2.replace(/[\.\/]/g, "_");
}

function settingKeyToDisplayFormat(key3, groupId = "", isLanguageTagSetting = false) {
  const lastDotIdx = key3.lastIndexOf(".");
  let category9 = "";
  if (lastDotIdx >= 0) {
    category9 = key3.substring(0, lastDotIdx);
    key3 = key3.substring(lastDotIdx + 1);
  }
  groupId = groupId.replace(/\//g, ".");
  category9 = trimCategoryForGroup(category9, groupId);
  category9 = wordifyKey(category9);
  if (isLanguageTagSetting) {
    key3 = getLanguageTagSettingPlainKey(key3);
    key3 = "$(bracket) " + key3;
  }
  const label3 = wordifyKey(key3);
  return { category: category9, label: label3 };
}

function trimCategoryForGroup(category9, groupId) {
  const doTrim = (forward) => {
    if (!/insiders$/i.test(category9)) {
      groupId = groupId.replace(/-?insiders$/i, "");
    }
    const parts = groupId.split(".").map((part) => {
      if (part.replace(/-/g, "").toLowerCase() === category9.toLowerCase()) {
        return part.replace(/-/g, "");
      } else {
        return part;
      }
    });
    while (parts.length) {
      const reg2 = new RegExp(`^${parts.join("\\.")}(\\.|$)`, "i");
      if (reg2.test(category9)) {
        return category9.replace(reg2, "");
      }
      if (forward) {
        parts.pop();
      } else {
        parts.shift();
      }
    }
    return null;
  };
  let trimmed = doTrim(true);
  if (trimmed === null) {
    trimmed = doTrim(false);
  }
  if (trimmed === null) {
    trimmed = category9;
  }
  return trimmed;
}

function isExtensionToggleSetting(setting, productService) {
  return ENABLE_EXTENSION_TOGGLE_SETTINGS && !!productService.extensionRecommendations && !!setting.displayExtensionId;
}

function isExcludeSetting(setting) {
  return setting.key === "files.exclude" || setting.key === "search.exclude" || setting.key === "workbench.localHistory.exclude" || setting.key === "explorer.autoRevealExclude" || setting.key === "files.readonlyExclude" || setting.key === "files.watcherExclude";
}

function isIncludeSetting(setting) {
  return setting.key === "files.readonlyInclude";
}

function objectSettingSupportsRemoveDefaultValue(key3) {
  return key3 === "workbench.editor.customLabels.patterns";
}

function isSimpleType(type) {
  return type === "string" || type === "boolean" || type === "integer" || type === "number";
}

function getObjectRenderableSchemaType(schema10, key3) {
  const { type } = schema10;
  if (Array.isArray(type)) {
    if (objectSettingSupportsRemoveDefaultValue(key3) && type.length === 2) {
      if (type.includes("null") && (type.includes("string") || type.includes("boolean") || type.includes("integer") || type.includes("number"))) {
        return "simple";
      }
    }
    for (const t2 of type) {
      if (!isSimpleType(t2)) {
        return false;
      }
    }
    return "complex";
  }
  if (isSimpleType(type)) {
    return "simple";
  }
  if (type === "array") {
    if (schema10.items) {
      const itemSchemas = Array.isArray(schema10.items) ? schema10.items : [schema10.items];
      for (const { type: type2 } of itemSchemas) {
        if (Array.isArray(type2)) {
          for (const t2 of type2) {
            if (!isSimpleType(t2)) {
              return false;
            }
          }
          return "complex";
        }
        if (!isSimpleType(type2)) {
          return false;
        }
        return "complex";
      }
    }
    return false;
  }
  return false;
}

function getObjectSettingSchemaType({
  key: key3,
  type,
  objectProperties,
  objectPatternProperties,
  objectAdditionalProperties
}) {
  if (type !== "object") {
    return false;
  }
  if (isUndefinedOrNull(objectProperties) && isUndefinedOrNull(objectPatternProperties) && isUndefinedOrNull(objectAdditionalProperties)) {
    return false;
  }
  if ((objectAdditionalProperties === true || objectAdditionalProperties === void 0) && !Object.keys(objectPatternProperties ?? {}).includes(".*")) {
    return false;
  }
  const schemas2 = [...Object.values(objectProperties ?? {}), ...Object.values(objectPatternProperties ?? {})];
  if (objectAdditionalProperties && typeof objectAdditionalProperties === "object") {
    schemas2.push(objectAdditionalProperties);
  }
  let schemaType = "simple";
  for (const schema10 of schemas2) {
    for (const subSchema of Array.isArray(schema10.anyOf) ? schema10.anyOf : [schema10]) {
      const subSchemaType = getObjectRenderableSchemaType(subSchema, key3);
      if (subSchemaType === false) {
        return false;
      }
      if (subSchemaType === "complex") {
        schemaType = "complex";
      }
    }
  }
  return schemaType;
}

function settingTypeEnumRenderable(_type) {
  const enumRenderableSettingTypes = ["string", "boolean", "null", "integer", "number"];
  const type = Array.isArray(_type) ? _type : [_type];
  return type.every((type2) => enumRenderableSettingTypes.includes(type2));
}

var SearchResultModel = class extends SettingsTreeModel {
  constructor(viewState, settingsOrderByTocIndex, isWorkspaceTrusted, configurationService, environmentService, languageService, userDataProfileService, productService) {
    super(viewState, isWorkspaceTrusted, configurationService, languageService, userDataProfileService, productService, environmentService);
    this.environmentService = environmentService;
    this.rawSearchResults = null;
    this.newExtensionSearchResults = null;
    this.searchResultCount = null;
    this.aiFilterEnabled = false;
    this.id = "searchResultModel";
    this.settingsOrderByTocIndex = settingsOrderByTocIndex;
    this.cachedUniqueSearchResults = /* @__PURE__ */ new Map();
    this.update({ id: "searchResultModel", label: "" });
  }
  set showAiResults(show3) {
    this.aiFilterEnabled = show3;
    this.updateChildren();
  }
  sortResults(filterMatches) {
    if (this.settingsOrderByTocIndex) {
      for (const match2 of filterMatches) {
        match2.setting.internalOrder = this.settingsOrderByTocIndex.get(match2.setting.key);
      }
    }
    if (!this._viewState.query) {
      return filterMatches.sort((a, b) => compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder));
    }
    filterMatches.sort((a, b) => {
      if (a.matchType !== b.matchType) {
        return b.matchType - a.matchType;
      } else if (a.matchType & 16 /* NonContiguousWordsInSettingsLabel */ || a.matchType & 32 /* ContiguousWordsInSettingsLabel */) {
        return b.keyMatchScore - a.keyMatchScore || compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder);
      } else if (a.matchType === 2 /* RemoteMatch */) {
        return b.score - a.score;
      } else {
        return compareTwoNullableNumbers(a.setting.internalOrder, b.setting.internalOrder);
      }
    });
    return distinct(filterMatches, (match2) => match2.setting.key);
  }
  getUniqueSearchResults() {
    const cachedResults = this.cachedUniqueSearchResults.get(this.aiFilterEnabled);
    if (cachedResults) {
      return cachedResults;
    }
    if (!this.rawSearchResults) {
      return null;
    }
    let combinedFilterMatches = [];
    if (this.aiFilterEnabled) {
      const aiSelectedKeys = /* @__PURE__ */ new Set();
      const aiSelectedResult = this.rawSearchResults[4 /* AiSelected */];
      if (aiSelectedResult) {
        aiSelectedResult.filterMatches.forEach((m) => aiSelectedKeys.add(m.setting.key));
        combinedFilterMatches = aiSelectedResult.filterMatches;
      }
      const embeddingsResult = this.rawSearchResults[3 /* Embeddings */];
      if (embeddingsResult) {
        embeddingsResult.filterMatches = embeddingsResult.filterMatches.filter((m) => !aiSelectedKeys.has(m.setting.key));
        combinedFilterMatches = combinedFilterMatches.concat(embeddingsResult.filterMatches);
      }
      const result2 = {
        filterMatches: combinedFilterMatches,
        exactMatch: false
      };
      this.cachedUniqueSearchResults.set(true, result2);
      return result2;
    }
    const localMatchKeys = /* @__PURE__ */ new Set();
    const localResult = this.rawSearchResults[0 /* Local */];
    if (localResult) {
      localResult.filterMatches.forEach((m) => localMatchKeys.add(m.setting.key));
      combinedFilterMatches = localResult.filterMatches;
    }
    const remoteResult = this.rawSearchResults[1 /* Remote */];
    if (remoteResult) {
      remoteResult.filterMatches = remoteResult.filterMatches.filter((m) => !localMatchKeys.has(m.setting.key));
      combinedFilterMatches = combinedFilterMatches.concat(remoteResult.filterMatches);
      this.newExtensionSearchResults = this.rawSearchResults[2 /* NewExtensions */];
    }
    combinedFilterMatches = this.sortResults(combinedFilterMatches);
    const result = {
      filterMatches: combinedFilterMatches,
      exactMatch: localResult.exactMatch
      // remote results should never have an exact match
    };
    this.cachedUniqueSearchResults.set(false, result);
    return result;
  }
  getRawResults() {
    return this.rawSearchResults ?? [];
  }
  getUniqueSearchResultSettings() {
    return this.getUniqueSearchResults()?.filterMatches.map((m) => m.setting) ?? [];
  }
  updateChildren() {
    this.update({
      id: "searchResultModel",
      label: "searchResultModel",
      settings: this.getUniqueSearchResultSettings()
    });
    const isRemote = !!this.environmentService.remoteAuthority;
    const newChildren = [];
    for (const child of this.root.children) {
      if (child instanceof SettingsTreeSettingElement && child.matchesAllTags(this._viewState.tagFilters) && child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters) && child.matchesAnyFeature(this._viewState.featureFilters) && child.matchesAllLanguages(this._viewState.languageFilter)) {
        newChildren.push(child);
      } else {
        child.dispose();
      }
    }
    this.root.children = newChildren;
    this.searchResultCount = this.root.children.length;
    if (this.newExtensionSearchResults?.filterMatches.length) {
      let resultExtensionIds = this.newExtensionSearchResults.filterMatches.map((result) => result.setting).filter((setting) => setting.extensionName && setting.extensionPublisher).map((setting) => `${setting.extensionPublisher}.${setting.extensionName}`);
      resultExtensionIds = distinct(resultExtensionIds);
      if (resultExtensionIds.length) {
        const newExtElement = new SettingsTreeNewExtensionsElement("newExtensions", resultExtensionIds);
        newExtElement.parent = this._root;
        this._root.children.push(newExtElement);
      }
    }
  }
  setResult(order, result) {
    this.cachedUniqueSearchResults.clear();
    this.newExtensionSearchResults = null;
    if (this.rawSearchResults && order === 0 /* Local */) {
      delete this.rawSearchResults[1 /* Remote */];
    }
    this.rawSearchResults ??= [];
    if (!result) {
      delete this.rawSearchResults[order];
      return;
    }
    this.rawSearchResults[order] = result;
    this.updateChildren();
  }
  getUniqueResultsCount() {
    return this.searchResultCount ?? 0;
  }
};

SearchResultModel = __decorateClass([
  __decorateParam(3, IWorkbenchConfigurationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ILanguageService),
  __decorateParam(6, IUserDataProfileService),
  __decorateParam(7, IProductService)
], SearchResultModel);

var tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;

var extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;

var featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;

var idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;

var languageRegex = /(^|\s)@lang:("([^"]*)"|[^"]\S*)?/g;

function parseQuery(query) {
  function getTagsForType(query2, filterRegex, parsedParts) {
    return query2.replace(filterRegex, (_, __, quotedParsedElement, unquotedParsedElement) => {
      const parsedElement = unquotedParsedElement || quotedParsedElement;
      if (parsedElement) {
        parsedParts.push(...parsedElement.split(",").map((s) => s.trim()).filter((s) => !isFalsyOrWhitespace(s)));
      }
      return "";
    });
  }
  const tags = [];
  query = query.replace(tagRegex, (_, __, quotedTag, tag2) => {
    tags.push(tag2 || quotedTag);
    return "";
  });
  query = query.replace(`@${MODIFIED_SETTING_TAG}`, () => {
    tags.push(MODIFIED_SETTING_TAG);
    return "";
  });
  query = query.replace(`@${POLICY_SETTING_TAG}`, () => {
    tags.push(POLICY_SETTING_TAG);
    return "";
  });
  query = query.replace(`@${AGENTS_WINDOW_SETTING_TAG}`, () => {
    tags.push(AGENTS_WINDOW_SETTING_TAG);
    return "";
  });
  query = query.replace(/@stable/g, () => {
    tags.push("stable");
    return "";
  });
  const extensions = [];
  const features = [];
  const ids = [];
  const langs = [];
  query = getTagsForType(query, extensionRegex, extensions);
  query = getTagsForType(query, featureRegex, features);
  query = getTagsForType(query, idRegex, ids);
  if (ENABLE_LANGUAGE_FILTER) {
    query = getTagsForType(query, languageRegex, langs);
  }
  query = query.trim();
  return {
    tags,
    extensionFilters: extensions,
    featureFilters: features,
    idFilters: ids,
    languageFilter: langs.length ? langs[0] : void 0,
    query
  };
}
export { createSettingMatchRegExp, inspectSetting, sanitizeId, settingKeyToDisplayFormat, trimCategoryForGroup, isExtensionToggleSetting, isExcludeSetting, isIncludeSetting, objectSettingSupportsRemoveDefaultValue, isSimpleType, getObjectRenderableSchemaType, getObjectSettingSchemaType, settingTypeEnumRenderable, parseQuery, SettingsTreeElement, SettingsTreeGroupElement, SettingsTreeNewExtensionsElement, SettingsTreeSettingElement, SettingsTreeModel, SearchResultModel, tagRegex, extensionRegex, featureRegex, idRegex, languageRegex };
