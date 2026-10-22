// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationIcons.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { AICustomizationSources } from "./module-0996.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationIcons.ts
var aiCustomizationViewIcon = registerIcon("ai-customization-view-icon", Codicon.sparkle, localize(9286, null));

var agentIcon = registerIcon("ai-customization-agent", Codicon.agent, localize(9273, null));

var skillIcon = registerIcon("ai-customization-skill", Codicon.lightbulb, localize(9283, null));

var instructionsIcon = registerIcon("ai-customization-instructions", Codicon.book, localize(9278, null));

var promptIcon = registerIcon("ai-customization-prompt", Codicon.bookmark, localize(9281, null));

var hookIcon = registerIcon("ai-customization-hook", Codicon.zap, localize(9277, null));

var automationIcon = registerIcon("ai-customization-automation", Codicon.watch, localize(9274, null));

var addIcon = registerIcon("ai-customization-add", Codicon.add, localize(9272, null));

var runIcon = registerIcon("ai-customization-run", Codicon.play, localize(9282, null));

var workspaceIcon = registerIcon("ai-customization-workspace", Codicon.folder, localize(9287, null));

var userIcon = registerIcon("ai-customization-user", Codicon.account, localize(9285, null));

var extensionIcon = registerIcon("ai-customization-extension", Codicon.extensions, localize(9276, null));

var pluginIcon = registerIcon("ai-customization-plugin", Codicon.plug, localize(9280, null));

var toolsIcon = registerIcon("ai-customization-tools", Codicon.tools, localize(9284, null));

var builtinIcon = registerIcon("ai-customization-builtin", Codicon.starFull, localize(9275, null));

var mcpServerIcon = registerIcon("ai-customization-mcp-server", Codicon.server, localize(9279, null));

function sourceToIcon(source) {
  switch (source) {
    case AICustomizationSources.local:
      return workspaceIcon;
    case AICustomizationSources.user:
      return userIcon;
    case AICustomizationSources.extension:
      return extensionIcon;
    case AICustomizationSources.plugin:
      return pluginIcon;
    case AICustomizationSources.builtin:
      return builtinIcon;
    default:
      return instructionsIcon;
  }
}
export { sourceToIcon, aiCustomizationViewIcon, agentIcon, skillIcon, instructionsIcon, promptIcon, hookIcon, automationIcon, addIcon, runIcon, workspaceIcon, userIcon, extensionIcon, pluginIcon, toolsIcon, builtinIcon, mcpServerIcon };
