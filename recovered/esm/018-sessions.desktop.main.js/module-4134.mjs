// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tags/electron-browser/workspaceTags.ts
import { IWorkspaceTagsService, getHashedRemotesFromConfig } from "./module-3349.mjs";
import { hashAsync } from "./module-0039.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { isWindows } from "./module-0014.mjs";
import { AllowedSecondLevelDomains, getDomainsOfRemotes } from "./module-3348.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IRequestService } from "./module-0947.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IDiagnosticsService } from "./module-1702.mjs";
import { IProductService } from "./module-0875.mjs";
import { INativeHostService } from "./module-2566.mjs";


// src/vs/workbench/contrib/tags/electron-browser/workspaceTags.ts
async function getHashedRemotesFromConfig2(text2, stripEndingDotGit = false) {
  return getHashedRemotesFromConfig(text2, stripEndingDotGit, hashAsync);
}

var WorkspaceTags = class {
  constructor(fileService, contextService, telemetryService, requestService, textFileService, workspaceTagsService, diagnosticsService, productService, nativeHostService) {
    this.fileService = fileService;
    this.contextService = contextService;
    this.telemetryService = telemetryService;
    this.requestService = requestService;
    this.textFileService = textFileService;
    this.workspaceTagsService = workspaceTagsService;
    this.diagnosticsService = diagnosticsService;
    this.productService = productService;
    this.nativeHostService = nativeHostService;
    if (this.telemetryService.telemetryLevel === 3 /* USAGE */) {
      this.report();
    }
  }
  async report() {
    this.reportWindowsEdition();
    this.workspaceTagsService.getTags().then((tags) => this.reportWorkspaceTags(tags), (error) => onUnexpectedError(error));
    this.reportCloudStats();
    this.reportProxyStats();
    this.getWorkspaceInformation().then((stats) => this.diagnosticsService.reportWorkspaceStats(stats));
  }
  async reportWindowsEdition() {
    if (!isWindows) {
      return;
    }
    let value2 = await this.nativeHostService.windowsGetStringRegKey("HKEY_LOCAL_MACHINE", "SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "EditionID");
    if (value2 === void 0) {
      value2 = "Unknown";
    }
    this.telemetryService.publicLog2("windowsEdition", { edition: value2 });
  }
  async getWorkspaceInformation() {
    const workspace = this.contextService.getWorkspace();
    const state = this.contextService.getWorkbenchState();
    const telemetryId = await this.workspaceTagsService.getTelemetryWorkspaceId(workspace, state);
    return {
      id: workspace.id,
      telemetryId,
      rendererSessionId: this.telemetryService.sessionId,
      folders: workspace.folders,
      transient: workspace.transient,
      configuration: workspace.configuration
    };
  }
  reportWorkspaceTags(tags) {
    this.telemetryService.publicLog("workspce.tags", tags);
  }
  reportRemoteDomains(workspaceUris) {
    Promise.all(workspaceUris.map((workspaceUri) => {
      const path = workspaceUri.path;
      const uri4 = workspaceUri.with({ path: `${path !== "/" ? path : ""}/.git/config` });
      return this.fileService.exists(uri4).then((exists) => {
        if (!exists) {
          return [];
        }
        return this.textFileService.read(uri4, { acceptTextOnly: true }).then(
          (content) => getDomainsOfRemotes(content.value, AllowedSecondLevelDomains),
          (err) => []
          // ignore missing or binary file
        );
      });
    })).then((domains) => {
      const set = domains.reduce((set2, list3) => list3.reduce((set3, item) => set3.add(item), set2), /* @__PURE__ */ new Set());
      const list2 = [];
      set.forEach((item) => list2.push(item));
      this.telemetryService.publicLog("workspace.remotes", { domains: list2.sort() });
    }, onUnexpectedError);
  }
  reportRemotes(workspaceUris) {
    Promise.all(workspaceUris.map((workspaceUri) => {
      return this.workspaceTagsService.getHashedRemotesFromUri(workspaceUri, true);
    })).then(() => {
    }, onUnexpectedError);
  }
  /* __GDPR__FRAGMENT__
  	"AzureTags" : {
  		"node" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
  	}
  */
  reportAzureNode(workspaceUris, tags) {
    const uris = workspaceUris.map((workspaceUri) => {
      const path = workspaceUri.path;
      return workspaceUri.with({ path: `${path !== "/" ? path : ""}/node_modules` });
    });
    return this.fileService.resolveAll(uris.map((resource) => ({ resource }))).then(
      (results) => {
        const names = [].concat(...results.map((result) => result.success ? result.stat.children || [] : [])).map((c) => c.name);
        const referencesAzure = WorkspaceTags.searchArray(names, /azure/i);
        if (referencesAzure) {
          tags["node"] = true;
        }
        return tags;
      },
      (err) => {
        return tags;
      }
    );
  }
  static searchArray(arr, regEx) {
    return arr.some((v2) => v2.search(regEx) > -1) || void 0;
  }
  /* __GDPR__FRAGMENT__
  	"AzureTags" : {
  		"java" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
  	}
  */
  reportAzureJava(workspaceUris, tags) {
    return Promise.all(workspaceUris.map((workspaceUri) => {
      const path = workspaceUri.path;
      const uri4 = workspaceUri.with({ path: `${path !== "/" ? path : ""}/pom.xml` });
      return this.fileService.exists(uri4).then((exists) => {
        if (!exists) {
          return false;
        }
        return this.textFileService.read(uri4, { acceptTextOnly: true }).then(
          (content) => !!content.value.match(/azure/i),
          (err) => false
        );
      });
    })).then((javas) => {
      if (javas.indexOf(true) !== -1) {
        tags["java"] = true;
      }
      return tags;
    });
  }
  reportAzure(uris) {
    const tags = /* @__PURE__ */ Object.create(null);
    this.reportAzureNode(uris, tags).then((tags2) => {
      return this.reportAzureJava(uris, tags2);
    }).then((tags2) => {
      if (Object.keys(tags2).length) {
        this.telemetryService.publicLog("workspace.azure", tags2);
      }
    }).then(void 0, onUnexpectedError);
  }
  reportCloudStats() {
    const uris = this.contextService.getWorkspace().folders.map((folder) => folder.uri);
    if (uris.length && this.fileService) {
      this.reportRemoteDomains(uris);
      this.reportRemotes(uris);
      this.reportAzure(uris);
    }
  }
  reportProxyStats() {
    const downloadUrl = this.productService.downloadUrl;
    if (!downloadUrl) {
      return;
    }
    this.requestService.resolveProxy(downloadUrl).then((proxy) => {
      let type = proxy ? String(proxy).trim().split(/\s+/, 1)[0] : "EMPTY";
      if (["DIRECT", "PROXY", "HTTPS", "SOCKS", "EMPTY"].indexOf(type) === -1) {
        type = "UNKNOWN";
      }
    }).then(void 0, onUnexpectedError);
  }
};

WorkspaceTags = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IRequestService),
  __decorateParam(4, ITextFileService),
  __decorateParam(5, IWorkspaceTagsService),
  __decorateParam(6, IDiagnosticsService),
  __decorateParam(7, IProductService),
  __decorateParam(8, INativeHostService)
], WorkspaceTags);
export { getHashedRemotesFromConfig2, WorkspaceTags };
