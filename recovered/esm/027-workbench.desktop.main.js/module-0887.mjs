// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensions.ts
import { ExtensionIdentifier, ExtensionIdentifierMap, ExtensionIdentifierSet } from "./module-0688.mjs";
import { URI } from "./module-0032.mjs";
import { createDecorator } from "./module-0077.mjs";
import { ImplicitActivationEvents } from "./module-0874.mjs";
import { toDisposable } from "./module-0012.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { getExtensionId, getGalleryExtensionId } from "./module-0886.mjs";


// src/vs/workbench/services/extensions/common/extensions.ts
var nullExtensionDescription = Object.freeze({
  identifier: new ExtensionIdentifier("nullExtensionDescription"),
  name: "Null Extension Description",
  version: "0.0.0",
  publisher: "vscode",
  engines: { vscode: "" },
  extensionLocation: URI.parse("void:location"),
  isBuiltin: false,
  targetPlatform: "undefined" /* UNDEFINED */,
  isUserBuiltin: false,
  isUnderDevelopment: false,
  preRelease: false
});

var webWorkerExtHostConfig = "extensions.webWorker";

var IExtensionService = createDecorator("extensionService");

var ExtensionHostExtensions = class {
  get versionId() {
    return this._versionId;
  }
  get allExtensions() {
    return this._allExtensions;
  }
  get myExtensions() {
    return this._myExtensions;
  }
  constructor(versionId, allExtensions, myExtensions) {
    this._versionId = versionId;
    this._allExtensions = allExtensions.slice(0);
    this._myExtensions = myExtensions.slice(0);
    this._myActivationEvents = null;
  }
  toSnapshot() {
    return {
      versionId: this._versionId,
      allExtensions: this._allExtensions,
      myExtensions: this._myExtensions,
      activationEvents: ImplicitActivationEvents.createActivationEventsMap(this._allExtensions)
    };
  }
  set(versionId, allExtensions, myExtensions) {
    if (this._versionId > versionId) {
      throw new Error(`ExtensionHostExtensions: invalid versionId ${versionId} (current: ${this._versionId})`);
    }
    const toRemove = [];
    const toAdd = [];
    const myToRemove = [];
    const myToAdd = [];
    const oldExtensionsMap = extensionDescriptionArrayToMap(this._allExtensions);
    const newExtensionsMap = extensionDescriptionArrayToMap(allExtensions);
    const extensionsAreTheSame = (a, b) => {
      return a.extensionLocation.toString() === b.extensionLocation.toString() || a.isBuiltin === b.isBuiltin || a.isUserBuiltin === b.isUserBuiltin || a.isUnderDevelopment === b.isUnderDevelopment;
    };
    for (const oldExtension of this._allExtensions) {
      const newExtension = newExtensionsMap.get(oldExtension.identifier);
      if (!newExtension) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
      if (!extensionsAreTheSame(oldExtension, newExtension)) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
    }
    for (const newExtension of allExtensions) {
      const oldExtension = oldExtensionsMap.get(newExtension.identifier);
      if (!oldExtension) {
        toAdd.push(newExtension);
        continue;
      }
      if (!extensionsAreTheSame(oldExtension, newExtension)) {
        toRemove.push(oldExtension.identifier);
        oldExtensionsMap.delete(oldExtension.identifier);
        continue;
      }
    }
    const myOldExtensionsSet = new ExtensionIdentifierSet(this._myExtensions);
    const myNewExtensionsSet = new ExtensionIdentifierSet(myExtensions);
    for (const oldExtensionId of this._myExtensions) {
      if (!myNewExtensionsSet.has(oldExtensionId)) {
        myToRemove.push(oldExtensionId);
      }
    }
    for (const newExtensionId of myExtensions) {
      if (!myOldExtensionsSet.has(newExtensionId)) {
        myToAdd.push(newExtensionId);
      }
    }
    const addActivationEvents = ImplicitActivationEvents.createActivationEventsMap(toAdd);
    const delta2 = { versionId, toRemove, toAdd, addActivationEvents, myToRemove, myToAdd };
    this.delta(delta2);
    return delta2;
  }
  delta(extensionsDelta) {
    if (this._versionId >= extensionsDelta.versionId) {
      return null;
    }
    const { toRemove, toAdd, myToRemove, myToAdd } = extensionsDelta;
    const toRemoveSet = new ExtensionIdentifierSet(toRemove);
    const myToRemoveSet = new ExtensionIdentifierSet(myToRemove);
    for (let i2 = 0; i2 < this._allExtensions.length; i2++) {
      if (toRemoveSet.has(this._allExtensions[i2].identifier)) {
        this._allExtensions.splice(i2, 1);
        i2--;
      }
    }
    for (let i2 = 0; i2 < this._myExtensions.length; i2++) {
      if (myToRemoveSet.has(this._myExtensions[i2])) {
        this._myExtensions.splice(i2, 1);
        i2--;
      }
    }
    for (const extension of toAdd) {
      this._allExtensions.push(extension);
    }
    for (const extensionId of myToAdd) {
      this._myExtensions.push(extensionId);
    }
    this._myActivationEvents = null;
    return extensionsDelta;
  }
  containsExtension(extensionId) {
    for (const myExtensionId of this._myExtensions) {
      if (ExtensionIdentifier.equals(myExtensionId, extensionId)) {
        return true;
      }
    }
    return false;
  }
  containsActivationEvent(activationEvent) {
    if (!this._myActivationEvents) {
      this._myActivationEvents = this._readMyActivationEvents();
    }
    return this._myActivationEvents.has(activationEvent);
  }
  _readMyActivationEvents() {
    const result = /* @__PURE__ */ new Set();
    for (const extensionDescription of this._allExtensions) {
      if (!this.containsExtension(extensionDescription.identifier)) {
        continue;
      }
      const activationEvents = ImplicitActivationEvents.readActivationEvents(extensionDescription);
      for (const activationEvent of activationEvents) {
        result.add(activationEvent);
      }
    }
    return result;
  }
};

