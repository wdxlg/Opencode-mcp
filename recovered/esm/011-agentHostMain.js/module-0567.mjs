// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/sessionDiffAggregator.ts
import { URI } from "./module-0023.mjs";
import { buildSessionDbUri } from "./module-0261.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0025.mjs";


// src/vs/platform/agentHost/node/sessionDiffAggregator.ts
function getFileEditUri(diff) {
  return diff.after?.uri ?? diff.before?.uri;
}

function createSessionFileDiff(beforeSessionUri, afterSessionUri, identity2, added, removed) {
  const hasBefore = identity2.firstKind !== "create" /* Create */;
  const hasAfter = identity2.lastKind !== "delete" /* Delete */;
  return {
    ...hasBefore ? {
      before: {
        uri: URI.file(identity2.firstFilePath).toString(),
        content: { uri: buildSessionDbUri(beforeSessionUri, identity2.firstToolCallId, identity2.firstFilePath, "before") }
      }
    } : {},
    ...hasAfter ? {
      after: {
        uri: URI.file(identity2.terminalPath).toString(),
        content: { uri: buildSessionDbUri(afterSessionUri, identity2.lastToolCallId, identity2.lastFilePath, "after") }
      }
    } : {},
    diff: { added, removed }
  };
}

async function computeSessionDiffs(sessionUri, db, diffService, incremental, folderScope) {
  if (incremental && folderScope) {
    throw new Error("computeSessionDiffs: `folderScope` is not supported in incremental mode; call full-recompute mode (omit `incremental`) when a folder scope is required.");
  }
  if (!incremental) {
    return computeUnionedDiffs([{ sessionUri, db }], diffService, folderScope);
  }
  let edits;
  let fastPath = false;
  const turnEdits = await db.getFileEditsByTurn(incremental.changedTurnId);
  if (turnEdits.length === 0) {
    return [...incremental.previousDiffs];
  }
  const previousDiffsUris = new Set(incremental.previousDiffs.map(getFileEditUri));
  const needsFullHistory = turnEdits.some(
    (e) => e.kind === "rename" /* Rename */ || previousDiffsUris.has(URI.file(e.filePath).toString())
  );
  if (needsFullHistory) {
    edits = await db.getAllFileEdits();
  } else {
    edits = turnEdits;
    fastPath = true;
  }
  if (edits.length === 0) {
    return [];
  }
  const pathToIdentityKey = /* @__PURE__ */ new Map();
  const identities = /* @__PURE__ */ new Map();
  const touchedIdentityKeys = !fastPath ? /* @__PURE__ */ new Set() : void 0;
  for (const edit of edits) {
    let identityKey;
    if (edit.kind === "rename" /* Rename */ && edit.originalPath) {
      identityKey = pathToIdentityKey.get(edit.originalPath) ?? edit.originalPath;
      pathToIdentityKey.set(edit.filePath, identityKey);
      pathToIdentityKey.delete(edit.originalPath);
    } else {
      identityKey = pathToIdentityKey.get(edit.filePath) ?? edit.filePath;
      pathToIdentityKey.set(edit.filePath, identityKey);
    }
    if (touchedIdentityKeys && edit.turnId === incremental.changedTurnId) {
      touchedIdentityKeys.add(identityKey);
    }
    const existing = identities.get(identityKey);
    if (!existing) {
      identities.set(identityKey, {
        terminalPath: edit.filePath,
        firstToolCallId: edit.toolCallId,
        firstFilePath: edit.kind === "rename" /* Rename */ && edit.originalPath ? edit.originalPath : edit.filePath,
        firstKind: edit.kind,
        firstSourceIdx: 0,
        lastToolCallId: edit.toolCallId,
        lastFilePath: edit.filePath,
        lastKind: edit.kind,
        lastSourceIdx: 0
      });
    } else {
      existing.terminalPath = edit.filePath;
      existing.lastToolCallId = edit.toolCallId;
      existing.lastFilePath = edit.filePath;
      existing.lastKind = edit.kind;
    }
  }
  const previousDiffsMap = !fastPath ? new Map(incremental.previousDiffs.map((d) => [getFileEditUri(d), d])) : void 0;
  const results = [];
  const diffPromises = [];
  for (const [identityKey, identity2] of identities) {
    if (touchedIdentityKeys && !touchedIdentityKeys.has(identityKey)) {
      const uri = URI.file(identity2.terminalPath).toString();
      const prev = previousDiffsMap.get(uri);
      if (prev) {
        results.push(prev);
      }
      continue;
    }
    diffPromises.push((async () => {
      let beforeText;
      if (identity2.firstKind === "create" /* Create */) {
        beforeText = "";
      } else {
        const content = await db.readFileEditContent(identity2.firstToolCallId, identity2.firstFilePath);
        beforeText = content?.beforeContent ? new TextDecoder().decode(content.beforeContent) : "";
      }
      let afterText;
      if (identity2.lastKind === "delete" /* Delete */) {
        afterText = "";
      } else {
        const content = await db.readFileEditContent(identity2.lastToolCallId, identity2.lastFilePath);
        afterText = content?.afterContent ? new TextDecoder().decode(content.afterContent) : "";
      }
      if (beforeText === afterText) {
        return;
      }
      const counts = await diffService.computeDiffCounts(beforeText, afterText);
      results.push(createSessionFileDiff(sessionUri, sessionUri, identity2, counts.added, counts.removed));
    })());
  }
  await Promise.allSettled(diffPromises);
  if (fastPath) {
    results.push(...incremental.previousDiffs);
  }
  return results;
}

