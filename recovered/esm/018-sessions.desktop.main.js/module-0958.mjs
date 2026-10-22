// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/policies/common/accountPolicyService.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { AbstractPolicyService, getRestrictedPolicyValue } from "./module-0957.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";
import { collectManagedSettingsDefinitions, hasManagedSettingsDefinitions, pickManagedSettings, projectManagedSettings } from "./module-0956.mjs";
import { isManagedSettingsFreshnessBlocking } from "./module-0740.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";


// src/vs/workbench/services/policies/common/accountPolicyService.ts
var APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME = "ChatApprovedAccountOrganizations";

var ChatAccountPolicyGateActiveContext = new RawContextKey(
  "chatAccountPolicyGateActive",
  false,
  { type: "boolean", description: localize(23274, null) }
);

var IAccountPolicyGateService = createDecorator("accountPolicyGateService");

var AccountPolicyService = class extends AbstractPolicyService {
  constructor(logService, defaultAccountService, managedPolicyService, nativeManagedSettingsService, fileManagedSettingsService) {
    super();
    this.logService = logService;
    this.defaultAccountService = defaultAccountService;
    this._gateInfo = { state: "inactive" /* Inactive */ };
    this._onDidChangeGateInfo = this._register(new Emitter());
    this.onDidChangeGateInfo = this._onDidChangeGateInfo.event;
    this._managedSettings = {};
    this._onDidChangeManagedSettings = this._register(new Emitter());
    this.onDidChangeManagedSettings = this._onDidChangeManagedSettings.event;
    this.managedPolicyReader = managedPolicyService;
    this.nativeManagedSettingsService = nativeManagedSettingsService;
    this.fileManagedSettingsService = fileManagedSettingsService;
    this._updatePolicyDefinitions(this.policyDefinitions);
    this._register(this.defaultAccountService.onDidChangePolicyData(() => {
      this._updatePolicyDefinitions(this.policyDefinitions);
    }));
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => {
      this._updatePolicyDefinitions(this.policyDefinitions);
    }));
    this._register(this.defaultAccountService.onDidChangeManagedSettingsFreshness(() => {
      this._updatePolicyDefinitions(this.policyDefinitions);
    }));
    if (this.managedPolicyReader) {
      this._register(this.managedPolicyReader.onDidChange((names) => {
        if (names.includes(APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME)) {
          this._updatePolicyDefinitions(this.policyDefinitions);
        }
      }));
    }
    if (this.nativeManagedSettingsService) {
      this._register(this.nativeManagedSettingsService.onDidChangeManagedSettings(() => {
        this._updatePolicyDefinitions(this.policyDefinitions);
      }));
    }
    if (this.fileManagedSettingsService) {
      this._register(this.fileManagedSettingsService.onDidChangeManagedSettings(() => {
        this._updatePolicyDefinitions(this.policyDefinitions);
      }));
    }
    this.defaultAccountService.getDefaultAccount().then(() => {
      this._updatePolicyDefinitions(this.policyDefinitions);
    });
  }
  get gateInfo() {
    return this._gateInfo;
  }
  getManagedSettingValue(key3) {
    return this._managedSettings[key3];
  }
  async _updatePolicyDefinitions(policyDefinitions) {
    this.logService.trace(`AccountPolicyService#_updatePolicyDefinitions: Got ${Object.keys(policyDefinitions).length} policy definitions`);
    const managedSettings = await this.updateCopilotManagedSettingDefinitions(policyDefinitions);
    const updated = [];
    const resolvedPolicyData = this.getPolicyData(managedSettings);
    const previousInfo = this._gateInfo;
    this._gateInfo = this.computeGateInfo();
    const gateInfoChanged = !equals4(previousInfo, this._gateInfo);
    const gateRestricted = this._gateInfo.state === "restricted" /* Restricted */ && this._gateInfo.reason !== "policyNotResolved" /* PolicyNotResolved */;
    for (const key3 in policyDefinitions) {
      const resolvedPolicy = this.resolvePolicyValue(policyDefinitions[key3], resolvedPolicyData, gateRestricted);
      if (this.updatePolicyValue(key3, resolvedPolicy?.value, resolvedPolicy?.source)) {
        updated.push(key3);
      }
    }
    if (updated.length) {
      this._onDidChange.fire(updated);
    }
    if (gateInfoChanged) {
      this._onDidChangeGateInfo.fire(this._gateInfo);
    }
  }
  resolvePolicyValue(policy, resolvedPolicyData, gateRestricted) {
    if (gateRestricted && (policy.value !== void 0 || policy.restrictedValue !== void 0)) {
      return { value: getRestrictedPolicyValue(policy), source: "accountGate" /* AccountGate */ };
    }
    const valueProvider = policy.value;
    if (!resolvedPolicyData || !valueProvider) {
      return void 0;
    }
    const { policyData, managedSettingResolutions } = resolvedPolicyData;
    const value2 = valueProvider(policyData);
    if (value2 === void 0) {
      return void 0;
    }
    let source = "account" /* Account */;
    if (policy.managedSettings) {
      const managedSettings = policyData.managedSettings ?? {};
      const appliedKeys = Object.keys(policy.managedSettings).filter((key3) => Object.hasOwn(managedSettings, key3));
      if (appliedKeys.length > 0) {
        const withoutManagedSettingKeys = (keys) => ({
          ...policyData,
          managedSettings: Object.fromEntries(Object.entries(managedSettings).filter(([key3]) => !keys.has(key3)))
        });
        const allAppliedKeys = new Set(appliedKeys);
        if (valueProvider(withoutManagedSettingKeys(allAppliedKeys)) !== value2) {
          const contributingChannels = /* @__PURE__ */ new Set();
          for (const key3 of appliedKeys) {
            const channel = managedSettingResolutions.get(key3)?.source;
            if (channel) {
              contributingChannels.add(channel);
            }
          }
          const causalChannels = /* @__PURE__ */ new Set();
          for (const channel of contributingChannels) {
            const channelKeys = new Set(appliedKeys.filter((key3) => managedSettingResolutions.get(key3)?.source === channel));
            if (valueProvider(withoutManagedSettingKeys(channelKeys)) !== value2) {
              causalChannels.add(channel);
            }
          }
          const channels = causalChannels.size > 0 ? causalChannels : contributingChannels;
          source = channels.size === 1 ? policyValueSourceForManagedSettingsChannel(Array.from(channels)[0]) : "mixedManagedSettings" /* MixedManagedSettings */;
        }
      }
    }
    if (source === "account" /* Account */ && policyData.managedSettingsActive === true && valueProvider({ ...policyData, managedSettingsActive: false }) !== value2) {
      const channels = /* @__PURE__ */ new Set();
      for (const resolution of managedSettingResolutions.values()) {
        channels.add(resolution.source);
      }
      if (channels.size > 0) {
        source = channels.size === 1 ? policyValueSourceForManagedSettingsChannel(Array.from(channels)[0]) : "mixedManagedSettings" /* MixedManagedSettings */;
      }
    }
    return { value: value2, source };
  }
  async updateCopilotManagedSettingDefinitions(policyDefinitions) {
    if (!this.nativeManagedSettingsService || !hasManagedSettingsDefinitions(policyDefinitions)) {
      return this.nativeManagedSettingsService?.managedSettings;
    }
    return this.nativeManagedSettingsService.updatePolicyDefinitions(policyDefinitions);
  }
  getPolicyData(mdmManagedSettings) {
    const accountPolicyData = this.defaultAccountService.policyData ?? void 0;
    const nativeManagedSettings = mdmManagedSettings ?? this.nativeManagedSettingsService?.managedSettings;
    const fileManagedSettings = this.fileManagedSettingsService?.managedSettings;
    const pick = pickManagedSettings(nativeManagedSettings, accountPolicyData?.managedSettings, fileManagedSettings);
    if (!equals4(this._managedSettings, pick.values)) {
      this._managedSettings = pick.values;
      this._onDidChangeManagedSettings.fire();
    }
    if (!accountPolicyData && pick.activeSources.length === 0) {
      return void 0;
    }
    const declaredManagedSettings = collectManagedSettingsDefinitions(this.policyDefinitions);
    const managedSettingsData = projectManagedSettings(
      pick.values,
      declaredManagedSettings,
      (msg) => this.logService.warn(`[AccountPolicy] ${msg}`)
    );
    return {
      policyData: {
        ...accountPolicyData,
        managedSettings: managedSettingsData,
        managedSettingsActive: pick.activeSources.length > 0
      },
      managedSettingResolutions: pick.resolutions
    };
  }
  computeGateInfo() {
    const freshness = this.defaultAccountService.managedSettingsFreshness;
    if (isManagedSettingsFreshnessBlocking(freshness)) {
      return {
        state: "restricted" /* Restricted */,
        reason: "managedSettingsRefresh" /* ManagedSettingsRefresh */,
        managedSettingsFreshness: freshness
      };
    }
    if (!this.managedPolicyReader) {
      return { state: "inactive" /* Inactive */ };
    }
    const approvedRaw = this.managedPolicyReader.getPolicyValue(APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME);
    const approvedOrgs = parseApprovedOrganizations(approvedRaw);
    if (approvedOrgs.length === 0) {
      return { state: "inactive" /* Inactive */ };
    }
    const account = this.defaultAccountService.currentDefaultAccount;
    if (!account) {
      return { state: "restricted" /* Restricted */, reason: "noAccount" /* NoAccount */, approvedOrganizations: approvedOrgs };
    }
    const configuredProvider = this.defaultAccountService.getDefaultAccountAuthenticationProvider();
    if (account.authenticationProvider.id !== configuredProvider.id) {
      return { state: "restricted" /* Restricted */, reason: "wrongProvider" /* WrongProvider */, approvedOrganizations: approvedOrgs };
    }
    if (!approvedOrgs.includes("*")) {
      const accountOrgs = (account.entitlementsData?.organization_login_list ?? []).map((o) => o.toLowerCase());
      const intersects4 = accountOrgs.some((org) => approvedOrgs.includes(org));
      if (!intersects4) {
        return { state: "restricted" /* Restricted */, reason: "orgNotApproved" /* OrgNotApproved */, approvedOrganizations: approvedOrgs };
      }
    }
    if (this.defaultAccountService.policyData === null) {
      return { state: "restricted" /* Restricted */, reason: "policyNotResolved" /* PolicyNotResolved */, approvedOrganizations: approvedOrgs };
    }
    return { state: "satisfied" /* Satisfied */, approvedOrganizations: approvedOrgs };
  }
};

AccountPolicyService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IDefaultAccountService)
], AccountPolicyService);

function policyValueSourceForManagedSettingsChannel(channel) {
  switch (channel) {
    case "nativeMdm":
      return "nativeMdm" /* NativeMdm */;
    case "server":
      return "serverManagedSettings" /* ServerManagedSettings */;
    case "file":
      return "fileManagedSettings" /* FileManagedSettings */;
  }
}

function parseApprovedOrganizations(raw) {
  let value2 = raw;
  if (typeof value2 === "string") {
    try {
      value2 = JSON.parse(value2);
    } catch {
    }
  }
  if (!Array.isArray(value2)) {
    return [];
  }
  return value2.filter((v2) => typeof v2 === "string").map((s) => s.trim().toLowerCase()).filter((s) => s.length > 0);
}
export { policyValueSourceForManagedSettingsChannel, parseApprovedOrganizations, APPROVED_ACCOUNT_ORGANIZATIONS_POLICY_NAME, ChatAccountPolicyGateActiveContext, IAccountPolicyGateService, AccountPolicyService };
