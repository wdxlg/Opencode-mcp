// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/browser/settingsTree.ts
import { $, EventHelper, EventType, addDisposableListener, addStandardDisposableListener, append, findParentWithClass, trackFocus } from "./module-0075.mjs";
import { isDefined, isUndefinedOrNull } from "./module-0010.mjs";
import { SettingsTreeGroupElement, SettingsTreeNewExtensionsElement, SettingsTreeSettingElement, inspectSetting, objectSettingSupportsRemoveDefaultValue, settingKeyToDisplayFormat } from "./module-1850.mjs";
import { LANGUAGE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU, compareTwoNullableNumbers } from "./module-1831.mjs";
import { localize } from "./module-0001.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { Disposable, DisposableStore, isDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { getIgnoredSettings2 } from "./module-1709.mjs";
import { IUserDataSyncEnablementService, getDefaultIgnoredSettings } from "./module-1696.mjs";
import { SimpleIconLabel } from "./module-1553.mjs";
import { SettingsTreeIndicatorsLabel, getIndicatorsLabelAriaLabel } from "./module-1849.mjs";
import { ToolBar } from "./module-0503.mjs";
import { isIOS } from "./module-0014.mjs";
import { settingsMoreActionIcon } from "./module-1834.mjs";
import { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING, IWorkbenchConfigurationService } from "./module-1198.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService, getLanguageTagSettingPlainKey } from "./module-0132.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { IProductService } from "./module-0873.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, getInputBoxStyle, getListStyles, getSelectBoxStyles } from "./module-0513.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { getInvalidTypeError } from "./module-1649.mjs";
import { ExcludeSettingWidget, IncludeSettingWidget, ListSettingWidget, ObjectSettingCheckboxWidget, ObjectSettingDropdownWidget } from "./module-1851.mjs";
import { settingsNumberInputBackground, settingsNumberInputBorder, settingsNumberInputForeground, settingsSelectBackground, settingsSelectBorder, settingsSelectForeground, settingsSelectListBorder, settingsTextInputBackground, settingsTextInputBorder, settingsTextInputForeground } from "./module-1839.mjs";
import { InputBox } from "./module-0600.mjs";
import { SelectBox } from "./module-0475.mjs";
import { hasNativeContextMenu } from "./module-0515.mjs";
import { BrowserFeatures } from "./module-0020.mjs";
import { Toggle, unthemedToggleStyles } from "./module-0549.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { status } from "./module-0076.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { CachedListVirtualDelegate } from "./module-0454.mjs";
import { ObjectTreeModel } from "./module-0630.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { IListService, WorkbenchObjectTree } from "./module-0636.mjs";
import { DefaultStyleController } from "./module-0460.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { editorBackground } from "./module-0229.mjs";
import { foreground } from "./module-0227.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { URI } from "./module-0032.mjs";
import { SETTINGS_AUTHORITY } from "./module-1294.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/workbench/contrib/preferences/browser/settingsTree.ts
var $27 = $;

var multiGroupTocSettings = /* @__PURE__ */ new Set([
  "accessibility.signals.chatUserActionRequired",
  "accessibility.signals.chatResponseReceived"
]);

function getIncludeExcludeDisplayValue(element) {
  const elementDefaultValue = typeof element.defaultValue === "object" ? element.defaultValue ?? {} : {};
  const data = element.isConfigured ? { ...elementDefaultValue, ...element.scopeValue } : elementDefaultValue;
  return Object.keys(data).filter((key3) => !!data[key3]).map((key3) => {
    const defaultValue = elementDefaultValue[key3];
    let source;
    if (defaultValue === data[key3] && element.setting.type === "object" && element.defaultValueSource instanceof Map) {
      const defaultSource = element.defaultValueSource.get(`${element.setting.key}.${key3}`);
      source = typeof defaultSource === "string" ? defaultSource : defaultSource?.displayName;
    }
    const value2 = data[key3];
    const sibling = typeof value2 === "boolean" ? void 0 : value2.when;
    return {
      value: {
        type: "string",
        data: key3
      },
      sibling,
      elementType: element.valueType,
      source
    };
  });
}

function areAllPropertiesDefined(properties, itemsToDisplay) {
  const staticProperties = new Set(properties);
  itemsToDisplay.forEach(({ key: key3 }) => staticProperties.delete(key3.data));
  return staticProperties.size === 0;
}

function getEnumOptionsFromSchema(schema10) {
  if (schema10.anyOf) {
    return schema10.anyOf.map(getEnumOptionsFromSchema).flat();
  }
  const enumDescriptions = schema10.enumDescriptions ?? [];
  return (schema10.enum ?? []).map((value2, idx) => {
    const description = idx < enumDescriptions.length ? enumDescriptions[idx] : void 0;
    return { value: value2, description };
  });
}

function getObjectValueType(schema10) {
  if (schema10.anyOf) {
    const subTypes = schema10.anyOf.map(getObjectValueType);
    if (subTypes.some((type) => type === "enum")) {
      return "enum";
    }
    return "string";
  }
  if (schema10.type === "boolean") {
    return "boolean";
  } else if (schema10.type === "string" && isDefined(schema10.enum) && schema10.enum.length > 0) {
    return "enum";
  } else {
    return "string";
  }
}

function getObjectEntryValueDisplayValue(type, data, options3) {
  if (type === "boolean") {
    return { type, data: !!data };
  } else if (type === "enum") {
    return { type, data: "" + data, options: options3 };
  } else {
    return { type, data: "" + data };
  }
}

function getObjectDisplayValue(element) {
  const elementDefaultValue = typeof element.defaultValue === "object" ? element.defaultValue ?? {} : {};
  const elementScopeValue = typeof element.scopeValue === "object" ? element.scopeValue ?? {} : {};
  const data = element.isConfigured ? { ...elementDefaultValue, ...elementScopeValue } : element.hasPolicyValue || element.isAgentsWindowReadOnly ? element.scopeValue : elementDefaultValue;
  const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
  const patternsAndSchemas = Object.entries(objectPatternProperties ?? {}).map(([pattern, schema10]) => ({
    pattern: new RegExp(pattern),
    schema: schema10
  }));
  const wellDefinedKeyEnumOptions = Object.entries(objectProperties ?? {}).map(
    ([key3, schema10]) => ({ value: key3, description: schema10.description })
  );
  return Object.keys(data).map((key3) => {
    const defaultValue = elementDefaultValue[key3];
    let source;
    if (defaultValue === data[key3] && element.setting.type === "object" && element.defaultValueSource instanceof Map) {
      const defaultSource = element.defaultValueSource.get(`${element.setting.key}.${key3}`);
      source = typeof defaultSource === "string" ? defaultSource : defaultSource?.displayName;
    }
    if (isDefined(objectProperties) && key3 in objectProperties) {
      const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key3]);
      return {
        key: {
          type: "enum",
          data: key3,
          options: wellDefinedKeyEnumOptions
        },
        value: getObjectEntryValueDisplayValue(getObjectValueType(objectProperties[key3]), data[key3], valueEnumOptions),
        keyDescription: objectProperties[key3].description,
        removable: isUndefinedOrNull(defaultValue),
        resetable: !isUndefinedOrNull(defaultValue),
        source
      };
    }
    const removable = defaultValue === void 0 || objectSettingSupportsRemoveDefaultValue(element.setting.key);
    const resetable = !!defaultValue && defaultValue !== data[key3];
    const schema10 = patternsAndSchemas.find(({ pattern }) => pattern.test(key3))?.schema;
    if (schema10) {
      const valueEnumOptions = getEnumOptionsFromSchema(schema10);
      return {
        key: { type: "string", data: key3 },
        value: getObjectEntryValueDisplayValue(getObjectValueType(schema10), data[key3], valueEnumOptions),
        keyDescription: schema10.description,
        removable,
        resetable,
        source
      };
    }
    const additionalValueEnums = getEnumOptionsFromSchema(
      typeof objectAdditionalProperties === "boolean" ? {} : objectAdditionalProperties ?? {}
    );
    return {
      key: { type: "string", data: key3 },
      value: getObjectEntryValueDisplayValue(
        typeof objectAdditionalProperties === "object" ? getObjectValueType(objectAdditionalProperties) : "string",
        data[key3],
        additionalValueEnums
      ),
      keyDescription: typeof objectAdditionalProperties === "object" ? objectAdditionalProperties.description : void 0,
      removable,
      resetable,
      source
    };
  }).filter((item) => !isUndefinedOrNull(item.value.data));
}

function getBoolObjectDisplayValue(element) {
  const elementDefaultValue = typeof element.defaultValue === "object" ? element.defaultValue ?? {} : {};
  const elementScopeValue = typeof element.scopeValue === "object" ? element.scopeValue ?? {} : {};
  const data = element.isConfigured ? { ...elementDefaultValue, ...elementScopeValue } : elementDefaultValue;
  const { objectProperties } = element.setting;
  const displayValues = [];
  for (const key3 in objectProperties) {
    const defaultValue = elementDefaultValue[key3];
    let source;
    if (defaultValue === data[key3] && element.setting.type === "object" && element.defaultValueSource instanceof Map) {
      const defaultSource = element.defaultValueSource.get(key3);
      source = typeof defaultSource === "string" ? defaultSource : defaultSource?.displayName;
    }
    displayValues.push({
      key: {
        type: "string",
        data: key3
      },
      value: {
        type: "boolean",
        data: !!data[key3]
      },
      keyDescription: objectProperties[key3].description,
      removable: false,
      resetable: true,
      source
    });
  }
  return displayValues;
}

function createArraySuggester(element) {
  return (keys, idx) => {
    const enumOptions = [];
    if (element.setting.enum) {
      element.setting.enum.forEach((key3, i2) => {
        if (!element.setting.uniqueItems || idx !== void 0 && key3 === keys[idx] || !keys.includes(key3)) {
          const description = element.setting.enumDescriptions?.[i2];
          enumOptions.push({ value: key3, description });
        }
      });
    }
    return enumOptions.length > 0 ? { type: "enum", data: enumOptions[0].value, options: enumOptions } : void 0;
  };
}

function createObjectKeySuggester(element) {
  const { objectProperties } = element.setting;
  const allStaticKeys = Object.keys(objectProperties ?? {});
  return (keys) => {
    const existingKeys = new Set(keys);
    const enumOptions = [];
    allStaticKeys.forEach((staticKey) => {
      if (!existingKeys.has(staticKey)) {
        enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
      }
    });
    return enumOptions.length > 0 ? { type: "enum", data: enumOptions[0].value, options: enumOptions } : void 0;
  };
}

