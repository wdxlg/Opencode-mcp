// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookExtensionPoint.ts
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0878.mjs";
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookExtensionPoint.ts
var NotebookEditorContribution = Object.freeze({
  type: "type",
  displayName: "displayName",
  selector: "selector",
  priority: "priority"
});

var NotebookRendererContribution = Object.freeze({
  id: "id",
  displayName: "displayName",
  mimeTypes: "mimeTypes",
  entrypoint: "entrypoint",
  hardDependencies: "dependencies",
  optionalDependencies: "optionalDependencies",
  requiresMessaging: "requiresMessaging"
});

var NotebookPreloadContribution = Object.freeze({
  type: "type",
  entrypoint: "entrypoint",
  localResourceRoots: "localResourceRoots"
});

var notebookProviderContribution = {
  description: localize(17796, null),
  type: "array",
  defaultSnippets: [{ body: [{ type: "", displayName: "", "selector": [{ "filenamePattern": "" }] }] }],
  items: {
    type: "object",
    required: [
      NotebookEditorContribution.type,
      NotebookEditorContribution.displayName,
      NotebookEditorContribution.selector
    ],
    properties: {
      [NotebookEditorContribution.type]: {
        type: "string",
        description: localize(17800, null)
      },
      [NotebookEditorContribution.displayName]: {
        type: "string",
        description: localize(17797, null)
      },
      [NotebookEditorContribution.selector]: {
        type: "array",
        description: localize(17798, null),
        items: {
          type: "object",
          properties: {
            filenamePattern: {
              type: "string",
              description: localize(17799, null)
            },
            excludeFileNamePattern: {
              type: "string",
              description: localize(17813, null)
            }
          }
        }
      },
      [NotebookEditorContribution.priority]: {
        type: "string",
        markdownDeprecationMessage: localize(17818, null),
        enum: [
          "default" /* default */,
          "option" /* option */
        ],
        markdownEnumDescriptions: [
          localize(17819, null),
          localize(17820, null)
        ],
        default: "default"
      }
    }
  }
};

var defaultRendererSnippet = Object.freeze({ id: "", displayName: "", mimeTypes: [""], entrypoint: "" });

var notebookRendererContribution = {
  description: localize(17801, null),
  type: "array",
  defaultSnippets: [{ body: [defaultRendererSnippet] }],
  items: {
    defaultSnippets: [{ body: defaultRendererSnippet }],
    allOf: [
      {
        type: "object",
        required: [
          NotebookRendererContribution.id,
          NotebookRendererContribution.displayName
        ],
        properties: {
          [NotebookRendererContribution.id]: {
            type: "string",
            description: localize(17811, null)
          },
          [NotebookRendererContribution.displayName]: {
            type: "string",
            description: localize(17802, null)
          },
          [NotebookRendererContribution.hardDependencies]: {
            type: "array",
            uniqueItems: true,
            items: { type: "string" },
            markdownDescription: localize(17805, null)
          },
          [NotebookRendererContribution.optionalDependencies]: {
            type: "array",
            uniqueItems: true,
            items: { type: "string" },
            markdownDescription: localize(17806, null)
          },
          [NotebookRendererContribution.requiresMessaging]: {
            default: "never",
            enum: [
              "always",
              "optional",
              "never"
            ],
            enumDescriptions: [
              localize(17808, null),
              localize(17810, null),
              localize(17809, null)
            ],
            description: localize(17807, null)
          }
        }
      },
      {
        oneOf: [
          {
            required: [
              NotebookRendererContribution.entrypoint,
              NotebookRendererContribution.mimeTypes
            ],
            properties: {
              [NotebookRendererContribution.mimeTypes]: {
                type: "array",
                description: localize(17812, null),
                items: {
                  type: "string"
                }
              },
              [NotebookRendererContribution.entrypoint]: {
                description: localize(17803, null),
                type: "string"
              }
            }
          },
          {
            required: [
              NotebookRendererContribution.entrypoint
            ],
            properties: {
              [NotebookRendererContribution.entrypoint]: {
                description: localize(17803, null),
                type: "object",
                required: ["extends", "path"],
                properties: {
                  extends: {
                    type: "string",
                    description: localize(17804, null)
                  },
                  path: {
                    type: "string",
                    description: localize(17803, null)
                  }
                }
              }
            }
          }
        ]
      }
    ]
  }
};

var notebookPreloadContribution = {
  description: localize(17816, null),
  type: "array",
  defaultSnippets: [{ body: [{ type: "", entrypoint: "" }] }],
  items: {
    type: "object",
    required: [
      NotebookPreloadContribution.type,
      NotebookPreloadContribution.entrypoint
    ],
    properties: {
      [NotebookPreloadContribution.type]: {
        type: "string",
        description: localize(17817, null)
      },
      [NotebookPreloadContribution.entrypoint]: {
        type: "string",
        description: localize(17814, null)
      },
      [NotebookPreloadContribution.localResourceRoots]: {
        type: "array",
        items: { type: "string" },
        description: localize(17815, null)
      }
    }
  }
};

var notebooksExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "notebooks",
  jsonSchema: notebookProviderContribution,
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      if (contrib.type) {
        yield `onNotebookSerializer:${contrib.type}`;
      }
    }
  }
});

var notebookRendererExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "notebookRenderer",
  jsonSchema: notebookRendererContribution,
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      if (contrib.id) {
        yield `onRenderer:${contrib.id}`;
      }
    }
  }
});

var notebookPreloadExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "notebookPreload",
  jsonSchema: notebookPreloadContribution
});

var NotebooksDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.notebooks;
  }
  render(manifest) {
    const contrib = manifest.contributes?.notebooks || [];
    if (!contrib.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(17821, null),
      localize(17823, null)
    ];
    const rows = contrib.sort((a, b) => a.type.localeCompare(b.type)).map((notebook) => {
      return [
        notebook.type,
        notebook.displayName
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

var NotebookRenderersDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.notebookRenderer;
  }
  render(manifest) {
    const contrib = manifest.contributes?.notebookRenderer || [];
    if (!contrib.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(17824, null),
      localize(17822, null)
    ];
    const rows = contrib.sort((a, b) => a.displayName.localeCompare(b.displayName)).map((notebookRenderer) => {
      return [
        notebookRenderer.displayName,
        notebookRenderer.mimeTypes.join(",")
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
  id: "notebooks",
  label: localize(17826, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(NotebooksDataRenderer)
});

Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "notebookRenderer",
  label: localize(17825, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(NotebookRenderersDataRenderer)
});
export { NotebookEditorContribution, NotebookRendererContribution, NotebookPreloadContribution, notebookProviderContribution, defaultRendererSnippet, notebookRendererContribution, notebookPreloadContribution, notebooksExtensionPoint, notebookRendererExtensionPoint, notebookPreloadExtensionPoint, NotebooksDataRenderer, NotebookRenderersDataRenderer };
