// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMultiModelWidget.ts
import { localizeMultiModel } from "./module-2649.mjs";
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultCheckboxStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";
import { Checkbox } from "./module-0549.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { aiCustomizationManagementSectionRegistry } from "./module-2623.mjs";
import { AICustomizationManagementSection } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeMultiModelWidget.ts
var SETTING_ENABLED = "opencode.multiModel.enabled";

var SETTING_MERGE_MODEL = "opencode.multiModel.mergeModel";

var SETTING_MERGE_READ_TOOLS = "opencode.multiModel.mergeReadTools";

var SETTING_MAX_BRANCHES = "opencode.multiModel.maxBranches";

var SETTING_MERGE_REASONING = "opencode.multiModel.mergeReasoningEffort";

var PICK_MERGE_MODEL_COMMAND = "opencode.pickMergeModel";

var MERGE_REASONING_OPTIONS = ["disabled", "none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];

function mergeReasoningOptionLabel(option2) {
  switch (option2) {
    case "disabled":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionDisabled", "Off");
    case "none":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionNone", "None");
    case "minimal":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionMinimal", "Minimal");
    case "low":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionLow", "Low");
    case "medium":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionMedium", "Medium");
    case "high":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionHigh", "High");
    case "xhigh":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionXHigh", "XHigh");
    case "max":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionMax", "Max");
    case "ultra":
      return localizeMultiModel("opencodeMultiModel.mergeReasoningOptionUltra", "Ultra");
    default:
      return option2;
  }
}

var OpenCodeMultiModelWidget = class extends Disposable {
  constructor(container2, configurationService, commandService) {
    super();
    this.configurationService = configurationService;
    this.commandService = commandService;
    const root = append(container2, $(".opencode-multimodel"));
    const heroCard = append(root, $(".opencode-multimodel-card.opencode-multimodel-hero"));
    const heroHeader = append(heroCard, $(".opencode-multimodel-card-header"));
    append(heroHeader, $("h2", void 0, localizeMultiModel("opencodeMultiModel.title", "Multi-Model Rounds")));
    const heroBody = append(heroCard, $(".opencode-multimodel-body"));
    append(heroBody, $(
      "p.opencode-multimodel-description",
      void 0,
      localizeMultiModel("opencodeMultiModel.description", "In Plan mode, different models each answer the same question from the context before the previous round. The merge model then reads all branches and, when necessary, performs read-only file verification, producing consensus, disagreements, and the final plan. Only adopted branches continue into subsequent context.")
    ));
    const rules = append(heroBody, $("ul.opencode-multimodel-rules"));
    for (const rule of [
      localizeMultiModel("opencodeMultiModel.rule1", "After asking a question in Plan mode and receiving an answer, clear the input box; the send button becomes the branch send button (accent color)."),
      localizeMultiModel("opencodeMultiModel.rule2", "Switch models and send an empty input again to create a new branch; branches are generated serially, and the send button is disabled until the previous branch finishes."),
      localizeMultiModel("opencodeMultiModel.rule3", "Once there are 2 branches, the answer action row shows \u25C0 \u25B6 and \u201CMerge & Summarize\u201D."),
      localizeMultiModel("opencodeMultiModel.rule4", "The primary merge model synthesizes the final plan from its first answer and verified branch suggestions; the result becomes the main line. You can adopt a branch before merging.")
    ]) {
      append(rules, $("li", void 0, rule));
    }
    const settingsCard = append(root, $(".opencode-multimodel-card"));
    const settingsHeader = append(settingsCard, $(".opencode-multimodel-card-header"));
    append(settingsHeader, $("h3", void 0, localizeMultiModel("opencodeMultiModel.settingsTitle", "Settings")));
    const settingsBody = append(settingsCard, $(".opencode-multimodel-body"));
    const enabledRow = append(settingsBody, $(".opencode-multimodel-persistent-row"));
    const enabledText = append(enabledRow, $(".opencode-multimodel-persistent-text"));
    const enabledLabel = append(enabledText, $("label.opencode-multimodel-persistent-label"));
    enabledLabel.textContent = localizeMultiModel("opencodeMultiModel.enabledLabel", "Enable Multi-Model Rounds");
    append(enabledText, $(
      ".opencode-multimodel-hint",
      void 0,
      localizeMultiModel("opencodeMultiModel.enabledHint", "When disabled, an empty input no longer triggers branch sending.")
    ));
    this.enabledToggle = append(enabledRow, $("button.opencode-multimodel-switch"));
    this.enabledToggle.type = "button";
    this.enabledToggle.setAttribute("role", "switch");
    this.enabledToggle.setAttribute("aria-label", localizeMultiModel("opencodeMultiModel.enabledLabel", "Enable Multi-Model Rounds"));
    append(this.enabledToggle, $("span.opencode-multimodel-switch-track"));
    this.renderEnabledToggle(this.readEnabled());
    this._register(addDisposableListener(this.enabledToggle, "click", () => {
      const enabled = this.enabledToggle.getAttribute("aria-checked") !== "true";
      this.renderEnabledToggle(enabled);
      void this.configurationService.updateValue(SETTING_ENABLED, enabled, 2 /* USER */).catch(() => {
        this.renderEnabledToggle(this.readEnabled());
      });
    }));
    const mergeModelField = append(settingsBody, $(".opencode-multimodel-field"));
    append(mergeModelField, $(
      "span.opencode-multimodel-field-label",
      void 0,
      localizeMultiModel("opencodeMultiModel.mergeModelLabel", "Merge model")
    ));
    const mergeModelRow = append(mergeModelField, $(".opencode-multimodel-merge-row"));
    this.mergeModelValue = append(mergeModelRow, $("code.opencode-multimodel-value"));
    const mergeModelActions = append(mergeModelRow, $(".opencode-multimodel-actions"));
    const pickButton = this._register(new Button(mergeModelActions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    pickButton.label = `$(${Codicon.gitMerge.id}) ${localizeMultiModel("opencodeMultiModel.pick", "Select\u2026")}`;
    pickButton.setTitle(localizeMultiModel("opencodeMultiModel.pickTitle", "Choose the merge model from the configured models"));
    this._register(pickButton.onDidClick(() => void this.commandService.executeCommand(PICK_MERGE_MODEL_COMMAND)));
    const clearButton = this._register(new Button(mergeModelActions, { ...defaultButtonStyles, secondary: true }));
    clearButton.label = localizeMultiModel("opencodeMultiModel.useCurrent", "Use first-answer main model");
    clearButton.setTitle(localizeMultiModel("opencodeMultiModel.useCurrentTitle", "Clear the merge model setting; use the model that produced the first answer even after switching branch models"));
    this._register(clearButton.onDidClick(() => void this.configurationService.updateValue(SETTING_MERGE_MODEL, "", 2 /* USER */)));
    append(mergeModelField, $(
      "p.opencode-multimodel-help",
      void 0,
      localizeMultiModel("opencodeMultiModel.mergeModelHelp", "Leave empty to use the model that produced the first answer, not the current branch model. Format: vendor/modelId.")
    ));
    const mergeReasoningField = append(settingsBody, $(".opencode-multimodel-field"));
    append(mergeReasoningField, $(
      "span.opencode-multimodel-field-label",
      void 0,
      localizeMultiModel("opencodeMultiModel.mergeReasoningLabel", "Merge thinking effort")
    ));
    this.mergeReasoningSelect = append(mergeReasoningField, $("select.opencode-multimodel-select"));
    this.mergeReasoningSelect.setAttribute("aria-label", localizeMultiModel("opencodeMultiModel.mergeReasoningLabel", "Merge thinking effort"));
    for (const option2 of MERGE_REASONING_OPTIONS) {
      const element = append(this.mergeReasoningSelect, $("option"));
      element.value = option2;
      element.textContent = mergeReasoningOptionLabel(option2);
    }
    this._register(addDisposableListener(this.mergeReasoningSelect, "change", () => {
      void this.configurationService.updateValue(SETTING_MERGE_REASONING, this.mergeReasoningSelect.value, 2 /* USER */);
    }));
    append(mergeReasoningField, $(
      "p.opencode-multimodel-help",
      void 0,
      localizeMultiModel("opencodeMultiModel.mergeReasoningHelp", "Thinking effort used when the merge model summarizes branches. Only applies when a separate merge model is configured above; otherwise merging follows the thinking setting of the current conversation. If the merge model does not support the selected effort (DeepSeek supports low/high/max only; Codex models cannot disable thinking or use Ultra), the merge model default is used.")
    ));
    const readToolsRow = append(settingsBody, $(".opencode-multimodel-row"));
    this.mergeReadToolsCheckbox = this._register(new Checkbox(
      localizeMultiModel("opencodeMultiModel.readToolsLabel", "Allow read-only file verification when merging"),
      this.readMergeReadTools(),
      defaultCheckboxStyles
    ));
    readToolsRow.appendChild(this.mergeReadToolsCheckbox.domNode);
    append(readToolsRow, $(
      "span.opencode-multimodel-check-label",
      void 0,
      localizeMultiModel("opencodeMultiModel.readToolsLabel", "Allow read-only file verification when merging")
    ));
    append(readToolsRow, $(
      "span.opencode-multimodel-hint",
      void 0,
      localizeMultiModel("opencodeMultiModel.readToolsHint", "Files are read only when branches disagree or the conclusion lacks evidence.")
    ));
    this._register(this.mergeReadToolsCheckbox.onChange(() => {
      void this.configurationService.updateValue(SETTING_MERGE_READ_TOOLS, this.mergeReadToolsCheckbox.checked, 2 /* USER */);
    }));
    const maxBranchesField = append(settingsBody, $(".opencode-multimodel-field"));
    append(maxBranchesField, $(
      "span.opencode-multimodel-field-label",
      void 0,
      localizeMultiModel("opencodeMultiModel.maxBranchesLabel", "Max branches per round")
    ));
    this.maxBranchesSelect = append(maxBranchesField, $("select.opencode-multimodel-select"));
    this.maxBranchesSelect.setAttribute("aria-label", localizeMultiModel("opencodeMultiModel.maxBranchesLabel", "Max branches per round"));
    for (let value2 = 2; value2 <= 6; value2++) {
      const option2 = append(this.maxBranchesSelect, $("option"));
      option2.value = String(value2);
      option2.textContent = localizeMultiModel("opencodeMultiModel.maxBranchesOption", "{0} branches", value2);
    }
    this._register(addDisposableListener(this.maxBranchesSelect, "change", () => {
      void this.configurationService.updateValue(SETTING_MAX_BRANCHES, Number(this.maxBranchesSelect.value), 2 /* USER */);
    }));
    append(maxBranchesField, $(
      "p.opencode-multimodel-help",
      void 0,
      localizeMultiModel("opencodeMultiModel.maxBranchesHelp", "When the limit is reached, merge or adopt a branch before generating more branches for the same question.")
    ));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencode.multiModel")) {
        this.refreshValues();
      }
    }));
    this.refreshValues();
  }
  readEnabled() {
    return this.configurationService.getValue(SETTING_ENABLED) ?? true;
  }
  readMergeReadTools() {
    return this.configurationService.getValue(SETTING_MERGE_READ_TOOLS) ?? true;
  }
  renderEnabledToggle(enabled) {
    this.enabledToggle.setAttribute("aria-checked", String(enabled));
    this.enabledToggle.title = enabled ? localizeMultiModel("opencodeMultiModel.enabledOn", "In Plan mode, an empty input branches only after a completed answer; ordinary Chat still requires input.") : localizeMultiModel("opencodeMultiModel.enabledOff", "Multi-model rounds are disabled. An empty input no longer triggers branch sending.");
  }
  refreshValues() {
    this.renderEnabledToggle(this.readEnabled());
    this.mergeReadToolsCheckbox.checked = this.readMergeReadTools();
    const mergeModel = (this.configurationService.getValue(SETTING_MERGE_MODEL) ?? "").trim();
    this.mergeModelValue.textContent = mergeModel || localizeMultiModel("opencodeMultiModel.mergeModelEmpty", "Model that produced the first answer");
    const maxBranches = this.configurationService.getValue(SETTING_MAX_BRANCHES) ?? 3;
    const clamped = Number.isInteger(maxBranches) && maxBranches >= 2 && maxBranches <= 6 ? maxBranches : 3;
    this.maxBranchesSelect.value = String(clamped);
    const mergeReasoning = this.configurationService.getValue(SETTING_MERGE_REASONING) ?? "high";
    this.mergeReasoningSelect.value = MERGE_REASONING_OPTIONS.includes(mergeReasoning) ? mergeReasoning : "high";
  }
  dispose() {
    super.dispose();
  }
};

OpenCodeMultiModelWidget = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ICommandService)
], OpenCodeMultiModelWidget);

aiCustomizationManagementSectionRegistry.register({
  id: AICustomizationManagementSection.MultiModel,
  label: localizeMultiModel("opencodeMultiModel.navigationLabel", "Multi-Model Rounds"),
  icon: Codicon.gitMerge,
  description: localizeMultiModel("opencodeMultiModel.navigationDescription", "Merge model, read-only verification, and branch limits for multi-model rounds."),
  supportsHarness: () => true,
  create: (instantiationService, container2) => instantiationService.createInstance(OpenCodeMultiModelWidget, container2)
});
export { mergeReasoningOptionLabel, SETTING_ENABLED, SETTING_MERGE_MODEL, SETTING_MERGE_READ_TOOLS, SETTING_MAX_BRANCHES, SETTING_MERGE_REASONING, PICK_MERGE_MODEL_COMMAND, MERGE_REASONING_OPTIONS, OpenCodeMultiModelWidget };
