// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileRewriter.ts
import { PromptHeaderAttributes } from "./module-1004.mjs";
import { formatArrayValue } from "./module-2135.mjs";
import { EditOperation } from "./module-0162.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileRewriter.ts
var PromptFileRewriter = class {
  constructor(_codeEditorService, _promptsService, _languageModelToolsService) {
    this._codeEditorService = _codeEditorService;
    this._promptsService = _promptsService;
    this._languageModelToolsService = _languageModelToolsService;
  }
  async openAndRewriteTools(uri4, newTools, token) {
    const editor = await this._codeEditorService.openCodeEditor({ resource: uri4 }, this._codeEditorService.getFocusedCodeEditor());
    if (!editor || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const promptAST = this._promptsService.getParsedPromptFile(model);
    if (!promptAST.header) {
      return void 0;
    }
    const toolsAttr = promptAST.header.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr) {
      return void 0;
    }
    editor.setSelection(toolsAttr.range);
    if (newTools === void 0) {
      this.rewriteAttribute(model, "", toolsAttr.range);
      return;
    } else {
      this.rewriteTools(model, newTools, toolsAttr.value.range, toolsAttr.value.type === "scalar");
    }
  }
  rewriteTools(model, newTools, range2, isString2) {
    const newToolNames = this._languageModelToolsService.toFullReferenceNames(newTools);
    const newEntries = newToolNames.map((toolName) => formatArrayValue(toolName)).join(", ");
    const newValue = isString2 ? newEntries : `[${newEntries}]`;
    this.rewriteAttribute(model, newValue, range2);
  }
  rewriteAttribute(model, newValue, range2) {
    model.pushStackElement();
    model.pushEditOperations(null, [EditOperation.replaceMove(range2, newValue)], () => null);
    model.pushStackElement();
  }
  async openAndRewriteName(uri4, newName, token) {
    const editor = await this._codeEditorService.openCodeEditor({ resource: uri4 }, this._codeEditorService.getFocusedCodeEditor());
    if (!editor || !editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const promptAST = this._promptsService.getParsedPromptFile(model);
    if (!promptAST.header) {
      return;
    }
    const nameAttr = promptAST.header.getAttribute(PromptHeaderAttributes.name);
    if (!nameAttr) {
      return;
    }
    if (nameAttr.value.type === "scalar" && nameAttr.value.value === newName) {
      return;
    }
    editor.setSelection(nameAttr.range);
    this.rewriteAttribute(model, newName, nameAttr.value.range);
  }
};

PromptFileRewriter = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IPromptsService),
  __decorateParam(2, ILanguageModelToolsService)
], PromptFileRewriter);
export { PromptFileRewriter };
