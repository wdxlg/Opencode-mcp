// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheDiff.ts



// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugCacheDiff.ts
function parseInputMessages(inputMessagesJson) {
  if (!inputMessagesJson) {
    return [];
  }
  let raw;
  try {
    raw = JSON.parse(inputMessagesJson);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) {
    return [];
  }
  const toolNameByCallId = /* @__PURE__ */ new Map();
  for (const m of raw) {
    if (!m || typeof m !== "object" || !Array.isArray(m.parts)) {
      continue;
    }
    for (const p of m.parts) {
      if (p && typeof p === "object" && p.type === "tool_call" && typeof p.id === "string" && typeof p.name === "string" && p.name) {
        toolNameByCallId.set(p.id, p.name);
      }
    }
  }
  const out = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") {
      continue;
    }
    let role = typeof m.role === "string" ? m.role : "unknown";
    let name = typeof m.name === "string" && m.name ? m.name : void 0;
    let text2 = "";
    let toolResponseName;
    let hasToolResponse = false;
    let hasToolCall = false;
    let hasToolSearchOutput = false;
    let hasText = false;
    if (Array.isArray(m.parts)) {
      for (const p of m.parts) {
        if (!p || typeof p !== "object") {
          continue;
        }
        switch (p.type) {
          case void 0:
          case "text":
          case "reasoning":
            if (typeof p.content === "string") {
              text2 += p.content;
              hasText = true;
            }
            break;
          case "tool_call_response":
          case "tool_result":
            if (typeof p.response === "string") {
              text2 += p.response;
            } else if (p.response !== void 0) {
              text2 += stableStringify2(p.response);
            } else if (typeof p.content === "string") {
              text2 += p.content;
            } else if (p.content !== void 0) {
              text2 += stableStringify2(p.content);
            }
            if (toolResponseName === void 0 && typeof p.id === "string") {
              toolResponseName = toolNameByCallId.get(p.id);
            }
            hasToolResponse = true;
            break;
          case "tool_call":
            if (p.name) {
              text2 += `call:${p.name}`;
            }
            if (p.arguments !== void 0) {
              text2 += stableStringify2(p.arguments);
            }
            hasToolCall = true;
            break;
          case "tool_search_output":
            text2 += stableStringify2({
              id: p.id,
              status: p.status,
              tools: p.tools
            });
            hasToolSearchOutput = true;
            break;
        }
      }
    }
    if (hasToolSearchOutput && !hasText) {
      role = "tool_search";
    } else if (hasToolResponse && !hasText) {
      role = "tool";
      name = name ?? toolResponseName;
    } else if (hasToolCall && !hasText && role === "assistant") {
      role = "assistant";
    }
    if (text2.length === 0 && role === "unknown") {
      text2 = stableStringify2(m);
    }
    out.push({ role, name, text: text2, charLength: text2.length });
  }
  return out;
}

function stableStringify2(value2) {
  try {
    return JSON.stringify(value2);
  } catch {
    return String(value2);
  }
}

function messagesEqual(a, b) {
  return a.role === b.role && a.name === b.name && a.charLength === b.charLength && a.text === b.text;
}

