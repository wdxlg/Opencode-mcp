// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/assignment/common/assignmentFilters.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { getInternalOrg } from "./module-0952.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";


// src/vs/workbench/services/assignment/common/assignmentFilters.ts
var ExtensionsFilter = /* @__PURE__ */ ((ExtensionsFilter2) => {
  ExtensionsFilter2["CopilotExtensionVersion"] = "X-Copilot-RelatedPluginVersion-githubcopilot";
  ExtensionsFilter2["CopilotChatExtensionVersion"] = "X-Copilot-RelatedPluginVersion-githubcopilotchat";
  ExtensionsFilter2["CompletionsVersionInCopilotChat"] = "X-VSCode-CompletionsInChatExtensionVersion";
  ExtensionsFilter2["CopilotSku"] = "X-GitHub-Copilot-SKU";
  ExtensionsFilter2["MicrosoftInternalOrg"] = "X-Microsoft-Internal-Org";
  ExtensionsFilter2["CopilotTrackingId"] = "X-Copilot-CopilotTrackingId";
  ExtensionsFilter2["CopilotIsSn"] = "X-GitHub-Copilot-IsSn";
  ExtensionsFilter2["CopilotIsFcv1"] = "X-GitHub-Copilot-IsFcv1";
  return ExtensionsFilter2;
})(ExtensionsFilter || {});

