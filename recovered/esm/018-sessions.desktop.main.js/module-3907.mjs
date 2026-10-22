// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textfile/electron-browser/nativeTextFileService.ts
import { AbstractTextFileService } from "./module-3906.mjs";
import { localize } from "./module-0001.mjs";
import { Promises } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUntitledTextEditorService } from "./module-1126.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IPathService } from "./module-0939.mjs";
import { IWorkingCopyFileService } from "./module-1076.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IElevatedFileService } from "./module-1396.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDecorationsService } from "./module-1068.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITextFileService } from "./module-1064.mjs";


// src/vs/workbench/services/textfile/electron-browser/nativeTextFileService.ts
var NativeTextFileService = class extends AbstractTextFileService {
  constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
    super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
    this.environmentService = environmentService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.lifecycleService.onWillShutdown((event) => event.join(this.onWillShutdown(), { id: "join.textFiles", label: localize(23386, null) })));
  }
  async onWillShutdown() {
    let modelsPendingToSave;
    while ((modelsPendingToSave = this.files.models.filter((model) => model.hasState(2 /* PENDING_SAVE */))).length > 0) {
      await Promises.settled(modelsPendingToSave.map((model) => model.joinState(2 /* PENDING_SAVE */)));
    }
  }
  async read(resource, options3) {
    options3 = this.ensureLimits(options3);
    return super.read(resource, options3);
  }
  async readStream(resource, options3) {
    options3 = this.ensureLimits(options3);
    return super.readStream(resource, options3);
  }
  ensureLimits(options3) {
    let ensuredOptions;
    if (!options3) {
      ensuredOptions = /* @__PURE__ */ Object.create(null);
    } else {
      ensuredOptions = options3;
    }
    let ensuredLimits;
    if (!ensuredOptions.limits) {
      ensuredLimits = /* @__PURE__ */ Object.create(null);
      ensuredOptions = {
        ...ensuredOptions,
        limits: ensuredLimits
      };
    } else {
      ensuredLimits = ensuredOptions.limits;
    }
    return ensuredOptions;
  }
};

NativeTextFileService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUntitledTextEditorService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IModelService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IFileDialogService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IFilesConfigurationService),
  __decorateParam(10, ICodeEditorService),
  __decorateParam(11, IPathService),
  __decorateParam(12, IWorkingCopyFileService),
  __decorateParam(13, IUriIdentityService),
  __decorateParam(14, ILanguageService),
  __decorateParam(15, IElevatedFileService),
  __decorateParam(16, ILogService),
  __decorateParam(17, IDecorationsService)
], NativeTextFileService);

registerSingleton(ITextFileService, NativeTextFileService, 0 /* Eager */);
export { NativeTextFileService };
