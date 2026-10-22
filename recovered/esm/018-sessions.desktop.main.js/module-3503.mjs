// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/chatBackground/browser/chatBackgroundService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { SessionsChatBackgroundAvailableContext, SessionsChatBackgroundConfiguredContext, SessionsChatBackgroundImageConfiguredContext } from "./module-1770.mjs";
import { isDark, isHighContrast } from "./module-0247.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/services/chatBackground/browser/chatBackgroundService.ts
var AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING = "chat.agentSessions.preferredDarkBackgroundImage";

var AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING = "chat.agentSessions.preferredLightBackgroundImage";

var AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING = "chat.agentSessions.backgroundImageLayout";

var AGENT_SESSIONS_CHAT_BACKGROUND_CODICONS_PRESET = "codicons";

var RECENT_BACKGROUND_IMAGES_STORAGE_KEY = "chat.agentSessions.recentBackgroundImages";

var MAX_RECENT_BACKGROUND_IMAGES = 5;

var backgroundImageStyles = {
  repeat: { backgroundRepeat: "repeat", backgroundSize: "auto", backgroundPosition: "left top" },
  stretch: { backgroundRepeat: "no-repeat", backgroundSize: "100% 100%", backgroundPosition: "center center" },
  center: { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "center center" },
  top: { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "center top" },
  "top-right": { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "right top" },
  "top-left": { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "left top" },
  bottom: { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "center bottom" },
  "bottom-right": { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "right bottom" },
  "bottom-left": { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "left bottom" },
  left: { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "left center" },
  right: { backgroundRepeat: "no-repeat", backgroundSize: "auto", backgroundPosition: "right center" }
};

var chatBackgroundImageLayoutValues = Object.keys(backgroundImageStyles);

var ISessionsChatBackgroundService = createDecorator("sessionsChatBackgroundService");

