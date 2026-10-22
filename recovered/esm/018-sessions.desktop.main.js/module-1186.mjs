// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadFileSystemEventService.ts
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { reviveWorkspaceEditDto } from "./module-0944.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";


// src/vs/workbench/api/browser/mainThreadFileSystemEventService.ts
var MainThreadFileSystemEventService = class {
  constructor(extHostContext, _fileService, workingCopyFileService, bulkEditService, progressService, dialogService, storageService, logService, envService, uriIdentService, _logService) {
    this._fileService = _fileService;
    this._logService = _logService;
    this._listener = new DisposableStore();
    this._watches = new DisposableMap();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystemEventService);
    this._listener.add(_fileService.onDidFilesChange((event) => {
      this._proxy.$onFileEvent({
        created: event.rawAdded,
        changed: event.rawUpdated,
        deleted: event.rawDeleted
      });
    }));
    const that = this;
    const fileOperationParticipant = new class {
      async participate(files, operation, undoInfo, timeout2, token) {
        if (undoInfo?.isUndoing) {
          return;
        }
        const cts = new CancellationTokenSource(token);
        const timer = setTimeout(() => cts.cancel(), timeout2);
        const data = await progressService.withProgress({
          location: 15 /* Notification */,
          title: this._progressLabel(operation),
          cancellable: true,
          delay: Math.min(timeout2 / 2, 3e3)
        }, () => {
          const onWillEvent = that._proxy.$onWillRunFileOperation(operation, files, timeout2, cts.token);
          return raceCancellation(onWillEvent, cts.token);
        }, () => {
          cts.cancel();
        }).finally(() => {
          cts.dispose();
          clearTimeout(timer);
        });
        if (!data || data.edit.edits.length === 0) {
          return;
        }
        const needsConfirmation = data.edit.edits.some((edit3) => edit3.metadata?.needsConfirmation);
        let showPreview = storageService.getBoolean(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, 0 /* PROFILE */);
        if (envService.extensionTestsLocationURI) {
          showPreview = false;
        }
        if (showPreview === void 0) {
          let message;
          if (data.extensionNames.length === 1) {
            if (operation === 0 /* CREATE */) {
              message = localize(5694, null, data.extensionNames[0]);
            } else if (operation === 3 /* COPY */) {
              message = localize(5693, null, data.extensionNames[0]);
            } else if (operation === 2 /* MOVE */) {
              message = localize(5696, null, data.extensionNames[0]);
            } else {
              message = localize(5695, null, data.extensionNames[0]);
            }
          } else {
            if (operation === 0 /* CREATE */) {
              message = localize(5698, null, data.extensionNames.length);
            } else if (operation === 3 /* COPY */) {
              message = localize(5697, null, data.extensionNames.length);
            } else if (operation === 2 /* MOVE */) {
              message = localize(5700, null, data.extensionNames.length);
            } else {
              message = localize(5699, null, data.extensionNames.length);
            }
          }
          if (needsConfirmation) {
            const { confirmed } = await dialogService.confirm({
              type: severity_default.Info,
              message,
              primaryButton: localize(5709, null),
              cancelButton: localize(5701, null)
            });
            showPreview = true;
            if (!confirmed) {
              return;
            }
          } else {
            let Choice2;
            ((Choice3) => {
              Choice3[Choice3["OK"] = 0] = "OK";
              Choice3[Choice3["Preview"] = 1] = "Preview";
              Choice3[Choice3["Cancel"] = 2] = "Cancel";
            })(Choice2 || (Choice2 = {}));
            const { result, checkboxChecked } = await dialogService.prompt({
              type: severity_default.Info,
              message,
              buttons: [
                {
                  label: localize(5708, null),
                  run: () => 0 /* OK */
                },
                {
                  label: localize(5709, null),
                  run: () => 1 /* Preview */
                }
              ],
              cancelButton: {
                label: localize(5701, null),
                run: () => 2 /* Cancel */
              },
              checkbox: { label: localize(5692, null) }
            });
            if (result === 2 /* Cancel */) {
              return;
            }
            showPreview = result === 1 /* Preview */;
            if (checkboxChecked) {
              storageService.store(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, showPreview, 0 /* PROFILE */, 0 /* USER */);
            }
          }
        }
        logService.info("[onWill-handler] applying additional workspace edit from extensions", data.extensionNames);
        await bulkEditService.apply(
          reviveWorkspaceEditDto(data.edit, uriIdentService),
          { undoRedoGroupId: undoInfo?.undoRedoGroupId, showPreview }
        );
      }
      _progressLabel(operation) {
        switch (operation) {
          case 0 /* CREATE */:
            return localize(5704, null);
          case 2 /* MOVE */:
            return localize(5706, null);
          case 3 /* COPY */:
            return localize(5703, null);
          case 1 /* DELETE */:
            return localize(5705, null);
          case 4 /* WRITE */:
            return localize(5707, null);
        }
      }
    }();
    this._listener.add(workingCopyFileService.addFileOperationParticipant(fileOperationParticipant));
    this._listener.add(workingCopyFileService.onDidRunWorkingCopyFileOperation((e4) => this._proxy.$onDidRunFileOperation(e4.operation, e4.files)));
  }
  async $watch(extensionId, session, resource, unvalidatedOpts, correlate) {
    const uri4 = URI.revive(resource);
    const canHandleWatcher = await this._fileService.canHandleResource(uri4);
    if (!canHandleWatcher) {
      this._logService.warn(`MainThreadFileSystemEventService#$watch(): cannot watch resource as its scheme is not handled by the file service (extension: ${extensionId}, path: ${uri4.toString(true)})`);
    }
    const opts = {
      ...unvalidatedOpts
    };
    if (opts.recursive) {
      try {
        const stat = await this._fileService.stat(uri4);
        if (!stat.isDirectory) {
          opts.recursive = false;
        }
      } catch (error) {
      }
    }
    if (correlate && !opts.recursive) {
      this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching correlated (extension: ${extensionId}, path: ${uri4.toString(true)}, recursive: ${opts.recursive}, session: ${session}, excludes: ${JSON.stringify(opts.excludes)}, includes: ${JSON.stringify(opts.includes)})`);
      const watcherDisposables = new DisposableStore();
      const subscription = watcherDisposables.add(this._fileService.createWatcher(uri4, { ...opts, recursive: false }));
      watcherDisposables.add(subscription.onDidChange((event) => {
        this._proxy.$onFileEvent({
          session,
          created: event.rawAdded,
          changed: event.rawUpdated,
          deleted: event.rawDeleted
        });
      }));
      this._watches.set(session, watcherDisposables);
    } else {
      this._logService.trace(`MainThreadFileSystemEventService#$watch(): request to start watching uncorrelated (extension: ${extensionId}, path: ${uri4.toString(true)}, recursive: ${opts.recursive}, session: ${session}, excludes: ${JSON.stringify(opts.excludes)}, includes: ${JSON.stringify(opts.includes)})`);
      const subscription = this._fileService.watch(uri4, opts);
      this._watches.set(session, subscription);
    }
  }
  $unwatch(session) {
    if (this._watches.has(session)) {
      this._logService.trace(`MainThreadFileSystemEventService#$unwatch(): request to stop watching (session: ${session})`);
      this._watches.deleteAndDispose(session);
    }
  }
  dispose() {
    this._listener.dispose();
    this._watches.dispose();
  }
};

MainThreadFileSystemEventService.MementoKeyAdditionalEdits = `file.particpants.additionalEdits`;

MainThreadFileSystemEventService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadFileSystemEventService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IWorkingCopyFileService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, IProgressService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, ILogService)
], MainThreadFileSystemEventService);

registerAction2(class ResetMemento extends Action2 {
  constructor() {
    super({
      id: "files.participants.resetChoice",
      title: {
        value: localize(5702, null),
        original: `Reset choice for 'File operation needs preview'`
      },
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IStorageService).remove(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, 0 /* PROFILE */);
  }
});
export { MainThreadFileSystemEventService };
