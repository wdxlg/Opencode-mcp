// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/scm/browser/scmViewPaneContainer.ts
import { ViewPaneContainer } from "./module-1382.mjs";
import { VIEWLET_ID4 } from "./module-1080.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/scm/browser/scmViewPaneContainer.ts
var SCMViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super(VIEWLET_ID4, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("scm-viewlet");
  }
  getOptimalWidth() {
    return 400;
  }
};

SCMViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, ILogService)
], SCMViewPaneContainer);
export { SCMViewPaneContainer };
