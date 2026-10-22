// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/quickAccess.ts
import { Disposable, DisposableStore, isDisposable, toDisposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/platform/quickinput/browser/quickAccess.ts
var QuickAccessController = class extends Disposable {
  constructor(quickInputService, instantiationService, contextKeyService) {
    super();
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.registry = Registry.as(Extensions18.Quickaccess);
    this.mapProviderToDescriptor = /* @__PURE__ */ new Map();
    this.lastAcceptedPickerValues = /* @__PURE__ */ new Map();
    this.visibleQuickAccess = void 0;
    this._register(toDisposable(() => {
      for (const provider of this.mapProviderToDescriptor.values()) {
        if (isDisposable(provider)) {
          provider.dispose();
        }
      }
      this.visibleQuickAccess?.picker.dispose();
    }));
  }
  pick(value2 = "", options3) {
    return this.doShowOrPick(value2, true, options3);
  }
  show(value2 = "", options3) {
    this.doShowOrPick(value2, false, options3);
  }
  doShowOrPick(value2, pick, options3) {
    const [provider, descriptor] = this.getOrInstantiateProvider(value2, options3?.enabledProviderPrefixes);
    const visibleQuickAccess = this.visibleQuickAccess;
    const visibleDescriptor = visibleQuickAccess?.descriptor;
    if (visibleQuickAccess && descriptor && visibleDescriptor === descriptor) {
      if (value2 !== descriptor.prefix && !options3?.preserveValue) {
        visibleQuickAccess.picker.value = value2;
      }
      this.adjustValueSelection(visibleQuickAccess.picker, descriptor, options3);
      return;
    }
    if (descriptor && !options3?.preserveValue) {
      let newValue = void 0;
      if (visibleQuickAccess && visibleDescriptor && visibleDescriptor !== descriptor) {
        const newValueCandidateWithoutPrefix = visibleQuickAccess.value.substr(visibleDescriptor.prefix.length);
        if (newValueCandidateWithoutPrefix) {
          newValue = `${descriptor.prefix}${newValueCandidateWithoutPrefix}`;
        }
      }
      if (!newValue) {
        const defaultFilterValue = provider?.defaultFilterValue;
        if (defaultFilterValue === 1 /* LAST */) {
          newValue = this.lastAcceptedPickerValues.get(descriptor);
        } else if (typeof defaultFilterValue === "string") {
          newValue = `${descriptor.prefix}${defaultFilterValue}`;
        }
      }
      if (typeof newValue === "string") {
        value2 = newValue;
      }
    }
    const visibleSelection = visibleQuickAccess?.picker?.valueSelection;
    const visibleValue = visibleQuickAccess?.picker?.value;
    const disposables = new DisposableStore();
    const picker = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    picker.value = value2;
    this.adjustValueSelection(picker, descriptor, options3);
    picker.placeholder = options3?.placeholder ?? descriptor?.placeholder;
    picker.quickNavigate = options3?.quickNavigateConfiguration;
    picker.hideInput = !!picker.quickNavigate && !visibleQuickAccess;
    if (typeof options3?.itemActivation === "number" || options3?.quickNavigateConfiguration) {
      picker.itemActivation = options3?.itemActivation ?? 2 /* SECOND */;
    }
    picker.contextKey = descriptor?.contextKey;
    picker.filterValue = (value3) => value3.substring(descriptor ? descriptor.prefix.length : 0);
    let pickPromise = void 0;
    if (pick) {
      pickPromise = new DeferredPromise();
      disposables.add(Event2.once(picker.onWillAccept)((e) => {
        e.veto();
        picker.hide();
      }));
    }
    disposables.add(this.registerPickerListeners(picker, provider, descriptor, value2, options3));
    const cts = disposables.add(new CancellationTokenSource());
    if (provider) {
      disposables.add(provider.provide(picker, cts.token, options3?.providerOptions));
    }
    Event2.once(picker.onDidHide)(() => {
      if (picker.selectedItems.length === 0) {
        cts.cancel();
      }
      disposables.dispose();
      pickPromise?.complete(picker.selectedItems.slice(0));
    });
    picker.show();
    if (visibleSelection && visibleValue === value2) {
      picker.valueSelection = visibleSelection;
    }
    if (pick) {
      return pickPromise?.p;
    }
  }
  adjustValueSelection(picker, descriptor, options3) {
    let valueSelection;
    if (options3?.preserveValue) {
      valueSelection = [picker.value.length, picker.value.length];
    } else {
      valueSelection = [descriptor?.prefix.length ?? 0, picker.value.length];
    }
    picker.valueSelection = valueSelection;
  }
  registerPickerListeners(picker, provider, descriptor, value2, options3) {
    const disposables = new DisposableStore();
    const visibleQuickAccess = this.visibleQuickAccess = { picker, descriptor, value: value2 };
    disposables.add(toDisposable(() => {
      if (visibleQuickAccess === this.visibleQuickAccess) {
        this.visibleQuickAccess = void 0;
      }
    }));
    disposables.add(picker.onDidChangeValue((value3) => {
      const [providerForValue] = this.getOrInstantiateProvider(value3, options3?.enabledProviderPrefixes);
      if (providerForValue !== provider) {
        this.show(value3, {
          enabledProviderPrefixes: options3?.enabledProviderPrefixes,
          // do not rewrite value from user typing!
          preserveValue: true,
          // persist the value of the providerOptions from the original showing
          providerOptions: options3?.providerOptions
        });
      } else {
        visibleQuickAccess.value = value3;
      }
    }));
    if (descriptor) {
      disposables.add(picker.onDidAccept(() => {
        this.lastAcceptedPickerValues.set(descriptor, picker.value);
      }));
    }
    return disposables;
  }
  getOrInstantiateProvider(value2, enabledProviderPrefixes) {
    const providerDescriptor = this.registry.getQuickAccessProvider(value2, this.contextKeyService);
    if (!providerDescriptor || enabledProviderPrefixes && !enabledProviderPrefixes?.includes(providerDescriptor.prefix)) {
      return [void 0, void 0];
    }
    let provider = this.mapProviderToDescriptor.get(providerDescriptor);
    if (!provider) {
      provider = this.instantiationService.createInstance(providerDescriptor.ctor);
      this.mapProviderToDescriptor.set(providerDescriptor, provider);
    }
    return [provider, providerDescriptor];
  }
};

QuickAccessController = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService)
], QuickAccessController);
export { QuickAccessController };
