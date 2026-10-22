// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager.ts
import { DisposableStore, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { TERMINAL_CONFIG_SECTION } from "./module-1174.mjs";
import { TerminalMultiLineLinkDetector } from "./module-3204.mjs";
import { TerminalLocalLinkDetector } from "./module-3199.mjs";
import { TerminalUriLinkDetector } from "./module-3201.mjs";
import { TerminalWordLinkDetector } from "./module-3202.mjs";
import { TerminalLocalFileLinkOpener, TerminalLocalFolderInWorkspaceLinkOpener, TerminalLocalFolderOutsideWorkspaceLinkOpener, TerminalSearchLinkOpener, TerminalUrlLinkOpener } from "./module-3200.mjs";
import { OS, isMacintosh } from "./module-0014.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { convertBufferRangeToViewport } from "./module-3194.mjs";
import { TerminalLinkDetectorAdapter } from "./module-3197.mjs";
import { ITerminalConfigurationService, TerminalLinkQuickPickEvent } from "./module-1150.mjs";
import { isString } from "./module-0010.mjs";
import { EventType } from "./module-0075.mjs";
import { TerminalHover } from "./module-3203.mjs";
import { TerminalExternalLinkDetector } from "./module-3195.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { ITunnelService } from "./module-1408.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkManager.ts
var TerminalLinkManager = class extends DisposableStore {
  constructor(_xterm, _processInfo, capabilities, _linkResolver, _configurationService, _instantiationService, notificationService, _telemetryService, terminalConfigurationService, _logService, _tunnelService) {
    super();
    this._xterm = _xterm;
    this._processInfo = _processInfo;
    this._linkResolver = _linkResolver;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._tunnelService = _tunnelService;
    this._standardLinkProviders = /* @__PURE__ */ new Map();
    this._linkProvidersDisposables = [];
    this._externalLinkProviders = [];
    this._openers = /* @__PURE__ */ new Map();
    this._linkHoverInvalidationDisposable = this.add(new MutableDisposable());
    let enableFileLinks = true;
    const enableFileLinksConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).enableFileLinks;
    switch (enableFileLinksConfig) {
      case "off":
      case false:
        enableFileLinks = false;
        break;
      case "notRemote":
        enableFileLinks = !this._processInfo.remoteAuthority;
        break;
    }
    if (enableFileLinks) {
      this._setupLinkDetector(TerminalMultiLineLinkDetector.id, this._instantiationService.createInstance(TerminalMultiLineLinkDetector, this._xterm, this._processInfo, this._linkResolver));
      this._setupLinkDetector(TerminalLocalLinkDetector.id, this._instantiationService.createInstance(TerminalLocalLinkDetector, this._xterm, capabilities, this._processInfo, this._linkResolver));
    }
    this._setupLinkDetector(TerminalUriLinkDetector.id, this._instantiationService.createInstance(TerminalUriLinkDetector, this._xterm, this._processInfo, this._linkResolver));
    this._setupLinkDetector(TerminalWordLinkDetector.id, this.add(this._instantiationService.createInstance(TerminalWordLinkDetector, this._xterm)));
    const localFileOpener = this._instantiationService.createInstance(TerminalLocalFileLinkOpener);
    const localFolderInWorkspaceOpener = this._instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
    const localFolderOutsideWorkspaceOpener = this._instantiationService.createInstance(TerminalLocalFolderOutsideWorkspaceLinkOpener);
    this._openers.set("LocalFile" /* LocalFile */, localFileOpener);
    this._openers.set("LocalFolderInWorkspace" /* LocalFolderInWorkspace */, localFolderInWorkspaceOpener);
    this._openers.set("LocalFolderOutsideWorkspace" /* LocalFolderOutsideWorkspace */, localFolderOutsideWorkspaceOpener);
    this._openers.set("Search" /* Search */, this._instantiationService.createInstance(TerminalSearchLinkOpener, capabilities, this._processInfo.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this._processInfo.os || OS));
    this._openers.set("Url" /* Url */, this._instantiationService.createInstance(TerminalUrlLinkOpener, !!this._processInfo.remoteAuthority, localFileOpener, localFolderInWorkspaceOpener, localFolderOutsideWorkspaceOpener));
    this._registerStandardLinkProviders();
    let activeHoverDisposable;
    let activeTooltipScheduler;
    let activeHoverListeners;
    const clearActiveLinkHover = () => {
      activeHoverDisposable?.dispose();
      activeHoverDisposable = void 0;
      activeTooltipScheduler?.dispose();
      activeTooltipScheduler = void 0;
      activeHoverListeners?.dispose();
      activeHoverListeners = void 0;
    };
    this.add(toDisposable(() => {
      this._clearLinkProviders();
      dispose(this._externalLinkProviders);
      clearActiveLinkHover();
    }));
    this._xterm.options.linkHandler = {
      allowNonHttpProtocols: true,
      activate: async (event, text2) => {
        if (!this._isLinkActivationModifierDown(event)) {
          return;
        }
        const colonIndex = text2.indexOf(":");
        if (colonIndex === -1) {
          throw new Error(`Could not find scheme in link "${text2}"`);
        }
        const scheme = text2.substring(0, colonIndex);
        if (terminalConfigurationService.config.allowedLinkSchemes.indexOf(scheme) === -1) {
          const userAllowed = await new Promise((resolve3) => {
            notificationService.prompt(Severity2.Warning, localize(20792, null, scheme), [
              {
                label: localize(20788, null, scheme),
                run: () => {
                  const allowedLinkSchemes = [
                    ...terminalConfigurationService.config.allowedLinkSchemes,
                    scheme
                  ];
                  this._configurationService.updateValue(`terminal.integrated.allowedLinkSchemes`, allowedLinkSchemes);
                  resolve3(true);
                }
              }
            ], {
              onCancel: () => resolve3(false)
            });
          });
          if (!userAllowed) {
            return;
          }
        }
        this._openers.get("Url" /* Url */)?.open({
          type: "Url" /* Url */,
          text: text2,
          bufferRange: null,
          uri: URI.parse(text2)
        });
      },
      hover: (e4, text2, range2) => {
        clearActiveLinkHover();
        activeTooltipScheduler = new RunOnceScheduler(() => {
          const core2 = this._xterm._core;
          const cellDimensions = {
            width: core2._renderService.dimensions.css.cell.width,
            height: core2._renderService.dimensions.css.cell.height
          };
          const terminalDimensions = {
            width: this._xterm.cols,
            height: this._xterm.rows
          };
          const hoverViewportY = this._xterm.buffer.active.viewportY;
          activeHoverDisposable = this._showHover({
            viewportRange: convertBufferRangeToViewport(range2, hoverViewportY),
            cellDimensions,
            terminalDimensions
          }, this._getLinkHoverString(text2, text2), void 0, (text3) => this._xterm.options.linkHandler?.activate(e4, text3, range2));
          activeHoverListeners = new DisposableStore();
          activeHoverListeners.add(this._xterm.onScroll(() => clearActiveLinkHover()));
          activeHoverListeners.add(this._xterm.onRender((renderedRange) => {
            const viewportRange = convertBufferRangeToViewport(range2, hoverViewportY);
            if (viewportRange.start.y <= renderedRange.end && viewportRange.end.y >= renderedRange.start) {
              clearActiveLinkHover();
            }
          }));
          activeTooltipScheduler?.dispose();
          activeTooltipScheduler = void 0;
        }, this._configurationService.getValue("workbench.hover.delay"));
        activeTooltipScheduler.schedule();
      },
      leave: () => {
        clearActiveLinkHover();
      }
    };
  }
  _setupLinkDetector(id2, detector, isExternal = false) {
    const detectorAdapter = this.add(this._instantiationService.createInstance(TerminalLinkDetectorAdapter, detector));
    this.add(detectorAdapter.onDidActivateLink((e4) => {
      e4.event?.preventDefault();
      if (e4.event && !(e4.event instanceof TerminalLinkQuickPickEvent) && !this._isLinkActivationModifierDown(e4.event)) {
        return;
      }
      if (e4.link.activate) {
        e4.link.activate(e4.link.text);
      } else {
        this._openLink(e4.link);
      }
    }));
    this.add(detectorAdapter.onDidShowHover((e4) => this._tooltipCallback(e4.link, e4.viewportRange, e4.modifierDownCallback, e4.modifierUpCallback)));
    if (!isExternal) {
      this._standardLinkProviders.set(id2, detectorAdapter);
    }
    return detectorAdapter;
  }
  async _openLink(link2) {
    this._logService.debug("Opening link", link2);
    const opener = this._openers.get(link2.type);
    if (!opener) {
      throw new Error(`No matching opener for link type "${link2.type}"`);
    }
    this._telemetryService.publicLog2("terminal/openLink", { linkType: isString(link2.type) ? link2.type : `extension:${link2.type.id}` });
    await opener.open(link2);
  }
  async openRecentLink(type) {
    let links;
    let i2 = this._xterm.buffer.active.length;
    while ((!links || links.length === 0) && i2 >= this._xterm.buffer.active.viewportY) {
      links = await this._getLinksForType(i2, type);
      i2--;
    }
    if (!links || links.length < 1) {
      return void 0;
    }
    const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
    links[0].activate(event, links[0].text);
    return links[0];
  }
  async getLinks() {
    const viewportLinksByLinePromises = [];
    for (let i2 = this._xterm.buffer.active.viewportY + this._xterm.rows - 1; i2 >= this._xterm.buffer.active.viewportY; i2--) {
      viewportLinksByLinePromises.push(this._getLinksForLine(i2));
    }
    const viewportLinksByLine = await Promise.all(viewportLinksByLinePromises);
    const viewportLinks = {
      wordLinks: [],
      webLinks: [],
      fileLinks: [],
      folderLinks: []
    };
    for (const links of viewportLinksByLine) {
      if (links) {
        const { wordLinks, webLinks, fileLinks, folderLinks } = links;
        if (wordLinks?.length) {
          viewportLinks.wordLinks.push(...wordLinks.reverse());
        }
        if (webLinks?.length) {
          viewportLinks.webLinks.push(...webLinks.reverse());
        }
        if (fileLinks?.length) {
          viewportLinks.fileLinks.push(...fileLinks.reverse());
        }
        if (folderLinks?.length) {
          viewportLinks.folderLinks.push(...folderLinks.reverse());
        }
      }
    }
    const aboveViewportLinksPromises = [];
    for (let i2 = this._xterm.buffer.active.viewportY - 1; i2 >= 0; i2--) {
      aboveViewportLinksPromises.push(this._getLinksForLine(i2));
    }
    const belowViewportLinksPromises = [];
    for (let i2 = this._xterm.buffer.active.length - 1; i2 >= this._xterm.buffer.active.viewportY + this._xterm.rows; i2--) {
      belowViewportLinksPromises.push(this._getLinksForLine(i2));
    }
    const allLinks = Promise.all(aboveViewportLinksPromises).then(async (aboveViewportLinks) => {
      const belowViewportLinks = await Promise.all(belowViewportLinksPromises);
      const allResults = {
        wordLinks: [...viewportLinks.wordLinks],
        webLinks: [...viewportLinks.webLinks],
        fileLinks: [...viewportLinks.fileLinks],
        folderLinks: [...viewportLinks.folderLinks]
      };
      for (const links of [...belowViewportLinks, ...aboveViewportLinks]) {
        if (links) {
          const { wordLinks, webLinks, fileLinks, folderLinks } = links;
          if (wordLinks?.length) {
            allResults.wordLinks.push(...wordLinks.reverse());
          }
          if (webLinks?.length) {
            allResults.webLinks.push(...webLinks.reverse());
          }
          if (fileLinks?.length) {
            allResults.fileLinks.push(...fileLinks.reverse());
          }
          if (folderLinks?.length) {
            allResults.folderLinks.push(...folderLinks.reverse());
          }
        }
      }
      return allResults;
    });
    return {
      viewport: viewportLinks,
      all: allLinks
    };
  }
  async _getLinksForLine(y) {
    const unfilteredWordLinks = await this._getLinksForType(y, "word");
    const webLinks = await this._getLinksForType(y, "url");
    const fileLinks = await this._getLinksForType(y, "localFile");
    const folderLinks = await this._getLinksForType(y, "localFolder");
    const words = /* @__PURE__ */ new Set();
    let wordLinks;
    if (unfilteredWordLinks) {
      wordLinks = [];
      for (const link2 of unfilteredWordLinks) {
        if (!words.has(link2.text) && link2.text.length > 1) {
          wordLinks.push(link2);
          words.add(link2.text);
        }
      }
    }
    return { wordLinks, webLinks, fileLinks, folderLinks };
  }
  async _getLinksForType(y, type) {
    switch (type) {
      case "word":
        return await new Promise((r2) => this._standardLinkProviders.get(TerminalWordLinkDetector.id)?.provideLinks(y, r2));
      case "url":
        return await new Promise((r2) => this._standardLinkProviders.get(TerminalUriLinkDetector.id)?.provideLinks(y, r2));
      case "localFile": {
        const links = await new Promise((r2) => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r2));
        return links?.filter((link2) => link2.type === "LocalFile" /* LocalFile */);
      }
      case "localFolder": {
        const links = await new Promise((r2) => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r2));
        return links?.filter((link2) => link2.type === "LocalFolderInWorkspace" /* LocalFolderInWorkspace */);
      }
    }
  }
  _tooltipCallback(link2, viewportRange, modifierDownCallback, modifierUpCallback) {
    if (!this._widgetManager) {
      return;
    }
    const core2 = this._xterm._core;
    const cellDimensions = {
      width: core2._renderService.dimensions.css.cell.width,
      height: core2._renderService.dimensions.css.cell.height
    };
    const terminalDimensions = {
      width: this._xterm.cols,
      height: this._xterm.rows
    };
    this._showHover({
      viewportRange,
      cellDimensions,
      terminalDimensions,
      modifierDownCallback,
      modifierUpCallback
    }, this._getLinkHoverString(link2.text, link2.label), link2.actions, (text2) => link2.activate(void 0, text2), link2);
  }
  _showHover(targetOptions, text2, actions, linkHandler, link2) {
    if (this._widgetManager) {
      const widget = this._instantiationService.createInstance(TerminalHover, targetOptions, text2, actions, linkHandler);
      const attached = this._widgetManager.attachWidget(widget);
      if (attached) {
        const store = new DisposableStore();
        store.add(attached);
        if (link2) {
          store.add(link2.onInvalidated(() => store.dispose()));
        }
        this._linkHoverInvalidationDisposable.value = store;
        return store;
      }
    }
    return void 0;
  }
  setWidgetManager(widgetManager) {
    this._widgetManager = widgetManager;
  }
  _clearLinkProviders() {
    dispose(this._linkProvidersDisposables);
    this._linkProvidersDisposables.length = 0;
  }
  _registerStandardLinkProviders() {
    const proxyLinkProvider = async (bufferLineNumber) => {
      return this.externalProvideLinksCb?.(bufferLineNumber);
    };
    const detectorId = `extension-${this._externalLinkProviders.length}`;
    const wrappedLinkProvider = this._setupLinkDetector(detectorId, new TerminalExternalLinkDetector(detectorId, this._xterm, proxyLinkProvider), true);
    this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(wrappedLinkProvider));
    for (const p of this._standardLinkProviders.values()) {
      this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(p));
    }
  }
  _isLinkActivationModifierDown(event) {
    const editorConf = this._configurationService.getValue("editor");
    if (editorConf.multiCursorModifier === "ctrlCmd") {
      return !!event.altKey;
    }
    return isMacintosh ? event.metaKey : event.ctrlKey;
  }
  _getLinkHoverString(uri4, label3) {
    const editorConf = this._configurationService.getValue("editor");
    let clickLabel = "";
    if (editorConf.multiCursorModifier === "ctrlCmd") {
      if (isMacintosh) {
        clickLabel = localize(20794, null);
      } else {
        clickLabel = localize(20793, null);
      }
    } else {
      if (isMacintosh) {
        clickLabel = localize(20795, null);
      } else {
        clickLabel = localize(20796, null);
      }
    }
    let fallbackLabel = localize(20790, null);
    try {
      if (this._tunnelService.canTunnel(URI.parse(uri4))) {
        fallbackLabel = localize(20789, null);
      }
    } catch {
    }
    const markdown = new MarkdownString("", true);
    if (label3) {
      label3 = markdown.appendText(label3).value;
      markdown.value = "";
    }
    if (uri4) {
      uri4 = markdown.appendText(uri4).value;
      markdown.value = "";
    }
    label3 = label3 || fallbackLabel;
    uri4 = uri4 || label3;
    if (/(\s|&nbsp;)/.test(uri4)) {
      uri4 = localize(20791, null);
    }
    return markdown.appendLink(uri4, label3).appendMarkdown(` (${clickLabel})`);
  }
};

TerminalLinkManager = __decorateClass([
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, INotificationService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, ITerminalConfigurationService),
  __decorateParam(9, ITerminalLogService),
  __decorateParam(10, ITunnelService)
], TerminalLinkManager);
export { TerminalLinkManager };
