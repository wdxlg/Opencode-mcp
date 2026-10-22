// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/search/common/queryBuilder.ts
import { IWorkspaceContextService, toWorkspaceFolder } from "./module-0509.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { getExcludes, pathIncludedInQuery } from "./module-1000.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename2, isAbsolutePath, isEqual2, relativePath } from "./module-0034.mjs";
import { isAbsolute, normalize, posix, relative } from "./module-0026.mjs";
import { assertReturnsDefined, isDefined } from "./module-0010.mjs";
import { containsUppercaseCharacter, escapeRegExpCharacters, rtrim } from "./module-0030.mjs";
import { isMultilineRegexSource } from "./module-0171.mjs";
import { untildify } from "./module-0711.mjs";
import { groupBy } from "./module-0003.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPathService } from "./module-0939.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { splitGlobAware } from "./module-0857.mjs";


// src/vs/workbench/services/search/common/queryBuilder.ts
function isISearchPatternBuilder(object2) {
  return typeof object2 === "object" && "uri" in object2 && "pattern" in object2;
}

var QueryBuilder = class {
  constructor(configurationService, workspaceContextService, editorGroupsService, logService, pathService, uriIdentityService) {
    this.configurationService = configurationService;
    this.workspaceContextService = workspaceContextService;
    this.editorGroupsService = editorGroupsService;
    this.logService = logService;
    this.pathService = pathService;
    this.uriIdentityService = uriIdentityService;
  }
  aiText(contentPattern, folderResources, options3 = {}) {
    const commonQuery = this.commonQuery(folderResources?.map(toWorkspaceFolder), options3);
    return {
      ...commonQuery,
      type: 3 /* aiText */,
      contentPattern
    };
  }
  text(contentPattern, folderResources, options3 = {}) {
    contentPattern = this.getContentPattern(contentPattern, options3);
    const commonQuery = this.commonQuery(folderResources?.map(toWorkspaceFolder), options3);
    return {
      ...commonQuery,
      type: 2 /* Text */,
      contentPattern,
      previewOptions: options3.previewOptions,
      maxFileSize: options3.maxFileSize,
      surroundingContext: options3.surroundingContext,
      userDisabledExcludesAndIgnoreFiles: options3.disregardExcludeSettings && options3.disregardIgnoreFiles
    };
  }
  /**
   * Adjusts input pattern for config
   */
  getContentPattern(inputPattern, options3) {
    const searchConfig = this.configurationService.getValue();
    if (inputPattern.isRegExp) {
      inputPattern.pattern = inputPattern.pattern.replace(/\r?\n/g, "\\n");
    }
    const newPattern = {
      ...inputPattern,
      wordSeparators: searchConfig.editor.wordSeparators
    };
    if (this.isCaseSensitive(inputPattern, options3)) {
      newPattern.isCaseSensitive = true;
    }
    if (this.isMultiline(inputPattern)) {
      newPattern.isMultiline = true;
    }
    if (options3.notebookSearchConfig?.includeMarkupInput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookMarkdownInput = options3.notebookSearchConfig.includeMarkupInput;
    }
    if (options3.notebookSearchConfig?.includeMarkupPreview) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookMarkdownPreview = options3.notebookSearchConfig.includeMarkupPreview;
    }
    if (options3.notebookSearchConfig?.includeCodeInput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookCellInput = options3.notebookSearchConfig.includeCodeInput;
    }
    if (options3.notebookSearchConfig?.includeOutput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookCellOutput = options3.notebookSearchConfig.includeOutput;
    }
    return newPattern;
  }
  file(folders, options3 = {}) {
    const commonQuery = this.commonQuery(folders, options3);
    return {
      ...commonQuery,
      type: 1 /* File */,
      filePattern: options3.filePattern ? options3.filePattern.trim() : options3.filePattern,
      exists: options3.exists,
      sortByScore: options3.sortByScore,
      cacheKey: options3.cacheKey,
      shouldGlobMatchFilePattern: options3.shouldGlobSearch
    };
  }
  handleIncludeExclude(pattern, expandPatterns) {
    if (!pattern) {
      return {};
    }
    if (Array.isArray(pattern)) {
      pattern = pattern.filter((p) => p.length > 0).map(normalizeSlashes2);
      if (!pattern.length) {
        return {};
      }
    } else {
      pattern = normalizeSlashes2(pattern);
    }
    return expandPatterns ? this.parseSearchPaths(pattern) : { pattern: patternListToIExpression(...Array.isArray(pattern) ? pattern : [pattern]) };
  }
  commonQuery(folderResources = [], options3 = {}) {
    let excludePatterns = Array.isArray(options3.excludePattern) ? options3.excludePattern.map((p) => p.pattern).flat() : options3.excludePattern;
    excludePatterns = excludePatterns?.length === 1 ? excludePatterns[0] : excludePatterns;
    const includeSearchPathsInfo = this.handleIncludeExclude(options3.includePattern, options3.expandPatterns);
    const excludeSearchPathsInfo = this.handleIncludeExclude(excludePatterns, options3.expandPatterns);
    const includeFolderName = folderResources.length > 1;
    const folderQueries = (includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length ? includeSearchPathsInfo.searchPaths.map((searchPath) => this.getFolderQueryForSearchPath(searchPath, options3, excludeSearchPathsInfo)) : folderResources.map((folder) => this.getFolderQueryForRoot(folder, options3, excludeSearchPathsInfo, includeFolderName))).filter((query) => !!query);
    const queryProps = {
      _reason: options3._reason,
      folderQueries,
      usingSearchPaths: !!(includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length),
      extraFileResources: options3.extraFileResources,
      excludePattern: excludeSearchPathsInfo.pattern,
      includePattern: includeSearchPathsInfo.pattern,
      ignoreGlobCase: options3.ignoreGlobCase,
      onlyOpenEditors: options3.onlyOpenEditors,
      maxResults: options3.maxResults,
      onlyFileScheme: options3.onlyFileScheme
    };
    if (options3.onlyOpenEditors) {
      const openEditors = coalesce(this.editorGroupsService.groups.flatMap((group2) => group2.editors.map((editor) => editor.resource)));
      this.logService.trace("QueryBuilder#commonQuery - openEditor URIs", JSON.stringify(openEditors));
      const openEditorsInQuery = openEditors.filter((editor) => pathIncludedInQuery(queryProps, editor.fsPath));
      const openEditorsQueryProps = this.commonQueryFromFileList(openEditorsInQuery);
      this.logService.trace("QueryBuilder#commonQuery - openEditor Query", JSON.stringify(openEditorsQueryProps));
      return { ...queryProps, ...openEditorsQueryProps };
    }
    if (options3.changedFileUris !== void 0) {
      const changedFilesInQuery = options3.changedFileUris.filter((uri4) => pathIncludedInQuery(queryProps, uri4.fsPath));
      const changedFilesQueryProps = this.commonQueryFromFileList(changedFilesInQuery);
      this.logService.trace("QueryBuilder#commonQuery - changedFile Query", JSON.stringify(changedFilesQueryProps));
      return { ...queryProps, ...changedFilesQueryProps };
    }
    const extraFileResources = options3.extraFileResources && options3.extraFileResources.filter((extraFile) => pathIncludedInQuery(queryProps, extraFile.fsPath));
    queryProps.extraFileResources = extraFileResources && extraFileResources.length ? extraFileResources : void 0;
    return queryProps;
  }
  commonQueryFromFileList(files) {
    const folderQueries = [];
    const foldersToSearch = new ResourceMap();
    const includePattern = {};
    let hasIncludedFile = false;
    files.forEach((file) => {
      if (file.scheme === Schemas.walkThrough) {
        return;
      }
      const providerExists = isAbsolutePath(file);
      if (providerExists) {
        const searchRoot = this.workspaceContextService.getWorkspaceFolder(file)?.uri ?? this.uriIdentityService.extUri.dirname(file);
        let folderQuery = foldersToSearch.get(searchRoot);
        if (!folderQuery) {
          hasIncludedFile = true;
          folderQuery = { folder: searchRoot, includePattern: {} };
          folderQueries.push(folderQuery);
          foldersToSearch.set(searchRoot, folderQuery);
        }
        const relPath = relative(searchRoot.fsPath, file.fsPath);
        assertReturnsDefined(folderQuery.includePattern)[escapeGlobPattern(relPath.replace(/\\/g, "/"))] = true;
      } else {
        if (file.fsPath) {
          hasIncludedFile = true;
          includePattern[escapeGlobPattern(file.fsPath)] = true;
        }
      }
    });
    return {
      folderQueries,
      includePattern,
      usingSearchPaths: true,
      excludePattern: hasIncludedFile ? void 0 : { "**/*": true }
    };
  }
  /**
   * Resolve isCaseSensitive flag based on the query and the isSmartCase flag, for search providers that don't support smart case natively.
   */
  isCaseSensitive(contentPattern, options3) {
    if (options3.isSmartCase) {
      if (contentPattern.isRegExp) {
        if (containsUppercaseCharacter(contentPattern.pattern, true)) {
          return true;
        }
      } else if (containsUppercaseCharacter(contentPattern.pattern)) {
        return true;
      }
    }
    return !!contentPattern.isCaseSensitive;
  }
  isMultiline(contentPattern) {
    if (contentPattern.isMultiline) {
      return true;
    }
    if (contentPattern.isRegExp && isMultilineRegexSource(contentPattern.pattern)) {
      return true;
    }
    if (contentPattern.pattern.indexOf("\n") >= 0) {
      return true;
    }
    return !!contentPattern.isMultiline;
  }
  /**
   * Take the includePattern as seen in the search viewlet, and split into components that look like searchPaths, and
   * glob patterns. Glob patterns are expanded from 'foo/bar' to '{foo/bar/**, **\/foo/bar}.
   *
   * Public for test.
   */
  parseSearchPaths(pattern) {
    const isSearchPath = (segment) => {
      return isAbsolute(segment) || /^\.\.?([\/\\]|$)/.test(segment);
    };
    const patterns = Array.isArray(pattern) ? pattern : splitGlobPattern(pattern);
    const segments = patterns.map((segment) => {
      const userHome = this.pathService.resolvedUserHome;
      if (userHome) {
        return untildify(segment, userHome.scheme === Schemas.file ? userHome.fsPath : userHome.path);
      }
      return segment;
    });
    const groups = groupBy(
      segments,
      (segment) => isSearchPath(segment) ? "searchPaths" : "exprSegments"
    );
    const expandedExprSegments = (groups.exprSegments || []).map((s) => rtrim(s, "/")).map((s) => rtrim(s, "\\")).map((p) => {
      if (p[0] === ".") {
        p = "*" + p;
      }
      return expandGlobalGlob(p);
    });
    const result = {};
    const searchPaths = this.expandSearchPathPatterns(groups.searchPaths || []);
    if (searchPaths && searchPaths.length) {
      result.searchPaths = searchPaths;
    }
    const exprSegments = expandedExprSegments.flat();
    const includePattern = patternListToIExpression(...exprSegments);
    if (includePattern) {
      result.pattern = includePattern;
    }
    return result;
  }
  getExcludesForFolder(folderConfig, options3) {
    return options3.disregardExcludeSettings ? void 0 : getExcludes(folderConfig, !options3.disregardSearchExcludeSettings);
  }
  /**
   * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
   */
  expandSearchPathPatterns(searchPaths) {
    if (!searchPaths || !searchPaths.length) {
      return [];
    }
    const expandedSearchPaths = searchPaths.flatMap((searchPath) => {
      let { pathPortion, globPortion } = splitGlobFromPath(searchPath);
      if (globPortion) {
        globPortion = normalizeGlobPattern(globPortion);
      }
      const oneExpanded = this.expandOneSearchPath(pathPortion);
      return oneExpanded.flatMap((oneExpandedResult) => this.resolveOneSearchPathPattern(oneExpandedResult, globPortion));
    });
    const searchPathPatternMap = /* @__PURE__ */ new Map();
    expandedSearchPaths.forEach((oneSearchPathPattern) => {
      const key3 = oneSearchPathPattern.searchPath.toString();
      const existing = searchPathPatternMap.get(key3);
      if (existing) {
        if (oneSearchPathPattern.pattern) {
          existing.pattern = existing.pattern || {};
          existing.pattern[oneSearchPathPattern.pattern] = true;
        }
      } else {
        searchPathPatternMap.set(key3, {
          searchPath: oneSearchPathPattern.searchPath,
          pattern: oneSearchPathPattern.pattern ? patternListToIExpression(oneSearchPathPattern.pattern) : void 0
        });
      }
    });
    return Array.from(searchPathPatternMap.values());
  }
  /**
   * Takes a searchPath like `./a/foo` or `../a/foo` and expands it to absolute paths for all the workspaces it matches.
   */
  expandOneSearchPath(searchPath) {
    if (isAbsolute(searchPath)) {
      const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
      if (workspaceFolders[0] && workspaceFolders[0].uri.scheme !== Schemas.file) {
        return [{
          searchPath: workspaceFolders[0].uri.with({ path: searchPath })
        }];
      }
      return [{
        searchPath: URI.file(normalize(searchPath))
      }];
    }
    if (this.workspaceContextService.getWorkbenchState() === 2 /* FOLDER */) {
      const workspaceUri = this.workspaceContextService.getWorkspace().folders[0].uri;
      searchPath = normalizeSlashes2(searchPath);
      if (searchPath.startsWith("../") || searchPath === "..") {
        const resolvedPath = posix.resolve(workspaceUri.path, searchPath);
        return [{
          searchPath: workspaceUri.with({ path: resolvedPath })
        }];
      }
      const cleanedPattern = normalizeGlobPattern(searchPath);
      return [{
        searchPath: workspaceUri,
        pattern: cleanedPattern
      }];
    } else if (searchPath === "./" || searchPath === ".\\") {
      return [];
    } else {
      const searchPathWithoutDotSlash = searchPath.replace(/^\.[\/\\]/, "");
      const folders = this.workspaceContextService.getWorkspace().folders;
      const folderMatches = folders.map((folder) => {
        const match2 = searchPathWithoutDotSlash.match(new RegExp(`^${escapeRegExpCharacters(folder.name)}(?:/(.*)|$)`));
        return match2 ? {
          match: match2,
          folder
        } : null;
      }).filter(isDefined);
      if (folderMatches.length) {
        return folderMatches.map((match2) => {
          const patternMatch = match2.match[1];
          return {
            searchPath: match2.folder.uri,
            pattern: patternMatch && normalizeGlobPattern(patternMatch)
          };
        });
      } else {
        const probableWorkspaceFolderNameMatch = searchPath.match(/\.[\/\\](.+)[\/\\]?/);
        const probableWorkspaceFolderName = probableWorkspaceFolderNameMatch ? probableWorkspaceFolderNameMatch[1] : searchPath;
        const searchPathNotFoundError = localize(23346, null, probableWorkspaceFolderName);
        throw new Error(searchPathNotFoundError);
      }
    }
  }
  resolveOneSearchPathPattern(oneExpandedResult, globPortion) {
    const pattern = oneExpandedResult.pattern && globPortion ? `${oneExpandedResult.pattern}/${globPortion}` : oneExpandedResult.pattern || globPortion;
    const results = [
      {
        searchPath: oneExpandedResult.searchPath,
        pattern
      }
    ];
    if (pattern && !pattern.endsWith("**")) {
      results.push({
        searchPath: oneExpandedResult.searchPath,
        pattern: pattern + "/**"
      });
    }
    return results;
  }
  getFolderQueryForSearchPath(searchPath, options3, searchPathExcludes) {
    const rootConfig = this.getFolderQueryForRoot(toWorkspaceFolder(searchPath.searchPath), options3, searchPathExcludes, false);
    if (!rootConfig) {
      return null;
    }
    return {
      ...rootConfig,
      ...{
        includePattern: searchPath.pattern
      }
    };
  }
  getFolderQueryForRoot(folder, options3, searchPathExcludes, includeFolderName) {
    let thisFolderExcludeSearchPathPattern;
    const folderUri = URI.isUri(folder) ? folder : folder.uri;
    let excludeFolderRoots = options3.excludePattern?.map((excludePattern2) => {
      const excludeRoot = options3.excludePattern && isISearchPatternBuilder(excludePattern2) ? excludePattern2.uri : void 0;
      const shouldUseExcludeRoot = !excludeRoot || !(URI.isUri(folder) && this.uriIdentityService.extUri.isEqual(folder, excludeRoot));
      return shouldUseExcludeRoot ? excludeRoot : void 0;
    });
    if (!excludeFolderRoots?.length) {
      excludeFolderRoots = [void 0];
    }
    if (searchPathExcludes.searchPaths) {
      const thisFolderExcludeSearchPath = searchPathExcludes.searchPaths.filter((sp) => isEqual2(sp.searchPath, folderUri))[0];
      if (thisFolderExcludeSearchPath && !thisFolderExcludeSearchPath.pattern) {
        return null;
      } else if (thisFolderExcludeSearchPath) {
        thisFolderExcludeSearchPathPattern = thisFolderExcludeSearchPath.pattern;
      }
    }
    const folderConfig = this.configurationService.getValue({ resource: folderUri });
    const settingExcludes = this.getExcludesForFolder(folderConfig, options3);
    const excludePattern = {
      ...settingExcludes || {},
      ...thisFolderExcludeSearchPathPattern || {}
    };
    const folderName = URI.isUri(folder) ? basename2(folder) : folder.name;
    const excludePatternRet = excludeFolderRoots.map((excludeFolderRoot) => {
      return Object.keys(excludePattern).length > 0 ? {
        folder: excludeFolderRoot,
        pattern: excludePattern
      } : void 0;
    }).filter((e4) => e4);
    return {
      folder: folderUri,
      folderName: includeFolderName ? folderName : void 0,
      excludePattern: excludePatternRet,
      fileEncoding: folderConfig.files && folderConfig.files.encoding,
      disregardIgnoreFiles: typeof options3.disregardIgnoreFiles === "boolean" ? options3.disregardIgnoreFiles : !folderConfig.search?.useIgnoreFiles,
      disregardGlobalIgnoreFiles: typeof options3.disregardGlobalIgnoreFiles === "boolean" ? options3.disregardGlobalIgnoreFiles : !folderConfig.search?.useGlobalIgnoreFiles,
      disregardParentIgnoreFiles: typeof options3.disregardParentIgnoreFiles === "boolean" ? options3.disregardParentIgnoreFiles : !folderConfig.search?.useParentIgnoreFiles,
      ignoreSymlinks: typeof options3.ignoreSymlinks === "boolean" ? options3.ignoreSymlinks : !folderConfig.search?.followSymlinks,
      ignoreGlobCase: options3.ignoreGlobCase
    };
  }
};

