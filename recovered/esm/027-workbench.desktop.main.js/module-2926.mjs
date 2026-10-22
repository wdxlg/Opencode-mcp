// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/workspaceRecommendations.ts
import { ExtensionRecommendations } from "./module-2924.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { distinct, equals } from "./module-0007.mjs";
import { localize } from "./module-0001.mjs";
import { EXTENSION_IDENTIFIER_PATTERN } from "./module-0872.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceExtensionsConfigService } from "./module-1703.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/extensions/browser/workspaceRecommendations.ts
var WORKSPACE_EXTENSIONS_FOLDER = ".vscode/extensions";

var WorkspaceRecommendations = class extends ExtensionRecommendations {
  constructor(workspaceExtensionsConfigService, contextService, uriIdentityService, fileService, workbenchExtensionManagementService, notificationService) {
    super();
    this.workspaceExtensionsConfigService = workspaceExtensionsConfigService;
    this.contextService = contextService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.workbenchExtensionManagementService = workbenchExtensionManagementService;
    this.notificationService = notificationService;
    this._recommendations = [];
    this._onDidChangeRecommendations = this._register(new Emitter());
    this.onDidChangeRecommendations = this._onDidChangeRecommendations.event;
    this._ignoredRecommendations = [];
    this.workspaceExtensions = [];
    this.onDidChangeWorkspaceExtensionsScheduler = this._register(new RunOnceScheduler(() => this.onDidChangeWorkspaceExtensionsFolders(), 1e3));
  }
  get recommendations() {
    return this._recommendations;
  }
  get ignoredRecommendations() {
    return this._ignoredRecommendations;
  }
  async doActivate() {
    this.workspaceExtensions = await this.fetchWorkspaceExtensions();
    await this.fetch();
    this._register(this.workspaceExtensionsConfigService.onDidChangeExtensionsConfigs(() => this.onDidChangeExtensionsConfigs()));
    for (const folder of this.contextService.getWorkspace().folders) {
      this._register(this.fileService.watch(this.uriIdentityService.extUri.joinPath(folder.uri, WORKSPACE_EXTENSIONS_FOLDER)));
    }
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceExtensionsScheduler.schedule()));
    this._register(this.fileService.onDidFilesChange((e) => {
      if (this.contextService.getWorkspace().folders.some((folder) => e.affects(this.uriIdentityService.extUri.joinPath(folder.uri, WORKSPACE_EXTENSIONS_FOLDER), 1 /* ADDED */, 2 /* DELETED */))) {
        this.onDidChangeWorkspaceExtensionsScheduler.schedule();
      }
    }));
  }
  async onDidChangeWorkspaceExtensionsFolders() {
    const existing = this.workspaceExtensions;
    this.workspaceExtensions = await this.fetchWorkspaceExtensions();
    if (!equals(existing, this.workspaceExtensions, (a, b) => this.uriIdentityService.extUri.isEqual(a, b))) {
      this.onDidChangeExtensionsConfigs();
    }
  }
  async fetchWorkspaceExtensions() {
    const workspaceExtensions = [];
    for (const workspaceFolder of this.contextService.getWorkspace().folders) {
      const extensionsLocaiton = this.uriIdentityService.extUri.joinPath(workspaceFolder.uri, WORKSPACE_EXTENSIONS_FOLDER);
      try {
        const stat = await this.fileService.resolve(extensionsLocaiton);
        for (const extension of stat.children ?? []) {
          if (!extension.isDirectory) {
            continue;
          }
          workspaceExtensions.push(extension.resource);
        }
      } catch (error) {
      }
    }
    if (workspaceExtensions.length) {
      const resourceExtensions = await this.workbenchExtensionManagementService.getExtensions(workspaceExtensions);
      return resourceExtensions.map((extension) => extension.location);
    }
    return [];
  }
  /**
   * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
   */
  async fetch() {
    const extensionsConfigs = await this.workspaceExtensionsConfigService.getExtensionsConfigs();
    const { invalidRecommendations, message } = await this.validateExtensions(extensionsConfigs);
    if (invalidRecommendations.length) {
      this.notificationService.warn(`The ${invalidRecommendations.length} extension(s) below, in workspace recommendations have issues:
${message}`);
    }
    this._recommendations = [];
    this._ignoredRecommendations = [];
    for (const extensionsConfig of extensionsConfigs) {
      if (extensionsConfig.unwantedRecommendations) {
        for (const unwantedRecommendation of extensionsConfig.unwantedRecommendations) {
          if (invalidRecommendations.indexOf(unwantedRecommendation) === -1) {
            this._ignoredRecommendations.push(unwantedRecommendation);
          }
        }
      }
      if (extensionsConfig.recommendations) {
        for (const extensionId of extensionsConfig.recommendations) {
          if (invalidRecommendations.indexOf(extensionId) === -1) {
            this._recommendations.push({
              extension: extensionId,
              reason: {
                reasonId: 0 /* Workspace */,
                reasonText: localize(15598, null)
              }
            });
          }
        }
      }
    }
    for (const extension of this.workspaceExtensions) {
      this._recommendations.push({
        extension,
        reason: {
          reasonId: 0 /* Workspace */,
          reasonText: localize(15598, null)
        }
      });
    }
  }
  async validateExtensions(contents) {
    const validExtensions = [];
    const invalidExtensions = [];
    let message = "";
    const allRecommendations = distinct(contents.flatMap(({ recommendations }) => recommendations || []));
    const regEx = new RegExp(EXTENSION_IDENTIFIER_PATTERN);
    for (const extensionId of allRecommendations) {
      if (regEx.test(extensionId)) {
        validExtensions.push(extensionId);
      } else {
        invalidExtensions.push(extensionId);
        message += `${extensionId} (bad format) Expected: <provider>.<name>
`;
      }
    }
    return { validRecommendations: validExtensions, invalidRecommendations: invalidExtensions, message };
  }
  async onDidChangeExtensionsConfigs() {
    await this.fetch();
    this._onDidChangeRecommendations.fire();
  }
};

WorkspaceRecommendations = __decorateClass([
  __decorateParam(0, IWorkspaceExtensionsConfigService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IWorkbenchExtensionManagementService),
  __decorateParam(5, INotificationService)
], WorkspaceRecommendations);
export { WORKSPACE_EXTENSIONS_FOLDER, WorkspaceRecommendations };
