// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkContribution.ts
import { DisposableStore } from "./module-0012.mjs";
import { TerminalLinkResolver } from "./module-3207.mjs";
import { TerminalLinkManager } from "./module-3205.mjs";
import { isTerminalProcessManager } from "./module-1174.mjs";
import { Event2 } from "./module-0017.mjs";
import { isDetachedTerminalInstance } from "./module-1150.mjs";
import { TerminalLinkQuickpick } from "./module-3206.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITerminalLinkProviderService } from "./module-1273.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkContribution.ts
var TerminalLinkContribution = class extends DisposableStore {
  constructor(_ctx, _instantiationService, _terminalLinkProviderService) {
    super();
    this._ctx = _ctx;
    this._instantiationService = _instantiationService;
    this._terminalLinkProviderService = _terminalLinkProviderService;
    this._linkResolver = this._instantiationService.createInstance(TerminalLinkResolver);
  }
  static {
    this.ID = "terminal.link";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalLinkContribution.ID);
  }
  xtermReady(xterm) {
    const linkManager = this._linkManager = this.add(this._instantiationService.createInstance(TerminalLinkManager, xterm.raw, this._ctx.processManager, this._ctx.instance.capabilities, this._linkResolver));
    if (isTerminalProcessManager(this._ctx.processManager)) {
      const disposable = linkManager.add(Event2.once(this._ctx.processManager.onProcessReady)(() => {
        linkManager.setWidgetManager(this._ctx.widgetManager);
        this.delete(disposable);
      }));
    } else {
      linkManager.setWidgetManager(this._ctx.widgetManager);
    }
    const instance2 = this._ctx.instance;
    if (!isDetachedTerminalInstance(instance2)) {
      for (const linkProvider of this._terminalLinkProviderService.linkProviders) {
        linkManager.externalProvideLinksCb = linkProvider.provideLinks.bind(linkProvider, instance2);
      }
      linkManager.add(this._terminalLinkProviderService.onDidAddLinkProvider((e4) => {
        linkManager.externalProvideLinksCb = e4.provideLinks.bind(e4, instance2);
      }));
      linkManager.add(this._terminalLinkProviderService.onDidRemoveLinkProvider(() => linkManager.externalProvideLinksCb = void 0));
    }
  }
  async showLinkQuickpick(extended) {
    if (!this._terminalLinkQuickpick) {
      this._terminalLinkQuickpick = this.add(this._instantiationService.createInstance(TerminalLinkQuickpick));
      this.add(this._terminalLinkQuickpick.onDidRequestMoreLinks(() => {
        this.showLinkQuickpick(true);
      }));
    }
    const links = await this._getLinks();
    return await this._terminalLinkQuickpick.show(this._ctx.instance, links);
  }
  async _getLinks() {
    if (!this._linkManager) {
      throw new Error("terminal links are not ready, cannot generate link quick pick");
    }
    return this._linkManager.getLinks();
  }
  async openRecentLink(type) {
    if (!this._linkManager) {
      throw new Error("terminal links are not ready, cannot open a link");
    }
    this._linkManager.openRecentLink(type);
  }
};

TerminalLinkContribution = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITerminalLinkProviderService)
], TerminalLinkContribution);
export { TerminalLinkContribution };
