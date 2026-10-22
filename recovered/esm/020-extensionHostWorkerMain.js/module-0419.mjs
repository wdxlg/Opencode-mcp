// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebook.ts
import { ResourceMap, ResourceSet } from "./module-0006.mjs";
import { Emitter } from "./module-0019.mjs";
import { Cache2 } from "./module-0353.mjs";
import { MainContext } from "./module-0025.mjs";
import { NotebookData2, NotebookDocumentContentOptions, NotebookExclusiveDocumentPattern, NotebookRange2, NotebookStatusBarItem, ViewColumn2 } from "./module-0239.mjs";
import { Disposable2 } from "./module-0238.mjs";
import { URI } from "./module-0023.mjs";
import { assertReturnsDefined } from "./module-0009.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { isFalsyOrWhitespace } from "./module-0029.mjs";
import { SerializableObjectWithBuffers } from "./module-0024.mjs";
import { VSBuffer } from "./module-0013.mjs";
import { ETAG_DISABLED, FileOperationError, etag } from "./module-0057.mjs";
import { localize } from "./module-0015.mjs";
import { filter } from "./module-0055.mjs";
import { NotebookCellData } from "./module-0231.mjs";
import { CancellationError } from "./module-0002.mjs";
import { globMatchesResource } from "./module-0418.mjs";
import { CellSearchModel } from "./module-0415.mjs";
import { genericCellMatchesToTextSearchMatches } from "./module-0416.mjs";
import { Schemas } from "./module-0031.mjs";
import { ExtHostNotebookEditor } from "./module-0407.mjs";
import { ExtHostCell, ExtHostNotebookDocument } from "./module-0406.mjs";
import { ApiCommand, ApiCommandArgument, ApiCommandResult } from "./module-0261.mjs";


