// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/tasksResource.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/tasksResource.ts
var TasksResourceInitializer = class {
  constructor(userDataProfileService, fileService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.logService = logService;
  }
  async initialize(content) {
    const tasksContent = JSON.parse(content);
    if (!tasksContent.tasks) {
      this.logService.info(`Initializing Profile: No tasks to apply...`);
      return;
    }
    await this.fileService.writeFile(this.userDataProfileService.currentProfile.tasksResource, VSBuffer.fromString(tasksContent.tasks));
  }
};

TasksResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], TasksResourceInitializer);

var TasksResource = class {
  constructor(fileService, logService) {
    this.fileService = fileService;
    this.logService = logService;
  }
  async getContent(profile) {
    const tasksContent = await this.getTasksResourceContent(profile);
    return JSON.stringify(tasksContent);
  }
  async getTasksResourceContent(profile) {
    const tasksContent = await this.getTasksContent(profile);
    return { tasks: tasksContent };
  }
  async apply(content, profile) {
    const tasksContent = JSON.parse(content);
    if (!tasksContent.tasks) {
      this.logService.info(`Importing Profile (${profile.name}): No tasks to apply...`);
      return;
    }
    await this.fileService.writeFile(profile.tasksResource, VSBuffer.fromString(tasksContent.tasks));
  }
  async getTasksContent(profile) {
    try {
      const content = await this.fileService.readFile(profile.tasksResource);
      return content.value.toString();
    } catch (error) {
      if (error instanceof FileOperationError && error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return null;
      } else {
        throw error;
      }
    }
  }
};

TasksResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService)
], TasksResource);

var TasksResourceTreeItem = class {
  constructor(profile, uriIdentityService, instantiationService) {
    this.profile = profile;
    this.uriIdentityService = uriIdentityService;
    this.instantiationService = instantiationService;
    this.type = "tasks" /* Tasks */;
    this.handle = "tasks" /* Tasks */;
    this.label = { label: localize(23626, null) };
    this.collapsibleState = 2 /* Expanded */;
  }
  async getChildren() {
    return [{
      handle: this.profile.tasksResource.toString(),
      resourceUri: this.profile.tasksResource,
      collapsibleState: 0 /* None */,
      parent: this,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
      },
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [this.profile.tasksResource, void 0, void 0]
      }
    }];
  }
  async hasContent() {
    const tasksContent = await this.instantiationService.createInstance(TasksResource).getTasksResourceContent(this.profile);
    return tasksContent.tasks !== null;
  }
  async getContent() {
    return this.instantiationService.createInstance(TasksResource).getContent(this.profile);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.tasks;
  }
};

TasksResourceTreeItem = __decorateClass([
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IInstantiationService)
], TasksResourceTreeItem);
export { TasksResourceInitializer, TasksResource, TasksResourceTreeItem };
