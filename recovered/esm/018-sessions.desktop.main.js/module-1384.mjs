// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebook.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { StopWatch } from "./module-0016.mjs";
import { NotebookDto } from "./module-0995.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { SerializableObjectWithBuffers } from "./module-0921.mjs";
import { FileOperationError } from "./module-0269.mjs";
import { coalesce } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { revive } from "./module-0265.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { INotebookService, SimpleNotebookProviderInfo } from "./module-0927.mjs";
import { INotebookCellStatusBarService } from "./module-1383.mjs";
import { ILogService } from "./module-0095.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/api/browser/mainThreadNotebook.ts
var MainThreadNotebooks = class {
  constructor(extHostContext, _notebookService, _cellStatusBarService, _logService) {
    this._notebookService = _notebookService;
    this._cellStatusBarService = _cellStatusBarService;
    this._logService = _logService;
    this._disposables = new DisposableStore();
    this._notebookSerializer = /* @__PURE__ */ new Map();
    this._notebookCellStatusBarRegistrations = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebook);
  }
  dispose() {
    this._disposables.dispose();
    dispose(this._notebookSerializer.values());
  }
  $registerNotebookSerializer(handle2, extension, viewType, options3, data) {
    const disposables = new DisposableStore();
    disposables.add(this._notebookService.registerNotebookSerializer(viewType, extension, {
      options: options3,
      dataToNotebook: async (data2) => {
        const sw = new StopWatch();
        let result;
        if (data2.byteLength === 0 && viewType === "interactive") {
          result = NotebookDto.fromNotebookDataDto({ cells: [], metadata: {} });
        } else {
          const dto = await this._proxy.$dataToNotebook(handle2, data2, CancellationToken.None);
          result = NotebookDto.fromNotebookDataDto(dto.value);
        }
        this._logService.trace(`[NotebookSerializer] dataToNotebook DONE after ${sw.elapsed()}ms`, {
          viewType,
          extensionId: extension.id.value
        });
        return result;
      },
      notebookToData: (data2) => {
        const sw = new StopWatch();
        const result = this._proxy.$notebookToData(handle2, new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(data2)), CancellationToken.None);
        this._logService.trace(`[NotebookSerializer] notebookToData DONE after ${sw.elapsed()}`, {
          viewType,
          extensionId: extension.id.value
        });
        return result;
      },
      save: async (uri4, versionId, options4, token) => {
        const stat = await this._proxy.$saveNotebook(handle2, uri4, versionId, options4, token);
        if (isFileOperationError(stat)) {
          throw new FileOperationError(stat.message, stat.fileOperationResult, stat.options);
        }
        return {
          ...stat,
          children: void 0,
          resource: uri4
        };
      },
      searchInNotebooks: async (textQuery, token, allPriorityInfo) => {
        const contributedType = this._notebookService.getContributedNotebookType(viewType);
        if (!contributedType) {
          return { results: [], limitHit: false };
        }
        const fileNames = contributedType.selectors;
        const includes2 = fileNames.map((selector) => {
          const globPattern = selector.include || selector;
          return globPattern.toString();
        });
        if (!includes2.length) {
          return {
            results: [],
            limitHit: false
          };
        }
        const thisPriorityInfo = coalesce([{ isFromSettings: false, filenamePatterns: includes2 }, ...allPriorityInfo.get(viewType) ?? []]);
        const otherEditorsPriorityInfo = Array.from(allPriorityInfo.keys()).flatMap((key3) => {
          if (key3 !== viewType) {
            return allPriorityInfo.get(key3) ?? [];
          }
          return [];
        });
        const searchComplete = await this._proxy.$searchInNotebooks(handle2, textQuery, thisPriorityInfo, otherEditorsPriorityInfo, token);
        const revivedResults = searchComplete.results.map((result) => {
          const resource = URI.revive(result.resource);
          return {
            resource,
            cellResults: result.cellResults.map((e4) => revive(e4))
          };
        });
        return { results: revivedResults, limitHit: searchComplete.limitHit };
      }
    }));
    if (data) {
      disposables.add(this._notebookService.registerContributedNotebookType(viewType, data));
    }
    this._notebookSerializer.set(handle2, disposables);
    this._logService.trace("[NotebookSerializer] registered notebook serializer", {
      viewType,
      extensionId: extension.id.value
    });
  }
  $unregisterNotebookSerializer(handle2) {
    this._notebookSerializer.get(handle2)?.dispose();
    this._notebookSerializer.delete(handle2);
  }
  $emitCellStatusBarEvent(eventHandle) {
    const emitter = this._notebookCellStatusBarRegistrations.get(eventHandle);
    if (emitter instanceof Emitter) {
      emitter.fire(void 0);
    }
  }
  async $registerNotebookCellStatusBarItemProvider(handle2, eventHandle, viewType) {
    const that = this;
    const provider = {
      async provideCellStatusBarItems(uri4, index2, token) {
        const result = await that._proxy.$provideNotebookCellStatusBarItems(handle2, uri4, index2, token);
        return {
          items: result?.items ?? [],
          dispose() {
            if (result) {
              that._proxy.$releaseNotebookCellStatusBarItems(result.cacheId);
            }
          }
        };
      },
      viewType
    };
    if (typeof eventHandle === "number") {
      const emitter = new Emitter();
      this._notebookCellStatusBarRegistrations.set(eventHandle, emitter);
      provider.onDidChangeStatusBarItems = emitter.event;
    }
    const disposable = this._cellStatusBarService.registerCellStatusBarItemProvider(provider);
    this._notebookCellStatusBarRegistrations.set(handle2, disposable);
  }
  async $unregisterNotebookCellStatusBarItemProvider(handle2, eventHandle) {
    const unregisterThing = (handle3) => {
      const entry = this._notebookCellStatusBarRegistrations.get(handle3);
      if (entry) {
        this._notebookCellStatusBarRegistrations.get(handle3)?.dispose();
        this._notebookCellStatusBarRegistrations.delete(handle3);
      }
    };
    unregisterThing(handle2);
    if (typeof eventHandle === "number") {
      unregisterThing(eventHandle);
    }
  }
};

