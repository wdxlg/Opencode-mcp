// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/customViewTest/browser/customViewTest.contribution.ts
import { AbstractCustomView } from "./module-3722.mjs";
import { constObservable } from "./module-0061.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { $ } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Menus } from "./module-3437.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICustomViewService } from "./module-1776.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IsDevelopmentContext } from "./module-0635.mjs";
import { Codicon } from "./module-0085.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/sessions/contrib/customViewTest/browser/customViewTest.contribution.ts
var TEST_CUSTOM_VIEW_ID = "sessions.customView.test";

var TestCustomView = class _TestCustomView extends AbstractCustomView {
  constructor() {
    super(...arguments);
    this.title = constObservable(localize(4754, null));
    this.description = constObservable(
      localize(4752, null)
    );
  }
  static {
    this.ITEM_COUNT = 40;
  }
  render(container2) {
    for (let i2 = 0; i2 < _TestCustomView.ITEM_COUNT; i2++) {
      container2.appendChild($(".custom-view-test-item", void 0, localize(4753, null, i2 + 1)));
    }
  }
  layout(_width, _height) {
  }
};

var TestCustomViewContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.customViewTest";
  }
  constructor(customViewService) {
    super();
    this._register(customViewService.registerCustomView({
      id: TEST_CUSTOM_VIEW_ID,
      ctor: new SyncDescriptor(TestCustomView),
      actions: { style: "toolbar", menuId: Menus.CustomViewTest }
    }));
  }
};

TestCustomViewContribution = __decorateClass([
  __decorateParam(0, ICustomViewService)
], TestCustomViewContribution);

registerWorkbenchContribution2(TestCustomViewContribution.ID, TestCustomViewContribution, WorkbenchPhase.BlockRestore);

var ShowTestCustomViewAction = class extends Action2 {
  constructor() {
    super({
      id: "sessions.customView.showTestView",
      title: localize2(4751, "Show Test Custom View"),
      category: Categories.Developer,
      f1: true,
      precondition: IsDevelopmentContext
    });
  }
  run(accessor) {
    accessor.get(ICustomViewService).showCustomView(TEST_CUSTOM_VIEW_ID);
  }
};

var HideTestCustomViewAction = class extends Action2 {
  constructor() {
    super({
      id: "sessions.customView.hideTestView",
      title: localize2(4750, "Hide Test Custom View"),
      category: Categories.Developer,
      f1: true,
      precondition: IsDevelopmentContext
    });
  }
  run(accessor) {
    accessor.get(ICustomViewService).hideCustomView();
  }
};

var TestCustomViewPingAction = class extends Action2 {
  constructor() {
    super({
      id: "sessions.customView.testView.ping",
      title: localize2(4755, "Ping Test Custom View"),
      icon: Codicon.debugAlt,
      menu: [{ id: Menus.CustomViewTest, group: "navigation", order: 1 }]
    });
  }
  run(accessor) {
    accessor.get(INotificationService).info(localize(4756, null));
  }
};

registerAction2(ShowTestCustomViewAction);

registerAction2(HideTestCustomViewAction);

registerAction2(TestCustomViewPingAction);
export { TEST_CUSTOM_VIEW_ID, TestCustomView, TestCustomViewContribution, ShowTestCustomViewAction, HideTestCustomViewAction, TestCustomViewPingAction };
