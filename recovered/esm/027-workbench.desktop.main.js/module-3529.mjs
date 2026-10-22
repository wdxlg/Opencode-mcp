// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet.ts
import { SnippetEditorAction } from "./module-3524.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { pickSnippet } from "./module-3527.mjs";
import { SnippetController2 } from "./module-0714.mjs";


// src/vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet.ts
async function getSurroundableSnippets(snippetsService, model, position2, includeDisabledSnippets) {
  const { lineNumber, column } = position2;
  model.tokenization.tokenizeIfCheap(lineNumber);
  const languageId = model.getLanguageIdAtPosition(lineNumber, column);
  const allSnippets = await snippetsService.getSnippets(languageId, model.uri, { includeNoPrefixSnippets: true, includeDisabledSnippets });
  return allSnippets.filter((snippet) => snippet.usesSelection);
}

var SurroundWithSnippetEditorAction = class _SurroundWithSnippetEditorAction extends SnippetEditorAction {
  static {
    this.options = {
      id: "editor.action.surroundWithSnippet",
      title: localize2(19341, "Surround with Snippet...")
    };
  }
  constructor() {
    super({
      ..._SurroundWithSnippetEditorAction.options,
      precondition: ContextKeyExpr.and(
        EditorContextKeys.writable,
        EditorContextKeys.hasNonEmptySelection
      ),
      f1: true
    });
  }
  async runEditorCommand(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const instaService = accessor.get(IInstantiationService);
    const snippetsService = accessor.get(ISnippetsService);
    const clipboardService = accessor.get(IClipboardService);
    const model = editor.getModel();
    const snippets = await getSurroundableSnippets(snippetsService, model, editor.getPosition(), true);
    if (!snippets.length) {
      return;
    }
    const snippet = await instaService.invokeFunction(pickSnippet, snippets, model.uri);
    if (!snippet) {
      return;
    }
    let clipboardText;
    if (snippet.needsClipboard) {
      clipboardText = await clipboardService.readText();
    }
    editor.focus();
    SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
    snippetsService.updateUsageTimestamp(snippet);
  }
};
export { getSurroundableSnippets, SurroundWithSnippetEditorAction };
