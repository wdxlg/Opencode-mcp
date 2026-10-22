// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/common/remoteExplorerService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { Emitter } from "./module-0017.mjs";
import { TunnelModel } from "./module-1413.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITunnelService } from "./module-1409.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/remote/common/remoteExplorerService.ts
var IRemoteExplorerService = createDecorator("remoteExplorerService");

var REMOTE_EXPLORER_TYPE_KEY = "remote.explorerType";

var TUNNEL_VIEW_ID = "~remote.forwardedPorts";

var TUNNEL_VIEW_CONTAINER_ID = "~remote.forwardedPortsContainer";

var PORT_AUTO_FORWARD_SETTING = "remote.autoForwardPorts";

var PORT_AUTO_SOURCE_SETTING = "remote.autoForwardPortsSource";

var PORT_AUTO_FALLBACK_SETTING = "remote.autoForwardPortsFallback";

var PORT_AUTO_SOURCE_SETTING_PROCESS = "process";

var PORT_AUTO_SOURCE_SETTING_OUTPUT = "output";

var PORT_AUTO_SOURCE_SETTING_HYBRID = "hybrid";

var getStartedWalkthrough = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      description: localize(23329, null),
      type: "string"
    }
  }
};

var remoteHelpExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "remoteHelp",
  jsonSchema: {
    description: localize(23330, null),
    type: "object",
    properties: {
      "getStarted": {
        description: localize(23334, null),
        oneOf: [
          { type: "string" },
          getStartedWalkthrough
        ]
      },
      "documentation": {
        description: localize(23331, null),
        type: "string"
      },
      "feedback": {
        description: localize(23332, null),
        type: "string",
        markdownDeprecationMessage: localize(23333, null, "`reportIssue`")
      },
      "reportIssue": {
        description: localize(23336, null),
        type: "string"
      },
      "issues": {
        description: localize(23335, null),
        type: "string"
      }
    }
  }
});

var RemoteExplorerService = class {
  constructor(storageService, tunnelService, instantiationService) {
    this.storageService = storageService;
    this.tunnelService = tunnelService;
    this._targetType = [];
    this._onDidChangeTargetType = new Emitter();
    this.onDidChangeTargetType = this._onDidChangeTargetType.event;
    this._onDidChangeHelpInformation = new Emitter();
    this.onDidChangeHelpInformation = this._onDidChangeHelpInformation.event;
    this._helpInformation = [];
    this._onDidChangeEditable = new Emitter();
    this.onDidChangeEditable = this._onDidChangeEditable.event;
    this._onEnabledPortsFeatures = new Emitter();
    this.onEnabledPortsFeatures = this._onEnabledPortsFeatures.event;
    this._portsFeaturesEnabled = 0 /* Disabled */;
    this.namedProcesses = /* @__PURE__ */ new Map();
    this._tunnelModel = instantiationService.createInstance(TunnelModel);
    remoteHelpExtPoint.setHandler((extensions) => {
      this._helpInformation.push(...extensions);
      this._onDidChangeHelpInformation.fire(extensions);
    });
  }
  get helpInformation() {
    return this._helpInformation;
  }
  set targetType(name) {
    const current = this._targetType.length > 0 ? this._targetType[0] : "";
    const newName = name.length > 0 ? name[0] : "";
    if (current !== newName) {
      this._targetType = name;
      this.storageService.store(REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 1 /* WORKSPACE */, 1 /* MACHINE */);
      this.storageService.store(REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 0 /* PROFILE */, 0 /* USER */);
      this._onDidChangeTargetType.fire(this._targetType);
    }
  }
  get targetType() {
    return this._targetType;
  }
  get tunnelModel() {
    return this._tunnelModel;
  }
  forward(tunnelProperties, attributes) {
    return this.tunnelModel.forward(tunnelProperties, attributes);
  }
  close(remote, reason) {
    return this.tunnelModel.close(remote.host, remote.port, reason);
  }
  setTunnelInformation(tunnelInformation) {
    if (tunnelInformation?.features) {
      this.tunnelService.setTunnelFeatures(tunnelInformation.features);
    }
    this.tunnelModel.addEnvironmentTunnels(tunnelInformation?.environmentTunnels);
  }
  setEditable(tunnelItem, editId, data) {
    if (!data) {
      this._editable = void 0;
    } else {
      this._editable = { tunnelItem, data, editId };
    }
    this._onDidChangeEditable.fire(tunnelItem ? { tunnel: tunnelItem, editId } : void 0);
  }
  getEditableData(tunnelItem, editId) {
    return this._editable && (!tunnelItem && tunnelItem === this._editable.tunnelItem || tunnelItem && this._editable.tunnelItem?.remotePort === tunnelItem.remotePort && this._editable.tunnelItem.remoteHost === tunnelItem.remoteHost && this._editable.editId === editId) ? this._editable.data : void 0;
  }
  setCandidateFilter(filter2) {
    if (!filter2) {
      return {
        dispose: () => {
        }
      };
    }
    this.tunnelModel.setCandidateFilter(filter2);
    return {
      dispose: () => {
        this.tunnelModel.setCandidateFilter(void 0);
      }
    };
  }
  onFoundNewCandidates(candidates) {
    this.tunnelModel.setCandidates(candidates);
  }
  restore() {
    return this.tunnelModel.restoreForwarded();
  }
  enablePortsFeatures(viewOnly) {
    this._portsFeaturesEnabled = viewOnly ? 1 /* ViewOnly */ : 2 /* AdditionalFeatures */;
    this._onEnabledPortsFeatures.fire();
  }
  get portsFeaturesEnabled() {
    return this._portsFeaturesEnabled;
  }
};

RemoteExplorerService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, ITunnelService),
  __decorateParam(2, IInstantiationService)
], RemoteExplorerService);

registerSingleton(IRemoteExplorerService, RemoteExplorerService, 1 /* Delayed */);
export { IRemoteExplorerService, REMOTE_EXPLORER_TYPE_KEY, TUNNEL_VIEW_ID, TUNNEL_VIEW_CONTAINER_ID, PORT_AUTO_FORWARD_SETTING, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_FALLBACK_SETTING, PORT_AUTO_SOURCE_SETTING_PROCESS, PORT_AUTO_SOURCE_SETTING_OUTPUT, PORT_AUTO_SOURCE_SETTING_HYBRID, getStartedWalkthrough, remoteHelpExtPoint, RemoteExplorerService };
