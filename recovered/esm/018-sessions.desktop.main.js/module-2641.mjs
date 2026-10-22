// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/automationsListWidget.ts
import { $, addDisposableListener, addStandardDisposableListener, append, clearNode, isAncestor } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { openSessionByResource } from "./module-2640.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Emitter } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { status } from "./module-0076.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING } from "./module-2638.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { IAutomationRunner } from "./module-2636.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IAutomationDialogService } from "./module-2637.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { DAYS_OF_WEEK } from "./module-2639.mjs";
import { fromNow, getDurationString } from "./module-0120.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/automationsListWidget.ts
var $88 = $;

var AUTOMATION_ROW_HEIGHT = 72;

var HISTORY_ROW_HEIGHT = 28;

var HISTORY_HEADER_HEIGHT = 32;

var HISTORY_EMPTY_HEIGHT = 28;

var HISTORY_MORE_HEIGHT = 22;

var MAX_VISIBLE_RUNS = 20;

var AutomationItemDelegate = class {
  // Initial estimate only. Actual row height is measured from the DOM because
  // the list is created with `supportDynamicHeights` (meta wraps, prompt wraps,
  // and run-error text is variable-height). See `hasDynamicHeight` below.
  getHeight(element) {
    if (!element.expanded) {
      return AUTOMATION_ROW_HEIGHT;
    }
    const runs = element.runs;
    const visibleRuns = Math.min(runs.length, MAX_VISIBLE_RUNS);
    if (visibleRuns === 0) {
      return AUTOMATION_ROW_HEIGHT + HISTORY_EMPTY_HEIGHT;
    }
    let historyHeight = HISTORY_HEADER_HEIGHT + visibleRuns * HISTORY_ROW_HEIGHT;
    if (runs.length > MAX_VISIBLE_RUNS) {
      historyHeight += HISTORY_MORE_HEIGHT;
    }
    return AUTOMATION_ROW_HEIGHT + historyHeight;
  }
  hasDynamicHeight(_element) {
    return true;
  }
  getTemplateId(_element) {
    return "automationItem";
  }
};

