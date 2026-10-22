// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpAddForm.ts
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { OpenCodeMcpImportPanel, mcpSecretProblem } from "./module-2669.mjs";
import { buildMcpFormImport } from "./module-2668.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMcpAddForm.ts
var OpenCodeMcpAddForm = class extends Disposable {
  constructor(container2, commandService, host) {
    super();
    this.commandService = commandService;
    this.host = host;
    this.headers = [];
    this.env = [];
    this.busy = false;
    this.disposed = false;
    const form = append(container2, $(".skill-page-mcp-form"));
    const top2 = append(form, $(".skill-page-mcp-form-row"));
    this.nameInput = this.input(this.field(top2, "\u540D\u79F0"), "skill-page-mcp-form-name", "GitHub");
    this.kindSelect = this.select(this.field(top2, "\u7C7B\u578B"), "skill-page-mcp-form-kind", [["http", "\u8FDC\u7A0B\uFF08HTTP / SSE\uFF09"], ["stdio", "\u672C\u5730\u547D\u4EE4\uFF08stdio\uFF09"]]);
    this.descriptionInput = this.input(this.field(form, "\u63CF\u8FF0\uFF08\u53EF\u9009\uFF09"), "skill-page-mcp-form-description", "\u8FD9\u4E2A\u670D\u52A1\u7684\u7528\u9014");
    this.descriptionInput.maxLength = 2e3;
    this.httpGroup = append(form, $(".skill-page-mcp-form-group"));
    this.transportSelect = this.select(this.field(this.httpGroup, "\u4F20\u8F93"), "skill-page-mcp-form-transport", [["auto", "\u81EA\u52A8"], ["streamable-http", "Streamable HTTP"], ["sse", "SSE"]]);
    this.urlInput = this.input(this.field(this.httpGroup, "\u8FDC\u7A0B URL"), "skill-page-mcp-form-url", "https://mcp.example.com/mcp");
    this.authSelect = this.select(this.field(this.httpGroup, "\u9274\u6743"), "skill-page-mcp-form-auth", [["none", "\u65E0"], ["bearer", "Bearer \u4EE4\u724C"], ["oauth", "OAuth \u6D4F\u89C8\u5668\u6388\u6743"]]);
    this.bearerField = this.field(this.httpGroup, "Bearer \u4EE4\u724C");
    this.bearerInput = this.input(this.bearerField, "skill-page-mcp-form-bearer", "\u7C98\u8D34\u4EE4\u724C\uFF0C\u4FDD\u5B58\u540E\u53EA\u663E\u793A\u540D\u79F0");
    this.bearerInput.type = "password";
    this.bearerInput.autocomplete = "off";
    this.oauthGroup = append(this.httpGroup, $(".skill-page-mcp-form-group"));
    this.oauthClientId = this.input(this.field(this.oauthGroup, "OAuth Client ID\uFF08\u53EF\u9009\uFF09"), "skill-page-mcp-form-oauth-id", "\u7559\u7A7A\u81EA\u52A8\u6CE8\u518C\uFF1B\u4E0D\u652F\u6301\u81EA\u52A8\u6CE8\u518C\u65F6\u586B\u5199");
    this.oauthClientSecret = this.input(this.field(this.oauthGroup, "OAuth Client Secret\uFF08\u53EF\u9009\uFF09"), "skill-page-mcp-form-oauth-secret", "\u516C\u5171\u5BA2\u6237\u7AEF\u7559\u7A7A\uFF0C\u5BC6\u94A5\u53EA\u4FDD\u5B58\u5728\u5B89\u5168\u5B58\u50A8");
    this.oauthClientSecret.type = "password";
    this.oauthClientSecret.autocomplete = "off";
    this.oauthScope = this.input(this.field(this.oauthGroup, "OAuth Scope\uFF08\u53EF\u9009\uFF09"), "skill-page-mcp-form-oauth-scope", "\u4EE5\u7A7A\u683C\u5206\u9694\uFF0C\u7559\u7A7A\u91C7\u7528\u670D\u52A1\u516C\u5E03\u7684\u6743\u9650");
    append(this.oauthGroup, $("p.skill-page-muted", void 0, "\u624B\u52A8\u6CE8\u518C\u5BA2\u6237\u7AEF\u65F6\u767B\u8BB0\u56DE\u8C03\uFF1Ahttp://127.0.0.1:17947/opencode/mcp/oauth/callback\u3002\u6DFB\u52A0\u540E\u5728\u672C\u673A\u6D4F\u89C8\u5668\u6388\u6743\uFF1B\u4EE4\u724C\u4E0D\u9700\u8981\u590D\u5236\u7ED9\u667A\u80FD\u4F53\u3002\u5176\u4ED6\u56DE\u8C03\u7AEF\u53E3\u53EF\u5728\u670D\u52A1\u7684 OAuth \u8BBE\u7F6E\u4E2D\u914D\u7F6E\u3002"));
    this.headerField = this.field(this.httpGroup, "\u8BF7\u6C42\u5934\uFF08\u53EF\u9009\uFF0C\u53EF\u4E0E Bearer / OAuth \u540C\u65F6\u4F7F\u7528\uFF09");
    this.headerRows = append(this.headerField, $(".skill-page-mcp-form-pairs"));
    this.button(this.headerField, "\u6DFB\u52A0\u8BF7\u6C42\u5934", () => this.addPair(this.headerRows, this.headers, "X-API-Key"));
    this.stdioGroup = append(form, $(".skill-page-mcp-form-group"));
    this.commandInput = this.input(this.field(this.stdioGroup, "\u542F\u52A8\u547D\u4EE4"), "skill-page-mcp-form-command", "npx");
    this.argsInput = append(this.field(this.stdioGroup, "\u53C2\u6570\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09"), $("textarea.skill-page-mcp-form-args"));
    this.argsInput.rows = 3;
    this.argsInput.placeholder = "-y\n@modelcontextprotocol/server-github";
    this.argsInput.setAttribute("aria-label", "\u53C2\u6570\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09");
    this.cwdInput = this.input(this.field(this.stdioGroup, "\u5DE5\u4F5C\u76EE\u5F55\uFF08\u53EF\u9009\uFF09"), "skill-page-mcp-form-cwd", "\u7559\u7A7A\u4F7F\u7528\u7528\u6237\u4E3B\u76EE\u5F55\uFF1B\u76F8\u5BF9\u8DEF\u5F84\u4E5F\u4EE5\u4E3B\u76EE\u5F55\u4E3A\u57FA\u51C6");
    const envField = this.field(this.stdioGroup, "\u73AF\u5883\u53D8\u91CF");
    this.envRows = append(envField, $(".skill-page-mcp-form-pairs"));
    this.button(envField, "\u6DFB\u52A0\u73AF\u5883\u53D8\u91CF", () => this.addPair(this.envRows, this.env, "GITHUB_TOKEN"));
    this.timeoutInput = this.input(this.field(form, "\u8D85\u65F6\uFF08\u79D2\uFF0C\u53EF\u9009\uFF09"), "skill-page-mcp-form-timeout", "\u7559\u7A7A\u4F7F\u7528\u9ED8\u8BA4\u503C\uFF1B1\u20133600 \u79D2");
    this.timeoutInput.type = "number";
    this.timeoutInput.min = "1";
    this.timeoutInput.max = "3600";
    this.timeoutInput.step = "any";
    append(form, $("p.skill-page-muted", void 0, "\u8D85\u65F6\u7528\u4E8E\u8FDE\u63A5\u3001\u53D1\u73B0\u5DE5\u5177\u548C\u8C03\u7528\u8BF7\u6C42\uFF1B\u81EA\u52A8\u4F20\u8F93\u5148\u5C1D\u8BD5 Streamable HTTP\uFF0C\u4EC5\u5728\u7AEF\u70B9\u4E0D\u517C\u5BB9\u65F6\u5C1D\u8BD5 SSE\u3002"));
    append(form, $("p.skill-page-muted", void 0, "\u4EE4\u724C\u3001\u8BF7\u6C42\u5934\u548C\u73AF\u5883\u53D8\u91CF\u7684\u503C\u53EA\u4FDD\u5B58\u5728\u7CFB\u7EDF\u51ED\u636E\u5E93\u4E2D\uFF0C\u5217\u8868\u91CC\u53EA\u663E\u793A\u540D\u79F0\uFF1B\u4FDD\u5B58\u540E\u53EF\u5728\u8BE5\u670D\u52A1\u7684\u300C\u5BC6\u94A5\u2026\u300D\u91CC\u4FEE\u6539\u3002"));
    append(form, $("p.skill-page-muted", void 0, "\u4E0D\u60F3\u624B\u52A8\u586B\u4E5F\u53EF\u4EE5\u8BA9\u667A\u80FD\u4F53\u7528\u5185\u7F6E\u7684 configure_mcp \u5DE5\u5177\u914D\u7F6E\uFF1A\u7ED9\u5B83\u8FDC\u7A0B URL\u3001\u5BC6\u94A5\u6216\u670D\u52A1\u540D\uFF0C\u5B83\u4F1A\u81EA\u52A8\u5199\u5165\u8FD9\u91CC\uFF08\u7F16\u8F91\u5668\u4E0E Bridge \u7528\u7684\u540C\u4E00\u4EFD\u914D\u7F6E\uFF09\u3002OpenCode Bridge \u81EA\u8EAB\uFF08ngrok / Cloudflare \u96A7\u9053\u90A3\u4E2A\uFF09\u65E0\u9700\u5728\u6B64\u6DFB\u52A0\u3002"));
    this.problem = append(form, $("p.skill-page-mcp-form-problem"));
    this.problem.setAttribute("role", "alert");
    const actions = append(form, $(".skill-page-actions"));
    this.submitButton = this.button(actions, "\u6DFB\u52A0\u5E76\u542F\u7528", () => {
      void this.submit();
    });
    this.submitButton.classList.add("skill-page-mcp-form-submit", "primary");
    this.button(actions, "\u6E05\u7A7A", () => this.reset());
    this._register(addDisposableListener(this.kindSelect, "change", () => this.layout()));
    this._register(addDisposableListener(this.authSelect, "change", () => this.layout()));
    this.layout();
  }
  dispose() {
    this.disposed = true;
    this.clearSecrets();
    super.dispose();
  }
  /** A div, not a label: fields with several controls must not forward clicks on their caption to a button. */
  field(parent, label3) {
    const field = append(parent, $(".skill-page-mcp-form-field"));
    field.dataset.label = label3;
    append(field, $("span.skill-page-mcp-form-label", void 0, label3));
    return field;
  }
  input(parent, className2, placeholder) {
    const input = append(parent, $(`input.skill-page-mcp-form-input.${className2}`));
    input.type = "text";
    input.placeholder = placeholder;
    input.spellcheck = false;
    input.setAttribute("aria-label", parent.dataset.label ?? placeholder);
    return input;
  }
  select(parent, className2, options3) {
    const select = append(parent, $(`select.skill-page-mcp-form-input.${className2}`));
    select.setAttribute("aria-label", parent.dataset.label ?? className2);
    for (const [value2, label3] of options3) {
      const option2 = append(select, $("option", void 0, label3));
      option2.value = value2;
    }
    return select;
  }
  button(parent, label3, run) {
    const button = append(parent, $("button.skill-page-button", void 0, label3));
    button.type = "button";
    this._register(addDisposableListener(button, "click", (event) => {
      event.preventDefault();
      run();
    }));
    return button;
  }
  addPair(parent, rows, placeholder) {
    const line = append(parent, $(".skill-page-mcp-form-pair"));
    const name = append(line, $("input.skill-page-mcp-form-input.skill-page-mcp-form-pair-name"));
    name.placeholder = placeholder;
    name.spellcheck = false;
    name.setAttribute("aria-label", "\u540D\u79F0");
    const value2 = append(line, $("input.skill-page-mcp-form-input.skill-page-mcp-form-pair-value"));
    value2.type = "password";
    value2.autocomplete = "off";
    value2.placeholder = "\u503C\uFF08\u4FDD\u5B58\u540E\u9690\u85CF\uFF09";
    value2.setAttribute("aria-label", "\u503C");
    const row = { name, value: value2 };
    rows.push(row);
    this.button(line, "\u5220\u9664", () => {
      value2.value = "";
      line.remove();
      rows.splice(rows.indexOf(row), 1);
    });
    name.focus();
  }
  layout() {
    const kind = this.kindSelect.value, auth = this.authSelect.value;
    this.httpGroup.hidden = kind !== "http";
    this.stdioGroup.hidden = kind !== "stdio";
    this.bearerField.hidden = auth !== "bearer";
    this.oauthGroup.hidden = auth !== "oauth";
    this.submitButton.textContent = kind === "http" && auth === "oauth" ? "\u6DFB\u52A0\u5E76\u6388\u6743" : "\u6DFB\u52A0\u5E76\u542F\u7528";
    this.headerField.hidden = false;
  }
  values(rows) {
    return rows.map((row) => ({ name: row.name.value, value: row.value.value }));
  }
  show(problem, field) {
    this.problem.textContent = problem;
    const target = field === "name" ? this.nameInput : field === "url" ? this.urlInput : field === "bearer" ? this.bearerInput : field === "command" ? this.commandInput : field === "args" ? this.argsInput : field === "description" ? this.descriptionInput : field === "cwd" ? this.cwdInput : field === "timeout" ? this.timeoutInput : field === "oauthClientId" ? this.oauthClientId : field === "oauthClientSecret" ? this.oauthClientSecret : field === "oauthScope" ? this.oauthScope : void 0;
    target?.focus();
  }
  async submit() {
    if (this.busy) {
      return;
    }
    const kind = this.kindSelect.value, auth = this.authSelect.value;
    const rows = kind === "stdio" ? this.env : this.headers;
    for (const row of rows) {
      const reason = mcpSecretProblem(kind === "stdio" ? "env" : "header", row.name.value.trim(), row.value.value);
      if (reason) {
        this.show(reason);
        return;
      }
    }
    const bearerReason = kind === "http" && auth === "bearer" ? mcpSecretProblem("bearer", "", this.bearerInput.value.trim()) : void 0;
    if (bearerReason) {
      this.show(bearerReason, "bearer");
      return;
    }
    const built = buildMcpFormImport({
      name: this.nameInput.value,
      kind,
      url: this.urlInput.value,
      auth,
      bearer: this.bearerInput.value,
      headers: this.values(this.headers),
      oauthClientId: this.oauthClientId.value,
      oauthClientSecret: this.oauthClientSecret.value,
      oauthScope: this.oauthScope.value,
      command: this.commandInput.value,
      args: this.argsInput.value,
      env: this.values(this.env),
      httpTransport: this.transportSelect.value,
      description: this.descriptionInput.value,
      cwd: this.cwdInput.value,
      timeout: this.timeoutInput.value
    });
    if (!built.ok) {
      this.show(built.problem, built.field);
      return;
    }
    this.busy = true;
    this.submitButton.disabled = true;
    this.show("");
    this.host.showStatus("\u6B63\u5728\u6DFB\u52A0\u2026");
    const epoch = this.host.epoch();
    try {
      const preview = await this.commandService.executeCommand("opencode.mcp.preview", built.raw);
      if (this.disposed) {
        return;
      }
      if (epoch !== this.host.epoch()) {
        this.host.showStatus("\u7A97\u53E3\u7684\u6587\u4EF6\u5939\u5DF2\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u63D0\u4EA4\u3002", true);
        return;
      }
      const entry = preview?.entries[0];
      if (!preview || !entry || preview.entries.length !== 1) {
        const reason = preview?.errors[0]?.reason ?? "\u65E0\u6CD5\u8BC6\u522B\u8FD9\u4E2A\u670D\u52A1\u3002";
        this.show(reason);
        this.host.showStatus(reason, true);
        return;
      }
      const result = await this.commandService.executeCommand(
        "opencode.mcp.import",
        built.raw,
        preview.token,
        [entry.id],
        "both",
        built.secrets ? { [entry.id]: built.secrets } : void 0
      );
      if (this.disposed) {
        return;
      }
      if (result?.cancelled) {
        this.host.showStatus("\u5DF2\u53D6\u6D88\uFF0C\u672A\u66F4\u6539 MCP \u914D\u7F6E\u3002");
        return;
      }
      this.host.showStatus(`\u5DF2\u6DFB\u52A0\u300C${built.label}\u300D\uFF1A\u7F16\u8F91\u5668\u6309\u9700\u8FDE\u63A5\uFF0CBridge \u6B63\u5728\u5237\u65B0\u5DE5\u5177\u3002`);
      this.reset();
      await this.host.refresh();
      if (kind === "http" && auth === "oauth") {
        const authorization = await this.commandService.executeCommand("opencode.mcp.oauth.authorize", entry.id);
        if (!this.disposed) {
          this.host.showStatus(authorization?.authorized ? "OAuth \u6388\u6743\u5B8C\u6210\uFF0C\u7F16\u8F91\u5668\u4E0E Bridge \u5C06\u4F7F\u7528\u540C\u4E00\u7EC4\u51ED\u636E\u3002" : "\u670D\u52A1\u5DF2\u4FDD\u5B58\uFF0COAuth \u5C1A\u672A\u5B8C\u6210\uFF1B\u53EF\u5728\u670D\u52A1\u5217\u8868\u7EE7\u7EED\u6388\u6743\u3002");
          await this.host.refresh();
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.show(reason);
      this.host.showStatus(reason, true);
    } finally {
      this.busy = false;
      this.submitButton.disabled = false;
    }
  }
  clearSecrets() {
    this.bearerInput.value = "";
    this.oauthClientSecret.value = "";
    for (const row of [...this.headers, ...this.env]) {
      row.value.value = "";
    }
  }
  reset() {
    this.clearSecrets();
    this.nameInput.value = "";
    this.urlInput.value = "";
    this.commandInput.value = "";
    this.argsInput.value = "";
    this.headers.length = 0;
    this.env.length = 0;
    clearNode(this.headerRows);
    clearNode(this.envRows);
    this.authSelect.value = "none";
    this.transportSelect.value = "auto";
    this.problem.textContent = "";
    this.descriptionInput.value = "";
    this.cwdInput.value = "";
    this.timeoutInput.value = "";
    this.oauthClientId.value = "";
    this.oauthScope.value = "";
    this.layout();
  }
};

function mountMcpImport(container2, commandService, host, register3) {
  const modes = append(container2, $(".skill-page-mcp-modes"));
  modes.setAttribute("role", "group");
  modes.setAttribute("aria-label", "\u6DFB\u52A0\u65B9\u5F0F");
  const formPane = append(container2, $(".skill-page-mcp-pane"));
  const jsonPane = append(container2, $(".skill-page-mcp-pane"));
  append(jsonPane, $("p.skill-page-muted", void 0, "\u7C98\u8D34 Streamable HTTP URL\u3001stdio \u542F\u52A8\u547D\u4EE4\u6216 mcpServers / servers JSON\u3002\u81EA\u52A8\u9884\u89C8\u4E0D\u4F1A\u8FDE\u63A5\u6216\u5199\u5165\uFF1B\u786E\u8BA4\u540E\uFF0C\u65B0\u670D\u52A1\u540C\u65F6\u53D1\u5E03\u7ED9\u7F16\u8F91\u5668\u548C\u8FDC\u7A0B Bridge\u3002"));
  const buttons = [];
  const select = (json) => {
    formPane.hidden = json;
    jsonPane.hidden = !json;
    buttons.forEach((button, index2) => button.setAttribute("aria-pressed", String(index2 === 1 === json)));
  };
  for (const [index2, label3] of ["\u6DFB\u52A0 MCP \u670D\u52A1", "\u5BFC\u5165 JSON"].entries()) {
    const button = append(modes, $("button.skill-page-button.skill-page-mcp-mode", void 0, label3));
    button.type = "button";
    buttons.push(button);
    register3(addDisposableListener(button, "click", () => {
      select(index2 === 1);
      if (index2 === 1) {
        panel.focusInput();
      }
    }));
  }
  const form = register3(new OpenCodeMcpAddForm(formPane, commandService, host));
  const panel = register3(new OpenCodeMcpImportPanel(jsonPane, commandService, { ...host, reveal: () => select(true) }));
  select(false);
  return { form, panel, showJson: () => select(true) };
}
export { mountMcpImport, OpenCodeMcpAddForm };
