// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeSkillWidget.ts
import { localizeBridge } from "./module-2621.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { extractEditorsDropData } from "./module-0273.mjs";
import { mountMcpImport } from "./module-2670.mjs";
import { MCP_ACTION_LABELS, bridgeCell, editorCell } from "./module-2672.mjs";
import { IMcpService, McpConnectionState } from "./module-1206.mjs";
import { manageMcpSecrets } from "./module-2671.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { aiCustomizationManagementSectionRegistry } from "./module-2623.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeCatalogRefresh.ts
var OpenCodeCatalogRefresh = class {
  constructor() {
    this.generation = 0;
    this.disposed = false;
  }
  get loading() {
    return this.pending !== void 0;
  }
  run(load, apply2, fail2, force = false) {
    if (this.disposed) return Promise.resolve(false);
    if (!force && this.pending) return this.pending.promise;
    const generation = ++this.generation;
    const current = () => !this.disposed && generation === this.generation;
    const promise = Promise.resolve().then(load).then((value2) => current() ? apply2(value2) !== false : false).catch((error) => {
      if (current()) fail2(error);
      return false;
    }).finally(() => {
      if (this.pending?.generation === generation) this.pending = void 0;
    });
    this.pending = { generation, promise };
    return promise;
  }
  invalidate() {
    this.generation++;
    this.pending = void 0;
  }
  dispose() {
    this.disposed = true;
    this.invalidate();
  }
};

// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeSkillWidget.ts
function skillDiagnosisGuidance(reasonCode) {
  switch (reasonCode) {
    case "invalid-frontmatter":
      return localizeBridge("opencodeBridge.skillGuideFrontmatter", "The --- frontmatter block at the top of SKILL.md is unfinished or missing its closing ---.");
    case "description-too-short":
      return localizeBridge("opencodeBridge.skillGuideDescription", "The skill description is under 80 characters: add a description in the SKILL.md frontmatter or extend the body text.");
    case "skill-md-too-large":
      return localizeBridge("opencodeBridge.skillGuideTooLarge", "SKILL.md exceeds the 64KB limit; trim it down.");
    case "entry-configured-missing":
      return localizeBridge("opencodeBridge.skillGuideEntryConfigured", "The entry file declared in the SKILL.md frontmatter does not exist; fix the entry or remove that line so an entry can be generated.");
    case "entry-escapes-workspace":
      return localizeBridge("opencodeBridge.skillGuideEntryEscapes", "The entry points outside the workspace, which is not allowed; use a relative path inside the skill folder.");
    case "entry-unsupported":
      return localizeBridge("opencodeBridge.skillGuideEntryUnsupported", "The entry script extension is not supported; use .mjs/.js/.cjs/.sh/.py.");
    case "no-skill-md":
      return localizeBridge("opencodeBridge.skillGuideNoSkillMd", "There is no SKILL.md in the folder.");
    case "invalid-name":
      return localizeBridge("opencodeBridge.skillGuideName", "The skill name is invalid: start with a lowercase letter, then lowercase letters/digits/_/- (max 64 chars), via the folder name or the frontmatter name.");
    case "reserved-name":
      return localizeBridge("opencodeBridge.skillGuideReserved", "The skill name collides with a built-in tool; rename it.");
    case "over-cap":
      return localizeBridge("opencodeBridge.skillGuideOverCap", "Only 32 skills load per workspace; extras are skipped.");
    case "duplicate-name":
      return localizeBridge("opencodeBridge.skillGuideDuplicate", "A JSON tool in the same folder already uses this name; rename one of them.");
    default:
      return localizeBridge("opencodeBridge.skillGuideUnknown", "It did not pass the loader checks.");
  }
}
function skillDirectoryName(directory) {
  return directory.split(/[\\/]/).filter(Boolean).pop() ?? directory;
}
function skillEntryGuidance(entry) {
  const dirName = skillDirectoryName(entry.directory);
  if (entry.reasonCode === "skills-disabled") {
    return localizeBridge("opencodeBridge.skillFixToggleTitle", "Skills are switched off, so '{0}' is not loaded.", dirName);
  }
  if (entry.reasonCode === "entry-missing") {
    return localizeBridge("opencodeBridge.skillFixEntryTitle", "Skill '{0}' is copied but has no executable entry.", dirName);
  }
  return skillDiagnosisGuidance(entry.reasonCode);
}
var OpenCodeSkillWidget = class extends Disposable {
  constructor(container3, commandService, configurationService, nativeMcpService, quickInputService, dialogService, fileService, workspaceContextService) {
    super();
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.nativeMcpService = nativeMcpService;
    this.quickInputService = quickInputService;
    this.dialogService = dialogService;
    this.fileService = fileService;
    this.workspaceContextService = workspaceContextService;
    this.instanceId = `opencode-skill-${OpenCodeSkillWidget.nextInstanceId++}`;
    this.controlBlocked = /* @__PURE__ */ new WeakMap();
    this.rowDisposables = this._register(new DisposableStore());
    this.summaryDisposables = this._register(new DisposableStore());
    this.jsonRowDisposables = this._register(new DisposableStore());
    this.mcpRowDisposables = this._register(new DisposableStore());
    this.mcpFingerprint = "";
    /** Busy keys `<action>-<serverId>` plus `global`: two servers never block each other (R2 §6.2). */
    this.mcpBusy = /* @__PURE__ */ new Set();
    /** Bumped when the window's folders change; late MCP responses for the previous folder set are dropped. */
    this.workspaceEpoch = 0;
    this.fingerprint = "";
    this.busy = false;
    this.skillRefresh = new OpenCodeCatalogRefresh();
    this.mcpRefresh = new OpenCodeCatalogRefresh();
    this.disposed = false;
    clearNode(container3);
    this.root = append(container3, $(".opencode-skill-page"));
    this.root.dataset.version = "skill-mcp-unified-v1";
    this.root.dataset.managementContract = "skill-actions-visible-v2";
    const pageHeading = append(this.root, $(".skill-page-heading.skill-page-page-heading"));
    append(pageHeading, $("h1", void 0, "Skill \u4E0E MCP"));
    this.button(pageHeading, "\u5237\u65B0", () => this.refresh(true));
    append(this.root, $("p.skill-page-intro", void 0, "Skill \u4E0E MCP \u5728\u540C\u4E00\u5904\u7BA1\u7406\uFF1B\u672C\u9875\u65B0\u5BFC\u5165\u7684 MCP \u53EF\u4F9B\u7F16\u8F91\u5668\u4E0E\u8FDC\u7A0B Bridge \u4F7F\u7528\uFF0C\u5386\u53F2\u539F\u751F\u670D\u52A1\u9ED8\u8BA4\u53EA\u5728\u7F16\u8F91\u5668\u4F7F\u7528\u3002"));
    const tabs = append(this.root, $(".skill-page-tabs"));
    tabs.setAttribute("role", "tablist");
    this.tabSkill = this.tabButton(tabs, "skill", "Skill\uFF080\uFF09");
    this.tabSkillLabel = this.tabSkill.querySelector(".skill-page-tab-label");
    this.tabMcp = this.tabButton(tabs, "mcp", "MCP \u670D\u52A1\uFF080\uFF09");
    this.tabMcpLabel = this.tabMcp.querySelector(".skill-page-tab-label");
    this.tabDot = append(this.tabMcp, $(".skill-page-tab-dot"));
    this.tabDot.hidden = true;
    this.tabDot.setAttribute("aria-label", "\u6709 MCP \u670D\u52A1\u9700\u8981\u6CE8\u610F");
    this.paneSkill = append(this.root, $(".skill-page-pane"));
    this.paneSkill.dataset.pane = "skill";
    this.paneSkill.setAttribute("role", "tabpanel");
    this.paneMcp = append(this.root, $(".skill-page-pane"));
    this.paneMcp.dataset.pane = "mcp";
    this.paneMcp.setAttribute("role", "tabpanel");
    for (const [name, pane] of [["skill", this.paneSkill], ["mcp", this.paneMcp]]) {
      pane.id = `${this.instanceId}-panel-${name}`;
      pane.setAttribute("aria-labelledby", `${this.instanceId}-tab-${name}`);
    }
    const installed = append(this.paneSkill, $("section.skill-page-section"));
    const heading2 = append(installed, $(".skill-page-heading"));
    append(heading2, $("h2", void 0, "\u5DF2\u5B89\u88C5\u6280\u80FD"));
    const headingActions = append(heading2, $(".skill-page-heading-actions"));
    const availabilityMenu = append(headingActions, $("details.skill-page-availability-menu"));
    const toggle = append(availabilityMenu, $("summary.skill-page-toggle"));
    this.enabled = append(toggle, $("input"));
    this.enabled.type = "checkbox";
    this._register(addDisposableListener(this.enabled, "click", (event) => event.stopPropagation()));
    this._register(addDisposableListener(this.enabled, "change", () => void this.run(async () => {
      await this.commandService.executeCommand("opencode.skills.setEnabled", this.enabled.checked, "effective");
    })));
    this.availabilityLabel = append(toggle, $("span", void 0, "\u52A0\u8F7D\uFF1A\u5F00\u542F"));
    append(toggle, $("span.skill-page-caret", void 0, "\u25BE"));
    const availabilityMenuBody = append(availabilityMenu, $(".skill-page-menu"));
    this.availabilitySource = append(availabilityMenuBody, $("span.skill-page-availability-source"));
    const sourceRow = append(availabilityMenuBody, $(".skill-page-availability-row"));
    this.allProjectsButton = this.button(sourceRow, "\u6539\u4E3A\u6240\u6709\u9879\u76EE\u9ED8\u8BA4", () => this.useForAllProjects(), false, "\u628A\u5F53\u524D\u5F00\u5173\u72B6\u6001\u5199\u5165\u7528\u6237\u8BBE\u7F6E\uFF0C\u5E76\u79FB\u9664\u6B64\u9879\u76EE\u7684\u5355\u72EC\u8BBE\u7F6E\uFF1B\u4E4B\u540E\u6240\u6709\u9879\u76EE\u90FD\u6309\u8FD9\u4E2A\u9ED8\u8BA4\u503C\u52A0\u8F7D Skill");
    this.allProjectsButton.classList.add("skill-page-link-button");
    this.allProjectsButton.hidden = true;
    this.availability = append(availabilityMenuBody, $("p.skill-page-muted"));
    append(availabilityMenuBody, $("p.skill-page-muted", void 0, "\u5F00\u5173\u5199\u5165\u5F53\u524D\u751F\u6548\u7684\u90A3\u4E00\u5C42\u8BBE\u7F6E\uFF1A\u9879\u76EE\u91CC\u5355\u72EC\u8BBE\u7F6E\u8FC7\u5C31\u53EA\u6539\u6B64\u9879\u76EE\uFF0C\u5426\u5219\u6309\u4E0A\u9762\u663E\u793A\u7684\u4F4D\u7F6E\u5199\u5165\u3002\u6B64\u5F00\u5173\u4E0D\u662F\u6388\u4E88 Agent \u81EA\u52A8\u5B89\u88C5\u6743\u9650\u3002Skill \u811A\u672C\u4EE5\u5F53\u524D\u7528\u6237\u6743\u9650\u8FD0\u884C\uFF0C\u4EC5\u5B89\u88C5\u4FE1\u4EFB\u7684\u6765\u6E90\u3002"));
    this.button(headingActions, "\u8BCA\u65AD\u5168\u90E8", () => this.diagnoseAll(), false, "\u91CD\u65B0\u626B\u63CF\uFF0C\u5217\u51FA\u6CA1\u6709\u52A0\u8F7D\u7684\u6280\u80FD\u53CA\u539F\u56E0\u548C\u4FEE\u590D\u529E\u6CD5");
    const locationRow = append(installed, $(".skill-page-location-row"));
    append(locationRow, $("span.skill-page-muted", void 0, "\u5168\u5C40\u5E93\u76EE\u5F55"));
    this.location = append(locationRow, $("code.skill-page-path", void 0, "\u6B63\u5728\u8BFB\u53D6\u2026"));
    const locationActions = append(locationRow, $(".skill-page-actions.skill-page-location-actions"));
    this.button(locationActions, "\u6253\u5F00\u76EE\u5F55", () => this.run(() => this.commandService.executeCommand("opencode.skills.openDirectory")));
    this.button(locationActions, "\u66F4\u6539\u4F4D\u7F6E\u2026", () => this.run(() => this.commandService.executeCommand("opencode.skills.changeLocation")));
    append(installed, $("p.skill-page-muted", void 0, "\u65B0\u5BFC\u5165\u548C\u201C\u590D\u5236\u5230\u5168\u5C40\u201D\u90FD\u4F1A\u5199\u5165\u6B64\u76EE\u5F55\u3002\u9ED8\u8BA4\u4F4D\u4E8E\u5B89\u88C5\u76EE\u5F55\u65C1\u7684\u72EC\u7ACB\u4F4D\u7F6E\uFF1B\u4E0D\u53EF\u5199\u65F6\u9700\u53E6\u9009\u5168\u5C40\u76EE\u5F55\uFF0C\u4E0D\u4F1A\u56DE\u9000\u5230\u9879\u76EE\u3002"));
    this.dropZone = append(installed, $("button.skill-page-drop"));
    this.dropZone.type = "button";
    this.dropZone.setAttribute("aria-label", "\u70B9\u51FB\u9009\u62E9\u6216\u62D6\u5165 Skill \u6587\u4EF6\u5939\uFF08\u6839\u76EE\u5F55\u987B\u6709 skill.md\uFF09\u5B89\u88C5\u5230\u5168\u5C40\u76EE\u5F55");
    append(this.dropZone, $("span.codicon.codicon-cloud-upload"));
    append(this.dropZone, $("span", void 0, "\u62D6\u5165 Skill \u6587\u4EF6\u5939\u5B89\u88C5\uFF0C\u6216\u70B9\u51FB\u9009\u62E9\u6587\u4EF6\u5939"));
    append(this.dropZone, $("small", void 0, "\u6587\u4EF6\u5939\u6839\u76EE\u5F55\u987B\u6709 skill.md\uFF08\u517C\u5BB9 SKILL.md\uFF09\xB7 \u8FDB\u5165\u76EE\u6807\u6587\u4EF6\u5939\u540E\u70B9\u51FB\u53F3\u4E0B\u89D2\u201C\u9009\u62E9\u6B64\u6587\u4EF6\u5939\u201D\u76F4\u63A5\u5BFC\u5165 \xB7 \u4E5F\u53EF\u62D6\u5165 .zip / .tar.gz / .tgz\uFF08\u4E0A\u9650 128MB\uFF09\xB7 \u5168\u5C40\u76EE\u5F55 \xB7 \u4E0D\u5199\u5165\u5F53\u524D\u9879\u76EE \xB7 \u4EC5\u5B89\u88C5\u53EF\u4FE1\u6765\u6E90"));
    this._register(addDisposableListener(this.dropZone, "click", () => void this.importSkill(void 0, "dialog")));
    const archiveImportButton = this.button(installed, "\u5BFC\u5165\u538B\u7F29\u5305\u2026", () => this.importSkill(void 0, "dialog", "archive"), false, "\u9009\u62E9 .zip\u3001.tar.gz \u6216 .tgz\uFF1B\u89E3\u538B\u540E\u4ECD\u9700\u5305\u542B SKILL.md");
    this._register(addDisposableListener(installed, "dragenter", (event) => {
      event.preventDefault();
      event.stopPropagation();
    }));
    this._register(addDisposableListener(installed, "dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = this.busy ? "none" : "copy";
      }
      if (!this.busy) {
        this.dropZone.classList.add("drag-over");
      }
    }));
    this._register(addDisposableListener(this.dropZone, "dragleave", () => this.dropZone.classList.remove("drag-over")));
    this._register(addDisposableListener(installed, "drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.dropZone.classList.remove("drag-over");
      if (this.busy) {
        return;
      }
      const resources = extractEditorsDropData(event).map((item) => item.resource).filter((resource) => !!resource);
      if (resources.length !== 1 || resources[0]?.scheme !== "file") {
        this.showStatus("\u8BF7\u4E00\u6B21\u62D6\u5165\u4E00\u4E2A\u672C\u5730 Skill \u6587\u4EF6\u5939\u6216 .zip / .tar.gz \u538B\u7F29\u5305\uFF1B\u4E5F\u53EF\u4EE5\u70B9\u51FB\u9009\u62E9\u3002", true);
        return;
      }
      void this.importDropped(resources[0]);
    }));
    const toolbar = append(installed, $(".skill-page-toolbar"));
    this.search = append(toolbar, $("input.skill-page-search"));
    this.search.type = "search";
    this.search.placeholder = "\u641C\u7D22\u6280\u80FD\u540D\u79F0\u3001\u63CF\u8FF0\u6216\u8DEF\u5F84";
    this.search.setAttribute("aria-label", "\u641C\u7D22 Skill");
    this.filter = append(toolbar, $("select.skill-page-filter"));
    this.filter.setAttribute("aria-label", "\u7B5B\u9009 Skill \u6765\u6E90");
    for (const [value2, label3] of [["all", "\u5168\u90E8\u6765\u6E90"], ["global", "\u5168\u5C40"], ["workspace", "\u5F53\u524D\u9879\u76EE"]]) {
      const option2 = append(this.filter, $("option", void 0, label3));
      option2.value = value2;
    }
    this.stateFilter = append(toolbar, $("select.skill-page-state-filter"));
    this.stateFilter.setAttribute("aria-label", "\u7B5B\u9009 Skill \u72B6\u6001");
    for (const [value2, label3] of [["all", "\u5168\u90E8\u72B6\u6001"], ["problem", "\u672A\u52A0\u8F7D"], ["loaded", "\u5DF2\u52A0\u8F7D"]]) {
      const option2 = append(this.stateFilter, $("option", void 0, label3));
      option2.value = value2;
    }
    this._register(addDisposableListener(this.search, "input", () => this.renderEntries()));
    this._register(addDisposableListener(this.filter, "change", () => this.renderEntries()));
    this._register(addDisposableListener(this.stateFilter, "change", () => this.renderEntries()));
    this.scopeSummary = append(installed, $("p.skill-page-muted.skill-page-scope-summary"));
    this.scopeSummary.setAttribute("aria-live", "polite");
    this.status = append(installed, $(".skill-page-status"));
    this.status.setAttribute("role", "status");
    this.status.setAttribute("aria-live", "polite");
    this.diagnosisSummary = append(installed, $(".skill-page-diagnosis"));
    this.diagnosisSummary.hidden = true;
    this.list = append(installed, $(".skill-page-list"));
    this.list.setAttribute("aria-label", "\u5DF2\u5B89\u88C5 Skill");
    const importControls = append(installed, $(".skill-page-import-controls"));
    importControls.appendChild(this.dropZone);
    importControls.appendChild(archiveImportButton);
    const jsonSection = append(this.paneSkill, $("section.skill-page-section.skill-page-json-tools"));
    const jsonDetails = append(jsonSection, $("details.skill-page-card.skill-page-json-card"));
    this.jsonToolsSummary = append(jsonDetails, $("summary", void 0, "\u73B0\u6709\u81EA\u5B9A\u4E49\u5DE5\u5177\uFF08JSON\uFF09"));
    append(jsonDetails, $("p.skill-page-muted", void 0, "\u9879\u76EE\u4E2D .opencode/mcp-tools/*.json \u5B9A\u4E49\u7684\u5DE5\u5177\uFF1A\u4E0E Skill \u5206\u5F00\u7BA1\u7406\uFF0C\u53EA\u4F5C\u7528\u4E8E\u6240\u5C5E\u9879\u76EE\uFF1B\u5B83\u4EEC\u4E0D\u662F MCP \u670D\u52A1\uFF0C\u4E5F\u4E0D\u662F\u538B\u7F29\u5305 Skill\u3002"));
    this.jsonToolsList = append(jsonDetails, $(".skill-page-json-list"));
    this.jsonToolsList.setAttribute("aria-label", "\u73B0\u6709\u81EA\u5B9A\u4E49\u5DE5\u5177\uFF08JSON\uFF09");
    this.mcpSection = append(this.paneMcp, $("section.skill-page-section.skill-page-mcp"));
    const mcpHeading = append(this.mcpSection, $(".skill-page-heading"));
    append(mcpHeading, $("h2", void 0, "MCP \u670D\u52A1"));
    const mcpHeadingActions = append(mcpHeading, $(".skill-page-heading-actions"));
    this.mcpChip = append(mcpHeadingActions, $("span.skill-page-chip", void 0, "\u7F16\u8F91\u5668 0 \xB7 Bridge 0"));
    append(this.mcpSection, $("p.skill-page-muted", void 0, "\u65B0\u670D\u52A1\u540C\u65F6\u53D1\u5E03\u7ED9\u7F16\u8F91\u5668\u548C\u8FDC\u7A0B Bridge\u3002\u53EF\u4EE5\u6309\u8868\u5355\u6DFB\u52A0\uFF0C\u4E5F\u53EF\u4EE5\u5BFC\u5165\u73B0\u6210\u7684 JSON \u914D\u7F6E\u3002"));
    this.mcpAdd = append(this.mcpSection, $("details.skill-page-mcp-add"));
    this.mcpAdd.open = true;
    append(this.mcpAdd, $("summary", void 0, "\u6DFB\u52A0\u6216\u5BFC\u5165 MCP \u670D\u52A1"));
    const mcpAddBody = append(this.mcpAdd, $(".skill-page-mcp-add-body"));
    this.mcpImport = mountMcpImport(mcpAddBody, this.commandService, {
      epoch: () => this.workspaceEpoch,
      rowStatus: (id2) => {
        const entry = this.mcpCatalog?.entries.find((item) => item.id === id2);
        return entry ? this.mcpRowSummary(entry) : void 0;
      },
      refresh: () => this.refresh(true),
      showStatus: (text2, error) => this.showMcpStatus(text2, error)
    }, (value2) => this._register(value2)).panel;
    this.mcpStatus = append(this.mcpSection, $(".skill-page-status"));
    this.mcpStatus.setAttribute("role", "status");
    this.mcpStatus.setAttribute("aria-live", "polite");
    this.mcpList = append(this.mcpSection, $(".skill-page-list"));
    this.mcpList.setAttribute("aria-label", "\u5171\u4EAB MCP \u670D\u52A1");
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencode.bridge.skillsEnabled")) {
        void this.refresh(true);
      }
    }));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => {
      this.workspaceEpoch++;
      void this.refresh(true);
    }));
    const window2 = getWindow(container3);
    const timer = window2.setInterval(() => {
      if (!this.busy && !this.loading && this.root.getClientRects().length > 0) {
        void this.refresh();
      }
    }, 2e3);
    this._register(toDisposable(() => window2.clearInterval(timer)));
    this.activateTab("skill");
    void this.refresh(true);
  }
  static {
    this.nextInstanceId = 0;
  }
  get loading() {
    return this.skillRefresh.loading || this.mcpRefresh.loading;
  }
  tabButton(parent, name, label3) {
    const button = append(parent, $("button.skill-page-tab"));
    button.type = "button";
    button.dataset.tab = name;
    button.id = `${this.instanceId}-tab-${name}`;
    button.setAttribute("aria-controls", `${this.instanceId}-panel-${name}`);
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(name === "skill"));
    append(button, $("span.skill-page-tab-label", void 0, label3));
    this._register(addDisposableListener(button, "click", () => this.activateTab(name)));
    this._register(addDisposableListener(button, "keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }
      event.preventDefault();
      const target = event.key === "Home" ? "skill" : event.key === "End" ? "mcp" : name === "skill" ? "mcp" : "skill";
      this.activateTab(target);
      (target === "skill" ? this.tabSkill : this.tabMcp).focus();
    }));
    return button;
  }
  /** Switch the visible pane; the page scroller and all state stay shared. */
  activateTab(name) {
    const skill = name === "skill";
    this.tabSkill.classList.toggle("active", skill);
    this.tabMcp.classList.toggle("active", !skill);
    this.tabSkill.setAttribute("aria-selected", String(skill));
    this.tabMcp.setAttribute("aria-selected", String(!skill));
    this.tabSkill.tabIndex = skill ? 0 : -1;
    this.tabMcp.tabIndex = skill ? -1 : 0;
    this.closeMenus();
    this.paneSkill.hidden = !skill;
    this.paneMcp.hidden = skill;
  }
  /** Close every open ⋯ menu (used before an action runs and when rows re-render). */
  closeMenus() {
    for (const open2 of this.root.querySelectorAll("details.skill-page-more[open]")) {
      open2.open = false;
    }
  }
  /** A ⋯ overflow menu: primary actions stay on the row, the rest collapse here. */
  moreMenu(row, disposables) {
    const more = append(row, $("details.skill-page-more"));
    const summary = append(more, $("summary"));
    summary.setAttribute("aria-label", "\u66F4\u591A\u64CD\u4F5C");
    summary.setAttribute("aria-expanded", "false");
    append(summary, $("span", void 0, "\u22EF"));
    const menu = append(more, $(".skill-page-menu"));
    const view = getWindow(row);
    const position2 = () => {
      if (!more.open) {
        return;
      }
      const bounds = this.root.getBoundingClientRect(), anchor = summary.getBoundingClientRect();
      const below = Math.max(0, Math.min(bounds.bottom, view.innerHeight) - anchor.bottom - 8);
      const above = Math.max(0, anchor.top - Math.max(bounds.top, 0) - 8);
      const up = below < menu.scrollHeight + 10 && above > below;
      more.classList.toggle("open-up", up);
      menu.style.maxHeight = `${Math.floor(up ? above : below)}px`;
      const width2 = Math.max(0, Math.min(bounds.right, view.innerWidth) - Math.max(bounds.left, 0) - 8);
      menu.style.maxWidth = `${Math.floor(width2)}px`;
      menu.style.minWidth = `${Math.min(158, Math.floor(width2))}px`;
      menu.style.left = "auto";
      menu.style.right = "0";
      if (menu.getBoundingClientRect().left < Math.max(bounds.left, 0) + 4) {
        menu.style.left = "0";
        menu.style.right = "auto";
      }
    };
    disposables.add(addDisposableListener(more, "toggle", () => {
      summary.setAttribute("aria-expanded", String(more.open));
      if (!more.open) {
        return;
      }
      for (const other of this.root.querySelectorAll("details.skill-page-more[open]")) {
        if (other !== more) {
          other.open = false;
        }
      }
      summary.scrollIntoView({ block: "nearest" });
      position2();
    }));
    disposables.add(addDisposableListener(this.root, "scroll", position2));
    disposables.add(addDisposableListener(view, "resize", position2));
    disposables.add(addDisposableListener(view, "pointerdown", (event) => {
      if (more.open && !more.contains(event.target)) {
        more.open = false;
      }
    }));
    disposables.add(addDisposableListener(more, "keydown", (event) => {
      if (event.key === "Escape") {
        more.open = false;
        summary.focus();
        event.preventDefault();
        event.stopPropagation();
      }
    }));
    return menu;
  }
  button(parent, label3, action, rows = false, title, blocked = () => this.busy) {
    const button = append(parent, $("button.skill-page-button", void 0, label3));
    button.type = "button";
    button.disabled = blocked();
    this.controlBlocked.set(button, blocked);
    if (title) {
      button.title = title;
    }
    const listener = addDisposableListener(button, "click", () => {
      if (!blocked()) {
        void action();
      }
    });
    if (rows instanceof DisposableStore) {
      rows.add(listener);
    } else if (rows) {
      this.rowDisposables.add(listener);
    } else {
      this._register(listener);
    }
    return button;
  }
  /** Menu item: closes the menu, then runs the same action as its row-level twin. */
  menuButton(menu, label3, action, disposables, danger = false, blocked = () => this.busy) {
    const button = this.button(menu, label3, () => {
      this.closeMenus();
      void action();
    }, disposables, void 0, blocked);
    if (danger) {
      button.classList.add("danger");
    }
    return button;
  }
  showStatus(text2, error = false) {
    this.status.textContent = text2;
    this.status.classList.toggle("error", error);
  }
  setBusy(value2) {
    this.busy = value2;
    this.root.setAttribute("aria-busy", String(value2));
    for (const element of this.root.querySelectorAll(".skill-page-button, .skill-page-drop, .skill-page-toggle input")) {
      if (!this.mcpSection.contains(element)) {
        element.disabled = this.controlBlocked.get(element)?.() ?? value2;
      }
    }
  }
  async run(action) {
    if (this.busy) {
      return;
    }
    this.skillRefresh.invalidate();
    this.setBusy(true);
    this.showStatus("\u6B63\u5728\u5904\u7406\u2026");
    try {
      const outcome = await action();
      if (!this.disposed && typeof outcome === "object" && outcome !== null && "cancelled" in outcome && outcome.cancelled === true) {
        this.showStatus("\u5DF2\u53D6\u6D88\uFF0C\u672A\u66F4\u6539 Skill\u3002");
        return;
      }
      if (!this.disposed) {
        this.showStatus("");
        await this.refresh(true);
      }
    } catch (error) {
      if (!this.disposed) {
        this.showStatus(error instanceof Error ? error.message : String(error), true);
      }
    } finally {
      if (!this.disposed) {
        this.setBusy(false);
      }
    }
  }
  /** Both folders and archives go through the backend's root-file, tree and transactional checks. */
  async importDropped(resource) {
    try {
      await this.fileService.stat(resource);
    } catch {
      if (!this.disposed) {
        this.showStatus("\u65E0\u6CD5\u8BFB\u53D6\u6240\u9009 Skill \u6765\u6E90\uFF0C\u8BF7\u68C0\u67E5\u8DEF\u5F84\u548C\u6743\u9650\u3002", true);
      }
      return;
    }
    if (this.disposed) {
      return;
    }
    await this.importSkill(resource.fsPath, "drop");
  }
  async importSkill(source, origin, kind) {
    let importedDirectory = "";
    let importedName = "";
    let generatedRunner = false;
    await this.run(async () => {
      const outcome = await this.commandService.executeCommand("opencode.skills.import", source, { origin, ...kind ? { kind } : {} });
      const result = outcome?.result;
      if (result && !this.disposed) {
        this.search.value = "";
        this.filter.value = "global";
        importedDirectory = result.directory;
        importedName = result.name;
        generatedRunner = result.generatedRunner === true;
      }
    });
    if (this.disposed || !importedDirectory) {
      return;
    }
    if (generatedRunner) {
      this.showStatus(localizeBridge("opencodeBridge.skillImportedRunner", "Imported Skill '{0}': no entry script was present, so OpenCode generated scripts/run.mjs that returns the skill instructions when called.", importedName));
    }
    this.activateTab("skill");
    this.locateSkillRow(importedDirectory);
  }
  locateSkillRow(directory) {
    for (const child of Array.from(this.list.children)) {
      if (child instanceof HTMLElement && child.dataset.skillDirectory === directory) {
        child.scrollIntoView({ block: "nearest" });
        break;
      }
    }
  }
  refresh(force = false) {
    if (this.disposed || !force && (this.loading || this.busy)) {
      return Promise.resolve();
    }
    return Promise.all([this.refreshSkills(force), this.refreshMcp(force)]).then(() => void 0);
  }
  refreshSkills(force) {
    return this.skillRefresh.run(async () => {
      const catalog = await this.commandService.executeCommand("opencode.skills.getCatalog");
      if (!catalog) {
        throw new Error("\u672A\u80FD\u8BFB\u53D6 Skill \u76EE\u5F55\uFF0C\u8BF7\u70B9\u51FB\u5237\u65B0\u91CD\u8BD5\u3002");
      }
      return catalog;
    }, (catalog) => {
      this.catalog = catalog;
      this.location.textContent = catalog.directory;
      this.location.title = catalog.directory;
      this.enabled.checked = catalog.skillsEnabled;
      this.availabilityLabel.textContent = catalog.skillsEnabled ? "\u52A0\u8F7D\uFF1A\u5F00\u542F" : "\u52A0\u8F7D\uFF1A\u5173\u95ED";
      this.tabSkillLabel.textContent = `Skill\uFF08${catalog.entries.length}\uFF09`;
      this.renderAvailability(catalog);
      this.availability.textContent = catalog.trusted === false ? "\u5F53\u524D\u5DE5\u4F5C\u533A\u672A\u53D7\u4FE1\u4EFB\uFF0C\u4E0D\u80FD\u6267\u884C Skill\u3002\u4ECD\u53EF\u67E5\u770B\u5168\u5C40\u76EE\u5F55\u3002" : catalog.availability?.hasWorkspace === false ? "\u5F53\u524D\u7A97\u53E3\u6CA1\u6709\u6253\u5F00\u9879\u76EE\uFF1A\u4ECD\u53EF\u53D1\u73B0\u548C\u7BA1\u7406\u5168\u5C40 Skill\u3002Agent \u901A\u8FC7 list_skills \u83B7\u53D6\u8DEF\u5F84\u540E\u8BFB\u53D6\u8BF4\u660E\u6587\u4EF6\uFF0CSkill \u4E0D\u6CE8\u518C\u4E3A MCP \u5DE5\u5177\u3002" : "\u5168\u5C40\u542F\u505C\u548C\u5220\u9664\u5F71\u54CD\u6240\u6709\u5DE5\u4F5C\u533A\uFF1B\u9879\u76EE\u539F\u4EF6\u4E0D\u4F1A\u88AB\u81EA\u52A8\u79FB\u52A8\u3002\u540C\u540D\u65F6\u5168\u5C40 Skill \u4F18\u5148\u3002";
      const next = JSON.stringify(catalog);
      if (force || next !== this.fingerprint) {
        this.fingerprint = next;
        this.renderEntries();
        this.renderJsonTools();
      }
    }, (error) => this.showStatus(error instanceof Error ? error.message : String(error), true), force);
  }
  refreshMcp(force) {
    return this.mcpRefresh.run(async () => {
      const mcp = await this.commandService.executeCommand("opencode.mcp.getCatalog");
      if (!mcp) {
        throw new Error("\u672A\u80FD\u8BFB\u53D6 MCP \u76EE\u5F55\uFF0C\u8BF7\u70B9\u51FB\u5237\u65B0\u91CD\u8BD5\u3002");
      }
      return mcp;
    }, (mcp) => {
      this.mcpCatalog = mcp;
      if (mcp.error) {
        this.showMcpStatus(mcp.error, true);
      } else if (mcp.networkNotice) {
        this.showMcpStatus(mcp.networkNotice);
      }
      const nextMcp = JSON.stringify(mcp) + mcp.entries.map((entry) => this.nativeConnection(entry)).join("|");
      if (force || nextMcp !== this.mcpFingerprint) {
        this.mcpFingerprint = nextMcp;
        this.renderMcpEntries();
      }
      this.tabMcpLabel.textContent = `MCP \u670D\u52A1\uFF08${mcp.entries.length}\uFF09`;
      this.tabDot.hidden = !mcp.error && !mcp.entries.some((entry) => this.mcpRowHasProblem(editorCell(entry.editorState, this.nativeConnection(entry), entry.bridge), bridgeCell(entry.bridge)));
      this.mcpImport.updateResult();
      return !mcp.error;
    }, (error) => this.showMcpStatus(error instanceof Error ? error.message : String(error), true), force);
  }
  mcpRowHasProblem(editor, bridge) {
    const bad = ["needs-auth", "proxy-error", "failed", "restricted"];
    return bad.includes(editor.status) || bad.includes(bridge.status);
  }
  renderEntries() {
    this.rowDisposables.clear();
    this.closeMenus();
    clearNode(this.list);
    this.renderDiagnosisSummary();
    const query = this.search.value.trim().toLocaleLowerCase();
    const state = this.stateFilter.value;
    const allEntries = this.catalog?.entries ?? [];
    const entries2 = allEntries.filter((entry) => (this.filter.value === "all" || this.filter.value === entry.scope) && (state === "all" || state === "problem" === !!entry.reasonCode) && `${entry.title} ${entry.name} ${entry.description} ${entry.directory}`.toLocaleLowerCase().includes(query));
    const globalCount = allEntries.filter((entry) => entry.scope === "global").length;
    this.scopeSummary.textContent = `\u663E\u793A ${entries2.length}/${allEntries.length} \xB7 \u5168\u5C40 ${globalCount} \xB7 \u5F53\u524D\u9879\u76EE ${allEntries.length - globalCount}`;
    if (!entries2.length) {
      const emptyMessage = query ? "\u6CA1\u6709\u5339\u914D\u7684\u6280\u80FD" : state === "problem" ? "\u6CA1\u6709\u672A\u52A0\u8F7D\u7684\u6280\u80FD" : state === "loaded" ? "\u6CA1\u6709\u5DF2\u52A0\u8F7D\u7684\u6280\u80FD" : this.filter.value === "global" ? "\u6682\u65E0\u5168\u5C40 Skill\uFF1B\u9009\u62E9\u6216\u62D6\u5165\u6839\u76EE\u5F55\u542B skill.md \u7684 Skill \u6587\u4EF6\u5939\u5373\u53EF\u5F00\u59CB\u3002" : this.filter.value === "workspace" ? "\u5F53\u524D\u9879\u76EE\u6682\u65E0 Skill" : "\u6682\u65E0\u81EA\u5B9A\u4E49\u6280\u80FD";
      append(this.list, $("p.skill-page-empty", void 0, emptyMessage));
    }
    for (const entry of entries2) {
      const row = append(this.list, $("article.skill-page-card.skill-page-entry"));
      row.dataset.skillId = entry.id;
      row.dataset.skillDirectory = entry.directory;
      row.classList.toggle("newly-imported", this.catalog?.highlightedDirectory === entry.directory);
      row.classList.toggle("problem", !!entry.reasonCode);
      const top2 = append(row, $(".skill-page-row-top"));
      const dot = append(top2, $("span.skill-page-dot"));
      if (entry.reasonCode) {
        dot.classList.add("warn");
      } else if (entry.loaded && entry.enabled) {
        dot.classList.add("ok");
      }
      append(top2, $("h3", void 0, entry.title));
      append(top2, $("span.skill-page-source", void 0, entry.scope === "global" ? "\u5168\u5C40" : "\u5F53\u524D\u9879\u76EE"));
      append(top2, $("p.skill-page-description.skill-page-row-desc", void 0, entry.description || entry.reason || "\u6682\u65E0\u63CF\u8FF0"));
      append(top2, $(".skill-page-row-grow"));
      const action = (name) => this.run(() => this.commandService.executeCommand("opencode.skills.action", entry.id, name));
      if (entry.loaded && entry.managed) {
        this.button(top2, entry.enabled ? "\u505C\u7528" : "\u542F\u7528", () => action("toggle"), true);
      }
      if (entry.scope === "workspace") {
        this.button(top2, "\u590D\u5236\u5230\u5168\u5C40", () => action("promote"), true);
      }
      if (entry.fix === "generate-runner") {
        this.button(top2, localizeBridge("opencodeBridge.skillFixEntryAction", "Generate entry and refresh"), () => this.generateRunner(entry), true);
      }
      const deleteReason = !entry.loaded ? "\u6B64 Skill \u672A\u901A\u8FC7\u52A0\u8F7D\u68C0\u67E5\uFF0C\u6682\u4E0D\u53EF\u5220\u9664\uFF1B\u8BF7\u901A\u8FC7\u66F4\u591A\u64CD\u4F5C\u8BCA\u65AD\u6216\u6253\u5F00\u76EE\u5F55\u3002" : !entry.managed ? "\u6B64\u76EE\u5F55\u4E0D\u662F\u5F53\u524D\u751F\u6548\u7684\u540C\u540D Skill\uFF0C\u6682\u4E0D\u53EF\u5220\u9664\uFF1B\u8BF7\u6253\u5F00\u76EE\u5F55\u6838\u5BF9\uFF0C\u907F\u514D\u8BEF\u5220\u5176\u4ED6\u526F\u672C\u3002" : !entry.name ? "Skill \u6807\u8BC6\u4E0D\u5B8C\u6574\uFF0C\u8BF7\u5237\u65B0\u6216\u6253\u5F00\u76EE\u5F55\u68C0\u67E5\u3002" : void 0;
      const remove2 = this.button(
        top2,
        "\u5220\u9664",
        () => action("delete"),
        true,
        deleteReason ?? (entry.scope === "global" ? `\u5220\u9664\u5168\u5C40 Skill ${entry.title}\uFF0C\u786E\u8BA4\u540E\u5F71\u54CD\u6240\u6709\u5DE5\u4F5C\u533A` : `\u4EC5\u5220\u9664\u5F53\u524D\u9879\u76EE\u7684 Skill \u526F\u672C ${entry.title}\uFF0C\u4ECD\u9700\u786E\u8BA4`),
        () => this.busy || deleteReason !== void 0
      );
      remove2.classList.add("danger", "skill-page-primary-delete");
      if (deleteReason) {
        append(row, $("p.skill-page-muted.skill-page-action-note", void 0, deleteReason));
      }
      const menu = this.moreMenu(top2, this.rowDisposables);
      this.menuButton(menu, "\u67E5\u770B SKILL.md", () => action("document"), this.rowDisposables);
      this.menuButton(menu, "\u6253\u5F00\u76EE\u5F55", () => action("folder"), this.rowDisposables);
      this.menuButton(menu, localizeBridge("opencodeBridge.diagnoseSkillRow", "Diagnose"), () => this.diagnoseEntry(entry), this.rowDisposables, false).title = localizeBridge("opencodeBridge.diagnoseSkillRowTitle", "Diagnose why this skill does or does not load");
      this.menuButton(menu, localizeBridge("opencodeBridge.regenerateSkillEntry", "Rebuild entry"), () => this.generateRunner(entry), this.rowDisposables).title = localizeBridge("opencodeBridge.regenerateSkillEntryTitle", "Generate scripts/run.mjs when the skill has no entry script");
      append(row, $("p.skill-page-muted", void 0, entry.reason || (entry.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528")));
      if (entry.reasonCode) {
        append(row, $("p.skill-page-guidance", void 0, skillEntryGuidance(entry)));
      }
      const directory = append(row, $("code.skill-page-path", void 0, entry.directory));
      directory.title = entry.directory;
    }
  }
  renderAvailability(catalog) {
    const availability = catalog.availability;
    if (!availability) {
      this.availabilitySource.textContent = "";
      this.allProjectsButton.hidden = true;
      return;
    }
    const source = availability.source === "workspace" ? "\u6B64\u9879\u76EE" : availability.source === "user" ? "\u7528\u6237\u8BBE\u7F6E" : "\u9ED8\u8BA4";
    const parts = [`\u751F\u6548\u6765\u6E90\uFF1A${source}\uFF08\u5F53\u524D${availability.effective ? "\u5F00\u542F" : "\u5173\u95ED"}\uFF09\u3002`];
    if (availability.source === "workspace" && availability.userValue !== void 0 && availability.userValue !== availability.workspaceValue) {
      parts.push(`\u7528\u6237\u9ED8\u8BA4\u4E3A${availability.userValue ? "\u5F00\u542F" : "\u5173\u95ED"}\uFF0C\u6B64\u9879\u76EE\u5355\u72EC\u8BBE\u4E3A${availability.workspaceValue ? "\u5F00\u542F" : "\u5173\u95ED"}\u3002`);
    }
    parts.push(availability.effectiveTarget === "workspace" ? `\u5207\u6362\u5C06\u5199\u5165 ${availability.workspaceSettingsFile ?? "\u6B64\u9879\u76EE\u7684\u5DE5\u4F5C\u533A\u8BBE\u7F6E"}\u3002` : "\u5207\u6362\u5C06\u5199\u5165\u7528\u6237\u8BBE\u7F6E\uFF0C\u5BF9\u6240\u6709\u9879\u76EE\u751F\u6548\u3002");
    this.availabilitySource.textContent = parts.join("");
    this.availabilitySource.title = availability.workspaceSettingsFile ?? "";
    this.allProjectsButton.hidden = !(availability.hasWorkspace && availability.effectiveTarget === "workspace");
  }
  renderDiagnosisSummary() {
    this.summaryDisposables.clear();
    clearNode(this.diagnosisSummary);
    const pending = (this.catalog?.entries ?? []).filter((entry) => !!entry.reasonCode);
    this.diagnosisSummary.hidden = pending.length === 0;
    if (!pending.length) {
      return;
    }
    const switchedOff = pending.every((entry) => entry.reasonCode === "skills-disabled");
    append(this.diagnosisSummary, $("span", void 0, switchedOff ? `Skill \u603B\u5F00\u5173\u5DF2\u5173\u95ED\uFF0C${pending.length} \u4E2A\u6280\u80FD\u90FD\u6CA1\u6709\u52A0\u8F7D\u3002` : `${pending.length} \u4E2A\u6280\u80FD\u6CA1\u6709\u52A0\u8F7D\uFF0C\u539F\u56E0\u548C\u4FEE\u590D\u529E\u6CD5\u5199\u5728\u5404\u9879\u4E0B\u65B9\u3002`));
    const actions = append(this.diagnosisSummary, $(".skill-page-actions"));
    if (switchedOff) {
      this.button(actions, localizeBridge("opencodeBridge.skillFixToggleAction", "Enable Skills and refresh"), () => this.enableSkills(), this.summaryDisposables);
    }
    const missing = pending.filter((entry) => entry.fix === "generate-runner");
    if (missing.length) {
      this.button(actions, `\u4E3A\u5168\u90E8\u7F3A\u5C11\u5165\u53E3\u7684\u6280\u80FD\u751F\u6210\uFF08${missing.length}\uFF09`, () => this.generateAllRunners(missing), this.summaryDisposables);
    }
    if (this.stateFilter.value !== "problem") {
      this.button(actions, "\u53EA\u770B\u672A\u52A0\u8F7D", () => {
        this.filter.value = "all";
        this.stateFilter.value = "problem";
        this.renderEntries();
      }, this.summaryDisposables);
    }
  }
  renderJsonTools() {
    this.jsonRowDisposables.clear();
    clearNode(this.jsonToolsList);
    const tools = this.catalog?.jsonTools ?? [];
    this.jsonToolsSummary.textContent = `\u73B0\u6709\u81EA\u5B9A\u4E49\u5DE5\u5177\uFF08JSON\uFF09\xB7 ${tools.length}`;
    if (!tools.length) {
      append(this.jsonToolsList, $("p.skill-page-empty", void 0, this.catalog?.availability?.hasWorkspace === false ? "\u672A\u6253\u5F00\u9879\u76EE\uFF1AJSON \u81EA\u5B9A\u4E49\u5DE5\u5177\u53EA\u5C5E\u4E8E\u5177\u4F53\u9879\u76EE\u3002" : "\u5F53\u524D\u9879\u76EE\u6CA1\u6709 JSON \u81EA\u5B9A\u4E49\u5DE5\u5177\u3002"));
      return;
    }
    for (const tool of tools) {
      const row = append(this.jsonToolsList, $("article.skill-page-json-entry"));
      row.dataset.toolName = tool.name;
      const heading2 = append(row, $(".skill-page-heading"));
      append(heading2, $("h3", void 0, `JSON \xB7 ${tool.title || tool.name}`));
      append(heading2, $("span.skill-page-source", void 0, "\u9879\u76EE\u7EA7"));
      append(row, $("p.skill-page-description", void 0, tool.description));
      append(row, $("p.skill-page-muted", void 0, `\u5DE5\u5177\u540D ${tool.name} \xB7 ${tool.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528"}${tool.workspace ? ` \xB7 \u5F53\u524D\u5DE5\u4F5C\u533A ${tool.workspace}` : ""}`));
      const file = append(row, $("code.skill-page-path", void 0, tool.sourcePath));
      file.title = tool.sourcePath;
      const actions = append(row, $(".skill-page-actions"));
      this.button(actions, tool.enabled ? "\u505C\u7528" : "\u542F\u7528", () => this.run(() => this.commandService.executeCommand("opencode.bridge.customTools.toggle", tool.name)), this.jsonRowDisposables);
      this.button(actions, "\u5220\u9664", () => this.deleteJsonTool(tool), this.jsonRowDisposables);
    }
  }
  async useForAllProjects() {
    const effective = this.catalog?.availability?.effective ?? this.enabled.checked;
    await this.run(() => this.commandService.executeCommand("opencode.skills.setEnabled", effective, "all-projects"));
    if (!this.disposed && this.catalog?.availability?.source === "user") {
      this.showStatus(`\u5DF2\u6539\u4E3A\u6240\u6709\u9879\u76EE\u9ED8\u8BA4\uFF1ASkill ${effective ? "\u5F00\u542F" : "\u5173\u95ED"}\uFF0C\u6B64\u9879\u76EE\u4E0D\u518D\u5355\u72EC\u8BBE\u7F6E\u3002`);
    }
  }
  async enableSkills() {
    await this.run(() => this.commandService.executeCommand("opencode.skills.setEnabled", true, "effective"));
    const enabled = !this.disposed && this.catalog?.skillsEnabled === true;
    if (enabled) {
      this.showStatus(localizeBridge("opencodeBridge.skillsOn", "Skills enabled"));
    }
    return enabled;
  }
  async diagnoseAll() {
    if (this.busy) {
      return;
    }
    await this.refresh(true);
    const entries2 = this.catalog?.entries;
    if (this.disposed || !entries2) {
      return;
    }
    if (!entries2.length) {
      this.showStatus("\u6CA1\u6709\u627E\u5230 Skill\uFF1A\u53EF\u4EE5\u5728\u5BFC\u5165\u533A\u6DFB\u52A0\uFF0C\u6216\u5728\u9879\u76EE\u7684 .opencode/mcp-tools \u4E0B\u653E\u7F6E Skill \u6587\u4EF6\u5939\u3002");
      return;
    }
    const pending = entries2.filter((entry) => !!entry.reasonCode);
    if (!pending.length) {
      this.showStatus(localizeBridge("opencodeBridge.skillsDiagnoseAllLoaded", "Diagnosis complete: all {0} skills loaded.", entries2.length));
      return;
    }
    this.search.value = "";
    this.filter.value = "all";
    this.stateFilter.value = "problem";
    this.renderEntries();
    if (pending.length === 1) {
      await this.diagnoseEntry(pending[0]);
      return;
    }
    this.showStatus(localizeBridge("opencodeBridge.skillsDiagnoseMultiTitle", "{0} skills are not loaded.", pending.length));
  }
  async diagnoseEntry(entry) {
    let diagnosis = void 0;
    await this.run(async () => {
      const outcome = await this.commandService.executeCommand("opencode.skills.action", entry.id, "diagnose");
      diagnosis = outcome?.diagnosis;
    });
    if (this.disposed || !diagnosis) {
      return;
    }
    if (diagnosis.loaded) {
      this.showStatus(localizeBridge("opencodeBridge.skillRowInstructionsReady", "Skill '{0}' is installed. Read its instruction files; it is not an MCP tool.", diagnosis.dirName));
      return;
    }
    await this.showDiagnosis(entry, diagnosis);
  }
  /** Same dialogs as the Bridge page; global skills are repaired in place instead of jumping to this page. */
  async showDiagnosis(entry, diagnosis) {
    const fix = diagnosis.fix ?? "open-folder";
    const reason = diagnosis.reason ?? "";
    if (fix === "generate-runner") {
      const result2 = await this.dialogService.confirm({
        type: "warning",
        message: localizeBridge("opencodeBridge.skillFixEntryTitle", "Skill '{0}' is copied but has no executable entry.", diagnosis.dirName),
        detail: localizeBridge("opencodeBridge.skillFixEntryDetail", "No entry script (scripts/run.* or run.*) was found in the skill folder. Generate scripts/run.mjs in one click: calling the tool will then return the SKILL.md instructions, and the list refreshes automatically afterwards."),
        primaryButton: localizeBridge("opencodeBridge.skillFixEntryAction", "Generate entry and refresh")
      });
      if (result2.confirmed) {
        await this.generateRunner(entry);
      }
      return;
    }
    if (fix === "enable-skills") {
      const result2 = await this.dialogService.confirm({
        type: "warning",
        message: localizeBridge("opencodeBridge.skillFixToggleTitle", "Skills are switched off, so '{0}' is not loaded.", diagnosis.dirName),
        detail: localizeBridge("opencodeBridge.skillFixToggleDetail", "JSON manifests are unaffected. Turn the Skill switch on and the list refreshes automatically."),
        primaryButton: localizeBridge("opencodeBridge.skillFixToggleAction", "Enable Skills and refresh")
      });
      if (!result2.confirmed || !await this.enableSkills()) {
        return;
      }
      const after2 = this.catalog?.entries.find((item) => item.directory === entry.directory);
      if (after2 && !after2.reasonCode) {
        this.showStatus(localizeBridge("opencodeBridge.skillFixToggleDone", "'{0}' is now loaded.", diagnosis.dirName));
        return;
      }
      if (after2) {
        await this.showDiagnosis(after2, { dirName: diagnosis.dirName, loaded: false, reasonCode: after2.reasonCode, reason: after2.reason, fix: after2.fix });
        return;
      }
      this.showStatus(localizeBridge("opencodeBridge.skillFixToggleStillFailing", "Still not loaded; press Diagnose Skills to see why."), true);
      return;
    }
    const openSkillMd = fix === "open-skill-md";
    const guidance = skillDiagnosisGuidance(diagnosis.reasonCode);
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localizeBridge("opencodeBridge.skillFixManualTitle", "Skill '{0}' failed the load check: {1}", diagnosis.dirName, reason),
      detail: openSkillMd ? `${guidance} ${localizeBridge("opencodeBridge.skillFixManualMdHint", "Open SKILL.md, fix it, then press Refresh.")}` : `${guidance} ${localizeBridge("opencodeBridge.skillFixManualFolderHint", "Open the skill folder, fix it, then press Refresh.")}`,
      primaryButton: openSkillMd ? localizeBridge("opencodeBridge.skillFixOpenMd", "Open SKILL.md") : localizeBridge("opencodeBridge.skillFixOpenFolder", "Open skill folder")
    });
    if (!result.confirmed) {
      return;
    }
    await this.run(() => this.commandService.executeCommand("opencode.skills.action", entry.id, openSkillMd ? "document" : "folder"));
  }
  /** Row "rebuild entry": never overwrites an existing entry (skill-center refuses too); rechecks and explains afterwards. */
  async generateRunner(entry) {
    const dirName = skillDirectoryName(entry.directory);
    if (entry.loaded && !entry.reasonCode) {
      this.showStatus(localizeBridge("opencodeBridge.skillRowEntryExists", "Skill '{0}' already has an entry script; nothing was changed.", dirName));
      return;
    }
    let result = void 0;
    await this.run(async () => {
      const outcome = await this.commandService.executeCommand("opencode.skills.action", entry.id, "generate-runner");
      result = outcome?.result;
    });
    if (this.disposed || !result) {
      return;
    }
    const after2 = this.catalog?.entries.find((item) => item.directory === entry.directory);
    if (after2 && !after2.reasonCode) {
      this.showStatus(localizeBridge("opencodeBridge.skillFixEntryDone", "Entry script ready: '{0}' is now loaded.", dirName));
      return;
    }
    this.showStatus(localizeBridge("opencodeBridge.skillFixEntryStillFailing", "Still not loaded after generating the entry; press Diagnose Skills to see why."), true);
    if (after2?.reasonCode) {
      await this.showDiagnosis(after2, { dirName, loaded: false, reasonCode: after2.reasonCode, reason: after2.reason, fix: after2.fix });
    }
  }
  /** Batch repair: confirm first, report every skill separately, and keep going when one fails. */
  async generateAllRunners(targets) {
    if (!targets.length) {
      return;
    }
    const names = targets.slice(0, 8).map((entry) => `\u2022 ${entry.title}`);
    if (targets.length > 8) {
      names.push(`\u2022 ${localizeBridge("opencodeBridge.skillsDiagnoseMore", "{0} more\u2026", targets.length - 8)}`);
    }
    const confirmation = await this.dialogService.confirm({
      type: "warning",
      message: `\u4E3A ${targets.length} \u4E2A\u7F3A\u5C11\u5165\u53E3\u7684\u6280\u80FD\u751F\u6210 scripts/run.mjs\uFF1F`,
      detail: `${names.join("\n")}

${localizeBridge("opencodeBridge.skillFixEntryDetail", "No entry script (scripts/run.* or run.*) was found in the skill folder. Generate scripts/run.mjs in one click: calling the tool will then return the SKILL.md instructions, and the list refreshes automatically afterwards.")}`,
      primaryButton: localizeBridge("opencodeBridge.skillFixAllEntriesAction", "Generate all entries and refresh")
    });
    if (!confirmation.confirmed) {
      return;
    }
    const results = [];
    let generated = 0;
    let failed = 0;
    await this.run(async () => {
      for (const entry of targets) {
        if (this.disposed) {
          return;
        }
        try {
          const outcome = await this.commandService.executeCommand("opencode.skills.action", entry.id, "generate-runner");
          if (outcome?.result?.generated === false) {
            results.push(`${entry.title}\uFF1A\u5DF2\u6709\u5165\u53E3\uFF0C\u672A\u6539\u52A8`);
          } else {
            generated++;
            results.push(`${entry.title}\uFF1A\u5DF2\u751F\u6210`);
          }
        } catch (error) {
          failed++;
          results.push(`${entry.title}\uFF1A\u5931\u8D25\uFF08${error instanceof Error ? error.message : String(error)}\uFF09`);
        }
      }
    });
    if (this.disposed || !results.length) {
      return;
    }
    const loaded = targets.filter((target) => {
      const after2 = this.catalog?.entries.find((item) => item.directory === target.directory);
      return after2 !== void 0 && !after2.reasonCode;
    }).length;
    this.showStatus(`\u5165\u53E3\u751F\u6210\u5B8C\u6210\uFF1A\u65B0\u751F\u6210 ${generated} \u4E2A\uFF0C\u73B0\u5DF2\u52A0\u8F7D ${loaded} \u4E2A${failed ? `\uFF0C\u5931\u8D25 ${failed} \u4E2A` : ""}\u3002${results.join("\uFF1B")}`, failed > 0);
  }
  async deleteJsonTool(tool) {
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localizeBridge("opencodeBridge.deleteCustomToolConfirm", "Delete custom tool '{0}'?", tool.name),
      detail: `${localizeBridge("opencodeBridge.deleteCustomToolDetail", "Its manifest file will be removed. This cannot be undone.")}
${tool.sourcePath}`,
      primaryButton: localizeBridge("opencodeBridge.deleteTool", "Delete")
    });
    if (!result.confirmed) {
      return;
    }
    await this.run(() => this.commandService.executeCommand("opencode.bridge.customTools.delete", tool.name));
  }
  showMcpStatus(text2, error = false) {
    this.mcpStatus.textContent = text2;
    this.mcpStatus.classList.toggle("error", error);
  }
  mcpRowBusy(id2) {
    return this.mcpBusy.has("global") || [...this.mcpBusy].some((key3) => key3.endsWith(`-${id2}`));
  }
  async mcpAction(key3, action) {
    if (this.disposed || this.mcpBusy.has(key3) || this.mcpBusy.has("global")) return;
    const epoch = this.workspaceEpoch;
    const current = () => !this.disposed && epoch === this.workspaceEpoch;
    this.mcpBusy.add(key3);
    this.renderMcpEntries();
    this.showMcpStatus("\u6B63\u5728\u66F4\u65B0\u2026");
    try {
      const result = await action();
      if (!current()) return;
      if (result === false || typeof result === "object" && result?.cancelled) {
        this.showMcpStatus("\u5DF2\u53D6\u6D88\uFF0C\u672A\u66F4\u6539 MCP \u914D\u7F6E\u3002");
        return;
      }
      const refreshed = await this.refreshMcp(true);
      if (current() && refreshed) this.showMcpStatus("\u5DF2\u66F4\u65B0 MCP \u914D\u7F6E\u3002");
    } catch (error) {
      if (current()) this.showMcpStatus(error instanceof Error ? error.message : String(error), true);
    } finally {
      this.mcpBusy.delete(key3);
      if (!this.disposed) this.renderMcpEntries();
    }
  }
  nativeConnection(entry) {
    const label3 = `OpenCode \xB7 ${entry.label} [${entry.id}]`;
    const server = this.nativeMcpService.servers.get().find((item) => item.definition.label === label3);
    if (!server) return "undiscovered";
    switch (server.connectionState.get().state) {
      case McpConnectionState.Kind.Running:
        return "running";
      case McpConnectionState.Kind.Starting:
        return "starting";
      case McpConnectionState.Kind.Error:
        return "error";
      default:
        return "stopped";
    }
  }
  mcpRowSummary(entry) {
    return `\u7F16\u8F91\u5668\uFF1A${editorCell(entry.editorState, this.nativeConnection(entry), entry.bridge).text} \xB7 Bridge\uFF1A${bridgeCell(entry.bridge).text}`;
  }
  renderMcpEntries() {
    this.mcpRowDisposables.clear();
    this.closeMenus();
    clearNode(this.mcpList);
    const entries2 = this.mcpCatalog?.entries ?? [];
    this.mcpChip.textContent = `\u7F16\u8F91\u5668 ${entries2.filter((entry) => entry.editorEnabled).length} \xB7 Bridge ${entries2.filter((entry) => entry.bridgeEnabled).length}`;
    if (!entries2.length) append(this.mcpList, $("p.skill-page-empty", void 0, "\u6682\u65E0\u5171\u4EAB MCP\u3002\u76F4\u63A5\u7C98\u8D34 URL\u3001\u547D\u4EE4\u6216 JSON \u5373\u53EF\u5BFC\u5165\u3002"));
    for (const entry of entries2) {
      const editor = editorCell(entry.editorState, this.nativeConnection(entry), entry.bridge), bridge = bridgeCell(entry.bridge);
      const card = append(this.mcpList, $("article.skill-page-card.skill-page-mcp-entry"));
      card.dataset.serverId = entry.id;
      card.dataset.editorStatus = editor.status;
      card.dataset.bridgeStatus = bridge.status;
      const top2 = append(card, $(".skill-page-row-top"));
      const dot = append(top2, $("span.skill-page-dot"));
      if (this.mcpRowHasProblem(editor, bridge)) {
        dot.classList.add("warn");
      } else if (editor.status === "running" || bridge.status === "running") {
        dot.classList.add("ok");
      }
      append(top2, $("h3", void 0, entry.label));
      append(top2, $("span.skill-page-source", void 0, entry.transport === "http" ? entry.httpTransport === "sse" ? "SSE" : entry.httpTransport === "auto" ? "HTTP / SSE" : "Streamable HTTP" : "stdio"));
      append(top2, $(".skill-page-row-grow"));
      const busy = this.mcpRowBusy(entry.id);
      const button = (label3, key3, op) => {
        const control = append(top2, $("button.skill-page-button", void 0, label3));
        control.type = "button";
        control.disabled = busy;
        this.mcpRowDisposables.add(addDisposableListener(control, "click", () => {
          void this.mcpAction(`${key3}-${entry.id}`, op);
        }));
      };
      const menu = this.moreMenu(top2, this.mcpRowDisposables);
      const menuAction = (label3, key3, operation, danger = false) => this.menuButton(menu, label3, () => this.mcpAction(`${key3}-${entry.id}`, operation), this.mcpRowDisposables, danger, () => this.mcpRowBusy(entry.id));
      const secrets = () => manageMcpSecrets(entry, this.commandService, this.quickInputService, this.dialogService);
      if (entry.authType === "oauth") {
        append(top2, $("span.skill-page-source", void 0, entry.oauthState === "authorized" ? "OAuth \xB7 \u5DF2\u6388\u6743" : entry.oauthState === "authorizing" ? "OAuth \xB7 \u7B49\u5F85\u6D4F\u89C8\u5668" : "OAuth \xB7 \u5F85\u6388\u6743"));
        if (entry.enabled && this.mcpCatalog?.trusted && entry.oauthState !== "authorizing") button(entry.oauthState === "authorized" ? "\u91CD\u65B0\u6388\u6743" : "OAuth \u6388\u6743", "oauth", () => this.commandService.executeCommand("opencode.mcp.oauth.authorize", entry.id));
        menuAction("\u9000\u51FA\u672C\u673A OAuth \u6388\u6743", "oauth-logout", () => this.commandService.executeCommand("opencode.mcp.oauth.logout", entry.id), true);
      }
      if (entry.transport === "http") menuAction("OAuth \u8BBE\u7F6E\u2026", "oauth-settings", () => this.commandService.executeCommand("opencode.mcp.oauth.configure", entry.id));
      if (entry.authType !== "oauth" && (bridge.action === "secrets" || editor.action === "secrets")) button(MCP_ACTION_LABELS.secrets, "secrets", secrets);
      if (entry.transport === "http") button(MCP_ACTION_LABELS.diagnose, "diagnose", () => this.commandService.executeCommand("opencode.mcp.diagnose", entry.id));
      button("\u5BC6\u94A5\u2026", "secrets", secrets);
      menuAction(entry.enabled ? "\u505C\u7528\u4E24\u7AEF" : "\u542F\u7528\u4E24\u7AEF", "enabled", () => this.commandService.executeCommand("opencode.mcp.setEnabled", entry.id, !entry.enabled, "both"));
      menuAction(entry.editorEnabled ? "\u5173\u95ED\u7F16\u8F91\u5668" : "\u5F00\u653E\u7F16\u8F91\u5668", "editor", () => this.commandService.executeCommand("opencode.mcp.setEnabled", entry.id, !entry.editorEnabled, "editor"));
      menuAction(entry.bridgeEnabled ? "\u5173\u95ED Bridge" : "\u5F00\u653E Bridge", "bridge", () => this.commandService.executeCommand("opencode.mcp.setEnabled", entry.id, !entry.bridgeEnabled, "bridge"));
      menuAction("\u91CD\u8BD5", "retry", () => this.commandService.executeCommand("opencode.mcp.retry", entry.id));
      menuAction("\u5220\u9664", "remove", () => this.commandService.executeCommand("opencode.mcp.remove", entry.id), true);
      append(card, $("p.skill-page-mcp-status-line", void 0, `\u7F16\u8F91\u5668\uFF1A${editor.text} \xB7 Bridge\uFF1A${bridge.text}`));
      append(card, $("p.skill-page-muted.skill-page-row-desc", void 0, entry.detail));
      if (entry.proxyNotice) append(card, $("p.skill-page-muted.skill-page-mcp-proxy-notice", void 0, entry.proxyNotice));
    }
  }
  focusMcp() {
    this.activateTab("mcp");
    this.mcpAdd.open = true;
    this.mcpImport.focusInput();
    void this.refresh(true);
  }
  focus() {
    if (this.paneMcp.hidden) {
      this.search.focus();
    } else {
      this.mcpImport.focusInput();
    }
    void this.refresh(true);
  }
  dispose() {
    this.disposed = true;
    this.skillRefresh.dispose();
    this.mcpRefresh.dispose();
    super.dispose();
  }
};
OpenCodeSkillWidget = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IMcpService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IWorkspaceContextService)
], OpenCodeSkillWidget);
aiCustomizationManagementSectionRegistry.register({
  id: AICustomizationManagementSection.SkillCenter,
  label: "Skill \u4E0E MCP",
  icon: Codicon.tools,
  description: "Skill \u5BFC\u5165\u4E0E stdio / HTTP MCP \u5171\u4EAB\u670D\u52A1\u7BA1\u7406",
  supportsHarness: () => true,
  create: (instantiationService, container3) => instantiationService.createInstance(OpenCodeSkillWidget, container3)
});
export { skillDiagnosisGuidance, skillDirectoryName, skillEntryGuidance, OpenCodeSkillWidget };