var AutomationItemRenderer = class {
  constructor(widget, hoverService, notificationService, editorService, editorGroupsService, logService, instantiationService) {
    this.widget = widget;
    this.hoverService = hoverService;
    this.notificationService = notificationService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this.logService = logService;
    this.instantiationService = instantiationService;
    this.templateId = "automationItem";
  }
  renderTemplate(container2) {
    const disposables = new DisposableStore();
    container2.classList.add("automations-row-wrapper");
    const row = append(container2, $88(".automations-row"));
    const main2 = append(row, $88(".automations-row-main"));
    const nameEl = append(main2, $88(".automations-row-name"));
    const nameTextEl = append(nameEl, $88("span.automations-row-name-text"));
    const disabledBadge = append(nameEl, $88("span.automations-row-disabled-badge"));
    const metaEl = append(main2, $88(".automations-row-meta"));
    const scheduleEl = append(metaEl, $88("span.automations-row-schedule"));
    const sep1 = append(metaEl, $88("span.automations-row-meta-sep"));
    const nextEl = append(metaEl, $88("span.automations-row-next"));
    const sepFolder = append(metaEl, $88("span.automations-row-meta-sep"));
    const folderEl = append(metaEl, $88("span.automations-row-folder"));
    const sep2 = append(metaEl, $88("span.automations-row-meta-sep"));
    const lastEl = append(metaEl, $88("span.automations-row-last"));
    const promptEl = append(main2, $88(".automations-row-prompt"));
    const actions = append(row, $88(".automations-row-actions"));
    const historyPanel = append(container2, $88(".automations-row-history"));
    return { container: container2, row, nameEl, nameTextEl, disabledBadge, scheduleEl, sep1, nextEl, sepFolder, folderEl, sep2, lastEl, promptEl, actions, historyPanel, disposables };
  }
  renderElement(element, _index, templateData) {
    templateData.disposables.clear();
    const { automation, runs, expanded: expanded2, inFlight } = element;
    templateData.nameTextEl.textContent = automation.name;
    templateData.row.classList.toggle("automations-row-disabled", !automation.enabled);
    templateData.disabledBadge.textContent = !automation.enabled ? localize(9579, null) : "";
    templateData.disabledBadge.style.display = !automation.enabled ? "" : "none";
    templateData.scheduleEl.textContent = formatSchedule(automation);
    templateData.sep1.textContent = "\xB7";
    templateData.nextEl.textContent = formatNextRun(automation);
    templateData.sepFolder.textContent = "\xB7";
    templateData.folderEl.textContent = this.widget.formatTargetLabel(automation);
    if (automation.target.kind === "quickChat") {
      templateData.folderEl.title = localize(9584, null);
    } else {
      templateData.folderEl.title = automation.target.folderUri.toString();
    }
    if (automation.lastRunAt) {
      templateData.sep2.textContent = "\xB7";
      templateData.sep2.style.display = "";
      templateData.lastEl.textContent = localize(9606, null, formatRelativeTimeOrIso(automation.lastRunAt));
      templateData.lastEl.style.display = "";
    } else {
      templateData.sep2.style.display = "none";
      templateData.lastEl.style.display = "none";
    }
    templateData.promptEl.textContent = truncate4(automation.prompt, 160);
    templateData.promptEl.title = automation.prompt;
    templateData.disposables.add(addDisposableListener(templateData.row, "click", (e4) => {
      if (isAncestor(e4.target, templateData.actions)) {
        return;
      }
      this.widget.toggleExpanded(automation.id);
    }));
    clearNode(templateData.actions);
    templateData.disposables.add(addDisposableListener(templateData.actions, "click", (e4) => {
      e4.stopPropagation();
    }));
    this.renderActions(templateData, automation, expanded2, inFlight);
    clearNode(templateData.historyPanel);
    templateData.historyPanel.id = `automation-history-${automation.id}`;
    if (expanded2) {
      this.renderHistoryPanel(templateData, automation, runs);
    }
    templateData.historyPanel.style.display = expanded2 ? "" : "none";
    templateData.container.classList.toggle("automations-row-wrapper-expanded", expanded2);
  }
  renderActions(templateData, automation, expanded2, inFlight) {
    const { actions, disposables } = templateData;
    const runBtn = this.createIconButton(actions, Codicon.play, localize(9615, null), inFlight, disposables);
    disposables.add(addStandardDisposableListener(runBtn, "click", () => {
      void this.widget.runNow(automation);
    }));
    const toggleIcon = automation.enabled ? Codicon.eye : Codicon.eyeClosed;
    const toggleTooltip = automation.enabled ? localize(9600, null) : localize(9602, null);
    const toggleBtn = this.createIconButton(actions, toggleIcon, toggleTooltip, false, disposables);
    disposables.add(addStandardDisposableListener(toggleBtn, "click", () => {
      void this.widget.toggleEnabled(automation);
    }));
    const editBtn = this.createIconButton(actions, Codicon.edit, localize(9601, null), false, disposables);
    disposables.add(addStandardDisposableListener(editBtn, "click", () => {
      void this.widget.openEditDialog(automation);
    }));
    const deleteBtn = this.createIconButton(actions, Codicon.trash, localize(9599, null), false, disposables);
    disposables.add(addStandardDisposableListener(deleteBtn, "click", () => {
      void this.widget.deleteAutomation(automation);
    }));
    const histIcon = expanded2 ? Codicon.chevronDown : Codicon.chevronRight;
    const histTooltip = expanded2 ? localize(9603, null) : localize(9628, null);
    const histBtn = this.createIconButton(actions, histIcon, histTooltip, false, disposables);
    histBtn.setAttribute("aria-expanded", expanded2 ? "true" : "false");
    histBtn.setAttribute("aria-controls", `automation-history-${automation.id}`);
    disposables.add(addStandardDisposableListener(histBtn, "click", () => {
      this.widget.toggleExpanded(automation.id);
    }));
  }
  renderHistoryPanel(templateData, automation, runs) {
    const panel = templateData.historyPanel;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", localize(9604, null, automation.name));
    if (runs.length === 0) {
      const empty = append(panel, $88(".automations-history-empty"));
      empty.textContent = localize(9611, null);
      return;
    }
    const heading2 = append(panel, $88("h4.automations-history-heading"));
    heading2.textContent = localize(9614, null);
    const runsList = append(panel, $88("ul.automations-history-list"));
    const visibleRuns = runs.slice(0, MAX_VISIBLE_RUNS);
    for (const run of visibleRuns) {
      this.renderRunRow(runsList, run, templateData.disposables);
    }
    if (runs.length > MAX_VISIBLE_RUNS) {
      const more = append(panel, $88(".automations-history-more"));
      more.textContent = localize(9605, null, runs.length - visibleRuns.length);
    }
  }
  renderRunRow(container2, run, disposables) {
    const li = append(container2, $88("li.automations-history-row", {
      "data-run-id": run.id,
      "data-run-status": run.status
    }));
    const statusIcon = append(li, $88("span.automations-history-status.codicon"));
    const { iconId, spin } = runStatusIcon(run.status);
    statusIcon.classList.add(`codicon-${iconId}`);
    if (spin) {
      statusIcon.classList.add("codicon-modifier-spin");
    }
    statusIcon.setAttribute("aria-hidden", "true");
    const text2 = append(li, $88(".automations-history-row-text"));
    const first2 = append(text2, $88(".automations-history-row-first"));
    const statusLabel = append(first2, $88("span.automations-history-row-status"));
    statusLabel.textContent = runStatusLabel(run.status);
    const sep2 = append(first2, $88("span.automations-history-row-sep"));
    sep2.textContent = "\xB7";
    const trig = append(first2, $88("span.automations-history-row-trigger"));
    trig.textContent = runTriggerLabel(run.trigger);
    const sep22 = append(first2, $88("span.automations-history-row-sep"));
    sep22.textContent = "\xB7";
    const started = append(first2, $88("span.automations-history-row-started"));
    started.textContent = localize(9616, null, formatRelativeTimeOrIso(run.startedAt));
    const dur = formatRunDuration(run);
    if (dur) {
      const sep3 = append(first2, $88("span.automations-history-row-sep"));
      sep3.textContent = "\xB7";
      const durEl = append(first2, $88("span.automations-history-row-duration"));
      durEl.textContent = dur;
    }
    if (run.errorMessage) {
      const err = append(text2, $88(".automations-history-row-error"));
      err.textContent = run.errorMessage;
      err.setAttribute("role", "status");
      err.setAttribute("aria-live", "polite");
    }
    if (run.sessionResource) {
      const openButton = append(li, $88("span.automations-history-row-open.codicon.codicon-link-external"));
      openButton.setAttribute("role", "button");
      openButton.setAttribute("tabindex", "0");
      openButton.setAttribute("aria-label", localize(9612, null));
      disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), openButton, localize(9612, null)));
      const openSession2 = (e4) => {
        e4.stopPropagation();
        const sessionResource = run.sessionResource;
        this.logService.debug(`[AutomationsListWidget] Opening session: ${sessionResource.toString()}`);
        const activeEditor = this.editorService.activeEditor;
        const activeGroupId = this.editorGroupsService.activeGroup.id;
        this.instantiationService.invokeFunction(openSessionByResource, sessionResource).then(() => {
          if (activeEditor) {
            this.editorService.closeEditor({ editor: activeEditor, groupId: activeGroupId });
          }
        }).catch((err) => {
          this.logService.error(`[AutomationsListWidget] openSession failed for ${sessionResource.toString()}`, err);
          this.notificationService.error(localize(9613, null));
        });
      };
      disposables.add(addDisposableListener(openButton, "click", openSession2));
      disposables.add(addDisposableListener(openButton, "keydown", (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          openSession2(e4);
        }
      }));
    }
  }
  createIconButton(container2, icon2, tooltip, disabled, disposables) {
    const button = append(container2, $88("button.automations-row-action-button", {
      type: "button",
      "aria-label": tooltip,
      tabindex: "0"
    }));
    button.classList.add(...ThemeIcon.asClassNameArray(icon2));
    button.disabled = disabled;
    disposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), button, tooltip));
    return button;
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};

