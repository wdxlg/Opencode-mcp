// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/sandboxPicker.ts
import { Disposable } from "./module-0012.mjs";
import { CheckboxChip } from "./module-3703.mjs";
import { localize } from "./module-0001.mjs";
import { CloudSandboxEnabledSettingId, isCloudSandboxEnabled } from "./module-3675.mjs";
import { RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { autorun } from "./module-0052.mjs";
import { CopilotChatSessionsProvider, RemoteNewSession } from "./module-3689.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/sandboxPicker.ts
var SandboxPicker = class extends Disposable {
  constructor(_session, _configurationService, _sessionsProvidersService, _telemetryService) {
    super();
    this._session = _session;
    this._configurationService = _configurationService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._telemetryService = _telemetryService;
    this._hasRepository = false;
    this._chip = this._register(new CheckboxChip({
      label: localize(5084, null),
      ariaLabel: localize(5083, null),
      onToggle: (checked) => this._applyToggle(checked),
      slotClassName: "sessions-chat-sandbox-checkbox"
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(CloudSandboxEnabledSettingId) || e4.affectsConfiguration(RemoteAgentHostsEnabledSettingId)) {
        this._update();
      }
    }));
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      const providerSession = session ? this._getSession(session) : void 0;
      providerSession?.useSandbox.read(reader);
      this._hasRepository = providerSession instanceof RemoteNewSession && !!providerSession.repoNwo;
      this._update();
    }));
  }
  _getSession(session) {
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    return provider instanceof CopilotChatSessionsProvider ? provider.getSession(session.sessionId) : void 0;
  }
  _applyToggle(checked) {
    const session = this._session.get();
    const providerSession = session ? this._getSession(session) : void 0;
    if (!providerSession) {
      return;
    }
    reportNewChatPickerClosed(this._telemetryService, {
      id: "NewChatSandboxPicker",
      name: "NewChatSandboxPicker",
      optionIdBefore: String(providerSession.useSandbox.get() === true),
      optionIdAfter: String(checked),
      optionLabelBefore: void 0,
      optionLabelAfter: void 0,
      isPII: false
    });
    providerSession.setUseSandbox(checked);
  }
  render(container2) {
    this._chip.render(container2);
    this._update();
  }
  _update() {
    const session = this._session.get();
    const providerSession = session ? this._getSession(session) : void 0;
    const enabled = isCloudSandboxEnabled(this._configurationService);
    this._chip.update({
      checked: enabled && providerSession?.useSandbox.get() === true,
      state: !enabled ? "hidden" : this._hasRepository ? "enabled" : "disabled",
      disabledReason: this._hasRepository ? void 0 : localize(5085, null)
    });
  }
};

SandboxPicker = __decorateClass([
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITelemetryService)
], SandboxPicker);
export { SandboxPicker };
