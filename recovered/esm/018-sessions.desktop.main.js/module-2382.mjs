// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/linkDetector.ts
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { Iterable } from "./module-0011.mjs";
import { addDisposableListener, getWindow, isHTMLElement, reset } from "./module-0075.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { join, normalize, posix } from "./module-0026.mjs";
import { localize } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IPathService } from "./module-0939.mjs";
import { ITunnelService } from "./module-1408.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/debug/browser/linkDetector.ts
var CONTROL_CODES = "\\u0000-\\u0020\\u007f-\\u009f";

var WEB_LINK_REGEX = new RegExp("(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s" + CONTROL_CODES + '"]{2,}[^\\s' + CONTROL_CODES + `"')}\\],:;.!?]`, "ug");

var WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\s\.@\-\(\)\[\]{}!#$%^&'`~+=]+)+)/;

var WIN_RELATIVE_PATH = /(?:(?:\~|\.+)(?:(?:\\|\/)[\w\s\.@\-\(\)\[\]{}!#$%^&'`~+=]+)+)/;

var WIN_PATH = new RegExp(`(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`);

var POSIX_PATH = /((?:\~|\.+)?(?:\/[\w\s\.@\-\(\)\[\]{}!#$%^&'`~+=]+)+)/;

var LINE_COLUMN = /(?::(?:line\s+)?([\d]+))?(?::([\d]+))?/;

var PATH_LINK_REGEX = new RegExp(`${isWindows ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`, "g");

var LINE_COLUMN_REGEX2 = /:(?:line\s+)?([\d]+)(?::([\d]+))?$/;

var MAX_LENGTH = 2e3;

var LinkDetector2 = class {
  constructor(editorService, fileService, openerService, pathService, tunnelService, environmentService, configurationService, hoverService) {
    this.editorService = editorService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.pathService = pathService;
    this.tunnelService = tunnelService;
    this.environmentService = environmentService;
    this.configurationService = configurationService;
    this.hoverService = hoverService;
  }
  /**
   * Matches and handles web urls, absolute and relative file links in the string provided.
   * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
   * 'onclick' event is attached to all anchored links that opens them in the editor.
   * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
   * and added as a child of the returned <span>.
   * The `hoverBehavior` is required and manages the lifecycle of event listeners.
   */
  linkify(text2, hoverBehavior, splitLines2, workspaceFolder, includeFulltext, highlights) {
    return this._linkify(text2, hoverBehavior, splitLines2, workspaceFolder, includeFulltext, highlights);
  }
  _linkify(text2, hoverBehavior, splitLines2, workspaceFolder, includeFulltext, highlights, defaultRef) {
    if (splitLines2) {
      const lines = text2.split("\n");
      for (let i2 = 0; i2 < lines.length - 1; i2++) {
        lines[i2] = lines[i2] + "\n";
      }
      if (!lines[lines.length - 1]) {
        lines.pop();
      }
      const elements = lines.map((line) => this._linkify(line, hoverBehavior, false, workspaceFolder, includeFulltext, highlights, defaultRef));
      if (elements.length === 1) {
        return elements[0];
      }
      const container3 = document.createElement("span");
      elements.forEach((e4) => container3.appendChild(e4));
      return container3;
    }
    const container2 = document.createElement("span");
    for (const part of this.detectLinks(text2)) {
      try {
        let node;
        switch (part.kind) {
          case "text":
            node = defaultRef ? this.linkifyLocation(part.value, defaultRef.locationReference, defaultRef.session, hoverBehavior) : document.createTextNode(part.value);
            break;
          case "web":
            node = this.createWebLink(includeFulltext ? text2 : void 0, part.value, hoverBehavior);
            break;
          case "path": {
            const path = part.captures[0];
            const lineNumber = part.captures[1] ? Number(part.captures[1]) : 0;
            const columnNumber = part.captures[2] ? Number(part.captures[2]) : 0;
            node = this.createPathLink(includeFulltext ? text2 : void 0, part.value, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior);
            break;
          }
          default:
            node = document.createTextNode(part.value);
        }
        container2.append(...this.applyHighlights(node, part.index, part.value.length, highlights));
      } catch (e4) {
        container2.appendChild(document.createTextNode(part.value));
      }
    }
    return container2;
  }
  applyHighlights(node, startIndex, length, highlights) {
    const children = [];
    let currentIndex = startIndex;
    const endIndex = startIndex + length;
    for (const highlight of highlights || []) {
      if (highlight.end <= currentIndex || highlight.start >= endIndex) {
        continue;
      }
      if (highlight.start > currentIndex) {
        children.push(node.textContent.substring(currentIndex - startIndex, highlight.start - startIndex));
        currentIndex = highlight.start;
      }
      const highlightEnd = Math.min(highlight.end, endIndex);
      const highlightedText = node.textContent.substring(currentIndex - startIndex, highlightEnd - startIndex);
      const highlightSpan = document.createElement("span");
      highlightSpan.classList.add("highlight");
      if (highlight.extraClasses) {
        highlightSpan.classList.add(...highlight.extraClasses);
      }
      highlightSpan.textContent = highlightedText;
      children.push(highlightSpan);
      currentIndex = highlightEnd;
    }
    if (currentIndex === startIndex) {
      return Iterable.single(node);
    }
    if (currentIndex < endIndex) {
      children.push(node.textContent.substring(currentIndex - startIndex));
    }
    if (isHTMLElement(node)) {
      reset(node, ...children);
      return Iterable.single(node);
    }
    return children;
  }
  /**
   * Linkifies a location reference.
   */
  linkifyLocation(text2, locationReference, session, hoverBehavior) {
    const link2 = this.createLink(text2);
    this.decorateLink(link2, void 0, text2, hoverBehavior, async (preserveFocus) => {
      const location2 = await session.resolveLocationReference(locationReference);
      await location2.source.openInEditor(this.editorService, {
        startLineNumber: location2.line,
        startColumn: location2.column,
        endLineNumber: location2.endLine ?? location2.line,
        endColumn: location2.endColumn ?? location2.column
      }, preserveFocus);
    });
    return link2;
  }
  /**
   * Makes an {@link ILinkDetector} that links everything in the output to the
   * reference if they don't have other explicit links.
   */
  makeReferencedLinkDetector(locationReference, session) {
    return {
      linkify: (text2, hoverBehavior, splitLines2, workspaceFolder, includeFulltext, highlights) => this._linkify(text2, hoverBehavior, splitLines2, workspaceFolder, includeFulltext, highlights, { locationReference, session }),
      linkifyLocation: this.linkifyLocation.bind(this)
    };
  }
  createWebLink(fulltext, url, hoverBehavior) {
    const link2 = this.createLink(url);
    let uri4 = URI.parse(url);
    const lineCol = LINE_COLUMN_REGEX2.exec(uri4.path);
    if (lineCol) {
      uri4 = uri4.with({
        path: uri4.path.slice(0, lineCol.index),
        fragment: `L${lineCol[0].slice(1)}`
      });
    }
    this.decorateLink(link2, uri4, fulltext, hoverBehavior, async () => {
      if (uri4.scheme === Schemas.file) {
        const fsPath = uri4.fsPath;
        const path = await this.pathService.path;
        const fileUrl = normalize(path.sep === posix.sep && isWindows ? fsPath.replace(/\\/g, posix.sep) : fsPath);
        const fileUri = URI.parse(fileUrl);
        const exists = await this.fileService.exists(fileUri);
        if (!exists) {
          return;
        }
        await this.editorService.openEditor({
          resource: fileUri,
          options: {
            pinned: true,
            selection: lineCol ? { startLineNumber: +lineCol[1], startColumn: lineCol[2] ? +lineCol[2] : 1 } : void 0
          }
        });
        return;
      }
      this.openerService.open(url, { allowTunneling: !!this.environmentService.remoteAuthority && this.configurationService.getValue("remote.forwardOnOpen") });
    });
    return link2;
  }
  createPathLink(fulltext, text2, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior) {
    if (path[0] === "/" && path[1] === "/") {
      return document.createTextNode(text2);
    }
    const options3 = lineNumber > 0 ? { selection: { startLineNumber: lineNumber, startColumn: columnNumber > 0 ? columnNumber : 1 } } : {};
    if (path[0] === ".") {
      if (!workspaceFolder) {
        return document.createTextNode(text2);
      }
      const uri5 = workspaceFolder.toResource(path);
      const link3 = this.createLink(text2);
      this.decorateLink(link3, uri5, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri5, options: { ...options3, preserveFocus } }));
      return link3;
    }
    if (path[0] === "~") {
      const userHome = this.pathService.resolvedUserHome;
      if (userHome) {
        path = join(userHome.fsPath, path.substring(1));
      }
    }
    const link2 = this.createLink(text2);
    link2.tabIndex = 0;
    const uri4 = URI.file(normalize(path));
    this.fileService.stat(uri4).then((stat) => {
      if (stat.isDirectory) {
        return;
      }
      this.decorateLink(link2, uri4, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri4, options: { ...options3, preserveFocus } }));
    }).catch(() => {
    });
    return link2;
  }
  createLink(text2) {
    const link2 = document.createElement("a");
    link2.textContent = text2;
    return link2;
  }
  decorateLink(link2, uri4, fulltext, hoverBehavior, onClick4) {
    if (hoverBehavior.store.isDisposed) {
      return;
    }
    link2.classList.add("link");
    const followLink = uri4 && this.tunnelService.canTunnel(uri4) ? localize(14611, null) : localize(14612, null);
    const title = link2.ariaLabel = fulltext ? isMacintosh ? localize(14610, null, followLink, fulltext) : localize(14609, null, followLink, fulltext) : isMacintosh ? localize(14608, null, followLink) : localize(14607, null, followLink);
    if (hoverBehavior.type === 0 /* Rich */) {
      hoverBehavior.store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), link2, title));
    } else if (hoverBehavior.type !== 2 /* None */) {
      link2.title = title;
    }
    hoverBehavior.store.add(addDisposableListener(link2, "mousemove", (event) => {
      link2.classList.toggle("pointer", isMacintosh ? event.metaKey : event.ctrlKey);
    }));
    hoverBehavior.store.add(addDisposableListener(link2, "mouseleave", () => {
      link2.classList.remove("pointer");
    }));
    hoverBehavior.store.add(addDisposableListener(link2, "click", (event) => {
      const selection = getWindow(link2).getSelection();
      if (!selection || selection.type === "Range") {
        return;
      }
      if (!(isMacintosh ? event.metaKey : event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      onClick4(false);
    }));
    hoverBehavior.store.add(addDisposableListener(link2, "keydown", (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) {
        event.preventDefault();
        event.stopPropagation();
        onClick4(event.keyCode === 10 /* Space */);
      }
    }));
  }
  detectLinks(text2) {
    if (text2.length > MAX_LENGTH) {
      return [{ kind: "text", value: text2, captures: [], index: 0 }];
    }
    const regexes = [WEB_LINK_REGEX, PATH_LINK_REGEX];
    const kinds = ["web", "path"];
    const result = [];
    const splitOne = (text3, regexIndex, baseIndex) => {
      if (regexIndex >= regexes.length) {
        result.push({ value: text3, kind: "text", captures: [], index: baseIndex });
        return;
      }
      const regex = regexes[regexIndex];
      let currentIndex = 0;
      let match2;
      regex.lastIndex = 0;
      while ((match2 = regex.exec(text3)) !== null) {
        const stringBeforeMatch = text3.substring(currentIndex, match2.index);
        if (stringBeforeMatch) {
          splitOne(stringBeforeMatch, regexIndex + 1, baseIndex + currentIndex);
        }
        const value2 = match2[0];
        result.push({
          value: value2,
          kind: kinds[regexIndex],
          captures: match2.slice(1),
          index: baseIndex + match2.index
        });
        currentIndex = match2.index + value2.length;
      }
      const stringAfterMatches = text3.substring(currentIndex);
      if (stringAfterMatches) {
        splitOne(stringAfterMatches, regexIndex + 1, baseIndex + currentIndex);
      }
    };
    splitOne(text2, 0, 0);
    return result;
  }
};

LinkDetector2 = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IPathService),
  __decorateParam(4, ITunnelService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IHoverService)
], LinkDetector2);
export { CONTROL_CODES, WEB_LINK_REGEX, WIN_ABSOLUTE_PATH, WIN_RELATIVE_PATH, WIN_PATH, POSIX_PATH, LINE_COLUMN, PATH_LINK_REGEX, LINE_COLUMN_REGEX2, MAX_LENGTH, LinkDetector2 };
