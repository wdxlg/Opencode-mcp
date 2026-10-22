// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookKernels.ts
import { ResourceMap } from "./module-0006.mjs";
import { MainContext } from "./module-0025.mjs";
import { ApiCommand, ApiCommandArgument, ApiCommandResult } from "./module-0261.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { Emitter } from "./module-0019.mjs";
import { NotebookCellOutput2, NotebookCellOutputItem2, NotebookKernelSourceAction2, NotebookRendererScript2 } from "./module-0239.mjs";
import { checkProposedApiEnabled } from "./module-0167.mjs";
import { asWebviewUri } from "./module-0345.mjs";
import { Disposable, DisposableStore } from "./module-0011.mjs";
import { URI } from "./module-0023.mjs";
import { variablePageSize } from "./module-0424.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0045.mjs";
import { CancellationTokenSource } from "./module-0026.mjs";
import { SerializableObjectWithBuffers } from "./module-0024.mjs";
import { NotebookCellOutput } from "./module-0231.mjs";
import { asArray } from "./module-0004.mjs";
import { DeferredPromise, timeout } from "./module-0034.mjs";


// src/vs/workbench/api/common/extHostNotebookKernels.ts
var ExtHostNotebookKernels = class {
  constructor(mainContext, _initData, _extHostNotebook, _commands, _logService) {
    this._initData = _initData;
    this._extHostNotebook = _extHostNotebook;
    this._commands = _commands;
    this._logService = _logService;
    this._activeExecutions = new ResourceMap();
    this._activeNotebookExecutions = new ResourceMap();
    this._kernelDetectionTask = /* @__PURE__ */ new Map();
    this._kernelDetectionTaskHandlePool = 0;
    this._kernelSourceActionProviders = /* @__PURE__ */ new Map();
    this._kernelSourceActionProviderHandlePool = 0;
    this._kernelData = /* @__PURE__ */ new Map();
    this._handlePool = 0;
    this.id = 0;
    this.variableStore = {};
    this._proxy = mainContext.getProxy(MainContext.MainThreadNotebookKernels);
    const selectKernelApiCommand = new ApiCommand(
      "notebook.selectKernel",
      "_notebook.selectKernel",
      "Trigger kernel picker for specified notebook editor widget",
      [
        new ApiCommandArgument("options", "Select kernel options", (v) => true, (v) => {
          if (v && "notebookEditor" in v && "id" in v) {
            const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
            return {
              id: v.id,
              extension: v.extension,
              notebookEditorId
            };
          } else if (v && "notebookEditor" in v) {
            const notebookEditorId = this._extHostNotebook.getIdByEditor(v.notebookEditor);
            if (notebookEditorId === void 0) {
              throw new Error(`Cannot invoke 'notebook.selectKernel' for unrecognized notebook editor ${v.notebookEditor.notebook.uri.toString()}`);
            }
            if ("skipIfAlreadySelected" in v) {
              return { notebookEditorId, skipIfAlreadySelected: v.skipIfAlreadySelected };
            }
            return { notebookEditorId };
          }
          return v;
        })
      ],
      ApiCommandResult.Void
    );
    const requestKernelVariablesApiCommand = new ApiCommand(
      "vscode.executeNotebookVariableProvider",
      "_executeNotebookVariableProvider",
      "Execute notebook variable provider",
      [ApiCommandArgument.Uri],
      new ApiCommandResult("A promise that resolves to an array of variables", (value, apiArgs) => {
        return value.map((variable) => {
          return {
            variable: {
              name: variable.name,
              value: variable.value,
              expression: variable.expression,
              type: variable.type,
              language: variable.language
            },
            hasNamedChildren: variable.hasNamedChildren,
            indexedChildrenCount: variable.indexedChildrenCount
          };
        });
      })
    );
    this._commands.registerApiCommand(selectKernelApiCommand);
    this._commands.registerApiCommand(requestKernelVariablesApiCommand);
  }
  createNotebookController(extension, id2, viewType, label, handler, preloads) {
    for (const data3 of this._kernelData.values()) {
      if (data3.controller.id === id2 && ExtensionIdentifier.equals(extension.identifier, data3.extensionId)) {
        throw new Error(`notebook controller with id '${id2}' ALREADY exist`);
      }
    }
    const handle = this._handlePool++;
    const that = this;
    this._logService.trace(`NotebookController[${handle}], CREATED by ${extension.identifier.value}, ${id2}`);
    const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data2.id}' of extension: '${extension.identifier}'`);
    let isDisposed = false;
    const onDidChangeSelection = new Emitter();
    const onDidReceiveMessage = new Emitter();
    const data2 = {
      id: createKernelId(extension.identifier, id2),
      notebookType: viewType,
      extensionId: extension.identifier,
      extensionLocation: extension.extensionLocation,
      label: label || extension.identifier.value,
      preloads: preloads ? preloads.map(NotebookRendererScript2.from) : []
    };
    let _executeHandler = handler ?? _defaultExecutHandler;
    let _interruptHandler;
    let _variableProvider;
    let _variableProviderDisposable;
    this._proxy.$addKernel(handle, data2).catch((err) => {
      console.log(err);
      isDisposed = true;
    });
    let tokenPool = 0;
    const _update = () => {
      if (isDisposed) {
        return;
      }
      const myToken = ++tokenPool;
      Promise.resolve().then(() => {
        if (myToken === tokenPool) {
          this._proxy.$updateKernel(handle, data2);
        }
      });
    };
    const associatedNotebooks = new ResourceMap();
    const controller = {
      get id() {
        return id2;
      },
      get notebookType() {
        return data2.notebookType;
      },
      onDidChangeSelectedNotebooks: onDidChangeSelection.event,
      get label() {
        return data2.label;
      },
      set label(value) {
        data2.label = value ?? extension.displayName ?? extension.name;
        _update();
      },
      get detail() {
        return data2.detail ?? "";
      },
      set detail(value) {
        data2.detail = value;
        _update();
      },
      get description() {
        return data2.description ?? "";
      },
      set description(value) {
        data2.description = value;
        _update();
      },
      get supportedLanguages() {
        return data2.supportedLanguages;
      },
      set supportedLanguages(value) {
        data2.supportedLanguages = value;
        _update();
      },
      get supportsExecutionOrder() {
        return data2.supportsExecutionOrder ?? false;
      },
      set supportsExecutionOrder(value) {
        data2.supportsExecutionOrder = value;
        _update();
      },
      get rendererScripts() {
        return data2.preloads ? data2.preloads.map(NotebookRendererScript2.to) : [];
      },
      get executeHandler() {
        return _executeHandler;
      },
      set executeHandler(value) {
        _executeHandler = value ?? _defaultExecutHandler;
      },
      get interruptHandler() {
        return _interruptHandler;
      },
      set interruptHandler(value) {
        _interruptHandler = value;
        data2.supportsInterrupt = Boolean(value);
        _update();
      },
      set variableProvider(value) {
        checkProposedApiEnabled(extension, "notebookVariableProvider");
        _variableProviderDisposable?.dispose();
        _variableProvider = value;
        data2.hasVariableProvider = !!value;
        _variableProviderDisposable = value?.onDidChangeVariables((e) => that._proxy.$variablesUpdated(e.uri));
        _update();
      },
      get variableProvider() {
        return _variableProvider;
      },
      createNotebookCellExecution(cell) {
        if (isDisposed) {
          throw new Error("notebook controller is DISPOSED");
        }
        if (!associatedNotebooks.has(cell.notebook.uri)) {
          that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map((u) => u.toString()));
          throw new Error(`notebook controller is NOT associated to notebook: ${cell.notebook.uri.toString()}`);
        }
        return that._createNotebookCellExecution(cell, createKernelId(extension.identifier, this.id));
      },
      createNotebookExecution(notebook) {
        checkProposedApiEnabled(extension, "notebookExecution");
        if (isDisposed) {
          throw new Error("notebook controller is DISPOSED");
        }
        if (!associatedNotebooks.has(notebook.uri)) {
          that._logService.trace(`NotebookController[${handle}] NOT associated to notebook, associated to THESE notebooks:`, Array.from(associatedNotebooks.keys()).map((u) => u.toString()));
          throw new Error(`notebook controller is NOT associated to notebook: ${notebook.uri.toString()}`);
        }
        return that._createNotebookExecution(notebook, createKernelId(extension.identifier, this.id));
      },
      dispose: () => {
        if (!isDisposed) {
          this._logService.trace(`NotebookController[${handle}], DISPOSED`);
          isDisposed = true;
          this._kernelData.delete(handle);
          onDidChangeSelection.dispose();
          onDidReceiveMessage.dispose();
          _variableProviderDisposable?.dispose();
          this._proxy.$removeKernel(handle);
        }
      },
      // --- priority
      updateNotebookAffinity(notebook, priority) {
        if (priority === -1 /* Hidden */) {
          checkProposedApiEnabled(extension, "notebookControllerAffinityHidden");
        }
        that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
      },
      // --- ipc
      onDidReceiveMessage: onDidReceiveMessage.event,
      postMessage(message, editor) {
        checkProposedApiEnabled(extension, "notebookMessaging");
        return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
      },
      asWebviewUri(uri2) {
        checkProposedApiEnabled(extension, "notebookMessaging");
        return asWebviewUri(uri2, that._initData.remote);
      }
    };
    this._kernelData.set(handle, {
      extensionId: extension.identifier,
      controller,
      onDidReceiveMessage,
      onDidChangeSelection,
      associatedNotebooks
    });
    return controller;
  }
  getIdByController(controller) {
    for (const [_, candidate] of this._kernelData) {
      if (candidate.controller === controller) {
        return createKernelId(candidate.extensionId, controller.id);
      }
    }
    return null;
  }
  createNotebookControllerDetectionTask(extension, viewType) {
    const handle = this._kernelDetectionTaskHandlePool++;
    const that = this;
    this._logService.trace(`NotebookControllerDetectionTask[${handle}], CREATED by ${extension.identifier.value}`);
    this._proxy.$addKernelDetectionTask(handle, viewType);
    const detectionTask = {
      dispose: () => {
        this._kernelDetectionTask.delete(handle);
        that._proxy.$removeKernelDetectionTask(handle);
      }
    };
    this._kernelDetectionTask.set(handle, detectionTask);
    return detectionTask;
  }
  registerKernelSourceActionProvider(extension, viewType, provider) {
    const handle = this._kernelSourceActionProviderHandlePool++;
    const eventHandle = typeof provider.onDidChangeNotebookKernelSourceActions === "function" ? handle : void 0;
    const that = this;
    this._kernelSourceActionProviders.set(handle, provider);
    this._logService.trace(`NotebookKernelSourceActionProvider[${handle}], CREATED by ${extension.identifier.value}`);
    this._proxy.$addKernelSourceActionProvider(handle, handle, viewType);
    let subscription;
    if (eventHandle !== void 0) {
      subscription = provider.onDidChangeNotebookKernelSourceActions((_) => this._proxy.$emitNotebookKernelSourceActionsChangeEvent(eventHandle));
    }
    return {
      dispose: () => {
        this._kernelSourceActionProviders.delete(handle);
        that._proxy.$removeKernelSourceActionProvider(handle, handle);
        subscription?.dispose();
      }
    };
  }
  async $provideKernelSourceActions(handle, token) {
    const provider = this._kernelSourceActionProviders.get(handle);
    if (provider) {
      const disposables = new DisposableStore();
      const ret = await provider.provideNotebookKernelSourceActions(token);
      return (ret ?? []).map((item) => NotebookKernelSourceAction2.from(item, this._commands.converter, disposables));
    }
    return [];
  }
  $acceptNotebookAssociation(handle, uri2, value) {
    const obj = this._kernelData.get(handle);
    if (obj) {
      const notebook = this._extHostNotebook.getNotebookDocument(URI.revive(uri2));
      if (value) {
        obj.associatedNotebooks.set(notebook.uri, true);
      } else {
        obj.associatedNotebooks.delete(notebook.uri);
      }
      this._logService.trace(`NotebookController[${handle}] ASSOCIATE notebook`, notebook.uri.toString(), value);
      obj.onDidChangeSelection.fire({
        selected: value,
        notebook: notebook.apiNotebook
      });
    }
  }
  async $executeCells(handle, uri2, handles) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document2 = this._extHostNotebook.getNotebookDocument(URI.revive(uri2));
    const cells = [];
    for (const cellHandle of handles) {
      const cell = document2.getCell(cellHandle);
      if (cell) {
        cells.push(cell.apiCell);
      }
    }
    try {
      this._logService.trace(`NotebookController[${handle}] EXECUTE cells`, document2.uri.toString(), cells.length);
      await obj.controller.executeHandler.call(obj.controller, cells, document2.apiNotebook, obj.controller);
    } catch (err) {
      this._logService.error(`NotebookController[${handle}] execute cells FAILED`, err);
      console.error(err);
    }
  }
  async $cancelCells(handle, uri2, handles) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document2 = this._extHostNotebook.getNotebookDocument(URI.revive(uri2));
    if (obj.controller.interruptHandler) {
      await obj.controller.interruptHandler.call(obj.controller, document2.apiNotebook);
    } else {
      for (const cellHandle of handles) {
        const cell = document2.getCell(cellHandle);
        if (cell) {
          this._activeExecutions.get(cell.uri)?.cancel();
        }
      }
    }
    if (obj.controller.interruptHandler) {
      const items = this._activeNotebookExecutions.get(document2.uri);
      this._activeNotebookExecutions.delete(document2.uri);
      if (handles.length && Array.isArray(items) && items.length) {
        items.forEach((d) => d.dispose());
      }
    }
  }
  async $provideVariables(handle, requestId, notebookUri, parentId, kind, start, token) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const document2 = this._extHostNotebook.getNotebookDocument(URI.revive(notebookUri));
    const variableProvider = obj.controller.variableProvider;
    if (!variableProvider) {
      return;
    }
    let parent = void 0;
    if (parentId !== void 0) {
      parent = this.variableStore[parentId];
      if (!parent) {
        return;
      }
    } else {
      this.variableStore = {};
    }
    const requestKind = kind === "named" ? 1 /* Named */ : 2 /* Indexed */;
    const variableResults = variableProvider.provideVariables(document2.apiNotebook, parent, requestKind, start, token);
    let resultCount = 0;
    for await (const result of variableResults) {
      if (token.isCancellationRequested) {
        return;
      }
      const variable = {
        id: this.id++,
        name: result.variable.name,
        value: result.variable.value,
        type: result.variable.type,
        interfaces: result.variable.interfaces,
        language: result.variable.language,
        expression: result.variable.expression,
        hasNamedChildren: result.hasNamedChildren,
        indexedChildrenCount: result.indexedChildrenCount,
        extensionId: obj.extensionId.value
      };
      this.variableStore[variable.id] = result.variable;
      this._proxy.$receiveVariable(requestId, variable);
      if (resultCount++ >= variablePageSize) {
        return;
      }
    }
  }
  $acceptKernelMessageFromRenderer(handle, editorId, message) {
    const obj = this._kernelData.get(handle);
    if (!obj) {
      return;
    }
    const editor = this._extHostNotebook.getEditorById(editorId);
    obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
  }
  // ---
  _createNotebookCellExecution(cell, controllerId) {
    if (cell.index < 0) {
      throw new Error("CANNOT execute cell that has been REMOVED from notebook");
    }
    const notebook = this._extHostNotebook.getNotebookDocument(cell.notebook.uri);
    const cellObj = notebook.getCellFromApiCell(cell);
    if (!cellObj) {
      throw new Error("invalid cell");
    }
    if (this._activeExecutions.has(cellObj.uri)) {
      throw new Error(`duplicate execution for ${cellObj.uri}`);
    }
    const execution = new NotebookCellExecutionTask(controllerId, cellObj, this._proxy);
    this._activeExecutions.set(cellObj.uri, execution);
    const listener = execution.onDidChangeState(() => {
      if (execution.state === 2 /* Resolved */) {
        execution.dispose();
        listener.dispose();
        this._activeExecutions.delete(cellObj.uri);
      }
    });
    return execution.asApiObject();
  }
  // ---
  _createNotebookExecution(nb, controllerId) {
    const notebook = this._extHostNotebook.getNotebookDocument(nb.uri);
    const runningCell = nb.getCells().find((cell) => {
      const apiCell = notebook.getCellFromApiCell(cell);
      return apiCell && this._activeExecutions.has(apiCell.uri);
    });
    if (runningCell) {
      throw new Error(`duplicate cell execution for ${runningCell.document.uri}`);
    }
    if (this._activeNotebookExecutions.has(notebook.uri)) {
      throw new Error(`duplicate notebook execution for ${notebook.uri}`);
    }
    const execution = new NotebookExecutionTask(controllerId, notebook, this._proxy);
    const listener = execution.onDidChangeState(() => {
      if (execution.state === 2 /* Resolved */) {
        execution.dispose();
        listener.dispose();
        this._activeNotebookExecutions.delete(notebook.uri);
      }
    });
    this._activeNotebookExecutions.set(notebook.uri, [execution, listener]);
    return execution.asApiObject();
  }
};

