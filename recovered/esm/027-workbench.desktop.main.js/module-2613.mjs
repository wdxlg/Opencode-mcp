// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowLayout.ts



// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowLayout.ts
var NODE_HEIGHT = 36;

var MESSAGE_NODE_HEIGHT = 52;

var NODE_MIN_WIDTH = 140;

var NODE_MAX_WIDTH = 320;

var NODE_PADDING_H = 16;

var NODE_PADDING_V = 6;

var NODE_GAP_Y = 24;

var NODE_BORDER_RADIUS = 6;

var EDGE_STROKE_WIDTH = 1.5;

var FONT_SIZE = 12;

var SUBLABEL_FONT_SIZE = 10;

var SUBGRAPH_PADDING = 12;

var CANVAS_PADDING = 24;

var PARALLEL_GAP_X = 40;

var SUBGRAPH_HEADER_HEIGHT = 22;

var GUTTER_WIDTH = 3;

var MERGED_TOGGLE_WIDTH = 36;

var PARALLEL_TIME_THRESHOLD_MS = 5e3;

function groupChildren(children) {
  const subagentIndices = [];
  for (let i3 = 0; i3 < children.length; i3++) {
    if (children[i3].kind === "subagentInvocation") {
      subagentIndices.push(i3);
    }
  }
  if (subagentIndices.length < 2) {
    return [{ type: "sequential", children }];
  }
  const parallelClusters = [];
  let cluster = [subagentIndices[0]];
  for (let k = 1; k < subagentIndices.length; k++) {
    const prevCreated = children[subagentIndices[k - 1]].created;
    const currCreated = children[subagentIndices[k]].created;
    if (Math.abs(currCreated - prevCreated) <= PARALLEL_TIME_THRESHOLD_MS) {
      cluster.push(subagentIndices[k]);
    } else {
      if (cluster.length >= 2) {
        parallelClusters.push(cluster);
      }
      cluster = [subagentIndices[k]];
    }
  }
  if (cluster.length >= 2) {
    parallelClusters.push(cluster);
  }
  if (parallelClusters.length === 0) {
    return [{ type: "sequential", children }];
  }
  const parallelIndices = /* @__PURE__ */ new Set();
  for (const c of parallelClusters) {
    for (const idx of c) {
      parallelIndices.add(idx);
    }
  }
  const groups = [];
  let clusterIdx = 0;
  let i2 = 0;
  while (i2 < children.length) {
    if (clusterIdx < parallelClusters.length && i2 === parallelClusters[clusterIdx][0]) {
      const cl = parallelClusters[clusterIdx];
      const lastIdx = cl[cl.length - 1];
      const setup2 = [];
      const subagents = [];
      for (let j = cl[0]; j <= lastIdx; j++) {
        if (parallelIndices.has(j)) {
          subagents.push(children[j]);
        } else {
          setup2.push(children[j]);
        }
      }
      if (setup2.length > 0) {
        groups.push({ type: "sequential", children: setup2 });
      }
      groups.push({ type: "parallel", children: subagents });
      i2 = lastIdx + 1;
      clusterIdx++;
    } else {
      const start = i2;
      const nextStart = clusterIdx < parallelClusters.length ? parallelClusters[clusterIdx][0] : children.length;
      while (i2 < nextStart && !parallelIndices.has(i2)) {
        i2++;
      }
      if (i2 > start) {
        groups.push({ type: "sequential", children: children.slice(start, i2) });
      }
    }
  }
  return groups;
}

function isMessageKind(kind) {
  return kind === "userMessage" || kind === "agentResponse";
}

function measureNodeWidth(label3, sublabel) {
  const charWidth = 7;
  const labelWidth = label3.length * charWidth + NODE_PADDING_H * 2;
  const sublabelWidth = sublabel ? sublabel.length * (charWidth - 1) + NODE_PADDING_H * 2 : 0;
  return Math.min(NODE_MAX_WIDTH, Math.max(NODE_MIN_WIDTH, labelWidth, sublabelWidth));
}

function subgraphHeaderLabel(node) {
  if (node.kind === "subagentInvocation") {
    return node.label;
  }
  if (node.description && node.description !== node.label) {
    return `${node.label}: ${node.description}`;
  }
  return node.label;
}

