// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/snippetsMerge.ts



// src/vs/platform/userDataSync/common/snippetsMerge.ts
function merge6(local, remote, base) {
  const localAdded = {};
  const localUpdated = {};
  const localRemoved = /* @__PURE__ */ new Set();
  if (!remote) {
    return {
      local: { added: localAdded, updated: localUpdated, removed: [...localRemoved.values()] },
      remote: { added: local, updated: {}, removed: [] },
      conflicts: []
    };
  }
  const localToRemote = compare8(local, remote);
  if (localToRemote.added.size === 0 && localToRemote.removed.size === 0 && localToRemote.updated.size === 0) {
    return {
      local: { added: localAdded, updated: localUpdated, removed: [...localRemoved.values()] },
      remote: { added: {}, updated: {}, removed: [] },
      conflicts: []
    };
  }
  const baseToLocal = compare8(base, local);
  const baseToRemote = compare8(base, remote);
  const remoteAdded = {};
  const remoteUpdated = {};
  const remoteRemoved = /* @__PURE__ */ new Set();
  const conflicts = /* @__PURE__ */ new Set();
  for (const key of baseToLocal.removed.values()) {
    if (baseToRemote.updated.has(key)) {
      localAdded[key] = remote[key];
    } else {
      remoteRemoved.add(key);
    }
  }
  for (const key of baseToRemote.removed.values()) {
    if (conflicts.has(key)) {
      continue;
    }
    if (baseToLocal.updated.has(key)) {
      conflicts.add(key);
    } else {
      localRemoved.add(key);
    }
  }
  for (const key of baseToLocal.updated.values()) {
    if (conflicts.has(key)) {
      continue;
    }
    if (baseToRemote.updated.has(key)) {
      if (localToRemote.updated.has(key)) {
        conflicts.add(key);
      }
    } else {
      remoteUpdated[key] = local[key];
    }
  }
  for (const key of baseToRemote.updated.values()) {
    if (conflicts.has(key)) {
      continue;
    }
    if (baseToLocal.updated.has(key)) {
      if (localToRemote.updated.has(key)) {
        conflicts.add(key);
      }
    } else if (local[key] !== void 0) {
      localUpdated[key] = remote[key];
    }
  }
  for (const key of baseToLocal.added.values()) {
    if (conflicts.has(key)) {
      continue;
    }
    if (baseToRemote.added.has(key)) {
      if (localToRemote.updated.has(key)) {
        conflicts.add(key);
      }
    } else {
      remoteAdded[key] = local[key];
    }
  }
  for (const key of baseToRemote.added.values()) {
    if (conflicts.has(key)) {
      continue;
    }
    if (baseToLocal.added.has(key)) {
      if (localToRemote.updated.has(key)) {
        conflicts.add(key);
      }
    } else {
      localAdded[key] = remote[key];
    }
  }
  return {
    local: { added: localAdded, removed: [...localRemoved.values()], updated: localUpdated },
    remote: { added: remoteAdded, removed: [...remoteRemoved.values()], updated: remoteUpdated },
    conflicts: [...conflicts.values()]
  };
}

function compare8(from, to) {
  const fromKeys = from ? Object.keys(from) : [];
  const toKeys = to ? Object.keys(to) : [];
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
    const fromSnippet = from[key];
    const toSnippet = to[key];
    if (fromSnippet !== toSnippet) {
      updated.add(key);
    }
  }
  return { added, removed, updated };
}

function areSame4(a, b) {
  const { added, removed, updated } = compare8(a, b);
  return added.size === 0 && removed.size === 0 && updated.size === 0;
}
export { merge6, compare8, areSame4 };
