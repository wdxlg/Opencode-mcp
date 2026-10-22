// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/agentGlobalConfigurationSettingsWidget.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { readAgentCustomizationSettings } from "./module-4317.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultSelectBoxStyles } from "./module-0513.mjs";
import { SelectBox } from "./module-0475.mjs";
import { Link } from "./module-0550.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/agentGlobalConfigurationSettingsWidget.ts
var AHPAgentSettingsWidget = class extends Disposable {
  constructor(parent, agentProvider, target, contextViewService, notificationService, editorService, hoverService, openerService) {
    super();
    this.agentProvider = agentProvider;
    this.contextViewService = contextViewService;
    this.notificationService = notificationService;
    this.editorService = editorService;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.renderDisposables = this._register(new DisposableStore());
    this.targetListener = this._register(new MutableDisposable());
    this.container = append(parent, $(".agent-global-configuration-settings"));
    this._register(autorun((reader) => this.connect(target.read(reader))));
  }
  layout() {
    this.container.classList.toggle("narrow", this.container.clientWidth < 560);
  }
  focus() {
    this.focusTarget?.();
  }
  connect(target) {
    if (this.target === target && target) {
      return;
    }
    this.target = target;
    this.targetListener.value = target?.onDidChange(() => this.render());
    this.render();
  }
  render() {
    this.renderDisposables.clear();
    clearNode(this.container);
    this.focusTarget = void 0;
    const state = this.target?.getState();
    const descriptor = readAgentCustomizationSettings(state, this.agentProvider);
    if (!state?.config || !descriptor) {
      append(this.container, $(".agent-global-configuration-settings-status")).textContent = localize(9271, null);
      return;
    }
    const content = append(this.container, $(".agent-global-configuration-settings-content"));
    append(content, $("h1")).textContent = descriptor.title;
    append(content, $("p.agent-global-configuration-settings-intro")).textContent = descriptor.description;
    for (const group2 of new Set(descriptor.settings.map((setting) => setting.group))) {
      const section = append(content, $(".agent-global-configuration-settings-section"));
      append(section, $("h2")).textContent = group2;
      const card = append(section, $(".agent-global-configuration-settings-card"));
      for (const setting of descriptor.settings.filter((setting2) => setting2.group === group2)) {
        const schema10 = state.config.schema.properties[setting.key];
        if (schema10) {
          this.renderSetting(card, descriptor, setting.key, setting.kind, setting.saveLabel, schema10, state.config.values[setting.key]);
        }
      }
    }
    this.renderConfigurationFile(content, descriptor);
  }
  renderSetting(parent, _descriptor, key3, kind, saveLabel, schema10, value2) {
    const row = append(parent, $(".agent-global-configuration-settings-row"));
    const labels = append(row, $(".agent-global-configuration-settings-labels"));
    append(labels, $(".agent-global-configuration-settings-label")).textContent = schema10.title;
    if (schema10.description) {
      append(labels, $(".agent-global-configuration-settings-description")).textContent = schema10.description;
    }
    if (kind === "multiline") {
      row.classList.add("agent-global-configuration-settings-text-row");
      const input = append(row, $("textarea.agent-global-configuration-settings-text"));
      input.ariaLabel = schema10.title;
      input.value = typeof value2 === "string" ? value2 : "";
      this.focusTarget ??= () => input.focus();
      const actions = append(row, $(".agent-global-configuration-settings-actions"));
      const button = this.renderDisposables.add(new Button(actions, { ...defaultButtonStyles, secondary: true }));
      button.label = saveLabel ?? localize(9270, null);
      this.renderDisposables.add(button.onDidClick(() => void this.save(key3, input.value.trim())));
      return;
    }
    const options3 = schema10.enum?.map((option2, index2) => ({ text: schema10.enumLabels?.[index2] ?? String(option2) })) ?? [];
    const selected = Math.max(0, schema10.enum?.findIndex((option2) => option2 === value2) ?? 0);
    const selectContainer = append(row, $(".agent-global-configuration-settings-select"));
    const select = this.renderDisposables.add(new SelectBox(options3, selected, this.contextViewService, { ...defaultSelectBoxStyles }, { ariaLabel: schema10.title }));
    select.render(selectContainer);
    this.focusTarget ??= () => select.focus();
    this.renderDisposables.add(select.onDidSelect((event) => void this.save(key3, schema10.enum?.[event.index])));
  }
  async save(key3, value2) {
    try {
      await this.target?.setValue(key3, value2);
    } catch (error) {
      this.notificationService.error(error);
    }
  }
  renderConfigurationFile(parent, descriptor) {
    const file = descriptor.configurationFile;
    if (!file) {
      return;
    }
    const section = append(parent, $(".agent-global-configuration-settings-section"));
    append(section, $("h2")).textContent = file.title;
    append(section, $("p.agent-global-configuration-settings-section-description")).textContent = file.description;
    if (file.documentationUrl && file.documentationLabel) {
      this.renderDisposables.add(new Link(section, { label: file.documentationLabel, href: file.documentationUrl }, {}, this.hoverService, this.openerService));
    }
    const button = this.renderDisposables.add(new Button(section, { ...defaultButtonStyles, secondary: true }));
    button.label = file.openLabel;
    this.renderDisposables.add(button.onDidClick(() => this.editorService.openEditor({ resource: this.target?.mapResource(URI.parse(file.resource)) ?? URI.parse(file.resource), options: { pinned: true } })));
  }
};

AHPAgentSettingsWidget = __decorateClass([
  __decorateParam(3, IContextViewService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IOpenerService)
], AHPAgentSettingsWidget);
export { AHPAgentSettingsWidget };
