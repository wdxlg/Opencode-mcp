// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localization/common/localization.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ClearDisplayLanguageAction, ConfigureDisplayLanguageAction } from "./module-4060.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/localization/common/localization.contribution.ts
var BaseLocalizationWorkbenchContribution = class extends Disposable {
  constructor() {
    super();
    registerAction2(ConfigureDisplayLanguageAction);
    registerAction2(ClearDisplayLanguageAction);
    ExtensionsRegistry.registerExtensionPoint({
      extensionPoint: "localizations",
      defaultExtensionKind: ["ui", "workspace"],
      jsonSchema: {
        description: localize(16563, null),
        type: "array",
        default: [],
        items: {
          type: "object",
          required: ["languageId", "translations"],
          defaultSnippets: [{ body: { languageId: "", languageName: "", localizedLanguageName: "", translations: [{ id: "vscode", path: "" }] } }],
          properties: {
            languageId: {
              description: localize(16564, null),
              type: "string"
            },
            languageName: {
              description: localize(16565, null),
              type: "string"
            },
            localizedLanguageName: {
              description: localize(16566, null),
              type: "string"
            },
            translations: {
              description: localize(16567, null),
              type: "array",
              default: [{ id: "vscode", path: "" }],
              items: {
                type: "object",
                required: ["id", "path"],
                properties: {
                  id: {
                    type: "string",
                    description: localize(16568, null),
                    pattern: "^((vscode)|([a-z0-9A-Z][a-z0-9A-Z-]*)\\.([a-z0-9A-Z][a-z0-9A-Z-]*))$",
                    patternErrorMessage: localize(16569, null)
                  },
                  path: {
                    type: "string",
                    description: localize(16570, null)
                  }
                },
                defaultSnippets: [{ body: { id: "", path: "" } }]
              }
            }
          }
        }
      }
    });
  }
};

var LocalizationsDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.localizations;
  }
  render(manifest) {
    const localizations = manifest.contributes?.localizations || [];
    if (!localizations.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(16559, null),
      localize(16561, null),
      localize(16562, null)
    ];
    const rows = localizations.sort((a, b) => a.languageId.localeCompare(b.languageId)).map((localization) => {
      return [
        localization.languageId,
        localization.languageName ?? "",
        localization.localizedLanguageName ?? ""
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "localizations",
  label: localize(16560, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LocalizationsDataRenderer)
});
export { BaseLocalizationWorkbenchContribution, LocalizationsDataRenderer };