function measureSubgraphHeaderWidth(headerLabel) {
  return headerLabel.length * 6 + SUBGRAPH_PADDING * 2 + 20;
}

function countDescendants(node) {
  let count2 = node.children.length;
  for (const child of node.children) {
    count2 += countDescendants(child);
  }
  return count2;
}

function layoutGroups(groups, startX, startY, depth, prevExitNodes, result, collapsedIds, expandedMergedIds, pendingExpansions) {
  let currentY = startY;
  let maxWidth = 0;
  let exitNodes = prevExitNodes;
  for (const group2 of groups) {
    if (group2.type === "parallel") {
      const pg = layoutParallelGroup(group2.children, startX, currentY, depth, collapsedIds, expandedMergedIds, pendingExpansions);
      result.nodes.push(...pg.nodes);
      result.edges.push(...pg.edges);
      result.subgraphs.push(...pg.subgraphs);
      for (const prev of exitNodes) {
        for (const entry of pg.entryNodes) {
          result.edges.push(makeEdge(prev, entry));
        }
      }
      exitNodes = pg.exitNodes;
      maxWidth = Math.max(maxWidth, pg.width);
      currentY += pg.height + NODE_GAP_Y;
    } else {
      for (const child of group2.children) {
        const sub = layoutSubtree(child, startX, currentY, depth, collapsedIds, expandedMergedIds, pendingExpansions);
        result.nodes.push(...sub.nodes);
        result.edges.push(...sub.edges);
        result.subgraphs.push(...sub.subgraphs);
        for (const prev of exitNodes) {
          result.edges.push(makeEdge(prev, sub.entryNode));
        }
        exitNodes = sub.exitNodes;
        maxWidth = Math.max(maxWidth, sub.width);
        currentY += sub.height + NODE_GAP_Y;
      }
    }
  }
  return { exitNodes, maxWidth, endY: currentY };
}

function makeEdge(from, to) {
  return {
    fromId: from.id,
    toId: to.id,
    fromX: from.x + from.width / 2,
    fromY: from.y + from.height,
    toX: to.x + to.width / 2,
    toY: to.y
  };
}

function layoutFlowGraph(roots, options3) {
  if (roots.length === 0) {
    return { nodes: [], edges: [], subgraphs: [], width: 0, height: 0 };
  }
  const collapsedIds = options3?.collapsedIds;
  const expandedMergedIds = options3?.expandedMergedIds;
  const groups = groupChildren(roots);
  const pendingExpansions = [];
  const result = {
    nodes: [],
    edges: [],
    subgraphs: []
  };
  const { maxWidth, endY } = layoutGroups(groups, CANVAS_PADDING, CANVAS_PADDING, 0, [], result, collapsedIds, expandedMergedIds, pendingExpansions);
  resolvePendingExpansions(pendingExpansions, result);
  let width2 = maxWidth + CANVAS_PADDING * 2;
  let height = endY - NODE_GAP_Y + CANVAS_PADDING;
  for (const n2 of result.nodes) {
    width2 = Math.max(width2, n2.x + n2.width + CANVAS_PADDING);
    height = Math.max(height, n2.y + n2.height + CANVAS_PADDING);
  }
  centerLayout(result, width2 / 2);
  return { nodes: result.nodes, edges: result.edges, subgraphs: result.subgraphs, width: width2, height };
}

