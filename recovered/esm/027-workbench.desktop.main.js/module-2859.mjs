// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchChatContext.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CHAT_CONTEXT_FILES_AND_FOLDERS_ID, IChatContextPickService, picksWithPromiseFn } from "./module-1453.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SearchContext } from "./module-1262.mjs";
import { ISearchService, VIEW_ID, getExcludes } from "./module-0999.mjs";
import { SearchView } from "./module-2858.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILabelService } from "./module-0641.mjs";
import { SymbolsQuickAccessProvider } from "./module-2541.mjs";
import { SymbolKinds } from "./module-0164.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isSupportedChatFileScheme } from "./module-0964.mjs";
import { compare } from "./module-0030.mjs";
import { basename2, dirname2, joinPath, relativePath } from "./module-0034.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { match } from "./module-0857.mjs";


// src/vs/workbench/contrib/search/browser/searchChatContext.ts
var SearchChatContextContribution = class extends Disposable {
  static {
    this.ID = "workbench.contributions.searchChatContextContribution";
  }
  constructor(instantiationService, chatContextPickService) {
    super();
    this._store.add(chatContextPickService.registerChatContextItem(instantiationService.createInstance(SearchViewResultChatContextPick)));
    this._store.add(chatContextPickService.registerChatContextItem(instantiationService.createInstance(FilesAndFoldersPickerPick)));
    this._store.add(chatContextPickService.registerChatContextItem(this._store.add(instantiationService.createInstance(SymbolsContextPickerPick))));
  }
};

SearchChatContextContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IChatContextPickService)
], SearchChatContextContribution);

var SearchViewResultChatContextPick = class {
  constructor(_contextKeyService, _viewsService, _labelService) {
    this._contextKeyService = _contextKeyService;
    this._viewsService = _viewsService;
    this._labelService = _labelService;
    this.type = "valuePick";
    this.label = localize(19145, null);
    this.icon = Codicon.search;
    this.ordinal = 500;
  }
  isEnabled(widget) {
    return !!SearchContext.HasSearchResults.getValue(this._contextKeyService) && !!widget.attachmentCapabilities.supportsSearchResultAttachments;
  }
  async asAttachment() {
    const searchView = this._viewsService.getViewWithId(VIEW_ID);
    if (!(searchView instanceof SearchView)) {
      return [];
    }
    return searchView.model.searchResult.matches().map((result) => ({
      kind: "file",
      id: result.resource.toString(),
      value: result.resource,
      name: this._labelService.getUriBasenameLabel(result.resource)
    }));
  }
};

SearchViewResultChatContextPick = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, ILabelService)
], SearchViewResultChatContextPick);

var SymbolsContextPickerPick = class {
  constructor(_instantiationService) {
    this._instantiationService = _instantiationService;
    this.type = "pickerPick";
    this.label = localize(19147, null);
    this.icon = Codicon.symbolField;
    this.ordinal = -200;
  }
  dispose() {
    this._provider?.dispose();
  }
  isEnabled(widget) {
    return !!widget.attachmentCapabilities.supportsSymbolAttachments;
  }
  asPicker() {
    return {
      placeholder: localize(19146, null),
      picks: picksWithPromiseFn((query, token) => {
        this._provider ??= this._instantiationService.createInstance(SymbolsQuickAccessProvider);
        return this._provider.getSymbolPicks(query, void 0, token).then((symbolItems) => {
          const result = [];
          for (const item of symbolItems) {
            if (!item.symbol) {
              continue;
            }
            const attachment = {
              kind: "symbol",
              id: JSON.stringify(item.symbol.location),
              value: item.symbol.location,
              symbolKind: item.symbol.kind,
              icon: SymbolKinds.toIcon(item.symbol.kind),
              fullName: item.label,
              name: item.symbol.name
            };
            result.push({
              label: item.symbol.name,
              iconClass: ThemeIcon.asClassName(SymbolKinds.toIcon(item.symbol.kind)),
              asAttachment() {
                return attachment;
              }
            });
          }
          return result;
        });
      })
    };
  }
};

SymbolsContextPickerPick = __decorateClass([
  __decorateParam(0, IInstantiationService)
], SymbolsContextPickerPick);

