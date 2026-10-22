// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsMouseNavigation.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { EventType, addDisposableListener } from "./module-0075.mjs";
import { MOUSE_BACK_FORWARD_NAVIGATION_SETTING } from "./module-1493.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsMouseNavigation.ts
var SessionsMouseNavigationContribution = class extends Disposable {
  constructor(configurationService, layoutService, sessionsService) {
    super();
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.sessionsService = sessionsService;
    const mouseNavigationListeners = this._register(new DisposableStore());
    this._register(Event2.runAndSubscribe(this.layoutService.onDidAddContainer, ({ container: container2, disposables }) => {
      const eventDisposables = disposables.add(new DisposableStore());
      eventDisposables.add(addDisposableListener(container2, EventType.MOUSE_DOWN, (event) => this.handleMouseNavigation(event, true), true));
      eventDisposables.add(addDisposableListener(container2, EventType.MOUSE_UP, (event) => this.handleMouseNavigation(event, false), true));
      mouseNavigationListeners.add(eventDisposables);
    }, { container: this.layoutService.mainContainer, disposables: this._store }));
  }
  static {
    this.ID = "workbench.contrib.sessionsMouseNavigation";
  }
  handleMouseNavigation(event, isMouseDown) {
    if (!this.configurationService.getValue(MOUSE_BACK_FORWARD_NAVIGATION_SETTING) || this.layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)) {
      return;
    }
    if (event.button !== 3 && event.button !== 4) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!isMouseDown) {
      return;
    }
    if (event.button === 3) {
      void this.sessionsService.openPreviousSession();
    } else {
      void this.sessionsService.openNextSession();
    }
  }
};

SessionsMouseNavigationContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, ISessionsService)
], SessionsMouseNavigationContribution);
export { SessionsMouseNavigationContribution };
