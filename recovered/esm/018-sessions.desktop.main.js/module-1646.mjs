// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { distinct } from "./module-0007.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { localize } from "./module-0001.mjs";
import { IWorkspaceContextService, isWorkspace } from "./module-0509.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { parse5 } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig.ts
var EXTENSIONS_CONFIG = ".vscode/extensions.json";

var IWorkspaceExtensionsConfigService = createDecorator("IWorkspaceExtensionsConfigService");

var WorkspaceExtensionsConfigService = class extends Disposable {
  constructor(workspaceContextService, fileService, quickInputService, modelService, languageService, jsonEditingService) {
    super();
    this.workspaceContextService = workspaceContextService;
    this.fileService = fileService;
    this.quickInputService = quickInputService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.jsonEditingService = jsonEditingService;
    this._onDidChangeExtensionsConfigs = this._register(new Emitter());
    this.onDidChangeExtensionsConfigs = this._onDidChangeExtensionsConfigs.event;
    this._register(workspaceContextService.onDidChangeWorkspaceFolders((e4) => this._onDidChangeExtensionsConfigs.fire()));
    this._register(fileService.onDidFilesChange((e4) => {
      const workspace = workspaceContextService.getWorkspace();
      if (workspace.configuration && e4.affects(workspace.configuration) || workspace.folders.some((folder) => e4.affects(folder.toResource(EXTENSIONS_CONFIG)))) {
        this._onDidChangeExtensionsConfigs.fire();
      }
    }));
  }
  async getExtensionsConfigs() {
    const workspace = this.workspaceContextService.getWorkspace();
    const result = [];
    const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : void 0;
    if (workspaceExtensionsConfigContent) {
      result.push(workspaceExtensionsConfigContent);
    }
    result.push(...await Promise.all(workspace.folders.map((workspaceFolder) => this.resolveWorkspaceFolderExtensionConfig(workspaceFolder))));
    return result;
  }
  async getRecommendations() {
    const configs = await this.getExtensionsConfigs();
    return distinct(configs.flatMap((c) => c.recommendations ? c.recommendations.map((c2) => c2.toLowerCase()) : []));
  }
  async getUnwantedRecommendations() {
    const configs = await this.getExtensionsConfigs();
    return distinct(configs.flatMap((c) => c.unwantedRecommendations ? c.unwantedRecommendations.map((c2) => c2.toLowerCase()) : []));
  }
  async toggleRecommendation(extensionId) {
    extensionId = extensionId.toLowerCase();
    const workspace = this.workspaceContextService.getWorkspace();
    const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : void 0;
    const workspaceFolderExtensionsConfigContents = new ResourceMap();
    await Promise.all(workspace.folders.map(async (workspaceFolder) => {
      const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
      workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
    }));
    const isWorkspaceRecommended = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.recommendations?.some((r2) => r2.toLowerCase() === extensionId);
    const recommendedWorksapceFolders = workspace.folders.filter((workspaceFolder) => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.recommendations?.some((r2) => r2.toLowerCase() === extensionId));
    const isRecommended = isWorkspaceRecommended || recommendedWorksapceFolders.length > 0;
    const workspaceOrFolders = isRecommended ? await this.pickWorkspaceOrFolders(recommendedWorksapceFolders, isWorkspaceRecommended ? workspace : void 0, localize(23010, null)) : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : void 0, localize(23009, null));
    for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
      if (isWorkspace(workspaceOrWorkspaceFolder)) {
        await this.addOrRemoveWorkspaceRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isRecommended);
      } else {
        await this.addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isRecommended);
      }
    }
  }
  async toggleUnwantedRecommendation(extensionId) {
    const workspace = this.workspaceContextService.getWorkspace();
    const workspaceExtensionsConfigContent = workspace.configuration ? await this.resolveWorkspaceExtensionConfig(workspace.configuration) : void 0;
    const workspaceFolderExtensionsConfigContents = new ResourceMap();
    await Promise.all(workspace.folders.map(async (workspaceFolder) => {
      const extensionsConfigContent = await this.resolveWorkspaceFolderExtensionConfig(workspaceFolder);
      workspaceFolderExtensionsConfigContents.set(workspaceFolder.uri, extensionsConfigContent);
    }));
    const isWorkspaceUnwanted = workspaceExtensionsConfigContent && workspaceExtensionsConfigContent.unwantedRecommendations?.some((r2) => r2 === extensionId);
    const unWantedWorksapceFolders = workspace.folders.filter((workspaceFolder) => workspaceFolderExtensionsConfigContents.get(workspaceFolder.uri)?.unwantedRecommendations?.some((r2) => r2 === extensionId));
    const isUnwanted = isWorkspaceUnwanted || unWantedWorksapceFolders.length > 0;
    const workspaceOrFolders = isUnwanted ? await this.pickWorkspaceOrFolders(unWantedWorksapceFolders, isWorkspaceUnwanted ? workspace : void 0, localize(23010, null)) : await this.pickWorkspaceOrFolders(workspace.folders, workspace.configuration ? workspace : void 0, localize(23009, null));
    for (const workspaceOrWorkspaceFolder of workspaceOrFolders) {
      if (isWorkspace(workspaceOrWorkspaceFolder)) {
        await this.addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceExtensionsConfigContent, !isUnwanted);
      } else {
        await this.addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceOrWorkspaceFolder, workspaceFolderExtensionsConfigContents.get(workspaceOrWorkspaceFolder.uri), !isUnwanted);
      }
    }
  }
  async addOrRemoveWorkspaceFolderRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
    const values = [];
    if (add) {
      if (Array.isArray(extensionsConfigContent.recommendations)) {
        values.push({ path: ["recommendations", -1], value: extensionId });
      } else {
        values.push({ path: ["recommendations"], value: [extensionId] });
      }
      const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(["unwantedRecommendations"], extensionsConfigContent.unwantedRecommendations, extensionId);
      if (unwantedRecommendationEdit) {
        values.push(unwantedRecommendationEdit);
      }
    } else if (extensionsConfigContent.recommendations) {
      const recommendationEdit = this.getEditToRemoveValueFromArray(["recommendations"], extensionsConfigContent.recommendations, extensionId);
      if (recommendationEdit) {
        values.push(recommendationEdit);
      }
    }
    if (values.length) {
      return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
    }
  }
  async addOrRemoveWorkspaceRecommendation(extensionId, workspace, extensionsConfigContent, add) {
    const values = [];
    if (extensionsConfigContent) {
      if (add) {
        const path = ["extensions", "recommendations"];
        if (Array.isArray(extensionsConfigContent.recommendations)) {
          values.push({ path: [...path, -1], value: extensionId });
        } else {
          values.push({ path, value: [extensionId] });
        }
        const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(["extensions", "unwantedRecommendations"], extensionsConfigContent.unwantedRecommendations, extensionId);
        if (unwantedRecommendationEdit) {
          values.push(unwantedRecommendationEdit);
        }
      } else if (extensionsConfigContent.recommendations) {
        const recommendationEdit = this.getEditToRemoveValueFromArray(["extensions", "recommendations"], extensionsConfigContent.recommendations, extensionId);
        if (recommendationEdit) {
          values.push(recommendationEdit);
        }
      }
    } else if (add) {
      values.push({ path: ["extensions"], value: { recommendations: [extensionId] } });
    }
    if (values.length) {
      return this.jsonEditingService.write(workspace.configuration, values, true);
    }
  }
  async addOrRemoveWorkspaceFolderUnwantedRecommendation(extensionId, workspaceFolder, extensionsConfigContent, add) {
    const values = [];
    if (add) {
      const path = ["unwantedRecommendations"];
      if (Array.isArray(extensionsConfigContent.unwantedRecommendations)) {
        values.push({ path: [...path, -1], value: extensionId });
      } else {
        values.push({ path, value: [extensionId] });
      }
      const recommendationEdit = this.getEditToRemoveValueFromArray(["recommendations"], extensionsConfigContent.recommendations, extensionId);
      if (recommendationEdit) {
        values.push(recommendationEdit);
      }
    } else if (extensionsConfigContent.unwantedRecommendations) {
      const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(["unwantedRecommendations"], extensionsConfigContent.unwantedRecommendations, extensionId);
      if (unwantedRecommendationEdit) {
        values.push(unwantedRecommendationEdit);
      }
    }
    if (values.length) {
      return this.jsonEditingService.write(workspaceFolder.toResource(EXTENSIONS_CONFIG), values, true);
    }
  }
  async addOrRemoveWorkspaceUnwantedRecommendation(extensionId, workspace, extensionsConfigContent, add) {
    const values = [];
    if (extensionsConfigContent) {
      if (add) {
        const path = ["extensions", "unwantedRecommendations"];
        if (Array.isArray(extensionsConfigContent.recommendations)) {
          values.push({ path: [...path, -1], value: extensionId });
        } else {
          values.push({ path, value: [extensionId] });
        }
        const recommendationEdit = this.getEditToRemoveValueFromArray(["extensions", "recommendations"], extensionsConfigContent.recommendations, extensionId);
        if (recommendationEdit) {
          values.push(recommendationEdit);
        }
      } else if (extensionsConfigContent.unwantedRecommendations) {
        const unwantedRecommendationEdit = this.getEditToRemoveValueFromArray(["extensions", "unwantedRecommendations"], extensionsConfigContent.unwantedRecommendations, extensionId);
        if (unwantedRecommendationEdit) {
          values.push(unwantedRecommendationEdit);
        }
      }
    } else if (add) {
      values.push({ path: ["extensions"], value: { unwantedRecommendations: [extensionId] } });
    }
    if (values.length) {
      return this.jsonEditingService.write(workspace.configuration, values, true);
    }
  }
  async pickWorkspaceOrFolders(workspaceFolders, workspace, placeHolder) {
    const workspaceOrFolders = workspace ? [...workspaceFolders, workspace] : [...workspaceFolders];
    if (workspaceOrFolders.length === 1) {
      return workspaceOrFolders;
    }
    const folderPicks = workspaceFolders.map((workspaceFolder) => {
      return {
        label: workspaceFolder.name,
        description: localize(23012, null),
        workspaceOrFolder: workspaceFolder,
        iconClasses: getIconClasses(this.modelService, this.languageService, workspaceFolder.uri, 2 /* ROOT_FOLDER */)
      };
    });
    if (workspace) {
      folderPicks.push({ type: "separator" });
      folderPicks.push({
        label: localize(23011, null),
        workspaceOrFolder: workspace
      });
    }
    const result = await this.quickInputService.pick(folderPicks, { placeHolder, canPickMany: true }) || [];
    return result.map((r2) => r2.workspaceOrFolder);
  }
  async resolveWorkspaceExtensionConfig(workspaceConfigurationResource) {
    try {
      const content = await this.fileService.readFile(workspaceConfigurationResource);
      const extensionsConfigContent = parse5(content.value.toString())["extensions"];
      return extensionsConfigContent ? this.parseExtensionConfig(extensionsConfigContent) : void 0;
    } catch (e4) {
    }
    return void 0;
  }
  async resolveWorkspaceFolderExtensionConfig(workspaceFolder) {
    try {
      const content = await this.fileService.readFile(workspaceFolder.toResource(EXTENSIONS_CONFIG));
      const extensionsConfigContent = parse5(content.value.toString());
      return this.parseExtensionConfig(extensionsConfigContent);
    } catch (e4) {
    }
    return {};
  }
  parseExtensionConfig(extensionsConfigContent) {
    return {
      recommendations: distinct((extensionsConfigContent.recommendations || []).map((e4) => e4.toLowerCase())),
      unwantedRecommendations: distinct((extensionsConfigContent.unwantedRecommendations || []).map((e4) => e4.toLowerCase()))
    };
  }
  getEditToRemoveValueFromArray(path, array3, value2) {
    const index2 = array3?.indexOf(value2);
    if (index2 !== void 0 && index2 !== -1) {
      return { path: [...path, index2], value: void 0 };
    }
    return void 0;
  }
};

WorkspaceExtensionsConfigService = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IModelService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IJSONEditingService)
], WorkspaceExtensionsConfigService);

registerSingleton(IWorkspaceExtensionsConfigService, WorkspaceExtensionsConfigService, 1 /* Delayed */);
export { EXTENSIONS_CONFIG, IWorkspaceExtensionsConfigService, WorkspaceExtensionsConfigService };
