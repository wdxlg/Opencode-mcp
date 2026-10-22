// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/markdownRenderer/browser/editorMarkdownCodeBlockRenderer.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { isHTMLElement } from "./module-0075.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/browser/widget/markdownRenderer/browser/editorMarkdownCodeBlockRenderer.ts
var EditorMarkdownCodeBlockRenderer = class {
  constructor(_configurationService, _languageService) {
    this._configurationService = _configurationService;
    this._languageService = _languageService;
  }
  static {
    this._ttpTokenizer = createTrustedTypesPolicy("tokenizeToString", {
      createHTML(html3) {
        return html3;
      }
    });
  }
  async renderCodeBlock(languageAlias, value2, options3) {
    const editor = isCodeEditor(options3.context) ? options3.context : void 0;
    let languageId;
    if (languageAlias) {
      languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
    } else if (editor) {
      languageId = editor.getModel()?.getLanguageId();
    }
    if (!languageId) {
      languageId = PLAINTEXT_LANGUAGE_ID;
    }
    const html3 = await tokenizeToString(this._languageService, value2, languageId);
    const content = EditorMarkdownCodeBlockRenderer._ttpTokenizer ? EditorMarkdownCodeBlockRenderer._ttpTokenizer.createHTML(html3) ?? html3 : html3;
    const root = document.createElement("span");
    root.innerHTML = content;
    const codeElement = root.querySelector(".monaco-tokenized-source");
    if (!isHTMLElement(codeElement)) {
      return document.createElement("span");
    }
    applyFontInfo(codeElement, this.getFontInfo(editor));
    return root;
  }
  getFontInfo(editor) {
    if (editor) {
      return editor.getOption(59 /* fontInfo */);
    } else {
      return createBareFontInfoFromRawSettings({
        fontFamily: this._configurationService.getValue("editor").fontFamily
      }, 1);
    }
  }
};

EditorMarkdownCodeBlockRenderer = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILanguageService)
], EditorMarkdownCodeBlockRenderer);
export { EditorMarkdownCodeBlockRenderer };
