// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/services/openerService.ts
import { Schemas, matchesScheme, matchesSomeScheme } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { parse2 } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { extractSelection } from "./module-0272.mjs";
import { normalizePath } from "./module-0034.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { LinkedList } from "./module-0013.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { windowOpenNoOpener } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/editor/browser/services/openerService.ts
var CommandOpener = class {
  constructor(_commandService) {
    this._commandService = _commandService;
  }
  async open(target, options3) {
    if (!matchesScheme(target, Schemas.command)) {
      return false;
    }
    if (!options3?.allowCommands) {
      return true;
    }
    if (typeof target === "string") {
      target = URI.parse(target);
    }
    if (Array.isArray(options3.allowCommands)) {
      if (!options3.allowCommands.includes(target.path)) {
        return true;
      }
    }
    let args2 = [];
    try {
      args2 = parse2(decodeURIComponent(target.query));
    } catch {
      try {
        args2 = parse2(target.query);
      } catch {
      }
    }
    if (!Array.isArray(args2)) {
      args2 = [args2];
    }
    await this._commandService.executeCommand(target.path, ...args2);
    return true;
  }
};

CommandOpener = __decorateClass([
  __decorateParam(0, ICommandService)
], CommandOpener);

var EditorOpener = class {
  constructor(_editorService) {
    this._editorService = _editorService;
  }
  async open(target, options3) {
    if (typeof target === "string") {
      target = URI.parse(target);
    }
    const { selection, uri: uri5 } = extractSelection(target);
    target = uri5;
    if (target.scheme === Schemas.file) {
      target = normalizePath(target);
    }
    await this._editorService.openCodeEditor(
      {
        resource: target,
        options: {
          selection,
          source: options3?.fromUserGesture ? 1 /* USER */ : 0 /* API */,
          ...options3?.editorOptions
        }
      },
      this._editorService.getFocusedCodeEditor(),
      options3?.openToSide
    );
    return true;
  }
};

EditorOpener = __decorateClass([
  __decorateParam(0, ICodeEditorService)
], EditorOpener);

var OpenerService = class {
  constructor(editorService, commandService) {
    this._openers = new LinkedList();
    this._validators = new LinkedList();
    this._resolvers = new LinkedList();
    this._resolvedUriTargets = new ResourceMap((uri5) => uri5.with({ path: null, fragment: null, query: null }).toString());
    this._externalOpeners = new LinkedList();
    this._defaultExternalOpener = {
      openExternal: async (href) => {
        if (matchesSomeScheme(href, Schemas.http, Schemas.https)) {
          windowOpenNoOpener(href);
        } else {
          mainWindow.location.href = href;
        }
        return true;
      }
    };
    this._openers.push({
      open: async (target, options3) => {
        if (options3?.openExternal || matchesSomeScheme(target, Schemas.mailto, Schemas.http, Schemas.https, Schemas.vsls)) {
          await this._doOpenExternal(target, options3);
          return true;
        }
        return false;
      }
    });
    this._openers.push(new CommandOpener(commandService));
    this._openers.push(new EditorOpener(editorService));
  }
  registerOpener(opener) {
    const remove2 = this._openers.unshift(opener);
    return { dispose: remove2 };
  }
  registerValidator(validator) {
    const remove2 = this._validators.push(validator);
    return { dispose: remove2 };
  }
  registerExternalUriResolver(resolver) {
    const remove2 = this._resolvers.push(resolver);
    return { dispose: remove2 };
  }
  setDefaultExternalOpener(externalOpener) {
    this._defaultExternalOpener = externalOpener;
  }
  registerExternalOpener(opener) {
    const remove2 = this._externalOpeners.push(opener);
    return { dispose: remove2 };
  }
  async open(target, options3) {
    const targetURI = typeof target === "string" ? URI.parse(target) : target;
    if (targetURI.scheme === Schemas.internal) {
      return false;
    }
    if (!options3?.skipValidation) {
      const validationTarget = this._resolvedUriTargets.get(targetURI) ?? target;
      for (const validator of this._validators) {
        if (!await validator.shouldOpen(validationTarget, options3)) {
          return false;
        }
      }
    }
    for (const opener of this._openers) {
      const handled = await opener.open(target, options3);
      if (handled) {
        return true;
      }
    }
    return false;
  }
  async resolveExternalUri(resource, options3) {
    for (const resolver of this._resolvers) {
      try {
        const result = await resolver.resolveExternalUri(resource, options3);
        if (result) {
          if (!this._resolvedUriTargets.has(result.resolved)) {
            this._resolvedUriTargets.set(result.resolved, resource);
          }
          return result;
        }
      } catch {
      }
    }
    throw new Error("Could not resolve external URI: " + resource.toString());
  }
  async _doOpenExternal(resource, options3) {
    const uri5 = typeof resource === "string" ? URI.parse(resource) : resource;
    let externalUri;
    try {
      externalUri = (await this.resolveExternalUri(uri5, options3)).resolved;
    } catch {
      externalUri = uri5;
    }
    let href;
    if (typeof resource === "string" && uri5.toString() === externalUri.toString()) {
      href = resource;
    } else {
      href = encodeURI(externalUri.toString(true));
    }
    if (options3?.allowContributedOpeners) {
      const preferredOpenerId = typeof options3?.allowContributedOpeners === "string" ? options3?.allowContributedOpeners : void 0;
      for (const opener of this._externalOpeners) {
        const didOpen = await opener.openExternal(href, {
          sourceUri: uri5,
          preferredOpenerId
        }, CancellationToken.None);
        if (didOpen) {
          return true;
        }
      }
    }
    return this._defaultExternalOpener.openExternal(href, { sourceUri: uri5 }, CancellationToken.None);
  }
  dispose() {
    this._validators.clear();
  }
};

OpenerService = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, ICommandService)
], OpenerService);
export { CommandOpener, EditorOpener, OpenerService };
