// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/usagesTool.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0991.mjs";
import { errorResult, findLineNumber, findSymbolColumn, isSymbolToolResourceInScope, resolveSymbolToolFileUri } from "./module-2609.mjs";
import { Position } from "./module-0079.mjs";
import { getDefinitionsAtPosition, getImplementationsAtPosition, getReferencesAtPosition } from "./module-0646.mjs";
import { createToolSimpleTextResult } from "./module-2488.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Range2 } from "./module-0106.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { ISearchService, resultIsMatch } from "./module-1000.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/tools/usagesTool.ts
var UsagesToolId = "vscode_listCodeUsages";

var BaseModelDescription3 = `Find all usages (references, definitions, and implementations) of a code symbol across the workspace. This tool locates where a symbol is referenced, defined, or implemented.

Input:
- "symbol": The exact name of the symbol to search for (function, class, method, variable, type, etc.).
- "uri": A full URI (e.g. "file:///path/to/file.ts") of a file within the current workspace or working directory where the symbol appears. Provide either "uri" or "filePath".
- "filePath": A file path relative to the current working directory when one is set, otherwise the first workspace folder (e.g. "src/utils/helpers.ts"). Provide either "uri" or "filePath".
- "lineContent": A substring of the line of code where the symbol appears. This is used to locate the exact position in the file. Must be the actual text from the file - do NOT fabricate it.

IMPORTANT: The file and line do NOT need to be the definition of the symbol. Any occurrence works - a usage, an import, a call site, etc. You can pick whichever occurrence is most convenient.

If the tool returns an error, retry with corrected input - ensure the file path is correct, the line content matches the actual file content, and the symbol name appears in that line.`;

var StaticModelDescription2 = BaseModelDescription3 + `

If the file's language has no reference provider registered, the tool returns an error.`;

