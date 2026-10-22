// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/replNotebook/browser/repl.contribution.ts
import { ReplEditorInput } from "./module-2899.mjs";
import { assertType } from "./module-0010.mjs";
import { parse2 } from "./module-0265.mjs";
import { URI } from "./module-0032.mjs";
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { ReplEditor, isReplEditorControl } from "./module-2900.mjs";
import { NotebookSetting, NotebookWorkingCopyTypeIdentifier, REPL_EDITOR_ID } from "./module-0911.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { IWorkingCopyEditorService } from "./module-1395.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { ReplEditorHistoryAccessibilityHelp, ReplEditorInputAccessibilityHelp } from "./module-2907.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { IS_COMPOSITE_NOTEBOOK, MOST_RECENT_REPL_EDITOR, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_EDITOR_FOCUSED } from "./module-1844.mjs";
import { KeyChord } from "./module-0019.mjs";
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from "./module-1845.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IEditorService } from "./module-0935.mjs";
import { executeIcon } from "./module-1846.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { IInteractiveHistoryService } from "./module-1129.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { InlineChatController } from "./module-2372.mjs";
import { ResourceNotebookCellEdit } from "./module-0943.mjs";
import { ReplEditorAccessibleView } from "./module-2906.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { REPL_VIEW_ID } from "./module-1058.mjs";
import { getReplView } from "./module-2905.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/replNotebook/browser/repl.contribution.ts
var ReplEditorSerializer = class {
  canSerialize(input) {
    return input.typeId === ReplEditorInput.ID;
  }
  serialize(input) {
    assertType(input instanceof ReplEditorInput);
    const data = {
      resource: input.resource,
      preferredResource: input.preferredResource,
      viewType: input.viewType,
      options: input.options,
      label: input.getName()
    };
    return JSON.stringify(data);
  }
  deserialize(instantiationService, raw) {
    const data = parse2(raw);
    if (!data) {
      return void 0;
    }
    const { resource, viewType } = data;
    if (!data || !URI.isUri(resource) || typeof viewType !== "string") {
      return void 0;
    }
    const input = instantiationService.createInstance(ReplEditorInput, resource, data.label);
    return input;
  }
};

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    ReplEditor,
    REPL_EDITOR_ID,
    "REPL Editor"
  ),
  [
    new SyncDescriptor(ReplEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  ReplEditorInput.ID,
  ReplEditorSerializer
);

var ReplDocumentContribution = class extends Disposable {
  constructor(notebookService, editorResolverService, notebookEditorModelResolverService, instantiationService, configurationService) {
    super();
    this.notebookEditorModelResolverService = notebookEditorModelResolverService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.editorInputCache = new ResourceMap();
    editorResolverService.registerEditor(
      // don't match anything, we don't need to support re-opening files as REPL editor at this point
      ` `,
      {
        id: "repl",
        label: "repl Editor",
        priority: "option" /* option */
      },
      {
        // We want to support all notebook types which could have any file extension,
        // so we just check if the resource corresponds to a notebook
        canSupportResource: (uri4) => notebookService.getNotebookTextModel(uri4) !== void 0,
        singlePerResource: true
      },
      {
        createUntitledEditorInput: async ({ resource, options: options3 }) => {
          if (resource) {
            const editor2 = this.editorInputCache.get(resource);
            if (editor2 && !editor2.isDisposed()) {
              return { editor: editor2, options: options3 };
            } else if (editor2) {
              this.editorInputCache.delete(resource);
            }
          }
          const scratchpad = this.configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
          const ref = await this.notebookEditorModelResolverService.resolve({ untitledResource: resource }, "jupyter-notebook", { scratchpad, viewType: "repl" });
          const notebookUri = ref.object.notebook.uri;
          Event2.once(ref.object.notebook.onWillDispose)(() => {
            ref.dispose();
          });
          const label3 = options3?.label ?? void 0;
          const editor = this.instantiationService.createInstance(ReplEditorInput, notebookUri, label3);
          this.editorInputCache.set(notebookUri, editor);
          Event2.once(editor.onWillDispose)(() => this.editorInputCache.delete(notebookUri));
          return { editor, options: options3 };
        },
        createEditorInput: async ({ resource, options: options3 }) => {
          if (this.editorInputCache.has(resource)) {
            return { editor: this.editorInputCache.get(resource), options: options3 };
          }
          const label3 = options3?.label ?? void 0;
          const editor = this.instantiationService.createInstance(ReplEditorInput, resource, label3);
          this.editorInputCache.set(resource, editor);
          Event2.once(editor.onWillDispose)(() => this.editorInputCache.delete(resource));
          return { editor, options: options3 };
        }
      }
    );
  }
  static {
    this.ID = "workbench.contrib.replDocument";
  }
};

ReplDocumentContribution = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IEditorResolverService),
  __decorateParam(2, INotebookEditorModelResolverService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IConfigurationService)
], ReplDocumentContribution);

