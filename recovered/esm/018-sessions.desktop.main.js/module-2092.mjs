// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerHover.ts
import { getPriceCategoryLabel, isAutoModel, isMultiplierPricing } from "./module-2091.mjs";
import { ILanguageModelChatMetadata } from "./module-0968.mjs";
import { $ } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { formatTokenCount } from "./module-0040.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { renderIcon } from "./module-0467.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerHover.ts
var SUPPORTED_CONFIG_GROUPS = ["navigation", "tokens"];

function getModelHoverContent(model, isUBB, onConfigure, openerService) {
  const isAuto = isAutoModel(model);
  const promo = !isAuto && ILanguageModelChatMetadata.hasPromoDiscount(model.metadata) ? model.metadata.promo : void 0;
  const container2 = $(".chat-model-hover");
  const disposables = new DisposableStore();
  const titleRow = $(".chat-model-hover-title-row");
  titleRow.appendChild($(".chat-model-hover-name", void 0, model.metadata.name));
  const tags = $(".chat-model-hover-title-tags");
  const categoryLabel = !isAuto && !promo ? getCategoryLabel(model.metadata.category) : void 0;
  if (categoryLabel) {
    tags.appendChild($("span.chat-model-hover-category", void 0, categoryLabel));
  }
  const priceCategoryLabel = !isAuto ? getPriceCategoryLabel(model.metadata.priceCategory) : void 0;
  const badgeLabel2 = isAuto ? model.metadata.detail : priceCategoryLabel;
  if (badgeLabel2) {
    const badge = $("span.chat-model-hover-price-badge", void 0, badgeLabel2);
    if (!isAuto && isHighCostCategory(model.metadata.priceCategory)) {
      badge.classList.add("high-cost");
    }
    tags.appendChild(badge);
  }
  if (promo) {
    const discountLabel = localize(12567, null, promo.discountPercent);
    tags.appendChild($("span.chat-model-hover-price-badge", void 0, discountLabel));
  }
  if (tags.childElementCount > 0) {
    titleRow.appendChild(tags);
  }
  container2.appendChild(titleRow);
  if (!isAuto && model.metadata.warningText) {
    for (const message of Object.values(model.metadata.warningText)) {
      container2.appendChild(createMessageBanner(message, "chat-model-hover-warning-text", Codicon.warningCompact, disposables, openerService));
    }
  }
  if (!isAuto && model.metadata.infoText) {
    for (const message of Object.values(model.metadata.infoText)) {
      container2.appendChild(createMessageBanner(message, "chat-model-hover-info-text", Codicon.info, disposables, openerService));
    }
  }
  if (promo) {
    const endsAtLabel = ILanguageModelChatMetadata.getPromoEndsAtLabel(promo.endsAt);
    const promoMessage = endsAtLabel ? promo.message + " " + endsAtLabel : promo.message;
    container2.appendChild(createMessageBanner(promoMessage, "chat-model-hover-promo-text", Codicon.info, disposables, openerService));
  }
  let costInfoRendered = false;
  let costTableRendered = false;
  if (!isAuto && isUBB) {
    const metrics = [
      { label: localize(12576, null), def: model.metadata.inputCost, long: model.metadata.longContextInputCost },
      { label: localize(12578, null), def: model.metadata.outputCost, long: model.metadata.longContextOutputCost },
      { label: localize(12568, null), def: model.metadata.cacheCost, long: model.metadata.longContextCacheCost },
      { label: localize(12569, null), def: model.metadata.cacheWriteCost, long: model.metadata.longContextCacheWriteCost }
    ].filter((metric) => metric.def !== void 0 || metric.long !== void 0);
    if (metrics.length > 0) {
      const hasLongContext = metrics.some((metric) => metric.long !== void 0);
      const table = $(".chat-model-hover-cost-table");
      if (hasLongContext) {
        container2.classList.add("has-long-context");
        table.classList.add("has-long-context");
      }
      const appendValueCell = (row, cost) => {
        if (cost === void 0) {
          row.appendChild($("span.chat-model-hover-cost-value.empty"));
          return;
        }
        row.appendChild($(
          "span.chat-model-hover-cost-value",
          void 0,
          $(
            "span.chat-model-hover-cost-number",
            void 0,
            typeof cost === "number" ? String(cost) : localize(12573, null)
          )
        ));
      };
      const headerRow = $(".chat-model-hover-cost-row.header");
      headerRow.appendChild($("span.chat-model-hover-cost-heading", void 0, localize(12574, null)));
      if (hasLongContext) {
        headerRow.appendChild($("span.chat-model-hover-cost-value.subheader", void 0, localize(12575, null)));
        headerRow.appendChild($("span.chat-model-hover-cost-value.subheader", void 0, localize(12577, null)));
      } else {
        headerRow.appendChild($("span.chat-model-hover-cost-value.subheader"));
      }
      table.appendChild(headerRow);
      for (const metric of metrics) {
        const row = $(".chat-model-hover-cost-row");
        const labelCell = $(".chat-model-hover-cost-label");
        labelCell.appendChild($("span.chat-model-hover-cost-label-text", void 0, metric.label));
        row.appendChild(labelCell);
        appendValueCell(row, metric.def);
        if (hasLongContext) {
          appendValueCell(row, metric.long);
        }
        table.appendChild(row);
      }
      container2.appendChild(table);
      costTableRendered = true;
      costInfoRendered = true;
    } else if (model.metadata.pricing && (isMultiplierPricing(model) || !priceCategoryLabel)) {
      appendCostSection(container2, model.metadata.pricing);
      costInfoRendered = true;
    }
  } else if (!isAuto && model.metadata.pricing) {
    appendCostSection(container2, model.metadata.pricing);
    costInfoRendered = true;
  }
  if (!costInfoRendered && model.metadata.tooltip) {
    const descriptionMd = new MarkdownString(model.metadata.tooltip, { supportThemeIcons: true });
    const rendered = disposables.add(renderMarkdown(descriptionMd, {
      actionHandler: (link2) => {
        void openerService.open(link2, { allowCommands: false, fromUserGesture: true });
      }
    }));
    rendered.element.classList.add("chat-model-hover-description");
    container2.appendChild(rendered.element);
  }
  if (!isAuto && !costTableRendered && (model.metadata.maxInputTokens || model.metadata.maxOutputTokens)) {
    const totalTokens = (model.metadata.maxInputTokens ?? 0) + (model.metadata.maxOutputTokens ?? 0);
    const contextSection = $(".chat-model-hover-context");
    contextSection.appendChild($(".chat-model-hover-context-label", void 0, localize(12571, null)));
    contextSection.appendChild($(".chat-model-hover-context-value", void 0, formatTokenCount(totalTokens)));
    container2.appendChild(contextSection);
  }
  if (model.metadata.configurationSchema?.properties) {
    const configButtons = [];
    const seenGroups = /* @__PURE__ */ new Set();
    for (const propSchema of Object.values(model.metadata.configurationSchema.properties)) {
      if (propSchema.enum && propSchema.enum.length >= 2 && propSchema.group && SUPPORTED_CONFIG_GROUPS.includes(propSchema.group) && !seenGroups.has(propSchema.group)) {
        const label3 = isAuto && propSchema.group === "navigation" ? localize(12579, null) : propSchema.title ?? propSchema.description;
        if (label3) {
          seenGroups.add(propSchema.group);
          configButtons.push({ group: propSchema.group, label: label3 });
        }
      }
    }
    if (configButtons.length > 0) {
      const configRow = $(".chat-model-hover-configurable");
      configRow.appendChild($("span.chat-model-hover-configurable-label", void 0, localize(12570, null)));
      const buttonsContainer = $(".chat-model-hover-configurable-buttons");
      for (const { group: group2, label: label3 } of configButtons) {
        const button = disposables.add(new Button(buttonsContainer, {
          ...defaultButtonStyles,
          secondary: true,
          title: label3
        }));
        button.label = label3;
        disposables.add(button.onDidClick(() => onConfigure?.(group2)));
      }
      configRow.appendChild(buttonsContainer);
      container2.appendChild(configRow);
    }
  }
  return container2.children.length > 0 ? { element: container2, disposable: disposables } : void 0;
}