var UsagesTool = class extends Disposable {
  constructor(_languageFeaturesService, _modelService, _searchService, _textModelService, _workspaceContextService, _uriIdentityService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._modelService = _modelService;
    this._searchService = _searchService;
    this._textModelService = _textModelService;
    this._workspaceContextService = _workspaceContextService;
    this._uriIdentityService = _uriIdentityService;
  }
  getToolData() {
    return this._buildToolData(
      StaticModelDescription2,
      localize(11764, null)
    );
  }
  _buildToolData(modelDescription, userDescription) {
    return {
      id: UsagesToolId,
      toolReferenceName: "usages",
      canBeReferencedInPrompt: false,
      icon: ThemeIcon.fromId(Codicon.references.id),
      displayName: localize(11758, null),
      userDescription,
      modelDescription,
      source: ToolDataSource.Internal,
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The exact name of the symbol (function, class, method, variable, type, etc.) to find usages of."
          },
          uri: {
            type: "string",
            description: 'A full URI of a file within the current workspace or working directory where the symbol appears (e.g. "file:///path/to/file.ts"). Provide either "uri" or "filePath".'
          },
          filePath: {
            type: "string",
            description: 'A file path relative to the current working directory when one is set, otherwise the first workspace folder, where the symbol appears (e.g. "src/utils/helpers.ts"). Provide either "uri" or "filePath".'
          },
          lineContent: {
            type: "string",
            description: "A substring of the line of code where the symbol appears. Used to locate the exact position. Must be actual text from the file."
          }
        },
        required: ["symbol", "lineContent"]
      }
    };
  }
  async prepareToolInvocation(context2, _token) {
    const input = context2.parameters;
    return {
      invocationMessage: localize(11760, null, input.symbol)
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const input = invocation.parameters;
    const uri4 = resolveSymbolToolFileUri(input, this._workspaceContextService, this._uriIdentityService, invocation.context?.workingDirectory);
    if (!uri4) {
      return errorResult(localize(11759, null));
    }
    const ref = await this._textModelService.createModelReference(uri4);
    try {
      const model = ref.object.textEditorModel;
      if (!this._languageFeaturesService.referenceProvider.has(model)) {
        return errorResult(`No reference provider available for this file's language. The usages tool may not support this language.`);
      }
      const lineNumber = findLineNumber(model, input.lineContent);
      if (lineNumber === void 0) {
        return errorResult(`Could not find line content "${input.lineContent}" in ${uri4.toString()}. Provide the exact text from the line where the symbol appears.`);
      }
      const lineText = model.getLineContent(lineNumber);
      const column = findSymbolColumn(lineText, input.symbol);
      if (column === void 0) {
        return errorResult(`Could not find symbol "${input.symbol}" in the matched line. Ensure the symbol name is correct and appears in the provided line content.`);
      }
      const position2 = new Position(lineNumber, column);
      const [definitions3, allReferences, implementations] = await Promise.all([
        getDefinitionsAtPosition(this._languageFeaturesService.definitionProvider, model, position2, false, token),
        getReferencesAtPosition(this._languageFeaturesService.referenceProvider, model, position2, false, false, token),
        getImplementationsAtPosition(this._languageFeaturesService.implementationProvider, model, position2, false, token)
      ]);
      const workingDirectory = invocation.context?.workingDirectory;
      const references = allReferences.filter((ref2) => isSymbolToolResourceInScope(ref2.uri, this._workspaceContextService, this._uriIdentityService, workingDirectory));
      if (references.length === 0) {
        const result2 = createToolSimpleTextResult(`No usages found for \`${input.symbol}\`.`);
        result2.toolResultMessage = new MarkdownString(localize(11761, null, input.symbol));
        return result2;
      }
      const previews = await this._getLinePreviews(input.symbol, references, workingDirectory, token);
      const lines = [];
      lines.push(`${references.length} usages of \`${input.symbol}\`:
`);
      for (let i2 = 0; i2 < references.length; i2++) {
        const ref2 = references[i2];
        const kind = this._classifyReference(ref2, definitions3, implementations);
        const startLine = Range2.lift(ref2.range).startLineNumber;
        const preview = previews[i2];
        if (preview) {
          lines.push(`<usage type="${kind}" uri="${ref2.uri.toString()}" line="${startLine}">`);
          lines.push(`	${preview}`);
          lines.push(`</usage>`);
        } else {
          lines.push(`<usage type="${kind}" uri="${ref2.uri.toString()}" line="${startLine}" />`);
        }
      }
      const text2 = lines.join("\n");
      const result = createToolSimpleTextResult(text2);
      result.toolResultMessage = references.length === 1 ? new MarkdownString(localize(11762, null, input.symbol)) : new MarkdownString(localize(11763, null, input.symbol, references.length));
      result.toolResultDetails = references.map((r2) => ({ uri: r2.uri, range: r2.range }));
      return result;
    } finally {
      ref.dispose();
    }
  }
  async _getLinePreviews(symbol, references, workingDirectory, token) {
    const previews = new Array(references.length);
    const lookup = /* @__PURE__ */ new Map();
    const needSearch = new ResourceSet();
    for (let i2 = 0; i2 < references.length; i2++) {
      const ref = references[i2];
      const lineNumber = Range2.lift(ref.range).startLineNumber;
      const existingModel = this._modelService.getModel(ref.uri);
      if (existingModel) {
        previews[i2] = existingModel.getLineContent(lineNumber).trim();
      } else {
        lookup.set(`${ref.uri.toString()}:${lineNumber}`, i2);
        needSearch.add(ref.uri);
      }
    }
    if (needSearch.size === 0 || token.isCancellationRequested) {
      return previews;
    }
    try {
      const folders = workingDirectory ? [{ uri: workingDirectory }] : this._workspaceContextService.getWorkspace().folders;
      const relativePaths = [];
      for (const uri4 of needSearch) {
        const folder = folders.find((folder2) => isSymbolToolResourceInScope(uri4, this._workspaceContextService, this._uriIdentityService, folder2.uri));
        if (folder) {
          const rel = this._uriIdentityService.extUri.relativePath(folder.uri, uri4);
          if (rel) {
            relativePaths.push(rel);
          }
        }
      }
      if (relativePaths.length > 0) {
        const includePattern = {};
        if (relativePaths.length === 1) {
          includePattern[relativePaths[0]] = true;
        } else {
          includePattern[`{${relativePaths.join(",")}}`] = true;
        }
        const searchResult = await this._searchService.textSearch(
          {
            type: 2 /* Text */,
            contentPattern: { pattern: escapeRegExpCharacters(symbol), isRegExp: true, isWordMatch: true },
            folderQueries: folders.map((f) => ({ folder: f.uri })),
            includePattern
          },
          token
        );
        for (const fileMatch of searchResult.results) {
          if (!fileMatch.results) {
            continue;
          }
          for (const textMatch of fileMatch.results) {
            if (!resultIsMatch(textMatch)) {
              continue;
            }
            for (const range2 of textMatch.rangeLocations) {
              const lineNumber = range2.source.startLineNumber + 1;
              const key3 = `${fileMatch.resource.toString()}:${lineNumber}`;
              const idx = lookup.get(key3);
              if (idx !== void 0) {
                previews[idx] = textMatch.previewText.trim();
                lookup.delete(key3);
              }
            }
          }
        }
      }
    } catch {
    }
    return previews;
  }
  _classifyReference(ref, definitions3, implementations) {
    if (definitions3.some((d) => this._overlaps(ref, d))) {
      return "definition";
    }
    if (implementations.some((d) => this._overlaps(ref, d))) {
      return "implementation";
    }
    return "reference";
  }
  _overlaps(a, b) {
    if (!isEqual2(a.uri, b.uri)) {
      return false;
    }
    return Range2.areIntersectingOrTouching(a.range, b.range);
  }
};

UsagesTool = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ISearchService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IUriIdentityService)
], UsagesTool);

var UsagesToolContribution = class extends Disposable {
  static {
    this.ID = "chat.usagesTool";
  }
  constructor(toolsService, instantiationService) {
    super();
    const usagesTool = this._store.add(instantiationService.createInstance(UsagesTool));
    this._store.add(toolsService.registerTool(usagesTool.getToolData(), usagesTool));
  }
};

UsagesToolContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
], UsagesToolContribution);
export { UsagesToolId, BaseModelDescription3, StaticModelDescription2, UsagesTool, UsagesToolContribution };
