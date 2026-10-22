// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/chat/common/sessionArchiveActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/platform/chat/common/sessionArchiveActions.ts
var ChatSessionArchiveActionWordingSettingId = "chat.experimental.sessionArchiveActionWording";

var archiveActionPresentation = {
  archive: {
    title: localize2(2775, "Archive"),
    icon: Codicon.archive
  },
  archiveAll: {
    title: localize2(2776, "Archive All"),
    icon: Codicon.archive
  },
  unarchive: {
    title: localize2(2783, "Unarchive"),
    icon: Codicon.unarchive
  },
  unarchiveAll: {
    title: localize2(2784, "Unarchive All"),
    icon: Codicon.unarchive
  }
};

var markAsDoneActionPresentation = {
  archive: {
    title: localize2(2778, "Mark as Done"),
    icon: Codicon.check
  },
  archiveAll: {
    title: localize2(2777, "Mark All as Done"),
    icon: Codicon.checkAll
  },
  unarchive: {
    title: localize2(2779, "Restore"),
    icon: Codicon.redo
  },
  unarchiveAll: {
    title: localize2(2780, "Restore All"),
    icon: Codicon.redo
  }
};

function getChatSessionArchiveActionWording(configurationService) {
  return configurationService.getValue(ChatSessionArchiveActionWordingSettingId) === "done" /* MarkAsDone */ ? "done" /* MarkAsDone */ : "archive" /* Archive */;
}

function getChatSessionArchiveActionPresentation(wording) {
  return wording === "done" /* MarkAsDone */ ? markAsDoneActionPresentation : archiveActionPresentation;
}

function getChatSessionArchivedSectionLabel(wording) {
  return wording === "done" /* MarkAsDone */ ? localize(2782, null) : localize(2781, null);
}
export { getChatSessionArchiveActionWording, getChatSessionArchiveActionPresentation, getChatSessionArchivedSectionLabel, ChatSessionArchiveActionWordingSettingId, archiveActionPresentation, markAsDoneActionPresentation };
