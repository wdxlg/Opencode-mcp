// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/attachments/chatContextPickService.ts
import { isObject } from "./module-0010.mjs";
import { derived } from "./module-0054.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { toDisposable } from "./module-0012.mjs";
import { ObservablePromise } from "./module-0055.mjs";
import { createDecorator } from "./module-0077.mjs";
import { compare } from "./module-0030.mjs";


// src/vs/workbench/contrib/chat/browser/attachments/chatContextPickService.ts
var CHAT_CONTEXT_FILES_AND_FOLDERS_ID = "chatContext.filesAndFolders";

var CHAT_CONTEXT_TERMINAL_ID = "chatContext.terminal";

function isChatContextPickerPickItem(item) {
  return isObject(item) && typeof item.asAttachment === "function";
}

function picksWithPromiseFn(fn) {
  return (query, token) => {
    const promise = derived((reader) => {
      const queryValue = query.read(reader);
      const cts = new CancellationTokenSource(token);
      reader.store.add(toDisposable(() => cts.dispose(true)));
      return new ObservablePromise(fn(queryValue, cts.token));
    });
    return promise.map((value2, reader) => {
      const result = value2.promiseResult.read(reader);
      return { picks: result?.data || [], busy: result === void 0 };
    });
  };
}

var IChatContextPickService = createDecorator("IContextPickService");

var ChatContextPickService = class {
  constructor() {
    this._picks = [];
    this.items = this._picks;
  }
  registerChatContextItem(pick) {
    this._picks.push(pick);
    this._picks.sort((a, b) => {
      const valueA = a.ordinal ?? 0;
      const valueB = b.ordinal ?? 0;
      if (valueA === valueB) {
        return compare(a.label, b.label);
      } else if (valueA < valueB) {
        return 1;
      } else {
        return -1;
      }
    });
    return toDisposable(() => {
      const index2 = this._picks.indexOf(pick);
      if (index2 >= 0) {
        this._picks.splice(index2, 1);
      }
    });
  }
};
export { isChatContextPickerPickItem, picksWithPromiseFn, CHAT_CONTEXT_FILES_AND_FOLDERS_ID, CHAT_CONTEXT_TERMINAL_ID, IChatContextPickService, ChatContextPickService };
