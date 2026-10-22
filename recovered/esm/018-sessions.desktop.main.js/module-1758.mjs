// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/syncedCustomizationBundler.ts
import { Disposable } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { SYNCED_CUSTOMIZATION_SCHEME } from "./module-1756.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { toClientPluginMcpDefaultCwdsMeta } from "./module-1754.mjs";
import { hash } from "./module-0039.mjs";
import { equals4 } from "./module-0098.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { customizationId } from "./module-1008.mjs";
import { withCustomizationEnablement } from "./module-1742.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IAgentHostFileSystemService2 } from "./module-1757.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/syncedCustomizationBundler.ts
var DISPLAY_NAME = "VS Code Synced Data";

var MANIFEST_CONTENT = JSON.stringify({
  name: DISPLAY_NAME,
  description: "Customization data synced from VS Code"
}, null, "	");

function pluginDirForType(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return "rules";
    case "prompt" /* prompt */:
      return "commands";
    case "agent" /* agent */:
      return "agents";
    case "skill" /* skill */:
      return "skills";
    case "hook" /* hook */:
      return void 0;
  }
}

var SyncedCustomizationBundler = class extends Disposable {
  constructor(authority, _fileService, agentHostFileSystemService) {
    super();
    this._fileService = _fileService;
    /** Maps a synced (destination) URI string back to its original source location. Rebuilt on every {@link bundle}. */
    this._originByDest = new ResourceMap();
    this._authority = authority;
    agentHostFileSystemService.ensureSyncedCustomizationProvider();
  }
  /**
   * Root URI of the virtual plugin directory for this bundler.
   * The authority is encoded into the path (not the URI authority) because
   * {@link InMemoryFileSystemProvider} only routes by path.
   */
  get _rootUri() {
    return URI.from({ scheme: SYNCED_CUSTOMIZATION_SCHEME, path: `/${this._authority}` });
  }
  /**
   * Bundles the given files and MCP servers into the in-memory plugin
   * filesystem.
   *
   * Overwrites any previous bundle content. Returns a {@link ClientPluginCustomization}
   * pointing at the virtual plugin directory with a content-based nonce.
   *
   * @returns The bundle result, or `undefined` if there is nothing to sync.
   */
  async bundle(files, mcpServers = []) {
    const syncable = files.filter((f) => pluginDirForType(f.type) !== void 0);
    if (syncable.length === 0 && mcpServers.length === 0) {
      return void 0;
    }
    const entries2 = [];
    const originByDest = new ResourceMap();
    await Promise.all(syncable.map(async (file) => {
      const dir = pluginDirForType(file.type);
      const fileName = basename2(file.uri);
      let destUri;
      let hashKey;
      if (file.type === "skill" /* skill */ && fileName.toLowerCase() === "skill.md") {
        const skillDirName = basename2(dirname2(file.uri));
        destUri = URI.joinPath(this._rootUri, dir, skillDirName, fileName);
        hashKey = `${dir}/${skillDirName}/${fileName}`;
      } else {
        destUri = URI.joinPath(this._rootUri, dir, fileName);
        hashKey = `${dir}/${fileName}`;
      }
      if (file.source !== void 0) {
        originByDest.set(destUri, {
          uri: file.uri,
          source: file.source,
          extensionId: file.extensionId,
          pluginUri: file.pluginUri
        });
      }
      const content = await this._fileService.readFile(file.uri);
      entries2.push({ destUri, content: content.value, hashPart: `${hashKey}:${content.value.toString()}` });
    }));
    this._originByDest = originByDest;
    let mcpContent;
    let mcpDefaultCwds;
    const childEnablement = {};
    if (mcpServers.length > 0) {
      const servers = {};
      const defaultCwds = {};
      for (const server of [...mcpServers].sort((a, b) => a.name.localeCompare(b.name))) {
        servers[server.name] = server.configuration;
        defaultCwds[server.name] = server.defaultCwd ?? null;
        childEnablement[server.name] = server.enablement.slice();
      }
      mcpDefaultCwds = defaultCwds;
      mcpContent = JSON.stringify({ mcpServers: servers }, null, "	");
    }
    const hashParts = entries2.map((e4) => e4.hashPart);
    if (mcpContent !== void 0) {
      hashParts.push(`.mcp.json:${mcpContent}`);
    }
    if (mcpDefaultCwds !== void 0) {
      hashParts.push(`mcpDefaultCwds:${JSON.stringify(toClientPluginMcpDefaultCwdsMeta(mcpDefaultCwds))}`);
    }
    hashParts.sort();
    const nonce = String(hash(hashParts.join("\n")));
    if (nonce === this._lastNonce && this._lastRef) {
      if (mcpServers.length > 0 && !equals4(childEnablement, this._lastRef.ref.childEnablement)) {
        return {
          ref: {
            ...this._lastRef.ref,
            childEnablement
          }
        };
      }
      return this._lastRef;
    }
    try {
      await this._fileService.del(this._rootUri, { recursive: true });
    } catch {
    }
    const manifestUri = URI.joinPath(this._rootUri, ".plugin", "plugin.json");
    await this._fileService.writeFile(manifestUri, VSBuffer.fromString(MANIFEST_CONTENT));
    for (const entry of entries2) {
      await this._fileService.writeFile(entry.destUri, entry.content);
    }
    if (mcpContent !== void 0) {
      const mcpUri = URI.joinPath(this._rootUri, ".mcp.json");
      await this._fileService.writeFile(mcpUri, VSBuffer.fromString(mcpContent));
    }
    this._lastNonce = nonce;
    const rootUriString = this._rootUri.toString();
    const result = {
      ref: {
        type: "plugin" /* Plugin */,
        id: customizationId(rootUriString),
        uri: rootUriString,
        name: DISPLAY_NAME,
        nonce,
        _meta: mcpDefaultCwds ? toClientPluginMcpDefaultCwdsMeta(mcpDefaultCwds) : void 0,
        enablement: withCustomizationEnablement(void 0, "global" /* Global */, {
          kind: "global" /* Global */,
          enabled: true
        }),
        ...mcpServers.length > 0 ? { childEnablement } : {}
      }
    };
    this._lastRef = result;
    return result;
  }
  /**
   * Returns the last computed nonce, or `undefined` if no bundle has been created.
   */
  get lastNonce() {
    return this._lastNonce;
  }
  isBundledMcpServer(pluginUri, serverName) {
    return this._lastRef?.ref.uri === pluginUri && Object.hasOwn(this._lastRef.ref.childEnablement ?? {}, serverName);
  }
  /**
   * Recovers the original provenance of a file that was flattened into the
   * synthetic bundle, given its synced (destination) URI. Returns `undefined`
   * for URIs that are not part of the most recent bundle.
   */
  getOrigin(syncedUri) {
    return this._originByDest.get(syncedUri);
  }
};

SyncedCustomizationBundler = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IAgentHostFileSystemService2)
], SyncedCustomizationBundler);
export { pluginDirForType, DISPLAY_NAME, MANIFEST_CONTENT, SyncedCustomizationBundler };
