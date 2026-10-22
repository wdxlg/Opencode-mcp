// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/themeing.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";
import { getColorRegistry } from "./module-0226.mjs";
import { getSizeRegistry, sizeValueToCss } from "./module-1505.mjs";
import { DEFAULT_FONT_FAMILY } from "./module-0312.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchThemeService } from "./module-0916.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/webview/browser/themeing.ts
var WebviewThemeDataProvider = class extends Disposable {
  constructor(_themeService, _configurationService) {
    super();
    this._themeService = _themeService;
    this._configurationService = _configurationService;
    this._cachedWebViewThemeData = void 0;
    this._onThemeDataChanged = this._register(new Emitter());
    this.onThemeDataChanged = this._onThemeDataChanged.event;
    this._register(this._themeService.onDidColorThemeChange(() => {
      this._reset();
    }));
    const webviewConfigurationKeys = ["editor.fontFamily", "editor.fontWeight", "editor.fontSize", "editor.fontLigatures", "accessibility.underlineLinks"];
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (webviewConfigurationKeys.some((key3) => e.affectsConfiguration(key3))) {
        this._reset();
      }
    }));
  }
  getTheme() {
    return this._themeService.getColorTheme();
  }
  getWebviewThemeData() {
    if (!this._cachedWebViewThemeData) {
      const configuration2 = this._configurationService.getValue("editor");
      const editorFontFamily = configuration2.fontFamily || EDITOR_FONT_DEFAULTS.fontFamily;
      const editorFontWeight = configuration2.fontWeight || EDITOR_FONT_DEFAULTS.fontWeight;
      const editorFontSize = configuration2.fontSize || EDITOR_FONT_DEFAULTS.fontSize;
      const editorFontLigatures = new EditorFontLigatures().validate(configuration2.fontLigatures);
      const linkUnderlines = this._configurationService.getValue("accessibility.underlineLinks");
      const theme = this._themeService.getColorTheme();
      const exportedColors = getColorRegistry().getColors().reduce((colors, entry) => {
        const color2 = theme.getColor(entry.id);
        if (color2) {
          colors["vscode-" + entry.id.replace(".", "-")] = color2.toString();
        }
        return colors;
      }, {});
      const sizeRegistry2 = getSizeRegistry();
      const exportedSizes = sizeRegistry2.getSizes().reduce((sizes, entry) => {
        const sizeValue2 = sizeRegistry2.resolveDefaultSize(entry.id, theme);
        if (sizeValue2) {
          sizes["vscode-" + entry.id.replace(/\./g, "-")] = sizeValueToCss(sizeValue2);
        }
        return sizes;
      }, {});
      const styles = {
        "vscode-font-family": DEFAULT_FONT_FAMILY,
        "vscode-font-weight": "normal",
        "vscode-font-size": "13px",
        "vscode-editor-font-family": editorFontFamily,
        "vscode-editor-font-weight": editorFontWeight,
        "vscode-editor-font-size": editorFontSize + "px",
        "text-link-decoration": linkUnderlines ? "underline" : "none",
        ...exportedColors,
        ...exportedSizes,
        "vscode-editor-font-feature-settings": editorFontLigatures
      };
      const activeTheme = ApiThemeClassName.fromTheme(theme);
      this._cachedWebViewThemeData = { styles, activeTheme, themeLabel: theme.label, themeId: theme.settingsId };
    }
    return this._cachedWebViewThemeData;
  }
  _reset() {
    this._cachedWebViewThemeData = void 0;
    this._onThemeDataChanged.fire();
  }
};

WebviewThemeDataProvider = __decorateClass([
  __decorateParam(0, IWorkbenchThemeService),
  __decorateParam(1, IConfigurationService)
], WebviewThemeDataProvider);

var ApiThemeClassName = /* @__PURE__ */ ((ApiThemeClassName2) => {
  ApiThemeClassName2["light"] = "vscode-light";
  ApiThemeClassName2["dark"] = "vscode-dark";
  ApiThemeClassName2["highContrast"] = "vscode-high-contrast";
  ApiThemeClassName2["highContrastLight"] = "vscode-high-contrast-light";
  return ApiThemeClassName2;
})(ApiThemeClassName || {});

((ApiThemeClassName2) => {
  function fromTheme(theme) {
    switch (theme.type) {
      case "light" /* LIGHT */:
        return "vscode-light" /* light */;
      case "dark" /* DARK */:
        return "vscode-dark" /* dark */;
      case "hcDark" /* HIGH_CONTRAST_DARK */:
        return "vscode-high-contrast" /* highContrast */;
      case "hcLight" /* HIGH_CONTRAST_LIGHT */:
        return "vscode-high-contrast-light" /* highContrastLight */;
    }
  }
  ApiThemeClassName2.fromTheme = fromTheme;
})(ApiThemeClassName || (ApiThemeClassName = {}));
export { WebviewThemeDataProvider, ApiThemeClassName };
