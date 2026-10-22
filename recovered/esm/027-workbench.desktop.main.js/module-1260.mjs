// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmHistory.ts
import { asCssVariable, registerColor } from "./module-0226.mjs";
import { chartsBlue, chartsPurple } from "./module-0231.mjs";
import { localize } from "./module-0001.mjs";
import { foreground } from "./module-0227.mjs";
import { badgeBackground } from "./module-0228.mjs";
import { PANEL_BACKGROUND } from "./module-0912.mjs";
import { SCMIncomingHistoryItemId, SCMOutgoingHistoryItemId } from "./module-1259.mjs";
import { $, svgElem } from "./module-0075.mjs";
import { deepClone } from "./module-0098.mjs";
import { rot } from "./module-0040.mjs";
import { findLastIdx } from "./module-0006.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { MarkdownString, isEmptyMarkdownString, isMarkdownString } from "./module-0462.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/scm/browser/scmHistory.ts
var SWIMLANE_HEIGHT = 22;

var SWIMLANE_WIDTH = 11;

var SWIMLANE_CURVE_RADIUS = 5;

var CIRCLE_RADIUS = 4;

var CIRCLE_STROKE_WIDTH = 2;

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

function getLabelColorIdentifier(historyItem, colorMap) {
  if (historyItem.id === SCMIncomingHistoryItemId) {
    return historyItemRemoteRefColor;
  } else if (historyItem.id === SCMOutgoingHistoryItemId) {
    return historyItemRefColor;
  } else {
    for (const ref of historyItem.references ?? []) {
      const colorIdentifier = colorMap.get(ref.id);
      if (colorIdentifier !== void 0) {
        return colorIdentifier;
      }
    }
  }
  return void 0;
}

function createPath(colorIdentifier, strokeWidth = 1) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", `${strokeWidth}px`);
  path.setAttribute("stroke-linecap", "round");
  path.style.stroke = asCssVariable(colorIdentifier);
  return path;
}

function drawCircle(index2, radius, strokeWidth, colorIdentifier) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", `${SWIMLANE_WIDTH * (index2 + 1)}`);
  circle.setAttribute("cy", `${SWIMLANE_WIDTH}`);
  circle.setAttribute("r", `${radius}`);
  circle.style.strokeWidth = `${strokeWidth}px`;
  if (colorIdentifier) {
    circle.style.fill = asCssVariable(colorIdentifier);
  }
  return circle;
}

function drawDashedCircle(index2, radius, strokeWidth, colorIdentifier) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", `${SWIMLANE_WIDTH * (index2 + 1)}`);
  circle.setAttribute("cy", `${SWIMLANE_WIDTH}`);
  circle.setAttribute("r", `${CIRCLE_RADIUS + 1}`);
  circle.style.stroke = asCssVariable(colorIdentifier);
  circle.style.strokeWidth = `${strokeWidth}px`;
  circle.style.strokeDasharray = "4,2";
  return circle;
}

function drawVerticalLine(x1, y1, y2, color2, strokeWidth = 1) {
  const path = createPath(color2, strokeWidth);
  path.setAttribute("d", `M ${x1} ${y1} V ${y2}`);
  return path;
}

function findLastIndex(nodes, id2) {
  for (let i2 = nodes.length - 1; i2 >= 0; i2--) {
    if (nodes[i2].id === id2) {
      return i2;
    }
  }
  return -1;
}

