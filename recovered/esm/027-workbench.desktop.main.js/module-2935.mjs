// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";
import { getLocation, parse5 } from "./module-0883.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionManagementService } from "./module-0872.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider.ts
var ExtensionsCompletionItemsProvider = class extends Disposable {
  constructor(extensionManagementService, languageFeaturesService) {
    super();
    this.extensionManagementService = extensionManagementService;
    this._register(languageFeaturesService.completionProvider.register({ language: "jsonc", pattern: "**/settings.json" }, {
      _debugDisplayName: "extensionsCompletionProvider",
      provideCompletionItems: async (model, position2, _context, token) => {
        const getWordRangeAtPosition = (model2, position3) => {
          const wordAtPosition = model2.getWordAtPosition(position3);
          return wordAtPosition ? new Range2(position3.lineNumber, wordAtPosition.startColumn, position3.lineNumber, wordAtPosition.endColumn) : null;
        };
        const location2 = getLocation(model.getValue(), model.getOffsetAt(position2));
        const range2 = getWordRangeAtPosition(model, position2) ?? Range2.fromPositions(position2, position2);
        if (location2.path[0] === "extensions.supportUntrustedWorkspaces" && location2.path.length === 2 && location2.isAtPropertyKey) {
          let alreadyConfigured = [];
          try {
            alreadyConfigured = Object.keys(parse5(model.getValue())["extensions.supportUntrustedWorkspaces"]);
          } catch (e) {
          }
          return { suggestions: await this.provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range2) };
        }
        return { suggestions: [] };
      }
    }));
  }
  async provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range2) {
    const suggestions = [];
    const installedExtensions = (await this.extensionManagementService.getInstalled()).filter((e) => e.manifest.main);
    const proposedExtensions = installedExtensions.filter((e) => alreadyConfigured.indexOf(e.identifier.id) === -1);
    if (proposedExtensions.length) {
      suggestions.push(...proposedExtensions.map((e) => {
        const text2 = `"${e.identifier.id}": {
	"supported": true,
	"version": "${e.manifest.version}"
},`;
        return { label: e.identifier.id, kind: 13 /* Value */, insertText: text2, filterText: text2, range: range2 };
      }));
    } else {
      const text2 = '"vscode.csharp": {\n	"supported": true,\n	"version": "0.0.0"\n},';
      suggestions.push({ label: localize(15390, null), kind: 13 /* Value */, insertText: text2, filterText: text2, range: range2 });
    }
    return suggestions;
  }
};

ExtensionsCompletionItemsProvider = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, ILanguageFeaturesService)
], ExtensionsCompletionItemsProvider);
export { ExtensionsCompletionItemsProvider };
