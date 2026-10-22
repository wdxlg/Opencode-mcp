// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpTypes.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { equals4 } from "./module-0098.mjs";
import { WORKSPACE_FOLDER_CONFIG_ID_PREFIX } from "./module-1204.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { equals } from "./module-0007.mjs";
import { createDecorator } from "./module-0077.mjs";
import { ObservableMap } from "./module-0067.mjs";
import { VSBuffer, decodeHex, encodeHex } from "./module-0038.mjs";
import { localize } from "./module-0001.mjs";
import { assertNever } from "./module-0009.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { MCP } from "./module-1205.mjs";


// src/vs/workbench/contrib/mcp/common/mcpTypes.ts
var extensionMcpCollectionPrefix = "ext.";

var MCP_CONFIGURATION_COLLECTION_ID_PREFIX = "mcp.config.";

var MCP_PLUGIN_COLLECTION_ID_PREFIX = "plugin.";

var CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX = "cursor-workspace.";

function getMcpCollectionProvenance(target) {
  switch (target) {
    case 2 /* USER */:
    case 3 /* USER_LOCAL */:
      return "userProfile" /* UserProfile */;
    case 4 /* USER_REMOTE */:
      return "remoteUser" /* RemoteUser */;
    case 5 /* WORKSPACE */:
      return "workspaceConfiguration" /* WorkspaceConfiguration */;
    case 6 /* WORKSPACE_FOLDER */:
      return "workspaceFolderConfiguration" /* WorkspaceFolderConfiguration */;
    default:
      return void 0;
  }
}

var WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX = "workspace-dot-mcp.";

function extensionPrefixedIdentifier(identifier2, id2) {
  return ExtensionIdentifier.toKey(identifier2) + "/" + id2;
}

var McpCollectionDefinition;

((McpCollectionDefinition10) => {
  function equals5(a, b) {
    return a.id === b.id && a.remoteAuthority === b.remoteAuthority && a.label === b.label && a.provenance === b.provenance && a.discoverySource === b.discoverySource && a.trustBehavior === b.trustBehavior && equals4(a.sandbox, b.sandbox);
  }
  McpCollectionDefinition10.equals = equals5;
  function isWorkspaceDiscovered(collection) {
    return collection.configTarget === 5 /* WORKSPACE */ || collection.configTarget === 6 /* WORKSPACE_FOLDER */;
  }
  McpCollectionDefinition10.isWorkspaceDiscovered = isWorkspaceDiscovered;
  function isVscodeMcpJson(collection) {
    return collection.id.startsWith(`${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}${WORKSPACE_FOLDER_CONFIG_ID_PREFIX}`);
  }
  McpCollectionDefinition10.isVscodeMcpJson = isVscodeMcpJson;
})(McpCollectionDefinition || (McpCollectionDefinition = {}));

var McpServerDefinition;