function createObjectValueSuggester(element) {
  const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
  const patternsAndSchemas = Object.entries(objectPatternProperties ?? {}).map(([pattern, schema10]) => ({
    pattern: new RegExp(pattern),
    schema: schema10
  }));
  return (key3) => {
    let suggestedSchema;
    if (isDefined(objectProperties) && key3 in objectProperties) {
      suggestedSchema = objectProperties[key3];
    }
    const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key3))?.schema;
    if (isDefined(patternSchema)) {
      suggestedSchema = patternSchema;
    } else if (isDefined(objectAdditionalProperties) && typeof objectAdditionalProperties === "object") {
      suggestedSchema = objectAdditionalProperties;
    }
    if (isDefined(suggestedSchema)) {
      const type = getObjectValueType(suggestedSchema);
      if (type === "boolean") {
        return { type, data: suggestedSchema.default ?? true };
      } else if (type === "enum") {
        const options3 = getEnumOptionsFromSchema(suggestedSchema);
        return { type, data: suggestedSchema.default ?? options3[0].value, options: options3 };
      } else {
        return { type, data: suggestedSchema.default ?? "" };
      }
    }
    return;
  };
}

function isNonNullableNumericType(type) {
  return type === "number" || type === "integer";
}

function parseNumericObjectValues(dataElement, v2) {
  const newRecord = {};
  for (const key3 in v2) {
    let keyMatchesNumericProperty;
    const patternProperties = dataElement.setting.objectPatternProperties;
    const properties = dataElement.setting.objectProperties;
    const additionalProperties = dataElement.setting.objectAdditionalProperties;
    if (properties) {
      for (const propKey in properties) {
        if (propKey === key3) {
          keyMatchesNumericProperty = isNonNullableNumericType(properties[propKey].type);
          break;
        }
      }
    }
    if (keyMatchesNumericProperty === void 0 && patternProperties) {
      for (const patternKey in patternProperties) {
        if (key3.match(patternKey)) {
          keyMatchesNumericProperty = isNonNullableNumericType(patternProperties[patternKey].type);
          break;
        }
      }
    }
    if (keyMatchesNumericProperty === void 0 && additionalProperties && typeof additionalProperties !== "boolean") {
      if (isNonNullableNumericType(additionalProperties.type)) {
        keyMatchesNumericProperty = true;
      }
    }
    newRecord[key3] = keyMatchesNumericProperty ? Number(v2[key3]) : v2[key3];
  }
  return newRecord;
}

function getListDisplayValue(element) {
  if (!element.value || !Array.isArray(element.value)) {
    return [];
  }
  if (element.setting.arrayItemType === "enum") {
    let enumOptions = [];
    if (element.setting.enum) {
      enumOptions = element.setting.enum.map((setting, i2) => {
        return {
          value: setting,
          description: element.setting.enumDescriptions?.[i2]
        };
      });
    }
    return element.value.map((key3) => {
      return {
        value: {
          type: "enum",
          data: key3,
          options: enumOptions
        }
      };
    });
  } else {
    return element.value.map((key3) => {
      return {
        value: {
          type: "string",
          data: key3
        }
      };
    });
  }
}

function getShowAddButtonList(dataElement, listDisplayValue) {
  if (dataElement.setting.enum && dataElement.setting.uniqueItems) {
    return dataElement.setting.enum.length - listDisplayValue.length > 0;
  } else {
    return true;
  }
}

function resolveSettingsTree(tocData2, coreSettingsGroups, filter2, logService) {
  const allSettings2 = getFlatSettings(coreSettingsGroups);
  return {
    tree: _resolveSettingsTree(tocData2, allSettings2, filter2, logService),
    leftoverSettings: allSettings2
  };
}

function resolveConfiguredUntrustedSettings(groups, target, languageFilter, configurationService) {
  const allSettings2 = getFlatSettings(groups);
  return [...allSettings2].filter((setting) => setting.restricted && inspectSetting(setting.key, target, languageFilter, configurationService).isConfigured);
}

async function createTocTreeForExtensionSettings(extensionService, groups, filter2) {
  const extGroupTree = /* @__PURE__ */ new Map();
  const addEntryToTree = (extensionId, extensionName, childEntry) => {
    if (!extGroupTree.has(extensionId)) {
      const rootEntry = {
        id: extensionId,
        label: extensionName,
        children: []
      };
      extGroupTree.set(extensionId, rootEntry);
    }
    extGroupTree.get(extensionId).children.push(childEntry);
  };
  const processGroupEntry = async (group2) => {
    const flatSettings = group2.sections.map((section) => section.settings).flat();
    const settings = filter2 ? getMatchingSettings(new Set(flatSettings), filter2) : flatSettings;
    sortSettings(settings);
    const extensionId = group2.extensionInfo.id;
    const extension = await extensionService.getExtension(extensionId);
    const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
    const settingGroupId = group2.id && group2.id !== extensionId ? group2.id : group2.title;
    const childEntry = {
      id: settingGroupId,
      label: group2.title,
      order: group2.order,
      settings
    };
    addEntryToTree(extensionId, extensionName, childEntry);
  };
  const processPromises = groups.map((g) => processGroupEntry(g));
  return Promise.all(processPromises).then(() => {
    const extGroups = [];
    for (const extensionRootEntry of extGroupTree.values()) {
      if (extensionRootEntry.children.length === 1) {
        extGroups.push({
          id: extensionRootEntry.id,
          label: extensionRootEntry.children[0].label,
          settings: extensionRootEntry.children[0].settings
        });
      } else {
        extensionRootEntry.children.sort((a, b) => {
          return compareTwoNullableNumbers(a.order, b.order);
        });
        const ungroupedChild = extensionRootEntry.children.find((child) => child.label === extensionRootEntry.label);
        if (ungroupedChild && !ungroupedChild.children) {
          const groupedChildren = extensionRootEntry.children.filter((child) => child !== ungroupedChild);
          extGroups.push({
            id: extensionRootEntry.id,
            label: extensionRootEntry.label,
            settings: ungroupedChild.settings,
            children: groupedChildren
          });
        } else {
          extGroups.push(extensionRootEntry);
        }
      }
    }
    extGroups.sort((a, b) => a.label.localeCompare(b.label));
    return {
      id: "extensions",
      label: localize(18333, null),
      children: extGroups
    };
  });
}

function _resolveSettingsTree(tocData2, allSettings2, filter2, logService) {
  let children;
  if (tocData2.children) {
    children = tocData2.children.filter((child) => child.hide !== true).map((child) => _resolveSettingsTree(child, allSettings2, filter2, logService)).filter((child) => child.children?.length || child.settings?.length);
  }
  let settings;
  if (filter2 || tocData2.settings) {
    settings = getMatchingSettings(allSettings2, {
      include: {
        keyPatterns: [...filter2?.include?.keyPatterns ?? [], ...tocData2.settings ?? []],
        tags: filter2?.include?.tags ? [...filter2.include.tags] : []
      },
      exclude: filter2?.exclude ?? {}
    });
    sortSettings(settings);
  }
  if (!children && !settings) {
    throw new Error(`TOC node has no child groups or settings: ${tocData2.id}`);
  }
  return {
    id: tocData2.id,
    label: tocData2.label,
    children,
    settings
  };
}

function sortSettings(settings) {
  const SETTING_STATUS_NORMAL = 0;
  const SETTING_STATUS_PREVIEW = 1;
  const SETTING_STATUS_EXPERIMENTAL = 2;
  const getExperimentalStatus = (setting) => {
    if (setting.tags?.includes("experimental")) {
      return SETTING_STATUS_EXPERIMENTAL;
    } else if (setting.tags?.includes("preview")) {
      return SETTING_STATUS_PREVIEW;
    }
    return SETTING_STATUS_NORMAL;
  };
  settings.sort((a, b) => {
    const experimentalStatusA = getExperimentalStatus(a);
    const experimentalStatusB = getExperimentalStatus(b);
    if (experimentalStatusA !== experimentalStatusB) {
      return experimentalStatusA - experimentalStatusB;
    }
    const orderComparison = compareTwoNullableNumbers(a.order, b.order);
    return orderComparison !== 0 ? orderComparison : a.key.localeCompare(b.key);
  });
}

function getMatchingSettings(allSettings2, filter2) {
  const result = [];
  allSettings2.forEach((setting) => {
    let shouldInclude = false;
    let shouldExclude = false;
    if (filter2.include?.keyPatterns) {
      shouldInclude = filter2.include.keyPatterns.some((pattern) => {
        if (pattern.startsWith("@tag:")) {
          const tagName = pattern.substring(5);
          return setting.tags?.includes(tagName);
        } else {
          return settingMatches(setting, pattern);
        }
      });
    } else {
      shouldInclude = true;
    }
    if (shouldInclude && filter2.include?.tags?.length) {
      shouldInclude = filter2.include.tags.some((tag2) => setting.tags?.includes(tag2));
    }
    if (filter2.exclude?.keyPatterns) {
      shouldExclude = filter2.exclude.keyPatterns.some((pattern) => {
        if (pattern.startsWith("@tag:")) {
          const tagName = pattern.substring(5);
          return setting.tags?.includes(tagName);
        } else {
          return settingMatches(setting, pattern);
        }
      });
    }
    if (!shouldExclude && filter2.exclude?.tags?.length) {
      shouldExclude = filter2.exclude.tags.some((tag2) => setting.tags?.includes(tag2));
    }
    if (shouldInclude && !shouldExclude) {
      result.push(setting);
      if (!multiGroupTocSettings.has(setting.key)) {
        allSettings2.delete(setting);
      }
    }
  });
  return result;
}

var settingPatternCache = /* @__PURE__ */ new Map();

function createSettingMatchRegExp2(pattern) {
  pattern = escapeRegExpCharacters(pattern).replace(/\\\*/g, ".*");
  return new RegExp(`^${pattern}$`, "i");
}

function settingMatches(s, pattern) {
  let regExp = settingPatternCache.get(pattern);
  if (!regExp) {
    regExp = createSettingMatchRegExp2(pattern);
    settingPatternCache.set(pattern, regExp);
  }
  return regExp.test(s.key);
}

function getFlatSettings(settingsGroups) {
  const result = /* @__PURE__ */ new Set();
  for (const group2 of settingsGroups) {
    for (const section of group2.sections) {
      for (const s of section.settings) {
        if (!s.overrides || !s.overrides.length) {
          result.add(s);
        }
      }
    }
  }
  return result;
}

var SETTINGS_TEXT_TEMPLATE_ID = "settings.text.template";

var SETTINGS_MULTILINE_TEXT_TEMPLATE_ID = "settings.multilineText.template";

var SETTINGS_NUMBER_TEMPLATE_ID = "settings.number.template";

var SETTINGS_ENUM_TEMPLATE_ID = "settings.enum.template";

var SETTINGS_BOOL_TEMPLATE_ID = "settings.bool.template";

var SETTINGS_ARRAY_TEMPLATE_ID = "settings.array.template";

var SETTINGS_EXCLUDE_TEMPLATE_ID = "settings.exclude.template";

var SETTINGS_INCLUDE_TEMPLATE_ID = "settings.include.template";

var SETTINGS_OBJECT_TEMPLATE_ID = "settings.object.template";