function renderSCMHistoryItemGraph(historyItemViewModel) {
  const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg2.classList.add("graph");
  const historyItem = historyItemViewModel.historyItem;
  const inputSwimlanes = historyItemViewModel.inputSwimlanes;
  const outputSwimlanes = historyItemViewModel.outputSwimlanes;
  const inputIndex = inputSwimlanes.findIndex((node) => node.id === historyItem.id);
  const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
  const circleColor = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemRefColor;
  let outputSwimlaneIndex = 0;
  for (let index2 = 0; index2 < inputSwimlanes.length; index2++) {
    const color2 = inputSwimlanes[index2].color;
    if (inputSwimlanes[index2].id === historyItem.id) {
      if (index2 !== circleIndex) {
        const d = [];
        const path = createPath(color2);
        d.push(`M ${SWIMLANE_WIDTH * (index2 + 1)} 0`);
        d.push(`A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * index2} ${SWIMLANE_WIDTH}`);
        d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)}`);
        path.setAttribute("d", d.join(" "));
        svg2.append(path);
      } else {
        outputSwimlaneIndex++;
      }
    } else {
      if (outputSwimlaneIndex < outputSwimlanes.length && inputSwimlanes[index2].id === outputSwimlanes[outputSwimlaneIndex].id) {
        if (index2 === outputSwimlaneIndex) {
          const path = drawVerticalLine(SWIMLANE_WIDTH * (index2 + 1), 0, SWIMLANE_HEIGHT, color2);
          svg2.append(path);
        } else {
          const d = [];
          const path = createPath(color2);
          d.push(`M ${SWIMLANE_WIDTH * (index2 + 1)} 0`);
          d.push(`V 6`);
          d.push(`A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 1 ${SWIMLANE_WIDTH * (index2 + 1) - SWIMLANE_CURVE_RADIUS} ${SWIMLANE_HEIGHT / 2}`);
          d.push(`H ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1) + SWIMLANE_CURVE_RADIUS}`);
          d.push(`A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 0 ${SWIMLANE_WIDTH * (outputSwimlaneIndex + 1)} ${SWIMLANE_HEIGHT / 2 + SWIMLANE_CURVE_RADIUS}`);
          d.push(`V ${SWIMLANE_HEIGHT}`);
          path.setAttribute("d", d.join(" "));
          svg2.append(path);
        }
        outputSwimlaneIndex++;
      }
    }
  }
  for (let i2 = 1; i2 < historyItem.parentIds.length; i2++) {
    const parentOutputIndex = findLastIndex(outputSwimlanes, historyItem.parentIds[i2]);
    if (parentOutputIndex === -1) {
      continue;
    }
    const d = [];
    const path = createPath(outputSwimlanes[parentOutputIndex].color);
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(`A ${SWIMLANE_WIDTH} ${SWIMLANE_WIDTH} 0 0 1 ${SWIMLANE_WIDTH * (parentOutputIndex + 1)} ${SWIMLANE_HEIGHT}`);
    d.push(`M ${SWIMLANE_WIDTH * parentOutputIndex} ${SWIMLANE_HEIGHT / 2}`);
    d.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)} `);
    path.setAttribute("d", d.join(" "));
    svg2.append(path);
  }
  if (inputIndex !== -1) {
    const path = drawVerticalLine(SWIMLANE_WIDTH * (circleIndex + 1), 0, SWIMLANE_HEIGHT / 2, inputSwimlanes[inputIndex].color);
    svg2.append(path);
  }
  if (historyItem.parentIds.length > 0) {
    const path = drawVerticalLine(SWIMLANE_WIDTH * (circleIndex + 1), SWIMLANE_HEIGHT / 2, SWIMLANE_HEIGHT, circleColor);
    svg2.append(path);
  }
  if (historyItemViewModel.kind === "HEAD") {
    const outerCircle = drawCircle(circleIndex, CIRCLE_RADIUS + 3, CIRCLE_STROKE_WIDTH, circleColor);
    svg2.append(outerCircle);
    const innerCircle = drawCircle(circleIndex, CIRCLE_STROKE_WIDTH, CIRCLE_RADIUS);
    svg2.append(innerCircle);
  } else if (historyItemViewModel.kind === "incoming-changes" || historyItemViewModel.kind === "outgoing-changes") {
    const outerCircle = drawCircle(circleIndex, CIRCLE_RADIUS + 3, CIRCLE_STROKE_WIDTH, circleColor);
    svg2.append(outerCircle);
    const innerCircle = drawCircle(circleIndex, CIRCLE_RADIUS + 1, CIRCLE_STROKE_WIDTH + 1);
    svg2.append(innerCircle);
    const dashedCircle = drawDashedCircle(circleIndex, CIRCLE_RADIUS + 1, CIRCLE_STROKE_WIDTH - 1, circleColor);
    svg2.append(dashedCircle);
  } else {
    if (historyItem.parentIds.length > 1) {
      const circleOuter = drawCircle(circleIndex, CIRCLE_RADIUS + 2, CIRCLE_STROKE_WIDTH, circleColor);
      svg2.append(circleOuter);
      const circleInner = drawCircle(circleIndex, CIRCLE_RADIUS - 1, CIRCLE_STROKE_WIDTH, circleColor);
      svg2.append(circleInner);
    } else {
      const circle = drawCircle(circleIndex, CIRCLE_RADIUS + 1, CIRCLE_STROKE_WIDTH, circleColor);
      svg2.append(circle);
    }
  }
  svg2.style.height = `${SWIMLANE_HEIGHT}px`;
  svg2.style.width = `${SWIMLANE_WIDTH * (Math.max(inputSwimlanes.length, outputSwimlanes.length, 1) + 1)}px`;
  return svg2;
}

function renderSCMHistoryGraphPlaceholder(columns, highlightIndex) {
  const elements = svgElem("svg", {
    style: { height: `${SWIMLANE_HEIGHT}px`, width: `${SWIMLANE_WIDTH * (columns.length + 1)}px` }
  });
  for (let index2 = 0; index2 < columns.length; index2++) {
    const strokeWidth = index2 === highlightIndex ? 3 : 1;
    const path = drawVerticalLine(SWIMLANE_WIDTH * (index2 + 1), 0, SWIMLANE_HEIGHT, columns[index2].color, strokeWidth);
    elements.root.append(path);
  }
  return elements.root;
}

