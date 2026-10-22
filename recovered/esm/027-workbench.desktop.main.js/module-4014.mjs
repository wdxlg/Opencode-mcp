// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalProfileResolverService.ts
import { Disposable } from "./module-0012.mjs";
import { getIconRegistry } from "./module-0479.mjs";
import { OS } from "./module-0014.mjs";
import { Codicon } from "./module-0085.mjs";
import { isString } from "./module-0010.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { deepClone } from "./module-0098.mjs";
import { join, parse } from "./module-0026.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { env } from "./module-0015.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { ITerminalInstanceService } from "./module-1149.mjs";
import { ITerminalProfileService } from "./module-1173.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalProfileResolverService.ts
var generatedProfileName = "Generated";

var BaseTerminalProfileResolverService = class extends Disposable {
  constructor(_context, _configurationService, _configurationResolverService, _historyService, _logService, _terminalProfileService, _workspaceContextService, _remoteAgentService) {
    super();
    this._context = _context;
    this._configurationService = _configurationService;
    this._configurationResolverService = _configurationResolverService;
    this._historyService = _historyService;
    this._logService = _logService;
    this._terminalProfileService = _terminalProfileService;
    this._workspaceContextService = _workspaceContextService;
    this._remoteAgentService = _remoteAgentService;
    this._iconRegistry = getIconRegistry();
    if (this._remoteAgentService.getConnection()) {
      this._remoteAgentService.getEnvironment().then((env2) => this._primaryBackendOs = env2?.os || OS);
    } else {
      this._primaryBackendOs = OS;
    }
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("terminal.integrated.defaultProfile.windows" /* DefaultProfileWindows */) || e.affectsConfiguration("terminal.integrated.defaultProfile.osx" /* DefaultProfileMacOs */) || e.affectsConfiguration("terminal.integrated.defaultProfile.linux" /* DefaultProfileLinux */)) {
        this._refreshDefaultProfileName();
      }
    }));
    this._register(this._terminalProfileService.onDidChangeAvailableProfiles(() => this._refreshDefaultProfileName()));
  }
  get defaultProfileName() {
    return this._defaultProfileName;
  }
  async _refreshDefaultProfileName() {
    if (this._primaryBackendOs) {
      this._defaultProfileName = (await this.getDefaultProfile({
        remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority,
        os: this._primaryBackendOs
      }))?.profileName;
    }
  }
  resolveIcon(shellLaunchConfig, os) {
    if (shellLaunchConfig.icon) {
      shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon) || this.getDefaultIcon();
      return;
    }
    if (shellLaunchConfig.customPtyImplementation) {
      shellLaunchConfig.icon = this.getDefaultIcon();
      return;
    }
    if (shellLaunchConfig.executable) {
      return;
    }
    const defaultProfile = this._getUnresolvedRealDefaultProfile(os);
    if (defaultProfile) {
      shellLaunchConfig.icon = defaultProfile.icon;
    }
    if (!shellLaunchConfig.icon) {
      shellLaunchConfig.icon = this.getDefaultIcon();
    }
  }
  getDefaultIcon(resource) {
    return this._iconRegistry.getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon" /* TabsDefaultIcon */, { resource })) || Codicon.terminal;
  }
  async resolveShellLaunchConfig(shellLaunchConfig, options3) {
    let resolvedProfile;
    if (shellLaunchConfig.executable) {
      resolvedProfile = await this._resolveProfile({
        path: shellLaunchConfig.executable,
        args: shellLaunchConfig.args,
        profileName: generatedProfileName,
        isDefault: false
      }, options3);
    } else {
      resolvedProfile = await this.getDefaultProfile(options3);
    }
    shellLaunchConfig.executable = resolvedProfile.path;
    shellLaunchConfig.args = resolvedProfile.args;
    if (resolvedProfile.env) {
      if (shellLaunchConfig.env) {
        shellLaunchConfig.env = { ...shellLaunchConfig.env, ...resolvedProfile.env };
      } else {
        shellLaunchConfig.env = resolvedProfile.env;
      }
    }
    const resource = shellLaunchConfig === void 0 || isString(shellLaunchConfig.cwd) ? void 0 : shellLaunchConfig.cwd;
    shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon) || this._getCustomIcon(resolvedProfile.icon) || this.getDefaultIcon(resource);
    if (resolvedProfile.overrideName) {
      shellLaunchConfig.name = resolvedProfile.profileName;
    }
    shellLaunchConfig.color = shellLaunchConfig.color || resolvedProfile.color || this._configurationService.getValue("terminal.integrated.tabs.defaultColor" /* TabsDefaultColor */, { resource });
    if (shellLaunchConfig.useShellEnvironment === void 0) {
      shellLaunchConfig.useShellEnvironment = this._configurationService.getValue("terminal.integrated.inheritEnv" /* InheritEnv */);
    }
  }
  async getDefaultShell(options3) {
    return (await this.getDefaultProfile(options3)).path;
  }
  async getDefaultShellArgs(options3) {
    return (await this.getDefaultProfile(options3)).args || [];
  }
  async getDefaultProfile(options3) {
    return this._resolveProfile(await this._getUnresolvedDefaultProfile(options3), options3);
  }
  getEnvironment(remoteAuthority) {
    return this._context.getEnvironment(remoteAuthority);
  }
  _getCustomIcon(icon2) {
    if (!icon2) {
      return void 0;
    }
    if (isString(icon2)) {
      return ThemeIcon.fromId(icon2);
    }
    if (ThemeIcon.isThemeIcon(icon2)) {
      return icon2;
    }
    if (URI.isUri(icon2) || isUriComponents(icon2)) {
      return URI.revive(icon2);
    }
    if ((URI.isUri(icon2.light) || isUriComponents(icon2.light)) && (URI.isUri(icon2.dark) || isUriComponents(icon2.dark))) {
      return { light: URI.revive(icon2.light), dark: URI.revive(icon2.dark) };
    }
    return void 0;
  }
  async _getUnresolvedDefaultProfile(options3) {
    if (options3.allowAgentHostShell) {
      const raw = this._configurationService.getValue(`terminal.integrated.agentHostProfile.${this._getOsKey(options3.os)}`);
      if (isString(raw)) {
        await this._terminalProfileService.profilesReady;
      }
      const agentHostShellProfile = this._getUnresolvedAgentHostShellProfile(options3);
      if (agentHostShellProfile) {
        return agentHostShellProfile;
      }
    }
    if (options3.allowAutomationShell) {
      const automationShellProfile = this._getUnresolvedAutomationShellProfile(options3);
      if (automationShellProfile) {
        return automationShellProfile;
      }
    }
    await this._terminalProfileService.profilesReady;
    const defaultProfile = this._getUnresolvedRealDefaultProfile(options3.os);
    if (defaultProfile) {
      return this._setIconForAutomation(options3, defaultProfile);
    }
    return this._setIconForAutomation(options3, await this._getUnresolvedFallbackDefaultProfile(options3));
  }
  _setIconForAutomation(options3, profile) {
    if (options3.allowAutomationShell) {
      const profileClone = deepClone(profile);
      profileClone.icon = Codicon.tools;
      return profileClone;
    }
    return profile;
  }
  _getUnresolvedRealDefaultProfile(os) {
    return this._terminalProfileService.getDefaultProfile(os);
  }
  async _getUnresolvedFallbackDefaultProfile(options3) {
    const executable = await this._context.getDefaultSystemShell(options3.remoteAuthority, options3.os);
    if (options3.os === OS) {
      let existingProfile = this._terminalProfileService.availableProfiles.find((e) => parse(e.path).name === parse(executable).name);
      if (existingProfile) {
        if (options3.allowAutomationShell) {
          existingProfile = deepClone(existingProfile);
          existingProfile.icon = Codicon.tools;
        }
        return existingProfile;
      }
    }
    let args2;
    if (options3.os === 2 /* Macintosh */ && parse(executable).name.match(/(zsh|bash)/)) {
      args2 = ["--login"];
    } else {
      args2 = [];
    }
    const icon2 = this._guessProfileIcon(executable);
    return {
      profileName: generatedProfileName,
      path: executable,
      args: args2,
      icon: icon2,
      isDefault: false
    };
  }
  _getUnresolvedAutomationShellProfile(options3) {
    const automationProfile = this._configurationService.getValue(`terminal.integrated.automationProfile.${this._getOsKey(options3.os)}`);
    if (this._isValidAutomationProfile(automationProfile, options3.os)) {
      automationProfile.icon = this._getCustomIcon(automationProfile.icon) || Codicon.tools;
      return automationProfile;
    }
    return void 0;
  }
  _getUnresolvedAgentHostShellProfile(options3) {
    const agentHostProfile = this._configurationService.getValue(`terminal.integrated.agentHostProfile.${this._getOsKey(options3.os)}`);
    if (isString(agentHostProfile)) {
      const named = this._terminalProfileService.availableProfiles.find((p) => p.profileName === agentHostProfile && !p.isAutoDetected);
      if (named) {
        const cloned = deepClone(named);
        cloned.icon = this._getCustomIcon(cloned.icon) || Codicon.tools;
        return cloned;
      }
      return void 0;
    }
    if (this._isValidAutomationProfile(agentHostProfile, options3.os)) {
      agentHostProfile.icon = this._getCustomIcon(agentHostProfile.icon) || Codicon.tools;
      return agentHostProfile;
    }
    return void 0;
  }
  async _resolveProfile(profile, options3) {
    const env2 = await this._context.getEnvironment(options3.remoteAuthority);
    if (options3.os === 1 /* Windows */) {
      const isWoW64 = !!env2.hasOwnProperty("PROCESSOR_ARCHITEW6432");
      const windir = env2.windir;
      if (!isWoW64 && windir) {
        const sysnativePath = join(windir, "Sysnative").replace(/\//g, "\\").toLowerCase();
        if (profile.path && profile.path.toLowerCase().indexOf(sysnativePath) === 0) {
          profile.path = join(windir, "System32", profile.path.substr(sysnativePath.length + 1));
        }
      }
      if (profile.path) {
        profile.path = profile.path.replace(/\//g, "\\");
      }
    }
    const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(options3.remoteAuthority ? Schemas.vscodeRemote : Schemas.file);
    const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    profile.path = await this._resolveVariables(profile.path, env2, lastActiveWorkspace);
    if (profile.args) {
      if (isString(profile.args)) {
        profile.args = await this._resolveVariables(profile.args, env2, lastActiveWorkspace);
      } else {
        profile.args = await Promise.all(profile.args.map((arg) => this._resolveVariables(arg, env2, lastActiveWorkspace)));
      }
    }
    return profile;
  }
  async _resolveVariables(value2, env2, lastActiveWorkspace) {
    try {
      value2 = await this._configurationResolverService.resolveWithEnvironment(env2, lastActiveWorkspace, value2);
    } catch (e) {
      this._logService.error(`Could not resolve shell`, e);
    }
    return value2;
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
  _guessProfileIcon(shell) {
    const file = parse(shell).name;
    switch (file) {
      case "bash":
        return Codicon.terminalBash;
      case "pwsh":
      case "powershell":
        return Codicon.terminalPowershell;
      case "tmux":
        return Codicon.terminalTmux;
      case "cmd":
        return Codicon.terminalCmd;
      default:
        return void 0;
    }
  }
  _isValidAutomationProfile(profile, os) {
    if (profile === null || profile === void 0 || typeof profile !== "object") {
      return false;
    }
    if ("path" in profile && isString(profile.path)) {
      return true;
    }
    return false;
  }
};

__decorateClass([
  debounce(200)
], BaseTerminalProfileResolverService.prototype, "_refreshDefaultProfileName", 1);

var BrowserTerminalProfileResolverService = class extends BaseTerminalProfileResolverService {
  constructor(configurationResolverService, configurationService, historyService, logService, terminalInstanceService, terminalProfileService, workspaceContextService, remoteAgentService) {
    super(
      {
        getDefaultSystemShell: async (remoteAuthority, os) => {
          const backend = await terminalInstanceService.getBackend(remoteAuthority);
          if (!remoteAuthority || !backend) {
            return os === 1 /* Windows */ ? "pwsh" : "bash";
          }
          return backend.getDefaultSystemShell(os);
        },
        getEnvironment: async (remoteAuthority) => {
          const backend = await terminalInstanceService.getBackend(remoteAuthority);
          if (!remoteAuthority || !backend) {
            return env;
          }
          return backend.getEnvironment();
        }
      },
      configurationService,
      configurationResolverService,
      historyService,
      logService,
      terminalProfileService,
      workspaceContextService,
      remoteAgentService
    );
  }
};

BrowserTerminalProfileResolverService = __decorateClass([
  __decorateParam(0, IConfigurationResolverService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, ITerminalInstanceService),
  __decorateParam(5, ITerminalProfileService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IRemoteAgentService)
], BrowserTerminalProfileResolverService);
export { generatedProfileName, BaseTerminalProfileResolverService, BrowserTerminalProfileResolverService };
