// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpImportPanel.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpImportPanel.ts
var CONFIRM_BOTH = "\u5BFC\u5165\u5E76\u542F\u7528\uFF08\u7F16\u8F91\u5668 + \u8FDC\u7A0B Bridge\uFF09";

var CONFIRM_BRIDGE = "\u590D\u5236\u914D\u7F6E\u5E76\u5F00\u653E\u7ED9 Bridge\uFF08\u539F\u751F\u4E0D\u53D8\uFF09";

var RESERVED_HEADERS = /* @__PURE__ */ new Set(["host", "content-length", "transfer-encoding", "connection", "mcp-session-id", "mcp-protocol-version", "proxy-authorization", "x-opencode-managed-streamable-http", "x-opencode-mcp-timeout-ms", "x-opencode-mcp-oauth"]);

function mcpSecretProblem(kind, name, value2) {
  if (!value2) return void 0;
  if (value2.length > 4096) return "\u5BC6\u94A5\u503C\u8D85\u8FC7 4096 \u4E2A\u5B57\u7B26\u3002";
  if (value2.includes("${")) return "\u5BC6\u94A5\u503C\u5305\u542B\u5C1A\u672A\u89E3\u6790\u7684\u53D8\u91CF\u5F15\u7528\u3002";
  if (kind === "bearer") return /\s/.test(value2) ? "Bearer \u4EE4\u724C\u4E0D\u80FD\u5305\u542B\u7A7A\u767D\u5B57\u7B26\u3002" : void 0;
  if (kind === "header") {
    if (!/^[A-Za-z][A-Za-z0-9_-]{0,99}$/.test(name)) return "Header \u540D\u79F0\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001- \u548C _\uFF0C\u5E76\u4EE5\u5B57\u6BCD\u5F00\u5934\u3002";
    if (RESERVED_HEADERS.has(name.toLowerCase())) return `Header\u300C${name}\u300D\u7531\u8FDE\u63A5\u672C\u8EAB\u4F7F\u7528\uFF0C\u4E0D\u80FD\u8BBE\u7F6E\u4E3A\u5BC6\u94A5\u3002`;
    return /[\r\n\0]/.test(value2) ? "\u5BC6\u94A5\u503C\u5305\u542B\u6362\u884C\u3002" : void 0;
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]{0,99}$/.test(name)) return "\u73AF\u5883\u53D8\u91CF\u540D\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u548C _\uFF0C\u4E14\u4E0D\u80FD\u4EE5\u6570\u5B57\u5F00\u5934\u3002";
  return ["OPENCODE_MCP_MANAGED", "OPENCODE_MCP_TIMEOUT_MS"].includes(name.toUpperCase()) ? "\u8BE5\u73AF\u5883\u53D8\u91CF\u7531 OpenCode \u5185\u90E8\u4F7F\u7528\u3002" : void 0;
}

