// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpLanguageFeatures.ts
import { Disposable, DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { findNodeAtLocation, parseTree } from "./module-0885.mjs";
import { computeLevenshteinDistance } from "./module-0166.mjs";
import { ConfigurationResolverExpression } from "./module-1405.mjs";
import { localize } from "./module-0001.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { countRunningMcpServersInOtherSessions, getActiveAgentHostMcpSessionResource } from "./module-2876.mjs";
import { Range2 } from "./module-0106.mjs";
import { isContributionDisabled } from "./module-1019.mjs";
import { IMcpService, IMcpWorkbenchService, McpConnectionState, mcpOAuthClientSecretStorageKey } from "./module-1206.mjs";
import { URI } from "./module-0032.mjs";
import { AgentSession } from "./module-1107.mjs";
import { IAgentHostConnectionsService, LOCAL_AGENT_HOST_SCHEME_PREFIX } from "./module-0960.mjs";
import { remoteAgentHostSessionTypeId } from "./module-0959.mjs";
import { isCustomizationEnabled } from "./module-1742.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { mcpConfigurationSection } from "./module-1420.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IAgentHostCustomizationService } from "./module-1763.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { ISecretStorageService } from "./module-0949.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpLanguageFeatures.ts
var diagnosticOwner = "vscode.mcp";

