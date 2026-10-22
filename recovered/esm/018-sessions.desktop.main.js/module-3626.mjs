// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionChatInputToolbar.ts
import { URI } from "./module-0032.mjs";
import { SESSION_REFERENCES_PILL_ID, SessionArtifacts, sessionArtifactLocation, sessionReferencesPillOptions } from "./module-3618.mjs";
import { localize } from "./module-0001.mjs";
import { CHAT_TURN_ARTIFACT_PILL_ID, CHAT_TURN_CHANGES_PILL_ID, ChatTurnPillsProvider, EMPTY_DIFF_STATS, diffStatsEqual, observeTurnStatusPillsEnabled } from "./module-2240.mjs";
import { VIEW_SESSION_CHANGES_COMMAND_ID } from "./module-3620.mjs";
import { SESSION_CUSTOMIZATIONS_PILL_ID, SessionCustomizations, chatCustomizationPillOptions } from "./module-3619.mjs";
import { OPEN_ISSUE_ACTION_ID, OPEN_PULL_REQUEST_ACTION_ID } from "./module-3594.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { SessionChatPillVisibility, getSessionChatPillMenu } from "./module-3621.mjs";
import { SessionBrowsersControl, sessionBrowsersPillOptions } from "./module-3623.mjs";
import { SessionMetadataPills } from "./module-3624.mjs";
import { SessionBackgroundActivitiesControl, sessionSubagentsPillOptions } from "./module-3622.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { Action, Separator, toAction } from "./module-0082.mjs";
import { createChatSectionPill } from "./module-2239.mjs";
import { ChatPillsWidget, getChatPillEntries } from "./module-2235.mjs";
import { SessionActivatingActionRunner } from "./module-3625.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChatResponseFileChangesService } from "./module-2233.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/chat/browser/sessionChatInputToolbar.ts
function computeTurnStats(chat, reader) {
  let files = 0, insertions = 0, deletions = 0;
  for (const change of chat.lastTurnChanges?.read(reader) ?? []) {
    if (change.isOutsideWorkspace) {
      continue;
    }
    files++;
    insertions += change.insertions;
    deletions += change.deletions;
  }
  return { files, insertions, deletions };
}

function buildDebugArtifactSections(debugData) {
  const entries2 = debugData.markdownFiles.map((name) => {
    const resource = URI.from({ scheme: "session-chat-pills-debug", path: `/${name}` });
    return { id: name, label: name, resource, ...sessionArtifactLocation(resource.path, name), open: () => {
    } };
  });
  return entries2.length ? [{ title: localize(4610, null), entries: entries2 }] : [];
}

var SESSION_BROWSERS_PILL_ID = "sessions.chatPills.browsers";

var SESSION_SUBAGENTS_PILL_ID = "sessions.chatPills.subagents";

function getSessionChatPillKindForAction(actionId) {
  switch (actionId) {
    case CHAT_TURN_CHANGES_PILL_ID:
    case VIEW_SESSION_CHANGES_COMMAND_ID:
      return "changes" /* Changes */;
    case CHAT_TURN_ARTIFACT_PILL_ID:
      return "artifacts" /* Artifacts */;
    case SESSION_REFERENCES_PILL_ID:
      return "references" /* References */;
    case SESSION_CUSTOMIZATIONS_PILL_ID:
      return "customizations" /* Customizations */;
    case OPEN_PULL_REQUEST_ACTION_ID:
      return "pullRequests" /* PullRequests */;
    case OPEN_ISSUE_ACTION_ID:
      return "issues" /* Issues */;
    case SESSION_BROWSERS_PILL_ID:
      return "browsers" /* Browsers */;
    case SESSION_SUBAGENTS_PILL_ID:
      return "subagents" /* Subagents */;
    default:
      return void 0;
  }
}

var SESSION_CHAT_INPUT_TOOLBAR_HEIGHT = 28;

