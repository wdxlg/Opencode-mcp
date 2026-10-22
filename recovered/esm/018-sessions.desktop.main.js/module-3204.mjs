// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector.ts
import { convertLinkRangeToBuffer, getXtermLineContent3 } from "./module-3194.mjs";
import { getTerminalLinkType } from "./module-3199.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalMultiLineLinkDetector.ts
var lineNumberPrefixMatchers = [
  // Ripgrep:
  //   /some/file
  //   16:searchresult
  //   16:    searchresult
  // Eslint:
  //   /some/file
  //     16:5  error ...
  /^ *(?<link>(?<line>\d+):(?<col>\d+)?)/
];

var gitDiffMatchers = [
  // --- a/some/file
  // +++ b/some/file
  // @@ -8,11 +8,11 @@ file content...
  /^(?<link>@@ .+ \+(?<toFileLine>\d+),(?<toFileCount>\d+) @@)/
];

var TerminalMultiLineLinkDetector = class {
  constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._processManager = _processManager;
    this._linkResolver = _linkResolver;
    this._logService = _logService;
    this._uriIdentityService = _uriIdentityService;
    this._workspaceContextService = _workspaceContextService;
    // This was chosen as a reasonable maximum line length given the tradeoff between performance
    // and how likely it is to encounter such a large line length. Some useful reference points:
    // - Window old max length: 260 ($MAX_PATH)
    // - Linux max length: 4096 ($PATH_MAX)
    this.maxLinkLength = 500;
  }
  static {
    this.id = "multiline";
  }
  async detect(lines, startLine, endLine) {
    const links = [];
    const text2 = getXtermLineContent3(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text2 === "" || text2.length > 2e3 /* MaxLineLength */) {
      return [];
    }
    this._logService.trace("terminalMultiLineLinkDetector#detect text", text2);
    for (const matcher of lineNumberPrefixMatchers) {
      const match2 = text2.match(matcher);
      const group2 = match2?.groups;
      if (!group2) {
        continue;
      }
      const link2 = group2?.link;
      const line = group2?.line;
      const col = group2?.col;
      if (!link2 || line === void 0) {
        continue;
      }
      if (link2.length > 1024 /* MaxResolvedLinkLength */) {
        continue;
      }
      this._logService.trace("terminalMultiLineLinkDetector#detect candidate", link2);
      let possiblePath;
      for (let index2 = startLine - 1; index2 >= 0; index2--) {
        if (this.xterm.buffer.active.getLine(index2).isWrapped) {
          continue;
        }
        const text3 = getXtermLineContent3(this.xterm.buffer.active, index2, index2, this.xterm.cols);
        if (!text3.match(/^\s*\d/)) {
          possiblePath = text3;
          break;
        }
      }
      if (!possiblePath) {
        continue;
      }
      const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
      if (linkStat) {
        const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
        const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
          startColumn: 1,
          startLineNumber: 1,
          endColumn: 1 + text2.length,
          endLineNumber: 1
        }, startLine);
        const simpleLink = {
          text: link2,
          uri: linkStat.uri,
          selection: {
            startLineNumber: parseInt(line),
            startColumn: col ? parseInt(col) : 1
          },
          disableTrimColon: true,
          bufferRange,
          type
        };
        this._logService.trace("terminalMultiLineLinkDetector#detect verified link", simpleLink);
        links.push(simpleLink);
        break;
      }
    }
    if (links.length === 0) {
      for (const matcher of gitDiffMatchers) {
        const match2 = text2.match(matcher);
        const group2 = match2?.groups;
        if (!group2) {
          continue;
        }
        const link2 = group2?.link;
        const toFileLine = group2?.toFileLine;
        const toFileCount = group2?.toFileCount;
        if (!link2 || toFileLine === void 0) {
          continue;
        }
        if (link2.length > 1024 /* MaxResolvedLinkLength */) {
          continue;
        }
        this._logService.trace("terminalMultiLineLinkDetector#detect candidate", link2);
        let possiblePath;
        for (let index2 = startLine - 1; index2 >= 0; index2--) {
          if (this.xterm.buffer.active.getLine(index2).isWrapped) {
            continue;
          }
          const text3 = getXtermLineContent3(this.xterm.buffer.active, index2, index2, this.xterm.cols);
          const match3 = text3.match(/\+\+\+ b\/(?<path>.+)/);
          if (match3) {
            possiblePath = match3.groups?.path;
            break;
          }
        }
        if (!possiblePath) {
          continue;
        }
        const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
        if (linkStat) {
          const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
          const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
            startColumn: 1,
            startLineNumber: 1,
            endColumn: 1 + link2.length,
            endLineNumber: 1
          }, startLine);
          const simpleLink = {
            text: link2,
            uri: linkStat.uri,
            selection: {
              startLineNumber: parseInt(toFileLine),
              startColumn: 1,
              endLineNumber: parseInt(toFileLine) + parseInt(toFileCount)
            },
            bufferRange,
            type
          };
          this._logService.trace("terminalMultiLineLinkDetector#detect verified link", simpleLink);
          links.push(simpleLink);
          break;
        }
      }
    }
    return links;
  }
};

TerminalMultiLineLinkDetector = __decorateClass([
  __decorateParam(3, ITerminalLogService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IWorkspaceContextService)
], TerminalMultiLineLinkDetector);
export { lineNumberPrefixMatchers, gitDiffMatchers, TerminalMultiLineLinkDetector };
