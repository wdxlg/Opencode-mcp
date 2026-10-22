// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/editFileTool.ts
import { ToolDataSource } from "./module-0191.mjs";
import { URI } from "./module-0025.mjs";
import { CellUri } from "./module-0187.mjs";
import { MarkdownString } from "./module-0086.mjs";
import { autorun } from "./module-0115.mjs";
import { isEqual2 } from "./module-0027.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0130.mjs";
import { ICodeMapperService } from "./module-0400.mjs";
import { INotebookService } from "./module-0399.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/editFileTool.ts
var ExtensionEditToolId = "vscode_editFile";

var InternalEditToolId = "vscode_editFile_internal";

var EditToolData = {
  id: InternalEditToolId,
  displayName: "",
  // not used
  modelDescription: "",
  // Not used
  source: ToolDataSource.Internal
};

var EditTool = class {
  constructor(chatService, codeMapperService, notebookService) {
    this.chatService = chatService;
    this.codeMapperService = codeMapperService;
    this.notebookService = notebookService;
  }
  async invoke(invocation, countTokens, _progress, token) {
    if (!invocation.context) {
      throw new Error("toolInvocationToken is required for this tool");
    }
    const parameters = invocation.parameters;
    const fileUri = URI.revive(parameters.uri);
    const uri2 = CellUri.parse(fileUri)?.notebook || fileUri;
    const model = this.chatService.getSession(invocation.context.sessionResource);
    const request = model.getRequests().at(-1);
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    model.acceptResponseProgress(request, {
      kind: "codeblockUri",
      uri: uri2,
      isEdit: true
    });
    model.acceptResponseProgress(request, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    if (this.notebookService.hasSupportedNotebooks(uri2) && this.notebookService.getNotebookTextModel(uri2)) {
      model.acceptResponseProgress(request, {
        kind: "notebookEdit",
        edits: [],
        uri: uri2
      });
    } else {
      model.acceptResponseProgress(request, {
        kind: "textEdit",
        edits: [],
        uri: uri2
      });
    }
    const editSession = model.editingSession;
    if (!editSession) {
      throw new Error("This tool must be called from within an editing session");
    }
    const result = await this.codeMapperService.mapCode({
      codeBlocks: [{ code: parameters.code, resource: uri2, markdownBeforeBlock: parameters.explanation }],
      location: "tool",
      chatRequestId: invocation.chatRequestId,
      chatRequestModel: invocation.modelId,
      chatSessionResource: invocation.context.sessionResource
    }, {
      textEdit: (target, edits) => {
        model.acceptResponseProgress(request, { kind: "textEdit", uri: target, edits });
      },
      notebookEdit(target, edits) {
        model.acceptResponseProgress(request, { kind: "notebookEdit", uri: target, edits });
      }
    }, token);
    if (this.notebookService.hasSupportedNotebooks(uri2) && this.notebookService.getNotebookTextModel(uri2)) {
      model.acceptResponseProgress(request, { kind: "notebookEdit", uri: uri2, edits: [], done: true });
    } else {
      model.acceptResponseProgress(request, { kind: "textEdit", uri: uri2, edits: [], done: true });
    }
    if (result?.errorMessage) {
      throw new Error(result.errorMessage);
    }
    let dispose2;
    await new Promise((resolve2) => {
      let wasFileBeingModified = false;
      dispose2 = autorun((r2) => {
        const entries = editSession.entries.read(r2);
        const currentFile = entries?.find((e) => isEqual2(e.modifiedURI, uri2));
        if (currentFile) {
          if (currentFile.isCurrentlyBeingModifiedBy.read(r2)) {
            wasFileBeingModified = true;
          } else if (wasFileBeingModified) {
            resolve2(true);
          }
        }
      });
    }).finally(() => {
      dispose2.dispose();
    });
    return {
      content: [{ kind: "text", value: "The file was edited successfully" }]
    };
  }
  async prepareToolInvocation(context, token) {
    return {
      presentation: "hidden" /* Hidden */
    };
  }
};

EditTool = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, ICodeMapperService),
  __decorateParam(2, INotebookService)
], EditTool);
export { ExtensionEditToolId, InternalEditToolId, EditToolData, EditTool };
