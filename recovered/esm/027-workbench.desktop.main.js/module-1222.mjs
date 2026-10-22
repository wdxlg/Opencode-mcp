// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/assignment/common/assignmentService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IRequestService, asJson } from "./module-0946.mjs";
import { experimentsEnabled } from "./module-1221.mjs";
import { AssignmentContextFilter } from "./module-1220.mjs";
import { Memento } from "./module-1041.mjs";
import { timeout } from "./module-0036.mjs";
import { ASSIGNMENT_REFETCH_INTERVAL, ASSIGNMENT_STORAGE_KEY, AssignmentFilterProvider, VSCodeCoreAssignmentsFilterProvider } from "./module-0952.mjs";
import { CopilotAssignmentFilterProvider, GitHubCoreAssignmentsFilterProvider } from "./module-1219.mjs";
import { resolveAmdNodeModulePath } from "./module-0191.mjs";
import { StopWatch } from "./module-0016.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/services/assignment/common/assignmentService.ts
var IWorkbenchAssignmentService = createDecorator("assignmentService");

var ASSIGNMENTS_SCOPE_PREFIX = "/vscode/";

function resolveScopedTreatment(read, name) {
  const scoped = read(`${ASSIGNMENTS_SCOPE_PREFIX}${name}`);
  return scoped !== void 0 ? scoped : read(name);
}

var MementoKeyValueStorage = class {
  constructor(memento) {
    this.memento = memento;
    this.mementoObj = memento.getMemento(-1 /* APPLICATION */, 1 /* MACHINE */);
  }
  async getValue(key3, defaultValue) {
    const value2 = await this.mementoObj[key3];
    return value2 || defaultValue;
  }
  setValue(key3, value2) {
    this.mementoObj[key3] = value2;
    this.memento.saveMemento();
  }
};

var WorkbenchAssignmentServiceTelemetry = class extends Disposable {
  constructor(telemetryService, productService, contextFilter) {
    super();
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.contextFilter = contextFilter;
    this._onDidUpdateAssignmentContext = this._register(new Emitter());
    this.onDidUpdateAssignmentContext = this._onDidUpdateAssignmentContext.event;
    this._register(this.contextFilter.onDidChange(() => {
      if (this._previousAssignmentContext) {
        this._setAssignmentContext(this._previousAssignmentContext);
      }
    }));
  }
  get assignmentContext() {
    return this._lastAssignmentContext?.split(";");
  }
  _setAssignmentContext(value2) {
    const filteredValue = this.contextFilter.filter(value2);
    this._lastAssignmentContext = filteredValue;
    this._onDidUpdateAssignmentContext.fire();
    if (this.productService.tasConfig?.assignmentContextTelemetryPropertyName) {
      this.telemetryService.setExperimentProperty(this.productService.tasConfig.assignmentContextTelemetryPropertyName, filteredValue);
    }
  }
  // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
  setSharedProperty(name, value2) {
    if (name === this.productService.tasConfig?.assignmentContextTelemetryPropertyName) {
      this._previousAssignmentContext = value2;
      return this._setAssignmentContext(value2);
    }
    this.telemetryService.setExperimentProperty(name, value2);
  }
  postEvent(eventName, props) {
    const data = {};
    for (const [key3, value2] of props.entries()) {
      data[key3] = value2;
    }
    this.telemetryService.publicLog(eventName, data);
  }
};

