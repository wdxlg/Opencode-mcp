// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadQuickDiff.ts
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IQuickDiffService } from "./module-1079.mjs";
import { IQuickDiffModelService } from "./module-1082.mjs";


// src/vs/workbench/api/browser/mainThreadQuickDiff.ts
var MainThreadQuickDiff = class {
  constructor(extHostContext, quickDiffService, quickDiffModelService) {
    this.quickDiffService = quickDiffService;
    this.quickDiffModelService = quickDiffModelService;
    this.providerDisposables = new DisposableMap();
    this.informationDisposables = new DisposableMap();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostQuickDiff);
  }
  async $registerQuickDiffProvider(handle2, selector, id2, label3, rootUri) {
    const provider = {
      id: id2,
      label: label3,
      rootUri: URI.revive(rootUri),
      selector,
      kind: "contributed",
      getOriginalResource: async (uri5) => {
        return URI.revive(await this.proxy.$provideOriginalResource(handle2, uri5, CancellationToken.None));
      }
    };
    const disposable = this.quickDiffService.addQuickDiffProvider(provider);
    this.providerDisposables.set(handle2, disposable);
  }
  async $unregisterQuickDiffProvider(handle2) {
    if (this.providerDisposables.has(handle2)) {
      this.providerDisposables.deleteAndDispose(handle2);
    }
  }
  async $createSourceControlDiffInformation(handle2, uri5) {
    const reference = this.quickDiffModelService.createQuickDiffModelReference(URI.revive(uri5));
    if (!reference) {
      return;
    }
    const store = new DisposableStore();
    store.add(reference);
    store.add(reference.object.onDidChange(() => this.sendSourceControlDiffInformation(handle2, reference)));
    this.informationDisposables.set(handle2, store);
    this.sendSourceControlDiffInformation(handle2, reference);
  }
  async $disposeSourceControlDiffInformation(handle2) {
    if (this.informationDisposables.has(handle2)) {
      this.informationDisposables.deleteAndDispose(handle2);
    }
  }
  sendSourceControlDiffInformation(handle2, reference) {
    const model = reference.object;
    const primaryResult = model.getQuickDiffResults().find((result) => result.providerKind === "primary");
    if (!primaryResult) {
      this.proxy.$acceptSourceControlDiffInformation(handle2, void 0);
      return;
    }
    const changes = primaryResult.changes2.map((change) => [
      change.original.startLineNumber,
      change.original.endLineNumberExclusive,
      change.modified.startLineNumber,
      change.modified.endLineNumberExclusive
    ]);
    const diffInformation = {
      documentVersion: model.changesVersionId,
      original: primaryResult.original,
      modified: primaryResult.modified,
      changes
    };
    this.proxy.$acceptSourceControlDiffInformation(handle2, diffInformation);
  }
  dispose() {
    this.providerDisposables.dispose();
    this.informationDisposables.dispose();
  }
};

MainThreadQuickDiff = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadQuickDiff),
  __decorateParam(1, IQuickDiffService),
  __decorateParam(2, IQuickDiffModelService)
], MainThreadQuickDiff);
export { MainThreadQuickDiff };
