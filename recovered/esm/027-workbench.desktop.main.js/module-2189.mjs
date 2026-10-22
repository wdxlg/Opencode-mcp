// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItemSections.ts
import { buildModelToProviderGroupMap, createModelAction, createModelItem, createPinAction, createUnavailableModelItem, getProviderGroupForModel, getProviderGroupKey, getUnavailableReason, isVersionAtLeast } from "./module-2188.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { isAutoModel } from "./module-2097.mjs";
import { channelOrderKey, compareChannelOrder, compareModelOrder } from "./module-2185.mjs";
import { ILanguageModelChatMetadata } from "./module-0967.mjs";
import { toAction } from "./module-0082.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItemSections.ts
var ModelPickerSection = {
  Other: "other"
};

var RESTRICTED_MODE_TRUST_ACTION_ID = "restrictedModeTrust";

var SETUP_REQUIRED_SIGN_IN_ACTION_ID = "setupRequiredSignIn";

function createSyntheticAutoItem() {
  return createModelItem({
    id: "auto",
    enabled: true,
    checked: true,
    class: void 0,
    tooltip: localize(12598, null),
    label: localize(12598, null),
    run: () => {
    }
  });
}

function buildUnavailableStateItems(options3) {
  const { restrictedMode, setupRequired, showAutoModel } = options3.presentation;
  if (restrictedMode) {
    const enabled = !!options3.actions.onRequestTrust;
    return [
      { kind: "header" /* Header */, label: localize(12602, null) },
      {
        item: {
          id: RESTRICTED_MODE_TRUST_ACTION_ID,
          enabled,
          checked: false,
          class: void 0,
          tooltip: localize(12604, null),
          label: localize(12603, null),
          run: () => options3.actions.onRequestTrust?.()
        },
        kind: "action" /* Action */,
        label: localize(12603, null),
        group: { title: "", icon: ThemeIcon.fromId(Codicon.workspaceTrusted.id) },
        disabled: !enabled,
        hideIcon: false
      }
    ];
  }
  if (setupRequired) {
    const enabled = !!options3.actions.onRequestSetup;
    const items = [
      { kind: "header" /* Header */, label: localize(12605, null) },
      {
        item: {
          id: SETUP_REQUIRED_SIGN_IN_ACTION_ID,
          enabled,
          checked: false,
          class: void 0,
          tooltip: localize(12607, null),
          label: localize(12606, null),
          run: () => options3.actions.onRequestSetup?.()
        },
        kind: "action" /* Action */,
        label: localize(12606, null),
        group: { title: "", icon: ThemeIcon.fromId(Codicon.signIn.id) },
        disabled: !enabled,
        hideIcon: false
      }
    ];
    if (options3.presentation.showManageModelsInSetupRequired && options3.manageModelsAction) {
      items.push(
        { kind: "separator" /* Separator */ },
        {
          item: options3.manageModelsAction,
          kind: "action" /* Action */,
          label: options3.manageModelsAction.label,
          group: { title: "", icon: Codicon.blank },
          hideIcon: false,
          showAlways: true
        }
      );
    }
    return items;
  }
  if (options3.models.length > 0) {
    return void 0;
  }
  if (showAutoModel) {
    return void 0;
  }
  const entitlement = options3.chatEntitlementService.entitlement;
  const canUpgrade = entitlement === 5 /* Free */ || entitlement === 10 /* EDU */;
  const description = canUpgrade ? new MarkdownString(localize(12609, null), { isTrusted: true }) : void 0;
  const hover = canUpgrade ? new MarkdownString("", { isTrusted: true, supportThemeIcons: true }) : void 0;
  hover?.appendMarkdown(localize(12608, null));
  return [{
    item: {
      id: "noModels",
      enabled: false,
      checked: false,
      class: void 0,
      tooltip: localize(12599, null),
      label: localize(12599, null),
      run: () => {
      }
    },
    kind: "action" /* Action */,
    label: localize(12599, null),
    description,
    group: { title: "", icon: ThemeIcon.fromId(Codicon.blank.id) },
    disabled: true,
    hideIcon: false,
    hover: hover ? { content: hover } : void 0
  }];
}