var AutomationsListWidget = class extends Disposable {
  constructor(automationService, automationRunner, dialogService, automationDialogService, hoverService, workspaceContextService, logService, configurationService, instantiationService, notificationService, editorService, editorGroupsService) {
    super();
    this.automationService = automationService;
    this.automationRunner = automationRunner;
    this.dialogService = dialogService;
    this.automationDialogService = automationDialogService;
    this.hoverService = hoverService;
    this.workspaceContextService = workspaceContextService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.editorService = editorService;
    this.editorGroupsService = editorGroupsService;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this.newButtonHover = this._register(new MutableDisposable());
    this.newEmptyStateButtonHover = this._register(new MutableDisposable());
    this._emptyStateStore = this._register(new DisposableStore());
    this.runInFlight = /* @__PURE__ */ new Set();
    this.expandedRows = /* @__PURE__ */ new Set();
    this.displayEntries = [];
    this.lastHeight = 0;
    this.lastWidth = 0;
    this.visible = false;
    this.listDirty = false;
    this.remeasureOnNextLayout = false;
    this.element = $88(".automations-list-widget");
    this.headerEl = append(this.element, $88(".automations-header"));
    this.emptyContainer = append(this.element, $88(".automations-empty-state"));
    this.emptyContainer.style.display = "none";
    this.listContainer = append(this.element, $88(".automations-list"));
    this.renderHeader();
    this.createList();
    this._register(autorun((reader) => {
      const items = this.automationService.automations.read(reader);
      this.automationService.runs.read(reader);
      this.updateList(items);
      this._onDidChangeItemCount.fire(items.length);
    }));
  }
  renderHeader() {
    const titleRow = append(this.headerEl, $88(".automations-header-row"));
    const titleEl = append(titleRow, $88("h2.automations-header-title"));
    titleEl.textContent = localize(9591, null);
    const subtitleEl = append(this.headerEl, $88("p.automations-header-subtitle"));
    subtitleEl.textContent = localize(9590, null);
    const newButton = this._register(new Button(titleRow, { ...defaultButtonStyles, title: localize(9607, null) }));
    newButton.label = localize(9607, null);
    newButton.element.classList.add("automations-new-button");
    this._register(newButton.onDidClick(() => this.openCreateDialog()));
    this.newButtonHover.value = this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), newButton.element, localize(9608, null));
  }
  createList() {
    const delegate = new AutomationItemDelegate();
    const renderer = new AutomationItemRenderer(this, this.hoverService, this.notificationService, this.editorService, this.editorGroupsService, this.logService, this.instantiationService);
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "AutomationsManagementList",
      this.listContainer,
      delegate,
      [renderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        supportDynamicHeights: true,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel: (element) => {
            return this.formatAriaLabel(element.automation);
          },
          getWidgetAriaLabel() {
            return localize(9592, null);
          }
        },
        identityProvider: {
          getId(element) {
            return element.automation.id;
          }
        }
      }
    ));
    this._register(this.list.onDidChangeSelection(() => {
      if (this.list.getSelection().length > 0) {
        this.list.setSelection([]);
      }
    }));
  }
  updateList(items) {
    if (items.length === 0) {
      this.element.classList.add("automations-empty");
      this.displayEntries = [];
      this.listDirty = true;
      this.commitList();
      this.emptyContainer.style.display = "";
      this.listContainer.style.display = "none";
      this.renderEmptyState();
      return;
    }
    this.element.classList.remove("automations-empty");
    this.emptyContainer.style.display = "none";
    this.listContainer.style.display = "";
    this.newEmptyStateButtonHover.clear();
    this.displayEntries = items.map((automation) => ({
      type: "automation-item",
      automation,
      runs: this.automationService.runsFor(automation.id).get(),
      expanded: this.expandedRows.has(automation.id),
      inFlight: this.runInFlight.has(automation.id)
    }));
    this.listDirty = true;
    this.commitList();
    if (this.visible && this.lastHeight > 0 && this.lastWidth > 0) {
      this.layout(this.lastHeight, this.lastWidth);
    }
  }
  commitList() {
    if (!this.visible || !this.listDirty) {
      return;
    }
    this.list.splice(0, this.list.length, this.displayEntries);
    this.listDirty = false;
  }
  renderEmptyState() {
    this._emptyStateStore.clear();
    clearNode(this.emptyContainer);
    this.emptyContainer.setAttribute("role", "status");
    const title = append(this.emptyContainer, $88("h3.automations-empty-title"));
    title.textContent = localize(9589, null);
    const message = append(this.emptyContainer, $88("p.automations-empty-message"));
    message.textContent = localize(9588, null);
    const ctaButton = this._emptyStateStore.add(new Button(this.emptyContainer, { ...defaultButtonStyles }));
    ctaButton.label = localize(9587, null);
    ctaButton.element.classList.add("automations-empty-cta");
    this._emptyStateStore.add(ctaButton.onDidClick(() => this.openCreateDialog()));
    this.newEmptyStateButtonHover.value = this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), ctaButton.element, localize(9608, null));
  }
  toggleExpanded(automationId2) {
    if (this.expandedRows.has(automationId2)) {
      this.expandedRows.delete(automationId2);
    } else {
      this.expandedRows.add(automationId2);
    }
    this.updateList(this.automationService.automations.get());
  }
  async runNow(automation) {
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    if (this.runInFlight.has(automation.id)) {
      return;
    }
    this.runInFlight.add(automation.id);
    this.updateList(this.automationService.automations.get());
    try {
      const operation = this.automationRunner.runOnce(automation, "manual", 0, CancellationToken.None);
      const dispatch = await operation.whenDispatched;
      if (dispatch.kind === "started") {
        status(localize(9593, null, automation.name));
      }
      await operation.whenCompleted;
    } catch (err) {
      this.logService.error("[Automations] runNow failed unexpectedly", err);
    } finally {
      this.runInFlight.delete(automation.id);
      this.updateList(this.automationService.automations.get());
    }
  }
  async toggleEnabled(automation) {
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    try {
      await this.automationService.updateAutomation(automation.id, { enabled: !automation.enabled });
      status(automation.enabled ? localize(9580, null, automation.name) : localize(9581, null, automation.name));
    } catch (err) {
      this.logService.error("[Automations] Failed to toggle automation", err);
    }
  }
  async deleteAutomation(automation) {
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    const result = await this.dialogService.confirm({
      type: "warning",
      message: localize(9596, null, automation.name),
      detail: localize(9597, null),
      primaryButton: localize(9598, null)
    });
    if (!result.confirmed) {
      return;
    }
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    try {
      await this.automationService.deleteAutomation(automation.id);
      status(localize(9578, null, automation.name));
    } catch (err) {
      this.logService.error("[Automations] Failed to delete automation", err);
    }
  }
  async openEditDialog(automation) {
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    const result = await this.automationDialogService.showAutomationDialog({
      existing: automation
    });
    if (!result || result.kind !== "update") {
      return;
    }
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    try {
      const updateResult = await this.automationService.updateAutomationIfUnchanged(result.id, result.value, automation);
      if (updateResult.kind === "conflict") {
        throw new Error(updateResult.current ? localize(9574, null) : localize(9577, null));
      }
      status(localize(9594, null, automation.name));
    } catch (err) {
      this.logService.error("[Automations] Failed to update automation", err);
      await this.dialogService.error(
        localize(9595, null),
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  formatFolderLabel(folderUri) {
    const folders = this.workspaceContextService.getWorkspace().folders;
    const match2 = folders.find((f) => isEqual2(f.uri, folderUri));
    if (match2) {
      return match2.name || match2.uri.toString();
    }
    const segments = folderUri.path.split("/").filter((s) => s.length > 0);
    return segments[segments.length - 1] ?? folderUri.toString();
  }
  formatTargetLabel(automation) {
    if (automation.target.kind === "quickChat") {
      return localize(9583, null);
    }
    return localize(9582, null, this.formatFolderLabel(automation.target.folderUri));
  }
  formatAriaLabel(automation) {
    const schedule = formatSchedule(automation);
    const target = this.formatTargetLabel(automation);
    return automation.enabled ? localize(9572, null, automation.name, schedule, target) : localize(9573, null, automation.name, schedule, target);
  }
  _isEnabled() {
    return this.configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
  }
  async _notifyDisabled() {
    await this.dialogService.info(
      localize(9586, null),
      localize(9585, null, CHAT_AUTOMATIONS_ENABLED_SETTING)
    );
  }
  async openCreateDialog() {
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    const result = await this.automationDialogService.showAutomationDialog({});
    if (!result || result.kind !== "create") {
      return;
    }
    if (!this._isEnabled()) {
      await this._notifyDisabled();
      return;
    }
    try {
      const created = await this.automationService.createAutomation(result.value);
      status(localize(9575, null, created.name));
    } catch (err) {
      this.logService.error("[Automations] Failed to create automation", err);
      await this.dialogService.error(
        localize(9576, null),
        err instanceof Error ? err.message : String(err)
      );
    }
  }
  layout(height, width2) {
    this.lastHeight = height;
    this.lastWidth = width2;
    this.element.style.height = `${height}px`;
    if (!this.visible || this.displayEntries.length === 0 || height <= 0 || width2 <= 0) {
      return;
    }
    const headerHeight = this.headerEl.offsetHeight;
    if (headerHeight === 0) {
      return;
    }
    const listHeight = Math.max(0, height - headerHeight);
    this.listContainer.style.height = `${listHeight}px`;
    this.list.layout(listHeight, width2);
    if (this.remeasureOnNextLayout) {
      this.remeasureOnNextLayout = false;
      this.list.rerender();
    }
  }
  setVisible(visible) {
    if (this.visible === visible) {
      return;
    }
    this.visible = visible;
    if (!visible) {
      return;
    }
    this.commitList();
    this.remeasureOnNextLayout = this.list.length > 0;
  }
  fireItemCount() {
    this._onDidChangeItemCount.fire(this.automationService.automations.get().length);
  }
  /** Test-only: number of rows currently in the virtualized list. */
  get itemCount() {
    return this.list.length;
  }
  /**
   * Test-only: snapshot of the view-model rows the list is displaying.
   * The virtualized {@link WorkbenchList} does not lay out rows in a unit-test
   * DOM, so tests assert the derived render state (expansion, runs, in-flight)
   * here instead of querying row elements.
   */
  getDisplayEntriesForTest() {
    return this.displayEntries;
  }
  /**
   * Expands, reveals, and moves keyboard focus to an automation.
   */
  focusAutomation(automationId2) {
    const index2 = this.displayEntries.findIndex((entry) => entry.automation.id === automationId2);
    if (index2 < 0) {
      return false;
    }
    this.expandedRows.add(automationId2);
    this.updateList(this.automationService.automations.get());
    this.list.reveal(index2);
    this.list.setFocus([index2]);
    this.list.domFocus();
    return true;
  }
  focus() {
    if (this.list.length > 0) {
      this.list.domFocus();
    }
  }
};

AutomationsListWidget = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, IAutomationRunner),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IAutomationDialogService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IEditorService),
  __decorateParam(11, IEditorGroupsService)
], AutomationsListWidget);

