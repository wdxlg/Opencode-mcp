// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/interactive/browser/interactive.contribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { InteractiveEditor } from "./module-3012.mjs";
import { CellUri, INTERACTIVE_WINDOW_EDITOR_ID, NotebookSetting, NotebookWorkingCopyTypeIdentifier } from "./module-0909.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { InteractiveEditorInput } from "./module-1129.mjs";
import { Disposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0926.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { parse2 } from "./module-0265.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IInteractiveHistoryService, InteractiveHistoryService } from "./module-1128.mjs";
import { IInteractiveDocumentService, InteractiveDocumentService } from "./module-1127.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { columnToEditorGroup } from "./module-1078.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IS_COMPOSITE_NOTEBOOK, InteractiveWindowOpen, NOTEBOOK_EDITOR_FOCUSED } from "./module-1868.mjs";
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from "./module-1869.mjs";
import { executeIcon } from "./module-1870.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { INotebookEditorService } from "./module-1386.mjs";
import { isReplEditorControl } from "./module-3014.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { InlineChatController } from "./module-2397.mjs";
import { ResourceNotebookCellEdit } from "./module-0942.mjs";
import { EditOperation } from "./module-0162.mjs";
import { INTERACTIVE_INPUT_CURSOR_BOUNDARY, ReplEditorSettings } from "./module-3010.mjs";
import { Context } from "./module-0696.mjs";
import { Iterable } from "./module-0011.mjs";
import { IsLinuxContext, IsWindowsContext } from "./module-0635.mjs";
import { ifDefinedThenElse, registerColor } from "./module-0226.mjs";
import { peekViewBorder } from "./module-0623.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { listInactiveSelectionBackground } from "./module-0232.mjs";
import { PANEL_BORDER } from "./module-0912.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/interactive/browser/interactive.contribution.ts
var interactiveWindowCategory = localize2(16222, "Interactive Window");

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    InteractiveEditor,
    INTERACTIVE_WINDOW_EDITOR_ID,
    "Interactive Window"
  ),
  [
    new SyncDescriptor(InteractiveEditorInput)
  ]
);

var InteractiveDocumentContribution = class extends Disposable {
  constructor(notebookService, editorResolverService, editorService, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    const info = notebookService.getContributedNotebookType("interactive");
    if (!info) {
      this._register(notebookService.registerContributedNotebookType("interactive", {
        providerDisplayName: "Interactive Notebook",
        displayName: "Interactive",
        filenamePattern: ["*.interactive"],
        priority: "builtin" /* builtin */
      }));
    }
    editorResolverService.registerEditor(
      `${Schemas.vscodeInteractiveInput}:/**`,
      {
        id: "vscode-interactive-input",
        label: "Interactive Editor",
        priority: "exclusive" /* exclusive */
      },
      {
        canSupportResource: (uri5) => uri5.scheme === Schemas.vscodeInteractiveInput,
        singlePerResource: true
      },
      {
        createEditorInput: ({ resource }) => {
          const editorInput = editorService.findEditors({
            resource,
            editorId: "interactive",
            typeId: InteractiveEditorInput.ID
          }, { order: 1 /* SEQUENTIAL */ }).at(0);
          return editorInput;
        }
      }
    );
    editorResolverService.registerEditor(
      `*.interactive`,
      {
        id: "interactive",
        label: "Interactive Editor",
        priority: "exclusive" /* exclusive */
      },
      {
        canSupportResource: (uri5) => uri5.scheme === Schemas.untitled && extname2(uri5) === ".interactive" || uri5.scheme === Schemas.vscodeNotebookCell && extname2(uri5) === ".interactive",
        singlePerResource: true
      },
      {
        createEditorInput: ({ resource, options: options3 }) => {
          const data = CellUri.parse(resource);
          let cellOptions;
          let iwResource = resource;
          if (data) {
            cellOptions = { resource, options: options3 };
            iwResource = data.notebook;
          }
          const notebookOptions = {
            ...options3,
            cellOptions,
            cellRevealType: void 0,
            cellSelections: void 0,
            isReadOnly: void 0,
            viewState: void 0,
            indexedCellOptions: void 0
          };
          const editorInput = createEditor(iwResource, this.instantiationService);
          return {
            editor: editorInput,
            options: notebookOptions
          };
        },
        createUntitledEditorInput: ({ resource, options: options3 }) => {
          if (!resource) {
            throw new Error("Interactive window editors must have a resource name");
          }
          const data = CellUri.parse(resource);
          let cellOptions;
          if (data) {
            cellOptions = { resource, options: options3 };
          }
          const notebookOptions = {
            ...options3,
            cellOptions,
            cellRevealType: void 0,
            cellSelections: void 0,
            isReadOnly: void 0,
            viewState: void 0,
            indexedCellOptions: void 0
          };
          const editorInput = createEditor(resource, this.instantiationService);
          return {
            editor: editorInput,
            options: notebookOptions
          };
        }
      }
    );
  }
  static {
    this.ID = "workbench.contrib.interactiveDocument";
  }
};

