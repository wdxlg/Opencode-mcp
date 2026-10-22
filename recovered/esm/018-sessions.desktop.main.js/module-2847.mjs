// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/nativeMcpDiscoveryAbstract.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { discoverySourceLabel, mcpDiscoverySection } from "./module-1420.mjs";
import { autorun } from "./module-0052.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { localize } from "./module-0001.mjs";
import { Schemas } from "./module-0033.mjs";
import { ClaudeDesktopMpcDiscoveryAdapter, CursorDesktopMpcDiscoveryAdapter, WindsurfDesktopMpcDiscoveryAdapter } from "./module-2846.mjs";
import { URI } from "./module-0032.mjs";
import { McpServerTrust } from "./module-1206.mjs";
import { observableValue } from "./module-0048.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/nativeMcpDiscoveryAbstract.ts
var FilesystemMcpDiscovery = class extends Disposable {
  constructor(configurationService, _fileService, _mcpRegistry) {
    super();
    this._fileService = _fileService;
    this._mcpRegistry = _mcpRegistry;
    this.fromGallery = false;
    this._fsDiscoveryEnabled = observableConfigValue(mcpDiscoverySection, void 0, configurationService);
  }
  _isDiscoveryEnabled(reader, discoverySource) {
    const fsDiscovery = this._fsDiscoveryEnabled.read(reader);
    if (typeof fsDiscovery === "boolean") {
      return fsDiscovery;
    }
    if (discoverySource && fsDiscovery?.[discoverySource] === true) {
      return true;
    }
    return false;
  }
  watchFile(file, collection, discoverySource, adaptFile) {
    const store = new DisposableStore();
    const collectionRegistration = store.add(new MutableDisposable());
    const updateFile = async () => {
      let definitions3 = [];
      try {
        const contents = await this._fileService.readFile(file);
        definitions3 = await adaptFile(contents.value) || [];
      } catch {
      }
      if (!definitions3.length) {
        collectionRegistration.clear();
      } else {
        collection.serverDefinitions.set(definitions3, void 0);
        if (!collectionRegistration.value) {
          collectionRegistration.value = this._mcpRegistry.registerCollection(collection);
        }
      }
    };
    store.add(autorun((reader) => {
      if (!this._isDiscoveryEnabled(reader, discoverySource)) {
        collectionRegistration.clear();
        return;
      }
      const throttler = reader.store.add(new RunOnceScheduler(updateFile, 500));
      const watcher = reader.store.add(this._fileService.createWatcher(file, { recursive: false, excludes: [] }));
      reader.store.add(watcher.onDidChange(() => throttler.schedule()));
      updateFile();
    }));
    return store;
  }
};

FilesystemMcpDiscovery = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IMcpRegistry)
], FilesystemMcpDiscovery);

var NativeFilesystemMcpDiscovery = class extends FilesystemMcpDiscovery {
  constructor(remoteAuthority, labelService, fileService, instantiationService, mcpRegistry, configurationService) {
    super(configurationService, fileService, mcpRegistry);
    this.suffix = "";
    if (remoteAuthority) {
      this.suffix = " " + localize(17104, null, labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority));
    }
    this.adapters = [
      instantiationService.createInstance(ClaudeDesktopMpcDiscoveryAdapter, remoteAuthority),
      instantiationService.createInstance(CursorDesktopMpcDiscoveryAdapter, remoteAuthority),
      instantiationService.createInstance(WindsurfDesktopMpcDiscoveryAdapter, remoteAuthority)
    ];
  }
  setDetails(detailsDto) {
    if (!detailsDto) {
      return;
    }
    const details = {
      ...detailsDto,
      homedir: URI.revive(detailsDto.homedir),
      xdgHome: detailsDto.xdgHome ? URI.revive(detailsDto.xdgHome) : void 0,
      winAppData: detailsDto.winAppData ? URI.revive(detailsDto.winAppData) : void 0
    };
    for (const adapter of this.adapters) {
      const file = adapter.getFilePath(details);
      if (!file) {
        continue;
      }
      const collection = {
        id: adapter.id,
        provenance: "externalConfiguration" /* ExternalConfiguration */,
        discoverySource: adapter.discoverySource,
        label: discoverySourceLabel[adapter.discoverySource] + this.suffix,
        remoteAuthority: adapter.remoteAuthority,
        configTarget: 2 /* USER */,
        scope: 0 /* PROFILE */,
        trustBehavior: McpServerTrust.Kind.TrustedOnNonce,
        serverDefinitions: observableValue(this, []),
        order: adapter.order + (adapter.remoteAuthority ? -50 /* RemoteBoost */ : 0),
        presentation: {
          origin: file
        }
      };
      this._register(this.watchFile(file, collection, adapter.discoverySource, (contents) => adapter.adaptFile(contents, details)));
    }
  }
};

NativeFilesystemMcpDiscovery = __decorateClass([
  __decorateParam(1, ILabelService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IMcpRegistry),
  __decorateParam(5, IConfigurationService)
], NativeFilesystemMcpDiscovery);
export { FilesystemMcpDiscovery, NativeFilesystemMcpDiscovery };
