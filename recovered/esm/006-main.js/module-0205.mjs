// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/menubar/electron-main/menubarMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { IInstantiationService, createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { Menubar, init_menubar2 } from "./module-0204.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/menubar/electron-main/menubarMainService.ts
var IMenubarMainService, MenubarMainService;

var init_menubarMainService = __esm({
  "src/vs/platform/menubar/electron-main/menubarMainService.ts"() {
    init_instantiation();
    init_lifecycleMainService();
    init_log();
    init_menubar2();
    init_lifecycle();
    IMenubarMainService = createDecorator("menubarMainService");
    MenubarMainService = class extends Disposable {
      constructor(instantiationService, lifecycleMainService, logService) {
        super();
        this.instantiationService = instantiationService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.menubar = this.installMenuBarAfterWindowOpen();
      }
      async installMenuBarAfterWindowOpen() {
        await this.lifecycleMainService.when(3 /* AfterWindowOpen */);
        return this._register(this.instantiationService.createInstance(Menubar));
      }
      async updateMenubar(windowId, menus) {
        this.logService.trace("menubarService#updateMenubar", windowId);
        const menubar = await this.menubar;
        menubar.updateMenu(menus, windowId);
      }
    };
    MenubarMainService = __decorateClass([
      __decorateParam(0, IInstantiationService),
      __decorateParam(1, ILifecycleMainService),
      __decorateParam(2, ILogService)
    ], MenubarMainService);
  }
});
export { IMenubarMainService, MenubarMainService, init_menubarMainService };
