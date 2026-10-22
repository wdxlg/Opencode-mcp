// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/editor.ts
import { Emitter } from "./module-0017.mjs";
import { toDisposable } from "./module-0012.mjs";
import { Iterable } from "./module-0011.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions, EditorResourceAccessor } from "./module-0926.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { Schemas } from "./module-0033.mjs";
import { Promises } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/browser/editor.ts
var EditorPaneDescriptor = class _EditorPaneDescriptor {
  constructor(ctor, typeId, name) {
    this.ctor = ctor;
    this.typeId = typeId;
    this.name = name;
  }
  static {
    this.instantiatedEditorPanes = /* @__PURE__ */ new Set();
  }
  static didInstantiateEditorPane(typeId) {
    return _EditorPaneDescriptor.instantiatedEditorPanes.has(typeId);
  }
  static {
    this._onWillInstantiateEditorPane = new Emitter();
  }
  static {
    this.onWillInstantiateEditorPane = _EditorPaneDescriptor._onWillInstantiateEditorPane.event;
  }
  static create(ctor, typeId, name) {
    return new _EditorPaneDescriptor(ctor, typeId, name);
  }
  instantiate(instantiationService, group2) {
    _EditorPaneDescriptor._onWillInstantiateEditorPane.fire({ typeId: this.typeId });
    const pane = instantiationService.createInstance(this.ctor, group2);
    _EditorPaneDescriptor.instantiatedEditorPanes.add(this.typeId);
    return pane;
  }
  describes(editorPane) {
    return editorPane.getId() === this.typeId;
  }
};

var EditorPaneRegistry = class {
  constructor() {
    this.mapEditorPanesToEditors = /* @__PURE__ */ new Map();
  }
  registerEditorPane(editorPaneDescriptor, editorDescriptors) {
    this.mapEditorPanesToEditors.set(editorPaneDescriptor, editorDescriptors);
    return toDisposable(() => {
      this.mapEditorPanesToEditors.delete(editorPaneDescriptor);
    });
  }
  getEditorPane(editor) {
    const descriptors = this.findEditorPaneDescriptors(editor);
    if (descriptors.length === 0) {
      return void 0;
    }
    if (descriptors.length === 1) {
      return descriptors[0];
    }
    return editor.prefersEditorPane(descriptors);
  }
  findEditorPaneDescriptors(editor, byInstanceOf) {
    const matchingEditorPaneDescriptors = [];
    for (const editorPane of this.mapEditorPanesToEditors.keys()) {
      const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane) || [];
      for (const editorDescriptor of editorDescriptors) {
        const editorClass = editorDescriptor.ctor;
        if (!byInstanceOf && editor.constructor === editorClass) {
          matchingEditorPaneDescriptors.push(editorPane);
          break;
        } else if (byInstanceOf && editor instanceof editorClass) {
          matchingEditorPaneDescriptors.push(editorPane);
          break;
        }
      }
    }
    if (!byInstanceOf && matchingEditorPaneDescriptors.length === 0) {
      return this.findEditorPaneDescriptors(editor, true);
    }
    return matchingEditorPaneDescriptors;
  }
  //#region Used for tests only
  getEditorPaneByType(typeId) {
    return Iterable.find(this.mapEditorPanesToEditors.keys(), (editor) => editor.typeId === typeId);
  }
  getEditorPanes() {
    return Array.from(this.mapEditorPanesToEditors.keys());
  }
  getEditors() {
    const editorClasses = [];
    for (const editorPane of this.mapEditorPanesToEditors.keys()) {
      const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane);
      if (editorDescriptors) {
        editorClasses.push(...editorDescriptors.map((editorDescriptor) => editorDescriptor.ctor));
      }
    }
    return editorClasses;
  }
  //#endregion
};

Registry.add(EditorExtensions.EditorPane, new EditorPaneRegistry());

function whenEditorClosed(accessor, resources) {
  const editorService = accessor.get(IEditorService);
  const uriIdentityService = accessor.get(IUriIdentityService);
  const workingCopyService = accessor.get(IWorkingCopyService);
  return new Promise((resolve3) => {
    let remainingResources = [...resources];
    const listener = editorService.onDidCloseEditor(async (event) => {
      if (event.context === 2 /* MOVE */) {
        return;
      }
      let primaryResource = EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: 1 /* PRIMARY */ });
      let secondaryResource = EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: 2 /* SECONDARY */ });
      if (event.context === 1 /* REPLACE */) {
        const newPrimaryResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
        const newSecondaryResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: 2 /* SECONDARY */ });
        if (uriIdentityService.extUri.isEqual(primaryResource, newPrimaryResource)) {
          primaryResource = void 0;
        }
        if (uriIdentityService.extUri.isEqual(secondaryResource, newSecondaryResource)) {
          secondaryResource = void 0;
        }
      }
      remainingResources = remainingResources.filter((resource) => {
        if (uriIdentityService.extUri.isEqual(resource, primaryResource) || uriIdentityService.extUri.isEqual(resource, secondaryResource)) {
          return false;
        }
        if (event.context !== 1 /* REPLACE */) {
          if (primaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(resource, primaryResource.with({ scheme: resource.scheme })) || secondaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(resource, secondaryResource.with({ scheme: resource.scheme }))) {
            return false;
          }
        }
        return true;
      });
      if (remainingResources.length === 0) {
        const dirtyResources = resources.filter((resource) => workingCopyService.isDirty(resource));
        if (dirtyResources.length > 0) {
          await Promises.settled(dirtyResources.map(async (resource) => await new Promise((resolve4) => {
            if (!workingCopyService.isDirty(resource)) {
              return resolve4();
            }
            const listener2 = workingCopyService.onDidChangeDirty((workingCopy) => {
              if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(resource, workingCopy.resource)) {
                listener2.dispose();
                return resolve4();
              }
            });
          })));
        }
        listener.dispose();
        return resolve3();
      }
    });
  });
}

function computeEditorAriaLabel(input, index2, group2, groupCount) {
  let ariaLabel = input.getAriaLabel();
  if (group2 && !group2.isPinned(input)) {
    ariaLabel = localize(6195, null, ariaLabel);
  }
  if (group2?.isSticky(index2 ?? input)) {
    ariaLabel = localize(6194, null, ariaLabel);
  }
  if (group2 && typeof groupCount === "number" && groupCount > 1) {
    ariaLabel = `${ariaLabel}, ${group2.ariaLabel}`;
  }
  return ariaLabel;
}
export { whenEditorClosed, computeEditorAriaLabel, EditorPaneDescriptor, EditorPaneRegistry };
