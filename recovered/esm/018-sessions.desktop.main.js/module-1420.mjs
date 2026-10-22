// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpConfiguration.ts
import { localize } from "./module-0001.mjs";
import { mcpSchemaId } from "./module-1198.mjs";
import { inputsSchema } from "./module-1419.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/contrib/mcp/common/mcpConfiguration.ts
var mcpActivationEventPrefix = "onMcpCollection:";

var mcpActivationEvent = (contributedCollectionId) => mcpActivationEventPrefix + contributedCollectionId;

var allDiscoverySources = Object.keys({
  ["claude-desktop" /* ClaudeDesktop */]: true,
  ["windsurf" /* Windsurf */]: true,
  ["cursor-global" /* CursorGlobal */]: true,
  ["cursor-workspace" /* CursorWorkspace */]: true
});

var discoverySourceLabel = {
  ["claude-desktop" /* ClaudeDesktop */]: localize(17134, null),
  ["windsurf" /* Windsurf */]: localize(17140, null),
  ["cursor-global" /* CursorGlobal */]: localize(17136, null),
  ["cursor-workspace" /* CursorWorkspace */]: localize(17138, null)
};

var discoverySourceSettingsLabel = {
  ["claude-desktop" /* ClaudeDesktop */]: localize(17135, null),
  ["windsurf" /* Windsurf */]: localize(17141, null),
  ["cursor-global" /* CursorGlobal */]: localize(17137, null),
  ["cursor-workspace" /* CursorWorkspace */]: localize(17139, null)
};

var mcpConfigurationSection = "mcp";

var mcpDiscoverySection = "chat.mcp.discovery.enabled";

var mcpServerSamplingSection = "chat.mcp.serverSampling";

var mcpServerCollisionBehaviorSection = "chat.mcp.collisionBehavior";

var mcpEnterpriseManagedAuthIdpSection = "mcp.enterpriseManagedAuth.idp";

var mcpSchemaExampleServers = {
  "mcp-server-time": {
    command: "python",
    args: ["-m", "mcp_server_time", "--local-timezone=America/Los_Angeles"],
    env: {}
  }
};

var httpSchemaExamples = {
  "my-mcp-server": {
    url: "http://localhost:3001/mcp",
    headers: {}
  }
};

var mcpDevModeProps = (stdio) => ({
  dev: {
    type: "object",
    markdownDescription: localize(17106, null),
    examples: [{ watch: "src/**/*.ts", debug: { type: "node" } }],
    properties: {
      watch: {
        description: localize(17111, null),
        examples: ["src/**/*.ts"],
        oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }]
      },
      ...stdio && {
        debug: {
          markdownDescription: localize(17107, null),
          oneOf: [
            {
              type: "object",
              required: ["type"],
              properties: {
                type: {
                  type: "string",
                  enum: ["node"],
                  description: localize(17109, null)
                }
              },
              additionalProperties: false
            },
            {
              type: "object",
              required: ["type"],
              properties: {
                type: {
                  type: "string",
                  enum: ["debugpy"],
                  description: localize(17110, null)
                },
                debugpyPath: {
                  type: "string",
                  description: localize(17108, null)
                }
              },
              additionalProperties: false
            }
          ]
        }
      }
    }
  }
});

var mcpStdioServerSchema = {
  type: "object",
  additionalProperties: false,
  examples: [mcpSchemaExampleServers["mcp-server-time"]],
  properties: {
    type: {
      type: "string",
      enum: ["stdio"],
      description: localize(17130, null)
    },
    sandboxEnabled: {
      type: "boolean",
      default: false,
      description: localize(17128, null)
    },
    command: {
      type: "string",
      description: localize(17114, null)
    },
    cwd: {
      type: "string",
      description: localize(17115, null),
      examples: ["${workspaceFolder}"]
    },
    args: {
      type: "array",
      description: localize(17105, null),
      items: {
        type: "string"
      }
    },
    envFile: {
      type: "string",
      description: localize(17113, null),
      examples: ["${workspaceFolder}/.env"]
    },
    env: {
      description: localize(17112, null),
      additionalProperties: {
        anyOf: [
          { type: "null" },
          { type: "string" },
          { type: "number" }
        ]
      }
    },
    ...mcpDevModeProps(true)
  }
};

