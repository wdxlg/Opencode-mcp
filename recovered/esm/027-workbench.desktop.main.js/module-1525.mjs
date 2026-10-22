// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/configurationExtensionPoint.ts
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { EXTENSION_UNIFICATION_EXTENSION_IDS, Extensions4, OVERRIDE_PROPERTY_REGEX, configurationDefaultsSchemaId, getAllConfigurationProperties, getDefaultValue, overrideIdentifiersFromKey, parseScope, validateProperty } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { deepClone } from "./module-0098.mjs";
import { ExtensionIdentifierMap } from "./module-0688.mjs";
import { product_default } from "./module-0139.mjs";
import { hasKey, isObject, isUndefined } from "./module-0010.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { MCP_CONFIGURATION_KEY, launchSchemaId, mcpSchemaId, tasksSchemaId, workspaceSettingsSchemaId } from "./module-1198.mjs";
import { Disposable } from "./module-0012.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Extensions11 } from "./module-0877.mjs";
import { SyncDescriptor } from "./module-0134.mjs";


// src/vs/workbench/api/common/configurationExtensionPoint.ts
var jsonRegistry = Registry.as(Extensions3.JSONContribution);

var configurationRegistry7 = Registry.as(Extensions4.Configuration);

var configurationEntrySchema = {
  type: "object",
  defaultSnippets: [{ body: { title: "", properties: {} } }],
  properties: {
    title: {
      description: localize(5860, null),
      type: "string"
    },
    order: {
      description: localize(5856, null),
      type: "integer"
    },
    properties: {
      description: localize(5857, null),
      type: "object",
      propertyNames: {
        pattern: "\\S+",
        patternErrorMessage: localize(5859, null)
      },
      additionalProperties: {
        anyOf: [
          {
            title: localize(5858, null),
            $ref: "http://json-schema.org/draft-07/schema#"
          },
          {
            type: "object",
            properties: {
              scope: {
                type: "string",
                enum: ["application", "machine", "window", "resource", "language-overridable", "machine-overridable"],
                default: "window",
                enumDescriptions: [
                  localize(5828, null),
                  localize(5838, null),
                  localize(5847, null),
                  localize(5844, null),
                  localize(5836, null),
                  localize(5837, null)
                ],
                markdownDescription: localize(5830, null)
              },
              enumDescriptions: {
                type: "array",
                items: {
                  type: "string"
                },
                description: localize(5832, null)
              },
              markdownEnumDescriptions: {
                type: "array",
                items: {
                  type: "string"
                },
                description: localize(5841, null)
              },
              enumItemLabels: {
                type: "array",
                items: {
                  type: "string"
                },
                markdownDescription: localize(5833, null, "`enum`")
              },
              markdownDescription: {
                type: "string",
                description: localize(5840, null)
              },
              deprecationMessage: {
                type: "string",
                description: localize(5829, null)
              },
              markdownDeprecationMessage: {
                type: "string",
                description: localize(5839, null)
              },
              editPresentation: {
                type: "string",
                enum: ["singlelineText", "multilineText"],
                enumDescriptions: [
                  localize(5845, null),
                  localize(5842, null)
                ],
                default: "singlelineText",
                description: localize(5831, null)
              },
              order: {
                type: "integer",
                description: localize(5843, null)
              },
              ignoreSync: {
                type: "boolean",
                description: localize(5834, null)
              },
              keywords: {
                type: "array",
                items: {
                  type: "string"
                },
                description: localize(5835, null)
              },
              tags: {
                type: "array",
                items: {
                  type: "string",
                  enum: [
                    "accessibility",
                    "advanced",
                    "experimental",
                    "telemetry",
                    "usesOnlineServices"
                  ],
                  enumDescriptions: [
                    localize(5808, null),
                    localize(5809, null),
                    localize(5818, null),
                    localize(5824, null),
                    localize(5852, null),
                    localize(5854, null)
                  ]
                },
                additionalItems: true,
                markdownDescription: localize(5846, null)
              },
              agentsWindow: {
                type: "object",
                markdownDescription: localize(5825, null),
                properties: {
                  "default": {
                    description: localize(5826, null)
                  },
                  readOnly: {
                    type: "boolean",
                    description: localize(5827, null),
                    default: false
                  }
                },
                additionalProperties: false
              }
            }
          }
        ]
      }
    }
  }
};