ExtHostNotebookKernels = __decorateClass([
  __decorateParam(4, ILogService)
], ExtHostNotebookKernels);

var NotebookCellExecutionTask = class _NotebookCellExecutionTask extends Disposable {
  constructor(controllerId, _cell, _proxy) {
    super();
    this._cell = _cell;
    this._proxy = _proxy;
    this._handle = _NotebookCellExecutionTask.HANDLE++;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this._state = 0 /* Init */;
    this._tokenSource = this._register(new CancellationTokenSource());
    this._collector = new TimeoutBasedCollector(10, (updates) => this.update(updates));
    this._executionOrder = _cell.internalMetadata.executionOrder;
    this._proxy.$createExecution(this._handle, controllerId, this._cell.notebook.uri, this._cell.handle);
  }
  static {
    this.HANDLE = 0;
  }
  get state() {
    return this._state;
  }
  cancel() {
    this._tokenSource.cancel();
  }
  async updateSoon(update) {
    await this._collector.addItem(update);
  }
  async update(update) {
    const updates = Array.isArray(update) ? update : [update];
    return this._proxy.$updateExecution(this._handle, new SerializableObjectWithBuffers(updates));
  }
  verifyStateForOutput() {
    if (this._state === 0 /* Init */) {
      throw new Error("Must call start before modifying cell output");
    }
    if (this._state === 2 /* Resolved */) {
      throw new Error("Cannot modify cell output after calling resolve");
    }
  }
  cellIndexToHandle(cellOrCellIndex) {
    let cell = this._cell;
    if (cellOrCellIndex) {
      cell = this._cell.notebook.getCellFromApiCell(cellOrCellIndex);
    }
    if (!cell) {
      throw new Error("INVALID cell");
    }
    return cell.handle;
  }
  validateAndConvertOutputs(items) {
    return items.map((output) => {
      const newOutput = NotebookCellOutput.ensureUniqueMimeTypes(output.items, true);
      if (newOutput === output.items) {
        return NotebookCellOutput2.from(output);
      }
      return NotebookCellOutput2.from({
        items: newOutput,
        id: output.id,
        metadata: output.metadata
      });
    });
  }
  async updateOutputs(outputs, cell, append) {
    const handle = this.cellIndexToHandle(cell);
    const outputDtos = this.validateAndConvertOutputs(asArray(outputs));
    return this.updateSoon(
      {
        editType: 1 /* Output */,
        cellHandle: handle,
        append,
        outputs: outputDtos
      }
    );
  }
  async updateOutputItems(items, output, append) {
    items = NotebookCellOutput.ensureUniqueMimeTypes(asArray(items), true);
    return this.updateSoon({
      editType: 2 /* OutputItems */,
      items: items.map(NotebookCellOutputItem2.from),
      outputId: output.id,
      append
    });
  }
  asApiObject() {
    const that = this;
    const result = {
      get token() {
        return that._tokenSource.token;
      },
      get cell() {
        return that._cell.apiCell;
      },
      get executionOrder() {
        return that._executionOrder;
      },
      set executionOrder(v) {
        that._executionOrder = v;
        that.update([{
          editType: 3 /* ExecutionState */,
          executionOrder: that._executionOrder
        }]);
      },
      start(startTime) {
        if (that._state === 2 /* Resolved */ || that._state === 1 /* Started */) {
          throw new Error("Cannot call start again");
        }
        that._state = 1 /* Started */;
        that._onDidChangeState.fire();
        that.update({
          editType: 3 /* ExecutionState */,
          runStartTime: startTime
        });
      },
      end(success, endTime, executionError) {
        if (that._state === 2 /* Resolved */) {
          throw new Error("Cannot call resolve twice");
        }
        that._state = 2 /* Resolved */;
        that._onDidChangeState.fire();
        that._collector.flush();
        const error = createSerializeableError(executionError);
        that._proxy.$completeExecution(that._handle, new SerializableObjectWithBuffers({
          runEndTime: endTime,
          lastRunSuccess: success,
          error
        }));
      },
      clearOutput(cell) {
        that.verifyStateForOutput();
        return that.updateOutputs([], cell, false);
      },
      appendOutput(outputs, cell) {
        that.verifyStateForOutput();
        return that.updateOutputs(outputs, cell, true);
      },
      replaceOutput(outputs, cell) {
        that.verifyStateForOutput();
        return that.updateOutputs(outputs, cell, false);
      },
      appendOutputItems(items, output) {
        that.verifyStateForOutput();
        return that.updateOutputItems(items, output, true);
      },
      replaceOutputItems(items, output) {
        that.verifyStateForOutput();
        return that.updateOutputItems(items, output, false);
      }
    };
    return Object.freeze(result);
  }
};

