// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItemPrimitives.ts
import { coerce, gte } from "./module-1044.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { languageModelSourcePresentationRegistry } from "./module-2187.mjs";
import { ILanguageModelChatMetadata, getLanguageModelProviderDisplayName } from "./module-0967.mjs";
import { getModelHoverContent } from "./module-2098.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { toAction } from "./module-0082.mjs";
import { getPriceCategoryLabel, isAutoModel, isMultiplierPricing } from "./module-2097.mjs";
import { withSeverityPrefix } from "./module-0336.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItemPrimitives.ts
function isVersionAtLeast(current, required) {
  const currentSemver = coerce(current);
  return !!currentSemver && gte(currentSemver, required);
}

function getUpdateHoverContent(updateState) {
  const hoverContent2 = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
  switch (updateState) {
    case "available for download" /* AvailableForDownload */:
      hoverContent2.appendMarkdown(localize(12584, null));
      break;
    case "downloaded" /* Downloaded */:
    case "ready" /* Ready */:
      hoverContent2.appendMarkdown(localize(12586, null));
      break;
    default:
      hoverContent2.appendMarkdown(localize(12583, null));
      break;
  }
  return hoverContent2;
}

function compactProviderChannelName(name) {
  let label3 = name.trim();
  if (/^https?:\/\//i.test(label3)) {
    try {
      label3 = new URL(label3).hostname.replace(/^www\./i, "");
    } catch {
      label3 = "";
    }
  } else if (/\b(?:https?:\/\/|data:)/i.test(label3)) {
    label3 = "";
  }
  return label3.length > 26 ? `${label3.slice(0, 25)}\u2026` : label3 || "API";
}

function getProviderGroupKey(vendor, groupName) {
  return `${vendor}\0${groupName}`;
}

function buildModelToProviderGroupMap(languageModelsService) {
  const map = /* @__PURE__ */ new Map();
  const labelCounts = /* @__PURE__ */ new Map();
  for (const vendor of languageModelsService.getVendors()) {
    for (const group2 of languageModelsService.getLanguageModelGroups(vendor.vendor)) {
      const groupName = group2.group?.name ?? vendor.displayName;
      const label3 = compactProviderChannelName(groupName);
      const count2 = vendor.vendor === "opencode" ? (labelCounts.get(label3) ?? 0) + 1 : 1;
      if (vendor.vendor === "opencode") labelCounts.set(label3, count2);
      const channelLabel = count2 === 1 ? label3 : `${label3} #${count2}`;
      for (const identifier2 of group2.modelIdentifiers) {
        map.set(identifier2, { vendor: vendor.vendor, groupName, channelLabel });
      }
    }
  }
  return map;
}

function getProviderGroupForModel(model, modelToGroup, languageModelsService) {
  if (model.metadata.modelGroup) {
    const byokGroup = model.metadata.byokModelIdentifier ? modelToGroup.get(model.metadata.byokModelIdentifier) : void 0;
    const sourcePresentation = model.metadata.modelGroup.sourceId ? languageModelSourcePresentationRegistry.get(model.metadata.vendor, model.metadata.modelGroup.sourceId) : void 0;
    return byokGroup ?? {
      vendor: model.metadata.vendor,
      groupName: sourcePresentation?.label ?? getLanguageModelProviderDisplayName(languageModelsService, model.metadata.modelGroup.id),
      channelLabel: compactProviderChannelName(sourcePresentation?.label ?? getLanguageModelProviderDisplayName(languageModelsService, model.metadata.modelGroup.id))
    };
  }
  return modelToGroup.get(model.identifier) ?? {
    vendor: model.metadata.vendor,
    groupName: getLanguageModelProviderDisplayName(languageModelsService, model.metadata.vendor),
    channelLabel: compactProviderChannelName(getLanguageModelProviderDisplayName(languageModelsService, model.metadata.vendor))
  };
}

function createModelItem(action, model, openerService, vendorLabel, isUBB, ariaDescription, pinAction, onConfigure) {
  const hover = model && openerService ? getModelHoverContent(model, isUBB, onConfigure ? (group2) => onConfigure(model, group2) : void 0, openerService) : void 0;
  return {
    item: action,
    kind: "action" /* Action */,
    label: action.label,
    description: action.description,
    ariaDescription,
    group: { title: "", icon: action.icon ?? ThemeIcon.fromId(action.checked ? Codicon.check.id : Codicon.blank.id) },
    hideIcon: false,
    section: action.section,
    className: `chat-model-picker-model-row${action.description ? " has-description" : ""}${vendorLabel ? " chat-model-picker-inline-source" : ""}`,
    badge: vendorLabel,
    hover: hover ? { content: hover.element, disposable: hover.disposable } : void 0,
    tooltip: action.tooltip,
    toolbarActions: pinAction ? [pinAction] : void 0,
    submenuActions: action.toolbarActions?.length ? action.toolbarActions : void 0
  };
}

