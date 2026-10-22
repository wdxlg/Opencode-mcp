// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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
import { IPreferencesService } from "./module-1293.mjs";
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
    this._register(preferencesService.onDidDefaultSettingsContentChanged((uri4) => {
      this._onDidChangeFile.fire([{ resource: uri4, type: 0 /* UPDATED */ }]);
    }));
  }
  static {
    this.SCHEMA = Schemas.vscode;
  }
  static {
    this.SCHEMA_ASSOCIATIONS = URI.parse(`${Schemas.vscode}://schemas-associations/schemas-associations.json`);
  }
  async readFile(uri4) {
    if (uri4.scheme !== SettingsFileSystemProvider.SCHEMA) {
      throw new NotSupportedError();
    }
    let content;
    if (uri4.authority === "schemas") {
      content = this.getSchemaContent(uri4);
    } else if (uri4.authority === SettingsFileSystemProvider.SCHEMA_ASSOCIATIONS.authority) {
      const schemas2 = Object.entries(schemaRegistry7.getSchemaAssociations()).map(([url, fileMatch]) => ({ url, fileMatch }));
      content = JSON.stringify({ schemas: schemas2 });
    } else if (uri4.authority === "defaultsettings") {
      content = this.preferencesService.getDefaultSettingsContent(uri4);
    }
    if (content) {
      return VSBuffer.fromString(content).buffer;
    }
    throw "EntryNotFound" /* FileNotFound */;
  }
  async stat(uri4) {
    if (schemaRegistry7.hasSchemaContent(uri4.toString()) || this.preferencesService.hasDefaultSettingsContent(uri4)) {
      const currentTime = Date.now();
      return {
        type: 1 /* File */,
        permissions: 1 /* Readonly */,
        mtime: currentTime,
        ctime: currentTime,
        size: 0
      };
    }
    if (isEqual2(uri4, SettingsFileSystemProvider.SCHEMA_ASSOCIATIONS)) {
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
  getSchemaContent(uri4) {
    const startTime = Date.now();
    const content = schemaRegistry7.getSchemaContent(uri4.toString()) ?? "{}";
    const logLevel = this.logService.getLevel();
    if (logLevel === 2 /* Debug */ || logLevel === 1 /* Trace */) {
      const endTime = Date.now();
      const uncompressed = JSON.stringify(schemaRegistry7.getSchemaContributions().schemas[uri4.toString()]);
      this.logService.debug(`${uri4.toString()}: ${uncompressed.length} -> ${content.length} (${Math.round((uncompressed.length - content.length) / uncompressed.length * 100)}%) Took ${endTime - startTime}ms`);
    }
    return content;
  }
};

SettingsFileSystemProvider = __decorateClass([
  __decorateParam(0, IPreferencesService),
  __decorateParam(1, ILogService)
], SettingsFileSystemProvider);
export { schemaRegistry7, SettingsFileSystemProvider };
