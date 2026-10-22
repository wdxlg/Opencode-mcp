// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatManagement/chatModelsWidget.ts
import { $, Dimension, append, clearNode, getTotalHeight, getTotalWidth, getWindow } from "./module-0075.mjs";
import { Action, Separator, toAction } from "./module-0082.mjs";
import { localizeModels } from "./module-2667.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ChatModelsViewModel, SEARCH_SUGGESTIONS, getManageModelsProviderLabel, isLanguageModelGroupEntry, isLanguageModelProviderEntry, isStatusEntry } from "./module-2668.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ActionBar } from "./module-0477.mjs";
import { HighlightedLabel } from "./module-0639.mjs";
import { Link } from "./module-0550.mjs";
import { ILanguageModelsService, resolveProviderDeprecationLink } from "./module-0967.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { severity_default } from "./module-0266.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0873.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { formatTokenCount } from "./module-0040.mjs";
import { Emitter } from "./module-0017.mjs";
import { Button } from "./module-0546.mjs";
import { ToolBar } from "./module-0503.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { CONTEXT_MODELS_SEARCH_FOCUS } from "./module-0964.mjs";
import { Delayer } from "./module-0036.mjs";
import { SuggestEnabledInput } from "./module-1838.mjs";
import { settingsTextInputBorder } from "./module-1839.mjs";
import { preferencesClearInputIcon } from "./module-1834.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { InputBox } from "./module-0600.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { WorkbenchTable } from "./module-0636.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/chat/browser/chatManagement/chatModelsWidget.ts
var $90 = $;

var HEADER_HEIGHT = 30;

var VENDOR_ROW_HEIGHT = 30;

var MODEL_ROW_HEIGHT = 26;

var MIN_TABLE_HEIGHT = 240;

var ModelsFilterAction = class extends Action {
  constructor() {
    super("workbench.models.filter", localizeModels("filter", "Filter"), ThemeIcon.asClassName(Codicon.filter));
  }
  async run() {
  }
};

function toggleFilter(currentQuery, filter2) {
  const { query, synonyms = [], excludes = [] } = filter2;
  const allSynonyms = [query, ...synonyms];
  const isChecked = allSynonyms.some((q) => currentQuery.includes(q));
  const hasExcludedQuery = excludes.some((q) => currentQuery.includes(q));
  if (isChecked) {
    let queryWithRemovedFilter = currentQuery;
    for (const q of allSynonyms) {
      queryWithRemovedFilter = queryWithRemovedFilter.replace(q, "");
    }
    return queryWithRemovedFilter.replace(/\s+/g, " ").trim();
  } else if (hasExcludedQuery) {
    let newQuery = currentQuery;
    for (const q of excludes) {
      newQuery = newQuery.replace(q, "");
    }
    newQuery = newQuery.replace(/\s+/g, " ").trim();
    return newQuery ? `${newQuery} ${query}` : query;
  } else {
    const trimmedQuery = currentQuery.trim();
    return trimmedQuery ? `${trimmedQuery} ${query}` : query;
  }
}

var ModelsSearchFilterDropdownMenuActionViewItem = class extends DropdownMenuActionViewItem {
  constructor(action, options3, search2, viewModel, contextMenuService) {
    super(
      action,
      { getActions: () => this.getActions() },
      contextMenuService,
      {
        ...options3,
        classNames: action.class,
        anchorAlignmentProvider: () => 1 /* RIGHT */,
        menuAsChild: true
      }
    );
    this.search = search2;
    this.viewModel = viewModel;
  }
  createProviderAction(vendor, displayName) {
    const query = `@provider:"${displayName}"`;
    const currentQuery = this.search.getValue();
    const isChecked = currentQuery.includes(query) || currentQuery.includes(`@provider:${vendor}`);
    return {
      id: `provider-${vendor}`,
      label: displayName,
      tooltip: localizeModels("filterByProvider", "Filter by {0}", displayName),
      class: void 0,
      enabled: true,
      checked: isChecked,
      run: () => this.toggleFilterAndSearch({ query, synonyms: [`@provider:${vendor}`] })
    };
  }
  createCapabilityAction(capability, label3) {
    const query = `@capability:${capability}`;
    const currentQuery = this.search.getValue();
    const isChecked = currentQuery.includes(query);
    return {
      id: `capability-${capability}`,
      label: label3,
      tooltip: localizeModels("filterByCapability", "Filter by {0}", label3),
      class: void 0,
      enabled: true,
      checked: isChecked,
      run: () => this.toggleFilterAndSearch({ query })
    };
  }
  toggleFilterAndSearch(filter2) {
    const currentQuery = this.search.getValue();
    const newQuery = toggleFilter(currentQuery, filter2);
    this.search.setValue(newQuery);
  }
  getActions() {
    const actions = [];
    actions.push(
      this.createCapabilityAction("tools", localizeModels("capability.tools", "Tools")),
      this.createCapabilityAction("vision", localizeModels("capability.vision", "Vision")),
      this.createCapabilityAction("agent", localizeModels("capability.agent", "Agent Mode"))
    );
    const configuredVendors = this.viewModel.getConfiguredVendors();
    if (configuredVendors.length > 1) {
      actions.push(new Separator());
      actions.push(...configuredVendors.map((vendor) => this.createProviderAction(vendor.vendor.vendor, vendor.group.name)));
    }
    return actions;
  }
};

ModelsSearchFilterDropdownMenuActionViewItem = __decorateClass([
  __decorateParam(4, IContextMenuService)
], ModelsSearchFilterDropdownMenuActionViewItem);

var Delegate4 = class {
  constructor() {
    this.headerRowHeight = HEADER_HEIGHT;
  }
  getHeight(element) {
    return isLanguageModelProviderEntry(element) || isLanguageModelGroupEntry(element) ? VENDOR_ROW_HEIGHT : MODEL_ROW_HEIGHT;
  }
};

var ModelsTableColumnRenderer = class {
  renderElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    const isVendor = isLanguageModelProviderEntry(element);
    const isGroup = isLanguageModelGroupEntry(element);
    const isStatus = isStatusEntry(element);
    templateData.container.classList.add("models-table-column");
    const row = templateData.container.parentElement;
    row.classList.toggle("models-vendor-row", isVendor || isGroup);
    row.classList.toggle("models-model-row", !isVendor && !isGroup);
    row.classList.toggle("models-status-row", isStatus);
    const isHidden = isVendor && element.hidden || !isVendor && !isGroup && !isStatus && element.model?.hidden;
    row.classList.toggle("models-row-hidden", !!isHidden);
    if (isVendor) {
      this.renderVendorElement(element, index2, templateData);
    } else if (isGroup) {
      this.renderGroupElement(element, index2, templateData);
    } else if (isStatus) {
      this.renderStatusElement(element, index2, templateData);
    } else {
      this.renderModelElement(element, index2, templateData);
    }
  }
  renderStatusElement(element, index2, templateData) {
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.disposables.dispose();
  }
};

