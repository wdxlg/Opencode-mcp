// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/extensionsMerge.ts
import { deepClone, equals2 } from "./module-0074.mjs";
import { gt } from "./module-0098.mjs";
import { assertReturnsDefined } from "./module-0006.mjs";


// src/vs/platform/userDataSync/common/extensionsMerge.ts
function merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
  const added = [];
  const removed = [];
  const updated = [];
  if (!remoteExtensions) {
    const remote2 = localExtensions.filter(({ identifier }) => ignoredExtensions.every((id2) => id2.toLowerCase() !== identifier.id.toLowerCase()));
    return {
      local: {
        added,
        removed,
        updated
      },
      remote: remote2.length > 0 ? {
        added: remote2,
        updated: [],
        removed: [],
        all: remote2
      } : null
    };
  }
  localExtensions = localExtensions.map(massageIncomingExtension);
  remoteExtensions = remoteExtensions.map(massageIncomingExtension);
  lastSyncExtensions = lastSyncExtensions ? lastSyncExtensions.map(massageIncomingExtension) : null;
  const uuids = /* @__PURE__ */ new Map();
  const addUUID = (identifier) => {
    if (identifier.uuid) {
      uuids.set(identifier.id.toLowerCase(), identifier.uuid);
    }
  };
  localExtensions.forEach(({ identifier }) => addUUID(identifier));
  remoteExtensions.forEach(({ identifier }) => addUUID(identifier));
  lastSyncExtensions?.forEach(({ identifier }) => addUUID(identifier));
  skippedExtensions?.forEach(({ identifier }) => addUUID(identifier));
  lastSyncBuiltinExtensions?.forEach((identifier) => addUUID(identifier));
  const getKey = (extension) => {
    const uuid = extension.identifier.uuid || uuids.get(extension.identifier.id.toLowerCase());
    return uuid ? `uuid:${uuid}` : `id:${extension.identifier.id.toLowerCase()}`;
  };
  const addExtensionToMap = (map, extension) => {
    map.set(getKey(extension), extension);
    return map;
  };
  const localExtensionsMap = localExtensions.reduce(addExtensionToMap, /* @__PURE__ */ new Map());
  const remoteExtensionsMap = remoteExtensions.reduce(addExtensionToMap, /* @__PURE__ */ new Map());
  const newRemoteExtensionsMap = remoteExtensions.reduce((map, extension) => addExtensionToMap(map, deepClone(extension)), /* @__PURE__ */ new Map());
  const lastSyncExtensionsMap = lastSyncExtensions ? lastSyncExtensions.reduce(addExtensionToMap, /* @__PURE__ */ new Map()) : null;
  const skippedExtensionsMap = skippedExtensions.reduce(addExtensionToMap, /* @__PURE__ */ new Map());
  const ignoredExtensionsSet = ignoredExtensions.reduce((set, id2) => {
    const uuid = uuids.get(id2.toLowerCase());
    return set.add(uuid ? `uuid:${uuid}` : `id:${id2.toLowerCase()}`);
  }, /* @__PURE__ */ new Set());
  const lastSyncBuiltinExtensionsSet = lastSyncBuiltinExtensions ? lastSyncBuiltinExtensions.reduce((set, { id: id2, uuid }) => {
    uuid = uuid ?? uuids.get(id2.toLowerCase());
    return set.add(uuid ? `uuid:${uuid}` : `id:${id2.toLowerCase()}`);
  }, /* @__PURE__ */ new Set()) : null;
  const localToRemote = compare4(localExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, false);
  if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
    const baseToLocal = compare4(lastSyncExtensionsMap, localExtensionsMap, ignoredExtensionsSet, false);
    const baseToRemote = compare4(lastSyncExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, true);
    const merge8 = (key, localExtension, remoteExtension, preferred) => {
      let pinned, version, preRelease;
      if (localExtension.installed) {
        pinned = preferred.pinned;
        preRelease = preferred.preRelease;
        if (pinned) {
          version = preferred.version;
        }
      } else {
        pinned = remoteExtension.pinned;
        preRelease = remoteExtension.preRelease;
        if (pinned) {
          version = remoteExtension.version;
        }
      }
      if (pinned === void 0) {
        pinned = localExtension.pinned;
        if (pinned) {
          version = localExtension.version;
        }
      }
      if (preRelease === void 0) {
        preRelease = localExtension.preRelease;
      }
      return {
        ...preferred,
        installed: localExtension.installed || remoteExtension.installed,
        pinned,
        preRelease,
        version: version ?? (remoteExtension.version && (!localExtension.installed || gt(remoteExtension.version, localExtension.version)) ? remoteExtension.version : localExtension.version),
        state: mergeExtensionState(localExtension, remoteExtension, lastSyncExtensionsMap?.get(key))
      };
    };
    for (const key of baseToRemote.removed.values()) {
      const localExtension = localExtensionsMap.get(key);
      if (!localExtension) {
        continue;
      }
      const baseExtension = assertReturnsDefined(lastSyncExtensionsMap?.get(key));
      const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
      if (localExtension.installed && wasAnInstalledExtensionDuringLastSync) {
        removed.push(localExtension.identifier);
      } else {
        newRemoteExtensionsMap.set(key, localExtension);
      }
    }
    for (const key of baseToRemote.added.values()) {
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key));
      const localExtension = localExtensionsMap.get(key);
      if (localExtension) {
        if (localToRemote.updated.has(key)) {
          const mergedExtension = merge8(key, localExtension, remoteExtension, remoteExtension);
          if (!areSame(localExtension, remoteExtension, false, false)) {
            updated.push(massageOutgoingExtension(mergedExtension, key));
          }
          newRemoteExtensionsMap.set(key, mergedExtension);
        }
      } else {
        if (remoteExtension.installed) {
          added.push(massageOutgoingExtension(remoteExtension, key));
        }
      }
    }
    for (const key of baseToRemote.updated.values()) {
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key));
      const baseExtension = assertReturnsDefined(lastSyncExtensionsMap?.get(key));
      const localExtension = localExtensionsMap.get(key);
      if (localExtension) {
        const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key) && baseExtension.installed;
        if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
          removed.push(localExtension.identifier);
        } else {
          const mergedExtension = merge8(key, localExtension, remoteExtension, remoteExtension);
          updated.push(massageOutgoingExtension(mergedExtension, key));
          newRemoteExtensionsMap.set(key, mergedExtension);
        }
      } else if (remoteExtension.installed) {
        added.push(massageOutgoingExtension(remoteExtension, key));
      }
    }
    for (const key of baseToLocal.added.values()) {
      if (baseToRemote.added.has(key)) {
        continue;
      }
      newRemoteExtensionsMap.set(key, assertReturnsDefined(localExtensionsMap.get(key)));
    }
    for (const key of baseToLocal.updated.values()) {
      if (baseToRemote.removed.has(key)) {
        continue;
      }
      if (baseToRemote.updated.has(key)) {
        continue;
      }
      const localExtension = assertReturnsDefined(localExtensionsMap.get(key));
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key));
      newRemoteExtensionsMap.set(key, merge8(key, localExtension, remoteExtension, localExtension));
    }
    for (const key of baseToLocal.removed.values()) {
      if (baseToRemote.updated.has(key)) {
        continue;
      }
      if (baseToRemote.removed.has(key)) {
        continue;
      }
      if (skippedExtensionsMap.has(key)) {
        continue;
      }
      if (!assertReturnsDefined(remoteExtensionsMap.get(key)).installed) {
        continue;
      }
      if (!lastSyncBuiltinExtensionsSet) {
        continue;
      }
      if (lastSyncBuiltinExtensionsSet.has(key) || !assertReturnsDefined(lastSyncExtensionsMap?.get(key)).installed) {
        continue;
      }
      newRemoteExtensionsMap.delete(key);
    }
  }
  const remote = [];
  const remoteChanges = compare4(remoteExtensionsMap, newRemoteExtensionsMap, /* @__PURE__ */ new Set(), true);
  const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
  if (hasRemoteChanges) {
    newRemoteExtensionsMap.forEach((value, key) => remote.push(massageOutgoingExtension(value, key)));
  }
  return {
    local: { added, removed, updated },
    remote: hasRemoteChanges ? {
      added: [...remoteChanges.added].map((id2) => newRemoteExtensionsMap.get(id2)),
      updated: [...remoteChanges.updated].map((id2) => newRemoteExtensionsMap.get(id2)),
      removed: [...remoteChanges.removed].map((id2) => remoteExtensionsMap.get(id2)),
      all: remote
    } : null
  };
}

