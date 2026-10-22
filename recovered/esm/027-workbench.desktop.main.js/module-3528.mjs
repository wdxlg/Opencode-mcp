// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/commands/insertSnippet.ts
import { SnippetEditorAction } from "./module-3524.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Snippet } from "./module-1353.mjs";
import { pickSnippet } from "./module-3527.mjs";
import { SnippetController2 } from "./module-0714.mjs";


// src/vs/workbench/contrib/snippets/browser/commands/insertSnippet.ts
var Args = class _Args {
  constructor(snippet, name, langId) {
    this.snippet = snippet;
    this.name = name;
    this.langId = langId;
  }
  static fromUser(arg) {
    if (!arg || typeof arg !== "object") {
      return _Args._empty;
    }
    let { snippet, name, langId } = arg;
    if (typeof snippet !== "string") {
      snippet = void 0;
    }
    if (typeof name !== "string") {
      name = void 0;
    }
    if (typeof langId !== "string") {
      langId = void 0;
    }
    return new _Args(snippet, name, langId);
  }
  static {
    this._empty = new _Args(void 0, void 0, void 0);
  }
};

var InsertSnippetAction = class extends SnippetEditorAction {
  constructor() {
    super({
      id: "editor.action.insertSnippet",
      title: localize2(19340, "Insert Snippet"),
      f1: true,
      precondition: EditorContextKeys.writable,
      metadata: {
        description: `Insert Snippet`,
        args: [{
          name: "args",
          schema: {
            "type": "object",
            "properties": {
              "snippet": {
                "type": "string"
              },
              "langId": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          }
        }]
      }
    });
  }
  async runEditorCommand(accessor, editor, arg) {
    const languageService = accessor.get(ILanguageService);
    const snippetService = accessor.get(ISnippetsService);
    if (!editor.hasModel()) {
      return;
    }
    const clipboardService = accessor.get(IClipboardService);
    const instaService = accessor.get(IInstantiationService);
    const snippet = await new Promise((resolve3, reject) => {
      const { lineNumber, column } = editor.getPosition();
      const { snippet: snippet2, name, langId } = Args.fromUser(arg);
      if (snippet2) {
        return resolve3(new Snippet(
          false,
          [],
          "",
          "",
          "",
          snippet2,
          "",
          1 /* User */,
          `random/${Math.random()}`
        ));
      }
      let languageId;
      if (langId) {
        if (!languageService.isRegisteredLanguageId(langId)) {
          return resolve3(void 0);
        }
        languageId = langId;
      } else {
        editor.getModel().tokenization.tokenizeIfCheap(lineNumber);
        languageId = editor.getModel().getLanguageIdAtPosition(lineNumber, column);
        if (!languageService.getLanguageName(languageId)) {
          languageId = editor.getModel().getLanguageId();
        }
      }
      if (name) {
        snippetService.getSnippets(languageId, void 0, { includeNoPrefixSnippets: true }).then((snippets) => snippets.find((snippet3) => snippet3.name === name)).then(resolve3, reject);
      } else {
        resolve3(instaService.invokeFunction(pickSnippet, languageId, editor.getModel().uri));
      }
    });
    if (!snippet) {
      return;
    }
    let clipboardText;
    if (snippet.needsClipboard) {
      clipboardText = await clipboardService.readText();
    }
    editor.focus();
    SnippetController2.get(editor)?.insert(snippet.codeSnippet, { clipboardText });
    snippetService.updateUsageTimestamp(snippet);
  }
};
export { Args, InsertSnippetAction };