var _configDelta;

var defaultConfigurationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "configurationDefaults",
  jsonSchema: {
    $ref: configurationDefaultsSchemaId
  },
  canHandleResolver: true
});

defaultConfigurationExtPoint.setHandler((extensions, { added, removed }) => {
  if (_configDelta) {
    configurationRegistry7.deltaConfiguration(_configDelta);
  }
  const configNow = _configDelta = {};
  queueMicrotask(() => {
    if (_configDelta === configNow) {
      configurationRegistry7.deltaConfiguration(_configDelta);
      _configDelta = void 0;
    }
  });
  if (removed.length) {
    const removedDefaultConfigurations = removed.map((extension) => ({ overrides: deepClone(extension.value), source: { id: extension.description.identifier.value, displayName: extension.description.displayName } }));
    _configDelta.removedDefaults = removedDefaultConfigurations;
  }
  if (added.length) {
    const registeredProperties = configurationRegistry7.getConfigurationProperties();
    const allowedScopes = [7 /* MACHINE_OVERRIDABLE */, 4 /* WINDOW */, 5 /* RESOURCE */, 6 /* LANGUAGE_OVERRIDABLE */];
    const addedDefaultConfigurations = added.map((extension) => {
      const overrides = deepClone(extension.value);
      for (const key3 of Object.keys(overrides)) {
        const registeredPropertyScheme = registeredProperties[key3];
        if (registeredPropertyScheme?.disallowConfigurationDefault) {
          extension.collector.warn(localize(5814, null, key3));
          delete overrides[key3];
          continue;
        }
        if (!OVERRIDE_PROPERTY_REGEX.test(key3)) {
          if (registeredPropertyScheme?.scope && !allowedScopes.includes(registeredPropertyScheme.scope)) {
            extension.collector.warn(localize(5812, null, key3));
            delete overrides[key3];
            continue;
          }
        }
      }
      return { overrides, source: { id: extension.description.identifier.value, displayName: extension.description.displayName } };
    });
    _configDelta.addedDefaults = addedDefaultConfigurations;
  }
});

var configurationExtPoint3 = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "configuration",
  deps: [defaultConfigurationExtPoint],
  jsonSchema: {
    description: localize(5855, null),
    oneOf: [
      configurationEntrySchema,
      {
        type: "array",
        items: configurationEntrySchema
      }
    ]
  },
  canHandleResolver: true
});

var extensionConfigurations = new ExtensionIdentifierMap();

