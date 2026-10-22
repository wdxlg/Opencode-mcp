// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/editSessionIdentityService.ts
import { toDisposable } from "./module-0012.mjs";
import { insert } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IEditSessionIdentityService } from "./module-1256.mjs";


// src/vs/workbench/services/workspaces/common/editSessionIdentityService.ts
var EditSessionIdentityService = class {
  constructor(_extensionService, _logService) {
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._editSessionIdentifierProviders = /* @__PURE__ */ new Map();
    this._participants = [];
  }
  registerEditSessionIdentityProvider(provider) {
    if (this._editSessionIdentifierProviders.get(provider.scheme)) {
      throw new Error(`A provider has already been registered for scheme ${provider.scheme}`);
    }
    this._editSessionIdentifierProviders.set(provider.scheme, provider);
    return toDisposable(() => {
      this._editSessionIdentifierProviders.delete(provider.scheme);
    });
  }
  async getEditSessionIdentifier(workspaceFolder, token) {
    const { scheme } = workspaceFolder.uri;
    const provider = await this.activateProvider(scheme);
    this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
    return provider?.getEditSessionIdentifier(workspaceFolder, token);
  }
  async provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
    const { scheme } = workspaceFolder.uri;
    const provider = await this.activateProvider(scheme);
    this._logService.trace(`EditSessionIdentityProvider for scheme ${scheme} available: ${!!provider}`);
    return provider?.provideEditSessionIdentityMatch?.(workspaceFolder, identity1, identity2, cancellationToken);
  }
  async onWillCreateEditSessionIdentity(workspaceFolder, cancellationToken) {
    this._logService.debug("Running onWillCreateEditSessionIdentity participants...");
    for (const participant of this._participants) {
      await participant.participate(workspaceFolder, cancellationToken);
    }
    this._logService.debug(`Done running ${this._participants.length} onWillCreateEditSessionIdentity participants.`);
  }
  addEditSessionIdentityCreateParticipant(participant) {
    const dispose2 = insert(this._participants, participant);
    return toDisposable(() => dispose2());
  }
  async activateProvider(scheme) {
    const transformedScheme = scheme === "vscode-remote" ? "file" : scheme;
    const provider = this._editSessionIdentifierProviders.get(scheme);
    if (provider) {
      return provider;
    }
    await this._extensionService.activateByEvent(`onEditSession:${transformedScheme}`);
    return this._editSessionIdentifierProviders.get(scheme);
  }
};

EditSessionIdentityService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILogService)
], EditSessionIdentityService);

registerSingleton(IEditSessionIdentityService, EditSessionIdentityService, 1 /* Delayed */);
export { EditSessionIdentityService };
