// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/common/settingsFilesystemProvider.ts
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { NotSupportedError } from "./module-0004.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/preferences/common/settingsFilesystemProvider.ts
var schemaRegistry7 = Registry.as(Extensions3.JSONContribution);

var SettingsFileSystemProvider = class extends Disposable {
  constructor(preferencesService, logService) {
    super();
    this.preferencesService = preferencesService;
    this.logService = logService;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this.capabilities = 2048 /* Readonly */ + 2 /* FileReadWrite */;
    this.onDidChangeCapabilities = Event2.None;
    this._register(schemaRegistry7.onDidChangeSchema((schemaUri) => {
      this._onDidChangeFile.fire([{ resource: URI.parse(schemaUri), type: 0 /* UPDATED */ }]);
    }));
    this._register(schemaRegistry7.onDidChangeSchemaAssociations(() => {
      this._onDidChangeFile.fire([{ resource: SettingsFileSystemProvider.SCHEMA_ASSOCIATIONS, type: 0 /* UPDATED */ }]);
    }));
    this._register(preferencesService.onDidDefaultSettingsContentChanged((uri5) => {
      this._onDidChangeFile.fire([{ resource: uri5, type: 0 /* UPDATED */ }]);
    }));
  }
  static {
    this.SCHEMA = Schemas.vscode;
  }
  static {
    this.SCHEMA_ASSOCIATIONS = URI.parse(`${Schemas.vscode}://schemas-associations/schemas-associations.json`);
  }
  async readFile(uri5) {
    if (uri5.scheme !== SettingsFileSystemProvider.SCHEMA) {
      throw new NotSupportedError();
    }
    let content2;
    if (uri5.authority === "schemas") {
      content2 = this.getSchemaContent(uri5);
    } else if (uri5.authority === SettingsFileSystemProvider.SCHEMA_ASSOCIATIONS.authority) {
      const schemas2 = Object.entries(schemaRegistry7.getSchemaAssociations()).map(([url, fileMatch]) => ({ url, fileMatch }));
      content2 = JSON.stringify({ schemas: schemas2 });
    } else if (uri5.authority === "defaultsettings") {
      content2 = this.preferencesService.getDefaultSettingsContent(uri5);
    }
    if (content2) {
      return VSBuffer.fromString(content2).buffer;
    }
    throw "EntryNotFound" /* FileNotFound */;
  }
  async stat(uri5) {
    if (schemaRegistry7.hasSchemaContent(uri5.toString()) || this.preferencesService.hasDefaultSettingsContent(uri5)) {
      const currentTime = Date.now();
      return {
        type: 1 /* File */,
        permissions: 1 /* Readonly */,
        mtime: currentTime,
        ctime: currentTime,
        size: 0
      };
    }
    if (isEqual2(uri5, SettingsFileSystemProvider.SCHEMA_ASSOCIATIONS)) {
      const currentTime = Date.now();
      return {
        type: 1 /* File */,
        permissions: 1 /* Readonly */,
        mtime: currentTime,
        ctime: currentTime,
        size: 0
      };
    }
    throw "EntryNotFound" /* FileNotFound */;
  }
  watch(resource, opts) {
    return Disposable.None;
  }
  async mkdir(resource) {
  }
  async readdir(resource) {
    return [];
  }
  async rename(from, to, opts) {
  }
  async delete(resource, opts) {
  }
  async writeFile() {
    throw new NotSupportedError();
  }
  getSchemaContent(uri5) {
    const startTime = Date.now();
    const content2 = schemaRegistry7.getSchemaContent(uri5.toString()) ?? "{}";
    const logLevel = this.logService.getLevel();
    if (logLevel === 2 /* Debug */ || logLevel === 1 /* Trace */) {
      const endTime = Date.now();
      const uncompressed = JSON.stringify(schemaRegistry7.getSchemaContributions().schemas[uri5.toString()]);
      this.logService.debug(`${uri5.toString()}: ${uncompressed.length} -> ${content2.length} (${Math.round((uncompressed.length - content2.length) / uncompressed.length * 100)}%) Took ${endTime - startTime}ms`);
    }
    return content2;
  }
};

SettingsFileSystemProvider = __decorateClass([
  __decorateParam(0, IPreferencesService),
  __decorateParam(1, ILogService)
], SettingsFileSystemProvider);
export { schemaRegistry7, SettingsFileSystemProvider };
