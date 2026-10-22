// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector.ts
import { LinkComputer } from "./module-0167.mjs";
import { convertLinkRangeToBuffer, getXtermLineContent3 } from "./module-3403.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { getTerminalLinkType } from "./module-3408.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalLogService } from "./module-1154.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalUriLinkDetector.ts
var TerminalUriLinkDetector = class {
  constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._processManager = _processManager;
    this._linkResolver = _linkResolver;
    this._logService = _logService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    // 2048 is the maximum URL length
    this.maxLinkLength = 2048;
  }
  static {
    this.id = "uri";
  }
  async detect(lines, startLine, endLine) {
    const links = [];
    const linkComputerTarget = new TerminalLinkAdapter(this.xterm, startLine, endLine);
    const computedLinks = LinkComputer.computeLinks(linkComputerTarget);
    let resolvedLinkCount = 0;
    this._logService.trace("terminalUriLinkDetector#detect computedLinks", computedLinks);
    for (const computedLink of computedLinks) {
      const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, computedLink.range, startLine);
      const uri5 = computedLink.url ? isString(computedLink.url) ? URI.parse(this._excludeLineAndColSuffix(computedLink.url)) : computedLink.url : void 0;
      if (!uri5) {
        continue;
      }
      const text2 = computedLink.url?.toString() || "";
      if (text2.length > this.maxLinkLength) {
        continue;
      }
      if (uri5.scheme !== Schemas.file) {
        links.push({
          text: text2,
          uri: uri5,
          bufferRange,
          type: "Url" /* Url */
        });
        continue;
      }
      if (uri5.authority.length !== 2 && uri5.authority.endsWith(":")) {
        continue;
      }
      const uriCandidates = [uri5];
      if (uri5.authority.length > 0) {
        uriCandidates.push(URI.from({ ...uri5, authority: void 0 }));
      }
      this._logService.trace("terminalUriLinkDetector#detect uriCandidates", uriCandidates);
      for (const uriCandidate of uriCandidates) {
        const linkStat = await this._linkResolver.resolveLink(this._processManager, text2, uriCandidate);
        if (linkStat) {
          const type = getTerminalLinkType(uriCandidate, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
          const simpleLink = {
            // Use computedLink.url if it's a string to retain the line/col suffix
            text: isString(computedLink.url) ? computedLink.url : linkStat.link,
            uri: uriCandidate,
            bufferRange,
            type
          };
          this._logService.trace("terminalUriLinkDetector#detect verified link", simpleLink);
          links.push(simpleLink);
          resolvedLinkCount++;
          break;
        }
      }
      if (++resolvedLinkCount >= 10 /* MaxResolvedLinksInLine */) {
        break;
      }
    }
    return links;
  }
  _excludeLineAndColSuffix(path) {
    return path.replace(/:\d+(:\d+)?$/, "");
  }
};

TerminalUriLinkDetector = __decorateClass([
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IWorkspaceContextService)
], TerminalUriLinkDetector);

var TerminalLinkAdapter = class {
  constructor(_xterm, _lineStart, _lineEnd) {
    this._xterm = _xterm;
    this._lineStart = _lineStart;
    this._lineEnd = _lineEnd;
  }
  getLineCount() {
    return 1;
  }
  getLineContent() {
    return getXtermLineContent3(this._xterm.buffer.active, this._lineStart, this._lineEnd, this._xterm.cols);
  }
};
export { TerminalUriLinkDetector, TerminalLinkAdapter };