var SessionsChatBackgroundService = class extends Disposable {
  constructor(configurationService, themeService, contextKeyService, storageService) {
    super();
    this.configurationService = configurationService;
    this.themeService = themeService;
    this.storageService = storageService;
    this._onDidChangeBackground = this._register(new Emitter());
    this.onDidChangeBackground = this._onDidChangeBackground.event;
    this.backgroundImageLayout = this.readConfiguredBackgroundImageLayout();
    const backgroundAvailableContext = SessionsChatBackgroundAvailableContext.bindTo(contextKeyService);
    const backgroundConfiguredContext = SessionsChatBackgroundConfiguredContext.bindTo(contextKeyService);
    const backgroundImageConfiguredContext = SessionsChatBackgroundImageConfiguredContext.bindTo(contextKeyService);
    const updateContextKeys = () => {
      const background = this.getConfiguredBackground();
      backgroundAvailableContext.set(!isHighContrast(this.themeService.getColorTheme().type));
      backgroundConfiguredContext.set(!!background);
      backgroundImageConfiguredContext.set(background?.kind === "image");
    };
    updateContextKeys();
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      const backgroundImageChanged = event.affectsConfiguration(AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING) || event.affectsConfiguration(AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING);
      const backgroundImageLayoutChanged = event.affectsConfiguration(AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING);
      let backgroundChanged = backgroundImageChanged;
      if (backgroundImageChanged) {
        updateContextKeys();
      }
      if (backgroundImageLayoutChanged) {
        const layout2 = this.readConfiguredBackgroundImageLayout();
        if (layout2 !== this.backgroundImageLayout) {
          this.backgroundImageLayout = layout2;
          backgroundChanged = true;
        }
      }
      if (backgroundChanged) {
        this._onDidChangeBackground.fire();
      }
    }));
    this._register(this.themeService.onDidColorThemeChange(() => {
      updateContextKeys();
      this._onDidChangeBackground.fire();
    }));
  }
  getBackground() {
    if (isHighContrast(this.themeService.getColorTheme().type)) {
      return void 0;
    }
    const configuredBackground = this.getConfiguredBackground();
    if (configuredBackground?.kind === "codicons") {
      return configuredBackground;
    }
    return configuredBackground ? {
      kind: "image",
      backgroundImage: asCSSUrl(configuredBackground.image),
      ...backgroundImageStyles[this.getBackgroundImageLayout()]
    } : void 0;
  }
  getConfiguredBackgroundImage() {
    const background = this.getConfiguredBackground();
    return background?.kind === "image" ? background.image : void 0;
  }
  getRecentBackgroundImages() {
    const images = this.getStoredRecentBackgroundImages();
    const current = this.getConfiguredBackgroundImage();
    if (current && !images.some((image) => isEqual2(image, current))) {
      images.unshift(current);
    }
    return images.slice(0, MAX_RECENT_BACKGROUND_IMAGES);
  }
  async setBackground(background) {
    const setting = this.getBackgroundImageSetting(this.themeService.getColorTheme().type);
    await this.configurationService.updateValue(setting, URI.isUri(background) ? background.fsPath : background, 2 /* USER */);
    if (URI.isUri(background)) {
      this.storeRecentBackgroundImage(background);
    }
  }
  async clearBackground() {
    const setting = this.getBackgroundImageSetting(this.themeService.getColorTheme().type);
    await this.configurationService.updateValue(setting, void 0, 2 /* USER */);
  }
  getBackgroundImageLayout() {
    return this.backgroundImageLayout;
  }
  async setBackgroundImageLayout(layout2, persist = true) {
    if (layout2 !== this.backgroundImageLayout) {
      this.backgroundImageLayout = layout2;
      this._onDidChangeBackground.fire();
    }
    if (persist) {
      try {
        await this.configurationService.updateValue(AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING, layout2, 1 /* APPLICATION */);
      } catch (error) {
        const configuredLayout = this.readConfiguredBackgroundImageLayout();
        if (configuredLayout !== this.backgroundImageLayout) {
          this.backgroundImageLayout = configuredLayout;
          this._onDidChangeBackground.fire();
        }
        throw error;
      }
    }
  }
  readConfiguredBackgroundImageLayout() {
    const value2 = this.configurationService.getValue(AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING);
    return chatBackgroundImageLayoutValues.includes(value2) ? value2 : "repeat";
  }
  getBackgroundImageSetting(colorScheme) {
    return isDark(colorScheme) ? AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING : AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING;
  }
  getConfiguredBackground() {
    const setting = this.getBackgroundImageSetting(this.themeService.getColorTheme().type);
    const value2 = this.configurationService.getValue(setting);
    if (value2?.trim() === AGENT_SESSIONS_CHAT_BACKGROUND_CODICONS_PRESET) {
      return { kind: "codicons" };
    }
    const image = this.resolveBackgroundImage(value2);
    return image ? { kind: "image", image } : void 0;
  }
  getStoredRecentBackgroundImages() {
    const stored = this.storageService.getObject(RECENT_BACKGROUND_IMAGES_STORAGE_KEY, 0 /* PROFILE */, []);
    if (!Array.isArray(stored)) {
      return [];
    }
    const images = [];
    for (const value2 of stored) {
      if (typeof value2 !== "string") {
        continue;
      }
      const image = this.resolveBackgroundImage(value2);
      if (image && !images.some((existing) => isEqual2(existing, image))) {
        images.push(image);
      }
    }
    return images.slice(0, MAX_RECENT_BACKGROUND_IMAGES);
  }
  storeRecentBackgroundImage(image) {
    const images = [
      image,
      ...this.getStoredRecentBackgroundImages().filter((existing) => !isEqual2(existing, image))
    ].slice(0, MAX_RECENT_BACKGROUND_IMAGES);
    this.storageService.store(
      RECENT_BACKGROUND_IMAGES_STORAGE_KEY,
      JSON.stringify(images.map((recent) => recent.toString())),
      0 /* PROFILE */,
      1 /* MACHINE */
    );
  }
  resolveBackgroundImage(value2) {
    const candidate = value2?.trim();
    if (!candidate) {
      return void 0;
    }
    if (isAbsolute(candidate)) {
      return URI.file(candidate);
    }
    const uri4 = URI.parse(candidate);
    return uri4.scheme === Schemas.file ? uri4 : void 0;
  }
};

SessionsChatBackgroundService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IStorageService)
], SessionsChatBackgroundService);
export { AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING, AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING, AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING, AGENT_SESSIONS_CHAT_BACKGROUND_CODICONS_PRESET, RECENT_BACKGROUND_IMAGES_STORAGE_KEY, MAX_RECENT_BACKGROUND_IMAGES, backgroundImageStyles, chatBackgroundImageLayoutValues, ISessionsChatBackgroundService, SessionsChatBackgroundService };
