// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer.ts
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, append, show } from "./module-0075.mjs";
import { IconLabel } from "./module-0640.mjs";
import { createMatches } from "./module-0453.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { URI } from "./module-0032.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer.ts
function getAriaId(index2) {
  return `simple-suggest-aria-id-${index2}`;
}

var SimpleSuggestWidgetItemRenderer = class {
  constructor(_getFontInfo, _onDidFontConfigurationChange, _themeService, _modelService, _languageService) {
    this._getFontInfo = _getFontInfo;
    this._onDidFontConfigurationChange = _onDidFontConfigurationChange;
    this._themeService = _themeService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._onDidToggleDetails = new Emitter();
    this.onDidToggleDetails = this._onDidToggleDetails.event;
    this._disposables = new DisposableStore();
    this.templateId = "suggestion";
  }
  dispose() {
    this._onDidToggleDetails.dispose();
    this._disposables.dispose();
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const root = container3;
    root.classList.add("show-file-icons");
    const icon2 = append(container3, $(".icon"));
    const colorspan = append(icon2, $("span.colorspan"));
    const text2 = append(container3, $(".contents"));
    const main2 = append(text2, $(".main"));
    const iconContainer = append(main2, $(".icon-label.codicon"));
    const left = append(main2, $("span.left"));
    const right = append(main2, $("span.right"));
    const iconLabel = new IconLabel(left, { supportHighlights: true, supportIcons: true });
    disposables.add(iconLabel);
    const parametersLabel = append(left, $("span.signature-label"));
    const qualifierLabel = append(left, $("span.qualifier-label"));
    const detailsLabel = append(right, $("span.details-label"));
    const configureFont = () => {
      const fontFeatureSettings = "";
      const { fontFamily, fontSize, lineHeight, fontWeight, letterSpacing } = this._getFontInfo();
      const fontSizePx = `${fontSize}px`;
      const lineHeightPx = `${lineHeight}px`;
      const letterSpacingPx = `${letterSpacing}px`;
      root.style.fontSize = fontSizePx;
      root.style.fontWeight = fontWeight;
      root.style.letterSpacing = letterSpacingPx;
      main2.style.fontFamily = fontFamily;
      main2.style.fontFeatureSettings = fontFeatureSettings;
      main2.style.lineHeight = lineHeightPx;
      icon2.style.height = lineHeightPx;
      icon2.style.width = lineHeightPx;
    };
    configureFont();
    this._disposables.add(this._onDidFontConfigurationChange(() => configureFont()));
    return { root, left, right, icon: icon2, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, disposables };
  }
  renderElement(element, index2, data) {
    const { completion } = element;
    data.root.id = getAriaId(index2);
    data.colorspan.style.backgroundColor = "";
    const labelOptions = {
      labelEscapeNewLines: true,
      matches: createMatches(element.score)
    };
    if (completion.kindLabel === "File" && this._themeService.getFileIconTheme().hasFileIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      const labelClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), 0 /* FILE */);
      const detailClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), 0 /* FILE */);
      labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
    } else if (completion.kindLabel === "Folder" && this._themeService.getFileIconTheme().hasFolderIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      labelOptions.extraClasses = [
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), 1 /* FOLDER */),
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), 1 /* FOLDER */)
      ].flat();
    } else {
      data.icon.className = "icon hide";
      data.iconContainer.className = "";
      data.iconContainer.classList.add("suggest-icon", ...ThemeIcon.asClassNameArray(completion.icon || Codicon.symbolText));
    }
    data.iconLabel.setLabel(element.textLabel, void 0, labelOptions);
    if (typeof completion.label === "string") {
      data.parametersLabel.textContent = "";
      data.detailsLabel.textContent = stripNewLines2(completion.detail || "");
      data.root.classList.add("string-label");
    } else {
      const labelDetail = stripNewLines2(completion.label.detail || "");
      data.parametersLabel.textContent = normalizeLabelDetail(labelDetail);
      data.detailsLabel.textContent = stripNewLines2(completion.label.description || "");
      data.root.classList.remove("string-label");
    }
    show(data.detailsLabel);
    data.right.classList.remove("can-expand-details");
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

SimpleSuggestWidgetItemRenderer = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IModelService),
  __decorateParam(4, ILanguageService)
], SimpleSuggestWidgetItemRenderer);

function stripNewLines2(str) {
  return str.replace(/\r\n|\r|\n/g, "");
}

var LEADING_PUNCTUATION_OR_SPACE = /^[\s()[\]{}<>"'`~!@#$%^&*+=,.:;?/\\|-]/;

function normalizeLabelDetail(detail2) {
  if (!detail2) {
    return "";
  }
  return LEADING_PUNCTUATION_OR_SPACE.test(detail2) ? detail2 : ` ${detail2}`;
}
export { getAriaId, stripNewLines2, normalizeLabelDetail, SimpleSuggestWidgetItemRenderer, LEADING_PUNCTUATION_OR_SPACE };
