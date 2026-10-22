// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsPicker.ts
import { getChatSessionArchiveActionPresentation, getChatSessionArchiveActionWording } from "./module-2468.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { AgentSessionsSorter, groupAgentSessionsByDate, sessionDateFromNow } from "./module-2730.mjs";
import { isAgentHostAgentSessionItem, isLocalAgentSessionItem } from "./module-1462.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { AgentSessionsFilter } from "./module-2729.mjs";
import { openSession } from "./module-2640.mjs";
import { AGENT_SESSION_DELETE_ACTION_ID, AGENT_SESSION_RENAME_ACTION_ID } from "./module-0983.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsPicker.ts
function createAgentSessionArchiveButtons(configurationService) {
  const presentation2 = getChatSessionArchiveActionPresentation(getChatSessionArchiveActionWording(configurationService));
  return {
    archive: {
      iconClass: ThemeIcon.asClassName(presentation2.archive.icon),
      tooltip: presentation2.archive.title.value
    },
    unarchive: {
      iconClass: ThemeIcon.asClassName(presentation2.unarchive.icon),
      tooltip: presentation2.unarchive.title.value
    }
  };
}

var renameButton = {
  iconClass: ThemeIcon.asClassName(Codicon.edit),
  tooltip: localize(9152, null)
};

var deleteButton = {
  iconClass: ThemeIcon.asClassName(Codicon.trash),
  tooltip: localize(9151, null)
};

function getSessionDescription(session) {
  const descriptionText = typeof session.description === "string" ? session.description : session.description ? renderAsPlaintext(session.description) : void 0;
  const timeAgo = sessionDateFromNow(session.timing.created);
  const descriptionParts = [descriptionText, session.providerLabel, timeAgo].filter((part) => !!part);
  return descriptionParts.join(" \u2022 ");
}

function getSessionButtons(session, archiveButtons) {
  const buttons = [];
  if (isLocalAgentSessionItem(session)) {
    buttons.push(renameButton);
    buttons.push(deleteButton);
  } else if (isAgentHostAgentSessionItem(session)) {
    buttons.push(renameButton);
  }
  buttons.push(session.isArchived() ? archiveButtons.unarchive : archiveButtons.archive);
  return buttons;
}

function shouldShowSessionInPicker(session, filter2) {
  return !session.isArchived() && !filter2.exclude(session);
}

var AgentSessionsPicker = class {
  constructor(anchor, options3, agentSessionsService, quickInputService, instantiationService, commandService, configurationService) {
    this.anchor = anchor;
    this.options = options3;
    this.agentSessionsService = agentSessionsService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.sorter = new AgentSessionsSorter();
  }
  async pickAgentSession() {
    const disposables = new DisposableStore();
    const picker = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    const filter2 = disposables.add(this.instantiationService.createInstance(AgentSessionsFilter, {}));
    picker.anchor = this.anchor;
    picker.items = this.createPickerItems(filter2);
    picker.canAcceptInBackground = true;
    picker.placeholder = localize(9150, null);
    disposables.add(picker.onDidAccept((e4) => {
      const pick = picker.selectedItems[0];
      if (pick) {
        const openOptions = {
          sideBySide: e4.inBackground,
          editorOptions: {
            preserveFocus: e4.inBackground,
            pinned: e4.inBackground
          }
        };
        if (this.options?.overrideSessionOpen) {
          this.options.overrideSessionOpen(pick.session, openOptions);
        } else {
          this.instantiationService.invokeFunction(openSession, pick.session, openOptions);
        }
      }
      if (!e4.inBackground) {
        picker.hide();
      }
    }));
    disposables.add(picker.onDidTriggerItemButton(async (e4) => {
      const session = e4.item.session;
      let reopenResolved = false;
      if (e4.button === renameButton) {
        reopenResolved = true;
        await this.commandService.executeCommand(AGENT_SESSION_RENAME_ACTION_ID, session);
      } else if (e4.button === deleteButton) {
        reopenResolved = true;
        await this.commandService.executeCommand(AGENT_SESSION_DELETE_ACTION_ID, session);
      } else {
        const newArchivedState = !session.isArchived();
        session.setArchived(newArchivedState);
      }
      if (reopenResolved) {
        await this.agentSessionsService.model.resolve(session.providerType);
        this.pickAgentSession();
      } else {
        picker.items = this.createPickerItems(filter2);
      }
    }));
    disposables.add(picker.onDidHide(() => disposables.dispose()));
    picker.show();
  }
  createPickerItems(filter2) {
    const sessions = this.agentSessionsService.model.sessions.filter((session) => shouldShowSessionInPicker(session, filter2)).sort(this.sorter.compare.bind(this.sorter));
    const items = [];
    const groupedSessions = groupAgentSessionsByDate(sessions);
    for (const group2 of groupedSessions.values()) {
      if (group2.sessions.length > 0) {
        items.push({ type: "separator", label: group2.label });
        items.push(...group2.sessions.map((session) => this.toPickItem(session)));
      }
    }
    return items;
  }
  toPickItem(session) {
    const description = getSessionDescription(session);
    const buttons = getSessionButtons(session, createAgentSessionArchiveButtons(this.configurationService));
    return {
      id: session.resource.toString(),
      label: session.label,
      tooltip: session.tooltip,
      description,
      iconClass: ThemeIcon.asClassName(session.icon),
      buttons,
      session
    };
  }
};

AgentSessionsPicker = __decorateClass([
  __decorateParam(2, IAgentSessionsService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IConfigurationService)
], AgentSessionsPicker);
export { createAgentSessionArchiveButtons, getSessionDescription, getSessionButtons, shouldShowSessionInPicker, renameButton, deleteButton, AgentSessionsPicker };
