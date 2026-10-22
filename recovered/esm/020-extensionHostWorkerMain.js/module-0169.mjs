// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionsRegistry.ts
import { Registry } from "./module-0090.mjs";
import { Extensions } from "./module-0134.mjs";
import { EXTENSION_CATEGORIES, ExtensionIdentifierSet } from "./module-0040.mjs";
import { onUnexpectedError } from "./module-0002.mjs";
import { localize } from "./module-0015.mjs";
import { allApiProposals } from "./module-0168.mjs";
import { EXTENSION_IDENTIFIER_PATTERN } from "./module-0163.mjs";
import { ImplicitActivationEvents } from "./module-0166.mjs";
import { productSchemaId } from "./module-0132.mjs";


// src/vs/workbench/services/extensions/common/extensionsRegistry.ts
var schemaRegistry = Registry.as(Extensions.JSONContribution);

var ExtensionPointUserDelta = class _ExtensionPointUserDelta {
  constructor(added, removed) {
    this.added = added;
    this.removed = removed;
  }
  static _toSet(arr) {
    const result = new ExtensionIdentifierSet();
    for (let i = 0, len = arr.length; i < len; i++) {
      result.add(arr[i].description.identifier);
    }
    return result;
  }
  static compute(previous, current) {
    if (!previous || !previous.length) {
      return new _ExtensionPointUserDelta(current, []);
    }
    if (!current || !current.length) {
      return new _ExtensionPointUserDelta([], previous);
    }
    const previousSet = this._toSet(previous);
    const currentSet = this._toSet(current);
    const added = current.filter((user) => !previousSet.has(user.description.identifier));
    const removed = previous.filter((user) => !currentSet.has(user.description.identifier));
    return new _ExtensionPointUserDelta(added, removed);
  }
};

var ExtensionPoint = class {
  constructor(name2, defaultExtensionKind, canHandleResolver) {
    this.name = name2;
    this.defaultExtensionKind = defaultExtensionKind;
    this.canHandleResolver = canHandleResolver;
    this._handler = null;
    this._users = null;
    this._delta = null;
  }
  setHandler(handler) {
    if (this._handler !== null) {
      throw new Error("Handler already set!");
    }
    this._handler = handler;
    this._handle();
    return {
      dispose: () => {
        this._handler = null;
      }
    };
  }
  acceptUsers(users) {
    this._delta = ExtensionPointUserDelta.compute(this._users, users);
    this._users = users;
    this._handle();
  }
  _handle() {
    if (this._handler === null || this._users === null || this._delta === null) {
      return;
    }
    try {
      this._handler(this._users, this._delta);
    } catch (err) {
      onUnexpectedError(err);
    }
  }
};

var extensionKindSchema = {
  type: "string",
  enum: [
    "ui",
    "workspace"
  ],
  enumDescriptions: [
    localize(23043, null),
    localize(23123, null)
  ]
};

var schemaId = "vscode://schemas/vscode-extensions";