var ReplWindowWorkingCopyEditorHandler = class extends Disposable {
  constructor(instantiationService, workingCopyEditorService, extensionService, notebookService) {
    super();
    this.instantiationService = instantiationService;
    this.workingCopyEditorService = workingCopyEditorService;
    this.extensionService = extensionService;
    this.notebookService = notebookService;
    this._installHandler();
  }
  static {
    this.ID = "workbench.contrib.replWorkingCopyEditorHandler";
  }
  async handles(workingCopy) {
    const notebookType = this._getNotebookType(workingCopy);
    if (!notebookType) {
      return false;
    }
    return !!notebookType && notebookType.viewType === "repl" && await this.notebookService.canResolve(notebookType.notebookType);
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return editor instanceof ReplEditorInput && isEqual2(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return this.instantiationService.createInstance(ReplEditorInput, workingCopy.resource, void 0);
  }
  async _installHandler() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    this._register(this.workingCopyEditorService.registerHandler(this));
  }
  _getNotebookType(workingCopy) {
    return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
  }
};

ReplWindowWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, INotebookService)
], ReplWindowWorkingCopyEditorHandler);

registerWorkbenchContribution2(ReplWindowWorkingCopyEditorHandler.ID, ReplWindowWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ReplDocumentContribution.ID, ReplDocumentContribution, WorkbenchPhase.BlockRestore);

AccessibleViewRegistry.register(new ReplEditorInputAccessibilityHelp());

