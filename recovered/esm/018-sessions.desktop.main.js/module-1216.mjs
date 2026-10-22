// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/common/search.ts
import { CancellationToken } from "./module-0025.mjs";
import { onUnexpectedExternalError } from "./module-0004.mjs";
import { compare } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { groupBy2 } from "./module-0007.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { isNumber } from "./module-0010.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/search/common/search.ts
var WorkspaceSymbolProviderRegistry;

((WorkspaceSymbolProviderRegistry2) => {
  const _supports = [];
  function register3(provider) {
    let support = provider;
    if (support) {
      _supports.push(support);
    }
    return {
      dispose() {
        if (support) {
          const idx = _supports.indexOf(support);
          if (idx >= 0) {
            _supports.splice(idx, 1);
            support = void 0;
          }
        }
      }
    };
  }
  WorkspaceSymbolProviderRegistry2.register = register3;
  function all() {
    return _supports.slice(0);
  }
  WorkspaceSymbolProviderRegistry2.all = all;
})(WorkspaceSymbolProviderRegistry || (WorkspaceSymbolProviderRegistry = {}));

var WorkspaceSymbolItem = class {
  constructor(symbol, provider) {
    this.symbol = symbol;
    this.provider = provider;
  }
};

async function getWorkspaceSymbols(query, token = CancellationToken.None) {
  const all = [];
  const promises = WorkspaceSymbolProviderRegistry.all().map(async (provider) => {
    try {
      const value2 = await provider.provideWorkspaceSymbols(query, token);
      if (!value2) {
        return;
      }
      for (const symbol of value2) {
        all.push(new WorkspaceSymbolItem(symbol, provider));
      }
    } catch (err) {
      onUnexpectedExternalError(err);
    }
  });
  await Promise.all(promises);
  if (token.isCancellationRequested) {
    return [];
  }
  function compareItems(a, b) {
    let res = compare(a.symbol.name, b.symbol.name);
    if (res === 0) {
      res = a.symbol.kind - b.symbol.kind;
    }
    if (res === 0) {
      res = compare(a.symbol.location.uri.toString(), b.symbol.location.uri.toString());
    }
    if (res === 0) {
      if (a.symbol.location.range && b.symbol.location.range) {
        if (!Range2.areIntersecting(a.symbol.location.range, b.symbol.location.range)) {
          res = Range2.compareRangesUsingStarts(a.symbol.location.range, b.symbol.location.range);
        }
      } else if (a.provider.resolveWorkspaceSymbol && !b.provider.resolveWorkspaceSymbol) {
        res = -1;
      } else if (!a.provider.resolveWorkspaceSymbol && b.provider.resolveWorkspaceSymbol) {
        res = 1;
      }
    }
    if (res === 0) {
      res = compare(a.symbol.containerName ?? "", b.symbol.containerName ?? "");
    }
    return res;
  }
  return groupBy2(all, compareItems).map((group2) => group2[0]).flat();
}

function getOutOfWorkspaceEditorResources(accessor) {
  const editorService = accessor.get(IEditorService);
  const contextService = accessor.get(IWorkspaceContextService);
  const fileService = accessor.get(IFileService);
  const resources = editorService.editors.map((editor) => EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ })).filter((resource) => !!resource && !contextService.isInsideWorkspace(resource) && fileService.hasProvider(resource));
  return resources;
}

var LINE_COLON_PATTERN = /\s?[#:\(](?:line )?(\d*)(?:[#:,](\d*))?(?:-(\d*)(?:[#:,](\d*))?)?\)?:?\s*$/;

function extractRangeFromFilter(filter2, unless) {
  if (!filter2 || unless?.some((value2) => {
    const unlessCharPos = filter2.indexOf(value2);
    return unlessCharPos === 0 || unlessCharPos > 0 && !LINE_COLON_PATTERN.test(filter2.substring(unlessCharPos + 1));
  })) {
    return void 0;
  }
  let range2 = void 0;
  const patternMatch = LINE_COLON_PATTERN.exec(filter2);
  if (patternMatch) {
    const startLineNumber = parseInt(patternMatch[1] ?? "", 10);
    if (isNumber(startLineNumber)) {
      range2 = {
        startLineNumber,
        startColumn: 1,
        endLineNumber: startLineNumber,
        endColumn: 1
      };
      const startColumn = parseInt(patternMatch[2] ?? "", 10);
      if (isNumber(startColumn)) {
        range2 = {
          startLineNumber: range2.startLineNumber,
          startColumn,
          endLineNumber: range2.endLineNumber,
          endColumn: startColumn
        };
      }
      const endLineNumber = parseInt(patternMatch[3] ?? "", 10);
      if (isNumber(endLineNumber)) {
        const endColumn = parseInt(patternMatch[4] ?? "", 10);
        range2 = {
          startLineNumber: range2.startLineNumber,
          startColumn: range2.startColumn,
          endLineNumber,
          endColumn: isNumber(endColumn) ? endColumn : 1
        };
      }
    } else if (patternMatch[1] === "") {
      range2 = {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      };
    }
  }
  if (patternMatch && range2) {
    return {
      filter: filter2.substr(0, patternMatch.index),
      // clear range suffix from search value
      range: range2
    };
  }
  return void 0;
}

var SearchStateKey = new RawContextKey("searchState", 0 /* Idle */);

var searchConfigurationNode = {
  id: "search",
  order: 13,
  title: localize(19259, null),
  type: "object",
  properties: {}
};
export { getWorkspaceSymbols, getOutOfWorkspaceEditorResources, extractRangeFromFilter, WorkspaceSymbolProviderRegistry, WorkspaceSymbolItem, LINE_COLON_PATTERN, SearchStateKey, searchConfigurationNode };
