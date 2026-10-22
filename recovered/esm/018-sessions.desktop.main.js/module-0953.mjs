// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/assignment/common/assignment.ts
import { PlatformToString, language, platform } from "./module-0014.mjs";


// src/vs/platform/assignment/common/assignment.ts
var ASSIGNMENT_STORAGE_KEY = "VSCode.ABExp.FeatureData";

var ASSIGNMENT_REFETCH_INTERVAL = 60 * 60 * 1e3;

var Filters = /* @__PURE__ */ ((Filters2) => {
  Filters2["Market"] = "X-MSEdge-Market";
  Filters2["CorpNet"] = "X-FD-Corpnet";
  Filters2["ApplicationVersion"] = "X-VSCode-AppVersion";
  Filters2["Build"] = "X-VSCode-Build";
  Filters2["ClientId"] = "X-MSEdge-ClientId";
  Filters2["DeveloperDeviceId"] = "X-VSCode-DevDeviceId";
  Filters2["ExtensionName"] = "X-VSCode-ExtensionName";
  Filters2["ExtensionVersion"] = "X-VSCode-ExtensionVersion";
  Filters2["Language"] = "X-VSCode-Language";
  Filters2["TargetPopulation"] = "X-VSCode-TargetPopulation";
  Filters2["Platform"] = "X-VSCode-Platform";
  Filters2["ReleaseDate"] = "X-VSCode-ReleaseDate";
  Filters2["WindowKind"] = "X-VSCode-WindowKind";
  return Filters2;
})(Filters || {});

var AssignmentFilterProvider = class {
  constructor(version2, appName, machineId, devDeviceId, targetPopulation, releaseDate, windowKind) {
    this.version = version2;
    this.appName = appName;
    this.machineId = machineId;
    this.devDeviceId = devDeviceId;
    this.targetPopulation = targetPopulation;
    this.releaseDate = releaseDate;
    this.windowKind = windowKind;
  }
  getFilterValue(filter2) {
    switch (filter2) {
      case "X-VSCode-AppVersion" /* ApplicationVersion */:
        return trimVersionSuffix(this.version);
      // productService.version
      case "X-VSCode-Build" /* Build */:
        return this.appName;
      // productService.nameLong
      case "X-MSEdge-ClientId" /* ClientId */:
        return this.machineId;
      case "X-VSCode-DevDeviceId" /* DeveloperDeviceId */:
        return this.devDeviceId;
      case "X-VSCode-Language" /* Language */:
        return language;
      case "X-VSCode-ExtensionName" /* ExtensionName */:
        return "vscode-core";
      // always return vscode-core for exp service
      case "X-VSCode-ExtensionVersion" /* ExtensionVersion */:
        return "999999.0";
      // always return a very large number for cross-extension experimentation
      case "X-VSCode-TargetPopulation" /* TargetPopulation */:
        return this.targetPopulation;
      case "X-VSCode-Platform" /* Platform */:
        return PlatformToString(platform);
      case "X-VSCode-ReleaseDate" /* ReleaseDate */:
        return formatReleaseDate(this.releaseDate);
      case "X-VSCode-WindowKind" /* WindowKind */:
        return this.windowKind;
      default:
        return "";
    }
  }
  getFilters() {
    const filters2 = /* @__PURE__ */ new Map();
    const filterValues = Object.values(Filters);
    for (const value2 of filterValues) {
      filters2.set(value2, this.getFilterValue(value2));
    }
    return filters2;
  }
};

function trimVersionSuffix(version2) {
  return version2.split(/\-[a-zA-Z0-9]+$/)[0];
}

function formatReleaseDate(iso) {
  if (!iso) {
    return "";
  }
  const match2 = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2})/.exec(iso);
  if (!match2) {
    return "";
  }
  return match2.slice(1, 5).join("");
}

var AssignmentsFilters = /* @__PURE__ */ ((AssignmentsFilters2) => {
  AssignmentsFilters2["ApplicationVersion"] = "vscode_core_appversion";
  AssignmentsFilters2["Build"] = "vscode_core_build";
  AssignmentsFilters2["DeveloperDeviceId"] = "devdeviceid";
  AssignmentsFilters2["ExtensionName"] = "vscode_core_extensionname";
  AssignmentsFilters2["ExtensionNameShort"] = "extensionname";
  AssignmentsFilters2["TargetPopulation"] = "vscode_core_targetpopulation";
  AssignmentsFilters2["Platform"] = "vscode_core_platform";
  AssignmentsFilters2["ReleaseDate"] = "vscode_core_releasedate";
  AssignmentsFilters2["WindowKind"] = "vscode_core_windowkind";
  return AssignmentsFilters2;
})(AssignmentsFilters || {});

var VSCodeCoreAssignmentsFilterProvider = class {
  constructor(version2, appName, devDeviceId, targetPopulation, releaseDate, windowKind) {
    this.version = version2;
    this.appName = appName;
    this.devDeviceId = devDeviceId;
    this.targetPopulation = targetPopulation;
    this.releaseDate = releaseDate;
    this.windowKind = windowKind;
  }
  getFilterValue(filter2) {
    switch (filter2) {
      case "vscode_core_appversion" /* ApplicationVersion */:
        return trimVersionSuffix(this.version);
      case "vscode_core_build" /* Build */:
        return this.appName;
      case "devdeviceid" /* DeveloperDeviceId */:
        return this.devDeviceId;
      case "vscode_core_extensionname" /* ExtensionName */:
      case "extensionname" /* ExtensionNameShort */:
        return "vscode-core";
      case "vscode_core_targetpopulation" /* TargetPopulation */:
        return this.targetPopulation;
      case "vscode_core_platform" /* Platform */:
        return PlatformToString(platform);
      case "vscode_core_releasedate" /* ReleaseDate */:
        return formatReleaseDate(this.releaseDate);
      case "vscode_core_windowkind" /* WindowKind */:
        return this.windowKind;
      default:
        return null;
    }
  }
  getFilters() {
    const filters2 = /* @__PURE__ */ new Map();
    for (const value2 of Object.values(AssignmentsFilters)) {
      filters2.set(value2, this.getFilterValue(value2));
    }
    return filters2;
  }
};

function getInternalOrg(organisations) {
  const isVSCodeInternal = organisations?.includes("Visual-Studio-Code");
  const isGitHubInternal = organisations?.includes("github");
  const isMicrosoftInternal = organisations?.includes("microsoft") || organisations?.includes("ms-copilot") || organisations?.includes("MicrosoftCopilot");
  return isVSCodeInternal ? "vscode" : isGitHubInternal ? "github" : isMicrosoftInternal ? "microsoft" : void 0;
}

function isInternalAccount(isStaff, organisations) {
  return isStaff === true || getInternalOrg(organisations) !== void 0;
}
export { trimVersionSuffix, formatReleaseDate, getInternalOrg, isInternalAccount, ASSIGNMENT_STORAGE_KEY, ASSIGNMENT_REFETCH_INTERVAL, Filters, AssignmentFilterProvider, AssignmentsFilters, VSCodeCoreAssignmentsFilterProvider };
