// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/common/sessionChatPills.ts
import { localize } from "./module-0001.mjs";
import { observableMemento } from "./module-1018.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/chat/common/sessionChatPills.ts
var SESSION_CHAT_PILL_KINDS = [
  "changes" /* Changes */,
  "artifacts" /* Artifacts */,
  "references" /* References */,
  "customizations" /* Customizations */,
  "pullRequests" /* PullRequests */,
  "issues" /* Issues */,
  "browsers" /* Browsers */,
  "subagents" /* Subagents */
];

function getSessionChatPillLabel(kind) {
  switch (kind) {
    case "changes" /* Changes */:
      return localize(4739, null);
    case "artifacts" /* Artifacts */:
      return localize(4737, null);
    case "references" /* References */:
      return localize(4744, null);
    case "customizations" /* Customizations */:
      return localize(4740, null);
    case "pullRequests" /* PullRequests */:
      return localize(4743, null);
    case "issues" /* Issues */:
      return localize(4742, null);
    case "browsers" /* Browsers */:
      return localize(4738, null);
    case "subagents" /* Subagents */:
      return localize(4745, null);
  }
}

function isSessionChatPillHideable(kind) {
  return kind !== "changes" /* Changes */;
}

function getSessionChatPillMenu(kindsWithData, hiddenKinds, targetKind) {
  const withData = [];
  const withoutData = [];
  for (const kind of SESSION_CHAT_PILL_KINDS) {
    if (!isSessionChatPillHideable(kind)) {
      continue;
    }
    (kindsWithData.has(kind) ? withData : withoutData).push({
      kind,
      label: getSessionChatPillLabel(kind),
      checked: !hiddenKinds.has(kind)
    });
  }
  const hide4 = targetKind !== void 0 && isSessionChatPillHideable(targetKind) ? { kind: targetKind, label: localize(4741, null, getSessionChatPillLabel(targetKind)) } : void 0;
  return { ...hide4 ? { hide: hide4 } : {}, withData, withoutData };
}

var defaultHiddenKinds = [
  "customizations" /* Customizations */,
  "subagents" /* Subagents */
];

var hiddenSessionChatPills = observableMemento({
  defaultValue: defaultHiddenKinds,
  key: "sessions.chatPills.hidden",
  toStorage: (kinds) => JSON.stringify(kinds),
  fromStorage: (value2) => {
    const parsed = JSON.parse(value2);
    return Array.isArray(parsed) ? parsed.filter((kind) => typeof kind === "string") : [];
  }
});

var SessionChatPillVisibility = class extends Disposable {
  constructor(storageService) {
    super();
    this._hiddenKinds = this._register(hiddenSessionChatPills(-1 /* APPLICATION */, 0 /* USER */, storageService));
  }
  readHiddenKinds(reader) {
    return new Set(this._hiddenKinds.read(reader).filter(isSessionChatPillHideable));
  }
  isVisible(kind, reader) {
    return !isSessionChatPillHideable(kind) || !this._hiddenKinds.read(reader).includes(kind);
  }
  hide(kind) {
    if (isSessionChatPillHideable(kind) && !this._hiddenKinds.get().includes(kind)) {
      this._hiddenKinds.set([...this._hiddenKinds.get(), kind], void 0);
    }
  }
  toggle(kind) {
    if (!isSessionChatPillHideable(kind)) {
      return;
    }
    const hidden = this._hiddenKinds.get();
    this._hiddenKinds.set(hidden.includes(kind) ? hidden.filter((hiddenKind) => hiddenKind !== kind) : [...hidden, kind], void 0);
  }
};

SessionChatPillVisibility = __decorateClass([
  __decorateParam(0, IStorageService)
], SessionChatPillVisibility);
export { getSessionChatPillLabel, isSessionChatPillHideable, getSessionChatPillMenu, SESSION_CHAT_PILL_KINDS, defaultHiddenKinds, hiddenSessionChatPills, SessionChatPillVisibility };
