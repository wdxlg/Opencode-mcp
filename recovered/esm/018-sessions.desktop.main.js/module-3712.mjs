// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/blockedSessionsList.ts
import { Disposable, combinedDisposable } from "./module-0012.mjs";
import { MenuRegistry } from "./module-0092.mjs";
import { Menus } from "./module-3437.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SessionItemStatusContext, SessionsFlatList } from "./module-3523.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, append } from "./module-0075.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { status } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/sessions/browser/blockedSessionsList.ts
var IGNORE_INPUT_NEEDED_COMMAND_ID = "sessions.blockedSessions.ignoreInputNeeded";

var IGNORE_CI_FAILURE_COMMAND_ID = "sessions.blockedSessions.ignoreCIFailure";

function registerBlockedSessionsItemActions() {
  return combinedDisposable(
    MenuRegistry.appendMenuItem(Menus.BlockedSessionsItem, {
      command: {
        id: IGNORE_INPUT_NEEDED_COMMAND_ID,
        title: localize(5313, null),
        icon: Codicon.bellSlash
      },
      group: "navigation",
      order: 1,
      when: ContextKeyExpr.equals(SessionItemStatusContext.key, 2 /* NeedsInput */)
    }),
    MenuRegistry.appendMenuItem(Menus.BlockedSessionsItem, {
      command: {
        id: IGNORE_CI_FAILURE_COMMAND_ID,
        title: localize(5312, null),
        icon: Codicon.bellSlash
      },
      group: "navigation",
      order: 1,
      when: ContextKeyExpr.notEquals(SessionItemStatusContext.key, 2 /* NeedsInput */)
    })
  );
}

var BLOCKED_LIST_WIDTH = 360;

var BLOCKED_LIST_MAX_VISIBLE_ROWS = 8;

var BLOCKED_LIST_APPROVAL_ROW_MAX_LINES = 5;

var BlockedSessionsList = class extends Disposable {
  constructor(container2, options3, instantiationService) {
    super();
    this._onDidChangeContentHeight = this._register(new Emitter());
    /** Fires when the list resizes and the host should re-layout its container. */
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidApproveSession = this._register(new Emitter());
    /** Fires when a session's pending action is approved from its "Allow" button. */
    this.onDidApproveSession = this._onDidApproveSession.event;
    this._width = options3.width ?? BLOCKED_LIST_WIDTH;
    const element = append(container2, $(".agent-sessions-blocked-list"));
    const header2 = append(element, $(".agent-sessions-blocked-list-header"));
    const title = append(header2, $(".agent-sessions-blocked-list-title"));
    title.textContent = localize(5315, null);
    const headerActions = append(header2, $(".agent-sessions-blocked-list-header-actions"));
    this._register(instantiationService.createInstance(MenuWorkbenchToolBar, headerActions, Menus.BlockedSessionsHeader, {
      hiddenItemStrategy: -1 /* NoHide */,
      menuOptions: {
        arg: {
          showAllSessions: options3.onShowAllSessions,
          ignoreAllSessions: () => {
            options3.onIgnoreAllSessions();
            status(localize(5310, null));
          },
          close: options3.onClose
        }
      },
      toolbarOptions: { primaryGroup: () => true },
      telemetrySource: "blockedSessionsList.header"
    }));
    this._rowsContainer = append(element, $(".agent-sessions-blocked-list-rows"));
    this._list = this._register(instantiationService.createInstance(SessionsFlatList, this._rowsContainer, {
      showSessionHover: true,
      onSessionOpen: options3.onSessionOpen,
      approvalModel: options3.approvalModel,
      ciFixModel: options3.ciFixModel,
      approvalRowMaxLines: BLOCKED_LIST_APPROVAL_ROW_MAX_LINES,
      toolbarMenuId: Menus.BlockedSessionsItem,
      onToolbarAction: (action, session) => {
        if (action.id !== IGNORE_INPUT_NEEDED_COMMAND_ID && action.id !== IGNORE_CI_FAILURE_COMMAND_ID) {
          return false;
        }
        options3.onIgnoreSession(session);
        status(action.id === IGNORE_INPUT_NEEDED_COMMAND_ID ? localize(5314, null) : localize(5311, null));
        return true;
      }
    }));
    this._register(this._list.onDidChangeContentHeight(() => {
      this._layout();
      this._onDidChangeContentHeight.fire();
    }));
    this._register(this._list.onDidApproveSession((approved) => this._onDidApproveSession.fire(approved)));
  }
  /** Replace the sessions shown in the list and resize to fit their content. */
  setSessions(sessions) {
    this._list.setSessions(sessions);
    this._layout();
  }
  /** Move keyboard focus into the list. */
  focus() {
    this._list.focus();
  }
  /**
   * Update the list width (e.g. when the anchoring widget reflows as the window
   * resizes) and re-layout to the new width.
   */
  setWidth(width2) {
    if (this._width === width2) {
      return;
    }
    this._width = width2;
    this._layout();
  }
  _layout() {
    const maxHeight = BLOCKED_LIST_MAX_VISIBLE_ROWS * this._list.getRowHeight();
    const height = Math.min(this._list.getContentHeight(), maxHeight);
    this._rowsContainer.style.width = `${this._width}px`;
    this._rowsContainer.style.height = `${height}px`;
    this._list.layout(height, this._width);
  }
};

BlockedSessionsList = __decorateClass([
  __decorateParam(2, IInstantiationService)
], BlockedSessionsList);
export { registerBlockedSessionsItemActions, IGNORE_INPUT_NEEDED_COMMAND_ID, IGNORE_CI_FAILURE_COMMAND_ID, BLOCKED_LIST_WIDTH, BLOCKED_LIST_MAX_VISIBLE_ROWS, BLOCKED_LIST_APPROVAL_ROW_MAX_LINES, BlockedSessionsList };