var GutterColumnRenderer = class _GutterColumnRenderer extends ModelsTableColumnRenderer {
  constructor(viewModel) {
    super();
    this.viewModel = viewModel;
    this.templateId = _GutterColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "gutter";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("models-gutter-column");
    const actionBar3 = disposables.add(new ActionBar(container3));
    return {
      listRowElement: container3.parentElement?.parentElement ?? null,
      container: container3,
      actionBar: actionBar3,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    templateData.actionBar.clear();
    super.renderElement(entry, index2, templateData);
  }
  renderVendorElement(entry, index2, templateData) {
    this.renderCollapsableElement(entry, templateData);
    this.renderGroupVisibilityElement(entry, templateData);
  }
  renderGroupElement(entry, index2, templateData) {
    this.renderCollapsableElement(entry, templateData);
  }
  renderCollapsableElement(entry, templateData) {
    if (templateData.listRowElement) {
      templateData.listRowElement.setAttribute("aria-expanded", entry.collapsed ? "false" : "true");
    }
    const label3 = entry.collapsed ? localizeModels("expand", "Expand") : localizeModels("collapse", "Collapse");
    const toggleCollapseAction = {
      id: "toggleCollapse",
      label: label3,
      tooltip: label3,
      enabled: true,
      class: ThemeIcon.asClassName(entry.collapsed ? Codicon.chevronRight : Codicon.chevronDown),
      run: () => this.viewModel.toggleCollapsed(entry)
    };
    templateData.actionBar.push(toggleCollapseAction, { icon: true, label: false });
  }
  renderModelElement(entry, index2, templateData) {
    this.renderModelVisibilityElement(entry, templateData);
  }
  renderGroupVisibilityElement(entry, templateData) {
    const hidden = entry.hidden;
    templateData.actionBar.push({
      id: hidden ? "showGroup" : "hideGroup",
      label: hidden ? localizeModels("models.showGroup", "Show All Models") : localizeModels("models.hideGroup", "Hide All Models"),
      tooltip: hidden ? localizeModels("models.showGroup", "Show All Models") : localizeModels("models.hideGroup", "Hide All Models"),
      class: `model-visibility-toggle ${ThemeIcon.asClassName(hidden ? Codicon.eyeClosed : Codicon.eye)}`,
      enabled: true,
      run: () => this.viewModel.toggleGroupHidden(entry)
    }, { icon: true, label: false });
  }
  renderModelVisibilityElement(entry, templateData) {
    const hidden = entry.model.hidden;
    templateData.actionBar.push({
      id: hidden ? "showModel" : "hideModel",
      label: hidden ? localizeModels("models.showModel", "Show Model") : localizeModels("models.hideModel", "Hide Model"),
      tooltip: hidden ? localizeModels("models.showModel", "Show Model") : localizeModels("models.hideModel", "Hide Model"),
      class: `model-visibility-toggle ${ThemeIcon.asClassName(hidden ? Codicon.eyeClosed : Codicon.eye)}`,
      enabled: true,
      run: () => this.viewModel.toggleModelHidden(entry)
    }, { icon: true, label: false });
  }
};

var ModelNameColumnRenderer = class extends ModelsTableColumnRenderer {
  constructor(hoverService, instantiationService, productService, environmentService) {
    super();
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.productService = productService;
    this.environmentService = environmentService;
    this.templateId = ModelNameColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "modelName";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const nameContainer = append(container3, $90(".model-name-container"));
    const statusIcon = append(nameContainer, $90(".status-icon"));
    const providerIcon = append(nameContainer, $90(".model-provider-icon"));
    providerIcon.setAttribute("aria-hidden", "true");
    const nameLabel = disposables.add(new HighlightedLabel(append(nameContainer, $90(".model-name"))));
    const sourceDescription = append(nameContainer, $90(".model-source-description"));
    sourceDescription.style.display = "none";
    const deprecationLinkContainer = append(nameContainer, $90(".model-deprecation-link"));
    deprecationLinkContainer.style.display = "none";
    const deprecationLink = disposables.add(this.instantiationService.createInstance(Link, deprecationLinkContainer, { label: "", href: "" }, {}));
    const modelStatusIcon = append(nameContainer, $90(".model-status-icon"));
    return {
      container: container3,
      statusIcon,
      providerIcon,
      nameLabel,
      sourceDescription,
      modelStatusIcon,
      deprecationLinkContainer,
      deprecationLink,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    clearNode(templateData.modelStatusIcon);
    templateData.providerIcon.className = "model-provider-icon";
    templateData.providerIcon.style.display = "none";
    templateData.sourceDescription.textContent = "";
    templateData.sourceDescription.style.display = "none";
    templateData.nameLabel.element.classList.remove("error-status", "warning-status", "info-status");
    templateData.deprecationLinkContainer.style.display = "none";
    super.renderElement(entry, index2, templateData);
  }
  renderVendorElement(entry, index2, templateData) {
    templateData.nameLabel.set(entry.vendorEntry.group.name, void 0);
    if (entry.sourcePresentation?.icon) {
      templateData.providerIcon.classList.add(...ThemeIcon.asClassNameArray(entry.sourcePresentation.icon));
      templateData.providerIcon.style.display = "";
    }
    if (entry.sourcePresentation?.description) {
      templateData.sourceDescription.textContent = entry.sourcePresentation.description;
      templateData.sourceDescription.style.display = "";
    }
    const deprecationLink = entry.vendorEntry.vendor.deprecation?.link;
    if (deprecationLink && !this.environmentService.isSessionsWindow) {
      const icon2 = $90("span");
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.linkExternal));
      icon2.setAttribute("aria-hidden", "true");
      const label3 = $90("span.model-deprecation-link-label", void 0, localizeModels("models.deprecation.link.label", "Migrate"), icon2);
      templateData.deprecationLink.link = {
        label: label3,
        href: resolveProviderDeprecationLink(deprecationLink, this.productService.urlProtocol).toString(),
        title: localizeModels("models.deprecation.link.tooltip", "The Ollama model provider is deprecated. Please migrate to the official extension.")
      };
      templateData.deprecationLinkContainer.style.display = "";
    }
  }
  renderGroupElement(entry, index2, templateData) {
    templateData.nameLabel.set(entry.label, void 0);
  }
  renderModelElement(entry, index2, templateData) {
    const { model: modelEntry, modelNameMatches } = entry;
    templateData.statusIcon.style.display = "none";
    templateData.modelStatusIcon.className = "model-status-icon";
    if (modelEntry.metadata.statusIcon) {
      templateData.modelStatusIcon.classList.add(...ThemeIcon.asClassNameArray(modelEntry.metadata.statusIcon));
      templateData.modelStatusIcon.style.display = "";
    } else {
      templateData.modelStatusIcon.style.display = "none";
    }
    templateData.nameLabel.set(modelEntry.metadata.name, modelNameMatches);
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    markdown.appendMarkdown(`**${entry.model.metadata.name}**`);
    if (entry.model.metadata.id !== entry.model.metadata.version) {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${entry.model.metadata.id}&#64;${entry.model.metadata.version}_&nbsp;</span>`);
    } else {
      markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">&nbsp;_${entry.model.metadata.id}_&nbsp;</span>`);
    }
    markdown.appendText(`
`);
    if (entry.model.metadata.statusIcon && entry.model.metadata.tooltip) {
      if (entry.model.metadata.statusIcon) {
        markdown.appendMarkdown(`$(${entry.model.metadata.statusIcon.id})&nbsp;`);
      }
      markdown.appendMarkdown(`${entry.model.metadata.tooltip}`);
      markdown.appendText(`
`);
    }
    templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
      content: markdown,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
  }
  renderStatusElement(entry, index2, templateData) {
    templateData.statusIcon.style.display = "";
    templateData.statusIcon.className = "status-icon";
    switch (entry.severity) {
      case severity_default.Error:
        templateData.nameLabel.element.classList.add("error-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
        break;
      case severity_default.Warning:
        templateData.nameLabel.element.classList.add("warning-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.warning));
        break;
      case severity_default.Info:
        templateData.nameLabel.element.classList.add("info-status");
        templateData.statusIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
        break;
    }
    templateData.nameLabel.set(entry.message, void 0, entry.message);
  }
};

ModelNameColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], ModelNameColumnRenderer);

var CombinedCostColumnRenderer = class extends ModelsTableColumnRenderer {
  constructor(hoverService) {
    super();
    this.hoverService = hoverService;
    this.templateId = CombinedCostColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "combinedCost";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const grid = append(container3, $90(".model-cost-grid"));
    const inputCell = append(grid, $90("span.model-cost-cell"));
    const outputCell = append(grid, $90("span.model-cost-cell"));
    const cacheReadCell = append(grid, $90("span.model-cost-cell"));
    const cacheWriteCell = append(grid, $90("span.model-cost-cell"));
    return {
      container: container3,
      inputCell,
      outputCell,
      cacheReadCell,
      cacheWriteCell,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    templateData.inputCell.textContent = "";
    templateData.outputCell.textContent = "";
    templateData.cacheReadCell.textContent = "";
    templateData.cacheWriteCell.textContent = "";
    super.renderElement(entry, index2, templateData);
  }
  renderGroupElement(_element, _index, _templateData) {
  }
  renderVendorElement(_element, _index, _templateData) {
  }
  renderModelElement(entry, index2, templateData) {
    const { inputCost, outputCost, cacheCost, cacheWriteCost } = entry.model.metadata;
    const hasCost = inputCost !== void 0 || outputCost !== void 0 || cacheCost !== void 0 || cacheWriteCost !== void 0;
    if (hasCost) {
      templateData.inputCell.textContent = inputCost !== void 0 ? localizeModels("cost.input", "In: {0}", inputCost) : "";
      templateData.outputCell.textContent = outputCost !== void 0 ? localizeModels("cost.output", "Out: {0}", outputCost) : "";
      templateData.cacheReadCell.textContent = cacheCost !== void 0 ? localizeModels("cost.cacheRead", "Cache Read: {0}", cacheCost) : "";
      templateData.cacheWriteCell.textContent = cacheWriteCost !== void 0 ? localizeModels("cost.cacheWrite", "Cache Write: {0}", cacheWriteCost) : "";
      const parts = [];
      if (inputCost !== void 0) {
        parts.push(inputCost === 1 ? localizeModels("cost.inputHover.singular", "Input: {0} credit per 1M tokens", inputCost) : localizeModels("cost.inputHover.plural", "Input: {0} credits per 1M tokens", inputCost));
      }
      if (outputCost !== void 0) {
        parts.push(outputCost === 1 ? localizeModels("cost.outputHover.singular", "Output: {0} credit per 1M tokens", outputCost) : localizeModels("cost.outputHover.plural", "Output: {0} credits per 1M tokens", outputCost));
      }
      if (cacheCost !== void 0) {
        parts.push(cacheCost === 1 ? localizeModels("cost.cacheHover.singular", "Cache Read: {0} credit per 1M tokens", cacheCost) : localizeModels("cost.cacheHover.plural", "Cache Read: {0} credits per 1M tokens", cacheCost));
      }
      if (cacheWriteCost !== void 0) {
        parts.push(cacheWriteCost === 1 ? localizeModels("cost.cacheWriteHover.singular", "Cache Write: {0} credit per 1M tokens", cacheWriteCost) : localizeModels("cost.cacheWriteHover.plural", "Cache Write: {0} credits per 1M tokens", cacheWriteCost));
      }
      templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
        content: parts.join("\n"),
        appearance: {
          compact: true,
          skipFadeInAnimation: true
        }
      })));
    } else {
      const pricingText = entry.model.metadata.pricing;
      if (pricingText) {
        templateData.inputCell.textContent = pricingText;
        templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
          content: localizeModels("pricing.tooltip", "Pricing: {0}", pricingText),
          appearance: {
            compact: true,
            skipFadeInAnimation: true
          }
        })));
      }
    }
  }
};

CombinedCostColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], CombinedCostColumnRenderer);

var TokenLimitsColumnRenderer = class extends ModelsTableColumnRenderer {
  constructor(hoverService) {
    super();
    this.hoverService = hoverService;
    this.templateId = TokenLimitsColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "tokenLimits";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const tokenLimitsElement = append(container3, $90(".model-token-limits"));
    return {
      container: container3,
      tokenLimitsElement,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    clearNode(templateData.tokenLimitsElement);
    super.renderElement(entry, index2, templateData);
  }
  renderVendorElement(entry, index2, templateData) {
  }
  renderGroupElement(entry, index2, templateData) {
  }
  renderModelElement(entry, index2, templateData) {
    const { model: modelEntry } = entry;
    const markdown = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    if (modelEntry.metadata.maxInputTokens || modelEntry.metadata.maxOutputTokens) {
      const totalTokens = (modelEntry.metadata.maxInputTokens ?? 0) + (modelEntry.metadata.maxOutputTokens ?? 0);
      const tokenDiv = append(templateData.tokenLimitsElement, $90(".token-limit-item"));
      const tokenText = append(tokenDiv, $90("span"));
      tokenText.textContent = formatTokenCount(totalTokens);
      markdown.appendMarkdown(`${localizeModels("models.contextSize", "Context Size")}: `);
      markdown.appendMarkdown(`${formatTokenCount(totalTokens)}`);
    }
    templateData.elementDisposables.add(this.hoverService.setupDelayedHoverAtMouse(templateData.container, () => ({
      content: markdown,
      appearance: {
        compact: true,
        skipFadeInAnimation: true
      }
    })));
  }
};

TokenLimitsColumnRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], TokenLimitsColumnRenderer);

var CapabilitiesColumnRenderer = class _CapabilitiesColumnRenderer extends ModelsTableColumnRenderer {
  constructor() {
    super(...arguments);
    this.templateId = _CapabilitiesColumnRenderer.TEMPLATE_ID;
    this._onDidClickCapability = new Emitter();
    this.onDidClickCapability = this._onDidClickCapability.event;
  }
  static {
    this.TEMPLATE_ID = "capabilities";
  }
  dispose() {
    this._onDidClickCapability.dispose();
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("model-capability-column");
    const metadataRow = append(container3, $90(".model-capabilities"));
    return {
      container: container3,
      metadataRow,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    clearNode(templateData.metadataRow);
    super.renderElement(entry, index2, templateData);
  }
  renderVendorElement(entry, index2, templateData) {
  }
  renderGroupElement(entry, index2, templateData) {
  }
  renderModelElement(entry, index2, templateData) {
    const { model: modelEntry, capabilityMatches } = entry;
    if (modelEntry.metadata.capabilities?.toolCalling) {
      templateData.elementDisposables.add(this.createCapabilityButton(
        templateData.metadataRow,
        capabilityMatches?.includes("toolCalling") || false,
        localizeModels("models.tools", "Tools"),
        "tools"
      ));
    }
    if (modelEntry.metadata.capabilities?.vision) {
      templateData.elementDisposables.add(this.createCapabilityButton(
        templateData.metadataRow,
        capabilityMatches?.includes("vision") || false,
        localizeModels("models.vision", "Vision"),
        "vision"
      ));
    }
  }
  createCapabilityButton(container3, isActive2, label3, capability) {
    const disposables = new DisposableStore();
    const buttonContainer = append(container3, $90(".model-badge-container"));
    const button = disposables.add(new Button(buttonContainer, { secondary: true }));
    button.element.classList.add("model-capability");
    button.element.classList.toggle("active", isActive2);
    button.label = label3;
    disposables.add(button.onDidClick(() => this._onDidClickCapability.fire(capability)));
    return disposables;
  }
};

function deriveProviderNameFromUrl(endpoint) {
  let host;
  try {
    host = new URL(endpoint).hostname.replace(/^www\./i, "");
  } catch {
    return void 0;
  }
  const segments = host.split(".");
  if (segments.every((segment) => /^\d+$/.test(segment))) {
    return host;
  }
  if (segments.length >= 2) {
    return segments[segments.length - 2];
  }
  return host;
}

function createProviderGroupActions(viewModel, vendor, groupName, languageModelsService, dialogService, onEditProvider) {
  const configuration2 = vendor.configuration;
  if (!configuration2) {
    return [];
  }
  const actions = [];
  const configurationProperties = configuration2.properties;
  if (vendor.vendor === "opencode") {
    actions.push(toAction({
      id: "editProviderAction",
      label: localizeModels("models.editProvider", "Edit API"),
      class: ThemeIcon.asClassName(Codicon.edit),
      run: () => onEditProvider(groupName)
    }));
    actions.push(toAction({
      id: "fetchProviderModelsAction",
      label: localizeModels("models.fetchProviderModels", "Refresh Models"),
      class: ThemeIcon.asClassName(Codicon.refresh),
      run: async () => {
        await languageModelsService.selectLanguageModels({ vendor: vendor.vendor });
        await viewModel.refresh();
      }
    }));
    actions.push(new Separator());
  }
  actions.push(toAction({
    id: "goToSettingsAction",
    label: localizeModels("models.goToSettings", "Open in Language Models (JSON)"),
    run: () => languageModelsService.openLanguageModelsProviderGroupSettings(vendor.vendor, groupName)
  }));
  actions.push(new Separator());
  actions.push(toAction({
    id: "renameGroupAction",
    label: localizeModels("models.renameGroup", "Rename Group"),
    run: () => languageModelsService.renameLanguageModelsProviderGroup(vendor.vendor, groupName)
  }));
  if (configurationProperties?.apiKey) {
    actions.push(toAction({
      id: "updateApiKeyAction",
      label: localizeModels("models.updateApiKey", "Update API Key"),
      run: () => languageModelsService.updateLanguageModelsProviderGroupApiKey(vendor.vendor, groupName)
    }));
  }
  if (configurationProperties?.models?.defaultSnippets?.[0]) {
    actions.push(toAction({
      id: "addModelAction",
      label: localizeModels("models.addModel", "Add Model"),
      run: () => languageModelsService.addLanguageModelsProviderGroupModel(vendor.vendor, groupName)
    }));
  }
  actions.push(new Separator());
  actions.push(toAction({
    id: "deleteAction",
    label: localizeModels("models.deleteAction", "Delete"),
    class: ThemeIcon.asClassName(Codicon.trash),
    run: async () => {
      const result = await dialogService.confirm({
        type: "info",
        message: localizeModels("models.deleteConfirmation", "Would you like to delete {0}?", groupName)
      });
      if (!result.confirmed) {
        return;
      }
      await languageModelsService.removeLanguageModelsProviderGroup(vendor.vendor, groupName);
      viewModel.refresh();
    }
  }));
  return actions;
}

var ActionsColumnRenderer2 = class extends ModelsTableColumnRenderer {
  constructor(viewModel, onEditProvider, instantiationService, languageModelsService, dialogService, commandService, contextMenuService) {
    super();
    this.viewModel = viewModel;
    this.onEditProvider = onEditProvider;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.contextMenuService = contextMenuService;
    this.templateId = ActionsColumnRenderer2.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "actions";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container3.classList.add("models-actions-column");
    const parent = append(container3, $90(".actions-container"));
    const actionBar3 = disposables.add(this.instantiationService.createInstance(
      ToolBar,
      parent,
      this.contextMenuService,
      {
        icon: true,
        label: false,
        moreIcon: Codicon.gear,
        anchorAlignmentProvider: () => 1 /* RIGHT */
      }
    ));
    return {
      container: container3,
      actionBar: actionBar3,
      disposables,
      elementDisposables
    };
  }
  renderElement(entry, index2, templateData) {
    templateData.actionBar.setActions([]);
    super.renderElement(entry, index2, templateData);
  }
  renderVendorElement(entry, index2, templateData) {
    const { vendorEntry } = entry;
    const primaryActions = [];
    const secondaryActions = [];
    if (vendorEntry.vendor.configuration) {
      secondaryActions.push(...createProviderGroupActions(this.viewModel, vendorEntry.vendor, vendorEntry.group.name, this.languageModelsService, this.dialogService, this.onEditProvider));
    } else if (vendorEntry.vendor.managementCommand) {
      primaryActions.push(toAction({
        id: "manageVendor",
        label: localizeModels("models.manageProvider", "Manage {0}...", vendorEntry.group.name),
        class: ThemeIcon.asClassName(Codicon.gear),
        run: async () => {
          await this.commandService.executeCommand(vendorEntry.vendor.managementCommand, vendorEntry.vendor.vendor);
          this.viewModel.refresh();
        }
      }));
    }
    templateData.actionBar.setActions(primaryActions, secondaryActions);
  }
  renderGroupElement(entry, index2, templateData) {
  }
  renderModelElement(entry, index2, templateData) {
    const primaryActions = [];
    if (entry.model.metadata.id !== "auto") {
      primaryActions.push(this.createPinAction(entry.model.identifier));
    }
    const configActions = this.languageModelsService.getModelConfigurationActions(entry.model.identifier);
    const secondaryActions = [...configActions];
    const vendor = entry.model.provider.vendor;
    if (!vendor.isDefault && !vendor.managementCommand && (configActions.length > 0 || entry.model.metadata.configurationSchema)) {
      secondaryActions.push(toAction({
        id: "configureModel",
        label: localizeModels("models.configureModel", "Configure..."),
        run: () => this.languageModelsService.configureModel(entry.model.identifier)
      }));
    }
    templateData.actionBar.setActions(primaryActions, secondaryActions);
  }
  createPinAction(modelIdentifier) {
    const isPinned = this.languageModelsService.isModelPinned(modelIdentifier);
    return toAction({
      id: isPinned ? `unpin.${modelIdentifier}` : `pin.${modelIdentifier}`,
      label: isPinned ? localizeModels("models.unpinModel", "Unpin Model") : localizeModels("models.pinModel", "Pin Model"),
      class: ThemeIcon.asClassName(isPinned ? Codicon.pinned : Codicon.pin),
      run: () => {
        if (isPinned) {
          this.languageModelsService.unpinModel(modelIdentifier);
        } else {
          this.languageModelsService.pinModel(modelIdentifier);
        }
        this.viewModel.refresh();
      }
    });
  }
};

ActionsColumnRenderer2 = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ILanguageModelsService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IContextMenuService)
], ActionsColumnRenderer2);