function buildFlatModelItems(options3) {
  const items = [];
  if (options3.models.length === 0 && options3.presentation.showAutoModel) {
    items.push(createSyntheticAutoItem());
  }
  const autoModel = options3.models.find(isAutoModel);
  if (autoModel) {
    const { action, ariaDescription } = createModelAction(autoModel, options3.selectedModelId, options3.actions.onSelect);
    items.push(createModelItem(action, autoModel, options3.openerService, void 0, options3.presentation.isUBB, ariaDescription));
  }
  const modelToGroup = buildModelToProviderGroupMap(options3.languageModelsService);
  const showChannels = new Set(options3.models.map((model) => {
    const group2 = getProviderGroupForModel(model, modelToGroup, options3.languageModelsService);
    return getProviderGroupKey(group2.vendor, group2.groupName);
  })).size > 1;
  const sortedModels = options3.models.filter((model) => model !== autoModel).sort((left, right) => left.metadata.vendor.localeCompare(right.metadata.vendor) || left.metadata.name.localeCompare(right.metadata.name));
  for (const model of sortedModels) {
    const channelLabel = showChannels && model.metadata.vendor === "opencode" ? getProviderGroupForModel(model, modelToGroup, options3.languageModelsService).channelLabel : void 0;
    const { action, ariaDescription } = createModelAction(model, options3.selectedModelId, options3.actions.onSelect, void 0, showChannels, channelLabel);
    items.push(createModelItem(action, model, options3.openerService, void 0, options3.presentation.isUBB, ariaDescription, void 0, options3.actions.onConfigure));
  }
  return items;
}

function buildOpenCodeChannelItems(options3) {
  const items = [];
  const groups = /* @__PURE__ */ new Map();
  const lookup = buildModelToProviderGroupMap(options3.languageModelsService);
  const placedModels = /* @__PURE__ */ new Set();
  for (const model of options3.models.filter((model2) => !isAutoModel(model2))) {
    if (placedModels.has(model.identifier)) {
      continue;
    }
    placedModels.add(model.identifier);
    const info = getProviderGroupForModel(model, lookup, options3.languageModelsService);
    const key3 = channelOrderKey(info.vendor, info.groupName);
    const group2 = groups.get(key3) ?? { label: info.channelLabel, vendor: info.vendor, models: [] };
    group2.models.push(model);
    groups.set(key3, group2);
  }
  const sorted = [...groups.entries()].sort(([a, left], [b, right]) => compareChannelOrder(a, left.vendor, b, right.vendor, options3.channelOrder?.channels ?? []) || (options3.channelOrder?.channels.length ? 0 : left.label.localeCompare(right.label)));
  for (const [key3, group2] of sorted) {
    const section = `channel:${key3}`;
    items.push({
      item: { id: section, enabled: true, checked: false, class: void 0, tooltip: group2.label, label: group2.label, run: () => {
      } },
      kind: "action" /* Action */,
      label: group2.label,
      badge: String(group2.models.length),
      group: { title: "", icon: Codicon.chevronDown },
      hideIcon: false,
      section,
      isSectionToggle: true,
      className: "chat-model-picker-channel-toggle"
    });
    group2.models.sort((a, b) => compareModelOrder(a.identifier, b.identifier, options3.channelOrder?.models[key3] ?? []) || (options3.channelOrder?.models[key3]?.length ? 0 : a.metadata.name.localeCompare(b.metadata.name)));
    for (const model of group2.models) {
      const { action, ariaDescription } = createModelAction(model, options3.selectedModelId, options3.actions.onSelect, section);
      const item = createModelItem(
        action,
        model,
        options3.openerService,
        void 0,
        options3.presentation.isUBB,
        [group2.label, ariaDescription].filter(Boolean).join(", "),
        void 0,
        options3.actions.onConfigure
      );
      items.push(action.checked ? {
        ...item,
        group: { title: "", icon: Codicon.blank },
        badge: "\u2713",
        className: `${item.className} chat-model-picker-selected`
      } : item);
    }
  }
  return items;
}

