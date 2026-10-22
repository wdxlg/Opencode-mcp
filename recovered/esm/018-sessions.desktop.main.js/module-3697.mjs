// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostPermissionPickerActionItem.ts
import { PermissionPickerActionItem } from "./module-2170.mjs";
import { AgentHostPermissionPickerDelegate } from "./module-3693.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostPermissionPickerActionItem.ts
var AgentHostPermissionPickerActionItem = class extends PermissionPickerActionItem {
  constructor(action, pickerOptions, session, instantiationService, actionWidgetService, keybindingService, contextKeyService, telemetryService, configurationService, dialogService, openerService, storageService, hoverService) {
    const delegate = instantiationService.createInstance(AgentHostPermissionPickerDelegate, session);
    super(
      action,
      delegate,
      pickerOptions,
      actionWidgetService,
      keybindingService,
      contextKeyService,
      telemetryService,
      configurationService,
      dialogService,
      openerService,
      storageService,
      hoverService
    );
    this._delegate = this._register(delegate);
    this._compact = pickerOptions.compact;
    this._register(autorun((reader) => {
      delegate.currentPermissionLevel.read(reader);
      this.refresh();
    }));
  }
  isCompact() {
    return this._compact.get();
  }
  setCompact(compact2) {
    this._compact.set(compact2, void 0);
  }
  render(container2) {
    super.render(container2);
    this._register(autorun((reader) => {
      const visible = this._delegate.isApplicable.read(reader);
      container2.style.display = visible ? "" : "none";
    }));
    this._register(autorun((reader) => {
      const isResolving = this._delegate.isResolving.read(reader);
      const element = this.element;
      if (!element) {
        return;
      }
      element.classList.toggle("sessions-chat-config-resolving", isResolving);
      this.setDropdownEnabled(!isResolving);
      if (isResolving) {
        element.setAttribute("aria-disabled", "true");
      } else {
        element.removeAttribute("aria-disabled");
      }
    }));
  }
  updateEnabled() {
    super.updateEnabled();
    this.setDropdownEnabled(!this._delegate.isResolving.get());
  }
};

AgentHostPermissionPickerActionItem = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IHoverService)
], AgentHostPermissionPickerActionItem);
export { AgentHostPermissionPickerActionItem };
