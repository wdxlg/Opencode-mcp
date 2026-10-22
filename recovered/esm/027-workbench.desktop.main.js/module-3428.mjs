// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService.ts
import { Emitter } from "./module-0017.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { toDisposable } from "./module-0012.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/terminalContrib/quickFix/browser/terminalQuickFixService.ts
var TerminalQuickFixService = class {
  constructor() {
    this._selectors = /* @__PURE__ */ new Map();
    this._providers = /* @__PURE__ */ new Map();
    this._pendingProviders = /* @__PURE__ */ new Map();
    this._onDidRegisterProvider = new Emitter();
    this.onDidRegisterProvider = this._onDidRegisterProvider.event;
    this._onDidRegisterCommandSelector = new Emitter();
    this.onDidRegisterCommandSelector = this._onDidRegisterCommandSelector.event;
    this._onDidUnregisterProvider = new Emitter();
    this.onDidUnregisterProvider = this._onDidUnregisterProvider.event;
    this.extensionQuickFixes = new Promise((r2) => quickFixExtensionPoint.setHandler((fixes) => {
      r2(fixes.filter((c) => isProposedApiEnabled(c.description, "terminalQuickFixProvider")).map((c) => {
        if (!c.value) {
          return [];
        }
        return c.value.map((fix) => {
          return { ...fix, extensionIdentifier: c.description.identifier.value };
        });
      }).flat());
    }));
    this.extensionQuickFixes.then((selectors) => {
      for (const selector of selectors) {
        this.registerCommandSelector(selector);
      }
    });
  }
  get providers() {
    return this._providers;
  }
  registerCommandSelector(selector) {
    this._selectors.set(selector.id, selector);
    this._onDidRegisterCommandSelector.fire(selector);
    const pendingProvider = this._pendingProviders.get(selector.id);
    if (pendingProvider) {
      this._pendingProviders.delete(selector.id);
      this._providers.set(selector.id, pendingProvider);
      this._onDidRegisterProvider.fire({ selector, provider: pendingProvider });
    }
  }
  registerQuickFixProvider(id2, provider) {
    let disposed = false;
    this.extensionQuickFixes.then(() => {
      if (disposed) {
        return;
      }
      const selector = this._selectors.get(id2);
      if (selector) {
        this._providers.set(id2, provider);
        this._onDidRegisterProvider.fire({ selector, provider });
      } else {
        this._pendingProviders.set(id2, provider);
      }
    });
    return toDisposable(() => {
      disposed = true;
      this._providers.delete(id2);
      this._pendingProviders.delete(id2);
      const selector = this._selectors.get(id2);
      if (selector) {
        this._selectors.delete(id2);
        this._onDidUnregisterProvider.fire(selector.id);
      }
    });
  }
};

var quickFixExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "terminalQuickFixes",
  defaultExtensionKind: ["workspace"],
  activationEventsGenerator: function* (terminalQuickFixes) {
    for (const quickFixContrib of terminalQuickFixes ?? []) {
      yield `onTerminalQuickFixRequest:${quickFixContrib.id}`;
    }
  },
  jsonSchema: {
    description: localize(20818, null),
    type: "array",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["id", "commandLineMatcher", "outputMatcher", "commandExitResult"],
      defaultSnippets: [{
        body: {
          id: "$1",
          commandLineMatcher: "$2",
          outputMatcher: "$3",
          exitStatus: "$4"
        }
      }],
      properties: {
        id: {
          description: localize(20821, null),
          type: "string"
        },
        commandLineMatcher: {
          description: localize(20820, null),
          type: "string"
        },
        outputMatcher: {
          markdownDescription: localize(20823, null),
          type: "object",
          required: ["lineMatcher", "anchor", "offset", "length"],
          properties: {
            lineMatcher: {
              description: "A regular expression or string to test the command line against",
              type: "string"
            },
            anchor: {
              description: "Where the search should begin in the buffer",
              enum: ["top", "bottom"]
            },
            offset: {
              description: "The number of lines vertically from the anchor in the buffer to start matching against",
              type: "number"
            },
            length: {
              description: "The number of rows to match against, this should be as small as possible for performance reasons",
              type: "number"
            }
          }
        },
        commandExitResult: {
          description: localize(20819, null),
          enum: ["success", "error"],
          enumDescriptions: [
            "The command exited with an exit code of zero.",
            "The command exited with a non-zero exit code."
          ]
        },
        kind: {
          description: localize(20822, null, '`"fix"`'),
          enum: ["default", "explain"],
          enumDescriptions: [
            "A high confidence quick fix.",
            "An explanation of the problem."
          ]
        }
      }
    }
  }
});
export { TerminalQuickFixService, quickFixExtensionPoint };
