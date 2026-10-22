// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensionsSlowActions.ts
import { URI } from "./module-0032.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IRequestService, asText } from "./module-0947.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Utils } from "./module-4000.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/extensionsSlowActions.ts
var RepoInfo = class {
  static fromExtension(desc) {
    let result;
    if (desc.bugs && typeof desc.bugs.url === "string") {
      const base = URI.parse(desc.bugs.url);
      const match2 = /\/([^/]+)\/([^/]+)\/issues\/?$/.exec(desc.bugs.url);
      if (match2) {
        result = {
          base: base.with({ path: null, fragment: null, query: null }).toString(true),
          owner: match2[1],
          repo: match2[2]
        };
      }
    }
    if (!result && desc.repository && typeof desc.repository.url === "string") {
      const base = URI.parse(desc.repository.url);
      const match2 = /\/([^/]+)\/([^/]+)(\.git)?$/.exec(desc.repository.url);
      if (match2) {
        result = {
          base: base.with({ path: null, fragment: null, query: null }).toString(true),
          owner: match2[1],
          repo: match2[2]
        };
      }
    }
    if (result && result.base.indexOf("github") === -1) {
      result = void 0;
    }
    return result;
  }
};

var SlowExtensionAction = class extends Action {
  constructor(extension, profile, _instantiationService) {
    super("report.slow", localize(15643, null), "extension-action report-issue");
    this.extension = extension;
    this.profile = profile;
    this._instantiationService = _instantiationService;
    this.enabled = Boolean(RepoInfo.fromExtension(extension));
  }
  async run() {
    const action = await this._instantiationService.invokeFunction(createSlowExtensionAction, this.extension, this.profile);
    if (action) {
      await action.run();
    }
  }
};

SlowExtensionAction = __decorateClass([
  __decorateParam(2, IInstantiationService)
], SlowExtensionAction);

async function createSlowExtensionAction(accessor, extension, profile) {
  const info = RepoInfo.fromExtension(extension);
  if (!info) {
    return void 0;
  }
  const requestService = accessor.get(IRequestService);
  const instaService = accessor.get(IInstantiationService);
  const url = `https://api.github.com/search/issues?q=is:issue+state:open+in:title+repo:${info.owner}/${info.repo}+%22Extension+causes+high+cpu+load%22`;
  let res;
  try {
    res = await requestService.request({ url, callSite: "extensionsSlowActions.getSlowExtensionAction" }, CancellationToken.None);
  } catch {
    return void 0;
  }
  const rawText = await asText(res);
  if (!rawText) {
    return void 0;
  }
  const data = JSON.parse(rawText);
  if (!data || typeof data.total_count !== "number") {
    return void 0;
  } else if (data.total_count === 0) {
    return instaService.createInstance(ReportExtensionSlowAction, extension, info, profile);
  } else {
    return instaService.createInstance(ShowExtensionSlowAction, extension, info, profile);
  }
}

var ReportExtensionSlowAction = class extends Action {
  constructor(extension, repoInfo, profile, _dialogService, _openerService, _productService, _nativeHostService, _environmentService, _fileService) {
    super("report.slow", localize(15642, null));
    this.extension = extension;
    this.repoInfo = repoInfo;
    this.profile = profile;
    this._dialogService = _dialogService;
    this._openerService = _openerService;
    this._productService = _productService;
    this._nativeHostService = _nativeHostService;
    this._environmentService = _environmentService;
    this._fileService = _fileService;
  }
  async run() {
    const data = Utils.rewriteAbsolutePaths(this.profile.data, "pii_removed");
    const path = joinPath(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
    await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(data, void 0, 4)));
    const os = await this._nativeHostService.getOSProperties();
    const title = encodeURIComponent("Extension causes high cpu load");
    const osVersion = `${os.type} ${os.arch} ${os.release}`;
    const message = `:warning: Make sure to **attach** this file from your *home*-directory:
:warning:\`${path}\`

Find more details here: https://github.com/microsoft/vscode/wiki/Explain-extension-causes-high-cpu-load`;
    const body = encodeURIComponent(`- Issue Type: \`Performance\`
- Extension Name: \`${this.extension.name}\`
- Extension Version: \`${this.extension.version}\`
- OS Version: \`${osVersion}\`
- VS Code version: \`${this._productService.version}\`

${message}`);
    const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues/new/?body=${body}&title=${title}`;
    this._openerService.open(URI.parse(url));
    this._dialogService.info(
      localize(15641, null),
      localize(15639, null, path.fsPath)
    );
  }
};

ReportExtensionSlowAction = __decorateClass([
  __decorateParam(3, IDialogService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IProductService),
  __decorateParam(6, INativeHostService),
  __decorateParam(7, INativeWorkbenchEnvironmentService),
  __decorateParam(8, IFileService)
], ReportExtensionSlowAction);

var ShowExtensionSlowAction = class extends Action {
  constructor(extension, repoInfo, profile, _dialogService, _openerService, _environmentService, _fileService) {
    super("show.slow", localize(15644, null));
    this.extension = extension;
    this.repoInfo = repoInfo;
    this.profile = profile;
    this._dialogService = _dialogService;
    this._openerService = _openerService;
    this._environmentService = _environmentService;
    this._fileService = _fileService;
  }
  async run() {
    const data = Utils.rewriteAbsolutePaths(this.profile.data, "pii_removed");
    const path = joinPath(this._environmentService.tmpDir, `${this.extension.identifier.value}-unresponsive.cpuprofile.txt`);
    await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(data, void 0, 4)));
    const url = `${this.repoInfo.base}/${this.repoInfo.owner}/${this.repoInfo.repo}/issues?utf8=\u2713&q=is%3Aissue+state%3Aopen+%22Extension+causes+high+cpu+load%22`;
    this._openerService.open(URI.parse(url));
    this._dialogService.info(
      localize(15641, null),
      localize(15640, null, path.fsPath)
    );
  }
};

ShowExtensionSlowAction = __decorateClass([
  __decorateParam(3, IDialogService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, INativeWorkbenchEnvironmentService),
  __decorateParam(6, IFileService)
], ShowExtensionSlowAction);
export { createSlowExtensionAction, RepoInfo, SlowExtensionAction, ReportExtensionSlowAction, ShowExtensionSlowAction };
