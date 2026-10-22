// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostApiCommands.ts
import { ApiCommand, ApiCommandArgument, ApiCommandResult } from "./module-0268.mjs";
import { CallHierarchyIncomingCall2, CallHierarchyItem2, CallHierarchyOutgoingCall2, Color2, ColorPresentation2, CompletionItem2, DefinitionLink, DocumentHighlight2, DocumentLink2, FoldingRange2, Hover2, InlayHint2, InlineValue, InlineValueContext2, NotebookExclusiveDocumentPattern, Position3, Range3, Selection2, SignatureHelp2, SymbolKind4, TextEdit2, TextEditorOpenOptions, TypeHierarchyItem2, ViewColumn2, WorkspaceEdit2, WorkspaceSymbol, location } from "./module-0245.mjs";
import { isFalsyOrEmpty } from "./module-0006.mjs";
import { SymbolInformation } from "./module-0241.mjs";
import { Location2 } from "./module-0236.mjs";
import { Position2 } from "./module-0232.mjs";
import { CodeAction, CodeLens, Color, ColorInformation, CompletionList, SelectionRange, SemanticTokens, SemanticTokensLegend } from "./module-0244.mjs";
import { decodeSemanticTokensDto } from "./module-0361.mjs";
import { Range2 } from "./module-0233.mjs";
import { Selection } from "./module-0238.mjs";
import { CodeActionKind } from "./module-0234.mjs";
import { URI } from "./module-0025.mjs";
import { Schemas, matchesSomeScheme } from "./module-0026.mjs";
import { validateWhenClauses } from "./module-0049.mjs";
import { isLocationLink } from "./module-0093.mjs";