function resolvePendingExpansions(pendingExpansions, result) {
  for (const expansion of pendingExpansions) {
    const { mergedNode, children } = expansion;
    const childrenTotalHeight = children.length * NODE_HEIGHT + (children.length - 1) * NODE_GAP_Y;
    const rangeTop = mergedNode.y;
    const rangeBottom = mergedNode.y + childrenTotalHeight;
    let maxRightX = mergedNode.x + mergedNode.width;
    for (const n2 of result.nodes) {
      if (n2.y + n2.height > rangeTop && n2.y < rangeBottom) {
        maxRightX = Math.max(maxRightX, n2.x + n2.width);
      }
    }
    for (const sg of result.subgraphs) {
      if (sg.y + sg.height > rangeTop && sg.y < rangeBottom) {
        maxRightX = Math.max(maxRightX, sg.x + sg.width);
      }
    }
    const expandX = maxRightX + PARALLEL_GAP_X;
    let expandY = mergedNode.y;
    let expandMaxWidth = 0;
    const childNodes = [];
    for (const child of children) {
      const childWidth = measureNodeWidth(child.label, child.sublabel);
      const childNode = {
        id: child.id,
        kind: child.kind,
        label: child.label,
        sublabel: child.sublabel,
        tooltip: child.tooltip,
        isError: child.isError,
        x: expandX,
        y: expandY,
        width: childWidth,
        height: NODE_HEIGHT
      };
      childNodes.push(childNode);
      result.nodes.push(childNode);
      expandMaxWidth = Math.max(expandMaxWidth, childWidth);
      expandY += NODE_HEIGHT + NODE_GAP_Y;
    }
    const edgeY = childNodes[0].y + childNodes[0].height / 2;
    result.edges.push({
      fromId: mergedNode.id,
      toId: childNodes[0].id,
      fromX: mergedNode.x + mergedNode.width,
      fromY: edgeY,
      toX: expandX,
      toY: edgeY
    });
    for (let k = 0; k < childNodes.length - 1; k++) {
      result.edges.push(makeEdge(childNodes[k], childNodes[k + 1]));
    }
  }
}

function layoutSubtree(node, startX, y, depth, collapsedIds, expandedMergedIds, pendingExpansions) {
  const isMerged = (node.mergedNodes?.length ?? 0) >= 2;
  const isMergedExpanded = isMerged && expandedMergedIds?.has(node.id);
  const mergedExtra = isMerged ? MERGED_TOGGLE_WIDTH : 0;
  const nodeWidth = measureNodeWidth(node.label, node.sublabel) + mergedExtra;
  const isSubagent = node.kind === "subagentInvocation";
  const isCollapsed = isSubagent && collapsedIds?.has(node.id);
  const nodeHeight = isMessageKind(node.kind) && node.sublabel ? MESSAGE_NODE_HEIGHT : NODE_HEIGHT;
  const layoutNode = {
    id: node.id,
    kind: node.kind,
    label: node.label,
    sublabel: node.sublabel,
    tooltip: node.tooltip,
    isError: node.isError,
    x: startX,
    y,
    width: nodeWidth,
    height: nodeHeight,
    mergedCount: isMerged ? node.mergedNodes.length : void 0,
    isMergedExpanded
  };
  const result = {
    nodes: [layoutNode],
    edges: [],
    subgraphs: [],
    width: nodeWidth,
    height: nodeHeight,
    entryNode: layoutNode,
    exitNodes: [layoutNode]
  };
  if (isMergedExpanded && pendingExpansions) {
    pendingExpansions.push({ mergedNode: layoutNode, children: node.mergedNodes });
    return result;
  }
  if (node.children.length === 0 && !isCollapsed) {
    return result;
  }
  if (isCollapsed) {
    const collapsedHeight = SUBGRAPH_HEADER_HEIGHT + SUBGRAPH_PADDING * 2;
    const totalChildCount = countDescendants(node);
    const sgY = y + nodeHeight + NODE_GAP_Y - NODE_GAP_Y / 2;
    const headerLabel = subgraphHeaderLabel(node);
    const sgWidth = Math.max(NODE_MIN_WIDTH, measureSubgraphHeaderWidth(headerLabel)) + SUBGRAPH_PADDING * 2;
    result.subgraphs.push({
      label: headerLabel,
      x: startX - SUBGRAPH_PADDING,
      y: sgY,
      width: sgWidth,
      height: collapsedHeight,
      depth,
      nodeId: node.id,
      collapsedChildCount: totalChildCount
    });
    result.edges.push({
      fromX: startX + nodeWidth / 2,
      fromY: y + nodeHeight,
      toX: startX - SUBGRAPH_PADDING + sgWidth / 2,
      toY: sgY
    });
    result.width = Math.max(nodeWidth, sgWidth);
    result.height = nodeHeight + NODE_GAP_Y + collapsedHeight;
    return result;
  }
  if (node.children.length === 0) {
    return result;
  }
  const childDepth = isSubagent ? depth + 1 : depth;
  const indentX = isSubagent ? SUBGRAPH_PADDING : 0;
  const groups = groupChildren(node.children);
  let childStartY = y + nodeHeight + NODE_GAP_Y;
  if (isSubagent) {
    childStartY += SUBGRAPH_HEADER_HEIGHT;
  }
  const { exitNodes, maxWidth, endY } = layoutGroups(
    groups,
    startX + indentX,
    childStartY,
    childDepth,
    [layoutNode],
    result,
    collapsedIds,
    expandedMergedIds,
    pendingExpansions
  );
  const totalChildrenHeight = endY - childStartY - NODE_GAP_Y;
  let sgContentWidth = maxWidth;
  if (isSubagent) {
    const headerLabel = subgraphHeaderLabel(node);
    sgContentWidth = Math.max(maxWidth, measureSubgraphHeaderWidth(headerLabel));
    result.subgraphs.push({
      label: headerLabel,
      x: startX - SUBGRAPH_PADDING,
      y: y + nodeHeight + NODE_GAP_Y - NODE_GAP_Y / 2,
      width: sgContentWidth + SUBGRAPH_PADDING * 2,
      height: totalChildrenHeight + SUBGRAPH_HEADER_HEIGHT + NODE_GAP_Y,
      depth,
      nodeId: node.id
    });
  }
  result.width = Math.max(nodeWidth, maxWidth + indentX * 2, isSubagent ? sgContentWidth + indentX * 2 : 0);
  result.height = nodeHeight + NODE_GAP_Y + totalChildrenHeight + (isSubagent ? SUBGRAPH_HEADER_HEIGHT : 0);
  result.exitNodes = exitNodes;
  return result;
}

