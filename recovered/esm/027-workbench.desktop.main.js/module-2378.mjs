// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindHighlights.ts



// src/vs/workbench/contrib/chat/browser/widget/chatFind/chatFindHighlights.ts
function supportsCssHighlightApi(targetWindow) {
  return typeof targetWindow.Highlight !== "undefined" && !!targetWindow.CSS?.highlights;
}

var registries = /* @__PURE__ */ new WeakMap();

function getChatFindHighlightRegistry(targetWindow) {
  let registry4 = registries.get(targetWindow);
  if (!registry4) {
    registry4 = createChatFindHighlightRegistry(targetWindow);
    registries.set(targetWindow, registry4);
  }
  return registry4;
}

function createChatFindHighlightRegistry(targetWindow) {
  const ownerRanges = /* @__PURE__ */ new Map();
  const highlights = /* @__PURE__ */ new Map();
  const priorities = /* @__PURE__ */ new Map();
  function repaint(name) {
    const cssHighlights = targetWindow.CSS?.highlights;
    const HighlightCtor = targetWindow.Highlight;
    if (!cssHighlights || !HighlightCtor) {
      return;
    }
    const merged = [];
    for (const byName of ownerRanges.values()) {
      merged.push(...byName.get(name) ?? []);
    }
    if (merged.length === 0) {
      if (highlights.delete(name)) {
        cssHighlights.delete(name);
      }
      return;
    }
    let highlight = highlights.get(name);
    if (!highlight) {
      highlight = new HighlightCtor();
      highlights.set(name, highlight);
    } else {
      highlight.clear();
    }
    const priority = priorities.get(name);
    if (priority !== void 0) {
      highlight.priority = priority;
    }
    for (const range2 of merged) {
      highlight.add(range2);
    }
    cssHighlights.set(name, highlight);
  }
  return {
    setRanges(owner, name, ranges, priority) {
      let byName = ownerRanges.get(owner);
      if (!byName) {
        byName = /* @__PURE__ */ new Map();
        ownerRanges.set(owner, byName);
      }
      byName.set(name, ranges);
      if (priority !== void 0) {
        priorities.set(name, priority);
      }
      repaint(name);
    },
    clear(owner) {
      const byName = ownerRanges.get(owner);
      if (!byName) {
        return;
      }
      ownerRanges.delete(owner);
      for (const name of byName.keys()) {
        repaint(name);
      }
    }
  };
}
export { supportsCssHighlightApi, getChatFindHighlightRegistry, createChatFindHighlightRegistry, registries };