function formatSchedule(a) {
  switch (a.schedule.interval) {
    case "manual":
      return localize(9626, null);
    case "hourly":
      return localize(9625, null);
    case "daily":
      return localize(9624, null, formatHourMinute(a.schedule.scheduleHour, a.schedule.scheduleMinute));
    case "weekly": {
      const day2 = dayName(a.schedule.scheduleDay);
      return localize(9627, null, day2, formatHourMinute(a.schedule.scheduleHour, a.schedule.scheduleMinute));
    }
  }
}

function formatHourMinute(hour2, minute2) {
  const date = /* @__PURE__ */ new Date();
  date.setHours(Math.max(0, Math.min(23, hour2 | 0)), Math.max(0, Math.min(59, minute2 | 0)), 0, 0);
  return date.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit" });
}

function dayName(day2) {
  const idx = (day2 % 7 + 7) % 7;
  return DAYS_OF_WEEK[idx];
}

function formatNextRun(a) {
  if (!a.enabled || a.schedule.interval === "manual" || !a.nextRunAt) {
    return localize(9610, null);
  }
  return localize(9609, null, formatRelativeTimeOrIso(a.nextRunAt));
}

function formatRelativeTimeOrIso(iso) {
  const t2 = Date.parse(iso);
  if (Number.isNaN(t2)) {
    return iso;
  }
  const date = new Date(t2);
  const rel = fromNow(date, true);
  const absolute = date.toLocaleString();
  return `${rel} (${absolute})`;
}

