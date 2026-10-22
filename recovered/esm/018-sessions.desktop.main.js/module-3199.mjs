// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector.ts
import { convertLinkRangeToBuffer, getXtermLineContent3, getXtermRangesByAttr, osPathModule, updateLinkWithRelativeCwd } from "./module-3194.mjs";
import { OS } from "./module-0014.mjs";
import { detectLinks } from "./module-3198.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITerminalLogService } from "./module-1155.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector.ts
var fallbackMatchers = [
  // Python style error: File "<path>", line <line>
  /^ *File (?<link>"(?<path>.+)"(, line (?<line>\d+))?)/,
  // Unknown tool #200166: FILE  <path>:<line>:<col>
  /^ +FILE +(?<link>(?<path>.+)(?::(?<line>\d+)(?::(?<col>\d+))?)?)/,
  // Some C++ compile error formats:
  // C:\foo\bar baz(339) : error ...
  // C:\foo\bar baz(339,12) : error ...
  // C:\foo\bar baz(339, 12) : error ...
  // C:\foo\bar baz(339): error ...       [#178584, Visual Studio CL/NVIDIA CUDA compiler]
  // C:\foo\bar baz(339,12): ...
  // C:\foo\bar baz(339, 12): ...
  /^(?<link>(?<path>.+)\((?<line>\d+)(?:, ?(?<col>\d+))?\)) ?:/,
  // C:\foo/bar baz:339 : error ...
  // C:\foo/bar baz:339:12 : error ...
  // C:\foo/bar baz:339: error ...
  // C:\foo/bar baz:339:12: error ...     [#178584, Clang]
  /^(?<link>(?<path>.+):(?<line>\d+)(?::(?<col>\d+))?) ?:/,
  // PowerShell and cmd prompt
  /^(?:PS\s+)?(?<link>(?<path>[^>]+))>/,
  // The whole line is the path
  /^ *(?<link>(?<path>.+))/
];