var SETTINGS_BOOL_OBJECT_TEMPLATE_ID = "settings.boolObject.template";

var SETTINGS_COMPLEX_TEMPLATE_ID = "settings.complex.template";

var SETTINGS_COMPLEX_OBJECT_TEMPLATE_ID = "settings.complexObject.template";

var SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = "settings.newExtensions.template";

var SETTINGS_ELEMENT_TEMPLATE_ID = "settings.group.template";

var SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID = "settings.extensionToggle.template";

function removeChildrenFromTabOrder(node) {
  const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
  focusableElements.forEach((element) => {
    element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, "true");
    element.setAttribute("tabindex", "-1");
  });
}

function addChildrenToTabOrder(node) {
  const focusableElements = node.querySelectorAll(
    `[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`
  );
  focusableElements.forEach((element) => {
    element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
    element.setAttribute("tabindex", "0");
  });
}

var AbstractSettingRenderer = class extends Disposable {
  constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService, _extensionsService, _extensionsWorkbenchService, _productService, _telemetryService, _hoverService, _markdownRendererService) {
    super();
    this.settingActions = settingActions;
    this.disposableActionFactory = disposableActionFactory;
    this._themeService = _themeService;
    this._contextViewService = _contextViewService;
    this._openerService = _openerService;
    this._instantiationService = _instantiationService;
    this._commandService = _commandService;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this._configService = _configService;
    this._extensionsService = _extensionsService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._productService = _productService;
    this._telemetryService = _telemetryService;
    this._hoverService = _hoverService;
    this._markdownRendererService = _markdownRendererService;
    this._onDidClickOverrideElement = this._register(new Emitter());
    this.onDidClickOverrideElement = this._onDidClickOverrideElement.event;
    this._onDidChangeSetting = this._register(new Emitter());
    this.onDidChangeSetting = this._onDidChangeSetting.event;
    this._onDidOpenSettings = this._register(new Emitter());
    this.onDidOpenSettings = this._onDidOpenSettings.event;
    this._onDidClickSettingLink = this._register(new Emitter());
    this.onDidClickSettingLink = this._onDidClickSettingLink.event;
    this._onDidFocusSetting = this._register(new Emitter());
    this.onDidFocusSetting = this._onDidFocusSetting.event;
    this._onDidChangeIgnoredSettings = this._register(new Emitter());
    this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
    this._onDidChangeSettingHeight = this._register(new Emitter());
    this.onDidChangeSettingHeight = this._onDidChangeSettingHeight.event;
    this._onApplyFilter = this._register(new Emitter());
    this.onApplyFilter = this._onApplyFilter.event;
    this.ignoredSettings = getIgnoredSettings2(getDefaultIgnoredSettings(), this._configService);
    this._register(this._configService.onDidChangeConfiguration((e) => {
      this.ignoredSettings = getIgnoredSettings2(getDefaultIgnoredSettings(), this._configService);
      this._onDidChangeIgnoredSettings.fire();
    }));
  }
  static {
    this.CONTROL_CLASS = "setting-control-focus-target";
  }
  static {
    this.CONTROL_SELECTOR = "." + this.CONTROL_CLASS;
  }
  static {
    this.CONTENTS_CLASS = "setting-item-contents";
  }
  static {
    this.CONTENTS_SELECTOR = "." + this.CONTENTS_CLASS;
  }
  static {
    this.ALL_ROWS_SELECTOR = ".monaco-list-row";
  }
  static {
    this.SETTING_KEY_ATTR = "data-key";
  }
  static {
    this.SETTING_ID_ATTR = "data-id";
  }
  static {
    this.ELEMENT_FOCUSABLE_ATTR = "data-focusable";
  }
  renderCommonTemplate(tree, _container, typeClass) {
    _container.classList.add("setting-item");
    _container.classList.add("setting-item-" + typeClass);
    const toDispose = new DisposableStore();
    const container3 = append(_container, $27(AbstractSettingRenderer.CONTENTS_SELECTOR));
    container3.classList.add("settings-row-inner-container");
    const titleElement = append(container3, $27(".setting-item-title"));
    const labelCategoryContainer = append(titleElement, $27(".setting-item-cat-label-container"));
    const categoryElement = append(labelCategoryContainer, $27("span.setting-item-category"));
    const labelElementContainer = append(labelCategoryContainer, $27("span.setting-item-label"));
    const labelElement = toDispose.add(new SimpleIconLabel(labelElementContainer));
    const indicatorsLabel = toDispose.add(this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement));
    const descriptionElement = append(container3, $27(".setting-item-description"));
    const modifiedIndicatorElement = append(container3, $27(".setting-item-modified-indicator"));
    toDispose.add(this._hoverService.setupDelayedHover(modifiedIndicatorElement, {
      content: localize(18334, null)
    }));
    const valueElement = append(container3, $27(".setting-item-value"));
    const controlElement = append(valueElement, $27("div.setting-item-control"));
    const deprecationWarningElement = append(container3, $27(".setting-item-deprecation-message"));
    const toolbarContainer = append(container3, $27(".setting-toolbar-container"));
    const toolbar = toDispose.add(this.renderSettingToolbar(toolbarContainer));
    const template2 = {
      toDispose,
      elementDisposables: toDispose.add(new DisposableStore()),
      containerElement: container3,
      categoryElement,
      labelElement,
      descriptionElement,
      controlElement,
      deprecationWarningElement,
      indicatorsLabel,
      toolbar
    };
    toDispose.add(addDisposableListener(controlElement, EventType.MOUSE_DOWN, (e) => e.stopPropagation()));
    toDispose.add(addDisposableListener(titleElement, EventType.MOUSE_ENTER, (e) => container3.classList.add("mouseover")));
    toDispose.add(addDisposableListener(titleElement, EventType.MOUSE_LEAVE, (e) => container3.classList.remove("mouseover")));
    return template2;
  }
  addSettingElementFocusHandler(template2) {
    const focusTracker = trackFocus(template2.containerElement);
    template2.toDispose.add(focusTracker);
    template2.toDispose.add(focusTracker.onDidBlur(() => {
      if (template2.containerElement.classList.contains("focused")) {
        template2.containerElement.classList.remove("focused");
      }
    }));
    template2.toDispose.add(focusTracker.onDidFocus(() => {
      template2.containerElement.classList.add("focused");
      if (template2.context) {
        this._onDidFocusSetting.fire(template2.context);
      }
    }));
  }
  renderSettingToolbar(container3) {
    const toggleMenuTitle = this._keybindingService.appendKeybinding(
      localize(18340, null),
      SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU
    );
    const toolbar = new ToolBar(container3, this._contextMenuService, {
      toggleMenuTitle,
      renderDropdownAsChildElement: !isIOS,
      moreIcon: settingsMoreActionIcon
    });
    return toolbar;
  }
  renderSettingElement(node, index2, template2) {
    const element = node.element;
    element.inspectSelf();
    template2.context = element;
    template2.toolbar.context = element;
    const actions = this.disposableActionFactory(element.setting, element.settingsTarget);
    actions.forEach((a) => isDisposable(a) && template2.elementDisposables.add(a));
    template2.toolbar.setActions([], [...this.settingActions, ...actions]);
    const setting = element.setting;
    template2.containerElement.classList.toggle("is-configured", element.isConfigured);
    template2.containerElement.setAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR, element.setting.key);
    template2.containerElement.setAttribute(AbstractSettingRenderer.SETTING_ID_ATTR, element.id);
    const titleTooltip = setting.key + (element.isConfigured ? " - Modified" : "");
    template2.categoryElement.textContent = element.displayCategory ? element.displayCategory + ": " : "";
    template2.elementDisposables.add(this._hoverService.setupDelayedHover(template2.categoryElement, { content: titleTooltip }));
    template2.labelElement.text = element.displayLabel;
    template2.labelElement.title = titleTooltip;
    template2.descriptionElement.innerText = "";
    if (element.setting.descriptionIsMarkdown) {
      const renderedDescription = this.renderSettingMarkdown(element, template2.containerElement, element.description, template2.elementDisposables);
      template2.descriptionElement.appendChild(renderedDescription);
    } else {
      template2.descriptionElement.innerText = element.description;
    }
    template2.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
    template2.elementDisposables.add(this._configService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(APPLY_ALL_PROFILES_SETTING)) {
        template2.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
      }
    }));
    const onChange = (value2) => this._onDidChangeSetting.fire({
      key: element.setting.key,
      value: value2,
      type: template2.context.valueType,
      manualReset: false,
      scope: element.setting.scope
    });
    const deprecationText = element.setting.deprecationMessage || "";
    if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
      template2.deprecationWarningElement.innerText = "";
      template2.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, template2.containerElement, element.setting.deprecationMessage, template2.elementDisposables));
    } else {
      template2.deprecationWarningElement.innerText = deprecationText;
    }
    template2.deprecationWarningElement.prepend($27(".codicon.codicon-error"));
    template2.containerElement.classList.toggle("is-deprecated", !!deprecationText);
    this.renderValue(element, template2, onChange);
    template2.indicatorsLabel.updateWorkspaceTrust(element);
    template2.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
    template2.indicatorsLabel.updateDefaultOverrideIndicator(element);
    template2.indicatorsLabel.updatePreviewIndicator(element);
    template2.indicatorsLabel.updateAdvancedIndicator(element);
    template2.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
      template2.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
    }));
    this.updateSettingTabbable(element, template2);
    template2.elementDisposables.add(element.onDidChangeTabbable(() => {
      this.updateSettingTabbable(element, template2);
    }));
  }
  updateSettingTabbable(element, template2) {
    if (element.tabbable) {
      addChildrenToTabOrder(template2.containerElement);
    } else {
      removeChildrenFromTabOrder(template2.containerElement);
    }
  }
  renderSettingMarkdown(element, container3, text2, disposables) {
    text2 = fixSettingLinks2(text2);
    const renderedMarkdown = disposables.add(this._markdownRendererService.render({ value: text2, isTrusted: true }, {
      actionHandler: (content2) => {
        if (content2.startsWith("#")) {
          const e = {
            source: element,
            targetKey: content2.substring(1)
          };
          this._onDidClickSettingLink.fire(e);
        } else {
          this._openerService.open(content2, { allowCommands: true }).catch(onUnexpectedError);
        }
      },
      asyncRenderCallback: () => {
        const height = container3.clientHeight;
        if (height) {
          this._onDidChangeSettingHeight.fire({ element, height });
        }
      }
    }));
    renderedMarkdown.element.classList.add("setting-item-markdown");
    cleanRenderedMarkdown(renderedMarkdown.element);
    return renderedMarkdown.element;
  }
  disposeTemplate(template2) {
    template2.toDispose.dispose();
  }
  disposeElement(_element, _index, template2) {
    template2.elementDisposables?.clear();
  }
};