function diffPromptSignature(a, b) {
  const signature = [];
  const drift = [];
  const counts = { identical: 0, contentDrift: 0, lengthChange: 0, onlyInA: 0, onlyInB: 0 };
  let breakResult;
  let broken = false;
  const max = Math.max(a.length, b.length);
  for (let i2 = 0; i2 < max; i2++) {
    const ai = a[i2];
    const bi = b[i2];
    if (ai && !bi) {
      counts.onlyInA++;
      signature.push({ index: i2, kind: "onlyInA" /* OnlyInA */, aRole: ai.role, aName: ai.name, aCharLength: ai.charLength });
      drift.push({ name: `messages[${i2}]`, role: ai.role, status: "onlyInA" /* OnlyInA */, aSize: ai.charLength, bSize: 0 });
      if (!broken) {
        broken = true;
        breakResult = { index: i2, kind: "onlyInA" /* OnlyInA */ };
      }
      continue;
    }
    if (bi && !ai) {
      counts.onlyInB++;
      signature.push({ index: i2, kind: "onlyInB" /* OnlyInB */, bRole: bi.role, bName: bi.name, bCharLength: bi.charLength });
      drift.push({ name: `messages[${i2}]`, role: bi.role, status: "onlyInB" /* OnlyInB */, aSize: 0, bSize: bi.charLength });
      if (!broken) {
        broken = true;
        breakResult = { index: i2, kind: "onlyInB" /* OnlyInB */ };
      }
      continue;
    }
    if (!ai || !bi) {
      continue;
    }
    if (messagesEqual(ai, bi)) {
      counts.identical++;
      signature.push({
        index: i2,
        kind: "identical" /* Identical */,
        aRole: ai.role,
        aName: ai.name,
        aCharLength: ai.charLength,
        bRole: bi.role,
        bName: bi.name,
        bCharLength: bi.charLength
      });
      continue;
    }
    const kind = ai.charLength === bi.charLength ? "contentDrift" /* ContentDrift */ : "lengthChange" /* LengthChange */;
    if (kind === "contentDrift" /* ContentDrift */) {
      counts.contentDrift++;
    } else {
      counts.lengthChange++;
    }
    signature.push({
      index: i2,
      kind,
      aRole: ai.role,
      aName: ai.name,
      aCharLength: ai.charLength,
      bRole: bi.role,
      bName: bi.name,
      bCharLength: bi.charLength
    });
    drift.push({ name: `messages[${i2}]`, role: ai.role, status: kind, aSize: ai.charLength, bSize: bi.charLength });
    if (!broken) {
      broken = true;
      breakResult = { index: i2, kind };
    }
  }
  return { signature, break: breakResult, drift, counts };
}

var PREFIX_COMPONENT_ORDER = ["system", "tools"];

function insertPrefixComponent(drift, entry) {
  const prefixEntries = [];
  const rest = [];
  for (const d of drift) {
    if (PREFIX_COMPONENT_ORDER.includes(d.name)) {
      if (d.name !== entry.name) {
        prefixEntries.push(d);
      }
    } else {
      rest.push(d);
    }
  }
  prefixEntries.push(entry);
  prefixEntries.sort((a, b) => PREFIX_COMPONENT_ORDER.indexOf(a.name) - PREFIX_COMPONENT_ORDER.indexOf(b.name));
  return [...prefixEntries, ...rest];
}

function classifyStringDrift(a, b) {
  if (a === b) {
    return void 0;
  }
  if (!a) {
    return "onlyInB" /* OnlyInB */;
  }
  if (!b) {
    return "onlyInA" /* OnlyInA */;
  }
  return a.length === b.length ? "contentDrift" /* ContentDrift */ : "lengthChange" /* LengthChange */;
}

function appendSystemDrift(drift, aSystem, bSystem) {
  const status2 = classifyStringDrift(aSystem, bSystem);
  if (status2 === void 0) {
    return drift;
  }
  return insertPrefixComponent(drift, { name: "system", status: status2, aSize: aSystem?.length ?? 0, bSize: bSystem?.length ?? 0 });
}

function appendToolsDrift(drift, aTools, bTools) {
  const status2 = classifyStringDrift(aTools, bTools);
  if (status2 === void 0) {
    return drift;
  }
  return insertPrefixComponent(drift, { name: "tools", status: status2, aSize: aTools?.length ?? 0, bSize: bTools?.length ?? 0 });
}
export { parseInputMessages, stableStringify2, messagesEqual, diffPromptSignature, insertPrefixComponent, classifyStringDrift, appendSystemDrift, appendToolsDrift, PREFIX_COMPONENT_ORDER };