function truncate4(s, max) {
  const single = s.replace(/\s+/g, " ").trim();
  if (single.length <= max) {
    return single;
  }
  return single.slice(0, Math.max(0, max - 1)) + "\u2026";
}

function runStatusIcon(status2) {
  switch (status2) {
    case "pending":
      return { iconId: "circle-outline", spin: false };
    case "running":
      return { iconId: "sync", spin: true };
    case "completed":
      return { iconId: "check", spin: false };
    case "failed":
      return { iconId: "error", spin: false };
  }
}

function runStatusLabel(status2) {
  switch (status2) {
    case "pending":
      return localize(9619, null);
    case "running":
      return localize(9620, null);
    case "completed":
      return localize(9617, null);
    case "failed":
      return localize(9618, null);
  }
}

function runTriggerLabel(trigger) {
  switch (trigger) {
    case "schedule":
      return localize(9623, null);
    case "manual":
      return localize(9622, null);
    case "catch_up":
      return localize(9621, null);
  }
}

function formatRunDuration(run) {
  if (!run.completedAt) {
    return void 0;
  }
  const startMs = Date.parse(run.startedAt);
  const endMs = Date.parse(run.completedAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return void 0;
  }
  const durationMs = Math.max(0, endMs - startMs);
  return getDurationString(durationMs);
}
export { formatSchedule, formatHourMinute, dayName, formatNextRun, formatRelativeTimeOrIso, truncate4, runStatusIcon, runStatusLabel, runTriggerLabel, formatRunDuration, $88, AUTOMATION_ROW_HEIGHT, HISTORY_ROW_HEIGHT, HISTORY_HEADER_HEIGHT, HISTORY_EMPTY_HEIGHT, HISTORY_MORE_HEIGHT, MAX_VISIBLE_RUNS, AutomationItemDelegate, AutomationItemRenderer, AutomationsListWidget };
