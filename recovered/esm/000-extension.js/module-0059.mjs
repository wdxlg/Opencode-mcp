// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-catalog.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { globalSkillsDirectory } from "./module-0025.mjs";
import { externalMcpTimeout, previewExternalMcpImport, validateExternalMcpId, validateExternalMcpUrl } from "./module-0060.mjs";
import { externalMcpPreviewToken } from "./module-0062.mjs";
import { mergeSecretFields, normalizeImportSecrets } from "./module-0063.mjs";


// extensions/opencode/src/external-mcp-catalog.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto8 = require("node:crypto");

var import_node_fs19 = require("node:fs");

var import_node_os4 = __toESM(require("node:os"));

var import_node_path24 = __toESM(require("node:path"));


// extensions/opencode/src/external-mcp-catalog.ts
var LEGACY_EXTERNAL_MCP_CONFIG_PATH = import_node_path24.default.join(import_node_os4.default.homedir(), ".opencode", "external-mcp.json");

import { localProfilePath, assertMcpRuntimePaths } from './version-paths.mjs';
var EXTERNAL_MCP_CONFIG_FILENAME = "external-mcp.json";

function skillDirectoryIsUsable(directory) {
  try {
    if (!(0, import_node_fs19.existsSync)(directory)) (0, import_node_fs19.mkdirSync)(directory, { recursive: true, mode: 448 });
    (0, import_node_fs19.accessSync)(directory, import_node_fs19.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function defaultExternalMcpConfigPath() {
  // MCP configuration must not follow the shared Skills pointer. Retain the old
  // private file in-place when present; only Skills subdirectories are migrated.
  if (process.env.VSCODE_PORTABLE) {
    const legacy = localProfilePath(import_node_path24.default.join(process.env.VSCODE_PORTABLE, "skills", EXTERNAL_MCP_CONFIG_FILENAME));
    if ((0, import_node_fs19.existsSync)(legacy)) return legacy;
    return localProfilePath(import_node_path24.default.join(process.env.VSCODE_PORTABLE, ".opencode", EXTERNAL_MCP_CONFIG_FILENAME));
  }
  return LEGACY_EXTERNAL_MCP_CONFIG_PATH;
}

var MAX_EXTERNAL_MCP_SERVERS = 100;

var SECRET_REF = /^opencode\.externalMcp\.[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function secretKeys(server) {
  return [server.oauthRef, server.urlRef, server.argsRef, server.proxyRef, ...Object.values(server.envRefs ?? {}), ...Object.values(server.headerRefs ?? {})].filter((key) => !!key);
}

var ExternalMcpCatalog = class {
  constructor(secrets, filePathOverride) {
    this.secrets = secrets;
    this.filePathOverride = filePathOverride;
  }
  secrets;
  filePathOverride;
  listeners = /* @__PURE__ */ new Set();
  pending = Promise.resolve();
  oauthProvider;
  setOAuthProvider(provider) {
    this.oauthProvider = provider;
  }
  network;
  migratedFrom;
  /** Effective config file. Resolved lazily: the global Skill directory is registered after construction. */
  get filePath() {
    if (this.filePathOverride) return localProfilePath(this.filePathOverride);
    const target = defaultExternalMcpConfigPath();
    this.migrateLegacyConfig(target);
    return target;
  }
  /** Non-destructive legacy copy. Never rename a file another version may still use. */
  migrateLegacyConfig(target) {
    if (target === LEGACY_EXTERNAL_MCP_CONFIG_PATH) return;
    try {
      if ((0, import_node_fs19.existsSync)(target) || !(0, import_node_fs19.existsSync)(LEGACY_EXTERNAL_MCP_CONFIG_PATH)) return;
      (0, import_node_fs19.mkdirSync)(import_node_path24.default.dirname(target), { recursive: true, mode: 448 });
      (0, import_node_fs19.copyFileSync)(LEGACY_EXTERNAL_MCP_CONFIG_PATH, target, import_node_fs19.constants.COPYFILE_EXCL);
      this.migratedFrom = LEGACY_EXTERNAL_MCP_CONFIG_PATH;
    } catch {
    }
  }
  /** Read-only answer to "where is my MCP config?" for the configure_mcp tool and diagnostics. */
  locations() {
    const configPath = this.filePath;
    let skills;
    try {
      skills = globalSkillsDirectory();
    } catch {
      skills = void 0;
    }
    return {
      configPath,
      configExists: (0, import_node_fs19.existsSync)(configPath),
      skillsDirectory: skills,
      legacyPath: LEGACY_EXTERNAL_MCP_CONFIG_PATH,
      legacyExists: (0, import_node_fs19.existsSync)(LEGACY_EXTERNAL_MCP_CONFIG_PATH),
      migratedFrom: this.migratedFrom,
      skillDirectoryWritable: skills ? skillDirectoryIsUsable(skills) : void 0,
      secretStorage: process.platform === "win32" ? "Windows \u51ED\u636E\u7BA1\u7406\u5668" : process.platform === "darwin" ? "macOS \u94A5\u5319\u4E32" : "\u7CFB\u7EDF\u5BC6\u94A5\u73AF (libsecret)"
    };
  }
  setNetworkProvider(provider) {
    this.network = provider;
  }
  onDidChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  changed() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
      }
    }
  }
  snapshot() {
    if (!(0, import_node_fs19.existsSync)(this.filePath)) return { revision: "empty", servers: [] };
    if ((0, import_node_fs19.statSync)(this.filePath).size > 256e3) throw new Error("\u7528\u6237 MCP \u914D\u7F6E\u8D85\u8FC7 256 KB\uFF0C\u8BF7\u68C0\u67E5\u8BE5\u6587\u4EF6\u3002");
    const bytes = (0, import_node_fs19.readFileSync)(this.filePath);
    let parsed;
    try {
      parsed = JSON.parse(bytes.toString("utf8"));
    } catch {
      throw new Error("\u7528\u6237 MCP \u914D\u7F6E\u4E0D\u662F\u6709\u6548 JSON\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
    }
    const catalog = parsed;
    if (!catalog || catalog.version !== 1 || !Array.isArray(catalog.servers) || catalog.servers.length > 50) throw new Error("\u7528\u6237 MCP \u914D\u7F6E\u683C\u5F0F\u4E0D\u53D7\u652F\u6301\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
    const servers = catalog.servers.map((entry) => {
      const server = entry;
      if (!server || typeof server !== "object" || typeof server.id !== "string" || typeof server.label !== "string" || !["stdio", "http"].includes(server.transport) || typeof server.enabled !== "boolean" || typeof server.editorEnabled !== "boolean" || typeof server.bridgeEnabled !== "boolean") {
        throw new Error("\u7528\u6237 MCP \u914D\u7F6E\u542B\u65E0\u6548\u670D\u52A1\u5668\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
      }
      validateExternalMcpId(server.id);
      if (server.authType !== void 0 && (server.authType !== "oauth" || server.transport !== "http" || !server.oauthRef || !SECRET_REF.test(server.oauthRef))) throw new Error("OAuth \u914D\u7F6E\u5F15\u7528\u65E0\u6548\u3002");
      externalMcpTimeout(server.timeout);
      if (server.httpTransport !== void 0 && !["auto", "streamable-http", "sse"].includes(server.httpTransport) || server.description !== void 0 && (typeof server.description !== "string" || server.description.length > 2e3) || server.cwd !== void 0 && (typeof server.cwd !== "string" || server.cwd.length > 4096 || /[\r\n\0]/.test(server.cwd) || server.cwd.includes("${"))) {
        throw new Error("\u7528\u6237 MCP \u7684\u4F20\u8F93\u3001\u63CF\u8FF0\u6216\u5DE5\u4F5C\u76EE\u5F55\u65E0\u6548\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
      }
      return server;
    });
    if (new Set(servers.map((server) => server.id)).size !== servers.length) throw new Error("\u7528\u6237 MCP \u914D\u7F6E\u6709\u91CD\u590D ID\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
    return { revision: (0, import_node_crypto8.createHash)("sha256").update(bytes).digest("hex"), servers };
  }
  /** Preview token prevents stale UI submissions from overwriting another window's changes. */
  preview(input) {
    const current = this.snapshot();
    const parsed = previewExternalMcpImport(input);
    const taken = new Set(current.servers.map((server) => server.id));
    const entries = parsed.entries.filter((entry) => {
      if (!taken.has(entry.id)) return true;
      parsed.errors.push({ name: entry.label, reason: `ID ${entry.id} \u5DF2\u5B58\u5728\uFF1B\u8BF7\u66F4\u6539 JSON \u952E\u540D\u6216\u5148\u5220\u9664\u65E7\u6761\u76EE\u3002` });
      return false;
    }).map((entry) => ({
      id: entry.id,
      label: entry.label,
      transport: entry.transport,
      ...entry.authType ? { authType: entry.authType } : {},
      ...entry.httpTransport ? { httpTransport: entry.httpTransport } : {},
      ...entry.description ? { description: entry.description } : {},
      ...entry.cwd ? { cwd: entry.cwd } : {},
      ...entry.timeout !== void 0 ? { timeout: entry.timeout } : {},
      detail: entry.transport === "http" ? new URL(entry.url).origin : `stdio \xB7 ${entry.command} \xB7 ${entry.args?.length ?? 0} \u4E2A\u53C2\u6570\uFF08\u654F\u611F\u503C\u4E0D\u663E\u793A\uFF09`,
      bridgeEnabled: true,
      ...entry.headers && Object.keys(entry.headers).length ? { providedHeaders: Object.keys(entry.headers) } : {},
      ...entry.env && Object.keys(entry.env).length ? { providedEnv: Object.keys(entry.env) } : {},
      ...entry.transport === "http" && new URL(entry.url).search ? { urlHasQuery: true } : {}
    }));
    return { token: externalMcpPreviewToken(current.revision, input), entries, errors: parsed.errors, warnings: parsed.warnings };
  }
  /** Serializes this window's writes; the revision guard rejects known cross-window conflicts. */
  async exclusive(run, waitMs = 5e3) {
    const previous = this.pending;
    let release;
    this.pending = new Promise((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await this.withFileLock(run, waitMs);
    } finally {
      release();
    }
  }
  /** All extension windows share this advisory lock; the preview revision is checked while holding it. */
  async withFileLock(run, waitMs) {
    (0, import_node_fs19.mkdirSync)(import_node_path24.default.dirname(this.filePath), { recursive: true, mode: 448 });
    const lock = this.filePath + ".lock";
    let fd;
    for (let attempt = 0; attempt < Math.ceil(waitMs / 100) && fd === void 0; attempt++) {
      try {
        fd = (0, import_node_fs19.openSync)(lock, "wx", 384);
      } catch (error2) {
        if (error2.code !== "EEXIST") throw error2;
        try {
          if (Date.now() - (0, import_node_fs19.statSync)(lock).mtimeMs > 10 * 6e4) (0, import_node_fs19.rmSync)(lock, { force: true });
        } catch (statError) {
          if (statError.code !== "ENOENT") throw statError;
        }
        if (fd === void 0) await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    if (fd === void 0) throw new Error("\u53E6\u4E00\u4E2A\u7A97\u53E3\u6B63\u5728\u4FEE\u6539 MCP \u914D\u7F6E\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002");
    try {
      return await run();
    } finally {
      (0, import_node_fs19.closeSync)(fd);
      (0, import_node_fs19.rmSync)(lock, { force: true });
    }
  }
  /** Upgrade earlier user catalogs that briefly kept stdio argv in plaintext. */
  async migrateLegacyArgs() {
    await this.exclusive(async () => {
      const { servers } = this.snapshot();
      const written = [];
      let updated = false;
      try {
        for (const server of servers) {
          if (server.args === void 0) continue;
          if (!Array.isArray(server.args) || server.args.length > 64 || server.args.some((arg) => typeof arg !== "string" || arg.length > 4096)) {
            throw new Error("\u5386\u53F2 MCP \u547D\u4EE4\u53C2\u6570\u65E0\u6548\uFF1B\u672A\u542F\u52A8\u4E0A\u6E38\u3002");
          }
          if (server.args.length && !server.argsRef) {
            const key = `opencode.externalMcp.${(0, import_node_crypto8.randomUUID)()}`;
            await this.secrets.store(key, JSON.stringify(server.args));
            written.push(key);
            server.argsRef = key;
          }
          delete server.args;
          updated = true;
        }
        if (updated) this.save(servers);
      } catch (error2) {
        await Promise.allSettled(written.map((key) => this.secrets.delete(key)));
        throw error2;
      }
    });
  }
  save(servers, notify = true) {
    const directory = import_node_path24.default.dirname(this.filePath);
    (0, import_node_fs19.mkdirSync)(directory, { recursive: true, mode: 448 });
    const tmp = import_node_path24.default.join(directory, `.external-mcp-${(0, import_node_crypto8.randomUUID)()}.tmp`);
    try {
      (0, import_node_fs19.writeFileSync)(tmp, JSON.stringify({ version: 1, servers }, null, 2) + "\n", { encoding: "utf8", flag: "wx", mode: 384 });
      (0, import_node_fs19.renameSync)(tmp, this.filePath);
    } finally {
      (0, import_node_fs19.rmSync)(tmp, { force: true });
    }
    if (notify) this.changed();
  }
  async import(input, token, selectedIds, target = "both", secrets) {
    return this.exclusive(async () => {
      const current = this.snapshot();
      const preview = this.preview(input);
      if (preview.token !== token) throw new Error("MCP \u914D\u7F6E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8\u540E\u518D\u786E\u8BA4\u3002");
      const parsed = previewExternalMcpImport(input);
      const selected = new Set(selectedIds);
      if (selected.size < 1 || selected.size > MAX_EXTERNAL_MCP_SERVERS || selectedIds.some((id) => typeof id !== "string")) throw new Error("\u8BF7\u9009\u62E9\u81F3\u5C11\u4E00\u4E2A\u6709\u6548 MCP \u670D\u52A1\u3002");
      const drafts = parsed.entries.filter((entry) => selected.has(entry.id) && preview.entries.some((p) => p.id === entry.id));
      if (drafts.length !== selected.size) throw new Error("\u6240\u9009\u670D\u52A1\u65E0\u6548\u6216\u5DF2\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8\u3002");
      const typed = normalizeImportSecrets(secrets, drafts);
      for (const draft of drafts) {
        const extra = typed.get(draft.id);
        if (!extra) continue;
        if (extra.oauthClientSecret) draft.oauthClientSecret = extra.oauthClientSecret;
        if (draft.transport === "http") draft.headers = mergeSecretFields("header", draft.headers, extra.headers);
        else draft.env = mergeSecretFields("env", draft.env, extra.env);
      }
      if (current.servers.length + drafts.length > MAX_EXTERNAL_MCP_SERVERS) throw new Error(`\u6700\u591A\u4FDD\u5B58 ${MAX_EXTERNAL_MCP_SERVERS} \u4E2A\u5171\u4EAB MCP \u670D\u52A1\uFF1B\u8BF7\u5148\u5220\u9664\u4E0D\u518D\u4F7F\u7528\u7684\u670D\u52A1\u3002`);
      const written = [];
      const storeSecret = async (value) => {
        const key = `opencode.externalMcp.${(0, import_node_crypto8.randomUUID)()}`;
        await this.secrets.store(key, value);
        written.push(key);
        return key;
      };
      try {
        const added = [];
        for (const draft of drafts) added.push(await this.persistDraft(draft, storeSecret, target));
        if (this.snapshot().revision !== current.revision) throw new Error("\u53E6\u4E00\u7A97\u53E3\u5DF2\u4FEE\u6539 MCP \u914D\u7F6E\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8\u3002");
        this.save([...current.servers, ...added]);
        return { imported: added.map((server) => ({ id: server.id, label: server.label })) };
      } catch (error2) {
        await Promise.allSettled(written.map((key) => this.secrets.delete(key)));
        throw error2;
      }
    });
  }
  async persistDraft(draft, saveSecret, target) {
    const stored = {
      id: draft.id,
      label: draft.label,
      transport: draft.transport,
      enabled: true,
      editorEnabled: target === "both",
      bridgeEnabled: true,
      ...draft.httpTransport ? { httpTransport: draft.httpTransport } : {},
      ...draft.description ? { description: draft.description } : {},
      ...draft.cwd ? { cwd: draft.cwd } : {},
      ...draft.timeout !== void 0 ? { timeout: draft.timeout } : {}
    };
    if (draft.authType === "oauth") {
      stored.authType = "oauth";
      stored.oauth = draft.oauth;
      stored.oauthRef = await saveSecret(JSON.stringify({ ...draft.oauthClientSecret ? { clientSecret: draft.oauthClientSecret } : {} }));
    }
    if (draft.transport === "http") {
      stored.urlRef = await saveSecret(draft.url);
      if (draft.headers) {
        const refs2 = /* @__PURE__ */ Object.create(null);
        for (const [key, value] of Object.entries(draft.headers)) refs2[key] = await saveSecret(value);
        stored.headerRefs = refs2;
      }
    } else {
      stored.command = draft.command;
      if (draft.args?.length) stored.argsRef = await saveSecret(JSON.stringify(draft.args));
      if (draft.env) {
        const refs2 = /* @__PURE__ */ Object.create(null);
        for (const [key, value] of Object.entries(draft.env)) refs2[key] = await saveSecret(value);
        stored.envRefs = refs2;
      }
    }
    return stored;
  }
  /** One secret of `server`, for credential management; never returned to the page. */
  async readSecret(server, key) {
    if (!SECRET_REF.test(key)) throw new Error(`MCP ${server.id} \u7684\u5BC6\u94A5\u5F15\u7528\u65E0\u6548\u3002`);
    const value = await this.secrets.get(key);
    if (value === void 0) throw Object.assign(new Error(`MCP ${server.id} \u7684\u5BC6\u94A5\u7F3A\u5931\uFF0C\u8BF7\u91CD\u65B0\u5BFC\u5165\u3002`), { missingSecret: true });
    return value;
  }
  /**
   * Credential transaction for one server (R2 §6.1-4): new keys are written first, then the JSON references, then the
   * obsolete keys are deleted, and only then do listeners hear about it. A failure before the save removes the new keys.
   */
  async updateServer(id, update) {
    await this.exclusive(async () => {
      const { servers } = this.snapshot();
      const server = servers.find((item) => item.id === id);
      if (!server) throw new Error("MCP \u670D\u52A1\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u3002");
      const written = [];
      let obsolete;
      try {
        obsolete = await update(server, async (value) => {
          const key = `opencode.externalMcp.${(0, import_node_crypto8.randomUUID)()}`;
          await this.secrets.store(key, value);
          written.push(key);
          return key;
        });
        this.save(servers, false);
      } catch (error2) {
        await Promise.allSettled(written.map((key) => this.secrets.delete(key)));
        throw error2;
      }
      await Promise.allSettled(obsolete.filter((key) => SECRET_REF.test(key)).map((key) => this.secrets.delete(key)));
      this.changed();
    });
  }
  /** Whether every reference resolves, without returning any value: header/env gaps can be fixed from the page. */
  async checkRefs(server) {
    const exists = async (key) => !!key && SECRET_REF.test(key) && await this.secrets.get(key) !== void 0;
    if (server.transport === "http" ? !await exists(server.urlRef) : !server.command || server.argsRef !== void 0 && !await exists(server.argsRef)) return "broken";
    if (server.authType === "oauth" && !await exists(server.oauthRef)) return "missing-secret";
    for (const key of [...Object.values(server.headerRefs ?? {}), ...Object.values(server.envRefs ?? {}), ...server.proxyMode === "custom" ? [server.proxyRef] : []]) if (!await exists(key)) return "missing-secret";
    return "ok";
  }
  async resolve(server, retried = false) {
    try {
      return await this.resolveOnce(server);
    } catch (error2) {
      if (retried || !error2.missingSecret) throw error2;
      const fresh = this.snapshot().servers.find((item) => item.id === server.id);
      if (!fresh || JSON.stringify(fresh) === JSON.stringify(server)) throw error2;
      return this.resolve(fresh, true);
    }
  }
  async resolveOnce(server) {
    const resolved = {
      id: server.id,
      label: server.label,
      transport: server.transport,
      ...server.httpTransport ? { httpTransport: server.httpTransport } : {},
      ...server.description ? { description: server.description } : {},
      ...server.timeout !== void 0 ? { timeout: externalMcpTimeout(server.timeout) } : {}
    };
    const get = (key) => this.readSecret(server, key);
    if (server.transport === "http") {
      if (!server.urlRef) throw new Error(`MCP ${server.id} \u7684 URL \u5F15\u7528\u7F3A\u5931\u3002`);
      resolved.url = validateExternalMcpUrl(await get(server.urlRef)).toString();
      const headers = /* @__PURE__ */ Object.create(null);
      for (const [key, ref] of Object.entries(server.headerRefs ?? {})) {
        if (["x-opencode-managed-streamable-http", "x-opencode-mcp-timeout-ms", "x-opencode-mcp-oauth"].includes(key.toLowerCase())) throw new Error(`MCP ${server.id} \u4F7F\u7528\u4E86\u4FDD\u7559\u7684 HTTP \u6807\u8BB0\u3002`);
        headers[key] = await get(ref);
      }
      if (server.authType === "oauth") {
        if (Object.keys(headers).some((key) => key.toLowerCase() === "authorization")) throw new Error("OAuth \u4E0E Authorization \u914D\u7F6E\u51B2\u7A81\u3002");
        if (!this.oauthProvider) throw new Error("OAuth \u51ED\u636E\u7BA1\u7406\u5668\u5C1A\u672A\u5C31\u7EEA\u3002");
        resolved.oauth = this.oauthProvider(server);
      }
      resolved.headers = headers;
      if (this.network) resolved.network = this.network.fingerprint();
    } else {
      if (!server.command) throw new Error(`MCP ${server.id} \u7684\u542F\u52A8\u547D\u4EE4\u7F3A\u5931\u3002`);
      resolved.command = server.command;
      if (server.cwd) {
        const cwd = server.cwd === "~" ? import_node_os4.default.homedir() : /^[~][\\/]/.test(server.cwd) ? import_node_path24.default.join(import_node_os4.default.homedir(), server.cwd.slice(2)) : server.cwd;
        resolved.cwd = import_node_path24.default.resolve(import_node_os4.default.homedir(), cwd);
      }
      if (server.argsRef) {
        const args = JSON.parse(await get(server.argsRef));
        if (!Array.isArray(args) || args.length > 64 || args.some((arg) => typeof arg !== "string")) throw new Error(`MCP ${server.id} \u7684\u53C2\u6570\u5F15\u7528\u65E0\u6548\u3002`);
        resolved.args = args;
      } else if (server.args?.length) throw new Error(`MCP ${server.id} \u7684\u5386\u53F2\u53C2\u6570\u5C1A\u672A\u5B89\u5168\u8FC1\u79FB\u3002`);
      else resolved.args = [];
      const env10 = /* @__PURE__ */ Object.create(null);
      for (const [key, ref] of Object.entries(server.envRefs ?? {})) {
        if (["OPENCODE_MCP_MANAGED", "OPENCODE_MCP_TIMEOUT_MS"].includes(key.toUpperCase())) throw new Error(`MCP ${server.id} \u4F7F\u7528\u4E86\u4FDD\u7559\u7684\u73AF\u5883\u53D8\u91CF\u3002`);
        env10[key] = await get(ref);
      }
      if (this.network) {
        const custom = server.proxyMode === "custom" && server.proxyRef ? await get(server.proxyRef) : void 0;
        const proxy = this.network.stdioEnv(server.proxyMode, custom);
        const userNames = new Set(Object.keys(env10).map((name) => name.toLowerCase()));
        for (const [key, value] of Object.entries(proxy.env)) if (!userNames.has(key.toLowerCase())) env10[key] = value;
        if (proxy.notice) resolved.proxyNotice = proxy.notice;
        resolved.network = this.network.fingerprint();
      }
      resolved.env = env10;
    }
    return assertMcpRuntimePaths(resolved);
  }
  /** OAuth transactions share the cross-window catalog lock. Refreshes keep the reference stable; login/logout rotate it. */
  async withOAuthState(id, expectedRef, run) {
    return this.exclusive(async () => {
      const current = this.snapshot();
      const server = current.servers.find((entry) => entry.id === id);
      if (!server || server.authType !== "oauth" || !server.oauthRef || expectedRef !== void 0 && server.oauthRef !== expectedRef) throw Object.assign(new Error("OAuth \u914D\u7F6E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u6388\u6743\u3002"), { status: 401 });
      const oldRef = server.oauthRef;
      const raw = await this.readSecret(server, oldRef);
      return run(raw, server, async (next, rotate = false) => {
        if (next.length > 128e3 || this.snapshot().revision !== current.revision) throw new Error("OAuth \u72B6\u6001\u8FC7\u5927\u6216\u914D\u7F6E\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u8BD5\u3002");
        if (!rotate) {
          await this.secrets.store(oldRef, next);
          return;
        }
        const ref = `opencode.externalMcp.${(0, import_node_crypto8.randomUUID)()}`;
        await this.secrets.store(ref, next);
        server.oauthRef = ref;
        try {
          this.save(current.servers, false);
        } catch (error2) {
          await Promise.allSettled([this.secrets.delete(ref)]);
          throw error2;
        }
        await Promise.allSettled([this.secrets.delete(oldRef)]);
        this.changed();
      });
    }, 45e3);
  }
  async setEnabled(id, enabled, target = "both") {
    await this.exclusive(async () => {
      const { servers } = this.snapshot();
      const server = servers.find((item) => item.id === id);
      if (!server) throw new Error("MCP \u670D\u52A1\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u3002");
      if (target === "both") server.enabled = enabled;
      else if (target === "editor") server.editorEnabled = enabled;
      else server.bridgeEnabled = enabled;
      this.save(servers);
    });
  }
  async remove(id) {
    await this.exclusive(async () => {
      const { servers } = this.snapshot();
      const found = servers.find((server) => server.id === id);
      if (!found) throw new Error("MCP \u670D\u52A1\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u3002");
      this.save(servers.filter((server) => server.id !== id));
      await Promise.allSettled(secretKeys(found).map((key) => this.secrets.delete(key)));
    });
  }
};
export { skillDirectoryIsUsable, defaultExternalMcpConfigPath, secretKeys, import_node_crypto8, import_node_fs19, import_node_os4, import_node_path24, LEGACY_EXTERNAL_MCP_CONFIG_PATH, EXTERNAL_MCP_CONFIG_FILENAME, MAX_EXTERNAL_MCP_SERVERS, SECRET_REF, ExternalMcpCatalog };
