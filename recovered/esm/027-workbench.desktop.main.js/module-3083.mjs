// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/helpQuickAccess.ts
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/platform/quickinput/browser/helpQuickAccess.ts
var HelpQuickAccessProvider = class {
  constructor(quickInputService, keybindingService, contextKeyService) {
    this.quickInputService = quickInputService;
    this.keybindingService = keybindingService;
    this.contextKeyService = contextKeyService;
    this.registry = Registry.as(Extensions18.Quickaccess);
  }
  static {
    this.PREFIX = "?";
  }
  provide(picker) {
    const disposables = new DisposableStore();
    disposables.add(picker.onDidAccept(() => {
      const [item] = picker.selectedItems;
      if (item) {
        this.quickInputService.quickAccess.show(item.prefix, { preserveValue: true });
      }
    }));
    disposables.add(picker.onDidChangeValue((value2) => {
      const providerDescriptor = this.registry.getQuickAccessProvider(value2.substr(HelpQuickAccessProvider.PREFIX.length), this.contextKeyService);
      if (providerDescriptor?.prefix && providerDescriptor.prefix !== HelpQuickAccessProvider.PREFIX) {
        this.quickInputService.quickAccess.show(providerDescriptor.prefix, { preserveValue: true });
      }
    }));
    picker.items = this.getQuickAccessProviders().filter((p) => p.prefix !== HelpQuickAccessProvider.PREFIX);
    return disposables;
  }
  getQuickAccessProviders() {
    const providers2 = this.registry.getQuickAccessProviders(this.contextKeyService).sort((providerA, providerB) => providerA.prefix.localeCompare(providerB.prefix)).flatMap((provider) => this.createPicks(provider));
    return providers2;
  }
  createPicks(provider) {
    return provider.helpEntries.map((helpEntry) => {
      const prefix = helpEntry.prefix || provider.prefix;
      const label3 = prefix || "\u2026";
      return {
        prefix,
        label: label3,
        keybinding: helpEntry.commandId ? this.keybindingService.lookupKeybinding(helpEntry.commandId) : void 0,
        ariaLabel: localize(3189, null, label3, helpEntry.description),
        description: helpEntry.description
      };
    });
  }
};

HelpQuickAccessProvider = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextKeyService)
], HelpQuickAccessProvider);
export { HelpQuickAccessProvider };
