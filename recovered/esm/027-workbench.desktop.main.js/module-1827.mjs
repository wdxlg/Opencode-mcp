// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/policies/browser/policyTelemetry.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPolicyService } from "./module-0956.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/services/policies/browser/policyTelemetry.contribution.ts
var PolicyTelemetryContribution = class extends Disposable {
  constructor(policyService, telemetryService) {
    super();
    this.policyService = policyService;
    this.telemetryService = telemetryService;
    this.scheduler = this._register(new RunOnceScheduler(() => this.report(), 500));
    this.scheduler.schedule();
    this._register(this.policyService.onDidChange(() => this.scheduler.schedule()));
  }
  static {
    this.ID = "workbench.contrib.policyTelemetry";
  }
  report() {
    const event = this.buildEvent();
    const signature = JSON.stringify(event);
    if (signature === this.lastSignature) {
      return;
    }
    this.lastSignature = signature;
    this.telemetryService.publicLog2("policy.applied", event);
  }
  buildEvent() {
    const value2 = (name) => this.policyService.getPolicyValue(name);
    let devicePolicyCount = 0;
    let nativeMdmPolicyCount = 0;
    let serverManagedSettingsPolicyCount = 0;
    let fileManagedSettingsPolicyCount = 0;
    let mixedManagedSettingsPolicyCount = 0;
    let accountPolicyCount = 0;
    let accountGatePolicyCount = 0;
    for (const name in this.policyService.policyDefinitions) {
      if (value2(name) !== void 0) {
        switch (this.policyService.getPolicyValueSource(name) ?? "device" /* Device */) {
          case "device" /* Device */:
            devicePolicyCount++;
            break;
          case "nativeMdm" /* NativeMdm */:
            nativeMdmPolicyCount++;
            break;
          case "serverManagedSettings" /* ServerManagedSettings */:
            serverManagedSettingsPolicyCount++;
            break;
          case "fileManagedSettings" /* FileManagedSettings */:
            fileManagedSettingsPolicyCount++;
            break;
          case "mixedManagedSettings" /* MixedManagedSettings */:
            mixedManagedSettingsPolicyCount++;
            break;
          case "account" /* Account */:
            accountPolicyCount++;
            break;
          case "accountGate" /* AccountGate */:
            accountGatePolicyCount++;
            break;
        }
      }
    }
    const defaultModel = value2("ChatDefaultModel" /* DefaultModel */);
    const toolsAutoApprove = value2("ChatToolsAutoApprove" /* ToolsAutoApprove */);
    const strictMarketplaces = value2("ChatStrictMarketplaces" /* StrictMarketplaces */);
    const otel = value2("CopilotOtelEnabled" /* OtelEnabled */);
    const telemetryLevel = value2("TelemetryLevel" /* TelemetryLevel */);
    return {
      devicePolicyCount,
      nativeMdmPolicyCount,
      serverManagedSettingsPolicyCount,
      fileManagedSettingsPolicyCount,
      mixedManagedSettingsPolicyCount,
      accountPolicyCount,
      accountGatePolicyCount,
      defaultModelSet: defaultModel !== void 0,
      toolsAutoApproveSet: toolsAutoApprove !== void 0,
      enabledPluginsSet: value2("ChatEnabledPlugins" /* EnabledPlugins */) !== void 0,
      extraMarketplacesSet: value2("ChatExtraMarketplaces" /* ExtraMarketplaces */) !== void 0,
      strictMarketplacesSet: strictMarketplaces !== void 0,
      approvedOrgsSet: value2("ChatApprovedAccountOrganizations" /* ApprovedOrgs */) !== void 0,
      otelSet: otel !== void 0,
      telemetryLevelSet: telemetryLevel !== void 0,
      enableFeedbackSet: value2("EnableFeedback" /* EnableFeedback */) !== void 0,
      defaultModelForcedToAuto: defaultModel === "auto",
      toolsAutoApproveForcedOff: toolsAutoApprove === false,
      strictMarketplacesLockdown: isEmptyMarketplaceAllowlist(strictMarketplaces),
      otelForcedEnabled: otel === true,
      telemetryLevel: telemetryLevelBucket(telemetryLevel)
    };
  }
};

PolicyTelemetryContribution = __decorateClass([
  __decorateParam(0, IPolicyService),
  __decorateParam(1, ITelemetryService)
], PolicyTelemetryContribution);

function isEmptyMarketplaceAllowlist(rawValue) {
  if (typeof rawValue !== "string") {
    return false;
  }
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) && parsed.length === 0;
  } catch {
    return false;
  }
}

var KNOWN_TELEMETRY_LEVELS = /* @__PURE__ */ new Set(["off", "crash", "error", "all"]);

function telemetryLevelBucket(rawValue) {
  if (rawValue === void 0) {
    return void 0;
  }
  return typeof rawValue === "string" && KNOWN_TELEMETRY_LEVELS.has(rawValue) ? rawValue : "unknown";
}

registerWorkbenchContribution2(PolicyTelemetryContribution.ID, PolicyTelemetryContribution, WorkbenchPhase.AfterRestored);
export { isEmptyMarketplaceAllowlist, telemetryLevelBucket, PolicyTelemetryContribution, KNOWN_TELEMETRY_LEVELS };
