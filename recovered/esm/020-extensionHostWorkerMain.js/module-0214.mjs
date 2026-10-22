// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpTypes.ts
import { ExtensionIdentifier } from "./module-0040.mjs";
import { equals3 } from "./module-0055.mjs";
import { WORKSPACE_FOLDER_CONFIG_ID_PREFIX } from "./module-0212.mjs";
import { URI } from "./module-0023.mjs";
import { isEqual } from "./module-0032.mjs";
import { equals } from "./module-0004.mjs";
import { createDecorator } from "./module-0038.mjs";
import { VSBuffer, decodeHex, encodeHex } from "./module-0013.mjs";
import { localize } from "./module-0015.mjs";
import { assertNever } from "./module-0008.mjs";
import { Disposable } from "./module-0011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { RawContextKey } from "./module-0044.mjs";


// src/vs/workbench/contrib/mcp/common/mcpTypes.ts
var MCP_CONFIGURATION_COLLECTION_ID_PREFIX = "mcp.config.";

function extensionPrefixedIdentifier(identifier, id2) {
  return ExtensionIdentifier.toKey(identifier) + "/" + id2;
}

var McpCollectionDefinition;

((McpCollectionDefinition3) => {
  function equals5(a, b) {
    return a.id === b.id && a.remoteAuthority === b.remoteAuthority && a.label === b.label && a.provenance === b.provenance && a.discoverySource === b.discoverySource && a.trustBehavior === b.trustBehavior && equals3(a.sandbox, b.sandbox);
  }
  McpCollectionDefinition3.equals = equals5;
  function isWorkspaceDiscovered(collection) {
    return collection.configTarget === 5 /* WORKSPACE */ || collection.configTarget === 6 /* WORKSPACE_FOLDER */;
  }
  McpCollectionDefinition3.isWorkspaceDiscovered = isWorkspaceDiscovered;
  function isVscodeMcpJson(collection) {
    return collection.id.startsWith(`${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}${WORKSPACE_FOLDER_CONFIG_ID_PREFIX}`);
  }
  McpCollectionDefinition3.isVscodeMcpJson = isVscodeMcpJson;
})(McpCollectionDefinition || (McpCollectionDefinition = {}));

var McpServerDefinition;

((McpServerDefinition4) => {
  function toSerialized(def2) {
    return def2;
  }
  McpServerDefinition4.toSerialized = toSerialized;
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
  McpServerDefinition4.fromSerialized = fromSerialized;
  function equals5(a, b) {
    return a.id === b.id && a.label === b.label && a.cacheNonce === b.cacheNonce && isEqual(a.defaultCwd, b.defaultCwd) && equals(a.roots, b.roots, (a2, b2) => a2.toString() === b2.toString()) && equals3(a.launch, b.launch) && equals3(a.presentation, b.presentation) && equals3(a.variableReplacement, b.variableReplacement) && equals3(a.devMode, b.devMode) && a.sandboxEnabled === b.sandboxEnabled;
  }
  McpServerDefinition4.equals = equals5;
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

((IAutostartResult2) => {
  IAutostartResult2.Empty = { working: false, starting: [], serversRequiringInteraction: [] };
})(IAutostartResult || (IAutostartResult = {}));

var IMcpService = createDecorator("IMcpService");

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

var McpServerLaunch;

((McpServerLaunch2) => {
  function toSerialized(launch) {
    return launch;
  }
  McpServerLaunch2.toSerialized = toSerialized;
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
  McpServerLaunch2.fromSerialized = fromSerialized;
  function fromServerConfiguration(configuration, sandbox) {
    if (configuration.type === "stdio" /* LOCAL */) {
      return {
        type: 1 /* Stdio */,
        command: configuration.command,
        args: configuration.args ? [...configuration.args] : [],
        env: configuration.env ? { ...configuration.env } : {},
        envFile: configuration.envFile,
        cwd: configuration.cwd,
        sandbox
      };
    }
    try {
      return {
        type: 2 /* HTTP */,
        uri: URI.parse(configuration.url),
        headers: Object.entries(configuration.headers ?? {}),
        oauth: configuration.oauth
      };
    } catch {
      return void 0;
    }
  }
  McpServerLaunch2.fromServerConfiguration = fromServerConfiguration;
  async function hash2(launch) {
    const nonce = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(launch)));
    return encodeHex(VSBuffer.wrap(new Uint8Array(nonce)));
  }
  McpServerLaunch2.hash = hash2;
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
    for (const container of this.containers) {
      if (server && container.mcpServer) {
        if (server.id === container.mcpServer.id) {
          container.mcpServer = server;
        }
      } else {
        container.update();
      }
    }
  }
};

McpServerContainers = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService)
], McpServerContainers);

var McpServersGalleryStatusContext = new RawContextKey("mcpServersGalleryStatus", "unavailable" /* Unavailable */);

var HasInstalledMcpServersContext = new RawContextKey("hasInstalledMcpServers", true);

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
  function toServer(uri2) {
    if (typeof uri2 === "string") {
      uri2 = URI.parse(uri2);
    }
    if (uri2.scheme !== McpResourceURI2.scheme) {
      throw new Error(`Invalid MCP resource URI: ${uri2.toString()}`);
    }
    const parts = uri2.path.split("/");
    if (parts.length < 3) {
      throw new Error(`Invalid MCP resource URI: ${uri2.toString()}`);
    }
    const [, serverScheme, authority, ...path] = parts;
    const url = new URL(`${serverScheme}://${authority.toLowerCase() === emptyAuthorityPlaceholder ? "" : authority}`);
    url.pathname = path.length ? "/" + path.join("/") : "";
    url.search = uri2.query;
    url.hash = uri2.fragment;
    return {
      definitionId: decodeHex(uri2.authority).toString(),
      resourceURL: url
    };
  }
  McpResourceURI2.toServer = toServer;
})(McpResourceURI || (McpResourceURI = {}));

var IMcpSamplingService = createDecorator("IMcpServerSampling");

var IMcpElicitationService = createDecorator("IMcpElicitationService");
export { extensionPrefixedIdentifier, MCP_CONFIGURATION_COLLECTION_ID_PREFIX, McpCollectionDefinition, McpServerDefinition, McpServerDefinitionVariableReplacement, IAutostartResult, IMcpService, McpServerTrust, McpServerLaunch, McpConnectionState, UserInteractionRequiredError, IMcpWorkbenchService, McpServerContainers, McpServersGalleryStatusContext, HasInstalledMcpServersContext, McpResourceURI, IMcpSamplingService, IMcpElicitationService };