async function computeUnionedDiffs(sources, diffService, folderScope) {
  const perSourceEdits = await Promise.all(sources.map((source) => source.db.getAllFileEdits()));
  const pathToIdentityKey = /* @__PURE__ */ new Map();
  const identities = /* @__PURE__ */ new Map();
  let totalEdits = 0;
  for (let sourceIdx = 0; sourceIdx < perSourceEdits.length; sourceIdx++) {
    for (const edit of perSourceEdits[sourceIdx]) {
      totalEdits++;
      let identityKey;
      if (edit.kind === "rename" /* Rename */ && edit.originalPath) {
        identityKey = pathToIdentityKey.get(edit.originalPath) ?? edit.originalPath;
        pathToIdentityKey.set(edit.filePath, identityKey);
        pathToIdentityKey.delete(edit.originalPath);
      } else {
        identityKey = pathToIdentityKey.get(edit.filePath) ?? edit.filePath;
        pathToIdentityKey.set(edit.filePath, identityKey);
      }
      const existing = identities.get(identityKey);
      if (!existing) {
        identities.set(identityKey, {
          terminalPath: edit.filePath,
          firstToolCallId: edit.toolCallId,
          firstFilePath: edit.kind === "rename" /* Rename */ && edit.originalPath ? edit.originalPath : edit.filePath,
          firstKind: edit.kind,
          firstSourceIdx: sourceIdx,
          lastToolCallId: edit.toolCallId,
          lastFilePath: edit.filePath,
          lastKind: edit.kind,
          lastSourceIdx: sourceIdx
        });
      } else {
        existing.terminalPath = edit.filePath;
        existing.lastToolCallId = edit.toolCallId;
        existing.lastFilePath = edit.filePath;
        existing.lastKind = edit.kind;
        existing.lastSourceIdx = sourceIdx;
      }
    }
  }
  if (totalEdits === 0) {
    return [];
  }
  const results = [];
  const diffPromises = [];
  for (const identity2 of identities.values()) {
    if (folderScope && !isPathWithinFolderScope(identity2.terminalPath, folderScope)) {
      continue;
    }
    diffPromises.push((async () => {
      const firstSource = sources[identity2.firstSourceIdx];
      const lastSource = sources[identity2.lastSourceIdx];
      let beforeText;
      if (identity2.firstKind === "create" /* Create */) {
        beforeText = "";
      } else {
        const content = await firstSource.db.readFileEditContent(identity2.firstToolCallId, identity2.firstFilePath);
        beforeText = content?.beforeContent ? new TextDecoder().decode(content.beforeContent) : "";
      }
      let afterText;
      if (identity2.lastKind === "delete" /* Delete */) {
        afterText = "";
      } else {
        const content = await lastSource.db.readFileEditContent(identity2.lastToolCallId, identity2.lastFilePath);
        afterText = content?.afterContent ? new TextDecoder().decode(content.afterContent) : "";
      }
      if (beforeText === afterText) {
        return;
      }
      const counts = await diffService.computeDiffCounts(beforeText, afterText);
      results.push(createSessionFileDiff(firstSource.sessionUri, lastSource.sessionUri, identity2, counts.added, counts.removed));
    })());
  }
  await Promise.allSettled(diffPromises);
  return results;
}

