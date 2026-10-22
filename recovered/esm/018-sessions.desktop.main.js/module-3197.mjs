// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TerminalLink } from "./module-3196.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkDetectorAdapter.ts
var TerminalLinkDetectorAdapter = class extends Disposable {
  constructor(_detector, _instantiationService) {
    super();
    this._detector = _detector;
    this._instantiationService = _instantiationService;
    this._activeLinksStore = this._register(new DisposableStore());
    this._onDidActivateLink = this._register(new Emitter());
    this.onDidActivateLink = this._onDidActivateLink.event;
    this._onDidShowHover = this._register(new Emitter());
    this.onDidShowHover = this._onDidShowHover.event;
    this._activeProvideLinkRequests = /* @__PURE__ */ new Map();
  }
  async provideLinks(bufferLineNumber, callback) {
    let activeRequest = this._activeProvideLinkRequests.get(bufferLineNumber);
    if (activeRequest) {
      const links2 = await activeRequest;
      callback(links2);
      return;
    }
    this._activeLinksStore.clear();
    activeRequest = this._provideLinks(bufferLineNumber);
    this._activeProvideLinkRequests.set(bufferLineNumber, activeRequest);
    const links = await activeRequest;
    this._activeProvideLinkRequests.delete(bufferLineNumber);
    callback(links);
  }
  async _provideLinks(bufferLineNumber) {
    const links = [];
    let startLine = bufferLineNumber - 1;
    let endLine = startLine;
    const lines = [
      this._detector.xterm.buffer.active.getLine(startLine)
    ];
    const maxCharacterContext = Math.max(this._detector.maxLinkLength, this._detector.xterm.cols);
    const maxLineContext = Math.ceil(maxCharacterContext / this._detector.xterm.cols);
    const minStartLine = Math.max(startLine - maxLineContext, 0);
    const maxEndLine = Math.min(endLine + maxLineContext, this._detector.xterm.buffer.active.length);
    while (startLine >= minStartLine && this._detector.xterm.buffer.active.getLine(startLine)?.isWrapped) {
      lines.unshift(this._detector.xterm.buffer.active.getLine(startLine - 1));
      startLine--;
    }
    while (endLine < maxEndLine && this._detector.xterm.buffer.active.getLine(endLine + 1)?.isWrapped) {
      lines.push(this._detector.xterm.buffer.active.getLine(endLine + 1));
      endLine++;
    }
    const detectedLinks = await this._detector.detect(lines, startLine, endLine);
    if (this._store.isDisposed) {
      return [];
    }
    for (const link2 of detectedLinks) {
      const terminalLink = this._createTerminalLink(link2, async (event) => this._onDidActivateLink.fire({ link: link2, event }));
      links.push(terminalLink);
      this._activeLinksStore.add(terminalLink);
    }
    return links;
  }
  _createTerminalLink(l, activateCallback) {
    if (!l.disableTrimColon && l.text.length > 0 && l.text.charAt(l.text.length - 1) === ":") {
      l.text = l.text.slice(0, -1);
      l.bufferRange.end.x--;
    }
    return this._instantiationService.createInstance(
      TerminalLink,
      this._detector.xterm,
      l.bufferRange,
      l.text,
      l.uri,
      l.parsedLink,
      l.actions,
      this._detector.xterm.buffer.active.viewportY,
      activateCallback,
      (link2, viewportRange, modifierDownCallback, modifierUpCallback) => this._onDidShowHover.fire({
        link: link2,
        viewportRange,
        modifierDownCallback,
        modifierUpCallback
      }),
      l.type !== "Search" /* Search */,
      // Only search is low confidence
      l.label || this._getLabel(l.type),
      l.type
    );
  }
  _getLabel(type) {
    switch (type) {
      case "Search" /* Search */:
        return localize(20787, null);
      case "LocalFile" /* LocalFile */:
        return localize(20785, null);
      case "LocalFolderInWorkspace" /* LocalFolderInWorkspace */:
        return localize(20783, null);
      case "LocalFolderOutsideWorkspace" /* LocalFolderOutsideWorkspace */:
        return localize(20786, null);
      case "Url" /* Url */:
      default:
        return localize(20784, null);
    }
  }
};

TerminalLinkDetectorAdapter = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TerminalLinkDetectorAdapter);
export { TerminalLinkDetectorAdapter };
