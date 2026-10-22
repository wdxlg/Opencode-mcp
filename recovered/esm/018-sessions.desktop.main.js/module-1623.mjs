// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/themeConfiguration.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { isWeb } from "./module-0014.mjs";
import { ThemeSettingDefaults } from "./module-0917.mjs";
import { workbenchColorsSchemaId } from "./module-0226.mjs";
import { textmateColorGroupSchemaId, textmateColorsSchemaId } from "./module-1621.mjs";
import { tokenStylingSchemaId } from "./module-0883.mjs";
import { isUndefined } from "./module-0010.mjs";


// src/vs/workbench/services/themes/common/themeConfiguration.ts
var configurationRegistry8 = Registry.as(Extensions4.Configuration);

var colorThemeSettingEnum = [];

var colorThemeSettingEnumItemLabels = [];

var colorThemeSettingEnumDescriptions = [];

function formatSettingAsLink(str) {
  return `\`#${str}#\``;
}

var COLOR_THEME_CONFIGURATION_SETTINGS_TAG = "colorThemeConfiguration";

var colorThemeSettingSchema = {
  type: "string",
  markdownDescription: localize(23535, null, formatSettingAsLink("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */)),
  default: isWeb ? ThemeSettingDefaults.COLOR_THEME_LIGHT : ThemeSettingDefaults.COLOR_THEME_DARK,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG],
  enum: colorThemeSettingEnum,
  enumDescriptions: colorThemeSettingEnumDescriptions,
  enumItemLabels: colorThemeSettingEnumItemLabels,
  errorMessage: localize(23536, null)
};

var preferredDarkThemeSettingSchema = {
  type: "string",
  //
  markdownDescription: localize(23558, null, formatSettingAsLink("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */)),
  default: ThemeSettingDefaults.COLOR_THEME_DARK,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG],
  enum: colorThemeSettingEnum,
  enumDescriptions: colorThemeSettingEnumDescriptions,
  enumItemLabels: colorThemeSettingEnumItemLabels,
  errorMessage: localize(23536, null)
};

var preferredLightThemeSettingSchema = {
  type: "string",
  markdownDescription: localize(23561, null, formatSettingAsLink("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */)),
  default: ThemeSettingDefaults.COLOR_THEME_LIGHT,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG],
  enum: colorThemeSettingEnum,
  enumDescriptions: colorThemeSettingEnumDescriptions,
  enumItemLabels: colorThemeSettingEnumItemLabels,
  errorMessage: localize(23536, null)
};

var preferredHCDarkThemeSettingSchema = {
  type: "string",
  markdownDescription: localize(23559, null, formatSettingAsLink("window.autoDetectHighContrast" /* DETECT_HC */)),
  default: ThemeSettingDefaults.COLOR_THEME_HC_DARK,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG],
  enum: colorThemeSettingEnum,
  enumDescriptions: colorThemeSettingEnumDescriptions,
  enumItemLabels: colorThemeSettingEnumItemLabels,
  errorMessage: localize(23536, null)
};

var preferredHCLightThemeSettingSchema = {
  type: "string",
  markdownDescription: localize(23560, null, formatSettingAsLink("window.autoDetectHighContrast" /* DETECT_HC */)),
  default: ThemeSettingDefaults.COLOR_THEME_HC_LIGHT,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG],
  enum: colorThemeSettingEnum,
  enumDescriptions: colorThemeSettingEnumDescriptions,
  enumItemLabels: colorThemeSettingEnumItemLabels,
  errorMessage: localize(23536, null)
};

var detectColorSchemeSettingSchema = {
  type: "boolean",
  markdownDescription: localize(23539, null, formatSettingAsLink("workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */), formatSettingAsLink("workbench.preferredLightColorTheme" /* PREFERRED_LIGHT_THEME */)),
  default: false,
  ...isWeb ? { agentsWindow: { default: true } } : {},
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG]
};

var colorCustomizationsSchema = {
  type: "object",
  description: localize(23565, null),
  allOf: [{ $ref: workbenchColorsSchemaId }],
  default: {},
  defaultSnippets: [{
    body: {}
  }]
};

var fileIconThemeSettingSchema = {
  type: ["string", "null"],
  default: ThemeSettingDefaults.FILE_ICON_THEME,
  description: localize(23554, null),
  enum: [null],
  enumItemLabels: [localize(23557, null)],
  enumDescriptions: [localize(23556, null)],
  errorMessage: localize(23555, null)
};

var productIconThemeSettingSchema = {
  type: ["string", "null"],
  default: ThemeSettingDefaults.PRODUCT_ICON_THEME,
  description: localize(23562, null),
  enum: [ThemeSettingDefaults.PRODUCT_ICON_THEME],
  enumItemLabels: [localize(23538, null)],
  enumDescriptions: [localize(23537, null)],
  errorMessage: localize(23563, null)
};

var detectHCSchemeSettingSchema = {
  type: "boolean",
  default: true,
  markdownDescription: localize(23534, null, formatSettingAsLink("workbench.preferredHighContrastColorTheme" /* PREFERRED_HC_DARK_THEME */), formatSettingAsLink("workbench.preferredHighContrastLightColorTheme" /* PREFERRED_HC_LIGHT_THEME */)),
  scope: 1 /* APPLICATION */,
  tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG]
};

var themeSettingsConfiguration = {
  id: "workbench",
  order: 7.1,
  type: "object",
  properties: {
    ["workbench.colorTheme" /* COLOR_THEME */]: colorThemeSettingSchema,
    ["workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */]: preferredDarkThemeSettingSchema,
    ["workbench.preferredLightColorTheme" /* PREFERRED_LIGHT_THEME */]: preferredLightThemeSettingSchema,
    ["workbench.preferredHighContrastColorTheme" /* PREFERRED_HC_DARK_THEME */]: preferredHCDarkThemeSettingSchema,
    ["workbench.preferredHighContrastLightColorTheme" /* PREFERRED_HC_LIGHT_THEME */]: preferredHCLightThemeSettingSchema,
    ["workbench.iconTheme" /* FILE_ICON_THEME */]: fileIconThemeSettingSchema,
    ["workbench.colorCustomizations" /* COLOR_CUSTOMIZATIONS */]: colorCustomizationsSchema,
    ["workbench.productIconTheme" /* PRODUCT_ICON_THEME */]: productIconThemeSettingSchema
  }
};

configurationRegistry8.registerConfiguration(themeSettingsConfiguration);

var themeSettingsWindowConfiguration = {
  id: "window",
  order: 8.1,
  type: "object",
  properties: {
    ["window.autoDetectHighContrast" /* DETECT_HC */]: detectHCSchemeSettingSchema,
    ["window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */]: detectColorSchemeSettingSchema
  }
};

configurationRegistry8.registerConfiguration(themeSettingsWindowConfiguration);

function tokenGroupSettings(description) {
  return {
    description,
    $ref: textmateColorGroupSchemaId
  };
}

var themeSpecificSettingKey = "^\\[[^\\]]*(\\]\\s*\\[[^\\]]*)*\\]$";

var tokenColorSchema = {
  type: "object",
  properties: {
    comments: tokenGroupSettings(localize(23541, null)),
    strings: tokenGroupSettings(localize(23550, null)),
    keywords: tokenGroupSettings(localize(23543, null)),
    numbers: tokenGroupSettings(localize(23544, null)),
    types: tokenGroupSettings(localize(23552, null)),
    functions: tokenGroupSettings(localize(23542, null)),
    variables: tokenGroupSettings(localize(23553, null)),
    textMateRules: {
      description: localize(23551, null),
      $ref: textmateColorsSchemaId
    },
    semanticHighlighting: {
      description: localize(23545, null),
      deprecationMessage: localize(23546, null),
      markdownDeprecationMessage: localize(23547, null, formatSettingAsLink("editor.semanticTokenColorCustomizations")),
      type: "boolean"
    }
  },
  additionalProperties: false
};

var tokenColorCustomizationSchema = {
  description: localize(23540, null),
  default: {},
  allOf: [{ ...tokenColorSchema, patternProperties: { "^\\[": {} } }]
};

var semanticTokenColorSchema = {
  type: "object",
  properties: {
    enabled: {
      type: "boolean",
      description: localize(23548, null),
      suggestSortText: "0_enabled"
    },
    rules: {
      $ref: tokenStylingSchemaId,
      description: localize(23549, null),
      suggestSortText: "0_rules"
    }
  },
  additionalProperties: false
};

var semanticTokenColorCustomizationSchema = {
  description: localize(23564, null),
  default: {},
  allOf: [{ ...semanticTokenColorSchema, patternProperties: { "^\\[": {} } }]
};

var tokenColorCustomizationConfiguration = {
  id: "editor",
  order: 7.2,
  type: "object",
  properties: {
    ["editor.tokenColorCustomizations" /* TOKEN_COLOR_CUSTOMIZATIONS */]: tokenColorCustomizationSchema,
    ["editor.semanticTokenColorCustomizations" /* SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS */]: semanticTokenColorCustomizationSchema
  }
};

configurationRegistry8.registerConfiguration(tokenColorCustomizationConfiguration);

function updateColorThemeConfigurationSchemas(themes) {
  themes.sort((a, b) => a.label.localeCompare(b.label));
  colorThemeSettingEnum.splice(0, colorThemeSettingEnum.length, ...themes.map((t2) => t2.settingsId));
  colorThemeSettingEnumDescriptions.splice(0, colorThemeSettingEnumDescriptions.length, ...themes.map((t2) => t2.description || ""));
  colorThemeSettingEnumItemLabels.splice(0, colorThemeSettingEnumItemLabels.length, ...themes.map((t2) => t2.label || ""));
  const themeSpecificWorkbenchColors = { properties: {} };
  const themeSpecificTokenColors = { properties: {} };
  const themeSpecificSemanticTokenColors = { properties: {} };
  const workbenchColors = { $ref: workbenchColorsSchemaId, additionalProperties: false };
  const tokenColors = { properties: tokenColorSchema.properties, additionalProperties: false };
  for (const t2 of themes) {
    const themeId = `[${t2.settingsId}]`;
    themeSpecificWorkbenchColors.properties[themeId] = workbenchColors;
    themeSpecificTokenColors.properties[themeId] = tokenColors;
    themeSpecificSemanticTokenColors.properties[themeId] = semanticTokenColorSchema;
  }
  themeSpecificWorkbenchColors.patternProperties = { [themeSpecificSettingKey]: workbenchColors };
  themeSpecificTokenColors.patternProperties = { [themeSpecificSettingKey]: tokenColors };
  themeSpecificSemanticTokenColors.patternProperties = { [themeSpecificSettingKey]: semanticTokenColorSchema };
  colorCustomizationsSchema.allOf[1] = themeSpecificWorkbenchColors;
  tokenColorCustomizationSchema.allOf[1] = themeSpecificTokenColors;
  semanticTokenColorCustomizationSchema.allOf[1] = themeSpecificSemanticTokenColors;
  configurationRegistry8.notifyConfigurationSchemaUpdated(themeSettingsConfiguration, tokenColorCustomizationConfiguration);
}

function updateFileIconThemeConfigurationSchemas(themes) {
  fileIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.settingsId));
  fileIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.label));
  fileIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.description || ""));
  configurationRegistry8.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
}

