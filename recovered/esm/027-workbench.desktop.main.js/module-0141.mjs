// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/modesRegistry.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { localize } from "./module-0001.mjs";
import { Mimes } from "./module-0136.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/editor/common/languages/modesRegistry.ts
var Extensions5 = {
  ModesRegistry: "editor.modesRegistry"
};

var EditorModesRegistry = class extends Disposable {
  constructor() {
    super();
    this._onDidChangeLanguages = this._register(new Emitter());
    this.onDidChangeLanguages = this._onDidChangeLanguages.event;
    this._languages = [];
  }
  registerLanguage(def2) {
    this._languages.push(def2);
    this._onDidChangeLanguages.fire(void 0);
    return {
      dispose: () => {
        for (let i2 = 0, len = this._languages.length; i2 < len; i2++) {
          if (this._languages[i2] === def2) {
            this._languages.splice(i2, 1);
            return;
          }
        }
      }
    };
  }
  getLanguages() {
    return this._languages;
  }
};

var ModesRegistry = new EditorModesRegistry();

Registry.add(Extensions5.ModesRegistry, ModesRegistry);

var PLAINTEXT_LANGUAGE_ID = "plaintext";

var PLAINTEXT_EXTENSION = ".txt";

ModesRegistry.registerLanguage({
  id: PLAINTEXT_LANGUAGE_ID,
  extensions: [PLAINTEXT_EXTENSION],
  aliases: [localize(924, null), "text"],
  mimetypes: [Mimes.text]
});

Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{
  overrides: {
    "[plaintext]": {
      "editor.unicodeHighlight.ambiguousCharacters": false,
      "editor.unicodeHighlight.invisibleCharacters": false
    },
    // TODO: Below is a workaround for: https://github.com/microsoft/vscode/issues/240567
    "[go]": {
      "editor.insertSpaces": false
    },
    "[makefile]": {
      "editor.insertSpaces": false
    },
    "[shellscript]": {
      "files.eol": "\n"
    },
    "[yaml]": {
      "editor.insertSpaces": true,
      "editor.tabSize": 2
    }
  }
}]);
export { Extensions5, EditorModesRegistry, ModesRegistry, PLAINTEXT_LANGUAGE_ID, PLAINTEXT_EXTENSION };
