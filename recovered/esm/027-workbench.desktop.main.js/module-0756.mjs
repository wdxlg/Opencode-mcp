// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestWidgetRenderer.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Emitter } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, append, hide, show } from "./module-0075.mjs";
import { IconLabel } from "./module-0640.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { createMatches } from "./module-0453.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { URI } from "./module-0032.mjs";
import { CompletionItemKinds } from "./module-0164.mjs";
import { canExpandCompletionItem } from "./module-0754.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/editor/contrib/suggest/browser/suggestWidgetRenderer.ts
var suggestMoreInfoIcon = registerIcon("suggest-more-info", Codicon.chevronRight, localize(1679, null));

var _completionItemColor = new class ColorExtractor {
  static {
    this._regexRelaxed = /(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/;
  }
  static {
    this._regexStrict = new RegExp(`^${ColorExtractor._regexRelaxed.source}$`, "i");
  }
  extract(item, out) {
    if (item.textLabel.match(ColorExtractor._regexStrict)) {
      out[0] = item.textLabel;
      return true;
    }
    if (item.completion.detail && item.completion.detail.match(ColorExtractor._regexStrict)) {
      out[0] = item.completion.detail;
      return true;
    }
    if (item.completion.documentation) {
      const value2 = typeof item.completion.documentation === "string" ? item.completion.documentation : item.completion.documentation.value;
      const match2 = ColorExtractor._regexRelaxed.exec(value2);
      if (match2 && (match2.index === 0 || match2.index + match2[0].length === value2.length)) {
        out[0] = match2[0];
        return true;
      }
    }
    return false;
  }
}();

var ItemRenderer = class {
  constructor(_editor, _modelService, _languageService, _themeService) {
    this._editor = _editor;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._themeService = _themeService;
    this._onDidToggleDetails = new Emitter();
    this.onDidToggleDetails = this._onDidToggleDetails.event;
    this.templateId = "suggestion";
  }
  dispose() {
    this._onDidToggleDetails.dispose();
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
    const readMore = append(right, $("span.readMore" + ThemeIcon.asCSSSelector(suggestMoreInfoIcon)));
    readMore.title = localize(1678, null);
    const configureFont = () => {
      const options3 = this._editor.getOptions();
      const fontInfo = options3.get(59 /* fontInfo */);
      const fontFamily = fontInfo.getMassagedFontFamily();
      const fontFeatureSettings = fontInfo.fontFeatureSettings;
      const fontVariationSettings = fontInfo.fontVariationSettings;
      const fontSize = options3.get(135 /* suggestFontSize */) || fontInfo.fontSize;
      const lineHeight = options3.get(136 /* suggestLineHeight */) || fontInfo.lineHeight;
      const fontWeight = fontInfo.fontWeight;
      const letterSpacing = fontInfo.letterSpacing;
      const fontSizePx = `${fontSize}px`;
      const lineHeightPx = `${lineHeight}px`;
      const letterSpacingPx = `${letterSpacing}px`;
      root.style.fontSize = fontSizePx;
      root.style.fontWeight = fontWeight;
      root.style.letterSpacing = letterSpacingPx;
      main2.style.fontFamily = fontFamily;
      main2.style.fontFeatureSettings = fontFeatureSettings;
      main2.style.fontVariationSettings = fontVariationSettings;
      main2.style.lineHeight = lineHeightPx;
      icon2.style.height = lineHeightPx;
      icon2.style.width = lineHeightPx;
      readMore.style.height = lineHeightPx;
      readMore.style.width = lineHeightPx;
    };
    return { root, left, right, icon: icon2, colorspan, iconLabel, iconContainer, parametersLabel, qualifierLabel, detailsLabel, readMore, disposables, configureFont };
  }
  renderElement(element, index2, data) {
    data.configureFont();
    const { completion } = element;
    data.colorspan.style.backgroundColor = "";
    const labelOptions = {
      labelEscapeNewLines: true,
      matches: createMatches(element.score)
    };
    const color2 = [];
    if (completion.kind === 19 /* Color */ && _completionItemColor.extract(element, color2)) {
      data.icon.className = "icon customcolor";
      data.iconContainer.className = "icon hide";
      data.colorspan.style.backgroundColor = color2[0];
    } else if (completion.kind === 20 /* File */ && this._themeService.getFileIconTheme().hasFileIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      const labelClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), 0 /* FILE */);
      const detailClasses = getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), 0 /* FILE */);
      labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
    } else if (completion.kind === 23 /* Folder */ && this._themeService.getFileIconTheme().hasFolderIcons) {
      data.icon.className = "icon hide";
      data.iconContainer.className = "icon hide";
      labelOptions.extraClasses = [
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: element.textLabel }), 1 /* FOLDER */),
        getIconClasses(this._modelService, this._languageService, URI.from({ scheme: "fake", path: completion.detail }), 1 /* FOLDER */)
      ].flat();
    } else {
      data.icon.className = "icon hide";
      data.iconContainer.className = "";
      data.iconContainer.classList.add("suggest-icon", ...ThemeIcon.asClassNameArray(CompletionItemKinds.toIcon(completion.kind)));
    }
    if (completion.tags && completion.tags.indexOf(1 /* Deprecated */) >= 0) {
      labelOptions.extraClasses = (labelOptions.extraClasses || []).concat(["deprecated"]);
      labelOptions.matches = [];
    }
    data.iconLabel.setLabel(element.textLabel, void 0, labelOptions);
    if (typeof completion.label === "string") {
      data.parametersLabel.textContent = "";
      data.detailsLabel.textContent = stripNewLines(completion.detail || "");
      data.root.classList.add("string-label");
    } else {
      data.parametersLabel.textContent = stripNewLines(completion.label.detail || "");
      data.detailsLabel.textContent = stripNewLines(completion.label.description || "");
      data.root.classList.remove("string-label");
    }
    if (this._editor.getOption(134 /* suggest */).showInlineDetails) {
      show(data.detailsLabel);
    } else {
      hide(data.detailsLabel);
    }
    if (canExpandCompletionItem(element)) {
      data.right.classList.add("can-expand-details");
      show(data.readMore);
      data.readMore.onmousedown = (e) => {
        e.stopPropagation();
        e.preventDefault();
      };
      data.readMore.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this._onDidToggleDetails.fire();
      };
    } else {
      data.right.classList.remove("can-expand-details");
      hide(data.readMore);
      data.readMore.onmousedown = null;
      data.readMore.onclick = null;
    }
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

ItemRenderer = __decorateClass([
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IThemeService)
], ItemRenderer);

function stripNewLines(str) {
  return str.replace(/\r\n|\r|\n/g, "");
}
export { stripNewLines, suggestMoreInfoIcon, _completionItemColor, ItemRenderer };