function createSerializeableError(executionError) {
  const convertRange = (range) => range ? {
    startLineNumber: range.start.line,
    startColumn: range.start.character,
    endLineNumber: range.end.line,
    endColumn: range.end.character
  } : void 0;
  const convertStackFrame = (frame) => ({
    uri: frame.uri,
    position: frame.position,
    label: frame.label
  });
  const error = executionError ? {
    name: executionError.name,
    message: executionError.message,
    stack: executionError.stack instanceof Array ? executionError.stack.map((frame) => convertStackFrame(frame)) : executionError.stack,
    location: convertRange(executionError.location),
    uri: executionError.uri
  } : void 0;
  return error;
}

var NotebookExecutionTask = class _NotebookExecutionTask extends Disposable {
  constructor(controllerId, _notebook, _proxy) {
    super();
    this._notebook = _notebook;
    this._proxy = _proxy;
    this._handle = _NotebookExecutionTask.HANDLE++;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this._state = 0 /* Init */;
    this._tokenSource = this._register(new CancellationTokenSource());
    this._proxy.$createNotebookExecution(this._handle, controllerId, this._notebook.uri);
  }
  static {
    this.HANDLE = 0;
  }
  get state() {
    return this._state;
  }
  cancel() {
    this._tokenSource.cancel();
  }
  asApiObject() {
    const result = {
      start: () => {
        if (this._state === 2 /* Resolved */ || this._state === 1 /* Started */) {
          throw new Error("Cannot call start again");
        }
        this._state = 1 /* Started */;
        this._onDidChangeState.fire();
        this._proxy.$beginNotebookExecution(this._handle);
      },
      end: () => {
        if (this._state === 2 /* Resolved */) {
          throw new Error("Cannot call resolve twice");
        }
        this._state = 2 /* Resolved */;
        this._onDidChangeState.fire();
        this._proxy.$completeNotebookExecution(this._handle);
      }
    };
    return Object.freeze(result);
  }
};

var TimeoutBasedCollector = class {
  constructor(delay, callback) {
    this.delay = delay;
    this.callback = callback;
    this.batch = [];
    this.startedTimer = Date.now();
  }
  addItem(item) {
    this.batch.push(item);
    if (!this.currentDeferred) {
      this.currentDeferred = new DeferredPromise();
      this.startedTimer = Date.now();
      timeout(this.delay).then(() => {
        return this.flush();
      });
    }
    if (Date.now() - this.startedTimer > this.delay) {
      return this.flush();
    }
    return this.currentDeferred.p;
  }
  flush() {
    if (this.batch.length === 0 || !this.currentDeferred) {
      return Promise.resolve();
    }
    const deferred = this.currentDeferred;
    this.currentDeferred = void 0;
    const batch = this.batch;
    this.batch = [];
    return this.callback(batch).finally(() => deferred.complete());
  }
};

function createKernelId(extensionIdentifier, id2) {
  return `${extensionIdentifier.value}/${id2}`;
}
export { createSerializeableError, createKernelId, ExtHostNotebookKernels, NotebookCellExecutionTask, NotebookExecutionTask, TimeoutBasedCollector };