AbstractSettingRenderer = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IExtensionsWorkbenchService),
  __decorateParam(12, IProductService),
  __decorateParam(13, ITelemetryService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IMarkdownRendererService)
], AbstractSettingRenderer);

var SettingGroupRenderer = class {
  constructor() {
    this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    container3.classList.add("group-title");
    const template2 = {
      parent: container3,
      toDispose: new DisposableStore()
    };
    return template2;
  }
  renderElement(element, index2, templateData) {
    templateData.parent.innerText = "";
    const labelElement = append(templateData.parent, $27("div.settings-group-title-label.settings-row-inner-container"));
    labelElement.classList.add(`settings-group-level-${element.element.level}`);
    labelElement.textContent = element.element.label;
    if (element.element.isFirstGroup) {
      labelElement.classList.add("settings-group-first");
    }
  }
  disposeTemplate(templateData) {
    templateData.toDispose.dispose();
  }
};

var SettingNewExtensionsRenderer = class {
  constructor(_commandService) {
    this._commandService = _commandService;
    this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const toDispose = new DisposableStore();
    container3.classList.add("setting-item-new-extensions");
    const button = new Button(container3, { title: true, ...defaultButtonStyles });
    toDispose.add(button);
    toDispose.add(button.onDidClick(() => {
      if (template2.context) {
        this._commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds", template2.context.extensionIds);
      }
    }));
    button.label = localize(18335, null);
    button.element.classList.add("settings-new-extensions-button");
    const template2 = {
      button,
      toDispose
    };
    return template2;
  }
  renderElement(element, index2, templateData) {
    templateData.context = element.element;
  }
  disposeTemplate(template2) {
    template2.toDispose.dispose();
  }
};

SettingNewExtensionsRenderer = __decorateClass([
  __decorateParam(0, ICommandService)
], SettingNewExtensionsRenderer);

