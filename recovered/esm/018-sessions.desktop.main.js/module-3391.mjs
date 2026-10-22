// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibilityStatus.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IOpenerService } from "./module-0272.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibilityStatus.ts
var AccessibilityStatus = class extends Disposable {
  constructor(configurationService, notificationService, accessibilityService, statusbarService, openerService) {
    super();
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.accessibilityService = accessibilityService;
    this.statusbarService = statusbarService;
    this.openerService = openerService;
    this.screenReaderNotification = null;
    this.promptedScreenReader = false;
    this.screenReaderModeElement = this._register(new MutableDisposable());
    this._register(CommandsRegistry.registerCommand({ id: "showEditorScreenReaderNotification", handler: () => this.showScreenReaderNotification() }));
    this.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.accessibilityStatus";
  }
  registerListeners() {
    this._register(this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.onScreenReaderModeChange()));
    this._register(this.configurationService.onDidChangeConfiguration((c) => {
      if (c.affectsConfiguration("editor.accessibilitySupport")) {
        this.onScreenReaderModeChange();
      }
    }));
  }
  showScreenReaderNotification() {
    this.screenReaderNotification = this.notificationService.prompt(
      severity_default.Info,
      localize(7756, null, "editor.accessibilitySupport"),
      [
        {
          label: localize(7755, null),
          run: () => {
            this.configurationService.updateValue("editor.accessibilitySupport", "on", 2 /* USER */);
          }
        },
        {
          label: localize(7754, null),
          run: () => {
            this.configurationService.updateValue("editor.accessibilitySupport", "off", 2 /* USER */);
          }
        },
        {
          label: localize(7753, null),
          run: () => {
            this.openerService.open("https://code.visualstudio.com/docs/editor/accessibility#_screen-readers");
          }
        }
      ],
      {
        sticky: true,
        priority: 3 /* URGENT */
      }
    );
    Event2.once(this.screenReaderNotification.onDidClose)(() => this.screenReaderNotification = null);
  }
  updateScreenReaderModeElement(visible) {
    if (visible) {
      if (!this.screenReaderModeElement.value) {
        const text2 = localize(7752, null);
        this.screenReaderModeElement.value = this.statusbarService.addEntry({
          name: localize(7757, null),
          text: text2,
          ariaLabel: text2,
          command: "showEditorScreenReaderNotification",
          kind: "prominent",
          showInAllWindows: true
        }, "status.editor.screenReaderMode", 1 /* RIGHT */, 100.6);
      }
    } else {
      this.screenReaderModeElement.clear();
    }
  }
  onScreenReaderModeChange() {
    const screenReaderDetected = this.accessibilityService.isScreenReaderOptimized();
    if (screenReaderDetected) {
      const screenReaderConfiguration = this.configurationService.getValue("editor.accessibilitySupport");
      if (screenReaderConfiguration === "auto") {
        if (!this.promptedScreenReader) {
          this.promptedScreenReader = true;
          setTimeout(() => this.showScreenReaderNotification(), 100);
        }
      }
    }
    if (this.screenReaderNotification) {
      this.screenReaderNotification.close();
    }
    this.updateScreenReaderModeElement(this.accessibilityService.isScreenReaderOptimized());
  }
};

AccessibilityStatus = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IAccessibilityService),
  __decorateParam(3, IStatusbarService),
  __decorateParam(4, IOpenerService)
], AccessibilityStatus);
export { AccessibilityStatus };
