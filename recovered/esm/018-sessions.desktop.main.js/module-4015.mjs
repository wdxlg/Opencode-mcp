// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionDescriptionRegistry.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifier, ExtensionIdentifierMap, ExtensionIdentifierSet } from "./module-0688.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";
import { posix } from "./module-0026.mjs";


// src/vs/workbench/services/extensions/common/extensionDescriptionRegistry.ts
var DeltaExtensionsResult = class {
  constructor(versionId, removedDueToLooping) {
    this.versionId = versionId;
    this.removedDueToLooping = removedDueToLooping;
  }
};

var ExtensionDescriptionRegistry = class _ExtensionDescriptionRegistry extends Disposable {
  constructor(_activationEventsReader, extensionDescriptions) {
    super();
    this._activationEventsReader = _activationEventsReader;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._versionId = 0;
    this._extensionDescriptions = extensionDescriptions;
    this._initialize();
  }
  static isHostExtension(extensionId, myRegistry, globalRegistry) {
    if (myRegistry.getExtensionDescription(extensionId)) {
      return false;
    }
    const extensionDescription = globalRegistry.getExtensionDescription(extensionId);
    if (!extensionDescription) {
      return false;
    }
    if ((extensionDescription.main || extensionDescription.browser) && extensionDescription.api === "none") {
      return true;
    }
    return false;
  }
  _initialize() {
    this._extensionDescriptions.sort(extensionCmp);
    this._extensionsMap = new ExtensionIdentifierMap();
    this._extensionsArr = [];
    this._activationMap = /* @__PURE__ */ new Map();
    for (const extensionDescription of this._extensionDescriptions) {
      if (this._extensionsMap.has(extensionDescription.identifier)) {
        console.error("Extension `" + extensionDescription.identifier.value + "` is already registered");
        continue;
      }
      this._extensionsMap.set(extensionDescription.identifier, extensionDescription);
      this._extensionsArr.push(extensionDescription);
      const activationEvents = this._activationEventsReader.readActivationEvents(extensionDescription);
      for (const activationEvent of activationEvents) {
        if (!this._activationMap.has(activationEvent)) {
          this._activationMap.set(activationEvent, []);
        }
        this._activationMap.get(activationEvent).push(extensionDescription);
      }
    }
  }
  set(extensionDescriptions) {
    this._extensionDescriptions = extensionDescriptions;
    this._initialize();
    this._versionId++;
    this._onDidChange.fire(void 0);
    return {
      versionId: this._versionId
    };
  }
  deltaExtensions(toAdd, toRemove) {
    this._extensionDescriptions = removeExtensions(this._extensionDescriptions, toRemove);
    this._extensionDescriptions = this._extensionDescriptions.concat(toAdd);
    const looping = _ExtensionDescriptionRegistry._findLoopingExtensions(this._extensionDescriptions);
    this._extensionDescriptions = removeExtensions(this._extensionDescriptions, looping.map((ext) => ext.identifier));
    this._initialize();
    this._versionId++;
    this._onDidChange.fire(void 0);
    return new DeltaExtensionsResult(this._versionId, looping);
  }
  static _findLoopingExtensions(extensionDescriptions) {
    const G = new class {
      constructor() {
        this._arcs = /* @__PURE__ */ new Map();
        this._nodesSet = /* @__PURE__ */ new Set();
        this._nodesArr = [];
      }
      addNode(id2) {
        if (!this._nodesSet.has(id2)) {
          this._nodesSet.add(id2);
          this._nodesArr.push(id2);
        }
      }
      addArc(from, to) {
        this.addNode(from);
        this.addNode(to);
        if (this._arcs.has(from)) {
          this._arcs.get(from).push(to);
        } else {
          this._arcs.set(from, [to]);
        }
      }
      getArcs(id2) {
        if (this._arcs.has(id2)) {
          return this._arcs.get(id2);
        }
        return [];
      }
      hasOnlyGoodArcs(id2, good2) {
        const dependencies = G.getArcs(id2);
        for (let i2 = 0; i2 < dependencies.length; i2++) {
          if (!good2.has(dependencies[i2])) {
            return false;
          }
        }
        return true;
      }
      getNodes() {
        return this._nodesArr;
      }
    }();
    const descs = new ExtensionIdentifierMap();
    for (const extensionDescription of extensionDescriptions) {
      descs.set(extensionDescription.identifier, extensionDescription);
      if (extensionDescription.extensionDependencies) {
        for (const depId of extensionDescription.extensionDependencies) {
          G.addArc(ExtensionIdentifier.toKey(extensionDescription.identifier), ExtensionIdentifier.toKey(depId));
        }
      }
    }
    const good = /* @__PURE__ */ new Set();
    G.getNodes().filter((id2) => G.getArcs(id2).length === 0).forEach((id2) => good.add(id2));
    const nodes = G.getNodes().filter((id2) => !good.has(id2));
    let madeProgress;
    do {
      madeProgress = false;
      for (let i2 = 0; i2 < nodes.length; i2++) {
        const id2 = nodes[i2];
        if (G.hasOnlyGoodArcs(id2, good)) {
          nodes.splice(i2, 1);
          i2--;
          good.add(id2);
          madeProgress = true;
        }
      }
    } while (madeProgress);
    return nodes.map((id2) => descs.get(id2));
  }
  containsActivationEvent(activationEvent) {
    return this._activationMap.has(activationEvent);
  }
  containsExtension(extensionId) {
    return this._extensionsMap.has(extensionId);
  }
  getExtensionDescriptionsForActivationEvent(activationEvent) {
    const extensions = this._activationMap.get(activationEvent);
    return extensions ? extensions.slice(0) : [];
  }
  getAllExtensionDescriptions() {
    return this._extensionsArr.slice(0);
  }
  getSnapshot() {
    return new ExtensionDescriptionRegistrySnapshot(
      this._versionId,
      this.getAllExtensionDescriptions()
    );
  }
  getExtensionDescription(extensionId) {
    const extension = this._extensionsMap.get(extensionId);
    return extension ? extension : void 0;
  }
  getExtensionDescriptionByUUID(uuid) {
    for (const extensionDescription of this._extensionsArr) {
      if (extensionDescription.uuid === uuid) {
        return extensionDescription;
      }
    }
    return void 0;
  }
  getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
    return this.getExtensionDescription(extensionId) ?? (uuid ? this.getExtensionDescriptionByUUID(uuid) : void 0);
  }
};

