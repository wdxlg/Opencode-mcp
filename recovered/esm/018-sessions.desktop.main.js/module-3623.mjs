// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionBrowsersControl.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableSignal } from "./module-0058.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { getChatPillEntries } from "./module-2235.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { IBrowserViewWorkbenchService, browserViewUrlMatches } from "./module-1243.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/sessions/contrib/chat/browser/sessionBrowsersControl.ts
var sessionBrowsersPillOptions = {
  widgetId: "sessionBrowsers",
  icon: Codicon.globe,
  title: localize(4606, null),
  summaryLabel: (count2) => localize(4605, null, count2),
  summaryAriaLabel: (count2) => localize(4609, null, count2)
};

var NO_URLS = /* @__PURE__ */ new Set();

function urlsEqual2(a, b) {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const url of a) {
    if (!b.has(url)) {
      return false;
    }
  }
  return true;
}

var SessionBrowsersControl = class extends Disposable {
  constructor(session, chat, enabled, visible, _browserViewService, _editorService) {
    super();
    this._browserViewService = _browserViewService;
    this._editorService = _editorService;
    this._debugData = observableValue(this, void 0);
    /** Browser titles and the known-browser set change outside the observable graph. */
    this._browsersChanged = observableSignal(this);
    this._browserListeners = this._register(new MutableDisposable());
    const allBrowsers = derived(this, (reader) => {
      this._browsersChanged.read(reader);
      const currentSession = session.read(reader);
      const currentChat = chat.read(reader);
      return !this._debugData.read(reader) && enabled.read(reader) && currentSession && currentChat ? this._collectBrowsers(this._collectOwnerIds(currentSession, currentChat, reader)) : [];
    });
    const allSections = derived(this, (reader) => {
      const debugData = this._debugData.read(reader);
      const currentChat = chat.read(reader);
      const browsers = debugData ? debugData.browsers.map((label3) => this._entry(label3, void 0, currentChat)) : allBrowsers.read(reader).map((input) => this._entry(input.title?.trim() || localize(4607, null), input, currentChat));
      return browsers.length > 0 ? [{ title: localize(4608, null), entries: browsers }] : [];
    });
    const allUrls = derivedOpts({ owner: this, equalsFn: urlsEqual2 }, (reader) => {
      const urls = /* @__PURE__ */ new Set();
      for (const input of allBrowsers.read(reader)) {
        if (input.url) {
          urls.add(input.url);
        }
      }
      return urls;
    });
    this.hasData = derived(this, (reader) => getChatPillEntries(allSections.read(reader)).length > 0);
    this.sections = derived(this, (reader) => visible.read(reader) ? allSections.read(reader) : []);
    this.urls = derivedOpts({ owner: this, equalsFn: urlsEqual2 }, (reader) => visible.read(reader) ? allUrls.read(reader) : NO_URLS);
    this._register(this._browserViewService.onDidChangeBrowserViews(() => this._refreshBrowserListeners()));
    this._refreshBrowserListeners();
  }
  setDebugData(data) {
    this._debugData.set(data, void 0);
  }
  _refreshBrowserListeners() {
    const store = new DisposableStore();
    this._browserListeners.value = store;
    for (const input of this._browserViewService.getKnownBrowserViews().values()) {
      store.add(input.onDidChangeLabel(() => this._browsersChanged.trigger(void 0)));
    }
    this._browsersChanged.trigger(void 0);
  }
  _collectOwnerIds(session, chat, reader) {
    const ownerIds = /* @__PURE__ */ new Set([chat.resource.toString()]);
    for (const candidate of session.chats.read(reader)) {
      if (candidate.origin?.kind === "tool" /* Tool */ && candidate.origin.parentChat && isEqual2(candidate.origin.parentChat, chat.resource)) {
        ownerIds.add(candidate.resource.toString());
      }
    }
    return ownerIds;
  }
  _collectBrowsers(ownerIds) {
    const inputs = [];
    for (const input of this._browserViewService.getKnownBrowserViews().values()) {
      const ownerId2 = input.model?.owner.type === "agent" ? input.model.owner.sessionId : void 0;
      if (ownerId2 && ownerIds.has(ownerId2)) {
        inputs.push(input);
      }
    }
    return inputs;
  }
  _entry(label3, input, chat) {
    return {
      id: input?.id ?? label3,
      label: label3,
      icon: Codicon.globe,
      open: () => {
        void this._openBrowser(input, chat);
      }
    };
  }
  async _openBrowser(input, chat) {
    if (!input) {
      return;
    }
    const target = this._getBrowserInputToOpen(input, chat);
    const existing = this._editorService.findEditors(target.resource).find((identifier2) => identifier2.editor instanceof BrowserEditorInput && identifier2.editor.id === target.id);
    const targetGroup = existing?.groupId ?? await this._browserViewService.getPreferredGroup();
    await this._editorService.openEditor(target, void 0, targetGroup);
  }
  _getBrowserInputToOpen(input, chat) {
    const url = input.url;
    if (input.model?.sharingState === "shared" /* Shared */ || !url) {
      return input;
    }
    const activeSessionId = chat?.resource.toString();
    const shared = [...this._browserViewService.getContextualBrowserViews({ activeSessionId }).values()].filter((candidate) => candidate.model?.sharingState === "shared" /* Shared */ && browserViewUrlMatches(candidate.url, url));
    return shared.find((candidate) => candidate.url === url) ?? shared.at(0) ?? input;
  }
};

SessionBrowsersControl = __decorateClass([
  __decorateParam(4, IBrowserViewWorkbenchService),
  __decorateParam(5, IEditorService)
], SessionBrowsersControl);
export { urlsEqual2, sessionBrowsersPillOptions, NO_URLS, SessionBrowsersControl };