function layoutParallelGroup(children, startX, y, depth, collapsedIds, expandedMergedIds, pendingExpansions) {
  const subtreeLayouts = [];
  let totalWidth = 0;
  let maxHeight = 0;
  for (const child of children) {
    const subtree = layoutSubtree(child, 0, y, depth, collapsedIds, expandedMergedIds, pendingExpansions);
    subtreeLayouts.push(subtree);
    totalWidth += subtree.width;
    maxHeight = Math.max(maxHeight, subtree.height);
  }
  totalWidth += (children.length - 1) * PARALLEL_GAP_X;
  const nodes = [];
  const edges = [];
  const subgraphs = [];
  const entryNodes = [];
  const exitNodes = [];
  let currentX = startX;
  for (const subtree of subtreeLayouts) {
    const dx = currentX;
    const offsetNodes = subtree.nodes.map((n2) => ({ ...n2, x: n2.x + dx }));
    const offsetEdges = subtree.edges.map((e) => ({
      fromId: e.fromId,
      toId: e.toId,
      fromX: e.fromX + dx,
      fromY: e.fromY,
      toX: e.toX + dx,
      toY: e.toY
    }));
    const offsetSubgraphs = subtree.subgraphs.map((s) => ({ ...s, x: s.x + dx }));
    nodes.push(...offsetNodes);
    edges.push(...offsetEdges);
    subgraphs.push(...offsetSubgraphs);
    entryNodes.push(offsetNodes.find((n2) => n2.id === subtree.entryNode.id));
    const exitIds = new Set(subtree.exitNodes.map((n2) => n2.id));
    exitNodes.push(...offsetNodes.filter((n2) => exitIds.has(n2.id)));
    currentX += subtree.width + PARALLEL_GAP_X;
  }
  return { nodes, edges, subgraphs, entryNodes, exitNodes, width: totalWidth, height: maxHeight };
}