var SettingComplexRenderer = class _SettingComplexRenderer extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
  }
  static {
    this.EDIT_IN_JSON_LABEL = localize(18331, null);
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "complex");
    const openSettingsButton = append(common.controlElement, $27("a.edit-in-settings-button"));
    openSettingsButton.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    openSettingsButton.role = "button";
    const validationErrorMessageElement = $27(".setting-item-validation-message");
    common.containerElement.appendChild(validationErrorMessageElement);
    const template2 = {
      ...common,
      button: openSettingsButton,
      validationErrorMessageElement
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    const plainKey = getLanguageTagSettingPlainKey(dataElement.setting.key);
    const editLanguageSettingLabel = localize(18332, null, plainKey);
    const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
    template2.button.textContent = isLanguageTagSetting ? editLanguageSettingLabel : _SettingComplexRenderer.EDIT_IN_JSON_LABEL;
    const onClickOrKeydown = (e) => {
      if (isLanguageTagSetting) {
        this._onApplyFilter.fire(`@${LANGUAGE_SETTING_TAG}${plainKey.replaceAll(" ", "")}`);
      } else {
        this._onDidOpenSettings.fire(dataElement.setting.key);
      }
      e.preventDefault();
      e.stopPropagation();
    };
    template2.elementDisposables.add(addDisposableListener(template2.button, EventType.CLICK, (e) => {
      onClickOrKeydown(e);
    }));
    template2.elementDisposables.add(addDisposableListener(template2.button, EventType.KEY_DOWN, (e) => {
      const ev = new StandardKeyboardEvent(e);
      if (ev.equals(10 /* Space */) || ev.equals(3 /* Enter */)) {
        onClickOrKeydown(e);
      }
    }));
    this.renderValidations(dataElement, template2);
    if (isLanguageTagSetting) {
      template2.button.setAttribute("aria-label", editLanguageSettingLabel);
    } else {
      template2.button.setAttribute("aria-label", `${_SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
    }
  }
  renderValidations(dataElement, template2) {
    const errMsg = dataElement.isConfigured && getInvalidTypeError(dataElement.value, dataElement.setting.type);
    if (errMsg) {
      template2.containerElement.classList.add("invalid-input");
      template2.validationErrorMessageElement.innerText = errMsg;
      return;
    }
    template2.containerElement.classList.remove("invalid-input");
  }
};

var SettingComplexObjectRenderer = class extends SettingComplexRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_COMPLEX_OBJECT_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "list");
    const objectSettingWidget = common.toDispose.add(this._instantiationService.createInstance(ObjectSettingDropdownWidget, common.controlElement));
    objectSettingWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    const openSettingsButton = append(append(common.controlElement, $27(".complex-object-edit-in-settings-button-container")), $27("a.complex-object.edit-in-settings-button"));
    openSettingsButton.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    openSettingsButton.role = "button";
    const validationErrorMessageElement = $27(".setting-item-validation-message");
    common.containerElement.appendChild(validationErrorMessageElement);
    const template2 = {
      ...common,
      button: openSettingsButton,
      validationErrorMessageElement,
      objectSettingWidget
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderValue(dataElement, template2, onChange) {
    const items = getObjectDisplayValue(dataElement);
    template2.objectSettingWidget.setValue(items, {
      settingKey: dataElement.setting.key,
      showAddButton: false,
      isReadOnly: true
    });
    template2.button.parentElement?.classList.toggle("hide", dataElement.hasPolicyValue || dataElement.isAgentsWindowReadOnly);
    super.renderValue(dataElement, template2, onChange);
  }
};

var SettingArrayRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "list");
    const descriptionElement = common.containerElement.querySelector(".setting-item-description");
    const validationErrorMessageElement = $27(".setting-item-validation-message");
    descriptionElement.after(validationErrorMessageElement);
    const listWidget = this._instantiationService.createInstance(ListSettingWidget, common.controlElement);
    listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    common.toDispose.add(listWidget);
    const template2 = {
      ...common,
      listWidget,
      validationErrorMessageElement
    };
    this.addSettingElementFocusHandler(template2);
    common.toDispose.add(
      listWidget.onDidChangeList((e) => {
        const newList = this.computeNewList(template2, e);
        template2.onChange?.(newList);
      })
    );
    return template2;
  }
  computeNewList(template2, e) {
    if (template2.context) {
      let newValue = [];
      if (Array.isArray(template2.context.scopeValue)) {
        newValue = [...template2.context.scopeValue];
      } else if (Array.isArray(template2.context.value)) {
        newValue = [...template2.context.value];
      }
      if (e.type === "move") {
        const sourceIndex = e.sourceIndex;
        const targetIndex = e.targetIndex;
        const splicedElem = newValue.splice(sourceIndex, 1)[0];
        newValue.splice(targetIndex, 0, splicedElem);
      } else if (e.type === "remove" || e.type === "reset") {
        newValue.splice(e.targetIndex, 1);
      } else if (e.type === "change") {
        const itemValueData = e.newItem.value.data.toString();
        if (e.targetIndex > -1) {
          newValue[e.targetIndex] = itemValueData;
        } else {
          newValue.push(itemValueData);
        }
      } else if (e.type === "add") {
        newValue.push(e.newItem.value.data.toString());
      }
      if (template2.context.defaultValue && Array.isArray(template2.context.defaultValue) && template2.context.defaultValue.length === newValue.length && template2.context.defaultValue.join() === newValue.join()) {
        return void 0;
      }
      return newValue;
    }
    return void 0;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    const value2 = getListDisplayValue(dataElement);
    const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : void 0;
    template2.listWidget.setValue(value2, {
      showAddButton: getShowAddButtonList(dataElement, value2),
      keySuggester
    });
    template2.context = dataElement;
    template2.elementDisposables.add(toDisposable(() => {
      template2.listWidget.cancelEdit();
    }));
    template2.onChange = (v2) => {
      if (v2 && !renderArrayValidations(dataElement, template2, v2, false)) {
        const itemType = dataElement.setting.arrayItemType;
        const arrToSave = isNonNullableNumericType(itemType) ? v2.map((a) => +a) : v2;
        onChange(arrToSave);
      } else {
        onChange(v2);
      }
    };
    renderArrayValidations(dataElement, template2, value2.map((v2) => v2.value.data.toString()), true);
  }
};

var AbstractSettingObjectRenderer = class extends AbstractSettingRenderer {
  renderTemplateWithWidget(common, widget) {
    widget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    common.toDispose.add(widget);
    const descriptionElement = common.containerElement.querySelector(".setting-item-description");
    const validationErrorMessageElement = $27(".setting-item-validation-message");
    descriptionElement.after(validationErrorMessageElement);
    const template2 = {
      ...common,
      validationErrorMessageElement
    };
    if (widget instanceof ObjectSettingCheckboxWidget) {
      template2.objectCheckboxWidget = widget;
    } else {
      template2.objectDropdownWidget = widget;
    }
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
};

var SettingObjectRenderer = class extends AbstractSettingObjectRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "list");
    const widget = this._instantiationService.createInstance(ObjectSettingDropdownWidget, common.controlElement);
    const template2 = this.renderTemplateWithWidget(common, widget);
    common.toDispose.add(widget.onDidChangeList((e) => {
      this.onDidChangeObject(template2, e);
    }));
    return template2;
  }
  onDidChangeObject(template2, e) {
    const widget = template2.objectDropdownWidget;
    if (template2.context) {
      const settingSupportsRemoveDefault = objectSettingSupportsRemoveDefaultValue(template2.context.setting.key);
      const defaultValue = typeof template2.context.defaultValue === "object" ? template2.context.defaultValue ?? {} : {};
      const scopeValue = typeof template2.context.scopeValue === "object" ? template2.context.scopeValue ?? {} : {};
      const newValue = { ...template2.context.scopeValue };
      const newItems = [];
      widget.items.forEach((item, idx) => {
        if ((e.type === "change" || e.type === "move") && e.targetIndex === idx) {
          if (e.originalItem.key.data !== e.newItem.key.data && settingSupportsRemoveDefault && e.originalItem.key.data in defaultValue) {
            newValue[e.originalItem.key.data] = null;
          } else {
            delete newValue[e.originalItem.key.data];
          }
          newValue[e.newItem.key.data] = e.newItem.value.data;
          newItems.push(e.newItem);
        } else if (e.type !== "change" && e.type !== "move" || e.newItem.key.data !== item.key.data) {
          newValue[item.key.data] = item.value.data;
          newItems.push(item);
        }
      });
      if (e.type === "remove" || e.type === "reset") {
        const objectKey = e.originalItem.key.data;
        const removingDefaultValue = e.type === "remove" && settingSupportsRemoveDefault && defaultValue[objectKey] === e.originalItem.value.data;
        if (removingDefaultValue) {
          newValue[objectKey] = null;
        } else {
          delete newValue[objectKey];
        }
        const itemToDelete = newItems.findIndex((item) => item.key.data === objectKey);
        const defaultItemValue = defaultValue[objectKey];
        if (removingDefaultValue || isUndefinedOrNull(defaultValue[objectKey]) && itemToDelete > -1) {
          newItems.splice(itemToDelete, 1);
        } else if (!removingDefaultValue && itemToDelete > -1) {
          newItems[itemToDelete].value.data = defaultItemValue;
        }
      } else if (e.type === "add") {
        newValue[e.newItem.key.data] = e.newItem.value.data;
        newItems.push(e.newItem);
      }
      Object.entries(newValue).forEach(([key3, value2]) => {
        if (scopeValue[key3] !== value2 && defaultValue[key3] === value2 && !(settingSupportsRemoveDefault && value2 === null)) {
          delete newValue[key3];
        }
      });
      const newObject = Object.keys(newValue).length === 0 ? void 0 : newValue;
      template2.objectDropdownWidget.setValue(newItems);
      template2.onChange?.(newObject);
    }
  }
  renderValue(dataElement, template2, onChange) {
    const items = getObjectDisplayValue(dataElement);
    const { key: key3, objectProperties, objectPatternProperties, objectAdditionalProperties, propertyNames } = dataElement.setting;
    template2.objectDropdownWidget.setValue(items, {
      settingKey: key3,
      showAddButton: objectAdditionalProperties === false ? !areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) || isDefined(objectPatternProperties) : true,
      keySuggester: createObjectKeySuggester(dataElement),
      valueSuggester: createObjectValueSuggester(dataElement),
      propertyNames
    });
    template2.context = dataElement;
    template2.elementDisposables.add(toDisposable(() => {
      template2.objectDropdownWidget.cancelEdit();
    }));
    template2.onChange = (v2) => {
      if (v2 && !renderArrayValidations(dataElement, template2, v2, false)) {
        const parsedRecord = parseNumericObjectValues(dataElement, v2);
        onChange(parsedRecord);
      } else {
        onChange(v2);
      }
    };
    renderArrayValidations(dataElement, template2, dataElement.value, true);
  }
};

var SettingBoolObjectRenderer = class extends AbstractSettingObjectRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "list");
    const widget = this._instantiationService.createInstance(ObjectSettingCheckboxWidget, common.controlElement);
    const template2 = this.renderTemplateWithWidget(common, widget);
    common.toDispose.add(widget.onDidChangeList((e) => {
      this.onDidChangeObject(template2, e);
    }));
    return template2;
  }
  onDidChangeObject(template2, e) {
    if (template2.context) {
      const widget = template2.objectCheckboxWidget;
      const defaultValue = typeof template2.context.defaultValue === "object" ? template2.context.defaultValue ?? {} : {};
      const scopeValue = typeof template2.context.scopeValue === "object" ? template2.context.scopeValue ?? {} : {};
      const newValue = { ...template2.context.scopeValue };
      const newItems = [];
      if (e.type !== "change") {
        console.warn("Unexpected event type", e.type, "for bool object setting", template2.context.setting.key);
        return;
      }
      widget.items.forEach((item, idx) => {
        if (e.targetIndex === idx) {
          newValue[e.newItem.key.data] = e.newItem.value.data;
          newItems.push(e.newItem);
        } else if (e.newItem.key.data !== item.key.data) {
          newValue[item.key.data] = item.value.data;
          newItems.push(item);
        }
      });
      Object.entries(newValue).forEach(([key3, value2]) => {
        if (scopeValue[key3] !== value2 && defaultValue[key3] === value2) {
          delete newValue[key3];
        }
      });
      const newObject = Object.keys(newValue).length === 0 ? void 0 : newValue;
      template2.objectCheckboxWidget.setValue(newItems);
      template2.onChange?.(newObject);
      this._onDidFocusSetting.fire(template2.context);
    }
  }
  renderValue(dataElement, template2, onChange) {
    const items = getBoolObjectDisplayValue(dataElement);
    const { key: key3 } = dataElement.setting;
    template2.objectCheckboxWidget.setValue(items, {
      settingKey: key3
    });
    template2.context = dataElement;
    template2.onChange = (v2) => {
      onChange(v2);
    };
  }
};

var SettingIncludeExcludeRenderer = class extends AbstractSettingRenderer {
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "list");
    const includeExcludeWidget = this._instantiationService.createInstance(this.isExclude() ? ExcludeSettingWidget : IncludeSettingWidget, common.controlElement);
    includeExcludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    common.toDispose.add(includeExcludeWidget);
    const template2 = {
      ...common,
      includeExcludeWidget
    };
    this.addSettingElementFocusHandler(template2);
    common.toDispose.add(includeExcludeWidget.onDidChangeList((e) => this.onDidChangeIncludeExclude(template2, e)));
    return template2;
  }
  onDidChangeIncludeExclude(template2, e) {
    if (template2.context) {
      let sortKeys = function(obj) {
        const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
        const retVal = {};
        for (const key3 of sortedKeys) {
          retVal[key3] = obj[key3];
        }
        return retVal;
      };
      const newValue = { ...template2.context.scopeValue };
      if (e.type !== "add") {
        if (e.originalItem.value.data.toString() in template2.context.defaultValue) {
          newValue[e.originalItem.value.data.toString()] = false;
        } else {
          delete newValue[e.originalItem.value.data.toString()];
        }
      }
      if (e.type === "change" || e.type === "add" || e.type === "move") {
        if (e.newItem.value.data.toString() in template2.context.defaultValue && !e.newItem.sibling) {
          delete newValue[e.newItem.value.data.toString()];
        } else {
          newValue[e.newItem.value.data.toString()] = e.newItem.sibling ? { when: e.newItem.sibling } : true;
        }
      }
      this._onDidChangeSetting.fire({
        key: template2.context.setting.key,
        value: Object.keys(newValue).length === 0 ? void 0 : sortKeys(newValue),
        type: template2.context.valueType,
        manualReset: false,
        scope: template2.context.setting.scope
      });
    }
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    const value2 = getIncludeExcludeDisplayValue(dataElement);
    template2.includeExcludeWidget.setValue(value2, { isReadOnly: dataElement.hasPolicyValue || dataElement.isAgentsWindowReadOnly });
    template2.context = dataElement;
    template2.elementDisposables.add(toDisposable(() => {
      template2.includeExcludeWidget.cancelEdit();
    }));
  }
};

var SettingExcludeRenderer = class extends SettingIncludeExcludeRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
  }
  isExclude() {
    return true;
  }
};

var SettingIncludeRenderer = class extends SettingIncludeExcludeRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_INCLUDE_TEMPLATE_ID;
  }
  isExclude() {
    return false;
  }
};

var settingsInputBoxStyles = getInputBoxStyle({
  inputBackground: settingsTextInputBackground,
  inputForeground: settingsTextInputForeground,
  inputBorder: settingsTextInputBorder
});

var AbstractSettingTextRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.MULTILINE_MAX_HEIGHT = 150;
  }
  renderTemplate(_container, useMultiline) {
    const common = this.renderCommonTemplate(null, _container, "text");
    const validationErrorMessageElement = append(common.containerElement, $27(".setting-item-validation-message"));
    const inputBoxOptions = {
      flexibleHeight: useMultiline,
      flexibleWidth: false,
      flexibleMaxHeight: this.MULTILINE_MAX_HEIGHT,
      inputBoxStyles: settingsInputBoxStyles
    };
    const inputBox = new InputBox(common.controlElement, this._contextViewService, inputBoxOptions);
    common.toDispose.add(inputBox);
    common.toDispose.add(
      inputBox.onDidChange((e) => {
        template2.onChange?.(e);
      })
    );
    common.toDispose.add(inputBox);
    inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    inputBox.inputElement.tabIndex = 0;
    const template2 = {
      ...common,
      inputBox,
      validationErrorMessageElement
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    template2.onChange = void 0;
    template2.inputBox.value = dataElement.value;
    template2.inputBox.setEnabled(!dataElement.hasPolicyValue && !dataElement.isAgentsWindowReadOnly);
    template2.inputBox.setAriaLabel(dataElement.setting.key);
    template2.onChange = (value2) => {
      if (!renderValidations(dataElement, template2, false)) {
        onChange(value2);
      }
    };
    renderValidations(dataElement, template2, true);
  }
};

var SettingTextRenderer = class extends AbstractSettingTextRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_TEXT_TEMPLATE_ID;
  }
  renderTemplate(_container) {
    const template2 = super.renderTemplate(_container, false);
    template2.toDispose.add(addStandardDisposableListener(template2.inputBox.inputElement, EventType.KEY_DOWN, (e) => {
      if (e.equals(16 /* UpArrow */) || e.equals(18 /* DownArrow */)) {
        e.preventDefault();
      }
    }));
    return template2;
  }
};

var SettingMultilineTextRenderer = class extends AbstractSettingTextRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
  }
  renderTemplate(_container) {
    return super.renderTemplate(_container, true);
  }
  renderValue(dataElement, template2, onChange) {
    const onChangeOverride = (value2) => {
      dataElement.value = value2;
      onChange(value2);
    };
    super.renderValue(dataElement, template2, onChangeOverride);
    template2.elementDisposables.add(
      template2.inputBox.onDidHeightChange((e) => {
        const height = template2.containerElement.clientHeight;
        if (height) {
          this._onDidChangeSettingHeight.fire({
            element: dataElement,
            height: template2.containerElement.clientHeight
          });
        }
      })
    );
    template2.inputBox.layout();
  }
};

var SettingEnumRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
  }
  renderTemplate(container3) {
    const common = this.renderCommonTemplate(null, container3, "enum");
    const styles = getSelectBoxStyles({
      selectBackground: settingsSelectBackground,
      selectForeground: settingsSelectForeground,
      selectBorder: settingsSelectBorder,
      selectListBorder: settingsSelectListBorder
    });
    const selectBox = new SelectBox([], 0, this._contextViewService, styles, {
      useCustomDrawn: !hasNativeContextMenu(this._configService) || !(isIOS && BrowserFeatures.pointerEvents)
    });
    common.toDispose.add(selectBox);
    selectBox.render(common.controlElement);
    const selectElement2 = common.controlElement.querySelector("select");
    if (selectElement2) {
      selectElement2.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
      selectElement2.tabIndex = 0;
    }
    common.toDispose.add(
      selectBox.onDidSelect((e) => {
        template2.onChange?.(e.index);
      })
    );
    const enumDescriptionElement = common.containerElement.insertBefore($27(".setting-item-enumDescription"), common.descriptionElement.nextSibling);
    const template2 = {
      ...common,
      selectBox,
      selectElement: selectElement2,
      enumDescriptionElement
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
    const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
    const settingEnum = [...dataElement.setting.enum];
    const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
    const disposables = new DisposableStore();
    template2.elementDisposables.add(disposables);
    let createdDefault = false;
    if (!settingEnum.includes(dataElement.defaultValue)) {
      settingEnum.unshift(dataElement.defaultValue);
      enumDescriptions.unshift("");
      enumItemLabels.unshift("");
      createdDefault = true;
    }
    const stringifiedDefaultValue = escapeInvisibleChars2(String(dataElement.defaultValue));
    const displayOptions = settingEnum.map(String).map(escapeInvisibleChars2).map((data, index2) => {
      const description = enumDescriptions[index2] && (enumDescriptionsAreMarkdown ? fixSettingLinks2(enumDescriptions[index2], false) : enumDescriptions[index2]);
      return {
        text: enumItemLabels[index2] ? enumItemLabels[index2] : data,
        detail: enumItemLabels[index2] ? data : "",
        description,
        descriptionIsMarkdown: enumDescriptionsAreMarkdown,
        descriptionMarkdownActionHandler: (content2) => {
          this._openerService.open(content2).catch(onUnexpectedError);
        },
        decoratorRight: data === stringifiedDefaultValue || createdDefault && index2 === 0 ? localize(18338, null) : ""
      };
    });
    template2.selectBox.setOptions(displayOptions);
    template2.selectBox.setAriaLabel(dataElement.setting.key);
    template2.selectBox.setEnabled(!dataElement.hasPolicyValue && !dataElement.isAgentsWindowReadOnly);
    let idx = settingEnum.indexOf(dataElement.value);
    if (idx === -1) {
      idx = 0;
    }
    template2.onChange = void 0;
    template2.selectBox.select(idx);
    template2.onChange = (idx2) => {
      if (createdDefault && idx2 === 0) {
        onChange(dataElement.defaultValue);
      } else {
        onChange(settingEnum[idx2]);
      }
    };
    template2.enumDescriptionElement.innerText = "";
  }
};

var settingsNumberInputBoxStyles = getInputBoxStyle({
  inputBackground: settingsNumberInputBackground,
  inputForeground: settingsNumberInputForeground,
  inputBorder: settingsNumberInputBorder
});

var SettingNumberRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
  }
  renderTemplate(_container) {
    const common = super.renderCommonTemplate(null, _container, "number");
    const validationErrorMessageElement = append(common.containerElement, $27(".setting-item-validation-message"));
    const inputBox = new InputBox(common.controlElement, this._contextViewService, { type: "number", inputBoxStyles: settingsNumberInputBoxStyles });
    common.toDispose.add(inputBox);
    common.toDispose.add(
      inputBox.onDidChange((e) => {
        template2.onChange?.(e);
      })
    );
    common.toDispose.add(inputBox);
    inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    inputBox.inputElement.tabIndex = 0;
    const template2 = {
      ...common,
      inputBox,
      validationErrorMessageElement
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    const numParseFn = dataElement.valueType === "integer" || dataElement.valueType === "nullable-integer" ? parseInt : parseFloat;
    const nullNumParseFn = dataElement.valueType === "nullable-integer" || dataElement.valueType === "nullable-number" ? ((v2) => v2 === "" ? null : numParseFn(v2)) : numParseFn;
    template2.onChange = void 0;
    template2.inputBox.value = typeof dataElement.value === "number" ? dataElement.value.toString() : "";
    template2.inputBox.step = dataElement.valueType.includes("integer") ? "1" : "any";
    template2.inputBox.setAriaLabel(dataElement.setting.key);
    template2.inputBox.setEnabled(!dataElement.hasPolicyValue && !dataElement.isAgentsWindowReadOnly);
    template2.onChange = (value2) => {
      if (!renderValidations(dataElement, template2, false)) {
        onChange(nullNumParseFn(value2));
      }
    };
    renderValidations(dataElement, template2, true);
  }
};

var SettingBoolRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
  }
  renderTemplate(_container) {
    _container.classList.add("setting-item");
    _container.classList.add("setting-item-bool");
    const toDispose = new DisposableStore();
    const container3 = append(_container, $27(AbstractSettingRenderer.CONTENTS_SELECTOR));
    container3.classList.add("settings-row-inner-container");
    const titleElement = append(container3, $27(".setting-item-title"));
    const categoryElement = append(titleElement, $27("span.setting-item-category"));
    const labelElementContainer = append(titleElement, $27("span.setting-item-label"));
    const labelElement = toDispose.add(new SimpleIconLabel(labelElementContainer));
    const indicatorsLabel = toDispose.add(this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement));
    const descriptionAndValueElement = append(container3, $27(".setting-item-value-description"));
    const controlElement = append(descriptionAndValueElement, $27(".setting-item-bool-control"));
    const descriptionElement = append(descriptionAndValueElement, $27(".setting-item-description"));
    const modifiedIndicatorElement = append(container3, $27(".setting-item-modified-indicator"));
    toDispose.add(this._hoverService.setupDelayedHover(modifiedIndicatorElement, {
      content: localize(18334, null)
    }));
    const deprecationWarningElement = append(container3, $27(".setting-item-deprecation-message"));
    const checkbox = new Toggle({ icon: Codicon.check, actionClassName: "setting-value-checkbox", isChecked: true, title: "", ...unthemedToggleStyles });
    controlElement.appendChild(checkbox.domNode);
    toDispose.add(checkbox);
    toDispose.add(checkbox.onChange(() => {
      template2.onChange(checkbox.checked);
    }));
    checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
    const toolbarContainer = append(container3, $27(".setting-toolbar-container"));
    const toolbar = this.renderSettingToolbar(toolbarContainer);
    toDispose.add(toolbar);
    const template2 = {
      toDispose,
      elementDisposables: toDispose.add(new DisposableStore()),
      containerElement: container3,
      categoryElement,
      labelElement,
      controlElement,
      checkbox,
      descriptionElement,
      deprecationWarningElement,
      indicatorsLabel,
      toolbar
    };
    this.addSettingElementFocusHandler(template2);
    toDispose.add(addDisposableListener(controlElement, "mousedown", (e) => e.stopPropagation()));
    toDispose.add(addDisposableListener(titleElement, EventType.MOUSE_ENTER, (e) => container3.classList.add("mouseover")));
    toDispose.add(addDisposableListener(titleElement, EventType.MOUSE_LEAVE, (e) => container3.classList.remove("mouseover")));
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    template2.onChange = void 0;
    template2.checkbox.checked = dataElement.value;
    if (dataElement.hasPolicyValue || dataElement.isAgentsWindowReadOnly) {
      template2.checkbox.disable();
      template2.descriptionElement.classList.add("disabled");
    } else {
      template2.checkbox.enable();
      template2.descriptionElement.classList.remove("disabled");
      template2.elementDisposables.add(addDisposableListener(template2.descriptionElement, EventType.MOUSE_DOWN, (e) => {
        const targetElement = e.target instanceof Element ? e.target : null;
        if (!targetElement || !targetElement.closest("a")) {
          template2.checkbox.checked = !template2.checkbox.checked;
          template2.onChange(template2.checkbox.checked);
        }
        EventHelper.stop(e);
      }));
    }
    template2.checkbox.setTitle(dataElement.setting.key);
    template2.onChange = onChange;
  }
};

var SettingsExtensionToggleRenderer = class extends AbstractSettingRenderer {
  constructor() {
    super(...arguments);
    this.templateId = SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
    this._onDidDismissExtensionSetting = this._register(new Emitter());
    this.onDidDismissExtensionSetting = this._onDidDismissExtensionSetting.event;
  }
  renderTemplate(_container) {
    const common = super.renderCommonTemplate(null, _container, "extension-toggle");
    const actionButton = new Button(common.containerElement, {
      title: false,
      ...defaultButtonStyles
    });
    actionButton.element.classList.add("setting-item-extension-toggle-button");
    actionButton.label = localize(18341, null);
    const dismissButton = new Button(common.containerElement, {
      title: false,
      secondary: true,
      ...defaultButtonStyles
    });
    dismissButton.element.classList.add("setting-item-extension-dismiss-button");
    dismissButton.label = localize(18330, null);
    const template2 = {
      ...common,
      actionButton,
      dismissButton
    };
    this.addSettingElementFocusHandler(template2);
    return template2;
  }
  renderElement(element, index2, templateData) {
    super.renderSettingElement(element, index2, templateData);
  }
  renderValue(dataElement, template2, onChange) {
    template2.elementDisposables.clear();
    const extensionId = dataElement.setting.displayExtensionId;
    template2.elementDisposables.add(template2.actionButton.onDidClick(async () => {
      this._telemetryService.publicLog2("ManageExtensionClick", { extensionId });
      this._commandService.executeCommand("extension.open", extensionId);
    }));
    template2.elementDisposables.add(template2.dismissButton.onDidClick(async () => {
      this._telemetryService.publicLog2("DismissExtensionClick", { extensionId });
      this._onDidDismissExtensionSetting.fire(extensionId);
    }));
  }
};

var SettingTreeRenderers = class extends Disposable {
  constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataSyncEnablementService) {
    super();
    this._instantiationService = _instantiationService;
    this._contextMenuService = _contextMenuService;
    this._contextViewService = _contextViewService;
    this._userDataSyncEnablementService = _userDataSyncEnablementService;
    this._onDidChangeSetting = this._register(new Emitter());
    this.settingActions = [
      new Action("settings.resetSetting", localize(18336, null), void 0, void 0, async (context2) => {
        if (context2 instanceof SettingsTreeSettingElement) {
          if (!context2.isUntrusted) {
            this._onDidChangeSetting.fire({
              key: context2.setting.key,
              value: void 0,
              type: context2.setting.type,
              manualReset: true,
              scope: context2.setting.scope
            });
          }
        }
      }),
      new Separator(),
      this._instantiationService.createInstance(CopySettingIdAction),
      this._instantiationService.createInstance(CopySettingAsJSONAction),
      this._instantiationService.createInstance(CopySettingAsURLAction)
    ];
    const actionFactory = (setting, settingTarget) => this.getActionsForSetting(setting, settingTarget);
    const emptyActionFactory = (_) => [];
    const extensionRenderer = this._instantiationService.createInstance(SettingsExtensionToggleRenderer, [], emptyActionFactory);
    const settingRenderers = [
      this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingComplexObjectRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingMultilineTextRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingIncludeRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
      this._instantiationService.createInstance(SettingBoolObjectRenderer, this.settingActions, actionFactory),
      extensionRenderer
    ];
    this.onDidClickOverrideElement = Event2.any(...settingRenderers.map((r2) => r2.onDidClickOverrideElement));
    this.onDidChangeSetting = Event2.any(
      ...settingRenderers.map((r2) => r2.onDidChangeSetting),
      this._onDidChangeSetting.event
    );
    this.onDidDismissExtensionSetting = extensionRenderer.onDidDismissExtensionSetting;
    this.onDidOpenSettings = Event2.any(...settingRenderers.map((r2) => r2.onDidOpenSettings));
    this.onDidClickSettingLink = Event2.any(...settingRenderers.map((r2) => r2.onDidClickSettingLink));
    this.onDidFocusSetting = Event2.any(...settingRenderers.map((r2) => r2.onDidFocusSetting));
    this.onDidChangeSettingHeight = Event2.any(...settingRenderers.map((r2) => r2.onDidChangeSettingHeight));
    this.onApplyFilter = Event2.any(...settingRenderers.map((r2) => r2.onApplyFilter));
    this.allRenderers = [
      ...settingRenderers,
      this._instantiationService.createInstance(SettingGroupRenderer),
      this._instantiationService.createInstance(SettingNewExtensionsRenderer)
    ];
  }
  getActionsForSetting(setting, settingTarget) {
    const actions = [];
    if (!(setting.scope && APPLICATION_SCOPES.includes(setting.scope)) && settingTarget === 3 /* USER_LOCAL */) {
      actions.push(this._instantiationService.createInstance(ApplySettingToAllProfilesAction, setting));
    }
    if (this._userDataSyncEnablementService.isEnabled() && !setting.disallowSyncIgnore) {
      actions.push(this._instantiationService.createInstance(SyncSettingAction, setting));
    }
    if (actions.length) {
      actions.splice(0, 0, new Separator());
    }
    return actions;
  }
  cancelSuggesters() {
    this._contextViewService.hideContextView();
  }
  showContextMenu(element, settingDOMElement) {
    const toolbarElement = settingDOMElement.querySelector(".monaco-toolbar");
    if (toolbarElement) {
      this._contextMenuService.showContextMenu({
        getActions: () => this.settingActions,
        getAnchor: () => toolbarElement,
        getActionsContext: () => element
      });
    }
  }
  getSettingDOMElementForDOMElement(domElement) {
    const parent = findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
    if (parent) {
      return parent;
    }
    return null;
  }
  getDOMElementsForSettingKey(treeContainer, key3) {
    return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key3}"]`);
  }
  getKeyForDOMElementInSetting(element) {
    const settingElement = this.getSettingDOMElementForDOMElement(element);
    return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
  }
  getIdForDOMElementInSetting(element) {
    const settingElement = this.getSettingDOMElementForDOMElement(element);
    return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
  }
  dispose() {
    super.dispose();
    this.settingActions.forEach((action) => {
      if (isDisposable(action)) {
        action.dispose();
      }
    });
    this.allRenderers.forEach((renderer) => {
      if (isDisposable(renderer)) {
        renderer.dispose();
      }
    });
  }
};