var FilesAndFoldersPickerPick = class {
  constructor(_searchService, _labelService, _modelService, _languageService, _configurationService, _workspaceService, _fileService, _historyService, _instantiationService) {
    this._searchService = _searchService;
    this._labelService = _labelService;
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._configurationService = _configurationService;
    this._workspaceService = _workspaceService;
    this._fileService = _fileService;
    this._historyService = _historyService;
    this._instantiationService = _instantiationService;
    this.id = CHAT_CONTEXT_FILES_AND_FOLDERS_ID;
    this.type = "pickerPick";
    this.label = localize(19144, null);
    this.icon = Codicon.folder;
    this.ordinal = 600;
  }
  asPicker() {
    return {
      placeholder: localize(19143, null),
      picks: picksWithPromiseFn(async (value2, token) => {
        const workspaces = this._workspaceService.getWorkspace().folders.map((folder) => folder.uri);
        const defaultItems = [];
        (await getTopLevelFolders(workspaces, this._fileService)).forEach((uri5) => defaultItems.push(this._createPickItem(uri5, 1 /* FOLDER */)));
        this._historyService.getHistory().filter((a) => a.resource && this._instantiationService.invokeFunction((accessor) => isSupportedChatFileScheme(accessor, a.resource.scheme))).slice(0, 30).forEach((uri5) => defaultItems.push(this._createPickItem(uri5.resource, 0 /* FILE */)));
        if (value2 === "") {
          return defaultItems;
        }
        const result = [];
        await Promise.all(workspaces.map(async (workspace) => {
          const { folders, files } = await searchFilesAndFolders(
            workspace,
            value2,
            true,
            token,
            void 0,
            this._configurationService,
            this._searchService
          );
          for (const folder of folders) {
            result.push(this._createPickItem(folder, 1 /* FOLDER */));
          }
          for (const file of files) {
            result.push(this._createPickItem(file, 0 /* FILE */));
          }
        }));
        result.sort((a, b) => compare(a.label, b.label));
        return result;
      })
    };
  }
  _createPickItem(resource, kind) {
    return {
      label: basename2(resource),
      description: this._labelService.getUriLabel(dirname2(resource), { relative: true }),
      iconClasses: getIconClasses(this._modelService, this._languageService, resource, kind),
      asAttachment: () => {
        return {
          kind: kind === 0 /* FILE */ ? "file" : "directory",
          id: resource.toString(),
          value: resource,
          name: basename2(resource)
        };
      }
    };
  }
};

FilesAndFoldersPickerPick = __decorateClass([
  __decorateParam(0, ISearchService),
  __decorateParam(1, ILabelService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IHistoryService),
  __decorateParam(8, IInstantiationService)
], FilesAndFoldersPickerPick);

async function searchFilesAndFolders(workspace, pattern, fuzzyMatch, token, cacheKey2, configurationService, searchService) {
  const segmentMatchPattern = fuzzyMatch ? fuzzyMatchingGlobPattern2(pattern) : continousMatchingGlobPattern2(pattern);
  const searchExcludePattern = getExcludes(configurationService.getValue({ resource: workspace })) || {};
  const searchOptions = {
    folderQueries: [{
      folder: workspace,
      disregardIgnoreFiles: configurationService.getValue("explorer.excludeGitIgnore")
    }],
    type: 1 /* File */,
    shouldGlobMatchFilePattern: true,
    cacheKey: cacheKey2,
    excludePattern: searchExcludePattern,
    sortByScore: true,
    ignoreGlobCase: true
  };
  let searchResult;
  try {
    searchResult = await searchService.fileSearch({ ...searchOptions, filePattern: `{**/${segmentMatchPattern}/**,**/${segmentMatchPattern}}` }, token);
  } catch (e) {
    if (!isCancellationError(e)) {
      throw e;
    }
  }
  if (!searchResult || token?.isCancellationRequested) {
    return { files: [], folders: [] };
  }
  const fileResources = searchResult.results.map((result) => result.resource);
  const folderResources = getMatchingFoldersFromFiles(fileResources, workspace, segmentMatchPattern);
  return { folders: folderResources, files: fileResources };
}

function fuzzyMatchingGlobPattern2(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern.split("").join("*") + "*";
}

function continousMatchingGlobPattern2(pattern) {
  if (!pattern) {
    return "*";
  }
  return "*" + pattern + "*";
}

function getMatchingFoldersFromFiles(resources, workspace, segmentMatchPattern) {
  const uniqueFolders = new ResourceSet();
  for (const resource of resources) {
    const relativePathToRoot = relativePath(workspace, resource);
    if (!relativePathToRoot) {
      throw new Error("Resource is not a child of the workspace");
    }
    let dirResource = workspace;
    const stats = relativePathToRoot.split("/").slice(0, -1);
    for (const stat of stats) {
      dirResource = dirResource.with({ path: `${dirResource.path}/${stat}` });
      uniqueFolders.add(dirResource);
    }
  }
  const matchingFolders = [];
  for (const folderResource of uniqueFolders) {
    const stats = folderResource.path.split("/");
    const dirStat = stats[stats.length - 1];
    if (!dirStat || !match(segmentMatchPattern, dirStat, { ignoreCase: true })) {
      continue;
    }
    matchingFolders.push(folderResource);
  }
  return matchingFolders;
}

async function getTopLevelFolders(workspaces, fileService) {
  const folders = [];
  for (const workspace of workspaces) {
    const fileSystemProvider = fileService.getProvider(workspace.scheme);
    if (!fileSystemProvider) {
      continue;
    }
    const entries2 = await fileSystemProvider.readdir(workspace);
    for (const [name, type] of entries2) {
      const entryResource = joinPath(workspace, name);
      if (type === 2 /* Directory */) {
        folders.push(entryResource);
      }
    }
  }
  return folders;
}
export { searchFilesAndFolders, fuzzyMatchingGlobPattern2, continousMatchingGlobPattern2, getMatchingFoldersFromFiles, getTopLevelFolders, SearchChatContextContribution, SearchViewResultChatContextPick, SymbolsContextPickerPick, FilesAndFoldersPickerPick };
