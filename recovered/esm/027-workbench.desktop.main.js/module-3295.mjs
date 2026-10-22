// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalProfileService.ts
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { AutoOpenBarrier } from "./module-0036.mjs";
import { hasKey, isString } from "./module-0010.mjs";
import { equals } from "./module-0007.mjs";
import { equals4 } from "./module-0098.mjs";
import { OS, isMacintosh, isWeb, isWindows } from "./module-0014.mjs";
import { registerTerminalDefaultProfileConfiguration } from "./module-1160.mjs";
import { refreshTerminalActions } from "./module-3272.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { throttle } from "./module-0250.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalContributionService } from "./module-3294.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";
import { terminalIconsEqual, terminalProfileArgsMatch } from "./module-1159.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalProfileService.ts
var TerminalProfileService = class extends Disposable {
  constructor(_contextKeyService, _configurationService, _terminalContributionService, _extensionService, _remoteAgentService, _environmentService, _terminalInstanceService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._configurationService = _configurationService;
    this._terminalContributionService = _terminalContributionService;
    this._extensionService = _extensionService;
    this._remoteAgentService = _remoteAgentService;
    this._environmentService = _environmentService;
    this._terminalInstanceService = _terminalInstanceService;
    this._contributedProfiles = [];
    this._internalContributedProfiles = [];
    this._platformConfigJustRefreshed = false;
    this._refreshTerminalActionsDisposable = this._register(new MutableDisposable());
    this._profileProviders = /* @__PURE__ */ new Map();
    this._onDidChangeAvailableProfiles = this._register(new Emitter());
    this._register(this._extensionService.onDidChangeExtensions(() => this.refreshAvailableProfiles()));
    this._webExtensionContributedProfileContextKey = TerminalContextKeys.webExtensionContributedProfile.bindTo(this._contextKeyService);
    this._updateWebContextKey();
    this._profilesReadyPromise = this._remoteAgentService.getEnvironment().then(() => {
      this._profilesReadyBarrier = new AutoOpenBarrier(2e4);
      return this._profilesReadyBarrier.wait().then(() => {
      });
    });
    this.refreshAvailableProfiles();
    this._setupConfigListener();
  }
  get onDidChangeAvailableProfiles() {
    return this._onDidChangeAvailableProfiles.event;
  }
  get profilesReady() {
    return this._profilesReadyPromise;
  }
  get availableProfiles() {
    if (!this._platformConfigJustRefreshed) {
      this.refreshAvailableProfiles();
    }
    return this._availableProfiles || [];
  }
  get contributedProfiles() {
    const userConfiguredProfileNames = this._availableProfiles?.map((p) => p.profileName) || [];
    return this._contributedProfiles?.filter((p) => !userConfiguredProfileNames.includes(p.title)) || [];
  }
  async _setupConfigListener() {
    const platformKey = await this.getPlatformKey();
    this._register(this._configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("terminal.integrated.automationProfile." /* AutomationProfile */ + platformKey) || e.affectsConfiguration("terminal.integrated.defaultProfile." /* DefaultProfile */ + platformKey) || e.affectsConfiguration("terminal.integrated.profiles." /* Profiles */ + platformKey) || e.affectsConfiguration("terminal.integrated.useWslProfiles" /* UseWslProfiles */)) {
        if (e.source !== 7 /* DEFAULT */) {
          this.refreshAvailableProfiles();
          this._platformConfigJustRefreshed = false;
        } else {
          this._platformConfigJustRefreshed = true;
        }
      }
    }));
  }
  getDefaultProfileName() {
    return this._defaultProfileName;
  }
  getDefaultProfile(os) {
    let defaultProfileName;
    if (os) {
      defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* DefaultProfile */}${this._getOsKey(os)}`);
      if (!defaultProfileName || !isString(defaultProfileName)) {
        return void 0;
      }
    } else {
      defaultProfileName = this._defaultProfileName;
    }
    if (!defaultProfileName) {
      return void 0;
    }
    return this.availableProfiles.find((e) => e.profileName === defaultProfileName && !e.isAutoDetected);
  }
  _getOsKey(os) {
    switch (os) {
      case 3 /* Linux */:
        return "linux";
      case 2 /* Macintosh */:
        return "osx";
      case 1 /* Windows */:
        return "windows";
    }
  }
  refreshAvailableProfiles() {
    this._refreshAvailableProfilesNow();
  }
  async _refreshAvailableProfilesNow() {
    const profiles2 = await this._detectProfiles(true);
    const profilesChanged = !equals(profiles2, this._availableProfiles, profilesEqual);
    const contributedProfilesChanged = await this._updateContributedProfiles();
    const platform3 = await this.getPlatformKey();
    const automationProfile = this._configurationService.getValue(`${"terminal.integrated.automationProfile." /* AutomationProfile */}${platform3}`);
    const automationProfileChanged = !equals4(automationProfile, this._automationProfile);
    if (profilesChanged || contributedProfilesChanged || automationProfileChanged) {
      this._availableProfiles = profiles2;
      this._automationProfile = automationProfile;
      this._onDidChangeAvailableProfiles.fire(this._availableProfiles);
      this._profilesReadyBarrier.open();
      this._updateWebContextKey();
      await this._refreshPlatformConfig(this._availableProfiles);
    }
  }
  async _updateContributedProfiles() {
    const platformKey = await this.getPlatformKey();
    const excludedContributedProfiles = [];
    const configProfiles = this._configurationService.getValue("terminal.integrated.profiles." /* Profiles */ + platformKey);
    for (const [profileName, value2] of Object.entries(configProfiles)) {
      if (value2 === null) {
        excludedContributedProfiles.push(profileName);
      }
    }
    const filteredContributedProfiles = [
      ...Array.from(this._terminalContributionService.terminalProfiles.filter((p) => !excludedContributedProfiles.includes(p.title))),
      ...this._internalContributedProfiles.filter((p) => !excludedContributedProfiles.includes(p.title))
    ];
    const contributedProfilesChanged = !equals(filteredContributedProfiles, this._contributedProfiles, contributedProfilesEqual);
    this._contributedProfiles = filteredContributedProfiles;
    return contributedProfilesChanged;
  }
  getContributedProfileProvider(extensionIdentifier, id2) {
    const extMap = this._profileProviders.get(extensionIdentifier);
    return extMap?.get(id2);
  }
  async _detectProfiles(includeDetectedProfiles) {
    if (isWeb && !this._environmentService.remoteAuthority) {
      const hasAnyBackend = [...this._terminalInstanceService.getRegisteredBackends()].length > 0;
      if (!hasAnyBackend) {
        return this._availableProfiles || [];
      }
    }
    const primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
    if (!primaryBackend) {
      return this._availableProfiles || [];
    }
    const platform3 = await this.getPlatformKey();
    this._defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* DefaultProfile */}${platform3}`) ?? void 0;
    return primaryBackend.getProfiles(this._configurationService.getValue(`${"terminal.integrated.profiles." /* Profiles */}${platform3}`), this._defaultProfileName, includeDetectedProfiles);
  }
  _updateWebContextKey() {
    this._webExtensionContributedProfileContextKey.set(isWeb && this._contributedProfiles.length > 0);
  }
  async _refreshPlatformConfig(profiles2) {
    const env2 = await this._remoteAgentService.getEnvironment();
    registerTerminalDefaultProfileConfiguration({ os: env2?.os || OS, profiles: profiles2 }, this._contributedProfiles);
    this._refreshTerminalActionsDisposable.value = refreshTerminalActions(profiles2);
  }
  async getPlatformKey() {
    const env2 = await this._remoteAgentService.getEnvironment();
    if (env2) {
      return env2.os === 1 /* Windows */ ? "windows" : env2.os === 2 /* Macintosh */ ? "osx" : "linux";
    }
    return isWindows ? "windows" : isMacintosh ? "osx" : "linux";
  }
  registerTerminalProfileProvider(extensionIdentifier, id2, profileProvider) {
    let extMap = this._profileProviders.get(extensionIdentifier);
    if (!extMap) {
      extMap = /* @__PURE__ */ new Map();
      this._profileProviders.set(extensionIdentifier, extMap);
    }
    extMap.set(id2, profileProvider);
    return toDisposable(() => this._profileProviders.delete(id2));
  }
  async registerContributedProfile(args2) {
    const platformKey = await this.getPlatformKey();
    const profilesConfig = await this._configurationService.getValue(`${"terminal.integrated.profiles." /* Profiles */}${platformKey}`);
    if (typeof profilesConfig === "object") {
      const newProfile = {
        extensionIdentifier: args2.extensionIdentifier,
        icon: args2.options.icon,
        id: args2.id,
        title: args2.title,
        color: args2.options.color,
        titleTemplate: args2.titleTemplate
      };
      profilesConfig[args2.title] = newProfile;
    }
    await this._configurationService.updateValue(`${"terminal.integrated.profiles." /* Profiles */}${platformKey}`, profilesConfig, 2 /* USER */);
    return;
  }
  registerInternalContributedProfile(profile) {
    this._internalContributedProfiles.push(profile);
    this.refreshAvailableProfiles();
    return toDisposable(() => {
      const idx = this._internalContributedProfiles.indexOf(profile);
      if (idx >= 0) {
        this._internalContributedProfiles.splice(idx, 1);
        this.refreshAvailableProfiles();
      }
    });
  }
  overrideDefaultProfile(extensionIdentifier, id2) {
    this._defaultProfileOverride = { extensionIdentifier, id: id2 };
    return toDisposable(() => {
      if (this._defaultProfileOverride?.extensionIdentifier === extensionIdentifier && this._defaultProfileOverride?.id === id2) {
        this._defaultProfileOverride = void 0;
      }
    });
  }
  async getContributedDefaultProfile(shellLaunchConfig) {
    if (shellLaunchConfig && !shellLaunchConfig.extHostTerminalId && !hasKey(shellLaunchConfig, { executable: true })) {
      if (this._defaultProfileOverride) {
        const overridden = this.contributedProfiles.find(
          (p) => p.extensionIdentifier === this._defaultProfileOverride.extensionIdentifier && p.id === this._defaultProfileOverride.id
        );
        if (overridden) {
          return overridden;
        }
      }
      const key3 = await this.getPlatformKey();
      const defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* DefaultProfile */}${key3}`);
      const contributedDefaultProfile = this.contributedProfiles.find((p) => p.title === defaultProfileName);
      return contributedDefaultProfile;
    }
    return void 0;
  }
};

__decorateClass([
  throttle(2e3)
], TerminalProfileService.prototype, "refreshAvailableProfiles", 1);

TerminalProfileService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITerminalContributionService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IRemoteAgentService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, ITerminalInstanceService)
], TerminalProfileService);

function profilesEqual(one, other) {
  return one.profileName === other.profileName && terminalProfileArgsMatch(one.args, other.args) && one.color === other.color && terminalIconsEqual(one.icon, other.icon) && one.isAutoDetected === other.isAutoDetected && one.isDefault === other.isDefault && one.overrideName === other.overrideName && one.path === other.path;
}

function contributedProfilesEqual(one, other) {
  return one.extensionIdentifier === other.extensionIdentifier && one.color === other.color && one.icon === other.icon && one.id === other.id && one.title === other.title && one.titleTemplate === other.titleTemplate;
}
export { profilesEqual, contributedProfilesEqual, TerminalProfileService };
