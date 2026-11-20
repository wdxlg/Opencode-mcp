// OpenCode: 隧道代理（tunnel-proxy-step01）。
// 参照 Arena 模型助手的做法：内置 mihomo 内核，导入订阅链接 / 节点分享链接 / Clash YAML，
// 选择节点（或系统代理 / 直连）只给隧道程序（cloudflared、tailscaled）使用，不改系统代理、不接管其它流量。
// 测速与 Arena v1046 同口径：mihomo unified-delay，经本机 external-controller（仅 127.0.0.1、随机密钥）
// 调 /proxies/{name}/delay，分别测到 Cloudflare 边缘、Tailscale 控制面、Tailscale DERP 的延迟。
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as net from "node:net";
import * as http from "node:http";
import * as https from "node:https";
import * as crypto from "node:crypto";
import * as os from "node:os";
import { spawn } from "node:child_process";

export const TUNNEL_PROXY_GROUP = "OPENCODE-TUNNEL";
export const TUNNEL_PROXY_SYSTEM = "系统代理";
export const TUNNEL_PROXY_DIRECT = "DIRECT";
// tunnel-proxy-import-step01: 列出隧道代理实际影响的全部连接（ngrok 不走隧道代理，不列）。
export const TUNNEL_PROXY_TARGETS = [
  { key: "cloudflare", label: "Cloudflare 边缘", usedBy: "cloudflared（快速隧道、命名隧道）连到 Cloudflare 边缘", url: "https://cp.cloudflare.com/generate_204" },
  { key: "trycloudflare", label: "快速隧道 API", usedBy: "cloudflared 快速隧道向 api.trycloudflare.com 申请临时地址", url: "https://api.trycloudflare.com/" },
  { key: "tailscale", label: "Tailscale 控制面", usedBy: "tailscaled 登录、一键连接与节点协调（controlplane.tailscale.com）", url: "https://controlplane.tailscale.com/" },
  { key: "derp", label: "Tailscale DERP", usedBy: "tailscaled 经代理时 Funnel 流量走 DERP 中继", url: "https://derp17b.tailscale.com/derp/latency-check" }
];
export const TUNNEL_PROXY_SOURCE_TYPES = ["subscription", "text", "http", "https", "socks5", "clash", "v2rayn"];
const MODES = new Set(["system", "direct", "node"]);
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const DELAY_TIMEOUT_MS = 5000;
const DELAY_CONCURRENCY = 32;

function yamlString(value) { return JSON.stringify(String(value)); }

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => { const { port } = server.address(); server.close(() => resolve(port)); });
  });
}

function portOpen(port, timeoutMs = 300) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const done = (value) => { socket.destroy(); resolve(value); };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

/** 把 http(s)/socks 代理地址转成 mihomo 的出站节点定义；不支持的形式返回 undefined。 */
export function systemProxyToMihomo(proxyUrl) {
  if (!proxyUrl) return void 0;
  let url;
  try { url = new URL(proxyUrl); } catch { return void 0; }
  const scheme = url.protocol.replace(/:$/, "").toLowerCase();
  const type = scheme === "http" || scheme === "https" ? "http" : scheme === "socks5" || scheme === "socks5h" || scheme === "socks" ? "socks5" : void 0;
  const port = Number(url.port || (scheme === "https" ? 443 : scheme === "http" ? 80 : 1080));
  if (!type || !url.hostname || !Number.isInteger(port) || port <= 0) return void 0;
  const entry = { name: TUNNEL_PROXY_SYSTEM, type, server: url.hostname.replace(/^\[|\]$/g, ""), port };
  if (scheme === "https") entry.tls = true;
  if (url.username) { entry.username = decodeURIComponent(url.username); entry.password = decodeURIComponent(url.password); }
  return entry;
}

/** 识别导入内容：单个 http(s) 链接 = 订阅；否则当作节点分享链接 / Base64 / Clash YAML 原文。 */
export function classifyImport(text) {
  const value = String(text ?? "").trim();
  if (!value) throw new Error("导入内容为空。");
  if (/^https?:\/\/\S+$/i.test(value)) return { kind: "subscription", url: value };
  if (Buffer.byteLength(value, "utf8") > MAX_SOURCE_BYTES) throw new Error("导入内容超过 8 MB。");
  return { kind: "text", content: value };
}

/** 订阅地址只显示主机名，不在界面露出令牌。 */
function safeUrlText(value) {
  try { return new URL(value).host; } catch { return ""; }
}

