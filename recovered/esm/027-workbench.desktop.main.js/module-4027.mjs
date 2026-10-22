// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/electron-browser/startupProfiler.ts
import { URI } from "./module-0032.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { PerfviewContrib } from "./module-1866.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IProductService } from "./module-0873.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILabelService } from "./module-0641.mjs";


// src/vs/workbench/contrib/performance/electron-browser/startupProfiler.ts
var StartupProfiler = class {
  constructor(_dialogService, _environmentService, _textModelResolverService, _clipboardService, lifecycleService, extensionService, _openerService, _nativeHostService, _productService, _fileService, _labelService) {
    this._dialogService = _dialogService;
    this._environmentService = _environmentService;
    this._textModelResolverService = _textModelResolverService;
    this._clipboardService = _clipboardService;
    this._openerService = _openerService;
    this._nativeHostService = _nativeHostService;
    this._productService = _productService;
    this._fileService = _fileService;
    this._labelService = _labelService;
    Promise.all([
      lifecycleService.when(4 /* Eventually */),
      extensionService.whenInstalledExtensionsRegistered()
    ]).then(() => {
      this._stopProfiling();
    });
  }
  _stopProfiling() {
    if (!this._environmentService.args["prof-startup-prefix"]) {
      return;
    }
    const profileFilenamePrefix = URI.file(this._environmentService.args["prof-startup-prefix"]);
    const dir = dirname2(profileFilenamePrefix);
    const prefix = basename2(profileFilenamePrefix);
    const removeArgs = ["--prof-startup"];
    const markerFile = this._fileService.readFile(profileFilenamePrefix).then((value2) => removeArgs.push(...value2.toString().split("|"))).then(() => this._fileService.del(profileFilenamePrefix, { recursive: true })).then(() => new Promise((resolve3) => {
      const check = () => {
        this._fileService.exists(profileFilenamePrefix).then((exists) => {
          if (exists) {
            resolve3();
          } else {
            setTimeout(check, 500);
          }
        });
      };
      check();
    })).then(() => this._fileService.del(profileFilenamePrefix, { recursive: true }));
    markerFile.then(() => {
      return this._fileService.resolve(dir).then((stat) => {
        return (stat.children ? stat.children.filter((value2) => value2.resource.path.includes(prefix)) : []).map((stat2) => stat2.resource);
      });
    }).then((files) => {
      const profileFiles = files.reduce((prev, cur) => `${prev}${this._labelService.getUriLabel(cur)}
`, "\n");
      return this._dialogService.confirm({
        type: "info",
        message: localize(18054, null),
        detail: localize(18052, null, profileFiles),
        primaryButton: localize(18057, null),
        cancelButton: localize(18055, null)
      }).then((res) => {
        if (res.confirmed) {
          Promise.all([
            this._nativeHostService.showItemInFolder(files[0].fsPath),
            this._createPerfIssue(files.map((file) => basename2(file)))
          ]).then(() => {
            return this._dialogService.confirm({
              type: "info",
              message: localize(18058, null),
              detail: localize(18053, null, this._productService.nameLong),
              primaryButton: localize(18056, null)
            }).then((res2) => {
              if (res2.confirmed) {
                this._nativeHostService.relaunch({ removeArgs });
              }
            });
          });
        } else {
          this._nativeHostService.relaunch({ removeArgs });
        }
      });
    });
  }
  async _createPerfIssue(files) {
    const reportIssueUrl = this._productService.reportIssueUrl;
    if (!reportIssueUrl) {
      return;
    }
    const contrib = PerfviewContrib.get();
    const ref = await this._textModelResolverService.createModelReference(contrib.getInputUri());
    try {
      await this._clipboardService.writeText(ref.object.textEditorModel.getValue());
    } finally {
      ref.dispose();
    }
    const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:
${files.map((file) => `-\`${file}\``).join("\n")}
`;
    const baseUrl = reportIssueUrl;
    const queryStringPrefix = baseUrl.indexOf("?") === -1 ? "?" : "&";
    this._openerService.open(URI.parse(`${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`));
  }
};

StartupProfiler = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, INativeHostService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ILabelService)
], StartupProfiler);
export { StartupProfiler };
