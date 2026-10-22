// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.ts
import { AICustomizationManagementSection } from "./module-0995.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { MenuId } from "./module-0092.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagement.ts
function sectionToPromptType(section) {
  switch (section) {
    case AICustomizationManagementSection.Agents:
      return "agent" /* agent */;
    case AICustomizationManagementSection.Skills:
      return "skill" /* skill */;
    case AICustomizationManagementSection.Instructions:
      return "instructions" /* instructions */;
    case AICustomizationManagementSection.Hooks:
      return "hook" /* hook */;
    case AICustomizationManagementSection.Prompts:
    default:
      return "prompt" /* prompt */;
  }
}

var AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID = "workbench.editor.aiCustomizationManagement";

var AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID = "workbench.input.aiCustomizationManagement";

var AICustomizationManagementCommands2 = {
  OpenEditor: "aiCustomization.openManagementEditor",
  OpenMarketplace: "aiCustomization.openMarketplace",
  CreateNewAgent: "aiCustomization.createNewAgent",
  CreateNewSkill: "aiCustomization.createNewSkill",
  CreateNewInstructions: "aiCustomization.createNewInstructions",
  CreateNewPrompt: "aiCustomization.createNewPrompt",
  GenerateDebugReport: "aiCustomization.generateDebugReport"
};

var CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR = new RawContextKey(
  "aiCustomizationManagementEditorFocused",
  false,
  localize(9383, null)
);

var CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION = new RawContextKey(
  "chatCustomizationSection",
  AICustomizationManagementSection.Agents,
  localize(9384, null)
);

var CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_HARNESS = new RawContextKey(
  "chatCustomizationSessionType",
  "",
  localize(9385, null)
);

var AICustomizationManagementTitleMenuId = MenuId.for("AICustomizationManagementEditorTitle");

var AICustomizationManagementItemMenuId = MenuId.for("AICustomizationManagementEditorItem");

var AICustomizationManagementCreateMenuId = MenuId.for("AICustomizationManagementCreate");

var AI_CUSTOMIZATION_ITEM_TYPE_KEY = "aiCustomizationManagementItemType";

var AI_CUSTOMIZATION_ITEM_STORAGE_KEY = "aiCustomizationManagementItemStorage";

var AI_CUSTOMIZATION_ITEM_URI_KEY = "aiCustomizationManagementItemUri";

var AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY = "aiCustomizationManagementItemPluginUri";

var AI_CUSTOMIZATION_ITEM_DISABLED_KEY = "aiCustomizationManagementItemDisabled";

var AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY = "aiCustomizationManagement.selectedSection";

var AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY = "aiCustomizationManagement.sidebarWidth";

var SIDEBAR_DEFAULT_WIDTH = 200;

var SIDEBAR_MIN_WIDTH = 150;

var SIDEBAR_MAX_WIDTH = 350;

var CONTENT_MIN_WIDTH = 400;
export { sectionToPromptType, AI_CUSTOMIZATION_MANAGEMENT_EDITOR_ID, AI_CUSTOMIZATION_MANAGEMENT_EDITOR_INPUT_ID, AICustomizationManagementCommands2, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_EDITOR, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_SECTION, CONTEXT_AI_CUSTOMIZATION_MANAGEMENT_HARNESS, AICustomizationManagementTitleMenuId, AICustomizationManagementItemMenuId, AICustomizationManagementCreateMenuId, AI_CUSTOMIZATION_ITEM_TYPE_KEY, AI_CUSTOMIZATION_ITEM_STORAGE_KEY, AI_CUSTOMIZATION_ITEM_URI_KEY, AI_CUSTOMIZATION_ITEM_PLUGIN_URI_KEY, AI_CUSTOMIZATION_ITEM_DISABLED_KEY, AI_CUSTOMIZATION_MANAGEMENT_SELECTED_SECTION_KEY, AI_CUSTOMIZATION_MANAGEMENT_SIDEBAR_WIDTH_KEY, SIDEBAR_DEFAULT_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, CONTENT_MIN_WIDTH };
