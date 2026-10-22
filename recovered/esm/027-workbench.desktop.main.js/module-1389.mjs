// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookKernels.ts
import { Emitter } from "./module-0017.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { NotebookDto } from "./module-0994.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { INotebookKernelService } from "./module-1388.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";
import { INotebookService } from "./module-0926.mjs";
import { INotebookEditorService } from "./module-1386.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookKernels.ts
var MainThreadKernel = class {
  constructor(data, _languageService) {
    this._languageService = _languageService;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this.id = data.id;
    this.viewType = data.notebookType;
    this.extension = data.extensionId;
    this.implementsInterrupt = data.supportsInterrupt ?? false;
    this.label = data.label;
    this.description = data.description;
    this.detail = data.detail;
    this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : _languageService.getRegisteredLanguageIds();
    this.implementsExecutionOrder = data.supportsExecutionOrder ?? false;
    this.hasVariableProvider = data.hasVariableProvider ?? false;
    this.localResourceRoot = URI.revive(data.extensionLocation);
    this.preloads = data.preloads?.map((u) => ({ uri: URI.revive(u.uri), provides: u.provides })) ?? [];
  }
  get preloadUris() {
    return this.preloads.map((p) => p.uri);
  }
  get preloadProvides() {
    return this.preloads.flatMap((p) => p.provides);
  }
  update(data) {
    const event = /* @__PURE__ */ Object.create(null);
    if (data.label !== void 0) {
      this.label = data.label;
      event.label = true;
    }
    if (data.description !== void 0) {
      this.description = data.description;
      event.description = true;
    }
    if (data.detail !== void 0) {
      this.detail = data.detail;
      event.detail = true;
    }
    if (data.supportedLanguages !== void 0) {
      this.supportedLanguages = isNonEmptyArray(data.supportedLanguages) ? data.supportedLanguages : this._languageService.getRegisteredLanguageIds();
      event.supportedLanguages = true;
    }
    if (data.supportsExecutionOrder !== void 0) {
      this.implementsExecutionOrder = data.supportsExecutionOrder;
      event.hasExecutionOrder = true;
    }
    if (data.supportsInterrupt !== void 0) {
      this.implementsInterrupt = data.supportsInterrupt;
      event.hasInterruptHandler = true;
    }
    if (data.hasVariableProvider !== void 0) {
      this.hasVariableProvider = data.hasVariableProvider;
      event.hasVariableProvider = true;
    }
    this._onDidChange.fire(event);
  }
};

var MainThreadKernelDetectionTask = class {
  constructor(notebookType) {
    this.notebookType = notebookType;
  }
};

