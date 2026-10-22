// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostChatStatus.ts
import { MainContext } from "./module-0054.mjs";
import { ExtensionIdentifier } from "./module-0059.mjs";


// src/vs/workbench/api/common/extHostChatStatus.ts
var ExtHostChatStatus = class {
  constructor(mainContext) {
    this._items = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatStatus);
  }
  createChatStatusItem(extension, id2) {
    const internalId = asChatItemIdentifier(extension.identifier, id2);
    if (this._items.has(internalId)) {
      throw new Error(`Chat status item '${id2}' already exists`);
    }
    const state = {
      id: internalId,
      title: "",
      description: "",
      detail: "",
      tooltip: void 0
    };
    let disposed = false;
    let visible = false;
    const syncState = () => {
      if (disposed) {
        throw new Error("Chat status item is disposed");
      }
      if (!visible) {
        return;
      }
      this._proxy.$setEntry(id2, state);
    };
    const item = Object.freeze({
      id: id2,
      get title() {
        return state.title;
      },
      set title(value) {
        state.title = value;
        syncState();
      },
      get description() {
        return state.description;
      },
      set description(value) {
        state.description = value;
        syncState();
      },
      get detail() {
        return state.detail;
      },
      set detail(value) {
        state.detail = value;
        syncState();
      },
      get tooltip() {
        return state.tooltip;
      },
      set tooltip(value) {
        state.tooltip = value;
        syncState();
      },
      show: () => {
        visible = true;
        syncState();
      },
      hide: () => {
        visible = false;
        this._proxy.$disposeEntry(id2);
      },
      dispose: () => {
        disposed = true;
        this._proxy.$disposeEntry(id2);
        this._items.delete(internalId);
      }
    });
    this._items.set(internalId, item);
    return item;
  }
};

function asChatItemIdentifier(extension, id2) {
  return `${ExtensionIdentifier.toKey(extension)}.${id2}`;
}
export { asChatItemIdentifier, ExtHostChatStatus };
