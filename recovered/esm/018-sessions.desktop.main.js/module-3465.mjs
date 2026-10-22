// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/agentsPartCard.ts
import { AGENTS_FLOATING_PANEL_GAP } from "./module-1498.mjs";
import { agentsCardBorder, agentsPanelBackground, agentsPanelForeground } from "./module-1496.mjs";


// src/vs/sessions/browser/parts/agentsPartCard.ts
var AGENTS_PART_CARD_CLASS = "agents-part-card";

var AgentsPartCard = {
  MARGIN_TOP: 0,
  MARGIN_LEFT: 0,
  MARGIN_RIGHT: AGENTS_FLOATING_PANEL_GAP,
  MARGIN_RIGHT_NO_EDITOR_PANE: 0,
  MARGIN_BOTTOM: 0,
  BORDER_WIDTH: 1
};

function getAgentsPartCardContentSize(width2, height, editorPaneVisible) {
  const borderTotal = AgentsPartCard.BORDER_WIDTH * 2;
  const marginRight = editorPaneVisible ? AgentsPartCard.MARGIN_RIGHT : AgentsPartCard.MARGIN_RIGHT_NO_EDITOR_PANE;
  return {
    width: width2 - AgentsPartCard.MARGIN_LEFT - marginRight - borderTotal,
    height: height - AgentsPartCard.MARGIN_TOP - AgentsPartCard.MARGIN_BOTTOM - borderTotal
  };
}

function applyAgentsPartCardStyles(container2, theme) {
  container2.style.setProperty("--part-background", theme.getColor(agentsPanelBackground)?.toString() ?? "");
  container2.style.setProperty("--part-border-color", theme.getColor(agentsCardBorder)?.toString() ?? "transparent");
  container2.style.setProperty("--part-foreground", theme.getColor(agentsPanelForeground)?.toString() ?? "");
  container2.style.backgroundColor = theme.getColor(agentsPanelBackground)?.toString() ?? "";
}

function clearAgentsPartCardStyles(container2) {
  container2.style.backgroundColor = "";
  container2.style.removeProperty("--part-background");
  container2.style.removeProperty("--part-border-color");
  container2.style.color = "";
}
export { getAgentsPartCardContentSize, applyAgentsPartCardStyles, clearAgentsPartCardStyles, AGENTS_PART_CARD_CLASS, AgentsPartCard };
