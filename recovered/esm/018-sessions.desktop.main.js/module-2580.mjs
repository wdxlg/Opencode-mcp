// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatCustomizationDiscoveryRenderer.ts
import { $, EventHelper, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { dirname2 } from "./module-0034.mjs";
import { InlineAnchorWidget } from "./module-2115.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { Button } from "./module-0546.mjs";
import { setupCollapsibleToggle } from "./module-2579.mjs";
import { getCompactCodicon } from "./module-2035.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatCustomizationDiscoveryRenderer.ts
var $71 = $;

function getSettingsKeyForDiscoveryType(discoveryType) {
  switch (discoveryType) {
    case "prompt":
      return "chat.promptFilesLocations";
    case "instructions":
      return "chat.instructionsFilesLocations";
    case "agent":
      return "chat.agentFilesLocations";
    case "skill":
      return "chat.agentSkillsLocations";
    case "hook":
      return "chat.hookFilesLocations";
    default:
      return void 0;
  }
}

function getFileLocationLabel(file, labelService, discoveryType) {
  if (file.extensionId) {
    return file.extensionId;
  }
  const parentDir = discoveryType === "skill" ? dirname2(dirname2(file.uri)) : dirname2(file.uri);
  return labelService.getUriLabel(parentDir, { relative: true });
}

function createInlineFileLink(uri4, displayText, fileKind, openerService, modelService, languageService, hoverService, labelService, disposables, hoverSuffix) {
  const link2 = $71(`a.${InlineAnchorWidget.className}.show-file-icons`);
  link2.tabIndex = -1;
  const iconEl = append(link2, $71("span.icon"));
  const iconClasses = getIconClasses(modelService, languageService, uri4, fileKind);
  iconEl.classList.add(...iconClasses);
  append(link2, $71("span.icon-label", void 0, displayText));
  const relativeLabel = labelService.getUriLabel(uri4, { relative: true });
  const hoverText = hoverSuffix ? `${relativeLabel} ${hoverSuffix}` : relativeLabel;
  disposables.add(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link2, hoverText));
  disposables.add(addDisposableListener(link2, EventType.CLICK, (e4) => {
    e4.preventDefault();
    e4.stopPropagation();
    openerService.open(uri4, { editorOptions: { preserveFocus: true } });
  }));
  return link2;
}

function setupFileListNavigation(listEl, rows, disposables) {
  if (rows.length === 0) {
    return;
  }
  for (let i2 = 0; i2 < rows.length; i2++) {
    rows[i2].element.tabIndex = i2 === 0 ? 0 : -1;
    rows[i2].element.setAttribute("role", "listitem");
  }
  disposables.add(addDisposableListener(listEl, EventType.KEY_DOWN, (e4) => {
    const target = e4.target;
    const index2 = rows.findIndex((r2) => r2.element === target);
    if (index2 === -1) {
      return;
    }
    let nextIndex;
    switch (e4.key) {
      case "ArrowDown":
        nextIndex = Math.min(index2 + 1, rows.length - 1);
        break;
      case "ArrowUp":
        nextIndex = Math.max(index2 - 1, 0);
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = rows.length - 1;
        break;
      case "Enter": {
        rows[index2].activate();
        e4.preventDefault();
        return;
      }
    }
    if (nextIndex !== void 0 && nextIndex !== index2) {
      e4.preventDefault();
      rows[index2].element.tabIndex = -1;
      rows[nextIndex].element.tabIndex = 0;
      rows[nextIndex].element.focus();
    }
  }));
}

