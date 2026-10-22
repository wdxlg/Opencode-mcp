// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageDynamicAuthenticationProvidersAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDynamicAuthenticationProviderStorageService } from "./module-1419.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageDynamicAuthenticationProvidersAction.ts
var RemoveDynamicAuthenticationProvidersAction = class _RemoveDynamicAuthenticationProvidersAction extends Action2 {
  static {
    this.ID = "workbench.action.removeDynamicAuthenticationProviders";
  }
  constructor() {
    super({
      id: _RemoveDynamicAuthenticationProvidersAction.ID,
      title: localize2(7937, "Remove Dynamic Authentication Providers"),
      category: localize2(7929, "Authentication"),
      f1: true
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const dynamicAuthStorageService = accessor.get(IDynamicAuthenticationProviderStorageService);
    const authenticationService = accessor.get(IAuthenticationService);
    const dialogService = accessor.get(IDialogService);
    const interactedProviders = dynamicAuthStorageService.getInteractedProviders();
    if (interactedProviders.length === 0) {
      await dialogService.info(
        localize(7934, null),
        localize(7935, null)
      );
      return;
    }
    const items = interactedProviders.map((provider) => ({
      label: provider.label,
      description: localize(7930, null, provider.clientId),
      provider
    }));
    const selected = await quickInputService.pick(items, {
      placeHolder: localize(7938, null),
      canPickMany: true
    });
    if (!selected || selected.length === 0) {
      return;
    }
    const providerNames = selected.map((item) => item.provider.label).join(", ");
    const message = selected.length === 1 ? localize(7933, null, providerNames) : localize(7932, null, selected.length, providerNames);
    const result = await dialogService.confirm({
      message,
      detail: localize(7931, null),
      primaryButton: localize(7936, null),
      type: "warning"
    });
    if (!result.confirmed) {
      return;
    }
    for (const item of selected) {
      const providerId = item.provider.providerId;
      if (authenticationService.isAuthenticationProviderRegistered(providerId)) {
        authenticationService.unregisterAuthenticationProvider(providerId);
      }
      await dynamicAuthStorageService.removeDynamicProvider(providerId);
    }
  }
};
export { RemoveDynamicAuthenticationProvidersAction };
