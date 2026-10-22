// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsChart.ts
import { $ } from "./module-0075.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { chartsBlue, chartsForeground, chartsLines } from "./module-0231.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/editStats/aiStatsChart.ts
function aggregateSessionsByDay(sessions) {
  const dayMap = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    const date = new Date(session.startTime);
    const isoDate = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString(void 0, { month: "short", day: "numeric" });
    let aggregate = dayMap.get(isoDate);
    if (!aggregate) {
      aggregate = {
        date: isoDate,
        displayDate,
        aiRate: 0,
        totalAiChars: 0,
        totalTypedChars: 0,
        inlineSuggestions: 0,
        chatEdits: 0,
        sessionCount: 0
      };
      dayMap.set(isoDate, aggregate);
    }
    aggregate.totalAiChars += session.aiCharacters;
    aggregate.totalTypedChars += session.typedCharacters;
    aggregate.inlineSuggestions += session.acceptedInlineSuggestions ?? 0;
    aggregate.chatEdits += session.chatEditCount ?? 0;
    aggregate.sessionCount += 1;
  }
  for (const aggregate of dayMap.values()) {
    const total = aggregate.totalAiChars + aggregate.totalTypedChars;
    aggregate.aiRate = total > 0 ? aggregate.totalAiChars / total : 0;
  }
  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function createAiStatsChart(options3) {
  const { sessions: sessionsData, viewMode: mode } = options3;
  const width2 = 280;
  const height = 100;
  const margin = { top: 10, right: 10, bottom: 25, left: 30 };
  const innerWidth = width2 - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const container2 = $(".ai-stats-chart-container");
  container2.style.position = "relative";
  container2.style.marginTop = "8px";
  const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg2.setAttribute("width", `${width2}px`);
  svg2.setAttribute("height", `${height}px`);
  svg2.setAttribute("viewBox", `0 0 ${width2} ${height}`);
  svg2.style.display = "block";
  container2.appendChild(svg2);
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg2.appendChild(g);
  if (sessionsData.length === 0) {
    const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text2.setAttribute("x", `${innerWidth / 2}`);
    text2.setAttribute("y", `${innerHeight / 2}`);
    text2.setAttribute("text-anchor", "middle");
    text2.setAttribute("fill", asCssVariable(chartsForeground));
    text2.setAttribute("font-size", "11px");
    text2.textContent = localize(14957, null);
    g.appendChild(text2);
    return container2;
  }
  const xAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxisLine.setAttribute("x1", "0");
  xAxisLine.setAttribute("y1", `${innerHeight}`);
  xAxisLine.setAttribute("x2", `${innerWidth}`);
  xAxisLine.setAttribute("y2", `${innerHeight}`);
  xAxisLine.setAttribute("stroke", asCssVariable(chartsLines));
  xAxisLine.setAttribute("stroke-width", "1px");
  g.appendChild(xAxisLine);
  const yAxisLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxisLine.setAttribute("x1", "0");
  yAxisLine.setAttribute("y1", "0");
  yAxisLine.setAttribute("x2", "0");
  yAxisLine.setAttribute("y2", `${innerHeight}`);
  yAxisLine.setAttribute("stroke", asCssVariable(chartsLines));
  yAxisLine.setAttribute("stroke-width", "1px");
  g.appendChild(yAxisLine);
  for (const pct2 of [0, 50, 100]) {
    const y = innerHeight - pct2 / 100 * innerHeight;
    const label3 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label3.setAttribute("x", "-4");
    label3.setAttribute("y", `${y + 3}`);
    label3.setAttribute("text-anchor", "end");
    label3.setAttribute("fill", asCssVariable(chartsForeground));
    label3.setAttribute("font-size", "9px");
    label3.textContent = `${pct2}%`;
    g.appendChild(label3);
    if (pct2 > 0) {
      const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      gridLine.setAttribute("x1", "0");
      gridLine.setAttribute("y1", `${y}`);
      gridLine.setAttribute("x2", `${innerWidth}`);
      gridLine.setAttribute("y2", `${y}`);
      gridLine.setAttribute("stroke", asCssVariable(chartsLines));
      gridLine.setAttribute("stroke-width", "0.5px");
      gridLine.setAttribute("stroke-dasharray", "2,2");
      g.appendChild(gridLine);
    }
  }
  if (mode === "days") {
    renderDaysView();
  } else {
    renderSessionsView();
  }
  function renderDaysView() {
    const dailyData = aggregateSessionsByDay(sessionsData);
    const barCount = dailyData.length;
    const barWidth = Math.min(20, (innerWidth - (barCount - 1) * 2) / barCount);
    const gap = 2;
    const totalBarSpace = barCount * barWidth + (barCount - 1) * gap;
    const startX = (innerWidth - totalBarSpace) / 2;
    const minLabelSpacing = 40;
    const totalWidth = totalBarSpace;
    const maxLabels = Math.max(2, Math.floor(totalWidth / minLabelSpacing));
    const labelStep = Math.max(1, Math.ceil(barCount / maxLabels));
    dailyData.forEach((day2, i2) => {
      const x = startX + i2 * (barWidth + gap);
      const barHeight = day2.aiRate * innerHeight;
      const y = innerHeight - barHeight;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", `${x}`);
      rect.setAttribute("y", `${y}`);
      rect.setAttribute("width", `${barWidth}`);
      rect.setAttribute("height", `${Math.max(1, barHeight)}`);
      rect.setAttribute("fill", asCssVariable(chartsBlue));
      rect.setAttribute("rx", "2");
      g.appendChild(rect);
      const isFirst = i2 === 0;
      const isLast = i2 === barCount - 1;
      const isAtInterval = i2 % labelStep === 0;
      if (isFirst || isLast || isAtInterval && barCount > 2) {
        if (!isFirst && !isLast) {
          const distFromFirst = i2 * (barWidth + gap);
          const distFromLast = (barCount - 1 - i2) * (barWidth + gap);
          if (distFromFirst < minLabelSpacing || distFromLast < minLabelSpacing) {
            return;
          }
        }
        const label3 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label3.setAttribute("x", `${x + barWidth / 2}`);
        label3.setAttribute("y", `${innerHeight + 12}`);
        label3.setAttribute("text-anchor", "middle");
        label3.setAttribute("fill", asCssVariable(chartsForeground));
        label3.setAttribute("font-size", "8px");
        label3.textContent = day2.displayDate;
        g.appendChild(label3);
      }
    });
  }
  function renderSessionsView() {
    const sessionCount = sessionsData.length;
    const barWidth = Math.min(8, (innerWidth - (sessionCount - 1) * 1) / sessionCount);
    const gap = 1;
    const totalBarSpace = sessionCount * barWidth + (sessionCount - 1) * gap;
    const startX = (innerWidth - totalBarSpace) / 2;
    sessionsData.forEach((session, i2) => {
      const total = session.aiCharacters + session.typedCharacters;
      const aiRate = total > 0 ? session.aiCharacters / total : 0;
      const x = startX + i2 * (barWidth + gap);
      const barHeight = aiRate * innerHeight;
      const y = innerHeight - barHeight;
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", `${x}`);
      rect.setAttribute("y", `${y}`);
      rect.setAttribute("width", `${barWidth}`);
      rect.setAttribute("height", `${Math.max(1, barHeight)}`);
      rect.setAttribute("fill", asCssVariable(chartsBlue));
      rect.setAttribute("rx", "1");
      g.appendChild(rect);
    });
    const minLabelSpacing = 40;
    if (sessionCount === 0) {
      return;
    }
    const firstSession = sessionsData[0];
    const firstX = startX;
    const firstDate = new Date(firstSession.startTime);
    const firstLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    firstLabel.setAttribute("x", `${firstX + barWidth / 2}`);
    firstLabel.setAttribute("y", `${innerHeight + 12}`);
    firstLabel.setAttribute("text-anchor", "start");
    firstLabel.setAttribute("fill", asCssVariable(chartsForeground));
    firstLabel.setAttribute("font-size", "8px");
    firstLabel.textContent = firstDate.toLocaleDateString(void 0, { month: "short", day: "numeric" });
    g.appendChild(firstLabel);
    if (sessionCount > 1 && totalBarSpace >= minLabelSpacing) {
      const lastSession = sessionsData[sessionCount - 1];
      const lastX = startX + (sessionCount - 1) * (barWidth + gap);
      const lastDate = new Date(lastSession.startTime);
      const lastLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      lastLabel.setAttribute("x", `${lastX + barWidth / 2}`);
      lastLabel.setAttribute("y", `${innerHeight + 12}`);
      lastLabel.setAttribute("text-anchor", "end");
      lastLabel.setAttribute("fill", asCssVariable(chartsForeground));
      lastLabel.setAttribute("font-size", "8px");
      lastLabel.textContent = lastDate.toLocaleDateString(void 0, { month: "short", day: "numeric" });
      g.appendChild(lastLabel);
    }
  }
  return container2;
}
export { aggregateSessionsByDay, createAiStatsChart };
