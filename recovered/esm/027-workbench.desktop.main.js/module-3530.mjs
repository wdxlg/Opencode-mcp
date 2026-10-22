// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippetCodeActionProvider.ts
import { CodeActionKind } from "./module-0558.mjs";
import { localize } from "./module-0001.mjs";
import { SurroundWithSnippetEditorAction, getSurroundableSnippets } from "./module-3529.mjs";
import { Selection } from "./module-0107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISnippetsService } from "./module-1352.mjs";
import { ApplyFileSnippetAction } from "./module-3526.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/snippets/browser/snippetCodeActionProvider.ts
var SurroundWithSnippetCodeActionProvider = class {
  constructor(_snippetService) {
    this._snippetService = _snippetService;
  }
  static {
    this._MAX_CODE_ACTIONS = 4;
  }
  static {
    this._overflowCommandCodeAction = {
      kind: CodeActionKind.SurroundWith.value,
      title: localize(19343, null),
      command: {
        id: SurroundWithSnippetEditorAction.options.id,
        title: SurroundWithSnippetEditorAction.options.title.value
      }
    };
  }
  async provideCodeActions(model, range2) {
    if (range2.isEmpty()) {
      return void 0;
    }
    const position2 = Selection.isISelection(range2) ? range2.getPosition() : range2.getStartPosition();
    const snippets = await getSurroundableSnippets(this._snippetService, model, position2, false);
    if (!snippets.length) {
      return void 0;
    }
    const actions = [];
    for (const snippet of snippets) {
      if (actions.length >= SurroundWithSnippetCodeActionProvider._MAX_CODE_ACTIONS) {
        actions.push(SurroundWithSnippetCodeActionProvider._overflowCommandCodeAction);
        break;
      }
      actions.push({
        title: localize(19342, null, snippet.name),
        kind: CodeActionKind.SurroundWith.value,
        edit: asWorkspaceEdit(model, range2, snippet)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};

SurroundWithSnippetCodeActionProvider = __decorateClass([
  __decorateParam(0, ISnippetsService)
], SurroundWithSnippetCodeActionProvider);

var FileTemplateCodeActionProvider = class {
  constructor(_snippetService) {
    this._snippetService = _snippetService;
    this.providedCodeActionKinds = [CodeActionKind.SurroundWith.value];
  }
  static {
    this._MAX_CODE_ACTIONS = 4;
  }
  static {
    this._overflowCommandCodeAction = {
      title: localize(19344, null),
      kind: CodeActionKind.SurroundWith.value,
      command: {
        id: ApplyFileSnippetAction.Id,
        title: ""
      }
    };
  }
  async provideCodeActions(model) {
    if (model.getValueLength() !== 0) {
      return void 0;
    }
    const snippets = await this._snippetService.getSnippets(model.getLanguageId(), model.uri, { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
    const actions = [];
    for (const snippet of snippets) {
      if (actions.length >= FileTemplateCodeActionProvider._MAX_CODE_ACTIONS) {
        actions.push(FileTemplateCodeActionProvider._overflowCommandCodeAction);
        break;
      }
      actions.push({
        title: localize(19345, null, snippet.name),
        kind: CodeActionKind.SurroundWith.value,
        edit: asWorkspaceEdit(model, model.getFullModelRange(), snippet)
      });
    }
    return {
      actions,
      dispose() {
      }
    };
  }
};

FileTemplateCodeActionProvider = __decorateClass([
  __decorateParam(0, ISnippetsService)
], FileTemplateCodeActionProvider);

function asWorkspaceEdit(model, range2, snippet) {
  return {
    edits: [{
      versionId: model.getVersionId(),
      resource: model.uri,
      textEdit: {
        range: range2,
        text: snippet.body,
        insertAsSnippet: true
      }
    }]
  };
}

var SnippetCodeActions = class {
  constructor(instantiationService, languageFeaturesService, configService) {
    this._store = new DisposableStore();
    const setting = "editor.snippets.codeActions.enabled";
    const sessionStore = new DisposableStore();
    const update = () => {
      sessionStore.clear();
      if (configService.getValue(setting)) {
        sessionStore.add(languageFeaturesService.codeActionProvider.register("*", instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
        sessionStore.add(languageFeaturesService.codeActionProvider.register("*", instantiationService.createInstance(FileTemplateCodeActionProvider)));
      }
    };
    update();
    this._store.add(configService.onDidChangeConfiguration((e) => e.affectsConfiguration(setting) && update()));
    this._store.add(sessionStore);
  }
  dispose() {
    this._store.dispose();
  }
};

SnippetCodeActions = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IConfigurationService)
], SnippetCodeActions);
export { asWorkspaceEdit, SurroundWithSnippetCodeActionProvider, FileTemplateCodeActionProvider, SnippetCodeActions };