((McpServerDefinition14) => {
  function toSerialized(def2) {
    return def2;
  }
  McpServerDefinition14.toSerialized = toSerialized;
  function fromSerialized(def2) {
    return {
      id: def2.id,
      label: def2.label,
      cacheNonce: def2.cacheNonce,
      staticMetadata: def2.staticMetadata,
      launch: McpServerLaunch.fromSerialized(def2.launch),
      defaultCwd: def2.defaultCwd ? URI.revive(def2.defaultCwd) : void 0,
      sandboxEnabled: def2.sandboxEnabled,
      variableReplacement: def2.variableReplacement ? McpServerDefinitionVariableReplacement.fromSerialized(def2.variableReplacement) : void 0
    };
  }
  McpServerDefinition14.fromSerialized = fromSerialized;
  function equals5(a, b) {
    return a.id === b.id && a.label === b.label && a.cacheNonce === b.cacheNonce && isEqual2(a.defaultCwd, b.defaultCwd) && equals(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && equals4(a.launch, b.launch) && equals4(a.presentation, b.presentation) && equals4(a.variableReplacement, b.variableReplacement) && equals4(a.devMode, b.devMode) && a.sandboxEnabled === b.sandboxEnabled;
  }
  McpServerDefinition14.equals = equals5;
})(McpServerDefinition || (McpServerDefinition = {}));

var McpServerDefinitionVariableReplacement;

((McpServerDefinitionVariableReplacement2) => {
  function toSerialized(def2) {
    return def2;
  }
  McpServerDefinitionVariableReplacement2.toSerialized = toSerialized;
  function fromSerialized(def2) {
    return {
      section: def2.section,
      folder: def2.folder ? { ...def2.folder, uri: URI.revive(def2.folder.uri) } : void 0,
      target: def2.target
    };
  }
  McpServerDefinitionVariableReplacement2.fromSerialized = fromSerialized;
})(McpServerDefinitionVariableReplacement || (McpServerDefinitionVariableReplacement = {}));

var IAutostartResult;

((IAutostartResult3) => {
  IAutostartResult3.Empty = { working: false, starting: [], serversRequiringInteraction: [] };
})(IAutostartResult || (IAutostartResult = {}));

var IMcpService = createDecorator("IMcpService");

var McpStartServerInteraction = class {
  constructor() {
    /** @internal */
    this.participants = new ObservableMap();
  }
};

var McpServerTrust;

((McpServerTrust2) => {
  let Kind;
  ((Kind2) => {
    Kind2[Kind2["Trusted"] = 0] = "Trusted";
    Kind2[Kind2["TrustedOnNonce"] = 1] = "TrustedOnNonce";
    Kind2[Kind2["Untrusted"] = 2] = "Untrusted";
    Kind2[Kind2["Unknown"] = 3] = "Unknown";
  })(Kind = McpServerTrust2.Kind || (McpServerTrust2.Kind = {}));
})(McpServerTrust || (McpServerTrust = {}));

var isMcpResourceTemplate = (obj) => {
  return obj.template !== void 0;
};

var mcpPromptReplaceSpecialChars = (s) => s.replace(/[^a-z0-9_.-]/gi, "_");

var mcpPromptPrefix = (definition) => `/mcp.` + mcpPromptReplaceSpecialChars(definition.label);

function mcpOAuthClientSecretStorageKey(mcpServerUrl, clientId) {
  return `mcp.oauth.clientSecret:${mcpServerUrl}:${clientId}`;
}

var McpServerLaunch;

((McpServerLaunch7) => {
  function toSerialized(launch) {
    return launch;
  }
  McpServerLaunch7.toSerialized = toSerialized;
  function fromSerialized(launch) {
    switch (launch.type) {
      case 2 /* HTTP */:
        return { type: launch.type, uri: URI.revive(launch.uri), headers: launch.headers, oauth: launch.oauth, authentication: launch.authentication };
      case 1 /* Stdio */:
        return {
          type: launch.type,
          cwd: launch.cwd,
          command: launch.command,
          args: launch.args,
          env: launch.env,
          envFile: launch.envFile,
          sandbox: launch.sandbox
        };
    }
  }
  McpServerLaunch7.fromSerialized = fromSerialized;
  function fromServerConfiguration(configuration2, sandbox) {
    if (configuration2.type === "stdio" /* LOCAL */) {
      return {
        type: 1 /* Stdio */,
        command: configuration2.command,
        args: configuration2.args ? [...configuration2.args] : [],
        env: configuration2.env ? { ...configuration2.env } : {},
        envFile: configuration2.envFile,
        cwd: configuration2.cwd,
        sandbox
      };
    }
    try {
      return {
        type: 2 /* HTTP */,
        uri: URI.parse(configuration2.url),
        headers: Object.entries(configuration2.headers ?? {}),
        oauth: configuration2.oauth
      };
    } catch {
      return void 0;
    }
  }
  McpServerLaunch7.fromServerConfiguration = fromServerConfiguration;
  async function hash2(launch) {
    const nonce = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(launch)));
    return encodeHex(VSBuffer.wrap(new Uint8Array(nonce)));
  }
  McpServerLaunch7.hash = hash2;
})(McpServerLaunch || (McpServerLaunch = {}));

var McpConnectionState;

((McpConnectionState2) => {
  let Kind;
  ((Kind2) => {
    Kind2[Kind2["Stopped"] = 0] = "Stopped";
    Kind2[Kind2["Starting"] = 1] = "Starting";
    Kind2[Kind2["Running"] = 2] = "Running";
    Kind2[Kind2["Error"] = 3] = "Error";
  })(Kind = McpConnectionState2.Kind || (McpConnectionState2.Kind = {}));
  McpConnectionState2.toString = (s) => {
    switch (s.state) {
      case 0 /* Stopped */:
        return localize(17207, null);
      case 1 /* Starting */:
        return localize(17206, null);
      case 2 /* Running */:
        return localize(17205, null);
      case 3 /* Error */:
        return localize(17204, null, s.message);
      default:
        assertNever(s);
    }
  };
  McpConnectionState2.toKindString = (s) => {
    switch (s) {
      case 0 /* Stopped */:
        return "stopped";
      case 1 /* Starting */:
        return "starting";
      case 2 /* Running */:
        return "running";
      case 3 /* Error */:
        return "error";
      default:
        assertNever(s);
    }
  };
  McpConnectionState2.canBeStarted = (s) => s === 3 /* Error */ || s === 0 /* Stopped */;
  McpConnectionState2.isRunning = (s) => !(0, McpConnectionState2.canBeStarted)(s.state);
})(McpConnectionState || (McpConnectionState = {}));

var MpcResponseError = class extends Error {
  constructor(message, code, data) {
    super(`MPC ${code}: ${message}`);
    this.code = code;
    this.data = data;
  }
};