function compare4(from, to, ignoredExtensions, checkVersionProperty) {
  const fromKeys = from ? [...from.keys()].filter((key) => !ignoredExtensions.has(key)) : [];
  const toKeys = [...to.keys()].filter((key) => !ignoredExtensions.has(key));
  const added = toKeys.filter((key) => !fromKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key) => !toKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key of fromKeys) {
    if (removed.has(key)) {
      continue;
    }
    const fromExtension = from.get(key);
    const toExtension2 = to.get(key);
    if (!toExtension2 || !areSame(fromExtension, toExtension2, checkVersionProperty, true)) {
      updated.add(key);
    }
  }
  return { added, removed, updated };
}

function areSame(fromExtension, toExtension2, checkVersionProperty, checkInstalledProperty) {
  if (fromExtension.disabled !== toExtension2.disabled) {
    return false;
  }
  if (!!fromExtension.isApplicationScoped !== !!toExtension2.isApplicationScoped) {
    return false;
  }
  if (checkInstalledProperty && fromExtension.installed !== toExtension2.installed) {
    return false;
  }
  if (fromExtension.installed && toExtension2.installed) {
    if (fromExtension.preRelease !== toExtension2.preRelease) {
      return false;
    }
    if (fromExtension.pinned !== toExtension2.pinned) {
      return false;
    }
    if (toExtension2.pinned && fromExtension.version !== toExtension2.version) {
      return false;
    }
  }
  if (!isSameExtensionState(fromExtension.state, toExtension2.state)) {
    return false;
  }
  if (checkVersionProperty && fromExtension.version !== toExtension2.version) {
    return false;
  }
  return true;
}