function renderCustomizationDiscoveryContent(content, openerService, modelService, languageService, hoverService, labelService, scrollable) {
  const disposables = new DisposableStore();
  const container2 = $71("div.chat-debug-file-list");
  container2.tabIndex = 0;
  const capitalizedType = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
  append(container2, $71("div.chat-debug-file-list-title", void 0, localize(10342, null, capitalizedType)));
  append(container2, $71("div.chat-debug-file-list-summary", void 0, localize(10363, null, content.files.length)));
  const loaded = content.files.filter((f) => f.status === "loaded");
  if (loaded.length > 0) {
    const section = append(container2, $71("div.chat-debug-file-list-section"));
    append(section, $71(
      "div.chat-debug-file-list-section-title",
      void 0,
      localize(10344, null, loaded.length)
    ));
    const groups = /* @__PURE__ */ new Map();
    for (const file of loaded) {
      const key3 = getFileLocationLabel(file, labelService, content.discoveryType);
      let group2 = groups.get(key3);
      if (!group2) {
        group2 = [];
        groups.set(key3, group2);
      }
      group2.push(file);
    }
    const listEl = append(section, $71("div.chat-debug-file-list-rows"));
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", localize(10345, null));
    const rows = [];
    for (const [locationLabel, files] of groups) {
      const groupHeader = append(listEl, $71("div.chat-debug-file-list-group-header"));
      const firstFile = files[0];
      if (firstFile.extensionId) {
        const link2 = append(groupHeader, $71("a.chat-debug-file-list-group-label.chat-debug-file-list-badge-link"));
        link2.textContent = locationLabel;
        link2.tabIndex = -1;
        disposables.add(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link2, localize(10347, null, firstFile.extensionId)));
        disposables.add(addDisposableListener(link2, EventType.CLICK, (e4) => {
          e4.preventDefault();
          e4.stopPropagation();
          openerService.open(URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([firstFile.extensionId]))}`), { allowCommands: true });
        }));
      } else {
        append(groupHeader, $71("span.chat-debug-file-list-group-label", void 0, locationLabel));
      }
      for (const file of files) {
        const row = append(listEl, $71("div.chat-debug-file-list-row"));
        append(row, $71(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(Codicon.checkCompact)}`));
        row.appendChild(createInlineFileLink(file.uri, file.name ?? file.uri.path, 0 /* FILE */, openerService, modelService, languageService, hoverService, labelService, disposables));
        const relativeLabel = labelService.getUriLabel(file.uri, { relative: true });
        row.setAttribute("aria-label", relativeLabel);
        const uri4 = file.uri;
        rows.push({ element: row, activate: () => openerService.open(uri4, { editorOptions: { preserveFocus: true } }) });
      }
    }
    setupFileListNavigation(listEl, rows, disposables);
  }
  const skipped = content.files.filter((f) => f.status === "skipped");
  if (skipped.length > 0) {
    const section = append(container2, $71("div.chat-debug-file-list-section"));
    append(section, $71(
      "div.chat-debug-file-list-section-title",
      void 0,
      localize(10358, null, skipped.length)
    ));
    const groups = /* @__PURE__ */ new Map();
    for (const file of skipped) {
      const key3 = file.skipReason ?? localize(10364, null);
      let group2 = groups.get(key3);
      if (!group2) {
        group2 = [];
        groups.set(key3, group2);
      }
      group2.push(file);
    }
    const listEl = append(section, $71("div.chat-debug-file-list-rows"));
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", localize(10359, null));
    const rows = [];
    for (const [reasonLabel, files] of groups) {
      const groupHeader = append(listEl, $71("div.chat-debug-file-list-group-header"));
      append(groupHeader, $71("span.chat-debug-file-list-group-label", void 0, reasonLabel));
      for (const file of files) {
        const row = append(listEl, $71("div.chat-debug-file-list-row"));
        append(row, $71(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(Codicon.closeCompact)}`));
        let detail2 = "";
        if (file.errorMessage) {
          detail2 += file.errorMessage;
        }
        if (file.duplicateOf) {
          if (detail2) {
            detail2 += ", ";
          }
          detail2 += localize(10343, null, file.duplicateOf.path);
        }
        row.appendChild(createInlineFileLink(file.uri, file.name ?? file.uri.path, 0 /* FILE */, openerService, modelService, languageService, hoverService, labelService, disposables));
        if (detail2) {
          append(row, $71("span.chat-debug-file-list-detail", void 0, ` (${detail2})`));
        }
        const relativeLabel = labelService.getUriLabel(file.uri, { relative: true });
        row.setAttribute("aria-label", relativeLabel);
        const uri4 = file.uri;
        rows.push({ element: row, activate: () => openerService.open(uri4, { editorOptions: { preserveFocus: true } }) });
      }
    }
    setupFileListNavigation(listEl, rows, disposables);
  }
  if (content.sourceFolders && content.sourceFolders.length > 0) {
    const sectionEl = append(container2, $71("div.chat-debug-message-section"));
    const header2 = append(sectionEl, $71("div.chat-debug-message-section-header"));
    const chevron = append(header2, $71("span.chat-debug-message-section-chevron"));
    append(header2, $71(
      "span.chat-debug-message-section-title",
      void 0,
      localize(10360, null, content.sourceFolders.length)
    ));
    const settingsKey = getSettingsKeyForDiscoveryType(content.discoveryType);
    if (settingsKey) {
      const gearBtn = disposables.add(new Button(header2, {
        title: localize(10348, null),
        ariaLabel: localize(10333, null),
        hoverDelegate: getDefaultHoverDelegate("mouse")
      }));
      gearBtn.icon = Codicon.settingsGear;
      gearBtn.element.classList.add("chat-debug-settings-gear");
      disposables.add(addDisposableListener(gearBtn.element, EventType.MOUSE_ENTER, () => {
        header2.classList.add("chat-debug-settings-gear-header-passthrough");
      }));
      disposables.add(addDisposableListener(gearBtn.element, EventType.MOUSE_LEAVE, () => {
        header2.classList.remove("chat-debug-settings-gear-header-passthrough");
      }));
      disposables.add(gearBtn.onDidClick((e4) => {
        if (e4) {
          EventHelper.stop(e4, true);
        }
        openerService.open(URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([`@id:${settingsKey}`]))}`), { allowCommands: true });
      }));
    }
    const contentEl = append(sectionEl, $71("div.chat-debug-source-folder-content"));
    contentEl.tabIndex = 0;
    contentEl.setAttribute("role", "region");
    contentEl.setAttribute("aria-label", localize(10361, null));
    const capitalizedType2 = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
    const sourcesCaption = capitalizedType2.endsWith("s") ? capitalizedType2 : capitalizedType2 + "s";
    append(contentEl, $71(
      "div.chat-debug-source-folder-note",
      void 0,
      localize(10362, null, sourcesCaption)
    ));
    for (let i2 = 0; i2 < content.sourceFolders.length; i2++) {
      const folder = content.sourceFolders[i2];
      const row = append(contentEl, $71("div.chat-debug-source-folder-row"));
      append(row, $71("span.chat-debug-source-folder-index", void 0, `${i2 + 1}.`));
      append(row, $71("span.chat-debug-source-folder-label", void 0, folder.uri.path));
    }
    setupCollapsibleToggle(
      chevron,
      header2,
      contentEl,
      disposables,
      /* initiallyCollapsed */
      true,
      scrollable
    );
  }
  return { element: container2, disposables };
}