configurationExtPoint3.setHandler((extensions, { added, removed }) => {
  _configDelta ??= {};
  if (removed.length) {
    const removedConfigurations = [];
    for (const extension of removed) {
      removedConfigurations.push(...extensionConfigurations.get(extension.description.identifier) || []);
      extensionConfigurations.delete(extension.description.identifier);
    }
    _configDelta.removedConfigurations = removedConfigurations;
  }
  const seenProperties = /* @__PURE__ */ new Set();
  function handleConfiguration(node, extension) {
    const configuration2 = deepClone(node);
    if (configuration2.title && typeof configuration2.title !== "string") {
      extension.collector.error(localize(5822, null));
    }
    validateProperties(configuration2, extension);
    configuration2.id = node.id || extension.description.identifier.value;
    configuration2.extensionInfo = { id: extension.description.identifier.value, displayName: extension.description.displayName };
    configuration2.restrictedProperties = extension.description.capabilities?.untrustedWorkspaces?.supported === "limited" ? extension.description.capabilities?.untrustedWorkspaces.restrictedConfigurations : void 0;
    configuration2.title = configuration2.title || extension.description.displayName || extension.description.identifier.value;
    return configuration2;
  }
  function validateProperties(configuration2, extension) {
    const properties = configuration2.properties;
    const extensionConfigurationPolicy = product_default.extensionConfigurationPolicy;
    if (properties) {
      if (typeof properties !== "object") {
        extension.collector.error(localize(5820, null));
        configuration2.properties = {};
      }
      for (const key3 in properties) {
        const propertyConfiguration = properties[key3];
        const message = validateProperty(key3, propertyConfiguration, extension.description.identifier.value);
        if (message) {
          delete properties[key3];
          extension.collector.warn(message);
          continue;
        }
        if (seenProperties.has(key3) && !EXTENSION_UNIFICATION_EXTENSION_IDS.has(extension.description.identifier.value.toLowerCase())) {
          delete properties[key3];
          extension.collector.warn(localize(5813, null, key3));
          continue;
        }
        if (!isObject(propertyConfiguration)) {
          delete properties[key3];
          extension.collector.error(localize(5821, null, key3));
          continue;
        }
        const policyEntry = extensionConfigurationPolicy?.[key3];
        if (policyEntry) {
          if (hasKey(policyEntry, { policyReference: true })) {
            propertyConfiguration.policyReference = policyEntry.policyReference;
          } else {
            propertyConfiguration.policy = policyEntry;
          }
        }
        if (propertyConfiguration.tags?.some((tag2) => tag2.toLowerCase() === "onexp")) {
          propertyConfiguration.experiment = {
            mode: "startup"
          };
        }
        if (propertyConfiguration.agentsWindow && !isProposedApiEnabled(extension.description, "agentsWindowConfiguration")) {
          extension.collector.error(localize(5811, null, extension.description.identifier.value, key3));
          delete propertyConfiguration.agentsWindow;
        }
        if (propertyConfiguration.agentHost) {
          extension.collector.error(localize(5810, null, extension.description.identifier.value, key3));
          delete propertyConfiguration.agentHost;
        }
        seenProperties.add(key3);
        propertyConfiguration.scope = propertyConfiguration.scope ? parseScope(propertyConfiguration.scope.toString()) : 4 /* WINDOW */;
      }
    }
    const subNodes = configuration2.allOf;
    if (subNodes) {
      extension.collector.error(localize(5819, null));
      for (const node of subNodes) {
        validateProperties(node, extension);
      }
    }
  }
  if (added.length) {
    const addedConfigurations = [];
    for (const extension of added) {
      const configurations = [];
      const value2 = extension.value;
      if (Array.isArray(value2)) {
        value2.forEach((v2) => configurations.push(handleConfiguration(v2, extension)));
      } else {
        configurations.push(handleConfiguration(value2, extension));
      }
      extensionConfigurations.set(extension.description.identifier, configurations);
      addedConfigurations.push(...configurations);
    }
    _configDelta.addedConfigurations = addedConfigurations;
  }
  configurationRegistry7.deltaConfiguration(_configDelta);
  _configDelta = void 0;
});

