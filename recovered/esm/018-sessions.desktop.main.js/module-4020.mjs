// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionRunningLocationTracker.ts
import { ExtensionIdentifierMap } from "./module-0688.mjs";
import { isProposedApiEnabled } from "./module-0889.mjs";
import { determineExtensionHostKinds } from "./module-1180.mjs";
import { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation } from "./module-4019.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionManifestPropertiesService } from "./module-1049.mjs";


// src/vs/workbench/services/extensions/common/extensionRunningLocationTracker.ts
var ExtensionRunningLocationTracker = class {
  constructor(_registry2, _extensionHostKindPicker, _environmentService, _configurationService, _logService, _extensionManifestPropertiesService) {
    this._registry = _registry2;
    this._extensionHostKindPicker = _extensionHostKindPicker;
    this._environmentService = _environmentService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
    this._runningLocation = new ExtensionIdentifierMap();
    this._maxLocalProcessAffinity = 0;
    this._maxLocalWebWorkerAffinity = 0;
  }
  get maxLocalProcessAffinity() {
    return this._maxLocalProcessAffinity;
  }
  get maxLocalWebWorkerAffinity() {
    return this._maxLocalWebWorkerAffinity;
  }
  set(extensionId, runningLocation) {
    this._runningLocation.set(extensionId, runningLocation);
  }
  readExtensionKinds(extensionDescription) {
    if (extensionDescription.isUnderDevelopment && this._environmentService.extensionDevelopmentKind) {
      return this._environmentService.extensionDevelopmentKind;
    }
    return this._extensionManifestPropertiesService.getExtensionKind(extensionDescription);
  }
  getRunningLocation(extensionId) {
    return this._runningLocation.get(extensionId) || null;
  }
  filterByRunningLocation(extensions, desiredRunningLocation) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => desiredRunningLocation.equals(extRunningLocation));
  }
  filterByExtensionHostKind(extensions, desiredExtensionHostKind) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => extRunningLocation.kind === desiredExtensionHostKind);
  }
  filterByExtensionHostManager(extensions, extensionHostManager) {
    return filterExtensionDescriptions(extensions, this._runningLocation, (extRunningLocation) => extensionHostManager.representsRunningLocation(extRunningLocation));
  }
  _computeAffinity(inputExtensions, extensionHostKind, isInitialAllocation) {
    const extensions = new ExtensionIdentifierMap();
    for (const extension of inputExtensions) {
      if (extension.main || extension.browser) {
        extensions.set(extension.identifier, extension);
      }
    }
    for (const extension of this._registry.getAllExtensionDescriptions()) {
      if (extension.main || extension.browser) {
        const runningLocation = this._runningLocation.get(extension.identifier);
        if (runningLocation && runningLocation.kind === extensionHostKind) {
          extensions.set(extension.identifier, extension);
        }
      }
    }
    const groups = new ExtensionIdentifierMap();
    let groupNumber = 0;
    for (const [_, extension] of extensions) {
      groups.set(extension.identifier, ++groupNumber);
    }
    const changeGroup = (from, to) => {
      for (const [key3, group2] of groups) {
        if (group2 === from) {
          groups.set(key3, to);
        }
      }
    };
    for (const [_, extension] of extensions) {
      if (!extension.extensionDependencies) {
        continue;
      }
      const myGroup = groups.get(extension.identifier);
      for (const depId of extension.extensionDependencies) {
        const depGroup = groups.get(depId);
        if (!depGroup) {
          continue;
        }
        if (depGroup === myGroup) {
          continue;
        }
        changeGroup(depGroup, myGroup);
      }
    }
    for (const [_, extension] of extensions) {
      if (!extension.extensionAffinity) {
        continue;
      }
      if (!isProposedApiEnabled(extension, "extensionAffinity")) {
        this._logService.warn(`Extension '${extension.identifier.value}' declares 'extensionAffinity' in its package.json but does not enable the 'extensionAffinity' API proposal. Add '"enabledApiProposals": ["extensionAffinity"]' to the extension's package.json to use this feature.`);
        continue;
      }
      const myGroup = groups.get(extension.identifier);
      for (const colocateId of extension.extensionAffinity) {
        const colocateGroup = groups.get(colocateId);
        if (!colocateGroup) {
          continue;
        }
        if (colocateGroup === myGroup) {
          continue;
        }
        changeGroup(colocateGroup, myGroup);
      }
    }
    const resultingAffinities = /* @__PURE__ */ new Map();
    let lastAffinity = 0;
    for (const [_, extension] of extensions) {
      const runningLocation = this._runningLocation.get(extension.identifier);
      if (runningLocation) {
        const group2 = groups.get(extension.identifier);
        resultingAffinities.set(group2, runningLocation.affinity);
        lastAffinity = Math.max(lastAffinity, runningLocation.affinity);
      }
    }
    if (!this._environmentService.isExtensionDevelopment) {
      const configuredAffinities = this._configurationService.getValue("extensions.experimental.affinity") || {};
      const configuredExtensionIds = Object.keys(configuredAffinities);
      const configuredAffinityToResultingAffinity = /* @__PURE__ */ new Map();
      for (const extensionId of configuredExtensionIds) {
        const configuredAffinity = configuredAffinities[extensionId];
        if (typeof configuredAffinity !== "number" || configuredAffinity <= 0 || Math.floor(configuredAffinity) !== configuredAffinity) {
          this._logService.info(`Ignoring configured affinity for '${extensionId}' because the value is not a positive integer.`);
          continue;
        }
        const group2 = groups.get(extensionId);
        if (!group2) {
          continue;
        }
        const affinity1 = resultingAffinities.get(group2);
        if (affinity1) {
          configuredAffinityToResultingAffinity.set(configuredAffinity, affinity1);
          continue;
        }
        const affinity2 = configuredAffinityToResultingAffinity.get(configuredAffinity);
        if (affinity2) {
          resultingAffinities.set(group2, affinity2);
          continue;
        }
        if (!isInitialAllocation) {
          this._logService.info(`Ignoring configured affinity for '${extensionId}' because extension host(s) are already running. Reload window.`);
          continue;
        }
        const affinity3 = ++lastAffinity;
        configuredAffinityToResultingAffinity.set(configuredAffinity, affinity3);
        resultingAffinities.set(group2, affinity3);
      }
    }
    const result = new ExtensionIdentifierMap();
    for (const extension of inputExtensions) {
      const group2 = groups.get(extension.identifier) || 0;
      const affinity = resultingAffinities.get(group2) || 0;
      result.set(extension.identifier, affinity);
    }
    if (lastAffinity > 0 && isInitialAllocation) {
      for (let affinity = 1; affinity <= lastAffinity; affinity++) {
        const extensionIds = [];
        for (const extension of inputExtensions) {
          if (result.get(extension.identifier) === affinity) {
            extensionIds.push(extension.identifier);
          }
        }
        this._logService.info(`Placing extension(s) ${extensionIds.map((e4) => e4.value).join(", ")} on a separate extension host.`);
      }
    }
    return { affinities: result, maxAffinity: lastAffinity };
  }
  computeRunningLocation(localExtensions, remoteExtensions, isInitialAllocation) {
    return this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, isInitialAllocation).runningLocation;
  }
  _doComputeRunningLocation(existingRunningLocation, localExtensions, remoteExtensions, isInitialAllocation) {
    localExtensions = localExtensions.filter((extension) => !existingRunningLocation.has(extension.identifier));
    remoteExtensions = remoteExtensions.filter((extension) => !existingRunningLocation.has(extension.identifier));
    const extensionHostKinds = determineExtensionHostKinds(
      localExtensions,
      remoteExtensions,
      (extension) => this.readExtensionKinds(extension),
      (extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this._extensionHostKindPicker.pickExtensionHostKind(extensionId, extensionKinds, isInstalledLocally, isInstalledRemotely, preference)
    );
    const extensions = new ExtensionIdentifierMap();
    for (const extension of localExtensions) {
      extensions.set(extension.identifier, extension);
    }
    for (const extension of remoteExtensions) {
      extensions.set(extension.identifier, extension);
    }
    const result = new ExtensionIdentifierMap();
    const localProcessExtensions = [];
    const localWebWorkerExtensions = [];
    for (const [extensionIdKey, extensionHostKind] of extensionHostKinds) {
      let runningLocation = null;
      if (extensionHostKind === 1 /* LocalProcess */) {
        const extensionDescription = extensions.get(extensionIdKey);
        if (extensionDescription) {
          localProcessExtensions.push(extensionDescription);
        }
      } else if (extensionHostKind === 2 /* LocalWebWorker */) {
        const extensionDescription = extensions.get(extensionIdKey);
        if (extensionDescription) {
          localWebWorkerExtensions.push(extensionDescription);
        }
      } else if (extensionHostKind === 3 /* Remote */) {
        runningLocation = new RemoteRunningLocation();
      }
      result.set(extensionIdKey, runningLocation);
    }
    const { affinities, maxAffinity } = this._computeAffinity(localProcessExtensions, 1 /* LocalProcess */, isInitialAllocation);
    for (const extension of localProcessExtensions) {
      const affinity = affinities.get(extension.identifier) || 0;
      result.set(extension.identifier, new LocalProcessRunningLocation(affinity));
    }
    const { affinities: localWebWorkerAffinities, maxAffinity: maxLocalWebWorkerAffinity } = this._computeAffinity(localWebWorkerExtensions, 2 /* LocalWebWorker */, isInitialAllocation);
    for (const extension of localWebWorkerExtensions) {
      const affinity = localWebWorkerAffinities.get(extension.identifier) || 0;
      result.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
    }
    for (const [extensionIdKey, runningLocation] of existingRunningLocation) {
      if (runningLocation) {
        result.set(extensionIdKey, runningLocation);
      }
    }
    return { runningLocation: result, maxLocalProcessAffinity: maxAffinity, maxLocalWebWorkerAffinity };
  }
  initializeRunningLocation(localExtensions, remoteExtensions) {
    const { runningLocation, maxLocalProcessAffinity, maxLocalWebWorkerAffinity } = this._doComputeRunningLocation(this._runningLocation, localExtensions, remoteExtensions, true);
    this._runningLocation = runningLocation;
    this._maxLocalProcessAffinity = maxLocalProcessAffinity;
    this._maxLocalWebWorkerAffinity = maxLocalWebWorkerAffinity;
  }
  /**
   * Returns the running locations for the removed extensions.
   */
  deltaExtensions(toAdd, toRemove) {
    const removedRunningLocation = new ExtensionIdentifierMap();
    for (const extensionId of toRemove) {
      const extensionKey = extensionId;
      removedRunningLocation.set(extensionKey, this._runningLocation.get(extensionKey) || null);
      this._runningLocation.delete(extensionKey);
    }
    this._updateRunningLocationForAddedExtensions(toAdd);
    return removedRunningLocation;
  }
  /**
   * Update `this._runningLocation` with running locations for newly enabled/installed extensions.
   */
  _updateRunningLocationForAddedExtensions(toAdd) {
    const localProcessExtensions = [];
    const localWebWorkerExtensions = [];
    for (const extension of toAdd) {
      const extensionKind = this.readExtensionKinds(extension);
      const isRemote = extension.extensionLocation.scheme === Schemas.vscodeRemote;
      const extensionHostKind = this._extensionHostKindPicker.pickExtensionHostKind(extension.identifier, extensionKind, !isRemote, isRemote, 0 /* None */);
      let runningLocation = null;
      if (extensionHostKind === 1 /* LocalProcess */) {
        localProcessExtensions.push(extension);
      } else if (extensionHostKind === 2 /* LocalWebWorker */) {
        localWebWorkerExtensions.push(extension);
      } else if (extensionHostKind === 3 /* Remote */) {
        runningLocation = new RemoteRunningLocation();
      }
      this._runningLocation.set(extension.identifier, runningLocation);
    }
    const { affinities } = this._computeAffinity(localProcessExtensions, 1 /* LocalProcess */, false);
    for (const extension of localProcessExtensions) {
      const affinity = affinities.get(extension.identifier) || 0;
      this._runningLocation.set(extension.identifier, new LocalProcessRunningLocation(affinity));
    }
    const { affinities: webWorkerExtensionsAffinities } = this._computeAffinity(localWebWorkerExtensions, 2 /* LocalWebWorker */, false);
    for (const extension of localWebWorkerExtensions) {
      const affinity = webWorkerExtensionsAffinities.get(extension.identifier) || 0;
      this._runningLocation.set(extension.identifier, new LocalWebWorkerRunningLocation(affinity));
    }
  }
};

ExtensionRunningLocationTracker = __decorateClass([
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IExtensionManifestPropertiesService)
], ExtensionRunningLocationTracker);

function filterExtensionDescriptions(extensions, runningLocation, predicate) {
  return extensions.filter((ext) => {
    const extRunningLocation = runningLocation.get(ext.identifier);
    return extRunningLocation && predicate(extRunningLocation);
  });
}

function filterExtensionIdentifiers(extensions, runningLocation, predicate) {
  return extensions.filter((ext) => {
    const extRunningLocation = runningLocation.get(ext);
    return extRunningLocation && predicate(extRunningLocation);
  });
}
export { filterExtensionDescriptions, filterExtensionIdentifiers, ExtensionRunningLocationTracker };
