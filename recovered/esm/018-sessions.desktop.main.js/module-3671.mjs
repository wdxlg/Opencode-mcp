// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionFiles.ts
import { derived, derivedOpts } from "./module-0054.mjs";
import { createActiveSessionSubscriptionObs } from "./module-3669.mjs";
import { constObservable } from "./module-0061.mjs";
import { CustomizationIndex, createIncrementalChatCustomizationRefsParser, customizationRefsEqual, resolveChatCustomizations, sessionChatCustomizationsEqual } from "./module-3670.mjs";
import { sessionTurnFileChangesEqual } from "./module-1767.mjs";
import { getComparisonKey, isEqual2, isEqualOrParent2 } from "./module-0034.mjs";
import { normalizeFileEdit } from "./module-2217.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionFiles.ts
function createSessionOutputObs(sessionUri, options3, isActiveSessionObs, isArchivedObs, workspaceObs, cache2) {
  const mapDiffUri = options3.mapDiffUri;
  const enabledObs = derivedOpts({ equalsFn: (a, b) => a === b }, (reader) => isActiveSessionObs.read(reader) && !isArchivedObs.read(reader));
  const outputByChat = /* @__PURE__ */ new Map();
  const getChatOutput = (chatUri) => {
    const key3 = chatUri.toString();
    let output = outputByChat.get(key3);
    if (!output) {
      const chatStateObs = createActiveSessionSubscriptionObs(
        options3,
        enabledObs,
        2 /* Chat */,
        constObservable(chatUri)
      );
      const parseFileEdits = createIncrementalChatFileEditsParser(mapDiffUri);
      const parseCustomizationRefs = createIncrementalChatCustomizationRefsParser();
      output = {
        lastTurnEdits: derivedOpts({ equalsFn: parsedFileEditsEqual }, (reader) => {
          const chatState = chatStateObs.read(reader).read(reader);
          if (!chatState || chatState instanceof Error) {
            return [];
          }
          return parseFileEdits(chatState);
        }),
        // Kept separate from `lastTurnEdits` so a delta that only carries
        // file edits does not invalidate the customization references,
        // and vice versa.
        customizationRefs: derivedOpts({ equalsFn: customizationRefsEqual }, (reader) => {
          const chatState = chatStateObs.read(reader).read(reader);
          if (!chatState || chatState instanceof Error) {
            return [];
          }
          return parseCustomizationRefs(chatState);
        })
      };
      outputByChat.set(key3, output);
    }
    return output;
  };
  const lastTurnChangesByChat = /* @__PURE__ */ new Map();
  const getLastTurnChanges = (chatUri) => {
    const key3 = chatUri.toString();
    let changes = lastTurnChangesByChat.get(key3);
    if (!changes) {
      changes = derivedOpts({ equalsFn: sessionTurnFileChangesEqual }, (reader) => {
        const folderRoots = getWorkspaceAndWorktreeRoots(workspaceObs.read(reader));
        return reduceTurnChanges(getChatOutput(chatUri).lastTurnEdits.read(reader), folderRoots, cache2);
      });
      lastTurnChangesByChat.set(key3, changes);
    }
    return changes;
  };
  const sessionStateObs = createActiveSessionSubscriptionObs(
    options3,
    enabledObs,
    1 /* Session */,
    constObservable(sessionUri)
  );
  const customizationsObs = derivedOpts({ equalsFn: (a, b) => a === b }, (reader) => {
    const sessionState = sessionStateObs.read(reader).read(reader);
    return !sessionState || sessionState instanceof Error ? void 0 : sessionState.customizations;
  });
  const customizationIndexObs = derived((reader) => new CustomizationIndex(customizationsObs.read(reader), getWorkspaceAndWorktreeRoots(workspaceObs.read(reader))));
  const customizationsByChat = /* @__PURE__ */ new Map();
  const getChatCustomizations = (chatUri) => {
    const key3 = chatUri.toString();
    let customizations = customizationsByChat.get(key3);
    if (!customizations) {
      customizations = derivedOpts({ equalsFn: sessionChatCustomizationsEqual }, (reader) => resolveChatCustomizations(getChatOutput(chatUri).customizationRefs.read(reader), customizationIndexObs.read(reader)));
      customizationsByChat.set(key3, customizations);
    }
    return customizations;
  };
  const releaseChat = (chatUri) => {
    const key3 = chatUri.toString();
    outputByChat.delete(key3);
    lastTurnChangesByChat.delete(key3);
    customizationsByChat.delete(key3);
  };
  return { getLastTurnChanges, getChatCustomizations, releaseChat };
}

