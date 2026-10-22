// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/issue/electron-browser/issueService.ts
import { DeferredPromise } from "./module-0036.mjs";
import { getZoomLevel } from "./module-0018.mjs";
import { mainWindow } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IIssueFormService, IWorkbenchIssueService } from "./module-1852.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IExtensionManagementService } from "./module-0874.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IIntegrityService } from "./module-3823.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { SIDE_BAR_BACKGROUND } from "./module-0868.mjs";
import { foreground, textLinkActiveForeground, textLinkForeground } from "./module-0227.mjs";
import { buttonBackground, buttonForeground, buttonHoverBackground, inputActiveOptionBorder, inputBackground, inputBorder, inputForeground, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground } from "./module-0233.mjs";
import { scrollbarSliderActiveBackground, scrollbarSliderHoverBackground } from "./module-0228.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/issue/electron-browser/issueService.ts
var NativeIssueService = class {
  constructor(issueFormService, themeService, extensionManagementService, extensionEnablementService, workspaceTrustManagementService, experimentService, authenticationService, integrityService, environmentService, configurationService) {
    this.issueFormService = issueFormService;
    this.themeService = themeService;
    this.extensionManagementService = extensionManagementService;
    this.extensionEnablementService = extensionEnablementService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.experimentService = experimentService;
    this.authenticationService = authenticationService;
    this.integrityService = integrityService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
  }
  async openReporter(dataOverrides = {}) {
    const useWizard = this.configurationService.getValue("issueReporter.wizard.enabled");
    if (useWizard) {
      return this.openWizardReporter(dataOverrides);
    } else {
      return this.openLegacyReporter(dataOverrides);
    }
  }
  async openWizardReporter(dataOverrides) {
    const theme = this.themeService.getColorTheme();
    const extensionsLoaded = new DeferredPromise();
    const dataComplete = new DeferredPromise();
    const issueReporterData = Object.assign({
      styles: getIssueReporterStyles(theme),
      zoomLevel: getZoomLevel(mainWindow),
      enabledExtensions: [],
      whenExtensionsLoaded: extensionsLoaded.p,
      whenDataComplete: dataComplete.p,
      restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
      isInstallationPure: true,
      isSessionsWindow: this.environmentService.isSessionsWindow,
      githubAccessToken: ""
    }, dataOverrides);
    const openPromise = this.issueFormService.openReporter(issueReporterData);
    this.populateReporterDataAsync(issueReporterData, dataOverrides, extensionsLoaded).then(() => dataComplete.complete(), () => dataComplete.complete());
    return openPromise;
  }
  async openLegacyReporter(dataOverrides) {
    const extensionData = [];
    try {
      const extensions = await this.extensionManagementService.getInstalled();
      const enabledExtensions = extensions.filter((extension) => this.extensionEnablementService.isEnabled(extension) || dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId);
      extensionData.push(...enabledExtensions.map((extension) => {
        const { manifest } = extension;
        const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
        const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === "themes";
        const isBuiltin = extension.type === 0 /* System */;
        return {
          name: manifest.name,
          publisher: manifest.publisher,
          version: manifest.version,
          repositoryUrl: manifest.repository && manifest.repository.url,
          bugsUrl: manifest.bugs && manifest.bugs.url,
          displayName: manifest.displayName,
          id: extension.identifier.id,
          data: dataOverrides.data,
          uri: dataOverrides.uri,
          isTheme,
          isBuiltin,
          extensionData: "Extensions data loading"
        };
      }));
    } catch (e4) {
      extensionData.push({
        name: "Extensions not loaded",
        publisher: void 0,
        version: "",
        id: "extensions-load-error",
        isTheme: false,
        isBuiltin: false,
        displayName: void 0,
        repositoryUrl: void 0,
        bugsUrl: void 0,
        extensionData: `Extensions could not be loaded: ${e4 instanceof Error ? e4.message : String(e4)}`
      });
    }
    const experiments = await this.experimentService.getCurrentExperiments();
    let githubAccessToken = "";
    try {
      const githubSessions = await this.authenticationService.getSessions("github");
      const repoSession = githubSessions.find((session) => session.scopes.includes("repo"));
      githubAccessToken = repoSession?.accessToken ?? "";
    } catch (e4) {
    }
    let isInstallationPure = true;
    try {
      isInstallationPure = (await this.integrityService.isPure()).isPure;
    } catch (e4) {
    }
    const theme = this.themeService.getColorTheme();
    const issueReporterData = Object.assign({
      styles: getIssueReporterStyles(theme),
      zoomLevel: getZoomLevel(mainWindow),
      enabledExtensions: extensionData,
      experiments: experiments?.join("\n"),
      restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
      isInstallationPure,
      isSessionsWindow: this.environmentService.isSessionsWindow,
      githubAccessToken
    }, dataOverrides);
    return this.issueFormService.openReporter(issueReporterData);
  }
  async populateReporterDataAsync(data, dataOverrides, extensionsLoaded) {
    try {
      const extensions = await this.extensionManagementService.getInstalled();
      const enabledExtensions = extensions.filter((extension) => this.extensionEnablementService.isEnabled(extension) || dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId);
      data.enabledExtensions = enabledExtensions.map((extension) => {
        const { manifest } = extension;
        const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
        const isTheme = !manifest.main && !manifest.browser && manifestKeys.length === 1 && manifestKeys[0] === "themes";
        const isBuiltin = extension.type === 0 /* System */;
        return {
          name: manifest.name,
          publisher: manifest.publisher,
          version: manifest.version,
          repositoryUrl: manifest.repository && manifest.repository.url,
          bugsUrl: manifest.bugs && manifest.bugs.url,
          displayName: manifest.displayName,
          id: extension.identifier.id,
          data: dataOverrides.data,
          uri: dataOverrides.uri,
          isTheme,
          isBuiltin,
          extensionData: "Extensions data loading"
        };
      });
    } catch (e4) {
    } finally {
      extensionsLoaded?.complete();
    }
    try {
      const experiments = await this.experimentService.getCurrentExperiments();
      data.experiments = experiments?.join("\n");
    } catch (e4) {
    }
    try {
      const githubSessions = await this.authenticationService.getSessions("github");
      const repoSession = githubSessions.find((session) => session.scopes.includes("repo"));
      data.githubAccessToken = repoSession?.accessToken ?? "";
    } catch (e4) {
    }
    try {
      data.isInstallationPure = (await this.integrityService.isPure()).isPure;
    } catch (e4) {
    }
  }
};

