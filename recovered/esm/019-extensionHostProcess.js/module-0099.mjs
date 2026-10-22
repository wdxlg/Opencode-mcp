// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/common/editor.ts
import { localize } from "./module-0013.mjs";
import { URI } from "./module-0025.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { IInstantiationService } from "./module-0048.mjs";
import { assertReturnsDefined } from "./module-0009.mjs";
import { Registry } from "./module-0097.mjs";


// src/vs/workbench/common/editor.ts
var EditorExtensions = {
  EditorPane: "workbench.contributions.editors",
  EditorFactory: "workbench.contributions.editor.inputFactories"
};

var DEFAULT_EDITOR_ASSOCIATION = {
  id: "default",
  displayName: localize(7378, null),
  providerDisplayName: localize(7375, null)
};

function isResourceDiffEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  return candidate?.original !== void 0 && candidate.modified !== void 0;
}

function isResourceMultiDiffEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  if (!candidate) {
    return false;
  }
  if (candidate.resources && !Array.isArray(candidate.resources)) {
    return false;
  }
  return !!candidate.resources || !!candidate.multiDiffSource;
}

function isResourceSideBySideEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  if (isResourceDiffEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  return candidate?.primary !== void 0 && candidate.secondary !== void 0;
}

function isResourceMergeEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  return URI.isUri(candidate?.base?.resource) && URI.isUri(candidate?.input1?.resource) && URI.isUri(candidate?.input2?.resource) && URI.isUri(candidate?.result?.resource);
}

var SaveSourceFactory = class {
  constructor() {
    this.mapIdToSaveSource = /* @__PURE__ */ new Map();
  }
  /**
   * Registers a `SaveSource` with an identifier and label
   * to the registry so that it can be used in save operations.
   */
  registerSource(id2, label) {
    let sourceDescriptor = this.mapIdToSaveSource.get(id2);
    if (!sourceDescriptor) {
      sourceDescriptor = { source: id2, label };
      this.mapIdToSaveSource.set(id2, sourceDescriptor);
    }
    return sourceDescriptor.source;
  }
  getSourceLabel(source) {
    return this.mapIdToSaveSource.get(source)?.label ?? source;
  }
};

var SaveSourceRegistry = new SaveSourceFactory();

var AbstractEditorInput = class extends Disposable {
  // Marker class for implementing `isEditorInput`
};

function isEditorInput(editor) {
  return editor instanceof AbstractEditorInput;
}

function isEditorInputWithPreferredResource(editor) {
  const candidate = editor;
  return URI.isUri(candidate?.preferredResource);
}

function isSideBySideEditorInput(editor) {
  const candidate = editor;
  return isEditorInput(candidate?.primary) && isEditorInput(candidate?.secondary);
}

function isDiffEditorInput(editor) {
  const candidate = editor;
  return isEditorInput(candidate?.modified) && isEditorInput(candidate?.original);
}

