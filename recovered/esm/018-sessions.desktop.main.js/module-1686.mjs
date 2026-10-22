// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/quickinput/browser/quickInputService.ts
import { QuickInputService } from "./module-1685.mjs";
import { InQuickPickContextKey } from "./module-1510.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/services/quickinput/browser/quickInputService.ts
var QuickInputService2 = class extends QuickInputService {
  constructor(configurationService, instantiationService, keybindingService, contextKeyService, themeService, layoutService) {
    super(instantiationService, contextKeyService, themeService, layoutService, configurationService);
    this.keybindingService = keybindingService;
    this.inQuickInputContext = InQuickPickContextKey.bindTo(this.contextKeyService);
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.onShow(() => this.inQuickInputContext.set(true)));
    this._register(this.onHide(() => this.inQuickInputContext.set(false)));
  }
  createController() {
    return super.createController(this.layoutService, {
      ignoreFocusOut: () => !this.configurationService.getValue("workbench.quickOpen.closeOnFocusLost"),
      backKeybindingLabel: () => this.keybindingService.lookupKeybinding("workbench.action.quickInputBack")?.getLabel() || void 0
    });
  }
};

QuickInputService2 = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, ILayoutService)
], QuickInputService2);

registerSingleton(IQuickInputService, QuickInputService2, 1 /* Delayed */);
export { QuickInputService2 };
