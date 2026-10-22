// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/output/browser/outputLinkProvider.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { LOG_MODE_ID, OUTPUT_MODE_ID } from "./module-1245.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IWebWorkerService } from "./module-0161.mjs";
import { WebWorkerDescriptor } from "./module-0160.mjs";
import { FileAccess } from "./module-0033.mjs";
import { WorkerTextModelSyncClient } from "./module-0202.mjs";


// src/vs/workbench/contrib/output/browser/outputLinkProvider.ts
var OutputLinkProvider = class extends Disposable {
  constructor(contextService, modelService, languageFeaturesService, webWorkerService) {
    super();
    this.contextService = contextService;
    this.modelService = modelService;
    this.languageFeaturesService = languageFeaturesService;
    this.webWorkerService = webWorkerService;
    this.disposeWorkerScheduler = this._register(new RunOnceScheduler(() => this.disposeWorker(), OutputLinkProvider.DISPOSE_WORKER_TIME));
    this.registerListeners();
    this.updateLinkProviderWorker();
  }
  static {
    this.DISPOSE_WORKER_TIME = 3 * 60 * 1e3;
  }
  registerListeners() {
    this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.updateLinkProviderWorker()));
  }
  updateLinkProviderWorker() {
    const folders = this.contextService.getWorkspace().folders;
    if (folders.length > 0) {
      if (!this.linkProviderRegistration) {
        this.linkProviderRegistration = this.languageFeaturesService.linkProvider.register([{ language: OUTPUT_MODE_ID, scheme: "*" }, { language: LOG_MODE_ID, scheme: "*" }], {
          provideLinks: async (model) => {
            const links = await this.provideLinks(model.uri);
            return links && { links };
          }
        });
      }
    } else {
      dispose(this.linkProviderRegistration);
      this.linkProviderRegistration = void 0;
    }
    this.disposeWorker();
    this.disposeWorkerScheduler.cancel();
  }
  getOrCreateWorker() {
    this.disposeWorkerScheduler.schedule();
    if (!this.worker) {
      this.worker = new OutputLinkWorkerClient(this.contextService, this.modelService, this.webWorkerService);
    }
    return this.worker;
  }
  async provideLinks(modelUri) {
    return this.getOrCreateWorker().provideLinks(modelUri);
  }
  disposeWorker() {
    if (this.worker) {
      this.worker.dispose();
      this.worker = void 0;
    }
  }
};

OutputLinkProvider = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IWebWorkerService)
], OutputLinkProvider);

var OutputLinkWorkerClient = class extends Disposable {
  constructor(contextService, modelService, webWorkerService) {
    super();
    this.contextService = contextService;
    this._workerClient = this._register(webWorkerService.createWorkerClient(
      new WebWorkerDescriptor({
        esmModuleLocation: FileAccess.asBrowserUri("vs/workbench/contrib/output/common/outputLinkComputerMain.js"),
        label: "OutputLinkDetectionWorker"
      })
    ));
    this._workerTextModelSyncClient = this._register(WorkerTextModelSyncClient.create(this._workerClient, modelService));
    this._initializeBarrier = this._ensureWorkspaceFolders();
  }
  async _ensureWorkspaceFolders() {
    await this._workerClient.proxy.$setWorkspaceFolders(this.contextService.getWorkspace().folders.map((folder) => folder.uri.toString()));
  }
  async provideLinks(modelUri) {
    await this._initializeBarrier;
    this._workerTextModelSyncClient.ensureSyncedResources([modelUri]);
    return this._workerClient.proxy.$computeLinks(modelUri.toString());
  }
};

OutputLinkWorkerClient = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IModelService),
  __decorateParam(2, IWebWorkerService)
], OutputLinkWorkerClient);
export { OutputLinkProvider, OutputLinkWorkerClient };
