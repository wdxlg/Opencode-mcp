// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/label/common/labelService.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { posix, sep, win32 } from "./module-0026.mjs";
import { isProposedApiEnabled } from "./module-0889.mjs";
import { Disposable, dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { Emitter } from "./module-0017.mjs";
import { OS } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { Memento } from "./module-1042.mjs";
import { match } from "./module-0857.mjs";
import { basename2, basenameOrAuthority, dirname2, isEqualOrParent2, joinPath, relativePath } from "./module-0034.mjs";
import { getPathLabel, tildify } from "./module-0711.mjs";
import { IWorkspaceContextService, WORKSPACE_EXTENSION, isSingleFolderWorkspaceIdentifier, isTemporaryWorkspace, isUntitledWorkspace, isWorkspace, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IPathService } from "./module-0939.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/label/common/labelService.ts
var resourceLabelFormattersExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "resourceLabelFormatters",
  jsonSchema: {
    description: localize(23203, null),
    type: "array",
    items: {
      type: "object",
      required: ["scheme", "formatting"],
      properties: {
        scheme: {
          type: "string",
          description: localize(23208, null)
        },
        authority: {
          type: "string",
          description: localize(23204, null)
        },
        formatting: {
          description: localize(23205, null),
          type: "object",
          properties: {
            label: {
              type: "string",
              description: localize(23207, null)
            },
            separator: {
              type: "string",
              description: localize(23209, null)
            },
            stripPathStartingSeparator: {
              type: "boolean",
              description: localize(23210, null)
            },
            tildify: {
              type: "boolean",
              description: localize(23211, null)
            },
            workspaceSuffix: {
              type: "string",
              description: localize(23206, null)
            }
          }
        }
      }
    }
  }
});

var posixPathSeparatorRegexp = /\//g;

var winPathSeparatorRegexp = /[\\\/]/g;

var labelMatchingRegexp = /\$\{(scheme|authoritySuffix|authority|path|(query)\.(.+?))\}/g;

function hasDriveLetterIgnorePlatform(path) {
  return !!(path && path[2] === ":");
}

var ResourceLabelFormattersHandler = class {
  constructor(labelService) {
    this.formattersDisposables = /* @__PURE__ */ new Map();
    resourceLabelFormattersExtPoint.setHandler((extensions, delta2) => {
      for (const added of delta2.added) {
        for (const untrustedFormatter of added.value) {
          const formatter = { ...untrustedFormatter };
          if (typeof formatter.formatting.label !== "string") {
            formatter.formatting.label = "${authority}${path}";
          }
          if (typeof formatter.formatting.separator !== `string`) {
            formatter.formatting.separator = sep;
          }
          if (!isProposedApiEnabled(added.description, "contribLabelFormatterWorkspaceTooltip") && formatter.formatting.workspaceTooltip) {
            formatter.formatting.workspaceTooltip = void 0;
          }
          this.formattersDisposables.set(formatter, labelService.registerFormatter(formatter));
        }
      }
      for (const removed of delta2.removed) {
        for (const formatter of removed.value) {
          dispose(this.formattersDisposables.get(formatter));
        }
      }
    });
  }
};

ResourceLabelFormattersHandler = __decorateClass([
  __decorateParam(0, ILabelService)
], ResourceLabelFormattersHandler);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(ResourceLabelFormattersHandler, 3 /* Restored */);

var FORMATTER_CACHE_SIZE = 50;

