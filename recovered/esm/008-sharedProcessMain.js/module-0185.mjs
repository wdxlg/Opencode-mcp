// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataProfilesManifestMerge.ts
import { equals2 } from "./module-0074.mjs";


// src/vs/platform/userDataSync/common/userDataProfilesManifestMerge.ts
function merge7(local, remote, lastSync, ignored) {
  const localResult = { added: [], removed: [], updated: [] };
  let remoteResult = { added: [], removed: [], updated: [] };
  if (!remote) {
    const added = local.filter(({ id: id2 }) => !ignored.includes(id2));
    if (added.length) {
      remoteResult.added = added;
    } else {
      remoteResult = null;
    }
    return {
      local: localResult,
      remote: remoteResult
    };
  }
  const localToRemote = compare9(local, remote, ignored);
  if (localToRemote.added.length > 0 || localToRemote.removed.length > 0 || localToRemote.updated.length > 0) {
    const baseToLocal = compare9(lastSync, local, ignored);
    const baseToRemote = compare9(lastSync, remote, ignored);
    for (const id2 of baseToRemote.removed) {
      const e = local.find((profile) => profile.id === id2);
      if (e) {
        localResult.removed.push(e);
      }
    }
    for (const id2 of baseToRemote.added) {
      const remoteProfile = remote.find((profile) => profile.id === id2);
      if (baseToLocal.added.includes(id2)) {
        if (localToRemote.updated.includes(id2)) {
          localResult.updated.push(remoteProfile);
        }
      } else {
        localResult.added.push(remoteProfile);
      }
    }
    for (const id2 of baseToRemote.updated) {
      localResult.updated.push(remote.find((profile) => profile.id === id2));
    }
    for (const id2 of baseToLocal.added) {
      if (!baseToRemote.added.includes(id2)) {
        remoteResult.added.push(local.find((profile) => profile.id === id2));
      }
    }
    for (const id2 of baseToLocal.updated) {
      if (baseToRemote.removed.includes(id2)) {
        continue;
      }
      if (!baseToRemote.updated.includes(id2)) {
        remoteResult.updated.push(local.find((profile) => profile.id === id2));
      }
    }
    for (const id2 of baseToLocal.removed) {
      const removedProfile = remote.find((profile) => profile.id === id2);
      if (removedProfile) {
        remoteResult.removed.push(removedProfile);
      }
    }
  }
  if (remoteResult.added.length === 0 && remoteResult.removed.length === 0 && remoteResult.updated.length === 0) {
    remoteResult = null;
  }
  return { local: localResult, remote: remoteResult };
}

function compare9(from, to, ignoredProfiles) {
  from = from ? from.filter(({ id: id2 }) => !ignoredProfiles.includes(id2)) : [];
  to = to.filter(({ id: id2 }) => !ignoredProfiles.includes(id2));
  const fromKeys = from.map(({ id: id2 }) => id2);
  const toKeys = to.map(({ id: id2 }) => id2);
  const added = toKeys.filter((key) => !fromKeys.includes(key));
  const removed = fromKeys.filter((key) => !toKeys.includes(key));
  const updated = [];
  for (const { id: id2, name, icon, useDefaultFlags } of from) {
    if (removed.includes(id2)) {
      continue;
    }
    const toProfile = to.find((p) => p.id === id2);
    if (!toProfile || toProfile.name !== name || toProfile.icon !== icon || !equals2(toProfile.useDefaultFlags, useDefaultFlags)) {
      updated.push(id2);
    }
  }
  return { added, removed, updated };
}
export { merge7, compare9 };