var TerminalLocalLinkDetector = class {
  constructor(xterm, _capabilities, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
    this.xterm = xterm;
    this._capabilities = _capabilities;
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
    this.id = "local";
  }
  async detect(lines, startLine, endLine) {
    const links = [];
    const text2 = getXtermLineContent3(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
    if (text2 === "" || text2.length > 2e3 /* MaxLineLength */) {
      return [];
    }
    let stringIndex = -1;
    let resolvedLinkCount = 0;
    const os = this._processManager.os || OS;
    const parsedLinks = detectLinks(text2, os);
    this._logService.trace("terminalLocalLinkDetector#detect text", text2);
    this._logService.trace("terminalLocalLinkDetector#detect parsedLinks", parsedLinks);
    for (const parsedLink of parsedLinks) {
      if (parsedLink.path.text.length > 1024 /* MaxResolvedLinkLength */) {
        continue;
      }
      const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
        startColumn: (parsedLink.prefix?.index ?? parsedLink.path.index) + 1,
        startLineNumber: 1,
        endColumn: parsedLink.path.index + parsedLink.path.text.length + (parsedLink.suffix?.suffix.text.length ?? 0) + 1,
        endLineNumber: 1
      }, startLine);
      const linkCandidates = [];
      const osPath = osPathModule(os);
      const isUri = parsedLink.path.text.startsWith("file://");
      if (osPath.isAbsolute(parsedLink.path.text) || parsedLink.path.text.startsWith("~") || isUri) {
        linkCandidates.push(parsedLink.path.text);
      } else {
        if (this._capabilities.has(2 /* CommandDetection */)) {
          const absolutePath2 = updateLinkWithRelativeCwd(this._capabilities, bufferRange.start.y, parsedLink.path.text, osPath, this._logService);
          if (absolutePath2) {
            linkCandidates.push(...absolutePath2);
          }
        }
        if (linkCandidates.length === 0) {
          linkCandidates.push(parsedLink.path.text);
          if (parsedLink.path.text.match(/^(\.\.[\/\\])+/)) {
            linkCandidates.push(parsedLink.path.text.replace(/^(\.\.[\/\\])+/, ""));
          }
        }
      }
      const specialEndCharRegex = /[\[\]"'\.]$/;
      const trimRangeMap = /* @__PURE__ */ new Map();
      const specialEndLinkCandidates = [];
      for (const candidate of linkCandidates) {
        let previous = candidate;
        let removed = previous.replace(specialEndCharRegex, "");
        let trimRange = 0;
        while (removed !== previous) {
          if (!parsedLink.suffix) {
            trimRange++;
          }
          specialEndLinkCandidates.push(removed);
          trimRangeMap.set(removed, trimRange);
          previous = removed;
          removed = removed.replace(specialEndCharRegex, "");
        }
      }
      linkCandidates.push(...specialEndLinkCandidates);
      this._logService.trace("terminalLocalLinkDetector#detect linkCandidates", linkCandidates);
      const simpleLink = await this._validateAndGetLink(void 0, bufferRange, linkCandidates, trimRangeMap);
      if (simpleLink) {
        simpleLink.parsedLink = parsedLink;
        simpleLink.text = text2.substring(
          parsedLink.prefix?.index ?? parsedLink.path.index,
          parsedLink.suffix ? parsedLink.suffix.suffix.index + parsedLink.suffix.suffix.text.length : parsedLink.path.index + parsedLink.path.text.length
        );
        this._logService.trace("terminalLocalLinkDetector#detect verified link", simpleLink);
        links.push(simpleLink);
      }
      if (++resolvedLinkCount >= 10 /* MaxResolvedLinksInLine */) {
        break;
      }
    }
    if (links.length === 0) {
      for (const matcher of fallbackMatchers) {
        const match2 = text2.match(matcher);
        const group2 = match2?.groups;
        if (!group2) {
          continue;
        }
        const link2 = group2?.link;
        const path = group2?.path;
        const line = group2?.line;
        const col = group2?.col;
        if (!link2 || !path) {
          continue;
        }
        if (link2.length > 1024 /* MaxResolvedLinkLength */) {
          continue;
        }
        stringIndex = text2.indexOf(link2);
        const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
          startColumn: stringIndex + 1,
          startLineNumber: 1,
          endColumn: stringIndex + link2.length + 1,
          endLineNumber: 1
        }, startLine);
        const suffix = line ? `:${line}${col ? `:${col}` : ""}` : "";
        const simpleLink = await this._validateAndGetLink(`${path}${suffix}`, bufferRange, [path]);
        if (simpleLink) {
          links.push(simpleLink);
        }
      }
    }
    if (links.length === 0) {
      const rangeCandidates = getXtermRangesByAttr(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
      for (const rangeCandidate of rangeCandidates) {
        let text3 = "";
        for (let y = rangeCandidate.start.y; y <= rangeCandidate.end.y; y++) {
          const line = this.xterm.buffer.active.getLine(y);
          if (!line) {
            break;
          }
          const lineStartX = y === rangeCandidate.start.y ? rangeCandidate.start.x : 0;
          const lineEndX = y === rangeCandidate.end.y ? rangeCandidate.end.x : this.xterm.cols - 1;
          text3 += line.translateToString(false, lineStartX, lineEndX);
        }
        rangeCandidate.start.x++;
        rangeCandidate.start.y++;
        rangeCandidate.end.y++;
        const simpleLink = await this._validateAndGetLink(text3, rangeCandidate, [text3]);
        if (simpleLink) {
          links.push(simpleLink);
        }
        if (++resolvedLinkCount >= 10 /* MaxResolvedLinksInLine */) {
          break;
        }
      }
    }
    return links;
  }
  async _validateLinkCandidates(linkCandidates) {
    for (const link2 of linkCandidates) {
      let uri4;
      if (link2.startsWith("file://")) {
        uri4 = URI.parse(link2);
      }
      const result = await this._linkResolver.resolveLink(this._processManager, link2, uri4);
      if (result) {
        return result;
      }
    }
    return void 0;
  }
  /**
   * Validates a set of link candidates and returns a link if validated.
   * @param linkText The link text, this should be undefined to use the link stat value
   * @param trimRangeMap A map of link candidates to the amount of buffer range they need trimmed.
   */
  async _validateAndGetLink(linkText, bufferRange, linkCandidates, trimRangeMap) {
    const linkStat = await this._validateLinkCandidates(linkCandidates);
    if (linkStat) {
      const type = getTerminalLinkType(linkStat.uri, linkStat.isDirectory, this._uriIdentityService, this._workspaceContextService);
      const trimRange = trimRangeMap?.get(linkStat.link);
      if (trimRange) {
        bufferRange.end.x -= trimRange;
        if (bufferRange.end.x < 0) {
          bufferRange.end.y--;
          bufferRange.end.x += this.xterm.cols;
        }
      }
      return {
        text: linkText ?? linkStat.link,
        uri: linkStat.uri,
        bufferRange,
        type
      };
    }
    return void 0;
  }
};

TerminalLocalLinkDetector = __decorateClass([
  __decorateParam(4, ITerminalLogService),
  __decorateParam(5, IUriIdentityService),
  __decorateParam(6, IWorkspaceContextService)
], TerminalLocalLinkDetector);

function getTerminalLinkType(uri4, isDirectory, uriIdentityService, workspaceContextService) {
  if (isDirectory) {
    const folders = workspaceContextService.getWorkspace().folders;
    for (let i2 = 0; i2 < folders.length; i2++) {
      if (uriIdentityService.extUri.isEqualOrParent(uri4, folders[i2].uri)) {
        return "LocalFolderInWorkspace" /* LocalFolderInWorkspace */;
      }
    }
    return "LocalFolderOutsideWorkspace" /* LocalFolderOutsideWorkspace */;
  } else {
    return "LocalFile" /* LocalFile */;
  }
}
export { getTerminalLinkType, fallbackMatchers, TerminalLocalLinkDetector };
