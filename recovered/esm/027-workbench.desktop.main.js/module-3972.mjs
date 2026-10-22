// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensionsAutoProfiler.ts
import { ExtensionIdentifier, ExtensionIdentifierSet } from "./module-0688.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { ExtensionHostProfiler } from "./module-3967.mjs";
import { timeout } from "./module-0036.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { generateUuid } from "./module-0190.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { createSlowExtensionAction } from "./module-3964.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { RuntimeExtensionsInput } from "./module-3960.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IExtensionHostProfileService } from "./module-3965.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IProfileAnalysisWorkerService } from "./module-3971.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITimerService } from "./module-1183.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/extensionsAutoProfiler.ts
var ExtensionsAutoProfiler = class {
  constructor(_extensionService, _extensionProfileService, _telemetryService, _logService, _notificationService, _editorService, _instantiationService, _environmentServie, _profileAnalysisService, _configService, _fileService, timerService) {
    this._extensionService = _extensionService;
    this._extensionProfileService = _extensionProfileService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._environmentServie = _environmentServie;
    this._profileAnalysisService = _profileAnalysisService;
    this._configService = _configService;
    this._fileService = _fileService;
    this._blame = new ExtensionIdentifierSet();
    this._perfBaseline = -1;
    if (this._environmentServie.extensionTestsLocationURI) {
      return;
    }
    timerService.perfBaseline.then((value2) => {
      if (value2 < 0) {
        return;
      }
      this._perfBaseline = value2;
      this._unresponsiveListener = _extensionService.onDidChangeResponsiveChange(this._onDidChangeResponsiveChange, this);
    });
  }
  dispose() {
    this._unresponsiveListener?.dispose();
    this._session?.dispose(true);
  }
  async _onDidChangeResponsiveChange(event) {
    if (event.extensionHostKind !== 1 /* LocalProcess */) {
      return;
    }
    const listener = await event.getInspectListener(true);
    if (!listener) {
      return;
    }
    if (event.isResponsive && this._session) {
      this._session.cancel();
      this._logService.info("UNRESPONSIVE extension host: received responsive event and cancelling profiling session");
    } else if (!event.isResponsive && !this._session) {
      const cts = new CancellationTokenSource();
      this._session = cts;
      let session;
      try {
        session = await this._instantiationService.createInstance(ExtensionHostProfiler, listener.host, listener.port).start();
      } catch (err) {
        this._session = void 0;
        return;
      }
      this._logService.info("UNRESPONSIVE extension host: starting to profile NOW");
      try {
        await timeout(5e3, cts.token);
      } catch {
      }
      try {
        this._processCpuProfile(await session.stop());
      } catch (err) {
        onUnexpectedError(err);
      } finally {
        this._session = void 0;
      }
    }
  }
  async _processCpuProfile(profile) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    if (this._configService.getValue("application.experimental.rendererProfiling")) {
      const searchTree = TernarySearchTree.forUris();
      searchTree.fill(this._extensionService.extensions.map((e) => [e.extensionLocation, e]));
      await this._profileAnalysisService.analyseBottomUp(
        profile.data,
        (url) => searchTree.findSubstr(URI.parse(url))?.identifier.value ?? "<<not-found>>",
        this._perfBaseline,
        false
      );
    }
    const categories = this._extensionService.extensions.filter((e) => e.extensionLocation.scheme === Schemas.file).map((e) => [e.extensionLocation, ExtensionIdentifier.toKey(e.identifier)]);
    const data = await this._profileAnalysisService.analyseByLocation(profile.data, categories);
    let overall = 0;
    let top2 = "";
    let topAggregated = -1;
    for (const [category11, aggregated] of data) {
      overall += aggregated;
      if (aggregated > topAggregated) {
        topAggregated = aggregated;
        top2 = category11;
      }
    }
    const topPercentage = topAggregated / (overall / 100);
    const extension = await this._extensionService.getExtension(top2);
    if (!extension) {
      return;
    }
    const profilingSessionId = generateUuid();
    const path = joinPath(this._environmentServie.tmpDir, `exthost-${Math.random().toString(16).slice(2, 8)}.cpuprofile`);
    await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(profile.data)));
    this._logService.warn(`UNRESPONSIVE extension host: '${top2}' took ${topPercentage}% of ${topAggregated / 1e3}ms, saved PROFILE here: '${path}'`);
    this._telemetryService.publicLog2("exthostunresponsive", {
      profilingSessionId,
      duration: overall,
      data: data.map((tuple) => tuple[0]).flat(),
      id: ExtensionIdentifier.toKey(extension.identifier)
    });
    this._extensionProfileService.setUnresponsiveProfile(extension.identifier, profile);
    if (!(topPercentage >= 95 && topAggregated >= 5e6)) {
      return;
    }
    const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, extension, profile);
    if (!action) {
      return;
    }
    if (this._blame.has(extension.identifier) || this._blame.size >= 3) {
      return;
    }
    this._blame.add(extension.identifier);
    this._notificationService.prompt(
      Severity2.Warning,
      localize(
        15638,
        null,
        extension.displayName || extension.name
      ),
      [
        {
          label: localize(15637, null),
          run: () => this._editorService.openEditor(RuntimeExtensionsInput.instance, { pinned: true })
        },
        action
      ],
      { priority: 2 /* SILENT */ }
    );
  }
};

ExtensionsAutoProfiler = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IExtensionHostProfileService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, INativeWorkbenchEnvironmentService),
  __decorateParam(8, IProfileAnalysisWorkerService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IFileService),
  __decorateParam(11, ITimerService)
], ExtensionsAutoProfiler);
export { ExtensionsAutoProfiler };