function toISCMHistoryItemViewModelArray(historyItems, colorMap = /* @__PURE__ */ new Map(), currentHistoryItemRef, currentHistoryItemRemoteRef, currentHistoryItemBaseRef, addIncomingChanges, addOutgoingChanges, mergeBase) {
  let colorIndex = -1;
  const viewModels = [];
  for (let index2 = 0; index2 < historyItems.length; index2++) {
    const historyItem = historyItems[index2];
    const kind = historyItem.id === currentHistoryItemRef?.revision ? "HEAD" : "node";
    const outputSwimlanesFromPreviousItem = viewModels.at(-1)?.outputSwimlanes ?? [];
    const inputSwimlanes = outputSwimlanesFromPreviousItem.map((i2) => deepClone(i2));
    const outputSwimlanes = [];
    let firstParentAdded = false;
    if (historyItem.parentIds.length > 0) {
      for (const node of inputSwimlanes) {
        if (node.id === historyItem.id) {
          if (!firstParentAdded) {
            outputSwimlanes.push({
              id: historyItem.parentIds[0],
              color: getLabelColorIdentifier(historyItem, colorMap) ?? node.color
            });
            firstParentAdded = true;
          }
          continue;
        }
        outputSwimlanes.push(deepClone(node));
      }
    }
    for (let i2 = firstParentAdded ? 1 : 0; i2 < historyItem.parentIds.length; i2++) {
      let colorIdentifier;
      if (i2 === 0) {
        colorIdentifier = getLabelColorIdentifier(historyItem, colorMap);
      } else {
        const historyItemParent = historyItems.find((h3) => h3.id === historyItem.parentIds[i2]);
        colorIdentifier = historyItemParent ? getLabelColorIdentifier(historyItemParent, colorMap) : void 0;
      }
      if (!colorIdentifier) {
        colorIndex = rot(colorIndex + 1, colorRegistry3.length);
        colorIdentifier = colorRegistry3[colorIndex];
      }
      outputSwimlanes.push({
        id: historyItem.parentIds[i2],
        color: colorIdentifier
      });
    }
    const references = (historyItem.references ?? []).map((ref) => {
      let color2 = colorMap.get(ref.id);
      if (colorMap.has(ref.id) && color2 === void 0) {
        const inputIndex = inputSwimlanes.findIndex((node) => node.id === historyItem.id);
        const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
        color2 = circleIndex < outputSwimlanes.length ? outputSwimlanes[circleIndex].color : circleIndex < inputSwimlanes.length ? inputSwimlanes[circleIndex].color : historyItemRefColor;
      }
      return { ...ref, color: color2 };
    });
    references.sort((ref1, ref2) => compareHistoryItemRefs(ref1, ref2, currentHistoryItemRef, currentHistoryItemRemoteRef, currentHistoryItemBaseRef));
    viewModels.push({
      historyItem: {
        ...historyItem,
        references
      },
      kind,
      inputSwimlanes,
      outputSwimlanes
    });
  }
  addIncomingOutgoingChangesHistoryItems(
    viewModels,
    currentHistoryItemRef,
    currentHistoryItemRemoteRef,
    addIncomingChanges,
    addOutgoingChanges,
    mergeBase
  );
  return viewModels;
}

function getHistoryItemIndex(historyItemViewModel) {
  const historyItem = historyItemViewModel.historyItem;
  const inputSwimlanes = historyItemViewModel.inputSwimlanes;
  const inputIndex = inputSwimlanes.findIndex((node) => node.id === historyItem.id);
  return inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
}

