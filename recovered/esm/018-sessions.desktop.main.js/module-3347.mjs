// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/authentication.contribution.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions11 } from "./module-0879.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { ManageAccountsAction } from "./module-3346.mjs";
import { SignOutOfAccountAction } from "./module-3340.mjs";
import { ManageTrustedExtensionsForAccountAction } from "./module-3341.mjs";
import { ManageAccountPreferencesForExtensionAction } from "./module-3342.mjs";
import { ManageTrustedMcpServersForAccountAction } from "./module-3344.mjs";
import { ManageAccountPreferencesForMcpServerAction } from "./module-3343.mjs";
import { RemoveDynamicAuthenticationProvidersAction } from "./module-3345.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationUsageService } from "./module-1415.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/authentication/browser/authentication.contribution.ts
var codeExchangeProxyCommand = CommandsRegistry.registerCommand("workbench.getCodeExchangeProxyEndpoints", function(accessor, _) {
  const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
  return environmentService.options?.codeExchangeProxyEndpoints;
});

var AuthenticationDataRenderer = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = "table";
  }
  shouldRender(manifest) {
    return !!manifest.contributes?.authentication;
  }
  render(manifest) {
    const authentication = manifest.contributes?.authentication || [];
    if (!authentication.length) {
      return { data: { headers: [], rows: [] }, dispose: () => {
      } };
    }
    const headers = [
      localize(7971, null),
      localize(7970, null),
      localize(7972, null)
    ];
    const rows = authentication.sort((a, b) => a.label.localeCompare(b.label)).map((auth) => {
      return [
        auth.label,
        auth.id,
        (auth.authorizationServerGlobs ?? []).join(",\n")
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: () => {
      }
    };
  }
};

var extensionFeature = Registry.as(Extensions11.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "authentication",
  label: localize(7969, null),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(AuthenticationDataRenderer)
});

var AuthenticationContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.authentication";
  }
  constructor() {
    super();
    this._register(codeExchangeProxyCommand);
    this._register(extensionFeature);
    this._registerActions();
  }
  _registerActions() {
    this._register(registerAction2(ManageAccountsAction));
    this._register(registerAction2(SignOutOfAccountAction));
    this._register(registerAction2(ManageTrustedExtensionsForAccountAction));
    this._register(registerAction2(ManageAccountPreferencesForExtensionAction));
    this._register(registerAction2(ManageTrustedMcpServersForAccountAction));
    this._register(registerAction2(ManageAccountPreferencesForMcpServerAction));
    this._register(registerAction2(RemoveDynamicAuthenticationProvidersAction));
  }
};

var AuthenticationUsageContribution = class {
  constructor(_authenticationUsageService) {
    this._authenticationUsageService = _authenticationUsageService;
    this._initializeExtensionUsageCache();
  }
  static {
    this.ID = "workbench.contrib.authenticationUsage";
  }
  async _initializeExtensionUsageCache() {
    await this._authenticationUsageService.initializeExtensionUsageCache();
  }
};

AuthenticationUsageContribution = __decorateClass([
  __decorateParam(0, IAuthenticationUsageService)
], AuthenticationUsageContribution);

registerWorkbenchContribution2(AuthenticationContribution.ID, AuthenticationContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AuthenticationUsageContribution.ID, AuthenticationUsageContribution, WorkbenchPhase.Eventually);
export { codeExchangeProxyCommand, AuthenticationDataRenderer, extensionFeature, AuthenticationContribution, AuthenticationUsageContribution };
