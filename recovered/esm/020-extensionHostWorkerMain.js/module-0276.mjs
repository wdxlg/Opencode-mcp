// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/search/common/queryBuilder.ts
import { IWorkspaceContextService, toWorkspaceFolder } from "./module-0060.mjs";
import { coalesce } from "./module-0004.mjs";
import { getExcludes, pathIncludedInQuery } from "./module-0241.mjs";
import { ResourceMap } from "./module-0006.mjs";
import { Schemas } from "./module-0031.mjs";
import { basename2, isAbsolutePath, isEqual } from "./module-0032.mjs";
import { isAbsolute, normalize, posix, relative } from "./module-0022.mjs";
import { assertReturnsDefined, isDefined } from "./module-0009.mjs";
import { containsUppercaseCharacter, escapeRegExpCharacters, rtrim } from "./module-0029.mjs";
import { isMultilineRegexSource } from "./module-0274.mjs";
import { untildify } from "./module-0192.mjs";
import { groupBy2 } from "./module-0005.mjs";
import { URI } from "./module-0023.mjs";
import { localize } from "./module-0015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0124.mjs";
import { IEditorGroupsService } from "./module-0219.mjs";
import { ILogService } from "./module-0045.mjs";
import { IPathService } from "./module-0275.mjs";
import { IUriIdentityService } from "./module-0139.mjs";
import { splitGlobAware } from "./module-0179.mjs";