var CopilotAssignmentFilterProvider = class extends Disposable {
  constructor(_extensionService, _logService, _storageService, _chatEntitlementService, _defaultAccountService) {
    super();
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._chatEntitlementService = _chatEntitlementService;
    this._defaultAccountService = _defaultAccountService;
    this._onDidChangeFilters = this._register(new Emitter());
    this.onDidChangeFilters = this._onDidChangeFilters.event;
    this.copilotExtensionVersion = this._storageService.get("extensionsAssignmentFilterProvider.copilotExtensionVersion" /* CopilotExtensionVersion */, 0 /* PROFILE */);
    this.copilotChatExtensionVersion = this._storageService.get("extensionsAssignmentFilterProvider.copilotChatExtensionVersion" /* CopilotChatExtensionVersion */, 0 /* PROFILE */);
    this.copilotCompletionsVersion = this._storageService.get("extensionsAssignmentFilterProvider.copilotCompletionsVersion" /* CompletionsVersion */, 0 /* PROFILE */);
    this.copilotSku = this._storageService.get("extensionsAssignmentFilterProvider.copilotSku" /* CopilotSku */, 0 /* PROFILE */);
    this.copilotInternalOrg = this._storageService.get("extensionsAssignmentFilterProvider.copilotInternalOrg" /* CopilotInternalOrg */, 0 /* PROFILE */);
    this.copilotTrackingId = this._storageService.get("extensionsAssignmentFilterProvider.copilotTrackingId" /* CopilotTrackingId */, 0 /* PROFILE */);
    this.copilotIsSn = this._storageService.get("extensionsAssignmentFilterProvider.copilotIsSn" /* CopilotIsSn */, 0 /* PROFILE */);
    this.copilotIsFcv1 = this._storageService.get("extensionsAssignmentFilterProvider.copilotIsFcv1" /* CopilotIsFcv1 */, 0 /* PROFILE */);
    this.updateExtensionVersions();
    this.updateCopilotEntitlementInfo();
    this.updateCopilotTokenInfo();
    this._register(this._extensionService.onDidChangeExtensionsStatus((extensionIdentifiers) => {
      if (extensionIdentifiers.some((identifier2) => ExtensionIdentifier.equals(identifier2, "github.copilot") || ExtensionIdentifier.equals(identifier2, "github.copilot-chat"))) {
        this.updateExtensionVersions();
      }
    }));
    this._register(this._chatEntitlementService.onDidChangeEntitlement(() => {
      this.updateCopilotEntitlementInfo();
    }));
    this._register(this._defaultAccountService.onDidChangeCopilotTokenInfo(() => {
      this.updateCopilotTokenInfo();
    }));
  }
  async updateExtensionVersions() {
    let copilotExtensionVersion;
    let copilotChatExtensionVersion;
    let copilotCompletionsVersion;
    try {
      const [copilotExtension, copilotChatExtension] = await Promise.all([
        this._extensionService.getExtension("github.copilot"),
        this._extensionService.getExtension("github.copilot-chat")
      ]);
      copilotExtensionVersion = copilotExtension?.version;
      copilotChatExtensionVersion = copilotChatExtension?.version;
      copilotCompletionsVersion = copilotChatExtension?.completionsCoreVersion;
    } catch (error) {
      this._logService.error("Failed to update extension version assignments", error);
    }
    if (this.copilotCompletionsVersion === copilotCompletionsVersion && this.copilotExtensionVersion === copilotExtensionVersion && this.copilotChatExtensionVersion === copilotChatExtensionVersion) {
      return;
    }
    this.copilotExtensionVersion = copilotExtensionVersion;
    this.copilotChatExtensionVersion = copilotChatExtensionVersion;
    this.copilotCompletionsVersion = copilotCompletionsVersion;
    this._storageService.store("extensionsAssignmentFilterProvider.copilotExtensionVersion" /* CopilotExtensionVersion */, this.copilotExtensionVersion, 0 /* PROFILE */, 1 /* MACHINE */);
    this._storageService.store("extensionsAssignmentFilterProvider.copilotChatExtensionVersion" /* CopilotChatExtensionVersion */, this.copilotChatExtensionVersion, 0 /* PROFILE */, 1 /* MACHINE */);
    this._storageService.store("extensionsAssignmentFilterProvider.copilotCompletionsVersion" /* CompletionsVersion */, this.copilotCompletionsVersion, 0 /* PROFILE */, 1 /* MACHINE */);
    this._onDidChangeFilters.fire();
  }
  updateCopilotEntitlementInfo() {
    const newSku = this._chatEntitlementService.sku;
    const newTrackingId = this._chatEntitlementService.copilotTrackingId;
    const newInternalOrg = getInternalOrg(this._chatEntitlementService.organisations);
    if (this.copilotSku === newSku && this.copilotInternalOrg === newInternalOrg && this.copilotTrackingId === newTrackingId) {
      return;
    }
    this.copilotSku = newSku;
    this.copilotInternalOrg = newInternalOrg;
    this.copilotTrackingId = newTrackingId;
    this._storageService.store("extensionsAssignmentFilterProvider.copilotSku" /* CopilotSku */, this.copilotSku, 0 /* PROFILE */, 1 /* MACHINE */);
    this._storageService.store("extensionsAssignmentFilterProvider.copilotInternalOrg" /* CopilotInternalOrg */, this.copilotInternalOrg, 0 /* PROFILE */, 1 /* MACHINE */);
    this._storageService.store("extensionsAssignmentFilterProvider.copilotTrackingId" /* CopilotTrackingId */, this.copilotTrackingId, 0 /* PROFILE */, 1 /* MACHINE */);
    this._onDidChangeFilters.fire();
  }
  updateCopilotTokenInfo() {
    const tokenInfo = this._defaultAccountService.copilotTokenInfo;
    const newIsSn = tokenInfo?.sn === "1" ? "1" : "0";
    const newIsFcv1 = tokenInfo?.fcv1 === "1" ? "1" : "0";
    if (this.copilotIsSn === newIsSn && this.copilotIsFcv1 === newIsFcv1) {
      return;
    }
    this.copilotIsSn = newIsSn;
    this.copilotIsFcv1 = newIsFcv1;
    this._storageService.store("extensionsAssignmentFilterProvider.copilotIsSn" /* CopilotIsSn */, this.copilotIsSn, 0 /* PROFILE */, 1 /* MACHINE */);
    this._storageService.store("extensionsAssignmentFilterProvider.copilotIsFcv1" /* CopilotIsFcv1 */, this.copilotIsFcv1, 0 /* PROFILE */, 1 /* MACHINE */);
    this._onDidChangeFilters.fire();
  }
  /**
   * Returns a version string that can be parsed by the TAS client.
   * The tas client cannot handle suffixes lke "-insider"
   * Ref: https://github.com/microsoft/tas-client/blob/30340d5e1da37c2789049fcf45928b954680606f/vscode-tas-client/src/vscode-tas-client/VSCodeFilterProvider.ts#L35
   *
   * @param version Version string to be trimmed.
  */
  static trimVersionSuffix(version2) {
    const regex = /\-[a-zA-Z0-9]+$/;
    const result = version2.split(regex);
    return result[0];
  }
  getFilterValue(filter2) {
    switch (filter2) {
      case "X-Copilot-RelatedPluginVersion-githubcopilot" /* CopilotExtensionVersion */:
        return this.copilotExtensionVersion ? CopilotAssignmentFilterProvider.trimVersionSuffix(this.copilotExtensionVersion) : null;
      case "X-VSCode-CompletionsInChatExtensionVersion" /* CompletionsVersionInCopilotChat */:
        return this.copilotCompletionsVersion ? CopilotAssignmentFilterProvider.trimVersionSuffix(this.copilotCompletionsVersion) : null;
      case "X-Copilot-RelatedPluginVersion-githubcopilotchat" /* CopilotChatExtensionVersion */:
        return this.copilotChatExtensionVersion ? CopilotAssignmentFilterProvider.trimVersionSuffix(this.copilotChatExtensionVersion) : null;
      case "X-GitHub-Copilot-SKU" /* CopilotSku */:
        return this.copilotSku ?? null;
      case "X-Microsoft-Internal-Org" /* MicrosoftInternalOrg */:
        return this.copilotInternalOrg ?? null;
      case "X-Copilot-CopilotTrackingId" /* CopilotTrackingId */:
        return this.copilotTrackingId ?? null;
      case "X-GitHub-Copilot-IsSn" /* CopilotIsSn */:
        return this.copilotIsSn ?? null;
      case "X-GitHub-Copilot-IsFcv1" /* CopilotIsFcv1 */:
        return this.copilotIsFcv1 ?? null;
      default:
        return null;
    }
  }
  getFilters() {
    const filters2 = /* @__PURE__ */ new Map();
    const filterValues = Object.values(ExtensionsFilter);
    for (const value2 of filterValues) {
      filters2.set(value2, this.getFilterValue(value2));
    }
    return filters2;
  }
};

