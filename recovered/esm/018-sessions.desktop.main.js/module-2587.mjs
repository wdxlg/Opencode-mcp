// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowGraph.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowGraph.ts
function truncateLabel(text2, maxLength) {
  if (text2.length <= maxLength) {
    return text2;
  }
  return text2.substring(0, maxLength - 1) + "\u2026";
}

function buildFlowGraph(events) {
  const subagentToolNames = ["runSubagent", "search_subagent"];
  function isSubagentName(name) {
    for (const toolName of subagentToolNames) {
      if (name === toolName) {
        return true;
      }
      if (name.startsWith(toolName)) {
        const nextChar = name[toolName.length];
        if (nextChar === "-" || nextChar === " " || nextChar === "(" || nextChar === ":") {
          return true;
        }
      }
    }
    return false;
  }
  const emojiPrefixRe = /^\u{1F6E0}\uFE0F?\s*/u;
  function stripToolEmoji(name) {
    return name.replace(emojiPrefixRe, "");
  }
  const completionDescsByParent = /* @__PURE__ */ new Map();
  const startedCountByParent = /* @__PURE__ */ new Map();
  for (const e4 of events) {
    if (e4.kind === "subagentInvocation" && isSubagentName(e4.agentName) && e4.description && e4.parentEventId) {
      let descs = completionDescsByParent.get(e4.parentEventId);
      if (!descs) {
        descs = [];
        completionDescsByParent.set(e4.parentEventId, descs);
      }
      descs.push(e4.description);
    }
  }
  function getSubagentDescription(event) {
    if (event.kind !== "subagentInvocation" || !event.parentEventId) {
      return void 0;
    }
    const descs = completionDescsByParent.get(event.parentEventId);
    if (!descs || descs.length === 0) {
      return event.description && event.description !== event.agentName ? event.description : void 0;
    }
    const idx = startedCountByParent.get(event.parentEventId) ?? 0;
    startedCountByParent.set(event.parentEventId, idx + 1);
    return descs[idx] ?? descs[0];
  }
  const filtered = events.filter((e4) => {
    if (e4.kind === "subagentInvocation" && isSubagentName(e4.agentName)) {
      return false;
    }
    return true;
  });
  const idToEvent = /* @__PURE__ */ new Map();
  const idToChildren = /* @__PURE__ */ new Map();
  const roots = [];
  for (const event of filtered) {
    if (event.id) {
      idToEvent.set(event.id, event);
    }
  }
  for (const event of filtered) {
    if (event.parentEventId && idToEvent.has(event.parentEventId)) {
      let children = idToChildren.get(event.parentEventId);
      if (!children) {
        children = [];
        idToChildren.set(event.parentEventId, children);
      }
      children.push(event);
    } else {
      roots.push(event);
    }
  }
  const byCreated = (a, b) => a.created.getTime() - b.created.getTime();
  roots.sort(byCreated);
  for (const children of idToChildren.values()) {
    children.sort(byCreated);
  }
  function toFlowNode(event) {
    const children = event.id ? idToChildren.get(event.id) : void 0;
    const effectiveKind = getEffectiveKind(event);
    let label3 = getEventLabel(event, effectiveKind);
    const sublabel = getEventSublabel(event, effectiveKind);
    let tooltip = getEventTooltip(event);
    let description;
    if (effectiveKind === "subagentInvocation") {
      description = getSubagentDescription(event);
      const cleanDesc = description?.replace(/^Subagent:\s*/i, "");
      label3 = cleanDesc ? localize(10610, null, truncateLabel(cleanDesc, 30)) : localize(10609, null);
      if (description) {
        if (tooltip && !tooltip.includes(description)) {
          const lines = tooltip.split("\n");
          lines.splice(1, 0, description);
          tooltip = lines.join("\n");
        }
      }
    }
    return {
      id: event.id ?? `event-${events.indexOf(event)}`,
      kind: effectiveKind,
      category: event.kind === "generic" ? event.category : void 0,
      label: label3,
      sublabel,
      description,
      tooltip,
      isError: isErrorEvent(event),
      created: event.created.getTime(),
      children: children?.map(toFlowNode) ?? []
    };
  }
  const rawNodes = roots.map(toFlowNode);
  return collapseSubagentToolCalls(rawNodes);
  function collapseSubagentToolCalls(nodeList) {
    let changed = false;
    const result = [];
    for (const node of nodeList) {
      if (node.kind === "toolCall" && isSubagentName(stripToolEmoji(node.label))) {
        changed = true;
        const flatChildren = flattenChildSessionRefs(node.children);
        const subagentChildren = flatChildren.filter((c) => c.kind === "subagentInvocation");
        if (subagentChildren.length > 0) {
          const otherChildren = flatChildren.filter((c) => c.kind !== "subagentInvocation");
          for (let i2 = 0; i2 < subagentChildren.length; i2++) {
            const extra = i2 === 0 ? otherChildren : [];
            result.push({
              ...subagentChildren[i2],
              children: collapseSubagentToolCalls(
                [...subagentChildren[i2].children, ...extra]
              )
            });
          }
        } else {
          result.push(...collapseSubagentToolCalls(flatChildren));
        }
      } else {
        const newChildren = collapseSubagentToolCalls(node.children);
        if (newChildren !== node.children) {
          changed = true;
          result.push({ ...node, children: newChildren });
        } else {
          result.push(node);
        }
      }
    }
    return changed ? result : nodeList;
  }
  function flattenChildSessionRefs(nodeList) {
    if (!nodeList.some((n2) => n2.kind === "generic" && n2.category === "subagent")) {
      return nodeList;
    }
    const result = [];
    for (const node of nodeList) {
      if (node.kind === "generic" && node.category === "subagent") {
        const subagentChild = node.children.find((c) => c.kind === "subagentInvocation");
        if (subagentChild) {
          const siblings = node.children.filter((c) => c !== subagentChild);
          result.push({
            ...subagentChild,
            children: [...subagentChild.children, ...siblings]
          });
        } else {
          result.push(...node.children);
        }
      } else {
        result.push(node);
      }
    }
    return result;
  }
}

