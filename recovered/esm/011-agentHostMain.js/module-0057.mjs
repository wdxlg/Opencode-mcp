// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostSchema.ts
import { ProtocolError } from "./module-0056.mjs";
import { JsonRpcErrorCodes } from "./module-0055.mjs";
import { localize } from "./module-0012.mjs";
import { telemetryLevelToAgentHostValue } from "./module-0054.mjs";
import { DEFAULT_EDIT_AUTO_APPROVE_PATTERNS } from "./module-0052.mjs";


// src/vs/platform/agentHost/common/agentHostSchema.ts
function schemaProperty(protocol) {
  const assertFn2 = buildAssert(protocol);
  const assertValid = (value, path = "") => assertFn2(value, path);
  const validate = (value) => {
    try {
      assertFn2(value, "");
      return true;
    } catch {
      return false;
    }
  };
  return { protocol, validate, assertValid };
}

function createSchema(definition) {
  return {
    definition,
    toProtocol() {
      const properties = {};
      for (const key of Object.keys(definition)) {
        properties[key] = definition[key].protocol;
      }
      return { type: "object", properties };
    },
    values(values) {
      const raw = values;
      for (const key of Object.keys(definition)) {
        const value = raw[key];
        if (value === void 0) {
          continue;
        }
        const prop = definition[key];
        prop.assertValid(value, key);
      }
      return { ...raw };
    },
    validate(key, value) {
      const prop = definition[key];
      return prop ? prop.validate(value) : false;
    },
    assertValid(key, value) {
      const prop = definition[key];
      if (!prop) {
        throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Unknown schema key '${key}'`);
      }
      const narrowed = prop;
      narrowed.assertValid(value, key);
    },
    validateOrDefault(values, defaults) {
      const result = {};
      const raw = values ?? {};
      for (const key of Object.keys(definition)) {
        const prop = definition[key];
        const candidate = raw[key];
        if (candidate !== void 0 && prop.validate(candidate)) {
          result[key] = candidate;
        } else if (Object.prototype.hasOwnProperty.call(defaults, key)) {
          result[key] = defaults[key];
        }
      }
      return result;
    }
  };
}

function buildAssert(schema) {
  if (schema.type === "object" && schema.properties) {
    const propAsserts = {};
    for (const key of Object.keys(schema.properties)) {
      propAsserts[key] = buildAssert(schema.properties[key]);
    }
    const required = new Set(schema.required ?? []);
    return (value, path) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw invalidParams(path, "object", value);
      }
      const obj = value;
      for (const key of Object.keys(propAsserts)) {
        const childPath = joinPath2(path, key);
        if (obj[key] === void 0) {
          if (required.has(key)) {
            throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Missing required property at '${childPath}'`);
          }
          continue;
        }
        propAsserts[key](obj[key], childPath);
      }
    };
  }
  if (schema.type === "array" && schema.items) {
    const itemAssert = buildAssert(schema.items);
    return (value, path) => {
      if (!Array.isArray(value)) {
        throw invalidParams(path, "array", value);
      }
      for (let i = 0; i < value.length; i++) {
        itemAssert(value[i], `${path}[${i}]`);
      }
    };
  }
  return buildPrimitiveAssert(schema);
}

function buildPrimitiveAssert(schema) {
  const enumDynamic = schema.enumDynamic === true;
  return (value, path) => {
    switch (schema.type) {
      case "string":
        if (typeof value !== "string") {
          throw invalidParams(path, "string", value);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          throw invalidParams(path, "number", value);
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") {
          throw invalidParams(path, "boolean", value);
        }
        break;
      case "array":
        if (!Array.isArray(value)) {
          throw invalidParams(path, "array", value);
        }
        break;
      case "object":
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
          throw invalidParams(path, "object", value);
        }
        break;
    }
    if (schema.enum && !enumDynamic && !schema.enum.includes(value)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Invalid value at '${path || "<root>"}': ${safeStringify2(value)} is not one of [${schema.enum.map((v) => JSON.stringify(v)).join(", ")}]`);
    }
  };
}

function invalidParams(path, expected, value) {
  return new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Invalid value at '${path || "<root>"}': expected ${expected}, got ${safeStringify2(value)}`);
}

function joinPath2(parent, key) {
  return parent ? `${parent}.${key}` : key;
}