var LabelService = class extends Disposable {
  constructor(environmentService, contextService, pathService, remoteAgentService, storageService, lifecycleService) {
    super();
    this.environmentService = environmentService;
    this.contextService = contextService;
    this.pathService = pathService;
    this.remoteAgentService = remoteAgentService;
    this._onDidChangeFormatters = this._register(new Emitter({ leakWarningThreshold: 400, leakWarningName: "LabelService._onDidChangeFormatters" }));
    this.onDidChangeFormatters = this._onDidChangeFormatters.event;
    this.os = OS;
    this.userHome = pathService.defaultUriScheme === Schemas.file ? this.pathService.userHome({ preferLocal: true }) : void 0;
    const memento = this.storedFormattersMemento = new Memento("cachedResourceLabelFormatters2", storageService);
    this.storedFormatters = memento.getMemento(0 /* PROFILE */, 1 /* MACHINE */);
    this.formatters = this.storedFormatters?.formatters?.slice() || [];
    this.resolveRemoteEnvironment();
  }
  async resolveRemoteEnvironment() {
    const env2 = await this.remoteAgentService.getEnvironment();
    this.os = env2?.os ?? OS;
    this.userHome = await this.pathService.userHome();
  }
  getUriHome(resource) {
    const formatter = this.findHomeFormatter(resource);
    return formatter?.home ? resource.with({ path: formatter.home, query: null, fragment: null }) : void 0;
  }
  findHomeFormatter(resource) {
    let bestResult;
    for (const formatter of this.formatters) {
      if (!formatter.home || formatter.scheme !== resource.scheme || formatter.authority && !match(formatter.authority, resource.authority, { ignoreCase: true })) {
        continue;
      }
      if (!isEqualOrParent2(resource, resource.with({ path: formatter.home }))) {
        continue;
      }
      const authorityLength = formatter.authority?.length ?? 0;
      const bestAuthorityLength = bestResult?.authority?.length ?? 0;
      const bestHomeLength = bestResult?.home?.length ?? 0;
      if (!bestResult || formatter.home.length > bestHomeLength || formatter.home.length === bestHomeLength && authorityLength > bestAuthorityLength || formatter.home.length === bestHomeLength && authorityLength === bestAuthorityLength && formatter.priority) {
        bestResult = formatter;
      }
    }
    return bestResult;
  }
  findFormatting(resource) {
    let bestResult;
    for (const formatter of this.formatters) {
      if (formatter.home || formatter.scheme !== resource.scheme) {
        continue;
      }
      if (!formatter.authority && (!bestResult || formatter.priority)) {
        bestResult = formatter;
        continue;
      }
      if (!formatter.authority) {
        continue;
      }
      if (match(formatter.authority, resource.authority, { ignoreCase: true }) && (!bestResult?.authority || formatter.authority.length > bestResult.authority.length || formatter.authority.length === bestResult.authority.length && formatter.priority)) {
        bestResult = formatter;
      }
    }
    return bestResult?.formatting;
  }
  getUriLabel(resource, options3 = {}) {
    const homeFormatter = options3.noPrefix ? void 0 : this.findHomeFormatter(resource);
    if (homeFormatter?.home) {
      const home2 = resource.with({ path: homeFormatter.home, query: null, fragment: null });
      const separator2 = options3.separator ?? homeFormatter.formatting.separator;
      const path = relativePath(home2, resource);
      const label4 = this.formatUri(home2, homeFormatter.formatting);
      return path ? `${label4}${separator2}${this.adjustPathSeparators(path, separator2)}` : label4;
    }
    let formatting = this.findFormatting(resource);
    if (formatting && options3.separator) {
      formatting = { ...formatting, separator: options3.separator };
    }
    let label3 = this.doGetUriLabel(resource, formatting, options3);
    if (!formatting && options3.separator) {
      label3 = this.adjustPathSeparators(label3, options3.separator);
    }
    if (options3.appendWorkspaceSuffix && formatting?.workspaceSuffix) {
      label3 = this.appendWorkspaceSuffix(label3, resource);
    }
    return label3;
  }
  doGetUriLabel(resource, formatting, options3 = {}) {
    if (!formatting) {
      return getPathLabel(resource, {
        os: this.os,
        tildify: this.userHome ? { userHome: this.userHome } : void 0,
        relative: options3.relative ? {
          noPrefix: options3.noPrefix,
          getWorkspace: () => this.contextService.getWorkspace(),
          getWorkspaceFolder: (resource2) => this.contextService.getWorkspaceFolder(resource2)
        } : void 0
      });
    }
    if (options3.relative && this.contextService) {
      let folder = this.contextService.getWorkspaceFolder(resource);
      if (!folder) {
        const workspace = this.contextService.getWorkspace();
        const firstFolder = workspace.folders.at(0);
        if (firstFolder && resource.scheme !== firstFolder.uri.scheme && resource.path.startsWith(posix.sep)) {
          folder = this.contextService.getWorkspaceFolder(firstFolder.uri.with({ path: resource.path }));
        }
      }
      if (folder) {
        const folderLabel = this.formatUri(folder.uri, formatting, options3.noPrefix);
        let relativeLabel = this.formatUri(resource, formatting, options3.noPrefix);
        let overlap = 0;
        while (relativeLabel[overlap] && relativeLabel[overlap] === folderLabel[overlap]) {
          overlap++;
        }
        if (!relativeLabel[overlap] || relativeLabel[overlap] === formatting.separator) {
          relativeLabel = relativeLabel.substring(1 + overlap);
        } else if (overlap === folderLabel.length && folder.uri.path === posix.sep) {
          relativeLabel = relativeLabel.substring(overlap);
        }
        const hasMultipleRoots = this.contextService.getWorkspace().folders.length > 1;
        if (hasMultipleRoots && !options3.noPrefix) {
          const rootName = folder?.name ?? basenameOrAuthority(folder.uri);
          relativeLabel = relativeLabel ? `${rootName} \u2022 ${relativeLabel}` : rootName;
        }
        return relativeLabel;
      }
    }
    return this.formatUri(resource, formatting, options3.noPrefix);
  }
  getUriBasenameLabel(resource) {
    const formatting = this.findFormatting(resource);
    const label3 = this.doGetUriLabel(resource, formatting);
    let pathLib;
    if (formatting?.separator === win32.sep) {
      pathLib = win32;
    } else if (formatting?.separator === posix.sep) {
      pathLib = posix;
    } else {
      pathLib = this.os === 1 /* Windows */ ? win32 : posix;
    }
    return pathLib.basename(label3);
  }
  getWorkspaceLabel(workspace, options3) {
    if (isWorkspace(workspace)) {
      const identifier2 = toWorkspaceIdentifier(workspace);
      if (isSingleFolderWorkspaceIdentifier(identifier2) || isWorkspaceIdentifier(identifier2)) {
        return this.getWorkspaceLabel(identifier2, options3);
      }
      return "";
    }
    if (URI.isUri(workspace)) {
      return this.doGetSingleFolderWorkspaceLabel(workspace, options3);
    }
    if (isSingleFolderWorkspaceIdentifier(workspace)) {
      return this.doGetSingleFolderWorkspaceLabel(workspace.uri, options3);
    }
    if (isWorkspaceIdentifier(workspace)) {
      return this.doGetWorkspaceLabel(workspace.configPath, options3);
    }
    return "";
  }
  doGetWorkspaceLabel(workspaceUri, options3) {
    if (isUntitledWorkspace(workspaceUri, this.environmentService)) {
      return localize(23202, null);
    }
    if (isTemporaryWorkspace(workspaceUri)) {
      return localize(23201, null);
    }
    let filename = basename2(workspaceUri);
    if (filename.endsWith(WORKSPACE_EXTENSION)) {
      filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
    }
    let label3;
    switch (options3?.verbose) {
      case 0 /* SHORT */:
        label3 = filename;
        break;
      case 2 /* LONG */:
        label3 = localize(23213, null, this.getUriLabel(joinPath(dirname2(workspaceUri), filename)));
        break;
      case 1 /* MEDIUM */:
      default:
        label3 = localize(23212, null, filename);
        break;
    }
    if (options3?.verbose === 0 /* SHORT */) {
      return label3;
    }
    return this.appendWorkspaceSuffix(label3, workspaceUri);
  }
  doGetSingleFolderWorkspaceLabel(folderUri, options3) {
    let label3;
    switch (options3?.verbose) {
      case 2 /* LONG */:
        label3 = this.getUriLabel(folderUri);
        break;
      case 0 /* SHORT */:
      case 1 /* MEDIUM */:
      default:
        label3 = basename2(folderUri) || posix.sep;
        break;
    }
    if (options3?.verbose === 0 /* SHORT */) {
      return label3;
    }
    return this.appendWorkspaceSuffix(label3, folderUri);
  }
  getSeparator(scheme, authority) {
    const formatter = this.findFormatting(URI.from({ scheme, authority }));
    return formatter?.separator || posix.sep;
  }
  getHostLabel(scheme, authority) {
    const formatter = this.findFormatting(URI.from({ scheme, authority }));
    return formatter?.workspaceSuffix || authority || "";
  }
  getHostTooltip(scheme, authority) {
    const formatter = this.findFormatting(URI.from({ scheme, authority }));
    return formatter?.workspaceTooltip;
  }
  registerCachedFormatter(formatter) {
    const list2 = this.storedFormatters.formatters ??= [];
    let replace = list2.findIndex((f) => f.scheme === formatter.scheme && f.authority === formatter.authority);
    if (replace === -1 && list2.length >= FORMATTER_CACHE_SIZE) {
      replace = FORMATTER_CACHE_SIZE - 1;
    }
    if (replace === -1) {
      list2.unshift(formatter);
    } else {
      for (let i2 = replace; i2 > 0; i2--) {
        list2[i2] = list2[i2 - 1];
      }
      list2[0] = formatter;
    }
    this.storedFormattersMemento.saveMemento();
    return this.registerFormatter(formatter);
  }
  registerFormatter(formatter) {
    this.formatters.push(formatter);
    this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
    return {
      dispose: () => {
        this.formatters = this.formatters.filter((f) => f !== formatter);
        this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
      }
    };
  }
  formatUri(resource, formatting, forceNoTildify) {
    let label3 = formatting.label.replace(labelMatchingRegexp, (match2, token, qsToken, qsValue) => {
      switch (token) {
        case "scheme":
          return resource.scheme;
        case "authority":
          return resource.authority;
        case "authoritySuffix": {
          const i2 = resource.authority.indexOf("+");
          return i2 === -1 ? resource.authority : resource.authority.slice(i2 + 1);
        }
        case "path": {
          let pathValue = resource.path;
          if (formatting.stripPathSegments) {
            let pos = 0;
            for (let i2 = 0; i2 < formatting.stripPathSegments; i2++) {
              const next = pathValue.indexOf("/", pos + 1);
              if (next === -1) {
                break;
              }
              pos = next;
            }
            pathValue = pathValue.substring(pos);
          }
          return formatting.stripPathStartingSeparator ? pathValue.slice(pathValue[0] === formatting.separator ? 1 : 0) : pathValue;
        }
        default: {
          if (qsToken === "query") {
            const { query } = resource;
            if (query && query[0] === "{" && query[query.length - 1] === "}") {
              try {
                return JSON.parse(query)[qsValue] || "";
              } catch {
              }
            }
          }
          return "";
        }
      }
    });
    if (formatting.normalizeDriveLetter && hasDriveLetterIgnorePlatform(label3)) {
      label3 = label3.charAt(1).toUpperCase() + label3.substr(2);
    }
    if (formatting.tildify && !forceNoTildify) {
      if (this.userHome) {
        label3 = tildify(label3, this.userHome.fsPath, this.os);
      }
    }
    if (formatting.authorityPrefix && resource.authority) {
      label3 = formatting.authorityPrefix + label3;
    }
    return this.adjustPathSeparators(label3, formatting.separator);
  }
  adjustPathSeparators(label3, separator2) {
    return label3.replace(this.os === 1 /* Windows */ ? winPathSeparatorRegexp : posixPathSeparatorRegexp, separator2);
  }
  appendWorkspaceSuffix(label3, uri4) {
    const formatting = this.findFormatting(uri4);
    const suffix = formatting && typeof formatting.workspaceSuffix === "string" ? formatting.workspaceSuffix : void 0;
    return suffix ? `${label3} [${suffix}]` : label3;
  }
};

LabelService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IPathService),
  __decorateParam(3, IRemoteAgentService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, ILifecycleService)
], LabelService);

registerSingleton(ILabelService, LabelService, 1 /* Delayed */);
export { hasDriveLetterIgnorePlatform, resourceLabelFormattersExtPoint, posixPathSeparatorRegexp, winPathSeparatorRegexp, labelMatchingRegexp, ResourceLabelFormattersHandler, FORMATTER_CACHE_SIZE, LabelService };