var schema = {
  properties: {
    engines: {
      type: "object",
      description: localize(23107, null),
      properties: {
        "vscode": {
          type: "string",
          description: localize(23108, null),
          default: "^1.105.0"
        }
      }
    },
    publisher: {
      description: localize(23119, null),
      type: "string"
    },
    displayName: {
      description: localize(23104, null),
      type: "string"
    },
    categories: {
      description: localize(23098, null),
      type: "array",
      uniqueItems: true,
      items: {
        oneOf: [
          {
            type: "string",
            enum: EXTENSION_CATEGORIES
          },
          {
            type: "string",
            const: "Languages",
            deprecationMessage: localize(23099, null)
          }
        ]
      }
    },
    galleryBanner: {
      type: "object",
      description: localize(23111, null),
      properties: {
        color: {
          description: localize(23112, null),
          type: "string"
        },
        theme: {
          description: localize(23113, null),
          type: "string",
          enum: ["dark", "light"]
        }
      }
    },
    contributes: {
      description: localize(23100, null),
      type: "object",
      // eslint-disable-next-line local/code-no-any-casts
      properties: {
        // extensions will fill in
      },
      default: {}
    },
    preview: {
      type: "boolean",
      description: localize(23117, null)
    },
    enableProposedApi: {
      type: "boolean",
      deprecationMessage: localize(23106, null)
    },
    enabledApiProposals: {
      markdownDescription: localize(23105, null),
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: Object.keys(allApiProposals).map((proposalName) => proposalName),
        markdownEnumDescriptions: Object.values(allApiProposals).map((value) => value.proposal)
      }
    },
    api: {
      markdownDescription: localize(23078, null),
      type: "string",
      enum: ["none"],
      enumDescriptions: [
        localize(23079, null)
      ]
    },
    activationEvents: {
      description: localize(23044, null),
      type: "array",
      items: {
        type: "string",
        defaultSnippets: [
          {
            label: "onWebviewPanel",
            description: localize(23075, null),
            body: "onWebviewPanel:viewType"
          },
          {
            label: "onLanguage",
            description: localize(23058, null),
            body: "onLanguage:${1:languageId}"
          },
          {
            label: "onCommand",
            description: localize(23048, null),
            body: "onCommand:${2:commandId}"
          },
          {
            label: "onDebug",
            description: localize(23050, null),
            body: "onDebug"
          },
          {
            label: "onDebugInitialConfigurations",
            description: localize(23053, null),
            body: "onDebugInitialConfigurations"
          },
          {
            label: "onDebugDynamicConfigurations",
            description: localize(23052, null),
            body: "onDebugDynamicConfigurations"
          },
          {
            label: "onDebugResolve",
            description: localize(23054, null),
            body: "onDebugResolve:${6:type}"
          },
          {
            label: "onDebugAdapterProtocolTracker",
            description: localize(23051, null),
            body: "onDebugAdapterProtocolTracker:${6:type}"
          },
          {
            label: "workspaceContains",
            description: localize(23077, null),
            body: "workspaceContains:${4:filePattern}"
          },
          {
            label: "onStartupFinished",
            description: localize(23066, null),
            body: "onStartupFinished"
          },
          {
            label: "onTaskType",
            description: localize(23067, null),
            body: "onTaskType:${1:taskType}"
          },
          {
            label: "onFileSystem",
            description: localize(23056, null),
            body: "onFileSystem:${1:scheme}"
          },
          {
            label: "onEditSession",
            description: localize(23055, null),
            body: "onEditSession:${1:scheme}"
          },
          {
            label: "onSearch",
            description: localize(23065, null),
            body: "onSearch:${7:scheme}"
          },
          {
            label: "onView",
            body: "onView:${5:viewId}",
            description: localize(23073, null)
          },
          {
            label: "onUri",
            body: "onUri",
            description: localize(23072, null)
          },
          {
            label: "onOpenExternalUri",
            body: "onOpenExternalUri",
            description: localize(23063, null)
          },
          {
            label: "onCustomEditor",
            body: "onCustomEditor:${9:viewType}",
            description: localize(23049, null)
          },
          {
            label: "onNotebook",
            body: "onNotebook:${1:type}",
            description: localize(23062, null)
          },
          {
            label: "onAuthenticationRequest",
            body: "onAuthenticationRequest:${11:authenticationProviderId}",
            description: localize(23045, null)
          },
          {
            label: "onRenderer",
            description: localize(23064, null),
            body: "onRenderer:${11:rendererId}"
          },
          {
            label: "onTerminalProfile",
            body: "onTerminalProfile:${1:terminalId}",
            description: localize(23069, null)
          },
          {
            label: "onTerminalQuickFixRequest",
            body: "onTerminalQuickFixRequest:${1:quickFixId}",
            description: localize(23070, null)
          },
          {
            label: "onWalkthrough",
            body: "onWalkthrough:${1:walkthroughID}",
            description: localize(23074, null)
          },
          {
            label: "onIssueReporterOpened",
            body: "onIssueReporterOpened",
            description: localize(23057, null)
          },
          {
            label: "onChatParticipant",
            body: "onChatParticipant:${1:participantId}",
            description: localize(23047, null)
          },
          {
            label: "onChatContextProvider",
            body: "onChatContextProvider:${1:contextProviderId}",
            description: localize(23046, null)
          },
          {
            label: "onLanguageModelChatProvider",
            body: "onLanguageModelChatProvider:${1:vendor}",
            description: localize(23059, null)
          },
          {
            label: "onLanguageModelTool",
            body: "onLanguageModelTool:${1:toolId}",
            description: localize(23060, null)
          },
          {
            label: "onTerminal",
            body: "onTerminal:{1:shellType}",
            description: localize(23068, null)
          },
          {
            label: "onTerminalShellIntegration",
            body: "onTerminalShellIntegration:${1:shellType}",
            description: localize(23071, null)
          },
          {
            label: "onMcpCollection",
            description: localize(23061, null),
            body: "onMcpCollection:${2:collectionId}"
          },
          {
            label: "*",
            description: localize(23076, null),
            body: "*"
          }
        ]
      }
    },
    badges: {
      type: "array",
      description: localize(23080, null),
      items: {
        type: "object",
        required: ["url", "href", "description"],
        properties: {
          url: {
            type: "string",
            description: localize(23083, null)
          },
          href: {
            type: "string",
            description: localize(23082, null)
          },
          description: {
            type: "string",
            description: localize(23081, null)
          }
        }
      }
    },
    markdown: {
      type: "string",
      description: localize(23116, null),
      enum: ["github", "standard"],
      default: "github"
    },
    qna: {
      default: "marketplace",
      description: localize(23120, null),
      anyOf: [
        {
          type: ["string", "boolean"],
          enum: ["marketplace", false]
        },
        {
          type: "string"
        }
      ]
    },
    extensionDependencies: {
      description: localize(23110, null),
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN
      }
    },
    extensionAffinity: {
      description: localize(23109, null),
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN
      }
    },
    extensionPack: {
      description: localize(23101, null),
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        pattern: EXTENSION_IDENTIFIER_PATTERN
      }
    },
    extensionKind: {
      description: localize(23036, null),
      type: "array",
      items: extensionKindSchema,
      default: ["workspace"],
      defaultSnippets: [
        {
          body: ["ui"],
          description: localize(23038, null)
        },
        {
          body: ["workspace"],
          description: localize(23040, null)
        },
        {
          body: ["ui", "workspace"],
          description: localize(23039, null)
        },
        {
          body: ["workspace", "ui"],
          description: localize(23041, null)
        },
        {
          body: [],
          description: localize(23037, null)
        }
      ]
    },
    capabilities: {
      description: localize(23084, null),
      type: "object",
      properties: {
        virtualWorkspaces: {
          description: localize(23092, null),
          type: ["boolean", "object"],
          defaultSnippets: [
            { label: "limited", body: { supported: "${1:limited}", description: "${2}" } },
            { label: "false", body: { supported: false, description: "${2}" } }
          ],
          default: true.valueOf,
          properties: {
            supported: {
              markdownDescription: localize(23094, null),
              type: ["string", "boolean"],
              enum: ["limited", true, false],
              enumDescriptions: [
                localize(23096, null),
                localize(23097, null),
                localize(23095, null)
              ]
            },
            description: {
              type: "string",
              markdownDescription: localize(23093, null)
            }
          }
        },
        untrustedWorkspaces: {
          description: localize(23085, null),
          type: "object",
          required: ["supported"],
          defaultSnippets: [
            { body: { supported: "${1:limited}", description: "${2}" } }
          ],
          properties: {
            supported: {
              markdownDescription: localize(23088, null),
              type: ["string", "boolean"],
              enum: ["limited", true, false],
              enumDescriptions: [
                localize(23090, null),
                localize(23091, null),
                localize(23089, null)
              ]
            },
            restrictedConfigurations: {
              description: localize(23087, null),
              type: "array",
              items: {
                type: "string"
              }
            },
            description: {
              type: "string",
              markdownDescription: localize(23086, null)
            }
          }
        }
      }
    },
    sponsor: {
      description: localize(23102, null),
      type: "object",
      defaultSnippets: [
        { body: { url: "${1:https:}" } }
      ],
      properties: {
        "url": {
          description: localize(23103, null),
          type: "string"
        }
      }
    },
    scripts: {
      type: "object",
      properties: {
        "vscode:prepublish": {
          description: localize(23121, null),
          type: "string"
        },
        "vscode:uninstall": {
          description: localize(23122, null),
          type: "string"
        }
      }
    },
    icon: {
      type: "string",
      description: localize(23114, null)
    },
    l10n: {
      type: "string",
      description: localize(23115, null)
    },
    pricing: {
      type: "string",
      markdownDescription: localize(23118, null),
      enum: ["Free", "Trial"],
      default: "Free"
    }
  }
};

