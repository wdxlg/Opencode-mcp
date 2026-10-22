// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/language/common/languageService.ts
import { ExtensionsRegistry } from "./module-0878.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { index } from "./module-0007.mjs";
import { isString } from "./module-0010.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { LanguageService } from "./module-1355.mjs";
import { joinPath } from "./module-0034.mjs";
import { FILES_ASSOCIATIONS_CONFIG } from "./module-0269.mjs";
import { clearConfiguredLanguageAssociations, registerConfiguredLanguageAssociation } from "./module-1353.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/services/language/common/languageService.ts
var languagesExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languages",
  jsonSchema: {
    description: localize(23230, null),
    type: "array",
    items: {
      type: "object",
      defaultSnippets: [{ body: { id: "${1:languageId}", aliases: ["${2:label}"], extensions: ["${3:extension}"], configuration: "./language-configuration.json" } }],
      properties: {
        id: {
          description: localize(23240, null),
          type: "string"
        },
        aliases: {
          description: localize(23231, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        extensions: {
          description: localize(23233, null),
          default: [".foo"],
          type: "array",
          items: {
            type: "string"
          }
        },
        filenames: {
          description: localize(23235, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        filenamePatterns: {
          description: localize(23234, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        mimetypes: {
          description: localize(23241, null),
          type: "array",
          items: {
            type: "string"
          }
        },
        firstLine: {
          description: localize(23236, null),
          type: "string"
        },
        configuration: {
          description: localize(23232, null),
          type: "string",
          default: "./language-configuration.json"
        },
        icon: {
          type: "object",
          description: localize(23237, null),
          properties: {
            light: {
              description: localize(23239, null),
              type: "string"
            },
            dark: {
              description: localize(23238, null),
              type: "string"
            }
          }
        }
      }
    }
  },
  activationEventsGenerator: function* (languageContributions) {
    for (const languageContribution of languageContributions) {
      if (languageContribution.id && languageContribution.configuration) {
        yield `onLanguage:${languageContribution.id}`;
      }
    }
  }
});

var LanguageTableRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.languages;
  }
  render(manifest) {
    const contributes = manifest.contributes;
    const rawLanguages = contributes?.languages || [];
    const languages = [];
    for (const l of rawLanguages) {
      if (isValidLanguageExtensionPoint(l)) {
        languages.push({
          id: l.id,
          name: (l.aliases || [])[0] || l.id,
          extensions: l.extensions || [],
          hasGrammar: false,
          hasSnippets: false
        });
      }
    }
    const byId = index(languages, (l) => l.id);
    const grammars = contributes?.grammars || [];
    grammars.forEach((grammar) => {
      if (!isString(grammar.language)) {
        return;
      }
      let language2 = byId[grammar.language];
      if (language2) {
        language2.hasGrammar = true;
      } else {
        language2 = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
        byId[language2.id] = language2;
        languages.push(language2);
      }
    });
    const snippets = contributes?.snippets || [];
    snippets.forEach((snippet) => {
      if (!isString(snippet.language)) {
        return;
      }
      let language2 = byId[snippet.language];
      if (language2) {
        language2.hasSnippets = true;
      } else {
        language2 = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
        byId[language2.id] = language2;
        languages.push(language2);
      }
    });
    if (!languages.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(23218, null),
      localize(23219, null),
      localize(23214, null),
      localize(23215, null),
      localize(23229, null)
    ];
    const rows = languages.sort((a, b) => a.id.localeCompare(b.id)).map((l) => {
      return [
        l.id,
        l.name,
        new MarkdownString().appendMarkdown(`${l.extensions.map((e4) => `\`${e4}\``).join("&nbsp;")}`),
        l.hasGrammar ? "\u2714\uFE0E" : "\u2014",
        l.hasSnippets ? "\u2714\uFE0E" : "\u2014"
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
  id: "languages",
  label: localize(23220, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(LanguageTableRenderer)
});

var WorkbenchLanguageService = class extends LanguageService {
  constructor(extensionService, configurationService, environmentService, logService) {
    super(environmentService.verbose || environmentService.isExtensionDevelopment || !environmentService.isBuilt);
    this.logService = logService;
    this._configurationService = configurationService;
    this._extensionService = extensionService;
    languagesExtPoint.setHandler((extensions) => {
      const allValidLanguages = [];
      for (let i2 = 0, len = extensions.length; i2 < len; i2++) {
        const extension = extensions[i2];
        if (!Array.isArray(extension.value)) {
          extension.collector.error(localize(23216, null, languagesExtPoint.name));
          continue;
        }
        for (let j = 0, lenJ = extension.value.length; j < lenJ; j++) {
          const ext = extension.value[j];
          if (isValidLanguageExtensionPoint(ext, extension.collector)) {
            let configuration2 = void 0;
            if (ext.configuration) {
              configuration2 = joinPath(extension.description.extensionLocation, ext.configuration);
            }
            allValidLanguages.push({
              id: ext.id,
              extensions: ext.extensions,
              filenames: ext.filenames,
              filenamePatterns: ext.filenamePatterns,
              firstLine: ext.firstLine,
              aliases: ext.aliases,
              mimetypes: ext.mimetypes,
              configuration: configuration2,
              icon: ext.icon && {
                light: joinPath(extension.description.extensionLocation, ext.icon.light),
                dark: joinPath(extension.description.extensionLocation, ext.icon.dark)
              }
            });
          }
        }
      }
      this._registry.setDynamicLanguages(allValidLanguages);
    });
    this.updateMime();
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(FILES_ASSOCIATIONS_CONFIG)) {
        this.updateMime();
      }
    }));
    this._extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.updateMime();
    });
    this._register(this.onDidRequestRichLanguageFeatures((languageId) => {
      this._extensionService.activateByEvent(`onLanguage:${languageId}`);
      this._extensionService.activateByEvent(`onLanguage`);
    }));
  }
  updateMime() {
    const configuration2 = this._configurationService.getValue();
    clearConfiguredLanguageAssociations();
    if (configuration2.files?.associations) {
      Object.keys(configuration2.files.associations).forEach((pattern) => {
        const langId = configuration2.files.associations[pattern];
        if (typeof langId !== "string") {
          this.logService.warn(`Ignoring configured 'files.associations' for '${pattern}' because its type is not a string but '${typeof langId}'`);
          return;
        }
        const mimeType = this.getMimeType(langId) || `text/x-${langId}`;
        registerConfiguredLanguageAssociation({ id: langId, mime: mimeType, filepattern: pattern });
      });
    }
    this._onDidChange.fire();
  }
};

WorkbenchLanguageService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, ILogService)
], WorkbenchLanguageService);

function isUndefinedOrStringArray(value2) {
  if (typeof value2 === "undefined") {
    return true;
  }
  if (!Array.isArray(value2)) {
    return false;
  }
  return value2.every((item) => typeof item === "string");
}

function isValidLanguageExtensionPoint(value2, collector) {
  if (!value2) {
    collector?.error(localize(23217, null, languagesExtPoint.name));
    return false;
  }
  if (typeof value2.id !== "string") {
    collector?.error(localize(23228, null, "id"));
    return false;
  }
  if (!isUndefinedOrStringArray(value2.extensions)) {
    collector?.error(localize(23223, null, "extensions"));
    return false;
  }
  if (!isUndefinedOrStringArray(value2.filenames)) {
    collector?.error(localize(23224, null, "filenames"));
    return false;
  }
  if (typeof value2.firstLine !== "undefined" && typeof value2.firstLine !== "string") {
    collector?.error(localize(23225, null, "firstLine"));
    return false;
  }
  if (typeof value2.configuration !== "undefined" && typeof value2.configuration !== "string") {
    collector?.error(localize(23222, null, "configuration"));
    return false;
  }
  if (!isUndefinedOrStringArray(value2.aliases)) {
    collector?.error(localize(23221, null, "aliases"));
    return false;
  }
  if (!isUndefinedOrStringArray(value2.mimetypes)) {
    collector?.error(localize(23227, null, "mimetypes"));
    return false;
  }
  if (typeof value2.icon !== "undefined") {
    if (typeof value2.icon !== "object" || typeof value2.icon.light !== "string" || typeof value2.icon.dark !== "string") {
      collector?.error(localize(23226, null, "icon", "light", "dark"));
      return false;
    }
  }
  return true;
}

registerSingleton(ILanguageService, WorkbenchLanguageService, 0 /* Eager */);
export { isUndefinedOrStringArray, isValidLanguageExtensionPoint, languagesExtPoint, LanguageTableRenderer, WorkbenchLanguageService };