var McpLanguageFeatures = class extends Disposable {
  constructor(languageFeaturesService, _mcpRegistry, _mcpWorkbenchService, _mcpService, _chatWidgetService, _agentHostCustomizationService, _agentHostConnectionsService, _markerService, _configurationResolverService, _secretStorageService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._mcpWorkbenchService = _mcpWorkbenchService;
    this._mcpService = _mcpService;
    this._chatWidgetService = _chatWidgetService;
    this._agentHostCustomizationService = _agentHostCustomizationService;
    this._agentHostConnectionsService = _agentHostConnectionsService;
    this._markerService = _markerService;
    this._configurationResolverService = _configurationResolverService;
    this._secretStorageService = _secretStorageService;
    this._cachedMcpSection = this._register(new MutableDisposable());
    const patterns = [
      { pattern: "**/mcp.json" },
      { pattern: "**/.mcp.json" },
      { pattern: "**/workspace.json" }
    ];
    const onDidChangeCodeLens = this._register(new Emitter());
    const codeLensProvider = {
      onDidChange: onDidChangeCodeLens.event,
      provideCodeLenses: (model, range2) => this._provideCodeLenses(model, () => onDidChangeCodeLens.fire(codeLensProvider))
    };
    const refreshCodeLens = () => onDidChangeCodeLens.fire(codeLensProvider);
    this._register(languageFeaturesService.codeLensProvider.register(patterns, codeLensProvider));
    this._register(this._secretStorageService.onDidChangeSecret((key3) => {
      if (key3.startsWith("mcp.oauth.clientSecret:")) {
        refreshCodeLens();
      }
    }));
    const focusedWidgetViewModelListener = this._register(new MutableDisposable());
    const updateFocusedWidgetViewModelListener = () => {
      focusedWidgetViewModelListener.value = this._chatWidgetService.lastFocusedWidget?.onDidChangeViewModel(refreshCodeLens);
      refreshCodeLens();
    };
    const connectionStateListeners = this._register(new MutableDisposable());
    const updateConnectionStateListeners = () => {
      const store = new DisposableStore();
      for (const connectionInfo of this._agentHostConnectionsService.connections) {
        const connection = connectionInfo.connection;
        if (connection) {
          store.add(connection.onDidAction(({ action }) => {
            switch (action.type) {
              case "session/customizationsChanged" /* SessionCustomizationsChanged */:
              case "session/customizationUpdated" /* SessionCustomizationUpdated */:
              case "session/customizationRemoved" /* SessionCustomizationRemoved */:
              case "session/mcpServerStateChanged" /* SessionMcpServerStateChanged */:
                refreshCodeLens();
                break;
            }
          }));
        }
      }
      connectionStateListeners.value = store;
      refreshCodeLens();
    };
    updateFocusedWidgetViewModelListener();
    updateConnectionStateListeners();
    this._register(this._chatWidgetService.onDidChangeFocusedWidget(updateFocusedWidgetViewModelListener));
    this._register(this._chatWidgetService.onDidChangeFocusedSession(refreshCodeLens));
    this._register(this._agentHostConnectionsService.onDidChangeConnections(updateConnectionStateListeners));
    this._register(this._agentHostCustomizationService.onDidChangeCustomizations(refreshCodeLens));
    this._register(languageFeaturesService.inlayHintsProvider.register(patterns, {
      onDidChangeInlayHints: _mcpRegistry.onDidChangeInputs,
      provideInlayHints: (model, range2) => this._provideInlayHints(model, range2)
    }));
  }
  /** Simple mechanism to avoid extra json parsing for hints+lenses */
  async _parseModel(model) {
    if (this._cachedMcpSection.value?.model === model) {
      return this._cachedMcpSection.value;
    }
    const uri4 = model.uri;
    const inConfig = uri4.path.endsWith("/.mcp.json") ? { scope: 1 /* WORKSPACE */, target: 6 /* WORKSPACE_FOLDER */, serversKey: "mcpServers" } : await this._mcpWorkbenchService.getMcpConfigPath(model.uri);
    if (!inConfig) {
      return void 0;
    }
    const value2 = model.getValue();
    const tree = parseTree(value2);
    const listeners = [
      model.onDidChangeContent(() => this._cachedMcpSection.clear()),
      model.onWillDispose(() => this._cachedMcpSection.clear())
    ];
    this._addDiagnostics(model, value2, tree, inConfig);
    return this._cachedMcpSection.value = {
      model,
      tree,
      inConfig,
      dispose: () => {
        this._markerService.remove(diagnosticOwner, [uri4]);
        dispose(listeners);
      }
    };
  }
  _addDiagnostics(tm, value2, tree, inConfig) {
    const serversKey = inConfig.serversKey ?? "servers";
    const serversNode = findNodeAtLocation(tree, inConfig.section ? [...inConfig.section, serversKey] : [serversKey]);
    if (!serversNode) {
      return;
    }
    const getClosestMatchingVariable = (name) => {
      let bestValue = "";
      let bestDistance = Infinity;
      for (const variable of this._configurationResolverService.resolvableVariables) {
        const distance = computeLevenshteinDistance(name, variable);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestValue = variable;
        }
      }
      return bestValue;
    };
    const diagnostics = [];
    forEachPropertyWithReplacement(serversNode, (node) => {
      const expr = ConfigurationResolverExpression.parse(node.value);
      for (const { id: id2, name, arg } of expr.unresolved()) {
        if (!this._configurationResolverService.resolvableVariables.has(name)) {
          const position2 = value2.indexOf(id2, node.offset);
          if (position2 === -1) {
            continue;
          }
          const start = tm.getPositionAt(position2);
          const end = tm.getPositionAt(position2 + id2.length);
          diagnostics.push({
            severity: 4 /* Warning */,
            message: localize(16963, null, name, getClosestMatchingVariable(name) + (arg ? `:${arg}` : "")),
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column,
            modelVersionId: tm.getVersionId()
          });
        }
      }
    });
    if (diagnostics.length) {
      this._markerService.changeOne(diagnosticOwner, tm.uri, diagnostics);
    } else {
      this._markerService.remove(diagnosticOwner, [tm.uri]);
    }
  }
  async _provideCodeLenses(model, onDidChangeCodeLens) {
    const parsed = await this._parseModel(model);
    if (!parsed) {
      return void 0;
    }
    const { tree, inConfig } = parsed;
    const serversKey = inConfig.serversKey ?? "servers";
    const serversNode = findNodeAtLocation(tree, inConfig.section ? [...inConfig.section, serversKey] : [serversKey]);
    if (!serversNode) {
      return void 0;
    }
    const store = new DisposableStore();
    const lenses = [];
    const lensList = { lenses, dispose: () => store.dispose() };
    const read = (observable) => {
      store.add(Event2.fromObservableLight(observable)(onDidChangeCodeLens));
      return observable.get();
    };
    const collection = read(this._mcpRegistry.collections).find((c) => isEqual2(c.presentation?.origin, model.uri));
    if (!collection) {
      return lensList;
    }
    const agentHostSession = getActiveAgentHostMcpSessionResource(this._chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource);
    if (agentHostSession) {
      const mcpServers = this._agentHostCustomizationService.getMcpServers(agentHostSession);
      const otherRunningCounts = this._getOtherRunningAgentHostMcpServerCounts(agentHostSession);
      for (const node of serversNode.children || []) {
        if (node.type !== "property" || node.children?.[0]?.type !== "string") {
          continue;
        }
        const name = node.children[0].value;
        const server = mcpServers.find((s) => s.name === name);
        if (!server) {
          continue;
        }
        this._addAgentHostServerCodeLenses(lenses, Range2.fromPositions(model.getPositionAt(node.children[0].offset)), agentHostSession, server, otherRunningCounts.get(name) ?? 0);
      }
    } else {
      const mcpServers = read(this._mcpService.servers).filter((s) => s.collection.id === collection.id);
      for (const node of serversNode.children || []) {
        if (node.type !== "property" || node.children?.[0]?.type !== "string") {
          continue;
        }
        const name = node.children[0].value;
        const server = mcpServers.find((s) => s.definition.label === name);
        if (!server) {
          continue;
        }
        const range2 = Range2.fromPositions(model.getPositionAt(node.children[0].offset));
        if (isContributionDisabled(read(server.enablement))) {
          lenses.push({
            range: range2,
            command: {
              id: "workbench.mcp.serverOptions" /* ServerOptions */,
              title: "$(circle-slash) " + localize(16965, null),
              arguments: [server.definition.id]
            }
          });
          continue;
        }
        const canDebug = !!server.readDefinitions().get().server?.devMode?.debug;
        const state = read(server.connectionState).state;
        switch (state) {
          case McpConnectionState.Kind.Error:
            lenses.push({
              range: range2,
              command: {
                id: "workbench.mcp.showOutput" /* ShowOutput */,
                title: "$(error) " + localize(16966, null),
                arguments: [server.definition.id]
              }
            }, {
              range: range2,
              command: {
                id: "workbench.mcp.restartServer" /* RestartServer */,
                title: localize(16958, null),
                arguments: [server.definition.id, { autoTrustChanges: true }]
              }
            });
            if (canDebug) {
              lenses.push({
                range: range2,
                command: {
                  id: "workbench.mcp.restartServer" /* RestartServer */,
                  title: localize(16956, null),
                  arguments: [server.definition.id, { debug: true, autoTrustChanges: true }]
                }
              });
            }
            break;
          case McpConnectionState.Kind.Starting:
            lenses.push({
              range: range2,
              command: {
                id: "workbench.mcp.showOutput" /* ShowOutput */,
                title: "$(loading~spin) " + localize(16971, null),
                arguments: [server.definition.id]
              }
            }, {
              range: range2,
              command: {
                id: "workbench.mcp.stopServer" /* StopServer */,
                title: localize(16949, null),
                arguments: [server.definition.id]
              }
            });
            break;
          case McpConnectionState.Kind.Running:
            lenses.push({
              range: range2,
              command: {
                id: "workbench.mcp.showOutput" /* ShowOutput */,
                title: "$(check) " + localize(16968, null),
                arguments: [server.definition.id]
              }
            }, {
              range: range2,
              command: {
                id: "workbench.mcp.stopServer" /* StopServer */,
                title: localize(16962, null),
                arguments: [server.definition.id]
              }
            }, {
              range: range2,
              command: {
                id: "workbench.mcp.restartServer" /* RestartServer */,
                title: localize(16958, null),
                arguments: [server.definition.id, { autoTrustChanges: true }]
              }
            });
            if (canDebug) {
              lenses.push({
                range: range2,
                command: {
                  id: "workbench.mcp.restartServer" /* RestartServer */,
                  title: localize(16956, null),
                  arguments: [server.definition.id, { autoTrustChanges: true, debug: true }]
                }
              });
            }
            break;
          case McpConnectionState.Kind.Stopped:
            lenses.push({
              range: range2,
              command: {
                id: "workbench.mcp.startServer" /* StartServer */,
                title: "$(debug-start) " + localize(16961, null),
                arguments: [server.definition.id, { autoTrustChanges: true }]
              }
            });
            if (canDebug) {
              lenses.push({
                range: range2,
                command: {
                  id: "workbench.mcp.startServer" /* StartServer */,
                  title: localize(16956, null),
                  arguments: [server.definition.id, { autoTrustChanges: true, debug: true }]
                }
              });
            }
        }
        if (state !== McpConnectionState.Kind.Error) {
          const toolCount = read(server.tools).length;
          if (toolCount) {
            lenses.push({
              range: range2,
              command: {
                id: "",
                title: localize(16972, null, toolCount)
              }
            });
          }
          const promptCount = read(server.prompts).length;
          if (promptCount) {
            lenses.push({
              range: range2,
              command: {
                id: "workbench.mcp.startPromptForServer" /* StartPromptForServer */,
                title: localize(16967, null, promptCount),
                arguments: [server]
              }
            });
          }
          lenses.push({
            range: range2,
            command: {
              id: "workbench.mcp.serverOptions" /* ServerOptions */,
              title: localize(16959, null),
              arguments: [server.definition.id]
            }
          });
        }
      }
    }
    const candidates = [];
    for (const node of serversNode.children || []) {
      if (node.type !== "property" || node.children?.[0]?.type !== "string" || !node.children[1]) {
        continue;
      }
      const serverName = node.children[0].value;
      const serverValue = node.children[1];
      const clientIdNode = findNodeAtLocation(serverValue, ["oauth", "clientId"]);
      if (clientIdNode && clientIdNode.type === "string") {
        const clientId = clientIdNode.value;
        if (clientId) {
          const urlNode = findNodeAtLocation(serverValue, ["url"]);
          const rawUrl = urlNode && urlNode.type === "string" ? urlNode.value : void 0;
          if (!rawUrl) {
            continue;
          }
          let mcpServerUrl;
          try {
            mcpServerUrl = URI.parse(rawUrl).toString(true);
          } catch {
            continue;
          }
          candidates.push({ clientId, mcpServerUrl, serverName, clientIdOffset: clientIdNode.offset });
        }
      }
    }
    const existingSecrets = await Promise.all(
      candidates.map((c) => this._secretStorageService.get(mcpOAuthClientSecretStorageKey(c.mcpServerUrl, c.clientId)))
    );
    for (let i2 = 0; i2 < candidates.length; i2++) {
      const { clientId, mcpServerUrl, serverName, clientIdOffset } = candidates[i2];
      const existing = existingSecrets[i2];
      const title = existing ? localize(16957, null) : localize(16960, null);
      lenses.push({
        range: Range2.fromPositions(model.getPositionAt(clientIdOffset)),
        command: {
          id: "workbench.mcp.setOAuthClientSecret" /* SetOAuthClientSecret */,
          title,
          arguments: [clientId, mcpServerUrl, serverName]
        }
      });
    }
    return lensList;
  }
  _addAgentHostServerCodeLenses(lenses, range2, agentHostSession, server, otherRunningSessionCount) {
    const commandArg = { agentHostSession, serverId: server.id };
    if (!server.enabled) {
      lenses.push({
        range: range2,
        command: {
          id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
          title: "$(circle-slash) " + localize(16965, null),
          arguments: [agentHostSession, server.id]
        }
      });
      return;
    }
    switch (server.status) {
      case "error" /* Error */:
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
            title: "$(error) " + localize(16966, null),
            arguments: [agentHostSession, server.id]
          }
        });
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.startServer" /* StartServer */,
            title: localize(16961, null),
            arguments: [commandArg]
          }
        });
        break;
      case "starting" /* Starting */:
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
            title: "$(loading~spin) " + localize(16971, null),
            arguments: [agentHostSession, server.id]
          }
        });
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.stopServer" /* StopServer */,
            title: localize(16949, null),
            arguments: [commandArg]
          }
        });
        break;
      case "ready" /* Ready */:
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
            title: "$(check) " + localize(16968, null),
            arguments: [agentHostSession, server.id]
          }
        });
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.stopServer" /* StopServer */,
            title: localize(16962, null),
            arguments: [commandArg]
          }
        });
        break;
      case "authRequired" /* AuthRequired */:
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
            title: "$(account) " + localize(16964, null),
            arguments: [agentHostSession, server.id]
          }
        });
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.stopServer" /* StopServer */,
            title: localize(16962, null),
            arguments: [commandArg]
          }
        });
        break;
      case "stopped" /* Stopped */:
        lenses.push({
          range: range2,
          command: {
            id: "workbench.mcp.startServer" /* StartServer */,
            title: "$(debug-start) " + localize(16961, null),
            arguments: [commandArg]
          }
        });
        break;
    }
    if (otherRunningSessionCount > 0) {
      lenses.push({
        range: range2,
        command: {
          id: "",
          title: otherRunningSessionCount === 1 ? localize(16969, null) : localize(16970, null, otherRunningSessionCount)
        }
      });
    }
    if (server.status !== "error" /* Error */) {
      lenses.push({
        range: range2,
        command: {
          id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
          title: localize(16959, null),
          arguments: [agentHostSession, server.id]
        }
      });
    }
  }
  _getOtherRunningAgentHostMcpServerCounts(agentHostSession) {
    const sessionServers = [];
    for (const connectionInfo of this._agentHostConnectionsService.connections) {
      const connection = connectionInfo.connection;
      if (!connection) {
        continue;
      }
      for (const subscription of connection.getActiveSubscriptions()) {
        if (subscription.kind !== 1 /* Session */) {
          continue;
        }
        const state = connection.getSubscriptionUnmanaged(1 /* Session */, subscription.resource)?.value;
        const resource = this._toAgentHostSessionResource(connectionInfo, subscription.resource);
        if (!resource || !state || state instanceof Error) {
          continue;
        }
        sessionServers.push({ resource, servers: this._getMcpServersFromSessionState(state) });
      }
    }
    return countRunningMcpServersInOtherSessions(agentHostSession, sessionServers);
  }
  _toAgentHostSessionResource(connectionInfo, backendSession) {
    const provider = AgentSession.provider(backendSession);
    if (!provider) {
      return void 0;
    }
    const scheme = connectionInfo.isAmbient ? `${LOCAL_AGENT_HOST_SCHEME_PREFIX}${provider}` : remoteAgentHostSessionTypeId(connectionInfo.authority, provider);
    return URI.from({ scheme, path: backendSession.path });
  }
  _getMcpServersFromSessionState(state) {
    const servers = [];
    const collect2 = (customizations) => {
      for (const customization of customizations ?? []) {
        if (customization.type === "mcpServer" /* McpServer */) {
          servers.push({
            name: customization.name,
            enabled: isCustomizationEnabled(customization),
            status: customization.state.kind
          });
        } else if (customization.type === "directory" /* Directory */ || customization.type === "plugin" /* Plugin */) {
          collect2(customization.children);
        }
      }
    };
    collect2(state.customizations);
    return servers;
  }
  async _provideInlayHints(model, range2) {
    const parsed = await this._parseModel(model);
    if (!parsed) {
      return void 0;
    }
    const { tree, inConfig } = parsed;
    const mcpSection = inConfig.section ? findNodeAtLocation(tree, [...inConfig.section]) : tree;
    if (!mcpSection) {
      return void 0;
    }
    const inputsNode = findNodeAtLocation(mcpSection, ["inputs"]);
    if (!inputsNode) {
      return void 0;
    }
    const inputs = await this._mcpRegistry.getSavedInputs(inConfig.scope);
    const hints = [];
    const serversNode = findNodeAtLocation(mcpSection, [inConfig.serversKey ?? "servers"]);
    if (serversNode) {
      annotateServers(serversNode);
    }
    annotateInputs(inputsNode);
    return { hints, dispose: () => {
    } };
    function annotateServers(servers) {
      forEachPropertyWithReplacement(servers, (node) => {
        const expr = ConfigurationResolverExpression.parse(node.value);
        for (const { id: id2 } of expr.unresolved()) {
          const saved = inputs[id2];
          if (saved) {
            pushAnnotation(id2, node.offset + node.value.indexOf(id2) + id2.length, saved);
          }
        }
      });
    }
    function annotateInputs(node) {
      if (node.type !== "array" || !node.children) {
        return;
      }
      for (const input of node.children) {
        if (input.type !== "object" || !input.children) {
          continue;
        }
        const idProp = input.children.find((c) => c.type === "property" && c.children?.[0].value === "id");
        if (!idProp) {
          continue;
        }
        const id2 = idProp.children[1];
        if (!id2 || id2.type !== "string" || !id2.value) {
          continue;
        }
        const savedId = "${input:" + id2.value + "}";
        const saved = inputs[savedId];
        if (saved) {
          pushAnnotation(savedId, id2.offset + 1 + id2.length, saved);
        }
      }
    }
    function pushAnnotation(savedId, offset, saved) {
      const tooltip = new MarkdownString([
        createMarkdownCommandLink({ id: "workbench.mcp.editStoredInput" /* EditStoredInput */, text: localize(16954, null), arguments: [savedId, model.uri, mcpConfigurationSection, inConfig.target], tooltip: localize(16955, null) }),
        createMarkdownCommandLink({ id: "workbench.mcp.removeStoredInput" /* RemoveStoredInput */, text: localize(16950, null), arguments: [inConfig.scope, savedId], tooltip: localize(16951, null) }),
        createMarkdownCommandLink({ id: "workbench.mcp.removeStoredInput" /* RemoveStoredInput */, text: localize(16952, null), arguments: [inConfig.scope], tooltip: localize(16953, null) })
      ].join(" | "), { isTrusted: true });
      const hint = {
        label: "= " + (saved.input?.type === "promptString" && saved.input.password ? "*".repeat(10) : saved.value || ""),
        position: model.getPositionAt(offset),
        tooltip,
        paddingLeft: true
      };
      hints.push(hint);
      return hint;
    }
  }
};

McpLanguageFeatures = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, IMcpWorkbenchService),
  __decorateParam(3, IMcpService),
  __decorateParam(4, IChatWidgetService),
  __decorateParam(5, IAgentHostCustomizationService),
  __decorateParam(6, IAgentHostConnectionsService),
  __decorateParam(7, IMarkerService),
  __decorateParam(8, IConfigurationResolverService),
  __decorateParam(9, ISecretStorageService)
], McpLanguageFeatures);

function forEachPropertyWithReplacement(node, callback) {
  if (node.type === "string" && typeof node.value === "string" && node.value.includes(ConfigurationResolverExpression.VARIABLE_LHS)) {
    callback(node);
  } else if (node.type === "property") {
    node.children?.slice(1).forEach((n2) => forEachPropertyWithReplacement(n2, callback));
  } else {
    node.children?.forEach((n2) => forEachPropertyWithReplacement(n2, callback));
  }
}
export { forEachPropertyWithReplacement, diagnosticOwner, McpLanguageFeatures };