QueryBuilder = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IEditorGroupsService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IPathService),
  __decorateParam(5, IUriIdentityService)
], QueryBuilder);

function splitGlobFromPath(searchPath) {
  const globCharMatch = searchPath.match(/[\*\{\}\(\)\[\]\?]/);
  if (globCharMatch) {
    const globCharIdx = globCharMatch.index;
    const lastSlashMatch = searchPath.substr(0, globCharIdx).match(/[/|\\][^/\\]*$/);
    if (lastSlashMatch) {
      let pathPortion = searchPath.substr(0, lastSlashMatch.index);
      if (!pathPortion.match(/[/\\]/)) {
        pathPortion += "/";
      }
      return {
        pathPortion,
        globPortion: searchPath.substr((lastSlashMatch.index || 0) + 1)
      };
    }
  }
  return {
    pathPortion: searchPath
  };
}

function patternListToIExpression(...patterns) {
  return patterns.length ? patterns.reduce((glob, cur) => {
    glob[cur] = true;
    return glob;
  }, /* @__PURE__ */ Object.create(null)) : void 0;
}

function splitGlobPattern(pattern) {
  return splitGlobAware(pattern, ",").map((s) => s.trim()).filter((s) => !!s.length);
}

function expandGlobalGlob(pattern) {
  const patterns = [
    `**/${pattern}/**`,
    `**/${pattern}`
  ];
  return patterns.map((p) => p.replace(/\*\*\/\*\*/g, "**"));
}