function centerLayout(layout2, centerX) {
  if (layout2.nodes.length === 0) {
    return;
  }
  let minX = Infinity;
  let maxX = -Infinity;
  for (const node of layout2.nodes) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
  }
  const dx = centerX - (minX + maxX) / 2;
  for (let i2 = 0; i2 < layout2.nodes.length; i2++) {
    const n2 = layout2.nodes[i2];
    layout2.nodes[i2] = { ...n2, x: n2.x + dx };
  }
  for (let i2 = 0; i2 < layout2.edges.length; i2++) {
    const e = layout2.edges[i2];
    layout2.edges[i2] = { fromId: e.fromId, toId: e.toId, fromX: e.fromX + dx, fromY: e.fromY, toX: e.toX + dx, toY: e.toY };
  }
  for (let i2 = 0; i2 < layout2.subgraphs.length; i2++) {
    const s = layout2.subgraphs[i2];
    layout2.subgraphs[i2] = { ...s, x: s.x + dx };
  }
}

var SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag2, attrs) {
  const el = document.createElementNS(SVG_NS, tag2);
  for (const [k, v2] of Object.entries(attrs)) {
    el.setAttribute(k, String(v2));
  }
  return el;
}

function getNodeColor2(kind, isError) {
  if (isError) {
    return "var(--vscode-errorForeground)";
  }
  switch (kind) {
    case "userMessage":
      return "var(--vscode-textLink-foreground)";
    case "modelTurn":
      return "var(--vscode-charts-blue, var(--vscode-textLink-foreground))";
    case "toolCall":
      return "var(--vscode-testing-iconPassed, #73c991)";
    case "subagentInvocation":
      return "var(--vscode-charts-purple, #b267e6)";
    case "agentResponse":
      return "var(--vscode-foreground)";
    case "generic":
      return "var(--vscode-descriptionForeground)";
  }
}

var SUBGRAPH_COLORS = [
  "var(--vscode-charts-purple, #b267e6)",
  "var(--vscode-charts-blue, #3dc9b0)",
  "var(--vscode-charts-yellow, #e5c07b)",
  "var(--vscode-charts-orange, #d19a66)"
];

function renderFlowChartSVG(layout2) {
  const focusableElements = /* @__PURE__ */ new Map();
  const svg2 = svgEl("svg", {
    width: layout2.width,
    height: layout2.height,
    viewBox: `0 0 ${layout2.width} ${layout2.height}`,
    role: "img",
    "aria-label": `Agent flow chart with ${layout2.nodes.length} nodes`
  });
  svg2.classList.add("chat-debug-flowchart-svg");
  renderSubgraphs(svg2, layout2.subgraphs, focusableElements);
  renderEdges(svg2, layout2.edges);
  renderNodes(svg2, layout2.nodes, focusableElements);
  const positionByKey = /* @__PURE__ */ new Map();
  for (const sg of layout2.subgraphs) {
    positionByKey.set(`sg:${sg.nodeId}`, { y: sg.y, x: sg.x });
  }
  for (const node of layout2.nodes) {
    positionByKey.set(node.id, { y: node.y, x: node.x });
  }
  const sortedFocusable = new Map(
    [...focusableElements.entries()].sort((a, b) => {
      const posA = positionByKey.get(a[0]);
      const posB = positionByKey.get(b[0]);
      if (!posA || !posB) {
        return 0;
      }
      return posA.y !== posB.y ? posA.y - posB.y : posA.x - posB.x;
    })
  );
  const adjacency = /* @__PURE__ */ new Map();
  for (const edge of layout2.edges) {
    if (edge.fromId && edge.toId) {
      let fromEntry = adjacency.get(edge.fromId);
      if (!fromEntry) {
        fromEntry = { next: [], prev: [] };
        adjacency.set(edge.fromId, fromEntry);
      }
      fromEntry.next.push(edge.toId);
      let toEntry2 = adjacency.get(edge.toId);
      if (!toEntry2) {
        toEntry2 = { next: [], prev: [] };
        adjacency.set(edge.toId, toEntry2);
      }
      toEntry2.prev.push(edge.fromId);
    }
  }
  return { svg: svg2, focusableElements: sortedFocusable, adjacency, positions: positionByKey };
}

