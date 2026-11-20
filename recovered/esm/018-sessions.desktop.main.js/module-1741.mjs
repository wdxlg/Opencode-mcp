// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostSchema.ts
import { ProtocolError } from "./module-1732.mjs";
import { JsonRpcErrorCodes } from "./module-1731.mjs";
import { localize } from "./module-0001.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { telemetryLevelToAgentHostValue } from "./module-1739.mjs";
import { DEFAULT_EDIT_AUTO_APPROVE_PATTERNS } from "./module-0951.mjs";


// src/vs/platform/agentHost/common/agentHostSchema.ts
function schemaProperty(protocol) {
  const assertFn2 = buildAssert(protocol);
  const assertValid = (value2, path = "") => assertFn2(value2, path);
  const validate = (value2) => {
    try {
      assertFn2(value2, "");
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
      for (const key3 of Object.keys(definition)) {
        properties[key3] = definition[key3].protocol;
      }
      return { type: "object", properties };
    },
    values(values) {
      const raw = values;
      for (const key3 of Object.keys(definition)) {
        const value2 = raw[key3];
        if (value2 === void 0) {
          continue;
        }
        const prop = definition[key3];
        prop.assertValid(value2, key3);
      }
      return { ...raw };
    },
    validate(key3, value2) {
      const prop = definition[key3];
      return prop ? prop.validate(value2) : false;
    },
    assertValid(key3, value2) {
      const prop = definition[key3];
      if (!prop) {
        throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Unknown schema key '${key3}'`);
      }
      const narrowed = prop;
      narrowed.assertValid(value2, key3);
    },
    validateOrDefault(values, defaults) {
      const result = {};
      const raw = values ?? {};
      for (const key3 of Object.keys(definition)) {
        const prop = definition[key3];
        const candidate = raw[key3];
        if (candidate !== void 0 && prop.validate(candidate)) {
          result[key3] = candidate;
        } else if (Object.prototype.hasOwnProperty.call(defaults, key3)) {
          result[key3] = defaults[key3];
        }
      }
      return result;
    }
  };
}

function buildAssert(schema10) {
  if (schema10.type === "object" && schema10.properties) {
    const propAsserts = {};
    for (const key3 of Object.keys(schema10.properties)) {
      propAsserts[key3] = buildAssert(schema10.properties[key3]);
    }
    const required = new Set(schema10.required ?? []);
    return (value2, path) => {
      if (typeof value2 !== "object" || value2 === null || Array.isArray(value2)) {
        throw invalidParams(path, "object", value2);
      }
      const obj = value2;
      for (const key3 of Object.keys(propAsserts)) {
        const childPath = joinPath2(path, key3);
        if (obj[key3] === void 0) {
          if (required.has(key3)) {
            throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Missing required property at '${childPath}'`);
          }
          continue;
        }
        propAsserts[key3](obj[key3], childPath);
      }
    };
  }
  if (schema10.type === "array" && schema10.items) {
    const itemAssert = buildAssert(schema10.items);
    return (value2, path) => {
      if (!Array.isArray(value2)) {
        throw invalidParams(path, "array", value2);
      }
      for (let i2 = 0; i2 < value2.length; i2++) {
        itemAssert(value2[i2], `${path}[${i2}]`);
      }
    };
  }
  return buildPrimitiveAssert(schema10);
}

