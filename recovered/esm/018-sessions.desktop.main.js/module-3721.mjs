// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/views/automationsAccessibility.ts
import { AutomationsCustomViewFocusContext } from "./module-1770.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { getActiveElement, isHTMLElement } from "./module-0075.mjs";
import { DAYS_OF_WEEK } from "./module-2639.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";


// src/vs/sessions/contrib/sessions/browser/views/automationsAccessibility.ts
var AutomationsCustomViewAccessibilityHelp = class {
  constructor() {
    this.type = "help" /* Help */;
    this.priority = 106;
    this.name = "sessions-automations-help";
    this.when = AutomationsCustomViewFocusContext;
  }
  getProvider(accessor) {
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const restoreFocus = createFocusRestorer(layoutService);
    const content = [
      localize(5431, null),
      localize(5429, null, "<keybinding:editor.action.showContextMenu>"),
      localize(5430, null),
      localize(5432, null),
      localize(5428, null)
    ].join("\n");
    return new AccessibleContentProvider(
      "automations" /* Automations */,
      { type: "help" /* Help */ },
      () => content,
      restoreFocus,
      "accessibility.verbosity.automations" /* Automations */
    );
  }
};

var AutomationsCustomViewAccessibleView = class {
  constructor() {
    this.type = "view" /* View */;
    this.priority = 106;
    this.name = "sessions-automations-view";
    this.when = AutomationsCustomViewFocusContext;
  }
  getProvider(accessor) {
    const automationService = accessor.get(IAutomationService);
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const restoreFocus = createFocusRestorer(layoutService);
    return new AccessibleContentProvider(
      "automations" /* Automations */,
      { type: "view" /* View */ },
      () => buildAutomationsAccessibleContent(
        automationService.automations.get(),
        automationService.runs.get().filter(
          (run) => run.status === "pending" || run.status === "running" || !!run.sessionResource && !!sessionsManagementService.getSession(run.sessionResource)
        )
      ),
      restoreFocus,
      "accessibility.verbosity.automations" /* Automations */
    );
  }
};

function createFocusRestorer(layoutService) {
  const focusedElement = getActiveElement();
  return () => {
    if (isHTMLElement(focusedElement) && focusedElement.isConnected) {
      focusedElement.focus();
    } else {
      layoutService.focusPart("workbench.parts.customViewGrid" /* CUSTOM_VIEW_GRID_PART */);
    }
  };
}

function buildAutomationsAccessibleContent(automations, runs) {
  const lines = [localize(5425, null)];
  if (automations.length === 0) {
    lines.push(localize(5413, null));
  } else {
    for (const automation of automations) {
      lines.push("");
      lines.push(automation.enabled ? localize(5409, null, automation.name) : localize(5410, null, automation.name));
      lines.push(localize(5424, null, formatSchedule2(automation)));
      lines.push(localize(5420, null, automation.prompt));
    }
  }
  lines.push("");
  lines.push(localize(5415, null));
  if (runs.length === 0) {
    lines.push(localize(5418, null));
  } else {
    const automationNames = new Map(automations.map((automation) => [automation.id, automation.name]));
    for (const run of runs) {
      lines.push(localize(
        5421,
        null,
        automationNames.get(run.automationId) ?? localize(5426, null),
        formatRunStatus(run),
        new Date(run.startedAt).toLocaleString()
      ));
      if (run.errorMessage) {
        lines.push(localize(5422, null, run.errorMessage));
      }
    }
  }
  return lines.join("\n");
}

function formatSchedule2(automation) {
  const schedule = automation.schedule;
  switch (schedule.interval) {
    case "manual":
      return localize(5417, null);
    case "hourly":
      return localize(5416, null);
    case "daily":
      return localize(5412, null, formatTime3(schedule.scheduleHour, schedule.scheduleMinute));
    case "weekly":
      return localize(
        5427,
        null,
        DAYS_OF_WEEK[(schedule.scheduleDay % 7 + 7) % 7],
        formatTime3(schedule.scheduleHour, schedule.scheduleMinute)
      );
  }
}

function formatTime3(hour2, minute2) {
  const date = new Date(Date.UTC(2e3, 0, 1, Math.max(0, Math.min(23, hour2 | 0)), Math.max(0, Math.min(59, minute2 | 0))));
  return date.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatRunStatus(run) {
  switch (run.status) {
    case "pending":
      return localize(5419, null);
    case "running":
      return localize(5423, null);
    case "completed":
      return localize(5411, null);
    case "failed":
      return localize(5414, null);
  }
}

AccessibleViewRegistry.register(new AutomationsCustomViewAccessibilityHelp());

AccessibleViewRegistry.register(new AutomationsCustomViewAccessibleView());
export { createFocusRestorer, buildAutomationsAccessibleContent, formatSchedule2, formatTime3, formatRunStatus, AutomationsCustomViewAccessibilityHelp, AutomationsCustomViewAccessibleView };
