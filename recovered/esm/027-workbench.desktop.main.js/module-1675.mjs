// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/common/colorThemeData.ts
import { Registry } from "./module-0090.mjs";
import { DEFAULT_COLOR_CONFIG_VALUE, Extensions6 } from "./module-0226.mjs";
import { SemanticTokenRule, TokenStyle, getTokenClassificationRegistry, parseClassifierString } from "./module-0881.mjs";
import { editorBackground, editorForeground } from "./module-0229.mjs";
import { Color } from "./module-0197.mjs";
import { isBoolean, isObject, isString } from "./module-0010.mjs";
import { ExtensionData, THEME_SCOPE_CLOSE_PAREN, THEME_SCOPE_OPEN_PAREN, THEME_SCOPE_WILDCARD, themeScopeRegex } from "./module-0916.mjs";
import { getThemeTypeSelector } from "./module-0287.mjs";
import { basename } from "./module-0026.mjs";
import { dirname2, extname2, joinPath } from "./module-0034.mjs";
import { getNodeType, parse5 } from "./module-0883.mjs";
import { localize } from "./module-0001.mjs";
import { getParseErrorMessage } from "./module-0888.mjs";
import { convertSettings } from "./module-1672.mjs";
import { parse11 } from "./module-1673.mjs";
import { createMatchers } from "./module-1674.mjs";
import { toStandardTokenType } from "./module-0401.mjs";


// src/vs/workbench/services/themes/common/colorThemeData.ts
var colorRegistry4 = Registry.as(Extensions6.ColorContribution);

var tokenClassificationRegistry3 = getTokenClassificationRegistry();

var tokenGroupToScopesMap = {
  comments: ["comment", "punctuation.definition.comment"],
  strings: ["string", "meta.embedded.assembly"],
  keywords: ["keyword - keyword.operator", "keyword.control", "storage", "storage.type"],
  numbers: ["constant.numeric"],
  types: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
  functions: ["entity.name.function", "support.function"],
  variables: ["variable", "entity.name.variable"]
};