var McpConnectionFailedError = class extends Error {
};

var UserInteractionRequiredError = class _UserInteractionRequiredError extends Error {
  constructor(reason) {
    super(`${_UserInteractionRequiredError.prefix}${reason}`);
    this.reason = reason;
  }
  static {
    this.prefix = "User interaction required: ";
  }
  static is(error) {
    return error.message.startsWith(this.prefix);
  }
};

var IMcpWorkbenchService = createDecorator("IMcpWorkbenchService");

var McpServerContainers = class extends Disposable {
  constructor(containers, mcpWorkbenchService) {
    super();
    this.containers = containers;
    this._register(mcpWorkbenchService.onChange(this.update, this));
  }
  set mcpServer(extension) {
    this.containers.forEach((c) => c.mcpServer = extension);
  }
  update(server) {
    for (const container3 of this.containers) {
      if (server && container3.mcpServer) {
        if (server.id === container3.mcpServer.id) {
          container3.mcpServer = server;
        }
      } else {
        container3.update();
      }
    }
  }
};

McpServerContainers = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService)
], McpServerContainers);

var McpServersGalleryStatusContext = new RawContextKey("mcpServersGalleryStatus", "unavailable" /* Unavailable */);

var HasInstalledMcpServersContext = new RawContextKey("hasInstalledMcpServers", true);

var InstalledMcpServersViewId = "workbench.views.mcp.installed";

var McpResourceURI;

((McpResourceURI2) => {
  McpResourceURI2.scheme = "mcp-resource";
  const emptyAuthorityPlaceholder = "dylo78gyp";
  function fromServer(def2, resourceURI) {
    if (typeof resourceURI === "string") {
      resourceURI = URI.parse(resourceURI);
    }
    return resourceURI.with({
      scheme: McpResourceURI2.scheme,
      authority: encodeHex(VSBuffer.fromString(def2.id)),
      path: ["", resourceURI.scheme, resourceURI.authority || emptyAuthorityPlaceholder].join("/") + resourceURI.path
    });
  }
  McpResourceURI2.fromServer = fromServer;
  function toServer(uri5) {
    if (typeof uri5 === "string") {
      uri5 = URI.parse(uri5);
    }
    if (uri5.scheme !== McpResourceURI2.scheme) {
      throw new Error(`Invalid MCP resource URI: ${uri5.toString()}`);
    }
    const parts = uri5.path.split("/");
    if (parts.length < 3) {
      throw new Error(`Invalid MCP resource URI: ${uri5.toString()}`);
    }
    const [, serverScheme, authority, ...path] = parts;
    const url = new URL(`${serverScheme}://${authority.toLowerCase() === emptyAuthorityPlaceholder ? "" : authority}`);
    url.pathname = path.length ? "/" + path.join("/") : "";
    url.search = uri5.query;
    url.hash = uri5.fragment;
    return {
      definitionId: decodeHex(uri5.authority).toString(),
      resourceURL: url
    };
  }
  McpResourceURI2.toServer = toServer;
})(McpResourceURI || (McpResourceURI = {}));

var IMcpSamplingService = createDecorator("IMcpServerSampling");

var McpError = class _McpError extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }
  static methodNotFound(method) {
    return new _McpError(MCP.METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
  static notAllowed() {
    return new _McpError(-32e3, "The user has denied permission to call this method.");
  }
  static unknown(e) {
    const mcpError = new _McpError(MCP.INTERNAL_ERROR, `Unknown error: ${e.stack}`);
    mcpError.cause = e;
    return mcpError;
  }
};

var IMcpElicitationService = createDecorator("IMcpElicitationService");

var McpToolResourceLinkMimeType = "application/vnd.code.resource-link";
export { getMcpCollectionProvenance, extensionPrefixedIdentifier, mcpOAuthClientSecretStorageKey, extensionMcpCollectionPrefix, MCP_CONFIGURATION_COLLECTION_ID_PREFIX, MCP_PLUGIN_COLLECTION_ID_PREFIX, CURSOR_WORKSPACE_MCP_COLLECTION_ID_PREFIX, WORKSPACE_DOT_MCP_COLLECTION_ID_PREFIX, McpCollectionDefinition, McpServerDefinition, McpServerDefinitionVariableReplacement, IAutostartResult, IMcpService, McpStartServerInteraction, McpServerTrust, isMcpResourceTemplate, mcpPromptReplaceSpecialChars, mcpPromptPrefix, McpServerLaunch, McpConnectionState, MpcResponseError, McpConnectionFailedError, UserInteractionRequiredError, IMcpWorkbenchService, McpServerContainers, McpServersGalleryStatusContext, HasInstalledMcpServersContext, InstalledMcpServersViewId, McpResourceURI, IMcpSamplingService, McpError, IMcpElicitationService, McpToolResourceLinkMimeType };
