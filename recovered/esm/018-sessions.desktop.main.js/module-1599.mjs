// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/editor/browser/editorService.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { EditorsObserver } from "./module-1597.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { EditorResourceAccessor, isEditorInput, isEditorInputWithOptions, isEditorInputWithOptionsAndGroup, isResourceDiffEditorInput, isResourceEditorInput, isResourceMergeEditorInput } from "./module-0926.mjs";
import { indexOfPath } from "./module-0031.mjs";
import { joinPath } from "./module-0034.mjs";
import { FileChangesEvent, IFileService } from "./module-0269.mjs";
import { Promises, timeout } from "./module-0036.mjs";
import { SideBySideEditorInput } from "./module-1096.mjs";
import { isCodeEditor, isCompositeEditor, isDiffEditor } from "./module-0223.mjs";
import { SideBySideEditor2 } from "./module-1524.mjs";
import { IEditorService, isPreferredGroup } from "./module-0935.mjs";
import { findGroup } from "./module-1598.mjs";
import { URI } from "./module-0032.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { isUndefined } from "./module-0010.mjs";
import { IEditorGroupsService, isEditorReplacement } from "./module-0934.mjs";
import { EditorInput } from "./module-0929.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IHostService } from "./module-1118.mjs";
import { ITextEditorService } from "./module-1553.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/services/editor/browser/editorService.ts
var EditorService = class extends Disposable {
  constructor(editorGroupsContainer, editorGroupService, instantiationService, fileService, configurationService, contextService, uriIdentityService, editorResolverService, workspaceTrustRequestService, hostService, textEditorService) {
    super();
    this.editorGroupService = editorGroupService;
    this.instantiationService = instantiationService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.uriIdentityService = uriIdentityService;
    this.editorResolverService = editorResolverService;
    this.workspaceTrustRequestService = workspaceTrustRequestService;
    this.hostService = hostService;
    this.textEditorService = textEditorService;
    //#region events
    this._onDidActiveEditorChange = this._register(new Emitter());
    this.onDidActiveEditorChange = this._onDidActiveEditorChange.event;
    this._onDidVisibleEditorsChange = this._register(new Emitter());
    this.onDidVisibleEditorsChange = this._onDidVisibleEditorsChange.event;
    this._onDidEditorsChange = this._register(new Emitter());
    this.onDidEditorsChange = this._onDidEditorsChange.event;
    this._onWillOpenEditor = this._register(new Emitter());
    this.onWillOpenEditor = this._onWillOpenEditor.event;
    this._onDidCloseEditor = this._register(new Emitter());
    this.onDidCloseEditor = this._onDidCloseEditor.event;
    this._onDidOpenEditorFail = this._register(new Emitter());
    this.onDidOpenEditorFail = this._onDidOpenEditorFail.event;
    this._onDidMostRecentlyActiveEditorsChange = this._register(new Emitter());
    this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
    //#region Editor & group event handlers
    this.lastActiveEditor = void 0;
    //#endregion
    //#region Visible Editors Change: Install file watchers for out of workspace resources that became visible
    this.activeOutOfWorkspaceWatchers = new ResourceMap();
    this.closeOnFileDelete = false;
    this.editorGroupsContainer = editorGroupsContainer ?? editorGroupService;
    this.isScoped = editorGroupsContainer !== void 0;
    this.editorsObserver = this._register(this.instantiationService.createInstance(EditorsObserver, this.editorGroupsContainer));
    this.onConfigurationUpdated();
    this.registerListeners();
  }
  createScoped(editorGroupsContainer, disposables) {
    return disposables.add(new EditorService(editorGroupsContainer, this.editorGroupService, this.instantiationService, this.fileService, this.configurationService, this.contextService, this.uriIdentityService, this.editorResolverService, this.workspaceTrustRequestService, this.hostService, this.textEditorService));
  }
  registerListeners() {
    if (this.editorGroupsContainer === this.editorGroupService.mainPart || this.editorGroupsContainer === this.editorGroupService) {
      this.editorGroupService.whenReady.then(() => this.onEditorGroupsReady());
    } else {
      this.onEditorGroupsReady();
    }
    this._register(this.editorGroupsContainer.onDidChangeActiveGroup((group2) => this.handleActiveEditorChange(group2)));
    this._register(this.editorGroupsContainer.onDidAddGroup((group2) => this.registerGroupListeners(group2)));
    this._register(this.editorsObserver.onDidMostRecentlyActiveEditorsChange(() => this._onDidMostRecentlyActiveEditorsChange.fire()));
    this._register(this.onDidVisibleEditorsChange(() => this.handleVisibleEditorsChange()));
    if (!this.isScoped) {
      this._register(this.fileService.onDidRunOperation((e4) => this.onDidRunFileOperation(e4)));
      this._register(this.fileService.onDidFilesChange((e4) => this.onDidFilesChange(e4)));
    }
    this._register(this.configurationService.onDidChangeConfiguration((e4) => this.onConfigurationUpdated(e4)));
  }
  onEditorGroupsReady() {
    for (const group2 of this.editorGroupsContainer.groups) {
      this.registerGroupListeners(group2);
    }
    if (this.activeEditor) {
      this.doHandleActiveEditorChangeEvent();
      this._onDidVisibleEditorsChange.fire({ isExplicit: false });
    }
  }
  handleActiveEditorChange(group2) {
    if (group2 !== this.editorGroupsContainer.activeGroup) {
      return;
    }
    if (!this.lastActiveEditor && !group2.activeEditor) {
      return;
    }
    this.doHandleActiveEditorChangeEvent();
  }
  doHandleActiveEditorChangeEvent() {
    const activeGroup = this.editorGroupsContainer.activeGroup;
    this.lastActiveEditor = activeGroup.activeEditor ?? void 0;
    this._onDidActiveEditorChange.fire();
  }
  registerGroupListeners(group2) {
    const groupDisposables = new DisposableStore();
    groupDisposables.add(group2.onDidModelChange((e4) => {
      this._onDidEditorsChange.fire({ groupId: group2.id, event: e4 });
    }));
    groupDisposables.add(group2.onDidActiveEditorChange((e4) => {
      this.handleActiveEditorChange(group2);
      this._onDidVisibleEditorsChange.fire({
        isExplicit: e4.isExplicit !== false
        /* treat undefined as explicit */
      });
    }));
    groupDisposables.add(group2.onWillOpenEditor((e4) => {
      this._onWillOpenEditor.fire(e4);
    }));
    groupDisposables.add(group2.onDidCloseEditor((e4) => {
      this._onDidCloseEditor.fire(e4);
    }));
    groupDisposables.add(group2.onDidOpenEditorFail((editor) => {
      this._onDidOpenEditorFail.fire({ editor, groupId: group2.id });
    }));
    Event2.once(group2.onWillDispose)(() => {
      dispose(groupDisposables);
    });
  }
  handleVisibleEditorsChange() {
    const visibleOutOfWorkspaceResources = new ResourceSet();
    for (const editor of this.visibleEditors) {
      const resources = distinct(coalesce([
        EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ }),
        EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 2 /* SECONDARY */ })
      ]), (resource) => resource.toString());
      for (const resource of resources) {
        if (this.fileService.hasProvider(resource) && !this.contextService.isInsideWorkspace(resource)) {
          visibleOutOfWorkspaceResources.add(resource);
        }
      }
    }
    for (const resource of this.activeOutOfWorkspaceWatchers.keys()) {
      if (!visibleOutOfWorkspaceResources.has(resource)) {
        dispose(this.activeOutOfWorkspaceWatchers.get(resource));
        this.activeOutOfWorkspaceWatchers.delete(resource);
      }
    }
    for (const resource of visibleOutOfWorkspaceResources.keys()) {
      if (!this.activeOutOfWorkspaceWatchers.get(resource)) {
        const disposable = this.fileService.watch(resource);
        this.activeOutOfWorkspaceWatchers.set(resource, disposable);
      }
    }
  }
  //#endregion
  //#region File Changes: Move & Deletes to move or close opend editors
  async onDidRunFileOperation(e4) {
    if (e4.isOperation(2 /* MOVE */)) {
      this.handleMovedFile(e4.resource, e4.target.resource);
    }
    if (e4.isOperation(1 /* DELETE */) || e4.isOperation(2 /* MOVE */)) {
      this.handleDeletedFile(e4.resource, false, e4.target ? e4.target.resource : void 0);
    }
  }
  onDidFilesChange(e4) {
    if (e4.gotDeleted()) {
      this.handleDeletedFile(e4, true);
    }
  }
  async handleMovedFile(source, target) {
    for (const group2 of this.editorGroupsContainer.groups) {
      const replacements = [];
      for (const editor of group2.editors) {
        const resource = EditorResourceAccessor.getOriginalUri(editor) ?? editor.resource;
        if (!resource || !this.uriIdentityService.extUri.isEqualOrParent(resource, source)) {
          continue;
        }
        let targetResource;
        if (this.uriIdentityService.extUri.isEqual(source, resource)) {
          targetResource = target;
        } else {
          const index2 = indexOfPath(resource.path, source.path, this.uriIdentityService.extUri.ignorePathCasing(resource));
          targetResource = joinPath(target, resource.path.substr(index2 + source.path.length + 1));
        }
        const moveResult = await editor.rename(group2.id, targetResource);
        if (!moveResult) {
          return;
        }
        const optionOverrides = {
          preserveFocus: true,
          pinned: group2.isPinned(editor),
          sticky: group2.isSticky(editor),
          index: group2.getIndexOfEditor(editor),
          inactive: !group2.isActive(editor)
        };
        if (isEditorInput(moveResult.editor)) {
          replacements.push({
            editor,
            replacement: moveResult.editor,
            options: {
              ...moveResult.options,
              ...optionOverrides
            }
          });
        } else {
          replacements.push({
            editor,
            replacement: {
              ...moveResult.editor,
              options: {
                ...moveResult.editor.options,
                ...optionOverrides
              }
            }
          });
        }
      }
      if (replacements.length) {
        this.replaceEditors(replacements, group2);
      }
    }
  }
  onConfigurationUpdated(e4) {
    if (e4 && !e4.affectsConfiguration("workbench.editor.closeOnFileDelete")) {
      return;
    }
    const configuration2 = this.configurationService.getValue();
    if (typeof configuration2.workbench?.editor?.closeOnFileDelete === "boolean") {
      this.closeOnFileDelete = configuration2.workbench.editor.closeOnFileDelete;
    } else {
      this.closeOnFileDelete = false;
    }
  }
  handleDeletedFile(arg1, isExternal, movedTo) {
    for (const editor of this.getAllNonDirtyEditors({ includeUntitled: false, supportSideBySide: true })) {
      (async () => {
        const resource = EditorResourceAccessor.getOriginalUri(editor) ?? editor.resource;
        if (!resource) {
          return;
        }
        if (this.closeOnFileDelete || !isExternal) {
          if (movedTo && this.uriIdentityService.extUri.isEqualOrParent(resource, movedTo)) {
            return;
          }
          let matches2 = false;
          if (arg1 instanceof FileChangesEvent) {
            matches2 = arg1.contains(resource, 2 /* DELETED */);
          } else {
            matches2 = this.uriIdentityService.extUri.isEqualOrParent(resource, arg1);
          }
          if (!matches2) {
            return;
          }
          let exists = false;
          if (isExternal && this.fileService.hasProvider(resource)) {
            await timeout(100);
            exists = await this.fileService.exists(resource);
          }
          if (!exists && !editor.isDisposed()) {
            editor.dispose();
          }
        }
      })();
    }
  }
  getAllNonDirtyEditors(options3) {
    const editors = [];
    function conditionallyAddEditor(editor) {
      if (editor.hasCapability(4 /* Untitled */) && !options3.includeUntitled) {
        return;
      }
      if (editor.isDirty()) {
        return;
      }
      editors.push(editor);
    }
    for (const editor of this.editors) {
      if (options3.supportSideBySide && editor instanceof SideBySideEditorInput) {
        conditionallyAddEditor(editor.primary);
        conditionallyAddEditor(editor.secondary);
      } else {
        conditionallyAddEditor(editor);
      }
    }
    return editors;
  }
  get activeEditorPane() {
    return this.editorGroupsContainer.activeGroup?.activeEditorPane;
  }
  get activeTextEditorControl() {
    const activeEditorPane = this.activeEditorPane;
    if (activeEditorPane) {
      const activeControl = activeEditorPane.getControl();
      if (isCodeEditor(activeControl) || isDiffEditor(activeControl)) {
        return activeControl;
      }
      if (isCompositeEditor(activeControl) && isCodeEditor(activeControl.activeCodeEditor)) {
        return activeControl.activeCodeEditor;
      }
    }
    return void 0;
  }
  get activeTextEditorLanguageId() {
    let activeCodeEditor = void 0;
    const activeTextEditorControl = this.activeTextEditorControl;
    if (isDiffEditor(activeTextEditorControl)) {
      activeCodeEditor = activeTextEditorControl.getModifiedEditor();
    } else {
      activeCodeEditor = activeTextEditorControl;
    }
    return activeCodeEditor?.getModel()?.getLanguageId();
  }
  get count() {
    return this.editorsObserver.count;
  }
  get editors() {
    return this.getEditors(1 /* SEQUENTIAL */).map(({ editor }) => editor);
  }
  getEditors(order, options3) {
    switch (order) {
      // MRU
      case 0 /* MOST_RECENTLY_ACTIVE */:
        if (options3?.excludeSticky) {
          return this.editorsObserver.editors.filter(({ groupId, editor }) => !this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor));
        }
        return this.editorsObserver.editors;
      // Sequential
      case 1 /* SEQUENTIAL */: {
        const editors = [];
        for (const group2 of this.editorGroupsContainer.getGroups(2 /* GRID_APPEARANCE */)) {
          editors.push(...group2.getEditors(1 /* SEQUENTIAL */, options3).map((editor) => ({ editor, groupId: group2.id })));
        }
        return editors;
      }
    }
  }
  get activeEditor() {
    const activeGroup = this.editorGroupsContainer.activeGroup;
    return activeGroup ? activeGroup.activeEditor ?? void 0 : void 0;
  }
  get visibleEditorPanes() {
    return coalesce(this.editorGroupsContainer.groups.map((group2) => group2.activeEditorPane));
  }
  get visibleTextEditorControls() {
    return this.doGetVisibleTextEditorControls(this.visibleEditorPanes);
  }
  doGetVisibleTextEditorControls(editorPanes) {
    const visibleTextEditorControls = [];
    for (const editorPane of editorPanes) {
      const controls = [];
      if (editorPane instanceof SideBySideEditor2) {
        controls.push(editorPane.getPrimaryEditorPane()?.getControl());
        controls.push(editorPane.getSecondaryEditorPane()?.getControl());
      } else {
        controls.push(editorPane.getControl());
      }
      for (const control of controls) {
        if (isCodeEditor(control) || isDiffEditor(control)) {
          visibleTextEditorControls.push(control);
        }
      }
    }
    return visibleTextEditorControls;
  }
  getVisibleTextEditorControls(order) {
    return this.doGetVisibleTextEditorControls(coalesce(this.editorGroupsContainer.getGroups(order === 1 /* SEQUENTIAL */ ? 2 /* GRID_APPEARANCE */ : 1 /* MOST_RECENTLY_ACTIVE */).map((group2) => group2.activeEditorPane)));
  }
  get visibleEditors() {
    return coalesce(this.editorGroupsContainer.groups.map((group2) => group2.activeEditor));
  }
  async openEditor(editor, optionsOrPreferredGroup, preferredGroup) {
    let typedEditor = void 0;
    let options3 = isEditorInput(editor) ? optionsOrPreferredGroup : editor.options;
    let group2 = void 0;
    if (isPreferredGroup(optionsOrPreferredGroup)) {
      preferredGroup = optionsOrPreferredGroup;
    }
    if (!isEditorInput(editor)) {
      const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
      if (resolvedEditor === 1 /* ABORT */) {
        return;
      }
      if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
        typedEditor = resolvedEditor.editor;
        options3 = resolvedEditor.options;
        group2 = resolvedEditor.group;
      }
    }
    if (!typedEditor) {
      typedEditor = isEditorInput(editor) ? editor : await this.textEditorService.resolveTextEditor(editor);
    }
    if (!group2) {
      let activation = void 0;
      const findGroupResult = this.instantiationService.invokeFunction(findGroup, { editor: typedEditor, options: options3 }, preferredGroup);
      if (findGroupResult instanceof Promise) {
        [group2, activation] = await findGroupResult;
      } else {
        [group2, activation] = findGroupResult;
      }
      if (activation) {
        options3 = { ...options3, activation };
      }
    }
    if (options3?.preserveFocus && this.editorGroupService.activeModalEditorPart?.groups.some((modalGroup) => modalGroup.id === group2.id) && this.editorGroupService.activeModalEditorPart.count === 1 && this.editorGroupService.activeModalEditorPart.groups[0].isEmpty) {
      options3 = { ...options3, preserveFocus: false };
    }
    return group2.openEditor(typedEditor, options3);
  }
  async openEditors(editors, preferredGroup, options3) {
    if (options3?.validateTrust) {
      const editorsTrusted = await this.handleWorkspaceTrust(editors);
      if (!editorsTrusted) {
        return [];
      }
    }
    const mapGroupToTypedEditors = /* @__PURE__ */ new Map();
    for (const editor of editors) {
      let typedEditor = void 0;
      let group2 = void 0;
      if (!isEditorInputWithOptions(editor)) {
        const resolvedEditor = await this.editorResolverService.resolveEditor(editor, preferredGroup);
        if (resolvedEditor === 1 /* ABORT */) {
          continue;
        }
        if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
          typedEditor = resolvedEditor;
          group2 = resolvedEditor.group;
        }
      }
      if (!typedEditor) {
        typedEditor = isEditorInputWithOptions(editor) ? editor : { editor: await this.textEditorService.resolveTextEditor(editor), options: editor.options };
      }
      if (!group2) {
        const findGroupResult = this.instantiationService.invokeFunction(findGroup, typedEditor, preferredGroup);
        if (findGroupResult instanceof Promise) {
          [group2] = await findGroupResult;
        } else {
          [group2] = findGroupResult;
        }
      }
      if (typedEditor.options?.preserveFocus && this.editorGroupService.activeModalEditorPart?.groups.some((modalGroup) => modalGroup.id === group2.id) && this.editorGroupService.activeModalEditorPart.count === 1 && this.editorGroupService.activeModalEditorPart.groups[0].isEmpty) {
        typedEditor = { ...typedEditor, options: { ...typedEditor.options, preserveFocus: false } };
      }
      let targetGroupEditors = mapGroupToTypedEditors.get(group2);
      if (!targetGroupEditors) {
        targetGroupEditors = [];
        mapGroupToTypedEditors.set(group2, targetGroupEditors);
      }
      targetGroupEditors.push(typedEditor);
    }
    const result = [];
    for (const [group2, editors2] of mapGroupToTypedEditors) {
      result.push(group2.openEditors(editors2));
    }
    return coalesce(await Promises.settled(result));
  }
  async handleWorkspaceTrust(editors) {
    const { resources, diffMode, mergeMode } = this.extractEditorResources(editors);
    const trustResult = await this.workspaceTrustRequestService.requestOpenFilesTrust(resources);
    switch (trustResult) {
      case 1 /* Open */:
        return true;
      case 2 /* OpenInNewWindow */:
        await this.hostService.openWindow(resources.map((resource) => ({ fileUri: resource })), { forceNewWindow: true, diffMode, mergeMode });
        return false;
      case 3 /* Cancel */:
        return false;
    }
  }
  extractEditorResources(editors) {
    const resources = new ResourceSet();
    let diffMode = false;
    let mergeMode = false;
    for (const editor of editors) {
      if (isEditorInputWithOptions(editor)) {
        const resource = EditorResourceAccessor.getOriginalUri(editor.editor, { supportSideBySide: 3 /* BOTH */ });
        if (URI.isUri(resource)) {
          resources.add(resource);
        } else if (resource) {
          if (resource.primary) {
            resources.add(resource.primary);
          }
          if (resource.secondary) {
            resources.add(resource.secondary);
          }
          diffMode = editor.editor instanceof DiffEditorInput;
        }
      } else {
        if (isResourceMergeEditorInput(editor)) {
          if (URI.isUri(editor.input1)) {
            resources.add(editor.input1.resource);
          }
          if (URI.isUri(editor.input2)) {
            resources.add(editor.input2.resource);
          }
          if (URI.isUri(editor.base)) {
            resources.add(editor.base.resource);
          }
          if (URI.isUri(editor.result)) {
            resources.add(editor.result.resource);
          }
          mergeMode = true;
        }
        if (isResourceDiffEditorInput(editor)) {
          if (URI.isUri(editor.original.resource)) {
            resources.add(editor.original.resource);
          }
          if (URI.isUri(editor.modified.resource)) {
            resources.add(editor.modified.resource);
          }
          diffMode = true;
        } else if (isResourceEditorInput(editor)) {
          resources.add(editor.resource);
        }
      }
    }
    return {
      resources: Array.from(resources.keys()),
      diffMode,
      mergeMode
    };
  }
  //#endregion
  //#region isOpened() / isVisible()
  isOpened(editor) {
    return this.editorsObserver.hasEditor({
      resource: this.uriIdentityService.asCanonicalUri(editor.resource),
      typeId: editor.typeId,
      editorId: editor.editorId
    });
  }
  isVisible(editor) {
    for (const group2 of this.editorGroupsContainer.groups) {
      if (group2.activeEditor?.matches(editor)) {
        return true;
      }
    }
    return false;
  }
  //#endregion
  //#region closeEditor()
  async closeEditor({ editor, groupId }, options3) {
    const group2 = this.editorGroupsContainer.getGroup(groupId);
    await group2?.closeEditor(editor, options3);
  }
  //#endregion
  //#region closeEditors()
  async closeEditors(editors, options3) {
    const mapGroupToEditors = /* @__PURE__ */ new Map();
    for (const { editor, groupId } of editors) {
      const group2 = this.editorGroupsContainer.getGroup(groupId);
      if (!group2) {
        continue;
      }
      let editors2 = mapGroupToEditors.get(group2);
      if (!editors2) {
        editors2 = [];
        mapGroupToEditors.set(group2, editors2);
      }
      editors2.push(editor);
    }
    for (const [group2, editors2] of mapGroupToEditors) {
      await group2.closeEditors(editors2, options3);
    }
  }
  findEditors(arg1, options3, arg2) {
    const resource = URI.isUri(arg1) ? arg1 : arg1.resource;
    const typeId = URI.isUri(arg1) ? void 0 : arg1.typeId;
    if (options3?.supportSideBySide !== 4 /* ANY */ && options3?.supportSideBySide !== 2 /* SECONDARY */) {
      if (!this.editorsObserver.hasEditors(resource)) {
        if (URI.isUri(arg1) || isUndefined(arg2)) {
          return [];
        }
        return void 0;
      }
    }
    if (!isUndefined(arg2)) {
      const targetGroup = typeof arg2 === "number" ? this.editorGroupsContainer.getGroup(arg2) : arg2;
      if (URI.isUri(arg1)) {
        if (!targetGroup) {
          return [];
        }
        return targetGroup.findEditors(resource, options3);
      } else {
        if (!targetGroup) {
          return void 0;
        }
        const editors = targetGroup.findEditors(resource, options3);
        for (const editor of editors) {
          if (editor.typeId === typeId) {
            return editor;
          }
        }
        return void 0;
      }
    } else {
      const result = [];
      for (const group2 of this.editorGroupsContainer.getGroups(options3?.order === 1 /* SEQUENTIAL */ ? 2 /* GRID_APPEARANCE */ : 1 /* MOST_RECENTLY_ACTIVE */)) {
        const editors = [];
        if (URI.isUri(arg1)) {
          editors.push(...this.findEditors(arg1, options3, group2));
        } else {
          const editor = this.findEditors(arg1, options3, group2);
          if (editor) {
            editors.push(editor);
          }
        }
        result.push(...editors.map((editor) => ({ editor, groupId: group2.id })));
      }
      return result;
    }
  }
  async replaceEditors(replacements, group2) {
    const targetGroup = typeof group2 === "number" ? this.editorGroupsContainer.getGroup(group2) : group2;
    const typedReplacements = [];
    for (const replacement of replacements) {
      let typedReplacement = void 0;
      if (!isEditorInput(replacement.replacement)) {
        const resolvedEditor = await this.editorResolverService.resolveEditor(
          replacement.replacement,
          targetGroup
        );
        if (resolvedEditor === 1 /* ABORT */) {
          continue;
        }
        if (isEditorInputWithOptionsAndGroup(resolvedEditor)) {
          typedReplacement = {
            editor: replacement.editor,
            replacement: resolvedEditor.editor,
            options: resolvedEditor.options,
            forceReplaceDirty: replacement.forceReplaceDirty
          };
        }
      }
      if (!typedReplacement) {
        typedReplacement = {
          editor: replacement.editor,
          replacement: isEditorReplacement(replacement) ? replacement.replacement : await this.textEditorService.resolveTextEditor(replacement.replacement),
          options: isEditorReplacement(replacement) ? replacement.options : replacement.replacement.options,
          forceReplaceDirty: replacement.forceReplaceDirty
        };
      }
      typedReplacements.push(typedReplacement);
    }
    return targetGroup?.replaceEditors(typedReplacements);
  }
  //#endregion
  //#region save/revert
  async save(editors, options3) {
    if (!Array.isArray(editors)) {
      editors = [editors];
    }
    const uniqueEditors = this.getUniqueEditors(editors);
    const editorsToSaveParallel = [];
    const editorsToSaveSequentially = [];
    if (options3?.saveAs) {
      editorsToSaveSequentially.push(...uniqueEditors);
    } else {
      for (const { groupId, editor } of uniqueEditors) {
        if (editor.hasCapability(4 /* Untitled */)) {
          editorsToSaveSequentially.push({ groupId, editor });
        } else {
          editorsToSaveParallel.push({ groupId, editor });
        }
      }
    }
    const saveResults = await Promises.settled(editorsToSaveParallel.map(({ groupId, editor }) => {
      if (options3?.reason === 1 /* EXPLICIT */) {
        this.editorGroupsContainer.getGroup(groupId)?.pinEditor(editor);
      }
      return editor.save(groupId, options3);
    }));
    for (const { groupId, editor } of editorsToSaveSequentially) {
      if (editor.isDisposed()) {
        continue;
      }
      const editorPane = await this.openEditor(editor, groupId);
      const editorOptions = {
        pinned: true,
        viewState: editorPane?.getViewState()
      };
      const result = options3?.saveAs ? await editor.saveAs(groupId, options3) : await editor.save(groupId, options3);
      saveResults.push(result);
      if (!result) {
        break;
      }
      if (!editor.matches(result)) {
        const targetGroups = editor.hasCapability(4 /* Untitled */) ? this.editorGroupsContainer.groups.map((group2) => group2.id) : [groupId];
        for (const targetGroup of targetGroups) {
          if (result instanceof EditorInput) {
            await this.replaceEditors([{ editor, replacement: result, options: editorOptions }], targetGroup);
          } else {
            await this.replaceEditors([{ editor, replacement: { ...result, options: editorOptions } }], targetGroup);
          }
        }
      }
    }
    return {
      success: saveResults.every((result) => !!result),
      editors: coalesce(saveResults)
    };
  }
  saveAll(options3) {
    return this.save(this.getAllModifiedEditors(options3), options3);
  }
  async revert(editors, options3) {
    if (!Array.isArray(editors)) {
      editors = [editors];
    }
    const uniqueEditors = this.getUniqueEditors(editors);
    await Promises.settled(uniqueEditors.map(async ({ groupId, editor }) => {
      this.editorGroupsContainer.getGroup(groupId)?.pinEditor(editor);
      return editor.revert(groupId, options3);
    }));
    return !uniqueEditors.some(({ editor }) => editor.isDirty());
  }
  async revertAll(options3) {
    return this.revert(this.getAllModifiedEditors(options3), options3);
  }
  getAllModifiedEditors(options3) {
    const editors = [];
    for (const group2 of this.editorGroupsContainer.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
      for (const editor of group2.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
        if (!editor.isModified()) {
          continue;
        }
        if ((typeof options3?.includeUntitled === "boolean" || !options3?.includeUntitled?.includeScratchpad) && editor.hasCapability(512 /* Scratchpad */)) {
          continue;
        }
        if (!options3?.includeUntitled && editor.hasCapability(4 /* Untitled */)) {
          continue;
        }
        if (options3?.excludeSticky && group2.isSticky(editor)) {
          continue;
        }
        editors.push({ groupId: group2.id, editor });
      }
    }
    return editors;
  }
  getUniqueEditors(editors) {
    const uniqueEditors = [];
    for (const { editor, groupId } of editors) {
      if (uniqueEditors.some((uniqueEditor) => uniqueEditor.editor.matches(editor))) {
        continue;
      }
      uniqueEditors.push({ editor, groupId });
    }
    return uniqueEditors;
  }
  //#endregion
  dispose() {
    super.dispose();
    this.activeOutOfWorkspaceWatchers.forEach((disposable) => dispose(disposable));
    this.activeOutOfWorkspaceWatchers.clear();
  }
};

EditorService = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IUriIdentityService),
  __decorateParam(7, IEditorResolverService),
  __decorateParam(8, IWorkspaceTrustRequestService),
  __decorateParam(9, IHostService),
  __decorateParam(10, ITextEditorService)
], EditorService);

registerSingleton(IEditorService, new SyncDescriptor(EditorService, [void 0], false));
export { EditorService };
