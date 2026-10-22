// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markdown/browser/markdownSettingRenderer.ts
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { settingKeyToDisplayFormat } from "./module-1826.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/markdown/browser/markdownSettingRenderer.ts
var SimpleSettingRenderer = class {
  // setting ID to feature value
  constructor(_configurationService, _contextMenuService, _preferencesService, _telemetryService, _clipboardService) {
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._preferencesService = _preferencesService;
    this._telemetryService = _telemetryService;
    this._clipboardService = _clipboardService;
    this._updatedSettings = /* @__PURE__ */ new Map();
    // setting ID to user's original setting value
    this._encounteredSettings = /* @__PURE__ */ new Map();
    // setting ID to setting
    this._featuredSettings = /* @__PURE__ */ new Map();
    this.codeSettingAnchorRegex = new RegExp(`^<a (href)=".*code.*://settings/([^\\s"]+)"(?:\\s*codesetting="([^"]+)")?>`);
    this.codeSettingSimpleRegex = new RegExp(`^setting\\(([^\\s:)]+)(?::([^)]+))?\\)$`);
  }
  get featuredSettingStates() {
    const result = /* @__PURE__ */ new Map();
    for (const [settingId, value2] of this._featuredSettings) {
      result.set(settingId, this._configurationService.getValue(settingId) === value2);
    }
    return result;
  }
  replaceAnchor(raw) {
    const match2 = this.codeSettingAnchorRegex.exec(raw);
    if (match2 && match2.length === 4) {
      const settingId = match2[2];
      const rendered = this.render(settingId, match2[3]);
      if (rendered) {
        return raw.replace(this.codeSettingAnchorRegex, rendered);
      }
    }
    return void 0;
  }
  replaceSimple(raw) {
    const match2 = this.codeSettingSimpleRegex.exec(raw);
    if (match2 && match2.length === 3) {
      const settingId = match2[1];
      const rendered = this.render(settingId, match2[2]);
      if (rendered) {
        return raw.replace(this.codeSettingSimpleRegex, rendered);
      }
    }
    return void 0;
  }
  getHtmlRenderer() {
    return ({ raw }) => {
      const replacedAnchor = this.replaceAnchor(raw);
      if (replacedAnchor) {
        raw = replacedAnchor;
      }
      return raw;
    };
  }
  getCodeSpanRenderer() {
    return ({ text: text2 }) => {
      const replacedSimple = this.replaceSimple(text2);
      if (replacedSimple) {
        return replacedSimple;
      }
      return `<code>${text2}</code>`;
    };
  }
  settingToUriString(settingId, value2) {
    return `${Schemas.codeSetting}://${settingId}${value2 ? `/${value2}` : ""}`;
  }
  getSetting(settingId) {
    if (this._encounteredSettings.has(settingId)) {
      return this._encounteredSettings.get(settingId);
    }
    return this._preferencesService.getSetting(settingId);
  }
  parseValue(settingId, value2) {
    if (value2 === "undefined" || value2 === "") {
      return void 0;
    }
    const setting = this.getSetting(settingId);
    if (!setting) {
      return value2;
    }
    switch (setting.type) {
      case "boolean":
        return value2 === "true";
      case "number":
        return parseInt(value2, 10);
      case "string":
      default:
        return value2;
    }
  }
  render(settingId, newValue) {
    const setting = this.getSetting(settingId);
    if (!setting) {
      return `<code>${settingId}</code>`;
    }
    return this.renderSetting(setting, newValue);
  }
  viewInSettingsMessage(settingId, alreadyDisplayed) {
    if (alreadyDisplayed) {
      return localize(16614, null);
    } else {
      const displayName = settingKeyToDisplayFormat(settingId);
      return localize(16615, null, displayName.category, displayName.label);
    }
  }
  restorePreviousSettingMessage(settingId) {
    const displayName = settingKeyToDisplayFormat(settingId);
    return localize(16611, null, displayName.category, displayName.label);
  }
  isAlreadySet(setting, value2) {
    const currentValue = this._configurationService.getValue(setting.key);
    return currentValue === value2 || currentValue === void 0 && setting.value === value2;
  }
  booleanSettingMessage(setting, booleanValue) {
    const displayName = settingKeyToDisplayFormat(setting.key);
    if (this.isAlreadySet(setting, booleanValue)) {
      if (booleanValue) {
        return localize(16604, null, displayName.category, displayName.label);
      } else {
        return localize(16603, null, displayName.category, displayName.label);
      }
    }
    if (booleanValue) {
      return localize(16613, null, displayName.category, displayName.label);
    } else {
      return localize(16609, null, displayName.category, displayName.label);
    }
  }
  stringSettingMessage(setting, stringValue2) {
    const displayName = settingKeyToDisplayFormat(setting.key);
    if (this.isAlreadySet(setting, stringValue2)) {
      return localize(16606, null, displayName.category, displayName.label, stringValue2);
    }
    return localize(16612, null, displayName.category, displayName.label, stringValue2);
  }
  numberSettingMessage(setting, numberValue) {
    const displayName = settingKeyToDisplayFormat(setting.key);
    if (this.isAlreadySet(setting, numberValue)) {
      return localize(16605, null, displayName.category, displayName.label, numberValue);
    }
    return localize(16610, null, displayName.category, displayName.label, numberValue);
  }
  renderSetting(setting, newValue) {
    const href = this.settingToUriString(setting.key, newValue);
    const title = localize(16607, null);
    return `<code tabindex="0"><a href="${href}" class="codesetting" title="${title}" aria-role="button"><svg width="14" height="14" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2-1.4 2.1 2.4.4v2.8l-2.4.5L14 12l-2 2-2.1-1.4-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2 1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2 2.1 1.4.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z"/></svg>
			<span class="separator"></span>
			<span class="setting-name">${setting.key}</span>
		</a></code>`;
  }
  getSettingMessage(setting, newValue) {
    if (setting.type === "boolean") {
      return this.booleanSettingMessage(setting, newValue);
    } else if (setting.type === "string") {
      return this.stringSettingMessage(setting, newValue);
    } else if (setting.type === "number") {
      return this.numberSettingMessage(setting, newValue);
    }
    return void 0;
  }
  async restoreSetting(settingId) {
    const userOriginalSettingValue = this._updatedSettings.get(settingId);
    this._updatedSettings.delete(settingId);
    return this._configurationService.updateValue(settingId, userOriginalSettingValue, 2 /* USER */);
  }
  async setSetting(settingId, currentSettingValue, newSettingValue) {
    this._updatedSettings.set(settingId, currentSettingValue);
    return this._configurationService.updateValue(settingId, newSettingValue, 2 /* USER */);
  }
  getActions(uri4) {
    if (uri4.scheme !== Schemas.codeSetting) {
      return;
    }
    const actions = [];
    const settingId = uri4.authority;
    const newSettingValue = this.parseValue(uri4.authority, uri4.path.substring(1));
    const currentSettingValue = this._configurationService.inspect(settingId).userValue;
    if (newSettingValue !== void 0 && newSettingValue === currentSettingValue && this._updatedSettings.has(settingId)) {
      const restoreMessage = this.restorePreviousSettingMessage(settingId);
      actions.push({
        class: void 0,
        id: "restoreSetting",
        enabled: true,
        tooltip: restoreMessage,
        label: restoreMessage,
        run: () => {
          return this.restoreSetting(settingId);
        }
      });
    } else if (newSettingValue !== void 0) {
      const setting = this.getSetting(settingId);
      const trySettingMessage = setting ? this.getSettingMessage(setting, newSettingValue) : void 0;
      if (setting && trySettingMessage) {
        actions.push({
          class: void 0,
          id: "trySetting",
          enabled: !this.isAlreadySet(setting, newSettingValue),
          tooltip: trySettingMessage,
          label: trySettingMessage,
          run: () => {
            this.setSetting(settingId, currentSettingValue, newSettingValue);
          }
        });
      }
    }
    const viewInSettingsMessage = this.viewInSettingsMessage(settingId, actions.length > 0);
    actions.push({
      class: void 0,
      enabled: true,
      id: "viewInSettings",
      tooltip: viewInSettingsMessage,
      label: viewInSettingsMessage,
      run: () => {
        return this._preferencesService.openApplicationSettings({ query: `@id:${settingId}` });
      }
    });
    actions.push({
      class: void 0,
      enabled: true,
      id: "copySettingId",
      tooltip: localize(16608, null),
      label: localize(16608, null),
      run: () => {
        this._clipboardService.writeText(settingId);
      }
    });
    return actions;
  }
  showContextMenu(uri4, x, y) {
    const actions = this.getActions(uri4);
    if (!actions) {
      return;
    }
    this._contextMenuService.showContextMenu({
      getAnchor: () => ({ x, y }),
      getActions: () => actions,
      getActionViewItem: (action) => {
        return new ActionViewItem(action, action, { label: true });
      }
    });
  }
  async updateSetting(uri4, x, y) {
    if (uri4.scheme === Schemas.codeSetting) {
      this._telemetryService.publicLog2("releaseNotesSettingAction", {
        settingId: uri4.authority
      });
      return this.showContextMenu(uri4, x, y);
    }
  }
};

SimpleSettingRenderer = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IClipboardService)
], SimpleSettingRenderer);
export { SimpleSettingRenderer };
