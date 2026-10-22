// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsBanner.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID } from "./module-0964.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { $, addDisposableListener } from "./module-0075.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsBanner.ts
function canShowAgentsBanner(chatEntitlementService) {
  const sentiment = chatEntitlementService.sentiment;
  if (sentiment.hidden || sentiment.disabled) {
    return false;
  }
  return !!CommandsRegistry.getCommand(OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID);
}

function createAgentsBanner(options3, commandService, telemetryService) {
  const disposables = new DisposableStore();
  const label3 = options3.label ?? localize(9135, null);
  const button = $(
    "button.agents-banner-button",
    {
      title: label3
    },
    $(".codicon.codicon-agent.icon-widget"),
    $("span.category-title", {}, label3)
  );
  disposables.add(addDisposableListener(button, "click", () => {
    options3.onButtonClick?.();
    telemetryService.publicLog2("agentsBanner.clicked", { source: options3.source, action: "openAgentsWindow" });
    commandService.executeCommand(OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID, { source: "banner" /* Banner */ });
  }));
  const element = $(`.${options3.cssClass}`, {}, button);
  return { element, disposables };
}
export { canShowAgentsBanner, createAgentsBanner };
