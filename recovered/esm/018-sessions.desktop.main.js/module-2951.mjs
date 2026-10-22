// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/files/browser/filesView.ts
import { $, append } from "./module-0075.mjs";
import { ExplorerView } from "./module-2125.mjs";
import { agentsPanelBackground } from "./module-1496.mjs";
import { SyncChangesActionViewItem } from "./module-2950.mjs";
import { ViewPane } from "./module-1334.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/sessions/contrib/files/browser/filesView.ts
var $102 = $;

var SESSIONS_FILES_VIEW_ID = "sessions.files.explorer";

var SESSIONS_FILES_EMPTY_VIEW_ID = "sessions.files.explorer.empty";

var SessionsExplorerView = class extends ExplorerView {
  get primaryActionGroups() {
    return ["1_files"];
  }
  getLocationBasedColors() {
    const colors = super.getLocationBasedColors();
    return {
      ...colors,
      background: agentsPanelBackground,
      listOverrideStyles: {
        ...colors.listOverrideStyles,
        listBackground: agentsPanelBackground
      }
    };
  }
  createActionViewItem(action, options3) {
    if (action.id === "sessions.files.action.syncChanges") {
      return this.instantiationService.createInstance(SyncChangesActionViewItem, action, options3);
    }
    return super.createActionViewItem(action, options3);
  }
};

var SessionsExplorerEmptyView = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
  }
  renderBody(container2) {
    super.renderBody(container2);
    const bodyContainer = append(container2, $102(".files-empty-view-body"));
    const welcomeContainer = append(bodyContainer, $102(".files-empty-welcome"));
    const welcomeMessage = append(welcomeContainer, $102(".files-empty-welcome-message"));
    welcomeMessage.textContent = localize(4784, null);
  }
};

SessionsExplorerEmptyView = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService)
], SessionsExplorerEmptyView);
export { $102, SESSIONS_FILES_VIEW_ID, SESSIONS_FILES_EMPTY_VIEW_ID, SessionsExplorerView, SessionsExplorerEmptyView };