jsonRegistry.registerSchema("vscode://schemas/workspaceConfig", {
  allowComments: true,
  allowTrailingCommas: true,
  default: {
    folders: [
      {
        path: ""
      }
    ],
    settings: {}
  },
  required: ["folders"],
  properties: {
    "folders": {
      minItems: 0,
      uniqueItems: true,
      description: localize(5862, null),
      items: {
        type: "object",
        defaultSnippets: [{ body: { path: "$1" } }],
        oneOf: [{
          properties: {
            path: {
              type: "string",
              description: localize(5866, null)
            },
            name: {
              type: "string",
              description: localize(5865, null)
            }
          },
          required: ["path"]
        }, {
          properties: {
            uri: {
              type: "string",
              description: localize(5871, null)
            },
            name: {
              type: "string",
              description: localize(5865, null)
            }
          },
          required: ["uri"]
        }]
      }
    },
    "settings": {
      type: "object",
      default: {},
      description: localize(5868, null),
      allOf: [
        { $ref: workspaceSettingsSchemaId },
        {
          properties: {
            [MCP_CONFIGURATION_KEY]: {
              type: "object",
              default: {
                inputs: [],
                servers: {
                  "mcp-server-time": {
                    command: "uvx",
                    args: ["mcp_server_time", "--local-timezone=America/Los_Angeles"]
                  }
                }
              },
              description: localize(5864, null),
              $ref: mcpSchemaId
            }
          }
        }
      ]
    },
    "launch": {
      type: "object",
      default: { configurations: [], compounds: [] },
      description: localize(5863, null),
      $ref: launchSchemaId
    },
    "tasks": {
      type: "object",
      default: { version: "2.0.0", tasks: [] },
      description: localize(5869, null),
      $ref: tasksSchemaId
    },
    "extensions": {
      type: "object",
      default: {},
      description: localize(5861, null),
      $ref: "vscode://schemas/extensions"
    },
    "remoteAuthority": {
      type: "string",
      doNotSuggest: true,
      description: localize(5867, null)
    },
    "transient": {
      type: "boolean",
      doNotSuggest: true,
      description: localize(5870, null)
    }
  },
  errorMessage: localize(5853, null)
});

var SettingsTableRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.configuration;
  }
  render(manifest) {
    const configuration2 = manifest.contributes?.configuration ? Array.isArray(manifest.contributes.configuration) ? manifest.contributes.configuration : [manifest.contributes.configuration] : [];
    const properties = getAllConfigurationProperties(configuration2);
    const contrib = properties ? Object.keys(properties) : [];
    const headers = [localize(5849, null), localize(5817, null), localize(5815, null)];
    const rows = contrib.sort((a, b) => a.localeCompare(b)).map((key3) => {
      return [
        new MarkdownString().appendMarkdown(`\`${key3}\``),
        properties[key3].markdownDescription ? new MarkdownString(properties[key3].markdownDescription, false) : properties[key3].description ?? "",
        new MarkdownString().appendCodeblock("json", JSON.stringify(isUndefined(properties[key3].default) ? getDefaultValue(properties[key3].type) : properties[key3].default, null, 2))
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
  id: "configuration",
  label: localize(5850, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(SettingsTableRenderer)
});

var ConfigurationDefaultsTableRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.configurationDefaults;
  }
  render(manifest) {
    const configurationDefaults = manifest.contributes?.configurationDefaults ?? {};
    const headers = [localize(5823, null), localize(5848, null), localize(5816, null)];
    const rows = [];
    for (const key3 of Object.keys(configurationDefaults).sort((a, b) => a.localeCompare(b))) {
      const value2 = configurationDefaults[key3];
      if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
        const languages = overrideIdentifiersFromKey(key3);
        const languageMarkdown = new MarkdownString().appendMarkdown(`${languages.join(", ")}`);
        for (const key4 of Object.keys(value2).sort((a, b) => a.localeCompare(b))) {
          const row = [];
          row.push(languageMarkdown);
          row.push(new MarkdownString().appendMarkdown(`\`${key4}\``));
          row.push(new MarkdownString().appendCodeblock("json", JSON.stringify(value2[key4], null, 2)));
          rows.push(row);
        }
      } else {
        const row = [];
        row.push("");
        row.push(new MarkdownString().appendMarkdown(`\`${key3}\``));
        row.push(new MarkdownString().appendCodeblock("json", JSON.stringify(value2, null, 2)));
        rows.push(row);
      }
    }
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
  id: "configurationDefaults",
  label: localize(5851, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(ConfigurationDefaultsTableRenderer)
});
export { jsonRegistry, configurationRegistry7, configurationEntrySchema, _configDelta, defaultConfigurationExtPoint, configurationExtPoint3, extensionConfigurations, SettingsTableRenderer, ConfigurationDefaultsTableRenderer };