function addIncomingOutgoingChangesHistoryItems(viewModels, currentHistoryItemRef, currentHistoryItemRemoteRef, addIncomingChanges, addOutgoingChanges, mergeBase) {
  if (currentHistoryItemRef?.revision !== currentHistoryItemRemoteRef?.revision && mergeBase) {
    if (addIncomingChanges && currentHistoryItemRemoteRef && currentHistoryItemRemoteRef.revision !== mergeBase) {
      const beforeHistoryItemIndex = findLastIdx(viewModels, (vm) => vm.outputSwimlanes.some((node) => node.id === mergeBase));
      const afterHistoryItemIndex = viewModels.findIndex((vm) => vm.historyItem.id === mergeBase);
      if (beforeHistoryItemIndex !== -1 && afterHistoryItemIndex !== -1) {
        const incomingChangeMerged = viewModels[beforeHistoryItemIndex].historyItem.parentIds.length === 2 && viewModels[beforeHistoryItemIndex].historyItem.parentIds.includes(mergeBase);
        if (!incomingChangeMerged) {
          viewModels[beforeHistoryItemIndex] = {
            ...viewModels[beforeHistoryItemIndex],
            inputSwimlanes: viewModels[beforeHistoryItemIndex].inputSwimlanes.map((node) => {
              return node.id === mergeBase && node.color === historyItemRemoteRefColor ? { ...node, id: SCMIncomingHistoryItemId } : node;
            }),
            outputSwimlanes: viewModels[beforeHistoryItemIndex].outputSwimlanes.map((node) => {
              return node.id === mergeBase && node.color === historyItemRemoteRefColor ? { ...node, id: SCMIncomingHistoryItemId } : node;
            })
          };
          const inputSwimlanes = viewModels[beforeHistoryItemIndex].outputSwimlanes.map((i2) => deepClone(i2));
          const outputSwimlanes = viewModels[afterHistoryItemIndex].inputSwimlanes.map((i2) => deepClone(i2));
          const displayIdLength = viewModels[0].historyItem.displayId?.length ?? 0;
          const incomingChangesHistoryItem = {
            id: SCMIncomingHistoryItemId,
            displayId: "0".repeat(displayIdLength),
            parentIds: [mergeBase],
            author: currentHistoryItemRemoteRef?.name,
            subject: localize(18871, null),
            message: ""
          };
          viewModels.splice(afterHistoryItemIndex, 0, {
            historyItem: incomingChangesHistoryItem,
            kind: "incoming-changes",
            inputSwimlanes,
            outputSwimlanes
          });
        }
      }
    }
    if (addOutgoingChanges && currentHistoryItemRef?.revision && currentHistoryItemRef.revision !== mergeBase) {
      const currentHistoryItemRefIndex = viewModels.findIndex((vm) => vm.kind === "HEAD" && vm.historyItem.id === currentHistoryItemRef.revision);
      if (currentHistoryItemRefIndex !== -1) {
        const outgoingChangesHistoryItem = {
          id: SCMOutgoingHistoryItemId,
          displayId: viewModels[0].historyItem.displayId ? "0".repeat(viewModels[0].historyItem.displayId.length) : void 0,
          parentIds: [currentHistoryItemRef.revision],
          author: currentHistoryItemRef?.name,
          subject: localize(18872, null),
          message: ""
        };
        const inputSwimlanes = viewModels[currentHistoryItemRefIndex].inputSwimlanes.slice(0);
        const outputSwimlanes = inputSwimlanes.slice(0).concat({
          id: currentHistoryItemRef.revision,
          color: historyItemRefColor
        });
        viewModels.splice(currentHistoryItemRefIndex, 0, {
          historyItem: outgoingChangesHistoryItem,
          kind: "outgoing-changes",
          inputSwimlanes,
          outputSwimlanes
        });
        viewModels[currentHistoryItemRefIndex + 1].inputSwimlanes.push({
          id: currentHistoryItemRef.revision,
          color: historyItemRefColor
        });
      }
    }
  }
}

function compareHistoryItemRefs(ref1, ref2, currentHistoryItemRef, currentHistoryItemRemoteRef, currentHistoryItemBaseRef) {
  const getHistoryItemRefOrder = (ref) => {
    if (ref.id === currentHistoryItemRef?.id) {
      return 1;
    } else if (ref.id === currentHistoryItemRemoteRef?.id) {
      return 2;
    } else if (ref.id === currentHistoryItemBaseRef?.id) {
      return 3;
    } else if (ref.color !== void 0) {
      return 4;
    }
    return 99;
  };
  const ref1Order = getHistoryItemRefOrder(ref1);
  const ref2Order = getHistoryItemRefOrder(ref2);
  return ref1Order - ref2Order;
}

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
export { getLabelColorIdentifier, createPath, drawCircle, drawDashedCircle, drawVerticalLine, findLastIndex, renderSCMHistoryItemGraph, renderSCMHistoryGraphPlaceholder, toISCMHistoryItemViewModelArray, getHistoryItemIndex, addIncomingOutgoingChangesHistoryItems, compareHistoryItemRefs, toHistoryItemHoverContent, SWIMLANE_HEIGHT, SWIMLANE_WIDTH, SWIMLANE_CURVE_RADIUS, CIRCLE_RADIUS, CIRCLE_STROKE_WIDTH, historyItemRefColor, historyItemRemoteRefColor, historyItemBaseRefColor, historyItemHoverDefaultLabelForeground, historyItemHoverDefaultLabelBackground, historyItemHoverLabelForeground, historyItemHoverAdditionsForeground, historyItemHoverDeletionsForeground, colorRegistry3 };