NativeIssueService = __decorateClass([
  __decorateParam(0, IIssueFormService),
  __decorateParam(1, IThemeService),
  __decorateParam(2, IExtensionManagementService),
  __decorateParam(3, IWorkbenchExtensionEnablementService),
  __decorateParam(4, IWorkspaceTrustManagementService),
  __decorateParam(5, IWorkbenchAssignmentService),
  __decorateParam(6, IAuthenticationService),
  __decorateParam(7, IIntegrityService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IConfigurationService)
], NativeIssueService);

function getIssueReporterStyles(theme) {
  return {
    backgroundColor: getColor2(theme, SIDE_BAR_BACKGROUND),
    color: getColor2(theme, foreground),
    textLinkColor: getColor2(theme, textLinkForeground),
    textLinkActiveForeground: getColor2(theme, textLinkActiveForeground),
    inputBackground: getColor2(theme, inputBackground),
    inputForeground: getColor2(theme, inputForeground),
    inputBorder: getColor2(theme, inputBorder),
    inputActiveBorder: getColor2(theme, inputActiveOptionBorder),
    inputErrorBorder: getColor2(theme, inputValidationErrorBorder),
    inputErrorBackground: getColor2(theme, inputValidationErrorBackground),
    inputErrorForeground: getColor2(theme, inputValidationErrorForeground),
    buttonBackground: getColor2(theme, buttonBackground),
    buttonForeground: getColor2(theme, buttonForeground),
    buttonHoverBackground: getColor2(theme, buttonHoverBackground),
    sliderActiveColor: getColor2(theme, scrollbarSliderActiveBackground),
    sliderBackgroundColor: getColor2(theme, SIDE_BAR_BACKGROUND),
    sliderHoverColor: getColor2(theme, scrollbarSliderHoverBackground)
  };
}

function getColor2(theme, key3) {
  const color2 = theme.getColor(key3);
  return color2 ? color2.toString() : void 0;
}

registerSingleton(IWorkbenchIssueService, NativeIssueService, 1 /* Delayed */);
export { getIssueReporterStyles, getColor2, NativeIssueService };