function fileListToPlainText(content) {
  const lines = [];
  const capitalizedType = content.discoveryType.charAt(0).toUpperCase() + content.discoveryType.slice(1);
  lines.push(localize(10351, null, capitalizedType));
  lines.push(localize(10356, null, content.files.length));
  lines.push("");
  const loaded = content.files.filter((f) => f.status === "loaded");
  const skipped = content.files.filter((f) => f.status === "skipped");
  if (loaded.length > 0) {
    lines.push(localize(10353, null, loaded.length));
    const groups = /* @__PURE__ */ new Map();
    for (const f of loaded) {
      const parentDir = content.discoveryType === "skill" ? dirname2(dirname2(f.uri)) : dirname2(f.uri);
      const key3 = f.extensionId ?? parentDir.path;
      let group2 = groups.get(key3);
      if (!group2) {
        group2 = [];
        groups.set(key3, group2);
      }
      group2.push(f);
    }
    for (const [locationLabel, files] of groups) {
      lines.push(`  ${locationLabel}`);
      for (const f of files) {
        const label3 = f.name ?? f.uri.path;
        lines.push(`    \u2713 ${label3}`);
      }
    }
    lines.push("");
  }
  if (skipped.length > 0) {
    lines.push(localize(10354, null, skipped.length));
    const skippedGroups = /* @__PURE__ */ new Map();
    for (const f of skipped) {
      const key3 = f.skipReason ?? localize(10357, null);
      let group2 = skippedGroups.get(key3);
      if (!group2) {
        group2 = [];
        skippedGroups.set(key3, group2);
      }
      group2.push(f);
    }
    for (const [reasonLabel, files] of skippedGroups) {
      lines.push(`  ${reasonLabel}`);
      for (const f of files) {
        const label3 = f.name ?? f.uri.path;
        let detail2 = `    \u2717 ${label3}`;
        if (f.errorMessage || f.duplicateOf) {
          const parts = [];
          if (f.errorMessage) {
            parts.push(f.errorMessage);
          }
          if (f.duplicateOf) {
            parts.push(localize(10352, null, f.duplicateOf.path));
          }
          detail2 += ` (${parts.join(", ")})`;
        }
        lines.push(detail2);
      }
    }
  }
  if (content.sourceFolders && content.sourceFolders.length > 0) {
    lines.push("");
    lines.push(localize(10355, null, content.sourceFolders.length));
    for (const folder of content.sourceFolders) {
      lines.push(`  ${folder.uri.path}`);
    }
  }
  return lines.join("\n");
}