InteractiveDocumentContribution = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IEditorResolverService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IInstantiationService)
], InteractiveDocumentContribution);

var InteractiveInputContentProvider = class {
  constructor(textModelService, _modelService) {
    this._modelService = _modelService;
    this._registration = textModelService.registerTextModelContentProvider(Schemas.vscodeInteractiveInput, this);
  }
  static {
    this.ID = "workbench.contrib.interactiveInputContentProvider";
  }
  dispose() {
    this._registration.dispose();
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const result = this._modelService.createModel("", null, resource, false);
    return result;
  }
};

InteractiveInputContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService)
], InteractiveInputContentProvider);

function createEditor(resource, instantiationService) {
  const counter = /\/Interactive-(\d+)/.exec(resource.path);
  const inputBoxPath = counter && counter[1] ? `/InteractiveInput-${counter[1]}` : "InteractiveInput";
  const inputUri = URI.from({ scheme: Schemas.vscodeInteractiveInput, path: inputBoxPath });
  const editorInput = InteractiveEditorInput.create(instantiationService, resource, inputUri);
  return editorInput;
}

var InteractiveWindowWorkingCopyEditorHandler = class extends Disposable {
  constructor(_instantiationService, _workingCopyEditorService, _extensionService) {
    super();
    this._instantiationService = _instantiationService;
    this._workingCopyEditorService = _workingCopyEditorService;
    this._extensionService = _extensionService;
    this._installHandler();
  }
  static {
    this.ID = "workbench.contrib.interactiveWindowWorkingCopyEditorHandler";
  }
  handles(workingCopy) {
    const viewType = this._getViewType(workingCopy);
    return !!viewType && viewType === "interactive";
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return editor instanceof InteractiveEditorInput && isEqual2(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return createEditor(workingCopy.resource, this._instantiationService);
  }
  async _installHandler() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    this._register(this._workingCopyEditorService.registerHandler(this));
  }
  _getViewType(workingCopy) {
    return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId)?.viewType;
  }
};

InteractiveWindowWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService),
  __decorateParam(2, IExtensionService)
], InteractiveWindowWorkingCopyEditorHandler);