SettingTreeRenderers = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IUserDataSyncEnablementService)
], SettingTreeRenderers);

function renderValidations(dataElement, template2, calledOnStartup) {
  if (dataElement.setting.validator) {
    const errMsg = dataElement.setting.validator(template2.inputBox.value);
    if (errMsg) {
      template2.containerElement.classList.add("invalid-input");
      template2.validationErrorMessageElement.innerText = errMsg;
      const validationError = localize(18343, null);
      template2.inputBox.inputElement.parentElement.setAttribute("aria-label", [validationError, errMsg].join(" "));
      if (!calledOnStartup) {
        status(validationError + " " + errMsg);
      }
      return true;
    } else {
      template2.inputBox.inputElement.parentElement.removeAttribute("aria-label");
    }
  }
  template2.containerElement.classList.remove("invalid-input");
  return false;
}

function renderArrayValidations(dataElement, template2, value2, calledOnStartup) {
  template2.containerElement.classList.add("invalid-input");
  if (dataElement.setting.validator) {
    const errMsg = dataElement.setting.validator(value2);
    if (errMsg && errMsg !== "") {
      template2.containerElement.classList.add("invalid-input");
      template2.validationErrorMessageElement.innerText = errMsg;
      const validationError = localize(18343, null);
      template2.containerElement.setAttribute("aria-label", [dataElement.setting.key, validationError, errMsg].join(" "));
      if (!calledOnStartup) {
        status(validationError + " " + errMsg);
      }
      return true;
    } else {
      template2.containerElement.setAttribute("aria-label", dataElement.setting.key);
      template2.containerElement.classList.remove("invalid-input");
    }
  }
  return false;
}

