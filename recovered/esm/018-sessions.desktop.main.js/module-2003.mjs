// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorTypePicker.ts
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, isDiffEditorInput, isEditorInputWithDiffResources } from "./module-0926.mjs";
import { localize } from "./module-0001.mjs";
import { extUri } from "./module-0034.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID } from "./module-1530.mjs";


// src/vs/workbench/browser/parts/editor/editorTypePicker.ts
function getAvailableEditorTypes(activeEditor, editorResolverService, hiddenEditorIds) {
  const standardDiffResources = isDiffEditorInput(activeEditor) ? {
    original: activeEditor.original.resource,
    modified: activeEditor.modified.resource
  } : void 0;
  const diffResources = standardDiffResources ?? (isEditorInputWithDiffResources(activeEditor) ? activeEditor.diffResources : void 0);
  const resource = diffResources?.modified ?? EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
  if (!resource) {
    return void 0;
  }
  const currentId = activeEditor?.editorId ?? DEFAULT_EDITOR_ASSOCIATION.id;
  const hiddenEditorIdSet = new Set(hiddenEditorIds);
  const editors = editorResolverService.getEditors(resource, {
    excludeUnconfiguredUniversalOptionalEditors: true,
    currentEditorId: currentId,
    isDiffEditor: !!diffResources
  }).filter((editor) => editor.id === currentId || !hiddenEditorIdSet.has(editor.id));
  if (editors.length <= 1) {
    return void 0;
  }
  return {
    resource,
    isDiffEditor: !!diffResources,
    originalResource: diffResources?.original,
    modifiedResource: diffResources?.modified,
    currentId,
    editors
  };
}

function editorTypeDisplayLabel(editor, isDiffEditor2) {
  if (isDiffEditor2 && editor.id === DEFAULT_EDITOR_ASSOCIATION.id) {
    return localize(6759, null);
  }
  return editor.label;
}

function createEditorTypeActions(available, editorResolverService, commandService, editorService) {
  const glob = `*${extUri.extname(available.resource)}`;
  const builtinProviderLabel = localize(6753, null);
  const labelWithSource = (editor) => {
    const label3 = editorTypeDisplayLabel(editor, available.isDiffEditor);
    return editor.detail && editor.detail !== builtinProviderLabel ? localize(6754, null, label3, editor.detail) : label3;
  };
  const reopenActions = available.editors.map((editor) => toAction({
    id: editor.id,
    label: labelWithSource(editor),
    checked: editor.id === available.currentId,
    run: () => commandService.executeCommand(REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID, editor.id)
  }));
  const configuredDefault = editorResolverService.getConfiguredDefaultEditor(available.resource, available.isDiffEditor);
  const setDefaultActions = available.editors.map((editor) => toAction({
    id: `setDefault.${editor.id}`,
    label: labelWithSource(editor),
    checked: editor.id === configuredDefault,
    run: () => {
      editorResolverService.updateUserAssociations(glob, editor.id, available.isDiffEditor);
      return commandService.executeCommand(REOPEN_ACTIVE_EDITOR_WITH_COMMAND_ID, editor.id);
    }
  }));
  const setDefaultSubmenu = new SubmenuAction(
    "editorType.setDefault",
    available.isDiffEditor ? localize(6758, null, glob) : localize(6757, null, glob),
    setDefaultActions
  );
  const actions = [...reopenActions, new Separator(), setDefaultSubmenu];
  if (available.isDiffEditor) {
    actions.push(new Separator());
    if (available.originalResource) {
      actions.push(toAction({
        id: "editorType.openOriginal",
        label: localize(6756, null),
        run: () => editorService.openEditor({ resource: available.originalResource })
      }));
    }
    if (available.modifiedResource) {
      actions.push(toAction({
        id: "editorType.openModified",
        label: localize(6755, null),
        run: () => editorService.openEditor({ resource: available.modifiedResource })
      }));
    }
  }
  return actions;
}
export { getAvailableEditorTypes, editorTypeDisplayLabel, createEditorTypeActions };
