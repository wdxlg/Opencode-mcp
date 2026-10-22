// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostChatInputNotification.ts
import { MainContext } from "./module-0025.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";


// src/vs/workbench/api/common/extHostChatInputNotification.ts
var ExtHostChatInputNotification = class {
  constructor(mainContext) {
    this._items = /* @__PURE__ */ new Map();
    this._proxy = mainContext.getProxy(MainContext.MainThreadChatInputNotification);
  }
  createInputNotification(extension, id2) {
    const internalId = asNotificationIdentifier(extension.identifier, id2);
    if (this._items.has(internalId)) {
      throw new Error(`Chat input notification '${id2}' already exists`);
    }
    const state = {
      id: internalId,
      severity: 0 /* Info */,
      message: "",
      description: void 0,
      actions: [],
      dismissible: true,
      autoDismissOnMessage: false,
      sessionTypes: void 0
    };
    let disposed = false;
    let visible = false;
    const syncState = () => {
      if (disposed) {
        throw new Error("Chat input notification is disposed");
      }
      if (!visible) {
        return;
      }
      this._proxy.$setNotification({ ...state });
    };
    const item = Object.freeze({
      id: id2,
      get severity() {
        return state.severity;
      },
      set severity(value) {
        state.severity = value;
        syncState();
      },
      get message() {
        return state.message;
      },
      set message(value) {
        state.message = value;
        syncState();
      },
      get description() {
        return state.description;
      },
      set description(value) {
        state.description = value;
        syncState();
      },
      get actions() {
        return state.actions;
      },
      set actions(value) {
        state.actions = value.map((a) => ({ label: a.label, commandId: a.commandId, commandArgs: a.commandArgs }));
        syncState();
      },
      get dismissible() {
        return state.dismissible;
      },
      set dismissible(value) {
        state.dismissible = value;
        syncState();
      },
      get autoDismissOnMessage() {
        return state.autoDismissOnMessage;
      },
      set autoDismissOnMessage(value) {
        state.autoDismissOnMessage = value;
        syncState();
      },
      get sessionTypes() {
        return state.sessionTypes;
      },
      set sessionTypes(value) {
        state.sessionTypes = value;
        syncState();
      },
      show: () => {
        visible = true;
        syncState();
      },
      hide: () => {
        if (disposed) {
          return;
        }
        visible = false;
        this._proxy.$disposeNotification(internalId);
      },
      dispose: () => {
        if (disposed) {
          return;
        }
        disposed = true;
        visible = false;
        this._proxy.$disposeNotification(internalId);
        this._items.delete(internalId);
      }
    });
    this._items.set(internalId, item);
    return item;
  }
};

function asNotificationIdentifier(extension, id2) {
  return `${ExtensionIdentifier.toKey(extension)}.${id2}`;
}
export { asNotificationIdentifier, ExtHostChatInputNotification };
