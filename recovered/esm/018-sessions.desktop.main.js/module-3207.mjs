// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver.ts
import { Schemas } from "./module-0033.mjs";
import { removeLinkQueryString, removeLinkSuffix, winDrivePrefix } from "./module-3198.mjs";
import { OS, isWindows } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { mainWindow } from "./module-0002.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver.ts
var TerminalLinkResolver = class {
  constructor(_fileService) {
    this._fileService = _fileService;
    // Link cache could be shared across all terminals, but that could lead to weird results when
    // both local and remote terminals are present
    this._resolvedLinkCaches = /* @__PURE__ */ new Map();
  }
  async resolveLink(processManager, link2, uri4) {
    if (uri4 && uri4.scheme === Schemas.file && processManager.remoteAuthority) {
      uri4 = uri4.with({
        scheme: Schemas.vscodeRemote,
        authority: processManager.remoteAuthority
      });
    }
    let cache2 = this._resolvedLinkCaches.get(processManager.remoteAuthority ?? "");
    if (!cache2) {
      cache2 = new LinkCache();
      this._resolvedLinkCaches.set(processManager.remoteAuthority ?? "", cache2);
    }
    const cached = cache2.get(uri4 || link2);
    if (cached !== void 0) {
      return cached;
    }
    if (uri4) {
      try {
        const stat = await this._fileService.stat(uri4);
        const result = { uri: uri4, link: link2, isDirectory: stat.isDirectory };
        cache2.set(uri4, result);
        return result;
      } catch (e4) {
        cache2.set(uri4, null);
        return null;
      }
    }
    let linkUrl = removeLinkSuffix(link2);
    linkUrl = removeLinkQueryString(linkUrl);
    if (linkUrl.length === 0) {
      cache2.set(link2, null);
      return null;
    }
    if (isWindows && link2.match(/^\/mnt\/[a-z]/i) && processManager.backend) {
      linkUrl = await processManager.backend.getWslPath(linkUrl, "unix-to-win");
    } else if (isWindows && link2.match(/^(?:\/\/|\\\\)wsl(?:\$|\.localhost)(\/|\\)/)) {
    } else {
      const preprocessedLink = this._preprocessPath(linkUrl, processManager.initialCwd, processManager.os, processManager.userHome);
      if (!preprocessedLink) {
        cache2.set(link2, null);
        return null;
      }
      linkUrl = preprocessedLink;
    }
    try {
      let uri5;
      if (processManager.remoteAuthority) {
        uri5 = URI.from({
          scheme: Schemas.vscodeRemote,
          authority: processManager.remoteAuthority,
          path: linkUrl
        });
      } else {
        uri5 = URI.file(linkUrl);
      }
      try {
        const stat = await this._fileService.stat(uri5);
        const result = { uri: uri5, link: link2, isDirectory: stat.isDirectory };
        cache2.set(link2, result);
        return result;
      } catch (e4) {
        cache2.set(link2, null);
        return null;
      }
    } catch {
      cache2.set(link2, null);
      return null;
    }
  }
  _preprocessPath(link2, initialCwd, os, userHome) {
    const osPath = this._getOsPath(os);
    if (link2.charAt(0) === "~") {
      if (!userHome) {
        return null;
      }
      link2 = osPath.join(userHome, link2.substring(1));
    } else if (link2.charAt(0) !== "/" && link2.charAt(0) !== "~") {
      if (os === 1 /* Windows */) {
        if (!link2.match("^" + winDrivePrefix) && !link2.startsWith("\\\\?\\")) {
          if (!initialCwd) {
            return null;
          }
          link2 = osPath.join(initialCwd, link2);
        } else {
          link2 = link2.replace(/^\\\\\?\\/, "");
        }
      } else {
        if (!initialCwd) {
          return null;
        }
        link2 = osPath.join(initialCwd, link2);
      }
    }
    link2 = osPath.normalize(link2);
    return link2;
  }
  _getOsPath(os) {
    return (os ?? OS) === 1 /* Windows */ ? win32 : posix;
  }
};

TerminalLinkResolver = __decorateClass([
  __decorateParam(0, IFileService)
], TerminalLinkResolver);

var LinkCache = class {
  constructor() {
    this._cache = /* @__PURE__ */ new Map();
    this._cacheTilTimeout = 0;
  }
  set(link2, value2) {
    if (this._cacheTilTimeout) {
      mainWindow.clearTimeout(this._cacheTilTimeout);
    }
    this._cacheTilTimeout = mainWindow.setTimeout(() => this._cache.clear(), 1e4 /* TTL */);
    this._cache.set(this._getKey(link2), value2);
  }
  get(link2) {
    return this._cache.get(this._getKey(link2));
  }
  _getKey(link2) {
    if (URI.isUri(link2)) {
      return link2.toString();
    }
    return link2;
  }
};
export { TerminalLinkResolver, LinkCache };