// src/vs/workbench/services/search/common/queryBuilder.ts
function isISearchPatternBuilder(object) {
  return typeof object === "object" && "uri" in object && "pattern" in object;
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
  aiText(contentPattern, folderResources, options2 = {}) {
    const commonQuery = this.commonQuery(folderResources?.map(toWorkspaceFolder), options2);
    return {
      ...commonQuery,
      type: 3 /* aiText */,
      contentPattern
    };
  }
  text(contentPattern, folderResources, options2 = {}) {
    contentPattern = this.getContentPattern(contentPattern, options2);
    const commonQuery = this.commonQuery(folderResources?.map(toWorkspaceFolder), options2);
    return {
      ...commonQuery,
      type: 2 /* Text */,
      contentPattern,
      previewOptions: options2.previewOptions,
      maxFileSize: options2.maxFileSize,
      surroundingContext: options2.surroundingContext,
      userDisabledExcludesAndIgnoreFiles: options2.disregardExcludeSettings && options2.disregardIgnoreFiles
    };
  }
  /**
   * Adjusts input pattern for config
   */
  getContentPattern(inputPattern, options2) {
    const searchConfig = this.configurationService.getValue();
    if (inputPattern.isRegExp) {
      inputPattern.pattern = inputPattern.pattern.replace(/\r?\n/g, "\\n");
    }
    const newPattern = {
      ...inputPattern,
      wordSeparators: searchConfig.editor.wordSeparators
    };
    if (this.isCaseSensitive(inputPattern, options2)) {
      newPattern.isCaseSensitive = true;
    }
    if (this.isMultiline(inputPattern)) {
      newPattern.isMultiline = true;
    }
    if (options2.notebookSearchConfig?.includeMarkupInput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookMarkdownInput = options2.notebookSearchConfig.includeMarkupInput;
    }
    if (options2.notebookSearchConfig?.includeMarkupPreview) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookMarkdownPreview = options2.notebookSearchConfig.includeMarkupPreview;
    }
    if (options2.notebookSearchConfig?.includeCodeInput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookCellInput = options2.notebookSearchConfig.includeCodeInput;
    }
    if (options2.notebookSearchConfig?.includeOutput) {
      if (!newPattern.notebookInfo) {
        newPattern.notebookInfo = {};
      }
      newPattern.notebookInfo.isInNotebookCellOutput = options2.notebookSearchConfig.includeOutput;
    }
    return newPattern;
  }
  file(folders, options2 = {}) {
    const commonQuery = this.commonQuery(folders, options2);
    return {
      ...commonQuery,
      type: 1 /* File */,
      filePattern: options2.filePattern ? options2.filePattern.trim() : options2.filePattern,
      exists: options2.exists,
      sortByScore: options2.sortByScore,
      cacheKey: options2.cacheKey,
      shouldGlobMatchFilePattern: options2.shouldGlobSearch
    };
  }
  handleIncludeExclude(pattern, expandPatterns) {
    if (!pattern) {
      return {};
    }
    if (Array.isArray(pattern)) {
      pattern = pattern.filter((p) => p.length > 0).map(normalizeSlashes);
      if (!pattern.length) {
        return {};
      }
    } else {
      pattern = normalizeSlashes(pattern);
    }
    return expandPatterns ? this.parseSearchPaths(pattern) : { pattern: patternListToIExpression(...Array.isArray(pattern) ? pattern : [pattern]) };
  }
  commonQuery(folderResources = [], options2 = {}) {
    let excludePatterns = Array.isArray(options2.excludePattern) ? options2.excludePattern.map((p) => p.pattern).flat() : options2.excludePattern;
    excludePatterns = excludePatterns?.length === 1 ? excludePatterns[0] : excludePatterns;
    const includeSearchPathsInfo = this.handleIncludeExclude(options2.includePattern, options2.expandPatterns);
    const excludeSearchPathsInfo = this.handleIncludeExclude(excludePatterns, options2.expandPatterns);
    const includeFolderName = folderResources.length > 1;
    const folderQueries = (includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length ? includeSearchPathsInfo.searchPaths.map((searchPath) => this.getFolderQueryForSearchPath(searchPath, options2, excludeSearchPathsInfo)) : folderResources.map((folder) => this.getFolderQueryForRoot(folder, options2, excludeSearchPathsInfo, includeFolderName))).filter((query) => !!query);
    const queryProps = {
      _reason: options2._reason,
      folderQueries,
      usingSearchPaths: !!(includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length),
      extraFileResources: options2.extraFileResources,
      excludePattern: excludeSearchPathsInfo.pattern,
      includePattern: includeSearchPathsInfo.pattern,
      ignoreGlobCase: options2.ignoreGlobCase,
      onlyOpenEditors: options2.onlyOpenEditors,
      maxResults: options2.maxResults,
      onlyFileScheme: options2.onlyFileScheme
    };
    if (options2.onlyOpenEditors) {
      const openEditors = coalesce(this.editorGroupsService.groups.flatMap((group) => group.editors.map((editor) => editor.resource)));
      this.logService.trace("QueryBuilder#commonQuery - openEditor URIs", JSON.stringify(openEditors));
      const openEditorsInQuery = openEditors.filter((editor) => pathIncludedInQuery(queryProps, editor.fsPath));
      const openEditorsQueryProps = this.commonQueryFromFileList(openEditorsInQuery);
      this.logService.trace("QueryBuilder#commonQuery - openEditor Query", JSON.stringify(openEditorsQueryProps));
      return { ...queryProps, ...openEditorsQueryProps };
    }
    if (options2.changedFileUris !== void 0) {
      const changedFilesInQuery = options2.changedFileUris.filter((uri2) => pathIncludedInQuery(queryProps, uri2.fsPath));
      const changedFilesQueryProps = this.commonQueryFromFileList(changedFilesInQuery);
      this.logService.trace("QueryBuilder#commonQuery - changedFile Query", JSON.stringify(changedFilesQueryProps));
      return { ...queryProps, ...changedFilesQueryProps };
    }
    const extraFileResources = options2.extraFileResources && options2.extraFileResources.filter((extraFile) => pathIncludedInQuery(queryProps, extraFile.fsPath));
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
  isCaseSensitive(contentPattern, options2) {
    if (options2.isSmartCase) {
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
    const groups = groupBy2(
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
  getExcludesForFolder(folderConfig, options2) {
    return options2.disregardExcludeSettings ? void 0 : getExcludes(folderConfig, !options2.disregardSearchExcludeSettings);
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
      const key = oneSearchPathPattern.searchPath.toString();
      const existing = searchPathPatternMap.get(key);
      if (existing) {
        if (oneSearchPathPattern.pattern) {
          existing.pattern = existing.pattern || {};
          existing.pattern[oneSearchPathPattern.pattern] = true;
        }
      } else {
        searchPathPatternMap.set(key, {
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
      searchPath = normalizeSlashes(searchPath);
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
  getFolderQueryForSearchPath(searchPath, options2, searchPathExcludes) {
    const rootConfig = this.getFolderQueryForRoot(toWorkspaceFolder(searchPath.searchPath), options2, searchPathExcludes, false);
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
  getFolderQueryForRoot(folder, options2, searchPathExcludes, includeFolderName) {
    let thisFolderExcludeSearchPathPattern;
    const folderUri = URI.isUri(folder) ? folder : folder.uri;
    let excludeFolderRoots = options2.excludePattern?.map((excludePattern2) => {
      const excludeRoot = options2.excludePattern && isISearchPatternBuilder(excludePattern2) ? excludePattern2.uri : void 0;
      const shouldUseExcludeRoot = !excludeRoot || !(URI.isUri(folder) && this.uriIdentityService.extUri.isEqual(folder, excludeRoot));
      return shouldUseExcludeRoot ? excludeRoot : void 0;
    });
    if (!excludeFolderRoots?.length) {
      excludeFolderRoots = [void 0];
    }
    if (searchPathExcludes.searchPaths) {
      const thisFolderExcludeSearchPath = searchPathExcludes.searchPaths.filter((sp) => isEqual(sp.searchPath, folderUri))[0];
      if (thisFolderExcludeSearchPath && !thisFolderExcludeSearchPath.pattern) {
        return null;
      } else if (thisFolderExcludeSearchPath) {
        thisFolderExcludeSearchPathPattern = thisFolderExcludeSearchPath.pattern;
      }
    }
    const folderConfig = this.configurationService.getValue({ resource: folderUri });
    const settingExcludes = this.getExcludesForFolder(folderConfig, options2);
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
    }).filter((e) => e);
    return {
      folder: folderUri,
      folderName: includeFolderName ? folderName : void 0,
      excludePattern: excludePatternRet,
      fileEncoding: folderConfig.files && folderConfig.files.encoding,
      disregardIgnoreFiles: typeof options2.disregardIgnoreFiles === "boolean" ? options2.disregardIgnoreFiles : !folderConfig.search?.useIgnoreFiles,
      disregardGlobalIgnoreFiles: typeof options2.disregardGlobalIgnoreFiles === "boolean" ? options2.disregardGlobalIgnoreFiles : !folderConfig.search?.useGlobalIgnoreFiles,
      disregardParentIgnoreFiles: typeof options2.disregardParentIgnoreFiles === "boolean" ? options2.disregardParentIgnoreFiles : !folderConfig.search?.useParentIgnoreFiles,
      ignoreSymlinks: typeof options2.ignoreSymlinks === "boolean" ? options2.ignoreSymlinks : !folderConfig.search?.followSymlinks,
      ignoreGlobCase: options2.ignoreGlobCase
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

function normalizeSlashes(pattern) {
  return pattern.replace(/\\/g, "/");
}

function normalizeGlobPattern(pattern) {
  return normalizeSlashes(pattern).replace(/^\.\//, "").replace(/\/+$/g, "");
}

function escapeGlobPattern(path) {
  return path.replace(/([?*[\]])/g, "[$1]");
}
export { isISearchPatternBuilder, splitGlobFromPath, patternListToIExpression, splitGlobPattern, expandGlobalGlob, normalizeSlashes, normalizeGlobPattern, escapeGlobPattern, QueryBuilder };
