// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorUtils.ts
import { isIChatSessionFileChange2 } from "./module-0961.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { URI } from "./module-0032.mjs";
import { ResourceSet } from "./module-0008.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackEditorUtils.ts
function changeMatchesResource(change, resourceUri) {
  if (isIChatSessionFileChange2(change)) {
    return isEqual2(change.uri, resourceUri) || isEqual2(change.modifiedUri, resourceUri) || isEqual2(change.originalUri, resourceUri);
  }
  return isEqual2(change.modifiedUri, resourceUri) || isEqual2(change.originalUri, resourceUri);
}

function createAgentFeedbackContext(editor, codeEditorService, resourceUri, range2) {
  const codeSelection = getCodeSelection(editor, codeEditorService, resourceUri, range2);
  const diffHunks = getDiffHunks(editor, codeEditorService, resourceUri, range2);
  return { codeSelection, diffHunks };
}

function getCodeSelection(editor, codeEditorService, resourceUri, range2) {
  const model = getModelForResource(editor, codeEditorService, resourceUri);
  if (!model) {
    return void 0;
  }
  const selection = model.getValueInRange(range2);
  return selection.length > 0 ? selection : void 0;
}

function getDiffHunks(editor, codeEditorService, resourceUri, range2) {
  const diffEditor = getContainingDiffEditor(editor, codeEditorService);
  if (!diffEditor) {
    return void 0;
  }
  const originalModel = diffEditor.getOriginalEditor().getModel();
  const modifiedModel = diffEditor.getModifiedEditor().getModel();
  if (!originalModel || !modifiedModel) {
    return void 0;
  }
  const selectionIsInOriginal = isEqual2(resourceUri, originalModel.uri);
  const selectionIsInModified = isEqual2(resourceUri, modifiedModel.uri);
  if (!selectionIsInOriginal && !selectionIsInModified) {
    return void 0;
  }
  const diffResult = diffEditor.getDiffComputationResult();
  if (!diffResult) {
    return void 0;
  }
  const selectionIsEmpty = range2.startLineNumber === range2.endLineNumber && range2.startColumn === range2.endColumn;
  const relevantGroups = groupChanges(diffResult.changes2).filter((group2) => {
    const changeTouchesSelection = (change) => rangeTouchesChange(range2, selectionIsInOriginal ? change.original : change.modified);
    return selectionIsEmpty ? group2.some(changeTouchesSelection) : group2.every(changeTouchesSelection);
  });
  if (relevantGroups.length === 0) {
    return void 0;
  }
  const originalText = originalModel.getValue();
  const modifiedText = modifiedModel.getValue();
  const originalEndsWithNewline = originalText.length > 0 && originalText.endsWith("\n");
  const modifiedEndsWithNewline = modifiedText.length > 0 && modifiedText.endsWith("\n");
  const originalLines = originalText.split("\n");
  const modifiedLines = modifiedText.split("\n");
  if (originalEndsWithNewline && originalLines[originalLines.length - 1] === "") {
    originalLines.pop();
  }
  if (modifiedEndsWithNewline && modifiedLines[modifiedLines.length - 1] === "") {
    modifiedLines.pop();
  }
  return relevantGroups.map((group2) => renderHunkGroup(group2, originalLines, modifiedLines, originalEndsWithNewline, modifiedEndsWithNewline)).join("\n");
}

function getContainingDiffEditor(editor, codeEditorService) {
  return codeEditorService.listDiffEditors().find(
    (diffEditor) => diffEditor.getModifiedEditor() === editor || diffEditor.getOriginalEditor() === editor
  );
}

function getModelForResource(editor, codeEditorService, resourceUri) {
  const currentModel = editor.getModel();
  if (currentModel && isEqual2(currentModel.uri, resourceUri)) {
    return currentModel;
  }
  const diffEditor = getContainingDiffEditor(editor, codeEditorService);
  const originalModel = diffEditor?.getOriginalEditor().getModel();
  if (originalModel && isEqual2(originalModel.uri, resourceUri)) {
    return originalModel;
  }
  const modifiedModel = diffEditor?.getModifiedEditor().getModel();
  if (modifiedModel && isEqual2(modifiedModel.uri, resourceUri)) {
    return modifiedModel;
  }
  return void 0;
}