var OpenCodeMcpImportPanel = class extends Disposable {
  constructor(container2, commandService, host) {
    super();
    this.commandService = commandService;
    this.host = host;
    this.previewDisposables = this._register(new DisposableStore());
    this.resultDisposables = this._register(new DisposableStore());
    this.auth = /* @__PURE__ */ new Map();
    this.selected = /* @__PURE__ */ new Set();
    this.target = "both";
    this.imported = [];
    this.generation = 0;
    this.busy = false;
    this.disposed = false;
    this.input = append(container2, $("textarea.skill-page-mcp-input"));
    this.input.rows = 3;
    this.input.placeholder = 'https://example.com/mcp  \u6216  npx -y @example/mcp  \u6216  { "mcpServers": { \u2026 } }';
    this.input.setAttribute("aria-label", "\u7C98\u8D34 MCP URL\u3001\u542F\u52A8\u547D\u4EE4\u6216\u914D\u7F6E JSON");
    this._register(addDisposableListener(this.input, "input", () => {
      if (!this.nativeRef) {
        this.target = "both";
        this.schedule();
      }
    }));
    this.previewView = append(container2, $(".skill-page-mcp-preview"));
    const actions = append(container2, $(".skill-page-actions"));
    this.confirm = append(actions, $("button.skill-page-button.skill-page-mcp-confirm", void 0, CONFIRM_BOTH));
    this.confirm.type = "button";
    this.confirm.disabled = true;
    this._register(addDisposableListener(this.confirm, "click", () => {
      void this.submit();
    }));
    this.resultView = append(container2, $(".skill-page-mcp-result"));
  }
  focusInput() {
    this.input.focus();
  }
  /** "开放已有服务给 Bridge…": the native config goes to the extension as an argument, never into the textarea. */
  async startNative(name, importable) {
    this.reset();
    this.host.reveal?.();
    const generation = ++this.generation, epoch = this.host.epoch();
    const preview = await this.commandService.executeCommand("opencode.mcp.preview", void 0, { native: { [name]: importable } });
    if (this.disposed || generation !== this.generation || epoch !== this.host.epoch() || !preview) return;
    this.nativeRef = preview.nativeRef;
    this.target = "bridge";
    this.input.value = preview.nativeView ?? "";
    this.input.readOnly = true;
    this.input.classList.add("native-view");
    this.input.setAttribute("aria-label", "\u539F\u751F MCP \u914D\u7F6E\uFF08\u53EA\u8BFB\uFF0C\u654F\u611F\u503C\u5DF2\u9690\u85CF\uFF09");
    this.accept(preview);
  }
  /** Called by the page after each catalog refresh so the result rows follow the live state. */
  updateResult() {
    if (this.imported.length) this.renderResult();
  }
  schedule() {
    const window2 = getWindow(this.input);
    if (this.timer !== void 0) window2.clearTimeout(this.timer);
    this.preview = void 0;
    this.previewDisposables.clear();
    this.auth.clear();
    clearNode(this.previewView);
    this.updateConfirm();
    const raw = this.input.value;
    if (!raw.trim()) return;
    const generation = ++this.generation, epoch = this.host.epoch();
    this.timer = window2.setTimeout(() => {
      void this.commandService.executeCommand("opencode.mcp.preview", raw).then((preview) => {
        if (this.disposed || generation !== this.generation || epoch !== this.host.epoch() || this.input.value !== raw || !preview) return;
        this.accept(preview);
      }, (error) => {
        if (generation === this.generation) this.host.showStatus(error instanceof Error ? error.message : String(error), true);
      });
    }, 180);
  }
  accept(preview) {
    const kept = new Set([...this.selected].filter((id2) => preview.entries.some((entry) => entry.id === id2)));
    this.preview = preview;
    this.selected.clear();
    for (const entry of preview.entries) if (!kept.size || kept.has(entry.id)) this.selected.add(entry.id);
    this.renderPreview();
  }
  renderPreview() {
    this.previewDisposables.clear();
    this.auth.clear();
    clearNode(this.previewView);
    this.previewView.hidden = false;
    const preview = this.preview;
    if (!preview) return;
    for (const entry of preview.entries) {
      const row = append(this.previewView, $(".skill-page-mcp-choice-row"));
      const label3 = append(row, $("label.skill-page-mcp-choice"));
      const box = append(label3, $("input"));
      box.type = "checkbox";
      box.checked = this.selected.has(entry.id);
      box.setAttribute("aria-label", `\u5BFC\u5165 ${entry.label}`);
      this.previewDisposables.add(addDisposableListener(box, "change", () => {
        if (box.checked) this.selected.add(entry.id);
        else this.selected.delete(entry.id);
        this.validate();
      }));
      append(label3, $("span", void 0, `${entry.label} \xB7 ${entry.transport === "http" ? entry.httpTransport === "sse" ? "SSE" : entry.httpTransport === "auto" ? "\u81EA\u52A8\uFF08HTTP / SSE\uFF09" : "Streamable HTTP" : "stdio"} \xB7 ${entry.detail}`));
      if (entry.description) append(row, $("p.skill-page-muted", void 0, `\u63CF\u8FF0\uFF1A${entry.description}`));
      if (entry.cwd) append(row, $("p.skill-page-muted", void 0, `\u5DE5\u4F5C\u76EE\u5F55\uFF1A${entry.cwd}\uFF08\u76F8\u5BF9\u8DEF\u5F84\u4EE5\u7528\u6237\u4E3B\u76EE\u5F55\u4E3A\u57FA\u51C6\uFF09`));
      if (entry.timeout !== void 0) append(row, $("p.skill-page-muted", void 0, `\u8D85\u65F6\uFF1A${entry.timeout} \u79D2`));
      this.renderAuth(row, entry);
    }
    for (const warning of preview.warnings ?? []) {
      append(this.previewView, $("p.skill-page-muted.skill-page-mcp-warning", void 0, `${warning.name}\uFF1A${warning.reason} \u5B57\u6BB5\uFF1A${warning.fields.join("\u3001")}`));
    }
    for (const error of preview.errors) append(this.previewView, $("p.skill-page-status.error", void 0, `${error.name}\uFF1A${error.reason}`));
    append(this.previewView, $("p.skill-page-muted", void 0, this.target === "bridge" ? "\u786E\u8BA4\u540E\u5C06\u914D\u7F6E\u590D\u5236\u5230\u7528\u6237\u76EE\u5F55\uFF0C\u4EC5\u5F00\u653E\u7ED9\u8FDC\u7A0B Bridge\uFF1B\u539F\u751F\u7F16\u8F91\u5668\u914D\u7F6E\u548C\u4F5C\u7528\u57DF\u4E0D\u53D8\u3002\u89E3\u6790/\u9884\u89C8\u4E0D\u4F1A\u8FDE\u63A5\u4E0A\u6E38\u3002" : "\u786E\u8BA4\u540E\u5C06\u5411\u7F16\u8F91\u5668\u548C\u8FDC\u7A0B Bridge \u5F00\u653E\u6240\u9009\u670D\u52A1\uFF1B\u53EA\u5BFC\u5165\u4FE1\u4EFB\u7684\u6765\u6E90\u3002\u89E3\u6790/\u9884\u89C8\u4E0D\u4F1A\u542F\u52A8\u8FDB\u7A0B\u6216\u8BBF\u95EE\u8FDC\u7AEF\u3002"));
    if (this.nativeRef) {
      const cancel = append(this.previewView, $("button.skill-page-button", void 0, "\u53D6\u6D88"));
      cancel.type = "button";
      this.previewDisposables.add(addDisposableListener(cancel, "click", () => this.reset()));
    }
    this.validate();
  }
  password(parent, label3) {
    const input = append(parent, $("input.skill-page-mcp-secret"));
    input.type = "password";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = label3;
    input.setAttribute("aria-label", label3);
    this.previewDisposables.add(addDisposableListener(input, "input", () => this.validate()));
    return input;
  }
  text(parent, label3) {
    const input = append(parent, $("input.skill-page-mcp-field"));
    input.type = "text";
    input.spellcheck = false;
    input.placeholder = label3;
    input.setAttribute("aria-label", label3);
    this.previewDisposables.add(addDisposableListener(input, "input", () => this.validate()));
    return input;
  }
  renderAuth(row, entry) {
    const auth = { mode: "none", env: [], oauth: entry.authType === "oauth" };
    this.auth.set(entry.id, auth);
    const block2 = append(row, $(".skill-page-mcp-auth"));
    const provided = entry.transport === "http" ? entry.providedHeaders : entry.providedEnv;
    if (provided?.length) append(block2, $("p.skill-page-muted", void 0, `\u6765\u81EA JSON\uFF1A${provided.join("\u3001")}\uFF08\u5DF2\u63D0\u4F9B\uFF0C\u4E0D\u663E\u793A\uFF1B\u4E0B\u9762\u586B\u5199\u540C\u540D\u9879\u53EF\u8986\u76D6\uFF09`));
    if (entry.urlHasQuery) append(block2, $("p.skill-page-muted", void 0, "\u5730\u5740\u542B\u67E5\u8BE2\u53C2\u6570\uFF1A\u6309\u654F\u611F\u503C\u6574\u4F53\u4FDD\u5B58\uFF0C\u5217\u8868\u53EA\u663E\u793A\u534F\u8BAE//\u4E3B\u673A\u3002"));
    const fields = append(block2, $(".skill-page-mcp-auth-fields"));
    if (entry.transport === "http") {
      auth.headerName = this.text(fields, "\u53EF\u9009 Header \u540D\u79F0\uFF0C\u4F8B\u5982 X-API-Key");
      auth.headerValue = this.password(fields, "Header \u503C");
      if (auth.oauth) {
        append(block2, $("p.skill-page-muted", void 0, "OAuth\uFF1A\u5BFC\u5165\u4E0D\u4F1A\u81EA\u52A8\u767B\u5F55\uFF1B\u4FDD\u5B58\u540E\u8BF7\u5728\u670D\u52A1\u5217\u8868\u70B9\u51FB\u300COAuth \u6388\u6743\u300D\u3002Authorization \u7531 OAuth \u7BA1\u7406\uFF0C\u5176\u4ED6\u8BF7\u6C42\u5934\u53EF\u540C\u65F6\u4F7F\u7528\u3002"));
      } else {
        const mode = append(fields, $("select.skill-page-mcp-auth-mode"));
        mode.setAttribute("aria-label", `${entry.label} \u7684\u8BA4\u8BC1\u65B9\u5F0F`);
        for (const [value2, text2] of [["none", "\u65E0\u8BA4\u8BC1"], ["bearer", "Bearer \u4EE4\u724C"], ["header", "\u81EA\u5B9A\u4E49 Header"]]) {
          const option2 = append(mode, $("option", void 0, text2));
          option2.value = value2;
        }
        auth.bearer = this.password(fields, "Bearer \u4EE4\u724C\uFF08\u53EF\u7A0D\u540E\u5728\u300C\u5BC6\u94A5\u2026\u300D\u4E2D\u8865\u5145\uFF09");
        const show3 = () => {
          auth.mode = mode.value;
          auth.bearer.hidden = auth.mode !== "bearer";
          this.validate();
        };
        this.previewDisposables.add(addDisposableListener(mode, "change", show3));
        show3();
      }
    } else {
      const add = append(fields, $("button.skill-page-button.skill-page-mcp-add-env", void 0, "\u6DFB\u52A0\u73AF\u5883\u53D8\u91CF"));
      add.type = "button";
      this.previewDisposables.add(addDisposableListener(add, "click", () => {
        if (auth.env.length >= 40) return;
        const pair = $(".skill-page-mcp-env-row");
        fields.insertBefore(pair, add);
        auth.env.push({ name: this.text(pair, "\u53D8\u91CF\u540D\uFF0C\u4F8B\u5982 API_KEY"), value: this.password(pair, "\u53D8\u91CF\u503C") });
      }));
    }
    auth.problem = append(block2, $("p.skill-page-status.error.skill-page-mcp-auth-problem"));
    auth.problem.hidden = true;
  }
  problemOf(auth) {
    if (auth.oauth && auth.headerValue?.value && auth.headerName?.value.trim().toLowerCase() === "authorization") return "OAuth \u5DF2\u7BA1\u7406 Authorization\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u8BF7\u6C42\u5934\u3002";
    if (auth.mode === "bearer") {
      const problem = mcpSecretProblem("bearer", "Authorization", auth.bearer?.value ?? "");
      if (problem) return problem;
      if (auth.bearer?.value && auth.headerValue?.value && auth.headerName?.value.trim().toLowerCase() === "authorization") return "Bearer \u4E0E\u81EA\u5B9A\u4E49 Authorization \u4E0D\u80FD\u540C\u65F6\u8BBE\u7F6E\uFF1B\u53EF\u4EE5\u6DFB\u52A0\u5176\u4ED6\u8BF7\u6C42\u5934\u3002";
    }
    if (auth.headerName) {
      const name = auth.headerName?.value.trim() ?? "", value2 = auth.headerValue?.value ?? "";
      if (name && !value2) return void 0;
      if (!name && value2) return "\u8BF7\u586B\u5199 Header \u540D\u79F0\u3002";
      return mcpSecretProblem("header", name, value2);
    }
    for (const pair of auth.env) {
      const name = pair.name.value.trim(), value2 = pair.value.value;
      if (!name && value2) return "\u8BF7\u586B\u5199\u73AF\u5883\u53D8\u91CF\u540D\u3002";
      const problem = name ? mcpSecretProblem("env", name, value2) : void 0;
      if (problem) return problem;
    }
    return void 0;
  }
  /** A selected entry with a problem keeps the confirm button disabled (R2 §6.2). */
  validate() {
    let ok2 = true;
    for (const [id2, auth] of this.auth) {
      const problem = this.selected.has(id2) ? this.problemOf(auth) : void 0;
      if (auth.problem) {
        auth.problem.textContent = problem ?? "";
        auth.problem.hidden = !problem;
      }
      if (problem) ok2 = false;
    }
    this.updateConfirm(ok2);
    return ok2;
  }
  updateConfirm(valid2 = true) {
    this.confirm.textContent = this.target === "bridge" ? CONFIRM_BRIDGE : CONFIRM_BOTH;
    this.confirm.disabled = this.busy || !this.preview || this.selected.size === 0 || !valid2;
  }
  collectSecrets() {
    const secrets = {};
    for (const [id2, auth] of this.auth) {
      if (!this.selected.has(id2)) continue;
      if (auth.mode === "bearer" && auth.bearer?.value) secrets[id2] = { bearer: auth.bearer.value };
      if (auth.headerName?.value.trim() && auth.headerValue?.value) secrets[id2] = { ...secrets[id2], headers: { [auth.headerName.value.trim()]: auth.headerValue.value } };
      const env2 = {};
      for (const pair of auth.env) if (pair.name.value.trim() && pair.value.value) env2[pair.name.value.trim()] = pair.value.value;
      if (Object.keys(env2).length) secrets[id2] = { env: env2 };
    }
    return secrets;
  }
  clearSecrets() {
    for (const auth of this.auth.values()) {
      for (const input of [auth.bearer, auth.headerValue, ...auth.env.map((pair) => pair.value)]) if (input) input.value = "";
    }
  }
  async submit() {
    const preview = this.preview;
    if (!preview || this.busy || !this.selected.size || !this.validate()) return;
    this.busy = true;
    this.updateConfirm();
    this.host.showStatus("\u6B63\u5728\u4FDD\u5B58\u2026");
    const selected = [...this.selected];
    try {
      const result = await this.commandService.executeCommand(
        "opencode.mcp.import",
        this.nativeRef ? { nativeRef: this.nativeRef } : this.input.value,
        preview.token,
        selected,
        this.target,
        this.collectSecrets()
      );
      if (this.disposed) return;
      if (result?.cancelled) {
        this.host.showStatus("\u5DF2\u53D6\u6D88\uFF0C\u672A\u66F4\u6539 MCP \u914D\u7F6E\u3002");
        return;
      }
      this.clearSecrets();
      this.imported = result?.imported ?? [];
      this.host.showStatus(`\u5DF2\u4FDD\u5B58 ${this.imported.length} \u4E2A MCP \u670D\u52A1\uFF1B${this.target === "bridge" ? "\u539F\u751F\u7F16\u8F91\u5668\u6765\u6E90\u4E0D\u53D8\uFF0CBridge \u5DF2\u83B7\u72EC\u7ACB\u6388\u6743\u3002" : "\u7F16\u8F91\u5668\u6309\u9700\u8FDE\u63A5\uFF0CBridge \u6B63\u5728\u5237\u65B0\u5DE5\u5177\u3002"}`);
      this.previewView.hidden = true;
      this.renderResult();
      await this.host.refresh();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.host.showStatus(reason, true);
      this.renderFailure(selected, reason);
    } finally {
      this.busy = false;
      this.updateConfirm();
    }
  }
  renderResult() {
    this.resultDisposables.clear();
    clearNode(this.resultView);
    append(this.resultView, $("h3", void 0, `\u5DF2\u4FDD\u5B58 ${this.imported.length} \u4E2A\u670D\u52A1`));
    for (const item of this.imported) {
      const row = append(this.resultView, $("p.skill-page-mcp-result-row"));
      row.dataset.serverId = item.id;
      row.textContent = `${item.label} \u2014 ${this.host.rowStatus(item.id) ?? "\u5DF2\u4FDD\u5B58\uFF0C\u6B63\u5728\u8FDE\u63A5\u2026"}`;
    }
    this.resultButtons();
  }
  renderFailure(selected, reason) {
    this.resultDisposables.clear();
    clearNode(this.resultView);
    for (const id2 of selected) {
      const label3 = this.preview?.entries.find((entry) => entry.id === id2)?.label ?? id2;
      append(this.resultView, $("p.skill-page-status.error.skill-page-mcp-result-row", void 0, `${label3}\uFF1A\u672A\u4FDD\u5B58 \u2014 ${reason}`));
    }
  }
  resultButtons() {
    const actions = append(this.resultView, $(".skill-page-actions"));
    const back = append(actions, $("button.skill-page-button", void 0, "\u8FD4\u56DE"));
    back.type = "button";
    this.resultDisposables.add(addDisposableListener(back, "click", () => {
      this.imported = [];
      this.resultDisposables.clear();
      clearNode(this.resultView);
      if (this.nativeRef) {
        this.reset();
        return;
      }
      this.schedule();
    }));
    const done = append(actions, $("button.skill-page-button", void 0, "\u5B8C\u6210"));
    done.type = "button";
    this.resultDisposables.add(addDisposableListener(done, "click", () => this.reset()));
  }
  reset() {
    this.generation++;
    if (this.timer !== void 0) getWindow(this.input).clearTimeout(this.timer);
    this.clearSecrets();
    this.nativeRef = void 0;
    this.target = "both";
    this.preview = void 0;
    this.imported = [];
    this.selected.clear();
    this.auth.clear();
    this.previewDisposables.clear();
    this.resultDisposables.clear();
    clearNode(this.previewView);
    clearNode(this.resultView);
    this.input.value = "";
    this.input.readOnly = false;
    this.input.classList.remove("native-view");
    this.input.setAttribute("aria-label", "\u7C98\u8D34 MCP URL\u3001\u542F\u52A8\u547D\u4EE4\u6216\u914D\u7F6E JSON");
    this.updateConfirm();
  }
  dispose() {
    this.disposed = true;
    this.generation++;
    if (this.timer !== void 0) getWindow(this.input).clearTimeout(this.timer);
    this.clearSecrets();
    super.dispose();
  }
};
export { mcpSecretProblem, CONFIRM_BOTH, CONFIRM_BRIDGE, RESERVED_HEADERS, OpenCodeMcpImportPanel };