function cleanRenderedMarkdown(element) {
  for (let i2 = 0; i2 < element.childNodes.length; i2++) {
    const child = element.childNodes.item(i2);
    const tagName = child.tagName && child.tagName.toLowerCase();
    if (tagName === "img") {
      child.remove();
    } else {
      cleanRenderedMarkdown(child);
    }
  }
}

function fixSettingLinks2(text2, linkify = true) {
  return text2.replace(/`#([^#\s`]+)#`|'#([^#\s']+)#'/g, (match2, backticksGroup, quotesGroup) => {
    const settingKey = backticksGroup ?? quotesGroup;
    const targetDisplayFormat = settingKeyToDisplayFormat(settingKey);
    const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
    return linkify ? `[${targetName}](#${settingKey} "${settingKey}")` : `"${targetName}"`;
  });
}

function escapeInvisibleChars2(enumValue) {
  return enumValue && enumValue.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

var SettingsTreeFilter = class {
  constructor(viewState, isFilteringGroups, environmentService) {
    this.viewState = viewState;
    this.isFilteringGroups = isFilteringGroups;
    this.environmentService = environmentService;
  }
  filter(element, parentVisibility) {
    if (this.viewState.categoryFilter && element instanceof SettingsTreeSettingElement) {
      if (!this.settingContainedInGroup(element.setting, this.viewState.categoryFilter)) {
        return false;
      }
    }
    if (element instanceof SettingsTreeSettingElement && this.viewState.settingsTarget !== 3 /* USER_LOCAL */) {
      const isRemote = !!this.environmentService.remoteAuthority;
      if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
        return false;
      }
    }
    if (element instanceof SettingsTreeGroupElement) {
      if (this.isFilteringGroups && this.viewState.categoryFilter) {
        if (!this.groupIsRelatedToCategory(element, this.viewState.categoryFilter)) {
          return false;
        }
        return 2 /* Recurse */;
      }
      if (typeof element.count === "number") {
        return element.count > 0;
      }
      return 2 /* Recurse */;
    }
    if (element instanceof SettingsTreeNewExtensionsElement) {
      if (this.viewState.tagFilters?.size || this.viewState.categoryFilter) {
        return false;
      }
    }
    return true;
  }
  settingContainedInGroup(setting, group2) {
    return group2.children.some((child) => {
      if (child instanceof SettingsTreeGroupElement) {
        return this.settingContainedInGroup(setting, child);
      } else if (child instanceof SettingsTreeSettingElement) {
        return child.setting.key === setting.key;
      } else {
        return false;
      }
    });
  }
  /**
   * Checks if a group is related to the filtered category.
   * A group is related if it's the category itself, a descendant of it, or an ancestor of it.
   */
  groupIsRelatedToCategory(group2, category11) {
    if (group2.id === category11.id) {
      return true;
    }
    let parent = group2.parent;
    while (parent) {
      if (parent.id === category11.id) {
        return true;
      }
      parent = parent.parent;
    }
    let categoryParent = category11.parent;
    while (categoryParent) {
      if (categoryParent.id === group2.id) {
        return true;
      }
      categoryParent = categoryParent.parent;
    }
    return false;
  }
};

SettingsTreeFilter = __decorateClass([
  __decorateParam(2, IWorkbenchEnvironmentService)
], SettingsTreeFilter);

var SettingsTreeDelegate = class extends CachedListVirtualDelegate {
  getTemplateId(element) {
    if (element instanceof SettingsTreeGroupElement) {
      return SETTINGS_ELEMENT_TEMPLATE_ID;
    }
    if (element instanceof SettingsTreeSettingElement) {
      if (element.valueType === "extension-toggle" /* ExtensionToggle */) {
        return SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
      }
      const invalidTypeError = element.isConfigured && getInvalidTypeError(element.value, element.setting.type);
      if (invalidTypeError) {
        return SETTINGS_COMPLEX_TEMPLATE_ID;
      }
      if (element.valueType === "boolean" /* Boolean */) {
        return SETTINGS_BOOL_TEMPLATE_ID;
      }
      if (element.valueType === "integer" /* Integer */ || element.valueType === "number" /* Number */ || element.valueType === "nullable-integer" /* NullableInteger */ || element.valueType === "nullable-number" /* NullableNumber */) {
        return SETTINGS_NUMBER_TEMPLATE_ID;
      }
      if (element.valueType === "multiline-string" /* MultilineString */) {
        return SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
      }
      if (element.valueType === "string" /* String */) {
        return SETTINGS_TEXT_TEMPLATE_ID;
      }
      if (element.valueType === "enum" /* Enum */) {
        return SETTINGS_ENUM_TEMPLATE_ID;
      }
      if (element.valueType === "array" /* Array */) {
        return SETTINGS_ARRAY_TEMPLATE_ID;
      }
      if (element.valueType === "exclude" /* Exclude */) {
        return SETTINGS_EXCLUDE_TEMPLATE_ID;
      }
      if (element.valueType === "include" /* Include */) {
        return SETTINGS_INCLUDE_TEMPLATE_ID;
      }
      if (element.valueType === "object" /* Object */) {
        return SETTINGS_OBJECT_TEMPLATE_ID;
      }
      if (element.valueType === "boolean-object" /* BooleanObject */) {
        return SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
      }
      if (element.valueType === "complex-object" /* ComplexObject */) {
        return SETTINGS_COMPLEX_OBJECT_TEMPLATE_ID;
      }
      if (element.valueType === "language-tag" /* LanguageTag */) {
        return SETTINGS_COMPLEX_TEMPLATE_ID;
      }
      return SETTINGS_COMPLEX_TEMPLATE_ID;
    }
    if (element instanceof SettingsTreeNewExtensionsElement) {
      return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
    }
    throw new Error("unknown element type: " + element);
  }
  hasDynamicHeight(element) {
    return !(element instanceof SettingsTreeGroupElement);
  }
  estimateHeight(element) {
    if (element instanceof SettingsTreeGroupElement) {
      return 42;
    }
    return element instanceof SettingsTreeSettingElement && element.valueType === "boolean" /* Boolean */ ? 78 : 104;
  }
};

var NonCollapsibleObjectTreeModel = class extends ObjectTreeModel {
  isCollapsible(element) {
    return false;
  }
  setCollapsed(element, collapsed2, recursive) {
    return false;
  }
};

var SettingsTreeAccessibilityProvider = class {
  constructor(configurationService, languageService, userDataProfilesService) {
    this.configurationService = configurationService;
    this.languageService = languageService;
    this.userDataProfilesService = userDataProfilesService;
  }
  getAriaLabel(element) {
    if (element instanceof SettingsTreeSettingElement) {
      const ariaLabelSections = [];
      ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
      if (element.isConfigured) {
        const modifiedText = localize(18339, null);
        ariaLabelSections.push(modifiedText);
      }
      const indicatorsLabelAriaLabel = getIndicatorsLabelAriaLabel(element, this.configurationService, this.userDataProfilesService, this.languageService);
      if (indicatorsLabelAriaLabel.length) {
        ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
      }
      const descriptionWithoutSettingLinks = renderAsPlaintext({ value: fixSettingLinks2(element.description, false) });
      if (descriptionWithoutSettingLinks.length) {
        ariaLabelSections.push(descriptionWithoutSettingLinks);
      }
      return ariaLabelSections.join(" ");
    } else if (element instanceof SettingsTreeGroupElement) {
      return element.label;
    } else {
      return element.id;
    }
  }
  getWidgetAriaLabel() {
    return localize(18337, null);
  }
};

