// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostMcpServerSupport.ts
import { CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX, MCP_CONFIGURATION_COLLECTION_ID_PREFIX, MCP_PLUGIN_COLLECTION_ID_PREFIX, McpCollectionDefinition, McpServerLaunch, WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX, extensionMcpCollectionPrefix, extensionPrefixedIdentifier, getMcpCollectionProvenance } from "./module-1206.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { isCopilotCliSessionType } from "./module-1749.mjs";
import { AICustomizationSources } from "./module-0996.mjs";
import { isEqualOrParent2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { ConfigurationResolverExpression } from "./module-1405.mjs";
import { Iterable } from "./module-0011.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostMcpServerSupport.ts
var COPILOT_CHAT_EXTENSION_ID = "github.copilot-chat";

var LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX = "agent-host-";

var AGENT_HOST_PROVIDERS_WITH_GITHUB_MCP = /* @__PURE__ */ new Set(["copilotcli", "claude", "codex"]);

var COPILOT_CHAT_GITHUB_MCP_COLLECTION_ID = extensionPrefixedIdentifier(new ExtensionIdentifier(COPILOT_CHAT_EXTENSION_ID), "github");

function agentHostProviderHasBuiltInGitHubMcpServer(provider) {
  return AGENT_HOST_PROVIDERS_WITH_GITHUB_MCP.has(provider);
}

async function assessMcpServersForCopilotAgentHost(servers, configurationResolverService, sessionType, workingDirectories, lazyCollectionState) {
  if (!isCopilotCliSessionType(sessionType)) {
    return void 0;
  }
  const resolved = await resolveMcpServersForAgentHostDelivery(servers, configurationResolverService, sessionType, workingDirectories);
  return {
    servers: resolved.map(({ server, source, applicability, delivery, compatibility }) => ({
      id: server.definition.id,
      name: server.definition.label,
      collectionId: server.collection.id,
      source,
      enablement: getMcpServerEnablement(server),
      applicability,
      delivery,
      compatibility
    })),
    discoveryComplete: lazyCollectionState === 2 /* AllKnown */
  };
}

async function mergeInstalledMcpServersIntoAgentHostSupportAssessment(assessment, installedServers, configurationResolverService, workingDirectories) {
  const installedById = new Map(installedServers.map((server) => [server.id, server]));
  const servers = assessment.servers.map((server) => {
    const installed = installedById.get(server.id);
    const runtimeState = installed?.runtimeState;
    const enablement = getInstalledMcpServerEnablementOverride(runtimeState);
    return enablement ? {
      ...server,
      enablement,
      delivery: runtimeState === 1 /* DisabledByAccess */ ? "notDelivered" /* NotDelivered */ : server.delivery
    } : server;
  });
  const assessedIds = new Set(servers.map((server) => server.id));
  const missingDisabledServers = await Promise.all(installedServers.filter((server) => !assessedIds.has(server.id) && server.runtimeState !== 4 /* Enabled */).map((server) => assessDisabledInstalledMcpServer(server, configurationResolverService, workingDirectories)));
  return {
    ...assessment,
    servers: [...servers, ...missingDisabledServers]
  };
}

function resolveMcpServersForAgentHostDelivery(servers, configurationResolverService, sessionType, workingDirectories) {
  return Promise.all(servers.map((server) => resolveMcpServerForAgentHostDelivery(server, configurationResolverService, sessionType, workingDirectories)));
}

async function resolveMcpServerForAgentHostDelivery(server, configurationResolverService, sessionType, workingDirectories) {
  const definitions3 = server.readDefinitions().get();
  const definition = definitions3.server;
  const collection = definitions3.collection;
  const source = getMcpServerSource(server, collection, definition);
  const applicability = getMcpServerApplicability(collection, source.kind, workingDirectories);
  if (isPluginCollection(server, collection)) {
    return createResolution(server, definition, source, applicability, "agentPlugin" /* AgentPlugin */, supported());
  }
  if (isProviderBuiltInReplacement(server, collection, sessionType)) {
    return createResolution(server, definition, source, applicability, "providerBuiltIn" /* ProviderBuiltIn */, supported());
  }
  if (!definition?.launch) {
    return createResolution(server, definition, source, applicability, "unknown" /* Unknown */, unknown(["definitionNotLoaded" /* DefinitionNotLoaded */]));
  }
  if (source.kind === "workspaceDotMcp" /* WorkspaceDotMcp */) {
    return createResolution(
      server,
      definition,
      source,
      applicability,
      applicability === "applicable" /* Applicable */ ? "runtimeDiscovered" /* RuntimeDiscovered */ : deliveryForInapplicable(applicability),
      supported()
    );
  }
  if (collection && McpCollectionDefinition.isWorkspaceDiscovered(collection) && !McpCollectionDefinition.isVscodeMcpJson(collection)) {
    return createResolution(
      server,
      definition,
      source,
      applicability,
      "notDelivered" /* NotDelivered */,
      unsupported(["unsupportedSourceLocation" /* UnsupportedSourceLocation */])
    );
  }
  let projectedConfiguration = projectMcpServerConfiguration(definition.launch);
  if (!projectedConfiguration) {
    return createResolution(
      server,
      definition,
      source,
      applicability,
      "notDelivered" /* NotDelivered */,
      unsupported(["launchNotRepresentable" /* LaunchNotRepresentable */])
    );
  }
  const unsupportedReasons = [];
  if (collection && McpCollectionDefinition.isVscodeMcpJson(collection)) {
    const resolved = await resolveMcpConfigurationForSync(configurationResolverService, definition.variableReplacement?.folder, projectedConfiguration);
    if (resolved.kind === "error") {
      unsupportedReasons.push(resolved.reason);
    } else {
      projectedConfiguration = resolved.configuration;
    }
  } else {
    const unresolvedReason = getUnresolvedConfigurationReason(projectedConfiguration);
    if (unresolvedReason) {
      unsupportedReasons.push(unresolvedReason);
    }
  }
  const partialReasons = getPartialSupportReasons(definition.launch, definition.sandboxEnabled, definition.devMode);
  const unknownReasons = source.kind === "unknown" /* Unknown */ ? ["sourceUnknown" /* SourceUnknown */] : [];
  const delivery = applicability === "applicable" /* Applicable */ ? "clientForwarded" /* ClientForwarded */ : deliveryForInapplicable(applicability);
  return {
    server,
    definition,
    source,
    applicability,
    delivery: unsupportedReasons.length > 0 && collection && McpCollectionDefinition.isVscodeMcpJson(collection) ? "notDelivered" /* NotDelivered */ : delivery,
    compatibility: getCompatibility(unsupportedReasons, partialReasons, unknownReasons),
    projectedConfiguration
  };
}

function createResolution(server, definition, source, applicability, delivery, compatibility) {
  return { server, definition, source, applicability, delivery, compatibility, projectedConfiguration: void 0 };
}

function getMcpServerSource(server, collection, definition) {
  const kind = getMcpServerSourceKind(server, collection);
  return {
    group: getMcpServerSourceGroup(kind),
    kind,
    label: collection?.label ?? server.collection.label,
    collectionUri: collection?.presentation?.origin,
    definitionLocation: definition?.presentation?.origin,
    remoteAuthority: collection?.remoteAuthority ?? null,
    extensionId: collection?.source instanceof ExtensionIdentifier ? collection.source.value : void 0,
    pluginUri: getPluginUri(server, collection)
  };
}

function getMcpServerSourceKind(server, collection) {
  const provenanceKind = getMcpCollectionSourceKind(collection?.provenance, collection?.discoverySource);
  if (provenanceKind !== void 0) {
    return provenanceKind;
  }
  const collectionId = collection?.id ?? server.collection.id;
  if (collectionId.startsWith(MCP_PLUGIN_COLLECTION_ID_PREFIX)) {
    return "agentPlugin" /* AgentPlugin */;
  }
  if (collectionId.startsWith(WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX)) {
    return "workspaceDotMcp" /* WorkspaceDotMcp */;
  }
  if (collectionId.startsWith(CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX)) {
    return "cursorWorkspace" /* CursorWorkspace */;
  }
  if (collectionId.startsWith(`${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}ws`)) {
    return "vscodeWorkspaceFolder" /* VscodeWorkspaceFolder */;
  }
  if (collectionId === `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}workspace`) {
    return "workspaceConfiguration" /* WorkspaceConfiguration */;
  }
  if (collectionId === `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}usrlocal`) {
    return "userProfile" /* UserProfile */;
  }
  if (collectionId === `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}usrremote`) {
    return "remoteUser" /* RemoteUser */;
  }
  if (collectionId.startsWith(extensionMcpCollectionPrefix) || collection?.source instanceof ExtensionIdentifier) {
    return "extension" /* Extension */;
  }
  return "unknown" /* Unknown */;
}

function getMcpCollectionSourceKind(provenance, discoverySource) {
  switch (provenance) {
    case "userProfile" /* UserProfile */:
      return "userProfile" /* UserProfile */;
    case "remoteUser" /* RemoteUser */:
      return "remoteUser" /* RemoteUser */;
    case "workspaceConfiguration" /* WorkspaceConfiguration */:
      return "workspaceConfiguration" /* WorkspaceConfiguration */;
    case "workspaceFolderConfiguration" /* WorkspaceFolderConfiguration */:
      return "vscodeWorkspaceFolder" /* VscodeWorkspaceFolder */;
    case "workspaceDotMcp" /* WorkspaceDotMcp */:
      return "workspaceDotMcp" /* WorkspaceDotMcp */;
    case "externalConfiguration" /* ExternalConfiguration */:
      return getExternalConfigurationSourceKind(discoverySource);
    case "extension" /* Extension */:
      return "extension" /* Extension */;
    case "plugin" /* Plugin */:
      return "agentPlugin" /* AgentPlugin */;
    default:
      return void 0;
  }
}

function getExternalConfigurationSourceKind(discoverySource) {
  switch (discoverySource) {
    case "claude-desktop" /* ClaudeDesktop */:
      return "claudeDesktop" /* ClaudeDesktop */;
    case "windsurf" /* Windsurf */:
      return "windsurf" /* Windsurf */;
    case "cursor-global" /* CursorGlobal */:
      return "cursorUser" /* CursorUser */;
    case "cursor-workspace" /* CursorWorkspace */:
      return "cursorWorkspace" /* CursorWorkspace */;
    default:
      return "unknown" /* Unknown */;
  }
}

function getMcpServerSourceGroup(kind) {
  switch (kind) {
    case "userProfile" /* UserProfile */:
    case "remoteUser" /* RemoteUser */:
    case "claudeDesktop" /* ClaudeDesktop */:
    case "windsurf" /* Windsurf */:
    case "cursorUser" /* CursorUser */:
      return AICustomizationSources.user;
    case "vscodeWorkspaceFolder" /* VscodeWorkspaceFolder */:
    case "workspaceConfiguration" /* WorkspaceConfiguration */:
    case "workspaceDotMcp" /* WorkspaceDotMcp */:
    case "cursorWorkspace" /* CursorWorkspace */:
      return AICustomizationSources.local;
    case "extension" /* Extension */:
      return AICustomizationSources.extension;
    case "agentPlugin" /* AgentPlugin */:
      return AICustomizationSources.plugin;
    case "unknown" /* Unknown */:
      return void 0;
  }
}

function getMcpServerApplicability(collection, sourceKind, workingDirectories) {
  return getMcpConfigurationApplicability(collection?.configTarget, collection?.presentation?.origin, sourceKind, workingDirectories);
}

function getMcpConfigurationApplicability(configTarget, origin, sourceKind, workingDirectories) {
  if (configTarget !== 5 /* WORKSPACE */ && configTarget !== 6 /* WORKSPACE_FOLDER */) {
    return "applicable" /* Applicable */;
  }
  if (workingDirectories === void 0) {
    return "unknown" /* Unknown */;
  }
  if (workingDirectories.length === 0) {
    return "outsideCurrentScope" /* OutsideCurrentScope */;
  }
  if (sourceKind === "workspaceConfiguration" /* WorkspaceConfiguration */) {
    return "applicable" /* Applicable */;
  }
  return origin && workingDirectories.some((workingDirectory) => isEqualOrParent2(origin, workingDirectory)) ? "applicable" /* Applicable */ : "outsideCurrentScope" /* OutsideCurrentScope */;
}

function getMcpServerEnablement(server) {
  switch (server.enablement.get()) {
    case 2 /* EnabledProfile */:
      return { enabled: true, state: "enabledProfile" /* EnabledProfile */ };
    case 3 /* EnabledWorkspace */:
      return { enabled: true, state: "enabledWorkspace" /* EnabledWorkspace */ };
    case 0 /* DisabledProfile */:
      return { enabled: false, state: "disabledProfile" /* DisabledProfile */ };
    case 1 /* DisabledWorkspace */:
      return { enabled: false, state: "disabledWorkspace" /* DisabledWorkspace */ };
  }
}

function getInstalledMcpServerEnablementOverride(runtimeState) {
  switch (runtimeState) {
    case 0 /* Disabled */:
      return { enabled: false, state: "disabledNotRegistered" /* DisabledNotRegistered */ };
    case 1 /* DisabledByAccess */:
      return { enabled: false, state: "disabledByAccess" /* DisabledByAccess */ };
    case 2 /* DisabledProfile */:
      return { enabled: false, state: "disabledProfile" /* DisabledProfile */ };
    case 3 /* DisabledWorkspace */:
      return { enabled: false, state: "disabledWorkspace" /* DisabledWorkspace */ };
    case 4 /* Enabled */:
    case void 0:
      return void 0;
  }
}

async function assessDisabledInstalledMcpServer(server, configurationResolverService, workingDirectories) {
  const sourceKind = getMcpConfigurationSourceKind(server.configPath?.target);
  const compatibility = await getInstalledMcpServerCompatibility(server, sourceKind, configurationResolverService);
  const collectionId = server.configPath ? `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}${server.configPath.id}` : getCollectionIdFromInstalledServer(server);
  return {
    id: server.id,
    name: server.name,
    collectionId,
    source: {
      group: getMcpServerSourceGroup(sourceKind),
      kind: sourceKind,
      label: server.configPath?.label ?? server.label,
      collectionUri: server.configPath?.uri,
      definitionLocation: void 0,
      remoteAuthority: server.configPath?.remoteAuthority ?? null,
      extensionId: void 0,
      pluginUri: void 0
    },
    enablement: getInstalledMcpServerEnablementOverride(server.runtimeState) ?? {
      enabled: false,
      state: "disabledNotRegistered" /* DisabledNotRegistered */
    },
    applicability: getMcpConfigurationApplicability(server.configPath?.target, server.configPath?.uri, sourceKind, workingDirectories),
    delivery: "notDelivered" /* NotDelivered */,
    compatibility
  };
}

function getCollectionIdFromInstalledServer(server) {
  const nameSuffix = `.${server.name}`;
  return server.id.endsWith(nameSuffix) ? server.id.slice(0, -nameSuffix.length) : `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}unknown`;
}

function getMcpConfigurationSourceKind(configTarget) {
  return getMcpCollectionSourceKind(getMcpCollectionProvenance(configTarget), void 0) ?? "unknown" /* Unknown */;
}

async function getInstalledMcpServerCompatibility(server, sourceKind, configurationResolverService) {
  if (sourceKind === "workspaceConfiguration" /* WorkspaceConfiguration */) {
    return unsupported(["unsupportedSourceLocation" /* UnsupportedSourceLocation */]);
  }
  const launch = McpServerLaunch.fromServerConfiguration(server.configuration, server.sandbox);
  if (!launch) {
    return unsupported(["launchNotRepresentable" /* LaunchNotRepresentable */]);
  }
  const projectedConfiguration = projectMcpServerConfiguration(launch);
  if (!projectedConfiguration) {
    return unsupported(["launchNotRepresentable" /* LaunchNotRepresentable */]);
  }
  const unsupportedReasons = [];
  if (server.configPath?.target === 6 /* WORKSPACE_FOLDER */) {
    const resolved = await resolveMcpConfigurationForSync(configurationResolverService, server.configPath.workspaceFolder, projectedConfiguration);
    if (resolved.kind === "error") {
      unsupportedReasons.push(resolved.reason);
    }
  } else {
    const unresolvedReason = getUnresolvedConfigurationReason(projectedConfiguration);
    if (unresolvedReason) {
      unsupportedReasons.push(unresolvedReason);
    }
  }
  const partialReasons = getPartialSupportReasons(
    launch,
    server.configuration.type === "stdio" /* LOCAL */ ? server.configuration.sandboxEnabled : void 0,
    server.configuration.dev
  );
  const unknownReasons = sourceKind === "unknown" /* Unknown */ ? ["sourceUnknown" /* SourceUnknown */] : [];
  return getCompatibility(unsupportedReasons, partialReasons, unknownReasons);
}

function isPluginCollection(server, collection) {
  return collection?.provenance === "plugin" /* Plugin */ || server.collection.id.startsWith(MCP_PLUGIN_COLLECTION_ID_PREFIX);
}

function getPluginUri(server, collection) {
  if (!isPluginCollection(server, collection)) {
    return void 0;
  }
  const collectionId = collection?.id ?? server.collection.id;
  return collectionId.startsWith(MCP_PLUGIN_COLLECTION_ID_PREFIX) ? URI.parse(collectionId.slice(MCP_PLUGIN_COLLECTION_ID_PREFIX.length)) : void 0;
}

function isProviderBuiltInReplacement(server, collection, sessionType) {
  return hasBuiltInGitHubMcpServer(sessionType) && server.collection.id === COPILOT_CHAT_GITHUB_MCP_COLLECTION_ID && collection?.source instanceof ExtensionIdentifier && ExtensionIdentifier.equals(collection.source, COPILOT_CHAT_EXTENSION_ID);
}

function hasBuiltInGitHubMcpServer(sessionType) {
  const localProvider = sessionType.startsWith(LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX) ? sessionType.slice(LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX.length) : void 0;
  return agentHostProviderHasBuiltInGitHubMcpServer(localProvider ?? "");
}

function deliveryForInapplicable(applicability) {
  return applicability === "unknown" /* Unknown */ ? "unknown" /* Unknown */ : "notDelivered" /* NotDelivered */;
}

function projectMcpServerConfiguration(launch) {
  switch (launch.type) {
    case 1 /* Stdio */:
      if (!launch.command) {
        return void 0;
      }
      return {
        type: "stdio" /* LOCAL */,
        command: launch.command,
        args: launch.args.length > 0 ? [...launch.args] : void 0,
        env: Object.keys(launch.env).length > 0 ? { ...launch.env } : void 0,
        envFile: launch.envFile,
        cwd: launch.cwd
      };
    case 2 /* HTTP */:
      return {
        type: "http" /* REMOTE */,
        url: launch.uri.toString(),
        headers: launch.headers.length > 0 ? Object.fromEntries(launch.headers) : void 0
      };
  }
}

async function resolveMcpConfigurationForSync(configurationResolverService, folder, configuration2) {
  const expression = ConfigurationResolverExpression.parse(configuration2);
  const unresolvedReason = getExpressionUnresolvedReason(expression);
  if (unresolvedReason === "requiresUserInteraction" /* RequiresUserInteraction */) {
    return { kind: "error", reason: unresolvedReason };
  }
  try {
    await configurationResolverService.resolveAsync(folder, expression);
  } catch {
    return { kind: "error", reason: "unresolvedConfiguration" /* UnresolvedConfiguration */ };
  }
  if (!Iterable.isEmpty(expression.unresolved())) {
    return { kind: "error", reason: "unresolvedConfiguration" /* UnresolvedConfiguration */ };
  }
  return { kind: "success", configuration: expression.toObject() };
}

function getUnresolvedConfigurationReason(configuration2) {
  return getExpressionUnresolvedReason(ConfigurationResolverExpression.parse(configuration2));
}

function getExpressionUnresolvedReason(expression) {
  let hasUnresolved = false;
  for (const replacement of expression.unresolved()) {
    if (replacement.name === "input" || replacement.name === "command") {
      return "requiresUserInteraction" /* RequiresUserInteraction */;
    }
    hasUnresolved = true;
  }
  return hasUnresolved ? "unresolvedConfiguration" /* UnresolvedConfiguration */ : void 0;
}

function getPartialSupportReasons(launch, sandboxEnabled, devMode) {
  const reasons = [];
  if (launch.type === 1 /* Stdio */) {
    if (launch.envFile) {
      reasons.push("environmentFileIgnored" /* EnvironmentFileIgnored */);
    }
    if (launch.sandbox || sandboxEnabled) {
      reasons.push("sandboxConfigurationIgnored" /* SandboxConfigurationIgnored */);
    }
  } else if (launch.oauth) {
    reasons.push("oauthClientConfigurationIgnored" /* OAuthClientConfigurationIgnored */);
  }
  if (devMode) {
    reasons.push("developmentModeIgnored" /* DevelopmentModeIgnored */);
  }
  return reasons;
}

function getCompatibility(unsupportedReasons, partialReasons, unknownReasons) {
  if (unsupportedReasons.length > 0) {
    return unsupported(unsupportedReasons);
  }
  if (unknownReasons.length > 0) {
    return unknown(unknownReasons);
  }
  if (partialReasons.length > 0) {
    return { kind: "partiallySupported", reasons: partialReasons };
  }
  return supported();
}

function supported() {
  return { kind: "supported" };
}

function unsupported(reasons) {
  return { kind: "unsupported", reasons };
}

function unknown(reasons) {
  return { kind: "unknown", reasons };
}
export { agentHostProviderHasBuiltInGitHubMcpServer, assessMcpServersForCopilotAgentHost, mergeInstalledMcpServersIntoAgentHostSupportAssessment, resolveMcpServersForAgentHostDelivery, resolveMcpServerForAgentHostDelivery, createResolution, getMcpServerSource, getMcpServerSourceKind, getMcpCollectionSourceKind, getExternalConfigurationSourceKind, getMcpServerSourceGroup, getMcpServerApplicability, getMcpConfigurationApplicability, getMcpServerEnablement, getInstalledMcpServerEnablementOverride, assessDisabledInstalledMcpServer, getCollectionIdFromInstalledServer, getMcpConfigurationSourceKind, getInstalledMcpServerCompatibility, isPluginCollection, getPluginUri, isProviderBuiltInReplacement, hasBuiltInGitHubMcpServer, deliveryForInapplicable, projectMcpServerConfiguration, resolveMcpConfigurationForSync, getUnresolvedConfigurationReason, getExpressionUnresolvedReason, getPartialSupportReasons, getCompatibility, supported, unsupported, unknown, COPILOT_CHAT_EXTENSION_ID, LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX, AGENT_HOST_PROVIDERS_WITH_GITHUB_MCP, COPILOT_CHAT_GITHUB_MCP_COLLECTION_ID };
