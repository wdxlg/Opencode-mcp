// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners.ts
import { detectLinks, getLinkSuffix } from "./module-3198.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1118.mjs";
import { QueryBuilder } from "./module-1311.mjs";
import { osPathModule, updateLinkWithRelativeCwd } from "./module-3194.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISearchService } from "./module-1000.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { getTerminalLinkType } from "./module-3199.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkOpeners.ts
var TerminalLocalFileLinkOpener = class {
  constructor(_editorService) {
    this._editorService = _editorService;
  }
  async open(link2) {
    if (!link2.uri) {
      throw new Error("Tried to open file link without a resolved URI");
    }
    const linkSuffix = link2.parsedLink ? link2.parsedLink.suffix : getLinkSuffix(link2.text);
    let selection = link2.selection;
    if (!selection) {
      selection = linkSuffix?.row === void 0 ? void 0 : {
        startLineNumber: linkSuffix.row ?? 1,
        startColumn: linkSuffix.col ?? 1,
        endLineNumber: linkSuffix.rowEnd,
        endColumn: linkSuffix.colEnd
      };
    }
    await this._editorService.openEditor({
      resource: link2.uri,
      options: { pinned: true, selection, revealIfOpened: true }
    });
  }
};

TerminalLocalFileLinkOpener = __decorateClass([
  __decorateParam(0, IEditorService)
], TerminalLocalFileLinkOpener);

var TerminalLocalFolderInWorkspaceLinkOpener = class {
  constructor(_commandService) {
    this._commandService = _commandService;
  }
  async open(link2) {
    if (!link2.uri) {
      throw new Error("Tried to open folder in workspace link without a resolved URI");
    }
    await this._commandService.executeCommand("revealInExplorer", link2.uri);
  }
};

TerminalLocalFolderInWorkspaceLinkOpener = __decorateClass([
  __decorateParam(0, ICommandService)
], TerminalLocalFolderInWorkspaceLinkOpener);

var TerminalLocalFolderOutsideWorkspaceLinkOpener = class {
  constructor(_hostService) {
    this._hostService = _hostService;
  }
  async open(link2) {
    if (!link2.uri) {
      throw new Error("Tried to open folder in workspace link without a resolved URI");
    }
    this._hostService.openWindow([{ folderUri: link2.uri }], { forceNewWindow: true });
  }
};

TerminalLocalFolderOutsideWorkspaceLinkOpener = __decorateClass([
  __decorateParam(0, IHostService)
], TerminalLocalFolderOutsideWorkspaceLinkOpener);

