// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/shared/sessionMcpDiscovery.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { Sequencer } from "./module-0027.mjs";
import { URI } from "./module-0023.mjs";
import { makeMcpServerCustomization, normalizeMcpServerConfiguration, readJsonFile, resolveMcpServersMap } from "./module-0126.mjs";
import { ResourceMap } from "./module-0006.mjs";


// src/vs/platform/agentHost/node/shared/sessionMcpDiscovery.ts
var RootMcpDiscovery = class extends Disposable {
  constructor(_root, _fileService) {
    super();
    this._root = _root;
    this._fileService = _fileService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._sequencer = new Sequencer();
    this._definitions = [];
    this._signature = "";
    this._initialized = false;
    this._definitionUri = URI.joinPath(_root, ".mcp.json");
    const watcher = this._register(_fileService.createWatcher(_root, { recursive: false, excludes: [] }));
    this._register(watcher.onDidChange((event) => {
      if (event.affects(this._definitionUri)) {
        void this.refresh(true);
      }
    }));
  }
  get definitions() {
    return this._definitions;
  }
  refresh(force = false) {
    return this._sequencer.queue(async () => {
      if (this._initialized && !force) {
        return this._definitions;
      }
      const definitions2 = await this._scan();
      const signature = serializeDefinitions(definitions2);
      if (!this._initialized) {
        this._initialized = true;
        this._signature = signature;
        this._definitions = definitions2;
        return definitions2;
      }
      if (signature !== this._signature) {
        this._signature = signature;
        this._definitions = definitions2;
        this._onDidChange.fire();
      }
      return this._definitions;
    });
  }
  async _scan() {
    const definitions2 = [];
    const raw = resolveMcpServersMap(await readJsonFile(this._definitionUri, this._fileService));
    if (!raw) {
      return definitions2;
    }
    for (const [name, value] of Object.entries(raw)) {
      const configuration = normalizeMcpServerConfiguration(value);
      if (configuration) {
        definitions2.push({
          name,
          configuration,
          defaultCwd: this._root,
          uri: this._definitionUri,
          customization: makeMcpServerCustomization(this._definitionUri, name)
        });
      }
    }
    return definitions2;
  }
};

var sharedRootDiscoveries = /* @__PURE__ */ new WeakMap();

function acquireRootMcpDiscovery(root, fileService) {
  let byRoot = sharedRootDiscoveries.get(fileService);
  if (!byRoot) {
    byRoot = new ResourceMap();
    sharedRootDiscoveries.set(fileService, byRoot);
  }
  let entry = byRoot.get(root);
  if (!entry) {
    entry = { discovery: new RootMcpDiscovery(root, fileService), refCount: 0 };
    byRoot.set(root, entry);
  }
  entry.refCount++;
  let isDisposed = false;
  return {
    discovery: entry.discovery,
    dispose: () => {
      if (isDisposed) {
        return;
      }
      isDisposed = true;
      if (--entry.refCount === 0) {
        byRoot.delete(root);
        entry.discovery.dispose();
        if (byRoot.size === 0) {
          sharedRootDiscoveries.delete(fileService);
        }
      }
    }
  };
}

var SessionMcpDiscovery = class extends Disposable {
  constructor(workingDirectories, fileService) {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._sequencer = new Sequencer();
    this._definitions = [];
    this._signature = "";
    this._initialized = false;
    this._roots = workingDirectories.map((root) => {
      const acquired = this._register(acquireRootMcpDiscovery(root, fileService));
      this._register(acquired.discovery.onDidChange(() => {
        void this._refreshFromSnapshots();
      }));
      return { root, discovery: acquired.discovery };
    });
  }
  get definitions() {
    return this._definitions;
  }
  async refresh() {
    await Promise.all(this._roots.map((root) => root.discovery.refresh()));
    return this._refreshFromSnapshots();
  }
  _refreshFromSnapshots() {
    return this._sequencer.queue(async () => {
      const definitions2 = this._mergeRootDefinitions();
      const signature = serializeDefinitions(definitions2);
      if (!this._initialized) {
        this._initialized = true;
        this._signature = signature;
        this._definitions = definitions2;
        return this._definitions;
      }
      if (signature !== this._signature) {
        this._signature = signature;
        this._definitions = definitions2;
        this._onDidChange.fire(definitions2);
      }
      return this._definitions;
    });
  }
  _mergeRootDefinitions() {
    const definitions2 = /* @__PURE__ */ new Map();
    for (const root of this._roots) {
      for (const definition of root.discovery.definitions) {
        const name = definition.name;
        if (definitions2.has(name)) {
          continue;
        }
        definitions2.set(name, definition);
      }
    }
    return [...definitions2.values()];
  }
};

function serializeDefinitions(definitions2) {
  return JSON.stringify(definitions2.map((definition) => ({
    name: definition.name,
    configuration: definition.configuration,
    defaultCwd: definition.defaultCwd?.toString(),
    uri: definition.uri.toString()
  })));
}
export { acquireRootMcpDiscovery, serializeDefinitions, RootMcpDiscovery, sharedRootDiscoveries, SessionMcpDiscovery };
