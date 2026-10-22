// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/nativeMcpDiscoveryAdapters.ts
import { URI } from "./module-0032.mjs";
import { McpServerLaunch } from "./module-1206.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/nativeMcpDiscoveryAdapters.ts
async function claudeConfigToServerDefinition(idPrefix, contents, options3) {
  let parsed;
  try {
    parsed = JSON.parse(contents.toString());
  } catch {
    return;
  }
  return Promise.all(Object.entries(parsed.mcpServers).map(async ([name, server]) => {
    const launch = server.url ? {
      type: 2 /* HTTP */,
      uri: URI.parse(server.url),
      headers: Object.entries(server.headers ?? {})
    } : {
      type: 1 /* Stdio */,
      args: server.args || [],
      command: server.command,
      env: server.env || {},
      envFile: void 0,
      cwd: options3?.cwd?.fsPath,
      sandbox: void 0
    };
    const defaultCwd = launch.type === 1 /* Stdio */ ? options3?.defaultCwd : void 0;
    const nonceLaunch = defaultCwd && launch.type === 1 /* Stdio */ ? { ...launch, cwd: defaultCwd.fsPath } : launch;
    return {
      id: `${idPrefix}.${name}`,
      label: name,
      launch,
      defaultCwd,
      cacheNonce: await McpServerLaunch.hash(nonceLaunch)
    };
  }));
}

var ClaudeDesktopMpcDiscoveryAdapter = class {
  constructor(remoteAuthority) {
    this.remoteAuthority = remoteAuthority;
    this.order = 400 /* Filesystem */;
    this.discoverySource = "claude-desktop" /* ClaudeDesktop */;
    this.id = `claude-desktop.${this.remoteAuthority}`;
  }
  getFilePath({ platform: platform3, winAppData, xdgHome, homedir }) {
    if (platform3 === 3 /* Windows */) {
      const appData = winAppData || URI.joinPath(homedir, "AppData", "Roaming");
      return URI.joinPath(appData, "Claude", "claude_desktop_config.json");
    } else if (platform3 === 1 /* Mac */) {
      return URI.joinPath(homedir, "Library", "Application Support", "Claude", "claude_desktop_config.json");
    } else {
      const configDir = xdgHome || URI.joinPath(homedir, ".config");
      return URI.joinPath(configDir, "Claude", "claude_desktop_config.json");
    }
  }
  adaptFile(contents, { homedir }) {
    return claudeConfigToServerDefinition(this.id, contents, { cwd: homedir });
  }
};

var WindsurfDesktopMpcDiscoveryAdapter = class extends ClaudeDesktopMpcDiscoveryAdapter {
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.discoverySource = "windsurf" /* Windsurf */;
    this.id = `windsurf.${this.remoteAuthority}`;
  }
  getFilePath({ homedir }) {
    return URI.joinPath(homedir, ".codeium", "windsurf", "mcp_config.json");
  }
};

var CursorDesktopMpcDiscoveryAdapter = class extends ClaudeDesktopMpcDiscoveryAdapter {
  constructor(remoteAuthority) {
    super(remoteAuthority);
    this.discoverySource = "cursor-global" /* CursorGlobal */;
    this.id = `cursor.${this.remoteAuthority}`;
  }
  getFilePath({ homedir }) {
    return URI.joinPath(homedir, ".cursor", "mcp.json");
  }
};
export { claudeConfigToServerDefinition, ClaudeDesktopMpcDiscoveryAdapter, WindsurfDesktopMpcDiscoveryAdapter, CursorDesktopMpcDiscoveryAdapter };
