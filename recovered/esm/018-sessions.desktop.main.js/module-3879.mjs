// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/common/configurationCache.ts
import { joinPath } from "./module-0034.mjs";
import { Queue } from "./module-0036.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/services/configuration/common/configurationCache.ts
var ConfigurationCache = class {
  constructor(donotCacheResourcesWithSchemes, environmentService, fileService) {
    this.donotCacheResourcesWithSchemes = donotCacheResourcesWithSchemes;
    this.fileService = fileService;
    this.cachedConfigurations = /* @__PURE__ */ new Map();
    this.cacheHome = environmentService.cacheHome;
  }
  needsCaching(resource) {
    return !this.donotCacheResourcesWithSchemes.includes(resource.scheme);
  }
  read(key3) {
    return this.getCachedConfiguration(key3).read();
  }
  write(key3, content) {
    return this.getCachedConfiguration(key3).save(content);
  }
  remove(key3) {
    return this.getCachedConfiguration(key3).remove();
  }
  getCachedConfiguration({ type, key: key3 }) {
    const k = `${type}:${key3}`;
    let cachedConfiguration = this.cachedConfigurations.get(k);
    if (!cachedConfiguration) {
      cachedConfiguration = new CachedConfiguration({ type, key: key3 }, this.cacheHome, this.fileService);
      this.cachedConfigurations.set(k, cachedConfiguration);
    }
    return cachedConfiguration;
  }
};

var CachedConfiguration = class {
  constructor({ type, key: key3 }, cacheHome, fileService) {
    this.fileService = fileService;
    this.cachedConfigurationFolderResource = joinPath(cacheHome, "CachedConfigurations", type, key3);
    this.cachedConfigurationFileResource = joinPath(this.cachedConfigurationFolderResource, type === "workspaces" ? "workspace.json" : "configuration.json");
    this.queue = new Queue();
  }
  async read() {
    try {
      const content = await this.fileService.readFile(this.cachedConfigurationFileResource);
      return content.value.toString();
    } catch (e4) {
      return "";
    }
  }
  async save(content) {
    const created = await this.createCachedFolder();
    if (created) {
      await this.queue.queue(async () => {
        await this.fileService.writeFile(this.cachedConfigurationFileResource, VSBuffer.fromString(content));
      });
    }
  }
  async remove() {
    try {
      await this.queue.queue(() => this.fileService.del(this.cachedConfigurationFolderResource, { recursive: true, useTrash: false }));
    } catch (error) {
      if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
        throw error;
      }
    }
  }
  async createCachedFolder() {
    if (await this.fileService.exists(this.cachedConfigurationFolderResource)) {
      return true;
    }
    try {
      await this.fileService.createFolder(this.cachedConfigurationFolderResource);
      return true;
    } catch (error) {
      return false;
    }
  }
};
export { ConfigurationCache, CachedConfiguration };
