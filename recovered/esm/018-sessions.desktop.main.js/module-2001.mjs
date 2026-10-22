// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler.ts
import { localize } from "./module-0001.mjs";
import { Disposable, dispose } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { TextFileContentProvider } from "./module-1534.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { isWindows } from "./module-0014.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { hash } from "./module-0039.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Action } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";
import { SAVE_FILE_AS_LABEL } from "./module-1994.mjs";
import { FileEditorInput } from "./module-2000.mjs";
import { IPreferencesService } from "./module-1293.mjs";


// src/vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler.ts
var CONFLICT_RESOLUTION_CONTEXT = "saveConflictResolutionContext";

var CONFLICT_RESOLUTION_SCHEME = "conflictResolution";

var LEARN_MORE_DIRTY_WRITE_IGNORE_KEY = "learnMoreDirtyWriteError";

var conflictEditorHelp = localize(15699, null);

var TextFileSaveErrorHandler = class extends Disposable {
  constructor(notificationService, textFileService, contextKeyService, editorService, textModelService, instantiationService, storageService) {
    super();
    this.notificationService = notificationService;
    this.textFileService = textFileService;
    this.editorService = editorService;
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.messages = new ResourceMap();
    this.activeConflictResolutionResource = void 0;
    this.conflictResolutionContext = new RawContextKey(CONFLICT_RESOLUTION_CONTEXT, false, true).bindTo(contextKeyService);
    const provider = this._register(instantiationService.createInstance(TextFileContentProvider));
    this._register(textModelService.registerTextModelContentProvider(CONFLICT_RESOLUTION_SCHEME, provider));
    this.textFileService.files.saveErrorHandler = this;
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.textFileSaveErrorHandler";
  }
  registerListeners() {
    this._register(this.textFileService.files.onDidSave((e4) => this.onFileSavedOrReverted(e4.model.resource)));
    this._register(this.textFileService.files.onDidRevert((model) => this.onFileSavedOrReverted(model.resource)));
    this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChanged()));
  }
  onActiveEditorChanged() {
    let isActiveEditorSaveConflictResolution = false;
    let activeConflictResolutionResource;
    const activeInput = this.editorService.activeEditor;
    if (activeInput instanceof DiffEditorInput) {
      const resource = activeInput.original.resource;
      if (resource?.scheme === CONFLICT_RESOLUTION_SCHEME) {
        isActiveEditorSaveConflictResolution = true;
        activeConflictResolutionResource = activeInput.modified.resource;
      }
    }
    this.conflictResolutionContext.set(isActiveEditorSaveConflictResolution);
    this.activeConflictResolutionResource = activeConflictResolutionResource;
  }
  onFileSavedOrReverted(resource) {
    const messageHandle = this.messages.get(resource);
    if (messageHandle) {
      messageHandle.close();
      this.messages.delete(resource);
    }
  }
  onSaveError(error, model, options3) {
    const fileOperationError = error;
    const resource = model.resource;
    let message;
    const primaryActions = [];
    const secondaryActions = [];
    if (fileOperationError.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
      if (this.activeConflictResolutionResource && isEqual2(this.activeConflictResolutionResource, model.resource)) {
        if (this.storageService.getBoolean(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, -1 /* APPLICATION */)) {
          return;
        }
        message = conflictEditorHelp;
        primaryActions.push(this.instantiationService.createInstance(ResolveConflictLearnMoreAction));
        secondaryActions.push(this.instantiationService.createInstance(DoNotShowResolveConflictLearnMoreAction));
      } else {
        message = localize(15698, null, basename2(resource));
        primaryActions.push(this.instantiationService.createInstance(ResolveSaveConflictAction, model));
        primaryActions.push(this.instantiationService.createInstance(SaveModelIgnoreModifiedSinceAction, model, options3));
        secondaryActions.push(this.instantiationService.createInstance(ConfigureSaveConflictAction));
      }
    } else {
      const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FILE_WRITE_LOCKED */;
      const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
      const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FILE_PERMISSION_DENIED */;
      const canSaveElevated = resource.scheme === Schemas.file;
      if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
        primaryActions.push(this.instantiationService.createInstance(SaveModelElevatedAction, model, options3, !!triedToUnlock));
      } else if (isWriteLocked) {
        primaryActions.push(this.instantiationService.createInstance(UnlockModelAction, model, options3));
      } else {
        primaryActions.push(this.instantiationService.createInstance(RetrySaveModelAction, model, options3));
      }
      primaryActions.push(this.instantiationService.createInstance(SaveModelAsAction, model));
      primaryActions.push(this.instantiationService.createInstance(RevertModelAction, model));
      if (isWriteLocked) {
        if (triedToUnlock && canSaveElevated) {
          message = isWindows ? localize(15691, null, basename2(resource)) : localize(15692, null, basename2(resource));
        } else {
          message = localize(15690, null, basename2(resource));
        }
      } else if (canSaveElevated && isPermissionDenied) {
        message = isWindows ? localize(15688, null, basename2(resource)) : localize(15689, null, basename2(resource));
      } else {
        message = localize(15683, null, basename2(resource), toErrorMessage(error, false));
      }
    }
    const actions = { primary: primaryActions, secondary: secondaryActions };
    const handle2 = this.notificationService.notify({
      id: `${hash(model.resource.toString())}`,
      // unique per model (https://github.com/microsoft/vscode/issues/121539)
      severity: Severity2.Error,
      message,
      actions
    });
    Event2.once(handle2.onDidClose)(() => {
      dispose(primaryActions);
      dispose(secondaryActions);
    });
    this.messages.set(model.resource, handle2);
  }
  dispose() {
    super.dispose();
    this.messages.clear();
  }
};

