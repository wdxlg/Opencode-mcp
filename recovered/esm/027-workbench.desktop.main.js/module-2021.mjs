// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/fileImportExport.ts
import { CancellationTokenSource } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";
import { VIEW_ID2 } from "./module-1542.mjs";
import { getActiveWindow, isDragEvent, triggerDownload } from "./module-0075.mjs";
import { Limiter, Promises, RunOnceWorker } from "./module-0036.mjs";
import { ResourceFileEdit } from "./module-0537.mjs";
import { basename2, dirname2, joinPath } from "./module-0034.mjs";
import { ByteSize, IFileService } from "./module-0269.mjs";
import { VSBuffer, newWriteableBufferStream } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IDialogService, IFileDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { IExplorerService } from "./module-2020.mjs";
import { IEditorService } from "./module-0934.mjs";
import { coalesce } from "./module-0007.mjs";
import { extractEditorsAndFilesDropData } from "./module-0273.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ExplorerItem } from "./module-2019.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isWeb } from "./module-0014.mjs";
import { WebFileSystemAccess } from "./module-0270.mjs";
import { FileAccess, Schemas } from "./module-0033.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { canceled } from "./module-0004.mjs";
import { listenStream } from "./module-0037.mjs";
import { URI } from "./module-0032.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/files/browser/fileImportExport.ts
var BrowserFileUpload = class {
  constructor(progressService, dialogService, explorerService, editorService, fileService) {
    this.progressService = progressService;
    this.dialogService = dialogService;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.fileService = fileService;
  }
  static {
    this.MAX_PARALLEL_UPLOADS = 20;
  }
  upload(target, source) {
    const cts = new CancellationTokenSource();
    const uploadPromise = this.progressService.withProgress(
      {
        location: 10 /* Window */,
        delay: 800,
        cancellable: true,
        title: localize(15886, null)
      },
      async (progress) => this.doUpload(target, this.toTransfer(source), progress, cts.token),
      () => cts.dispose(true)
    );
    this.progressService.withProgress({ location: VIEW_ID2, delay: 500 }, () => uploadPromise);
    return uploadPromise;
  }
  toTransfer(source) {
    if (isDragEvent(source)) {
      return source.dataTransfer;
    }
    const transfer = { items: [] };
    for (const file of source) {
      transfer.items.push({
        webkitGetAsEntry: () => {
          return {
            name: file.name,
            isDirectory: false,
            isFile: true,
            createReader: () => {
              throw new Error("Unsupported for files");
            },
            file: (resolve3) => resolve3(file)
          };
        }
      });
    }
    return transfer;
  }
  async doUpload(target, source, progress, token) {
    const items = source.items;
    const entries2 = [];
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        entries2.push(entry);
      }
    }
    const results = [];
    const operation = {
      startTime: Date.now(),
      progressScheduler: new RunOnceWorker((steps) => {
        progress.report(steps[steps.length - 1]);
      }, 1e3),
      filesTotal: entries2.length,
      filesUploaded: 0,
      totalBytesUploaded: 0
    };
    const uploadLimiter = new Limiter(BrowserFileUpload.MAX_PARALLEL_UPLOADS);
    await Promises.settled(entries2.map((entry) => {
      return uploadLimiter.queue(async () => {
        if (token.isCancellationRequested) {
          return;
        }
        if (target && entry.name && target.getChild(entry.name)) {
          const { confirmed } = await this.dialogService.confirm(getFileOverwriteConfirm(entry.name));
          if (!confirmed) {
            return;
          }
          await this.explorerService.applyBulkEdit([new ResourceFileEdit(joinPath(target.resource, entry.name), void 0, { recursive: true, folder: target.getChild(entry.name)?.isDirectory })], {
            undoLabel: localize(15883, null, entry.name),
            progressLabel: localize(15884, null, entry.name)
          });
          if (token.isCancellationRequested) {
            return;
          }
        }
        const result = await this.doUploadEntry(entry, target.resource, target, progress, operation, token);
        if (result) {
          results.push(result);
        }
      });
    }));
    operation.progressScheduler.dispose();
    const firstUploadedFile = results[0];
    if (!token.isCancellationRequested && firstUploadedFile?.isFile) {
      await this.editorService.openEditor({ resource: firstUploadedFile.resource, options: { pinned: true } });
    }
  }
  async doUploadEntry(entry, parentResource, target, progress, operation, token) {
    if (token.isCancellationRequested || !entry.name || !entry.isFile && !entry.isDirectory) {
      return void 0;
    }
    let fileBytesUploaded = 0;
    const reportProgress = (fileSize, bytesUploaded) => {
      fileBytesUploaded += bytesUploaded;
      operation.totalBytesUploaded += bytesUploaded;
      const bytesUploadedPerSecond = operation.totalBytesUploaded / ((Date.now() - operation.startTime) / 1e3);
      let message;
      if (fileSize < ByteSize.MB) {
        if (operation.filesTotal === 1) {
          message = `${entry.name}`;
        } else {
          message = localize(15888, null, operation.filesUploaded, operation.filesTotal, ByteSize.formatSize(bytesUploadedPerSecond));
        }
      } else {
        message = localize(15887, null, entry.name, ByteSize.formatSize(fileBytesUploaded), ByteSize.formatSize(fileSize), ByteSize.formatSize(bytesUploadedPerSecond));
      }
      operation.progressScheduler.work({ message });
    };
    operation.filesUploaded++;
    reportProgress(0, 0);
    const resource = joinPath(parentResource, entry.name);
    if (entry.isFile) {
      const file = await new Promise((resolve3, reject) => entry.file(resolve3, reject));
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (typeof file.stream === "function" && file.size > ByteSize.MB) {
        await this.doUploadFileBuffered(resource, file, reportProgress, token);
      } else {
        await this.doUploadFileUnbuffered(resource, file, reportProgress);
      }
      return { isFile: true, resource };
    } else {
      await this.fileService.createFolder(resource);
      if (token.isCancellationRequested) {
        return void 0;
      }
      const dirReader = entry.createReader();
      const childEntries = [];
      let done = false;
      do {
        const childEntriesChunk = await new Promise((resolve3, reject) => dirReader.readEntries(resolve3, reject));
        if (childEntriesChunk.length > 0) {
          childEntries.push(...childEntriesChunk);
        } else {
          done = true;
        }
      } while (!done && !token.isCancellationRequested);
      operation.filesTotal += childEntries.length;
      const folderTarget = target?.getChild(entry.name) || void 0;
      const fileChildEntries = [];
      const folderChildEntries = [];
      for (const childEntry of childEntries) {
        if (childEntry.isFile) {
          fileChildEntries.push(childEntry);
        } else if (childEntry.isDirectory) {
          folderChildEntries.push(childEntry);
        }
      }
      const fileUploadQueue = new Limiter(BrowserFileUpload.MAX_PARALLEL_UPLOADS);
      await Promises.settled(fileChildEntries.map((fileChildEntry) => {
        return fileUploadQueue.queue(() => this.doUploadEntry(fileChildEntry, resource, folderTarget, progress, operation, token));
      }));
      for (const folderChildEntry of folderChildEntries) {
        await this.doUploadEntry(folderChildEntry, resource, folderTarget, progress, operation, token);
      }
      return { isFile: false, resource };
    }
  }
  async doUploadFileBuffered(resource, file, progressReporter, token) {
    const writeableStream = newWriteableBufferStream({
      // Set a highWaterMark to prevent the stream
      // for file upload to produce large buffers
      // in-memory
      highWaterMark: 10
    });
    const writeFilePromise = this.fileService.writeFile(resource, writeableStream);
    try {
      const reader = file.stream().getReader();
      let res = await reader.read();
      while (!res.done) {
        if (token.isCancellationRequested) {
          break;
        }
        const buffer = VSBuffer.wrap(res.value);
        await writeableStream.write(buffer);
        if (token.isCancellationRequested) {
          break;
        }
        progressReporter(file.size, buffer.byteLength);
        res = await reader.read();
      }
      writeableStream.end(void 0);
    } catch (error) {
      writeableStream.error(error);
      writeableStream.end();
    }
    if (token.isCancellationRequested) {
      return void 0;
    }
    await writeFilePromise;
  }
  doUploadFileUnbuffered(resource, file, progressReporter) {
    return new Promise((resolve3, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (event.target?.result instanceof ArrayBuffer) {
            const buffer = VSBuffer.wrap(new Uint8Array(event.target.result));
            await this.fileService.writeFile(resource, buffer);
            progressReporter(file.size, buffer.byteLength);
          } else {
            throw new Error("Could not read from dropped file.");
          }
          resolve3();
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
};

BrowserFileUpload = __decorateClass([
  __decorateParam(0, IProgressService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IExplorerService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IFileService)
], BrowserFileUpload);

var ExternalFileImport = class {
  constructor(fileService, hostService, contextService, configurationService, dialogService, workspaceEditingService, explorerService, editorService, progressService, notificationService, instantiationService) {
    this.fileService = fileService;
    this.hostService = hostService;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.workspaceEditingService = workspaceEditingService;
    this.explorerService = explorerService;
    this.editorService = editorService;
    this.progressService = progressService;
    this.notificationService = notificationService;
    this.instantiationService = instantiationService;
  }
  async import(target, source, targetWindow) {
    const cts = new CancellationTokenSource();
    const importPromise = this.progressService.withProgress(
      {
        location: 10 /* Window */,
        delay: 800,
        cancellable: true,
        title: localize(15868, null)
      },
      async () => await this.doImport(target, source, targetWindow, cts.token),
      () => cts.dispose(true)
    );
    this.progressService.withProgress({ location: VIEW_ID2, delay: 500 }, () => importPromise);
    return importPromise;
  }
  async doImport(target, source, targetWindow, token) {
    const candidateFiles = coalesce((await this.instantiationService.invokeFunction((accessor) => extractEditorsAndFilesDropData(accessor, source))).map((editor) => editor.resource));
    await Promise.all(candidateFiles.map((resource) => this.fileService.activateProvider(resource.scheme)));
    const files = coalesce(candidateFiles.filter((resource) => this.fileService.hasProvider(resource)));
    const resolvedFiles = await this.fileService.resolveAll(files.map((file) => ({ resource: file })));
    if (token.isCancellationRequested) {
      return;
    }
    this.hostService.focus(targetWindow);
    const folders = resolvedFiles.filter((resolvedFile) => resolvedFile.success && resolvedFile.stat?.isDirectory).map((resolvedFile) => ({ uri: resolvedFile.stat.resource }));
    if (folders.length > 0 && target.isRoot) {
      let ImportChoice;
      ((ImportChoice2) => {
        ImportChoice2[ImportChoice2["Copy"] = 1] = "Copy";
        ImportChoice2[ImportChoice2["Add"] = 2] = "Add";
      })(ImportChoice || (ImportChoice = {}));
      const buttons = [
        {
          label: folders.length > 1 ? localize(15866, null) : localize(15864, null),
          run: () => 1 /* Copy */
        }
      ];
      let message;
      const workspaceFolderSchemas = this.contextService.getWorkspace().folders.map((folder) => folder.uri.scheme);
      if (folders.some((folder) => workspaceFolderSchemas.indexOf(folder.uri.scheme) >= 0)) {
        buttons.unshift({
          label: folders.length > 1 ? localize(15859, null) : localize(15858, null),
          run: () => 2 /* Add */
        });
        message = folders.length > 1 ? localize(15877, null) : localize(15876, null, basename2(folders[0].uri));
      } else {
        message = folders.length > 1 ? localize(15865, null) : localize(15863, null, basename2(folders[0].uri));
      }
      const { result } = await this.dialogService.prompt({
        type: Severity2.Info,
        message,
        buttons,
        cancelButton: true
      });
      if (result === 2 /* Add */) {
        return this.workspaceEditingService.addFolders(folders);
      }
      if (result === 1 /* Copy */) {
        return this.importResources(target, files, token);
      }
    } else if (target instanceof ExplorerItem) {
      return this.importResources(target, files, token);
    }
  }
  async importResources(target, resources, token) {
    if (resources && resources.length > 0) {
      const targetStat = await this.fileService.resolve(target.resource);
      if (token.isCancellationRequested) {
        return;
      }
      const targetNames = /* @__PURE__ */ new Set();
      const caseSensitive = this.fileService.hasCapability(target.resource, 1024 /* PathCaseSensitive */);
      if (targetStat.children) {
        targetStat.children.forEach((child) => {
          targetNames.add(caseSensitive ? child.name : child.name.toLowerCase());
        });
      }
      let inaccessibleFileCount = 0;
      const resourcesFiltered = coalesce(await Promises.settled(resources.map(async (resource) => {
        const fileDoesNotExist = !await this.fileService.exists(resource);
        if (fileDoesNotExist) {
          inaccessibleFileCount++;
          return void 0;
        }
        if (targetNames.has(caseSensitive ? basename2(resource) : basename2(resource).toLowerCase())) {
          const confirmationResult = await this.dialogService.confirm(getFileOverwriteConfirm(basename2(resource)));
          if (!confirmationResult.confirmed) {
            return void 0;
          }
        }
        return resource;
      })));
      if (inaccessibleFileCount > 0) {
        this.notificationService.error(inaccessibleFileCount > 1 ? localize(15879, null) : localize(15878, null));
      }
      const resourceFileEdits = resourcesFiltered.map((resource) => {
        const sourceFileName = basename2(resource);
        const targetFile = joinPath(target.resource, sourceFileName);
        return new ResourceFileEdit(resource, targetFile, { overwrite: true, copy: true });
      });
      const undoLevel = this.configurationService.getValue().explorer.confirmUndo;
      await this.explorerService.applyBulkEdit(resourceFileEdits, {
        undoLabel: resourcesFiltered.length === 1 ? localize(15880, null, basename2(resourcesFiltered[0])) : localize(15881, null, resourcesFiltered.length),
        progressLabel: resourcesFiltered.length === 1 ? localize(15867, null, basename2(resourcesFiltered[0])) : localize(15869, null, resourcesFiltered.length),
        progressLocation: 10 /* Window */,
        confirmBeforeUndo: undoLevel === "verbose" /* Verbose */ || undoLevel === "default" /* Default */
      });
      const autoOpen = this.configurationService.getValue().explorer.autoOpenDroppedFile;
      if (autoOpen && resourceFileEdits.length === 1) {
        const item = this.explorerService.findClosest(resourceFileEdits[0].newResource);
        if (item && !item.isDirectory) {
          this.editorService.openEditor({ resource: item.resource, options: { pinned: true } });
        }
      }
    }
  }
};

ExternalFileImport = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IWorkspaceEditingService),
  __decorateParam(6, IExplorerService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IProgressService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IInstantiationService)
], ExternalFileImport);