var WorkbenchAssignmentService = class extends Disposable {
  constructor(telemetryService, storageService, configurationService, productService, environmentService, instantiationService, defaultAccountService, requestService) {
    super();
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.defaultAccountService = defaultAccountService;
    this.requestService = requestService;
    this.tasSetupDisposables = this._register(new DisposableStore());
    this.networkInitialized = false;
    this.setupGeneration = 0;
    this._onDidRefetchAssignments = this._register(new Emitter());
    this.onDidRefetchAssignments = this._onDidRefetchAssignments.event;
    /**
     * Transport for the new assignments endpoint, backed by the main-process request service
     * (avoids renderer CORS). Shape matches tas-client's injectable `assignmentsFetch`.
     */
    this.assignmentsFetch = async (url, init) => {
      const context2 = await this.requestService.request({
        type: init.method,
        url,
        data: init.body,
        headers: init.headers,
        disableCache: true,
        callSite: "assignmentService.assignments"
      }, CancellationToken.None);
      return {
        status: context2.res.statusCode ?? 0,
        json: async () => await asJson(context2) ?? {}
      };
    };
    this.experimentsEnabled = experimentsEnabled(configurationService, productService, this.environmentService);
    if (this.experimentsEnabled) {
      this.tasClient = this.setupTASClient();
      this.defaultAccountService.getDefaultAccount().then(() => this.recreateTasClientIfEndpointChanged());
      this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.recreateTasClientIfEndpointChanged()));
      this._register(toDisposable(() => {
        this.revokeCurrentSetup?.();
        WorkbenchAssignmentService.disposeTasClient(this.tasClient);
      }));
    }
    this.contextFilter = this._register(new AssignmentContextFilter(storageService));
    this.telemetry = this._register(new WorkbenchAssignmentServiceTelemetry(telemetryService, productService, this.contextFilter));
    this._register(this.telemetry.onDidUpdateAssignmentContext(() => this._onDidRefetchAssignments.fire()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("experiments.override")) {
        this._onDidRefetchAssignments.fire();
      }
    }));
    this.keyValueStorage = new MementoKeyValueStorage(new Memento("experiment.service.memento", storageService));
    const overrideDelaySetting = configurationService.getValue("experiments.overrideDelay");
    const overrideDelay = typeof overrideDelaySetting === "number" ? overrideDelaySetting : 0;
    this.overrideInitDelay = timeout(overrideDelay);
  }
  async getTreatment(name) {
    const result = await this.doGetTreatment(name);
    this.telemetryService.publicLog2("tasClientReadTreatmentComplete", {
      treatmentName: name,
      treatmentValue: JSON.stringify(result)
    });
    return result;
  }
  async doGetTreatment(name) {
    await this.overrideInitDelay;
    const override = this.configurationService.getValue(`experiments.override.${name}`);
    if (override !== void 0) {
      return override;
    }
    if (!this.tasClient) {
      return void 0;
    }
    if (!this.experimentsEnabled) {
      return void 0;
    }
    const client = await this.tasClient;
    if (!this.networkInitialized) {
      await client.getTreatmentVariableAsync("vscode", `${ASSIGNMENTS_SCOPE_PREFIX}${name}`, true);
    }
    return resolveScopedTreatment((readName) => client.getTreatmentVariable("vscode", readName), name);
  }
  /**
   * Resolves the new TAS assignments API URL from the account entitlements `exp` endpoint,
   * or `undefined` when no account/endpoint is available.
   */
  getAssignmentsEndpoint() {
    const account = this.defaultAccountService.currentDefaultAccount;
    const endpoints = account?.entitlementsData?.endpoints;
    const exp = endpoints?.exp;
    if (!exp) {
      return void 0;
    }
    return `${exp.replace(/\/+$/, "")}/api/v1/assignments`;
  }
  /** Recreates the TAS client when the resolved assignments endpoint has changed. */
  recreateTasClientIfEndpointChanged() {
    if (this._store.isDisposed) {
      return;
    }
    const next = this.getAssignmentsEndpoint();
    if (next !== this.assignmentsEndpoint) {
      this.tasClient = this.setupTASClient();
    }
  }
  async setupTASClient() {
    this.tasSetupDisposables.clear();
    const generation = ++this.setupGeneration;
    this.networkInitialized = false;
    this.revokeCurrentSetup?.();
    WorkbenchAssignmentService.disposeTasClient(this.tasClient);
    let revoked = false;
    this.revokeCurrentSetup = () => {
      revoked = true;
    };
    const service = this;
    const keyValueStorage = {
      getValue(key3, defaultValue) {
        return service.keyValueStorage.getValue(key3, defaultValue);
      },
      setValue(key3, value2) {
        if (!revoked) {
          service.keyValueStorage.setValue(key3, value2);
        }
      }
    };
    const telemetry = {
      setSharedProperty(name, value2) {
        if (!revoked) {
          service.telemetry.setSharedProperty(name, value2);
        }
      },
      postEvent(eventName, props) {
        if (!revoked) {
          service.telemetry.postEvent(eventName, props);
        }
      }
    };
    const targetPopulation = this.productService.quality === "stable" ? "public" /* Public */ : this.productService.quality === "exploration" ? "exploration" /* Exploration */ : "insider" /* Insiders */;
    const filterProvider = new AssignmentFilterProvider(
      this.productService.version,
      this.productService.nameLong,
      this.telemetryService.machineId,
      this.telemetryService.devDeviceId,
      targetPopulation,
      this.productService.date ?? "",
      this.environmentService.isSessionsWindow ? "agents" /* Agents */ : "editor" /* Editor */
    );
    const extensionsFilterProvider = this.instantiationService.createInstance(CopilotAssignmentFilterProvider);
    this.tasSetupDisposables.add(extensionsFilterProvider);
    this.tasSetupDisposables.add(extensionsFilterProvider.onDidChangeFilters(() => this.refetchAssignments()));
    const assignmentsEndpoint = this.getAssignmentsEndpoint();
    this.assignmentsEndpoint = assignmentsEndpoint;
    let assignmentsFilterProviders;
    if (assignmentsEndpoint) {
      const coreAssignmentsFilterProvider = new VSCodeCoreAssignmentsFilterProvider(
        this.productService.version,
        this.productService.nameLong,
        this.telemetryService.devDeviceId,
        targetPopulation,
        this.productService.date ?? "",
        this.environmentService.isSessionsWindow ? "agents" /* Agents */ : "editor" /* Editor */
      );
      const githubAssignmentsFilterProvider = this.instantiationService.createInstance(GitHubCoreAssignmentsFilterProvider);
      this.tasSetupDisposables.add(githubAssignmentsFilterProvider);
      this.tasSetupDisposables.add(githubAssignmentsFilterProvider.onDidChangeFilters(() => this.refetchAssignments()));
      assignmentsFilterProviders = [coreAssignmentsFilterProvider, githubAssignmentsFilterProvider];
    }
    const tasConfig = this.productService.tasConfig;
    const tasClientUrl = resolveAmdNodeModulePath("tas-client", "dist/tas-client.min.js");
    const tasClientModule = await import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      `${tasClientUrl}`
    );
    const fetchStopWatch = StopWatch.create();
    const tasClient = new tasClientModule.ExperimentationService({
      filterProviders: [filterProvider, extensionsFilterProvider],
      telemetry,
      storageKey: ASSIGNMENT_STORAGE_KEY,
      keyValueStorage,
      assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
      telemetryEventName: tasConfig.telemetryEventName,
      endpoint: tasConfig.endpoint,
      extensionName: "vscode-core",
      assignmentsEndpoint,
      assignmentsFilterProviders,
      // Route the assignments request through the main-process request service so it is
      // not subject to renderer CORS (parity with how core reaches api.github.com).
      assignmentsFetch: assignmentsEndpoint ? (url, init) => revoked ? Promise.resolve({ status: 0, json: async () => ({}) }) : service.assignmentsFetch(url, init) : void 0,
      refetchInterval: ASSIGNMENT_REFETCH_INTERVAL
    });
    await tasClient.initializePromise;
    tasClient.initialFetch.then(() => {
      if (generation !== this.setupGeneration) {
        return;
      }
      this.networkInitialized = true;
      this.logFetchLatency("initial", fetchStopWatch.elapsed());
    }).catch(() => void 0);
    return tasClient;
  }
  logFetchLatency(fetchType, durationMs) {
    this.telemetryService.publicLog2("tasClientFetchLatency", {
      fetchType,
      durationMs
    });
  }
  async refetchAssignments() {
    if (!this.tasClient) {
      return;
    }
    const tasClient = await this.tasClient;
    await tasClient.initialFetch;
    const refetchStopWatch = StopWatch.create();
    await tasClient.getTreatmentVariableAsync("vscode", "refresh", false);
    this.logFetchLatency("refetch", refetchStopWatch.elapsed());
  }
  async getCurrentExperiments() {
    if (!this.tasClient) {
      return void 0;
    }
    if (!this.experimentsEnabled) {
      return void 0;
    }
    await this.tasClient;
    return this.telemetry.assignmentContext;
  }
  addTelemetryAssignmentFilter(filter2) {
    this.contextFilter.addFilter(filter2);
  }
  /** Stops a TAS client's auto-polling once it resolves. Safe to call with `undefined`. */
  static disposeTasClient(client) {
    client?.then((c) => c.dispose()).catch(() => void 0);
  }
};

WorkbenchAssignmentService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IDefaultAccountService),
  __decorateParam(7, IRequestService)
], WorkbenchAssignmentService);

registerSingleton(IWorkbenchAssignmentService, WorkbenchAssignmentService, 1 /* Delayed */);

var registry = Registry.as(Extensions4.Configuration);

registry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  "properties": {
    "workbench.enableExperiments": {
      "type": "boolean",
      "description": localize(22721, null),
      "default": true,
      "scope": 1 /* APPLICATION */,
      "restricted": true,
      "tags": ["usesOnlineServices"]
    }
  }
});
export { resolveScopedTreatment, IWorkbenchAssignmentService, ASSIGNMENTS_SCOPE_PREFIX, MementoKeyValueStorage, WorkbenchAssignmentServiceTelemetry, WorkbenchAssignmentService, registry };