var ExtensionDescriptionRegistrySnapshot = class {
  constructor(versionId, extensions) {
    this.versionId = versionId;
    this.extensions = extensions;
  }
};

var LockableExtensionDescriptionRegistry = class {
  constructor(activationEventsReader) {
    this._lock = new Lock();
    this._actual = new ExtensionDescriptionRegistry(activationEventsReader, []);
  }
  async acquireLock(customerName) {
    const lock = await this._lock.acquire(customerName);
    return new ExtensionDescriptionRegistryLock(this, lock);
  }
  deltaExtensions(acquiredLock, toAdd, toRemove) {
    if (!acquiredLock.isAcquiredFor(this)) {
      throw new Error("Lock is not held");
    }
    return this._actual.deltaExtensions(toAdd, toRemove);
  }
  containsActivationEvent(activationEvent) {
    return this._actual.containsActivationEvent(activationEvent);
  }
  containsExtension(extensionId) {
    return this._actual.containsExtension(extensionId);
  }
  getExtensionDescriptionsForActivationEvent(activationEvent) {
    return this._actual.getExtensionDescriptionsForActivationEvent(activationEvent);
  }
  getAllExtensionDescriptions() {
    return this._actual.getAllExtensionDescriptions();
  }
  getSnapshot() {
    return this._actual.getSnapshot();
  }
  getExtensionDescription(extensionId) {
    return this._actual.getExtensionDescription(extensionId);
  }
  getExtensionDescriptionByUUID(uuid) {
    return this._actual.getExtensionDescriptionByUUID(uuid);
  }
  getExtensionDescriptionByIdOrUUID(extensionId, uuid) {
    return this._actual.getExtensionDescriptionByIdOrUUID(extensionId, uuid);
  }
};

var ExtensionDescriptionRegistryLock = class extends Disposable {
  constructor(_registry2, lock) {
    super();
    this._registry = _registry2;
    this._isDisposed = false;
    this._register(lock);
  }
  isAcquiredFor(registry4) {
    return !this._isDisposed && this._registry === registry4;
  }
};

var LockCustomer = class {
  constructor(name) {
    this.name = name;
    const withResolvers = promiseWithResolvers();
    this.promise = withResolvers.promise;
    this._resolve = withResolvers.resolve;
  }
  resolve(value2) {
    this._resolve(value2);
  }
};

var Lock = class {
  constructor() {
    this._pendingCustomers = [];
    this._isLocked = false;
  }
  async acquire(customerName) {
    const customer = new LockCustomer(customerName);
    this._pendingCustomers.push(customer);
    this._advance();
    return customer.promise;
  }
  _advance() {
    if (this._isLocked) {
      return;
    }
    if (this._pendingCustomers.length === 0) {
      return;
    }
    const customer = this._pendingCustomers.shift();
    this._isLocked = true;
    let customerHoldsLock = true;
    const logLongRunningCustomerTimeout = setTimeout(
      () => {
        if (customerHoldsLock) {
          console.warn(`The customer named ${customer.name} has been holding on to the lock for 30s. This might be a problem.`);
        }
      },
      30 * 1e3
      /* 30 seconds */
    );
    const releaseLock = () => {
      if (!customerHoldsLock) {
        return;
      }
      clearTimeout(logLongRunningCustomerTimeout);
      customerHoldsLock = false;
      this._isLocked = false;
      this._advance();
    };
    customer.resolve(toDisposable(releaseLock));
  }
};

function extensionCmp(a, b) {
  const aSortBucket = a.isBuiltin ? 0 /* Builtin */ : a.isUnderDevelopment ? 2 /* Dev */ : 1 /* User */;
  const bSortBucket = b.isBuiltin ? 0 /* Builtin */ : b.isUnderDevelopment ? 2 /* Dev */ : 1 /* User */;
  if (aSortBucket !== bSortBucket) {
    return aSortBucket - bSortBucket;
  }
  const aLastSegment = posix.basename(a.extensionLocation.path);
  const bLastSegment = posix.basename(b.extensionLocation.path);
  if (aLastSegment < bLastSegment) {
    return -1;
  }
  if (aLastSegment > bLastSegment) {
    return 1;
  }
  return 0;
}

function removeExtensions(arr, toRemove) {
  const toRemoveSet = new ExtensionIdentifierSet(toRemove);
  return arr.filter((extension) => !toRemoveSet.has(extension.identifier));
}
export { extensionCmp, removeExtensions, DeltaExtensionsResult, ExtensionDescriptionRegistry, ExtensionDescriptionRegistrySnapshot, LockableExtensionDescriptionRegistry, ExtensionDescriptionRegistryLock, LockCustomer, Lock };