AccessibleViewRegistry.register(new ReplEditorHistoryAccessibilityHelp());

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "repl.focusLastItemExecuted",
      title: localize2(18697, "Focus Most Recent REPL Execution"),
      category: "REPL",
      menu: {
        id: MenuId.CommandPalette,
        when: MOST_RECENT_REPL_EDITOR
      },
      keybinding: [{
        primary: KeyChord(512 /* Alt */ | 13 /* End */, 512 /* Alt */ | 13 /* End */),
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT,
        when: ContextKeyExpr.or(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED.negate())
      }],
      precondition: MOST_RECENT_REPL_EDITOR
    });
  }
  async run(accessor, context2) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    const contextKeyService = accessor.get(IContextKeyService);
    let notebookEditor;
    if (editorControl && isReplEditorControl(editorControl)) {
      notebookEditor = editorControl.notebookEditor;
    } else {
      const uriString = MOST_RECENT_REPL_EDITOR.getValue(contextKeyService);
      const uri4 = uriString ? URI.parse(uriString) : void 0;
      if (!uri4) {
        return;
      }
      const replEditor = editorService.findEditors(uri4)[0];
      if (replEditor) {
        const editor = await editorService.openEditor(replEditor.editor, replEditor.groupId);
        const editorControl2 = editor?.getControl();
        if (editorControl2 && isReplEditorControl(editorControl2)) {
          notebookEditor = editorControl2.notebookEditor;
        }
      }
    }
    const viewModel = notebookEditor?.getViewModel();
    if (notebookEditor && viewModel) {
      const lastCellIndex = viewModel.length - 1;
      if (lastCellIndex >= 0) {
        const cell = viewModel.viewCells[lastCellIndex];
        notebookEditor.focusNotebookCell(cell, "container");
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "repl.input.focus",
      title: localize2(18698, "Focus Input Editor"),
      category: "REPL",
      menu: {
        id: MenuId.CommandPalette,
        when: MOST_RECENT_REPL_EDITOR
      },
      keybinding: [{
        when: ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED),
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT,
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
      }, {
        when: ContextKeyExpr.and(MOST_RECENT_REPL_EDITOR),
        weight: 200 /* WorkbenchContrib */ + 5,
        primary: KeyChord(512 /* Alt */ | 14 /* Home */, 512 /* Alt */ | 14 /* Home */)
      }]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const editorControl = editorService.activeEditorPane?.getControl();
    const contextKeyService = accessor.get(IContextKeyService);
    if (editorControl && isReplEditorControl(editorControl) && editorControl.notebookEditor) {
      editorService.activeEditorPane?.focus();
    } else {
      const uriString = MOST_RECENT_REPL_EDITOR.getValue(contextKeyService);
      const uri4 = uriString ? URI.parse(uriString) : void 0;
      if (!uri4) {
        return;
      }
      const replEditor = editorService.findEditors(uri4)[0];
      if (replEditor) {
        await editorService.openEditor({ resource: uri4, options: { preserveFocus: false } }, replEditor.groupId);
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "repl.execute",
      title: localize2(18696, "Execute REPL input"),
      category: "REPL",
      keybinding: [{
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.repl"),
          NOTEBOOK_CELL_LIST_FOCUSED.negate()
        ),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }, {
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.repl"),
          ContextKeyExpr.equals("config.interactiveWindow.executeWithShiftEnter", true),
          NOTEBOOK_CELL_LIST_FOCUSED.negate()
        ),
        primary: 1024 /* Shift */ | 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }, {
        when: ContextKeyExpr.and(
          IS_COMPOSITE_NOTEBOOK,
          ContextKeyExpr.equals("activeEditor", "workbench.editor.repl"),
          ContextKeyExpr.equals("config.interactiveWindow.executeWithShiftEnter", false),
          NOTEBOOK_CELL_LIST_FOCUSED.negate()
        ),
        primary: 3 /* Enter */,
        weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
      }],
      menu: [
        {
          id: MenuId.ReplInputExecute
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
        if (found.editor.typeId === ReplEditorInput.ID) {
          const editor = await editorService.openEditor(found.editor, found.groupId);
          editorControl = editor?.getControl();
          break;
        }
      }
    } else {
      editorControl = editorService.activeEditorPane?.getControl();
    }
    if (isReplEditorControl(editorControl)) {
      executeReplInput(bulkEditService, historyService, notebookEditorService, editorControl);
    }
  }
});

async function executeReplInput(bulkEditService, historyService, notebookEditorService, editorControl) {
  if (editorControl && editorControl.notebookEditor && editorControl.activeCodeEditor) {
    const notebookDocument = editorControl.notebookEditor.textModel;
    const textModel = editorControl.activeCodeEditor.getModel();
    const activeKernel = editorControl.notebookEditor.activeKernel;
    const language2 = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
    if (notebookDocument && textModel) {
      const index2 = notebookDocument.length - 1;
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
      notebookDocument.cells[index2].resetTextBuffer(textModel.getTextBuffer());
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

AccessibleViewRegistry.register(new ReplEditorAccessibleView());

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.find.replInputFocus",
  weight: 200 /* WorkbenchContrib */ + 1,
  when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
  primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 36 /* KeyF */,
  secondary: [61 /* F3 */],
  handler: (accessor) => {
    getReplView(accessor.get(IViewsService))?.openFind();
  }
});
export { executeReplInput, ReplEditorSerializer, ReplDocumentContribution, ReplWindowWorkingCopyEditorHandler };
