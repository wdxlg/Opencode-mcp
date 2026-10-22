// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/breadcrumbs.ts
import { createDecorator } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Emitter } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/browser/parts/editor/breadcrumbs.ts
var IBreadcrumbsService = createDecorator("IEditorBreadcrumbsService");

var BreadcrumbsService = class {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  register(group2, widget) {
    if (this._map.has(group2)) {
      throw new Error(`group (${group2}) has already a widget`);
    }
    this._map.set(group2, widget);
    return {
      dispose: () => this._map.delete(group2)
    };
  }
  getWidget(group2) {
    return this._map.get(group2);
  }
};

registerSingleton(IBreadcrumbsService, BreadcrumbsService, 1 /* Delayed */);

var BreadcrumbsConfig = class _BreadcrumbsConfig {
  constructor() {
  }
  static {
    this.IsEnabled = _BreadcrumbsConfig._stub("breadcrumbs.enabled");
  }
  static {
    this.UseQuickPick = _BreadcrumbsConfig._stub("breadcrumbs.useQuickPick");
  }
  static {
    this.FilePath = _BreadcrumbsConfig._stub("breadcrumbs.filePath");
  }
  static {
    this.SymbolPath = _BreadcrumbsConfig._stub("breadcrumbs.symbolPath");
  }
  static {
    this.SymbolSortOrder = _BreadcrumbsConfig._stub("breadcrumbs.symbolSortOrder");
  }
  static {
    this.SymbolPathSeparator = _BreadcrumbsConfig._stub("breadcrumbs.symbolPathSeparator");
  }
  static {
    this.Icons = _BreadcrumbsConfig._stub("breadcrumbs.icons");
  }
  static {
    this.ShowEditorType = _BreadcrumbsConfig._stub("breadcrumbs.showEditorType");
  }
  static {
    this.TitleScrollbarSizing = _BreadcrumbsConfig._stub("workbench.editor.titleScrollbarSizing");
  }
  static {
    this.TitleScrollbarVisibility = _BreadcrumbsConfig._stub("workbench.editor.titleScrollbarVisibility");
  }
  static {
    this.FileExcludes = _BreadcrumbsConfig._stub("files.exclude");
  }
  static _stub(name) {
    return {
      bindTo(service) {
        const onDidChange = new Emitter();
        const listener = service.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(name)) {
            onDidChange.fire(void 0);
          }
        });
        return new class {
          constructor() {
            this.name = name;
            this.onDidChange = onDidChange.event;
          }
          getValue(overrides) {
            if (overrides) {
              return service.getValue(name, overrides);
            } else {
              return service.getValue(name);
            }
          }
          updateValue(newValue, overrides) {
            if (overrides) {
              return service.updateValue(name, newValue, overrides);
            } else {
              return service.updateValue(name, newValue);
            }
          }
          dispose() {
            listener.dispose();
            onDidChange.dispose();
          }
        }();
      }
    };
  }
};

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "breadcrumbs",
  title: localize(6318, null),
  order: 101,
  type: "object",
  properties: {
    "breadcrumbs.enabled": {
      description: localize(6276, null),
      type: "boolean",
      default: true,
      agentsWindow: { default: true }
    },
    "breadcrumbs.filePath": {
      description: localize(6277, null),
      type: "string",
      default: "on",
      enum: ["on", "off", "last"],
      enumDescriptions: [
        localize(6280, null),
        localize(6279, null),
        localize(6278, null)
      ]
    },
    "breadcrumbs.symbolPath": {
      description: localize(6309, null),
      type: "string",
      default: "on",
      enum: ["on", "off", "last"],
      enumDescriptions: [
        localize(6312, null),
        localize(6311, null),
        localize(6310, null)
      ]
    },
    "breadcrumbs.symbolSortOrder": {
      description: localize(6314, null),
      type: "string",
      default: "position",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      enum: ["position", "name", "type"],
      enumDescriptions: [
        localize(6316, null),
        localize(6315, null),
        localize(6317, null)
      ]
    },
    "breadcrumbs.icons": {
      description: localize(6307, null),
      type: "boolean",
      default: true
    },
    "breadcrumbs.showEditorType": {
      markdownDescription: localize(6308, null),
      type: "boolean",
      default: true,
      tags: ["experimental"]
    },
    "breadcrumbs.symbolPathSeparator": {
      description: localize(6313, null),
      type: "string",
      default: ".",
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "breadcrumbs.showFiles": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6290, null)
    },
    "breadcrumbs.showModules": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6295, null)
    },
    "breadcrumbs.showNamespaces": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6296, null)
    },
    "breadcrumbs.showPackages": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6301, null)
    },
    "breadcrumbs.showClasses": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6283, null)
    },
    "breadcrumbs.showMethods": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6294, null)
    },
    "breadcrumbs.showProperties": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6302, null)
    },
    "breadcrumbs.showFields": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6289, null)
    },
    "breadcrumbs.showConstructors": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6285, null)
    },
    "breadcrumbs.showEnums": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6286, null)
    },
    "breadcrumbs.showInterfaces": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6292, null)
    },
    "breadcrumbs.showFunctions": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6291, null)
    },
    "breadcrumbs.showVariables": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6306, null)
    },
    "breadcrumbs.showConstants": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6284, null)
    },
    "breadcrumbs.showStrings": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6303, null)
    },
    "breadcrumbs.showNumbers": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6298, null)
    },
    "breadcrumbs.showBooleans": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6282, null)
    },
    "breadcrumbs.showArrays": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6281, null)
    },
    "breadcrumbs.showObjects": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6299, null)
    },
    "breadcrumbs.showKeys": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6293, null)
    },
    "breadcrumbs.showNull": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6297, null)
    },
    "breadcrumbs.showEnumMembers": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6287, null)
    },
    "breadcrumbs.showStructs": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6304, null)
    },
    "breadcrumbs.showEvents": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6288, null)
    },
    "breadcrumbs.showOperators": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6300, null)
    },
    "breadcrumbs.showTypeParameters": {
      type: "boolean",
      default: true,
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(6305, null)
    }
  }
});
export { IBreadcrumbsService, BreadcrumbsService, BreadcrumbsConfig };