MainThreadNotebooks = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadNotebook),
  __decorateParam(1, INotebookService),
  __decorateParam(2, INotebookCellStatusBarService),
  __decorateParam(3, ILogService)
], MainThreadNotebooks);

CommandsRegistry.registerCommand("_executeDataToNotebook", async (accessor, ...args2) => {
  const [notebookType, bytes] = args2;
  assertType(typeof notebookType === "string", "string");
  assertType(bytes instanceof VSBuffer, "VSBuffer");
  const notebookService = accessor.get(INotebookService);
  const info = await notebookService.withNotebookDataProvider(notebookType);
  if (!(info instanceof SimpleNotebookProviderInfo)) {
    return;
  }
  const dto = await info.serializer.dataToNotebook(bytes);
  return new SerializableObjectWithBuffers(NotebookDto.toNotebookDataDto(dto));
});

CommandsRegistry.registerCommand("_executeNotebookToData", async (accessor, notebookType, dto) => {
  assertType(typeof notebookType === "string", "string");
  const notebookService = accessor.get(INotebookService);
  const info = await notebookService.withNotebookDataProvider(notebookType);
  if (!(info instanceof SimpleNotebookProviderInfo)) {
    return;
  }
  const data = NotebookDto.fromNotebookDataDto(dto.value);
  const bytes = await info.serializer.notebookToData(data);
  return bytes;
});

function isFileOperationError(error) {
  const candidate = error;
  return typeof candidate?.fileOperationResult === "number" && typeof candidate?.message === "string";
}
export { isFileOperationError, MainThreadNotebooks };