function renderSubgraphs(svg2, subgraphs, focusableElements) {
  for (let sgIdx = 0; sgIdx < subgraphs.length; sgIdx++) {
    const sg = subgraphs[sgIdx];
    const color2 = SUBGRAPH_COLORS[sg.depth % SUBGRAPH_COLORS.length];
    const isCollapsed = sg.collapsedChildCount !== void 0;
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("chat-debug-flowchart-subgraph");
    const rectAttrs = { x: sg.x, y: sg.y, width: sg.width, height: sg.height, rx: NODE_BORDER_RADIUS, ry: NODE_BORDER_RADIUS };
    const clipId = `sg-clip-${sgIdx}`;
    const clipPath = svgEl("clipPath", { id: clipId });
    clipPath.appendChild(svgEl("rect", rectAttrs));
    svg2.appendChild(clipPath);
    g.appendChild(svgEl("rect", { ...rectAttrs, fill: color2, opacity: 0.06 + sg.depth * 0.02 }));
    g.appendChild(svgEl("rect", { ...rectAttrs, fill: "none", stroke: color2, "stroke-width": 1, "stroke-dasharray": "6,3", opacity: 0.5 }));
    g.appendChild(svgEl("rect", { x: sg.x, y: sg.y, width: GUTTER_WIDTH, height: sg.height, fill: color2, opacity: 0.7, "clip-path": `url(#${clipId})` }));
    const headerGroup = document.createElementNS(SVG_NS, "g");
    headerGroup.setAttribute("data-subgraph-id", sg.nodeId);
    headerGroup.classList.add("chat-debug-flowchart-subgraph-header");
    headerGroup.setAttribute("tabindex", "0");
    headerGroup.setAttribute("role", "button");
    headerGroup.setAttribute("aria-expanded", String(!isCollapsed));
    headerGroup.setAttribute("aria-label", `${sg.label}: ${isCollapsed ? "collapsed" : "expanded"}${isCollapsed && sg.collapsedChildCount !== void 0 ? `, ${sg.collapsedChildCount} items hidden` : ""}`);
    const headerBar = svgEl("rect", { x: sg.x, y: sg.y, width: sg.width, height: SUBGRAPH_HEADER_HEIGHT, fill: color2, opacity: 0.15, "clip-path": `url(#${clipId})` });
    headerGroup.appendChild(headerBar);
    const chevron = isCollapsed ? "\u25B6" : "\u25BC";
    const headerText = svgEl("text", {
      x: sg.x + GUTTER_WIDTH + 8,
      y: sg.y + SUBGRAPH_HEADER_HEIGHT / 2 + 4,
      "font-size": SUBLABEL_FONT_SIZE,
      fill: color2,
      "font-family": "var(--vscode-font-family, sans-serif)",
      "font-weight": "600"
    });
    headerText.textContent = `${chevron} ${sg.label}`;
    headerGroup.appendChild(headerText);
    g.appendChild(headerGroup);
    focusableElements.set(`sg:${sg.nodeId}`, headerGroup);
    if (isCollapsed && sg.collapsedChildCount !== void 0) {
      const badgeText = svgEl("text", {
        x: sg.x + sg.width / 2,
        y: sg.y + SUBGRAPH_HEADER_HEIGHT + SUBGRAPH_PADDING + 4,
        "font-size": SUBLABEL_FONT_SIZE,
        fill: "var(--vscode-descriptionForeground)",
        "font-family": "var(--vscode-font-family, sans-serif)",
        "font-style": "italic",
        "text-anchor": "middle"
      });
      badgeText.textContent = `+${sg.collapsedChildCount} items`;
      g.appendChild(badgeText);
    }
    svg2.appendChild(g);
  }
}

