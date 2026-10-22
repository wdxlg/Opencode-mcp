// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/remote/common/tunnelModel.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { ALL_INTERFACES_ADDRESSES, ITunnelService, LOCALHOST_ADDRESSES, isAllInterfaces, isLocalhost } from "./module-1408.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { isNumber, isObject, isString } from "./module-0010.mjs";
import { deepClone } from "./module-0098.mjs";
import { URI } from "./module-0032.mjs";
import { hash } from "./module-0039.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/services/remote/common/tunnelModel.ts
var MISMATCH_LOCAL_PORT_COOLDOWN = 10 * 1e3;

var TUNNELS_TO_RESTORE = "remote.tunnels.toRestore";

var TUNNELS_TO_RESTORE_EXPIRATION = "remote.tunnels.toRestoreExpiration";

var RESTORE_EXPIRATION_TIME = 1e3 * 60 * 60 * 24 * 14;

var ACTIVATION_EVENT = "onTunnel";

var forwardedPortsFeaturesEnabled = new RawContextKey("forwardedPortsViewEnabled", false, localize(23338, null));

var forwardedPortsViewEnabled = new RawContextKey("forwardedPortsViewOnlyEnabled", false, localize(23338, null));

function parseAddress(address) {
  const matches2 = address.match(/^([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*:)?([0-9]+)$/);
  if (!matches2) {
    return void 0;
  }
  return { host: matches2[1]?.substring(0, matches2[1].length - 1) || "localhost", port: Number(matches2[2]) };
}

var UserTunnelSource = {
  source: 0 /* User */,
  description: localize(23340, null)
};

var AutoTunnelSource = {
  source: 1 /* Auto */,
  description: localize(23339, null)
};

function mapHasAddress(map, host, port) {
  const initialAddress = map.get(makeAddress(host, port));
  if (initialAddress) {
    return initialAddress;
  }
  if (isLocalhost(host)) {
    for (const testHost of LOCALHOST_ADDRESSES) {
      const testAddress = makeAddress(testHost, port);
      if (map.has(testAddress)) {
        return map.get(testAddress);
      }
    }
  } else if (isAllInterfaces(host)) {
    for (const testHost of ALL_INTERFACES_ADDRESSES) {
      const testAddress = makeAddress(testHost, port);
      if (map.has(testAddress)) {
        return map.get(testAddress);
      }
    }
  }
  return void 0;
}

function mapHasAddressLocalhostOrAllInterfaces(map, host, port) {
  const originalAddress = mapHasAddress(map, host, port);
  if (originalAddress) {
    return originalAddress;
  }
  const otherHost = isAllInterfaces(host) ? "localhost" : isLocalhost(host) ? "0.0.0.0" : void 0;
  if (otherHost) {
    return mapHasAddress(map, otherHost, port);
  }
  return void 0;
}

function makeAddress(host, port) {
  return host + ":" + port;
}

function isCandidatePort(candidate) {
  return candidate && "host" in candidate && typeof candidate.host === "string" && "port" in candidate && typeof candidate.port === "number" && (!("detail" in candidate) || typeof candidate.detail === "string") && (!("pid" in candidate) || typeof candidate.pid === "string");
}

var PortsAttributes = class _PortsAttributes extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.portsAttributes = [];
    this._onDidChangeAttributes = this._register(new Emitter());
    this.onDidChangeAttributes = this._onDidChangeAttributes.event;
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(_PortsAttributes.SETTING) || e4.affectsConfiguration(_PortsAttributes.DEFAULTS)) {
        this.updateAttributes();
      }
    }));
    this.updateAttributes();
  }
  static {
    this.SETTING = "remote.portsAttributes";
  }
  static {
    this.DEFAULTS = "remote.otherPortsAttributes";
  }
  static {
    this.RANGE = /^(\d+)\-(\d+)$/;
  }
  static {
    this.HOST_AND_PORT = /^([a-z0-9\-]+):(\d{1,5})$/;
  }
  updateAttributes() {
    this.portsAttributes = this.readSetting();
    this._onDidChangeAttributes.fire();
  }
  getAttributes(port, host, commandLine) {
    let index2 = this.findNextIndex(port, host, commandLine, this.portsAttributes, 0);
    const attributes = {
      label: void 0,
      onAutoForward: void 0,
      elevateIfNeeded: void 0,
      requireLocalPort: void 0,
      protocol: void 0
    };
    while (index2 >= 0) {
      const found = this.portsAttributes[index2];
      if (found.key === port) {
        attributes.onAutoForward = found.onAutoForward ?? attributes.onAutoForward;
        attributes.elevateIfNeeded = found.elevateIfNeeded !== void 0 ? found.elevateIfNeeded : attributes.elevateIfNeeded;
        attributes.label = found.label ?? attributes.label;
        attributes.requireLocalPort = found.requireLocalPort;
        attributes.protocol = found.protocol;
      } else {
        attributes.onAutoForward = attributes.onAutoForward ?? found.onAutoForward;
        attributes.elevateIfNeeded = attributes.elevateIfNeeded !== void 0 ? attributes.elevateIfNeeded : found.elevateIfNeeded;
        attributes.label = attributes.label ?? found.label;
        attributes.requireLocalPort = attributes.requireLocalPort !== void 0 ? attributes.requireLocalPort : void 0;
        attributes.protocol = attributes.protocol ?? found.protocol;
      }
      index2 = this.findNextIndex(port, host, commandLine, this.portsAttributes, index2 + 1);
    }
    if (attributes.onAutoForward !== void 0 || attributes.elevateIfNeeded !== void 0 || attributes.label !== void 0 || attributes.requireLocalPort !== void 0 || attributes.protocol !== void 0) {
      return attributes;
    }
    return this.getOtherAttributes();
  }
  hasStartEnd(value2) {
    return value2.start !== void 0 && value2.end !== void 0;
  }
  hasHostAndPort(value2) {
    return value2.host !== void 0 && value2.port !== void 0 && isString(value2.host) && isNumber(value2.port);
  }
  findNextIndex(port, host, commandLine, attributes, fromIndex) {
    if (fromIndex >= attributes.length) {
      return -1;
    }
    const shouldUseHost = !isLocalhost(host) && !isAllInterfaces(host);
    const sliced = attributes.slice(fromIndex);
    const foundIndex = sliced.findIndex((value2) => {
      if (isNumber(value2.key)) {
        return shouldUseHost ? false : value2.key === port;
      } else if (this.hasStartEnd(value2.key)) {
        return shouldUseHost ? false : port >= value2.key.start && port <= value2.key.end;
      } else if (this.hasHostAndPort(value2.key)) {
        return port === value2.key.port && host === value2.key.host;
      } else {
        return commandLine ? value2.key.test(commandLine) : false;
      }
    });
    return foundIndex >= 0 ? foundIndex + fromIndex : -1;
  }
  readSetting() {
    const settingValue = this.configurationService.getValue(_PortsAttributes.SETTING);
    if (!settingValue || !isObject(settingValue)) {
      return [];
    }
    const attributes = [];
    for (const attributesKey in settingValue) {
      if (attributesKey === void 0) {
        continue;
      }
      const setting = settingValue[attributesKey];
      let key3 = void 0;
      if (Number(attributesKey)) {
        key3 = Number(attributesKey);
      } else if (isString(attributesKey)) {
        if (_PortsAttributes.RANGE.test(attributesKey)) {
          const match2 = attributesKey.match(_PortsAttributes.RANGE);
          key3 = { start: Number(match2[1]), end: Number(match2[2]) };
        } else if (_PortsAttributes.HOST_AND_PORT.test(attributesKey)) {
          const match2 = attributesKey.match(_PortsAttributes.HOST_AND_PORT);
          key3 = { host: match2[1], port: Number(match2[2]) };
        } else {
          let regTest = void 0;
          try {
            regTest = RegExp(attributesKey);
          } catch (e4) {
          }
          if (regTest) {
            key3 = regTest;
          }
        }
      }
      if (!key3) {
        continue;
      }
      attributes.push({
        key: key3,
        elevateIfNeeded: setting.elevateIfNeeded,
        onAutoForward: setting.onAutoForward,
        label: setting.label,
        requireLocalPort: setting.requireLocalPort,
        protocol: setting.protocol
      });
    }
    const defaults = this.configurationService.getValue(_PortsAttributes.DEFAULTS);
    if (defaults) {
      this.defaultPortAttributes = {
        elevateIfNeeded: defaults.elevateIfNeeded,
        label: defaults.label,
        onAutoForward: defaults.onAutoForward,
        requireLocalPort: defaults.requireLocalPort,
        protocol: defaults.protocol
      };
    }
    return this.sortAttributes(attributes);
  }
  sortAttributes(attributes) {
    function getVal(item, thisRef) {
      if (isNumber(item.key)) {
        return item.key;
      } else if (thisRef.hasStartEnd(item.key)) {
        return item.key.start;
      } else if (thisRef.hasHostAndPort(item.key)) {
        return item.key.port;
      } else {
        return Number.MAX_VALUE;
      }
    }
    return attributes.sort((a, b) => {
      return getVal(a, this) - getVal(b, this);
    });
  }
  getOtherAttributes() {
    return this.defaultPortAttributes;
  }
  static providedActionToAction(providedAction) {
    switch (providedAction) {
      case 1 /* Notify */:
        return "notify" /* Notify */;
      case 2 /* OpenBrowser */:
        return "openBrowser" /* OpenBrowser */;
      case 6 /* OpenBrowserOnce */:
        return "openBrowserOnce" /* OpenBrowserOnce */;
      case 3 /* OpenPreview */:
        return "openPreview" /* OpenPreview */;
      case 4 /* Silent */:
        return "silent" /* Silent */;
      case 5 /* Ignore */:
        return "ignore" /* Ignore */;
      default:
        return void 0;
    }
  }
  async addAttributes(port, attributes, target) {
    const settingValue = this.configurationService.inspect(_PortsAttributes.SETTING);
    const remoteValue = settingValue.userRemoteValue;
    let newRemoteValue;
    if (!remoteValue || !isObject(remoteValue)) {
      newRemoteValue = {};
    } else {
      newRemoteValue = deepClone(remoteValue);
    }
    if (!newRemoteValue[`${port}`]) {
      newRemoteValue[`${port}`] = {};
    }
    for (const attribute in attributes) {
      newRemoteValue[`${port}`][attribute] = attributes[attribute];
    }
    return this.configurationService.updateValue(_PortsAttributes.SETTING, newRemoteValue, target);
  }
};