var FileDownload = class {
  constructor(fileService, explorerService, progressService, logService, fileDialogService, storageService) {
    this.fileService = fileService;
    this.explorerService = explorerService;
    this.progressService = progressService;
    this.logService = logService;
    this.fileDialogService = fileDialogService;
    this.storageService = storageService;
  }
  static {
    this.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY = "workbench.explorer.downloadPath";
  }
  download(source) {
    const cts = new CancellationTokenSource();
    const downloadPromise = this.progressService.withProgress(
      {
        location: 10 /* Window */,
        delay: 800,
        cancellable: isWeb,
        title: localize(15873, null)
      },
      async (progress) => this.doDownload(source, progress, cts),
      () => cts.dispose(true)
    );
    this.progressService.withProgress({ location: VIEW_ID2, delay: 500 }, () => downloadPromise);
    return downloadPromise;
  }
  async doDownload(sources, progress, cts) {
    for (const source of sources) {
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (isWeb) {
        await this.doDownloadBrowser(source.resource, progress, cts);
      } else {
        await this.doDownloadNative(source, progress, cts);
      }
    }
  }
  async doDownloadBrowser(resource, progress, cts) {
    const stat = await this.fileService.resolve(resource, { resolveMetadata: true });
    if (cts.token.isCancellationRequested) {
      return;
    }
    const maxBlobDownloadSize = 32 * ByteSize.MB;
    const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
    const activeWindow = getActiveWindow();
    if (preferFileSystemAccessWebApis && WebFileSystemAccess.supported(activeWindow)) {
      try {
        const parentFolder = await activeWindow.showDirectoryPicker();
        const operation = {
          startTime: Date.now(),
          progressScheduler: new RunOnceWorker((steps) => {
            progress.report(steps[steps.length - 1]);
          }, 1e3),
          filesTotal: stat.isDirectory ? 0 : 1,
          // folders increment filesTotal within downloadFolder method
          filesDownloaded: 0,
          totalBytesDownloaded: 0,
          fileBytesDownloaded: 0
        };
        if (stat.isDirectory) {
          const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
          await this.downloadFolderBrowser(stat, targetFolder, operation, cts.token);
        } else {
          await this.downloadFileBrowser(parentFolder, stat, operation, cts.token);
        }
        operation.progressScheduler.dispose();
      } catch (error) {
        this.logService.warn(error);
        cts.cancel();
      }
    } else if (stat.isFile) {
      let bufferOrUri;
      try {
        bufferOrUri = (await this.fileService.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } }, cts.token)).value.buffer;
      } catch (error) {
        bufferOrUri = FileAccess.uriToBrowserUri(stat.resource);
      }
      if (!cts.token.isCancellationRequested) {
        triggerDownload(bufferOrUri, stat.name);
      }
    }
  }
  async downloadFileBufferedBrowser(resource, target, operation, token) {
    const contents = await this.fileService.readFileStream(resource, void 0, token);
    if (token.isCancellationRequested) {
      target.close();
      return;
    }
    return new Promise((resolve3, reject) => {
      const sourceStream = contents.value;
      const disposables = new DisposableStore();
      disposables.add(toDisposable(() => target.close()));
      disposables.add(createSingleCallFunction(token.onCancellationRequested)(() => {
        disposables.dispose();
        reject(canceled());
      }));
      listenStream(sourceStream, {
        onData: (data) => {
          target.write(data.buffer);
          this.reportProgress(contents.name, contents.size, data.byteLength, operation);
        },
        onError: (error) => {
          disposables.dispose();
          reject(error);
        },
        onEnd: () => {
          disposables.dispose();
          resolve3();
        }
      }, token);
    });
  }
  async downloadFileUnbufferedBrowser(resource, target, operation, token) {
    const contents = await this.fileService.readFile(resource, void 0, token);
    if (!token.isCancellationRequested) {
      target.write(contents.value.buffer);
      this.reportProgress(contents.name, contents.size, contents.value.byteLength, operation);
    }
    target.close();
  }
  async downloadFileBrowser(targetFolder, file, operation, token) {
    operation.filesDownloaded++;
    operation.fileBytesDownloaded = 0;
    this.reportProgress(file.name, 0, 0, operation);
    const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
    const targetFileWriter = await targetFile.createWritable();
    if (file.size > ByteSize.MB) {
      return this.downloadFileBufferedBrowser(file.resource, targetFileWriter, operation, token);
    }
    return this.downloadFileUnbufferedBrowser(file.resource, targetFileWriter, operation, token);
  }
  async downloadFolderBrowser(folder, targetFolder, operation, token) {
    if (folder.children) {
      operation.filesTotal += folder.children.map((child) => child.isFile).length;
      for (const child of folder.children) {
        if (token.isCancellationRequested) {
          return;
        }
        if (child.isFile) {
          await this.downloadFileBrowser(targetFolder, child, operation, token);
        } else {
          const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
          const resolvedChildFolder = await this.fileService.resolve(child.resource, { resolveMetadata: true });
          await this.downloadFolderBrowser(resolvedChildFolder, childFolder, operation, token);
        }
      }
    }
  }
  reportProgress(name, fileSize, bytesDownloaded, operation) {
    operation.fileBytesDownloaded += bytesDownloaded;
    operation.totalBytesDownloaded += bytesDownloaded;
    const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1e3);
    let message;
    if (fileSize < ByteSize.MB) {
      if (operation.filesTotal === 1) {
        message = name;
      } else {
        message = localize(15875, null, operation.filesDownloaded, operation.filesTotal, ByteSize.formatSize(bytesDownloadedPerSecond));
      }
    } else {
      message = localize(15874, null, name, ByteSize.formatSize(operation.fileBytesDownloaded), ByteSize.formatSize(fileSize), ByteSize.formatSize(bytesDownloadedPerSecond));
    }
    operation.progressScheduler.work({ message });
  }
  async doDownloadNative(explorerItem, progress, cts) {
    progress.report({ message: explorerItem.name });
    let defaultUri;
    const lastUsedDownloadPath = this.storageService.get(FileDownload.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, -1 /* APPLICATION */);
    if (lastUsedDownloadPath) {
      defaultUri = joinPath(URI.file(lastUsedDownloadPath), explorerItem.name);
    } else {
      defaultUri = joinPath(
        explorerItem.isDirectory ? await this.fileDialogService.defaultFolderPath(Schemas.file) : await this.fileDialogService.defaultFilePath(Schemas.file),
        explorerItem.name
      );
    }
    const destination = await this.fileDialogService.showSaveDialog({
      availableFileSystems: [Schemas.file],
      saveLabel: localize(15871, null),
      title: localize(15860, null),
      defaultUri
    });
    if (destination) {
      this.storageService.store(FileDownload.LAST_USED_DOWNLOAD_PATH_STORAGE_KEY, dirname2(destination).fsPath, -1 /* APPLICATION */, 1 /* MACHINE */);
      await this.explorerService.applyBulkEdit([new ResourceFileEdit(explorerItem.resource, destination, { overwrite: true, copy: true })], {
        undoLabel: localize(15870, null, explorerItem.name),
        progressLabel: localize(15872, null, explorerItem.name),
        progressLocation: 10 /* Window */
      });
    } else {
      cts.cancel();
    }
  }
};

FileDownload = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IExplorerService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, IStorageService)
], FileDownload);

function getFileOverwriteConfirm(name) {
  return {
    message: localize(15862, null, name),
    detail: localize(15882, null),
    primaryButton: localize(15885, null),
    type: "warning"
  };
}

function getMultipleFilesOverwriteConfirm(files) {
  if (files.length > 1) {
    return {
      message: localize(15861, null, files.length),
      detail: getFileNamesMessage(files) + "\n" + localize(15882, null),
      primaryButton: localize(15885, null),
      type: "warning"
    };
  }
  return getFileOverwriteConfirm(basename2(files[0]));
}
export { getFileOverwriteConfirm, getMultipleFilesOverwriteConfirm, BrowserFileUpload, ExternalFileImport, FileDownload };