function isPathWithinFolderScope(filePath, folderRoots) {
  const fileUri = URI.file(filePath);
  return folderRoots.some((root) => extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, root));
}

async function computeTurnDiffs(sessionUri, db, diffService, turnId, folderScope) {
  const turnEdits = await db.getFileEditsByTurn(turnId);
  if (turnEdits.length === 0) {
    return [];
  }
  const pathToIdentityKey = /* @__PURE__ */ new Map();
  const identities = /* @__PURE__ */ new Map();
  let nextIdentitySeq = 0;
  for (const edit of turnEdits) {
    let identityKey;
    if (edit.kind === "rename" /* Rename */ && edit.originalPath) {
      identityKey = pathToIdentityKey.get(edit.originalPath) ?? `${nextIdentitySeq++}`;
      pathToIdentityKey.set(edit.filePath, identityKey);
      pathToIdentityKey.delete(edit.originalPath);
    } else {
      identityKey = pathToIdentityKey.get(edit.filePath) ?? `${nextIdentitySeq++}`;
      pathToIdentityKey.set(edit.filePath, identityKey);
    }
    const existing = identities.get(identityKey);
    if (!existing) {
      identities.set(identityKey, {
        terminalPath: edit.filePath,
        firstToolCallId: edit.toolCallId,
        firstFilePath: edit.kind === "rename" /* Rename */ && edit.originalPath ? edit.originalPath : edit.filePath,
        firstKind: edit.kind,
        firstSourceIdx: 0,
        lastToolCallId: edit.toolCallId,
        lastFilePath: edit.filePath,
        lastKind: edit.kind,
        lastSourceIdx: 0
      });
    } else {
      existing.terminalPath = edit.filePath;
      existing.lastToolCallId = edit.toolCallId;
      existing.lastFilePath = edit.filePath;
      existing.lastKind = edit.kind;
    }
  }
  const results = [];
  const diffPromises = [];
  for (const identity2 of identities.values()) {
    if (folderScope && !isPathWithinFolderScope(identity2.terminalPath, folderScope)) {
      continue;
    }
    diffPromises.push((async () => {
      let beforeText;
      if (identity2.firstKind === "create" /* Create */) {
        beforeText = "";
      } else {
        const content = await db.readFileEditContent(identity2.firstToolCallId, identity2.firstFilePath);
        beforeText = content?.beforeContent ? new TextDecoder().decode(content.beforeContent) : "";
      }
      let afterText;
      if (identity2.lastKind === "delete" /* Delete */) {
        afterText = "";
      } else {
        const content = await db.readFileEditContent(identity2.lastToolCallId, identity2.lastFilePath);
        afterText = content?.afterContent ? new TextDecoder().decode(content.afterContent) : "";
      }
      if (beforeText === afterText) {
        return;
      }
      const counts = await diffService.computeDiffCounts(beforeText, afterText);
      results.push(createSessionFileDiff(sessionUri, sessionUri, identity2, counts.added, counts.removed));
    })());
  }
  await Promise.allSettled(diffPromises);
  return results;
}
export { getFileEditUri, createSessionFileDiff, computeSessionDiffs, computeUnionedDiffs, isPathWithinFolderScope, computeTurnDiffs };