function createGroupedContext(options3) {
  const modelToGroup = buildModelToProviderGroupMap(options3.languageModelsService);
  const allModels = new Map(options3.models.map((model) => [model.identifier, model]));
  const modelsByMetadataId = new Map(options3.models.map((model) => [model.metadata.id, model]));
  const placed = /* @__PURE__ */ new Set();
  return {
    options: options3,
    items: [],
    modelToGroup,
    resolveModel: (id2) => allModels.get(id2) ?? modelsByMetadataId.get(id2),
    placed,
    showGroupLabel: new Set(options3.models.map((model) => {
      const group2 = getProviderGroupForModel(model, modelToGroup, options3.languageModelsService);
      return getProviderGroupKey(group2.vendor, group2.groupName);
    })).size > 1,
    makePinAction: (model) => options3.actions.onTogglePin ? createPinAction(model.identifier, options3.pinnedModelIds.includes(model.identifier), options3.actions.onTogglePin) : void 0,
    markPlaced: (identifierOrId) => placed.add(identifierOrId)
  };
}

function appendLeadingModels(context2) {
  const { options: options3, items } = context2;
  const autoModel = options3.models.find(isAutoModel);
  if (!autoModel && options3.models.length === 0 && options3.presentation.showAutoModel) {
    items.push(createSyntheticAutoItem());
  }
  if (autoModel) {
    context2.markPlaced(autoModel.identifier);
    const { action, ariaDescription } = createModelAction(autoModel, options3.selectedModelId, options3.actions.onSelect);
    items.push(createModelItem(action, autoModel, options3.openerService, void 0, options3.presentation.isUBB, ariaDescription));
  }
  for (const model of options3.models) {
    if (!context2.placed.has(model.identifier) && ILanguageModelChatMetadata.hasPromoDiscount(model.metadata)) {
      context2.markPlaced(model.identifier);
      const { action, ariaDescription } = createModelAction(model, options3.selectedModelId, options3.actions.onSelect);
      items.push(createModelItem(action, model, options3.openerService, void 0, options3.presentation.isUBB, ariaDescription));
    }
  }
  return autoModel;
}

function appendPinnedModels(context2) {
  const { options: options3, items } = context2;
  const pinnedSet = new Set(options3.pinnedModelIds);
  const pinnedModels = [];
  for (const id2 of options3.pinnedModelIds) {
    const model = context2.resolveModel(id2);
    if (!context2.placed.has(id2) && model && !context2.placed.has(model.identifier)) {
      context2.markPlaced(model.identifier);
      pinnedModels.push(model);
    }
  }
  pinnedModels.sort((left, right) => {
    const leftGroup = getProviderGroupForModel(left, context2.modelToGroup, options3.languageModelsService);
    const rightGroup = getProviderGroupForModel(right, context2.modelToGroup, options3.languageModelsService);
    return leftGroup.groupName.localeCompare(rightGroup.groupName) || left.metadata.name.localeCompare(right.metadata.name);
  });
  if (pinnedModels.length > 0) {
    items.push({ kind: "separator" /* Separator */, label: localize(12601, null) });
    for (const model of pinnedModels) {
      const channelLabel = context2.showGroupLabel ? getProviderGroupForModel(model, context2.modelToGroup, options3.languageModelsService).channelLabel : void 0;
      const prefix = model.metadata.vendor === "opencode" ? channelLabel : void 0;
      const { action, ariaDescription } = createModelAction(model, options3.selectedModelId, options3.actions.onSelect, void 0, context2.showGroupLabel, prefix);
      items.push(createModelItem(action, model, options3.openerService, prefix ? void 0 : channelLabel, options3.presentation.isUBB, ariaDescription, context2.makePinAction(model), options3.actions.onConfigure));
    }
  }
  return pinnedSet;
}