function getCategorySectionTitle(category9, count2) {
  switch (category9) {
    case "applying":
      return localize(10336, null, count2);
    case "referenced":
      return localize(10337, null, count2);
    case "skill":
      return localize(10338, null, count2);
    case "custom-agent":
      return localize(10334, null, count2);
    case "hook":
      return localize(10335, null, count2);
    case "skipped":
      return localize(10339, null, count2);
  }
}

function renderCustomizationSummaryContent(content, openerService, modelService, languageService, hoverService, labelService, scrollable) {
  const disposables = new DisposableStore();
  const container2 = $71("div.chat-debug-customization-summary");
  container2.tabIndex = 0;
  const mainSection = append(container2, $71("div.chat-debug-file-list"));
  append(mainSection, $71(
    "div.chat-debug-file-list-title",
    void 0,
    localize(10341, null)
  ));
  append(mainSection, $71(
    "div.chat-debug-file-list-summary",
    void 0,
    localize(
      10340,
      null,
      content.counts.instructions,
      content.counts.skills,
      content.counts.agents,
      content.counts.hooks,
      content.counts.skipped,
      content.durationInMillis.toFixed(1)
    )
  ));
  const instructionEntries = content.resolutionLogs.filter((e4) => e4.category === "applying" || e4.category === "referenced");
  const skillEntries = content.resolutionLogs.filter((e4) => e4.category === "skill");
  const agentEntries = content.resolutionLogs.filter((e4) => e4.category === "custom-agent");
  const hookEntries = content.resolutionLogs.filter((e4) => e4.category === "hook");
  const skippedEntries = content.resolutionLogs.filter((e4) => e4.category === "skipped");
  const sections = [
    { title: getCategorySectionTitle("applying", instructionEntries.length), icon: Codicon.book, entries: instructionEntries },
    { title: getCategorySectionTitle("skill", skillEntries.length), icon: Codicon.lightbulb, entries: skillEntries },
    { title: getCategorySectionTitle("custom-agent", agentEntries.length), icon: Codicon.agent, entries: agentEntries },
    { title: getCategorySectionTitle("hook", hookEntries.length), icon: Codicon.zap, entries: hookEntries },
    { title: getCategorySectionTitle("skipped", skippedEntries.length), icon: Codicon.close, entries: skippedEntries }
  ];
  for (const { title, icon: icon2, entries: entries2 } of sections) {
    if (entries2.length === 0) {
      continue;
    }
    const section = append(mainSection, $71("div.chat-debug-file-list-section"));
    append(section, $71("div.chat-debug-file-list-section-title", void 0, title));
    const listEl = append(section, $71("div.chat-debug-file-list-rows"));
    listEl.setAttribute("role", "list");
    listEl.setAttribute("aria-label", title);
    const rows = [];
    const isHookSection = entries2.length > 0 && entries2[0].category === "hook";
    if (isHookSection) {
      const groupedByType = /* @__PURE__ */ new Map();
      for (const entry of entries2) {
        const hookType = entry.reason ?? "";
        let group2 = groupedByType.get(hookType);
        if (!group2) {
          group2 = [];
          groupedByType.set(hookType, group2);
        }
        group2.push(entry);
      }
      for (const [hookType, groupEntries] of groupedByType) {
        if (hookType) {
          append(listEl, $71("div.chat-debug-file-list-group-header", void 0, hookType));
        }
        for (const entry of groupEntries) {
          const row = append(listEl, $71("div.chat-debug-file-list-row"));
          append(row, $71(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(getCompactCodicon(icon2))}`));
          if (entry.uri) {
            row.appendChild(createInlineFileLink(
              entry.uri,
              entry.name,
              0 /* FILE */,
              openerService,
              modelService,
              languageService,
              hoverService,
              labelService,
              disposables
            ));
            const uri4 = entry.uri;
            rows.push({ element: row, activate: () => openerService.open(uri4, { editorOptions: { preserveFocus: true } }) });
          } else {
            append(row, $71("span", void 0, entry.name));
          }
          row.setAttribute("aria-label", entry.reason ? `${entry.name} \u2014 ${entry.reason}` : entry.name);
        }
      }
    } else {
      for (const entry of entries2) {
        const row = append(listEl, $71("div.chat-debug-file-list-row"));
        append(row, $71(`span.chat-debug-file-list-icon${ThemeIcon.asCSSSelector(getCompactCodicon(icon2))}`));
        const showReason = entry.category !== "skill" && entry.category !== "custom-agent";
        if (entry.uri) {
          row.appendChild(createInlineFileLink(
            entry.uri,
            entry.name,
            0 /* FILE */,
            openerService,
            modelService,
            languageService,
            hoverService,
            labelService,
            disposables,
            showReason ? entry.reason : void 0
          ));
          const uri4 = entry.uri;
          rows.push({ element: row, activate: () => openerService.open(uri4, { editorOptions: { preserveFocus: true } }) });
        } else {
          append(row, $71("span", void 0, entry.name));
        }
        if (showReason && entry.reason) {
          append(row, $71("span.chat-debug-file-list-detail", void 0, ` \u2014 ${entry.reason}`));
        }
        row.setAttribute("aria-label", entry.reason ? `${entry.name} \u2014 ${entry.reason}` : entry.name);
      }
    }
    setupFileListNavigation(listEl, rows, disposables);
  }
  if (content.resolutionLogs.length === 0) {
    append(mainSection, $71(
      "div.chat-debug-file-list-summary",
      void 0,
      localize(10346, null)
    ));
  }
  return { element: container2, disposables };
}

function customizationSummaryToPlainText(content) {
  const lines = [];
  lines.push(localize(10350, null));
  lines.push(localize(
    10349,
    null,
    content.counts.instructions,
    content.counts.skills,
    content.counts.agents,
    content.counts.hooks,
    content.counts.skipped,
    content.durationInMillis.toFixed(1)
  ));
  lines.push("");
  for (const entry of content.resolutionLogs) {
    const detail2 = entry.reason ? `${entry.name} \u2014 ${entry.reason}` : entry.name;
    lines.push(`  [${entry.category}] ${detail2}`);
  }
  return lines.join("\n");
}
export { getSettingsKeyForDiscoveryType, getFileLocationLabel, createInlineFileLink, setupFileListNavigation, renderCustomizationDiscoveryContent, fileListToPlainText, getCategorySectionTitle, renderCustomizationSummaryContent, customizationSummaryToPlainText, $71 };
