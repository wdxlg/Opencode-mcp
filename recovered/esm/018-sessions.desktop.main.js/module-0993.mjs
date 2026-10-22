// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatVariables.ts
import { ChatDynamicVariableModel } from "./module-0985.mjs";
import { Range2 } from "./module-0106.mjs";
import { ToolAndToolSetEnablementMap } from "./module-0991.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatVariables.ts
function getDynamicVariablesForWidget(widget) {
  if (!widget.viewModel) {
    return [];
  }
  const model = widget.getContrib(ChatDynamicVariableModel.ID);
  if (!model) {
    return [];
  }
  if (!widget.supportsFileReferences) {
    return model.variables.filter((variable) => variable.isAttachmentReference);
  }
  if (widget.viewModel.editing && model.variables.length > 0) {
    return model.variables;
  }
  if (widget.input.attachmentModel.attachments.length > 0 && widget.viewModel.editing) {
    const references = [];
    const editorModel = widget.inputEditor.getModel();
    const modelTextLength = editorModel?.getValueLength() ?? 0;
    for (const attachment of widget.input.attachmentModel.attachments) {
      if (attachment.range) {
        if (attachment.range.start >= attachment.range.endExclusive) {
          continue;
        }
        if (attachment.range.start < 0 || attachment.range.endExclusive > modelTextLength) {
          continue;
        }
        if (!editorModel) {
          continue;
        }
        const startPos = editorModel.getPositionAt(attachment.range.start);
        const endPos = editorModel.getPositionAt(attachment.range.endExclusive);
        const referenceObj = {
          id: attachment.id,
          fullName: attachment.name,
          modelDescription: attachment.modelDescription,
          range: new Range2(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
          icon: attachment.icon,
          isFile: attachment.kind === "file",
          isDirectory: attachment.kind === "directory",
          data: attachment.value
        };
        references.push(referenceObj);
      }
    }
    return references.length > 0 ? references : model.variables;
  }
  return model.variables;
}

function getSelectedToolAndToolSetsForWidget(widget) {
  return widget.input.selectedToolsModel.entriesMap.get();
}

var ChatVariablesService = class {
  constructor(chatWidgetService) {
    this.chatWidgetService = chatWidgetService;
  }
  getDynamicVariables(sessionResource) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return [];
    }
    return getDynamicVariablesForWidget(widget);
  }
  getSelectedToolAndToolSets(sessionResource) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(sessionResource);
    if (!widget) {
      return ToolAndToolSetEnablementMap.fromEntries([]);
    }
    return getSelectedToolAndToolSetsForWidget(widget);
  }
};

ChatVariablesService = __decorateClass([
  __decorateParam(0, IChatWidgetService)
], ChatVariablesService);
export { getDynamicVariablesForWidget, getSelectedToolAndToolSetsForWidget, ChatVariablesService };
