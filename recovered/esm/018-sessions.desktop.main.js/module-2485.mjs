// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/editFileTool.ts
import { ToolDataSource } from "./module-0991.mjs";
import { URI } from "./module-0032.mjs";
import { CellUri } from "./module-0911.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0973.mjs";
import { ICodeMapperService } from "./module-1034.mjs";
import { INotebookService } from "./module-0927.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/editFileTool.ts
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
    const uri4 = CellUri.parse(fileUri)?.notebook || fileUri;
    const model = this.chatService.getSession(invocation.context.sessionResource);
    const request2 = model.getRequests().at(-1);
    model.acceptResponseProgress(request2, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    model.acceptResponseProgress(request2, {
      kind: "codeblockUri",
      uri: uri4,
      isEdit: true
    });
    model.acceptResponseProgress(request2, {
      kind: "markdownContent",
      content: new MarkdownString("\n````\n")
    });
    if (this.notebookService.hasSupportedNotebooks(uri4) && this.notebookService.getNotebookTextModel(uri4)) {
      model.acceptResponseProgress(request2, {
        kind: "notebookEdit",
        edits: [],
        uri: uri4
      });
    } else {
      model.acceptResponseProgress(request2, {
        kind: "textEdit",
        edits: [],
        uri: uri4
      });
    }
    const editSession = model.editingSession;
    if (!editSession) {
      throw new Error("This tool must be called from within an editing session");
    }
    const result = await this.codeMapperService.mapCode({
      codeBlocks: [{ code: parameters.code, resource: uri4, markdownBeforeBlock: parameters.explanation }],
      location: "tool",
      chatRequestId: invocation.chatRequestId,
      chatRequestModel: invocation.modelId,
      chatSessionResource: invocation.context.sessionResource
    }, {
      textEdit: (target, edits) => {
        model.acceptResponseProgress(request2, { kind: "textEdit", uri: target, edits });
      },
      notebookEdit(target, edits) {
        model.acceptResponseProgress(request2, { kind: "notebookEdit", uri: target, edits });
      }
    }, token);
    if (this.notebookService.hasSupportedNotebooks(uri4) && this.notebookService.getNotebookTextModel(uri4)) {
      model.acceptResponseProgress(request2, { kind: "notebookEdit", uri: uri4, edits: [], done: true });
    } else {
      model.acceptResponseProgress(request2, { kind: "textEdit", uri: uri4, edits: [], done: true });
    }
    if (result?.errorMessage) {
      throw new Error(result.errorMessage);
    }
    let dispose2;
    await new Promise((resolve3) => {
      let wasFileBeingModified = false;
      dispose2 = autorun((r2) => {
        const entries2 = editSession.entries.read(r2);
        const currentFile = entries2?.find((e4) => isEqual2(e4.modifiedURI, uri4));
        if (currentFile) {
          if (currentFile.isCurrentlyBeingModifiedBy.read(r2)) {
            wasFileBeingModified = true;
          } else if (wasFileBeingModified) {
            resolve3(true);
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
  async prepareToolInvocation(context2, token) {
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
export { InternalEditToolId, EditToolData, EditTool };
