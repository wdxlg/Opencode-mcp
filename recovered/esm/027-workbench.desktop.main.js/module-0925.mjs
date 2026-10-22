// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/editor.ts
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { toAction } from "./module-0082.mjs";
import { severity_default } from "./module-0266.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Registry } from "./module-0090.mjs";
import { createErrorWithActions, isErrorWithActions } from "./module-0094.mjs";


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

var SIDE_BY_SIDE_EDITOR_ID = "workbench.editor.sidebysideEditor";

var TEXT_DIFF_EDITOR_ID = "workbench.editors.textDiffEditor";

var BINARY_DIFF_EDITOR_ID = "workbench.editors.binaryResourceDiffEditor";

function isEditorPaneWithSelection(editorPane) {
  const candidate = editorPane;
  return !!candidate && typeof candidate.getSelection === "function" && !!candidate.onDidChangeSelection;
}

function isEditorPaneWithScrolling(editorPane) {
  const candidate = editorPane;
  return !!candidate && typeof candidate.getScrollPosition === "function" && typeof candidate.setScrollPosition === "function" && !!candidate.onDidChangeScroll;
}

function findViewStateForEditor(input, group2, editorService) {
  for (const editorPane of editorService.visibleEditorPanes) {
    if (editorPane.group.id === group2 && input.matches(editorPane.input)) {
      return editorPane.getViewState();
    }
  }
  return void 0;
}

function isResourceEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  return URI.isUri(candidate?.resource);
}

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