function pushUniqueRoot(roots, root) {
  if (root && !roots.some((existing) => isEqual2(existing, root))) {
    roots.push(root);
  }
}

function getWorkspaceAndWorktreeRoots(workspace) {
  const roots = [];
  for (const folder of workspace?.folders ?? []) {
    pushUniqueRoot(roots, folder.root);
    pushUniqueRoot(roots, folder.workingDirectory);
    pushUniqueRoot(roots, folder.gitRepository?.workTreeUri);
  }
  return roots;
}

function createIncrementalChatFileEditsParser(mapDiffUri, parseTurn = (responseParts) => parseResponseParts(responseParts, mapDiffUri)) {
  let completedLastTurn;
  return (chatState) => {
    if (chatState.activeTurn) {
      return parseTurn(chatState.activeTurn.responseParts);
    }
    const turns = chatState.turns ?? [];
    const lastTurn = turns.length > 0 ? turns[turns.length - 1] : void 0;
    if (!lastTurn) {
      completedLastTurn = void 0;
      return [];
    }
    if (completedLastTurn?.id !== lastTurn.id) {
      completedLastTurn = { id: lastTurn.id, edits: parseTurn(lastTurn.responseParts) };
    }
    return completedLastTurn.edits;
  };
}

function parseResponseParts(responseParts, mapDiffUri) {
  const out = [];
  for (const part of responseParts) {
    if (part.kind !== "toolCall" /* ToolCall */) {
      continue;
    }
    for (const fileEdit of getToolCallFileEdits(part.toolCall)) {
      const parsed = parseFileEdit(fileEdit, mapDiffUri);
      if (parsed) {
        out.push(parsed);
      }
    }
  }
  return out;
}

function getToolCallFileEdits(toolCall) {
  const edits = [];
  if (toolCall.status === "running" /* Running */ || toolCall.status === "completed" /* Completed */ || toolCall.status === "pending-result-confirmation" /* PendingResultConfirmation */) {
    for (const c of toolCall.content ?? []) {
      if (c.type === "fileEdit" /* FileEdit */) {
        edits.push(c);
      }
    }
  } else if (toolCall.status === "pending-confirmation" /* PendingConfirmation */) {
    edits.push(...toolCall.edits?.items ?? []);
  }
  return edits;
}

function parseFileEdit(fileEdit, mapDiffUri) {
  const normalized = normalizeFileEdit(fileEdit);
  if (!normalized) {
    return void 0;
  }
  const map = (uri4) => uri4 ? mapDiffUri ? mapDiffUri(uri4) : uri4 : void 0;
  const mapContent = (uri4) => uri4 ? mapDiffUri ? mapDiffUri(uri4, { contentRef: true }) : uri4 : void 0;
  return {
    kind: normalized.kind,
    afterUri: map(normalized.afterUri),
    beforeUri: map(normalized.beforeUri),
    beforeContentUri: mapContent(normalized.beforeContentUri),
    insertions: fileEdit.diff?.added ?? 0,
    deletions: fileEdit.diff?.removed ?? 0
  };
}

