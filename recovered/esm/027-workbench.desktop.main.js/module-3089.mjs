// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/views/emptyView.ts
import { ViewPane } from "./module-1335.mjs";
import { localize2 } from "./module-0001.mjs";
import { DragAndDropObserver, getWindow } from "./module-0075.mjs";
import { ResourcesDropHandler } from "./module-1381.mjs";
import { isWeb } from "./module-0014.mjs";
import { IWorkspaceContextService, isTemporaryWorkspace } from "./module-0509.mjs";
import { listDropOverBackground } from "./module-0232.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/files/browser/views/emptyView.ts
var EmptyView = class extends ViewPane {
  constructor(options3, themeService, viewDescriptorService, instantiationService, keybindingService, contextMenuService, contextService, configurationService, labelService, contextKeyService, openerService, hoverService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.contextService = contextService;
    this.labelService = labelService;
    this._disposed = false;
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.refreshTitle()));
    this._register(this.labelService.onDidChangeFormatters(() => this.refreshTitle()));
  }
  static {
    this.ID = "workbench.explorer.emptyView";
  }
  static {
    this.NAME = localize2(16000, "No Folder Opened");
  }
  shouldShowWelcome() {
    return true;
  }
  renderBody(container3) {
    super.renderBody(container3);
    this._register(new DragAndDropObserver(container3, {
      onDrop: (e) => {
        container3.style.backgroundColor = "";
        const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: !isWeb || isTemporaryWorkspace(this.contextService.getWorkspace()) });
        dropHandler.handleDrop(e, getWindow(container3));
      },
      onDragEnter: () => {
        const color2 = this.themeService.getColorTheme().getColor(listDropOverBackground);
        container3.style.backgroundColor = color2 ? color2.toString() : "";
      },
      onDragEnd: () => {
        container3.style.backgroundColor = "";
      },
      onDragLeave: () => {
        container3.style.backgroundColor = "";
      },
      onDragOver: (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
      }
    }));
    this.refreshTitle();
  }
  refreshTitle() {
    if (this._disposed) {
      return;
    }
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      this.updateTitle(EmptyView.NAME.value);
    } else {
      this.updateTitle(this.title);
    }
  }
  dispose() {
    this._disposed = true;
    super.dispose();
  }
};

EmptyView = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, IViewDescriptorService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IHoverService)
], EmptyView);
export { EmptyView };