function updateProductIconThemeConfigurationSchemas(themes) {
  productIconThemeSettingSchema.enum.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.settingsId));
  productIconThemeSettingSchema.enumItemLabels.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.label));
  productIconThemeSettingSchema.enumDescriptions.splice(1, Number.MAX_VALUE, ...themes.map((t2) => t2.description || ""));
  configurationRegistry8.notifyConfigurationSchemaUpdated(themeSettingsConfiguration);
}

var colorSchemeToPreferred = {
  ["dark" /* DARK */]: "workbench.preferredDarkColorTheme" /* PREFERRED_DARK_THEME */,
  ["light" /* LIGHT */]: "workbench.preferredLightColorTheme" /* PREFERRED_LIGHT_THEME */,
  ["hcDark" /* HIGH_CONTRAST_DARK */]: "workbench.preferredHighContrastColorTheme" /* PREFERRED_HC_DARK_THEME */,
  ["hcLight" /* HIGH_CONTRAST_LIGHT */]: "workbench.preferredHighContrastLightColorTheme" /* PREFERRED_HC_LIGHT_THEME */
};

var ThemeConfiguration = class {
  constructor(configurationService, hostColorService) {
    this.configurationService = configurationService;
    this.hostColorService = hostColorService;
  }
  get colorTheme() {
    return this.configurationService.getValue(this.getColorThemeSettingId());
  }
  get fileIconTheme() {
    return this.configurationService.getValue("workbench.iconTheme" /* FILE_ICON_THEME */);
  }
  get productIconTheme() {
    return this.configurationService.getValue("workbench.productIconTheme" /* PRODUCT_ICON_THEME */);
  }
  get colorCustomizations() {
    return this.configurationService.getValue("workbench.colorCustomizations" /* COLOR_CUSTOMIZATIONS */) || {};
  }
  get tokenColorCustomizations() {
    const tokenColorCustomization = this.configurationService.getValue("editor.tokenColorCustomizations" /* TOKEN_COLOR_CUSTOMIZATIONS */) || {};
    const textMateRules = tokenColorCustomization.textMateRules;
    if (!textMateRules) {
      return tokenColorCustomization;
    }
    const updatedRules = textMateRules.map((rule) => {
      const fontSize = rule.settings?.fontSize;
      const lineHeight = rule.settings?.lineHeight;
      if (fontSize !== void 0 && lineHeight === void 0) {
        return {
          ...rule,
          settings: {
            ...rule.settings,
            lineHeight: fontSize
          }
        };
      }
      return rule;
    });
    const updatedTokenColorCustomization = {
      ...tokenColorCustomization,
      textMateRules: updatedRules
    };
    return updatedTokenColorCustomization;
  }
  get semanticTokenColorCustomizations() {
    return this.configurationService.getValue("editor.semanticTokenColorCustomizations" /* SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS */);
  }
  getPreferredColorScheme() {
    if (this.configurationService.getValue("window.autoDetectHighContrast" /* DETECT_HC */) && this.hostColorService.highContrast) {
      return this.hostColorService.dark ? "hcDark" /* HIGH_CONTRAST_DARK */ : "hcLight" /* HIGH_CONTRAST_LIGHT */;
    }
    if (this.isDetectingColorScheme()) {
      return this.hostColorService.dark ? "dark" /* DARK */ : "light" /* LIGHT */;
    }
    return void 0;
  }
  isDetectingHighContrast() {
    return this.configurationService.getValue("window.autoDetectHighContrast" /* DETECT_HC */);
  }
  isDetectingColorScheme() {
    return this.configurationService.getValue("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */);
  }
  isPreferredColorSchemeChange(previous) {
    const darkChanged = previous.dark !== this.hostColorService.dark;
    if (this.isDetectingColorScheme() && darkChanged) {
      return true;
    }
    if (this.isDetectingHighContrast()) {
      return previous.highContrast !== this.hostColorService.highContrast || this.hostColorService.highContrast && darkChanged;
    }
    return false;
  }
  getColorThemeSettingId() {
    const preferredScheme = this.getPreferredColorScheme();
    return preferredScheme ? colorSchemeToPreferred[preferredScheme] : "workbench.colorTheme" /* COLOR_THEME */;
  }
  async setColorTheme(theme, settingsTarget) {
    await this.writeConfiguration(this.getColorThemeSettingId(), theme.settingsId, settingsTarget);
    return theme;
  }
  async setFileIconTheme(theme, settingsTarget) {
    await this.writeConfiguration("workbench.iconTheme" /* FILE_ICON_THEME */, theme.settingsId, settingsTarget);
    return theme;
  }
  async setProductIconTheme(theme, settingsTarget) {
    await this.writeConfiguration("workbench.productIconTheme" /* PRODUCT_ICON_THEME */, theme.settingsId, settingsTarget);
    return theme;
  }
  isDefaultColorTheme() {
    const settings = this.configurationService.inspect(this.getColorThemeSettingId());
    return settings && settings.default?.value === settings.value;
  }
  findAutoConfigurationTarget(key3) {
    const settings = this.configurationService.inspect(key3);
    if (!isUndefined(settings.workspaceFolderValue)) {
      return 6 /* WORKSPACE_FOLDER */;
    } else if (!isUndefined(settings.workspaceValue)) {
      return 5 /* WORKSPACE */;
    } else if (!isUndefined(settings.userRemoteValue)) {
      return 4 /* USER_REMOTE */;
    }
    return 2 /* USER */;
  }
  async writeConfiguration(key3, value2, settingsTarget) {
    if (settingsTarget === void 0 || settingsTarget === "preview") {
      return;
    }
    const settings = this.configurationService.inspect(key3);
    if (settingsTarget === "auto") {
      return this.configurationService.updateValue(key3, value2);
    }
    if (settingsTarget === 2 /* USER */) {
      if (value2 === settings.userValue) {
        return Promise.resolve(void 0);
      } else if (value2 === settings.defaultValue) {
        if (isUndefined(settings.userValue)) {
          return Promise.resolve(void 0);
        }
        value2 = void 0;
      }
    } else if (settingsTarget === 5 /* WORKSPACE */ || settingsTarget === 6 /* WORKSPACE_FOLDER */ || settingsTarget === 4 /* USER_REMOTE */) {
      if (value2 === settings.value) {
        return Promise.resolve(void 0);
      }
    }
    return this.configurationService.updateValue(key3, value2, settingsTarget);
  }
};
export { formatSettingAsLink, tokenGroupSettings, updateColorThemeConfigurationSchemas, updateFileIconThemeConfigurationSchemas, updateProductIconThemeConfigurationSchemas, configurationRegistry8, colorThemeSettingEnum, colorThemeSettingEnumItemLabels, colorThemeSettingEnumDescriptions, COLOR_THEME_CONFIGURATION_SETTINGS_TAG, colorThemeSettingSchema, preferredDarkThemeSettingSchema, preferredLightThemeSettingSchema, preferredHCDarkThemeSettingSchema, preferredHCLightThemeSettingSchema, detectColorSchemeSettingSchema, colorCustomizationsSchema, fileIconThemeSettingSchema, productIconThemeSettingSchema, detectHCSchemeSettingSchema, themeSettingsConfiguration, themeSettingsWindowConfiguration, themeSpecificSettingKey, tokenColorSchema, tokenColorCustomizationSchema, semanticTokenColorSchema, semanticTokenColorCustomizationSchema, tokenColorCustomizationConfiguration, colorSchemeToPreferred, ThemeConfiguration };