var SessionChatInputToolbar = class extends Disposable {
  constructor(_configurationService, _contextMenuService, _sessionsService, _chatResponseFileChangesService, instantiationService) {
    super();
    this._configurationService = _configurationService;
    this._contextMenuService = _contextMenuService;
    this._sessionsService = _sessionsService;
    this._chatResponseFileChangesService = _chatResponseFileChangesService;
    this._onDidChangeChatPetPlatform = this._register(new Emitter());
    this.onDidChangeChatPetPlatform = this._onDidChangeChatPetPlatform.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._visible = false;
    /** Sentinel distinguishing "no override" from an explicit `undefined` session. */
    this._sessionOverride = observableValue(this, "unset");
    /** The chat whose last-turn changes are reflected. */
    this._chat = observableValue(this, void 0);
    this._debugData = observableValue(this, void 0);
    /** The session that owns the reflected chat, from an explicit override or resolved from the chat. */
    this._session = derived((reader) => {
      const override = this._sessionOverride.read(reader);
      if (override !== "unset") {
        return override;
      }
      const chat = this._chat.read(reader);
      if (!chat) {
        return void 0;
      }
      return this._findOwningSession(chat.resource, reader);
    });
    this._content = $(".session-chat-input-toolbar-content");
    this._scrollable = this._register(new DomScrollableElement(this._content, {
      horizontal: 1 /* Auto */,
      horizontalScrollbarSize: 6,
      scrollYToX: true,
      vertical: 2 /* Hidden */
    }));
    this.element = this._scrollable.getDomNode();
    this.element.classList.add("session-chat-input-toolbar", "hidden");
    this._diffStats = derivedOpts({ owner: this, equalsFn: diffStatsEqual }, (reader) => {
      const debugData = this._debugData.read(reader);
      if (debugData) {
        return debugData.stats;
      }
      const chat = this._chat.read(reader);
      return chat ? computeTurnStats(chat, reader) : EMPTY_DIFF_STATS;
    });
    const turnStatusPillsEnabled = observeTurnStatusPillsEnabled(this._configurationService);
    const visibility = this._register(instantiationService.createInstance(SessionChatPillVisibility));
    this._browsers = this._register(instantiationService.createInstance(SessionBrowsersControl, this._session, this._chat, turnStatusPillsEnabled, derived((reader) => visibility.isVisible("browsers" /* Browsers */, reader))));
    const sessionArtifacts = this._register(instantiationService.createInstance(SessionArtifacts, this._session, this._browsers.urls));
    this._artifactSections = derived(this, (reader) => {
      const debugData = this._debugData.read(reader);
      return debugData ? buildDebugArtifactSections(debugData) : sessionArtifacts.sections.read(reader);
    });
    this._referenceSections = sessionArtifacts.referenceSections;
    const sessionCustomizations = this._register(instantiationService.createInstance(SessionCustomizations, this._chat, this._session));
    this._customizationSections = sessionCustomizations.sections;
    const pillsEnabled = derived((reader) => this._debugData.read(reader) !== void 0 || turnStatusPillsEnabled.read(reader));
    const model = {
      stats: this._diffStats,
      artifacts: this._artifactSections,
      changesEnabled: pillsEnabled,
      artifactsEnabled: pillsEnabled,
      openChanges: () => this._debugData.get() ? void 0 : this._openChanges()
    };
    const turnPills = this._register(instantiationService.createInstance(ChatTurnPillsProvider, model));
    const metadataPills = this._register(instantiationService.createInstance(SessionMetadataPills, this.element, this._session));
    const candidatePills = derived((reader) => {
      const turn = turnPills.pills.read(reader);
      return [
        ...metadataPills.pills.read(reader),
        ...turn.filter((pill) => pill.action.id !== CHAT_TURN_CHANGES_PILL_ID)
      ];
    });
    this._backgroundActivities = this._register(instantiationService.createInstance(SessionBackgroundActivitiesControl, this._session, this._chat, turnStatusPillsEnabled, derived((reader) => visibility.isVisible("subagents" /* Subagents */, reader))));
    const resourceLabels = this._register(instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    const sectionPill = (id2, label3, sections, options3) => {
      const action = this._register(new Action(id2, label3));
      return createChatSectionPill(action, sections, options3, resourceLabels, instantiationService);
    };
    const gated = (kind, source) => {
      const available = derived((reader) => turnStatusPillsEnabled.read(reader) ? source.read(reader) : []);
      return {
        hasData: derived((reader) => getChatPillEntries(available.read(reader)).length > 0),
        sections: derived((reader) => visibility.isVisible(kind, reader) ? available.read(reader) : [])
      };
    };
    const customizations = gated("customizations" /* Customizations */, this._customizationSections);
    const references = gated("references" /* References */, this._referenceSections);
    const sectionPills = [
      { pill: sectionPill(SESSION_REFERENCES_PILL_ID, localize(4613, null), references.sections, sessionReferencesPillOptions), sections: references.sections },
      { pill: sectionPill(SESSION_CUSTOMIZATIONS_PILL_ID, localize(4612, null), customizations.sections, chatCustomizationPillOptions), sections: customizations.sections },
      { pill: sectionPill(SESSION_BROWSERS_PILL_ID, localize(4611, null), this._browsers.sections, sessionBrowsersPillOptions), sections: this._browsers.sections },
      { pill: sectionPill(SESSION_SUBAGENTS_PILL_ID, localize(4614, null), this._backgroundActivities.sections, sessionSubagentsPillOptions), sections: this._backgroundActivities.sections }
    ];
    const pillsModel = {
      pills: derived((reader) => [
        ...candidatePills.read(reader).filter((pill) => {
          const kind = getSessionChatPillKindForAction(pill.action.id);
          return !kind || visibility.isVisible(kind, reader);
        }),
        ...sectionPills.filter((entry) => getChatPillEntries(entry.sections.read(reader)).length > 0).map((entry) => entry.pill.read(reader))
      ]),
      context: this._session
    };
    const actionRunner = this._register(new SessionActivatingActionRunner(() => this._session.get(), this._sessionsService));
    const pills = this._pills = this._register(instantiationService.createInstance(ChatPillsWidget, pillsModel, {
      actionRunner,
      // The row's visibility menu must be reachable by right-clicking a pill,
      // not just the empty space beside it.
      allowContextMenu: true
    }));
    pills.element.classList.add("show-file-icons");
    this._content.appendChild(pills.element);
    this._register(pills.onDidChangePills(() => this._onDidChangeChatPetPlatform.fire()));
    const kindsWithData = derived((reader) => {
      const kinds = /* @__PURE__ */ new Set();
      for (const pill of candidatePills.read(reader)) {
        const kind = getSessionChatPillKindForAction(pill.action.id);
        if (kind) {
          kinds.add(kind);
        }
      }
      if (this._browsers.hasData.read(reader)) {
        kinds.add("browsers" /* Browsers */);
      }
      if (this._backgroundActivities.hasData.read(reader)) {
        kinds.add("subagents" /* Subagents */);
      }
      if (customizations.hasData.read(reader)) {
        kinds.add("customizations" /* Customizations */);
      }
      if (references.hasData.read(reader)) {
        kinds.add("references" /* References */);
      }
      return kinds;
    });
    this._register(addDisposableListener(this._content, EventType.CONTEXT_MENU, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const kinds = kindsWithData.get();
      if (kinds.size === 0) {
        return;
      }
      const anchor = new StandardMouseEvent(getWindow(this._content), e4);
      const targetPill = pills.getPill(e4.target);
      const targetKind = targetPill ? getSessionChatPillKindForAction(targetPill.action.id) : void 0;
      this._contextMenuService.showContextMenu({
        getAnchor: () => anchor,
        getActions: () => {
          const menu = getSessionChatPillMenu(kinds, visibility.readHiddenKinds(void 0), targetKind);
          const toggleAction = (entry) => toAction({
            id: `sessions.chatPills.toggle.${entry.kind}`,
            label: entry.label,
            checked: entry.checked,
            run: () => visibility.toggle(entry.kind)
          });
          const groups = [];
          if (menu.hide) {
            const hide4 = menu.hide;
            groups.push([toAction({
              id: `sessions.chatPills.hide.${hide4.kind}`,
              label: hide4.label,
              run: () => visibility.hide(hide4.kind)
            })]);
          }
          groups.push(menu.withData.map(toggleAction), menu.withoutData.map(toggleAction));
          return Separator.join(...groups);
        }
      });
    }));
    const resizeObserver = this._register(new DisposableResizeObserver("SessionChatInputToolbar.content", () => {
      this._scrollable.scanDomNode();
      this._onDidChangeChatPetPlatform.fire();
    }));
    this._register(resizeObserver.observe(this._content));
    this._register(resizeObserver.observe(pills.element));
    this._register(this._scrollable.onScroll((e4) => {
      if (e4.scrollLeftChanged) {
        this._onDidChangeChatPetPlatform.fire();
      }
    }));
    this._register(addDisposableListener(this._content, EventType.FOCUS_IN, () => this._scrollable.scanDomNode()));
    this._register(autorun((reader) => {
      const anyVisible = pills.isVisible.read(reader);
      const anyHidden = kindsWithData.read(reader).size > 0;
      const visible = anyVisible || anyHidden;
      this.element.classList.toggle("hidden", !visible);
      this.element.classList.toggle("empty", !anyVisible);
      if (this._visible !== visible) {
        this._visible = visible;
        this._onDidChangeVisibility.fire(visible);
      }
      this._scrollable.scanDomNode();
    }));
  }
  get visible() {
    return this._visible;
  }
  getChatPetPlatformElements() {
    return this._pills.getPillElements();
  }
  /**
   * Track the currently-viewed chat; the toolbar reflects that chat's last-turn
   * changes and status, resolving the owning session for provider gating and the
   * open-changes action. Clears any explicit {@link setSession} override.
   */
  setChat(chat) {
    this.setDebugData(void 0);
    this._sessionOverride.set("unset", void 0);
    this._chat.set(chat, void 0);
  }
  /**
   * Explicitly set the session and chat to reflect, bypassing chat-to-session
   * resolution. Intended for component fixtures and callers that already hold
   * both.
   */
  setSession(session, chat) {
    this.setDebugData(void 0);
    this._sessionOverride.set(session, void 0);
    this._chat.set(chat, void 0);
  }
  setDebugData(data) {
    this._debugData.set(data, void 0);
    this._browsers.setDebugData(data);
    this._backgroundActivities.setDebugData(data);
  }
  getDebugData() {
    return this._debugData.get();
  }
  _findOwningSession(chatResource, reader) {
    for (const session of this._sessionsService.visibleSessions.read(reader)) {
      if (session?.chats.read(reader).some((c) => isEqual2(c.resource, chatResource))) {
        return session;
      }
    }
    const active = this._sessionsService.activeSession.read(reader);
    return active?.chats.read(reader).some((c) => isEqual2(c.resource, chatResource)) ? active : void 0;
  }
  _openChanges() {
    const chat = this._chat.get();
    if (!chat) {
      return;
    }
    this._chatResponseFileChangesService.openChangesForRequest(chat.resource, void 0, { isLastTurn: true });
  }
};

SessionChatInputToolbar = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, IChatResponseFileChangesService),
  __decorateParam(4, IInstantiationService)
], SessionChatInputToolbar);
export { computeTurnStats, buildDebugArtifactSections, getSessionChatPillKindForAction, SESSION_BROWSERS_PILL_ID, SESSION_SUBAGENTS_PILL_ID, SESSION_CHAT_INPUT_TOOLBAR_HEIGHT, SessionChatInputToolbar };
