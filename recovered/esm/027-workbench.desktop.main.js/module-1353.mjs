// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/snippets/browser/snippetsFile.ts
import { Placeholder, SnippetParser, Text, Variable } from "./module-0544.mjs";
import { KnownSnippetVariableNames } from "./module-0712.mjs";
import { WindowIdleValue, getActiveWindow } from "./module-0075.mjs";
import { Schemas } from "./module-0033.mjs";
import { basename, extname } from "./module-0026.mjs";
import { match } from "./module-0857.mjs";
import { isObject } from "./module-0010.mjs";
import { getNodeType, parse5 } from "./module-0883.mjs";
import { localize } from "./module-0001.mjs";
import { Iterable } from "./module-0011.mjs";
import { relativePath } from "./module-0034.mjs";


// src/vs/workbench/contrib/snippets/browser/snippetsFile.ts
var SnippetBodyInsights = class {
  constructor(body) {
    this.isBogous = false;
    this.isTrivial = false;
    this.usesClipboardVariable = false;
    this.usesSelectionVariable = false;
    this.codeSnippet = body;
    const textmateSnippet = new SnippetParser().parse(body, false);
    const placeholders = /* @__PURE__ */ new Map();
    let placeholderMax = 0;
    for (const placeholder of textmateSnippet.placeholders) {
      placeholderMax = Math.max(placeholderMax, placeholder.index);
    }
    if (textmateSnippet.placeholders.length === 0) {
      this.isTrivial = true;
    } else if (placeholderMax === 0) {
      const last = textmateSnippet.children.at(-1);
      this.isTrivial = last instanceof Placeholder && last.isFinalTabstop;
    }
    const stack = [...textmateSnippet.children];
    while (stack.length > 0) {
      const marker = stack.shift();
      if (marker instanceof Variable) {
        if (marker.children.length === 0 && !KnownSnippetVariableNames[marker.name]) {
          const index2 = placeholders.has(marker.name) ? placeholders.get(marker.name) : ++placeholderMax;
          placeholders.set(marker.name, index2);
          const synthetic = new Placeholder(index2).appendChild(new Text(marker.name));
          textmateSnippet.replace(marker, [synthetic]);
          this.isBogous = true;
        }
        switch (marker.name) {
          case "CLIPBOARD":
            this.usesClipboardVariable = true;
            break;
          case "SELECTION":
          case "TM_SELECTED_TEXT":
            this.usesSelectionVariable = true;
            break;
        }
      } else {
        stack.push(...marker.children);
      }
    }
    if (this.isBogous) {
      this.codeSnippet = textmateSnippet.toTextmateString();
    }
  }
};

