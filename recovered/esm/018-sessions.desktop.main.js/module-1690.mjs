// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/globalStateMerge.ts
import { deepClone, equals4 } from "./module-0098.mjs";
import { SYNC_SERVICE_URL_TYPE } from "./module-1639.mjs";


// src/vs/platform/userDataSync/common/globalStateMerge.ts
function merge(localStorage2, remoteStorage, baseStorage, storageKeys2, logService) {
  if (!remoteStorage) {
    return { remote: { added: Object.keys(localStorage2), removed: [], updated: [], all: Object.keys(localStorage2).length > 0 ? localStorage2 : null }, local: { added: {}, removed: [], updated: {} } };
  }
  const localToRemote = compare3(localStorage2, remoteStorage);
  if (localToRemote.added.size === 0 && localToRemote.removed.size === 0 && localToRemote.updated.size === 0) {
    return { remote: { added: [], removed: [], updated: [], all: null }, local: { added: {}, removed: [], updated: {} } };
  }
  const baseToRemote = baseStorage ? compare3(baseStorage, remoteStorage) : { added: Object.keys(remoteStorage).reduce((r2, k) => {
    r2.add(k);
    return r2;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  const baseToLocal = baseStorage ? compare3(baseStorage, localStorage2) : { added: Object.keys(localStorage2).reduce((r2, k) => {
    r2.add(k);
    return r2;
  }, /* @__PURE__ */ new Set()), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
  const local = { added: {}, removed: [], updated: {} };
  const remote = deepClone(remoteStorage);
  const isFirstTimeSync = !baseStorage;
  for (const key3 of baseToLocal.added.values()) {
    if (key3 !== SYNC_SERVICE_URL_TYPE && isFirstTimeSync && baseToRemote.added.has(key3)) {
      continue;
    }
    remote[key3] = localStorage2[key3];
  }
  for (const key3 of baseToLocal.updated.values()) {
    remote[key3] = localStorage2[key3];
  }
  for (const key3 of baseToLocal.removed.values()) {
    if (storageKeys2.unregistered.includes(key3)) {
      continue;
    }
    delete remote[key3];
  }
  for (const key3 of baseToRemote.added.values()) {
    const remoteValue = remoteStorage[key3];
    if (storageKeys2.machine.includes(key3)) {
      logService.info(`GlobalState: Skipped adding ${key3} in local storage because it is declared as machine scoped.`);
      continue;
    }
    if (baseStorage && baseToLocal.added.has(key3)) {
      continue;
    }
    const localValue = localStorage2[key3];
    if (localValue && localValue.value === remoteValue.value) {
      continue;
    }
    if (key3 === SYNC_SERVICE_URL_TYPE && isFirstTimeSync && baseToLocal.added.has(key3)) {
      continue;
    }
    if (localValue) {
      local.updated[key3] = remoteValue;
    } else {
      local.added[key3] = remoteValue;
    }
  }
  for (const key3 of baseToRemote.updated.values()) {
    const remoteValue = remoteStorage[key3];
    if (storageKeys2.machine.includes(key3)) {
      logService.info(`GlobalState: Skipped updating ${key3} in local storage because it is declared as machine scoped.`);
      continue;
    }
    if (baseToLocal.updated.has(key3) || baseToLocal.removed.has(key3)) {
      continue;
    }
    const localValue = localStorage2[key3];
    if (localValue && localValue.value === remoteValue.value) {
      continue;
    }
    local.updated[key3] = remoteValue;
  }
  for (const key3 of baseToRemote.removed.values()) {
    if (storageKeys2.machine.includes(key3)) {
      logService.trace(`GlobalState: Skipped removing ${key3} in local storage because it is declared as machine scoped.`);
      continue;
    }
    if (baseToLocal.updated.has(key3) || baseToLocal.removed.has(key3)) {
      continue;
    }
    local.removed.push(key3);
  }
  const result = compare3(remoteStorage, remote);
  return { local, remote: { added: [...result.added], updated: [...result.updated], removed: [...result.removed], all: result.added.size === 0 && result.removed.size === 0 && result.updated.size === 0 ? null : remote } };
}

function compare3(from, to) {
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
export { merge, compare3 };