function extensionDescriptionArrayToMap(extensions) {
  const result = new ExtensionIdentifierMap();
  for (const extension of extensions) {
    result.set(extension.identifier, extension);
  }
  return result;
}

function isProposedApiEnabled(extension, proposal) {
  if (!extension.enabledApiProposals) {
    return false;
  }
  let enabled = extension.enabledApiProposals.includes(proposal);
  if (!enabled && _proposedApiEnabledResolver?.(extension, proposal)) {
    enabled = true;
  }
  if (!enabled) {
    reportDisabledProposedApiUsage(extension, proposal);
  }
  return enabled;
}

var _proposedApiUsageReporter;

var _reportedProposedApiUsages = /* @__PURE__ */ new Set();

function setProposedApiUsageReporter(reporter) {
  _proposedApiUsageReporter = reporter;
  return toDisposable(() => {
    if (_proposedApiUsageReporter === reporter) {
      _proposedApiUsageReporter = void 0;
    }
  });
}

function reportDisabledProposedApiUsage(extension, proposal) {
  const reporter = _proposedApiUsageReporter;
  if (!reporter) {
    return;
  }
  const key3 = `${ExtensionIdentifier.toKey(extension.identifier)}/${proposal}`;
  if (_reportedProposedApiUsages.has(key3)) {
    return;
  }
  _reportedProposedApiUsages.add(key3);
  reporter({ extensionId: extension.identifier.value, proposalName: proposal });
}

var _proposedApiEnabledResolver;

var enabledApiProposalsFallbackExperimentName = "extensionEnabledApiProposalsFallback";

async function resolveEnabledApiProposalsFallbackExperiment(assignmentService, quality) {
  if (quality !== "stable") {
    return void 0;
  }
  try {
    return await raceTimeout(assignmentService.getTreatment(enabledApiProposalsFallbackExperimentName), 5e3);
  } catch {
    return void 0;
  }
}

function checkProposedApiEnabled(extension, proposal) {
  if (!isProposedApiEnabled(extension, proposal)) {
    throw new Error(`Extension '${extension.identifier.value}' CANNOT use API proposal: ${proposal}.
Its package.json#enabledApiProposals-property declares: ${extension.enabledApiProposals?.join(", ") ?? "[]"} but NOT ${proposal}.
 The missing proposal MUST be added and you must start in extension development mode or use the following command line switch: --enable-proposed-api ${extension.identifier.value}`);
  }
}

var ActivationTimes = class {
  constructor(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
    this.codeLoadingTime = codeLoadingTime;
    this.activateCallTime = activateCallTime;
    this.activateResolvedTime = activateResolvedTime;
    this.activationReason = activationReason;
  }
};

var ExtensionPointContribution = class {
  constructor(description, value2) {
    this.description = description;
    this.value = value2;
  }
};

function toExtension(extensionDescription) {
  return {
    type: extensionDescription.isBuiltin ? 0 /* System */ : 1 /* User */,
    isBuiltin: extensionDescription.isBuiltin || extensionDescription.isUserBuiltin,
    identifier: { id: getGalleryExtensionId(extensionDescription.publisher, extensionDescription.name), uuid: extensionDescription.uuid },
    manifest: extensionDescription,
    location: extensionDescription.extensionLocation,
    targetPlatform: extensionDescription.targetPlatform,
    validations: [],
    isValid: true,
    preRelease: extensionDescription.preRelease,
    publisherDisplayName: extensionDescription.publisherDisplayName
  };
}

function toExtensionDescription(extension, isUnderDevelopment) {
  const id2 = getExtensionId(extension.manifest.publisher, extension.manifest.name);
  return {
    id: id2,
    identifier: new ExtensionIdentifier(id2),
    isBuiltin: extension.type === 0 /* System */,
    isUserBuiltin: extension.type === 1 /* User */ && extension.isBuiltin,
    isUnderDevelopment: !!isUnderDevelopment,
    extensionLocation: extension.location,
    uuid: extension.identifier.uuid,
    targetPlatform: extension.targetPlatform,
    publisherDisplayName: extension.publisherDisplayName,
    preRelease: extension.preRelease,
    ...extension.manifest
  };
}
export { extensionDescriptionArrayToMap, isProposedApiEnabled, setProposedApiUsageReporter, reportDisabledProposedApiUsage, resolveEnabledApiProposalsFallbackExperiment, checkProposedApiEnabled, toExtension, toExtensionDescription, nullExtensionDescription, webWorkerExtHostConfig, IExtensionService, ExtensionHostExtensions, _proposedApiUsageReporter, _reportedProposedApiUsages, _proposedApiEnabledResolver, enabledApiProposalsFallbackExperimentName, ActivationTimes, ExtensionPointContribution };