var Snippet = class {
  constructor(isFileTemplate, scopes, name, prefix, description, body, source, snippetSource, snippetIdentifier, include, exclude, extensionId) {
    this.isFileTemplate = isFileTemplate;
    this.scopes = scopes;
    this.name = name;
    this.prefix = prefix;
    this.description = description;
    this.body = body;
    this.source = source;
    this.snippetSource = snippetSource;
    this.snippetIdentifier = snippetIdentifier;
    this.include = include;
    this.exclude = exclude;
    this.extensionId = extensionId;
    this.prefixLow = prefix.toLowerCase();
    this._bodyInsights = new WindowIdleValue(getActiveWindow(), () => new SnippetBodyInsights(this.body));
  }
  get codeSnippet() {
    return this._bodyInsights.value.codeSnippet;
  }
  get isBogous() {
    return this._bodyInsights.value.isBogous;
  }
  get isTrivial() {
    return this._bodyInsights.value.isTrivial;
  }
  get needsClipboard() {
    return this._bodyInsights.value.usesClipboardVariable;
  }
  get usesSelection() {
    return this._bodyInsights.value.usesSelectionVariable;
  }
  isFileIncluded(resourceUri) {
    const uriPath = resourceUri.scheme === Schemas.file ? resourceUri.fsPath : resourceUri.path;
    const fileName = basename(uriPath);
    const getMatchTarget = (pattern) => {
      return pattern.includes("/") ? uriPath : fileName;
    };
    if (this.exclude) {
      for (const pattern of this.exclude.filter(Boolean)) {
        if (match(pattern, getMatchTarget(pattern), { ignoreCase: true })) {
          return false;
        }
      }
    }
    if (this.include) {
      for (const pattern of this.include.filter(Boolean)) {
        if (match(pattern, getMatchTarget(pattern), { ignoreCase: true })) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
};

function isJsonSerializedSnippet(thing) {
  return isObject(thing) && Boolean(thing.body);
}

var SnippetFile = class {
  constructor(source, location2, defaultScopes, _extension, _fileService, _extensionResourceLoaderService) {
    this.source = source;
    this.location = location2;
    this.defaultScopes = defaultScopes;
    this._extension = _extension;
    this._fileService = _fileService;
    this._extensionResourceLoaderService = _extensionResourceLoaderService;
    this.data = [];
    this.isGlobalSnippets = extname(location2.path) === ".code-snippets";
    this.isUserSnippets = !this._extension;
  }
  select(selector, bucket) {
    if (this.isGlobalSnippets || !this.isUserSnippets) {
      this._scopeSelect(selector, bucket);
    } else {
      this._filepathSelect(selector, bucket);
    }
  }
  _filepathSelect(selector, bucket) {
    if (selector + ".json" === basename(this.location.path)) {
      bucket.push(...this.data);
    }
  }
  _scopeSelect(selector, bucket) {
    for (const snippet of this.data) {
      const len = snippet.scopes.length;
      if (len === 0) {
        bucket.push(snippet);
      } else {
        for (let i2 = 0; i2 < len; i2++) {
          if (snippet.scopes[i2] === selector) {
            bucket.push(snippet);
            break;
          }
        }
      }
    }
    const idx = selector.lastIndexOf(".");
    if (idx >= 0) {
      this._scopeSelect(selector.substring(0, idx), bucket);
    }
  }
  async _load() {
    if (this._extension) {
      return this._extensionResourceLoaderService.readExtensionResource(this.location);
    } else {
      const content2 = await this._fileService.readFile(this.location);
      return content2.value.toString();
    }
  }
  load() {
    if (!this._loadPromise) {
      this._loadPromise = Promise.resolve(this._load()).then((content2) => {
        const data = parse5(content2);
        if (getNodeType(data) === "object") {
          for (const [name, scopeOrTemplate] of Object.entries(data)) {
            if (isJsonSerializedSnippet(scopeOrTemplate)) {
              this._parseSnippet(name, scopeOrTemplate, this.data);
            } else {
              for (const [name2, template2] of Object.entries(scopeOrTemplate)) {
                this._parseSnippet(name2, template2, this.data);
              }
            }
          }
        }
        return this;
      });
    }
    return this._loadPromise;
  }
  reset() {
    this._loadPromise = void 0;
    this.data.length = 0;
  }
  _parseSnippet(name, snippet, bucket) {
    let { isFileTemplate, prefix, body, description } = snippet;
    if (!prefix) {
      prefix = "";
    }
    if (Array.isArray(body)) {
      body = body.join("\n");
    }
    if (typeof body !== "string") {
      return;
    }
    if (Array.isArray(description)) {
      description = description.join("\n");
    }
    let scopes;
    if (this.defaultScopes) {
      scopes = this.defaultScopes;
    } else if (typeof snippet.scope === "string") {
      scopes = snippet.scope.split(",").map((s) => s.trim()).filter(Boolean);
    } else {
      scopes = [];
    }
    let include;
    if (snippet.include) {
      if (Array.isArray(snippet.include)) {
        include = snippet.include;
      } else if (typeof snippet.include === "string") {
        include = [snippet.include];
      }
    }
    let exclude;
    if (snippet.exclude) {
      if (Array.isArray(snippet.exclude)) {
        exclude = snippet.exclude;
      } else if (typeof snippet.exclude === "string") {
        exclude = [snippet.exclude];
      }
    }
    let source;
    if (this._extension) {
      source = this._extension.displayName || this._extension.name;
    } else if (this.source === 2 /* Workspace */) {
      source = localize(19367, null);
    } else {
      if (this.isGlobalSnippets) {
        source = localize(19366, null);
      } else {
        source = localize(19365, null);
      }
    }
    for (const _prefix of Iterable.wrap(prefix)) {
      bucket.push(new Snippet(
        Boolean(isFileTemplate),
        scopes,
        name,
        _prefix,
        description,
        body,
        source,
        this.source,
        this._extension ? `${relativePath(this._extension.extensionLocation, this.location)}/${name}` : `${basename(this.location.path)}/${name}`,
        include,
        exclude,
        this._extension?.identifier
      ));
    }
  }
};
export { isJsonSerializedSnippet, SnippetBodyInsights, Snippet, SnippetFile };
