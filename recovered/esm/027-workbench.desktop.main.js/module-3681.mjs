// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/dropOrPasteInto/browser/configurationSchema.ts
import { localize } from "./module-0001.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { pasteAsPreferenceConfig } from "./module-0555.mjs";
import { dropAsPreferenceConfig } from "./module-0671.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { pasteAsCommandId } from "./module-0668.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/workbench/contrib/dropOrPasteInto/browser/configurationSchema.ts
var dropEnumValues = [];

var dropAsPreferenceSchema = {
  type: "array",
  scope: 6 /* LANGUAGE_OVERRIDABLE */,
  description: localize(14875, null),
  default: [],
  items: {
    description: localize(14874, null),
    anyOf: [
      { type: "string" },
      { enum: dropEnumValues }
    ]
  }
};

var pasteEnumValues = [];

var pasteAsPreferenceSchema = {
  type: "array",
  scope: 6 /* LANGUAGE_OVERRIDABLE */,
  description: localize(14877, null),
  default: [],
  items: {
    description: localize(14876, null),
    anyOf: [
      { type: "string" },
      { enum: pasteEnumValues }
    ]
  }
};

var editorConfiguration3 = Object.freeze({
  ...editorConfigurationBaseNode,
  properties: {
    [pasteAsPreferenceConfig]: pasteAsPreferenceSchema,
    [dropAsPreferenceConfig]: dropAsPreferenceSchema
  }
});

var DropOrPasteSchemaContribution = class extends Disposable {
  constructor(keybindingService, languageFeatures) {
    super();
    this.languageFeatures = languageFeatures;
    this._onDidChangeSchemaContributions = this._register(new Emitter());
    this._allProvidedDropKinds = [];
    this._allProvidedPasteKinds = [];
    this._register(
      Event2.runAndSubscribe(
        Event2.debounce(
          Event2.any(languageFeatures.documentPasteEditProvider.onDidChange, languageFeatures.documentPasteEditProvider.onDidChange),
          () => {
          },
          1e3
        ),
        () => {
          this.updateProvidedKinds();
          this.updateConfigurationSchema();
          this._onDidChangeSchemaContributions.fire();
        }
      )
    );
    this._register(keybindingService.registerSchemaContribution({
      getSchemaAdditions: () => this.getKeybindingSchemaAdditions(),
      onDidChange: this._onDidChangeSchemaContributions.event
    }));
  }
  static {
    this.ID = "workbench.contrib.dropOrPasteIntoSchema";
  }
  updateProvidedKinds() {
    const dropKinds = /* @__PURE__ */ new Map();
    for (const provider of this.languageFeatures.documentDropEditProvider.allNoModel()) {
      for (const kind of provider.providedDropEditKinds ?? []) {
        dropKinds.set(kind.value, kind);
      }
    }
    this._allProvidedDropKinds = Array.from(dropKinds.values());
    const pasteKinds = /* @__PURE__ */ new Map();
    for (const provider of this.languageFeatures.documentPasteEditProvider.allNoModel()) {
      for (const kind of provider.providedPasteEditKinds ?? []) {
        pasteKinds.set(kind.value, kind);
      }
    }
    this._allProvidedPasteKinds = Array.from(pasteKinds.values());
  }
  updateConfigurationSchema() {
    pasteEnumValues.length = 0;
    for (const codeActionKind of this._allProvidedPasteKinds) {
      pasteEnumValues.push(codeActionKind.value);
    }
    dropEnumValues.length = 0;
    for (const codeActionKind of this._allProvidedDropKinds) {
      dropEnumValues.push(codeActionKind.value);
    }
    Registry.as(Extensions4.Configuration).notifyConfigurationSchemaUpdated(editorConfiguration3);
  }
  getKeybindingSchemaAdditions() {
    return [
      {
        if: {
          required: ["command"],
          properties: {
            "command": { const: pasteAsCommandId }
          }
        },
        then: {
          properties: {
            "args": {
              oneOf: [
                {
                  required: ["kind"],
                  properties: {
                    "kind": {
                      anyOf: [
                        { enum: Array.from(this._allProvidedPasteKinds.map((x) => x.value)) },
                        { type: "string" }
                      ]
                    }
                  }
                },
                {
                  required: ["preferences"],
                  properties: {
                    "preferences": {
                      type: "array",
                      items: {
                        anyOf: [
                          { enum: Array.from(this._allProvidedPasteKinds.map((x) => x.value)) },
                          { type: "string" }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ];
  }
};

DropOrPasteSchemaContribution = __decorateClass([
  __decorateParam(0, IKeybindingService),
  __decorateParam(1, ILanguageFeaturesService)
], DropOrPasteSchemaContribution);
export { dropEnumValues, dropAsPreferenceSchema, pasteEnumValues, pasteAsPreferenceSchema, editorConfiguration3, DropOrPasteSchemaContribution };
