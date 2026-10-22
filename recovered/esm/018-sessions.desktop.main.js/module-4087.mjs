// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/extensionsMerge.ts
import { deepClone, equals4 } from "./module-0098.mjs";
import { gt } from "./module-1045.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";


// src/vs/platform/userDataSync/common/extensionsMerge.ts
function merge2(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, lastSyncBuiltinExtensions) {
  const added = [];
  const removed = [];
  const updated = [];
  if (!remoteExtensions) {
    const remote2 = localExtensions.filter(({ identifier: identifier2 }) => ignoredExtensions.every((id2) => id2.toLowerCase() !== identifier2.id.toLowerCase()));
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
  const addUUID = (identifier2) => {
    if (identifier2.uuid) {
      uuids.set(identifier2.id.toLowerCase(), identifier2.uuid);
    }
  };
  localExtensions.forEach(({ identifier: identifier2 }) => addUUID(identifier2));
  remoteExtensions.forEach(({ identifier: identifier2 }) => addUUID(identifier2));
  lastSyncExtensions?.forEach(({ identifier: identifier2 }) => addUUID(identifier2));
  skippedExtensions?.forEach(({ identifier: identifier2 }) => addUUID(identifier2));
  lastSyncBuiltinExtensions?.forEach((identifier2) => addUUID(identifier2));
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
  const localToRemote = compare5(localExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, false);
  if (localToRemote.added.size > 0 || localToRemote.removed.size > 0 || localToRemote.updated.size > 0) {
    const baseToLocal = compare5(lastSyncExtensionsMap, localExtensionsMap, ignoredExtensionsSet, false);
    const baseToRemote = compare5(lastSyncExtensionsMap, remoteExtensionsMap, ignoredExtensionsSet, true);
    const merge3 = (key3, localExtension, remoteExtension, preferred) => {
      let pinned, version2, preRelease;
      if (localExtension.installed) {
        pinned = preferred.pinned;
        preRelease = preferred.preRelease;
        if (pinned) {
          version2 = preferred.version;
        }
      } else {
        pinned = remoteExtension.pinned;
        preRelease = remoteExtension.preRelease;
        if (pinned) {
          version2 = remoteExtension.version;
        }
      }
      if (pinned === void 0) {
        pinned = localExtension.pinned;
        if (pinned) {
          version2 = localExtension.version;
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
        version: version2 ?? (remoteExtension.version && (!localExtension.installed || gt(remoteExtension.version, localExtension.version)) ? remoteExtension.version : localExtension.version),
        state: mergeExtensionState(localExtension, remoteExtension, lastSyncExtensionsMap?.get(key3))
      };
    };
    for (const key3 of baseToRemote.removed.values()) {
      const localExtension = localExtensionsMap.get(key3);
      if (!localExtension) {
        continue;
      }
      const baseExtension = assertReturnsDefined(lastSyncExtensionsMap?.get(key3));
      const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key3) && baseExtension.installed;
      if (localExtension.installed && wasAnInstalledExtensionDuringLastSync) {
        removed.push(localExtension.identifier);
      } else {
        newRemoteExtensionsMap.set(key3, localExtension);
      }
    }
    for (const key3 of baseToRemote.added.values()) {
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key3));
      const localExtension = localExtensionsMap.get(key3);
      if (localExtension) {
        if (localToRemote.updated.has(key3)) {
          const mergedExtension = merge3(key3, localExtension, remoteExtension, remoteExtension);
          if (!areSame(localExtension, remoteExtension, false, false)) {
            updated.push(massageOutgoingExtension(mergedExtension, key3));
          }
          newRemoteExtensionsMap.set(key3, mergedExtension);
        }
      } else {
        if (remoteExtension.installed) {
          added.push(massageOutgoingExtension(remoteExtension, key3));
        }
      }
    }
    for (const key3 of baseToRemote.updated.values()) {
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key3));
      const baseExtension = assertReturnsDefined(lastSyncExtensionsMap?.get(key3));
      const localExtension = localExtensionsMap.get(key3);
      if (localExtension) {
        const wasAnInstalledExtensionDuringLastSync = lastSyncBuiltinExtensionsSet && !lastSyncBuiltinExtensionsSet.has(key3) && baseExtension.installed;
        if (wasAnInstalledExtensionDuringLastSync && localExtension.installed && !remoteExtension.installed) {
          removed.push(localExtension.identifier);
        } else {
          const mergedExtension = merge3(key3, localExtension, remoteExtension, remoteExtension);
          updated.push(massageOutgoingExtension(mergedExtension, key3));
          newRemoteExtensionsMap.set(key3, mergedExtension);
        }
      } else if (remoteExtension.installed) {
        added.push(massageOutgoingExtension(remoteExtension, key3));
      }
    }
    for (const key3 of baseToLocal.added.values()) {
      if (baseToRemote.added.has(key3)) {
        continue;
      }
      newRemoteExtensionsMap.set(key3, assertReturnsDefined(localExtensionsMap.get(key3)));
    }
    for (const key3 of baseToLocal.updated.values()) {
      if (baseToRemote.removed.has(key3)) {
        continue;
      }
      if (baseToRemote.updated.has(key3)) {
        continue;
      }
      const localExtension = assertReturnsDefined(localExtensionsMap.get(key3));
      const remoteExtension = assertReturnsDefined(remoteExtensionsMap.get(key3));
      newRemoteExtensionsMap.set(key3, merge3(key3, localExtension, remoteExtension, localExtension));
    }
    for (const key3 of baseToLocal.removed.values()) {
      if (baseToRemote.updated.has(key3)) {
        continue;
      }
      if (baseToRemote.removed.has(key3)) {
        continue;
      }
      if (skippedExtensionsMap.has(key3)) {
        continue;
      }
      if (!assertReturnsDefined(remoteExtensionsMap.get(key3)).installed) {
        continue;
      }
      if (!lastSyncBuiltinExtensionsSet) {
        continue;
      }
      if (lastSyncBuiltinExtensionsSet.has(key3) || !assertReturnsDefined(lastSyncExtensionsMap?.get(key3)).installed) {
        continue;
      }
      newRemoteExtensionsMap.delete(key3);
    }
  }
  const remote = [];
  const remoteChanges = compare5(remoteExtensionsMap, newRemoteExtensionsMap, /* @__PURE__ */ new Set(), true);
  const hasRemoteChanges = remoteChanges.added.size > 0 || remoteChanges.updated.size > 0 || remoteChanges.removed.size > 0;
  if (hasRemoteChanges) {
    newRemoteExtensionsMap.forEach((value2, key3) => remote.push(massageOutgoingExtension(value2, key3)));
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

function compare5(from, to, ignoredExtensions, checkVersionProperty) {
  const fromKeys = from ? [...from.keys()].filter((key3) => !ignoredExtensions.has(key3)) : [];
  const toKeys = [...to.keys()].filter((key3) => !ignoredExtensions.has(key3));
  const added = toKeys.filter((key3) => !fromKeys.includes(key3)).reduce((r2, key3) => {
    r2.add(key3);
    return r2;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key3) => !toKeys.includes(key3)).reduce((r2, key3) => {
    r2.add(key3);
    return r2;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key3 of fromKeys) {
    if (removed.has(key3)) {
      continue;
    }
    const fromExtension = from.get(key3);
    const toExtension3 = to.get(key3);
    if (!toExtension3 || !areSame(fromExtension, toExtension3, checkVersionProperty, true)) {
      updated.add(key3);
    }
  }
  return { added, removed, updated };
}

function areSame(fromExtension, toExtension3, checkVersionProperty, checkInstalledProperty) {
  if (fromExtension.disabled !== toExtension3.disabled) {
    return false;
  }
  if (!!fromExtension.isApplicationScoped !== !!toExtension3.isApplicationScoped) {
    return false;
  }
  if (checkInstalledProperty && fromExtension.installed !== toExtension3.installed) {
    return false;
  }
  if (fromExtension.installed && toExtension3.installed) {
    if (fromExtension.preRelease !== toExtension3.preRelease) {
      return false;
    }
    if (fromExtension.pinned !== toExtension3.pinned) {
      return false;
    }
    if (toExtension3.pinned && fromExtension.version !== toExtension3.version) {
      return false;
    }
  }
  if (!isSameExtensionState(fromExtension.state, toExtension3.state)) {
    return false;
  }
  if (checkVersionProperty && fromExtension.version !== toExtension3.version) {
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
  const baseToRemote = baseState ? compareExtensionState(baseState, remoteState) : { added: Object.keys(remoteState).reduce((r2, k) => {
    r2.add(k);
    return r2;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  const baseToLocal = baseState ? compareExtensionState(baseState, localState) : { added: Object.keys(localState).reduce((r2, k) => {
    r2.add(k);
    return r2;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  for (const key3 of [...baseToRemote.added.values(), ...baseToRemote.updated.values()]) {
    mergedState[key3] = remoteState[key3];
  }
  for (const key3 of baseToRemote.removed.values()) {
    if (!baseToLocal.updated.has(key3)) {
      delete mergedState[key3];
    }
  }
  return mergedState;
}

function compareExtensionState(from, to) {
  const fromKeys = Object.keys(from);
  const toKeys = Object.keys(to);
  const added = toKeys.filter((key3) => !fromKeys.includes(key3)).reduce((r2, key3) => {
    r2.add(key3);
    return r2;
  }, /* @__PURE__ */ new Set());
  const removed = fromKeys.filter((key3) => !toKeys.includes(key3)).reduce((r2, key3) => {
    r2.add(key3);
    return r2;
  }, /* @__PURE__ */ new Set());
  const updated = /* @__PURE__ */ new Set();
  for (const key3 of fromKeys) {
    if (removed.has(key3)) {
      continue;
    }
    const value1 = from[key3];
    const value2 = to[key3];
    if (!equals4(value1, value2)) {
      updated.add(key3);
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

function massageOutgoingExtension(extension, key3) {
  const massagedExtension = {
    ...extension,
    identifier: {
      id: extension.identifier.id,
      uuid: key3.startsWith("uuid:") ? key3.substring("uuid:".length) : void 0
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
export { merge2, compare5, areSame, mergeExtensionState, compareExtensionState, isSameExtensionState, massageIncomingExtension, massageOutgoingExtension };
