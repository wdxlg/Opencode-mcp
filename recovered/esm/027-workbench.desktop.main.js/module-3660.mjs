// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bracketPairColorizer2Telemetry/browser/bracketPairColorizer2Telemetry.contribution.ts
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IExtensionsWorkbenchService } from "./module-1022.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/bracketPairColorizer2Telemetry/browser/bracketPairColorizer2Telemetry.contribution.ts
var BracketPairColorizer2TelemetryContribution = class {
  constructor(configurationService, extensionsWorkbenchService, telemetryService) {
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.telemetryService = telemetryService;
    this.init().catch(onUnexpectedError);
  }
  async init() {
    const bracketPairColorizerId = "coenraads.bracket-pair-colorizer-2";
    await this.extensionsWorkbenchService.queryLocal();
    const extension = this.extensionsWorkbenchService.installed.find((e) => e.identifier.id === bracketPairColorizerId);
    if (!extension || extension.enablementState !== 12 /* EnabledGlobally */ && extension.enablementState !== 13 /* EnabledWorkspace */) {
      return;
    }
    const nativeBracketPairColorizationEnabledKey = "editor.bracketPairColorization.enabled";
    const nativeColorizationEnabled = !!this.configurationService.getValue(nativeBracketPairColorizationEnabledKey);
    this.telemetryService.publicLog2("bracketPairColorizerTwoUsage", {
      nativeColorizationEnabled
    });
  }
};

BracketPairColorizer2TelemetryContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, ITelemetryService)
], BracketPairColorizer2TelemetryContribution);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(BracketPairColorizer2TelemetryContribution, 3 /* Restored */);
export { BracketPairColorizer2TelemetryContribution };
