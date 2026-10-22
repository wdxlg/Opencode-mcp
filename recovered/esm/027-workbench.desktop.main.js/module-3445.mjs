// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/suggest/browser/lspCompletionProviderAddon.ts
import { Disposable } from "./module-0012.mjs";
import { Position } from "./module-0079.mjs";
import { mapLspKindToTerminalKind } from "./module-1277.mjs";


// src/vs/workbench/contrib/terminalContrib/suggest/browser/lspCompletionProviderAddon.ts
var LspCompletionProviderAddon = class extends Disposable {
  constructor(provider, textVirtualModel, lspTerminalModelContentProvider) {
    super();
    this.id = "lsp";
    this.isBuiltin = true;
    this.shellTypes = ["python" /* Python */];
    this._provider = provider;
    this._textVirtualModel = textVirtualModel;
    this._lspTerminalModelContentProvider = lspTerminalModelContentProvider;
    this.triggerCharacters = provider.triggerCharacters ? [...provider.triggerCharacters, " ", "("] : [" ", "("];
  }
  activate(terminal2) {
  }
  async provideCompletions(value2, cursorPosition, token) {
    this._lspTerminalModelContentProvider.trackPromptInputToVirtualFile(value2);
    const textBeforeCursor = value2.substring(0, cursorPosition);
    const lines = textBeforeCursor.split("\n");
    const column = lines[lines.length - 1].length + 1;
    const lineNum = this._textVirtualModel.object.textEditorModel.getLineCount();
    const positionVirtualDocument = new Position(lineNum, column);
    const completions = [];
    if (this._provider && this._provider._debugDisplayName !== "wordbasedCompletions") {
      const result = await this._provider.provideCompletionItems(this._textVirtualModel.object.textEditorModel, positionVirtualDocument, { triggerKind: 1 /* TriggerCharacter */ }, token);
      for (const item of result?.suggestions || []) {
        const convertedKind = item.kind ? mapLspKindToTerminalKind(item.kind) : 2 /* Method */;
        const completionItemTemp = createCompletionItemPython(cursorPosition, textBeforeCursor, convertedKind, "lspCompletionItem", void 0);
        const terminalCompletion = {
          label: item.label,
          provider: `lsp:${item.extensionId?.value}`,
          detail: item.detail,
          documentation: item.documentation,
          kind: convertedKind,
          replacementRange: completionItemTemp.replacementRange
        };
        if (this._provider.resolveCompletionItem && (!item.detail || !item.documentation)) {
          terminalCompletion._unresolvedItem = item;
          terminalCompletion._resolveProvider = this._provider;
        }
        completions.push(terminalCompletion);
      }
    }
    return completions;
  }
};

function createCompletionItemPython(cursorPosition, prefix, kind, label3, detail2) {
  const lastWord = getLastWord(prefix);
  return {
    label: label3,
    detail: detail2 ?? "",
    replacementRange: [cursorPosition - lastWord.length, cursorPosition],
    kind: kind ?? 2 /* Method */
  };
}

function getLastWord(prefix) {
  if (prefix.endsWith(" ")) {
    return "";
  }
  if (prefix.endsWith(".")) {
    return "";
  }
  const lastSpaceIndex = prefix.lastIndexOf(" ");
  const lastDotIndex = prefix.lastIndexOf(".");
  const lastParenIndex = prefix.lastIndexOf("(");
  const lastDelimiterIndex = Math.max(lastSpaceIndex, lastDotIndex, lastParenIndex);
  if (lastDelimiterIndex === -1) {
    return prefix;
  }
  return prefix.substring(lastDelimiterIndex + 1);
}
export { createCompletionItemPython, getLastWord, LspCompletionProviderAddon };
