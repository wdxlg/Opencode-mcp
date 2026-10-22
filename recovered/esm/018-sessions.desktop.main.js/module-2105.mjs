// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostFolderPickerTip.ts
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostFolderPickerTip.ts
var FOLDER_PICKER_TIP_DISMISSED_STORAGE_KEY = "chat.agentHost.folderPickerTipDismissed1";

var FOLDER_PICKER_TIP_LEARN_MORE_URL = "https://aka.ms/vscodeMultirootWorkspaceChatFolderPicker";

var FOLDER_PICKER_TIP_CLASS = "agent-host-folder-picker-tip";

function createFolderPickerTip(storageService) {
  const headerText = localize(8970, null);
  const headerLink = {
    label: localize(8969, null),
    uri: URI.parse(FOLDER_PICKER_TIP_LEARN_MORE_URL)
  };
  const isDismissed = () => {
    try {
      return storageService.getBoolean(FOLDER_PICKER_TIP_DISMISSED_STORAGE_KEY, -1 /* APPLICATION */, false);
    } catch (error) {
      onUnexpectedError(error);
      return false;
    }
  };
  const dismiss = () => {
    try {
      storageService.store(FOLDER_PICKER_TIP_DISMISSED_STORAGE_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
    } catch (error) {
      onUnexpectedError(error);
    }
  };
  return {
    getListOptions: () => {
      if (isDismissed()) {
        return { widgetClassName: FOLDER_PICKER_TIP_CLASS };
      }
      return {
        widgetClassName: FOLDER_PICKER_TIP_CLASS,
        headerText,
        headerIcon: Codicon.info,
        headerLink,
        headerDismiss: dismiss
      };
    }
  };
}
export { createFolderPickerTip, FOLDER_PICKER_TIP_DISMISSED_STORAGE_KEY, FOLDER_PICKER_TIP_LEARN_MORE_URL, FOLDER_PICKER_TIP_CLASS };