function buildPrimitiveAssert(schema10) {
  const enumDynamic = schema10.enumDynamic === true;
  return (value2, path) => {
    switch (schema10.type) {
      case "string":
        if (typeof value2 !== "string") {
          throw invalidParams(path, "string", value2);
        }
        break;
      case "number":
        if (typeof value2 !== "number") {
          throw invalidParams(path, "number", value2);
        }
        break;
      case "boolean":
        if (typeof value2 !== "boolean") {
          throw invalidParams(path, "boolean", value2);
        }
        break;
      case "array":
        if (!Array.isArray(value2)) {
          throw invalidParams(path, "array", value2);
        }
        break;
      case "object":
        if (typeof value2 !== "object" || value2 === null || Array.isArray(value2)) {
          throw invalidParams(path, "object", value2);
        }
        break;
    }
    if (schema10.enum && !enumDynamic && !schema10.enum.includes(value2)) {
      throw new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Invalid value at '${path || "<root>"}': ${safeStringify2(value2)} is not one of [${schema10.enum.map((v2) => JSON.stringify(v2)).join(", ")}]`);
    }
  };
}

function invalidParams(path, expected, value2) {
  return new ProtocolError(JsonRpcErrorCodes.InvalidParams, `Invalid value at '${path || "<root>"}': expected ${expected}, got ${safeStringify2(value2)}`);
}

function joinPath2(parent, key3) {
  return parent ? `${parent}.${key3}` : key3;
}

function safeStringify2(value2) {
  try {
    return JSON.stringify(value2);
  } catch {
    return String(value2);
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
    enum: ["interactive", "plan"],
    enumLabels: [
      localize(1976, null),
      localize(1978, null)
    ],
    enumDescriptions: [
      localize(1977, null),
      localize(1979, null)
    ],
    default: "interactive",
    sessionMutable: true
  })
});

var AgentHostTelemetryLevelConfigKey = "telemetryLevel";

var AgentHostEditTelemetryEnabledConfigKey = "editTelemetryEnabled";

var AgentHostDisableRepoInfoTelemetryConfigKey = "disableRepoInfoTelemetry";

var DISABLE_REPO_INFO_TELEMETRY_SETTING_ID = "chat.advanced.debug.disableRepoInfoTelemetry";

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

var TERMINAL_IGNORE_DEFAULT_AUTO_APPROVE_RULES_SETTING_ID = "chat.tools.terminal.ignoreDefaultAutoApproveRules";

function getAgentHostTerminalAutoApproveRulesConfig(configurationService) {
  const config = configurationService.getValue(TERMINAL_AUTO_APPROVE_SETTING_ID);
  const configInspectValue = configurationService.inspect(TERMINAL_AUTO_APPROVE_SETTING_ID);
  const ignoreDefaults = configurationService.getValue(TERMINAL_IGNORE_DEFAULT_AUTO_APPROVE_RULES_SETTING_ID) === true;
  return normalizeAgentHostTerminalAutoApproveRulesConfig(config, configInspectValue, ignoreDefaults);
}

function normalizeAgentHostTerminalAutoApproveRulesConfig(config, configInspectValue, ignoreDefaults) {
  if (!config) {
    return {};
  }
  const rules = {};
  for (const [key3, value2] of Object.entries(config)) {
    if (ignoreDefaults && isDefaultOnlyAutoApproveRule(key3, value2, configInspectValue)) {
      continue;
    }
    rules[key3] = value2;
  }
  return rules;
}

function isDefaultOnlyAutoApproveRule(key3, value2, configInspectValue) {
  const defaultValue = configInspectValue.default?.value;
  const isDefaultRule = hasMatchingRule(defaultValue, key3, value2);
  if (!isDefaultRule) {
    return false;
  }
  const sourceTarget = getAutoApproveRuleSourceTarget(key3, value2, configInspectValue);
  return sourceTarget === 7 /* DEFAULT */;
}

function getAutoApproveRuleSourceTarget(key3, value2, configInspectValue) {
  if (hasMatchingRule(configInspectValue.workspaceFolderValue, key3, value2)) {
    return 6 /* WORKSPACE_FOLDER */;
  }
  if (hasMatchingRule(configInspectValue.workspaceValue, key3, value2)) {
    return 5 /* WORKSPACE */;
  }
  if (hasMatchingRule(configInspectValue.userRemoteValue, key3, value2)) {
    return 4 /* USER_REMOTE */;
  }
  if (hasMatchingRule(configInspectValue.userLocalValue, key3, value2)) {
    return 3 /* USER_LOCAL */;
  }
  if (hasMatchingRule(configInspectValue.userValue, key3, value2)) {
    return 2 /* USER */;
  }
  if (hasMatchingRule(configInspectValue.applicationValue, key3, value2)) {
    return 1 /* APPLICATION */;
  }
  return 7 /* DEFAULT */;
}

function hasMatchingRule(config, key3, value2) {
  return !!config && Object.prototype.hasOwnProperty.call(config, key3) && structuralEquals(config[key3], value2);
}

var AgentHostMcpServersConfigKey = "mcpServers";

function telemetryLevelToAgentHostConfigValue(telemetryLevel) {
  return telemetryLevelToAgentHostValue(telemetryLevel);
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
// OpenCode 018 compat: legacy autopilot config migration kept for sessions providers
function migrateLegacyAutopilotConfig(config) {
  if (!config || config["autoApprove"] !== "autopilot") {
    return config;
  }
  const migrated = { ...config };
  if (migrated["mode"] !== "plan") {
    migrated["mode"] = "autopilot";
  }
  migrated["autoApprove"] = "default";
  return migrated;
}

export { migrateLegacyAutopilotConfig, schemaProperty, createSchema, buildAssert, buildPrimitiveAssert, invalidParams, joinPath2, safeStringify2, getAgentHostTerminalAutoApproveRulesConfig, normalizeAgentHostTerminalAutoApproveRulesConfig, isDefaultOnlyAutoApproveRule, getAutoApproveRuleSourceTarget, hasMatchingRule, telemetryLevelToAgentHostConfigValue, permissionsProperty, platformSessionSchema, AgentHostTelemetryLevelConfigKey, AgentHostEditTelemetryEnabledConfigKey, AgentHostDisableRepoInfoTelemetryConfigKey, DISABLE_REPO_INFO_TELEMETRY_SETTING_ID, AgentHostSessionSyncEnabledConfigKey, AgentHostByokModelsEnabledConfigKey, AgentHostCodexEnabledConfigKey, AgentHostEditAutoApprovePatternsConfigKey, AgentHostTerminalAutoApproveEnabledConfigKey, TERMINAL_AUTO_APPROVE_ENABLED_SETTING_ID, GLOBAL_AUTO_APPROVE_SETTING_ID, ELIGIBLE_FOR_AUTO_APPROVAL_SETTING_ID, AgentHostGlobalAutoApproveEnabledConfigKey, AgentHostAutoApprovePolicyRestrictedConfigKey, AgentHostAutoReplyEnabledConfigKey, AgentHostAutoReplyAnswer, AgentHostSystemProxyEnabledConfigKey, AgentHostGitHubMcpServerEnabledConfigKey, AgentHostProxyConfigKey, agentHostProxyConfigDefinition, agentHostProxyConfigSchema, AgentHostActiveAgentTitleGenerationConfigKey, AgentHostMarkdownPlanRichLinksEnabledConfigKey, AgentHostArtifactToolsConfigKey, AgentHostMigrateLegacyCopilotCliEnabledConfigKey, AgentHostShowExternalSessionsConfigKey, AgentHostCopilotMultiRootEnabledConfigKey, AgentHostClaudeMultiRootEnabledConfigKey, AgentHostCodexMultiRootEnabledConfigKey, AgentHostTerminalAutoApproveRulesConfigKey, TERMINAL_AUTO_APPROVE_SETTING_ID, TERMINAL_IGNORE_DEFAULT_AUTO_APPROVE_RULES_SETTING_ID, AgentHostMcpServersConfigKey, mcpServerConfigProperties, mcpServersValueProperties, platformRootSchema, clientOwnedApprovalRootConfigKeys };