function appendPromotedModels(context2, autoModel, pinnedSet) {
  const { options: options3, items } = context2;
  const promoted = [];
  const tryPlace = (id2) => {
    if (context2.placed.has(id2)) {
      return false;
    }
    const model = context2.resolveModel(id2);
    if (model && !context2.placed.has(model.identifier)) {
      context2.markPlaced(model.identifier);
      const entry2 = options3.controlModels[model.metadata.id];
      if (entry2?.minVSCodeVersion && !isVersionAtLeast(options3.currentVSCodeVersion, entry2.minVSCodeVersion)) {
        promoted.push({ kind: "unavailable", id: model.metadata.id, entry: entry2, reason: "update" });
      } else {
        promoted.push({ kind: "available", model });
      }
      return true;
    }
    const entry = options3.controlModels[id2];
    if (!model && entry && !entry.exists) {
      context2.markPlaced(id2);
      promoted.push({ kind: "unavailable", id: id2, entry, reason: getUnavailableReason(entry, options3.chatEntitlementService, options3.currentVSCodeVersion) });
      return true;
    }
    return false;
  };
  if (options3.selectedModelId && options3.selectedModelId !== autoModel?.identifier) {
    tryPlace(options3.selectedModelId);
  }
  for (const id2 of options3.recentModelIds.filter((id3) => !pinnedSet.has(id3)).slice(0, 3)) {
    tryPlace(id2);
  }
  if (options3.presentation.showFeatured) {
    for (const model of options3.models) {
      if (model.metadata.promo && !ILanguageModelChatMetadata.hasPromoDiscount(model.metadata)) {
        tryPlace(model.identifier);
      }
    }
    for (const [entryId, entry] of Object.entries(options3.controlModels)) {
      if (!entry.featured || context2.placed.has(entryId)) {
        continue;
      }
      const model = context2.resolveModel(entryId);
      if (model && !context2.placed.has(model.identifier)) {
        if (entry.minVSCodeVersion && !isVersionAtLeast(options3.currentVSCodeVersion, entry.minVSCodeVersion)) {
          if (options3.presentation.showUnavailableFeatured) {
            context2.markPlaced(model.identifier);
            promoted.push({ kind: "unavailable", id: entryId, entry, reason: "update" });
          }
        } else {
          context2.markPlaced(model.identifier);
          promoted.push({ kind: "available", model });
        }
      } else if (!model && !entry.exists && options3.presentation.showUnavailableFeatured) {
        context2.markPlaced(entryId);
        promoted.push({ kind: "unavailable", id: entryId, entry, reason: getUnavailableReason(entry, options3.chatEntitlementService, options3.currentVSCodeVersion) });
      }
    }
  }
  if (promoted.length === 0) {
    return;
  }
  if (items.length > 0) {
    items.push({ kind: "separator" /* Separator */ });
  }
  promoted.sort((left, right) => {
    const availability = (left.kind === "available" ? 0 : 1) - (right.kind === "available" ? 0 : 1);
    const leftName = left.kind === "available" ? left.model.metadata.name : left.entry.label;
    const rightName = right.kind === "available" ? right.model.metadata.name : right.entry.label;
    return availability || leftName.localeCompare(rightName);
  });
  for (const item of promoted) {
    if (item.kind === "available") {
      const channelLabel = context2.showGroupLabel ? getProviderGroupForModel(item.model, context2.modelToGroup, options3.languageModelsService).channelLabel : void 0;
      const prefix = item.model.metadata.vendor === "opencode" ? channelLabel : void 0;
      const { action, ariaDescription } = createModelAction(item.model, options3.selectedModelId, options3.actions.onSelect, void 0, context2.showGroupLabel, prefix);
      items.push(createModelItem(action, item.model, options3.openerService, prefix ? void 0 : channelLabel, options3.presentation.isUBB, ariaDescription, context2.makePinAction(item.model), options3.actions.onConfigure));
    } else {
      items.push(createUnavailableModelItem(item.id, item.entry, item.reason, options3.manageSettingsUrl, options3.updateStateType, options3.chatEntitlementService));
    }
  }
}

