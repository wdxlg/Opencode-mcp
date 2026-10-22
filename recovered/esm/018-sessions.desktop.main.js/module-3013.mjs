// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/browser/customEditors.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorExtensions } from "./module-0926.mjs";
import { CustomEditorModelManager } from "./module-3010.mjs";
import { ContributedCustomEditors } from "./module-3012.mjs";
import { CONTEXT_ACTIVE_CUSTOM_EDITOR_ID, CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE, CustomEditorInfoCollection } from "./module-1115.mjs";
import { ActiveCustomEditorDiffCanToggleLayoutContext, ActiveCustomEditorTextDiffContext } from "./module-0950.mjs";
import { RedoCommand, UndoCommand } from "./module-0097.mjs";
import { CustomEditorInput } from "./module-1127.mjs";
import { CustomEditorDiffInput, CustomEditorSideBySideDiffInput } from "./module-1301.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { generateUuid } from "./module-0190.mjs";
import { coalesce } from "./module-0007.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IExtensionService } from "./module-0889.mjs";


// src/vs/workbench/contrib/customEditor/browser/customEditors.ts
var CustomEditorService = class extends Disposable {
  constructor(fileService, storageService, editorService, editorGroupService, instantiationService, uriIdentityService, editorResolverService, textResourceConfigurationService, extensionService) {
    super();
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.editorResolverService = editorResolverService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.extensionService = extensionService;
    this._untitledCounter = 0;
    this._editorResolverDisposables = this._register(new DisposableStore());
    this._editorCapabilities = /* @__PURE__ */ new Map();
    this._onDidChangeEditorTypes = this._register(new Emitter());
    this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
    this._fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
    this._models = new CustomEditorModelManager();
    this._contributedEditors = this._register(new ContributedCustomEditors(storageService));
    this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
    this._register(this._contributedEditors.onChange(() => {
      this.editorResolverService.bufferChangeEvents(this.registerContributionPoints.bind(this));
      this._onDidChangeEditorTypes.fire();
    }));
    const activeCustomEditorContextKeyProvider = {
      contextKey: CONTEXT_ACTIVE_CUSTOM_EDITOR_ID,
      getGroupContextKeyValue: (group2) => this.getActiveCustomEditorId(group2),
      onDidChange: this.onDidChangeEditorTypes
    };
    const customEditorIsEditableContextKeyProvider = {
      contextKey: CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE,
      getGroupContextKeyValue: (group2) => this.getCustomEditorIsEditable(group2),
      onDidChange: this.onDidChangeEditorTypes
    };
    const customEditorDiffCanToggleLayoutContextKeyProvider = {
      contextKey: ActiveCustomEditorDiffCanToggleLayoutContext,
      getGroupContextKeyValue: (group2) => this.getActiveCustomEditorDiffCanToggleLayout(group2),
      onDidChange: this.onDidChangeEditorTypes
    };
    const customEditorTextDiffContextKeyProvider = {
      contextKey: ActiveCustomEditorTextDiffContext,
      getGroupContextKeyValue: (group2) => this.getActiveCustomEditorTextDiff(group2),
      onDidChange: this.onDidChangeEditorTypes
    };
    this._register(this.editorGroupService.registerContextKeyProvider(activeCustomEditorContextKeyProvider));
    this._register(this.editorGroupService.registerContextKeyProvider(customEditorIsEditableContextKeyProvider));
    this._register(this.editorGroupService.registerContextKeyProvider(customEditorDiffCanToggleLayoutContextKeyProvider));
    this._register(this.editorGroupService.registerContextKeyProvider(customEditorTextDiffContextKeyProvider));
    this._register(this.textResourceConfigurationService.onDidChangeConfiguration((e4) => {
      void this.updateCustomDiffEditorsForDiffConfigurationChange(e4);
    }));
    this._register(fileService.onDidRunOperation((e4) => {
      if (e4.isOperation(2 /* MOVE */)) {
        this.handleMovedFileInOpenedFileEditors(e4.resource, this.uriIdentityService.asCanonicalUri(e4.target.resource));
      }
      if (e4.isOperation(1 /* DELETE */)) {
        this.handleDeletedFile(e4.resource);
      }
    }));
    const PRIORITY3 = 105;
    this._register(UndoCommand.addImplementation(PRIORITY3, "custom-editor", () => {
      return this.withActiveCustomEditor((editor) => editor.undo());
    }));
    this._register(RedoCommand.addImplementation(PRIORITY3, "custom-editor", () => {
      return this.withActiveCustomEditor((editor) => editor.redo());
    }));
  }
  getEditorTypes() {
    return [...this._contributedEditors];
  }
  withActiveCustomEditor(f) {
    const editor = this.getActiveCustomEditorUndoRedoInput();
    if (editor) {
      const result = f(editor);
      if (result) {
        return result;
      }
      return true;
    }
    return false;
  }
  getActiveCustomEditorUndoRedoInput() {
    const activeEditor = this.editorService.activeEditor;
    if (activeEditor instanceof CustomEditorInput || activeEditor instanceof CustomEditorDiffInput || activeEditor instanceof CustomEditorSideBySideDiffInput) {
      return activeEditor;
    }
    if (activeEditor instanceof DiffEditorInput && activeEditor.modified instanceof CustomEditorSideBySideDiffInput) {
      return activeEditor.modified;
    }
    return void 0;
  }
  registerContributionPoints() {
    this._editorResolverDisposables.clear();
    for (const contributedEditor of this._contributedEditors) {
      for (const globPattern of contributedEditor.selector) {
        if (!globPattern.filenamePattern) {
          continue;
        }
        this._editorResolverDisposables.add(this.editorResolverService.registerEditor(
          globPattern.filenamePattern,
          {
            id: contributedEditor.id,
            label: contributedEditor.displayName,
            detail: contributedEditor.providerDisplayName,
            priority: contributedEditor.priority
          },
          {
            singlePerResource: () => !(this.getCustomEditorCapabilities(contributedEditor.id)?.supportsMultipleEditorsPerDocument ?? false)
          },
          {
            createEditorInput: ({ resource, label: label3 }, group2) => {
              return { editor: CustomEditorInput.create(this.instantiationService, { resource, viewType: contributedEditor.id, webviewTitle: void 0, preferredName: label3, iconPath: void 0 }, group2.id) };
            },
            createUntitledEditorInput: ({ resource }, group2) => {
              return { editor: CustomEditorInput.create(this.instantiationService, { resource: resource ?? URI.from({ scheme: Schemas.untitled, authority: `Untitled-${this._untitledCounter++}` }), viewType: contributedEditor.id, webviewTitle: void 0, preferredName: void 0, iconPath: void 0 }, group2.id) };
            },
            createDiffEditorInput: async (diffEditorInput, group2) => {
              await this.extensionService.activateByEvent(`onCustomEditor:${contributedEditor.id}`);
              return { editor: this.createDiffEditorInput(diffEditorInput, contributedEditor, group2) };
            }
          }
        ));
      }
    }
  }
  createDiffEditorInput(editor, contributedEditor, group2) {
    const originalResource = assertReturnsDefined(editor.original.resource);
    const modifiedResource = assertReturnsDefined(editor.modified.resource);
    const diffEditorLayout = this.getDiffEditorLayout(contributedEditor, modifiedResource);
    if (diffEditorLayout === "inline" /* Inline */) {
      return CustomEditorDiffInput.create(this.instantiationService, {
        originalResource,
        modifiedResource,
        viewType: contributedEditor.id,
        label: editor.label,
        description: editor.description,
        iconPath: void 0
      }, group2);
    }
    if (diffEditorLayout === "sideBySide" /* SideBySide */) {
      const diffId = generateUuid();
      const originalOverride2 = CustomEditorSideBySideDiffInput.create(this.instantiationService, {
        originalResource,
        modifiedResource,
        viewType: contributedEditor.id,
        diffId,
        side: "original",
        label: editor.label,
        description: editor.description,
        iconPath: void 0
      }, group2);
      const modifiedOverride2 = CustomEditorSideBySideDiffInput.create(this.instantiationService, {
        originalResource,
        modifiedResource,
        viewType: contributedEditor.id,
        diffId,
        side: "modified",
        label: editor.label,
        description: editor.description,
        iconPath: void 0
      }, group2);
      return this.instantiationService.createInstance(DiffEditorInput, editor.label, editor.description, originalOverride2, modifiedOverride2, true);
    }
    const modifiedOverride = CustomEditorInput.create(this.instantiationService, { resource: modifiedResource, viewType: contributedEditor.id, webviewTitle: void 0, preferredName: void 0, iconPath: void 0 }, group2.id, { customClasses: "modified" });
    const originalOverride = CustomEditorInput.create(this.instantiationService, { resource: originalResource, viewType: contributedEditor.id, webviewTitle: void 0, preferredName: void 0, iconPath: void 0 }, group2.id, { customClasses: "original" });
    return this.instantiationService.createInstance(DiffEditorInput, editor.label, editor.description, originalOverride, modifiedOverride, true);
  }
  getDiffEditorLayout(contributedEditor, modifiedResource) {
    const capabilities = this.getCustomEditorCapabilities(contributedEditor.id);
    const supportsInlineDiff = capabilities?.supportsInlineDiff === true;
    const supportsSideBySideDiff = capabilities?.supportsSideBySideDiff === true;
    if (supportsInlineDiff && supportsSideBySideDiff) {
      return this.textResourceConfigurationService.getValue(modifiedResource, "diffEditor.renderSideBySide") ? "sideBySide" /* SideBySide */ : "inline" /* Inline */;
    }
    return supportsInlineDiff ? "inline" /* Inline */ : supportsSideBySideDiff ? "sideBySide" /* SideBySide */ : void 0;
  }
  async updateCustomDiffEditorsForDiffConfigurationChange(e4) {
    for (const group2 of this.editorGroupService.groups) {
      const replacements = [];
      for (const editor of group2.editors) {
        const diffInfo = this.getCustomEditorDiffInputInfo(editor);
        const contributedEditor = diffInfo ? this._contributedEditors.get(diffInfo.viewType) : void 0;
        if (!diffInfo || !contributedEditor || !e4.affectsConfiguration(diffInfo.modifiedResource, "diffEditor.renderSideBySide") || !this.getCustomEditorCapabilities(contributedEditor.id)?.supportsInlineDiff || !this.getCustomEditorCapabilities(contributedEditor.id)?.supportsSideBySideDiff || this.getDiffEditorLayout(contributedEditor, diffInfo.modifiedResource) === diffInfo.layout) {
          continue;
        }
        replacements.push({
          editor,
          replacement: {
            original: { resource: diffInfo.originalResource },
            modified: { resource: diffInfo.modifiedResource },
            label: editor.getName(),
            description: editor.getDescription(),
            options: {
              override: diffInfo.viewType,
              pinned: group2.isPinned(editor),
              sticky: group2.isSticky(editor),
              preserveFocus: group2.activeEditor !== editor
            }
          }
        });
      }
      if (replacements.length) {
        await this.editorService.replaceEditors(replacements, group2);
      }
    }
  }
  getCustomEditorDiffInputInfo(input) {
    if (input instanceof CustomEditorDiffInput) {
      return {
        viewType: input.viewType,
        originalResource: input.originalResource,
        modifiedResource: input.modifiedResource,
        layout: "inline" /* Inline */
      };
    }
    if (input instanceof DiffEditorInput && input.original instanceof CustomEditorSideBySideDiffInput && input.modified instanceof CustomEditorSideBySideDiffInput && input.original.side === "original" && input.modified.side === "modified" && input.original.viewType === input.modified.viewType && input.original.diffId === input.modified.diffId) {
      return {
        viewType: input.original.viewType,
        originalResource: input.original.originalResource,
        modifiedResource: input.original.modifiedResource,
        layout: "sideBySide" /* SideBySide */
      };
    }
    return void 0;
  }
  get models() {
    return this._models;
  }
  getCustomEditor(viewType) {
    return this._contributedEditors.get(viewType);
  }
  getContributedCustomEditors(resource) {
    return new CustomEditorInfoCollection(this._contributedEditors.getContributedEditors(resource));
  }
  getUserConfiguredCustomEditors(resource) {
    const resourceAssocations = this.editorResolverService.getAssociationsForResource(resource);
    return new CustomEditorInfoCollection(
      coalesce(resourceAssocations.map((association) => this._contributedEditors.get(association.viewType)))
    );
  }
  getAllCustomEditors(resource) {
    return new CustomEditorInfoCollection([
      ...this.getUserConfiguredCustomEditors(resource).allEditors,
      ...this.getContributedCustomEditors(resource).allEditors
    ]);
  }
  registerCustomEditorCapabilities(viewType, options3) {
    if (this._editorCapabilities.has(viewType)) {
      throw new Error(`Capabilities for ${viewType} already set`);
    }
    this._editorCapabilities.set(viewType, options3);
    this._onDidChangeEditorTypes.fire();
    return toDisposable(() => {
      this._editorCapabilities.delete(viewType);
      this._onDidChangeEditorTypes.fire();
    });
  }
  getCustomEditorCapabilities(viewType) {
    return this._editorCapabilities.get(viewType);
  }
  getActiveCustomEditorId(group2) {
    const activeEditorPane = group2.activeEditorPane;
    const input = activeEditorPane?.input;
    const diffInfo = this.getCustomEditorDiffInputInfo(input);
    if (diffInfo) {
      return diffInfo.viewType;
    }
    return input instanceof CustomEditorInput && input.resource ? input.viewType : "";
  }
  getActiveCustomEditorDiffCanToggleLayout(group2) {
    const diffInfo = this.getCustomEditorDiffInputInfo(group2.activeEditorPane?.input);
    const capabilities = diffInfo ? this.getCustomEditorCapabilities(diffInfo.viewType) : void 0;
    return capabilities?.supportsInlineDiff === true && capabilities.supportsSideBySideDiff === true;
  }
  getActiveCustomEditorTextDiff(group2) {
    const diffInfo = this.getCustomEditorDiffInputInfo(group2.activeEditorPane?.input);
    return !!diffInfo && this.getCustomEditorCapabilities(diffInfo.viewType)?.isTextEditor === true;
  }
  getCustomEditorIsEditable(group2) {
    const activeEditorPane = group2.activeEditorPane;
    const resource = activeEditorPane?.input?.resource;
    if (!resource) {
      return false;
    }
    return activeEditorPane?.input instanceof CustomEditorInput;
  }
  handleDeletedFile(resource) {
    this._models.disposeAllModelsForResource(resource);
  }
  async handleMovedFileInOpenedFileEditors(oldResource, newResource) {
    if (extname2(oldResource).toLowerCase() === extname2(newResource).toLowerCase()) {
      return;
    }
    const possibleEditors = this.getAllCustomEditors(newResource);
    if (!possibleEditors.allEditors.some((editor) => editor.priority.editor !== "option" /* option */)) {
      return;
    }
    const editorsToReplace = /* @__PURE__ */ new Map();
    for (const group2 of this.editorGroupService.groups) {
      for (const editor of group2.editors) {
        if (this._fileEditorFactory.isFileEditor(editor) && !(editor instanceof CustomEditorInput) && isEqual2(editor.resource, newResource)) {
          let entry = editorsToReplace.get(group2.id);
          if (!entry) {
            entry = [];
            editorsToReplace.set(group2.id, entry);
          }
          entry.push(editor);
        }
      }
    }
    if (!editorsToReplace.size) {
      return;
    }
    for (const [group2, entries2] of editorsToReplace) {
      this.editorService.replaceEditors(entries2.map((editor) => {
        let replacement;
        if (possibleEditors.defaultEditor) {
          const viewType = possibleEditors.defaultEditor.id;
          replacement = CustomEditorInput.create(this.instantiationService, { resource: newResource, viewType, webviewTitle: void 0, preferredName: void 0, iconPath: void 0 }, group2);
        } else {
          replacement = { resource: newResource, options: { override: DEFAULT_EDITOR_ASSOCIATION.id } };
        }
        return {
          editor,
          replacement,
          options: {
            preserveFocus: true
          }
        };
      }), group2);
    }
  }
};

CustomEditorService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IEditorResolverService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, IExtensionService)
], CustomEditorService);
export { CustomEditorService };