TextFileSaveErrorHandler = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IStorageService)
], TextFileSaveErrorHandler);

var pendingResolveSaveConflictMessages = [];

function clearPendingResolveSaveConflictMessages() {
  while (pendingResolveSaveConflictMessages.length > 0) {
    const item = pendingResolveSaveConflictMessages.pop();
    item?.close();
  }
}

var ResolveConflictLearnMoreAction = class extends Action {
  constructor(openerService) {
    super("workbench.files.action.resolveConflictLearnMore", localize(15684, null));
    this.openerService = openerService;
  }
  async run() {
    await this.openerService.open(URI.parse("https://go.microsoft.com/fwlink/?linkid=868264"));
  }
};

ResolveConflictLearnMoreAction = __decorateClass([
  __decorateParam(0, IOpenerService)
], ResolveConflictLearnMoreAction);

var DoNotShowResolveConflictLearnMoreAction = class extends Action {
  constructor(storageService) {
    super("workbench.files.action.resolveConflictLearnMoreDoNotShowAgain", localize(15682, null));
    this.storageService = storageService;
  }
  async run(notification) {
    this.storageService.store(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
    notification.dispose();
  }
};

DoNotShowResolveConflictLearnMoreAction = __decorateClass([
  __decorateParam(0, IStorageService)
], DoNotShowResolveConflictLearnMoreAction);

var ResolveSaveConflictAction = class extends Action {
  constructor(model, editorService, notificationService, instantiationService, productService) {
    super("workbench.files.action.resolveConflict", localize(15680, null));
    this.model = model;
    this.editorService = editorService;
    this.notificationService = notificationService;
    this.instantiationService = instantiationService;
    this.productService = productService;
  }
  async run() {
    if (!this.model.isDisposed()) {
      const resource = this.model.resource;
      const name = basename2(resource);
      const editorLabel = localize(15695, null, name, name, this.productService.nameLong);
      await TextFileContentProvider.open(resource, CONFLICT_RESOLUTION_SCHEME, editorLabel, this.editorService, { pinned: true });
      const actions = { primary: [this.instantiationService.createInstance(ResolveConflictLearnMoreAction)] };
      const handle2 = this.notificationService.notify({
        id: `${hash(resource.toString())}`,
        // unique per model
        severity: Severity2.Info,
        message: conflictEditorHelp,
        actions,
        neverShowAgain: { id: LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, isSecondary: true }
      });
      Event2.once(handle2.onDidClose)(() => dispose(actions.primary));
      pendingResolveSaveConflictMessages.push(handle2);
    }
  }
};

ResolveSaveConflictAction = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IProductService)
], ResolveSaveConflictAction);

var SaveModelElevatedAction = class extends Action {
  constructor(model, options3, triedToUnlock) {
    super("workbench.files.action.saveModelElevated", triedToUnlock ? isWindows ? localize(15686, null) : localize(15687, null) : isWindows ? localize(15696, null) : localize(15697, null));
    this.model = model;
    this.options = options3;
    this.triedToUnlock = triedToUnlock;
  }
  async run() {
    if (!this.model.isDisposed()) {
      await this.model.save({
        ...this.options,
        writeElevated: true,
        writeUnlock: this.triedToUnlock,
        reason: 1 /* EXPLICIT */
      });
    }
  }
};