function safeStringify2(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

var permissionsProperty = schemaProperty({
  type: "object",
  title: localize(1981, null),
  description: localize(1985, null),
  properties: {
    allow: {
      type: "array",
      title: localize(1982, null),
      items: {
        type: "string",
        title: localize(1984, null)
      }
    },
    deny: {
      type: "array",
      title: localize(1983, null),
      items: {
        type: "string",
        title: localize(1984, null)
      }
    }
  },
  default: { allow: [], deny: [] },
  sessionMutable: true
});

var platformSessionSchema = createSchema({
  ["autoApprove" /* AutoApprove */]: schemaProperty({
    type: "string",
    title: localize(1965, null),
    description: localize(1972, null),
    enum: ["default", "assisted", "autoApprove"],
    enumLabels: [
      localize(1970, null),
      localize(1966, null),
      localize(1968, null)
    ],
    enumDescriptions: [
      localize(1971, null),
      localize(1967, null),
      localize(1969, null)
    ],
    default: "default",
    sessionMutable: true
  }),
  ["permissions" /* Permissions */]: permissionsProperty,
  ["mode" /* Mode */]: schemaProperty({
    type: "string",
    title: localize(1973, null),
    description: localize(1980, null),
    enum: ["interactive", "plan", "autopilot"],
    enumLabels: [
      localize(1976, null),
      localize(1978, null),
      localize(1974, null)
    ],
    enumDescriptions: [
      localize(1977, null),
      localize(1979, null),
      localize(1975, null)
    ],
    default: "interactive",
    sessionMutable: true
  })
});

function migrateLegacyAutopilotConfig(config) {
  if (!config || config["autoApprove" /* AutoApprove */] !== "autopilot") {
    return config;
  }
  const migrated = { ...config };
  if (migrated["mode" /* Mode */] !== "plan") {
    migrated["mode" /* Mode */] = "autopilot";
  }
  migrated["autoApprove" /* AutoApprove */] = "default";
  return migrated;
}

var AgentHostTelemetryLevelConfigKey = "telemetryLevel";

var AgentHostEditTelemetryEnabledConfigKey = "editTelemetryEnabled";

var AgentHostDisableRepoInfoTelemetryConfigKey = "disableRepoInfoTelemetry";

var AgentHostSessionSyncEnabledConfigKey = "sessionSyncEnabled";

var AgentHostByokModelsEnabledConfigKey = "byokModelsEnabled";

var AgentHostCodexEnabledConfigKey = "codexAgentEnabled";

var AgentHostEditAutoApprovePatternsConfigKey = "editAutoApprovePatterns";

var AgentHostTerminalAutoApproveEnabledConfigKey = "terminalAutoApproveEnabled";

var TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID = "chat.tools.terminal.enableAutoApprove";

var GLOBAL_AUTO_APPROVE_SETTING_ID = "chat.tools.global.autoApprove";

var ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID = "chat.tools.eligibleForAutoApproval";

var AgentHostGlobalAutoApproveEnabledConfigKey = "globalAutoApproveEnabled";

var AgentHostAutoApprovePolicyRestrictedConfigKey = "autoApprovePolicyRestricted";

var AgentHostAutoReplyEnabledConfigKey = "autoReplyEnabled";

var AgentHostAutoReplyAnswer = "The user is not available to answer your question. Choose a pragmatic option best aligned with the context of the request.";

var AgentHostSystemProxyEnabledConfigKey = "systemProxyEnabled";

var AgentHostGitHubMcpServerEnabledConfigKey = "githubMcpServerEnabled";

var AgentHostProxyConfigKey = {
  Proxy: "http.proxy",
  ProxyKerberosServicePrincipal: "http.proxyKerberosServicePrincipal",
  NoProxy: "http.noProxy"
};

var agentHostProxyConfigDefinition = {
  [AgentHostProxyConfigKey.Proxy]: schemaProperty({
    type: "string",
    title: localize(1922, null),
    description: localize(1921, null)
  }),
  [AgentHostProxyConfigKey.ProxyKerberosServicePrincipal]: schemaProperty({
    type: "string",
    title: localize(1924, null),
    description: localize(1923, null)
  }),
  [AgentHostProxyConfigKey.NoProxy]: schemaProperty({
    type: "array",
    title: localize(1920, null),
    description: localize(1918, null),
    items: { type: "string", title: localize(1919, null) },
    default: []
  })
};

var agentHostProxyConfigSchema = createSchema(agentHostProxyConfigDefinition);

var AgentHostActiveAgentTitleGenerationConfigKey = "activeAgentTitleGeneration";

var AgentHostMarkdownPlanRichLinksEnabledConfigKey = "markdownPlanRichLinksEnabled";

var AgentHostArtifactToolsConfigKey = "artifactTools";

var AgentHostMigrateLegacyCopilotCliEnabledConfigKey = "migrateLegacyCopilotCliEnabled";

var AgentHostShowExternalSessionsConfigKey = "showExternalSessions";

var AgentHostCopilotMultiRootEnabledConfigKey = "copilotMultiRootEnabled";

var AgentHostClaudeMultiRootEnabledConfigKey = "claudeMultiRootEnabled";

var AgentHostCodexMultiRootEnabledConfigKey = "codexMultiRootEnabled";

var AgentHostTerminalAutoApproveRulesConfigKey = "terminalAutoApproveRules";

var TERMINAL_AUTO_APPROVE_SETTING_ID = "chat.tools.terminal.autoApprove";

var AgentHostMcpServersConfigKey = "mcpServers";

function telemetryLevelToAgentHostConfigValue(telemetryLevel) {
  return telemetryLevelToAgentHostValue(telemetryLevel);
}

function agentHostConfigValueToTelemetryLevel(value) {
  switch (value) {
    case "off" /* OFF */:
      return 0 /* NONE */;
    case "crash" /* CRASH */:
      return 1 /* CRASH */;
    case "error" /* ERROR */:
      return 2 /* ERROR */;
    case "all" /* ON */:
      return 3 /* USAGE */;
    default:
      return void 0;
  }
}

var mcpServerConfigProperties = {
  type: {
    type: "string",
    title: localize(1943, null),
    description: localize(1942, null),
    enum: ["stdio", "http"]
  },
  command: {
    type: "string",
    title: localize(1931, null),
    description: localize(1930, null)
  },
  args: {
    type: "array",
    title: localize(1929, null),
    description: localize(1928, null),
    items: { type: "string", title: localize(1927, null) }
  },
  env: {
    type: "object",
    title: localize(1938, null),
    description: localize(1937, null)
  },
  cwd: {
    type: "string",
    title: localize(1933, null),
    description: localize(1932, null)
  },
  url: {
    type: "string",
    title: localize(1945, null),
    description: localize(1944, null)
  },
  headers: {
    type: "object",
    title: localize(1940, null),
    description: localize(1939, null)
  }
};

var mcpServersValueProperties = {
  "<serverName>": {
    type: "object",
    title: localize(1936, null),
    description: localize(1935, null),
    properties: mcpServerConfigProperties
  }
};

var platformRootSchema = createSchema({
  ...agentHostProxyConfigDefinition,
  ["permissions" /* Permissions */]: permissionsProperty,
  [AgentHostDisableRepoInfoTelemetryConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1909, null),
    description: localize(1908, null),
    default: false
  }),
  [AgentHostTelemetryLevelConfigKey]: schemaProperty({
    type: "string",
    title: localize(1960, null),
    description: localize(1959, null),
    enum: ["all" /* ON */, "error" /* ERROR */, "crash" /* CRASH */, "off" /* OFF */],
    default: "all" /* ON */
  }),
  [AgentHostEditTelemetryEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1913, null),
    description: localize(1912, null),
    default: true
  }),
  [AgentHostSessionSyncEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1949, null),
    description: localize(1948, null),
    default: false
  }),
  [AgentHostByokModelsEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1899, null),
    description: localize(1898, null),
    default: false
  }),
  [AgentHostCodexEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1903, null),
    description: localize(1902, null),
    default: false
  }),
  [AgentHostTerminalAutoApproveEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1962, null),
    description: localize(1961, null),
    default: true
  }),
  [AgentHostGlobalAutoApproveEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1917, null),
    description: localize(1916, null),
    default: false
  }),
  [AgentHostAutoApprovePolicyRestrictedConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1895, null),
    default: false,
    readOnly: true
  }),
  [AgentHostAutoReplyEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1897, null),
    description: localize(1896, null),
    default: false
  }),
  [AgentHostSystemProxyEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1958, null),
    description: localize(1957, null),
    default: true
  }),
  [AgentHostGitHubMcpServerEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1915, null),
    description: localize(1914, null),
    default: true
  }),
  [AgentHostActiveAgentTitleGenerationConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1892, null),
    description: localize(1891, null),
    default: false
  }),
  [AgentHostMarkdownPlanRichLinksEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1926, null),
    description: localize(1925, null),
    default: false
  }),
  [AgentHostArtifactToolsConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1894, null),
    description: localize(1893, null),
    default: false
  }),
  [AgentHostMigrateLegacyCopilotCliEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1947, null),
    description: localize(1946, null),
    default: false
  }),
  [AgentHostShowExternalSessionsConfigKey]: schemaProperty({
    type: "string",
    title: localize(1956, null),
    description: localize(1950, null),
    enum: ["none" /* None */, "recent" /* Recent */, "last24Hours" /* Last24Hours */, "last7Days" /* Last7Days */, "last30Days" /* Last30Days */],
    enumDescriptions: [
      localize(1954, null),
      localize(1955, null),
      localize(1951, null),
      localize(1953, null),
      localize(1952, null)
    ],
    default: "none" /* None */
  }),
  [AgentHostCopilotMultiRootEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1907, null),
    description: localize(1906, null),
    default: false
  }),
  [AgentHostClaudeMultiRootEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1901, null),
    description: localize(1900, null),
    default: false
  }),
  [AgentHostCodexMultiRootEnabledConfigKey]: schemaProperty({
    type: "boolean",
    title: localize(1905, null),
    description: localize(1904, null),
    default: false
  }),
  [AgentHostEditAutoApprovePatternsConfigKey]: schemaProperty({
    type: "object",
    title: localize(1911, null),
    description: localize(1910, null),
    default: DEFAULT_EDIT_AUTO_APPROVE_PATTERNS
  }),
  [AgentHostTerminalAutoApproveRulesConfigKey]: schemaProperty({
    type: "object",
    title: localize(1964, null),
    description: localize(1963, null),
    default: {}
  }),
  [AgentHostMcpServersConfigKey]: schemaProperty({
    type: "object",
    title: localize(1941, null),
    description: localize(1934, null),
    properties: mcpServersValueProperties,
    default: {}
  })
});