function filterFlowNodes(nodes, options3) {
  let result = filterByKind(nodes, options3.isKindVisible);
  if (options3.textFilter) {
    result = filterByText(result, options3.textFilter);
  }
  return result;
}

function filterByKind(nodes, isKindVisible) {
  const result = [];
  let changed = false;
  for (const node of nodes) {
    if (!isKindVisible(node.kind, node.category)) {
      changed = true;
      if (node.kind === "subagentInvocation") {
        continue;
      }
      result.push(...filterByKind(node.children, isKindVisible));
      continue;
    }
    const filteredChildren = filterByKind(node.children, isKindVisible);
    if (filteredChildren !== node.children) {
      changed = true;
      result.push({ ...node, children: filteredChildren });
    } else {
      result.push(node);
    }
  }
  return changed ? result : nodes;
}

function nodeMatchesText(node, text2) {
  return node.label.toLowerCase().includes(text2) || (node.sublabel?.toLowerCase().includes(text2) ?? false) || (node.tooltip?.toLowerCase().includes(text2) ?? false);
}

function filterByText(nodes, text2) {
  const result = [];
  for (const node of nodes) {
    if (nodeMatchesText(node, text2)) {
      result.push(node);
      continue;
    }
    const filteredChildren = filterByText(node.children, text2);
    if (filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}

function countNodes(nodes) {
  let count2 = 0;
  for (const node of nodes) {
    count2 += 1 + countNodes(node.children);
  }
  return count2;
}

function sliceFlowNodes(nodes, maxCount) {
  const totalCount = countNodes(nodes);
  if (totalCount <= maxCount) {
    return { nodes, totalCount, shownCount: totalCount };
  }
  let remaining = maxCount;
  function sliceTree(nodeList) {
    const result = [];
    for (const node of nodeList) {
      if (remaining <= 0) {
        break;
      }
      remaining--;
      if (node.children.length === 0 || remaining <= 0) {
        result.push(node.children.length === 0 ? node : { ...node, children: [] });
      } else {
        const slicedChildren = sliceTree(node.children);
        result.push(slicedChildren !== node.children ? { ...node, children: slicedChildren } : node);
      }
    }
    return result;
  }
  const sliced = sliceTree(nodes);
  const shownCount = maxCount - remaining;
  return { nodes: sliced, totalCount, shownCount };
}

function isDiscoveryNode(node) {
  return node.kind === "generic" && node.category === "discovery";
}

function mergeDiscoveryNodes(nodes) {
  const result = [];
  let i2 = 0;
  while (i2 < nodes.length) {
    const node = nodes[i2];
    if (!isDiscoveryNode(node)) {
      const mergedChildren = mergeDiscoveryNodes(node.children);
      result.push(mergedChildren !== node.children ? { ...node, children: mergedChildren } : node);
      i2++;
      continue;
    }
    const run = [node];
    let j = i2 + 1;
    while (j < nodes.length && isDiscoveryNode(nodes[j])) {
      run.push(nodes[j]);
      j++;
    }
    if (run.length < 2) {
      result.push(node);
      i2 = j;
      continue;
    }
    const mergedId = `merged-discovery:${run[0].id}`;
    const labels = run.map((n2) => n2.label);
    const uniqueLabels = [...new Set(labels)];
    const summaryLabel = uniqueLabels.length <= 2 ? uniqueLabels.join(", ") : localize(10604, null, uniqueLabels[0], run.length - 1);
    result.push({
      id: mergedId,
      kind: "generic",
      category: "discovery",
      label: summaryLabel,
      sublabel: localize(10605, null, run.length),
      tooltip: run.map((n2) => n2.label + (n2.sublabel ? `: ${n2.sublabel}` : "")).join("\n"),
      created: run[0].created,
      children: [],
      mergedNodes: run
    });
    i2 = j;
  }
  return result;
}

function isToolCallNode(node) {
  return node.kind === "toolCall";
}

function getToolName(node) {
  return node.label;
}

function mergeToolCallNodes(nodes) {
  const result = [];
  let i2 = 0;
  while (i2 < nodes.length) {
    const node = nodes[i2];
    if (!isToolCallNode(node)) {
      const mergedChildren = mergeToolCallNodes(node.children);
      result.push(mergedChildren !== node.children ? { ...node, children: mergedChildren } : node);
      i2++;
      continue;
    }
    const toolName = getToolName(node);
    const run = [node];
    let j = i2 + 1;
    while (j < nodes.length && isToolCallNode(nodes[j]) && getToolName(nodes[j]) === toolName) {
      run.push(nodes[j]);
      j++;
    }
    if (run.length < 2) {
      const mergedChildren = mergeToolCallNodes(node.children);
      result.push(mergedChildren !== node.children ? { ...node, children: mergedChildren } : node);
      i2 = j;
      continue;
    }
    const mergedId = `merged-toolCall:${run[0].id}`;
    result.push({
      id: mergedId,
      kind: "toolCall",
      label: toolName,
      sublabel: localize(10613, null, run.length),
      tooltip: run.map((n2) => n2.label + (n2.sublabel ? `: ${n2.sublabel}` : "")).join("\n"),
      created: run[0].created,
      children: [],
      mergedNodes: run
    });
    i2 = j;
  }
  return result;
}

function getEffectiveKind(event) {
  if (event.kind === "generic") {
    const name = event.name.toLowerCase().replace(/[\s_-]+/g, "");
    if (name === "usermessage" || name === "userprompt" || name === "user" || name.startsWith("usermessage")) {
      return "userMessage";
    }
    if (name === "response" || name.startsWith("agentresponse") || name.startsWith("assistantresponse") || name.startsWith("modelresponse")) {
      return "agentResponse";
    }
    const cat = event.category?.toLowerCase();
    if (cat === "user" || cat === "usermessage") {
      return "userMessage";
    }
    if (cat === "response" || cat === "agentresponse") {
      return "agentResponse";
    }
  }
  return event.kind;
}

function getEventLabel(event, effectiveKind) {
  const kind = effectiveKind ?? event.kind;
  switch (kind) {
    case "userMessage":
      return localize(10625, null);
    case "modelTurn":
      return event.kind === "modelTurn" ? event.model ?? localize(10607, null) : localize(10607, null);
    case "toolCall":
      return event.kind === "toolCall" ? event.toolName : event.kind === "generic" ? event.name : localize(10612, null);
    case "subagentInvocation":
      return event.kind === "subagentInvocation" ? event.agentName : localize(10608, null);
    case "agentResponse":
      return localize(10603, null);
    case "generic":
      return event.kind === "generic" ? event.name : localize(10606, null);
  }
}

function getEventSublabel(event, effectiveKind) {
  const kind = effectiveKind ?? event.kind;
  switch (kind) {
    case "modelTurn": {
      const parts = [];
      if (event.kind === "modelTurn" && event.requestName) {
        parts.push(event.requestName);
      }
      if (event.kind === "modelTurn" && event.totalTokens) {
        parts.push(localize(10611, null, event.totalTokens));
      }
      if (event.kind === "modelTurn" && event.durationInMillis) {
        parts.push(formatDuration2(event.durationInMillis));
      }
      return parts.length > 0 ? parts.join(" \xB7 ") : void 0;
    }
    case "toolCall": {
      const parts = [];
      if (event.kind === "toolCall" && event.result) {
        parts.push(event.result);
      }
      if (event.kind === "toolCall" && event.durationInMillis) {
        parts.push(formatDuration2(event.durationInMillis));
      }
      return parts.length > 0 ? parts.join(" \xB7 ") : void 0;
    }
    case "subagentInvocation": {
      const parts = [];
      if (event.kind === "subagentInvocation" && event.status) {
        parts.push(event.status);
      }
      if (event.kind === "subagentInvocation" && event.durationInMillis) {
        parts.push(formatDuration2(event.durationInMillis));
      }
      return parts.length > 0 ? parts.join(" \xB7 ") : void 0;
    }
    case "userMessage":
    case "agentResponse": {
      let text2;
      if (event.kind === "userMessage" || event.kind === "agentResponse") {
        text2 = event.message;
      } else if (event.kind === "generic") {
        text2 = event.details;
      }
      if (!text2) {
        return void 0;
      }
      const lines = text2.split("\n");
      let firstLine = "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.length > 2) {
          firstLine = trimmed;
          break;
        }
      }
      if (!firstLine) {
        firstLine = text2.replace(/\s+/g, " ").trim();
      }
      if (!firstLine) {
        return void 0;
      }
      return firstLine.length > 60 ? firstLine.substring(0, 57) + "..." : firstLine;
    }
    default:
      return void 0;
  }
}