var ProviderColumnRenderer = class _ProviderColumnRenderer extends ModelsTableColumnRenderer {
  constructor() {
    super(...arguments);
    this.templateId = _ProviderColumnRenderer.TEMPLATE_ID;
  }
  static {
    this.TEMPLATE_ID = "provider";
  }
  renderTemplate(container3) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    const providerElement = append(container3, $90(".model-provider"));
    return {
      container: container3,
      providerElement,
      disposables,
      elementDisposables
    };
  }
  renderVendorElement(entry, index2, templateData) {
    templateData.providerElement.textContent = "";
  }
  renderGroupElement(entry, index2, templateData) {
    templateData.providerElement.textContent = "";
  }
  renderModelElement(entry, index2, templateData) {
    templateData.providerElement.textContent = getManageModelsProviderLabel(entry.model);
  }
};

var ChatModelsWidget = class extends Disposable {
  constructor(options3, languageModelsService, instantiationService, extensionService, contextMenuService, chatEntitlementService, editorProgressService, commandService, contextKeyService, dialogService, notificationService) {
    super();
    this.options = options3;
    this.languageModelsService = languageModelsService;
    this.instantiationService = instantiationService;
    this.extensionService = extensionService;
    this.contextMenuService = contextMenuService;
    this.chatEntitlementService = chatEntitlementService;
    this.editorProgressService = editorProgressService;
    this.commandService = commandService;
    this.contextKeyService = contextKeyService;
    this.dialogService = dialogService;
    this.notificationService = notificationService;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this.codexRefreshInProgress = false;
    this.codexRefreshQueued = false;
    this.codexStatusRequest = 0;
    this.apiKeyConfigured = false;
    this.tableMinWidth = 0;
    this.tableDisposables = this._register(new DisposableStore());
    this.searchFocusContextKey = CONTEXT_MODELS_SEARCH_FOCUS.bindTo(this.contextKeyService);
    this.delayedFiltering = this._register(new Delayer(200));
    this.viewModel = this._register(this.instantiationService.createInstance(ChatModelsViewModel));
    this.element = $(".models-widget");
    this.create(this.element);
    const loadingPromise = this.extensionService.whenInstalledExtensionsRegistered().then(async () => {
      if (this.options.presentation === "codex") {
        await Promise.all([this.refreshCodexModels(false), this.loadCodexAccountStatus()]);
      } else {
        await Promise.all([this.viewModel.refresh(), this.loadOpenCodeProviderConfiguration()]);
      }
    });
    this.editorProgressService.showWhile(loadingPromise, 300);
  }
  static {
    this.NUM_INSTANCES = 0;
  }
  create(container3) {
    this.createProviderConfiguration(container3);
    this.searchAndButtonContainer = append(container3, $90(".models-search-and-button-container"));
    const placeholder = localizeModels("Search.FullTextSearchPlaceholder", "Type to search...");
    const searchContainer = append(this.searchAndButtonContainer, $90(".models-search-container"));
    this.searchWidget = this._register(this.instantiationService.createInstance(
      SuggestEnabledInput,
      "chatModelsWidget.searchbox",
      searchContainer,
      {
        triggerCharacters: ["@", ":"],
        provideResults: (query) => {
          const providerSuggestions = this.viewModel.getVendors().map((v2) => `@provider:"${v2.displayName}"`);
          const allSuggestions = [
            ...providerSuggestions,
            ...SEARCH_SUGGESTIONS.CAPABILITIES
          ];
          if (!query.trim()) {
            return allSuggestions;
          }
          const queryParts = query.split(/\s/g);
          const lastPart = queryParts[queryParts.length - 1];
          if (lastPart.startsWith("@provider:")) {
            return providerSuggestions;
          } else if (lastPart.startsWith("@capability:")) {
            return SEARCH_SUGGESTIONS.CAPABILITIES;
          } else if (lastPart.startsWith("@")) {
            return allSuggestions;
          }
          return [];
        }
      },
      placeholder,
      `chatModelsWidget:searchinput:${ChatModelsWidget.NUM_INSTANCES++}`,
      {
        placeholderText: placeholder,
        styleOverrides: {
          inputBorder: settingsTextInputBorder
        },
        focusContextKey: this.searchFocusContextKey
      }
    ));
    const filterAction = this._register(new ModelsFilterAction());
    const clearSearchAction = this._register(new Action(
      "workbench.models.clearSearch",
      localizeModels("clearSearch", "Clear Search"),
      ThemeIcon.asClassName(preferencesClearInputIcon),
      false,
      () => this.clearSearch()
    ));
    const collapseAllAction = this._register(new Action(
      "workbench.models.collapseAll",
      localizeModels("collapseAll", "Collapse All"),
      ThemeIcon.asClassName(Codicon.collapseAll),
      false,
      () => {
        this.viewModel.collapseAll();
      }
    ));
    collapseAllAction.enabled = this.viewModel.viewModelEntries.some((e) => isLanguageModelGroupEntry(e) || isLanguageModelProviderEntry(e));
    this._register(this.viewModel.onDidChange(() => collapseAllAction.enabled = this.viewModel.viewModelEntries.some((e) => isLanguageModelProviderEntry(e) || isLanguageModelGroupEntry(e))));
    this._register(this.searchWidget.onInputDidChange(() => {
      clearSearchAction.enabled = !!this.searchWidget.getValue();
      this.filterModels();
    }));
    this.searchActionsContainer = append(searchContainer, $90(".models-search-actions"));
    const actions = [clearSearchAction, collapseAllAction, filterAction];
    const toolBar = this._register(new ToolBar(this.searchActionsContainer, this.contextMenuService, {
      actionViewItemProvider: (action, options3) => {
        if (action.id === filterAction.id) {
          return this.instantiationService.createInstance(ModelsSearchFilterDropdownMenuActionViewItem, action, options3, {
            getValue: () => this.searchWidget.getValue(),
            setValue: (searchValue) => this.search(searchValue)
          }, this.viewModel);
        }
        return void 0;
      },
      getKeyBinding: () => void 0
    }));
    toolBar.setActions(actions);
    this.searchWidget.inputWidget.getContainerDomNode().style.paddingRight = `${getTotalWidth(this.searchActionsContainer) + 12}px`;
    this.addButtonContainer = append(this.searchAndButtonContainer, $90(".section-title-actions"));
    const buttonOptions = {
      ...defaultButtonStyles,
      supportIcons: true
    };
    this.addButton = this._register(new Button(this.addButtonContainer, buttonOptions));
    this.addButton.label = `$(${Codicon.settingsGear.id}) ${localizeModels("models.configureApiProvider", "Configure API")}`;
    this.addButton.element.classList.add("models-add-model-button");
    if (this.options.presentation === "codex") {
      this.addButtonContainer.style.display = "none";
    } else {
      this.updateAddModelsButton();
      this._register(this.addButton.onDidClick(() => this.configureOpenCodeProvider()));
    }
    this.tableContainer = append(container3, $90(".models-table-container"));
    this.createTable();
    this._register(this.viewModel.onDidChangeGrouping(() => this.createTable()));
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => {
      this.updateAddModelsButton();
      this.createTable();
    }));
    this._register(this.chatEntitlementService.onDidChangeUsageBasedBilling(() => this.createTable()));
    this._register(this.languageModelsService.onDidChangeLanguageModelVendors(() => this.updateAddModelsButton()));
    this._register(this.languageModelsService.onDidChangePinnedModels(() => this.viewModel.refresh()));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(/* @__PURE__ */ new Set(["github.copilot.clientByokEnabled"]))) {
        this.updateAddModelsButton();
      }
    }));
  }
  createProviderConfiguration(container3) {
    this.providerConfigurationContainer = append(container3, $90(".models-provider-configuration"));
    if (this.options.presentation === "codex") {
      this.createCodexAccountConfiguration();
      return;
    }
    const header2 = append(this.providerConfigurationContainer, $90(".models-provider-configuration-header"));
    this.providerFormHeading = append(header2, $90("div.models-provider-configuration-heading"));
    this.updateProviderFormHeader();
    const description = append(header2, $90("div.models-provider-configuration-description"));
    description.textContent = localizeModels("models.apiConnectionDescription", "Enter an endpoint URL and API key. Test verifies the connection; Add API creates a new provider group. Use a group's gear menu to edit, rename or delete it.");
    const fields = append(this.providerConfigurationContainer, $90(".models-provider-configuration-fields"));
    const endpointField = append(fields, $90(".models-provider-configuration-field"));
    const endpointLabel = append(endpointField, $90("label.models-provider-configuration-label"));
    endpointLabel.textContent = localizeModels("models.apiEndpoint", "API Endpoint URL");
    const endpointInputContainer = append(endpointField, $90(".models-provider-configuration-input"));
    this.endpointInput = this._register(new InputBox(endpointInputContainer, void 0, {
      placeholder: localizeModels("models.apiEndpointPlaceholder", "https://api.example.com (or /v1)"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this.endpointInput.setAriaLabel(localizeModels("models.apiEndpointAriaLabel", "API endpoint URL"));
    const protocolField = append(fields, $90(".models-provider-configuration-field"));
    const protocolLabel = append(protocolField, $90("label.models-provider-configuration-label"));
    protocolLabel.textContent = localizeModels("models.apiProtocol", "Request protocol");
    this.protocolSelect = append(protocolField, $90("select.models-provider-configuration-protocol"));
    this.protocolSelect.id = "opencode-provider-protocol";
    protocolLabel.htmlFor = this.protocolSelect.id;
    for (const [value2, label3] of [
      ["openai-chat-completions", localizeModels("models.protocolChat", "Chat Completions")],
      ["openai-responses", localizeModels("models.protocolResponses", "Responses")],
      ["auto", localizeModels("models.protocolAuto", "Auto (default): Responses, then Chat on unsupported route")]
    ]) {
      const option2 = append(this.protocolSelect, $90("option"));
      option2.value = value2;
      option2.textContent = label3;
    }
    this.protocolSelect.title = localizeModels("models.protocolAutoHelp", "Auto only falls back on HTTP 404, 405 or 501 before output. Test checks GET /models only.");
    const apiKeyField = append(fields, $90(".models-provider-configuration-field"));
    const apiKeyLabel = append(apiKeyField, $90("label.models-provider-configuration-label"));
    apiKeyLabel.textContent = localizeModels("models.apiKey", "API Key");
    const apiKeyInputContainer = append(apiKeyField, $90(".models-provider-configuration-input"));
    this.apiKeyInput = this._register(new InputBox(apiKeyInputContainer, void 0, {
      placeholder: localizeModels("models.apiKeyPlaceholder", "Paste your API key"),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this.apiKeyInput.setAriaLabel(localizeModels("models.apiKeyAriaLabel", "API key"));
    this.apiKeyInput.inputElement.type = "password";
    this.apiKeyInput.inputElement.autocomplete = "off";
    const footer = append(this.providerConfigurationContainer, $90(".models-provider-configuration-footer"));
    this.providerStatusElement = append(footer, $90("div.models-provider-configuration-status"));
    const actions = append(footer, $90(".models-provider-configuration-actions"));
    this.testProviderButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.testProviderButton.label = `$(${Codicon.debugStart.id}) ${localizeModels("models.testProvider", "Test")}`;
    this._register(this.testProviderButton.onDidClick(() => this.testProviderConnection()));
    this.addProviderButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.addProviderButton.label = `$(${Codicon.add.id}) ${localizeModels("models.addApiProvider", "Add API")}`;
    this._register(this.addProviderButton.onDidClick(() => this.addOpenCodeProvider()));
  }
  createCodexAccountConfiguration() {
    const header2 = append(this.providerConfigurationContainer, $90(".models-provider-configuration-header"));
    const heading2 = append(header2, $90("div.models-provider-configuration-heading"));
    heading2.textContent = localizeModels("models.codexAccount", "Codex Account");
    const description = append(header2, $90("div.models-provider-configuration-description"));
    description.textContent = localizeModels("models.codexAccountDescription", "Sign in with your ChatGPT subscription. Discovered Codex models become available in the Chat model picker.");
    this.codexAccountDetailsElement = append(this.providerConfigurationContainer, $90("div.models-codex-account-details"));
    const footer = append(this.providerConfigurationContainer, $90(".models-provider-configuration-footer.models-codex-account-footer"));
    this.providerStatusElement = append(footer, $90("div.models-provider-configuration-status"));
    const actions = append(footer, $90(".models-provider-configuration-actions"));
    this.refreshProviderButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.refreshProviderButton.label = `$(${Codicon.refresh.id}) ${localizeModels("models.refreshModels", "Refresh Models")}`;
    this._register(this.refreshProviderButton.onDidClick(() => this.refreshCodexModels(true)));
    this.codexReloginButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.codexReloginButton.label = `$(${Codicon.sync.id}) ${localizeModels("models.codexSignInAgain", "Sign In Again")}`;
    this._register(this.codexReloginButton.onDidClick(() => this.runCodexAccountCommand("opencode.codex.relogin")));
    this.codexSignOutButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.codexSignOutButton.label = `$(${Codicon.signOut.id}) ${localizeModels("models.codexSignOut", "Sign Out")}`;
    this._register(this.codexSignOutButton.onDidClick(() => this.runCodexAccountCommand("opencode.codex.logout")));
    this.codexSignInButton = this._register(new Button(actions, { ...defaultButtonStyles, supportIcons: true }));
    this.codexSignInButton.label = `$(${Codicon.account.id}) ${localizeModels("models.codexSignIn", "Sign In")}`;
    this._register(this.codexSignInButton.onDidClick(() => this.runCodexAccountCommand("opencode.codex.login")));
  }
  createTable() {
    this.tableDisposables.clear();
    clearNode(this.tableContainer);
    this.tableViewport = $90(".models-table-viewport");
    this.tableInner = append(this.tableViewport, $90(".models-table-inner"));
    this.tableScrollable = this.tableDisposables.add(new DomScrollableElement(this.tableViewport, {
      horizontal: 1 /* Auto */,
      vertical: 2 /* Hidden */,
      useShadows: false,
      scrollYToX: true
    }));
    this.tableContainer.appendChild(this.tableScrollable.getDomNode());
    const gutterColumnRenderer = this.instantiationService.createInstance(GutterColumnRenderer, this.viewModel);
    const modelNameColumnRenderer = this.instantiationService.createInstance(ModelNameColumnRenderer);
    const combinedCostColumnRenderer = this.instantiationService.createInstance(CombinedCostColumnRenderer);
    const tokenLimitsColumnRenderer = this.instantiationService.createInstance(TokenLimitsColumnRenderer);
    const capabilitiesColumnRenderer = this.instantiationService.createInstance(CapabilitiesColumnRenderer);
    const actionsColumnRenderer = this.instantiationService.createInstance(ActionsColumnRenderer2, this.viewModel, (groupName) => this.editProviderInForm(groupName));
    const providerColumnRenderer = this.instantiationService.createInstance(ProviderColumnRenderer);
    this.tableDisposables.add(capabilitiesColumnRenderer);
    this.tableDisposables.add(capabilitiesColumnRenderer.onDidClickCapability((capability) => {
      const currentQuery = this.searchWidget.getValue();
      const query = `@capability:${capability}`;
      const newQuery = toggleFilter(currentQuery, { query });
      this.search(newQuery);
    }));
    const columns = [
      {
        label: "",
        tooltip: "",
        weight: 0.05,
        minimumWidth: 64,
        maximumWidth: 64,
        templateId: GutterColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: localizeModels("modelName", "Name"),
        tooltip: "",
        weight: 0.42,
        minimumWidth: 240,
        templateId: ModelNameColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      }
    ];
    const isUBB = this.chatEntitlementService.quotas.usageBasedBilling === true;
    columns.push(
      {
        label: localizeModels("tokenLimits", "Context Size"),
        tooltip: "",
        weight: 0.1,
        minimumWidth: 140,
        templateId: TokenLimitsColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: localizeModels("capabilities", "Capabilities"),
        tooltip: "",
        weight: 0.15,
        minimumWidth: 180,
        templateId: CapabilitiesColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: isUBB ? localizeModels("cost", "Cost (Credits per 1M Tokens)") : localizeModels("pricing", "Pricing"),
        tooltip: "",
        weight: isUBB ? 0.24 : 0.15,
        minimumWidth: isUBB ? 240 : 200,
        templateId: CombinedCostColumnRenderer.TEMPLATE_ID,
        project(row) {
          return row;
        }
      },
      {
        label: "",
        tooltip: "",
        weight: 0.05,
        minimumWidth: 64,
        maximumWidth: 64,
        templateId: ActionsColumnRenderer2.TEMPLATE_ID,
        project(row) {
          return row;
        }
      }
    );
    this.tableMinWidth = columns.reduce((sum2, c) => sum2 + c.minimumWidth, 0);
    this.tableInner.style.minWidth = `${this.tableMinWidth}px`;
    this.table = this.tableDisposables.add(this.instantiationService.createInstance(
      WorkbenchTable,
      "ModelsWidget",
      this.tableInner,
      new Delegate4(),
      columns,
      [
        gutterColumnRenderer,
        modelNameColumnRenderer,
        combinedCostColumnRenderer,
        tokenLimitsColumnRenderer,
        capabilitiesColumnRenderer,
        actionsColumnRenderer,
        providerColumnRenderer
      ],
      {
        identityProvider: { getId: (e) => e.id },
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel: (e) => {
            if (isLanguageModelProviderEntry(e)) {
              return e.hidden ? localizeModels("vendor.hidden.ariaLabel", "{0} Models (hidden)", e.vendorEntry.group.name) : localizeModels("vendor.ariaLabel", "{0} Models", e.vendorEntry.group.name);
            } else if (isLanguageModelGroupEntry(e)) {
              return e.id === "visible" ? localizeModels("visible.ariaLabel", "Visible Models") : localizeModels("hidden.ariaLabel", "Hidden Models");
            } else if (isStatusEntry(e)) {
              return localizeModels("status.ariaLabel", "Status: {0}", e.message);
            }
            const ariaLabels = [];
            ariaLabels.push(e.model.hidden ? localizeModels("model.name.hidden", "{0} from {1} (hidden)", e.model.metadata.name, getManageModelsProviderLabel(e.model)) : localizeModels("model.name", "{0} from {1}", e.model.metadata.name, getManageModelsProviderLabel(e.model)));
            if (e.model.metadata.maxInputTokens || e.model.metadata.maxOutputTokens) {
              const totalTokens = (e.model.metadata.maxInputTokens ?? 0) + (e.model.metadata.maxOutputTokens ?? 0);
              ariaLabels.push(localizeModels("model.contextSize.totalTokens", "Context size: {0} tokens", formatTokenCount(totalTokens)));
            }
            if (e.model.metadata.capabilities) {
              ariaLabels.push(localizeModels("model.capabilities", "Capabilities: {0}", Object.keys(e.model.metadata.capabilities).join(", ")));
            }
            const pricingText = e.model.metadata.pricing ?? "-";
            if (pricingText !== "-") {
              ariaLabels.push(localizeModels("pricing.ariaLabel", "Pricing: {0}", pricingText));
            }
            if (e.model.metadata.inputCost !== void 0) {
              ariaLabels.push(e.model.metadata.inputCost === 1 ? localizeModels("inputCost.ariaLabel.singular", "Input cost: {0} credit per 1M tokens", e.model.metadata.inputCost) : localizeModels("inputCost.ariaLabel.plural", "Input cost: {0} credits per 1M tokens", e.model.metadata.inputCost));
            }
            if (e.model.metadata.cacheCost !== void 0) {
              ariaLabels.push(e.model.metadata.cacheCost === 1 ? localizeModels("cacheCost.ariaLabel.singular", "Cache read cost: {0} credit per 1M tokens", e.model.metadata.cacheCost) : localizeModels("cacheCost.ariaLabel.plural", "Cache read cost: {0} credits per 1M tokens", e.model.metadata.cacheCost));
            }
            if (e.model.metadata.cacheWriteCost !== void 0) {
              ariaLabels.push(e.model.metadata.cacheWriteCost === 1 ? localizeModels("cacheWriteCost.ariaLabel.singular", "Cache write cost: {0} credit per 1M tokens", e.model.metadata.cacheWriteCost) : localizeModels("cacheWriteCost.ariaLabel.plural", "Cache write cost: {0} credits per 1M tokens", e.model.metadata.cacheWriteCost));
            }
            if (e.model.metadata.outputCost !== void 0) {
              ariaLabels.push(e.model.metadata.outputCost === 1 ? localizeModels("outputCost.ariaLabel.singular", "Output cost: {0} credit per 1M tokens", e.model.metadata.outputCost) : localizeModels("outputCost.ariaLabel.plural", "Output cost: {0} credits per 1M tokens", e.model.metadata.outputCost));
            }
            return ariaLabels.join(". ");
          },
          getWidgetAriaLabel: () => localizeModels("modelsTable.ariaLabel", "Language Models")
        },
        multipleSelectionSupport: true,
        setRowLineHeight: false,
        openOnSingleClick: true,
        alwaysConsumeMouseWheel: false
      }
    ));
    this.tableDisposables.add(this.table.onContextMenu((e) => {
      if (!e.element) {
        return;
      }
      const selection = this.table.getSelection();
      const selectedEntries = isLanguageModelProviderEntry(e.element) ? [e.element] : selection.every((i2) => i2 !== e.index) ? [e.element] : selection.map((i2) => this.viewModel.viewModelEntries[i2]).filter((e2) => !!e2);
      const selectedModelEntries = selectedEntries.filter(
        (entry) => !isLanguageModelProviderEntry(entry) && !isLanguageModelGroupEntry(entry) && !isStatusEntry(entry)
      );
      const actions = [];
      let configureGroup;
      let configureVendor;
      if (selectedModelEntries.length) {
        if (selectedModelEntries.length === 1 && selectedModelEntries[0].model.provider.group.vendor === "opencode") {
          const model = selectedModelEntries[0];
          for (const [id2, label3, step] of [
            ["modelUp", localizeModels("models.moveModelUp", "Move model up"), -1],
            ["modelDown", localizeModels("models.moveModelDown", "Move model down"), 1],
            ["modelTop", localizeModels("models.moveModelTop", "Move model to top"), -1e5]
          ]) {
            actions.push(toAction({ id: id2, label: label3, run: () => this.viewModel.moveModel(model, step) }));
          }
          actions.push(new Separator());
        }
        const pinnableEntries = selectedModelEntries.filter((e2) => e2.model.metadata.id !== "auto");
        if (pinnableEntries.length > 0) {
          const allPinned = pinnableEntries.every((e2) => this.languageModelsService.isModelPinned(e2.model.identifier));
          actions.push(toAction({
            id: allPinned ? "unpinModels" : "pinModels",
            label: allPinned ? localizeModels("models.unpinModel", "Unpin Model") : localizeModels("models.pinModel", "Pin Model"),
            class: ThemeIcon.asClassName(allPinned ? Codicon.pinned : Codicon.pin),
            run: () => {
              for (const entry of pinnableEntries) {
                if (allPinned) {
                  this.languageModelsService.unpinModel(entry.model.identifier);
                } else {
                  this.languageModelsService.pinModel(entry.model.identifier);
                }
              }
            }
          }));
        }
        const allHidden = selectedModelEntries.every((e2) => e2.model.hidden);
        actions.push(toAction({
          id: allHidden ? "showModels" : "hideModels",
          label: allHidden ? selectedModelEntries.length === 1 ? localizeModels("models.showModel", "Show Model") : localizeModels("models.showModelsPlural", "Show Models") : selectedModelEntries.length === 1 ? localizeModels("models.hideModel", "Hide Model") : localizeModels("models.hideModelsPlural", "Hide Models"),
          class: ThemeIcon.asClassName(allHidden ? Codicon.eyeClosed : Codicon.eye),
          run: () => this.viewModel.setModelsHidden(selectedModelEntries, !allHidden)
        }));
        if (selectedModelEntries.length === 1) {
          const configActions = this.languageModelsService.getModelConfigurationActions(selectedModelEntries[0].model.identifier);
          if (configActions.length) {
            actions.push(new Separator());
            actions.push(...configActions);
          }
        }
        configureGroup = selectedModelEntries[0].model.provider.group.name;
        configureVendor = selectedModelEntries[0].model.provider.vendor;
        if (selectedModelEntries.some((entry) => entry.model.provider.vendor.isDefault || entry.model.provider.group.name !== configureGroup)) {
          configureGroup = void 0;
          configureVendor = void 0;
        }
      } else if (selectedEntries.length === 1) {
        const entry = e.element;
        if (isLanguageModelProviderEntry(entry)) {
          configureGroup = entry.vendorEntry.group.name;
          configureVendor = entry.vendorEntry.vendor;
          if (entry.vendorEntry.group.vendor === "opencode") {
            for (const [id2, label3, step] of [
              ["channelUp", localizeModels("models.moveChannelUp", "Move channel up"), -1],
              ["channelDown", localizeModels("models.moveChannelDown", "Move channel down"), 1],
              ["channelTop", localizeModels("models.moveChannelTop", "Move channel to top"), -1e5]
            ]) {
              actions.push(toAction({ id: id2, label: label3, run: () => this.viewModel.moveChannel(entry, step) }));
            }
            actions.push(new Separator());
          }
          actions.push(toAction({
            id: entry.hidden ? "showGroup" : "hideGroup",
            label: entry.hidden ? localizeModels("models.showGroup", "Show All Models") : localizeModels("models.hideGroup", "Hide All Models"),
            class: ThemeIcon.asClassName(entry.hidden ? Codicon.eyeClosed : Codicon.eye),
            run: () => this.viewModel.toggleGroupHidden(entry)
          }));
        }
      }
      if (configureGroup && configureVendor) {
        const groupActions = configureVendor.managementCommand ? [toAction({
          id: "manageVendor",
          label: localizeModels("models.manageProvider", "Manage {0}...", configureGroup),
          run: async () => {
            await this.commandService.executeCommand(configureVendor.managementCommand, configureVendor.vendor);
            await this.viewModel.refresh();
          }
        })] : createProviderGroupActions(this.viewModel, configureVendor, configureGroup, this.languageModelsService, this.dialogService, (groupName) => this.editProviderInForm(groupName));
        if (groupActions.length) {
          if (actions.length) {
            actions.push(new Separator());
          }
          actions.push(...groupActions);
        }
      }
      if (actions.length > 0) {
        this.contextMenuService.showContextMenu({
          getAnchor: () => e.anchor,
          getActions: () => actions
        });
      }
    }));
    this.table.splice(0, this.table.length, this.getDisplayedModelEntries());
    this._onDidChangeItemCount.fire(this.itemCount);
    this.tableDisposables.add(this.viewModel.onDidChange(() => {
      const displayedEntries = this.getDisplayedModelEntries();
      this.table.splice(0, this.table.length, displayedEntries);
      this._onDidChangeItemCount.fire(this.itemCount);
      if (this.viewModel.selectedEntry) {
        const selectedEntryIndex = displayedEntries.findIndex((entry) => entry.id === this.viewModel.selectedEntry?.id);
        if (selectedEntryIndex >= 0) {
          this.table.setFocus([selectedEntryIndex]);
          this.table.setSelection([selectedEntryIndex]);
        }
      }
    }));
    this.tableDisposables.add(this.table.onDidOpen(async ({ element, browserEvent }) => {
      if (!element) {
        return;
      }
      if (isStatusEntry(element)) {
        return;
      }
      if (isLanguageModelProviderEntry(element) || isLanguageModelGroupEntry(element)) {
        this.viewModel.toggleCollapsed(element);
      }
    }));
    this.tableDisposables.add(this.table.onDidChangeSelection((e) => this.viewModel.selectedEntry = e.elements[0]));
    this.tableDisposables.add(this.table.onDidBlur(() => {
      if (this.viewModel.shouldRefilter()) {
        this.viewModel.filter(this.searchWidget.getValue());
      }
    }));
    this.layout(this.element.clientHeight, this.element.clientWidth);
  }
  getDisplayedModelEntries() {
    return this.viewModel.viewModelEntries.filter((entry) => {
      if (entry.type === "model") {
        return entry.model.provider.vendor.vendor === this.options.vendor;
      }
      if (entry.type === "vendor") {
        return entry.vendorEntry.vendor.vendor === this.options.vendor;
      }
      if (entry.type === "status") {
        return entry.id.startsWith(`status.${this.options.vendor}-`);
      }
      return false;
    });
  }
  updateAddModelsButton() {
    if (this.options.presentation === "codex") {
      return;
    }
    const configurableVendors = this.languageModelsService.getVendors().filter((vendor) => vendor.managementCommand || vendor.configuration);
    const provider = configurableVendors.find((vendor) => vendor.vendor === this.options.vendor);
    this.addButton.enabled = !!provider;
    this.addButton.setTitle(provider ? localizeModels("models.configureApiProviderTitle", "Set the API endpoint and API key. Models are discovered automatically.") : localizeModels("models.apiProviderUnavailable", "API provider is unavailable."));
  }
  setProviderStatus(message, state = "normal") {
    this.providerStatusElement.textContent = message;
    this.providerStatusElement.classList.toggle("success", state === "success");
    this.providerStatusElement.classList.toggle("error", state === "error");
    this.relayout();
  }
  relayout() {
    if (this.element.isConnected && this.element.clientWidth > 0 && this.element.clientHeight > 0) {
      this.layout(this.element.clientHeight, this.element.clientWidth);
    }
  }
  setCodexButtonsEnabled(enabled) {
    this.refreshProviderButton.enabled = enabled && !this.codexRefreshInProgress;
    if (this.codexSignInButton) {
      this.codexSignInButton.enabled = enabled;
    }
    if (this.codexSignOutButton) {
      this.codexSignOutButton.enabled = enabled;
    }
    if (this.codexReloginButton) {
      this.codexReloginButton.enabled = enabled;
    }
  }
  async loadCodexAccountStatus() {
    if (this.options.presentation !== "codex" || !this.codexAccountDetailsElement) {
      return;
    }
    const request2 = ++this.codexStatusRequest;
    try {
      const status2 = await this.commandService.executeCommand("opencode.codex.getStatus");
      if (request2 !== this.codexStatusRequest) return;
      const signedIn = status2?.signedIn === true;
      this.codexSignInButton?.element.classList.toggle("hidden", signedIn);
      this.codexSignOutButton?.element.classList.toggle("hidden", !signedIn);
      this.codexReloginButton?.element.classList.toggle("hidden", !signedIn);
      if (!signedIn) {
        this.codexAccountDetailsElement.textContent = localizeModels("models.codexSignedOutDetails", "No Codex account is signed in.");
        this.setProviderStatus(localizeModels("models.codexSignedOut", "Sign in to discover Codex models."));
        return;
      }
      const account = status2?.account;
      const identity2 = account?.email || account?.accountId || localizeModels("models.codexAccountFallback", "Codex account");
      const details = [identity2];
      if (account?.planType) {
        details.push(localizeModels("models.codexPlan", "Plan: {0}", account.planType));
      }
      if (status2?.expiresAt) {
        details.push(localizeModels("models.codexTokenExpiry", "Access token expires: {0}", new Date(status2.expiresAt * 1e3).toLocaleString()));
      }
      this.codexAccountDetailsElement.textContent = details.join(" \xB7 ");
      this.setProviderStatus(localizeModels("models.codexSignedIn", "Signed in. Refresh models after changing accounts."), "success");
    } catch (error) {
      if (request2 !== this.codexStatusRequest) return;
      this.codexAccountDetailsElement.textContent = localizeModels("models.codexStatusUnavailable", "Codex account status is unavailable.");
      this.setProviderStatus(getErrorMessage(error), "error");
    }
  }
  async runCodexAccountCommand(command4) {
    this.setCodexButtonsEnabled(false);
    let refresh = false;
    try {
      await this.commandService.executeCommand(command4);
      void this.loadCodexAccountStatus();
      refresh = true;
    } catch (error) {
      const message = getErrorMessage(error);
      this.setProviderStatus(message, "error");
      this.notificationService.error(message);
    } finally {
      this.setCodexButtonsEnabled(true);
    }
    if (refresh) {
      void this.refreshCodexModels(false);
    }
  }
  async refreshCodexModels(showSuccess) {
    if (this.options.presentation !== "codex") {
      return;
    }
    if (this.codexRefreshInProgress) {
      this.codexRefreshQueued = true;
      return;
    }
    this.codexRefreshInProgress = true;
    this.refreshProviderButton.enabled = false;
    this.setProviderStatus(localizeModels("models.loadingCodexModels", "Loading Codex models\u2026"));
    let timeout2;
    try {
      const models = await Promise.race([
        (async () => {
          const discovered = await this.languageModelsService.selectLanguageModels({ vendor: this.options.vendor });
          await this.viewModel.refresh();
          return discovered;
        })(),
        new Promise((_, reject) => {
          timeout2 = setTimeout(() => reject(new Error(localizeModels("models.codexRefreshTimedOut", "Codex model refresh timed out. Check the connection and try again."))), 6e4);
        })
      ]);
      if (showSuccess) {
        this.setProviderStatus(localizeModels("models.codexModelsRefreshedWithCount", "{0} Codex models loaded.", models.length), "success");
      }
    } catch (error) {
      const message = getErrorMessage(error);
      this.setProviderStatus(message, "error");
      if (showSuccess) {
        this.notificationService.error(message);
      }
    } finally {
      if (timeout2) clearTimeout(timeout2);
      this.codexRefreshInProgress = false;
      this.refreshProviderButton.enabled = true;
      if (!showSuccess) {
        void this.loadCodexAccountStatus();
      }
      if (this.codexRefreshQueued) {
        this.codexRefreshQueued = false;
        void this.refreshCodexModels(false);
      }
    }
  }
  async loadOpenCodeProviderConfiguration() {
    const getConfiguration = this.languageModelsService.getLanguageModelsProviderConfiguration;
    if (!getConfiguration) {
      this.setProviderStatus(localizeModels("models.inlineConfigurationUnavailable", "Use Configure API to edit this provider."));
      return;
    }
    try {
      const configuration2 = await getConfiguration.call(this.languageModelsService, this.options.vendor);
      this.editingGroupName = void 0;
      this.updateProviderFormHeader();
      this.endpointInput.value = "";
      this.protocolSelect.value = "auto";
      this.apiKeyConfigured = configuration2?.configuredSecretKeys.includes("apiKey") ?? false;
      this.apiKeyInput.value = "";
      this.apiKeyInput.setPlaceHolder(this.apiKeyConfigured ? localizeModels("models.savedApiKeyPlaceholder", "Saved securely \u2014 leave blank to keep it") : localizeModels("models.apiKeyPlaceholder", "Paste your API key"));
      this.setProviderStatus(localizeModels("models.providerFormHint", "Enter an endpoint URL and API key, then click Add API. Use a provider's gear menu to edit it."), "normal");
    } catch (error) {
      this.setProviderStatus(getErrorMessage(error), "error");
    }
  }
  async testProviderConnection() {
    const endpoint = this.endpointInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();
    if (!endpoint) {
      this.endpointInput.focus();
      this.setProviderStatus(localizeModels("models.enterApiEndpoint", "Enter an API endpoint URL."), "error");
      return false;
    }
    try {
      const parsed = new URL(endpoint);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(localizeModels("models.invalidApiEndpointProtocol", "The API endpoint must use http or https."));
      }
    } catch (error) {
      this.endpointInput.focus();
      this.setProviderStatus(error instanceof Error ? error.message : localizeModels("models.invalidApiEndpoint", "Enter a valid API endpoint URL."), "error");
      return false;
    }
    this.setProviderStatus(localizeModels("models.testingProvider", "Testing connection\u2026"));
    try {
      const testConnection = this.languageModelsService.testLanguageModelsProviderConnection;
      if (!testConnection) {
        throw new Error(localizeModels("models.inlineConfigurationUnavailable", "Use Configure API to edit this provider."));
      }
      const result = await testConnection.call(this.languageModelsService, this.options.vendor, endpoint, apiKey, this.editingGroupName, this.protocolSelect.value);
      if (!result?.ok) {
        const reason = result?.error === "saved_key_endpoint_changed" ? localizeModels("models.savedKeyEndpointChanged", "Re-enter the API key when changing the scheme, host or port. The saved key was not sent to the new origin.") : result?.error ?? "Unknown error";
        this.setProviderStatus(localizeModels("models.testFailed", "Connection failed: {0}", reason), "error");
        return false;
      }
      this.setProviderStatus(localizeModels("models.testSucceededWithCount", "Model list connected: {0} models. Request protocol is checked on the first real request.", result.count ?? 0), "success");
      return true;
    } catch (error) {
      this.setProviderStatus(localizeModels("models.testFailed", "Connection failed: {0}", getErrorMessage(error)), "error");
      return false;
    }
  }
  filterModels() {
    this.delayedFiltering.trigger(() => {
      this.viewModel.filter(this.searchWidget.getValue());
    });
  }
  configureOpenCodeProvider() {
    this.editingGroupName = void 0;
    this.updateProviderFormHeader();
    this.endpointInput.value = "";
    this.protocolSelect.value = "auto";
    this.apiKeyInput.value = "";
    this.apiKeyInput.setPlaceHolder(this.apiKeyConfigured ? localizeModels("models.savedApiKeyPlaceholder", "Saved securely \u2014 leave blank to keep it") : localizeModels("models.apiKeyPlaceholder", "Paste your API key"));
    this.setProviderStatus(localizeModels("models.enterNewProvider", "Enter an endpoint URL and API key, then click Add API."), "normal");
    this.endpointInput.focus();
  }
  updateProviderFormHeader() {
    if (!this.providerFormHeading) {
      return;
    }
    this.providerFormHeading.textContent = this.editingGroupName ? localizeModels("models.editApiConnection", "Edit API Provider: {0}", this.editingGroupName) : localizeModels("models.addApiConnection", "Add API Provider");
    if (this.addProviderButton) {
      this.addProviderButton.label = this.editingGroupName ? `$(${Codicon.save.id}) ${localizeModels("models.saveChanges", "Save Changes")}` : `$(${Codicon.add.id}) ${localizeModels("models.addApiProvider", "Add API")}`;
    }
  }
  ensureUniqueProviderName(baseName) {
    const existingNames = /* @__PURE__ */ new Set();
    for (const group2 of this.languageModelsService.getLanguageModelGroups(this.options.vendor)) {
      if (group2.group?.name) {
        existingNames.add(group2.group.name);
      }
    }
    let name = baseName;
    let index2 = 2;
    while (existingNames.has(name)) {
      name = `${baseName}-${index2++}`;
    }
    return name;
  }
  async addOpenCodeProvider() {
    const endpoint = this.endpointInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();
    if (!endpoint) {
      this.endpointInput.focus();
      this.setProviderStatus(localizeModels("models.enterApiEndpoint", "Enter an API endpoint URL."), "error");
      return;
    }
    try {
      const parsed = new URL(endpoint);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error(localizeModels("models.invalidApiEndpointProtocol", "The API endpoint must use http or https."));
      }
    } catch (error) {
      this.endpointInput.focus();
      this.setProviderStatus(error instanceof Error ? error.message : localizeModels("models.invalidApiEndpoint", "Enter a valid API endpoint URL."), "error");
      return;
    }
    let name = this.editingGroupName;
    if (!name) {
      const baseName = deriveProviderNameFromUrl(endpoint);
      if (!baseName) {
        this.endpointInput.focus();
        this.setProviderStatus(localizeModels("models.unableToDeriveProviderName", "Could not derive a provider name from the endpoint URL."), "error");
        return;
      }
      name = this.ensureUniqueProviderName(baseName);
    }
    this.addProviderButton.enabled = false;
    this.testProviderButton.enabled = false;
    try {
      if (!await this.testProviderConnection()) {
        return;
      }
      this.setProviderStatus(this.editingGroupName ? localizeModels("models.savingProvider", "Saving {0} and loading models\u2026", this.editingGroupName) : localizeModels("models.addingProvider", "Adding {0} and loading models\u2026", name));
      const values = { baseUrl: endpoint, protocol: this.protocolSelect.value };
      if (apiKey) {
        values.apiKey = apiKey;
      }
      if (this.editingGroupName) {
        const setConfiguration = this.languageModelsService.setLanguageModelsProviderConfiguration;
        if (!setConfiguration) {
          this.setProviderStatus(localizeModels("models.inlineConfigurationUnavailable", "Use Configure API to edit this provider."), "error");
          return;
        }
        await setConfiguration.call(this.languageModelsService, this.options.vendor, values, this.editingGroupName);
      } else {
        await this.languageModelsService.addLanguageModelsProviderGroup(name, this.options.vendor, values);
      }
      const models = await this.languageModelsService.selectLanguageModels({ vendor: this.options.vendor });
      await this.viewModel.refresh();
      this.apiKeyConfigured = this.apiKeyConfigured || !!apiKey;
      this.apiKeyInput.value = "";
      this.endpointInput.value = "";
      this.editingGroupName = void 0;
      this.updateProviderFormHeader();
      this.setProviderStatus(localizeModels("models.providerAddedWithCount", "Added {0}. {1} models loaded.", name, models.length), "success");
    } catch (error) {
      const message = getErrorMessage(error);
      this.setProviderStatus(message, "error");
      this.notificationService.error(message);
    } finally {
      this.addProviderButton.enabled = true;
      this.testProviderButton.enabled = true;
    }
  }
  async editProviderInForm(groupName) {
    const getConfiguration = this.languageModelsService.getLanguageModelsProviderConfiguration;
    if (!getConfiguration) {
      this.setProviderStatus(localizeModels("models.inlineConfigurationUnavailable", "Use Configure API to edit this provider."));
      return;
    }
    try {
      const configuration2 = await getConfiguration.call(this.languageModelsService, this.options.vendor, groupName);
      if (!configuration2) {
        this.setProviderStatus(localizeModels("models.providerConfigurationMissing", "No configuration found for {0}.", groupName), "error");
        return;
      }
      this.editingGroupName = groupName;
      this.endpointInput.value = typeof configuration2.values.baseUrl === "string" ? configuration2.values.baseUrl : "";
      this.protocolSelect.value = ["auto", "openai-responses"].includes(String(configuration2.values.protocol)) ? String(configuration2.values.protocol) : "openai-chat-completions";
      this.apiKeyConfigured = configuration2.configuredSecretKeys.includes("apiKey");
      this.apiKeyInput.value = "";
      this.apiKeyInput.setPlaceHolder(this.apiKeyConfigured ? localizeModels("models.savedApiKeyPlaceholder", "Saved securely \u2014 leave blank to keep it") : localizeModels("models.apiKeyPlaceholder", "Paste your API key"));
      this.updateProviderFormHeader();
      this.setProviderStatus(localizeModels("models.editingProvider", "Editing {0}. Change the URL or API key, then click Save Changes.", groupName), "normal");
    } catch (error) {
      this.setProviderStatus(getErrorMessage(error), "error");
    }
  }
  layout(height, width2) {
    const style = getWindow(this.element).getComputedStyle(this.element);
    const horizontalPadding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    width2 = Math.max(0, width2 - horizontalPadding);
    const searchWidth = Math.max(0, width2 - this.searchActionsContainer.clientWidth - this.addButtonContainer.clientWidth - 8);
    this.searchWidget.layout(new Dimension(searchWidth, 22));
    const fixedHeight = getTotalHeight(this.providerConfigurationContainer) + getTotalHeight(this.searchAndButtonContainer);
    const tableHeight = Math.max(MIN_TABLE_HEIGHT, height - fixedHeight);
    this.tableContainer.style.height = `${tableHeight}px`;
    const tableWidth = Math.max(width2, this.tableMinWidth);
    this.table.layout(tableHeight, tableWidth);
    this.tableScrollable?.scanDomNode();
  }
  focusSearch() {
    this.searchWidget.focus();
  }
  search(filter2) {
    this.focusSearch();
    this.searchWidget.setValue(filter2);
    this.viewModel.filter(filter2);
  }
  clearSearch() {
    this.focusSearch();
    this.searchWidget.setValue("");
  }
  render() {
    if (this.options.presentation === "codex") {
      void this.loadCodexAccountStatus();
    }
    if (this.viewModel.shouldRefilter()) {
      this.viewModel.filter(this.searchWidget.getValue());
    }
  }
  /**
   * Gets the total model count (excluding vendor/group/status headers).
   */
  get itemCount() {
    return this.getDisplayedModelEntries().filter((entry) => entry.type === "model").length;
  }
  /**
   * Re-fires the current item count. Call after subscribing to onDidChangeItemCount
   * to ensure the subscriber receives the latest count.
   */
  fireItemCount() {
    this._onDidChangeItemCount.fire(this.itemCount);
  }
};

ChatModelsWidget = __decorateClass([
  __decorateParam(1, ILanguageModelsService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IChatEntitlementService),
  __decorateParam(6, IEditorProgressService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, INotificationService)
], ChatModelsWidget);
export { toggleFilter, deriveProviderNameFromUrl, createProviderGroupActions, $90, HEADER_HEIGHT, VENDOR_ROW_HEIGHT, MODEL_ROW_HEIGHT, MIN_TABLE_HEIGHT, ModelsFilterAction, ModelsSearchFilterDropdownMenuActionViewItem, Delegate4, ModelsTableColumnRenderer, GutterColumnRenderer, ModelNameColumnRenderer, CombinedCostColumnRenderer, TokenLimitsColumnRenderer, CapabilitiesColumnRenderer, ActionsColumnRenderer2, ProviderColumnRenderer, ChatModelsWidget };
