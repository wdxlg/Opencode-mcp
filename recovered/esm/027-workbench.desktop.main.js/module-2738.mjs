// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatLayoutService.ts
import { Disposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derived } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatLayoutService.ts
var FONT_SIZE2 = 13;

var ChatLayoutService = class extends Disposable {
  constructor(configurationService) {
    super();
    const chatFontFamily = observableConfigValue("chat.fontFamily", "default", configurationService);
    this.fontFamily = derived((reader) => {
      const fontFamily = chatFontFamily.read(reader);
      return fontFamily === "default" ? null : fontFamily;
    });
    this.fontSize = observableConfigValue("chat.fontSize", FONT_SIZE2, configurationService);
  }
};

ChatLayoutService = __decorateClass([
  __decorateParam(0, IConfigurationService)
], ChatLayoutService);
export { FONT_SIZE2, ChatLayoutService };
