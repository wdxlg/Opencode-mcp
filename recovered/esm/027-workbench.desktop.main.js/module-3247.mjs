// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/common/extensionPoint.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { languagesExtPoint } from "./module-1357.mjs";
import { Disposable } from "./module-0012.mjs";
import { coalesce } from "./module-0007.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/customEditor/common/extensionPoint.ts
var Fields = Object.freeze({
  viewType: "viewType",
  displayName: "displayName",
  selector: "selector",
  priority: "priority"
});

var PriorityFields = Object.freeze({
  textEditor: "textEditor",
  diffEditor: "diffEditor"
});

var customEditorPrioritySchema = {
  type: "string",
  enum: [
    "default" /* default */,
    "option" /* option */,
    "explicit" /* explicit */
  ],
  markdownEnumDescriptions: [
    localize(14089, null),
    localize(14092, null),
    localize(14091, null)
  ]
};

var customEditorsContributionSchema = {
  type: "object",
  required: [
    Fields.viewType,
    Fields.displayName,
    Fields.selector
  ],
  additionalProperties: false,
  properties: {
    [Fields.viewType]: {
      type: "string",
      markdownDescription: localize(14096, null)
    },
    [Fields.displayName]: {
      type: "string",
      description: localize(14087, null)
    },
    [Fields.selector]: {
      type: "array",
      description: localize(14094, null),
      items: {
        type: "object",
        defaultSnippets: [{
          body: {
            filenamePattern: "$1"
          }
        }],
        additionalProperties: false,
        properties: {
          filenamePattern: {
            type: "string",
            description: localize(14095, null)
          }
        }
      }
    },
    [Fields.priority]: {
      markdownDescription: localize(14088, null),
      anyOf: [
        customEditorPrioritySchema,
        {
          type: "object",
          required: [PriorityFields.textEditor],
          additionalProperties: false,
          properties: {
            [PriorityFields.textEditor]: {
              ...customEditorPrioritySchema,
              markdownDescription: localize(14093, null)
            },
            [PriorityFields.diffEditor]: {
              ...customEditorPrioritySchema,
              markdownDescription: localize(14090, null)
            }
          }
        }
      ],
      default: "default" /* default */
    }
  }
};

var customEditorsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "customEditors",
  deps: [languagesExtPoint],
  jsonSchema: {
    description: localize(14086, null),
    type: "array",
    defaultSnippets: [{
      body: [{
        [Fields.viewType]: "$1",
        [Fields.displayName]: "$2",
        [Fields.selector]: [{
          filenamePattern: "$3"
        }]
      }]
    }],
    items: customEditorsContributionSchema
  },
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      const viewType = contrib[Fields.viewType];
      if (viewType) {
        yield `onCustomEditor:${viewType}`;
      }
    }
  }
});

var CustomEditorsDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.customEditors;
  }
  render(manifest) {
    const customEditors = manifest.contributes?.customEditors || [];
    if (!customEditors.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(14100, null),
      localize(14099, null),
      localize(14098, null)
    ];
    const rows = customEditors.map((customEditor) => {
      return [
        customEditor.viewType,
        renderPriority(customEditor.priority),
        coalesce(customEditor.selector.map((x) => x.filenamePattern)).join(", ")
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

function renderPriority(priority) {
  if (!priority) {
    return "";
  }
  if (typeof priority === "string") {
    return priority;
  }
  return coalesce([
    priority.textEditor ? `textEditor: ${priority.textEditor}` : void 0,
    priority.diffEditor ? `diffEditor: ${priority.diffEditor}` : void 0
  ]).join(", ");
}

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "customEditors",
  label: localize(14097, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(CustomEditorsDataRenderer)
});
export { renderPriority, Fields, PriorityFields, customEditorPrioritySchema, customEditorsContributionSchema, customEditorsExtensionPoint, CustomEditorsDataRenderer };