function appendOtherModels(context2) {
  const { options: options3, items } = context2;
  const otherModels = options3.models.filter((model) => !context2.placed.has(model.identifier));
  if (otherModels.length === 0) {
    return false;
  }
  if (items.length > 0) {
    items.push({ kind: "separator" /* Separator */ });
  }
  const toolbarActions = options3.manageModelsAction ? [toAction({ id: options3.manageModelsAction.id, label: options3.manageModelsAction.tooltip ?? options3.manageModelsAction.label, class: ThemeIcon.asClassName(Codicon.gear), run: () => options3.manageModelsAction.run() })] : void 0;
  items.push({
    item: { id: "otherModels", enabled: true, checked: false, class: void 0, tooltip: localize(12600, null), label: localize(12600, null), run: () => {
    } },
    kind: "action" /* Action */,
    label: localize(12600, null),
    group: { title: "", icon: Codicon.chevronDown },
    hideIcon: false,
    section: ModelPickerSection.Other,
    isSectionToggle: true,
    toolbarActions,
    className: "chat-model-picker-section-toggle"
  });
  const groups = /* @__PURE__ */ new Map();
  for (const model of otherModels) {
    const info = getProviderGroupForModel(model, context2.modelToGroup, options3.languageModelsService);
    const key3 = getProviderGroupKey(info.vendor, info.groupName);
    const bucket = groups.get(key3) ?? { vendor: info.vendor, groupName: info.groupName, channelLabel: info.channelLabel, models: [] };
    bucket.models.push(model);
    groups.set(key3, bucket);
  }
  const sortedGroups = [...groups.values()].sort((left, right) => {
    if (left.vendor === "copilot" && right.vendor !== "copilot") {
      return -1;
    }
    if (right.vendor === "copilot" && left.vendor !== "copilot") {
      return 1;
    }
    return left.groupName.localeCompare(right.groupName);
  });
  const showHeaders = sortedGroups.length > 1;
  for (const group2 of sortedGroups) {
    if (showHeaders) {
      items.push({ kind: "separator" /* Separator */, label: group2.channelLabel, section: ModelPickerSection.Other });
    }
    group2.models.sort((left, right) => {
      const leftEntry = options3.controlModels[left.metadata.id] ?? options3.controlModels[left.identifier];
      const rightEntry = options3.controlModels[right.metadata.id] ?? options3.controlModels[right.identifier];
      const leftUnavailable = leftEntry?.minVSCodeVersion && !isVersionAtLeast(options3.currentVSCodeVersion, leftEntry.minVSCodeVersion) ? 1 : 0;
      const rightUnavailable = rightEntry?.minVSCodeVersion && !isVersionAtLeast(options3.currentVSCodeVersion, rightEntry.minVSCodeVersion) ? 1 : 0;
      return leftUnavailable - rightUnavailable || left.metadata.name.localeCompare(right.metadata.name);
    });
    for (const model of group2.models) {
      const entry = options3.controlModels[model.metadata.id] ?? options3.controlModels[model.identifier];
      if (entry?.minVSCodeVersion && !isVersionAtLeast(options3.currentVSCodeVersion, entry.minVSCodeVersion)) {
        items.push(createUnavailableModelItem(model.metadata.id, entry, "update", options3.manageSettingsUrl, options3.updateStateType, options3.chatEntitlementService, ModelPickerSection.Other));
      } else {
        const { action, ariaDescription } = createModelAction(model, options3.selectedModelId, options3.actions.onSelect, ModelPickerSection.Other, showHeaders, showHeaders && group2.vendor === "opencode" ? group2.channelLabel : void 0);
        items.push(createModelItem(action, model, options3.openerService, void 0, options3.presentation.isUBB, ariaDescription, context2.makePinAction(model), options3.actions.onConfigure));
      }
    }
  }
  return true;
}

function buildGroupedModelItems(options3) {
  const context2 = createGroupedContext(options3);
  const autoModel = appendLeadingModels(context2);
  const pinnedSet = appendPinnedModels(context2);
  appendPromotedModels(context2, autoModel, pinnedSet);
  const hasOtherModels = appendOtherModels(context2);
  if (options3.manageModelsAction && !hasOtherModels) {
    context2.items.push({ kind: "separator" /* Separator */ });
    context2.items.push({
      item: options3.manageModelsAction,
      kind: "action" /* Action */,
      label: options3.manageModelsAction.label,
      group: { title: "", icon: Codicon.blank },
      hideIcon: false,
      showAlways: true
    });
  }
  return context2.items;
}
export { createSyntheticAutoItem, buildUnavailableStateItems, buildFlatModelItems, buildOpenCodeChannelItems, createGroupedContext, appendLeadingModels, appendPinnedModels, appendPromotedModels, appendOtherModels, buildGroupedModelItems, ModelPickerSection, RESTRICTED_MODE_TRUST_ACTION_ID, SETUP_REQUIRED_SIGN_IN_ACTION_ID };