var ColorThemeData = class _ColorThemeData {
  // created on demand
  constructor(id2, label3, settingsId) {
    this.themeTokenColors = [];
    this.customTokenColors = [];
    this.colorMap = {};
    this.customColorMap = {};
    this.semanticTokenRules = [];
    this.customSemanticTokenRules = [];
    this.textMateThemingRules = void 0;
    // created on demand
    this.tokenColorIndex = void 0;
    // created on demand
    this.tokenFontIndex = void 0;
    this.id = id2;
    this.label = label3;
    this.settingsId = settingsId;
    this.isLoaded = false;
  }
  static {
    this.STORAGE_KEY = "colorThemeData";
  }
  get semanticHighlighting() {
    if (this.customSemanticHighlighting !== void 0) {
      return this.customSemanticHighlighting;
    }
    if (this.customSemanticHighlightingDeprecated !== void 0) {
      return this.customSemanticHighlightingDeprecated;
    }
    return !!this.themeSemanticHighlighting;
  }
  get tokenColors() {
    if (!this.textMateThemingRules) {
      let addRule = function(rule) {
        if (rule.scope && rule.settings) {
          if (rule.scope === "token.info-token") {
            hasDefaultTokens = true;
          }
          const ruleSettings = rule.settings;
          result.push({
            scope: rule.scope,
            settings: {
              foreground: normalizeColor(ruleSettings.foreground),
              background: normalizeColor(ruleSettings.background),
              fontStyle: ruleSettings.fontStyle,
              fontSize: ruleSettings.fontSize,
              fontFamily: ruleSettings.fontFamily,
              lineHeight: ruleSettings.lineHeight
            }
          });
        }
      };
      const result = [];
      const foreground2 = this.getColor(editorForeground) || this.getDefault(editorForeground);
      const background = this.getColor(editorBackground) || this.getDefault(editorBackground);
      result.push({
        settings: {
          foreground: normalizeColor(foreground2),
          background: normalizeColor(background)
        }
      });
      let hasDefaultTokens = false;
      this.themeTokenColors.forEach(addRule);
      this.customTokenColors.forEach(addRule);
      if (!hasDefaultTokens) {
        defaultThemeColors[this.type].forEach(addRule);
      }
      this.textMateThemingRules = result;
    }
    return this.textMateThemingRules;
  }
  getColor(colorId, useDefault) {
    const customColor = this.customColorMap[colorId];
    if (customColor instanceof Color) {
      return customColor;
    }
    if (customColor === void 0) {
      const color2 = this.colorMap[colorId];
      if (color2 !== void 0) {
        return color2;
      }
    }
    if (useDefault !== false) {
      return this.getDefault(colorId);
    }
    return void 0;
  }
  getTokenStyle(type, modifiers, language2, useDefault = true, definitions3 = {}) {
    const result = {
      foreground: void 0,
      bold: void 0,
      underline: void 0,
      strikethrough: void 0,
      italic: void 0
    };
    const score3 = {
      foreground: -1,
      bold: -1,
      underline: -1,
      strikethrough: -1,
      italic: -1,
      fontFamily: -1,
      fontSize: -1,
      lineHeight: -1
    };
    function _processStyle(matchScore, style, definition) {
      if (style.foreground && score3.foreground <= matchScore) {
        score3.foreground = matchScore;
        result.foreground = style.foreground;
        definitions3.foreground = definition;
      }
      for (const p of ["bold", "underline", "strikethrough", "italic"]) {
        const property = p;
        const info = style[property];
        if (info !== void 0) {
          if (score3[property] <= matchScore) {
            score3[property] = matchScore;
            result[property] = info;
            definitions3[property] = definition;
          }
        }
      }
    }
    function _processSemanticTokenRule(rule) {
      const matchScore = rule.selector.match(type, modifiers, language2);
      if (matchScore >= 0) {
        _processStyle(matchScore, rule.style, rule);
      }
    }
    this.semanticTokenRules.forEach(_processSemanticTokenRule);
    this.customSemanticTokenRules.forEach(_processSemanticTokenRule);
    let hasUndefinedStyleProperty = false;
    for (const k in score3) {
      const key3 = k;
      if (score3[key3] === -1) {
        hasUndefinedStyleProperty = true;
      } else {
        score3[key3] = Number.MAX_VALUE;
      }
    }
    if (hasUndefinedStyleProperty) {
      for (const rule of tokenClassificationRegistry3.getTokenStylingDefaultRules()) {
        const matchScore = rule.selector.match(type, modifiers, language2);
        if (matchScore >= 0) {
          let style;
          if (rule.defaults.scopesToProbe) {
            style = this.resolveScopes(rule.defaults.scopesToProbe);
            if (style) {
              _processStyle(matchScore, style, rule.defaults.scopesToProbe);
            }
          }
          if (!style && useDefault !== false) {
            const tokenStyleValue = rule.defaults[this.type];
            style = this.resolveTokenStyleValue(tokenStyleValue);
            if (style) {
              _processStyle(matchScore, style, tokenStyleValue);
            }
          }
        }
      }
    }
    return TokenStyle.fromData(result);
  }
  /**
   * @param tokenStyleValue Resolve a tokenStyleValue in the context of a theme
   */
  resolveTokenStyleValue(tokenStyleValue) {
    if (tokenStyleValue === void 0) {
      return void 0;
    } else if (typeof tokenStyleValue === "string") {
      const { type, modifiers, language: language2 } = parseClassifierString(tokenStyleValue, "");
      return this.getTokenStyle(type, modifiers, language2);
    } else if (typeof tokenStyleValue === "object") {
      return tokenStyleValue;
    }
    return void 0;
  }
  getTokenColorIndex() {
    if (!this.tokenColorIndex) {
      const index2 = new TokenColorIndex();
      this.tokenColors.forEach((rule) => {
        index2.add(rule.settings.foreground);
        index2.add(rule.settings.background);
      });
      this.semanticTokenRules.forEach((r2) => index2.add(r2.style.foreground));
      tokenClassificationRegistry3.getTokenStylingDefaultRules().forEach((r2) => {
        const defaultColor2 = r2.defaults[this.type];
        if (defaultColor2 && typeof defaultColor2 === "object") {
          index2.add(defaultColor2.foreground);
        }
      });
      this.customSemanticTokenRules.forEach((r2) => index2.add(r2.style.foreground));
      this.tokenColorIndex = index2;
    }
    return this.tokenColorIndex;
  }
  getTokenFontIndex() {
    if (!this.tokenFontIndex) {
      const index2 = new TokenFontIndex();
      this.tokenColors.forEach((r2) => index2.add(r2.settings.fontFamily, r2.settings.fontSize, r2.settings.lineHeight));
      this.tokenFontIndex = index2;
    }
    return this.tokenFontIndex;
  }
  get tokenColorMap() {
    return this.getTokenColorIndex().asArray();
  }
  get tokenFontMap() {
    return this.getTokenFontIndex().asArray();
  }
  getTokenStyleMetadata(typeWithLanguage, modifiers, defaultLanguage, useDefault = true, definitions3 = {}) {
    const { type, language: language2 } = parseClassifierString(typeWithLanguage, defaultLanguage);
    const style = this.getTokenStyle(type, modifiers, language2, useDefault, definitions3);
    if (!style) {
      return void 0;
    }
    return {
      foreground: this.getTokenColorIndex().get(style.foreground),
      bold: style.bold,
      underline: style.underline,
      strikethrough: style.strikethrough,
      italic: style.italic
    };
  }
  getTokenStylingRuleScope(rule) {
    if (this.customSemanticTokenRules.indexOf(rule) !== -1) {
      return "setting";
    }
    if (this.semanticTokenRules.indexOf(rule) !== -1) {
      return "theme";
    }
    return void 0;
  }
  getDefault(colorId) {
    return colorRegistry4.resolveDefaultColor(colorId, this);
  }
  resolveScopes(scopes, definitions3) {
    if (!this.themeTokenScopeMatchers) {
      this.themeTokenScopeMatchers = this.themeTokenColors.map(getScopeMatcher);
    }
    if (!this.customTokenScopeMatchers) {
      this.customTokenScopeMatchers = this.customTokenColors.map(getScopeMatcher);
    }
    for (const scope of scopes) {
      let findTokenStyleForScopeInScopes = function(scopeMatchers, themingRules) {
        for (let i2 = 0; i2 < scopeMatchers.length; i2++) {
          const score3 = scopeMatchers[i2](scope);
          if (score3 >= 0) {
            const themingRule = themingRules[i2];
            const settings = themingRules[i2].settings;
            if (score3 >= foregroundScore && settings.foreground) {
              foreground2 = settings.foreground;
              foregroundScore = score3;
              foregroundThemingRule = themingRule;
            }
            if (score3 >= fontStyleScore && isString(settings.fontStyle)) {
              fontStyle = settings.fontStyle;
              fontStyleScore = score3;
              fontStyleThemingRule = themingRule;
            }
          }
        }
      };
      let foreground2 = void 0;
      let fontStyle = void 0;
      let foregroundScore = -1;
      let fontStyleScore = -1;
      let fontStyleThemingRule = void 0;
      let foregroundThemingRule = void 0;
      findTokenStyleForScopeInScopes(this.themeTokenScopeMatchers, this.themeTokenColors);
      findTokenStyleForScopeInScopes(this.customTokenScopeMatchers, this.customTokenColors);
      if (foreground2 !== void 0 || fontStyle !== void 0) {
        if (definitions3) {
          definitions3.foreground = foregroundThemingRule;
          definitions3.bold = definitions3.italic = definitions3.underline = definitions3.strikethrough = fontStyleThemingRule;
          definitions3.scope = scope;
        }
        return TokenStyle.fromSettings(foreground2, fontStyle);
      }
    }
    return void 0;
  }
  defines(colorId) {
    const customColor = this.customColorMap[colorId];
    if (customColor instanceof Color) {
      return true;
    }
    return customColor === void 0 && this.colorMap.hasOwnProperty(colorId);
  }
  getColorCustomization(colorId) {
    const customColor = this.customColorMap[colorId];
    return customColor instanceof Color ? customColor : void 0;
  }
  setCustomizations(settings) {
    this.setCustomColors(settings.colorCustomizations);
    this.setCustomTokenColors(settings.tokenColorCustomizations);
    this.setCustomSemanticTokenColors(settings.semanticTokenColorCustomizations);
  }
  setCustomColors(colors) {
    this.customColorMap = {};
    this.overwriteCustomColors(colors);
    const themeSpecificColors = this.getThemeSpecificColors(colors);
    if (isObject(themeSpecificColors)) {
      this.overwriteCustomColors(themeSpecificColors);
    }
    this.tokenColorIndex = void 0;
    this.tokenFontIndex = void 0;
    this.textMateThemingRules = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  overwriteCustomColors(colors) {
    for (const id2 in colors) {
      const colorVal = colors[id2];
      if (colorVal === DEFAULT_COLOR_CONFIG_VALUE) {
        this.customColorMap[id2] = DEFAULT_COLOR_CONFIG_VALUE;
      } else if (typeof colorVal === "string") {
        this.customColorMap[id2] = Color.fromHex(colorVal);
      }
    }
  }
  setCustomTokenColors(customTokenColors) {
    this.customTokenColors = [];
    this.customSemanticHighlightingDeprecated = void 0;
    this.addCustomTokenColors(customTokenColors);
    const themeSpecificTokenColors = this.getThemeSpecificColors(customTokenColors);
    if (isObject(themeSpecificTokenColors)) {
      this.addCustomTokenColors(themeSpecificTokenColors);
    }
    this.tokenColorIndex = void 0;
    this.tokenFontIndex = void 0;
    this.textMateThemingRules = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  setCustomSemanticTokenColors(semanticTokenColors) {
    this.customSemanticTokenRules = [];
    this.customSemanticHighlighting = void 0;
    if (semanticTokenColors) {
      this.customSemanticHighlighting = semanticTokenColors.enabled;
      if (semanticTokenColors.rules) {
        this.readSemanticTokenRules(semanticTokenColors.rules);
      }
      const themeSpecificColors = this.getThemeSpecificColors(semanticTokenColors);
      if (isObject(themeSpecificColors)) {
        if (themeSpecificColors.enabled !== void 0) {
          this.customSemanticHighlighting = themeSpecificColors.enabled;
        }
        if (themeSpecificColors.rules) {
          this.readSemanticTokenRules(themeSpecificColors.rules);
        }
      }
    }
    this.tokenColorIndex = void 0;
    this.tokenFontIndex = void 0;
    this.textMateThemingRules = void 0;
  }
  isThemeScope(key3) {
    return key3.charAt(0) === THEME_SCOPE_OPEN_PAREN && key3.charAt(key3.length - 1) === THEME_SCOPE_CLOSE_PAREN;
  }
  isThemeScopeMatch(themeId) {
    const themeIdFirstChar = themeId.charAt(0);
    const themeIdLastChar = themeId.charAt(themeId.length - 1);
    const themeIdPrefix = themeId.slice(0, -1);
    const themeIdInfix = themeId.slice(1, -1);
    const themeIdSuffix = themeId.slice(1);
    return themeId === this.settingsId || this.settingsId.includes(themeIdInfix) && themeIdFirstChar === THEME_SCOPE_WILDCARD && themeIdLastChar === THEME_SCOPE_WILDCARD || this.settingsId.startsWith(themeIdPrefix) && themeIdLastChar === THEME_SCOPE_WILDCARD || this.settingsId.endsWith(themeIdSuffix) && themeIdFirstChar === THEME_SCOPE_WILDCARD;
  }
  getThemeSpecificColors(colors) {
    let themeSpecificColors;
    for (const key3 in colors) {
      const scopedColors = colors[key3];
      if (this.isThemeScope(key3) && scopedColors instanceof Object && !Array.isArray(scopedColors)) {
        const themeScopeList = key3.match(themeScopeRegex) || [];
        for (const themeScope of themeScopeList) {
          const themeId = themeScope.substring(1, themeScope.length - 1);
          if (this.isThemeScopeMatch(themeId)) {
            if (!themeSpecificColors) {
              themeSpecificColors = {};
            }
            const scopedThemeSpecificColors = scopedColors;
            for (const subkey in scopedThemeSpecificColors) {
              const originalColors = themeSpecificColors[subkey];
              const overrideColors = scopedThemeSpecificColors[subkey];
              if (Array.isArray(originalColors) && Array.isArray(overrideColors)) {
                themeSpecificColors[subkey] = originalColors.concat(overrideColors);
              } else if (overrideColors) {
                themeSpecificColors[subkey] = overrideColors;
              }
            }
          }
        }
      }
    }
    return themeSpecificColors;
  }
  readSemanticTokenRules(tokenStylingRuleSection) {
    for (const key3 in tokenStylingRuleSection) {
      if (!this.isThemeScope(key3)) {
        try {
          const rule = readSemanticTokenRule(key3, tokenStylingRuleSection[key3]);
          if (rule) {
            this.customSemanticTokenRules.push(rule);
          }
        } catch (e) {
        }
      }
    }
  }
  addCustomTokenColors(customTokenColors) {
    for (const tokenGroup in tokenGroupToScopesMap) {
      const group2 = tokenGroup;
      const value2 = customTokenColors[group2];
      if (value2) {
        const settings = typeof value2 === "string" ? { foreground: value2 } : value2;
        const scopes = tokenGroupToScopesMap[group2];
        for (const scope of scopes) {
          this.customTokenColors.push({ scope, settings });
        }
      }
    }
    if (Array.isArray(customTokenColors.textMateRules)) {
      for (const rule of customTokenColors.textMateRules) {
        if (rule.scope && rule.settings) {
          this.customTokenColors.push(rule);
        }
      }
    }
    if (customTokenColors.semanticHighlighting !== void 0) {
      this.customSemanticHighlightingDeprecated = customTokenColors.semanticHighlighting;
    }
  }
  ensureLoaded(extensionResourceLoaderService) {
    return !this.isLoaded ? this.load(extensionResourceLoaderService) : Promise.resolve(void 0);
  }
  reload(extensionResourceLoaderService) {
    return this.load(extensionResourceLoaderService);
  }
  load(extensionResourceLoaderService) {
    if (!this.location) {
      return Promise.resolve(void 0);
    }
    this.themeTokenColors = [];
    this.clearCaches();
    const result = {
      colors: {},
      textMateRules: [],
      semanticTokenRules: [],
      semanticHighlighting: false
    };
    return _loadColorTheme(extensionResourceLoaderService, this.location, result).then((_) => {
      this.isLoaded = true;
      this.semanticTokenRules = result.semanticTokenRules;
      this.colorMap = result.colors;
      this.themeTokenColors = result.textMateRules;
      this.themeSemanticHighlighting = result.semanticHighlighting;
    });
  }
  clearCaches() {
    this.tokenColorIndex = void 0;
    this.tokenFontIndex = void 0;
    this.textMateThemingRules = void 0;
    this.themeTokenScopeMatchers = void 0;
    this.customTokenScopeMatchers = void 0;
  }
  toStorage(storageService) {
    const colorMapData = {};
    for (const key3 in this.colorMap) {
      colorMapData[key3] = Color.Format.CSS.formatHexA(this.colorMap[key3], true);
    }
    const value2 = JSON.stringify({
      id: this.id,
      label: this.label,
      settingsId: this.settingsId,
      themeTokenColors: this.themeTokenColors.map((tc) => ({ settings: tc.settings, scope: tc.scope })),
      // don't persist names
      semanticTokenRules: this.semanticTokenRules.map(SemanticTokenRule.toJSONObject),
      extensionData: ExtensionData.toJSONObject(this.extensionData),
      themeSemanticHighlighting: this.themeSemanticHighlighting,
      colorMap: colorMapData,
      watch: this.watch
    });
    storageService.store(_ColorThemeData.STORAGE_KEY, value2, 0 /* PROFILE */, 0 /* USER */);
  }
  get themeTypeSelector() {
    return this.classNames[0];
  }
  get classNames() {
    return this.id.split(" ");
  }
  get type() {
    switch (this.themeTypeSelector) {
      case "vs" /* VS */:
        return "light" /* LIGHT */;
      case "hc-black" /* HC_BLACK */:
        return "hcDark" /* HIGH_CONTRAST_DARK */;
      case "hc-light" /* HC_LIGHT */:
        return "hcLight" /* HIGH_CONTRAST_LIGHT */;
      default:
        return "dark" /* DARK */;
    }
  }
  // constructors
  static createUnloadedThemeForThemeType(themeType, colorMap) {
    return _ColorThemeData.createUnloadedTheme(getThemeTypeSelector(themeType), colorMap);
  }
  static createUnloadedTheme(id2, colorMap) {
    const themeData = new _ColorThemeData(id2, "", "__" + id2);
    themeData.isLoaded = false;
    themeData.themeTokenColors = [];
    themeData.watch = false;
    if (colorMap) {
      for (const id3 in colorMap) {
        themeData.colorMap[id3] = Color.fromHex(colorMap[id3]);
      }
    }
    return themeData;
  }
  static createLoadedEmptyTheme(id2, settingsId) {
    const themeData = new _ColorThemeData(id2, "", settingsId);
    themeData.isLoaded = true;
    themeData.themeTokenColors = [];
    themeData.watch = false;
    return themeData;
  }
  static fromStorageData(storageService) {
    const input = storageService.get(_ColorThemeData.STORAGE_KEY, 0 /* PROFILE */);
    if (!input) {
      return void 0;
    }
    try {
      const data = JSON.parse(input);
      const theme = new _ColorThemeData("", "", "");
      for (const key3 in data) {
        switch (key3) {
          case "colorMap": {
            const colorMapData = data[key3];
            for (const id2 in colorMapData) {
              theme.colorMap[id2] = Color.fromHex(colorMapData[id2]);
            }
            break;
          }
          case "themeTokenColors":
          case "id":
          case "label":
          case "settingsId":
          case "watch":
          case "themeSemanticHighlighting":
            theme[key3] = data[key3];
            break;
          case "semanticTokenRules": {
            const rulesData = data[key3];
            if (Array.isArray(rulesData)) {
              for (const d of rulesData) {
                const rule = SemanticTokenRule.fromJSONObject(tokenClassificationRegistry3, d);
                if (rule) {
                  theme.semanticTokenRules.push(rule);
                }
              }
            }
            break;
          }
          case "location":
            break;
          case "extensionData":
            theme.extensionData = ExtensionData.fromJSONObject(data.extensionData);
            break;
        }
      }
      if (!theme.id || !theme.settingsId) {
        return void 0;
      }
      return theme;
    } catch (e) {
      return void 0;
    }
  }
  static fromExtensionTheme(theme, colorThemeLocation, extensionData) {
    const baseTheme = theme["uiTheme"] || "vs-dark";
    const themeSelector = toCSSSelector(extensionData.extensionId, theme.path);
    const id2 = `${baseTheme} ${themeSelector}`;
    const label3 = theme.label || basename(theme.path);
    const settingsId = theme.id || label3;
    const themeData = new _ColorThemeData(id2, label3, settingsId);
    themeData.description = theme.description;
    themeData.watch = theme._watch === true;
    themeData.location = colorThemeLocation;
    themeData.extensionData = extensionData;
    themeData.isLoaded = false;
    return themeData;
  }
};

function toCSSSelector(extensionId, path) {
  if (path.startsWith("./")) {
    path = path.substr(2);
  }
  let str = `${extensionId}-${path}`;
  str = str.replace(/[^_a-zA-Z0-9-]/g, "-");
  if (str.charAt(0).match(/[0-9-]/)) {
    str = "_" + str;
  }
  return str;
}

async function _loadColorTheme(extensionResourceLoaderService, themeLocation, result) {
  if (extname2(themeLocation) === ".json") {
    const content2 = await extensionResourceLoaderService.readExtensionResource(themeLocation);
    const errors = [];
    const contentValue = parse5(content2, errors);
    if (errors.length > 0) {
      return Promise.reject(new Error(localize(23454, null, errors.map((e) => getParseErrorMessage(e.error)).join(", "))));
    } else if (getNodeType(contentValue) !== "object") {
      return Promise.reject(new Error(localize(23455, null)));
    }
    if (contentValue.include) {
      await _loadColorTheme(extensionResourceLoaderService, joinPath(dirname2(themeLocation), contentValue.include), result);
    }
    if (Array.isArray(contentValue.settings)) {
      convertSettings(contentValue.settings, result);
      return null;
    }
    result.semanticHighlighting = result.semanticHighlighting || contentValue.semanticHighlighting;
    const colors = contentValue.colors;
    if (colors) {
      if (typeof colors !== "object") {
        return Promise.reject(new Error(localize(23456, null, themeLocation.toString())));
      }
      for (const colorId in colors) {
        const colorVal = colors[colorId];
        if (colorVal === DEFAULT_COLOR_CONFIG_VALUE) {
          delete result.colors[colorId];
        } else if (typeof colorVal === "string") {
          result.colors[colorId] = Color.fromHex(colors[colorId]);
        }
      }
    }
    const tokenColors = contentValue.tokenColors;
    if (tokenColors) {
      if (Array.isArray(tokenColors)) {
        result.textMateRules.push(...tokenColors);
      } else if (typeof tokenColors === "string") {
        await _loadSyntaxTokens(extensionResourceLoaderService, joinPath(dirname2(themeLocation), tokenColors), result);
      } else {
        return Promise.reject(new Error(localize(23458, null, themeLocation.toString())));
      }
    }
    const semanticTokenColors = contentValue.semanticTokenColors;
    if (semanticTokenColors && typeof semanticTokenColors === "object") {
      for (const key3 in semanticTokenColors) {
        try {
          const rule = readSemanticTokenRule(key3, semanticTokenColors[key3]);
          if (rule) {
            result.semanticTokenRules.push(rule);
          }
        } catch (e) {
          return Promise.reject(new Error(localize(23457, null, themeLocation.toString())));
        }
      }
    }
  } else {
    return _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result);
  }
}

function _loadSyntaxTokens(extensionResourceLoaderService, themeLocation, result) {
  return extensionResourceLoaderService.readExtensionResource(themeLocation).then((content2) => {
    try {
      const contentValue = parse11(content2);
      const settings = contentValue.settings;
      if (!Array.isArray(settings)) {
        return Promise.reject(new Error(localize(23459, null)));
      }
      convertSettings(settings, result);
      return Promise.resolve(null);
    } catch (e) {
      return Promise.reject(new Error(localize(23453, null, e.message)));
    }
  }, (error) => {
    return Promise.reject(new Error(localize(23452, null, themeLocation.toString(), error.message)));
  });
}

var defaultThemeColors = {
  "light": [
    { scope: "token.info-token", settings: { foreground: "#316bcd" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#cd3131" } },
    { scope: "token.debug-token", settings: { foreground: "#800080" } }
  ],
  "dark": [
    { scope: "token.info-token", settings: { foreground: "#6796e6" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#f44747" } },
    { scope: "token.debug-token", settings: { foreground: "#b267e6" } }
  ],
  "hcLight": [
    { scope: "token.info-token", settings: { foreground: "#316bcd" } },
    { scope: "token.warn-token", settings: { foreground: "#cd9731" } },
    { scope: "token.error-token", settings: { foreground: "#cd3131" } },
    { scope: "token.debug-token", settings: { foreground: "#800080" } }
  ],
  "hcDark": [
    { scope: "token.info-token", settings: { foreground: "#6796e6" } },
    { scope: "token.warn-token", settings: { foreground: "#008000" } },
    { scope: "token.error-token", settings: { foreground: "#FF0000" } },
    { scope: "token.debug-token", settings: { foreground: "#b267e6" } }
  ]
};

var noMatch = (_scope) => -1;

function nameMatcher(identifiers2, scopes) {
  if (scopes.length < identifiers2.length) {
    return -1;
  }
  let score3 = void 0;
  const every = identifiers2.every((identifier2) => {
    for (let i2 = scopes.length - 1; i2 >= 0; i2--) {
      if (scopesAreMatching(scopes[i2], identifier2)) {
        score3 = (i2 + 1) * 65536 + identifier2.length;
        return true;
      }
    }
    return false;
  });
  return every && score3 !== void 0 ? score3 : -1;
}

function scopesAreMatching(thisScopeName, scopeName) {
  if (!thisScopeName) {
    return false;
  }
  if (thisScopeName === scopeName) {
    return true;
  }
  const len = scopeName.length;
  return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === ".";
}

function getScopeMatcher(rule) {
  const ruleScope = rule.scope;
  if (!ruleScope || !rule.settings) {
    return noMatch;
  }
  const matchers = [];
  if (Array.isArray(ruleScope)) {
    for (const rs of ruleScope) {
      createMatchers(rs, nameMatcher, matchers);
    }
  } else {
    createMatchers(ruleScope, nameMatcher, matchers);
  }
  if (matchers.length === 0) {
    return noMatch;
  }
  return (scope) => {
    let max = matchers[0].matcher(scope);
    for (let i2 = 1; i2 < matchers.length; i2++) {
      max = Math.max(max, matchers[i2].matcher(scope));
    }
    return max;
  };
}

function readSemanticTokenRule(selectorString, settings) {
  const selector = tokenClassificationRegistry3.parseTokenSelector(selectorString);
  let style;
  if (typeof settings === "string") {
    style = TokenStyle.fromSettings(settings, void 0);
  } else if (isSemanticTokenColorizationSetting(settings)) {
    style = TokenStyle.fromSettings(settings.foreground, settings.fontStyle, settings.bold, settings.underline, settings.strikethrough, settings.italic);
  }
  if (style) {
    return { selector, style };
  }
  return void 0;
}

function isSemanticTokenColorizationSetting(style) {
  return style && (isString(style.foreground) || isString(style.fontStyle) || isBoolean(style.italic) || isBoolean(style.underline) || isBoolean(style.strikethrough) || isBoolean(style.bold));
}

function findMetadata(colorThemeData, captureNames, languageId, bracket) {
  let metadata = 0;
  metadata |= languageId << 0 /* LANGUAGEID_OFFSET */;
  const definitions3 = {};
  const tokenStyle = colorThemeData.resolveScopes([captureNames], definitions3);
  if (captureNames.length > 0) {
    const standardToken = toStandardTokenType(captureNames[captureNames.length - 1]);
    metadata |= standardToken << 8 /* TOKEN_TYPE_OFFSET */;
  }
  const fontStyle = definitions3.foreground?.settings.fontStyle || definitions3.bold?.settings.fontStyle;
  if (fontStyle?.includes("italic")) {
    metadata |= 1 /* Italic */ | 2048 /* ITALIC_MASK */;
  }
  if (fontStyle?.includes("bold")) {
    metadata |= 2 /* Bold */ | 4096 /* BOLD_MASK */;
  }
  if (fontStyle?.includes("underline")) {
    metadata |= 4 /* Underline */ | 8192 /* UNDERLINE_MASK */;
  }
  if (fontStyle?.includes("strikethrough")) {
    metadata |= 8 /* Strikethrough */ | 16384 /* STRIKETHROUGH_MASK */;
  }
  const foreground2 = tokenStyle?.foreground;
  const tokenStyleForeground = foreground2 !== void 0 ? colorThemeData.getTokenColorIndex().get(foreground2) : 1 /* DefaultForeground */;
  metadata |= tokenStyleForeground << 15 /* FOREGROUND_OFFSET */;
  if (bracket) {
    metadata |= 1024 /* BALANCED_BRACKETS_MASK */;
  }
  return metadata;
}

var TokenColorIndex = class {
  constructor() {
    this._lastColorId = 0;
    this._id2color = [];
    this._color2id = /* @__PURE__ */ Object.create(null);
  }
  add(color2) {
    color2 = normalizeColor(color2);
    if (color2 === void 0) {
      return 0;
    }
    let value2 = this._color2id[color2];
    if (value2) {
      return value2;
    }
    value2 = ++this._lastColorId;
    this._color2id[color2] = value2;
    this._id2color[value2] = color2;
    return value2;
  }
  get(color2) {
    color2 = normalizeColor(color2);
    if (color2 === void 0) {
      return 0;
    }
    const value2 = this._color2id[color2];
    if (value2) {
      return value2;
    }
    console.log(`Color ${color2} not in index.`);
    return 0;
  }
  asArray() {
    return this._id2color.slice(0);
  }
};

var TokenFontIndex = class {
  constructor() {
    this._lastFontId = 0;
    this._id2font = [];
    this._font2id = /* @__PURE__ */ new Map();
  }
  add(fontFamily, fontSizeMultiplier, lineHeightMultiplier) {
    const font = { fontFamily, fontSizeMultiplier, lineHeightMultiplier };
    let value2 = this._font2id.get(font);
    if (value2) {
      return value2;
    }
    value2 = ++this._lastFontId;
    this._font2id.set(font, value2);
    this._id2font[value2] = font;
    return value2;
  }
  get(font) {
    const value2 = this._font2id.get(font);
    if (value2) {
      return value2;
    }
    return 0;
  }
  asArray() {
    return this._id2font.slice(0);
  }
};

function normalizeColor(color2) {
  if (!color2) {
    return void 0;
  }
  if (typeof color2 !== "string") {
    color2 = Color.Format.CSS.formatHexA(color2, true);
  }
  const len = color2.length;
  if (color2.charCodeAt(0) !== 35 /* Hash */ || len !== 4 && len !== 5 && len !== 7 && len !== 9) {
    return void 0;
  }
  const result = [35 /* Hash */];
  for (let i2 = 1; i2 < len; i2++) {
    const upper = hexUpper(color2.charCodeAt(i2));
    if (!upper) {
      return void 0;
    }
    result.push(upper);
    if (len === 4 || len === 5) {
      result.push(upper);
    }
  }
  if (result.length === 9 && result[7] === 70 /* F */ && result[8] === 70 /* F */) {
    result.length = 7;
  }
  return String.fromCharCode(...result);
}

function hexUpper(charCode) {
  if (charCode >= 48 /* Digit0 */ && charCode <= 57 /* Digit9 */ || charCode >= 65 /* A */ && charCode <= 70 /* F */) {
    return charCode;
  } else if (charCode >= 97 /* a */ && charCode <= 102 /* f */) {
    return charCode - 97 /* a */ + 65 /* A */;
  }
  return 0;
}
export { toCSSSelector, _loadColorTheme, _loadSyntaxTokens, nameMatcher, scopesAreMatching, getScopeMatcher, readSemanticTokenRule, isSemanticTokenColorizationSetting, findMetadata, normalizeColor, hexUpper, colorRegistry4, tokenClassificationRegistry3, tokenGroupToScopesMap, ColorThemeData, defaultThemeColors, noMatch, TokenColorIndex, TokenFontIndex };