/** 节点源目录：选到文件就用它所在目录；必须存在。 */
function resolveSourceDirectory(value) {
  const raw = String(value ?? "").trim().replace(/^"(.*)"$/, "$1");
  if (!raw) throw new Error("请选择节点源目录。");
  let dir = path.resolve(raw);
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir); } catch { throw new Error(`目录不存在：${dir}`); }
  return dir;
}

/** Clash 目录：读 *.yaml / *.yml / *.json（含 profiles 子目录）里带 proxies 的配置，每个文件一份。 */
export function readClashDirectory(dir) {
  const pick = (folder) => { try { return fs.readdirSync(folder).filter((n) => /\.(ya?ml|json)$/i.test(n)).map((n) => path.join(folder, n)); } catch { return []; } };
  const files = [...pick(dir), ...pick(path.join(dir, "profiles"))];
  const parts = [];
  for (const file of files) {
    let text;
    try { if (fs.statSync(file).size > MAX_SOURCE_BYTES) continue; text = fs.readFileSync(file, "utf8"); } catch { continue; }
    if (/(^|\n)proxies\s*:\s*(\n\s*-|\[)/.test(text) || /"proxies"\s*:\s*\[\s*\{/.test(text)) parts.push(text);
  }
  if (!parts.length) throw new Error(`目录里没有带 proxies 的 Clash 配置（*.yaml / *.yml / *.json，含 profiles 子目录）：${dir}`);
  return parts;
}

function v2rayNProtocol(configType) {
  const value = String(configType ?? "").trim();
  const map = { 1: "vmess", 2: "ss", 3: "socks5", 5: "vless", 6: "trojan", 7: "hysteria2", 8: "tuic", 9: "wireguard", 10: "http" };
  if (map[value]) return map[value];
  const s = value.toLowerCase();
  return s === "shadowsocks" ? "ss" : s === "socks" ? "socks5" : ["vmess", "vless", "trojan", "ss", "http", "hysteria2"].includes(s) ? s : void 0;
}

/** v2rayN 节点（ProfileItem 行）转 mihomo 节点；不支持的协议 / 传输返回 undefined。与 Arena 模型助手 ToClash 同口径。 */
export function v2rayNToMihomo(row, name) {
  const type = v2rayNProtocol(row.ConfigType);
  const port = Number(row.Port);
  const str = (key) => (row[key] === null || row[key] === void 0 ? "" : String(row[key]));
  if (!type || !["ss", "vmess", "vless", "trojan", "http", "socks5", "hysteria2"].includes(type) || !str("Address") || !(port > 0 && port < 65536)) return void 0;
  const entry = { name, type, server: str("Address"), port, udp: false };
  if (type === "http" || type === "socks5") { if (str("Id")) entry.username = str("Id"); if (str("Security")) entry.password = str("Security"); }
  else if (type === "ss") { entry.cipher = str("Security"); entry.password = str("Id"); }
  else if (type === "trojan" || type === "hysteria2") entry.password = str("Id");
  else { entry.uuid = str("Id"); if (type === "vmess") { entry.alterId = Number(row.AlterId) || 0; entry.cipher = str("Security") || "auto"; } if (str("Flow")) entry.flow = str("Flow"); }
  const security = str("StreamSecurity");
  if (security === "tls" || security === "reality") {
    entry.tls = true;
    entry["skip-cert-verify"] = /^(true|1)$/i.test(str("AllowInsecure"));
    if (str("Sni")) entry[type === "vmess" || type === "vless" ? "servername" : "sni"] = str("Sni");
    if (str("Alpn")) entry.alpn = str("Alpn").split(",").map((s) => s.trim()).filter(Boolean);
    if (str("Fingerprint")) entry["client-fingerprint"] = str("Fingerprint");
  }
  if (security === "reality") entry["reality-opts"] = { "public-key": str("PublicKey"), "short-id": str("ShortId") };
  const network = str("Network");
  if (network === "ws") { entry.network = "ws"; entry["ws-opts"] = { path: str("Path") || "/", ...(str("RequestHost") ? { headers: { Host: str("RequestHost") } } : {}) }; }
  else if (network === "grpc") { entry.network = "grpc"; entry["grpc-opts"] = { "grpc-service-name": str("Path") }; }
  else if (network && network !== "tcp") return void 0;
  return entry;
}

/** v2rayN 目录：只读 guiConfigs/guiNDB.db（SQLite）的 ProfileItem，转成一份 mihomo proxies。 */
export async function readV2rayNDirectory(dir) {
  let db = path.join(dir, "guiConfigs", "guiNDB.db");
  if (!fs.existsSync(db)) db = path.join(dir, "guiNDB.db");
  if (!fs.existsSync(db)) throw new Error(`没找到 v2rayN 节点库：${path.join(dir, "guiConfigs", "guiNDB.db")}（请选 v2rayN 程序目录）`);
  let sqlite;
  try { sqlite = await import("node:sqlite"); } catch (error) { throw new Error(`当前运行环境不能读取 SQLite：${error instanceof Error ? error.message : String(error)}`); }
  const columns = ["Remarks", "ConfigType", "Address", "Port", "Security", "Network", "StreamSecurity", "AllowInsecure", "Path", "RequestHost", "Sni", "Alpn", "Flow", "Fingerprint", "PublicKey", "ShortId", "Id", "AlterId"];
  const query = (file) => {
    const database = new sqlite.DatabaseSync(file, { readOnly: true });
    try {
      const present = new Set(database.prepare("PRAGMA table_info(ProfileItem)").all().map((r) => r.name));
      if (!present.size) throw new Error("v2rayN 节点库里没有 ProfileItem 表。");
      return database.prepare(`select ${columns.map((c) => (present.has(c) ? `"${c}"` : `NULL AS "${c}"`)).join(", ")} from ProfileItem`).all();
    } finally { database.close(); }
  };
  let rows;
  try { rows = query(db); } catch (error) {
    // v2rayN 正在运行、库被锁时：复制一份（连同 -wal）到临时目录再读，读完删除。
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "opencode-v2rayn-"));
    try {
      const copy = path.join(tmp, "guiNDB.db");
      fs.copyFileSync(db, copy);
      if (fs.existsSync(db + "-wal")) fs.copyFileSync(db + "-wal", copy + "-wal");
      rows = query(copy);
    } catch { throw error; } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }
  const used = new Map();
  const entries = [];
  let skipped = 0;
  for (const row of rows) {
    const base = String(row.Remarks ?? "").trim() || `${row.Address}:${row.Port}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    const entry = v2rayNToMihomo(row, n > 1 ? `${base} (${n})` : base);
    if (entry) entries.push(entry); else skipped++;
  }
  if (!entries.length) throw new Error(`v2rayN 节点库里没有可转换的节点${skipped ? `（${skipped} 个协议 / 传输暂不支持，可改用订阅导入）` : ""}。`);
  return { content: "proxies:\n" + entries.map((e) => `  - ${JSON.stringify(e)}`).join("\n") + "\n", skipped };
}

/** HTTP / HTTPS / SOCKS5 单个代理转 mihomo 节点。 */
export function hostProxyToMihomo(type, spec, name) {
  const host = String(spec?.host ?? "").trim().replace(/^\[|\]$/g, "");
  const port = Number(String(spec?.port ?? "").trim());
  if (!host || /[\s/]/.test(host)) throw new Error("请填写主机地址（IP 或主机名）。");
  if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error("端口必须是 1–65535 的整数。");
  const entry = { name, type: type === "socks5" ? "socks5" : "http", server: host, port };
  if (type === "socks5") entry.udp = true;
  if (type === "https") { entry.tls = true; entry["skip-cert-verify"] = false; }
  const username = String(spec?.username ?? "");
  const password = String(spec?.password ?? "");
  if (username) entry.username = username;
  if (password) entry.password = password;
  return "proxies:\n  - " + JSON.stringify(entry) + "\n";
}

export class TunnelProxyManager {
  constructor(options) {
    this.corePath = options.corePath;
    this.root = options.storagePath;
    this.log = options.log ?? (() => void 0);
    this.resolveSystemProxy = options.resolveSystemProxy ?? (() => void 0);
    this.fetchText = options.fetchText ?? defaultFetchText;
    this.stateFile = path.join(this.root, "state.json");
    this.configFile = path.join(this.root, "config.yaml");
    this.providerDir = path.join(this.root, "providers");
    this.state = this.loadState();
    this.child = void 0;
    this.starting = void 0;
    this.testing = void 0;
    this.lastError = "";
  }

  loadState() {
    let value = {};
    try { value = JSON.parse(fs.readFileSync(this.stateFile, "utf8")); } catch { }
    return {
      mode: MODES.has(value.mode) ? value.mode : "system",
      node: typeof value.node === "string" ? value.node : "",
      sources: Array.isArray(value.sources) ? value.sources.filter((s) => s && typeof s.id === "string") : [],
      mixedPort: Number(value.mixedPort) || 0,
      controllerPort: Number(value.controllerPort) || 0,
      secret: typeof value.secret === "string" && value.secret ? value.secret : crypto.randomBytes(16).toString("hex"),
      delays: value.delays && typeof value.delays === "object" ? value.delays : {},
      testedAt: typeof value.testedAt === "string" ? value.testedAt : ""
    };
  }

  async saveState() {
    await fsp.mkdir(this.root, { recursive: true });
    const tmp = this.stateFile + ".tmp";
    await fsp.writeFile(tmp, JSON.stringify(this.state, null, 2), "utf8");
    await fsp.rename(tmp, this.stateFile);
  }

  coreAvailable() { return Boolean(this.corePath) && fs.existsSync(this.corePath); }

  /** system = 调用方沿用原有的系统代理逻辑；direct = 不走代理；node = 本机 mihomo 混合端口。 */
  tunnelProxyMode() { return this.state.mode; }
  nodeProxyUrl() { return this.state.mixedPort ? `http://127.0.0.1:${this.state.mixedPort}` : void 0; }

  /** 隧道启动前调用：node 模式下确保内核在跑、已选中节点。 */
  async ensureForTunnels() {
    if (this.state.mode !== "node") return;
    await this.ensureCore();
    await this.applySelection();
  }

  buildConfig() {
    const lines = [
      `mixed-port: ${this.state.mixedPort}`,
      "allow-lan: false",
      "bind-address: 127.0.0.1",
      "mode: rule",
      "log-level: warning",
      "ipv6: false",
      "unified-delay: true",
      "geo-auto-update: false",
      "find-process-mode: off",
      `external-controller: 127.0.0.1:${this.state.controllerPort}`,
      `secret: ${yamlString(this.state.secret)}`,
      "profile:",
      "  store-selected: false",
      "  store-fake-ip: false"
    ];
    const system = systemProxyToMihomo(this.resolveSystemProxy());
    const groupProxies = [TUNNEL_PROXY_DIRECT];
    if (system) {
      lines.push("proxies:", `  - ${JSON.stringify(system)}`);
      groupProxies.push(TUNNEL_PROXY_SYSTEM);
    }
    const providers = this.state.sources.filter((s) => fs.existsSync(this.sourceFile(s.id)));
    if (providers.length) {
      lines.push("proxy-providers:");
      for (const source of providers) {
        for (let part = 0; part < this.partCount(source); part++) {
          const file = this.sourceFile(source.id, part);
          if (!fs.existsSync(file)) continue;
          lines.push(`  ${yamlString(this.providerKey(source.id, part))}:`, "    type: file", `    path: ${yamlString(file)}`, "    health-check:", "      enable: false");
        }
      }
    }
    lines.push("proxy-groups:", `  - name: ${yamlString(TUNNEL_PROXY_GROUP)}`, "    type: select", `    proxies: ${JSON.stringify(groupProxies)}`);
    const used = providers.flatMap((s) => Array.from({ length: this.partCount(s) }, (_, part) => part).filter((part) => fs.existsSync(this.sourceFile(s.id, part))).map((part) => this.providerKey(s.id, part)));
    if (used.length) lines.push(`    use: ${JSON.stringify(used)}`);
    lines.push("rules:", `  - MATCH,${TUNNEL_PROXY_GROUP}`, "");
    return lines.join("\n");
  }

  sourceFile(id, part = 0) { return path.join(this.providerDir, part ? `${id}-${part}.txt` : `${id}.txt`); }
  providerKey(id, part = 0) { return part ? `src_${id}_${part}` : `src_${id}`; }
  partCount(source) { return Math.max(1, Number(source?.parts) || 1); }

  async controller(method, route, body, timeoutMs = 4000) {
    const port = this.state.controllerPort;
    if (!port) throw new Error("代理内核未启动。");
    const payload = body === void 0 ? void 0 : Buffer.from(JSON.stringify(body));
    return await new Promise((resolve, reject) => {
      const request = http.request({ host: "127.0.0.1", port, method, path: route, timeout: timeoutMs, agent: false,
        headers: { Authorization: `Bearer ${this.state.secret}`, ...(payload ? { "Content-Type": "application/json", "Content-Length": payload.length } : {}) } }, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          let data;
          try { data = text ? JSON.parse(text) : void 0; } catch { data = void 0; }
          resolve({ status: response.statusCode ?? 0, data, text });
        });
      });
      request.on("timeout", () => request.destroy(new Error("timeout")));
      request.on("error", reject);
      if (payload) request.write(payload);
      request.end();
    });
  }

  async coreAlive() {
    if (!this.state.controllerPort) return false;
    try { const r = await this.controller("GET", "/version", void 0, 800); return r.status === 200; } catch { return false; }
  }

  async ensureCore() {
    if (this.starting) return await this.starting;
    this.starting = this.startCore().finally(() => { this.starting = void 0; });
    return await this.starting;
  }

  async startCore() {
    if (await this.coreAlive()) return; // 本窗口或另一个 OpenCode 窗口已在跑同一份配置
    if (!this.coreAvailable()) throw new Error(`缺少内置代理内核：${this.corePath || "mihomo"}`);
    if (!this.state.mixedPort || await portOpen(this.state.mixedPort)) this.state.mixedPort = await freePort();
    if (!this.state.controllerPort || await portOpen(this.state.controllerPort)) this.state.controllerPort = await freePort();
    await this.saveState();
    await fsp.mkdir(this.providerDir, { recursive: true });
    await fsp.writeFile(this.configFile, this.buildConfig(), "utf8");
    const output = [];
    const child = spawn(this.corePath, ["-d", this.root, "-f", this.configFile], { cwd: this.root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    this.child = child;
    const keep = (chunk) => { for (const line of String(chunk).split(/\r?\n/)) if (line.trim() && output.length < 20) output.push(line.trim()); };
    child.stdout?.on("data", keep);
    child.stderr?.on("data", keep);
    child.on("exit", (code) => {
      if (this.child === child) this.child = void 0;
      this.log(`[tunnel-proxy] mihomo exited (code=${code})`);
    });
    child.on("error", (error) => this.log(`[tunnel-proxy] mihomo failed to start: ${error.message}`));
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) break;
      if (await this.coreAlive()) {
        this.log(`[tunnel-proxy] mihomo ready: mixed 127.0.0.1:${this.state.mixedPort}`);
        return;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    try { child.kill(); } catch { }
    throw new Error(`代理内核启动失败：${output.slice(-5).join(" | ") || "控制接口未就绪"}`);
  }

  async reloadCore() {
    if (!(await this.coreAlive())) return;
    await fsp.writeFile(this.configFile, this.buildConfig(), "utf8");
    const r = await this.controller("PUT", "/configs?force=true", { path: this.configFile }, 10000);
    if (r.status >= 300) throw new Error(`代理内核重新加载失败：${r.data?.message ?? r.status}`);
    await this.applySelection();
  }

  async applySelection() {
    if (this.state.mode !== "node" || !this.state.node) return;
    const r = await this.controller("PUT", `/proxies/${encodeURIComponent(TUNNEL_PROXY_GROUP)}`, { name: this.state.node });
    if (r.status >= 300) throw new Error(`节点「${this.state.node}」不存在或无法选中：${r.data?.message ?? r.status}`);
  }

  async listNodes() {
    if (!(await this.coreAlive())) return [];
    const r = await this.controller("GET", "/providers/proxies");
    const providers = r.data?.providers ?? {};
    const nodes = [];
    for (const source of this.state.sources) {
      for (let part = 0; part < this.partCount(source); part++) {
        const provider = providers[this.providerKey(source.id, part)];
        for (const proxy of provider?.proxies ?? []) nodes.push({ name: proxy.name, type: proxy.type, sourceId: source.id, provider: this.providerKey(source.id, part) });
      }
    }
    return nodes;
  }

  async getState() {
    const system = this.resolveSystemProxy();
    let nodes = [];
    if (this.state.sources.length && this.coreAvailable()) {
      try { await this.ensureCore(); nodes = await this.listNodes(); this.lastError = ""; }
      catch (error) { this.lastError = error instanceof Error ? error.message : String(error); }
    }
    const counts = new Map();
    for (const node of nodes) counts.set(node.sourceId, (counts.get(node.sourceId) ?? 0) + 1);
    const delayOf = (name) => this.state.delays[name] ?? {};
    return {
      mode: this.state.mode,
      node: this.state.node,
      coreAvailable: this.coreAvailable(),
      coreRunning: await this.coreAlive(),
      proxyUrl: this.state.mode === "node" ? this.nodeProxyUrl() ?? "" : this.state.mode === "direct" ? "" : system ?? "",
      systemProxy: system ?? "",
      targets: TUNNEL_PROXY_TARGETS.map(({ key, label, usedBy }) => ({ key, label, usedBy })),
      rows: [
        { id: "system", name: "系统代理", detail: system || "未检测到", kind: "system", delays: delayOf(TUNNEL_PROXY_SYSTEM) },
        { id: "direct", name: "直连", detail: "不经过代理", kind: "direct", delays: delayOf(TUNNEL_PROXY_DIRECT) },
        ...nodes.map((n) => ({ id: "node:" + n.name, name: n.name, detail: n.type, kind: "node", sourceId: n.sourceId, delays: delayOf(n.name) }))
      ],
      sources: this.state.sources.map((s) => ({ id: s.id, name: s.name, kind: s.kind, detail: s.url ? safeUrlText(s.url) : s.directory ?? s.endpoint ?? "", updatable: s.kind === "subscription" || s.kind === "clash" || s.kind === "v2rayn", note: s.note ?? "", updatedAt: s.updatedAt, count: counts.get(s.id) ?? 0 })),
      testing: Boolean(this.testing),
      progress: this.testing ? { ...this.progress } : void 0,
      testedAt: this.state.testedAt,
      lastError: this.testError || this.lastError
    };
  }

  async setMode(mode, node) {
    if (!MODES.has(mode)) throw new Error("隧道代理模式必须是 system、direct 或 node。");
    if (mode === "node") {
      if (typeof node !== "string" || !node) throw new Error("请选择一个节点。");
      await this.ensureCore();
      const names = new Set((await this.listNodes()).map((n) => n.name));
      if (!names.has(node)) throw new Error(`没有找到节点「${node}」。`);
      this.state.node = node;
    }
    this.state.mode = mode;
    await this.saveState();
    if (mode === "node") await this.applySelection();
    return await this.getState();
  }

  async importSource(text, name) {
    const parsed = classifyImport(text);
    const id = crypto.randomBytes(6).toString("hex");
    let content;
    let label = String(name ?? "").trim();
    if (parsed.kind === "subscription") {
      content = await this.fetchText(parsed.url);
      if (!label) { try { label = new URL(parsed.url).hostname; } catch { label = "订阅"; } }
    } else {
      content = parsed.content;
      if (!label) label = "手动导入";
    }
    const source = { id, name: label, kind: parsed.kind, url: parsed.kind === "subscription" ? parsed.url : void 0, updatedAt: new Date().toISOString() };
    return await this.addSource(source, [content]);
  }

  /** tunnel-proxy-import-step01: 按导入方式导入（同 Arena 模型助手的节点源类型，另保留粘贴分享链接 / 文本）。 */
  async importSpec(spec) {
    const type = String(spec?.type ?? "");
    if (!TUNNEL_PROXY_SOURCE_TYPES.includes(type)) throw new Error("不支持的导入方式。");
    const name = String(spec?.name ?? "").trim();
    if (type === "subscription") {
      const url = String(spec?.url ?? "").trim();
      if (!/^https?:\/\/\S+$/i.test(url)) throw new Error("订阅链接必须是 http:// 或 https:// 开头的完整地址。");
      return await this.importSource(url, name);
    }
    if (type === "text") {
      const text = String(spec?.text ?? "").trim();
      if (!text) throw new Error("请粘贴节点分享链接、Base64 订阅内容或 Clash YAML。");
      const parsed = classifyImport(text);
      if (parsed.kind === "subscription") return await this.importSource(text, name);
      const id = crypto.randomBytes(6).toString("hex");
      return await this.addSource({ id, name: name || "手动导入", kind: "text", updatedAt: new Date().toISOString() }, [parsed.content]);
    }
    const id = crypto.randomBytes(6).toString("hex");
    if (type === "http" || type === "https" || type === "socks5") {
      const host = String(spec?.host ?? "").trim();
      const label = name || `${type.toUpperCase()} ${host}:${String(spec?.port ?? "").trim()}`;
      const content = hostProxyToMihomo(type, spec, label);
      return await this.addSource({ id, name: label, kind: type, endpoint: `${host}:${String(spec?.port ?? "").trim()}`, updatedAt: new Date().toISOString() }, [content]);
    }
    const directory = resolveSourceDirectory(spec?.directory);
    const source = { id, name: name || `${type === "clash" ? "Clash" : "v2rayN"} · ${path.basename(directory)}`, kind: type, directory, updatedAt: new Date().toISOString() };
    const parts = await this.readDirectorySource(source);
    return await this.addSource(source, parts);
  }

  async readDirectorySource(source) {
    if (source.kind === "clash") { source.note = ""; return readClashDirectory(source.directory); }
    const result = await readV2rayNDirectory(source.directory);
    source.note = result.skipped ? `另有 ${result.skipped} 个节点的协议 / 传输暂不支持，未导入` : "";
    return [result.content];
  }

  async writeParts(source, parts) {
    await fsp.mkdir(this.providerDir, { recursive: true });
    const old = this.partCount(source);
    for (let part = 0; part < parts.length; part++) await fsp.writeFile(this.sourceFile(source.id, part), parts[part], "utf8");
    for (let part = parts.length; part < old; part++) await fsp.rm(this.sourceFile(source.id, part), { force: true });
    source.parts = parts.length;
  }

  async removeParts(source) {
    for (let part = 0; part < this.partCount(source); part++) await fsp.rm(this.sourceFile(source.id, part), { force: true });
  }

  async addSource(source, parts) {
    const id = source.id;
    await this.writeParts(source, parts);
    this.state.sources.push(source);
    await this.saveState();
    try {
      if (await this.coreAlive()) await this.reloadCore(); else await this.ensureCore();
      const count = (await this.listNodes()).filter((n) => n.sourceId === id).length;
      if (!count) throw new Error("没有识别出任何节点（支持订阅链接、ss/vmess/vless/trojan/hysteria2 等分享链接、Base64 订阅内容、Clash YAML、HTTP/HTTPS/SOCKS5、Clash 目录、v2rayN 目录）。");
    } catch (error) {
      this.state.sources = this.state.sources.filter((s) => s.id !== id);
      await this.saveState();
      await this.removeParts(source);
      try { await this.reloadCore(); } catch { }
      throw error;
    }
    return await this.getState();
  }

  async updateSource(id) {
    const source = this.state.sources.find((s) => s.id === id);
    if (!source) throw new Error("没有这个节点来源。");
    if (source.kind === "clash" || source.kind === "v2rayn") {
      await this.writeParts(source, await this.readDirectorySource(source));
    } else {
      if (source.kind !== "subscription" || !source.url) throw new Error("这个节点源没有订阅地址或目录，无法更新。");
      const content = await this.fetchText(source.url);
      await this.writeParts(source, [content]);
    }
    source.updatedAt = new Date().toISOString();
    await this.saveState();
    await this.reloadCore();
    return await this.getState();
  }

  async removeSource(id) {
    const before = this.state.sources.length;
    const source = this.state.sources.find((s) => s.id === id);
    this.state.sources = this.state.sources.filter((s) => s.id !== id);
    if (this.state.sources.length === before) throw new Error("没有这个节点来源。");
    await this.removeParts(source);
    const remaining = new Set();
    try { await this.reloadCore(); for (const n of await this.listNodes()) remaining.add(n.name); } catch { }
    if (this.state.mode === "node" && !remaining.has(this.state.node)) { this.state.mode = "system"; this.state.node = ""; }
    await this.saveState();
    return await this.getState();
  }

  /** 测速：系统代理、直连和全部节点，各自到每个目标。tunnel-proxy-stream-step01：后台进行、立即返回，
   *  结果边测边写进 state.delays，界面轮询 getState 流式刷新。 */
  async testLatency() {
    if (!this.testing) {
      this.progress = { done: 0, total: 0 };
      this.testError = "";
      this.testing = this.runLatency()
        .catch((error) => { this.testError = `测速失败：${error instanceof Error ? error.message : String(error)}`; this.log(`[tunnel-proxy] ${this.testError}`); })
        .finally(() => { this.testing = void 0; });
      await new Promise((r) => setTimeout(r, 50));
    }
    return await this.getState();
  }

  async runLatency() {
    await this.ensureCore();
    await this.reloadCore().catch(() => void 0); // 系统代理地址可能变了
    // tunnel-proxy-latency-fix-step01: 订阅 / 目录里的节点属于 proxy-provider，mihomo 的 /proxies/{name}/delay 找不到它们（404，
    // 以前因此全部显示超时）；改走 /providers/proxies/{provider}/{name}/healthcheck。DIRECT 与系统代理仍走 /proxies。
    const items = [{ name: TUNNEL_PROXY_DIRECT }];
    if (systemProxyToMihomo(this.resolveSystemProxy())) items.push({ name: TUNNEL_PROXY_SYSTEM });
    const seen = new Set(items.map((i) => i.name));
    for (const node of await this.listNodes()) if (!seen.has(node.name)) { seen.add(node.name); items.push({ name: node.name, provider: node.provider }); }
    const delays = {};
    this.state.delays = delays; // 边测边显示：新结果直接进状态
    this.progress = { done: 0, total: items.length * TUNNEL_PROXY_TARGETS.length };
    const measure = async (item, target) => {
      const query = `timeout=${DELAY_TIMEOUT_MS}&url=${encodeURIComponent(target.url)}`;
      const route = item.provider
        ? `/providers/proxies/${encodeURIComponent(item.provider)}/${encodeURIComponent(item.name)}/healthcheck?${query}`
        : `/proxies/${encodeURIComponent(item.name)}/delay?${query}`;
      let value = -1;
      // tunnel-proxy-direct-retry-step01: 直连 / 系统代理不在节点池里抢并发，失败重试一次，并把原因写进日志。
      for (let attempt = 0; attempt < (item.provider ? 1 : 2) && value < 0; attempt++) {
        let reason = "";
        try {
          const r = await this.controller("GET", route, void 0, DELAY_TIMEOUT_MS + 3000);
          if (r.status === 200 && Number(r.data?.delay) > 0) value = Number(r.data.delay);
          else reason = `HTTP ${r.status} ${r.data?.message ?? ""}`.trim();
        } catch (error) { reason = error instanceof Error ? error.message : String(error); }
        if (value < 0 && !item.provider) this.log(`[tunnel-proxy] ${item.name} → ${target.key} 测速失败（第 ${attempt + 1} 次）：${reason}`);
      }
      (delays[item.name] ??= {})[target.key] = value;
      this.progress.done++;
      return value;
    };
    const runJobs = async (jobs) => {
      let next = 0;
      const worker = async () => { while (next < jobs.length) { const job = jobs[next++]; await measure(job.item, job.target); } };
      await Promise.all(Array.from({ length: Math.min(DELAY_CONCURRENCY, jobs.length) }, worker));
    };
    // 先全部测第一个目标；节点连第一个目标都不通的视为不可用，其余目标直接记超时，省掉大量 5 秒等待。
    const [first, ...rest] = TUNNEL_PROXY_TARGETS;
    for (const item of items) if (!item.provider) await measure(item, first);
    await runJobs(items.filter((item) => item.provider).map((item) => ({ item, target: first })));
    const later = [];
    for (const item of items) {
      const alive = !item.provider || delays[item.name]?.[first.key] > 0;
      for (const target of rest) if (alive) later.push({ item, target }); else { delays[item.name][target.key] = -1; this.progress.done++; }
    }
    await runJobs(later);
    this.state.testedAt = new Date().toISOString();
    await this.saveState();
    return await this.getState();
  }

  async dispose() {
    const child = this.child;
    this.child = void 0;
    if (child && child.exitCode === null) { try { child.kill(); } catch { } }
  }
}

function defaultFetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const request = lib.get(url, { timeout: 20000, headers: { "User-Agent": "clash.meta/mihomo OpenCode", Accept: "*/*" } }, (response) => {
      const status = response.statusCode ?? 0;
      if (status >= 300 && status < 400 && response.headers.location && redirects < 5) {
        response.resume();
        resolve(defaultFetchText(new URL(response.headers.location, url).toString(), redirects + 1));
        return;
      }
      if (status !== 200) { response.resume(); reject(new Error(`订阅下载失败：HTTP ${status}`)); return; }
      const chunks = []; let total = 0;
      response.on("data", (chunk) => {
        total += chunk.length;
        if (total > MAX_SOURCE_BYTES) { request.destroy(new Error("订阅内容超过 8 MB。")); return; }
        chunks.push(chunk);
      });
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    request.on("timeout", () => request.destroy(new Error("订阅下载超时（20 秒）。")));
    request.on("error", (error) => reject(new Error(`订阅下载失败：${error.message}`)));
  });
}
