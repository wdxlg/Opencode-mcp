// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataProfile/browser/snippetsResource.ts
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { FileOperationError, IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILogService } from "./module-0095.mjs";
import { localize } from "./module-0001.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/services/userDataProfile/browser/snippetsResource.ts
function toSnippetResource(extUri2, snippetsHome, key3) {
  const resource = extUri2.joinPath(snippetsHome, key3);
  if (!extUri2.isEqualOrParent(resource, snippetsHome) || extUri2.isEqual(resource, snippetsHome)) {
    return void 0;
  }
  return resource;
}

var SnippetsResourceInitializer = class {
  constructor(userDataProfileService, fileService, uriIdentityService, logService) {
    this.userDataProfileService = userDataProfileService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
  }
  async initialize(content) {
    const snippetsContent = JSON.parse(content);
    for (const key3 in snippetsContent.snippets) {
      const resource = toSnippetResource(this.uriIdentityService.extUri, this.userDataProfileService.currentProfile.snippetsHome, key3);
      if (!resource) {
        this.logService.warn(`SnippetsResourceInitializer: Ignoring snippet with key '${key3}' as it escapes the snippets folder.`);
        continue;
      }
      await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key3]));
    }
  }
};

SnippetsResourceInitializer = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], SnippetsResourceInitializer);

var SnippetsResource = class {
  constructor(fileService, uriIdentityService, logService) {
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
  }
  async getContent(profile, excluded) {
    const snippets = await this.getSnippets(profile, excluded);
    return JSON.stringify({ snippets });
  }
  async apply(content, profile) {
    const snippetsContent = JSON.parse(content);
    for (const key3 in snippetsContent.snippets) {
      const resource = toSnippetResource(this.uriIdentityService.extUri, profile.snippetsHome, key3);
      if (!resource) {
        this.logService.warn(`SnippetsResource: Ignoring snippet with key '${key3}' as it escapes the snippets folder.`);
        continue;
      }
      await this.fileService.writeFile(resource, VSBuffer.fromString(snippetsContent.snippets[key3]));
    }
  }
  async getSnippets(profile, excluded) {
    const snippets = {};
    const snippetsResources = await this.getSnippetsResources(profile, excluded);
    for (const resource of snippetsResources) {
      const key3 = this.uriIdentityService.extUri.relativePath(profile.snippetsHome, resource);
      const content = await this.fileService.readFile(resource);
      snippets[key3] = content.value.toString();
    }
    return snippets;
  }
  async getSnippetsResources(profile, excluded) {
    const snippets = [];
    let stat;
    try {
      stat = await this.fileService.resolve(profile.snippetsHome);
    } catch (e4) {
      if (e4 instanceof FileOperationError && e4.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        return snippets;
      } else {
        throw e4;
      }
    }
    for (const { resource } of stat.children || []) {
      if (excluded?.has(resource)) {
        continue;
      }
      const extension = this.uriIdentityService.extUri.extname(resource);
      if (extension === ".json" || extension === ".code-snippets") {
        snippets.push(resource);
      }
    }
    return snippets;
  }
};

SnippetsResource = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, ILogService)
], SnippetsResource);

var SnippetsResourceTreeItem = class {
  constructor(profile, instantiationService, uriIdentityService) {
    this.profile = profile;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.type = "snippets" /* Snippets */;
    this.label = { label: localize(23625, null) };
    this.collapsibleState = 1 /* Collapsed */;
    this.excludedSnippets = new ResourceSet();
    this.handle = this.profile.snippetsHome.toString();
  }
  async getChildren() {
    const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
    const that = this;
    return snippetsResources.map((resource) => ({
      handle: resource.toString(),
      parent: that,
      resourceUri: resource,
      collapsibleState: 0 /* None */,
      accessibilityInformation: {
        label: this.uriIdentityService.extUri.basename(resource)
      },
      checkbox: that.checkbox ? {
        get isChecked() {
          return !that.excludedSnippets.has(resource);
        },
        set isChecked(value2) {
          if (value2) {
            that.excludedSnippets.delete(resource);
          } else {
            that.excludedSnippets.add(resource);
          }
        },
        accessibilityInformation: {
          label: localize(23624, null, this.uriIdentityService.extUri.basename(resource))
        }
      } : void 0,
      command: {
        id: API_OPEN_EDITOR_COMMAND_ID,
        title: "",
        arguments: [resource, void 0, void 0]
      }
    }));
  }
  async hasContent() {
    const snippetsResources = await this.instantiationService.createInstance(SnippetsResource).getSnippetsResources(this.profile);
    return snippetsResources.length > 0;
  }
  async getContent() {
    return this.instantiationService.createInstance(SnippetsResource).getContent(this.profile, this.excludedSnippets);
  }
  isFromDefaultProfile() {
    return !this.profile.isDefault && !!this.profile.useDefaultFlags?.snippets;
  }
};

SnippetsResourceTreeItem = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService)
], SnippetsResourceTreeItem);
export { toSnippetResource, SnippetsResourceInitializer, SnippetsResource, SnippetsResourceTreeItem };
