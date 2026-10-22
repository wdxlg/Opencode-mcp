// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/tools/renameTool.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { ILanguageModelToolsService, ToolDataSource } from "./module-0990.mjs";
import { errorResult, findLineNumber, findSymbolColumn, isSymbolToolResourceInScope, resolveSymbolToolFileUri } from "./module-2634.mjs";
import { Position } from "./module-0079.mjs";
import { rename } from "./module-0734.mjs";
import { IBulkEditService, ResourceFileEdit, ResourceTextEdit } from "./module-0537.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { createToolSimpleTextResult } from "./module-2514.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IChatService } from "./module-0972.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/tools/renameTool.ts
var RenameToolId = "vscode_renameSymbol";

var BaseModelDescription2 = `Rename a code symbol across the workspace using the language server's rename functionality. This performs a precise, semantics-aware rename that updates all references.

Input:
- "symbol": The exact current name of the symbol to rename.
- "newName": The new name for the symbol.
- "uri": A full URI (e.g. "file:///path/to/file.ts") of a file within the current workspace or working directory where the symbol appears. Provide either "uri" or "filePath".
- "filePath": A file path relative to the current working directory when one is set, otherwise the first workspace folder (e.g. "src/utils/helpers.ts"). Provide either "uri" or "filePath".
- "lineContent": A substring of the line of code where the symbol appears. This is used to locate the exact position in the file. Must be the actual text from the file - do NOT fabricate it.

IMPORTANT: The file and line do NOT need to be the definition of the symbol. Any occurrence works - a usage, an import, a call site, etc. You can pick whichever occurrence is most convenient.

If the tool returns an error, retry with corrected input - ensure the file path is correct, the line content matches the actual file content, and the symbol name appears in that line.`;

var StaticModelDescription = BaseModelDescription2 + `

If the file's language has no rename provider registered, the tool returns an error.`;

