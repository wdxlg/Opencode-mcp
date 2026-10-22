// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/modelChannelOrder.ts



// src/vs/workbench/contrib/chat/common/modelChannelOrder.ts
var KEY = "opencode.chat.modelChannelOrder.v1";

function channelOrderKey(vendor, group2) {
  return `${vendor}\0${group2}`;
}

function compareDefaultChannelOrder(leftVendor, rightVendor) {
  return Number(rightVendor === "opencode-codex") - Number(leftVendor === "opencode-codex");
}

function compareChannelOrder(leftKey, leftVendor, rightKey, rightVendor, saved) {
  const defaultOrder = compareDefaultChannelOrder(leftVendor, rightVendor);
  if (defaultOrder && (leftVendor === "opencode-codex" && !saved.includes(leftKey) || rightVendor === "opencode-codex" && !saved.includes(rightKey))) {
    return defaultOrder;
  }
  return compareModelOrder(leftKey, rightKey, saved);
}

function readModelChannelOrder(storage) {
  try {
    const data = JSON.parse(storage.get(KEY, -1 /* APPLICATION */, "") || "{}");
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("invalid order");
    }
    const value2 = data;
    const validList = (items) => Array.isArray(items) ? [...new Set(items.filter((id2) => typeof id2 === "string" && id2.length > 0 && id2.length < 512))].slice(0, 1e3) : [];
    const models = /* @__PURE__ */ Object.create(null);
    if (value2.models && typeof value2.models === "object" && !Array.isArray(value2.models)) {
      for (const [key3, items] of Object.entries(value2.models).slice(0, 1e3)) {
        if (key3.length < 512) {
          models[key3] = validList(items);
        }
      }
    }
    return { channels: validList(value2.channels), models };
  } catch {
    return { channels: [], models: /* @__PURE__ */ Object.create(null) };
  }
}

function saveModelChannelOrder(storage, order) {
  storage.store(KEY, JSON.stringify(order), -1 /* APPLICATION */, 0 /* USER */);
}

function compareModelOrder(left, right, saved) {
  const a = saved.indexOf(left);
  const b = saved.indexOf(right);
  return (a < 0 ? Infinity : a) - (b < 0 ? Infinity : b) || 0;
}

function moveModelOrder(visible, current, target) {
  const items = [...new Set(visible)];
  const from = items.indexOf(current);
  const to = items.indexOf(target);
  if (from < 0 || to < 0 || from === to) {
    return items;
  }
  items.splice(from, 1);
  items.splice(to, 0, current);
  return items;
}
export { channelOrderKey, compareDefaultChannelOrder, compareChannelOrder, readModelChannelOrder, saveModelChannelOrder, compareModelOrder, moveModelOrder, KEY };
