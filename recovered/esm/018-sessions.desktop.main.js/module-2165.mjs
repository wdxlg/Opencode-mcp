// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItems.ts
import { RESTRICTED_MODE_TRUST_ACTION_ID, SETUP_REQUIRED_SIGN_IN_ACTION_ID, buildFlatModelItems, buildGroupedModelItems, buildOpenCodeChannelItems, buildUnavailableStateItems } from "./module-2164.mjs";
import { isProUser } from "./module-0954.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { MANAGE_CHAT_COMMAND_ID } from "./module-0965.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerItems.ts
var OPENCODE_API_SETUP_ACTION_ID = "opencodeConfigureApiProvider";

var OPENCODE_CODEX_SETUP_ACTION_ID = "opencodeOpenCodexAccount";

var PICKER_COMMAND_ACTION_IDS = /* @__PURE__ */ new Set([RESTRICTED_MODE_TRUST_ACTION_ID, SETUP_REQUIRED_SIGN_IN_ACTION_ID, OPENCODE_API_SETUP_ACTION_ID, OPENCODE_CODEX_SETUP_ACTION_ID]);

function getControlModelsForEntitlement(manifest, entitlement) {
  return isProUser(entitlement) && entitlement !== 10 /* EDU */ ? manifest.paid : manifest.free;
}

function getModelPickerControlModels(manifest, entitlement, models) {
  if (entitlement !== 1 /* Unknown */) {
    return getControlModelsForEntitlement(manifest, entitlement);
  }
  const availableModelIds = new Set(models.filter((model) => !model.metadata.isBYOK && !model.metadata.byokModelIdentifier && !!model.metadata.targetChatSessionType).map((model) => model.metadata.id));
  const controlModels = {};
  for (const tier of [manifest.free, manifest.paid]) {
    for (const [id2, entry] of Object.entries(tier)) {
      if (entry.featured && availableModelIds.has(id2)) {
        controlModels[id2] = { ...entry, exists: true };
      }
    }
  }
  return controlModels;
}

function shouldShowManageModelsAction(chatEntitlementService) {
  return chatEntitlementService.clientByokEnabled || chatEntitlementService.hasByokModels || chatEntitlementService.entitlement === 5 /* Free */ || chatEntitlementService.entitlement === 10 /* EDU */ || chatEntitlementService.entitlement === 6 /* Pro */ || chatEntitlementService.entitlement === 7 /* ProPlus */ || chatEntitlementService.entitlement === 11 /* Max */ || chatEntitlementService.entitlement === 8 /* Business */ || chatEntitlementService.entitlement === 9 /* Enterprise */ || chatEntitlementService.isInternal;
}

function createManageModelsAction(commandService) {
  return {
    id: "manageModels",
    enabled: true,
    checked: false,
    class: ThemeIcon.asClassName(Codicon.gear),
    tooltip: localize(12594, null),
    label: localize(12593, null),
    run: () => {
      commandService.executeCommand(MANAGE_CHAT_COMMAND_ID);
    }
  };
}

function createOpenCodeModelSetupItems(commandService) {
  const entries2 = [
    { id: OPENCODE_API_SETUP_ACTION_ID, label: localize(12595, null), section: "models", icon: Codicon.gear },
    { id: OPENCODE_CODEX_SETUP_ACTION_ID, label: localize(12596, null), section: "codex", icon: Codicon.account }
  ];
  return [
    { kind: "header" /* Header */, label: localize(12597, null) },
    ...entries2.map((entry) => ({
      kind: "action" /* Action */,
      label: entry.label,
      group: { title: "", icon: entry.icon },
      hideIcon: false,
      item: {
        id: entry.id,
        enabled: true,
        checked: false,
        class: ThemeIcon.asClassName(entry.icon),
        label: entry.label,
        tooltip: entry.label,
        run: async () => {
          await commandService.executeCommand("aiCustomization.openManagementEditor", entry.section);
        }
      }
    }))
  ];
}

function buildModelPickerItems(options3) {
  const unavailableItems = buildUnavailableStateItems(options3);
  if (unavailableItems) {
    return unavailableItems;
  }
  if (options3.presentation.groupOpenCodeChannels) {
    return buildOpenCodeChannelItems(options3);
  }
  return options3.presentation.useGroupedModelPicker ? buildGroupedModelItems(options3) : buildFlatModelItems(options3);
}

function getModelPickerAccessibilityProvider() {
  return {
    getAriaLabel(element) {
      if (element.kind !== "action" /* Action */) {
        return null;
      }
      const description = element.ariaDescription ?? (typeof element.description === "string" ? element.description : element.description?.value);
      return [element.label, element.badge, description].filter((part) => !!part).join(", ");
    },
    isChecked(element) {
      if (element.isSectionToggle) {
        return void 0;
      }
      if (element.kind === "action" /* Action */ && !(element.item?.id && PICKER_COMMAND_ACTION_IDS.has(element.item.id))) {
        return !!element.item?.checked;
      }
      return void 0;
    },
    getRole: (element) => {
      if (element.isSectionToggle) {
        return "menuitem";
      }
      switch (element.kind) {
        case "action" /* Action */:
          return element.item?.id && PICKER_COMMAND_ACTION_IDS.has(element.item.id) ? "menuitem" : "menuitemradio";
        case "separator" /* Separator */:
        default:
          return "separator";
      }
    },
    getWidgetRole: () => "menu"
  };
}
export { getControlModelsForEntitlement, getModelPickerControlModels, shouldShowManageModelsAction, createManageModelsAction, createOpenCodeModelSetupItems, buildModelPickerItems, getModelPickerAccessibilityProvider, OPENCODE_API_SETUP_ACTION_ID, OPENCODE_CODEX_SETUP_ACTION_ID, PICKER_COMMAND_ACTION_IDS };