var RenameTool = class extends Disposable {
  constructor(_languageFeaturesService, _textModelService, _workspaceContextService, _uriIdentityService, _chatService, _bulkEditService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this._textModelService = _textModelService;
    this._workspaceContextService = _workspaceContextService;
    this._uriIdentityService = _uriIdentityService;
    this._chatService = _chatService;
    this._bulkEditService = _bulkEditService;
  }
  getToolData() {
    return this._buildToolData(
      StaticModelDescription,
      localize(11740, null)
    );
  }
  _buildToolData(modelDescription, userDescription) {
    return {
      id: RenameToolId,
      toolReferenceName: "rename",
      canBeReferencedInPrompt: false,
      icon: ThemeIcon.fromId(Codicon.rename.id),
      displayName: localize(11733, null),
      userDescription,
      modelDescription,
      source: ToolDataSource.Internal,
      inputSchema: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The exact current name of the symbol to rename."
          },
          newName: {
            type: "string",
            description: "The new name for the symbol."
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
        required: ["symbol", "newName", "lineContent"]
      }
    };
  }
  async prepareToolInvocation(context2, _token) {
    const input = context2.parameters;
    return {
      invocationMessage: localize(11736, null, input.symbol, input.newName)
    };
  }
  async invoke(invocation, _countTokens, _progress, token) {
    const input = invocation.parameters;
    const uri5 = resolveSymbolToolFileUri(input, this._workspaceContextService, this._uriIdentityService, invocation.context?.workingDirectory);
    if (!uri5) {
      return errorResult(localize(11735, null));
    }
    const ref = await this._textModelService.createModelReference(uri5);
    try {
      const model = ref.object.textEditorModel;
      if (!this._languageFeaturesService.renameProvider.has(model)) {
        return errorResult(`No rename provider available for this file's language. The rename tool may not support this language.`);
      }
      const lineNumber = findLineNumber(model, input.lineContent);
      if (lineNumber === void 0) {
        return errorResult(`Could not find line content "${input.lineContent}" in ${uri5.toString()}. Provide the exact text from the line where the symbol appears.`);
      }
      const lineText = model.getLineContent(lineNumber);
      const column = findSymbolColumn(lineText, input.symbol);
      if (column === void 0) {
        return errorResult(`Could not find symbol "${input.symbol}" in the matched line. Ensure the symbol name is correct and appears in the provided line content.`);
      }
      const position2 = new Position(lineNumber, column);
      const renameResult = await rename(this._languageFeaturesService.renameProvider, model, position2, input.newName);
      if (renameResult.rejectReason) {
        return errorResult(`Rename rejected: ${renameResult.rejectReason}`);
      }
      if (renameResult.edits.length === 0) {
        return errorResult(`Rename produced no edits.`);
      }
      if (this._containsOutOfScopeEdit(renameResult.edits, invocation.context?.workingDirectory)) {
        return errorResult(localize(11738, null));
      }
      if (invocation.context) {
        const chatModel = this._chatService.getSession(invocation.context.sessionResource);
        const request2 = chatModel?.getRequests().at(-1);
        if (chatModel && request2) {
          if (renameResult.edits.some((edit3) => !ResourceTextEdit.is(edit3))) {
            return errorResult(localize(11739, null));
          }
          const editsByUri = new ResourceMap();
          for (const edit3 of renameResult.edits) {
            if (ResourceTextEdit.is(edit3)) {
              let edits = editsByUri.get(edit3.resource);
              if (!edits) {
                edits = [];
                editsByUri.set(edit3.resource, edits);
              }
              edits.push(edit3.textEdit);
            }
          }
          for (const [editUri, edits] of editsByUri) {
            chatModel.acceptResponseProgress(request2, {
              kind: "textEdit",
              uri: editUri,
              edits: []
            });
            chatModel.acceptResponseProgress(request2, {
              kind: "textEdit",
              uri: editUri,
              edits
            });
            chatModel.acceptResponseProgress(request2, {
              kind: "textEdit",
              uri: editUri,
              edits: [],
              done: true
            });
          }
          return this._successResult(input, editsByUri.size, renameResult.edits.length);
        }
      }
      await this._bulkEditService.apply(renameResult);
      const fileCount = new ResourceSet(renameResult.edits.filter(ResourceTextEdit.is).map((e) => e.resource)).size;
      return this._successResult(input, fileCount, renameResult.edits.length);
    } finally {
      ref.dispose();
    }
  }
  _successResult(input, fileCount, editCount) {
    const text2 = editCount === 1 ? localize(11737, null, input.symbol, input.newName, fileCount) : localize(11734, null, input.symbol, input.newName, editCount, fileCount);
    const result = createToolSimpleTextResult(text2);
    result.toolResultMessage = new MarkdownString(text2);
    return result;
  }
  _containsOutOfScopeEdit(edits, workingDirectory) {
    return edits.some((edit3) => {
      if (ResourceFileEdit.is(edit3)) {
        return !!edit3.oldResource && !isSymbolToolResourceInScope(edit3.oldResource, this._workspaceContextService, this._uriIdentityService, workingDirectory) || !!edit3.newResource && !isSymbolToolResourceInScope(edit3.newResource, this._workspaceContextService, this._uriIdentityService, workingDirectory);
      }
      return !isSymbolToolResourceInScope(edit3.resource, this._workspaceContextService, this._uriIdentityService, workingDirectory);
    });
  }
};

RenameTool = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IBulkEditService)
], RenameTool);

var RenameToolContribution = class extends Disposable {
  static {
    this.ID = "chat.renameTool";
  }
  constructor(toolsService, instantiationService) {
    super();
    const renameTool = this._store.add(instantiationService.createInstance(RenameTool));
    this._store.add(toolsService.registerTool(renameTool.getToolData(), renameTool));
  }
};

RenameToolContribution = __decorateClass([
  __decorateParam(0, ILanguageModelToolsService),
  __decorateParam(1, IInstantiationService)
], RenameToolContribution);
export { RenameToolId, BaseModelDescription2, StaticModelDescription, RenameTool, RenameToolContribution };