function createPinAction(modelIdentifier, isPinned, onTogglePin) {
  return toAction({
    id: `pin.${modelIdentifier}`,
    label: isPinned ? localize(12587, null) : localize(12585, null),
    class: ThemeIcon.asClassName(isPinned ? Codicon.pinned : Codicon.pin),
    run: () => onTogglePin(modelIdentifier, !isPinned)
  });
}

function createModelAction(model, selectedModelId, onSelect, section, suppressVendorInDetail, channelLabel) {
  const pricingForDescription = isMultiplierPricing(model) ? model.metadata.pricing : void 0;
  const priceCategoryLabel = getPriceCategoryLabel(model.metadata.priceCategory);
  const detail2 = suppressVendorInDetail ? void 0 : model.metadata.detail;
  const promo = ILanguageModelChatMetadata.hasPromoDiscount(model.metadata) ? model.metadata.promo : void 0;
  const promoDetail = promo ? localize(12592, null, promo.discountPercent) : void 0;
  const textParts = [detail2, promoDetail, pricingForDescription].filter(Boolean);
  const textDescription = textParts.length > 0 ? textParts.join(" \xB7 ") : void 0;
  const action = {
    id: model.identifier,
    enabled: true,
    icon: model.metadata.statusIcon,
    checked: model.identifier === selectedModelId,
    class: void 0,
    description: textDescription,
    tooltip: channelLabel ? `${channelLabel} / ${model.metadata.name}` : model.metadata.name,
    label: channelLabel ? `${channelLabel} / ${model.metadata.name}` : model.metadata.name,
    section,
    run: () => onSelect(model)
  };
  const baseDescription = priceCategoryLabel ? textDescription ? textDescription + " \xB7 " + priceCategoryLabel : priceCategoryLabel : void 0;
  const notices = getNoticeAriaLabels(model);
  const ariaDescription = notices.length > 0 ? [baseDescription ?? textDescription, ...notices].filter((part) => !!part).join(", ") : baseDescription;
  return { action, ariaDescription };
}

function getNoticeAriaLabels(model) {
  if (isAutoModel(model)) {
    return [];
  }
  const toLabel = (message, severity) => withSeverityPrefix(stripIcons(renderAsPlaintext(new MarkdownString(message))), severity);
  return [
    ...Object.values(model.metadata.warningText ?? {}).map((message) => toLabel(message, severity_default.Warning)),
    ...Object.values(model.metadata.infoText ?? {}).map((message) => toLabel(message, severity_default.Info))
  ];
}

function getUnavailableReason(entry, chatEntitlementService, currentVSCodeVersion) {
  const businessOrEnterprise = chatEntitlementService.entitlement === 8 /* Business */ || chatEntitlementService.entitlement === 9 /* Enterprise */;
  if (!businessOrEnterprise) {
    return "upgrade";
  }
  return entry.minVSCodeVersion && !isVersionAtLeast(currentVSCodeVersion, entry.minVSCodeVersion) ? "update" : "admin";
}

function createUnavailableModelItem(id2, entry, reason, manageSettingsUrl, updateStateType, chatEntitlementService, section) {
  let description;
  if (reason === "upgrade") {
    description = new MarkdownString(localize(12591, null), { isTrusted: true });
  } else if (reason === "update") {
    description = localize(12588, null);
  } else {
    description = manageSettingsUrl ? new MarkdownString(localize(12582, null, manageSettingsUrl), { isTrusted: true }) : localize(12580, null);
  }
  let hoverContent2;
  if (reason === "upgrade") {
    hoverContent2 = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    if (chatEntitlementService.entitlement === 6 /* Pro */) {
      hoverContent2.appendMarkdown(localize(12590, null));
    } else {
      hoverContent2.appendMarkdown(localize(12589, null));
    }
  } else if (reason === "update") {
    hoverContent2 = getUpdateHoverContent(updateStateType);
  } else {
    hoverContent2 = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    hoverContent2.appendMarkdown(localize(12581, null));
  }
  return {
    item: {
      id: id2,
      enabled: false,
      checked: false,
      class: void 0,
      tooltip: entry.label,
      label: entry.label,
      description: typeof description === "string" ? description : void 0,
      run: () => {
      }
    },
    kind: "action" /* Action */,
    label: entry.label,
    description,
    group: { title: "", icon: ThemeIcon.fromId(Codicon.blank.id) },
    disabled: true,
    hideIcon: false,
    className: "chat-model-picker-unavailable",
    section,
    hover: { content: hoverContent2 }
  };
}
export { isVersionAtLeast, getUpdateHoverContent, compactProviderChannelName, getProviderGroupKey, buildModelToProviderGroupMap, getProviderGroupForModel, createModelItem, createPinAction, createModelAction, getNoticeAriaLabels, getUnavailableReason, createUnavailableModelItem };
