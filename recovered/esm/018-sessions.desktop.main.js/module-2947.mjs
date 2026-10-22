// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchService.ts
import { QueryBuilder } from "./module-1311.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { coalesce } from "./module-0007.mjs";
import { isNumber } from "./module-0010.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, ISearchService, pathIncludedInQuery } from "./module-1000.mjs";
import { contentMatchesToTextSearchMatches, webviewMatchesToTextSearchMatches } from "./module-2827.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/search/browser/notebookSearch/notebookSearchService.ts
var NotebookSearchService = class {
  constructor(uriIdentityService, notebookEditorService, logService, notebookService, configurationService, editorResolverService, searchService, instantiationService) {
    this.uriIdentityService = uriIdentityService;
    this.notebookEditorService = notebookEditorService;
    this.logService = logService;
    this.notebookService = notebookService;
    this.configurationService = configurationService;
    this.editorResolverService = editorResolverService;
    this.searchService = searchService;
    this.queryBuilder = instantiationService.createInstance(QueryBuilder);
  }
  notebookSearch(query, token, searchInstanceID, onProgress) {
    if (query.type !== 2 /* Text */) {
      return {
        openFilesToScan: new ResourceSet(),
        completeData: Promise.resolve({
          messages: [],
          limitHit: false,
          results: []
        }),
        allScannedFiles: Promise.resolve(new ResourceSet())
      };
    }
    const localNotebookWidgets = this.getLocalNotebookWidgets();
    const localNotebookFiles = localNotebookWidgets.map((widget) => widget.viewModel.uri);
    const getAllResults = () => {
      const searchStart = Date.now();
      const localResultPromise = this.getLocalNotebookResults(query, token ?? CancellationToken.None, localNotebookWidgets, searchInstanceID);
      const searchLocalEnd = Date.now();
      const experimentalNotebooksEnabled = this.configurationService.getValue("search").experimental?.closedNotebookRichContentResults ?? false;
      let closedResultsPromise = Promise.resolve(void 0);
      if (experimentalNotebooksEnabled) {
        closedResultsPromise = this.getClosedNotebookResults(query, new ResourceSet(localNotebookFiles, (uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4)), token ?? CancellationToken.None);
      }
      const promise = Promise.all([localResultPromise, closedResultsPromise]);
      return {
        completeData: promise.then((resolvedPromise) => {
          const openNotebookResult = resolvedPromise[0];
          const closedNotebookResult = resolvedPromise[1];
          const resolved = resolvedPromise.filter((e4) => !!e4);
          const resultArray = [...openNotebookResult.results.values(), ...closedNotebookResult?.results.values() ?? []];
          const results = coalesce(resultArray);
          if (onProgress) {
            results.forEach(onProgress);
          }
          this.logService.trace(`local notebook search time | ${searchLocalEnd - searchStart}ms`);
          return {
            messages: [],
            limitHit: resolved.reduce((prev, cur) => prev || cur.limitHit, false),
            results
          };
        }),
        allScannedFiles: promise.then((resolvedPromise) => {
          const openNotebookResults = resolvedPromise[0];
          const closedNotebookResults = resolvedPromise[1];
          const results = coalesce([...openNotebookResults.results.keys(), ...closedNotebookResults?.results.keys() ?? []]);
          return new ResourceSet(results, (uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
        })
      };
    };
    const promiseResults = getAllResults();
    return {
      openFilesToScan: new ResourceSet(localNotebookFiles),
      completeData: promiseResults.completeData,
      allScannedFiles: promiseResults.allScannedFiles
    };
  }
  async doesFileExist(includes2, folderQueries, token) {
    const promises = includes2.map(async (includePattern) => {
      const query = this.queryBuilder.file(folderQueries.map((e4) => e4.folder), {
        includePattern: includePattern.startsWith("/") ? includePattern : "**/" + includePattern,
        // todo: find cleaner way to ensure that globs match all appropriate filetypes
        exists: true,
        onlyFileScheme: true
      });
      return this.searchService.fileSearch(
        query,
        token
      ).then((ret) => {
        return !!ret.limitHit;
      });
    });
    return Promise.any(promises);
  }
  async getClosedNotebookResults(textQuery, scannedFiles, token) {
    const userAssociations = this.editorResolverService.getAllUserAssociations();
    const allPriorityInfo = /* @__PURE__ */ new Map();
    const contributedNotebookTypes = this.notebookService.getContributedNotebookTypes();
    userAssociations.forEach((association) => {
      if (!association.filenamePattern) {
        return;
      }
      const info = {
        isFromSettings: true,
        filenamePatterns: [association.filenamePattern]
      };
      const existingEntry = allPriorityInfo.get(association.viewType);
      if (existingEntry) {
        allPriorityInfo.set(association.viewType, existingEntry.concat(info));
      } else {
        allPriorityInfo.set(association.viewType, [info]);
      }
    });
    const promises = [];
    contributedNotebookTypes.forEach((notebook) => {
      if (notebook.selectors.length > 0) {
        promises.push((async () => {
          const includes2 = notebook.selectors.map((selector) => {
            const globPattern = selector.include || selector;
            return globPattern.toString();
          });
          const isInWorkspace = await this.doesFileExist(includes2, textQuery.folderQueries, token);
          if (isInWorkspace) {
            const canResolve = await this.notebookService.canResolve(notebook.id);
            if (!canResolve) {
              return void 0;
            }
            const serializer = (await this.notebookService.withNotebookDataProvider(notebook.id)).serializer;
            return await serializer.searchInNotebooks(textQuery, token, allPriorityInfo);
          } else {
            return void 0;
          }
        })());
      }
    });
    const start = Date.now();
    const searchComplete = coalesce(await Promise.all(promises));
    const results = searchComplete.flatMap((e4) => e4.results);
    let limitHit = searchComplete.some((e4) => e4.limitHit);
    const uniqueResults = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    let numResults = 0;
    for (const result of results) {
      if (textQuery.maxResults && numResults >= textQuery.maxResults) {
        limitHit = true;
        break;
      }
      if (!scannedFiles.has(result.resource) && !uniqueResults.has(result.resource)) {
        uniqueResults.set(result.resource, result.cellResults.length > 0 ? result : null);
        numResults++;
      }
    }
    const end = Date.now();
    this.logService.trace(`query: ${textQuery.contentPattern.pattern}`);
    this.logService.trace(`closed notebook search time | ${end - start}ms`);
    return {
      results: uniqueResults,
      limitHit
    };
  }
  async getLocalNotebookResults(query, token, widgets2, searchID) {
    const localResults = new ResourceMap((uri4) => this.uriIdentityService.extUri.getComparisonKey(uri4));
    let limitHit = false;
    for (const widget of widgets2) {
      if (!widget.hasModel()) {
        continue;
      }
      const askMax = (isNumber(query.maxResults) ? query.maxResults : DEFAULT_MAX_SEARCH_RESULTS) + 1;
      const uri4 = widget.viewModel.uri;
      if (!pathIncludedInQuery(query, uri4.fsPath)) {
        continue;
      }
      let matches2 = await widget.find(query.contentPattern.pattern, {
        regex: query.contentPattern.isRegExp,
        wholeWord: query.contentPattern.isWordMatch,
        caseSensitive: query.contentPattern.isCaseSensitive,
        includeMarkupInput: query.contentPattern.notebookInfo?.isInNotebookMarkdownInput ?? true,
        includeMarkupPreview: query.contentPattern.notebookInfo?.isInNotebookMarkdownPreview ?? true,
        includeCodeInput: query.contentPattern.notebookInfo?.isInNotebookCellInput ?? true,
        includeOutput: query.contentPattern.notebookInfo?.isInNotebookCellOutput ?? true
      }, token, false, true, searchID);
      if (matches2.length) {
        if (askMax && matches2.length >= askMax) {
          limitHit = true;
          matches2 = matches2.slice(0, askMax - 1);
        }
        const cellResults = matches2.map((match2) => {
          const contentResults = contentMatchesToTextSearchMatches(match2.contentMatches, match2.cell);
          const webviewResults = webviewMatchesToTextSearchMatches(match2.webviewMatches);
          return {
            cell: match2.cell,
            index: match2.index,
            contentResults,
            webviewResults
          };
        });
        const fileMatch = {
          resource: uri4,
          cellResults
        };
        localResults.set(uri4, fileMatch);
      } else {
        localResults.set(uri4, null);
      }
    }
    return {
      results: localResults,
      limitHit
    };
  }
  getLocalNotebookWidgets() {
    const notebookWidgets = this.notebookEditorService.retrieveAllExistingWidgets();
    return notebookWidgets.map((widget) => widget.value).filter((val) => !!val && val.hasModel());
  }
};

NotebookSearchService = __decorateClass([
  __decorateParam(0, IUriIdentityService),
  __decorateParam(1, INotebookEditorService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INotebookService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IEditorResolverService),
  __decorateParam(6, ISearchService),
  __decorateParam(7, IInstantiationService)
], NotebookSearchService);
export { NotebookSearchService };