function mergeExtensionState(localExtension, remoteExtension, lastSyncExtension) {
  const localState = localExtension.state;
  const remoteState = remoteExtension.state;
  const baseState = lastSyncExtension?.state;
  if (!remoteExtension.version) {
    return localState;
  }
  if (localState && gt(localExtension.version, remoteExtension.version)) {
    return localState;
  }
  if (remoteState && gt(remoteExtension.version, localExtension.version)) {
    return remoteState;
  }
  if (!localState) {
    return remoteState;
  }
  if (!remoteState) {
    return localState;
  }
  const mergedState = deepClone(localState);
  const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : { added: Object.keys(remoteState).reduce((r, k) => {
    r.add(k);
    return r;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  const baseToLocal = baseState ? compareExtensionState(baseState, localState) : { added: Object.keys(localState).reduce((r, k) => {
    r.add(k);
    return r;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  for (const key of [...baseToRemote.added.values(), ...baseToRemote.updated.values()]) {
    mergedState[key] = remoteState[key];
  }
  for (const key of baseToRemote.removed.values()) {
    if (!baseToLocal.updated.has(key)) {
      delete mergedState[key];
    }
  }
  return mergedState;
}

function compareExtensionState(from, to) {
  const fromKeys = Object.keys(from);
  const toKeys = Object.keys(to);
  const added = toKeys.filter((key) => !fromKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key) => !toKeys.includes(key)).reduce((r, key) => {
    r.add(key);
    return r;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key of fromKeys) {
    if (removed.has(key)) {
      continue;
    }
    const value1 = from[key];
    const value2 = to[key];
    if (!equals2(value1, value2)) {
      updated.add(key);
    }
  }
  return { added, removed, updated };
}

function isSameExtensionState(a = {}, b = {}) {
  const { added, removed, updated } = compareExtensionState(a, b);
  return added.size === 0 && removed.size === 0 && updated.size === 0;
}

function massageIncomingExtension(extension) {
  return { ...extension, ...{ disabled: !!extension.disabled, installed: !!extension.installed } };
}

function massageOutgoingExtension(extension, key) {
  const massagedExtension = {
    ...extension,
    identifier: {
      id: extension.identifier.id,
      uuid: key.startsWith("uuid:") ? key.substring("uuid:".length) : void 0
    },
    /* set following always so that to differentiate with older clients */
    preRelease: !!extension.preRelease,
    pinned: !!extension.pinned
  };
  if (!extension.disabled) {
    delete massagedExtension.disabled;
  }
  if (!extension.installed) {
    delete massagedExtension.installed;
  }
  if (!extension.state) {
    delete massagedExtension.state;
  }
  if (!extension.isApplicationScoped) {
    delete massagedExtension.isApplicationScoped;
  }
  return massagedExtension;
}
export { merge, compare4, areSame, mergeExtensionState, compareExtensionState, isSameExtensionState, massageIncomingExtension, massageOutgoingExtension };
