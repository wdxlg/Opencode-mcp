// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/accessibility/electron-browser/accessibilityService.ts
import { AccessibilityService } from "./module-3940.mjs";
import { isLinux, isWindows } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IJSONEditingService } from "./module-1584.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/services/accessibility/electron-browser/accessibilityService.ts
var NativeAccessibilityService = class extends AccessibilityService {
  constructor(environmentService, contextKeyService, configurationService, _layoutService, _telemetryService, nativeHostService) {
    super(contextKeyService, _layoutService, configurationService);
    this._telemetryService = _telemetryService;
    this.nativeHostService = nativeHostService;
    this.didSendTelemetry = false;
    this.shouldAlwaysUnderlineAccessKeys = void 0;
    this.setAccessibilitySupport(environmentService.window.accessibilitySupport ? 2 /* Enabled */ : 1 /* Disabled */);
  }
  async alwaysUnderlineAccessKeys() {
    if (!isWindows) {
      return false;
    }
    if (typeof this.shouldAlwaysUnderlineAccessKeys !== "boolean") {
      const windowsKeyboardAccessibility = await this.nativeHostService.windowsGetStringRegKey("HKEY_CURRENT_USER", "Control Panel\\Accessibility\\Keyboard Preference", "On");
      this.shouldAlwaysUnderlineAccessKeys = windowsKeyboardAccessibility === "1";
    }
    return this.shouldAlwaysUnderlineAccessKeys;
  }
  setAccessibilitySupport(accessibilitySupport) {
    super.setAccessibilitySupport(accessibilitySupport);
    if (!this.didSendTelemetry && accessibilitySupport === 2 /* Enabled */) {
      this._telemetryService.publicLog2("accessibility", { enabled: true });
      this.didSendTelemetry = true;
    }
  }
};

NativeAccessibilityService = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, INativeHostService)
], NativeAccessibilityService);

registerSingleton(IAccessibilityService, NativeAccessibilityService, 1 /* Delayed */);

var LinuxAccessibilityContribution = class {
  static {
    this.ID = "workbench.contrib.linuxAccessibility";
  }
  constructor(jsonEditingService, accessibilityService, environmentService) {
    const forceRendererAccessibility = () => {
      if (accessibilityService.isScreenReaderOptimized()) {
        jsonEditingService.write(environmentService.argvResource, [{ path: ["force-renderer-accessibility"], value: true }], true);
      }
    };
    forceRendererAccessibility();
    accessibilityService.onDidChangeScreenReaderOptimized(forceRendererAccessibility);
  }
};

LinuxAccessibilityContribution = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, INativeWorkbenchEnvironmentService)
], LinuxAccessibilityContribution);

if (isLinux) {
  registerWorkbenchContribution2(LinuxAccessibilityContribution.ID, LinuxAccessibilityContribution, WorkbenchPhase.BlockRestore);
}
export { NativeAccessibilityService, LinuxAccessibilityContribution };
