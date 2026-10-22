// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalTooltip.ts
import { localize } from "./module-0001.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { basename } from "./module-0026.mjs";
import { asArray } from "./module-0007.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalTooltip.ts
function getInstanceHoverInfo(instance2, storageService) {
  const showDetailed = parseInt(storageService.get("terminal.integrated.tabs.showDetailed" /* TabsShowDetailed */, -1 /* APPLICATION */) ?? "0");
  let statusString = "";
  const statuses = instance2.statusList.statuses;
  const actions = [];
  for (const status2 of statuses) {
    if (showDetailed) {
      if (status2.detailedTooltip ?? status2.tooltip) {
        statusString += `

---

${status2.icon ? `$(${status2.icon?.id}) ` : ""}` + (status2.detailedTooltip ?? status2.tooltip ?? "");
      }
    } else {
      if (status2.tooltip) {
        statusString += `

---

${status2.icon ? `$(${status2.icon?.id}) ` : ""}` + (status2.tooltip ?? "");
      }
    }
    if (status2.hoverActions) {
      actions.push(...status2.hoverActions);
    }
  }
  actions.push({
    commandId: "toggleDetailedInfo",
    label: showDetailed ? localize(20091, null) : localize(20094, null),
    run() {
      storageService.store("terminal.integrated.tabs.showDetailed" /* TabsShowDetailed */, (showDetailed + 1) % 2, -1 /* APPLICATION */, 0 /* USER */);
    }
  });
  const shellProcessString = getShellProcessTooltip(instance2, !!showDetailed);
  const content = new MarkdownString(instance2.title + shellProcessString + statusString, { supportThemeIcons: true });
  return { content, actions };
}

function getShellProcessTooltip(instance2, showDetailed) {
  const lines = [];
  if (instance2.processId && instance2.processId > 0) {
    lines.push(localize(20093, null, "PID", instance2.processId) + "\n");
  }
  if (instance2.shellLaunchConfig.executable) {
    let commandLine = "";
    if (!showDetailed && instance2.shellLaunchConfig.executable.length > 32) {
      const base = basename(instance2.shellLaunchConfig.executable);
      const sepIndex = instance2.shellLaunchConfig.executable.length - base.length - 1;
      const sep2 = instance2.shellLaunchConfig.executable.substring(sepIndex, sepIndex + 1);
      commandLine += `\u2026${sep2}${base}`;
    } else {
      commandLine += instance2.shellLaunchConfig.executable;
    }
    const args2 = asArray(instance2.injectedArgs || instance2.shellLaunchConfig.args || []).map((x) => x.match(/\s/) ? `'${x}'` : x).join(" ");
    if (args2) {
      commandLine += ` ${args2}`;
    }
    lines.push(localize(20092, null, commandLine));
  }
  return lines.length ? `

---

${lines.join("\n")}` : "";
}
export { getInstanceHoverInfo, getShellProcessTooltip };