function reduceTurnChanges(edits, folderRoots = [], cache2) {
  const byUri = /* @__PURE__ */ new Map();
  const isOutsideWorkspace = (resource) => {
    const cacheKey2 = `isOutsideWorkspace:${resource.toString()}`;
    const cached = cache2?.get(cacheKey2);
    if (typeof cached === "boolean") {
      return cached;
    }
    const result = !folderRoots.some((root) => isEqualOrParent2(resource, root));
    cache2?.set(cacheKey2, result);
    return result;
  };
  const setCreated = (uri4, insertions, deletions) => {
    const key3 = getComparisonKey(uri4);
    const existing = byUri.get(key3);
    if (existing) {
      existing.created = true;
      existing.modifiedUri = uri4;
      existing.originalUri = void 0;
      existing.insertions += insertions;
      existing.deletions += deletions;
      return;
    }
    byUri.set(key3, { uri: uri4, modifiedUri: uri4, originalUri: void 0, isOutsideWorkspace: isOutsideWorkspace(uri4), created: true, insertions, deletions });
  };
  const setModified = (uri4, originalUri, insertions, deletions) => {
    const key3 = getComparisonKey(uri4);
    const existing = byUri.get(key3);
    if (existing) {
      existing.insertions += insertions;
      existing.deletions += deletions;
      if (!existing.created) {
        existing.originalUri = existing.originalUri ?? originalUri;
      }
      return;
    }
    byUri.set(key3, { uri: uri4, modifiedUri: uri4, originalUri, isOutsideWorkspace: isOutsideWorkspace(uri4), created: false, insertions, deletions });
  };
  const setDeleted = (uri4, originalUri, insertions, deletions) => {
    const key3 = getComparisonKey(uri4);
    if (byUri.has(key3)) {
      byUri.delete(key3);
      return;
    }
    byUri.set(key3, { uri: uri4, modifiedUri: void 0, originalUri, isOutsideWorkspace: isOutsideWorkspace(uri4), created: false, insertions, deletions });
  };
  for (const edit3 of edits) {
    switch (edit3.kind) {
      case "create" /* Create */:
        if (edit3.afterUri) {
          setCreated(edit3.afterUri, edit3.insertions, edit3.deletions);
        }
        break;
      case "edit" /* Edit */:
        if (edit3.afterUri) {
          setModified(edit3.afterUri, edit3.beforeContentUri, edit3.insertions, edit3.deletions);
        }
        break;
      case "delete" /* Delete */:
        if (edit3.beforeUri) {
          setDeleted(edit3.beforeUri, edit3.beforeContentUri, edit3.insertions, edit3.deletions);
        }
        break;
      case "rename" /* Rename */:
        if (edit3.beforeUri) {
          byUri.delete(getComparisonKey(edit3.beforeUri));
        }
        if (edit3.afterUri) {
          setModified(edit3.afterUri, edit3.beforeContentUri, edit3.insertions, edit3.deletions);
        }
        break;
    }
  }
  return [...byUri.values()].map((c) => ({
    uri: c.uri,
    modifiedUri: c.modifiedUri,
    originalUri: c.originalUri,
    isOutsideWorkspace: c.isOutsideWorkspace,
    insertions: c.insertions,
    deletions: c.deletions
  }));
}

function parsedFileEditsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i2 = 0; i2 < a.length; i2++) {
    if (a[i2].kind !== b[i2].kind || a[i2].insertions !== b[i2].insertions || a[i2].deletions !== b[i2].deletions || !isEqual2(a[i2].afterUri, b[i2].afterUri) || !isEqual2(a[i2].beforeUri, b[i2].beforeUri) || !isEqual2(a[i2].beforeContentUri, b[i2].beforeContentUri)) {
      return false;
    }
  }
  return true;
}
export { createSessionOutputObs, pushUniqueRoot, getWorkspaceAndWorktreeRoots, createIncrementalChatFileEditsParser, parseResponseParts, getToolCallFileEdits, parseFileEdit, reduceTurnChanges, parsedFileEditsEqual };
