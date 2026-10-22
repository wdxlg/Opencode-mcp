// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/uri.ts
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0023.mjs";
import { init_marshallingIds } from "./module-0029.mjs";
import { init_path, posix, win32 } from "./module-0008.mjs";


// src/vs/base/common/uri.ts
function _validateUri(ret, _strict) {
  if (!ret.scheme && _strict) {
    throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
  }
  if (ret.scheme && !_schemePattern.test(ret.scheme)) {
    const matches = [...ret.scheme.matchAll(/[^\w\d+.-]/gu)];
    const detail = matches.length > 0 ? ` Found '${matches[0][0]}' at index ${matches[0].index} (${matches.length} total)` : "";
    throw new Error(`[UriError]: Scheme contains illegal characters.${detail} (len:${ret.scheme.length})`);
  }
  if (ret.path) {
    if (ret.authority) {
      if (!_singleSlashStart.test(ret.path)) {
        throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
      }
    } else {
      if (_doubleSlashStart.test(ret.path)) {
        throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
      }
    }
  }
}

function _schemeFix(scheme, _strict) {
  if (!scheme && !_strict) {
    return "file";
  }
  return scheme;
}

function _referenceResolution(scheme, path4) {
  switch (scheme) {
    case "https":
    case "http":
    case "file":
      if (!path4) {
        path4 = _slash;
      } else if (path4[0] !== _slash) {
        path4 = _slash + path4;
      }
      break;
  }
  return path4;
}

function encodeURIComponentFast(uriComponent, isPath, isAuthority) {
  let res = void 0;
  let nativeEncodePos = -1;
  for (let pos = 0; pos < uriComponent.length; pos++) {
    const code2 = uriComponent.charCodeAt(pos);
    if (code2 >= 97 /* a */ && code2 <= 122 /* z */ || code2 >= 65 /* A */ && code2 <= 90 /* Z */ || code2 >= 48 /* Digit0 */ && code2 <= 57 /* Digit9 */ || code2 === 45 /* Dash */ || code2 === 46 /* Period */ || code2 === 95 /* Underline */ || code2 === 126 /* Tilde */ || isPath && code2 === 47 /* Slash */ || isAuthority && code2 === 91 /* OpenSquareBracket */ || isAuthority && code2 === 93 /* CloseSquareBracket */ || isAuthority && code2 === 58 /* Colon */) {
      if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
        nativeEncodePos = -1;
      }
      if (res !== void 0) {
        res += uriComponent.charAt(pos);
      }
    } else {
      if (res === void 0) {
        res = uriComponent.substr(0, pos);
      }
      const escaped = encodeTable[code2];
      if (escaped !== void 0) {
        if (nativeEncodePos !== -1) {
          res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
          nativeEncodePos = -1;
        }
        res += escaped;
      } else if (nativeEncodePos === -1) {
        nativeEncodePos = pos;
      }
    }
  }
  if (nativeEncodePos !== -1) {
    res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
  }
  return res !== void 0 ? res : uriComponent;
}

function encodeURIComponentMinimal(path4) {
  let res = void 0;
  for (let pos = 0; pos < path4.length; pos++) {
    const code2 = path4.charCodeAt(pos);
    if (code2 === 35 /* Hash */ || code2 === 63 /* QuestionMark */) {
      if (res === void 0) {
        res = path4.substr(0, pos);
      }
      res += encodeTable[code2];
    } else {
      if (res !== void 0) {
        res += path4[pos];
      }
    }
  }
  return res !== void 0 ? res : path4;
}

function uriToFsPath(uri, keepDriveLetterCasing) {
  let value;
  if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
    value = `//${uri.authority}${uri.path}`;
  } else if (uri.path.charCodeAt(0) === 47 /* Slash */ && (uri.path.charCodeAt(1) >= 65 /* A */ && uri.path.charCodeAt(1) <= 90 /* Z */ || uri.path.charCodeAt(1) >= 97 /* a */ && uri.path.charCodeAt(1) <= 122 /* z */) && uri.path.charCodeAt(2) === 58 /* Colon */) {
    if (!keepDriveLetterCasing) {
      value = uri.path[1].toLowerCase() + uri.path.substr(2);
    } else {
      value = uri.path.substr(1);
    }
  } else {
    value = uri.path;
  }
  if (isWindows2) {
    value = value.replace(/\//g, "\\");
  }
  return value;
}

