// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets.ts
import { SnippetsAction } from "./module-3524.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { groupBy2, isFalsyOrEmpty } from "./module-0007.mjs";
import { compare } from "./module-0030.mjs";


// src/vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets.ts
var ApplyFileSnippetAction = class _ApplyFileSnippetAction extends SnippetsAction {
  static {
    this.Id = "workbench.action.populateFileFromSnippet";
  }
  constructor() {
    super({
      id: _ApplyFileSnippetAction.Id,
      title: localize2(19338, "Fill File with Snippet"),
      f1: true
    });
  }
  async run(accessor) {
    const snippetService = accessor.get(ISnippetsService);
    const quickInputService = accessor.get(IQuickInputService);
    const editorService = accessor.get(IEditorService);
    const langService = accessor.get(ILanguageService);
    const editor = getCodeEditor(editorService.activeTextEditorControl);
    if (!editor || !editor.hasModel()) {
      return;
    }
    const resourceUri = editor.getModel().uri;
    const snippets = await snippetService.getSnippets(void 0, resourceUri, { fileTemplateSnippets: true, noRecencySort: true, includeNoPrefixSnippets: true });
    if (snippets.length === 0) {
      return;
    }
    const selection = await this._pick(quickInputService, langService, snippets);
    if (!selection) {
      return;
    }
    if (editor.hasModel()) {
      editor.getModel().setLanguage(langService.createById(selection.langId), _ApplyFileSnippetAction.Id);
      SnippetController2.get(editor)?.apply([{
        range: editor.getModel().getFullModelRange(),
        template: selection.snippet.body
      }]);
      editor.focus();
    }
  }
  async _pick(quickInputService, langService, snippets) {
    const all = [];
    for (const snippet of snippets) {
      if (isFalsyOrEmpty(snippet.scopes)) {
        all.push({ langId: "", snippet });
      } else {
        for (const langId of snippet.scopes) {
          all.push({ langId, snippet });
        }
      }
    }
    const picks = [];
    const groups = groupBy2(all, (a, b) => compare(a.langId, b.langId));
    for (const group2 of groups) {
      let first2 = true;
      for (const item of group2) {
        if (first2) {
          picks.push({
            type: "separator",
            label: langService.getLanguageName(item.langId) ?? item.langId
          });
          first2 = false;
        }
        picks.push({
          snippet: item,
          label: item.snippet.prefix || item.snippet.name,
          detail: item.snippet.description
        });
      }
    }
    const pick = await quickInputService.pick(picks, {
      placeHolder: localize(19339, null),
      matchOnDetail: true
    });
    return pick?.snippet;
  }
};
export { ApplyFileSnippetAction };