var clientOwnedApprovalRootConfigKeys = /* @__PURE__ */ new Set([
  "permissions" /* Permissions */,
  AgentHostGlobalAutoApproveEnabledConfigKey,
  AgentHostAutoApprovePolicyRestrictedConfigKey,
  AgentHostTerminalAutoApproveEnabledConfigKey,
  AgentHostTerminalAutoApproveRulesConfigKey,
  AgentHostEditAutoApprovePatternsConfigKey,
  AgentHostAutoReplyEnabledConfigKey
]);
export { schemaProperty, createSchema, buildAssert, buildPrimitiveAssert, invalidParams, joinPath2, safeStringify2, migrateLegacyAutopilotConfig, telemetryLevelToAgentHostConfigValue, agentHostConfigValueToTelemetryLevel, permissionsProperty, platformSessionSchema, AgentHostTelemetryLevelConfigKey, AgentHostEditTelemetryEnabledConfigKey, AgentHostDisableRepoInfoTelemetryConfigKey, AgentHostSessionSyncEnabledConfigKey, AgentHostByokModelsEnabledConfigKey, AgentHostCodexEnabledConfigKey, AgentHostEditAutoApprovePatternsConfigKey, AgentHostTerminalAutoApproveEnabledConfigKey, TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, GLOBAL_AUTO_APPROVE_SETTING_ID, ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, AgentHostGlobalAutoApproveEnabledConfigKey, AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostAutoReplyEnabledConfigKey, AgentHostAutoReplyAnswer, AgentHostSystemProxyEnabledConfigKey, AgentHostGitHubMcpServerEnabledConfigKey, AgentHostProxyConfigKey, agentHostProxyConfigDefinition, agentHostProxyConfigSchema, AgentHostActiveAgentTitleGenerationConfigKey, AgentHostMarkdownPlanRichLinksEnabledConfigKey, AgentHostArtifactToolsConfigKey, AgentHostMigrateLegacyCopilotCliEnabledConfigKey, AgentHostShowExternalSessionsConfigKey, AgentHostCopilotMultiRootEnabledConfigKey, AgentHostClaudeMultiRootEnabledConfigKey, AgentHostCodexMultiRootEnabledConfigKey, AgentHostTerminalAutoApproveRulesConfigKey, TERMINAL_AUTO_APPROVE_SETTING_ID, AgentHostMcpServersConfigKey, mcpServerConfigProperties, mcpServersValueProperties, platformRootSchema, clientOwnedApprovalRootConfigKeys };