var SettingsTree = class extends WorkbenchObjectTree {
  constructor(container3, viewState, renderers, contextKeyService, listService, configurationService, instantiationService, languageService, userDataProfilesService) {
    super(
      "SettingsTree",
      container3,
      new SettingsTreeDelegate(),
      renderers,
      {
        horizontalScrolling: false,
        supportDynamicHeights: true,
        scrollToActiveElement: true,
        identityProvider: {
          getId(e) {
            return e.id;
          }
        },
        accessibilityProvider: new SettingsTreeAccessibilityProvider(configurationService, languageService, userDataProfilesService),
        styleController: (id2) => new DefaultStyleController(createStyleSheet(container3), id2),
        filter: instantiationService.createInstance(SettingsTreeFilter, viewState, true),
        smoothScrolling: configurationService.getValue("workbench.list.smoothScrolling"),
        multipleSelectionSupport: false,
        findWidgetEnabled: false,
        renderIndentGuides: "none" /* None */,
        transformOptimization: false
        // Disable transform optimization #177470
      },
      instantiationService,
      contextKeyService,
      listService,
      configurationService
    );
    this.getHTMLElement().classList.add("settings-editor-tree");
    this.style(getListStyles({
      listBackground: editorBackground,
      listActiveSelectionBackground: editorBackground,
      listActiveSelectionForeground: foreground,
      listFocusAndSelectionBackground: editorBackground,
      listFocusAndSelectionForeground: foreground,
      listFocusBackground: editorBackground,
      listFocusForeground: foreground,
      listHoverForeground: foreground,
      listHoverBackground: editorBackground,
      listHoverOutline: editorBackground,
      listFocusOutline: editorBackground,
      listInactiveSelectionBackground: editorBackground,
      listInactiveSelectionForeground: foreground,
      listInactiveFocusBackground: editorBackground,
      listInactiveFocusOutline: editorBackground,
      treeIndentGuidesStroke: void 0,
      treeInactiveIndentGuidesStroke: void 0
    }));
    this.disposables.add(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("workbench.list.smoothScrolling")) {
        this.updateOptions({
          smoothScrolling: configurationService.getValue("workbench.list.smoothScrolling")
        });
      }
    }));
  }
  createModel(user, options3) {
    return new NonCollapsibleObjectTreeModel(user, options3);
  }
};

SettingsTree = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IListService),
  __decorateParam(5, IWorkbenchConfigurationService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IUserDataProfilesService)
], SettingsTree);

var CopySettingIdAction = class extends Action {
  constructor(clipboardService) {
    super(CopySettingIdAction.ID, CopySettingIdAction.LABEL);
    this.clipboardService = clipboardService;
  }
  static {
    this.ID = "settings.copySettingId";
  }
  static {
    this.LABEL = localize(18329, null);
  }
  async run(context2) {
    if (context2) {
      await this.clipboardService.writeText(context2.setting.key);
    }
    return Promise.resolve(void 0);
  }
};

CopySettingIdAction = __decorateClass([
  __decorateParam(0, IClipboardService)
], CopySettingIdAction);

var CopySettingAsJSONAction = class extends Action {
  constructor(clipboardService) {
    super(CopySettingAsJSONAction.ID, CopySettingAsJSONAction.LABEL);
    this.clipboardService = clipboardService;
  }
  static {
    this.ID = "settings.copySettingAsJSON";
  }
  static {
    this.LABEL = localize(18327, null);
  }
  async run(context2) {
    if (context2) {
      const jsonResult = `"${context2.setting.key}": ${JSON.stringify(context2.value, void 0, "  ")}`;
      await this.clipboardService.writeText(jsonResult);
    }
    return Promise.resolve(void 0);
  }
};

CopySettingAsJSONAction = __decorateClass([
  __decorateParam(0, IClipboardService)
], CopySettingAsJSONAction);

var CopySettingAsURLAction = class extends Action {
  constructor(clipboardService, productService) {
    super(CopySettingAsURLAction.ID, CopySettingAsURLAction.LABEL);
    this.clipboardService = clipboardService;
    this.productService = productService;
  }
  static {
    this.ID = "settings.copySettingAsURL";
  }
  static {
    this.LABEL = localize(18328, null);
  }
  async run(context2) {
    if (context2) {
      const settingKey = context2.setting.key;
      const product2 = this.productService.urlProtocol;
      const uri5 = URI.from({ scheme: product2, authority: SETTINGS_AUTHORITY, path: `/${settingKey}` }, true);
      await this.clipboardService.writeText(uri5.toString());
    }
    return Promise.resolve(void 0);
  }
};

CopySettingAsURLAction = __decorateClass([
  __decorateParam(0, IClipboardService),
  __decorateParam(1, IProductService)
], CopySettingAsURLAction);

var SyncSettingAction = class extends Action {
  constructor(setting, configService) {
    super(SyncSettingAction.ID, SyncSettingAction.LABEL);
    this.setting = setting;
    this.configService = configService;
    this._register(Event2.filter(configService.onDidChangeConfiguration, (e) => e.affectsConfiguration("settingsSync.ignoredSettings"))(() => this.update()));
    this.update();
  }
  static {
    this.ID = "settings.stopSyncingSetting";
  }
  static {
    this.LABEL = localize(18342, null);
  }
  async update() {
    const ignoredSettings = getIgnoredSettings2(getDefaultIgnoredSettings(), this.configService);
    this.checked = !ignoredSettings.includes(this.setting.key);
  }
  async run() {
    let currentValue = [...this.configService.getValue("settingsSync.ignoredSettings")];
    currentValue = currentValue.filter((v2) => v2 !== this.setting.key && v2 !== `-${this.setting.key}`);
    const defaultIgnoredSettings = getDefaultIgnoredSettings();
    const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
    const askedToSync = !this.checked;
    if (askedToSync && isDefaultIgnored) {
      currentValue.push(`-${this.setting.key}`);
    }
    if (!askedToSync && !isDefaultIgnored) {
      currentValue.push(this.setting.key);
    }
    this.configService.updateValue("settingsSync.ignoredSettings", currentValue.length ? currentValue : void 0, 2 /* USER */);
    return Promise.resolve(void 0);
  }
};

SyncSettingAction = __decorateClass([
  __decorateParam(1, IConfigurationService)
], SyncSettingAction);

var ApplySettingToAllProfilesAction = class extends Action {
  constructor(setting, configService) {
    super(ApplySettingToAllProfilesAction.ID, ApplySettingToAllProfilesAction.LABEL);
    this.setting = setting;
    this.configService = configService;
    this._register(Event2.filter(configService.onDidChangeConfiguration, (e) => e.affectsConfiguration(APPLY_ALL_PROFILES_SETTING))(() => this.update()));
    this.update();
  }
  static {
    this.ID = "settings.applyToAllProfiles";
  }
  static {
    this.LABEL = localize(18326, null);
  }
  update() {
    const allProfilesSettings = this.configService.getValue(APPLY_ALL_PROFILES_SETTING);
    this.checked = allProfilesSettings.includes(this.setting.key);
  }
  async run() {
    const value2 = this.configService.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
    if (this.checked) {
      const idx = value2.indexOf(this.setting.key);
      if (idx !== -1) {
        value2.splice(idx, 1);
      }
    } else {
      value2.push(this.setting.key);
    }
    const newValue = distinct(value2);
    if (this.checked) {
      await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).application?.value, 3 /* USER_LOCAL */);
      await this.configService.updateValue(APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : void 0, 3 /* USER_LOCAL */);
    } else {
      await this.configService.updateValue(APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : void 0, 3 /* USER_LOCAL */);
      await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).userLocal?.value, 3 /* USER_LOCAL */);
    }
  }
};

ApplySettingToAllProfilesAction = __decorateClass([
  __decorateParam(1, IWorkbenchConfigurationService)
], ApplySettingToAllProfilesAction);
export { getIncludeExcludeDisplayValue, areAllPropertiesDefined, getEnumOptionsFromSchema, getObjectValueType, getObjectEntryValueDisplayValue, getObjectDisplayValue, getBoolObjectDisplayValue, createArraySuggester, createObjectKeySuggester, createObjectValueSuggester, isNonNullableNumericType, parseNumericObjectValues, getListDisplayValue, getShowAddButtonList, resolveSettingsTree, resolveConfiguredUntrustedSettings, createTocTreeForExtensionSettings, _resolveSettingsTree, sortSettings, getMatchingSettings, createSettingMatchRegExp2, settingMatches, getFlatSettings, removeChildrenFromTabOrder, addChildrenToTabOrder, renderValidations, renderArrayValidations, cleanRenderedMarkdown, fixSettingLinks2, escapeInvisibleChars2, $27, multiGroupTocSettings, settingPatternCache, SETTINGS_TEXT_TEMPLATE_ID, SETTINGS_MULTILINE_TEXT_TEMPLATE_ID, SETTINGS_NUMBER_TEMPLATE_ID, SETTINGS_ENUM_TEMPLATE_ID, SETTINGS_BOOL_TEMPLATE_ID, SETTINGS_ARRAY_TEMPLATE_ID, SETTINGS_EXCLUDE_TEMPLATE_ID, SETTINGS_INCLUDE_TEMPLATE_ID, SETTINGS_OBJECT_TEMPLATE_ID, SETTINGS_BOOL_OBJECT_TEMPLATE_ID, SETTINGS_COMPLEX_TEMPLATE_ID, SETTINGS_COMPLEX_OBJECT_TEMPLATE_ID, SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID, SETTINGS_ELEMENT_TEMPLATE_ID, SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID, AbstractSettingRenderer, SettingGroupRenderer, SettingNewExtensionsRenderer, SettingComplexRenderer, SettingComplexObjectRenderer, SettingArrayRenderer, AbstractSettingObjectRenderer, SettingObjectRenderer, SettingBoolObjectRenderer, SettingIncludeExcludeRenderer, SettingExcludeRenderer, SettingIncludeRenderer, settingsInputBoxStyles, AbstractSettingTextRenderer, SettingTextRenderer, SettingMultilineTextRenderer, SettingEnumRenderer, settingsNumberInputBoxStyles, SettingNumberRenderer, SettingBoolRenderer, SettingsExtensionToggleRenderer, SettingTreeRenderers, SettingsTreeFilter, SettingsTreeDelegate, NonCollapsibleObjectTreeModel, SettingsTreeAccessibilityProvider, SettingsTree, CopySettingIdAction, CopySettingAsJSONAction, CopySettingAsURLAction, SyncSettingAction, ApplySettingToAllProfilesAction };