// src/vs/workbench/api/common/extHostApiCommands.ts
var newCommands = [
  // -- document highlights
  new ApiCommand(
    "vscode.executeDocumentHighlights",
    "_executeDocumentHighlights",
    "Execute document highlight provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of DocumentHighlight-instances.", tryMapWith(DocumentHighlight2.to))
  ),
  // -- document symbols
  new ApiCommand(
    "vscode.executeDocumentSymbolProvider",
    "_executeDocumentSymbolProvider",
    "Execute document symbol provider.",
    [ApiCommandArgument.Uri],
    new ApiCommandResult("A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.", (value, apiArgs) => {
      if (isFalsyOrEmpty(value)) {
        return void 0;
      }
      class MergedInfo extends SymbolInformation {
        constructor() {
          super(...arguments);
          this.containerName = "";
        }
        static to(symbol) {
          const res = new MergedInfo(
            symbol.name,
            SymbolKind4.to(symbol.kind),
            symbol.containerName || "",
            new Location2(apiArgs[0], Range3.to(symbol.range))
          );
          res.detail = symbol.detail;
          res.range = res.location.range;
          res.selectionRange = Range3.to(symbol.selectionRange);
          res.children = symbol.children ? symbol.children.map(MergedInfo.to) : [];
          return res;
        }
      }
      return value.map(MergedInfo.to);
    })
  ),
  // -- formatting
  new ApiCommand(
    "vscode.executeFormatDocumentProvider",
    "_executeFormatDocumentProvider",
    "Execute document format provider.",
    [ApiCommandArgument.Uri, new ApiCommandArgument("options", "Formatting options", (_) => true, (v) => v)],
    new ApiCommandResult("A promise that resolves to an array of TextEdits.", tryMapWith(TextEdit2.to))
  ),
  new ApiCommand(
    "vscode.executeFormatRangeProvider",
    "_executeFormatRangeProvider",
    "Execute range format provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range, new ApiCommandArgument("options", "Formatting options", (_) => true, (v) => v)],
    new ApiCommandResult("A promise that resolves to an array of TextEdits.", tryMapWith(TextEdit2.to))
  ),
  new ApiCommand(
    "vscode.executeFormatOnTypeProvider",
    "_executeFormatOnTypeProvider",
    "Execute format on type provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position, new ApiCommandArgument("ch", "Trigger character", (v) => typeof v === "string", (v) => v), new ApiCommandArgument("options", "Formatting options", (_) => true, (v) => v)],
    new ApiCommandResult("A promise that resolves to an array of TextEdits.", tryMapWith(TextEdit2.to))
  ),
  // -- go to symbol (definition, type definition, declaration, impl, references)
  new ApiCommand(
    "vscode.executeDefinitionProvider",
    "_executeDefinitionProvider",
    "Execute all definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.experimental.executeDefinitionProvider_recursive",
    "_executeDefinitionProvider_recursive",
    "Execute all definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.executeTypeDefinitionProvider",
    "_executeTypeDefinitionProvider",
    "Execute all type definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.experimental.executeTypeDefinitionProvider_recursive",
    "_executeTypeDefinitionProvider_recursive",
    "Execute all type definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.executeDeclarationProvider",
    "_executeDeclarationProvider",
    "Execute all declaration providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.experimental.executeDeclarationProvider_recursive",
    "_executeDeclarationProvider_recursive",
    "Execute all declaration providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.executeImplementationProvider",
    "_executeImplementationProvider",
    "Execute all implementation providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.experimental.executeImplementationProvider_recursive",
    "_executeImplementationProvider_recursive",
    "Execute all implementation providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location or LocationLink instances.", mapLocationOrLocationLink)
  ),
  new ApiCommand(
    "vscode.executeReferenceProvider",
    "_executeReferenceProvider",
    "Execute all reference providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location-instances.", tryMapWith(location.to))
  ),
  new ApiCommand(
    "vscode.experimental.executeReferenceProvider",
    "_executeReferenceProvider_recursive",
    "Execute all reference providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Location-instances.", tryMapWith(location.to))
  ),
  // -- hover
  new ApiCommand(
    "vscode.executeHoverProvider",
    "_executeHoverProvider",
    "Execute all hover providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Hover-instances.", tryMapWith(Hover2.to))
  ),
  new ApiCommand(
    "vscode.experimental.executeHoverProvider_recursive",
    "_executeHoverProvider_recursive",
    "Execute all hover providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of Hover-instances.", tryMapWith(Hover2.to))
  ),
  // -- selection range
  new ApiCommand(
    "vscode.executeSelectionRangeProvider",
    "_executeSelectionRangeProvider",
    "Execute selection range provider.",
    [ApiCommandArgument.Uri, new ApiCommandArgument("position", "A position in a text document", (v) => Array.isArray(v) && v.every((v2) => Position2.isPosition(v2)), (v) => v.map(Position3.from))],
    new ApiCommandResult("A promise that resolves to an array of ranges.", (result) => {
      return result.map((ranges) => {
        let node;
        for (const range of ranges.reverse()) {
          node = new SelectionRange(Range3.to(range), node);
        }
        return node;
      });
    })
  ),
  // -- symbol search
  new ApiCommand(
    "vscode.executeWorkspaceSymbolProvider",
    "_executeWorkspaceSymbolProvider",
    "Execute all workspace symbol providers.",
    [ApiCommandArgument.String.with("query", "Search string")],
    new ApiCommandResult("A promise that resolves to an array of SymbolInformation-instances.", (value) => {
      return value.map(WorkspaceSymbol.to);
    })
  ),
  // --- call hierarchy
  new ApiCommand(
    "vscode.prepareCallHierarchy",
    "_executePrepareCallHierarchy",
    "Prepare call hierarchy at a position inside a document",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of CallHierarchyItem-instances", (v) => v.map(CallHierarchyItem2.to))
  ),
  new ApiCommand(
    "vscode.provideIncomingCalls",
    "_executeProvideIncomingCalls",
    "Compute incoming calls for an item",
    [ApiCommandArgument.CallHierarchyItem],
    new ApiCommandResult("A promise that resolves to an array of CallHierarchyIncomingCall-instances", (v) => v.map(CallHierarchyIncomingCall2.to))
  ),
  new ApiCommand(
    "vscode.provideOutgoingCalls",
    "_executeProvideOutgoingCalls",
    "Compute outgoing calls for an item",
    [ApiCommandArgument.CallHierarchyItem],
    new ApiCommandResult("A promise that resolves to an array of CallHierarchyOutgoingCall-instances", (v) => v.map(CallHierarchyOutgoingCall2.to))
  ),
  // --- rename
  new ApiCommand(
    "vscode.prepareRename",
    "_executePrepareRename",
    "Execute the prepareRename of rename provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to a range and placeholder text.", (value) => {
      if (!value) {
        return void 0;
      }
      return {
        range: Range3.to(value.range),
        placeholder: value.text
      };
    })
  ),
  new ApiCommand(
    "vscode.executeDocumentRenameProvider",
    "_executeDocumentRenameProvider",
    "Execute rename provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position, ApiCommandArgument.String.with("newName", "The new symbol name")],
    new ApiCommandResult("A promise that resolves to a WorkspaceEdit.", (value) => {
      if (!value) {
        return void 0;
      }
      if (value.rejectReason) {
        throw new Error(value.rejectReason);
      }
      return WorkspaceEdit2.to(value);
    })
  ),
  // --- links
  new ApiCommand(
    "vscode.executeLinkProvider",
    "_executeLinkProvider",
    "Execute document link provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Number.with("linkResolveCount", "Number of links that should be resolved, only when links are unresolved.").optional()],
    new ApiCommandResult("A promise that resolves to an array of DocumentLink-instances.", (value) => value.map(DocumentLink2.to))
  ),
  // --- semantic tokens
  new ApiCommand(
    "vscode.provideDocumentSemanticTokensLegend",
    "_provideDocumentSemanticTokensLegend",
    "Provide semantic tokens legend for a document",
    [ApiCommandArgument.Uri],
    new ApiCommandResult("A promise that resolves to SemanticTokensLegend.", (value) => {
      if (!value) {
        return void 0;
      }
      return new SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
    })
  ),
  new ApiCommand(
    "vscode.provideDocumentSemanticTokens",
    "_provideDocumentSemanticTokens",
    "Provide semantic tokens for a document",
    [ApiCommandArgument.Uri],
    new ApiCommandResult("A promise that resolves to SemanticTokens.", (value) => {
      if (!value) {
        return void 0;
      }
      const semanticTokensDto = decodeSemanticTokensDto(value);
      if (semanticTokensDto.type !== "full") {
        return void 0;
      }
      return new SemanticTokens(semanticTokensDto.data, void 0);
    })
  ),
  new ApiCommand(
    "vscode.provideDocumentRangeSemanticTokensLegend",
    "_provideDocumentRangeSemanticTokensLegend",
    "Provide semantic tokens legend for a document range",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range.optional()],
    new ApiCommandResult("A promise that resolves to SemanticTokensLegend.", (value) => {
      if (!value) {
        return void 0;
      }
      return new SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
    })
  ),
  new ApiCommand(
    "vscode.provideDocumentRangeSemanticTokens",
    "_provideDocumentRangeSemanticTokens",
    "Provide semantic tokens for a document range",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range],
    new ApiCommandResult("A promise that resolves to SemanticTokens.", (value) => {
      if (!value) {
        return void 0;
      }
      const semanticTokensDto = decodeSemanticTokensDto(value);
      if (semanticTokensDto.type !== "full") {
        return void 0;
      }
      return new SemanticTokens(semanticTokensDto.data, void 0);
    })
  ),
  // --- completions
  new ApiCommand(
    "vscode.executeCompletionItemProvider",
    "_executeCompletionItemProvider",
    "Execute completion item provider.",
    [
      ApiCommandArgument.Uri,
      ApiCommandArgument.Position,
      ApiCommandArgument.String.with("triggerCharacter", "Trigger completion when the user types the character, like `,` or `(`").optional(),
      ApiCommandArgument.Number.with("itemResolveCount", "Number of completions to resolve (too large numbers slow down completions)").optional()
    ],
    new ApiCommandResult("A promise that resolves to a CompletionList-instance.", (value, _args, converter) => {
      if (!value) {
        return new CompletionList([]);
      }
      const items = value.suggestions.map((suggestion) => CompletionItem2.to(suggestion, converter));
      return new CompletionList(items, value.incomplete);
    })
  ),
  // --- signature help
  new ApiCommand(
    "vscode.executeSignatureHelpProvider",
    "_executeSignatureHelpProvider",
    "Execute signature help provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position, ApiCommandArgument.String.with("triggerCharacter", "Trigger signature help when the user types the character, like `,` or `(`").optional()],
    new ApiCommandResult("A promise that resolves to SignatureHelp.", (value) => {
      if (value) {
        return SignatureHelp2.to(value);
      }
      return void 0;
    })
  ),
  // --- code lens
  new ApiCommand(
    "vscode.executeCodeLensProvider",
    "_executeCodeLensProvider",
    "Execute code lens provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Number.with("itemResolveCount", "Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)").optional()],
    new ApiCommandResult("A promise that resolves to an array of CodeLens-instances.", (value, _args, converter) => {
      return tryMapWith((item) => {
        return new CodeLens(Range3.to(item.range), item.command && converter.fromInternal(item.command));
      })(value);
    })
  ),
  // --- code actions
  new ApiCommand(
    "vscode.executeCodeActionProvider",
    "_executeCodeActionProvider",
    "Execute code action provider.",
    [
      ApiCommandArgument.Uri,
      new ApiCommandArgument("rangeOrSelection", "Range in a text document. Some refactoring provider requires Selection object.", (v) => Range2.isRange(v), (v) => Selection.isSelection(v) ? Selection2.from(v) : Range3.from(v)),
      ApiCommandArgument.String.with("kind", "Code action kind to return code actions for").optional(),
      ApiCommandArgument.Number.with("itemResolveCount", "Number of code actions to resolve (too large numbers slow down code actions)").optional()
    ],
    new ApiCommandResult("A promise that resolves to an array of Command-instances.", (value, _args, converter) => {
      return tryMapWith((codeAction) => {
        if (codeAction._isSynthetic) {
          if (!codeAction.command) {
            throw new Error("Synthetic code actions must have a command");
          }
          return converter.fromInternal(codeAction.command);
        } else {
          const ret = new CodeAction(
            codeAction.title,
            codeAction.kind ? new CodeActionKind(codeAction.kind) : void 0
          );
          if (codeAction.edit) {
            ret.edit = WorkspaceEdit2.to(codeAction.edit);
          }
          if (codeAction.command) {
            ret.command = converter.fromInternal(codeAction.command);
          }
          ret.isPreferred = codeAction.isPreferred;
          return ret;
        }
      })(value);
    })
  ),
  // --- colors
  new ApiCommand(
    "vscode.executeDocumentColorProvider",
    "_executeDocumentColorProvider",
    "Execute document color provider.",
    [ApiCommandArgument.Uri],
    new ApiCommandResult("A promise that resolves to an array of ColorInformation objects.", (result) => {
      if (result) {
        return result.map((ci) => new ColorInformation(Range3.to(ci.range), Color2.to(ci.color)));
      }
      return [];
    })
  ),
  new ApiCommand(
    "vscode.executeColorPresentationProvider",
    "_executeColorPresentationProvider",
    "Execute color presentation provider.",
    [
      new ApiCommandArgument("color", "The color to show and insert", (v) => v instanceof Color, Color2.from),
      new ApiCommandArgument("context", "Context object with uri and range", (_v) => true, (v) => ({ uri: v.uri, range: Range3.from(v.range) }))
    ],
    new ApiCommandResult("A promise that resolves to an array of ColorPresentation objects.", (result) => {
      if (result) {
        return result.map(ColorPresentation2.to);
      }
      return [];
    })
  ),
  // --- inline hints
  new ApiCommand(
    "vscode.executeInlayHintProvider",
    "_executeInlayHintProvider",
    "Execute inlay hints provider",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range],
    new ApiCommandResult("A promise that resolves to an array of Inlay objects", (result, args2, converter) => {
      return result.map(InlayHint2.to.bind(void 0, converter));
    })
  ),
  // --- folding
  new ApiCommand(
    "vscode.executeFoldingRangeProvider",
    "_executeFoldingRangeProvider",
    "Execute folding range provider",
    [ApiCommandArgument.Uri],
    new ApiCommandResult("A promise that resolves to an array of FoldingRange objects", (result, args2) => {
      if (result) {
        return result.map(FoldingRange2.to);
      }
      return void 0;
    })
  ),
  // --- notebooks
  new ApiCommand(
    "vscode.resolveNotebookContentProviders",
    "_resolveNotebookContentProvider",
    "Resolve Notebook Content Providers",
    [
      // new ApiCommandArgument<string, string>('viewType', '', v => typeof v === 'string', v => v),
      // new ApiCommandArgument<string, string>('displayName', '', v => typeof v === 'string', v => v),
      // new ApiCommandArgument<object, object>('options', '', v => typeof v === 'object', v => v),
    ],
    new ApiCommandResult("A promise that resolves to an array of NotebookContentProvider static info objects.", tryMapWith((item) => {
      return {
        viewType: item.viewType,
        displayName: item.displayName,
        options: {
          transientOutputs: item.options.transientOutputs,
          transientCellMetadata: item.options.transientCellMetadata,
          transientDocumentMetadata: item.options.transientDocumentMetadata
        },
        filenamePattern: item.filenamePattern.map((pattern) => NotebookExclusiveDocumentPattern.to(pattern))
      };
    }))
  ),
  // --- debug support
  new ApiCommand(
    "vscode.executeInlineValueProvider",
    "_executeInlineValueProvider",
    "Execute inline value provider",
    [
      ApiCommandArgument.Uri,
      ApiCommandArgument.Range,
      new ApiCommandArgument("context", "An InlineValueContext", (v) => v && typeof v.frameId === "number" && v.stoppedLocation instanceof Range2, (v) => InlineValueContext2.from(v))
    ],
    new ApiCommandResult("A promise that resolves to an array of InlineValue objects", (result) => {
      return result.map(InlineValue.to);
    })
  ),
  // --- open'ish commands
  new ApiCommand(
    "vscode.open",
    "_workbench.open",
    "Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.",
    [
      new ApiCommandArgument("uriOrString", "Uri-instance or string (only http/https)", (v) => URI.isUri(v) || typeof v === "string" && matchesSomeScheme(v, Schemas.http, Schemas.https), (v) => v),
      new ApiCommandArgument(
        "columnOrOptions",
        "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
        (v) => v === void 0 || typeof v === "number" || typeof v === "object",
        (v) => !v ? v : typeof v === "number" ? [ViewColumn2.from(v), void 0] : [ViewColumn2.from(v.viewColumn), TextEditorOpenOptions.from(v)]
      ).optional(),
      ApiCommandArgument.String.with("label", "").optional()
    ],
    ApiCommandResult.Void
  ),
  new ApiCommand(
    "vscode.openWith",
    "_workbench.openWith",
    "Opens the provided resource with a specific editor.",
    [
      ApiCommandArgument.Uri.with("resource", "Resource to open"),
      ApiCommandArgument.String.with("viewId", "Custom editor view id. This should be the viewType string for custom editors or the notebookType string for notebooks. Use 'default' to use VS Code's default text editor"),
      new ApiCommandArgument(
        "columnOrOptions",
        "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
        (v) => v === void 0 || typeof v === "number" || typeof v === "object",
        (v) => !v ? v : typeof v === "number" ? [ViewColumn2.from(v), void 0] : [ViewColumn2.from(v.viewColumn), TextEditorOpenOptions.from(v)]
      ).optional()
    ],
    ApiCommandResult.Void
  ),
  new ApiCommand(
    "vscode.diff",
    "_workbench.diff",
    "Opens the provided resources in the diff editor to compare their contents.",
    [
      ApiCommandArgument.Uri.with("left", "Left-hand side resource of the diff editor"),
      ApiCommandArgument.Uri.with("right", "Right-hand side resource of the diff editor"),
      ApiCommandArgument.String.with("title", "Human readable title for the diff editor").optional(),
      new ApiCommandArgument(
        "columnOrOptions",
        "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
        (v) => v === void 0 || typeof v === "object",
        (v) => v && [ViewColumn2.from(v.viewColumn), TextEditorOpenOptions.from(v)]
      ).optional()
    ],
    ApiCommandResult.Void
  ),
  new ApiCommand(
    "vscode.changes",
    "_workbench.changes",
    "Opens a list of resources in the changes editor to compare their contents.",
    [
      ApiCommandArgument.String.with("title", "Human readable title for the changes editor"),
      new ApiCommandArgument(
        "resourceList",
        "List of resources to compare",
        (resources) => {
          for (const resource of resources) {
            if (resource.length !== 3) {
              return false;
            }
            const [label, left, right] = resource;
            if (!URI.isUri(label) || !URI.isUri(left) && left !== void 0 && left !== null || !URI.isUri(right) && right !== void 0 && right !== null) {
              return false;
            }
          }
          return true;
        },
        (v) => v
      )
    ],
    ApiCommandResult.Void
  ),
  // --- type hierarchy
  new ApiCommand(
    "vscode.prepareTypeHierarchy",
    "_executePrepareTypeHierarchy",
    "Prepare type hierarchy at a position inside a document",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    new ApiCommandResult("A promise that resolves to an array of TypeHierarchyItem-instances", (v) => v.map(TypeHierarchyItem2.to))
  ),
  new ApiCommand(
    "vscode.provideSupertypes",
    "_executeProvideSupertypes",
    "Compute supertypes for an item",
    [ApiCommandArgument.TypeHierarchyItem],
    new ApiCommandResult("A promise that resolves to an array of TypeHierarchyItem-instances", (v) => v.map(TypeHierarchyItem2.to))
  ),
  new ApiCommand(
    "vscode.provideSubtypes",
    "_executeProvideSubtypes",
    "Compute subtypes for an item",
    [ApiCommandArgument.TypeHierarchyItem],
    new ApiCommandResult("A promise that resolves to an array of TypeHierarchyItem-instances", (v) => v.map(TypeHierarchyItem2.to))
  ),
  // --- testing
  new ApiCommand(
    "vscode.revealTestInExplorer",
    "_revealTestInExplorer",
    "Reveals a test instance in the explorer",
    [ApiCommandArgument.TestItem],
    ApiCommandResult.Void
  ),
  new ApiCommand(
    "vscode.startContinuousTestRun",
    "testing.startContinuousRunFromExtension",
    "Starts running the given tests with continuous run mode.",
    [ApiCommandArgument.TestProfile, ApiCommandArgument.Arr(ApiCommandArgument.TestItem)],
    ApiCommandResult.Void
  ),
  new ApiCommand(
    "vscode.stopContinuousTestRun",
    "testing.stopContinuousRunFromExtension",
    "Stops running the given tests with continuous run mode.",
    [ApiCommandArgument.Arr(ApiCommandArgument.TestItem)],
    ApiCommandResult.Void
  ),
  // --- continue edit session
  new ApiCommand(
    "vscode.experimental.editSession.continue",
    "_workbench.editSessions.actions.continueEditSession",
    "Continue the current edit session in a different workspace",
    [ApiCommandArgument.Uri.with("workspaceUri", "The target workspace to continue the current edit session in")],
    ApiCommandResult.Void
  ),
  // --- context keys
  new ApiCommand(
    "setContext",
    "_setContext",
    "Set a custom context key value that can be used in when clauses.",
    [
      ApiCommandArgument.String.with("name", "The context key name"),
      new ApiCommandArgument("value", "The context key value", () => true, (v) => v)
    ],
    ApiCommandResult.Void
  ),
  // --- inline chat
  new ApiCommand(
    "vscode.editorChat.start",
    "inlineChat.start",
    "Invoke a new editor chat session",
    [new ApiCommandArgument("Run arguments", "", (_v) => true, (v) => {
      if (!v) {
        return void 0;
      }
      return {
        initialRange: v.initialRange ? Range3.from(v.initialRange) : void 0,
        initialSelection: Selection.isSelection(v.initialSelection) ? Selection2.from(v.initialSelection) : void 0,
        message: v.message,
        attachments: v.attachments,
        autoSend: v.autoSend,
        position: v.position ? Position3.from(v.position) : void 0,
        resolveOnResponse: v.resolveOnResponse
      };
    })],
    ApiCommandResult.Void
  ),
  // --- extension prompt files
  new ApiCommand(
    "vscode.extensionPromptFileProvider",
    "_listExtensionPromptFiles",
    "Get all extension-contributed prompt files (custom agents, instructions, and prompt files).",
    [],
    new ApiCommandResult(
      "A promise that resolves to an array of objects containing uri, type, and extensionId.",
      (value) => {
        if (!value) {
          return [];
        }
        return value.map((item) => ({
          uri: URI.revive(item.uri),
          type: item.type,
          extensionId: item.extensionId
        }));
      }
    )
  )
];

var ExtHostApiCommands = class {
  static register(commands) {
    newCommands.forEach(commands.registerApiCommand, commands);
    this._registerValidateWhenClausesCommand(commands);
  }
  static _registerValidateWhenClausesCommand(commands) {
    commands.registerCommand(false, "_validateWhenClauses", validateWhenClauses);
  }
};

function tryMapWith(f) {
  return (value) => {
    if (Array.isArray(value)) {
      return value.map(f);
    }
    return void 0;
  };
}

function mapLocationOrLocationLink(values) {
  if (!Array.isArray(values)) {
    return void 0;
  }
  const result = [];
  for (const item of values) {
    if (isLocationLink(item)) {
      result.push(DefinitionLink.to(item));
    } else {
      result.push(location.to(item));
    }
  }
  return result;
}
export { tryMapWith, mapLocationOrLocationLink, newCommands, ExtHostApiCommands };