var TerminalSearchLinkOpener = class {
  constructor(_capabilities, _initialCwd, _localFileOpener, _localFolderInWorkspaceOpener, _getOS, _fileService, instantiationService, _quickInputService, _searchService, _logService, _workbenchEnvironmentService, _workspaceContextService) {
    this._capabilities = _capabilities;
    this._initialCwd = _initialCwd;
    this._localFileOpener = _localFileOpener;
    this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
    this._getOS = _getOS;
    this._fileService = _fileService;
    this._quickInputService = _quickInputService;
    this._searchService = _searchService;
    this._logService = _logService;
    this._workbenchEnvironmentService = _workbenchEnvironmentService;
    this._workspaceContextService = _workspaceContextService;
    this._fileQueryBuilder = instantiationService.createInstance(QueryBuilder);
  }
  async open(link2) {
    const osPath = osPathModule(this._getOS());
    const pathSeparator = osPath.sep;
    let text2 = link2.text.replace(/^file:\/\/\/?/, "");
    text2 = osPath.normalize(text2).replace(/^(\.+[\\/])+/, "");
    if (link2.contextLine) {
      const iso8601Pattern = /:\d{2}:\d{2}[+-]\d{2}:\d{2}\.[a-z]+/;
      if (!iso8601Pattern.test(link2.text)) {
        const parsedLinks = detectLinks(link2.contextLine, this._getOS());
        const matchingParsedLink = parsedLinks.find((parsedLink) => parsedLink.suffix && link2.text.startsWith(parsedLink.path.text));
        if (matchingParsedLink) {
          if (matchingParsedLink.suffix?.row !== void 0) {
            text2 = matchingParsedLink.path.text;
            text2 += `:${matchingParsedLink.suffix.row}`;
            if (matchingParsedLink.suffix?.col !== void 0) {
              text2 += `:${matchingParsedLink.suffix.col}`;
            }
          }
        }
      }
    }
    text2 = text2.replace(/:[^\\/\d][^\d]*$/, "");
    text2 = text2.replace(/\.$/, "");
    this._workspaceContextService.getWorkspace().folders.forEach((folder) => {
      if (text2.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
        text2 = text2.substring(folder.name.length + 1);
        return;
      }
    });
    let cwdResolvedText = text2;
    if (this._capabilities.has(2 /* CommandDetection */)) {
      cwdResolvedText = updateLinkWithRelativeCwd(this._capabilities, link2.bufferRange.start.y, text2, osPath, this._logService)?.[0] || text2;
    }
    if (await this._tryOpenExactLink(cwdResolvedText, link2)) {
      return;
    }
    if (text2 !== cwdResolvedText) {
      if (await this._tryOpenExactLink(text2, link2)) {
        return;
      }
    }
    return this._quickInputService.quickAccess.show(text2);
  }
  async _getExactMatch(sanitizedLink) {
    const os = this._getOS();
    const pathModule = osPathModule(os);
    const isAbsolute2 = pathModule.isAbsolute(sanitizedLink);
    let absolutePath2 = isAbsolute2 ? sanitizedLink : void 0;
    if (!isAbsolute2 && this._initialCwd.length > 0) {
      absolutePath2 = pathModule.join(this._initialCwd, sanitizedLink);
    }
    let resourceMatch;
    if (absolutePath2) {
      let normalizedAbsolutePath = absolutePath2;
      if (os === 1 /* Windows */) {
        normalizedAbsolutePath = absolutePath2.replace(/\\/g, "/");
        if (normalizedAbsolutePath.match(/[a-z]:/i)) {
          normalizedAbsolutePath = `/${normalizedAbsolutePath}`;
        }
      }
      let uri4;
      if (this._workbenchEnvironmentService.remoteAuthority) {
        uri4 = URI.from({
          scheme: Schemas.vscodeRemote,
          authority: this._workbenchEnvironmentService.remoteAuthority,
          path: normalizedAbsolutePath
        });
      } else {
        uri4 = URI.file(normalizedAbsolutePath);
      }
      try {
        const fileStat = await this._fileService.stat(uri4);
        resourceMatch = { uri: uri4, isDirectory: fileStat.isDirectory };
      } catch {
      }
    }
    if (!resourceMatch) {
      const results = await this._searchService.fileSearch(
        this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
          filePattern: sanitizedLink,
          maxResults: 2
        })
      );
      if (results.results.length > 0) {
        if (results.results.length === 1) {
          resourceMatch = { uri: results.results[0].resource };
        } else if (!isAbsolute2) {
          const results2 = await this._searchService.fileSearch(
            this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
              filePattern: `**/${sanitizedLink}`
            })
          );
          const exactMatches = results2.results.filter((e4) => e4.resource.toString().endsWith(sanitizedLink));
          if (exactMatches.length === 1) {
            resourceMatch = { uri: exactMatches[0].resource };
          }
        }
      }
    }
    return resourceMatch;
  }
  async _tryOpenExactLink(text2, link2) {
    const sanitizedLink = text2.replace(/:\d+(:\d+)?$/, "");
    try {
      const result = await this._getExactMatch(sanitizedLink);
      if (result) {
        const { uri: uri4, isDirectory } = result;
        const linkToOpen = {
          // Use the absolute URI's path here so the optional line/col get detected
          text: result.uri.path + (text2.match(/:\d+(:\d+)?$/)?.[0] || ""),
          uri: uri4,
          bufferRange: link2.bufferRange,
          type: link2.type
        };
        if (uri4) {
          await (isDirectory ? this._localFolderInWorkspaceOpener.open(linkToOpen) : this._localFileOpener.open(linkToOpen));
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }
};

TerminalSearchLinkOpener = __decorateClass([
  __decorateParam(5, IFileService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IQuickInputService),
  __decorateParam(8, ISearchService),
  __decorateParam(9, ITerminalLogService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IWorkspaceContextService)
], TerminalSearchLinkOpener);

var TerminalUrlLinkOpener = class {
  constructor(_isRemote, _localFileOpener, _localFolderInWorkspaceOpener, _localFolderOutsideWorkspaceOpener, _openerService, _configurationService, _fileService, _uriIdentityService, _workspaceContextService, _logService) {
    this._isRemote = _isRemote;
    this._localFileOpener = _localFileOpener;
    this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
    this._localFolderOutsideWorkspaceOpener = _localFolderOutsideWorkspaceOpener;
    this._openerService = _openerService;
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    this._logService = _logService;
  }
  async open(link2) {
    if (!link2.uri) {
      throw new Error("Tried to open a url without a resolved URI");
    }
    if (link2.uri.scheme === Schemas.file) {
      return this._openFileSchemeLink(link2);
    }
    this._openerService.open(link2.text, {
      allowTunneling: this._isRemote && this._configurationService.getValue("remote.forwardOnOpen"),
      allowContributedOpeners: true,
      openExternal: true
    });
  }
  async _openFileSchemeLink(link2) {
    if (!link2.uri) {
      return;
    }
    try {
      const stat = await this._fileService.stat(link2.uri);
      const isDirectory = stat.isDirectory;
      const linkType = getTerminalLinkType(
        link2.uri,
        isDirectory,
        this._uriIdentityService,
        this._workspaceContextService
      );
      switch (linkType) {
        case "LocalFile" /* LocalFile */:
          await this._localFileOpener.open(link2);
          return;
        case "LocalFolderInWorkspace" /* LocalFolderInWorkspace */:
          await this._localFolderInWorkspaceOpener.open(link2);
          return;
        case "LocalFolderOutsideWorkspace" /* LocalFolderOutsideWorkspace */:
          await this._localFolderOutsideWorkspaceOpener.open(link2);
          return;
        case "Url" /* Url */:
          await this.open(link2);
          return;
      }
    } catch (error) {
      this._logService.warn("Open file via native file explorer");
    }
    this._openerService.open(link2.text, {
      allowTunneling: this._isRemote && this._configurationService.getValue("remote.forwardOnOpen"),
      allowContributedOpeners: true,
      openExternal: true
    });
  }
};

TerminalUrlLinkOpener = __decorateClass([
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IUriIdentityService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, ITerminalLogService)
], TerminalUrlLinkOpener);
export { TerminalLocalFileLinkOpener, TerminalLocalFolderInWorkspaceLinkOpener, TerminalLocalFolderOutsideWorkspaceLinkOpener, TerminalSearchLinkOpener, TerminalUrlLinkOpener };
