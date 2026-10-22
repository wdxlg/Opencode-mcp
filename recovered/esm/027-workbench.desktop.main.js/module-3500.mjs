// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/emmet/browser/emmetActions.ts
import { EditorAction } from "./module-0097.mjs";
import { grammarsExtPoint } from "./module-1773.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/emmet/browser/emmetActions.ts
var GrammarContributions = class _GrammarContributions {
  static {
    this._grammars = {};
  }
  constructor(contributions) {
    if (!Object.keys(_GrammarContributions._grammars).length) {
      this.fillModeScopeMap(contributions);
    }
  }
  fillModeScopeMap(contributions) {
    contributions.forEach((contribution) => {
      contribution.value.forEach((grammar) => {
        if (grammar.language && grammar.scopeName) {
          _GrammarContributions._grammars[grammar.language] = grammar.scopeName;
        }
      });
    });
  }
  getGrammar(mode) {
    return _GrammarContributions._grammars[mode];
  }
};

var EmmetEditorAction = class _EmmetEditorAction extends EditorAction {
  constructor(opts) {
    super(opts);
    this._lastGrammarContributions = null;
    this._lastExtensionService = null;
    this.emmetActionName = opts.actionName;
  }
  static {
    this.emmetSupportedModes = ["html", "css", "xml", "xsl", "haml", "jade", "jsx", "slim", "scss", "sass", "less", "stylus", "styl", "svg"];
  }
  _withGrammarContributions(extensionService) {
    if (this._lastExtensionService !== extensionService) {
      this._lastExtensionService = extensionService;
      this._lastGrammarContributions = extensionService.readExtensionPointContributions(grammarsExtPoint).then((contributions) => {
        return new GrammarContributions(contributions);
      });
    }
    return this._lastGrammarContributions || Promise.resolve(null);
  }
  run(accessor, editor) {
    const extensionService = accessor.get(IExtensionService);
    const commandService = accessor.get(ICommandService);
    return this._withGrammarContributions(extensionService).then((grammarContributions) => {
      if (this.id === "editor.emmet.action.expandAbbreviation" && grammarContributions) {
        return commandService.executeCommand("emmet.expandAbbreviation", _EmmetEditorAction.getLanguage(editor, grammarContributions));
      }
      return void 0;
    });
  }
  static getLanguage(editor, grammars) {
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection) {
      return null;
    }
    const position2 = selection.getStartPosition();
    model.tokenization.tokenizeIfCheap(position2.lineNumber);
    const languageId = model.getLanguageIdAtPosition(position2.lineNumber, position2.column);
    const syntax = languageId.split(".").pop();
    if (!syntax) {
      return null;
    }
    const checkParentMode = () => {
      const languageGrammar = grammars.getGrammar(syntax);
      if (!languageGrammar) {
        return syntax;
      }
      const languages = languageGrammar.split(".");
      if (languages.length < 2) {
        return syntax;
      }
      for (let i2 = 1; i2 < languages.length; i2++) {
        const language2 = languages[languages.length - i2];
        if (this.emmetSupportedModes.indexOf(language2) !== -1) {
          return language2;
        }
      }
      return syntax;
    };
    return {
      language: syntax,
      parentMode: checkParentMode()
    };
  }
};
export { GrammarContributions, EmmetEditorAction };