var mcpServerSchema = {
  id: mcpSchemaId,
  type: "object",
  title: localize(17129, null),
  allowTrailingCommas: true,
  allowComments: true,
  additionalProperties: false,
  properties: {
    sandbox: {
      description: localize(17120, null),
      type: "object",
      additionalProperties: false,
      properties: {
        network: {
          description: localize(17125, null),
          type: "object",
          additionalProperties: false,
          properties: {
            allowedDomains: {
              description: localize(17126, null),
              type: "array",
              items: { type: "string" },
              default: []
            },
            deniedDomains: {
              description: localize(17127, null),
              type: "array",
              items: { type: "string" },
              default: []
            }
          }
        },
        filesystem: {
          description: localize(17121, null),
          type: "object",
          additionalProperties: false,
          properties: {
            denyRead: {
              description: localize(17123, null),
              type: "array",
              items: { type: "string" },
              default: []
            },
            allowWrite: {
              description: localize(17122, null),
              type: "array",
              items: { type: "string" },
              default: []
            },
            denyWrite: {
              description: localize(17124, null),
              type: "array",
              items: { type: "string" },
              default: []
            }
          }
        }
      }
    },
    servers: {
      examples: [
        mcpSchemaExampleServers,
        httpSchemaExamples
      ],
      additionalProperties: {
        oneOf: [
          mcpStdioServerSchema,
          {
            type: "object",
            additionalProperties: false,
            required: ["url"],
            examples: [httpSchemaExamples["my-mcp-server"]],
            properties: {
              type: {
                type: "string",
                enum: ["http", "sse"],
                description: localize(17130, null)
              },
              url: {
                type: "string",
                format: "uri",
                pattern: "^https?:\\/\\/.+",
                patternErrorMessage: localize(17132, null),
                description: localize(17131, null)
              },
              headers: {
                type: "object",
                description: localize(17116, null),
                additionalProperties: { type: "string" }
              },
              oauth: {
                type: "object",
                description: localize(17117, null),
                additionalProperties: false,
                minProperties: 1,
                properties: {
                  clientId: {
                    type: "string",
                    minLength: 1,
                    markdownDescription: localize(17118, null)
                  },
                  enterpriseManaged: {
                    type: "boolean",
                    default: false,
                    markdownDescription: localize(17119, null)
                  }
                }
              },
              ...mcpDevModeProps(false)
            }
          }
        ]
      }
    },
    inputs: inputsSchema.definitions.inputs
  }
};

var mcpContributionPoint = {
  extensionPoint: "mcpServerDefinitionProviders",
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      if (contrib.id) {
        yield mcpActivationEvent(contrib.id);
      }
    }
  },
  jsonSchema: {
    description: localize(17144, null),
    type: "array",
    defaultSnippets: [{ body: [{ id: "", label: "" }] }],
    items: {
      additionalProperties: false,
      type: "object",
      defaultSnippets: [{ body: { id: "", label: "" } }],
      properties: {
        id: {
          description: localize(17145, null),
          type: "string"
        },
        label: {
          description: localize(17146, null),
          type: "string"
        },
        when: {
          description: localize(17147, null),
          type: "string"
        }
      }
    }
  }
};

var McpServerDefinitionsProviderRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.mcpServerDefinitionProviders && Array.isArray(manifest.contributes.mcpServerDefinitionProviders) && manifest.contributes.mcpServerDefinitionProviders.length > 0;
  }
  render(manifest) {
    const mcpServerDefinitionProviders = manifest.contributes?.mcpServerDefinitionProviders ?? [];
    const headers = [localize(17133, null), localize(17143, null)];
    const rows = mcpServerDefinitionProviders.map((mcpServerDefinitionProvider) => {
      return [
        new MarkdownString().appendMarkdown(`\`${mcpServerDefinitionProvider.id}\``),
        mcpServerDefinitionProvider.label
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
  id: mcpConfigurationSection,
  label: localize(17142, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(McpServerDefinitionsProviderRenderer)
});
export { mcpActivationEventPrefix, mcpActivationEvent, allDiscoverySources, discoverySourceLabel, discoverySourceSettingsLabel, mcpConfigurationSection, mcpDiscoverySection, mcpServerSamplingSection, mcpServerCollisionBehaviorSection, mcpEnterpriseManagedAuthIdpSection, mcpSchemaExampleServers, httpSchemaExamples, mcpDevModeProps, mcpStdioServerSchema, mcpServerSchema, mcpContributionPoint, McpServerDefinitionsProviderRenderer };
