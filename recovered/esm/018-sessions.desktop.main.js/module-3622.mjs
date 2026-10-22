// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionBackgroundActivitiesControl.ts
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { getChatPillEntries } from "./module-2235.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/chat/browser/sessionBackgroundActivitiesControl.ts
var SUBAGENT_LABEL_MAX_LENGTH = 30;

var sessionSubagentsPillOptions = {
  widgetId: "sessionBackgroundActivities",
  icon: Codicon.agent,
  title: localize(4600, null),
  summaryLabel: (count2) => localize(4604, null, count2),
  summaryAriaLabel: (count2) => localize(4601, null, count2)
};

var SessionBackgroundActivitiesControl = class extends Disposable {
  constructor(session, chat, enabled, visible, _sessionsService) {
    super();
    this._sessionsService = _sessionsService;
    this._debugData = observableValue(this, void 0);
    const allSections = derived(this, (reader) => {
      const debugData = this._debugData.read(reader);
      const currentSession = session.read(reader);
      const currentChat = chat.read(reader);
      const subagents = debugData ? debugData.subagents.map((label3) => this._entry(label3, void 0, currentSession)) : enabled.read(reader) && currentSession && currentChat ? this._collectSubagents(currentSession, currentChat, reader) : [];
      return subagents.length > 0 ? [{ title: localize(4603, null), entries: subagents }] : [];
    });
    this.hasData = derived(this, (reader) => getChatPillEntries(allSections.read(reader)).length > 0);
    this.sections = derived(this, (reader) => visible.read(reader) ? allSections.read(reader) : []);
  }
  setDebugData(data) {
    this._debugData.set(data, void 0);
  }
  /** Returns direct subagents of `parentChat` in every status. */
  _collectSubagents(session, parentChat, reader) {
    return session.chats.read(reader).filter((chat) => chat.origin?.kind === "tool" /* Tool */ && !!chat.origin.parentChat && isEqual2(chat.origin.parentChat, parentChat.resource)).map((chat) => this._entry(chat.title.read(reader), chat, session));
  }
  _entry(title, chat, session) {
    const name = title.trim() || localize(4602, null);
    return {
      id: chat?.resource.toString() ?? name,
      label: name.length > SUBAGENT_LABEL_MAX_LENGTH ? `${name.slice(0, SUBAGENT_LABEL_MAX_LENGTH)}...` : name,
      icon: Codicon.agent,
      open: () => {
        if (chat && session) {
          this._sessionsService.openChat(session, chat.resource);
        }
      }
    };
  }
};

SessionBackgroundActivitiesControl = __decorateClass([
  __decorateParam(4, ISessionsService)
], SessionBackgroundActivitiesControl);
export { SUBAGENT_LABEL_MAX_LENGTH, sessionSubagentsPillOptions, SessionBackgroundActivitiesControl };