registerWorkbenchContribution2(InteractiveDocumentContribution.ID, InteractiveDocumentContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(InteractiveInputContentProvider.ID, InteractiveInputContentProvider, {
  editorTypeId: INTERACTIVE_WINDOW_EDITOR_ID
});

registerWorkbenchContribution2(InteractiveWindowWorkingCopyEditorHandler.ID, InteractiveWindowWorkingCopyEditorHandler, {
  editorTypeId: INTERACTIVE_WINDOW_EDITOR_ID
});

var InteractiveEditorSerializer = class {
  static {
    this.ID = InteractiveEditorInput.ID;
  }
  canSerialize(editor) {
    if (!(editor instanceof InteractiveEditorInput)) {
      return false;
    }
    return URI.isUri(editor.primary.resource) && URI.isUri(editor.inputResource);
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    return JSON.stringify({
      resource: input.primary.resource,
      inputResource: input.inputResource,
      name: input.getName(),
      language: input.language
    });
  }
  deserialize(instantiationService, raw) {
    const data = parse2(raw);
    if (!data) {
      return void 0;
    }
    const { resource, inputResource, name, language: language2 } = data;
    if (!URI.isUri(resource) || !URI.isUri(inputResource)) {
      return void 0;
    }
    const input = InteractiveEditorInput.create(instantiationService, resource, inputResource, name, language2);
    return input;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  InteractiveEditorSerializer.ID,
  InteractiveEditorSerializer
);

registerSingleton(IInteractiveHistoryService, InteractiveHistoryService, 1 /* Delayed */);

registerSingleton(IInteractiveDocumentService, InteractiveDocumentService, 1 /* Delayed */);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "_interactive.open",
      title: localize2(16218, "Open Interactive Window"),
      f1: false,
      category: interactiveWindowCategory,
      metadata: {
        description: localize(16219, null),
        args: [
          {
            name: "showOptions",
            description: "Show Options",
            schema: {
              type: "object",
              properties: {
                "viewColumn": {
                  type: "number",
                  default: -1
                },
                "preserveFocus": {
                  type: "boolean",
                  default: true
                }
              }
            }
          },
          {
            name: "resource",
            description: "Interactive resource Uri",
            isOptional: true
          },
          {
            name: "controllerId",
            description: "Notebook controller Id",
            isOptional: true
          },
          {
            name: "title",
            description: "Notebook editor title",
            isOptional: true
          }
        ]
      }
    });
  }
  async run(accessor, showOptions, resource, id2, title) {
    const editorService = accessor.get(IEditorService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const historyService = accessor.get(IInteractiveHistoryService);
    const kernelService = accessor.get(INotebookKernelService);
    const logService = accessor.get(ILogService);
    const configurationService = accessor.get(IConfigurationService);
    const group2 = columnToEditorGroup(editorGroupService, configurationService, typeof showOptions === "number" ? showOptions : showOptions?.viewColumn);
    const editorOptions2 = {
      activation: 3 /* PRESERVE */,
      preserveFocus: typeof showOptions !== "number" ? showOptions?.preserveFocus ?? false : false
    };
    if (resource && extname2(resource) === ".interactive") {
      logService.debug("Open interactive window from resource:", resource.toString());
      const resourceUri = URI.revive(resource);
      const editors = editorService.findEditors(resourceUri).filter((id3) => id3.editor instanceof InteractiveEditorInput && id3.editor.resource?.toString() === resourceUri.toString());
      if (editors.length) {
        logService.debug("Find existing interactive window:", resource.toString());
        const editorInput2 = editors[0].editor;
        const currentGroup = editors[0].groupId;
        const editor = await editorService.openEditor(editorInput2, editorOptions2, currentGroup);
        const editorControl2 = editor?.getControl();
        return {
          notebookUri: editorInput2.resource,
          inputUri: editorInput2.inputResource,
          notebookEditorId: editorControl2?.notebookEditor?.getId()
        };
      }
    }
    const existingNotebookDocument = /* @__PURE__ */ new Set();
    editorService.getEditors(1 /* SEQUENTIAL */).forEach((editor) => {
      if (editor.editor.resource) {
        existingNotebookDocument.add(editor.editor.resource.toString());
      }
    });
    let notebookUri = void 0;
    let inputUri = void 0;
    let counter = 1;
    do {
      notebookUri = URI.from({ scheme: Schemas.untitled, path: `/Interactive-${counter}.interactive` });
      inputUri = URI.from({ scheme: Schemas.vscodeInteractiveInput, path: `/InteractiveInput-${counter}` });
      counter++;
    } while (existingNotebookDocument.has(notebookUri.toString()));
    InteractiveEditorInput.setName(notebookUri, title);
    logService.debug("Open new interactive window:", notebookUri.toString(), inputUri.toString());
    if (id2) {
      const allKernels = kernelService.getMatchingKernel({ uri: notebookUri, notebookType: "interactive" }).all;
      const preferredKernel = allKernels.find((kernel) => kernel.id === id2);
      if (preferredKernel) {
        kernelService.preselectKernelForNotebook(preferredKernel, { uri: notebookUri, notebookType: "interactive" });
      }
    }
    historyService.clearHistory(notebookUri);
    const editorInput = { resource: notebookUri, options: editorOptions2 };
    const editorPane = await editorService.openEditor(editorInput, group2);
    const editorControl = editorPane?.getControl();
    logService.debug("New interactive window opened. Notebook editor id", editorControl?.notebookEditor?.getId());
    return { notebookUri, inputUri, notebookEditorId: editorControl?.notebookEditor?.getId() };
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.execute",
      title: localize2(16211, "Execute Code"),
      category: interactiveWindowCategory,
      keybinding: [{
        // when: NOTEBOOK_CELL_LIST_FOCUSED,
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive")
        ),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }, {
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive"),
          ContextKeyExpr.equals("config.interactiveWindow.executeWithShiftEnter", true)
        ),
        primary: 1024 /* Shift */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }, {
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive"),
          ContextKeyExpr.equals("config.interactiveWindow.executeWithShiftEnter", false)
        ),
        primary: 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }],
      menu: [
        {
          id: MenuId.InteractiveInputExecute
        }
      ],
      icon: executeIcon,
      f1: false,
      metadata: {
        description: "Execute the Contents of the Input Box",
        args: [
          {
            name: "resource",
            description: "Interactive resource Uri",
            isOptional: true
          }
        ]
      }
    });
  }
  async run(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const bulkEditService = accessor.get(IBulkEditService);
    const historyService = accessor.get(IInteractiveHistoryService);
    const notebookEditorService = accessor.get(INotebookEditorService);
    let editorControl;
    if (context2) {
      const resourceUri = URI.revive(context2);
      const editors = editorService.findEditors(resourceUri);
      for (const found of editors) {
        if (found.editor.typeId === InteractiveEditorInput.ID) {
          const editor = await editorService.openEditor(found.editor, found.groupId);
          editorControl = editor?.getControl();
          break;
        }
      }
    } else {
      editorControl = editorService.activeEditorPane?.getControl();
    }
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      const notebookDocument = editorControl.notebookEditor.textModel;
      const textModel = editorControl.activeCodeEditor?.getModel();
      const activeKernel = editorControl.notebookEditor.activeKernel;
      const language2 = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
      if (notebookDocument && textModel && editorControl.activeCodeEditor) {
        const index2 = notebookDocument.length;
        const value2 = textModel.getValue();
        if (isFalsyOrWhitespace(value2)) {
          return;
        }
        const ctrl = InlineChatController.get(editorControl.activeCodeEditor);
        if (ctrl) {
          ctrl.acceptSession();
        }
        historyService.replaceLast(notebookDocument.uri, value2);
        historyService.addToHistory(notebookDocument.uri, "");
        textModel.setValue("");
        const collapseState = editorControl.notebookEditor.notebookOptions.getDisplayOptions().interactiveWindowCollapseCodeCells === "fromEditor" ? {
          inputCollapsed: false,
          outputCollapsed: false
        } : void 0;
        await bulkEditService.apply([
          new ResourceNotebookCellEdit(
            notebookDocument.uri,
            {
              editType: 1 /* Replace */,
              index: index2,
              count: 0,
              cells: [{
                cellKind: 2 /* Code */,
                mime: void 0,
                language: language2,
                source: value2,
                outputs: [],
                metadata: {},
                collapseState
              }]
            }
          )
        ]);
        const range2 = { start: index2, end: index2 + 1 };
        editorControl.notebookEditor.revealCellRangeInView(range2);
        await editorControl.notebookEditor.executeNotebookCells(editorControl.notebookEditor.getCellsInRange({ start: index2, end: index2 + 1 }));
        const editor = notebookEditorService.getNotebookEditor(editorControl.notebookEditor.getId());
        if (editor) {
          editor.setSelections([range2]);
          editor.setFocus(range2);
        }
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.input.clear",
      title: localize2(16216, "Clear the interactive window input editor contents"),
      category: interactiveWindowCategory,
      f1: false
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      const notebookDocument = editorControl.notebookEditor.textModel;
      const editor = editorControl.activeCodeEditor;
      const range2 = editor?.getModel()?.getFullModelRange();
      if (notebookDocument && editor && range2) {
        editor.executeEdits("", [EditOperation.replace(range2, null)]);
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.history.previous",
      title: localize2(16214, "Previous value in history"),
      category: interactiveWindowCategory,
      f1: false,
      keybinding: {
        when: ContextKeyExpr.and(
          INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("bottom"),
          INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("none"),
          Context.Visible.toNegated()
        ),
        primary: 16 /* UpArrow */,
        weight: 200 /* WorkbenchContrib */
      },
      precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const historyService = accessor.get(IInteractiveHistoryService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      const notebookDocument = editorControl.notebookEditor.textModel;
      const textModel = editorControl.activeCodeEditor?.getModel();
      if (notebookDocument && textModel) {
        const previousValue = historyService.getPreviousValue(notebookDocument.uri);
        if (previousValue) {
          textModel.setValue(previousValue);
        }
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.history.next",
      title: localize2(16213, "Next value in history"),
      category: interactiveWindowCategory,
      f1: false,
      keybinding: {
        when: ContextKeyExpr.and(
          INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("top"),
          INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("none"),
          Context.Visible.toNegated()
        ),
        primary: 18 /* DownArrow */,
        weight: 200 /* WorkbenchContrib */
      },
      precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const historyService = accessor.get(IInteractiveHistoryService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      const notebookDocument = editorControl.notebookEditor.textModel;
      const textModel = editorControl.activeCodeEditor?.getModel();
      if (notebookDocument && textModel) {
        const nextValue = historyService.getNextValue(notebookDocument.uri);
        if (nextValue !== null) {
          textModel.setValue(nextValue);
        }
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.scrollToTop",
      title: localize(16221, null),
      keybinding: {
        when: ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive"),
        primary: 2048 /* CtrlCmd */ | 14 /* Home */,
        mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ },
        weight: 200 /* WorkbenchContrib */
      },
      category: interactiveWindowCategory
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      if (editorControl.notebookEditor.getLength() === 0) {
        return;
      }
      editorControl.notebookEditor.revealCellRangeInView({ start: 0, end: 1 });
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.scrollToBottom",
      title: localize(16220, null),
      keybinding: {
        when: ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive"),
        primary: 2048 /* CtrlCmd */ | 13 /* End */,
        mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
        weight: 200 /* WorkbenchContrib */
      },
      category: interactiveWindowCategory
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      if (editorControl.notebookEditor.getLength() === 0) {
        return;
      }
      const len = editorControl.notebookEditor.getLength();
      editorControl.notebookEditor.revealCellRangeInView({ start: len - 1, end: len });
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.input.focus",
      title: localize2(16217, "Focus Input Editor"),
      category: interactiveWindowCategory,
      menu: {
        id: MenuId.CommandPalette,
        when: InteractiveWindowOpen
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      editorService.activeEditorPane?.focus();
    } else {
      const openEditors = editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
      const interactiveWindow = Iterable.find(openEditors, (identifier2) => {
        return identifier2.editor.typeId === InteractiveEditorInput.ID;
      });
      if (interactiveWindow) {
        const editorInput = interactiveWindow.editor;
        const currentGroup = interactiveWindow.groupId;
        const editor = await editorService.openEditor(editorInput, currentGroup);
        const editorControl2 = editor?.getControl();
        if (editorControl2 && isReplEditorControl(editorControl2) && editorControl2.notebookEditor) {
          editorService.activeEditorPane?.focus();
        }
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "interactive.history.focus",
      title: localize2(16212, "Focus History"),
      category: interactiveWindowCategory,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.equals("activeEditor", "workbench.editor.interactive")
      },
      keybinding: [
        {
          // On mac, require that the cursor is at the top of the input, to avoid stealing cmd+up to move the cursor to the top
          when: ContextKeyExpr.and(
            INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("bottom"),
            INTERACTIVE_INPUT_CURSOR_BOUNDARY.notEqualsTo("none")
          ),
          weight: 200 /* WorkbenchContrib */ + 5,
          primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */
        },
        {
          when: ContextKeyExpr.or(IsWindowsContext, IsLinuxContext),
          weight: 200 /* WorkbenchContrib */,
          primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */
        }
      ],
      precondition: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED.negate())
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      editorControl.notebookEditor.focus();
    }
  }
});

registerColor("interactive.activeCodeBorder", {
  dark: ifDefinedThenElse(peekViewBorder, peekViewBorder, "#007acc"),
  light: ifDefinedThenElse(peekViewBorder, peekViewBorder, "#007acc"),
  hcDark: contrastBorder,
  hcLight: contrastBorder
}, localize(16210, null));

registerColor("interactive.inactiveCodeBorder", {
  //dark: theme.getColor(listInactiveSelectionBackground) ?? transparent(listInactiveSelectionBackground, 1),
  dark: ifDefinedThenElse(listInactiveSelectionBackground, listInactiveSelectionBackground, "#37373D"),
  light: ifDefinedThenElse(listInactiveSelectionBackground, listInactiveSelectionBackground, "#E4E6F1"),
  hcDark: PANEL_BORDER,
  hcLight: PANEL_BORDER
}, localize(16215, null));

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "interactiveWindow",
  order: 100,
  type: "object",
  "properties": {
    [ReplEditorSettings.interactiveWindowAlwaysScrollOnNewCell]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(16223, null)
    },
    [NotebookSetting.InteractiveWindowPromptToSave]: {
      type: "boolean",
      default: false,
      markdownDescription: localize(16225, null)
    },
    [ReplEditorSettings.executeWithShiftEnter]: {
      type: "boolean",
      default: false,
      markdownDescription: localize(16224, null),
      tags: ["replExecute"]
    },
    [ReplEditorSettings.showExecutionHint]: {
      type: "boolean",
      default: true,
      markdownDescription: localize(16226, null),
      tags: ["replExecute"]
    }
  }
});
export { createEditor, interactiveWindowCategory, InteractiveDocumentContribution, InteractiveInputContentProvider, InteractiveWindowWorkingCopyEditorHandler, InteractiveEditorSerializer };