// src/vs/workbench/api/common/extHostNotebook.ts
var ExtHostNotebookController = class _ExtHostNotebookController {
  constructor(mainContext, commands, _textDocumentsAndEditors, _textDocuments, _extHostFileSystem, _extHostSearch, _logService) {
    this._textDocumentsAndEditors = _textDocumentsAndEditors;
    this._textDocuments = _textDocuments;
    this._extHostFileSystem = _extHostFileSystem;
    this._extHostSearch = _extHostSearch;
    this._logService = _logService;
    this._notebookStatusBarItemProviders = /* @__PURE__ */ new Map();
    this._documents = new ResourceMap();
    this._editors = /* @__PURE__ */ new Map();
    this._onDidChangeActiveNotebookEditor = new Emitter();
    this.onDidChangeActiveNotebookEditor = this._onDidChangeActiveNotebookEditor.event;
    this._visibleNotebookEditors = [];
    this._onDidOpenNotebookDocument = new Emitter();
    this.onDidOpenNotebookDocument = this._onDidOpenNotebookDocument.event;
    this._onDidCloseNotebookDocument = new Emitter();
    this.onDidCloseNotebookDocument = this._onDidCloseNotebookDocument.event;
    this._onDidChangeVisibleNotebookEditors = new Emitter();
    this.onDidChangeVisibleNotebookEditors = this._onDidChangeVisibleNotebookEditors.event;
    this._statusBarCache = new Cache2("NotebookCellStatusBarCache");
    // --- serialize/deserialize
    this._handlePool = 0;
    this._notebookSerializer = /* @__PURE__ */ new Map();
    this._notebookProxy = mainContext.getProxy(MainContext.MainThreadNotebook);
    this._notebookDocumentsProxy = mainContext.getProxy(MainContext.MainThreadNotebookDocuments);
    this._notebookEditorsProxy = mainContext.getProxy(MainContext.MainThreadNotebookEditors);
    this._commandsConverter = commands.converter;
    commands.registerArgumentProcessor({
      // Serialized INotebookCellActionContext
      processArgument: (arg) => {
        if (arg && arg.$mid === 13 /* NotebookCellActionContext */) {
          const notebookUri = arg.notebookEditor?.notebookUri;
          const cellHandle = arg.cell.handle;
          const data2 = this._documents.get(notebookUri);
          const cell = data2?.getCell(cellHandle);
          if (cell) {
            return cell.apiCell;
          }
        }
        if (arg && arg.$mid === 14 /* NotebookActionContext */) {
          const notebookUri = arg.uri;
          const data2 = this._documents.get(notebookUri);
          if (data2) {
            return data2.apiNotebook;
          }
        }
        return arg;
      }
    });
    _ExtHostNotebookController._registerApiCommands(commands);
  }
  static {
    this._notebookStatusBarItemProviderHandlePool = 0;
  }
  get activeNotebookEditor() {
    return this._activeNotebookEditor?.apiEditor;
  }
  get visibleNotebookEditors() {
    return this._visibleNotebookEditors.map((editor) => editor.apiEditor);
  }
  getEditorById(editorId) {
    const editor = this._editors.get(editorId);
    if (!editor) {
      throw new Error(`unknown text editor: ${editorId}. known editors: ${[...this._editors.keys()]} `);
    }
    return editor;
  }
  getIdByEditor(editor) {
    for (const [id2, candidate] of this._editors) {
      if (candidate.apiEditor === editor) {
        return id2;
      }
    }
    return void 0;
  }
  get notebookDocuments() {
    return [...this._documents.values()];
  }
  getNotebookDocument(uri2, relaxed) {
    const result = this._documents.get(uri2);
    if (!result && !relaxed) {
      throw new Error(`NO notebook document for '${uri2}'`);
    }
    return result;
  }
  static _convertNotebookRegistrationData(extension, registration) {
    if (!registration) {
      return;
    }
    const viewOptionsFilenamePattern = registration.filenamePattern.map((pattern) => NotebookExclusiveDocumentPattern.from(pattern)).filter((pattern) => pattern !== void 0);
    if (registration.filenamePattern && !viewOptionsFilenamePattern) {
      console.warn(`Notebook content provider view options file name pattern is invalid ${registration.filenamePattern}`);
      return void 0;
    }
    return {
      extension: extension.identifier,
      providerDisplayName: extension.displayName || extension.name,
      displayName: registration.displayName,
      filenamePattern: viewOptionsFilenamePattern,
      priority: registration.exclusive ? "exclusive" /* exclusive */ : void 0
    };
  }
  registerNotebookCellStatusBarItemProvider(extension, notebookType, provider) {
    const handle = _ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++;
    const eventHandle = typeof provider.onDidChangeCellStatusBarItems === "function" ? _ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++ : void 0;
    this._notebookStatusBarItemProviders.set(handle, provider);
    this._notebookProxy.$registerNotebookCellStatusBarItemProvider(handle, eventHandle, notebookType);
    let subscription;
    if (eventHandle !== void 0) {
      subscription = provider.onDidChangeCellStatusBarItems((_) => this._notebookProxy.$emitCellStatusBarEvent(eventHandle));
    }
    return new Disposable2(() => {
      this._notebookStatusBarItemProviders.delete(handle);
      this._notebookProxy.$unregisterNotebookCellStatusBarItemProvider(handle, eventHandle);
      subscription?.dispose();
    });
  }
  async createNotebookDocument(options2) {
    const canonicalUri = await this._notebookDocumentsProxy.$tryCreateNotebook({
      viewType: options2.viewType,
      content: options2.content && NotebookData2.from(options2.content)
    });
    return URI.revive(canonicalUri);
  }
  async openNotebookDocument(uri2) {
    const cached = this._documents.get(uri2);
    if (cached) {
      return cached.apiNotebook;
    }
    const canonicalUri = await this._notebookDocumentsProxy.$tryOpenNotebook(uri2);
    const document2 = this._documents.get(URI.revive(canonicalUri));
    return assertReturnsDefined(document2?.apiNotebook);
  }
  async showNotebookDocument(notebook, options2) {
    let resolvedOptions;
    if (typeof options2 === "object") {
      resolvedOptions = {
        position: ViewColumn2.from(options2.viewColumn),
        preserveFocus: options2.preserveFocus,
        selections: options2.selections && options2.selections.map(NotebookRange2.from),
        pinned: typeof options2.preview === "boolean" ? !options2.preview : void 0,
        label: typeof options2.asRepl === "string" ? options2.asRepl : typeof options2.asRepl === "object" ? options2.asRepl.label : void 0
      };
    } else {
      resolvedOptions = {
        preserveFocus: false,
        pinned: true
      };
    }
    const viewType = !!options2?.asRepl ? "repl" : notebook.notebookType;
    const editorId = await this._notebookEditorsProxy.$tryShowNotebookDocument(notebook.uri, viewType, resolvedOptions);
    const editor = editorId && this._editors.get(editorId)?.apiEditor;
    if (editor) {
      return editor;
    }
    if (editorId) {
      throw new Error(`Could NOT open editor for "${notebook.uri.toString()}" because another editor opened in the meantime.`);
    } else {
      throw new Error(`Could NOT open editor for "${notebook.uri.toString()}".`);
    }
  }
  async $provideNotebookCellStatusBarItems(handle, uri2, index, token) {
    const provider = this._notebookStatusBarItemProviders.get(handle);
    const revivedUri = URI.revive(uri2);
    const document2 = this._documents.get(revivedUri);
    if (!document2 || !provider) {
      return;
    }
    const cell = document2.getCellFromIndex(index);
    if (!cell) {
      return;
    }
    const result = await provider.provideCellStatusBarItems(cell.apiCell, token);
    if (!result) {
      return void 0;
    }
    const disposables = new DisposableStore();
    const cacheId = this._statusBarCache.add([disposables]);
    const resultArr = Array.isArray(result) ? result : [result];
    const items = resultArr.map((item) => NotebookStatusBarItem.from(item, this._commandsConverter, disposables));
    return {
      cacheId,
      items
    };
  }
  $releaseNotebookCellStatusBarItems(cacheId) {
    this._statusBarCache.delete(cacheId);
  }
  registerNotebookSerializer(extension, viewType, serializer, options2, registration) {
    if (isFalsyOrWhitespace(viewType)) {
      throw new Error(`viewType cannot be empty or just whitespace`);
    }
    const handle = this._handlePool++;
    this._notebookSerializer.set(handle, { viewType, serializer, options: options2 });
    this._notebookProxy.$registerNotebookSerializer(
      handle,
      { id: extension.identifier, location: extension.extensionLocation },
      viewType,
      NotebookDocumentContentOptions.from(options2),
      _ExtHostNotebookController._convertNotebookRegistrationData(extension, registration)
    );
    return toDisposable(() => {
      this._notebookProxy.$unregisterNotebookSerializer(handle);
    });
  }
  async $dataToNotebook(handle, bytes, token) {
    const serializer = this._notebookSerializer.get(handle);
    if (!serializer) {
      throw new Error("NO serializer found");
    }
    const data2 = await serializer.serializer.deserializeNotebook(bytes.buffer, token);
    return new SerializableObjectWithBuffers(NotebookData2.from(data2));
  }
  async $notebookToData(handle, data2, token) {
    const serializer = this._notebookSerializer.get(handle);
    if (!serializer) {
      throw new Error("NO serializer found");
    }
    const bytes = await serializer.serializer.serializeNotebook(NotebookData2.to(data2.value), token);
    return VSBuffer.wrap(bytes);
  }
  async $saveNotebook(handle, uriComponents, versionId, options2, token) {
    const uri2 = URI.revive(uriComponents);
    const serializer = this._notebookSerializer.get(handle);
    this.trace(`enter saveNotebook(versionId: ${versionId}, ${uri2.toString()})`);
    try {
      if (!serializer) {
        throw new NotebookSaveError("NO serializer found");
      }
      const document2 = this._documents.get(uri2);
      if (!document2) {
        throw new NotebookSaveError("Document NOT found");
      }
      if (document2.versionId !== versionId) {
        throw new NotebookSaveError("Document version mismatch, expected: " + versionId + ", actual: " + document2.versionId);
      }
      if (!this._extHostFileSystem.value.isWritableFileSystem(uri2.scheme)) {
        throw new FileOperationError(localize(5886, null, this._resourceForError(uri2)), 6 /* FILE_PERMISSION_DENIED */);
      }
      const data2 = {
        metadata: filter(document2.apiNotebook.metadata, (key) => !(serializer.options?.transientDocumentMetadata ?? {})[key]),
        cells: []
      };
      for (const cell of document2.apiNotebook.getCells()) {
        const cellData = new NotebookCellData(
          cell.kind,
          cell.document.getText(),
          cell.document.languageId,
          cell.mime,
          !serializer.options?.transientOutputs ? [...cell.outputs] : [],
          cell.metadata,
          cell.executionSummary
        );
        cellData.metadata = filter(cell.metadata, (key) => !(serializer.options?.transientCellMetadata ?? {})[key]);
        data2.cells.push(cellData);
      }
      await this._validateWriteFile(uri2, options2);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const bytes = await serializer.serializer.serializeNotebook(data2, token);
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      this.trace(`serialized versionId: ${versionId} ${uri2.toString()}`);
      await this._extHostFileSystem.value.writeFile(uri2, bytes);
      this.trace(`Finished write versionId: ${versionId} ${uri2.toString()}`);
      const providerExtUri = this._extHostFileSystem.getFileSystemProviderExtUri(uri2.scheme);
      const stat = await this._extHostFileSystem.value.stat(uri2);
      const fileStats = {
        name: providerExtUri.basename(uri2),
        isFile: (stat.type & 1 /* File */) !== 0,
        isDirectory: (stat.type & 2 /* Directory */) !== 0,
        isSymbolicLink: (stat.type & 64 /* SymbolicLink */) !== 0,
        mtime: stat.mtime,
        ctime: stat.ctime,
        size: stat.size,
        readonly: Boolean((stat.permissions ?? 0) & 1 /* Readonly */) || !this._extHostFileSystem.value.isWritableFileSystem(uri2.scheme),
        locked: Boolean((stat.permissions ?? 0) & 2 /* Locked */),
        executable: Boolean((stat.permissions ?? 0) & 4 /* Executable */),
        etag: etag({ mtime: stat.mtime, size: stat.size })
      };
      this.trace(`exit saveNotebook(versionId: ${versionId}, ${uri2.toString()})`);
      return fileStats;
    } catch (error) {
      if (error instanceof FileOperationError) {
        return { ...error, message: error.message };
      }
      throw error;
    }
  }
  /**
   * Search for query in all notebooks that can be deserialized by the serializer fetched by `handle`.
   *
   * @param handle used to get notebook serializer
   * @param textQuery the text query to search using
   * @param viewTypeFileTargets the globs (and associated ranks) that are targetting for opening this type of notebook
   * @param otherViewTypeFileTargets ranked globs for other editors that we should consider when deciding whether it will open as this notebook
   * @param token cancellation token
   * @returns `IRawClosedNotebookFileMatch` for every file. Files without matches will just have a `IRawClosedNotebookFileMatch`
   * 	with no `cellResults`. This allows the caller to know what was searched in already, even if it did not yield results.
   */
  async $searchInNotebooks(handle, textQuery, viewTypeFileTargets, otherViewTypeFileTargets, token) {
    const serializer = this._notebookSerializer.get(handle)?.serializer;
    if (!serializer) {
      return {
        limitHit: false,
        results: []
      };
    }
    const finalMatchedTargets = new ResourceSet();
    const runFileQueries = async (includes, token2, textQuery2) => {
      await Promise.all(includes.map(
        async (include) => await Promise.all(include.filenamePatterns.map((filePattern) => {
          const query = {
            _reason: textQuery2._reason,
            folderQueries: textQuery2.folderQueries,
            includePattern: textQuery2.includePattern,
            excludePattern: textQuery2.excludePattern,
            maxResults: textQuery2.maxResults,
            type: 1 /* File */,
            filePattern
          };
          return this._extHostSearch.doInternalFileSearchWithCustomCallback(query, token2, (data2) => {
            data2.forEach((uri2) => {
              if (finalMatchedTargets.has(uri2)) {
                return;
              }
              const hasOtherMatches = otherViewTypeFileTargets.some((target) => {
                if (include.isFromSettings && !target.isFromSettings) {
                  return false;
                } else {
                  return target.filenamePatterns.some((targetFilePattern) => globMatchesResource(targetFilePattern, uri2));
                }
              });
              if (hasOtherMatches) {
                return;
              }
              finalMatchedTargets.add(uri2);
            });
          }).catch((err) => {
            if (err.code === "ENOENT") {
              console.warn(`Could not find notebook search results, ignoring notebook results.`);
              return {
                limitHit: false,
                messages: []
              };
            } else {
              throw err;
            }
          });
        }))
      ));
      return;
    };
    await runFileQueries(viewTypeFileTargets, token, textQuery);
    const results = new ResourceMap();
    let limitHit = false;
    const promises = Array.from(finalMatchedTargets).map(async (uri2) => {
      const cellMatches = [];
      try {
        if (token.isCancellationRequested) {
          return;
        }
        if (textQuery.maxResults && [...results.values()].reduce((acc, value) => acc + value.cellResults.length, 0) > textQuery.maxResults) {
          limitHit = true;
          return;
        }
        const simpleCells = [];
        const notebook = this._documents.get(uri2);
        if (notebook) {
          const cells = notebook.apiNotebook.getCells();
          cells.forEach((e) => simpleCells.push(
            {
              input: e.document.getText(),
              outputs: e.outputs.flatMap((value) => value.items.map((output) => output.data.toString()))
            }
          ));
        } else {
          const fileContent = await this._extHostFileSystem.value.readFile(uri2);
          const bytes = VSBuffer.fromString(fileContent.toString());
          const notebook2 = await serializer.deserializeNotebook(bytes.buffer, token);
          if (token.isCancellationRequested) {
            return;
          }
          const data2 = NotebookData2.from(notebook2);
          data2.cells.forEach((cell) => simpleCells.push(
            {
              input: cell.source,
              outputs: cell.outputs.flatMap((value) => value.items.map((output) => output.valueBytes.toString()))
            }
          ));
        }
        if (token.isCancellationRequested) {
          return;
        }
        simpleCells.forEach((cell, index) => {
          const target = textQuery.contentPattern.pattern;
          const cellModel = new CellSearchModel(cell.input, void 0, cell.outputs);
          const inputMatches = cellModel.findInInputs(target);
          const outputMatches = cellModel.findInOutputs(target);
          const webviewResults = outputMatches.flatMap((outputMatch) => genericCellMatchesToTextSearchMatches(outputMatch.matches, outputMatch.textBuffer)).map((textMatch, index2) => {
            textMatch.webviewIndex = index2;
            return textMatch;
          });
          if (inputMatches.length > 0 || outputMatches.length > 0) {
            const cellMatch = {
              index,
              contentResults: genericCellMatchesToTextSearchMatches(inputMatches, cellModel.inputTextBuffer),
              webviewResults
            };
            cellMatches.push(cellMatch);
          }
        });
        const fileMatch = {
          resource: uri2,
          cellResults: cellMatches
        };
        results.set(uri2, fileMatch);
        return;
      } catch (e) {
        return;
      }
    });
    await Promise.all(promises);
    return {
      limitHit,
      results: [...results.values()]
    };
  }
  async _validateWriteFile(uri2, options2) {
    const stat = await this._extHostFileSystem.value.stat(uri2);
    if (typeof options2?.mtime === "number" && typeof options2.etag === "string" && options2.etag !== ETAG_DISABLED && typeof stat.mtime === "number" && typeof stat.size === "number" && options2.mtime < stat.mtime && options2.etag !== etag({ mtime: options2.mtime, size: stat.size })) {
      throw new FileOperationError(localize(5887, null), 3 /* FILE_MODIFIED_SINCE */, options2);
    }
    return;
  }
  _resourceForError(uri2) {
    return uri2.scheme === Schemas.file ? uri2.fsPath : uri2.toString();
  }
  // --- open, save, saveAs, backup
  _createExtHostEditor(document2, editorId, data2) {
    if (this._editors.has(editorId)) {
      throw new Error(`editor with id ALREADY EXSIST: ${editorId}`);
    }
    const editor = new ExtHostNotebookEditor(
      editorId,
      this._notebookEditorsProxy,
      document2,
      data2.visibleRanges.map(NotebookRange2.to),
      data2.selections.map(NotebookRange2.to),
      typeof data2.viewColumn === "number" ? ViewColumn2.to(data2.viewColumn) : void 0,
      data2.viewType
    );
    this._editors.set(editorId, editor);
  }
  $acceptDocumentAndEditorsDelta(delta3) {
    if (delta3.value.removedDocuments) {
      for (const uri2 of delta3.value.removedDocuments) {
        const revivedUri = URI.revive(uri2);
        const document2 = this._documents.get(revivedUri);
        if (document2) {
          document2.dispose();
          this._documents.delete(revivedUri);
          this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ removedDocuments: document2.apiNotebook.getCells().map((cell) => cell.document.uri) });
          this._onDidCloseNotebookDocument.fire(document2.apiNotebook);
        }
        for (const editor of this._editors.values()) {
          if (editor.notebookData.uri.toString() === revivedUri.toString()) {
            this._editors.delete(editor.id);
          }
        }
      }
    }
    if (delta3.value.addedDocuments) {
      const addedCellDocuments = [];
      for (const modelData of delta3.value.addedDocuments) {
        const uri2 = URI.revive(modelData.uri);
        if (this._documents.has(uri2)) {
          throw new Error(`adding EXISTING notebook ${uri2} `);
        }
        const document2 = new ExtHostNotebookDocument(
          this._notebookDocumentsProxy,
          this._textDocumentsAndEditors,
          this._textDocuments,
          uri2,
          modelData
        );
        addedCellDocuments.push(...modelData.cells.map((cell) => ExtHostCell.asModelAddData(cell)));
        this._documents.get(uri2)?.dispose();
        this._documents.set(uri2, document2);
        this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ addedDocuments: addedCellDocuments });
        this._onDidOpenNotebookDocument.fire(document2.apiNotebook);
      }
    }
    if (delta3.value.addedEditors) {
      for (const editorModelData of delta3.value.addedEditors) {
        if (this._editors.has(editorModelData.id)) {
          return;
        }
        const revivedUri = URI.revive(editorModelData.documentUri);
        const document2 = this._documents.get(revivedUri);
        if (document2) {
          this._createExtHostEditor(document2, editorModelData.id, editorModelData);
        }
      }
    }
    const removedEditors = [];
    if (delta3.value.removedEditors) {
      for (const editorid of delta3.value.removedEditors) {
        const editor = this._editors.get(editorid);
        if (editor) {
          this._editors.delete(editorid);
          if (this._activeNotebookEditor?.id === editor.id) {
            this._activeNotebookEditor = void 0;
          }
          removedEditors.push(editor);
        }
      }
    }
    if (delta3.value.visibleEditors) {
      this._visibleNotebookEditors = delta3.value.visibleEditors.map((id2) => this._editors.get(id2)).filter((editor) => !!editor);
      const visibleEditorsSet = /* @__PURE__ */ new Set();
      this._visibleNotebookEditors.forEach((editor) => visibleEditorsSet.add(editor.id));
      for (const editor of this._editors.values()) {
        const newValue = visibleEditorsSet.has(editor.id);
        editor._acceptVisibility(newValue);
      }
      this._visibleNotebookEditors = [...this._editors.values()].map((e) => e).filter((e) => e.visible);
      this._onDidChangeVisibleNotebookEditors.fire(this.visibleNotebookEditors);
    }
    if (delta3.value.newActiveEditor === null) {
      this._activeNotebookEditor = void 0;
    } else if (delta3.value.newActiveEditor) {
      const activeEditor = this._editors.get(delta3.value.newActiveEditor);
      if (!activeEditor) {
        console.error(`FAILED to find active notebook editor ${delta3.value.newActiveEditor}`);
      }
      this._activeNotebookEditor = this._editors.get(delta3.value.newActiveEditor);
    }
    if (delta3.value.newActiveEditor !== void 0) {
      this._onDidChangeActiveNotebookEditor.fire(this._activeNotebookEditor?.apiEditor);
    }
  }
  static _registerApiCommands(extHostCommands) {
    const notebookTypeArg = ApiCommandArgument.String.with("notebookType", "A notebook type");
    const commandDataToNotebook = new ApiCommand(
      "vscode.executeDataToNotebook",
      "_executeDataToNotebook",
      "Invoke notebook serializer",
      [notebookTypeArg, new ApiCommandArgument("data", "Bytes to convert to data", (v) => v instanceof Uint8Array, (v) => VSBuffer.wrap(v))],
      new ApiCommandResult("Notebook Data", (data2) => NotebookData2.to(data2.value))
    );
    const commandNotebookToData = new ApiCommand(
      "vscode.executeNotebookToData",
      "_executeNotebookToData",
      "Invoke notebook serializer",
      [notebookTypeArg, new ApiCommandArgument("NotebookData", "Notebook data to convert to bytes", (v) => true, (v) => new SerializableObjectWithBuffers(NotebookData2.from(v)))],
      new ApiCommandResult("Bytes", (dto) => dto.buffer)
    );
    extHostCommands.registerApiCommand(commandDataToNotebook);
    extHostCommands.registerApiCommand(commandNotebookToData);
  }
  trace(msg) {
    this._logService.trace(`[Extension Host Notebook] ${msg}`);
  }
};

var NotebookSaveError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NotebookSaveError";
  }
};
export { ExtHostNotebookController, NotebookSaveError };
