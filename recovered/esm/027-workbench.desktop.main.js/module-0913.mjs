// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/statusBarExtensionPoint.ts
import { createDecorator } from "./module-0077.mjs";
import { Emitter } from "./module-0017.mjs";
import { getCodiconAriaLabel } from "./module-0461.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { STATUS_BAR_ERROR_ITEM_BACKGROUND, STATUS_BAR_WARNING_ITEM_BACKGROUND } from "./module-0912.mjs";
import { hash } from "./module-0039.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { isAccessibilityInformation } from "./module-0104.mjs";
import { localize } from "./module-0001.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { isProposedApiEnabled } from "./module-0887.mjs";
import { Iterable } from "./module-0011.mjs";
import { asStatusBarItemIdentifier } from "./module-0911.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";


// src/vs/workbench/api/browser/statusBarExtensionPoint.ts
var IExtensionStatusBarItemService = createDecorator("IExtensionStatusBarItemService");

var ExtensionStatusBarItemService = class {
  constructor(_statusbarService) {
    this._statusbarService = _statusbarService;
    this._entries = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  dispose() {
    this._entries.forEach((entry) => entry.accessor.dispose());
    this._entries.clear();
    this._onDidChange.dispose();
  }
  setOrUpdateEntry(entryId, id2, extensionId, name, text2, tooltip, command4, color2, backgroundColor, alignLeft, priority, accessibilityInformation) {
    let ariaLabel;
    let role = void 0;
    if (accessibilityInformation) {
      ariaLabel = accessibilityInformation.label;
      role = accessibilityInformation.role;
    } else {
      ariaLabel = getCodiconAriaLabel(text2);
      if (typeof tooltip === "string" || isMarkdownString(tooltip)) {
        const tooltipString = typeof tooltip === "string" ? tooltip : tooltip.value;
        ariaLabel += `, ${tooltipString}`;
      }
    }
    let kind = void 0;
    switch (backgroundColor?.id) {
      case STATUS_BAR_ERROR_ITEM_BACKGROUND:
      case STATUS_BAR_WARNING_ITEM_BACKGROUND:
        kind = backgroundColor.id === STATUS_BAR_ERROR_ITEM_BACKGROUND ? "error" : "warning";
        color2 = void 0;
        backgroundColor = void 0;
    }
    const entry = { name, text: text2, tooltip, command: command4, color: color2, backgroundColor, ariaLabel, role, kind, extensionId };
    if (typeof priority === "undefined") {
      priority = 0;
    }
    let alignment = alignLeft ? 0 /* LEFT */ : 1 /* RIGHT */;
    const existingEntry = this._entries.get(entryId);
    if (existingEntry) {
      alignment = existingEntry.alignment;
      priority = existingEntry.priority;
    }
    if (!existingEntry) {
      let entryPriority;
      if (typeof extensionId === "string") {
        entryPriority = { primary: priority, secondary: hash(extensionId) };
      } else {
        entryPriority = priority;
      }
      const accessor = this._statusbarService.addEntry(entry, id2, alignment, entryPriority);
      this._entries.set(entryId, {
        accessor,
        entry,
        alignment,
        priority,
        disposable: toDisposable(() => {
          accessor.dispose();
          this._entries.delete(entryId);
          this._onDidChange.fire({ removed: entryId });
        })
      });
      this._onDidChange.fire({ added: [entryId, { entry, alignment, priority }] });
      return 0 /* DidDefine */;
    } else {
      existingEntry.accessor.update(entry);
      existingEntry.entry = entry;
      return 1 /* DidUpdate */;
    }
  }
  unsetEntry(entryId) {
    this._entries.get(entryId)?.disposable.dispose();
    this._entries.delete(entryId);
  }
  getEntries() {
    return this._entries.entries();
  }
};

ExtensionStatusBarItemService = __decorateClass([
  __decorateParam(0, IStatusbarService)
], ExtensionStatusBarItemService);

registerSingleton(IExtensionStatusBarItemService, ExtensionStatusBarItemService, 1 /* Delayed */);

function isUserFriendlyStatusItemEntry(candidate) {
  const obj = candidate;
  return typeof obj.id === "string" && obj.id.length > 0 && typeof obj.name === "string" && typeof obj.text === "string" && (obj.alignment === "left" || obj.alignment === "right") && (obj.command === void 0 || typeof obj.command === "string") && (obj.tooltip === void 0 || typeof obj.tooltip === "string") && (obj.priority === void 0 || typeof obj.priority === "number") && (obj.accessibilityInformation === void 0 || isAccessibilityInformation(obj.accessibilityInformation));
}

var statusBarItemSchema = {
  type: "object",
  required: ["id", "text", "alignment", "name"],
  properties: {
    id: {
      type: "string",
      markdownDescription: localize(5751, null)
    },
    name: {
      type: "string",
      description: localize(5753, null)
    },
    text: {
      type: "string",
      description: localize(5755, null, "$(globe)")
    },
    tooltip: {
      type: "string",
      description: localize(5756, null)
    },
    command: {
      type: "string",
      description: localize(5750, null)
    },
    alignment: {
      type: "string",
      enum: ["left", "right"],
      description: localize(5749, null)
    },
    priority: {
      type: "number",
      description: localize(5754, null)
    },
    accessibilityInformation: {
      type: "object",
      description: localize(5746, null),
      required: ["label"],
      properties: {
        role: {
          type: "string",
          description: localize(5748, null)
        },
        label: {
          type: "string",
          description: localize(5747, null)
        }
      }
    }
  }
};

var statusBarItemsSchema = {
  description: localize(5757, null),
  oneOf: [
    statusBarItemSchema,
    {
      type: "array",
      items: statusBarItemSchema
    }
  ]
};

var statusBarItemsExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "statusBarItems",
  jsonSchema: statusBarItemsSchema
});