function _asFormatted(uri, skipEncoding) {
  const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
  let res = "";
  let { scheme, authority, path: path4, query, fragment } = uri;
  if (scheme) {
    res += scheme;
    res += ":";
  }
  if (authority || scheme === "file") {
    res += _slash;
    res += _slash;
  }
  if (authority) {
    let idx = authority.indexOf("@");
    if (idx !== -1) {
      const userinfo = authority.substr(0, idx);
      authority = authority.substr(idx + 1);
      idx = userinfo.lastIndexOf(":");
      if (idx === -1) {
        res += encoder(userinfo, false, false);
      } else {
        res += encoder(userinfo.substr(0, idx), false, false);
        res += ":";
        res += encoder(userinfo.substr(idx + 1), false, true);
      }
      res += "@";
    }
    authority = authority.toLowerCase();
    idx = authority.lastIndexOf(":");
    if (idx === -1) {
      res += encoder(authority, false, true);
    } else {
      res += encoder(authority.substr(0, idx), false, true);
      res += authority.substr(idx);
    }
  }
  if (path4) {
    if (path4.length >= 3 && path4.charCodeAt(0) === 47 /* Slash */ && path4.charCodeAt(2) === 58 /* Colon */) {
      const code2 = path4.charCodeAt(1);
      if (code2 >= 65 /* A */ && code2 <= 90 /* Z */) {
        path4 = `/${String.fromCharCode(code2 + 32)}:${path4.substr(3)}`;
      }
    } else if (path4.length >= 2 && path4.charCodeAt(1) === 58 /* Colon */) {
      const code2 = path4.charCodeAt(0);
      if (code2 >= 65 /* A */ && code2 <= 90 /* Z */) {
        path4 = `${String.fromCharCode(code2 + 32)}:${path4.substr(2)}`;
      }
    }
    res += encoder(path4, true, false);
  }
  if (query) {
    res += "?";
    res += encoder(query, false, false);
  }
  if (fragment) {
    res += "#";
    res += !skipEncoding ? encodeURIComponentFast(fragment, false, false) : fragment;
  }
  return res;
}

function decodeURIComponentGraceful(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    if (str.length > 3) {
      return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
    } else {
      return str;
    }
  }
}

function percentDecode(str) {
  if (!str.match(_rEncodedAsHex)) {
    return str;
  }
  return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
}

var _schemePattern, _singleSlashStart, _doubleSlashStart, _empty, _slash, _regexp, URI, _pathSepMarker, Uri, encodeTable, _rEncodedAsHex;