var EditorResourceAccessorImpl = class {
  getOriginalUri(editor, options2) {
    if (!editor) {
      return void 0;
    }
    if (isResourceMergeEditorInput(editor)) {
      return EditorResourceAccessor.getOriginalUri(editor.result, options2);
    }
    if (options2?.supportSideBySide) {
      const { primary, secondary } = this.getSideEditors(editor);
      if (primary && secondary) {
        if (options2?.supportSideBySide === 3 /* BOTH */) {
          return {
            primary: this.getOriginalUri(primary, { filterByScheme: options2.filterByScheme }),
            secondary: this.getOriginalUri(secondary, { filterByScheme: options2.filterByScheme })
          };
        } else if (options2?.supportSideBySide === 4 /* ANY */) {
          return this.getOriginalUri(primary, { filterByScheme: options2.filterByScheme }) ?? this.getOriginalUri(secondary, { filterByScheme: options2.filterByScheme });
        }
        editor = options2.supportSideBySide === 1 /* PRIMARY */ ? primary : secondary;
      }
    }
    if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
      return void 0;
    }
    const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
    if (!originalResource || !options2?.filterByScheme) {
      return originalResource;
    }
    return this.filterUri(originalResource, options2.filterByScheme);
  }
  getSideEditors(editor) {
    if (isSideBySideEditorInput(editor) || isResourceSideBySideEditorInput(editor)) {
      return { primary: editor.primary, secondary: editor.secondary };
    }
    if (isDiffEditorInput(editor) || isResourceDiffEditorInput(editor)) {
      return { primary: editor.modified, secondary: editor.original };
    }
    return { primary: void 0, secondary: void 0 };
  }
  getCanonicalUri(editor, options2) {
    if (!editor) {
      return void 0;
    }
    if (isResourceMergeEditorInput(editor)) {
      return EditorResourceAccessor.getCanonicalUri(editor.result, options2);
    }
    if (options2?.supportSideBySide) {
      const { primary, secondary } = this.getSideEditors(editor);
      if (primary && secondary) {
        if (options2?.supportSideBySide === 3 /* BOTH */) {
          return {
            primary: this.getCanonicalUri(primary, { filterByScheme: options2.filterByScheme }),
            secondary: this.getCanonicalUri(secondary, { filterByScheme: options2.filterByScheme })
          };
        } else if (options2?.supportSideBySide === 4 /* ANY */) {
          return this.getCanonicalUri(primary, { filterByScheme: options2.filterByScheme }) ?? this.getCanonicalUri(secondary, { filterByScheme: options2.filterByScheme });
        }
        editor = options2.supportSideBySide === 1 /* PRIMARY */ ? primary : secondary;
      }
    }
    if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
      return void 0;
    }
    const canonicalResource = editor.resource;
    if (!canonicalResource || !options2?.filterByScheme) {
      return canonicalResource;
    }
    return this.filterUri(canonicalResource, options2.filterByScheme);
  }
  filterUri(resource, filter2) {
    if (Array.isArray(filter2)) {
      if (filter2.some((scheme) => resource.scheme === scheme)) {
        return resource;
      }
    } else {
      if (filter2 === resource.scheme) {
        return resource;
      }
    }
    return void 0;
  }
};

var EditorResourceAccessor = new EditorResourceAccessorImpl();

var EditorFactoryRegistry = class {
  constructor() {
    this.editorSerializerConstructors = /* @__PURE__ */ new Map();
    this.editorSerializerInstances = /* @__PURE__ */ new Map();
  }
  start(accessor) {
    const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
    for (const [key, ctor] of this.editorSerializerConstructors) {
      this.createEditorSerializer(key, ctor, instantiationService);
    }
    this.editorSerializerConstructors.clear();
  }
  createEditorSerializer(editorTypeId, ctor, instantiationService) {
    const instance = instantiationService.createInstance(ctor);
    this.editorSerializerInstances.set(editorTypeId, instance);
  }
  registerFileEditorFactory(factory) {
    if (this.fileEditorFactory) {
      throw new Error("Can only register one file editor factory.");
    }
    this.fileEditorFactory = factory;
  }
  getFileEditorFactory() {
    return assertReturnsDefined(this.fileEditorFactory);
  }
  registerEditorSerializer(editorTypeId, ctor) {
    if (this.editorSerializerConstructors.has(editorTypeId) || this.editorSerializerInstances.has(editorTypeId)) {
      throw new Error(`A editor serializer with type ID '${editorTypeId}' was already registered.`);
    }
    if (!this.instantiationService) {
      this.editorSerializerConstructors.set(editorTypeId, ctor);
    } else {
      this.createEditorSerializer(editorTypeId, ctor, this.instantiationService);
    }
    return toDisposable(() => {
      this.editorSerializerConstructors.delete(editorTypeId);
      this.editorSerializerInstances.delete(editorTypeId);
    });
  }
  getEditorSerializer(arg1) {
    return this.editorSerializerInstances.get(typeof arg1 === "string" ? arg1 : arg1.typeId);
  }
};

Registry.add(EditorExtensions.EditorFactory, new EditorFactoryRegistry());
export { isResourceDiffEditorInput, isResourceMultiDiffEditorInput, isResourceSideBySideEditorInput, isResourceMergeEditorInput, isEditorInput, isEditorInputWithPreferredResource, isSideBySideEditorInput, isDiffEditorInput, EditorExtensions, DEFAULT_EDITOR_ASSOCIATION, SaveSourceFactory, SaveSourceRegistry, AbstractEditorInput, EditorResourceAccessorImpl, EditorResourceAccessor, EditorFactoryRegistry };