var StatusBarItemsExtensionPoint = class {
  constructor(statusBarItemsService) {
    const contributions = new DisposableStore();
    statusBarItemsExtensionPoint.setHandler((extensions) => {
      contributions.clear();
      for (const entry of extensions) {
        if (!isProposedApiEnabled(entry.description, "contribStatusBarItems")) {
          entry.collector.error(`The ${statusBarItemsExtensionPoint.name} is proposed API`);
          continue;
        }
        const { value: value2, collector } = entry;
        for (const candidate of Iterable.wrap(value2)) {
          if (!isUserFriendlyStatusItemEntry(candidate)) {
            collector.error(localize(5752, null));
            continue;
          }
          const fullItemId = asStatusBarItemIdentifier(entry.description.identifier, candidate.id);
          const kind = statusBarItemsService.setOrUpdateEntry(
            fullItemId,
            fullItemId,
            ExtensionIdentifier.toKey(entry.description.identifier),
            candidate.name ?? entry.description.displayName ?? entry.description.name,
            candidate.text,
            candidate.tooltip,
            candidate.command ? { id: candidate.command, title: candidate.name } : void 0,
            void 0,
            void 0,
            candidate.alignment === "left",
            candidate.priority,
            candidate.accessibilityInformation
          );
          if (kind === 0 /* DidDefine */) {
            contributions.add(toDisposable(() => statusBarItemsService.unsetEntry(fullItemId)));
          }
        }
      }
    });
  }
};

StatusBarItemsExtensionPoint = __decorateClass([
  __decorateParam(0, IExtensionStatusBarItemService)
], StatusBarItemsExtensionPoint);
export { isUserFriendlyStatusItemEntry, IExtensionStatusBarItemService, ExtensionStatusBarItemService, statusBarItemSchema, statusBarItemsSchema, statusBarItemsExtensionPoint, StatusBarItemsExtensionPoint };
