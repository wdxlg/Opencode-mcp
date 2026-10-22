// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeCustomizationSections.ts
import { AICustomizationManagementSection } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeCustomizationSections.ts
var OPENCODE_HIDDEN_CUSTOMIZATION_SECTIONS = /* @__PURE__ */ new Set([
  AICustomizationManagementSection.Agents,
  AICustomizationManagementSection.Skills,
  AICustomizationManagementSection.Instructions,
  AICustomizationManagementSection.Prompts,
  AICustomizationManagementSection.Hooks,
  AICustomizationManagementSection.Plugins
]);

function defaultOpenCodeCustomizationSection(sections) {
  return sections.find((section) => section.id === AICustomizationManagementSection.Bridge)?.id ?? sections[0]?.id;
}
export { defaultOpenCodeCustomizationSection, OPENCODE_HIDDEN_CUSTOMIZATION_SECTIONS };
