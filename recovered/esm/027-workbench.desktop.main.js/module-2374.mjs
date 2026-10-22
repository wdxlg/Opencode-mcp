// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatOptions.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatOptions.ts
var ChatEditorOptions = class extends Disposable {
  constructor(viewId, foreground2, inputEditorBackgroundColor, resultEditorBackgroundColor, configurationService, themeService, viewDescriptorService) {
    super();
    this.foreground = foreground2;
    this.inputEditorBackgroundColor = inputEditorBackgroundColor;
    this.resultEditorBackgroundColor = resultEditorBackgroundColor;
    this.configurationService = configurationService;
    this.themeService = themeService;
    this.viewDescriptorService = viewDescriptorService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(this.themeService.onDidColorThemeChange((e) => this.update()));
    this._register(this.viewDescriptorService.onDidChangeLocation((e) => {
      if (e.views.some((v2) => v2.id === viewId)) {
        this.update();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (ChatEditorOptions.relevantSettingIds.some((id2) => e.affectsConfiguration(id2))) {
        this.update();
      }
    }));
    this.update();
  }
  static {
    this.lineHeightEm = 1.4;
  }
  get configuration() {
    return this._config;
  }
  static {
    this.relevantSettingIds = [
      "chat.editor.lineHeight",
      "chat.editor.fontSize",
      "chat.editor.fontFamily",
      "chat.editor.fontWeight",
      "chat.editor.wordWrap",
      "editor.cursorBlinking",
      "editor.fontLigatures",
      "editor.accessibilitySupport",
      "editor.bracketPairColorization.enabled",
      "editor.bracketPairColorization.independentColorPoolPerBracketType"
    ];
  }
  update() {
    const editorConfig = this.configurationService.getValue("editor");
    const chatEditorConfig = this.configurationService.getValue("chat")?.editor;
    const accessibilitySupport = this.configurationService.getValue("editor.accessibilitySupport");
    this._config = {
      foreground: this.themeService.getColorTheme().getColor(this.foreground),
      inputEditor: {
        backgroundColor: this.themeService.getColorTheme().getColor(this.inputEditorBackgroundColor),
        accessibilitySupport
      },
      resultEditor: {
        backgroundColor: this.themeService.getColorTheme().getColor(this.resultEditorBackgroundColor),
        fontSize: chatEditorConfig.fontSize,
        fontFamily: chatEditorConfig.fontFamily === "default" ? editorConfig.fontFamily : chatEditorConfig.fontFamily,
        fontWeight: chatEditorConfig.fontWeight,
        lineHeight: chatEditorConfig.lineHeight ? chatEditorConfig.lineHeight : ChatEditorOptions.lineHeightEm * chatEditorConfig.fontSize,
        bracketPairColorization: {
          enabled: this.configurationService.getValue("editor.bracketPairColorization.enabled"),
          independentColorPoolPerBracketType: this.configurationService.getValue("editor.bracketPairColorization.independentColorPoolPerBracketType")
        },
        wordWrap: chatEditorConfig.wordWrap,
        fontLigatures: editorConfig.fontLigatures
      }
    };
    this._onDidChange.fire();
  }
  setColors(foreground2, inputEditorBackgroundColor, resultEditorBackgroundColor) {
    this.foreground = foreground2;
    this.inputEditorBackgroundColor = inputEditorBackgroundColor;
    this.resultEditorBackgroundColor = resultEditorBackgroundColor;
    this.update();
  }
};

ChatEditorOptions = __decorateClass([
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IViewDescriptorService)
], ChatEditorOptions);
export { ChatEditorOptions };