var RetrySaveModelAction = class extends Action {
  constructor(model, options3) {
    super("workbench.files.action.saveModel", localize(15693, null));
    this.model = model;
    this.options = options3;
  }
  async run() {
    if (!this.model.isDisposed()) {
      await this.model.save({ ...this.options, reason: 1 /* EXPLICIT */ });
    }
  }
};

var RevertModelAction = class extends Action {
  constructor(model) {
    super("workbench.files.action.revertModel", localize(15694, null));
    this.model = model;
  }
  async run() {
    if (!this.model.isDisposed()) {
      await this.model.revert();
    }
  }
};

var SaveModelAsAction = class extends Action {
  constructor(model, editorService) {
    super("workbench.files.action.saveModelAs", SAVE_FILE_AS_LABEL.value);
    this.model = model;
    this.editorService = editorService;
  }
  async run() {
    if (!this.model.isDisposed()) {
      const editor = this.findEditor();
      if (editor) {
        await this.editorService.save(editor, { saveAs: true, reason: 1 /* EXPLICIT */ });
      }
    }
  }
  findEditor() {
    let preferredMatchingEditor;
    const editors = this.editorService.findEditors(this.model.resource, { supportSideBySide: 1 /* PRIMARY */ });
    for (const identifier2 of editors) {
      if (identifier2.editor instanceof FileEditorInput) {
        preferredMatchingEditor = identifier2;
        break;
      } else if (!preferredMatchingEditor) {
        preferredMatchingEditor = identifier2;
      }
    }
    return preferredMatchingEditor;
  }
};

SaveModelAsAction = __decorateClass([
  __decorateParam(1, IEditorService)
], SaveModelAsAction);

var UnlockModelAction = class extends Action {
  constructor(model, options3) {
    super("workbench.files.action.unlock", localize(15685, null));
    this.model = model;
    this.options = options3;
  }
  async run() {
    if (!this.model.isDisposed()) {
      await this.model.save({ ...this.options, writeUnlock: true, reason: 1 /* EXPLICIT */ });
    }
  }
};

var SaveModelIgnoreModifiedSinceAction = class extends Action {
  constructor(model, options3) {
    super("workbench.files.action.saveIgnoreModifiedSince", localize(15685, null));
    this.model = model;
    this.options = options3;
  }
  async run() {
    if (!this.model.isDisposed()) {
      await this.model.save({ ...this.options, ignoreModifiedSince: true, reason: 1 /* EXPLICIT */ });
    }
  }
};

var ConfigureSaveConflictAction = class extends Action {
  constructor(preferencesService) {
    super("workbench.files.action.configureSaveConflict", localize(15681, null));
    this.preferencesService = preferencesService;
  }
  async run() {
    this.preferencesService.openSettings({ query: "files.saveConflictResolution" });
  }
};

ConfigureSaveConflictAction = __decorateClass([
  __decorateParam(0, IPreferencesService)
], ConfigureSaveConflictAction);

var acceptLocalChangesCommand = (accessor, resource) => {
  return acceptOrRevertLocalChangesCommand(accessor, resource, true);
};

var revertLocalChangesCommand = (accessor, resource) => {
  return acceptOrRevertLocalChangesCommand(accessor, resource, false);
};

async function acceptOrRevertLocalChangesCommand(accessor, resource, accept) {
  const editorService = accessor.get(IEditorService);
  if (!URI.isUri(resource)) {
    return;
  }
  const editorPane = editorService.activeEditorPane;
  if (!editorPane) {
    return;
  }
  const editor = editorPane.input;
  const group2 = editorPane.group;
  clearPendingResolveSaveConflictMessages();
  if (accept) {
    const options3 = { ignoreModifiedSince: true, reason: 1 /* EXPLICIT */ };
    await editorService.save({ editor, groupId: group2.id }, options3);
  } else {
    await editorService.revert({ editor, groupId: group2.id });
  }
  await editorService.openEditor({ resource }, group2);
  return group2.closeEditor(editor);
}
export { clearPendingResolveSaveConflictMessages, acceptOrRevertLocalChangesCommand, CONFLICT_RESOLUTION_CONTEXT, CONFLICT_RESOLUTION_SCHEME, LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, conflictEditorHelp, TextFileSaveErrorHandler, pendingResolveSaveConflictMessages, ResolveConflictLearnMoreAction, DoNotShowResolveConflictLearnMoreAction, ResolveSaveConflictAction, SaveModelElevatedAction, RetrySaveModelAction, RevertModelAction, SaveModelAsAction, UnlockModelAction, SaveModelIgnoreModifiedSinceAction, ConfigureSaveConflictAction, acceptLocalChangesCommand, revertLocalChangesCommand };