CopilotAssignmentFilterProvider = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IChatEntitlementService),
  __decorateParam(4, IDefaultAccountService)
], CopilotAssignmentFilterProvider);

var GitHubAssignmentsFilter = /* @__PURE__ */ ((GitHubAssignmentsFilter2) => {
  GitHubAssignmentsFilter2["CopilotTrackingId"] = "copilottrackingid";
  GitHubAssignmentsFilter2["IsGhOrMsftStaff"] = "github_core_isghormsftstaff";
  GitHubAssignmentsFilter2["GhMsftOrExternal"] = "github_core_ghmsftorexternal";
  return GitHubAssignmentsFilter2;
})(GitHubAssignmentsFilter || {});

var GitHubCoreAssignmentsFilterProvider = class extends Disposable {
  constructor(_chatEntitlementService) {
    super();
    this._chatEntitlementService = _chatEntitlementService;
    this._onDidChangeFilters = this._register(new Emitter());
    this.onDidChangeFilters = this._onDidChangeFilters.event;
    this._register(this._chatEntitlementService.onDidChangeEntitlement(() => this.update()));
    this.update();
  }
  update() {
    const newTrackingId = this._chatEntitlementService.copilotTrackingId ?? this.copilotTrackingId;
    const newInternalOrg = getInternalOrg(this._chatEntitlementService.organisations);
    if (this.copilotTrackingId === newTrackingId && this.internalOrg === newInternalOrg) {
      return;
    }
    this.copilotTrackingId = newTrackingId;
    this.internalOrg = newInternalOrg;
    this._onDidChangeFilters.fire();
  }
  getFilterValue(filter2) {
    const liveTrackingId = this._chatEntitlementService.copilotTrackingId;
    if (liveTrackingId) {
      this.copilotTrackingId = liveTrackingId;
    }
    const copilotTrackingId = liveTrackingId ?? this.copilotTrackingId;
    const internalOrg = getInternalOrg(this._chatEntitlementService.organisations) ?? this.internalOrg;
    switch (filter2) {
      case "copilottrackingid" /* CopilotTrackingId */:
        return copilotTrackingId ?? null;
      case "github_core_isghormsftstaff" /* IsGhOrMsftStaff */:
        return internalOrg ? "1" : "0";
      case "github_core_ghmsftorexternal" /* GhMsftOrExternal */:
        return internalOrg === "github" ? "github" : internalOrg === "microsoft" || internalOrg === "vscode" ? "microsoft" : "external";
      default:
        return null;
    }
  }
  getFilters() {
    const filters2 = /* @__PURE__ */ new Map();
    for (const value2 of Object.values(GitHubAssignmentsFilter)) {
      filters2.set(value2, this.getFilterValue(value2));
    }
    return filters2;
  }
};

GitHubCoreAssignmentsFilterProvider = __decorateClass([
  __decorateParam(0, IChatEntitlementService)
], GitHubCoreAssignmentsFilterProvider);
export { ExtensionsFilter, CopilotAssignmentFilterProvider, GitHubAssignmentsFilter, GitHubCoreAssignmentsFilterProvider };