function renderEdges(svg2, edges) {
  const strokeAttrs = { fill: "none", stroke: "var(--vscode-descriptionForeground)", "stroke-width": EDGE_STROKE_WIDTH, "stroke-linecap": "round" };
  const r2 = 6;
  for (const edge of edges) {
    const midY = (edge.fromY + edge.toY) / 2;
    let d;
    const isHorizontal2 = edge.fromY === edge.toY;
    if (isHorizontal2) {
      d = `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`;
    } else if (edge.fromX === edge.toX) {
      d = `M ${edge.fromX} ${edge.fromY} L ${edge.toX} ${edge.toY}`;
    } else {
      const dx = edge.toX - edge.fromX;
      const signX = dx > 0 ? 1 : -1;
      const absDx = Math.abs(dx);
      const cr = Math.min(r2, absDx / 2, (edge.toY - edge.fromY) / 4);
      d = `M ${edge.fromX} ${edge.fromY} L ${edge.fromX} ${midY - cr} Q ${edge.fromX} ${midY}, ${edge.fromX + signX * cr} ${midY} L ${edge.toX - signX * cr} ${midY} Q ${edge.toX} ${midY}, ${edge.toX} ${midY + cr} L ${edge.toX} ${edge.toY}`;
    }
    svg2.appendChild(svgEl("path", { ...strokeAttrs, d }));
    const a = 5;
    let arrowD;
    if (isHorizontal2) {
      const signX = edge.toX > edge.fromX ? 1 : -1;
      arrowD = `M ${edge.toX - signX * a * 1.5} ${edge.toY - a} L ${edge.toX} ${edge.toY} L ${edge.toX - signX * a * 1.5} ${edge.toY + a}`;
    } else {
      arrowD = `M ${edge.toX - a} ${edge.toY - a * 1.5} L ${edge.toX} ${edge.toY} L ${edge.toX + a} ${edge.toY - a * 1.5}`;
    }
    svg2.appendChild(svgEl("path", {
      ...strokeAttrs,
      "stroke-linejoin": "round",
      d: arrowD
    }));
  }
}

function renderNodes(svg2, nodes, focusableElements) {
  const fontFamily = "var(--vscode-font-family, sans-serif)";
  const nodeFill = "var(--vscode-editor-background, var(--vscode-editorWidget-background))";
  for (const node of nodes) {
    const g = document.createElementNS(SVG_NS, "g");
    g.classList.add("chat-debug-flowchart-node");
    g.setAttribute("data-node-id", node.id);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "img");
    const ariaLabel = node.sublabel ? `${node.label}, ${node.sublabel}` : node.label;
    g.setAttribute("aria-label", ariaLabel);
    focusableElements.set(node.id, g);
    if (node.tooltip) {
      const title = document.createElementNS(SVG_NS, "title");
      title.textContent = node.tooltip;
      g.appendChild(title);
    }
    const color2 = getNodeColor2(node.kind, node.isError);
    const safeId = node.id.replace(/[^a-zA-Z0-9]/g, "_");
    const rectAttrs = { x: node.x, y: node.y, width: node.width, height: node.height, rx: NODE_BORDER_RADIUS, ry: NODE_BORDER_RADIUS };
    const clipId = `clip-${safeId}`;
    const clipPath = svgEl("clipPath", { id: clipId });
    clipPath.appendChild(svgEl("rect", rectAttrs));
    svg2.appendChild(clipPath);
    const focusOffset = 3;
    g.appendChild(svgEl("rect", {
      class: "chat-debug-flowchart-focus-ring",
      x: node.x - focusOffset,
      y: node.y - focusOffset,
      width: node.width + focusOffset * 2,
      height: node.height + focusOffset * 2,
      rx: NODE_BORDER_RADIUS + focusOffset,
      ry: NODE_BORDER_RADIUS + focusOffset,
      fill: "none",
      stroke: "var(--vscode-focusBorder)",
      "stroke-width": 2
    }));
    g.appendChild(svgEl("rect", { ...rectAttrs, fill: nodeFill, stroke: color2, "stroke-width": node.isError ? 2 : 1.5 }));
    g.appendChild(svgEl("rect", { x: node.x, y: node.y, width: 4, height: node.height, fill: color2, "clip-path": `url(#${clipId})` }));
    const textX = node.x + NODE_PADDING_H;
    const isMessage = isMessageKind(node.kind);
    if (isMessage && node.sublabel) {
      const header2 = svgEl("text", { x: textX, y: node.y + NODE_PADDING_V + SUBLABEL_FONT_SIZE, "font-size": SUBLABEL_FONT_SIZE, fill: "var(--vscode-descriptionForeground)", "font-family": fontFamily, "clip-path": `url(#${clipId})` });
      header2.textContent = node.label;
      g.appendChild(header2);
      const msg = svgEl("text", { x: textX, y: node.y + node.height - NODE_PADDING_V - 2, "font-size": FONT_SIZE, fill: "var(--vscode-foreground)", "font-family": fontFamily, "clip-path": `url(#${clipId})` });
      msg.textContent = node.sublabel;
      g.appendChild(msg);
    } else if (node.sublabel) {
      const label3 = svgEl("text", { x: textX, y: node.y + NODE_PADDING_V + FONT_SIZE, "font-size": FONT_SIZE, fill: "var(--vscode-foreground)", "font-family": fontFamily, "clip-path": `url(#${clipId})` });
      label3.textContent = node.label;
      g.appendChild(label3);
      const sub = svgEl("text", { x: textX, y: node.y + node.height - NODE_PADDING_V, "font-size": SUBLABEL_FONT_SIZE, fill: "var(--vscode-descriptionForeground)", "font-family": fontFamily, "clip-path": `url(#${clipId})` });
      sub.textContent = node.sublabel;
      g.appendChild(sub);
    } else {
      const label3 = svgEl("text", { x: textX, y: node.y + node.height / 2 + FONT_SIZE / 2 - 1, "font-size": FONT_SIZE, fill: "var(--vscode-foreground)", "font-family": fontFamily, "clip-path": `url(#${clipId})` });
      label3.textContent = node.label;
      g.appendChild(label3);
    }
    if (node.mergedCount) {
      g.setAttribute("data-is-toggle", "true");
      renderMergedToggle(g, node, color2, fontFamily);
    }
    svg2.appendChild(g);
  }
}