function formatDuration2(ms) {
  if (ms < 1e3) {
    return `${ms}ms`;
  }
  return `${(ms / 1e3).toFixed(1)}s`;
}

function isErrorEvent(event) {
  return event.kind === "toolCall" && event.result === "error" || event.kind === "generic" && event.level === 3 || event.kind === "subagentInvocation" && event.status === "failed";
}

var TOOLTIP_MAX_LENGTH = 500;

function getEventTooltip(event) {
  switch (event.kind) {
    case "userMessage": {
      const msg = event.message.trim();
      if (msg.length > TOOLTIP_MAX_LENGTH) {
        return msg.substring(0, TOOLTIP_MAX_LENGTH) + "\u2026";
      }
      return msg || void 0;
    }
    case "toolCall": {
      const parts = [event.toolName];
      if (event.input) {
        const input = event.input.trim();
        parts.push(localize(10616, null, input.length > TOOLTIP_MAX_LENGTH ? input.substring(0, TOOLTIP_MAX_LENGTH) + "\u2026" : input));
      }
      if (event.output) {
        const output = event.output.trim();
        parts.push(localize(10619, null, output.length > TOOLTIP_MAX_LENGTH ? output.substring(0, TOOLTIP_MAX_LENGTH) + "\u2026" : output));
      }
      if (event.result) {
        parts.push(localize(10621, null, event.result));
      }
      return parts.join("\n");
    }
    case "subagentInvocation": {
      const parts = [event.agentName];
      if (event.description) {
        parts.push(event.description);
      }
      if (event.status) {
        parts.push(localize(10622, null, event.status));
      }
      if (event.toolCallCount !== void 0) {
        parts.push(localize(10624, null, event.toolCallCount));
      }
      if (event.modelTurnCount !== void 0) {
        parts.push(localize(10618, null, event.modelTurnCount));
      }
      return parts.join("\n");
    }
    case "generic": {
      if (event.details) {
        const details = event.details.trim();
        return details.length > TOOLTIP_MAX_LENGTH ? details.substring(0, TOOLTIP_MAX_LENGTH) + "\u2026" : details;
      }
      return void 0;
    }
    case "modelTurn": {
      const parts = [];
      if (event.model) {
        parts.push(event.model);
      }
      if (event.totalTokens !== void 0) {
        parts.push(localize(10623, null, event.totalTokens));
      }
      if (event.inputTokens !== void 0) {
        parts.push(localize(10617, null, event.inputTokens));
      }
      if (event.outputTokens !== void 0) {
        parts.push(localize(10620, null, event.outputTokens));
      }
      if (event.cachedTokens !== void 0) {
        parts.push(localize(10614, null, event.cachedTokens));
      }
      if (event.durationInMillis !== void 0) {
        parts.push(localize(10615, null, formatDuration2(event.durationInMillis)));
      }
      return parts.length > 0 ? parts.join("\n") : void 0;
    }
    default:
      return void 0;
  }
}
export { truncateLabel, buildFlowGraph, filterFlowNodes, filterByKind, nodeMatchesText, filterByText, countNodes, sliceFlowNodes, isDiscoveryNode, mergeDiscoveryNodes, isToolCallNode, getToolName, mergeToolCallNodes, getEffectiveKind, getEventLabel, getEventSublabel, formatDuration2, isErrorEvent, getEventTooltip, TOOLTIP_MAX_LENGTH };
