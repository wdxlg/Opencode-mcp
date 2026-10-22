// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeActions/browser/codeActionsContribution.ts
import { localize } from "./module-0001.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { HierarchicalKind } from "./module-0535.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { codeActionCommandId, refactorCommandId, sourceActionCommandId } from "./module-0559.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/workbench/contrib/codeActions/browser/codeActionsContribution.ts
var createCodeActionsAutoSave = (description) => {
  return {
    type: "string",
    enum: ["always", "explicit", "never", true, false],
    enumDescriptions: [
      localize(13638, null),
      localize(13643, null),
      localize(13647, null),
      localize(13644, null),
      localize(13648, null)
    ],
    default: "explicit",
    description
  };
};

var createNotebookCodeActionsAutoSave = (description) => {
  return {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false],
    enumDescriptions: [
      localize(13641, null),
      localize(13645, null),
      localize(13642, null),
      localize(13646, null)
    ],
    default: "explicit",
    description
  };
};

var codeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: localize(13640, null, "`#files.autoSave#`"),
  type: ["object", "array"],
  additionalProperties: {
    type: "string",
    enum: ["always", "explicit", "never", true, false]
  },
  default: {},
  scope: 6 /* LANGUAGE_OVERRIDABLE */
};

var editorConfiguration2 = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActionsOnSave": codeActionsOnSaveSchema
  }
});

var notebookCodeActionsOnSaveSchema = {
  oneOf: [
    {
      type: "object",
      additionalProperties: {
        type: "string"
      }
    },
    {
      type: "array",
      items: { type: "string" }
    }
  ],
  markdownDescription: localize(13649, null, "`#files.autoSave#`"),
  type: "object",
  additionalProperties: {
    type: ["string", "boolean"],
    enum: ["explicit", "never", true, false]
    // enum: ['explicit', 'always', 'never'], -- autosave support needs to be built first
    // nls.localize('always', 'Always triggers Code Actions on save, including autosave, focus, and window change events.'),
  },
  default: {}
};

var notebookEditorConfiguration = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    "notebook.codeActionsOnSave": notebookCodeActionsOnSaveSchema
  }
});

var CodeActionsContribution = class extends Disposable {
  constructor(keybindingService, languageFeatures) {
    super();
    this.languageFeatures = languageFeatures;
    this._onDidChangeSchemaContributions = this._register(new Emitter());
    this._allProvidedCodeActionKinds = [];
    this._register(
      Event2.runAndSubscribe(
        Event2.debounce(languageFeatures.codeActionProvider.onDidChange, () => {
        }, 1e3),
        () => {
          this._allProvidedCodeActionKinds = this.getAllProvidedCodeActionKinds();
          this.updateConfigurationSchema(this._allProvidedCodeActionKinds);
          this._onDidChangeSchemaContributions.fire();
        }
      )
    );
    this._register(keybindingService.registerSchemaContribution({
      getSchemaAdditions: () => this.getKeybindingSchemaAdditions(),
      onDidChange: this._onDidChangeSchemaContributions.event
    }));
  }
  getAllProvidedCodeActionKinds() {
    const out = /* @__PURE__ */ new Map();
    for (const provider of this.languageFeatures.codeActionProvider.allNoModel()) {
      for (const kind of provider.providedCodeActionKinds ?? []) {
        out.set(kind, new HierarchicalKind(kind));
      }
    }
    return Array.from(out.values());
  }
  updateConfigurationSchema(allProvidedKinds) {
    const properties = { ...codeActionsOnSaveSchema.properties };
    const notebookProperties = { ...notebookCodeActionsOnSaveSchema.properties };
    for (const codeActionKind of allProvidedKinds) {
      if (CodeActionKind.Source.contains(codeActionKind) && !properties[codeActionKind.value]) {
        properties[codeActionKind.value] = createCodeActionsAutoSave(localize(13639, null, codeActionKind.value));
        notebookProperties[codeActionKind.value] = createNotebookCodeActionsAutoSave(localize(13639, null, codeActionKind.value));
      }
    }
    codeActionsOnSaveSchema.properties = properties;
    notebookCodeActionsOnSaveSchema.properties = notebookProperties;
    Registry.as(Extensions4.Configuration).notifyConfigurationSchemaUpdated(editorConfiguration2);
  }
  getKeybindingSchemaAdditions() {
    const conditionalSchema = (command4, kinds) => {
      return {
        if: {
          required: ["command"],
          properties: {
            "command": { const: command4 }
          }
        },
        then: {
          properties: {
            "args": {
              required: ["kind"],
              properties: {
                "kind": {
                  anyOf: [
                    { enum: Array.from(kinds) },
                    { type: "string" }
                  ]
                }
              }
            }
          }
        }
      };
    };
    const filterProvidedKinds = (ofKind) => {
      const out = /* @__PURE__ */ new Set();
      for (const providedKind of this._allProvidedCodeActionKinds) {
        if (ofKind.contains(providedKind)) {
          out.add(providedKind.value);
        }
      }
      return Array.from(out);
    };
    return [
      conditionalSchema(codeActionCommandId, filterProvidedKinds(HierarchicalKind.Empty)),
      conditionalSchema(refactorCommandId, filterProvidedKinds(CodeActionKind.Refactor)),
      conditionalSchema(sourceActionCommandId, filterProvidedKinds(CodeActionKind.Source))
    ];
  }
};

CodeActionsContribution = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, ILanguageFeaturesService)
], CodeActionsContribution);
export { createCodeActionsAutoSave, createNotebookCodeActionsAutoSave, codeActionsOnSaveSchema, editorConfiguration2, notebookCodeActionsOnSaveSchema, notebookEditorConfiguration, CodeActionsContribution };