var MainThreadNotebookKernels = class {
  constructor(extHostContext, _languageService, _notebookKernelService, _notebookExecutionStateService, _notebookService, notebookEditorService) {
    this._languageService = _languageService;
    this._notebookKernelService = _notebookKernelService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this._notebookService = _notebookService;
    this._editors = new DisposableMap();
    this._disposables = new DisposableStore();
    this._kernels = /* @__PURE__ */ new Map();
    this._kernelDetectionTasks = /* @__PURE__ */ new Map();
    this._kernelSourceActionProviders = /* @__PURE__ */ new Map();
    this._kernelSourceActionProvidersEventRegistrations = /* @__PURE__ */ new Map();
    this._executions = /* @__PURE__ */ new Map();
    this._notebookExecutions = /* @__PURE__ */ new Map();
    this.variableRequestIndex = 0;
    this.variableRequestMap = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookKernels);
    notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
    notebookEditorService.onDidAddNotebookEditor(this._onEditorAdd, this, this._disposables);
    notebookEditorService.onDidRemoveNotebookEditor(this._onEditorRemove, this, this._disposables);
    this._disposables.add(toDisposable(() => {
      this._executions.forEach((e) => {
        e.complete({});
      });
      this._notebookExecutions.forEach((e) => e.complete());
    }));
    this._disposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks((e) => {
      for (const [handle2, [kernel]] of this._kernels) {
        if (e.oldKernel === kernel.id) {
          this._proxy.$acceptNotebookAssociation(handle2, e.notebook, false);
        } else if (e.newKernel === kernel.id) {
          this._proxy.$acceptNotebookAssociation(handle2, e.notebook, true);
        }
      }
    }));
  }
  dispose() {
    this._disposables.dispose();
    for (const [, registration] of this._kernels.values()) {
      registration.dispose();
    }
    for (const [, registration] of this._kernelDetectionTasks.values()) {
      registration.dispose();
    }
    for (const [, registration] of this._kernelSourceActionProviders.values()) {
      registration.dispose();
    }
    this._editors.dispose();
  }
  // --- kernel ipc
  _onEditorAdd(editor) {
    const ipcListener = editor.onDidReceiveMessage((e) => {
      if (!editor.hasModel()) {
        return;
      }
      const { selected } = this._notebookKernelService.getMatchingKernel(editor.textModel);
      if (!selected) {
        return;
      }
      for (const [handle2, candidate] of this._kernels) {
        if (candidate[0] === selected) {
          this._proxy.$acceptKernelMessageFromRenderer(handle2, editor.getId(), e.message);
          break;
        }
      }
    });
    this._editors.set(editor, ipcListener);
  }
  _onEditorRemove(editor) {
    this._editors.deleteAndDispose(editor);
  }
  async $postMessage(handle2, editorId, message) {
    const tuple = this._kernels.get(handle2);
    if (!tuple) {
      throw new Error("kernel already disposed");
    }
    const [kernel] = tuple;
    let didSend = false;
    for (const [editor] of this._editors) {
      if (!editor.hasModel()) {
        continue;
      }
      if (this._notebookKernelService.getMatchingKernel(editor.textModel).selected !== kernel) {
        continue;
      }
      if (editorId === void 0) {
        editor.postMessage(message);
        didSend = true;
      } else if (editor.getId() === editorId) {
        editor.postMessage(message);
        didSend = true;
        break;
      }
    }
    return didSend;
  }
  $receiveVariable(requestId, variable) {
    const emitter = this.variableRequestMap.get(requestId);
    if (emitter) {
      emitter.emitOne(variable);
    }
  }
  // --- kernel adding/updating/removal
  async $addKernel(handle2, data) {
    const that = this;
    const kernel = new class extends MainThreadKernel {
      async executeNotebookCellsRequest(uri5, handles) {
        await that._proxy.$executeCells(handle2, uri5, handles);
      }
      async cancelNotebookCellExecution(uri5, handles) {
        await that._proxy.$cancelCells(handle2, uri5, handles);
      }
      provideVariables(notebookUri, parentId, kind, start, token) {
        const requestId = `${handle2}variables${that.variableRequestIndex++}`;
        return new AsyncIterableProducer(async (emitter) => {
          that.variableRequestMap.set(requestId, emitter);
          try {
            await that._proxy.$provideVariables(handle2, requestId, notebookUri, parentId, kind, start, token);
          } finally {
            that.variableRequestMap.delete(requestId);
          }
        });
      }
    }(data, this._languageService);
    const disposables = this._disposables.add(new DisposableStore());
    this._kernels.set(handle2, [kernel, disposables]);
    disposables.add(this._notebookKernelService.registerKernel(kernel));
  }
  $updateKernel(handle2, data) {
    const tuple = this._kernels.get(handle2);
    if (tuple) {
      tuple[0].update(data);
    }
  }
  $removeKernel(handle2) {
    const tuple = this._kernels.get(handle2);
    if (tuple) {
      tuple[1].dispose();
      this._kernels.delete(handle2);
    }
  }
  $updateNotebookPriority(handle2, notebook, value2) {
    const tuple = this._kernels.get(handle2);
    if (tuple) {
      this._notebookKernelService.updateKernelNotebookAffinity(tuple[0], URI.revive(notebook), value2);
    }
  }
  // --- Cell execution
  $createExecution(handle2, controllerId, rawUri, cellHandle) {
    const uri5 = URI.revive(rawUri);
    const notebook = this._notebookService.getNotebookTextModel(uri5);
    if (!notebook) {
      throw new Error(`Notebook not found: ${uri5.toString()}`);
    }
    const kernel = this._notebookKernelService.getMatchingKernel(notebook);
    if (!kernel.selected || kernel.selected.id !== controllerId) {
      throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
    }
    const execution = this._notebookExecutionStateService.createCellExecution(uri5, cellHandle);
    execution.confirm();
    this._executions.set(handle2, execution);
  }
  $updateExecution(handle2, data) {
    const updates = data.value;
    try {
      const execution = this._executions.get(handle2);
      execution?.update(updates.map(NotebookDto.fromCellExecuteUpdateDto));
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  $completeExecution(handle2, data) {
    try {
      const execution = this._executions.get(handle2);
      execution?.complete(NotebookDto.fromCellExecuteCompleteDto(data.value));
    } catch (e) {
      onUnexpectedError(e);
    } finally {
      this._executions.delete(handle2);
    }
  }
  // --- Notebook execution
  $createNotebookExecution(handle2, controllerId, rawUri) {
    const uri5 = URI.revive(rawUri);
    const notebook = this._notebookService.getNotebookTextModel(uri5);
    if (!notebook) {
      throw new Error(`Notebook not found: ${uri5.toString()}`);
    }
    const kernel = this._notebookKernelService.getMatchingKernel(notebook);
    if (!kernel.selected || kernel.selected.id !== controllerId) {
      throw new Error(`Kernel is not selected: ${kernel.selected?.id} !== ${controllerId}`);
    }
    const execution = this._notebookExecutionStateService.createExecution(uri5);
    execution.confirm();
    this._notebookExecutions.set(handle2, execution);
  }
  $beginNotebookExecution(handle2) {
    try {
      const execution = this._notebookExecutions.get(handle2);
      execution?.begin();
    } catch (e) {
      onUnexpectedError(e);
    }
  }
  $completeNotebookExecution(handle2) {
    try {
      const execution = this._notebookExecutions.get(handle2);
      execution?.complete();
    } catch (e) {
      onUnexpectedError(e);
    } finally {
      this._notebookExecutions.delete(handle2);
    }
  }
  // --- notebook kernel detection task
  async $addKernelDetectionTask(handle2, notebookType) {
    const kernelDetectionTask = new MainThreadKernelDetectionTask(notebookType);
    const registration = this._notebookKernelService.registerNotebookKernelDetectionTask(kernelDetectionTask);
    this._kernelDetectionTasks.set(handle2, [kernelDetectionTask, registration]);
  }
  $removeKernelDetectionTask(handle2) {
    const tuple = this._kernelDetectionTasks.get(handle2);
    if (tuple) {
      tuple[1].dispose();
      this._kernelDetectionTasks.delete(handle2);
    }
  }
  // --- notebook kernel source action provider
  async $addKernelSourceActionProvider(handle2, eventHandle, notebookType) {
    const kernelSourceActionProvider = {
      viewType: notebookType,
      provideKernelSourceActions: async () => {
        const actions = await this._proxy.$provideKernelSourceActions(handle2, CancellationToken.None);
        return actions.map((action) => {
          let documentation = action.documentation;
          if (action.documentation && typeof action.documentation !== "string") {
            documentation = URI.revive(action.documentation);
          }
          return {
            label: action.label,
            command: action.command,
            description: action.description,
            detail: action.detail,
            documentation
          };
        });
      }
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._kernelSourceActionProvidersEventRegistrations.set(eventHandle, emitter);
      kernelSourceActionProvider.onDidChangeSourceActions = emitter.event;
    }
    const registration = this._notebookKernelService.registerKernelSourceActionProvider(notebookType, kernelSourceActionProvider);
    this._kernelSourceActionProviders.set(handle2, [kernelSourceActionProvider, registration]);
  }
  $removeKernelSourceActionProvider(handle2, eventHandle) {
    const tuple = this._kernelSourceActionProviders.get(handle2);
    if (tuple) {
      tuple[1].dispose();
      this._kernelSourceActionProviders.delete(handle2);
    }
    if (typeof eventHandle === "number") {
      this._kernelSourceActionProvidersEventRegistrations.delete(eventHandle);
    }
  }
  $emitNotebookKernelSourceActionsChangeEvent(eventHandle) {
    const emitter = this._kernelSourceActionProvidersEventRegistrations.get(eventHandle);
    if (emitter instanceof Emitter) {
      emitter.fire(void 0);
    }
  }
  $variablesUpdated(notebookUri) {
    this._notebookKernelService.notifyVariablesChange(URI.revive(notebookUri));
  }
};

MainThreadNotebookKernels = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadNotebookKernels),
  __decorateParam(1, ILanguageService),
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, INotebookExecutionStateService),
  __decorateParam(4, INotebookService),
  __decorateParam(5, INotebookEditorService)
], MainThreadNotebookKernels);
export { MainThreadKernel, MainThreadKernelDetectionTask, MainThreadNotebookKernels };
