// OpenCode: Bridge 页「隧道代理」区块（tunnel-proxy-step01）。
// 导入订阅 / 节点链接，选择系统代理、直连或某个节点给隧道程序使用，并显示每个节点到
// Cloudflare 边缘、Tailscale 控制面、Tailscale DERP 的延迟。数据与操作都在扩展端（opencode.bridge.tunnelProxy.*）。
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";

var TUNNEL_PROXY_GET_STATE = "opencode.bridge.tunnelProxy.getState";
var TUNNEL_PROXY_SET_MODE = "opencode.bridge.tunnelProxy.setMode";
var TUNNEL_PROXY_IMPORT = "opencode.bridge.tunnelProxy.import";
var TUNNEL_PROXY_UPDATE_SOURCE = "opencode.bridge.tunnelProxy.updateSource";
var TUNNEL_PROXY_REMOVE_SOURCE = "opencode.bridge.tunnelProxy.removeSource";
var TUNNEL_PROXY_TEST = "opencode.bridge.tunnelProxy.test";
var TUNNEL_PROXY_PICK_DIRECTORY = "opencode.bridge.tunnelProxy.pickDirectory";
// tunnel-proxy-import-step01: 导入方式与 Arena 模型助手一致（订阅链接 / HTTP / HTTPS / SOCKS5 / v2rayN / Clash），另保留粘贴分享链接。
var IMPORT_TYPES = [
  { type: "subscription", label: "订阅链接" },
  { type: "text", label: "分享链接 / 文本" },
  { type: "http", label: "HTTP" },
  { type: "https", label: "HTTPS" },
  { type: "socks5", label: "SOCKS5" },
  { type: "v2rayn", label: "v2rayN" },
  { type: "clash", label: "Clash" }
];
var SOURCE_KIND_LABELS = { subscription: "订阅", text: "手动", http: "HTTP", https: "HTTPS", socks5: "SOCKS5", v2rayn: "v2rayN 目录", clash: "Clash 目录" };

function styleInput(input) {
  input.style.width = "100%";
  input.style.boxSizing = "border-box";
  input.style.marginTop = "6px";
  return input;
}