var init_uri = __esm({
  "src/vs/base/common/uri.ts"() {
    init_charCode();
    init_marshallingIds();
    init_path();
    init_platform();
    _schemePattern = /^\w[\w\d+.-]*$/;
    _singleSlashStart = /^\//;
    _doubleSlashStart = /^\/\//;
    _empty = "";
    _slash = "/";
    _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    URI = class _URI {
      static isUri(thing) {
        if (thing instanceof _URI) {
          return true;
        }
        if (!thing || typeof thing !== "object") {
          return false;
        }
        return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
      }
      /**
       * @internal
       */
      constructor(schemeOrData, authority, path4, query, fragment, _strict = false) {
        if (typeof schemeOrData === "object") {
          this.scheme = schemeOrData.scheme || _empty;
          this.authority = schemeOrData.authority || _empty;
          this.path = schemeOrData.path || _empty;
          this.query = schemeOrData.query || _empty;
          this.fragment = schemeOrData.fragment || _empty;
        } else {
          this.scheme = _schemeFix(schemeOrData, _strict);
          this.authority = authority || _empty;
          this.path = _referenceResolution(this.scheme, path4 || _empty);
          this.query = query || _empty;
          this.fragment = fragment || _empty;
          _validateUri(this, _strict);
        }
      }
      // ---- filesystem path -----------------------
      /**
       * Returns a string representing the corresponding file system path of this URI.
       * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
       * platform specific path separator.
       *
       * * Will *not* validate the path for invalid characters and semantics.
       * * Will *not* look at the scheme of this URI.
       * * The result shall *not* be used for display purposes but for accessing a file on disk.
       *
       *
       * The *difference* to `URI#path` is the use of the platform specific separator and the handling
       * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
       *
       * ```ts
      	const u = URI.parse('file://server/c$/folder/file.txt')
      	u.authority === 'server'
      	u.path === '/shares/c$/file.txt'
      	u.fsPath === '\\server\c$\folder\file.txt'
      ```
       *
       * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
       * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
       * with URIs that represent files on disk (`file` scheme).
       */
      get fsPath() {
        return uriToFsPath(this, false);
      }
      // ---- modify to new -------------------------
      with(change) {
        if (!change) {
          return this;
        }
        let { scheme, authority, path: path4, query, fragment } = change;
        if (scheme === void 0) {
          scheme = this.scheme;
        } else if (scheme === null) {
          scheme = _empty;
        }
        if (authority === void 0) {
          authority = this.authority;
        } else if (authority === null) {
          authority = _empty;
        }
        if (path4 === void 0) {
          path4 = this.path;
        } else if (path4 === null) {
          path4 = _empty;
        }
        if (query === void 0) {
          query = this.query;
        } else if (query === null) {
          query = _empty;
        }
        if (fragment === void 0) {
          fragment = this.fragment;
        } else if (fragment === null) {
          fragment = _empty;
        }
        if (scheme === this.scheme && authority === this.authority && path4 === this.path && query === this.query && fragment === this.fragment) {
          return this;
        }
        return new Uri(scheme, authority, path4, query, fragment);
      }
      // ---- parse & validate ------------------------
      /**
       * Creates a new URI from a string, e.g. `http://www.example.com/some/path`,
       * `file:///usr/home`, or `scheme:with/path`.
       *
       * @param value A string which represents an URI (see `URI#toString`).
       */
      static parse(value, _strict = false) {
        const match = _regexp.exec(value);
        if (!match) {
          return new Uri(_empty, _empty, _empty, _empty, _empty);
        }
        return new Uri(
          match[2] || _empty,
          percentDecode(match[4] || _empty),
          percentDecode(match[5] || _empty),
          percentDecode(match[7] || _empty),
          percentDecode(match[9] || _empty),
          _strict
        );
      }
      /**
       * Creates a new URI from a file system path, e.g. `c:\my\files`,
       * `/usr/home`, or `\\server\share\some\path`.
       *
       * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
       * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
       * `URI.parse('file://' + path)` because the path might contain characters that are
       * interpreted (# and ?). See the following sample:
       * ```ts
      const good = URI.file('/coding/c#/project1');
      good.scheme === 'file';
      good.path === '/coding/c#/project1';
      good.fragment === '';
      const bad = URI.parse('file://' + '/coding/c#/project1');
      bad.scheme === 'file';
      bad.path === '/coding/c'; // path is now broken
      bad.fragment === '/project1';
      ```
       *
       * @param path A file system path (see `URI#fsPath`)
       */
      static file(path4) {
        let authority = _empty;
        if (isWindows2) {
          path4 = path4.replace(/\\/g, _slash);
        }
        if (path4[0] === _slash && path4[1] === _slash) {
          const idx = path4.indexOf(_slash, 2);
          if (idx === -1) {
            authority = path4.substring(2);
            path4 = _slash;
          } else {
            authority = path4.substring(2, idx);
            path4 = path4.substring(idx) || _slash;
          }
        }
        return new Uri("file", authority, path4, _empty, _empty);
      }
      /**
       * Creates new URI from uri components.
       *
       * Unless `strict` is `true` the scheme is defaults to be `file`. This function performs
       * validation and should be used for untrusted uri components retrieved from storage,
       * user input, command arguments etc
       */
      static from(components, strict) {
        const result = new Uri(
          components.scheme,
          components.authority,
          components.path,
          components.query,
          components.fragment,
          strict
        );
        return result;
      }
      /**
       * Join a URI path with path fragments and normalizes the resulting path.
       *
       * @param uri The input URI.
       * @param pathFragment The path fragment to add to the URI path.
       * @returns The resulting URI.
       */
      static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
          throw new Error(`[UriError]: cannot call joinPath on URI without path: ${uri.toString()}`);
        }
        let newPath;
        if (isWindows2 && uri.scheme === "file") {
          newPath = _URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
        } else {
          newPath = posix.join(uri.path, ...pathFragment);
        }
        return uri.with({ path: newPath });
      }
      // ---- printing/externalize ---------------------------
      /**
       * Creates a string representation for this URI. It's guaranteed that calling
       * `URI.parse` with the result of this function creates an URI which is equal
       * to this URI.
       *
       * * The result shall *not* be used for display purposes but for externalization or transport.
       * * The result will be encoded using the percentage encoding and encoding happens mostly
       * ignore the scheme-specific encoding rules.
       *
       * @param skipEncoding Do not encode the result, default is `false`
       */
      toString(skipEncoding = false) {
        return _asFormatted(this, skipEncoding);
      }
      toJSON() {
        return this;
      }
      static revive(data) {
        if (!data) {
          return data;
        } else if (data instanceof _URI) {
          return data;
        } else {
          const result = new Uri(data);
          result._formatted = data.external ?? null;
          result._fsPath = data._sep === _pathSepMarker ? data.fsPath ?? null : null;
          return result;
        }
      }
      [/* @__PURE__ */ Symbol.for("debug.description")]() {
        return `URI(${this.toString()})`;
      }
    };
    _pathSepMarker = isWindows2 ? 1 : void 0;
    Uri = class extends URI {
      constructor() {
        super(...arguments);
        this._formatted = null;
        this._fsPath = null;
      }
      get fsPath() {
        if (!this._fsPath) {
          this._fsPath = uriToFsPath(this, false);
        }
        return this._fsPath;
      }
      toString(skipEncoding = false) {
        if (!skipEncoding) {
          if (!this._formatted) {
            this._formatted = _asFormatted(this, false);
          }
          return this._formatted;
        } else {
          return _asFormatted(this, true);
        }
      }
      toJSON() {
        const res = {
          $mid: 1 /* Uri */
        };
        if (this._fsPath) {
          res.fsPath = this._fsPath;
          res._sep = _pathSepMarker;
        }
        if (this._formatted) {
          res.external = this._formatted;
        }
        if (this.path) {
          res.path = this.path;
        }
        if (this.scheme) {
          res.scheme = this.scheme;
        }
        if (this.authority) {
          res.authority = this.authority;
        }
        if (this.query) {
          res.query = this.query;
        }
        if (this.fragment) {
          res.fragment = this.fragment;
        }
        return res;
      }
    };
    encodeTable = {
      [58 /* Colon */]: "%3A",
      // gen-delims
      [47 /* Slash */]: "%2F",
      [63 /* QuestionMark */]: "%3F",
      [35 /* Hash */]: "%23",
      [91 /* OpenSquareBracket */]: "%5B",
      [93 /* CloseSquareBracket */]: "%5D",
      [64 /* AtSign */]: "%40",
      [33 /* ExclamationMark */]: "%21",
      // sub-delims
      [36 /* DollarSign */]: "%24",
      [38 /* Ampersand */]: "%26",
      [39 /* SingleQuote */]: "%27",
      [40 /* OpenParen */]: "%28",
      [41 /* CloseParen */]: "%29",
      [42 /* Asterisk */]: "%2A",
      [43 /* Plus */]: "%2B",
      [44 /* Comma */]: "%2C",
      [59 /* Semicolon */]: "%3B",
      [61 /* Equals */]: "%3D",
      [32 /* Space */]: "%20"
    };
    _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
  }
});
export { _validateUri, _schemeFix, _referenceResolution, encodeURIComponentFast, encodeURIComponentMinimal, uriToFsPath, _asFormatted, decodeURIComponentGraceful, percentDecode, _schemePattern, _singleSlashStart, _doubleSlashStart, _empty, _slash, _regexp, URI, _pathSepMarker, Uri, encodeTable, _rEncodedAsHex, init_uri };
