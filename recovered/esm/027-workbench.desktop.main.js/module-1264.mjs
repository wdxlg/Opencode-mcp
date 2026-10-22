// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadStatusBar.ts
import { Disposable, DisposableMap, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IExtensionStatusBarItemService } from "./module-0913.mjs";


// src/vs/workbench/api/browser/mainThreadStatusBar.ts
var MainThreadStatusBar = class extends Disposable {
  constructor(extHostContext, statusbarService) {
    super();
    this.statusbarService = statusbarService;
    this._entryDisposables = this._register(new DisposableMap());
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostStatusBar);
    const entries2 = [];
    for (const [entryId, item] of statusbarService.getEntries()) {
      entries2.push(asDto(entryId, item));
    }
    this._proxy.$acceptStaticEntries(entries2);
    this._register(statusbarService.onDidChange((e) => {
      if (e.added) {
        this._proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
      }
    }));
    function asDto(entryId, item) {
      return {
        entryId,
        name: item.entry.name,
        text: item.entry.text,
        tooltip: item.entry.tooltip,
        command: typeof item.entry.command === "string" ? item.entry.command : typeof item.entry.command === "object" ? item.entry.command.id : void 0,
        priority: item.priority,
        alignLeft: item.alignment === 0 /* LEFT */,
        accessibilityInformation: item.entry.ariaLabel ? { label: item.entry.ariaLabel, role: item.entry.role } : void 0
      };
    }
  }
  $setEntry(entryId, id2, extensionId, name, text2, tooltip, hasTooltipProvider, command4, color2, backgroundColor, alignLeft, priority, accessibilityInformation) {
    const tooltipOrTooltipProvider = hasTooltipProvider ? {
      markdown: (cancellation) => {
        return this._proxy.$provideTooltip(entryId, cancellation);
      },
      markdownNotSupportedFallback: void 0
    } : tooltip;
    const kind = this.statusbarService.setOrUpdateEntry(entryId, id2, extensionId, name, text2, tooltipOrTooltipProvider, command4, color2, backgroundColor, alignLeft, priority, accessibilityInformation);
    if (kind === 0 /* DidDefine */) {
      const disposable = toDisposable(() => this.statusbarService.unsetEntry(entryId));
      this._entryDisposables.set(entryId, disposable);
    }
  }
  $disposeEntry(entryId) {
    this._entryDisposables.deleteAndDispose(entryId);
  }
};

MainThreadStatusBar = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadStatusBar),
  __decorateParam(1, IExtensionStatusBarItemService)
], MainThreadStatusBar);
export { MainThreadStatusBar };