// tunnel-proxy-latency-fix-step01: 节点表滚动条用编辑器主题色（细条、无白底、无箭头），表格不再横向溢出。
var TABLE_STYLE_ID = "opencode-bridge-tunnel-proxy-style";
function ensureTableStyle(doc) {
  if (!doc || doc.getElementById(TABLE_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = TABLE_STYLE_ID;
  style.textContent = [
    ".opencode-bridge-tunnel-proxy-table { scrollbar-width: thin; scrollbar-color: var(--vscode-scrollbarSlider-background) transparent; }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar { width: 10px; height: 10px; background: transparent; }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-button { display: none; width: 0; height: 0; }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-track, .opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-corner { background: transparent; }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-background); border-radius: 0; }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-thumb:hover { background: var(--vscode-scrollbarSlider-hoverBackground); }",
    ".opencode-bridge-tunnel-proxy-table::-webkit-scrollbar-thumb:active { background: var(--vscode-scrollbarSlider-activeBackground); }",
    ".opencode-bridge-tunnel-proxy-table table { table-layout: fixed; }",
    ".opencode-bridge-tunnel-proxy-table td { overflow: hidden; text-overflow: ellipsis; }",
    ".opencode-bridge-tunnel-proxy-table tbody tr:hover { background: var(--vscode-list-hoverBackground); }"
  ].join("\n");
  (doc.head ?? doc.documentElement).appendChild(style);
}

function delayText(value) {
  if (value === void 0 || value === null) return "—";
  return Number(value) > 0 ? `${Number(value)} ms` : "超时";
}

function delayColor(value) {
  const ms = Number(value);
  if (value === void 0 || value === null) return "var(--vscode-descriptionForeground)";
  if (!(ms > 0)) return "var(--vscode-errorForeground)";
  if (ms < 300) return "var(--vscode-testing-iconPassed)";
  if (ms < 800) return "var(--vscode-editorWarning-foreground)";
  return "var(--vscode-errorForeground)";
}

function bestDelay(row) {
  const values = Object.values(row.delays ?? {}).map(Number).filter((v) => v > 0);
  return values.length ? Math.min(...values) : Number.POSITIVE_INFINITY;
}

function timeText(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

var OpenCodeTunnelProxySection = class extends Disposable {
  constructor(parent, commandService) {
    super();
    this.commandService = commandService;
    this.busy = false;
    this.state = void 0;
    this.disposed = false;
    this.pollTimer = void 0;
    this.rowOrder = [];
    this._register({ dispose: () => { this.disposed = true; clearTimeout(this.pollTimer); } });
    const field = append(parent, $(".opencode-bridge-field.opencode-bridge-tunnel-proxy"));
    append(field, $("label.opencode-bridge-label", void 0, "隧道代理"));
    this.summary = append(field, $(".opencode-bridge-help"));
    const controls = append(field, $(".opencode-bridge-controls"));
    this.testButton = this._register(new Button(controls, { ...defaultButtonStyles, supportIcons: true }));
    this.testButton.label = `$(${Codicon.pulse.id}) 测速`;
    this.testButton.setTitle("测系统代理、直连和每个节点到隧道会用到的每个地址（Cloudflare 边缘、快速隧道 API、Tailscale 控制面、Tailscale DERP）的延迟");
    this._register(this.testButton.onDidClick(() => void this.run(TUNNEL_PROXY_TEST)));
    this.importToggleButton = this._register(new Button(controls, { ...defaultButtonStyles, supportIcons: true, secondary: true }));
    this.importToggleButton.label = `$(${Codicon.add.id}) 导入节点`;
    this.importToggleButton.setTitle("导入订阅链接、分享链接 / Clash YAML、HTTP / HTTPS / SOCKS5 代理，或读取 v2rayN / Clash 目录");
    this._register(this.importToggleButton.onDidClick(() => this.toggleImport()));
    this.refreshButton = this._register(new Button(controls, { ...defaultButtonStyles, supportIcons: true, secondary: true }));
    this.refreshButton.label = `$(${Codicon.refresh.id}) 刷新`;
    this._register(this.refreshButton.onDidClick(() => void this.refresh()));

    this.importPanel = append(field, $(".opencode-bridge-tunnel-proxy-import"));
    this.importPanel.style.display = "none";
    this.importType = "subscription";
    const typeRow = append(this.importPanel, $(".opencode-bridge-controls.opencode-bridge-tunnel-proxy-types"));
    typeRow.setAttribute("role", "radiogroup");
    typeRow.setAttribute("aria-label", "导入方式");
    typeRow.style.flexWrap = "wrap";
    this.importTypeButtons = new Map();
    for (const { type, label } of IMPORT_TYPES) {
      const button = append(typeRow, $("button.opencode-bridge-copy-url", void 0, label));
      button.type = "button";
      button.setAttribute("role", "radio");
      button.onclick = () => this.setImportType(type);
      this.importTypeButtons.set(type, button);
    }
    this.importName = styleInput(append(this.importPanel, $("input.opencode-bridge-input")));
    this.importName.type = "text";
    this.importName.placeholder = "名称（可选，如：日常节点）";
    this.importName.maxLength = 80;
    this.urlFields = append(this.importPanel, $("div"));
    this.importUrl = styleInput(append(this.urlFields, $("input.opencode-bridge-input")));
    this.importUrl.type = "password";
    this.importUrl.autocomplete = "off";
    this.importUrl.spellcheck = false;
    this.importUrl.placeholder = "订阅链接 https://…（默认隐藏）";
    append(this.urlFields, $(".opencode-bridge-help", void 0, "支持 Clash YAML / JSON 与常见分享订阅；只导入节点，不执行订阅规则。"));
    this.textFields = append(this.importPanel, $("div"));
    this.importText = styleInput(append(this.textFields, $("textarea.opencode-bridge-input")));
    this.importText.rows = 4;
    this.importText.spellcheck = false;
    this.importText.placeholder = "一行一个节点链接（ss:// vmess:// vless:// trojan:// hysteria2:// …），或 Base64 订阅内容、Clash YAML";
    this.importText.style.resize = "vertical";
    this.hostFields = append(this.importPanel, $("div"));
    const hostRow = append(this.hostFields, $("div"));
    hostRow.style.display = "flex";
    hostRow.style.gap = "6px";
    this.importHost = styleInput(append(hostRow, $("input.opencode-bridge-input")));
    this.importHost.placeholder = "主机地址（IP 或主机名）";
    this.importHost.spellcheck = false;
    this.importHost.style.flex = "1";
    this.importPort = styleInput(append(hostRow, $("input.opencode-bridge-input")));
    this.importPort.placeholder = "端口";
    this.importPort.inputMode = "numeric";
    this.importPort.maxLength = 5;
    this.importPort.style.width = "90px";
    this.importPort.style.flex = "0 0 90px";
    this.importUser = styleInput(append(this.hostFields, $("input.opencode-bridge-input")));
    this.importUser.placeholder = "用户名（可选）";
    this.importUser.autocomplete = "off";
    this.importPassword = styleInput(append(this.hostFields, $("input.opencode-bridge-input")));
    this.importPassword.type = "password";
    this.importPassword.autocomplete = "off";
    this.importPassword.placeholder = "密码（可选）";
    this.dirFields = append(this.importPanel, $("div"));
    const dirRow = append(this.dirFields, $("div"));
    dirRow.style.display = "flex";
    dirRow.style.gap = "6px";
    dirRow.style.alignItems = "center";
    this.importDirectory = styleInput(append(dirRow, $("input.opencode-bridge-input")));
    this.importDirectory.spellcheck = false;
    this.importDirectory.style.flex = "1";
    const pick = append(dirRow, $("button.opencode-bridge-copy-url", void 0, "选择目录…"));
    pick.type = "button";
    pick.style.marginTop = "6px";
    pick.onclick = () => void this.pickDirectory();
    this.dirHelp = append(this.dirFields, $(".opencode-bridge-help"));
    const importActions = append(this.importPanel, $(".opencode-bridge-controls"));
    this.importButton = this._register(new Button(importActions, { ...defaultButtonStyles, supportIcons: true }));
    this.importButton.label = `$(${Codicon.cloudDownload.id}) 导入`;
    this._register(this.importButton.onDidClick(() => void this.importNodes()));
    const cancelImport = this._register(new Button(importActions, { ...defaultButtonStyles, secondary: true }));
    cancelImport.label = "取消";
    this._register(cancelImport.onDidClick(() => this.toggleImport(false)));
    this.setImportType("subscription");

    this.sourceList = append(field, $(".opencode-bridge-tunnel-proxy-sources"));
    const tableWrap = append(field, $(".opencode-bridge-tunnel-proxy-table"));
    ensureTableStyle(field.ownerDocument);
    tableWrap.style.maxHeight = "360px";
    tableWrap.style.overflowY = "auto";
    tableWrap.style.overflowX = "hidden";
    tableWrap.style.marginTop = "6px";
    tableWrap.style.border = "1px solid var(--vscode-widget-border, var(--vscode-panel-border))";
    tableWrap.style.borderRadius = "4px";
    this.table = append(tableWrap, $("table"));
    this.table.style.width = "100%";
    this.table.style.borderCollapse = "collapse";
    this.table.style.fontSize = "12px";
    this.error = append(field, $(".opencode-bridge-help"));
    this.error.style.color = "var(--vscode-errorForeground)";
    append(field, $(
      ".opencode-bridge-help",
      void 0,
      "只给隧道程序（cloudflared、tailscaled）用，不改系统代理、不影响其它软件。切换「系统代理 / 直连 / 节点」后下次启动 Bridge 生效；已在节点模式时换节点立即生效。ngrok 免费版不接受代理，始终直连。"
    ));
    const details = parent.closest?.("details");
    if (details) this._register(addDisposableListener(details, "toggle", () => { if (details.open) void this.refresh(); }));
    void this.refresh();
  }

  toggleImport(force) {
    const show = force ?? this.importPanel.style.display === "none";
    this.importPanel.style.display = show ? "" : "none";
    if (show) this.focusImport();
  }

  setImportType(type) {
    this.importType = type;
    for (const [key, button] of this.importTypeButtons) {
      const on = key === type;
      button.setAttribute("aria-checked", String(on));
      button.style.fontWeight = on ? "600" : "";
      button.style.outline = on ? "1px solid var(--vscode-focusBorder)" : "";
    }
    const isHost = type === "http" || type === "https" || type === "socks5";
    const isDir = type === "v2rayn" || type === "clash";
    this.urlFields.style.display = type === "subscription" ? "" : "none";
    this.textFields.style.display = type === "text" ? "" : "none";
    this.hostFields.style.display = isHost ? "" : "none";
    this.dirFields.style.display = isDir ? "" : "none";
    if (isHost && !this.importPort.value) this.importPort.placeholder = type === "socks5" ? "1080" : type === "https" ? "443" : "8080";
    this.importDirectory.placeholder = type === "v2rayn" ? "v2rayN 程序目录（含 guiConfigs\\guiNDB.db），可粘贴绝对路径" : "Clash 配置目录（含 *.yaml 或 profiles），可粘贴绝对路径";
    this.dirHelp.textContent = type === "v2rayn" ? "只读取 v2rayN 节点库，不修改该目录；之后点「更新」重新读取。" : "只读取 Clash 配置里的 proxies，不执行规则、不修改该目录；之后点「更新」重新读取。";
    if (this.importPanel.style.display !== "none") this.focusImport();
  }

  focusImport() {
    const type = this.importType;
    (type === "subscription" ? this.importUrl : type === "text" ? this.importText : type === "v2rayn" || type === "clash" ? this.importDirectory : this.importHost).focus();
  }

  async pickDirectory() {
    try {
      const picked = await this.commandService.executeCommand(TUNNEL_PROXY_PICK_DIRECTORY, this.importType);
      if (typeof picked === "string" && picked) this.importDirectory.value = picked;
    } catch (error) {
      this.showError(error);
    }
  }

  async refresh() {
    if (this.busy) { this.schedulePoll(this.state); return; }
    try {
      const state = await this.commandService.executeCommand(TUNNEL_PROXY_GET_STATE);
      if (!this.disposed && state) this.render(state);
    } catch (error) {
      if (!this.disposed) this.showError(error);
    }
  }

  /** tunnel-proxy-stream-step01：测速在扩展端后台进行，这里每 700 ms 取一次状态，结果边出边显示。 */
  schedulePoll(state) {
    clearTimeout(this.pollTimer);
    this.pollTimer = void 0;
    if (this.disposed || !state?.testing) return;
    this.pollTimer = setTimeout(() => { this.pollTimer = void 0; void this.refresh(); }, 700);
  }

  async run(command, ...args) {
    if (this.busy) return void 0;
    this.busy = true;
    this.showError(void 0);
    this.updateControls(command);
    try {
      const state = await this.commandService.executeCommand(command, ...args);
      if (!this.disposed && state) this.render(state);
      return state;
    } catch (error) {
      if (!this.disposed) this.showError(error);
      return void 0;
    } finally {
      this.busy = false;
      if (!this.disposed) this.updateControls();
    }
  }

  async importNodes() {
    const type = this.importType;
    const spec = { type, name: this.importName.value.trim() };
    if (type === "subscription") spec.url = this.importUrl.value.trim();
    else if (type === "text") spec.text = this.importText.value.trim();
    else if (type === "v2rayn" || type === "clash") spec.directory = this.importDirectory.value.trim();
    else Object.assign(spec, { host: this.importHost.value.trim(), port: this.importPort.value.trim() || this.importPort.placeholder, username: this.importUser.value, password: this.importPassword.value });
    const missing = type === "subscription" ? !spec.url : type === "text" ? !spec.text : type === "v2rayn" || type === "clash" ? !spec.directory : !spec.host;
    if (missing) { this.showError(new Error(type === "subscription" ? "请填写订阅链接。" : type === "text" ? "请粘贴节点链接或 Clash YAML。" : type === "v2rayn" || type === "clash" ? "请选择目录。" : "请填写主机地址。")); this.focusImport(); return; }
    const state = await this.run(TUNNEL_PROXY_IMPORT, spec);
    if (state) {
      for (const input of [this.importName, this.importUrl, this.importText, this.importHost, this.importPort, this.importUser, this.importPassword, this.importDirectory]) input.value = "";
      this.toggleImport(false);
    }
  }

  showError(error) {
    this.error.textContent = error ? (error instanceof Error ? error.message : String(error)) : "";
  }

  updateControls(running) {
    const busy = this.busy;
    const testing = Boolean(this.state?.testing);
    this.testButton.enabled = !busy && !testing;
    this.importButton.enabled = !busy;
    this.importToggleButton.enabled = !busy;
    this.refreshButton.enabled = !busy;
    const progress = this.state?.progress;
    this.testButton.label = testing || (busy && running === TUNNEL_PROXY_TEST)
      ? `$(${Codicon.loading.id}~spin) 测速中${progress?.total ? ` ${progress.done}/${progress.total}` : "…"}`
      : `$(${Codicon.pulse.id}) 测速`;
    this.importButton.label = busy && running === TUNNEL_PROXY_IMPORT ? `$(${Codicon.loading.id}~spin) 导入中…` : `$(${Codicon.cloudDownload.id}) 导入`;
    for (const button of this.table.querySelectorAll("button")) button.disabled = busy;
    for (const button of this.sourceList.querySelectorAll("button")) button.disabled = busy;
  }

  render(state) {
    this.state = state;
    const current = state.mode === "node" ? `节点「${state.node}」` : state.mode === "direct" ? "直连" : `系统代理（${state.systemProxy || "未检测到，等同直连"}）`;
    const nodeCount = state.rows.filter((r) => r.kind === "node").length;
    this.summary.textContent = `当前：${current}${state.mode === "node" ? `，本机端口 ${state.proxyUrl || "未就绪"}` : ""} · 已导入 ${nodeCount} 个节点${state.testedAt ? ` · 上次测速 ${timeText(state.testedAt)}` : ""}${state.coreAvailable ? "" : " · 缺少内置 mihomo 内核"}`;
    this.showError(state.lastError ? new Error(state.lastError) : void 0);
    clearNode(this.sourceList);
    for (const source of state.sources) {
      const row = append(this.sourceList, $(".opencode-bridge-tunnel-proxy-source"));
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      row.style.marginTop = "4px";
      const label = append(row, $("span", void 0, `${source.name} · ${SOURCE_KIND_LABELS[source.kind] ?? source.kind} · ${source.count} 个节点${source.updatedAt ? ` · ${timeText(source.updatedAt)}` : ""}${source.note ? ` · ${source.note}` : ""}`));
      if (source.detail) label.title = source.detail;
      if (source.updatable ?? source.kind === "subscription") {
        const update = append(row, $("button.opencode-bridge-copy-url", void 0, "更新"));
        update.type = "button";
        update.onclick = () => void this.run(TUNNEL_PROXY_UPDATE_SOURCE, source.id);
      }
      const remove = append(row, $("button.opencode-bridge-copy-url", void 0, "删除"));
      remove.type = "button";
      remove.onclick = () => void this.run(TUNNEL_PROXY_REMOVE_SOURCE, source.id);
    }
    clearNode(this.table);
    const head = append(append(this.table, $("thead")), $("tr"));
    const headers = ["名称", "类型", ...state.targets.map((t) => t.label), ""];
    const widths = ["auto", "13%", ...state.targets.map(() => "11%"), "64px"];
    headers.forEach((label, index) => {
      const th = append(head, $("th", void 0, label));
      th.style.width = widths[index];
      const target = state.targets.find((t) => t.label === label);
      if (target?.usedBy) th.title = target.usedBy;
      th.style.textAlign = "left";
      th.style.padding = "4px 8px";
      th.style.position = "sticky";
      th.style.top = "0";
      th.style.background = "var(--vscode-editorWidget-background, var(--vscode-editor-background))";
      th.style.borderBottom = "1px solid var(--vscode-widget-border, var(--vscode-panel-border))";
      th.style.whiteSpace = "normal";
      th.style.verticalAlign = "bottom";
      th.style.fontWeight = "600";
    });
    const body = append(this.table, $("tbody"));
    const fixed = state.rows.filter((r) => r.kind !== "node");
    let nodes = state.rows.filter((r) => r.kind === "node");
    if (state.testing && this.rowOrder.length) {
      // 测速进行中保持原顺序，不让行跳来跳去；测完再按延迟排序。
      const order = new Map(this.rowOrder.map((name, index) => [name, index]));
      nodes.sort((a, b) => (order.get(a.name) ?? 1e9) - (order.get(b.name) ?? 1e9));
    } else {
      nodes.sort((a, b) => bestDelay(a) - bestDelay(b));
    }
    this.rowOrder = nodes.map((r) => r.name);
    for (const row of [...fixed, ...nodes]) {
      const active = row.kind === "node" ? state.mode === "node" && state.node === row.name : state.mode === row.kind;
      const tr = append(body, $("tr"));
      if (active) tr.style.background = "var(--vscode-list-activeSelectionBackground, var(--vscode-list-hoverBackground))";
      const name = append(tr, $("td", void 0, row.name));
      name.style.padding = "3px 8px";
      name.style.maxWidth = "260px";
      name.style.overflow = "hidden";
      name.style.textOverflow = "ellipsis";
      name.style.whiteSpace = "nowrap";
      name.title = row.name;
      const detail = append(tr, $("td", void 0, row.detail ?? ""));
      detail.style.padding = "3px 8px";
      detail.style.color = "var(--vscode-descriptionForeground)";
      detail.style.whiteSpace = "nowrap";
      detail.title = row.detail ?? "";
      for (const target of state.targets) {
        const value = row.delays?.[target.key];
        const pending = state.testing && (value === void 0 || value === null);
        const cell = append(tr, $("td", void 0, pending ? "…" : delayText(value)));
        cell.style.padding = "3px 8px";
        cell.style.whiteSpace = "nowrap";
        cell.style.color = delayColor(value);
      }
      const actionCell = append(tr, $("td"));
      actionCell.style.padding = "3px 8px";
      actionCell.style.textAlign = "right";
      if (active) {
        append(actionCell, $("span", void 0, "使用中")).style.color = "var(--vscode-testing-iconPassed)";
      } else {
        const use = append(actionCell, $("button.opencode-bridge-copy-url", void 0, "使用"));
        use.type = "button";
        use.disabled = this.busy;
        use.onclick = () => void this.run(TUNNEL_PROXY_SET_MODE, row.kind, row.kind === "node" ? row.name : void 0);
      }
    }
    this.updateControls();
    this.schedulePoll(state);
  }
};

export { OpenCodeTunnelProxySection };