function groupChanges(changes) {
  const contextSize = 3;
  const groups = [];
  let currentGroup = [];
  for (const change of changes) {
    if (currentGroup.length === 0) {
      currentGroup.push(change);
      continue;
    }
    const lastChange = currentGroup[currentGroup.length - 1];
    const lastContextEnd = lastChange.original.endLineNumberExclusive - 1 + contextSize;
    const currentContextStart = change.original.startLineNumber - contextSize;
    if (currentContextStart <= lastContextEnd + 1) {
      currentGroup.push(change);
    } else {
      groups.push(currentGroup);
      currentGroup = [change];
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

function rangeTouchesChange(range2, lineRange) {
  const isEmptySelection = range2.startLineNumber === range2.endLineNumber && range2.startColumn === range2.endColumn;
  if (isEmptySelection) {
    return !lineRange.isEmpty && lineRange.contains(range2.startLineNumber);
  }
  const selectionStart = range2.startLineNumber;
  const selectionEndExclusive = range2.endLineNumber + 1;
  return selectionStart <= lineRange.startLineNumber && lineRange.endLineNumberExclusive <= selectionEndExclusive;
}

function renderHunkGroup(group2, originalLines, modifiedLines, originalEndsWithNewline, modifiedEndsWithNewline) {
  const contextSize = 3;
  const firstChange = group2[0];
  const lastChange = group2[group2.length - 1];
  const hunkOrigStart = Math.max(1, firstChange.original.startLineNumber - contextSize);
  const hunkOrigEnd = Math.min(originalLines.length, lastChange.original.endLineNumberExclusive - 1 + contextSize);
  const hunkModStart = Math.max(1, firstChange.modified.startLineNumber - contextSize);
  const hunkLines = [];
  let lastOriginalLineIndex = -1;
  let lastModifiedLineIndex = -1;
  let origLineNum = hunkOrigStart;
  let origCount = 0;
  let modCount = 0;
  for (const change of group2) {
    const origStart = change.original.startLineNumber;
    const origEnd = change.original.endLineNumberExclusive;
    const modStart = change.modified.startLineNumber;
    const modEnd = change.modified.endLineNumberExclusive;
    while (origLineNum < origStart) {
      const idx = hunkLines.length;
      hunkLines.push(` ${originalLines[origLineNum - 1]}`);
      if (origLineNum === originalLines.length) {
        lastOriginalLineIndex = idx;
      }
      const modLineNum = hunkModStart + modCount;
      if (modLineNum === modifiedLines.length) {
        lastModifiedLineIndex = idx;
      }
      origLineNum++;
      origCount++;
      modCount++;
    }
    for (let i2 = origStart; i2 < origEnd; i2++) {
      const idx = hunkLines.length;
      hunkLines.push(`-${originalLines[i2 - 1]}`);
      if (i2 === originalLines.length) {
        lastOriginalLineIndex = idx;
      }
      origLineNum++;
      origCount++;
    }
    for (let i2 = modStart; i2 < modEnd; i2++) {
      const idx = hunkLines.length;
      hunkLines.push(`+${modifiedLines[i2 - 1]}`);
      if (i2 === modifiedLines.length) {
        lastModifiedLineIndex = idx;
      }
      modCount++;
    }
  }
  while (origLineNum <= hunkOrigEnd) {
    const idx = hunkLines.length;
    hunkLines.push(` ${originalLines[origLineNum - 1]}`);
    if (origLineNum === originalLines.length) {
      lastOriginalLineIndex = idx;
    }
    const modLineNum = hunkModStart + modCount;
    if (modLineNum === modifiedLines.length) {
      lastModifiedLineIndex = idx;
    }
    origLineNum++;
    origCount++;
    modCount++;
  }
  const header2 = `@@ -${hunkOrigStart},${origCount} +${hunkModStart},${modCount} @@`;
  const result = [header2, ...hunkLines];
  if (!originalEndsWithNewline && lastOriginalLineIndex >= 0) {
    result.splice(lastOriginalLineIndex + 2, 0, "\\ No newline at end of file");
  } else if (!modifiedEndsWithNewline && lastModifiedLineIndex >= 0) {
    result.splice(lastModifiedLineIndex + 2, 0, "\\ No newline at end of file");
  }
  return result.join("\n");
}

function getActiveResourceCandidates(input) {
  const result = [];
  const multiDiffInput = input instanceof SessionChangesEditorInput ? input.multiDiffInput : input;
  if (multiDiffInput instanceof MultiDiffEditorInput) {
    const items = multiDiffInput.resources.get();
    if (items) {
      for (const item of items) {
        if (item.originalUri) {
          result.push(item.originalUri);
        }
        if (item.modifiedUri) {
          result.push(item.modifiedUri);
        }
      }
    }
    return result;
  }
  const resources = EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: 3 /* BOTH */ });
  if (!resources) {
    return result;
  }
  if (URI.isUri(resources)) {
    result.push(resources);
    return result;
  }
  if (resources.secondary) {
    result.push(resources.secondary);
  }
  if (resources.primary) {
    result.push(resources.primary);
  }
  return result;
}

function* getFeedbackSessionCandidates(candidates, resolveSessionResource) {
  const seenSessions = new ResourceSet();
  for (const resource of candidates) {
    const sessionResource = resolveSessionResource(resource);
    if (!sessionResource || seenSessions.has(sessionResource)) {
      continue;
    }
    seenSessions.add(sessionResource);
    yield { resource, sessionResource };
  }
}
export { changeMatchesResource, createAgentFeedbackContext, getCodeSelection, getDiffHunks, getContainingDiffEditor, getModelForResource, groupChanges, rangeTouchesChange, renderHunkGroup, getActiveResourceCandidates, getFeedbackSessionCandidates };
