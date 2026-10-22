// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/agentHostShortcutsWidget.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/contrib/sessions/browser/agentHostShortcutsWidget.ts
var $112 = $;

var AgentHostShortcutsWidget = class extends Disposable {
  constructor(container2, options3, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._render(container2, options3);
  }
  _render(parent, options3) {
    append(parent, $112(".agent-host-toolbar-separator"));
    const container2 = append(parent, $112(".agent-host-toolbar"));
    const toolbarContainer = append(container2, $112(".agent-host-toolbar-content"));
    const toolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarContainer, Menus.SidebarAgentHost, {
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true },
      telemetrySource: "sidebarAgentHost"
    }));
    this._register(toolbar.onDidChangeMenuItems(() => {
      options3?.onDidChangeLayout?.();
    }));
  }
};

AgentHostShortcutsWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], AgentHostShortcutsWidget);
export { $112, AgentHostShortcutsWidget };