var TunnelModel = class extends Disposable {
  constructor(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService, dialogService, extensionService, contextKeyService) {
    super();
    this.tunnelService = tunnelService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.workspaceContextService = workspaceContextService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.extensionService = extensionService;
    this.contextKeyService = contextKeyService;
    this.inProgress = /* @__PURE__ */ new Map();
    this._onForwardPort = this._register(new Emitter());
    this.onForwardPort = this._onForwardPort.event;
    this._onClosePort = this._register(new Emitter());
    this.onClosePort = this._onClosePort.event;
    this._onPortName = this._register(new Emitter());
    this.onPortName = this._onPortName.event;
    this._onCandidatesChanged = this._register(new Emitter());
    // onCandidateChanged returns the removed candidates
    this.onCandidatesChanged = this._onCandidatesChanged.event;
    this._onEnvironmentTunnelsSet = this._register(new Emitter());
    this.onEnvironmentTunnelsSet = this._onEnvironmentTunnelsSet.event;
    this._environmentTunnelsSet = false;
    this.restoreListener = void 0;
    this.restoreComplete = false;
    this.onRestoreComplete = this._register(new Emitter());
    this.unrestoredExtensionTunnels = /* @__PURE__ */ new Map();
    this.sessionCachedProperties = /* @__PURE__ */ new Map();
    this.portAttributesProviders = [];
    this.hasCheckedExtensionsOnTunnelOpened = false;
    this.mismatchCooldown = /* @__PURE__ */ new Date();
    this.configPortsAttributes = new PortsAttributes(configurationService);
    this.tunnelRestoreValue = this.getTunnelRestoreValue();
    this._register(this.configPortsAttributes.onDidChangeAttributes(this.updateAttributes, this));
    this.forwarded = /* @__PURE__ */ new Map();
    this.remoteTunnels = /* @__PURE__ */ new Map();
    this.tunnelService.tunnels.then(async (tunnels) => {
      const attributes = await this.getAttributes(tunnels.map((tunnel) => {
        return { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost };
      }));
      for (const tunnel of tunnels) {
        if (tunnel.localAddress) {
          const key3 = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
          const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? /* @__PURE__ */ new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
          this.forwarded.set(key3, {
            remotePort: tunnel.tunnelRemotePort,
            remoteHost: tunnel.tunnelRemoteHost,
            localAddress: tunnel.localAddress,
            protocol: attributes?.get(tunnel.tunnelRemotePort)?.protocol ?? "http" /* Http */,
            localUri: await this.makeLocalUri(tunnel.localAddress, attributes?.get(tunnel.tunnelRemotePort)),
            localPort: tunnel.tunnelLocalPort,
            name: attributes?.get(tunnel.tunnelRemotePort)?.label,
            runningProcess: matchingCandidate?.detail,
            hasRunningProcess: !!matchingCandidate,
            pid: matchingCandidate?.pid,
            privacy: tunnel.privacy,
            source: UserTunnelSource
          });
          this.remoteTunnels.set(key3, tunnel);
        }
      }
    });
    this.detected = /* @__PURE__ */ new Map();
    this._register(this.tunnelService.onTunnelOpened(async (tunnel) => {
      const key3 = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
      if (!mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort) && !mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort) && !mapHasAddressLocalhostOrAllInterfaces(this.inProgress, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort) && tunnel.localAddress) {
        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? /* @__PURE__ */ new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
        const attributes = (await this.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]))?.get(tunnel.tunnelRemotePort);
        this.forwarded.set(key3, {
          remoteHost: tunnel.tunnelRemoteHost,
          remotePort: tunnel.tunnelRemotePort,
          localAddress: tunnel.localAddress,
          protocol: attributes?.protocol ?? "http" /* Http */,
          localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
          localPort: tunnel.tunnelLocalPort,
          name: attributes?.label,
          closeable: true,
          runningProcess: matchingCandidate?.detail,
          hasRunningProcess: !!matchingCandidate,
          pid: matchingCandidate?.pid,
          privacy: tunnel.privacy,
          source: UserTunnelSource
        });
      }
      await this.storeForwarded();
      this.checkExtensionActivationEvents(true);
      this.remoteTunnels.set(key3, tunnel);
      this._onForwardPort.fire(this.forwarded.get(key3));
    }));
    this._register(this.tunnelService.onTunnelClosed((address) => {
      return this.onTunnelClosed(address, "Other" /* Other */);
    }));
    this.checkExtensionActivationEvents(false);
  }
  extensionHasActivationEvent() {
    if (this.extensionService.extensions.find((extension) => extension.activationEvents?.includes(ACTIVATION_EVENT))) {
      this.contextKeyService.createKey(forwardedPortsViewEnabled.key, true);
      return true;
    }
    return false;
  }
  checkExtensionActivationEvents(tunnelOpened) {
    if (this.hasCheckedExtensionsOnTunnelOpened) {
      return;
    }
    if (tunnelOpened) {
      this.hasCheckedExtensionsOnTunnelOpened = true;
    }
    const hasRemote = this.environmentService.remoteAuthority !== void 0;
    if (hasRemote && !tunnelOpened) {
      return;
    }
    if (this.extensionHasActivationEvent()) {
      return;
    }
    const activationDisposable = this._register(this.extensionService.onDidRegisterExtensions(() => {
      if (this.extensionHasActivationEvent()) {
        activationDisposable.dispose();
      }
    }));
  }
  async onTunnelClosed(address, reason) {
    const key3 = makeAddress(address.host, address.port);
    if (this.forwarded.delete(key3)) {
      await this.storeForwarded();
      this._onClosePort.fire(address);
    }
  }
  makeLocalUri(localAddress, attributes) {
    if (localAddress.startsWith("http")) {
      return URI.parse(localAddress);
    }
    const protocol = attributes?.protocol ?? "http";
    return URI.parse(`${protocol}://${localAddress}`);
  }
  async addStorageKeyPostfix(prefix) {
    const workspace = this.workspaceContextService.getWorkspace();
    const workspaceHash = workspace.configuration ? hash(workspace.configuration.path) : workspace.folders.length > 0 ? hash(workspace.folders[0].uri.path) : void 0;
    if (workspaceHash === void 0) {
      this.logService.debug("Could not get workspace hash for forwarded ports storage key.");
      return void 0;
    }
    return `${prefix}.${this.environmentService.remoteAuthority}.${workspaceHash}`;
  }
  async getTunnelRestoreStorageKey() {
    return this.addStorageKeyPostfix(TUNNELS_TO_RESTORE);
  }
  async getRestoreExpirationStorageKey() {
    return this.addStorageKeyPostfix(TUNNELS_TO_RESTORE_EXPIRATION);
  }
  async getTunnelRestoreValue() {
    const deprecatedValue = this.storageService.get(TUNNELS_TO_RESTORE, 1 /* WORKSPACE */);
    if (deprecatedValue) {
      this.storageService.remove(TUNNELS_TO_RESTORE, 1 /* WORKSPACE */);
      await this.storeForwarded();
      return deprecatedValue;
    }
    const storageKey = await this.getTunnelRestoreStorageKey();
    if (!storageKey) {
      return void 0;
    }
    return this.storageService.get(storageKey, 0 /* PROFILE */);
  }
  async restoreForwarded() {
    this.cleanupExpiredTunnelsForRestore();
    if (this.configurationService.getValue("remote.restoreForwardedPorts")) {
      const tunnelRestoreValue = await this.tunnelRestoreValue;
      if (tunnelRestoreValue && tunnelRestoreValue !== this.knownPortsRestoreValue) {
        const tunnels = JSON.parse(tunnelRestoreValue) ?? [];
        this.logService.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map((tunnel) => tunnel.remotePort).join(", ")}`);
        for (const tunnel of tunnels) {
          const alreadyForwarded2 = mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.remoteHost, tunnel.remotePort);
          if (tunnel.source.source !== 2 /* Extension */ && !alreadyForwarded2 || tunnel.source.source === 2 /* Extension */ && alreadyForwarded2) {
            await this.doForward({
              remote: { host: tunnel.remoteHost, port: tunnel.remotePort },
              local: tunnel.localPort,
              name: tunnel.name,
              elevateIfNeeded: true,
              source: tunnel.source
            });
          } else if (tunnel.source.source === 2 /* Extension */ && !alreadyForwarded2) {
            this.unrestoredExtensionTunnels.set(makeAddress(tunnel.remoteHost, tunnel.remotePort), tunnel);
          }
        }
      }
    }
    this.restoreComplete = true;
    this.onRestoreComplete.fire();
    if (!this.restoreListener) {
      const key3 = await this.getTunnelRestoreStorageKey();
      this.restoreListener = this._register(new DisposableStore());
      this.restoreListener.add(this.storageService.onDidChangeValue(0 /* PROFILE */, void 0, this.restoreListener)(async (e4) => {
        if (e4.key === key3) {
          this.tunnelRestoreValue = Promise.resolve(this.storageService.get(key3, 0 /* PROFILE */));
          await this.restoreForwarded();
        }
      }));
    }
  }
  cleanupExpiredTunnelsForRestore() {
    const keys = this.storageService.keys(0 /* PROFILE */, 0 /* USER */).filter((key3) => key3.startsWith(TUNNELS_TO_RESTORE_EXPIRATION));
    for (const key3 of keys) {
      const expiration = this.storageService.getNumber(key3, 0 /* PROFILE */);
      if (expiration && expiration < Date.now()) {
        this.tunnelRestoreValue = Promise.resolve(void 0);
        const storageKey = key3.replace(TUNNELS_TO_RESTORE_EXPIRATION, TUNNELS_TO_RESTORE);
        this.storageService.remove(key3, 0 /* PROFILE */);
        this.storageService.remove(storageKey, 0 /* PROFILE */);
      }
    }
  }
  async storeForwarded() {
    if (this.configurationService.getValue("remote.restoreForwardedPorts")) {
      const forwarded = Array.from(this.forwarded.values());
      const restorableTunnels = forwarded.map((tunnel) => {
        return {
          remoteHost: tunnel.remoteHost,
          remotePort: tunnel.remotePort,
          localPort: tunnel.localPort,
          name: tunnel.name,
          localAddress: tunnel.localAddress,
          localUri: tunnel.localUri,
          protocol: tunnel.protocol,
          source: tunnel.source
        };
      });
      let valueToStore;
      if (forwarded.length > 0) {
        valueToStore = JSON.stringify(restorableTunnels);
      }
      const key3 = await this.getTunnelRestoreStorageKey();
      const expirationKey = await this.getRestoreExpirationStorageKey();
      if (!valueToStore && key3 && expirationKey) {
        this.storageService.remove(key3, 0 /* PROFILE */);
        this.storageService.remove(expirationKey, 0 /* PROFILE */);
      } else if (valueToStore !== this.knownPortsRestoreValue && key3 && expirationKey) {
        this.storageService.store(key3, valueToStore, 0 /* PROFILE */, 0 /* USER */);
        this.storageService.store(expirationKey, Date.now() + RESTORE_EXPIRATION_TIME, 0 /* PROFILE */, 0 /* USER */);
      }
      this.knownPortsRestoreValue = valueToStore;
    }
  }
  async showPortMismatchModalIfNeeded(tunnel, expectedLocal, attributes) {
    if (!tunnel.tunnelLocalPort || !attributes?.requireLocalPort) {
      return;
    }
    if (tunnel.tunnelLocalPort === expectedLocal) {
      return;
    }
    const newCooldown = /* @__PURE__ */ new Date();
    if (this.mismatchCooldown.getTime() + MISMATCH_LOCAL_PORT_COOLDOWN > newCooldown.getTime()) {
      return;
    }
    this.mismatchCooldown = newCooldown;
    const mismatchString = localize(
      23337,
      null,
      expectedLocal,
      tunnel.tunnelRemotePort,
      tunnel.tunnelLocalPort
    );
    return this.dialogService.info(mismatchString);
  }
  async forward(tunnelProperties, attributes) {
    if (!this.restoreComplete && this.environmentService.remoteAuthority) {
      await Event2.toPromise(this.onRestoreComplete.event);
    }
    return this.doForward(tunnelProperties, attributes);
  }
  async doForward(tunnelProperties, attributes) {
    await this.extensionService.activateByEvent(ACTIVATION_EVENT);
    const existingTunnel = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, tunnelProperties.remote.host, tunnelProperties.remote.port);
    attributes = attributes ?? (attributes !== null ? (await this.getAttributes([tunnelProperties.remote]))?.get(tunnelProperties.remote.port) : void 0);
    const localPort = tunnelProperties.local !== void 0 ? tunnelProperties.local : tunnelProperties.remote.port;
    let noTunnelValue;
    if (!existingTunnel) {
      const authority = this.environmentService.remoteAuthority;
      const addressProvider = authority ? {
        getAddress: async () => {
          return (await this.remoteAuthorityResolverService.resolveAuthority(authority)).authority;
        }
      } : void 0;
      const key3 = makeAddress(tunnelProperties.remote.host, tunnelProperties.remote.port);
      this.inProgress.set(key3, true);
      tunnelProperties = this.mergeCachedAndUnrestoredProperties(key3, tunnelProperties);
      const tunnel = await this.tunnelService.openTunnel(addressProvider, tunnelProperties.remote.host, tunnelProperties.remote.port, void 0, localPort, !tunnelProperties.elevateIfNeeded ? attributes?.elevateIfNeeded : tunnelProperties.elevateIfNeeded, tunnelProperties.privacy, attributes?.protocol);
      if (typeof tunnel === "string") {
        noTunnelValue = tunnel;
      } else if (tunnel && tunnel.localAddress) {
        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? /* @__PURE__ */ new Map(), tunnelProperties.remote.host, tunnelProperties.remote.port);
        const protocol = tunnel.protocol ? tunnel.protocol === "https" /* Https */ ? "https" /* Https */ : "http" /* Http */ : attributes?.protocol ?? "http" /* Http */;
        const newForward = {
          remoteHost: tunnel.tunnelRemoteHost,
          remotePort: tunnel.tunnelRemotePort,
          localPort: tunnel.tunnelLocalPort,
          name: attributes?.label ?? tunnelProperties.name,
          closeable: true,
          localAddress: tunnel.localAddress,
          protocol,
          localUri: await this.makeLocalUri(tunnel.localAddress, attributes),
          runningProcess: matchingCandidate?.detail,
          hasRunningProcess: !!matchingCandidate,
          pid: matchingCandidate?.pid,
          source: tunnelProperties.source ?? UserTunnelSource,
          privacy: tunnel.privacy
        };
        this.forwarded.set(key3, newForward);
        this.remoteTunnels.set(key3, tunnel);
        this.inProgress.delete(key3);
        await this.storeForwarded();
        await this.showPortMismatchModalIfNeeded(tunnel, localPort, attributes);
        this._onForwardPort.fire(newForward);
        return tunnel;
      }
      this.inProgress.delete(key3);
    } else {
      return this.mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes);
    }
    return noTunnelValue;
  }
  mergeCachedAndUnrestoredProperties(key3, tunnelProperties) {
    const map = this.unrestoredExtensionTunnels.has(key3) ? this.unrestoredExtensionTunnels : this.sessionCachedProperties.has(key3) ? this.sessionCachedProperties : void 0;
    if (map) {
      const updateProps = map.get(key3);
      map.delete(key3);
      if (updateProps) {
        tunnelProperties.name = updateProps.name ?? tunnelProperties.name;
        tunnelProperties.local = ("local" in updateProps ? updateProps.local : "localPort" in updateProps ? updateProps.localPort : void 0) ?? tunnelProperties.local;
        tunnelProperties.privacy = tunnelProperties.privacy;
      }
    }
    return tunnelProperties;
  }
  async mergeAttributesIntoExistingTunnel(existingTunnel, tunnelProperties, attributes) {
    const newName = attributes?.label ?? tunnelProperties.name;
    let MergedAttributeAction;
    ((MergedAttributeAction2) => {
      MergedAttributeAction2[MergedAttributeAction2["None"] = 0] = "None";
      MergedAttributeAction2[MergedAttributeAction2["Fire"] = 1] = "Fire";
      MergedAttributeAction2[MergedAttributeAction2["Reopen"] = 2] = "Reopen";
    })(MergedAttributeAction || (MergedAttributeAction = {}));
    let mergedAction = 0 /* None */;
    if (newName !== existingTunnel.name) {
      existingTunnel.name = newName;
      mergedAction = 1 /* Fire */;
    }
    if ((attributes?.protocol || existingTunnel.protocol !== "http" /* Http */) && attributes?.protocol !== existingTunnel.protocol) {
      tunnelProperties.source = existingTunnel.source;
      mergedAction = 2 /* Reopen */;
    }
    if (tunnelProperties.privacy && existingTunnel.privacy !== tunnelProperties.privacy) {
      mergedAction = 2 /* Reopen */;
    }
    switch (mergedAction) {
      case 1 /* Fire */: {
        this._onForwardPort.fire();
        break;
      }
      case 2 /* Reopen */: {
        await this.close(existingTunnel.remoteHost, existingTunnel.remotePort, "User" /* User */);
        await this.doForward(tunnelProperties, attributes);
      }
    }
    return mapHasAddressLocalhostOrAllInterfaces(this.remoteTunnels, tunnelProperties.remote.host, tunnelProperties.remote.port);
  }
  async name(host, port, name) {
    const existingForwarded = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, host, port);
    const key3 = makeAddress(host, port);
    if (existingForwarded) {
      existingForwarded.name = name;
      await this.storeForwarded();
      this._onPortName.fire({ host, port });
      return;
    } else if (this.detected.has(key3)) {
      this.detected.get(key3).name = name;
      this._onPortName.fire({ host, port });
    }
  }
  async close(host, port, reason) {
    const key3 = makeAddress(host, port);
    const oldTunnel = this.forwarded.get(key3);
    if (reason === "AutoForwardEnd" /* AutoForwardEnd */ && oldTunnel && oldTunnel.source.source === 1 /* Auto */) {
      this.sessionCachedProperties.set(key3, {
        local: oldTunnel.localPort,
        name: oldTunnel.name,
        privacy: oldTunnel.privacy
      });
    }
    await this.tunnelService.closeTunnel(host, port);
    return this.onTunnelClosed({ host, port }, reason);
  }
  address(host, port) {
    const key3 = makeAddress(host, port);
    return (this.forwarded.get(key3) || this.detected.get(key3))?.localAddress;
  }
  get environmentTunnelsSet() {
    return this._environmentTunnelsSet;
  }
  addEnvironmentTunnels(tunnels) {
    if (tunnels) {
      for (const tunnel of tunnels) {
        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? /* @__PURE__ */ new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
        const localAddress = typeof tunnel.localAddress === "string" ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port);
        this.detected.set(makeAddress(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
          remoteHost: tunnel.remoteAddress.host,
          remotePort: tunnel.remoteAddress.port,
          localAddress,
          protocol: "http" /* Http */,
          localUri: this.makeLocalUri(localAddress),
          closeable: false,
          runningProcess: matchingCandidate?.detail,
          hasRunningProcess: !!matchingCandidate,
          pid: matchingCandidate?.pid,
          privacy: "constantPrivate" /* ConstantPrivate */,
          source: {
            source: 2 /* Extension */,
            description: localize(23341, null)
          }
        });
        this.tunnelService.setEnvironmentTunnel(tunnel.remoteAddress.host, tunnel.remoteAddress.port, localAddress, "constantPrivate" /* ConstantPrivate */, "http" /* Http */);
      }
    }
    this._environmentTunnelsSet = true;
    this._onEnvironmentTunnelsSet.fire();
    this._onForwardPort.fire();
  }
  setCandidateFilter(filter2) {
    this._candidateFilter = filter2;
  }
  async setCandidates(candidates) {
    let processedCandidates = candidates;
    if (this._candidateFilter) {
      processedCandidates = await this._candidateFilter(candidates);
    }
    const removedCandidates = this.updateInResponseToCandidates(processedCandidates);
    this.logService.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map((candidate) => candidate.port).join(", ")}`);
    this._onCandidatesChanged.fire(removedCandidates);
  }
  // Returns removed candidates
  updateInResponseToCandidates(candidates) {
    const removedCandidates = this._candidates ?? /* @__PURE__ */ new Map();
    const candidatesMap = /* @__PURE__ */ new Map();
    this._candidates = candidatesMap;
    candidates.forEach((value2) => {
      const addressKey = makeAddress(value2.host, value2.port);
      candidatesMap.set(addressKey, {
        host: value2.host,
        port: value2.port,
        detail: value2.detail,
        pid: value2.pid
      });
      removedCandidates.delete(addressKey);
      const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, value2.host, value2.port);
      if (forwardedValue) {
        forwardedValue.runningProcess = value2.detail;
        forwardedValue.hasRunningProcess = true;
        forwardedValue.pid = value2.pid;
      }
    });
    removedCandidates.forEach((_value, key3) => {
      const parsedAddress = parseAddress(key3);
      if (!parsedAddress) {
        return;
      }
      const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, parsedAddress.host, parsedAddress.port);
      if (forwardedValue) {
        forwardedValue.runningProcess = void 0;
        forwardedValue.hasRunningProcess = false;
        forwardedValue.pid = void 0;
      }
      const detectedValue = mapHasAddressLocalhostOrAllInterfaces(this.detected, parsedAddress.host, parsedAddress.port);
      if (detectedValue) {
        detectedValue.runningProcess = void 0;
        detectedValue.hasRunningProcess = false;
        detectedValue.pid = void 0;
      }
    });
    return removedCandidates;
  }
  get candidates() {
    return this._candidates ? Array.from(this._candidates.values()) : [];
  }
  get candidatesOrUndefined() {
    return this._candidates ? this.candidates : void 0;
  }
  async updateAttributes() {
    const tunnels = Array.from(this.forwarded.values());
    const allAttributes = await this.getAttributes(tunnels.map((tunnel) => {
      return { port: tunnel.remotePort, host: tunnel.remoteHost };
    }), false);
    if (!allAttributes) {
      return;
    }
    for (const forwarded of tunnels) {
      const attributes = allAttributes.get(forwarded.remotePort);
      if ((attributes?.protocol || forwarded.protocol !== "http" /* Http */) && attributes?.protocol !== forwarded.protocol) {
        await this.doForward({
          remote: { host: forwarded.remoteHost, port: forwarded.remotePort },
          local: forwarded.localPort,
          name: forwarded.name,
          source: forwarded.source
        }, attributes);
      }
      if (!attributes) {
        continue;
      }
      if (attributes.label && attributes.label !== forwarded.name) {
        await this.name(forwarded.remoteHost, forwarded.remotePort, attributes.label);
      }
    }
  }
  async getAttributes(forwardedPorts, checkProviders = true) {
    const matchingCandidates = /* @__PURE__ */ new Map();
    const pidToPortsMapping = /* @__PURE__ */ new Map();
    forwardedPorts.forEach((forwardedPort) => {
      const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces(this._candidates ?? /* @__PURE__ */ new Map(), LOCALHOST_ADDRESSES[0], forwardedPort.port) ?? forwardedPort;
      if (matchingCandidate) {
        matchingCandidates.set(forwardedPort.port, matchingCandidate);
        const pid = isCandidatePort(matchingCandidate) ? matchingCandidate.pid : void 0;
        if (!pidToPortsMapping.has(pid)) {
          pidToPortsMapping.set(pid, []);
        }
        pidToPortsMapping.get(pid)?.push(forwardedPort.port);
      }
    });
    const configAttributes = /* @__PURE__ */ new Map();
    forwardedPorts.forEach((forwardedPort) => {
      const attributes = this.configPortsAttributes.getAttributes(forwardedPort.port, forwardedPort.host, matchingCandidates.get(forwardedPort.port)?.detail);
      if (attributes) {
        configAttributes.set(forwardedPort.port, attributes);
      }
    });
    if (this.portAttributesProviders.length === 0 || !checkProviders) {
      return configAttributes.size > 0 ? configAttributes : void 0;
    }
    const allProviderResults = await Promise.all(this.portAttributesProviders.flatMap((provider) => {
      return Array.from(pidToPortsMapping.entries()).map((entry) => {
        const portGroup = entry[1];
        const matchingCandidate = matchingCandidates.get(portGroup[0]);
        return provider.providePortAttributes(
          portGroup,
          matchingCandidate?.pid,
          matchingCandidate?.detail,
          CancellationToken.None
        );
      });
    }));
    const providedAttributes = /* @__PURE__ */ new Map();
    allProviderResults.forEach((attributes) => attributes.forEach((attribute) => {
      if (attribute) {
        providedAttributes.set(attribute.port, attribute);
      }
    }));
    if (!configAttributes && !providedAttributes) {
      return void 0;
    }
    const mergedAttributes = /* @__PURE__ */ new Map();
    forwardedPorts.forEach((forwardedPorts2) => {
      const config = configAttributes.get(forwardedPorts2.port);
      const provider = providedAttributes.get(forwardedPorts2.port);
      mergedAttributes.set(forwardedPorts2.port, {
        elevateIfNeeded: config?.elevateIfNeeded,
        label: config?.label,
        onAutoForward: config?.onAutoForward ?? PortsAttributes.providedActionToAction(provider?.autoForwardAction),
        requireLocalPort: config?.requireLocalPort,
        protocol: config?.protocol
      });
    });
    return mergedAttributes;
  }
  addAttributesProvider(provider) {
    this.portAttributesProviders.push(provider);
  }
};

__decorateClass([
  debounce(1e3)
], TunnelModel.prototype, "storeForwarded", 1);

TunnelModel = __decorateClass([
  __decorateParam(0, ITunnelService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IRemoteAuthorityResolverService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IExtensionService),
  __decorateParam(9, IContextKeyService)
], TunnelModel);
export { parseAddress, mapHasAddress, mapHasAddressLocalhostOrAllInterfaces, makeAddress, isCandidatePort, MISMATCH_LOCAL_PORT_COOLDOWN, TUNNELS_TO_RESTORE, TUNNELS_TO_RESTORE_EXPIRATION, RESTORE_EXPIRATION_TIME, ACTIVATION_EVENT, forwardedPortsFeaturesEnabled, forwardedPortsViewEnabled, UserTunnelSource, AutoTunnelSource, PortsAttributes, TunnelModel };
