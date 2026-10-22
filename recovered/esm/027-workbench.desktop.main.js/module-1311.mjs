// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWebviewManager.ts
import { Disposable } from "./module-0012.mjs";
import { MainThreadWebviews } from "./module-1040.mjs";
import { MainContext } from "./module-0921.mjs";
import { MainThreadWebviewPanels } from "./module-1306.mjs";
import { MainThreadCustomEditors } from "./module-1305.mjs";
import { MainThreadWebviewsViews } from "./module-1308.mjs";
import { MainThreadChatOutputRenderer } from "./module-1310.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0919.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/api/browser/mainThreadWebviewManager.ts
var MainThreadWebviewManager = class extends Disposable {
  constructor(context2, instantiationService) {
    super();
    const webviews = this._register(instantiationService.createInstance(MainThreadWebviews, context2));
    context2.set(MainContext.MainThreadWebviews, webviews);
    const webviewPanels = this._register(instantiationService.createInstance(MainThreadWebviewPanels, context2, webviews));
    context2.set(MainContext.MainThreadWebviewPanels, webviewPanels);
    const customEditors = this._register(instantiationService.createInstance(MainThreadCustomEditors, context2, webviews, webviewPanels));
    context2.set(MainContext.MainThreadCustomEditors, customEditors);
    const webviewViews = this._register(instantiationService.createInstance(MainThreadWebviewsViews, context2, webviews));
    context2.set(MainContext.MainThreadWebviewViews, webviewViews);
    const chatOutputRenderers = this._register(instantiationService.createInstance(MainThreadChatOutputRenderer, context2, webviews));
    context2.set(MainContext.MainThreadChatOutputRenderer, chatOutputRenderers);
  }
};

MainThreadWebviewManager = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService)
], MainThreadWebviewManager);
export { MainThreadWebviewManager };