var ExtensionsRegistryImpl = class {
  constructor() {
    this._extensionPoints = /* @__PURE__ */ new Map();
  }
  registerExtensionPoint(desc) {
    if (this._extensionPoints.has(desc.extensionPoint)) {
      throw new Error("Duplicate extension point: " + desc.extensionPoint);
    }
    const result = new ExtensionPoint(desc.extensionPoint, desc.defaultExtensionKind, desc.canHandleResolver);
    this._extensionPoints.set(desc.extensionPoint, result);
    if (desc.activationEventsGenerator) {
      ImplicitActivationEvents.register(desc.extensionPoint, desc.activationEventsGenerator);
    }
    schema.properties["contributes"].properties[desc.extensionPoint] = desc.jsonSchema;
    schemaRegistry.registerSchema(schemaId, schema);
    return result;
  }
  getExtensionPoints() {
    return Array.from(this._extensionPoints.values());
  }
};

var PRExtensions = {
  ExtensionsRegistry: "ExtensionsRegistry"
};

Registry.add(PRExtensions.ExtensionsRegistry, new ExtensionsRegistryImpl());

var ExtensionsRegistry = Registry.as(PRExtensions.ExtensionsRegistry);

schemaRegistry.registerSchema(schemaId, schema);

schemaRegistry.registerSchema(productSchemaId, {
  properties: {
    extensionEnabledApiProposals: {
      description: localize(23042, null),
      type: "object",
      properties: {},
      additionalProperties: {
        anyOf: [{
          type: "array",
          uniqueItems: true,
          items: {
            type: "string",
            enum: Object.keys(allApiProposals),
            markdownEnumDescriptions: Object.values(allApiProposals).map((value) => value.proposal)
          }
        }]
      }
    }
  }
});
export { schemaRegistry, ExtensionPointUserDelta, ExtensionPoint, extensionKindSchema, schemaId, schema, ExtensionsRegistryImpl, PRExtensions, ExtensionsRegistry };