function normalizeSlashes2(pattern) {
  return pattern.replace(/\\/g, "/");
}

function normalizeGlobPattern(pattern) {
  return normalizeSlashes2(pattern).replace(/^\.\//, "").replace(/\/+$/g, "");
}

function escapeGlobPattern(path) {
  return path.replace(/([?*[\]])/g, "[$1]");
}

function resolveResourcesForSearchIncludes(resources, contextService) {
  resources = distinct(resources, (resource) => resource.toString());
  const folderPaths = [];
  const workspace = contextService.getWorkspace();
  if (resources) {
    resources.forEach((resource) => {
      let folderPath;
      if (contextService.getWorkbenchState() === 2 /* FOLDER */) {
        folderPath = relativePath(workspace.folders[0].uri, resource);
        if (folderPath && folderPath !== ".") {
          folderPath = "./" + folderPath;
        }
      } else {
        const owningFolder = contextService.getWorkspaceFolder(resource);
        if (owningFolder) {
          const owningRootName = owningFolder.name;
          const isUniqueFolder = workspace.folders.filter((folder) => folder.name === owningRootName).length === 1;
          if (isUniqueFolder) {
            const relPath = relativePath(owningFolder.uri, resource);
            if (relPath === "") {
              folderPath = `./${owningFolder.name}`;
            } else {
              folderPath = `./${owningFolder.name}/${relPath}`;
            }
          } else {
            folderPath = resource.fsPath;
          }
        }
      }
      if (folderPath) {
        folderPaths.push(escapeGlobPattern(folderPath));
      }
    });
  }
  return folderPaths;
}
export { isISearchPatternBuilder, splitGlobFromPath, patternListToIExpression, splitGlobPattern, expandGlobalGlob, normalizeSlashes2, normalizeGlobPattern, escapeGlobPattern, resolveResourcesForSearchIncludes, QueryBuilder };
