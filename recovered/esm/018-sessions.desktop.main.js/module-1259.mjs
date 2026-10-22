// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmHistory.ts
import { asCssVariable, registerColor } from "./module-0226.mjs";
import { chartsBlue, chartsPurple } from "./module-0231.mjs";
import { localize } from "./module-0001.mjs";
import { foreground } from "./module-0227.mjs";
import { badgeBackground } from "./module-0228.mjs";
import { PANEL_BACKGROUND } from "./module-0868.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { MarkdownString, isEmptyMarkdownString, isMarkdownString } from "./module-0462.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { $ } from "./module-0075.mjs";


// src/vs/workbench/contrib/scm/browser/scmHistory.ts
var historyItemRefColor = registerColor("scmGraph.historyItemRefColor", chartsBlue, localize(18884, null));

var historyItemRemoteRefColor = registerColor("scmGraph.historyItemRemoteRefColor", chartsPurple, localize(18885, null));

var historyItemBaseRefColor = registerColor("scmGraph.historyItemBaseRefColor", "#EA5C00", localize(18880, null));

var historyItemHoverDefaultLabelForeground = registerColor("scmGraph.historyItemHoverDefaultLabelForeground", foreground, localize(18882, null));

var historyItemHoverDefaultLabelBackground = registerColor("scmGraph.historyItemHoverDefaultLabelBackground", badgeBackground, localize(18881, null));

var historyItemHoverLabelForeground = registerColor("scmGraph.historyItemHoverLabelForeground", PANEL_BACKGROUND, localize(18883, null));

var historyItemHoverAdditionsForeground = registerColor("scmGraph.historyItemHoverAdditionsForeground", { light: "#587C0C", dark: "#81B88B", hcDark: "#A1E3AD", hcLight: "#374E06" }, localize(18873, null));

var historyItemHoverDeletionsForeground = registerColor("scmGraph.historyItemHoverDeletionsForeground", { light: "#AD0707", dark: "#C74E39", hcDark: "#C74E39", hcLight: "#AD0707" }, localize(18874, null));

var colorRegistry3 = [
  registerColor("scmGraph.foreground1", "#FFB000", localize(18875, null)),
  registerColor("scmGraph.foreground2", "#DC267F", localize(18876, null)),
  registerColor("scmGraph.foreground3", "#994F00", localize(18877, null)),
  registerColor("scmGraph.foreground4", "#40B0A6", localize(18878, null)),
  registerColor("scmGraph.foreground5", "#B66DFF", localize(18879, null))
];

function toHistoryItemHoverContent(markdownRendererService, historyItem, includeReferences) {
  const disposables = new DisposableStore();
  if (historyItem.tooltip === void 0) {
    return { content: historyItem.message, disposables };
  }
  if (isMarkdownString(historyItem.tooltip)) {
    return { content: historyItem.tooltip, disposables };
  }
  const tooltipSections = historyItem.tooltip.slice();
  if (includeReferences && historyItem.references?.length) {
    const markdownString = new MarkdownString("", { supportHtml: true, supportThemeIcons: true });
    for (const reference of historyItem.references) {
      const labelIconId = ThemeIcon.isThemeIcon(reference.icon) ? reference.icon.id : "";
      const labelBackgroundColor = reference.color ? asCssVariable(reference.color) : asCssVariable(historyItemHoverDefaultLabelBackground);
      const labelForegroundColor = reference.color ? asCssVariable(historyItemHoverLabelForeground) : asCssVariable(historyItemHoverDefaultLabelForeground);
      markdownString.appendMarkdown(`<span style="color:${labelForegroundColor};background-color:${labelBackgroundColor};border-radius:10px;">&nbsp;$(${labelIconId})&nbsp;`);
      markdownString.appendText(reference.name);
      markdownString.appendMarkdown("&nbsp;&nbsp;</span>");
    }
    markdownString.appendMarkdown(`

---

`);
    tooltipSections.splice(tooltipSections.length - 1, 0, markdownString);
  }
  const hoverContainer = $(".history-item-hover-container");
  for (const markdownString of tooltipSections) {
    if (isEmptyMarkdownString(markdownString)) {
      continue;
    }
    const renderedContent = markdownRendererService.render(markdownString);
    hoverContainer.appendChild(renderedContent.element);
    disposables.add(renderedContent);
  }
  return { content: hoverContainer, disposables };
}
export { toHistoryItemHoverContent, historyItemRefColor, historyItemRemoteRefColor, historyItemBaseRefColor, historyItemHoverDefaultLabelForeground, historyItemHoverDefaultLabelBackground, historyItemHoverLabelForeground, historyItemHoverAdditionsForeground, historyItemHoverDeletionsForeground, colorRegistry3 };