function renderMergedToggle(g, node, color2, fontFamily) {
  const toggleX = node.x + node.width - MERGED_TOGGLE_WIDTH;
  const toggleGroup = document.createElementNS(SVG_NS, "g");
  toggleGroup.classList.add("chat-debug-flowchart-merged-toggle");
  toggleGroup.setAttribute("data-merged-id", node.id);
  toggleGroup.appendChild(svgEl("line", {
    x1: toggleX,
    y1: node.y + 4,
    x2: toggleX,
    y2: node.y + node.height - 4,
    stroke: "var(--vscode-descriptionForeground)",
    "stroke-width": 0.5,
    opacity: 0.4
  }));
  const chevronX = toggleX + MERGED_TOGGLE_WIDTH / 2;
  const chevronY = node.y + node.height / 2;
  const chevron = svgEl("text", {
    x: chevronX,
    y: chevronY + 4,
    "font-size": 9,
    fill: color2,
    "font-family": fontFamily,
    "text-anchor": "middle",
    cursor: "pointer"
  });
  chevron.textContent = node.isMergedExpanded ? "\u25C0" : "\u25B6";
  toggleGroup.appendChild(chevron);
  toggleGroup.appendChild(svgEl("rect", {
    x: toggleX,
    y: node.y,
    width: MERGED_TOGGLE_WIDTH,
    height: node.height,
    fill: "transparent",
    cursor: "pointer"
  }));
  g.appendChild(toggleGroup);
}
export { groupChildren, isMessageKind, measureNodeWidth, subgraphHeaderLabel, measureSubgraphHeaderWidth, countDescendants, layoutGroups, makeEdge, layoutFlowGraph, resolvePendingExpansions, layoutSubtree, layoutParallelGroup, centerLayout, svgEl, getNodeColor2, renderFlowChartSVG, renderSubgraphs, renderEdges, renderNodes, renderMergedToggle, NODE_HEIGHT, MESSAGE_NODE_HEIGHT, NODE_MIN_WIDTH, NODE_MAX_WIDTH, NODE_PADDING_H, NODE_PADDING_V, NODE_GAP_Y, NODE_BORDER_RADIUS, EDGE_STROKE_WIDTH, FONT_SIZE, SUBLABEL_FONT_SIZE, SUBGRAPH_PADDING, CANVAS_PADDING, PARALLEL_GAP_X, SUBGRAPH_HEADER_HEIGHT, GUTTER_WIDTH, MERGED_TOGGLE_WIDTH, PARALLEL_TIME_THRESHOLD_MS, SVG_NS, SUBGRAPH_COLORS };
