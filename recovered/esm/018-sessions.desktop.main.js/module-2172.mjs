// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatContextUsageDetails.ts
import { $, clearNode } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { WorkbenchButtonBar } from "./module-1988.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { autorun } from "./module-0052.mjs";
import { toAction } from "./module-0082.mjs";
import { formatCopilotCreditsLabel } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatContextUsageDetails.ts
var $40 = $;

var COMPACT_AGENT_HOST_CONVERSATION_ACTION_ID = "workbench.action.chat.compactAgentHostConversation";

var ChatContextUsageDetails = class extends Disposable {
  constructor(_chatWidget, _dataObservable, instantiationService, menuService, contextKeyService) {
    super();
    this._chatWidget = _chatWidget;
    this._dataObservable = _dataObservable;
    this.instantiationService = instantiationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.domNode = $40(".chat-context-usage-details");
    const topHeader = this.domNode.appendChild($40("div.header"));
    topHeader.textContent = localize(12695, null);
    this.sessionCostSection = this.domNode.appendChild($40(".session-cost-section"));
    this.sessionCostSection.style.display = "none";
    const sessionCostRow = this.sessionCostSection.appendChild($40(".session-cost-row"));
    const sessionCostLabel = sessionCostRow.appendChild($40("span.session-cost-label"));
    sessionCostLabel.textContent = localize(12694, null);
    this.sessionCostValue = sessionCostRow.appendChild($40("span.session-cost-value"));
    this.quotaItem = this.domNode.appendChild($40(".quota-indicator"));
    const header2 = this.domNode.insertBefore($40("div.header"), this.quotaItem);
    header2.textContent = localize(12689, null);
    const quotaLabel = this.quotaItem.appendChild($40(".quota-label"));
    this.tokenCountLabel = quotaLabel.appendChild($40("span"));
    this.percentageLabel = quotaLabel.appendChild($40("span.quota-value"));
    const progressBar = this.quotaItem.appendChild($40(".quota-bar"));
    this.progressFill = progressBar.appendChild($40(".quota-bit"));
    this.outputBufferFill = progressBar.appendChild($40(".quota-bit.output-buffer"));
    this.outputBufferLegend = this.quotaItem.appendChild($40(".output-buffer-legend"));
    this.outputBufferLegend.appendChild($40(".output-buffer-swatch"));
    const legendLabel = this.outputBufferLegend.appendChild($40("span"));
    legendLabel.textContent = localize(12691, null);
    this.outputBufferLegend.style.display = "none";
    this.tokenDetailsContainer = this.domNode.appendChild($40(".token-details-container"));
    this.warningMessage = this.domNode.appendChild($40("div.description"));
    this.warningMessage.textContent = localize(12692, null);
    this.warningMessage.style.display = "none";
    this.actionsSection = this.domNode.appendChild($40(".actions-section"));
    const buttonBarContainer = this.actionsSection.appendChild($40(".button-bar-container"));
    const buttonBar = this._register(this.instantiationService.createInstance(WorkbenchButtonBar, buttonBarContainer, {
      buttonConfigProvider: () => ({ isSecondary: true })
    }));
    const menu = this._register(this.menuService.createMenu(MenuId.ChatContextUsageActions, this.contextKeyService));
    const updateActions = () => {
      const actions = getActionBarActions(menu.getActions({ shouldForwardArgs: true }), () => true);
      const primaryActions = actions.primary.map((action) => this.withActionContext(action));
      const secondaryActions = actions.secondary.map((action) => this.withActionContext(action));
      buttonBar.update(primaryActions, secondaryActions);
      this.actionsSection.style.display = primaryActions.length > 0 || secondaryActions.length > 0 ? "" : "none";
    };
    this._register(menu.onDidChange(updateActions));
    updateActions();
    this._register(autorun((reader) => {
      const data = this._dataObservable.read(reader);
      if (data) {
        this._render(data);
      }
    }));
  }
  setChatWidget(widget) {
    this._chatWidget = widget;
  }
  withActionContext(action) {
    if (action.id !== COMPACT_AGENT_HOST_CONVERSATION_ACTION_ID) {
      return action;
    }
    return toAction({
      id: action.id,
      label: action.label,
      tooltip: action.tooltip,
      class: action.class,
      enabled: action.enabled,
      checked: action.checked,
      run: () => action.run(this._chatWidget)
    });
  }
  _render(data) {
    const { percentage, usedTokens, totalContextWindow, outputBufferPercentage, promptTokenDetails, sessionCost } = data;
    if (typeof sessionCost === "number" && sessionCost > 0) {
      this.sessionCostValue.textContent = formatCopilotCreditsLabel(sessionCost);
      this.sessionCostSection.style.display = "";
    } else {
      this.sessionCostSection.style.display = "none";
    }
    this.tokenCountLabel.textContent = localize(
      12696,
      null,
      this.formatTokenCount(usedTokens, 1),
      this.formatTokenCount(totalContextWindow, 0)
    );
    this.percentageLabel.textContent = localize(12693, null, Math.min(100, percentage).toFixed(0));
    const usageBarWidth = Math.max(0, Math.min(100, percentage));
    this.progressFill.style.width = `${usageBarWidth}%`;
    if (outputBufferPercentage !== void 0 && outputBufferPercentage > 0) {
      this.outputBufferFill.style.width = `${Math.max(0, Math.min(100 - usageBarWidth, outputBufferPercentage))}%`;
      this.outputBufferFill.style.display = "";
      this.outputBufferLegend.style.display = "";
    } else {
      this.outputBufferFill.style.width = "0";
      this.outputBufferFill.style.display = "none";
      this.outputBufferLegend.style.display = "none";
    }
    this.quotaItem.classList.remove("warning", "error");
    if (percentage >= 90) {
      this.quotaItem.classList.add("error");
    } else if (percentage >= 75) {
      this.quotaItem.classList.add("warning");
    }
    this.renderTokenDetails(promptTokenDetails, percentage);
    this.warningMessage.style.display = percentage >= 75 ? "" : "none";
  }
  formatTokenCount(count2, decimals) {
    const mThreshold = 1e6 - 500 * Math.pow(10, -decimals);
    if (count2 >= mThreshold) {
      return `${(count2 / 1e6).toFixed(decimals)}M`;
    } else if (count2 >= 1e3) {
      return `${(count2 / 1e3).toFixed(decimals)}K`;
    }
    return count2.toString();
  }
  renderTokenDetails(details, contextWindowPercentage) {
    clearNode(this.tokenDetailsContainer);
    if (!details || details.length === 0) {
      this.tokenDetailsContainer.style.display = "none";
      return;
    }
    this.tokenDetailsContainer.style.display = "";
    const categoryMap = /* @__PURE__ */ new Map();
    let totalPercentage = 0;
    for (const detail2 of details) {
      const existing = categoryMap.get(detail2.category) || [];
      existing.push({ label: detail2.label, percentageOfPrompt: detail2.percentageOfPrompt });
      categoryMap.set(detail2.category, existing);
      totalPercentage += detail2.percentageOfPrompt;
    }
    if (totalPercentage < 100) {
      const uncategorizedPercentage = 100 - totalPercentage;
      categoryMap.set(localize(12697, null), [
        { label: localize(12690, null), percentageOfPrompt: uncategorizedPercentage }
      ]);
    }
    for (const [category9, items] of categoryMap) {
      const visibleItems = items.filter((item) => {
        const contextRelativePercentage = item.percentageOfPrompt / 100 * contextWindowPercentage;
        return contextRelativePercentage >= 0.05;
      });
      if (visibleItems.length === 0) {
        continue;
      }
      const categorySection = this.tokenDetailsContainer.appendChild($40(".token-category"));
      const categoryHeader = categorySection.appendChild($40(".token-category-header"));
      categoryHeader.textContent = category9;
      for (const item of visibleItems) {
        const itemRow = categorySection.appendChild($40(".token-detail-item"));
        const itemLabel = itemRow.appendChild($40(".token-detail-label"));
        itemLabel.textContent = item.label;
        const contextRelativePercentage = item.percentageOfPrompt / 100 * contextWindowPercentage;
        const itemValue = itemRow.appendChild($40(".token-detail-value"));
        itemValue.textContent = `${contextRelativePercentage.toFixed(1)}%`;
      }
    }
  }
  focus() {
    this.domNode.focus();
  }
};

ChatContextUsageDetails = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService)
], ChatContextUsageDetails);
export { $40, COMPACT_AGENT_HOST_CONVERSATION_ACTION_ID, ChatContextUsageDetails };
