// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/theme/common/themeService.ts
import { createDecorator } from "./module-0077.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";


// src/vs/platform/theme/common/themeService.ts
var IThemeService = createDecorator("themeService");

function themeColorFromId2(id2) {
  return { id: id2 };
}

var FileThemeIcon = Codicon.file;

var FolderThemeIcon = Codicon.folder;

function getThemeTypeSelector(type) {
  switch (type) {
    case "dark" /* DARK */:
      return "vs-dark" /* VS_DARK */;
    case "hcDark" /* HIGH_CONTRAST_DARK */:
      return "hc-black" /* HC_BLACK */;
    case "hcLight" /* HIGH_CONTRAST_LIGHT */:
      return "hc-light" /* HC_LIGHT */;
    default:
      return "vs" /* VS */;
  }
}

var Extensions8 = {
  ThemingContribution: "base.contributions.theming"
};

var ThemingRegistry = class extends Disposable {
  constructor() {
    super();
    this.themingParticipants = [];
    this.themingParticipants = [];
    this.onThemingParticipantAddedEmitter = this._register(new Emitter());
  }
  onColorThemeChange(participant) {
    this.themingParticipants.push(participant);
    this.onThemingParticipantAddedEmitter.fire(participant);
    return toDisposable(() => {
      const idx = this.themingParticipants.indexOf(participant);
      this.themingParticipants.splice(idx, 1);
    });
  }
  get onThemingParticipantAdded() {
    return this.onThemingParticipantAddedEmitter.event;
  }
  getThemingParticipants() {
    return this.themingParticipants;
  }
};

var themingRegistry = new ThemingRegistry();

Registry.add(Extensions8.ThemingContribution, themingRegistry);

function registerThemingParticipant(participant) {
  return themingRegistry.onColorThemeChange(participant);
}

var Themable = class extends Disposable {
  constructor(themeService) {
    super();
    this.themeService = themeService;
    this.theme = themeService.getColorTheme();
    this._register(this.themeService.onDidColorThemeChange((theme) => this.onThemeChange(theme)));
  }
  onThemeChange(theme) {
    this.theme = theme;
    this.updateStyles();
  }
  updateStyles() {
  }
  getColor(id2, modify2) {
    let color2 = this.theme.getColor(id2);
    if (color2 && modify2) {
      color2 = modify2(color2, this.theme);
    }
    return color2 ? color2.toString() : null;
  }
};
export { themeColorFromId2, getThemeTypeSelector, registerThemingParticipant, IThemeService, FileThemeIcon, FolderThemeIcon, Extensions8, ThemingRegistry, themingRegistry, Themable };
