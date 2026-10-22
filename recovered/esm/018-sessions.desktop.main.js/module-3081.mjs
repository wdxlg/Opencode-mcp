// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalProfileQuickpick.ts
import { hasKey, isString } from "./module-0010.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { createColorStyleElement, getColorClass, getUriClasses } from "./module-1175.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Event2 } from "./module-0017.mjs";
import { configureTerminalProfileIcon } from "./module-2326.mjs";
import { Codicon } from "./module-0085.mjs";
import { basename } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalProfileResolverService, ITerminalProfileService } from "./module-1174.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalProfileQuickpick.ts
var TerminalProfileQuickpick = class {
  constructor(_terminalProfileService, _terminalProfileResolverService, _configurationService, _quickInputService, _themeService, _notificationService) {
    this._terminalProfileService = _terminalProfileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._configurationService = _configurationService;
    this._quickInputService = _quickInputService;
    this._themeService = _themeService;
    this._notificationService = _notificationService;
  }
  async showAndGetResult(type) {
    const platformKey = await this._terminalProfileService.getPlatformKey();
    const profilesKey = "terminal.integrated.profiles." /* Profiles */ + platformKey;
    const result = await this._createAndShow(type);
    const defaultProfileKey = `${"terminal.integrated.defaultProfile." /* DefaultProfile */}${platformKey}`;
    if (!result) {
      return;
    }
    if (type === "setDefault") {
      if (hasKey(result.profile, { id: true })) {
        await this._configurationService.updateValue(defaultProfileKey, result.profile.title, 2 /* USER */);
        return {
          config: {
            extensionIdentifier: result.profile.extensionIdentifier,
            id: result.profile.id,
            title: result.profile.title,
            options: {
              color: result.profile.color,
              icon: result.profile.icon
            }
          },
          keyMods: result.keyMods
        };
      }
      if (hasKey(result.profile, { profileName: true })) {
        const profilesConfig = await this._configurationService.getValue(profilesKey);
        if (typeof profilesConfig === "object") {
          const newProfile = {
            path: result.profile.path
          };
          if (result.profile.args) {
            newProfile.args = result.profile.args;
          }
          profilesConfig[result.profile.profileName] = this._createNewProfileConfig(result.profile);
          await this._configurationService.updateValue(profilesKey, profilesConfig, 2 /* USER */);
        }
      }
      await this._configurationService.updateValue(defaultProfileKey, result.profileName, 2 /* USER */);
    } else if (type === "createInstance") {
      if (hasKey(result.profile, { id: true })) {
        const config = {
          extensionIdentifier: result.profile.extensionIdentifier,
          id: result.profile.id,
          title: result.profile.title,
          options: {
            icon: result.profile.icon,
            color: result.profile.color
          }
        };
        if (result.profile.titleTemplate !== void 0) {
          config.titleTemplate = result.profile.titleTemplate;
        }
        return {
          config,
          keyMods: result.keyMods
        };
      } else {
        return { config: result.profile, keyMods: result.keyMods };
      }
    }
    return hasKey(result.profile, { profileName: true }) ? result.profile.profileName : result.profile.title;
  }
  async _createAndShow(type) {
    const platformKey = await this._terminalProfileService.getPlatformKey();
    const profiles2 = this._terminalProfileService.availableProfiles;
    const profilesKey = "terminal.integrated.profiles." /* Profiles */ + platformKey;
    const defaultProfileName = this._terminalProfileService.getDefaultProfileName();
    let keyMods;
    const options3 = {
      placeHolder: type === "createInstance" ? localize(20065, null) : localize(20064, null),
      onDidTriggerItemButton: async (context2) => {
        if (!await this._isProfileSafe(context2.item.profile)) {
          return;
        }
        if (hasKey(context2.item.profile, { id: true })) {
          return;
        }
        const configProfiles2 = this._configurationService.getValue("terminal.integrated.profiles." /* Profiles */ + platformKey);
        const existingProfiles = !!configProfiles2 ? Object.keys(configProfiles2) : [];
        const name = await this._quickInputService.input({
          prompt: localize(20062, null),
          value: context2.item.profile.profileName,
          validateInput: async (input) => {
            if (existingProfiles.includes(input)) {
              return localize(20066, null);
            }
            return void 0;
          }
        });
        if (!name) {
          return;
        }
        const newConfigValue = {
          ...configProfiles2,
          [name]: this._createNewProfileConfig(context2.item.profile)
        };
        await this._configurationService.updateValue(profilesKey, newConfigValue, 2 /* USER */);
      },
      onKeyMods: (mods) => keyMods = mods
    };
    const quickPickItems = [];
    const configProfiles = profiles2.filter((e4) => !e4.isAutoDetected);
    const autoDetectedProfiles = profiles2.filter((e4) => e4.isAutoDetected);
    if (configProfiles.length > 0) {
      quickPickItems.push({ type: "separator", label: localize(20067, null) });
      quickPickItems.push(...this._sortProfileQuickPickItems(configProfiles.map((e4) => this._createProfileQuickPickItem(e4)), defaultProfileName));
    }
    quickPickItems.push({ type: "separator", label: localize(20063, null) });
    const contributedProfiles = [];
    for (const contributed of this._terminalProfileService.contributedProfiles) {
      let icon2;
      if (isString(contributed.icon)) {
        if (contributed.icon.startsWith("$(")) {
          icon2 = ThemeIcon.fromString(contributed.icon);
        } else {
          icon2 = ThemeIcon.fromId(contributed.icon);
        }
      }
      if (!icon2 || !getIconRegistry().getIcon(icon2.id)) {
        icon2 = this._terminalProfileResolverService.getDefaultIcon();
      }
      const uriClasses = getUriClasses(contributed, this._themeService.getColorTheme().type, true);
      const colorClass = getColorClass(contributed);
      const iconClasses = [];
      if (uriClasses) {
        iconClasses.push(...uriClasses);
      }
      if (colorClass) {
        iconClasses.push(colorClass);
      }
      contributedProfiles.push({
        label: `$(${icon2.id}) ${contributed.title}`,
        profile: {
          extensionIdentifier: contributed.extensionIdentifier,
          title: contributed.title,
          icon: contributed.icon,
          id: contributed.id,
          color: contributed.color,
          titleTemplate: contributed.titleTemplate
        },
        profileName: contributed.title,
        iconClasses
      });
    }
    if (contributedProfiles.length > 0) {
      quickPickItems.push(...this._sortProfileQuickPickItems(contributedProfiles, defaultProfileName));
    }
    if (autoDetectedProfiles.length > 0) {
      quickPickItems.push({ type: "separator", label: localize(20068, null) });
      quickPickItems.push(...this._sortProfileQuickPickItems(autoDetectedProfiles.map((e4) => this._createProfileQuickPickItem(e4)), defaultProfileName));
    }
    const colorStyleDisposable = createColorStyleElement(this._themeService.getColorTheme());
    const result = await this._quickInputService.pick(quickPickItems, options3);
    colorStyleDisposable.dispose();
    if (!result) {
      return void 0;
    }
    if (!await this._isProfileSafe(result.profile)) {
      return void 0;
    }
    if (keyMods) {
      result.keyMods = keyMods;
    }
    return result;
  }
  _createNewProfileConfig(profile) {
    const result = { path: profile.path };
    if (profile.args) {
      result.args = profile.args;
    }
    if (profile.env) {
      result.env = profile.env;
    }
    return result;
  }
  async _isProfileSafe(profile) {
    const isUnsafePath = hasKey(profile, { profileName: true }) && profile.isUnsafePath;
    const requiresUnsafePath = hasKey(profile, { profileName: true }) && profile.requiresUnsafePath;
    if (!isUnsafePath && !requiresUnsafePath) {
      return true;
    }
    return await new Promise((r2) => {
      const unsafePaths = [];
      if (isUnsafePath) {
        unsafePaths.push(profile.path);
      }
      if (requiresUnsafePath) {
        unsafePaths.push(requiresUnsafePath);
      }
      const handle2 = this._notificationService.prompt(
        Severity2.Warning,
        localize(20069, null, `"${unsafePaths.join(",")}"`),
        [{
          label: localize(20070, null),
          run: () => r2(true)
        }, {
          label: localize(20060, null),
          run: () => r2(false)
        }]
      );
      Event2.once(handle2.onDidClose)(() => {
        r2(false);
      });
    });
  }
  _createProfileQuickPickItem(profile) {
    const buttons = [{
      iconClass: ThemeIcon.asClassName(configureTerminalProfileIcon),
      tooltip: localize(20061, null)
    }];
    const icon2 = profile.icon && ThemeIcon.isThemeIcon(profile.icon) ? profile.icon : Codicon.terminal;
    const label3 = `$(${icon2.id}) ${profile.profileName}`;
    const friendlyPath = profile.isFromPath ? basename(profile.path) : profile.path;
    const colorClass = getColorClass(profile);
    const iconClasses = [];
    if (colorClass) {
      iconClasses.push(colorClass);
    }
    if (profile.args) {
      if (isString(profile.args)) {
        return { label: label3, description: `${profile.path} ${profile.args}`, profile, profileName: profile.profileName, buttons, iconClasses };
      }
      const argsString = profile.args.map((e4) => {
        if (e4.includes(" ")) {
          return `"${e4.replace(/"/g, '\\"')}"`;
        }
        return e4;
      }).join(" ");
      return { label: label3, description: `${friendlyPath} ${argsString}`, profile, profileName: profile.profileName, buttons, iconClasses };
    }
    return { label: label3, description: friendlyPath, profile, profileName: profile.profileName, buttons, iconClasses };
  }
  _sortProfileQuickPickItems(items, defaultProfileName) {
    return items.sort((a, b) => {
      if (b.profileName === defaultProfileName) {
        return 1;
      }
      if (a.profileName === defaultProfileName) {
        return -1;
      }
      return a.profileName.localeCompare(b.profileName);
    });
  }
};

TerminalProfileQuickpick = __decorateClass([
  __decorateParam(0, ITerminalProfileService),
  __decorateParam(1, ITerminalProfileResolverService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, INotificationService)
], TerminalProfileQuickpick);
export { TerminalProfileQuickpick };