function isUntitledResourceEditorInput(editor) {
  if (isEditorInput(editor)) {
    return false;
  }
  const candidate = editor;
  if (!candidate) {
    return false;
  }
  return candidate.resource === void 0 || candidate.resource.scheme === Schemas.untitled || candidate.forceUntitled === true;
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
  registerSource(id2, label3) {
    let sourceDescriptor = this.mapIdToSaveSource.get(id2);
    if (!sourceDescriptor) {
      sourceDescriptor = { source: id2, label: label3 };
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

function isEditorInputWithDiffResources(editor) {
  const candidate = editor;
  return URI.isUri(candidate?.diffResources?.original) && URI.isUri(candidate.diffResources.modified);
}

function createTooLargeFileError(group2, input, options3, message, preferencesService) {
  return createEditorOpenError(message, [
    toAction({
      id: "workbench.action.openLargeFile",
      label: localize(7377, null),
      run: () => {
        const fileEditorOptions = {
          ...options3,
          limits: {
            size: Number.MAX_VALUE
          }
        };
        group2.openEditor(input, fileEditorOptions);
      }
    }),
    toAction({
      id: "workbench.action.configureEditorLargeFileConfirmation",
      label: localize(7376, null),
      run: () => {
        return preferencesService.openUserSettings({ query: "workbench.editorLargeFileConfirmation" });
      }
    })
  ], {
    forceMessage: true,
    forceSeverity: severity_default.Warning
  });
}

function isEditorInputWithOptions(editor) {
  const candidate = editor;
  return isEditorInput(candidate?.editor);
}

function isEditorInputWithOptionsAndGroup(editor) {
  const candidate = editor;
  return isEditorInputWithOptions(editor) && candidate?.group !== void 0;
}

function isEditorIdentifier(identifier2) {
  const candidate = identifier2;
  return typeof candidate?.groupId === "number" && isEditorInput(candidate.editor);
}

function isEditorCommandsContext(context2) {
  const candidate = context2;
  return typeof candidate?.groupId === "number";
}

var EditorResourceAccessorImpl = class {
  getOriginalUri(editor, options3) {
    if (!editor) {
      return void 0;
    }
    if (isResourceMergeEditorInput(editor)) {
      return EditorResourceAccessor.getOriginalUri(editor.result, options3);
    }
    if (options3?.supportSideBySide) {
      const { primary, secondary } = this.getSideEditors(editor);
      if (primary && secondary) {
        if (options3?.supportSideBySide === 3 /* BOTH */) {
          return {
            primary: this.getOriginalUri(primary, { filterByScheme: options3.filterByScheme }),
            secondary: this.getOriginalUri(secondary, { filterByScheme: options3.filterByScheme })
          };
        } else if (options3?.supportSideBySide === 4 /* ANY */) {
          return this.getOriginalUri(primary, { filterByScheme: options3.filterByScheme }) ?? this.getOriginalUri(secondary, { filterByScheme: options3.filterByScheme });
        }
        editor = options3.supportSideBySide === 1 /* PRIMARY */ ? primary : secondary;
      }
    }
    if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
      return void 0;
    }
    const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
    if (!originalResource || !options3?.filterByScheme) {
      return originalResource;
    }
    return this.filterUri(originalResource, options3.filterByScheme);
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
  getCanonicalUri(editor, options3) {
    if (!editor) {
      return void 0;
    }
    if (isResourceMergeEditorInput(editor)) {
      return EditorResourceAccessor.getCanonicalUri(editor.result, options3);
    }
    if (options3?.supportSideBySide) {
      const { primary, secondary } = this.getSideEditors(editor);
      if (primary && secondary) {
        if (options3?.supportSideBySide === 3 /* BOTH */) {
          return {
            primary: this.getCanonicalUri(primary, { filterByScheme: options3.filterByScheme }),
            secondary: this.getCanonicalUri(secondary, { filterByScheme: options3.filterByScheme })
          };
        } else if (options3?.supportSideBySide === 4 /* ANY */) {
          return this.getCanonicalUri(primary, { filterByScheme: options3.filterByScheme }) ?? this.getCanonicalUri(secondary, { filterByScheme: options3.filterByScheme });
        }
        editor = options3.supportSideBySide === 1 /* PRIMARY */ ? primary : secondary;
      }
    }
    if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
      return void 0;
    }
    const canonicalResource = editor.resource;
    if (!canonicalResource || !options3?.filterByScheme) {
      return canonicalResource;
    }
    return this.filterUri(canonicalResource, options3.filterByScheme);
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

function preventEditorClose(group2, editor, method, configuration2) {
  if (!group2.isSticky(editor)) {
    return false;
  }
  switch (configuration2.preventPinnedEditorClose) {
    case "keyboardAndMouse":
      return method === 2 /* MOUSE */ || method === 1 /* KEYBOARD */;
    case "mouse":
      return method === 2 /* MOUSE */;
    case "keyboard":
      return method === 1 /* KEYBOARD */;
  }
  return false;
}

var EditorResourceAccessor = new EditorResourceAccessorImpl();

var EditorFactoryRegistry = class {
  constructor() {
    this.editorSerializerConstructors = /* @__PURE__ */ new Map();
    this.editorSerializerInstances = /* @__PURE__ */ new Map();
  }
  start(accessor) {
    const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
    for (const [key3, ctor] of this.editorSerializerConstructors) {
      this.createEditorSerializer(key3, ctor, instantiationService);
    }
    this.editorSerializerConstructors.clear();
  }
  createEditorSerializer(editorTypeId, ctor, instantiationService) {
    const instance2 = instantiationService.createInstance(ctor);
    this.editorSerializerInstances.set(editorTypeId, instance2);
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

async function pathsToEditors(paths, fileService, logService) {
  if (!paths?.length) {
    return [];
  }
  return await Promise.all(paths.map(async (path) => {
    const resource = URI.revive(path.fileUri);
    if (!resource) {
      logService.info("Cannot resolve the path because it is not valid.", path);
      return void 0;
    }
    const canHandleResource = await fileService.canHandleResource(resource);
    if (!canHandleResource) {
      logService.info("Cannot resolve the path because it cannot be handled", path);
      return void 0;
    }
    let exists = path.exists;
    let type = path.type;
    if (typeof exists !== "boolean" || typeof type !== "number") {
      try {
        type = (await fileService.stat(resource)).isDirectory ? 2 /* Directory */ : 0 /* Unknown */;
        exists = true;
      } catch (error) {
        logService.error(error);
        exists = false;
      }
    }
    if (!exists && path.openOnlyIfExists) {
      logService.info("Cannot resolve the path because it does not exist", path);
      return void 0;
    }
    if (type === 2 /* Directory */) {
      logService.info("Cannot resolve the path because it is a directory", path);
      return void 0;
    }
    const options3 = {
      ...path.options,
      pinned: true
    };
    if (!exists) {
      return { resource, options: options3, forceUntitled: true };
    }
    return { resource, options: options3 };
  }));
}

function isTextEditorViewState(candidate) {
  const viewState = candidate;
  if (!viewState) {
    return false;
  }
  const diffEditorViewState = viewState;
  if (diffEditorViewState.modified) {
    return isTextEditorViewState(diffEditorViewState.modified);
  }
  const codeEditorViewState = viewState;
  return !!(codeEditorViewState.contributionsState && codeEditorViewState.viewState && Array.isArray(codeEditorViewState.cursorState));
}

function isEditorOpenError(obj) {
  return isErrorWithActions(obj);
}

function createEditorOpenError(messageOrError, actions, options3) {
  const error = createErrorWithActions(messageOrError, actions);
  error.forceMessage = options3?.forceMessage;
  error.forceSeverity = options3?.forceSeverity;
  error.allowDialog = options3?.allowDialog;
  return error;
}
export { isEditorPaneWithSelection, isEditorPaneWithScrolling, findViewStateForEditor, isResourceEditorInput, isResourceDiffEditorInput, isResourceMultiDiffEditorInput, isResourceSideBySideEditorInput, isUntitledResourceEditorInput, isResourceMergeEditorInput, isEditorInput, isEditorInputWithPreferredResource, isSideBySideEditorInput, isDiffEditorInput, isEditorInputWithDiffResources, createTooLargeFileError, isEditorInputWithOptions, isEditorInputWithOptionsAndGroup, isEditorIdentifier, isEditorCommandsContext, preventEditorClose, pathsToEditors, isTextEditorViewState, isEditorOpenError, createEditorOpenError, EditorExtensions, DEFAULT_EDITOR_ASSOCIATION, SIDE_BY_SIDE_EDITOR_ID, TEXT_DIFF_EDITOR_ID, BINARY_DIFF_EDITOR_ID, SaveSourceFactory, SaveSourceRegistry, AbstractEditorInput, EditorResourceAccessorImpl, EditorResourceAccessor, EditorFactoryRegistry };