function createMessageBanner(message, className2, icon2, disposables, openerService) {
  const banner = $(`.${className2}`);
  banner.appendChild(renderIcon(icon2));
  const markdown = new MarkdownString(message, { isTrusted: false, supportThemeIcons: true });
  const rendered = disposables.add(renderMarkdown(markdown, {
    actionHandler: (link2) => {
      void openerService.open(link2, { allowCommands: false, fromUserGesture: true });
    }
  }));
  banner.appendChild(rendered.element);
  return banner;
}

function appendCostSection(container2, pricing) {
  const costSection = $(".chat-model-hover-cost");
  costSection.appendChild($("span", void 0, localize(12572, null, pricing)));
  container2.appendChild(costSection);
}

function isHighCostCategory(priceCategory) {
  return priceCategory === "high" || priceCategory === "very_high";
}

function getCategoryLabel(category9) {
  switch (category9) {
    case void 0:
    case "":
      return void 0;
    case "lightweight":
      return localize(12564, null);
    case "versatile":
      return localize(12566, null);
    case "powerful":
      return localize(12565, null);
    default:
      return typeof category9 === "string" ? category9.charAt(0).toUpperCase() + category9.slice(1) : void 0;
  }
}
export { getModelHoverContent, createMessageBanner, appendCostSection, isHighCostCategory, getCategoryLabel, SUPPORTED_CONFIG_GROUPS };
