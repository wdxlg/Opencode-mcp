// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorAutoSave.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IHostService } from "./module-1118.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { ILogService } from "./module-0095.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/browser/parts/editor/editorAutoSave.ts
var EditorAutoSave = class extends Disposable {
  constructor(filesConfigurationService, hostService, editorService, editorGroupService, workingCopyService, logService, markerService, uriIdentityService) {
    super();
    this.filesConfigurationService = filesConfigurationService;
    this.hostService = hostService;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.workingCopyService = workingCopyService;
    this.logService = logService;
    this.markerService = markerService;
    this.uriIdentityService = uriIdentityService;
    // Auto save: after delay
    this.scheduledAutoSavesAfterDelay = /* @__PURE__ */ new Map();
    // Auto save: focus change & window change
    this.lastActiveEditor = void 0;
    this.lastActiveGroupId = void 0;
    this.lastActiveEditorControlDisposable = this._register(new DisposableStore());
    // Auto save: waiting on specific condition
    this.waitingOnConditionAutoSaveWorkingCopies = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.waitingOnConditionAutoSaveEditors = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
      this.onDidRegister(dirtyWorkingCopy);
    }
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.editorAutoSave";
  }
  registerListeners() {
    this._register(this.hostService.onDidChangeFocus((focused) => this.onWindowFocusChange(focused)));
    this._register(this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChange()));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange()));
    this._register(this.filesConfigurationService.onDidChangeAutoSaveConfiguration(() => this.onDidChangeAutoSaveConfiguration()));
    this._register(this.workingCopyService.onDidRegister((workingCopy) => this.onDidRegister(workingCopy)));
    this._register(this.workingCopyService.onDidUnregister((workingCopy) => this.onDidUnregister(workingCopy)));
    this._register(this.workingCopyService.onDidChangeDirty((workingCopy) => this.onDidChangeDirty(workingCopy)));
    this._register(this.workingCopyService.onDidChangeContent((workingCopy) => this.onDidChangeContent(workingCopy)));
    this._register(this.markerService.onMarkerChanged((e4) => this.onConditionChanged(e4, 3 /* ERRORS */)));
    this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled((resource) => this.onConditionChanged([resource], 4 /* DISABLED */)));
  }
  onConditionChanged(resources, condition) {
    for (const resource of resources) {
      const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
      if (workingCopyResult?.condition === condition) {
        if (workingCopyResult.workingCopy.isDirty() && this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource, workingCopyResult.reason).mode !== 0 /* OFF */) {
          this.discardAutoSave(workingCopyResult.workingCopy);
          this.logService.trace(`[editor auto save] running auto save from condition change event`, workingCopyResult.workingCopy.resource.toString(), workingCopyResult.workingCopy.typeId);
          workingCopyResult.workingCopy.save({ reason: workingCopyResult.reason });
        }
      } else {
        const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
        if (editorResult?.condition === condition && !editorResult.editor.editor.isDisposed() && editorResult.editor.editor.isDirty() && this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor, editorResult.reason).mode !== 0 /* OFF */) {
          this.waitingOnConditionAutoSaveEditors.delete(resource);
          this.logService.trace(`[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`);
          this.editorService.save(editorResult.editor, { reason: editorResult.reason });
        }
      }
    }
  }
  onWindowFocusChange(focused) {
    if (!focused) {
      this.maybeTriggerAutoSave(4 /* WINDOW_CHANGE */);
    }
  }
  onActiveWindowChange() {
    this.maybeTriggerAutoSave(4 /* WINDOW_CHANGE */);
  }
  onDidActiveEditorChange() {
    if (this.lastActiveEditor && typeof this.lastActiveGroupId === "number") {
      this.maybeTriggerAutoSave(3 /* FOCUS_CHANGE */, { groupId: this.lastActiveGroupId, editor: this.lastActiveEditor });
    }
    const activeGroup = this.editorGroupService.activeGroup;
    const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? void 0;
    this.lastActiveGroupId = activeGroup.id;
    this.lastActiveEditorControlDisposable.clear();
    const activeEditorPane = this.editorService.activeEditorPane;
    if (activeEditor && activeEditorPane) {
      this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
        this.maybeTriggerAutoSave(3 /* FOCUS_CHANGE */, { groupId: activeGroup.id, editor: activeEditor });
      }));
    }
  }
  maybeTriggerAutoSave(reason, editorIdentifier) {
    if (editorIdentifier) {
      if (!editorIdentifier.editor.isDirty() || editorIdentifier.editor.isReadonly() || editorIdentifier.editor.hasCapability(4 /* Untitled */)) {
        return;
      }
      const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor, reason);
      if (autoSaveMode.mode !== 0 /* OFF */) {
        if (reason === 4 /* WINDOW_CHANGE */ && (autoSaveMode.mode === 3 /* ON_FOCUS_CHANGE */ || autoSaveMode.mode === 4 /* ON_WINDOW_CHANGE */) || reason === 3 /* FOCUS_CHANGE */ && autoSaveMode.mode === 3 /* ON_FOCUS_CHANGE */) {
          this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
          this.editorService.save(editorIdentifier, { reason });
        }
      } else if (editorIdentifier.editor.resource && (autoSaveMode.reason === 3 /* ERRORS */ || autoSaveMode.reason === 4 /* DISABLED */)) {
        this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, { editor: editorIdentifier, reason, condition: autoSaveMode.reason });
      }
    } else {
      this.saveAllDirtyAutoSaveables(reason);
    }
  }
  onDidChangeAutoSaveConfiguration() {
    let reason = void 0;
    switch (this.filesConfigurationService.getAutoSaveMode(void 0).mode) {
      case 3 /* ON_FOCUS_CHANGE */:
        reason = 3 /* FOCUS_CHANGE */;
        break;
      case 4 /* ON_WINDOW_CHANGE */:
        reason = 4 /* WINDOW_CHANGE */;
        break;
      case 1 /* AFTER_SHORT_DELAY */:
      case 2 /* AFTER_LONG_DELAY */:
        reason = 2 /* AUTO */;
        break;
    }
    if (reason) {
      this.saveAllDirtyAutoSaveables(reason);
    }
  }
  saveAllDirtyAutoSaveables(reason) {
    for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
      if (workingCopy.capabilities & 2 /* Untitled */) {
        continue;
      }
      const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
      if (autoSaveMode.mode !== 0 /* OFF */) {
        workingCopy.save({ reason });
      } else if (autoSaveMode.reason === 3 /* ERRORS */ || autoSaveMode.reason === 4 /* DISABLED */) {
        this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
      }
    }
  }
  onDidRegister(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    }
  }
  onDidUnregister(workingCopy) {
    this.discardAutoSave(workingCopy);
  }
  onDidChangeDirty(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    } else {
      this.discardAutoSave(workingCopy);
    }
  }
  onDidChangeContent(workingCopy) {
    if (workingCopy.isDirty()) {
      this.scheduleAutoSave(workingCopy);
    }
  }
  scheduleAutoSave(workingCopy) {
    if (workingCopy.capabilities & 2 /* Untitled */) {
      return;
    }
    const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
    if (typeof autoSaveAfterDelay !== "number") {
      return;
    }
    this.discardAutoSave(workingCopy);
    this.logService.trace(`[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`, workingCopy.resource.toString(), workingCopy.typeId);
    const handle2 = setTimeout(() => {
      this.discardAutoSave(workingCopy);
      if (workingCopy.isDirty()) {
        const reason = 2 /* AUTO */;
        const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
        if (autoSaveMode.mode !== 0 /* OFF */) {
          this.logService.trace(`[editor auto save] running auto save`, workingCopy.resource.toString(), workingCopy.typeId);
          workingCopy.save({ reason });
        } else if (autoSaveMode.reason === 3 /* ERRORS */ || autoSaveMode.reason === 4 /* DISABLED */) {
          this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, { workingCopy, reason, condition: autoSaveMode.reason });
        }
      }
    }, autoSaveAfterDelay);
    this.scheduledAutoSavesAfterDelay.set(workingCopy, toDisposable(() => {
      this.logService.trace(`[editor auto save] clearing pending auto save`, workingCopy.resource.toString(), workingCopy.typeId);
      clearTimeout(handle2);
    }));
  }
  discardAutoSave(workingCopy) {
    dispose(this.scheduledAutoSavesAfterDelay.get(workingCopy));
    this.scheduledAutoSavesAfterDelay.delete(workingCopy);
    this.waitingOnConditionAutoSaveWorkingCopies.delete(workingCopy.resource);
    this.waitingOnConditionAutoSaveEditors.delete(workingCopy.resource);
  }
};

EditorAutoSave = __decorateClass([
  __decorateParam(0, IFilesConfigurationService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IEditorGroupsService),
  __decorateParam(4, IWorkingCopyService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IMarkerService),
  __decorateParam(7, IUriIdentityService)
], EditorAutoSave);
export { EditorAutoSave };
